#!/usr/bin/env python3
"""Assemble current verified runtime + genuine screenshots and copyable Store fields."""
from pathlib import Path
from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
import hashlib,json,struct
ROOT=Path(__file__).resolve().parents[1]
pkg=json.loads((ROOT/'package.json').read_text());version=pkg['version']
m=json.loads((ROOT/'docs/launch/launch-metadata.json').read_text())
r=json.loads((ROOT/f'docs/launch/evidence/browser-results-{version}.json').read_text())
archive=ROOT/m['submission_zip'];sha=lambda b:hashlib.sha256(b).hexdigest()
if r['status']!='passed' or r['failed'] or r['errors'] or r['release']['version']!=version or r['release']['sha256']!=sha(archive.read_bytes()):
 raise SystemExit('A passing Chrome report for this exact runtime is required for the upload kit.')
manifest=json.loads((ROOT/'extension/manifest.json').read_text())
files={f'extension/{archive.name}':archive.read_bytes(),f'extension/{archive.name}.sha256':Path(str(archive)+'.sha256').read_bytes(),
 'README_FIRST.md':(ROOT/'docs/launch/WEBSTORE_SETUP.md').read_bytes(),'images/icon128.png':(ROOT/'extension/assets/icon128.png').read_bytes()}
for name in ['STORE_LISTING.md','PERMISSIONS_AND_DISCLOSURES.md','REVIEWER_INSTRUCTIONS.md','PRIVACY_POLICY.md']:
 files['listing/'+name]=(ROOT/'docs/launch'/name).read_bytes()
for name in ['store-small-tile.png','store-marquee.png']:
 files['images/'+name]=(ROOT/'docs/launch/assets'/name).read_bytes()
for rec in r['storeScreenshots']:
 name=Path(rec['path']).name;b=(ROOT/'docs/launch/assets/screenshots'/name).read_bytes()
 if b[:8]!=b'\x89PNG\r\n\x1a\n' or struct.unpack('>II',b[16:24])!=(1280,800):raise SystemExit('Invalid screenshot '+name)
 files['images/screenshots/'+name]=b
for name in ['README.md','capture-manifest.json']:
 path=ROOT/'docs/launch/assets/screenshots'/name
 if path.exists():files['images/screenshots/'+name]=path.read_bytes()
files['listing/FORM_FIELDS.txt']=f'''NAME\n{manifest['name']}\n\nVERSION\n{version}\n\nMANIFEST SHORT DESCRIPTION\n{manifest['description']}\n\nHOMEPAGE\n{m['homepage']}\n\nPRIVACY POLICY URL\n{m['public_privacy_policy_url']}\n\nSUPPORT URL\n{m['support']}\n\nSOURCE\n{m['repository']}\n\nRELEASE NOTES\nhttps://github.com/qarteu/cartscope/releases/tag/v{version}\n\nRUNTIME SHA-256\n{r['release']['sha256']}\n\nSTORE URL\n{m['chrome_web_store_url'] or 'Pending actual dashboard submission, Google review and verified public listing.'}\n\nFull description, single purpose, permissions, privacy inventory and reviewer steps\nare in the adjacent Markdown files. Review and copy the fields matching your dashboard.\n'''.encode()
records=[{'file':n,'sha256':sha(b),'bytes':len(b)} for n,b in sorted(files.items())]
files['KIT_MANIFEST.json']=(json.dumps({'version':version,'runtime_sha256':r['release']['sha256'],'chrome_status':r['status'],'chrome_checks':r['passed'],'store_url':m['chrome_web_store_url'],'store_status':m['chrome_web_store_status'],'files':records},indent=2)+'\n').encode()
out=ROOT/'artifacts'/f'cartscope-webstore-kit-{version}.zip'
with ZipFile(out,'w',ZIP_DEFLATED,compresslevel=9) as z:
 for n,b in sorted(files.items()):
  i=ZipInfo(n,(2026,11,15,0,0,0));i.compress_type=ZIP_DEFLATED;i.external_attr=0o644<<16;z.writestr(i,b)
with ZipFile(out) as z:
 if z.testzip() is not None:raise SystemExit('Kit CRC failure')
 for f in records:
  if sha(z.read(f['file']))!=f['sha256']:raise SystemExit('Kit hash mismatch')
Path(str(out)+'.sha256').write_text(f'{sha(out.read_bytes())}  {out.name}\n')
print(f'Prepared {out.name}: {len(files)} files, {len(r["storeScreenshots"])} genuine Store screenshots, CRCs and file hashes verified.')
