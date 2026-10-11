import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, relative, resolve } from 'node:path';
import { validate } from './validate.mjs';

// ZIP method 0 (stored) keeps packaging dependency-free. Fixed timestamps and
// sorted paths make the same runtime bytes produce the same release archive.
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zip(files) {
  const localParts = [];
  const directoryParts = [];
  let offset = 0;
  for (const { name, data } of files) {
    const filename = Buffer.from(name, 'utf8');
    const checksum = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 filenames
    local.writeUInt16LE(0, 8); // stored, no compression
    local.writeUInt16LE(0, 10); // 00:00:00
    local.writeUInt16LE(0x0021, 12); // 1980-01-01
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(filename.length, 26);
    localParts.push(local, filename, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x0021, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(filename.length, 28);
    central.writeUInt32LE(offset, 42);
    directoryParts.push(central, filename);
    offset += local.length + filename.length + data.length;
  }
  const directory = Buffer.concat(directoryParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, directory, end]);
}

try {
  const { root, extension, version, files } = validate();
  const entries = files.map(path => ({ name: relative(extension, path).replaceAll('\\', '/'), data: readFileSync(path) }));
  if (entries.length >= 65535 || entries.some(file => file.data.length >= 0xffffffff)) throw new Error('Release exceeds basic ZIP format limits');
  const archive = zip(entries);
  const outputDirectory = resolve(root, 'artifacts');
  mkdirSync(outputDirectory, { recursive: true });
  const outputPath = resolve(outputDirectory, `cartscope-alpha-${version}.zip`);
  writeFileSync(outputPath, archive);
  const hash = createHash('sha256').update(archive).digest('hex');
  writeFileSync(`${outputPath}.sha256`, `${hash}  ${basename(outputPath)}\n`);
  console.log(`Packaged ${entries.length} runtime files: ${outputPath}`);
  console.log(`SHA-256: ${hash}`);
} catch (error) {
  console.error(`Packaging failed: ${error.message}`);
  process.exitCode = 1;
}
