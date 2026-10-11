#!/usr/bin/env python3
"""Copy seven genuine UI screenshots unchanged and assemble a labeled overview.

Requires Pillow for documentation authoring only. The overview places complete
screens next to one another; it does not retouch, remove, or invent UI content.
The source screenshots are copied byte-for-byte and recorded with SHA-256.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shutil

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
VIEWS = ["cart", "review", "compare", "notifications", "orders", "finance", "settings"]
MAIN_VIEWS = ["review", "cart", "compare", "notifications", "orders"]
LABELS = {"cart": "Your cart", "review": "Review item", "compare": "Compare prices",
          "notifications": "Notifications", "orders": "Your orders"}


def font(size: int, bold: bool = False):
    candidates = (["/System/Library/Fonts/Supplemental/Arial Bold.ttf"] if bold else
                  ["/System/Library/Fonts/Supplemental/Arial.ttf"])
    candidates += (["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if bold else
                   ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"])
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size=size)


def create_collage(views: Path, output: Path, *, panel_width: int | None = None,
                   caption: str = "Chrome extension screenshots · Labeled sample data",
                   footnote: str = "Captured from the installed extension. Sample prices, stock, and orders are illustrative."):
    images = []
    widths = []
    for name in MAIN_VIEWS:
        with Image.open(views / f"{name}.png") as image:
            images.append(image.convert("RGB"))
            widths.append(image.width)
    card_width = panel_width or max(widths)
    # Only the composed overview may be uniformly resized. Full-resolution
    # individual screenshots remain untouched in the documentation directory.
    images = [image if image.width == card_width else image.resize(
        (card_width, round(image.height * card_width / image.width)), Image.Resampling.LANCZOS)
        for image in images]
    padding, gap = 44, 24
    maximum = max(image.height for image in images)
    width = padding * 2 + len(MAIN_VIEWS) * card_width + (len(MAIN_VIEWS) - 1) * gap
    height = 205 + maximum + 95
    canvas = Image.new("RGB", (width, height), "#0f1b31")
    draw = ImageDraw.Draw(canvas)
    draw.text((padding, 34), "CartScope", font=font(45, True), fill="#ffffff")
    draw.rounded_rectangle((padding + 245, 42, padding + 368, 74), radius=8, fill="#263f68")
    draw.text((padding + 259, 49), "ALPHA 0.1.0", font=font(17, True), fill="#b9cfff")
    draw.text((padding, 96), "Your shopping, in perspective.", font=font(22), fill="#b7c6df")
    draw.text((padding, 130), caption, font=font(16), fill="#8195b6")
    for index, (name, image) in enumerate(zip(MAIN_VIEWS, images)):
        x, y = padding + index * (card_width + gap), 205
        draw.text((x, 171), LABELS[name], font=font(18, True), fill="#d4e3fa")
        canvas.paste(image, (x, y))
        # Frame is outside the screenshot's pixel rectangle.
        draw.rectangle((x-1, y-1, x+card_width, y+image.height), outline="#344a6a", width=1)
    draw.text((padding, height - 58), "Local-first Chrome extension + static browser demo · No AWS setup required", font=font(18), fill="#c1d1e9")
    draw.text((padding, height - 30), footnote, font=font(14), fill="#8195b6")
    canvas.save(output)


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="Directory containing all seven Chrome PNGs")
    parser.add_argument("--output", type=Path, default=ROOT / "docs/visuals")
    parser.add_argument("--run-url", required=True, help="Hosted run that produced these screenshots")
    parser.add_argument("--commit", default="", help="Source commit captured by the browser run")
    parser.add_argument("--browser-version", default="", help="Actual browser version, if recorded")
    parser.add_argument("--verification-status", choices=["passed", "partial", "unknown"], default="unknown")
    args = parser.parse_args()
    source = args.input.resolve()
    output = args.output.resolve()
    if source == output:
        raise SystemExit("Use separate input and output directories to preserve the source artifact")
    missing = [name for name in VIEWS if not (source / f"{name}.png").is_file()]
    if missing:
        raise SystemExit("Missing screenshot views: " + ", ".join(missing))
    # Validate all inputs before replacing any documentation image.
    for name in VIEWS:
        with Image.open(source / f"{name}.png") as image:
            image.verify()
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for name in VIEWS:
        src, destination = source / f"{name}.png", output / f"{name}.png"
        shutil.copy2(src, destination)
        if digest(src) != digest(destination):
            raise RuntimeError(f"Screenshot copy changed: {name}")
        with Image.open(destination) as image:
            size = list(image.size)
        records.append({"view": name, "file": f"{name}.png", "sha256": digest(destination),
                        "dimensions": size, "browser_screenshot": True,
                        "copied_without_modification": True})
    create_collage(output, output / "cartscope-overview.png")
    manifest = {"source_kind": "Chrome screenshots of installed Manifest V3 extension",
                "ci_run": args.run_url, "commit": args.commit, "browser_version": args.browser_version,
                "verification_status": args.verification_status, "sample_data": True,
                "runtime_css_modified_for_capture": False,
                "screenshots": records,
                "overview": {"file": "cartscope-overview.png", "full_screens_preserved": True,
                             "ui_retouched": False}}
    (output / "render-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Copied {len(records)} unchanged Chrome screenshots and assembled {output / 'cartscope-overview.png'}")


if __name__ == "__main__":
    main()
