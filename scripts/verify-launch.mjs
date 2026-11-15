import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {releaseInfo} from './release.mjs';
const release=releaseInfo();
const evidence='docs/launch/evidence';
mkdirSync(evidence,{recursive:true});mkdirSync('artifacts',{recursive:true});
const startedAt=new Date().toISOString();
const result=spawnSync('npm',['run','check'],{encoding:'utf8',maxBuffer:16*1024*1024});
const log=(result.stdout||'')+(result.stderr||'');
writeFileSync(`${evidence}/node-check-${release.version}.txt`,log);
const clean=log.replace(/\u001b\[[0-9;]*m/g,'');
function summary(label){const match=clean.match(new RegExp(`^(?:ℹ\\s*)?${label}\\s+(\\d+)\\s*$`,'m'));if(!match)throw new Error(`Missing Node test summary: ${label}`);return Number(match[1]);}
const record={version:release.version,channel:release.channel,startedAt,finishedAt:new Date().toISOString(),dateZone:'America/Los_Angeles',node:process.version,command:'npm run check',exitCode:result.status,tests:summary('tests'),passed:summary('pass'),failed:summary('fail'),skipped:summary('skipped')};
if(result.status===0){
 const bytes=readFileSync(release.archivePath);
 record.archive=release.archivePath;record.sha256=createHash('sha256').update(bytes).digest('hex');
 record.runtimeFiles=execFileSync('unzip',['-Z1',release.archivePath],{encoding:'utf8'}).trim().split('\n').length;
 record.manifestVersion=JSON.parse(execFileSync('unzip',['-p',release.archivePath,'manifest.json'],{encoding:'utf8'})).version;
 execFileSync('unzip',['-t',release.archivePath]);record.zipCrcs='passed';
 if(!existsSync('artifacts/node-results.xml'))throw new Error('Node JUnit report was not produced');
 writeFileSync(`${evidence}/node-results-${release.version}.xml`,readFileSync('artifacts/node-results.xml'));
 writeFileSync(`${evidence}/dom-results-${release.version}.json`,readFileSync('artifacts/ui-results.json'));
}
writeFileSync(`${evidence}/verification-${release.version}.json`,JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify(record,null,2));
if(result.status!==0)process.exitCode=result.status||1;
