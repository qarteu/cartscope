# CartScope sprint board

This repository board is an issue-tracker equivalent for the alpha submission. It records implemented scope, release gates, and the next sprint's user stories. Linked GitHub issues provide the discussion and feedback history once published. The team's original Trello board should also be reconciled when its URL and access are available.

**Release:** Alpha 0.1.0  
**Team:** Kartik, Jake Clevenger, Eashan  
**Owners:** To be assigned by the team per story  
**Sprint dates:** To be scheduled by the team

## Current sprint · local alpha implementation

`Built` means the source is present in this alpha. Release checks and tester validation remain separate gates below; these rows do not claim production integrations.

| ID | Status | User story | Acceptance criteria |
| --- | --- | --- | --- |
| CS-01 | Built | As a shopper, I want to review a product captured from the active page so I save the intended item. | User initiates capture; editable name, price, retailer, model, and variant; captured image or placeholder; manual fallback; no blanket host permission. |
| CS-02 | Built | As a shopper, I want saved products from different stores in one cart so I can plan a purchase. | Local persistence; quantity and notes editing; removal; budget and subtotal; retailer links. |
| CS-03 | Built | As a shopper, I want to compare offers for the same model and variant so I can choose deliberately. | Manual/observed offers; strict identity checks; item, shipping, and estimated tax shown; unknown costs explicit; sort by total/delivery/returns/pickup. |
| CS-04 | Built | As a shopper, I want a record of observed prices so I can see changes over time. | New captures and offer edits store timestamped price observations with their source; latest availability remains on each offer. |
| CS-05 | Built | As a shopper, I want watched changes surfaced when I capture an item again so I can act on new information. | Price-drop/restock detection from changed observations; notification list; optional Chrome notification permission; no background polling claim. |
| CS-06 | Built | As a shopper, I want to record orders so I can keep delivery notes together. | Manual create/edit/delete; status, delivery estimate, carrier, tracking number/link; tracking links open safely. |
| CS-07 | Built | As a shopper, I want to estimate installment costs so I understand entered financing terms. | Amount, payment count, fees, interest amount, first date, and interval; payment schedule and total; late fee separate; no invented APR or provider offer. |
| CS-08 | Built | As a shopper, I want control of my data so I can back it up or remove it. | JSON export/import; validation of imported structure; delete confirmation; local storage only. |
| CS-09 | Built | As a first-time tester, I want optional sample data so I can try the flows safely. | Empty real first run; labeled sample products, offers, alerts, and orders; sample data can be removed. |
| CS-10 | Built | As a reference user, I want install instructions and a feedback route so I can test the alpha. | README, release notes, issue forms, quantitative/qualitative protocol, draft invitation, unassigned roster. |
| CS-21 | Built | As a reviewer, I want a browser demo so I can explore CartScope without installing it. | Same static interface; browser localStorage; labeled sample mode; manual entry; extension-only capture clearly explained; no AWS setup. |

## Release and submission gates

| ID | Status | Action | Evidence required to close |
| --- | --- | --- | --- |
| REL-01 | Pending verification | Validate runtime, run behavioral checks, and smoke-test in Chrome | Check output and a dated [verification record](VERIFICATION.md). |
| REL-02 | Pending publication | Publish source to the personal GitHub account `qarteu` | Repository resolves at `https://github.com/qarteu/cartscope`; version-controlled source and license visible. |
| REL-03 | Pending publication | Publish GitHub release `v0.1.0`, ZIP, and checksum | Release page resolves; asset downloads, unzips, and loads in Chrome. |
| REL-08 | Pending publication | Publish the static preview on GitHub Pages | Public demo URL resolves and main preview flows pass a smoke test. |
| REL-04 | Pending participants | Recruit and assign ten consenting reference users | Private contact roster plus R01–R10 status entries; no fabricated identities. |
| REL-05 | Pending participants | Send the personalized preview announcement | Actual send dates and private delivery evidence; [draft email](ALPHA_EMAIL.md) alone does not close this task. |
| REL-06 | Pending feedback | Collect and triage quantitative and qualitative feedback | Actual issue/reply records and a readout with denominators and source labels. |
| REL-07 | Pending source access | Reconcile with the original Trello board | Original board URL/access verified and stories/statuses reconciled. |

## Next sprint · planned stories

The team should confirm these priorities using actual alpha feedback before starting the sprint.

| ID | Priority | User story | Acceptance criteria |
| --- | --- | --- | --- |
| CS-11 | P1 | As a shopper, I want capture to be reliable on the stores I use so I make fewer manual corrections. | Choose supported stores from tester evidence; fixture coverage for observed page structures; show source and confidence; preserve manual review. |
| CS-12 | P1 | As a shopper, I want comparisons to find authorized retailer offers automatically so I need less manual entry. | Select an authorized data source; document access and refresh limits; canonical model/variant mapping; reject mismatches; distinguish live vs stale data; shipping/tax uncertainty visible. |
| CS-13 | P1 | As a reference tester, I want my reported blockers fixed so the core save-and-compare flow is usable. | Reproduce each selected blocker; owner and test case assigned; verify resolved task with affected tester where possible. |
| CS-14 | P2 | As a shopper, I want watched prices checked while I am away so I can hear about meaningful changes. | Explicit opt-in; supported source and polling policy; notification frequency controls; timestamps and availability evidence; permission/privacy review. |
| CS-15 | P2 | As a shopper, I want order updates imported from a supported source so I can stop editing statuses manually. | Choose a carrier/retailer integration with permission; normalized status mapping; clear last-sync time; fallback/manual correction; no exposure of order secrets. |

## Backlog · later scope

| ID | Story | Entry criteria |
| --- | --- | --- |
| CS-16 | Optional account and cross-device cart synchronization | Demand shown by feedback; identity/storage design and deletion policy; explicit opt-in. |
| CS-17 | Optional hosted price/availability refresh service | Actual need confirmed after alpha; authorized source selected; cost, freshness, monitoring, and security requirements agreed; no secrets in extension. No cloud service is required for the current demo. |
| CS-18 | Provider-backed BNPL comparison | Current provider terms/permissions obtained; jurisdiction and disclosure requirements reviewed; no estimated APR represented as an offer. |
| CS-19 | Accessibility and browser support expansion | Keyboard/screen-reader usability findings; defined target browser versions; acceptance testing on those targets. |
| CS-20 | Chrome Web Store beta distribution | Alpha blockers addressed; privacy policy and listing assets; permission justification; store review requirements satisfied. |

## Board conventions

Move a story through **Backlog → Planned → In progress → In review → Done**. `Done` requires accepted behavior and recorded validation. A release or recruitment task closes only when its external action has happened. Keep issue links next to stories after creating them. The board and GitHub issue status should agree; update both when a status changes.
