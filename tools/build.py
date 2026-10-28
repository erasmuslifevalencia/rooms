"""Builds the static public rooms page (index.html) from the page served by the ELV Rooms Apps Script.
Usage: python3 build.py public-original.html <API exec URL>"""
import sys, re, json
src = open(sys.argv[1]).read(); api = sys.argv[2]
WA, BRAND = '+34 634 300 402', 'Erasmus Life Valencia'
def rep(s, a, b):
    assert s.count(a) == 1, a[:70]; return s.replace(a, b)
s = src.replace('__WHATSAPP__', WA).replace('__BRAND__', BRAND)
head_extra = ('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
  '<title>Rooms available in Valencia · Erasmus Life</title>'
  '<meta name="description" content="Student rooms in shared flats in Valencia, live availability. Request your room online.">'
  '<meta property="og:title" content="Rooms available in Valencia · Erasmus Life">'
  '<meta property="og:description" content="Student rooms in shared flats, live availability. Request your room online.">'
  '<meta name="theme-color" content="#e8622a">'
  '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%23e8622a%22/%3E%3Ctext x=%2232%22 y=%2243%22 font-family=%22Arial%22 font-size=%2230%22 font-weight=%22700%22 text-anchor=%22middle%22 fill=%22white%22%3EELV%3C/text%3E%3C/svg%3E">')
s = rep(s, '<meta charset="utf-8">', '<meta charset="utf-8">' + head_extra)
s = rep(s, '<main id="list"></main>', '<main id="list"><p class="none" id="loading">Loading the rooms…</p></main>')
# The data now comes from the script by fetch; the page code runs once it has arrived.
i = s.index('<script>\nconst D=/*__DATA__*/null;'); j = s.index('</script></body></html>')
main = s[i + len('<script>\n'):j]
main = rep(main, 'const D=/*__DATA__*/null;', '')
main = rep(main, "google.script.run.withSuccessHandler(res=>{", "post({action:'request',form:o}).then(res=>{")
main = rep(main, ".withFailureHandler(()=>{", ".catch(()=>{")
main = rep(main, ".submitRequest(o)};", "};")
loader = """<script>
const API=%s;
function post(body){return fetch(API,{method:'POST',body:JSON.stringify(body)}).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.json()})}
let D=null;
function start(){const s=document.createElement('script');s.textContent=document.getElementById('app').textContent;document.body.append(s)}
fetch(API+'?p=json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.json()}).then(d=>{D=d;start()})
.catch(()=>{document.getElementById('list').innerHTML='<p class="none">The rooms could not be loaded. Please reload the page, or ask us on WhatsApp %s.</p>'});
</script>
<script type="text/plain" id="app">
""" % (json.dumps(api), WA)
s = s[:i] + loader + main + '</script></body></html>'
open(sys.argv[3] if len(sys.argv) > 3 else 'index.html', 'w').write(s)
print('index.html', len(s))
