import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), 'cartscope-release-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(resolve(root, 'extension'));
  cpSync(resolve(project, 'scripts'), resolve(root, 'scripts'), { recursive: true });
  writeFileSync(resolve(root, 'package.json'), JSON.stringify({ type: 'module', version: '0.1.0' }));
  writeFileSync(resolve(root, 'CHANGELOG.md'), '## 0.1.0\nFixture release\n');
  const manifest = {
    manifest_version: 3, name: 'CartScope fixture', version: '0.1.0', minimum_chrome_version: '116',
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
  return { root, manifest };
}

function run(root, script) {
  return spawnSync(process.execPath, [resolve(root, `scripts/${script}.mjs`)], { cwd: root, encoding: 'utf8' });
}

test('release ZIP is consumed by unzip, contains runtime root only, and is deterministic', t => {
  const { root } = fixture(t);
  const first = run(root, 'package');
  assert.equal(first.status, 0, first.stderr);
  const archivePath = resolve(root, 'artifacts/cartscope-alpha-0.1.0.zip');
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
  assert.match(checksum, /^[a-f0-9]{64}  cartscope-alpha-0\.1\.0\.zip\n$/);
  assert.equal(checksum.split(' ')[0], createHash('sha256').update(firstBytes).digest('hex'));
});

test('validator rejects version drift and excessive permissions', t => {
  const { root, manifest } = fixture(t);
  manifest.version = '0.2.0';
  writeFileSync(resolve(root, 'extension/manifest.json'), JSON.stringify(manifest));
  assert.notEqual(run(root, 'validate').status, 0);
  manifest.version = '0.1.0';
  manifest.host_permissions = ['<all_urls>'];
  writeFileSync(resolve(root, 'extension/manifest.json'), JSON.stringify(manifest));
  const permissionResult = run(root, 'validate');
  assert.notEqual(permissionResult.status, 0);
  assert.match(permissionResult.stderr, /host permissions/);
  manifest.host_permissions = null;
  writeFileSync(resolve(root, 'extension/manifest.json'), JSON.stringify(manifest));
  assert.notEqual(run(root, 'validate').status, 0);
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
