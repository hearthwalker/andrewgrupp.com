"""Create metadata-free JPEG and WebP sizes of the About page author photo.

Usage: python scripts/author-photo.py reference-assets/andrew-grupp-portrait-color.jpg
Requires Pillow for this optional authoring step only.
"""
from pathlib import Path
import sys
from PIL import Image

source = Image.open(sys.argv[1]).convert("RGB")
# A fresh copy from raw pixels carries no EXIF or location data.
clean = Image.frombytes("RGB", source.size, source.tobytes())
out = Path("public/assets/photography")
for width in (480, 800, 1024):
    height = round(width * clean.height / clean.width)
    image = clean.resize((width, height), Image.Resampling.LANCZOS)
    base = out / f"andrew-grupp-portrait-{width}"
    image.save(base.with_suffix(".jpg"), quality=86, optimize=True, progressive=True)
    image.save(base.with_suffix(".webp"), quality=82, method=6)
    print(f"Author photo: {width} x {height} (JPEG and WebP)")
