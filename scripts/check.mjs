import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
async function walk(dir) {const found=[]; for(const item of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);found.push(...(item.isDirectory()?await walk(file):[file]));} return found;}
const files = await walk(root);
const pages = files.filter(f=>f.endsWith('.html'));
const errors=[];
let checked=0;
const siteBase = new URL((await readFile(path.join(root,'index.html'),'utf8')).match(/rel="canonical" href="([^"]+)/)[1]);
for(const file of pages){
  const html=await readFile(file,'utf8');
  const label=path.relative(root,file);
  const assert=(valid,message)=>{if(!valid)errors.push(`${label}: ${message}`)};
  assert((html.match(/<h1\b/g)||[]).length===1,'must have exactly one h1');
  assert(/<html lang="en">/.test(html),'language missing');
  assert(/<title>[^<]+<\/title>/.test(html),'title missing');
  assert(/name="description" content="[^"]+"/.test(html),'description missing');
  assert(/<main id="main" tabindex="-1">/.test(html),'skip-link destination missing');
  assert(/<nav[^>]+aria-label="Main navigation"/.test(html),'navigation landmark missing');
  assert(/property="og:url"/.test(html),'Open Graph URL missing');
  assert(!/<script(?![^>]*application\/ld\+json)/.test(html),'unexpected client-side JavaScript');
  assert(!/href="#"/.test(html),'dead placeholder link');
  for(const img of html.matchAll(/<img\b[^>]*>/g))assert(/alt="[^"]+"/.test(img[0]),'image requires meaningful alt text');
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const link=match[1].replaceAll('&amp;','&');
    if(/^(https:|mailto:)/.test(link))continue;
    if(link==='#main')continue;
    const [urlPart,hash]=link.split('#');
    let target;
    if(urlPart.startsWith('/')){
      const base=siteBase.pathname.replace(/\/$/,'');
      target=path.join(root,urlPart.startsWith(base+'/')?urlPart.slice(base.length):urlPart);
    }else target=path.resolve(path.dirname(file),urlPart);
    try {if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);checked++;if(hash){const linked=await readFile(target,'utf8');assert(linked.includes(`id="${hash}"`),`missing fragment ${link}`);}}
    catch{errors.push(`${label}: broken local link ${link}`)}
  }
  for(const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(script[1])}catch{errors.push(`${label}: invalid JSON-LD`)}}
}
// Validate font references independently from HTML links.
const css=await readFile(path.join(root,'assets/style.css'),'utf8');
for(const match of css.matchAll(/url\('([^']+)'\)/g)){try{await stat(path.resolve(root,'assets',match[1]));checked++;}catch{errors.push(`Missing CSS asset: ${match[1]}`)}}
const content=JSON.parse(await readFile('content/site.json','utf8'));
if(content.shareImage){try{await stat(path.join(root,content.shareImage));checked++;}catch{errors.push('Missing Open Graph image')}}
if(!content.journal.some(e=>e.published===true) && files.some(f=>path.relative(root,f).startsWith('journal'+path.sep))) errors.push('Empty journal must not be published');
if(!content.emailEnabled && (await readFile(path.join(root,'contact/index.html'),'utf8')).includes('mailto:'))errors.push('Inactive mailbox must not be linked');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${pages.length} HTML pages, ${checked} local links/assets, metadata, landmarks, image alt text, structured data, inactive email, and journal visibility.`);
