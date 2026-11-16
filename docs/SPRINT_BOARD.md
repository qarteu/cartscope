# CartScope sprint board

**Planning snapshot:** November 15, 2026 (Pacific)<br>
**Next sprint:** **Sprint 2.E Fielding & Support**<br>
**Published GitHub prerelease:** [Launch Candidate 0.1.2](https://github.com/qarteu/cartscope/releases/tag/v0.1.2), shown as PREVIEW 0.1.2; verified runtime ZIP `cartscope-launch-0.1.2.zip`<br>
**Published history:** GitHub Alpha [0.1.0](https://github.com/qarteu/cartscope/releases/tag/v0.1.0) and [0.1.1](https://github.com/qarteu/cartscope/releases/tag/v0.1.1)<br>
**Chrome Web Store:** no verified public listing URL, submitted-review record, or approval is recorded.

The [GitHub issue tracker](https://github.com/qarteu/cartscope/issues) is our Trello-equivalent tracker, with all 45 records published online. Final submission-packet publication and final status reconciliation remain under REL-15. [Issue records](issues.json) contain the full stories and acceptance criteria; [published issue links](PUBLISHED_ISSUES.md) identify the actual external records. No existing Trello URL has been verified.

Kartik Malunjkar owns architecture/releases, Jake Clevenger owns product/backlog, and Eashan owns business/research and Scrum. Story owners below are proposed. The team must confirm dates, capacity and assignments at planning; external Store review is not a promised sprint completion date.

[Six-item launch requirements and artifact locations](launch/REQUIREMENTS.md) · [Launch materials](launch/README.md) · [Verification record](VERIFICATION.md)

## Shipped GitHub Alpha history

`Done` here records the delivered 0.1.0/0.1.1 scope, not Chrome Web Store publication or completion of the 0.1.2 candidate. The recorded 0.1.1 baseline has **65 passing Node tests, including 12 DOM flows, plus 16 Chrome checks**, and an **18-file runtime ZIP**. [Historical verification](https://github.com/qarteu/cartscope/blob/v0.1.1/docs/VERIFICATION.md) and [Chrome evidence](CHROME_TEST_RESULTS.json) explain the fixture and platform limits. Current 0.1.2 has 70 passing Node reporter tests (13 DOM flows included) and 18 passing Chrome checks in [launch evidence](launch/TEST_RESULTS.md); Store installation and real-customer validation remain separate gates.

| ID | Status | Delivered behavior | Evidence / boundary |
| --- | --- | --- | --- |
| CS-01 | Done | Capture the active product page and review editable details. | User-initiated toolbar access, fixture capture, manual fallback; current stores still need field validation. |
| CS-02 | Done | Persist products from several stores, quantities, notes, save-for-later and an item budget. | Local cart and quantity checks; shopping links return to retailer checkout. |
| CS-03 | Done | Compare checked offers with identity/variant/condition checks and transparent costs. | Total, delivery, pickup and returns ranking; missing required costs stay unknown. |
| CS-04 | Done | Record timestamped observed prices. | Capture/edit observations; not a complete market history or price forecast. |
| CS-05 | Done | Show watched price-drop/restock changes after a new observation. | In-app alerts and optional Chrome notification permission; no unattended polling. |
| CS-06 | Done | Keep manual order records, dates, status, notes and safe tracking links. | Manual updates; no live carrier feed or dedicated carrier-name field. |
| CS-07 | Done | Calculate the full obligation and an exact-cent payment schedule. | User-entered interest/fees and dates; no provider quote, APR or credit decision. |
| CS-08 | Done | Export/import/delete local records with atomic validation. | Links/history preserved, old alerts not replayed, sample imports isolated. |
| CS-09 | Done | Explore a separate labeled sample workspace. | Real first run starts empty; sample provenance retained through backups. |
| CS-10 | Done | Provide Alpha installation instructions and feedback mechanisms. | Documents/forms prepared; recruitment, sending and actual responses remain separate gates. |
| CS-21 | Done | Explore the same interface in a static browser demo. | Separate browser local storage; capture requires the extension; no AWS setup. |
| CS-22 | Done | Deliver the paper/forest shopping desk, custom mark and Alpha report. | Genuine 0.1.1 Chrome screenshots and feature/test evidence; not a 0.1.2 verification claim. |

| ID | Status | Historical release action | Evidence |
| --- | --- | --- | --- |
| REL-01 | Done | Smoke-test the Alpha ZIP in real Chrome. | [October 11 run](https://github.com/qarteu/cartscope/actions/runs/38178299418): actual unpacked 0.1.1 ZIP, toolbar grant, fixture capture, main flows, downloads and layouts. |
| REL-02 | Done | Publish source to the personal qarteu GitHub account. | [Repository](https://github.com/qarteu/cartscope); this historical publication does not prove current write authorization. |
| REL-03 | Done | Publish Alpha 0.1.0 and its runtime ZIP/checksum. | [Original release](https://github.com/qarteu/cartscope/releases/tag/v0.1.0); original tag/assets retained. |
| REL-08 | Done | Publish and smoke-test the 0.1.1 GitHub Pages demo. | [Demo](https://qarteu.github.io/cartscope/) and historical Chrome evidence; not a Store listing. |
| REL-09 | Done | Publish the separate 0.1.1 patch and Alpha submission packet. | [Release and attachments](https://github.com/qarteu/cartscope/releases/tag/v0.1.1); downloaded runtime matched tested bytes. |

## Sprint 2.E Fielding & Support

**Goal:** field a verified candidate, prepare and pursue authorized Store distribution, and support real installation/use. Keep the existing local/manual Alpha boundaries clear. Prioritize launch blockers and actual user problems before optional feature expansion.

All rows below are **planned**. Documents, estimates and proposed owners are preparation, not user acceptance or measured support results.

| ID | Status | Priority / proposed owner | User story and acceptance |
| --- | --- | --- | --- |
| CS-11 | Planned | P1 · Kartik / Jake | As a shopper, I want reliable capture on my stores. Select current stores with consenting testers; record attempted captures, corrected fields, failures, environment and denominators; retain permitted examples and reproduce defects. |
| CS-13 | Planned | P1 · Jake / Kartik | As a tester, I want reported blockers resolved. Reproduce actual reports, assign severity/owner, add useful regression checks, record fixed version and verify the task with affected testers where possible. |
| CS-19 | Planned | P1 · Kartik / testers | As a shopper, I want installation and core tasks checked on documented platforms. Test install/update/uninstall, keyboard focus and opted-in native notifications; record environments, outcomes and remaining accessibility limits. |
| CS-20 | Planned | P1 · Kartik | As a shopper, I want Store installation and updates. Prepare the listing/reviewer kit; submit through an authorized publisher under REL-12; close only after a verified approved public listing under REL-13. |
| CS-23 | Planned | P1 · Jake / Eashan / Kartik | As a user, I want a usable support route. Publish support/known-issues guidance; collect version/environment and task evidence; record actual acknowledgement/reproduction/resolution dates; route defects to CS-13. |
| CS-27 | Planned | P2 · Jake / Eashan / Kartik | As the team, we want agreed acceptance for requested features. Review the October 22 requests, clarify tasks/constraints, and scope EP-01/02/03. This is discovery; it does not deliver their features. |

## Launch, fielding and support gates

A prepared listing kit is not a submitted review, a submitted review is not approval, and a local file is not a published release. Leave each gate open until its evidence exists.

| ID | Status | Action | Evidence required to close |
| --- | --- | --- | --- |
| REL-04 | Planned | Confirm ten consenting reference users. | Real private commitments, assigned R01-R10 IDs and roster status; empty slots do not count. |
| REL-05 | Planned | Send the original personalized Alpha preview invitations. | Actual send dates and private delivery evidence; the existing draft is not a sent announcement. Coordinate with the launch message to avoid duplicate invitations. |
| REL-06 | Planned | Collect and triage quantitative and qualitative feedback. | Actual task results/times, 1-5 ratings, written reports and a readout with denominators; extension/demo modes separated. |
| REL-07 | Planned | Reconcile an existing Trello board if supplied. | Verified URL/access and reconciled records. Conditional; GitHub Issues remains the current equivalent tracker. |
| REL-10 | Done · automated ZIP/Chrome verification | Verify the actual Launch Candidate 0.1.2 ZIP. | Current validation and behavioral checks; clean Chrome installation of `cartscope-launch-0.1.2.zip`; named results, browser/version, commit, inventory, hash and genuine screenshots. Historical Alpha evidence is insufficient. |
| REL-11 | Done | Publish the verified 0.1.2 source and GitHub release. | [Published prerelease](https://github.com/qarteu/cartscope/releases/tag/v0.1.2), tag source `78d2602b654628c2269ba57ce064c06c07b5174c`; downloaded runtime/checksum match the Chrome-tested SHA-256 `a36de3df01656c062e5000b7bd2fb0a7b46d11d61d11bcb9be5393f7a18d24d0`; 18 runtime files, root manifest 0.1.2 and CRCs verified. Store publication remains separate. |
| REL-12 | Planned | Submit the candidate for Chrome Web Store review. | Authorized publisher session, correct item identity/version, completed kit, actual upload/submission confirmation, time and review status. |
| REL-13 | Planned | Verify the approved public Chrome Web Store listing. | Actual public URL/item ID, expected publisher/version, approval/publication status and Store installation/update check. Keep the Store URL null until verified. |
| REL-14 | Planned | Announce launch to ten reference users and other potential customers. | Consenting recipients, personalized authorized delivery/publication, real dates/channel evidence, feedback routes and voluntary honest Store-review request. Public Store wording depends on REL-13. |
| REL-15 | Planned | Publish the launch submission and synchronize tracker records. | Published six-item index and current artifacts; board, JSON and real GitHub issues/labels agree; new external issue URLs recorded only after creation. |

## Requested feature epics and implementation backlog

**Source:** the owner's October 22 chat feedback requested screenshot capture, price guidance and occasion folders. These requests are planning input, not invented interviews or proof of ten-user validation. **None of these three features is implemented.** CS-27 scopes them during Sprint 2.E; implementation remains in the backlog.

| ID | Status | Kind / parent | Planned feature or user story |
| --- | --- | --- | --- |
| EP-01 | Backlog | Epic | Screenshot capture and review: add screenshot-assisted entry alongside current page capture/manual entry. |
| CS-24 | Backlog | Story · EP-01 | As a shopper, I want to save from a user-supplied screenshot. Agree on capture/import and processing/retention choices; present uncertain fields for editable review; preserve provenance and manual fallback; verify unsupported/ambiguous cases. |
| EP-02 | Backlog | Epic | Evidence-based price guidance: explain a recommendation using adequate, current and comparable observations. |
| CS-25 | Backlog | Story · EP-02 | As a shopper, I want guidance with its evidence. Define rules/minimum coverage; show source, timestamps and sample size; distinguish complete cost; handle sparse/stale/mismatched evidence explicitly. No market-wide feed or future-price certainty is implied. |
| EP-03 | Backlog | Epic | Occasion folders: organize related saved products without losing the existing cart. |
| CS-26 | Backlog | Story · EP-03 | As a shopper, I want occasion folders. Define membership/budgets and deletion behavior; create/rename/delete folders; preserve items, migrations, backup relationships and sample isolation; verify persistence. |

## Later integrations and expansion

| ID | Status | Deferred story / condition |
| --- | --- | --- |
| CS-12 | Backlog | Authorized automatic cross-store discovery; requires a selected permitted source, identity mapping, freshness and uncertainty handling. |
| CS-14 | Backlog | Opt-in unattended price checks; depends on CS-12 source access, refresh policy and notification controls. |
| CS-15 | Backlog | Authorized order updates; requires permitted carrier/retailer access, timestamps and manual fallback. |
| CS-16 | Backlog | Optional account/cross-device synchronization; demand, identity/storage/deletion design and explicit opt-in first. |
| CS-17 | Backlog | Optional hosted refresh service; demonstrated need, authorized source and operating/retention model first. No AWS prerequisite. |
| CS-18 | Backlog | Provider-backed BNPL comparison; actual source/terms/permissions required. Current calculator accepts user-entered terms only. |

## Board conventions

`backlog` means not selected for this sprint; `planned` means selected preparation or an open evidence gate; `done` requires the stated delivered result. No new launch/Store/field-support item is marked done in this revision. Keep the exact sprint name **Sprint 2.E Fielding & Support** in issue bodies and sprint metadata.

`docs/issues.json` is the detailed local issue source. Each table row here maps to one unique record. Publishing must reconcile titles, labels, status and discussion links with actual GitHub issues; a local JSON edit does not update the online tracker. In particular, a later sync must move the changed existing labels as well as creating new records. Do not close a Store, send, feedback or field-validation gate from a prepared document alone. Keep contacts and delivery evidence private.
