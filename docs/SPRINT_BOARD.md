# CartScope sprint board

This repository board is an issue-tracker equivalent for the alpha submission. It records implemented scope, release gates, and the next sprint's user stories. [Issue records](issues.json) seed the matching GitHub issues at publication. Linked GitHub issues provide the discussion and feedback history. No existing external Trello URL was verified in the inspected CartScope files/chats; reconcile an existing board if the team supplies it.

**Release:** Alpha 0.1.0  
**Team:** Kartik Malunjkar, Jake Clevenger, Eashan  
**Responsibilities:** Kartik owns architecture/releases, Jake owns product/backlog, and Eashan owns business/research and Scrum. Per-story owners in issue records are proposed for confirmation at sprint planning.  
**Sprint dates:** To be scheduled by the team

## Current sprint · local alpha implementation

`Built` means the source is present and covered by the automated checks described in [verification](VERIFICATION.md). The corresponding implementation issue uses `done` and can close on that evidence. Real Chrome checks, publication, product-owner acceptance with reference users, and tester validation remain separate gates below; these rows do not claim production integrations.

| ID | Status | User story | Acceptance criteria |
| --- | --- | --- | --- |
| CS-01 | Built | As a shopper, I want to review a product captured from the active page so I save the intended item. | User initiates capture; editable name, price, retailer, model, variant and condition; captured image or placeholder; manual fallback; no blanket host permission. |
| CS-02 | Built | As a shopper, I want saved products from different stores in one cart so I can plan a purchase. | Local persistence; quantity and notes editing; removal; save-for-later; budget and item subtotal; consistent retailer links. |
| CS-03 | Built | As a shopper, I want to compare offers for the same model and variant so I can choose deliberately. | Manual/observed offers; identity, variant and condition checks; item, shipping, tax, membership, discounts and cashback shown; unknown required costs explicit; quantity-aware totals; rank by total/delivery/returns/pickup with preference eligibility. |
| CS-04 | Built | As a shopper, I want a record of observed prices so I can see changes over time. | New captures and offer edits store timestamped price observations with their source; latest availability remains on each offer. |
| CS-05 | Built | As a shopper, I want watched changes surfaced when I capture an item again so I can act on new information. | Price-drop/restock detection from changed observations; notification list; optional Chrome notification permission; no background polling claim. |
| CS-06 | Built | As a shopper, I want to record orders so I can keep delivery notes together. | Manual create/edit/delete; product, retailer, quantity, status, order/expected dates, notes, tracking number/link; valid quantities and calendar dates; tracking links open safely. |
| CS-07 | Built | As a shopper, I want to estimate installment costs so I understand entered financing terms. | Amount, payment count, fees, interest amount, first date, and interval; payment schedule and total; late fee separate; no invented APR or provider offer. |
| CS-08 | Built | As a shopper, I want control of my data so I can back it up or remove it. | JSON export/import; schema and ID validation; atomic rejection of malformed imports; links/history preserved; historical alerts not replayed and desktop notifications disabled after import; delete confirmation; local storage only. |
| CS-09 | Built | As a first-time tester, I want optional sample data so I can try the flows safely. | Empty real first run; isolated labeled sample products, offers, history, alerts and orders; reset/exit controls; sample backup provenance retained and blocked from real-workspace import. |
| CS-10 | Built | As a reference user, I want install instructions and a feedback route so I can test the alpha. | README, release notes, runtime ZIP/checksum, issue forms, quantitative/qualitative protocol, draft invitation, unassigned roster; publication is recorded below; actual participation remains pending. |
| CS-21 | Built | As a reviewer, I want a browser demo so I can explore CartScope without installing it. | Same static interface; browser localStorage; labeled sample mode; manual entry; extension-only capture clearly explained; no AWS setup. |

## Release and submission gates

| ID | Status | Action | Evidence required to close |
| --- | --- | --- | --- |
| REL-01 | Done · automated Chrome | Smoke-test the release ZIP in real Chrome | 16 passing Chrome checks from the actual unpacked ZIP: toolbar access, fixture capture, main flows, downloads, responsive layouts, and demo. [Verification](VERIFICATION.md) records browser/version and remaining manual platform/native notification field scope. |
| REL-02 | Done | Publish source to the personal GitHub account `qarteu` | Repository resolves at `https://github.com/qarteu/cartscope`; version-controlled source and license visible. |
| REL-03 | Done | Publish GitHub release `v0.1.0`, ZIP, checksum and release notes | Verified release commit/tag; release page resolves; asset downloads and checksum matches; unpacked installation evidenced by REL-01. |
| REL-08 | Done | Publish the static preview on GitHub Pages | Public demo URL resolves and main preview flows pass a smoke test. |
| REL-04 | Pending participants | Recruit and assign ten consenting reference users | Private contact roster plus R01–R10 status entries; no fabricated identities. |
| REL-05 | Pending participants | Send the personalized preview announcement | Actual send dates and private delivery evidence; [draft email](ALPHA_EMAIL.md) alone does not close this task. |
| REL-06 | Pending feedback | Collect and triage quantitative and qualitative feedback | Actual issue/reply records and a readout with denominators and source labels. |
| REL-07 | Pending source access, conditional | Reconcile an existing Trello board if supplied | Actual board URL/access verified and stories/statuses reconciled; GitHub Issues remains the current similar issue tracker. |

## Next sprint · planned stories

The team should confirm these priorities, dates and owners using actual alpha feedback before starting the sprint. All five stories are `planned` with the `next-sprint` label in [issue records](issues.json); P2 integration stories are conditional on permitted source access.

| ID | Priority | User story | Acceptance criteria |
| --- | --- | --- | --- |
| CS-11 | P1 | As a shopper, I want capture to be reliable on the stores I use so I make fewer manual corrections. | Choose supported stores from tester evidence; fixtures for current permitted page examples; correction rate with actual denominators; show source and confidence; preserve manual review. |
| CS-12 | P1 | As a shopper, I want comparisons to find authorized retailer offers automatically so I need less manual entry. | Select an authorized data source; document access and refresh limits; canonical model/variant/condition mapping; reject mismatches; distinguish live vs stale data; shipping/tax uncertainty visible; no AWS prerequisite. |
| CS-13 | P1 | As a reference tester, I want my reported blockers fixed so the core save-and-compare flow is usable. | Collect completion/time, 1–5 ratings and written feedback; reproduce selected blockers; owner and meaningful regression check assigned; verify resolved task with affected tester where possible; distinguish extension/demo results. |
| CS-14 | P2 | As a shopper, I want watched prices checked while I am away so I can hear about meaningful changes. | Conditional on an authorized source from CS-12; explicit opt-in; polling policy; notification frequency controls and deduplication; timestamps and availability evidence; permission/privacy review. |
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

Move a story through **Backlog → Planned → In progress → In review → Done**. Implementation issues close on the documented automated evidence defined above; real-browser and reference-user acceptance stays visible in its release gates. A release, recruitment, sending or feedback task closes only after its stated external action and evidence exist. Keep published issue links in `PUBLISHED_ISSUES.md`. IDs, scope and status must agree between this board, `issues.json` and GitHub issues; update all three when status changes.
