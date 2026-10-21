import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const site = JSON.parse(await readFile(path.join(root, 'content/site.json'), 'utf8'));
const origin = (process.env.SITE_URL || 'https://hearthwalker.github.io/andrewgrupp.com').replace(/\/$/, '');
if (!/^https:\/\//.test(origin)) throw new Error('SITE_URL must be an absolute HTTPS URL.');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = value => { if (!/^https:\/\//.test(value)) throw new Error(`External URL must use HTTPS: ${value}`); return esc(value); };
const assetPath = value => { if (!/^assets\/[a-zA-Z0-9/_.-]+$/.test(value) || value.includes('..')) throw new Error('Assets must be inside public/assets.'); return value; };
const entries = site.journal.filter(entry => entry.published === true).sort((a,b) => b.date.localeCompare(a.date));
for (const item of [...site.books, ...entries]) if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error('Invalid content slug.');
if (new Set(site.books.map(b => b.slug)).size !== site.books.length || new Set(entries.map(e => e.slug)).size !== entries.length) throw new Error('Duplicate slug.');
if (site.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(site.email)) throw new Error('Invalid correspondence email.');
if (site.photograph && !site.photographAlt) throw new Error('Author photograph requires alt text.');
for (const book of site.books) if (book.cover && !book.coverAlt) throw new Error('Book cover requires alt text.');
for (const photo of Object.values(site.landscapes || {})) if (!photo.alt || !photo.width || !photo.height) throw new Error('Landscape photographs require alt text and dimensions.');
await rm(out, {recursive:true, force:true});
await mkdir(out, {recursive:true});
await cp(path.join(root,'public'), out, {recursive:true});
const pages = [];
const arrow = '<span class="arrow" aria-hidden="true">→</span>';
const paragraphs = values => values.map(p => `<p>${esc(p)}</p>`).join('\n');
const landscape = (placement, href) => {
  const photo = site.landscapes?.[placement];
  if (!photo) return '';
  const sizes = '(max-width: 600px) calc(100vw - 40px), (max-width: 900px) calc(100vw - 64px), (max-width: 1272px) calc(100vw - 112px), 1160px';
  return `<figure class="landscape landscape-${placement} shell"><div class="landscape-frame"><img src="${href(assetPath(photo.image))}"${photo.small ? ` srcset="${href(assetPath(photo.small))} ${photo.smallWidth}w, ${href(assetPath(photo.image))} ${photo.width}w" sizes="${sizes}"` : ''} alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async"></div><figcaption>Photograph by Andrew Grupp</figcaption></figure>`;
};
const dateLabel = date => { const parsed = new Date(`${date}T12:00:00Z`); if (Number.isNaN(parsed.valueOf()) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid journal date.'); return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(parsed); };

async function page(route, title, description, active, render, {type='website', schema=null, index=true}={}) {
  const depth = route.split('/').filter(Boolean).length;
  const prefix = '../'.repeat(depth) || './';
  const href = target => `${prefix}${target}`;
  const canonical = `${origin}/${route}`;
  const nav = [['','Home'],['writing/','Writing'],['about/','About'], ...(entries.length ? [['journal/','Journal']] : []), ['contact/','Contact']];
  const data = schema || {'@context':'https://schema.org','@type':'WebSite',name:'Andrew Grupp',url:`${origin}/`,author:{'@type':'Person',name:site.name}};
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
${site.shareImage ? `<meta property="og:image" content="${origin}/${assetPath(site.shareImage)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Andrew Grupp. Poetry, prose and literary fiction. Nebraska.">` : ''}
<meta name="twitter:card" content="${site.shareImage ? 'summary_large_image' : 'summary'}">
<link rel="icon" type="image/svg+xml" href="${href('assets/favicon.svg')}">
<link rel="preload" href="${href('assets/fonts/cormorant-garamond.ttf')}" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="${href('assets/style.css')}">
<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header shell"><div class="header-inner"><a class="wordmark" href="${href('')}" aria-label="Andrew Grupp — home">Andrew Grupp</a><nav class="site-nav" aria-label="Main navigation">${nav.map(([url,label]) => `<a href="${href(url)}"${active===label ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav></div></header>
<main id="main" tabindex="-1">${render(href)}</main>
<footer class="site-footer shell"><p>© 2026 Andrew Grupp <span class="footer-mark" aria-hidden="true">/</span> Nebraska</p><a href="${href('contact/')}">Correspondence</a></footer>
</body>
</html>`;
  const filename = route === '404.html' ? '404.html' : `${route}index.html`;
  // 404 lives at the site root; its relative links are fixed below for nested unknown URLs.
  const finalHtml = route === '404.html' ? html.replaceAll('../', `${new URL(origin).pathname.replace(/\/$/,'')}/`) : html;
  await mkdir(path.dirname(path.join(out,filename)), {recursive:true});
  await writeFile(path.join(out,filename),finalHtml);
  if (index) pages.push(route);
}

await page('', 'Andrew Grupp — Poetry, Prose & Literary Fiction', site.introduction, 'Home', href => `
<section class="home-hero shell" aria-labelledby="author-name">
<div class="hero-topline"><span class="eyebrow">Poetry · Prose · Literary fiction</span><span class="eyebrow location">Based in Nebraska</span></div>
<div class="hero-grid"><h1 id="author-name"><span>Andrew</span> <span>Grupp</span></h1><div class="hero-copy"><p class="identity">Poetry, prose &amp;<br>literary fiction.</p><p class="intro">${esc(site.introduction)}</p><a class="text-link" href="${href('about/')}">About the author ${arrow}</a></div></div>
<div class="hero-bottom"><p>Published writing &amp; work in progress</p></div>
</section>
<section class="writing-band" aria-labelledby="writing-heading"><div class="shell"><div class="section-heading"><h2 id="writing-heading">The writing</h2><a href="${href('writing/')}">Explore the bibliography</a></div><div class="home-books">${site.books.map(book => `<a class="home-book" href="${href(`writing/${book.slug}/`)}"><div><span class="eyebrow">${esc(book.category)}</span><h3>${esc(book.title)}</h3><p>${esc(book.status)}</p></div>${arrow}</a>`).join('')}</div></div></section>${landscape('home',href)}`);

await page('writing/', 'Writing — Andrew Grupp', 'Published writing and work in progress by Andrew Grupp, including Ash and Pine and Housefall.', 'Writing', href => `
<div class="shell"><header class="page-heading"><span class="eyebrow">Bibliography</span><h1>Writing</h1><p class="deck">Published work and works in progress.</p></header><div class="bibliography">${site.books.map(book => `<article class="book-row"><p class="book-kind">${esc(book.category)}</p><div><h2><a href="${href(`writing/${book.slug}/`)}">${esc(book.title)}</a></h2><p>${esc(book.subtitle)}</p><p class="status">${esc(book.status)}</p></div><a class="text-link row-link" href="${href(`writing/${book.slug}/`)}" aria-label="About ${esc(book.title)}">About the book ${arrow}</a></article>`).join('')}</div></div>${landscape('writing',href)}`);

await page('about/', 'About — Andrew Grupp', 'Andrew Grupp is a Nebraska-based writer of poetry, prose, and literary fiction, and the author of Ash and Pine.', 'About', href => `
<div class="shell"><header class="page-heading"><span class="eyebrow">The author</span><h1>About Andrew</h1></header><div class="about-layout">${site.photograph ? `<img class="portrait" src="${href(assetPath(site.photograph))}"${site.photographSmall ? ` srcset="${href(assetPath(site.photographSmall))} 480w, ${href(assetPath(site.photograph))} 800w" sizes="(max-width: 600px) 260px, 300px"` : ''} alt="${esc(site.photographAlt)}" width="800" height="800" decoding="async">` : ''}<div class="prose"><p class="eyebrow">Based in Nebraska</p>${paragraphs(site.biography)}<a class="text-link" href="${href('writing/')}">Explore the writing ${arrow}</a></div></div></div>`, {schema:{'@context':'https://schema.org','@type':'Person',name:site.name,url:`${origin}/about/`,description:site.introduction,jobTitle:'Writer',...(site.photograph ? {image:`${origin}/${assetPath(site.photograph)}`} : {})}});

for (const book of site.books) {
  const other = site.books.find(b => b.slug !== book.slug);
  const description = book.tagline ? `${book.title}, a literary historical novel in progress by Andrew Grupp. ${book.tagline}` : `${book.title}: ${book.subtitle} by Andrew Grupp. ${book.status}.`;
  await page(`writing/${book.slug}/`, `${book.title} — Andrew Grupp`, description, 'Writing', href => `
<div class="shell"><header class="book-heading"><a class="back-link" href="${href('writing/')}">← All writing</a><p class="eyebrow">${esc(book.category)}</p><h1>${esc(book.title)}</h1><p class="book-subtitle">${esc(book.subtitle)}</p></header>
<div class="book-content"><aside class="status" aria-label="Book status">${esc(book.status)}</aside><div>${book.cover ? `<img class="book-cover" src="${href(assetPath(book.cover))}" alt="${esc(book.coverAlt)}" width="560" loading="lazy">` : ''}${book.tagline ? `<p class="tagline">${esc(book.tagline)}</p>` : ''}<div class="book-description">${book.description.length ? paragraphs(book.description) : `<p>${book.slug === 'ash-and-pine' ? '<em>Ash and Pine</em> brings together prose and poetry in a collection by Andrew Grupp, published in October 2026.' : '<em>Housefall</em> is a work of literary historical fiction, currently in progress.'}</p>`}</div>${book.purchaseUrl || book.playlistUrl ? `<div class="book-actions">${book.purchaseUrl ? `<a class="text-link" href="${safeUrl(book.purchaseUrl)}">Find the book ${arrow}</a>` : ''}${book.playlistUrl ? `<a class="text-link" href="${safeUrl(book.playlistUrl)}">Companion playlist on Spotify ${arrow}</a>` : ''}</div>` : ''}</div></div>
${other ? `<nav class="book-bottom" aria-label="More writing"><span>Also by Andrew Grupp</span><a href="${href(`writing/${other.slug}/`)}">${esc(other.title)} →</a></nav>` : ''}</div>`,{schema:{'@context':'https://schema.org','@type':'Book',name:`${book.title}${book.slug==='ash-and-pine' ? `: ${book.subtitle}` : ''}`,author:{'@type':'Person',name:site.name},genre:book.category,inLanguage:'en',url:`${origin}/writing/${book.slug}/`,...(book.year ? {datePublished:'2026-10'} : {}),...(book.cover ? {image:`${origin}/${assetPath(book.cover)}`} : {})}});
}

await page('contact/', 'Contact — Andrew Grupp', 'Professional correspondence with Andrew Grupp, author of poetry, prose, and literary fiction.', 'Contact', () => `
<div class="shell"><header class="page-heading"><span class="eyebrow">Get in touch</span><h1>Correspondence</h1></header><div class="prose-layout"><p class="eyebrow">Contact</p><div class="prose">${site.email && site.emailEnabled ? `<p>For professional correspondence, please write to<br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p>` : '<p>A public correspondence address will be added here when available.</p>'}</div></div></div>`);

if (entries.length) {
  await page('journal/', 'Journal — Andrew Grupp', 'Essays, literary reflections, and excerpts by Andrew Grupp.', 'Journal', href => `<div class="shell"><header class="page-heading"><span class="eyebrow">Occasional notes</span><h1>Journal</h1></header>${entries.map(entry => `<article class="journal-row"><time class="eyebrow" datetime="${esc(entry.date)}">${dateLabel(entry.date)}</time><h2><a href="${href(`journal/${entry.slug}/`)}">${esc(entry.title)}</a></h2><p>${esc(entry.summary)}</p></article>`).join('')}</div>`);
  for (const entry of entries) await page(`journal/${entry.slug}/`, `${entry.title} — Andrew Grupp`, entry.summary, 'Journal', href => `<article class="shell"><header class="page-heading"><a class="back-link" href="${href('journal/')}">← Journal</a><h1>${esc(entry.title)}</h1><time class="eyebrow" datetime="${esc(entry.date)}">${dateLabel(entry.date)}</time></header><div class="journal-entry">${paragraphs(entry.paragraphs)}</div></article>`, {type:'article'});
}

await page('404.html','Page not found — Andrew Grupp','This page could not be found. Return to Andrew Grupp’s writing.','',href => `<div class="shell"><div class="not-found"><span class="eyebrow">Page not found</span><h1>A different page.</h1><p>The page you’re looking for isn’t here. You can return home or explore the writing.</p><a class="text-link" href="${href('')}">Return home ${arrow}</a></div></div>`, {index:false});
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(route=>`<url><loc>${origin}/${route}</loc></url>`).join('')}</urlset>\n`);
console.log(`Built ${pages.length} pages + 404 at ${origin}. Journal: ${entries.length} published entries.`);
