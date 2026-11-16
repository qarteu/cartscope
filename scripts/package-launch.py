#!/usr/bin/env python3
"""Create a reviewable launch handoff with source, results and Store/outreach drafts."""
from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
import hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[1]
pkg=json.loads((ROOT/'package.json').read_text());version=pkg['version']
report=json.loads((ROOT/f'docs/launch/evidence/verification-{version}.json').read_text())
meta=json.loads((ROOT/'docs/launch/launch-metadata.json').read_text())
browser=json.loads((ROOT/f'docs/launch/evidence/browser-results-{version}.json').read_text())
runtime=ROOT/report['archive']
sha=lambda data:hashlib.sha256(data).hexdigest()
if report['exitCode']!=0 or report['failed'] or sha(runtime.read_bytes())!=report['sha256'] or meta['submission_sha256']!=report['sha256']:
 raise SystemExit('Runtime and current passing local evidence must agree.')
if browser['status']!='passed' or browser['failed'] or browser['errors'] or browser['release']['sha256']!=report['sha256'] or browser['release']['version']!=version:
 raise SystemExit('Current passing Chrome evidence must match the bundled runtime.')
with ZipFile(runtime) as z:
 if z.testzip() is not None:raise SystemExit('Runtime ZIP CRC failure')
 manifest=json.loads(z.read('manifest.json'))
 if manifest['version']!=version:raise SystemExit('Runtime version mismatch')
 for name in z.namelist():
  if z.read(name)!=(ROOT/'extension'/name).read_bytes():raise SystemExit('Runtime source differs from tested archive: '+name)
entries={runtime.name:runtime.read_bytes(),runtime.name+'.sha256':(Path(str(runtime)+'.sha256')).read_bytes()}
base=['README.md','LICENSE','CHANGELOG.md','package.json','package-lock.json','.github/workflows/verify.yml',
      'demo.html','demo.css','demo.js','docs/SPRINT_BOARD.md','docs/issues.json','docs/PUBLISHED_ISSUES.md','docs/FEEDBACK_PLAN.md','docs/REFERENCE_USERS.csv']
for name in base:entries['project/'+name]=(ROOT/name).read_bytes()
for folder in ['extension','tests','scripts','docs/launch']:
 for p in sorted((ROOT/folder).rglob('*')):
  if not p.is_file() or '__pycache__' in p.parts or p.suffix in ['.pyc','.log']:continue
  entries['project/'+p.relative_to(ROOT).as_posix()]=p.read_bytes()
for p in sorted((ROOT/'site').rglob('*')):
 if p.is_file():entries['web-preview/'+p.relative_to(ROOT/'site').as_posix()]=p.read_bytes()
entries['CANVAS_SUBMISSION.md']=(ROOT/'docs/launch/CANVAS_SUBMISSION.md').read_bytes()
entries['START_HERE.txt']=f'''CARTSCOPE LAUNCH CANDIDATE {version} - PREPARED HANDOFF

Installable extension: {runtime.name}
The outer submission bundle is not the extension upload.

Canvas copy: CANVAS_SUBMISSION.md
Test cases/results: project/docs/launch/TEST_RESULTS.md and TEST_CASES.csv
Raw executed evidence: project/docs/launch/evidence/
Store listing/privacy/reviewer kit and promo graphics: project/docs/launch/
Marketing drafts: REFERENCE_USER_EMAIL.md and PUBLIC_ANNOUNCEMENTS.md in that folder
Updated board: project/docs/SPRINT_BOARD.md (Sprint 2.E Fielding & Support)
Board records in this ZIP are a source snapshot. For subsequent publication/status
updates use the live tracker: https://github.com/qarteu/cartscope/issues
Source/tests/build scripts: project/
Static demo/privacy/support/launch preview: web-preview/

Actual current status:
- {report['passed']} Node-reporter tests passed; {report['failed']} failed. DOM flows are included.
- Runtime manifest, root ZIP layout and CRCs passed; {report['runtimeFiles']} runtime files.
- {browser['passed']} real Chrome checks passed; {browser['failed']} failed. Browser: {browser['browser']}.
- Current Chrome evidence: {meta['current_browser_ci_run']}
- GitHub release: {meta['release_notes']}
- Hosted runtime downloaded and verified against the tested bytes: {meta['github_download_verified']}.
- Chrome Web Store submission/approval and the actual public listing are not verified.
- Outreach remains drafted; no deliveries, user-study results or reviews are invented.

To finish Store publication: follow project/docs/launch/WEBSTORE_SETUP.md. Register
the publisher account if needed, then upload the runtime ZIP using the prepared
listing copy, five screenshots, disclosures and reviewer instructions. The account
owner handles the registration agreement/payment and Google account verification.
Await actual Google approval/publication and test installation from the Store.
Only then replace the Store URL fields and use post-publication announcement copy.

Local install: extract the runtime ZIP, open chrome://extensions, enable Developer
mode, choose Load unpacked, and select its root manifest.json folder. Pin CartScope.
Read its release notes and confirm captured product details before saving.

Repository: https://github.com/qarteu/cartscope
Interactive preview: https://qarteu.github.io/cartscope/
Chrome developer dashboard: https://chrome.google.com/webstore/devconsole
'''.encode()
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
records=[{'file':name,'bytes':len(data),'sha256':sha(data)} for name,data in sorted(entries.items())]
entries['BUNDLE_MANIFEST.json']=(json.dumps({'version':version,'type':'prepared launch candidate handoff',
 'created_for_local_date':meta['last_verified_local_date'],'timezone':'America/Los_Angeles','source_base_commit':head,
 'source_snapshot':'Exact bundled files are identified below; runtime download verification is recorded separately.',
 'runtime_sha256':report['sha256'],'store_url':meta['chrome_web_store_url'],'store_status':meta['chrome_web_store_status'],
 'github_release':meta['release_notes'],'github_download_verified':meta['github_download_verified'],
 'node_reporter_passed':report['passed'],'node_named_leaf_cases':meta['node_named_leaf_cases'],
 'fresh_chrome_status':meta['current_browser_verification'],'chrome_checks_passed':browser['passed'],
 'chrome_ci_run':meta['current_browser_ci_run'],'outreach':'drafts only','files':records},indent=2)+'\n').encode()
output=ROOT/'artifacts'/f'cartscope-launch-submission-{version}.zip'
with ZipFile(output,'w',ZIP_DEFLATED,compresslevel=9) as z:
 for name,data in sorted(entries.items()):
  i=ZipInfo(name,(2026,11,15,0,0,0));i.compress_type=ZIP_DEFLATED;i.external_attr=0o644<<16;z.writestr(i,data)
with ZipFile(output) as z:
 if z.testzip() is not None:raise SystemExit('Bundle CRC failure')
 for rec in records:
  if sha(z.read(rec['file']))!=rec['sha256']:raise SystemExit('Bundle manifest mismatch')
checksum=sha(output.read_bytes());Path(str(output)+'.sha256').write_text(f'{checksum}  {output.name}\n')
print(f'Created {output.name}: {len(entries)} entries, {output.stat().st_size} bytes; all CRCs and {len(records)} file hashes verified.')
print('SHA-256:',checksum)
