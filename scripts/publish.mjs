import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const repo='qarteu/cartscope';
const prepareOnly=process.argv.includes('--prepare');
const run=(command,args,options={})=>{
  const result=spawnSync(command,args,{encoding:'utf8',env:authEnv,...options});
  if(result.status!==0)throw new Error(`${command} ${args.slice(0,3).join(' ')} failed: ${result.stderr||result.stdout}`);
  return result.stdout.trim();
};
let authEnv={...process.env};
let result=spawnSync('gh',['api','user','--jq','.login'],{encoding:'utf8',env:authEnv});
if(result.stdout.trim()!=='qarteu'){
  delete authEnv.GH_TOKEN;delete authEnv.GITHUB_TOKEN;
  result=spawnSync('gh',['api','user','--jq','.login'],{encoding:'utf8',env:authEnv});
}
if(result.status!==0||result.stdout.trim()!=='qarteu'){
  console.error('Publication needs the qarteu GitHub account. Run gh auth login --hostname github.com --web --git-protocol https, choose qarteu, then rerun npm run publish. No other account was used.');process.exit(1);
}
console.log('Verified GitHub account: qarteu');
run('npm',['run','validate']);
if(!prepareOnly){run('npm',['test']);run('npm',['run','package']);}
run('npm',['run','build:demo']);
const existing=spawnSync('gh',['repo','view',repo,'--json','url'],{encoding:'utf8',env:authEnv});
if(existing.status!==0)run('gh',['repo','create',repo,'--public','--description','CartScope Alpha: Chrome shopping side panel, transparent cost comparisons, and interactive demo.']);
const remote=spawnSync('git',['remote','get-url','origin'],{encoding:'utf8',env:authEnv});
if(remote.status!==0)run('git',['remote','add','origin',`https://github.com/${repo}.git`]);
else if(!/github\.com[:/]qarteu\/cartscope(?:\.git)?$/.test(remote.stdout.trim()))throw new Error('Origin must point to qarteu/cartscope before publication.');
const git=args=>run('git',['-c','credential.helper=','-c','credential.helper=!gh auth git-credential',...args]);
git(['push','-u','origin','main']);
const stories=JSON.parse(readFileSync('docs/issues.json','utf8'));
for(const [name,color,description]of [['alpha','1e4388','Alpha implementation'],['feedback','89c8b4','Quantitative and qualitative tester feedback'],['next-sprint','2c856d','Planned user stories for the next sprint'],['backlog','b2bdd0','Future scope'],['release','876327','Release and participant gates']])run('gh',['label','create',name,'--repo',repo,'--color',color,'--description',description,'--force']);
const issues=JSON.parse(run('gh',['issue','list','--repo',repo,'--state','all','--limit','200','--json','number,title,url,state']));
const directory=mkdtempSync(join(tmpdir(),'cartscope-publish-'));
const links=[];
for(const story of stories){
  let issue=issues.find(i=>i.title===story.title);
  if(!issue){const bodyFile=join(directory,'issue.md');writeFileSync(bodyFile,story.body);const url=run('gh',['issue','create','--repo',repo,'--title',story.title,'--label',story.label,'--body-file',bodyFile]);issue={url,number:Number(url.split('/').at(-1)),state:'OPEN'};}
  if(story.status==='done'&&issue.state!=='CLOSED')run('gh',['issue','close',String(issue.number),'--repo',repo]);
  links.push({...story,url:issue.url,number:issue.number});
}
writeFileSync('docs/PUBLISHED_ISSUES.md','# GitHub issue tracker\n\n'+links.map(i=>`- [${i.title}](${i.url}) — ${i.status}`).join('\n')+'\n');
run('git',['add','docs/PUBLISHED_ISSUES.md']);
if(spawnSync('git',['diff','--cached','--quiet']).status!==0)run('git',['commit','-m','Link published alpha and next sprint issues']);
git(['push','origin','main']);
const pagesDir=join(directory,'pages');cpSync('site',pagesDir,{recursive:true});
const pagesGit=args=>run('git',['-C',pagesDir,...args]);
pagesGit(['init','-b','gh-pages']);pagesGit(['config','user.name','Kartik Malunjkar']);pagesGit(['config','user.email','qarteu@users.noreply.github.com']);pagesGit(['add','.']);pagesGit(['commit','-m','Deploy CartScope Alpha browser demo']);pagesGit(['remote','add','origin',`https://github.com/${repo}.git`]);
run('git',['-C',pagesDir,'-c','credential.helper=','-c','credential.helper=!gh auth git-credential','push','--force','origin','gh-pages']);
const pages=spawnSync('gh',['api',`repos/${repo}/pages`],{encoding:'utf8',env:authEnv});
if(pages.status!==0)run('gh',['api',`repos/${repo}/pages`,'--silent','--method','POST','-f','build_type=legacy','-f','source[branch]=gh-pages','-f','source[path]=/']);
else if(JSON.parse(pages.stdout).source?.branch!=='gh-pages'||JSON.parse(pages.stdout).source?.path!=='/')run('gh',['api',`repos/${repo}/pages`,'--silent','--method','PUT','-f','build_type=legacy','-f','source[branch]=gh-pages','-f','source[path]=/']);
if(!prepareOnly){
  if(spawnSync('git',['rev-parse','v0.1.0'],{encoding:'utf8'}).status!==0)run('git',['tag','-a','v0.1.0','-m','CartScope Alpha 0.1.0']);
  git(['push','origin','v0.1.0']);
  const existingRelease=spawnSync('gh',['release','view','v0.1.0','--repo',repo],{encoding:'utf8',env:authEnv});
  if(existingRelease.status!==0)run('gh',['release','create','v0.1.0','--repo',repo,'--title','CartScope Alpha 0.1.0','--prerelease','--notes-file','CHANGELOG.md','artifacts/cartscope-alpha-0.1.0.zip','artifacts/cartscope-alpha-0.1.0.zip.sha256']);
  else run('gh',['release','upload','v0.1.0','--repo',repo,'--clobber','artifacts/cartscope-alpha-0.1.0.zip','artifacts/cartscope-alpha-0.1.0.zip.sha256']);
}
console.log(`Repository: https://github.com/${repo}\nRelease: https://github.com/${repo}/releases/tag/v0.1.0\nIssue tracker: https://github.com/${repo}/issues\nDemo: https://qarteu.github.io/cartscope/ (Pages build may take a few minutes)`);
