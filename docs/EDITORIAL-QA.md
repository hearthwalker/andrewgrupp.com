# Editorial redesign verification — October 21, 2026

The redesign preserves the static Node build, central JSON content, self-hosted typefaces, CSS-only presentation, GitHub Pages workflow, metadata, and project-path support. No runtime dependencies, client-side JavaScript, analytics, DNS changes, or forms were introduced.

## Before and after

Local screenshot archive: `artifacts/editorial-redesign/` (ignored by Git).

- `before/`: current-site full-page browser screenshots of Home, Writing, About, Ash and Pine, and Housefall at 1440 and 390 pixels.
- `after/`: all five redesigned pages at 1440, 1024, 390 and 320 pixels. Numbered files are original, settled browser viewport captures covering the entire document. The corresponding unnumbered images assemble those captures by their measured scroll offsets, without changing page content.
- `review-1440.jpg`, `review-1024.jpg`, `review-390.jpg`, `review-320.jpg`: comparison sheets used for visual review.
- `metrics.json`: viewport sizes, scroll positions, overflow and image-load measurements for 43 final browser captures, covering 20 page/width combinations.
- `contrast.json` and `keyboard-focus.jpg`: contrast and keyboard checks.

Comparison findings: the opening now contains one visible full name and one genre descriptor; the introductory thought is adapted from the author-approved Ash and Pine description. The photograph is integrated into the opening, with its complete square composition and a visible sage field. Compact title links replace the larger book band. Forest appears as a deliberate footer surface. Copper accents and readable darker copper metadata provide warmth. Writing is now a text-first bibliography without a disconnected photograph. About adds confirmed book, fiction and photography facts without personal history. The supplied Housefall synopsis is used verbatim, with its first line retained as the existing tagline.

The narrow-mobile pass found and corrected an awkward wrap in the interior navigation. At 320 pixels it now uses a deliberate two-row header; all three navigation items stay together. Prose measures and cover framing were inspected above and below the fold. No horizontal overflow or unloaded images remained in the final 20 page/width combinations.

## Acceptance checks

- `npm run build` and `npm run check` pass. On this machine npm is run through an untracked local copy of its official CLI because the bundled Node executable has no npm shim on PATH; package scripts and production dependencies are unchanged.
- Six HTML files (five content pages plus 404), 80 local link/asset references, responsive images, sitemap, metadata, JSON-LD, language, headings, landmarks and alt text are checked.
- The homepage visibly displays the full author name exactly once and the genre descriptor exactly once.
- Visitor-facing title and literary copy use **and**. The validator checks actual text and metadata without rewriting technical entities or URL parameters. The regenerated social card also spells out **and**.
- The approved cover is rendered from Andrew's final PDF, in full, with local responsive images and the print trim ratio. See `COVER.md` for provenance and extraction coordinates.
- The original Ash and Pine description, Amazon link and Spotify link are preserved. The Amazon listing was opened and visually verified during the source audit; the Spotify destination was confirmed during the preceding build.
- Housefall has the author-supplied synopsis, no release date, no purchase link, no invented cover and no autobiographical interpretation.
- Contact and Journal are absent from the build, navigation and sitemap while inactive. No placeholders or nonfunctional contact controls are advertised.
- Keyboard activation of Skip to content focuses the main landmark; the next Tab focuses Explore the writing with a visible solid outline. Links remain native keyboard controls.
- Rendered text contrast checks passed on the five content pages, including muted metadata and the forest footer. No text is overlaid on photography; the exact sage and copper colors are used as surfaces or ornament where needed for contrast.

## Handoff

Staging: https://hearthwalker.github.io/andrewgrupp.com/

The final staging deployment and its cover must be personally checked in the browser after the commit is published. Deployment evidence is saved under `artifacts/editorial-redesign/live/`. Custom-domain registration/DNS and mailbox activation remain future author tasks; they do not expose incomplete destinations on this staging site.
