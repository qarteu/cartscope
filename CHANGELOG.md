# Release notes

## 0.1.0 · Preview alpha

This locally installed Chrome extension implements CartScope's first shopping workflow. It follows the review-item, cart, comparison, notifications, and orders screens in the UniCart prototype, with explicit labels for observations and sample data.

### Included

- Review product information captured from the current page and edit it before saving.
- Save finds across retailers with quantity, notes, a budget, and local persistence.
- Compare deliberately matched product/variant offers using entered or observed prices, shipping, estimated tax, delivery, returns, and pickup details.
- Keep a timestamped history of recorded prices and the latest entered or captured availability for each offer.
- Record watched price drops or restocks when you revisit and capture a product; optionally request Chrome desktop notifications.
- Enter and update orders, delivery estimates, carrier information, and tracking links manually.
- Calculate installment schedules using an entered purchase amount, fees, interest amount, first payment date, and interval.
- Export, import, or delete local shopping data.
- Load clearly labeled demo products and orders to explore the interface.
- Run the same interface as a static browser demo with browser-local storage and labeled sample data; no AWS setup required.

### Install and start

Download `cartscope-alpha-0.1.0.zip` from this release, unzip it, open `chrome://extensions`, enable Developer mode, and use **Load unpacked** to select the folder containing `manifest.json`. Pin CartScope, open a retailer product page, and click the extension icon. Review captured details before saving. Full instructions and the task protocol are in the [README](README.md) and [feedback plan](docs/FEEDBACK_PLAN.md).

### Alpha limits

The extension starts with an empty real cart. Demo items are optional illustrations. Retailer checkout determines actual prices and charges. Capture can fail or be incomplete on some pages; manual entry remains available. Product matching, shipping, tax, availability, order status, and installment terms require user review.

There is no configured live comparison service, background price/inventory polling, carrier integration, account synchronization, payment processing, or AWS service. Alerts depend on a new capture. All shopping data stays in local Chrome extension storage unless you export it or submit it as feedback.

### Feedback

Reference testers: complete the tasks in [docs/FEEDBACK_PLAN.md](docs/FEEDBACK_PLAN.md), then open an [alpha feedback issue](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml). Include your reference ID, completed tasks, time taken, ratings, and what you expected to happen. Public issues should not contain personal order or payment data.
