import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const site = JSON.parse(await readFile(path.join(root, 'content/site.json'), 'utf8'));
const styleVersion = createHash('sha256').update(await readFile(path.join(root,'public/assets/style.css'))).digest('hex').slice(0,12);
const origin = (process.env.SITE_URL || 'https://andrewgrupp.com').replace(/\/$/, '');
if (!/^https:\/\//.test(origin)) throw new Error('SITE_URL must be an absolute HTTPS URL.');
// "/andrewgrupp.com/" on the project site, "/" at a domain root. Only the 404 page needs it.
const basePath = new URL(`${origin}/`).pathname;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = value => { if (!/^https:\/\//.test(value)) throw new Error('External links must use HTTPS.'); return esc(value); };
const assetPath = value => { if (!/^assets\/[a-zA-Z0-9/_.-]+$/.test(value) || value.includes('..')) throw new Error('Assets must be inside public/assets.'); return value; };
const entries = site.journal.filter(entry => entry.published === true).sort((a,b) => b.date.localeCompare(a.date));
const contactEnabled = Boolean(site.emailEnabled && site.email);
// The newsletter signup posts straight to Kit; no script is involved.
const letters = site.letters || {};
const lettersEnabled = letters.enabled === true;
if (lettersEnabled && !/^https:\/\/app\.kit\.com\/forms\/\d+\/subscriptions$/.test(letters.formAction || '')) throw new Error('Letters need a Kit form action: https://app.kit.com/forms/<id>/subscriptions');
for (const collection of [site.books, entries]) {
  if (new Set(collection.map(item => item.slug)).size !== collection.length) throw new Error('Duplicate slug.');
  for (const item of collection) if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error('Invalid content slug.');
}
if (site.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(site.email)) throw new Error('Invalid correspondence email.');
if (site.photograph && !site.photographAlt) throw new Error('Author photograph requires alt text.');
for (const book of site.books) {
  if (book.cover && (!book.coverAlt || !book.coverWidth || !book.coverHeight || !book.coverBase || !book.coverWidths?.length)) throw new Error('Book covers require alt text, dimensions and responsive sizes.');
  if (book.slug === 'ash-and-pine' && (!book.cover || !book.coverSource)) throw new Error('Ash and Pine requires its authentic approved front cover and source record.');
  for (const excerpt of book.excerpts || []) if (!excerpt.title || !Array.isArray(excerpt.lines) || !excerpt.lines.length) throw new Error('Excerpts require a title and lines.');
  for (const item of book.praise || []) if (!item.quote || !item.source) throw new Error('Praise requires a quote and its source.');
  if (book.playlistUrl && !/^https:\/\/open\.spotify\.com\/playlist\/[A-Za-z0-9]+$/.test(book.playlistUrl)) throw new Error('Playlist must be an open.spotify.com playlist URL.');
}
const featured = site.books.find(book => book.year && book.cover);
if (!featured) throw new Error('Home needs one published book with a cover.');
await rm(out, {recursive:true, force:true});
await mkdir(out, {recursive:true});
await cp(path.join(root,'public'), out, {recursive:true});
const pages = [];
const arrow = '<span class="arrow" aria-hidden="true">→</span>';
const aldric = `<details class="aldric"><summary aria-label="Aldric, a small goat ornament"><svg viewBox="0 0 42 32" width="30" height="24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 13 5 9 2 8 3 12 7 16 8 23 6 30h4l3-8h10l2 8h4l-1-10 4-5 5-1 3-4-5-2-1-3-3 3-3-1-3 6H14Z"/><path fill="currentColor" d="m31 9-1-4-3-3-2 1 3 4 1 4Zm3-1 1-4-1-4-2 1 1 4-2 4ZM34 14l-2 5-3-4Z"/></svg></summary><span class="aldric-note">Aldric was here.</span></details>`;
const paragraphs = values => values.map(p => `<p>${esc(p)}</p>`).join('\n');
// Escape prose before adding emphasis to the two book titles in the biography.
const biographyParagraphs = site.biography.map(p => `<p>${esc(p).replace(/\b(Ash and Pine|Housefall)\b/g, '<em>$1</em>')}</p>`).join('\n');
const dateLabel = date => { const parsed = new Date(`${date}T12:00:00Z`); if (Number.isNaN(parsed.valueOf()) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid journal date.'); return new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(parsed); };
const pageHeading = (title, deck='') => `<header class="page-heading"><h1>${esc(title)}</h1>${deck ? `<p class="deck">${esc(deck)}</p>` : ''}</header>`;
const bookUrl = book => `writing/${book.slug}/`;
// Display lines break between sentences rather than wherever the measure runs out.
const sentences = text => text.match(/[^.]+\.\s*/g).map(s => `<span>${esc(s.trim())}</span>`).join(' ');

// WebP first, JPEG fallback. Width and height reserve the space before load.
const picture = (href, {base, widths, fallback, width, height, alt, sizes, eager=false}) => {
  const set = ext => widths.map(w => `${href(assetPath(`${base}-${w}.${ext}`))} ${w}w`).join(', ');
  return `<picture><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="${href(assetPath(fallback))}" srcset="${set('jpg')}" sizes="${sizes}" alt="${esc(alt)}" width="${width}" height="${height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></picture>`;
};
const coverPicture = (href, book, sizes, eager) => picture(href, {base:book.coverBase, widths:book.coverWidths, fallback:book.cover, width:book.coverWidth, height:book.coverHeight, alt:book.coverAlt, sizes, eager});
const portraitPicture = (href, sizes, eager) => picture(href, {base:site.photographBase, widths:site.photographWidths, fallback:site.photograph, width:800, height:800, alt:site.photographAlt, sizes, eager});
// The author photo for About and the homepage teaser; falls back to the square portrait.
const aboutPhoto = site.aboutPhotograph ? {image:site.aboutPhotograph, width:site.aboutPhotographWidth, height:site.aboutPhotographHeight, alt:site.aboutPhotographAlt} : {image:site.photograph, width:800, height:800, alt:site.photographAlt};
const aboutPicture = (href, sizes, eager=true) => site.aboutPhotograph ? picture(href, {base:site.aboutPhotographBase, widths:site.aboutPhotographWidths, fallback:site.aboutPhotograph, width:site.aboutPhotographWidth, height:site.aboutPhotographHeight, alt:site.aboutPhotographAlt, sizes, eager}) : portraitPicture(href, sizes, eager);
const actions = (book, playlistHref=book.playlistUrl) => `<div class="actions">${book.purchaseUrl ? `<a class="button" href="${safeUrl(book.purchaseUrl)}">${esc(book.purchaseLabel || 'Buy the book')}</a>` : ''}${book.playlistUrl ? `<a class="text-link" href="${playlistHref.startsWith('#') ? playlistHref : safeUrl(playlistHref)}">Listen to the playlist ${arrow}</a>` : ''}</div>`;
// Each line is its own block so it never reflows into its neighbor; the <br>s keep
// the breaks in reader modes and copied text.
const verse = excerpt => `<figure class="verse"><blockquote class="verse-lines">${excerpt.lines.map(line => `<span class="verse-line">${esc(line)}</span><br>`).join('\n')}</blockquote><figcaption>-- from “${esc(excerpt.title)}”</figcaption></figure>`;
const signup = (id, note=letters.note) => `<form class="signup" action="${safeUrl(letters.formAction)}" method="post"><label class="label" for="${id}">Email address</label><div class="signup-row"><input class="signup-input" id="${id}" type="email" name="email_address" autocomplete="email" required><button class="button" type="submit">Subscribe</button></div><p class="signup-note">${esc(note)}</p></form>`;
const lettersBand = (id, heading, line) => lettersEnabled ? `<section class="band letters" aria-labelledby="${id}-title"><div class="shell"><div class="letters-inner"><p class="label">Letters</p><h2 id="${id}-title">${esc(heading)}</h2><p class="letters-line">${esc(line)}</p>${signup(`${id}-email`)}</div></div></section>` : '';
const excerptBand = (book, id) => (book.excerpts || []).length ? `<section class="band excerpt-band" aria-labelledby="${id}"><div class="shell"><h2 class="label" id="${id}">From the book</h2>${book.excerpts.map(verse).join('')}</div></section>` : '';

const personId = `${origin}/#author`;
const person = {'@type':'Person','@id':personId,name:site.name,url:`${origin}/`,jobTitle:'Writer',description:site.biography.join(' '),homeLocation:{'@type':'Place',name:'Nebraska, United States'},...(aboutPhoto.image ? {image:`${origin}/${assetPath(aboutPhoto.image)}`} : {})};
const bookData = book => {
  const published = Boolean(book.year);
  return {'@type':'Book','@id':`${origin}/${bookUrl(book)}#book`,name:`${book.title}${published ? `: ${book.subtitle}` : ''}`,author:{'@type':'Person','@id':personId,name:site.name},genre:book.category,inLanguage:'en',url:`${origin}/${bookUrl(book)}`,description:book.description[0],...(published ? {datePublished:book.publicationDate || book.year} : {creativeWorkStatus:book.status}),...(book.cover ? {image:`${origin}/${assetPath(book.cover)}`} : {}),...(book.purchaseUrl ? {sameAs:[book.purchaseUrl]} : {})};
};
const graph = (...nodes) => ({'@context':'https://schema.org','@graph':nodes});
const website = {'@type':'WebSite','@id':`${origin}/#website`,name:site.name,url:`${origin}/`,author:{'@id':personId}};
const defaultShare = {image:site.shareImage,width:1200,height:630,alt:site.shareImageAlt};

async function page(route, title, description, active, render, {type='website', schema=null, index=true, share=null}={}) {
  // Relative links work under the project path and at a domain root. The 404 page is
  // served at any depth, so it alone uses the absolute base path.
  const prefix = route === '404.html' ? basePath : ('../'.repeat(route.split('/').filter(Boolean).length) || './');
  const href = target => `${prefix}${target}`;
  const canonical = `${origin}/${route}`;
  const home = route === '';
  const nav = [['writing/','Writing'],['about/','About'], ...(lettersEnabled ? [['letters/','Letters']] : []), ...(entries.length ? [['journal/','Journal']] : []), ...(contactEnabled ? [['contact/','Contact']] : [])];
  const footerNav = nav;
  const data = schema || graph(website, person);
  const social = share || defaultShare;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#F2EDE3" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#211E1B" media="(prefers-color-scheme: dark)">
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
<meta property="og:image" content="${origin}/${assetPath(social.image)}"><meta property="og:image:width" content="${social.width}"><meta property="og:image:height" content="${social.height}"><meta property="og:image:alt" content="${esc(social.alt)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/svg+xml" href="${href('assets/favicon.svg')}">
<link rel="preload" href="${href('assets/fonts/cormorant-garamond-500.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${href('assets/style.css')}?v=${styleVersion}">
<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>
</head>
<body class="${home ? 'home-page' : 'interior-page'}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><div class="shell"><a class="wordmark" href="${href('')}"${home ? ' aria-current="page"' : ''}>${esc(site.name)}</a><nav class="site-nav" aria-label="Main navigation">${nav.map(([url,label]) => `<a href="${href(url)}"${active===label ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav></div></header>
<main id="main" tabindex="-1">${render(href)}</main>
<footer class="site-footer"><div class="shell footer-inner"><p class="footer-credit"><span>© 2026 ${esc(site.name)}</span> <span class="footer-place">· Nebraska, United States</span></p><nav aria-label="Footer navigation">${footerNav.map(([url,label])=>`<a href="${href(url)}">${label}</a>`).join('')}</nav>${aldric}</div></footer>
</body>
</html>`;
  const filename = route === '404.html' ? '404.html' : `${route}index.html`;
  await mkdir(path.dirname(path.join(out,filename)), {recursive:true});
  await writeFile(path.join(out,filename),html);
  if (index) pages.push(route);
}

await page('', `${site.name} · Poetry, Prose and Literary Fiction`, `${featured.title}: ${featured.subtitle}, by ${site.name}. ${featured.heroLine}`, 'Home', href => `<section class="hero" aria-labelledby="hero-title"><div class="shell hero-inner">
<a class="hero-cover cover" href="${href(bookUrl(featured))}">${coverPicture(href, featured, '(max-width: 760px) min(60vw, 250px), 400px', true)}</a>
<div class="hero-copy"><p class="label">${esc(featured.status)}</p><h1 id="hero-title">${esc(featured.title)}</h1><p class="hero-subtitle">${esc(featured.subtitle)}</p><p class="hero-line">${esc(featured.heroLine)}</p>${actions(featured)}</div>
</div></section>
<section class="band excerpt-band" aria-labelledby="excerpt-title"><div class="shell"><h2 class="label" id="excerpt-title">From the book</h2>${verse(featured.excerpts[0])}<p class="invitation">${sentences(site.invitation)}</p></div></section>`, {schema:graph(website, person, bookData(featured))});

await page('writing/', `Writing · ${site.name}`, 'Published work and literary fiction in progress by Andrew Grupp, including Ash and Pine and Housefall.', 'Writing', href => `<div class="shell page-content">${pageHeading('Writing','Books and works in progress.')}<ul class="shelf" role="list">${site.books.map(book => `<li><a class="shelf-link" href="${href(bookUrl(book))}"><div class="shelf-stand">${book.cover ? `<div class="cover">${coverPicture(href, book, '(max-width: 600px) calc(50vw - 40px), 250px', true)}</div>` : `<div class="type-cover" aria-hidden="true"><span><span class="type-cover-title">${esc(book.title)}</span><span class="type-cover-rule"></span></span><span class="type-cover-status">${esc(book.status)}</span></div>`}</div><div class="shelf-caption"><p class="label">${esc(book.status)}</p><h2 class="shelf-title">${esc(book.title)}</h2><p class="shelf-subtitle">${esc(book.subtitle)}</p></div></a></li>`).join('')}</ul></div>`);

await page('about/', `About · ${site.name}`, 'Andrew Grupp writes fiction, essays, and poetry shaped by the landscapes and working lives of the American Midwest. He lives in Nebraska.', 'About', href => `<div class="shell page-content"><div class="about-layout">${aboutPhoto.image ? `<figure class="portrait">${aboutPicture(href, '(max-width: 760px) min(calc(100vw - 48px), 360px), 440px')}</figure>` : ''}<div class="about-text"><p class="label">About</p><h1>${esc(site.name)}</h1><p class="lede">${esc(site.introduction)}</p><div class="prose">${biographyParagraphs}</div><a class="text-link" href="${href('writing/')}">Explore the writing ${arrow}</a></div></div></div>`, {type:'profile', schema:graph({'@type':'ProfilePage',url:`${origin}/about/`,mainEntity:{'@id':personId}}, person), share:aboutPhoto.image ? aboutPhoto : null});

for (const book of site.books) {
  const other = site.books.find(b => b.slug !== book.slug);
  const published = Boolean(book.year);
  const description = published ? `${book.title}: ${book.subtitle} by Andrew Grupp. ${book.status}.` : `${book.title}, a literary historical novel in progress by Andrew Grupp. ${book.tagline}`;
  const social = book.cover ? {image:book.cover,width:book.coverWidth,height:book.coverHeight,alt:book.coverAlt} : book.shareImage ? {image:book.shareImage,width:1200,height:630,alt:book.shareImageAlt} : null;
  const praise = (book.praise || []).length ? `<section class="shell praise" aria-labelledby="praise-title"><div class="book-reading"><div><h2 class="label" id="praise-title">Praise</h2>${book.praise.map(item => `<figure><blockquote><p>${esc(item.quote)}</p></blockquote><figcaption>-- ${esc(item.source)}</figcaption></figure>`).join('')}</div></div></section>` : '';
  const playlist = book.playlistUrl ? `<section class="shell playlist" id="playlist" aria-labelledby="playlist-title"><div class="book-reading"><div><h2 class="label" id="playlist-title">Companion playlist</h2><iframe class="spotify" title="${esc(book.title)} companion playlist on Spotify" src="${safeUrl(book.playlistUrl.replace('open.spotify.com/playlist/','open.spotify.com/embed/playlist/'))}?utm_source=generator" width="100%" height="352" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div></div></section>` : '';
  await page(bookUrl(book), `${book.title} · ${site.name}`, description, 'Writing', href => {
    const more = other ? `<nav class="shell book-bottom" aria-label="More writing"><span>More writing</span><a href="${href(bookUrl(other))}">${esc(other.title)} ${arrow}</a></nav>` : '';
    if (published) return `<article aria-labelledby="book-title"><div class="shell"><a class="back-link" href="${href('writing/')}">← All writing</a>
<div class="book-hero"><div class="book-cover-col"><div class="cover">${coverPicture(href, book, '(max-width: 760px) min(60vw, 250px), 360px', true)}</div></div><div class="book-hero-copy"><header><p class="label">${esc(book.status)}</p><h1 id="book-title">${esc(book.title)}</h1><p class="hero-subtitle">${esc(book.subtitle)}</p>${actions(book, '#playlist')}</header>
<div class="prose book-description">${paragraphs(book.description)}</div></div></div></div>
${excerptBand(book, 'excerpts-title')}${playlist}${praise}${more}</article>`;
    const tagline = sentences(book.tagline);
    return `<article aria-labelledby="book-title"><div class="shell"><a class="back-link" href="${href('writing/')}">← All writing</a>
<header class="novel-heading"><p class="status">${esc(book.status)}</p><h1 id="book-title">${esc(book.title)}</h1><p class="book-subtitle">${esc(book.subtitle)}</p></header></div>
<div class="night-band"><div class="shell"><p class="novel-tagline">${tagline}</p></div></div>
<div class="shell"><div class="prose novel-body">${paragraphs(book.description)}</div></div>
${excerptBand(book, 'excerpts-title')}${lettersBand('novel-letters', `Hear when ${book.title} is ready`, 'Occasional letters from Andrew, with news of the novel as it takes shape.')}${more}</article>`;
  }, {schema:graph(bookData(book), person), share:social, type:published ? 'book' : 'website'});
}

if (contactEnabled) await page('contact/', `Contact · ${site.name}`, 'Professional correspondence with Andrew Grupp.', 'Contact', () => `<div class="shell page-content">${pageHeading('Correspondence')}<div class="contact-body prose"><p>For professional correspondence, please write to<br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p></div></div>`);

if (lettersEnabled) {
  await page('letters/', `Letters · ${site.name}`, `Occasional dispatches from ${site.name}: new poems and essays, and news of Housefall.`, 'Letters', () => `<div class="shell page-content letters-page">${pageHeading('Letters', letters.deck)}<div class="prose">${paragraphs(letters.description).replace(/\bHousefall\b/g, '<em>Housefall</em>')}</div>${signup('letters-email', letters.pageNote || letters.note)}</div>`);
  // Kit redirects here after signup and after the confirmation click. Neither is indexed.
  await page('letters/thanks/', `Check your inbox · ${site.name}`, 'One more step to confirm your subscription.', 'Letters', href => `<div class="shell page-content">${pageHeading('Check your inbox')}<div class="prose"><p>One more step: open the email from ${esc(site.name)} and confirm your address. If it hasn’t arrived in a few minutes, look in your spam or promotions folder.</p></div><a class="text-link" href="${href('')}">Return home ${arrow}</a></div>`, {index:false});
  await page('letters/confirmed/', `You’re on the list · ${site.name}`, 'Your subscription is confirmed.', 'Letters', href => `<div class="shell page-content">${pageHeading('You’re on the list')}<div class="prose"><p>Thank you. The next letter will find you. Until then, there’s room beside the fire.</p></div><a class="text-link" href="${href('writing/')}">Explore the writing ${arrow}</a></div>`, {index:false});
}

if (entries.length) {
  await page('journal/', `Journal · ${site.name}`, 'Essays, literary reflections, and excerpts by Andrew Grupp.', 'Journal', href => `<div class="shell page-content">${pageHeading('Journal')}${entries.map(entry => `<article class="journal-row"><time class="label" datetime="${esc(entry.date)}">${dateLabel(entry.date)}</time><h2><a href="${href(`journal/${entry.slug}/`)}">${esc(entry.title)}</a></h2><p>${esc(entry.summary)}</p></article>`).join('')}</div>`);
  for (const entry of entries) await page(`journal/${entry.slug}/`, `${entry.title} · ${site.name}`, entry.summary, 'Journal', href => `<article class="shell page-content"><a class="back-link" href="${href('journal/')}">← Journal</a>${pageHeading(entry.title)}<time class="label" datetime="${esc(entry.date)}">${dateLabel(entry.date)}</time><div class="journal-entry prose">${paragraphs(entry.paragraphs)}</div></article>`, {type:'article'});
}

await page('404.html',`Page not found · ${site.name}`,'This page could not be found. Return to the writing.','',href => `<div class="shell page-content not-found">${pageHeading('Page not found')}<p>This page is no longer here.</p><a class="text-link" href="${href('')}">Return home ${arrow}</a></div>`, {index:false});
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(route=>`<url><loc>${origin}/${route}</loc></url>`).join('')}</urlset>\n`);
console.log(`Built ${pages.length} pages + 404 at ${origin}. Contact: ${contactEnabled ? 'enabled' : 'hidden'}. Letters: ${lettersEnabled ? 'enabled' : 'hidden'}. Journal: ${entries.length} published entries.`);
