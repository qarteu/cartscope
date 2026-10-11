# Alpha verification record

Verified October 11, 2026. [GitHub Actions run 38174277130](https://github.com/qarteu/cartscope/actions/runs/38174277130) passed on Ubuntu with **Chrome for Testing 151.0.7922.34**. The tested runtime was commit `cdbe4690ca0fa33ee993eab07556c7d39e8fe308`.

The actual Alpha ZIP was unpacked into a clean directory and loaded by Chrome in a disposable profile. Its SHA-256 is `c8918352c29aadd755dad718e4ec23f237451bcb90514a7e25b1cf53066f7283`; the local release package matches that tested ZIP byte-for-byte. The browser test uses Chrome's real extension service worker, storage, scripting, toolbar action, and downloads.

| Check | Status | Evidence / reproduction |
| --- | --- | --- |
| Manifest, references, scoped permissions, and version | Passed | `npm run validate` |
| Behavioral tests | 59 passed, 0 failed | `npm ci` then `npm test`; core, extraction, packaging, storage, and DOM integration |
| Runtime ZIP, root manifest, CRCs, determinism, and checksum | Passed | `npm run package`; ZIP consumer tests and byte comparison with the hosted test artifact |
| Alpha ZIP loaded in real Chrome | Passed, automated | Clean unpacked release directory loaded in Chrome for Testing; toolbar permission grant tested |
| Active-tab capture and category rejection | Passed on HTTP fixtures | Access denied before toolbar click; permitted fixture capture returned Fixture Headphones / QA-100 / $99.99; category page rejected |
| Cart, comparison, watches, orders, financing, backup, escaping | Passed in real Chrome | Part of 16 passed browser checks, 0 failed; [machine-readable report](CHROME_TEST_RESULTS.json) |
| Panel layouts at 320, 380, and 480 pixels | Passed | Real Chrome document-width checks across cart, compare, alerts, orders, finance, and settings |
| Static preview persistence and sample isolation | Passed | Fresh browser profile; edits survive reload and remain separate from extension data |
| Published GitHub Pages demo | Passed | [Live demo](https://qarteu.github.io/cartscope/), HTTPS 200, four iframe navigation views, persisted quantity edits, and 390-pixel mobile layout |
| Public personal repository | Passed | [qarteu/cartscope](https://github.com/qarteu/cartscope), public source and license |
| GitHub release and downloaded asset | Publication pending | Complete after publishing the tag/assets and verifying their downloaded bytes |
| Live retailer field validation and ten reference users | Pending | [Feedback plan](FEEDBACK_PLAN.md); automated fixtures are not reference-user results |

The [Chrome report](CHROME_TEST_RESULTS.json) records all 16 checks, browser version, ZIP checksum, pre/post-toolbar capture responses, public demo response, and screenshot paths. The [DOM report](UI_TEST_RESULTS.json) separately records 12 application-flow checks using the actual UI, preview adapter, and background service. These are different test methods, not additional usability participants.

[Visuals](visuals/README.md) are actual Chrome screenshots from the passing hosted run with labeled sample data. The desktop landing screenshot shows the initial cart; the mobile landing screenshot shows an edited quantity after the persistence test. Their sample prices, stock, and order statuses are illustrative.

The hosted test resolves the earlier macOS sandbox startup blocker. It also exposed and fixed Chrome's native side-panel opening behavior, which skipped activeTab access: CartScope now handles the normal toolbar action and opens the panel from its click listener. No blanket host permission was added.

Remaining field scope: current retailer markup, manual installation on users' operating systems, and native desktop notification delivery have not been verified by these automated checks. Automatic retailer discovery, unattended polling, carrier synchronization, and provider-backed financing remain planned. Invitations and actual user feedback remain pending real participants.
