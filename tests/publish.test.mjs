import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Execute the production publisher against disposable command doubles. These
// tests verify CLI decisions only; they make no GitHub requests or Git changes.
function publishFixture(t, existing = false, conflict = false) {
  const root = mkdtempSync(resolve(tmpdir(), 'cartscope-publisher-contract-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  cpSync(resolve(project, 'scripts'), resolve(root, 'scripts'), { recursive: true });
  for (const path of ['bin', 'docs', 'site', 'artifacts']) mkdirSync(resolve(root, path));
  writeFileSync(resolve(root, 'package.json'), JSON.stringify({ type: 'module', version: '0.1.1' }));
  writeFileSync(resolve(root, 'CHANGELOG.md'), '## 0.1.1 · Patch\nInstall the patch ZIP.\n\n## 0.1.0 · Initial\nHistorical instructions.\n');
  writeFileSync(resolve(root, 'docs/issues.json'), '[]');
  writeFileSync(resolve(root, 'site/index.html'), 'Fixture deployment');
  writeFileSync(resolve(root, 'artifacts/cartscope-alpha-0.1.1.zip'), 'Fixture current archive');
  writeFileSync(resolve(root, 'artifacts/cartscope-alpha-0.1.1.zip.sha256'), 'Fixture current checksum');
  const trace = resolve(root, 'trace.jsonl');
  const commandDouble = `#!${process.execPath}
import fs from 'node:fs';import path from 'node:path';
const command=path.basename(process.argv[1]),args=process.argv.slice(2);
const entry={command,args};
if(command==='gh'&&args[0]==='release'&&args[1]==='create')entry.notes=fs.readFileSync(args[args.indexOf('--notes-file')+1],'utf8');
fs.appendFileSync(process.env.CARTSCOPE_COMMAND_TRACE,JSON.stringify(entry)+'\\n');
if(command==='gh'){
 if(args[0]==='api'&&args[1]==='user')console.log('qarteu');
 else if(args[0]==='issue'&&args[1]==='list')console.log('[]');
 else if(args[0]==='api'&&args[1].endsWith('/pages'))console.log(JSON.stringify({source:{branch:'gh-pages',path:'/'}}));
 else if(args[0]==='release'&&args[1]==='view')process.exit(process.env.CARTSCOPE_EXISTING_RELEASE==='true'?0:1);
 else if(args[0]==='release'&&args[1]==='download'){
  const directory=args[args.indexOf('--dir')+1];
  for(const filename of ['cartscope-alpha-0.1.1.zip','cartscope-alpha-0.1.1.zip.sha256'])fs.writeFileSync(path.join(directory,filename),process.env.CARTSCOPE_CONFLICT==='true'?'Historical different bytes':fs.readFileSync(path.join(process.cwd(),'artifacts',filename)));
 }
}else if(command==='git'){
 if(args.includes('get-url'))console.log('https://github.com/qarteu/cartscope.git');
 else if(args.includes('rev-parse')&&args.some(arg=>arg.startsWith('refs/tags/')))process.exit(1);
 else if(args.includes('rev-parse'))console.log('fixture-head');
}
`;
  for (const command of ['gh', 'git', 'npm']) writeFileSync(resolve(root, 'bin', command), commandDouble, { mode: 0o755 });
  const result = spawnSync(process.execPath, [resolve(root, 'scripts/publish.mjs')], { cwd: root, encoding: 'utf8',
    env: { ...process.env, PATH: `${resolve(root, 'bin')}:${process.env.PATH}`, CARTSCOPE_COMMAND_TRACE: trace,
      CARTSCOPE_EXISTING_RELEASE: String(existing), CARTSCOPE_CONFLICT: String(conflict) } });
  assert(existsSync(trace), `The isolated command doubles did not start: ${result.stderr}`);
  const calls = readFileSync(trace, 'utf8').trim().split('\n').map(line => JSON.parse(line));
  const temporaryDirectory = calls.find(call => call.args.includes('--notes-file'))?.args.at(-3)
    || calls.find(call => call.args[0] === 'release' && call.args[1] === 'download')?.args.at(-1);
  if (temporaryDirectory) {
    const directory = dirname(temporaryDirectory);
    if (directory.startsWith(resolve(tmpdir(), 'cartscope-publish-'))) t.after(() => rmSync(directory, { recursive: true, force: true }));
  }
  return { result, calls };
}

test('publisher command contract derives the patch tag, asset paths, and isolated notes (mock CLIs)', t => {
  const { result, calls } = publishFixture(t);
  assert.equal(result.status, 0, result.stderr);
  const creation = calls.find(call => call.command === 'gh' && call.args[0] === 'release' && call.args[1] === 'create');
  assert.equal(creation.args[2], 'v0.1.1');
  assert(creation.args.includes('artifacts/cartscope-alpha-0.1.1.zip'));
  assert(creation.args.includes('artifacts/cartscope-alpha-0.1.1.zip.sha256'));
  assert(creation.args.includes('--verify-tag'));
  assert.equal(creation.notes, '## 0.1.1 · Patch\nInstall the patch ZIP.\n');
  assert(!calls.some(call => call.args.includes('v0.1.0') || call.args.includes('--clobber')));
});

test('repeated publication verifies identical assets without tagging or uploading (mock CLIs)', t => {
  const { result, calls } = publishFixture(t, true);
  assert.equal(result.status, 0, result.stderr);
  assert(calls.some(call => call.args[0] === 'release' && call.args[1] === 'download' && call.args[2] === 'v0.1.1'));
  assert(!calls.some(call => call.args[0] === 'release' && ['create', 'upload', 'edit', 'delete'].includes(call.args[1])));
  assert(!calls.some(call => call.command === 'git' && call.args[0] === 'tag'));
});

test('different assets at an existing version stop publication without replacement (mock CLIs)', t => {
  const { result, calls } = publishFixture(t, true, true);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Existing releases are immutable; use a new release version/);
  assert(!calls.some(call => call.args[0] === 'release' && ['create', 'upload', 'edit', 'delete'].includes(call.args[1])));
});
