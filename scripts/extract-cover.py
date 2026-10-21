"""Extract the approved 5.5 x 8.5-inch front from the final KDP cover wrap.

Usage: python scripts/extract-cover.py Ash_and_Pine_COVER_FINAL.pdf
Requires pypdfium2 and Pillow for this optional authoring step only.
"""
from pathlib import Path
import sys
import pypdfium2 as pdfium
from PIL import Image

source = Path(sys.argv[1])
document = pdfium.PdfDocument(source)
assert len(document) == 1, "Expected the single-page approved paperback wrap"
page = document[0]
width, height = page.get_size()
assert abs(width - 827.1) < 0.1 and abs(height - 630) < 0.1, "Unexpected wrap dimensions; recheck trim and spine"
# 9pt bleed; back trim x=9..405; 17.1pt spine x=405..422.1;
# front trim x=422.1..818.1, y=9..621. No spine, back, or bleed.
front = page.render(scale=3, crop=(422.1, 9, 9, 9)).to_pil().convert("RGB")
out = Path("public/assets/books")
out.mkdir(parents=True, exist_ok=True)
for target_width in (360, 720):
    target_height = round(target_width * 8.5 / 5.5)
    image = front.resize((target_width, target_height), Image.Resampling.LANCZOS)
    image.save(out / f"ash-and-pine-approved-{target_width}.jpg", quality=92, optimize=True)
    print(f"Approved front: {target_width} x {target_height}")
