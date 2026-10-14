"""One-time local asset preparation; authentic originals are preserved.

Requires Pillow and requests for maintenance only, not for serving/building HTML.
Fonts: Google Fonts' Barlow repository, distributed under the SIL OFL.
"""
from pathlib import Path
import json
import re
from PIL import Image, ImageOps
import requests

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / 'assets/fonts'
for name in ['Barlow-Regular.ttf', 'Barlow-SemiBold.ttf', 'BarlowCondensed-Bold.ttf']:
    folder = 'barlowcondensed' if 'Condensed' in name else 'barlow'
    target = FONT / name
    if not target.exists():
        response = requests.get(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{folder}/{name}', timeout=30)
        response.raise_for_status()
        target.write_bytes(response.content)

# Italian uses the Latin subset. The license already present covers Barlow.
css = requests.get('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600&family=Barlow+Condensed:ital,wght@0,700;1,800&display=swap', headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}, timeout=30)
css.raise_for_status()
names = {('Barlow','normal','400'):'Barlow-Regular', ('Barlow','normal','600'):'Barlow-SemiBold', ('Barlow Condensed','normal','700'):'BarlowCondensed-Bold', ('Barlow Condensed','italic','800'):'BarlowCondensed-ExtraBoldItalic'}
sources = []
for block in re.findall(r'/\* latin \*/\s*(@font-face\s*\{.*?\})',css.text,re.S):
    family = re.search(r"font-family: '([^']+)'",block).group(1)
    style = re.search(r'font-style: (\w+)',block).group(1)
    weight = re.search(r'font-weight: (\d+)',block).group(1)
    url = re.search(r'url\(([^)]+)\)',block).group(1)
    name = names[(family,style,weight)] + '.woff2'
    response = requests.get(url,timeout=30)
    response.raise_for_status()
    (FONT / name).write_bytes(response.content)
    sources.append({'file':name,'source':url,'license':'OFL-BarlowCondensed.txt'})
(FONT / 'SOURCES.json').write_text(json.dumps(sources,indent=2),encoding='utf-8')

manifest = {}
for file in (ROOT / 'assets/img').rglob('*'):
    if file.suffix.lower() not in ['.webp', '.jpg', '.png'] or '/responsive/' in file.as_posix():
        continue
    with Image.open(file) as im:
        width, height = im.size
        entry = {'width': width, 'height': height}
        if file.suffix.lower() in ['.webp','.jpg'] and width >= 480:
            variants = []
            dest = ROOT / 'assets/img/responsive'
            dest.mkdir(exist_ok=True)
            for size in [320, 480, 800, 1280, 1800]:
                if size > width:
                    continue
                output = dest / f'{"reparti-" if file.parent.name == "reparti" else ""}{file.stem}-{size}.webp'
                image = ImageOps.exif_transpose(im).convert('RGB')
                image.thumbnail((size, 2000), Image.Resampling.LANCZOS)
                image.save(output, 'WEBP', quality=76, method=6)
                variants.append({'src': 'responsive/' + output.name, 'width': image.width})
            entry['variants'] = variants
        if file.name == 'showroom.webp':
            ImageOps.fit(ImageOps.exif_transpose(im).convert('RGB'),(1200,630),Image.Resampling.LANCZOS,centering=(.62,.55)).save(ROOT/'assets/img/og-image.jpg','JPEG',quality=85,optimize=True)
            # A portrait crop keeps the real shop photo sharp on mobile without
            # downloading a large landscape image mostly cropped offscreen.
            portrait = []
            for size in [480,640]:
                output = ROOT / 'assets/img/responsive' / f'hero-store-portrait-{size}.webp'
                cropped = ImageOps.fit(ImageOps.exif_transpose(im).convert('RGB'),(size,round(size*1.794)),Image.Resampling.LANCZOS,centering=(.62,.55))
                cropped.save(output,'WEBP',quality=78,method=6)
                portrait.append({'src':'responsive/'+output.name,'width':size})
            entry['portrait'] = portrait
        manifest[file.relative_to(ROOT / 'assets/img').as_posix()] = entry
(ROOT / 'assets/media-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(f'{len(manifest)} images measured; responsive variants and 3 local fonts prepared.')
