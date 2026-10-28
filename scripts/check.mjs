import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('dist');
async function walk(dir) {const found=[]; for(const item of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);found.push(...(item.isDirectory()?await walk(file):[file]));} return found;}
const files = await walk(root);
const pages = files.filter(f=>f.endsWith('.html'));
const content=JSON.parse(await readFile('content/site.json','utf8'));
const letters=content.letters||{};
const cloudflareToken=content.analytics?.cloudflareToken;
const analytics=cloudflareToken ? `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${JSON.stringify({token:cloudflareToken})}'></script>` : '';
const errors=[];
let checked=0;
const siteBase = new URL((await readFile(path.join(root,'index.html'),'utf8')).match(/rel="canonical" href="([^"]+)/)[1]);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// The footer ornament is protected: it must survive byte for byte on every page.
const aldric = `<details class="aldric"><summary aria-label="Aldric, a small goat ornament"><svg viewBox="0 0 42 32" width="30" height="24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 13 5 9 2 8 3 12 7 16 8 23 6 30h4l3-8h10l2 8h4l-1-10 4-5 5-1 3-4-5-2-1-3-3 3-3-1-3 6H14Z"/><path fill="currentColor" d="m31 9-1-4-3-3-2 1 3 4 1 4Zm3-1 1-4-1-4-2 1 1 4-2 4ZM34 14l-2 5-3-4Z"/></svg></summary><span class="aldric-note">Aldric was here.</span></details>`;
for(const file of pages){
  const html=await readFile(file,'utf8');
  const label=path.relative(root,file);
  const assert=(valid,message)=>{if(!valid)errors.push(`${label}: ${message}`)};
  assert((html.match(/<h1\b/g)||[]).length===1,'must have exactly one h1');
  assert(/<html lang="en">/.test(html),'language missing');
  assert(/<title>[^<]+<\/title>/.test(html),'title missing');
  assert(/name="description" content="[^"]+"/.test(html),'description missing');
  assert(/<a class="skip-link" href="#main">/.test(html),'skip link missing');
  assert(/<main id="main" tabindex="-1">/.test(html),'skip-link destination missing');
  assert(/<header class="site-header">/.test(html) && /<footer class="site-footer">/.test(html),'header or footer landmark missing');
  assert(/<nav[^>]+aria-label="Main navigation"/.test(html),'navigation landmark missing');
  assert(/property="og:url"/.test(html),'Open Graph URL missing');
  assert(/property="og:image" content="[^"]+"/.test(html),'Open Graph image missing');
  const withoutAnalytics=analytics ? html.replace(analytics,'') : html;
  assert(!/<script(?![^>]*application\/ld\+json)/.test(withoutAnalytics),'unexpected client-side JavaScript');
  if(analytics)assert(html.split(analytics).length===2,'configured analytics beacon must appear exactly once');
  assert(!/href="#"/.test(html),'dead placeholder link');
  assert(html.split(aldric).length===2,'Aldric footer ornament altered, missing or duplicated');
  assert((html.match(/Aldric was here\./g)||[]).length===1,'"Aldric was here." must appear exactly once');
  assert(html.indexOf(aldric)>html.indexOf('<footer class="site-footer">'),'Aldric must stay in the footer');
  // House style: double hyphens, never em dashes.
  assert(!html.includes('—') && !html.includes('&mdash;'),'em dash found; house style uses --');
  const readable=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
  assert(!readable.includes('&'),'unnecessary ampersand in literary copy or title');
  assert(!/Ash\s*(?:&|&amp;)\s*Pine/i.test(html),'incorrect published book title');
  if(!content.emailEnabled)assert(!/href="[^"]*contact\//.test(html),'inactive contact promoted');
  if(!letters.enabled)assert(!/<form\b/.test(html) && !/href="[^"]*letters\//.test(html),'inactive letters signup promoted');
  // Signup forms post only to the configured Kit form, with a labelled email field.
  for(const form of html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)){
    assert(form[0].includes(`action="${esc(letters.formAction)}" method="post"`),'form must post to the configured Kit form');
    const input=form[0].match(/<input\b[^>]*id="([^"]+)"[^>]*>/);
    assert(input && /type="email" name="email_address"[^>]*required/.test(input[0]) && form[0].includes(`<label class="label" for="${input[1]}">`),'signup email field must be labelled and required');
  }
  for(const meta of html.matchAll(/<meta (?:name="description"|property="og:(?:title|description|image:alt)") content="([^"]+)"/g))assert(!meta[1].includes('&amp;'),'unnecessary ampersand in metadata');
  for(const img of html.matchAll(/<img\b[^>]*>/g)){
    assert(/alt="[^"]+"/.test(img[0]),'image requires meaningful alt text');
    assert(/width="\d+" height="\d+"/.test(img[0]),'image requires width and height');
    assert(/fetchpriority="high"|loading="lazy"/.test(img[0]),'image must be marked high priority or lazy');
  }
  for(const frame of html.matchAll(/<iframe\b[^>]*>/g)){
    assert(/loading="lazy"/.test(frame[0]),'embed must be lazy-loaded');
    assert(/title="[^"]+"/.test(frame[0]),'embed requires a title');
    assert(/src="https:\/\/open\.spotify\.com\/embed\//.test(frame[0]),'only the official Spotify embed is expected');
  }
  for(const match of html.matchAll(/srcset="([^"]+)"/g)){
    for(const candidate of match[1].split(',')){
      const url=candidate.trim().split(/\s+/)[0];
      const target=url.startsWith('/')?path.join(root,url.slice(siteBase.pathname.length)):path.resolve(path.dirname(file),url);
      try{await stat(target);checked++;}catch{errors.push(`${label}: broken responsive image ${url}`)}
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
    }else target=urlPart?path.resolve(path.dirname(file),urlPart):file;
    try {if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);checked++;if(hash){const linked=await readFile(target,'utf8');assert(linked.includes(`id="${hash}"`),`missing fragment ${link}`);}}
    catch{errors.push(`${label}: broken local link ${link}`)}
  }
  // Absolute links (only the 404 page uses them) must carry the site's base path.
  if(label!=='404.html')assert(!/(?:href|src|srcset)="\//.test(html),'interior pages must use relative links');
  for(const og of html.matchAll(/property="og:image" content="([^"]+)"/g)){
    const local=og[1].startsWith(siteBase.origin+siteBase.pathname)?og[1].slice((siteBase.origin+siteBase.pathname).length):null;
    try{await stat(path.join(root,local));checked++;}catch{errors.push(`${label}: Open Graph image missing on disk ${og[1]}`)}
  }
  for(const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(script[1])}catch{errors.push(`${label}: invalid JSON-LD`)}}
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert(html.includes(`property="og:url" content="${canonical}"`),'canonical and Open Graph URL differ');
}
// Validate font references independently from HTML links.
const css=await readFile(path.join(root,'assets/style.css'),'utf8');
for(const match of css.matchAll(/url\('([^']+)'\)/g)){try{await stat(path.resolve(root,'assets',match[1]));checked++;}catch{errors.push(`Missing CSS asset: ${match[1]}`)}}
if(!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css))errors.push('Reduced-motion preference must be respected');
if(!content.journal.some(e=>e.published===true) && files.some(f=>path.relative(root,f).startsWith('journal'+path.sep))) errors.push('Empty journal must not be published');
if(!content.emailEnabled && files.some(f=>path.relative(root,f).startsWith('contact'+path.sep)))errors.push('Inactive Contact page must not be generated');
const read = route => readFile(path.join(root,route),'utf8');
if(!letters.enabled && files.some(f=>path.relative(root,f).startsWith('letters'+path.sep)))errors.push('Inactive Letters pages must not be generated');
if(letters.enabled){
  for(const route of ['letters/index.html','letters/thanks/index.html','letters/confirmed/index.html'])try{await stat(path.join(root,route))}catch{errors.push(`Letters: ${route} missing`)}
  const sitemap=await read('sitemap.xml');
  if(!sitemap.includes('/letters/</loc>') || sitemap.includes('/letters/thanks/') || sitemap.includes('/letters/confirmed/'))errors.push('Letters: only the signup page belongs in the sitemap');
  for(const route of ['letters/thanks/index.html','letters/confirmed/index.html'])if(!(await read(route).catch(()=>'')).includes('<meta name="robots" content="noindex">'))errors.push(`Letters: ${route} must be noindex`);
}
const home=await read('index.html');
const ash=content.books.find(b=>b.slug==='ash-and-pine');
const novel=content.books.find(b=>b.slug==='housefall');
const ashHtml=await read('writing/ash-and-pine/index.html');
const novelHtml=await read('writing/housefall/index.html');
// Poetry: every line in order, each kept whole.
const verseMarkup = excerpt => excerpt.lines.map(line=>`<span class="verse-line">${esc(line)}</span><br>`).join('\n');
for(const excerpt of ash.excerpts){
  if(!ashHtml.includes(verseMarkup(excerpt)))errors.push(`Ash and Pine: excerpt "${excerpt.title}" line breaks not preserved`);
}
if(!home.includes(verseMarkup(ash.excerpts[0])))errors.push('Home: featured excerpt line breaks not preserved');
if(!content.invitation.split(/(?<=\.)\s+/).every(s=>home.includes(`<span>${esc(s)}</span>`)))errors.push('Home: invitation line missing');
if(!/<title>Andrew Grupp · Poetry, Prose and Literary Fiction<\/title>/.test(home))errors.push('Homepage genre metadata missing');
if(!home.includes(`href="${esc(ash.purchaseUrl)}"`) || !home.includes(`href="${esc(ash.playlistUrl)}"`))errors.push('Home: Amazon and playlist links required');
if(/home-novel|home-about/.test(home))errors.push('Home: unrelated novel or biography sections must stay absent');
if(ash.homeDescription && !home.includes(`<p class="hero-description">${esc(ash.homeDescription)}</p>`))errors.push('Home: book description missing');
if(letters.enabled){
  for(const [label,html,id,before] of [
    ['Home',home,'home-letters','id="excerpt-title"'],
    ['Ash and Pine',ashHtml,'book-letters','id="playlist"'],
    ['Housefall',novelHtml,'novel-letters','class="prose novel-body"']
  ]){
    const section=html.indexOf(`aria-labelledby="${id}-title"`);
    const form=html.indexOf(`id="${id}-email"`);
    if(section<0 || form<section || html.indexOf(before)<0 || section<html.indexOf(before))errors.push(`${label}: Letters signup missing or out of order`);
  }
}
for(const [label,html] of [['Home',home],['Ash and Pine',ashHtml]]){
  if(!html.includes(`href="${esc(ash.purchaseUrl)}">${esc(ash.purchaseLabel)}</a>`))errors.push(`${label}: paperback purchase button missing`);
  if(ash.kindleUrl && !html.includes(`href="${esc(ash.kindleUrl)}">${esc(ash.kindleLabel)}</a>`))errors.push(`${label}: Kindle purchase button missing`);
  if(ash.kindleUrl && ash.kindleUnlimited && !html.includes('Free to read on Kindle Unlimited'))errors.push(`${label}: Kindle Unlimited note missing`);
}
if(!ash.cover || !ash.coverSource || !ashHtml.includes(`src="../../${ash.cover}"`))errors.push('Approved Ash and Pine front cover must be rendered');
if(!ash.coverAlt || !ashHtml.includes(`width="${ash.coverWidth}" height="${ash.coverHeight}"`))errors.push('Cover alt text or dimensions missing');
if(Math.abs(ash.coverWidth/ash.coverHeight-5.5/8.5)>.002)errors.push('Front-cover aspect ratio does not match approved print trim');
if(!ashHtml.includes(`property="og:image" content="${siteBase.origin}${siteBase.pathname}${ash.cover}"`))errors.push('Ash and Pine must share its own cover');
if(!/<iframe class="spotify"[^>]*loading="lazy"/.test(ashHtml))errors.push('Ash and Pine: lazy Spotify embed missing');
if(!ash.praise.length && /class="[^"]*praise/.test(ashHtml))errors.push('Praise block must stay hidden until real praise is added');
const ashLd=JSON.parse(ashHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const ashBook=ashLd.find(n=>n['@type']==='Book');
if(!ashBook || !ashBook.datePublished || !ashBook.author || !ashBook.sameAs?.includes(ash.purchaseUrl))errors.push('Ash and Pine Book structured data incomplete');
if(!ashLd.some(n=>n['@type']==='Person'))errors.push('Person structured data missing');
if(/isbn/i.test(ashHtml))errors.push('No ISBN is on record; do not publish one');
if(novelHtml.includes('datePublished')||novel.purchaseUrl)errors.push('Housefall must not have a publication date or purchase link');
if(!novelHtml.includes(`<p class="novel-tagline">`) || !novel.tagline.split(/(?<=\.)\s+/).every(s=>novelHtml.includes(`<span>${esc(s)}</span>`)))errors.push('Housefall tagline missing');
if(!novel.excerpts.length && novelHtml.includes('excerpt-band'))errors.push('Housefall excerpt must stay empty until one is added');
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`PASS: ${pages.length} HTML pages, ${checked} local links/assets, Aldric intact on every page, verse line breaks, house style, metadata, landmarks, image alt text and dimensions, structured data, inactive email, letters signup, and journal visibility.`);
