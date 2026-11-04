/* Builds office/index.html (GitHub copy of the ELV Rooms office page, without the Google banner)
   from the Apps Script file Office.gs.   Usage: node tools/build_office.js path/to/Office.gs
   The page is the same HTML as the Apps Script one; a small shim replaces google.script.run
   with fetch() calls to the web app (doPost action "call" -> remoteCall_ in Office.gs). */
const fs = require('fs'), vm = require('vm'), path = require('path');
const API = 'https://script.google.com/macros/s/AKfycbwIilV5eP7YbUDPOUUo5BVNXXhVUDSKIpZI_3bSQZbJuuhJ-P4Vn1B_L1ShnX-PJmSPqw/exec';
const src = fs.readFileSync(process.argv[2], 'utf8');
const ctx = {}; vm.createContext(ctx);
// only the HTML constant is needed: evaluate the file with the server-only parts neutralised
vm.runInContext(src.replace(/^const REMOTE_FNS[\s\S]*?};/m, 'const REMOTE_FNS={};') + ';this.H=OFFICE_HTML;', ctx);
let s = ctx.H;
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('anchor x' + n + ': ' + a.slice(0, 60)); s = s.replace(a, () => b); };

const head = `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>ELV Rooms Office</title>
<meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#4f0a2f">
<link rel="icon" href="../icon-192.png"><link rel="apple-touch-icon" href="../icon-180.png"><link rel="manifest" href="manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="ELV Office">`;
rep('<meta charset="utf-8">', '<meta charset="utf-8">' + head);
rep('__USER__', '<span id="uname"></span>');
rep('<a class="hb" id="ghnew" href="https://erasmuslifevalencia.github.io/rooms/office/?t=__TOKEN__">New version (no banner) ↗</a>', '');
rep("const TOKEN='__TOKEN__';", "const TOKEN=ELV_TOKEN;");

const shim = `<script>
/* ---- GitHub copy: token + google.script.run shim ---- */
const ELV_API=${JSON.stringify(API)};
const ELV_TOKEN=(()=>{let t='';try{const q=new URLSearchParams(location.search).get('t');if(q){localStorage.setItem('elv_office_t',q);history.replaceState(null,'',location.pathname)}t=q||localStorage.getItem('elv_office_t')||''}catch(e){}return t})();
function elvLogin(msg){try{localStorage.removeItem('elv_office_t')}catch(e){}
 const ov=document.createElement('div');document.body.appendChild(ov);ov.innerHTML='<div style="position:fixed;inset:0;z-index:99;overflow:auto;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(120deg,#4f0a2f,#6e1446 55%,#8e1f5c);font:15px/1.5 Inter,system-ui,sans-serif"><div style="width:min(420px,calc(100vw - 32px));background:#fff;border-radius:18px;padding:24px;display:grid;gap:12px;border-top:5px solid #f47a24;color:#2a1420"><img src="../elv-logo.png" alt="Erasmus Life" style="height:70px;justify-self:center"><h1 style="font:700 22px/1.2 Josefin Sans,Inter,sans-serif;margin:0;text-align:center;color:#4f0a2f">Rooms Office</h1><p style="color:#7a6a70;margin:0">'+(msg||'Enter your team e-mail. If it is allowed, you will receive a personal link to open the office page.')+'</p><input id="lge" type="email" placeholder="you@gmail.com" style="font:inherit;padding:10px;border:1px solid #ebe2dd;border-radius:10px"><button id="lgb" style="font:inherit;font-weight:700;border:0;border-radius:10px;padding:12px;background:#f47a24;color:#fff;cursor:pointer">Send me the link</button><p id="lgr" style="color:#7a6a70;margin:0"></p></div></div>';
 document.getElementById('lgb').onclick=()=>{const e=document.getElementById('lge').value.trim();if(!e)return;const b=document.getElementById('lgb');b.disabled=true;
  elvCall('officeLogin',[e]).then(()=>{document.getElementById('lgr').textContent='If this address is on the team list, the link is in its inbox now (check spam too).';b.disabled=false})
  .catch(()=>{document.getElementById('lgr').textContent='Something went wrong, try again.';b.disabled=false})}}
function elvCall(fn,args){if(!ELV_TOKEN&&fn!=='officeLogin')return new Promise(()=>{});return fetch(ELV_API,{method:'POST',body:JSON.stringify({action:'call',fn:fn,args:args})}).then(r=>{if(!r.ok)throw new Error('Network error ('+r.status+'), try again.');return r.json()})
 .then(r=>{if(!r||!r.ok){const m=(r&&r.error)||'Something went wrong.';if(/sign-in link has expired|not valid/i.test(m)&&fn!=='officeLogin'&&ELV_TOKEN){elvLogin('Your sign-in link has expired. Enter your team e-mail to get a new one.')}throw new Error(m)}
  if(fn==='officeData'&&r.result){const u=document.getElementById('uname');if(u)u.textContent=r.result.user||''}return r.result})}
window.google={script:{run:new Proxy({},{get(_,k0){const st={ok:()=>{},ko:()=>{}};const runner=new Proxy({},{get(_,k){
 if(k==='withSuccessHandler')return f=>{st.ok=f;return runner};if(k==='withFailureHandler')return f=>{st.ko=f;return runner};
 return(...a)=>{elvCall(k,a).then(v=>st.ok(v),e=>st.ko(e))}}});return runner[k0]}})}};
if(!ELV_TOKEN)document.addEventListener('DOMContentLoaded',()=>elvLogin());
</script>
`;
rep('</head>', shim + '</head>');
const out = path.join(__dirname, '..', 'office', 'index.html');
fs.writeFileSync(out, s);
fs.writeFileSync(path.join(__dirname, '..', 'office', 'manifest.json'), JSON.stringify({
  name: 'ELV Rooms Office', short_name: 'ELV Office', start_url: './', scope: './', display: 'standalone',
  background_color: '#f6f2ef', theme_color: '#4f0a2f',
  icons: [{ src: '../icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '../icon-512.png', sizes: '512x512', type: 'image/png' }]
}, null, 2));
console.log('office/index.html', s.length);
