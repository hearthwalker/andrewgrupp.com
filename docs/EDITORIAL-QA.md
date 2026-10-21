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
- The Ash and Pine cover, responsive variants, source record and alt text remain unchanged. Housefall remains historical fiction in progress with the approved synopsis and tagline verbatim, no invented date, cover or purchase destination.

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
