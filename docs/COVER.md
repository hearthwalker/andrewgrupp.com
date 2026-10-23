# Approved Ash and Pine front cover

Source: **Ash_and_Pine_COVER_FINAL.pdf**, supplied by Andrew on October 21, 2026 in the website working directory. The original is retained unchanged and excluded from Git. It is the authoritative source, rather than an illustration, mockup, screenshot, or generated cover.

The file is a one-page KDP paperback wrap measuring 827.1 × 630 PDF points (11.4875 × 8.75 inches). Visual inspection confirmed the back at left, spine in the middle, and published front artwork at right. The front also matches the [confirmed Amazon edition, ASIN B0HN6P7XNH](https://www.amazon.com/dp/B0HN6P7XNH).

Extraction coordinates, measured in PDF points from the page origin:

- Front trim: x = 422.1–818.1, y = 9–621.
- Result: 396 × 612 points, or exactly 5.5 × 8.5 inches.
- The 17.1-point spine, back cover, and 9-point outer bleed are excluded.

`scripts/extract-cover.py` renders that exact rectangle, then creates metadata-free JPEG and WebP variants at 360 × 556, 480 × 742, 720 × 1113 and 960 × 1484 pixels. Reproduction requires the optional local authoring dependencies pypdfium2 and Pillow; the normal site build needs neither Python nor these packages.

```powershell
python scripts/extract-cover.py Ash_and_Pine_COVER_FINAL.pdf
```

Published files:

- `public/assets/books/ash-and-pine-approved-{360,480,720,960}.jpg`
- `public/assets/books/ash-and-pine-approved-{360,480,720,960}.webp`

The homepage hero, Writing shelf and book page display the full image uncropped, with intrinsic dimensions, WebP sources and JPEG fallbacks, descriptive alt text, and high fetch priority. Phone layouts show the cover first, then the title and links. The 720px JPEG is also that book's Open Graph image.
