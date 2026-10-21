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
- **Correspondence:** `hello@andrewgrupp.com` is reserved in the configuration. After creating and testing the mailbox, set `emailEnabled` to `true`. Until then the site publishes no email address or dead mail link.
- **Selected writing:** the homepage links the first two books in `books`; the Writing page lists the entire bibliography.
- **Book description:** edit the book’s `description` array, one paragraph per item.
- **Purchase and playlist:** use the confirmed HTTPS URLs in `purchaseUrl` and `playlistUrl`; `null` hides the link.
- **Actual cover:** Ash and Pine's approved front cover is required by the build. Its local image paths, dimensions, alt text, source record, and publication date live with its book entry. See [cover provenance](docs/COVER.md) before replacing it.
- **Author photograph:** add an approved image, set `photograph` and `photographAlt`. It appears only on About. Strip private EXIF/location metadata before adding it.
- **Landscapes:** source photography and public derivatives are retained for future editorial use. The homepage renders a flat sage color field; it does not render or request a photograph. About is the only page with an author portrait.
- **Social card:** `shareImage` points to the site’s typographic card, not a portrait or a book cover.

The editable social-card layout is in `scripts/share-card.html`. To regenerate the raster asset, serve that layout with the site fonts at `/assets/fonts/`, render at 1200 × 630, and replace `public/assets/social-card-editorial.jpg` with the resulting JPEG. Book shares use the actual front cover. Public titles and descriptors spell out **and**.

The supplied photo originals are retained locally in the ignored `reference-assets/` folder. Public derivatives omit source EXIF metadata. Home uses no photograph; About uses one restrained portrait. The rocky shore, cliff photograph and color portrait remain available for future use. Landscape photographs are not presented as book covers or locations from Housefall.

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

Temporary address: https://hearthwalker.github.io/andrewgrupp.com/

Local builds default to that address. The workflow uses the Pages-configured base URL, or an explicit repository variable `SITE_URL`. Relative links work at both the temporary project path and a future custom-domain root. Canonical URLs, Open Graph URLs, structured data, robots.txt, and the sitemap follow the build URL.

For the future domain, see [the launch guide](docs/LAUNCH.md). Do not add a custom domain or redirect before ownership and DNS are ready.

## Design and licensing

Warm paper `#F2EDE3`, forest ink `#262922`, sage `#777C6B`, copper `#9B7658`, and charcoal `#303030`. A vertical sage field with a narrow copper edge balances the homepage introduction; on phones it becomes a shallow band. A pale sage surface holds the compact bibliography; forest anchors the footer. Darker copper is used for readable small metadata. Fonts: Cormorant Garamond and Source Serif 4, distributed under the SIL Open Font License. License files are in `public/assets/fonts/`. Website copy and author assets remain Andrew Grupp’s copyright; the repository grants no blanket content license.

A small original inline SVG goat in the footer uses a native disclosure: hover or keyboard focus reveals "Aldric was here."; click, Enter, Space or a touch tap toggles it without JavaScript. Its 44px control encloses a 24px-high illustration.

The [editorial QA record](docs/EDITORIAL-QA.md) documents the before/after screenshots and acceptance checks. Stylesheet URLs carry a content hash so returning browsers receive the current layout.
