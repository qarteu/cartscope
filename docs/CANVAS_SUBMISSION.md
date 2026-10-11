# CartScope Alpha 0.1.1 submission

Our team built CartScope to keep shopping across several stores in one place. The Chrome extension lets a shopper save products, compare offers they have checked, keep an item budget, and record orders. This submission includes the released extension, source, browser demo, test evidence, tracker, and invitation template. The Alpha is complete for that scope. The ten-user recruitment, invitation delivery, and feedback collection are still pending.

The [UniCart prototype](https://www.figma.com/design/6rJ6LQuCiH2rufqc1Pj7QH/UniCart-UI-Prototype?node-id=0-1) guided saving, cart and comparison. Our design uses paper and forest colors, a custom CartScope mark and compact cost records. [Real Chrome screenshots](https://github.com/qarteu/cartscope/blob/main/docs/visuals/README.md) show the finished screens.

**Team:** Kartik Malunjkar - System Architect and Release Train Engineer; Jake Clevenger - Product Manager and Product Owner; Eashan - Business Owner and Scrum Coach.

## Required attachments and links

1. **Personal GitHub repository:** [https://github.com/qarteu/cartscope](https://github.com/qarteu/cartscope). It contains version-controlled source, installation instructions, release notes, test scripts, screenshots, and the MIT license.
2. **Downloaded Alpha ZIP:** [cartscope-alpha-0.1.1.zip](https://github.com/qarteu/cartscope/releases/download/v0.1.1/cartscope-alpha-0.1.1.zip). The [release page](https://github.com/qarteu/cartscope/releases/tag/v0.1.1) includes the notes and checksum.
3. **Announcement template:** [Alpha invitation](https://github.com/qarteu/cartscope/blob/main/docs/ALPHA_EMAIL.md). It includes installation, release-note links, tasks, numeric ratings and written feedback. It is a draft, not a claim that messages were sent.
4. **Agile tracker:** [GitHub Issues](https://github.com/qarteu/cartscope/issues), [sprint board](https://github.com/qarteu/cartscope/blob/main/docs/SPRINT_BOARD.md), and [linked stories](https://github.com/qarteu/cartscope/blob/main/docs/PUBLISHED_ISSUES.md). GitHub Issues is our similar issue tracker for this submission.

**Try the app:** [Browser demo](https://qarteu.github.io/cartscope/). **Detailed attachment:** [Submission PDF](https://github.com/qarteu/cartscope/blob/main/docs/FINAL_SUBMISSION.pdf). **All files:** [Submission bundle](https://github.com/qarteu/cartscope/releases/download/v0.1.1/cartscope-submission-0.1.1.zip). **Screenshots:** [Chrome walkthrough](https://github.com/qarteu/cartscope/blob/main/docs/visuals/README.md).

## Installation and demonstration

Use Chrome 116 or newer. Download the release ZIP, unzip it into a folder you will keep, open `chrome://extensions`, enable Developer mode, and choose Load unpacked. Select the folder containing `manifest.json`, then pin CartScope in the Extensions menu.

Open a retailer product page, click the CartScope toolbar icon, and choose Capture this page. Check the captured name, price, retailer, identifiers and variant before saving. If a page cannot be read, enter the product manually. Add another product, change its quantity, and set a budget. The cart subtotal covers item prices; Compare shows shipping, estimated tax, membership, verified discounts and eligible cashback separately.

To compare another store, add a checked offer for the same model, size, color and condition. Change the ranking to total cost, delivery, pickup or returns. Missing required costs stay unknown, and conflicting variants are not promoted as a best match. Shopping links open the retailer, where the shopper confirms final charges and completes checkout.

Set a price or restock watch, then capture or edit the same offer again to record a new observation. Add an order manually and update its status or tracking link. Use the payment calculator to enter an amount, payment count, fees, interest and dates; it shows the whole obligation and the schedule. Export a backup from Settings. Optional samples let reviewers try these flows without inventing live prices. The browser demo uses separate browser storage; capture and native Chrome notifications require the extension. No AWS setup is needed.

## Built features and evidence

| Feature | Working Alpha behavior | How we checked it |
| --- | --- | --- |
| 1. Product capture and review | Read the active product page, edit the result, and save it. | Extraction fixtures + Chrome toolbar capture; category pages rejected. |
| 2. Cart and budget | Products from several stores, quantities, notes, save-for-later, budget and retailer links. | Chrome add/edit/quantity checks; persistence through real extension storage. |
| 3. Offer comparison | Model, variant and condition checks; full cost components; total, delivery, pickup and return ranking. | Core arithmetic/identity tests + Chrome mismatch and unknown-shipping checks. |
| 4. History and alerts | Timestamped observations, opted-in drop/restock watches, in-app notifications. | Chrome observation transitions; repeat captures or edits, not background polling. |
| 5. Order records | Manual order creation, dates, status, notes and safe tracking links. | Chrome create/update flow; storage rejects invalid quantities and dates. |
| 6. Payment calculator | Full obligation, entered interest/fees, due dates and exact-cent installments. | Core rounding/leap-day tests + Chrome full-total and remainder checks. |
| 7. Data controls | Export/import/delete, atomic validation, separate real and sample workspaces. | Chrome backup round trip; storage failure and sample-provenance regressions. |
| 8. Browser demo and layout | The same app in browser storage, sample mode, responsive screens. | Chrome preview persistence/isolation, narrow layouts and hosted demo checks. |

## What we tested and how

The [verification record](https://github.com/qarteu/cartscope/blob/main/docs/VERIFICATION.md) records **65 passing Node behavioral tests, including 12 DOM flow checks**, plus **16 passing real Chrome checks**. These are automated checks, not participants. Node tests cover cost arithmetic, matching, extraction, storage, ZIP packaging and publishing-command contracts. Happy DOM checks exercise the actual app, preview adapter and background consumer through event handlers; publishing contracts use disposable CLI doubles.

The run used **Chrome for Testing 151.0.7922.34** in a disposable profile. It unpacked the actual release ZIP into a clean installation directory and loaded the extension. It exercised the real service worker, local storage, toolbar action, scripting and downloads. Capture was denied before the toolbar click and succeeded after the activeTab grant. An HTTP product-page fixture returned the expected product; a category fixture was rejected. Other checks covered cart, comparison, watches, orders, financing, backup, hostile inputs, narrow layouts and demo persistence. The public-demo check and its response are recorded in the [machine-readable Chrome report](https://github.com/qarteu/cartscope/blob/main/docs/CHROME_TEST_RESULTS.json). [The workflow run](https://github.com/qarteu/cartscope/actions/runs/38178299418) and screenshot provenance are linked for review.

The fixtures make the checks reproducible. They do not validate changing markup on every current retailer website, live retailer feeds, testers' operating systems, or native desktop notification delivery. We still need field testing for those cases. Sample prices, stock and shipments are labeled examples.

## Feedback and next sprint

Reference users can use the [Alpha feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml) or reply privately to the invitation email. We ask for an assigned R01-R10 ID, extension/demo mode, task completion or failure, time taken, 1-5 ratings for ease, clarity, usefulness and confidence, and written comments about confusing steps, missing information and the most valuable improvement. The [task protocol](https://github.com/qarteu/cartscope/blob/main/docs/FEEDBACK_PLAN.md) defines the questions and rating scales. Public feedback must omit contact, payment and private order details.

The tracker contains **31 records**, including **5 planned next-sprint stories** and **5 later backlog stories**. The linked board records current statuses for implementation, publication and pending user work. Next-sprint priorities are real-store capture validation, authorized automatic offer discovery, fixes from observed feedback, and source-dependent price-check/order-update integrations.

The [reference roster](https://github.com/qarteu/cartscope/blob/main/docs/REFERENCE_USERS.csv) still has ten unassigned slots. We have prepared the email and feedback routes, but we have not recruited ten agreed recipients, sent their invitations, or collected their results. Automatic retailer discovery, unattended polling, carrier updates, provider-backed financing and account synchronization also remain planned. The released Alpha works with user-captured or entered information and keeps its shopping records on the device.
