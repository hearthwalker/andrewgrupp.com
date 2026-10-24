# Andrew Grupp

The official literary-author website for Andrew Grupp. A small static site for GitHub Pages, with self-hosted typefaces, no client-side JavaScript, no tracking, and no production dependencies.

## Local development

Use Node.js 22 or later. No package installation is needed.

```powershell
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Preview: http://127.0.0.1:4173. Stop the server with Ctrl+C. Rebuild and refresh after editing. Generated `dist/` is ignored by Git.

## Update the content

Edit `content/site.json`. Text is escaped automatically; paragraphs are plain strings, not HTML.

- **Biography:** update `biography` paragraphs and `introduction`.
- **Correspondence:** `inquiries@andrewgrupp.com` forwards to the author's inbox and is published on the Contact page (`emailEnabled: true`). `hello@andrewgrupp.com` remains active for Kit. Setting `emailEnabled` to `false` removes the page and its links.
- **Letters (email list):** `letters` holds the Kit signup (live). A signup band appears on the Housefall page and `/letters/`, and Letters is in the navigation. Each is a plain HTML form posting to Kit, with no JavaScript. `deck`, `description` and `note` are the copy. Setting `enabled` to `false` removes every form and Letters page. See [the publication record](docs/LAUNCH.md) for the Kit setup.
- **Homepage:** the hero features the first published book with a cover (Ash and Pine): its cover, `status`, `heroLine`, purchase button, playlist link and first excerpt. The `invitation` line closes the excerpt band, and the homepage ends there; Housefall, About and Letters are reached from the navigation. The Writing page shelves the entire bibliography.
- **Book description:** edit the book’s `description` array, one paragraph per item.
- **Excerpts:** each book's `excerpts` is a list of `{ "title": "...", "lines": ["...", "..."] }`. Every string in `lines` is one line of verse, kept whole; long lines turn over with a hanging indent on phones. An empty list (Housefall today) renders nothing.
- **Praise:** each book's `praise` is a list of `{ "quote": "...", "source": "..." }`. The block appears only when the list has entries. Add real, attributable praise only.
- **Purchase and playlist:** use the confirmed HTTPS URLs in `purchaseUrl` and `playlistUrl`; `null` hides the link. `purchaseLabel` is the button text. A Spotify playlist URL also produces the lazy-loaded official Spotify player on the book page.
- **Actual cover:** Ash and Pine's approved front cover is required by the build. Its local image paths (`cover` is the JPEG fallback; `coverBase` and `coverWidths` name the WebP/JPEG sizes), dimensions, alt text, source record, and publication date live with its book entry. See [cover provenance](docs/COVER.md) before replacing it.
- **Author photograph:** `photograph` is the JPEG fallback and Open Graph image; `photographBase` and `photographWidths` name the responsive WebP/JPEG sizes. It appears on About. Strip private EXIF/location metadata before adding it; `python scripts/portrait-webp.py` makes metadata-free WebP copies.
- **Landscapes:** source photography and public derivatives are retained for future editorial use and are not rendered.
- **Social cards:** Home, Writing and 404 share `shareImage` (the Ash and Pine card). Ash and Pine shares its actual front cover; About shares the portrait; Housefall shares its own `shareImage`.

The editable social-card layouts are in `scripts/share-card.html` (`#site` and `#housefall`). To regenerate them, serve `dist/` with that file copied in at `/scripts/share-card.html`, render each at 1200 × 630, and replace `public/assets/social-card.jpg` and `public/assets/social-card-housefall.jpg`. Public titles and descriptors spell out **and**.

The supplied photo originals are retained locally in the ignored `reference-assets/` folder. Public derivatives omit source EXIF metadata. Landscape photographs are not presented as book covers or locations from Housefall.

**House style:** copy uses double hyphens (`--`), never em dashes. Page titles use a middle dot: "Writing · Andrew Grupp". The check fails on any em dash in the built site.

Contact is generated and linked only when both `email` and `emailEnabled` are set. Journal is generated only when published entries exist. Until then, neither page appears in navigation or the sitemap. The footer contains no inactive correspondence link.

Book metadata lives with each book. Housefall is historical fiction in progress, with no implied release date.

## Publish a journal entry

There is no empty Journal page or navigation item. Add approved entries to `journal` using this structure (replace every illustrative value before publishing):

```json
{
  "slug": "your-entry-slug",
  "title": "Your approved title",
  "date": "2026-10-21",
  "summary": "A short, approved description.",
  "paragraphs": ["Your first paragraph.", "Your second paragraph."],
  "published": false
}
```

Change `published` to `true` to generate the entry, Journal index, navigation link, and sitemap entries. Drafts are excluded from the public build. Never commit confidential drafts to a public repository; use a separate private working copy.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` builds, checks, and deploys `dist/` on pushes to `main`. In the repository, choose **Settings → Pages → Source → GitHub Actions**. The deploy job uses GitHub’s short-lived OIDC permissions; no deploy keys or secret tokens are needed.

Live address: https://andrewgrupp.com (the old https://hearthwalker.github.io/andrewgrupp.com/ redirects there).

Local builds default to the live address. The workflow uses the repository variable `SITE_URL` (set to `https://andrewgrupp.com`), falling back to the Pages-configured base URL. Every page except 404 uses relative links, which work at a domain root or under a project path. The 404 page can be served at any depth, so it uses the base path of the build URL. Canonical URLs, Open Graph URLs, structured data, robots.txt, and the sitemap follow the build URL.

For what is live, DNS records, and remaining tasks, see [the publication record](docs/LAUNCH.md).

## Design and licensing

The palette comes from the Ash and Pine cover: warm paper `#F2EDE3`, fog wash `#E8E2D6`, ink `#2A2723`, soft charcoal `#5E5850`, fog gray `#8A847A` (hairlines only), and one accent, ember `#9C4A2B` (5.25:1 on paper, AA in both directions), used for the purchase button, link underlines and the current-page mark. Under `prefers-color-scheme: dark` the site becomes "night by the fire": warm charcoal `#211E1B`, paper-colored text `#E8E1D3` and a lifted ember `#D98B5F`. The only motion is a slow fade-in of the page, removed under `prefers-reduced-motion`.

Fonts: Source Serif 4 (variable weight 400–600 with optical sizing, plus italic) for text, chosen for its sturdy screen reading and true small caps, which echo the book's section titles in labels and navigation. Cormorant Garamond Medium for display lines and verse. Both are subset to Latin WOFF2 from the Google Fonts sources and distributed under the SIL Open Font License. License files are in `public/assets/fonts/`. Website copy and author assets remain Andrew Grupp’s copyright; the repository grants no blanket content license.

A small original inline SVG goat in the footer uses a native disclosure: hover or keyboard focus reveals "Aldric was here."; click, Enter, Space or a touch tap toggles it without JavaScript. Its 44px control encloses a 24px-high illustration.

The [editorial QA record](docs/EDITORIAL-QA.md) documents the before/after screenshots and acceptance checks. Stylesheet URLs carry a content hash so returning browsers receive the current layout.
