# Rendered interface previews

These images show the actual CartScope interface populated with labeled sample data. The input HTML was serialized from the application's UI DOM by the test harness. `scripts/render-previews.py` renders that HTML with WeasyPrint, converts intermediate PDFs with Poppler, and assembles the five-screen overview with Pillow.

**Provenance:** print-rendered interface previews, not Chrome screenshots. They illustrate the interface and do not establish that the extension installed or ran successfully in Chrome. The browser smoke-test record is maintained separately.

Print-only adjustments pin the page to a 390-pixel panel, use Arial, give header/control elements widths the print renderer understands, hide closed details, and paint the budget progress bar from its actual serialized value. Runtime source files are unchanged by the preview script. Minor layout differences from Chrome are expected because WeasyPrint uses a print layout engine. Sample prices, stock, order statuses, and dates are illustrative.

- [Five-screen overview](cartscope-overview.png)
- [Review item](review.png)
- [Saved cart](cart.png)
- [Offer comparison and price history](compare.png)
- [Notifications](notifications.png)
- [Orders](orders.png)
- [Payment planner](finance.png)
- [Settings](settings.png)

The [render manifest](render-manifest.json) records the source and renderer for each view. To regenerate, first produce `artifacts/ui-html/*.html` using the UI harness, then run `python scripts/render-previews.py` in an environment with WeasyPrint, Pillow, Pango, system fonts, and `pdftoppm`. These are documentation-authoring tools; they are not extension dependencies or required for users to run CartScope. Set `PDFTOPPM` if Poppler is not on PATH. On systems with multiple native-library installations, `CARTSCOPE_LIBRARY_DIRS` can pin the authoring process to a consistent font-library set.
