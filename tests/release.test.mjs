import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { releaseInfo, releaseNotes } from '../scripts/release.mjs';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const currentRelease = releaseInfo(project);

test('configured package, npm lock, and installed manifest use the same release version', () => {
  const lock = JSON.parse(readFileSync(resolve(project, 'package-lock.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(resolve(project, 'extension/manifest.json'), 'utf8'));
  assert.equal(lock.version, currentRelease.version);
  assert.equal(lock.packages[''].version, currentRelease.version);
  assert.equal(manifest.version, currentRelease.version);
  assert.equal(currentRelease.tag, `v${manifest.version}`);
});

function fixture(t, version = currentRelease.version) {
  const root = mkdtempSync(resolve(tmpdir(), 'cartscope-release-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, 'extension'));
  cpSync(resolve(project, 'scripts'), resolve(root, 'scripts'), { recursive: true });
  writeFileSync(resolve(root, 'package.json'), JSON.stringify({ type: 'module', version }));
  writeFileSync(resolve(root, 'CHANGELOG.md'), `## ${version}\nFixture release\n`);
  const manifest = {
    manifest_version: 3, name: 'CartScope fixture', version, minimum_chrome_version: '116',
    permissions: ['activeTab', 'scripting', 'storage', 'sidePanel'], optional_permissions: ['notifications'],
    background: { service_worker: 'background.js', type: 'module' }, side_panel: { default_path: 'sidepanel.html' },
    content_security_policy: { extension_pages: "script-src 'self'; object-src 'none'" }
  };
  writeFileSync(resolve(root, 'extension/manifest.json'), JSON.stringify(manifest));
  writeFileSync(resolve(root, 'extension/background.js'), 'export const fixture = true;\n');
  writeFileSync(resolve(root, 'extension/app.js'), 'export const fixture = true;\n');
  writeFileSync(resolve(root, 'extension/sidepanel.html'), '<script type="module" src="app.js"></script>');
  writeFileSync(resolve(root, 'extension/empty.txt'), '');
  writeFileSync(resolve(root, 'extension/ñ.bin'), Buffer.from([0, 1, 127, 128, 255]));
  writeFileSync(resolve(root, 'PRIVATE-NOT-RUNTIME.txt'), 'Must not be packaged');
  return { root, manifest, release: releaseInfo(root) };
}

function run(root, script) {
  return spawnSync(process.execPath, [resolve(root, `scripts/${script}.mjs`)], { cwd: root, encoding: 'utf8' });
}

test('release ZIP is consumed by unzip, contains runtime root only, and is deterministic', t => {
  const { root, release } = fixture(t);
  const first = run(root, 'package');
  assert.equal(first.status, 0, first.stderr);
  const archivePath = resolve(root, release.archivePath);
  const firstBytes = readFileSync(archivePath);
  execFileSync('unzip', ['-t', archivePath]);
  const names = execFileSync('unzip', ['-Z1', archivePath], { encoding: 'utf8' }).trim().split('\n');
  assert(names.includes('manifest.json'));
  assert(!names.some(name => name.startsWith('extension/') || name.startsWith('scripts/') || name === 'PRIVATE-NOT-RUNTIME.txt'));
  assert.equal(execFileSync('unzip', ['-p', archivePath, 'empty.txt']).length, 0);
  // Some system unzip versions display UTF-8 filenames through a legacy
  // character set, so select the binary entry by extension rather than name.
  assert(firstBytes.includes(Buffer.from('ñ.bin', 'utf8')));
  assert.deepEqual(execFileSync('unzip', ['-p', archivePath, '*.bin']), Buffer.from([0, 1, 127, 128, 255]));
  const second = run(root, 'package');
  assert.equal(second.status, 0, second.stderr);
  assert.deepEqual(readFileSync(archivePath), firstBytes);
  const checksum = readFileSync(`${archivePath}.sha256`, 'utf8');
  assert.equal(checksum, `${createHash('sha256').update(firstBytes).digest('hex')}  ${release.archiveName}\n`);
  const installedManifest = JSON.parse(execFileSync('unzip', ['-p', archivePath, 'manifest.json'], { encoding: 'utf8' }));
  assert.equal(installedManifest.version, release.version);
});

test('validator rejects version drift and excessive permissions', t => {
  const { root, manifest, release } = fixture(t);
  manifest.version = '0.2.0';
  writeFileSync(resolve(root, 'extension/manifest.json'), JSON.stringify(manifest));
  assert.notEqual(run(root, 'validate').status, 0);
  manifest.version = release.version;
  manifest.host_permissions = ['<all_urls>'];
  writeFileSync(resolve(root, 'extension/manifest.json'), JSON.stringify(manifest));
  const permissionResult = run(root, 'validate');
  assert.notEqual(permissionResult.status, 0);
  assert.match(permissionResult.stderr, /host permissions/);
  manifest.host_permissions = null;
  writeFileSync(resolve(root, 'extension/manifest.json'), JSON.stringify(manifest));
  assert.notEqual(run(root, 'validate').status, 0);
});

test('packaging a version patch preserves the previous release archive and checksum', t => {
  const { root, manifest, release: previous } = fixture(t, '0.1.0');
  assert.equal(run(root, 'package').status, 0);
  const previousArchive = readFileSync(resolve(root, previous.archivePath));
  const previousChecksum = readFileSync(resolve(root, previous.checksumPath));
  writeFileSync(resolve(root, 'package.json'), JSON.stringify({ type: 'module', version: '0.1.1' }));
  manifest.version = '0.1.1';
  writeFileSync(resolve(root, 'extension/manifest.json'), JSON.stringify(manifest));
  writeFileSync(resolve(root, 'CHANGELOG.md'), '## 0.1.1\nPatch instructions\n\n## 0.1.0\nHistorical instructions\n');
  const next = releaseInfo(root);
  const result = run(root, 'package');
  assert.equal(result.status, 0, result.stderr);
  execFileSync('unzip', ['-t', resolve(root, next.archivePath)]);
  assert.equal(JSON.parse(execFileSync('unzip', ['-p', resolve(root, next.archivePath), 'manifest.json'], { encoding: 'utf8' })).version, '0.1.1');
  assert.deepEqual(readFileSync(resolve(root, previous.archivePath)), previousArchive);
  assert.deepEqual(readFileSync(resolve(root, previous.checksumPath)), previousChecksum);
  assert.notDeepEqual(readFileSync(resolve(root, next.archivePath)), previousArchive);
});

test('release notes select only the exact current version and reject missing, duplicate, or empty sections', () => {
  const changelog = '# Releases\n\n## 0.1.10 · Future\nUnrelated future notes\n\n## 0.1.1 · Patch\nInstall the current ZIP.\n### Feedback\nCurrent feedback.\n\n## 0.1.0 · Initial\nHistorical instructions\n';
  assert.equal(releaseNotes(changelog, '0.1.1'), '## 0.1.1 · Patch\nInstall the current ZIP.\n### Feedback\nCurrent feedback.\n');
  assert.throws(() => releaseNotes('## 0.1.10\nWrong prefix version\n', '0.1.1'), /exactly one/);
  assert.throws(() => releaseNotes('## 0.1.1\nFirst\n## 0.1.1\nSecond\n', '0.1.1'), /exactly one/);
  assert.throws(() => releaseNotes('## 0.1.1\n\n## 0.1.0\nOld\n', '0.1.1'), /must not be empty/);
  assert.equal(releaseNotes('## 0.1.1\nCurrent\n## Appendix\nExcluded\n', '0.1.1'), '## 0.1.1\nCurrent\n');
});

test('validator rejects missing paths, inline scripts, remote stylesheets, and empty manifests', t => {
  const { root } = fixture(t);
  const html = resolve(root, 'extension/sidepanel.html');
  for (const markup of [
    '<script src="missing.js"></script>',
    '<script>alert(1)</script>',
    '<link rel="stylesheet" href="https://example.com/style.css">',
    '<script src="../PRIVATE-NOT-RUNTIME.txt"></script>',
    '<script src="."></script>'
  ]) {
    writeFileSync(html, markup);
    assert.notEqual(run(root, 'validate').status, 0, markup);
  }
  writeFileSync(resolve(root, 'extension/manifest.json'), '');
  assert.notEqual(run(root, 'validate').status, 0);
});

test('ordinary import action strings are accepted while remote static and dynamic imports fail', t => {
  const { root } = fixture(t);
  const script = resolve(root, 'extension/app.js');
  writeFileSync(script, "const call = () => {}; call('import', {state: 'test'});\nconst note = 'from';\n");
  const actionResult = run(root, 'validate');
  assert.equal(actionResult.status, 0, actionResult.stderr);
  for (const source of ["import remote from 'https://example.com/app.js';", "const module = await import('https://example.com/app.js');"]) {
    writeFileSync(script, source);
    assert.notEqual(run(root, 'validate').status, 0, source);
  }
});
