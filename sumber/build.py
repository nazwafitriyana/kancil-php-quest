# Menggabungkan semua file sumber menjadi satu halaman.
#   index.html          -> versi lengkap untuk hosting / dibuka langsung (punya <head> sendiri)
#   artifact.html       -> versi untuk Claude artifact (tanpa <html>/<head>)
import os
here = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(here, 'app.html'), encoding='utf-8').read()
for ph, f in [('/*PHPJS*/', 'php.js'), ('/*CHECKJS*/', 'check.js'), ('/*LESSONSJS*/', 'lessons.js'), ('/*STEPSJS*/', 'steps.js')]:
    src = open(os.path.join(here, f), encoding='utf-8').read()
    assert '</script' not in src.lower()
    html = html.replace(ph, src)
out_dir = os.environ.get('OUT_DIR', os.path.join(here, '..'))
head = '''<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#11131b">
<meta name="author" content="Nazwa Fitriyana">
<meta name="description" content="Kancil PHP Quest: game belajar PHP dari nol, dibuat oleh Nazwa Fitriyana.">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}</style>
'''
i = html.index('<div class="app"')
standalone = head + html[:i] + '</head>\n<body>\n' + html[i:] + '\n</body>\n</html>\n'
open(os.path.join(out_dir, 'index.html'), 'w', encoding='utf-8').write(standalone)
if os.environ.get('ARTIFACT'):
    open(os.environ['ARTIFACT'], 'w', encoding='utf-8').write(html)
print('ok', len(standalone))
