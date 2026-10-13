"""Import official category media as optimized local WebP assets."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
import requests
from PIL import Image

pages = {p['slug']: p for p in json.loads(Path('.design/research/pages.json').read_text(encoding='utf-8'))}
groups = {
    'caschi': ['crossover', 'integrali', 'jet', 'modulari', 'off-road'],
    'abbigliamento': ['giacche', 'pantaloni', 'guanti', 'scarpe', 'stivali', 'tute'],
    'accessori': ['accessori-vari', 'lubrificanti', 'pneumatici', 'scarichi'],
    'interfoni': ['cardo', 'hjc', 'interphone', 'midland', 'n-com', 'sena'],
    'cross-fox': ['cross'],
}
out = Path('assets/img/reparti')
out.mkdir(parents=True, exist_ok=True)

def save(job):
    name, source = job
    url = source['src'].split('/v1/')[0]
    data = requests.get(url, timeout=35)
    data.raise_for_status()
    im = Image.open(BytesIO(data.content))
    im.thumbnail((1200, 1000))
    im.save(out / (name + '.webp'), 'WEBP', quality=86)
    return dict(file=f'assets/img/reparti/{name}.webp', source=url, alt=source['alt'], width=im.width, height=im.height)

if __name__ == '__main__':
    jobs = [(name, source) for group,names in groups.items() for name,source in zip(names, pages[group]['images'])]
    with ThreadPoolExecutor(max_workers=6) as pool:
        manifest = list(pool.map(save, jobs))
    Path('assets/img/reparti/SOURCES.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Imported {len(manifest)} official images')
