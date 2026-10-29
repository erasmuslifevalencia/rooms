# Erasmus Life Valencia – Rooms

Public page with the rooms available in our student flats in Valencia, live availability and online request form.

**Live page:** https://erasmuslifevalencia.github.io/rooms/

## How it works
- `index.html` is a static page hosted by GitHub Pages (no Google banner, short address).
- The data and the requests go through the **ELV Rooms** Google Apps Script (account vlc.erasmuslife@gmail.com),
  which keeps working as before with the Student Room Ledger:
  - reading the rooms: `GET <exec URL>?p=json`
  - sending a request: `POST <exec URL>` with `{"action":"request","form":{…}}` (function `doPost`, see `tools/doPost-a-coller.gs`)
- The old Google link of the page still works.
- Anti-bot: the request form shows a Cloudflare Turnstile check (`tools/turnstile.py`, public site key only).
  The script verifies the token with the secret key stored in its Script properties (`TURNSTILE_SECRET`).

## Updating the page
The page is generated from the public page of the script:
`python3 tools/build.py tools/public-original.html <exec URL> index.html`
then commit and push to `main`: GitHub Pages updates the live page in about a minute.
