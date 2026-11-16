# CartScope — Launch Release Submission

**Team:** Kartik Malunjkar, Jake Clevenger and Eashan. **Updated:** November 15, 2026. **Build:** Launch Candidate 0.1.2 (`PREVIEW 0.1.2`).

CartScope saves checked products across stores, compares known costs, and keeps a local cart, budget, manual order records and payment schedule.

1. **Chrome Web Store listing — pending**

   No public Store listing or Google approval has been verified. The [Store submission kit](https://github.com/qarteu/cartscope/blob/main/docs/launch/README.md) includes listing copy, privacy/permission disclosures, reviewer instructions and promotional graphics. A GitHub release does not satisfy Store publication.

2. **GitHub repository, release notes and instructions**

   [Personal repository: qarteu/cartscope](https://github.com/qarteu/cartscope) · [Release notes](https://github.com/qarteu/cartscope/blob/main/CHANGELOG.md) · [Usage instructions](https://github.com/qarteu/cartscope#install-in-chrome)

   The current source and launch materials are version controlled. Original Alpha releases 0.1.0 and 0.1.1 remain available. Hosted 0.1.2 release publication is pending.

3. **Downloaded and verified locally installable ZIP**

   **Local attachment:** `cartscope-launch-0.1.2.zip`. **Hosted download verification is pending publication.**

   The actual candidate archive passed the Chrome run; its root manifest is version 0.1.2, with 18 runtime files and valid CRCs. Unzip it, open `chrome://extensions`, enable Developer mode, choose Load unpacked, and select the folder containing `manifest.json`. Pin CartScope; on a product page, click its icon, capture, review and save.

4. **Executed test cases and results**

   [Test report](https://github.com/qarteu/cartscope/blob/main/docs/launch/TEST_RESULTS.md) · [Case CSV](https://github.com/qarteu/cartscope/blob/main/docs/launch/TEST_CASES.csv) · [Raw evidence](https://github.com/qarteu/cartscope/tree/main/docs/launch/evidence) · [Chrome run](https://github.com/qarteu/cartscope/actions/runs/43777464733)

   Results: **70 Node passes** (69 named cases; 13 DOM flows included), plus **18 real Chrome checks**, with no failures. Chrome loaded the actual ZIP and exercised capture, storage and the shopping flows. Fixtures do not establish every live retailer, operating system, native notification or customer outcome.

5. **Launch marketing and feedback**

   [Ten-reference-user email](https://github.com/qarteu/cartscope/blob/main/docs/launch/REFERENCE_USER_EMAIL.md) · [Public/social announcement copy](https://github.com/qarteu/cartscope/blob/main/docs/launch/PUBLIC_ANNOUNCEMENTS.md) · [Feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml)

   Materials collect task completion/time, 1–5 ratings, confusing steps and requested improvements through the form or private replies. Post-publication copy invites voluntary honest Store reviews. **Recruitment, sending, public posting and collected feedback remain pending**; no reviews or user-study results are claimed.

6. **Sprint 2.E Fielding & Support**

   [Updated sprint board](https://github.com/qarteu/cartscope/blob/main/docs/SPRINT_BOARD.md) · [Live GitHub issue tracker](https://github.com/qarteu/cartscope/issues)

   The online tracker shows delivered work, open launch/Store gates, six planned fielding/support stories and the updated backlog. Screenshot capture, price guidance and occasion folders remain explicitly unbuilt backlog features.

**Public pages:** [Demo](https://qarteu.github.io/cartscope/) · [Privacy](https://qarteu.github.io/cartscope/privacy.html) · [Support](https://qarteu.github.io/cartscope/support.html). The demo uses labeled sample data; capture requires the installed extension.
