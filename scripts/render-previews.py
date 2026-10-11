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
import re
import shutil
import subprocess

from PIL import Image
from collage_screenshots import create_collage

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
html { width:390px !important; background:#f6f8fc !important; font-family:Arial,sans-serif !important; }
body { width:390px !important; min-width:390px !important; max-width:390px !important; min-height:0 !important;
       margin:0 !important; border:0 !important; border-radius:0 !important; box-shadow:none !important; }
.app-header { height:66px !important; }
.brand { flex:0 0 185px !important; }
.alpha { flex:0 0 55px !important; margin-left:auto !important; white-space:nowrap !important; }
.icon-button { flex:0 0 24px !important; }
main { padding:23px 20px 28px !important; }
.app-header,.app-footer { padding-left:20px !important; padding-right:20px !important; }
.page-heading { display:block !important; position:relative !important; }
.page-heading > button { position:absolute !important; right:0; top:0; width:auto !important; }
details:not([open]) > :not(summary) { display:none !important; }
.item-controls { display:block !important; }
.item-controls label { display:inline-flex !important; margin-right:7px !important; vertical-align:middle; }
.item-controls button { display:inline-block !important; margin-right:7px !important; width:auto !important; vertical-align:middle; }
.offer-actions .text-button { display:inline-block !important; width:auto !important; flex:none !important; white-space:nowrap !important; }
.render-progress { height:6px; width:100%; display:block; border-radius:10px; overflow:hidden; margin-bottom:9px; background:#eaf0fb; }
.render-progress > span { display:block; height:6px; background:#1e4388; border-radius:10px; }
.toast { display:none !important; }
button { appearance:none !important; }
"""


def render(source: Path, pdf: Path, output: Path, poppler: str) -> dict:
    markup = source.read_text()
    def progress(match):
        attributes = match.group(1)
        value = re.search(r'value=["\']([^"\']+)', attributes)
        maximum = re.search(r'max=["\']([^"\']+)', attributes)
        ratio = min(100, max(0, float(value.group(1)) / float(maximum.group(1)) * 100))
        return f'<div class="render-progress"><span style="width:{ratio}%"></span></div>'
    markup = re.sub(r'<progress\b([^>]*)>.*?</progress>', progress, markup, flags=re.DOTALL)
    document = HTML(string=markup, base_url=str(source.parent)).render(stylesheets=[CSS(string=PRINT_CSS)])
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
            "browser_screenshot": False, "print_css_overrides": True,
            "progress_control_rendered_from_dom_value": True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "artifacts/ui-html")
    parser.add_argument("--output", type=Path, default=ROOT / "artifacts/print-previews")
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
    create_collage(args.output, args.output / "cartscope-overview.png", panel_width=390,
                   caption="Rendered interface previews from the application DOM · Labeled sample data",
                   footnote="Print rendering; these previews are not Chrome screenshots or proof of browser installation.")
    (args.output / "render-manifest.json").write_text(json.dumps(records, indent=2) + "\n")
    print(f"Created interface preview collage: {args.output / 'cartscope-overview.png'}")


if __name__ == "__main__":
    main()
