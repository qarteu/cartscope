# CartScope · Alpha 0.1.0

CartScope is a Chrome side panel for reviewing product details, saving finds from multiple stores, comparing offers you have observed, and keeping a shopping budget and order notes in one place. The alpha implements the shopping flows in the team's UniCart prototype with CartScope branding.

- Personal repository: [qarteu/cartscope](https://github.com/qarteu/cartscope)
- Alpha download and release notes: [v0.1.0](https://github.com/qarteu/cartscope/releases/tag/v0.1.0)
- Progress and planned stories: [Sprint board](docs/SPRINT_BOARD.md)
- Feedback: [Alpha feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml)

All Alpha flows run locally; no AWS account or service is required. [Open the interactive demo](https://qarteu.github.io/cartscope/) or use the local demo command below. [Submission links](docs/SUBMISSION.md) collect the required deliverables.

![CartScope Chrome interface overview](docs/visuals/cartscope-overview.png)

*Actual Chrome screenshots with labeled sample data. See [visuals and test provenance](docs/visuals/README.md).*

## Open the browser demo

The same interface can run as a static browser preview with labeled sample products and `localStorage` instead of Chrome extension storage:

```sh
npm run demo
```

Open the local URL printed by the server. The browser preview supports the saved cart, comparisons, observed demo history and alerts, orders, installment calculator, and data controls. Active-tab capture and optional Chrome extension notifications require installing the extension; enter items manually in the browser preview. Its data is saved in that browser for the preview's origin and is separate from the installed extension's data.

The project is also prepared for static GitHub Pages hosting. See [browser demo deployment](docs/DEMO.md) for the expected URL and publication steps. There is no server-side application or cloud credential needed for this demo.

## Install the alpha in Chrome

1. Download **cartscope-alpha-0.1.0.zip** from the [v0.1.0 release](https://github.com/qarteu/cartscope/releases/tag/v0.1.0). Download the release asset, not GitHub's source-code ZIP.
2. Unzip it into a permanent folder such as `Documents/CartScope-alpha-0.1.0`. The folder you choose must contain `manifest.json` directly.
3. Open `chrome://extensions` in Chrome and enable **Developer mode**.
4. Select **Load unpacked** and choose that unzipped folder.
5. Pin CartScope from Chrome's Extensions menu. Open a retailer's product page, then click the CartScope icon to open its side panel.

The manifest targets Chrome 116 or newer because it uses Chrome's side-panel API. Keep the unzipped folder in place while the extension is installed. The alpha is installed locally; it is not a Chrome Web Store listing.

For development, load the repository's `extension/` folder instead. After editing code, select **Reload** on the CartScope card at `chrome://extensions`, then reopen the side panel. No build step is needed to use the extension.

## Try the main flows

**Save an item.** On a product page, capture the current page and review its name, price, image, retailer, model, and variant before saving. Extraction uses page metadata and visible text when available. Edit the text and price details if capture is incomplete; image selection uses the captured image or a placeholder. A captured price is an observation at that moment, not a promise from the retailer.

**Plan your cart.** Add finds from different stores, edit quantity and notes, and set a budget. Cart totals cover saved item prices. Retailer checkout remains the source of final shipping, tax, inventory, and charges. Shopping links open the relevant retailer pages; CartScope does not submit orders or process payments.

**Compare offers.** Add observed or manual offers for the same product and variant. Match the model and variant deliberately: different sizes, colors, conditions, or bundles should not be combined. Compare item price, shipping, estimated tax, delivery, returns, and pickup information. Unknown costs remain visible instead of becoming zero; price ranking uses comparable totals where available. Enter a tax rate only when you have an appropriate estimate.

**Watch a saved find.** Enable the price-drop or restock watch for an item. Revisit that product and capture its updated details to create another observation. Changes can appear in CartScope's notifications; optional Chrome notifications require your permission. The alpha does not poll stores in the background or promise real-time alerts.

**Record orders.** Add an order after completing checkout with a retailer. Enter its status, expected delivery, tracking number, tracking link, and notes yourself, and update them as information arrives. Tracking links open the carrier or retailer; there is no live carrier synchronization in this alpha.

**Estimate installment costs.** Use the installment calculator to compare a purchase amount, installment count, and explicitly entered fees and interest amount. Choose the first payment date and day interval; the calculator also shows the stated late fee separately. This is arithmetic based on your inputs, not an APR quote, credit offer, or eligibility decision. Confirm the actual provider's payment dates and terms before using financing.

**Explore or reset.** Optional sample headphones, shoes, and backpack entries demonstrate the flows and are labeled as demo data. A fresh installation starts with an empty real cart. Settings support exporting a JSON backup, importing a backup, and deleting local data.

## What the alpha does and what remains planned

The alpha provides local capture and editing, a saved cart and budget, observed/manual offer comparisons, observed price history, capture-triggered alerts, manual order tracking, installment arithmetic, and local data controls.

It has no configured live retailer catalog, automatic cross-store offer discovery, background price/inventory polling, carrier feed, payment processing, shared accounts, or AWS backend. Sample prices and orders are illustrative. Their presence does not demonstrate live retailer integrations. These integrations require separate implementation, access agreements where applicable, and validation; the [Sprint board](docs/SPRINT_BOARD.md) records that work.

## Privacy and permissions

CartScope stores your cart, offers, observations, watches, orders, and settings in Chrome's local extension storage. This alpha does not send shopping data to a server, use analytics, or contain credentials. Exported backups contain your shopping records and notes, so keep them where you want that information stored.

- **activeTab + scripting:** read the currently selected page only after you request capture. There is no background access to every website.
- **storage:** save the extension's data locally.
- **sidePanel:** display the shopping workspace beside the current page.
- **notifications (optional):** show a desktop notification after an observed watched change, if you enable it.

No broad host permissions are requested. Chrome may block capture on internal pages such as `chrome://extensions`, some protected browser pages, or restricted storefront content. You can still enter an item manually.

## Give feedback

Use the [alpha feedback issue form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml), which accepts task-completion results, time taken, ratings, and open-ended comments. Do not include addresses, payment details, private order numbers, or other sensitive information in public GitHub issues. Reference testers use an assigned ID from R01 through R10 rather than their name. The team can also collect a private response using the [email template](docs/ALPHA_EMAIL.md).

See [the feedback plan](docs/FEEDBACK_PLAN.md) for the task protocol and measurement definitions. [The reference-user roster](docs/REFERENCE_USERS.csv) contains unassigned slots until actual participants have agreed to test. The email file is a draft; it is not evidence that an announcement was sent.

## Develop, validate, and package

Prerequisite for development and tests: Node.js 22 or newer. The extension runtime and packaging scripts use no third-party dependencies. DOM and browser tests use development-only dependencies.

```sh
npm ci
npm run validate
npm test
npm run package
```

For the browser test suite, install development dependencies with `npm ci`, run `npx playwright install chromium`, then run `npm run test:browser`. See the verification record for the actual browser-test coverage.

`npm run validate` checks manifest references, local script loading, permissions, and version consistency. `npm test` runs the project's behavioral tests. `npm run package` validates first, then creates `artifacts/cartscope-alpha-0.1.0.zip` with `manifest.json` at its root and writes `artifacts/cartscope-alpha-0.1.0.zip.sha256`. The package contains extension runtime files only. The packaging script uses deterministic file ordering and ZIP timestamps so identical runtime files produce the same archive.

For a reproducible release, commit the source, run the checks, create Git tag `v0.1.0`, and publish the ZIP plus checksum as assets on that tag's GitHub release. Paste the [0.1.0 release notes](CHANGELOG.md) into the release description. The [release checklist](docs/RELEASE_CHECKLIST.md) keeps publication and real-user validation separate from source implementation.

## Team and source

The project context names Kartik, Jake Clevenger, and Eashan as the team. Kartik Malunjkar owns architecture/releases, Jake Clevenger owns product/backlog, and Eashan owns business/research and Scrum. Reference-user contacts are still pending and remain private. Source is provided under the [MIT license](LICENSE).
