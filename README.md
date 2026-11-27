# DealHound — Black Friday Deal Finder 2026

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/isnames2/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/isnames2/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

https://make.fun/bounty/black-friday-deal-finder-01

A working Black Friday deal finder for the make.fun bounty. 33 real Black
Friday and Cyber Monday deals, every price checked on Nov 27, 2026 at the
named store or in a deals roundup that names the store. Each deal shows its
product, store, store link, sale price, usual price, discount, check time and
source, plus an honest verdict — new low, strong price, or routine sale —
with the evidence stated. Same-product prices at other stores are shown for
comparison where a second store listed them.

Search, category chips, store / discount / verdict filters and sorting
(biggest discount, biggest saving, lowest price, new lows first) all work
client-side. The site is plain static files under `app/` — hand-written
vanilla JS + CSS, no library, no network requests — and runs in a desktop
browser and on a phone.

- `app/index.html` — the page
- `app/deals.js` — the 33 checked deals and their sources
- `app/app.js` — render, search, filter and sort
- `app/style.css` — the look
- `main.ts` — hands the site in (copies `app/` + `screenshots/`, writes the dossier)
