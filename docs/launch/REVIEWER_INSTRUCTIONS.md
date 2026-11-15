# Chrome Web Store review instructions

**Submission:** CartScope Launch Candidate 0.1.2, `artifacts/cartscope-launch-0.1.2.zip`, displaying **PREVIEW 0.1.2**. Final package verification is pending; see [launch metadata](launch-metadata.json). **Store item URL:** pending. These steps are instructions for the submitted build, not a claim that the submission has been approved.

No login, payment, API key, retailer account, cloud service, or purchase is needed. Use Chrome 116 or newer. All executable code is in the ZIP. The extension opens a side panel from its toolbar action.

## Install and first run

For Store review, use the uploaded package. For a local reproduction, download the release ZIP, unzip it, open `chrome://extensions`, turn on Developer mode, choose Load unpacked, and select the folder containing `manifest.json`. Pin CartScope from Chrome's Extensions menu and click the toolbar icon.

The installed extension's real workspace begins empty. Open **Explore sample workspace** to exercise the UI with clearly labeled examples. The separate browser demo begins in sample mode and is not a substitute for extension permission/capture testing.

## Deterministic sample flow

1. In the sample workspace, inspect the saved cart: three cart items and a separate saved-for-later product. Change a quantity and set a budget. The subtotal and remaining/over-budget amount should update.
2. Open Compare, select the Sony headphones, and inspect the three sample offers. The Best Buy sample has the lowest recorded total at the default settings. These are illustrative offers and search links, not live prices.
3. Change the sort to delivery, returns, and pickup. Open an offer's cost breakdown. A blank shipping amount on a manually entered offer must leave its total incomplete; a conflicting model/variant should not become the best exact match.
4. Select Watch/Watching on an item and save a price/restock preference. For a deterministic change, use the JBL sample with a target of 80, edit its corresponding offer from 89.99 to 75 without changing the variant, save it, and check Alerts for the new observed price drop. Desktop notification permission is optional; it is not needed to inspect in-app alerts. No background monitoring is expected.
5. Open Orders. Add or update a fictitious order for a saved item. Status, expected date, notes, and tracking details are manual. No carrier refresh is expected.
6. Open Payment planner from Compare. Use purchase amount 100.01, interest 0, fees 0, and four payments. The schedule should sum to 100.01 and distribute cents without losing money. It uses stated total interest, not an APR.
7. In Settings, export a JSON backup. Change a harmless value, import the backup into the same workspace, and confirm restoration. Import replaces the selected workspace after confirmation. Import does not replay old desktop alerts; it turns desktop notification preferences off.
8. Return to the real workspace and confirm sample edits did not appear there. Workspace clearing is destructive after confirmation; export any records you need first.

## User-requested product capture

Open one product detail page on an ordinary HTTP(S) website. Click the CartScope toolbar icon on that tab to grant temporary access, then choose **Capture this page** in the panel. Review and correct the detected fields, save, and compare the resulting record with the page. The script reads metadata and product fields without clicking, changing the page, or submitting forms.

Capture supports suitable structured product metadata with selected retailer fallbacks. A category page, ambiguous multi-product page, missing price, changed retailer markup, restricted Chrome page, or unsupported metadata may produce an explanatory error. **Add manually** is the fallback. Do not infer compatibility with every retailer from the sample data.

For a repeatable local fixture, the repository includes the capture fixtures used by the browser suite. Follow the existing project verification commands; do not require the reviewer to create a retailer account. Actual reviewer-visible behavior should be assessed from the uploaded package.

## Privacy and permission checks

- Before a toolbar click on the product tab, capture may ask the user to click the toolbar icon; this is intentional temporary `activeTab` access.
- Notification permission is requested only when enabling the desktop notification checkbox. Declining it leaves in-app alerts usable.
- There is no host-permission list, permanent content script, remote executable code, analytics endpoint, sign-in, affiliate redirect, or backend synchronization.
- External product images may make network requests to their saved image host. Retailer/carrier/GitHub links navigate only when selected. See [the privacy policy](PRIVACY_POLICY.md).
- Export produces a local JSON download. The extension does not request Chrome's downloads permission.

## Evidence boundaries

The public repository includes tests, verification reports, release notes, and actual Chrome screenshots. Old screenshots prove the captured version only. The release owner should attach the final version's CI report and archive hash to this submission; no unexecuted test or previous alpha result should be described as a pass for a new package.
