# BD Shop Manager — দোকান ব্যবস্থাপক

A free, fully offline, bilingual (English/বাংলা) point-of-sale lite for small
Bangladeshi shops — inventory, billing, khata (dues ledger), profit reports,
and data backup, all in one single-page app with zero network requests.

> *"Every taka accounted for — প্রতিটি টাকার হিসাব।"*

---

## 1. Problem being solved

Small shops in Bangladesh run on paper notebooks and mental math: stock is
guessed, credit sales ("বাকি") are scribbled in a khata, and nobody knows the
real daily profit. Existing POS software is English-only, subscription-based,
and sends a shop's financial data to someone else's server. BD Shop Manager is
a zero-dependency, fully offline shop notebook: add products once, bill from a
searchable cart with VAT and discounts, track who owes what, and see daily /
monthly profit — with Bengali digits and a full বাংলা interface, and nothing
ever leaving the device.

## 2. Features

| Feature | Description |
|---|---|
| Inventory | Product CRUD (name, SKU, buy/sell price, stock, per-product low-stock threshold); stock in/out adjustments; low-stock alert banner |
| Sales register | Search products, cart with quantity steppers, configurable VAT %, flat discount, cash or credit checkout, printable receipt (print CSS) |
| Oversell protection | Checkout and cart both block selling more than current stock, with a clear bilingual message |
| Khata (dues ledger) | Customer list, credit sales recorded as dues, payments received, per-customer running balance, due reminders sorted by amount owed |
| Profit / Loss reports | Daily (14 days) and monthly (6 months) views; hand-rolled SVG bar charts (revenue / profit metric switch); revenue, cost of goods, gross profit, dues outstanding |
| Exact money math | All money stored as integer paisa — no float error; inputs validated (no negatives, max 2 decimals) |
| Bilingual UI | Full English ⇄ বাংলা toggle, including Bengali digits (৳৩১৫.০০) across every number |
| Backup | One-click JSON export of ALL data; validated JSON import with version check |
| Persistence | Everything in `localStorage`; survives reloads; per-browser |
| Mobile | Responsive layout, no horizontal overflow at 390 px |

Profit is computed as **Σ (sell price − buy price) × quantity sold** (gross,
pre-VAT). VAT is applied on the discounted subtotal: `total = (subtotal −
discount) × (1 + VAT%)`.

## 3. Technology stack

- Plain HTML, CSS, JavaScript — no frameworks, no build step, no dependencies
- Hand-rolled SVG for charts · `localStorage` for persistence · Blob API for JSON export
- `js/core.js`: pure business logic (money, cart, checkout, khata, reports) —
  shared by the browser UI and the Node test suite
- `js/app.js`: DOM/UI layer only

## 4. Prerequisites

Any modern browser (Chrome, Edge, Firefox, Safari). Nothing to install.
Node.js (v18+) only if you want to run the automated test suites.

## 5. Installation

No installation. Open the app directly:

```bash
cd bd-shop-manager
# option 1: double-click index.html, or
python3 -m http.server 8080   # then open http://localhost:8080
```

## 6. Local development commands

There is no build step — edit files and reload. Project layout:

```
bd-shop-manager/
├── index.html        # app shell (tabs, forms, modals)
├── css/style.css     # theme + responsive + print CSS
├── js/core.js        # pure logic (browser global + Node require)
├── js/app.js         # UI layer
├── tests/unit.test.js# Node unit tests (node:test)
├── README.md
└── .gitignore
```

## 7. Environment variable setup

None. The app is fully offline: no API keys, no backends, no secrets of any
kind. (Verified by automated secrets scan — see §8.)

## 8. Testing instructions

Unit tests (27 checks — money parsing/rounding, cart totals with VAT/discount,
`profit = Σ(sell−buy)×qty`, khata balances, overpayment blocking, report
aggregation, import validation). Hand-verified example: buy ৳80 / sell ৳100 ×
3 units + 5% VAT → subtotal ৳300.00, VAT ৳15.00, total **৳315.00**, profit
**৳60.00**:

```bash
node --test tests/unit.test.js
```

Browser UI tests (45 checks via headless Chromium + CDP over `file://`):
full sale flow (search → cart → checkout → stock decremented → daily sales →
profit report), oversell blocked, stock in/out modal, khata due + payment +
overpayment blocked, low-stock alert, EN⇄বাংলা toggle with Bengali digits,
export download + import round-trip, reload persistence, 390 px mobile with no
overflow, zero console/page errors.

```bash
node /tmp/shopqa-tests.cjs   # QA harness (not shipped with the app)
```

Static checks: `grep` for `@media print` (receipt print CSS), zero
`http(s)://` references in app files, secrets scan clean.

## 9. Deployment instructions

Copy the folder to any static host (GitHub Pages, Netlify, or a pen-drive —
it's just files). No server, no build, no environment variables.

## 10. Known limitations

- **Single device, single browser.** Data lives in `localStorage`; there is no
  sync between phone and laptop. Use JSON export to move data.
- **No user accounts or roles.** Anyone with the device can open the app.
- **No barcode scanner / receipt printer integration** — the receipt is a
  browser-print view (thermal 72 mm friendly).
- **Discount is a flat ৳ amount**, not a percentage.
- **VAT is one shop-wide rate**, not per-product.
- **Profit is gross profit** (sell − buy) × qty; rent, salaries, and other
  expenses are not tracked.
- Deleting a product keeps past sales records (they store their own
  name/price snapshots).
- Clearing browser site data deletes everything — keep JSON backups.

## 11. Current project status

Built 2026-10-12 (MUSE PROJECT FACTORY Ω, mega batch run #43). Status:
**complete and verified** — 27/27 Node unit tests and 53/53 headless-Chrome UI
checks green (45 full-flow + 8 stock/edit/delete flows), zero console/page
errors, secrets scan clean, no network requests. Staged for review; not yet
published to GitHub.

## 12. License

MIT — free for any shop to use and modify.
