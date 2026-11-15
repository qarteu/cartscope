# CartScope 0.1.2: executed test cases and results

Prepared November 14, 2026 (America/Los_Angeles). This report distinguishes current candidate checks from historical Alpha Chrome evidence and pending customer validation.

## Current candidate evidence

- Command: `node scripts/verify-launch.mjs` runs `npm run check` and retains the actual output and JUnit report.
- Node runtime: `v26.3.0`. Run finished `2026-11-15T03:18:16.273Z` (UTC).
- **Node reporter: 70 tests, 70 passed, 0 failed, 0 skipped.**
- JUnit contains 69 named leaf cases; the Node total also counts the DOM suite container. These are two representations of the same run, not additional tests.
- The 13 Happy DOM application flows are included in the Node total. They are simulated DOM checks, not Chrome or user-study participants.
- ZIP: `cartscope-launch-0.1.2.zip`; 18 runtime files; root Manifest V3 version `0.1.2`; every CRC passed.
- SHA-256: `a36de3df01656c062e5000b7bd2fb0a7b46d11d61d11bcb9be5393f7a18d24d0`. The ZIP is locally prepared; no hosted 0.1.2 download or Store installation is claimed.

Raw evidence: [Node log](evidence/node-check-0.1.2.txt), [JUnit cases/results](evidence/node-results-0.1.2.xml), [DOM flow results](evidence/dom-results-0.1.2.json), [run metadata](evidence/verification-0.1.2.json). Download [all named cases as CSV](TEST_CASES.csv).

## Methods and coverage

| Method | What ran | Current outcome |
| --- | --- | --- |
| Pure decision helpers | Safe URLs/images, product validation and matching, cost/discount/tax/cashback arithmetic, ranking, alerts and payment dates/rounding | Passed in Node |
| Product extraction | Bundled extractor executed against deterministic JSON-LD, metadata and retailer-shaped fixtures; category/ambiguous/hostile input rejection | Passed in Node; no claim about every current retailer |
| Storage/background consumer | Actual message consumer with controlled Chrome storage/API doubles; quantities, dates, watches, imports, backup provenance, atomic rejection and HTTPS image normalization | Passed in Node |
| Application flows | Actual UI event handlers and preview/background adapter in Happy DOM; saving/editing, comparisons, alerts, orders, planner, backups and hostile inputs | Passed in DOM simulation |
| Packaging/validation | Actual ZIP consumer and manifest validation; deterministic archives, launch channel, local references, limited permissions, previous archive preservation | Passed |
| Publisher/tracker contracts | Actual publisher with isolated mock gh/git/npm; tag/asset/note selection, non-overwrite behavior, stable issue IDs and label reconciliation | Passed; does not perform actual publication |
| Current candidate in real Chrome | Local Chrome process aborted during startup (SIGABRT); no UI checks or new screenshots were produced | Blocked; hosted run still needed |
| Current GitHub download and Store installation | Requires actual candidate publication, downloaded-byte verification and Store approval/installation | Pending |
| Customer validation | Ten-user task completion/time, 1–5 ratings and written feedback; real store/platform/native notification checks | Pending real participants |

## Browser scope

The retained [local browser attempt](evidence/local-browser-results-0.1.2.json) stopped at browser startup. It records a prior same-version candidate ZIP hash and the startup error; it does not validate this final candidate archive. The current browser harness is ready to unpack the configured ZIP, exercise its service worker/toolbar/storage and all principal UI flows, check HTTP-image rejection, test narrow layouts, and capture five unmodified 1280×800 Store screenshots. Run it on a supported host before closing REL-10.

Historical Alpha 0.1.1 [Chrome results](../CHROME_TEST_RESULTS.json) and [screenshots](../visuals/README.md) remain available with their own version/hash/run. They are not relabeled as 0.1.2 results.

## Reproduce

Use Node 22 or newer, run `npm ci`, then `node scripts/verify-launch.mjs`. For real Chrome, run `npx playwright install --with-deps chromium` and `PUBLIC_DEMO_URL=https://qarteu.github.io/cartscope/ npm run test:browser` on a host that can launch Chrome. The hosted-demo assertion requires that the same candidate version has actually been deployed first. Omit PUBLIC_DEMO_URL only for an explicitly local run; the report then states that public-demo coverage was skipped.

## Named executed cases

Each row below corresponds to an actual JUnit case. The test definition is the assertion source; expected behavior is described by the executed scenario name.

| Case | Test definition | Executed scenario / expected behavior | Actual result |
| --- | --- | --- | --- |
| AUTO-001 | [core.test.mjs](../../tests/core.test.mjs) | safeUrl preserves ordinary HTTP URLs and rejects active or credentialed URLs | passed |
| AUTO-002 | [core.test.mjs](../../tests/core.test.mjs) | product images allow HTTPS and only bundled product illustrations while shopping links retain HTTP | passed |
| AUTO-003 | [core.test.mjs](../../tests/core.test.mjs) | money formats finite non-negative amounts without unsafe or invalid strings | passed |
| AUTO-004 | [core.test.mjs](../../tests/core.test.mjs) | normalizeProduct returns a stable validated data record without arbitrary fields | passed |
| AUTO-005 | [core.test.mjs](../../tests/core.test.mjs) | normalizeProduct rejects absent, malformed, negative, infinite, and invalid quantity data | passed |
| AUTO-006 | [core.test.mjs](../../tests/core.test.mjs) | brand and model match tolerates punctuation but refuses any known variant conflict | passed |
| AUTO-007 | [core.test.mjs](../../tests/core.test.mjs) | barcode identity validates check digits and does not override conflicting or missing variants | passed |
| AUTO-008 | [core.test.mjs](../../tests/core.test.mjs) | condition is never guessed and new or used inventory cannot be promoted as the same offer | passed |
| AUTO-009 | [core.test.mjs](../../tests/core.test.mjs) | cost separates checkout obligation from cashback using an independent cents calculation | passed |
| AUTO-010 | [core.test.mjs](../../tests/core.test.mjs) | unknown shipping prevents a ranked total instead of becoming free shipping | passed |
| AUTO-011 | [core.test.mjs](../../tests/core.test.mjs) | malformed cost values and mixed currencies cannot produce a valid total | passed |
| AUTO-012 | [core.test.mjs](../../tests/core.test.mjs) | ranking excludes cheap mismatches from best position and preserves deterministic ties | passed |
| AUTO-013 | [core.test.mjs](../../tests/core.test.mjs) | each priority actually changes eligible ordering, with pickup alias supported | passed |
| AUTO-014 | [core.test.mjs](../../tests/core.test.mjs) | payment schedule totals full obligation and allocates rounding cents exactly | passed |
| AUTO-015 | [core.test.mjs](../../tests/core.test.mjs) | payment schedule handles zero amount and UTC leap days | passed |
| AUTO-016 | [core.test.mjs](../../tests/core.test.mjs) | payment schedule rejects misleading or malformed financing terms | passed |
| AUTO-017 | [core.test.mjs](../../tests/core.test.mjs) | price alerts require an opted-in watch | passed |
| AUTO-018 | [core.test.mjs](../../tests/core.test.mjs) | alert transitions do not fire for initial, unchanged, mismatched, disabled, or invalid observations | passed |
| AUTO-019 | [core.test.mjs](../../tests/core.test.mjs) | restock alert requires known out-of-stock transition, and sample events are explicitly labelled | passed |
| AUTO-020 | [core.test.mjs](../../tests/core.test.mjs) | price history only claims a recorded range, ignores invalid points, and keeps currencies separate | passed |
| AUTO-021 | [extract.test.mjs](../../tests/extract.test.mjs) | classic injected script captures a graph Product with usable complete identity | passed |
| AUTO-022 | [extract.test.mjs](../../tests/extract.test.mjs) | a category page cannot silently save its first recommended product | passed |
| AUTO-023 | [extract.test.mjs](../../tests/extract.test.mjs) | multiple products require a single current-page or mainEntity match | passed |
| AUTO-024 | [extract.test.mjs](../../tests/extract.test.mjs) | Amazon product page selector fallback captures the displayed amount without page writes | passed |
| AUTO-025 | [extract.test.mjs](../../tests/extract.test.mjs) | OpenGraph supports generic product pages and does not treat a website title as a product | passed |
| AUTO-026 | [extract.test.mjs](../../tests/extract.test.mjs) | retailer product fallback and displayed prices work for the supported selector adapters | passed |
| AUTO-027 | [extract.test.mjs](../../tests/extract.test.mjs) | invalid metadata falls back only when a genuine product page and price are available | passed |
| AUTO-028 | [extract.test.mjs](../../tests/extract.test.mjs) | ambiguous offer prices, aggregates, and hostile price strings are rejected | passed |
| AUTO-029 | [extract.test.mjs](../../tests/extract.test.mjs) | multiple offer prices can be resolved only by the currently displayed price or exact offer URL | passed |
| AUTO-030 | [extract.test.mjs](../../tests/extract.test.mjs) | graph Offer references are resolved from the same page metadata | passed |
| AUTO-031 | [extract.test.mjs](../../tests/extract.test.mjs) | published new, used, and refurbished conditions are captured without an invented default | passed |
| AUTO-032 | [extract.test.mjs](../../tests/extract.test.mjs) | active image and canonical URL payloads cannot escape as executable extension links | passed |
| AUTO-033 | [extract.test.mjs](../../tests/extract.test.mjs) | empty, absent, and repeated scripts produce deterministic results without invented product data | passed |
| AUTO-034 | [publish.test.mjs](../../tests/publish.test.mjs) | publisher command contract derives the patch tag, asset paths, and isolated notes (mock CLIs) | passed |
| AUTO-035 | [publish.test.mjs](../../tests/publish.test.mjs) | repeated publication verifies identical assets without tagging or uploading (mock CLIs) | passed |
| AUTO-036 | [publish.test.mjs](../../tests/publish.test.mjs) | different assets at an existing version stop publication without replacement (mock CLIs) | passed |
| AUTO-037 | [publish.test.mjs](../../tests/publish.test.mjs) | tracker synchronization preserves issue IDs and unrelated labels when sprint scope changes | passed |
| AUTO-038 | [release.test.mjs](../../tests/release.test.mjs) | configured package, npm lock, and installed manifest use the same release version | passed |
| AUTO-039 | [release.test.mjs](../../tests/release.test.mjs) | launch channel creates the actual launch ZIP with the same installable root | passed |
| AUTO-040 | [release.test.mjs](../../tests/release.test.mjs) | release ZIP is consumed by unzip, contains runtime root only, and is deterministic | passed |
| AUTO-041 | [release.test.mjs](../../tests/release.test.mjs) | validator rejects version drift and excessive permissions | passed |
| AUTO-042 | [release.test.mjs](../../tests/release.test.mjs) | packaging a version patch preserves the previous release archive and checksum | passed |
| AUTO-043 | [release.test.mjs](../../tests/release.test.mjs) | release notes select only the exact current version and reject missing, duplicate, or empty sections | passed |
| AUTO-044 | [release.test.mjs](../../tests/release.test.mjs) | validator rejects missing paths, inline scripts, remote stylesheets, and empty manifests | passed |
| AUTO-045 | [release.test.mjs](../../tests/release.test.mjs) | ordinary import action strings are accepted while remote static and dynamic imports fail | passed |
| AUTO-046 | [storage.test.mjs](../../tests/storage.test.mjs) | toolbar click opens the clicked window panel synchronously after native action behavior is disabled | passed |
| AUTO-047 | [storage.test.mjs](../../tests/storage.test.mjs) | quantity changes reject fractions and preserve the existing cart | passed |
| AUTO-048 | [storage.test.mjs](../../tests/storage.test.mjs) | orders reject fractional quantities and impossible calendar dates | passed |
| AUTO-049 | [storage.test.mjs](../../tests/storage.test.mjs) | imports reject numeric or mismatched ID types instead of creating invisible offers | passed |
| AUTO-050 | [storage.test.mjs](../../tests/storage.test.mjs) | imports reject IDs that would collide after truncation | passed |
| AUTO-051 | [storage.test.mjs](../../tests/storage.test.mjs) | sample backups cannot enter the real workspace | passed |
| AUTO-052 | [storage.test.mjs](../../tests/storage.test.mjs) | sample defaults mark the workspace and products as illustrative data | passed |
| AUTO-053 | [storage.test.mjs](../../tests/storage.test.mjs) | real backup roundtrip preserves links, observations and watches while clearing alerts | passed |
| AUTO-054 | [storage.test.mjs](../../tests/storage.test.mjs) | a malformed later record aborts an import without partially replacing existing data | passed |
| AUTO-055 | [storage.test.mjs](../../tests/storage.test.mjs) | unknown required membership cost stays unknown rather than becoming free | passed |
| AUTO-056 | [storage.test.mjs](../../tests/storage.test.mjs) | saved and imported product images reject HTTP while preserving deliberate HTTP shopping links | passed |
| AUTO-057 | [ui.test.mjs](../../tests/ui.test.mjs) | Sample cart and every principal view render through actual app event handlers | passed |
| AUTO-058 | [ui.test.mjs](../../tests/ui.test.mjs) | Sample mutations persist locally and do not leak into the empty workspace | passed |
| AUTO-059 | [ui.test.mjs](../../tests/ui.test.mjs) | Manual add, item quantity, editing, and saved-for-later use the same background service | passed |
| AUTO-060 | [ui.test.mjs](../../tests/ui.test.mjs) | Fractional quantities are rejected and rendered values recover after the failed change | passed |
| AUTO-061 | [ui.test.mjs](../../tests/ui.test.mjs) | Checked offers rank exact variants while missing costs and conflicts remain visible | passed |
| AUTO-062 | [ui.test.mjs](../../tests/ui.test.mjs) | Watch settings produce price-drop and restock transitions and avoid duplicate alerts | passed |
| AUTO-063 | [ui.test.mjs](../../tests/ui.test.mjs) | Manual order creation and delivery status edits persist safe tracking details | passed |
| AUTO-064 | [ui.test.mjs](../../tests/ui.test.mjs) | Payment planner renders full obligation, calendar dates, and exact remainder cents | passed |
| AUTO-065 | [ui.test.mjs](../../tests/ui.test.mjs) | Preferences save and backup export serializes the real workspace | passed |
| AUTO-066 | [ui.test.mjs](../../tests/ui.test.mjs) | Imported and legacy HTTP images use the bundled fallback without changing HTTP shopping links | passed |
| AUTO-067 | [ui.test.mjs](../../tests/ui.test.mjs) | Hostile user text and active URLs cannot become injected product UI | passed |
| AUTO-068 | [ui.test.mjs](../../tests/ui.test.mjs) | Malformed imports leave current data intact and sample backups remain isolated | passed |
| AUTO-069 | [ui.test.mjs](../../tests/ui.test.mjs) | Removing a product deletes its related offers, history, alerts, and orders | passed |

## Pending field-acceptance cases

| Case | Procedure and expected result | Status |
| --- | --- | --- |
| FIELD-01 | Install the final ZIP on a reference user’s supported Chrome/OS; toolbar opens the panel and real workspace starts empty | Not run |
| FIELD-02 | Install from the approved public Store listing; confirm version, permission prompts and update behavior | Not run; listing pending |
| FIELD-03 | On a permitted current retailer listing, capture and compare displayed name/price/variant/condition; report correction rate with actual denominators | Not run |
| FIELD-04 | Enable optional desktop notifications and trigger an observed watched change; confirm native OS delivery | Not run |
| FIELD-05 | Ten consenting users attempt the defined tasks; retain task outcomes/time, ratings and written comments separately from automated checks | Not run |
