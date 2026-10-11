#!/usr/bin/env python3
"""Render serialized CartScope UI DOM for documentation, without a browser.

Inputs are produced by the actual application DOM harness in artifacts/ui-html.
WeasyPrint/Pillow and a working Pango font stack are optional authoring tools;
they are not extension dependencies. Set PDFTOPPM to your Poppler executable
when it is not on PATH. Output is print-rendered interface previews, not Chrome
screenshots or evidence of an installed-extension browser test.
"""
from __future__ import annotations

import argparse
import json
import logging
import os
from pathlib import Path
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont

# Optional authoring-only library pinning avoids mixing two macOS GLib/Pango
# installations. Ordinary systems with WeasyPrint configured need no override.
if os.environ.get("CARTSCOPE_LIBRARY_DIRS"):
    import cffi
    library_dirs = [Path(value) for value in os.environ["CARTSCOPE_LIBRARY_DIRS"].split(os.pathsep)]
    library_names = [("harfbuzz-subset", "libharfbuzz-subset.0.dylib"),
                     ("pangoft2", "libpangoft2-1.0.0.dylib"),
                     ("gobject", "libgobject-2.0.0.dylib"),
                     ("pango", "libpango-1.0.0.dylib"),
                     ("harfbuzz", "libharfbuzz.0.dylib"),
                     ("fontconfig", "libfontconfig.1.dylib")]
    original_dlopen = cffi.FFI.dlopen
    def pinned_dlopen(self, name, *args, **kwargs):
        for token, filename in library_names:
            if isinstance(name, str) and token in name:
                for directory in library_dirs:
                    candidate = directory / filename
                    if candidate.exists():
                        return original_dlopen(self, str(candidate), *args, **kwargs)
        return original_dlopen(self, name, *args, **kwargs)
    cffi.FFI.dlopen = pinned_dlopen

from weasyprint import CSS, HTML

ROOT = Path(__file__).resolve().parents[1]
VIEWS = ["cart", "review", "compare", "notifications", "orders", "finance", "settings"]
LABELS = {"cart": "Your cart", "review": "Review item", "compare": "Compare prices",
          "notifications": "Notifications", "orders": "Your orders"}
PRINT_CSS = """
@page { size: 390px 2400px; margin: 0; }
html { width:390px; background:#f6f8fc; }
body { width:390px; min-width:390px; max-width:390px; min-height:0;
       margin:0 !important; border:0; border-radius:0; box-shadow:none; }
.app-header { height:66px; }
main { padding:23px 20px 28px; }
.app-header,.app-footer { padding-left:20px; padding-right:20px; }
details:not([open]) > :not(summary) { display:none; }
.toast { display:none !important; }
button { appearance:none; }
"""


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = (["/System/Library/Fonts/Supplemental/Arial Bold.ttf"] if bold else
                  ["/System/Library/Fonts/Supplemental/Arial.ttf"])
    candidates += (["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if bold else
                   ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"])
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size=size)


def render(source: Path, pdf: Path, output: Path, poppler: str) -> dict:
    document = HTML(filename=str(source)).render(stylesheets=[CSS(string=PRINT_CSS)])
    if len(document.pages) != 1:
        raise RuntimeError(f"{source.name}: content overflows its preview page")
    # Crop the PNG to the laid-out footer, rather than keeping unused page space.
    bottoms = []
    def inspect(box):
        if getattr(box, "element_tag", None) == "footer":
            bottoms.append(box.position_y + box.height + box.padding_top + box.padding_bottom)
        for child in getattr(box, "children", []):
            inspect(child)
    inspect(document.pages[0]._page_box)
    document.write_pdf(str(pdf))
    subprocess.run([poppler, "-png", "-r", "192", "-singlefile", str(pdf), str(output.with_suffix(""))],
                   check=True, capture_output=True)
    with Image.open(output) as original:
        height = min(original.height, round((max(bottoms) if bottoms else 2400) * 2 + 2))
        original.crop((0, 0, original.width, height)).save(output)
    return {"source": str(source.relative_to(ROOT)), "output": str(output.relative_to(ROOT)),
            "renderer": "WeasyPrint", "source_kind": "serialized actual application DOM",
            "browser_screenshot": False, "print_css_overrides": True}


def collage(output: Path, views: Path):
    order = ["review", "cart", "compare", "notifications", "orders"]
    card_width, padding, gap = 390, 44, 24
    images = []
    for name in order:
        image = Image.open(views / f"{name}.png").convert("RGB")
        image = image.resize((card_width, round(image.height * card_width / image.width)), Image.Resampling.LANCZOS)
        images.append(image)
    maximum = max(image.height for image in images)
    width = padding * 2 + len(order) * card_width + (len(order) - 1) * gap
    height = 190 + maximum + 110
    canvas = Image.new("RGB", (width, height), "#0f1b31")
    draw = ImageDraw.Draw(canvas)
    draw.text((padding, 34), "CartScope", font=font(45, True), fill="#ffffff")
    draw.rounded_rectangle((padding + 245, 42, padding + 368, 74), radius=8, fill="#263f68")
    draw.text((padding + 259, 49), "ALPHA 0.1.0", font=font(17, True), fill="#b9cfff")
    draw.text((padding, 96), "Your shopping, in perspective.", font=font(22), fill="#b7c6df")
    draw.text((padding, 130), "Rendered interface previews from the application DOM · Labeled sample data", font=font(16), fill="#8195b6")
    for index, (name, image) in enumerate(zip(order, images)):
        x = padding + index * (card_width + gap)
        draw.text((x, 171), LABELS[name], font=font(18, True), fill="#d4e3fa")
        y = 205
        canvas.paste(image, (x, y))
        draw.rounded_rectangle((x-1, y-1, x+card_width, y+image.height), radius=2, outline="#344a6a", width=1)
    draw.text((padding, height - 58), "Local-first Chrome extension + static browser demo · No AWS setup required", font=font(18), fill="#c1d1e9")
    draw.text((padding, height - 30), "Print rendering; these previews are not Chrome screenshots or proof of browser installation.", font=font(14), fill="#8195b6")
    canvas.save(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "artifacts/ui-html")
    parser.add_argument("--output", type=Path, default=ROOT / "docs/visuals")
    args = parser.parse_args()
    poppler = os.environ.get("PDFTOPPM") or shutil.which("pdftoppm")
    if not poppler:
        raise SystemExit("pdftoppm required; set PDFTOPPM to a Poppler executable")
    args.output.mkdir(parents=True, exist_ok=True)
    intermediate = ROOT / "artifacts/rendered-previews"
    intermediate.mkdir(parents=True, exist_ok=True)
    logging.getLogger("weasyprint").setLevel(logging.ERROR)
    records = []
    for name in VIEWS:
        record = render(args.input / f"{name}.html", intermediate / f"{name}.pdf", args.output / f"{name}.png", poppler)
        records.append(record)
        print(f"Rendered {name}")
    collage(args.output / "cartscope-overview.png", args.output)
    (args.output / "render-manifest.json").write_text(json.dumps(records, indent=2) + "\n")
    print(f"Created interface preview collage: {args.output / 'cartscope-overview.png'}")


if __name__ == "__main__":
    main()
