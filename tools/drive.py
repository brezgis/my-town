# Open the street in headless Chrome on the GPU in REAL time (tools/shot.sh uses virtual time, in which only a
# dozen frames are ever drawn), optionally press keys, then evaluate some JavaScript and take a picture.
#   python3 tools/drive.py "<query>" ["<js expression or async function>"]
#   KEYS="hold:w:2500,e,wait:1500,1,wait:9000"   keys in order: a key name presses it, hold:key:ms holds it, wait:ms waits
#   SHOT=out.png   SETTLE=4 (seconds after loading)   W, H (window size)
import sys, json, time, os
from playwright.sync_api import sync_playwright
q = sys.argv[1] if len(sys.argv) > 1 else ''
js = sys.argv[2] if len(sys.argv) > 2 else '(() => { const h = window.__house, r = h.renderer.info; return { stages: h.stages, firstFrameMs: h.firstFrameMs, calls: h.lastCalls, tris: h.lastTris, textures: r.memory.textures, geometries: r.memory.geometries, programs: r.programs.length }; })()'
url = os.environ.get('TOWN_URL', 'http://100.107.252.39:5188') + '/?' + q
args = ['--no-sandbox', '--use-gl=angle', '--use-angle=' + os.environ.get('ANGLE', 'gl-egl'), '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--password-store=basic']
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome', headless=True, args=args)
    pg = b.new_page(viewport={'width': int(os.environ.get('W', 1280)), 'height': int(os.environ.get('H', 760))})
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' or m.text.startswith('Q:') else None)
    t0 = time.time(); pg.goto(url)
    pg.wait_for_function('window.__house && window.house', timeout=120000); t1 = time.time()
    pg.wait_for_function('window.__ready === true', timeout=120000); t2 = time.time()
    time.sleep(float(os.environ.get('SETTLE', 4)))
    for k in [k for k in os.environ.get('KEYS', '').split(',') if k]:
        a = k.split(':')
        if a[0] == 'wait': time.sleep(int(a[1]) / 1000)
        elif a[0] == 'hold': pg.keyboard.down(a[1]); time.sleep(int(a[2]) / 1000); pg.keyboard.up(a[1])
        else: pg.keyboard.press(a[0])
    res = pg.evaluate(js)
    if os.environ.get('SHOT'): pg.screenshot(path=os.environ['SHOT'])
    b.close()
for e in errs[:12]: print('page:', e[:400])
print('built in %.1fs, textures in after %.1fs' % (t1 - t0, t2 - t0))
print(res if isinstance(res, str) else json.dumps(res))
