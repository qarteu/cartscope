# CartScope Privacy Policy

Last updated: November 14, 2026.

CartScope is a shopping side panel developed by the CartScope team: Kartik Malunjkar, Jake Clevenger, and Eashan. This policy covers the Chrome extension and the CartScope browser demo at `qarteu.github.io/cartscope`.

## Information you choose to use

When you ask CartScope to capture a product page, it reads product metadata and product fields from the tab you have authorized. These can include the product name, price and currency, retailer, brand, model or barcode, color, size, condition, availability, image address, and product page address. CartScope shows a draft for you to review before saving. It does not build a log of all the websites you visit or read your browser's History database.

You can also enter products and offers yourself. Saved records may include quantities, prices, shipping, tax estimates, fees, discounts, cashback, delivery and return details, optional pickup/store location text, shopping notes, and watch preferences. Manual order records may include a product, retailer, status, dates, tracking number, tracking link, and notes. Avoid entering passwords, payment card numbers, bank details, addresses, or other sensitive personal information in notes.

CartScope records the price, retailer, date/time, and source of offers you save or update to provide your observed price history and opted-in price/restock alerts. It does not automatically poll retailer sites. The payment planner calculates a schedule from the amounts and dates you enter in the open panel. The planner does not save those calculator inputs or results as a separate record, access a credit report, connect to a lender, or make lending decisions.

## Where records are stored and why

The installed extension stores saved products, offers, notes, observations, alerts, manual orders, and preferences in `chrome.storage.local` in your Chrome profile on this device. The sample workspace is separate from the real workspace. CartScope does not use Chrome's sync storage, a CartScope account, or a CartScope shopping-data server.

The browser demo stores its real and sample workspaces in the demo website's `localStorage` in that browser. Its records are separate from the installed extension. It cannot capture your shopping tab or deliver Chrome desktop notifications.

These records support the features you choose: maintaining the list, comparing checked offers, displaying your budget, recording observed changes, and keeping manual order notes. The extension has no analytics, advertising SDK, session recording, affiliate tracking, sale of records, or automatic upload of your workspace to the team.

## Network requests and other services

“Local storage” does not mean the extension never contacts a website.

- A product image can be loaded directly from an HTTPS image address saved with that item. Automatic image loads reject insecure HTTP addresses; a bundled placeholder is used when no acceptable image is available. The image host receives the requested address and ordinary connection information, including your IP address. CartScope sets a no-referrer policy on product images, but the host may still recognize its own resource or receive browser-controlled request information. Bundled sample illustrations do not require an external image host.
- Retailer, carrier, release-note, source, support, and feedback links open their destination when you choose them. User-saved retailer and carrier links may use HTTP or HTTPS; the destination's connection and security are separate from CartScope's HTTPS-only automatic image loading. Those websites operate under their own privacy policies and may use their normal cookies and logging. CartScope does not complete checkout or retrieve your carrier account.
- The public demo and public project pages are hosted by GitHub. Requests for those pages are handled by GitHub under its own policies. The demo contains no CartScope analytics script.
- If you submit a GitHub issue or Chrome Web Store review, that information is public under the relevant service's rules. If you reply to an invitation email, your message and email address are received through the team's email service. Sending feedback is optional and is separate from local extension storage. The team uses feedback to respond and improve CartScope. Messages you submit may remain in email or issue history until removed using the relevant service or team process; clearing your workspace does not remove them. Do not attach an unredacted backup or private order information to a public issue or review.

## Optional notifications

Desktop notifications are off by default. CartScope requests Chrome's notification permission when you enable them. After a later capture or offer update records a watched change, the alert title and message may be displayed by Chrome and your operating system, including wherever your system shows notifications. Turn them off in CartScope Settings or revoke the extension's notification permission in Chrome. In-app alerts do not require desktop notification permission.

## Your controls and retention

You can review and edit saved records in the panel. Removing a product also removes its associated offers, observations, alerts, and manual orders. Removing an offer by itself retains prior price observations. Settings lets you export a workspace to a JSON file, replace it with a validated backup, or delete all records and preferences in that workspace. Clearing the real workspace does not clear a separate sample workspace; use its reset control as needed.

Records remain in local browser storage until you change or clear them, remove the extension, or remove the associated browser/profile data. There is no timed server retention period because CartScope does not keep a server copy. The current runtime limits stored price observations to the latest 5,000 and alerts to the latest 200. Your device's own backups or exported JSON files may retain copies independently.

An exported backup contains the workspace data and is not encrypted by CartScope. Store and share it with care. Deleting the workspace does not delete exported files, screenshots, messages, public issues, or data held by third-party websites. Clear demo site data through your browser if you want to remove its local storage. Use the relevant service's controls for feedback you submitted there.

## Security and policy changes

All executable extension code is bundled. The extension requests temporary product-tab access rather than permanent access to all websites. It does not request your passwords or a CartScope login. Local storage and exports are not protected by an additional CartScope encryption layer; device, browser, and operating-system protections still matter.

This policy will be updated when data handling changes. The date above identifies this revision. Review the policy and release notes for the version you use.

## Contact

For general privacy questions, contact the CartScope team through [the project's support page](https://qarteu.github.io/cartscope/support.html). The linked GitHub issues are public: describe the question without publishing names, email addresses, addresses, private order identifiers, or shopping backups. Because the team does not receive your local workspace, it cannot retrieve or delete that copy for you; use the local controls described above.
