# CartScope — Shopping desk

**Current GitHub prerelease:** [CartScope Launch Candidate 0.1.2](https://github.com/qarteu/cartscope/releases/tag/v0.1.2), displaying **PREVIEW 0.1.2**. The hosted runtime ZIP and checksum were downloaded and verified against the exact archive that passed all 18 current Chrome checks.

We built CartScope for the moment when a shopping trip turns into a dozen open tabs. It keeps products from different stores in one Chrome side panel, lets you compare the costs of offers you've checked, and keeps your budget and order notes beside them.

The release is published on Kartik's personal GitHub account, **qarteu**. It works with product details you capture or enter yourself. Automatic retailer search, continuous price checks, and live shipment updates are still planned. Chrome Web Store submission and publication are pending; no Store URL is verified. Ten consenting reference users, invitation delivery, and their feedback are also pending; outreach materials are drafts.

- [Source — qarteu/cartscope](https://github.com/qarteu/cartscope)
- [Download Preview 0.1.2 ZIP](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-launch-0.1.2.zip) · [SHA-256](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-launch-0.1.2.zip.sha256) · [Release notes](https://github.com/qarteu/cartscope/releases/tag/v0.1.2)
- [Open the browser demo](https://qarteu.github.io/cartscope/)
- [Current six-item Canvas submission](docs/launch/CANVAS_SUBMISSION.md) · [Launch packet](docs/launch/README.md) · [Executed tests/results](docs/launch/TEST_RESULTS.md)
- [Store upload kit](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-webstore-kit-0.1.2.zip) · [Store setup guide](docs/launch/WEBSTORE_SETUP.md) · [Current Chrome screenshots](docs/launch/assets/screenshots/README.md)
- [Sprint board](docs/SPRINT_BOARD.md) · [GitHub issues](https://github.com/qarteu/cartscope/issues)
- [Privacy policy](https://qarteu.github.io/cartscope/privacy.html) · [Support](https://qarteu.github.io/cartscope/support.html)
- [Give feedback](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml)

All 45 tracker records are published online. The final launch packet is published and download-verified under REL-15; Store approval and reference-user outcomes have their own open gates.

## Install in Chrome

1. Download **cartscope-launch-0.1.2.zip** from the [0.1.2 release page](https://github.com/qarteu/cartscope/releases/tag/v0.1.2). Choose the runtime release asset rather than GitHub's source-code ZIP or the documentation/Store kit.
2. Unzip it into a folder you'll keep. The folder must contain `manifest.json` directly.
3. Open `chrome://extensions`, enable **Developer mode**, and select **Load unpacked**.
4. Choose that unzipped folder. Pin CartScope from Chrome's Extensions menu.
5. Confirm **PREVIEW 0.1.2**. Open a retailer product page and click the CartScope toolbar icon. In the side panel, choose **Capture this page** and review the result before saving.

Use Chrome 116 or newer. Keep the unzipped folder in place while the extension is installed. To remove it, select **Remove** on its card at `chrome://extensions`.

Developer mode at `chrome://extensions` lets you load this ZIP locally. A Chrome Web Store publisher account is a separate registration step; [the Store setup guide](docs/launch/WEBSTORE_SETUP.md) explains what is still required.

For development, load the repository's `extension/` folder. After changing code, select **Reload** on the extension card and reopen the panel. The extension does not need a build step or an AWS account.

## What you can do

**Save a product.** Capture its page, then check the name, price, retailer, model, variant, and condition. Correct any missing or inaccurate details. The image comes from the page or a placeholder; manual entry is available when capture fails.

**Plan a purchase.** Keep finds from several stores in one cart. Change quantities, add notes, save items for later, and set an item-price budget. Shipping and tax are shown separately in Compare. Shopping links take you back to the retailer to check final costs and complete checkout.

**Compare offers you've checked.** Add another store's offer for the same model, size, color, and condition. Compare price, shipping, estimated tax, membership costs, verified discounts, and eligible cashback. You can rank by total cost, delivery, pickup, or returns when those details are available. Missing required costs stay unknown. Checkout determines the actual amount charged.

**Watch a price or restock.** Set a watch, then revisit and capture the same offer or update it manually. CartScope checks the new observation against the previous one and records a qualifying change. Optional desktop notifications need Chrome permission. It does not check stores while you're away.

**Keep order notes.** After buying from a retailer, enter the order's status, dates, tracking number, tracking link, and notes. Update them as information arrives. These are your records; they aren't connected to a carrier feed.

**Check installment arithmetic.** Enter the purchase amount, payment count, interest amount, fees, first date, and interval. The calculator shows the full obligation and payment schedule, with a stated late fee separately. Confirm the provider's actual terms and due dates; the calculator does not quote APR or offer credit.

**Back up your data.** Settings lets you export a JSON backup, import one, or delete the workspace. Historical alerts aren't replayed after import. The sample workspace stays separate from your real cart.

## Try it without installing

The [browser demo](https://qarteu.github.io/cartscope/) uses the same interface with labeled example products, prices, stock, and orders. You can edit them, add manual entries, compare offers, and try the calculator. Changes stay in that browser's local storage and are separate from the installed extension.

Page capture and Chrome desktop notifications require the extension. A fresh extension installation starts with an empty real cart; samples are optional.

To run the demo locally:

```sh
npm run demo
```

Open the URL printed by the server. [Demo setup](docs/DEMO.md) covers static hosting.

## What still needs work

The [current verification record](docs/launch/TEST_RESULTS.md) documents checks of the exact 0.1.2 ZIP and browser demo: 70 passing Node reporter tests, including 13 DOM flows, and 18 passing Chrome checks. Those checks use product-page fixtures. Current retailer markup, manual installation on testers' operating systems, and native desktop notification delivery still need field testing.

Automatic cross-store discovery, unattended price checks, carrier updates, provider-backed financing, and account synchronization are on the [sprint board](docs/SPRINT_BOARD.md). They are not included as live integrations in this preview.

Recruiting ten reference users, sending their invitations, and collecting their responses are also pending. We will update the tracker when those actions happen.

## Privacy and permissions

Shopping records stay in Chrome's local extension storage, or browser local storage in the demo. There is no shopping-data server, analytics service, account, or payment storage. Loading product images and opening retailer links makes normal requests to those sites. Backups include your products, notes, and order records, so store them somewhere appropriate.

- **activeTab + scripting:** capture the selected page after you click the toolbar icon and request capture.
- **storage:** retain your records on this device.
- **sidePanel:** open the shopping panel beside the page.
- **notifications, optional:** display an alert after an observed watched change.

CartScope requests no blanket host permission. Capture cannot read Chrome's internal pages and may fail on protected or restricted pages. Manual entry remains available.

## Reference-user feedback

Use the [Alpha feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml) to report task completion, time taken, 1–5 ratings, and written comments. Tell us which step confused you, what information was missing, and what you would change first. Failed or blocked tasks help us identify bugs.

The [test protocol](docs/FEEDBACK_PLAN.md) defines the tasks and rating scales. Reference users use an assigned ID from R01 through R10. Keep names, addresses, payment details, and personal order numbers out of public issues. Testers without GitHub accounts can reply privately to the team using the same questions.

[The current invitation template](docs/launch/REFERENCE_USER_EMAIL.md) is ready to personalize after confirming recipients and delivery. [The roster](docs/REFERENCE_USERS.csv) contains unassigned slots, not completed invitations or test results.

## Develop and package

Use Node.js 22 or newer for development and tests. The extension runtime has no third-party dependencies; DOM and browser tests use development dependencies.

```sh
npm ci
npm run validate
npm test
npm run package
```

For Chrome tests:

```sh
npx playwright install chromium
npm run test:browser
```

Validation checks the manifest, referenced files, permissions, and version consistency. Packaging currently creates `artifacts/cartscope-launch-0.1.2.zip` and its SHA-256 file, with `manifest.json` at the archive root. File order and ZIP timestamps are fixed so unchanged runtime files produce the same archive. [Current verification](docs/launch/TEST_RESULTS.md) records the actual test coverage and hosted-download hash.

The existing `v0.1.2` tag and runtime assets are immutable. Documentation-only changes can be committed and pushed without moving that tag. Runtime changes require a new version, updated release metadata, the relevant checks and Chrome verification, and a separate tag/release. Verify the existing 0.1.2 download when preparing its Store submission; do not retag it or replace its runtime ZIP.

## Historical Alpha material

The [0.1.0](https://github.com/qarteu/cartscope/releases/tag/v0.1.0) and [0.1.1](https://github.com/qarteu/cartscope/releases/tag/v0.1.1) releases remain available. The [original Canvas write-up](https://github.com/qarteu/cartscope/blob/v0.1.1/docs/CANVAS_SUBMISSION.md), [illustrated PDF](docs/FINAL_SUBMISSION.pdf), [attachment index](docs/SUBMISSION.md), and [verification record](docs/VERIFICATION.md) document the earlier Alpha; they are not the current 0.1.2 launch submission.

![Historical CartScope 0.1.1 Chrome interface overview](docs/visuals/cartscope-overview.png)

*Historical 0.1.1 Chrome screenshots using labeled sample data. [Sources](docs/visuals/README.md). For current 0.1.2 images, use the [verified Store screenshot set](docs/launch/assets/screenshots/README.md).*

## Team

Kartik Malunjkar is our System Architect and Release Train Engineer. Jake Clevenger is Product Manager and Product Owner. Eashan is Business Owner and Scrum Coach. Participant contacts and delivery evidence stay in the team's private records.

Source is available under the [MIT license](LICENSE).
