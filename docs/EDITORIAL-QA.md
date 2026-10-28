# Composition refinement, v5 - October 21, 2026

The homepage header now contains right-aligned navigation without the AG monogram. Interior pages retain their text wordmark. The visible hero genre line is removed; the exact approved introduction remains its only descriptive sentence. Genre information remains in the document/OG title and social-image alt metadata. The content data file, book assets, Books band, footer and Aldric markup are unchanged.

The selected desktop/tablet hero uses a 58/42 paper/sage split. The sage plane occupies the complete hero height, begins immediately below the header, meets the Books section and extends to the right viewport edge. It has no content, border, inset or illustration. At 760px and below the field is omitted. Text uses the existing font sizes and page gutters.

A text-only alternative was actually built and inspected at 1440, 1024 and 768px. It is retained only in the ignored review archive. The full-height field was selected because the broad right side has a clear relationship to the header and Books boundary; the text-only version left that side unstructured at larger widths. The field no longer reads as a missing photograph or a floating object. On phones the narrower text measure provides enough structure on its own, and removing the field makes the page more compact. Neither candidate enlarged the author name or added decoration.

Local evidence: `artifacts/composition-v5/`. All five finished pages were inspected at 1440, 1024, 768, 390 and 320px (25 combinations), with full-page records and review sheets. Home has fresh v4/v5 comparisons at each width, plus full-field/text-only comparisons at the three larger widths. Unnumbered full-page images assemble original settled viewport captures at recorded scroll positions. An anomalous Housefall laptop capture was rechecked against its normal 66px rendered heading and replaced with a clean capture; no CSS change was needed.

Geometry checks confirm that the desktop/tablet field touches the header bottom, Books top and viewport right edge within one pixel. Mobile field bounds have zero height. No overflow or unloaded images occurred in the final records. Keyboard focus and Aldric activation were rechecked. The existing build/check validates six HTML files and 76 local link/asset references; the one-reference reduction is the removed homepage monogram link. No new runtime dependency or client JavaScript is introduced.

The single visible genre check is replaced with a requirement that the genre remain in metadata and not in visible main content. Home must contain neither header monogram nor wordmark. Approved copy, cover, metadata structure and disabled Contact/Journal remain protected. Complete publication evidence is recorded in the ignored local `RESULTS.md` handoff.

---

# Final editorial refinement, v4 - October 21, 2026

Focused changes preserve the v3 name scale, fonts, book descriptions, authentic cover assets and Aldric's original SVG/native disclosure. The homepage introduction is now the author's exact sentence: "People, places, and the complicated business of being alive." This also updates its description and Open Graph metadata through the existing data-driven build.

At 1440px the sage field is 352 by 350px, 33.2% more area than v3; the grid gap drops from 100px to 64px. At 1024px its area grows 34.8%, with the gap dropping from 70px to 44px. The copper right border is removed. The field extends evenly above and below the centered text composition. Phone treatment remains 64px high. The new introduction uses a wider reading measure after the first browser review exposed an unnecessarily fragmented desktop line break.

The band label is Books, with Published 2026 and In progress statuses. The shared footer consolidates copyright and location as "Copyright 2026 Andrew Grupp - Nebraska, United States" (rendered with the copyright symbol and middle dot). Desktop height falls from 138.75px to 84px; phone height falls from 127px to 117px while retaining comfortable navigation and the 44px goat control.

Local evidence is in `artifacts/refinement-v4/`: before/after homepage records at 1440, 1024, 390 and 320px, paired comparison images, interior-page spot checks at 1440 and 320px, metrics and live deployment evidence. Full-page images assemble settled browser viewport captures at measured offsets. No overflow or unloaded images occurred in the final checks. The introduction uses two lines on desktop and 390px, and three at 320px without forced breaks. Book titles and statuses remain aligned without cards.

Art-direction critique: the wider field now has enough weight to balance the author introduction, and the shorter gap makes its relationship to the text clearer. Removing the thin edge makes it read as a solid part of the layout. The shorter, more specific introduction and consolidated footer remove the two weakest pieces of v3's copy hierarchy. The name has not grown. At 320px prose necessarily occupies more lines, but the field remains shallow and the footer groups rather than scatters its information. No new decoration earns a place here.

Build/check, content-preservation, focus/disclosure and live verification results are recorded in the local `RESULTS.md` handoff. The footer now intentionally repeats the author's name in small copyright text; the name-count check applies to main content, preserving one prominent homepage name.

---

# Editorial review, round three - October 21, 2026

The static Node build, central JSON content, self-hosted fonts, metadata, GitHub Pages workflow and project-path URLs remain in place. No client JavaScript, production dependencies, tracking, DNS changes or mailbox activation were introduced.

## Design changes

The old homepage combined a 104px potential headline with a large framed landscape. The revised opening uses a 72px desktop name (64px at laptop width; approximately 53px at 390px and 44px at 320px), natural wrapping and restrained tracking. A vertical matte sage field with a 3px copper edge replaces the photograph. At phone widths it becomes a 64px band. No homepage image is rendered or preloaded. Original photography assets remain safely retained.

Selected writing is subordinate to its linked titles. It displays the first two configured books; the Writing bibliography displays all books. The forest footer is shorter and contains a small original SVG goat, 24px high inside a 44px native disclosure control. Hover/focus reveals "Aldric was here."; click/tap or Enter/Space toggles the disclosure without JavaScript. The note is outside document flow, so opening it does not change footer or document height.

Interior headings are smaller and consistent. Housefall uses a 66px desktop heading and 34px tagline, reduced to 54px and 28-29px on phones. Writing keeps its text bibliography. About retains the approved portrait and public biography, with the obsolete landscape-photography sentence removed. All book configuration fields, including the approved descriptions, URLs, cover provenance and Housefall tagline, compare identically to the preceding commit. Cover files are unchanged and remain uncropped.

## Browser evidence

Local archive: `artifacts/redesign-v3/` (ignored by Git).

- `before/` and `after/`: full-page records of Home, Writing, About, Ash and Pine, and Housefall at **1440, 1024, 768, 390 and 320px**. All 50 page/width/phase combinations were captured in the browser. Numbered files are settled original viewport images; unnumbered images assemble them at recorded scroll offsets without altering page content.
- `before-{width}.jpg`, `after-{width}.jpg`: five-page review sheets.
- `comparison-home-1440.jpg`, `comparison-home-390.jpg`: representative before/after comparisons.
- `metrics.json`: screenshot geometry, overflow and image-load evidence.
- `contrast.json`: rendered foreground/background text checks for all five pages.
- `keyboard-primary.jpg`, `goat-keyboard.jpg`, `goat-hover.jpg`: focus and discovery evidence.
- `live/`: staging verification after publication.

The 320px review led to an additional reduction from 46px to 44px, allowing the name to stay on one line without `nowrap` or compressed tracking. The final 25 revised combinations show no horizontal overflow or unloaded images. Full cover framing and portrait proportions were visually reviewed, as were complete prose columns. Narrow interior navigation retains its deliberate two-row header.

## Checks

- `npm run build` and `npm run check` pass for both the GitHub project path and future custom-domain root. A local official npm CLI is used because this machine has no npm shim on PATH; production tooling is unchanged.
- Six HTML files (five content pages plus 404) and 77 local links/assets pass checks, including responsive images, metadata, JSON-LD, skip destination, landmarks, alt text and inactive Contact/Journal exclusions.
- Homepage checks prohibit photography and require the aria-hidden color field. Every generated page must include the native goat disclosure and exact discovery text. No stale landscape claim remains in the biography.
- Skip to content reaches main; the next Tab reaches Explore the writing with a visible focus outline. Space toggles the goat, and its note is visible on keyboard focus, pointer hover and click activation. The target measures 44 by 44 CSS pixels. Opening/closing it leaves document and footer heights unchanged. Pointer activation exercises the same native disclosure behavior available to touch users; no physical touchscreen test was performed.
- Rendered text contrast passes WCAG AA thresholds, including small metadata, footer text and the large monogram's copper dot. The sage field and copper edge carry no text. These are accessibility basics, not a formal conformance audit.
- The Ash and Pine cover, responsive variants, source record and alt text remain unchanged. Housefall remains a mythic novel in progress with the approved synopsis and tagline verbatim, no invented date, cover or purchase destination.

## Art-direction critique

1. **Needless scale:** the old 90-104px hierarchy is gone. The prominent cover retains its useful reading size; the mobile name was iterated after inspection.
2. **Purpose:** the sage field supplies quiet architectural weight; the copper edge warms its boundary. Only About and the published-book page need photographic imagery. The goat remains a footer detail.
3. **Repetition:** one prominent full name and one genre descriptor remain on Home. There are no added quotations, decorative words or repeated sales panels.
4. **Empty and filled space:** the desktop field is narrower than the introduction and aligns with its vertical extent; phones receive a shallow band. The compact bibliography bridges the opening and shorter footer.
5. **Five more books:** author identity and the opening remain unchanged. Home stays at two selected works; the text bibliography can grow without an invented cover grid.
6. **Author identity:** typography, plain bibliographic links and substantial reading columns lead. No photography-gallery hero, storefront cards or generic marketing controls remain.

## Publication and decisions

Staging: https://hearthwalker.github.io/andrewgrupp.com/

The scoped commit is deployed through the established GitHub Actions workflow and the staging result is opened after deployment. Deployment evidence and commit/run identifiers are recorded in the local `RESULTS.md` handoff.

No author decision is required for this refinement. The existing introduction is preserved, with no new personal testimony proposed or published. Domain registration/DNS and creating/testing `hello@andrewgrupp.com` remain future launch tasks; Contact stays disabled and the empty Journal stays unpublished.
