# Store permissions and privacy declarations

Prepared against the actual 0.1.2 Manifest V3 runtime. Reconcile these fields with the final submission ZIP. This is a draft dashboard mapping, not a claim of Store approval.

## Single purpose — ready to paste

CartScope helps a shopper maintain and compare a local shopping list across stores. It captures a product only when the shopper requests it, lets the shopper review and save product details, and organizes checked offers, quantities, costs, notes, observed changes, and manual order records in a Chrome side panel. Its budget and payment schedule tools help evaluate those saved purchases. It does not run a retailer search service, place orders, or monitor browsing in the background.

## Permission explanations — ready to paste

| Manifest entry | Justification |
| --- | --- |
| `activeTab` | After the user clicks the CartScope toolbar icon on a product page, CartScope uses temporary access to that selected tab for the user-requested Capture this page feature. It does not request permanent access to all sites or read unrelated tabs. |
| `scripting` | Runs the bundled `extract.js` in the selected, temporarily authorized product tab after the user chooses Capture this page. It reads product metadata and displayed product fields for a review draft; it does not change the retailer page, submit forms, or fetch additional pages. |
| `storage` | Saves the user's products, checked offers, quantities, notes, price observations, watches, alerts, manual orders, and preferences locally in `chrome.storage.local`. It also keeps the clearly labeled sample workspace separate. The user can export, import, and clear a workspace. No Chrome sync or CartScope server is used. |
| `sidePanel` | Presents the shopping list, comparison, manual order book, settings, and related purchase tools in Chrome's side panel while the shopper visits retailer pages. |
| Optional `notifications` | Requested only when the user enables desktop alerts in Settings. Displays a price-drop or restock alert when a later user-triggered capture or offer update records a watched change. It is not used for advertising, promotions, or background retailer polling. In-app alerts work without this permission. |

**Host permissions:** none in the inspected manifest. **Persistent content scripts:** none. **Remote code:** select “No, I am not using remote code.” All executable JavaScript is bundled; externally hosted product images are image resources, not executable extension code. There is no `tabs`, `history`, `cookies`, `geolocation`, `downloads`, `webRequest`, or `unlimitedStorage` permission in the inspected manifest.

The Store asks for a narrow purpose, necessary permissions, a remote-code answer, and data-use disclosures. The final publisher should copy these explanations into the fields corresponding to the uploaded manifest. [Chrome privacy field documentation](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

## Data handling inventory

“No CartScope backend” does not mean “no user data is handled.” Local capture and local storage still need disclosure. [Google's User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

| Data | Acquisition and use | Storage / external exposure |
| --- | --- | --- |
| Product content | User-requested page capture reads product name, price/currency, retailer, model/identifier, variant, image URL, availability, and the product/canonical URL; user can correct or enter fields | Draft is held in the panel; saving stores the selected record locally. It is not uploaded to CartScope. |
| Selected product URLs | Saved so the user can return to a product and associate checked offers | Local record; not a complete browsing history. Opening a link contacts that site. |
| Purchase and cost information | Quantities, budget, prices, shipping, tax estimate, fees, discounts, cashback, delivery/return details, and manual orders | Saved shopping/offer/order fields are local. Payment-planner inputs/results are used in the open panel and are not persisted by the inspected planner code. No card, bank, or lender account integration. |
| Order identifiers and notes | User enters order status, dates, tracking number/link, and free text | Local; tracker link is opened only by the user. Notes can contain personal information, so users should avoid sensitive details. |
| Pickup location | Optional store/pickup location text entered by the user | Local; no GPS, IP-location lookup, or browser location permission. |
| Observations and alerts | Records the price, retailer, time, and source for saved/updated offers; derives opted-in watched changes | Local history/alerts. Optional desktop notifications reveal an alert title/message through Chrome and the operating system. |
| Remote image request | Displaying a saved HTTPS image contacts its host; insecure HTTP image URLs are rejected | Host receives the image URL and ordinary request information such as IP address. `no-referrer` suppresses the referrer; it does not make the request anonymous. Browser cookie/network behavior is controlled by Chrome and the host. |
| Backups and feedback | User downloads/imports JSON, submits a GitHub issue, or replies to an invitation | Exported files contain the workspace and are controlled by the user. GitHub issues/reviews are public and subject to that service's policy. Email is received only if the user chooses to send it. |

## Proposed dashboard data categories

Use the current dashboard's exact category names and definitions. This conservative mapping describes data the runtime handles, including local data; it must not be replaced with a blanket “no data collected” certification merely because there is no server.

| Category | Proposed declaration and reason |
| --- | --- |
| Website content | Yes: product page metadata, product text, image URLs, and user-created shopping notes. |
| Web history | Yes, limited to product URLs the user deliberately captures or saves. No background browsing log or Chrome History API access. |
| Financial and payment information | Yes: purchase amounts, prices, budgets, manual purchase/order records, and payment-plan amounts. No card or bank credentials are requested. |
| Personally identifiable information | Disclose user-entered tracking identifiers and free-form order notes that may identify a shipment/person. No account, name, address, or email field is required by the extension. |
| Location | Disclose optional manually entered pickup/store location text; no automatic location collection. |
| User activity | Disclose the necessary saved shopping activity (saved products, recorded observation times, manual order status). No clickstream, session recording, keystroke logging, or analytics. |
| Authentication information | No: no login, password, authentication-cookie access, or account connection. |
| Personal communications | No mailbox/chat access. A voluntary email response is handled by the team's email service, not read by the extension. |
| Health information | No dedicated health collection or use. The free-text feature is not designed for sensitive health records. |

For each category selected, explain the local feature and the absence of a CartScope upload. Do not imply that names, precise location, full history, or financial credentials are automatically gathered. If dashboard definitions distinguish optional arbitrary user content from a dedicated category, use that definition and preserve the full inventory in the policy.

## Limited-use answers

The inspected runtime supports these declarations: shopping data is not sold; it is not transferred to a CartScope server or used for advertising; it is not used for purposes unrelated to the shopping features; it is not used for creditworthiness or lending decisions. Optional notification permission is not used for marketing. The project contains no analytics or affiliate tracking implementation.

External image hosting and deliberate retailer/carrier/GitHub navigation must remain disclosed. Do not certify “all data stays entirely offline,” “zero network requests,” “end-to-end encrypted,” or “encrypted by CartScope at rest.” Chrome local storage and JSON backups do not provide application-level encryption in this release.

## Runtime evidence

- `extension/manifest.json`: declared permissions and bundled service worker.
- `extension/extract.js`: user-triggered product metadata extraction; no page mutation or network API.
- `extension/background.js`: local `workspace`/`sampleWorkspace`, bounded price history and alerts, optional notifications, validated import, cascading product deletion, workspace reset.
- `extension/app.js`: external image display with `referrerpolicy="no-referrer"`, deliberate external links, JSON download/import, planner inputs, Settings controls.
- `extension/lib/core.js`: separate safe HTTP(S) navigation URLs from HTTPS-only automatic image URLs, preserving bundled sample/placeholder assets.
- `extension/preview.js`: browser-demo storage adapter using the demo origin's `localStorage`; capture and desktop notifications unavailable.
