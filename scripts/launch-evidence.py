#!/usr/bin/env python3
"""Build readable current-candidate test results from executed evidence, not expectations."""
from pathlib import Path
import csv, hashlib, json, math, re, struct, xml.etree.ElementTree as ET
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
browser_path=evidence/f'browser-results-{version}.json'
browser=json.loads(browser_path.read_text()) if browser_path.exists() else None
browser_rows=[]; screenshots=[]; hosted_run={}; hosted_cases=[]
browser_status='pending'
if browser is not None:
 release=browser.get('release',{})
 if release.get('version')!=version or release.get('path')!=record['archive'] or release.get('sha256')!=sha:
  raise SystemExit('Current ZIP and hosted browser evidence must match version, archive path, and SHA-256.')
 checks=browser.get('checks')
 if not isinstance(checks,list) or not checks:
  raise SystemExit('Browser evidence must contain actual executed checks.')
 names=set()
 for index,check in enumerate(checks,1):
  name=check.get('name'); status=check.get('status'); duration=check.get('durationMs')
  if not isinstance(name,str) or not name.strip() or name in names or status not in ('passed','failed') or isinstance(duration,bool) or not isinstance(duration,(int,float)) or not math.isfinite(duration) or duration<0:
   raise SystemExit('Browser evidence contains malformed or duplicated executed checks.')
  names.add(name)
  browser_rows.append([f'BROWSER-{index:03}','browser.mjs',name,status,f'{duration/1000:.3f}'])
 passed=sum(row[3]=='passed' for row in browser_rows); failed=sum(row[3]=='failed' for row in browser_rows)
 browser_status=browser.get('status')
 if browser.get('passed')!=passed or browser.get('failed')!=failed or browser_status not in ('passed','failed','blocked'):
  raise SystemExit('Browser summary counts/status disagree with actual executed checks.')
 if browser_status=='passed' and (failed or not browser.get('browser') or browser.get('errors')!=[]):
  raise SystemExit('Failed or incomplete browser evidence cannot be labeled passed.')
 run_path=evidence/'hosted-run.json'
 if run_path.exists():
  hosted_run=json.loads(run_path.read_text())
  run_id=hosted_run.get('id',hosted_run.get('databaseId'))
  run_url=hosted_run.get('html_url',hosted_run.get('url'))
  head_sha=hosted_run.get('head_sha',hosted_run.get('headSha'))
  if run_url!=f'https://github.com/qarteu/cartscope/actions/runs/{run_id}' or not re.fullmatch('[a-f0-9]{40}',head_sha or ''):
   raise SystemExit('Hosted run provenance must identify the CartScope run and source commit.')
  hosted_run={'id':run_id,'url':run_url,'headSha':head_sha,'status':hosted_run.get('status'),'conclusion':hosted_run.get('conclusion')}
 hosted_xml=evidence/f'hosted-node-results-{version}.xml'
 if hosted_xml.exists():
  hosted_cases=list(ET.parse(hosted_xml).getroot().iter('testcase'))
  if any(c.find('failure') is not None or c.find('error') is not None for c in hosted_cases):
   raise SystemExit('Hosted JUnit failures cannot be labeled passed.')
 for image in browser.get('storeScreenshots',[]):
  path=ROOT/'docs/launch/assets/screenshots'/Path(image.get('path','')).name
  if not path.is_file():
   raise SystemExit(f'Copied Store-size screenshot missing: {path.name}')
  data=path.read_bytes()
  if len(data)<24 or data[:8]!=b'\x89PNG\r\n\x1a\n':
   raise SystemExit(f'Store-size evidence must be PNG: {path.name}')
  dimensions=struct.unpack('>II',data[16:24])
  if dimensions!=(1280,800) or (image.get('width'),image.get('height'))!=dimensions or image.get('source')!='installed-extension-page':
   raise SystemExit(f'Store-size screenshot dimensions/source disagree: {path.name}')
  screenshots.append((path.name,image.get('view',''),*dimensions))
rows=[]
for index,case in enumerate(cases,1):
 filename=Path(case.attrib.get('file','')).name
 result='skipped' if case.find('skipped') is not None else 'passed'
 rows.append([f'AUTO-{index:03}',filename,case.attrib['name'],result,case.attrib.get('time','')])
with (ROOT/'docs/launch/TEST_CASES.csv').open('w',newline='') as f:
 writer=csv.writer(f,lineterminator="\n");writer.writerow(['case_id','test_file','executed_scenario_and_assertions','actual_result','seconds']);writer.writerows(rows+browser_rows)
meta_path=ROOT/'docs/launch/launch-metadata.json';meta=json.loads(meta_path.read_text())
package_status='Local Node/DOM and ZIP checks passed; current-archive real Chrome verification pending'
if browser is not None:
 package_status=f'Local Node/DOM and ZIP checks passed; current-archive Chrome for Testing checks {browser_status}; Store installation is a separate field gate'
meta.update(submission_sha256=sha,package_verification_status=package_status,automated_test_report='docs/launch/TEST_RESULTS.md',automated_run=record['finishedAt'],node_tests_passed=record['passed'],node_named_leaf_cases=len(cases),node_tests_failed=record['failed'],dom_flow_checks_included=ui['passed'],current_browser_verification=browser_status,
 current_browser_report=f'docs/launch/evidence/browser-results-{version}.json' if browser else None,
 current_browser_checks_passed=browser.get('passed') if browser else None,current_browser_checks_failed=browser.get('failed') if browser else None,
 current_browser_name=browser.get('browser') if browser else None,current_browser_run_finished=browser.get('finishedAt') if browser else None,
 current_browser_archive_sha256=sha if browser else None,current_browser_ci_run=hosted_run.get('url'),current_browser_source_commit=hosted_run.get('headSha'),
 hosted_node_named_leaf_cases=len(hosted_cases) if hosted_cases else None,store_size_screenshots=len(screenshots))
meta_path.write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n')
lines=[f'# CartScope {version}: executed test cases and results','',
'Generated from retained executed evidence. Current candidate checks, historical Alpha checks, distribution status, and customer validation remain separate.','',
'## Current candidate evidence','',
f'- Command: `node scripts/verify-launch.mjs` runs `npm run check` and retains the actual output and JUnit report.',
f'- Node runtime: `{record["node"]}`. Run finished `{record["finishedAt"]}` (UTC).',
f'- **Node reporter: {record["tests"]} tests, {record["passed"]} passed, {record["failed"]} failed, {record["skipped"]} skipped.**',
f'- JUnit contains {len(cases)} named leaf cases; the Node total also counts the DOM suite container. These are two representations of the same run, not additional tests.',
f'- The {ui["passed"]} Happy DOM application flows are included in the Node total. They are simulated DOM checks, not Chrome or user-study participants.',
f'- ZIP: `{archive.name}`; {record["runtimeFiles"]} runtime files; root Manifest V3 version `{record["manifestVersion"]}`; every CRC passed.',
f'- SHA-256: `{sha}`. These archive checks establish package integrity; GitHub download verification and Store installation are separate distribution facts.','',
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
f'| Current candidate in Chrome for Testing | Configured ZIP unpacked into a disposable Chrome profile; actual API/UI, fixture capture, layouts and preview checks | {browser_status.capitalize()}'+(f'; {browser["passed"]} passed, {browser["failed"]} failed |' if browser else '; no current matching report |'),
'| GitHub download and Store installation | Distribution facts are recorded separately in [launch metadata](launch-metadata.json); Chrome automation does not establish Store approval/installation | Separate evidence required |',
'| Customer validation | Ten-user task completion/time, 1–5 ratings and written feedback; real store/platform/native notification checks | Pending real participants |','',
'## Browser scope','',
'The retained [local browser attempt](evidence/local-browser-results-'+version+'.json) stopped at browser startup. It records a prior same-version candidate ZIP hash and the startup error; it does not validate this final candidate archive and remains unchanged as history.','',
'Historical Alpha 0.1.1 [Chrome results](../CHROME_TEST_RESULTS.json) and [screenshots](../visuals/README.md) remain available with their own version/hash/run. They are not relabeled as 0.1.2 results.','',
'## Reproduce','',
'Use Node 22 or newer, run `npm ci`, then `node scripts/verify-launch.mjs`. For real Chrome, run `npx playwright install --with-deps chromium` and `PUBLIC_DEMO_URL=https://qarteu.github.io/cartscope/ npm run test:browser` on a host that can launch Chrome. The hosted-demo assertion requires that the same candidate version has actually been deployed first. Omit PUBLIC_DEMO_URL only for an explicitly local run; the report then states that public-demo coverage was skipped.','',
'## Named executed Node cases','',
'Each row below corresponds to an actual JUnit case. The test definition is the assertion source; expected behavior is described by the executed scenario name.','',
'| Case | Test definition | Executed scenario / expected behavior | Actual result |',
'| --- | --- | --- | --- |']
for case_id,file,name,result,_ in rows:
 lines.append(f'| {case_id} | [{file}](../../tests/{file}) | {name.replace("|","/")} | {result} |')
if browser is not None:
 lines += ['', '## Executed Chrome for Testing checks','',
  f'- Browser: Chrome for Testing `{browser["browser"]}`; report status **{browser_status}**; **{browser["passed"]} passed, {browser["failed"]} failed**.',
  f'- Run finished `{browser.get("finishedAt","not recorded")}` (UTC); ZIP SHA-256 `{sha}`.',
  f'- Raw [browser checks/results](evidence/browser-results-{version}.json) retain the actual method, durations, screenshots, capture diagnostics, and limitations.']
 if hosted_run:
  lines += [f'- Hosted [run {hosted_run["id"]}]({hosted_run["url"]}); source `{hosted_run["headSha"]}`; workflow status `{hosted_run["status"]}` / `{hosted_run["conclusion"]}`. [Retained run provenance](evidence/hosted-run.json).']
 if hosted_cases:
  lines += [f'- Hosted [Node JUnit](evidence/hosted-node-results-{version}.xml) contains {len(hosted_cases)} named leaf cases without failures. This re-executes the Node cases above and is not added to the distinct-case count.']
 public=browser.get('publicDemo')
 if public:
  lines += [f'- Public demo: `{public.get("url")}` returned HTTP `{public.get("status")}`; landing / iframe / About versions: `{public.get("landingVersion")}` / `{public.get("iframeVersion")}` / `{public.get("aboutVersion")}`. This is a browser preview, not a Store listing.']
 lines += ['', 'The extension was loaded from the unpacked release ZIP. Retailer capture checks use localhost product/category fixtures; changing live retailer markup, native OS notification delivery, human task performance, and Store installation were not verified by these checks.','',
  '| Case | Test definition | Executed scenario / expected behavior | Actual result |',
  '| --- | --- | --- | --- |']
 for case_id,file,name,result,_ in browser_rows:
  lines.append(f'| {case_id} | [{file}](../../tests/{file}) | {name.replace("|","/")} | {result} |')
 if screenshots:
  lines += ['', '## Store-size screenshot evidence','',
   'Unmodified installed-extension pages in a fresh QA tab, using visibly labeled illustrative sample data. Copied PNG dimensions were checked again while building this report. These assets do not establish Store submission or approval.','',
   '| View | PNG evidence | Actual dimensions |','| --- | --- | --- |']
  for name,view,width,height in screenshots:
   lines.append(f'| {view} | [{name}](assets/screenshots/{name}) | {width}×{height} |')
lines += ['', '## Pending field-acceptance cases','',
'| Case | Procedure and expected result | Status |','| --- | --- | --- |',
'| FIELD-01 | Install the final ZIP on a reference user’s supported Chrome/OS; toolbar opens the panel and real workspace starts empty | Not run |',
'| FIELD-02 | Install from the approved public Store listing; confirm version, permission prompts and update behavior | Not run; listing pending |',
'| FIELD-03 | On a permitted current retailer listing, capture and compare displayed name/price/variant/condition; report correction rate with actual denominators | Not run |',
'| FIELD-04 | Enable optional desktop notifications and trigger an observed watched change; confirm native OS delivery | Not run |',
'| FIELD-05 | Ten consenting users attempt the defined tasks; retain task outcomes/time, ratings and written comments separately from automated checks | Not run |','']
(ROOT/'docs/launch/TEST_RESULTS.md').write_text('\n'.join(lines))
print(f'Generated {len(cases)} Node named-case rows and {len(browser_rows)} Chrome rows; {record["tests"]} Node-reporter tests include {ui["passed"]} DOM flows; current Chrome {browser_status}; field acceptance remains separate.')
