import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
async function walk(dir) {const found=[]; for(const item of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);found.push(...(item.isDirectory()?await walk(file):[file]));} return found;}
const files = await walk(root);
const pages = files.filter(f=>f.endsWith('.html'));
const content=JSON.parse(await readFile('content/site.json','utf8'));
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
  assert(/<details class="aldric"><summary aria-label="Aldric, a small goat ornament">/.test(html),'keyboard/touch goat disclosure missing');
  assert(/<span class="aldric-note">Aldric was here\.<\/span>/.test(html),'Aldric discovery text missing');
  const readable=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
  assert(!readable.includes('&'),'unnecessary ampersand in literary copy or title');
  assert(!/Ash\s*(?:&|&amp;)\s*Pine/i.test(html),'incorrect published book title');
  const photoCount=[...html.matchAll(/<img\b[^>]*>/g)].length;
  assert(photoCount<=1,'more than one photographic feature');
  if(!content.emailEnabled)assert(!/href="[^"]*contact\//.test(html),'inactive contact promoted');
  for(const meta of html.matchAll(/<meta (?:name="description"|property="og:(?:title|description|image:alt)") content="([^"]+)"/g))assert(!meta[1].includes('&amp;'),'unnecessary ampersand in metadata');
  for(const img of html.matchAll(/<img\b[^>]*>/g)){
    assert(/alt="[^"]+"/.test(img[0]),'image requires meaningful alt text');
  }
  for(const match of html.matchAll(/srcset="([^"]+)"/g)){
    for(const candidate of match[1].split(',')){
      const url=candidate.trim().split(/\s+/)[0];
      try{await stat(path.resolve(path.dirname(file),url));checked++;}catch{errors.push(`${label}: broken responsive image ${url}`)}
    }
  }
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const link=match[1].replaceAll('&amp;','&');
    if(/^(https:|mailto:)/.test(link))continue;
    if(link==='#main')continue;
    const [urlWithQuery,hash]=link.split('#');
    const urlPart=urlWithQuery.split('?')[0];
    let target;
    if(urlPart.startsWith('/')){
      const base=siteBase.pathname.replace(/\/$/,'');
      target=path.join(root,urlPart.startsWith(base+'/')?urlPart.slice(base.length):urlPart);
    }else target=path.resolve(path.dirname(file),urlPart);
    try {if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);checked++;if(hash){const linked=await readFile(target,'utf8');assert(linked.includes(`id="${hash}"`),`missing fragment ${link}`);}}
    catch{errors.push(`${label}: broken local link ${link}`)}
  }
  for(const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(script[1])}catch{errors.push(`${label}: invalid JSON-LD`)}}
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert(html.includes(`property="og:url" content="${canonical}"`),'canonical and Open Graph URL differ');
}
// Validate font references independently from HTML links.
const css=await readFile(path.join(root,'assets/style.css'),'utf8');
for(const match of css.matchAll(/url\('([^']+)'\)/g)){try{await stat(path.resolve(root,'assets',match[1]));checked++;}catch{errors.push(`Missing CSS asset: ${match[1]}`)}}
if(content.shareImage){try{await stat(path.join(root,content.shareImage));checked++;}catch{errors.push('Missing Open Graph image')}}
if(!content.journal.some(e=>e.published===true) && files.some(f=>path.relative(root,f).startsWith('journal'+path.sep))) errors.push('Empty journal must not be published');
if(!content.emailEnabled && files.some(f=>path.relative(root,f).startsWith('contact'+path.sep)))errors.push('Inactive Contact page must not be generated');
const home=await readFile(path.join(root,'index.html'),'utf8');
const homeText=home.split('<main id="main" tabindex="-1">')[1].split('</main>')[0].replace(/<[^>]*>/g,' ');
if(/<img\b|<figure\b|photography\//.test(home))errors.push('Homepage must not render or preload photography');
if(!home.includes('<div class="opening-field" aria-hidden="true"></div>'))errors.push('Homepage color field missing');
if(/opening-art|white-space:nowrap[^}]*opening/.test(css))errors.push('Obsolete photograph styling or forced hero nowrap');
if(content.biography.some(p=>p.includes('landscape photographs')))errors.push('Biography must not claim landscape photographs absent from the site');
if((homeText.match(/Andrew Grupp/g)||[]).length!==1)errors.push('Homepage main content must display the full author name exactly once');
if((homeText.match(/Poetry, prose and literary fiction/g)||[]).length!==1)errors.push('Homepage genre descriptor must occur exactly once');
const ash=content.books.find(b=>b.slug==='ash-and-pine');
const ashHtml=await readFile(path.join(root,'writing/ash-and-pine/index.html'),'utf8');
if(!ash.cover || !ash.coverSource || !ashHtml.includes(`src="../../${ash.cover}"`))errors.push('Approved Ash and Pine front cover must be rendered');
if(!ash.coverAlt || !ashHtml.includes(`width="${ash.coverWidth}" height="${ash.coverHeight}"`))errors.push('Cover alt text or dimensions missing');
if(Math.abs(ash.coverWidth/ash.coverHeight-5.5/8.5)>.002)errors.push('Front-cover aspect ratio does not match approved print trim');
const novelHtml=await readFile(path.join(root,'writing/housefall/index.html'),'utf8');
if(novelHtml.includes('datePublished')||content.books.find(b=>b.slug==='housefall').purchaseUrl)errors.push('Housefall must not have a publication date or purchase link');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${pages.length} HTML pages, ${checked} local links/assets, metadata, landmarks, image alt text, structured data, inactive email, and journal visibility.`);
