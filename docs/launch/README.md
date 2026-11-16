# CartScope launch packet

Prepared November 14, 2026; current Chrome verification and public pages verified November 15, 2026. These are submission materials and unsent launch drafts. They do not establish that a Chrome Web Store listing is live, that any outreach was sent, or that users left reviews.

**Published GitHub prerelease:** [CartScope Launch Candidate 0.1.2](https://github.com/qarteu/cartscope/releases/tag/v0.1.2). [Download the runtime ZIP](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-launch-0.1.2.zip) · [Checksum](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-launch-0.1.2.zip.sha256) · [Download the Store upload kit](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-webstore-kit-0.1.2.zip).

**Final submission attachment:** [cartscope-launch-submission-0.1.2.zip](https://github.com/qarteu/cartscope/releases/download/v0.1.2/cartscope-launch-submission-0.1.2.zip). The hosted attachment was downloaded and verified: 127 entries, clean CRCs, 126 matching file hashes, and the exact tested runtime ZIP. It includes a source-snapshot board; later status updates are in the live tracker.

| Material | Use |
| --- | --- |
| [Six-item Canvas submission](CANVAS_SUBMISSION.md) | Concise copy with actual completion/pending status for each requirement |
| [Web Store setup and upload guide](WEBSTORE_SETUP.md) | Registration, account setup, exact upload files and review steps |
| [Store listing](STORE_LISTING.md) | Copy for the listing, feature boundaries, and links |
| [Permissions and disclosures](PERMISSIONS_AND_DISCLOSURES.md) | Single purpose, permission explanations, and privacy dashboard mapping |
| [Privacy policy](PRIVACY_POLICY.md) | Public policy text to publish at the final policy URL |
| [Reviewer instructions](REVIEWER_INSTRUCTIONS.md) | Reproducible sample, capture, and local data checks; no account needed |
| [Reference-user email](REFERENCE_USER_EMAIL.md) | Ten individual invitations with task outcomes, ratings, and written feedback |
| [Public announcements](PUBLIC_ANNOUNCEMENTS.md) | Separate pre-Store and post-publication copy; optional honest review request |
| [Executed test cases and results](TEST_RESULTS.md) | Current Node/DOM results, ZIP checks, raw logs, and explicit Chrome/field gaps |
| [Launch metadata](launch-metadata.json) | Explicit unresolved publication fields |
| [Promotional assets](assets/README.md) | Original brand artwork; no invented interface screenshots |

**CartScope Launch Candidate 0.1.2** is published as a GitHub prerelease, with the visible **PREVIEW 0.1.2** badge and package `artifacts/cartscope-launch-0.1.2.zip`. The exact runtime ZIP passed local checks and 18 hosted Chrome checks. The hosted runtime and checksum were then downloaded and verified: 18 runtime files, root manifest 0.1.2, valid CRCs, and SHA-256 `a36de3df01656c062e5000b7bd2fb0a7b46d11d61d11bcb9be5393f7a18d24d0`, matching the Chrome-tested bytes. Release tag `v0.1.2` resolves to source commit `78d2602b654628c2269ba57ce064c06c07b5174c`. Store submission, approval, and Store installation remain separate open gates. The [launch metadata](launch-metadata.json) records those distinctions.

## Publication fields to complete

- **Chrome Web Store URL:** pending. There is no Store URL to put in an announcement yet.
- **Store item ID and publication status:** pending verification in the publisher dashboard.
- **Runtime ZIP:** published and downloaded successfully; its hash and archive checks match the tested package. See [test results](TEST_RESULTS.md). The final documentation packet is also published and download-verified under REL-15.
- **Public policy:** https://qarteu.github.io/cartscope/privacy.html; **support:** https://qarteu.github.io/cartscope/support.html. Both pages are deployed and returned HTTPS 200 with the current version.
- **Publisher name and contact:** use the actual publisher account; no invented organization or email address.
- **Ten reference-user identities, invitation dates, and responses:** pending actual recruitment and delivery records. Keep personal contact details private.

All 45 issue records are already published in the [GitHub tracker](https://github.com/qarteu/cartscope/issues), with links in [the issue map](../PUBLISHED_ISSUES.md). REL-10 and REL-11 are complete. REL-15 is complete: the final attachment is published and download-verified, and current issue statuses/labels are reconciled. Chrome Developer mode is confirmed for local installation; Chrome Web Store publisher registration and submission are still required.

Before Store submission, compare the final manifest, runtime, policy, and dashboard disclosures. The Store title should match the manifest name. Use the existing verified 0.1.2 runtime ZIP and [current Chrome screenshots](assets/screenshots/README.md), check the live policy/support links, and follow the [publisher setup guide](WEBSTORE_SETUP.md). Do not move the existing release tag or replace its runtime; runtime changes require a new version. These documents make no claim of Google approval.

Use the post-publication announcement only after opening the actual Store listing without a signed-in publisher session. Reviews must be optional and reflect real use. Do not ask for a star rating, offer rewards, screen out critical reviewers, or submit a review for someone else. Google's policy prohibits manipulating ratings, reviews, and installs. [Chrome Web Store Spam and Abuse policy](https://developer.chrome.com/docs/webstore/program-policies/spam-and-abuse).
