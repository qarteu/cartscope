# Release notes

## 0.1.2 · Launch candidate

Prepared for the launch assignment on November 14, 2026. This is a locally installable, tested launch candidate. Chrome Web Store publication and approval are not yet verified; GitHub publication is a separate distribution channel.

### Changes

- Updated the extension identity to CartScope — Shopping desk, with visible preview/version labels.
- Require HTTPS for automatic remote product images, including saved and imported records; deliberately opened retailer links remain user-controlled.
- Prepared Chrome Web Store listing copy, permission explanations, privacy policy, reviewer instructions and promotional assets.
- Added current test-case/results evidence, launch announcement drafts with quantitative and qualitative feedback routes, and the Sprint 2.E Fielding & Support board.
- Retained the Alpha releases and their assets unchanged. Screenshot recognition, price guidance, occasion folders, unattended checks and live integrations remain planned rather than advertised as released.

### Install and use

Download `cartscope-launch-0.1.2.zip` and extract it. In Chrome 116 or newer, open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the folder containing `manifest.json`. Pin CartScope. Open an individual retailer product page and click its toolbar icon, then **Capture this page**. Check the product, variant, currency, condition and price before saving. Use **Add manually** when a page does not provide supported metadata.

Save products from several stores, change quantities and an item budget, then open **Compare**. Add a checked offer for the same item and variant. Review item price, shipping, estimated tax, discounts, membership and cashback; unknown costs remain incomplete. Pick total cost, delivery, pickup or returns as the ranking priority. Checkout takes place on the retailer's website.

Use the sample workspace to explore comparison, observed watches, manual orders, the payment planner and backups. Sample data is labeled and separate from the real workspace. The [browser demo](https://qarteu.github.io/cartscope/) cannot capture another shopping tab; that requires the installed extension.

### Verification and limitations

The [launch test cases and results](https://github.com/qarteu/cartscope/blob/main/docs/launch/TEST_RESULTS.md) describe exactly what was exercised. Live retailer markup, operating-system installation, native notification delivery and real reference-user feedback require field validation. Automatic cross-store discovery, background polling, carrier updates, account synchronization and provider-backed financing are not part of this release. Financing uses user-entered interest and fees, not an offered loan or invented APR.

### Feedback and support

Use the [feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml) to record task results/time, numeric ratings, confusing steps and requested improvements. Report defects through [GitHub Issues](https://github.com/qarteu/cartscope/issues). [Privacy](https://qarteu.github.io/cartscope/privacy.html) and [support](https://qarteu.github.io/cartscope/support.html) pages explain data handling and help routes. Marketing materials are drafts until sent or published; no ten-user delivery, feedback results, Store ratings or Store approval is claimed.

## 0.1.1 · Alpha design refinement

CartScope now uses an original shopping-desk layout: warm paper, forest-green controls, a custom focus-and-cart mark, and compact product records. This patch keeps the working local Alpha flows while replacing generic headings and introducing a more useful demo workspace.

### Changes

- Redesigned the side panel and responsive browser demo with clearer navigation, readable cost breakdowns, and a visible item budget.
- Updated empty states, labels, and instructions to describe what each action does.
- Kept capture-and-review, a persistent universal cart, strict product matching, true-cost ranking, pickup/delivery/returns preferences, observation-based alerts, manual orders, financing schedules, and JSON backups.
- Added version-derived packaging and release commands. Existing release tags and ZIP assets cannot be overwritten by the publisher.
- Added a Canvas submission summary and a report that connects features to automated checks and genuine Chrome screenshots.

### Install and use

1. Download `cartscope-alpha-0.1.1.zip` from this release and extract it.
2. Open `chrome://extensions` in Chrome 116 or newer, enable **Developer mode**, select **Load unpacked**, and choose the extracted folder containing `manifest.json`.
3. Pin CartScope. Open a retailer product page and click its toolbar icon to grant temporary access to that page. In the side panel, choose **Capture this page**, review the product and variant, and save it. You can also add an item manually.
4. Open **Compare**, capture another store’s matching product or add a checked offer, then review shipping, tax, discounts, membership costs, cashback, and the payable-now total. Choose lowest cost, delivery, pickup, or returns as your priority.
5. Use **Explore sample workspace** for a repeatable demonstration. Its prices, stock, and orders are illustrative and are separate from your real workspace. Use **Settings** to export a backup or reset sample data.

For a quick look without installing, open the [browser demo](https://qarteu.github.io/cartscope/). The demo uses local browser storage; capturing a product page requires the installed extension. See the [README](https://github.com/qarteu/cartscope/blob/v0.1.1/README.md) for the complete walkthrough and [test methods](https://github.com/qarteu/cartscope/blob/v0.1.1/docs/VERIFICATION.md) for verification details.

### Alpha limits

Offers are captured from supported product-page markup or entered by the shopper. There is no live retailer catalog, automatic background polling, carrier feed, provider financing account, cloud synchronization, or automatic checkout. Tax is an estimate; unknown shipping and membership costs leave a total incomplete. Watches evaluate on a new capture or offer update. Order status is entered manually. Sample data is always labeled.

### Feedback

Follow the [reference-user task protocol](https://github.com/qarteu/cartscope/blob/v0.1.1/docs/FEEDBACK_PLAN.md), recording task completion, time, and 1–5 ratings, then add written observations to the [Alpha feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml). Use a reference ID and avoid posting private order or payment details. The invitation is prepared as an [email template](https://github.com/qarteu/cartscope/blob/v0.1.1/docs/ALPHA_EMAIL.md); the ten-user send is pending contact details. Progress and next-sprint stories are on the [sprint board](https://github.com/qarteu/cartscope/blob/main/docs/SPRINT_BOARD.md).

## 0.1.0 · Preview alpha

This locally installed Chrome extension implements CartScope's first shopping workflow. It follows the review-item, cart, comparison, notifications, and orders screens in the UniCart prototype, with explicit labels for observations and sample data.

### Included

- Review product information captured from the current page and edit it before saving.
- Save finds across retailers with quantity, notes, a budget, and local persistence.
- Compare deliberately matched product/variant offers using entered or observed prices, shipping, estimated tax, delivery, returns, and pickup details.
- Keep a timestamped history of recorded prices and the latest entered or captured availability for each offer.
- Record watched price drops or restocks when you revisit and capture a product; optionally request Chrome desktop notifications.
- Enter and update orders, delivery estimates, tracking numbers, tracking links, and notes manually.
- Calculate installment schedules using an entered purchase amount, fees, interest amount, first payment date, and interval.
- Export, import, or delete local shopping data.
- Load clearly labeled demo products and orders to explore the interface.
- Run the same interface as a static browser demo with browser-local storage and labeled sample data; no AWS setup required.

### Install and start

Download `cartscope-alpha-0.1.0.zip` from this release, unzip it, open `chrome://extensions`, enable Developer mode, and use **Load unpacked** to select the folder containing `manifest.json`. Pin CartScope, open a retailer product page, and click the extension icon. Review captured details before saving. Full instructions and the task protocol are in the [README](https://github.com/qarteu/cartscope/blob/v0.1.0/README.md) and [feedback plan](https://github.com/qarteu/cartscope/blob/v0.1.0/docs/FEEDBACK_PLAN.md).

### Alpha limits

The extension starts with an empty real cart. Demo items are optional illustrations. Retailer checkout determines actual prices and charges. Capture can fail or be incomplete on some pages; manual entry remains available. Product matching, shipping, tax, availability, order status, and installment terms require user review.

There is no configured live comparison service, background price/inventory polling, carrier integration, account synchronization, payment processing, or AWS service. Alerts depend on a new capture. All shopping data stays in local Chrome extension storage unless you export it or submit it as feedback.

### Feedback

Reference testers: complete the tasks in the [feedback plan](https://github.com/qarteu/cartscope/blob/v0.1.0/docs/FEEDBACK_PLAN.md), then open an [alpha feedback issue](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml). Include your reference ID, completed tasks, time taken, ratings, and what you expected to happen. Public issues should not contain personal order or payment data.
