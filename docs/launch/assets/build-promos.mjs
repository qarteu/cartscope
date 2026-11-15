// Authoring only. Requires sharp; no dependency is added to the extension.
// CARTSCOPE_SHARP_PATH may point at an already installed sharp package.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require(process.env.CARTSCOPE_SHARP_PATH || 'sharp');
const directory = new URL('./', import.meta.url);
const logo = await readFile(new URL('../../../extension/assets/mark.svg', import.meta.url), 'utf8');
const mark = logo.replace(/<svg\b[^>]*>/, '<g>').replace('</svg>', '</g>');
const logoAt = (x,y,size) => `<g transform="translate(${x} ${y}) scale(${size/128})">${mark}</g>`;
const fonts = 'Arial, Helvetica, sans-serif';
const start = (width,height) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#2b5745"/>`;
const assets = [
  ['store-small-tile',440,280,`${start(440,280)}
    <path d="M316 0H440V280H363" fill="#315d4b"/>
    ${logoAt(28,24,60)}
    <text x="105" y="63" fill="#f5f1e8" font-family="${fonts}" font-size="34" font-weight="700" letter-spacing="-1.5">CartScope</text>
    <rect x="34" y="116" width="7" height="7" fill="#dc9566"/>
    <text x="34" y="164" fill="#f5f1e8" font-family="Georgia,serif" font-size="34" letter-spacing="-.8">Your shopping desk.</text>
    <text x="35" y="218" fill="#d6e2c5" font-family="${fonts}" font-size="15">Save items. Compare checked offers.</text>
    <path d="M34 245H406" stroke="#6e8a73" stroke-width="1"/>
  </svg>`],
  ['store-marquee',1400,560,`${start(1400,560)}
    <path d="M935 0H1400V560H1055" fill="#315d4b"/>
    ${logoAt(60,50,76)}
    <text x="157" y="104" fill="#f5f1e8" font-family="${fonts}" font-size="52" font-weight="700" letter-spacing="-2">CartScope</text>
    <rect x="67" y="186" width="10" height="10" fill="#dc9566"/>
    <text x="65" y="272" fill="#f5f1e8" font-family="Georgia,serif" font-size="66" letter-spacing="-1.5">Keep the list.</text>
    <text x="65" y="351" fill="#f5f1e8" font-family="Georgia,serif" font-size="66" letter-spacing="-1.5">Check the costs.</text>
    <text x="68" y="445" fill="#d6e2c5" font-family="${fonts}" font-size="22">Save items · Compare checked offers · Keep useful notes</text>
    <path d="M67 493H810" stroke="#6e8a73" stroke-width="1"/>
    ${logoAt(986,135,285)}
  </svg>`]
];
const records=[];
for (const [name,width,height,svg] of assets) {
  await writeFile(new URL(name+'.svg',directory),svg+'\n');
  const output=await sharp(Buffer.from(svg)).png().toBuffer();
  const metadata=await sharp(output).metadata();
  if(metadata.width!==width||metadata.height!==height)throw new Error('Unexpected image dimensions');
  await writeFile(new URL(name+'.png',directory),output);
  records.push({name,width,height,svg:name+'.svg',png:name+'.png',sha256:createHash('sha256').update(output).digest('hex')});
}
await writeFile(new URL('asset-manifest.json',directory),JSON.stringify({
  kind:'Original code-native promotional artwork; not screenshots',
  original_mark:'extension/assets/mark.svg',
  mark_sha256:createHash('sha256').update(logo).digest('hex'),
  renderer:'sharp SVG rasterization',
  screenshot_content:false,
  store_approval_claim:false,
  assets:records
},null,2)+'\n');
console.log(`Rendered ${records.length} original SVG/PNG promotional assets in ${fileURLToPath(directory)}`);
