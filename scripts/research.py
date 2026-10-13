"""Archive public source pages and extract text/media for editorial verification."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import sys
import requests
from bs4 import BeautifulSoup

BASE = 'https://www.motorbikevercelli.com/'
SLUGS = ['', 'chi-siamo', 'moto', 'caschi', 'caschi-crossover', 'integrali', 'jet', 'modulari', 'off-road', 'interfoni', 'cardo', 'hjc-interfoni', 'interphone', 'midland', 'sena', 'abbigliamento', 'giacche', 'pantaloni', 'guanti', 'scarpe', 'stivali', 'tute', 'cross-fox', 'accessori', 'accessori-vari', 'lubrificanti', 'pneumatici', 'scarichi', 'contatti']
OUT = Path('.design/research')
OUT.mkdir(parents=True, exist_ok=True)

def read(slug):
    url = BASE + slug
    try:
        response = requests.get(url, timeout=35)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        (OUT / ((slug or 'home') + '.html')).write_text(response.text, encoding='utf-8')
        main = soup.find('main') or soup
        texts = list(dict.fromkeys(t.get_text(' ', strip=True) for t in main.select('h1,h2,h3,p') if t.get_text(strip=True)))
        images = [dict(src=t.get('src'), alt=t.get('alt', '')) for t in main.select('img[src]') if 'wixstatic' in t.get('src', '')]
        return dict(slug=slug, url=url, status=response.status_code, texts=texts, images=images)
    except Exception as e:
        return dict(slug=slug, url=url, error=str(e))

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    with ThreadPoolExecutor(max_workers=8) as pool:
        pages = list(pool.map(read, SLUGS))
    (OUT / 'pages.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
    for p in pages:
        print(p['slug'] or 'home', p.get('status', p.get('error')), '\n ', ' | '.join(p.get('texts', []))[:1400])
