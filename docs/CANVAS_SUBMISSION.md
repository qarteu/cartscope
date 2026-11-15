# CartScope — Launch Release Submission

**Team:** Kartik Malunjkar, Jake Clevenger, and Eashan. **Prepared:** November 14, 2026. **Build:** Launch Candidate 0.1.2 (`PREVIEW 0.1.2`).

1. **Chrome Web Store listing**

   **Pending publication and Google review.** No public Store URL has been verified. The attached launch packet includes the listing description, permission explanations, privacy policy, reviewer instructions and original promotional graphics. A prepared upload kit or GitHub release is not a published Store listing.

2. **GitHub repository and release notes**

   [qarteu/cartscope](https://github.com/qarteu/cartscope) · [Published releases](https://github.com/qarteu/cartscope/releases)

   The repository contains the published Alpha history. The current 0.1.2 source, release notes and launch materials are prepared locally; publishing this revision requires renewed qarteu write authentication. No hosted 0.1.2 release is claimed yet.

3. **Locally installable ZIP**

   **Attachment:** `cartscope-launch-0.1.2.zip`. Unzip it, open `chrome://extensions`, enable Developer mode, choose Load unpacked, and select the folder containing `manifest.json`. Pin CartScope, open an individual product page, click its icon, choose Capture this page, review the details, and save.

   The package has 18 runtime files and passes local manifest, integrity and automated behavior checks. Fresh Chrome execution and downloaded hosted-asset verification remain pending, so this is a launch candidate rather than a fully validated Store launch.

4. **Executed test cases and results**

   **Attachments in the launch packet:** `TEST_RESULTS.md`, `TEST_CASES.csv`, JUnit XML, DOM-flow JSON and the raw test log. The Node reporter records **70 passed, 0 failed, 0 skipped**, including **13 DOM flow checks**. The CSV lists 69 named leaf cases; the reporter total also counts their DOM suite container.

   Coverage includes arithmetic, matching, extraction fixtures, storage/imports, UI flows, HTTPS image protection, packaging and mocked publisher/tracker commands. Local Chrome startup is blocked; historical 0.1.1 Chrome results are separately labeled and are not claimed for 0.1.2. Live-retailer, native-notification and real-customer validation remain open.

5. **Launch marketing and feedback**

   **Included:** a ten-reference-user email draft, public announcement/social copy, reviewer instructions and two original promotional graphics. The drafts request task completion/time and 1–5 ratings, plus confusing steps, missing information and desired improvements, through the [feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml) or private email replies.

   Post-publication copy encourages independent customers to leave honest Chrome Web Store reviews. No invitations, public posts, reviews or user-study results are claimed as completed.

6. **Sprint 2.E Fielding & Support**

   [Existing GitHub issue tracker](https://github.com/qarteu/cartscope/issues) · [Board location](https://github.com/qarteu/cartscope/blob/main/docs/SPRINT_BOARD.md)

   The updated board and issue records are included in the packet, with preserved Alpha progress, six planned fielding/support stories, launch/Store gates, and explicit backlog epics for screenshot capture, price guidance and occasion folders. Online synchronization is pending authenticated publication.

**Working published Alpha demonstration:** [CartScope demo](https://qarteu.github.io/cartscope/). It uses labeled sample data and cannot capture a separate shopping tab. The prepared current candidate also includes local demo, privacy and support pages; deployment remains a separate gate.
