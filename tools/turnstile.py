"""Adds the Cloudflare Turnstile anti-bot check to the public page (index.html).
Usage: python3 tools/turnstile.py index.html   (build.py calls it too)"""
import sys
SITE_KEY = '0x4AAAAAAFq9sMjm174kYGTv'   # public key; the secret key lives only in the Apps Script properties (TURNSTILE_SECRET)

def add_turnstile(s):
    if 'challenges.cloudflare.com/turnstile' in s:
        return s
    def rep(s, a, b):
        assert s.count(a) == 1, a[:70]; return s.replace(a, b)
    s = rep(s, '</style></head>', '.cf-turnstile{min-height:65px}</style>'
            '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script></head>')
    s = rep(s, '<p class="err" id="ferr"></p>',
            '<div class="cf-turnstile" data-sitekey="%s" data-theme="light" data-size="flexible"></div>\n<p class="err" id="ferr"></p>' % SITE_KEY)
    # the token is sent with the form (FormData picks up "cf-turnstile-response"); a used or refused token is renewed
    s = rep(s, "if(!res.ok){document.getElementById('ferr').textContent=res.error;return}",
            "if(!res.ok){document.getElementById('ferr').textContent=res.error;if(window.turnstile)turnstile.reset();return}")
    s = rep(s, ".catch(()=>{b.disabled=false;b.textContent='Send request';",
            ".catch(()=>{b.disabled=false;b.textContent='Send request';if(window.turnstile)turnstile.reset();")
    return s

if __name__ == '__main__':
    p = sys.argv[1]
    s = add_turnstile(open(p).read())
    open(p, 'w').write(s)
    print(p, len(s))
