#!/usr/bin/env python3
"""VT6 House & Restaurant (Penzion Znojmo) — sestaví statický web ze šablony (src/) a dat (_data/*.json) do site/.
Obsah (lístek, polední menu, pokoje, kontakty, texty) je v _data/*.json — kompatibilní se společnou
administrací webhunter-admin (zápis jen do _data/*.json a img/uploads/)."""
import datetime, hashlib, json, pathlib, re, shutil
from jinja2 import Environment, FileSystemLoader

ROOT = pathlib.Path(__file__).parent
SRC, CONTENT, OUT = ROOT / 'src', ROOT / '_data', ROOT / 'site'

if OUT.exists():
    shutil.rmtree(OUT)
shutil.copytree(ROOT / 'assets', OUT / 'assets')
for f in ('style.css', 'main.js'):
    shutil.copy(SRC / f, OUT / 'assets' / f)
for f in ('logo.svg', 'logo-light.svg', 'znak-znojmo.png'):
    shutil.copy(ROOT / 'brand' / f, OUT / 'assets' / f)
if (ROOT / 'img').exists():  # fotky nahrané v administraci
    shutil.copytree(ROOT / 'img', OUT / 'img', ignore=shutil.ignore_patterns('.gitkeep'))

h = lambda p: hashlib.md5((OUT / p).read_bytes()).hexdigest()[:8]
data = {p.stem: json.loads(p.read_text()) for p in CONTENT.glob('*.json')}


def _webp(p):
    """assets/img/x.jpg → assets/img/x.webp, pokud WebP varianta existuje (menší přenos, stejná fotka)"""
    if p.startswith('assets/img/') and p.endswith('.jpg'):
        w = p[:-4] + '.webp'
        if (OUT / w).exists():
            return w
    return p


def img(p, w=None):
    """cesta k obrázku z dat → cesta od kořene webu; w=900 → menší varianta, pokud existuje"""
    p = str(p)
    if p.startswith('img/'):
        return p
    p = 'assets/img/' + p.rsplit('/', 1)[-1]
    if w:
        small = p.replace('.jpg', f'-{w}.jpg')
        if (OUT / small).exists():
            return _webp(small)
    return _webp(p)


def srcset(p):
    """všechny dostupné šířky fotky (480 / 900 / originál) pro srcset"""
    p = str(p)
    if p.startswith('img/'):
        return p
    base = 'assets/img/' + p.rsplit('/', 1)[-1]
    out = []
    for suf in ('-480', '-900', ''):
        c = _webp(base.replace('.jpg', f'{suf}.jpg'))
        if (OUT / c).exists():
            try:
                from PIL import Image
                wpx = Image.open(OUT / c).width
            except Exception:
                wpx = {'-480': 480, '-900': 900}.get(suf, 1800)
            out.append(f'{c} {wpx}w')
    return ', '.join(out) or img(p)


def wh(p):
    """width/height atributy podle skutečné fotky (proti poskakování stránky)"""
    try:
        from PIL import Image
        im = Image.open(OUT / img(p))
        return f'width="{im.width}" height="{im.height}"'
    except Exception:
        return ''


env = Environment(loader=FileSystemLoader(str(SRC)), autoescape=False)
env.filters['img'] = img
env.filters['srcset'] = srcset
env.filters['wh'] = wh
env.filters['tel'] = lambda t: re.sub(r'[^\d+]', '', t)
env.filters['kc'] = lambda n: f'{n:,}'.replace(',', ' ')

# česká typografie: jednopísmenné předložky a spojky nenechávat na konci řádku (jen v textu)
_NB = re.compile(r'(?<![\w&;])([vszkouiaVSZKOUIA]) (?=\S)')


def nbsp(html):
    parts = re.split(r'(<script.*?</script>|<style.*?</style>|<svg.*?</svg>|<[^>]+>)', html, flags=re.S)
    return ''.join(x if i % 2 else _NB.sub(r'\1&nbsp;', x) for i, x in enumerate(parts))


html = env.get_template('index.html').render(
    data,
    v={'css': h('assets/style.css'), 'js': h('assets/main.js'), 'fav': h('assets/favicon.png'),
       'logo': h('assets/logo.svg'), 'logol': h('assets/logo-light.svg')},
    year=datetime.date.today().year,
)
(OUT / 'index.html').write_text(nbsp(html))
(OUT / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
(OUT / '.nojekyll').touch()
print('✓ site/index.html')
