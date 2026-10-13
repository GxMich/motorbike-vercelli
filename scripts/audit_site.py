"""Check static links, anchors, unique IDs and local assets, including lazy images."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json

ROOT = Path(__file__).resolve().parent.parent

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.references, self.duplicates = path, set(), [], []
        self.feed(path.read_text(encoding='utf-8'))
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids: self.duplicates.append(attrs['id'])
            self.ids.add(attrs['id'])
        if tag in ['a','link','script','img','iframe']:
            value = attrs.get('href') or attrs.get('src')
            if value: self.references.append(value)

pages = {p.name: Page(p) for p in ROOT.glob('*.html') if p.name != 'proposta.html'}
errors = []
count = 0
for name, page in pages.items():
    errors += [f'{name}: duplicate id {id}' for id in page.duplicates]
    for ref in page.references:
        parsed = urlsplit(ref)
        if parsed.scheme or parsed.netloc: continue
        target = unquote(parsed.path) or name
        count += 1
        if not (ROOT / target).is_file(): errors.append(f'{name}: missing file {target}')
        elif parsed.fragment and target in pages and unquote(parsed.fragment) not in pages[target].ids:
            errors.append(f'{name}: missing anchor {target}#{parsed.fragment}')
report = dict(pages=len(pages), references=count, errors=errors)
out = ROOT / '.design/previews/multipage'
out.mkdir(parents=True, exist_ok=True)
(out/'link-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
raise SystemExit(bool(errors))
