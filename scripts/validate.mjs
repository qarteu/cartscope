import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const extension = resolve(root, 'extension');

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.')) return [];
    const path = resolve(directory, entry.name);
    assert(!entry.isSymbolicLink(), `Runtime symlinks are not allowed: ${relative(extension, path)}`);
    return entry.isDirectory() ? walk(path) : [path];
  }).sort();
}

function localFile(path, base = extension) {
  assert.equal(typeof path, 'string', 'Referenced runtime paths must be strings');
  assert(!isAbsolute(path) && !/^[a-z]+:/i.test(path), `Runtime reference must be local: ${path}`);
  const target = resolve(base, path.split(/[?#]/)[0]);
  assert(!relative(extension, target).startsWith('..'), `Runtime reference escapes extension: ${path}`);
  assert(statSync(target).isFile(), `Referenced runtime file missing: ${path}`);
  assert(!relative(realpathSync(extension), realpathSync(target)).startsWith('..'), `Runtime reference resolves outside extension: ${path}`);
  return target;
}

export function validate() {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(resolve(extension, 'manifest.json'), 'utf8'));
  assert.equal(manifest.manifest_version, 3, 'Chrome extension must use Manifest V3');
  assert.equal(manifest.version, pkg.version, 'Package and manifest versions must match');
  assert(/^\d+\.\d+\.\d+$/.test(pkg.version), 'Release version must have three numeric components');
  assert(manifest.name.includes('CartScope'), 'Manifest must identify CartScope');
  assert(readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8').includes(`## ${pkg.version}`), 'CHANGELOG must include this release version');
  assert(Number(manifest.minimum_chrome_version) >= 116, 'Side-panel release must target Chrome 116 or newer');

  const permitted = new Set(['activeTab', 'scripting', 'storage', 'sidePanel']);
  assert(Array.isArray(manifest.permissions), 'Manifest permissions required');
  for (const field of ['optional_permissions', 'host_permissions', 'optional_host_permissions', 'content_scripts', 'web_accessible_resources']) {
    if (Object.hasOwn(manifest, field)) assert(Array.isArray(manifest[field]), `Manifest ${field} must be an array`);
  }
  for (const permission of manifest.permissions) assert(permitted.has(permission), `Unexpected required permission: ${permission}`);
  for (const permission of permitted) assert(manifest.permissions.includes(permission), `Expected permission missing: ${permission}`);
  assert.deepEqual(manifest.optional_permissions ?? [], ['notifications'], 'Notifications must be the only optional permission');
  assert.equal((manifest.host_permissions ?? []).length, 0, 'Alpha must not request blanket host permissions');
  assert.equal((manifest.optional_host_permissions ?? []).length, 0, 'Alpha must not request optional host permissions');
  assert.equal((manifest.content_scripts ?? []).length, 0, 'Capture must be user initiated, not an always-on content script');
  assert.equal((manifest.web_accessible_resources ?? []).length, 0, 'No web-accessible runtime resources needed');
  const csp = manifest.content_security_policy?.extension_pages ?? '';
  assert(/script-src\s+'self'(?:\s*;|$)/.test(csp), 'Extension scripts must load only from self');
  assert(!/unsafe-eval|unsafe-inline|https?:|\*/.test(csp), 'Extension CSP must not allow remote/inline/evaluated scripts');

  const references = [manifest.background?.service_worker, manifest.side_panel?.default_path,
    manifest.action?.default_popup, ...Object.values(manifest.icons ?? {}),
    ...Object.values(manifest.action?.default_icon ?? {})].filter(Boolean);
  references.forEach(path => localFile(path));
  assert(manifest.background?.service_worker, 'Background service worker required');
  assert(manifest.side_panel?.default_path, 'Side-panel page required');
  assert.equal(manifest.background?.type, 'module', 'Background worker must load as a module');

  const files = walk(extension);
  for (const path of files) {
    const suffix = extname(path);
    if (suffix === '.html') {
      const html = readFileSync(path, 'utf8');
      assert(!/\bon\w+\s*=/i.test(html), `Inline event handler found in ${relative(root, path)}`);
      assert(!/javascript\s*:/i.test(html), `JavaScript URL found in ${relative(root, path)}`);
      for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
        const src = match[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
        assert(src, `Inline script found in ${relative(root, path)}`);
        assert(!match[2].trim(), `Inline script body found in ${relative(root, path)}`);
        localFile(src, dirname(path));
      }
      for (const match of html.matchAll(/<(img|link)\b[^>]*\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
        if (match[1].toLowerCase() === 'link' || !/^(?:https?:|data:|#)/i.test(match[2])) localFile(match[2], dirname(path));
      }
    }
    if (suffix === '.js' || suffix === '.mjs') {
      const source = readFileSync(path, 'utf8');
      assert(!/\beval\s*\(|\bnew\s+Function\s*\(/.test(source), `Evaluated script found in ${relative(root, path)}`);
      // Match import syntax, rather than ordinary strings such as call('import').
      // Static declarations begin at a statement boundary; dynamic imports need
      // an opening parenthesis immediately after the import keyword.
      const imports = [
        ...source.matchAll(/(?:^|[;\n])\s*import\s+(?:[\w*$,\s{}]+\s+from\s*)?["']([^"']+)["']/g),
        ...source.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g)
      ];
      for (const match of imports) {
        assert(match[1].startsWith('.'), `Runtime import must be local: ${match[1]}`);
        localFile(match[1], dirname(path));
      }
    }
  }

  console.log(`Validated CartScope ${pkg.version}: Manifest V3, local references/scripts, scoped permissions, release version.`);
  return { root, extension, version: pkg.version, files };
}

if (process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))) {
  try { validate(); } catch (error) { console.error(`Validation failed: ${error.message}`); process.exitCode = 1; }
}
