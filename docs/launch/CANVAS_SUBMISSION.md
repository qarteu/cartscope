# CartScope — Launch Release Submission

**Team:** Kartik Malunjkar, Jake Clevenger and Eashan. **Updated:** November 15, 2026. **Build:** Launch Candidate 0.1.2 (`PREVIEW 0.1.2`).

CartScope saves checked products across stores, compares known costs, and keeps a local cart, budget, manual order records and payment schedule.

1. **Chrome Web Store listing — pending**

   Current distribution uses Chrome’s Developer mode. **Store submission and Google review are pending; no public Store URL has been verified.** The [setup instructions](https://github.com/qarteu/cartscope/blob/main/docs/launch/WEBSTORE_SETUP.md) and [downloadable Store kit](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-webstore-kit-0.1.2.zip) provide upload steps, listing copy, privacy/permission disclosures, reviewer instructions and screenshots.

2. **GitHub repository, release notes and instructions**

   [Personal repository: qarteu/cartscope](https://github.com/qarteu/cartscope) · [0.1.2 release notes](https://github.com/qarteu/cartscope/releases/tag/v0.1.2) · [Usage instructions](https://github.com/qarteu/cartscope#install-in-chrome)

   The current source and launch materials are version controlled. Original Alpha releases 0.1.0 and 0.1.1 remain available.

3. **Downloaded and verified locally installable ZIP**

   [Download cartscope-launch-0.1.2.zip](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-launch-0.1.2.zip)

   The downloaded archive matches the Chrome-tested package; its root manifest is version 0.1.2, with 18 runtime files and valid CRCs. Unzip it, open `chrome://extensions`, enable Developer mode, choose Load unpacked, and select the folder containing `manifest.json`. Pin CartScope; on a product page, click its icon, capture, review and save.

4. **Executed test cases and results**

   [Test report](https://github.com/qarteu/cartscope/blob/main/docs/launch/TEST_RESULTS.md) · [Case CSV](https://github.com/qarteu/cartscope/blob/main/docs/launch/TEST_CASES.csv) · [Raw evidence](https://github.com/qarteu/cartscope/tree/main/docs/launch/evidence) · [Chrome run](https://github.com/qarteu/cartscope/actions/runs/43778186951)

   Results: **70 Node passes** (69 named cases; 13 DOM flows included), plus **18 real Chrome checks**, with no failures. Chrome loaded the actual ZIP and exercised capture, storage and the shopping flows. Fixtures do not establish every live retailer, operating system, native notification or customer outcome.

5. **Launch marketing and feedback**

   [Ten-reference-user email](https://github.com/qarteu/cartscope/blob/main/docs/launch/REFERENCE_USER_EMAIL.md) · [Public/social announcement copy](https://github.com/qarteu/cartscope/blob/main/docs/launch/PUBLIC_ANNOUNCEMENTS.md) · [Feedback form](https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml)

   Materials collect task completion/time, 1–5 ratings, confusing steps and requested improvements through the form or private replies. Post-publication copy invites voluntary honest Store reviews. **Recruitment, sending, public posting and collected feedback remain pending**; no reviews or user-study results are claimed.

6. **Sprint 2.E Fielding & Support**

   [Updated sprint board](https://github.com/qarteu/cartscope/blob/main/docs/SPRINT_BOARD.md) · [Live GitHub issue tracker](https://github.com/qarteu/cartscope/issues)

   The online tracker shows delivered work, open launch/Store gates, six planned fielding/support stories and the updated backlog. Screenshot capture, price guidance and occasion folders remain explicitly unbuilt backlog features.

**Public pages:** [Demo](https://qarteu.github.io/cartscope/) · [Privacy](https://qarteu.github.io/cartscope/privacy.html) · [Support](https://qarteu.github.io/cartscope/support.html). The demo uses labeled sample data; capture requires the installed extension.
