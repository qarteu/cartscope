# Alpha verification record

Checks performed October 11, 2026. Test outcomes describe their actual scope; they are not reference-user usability results.

| Check | Status | Reproduction / evidence |
| --- | --- | --- |
| Manifest, references, permissions, and version checks | Passed | `npm run validate` reads actual runtime files. |
| Behavioral tests | 58 passed, 0 failed | `npm ci` then `npm test`; core, extraction, packaging, storage, and DOM integration. |
| Runtime ZIP and checksum | Passed | `npm run package`; release tests consume ZIP via unzip/Python zipfile; root manifest, CRCs, SHA-256 verified. |
| Chrome installation from ZIP | Unverified | Real Load unpacked smoke test remains a release tracker task. |
| Product capture on a real retailer page | Unverified | Extractor tested with generic and retailer-shaped fixture DOMs; current live markup requires field testing. |
| Save/cart/compare/history/watch/order/settings flows | 12 passed flow checks in DOM simulation | [UI results](UI_TEST_RESULTS.json); actual app.js, preview.js and background.js execute with Happy DOM. |
| Real Chrome automated smoke test | Blocked before browser checks | `npm run test:browser`; [Chrome record](CHROME_TEST_RESULTS.json). macOS aborts isolated Chrome startup with SIGABRT and application registration/process permission errors, including approved retries. |
| Static demo build | Passed | `npm run build:demo`; static site uses shared runtime and no AWS credentials. |
| Published repository and release links | Pending | Verify repository, tag, asset download, and release notes |
| Reference-user field validation | Pending | Actual tester results from [feedback plan](FEEDBACK_PLAN.md) |

DOM simulation verifies event handlers, cart edits, cost presentation, watch transitions, order edits, payment schedules, data controls, escaping, atomic imports, and sample isolation. It does not verify CSS layout in Chrome, activeTab grants, side-panel lifecycle, OS notification delivery, or browser downloads. Rendered interface previews are visual artifacts from the actual serialized sample UI, not browser screenshots or proof of Chrome compatibility.

Automatic retailer discovery, unattended polling, carrier synchronization, and provider-backed financing are not configured in Alpha. Unknown data remains unknown. Invitations and usability results remain pending real participants.
