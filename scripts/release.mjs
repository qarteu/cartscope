import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function releaseInfo(root = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  assert(/^\d+\.\d+\.\d+$/.test(pkg.version), 'Release version must have three numeric components');
  const version = pkg.version;
  const archiveName = `cartscope-alpha-${version}.zip`;
  return { version, tag: `v${version}`, archiveName, archivePath: `artifacts/${archiveName}`,
    checksumPath: `artifacts/${archiveName}.sha256`, title: `CartScope Alpha ${version}` };
}

export function releaseNotes(changelog, version) {
  const sections = [...changelog.matchAll(/^##\s+(\d+\.\d+\.\d+)(?=\s|$)[^\r\n]*/gm)];
  const matches = sections.filter(section => section[1] === version);
  assert.equal(matches.length, 1, `CHANGELOG must include exactly one release section for ${version}`);
  const current = matches[0];
  const remainder = changelog.slice(current.index + current[0].length);
  const following = /^##\s+/m.exec(remainder);
  const end = following ? current.index + current[0].length + following.index : changelog.length;
  const notes = changelog.slice(current.index, end).trim();
  assert(notes.slice(current[0].length).trim(), `Release notes for ${version} must not be empty`);
  return `${notes}\n`;
}
