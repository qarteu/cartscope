#!/usr/bin/env python3
"""Package the released runtime and submission evidence without developer dependencies."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
version = json.loads((ROOT/'package.json').read_text())['version']
archive_name = f'cartscope-alpha-{version}.zip'
report = json.loads((ROOT/'docs/CHROME_TEST_RESULTS.json').read_text())
runtime = ROOT/'artifacts'/archive_name
if report['status'] != 'passed' or report['release']['version'] != version:
    raise SystemExit('A passing Chrome report for this version is required.')
if hashlib.sha256(runtime.read_bytes()).hexdigest() != report['release']['sha256']:
    raise SystemExit('The runtime archive differs from the Chrome-tested archive.')
files = {
    f'extension/{archive_name}': runtime,
    f'extension/{archive_name}.sha256': ROOT/'artifacts'/f'{archive_name}.sha256',
    'README.md': ROOT/'README.md',
    'LICENSE': ROOT/'LICENSE',
    'CHANGELOG.md': ROOT/'CHANGELOG.md',
}
for name in ['FINAL_SUBMISSION.pdf','FINAL_SUBMISSION.md','CANVAS_SUBMISSION.md',
             'ALPHA_EMAIL.md','FEEDBACK_PLAN.md','SPRINT_BOARD.md','PUBLISHED_ISSUES.md',
             'VERIFICATION.md','CHROME_TEST_RESULTS.json','UI_TEST_RESULTS.json']:
    files[f'documents/{name}'] = ROOT/'docs'/name
for name in ['cart','review','compare','notifications','orders','finance','settings',
             'landing-desktop','landing-mobile','cartscope-overview']:
    files[f'visuals/{name}.png'] = ROOT/'docs/visuals'/f'{name}.png'
files['visuals/render-manifest.json'] = ROOT/'docs/visuals/render-manifest.json'
files['visuals/README.md'] = ROOT/'docs/visuals/README.md'
missing = [str(path.relative_to(ROOT)) for path in files.values() if not path.is_file()]
if missing:
    raise SystemExit('Missing submission files: '+', '.join(missing))
entries = {name: path.read_bytes() for name,path in files.items()}
entries['START_HERE.txt'] = f'''CartScope Alpha {version} submission

Repository: https://github.com/qarteu/cartscope
Demo: https://qarteu.github.io/cartscope/
Release: https://github.com/qarteu/cartscope/releases/tag/v{version}

Read documents/FINAL_SUBMISSION.pdf for the illustrated report.
Copy documents/CANVAS_SUBMISSION.md into your Canvas submission.
The email in documents/ALPHA_EMAIL.md is an unsent invitation template.
Ten-user recruitment, invitation delivery, and feedback collection remain pending.

To install: extract extension/{archive_name}, then open chrome://extensions,
enable Developer mode, click Load unpacked, and select the extracted folder
containing manifest.json. The outer submission bundle is not the extension.

The Chrome report, screenshots, source links, and file hashes are included.
The individual screenshots are unchanged Chrome captures with labeled samples.
'''.encode()
records = [{'file':name,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)}
           for name,data in sorted(entries.items())]
entries['SUBMISSION_MANIFEST.json'] = (json.dumps({
    'version':version,'repository':'https://github.com/qarteu/cartscope',
    'chrome_tested_runtime_sha256':report['release']['sha256'],
    'browser':report['browser'],'browser_checks':report['passed'],
    'invitation_status':'draft_not_sent','files':records},indent=2)+'\n').encode()
output = ROOT/'artifacts'/f'cartscope-submission-{version}.zip'
with ZipFile(output,'w',compression=ZIP_DEFLATED,compresslevel=9) as z:
    for name,data in sorted(entries.items()):
        info = ZipInfo(name,date_time=(2026,10,11,0,0,0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info,data)
with ZipFile(output) as z:
    if z.testzip() is not None or set(z.namelist()) != set(entries):
        raise SystemExit('Submission ZIP validation failed.')
sha = hashlib.sha256(output.read_bytes()).hexdigest()
(output.parent/(output.name+'.sha256')).write_text(f'{sha}  {output.name}\n')
print(f'Created {output.name}: {len(entries)} files, {output.stat().st_size} bytes; CRCs verified.')
print(f'SHA-256: {sha}')
