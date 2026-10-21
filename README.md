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
- **Book description:** edit the book’s `description` array, one paragraph per item.
- **Purchase and playlist:** use the confirmed HTTPS URLs in `purchaseUrl` and `playlistUrl`; `null` hides the link.
- **Actual cover:** add an approved file to `public/assets/`, set `cover` to e.g. `assets/ash-and-pine-cover.webp`, and provide `coverAlt`. No invented cover is displayed.
- **Author photograph:** add an approved image, set `photograph` and `photographAlt`. It appears only on About. Strip private EXIF/location metadata before adding it.
- **Social card:** `shareImage` points to the site’s typographic card, not a portrait or a book cover.

The editable social-card layout is in `scripts/share-card.html`. To regenerate the raster asset, serve that layout with the site fonts at `/assets/fonts/`, render at 1200 × 630, and replace `public/assets/social-card.jpg` with the resulting JPEG.

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

Warm paper `#F2EDE3`, forest ink `#262922`, sage `#777C6B`, copper `#9B7658`, and charcoal `#303030`. Copper and pale sage serve as ornament; body text uses darker tones for contrast. Fonts: Cormorant Garamond and Source Serif 4, distributed under the SIL Open Font License. License files are in `public/assets/fonts/`. Website copy and author assets remain Andrew Grupp’s copyright; the repository grants no blanket content license.
