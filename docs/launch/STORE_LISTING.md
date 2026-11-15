# Chrome Web Store listing draft

**Status:** CartScope Launch Candidate 0.1.2, prepared for submission; publication is unverified. **Store URL: pending.** Replace unresolved fields in [launch metadata](launch-metadata.json) after the release owner confirms them.

## Listing fields

| Field | Draft value |
| --- | --- |
| Name | `CartScope — Shopping desk` — must match the final manifest |
| Short description | `Save products across stores, compare checked offers, and keep a local shopping budget in one Chrome side panel.` |
| Primary category | Shopping, if offered by the current dashboard |
| Language | English |
| Homepage | https://qarteu.github.io/cartscope/ |
| Support | https://qarteu.github.io/cartscope/support.html |
| Source and instructions | https://github.com/qarteu/cartscope |
| Release notes and ZIP | https://github.com/qarteu/cartscope/releases |
| Privacy policy | https://qarteu.github.io/cartscope/privacy.html — verify public deployment before submission |
| Pricing | No payment or subscription is implemented in this release |

## Detailed description — ready to paste

CartScope keeps your saved products, checked offers, and shopping notes in one Chrome side panel. Use it to work out what to buy across different stores while keeping the details on your own device.

SAVE AND REVIEW

Open a product page, click the CartScope toolbar icon, and choose Capture this page. Review the detected name, price, retailer, and variant before saving. You can also enter an item manually. Keep quantities, notes, and items saved for later together with an item budget.

COMPARE THE SAME ITEM

Add offers you have checked for the same model and variant. Compare item price, shipping, estimated tax, fees, discounts, delivery, returns, and pickup details. Unknown shipping stays unknown. Sort your recorded offers by total cost, delivery time, return window, or pickup availability. CartScope does not search every retailer or guarantee the lowest market price.

KEEP A RECORD

See price observations recorded when you save, capture, or update offers. Opt into a price-drop or restock watch. Alerts are triggered by a later observation you make; CartScope does not monitor stores while you are away. Optional desktop notifications require your permission.

AFTER CHECKOUT

Enter an order, delivery date, status, and tracking link yourself. Use the payment planner to total a purchase amount, stated total interest, and fees across a fixed payment schedule. It does not offer credit, calculate an APR, or connect to a lender. Checkout and live shipment information remain with the retailer or carrier.

LOCAL DATA, PRACTICAL CONTROLS

There is no CartScope account, analytics service, or shopping-data backend. Your saved records live in Chrome storage on this device. Export a JSON backup, import a backup, or clear a workspace in Settings. External HTTPS product images can contact their image host; retailer, carrier, support, and feedback links open the websites you choose. See the privacy policy for details.

TRY THE SAMPLE WORKSPACE

The bundled sample workspace shows the main flows with clearly labeled illustrative prices, stock, and orders. It is separate from your real saved items. The browser demo also supports manual entries and samples; installing the extension is required to capture a shopping tab and use desktop notifications.

RELEASE LIMITS

This is an early release. Product-page capture depends on the metadata a retailer publishes and may need corrections or manual entry. Item budgets use USD; comparison does not perform currency conversion. Tax is an estimate, cashback may depend on eligibility, and final stock and checkout charges must be confirmed with the retailer. Order statuses are manual. Recorded price history is not a complete market history.

HOW TO START

1. Open CartScope from Chrome's toolbar.
2. Explore the sample workspace, or open a product page and choose Capture this page.
3. Check the product and variant, save it, and add another checked offer to compare.
4. Open Settings for preferences, backup controls, and feedback.

Source, releases, and installation instructions: https://github.com/qarteu/cartscope

## Graphic assets

Use `extension/assets/icon128.png` from the final submitted build for the Store icon. The original [small tile and marquee artwork](assets/README.md) are promotional graphics, not screenshots.

Upload at least one clear screenshot at 1280 × 800; the dashboard allows up to five. Suggested subjects are saved cart, checked comparison, watches, manual orders, and Settings/data controls. Capture the submitted version in Chrome and keep the sample labels visible. The existing tall PNGs in `docs/visuals` are evidence images, not already sized Store uploads. Optional tiles are 440 × 280 and 1400 × 560. [Google's listing asset guidance](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).

Do not add a Store badge, review count, star rating, user count, or approval claim before it is true. Do not describe this release as an automatic coupon finder, universal price engine, background price monitor, live shipment tracker, or financing provider.
