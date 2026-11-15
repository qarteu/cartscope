#!/usr/bin/env python3
"""Build readable current-candidate test results from executed evidence, not expectations."""
from pathlib import Path
import csv, hashlib, json, xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
pkg=json.loads((ROOT/'package.json').read_text()); version=pkg['version']
evidence=ROOT/'docs/launch/evidence'
record=json.loads((evidence/f'verification-{version}.json').read_text())
archive=ROOT/record['archive']
sha=hashlib.sha256(archive.read_bytes()).hexdigest()
if record['version']!=version or record['exitCode']!=0 or record['failed'] or record['sha256']!=sha:
 raise SystemExit('Current ZIP and executed passing Node evidence must match.')
xml=ET.parse(evidence/f'node-results-{version}.xml').getroot()
cases=list(xml.iter('testcase'))
if any(c.find('failure') is not None or c.find('error') is not None for c in cases):
 raise SystemExit('JUnit failures cannot be labeled passed.')
ui=json.loads((evidence/f'dom-results-{version}.json').read_text())
rows=[]
for index,case in enumerate(cases,1):
 filename=Path(case.attrib.get('file','')).name
 result='skipped' if case.find('skipped') is not None else 'passed'
 rows.append([f'AUTO-{index:03}',filename,case.attrib['name'],result,case.attrib.get('time','')])
with (ROOT/'docs/launch/TEST_CASES.csv').open('w',newline='') as f:
 writer=csv.writer(f);writer.writerow(['case_id','test_file','executed_scenario_and_assertions','actual_result','seconds']);writer.writerows(rows)
meta_path=ROOT/'docs/launch/launch-metadata.json';meta=json.loads(meta_path.read_text())
meta.update(submission_sha256=sha,package_verification_status='Local Node/DOM and ZIP checks passed; current-archive real Chrome verification pending',automated_test_report='docs/launch/TEST_RESULTS.md',automated_run=record['finishedAt'],node_tests_passed=record['passed'],node_named_leaf_cases=len(cases),node_tests_failed=record['failed'],dom_flow_checks_included=ui['passed'],current_browser_verification='pending')
meta.setdefault('github_candidate_publication','pending authenticated publication')
meta.setdefault('tracker_online_sync','pending authenticated publication')
meta_path.write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n')
lines=[f'# CartScope {version}: executed test cases and results','',
'Prepared November 14, 2026 (America/Los_Angeles). This report distinguishes current candidate checks from historical Alpha Chrome evidence and pending customer validation.','',
'## Current candidate evidence','',
f'- Command: `node scripts/verify-launch.mjs` runs `npm run check` and retains the actual output and JUnit report.',
f'- Node runtime: `{record["node"]}`. Run finished `{record["finishedAt"]}` (UTC).',
f'- **Node reporter: {record["tests"]} tests, {record["passed"]} passed, {record["failed"]} failed, {record["skipped"]} skipped.**',
f'- JUnit contains {len(cases)} named leaf cases; the Node total also counts the DOM suite container. These are two representations of the same run, not additional tests.',
f'- The {ui["passed"]} Happy DOM application flows are included in the Node total. They are simulated DOM checks, not Chrome or user-study participants.',
f'- ZIP: `{archive.name}`; {record["runtimeFiles"]} runtime files; root Manifest V3 version `{record["manifestVersion"]}`; every CRC passed.',
f'- SHA-256: `{sha}`. The ZIP is locally prepared; no hosted 0.1.2 download or Store installation is claimed.','',
'Raw evidence: [Node log](evidence/node-check-'+version+'.txt), [JUnit cases/results](evidence/node-results-'+version+'.xml), [DOM flow results](evidence/dom-results-'+version+'.json), [run metadata](evidence/verification-'+version+'.json). Download [all named cases as CSV](TEST_CASES.csv).','',
'## Methods and coverage','',
'| Method | What ran | Current outcome |',
'| --- | --- | --- |',
'| Pure decision helpers | Safe URLs/images, product validation and matching, cost/discount/tax/cashback arithmetic, ranking, alerts and payment dates/rounding | Passed in Node |',
'| Product extraction | Bundled extractor executed against deterministic JSON-LD, metadata and retailer-shaped fixtures; category/ambiguous/hostile input rejection | Passed in Node; no claim about every current retailer |',
'| Storage/background consumer | Actual message consumer with controlled Chrome storage/API doubles; quantities, dates, watches, imports, backup provenance, atomic rejection and HTTPS image normalization | Passed in Node |',
'| Application flows | Actual UI event handlers and preview/background adapter in Happy DOM; saving/editing, comparisons, alerts, orders, planner, backups and hostile inputs | Passed in DOM simulation |',
'| Packaging/validation | Actual ZIP consumer and manifest validation; deterministic archives, launch channel, local references, limited permissions, previous archive preservation | Passed |',
'| Publisher/tracker contracts | Actual publisher with isolated mock gh/git/npm; tag/asset/note selection, non-overwrite behavior, stable issue IDs and label reconciliation | Passed; does not perform actual publication |',
'| Current candidate in real Chrome | Local Chrome process aborted during startup (SIGABRT); no UI checks or new screenshots were produced | Blocked; hosted run still needed |',
'| Current GitHub download and Store installation | Requires actual candidate publication, downloaded-byte verification and Store approval/installation | Pending |',
'| Customer validation | Ten-user task completion/time, 1–5 ratings and written feedback; real store/platform/native notification checks | Pending real participants |','',
'## Browser scope','',
'The retained [local browser attempt](evidence/local-browser-results-'+version+'.json) stopped at browser startup. It records a prior same-version candidate ZIP hash and the startup error; it does not validate this final candidate archive. The current browser harness is ready to unpack the configured ZIP, exercise its service worker/toolbar/storage and all principal UI flows, check HTTP-image rejection, test narrow layouts, and capture five unmodified 1280×800 Store screenshots. Run it on a supported host before closing REL-10.','',
'Historical Alpha 0.1.1 [Chrome results](../CHROME_TEST_RESULTS.json) and [screenshots](../visuals/README.md) remain available with their own version/hash/run. They are not relabeled as 0.1.2 results.','',
'## Reproduce','',
'Use Node 22 or newer, run `npm ci`, then `node scripts/verify-launch.mjs`. For real Chrome, run `npx playwright install --with-deps chromium` and `PUBLIC_DEMO_URL=https://qarteu.github.io/cartscope/ npm run test:browser` on a host that can launch Chrome. The hosted-demo assertion requires that the same candidate version has actually been deployed first. Omit PUBLIC_DEMO_URL only for an explicitly local run; the report then states that public-demo coverage was skipped.','',
'## Named executed cases','',
'Each row below corresponds to an actual JUnit case. The test definition is the assertion source; expected behavior is described by the executed scenario name.','',
'| Case | Test definition | Executed scenario / expected behavior | Actual result |',
'| --- | --- | --- | --- |']
for case_id,file,name,result,_ in rows:
 lines.append(f'| {case_id} | [{file}](../../tests/{file}) | {name.replace("|","/")} | {result} |')
lines += ['', '## Pending field-acceptance cases','',
'| Case | Procedure and expected result | Status |','| --- | --- | --- |',
'| FIELD-01 | Install the final ZIP on a reference user’s supported Chrome/OS; toolbar opens the panel and real workspace starts empty | Not run |',
'| FIELD-02 | Install from the approved public Store listing; confirm version, permission prompts and update behavior | Not run; listing pending |',
'| FIELD-03 | On a permitted current retailer listing, capture and compare displayed name/price/variant/condition; report correction rate with actual denominators | Not run |',
'| FIELD-04 | Enable optional desktop notifications and trigger an observed watched change; confirm native OS delivery | Not run |',
'| FIELD-05 | Ten consenting users attempt the defined tasks; retain task outcomes/time, ratings and written comments separately from automated checks | Not run |','']
(ROOT/'docs/launch/TEST_RESULTS.md').write_text('\n'.join(lines))
print(f'Generated {len(cases)} named-case rows; {record["tests"]} Node-reporter tests, {ui["passed"]} DOM flows included; current Chrome and field gates remain pending.')
