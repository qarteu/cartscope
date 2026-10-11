# Actual Chrome screenshots

These images were captured by Playwright in Chrome for Testing **151.0.7922.34** from [verification run 38174277130](https://github.com/qarteu/cartscope/actions/runs/38174277130), which completed successfully for commit `cdbe4690ca0fa33ee993eab07556c7d39e8fe308` on October 11, 2026.

The seven extension views come from the actual Alpha 0.1.0 release ZIP unpacked and loaded into a disposable Chrome profile. The desktop and mobile landing-page images come from the [published browser demo](https://qarteu.github.io/cartscope/). They show labeled sample data; the mobile landing view includes a quantity edit used to check persistence and the resulting budget change.

**Verification scope:** the run's browser report records 16 checks passed, zero failed, and no uncaught JavaScript errors. It covers local extension storage, core shopping flows, hostile-input handling, user-initiated active-tab capture against deterministic local product fixtures, panel widths, and the public demo. These screenshots and tests do not establish compatibility with every live retailer's changing markup or a live offer feed.

Every individual PNG is copied byte-for-byte from the hosted run artifact, with its SHA-256 and dimensions recorded in the [capture manifest](render-manifest.json). The overview places the five complete primary screens together with labels. It does not retouch the UI, remove overlays, or invent content. No runtime CSS changes or print-renderer substitutions were used for these Chrome screenshots.

- [Five-screen overview](cartscope-overview.png)
- [Review item](review.png)
- [Saved cart](cart.png)
- [Offer comparison and price history](compare.png)
- [Notifications](notifications.png)
- [Orders](orders.png)
- [Payment planner](finance.png)
- [Settings](settings.png)
- [Published demo — desktop](landing-desktop.png)
- [Published demo — mobile](landing-mobile.png)

To regenerate documentation images, download the screenshot artifact and `browser-results.json` from a verified hosted run, then use `scripts/collage_screenshots.py` with that screenshot directory, report, run URL, and source commit. The tool validates the images and reconciles report counts before copying them. `--extra landing-desktop landing-mobile` includes the public-demo views. Run `python scripts/collage_screenshots.py --help` for the exact arguments. Pillow is an optional documentation-authoring dependency and is not required to install or run CartScope.

The earlier WeasyPrint fallback remains available through `scripts/render-previews.py`, whose output defaults to `artifacts/print-previews`. Those print previews are separate from the actual Chrome captures in this directory.
