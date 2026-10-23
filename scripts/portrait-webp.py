"""Create metadata-free WebP versions of the published author portrait.

Usage: python scripts/portrait-webp.py
Requires Pillow for this optional authoring step only.
"""
from pathlib import Path
from PIL import Image

folder = Path("public/assets/photography")
for size in (480, 800):
    source = folder / f"andrew-grupp-monochrome-{size}.jpg"
    image = Image.open(source).convert("RGB")
    # A fresh RGB copy carries no EXIF or location data into the WebP.
    Image.frombytes("RGB", image.size, image.tobytes()).save(source.with_suffix(".webp"), quality=84, method=6)
    print(f"Portrait: {size} x {size} WebP")
