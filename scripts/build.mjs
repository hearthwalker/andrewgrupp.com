import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const site = JSON.parse(await readFile(path.join(root, 'content/site.json'), 'utf8'));
const styleVersion = createHash('sha256').update(await readFile(path.join(root,'public/assets/style.css'))).digest('hex').slice(0,12);
const origin = (process.env.SITE_URL || 'https://hearthwalker.github.io/andrewgrupp.com').replace(/\/$/, '');
if (!/^https:\/\//.test(origin)) throw new Error('SITE_URL must be an absolute HTTPS URL.');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = value => { if (!/^https:\/\//.test(value)) throw new Error('External links must use HTTPS.'); return esc(value); };
const assetPath = value => { if (!/^assets\/[a-zA-Z0-9/_.-]+$/.test(value) || value.includes('..')) throw new Error('Assets must be inside public/assets.'); return value; };
const entries = site.journal.filter(entry => entry.published === true).sort((a,b) => b.date.localeCompare(a.date));
const contactEnabled = Boolean(site.emailEnabled && site.email);
for (const collection of [site.books, entries]) {
  if (new Set(collection.map(item => item.slug)).size !== collection.length) throw new Error('Duplicate slug.');
  for (const item of collection) if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error('Invalid content slug.');
}
if (site.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(site.email)) throw new Error('Invalid correspondence email.');
if (site.photograph && !site.photographAlt) throw new Error('Author photograph requires alt text.');
for (const book of site.books) {
  if (book.cover && (!book.coverAlt || !book.coverWidth || !book.coverHeight)) throw new Error('Book covers require alt text and dimensions.');
  if (book.slug === 'ash-and-pine' && (!book.cover || !book.coverSource)) throw new Error('Ash and Pine requires its authentic approved front cover and source record.');
}
await rm(out, {recursive:true, force:true});
await mkdir(out, {recursive:true});
await cp(path.join(root,'public'), out, {recursive:true});
const pages = [];
const arrow = '<span class="arrow" aria-hidden="true">→</span>';
const paragraphs = values => values.map(p => `<p>${esc(p)}</p>`).join('\n');
const dateLabel = date => { const parsed = new Date(`${date}T12:00:00Z`); if (Number.isNaN(parsed.valueOf()) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid journal date.'); return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(parsed); };
const pageHeading = (title, deck='') => `<header class="page-heading"><h1>${esc(title)}</h1>${deck ? `<p class="deck">${esc(deck)}</p>` : ''}</header>`;
const bookActions = book => `<div class="book-actions">${book.purchaseUrl ? `<a class="text-link" href="${safeUrl(book.purchaseUrl)}">Find the book ${arrow}</a>` : ''}${book.playlistUrl ? `<a class="text-link" href="${safeUrl(book.playlistUrl)}">Companion playlist on Spotify ${arrow}</a>` : ''}</div>`;

async function page(route, title, description, active, render, {type='website', schema=null, index=true, share=null}={}) {
  const prefix = '../'.repeat(route.split('/').filter(Boolean).length) || './';
  const href = target => `${prefix}${target}`;
  const canonical = `${origin}/${route}`;
  const home = route === '';
  const nav = [['','Home'],['writing/','Writing'],['about/','About'], ...(entries.length ? [['journal/','Journal']] : []), ...(contactEnabled ? [['contact/','Contact']] : [])];
  const data = schema || {'@context':'https://schema.org','@type':'WebSite',name:site.name,url:`${origin}/`,author:{'@type':'Person',name:site.name}};
  const social = share || {image:site.shareImage,width:1200,height:630,alt:'Andrew Grupp. Poetry, prose and literary fiction.'};
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#F2EDE3">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="Andrew Grupp">
${index ? '' : '<meta name="robots" content="noindex">'}
<link rel="canonical" href="${canonical}">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="Andrew Grupp">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
${social.image ? `<meta property="og:image" content="${origin}/${assetPath(social.image)}"><meta property="og:image:width" content="${social.width}"><meta property="og:image:height" content="${social.height}"><meta property="og:image:alt" content="${esc(social.alt)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${href('assets/favicon.svg')}">
<link rel="preload" href="${href('assets/fonts/cormorant-garamond.ttf')}" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="${href('assets/style.css')}?v=${styleVersion}">
<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>
</head>
<body class="${home ? 'home-page' : 'interior-page'}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header shell"><div class="header-inner"><a class="${home ? 'monogram' : 'wordmark'}" href="${href('')}" aria-label="Andrew Grupp — home">${home ? 'AG<span aria-hidden="true">.</span>' : esc(site.name)}</a><nav class="site-nav" aria-label="Main navigation">${nav.map(([url,label]) => `<a href="${href(url)}"${active===label ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav></div></header>
<main id="main" tabindex="-1">${render(href)}</main>
<footer class="site-footer"><div class="shell footer-inner"><p>© 2026 <span class="footer-rights">All rights reserved.</span></p><nav aria-label="Footer navigation">${nav.filter(([,label])=>label!=='Home').map(([url,label])=>`<a href="${href(url)}">${label}</a>`).join('')}</nav><p class="footer-location">Nebraska</p></div></footer>
</body>
</html>`;
  const filename = route === '404.html' ? '404.html' : `${route}index.html`;
  const finalHtml = route === '404.html' ? html.replaceAll('../', `${new URL(origin).pathname.replace(/\/$/,'')}/`) : html;
  await mkdir(path.dirname(path.join(out,filename)), {recursive:true});
  await writeFile(path.join(out,filename),finalHtml);
  if (index) pages.push(route);
}

await page('', 'Andrew Grupp — Poetry, Prose and Literary Fiction', site.introduction, 'Home', href => {
  const photo = site.landscapes?.home;
  return `<section class="opening shell" aria-labelledby="author-name"><div class="opening-copy"><p class="kicker">${esc(site.identity)}</p><h1 id="author-name">${esc(site.name)}</h1><p class="opening-intro">${esc(site.introduction)}</p><a class="text-link primary-link" href="${href('writing/')}">Explore the writing ${arrow}</a></div>${photo ? `<figure class="opening-art"><img src="${href(assetPath(photo.image))}" srcset="${href(assetPath(photo.small))} ${photo.smallWidth}w, ${href(assetPath(photo.image))} ${photo.width}w" sizes="(max-width: 760px) calc(100vw - 104px), 390px" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" decoding="async" fetchpriority="high"></figure>` : ''}</section>
<section class="selected-writing" aria-labelledby="selected-title"><div class="shell selected-inner"><h2 id="selected-title">Selected writing</h2><div class="selected-list">${site.books.map(book=>`<p><a href="${href(`writing/${book.slug}/`)}">${esc(book.title)}</a><span>${esc(book.year || book.status)}</span></p>`).join('')}</div></div></section>`;
});

await page('writing/', 'Writing — Andrew Grupp', 'Published work and literary fiction in progress by Andrew Grupp, including Ash and Pine and Housefall.', 'Writing', href => `<div class="shell page-content">${pageHeading('Writing','Books and works in progress.')}<div class="bibliography">${site.books.map(book => `<article class="book-row"><p class="book-state">${esc(book.status)}</p><div><h2><a href="${href(`writing/${book.slug}/`)}">${esc(book.title)}</a></h2><p class="book-subtitle">${esc(book.subtitle)}</p></div><a class="text-link row-link" href="${href(`writing/${book.slug}/`)}" aria-label="Read about ${esc(book.title)}">Read more ${arrow}</a></article>`).join('')}</div></div>`);

await page('about/', 'About — Andrew Grupp', 'Andrew Grupp is the author of Ash and Pine and is writing Housefall, a literary historical novel. He lives in Nebraska.', 'About', href => `<div class="shell page-content">${pageHeading('About')}<div class="about-layout">${site.photograph ? `<img class="portrait" src="${href(assetPath(site.photograph))}" srcset="${href(assetPath(site.photographSmall))} 480w, ${href(assetPath(site.photograph))} 800w" sizes="(max-width: 600px) 220px, 280px" alt="${esc(site.photographAlt)}" width="800" height="800" decoding="async">` : ''}<div class="prose">${paragraphs(site.biography)}<a class="text-link" href="${href('writing/')}">Explore the writing ${arrow}</a></div></div></div>`, {schema:{'@context':'https://schema.org','@type':'Person',name:site.name,url:`${origin}/about/`,description:site.biography.join(' '),jobTitle:'Writer',...(site.photograph ? {image:`${origin}/${assetPath(site.photograph)}`} : {})}});

for (const book of site.books) {
  const other = site.books.find(b => b.slug !== book.slug);
  const published = Boolean(book.year);
  const description = published ? `${book.title}: ${book.subtitle} by Andrew Grupp. ${book.status}.` : `${book.title}, a literary historical novel in progress by Andrew Grupp. ${book.tagline}`;
  const bookSchema = {'@context':'https://schema.org','@type':'Book',name:`${book.title}${published ? `: ${book.subtitle}` : ''}`,author:{'@type':'Person',name:site.name},genre:book.category,inLanguage:'en',url:`${origin}/writing/${book.slug}/`,...(published ? {datePublished:book.publicationDate || book.year} : {}),...(book.cover ? {image:`${origin}/${assetPath(book.cover)}`} : {})};
  const social = book.cover ? {image:book.cover,width:book.coverWidth,height:book.coverHeight,alt:book.coverAlt} : null;
  await page(`writing/${book.slug}/`, `${book.title} — Andrew Grupp`, description, 'Writing', href => `<article class="shell book-detail"><a class="back-link" href="${href('writing/')}">← All writing</a>${published ? `<div class="published-opening"><div class="cover-column"><div class="cover-mount"><img class="book-cover" src="${href(assetPath(book.cover))}" srcset="${href(assetPath(book.coverSmall))} 360w, ${href(assetPath(book.cover))} ${book.coverWidth}w" sizes="(max-width: 600px) 240px, 280px" alt="${esc(book.coverAlt)}" width="${book.coverWidth}" height="${book.coverHeight}" fetchpriority="high" decoding="async"></div></div><header class="book-title"><p class="book-state">${esc(book.status)}</p><h1>${esc(book.title)}</h1><p class="book-subtitle">${esc(book.subtitle)}</p>${bookActions(book)}</header></div><div class="book-body prose">${paragraphs(book.description)}</div>` : `<header class="novel-heading"><p class="book-state">${esc(book.category)} <span aria-hidden="true">·</span> ${esc(book.status)}</p><h1>${esc(book.title)}</h1></header><div class="novel-tagline"><p>${esc(book.tagline)}</p></div><div class="novel-body prose">${paragraphs(book.description)}</div>`}${other ? `<nav class="book-bottom" aria-label="More writing"><span>More writing</span><a href="${href(`writing/${other.slug}/`)}">${esc(other.title)} ${arrow}</a></nav>` : ''}</article>`, {schema:bookSchema,share:social});
}

if (contactEnabled) await page('contact/', 'Contact — Andrew Grupp', 'Professional correspondence with Andrew Grupp.', 'Contact', () => `<div class="shell page-content">${pageHeading('Correspondence')}<div class="contact-body prose"><p>For professional correspondence, please write to<br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p></div></div>`);

if (entries.length) {
  await page('journal/', 'Journal — Andrew Grupp', 'Essays, literary reflections, and excerpts by Andrew Grupp.', 'Journal', href => `<div class="shell page-content">${pageHeading('Journal')}${entries.map(entry => `<article class="journal-row"><time class="kicker" datetime="${esc(entry.date)}">${dateLabel(entry.date)}</time><h2><a href="${href(`journal/${entry.slug}/`)}">${esc(entry.title)}</a></h2><p>${esc(entry.summary)}</p></article>`).join('')}</div>`);
  for (const entry of entries) await page(`journal/${entry.slug}/`, `${entry.title} — Andrew Grupp`, entry.summary, 'Journal', href => `<article class="shell page-content"><a class="back-link" href="${href('journal/')}">← Journal</a>${pageHeading(entry.title)}<time class="kicker" datetime="${esc(entry.date)}">${dateLabel(entry.date)}</time><div class="journal-entry prose">${paragraphs(entry.paragraphs)}</div></article>`, {type:'article'});
}

await page('404.html','Page not found — Andrew Grupp','This page could not be found. Return to the writing.','',href => `<div class="shell page-content not-found">${pageHeading('Page not found')}<p>This page is no longer here.</p><a class="text-link" href="${href('')}">Return home ${arrow}</a></div>`, {index:false});
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(route=>`<url><loc>${origin}/${route}</loc></url>`).join('')}</urlset>\n`);
console.log(`Built ${pages.length} pages + 404 at ${origin}. Contact: ${contactEnabled ? 'enabled' : 'hidden'}. Journal: ${entries.length} published entries.`);

