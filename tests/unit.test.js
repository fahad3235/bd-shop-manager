// bd-shop-manager — Node unit tests (pure core logic, no DOM).
// Run: node --test tests/unit.test.js
// All money expectations are hand-computed. Money unit: integer paisa.
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/core.js');

// ---------- money parsing ----------

test('parseMoney: valid inputs -> paisa', () => {
  assert.equal(C.parseMoney('100'), 10000);
  assert.equal(C.parseMoney('99.99'), 9999);
  assert.equal(C.parseMoney('1,250.50'), 125050);
  assert.equal(C.parseMoney('৳ 80'), 8000);
  assert.equal(C.parseMoney(0), 0);
  assert.equal(C.parseMoney('0.01'), 1);
});

test('parseMoney: rejects negatives, 3 decimals, garbage', () => {
  for (const bad of ['-5', '-0.01', '12.345', 'abc', '', '   ', '1.2.3', null, undefined, NaN]) {
    assert.throws(() => C.parseMoney(bad), /MONEY_INVALID/, 'input: ' + JSON.stringify(bad));
  }
});

test('parseQty: whole numbers only', () => {
  assert.equal(C.parseQty('0'), 0);
  assert.equal(C.parseQty('25'), 25);
  for (const bad of ['-1', '3.5', 'abc', '', '1,000', null]) {
    assert.throws(() => C.parseQty(bad), /QTY_INVALID/, 'input: ' + JSON.stringify(bad));
  }
});

test('parseRate: 0-100, up to 2 decimals', () => {
  assert.equal(C.parseRate('5'), 5);
  assert.equal(C.parseRate('7.5%'), 7.5);
  assert.equal(C.parseRate(0), 0);
  for (const bad of ['-1', '100.01', 'abc', '']) {
    assert.throws(() => C.parseRate(bad), /RATE_INVALID/, 'input: ' + JSON.stringify(bad));
  }
});

// ---------- formatting ----------

test('fmtMoney: grouping, 2 decimals, Bengali digits', () => {
  assert.equal(C.fmtMoney(10000, 'en'), '৳100.00');
  assert.equal(C.fmtMoney(125050, 'en'), '৳1,250.50');
  assert.equal(C.fmtMoney(31500, 'bn'), '৳৩১৫.০০');
  assert.equal(C.fmtMoney(0, 'en'), '৳0.00');
  assert.equal(C.fmtInt(1234, 'bn'), '১২৩৪');
  assert.equal(C.fmtInt(1234, 'en'), '1234');
});

// ---------- product validation ----------

test('validateProduct: normalizes prices to paisa', () => {
  const p = C.validateProduct({ name: ' Rice 5kg ', sku: 'R-5', buy: '420', sell: '480.50', stock: '20', low: '5' });
  assert.deepEqual(p, { name: 'Rice 5kg', sku: 'R-5', buy: 42000, sell: 48050, stock: 20, low: 5 });
});

test('validateProduct: requires name, rejects bad money', () => {
  assert.throws(() => C.validateProduct({ name: '  ', buy: '1', sell: '2' }), /PRODUCT_NAME_REQUIRED/);
  assert.throws(() => C.validateProduct({ name: 'x', buy: '-1', sell: '2' }), /MONEY_INVALID/);
  assert.throws(() => C.validateProduct({ name: 'x', buy: '1', sell: '2', stock: '2.5' }), /QTY_INVALID/);
});

test('marginPct + isLowStock', () => {
  assert.equal(C.marginPct(8000, 10000), 25);          // (100-80)/80 = 25%
  assert.equal(C.marginPct(0, 10000), 100);
  assert.equal(C.isLowStock({ stock: 5, low: 5 }), true);
  assert.equal(C.isLowStock({ stock: 6, low: 5 }), false);
});

// ---------- cart totals (hand-verified) ----------

// buy ৳80 / sell ৳100 × 3 units, 5% VAT, no discount:
//   subtotal = 3×100 = 300.00 ; VAT = 5% of 300 = 15.00 ; total = 315.00
//   COGS = 3×80 = 240.00 ; gross profit = 300 − 240 = 60.00
test('cartTotals: buy80/sell100 x3 + 5% VAT = 315.00, profit 60.00', () => {
  const t = C.cartTotals([{ sell: 10000, buy: 8000, qty: 3 }], 5, 0);
  assert.equal(t.subtotal, 30000);
  assert.equal(t.vat, 1500);
  assert.equal(t.total, 31500);
  assert.equal(t.cogs, 24000);
  assert.equal(t.profit, 6000);
});

// with ৳20 discount: subtotal 300 − 20 = 280 taxable; VAT = 5% of 280 = 14.00; total 294.00
test('cartTotals: discount applied BEFORE VAT', () => {
  const t = C.cartTotals([{ sell: 10000, buy: 8000, qty: 3 }], 5, 2000);
  assert.equal(t.discount, 2000);
  assert.equal(t.vat, 1400);
  assert.equal(t.total, 29400);
  assert.equal(t.profit, 6000); // profit unaffected by discount? gross profit = subtotal-cogs
});

test('cartTotals: mixed items, profit = Σ(sell−buy)×qty', () => {
  // item A: (120−100)×2 = 40 ; item B: (55−40)×5 = 75 ; total profit 115.00
  const t = C.cartTotals([
    { sell: 12000, buy: 10000, qty: 2 },
    { sell: 5500, buy: 4000, qty: 5 }
  ], 0, 0);
  assert.equal(t.subtotal, 24000 + 27500);
  assert.equal(t.cogs, 20000 + 20000);
  assert.equal(t.profit, 11500);
  assert.equal(t.total, t.subtotal);
});

test('cartTotals: discount clamped to subtotal, VAT rounding', () => {
  const t = C.cartTotals([{ sell: 10000, buy: 8000, qty: 1 }], 5, 999999);
  assert.equal(t.discount, 10000);
  assert.equal(t.vat, 0);
  assert.equal(t.total, 0);
  // 7.5% of ৳33.33 = 2.49975 -> rounds to 2.50
  const t2 = C.cartTotals([{ sell: 3333, buy: 1000, qty: 1 }], 7.5, 0);
  assert.equal(t2.vat, 250);
});

test('cartTotals: rejects negative discount / bad qty', () => {
  assert.throws(() => C.cartTotals([{ sell: 100, buy: 50, qty: 1 }], 5, -100), /MONEY_INVALID/);
  assert.throws(() => C.cartTotals([{ sell: 100, buy: 50, qty: 0 }], 5, 0), /QTY_INVALID/);
});

// ---------- checkout / stock ----------

function makeState() {
  const st = C.blankState();
  st.products.push({ id: 'p1', name: 'Rice', sku: '', buy: 8000, sell: 10000, stock: 10, low: 2 });
  st.products.push({ id: 'p2', name: 'Oil', sku: '', buy: 15000, sell: 18000, stock: 5, low: 1 });
  return st;
}

test('applySale: decrements stock, records totals', () => {
  const st = makeState();
  const sale = C.applySale(st, [
    { pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 3 }
  ], { vatRate: 5, discountPaisa: 0, payType: 'cash' });
  assert.equal(sale.total, 31500);
  assert.equal(sale.profit, 6000);
  assert.equal(st.products[0].stock, 7); // 10 − 3
  assert.equal(st.sales.length, 1);
});

test('applySale: blocks overselling', () => {
  const st = makeState();
  assert.throws(() => C.applySale(st, [
    { pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 11 }
  ], { vatRate: 5 }), /OUT_OF_STOCK/);
  assert.equal(st.products[0].stock, 10); // untouched
  assert.equal(st.sales.length, 0);
});

test('applySale: exact-stock sale allowed (boundary)', () => {
  const st = makeState();
  C.applySale(st, [{ pid: 'p2', name: 'Oil', sell: 18000, buy: 15000, qty: 5 }], { vatRate: 0 });
  assert.equal(st.products[1].stock, 0);
});

test('applySale: credit requires customer', () => {
  const st = makeState();
  assert.throws(() => C.applySale(st, [
    { pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 1 }
  ], { vatRate: 0, payType: 'credit' }), /CUSTOMER_REQUIRED/);
});

test('applySale: rejects empty cart', () => {
  const st = makeState();
  assert.throws(() => C.applySale(st, [], { vatRate: 0 }), /CART_EMPTY/);
});

// ---------- khata ----------

test('khata: balance = credit dues − payments', () => {
  const st = makeState();
  st.customers.push({ id: 'c1', name: 'Karim', phone: '01700', note: '' });
  // credit sale ৳315.00 to Karim
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 3 }],
    { vatRate: 5, payType: 'credit', customerId: 'c1' });
  assert.equal(C.customerBalance(st, 'c1'), 31500);
  // cash sale must NOT affect khata balance
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 1 }],
    { vatRate: 0, payType: 'cash' });
  assert.equal(C.customerBalance(st, 'c1'), 31500);
  // payment ৳115.00
  C.recordPayment(st, 'c1', 11500, 'partial');
  assert.equal(C.customerBalance(st, 'c1'), 20000);
  // full settle
  C.recordPayment(st, 'c1', 20000, 'final');
  assert.equal(C.customerBalance(st, 'c1'), 0);
});

test('khata: overpayment blocked, zero/negative payment blocked', () => {
  const st = makeState();
  st.customers.push({ id: 'c1', name: 'Karim', phone: '', note: '' });
  assert.throws(() => C.recordPayment(st, 'c1', 100, ''), /OVERPAYMENT/);
  assert.throws(() => C.recordPayment(st, 'c1', 0, ''), /MONEY_INVALID/);
  assert.throws(() => C.recordPayment(st, 'c1', -50, ''), /MONEY_INVALID/);
  assert.throws(() => C.recordPayment(st, 'nope', 100, ''), /CUSTOMER_NOT_FOUND/);
});

test('khata: dueReminders sorted desc, only positive balances', () => {
  const st = makeState();
  st.customers.push({ id: 'c1', name: 'A', phone: '', note: '' });
  st.customers.push({ id: 'c2', name: 'B', phone: '', note: '' });
  st.customers.push({ id: 'c3', name: 'C', phone: '', note: '' });
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 1 }], { vatRate: 0, payType: 'credit', customerId: 'c1' }); // 10000
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 2 }], { vatRate: 0, payType: 'credit', customerId: 'c2' }); // 20000
  C.recordPayment(st, 'c2', 20000, ''); // settled -> excluded
  const rem = C.dueReminders(st);
  assert.equal(rem.length, 1);
  assert.equal(rem[0].customer.id, 'c1');
  assert.equal(rem[0].balance, 10000);
});

test('validateCustomer: name required, phone format', () => {
  assert.throws(() => C.validateCustomer({ name: '  ' }), /CUSTOMER_NAME_REQUIRED/);
  assert.throws(() => C.validateCustomer({ name: 'x', phone: 'abc!!' }), /CUSTOMER_PHONE_INVALID/);
  const c = C.validateCustomer({ name: ' Karim ', phone: '01712-345678' });
  assert.equal(c.name, 'Karim');
});

// ---------- reports ----------

test('aggregate: daily buckets, revenue/cogs/profit per day', () => {
  const st = makeState();
  const now = new Date(2026, 9, 12, 10, 0, 0).getTime(); // Oct 12 2026
  const d1 = new Date(2026, 9, 12, 9, 0, 0).getTime();
  const d2 = new Date(2026, 9, 11, 9, 0, 0).getTime();
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 3 }], { vatRate: 5, ts: d1 }); // total 31500 profit 6000
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 1 }], { vatRate: 0, ts: d2 }); // total 10000 profit 2000
  const buckets = C.aggregate(st.sales, 'day', 3, 'en', now);
  assert.equal(buckets.length, 3);
  assert.equal(buckets[2].revenue, 31500); // today
  assert.equal(buckets[2].profit, 6000);
  assert.equal(buckets[2].count, 1);
  assert.equal(buckets[1].revenue, 10000); // yesterday
  assert.equal(buckets[0].revenue, 0);     // 2 days ago: empty
});

test('aggregate: monthly buckets', () => {
  const st = makeState();
  const now = new Date(2026, 9, 12).getTime();
  const sep = new Date(2026, 8, 5).getTime();
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 1 }], { vatRate: 0, ts: sep });
  const buckets = C.aggregate(st.sales, 'month', 2, 'en', now);
  assert.equal(buckets[1].key, '2026-10');
  assert.equal(buckets[0].key, '2026-09');
  assert.equal(buckets[0].revenue, 10000);
  assert.equal(buckets[1].revenue, 0);
});

test('totalsFor + duesOutstanding', () => {
  const st = makeState();
  st.customers.push({ id: 'c1', name: 'A', phone: '', note: '' });
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 3 }], { vatRate: 5, payType: 'credit', customerId: 'c1' });
  const t = C.totalsFor(st.sales);
  assert.deepEqual(t, { revenue: 31500, cogs: 24000, profit: 6000, count: 1 });
  assert.equal(C.duesOutstanding(st), 31500);
  C.recordPayment(st, 'c1', 31500, '');
  assert.equal(C.duesOutstanding(st), 0);
});

// ---------- import/export ----------

test('validateImport: round-trip preserves data, rejects garbage', () => {
  const st = makeState();
  st.shopName = 'Test Shop';
  st.vatRate = 7.5;
  st.lang = 'bn';
  st.customers.push({ id: 'c1', name: 'A', phone: '01712345678', note: '' });
  C.applySale(st, [{ pid: 'p1', name: 'Rice', sell: 10000, buy: 8000, qty: 2 }], { vatRate: 7.5, payType: 'credit', customerId: 'c1' });
  C.recordPayment(st, 'c1', 5000, 'x');

  const json = JSON.stringify(st);
  const back = C.validateImport(JSON.parse(json));
  assert.equal(back.shopName, 'Test Shop');
  assert.equal(back.vatRate, 7.5);
  assert.equal(back.lang, 'bn');
  assert.equal(back.products.length, 2);
  assert.equal(back.sales.length, 1);
  assert.equal(back.sales[0].total, 21500); // 200 + 7.5% of 200 = 215.00
  assert.equal(back.payments.length, 1);

  assert.throws(() => C.validateImport(null), /IMPORT_INVALID/);
  assert.throws(() => C.validateImport({ version: 999 }), /IMPORT_VERSION/);
  assert.throws(() => C.validateImport({ version: 1 }), /IMPORT_INVALID/);
  assert.throws(() => C.validateImport({ version: 1, products: [], sales: [], customers: 'x', payments: [] }), /IMPORT_INVALID/);
});

test('genId: unique', () => {
  const ids = new Set();
  for (let i = 0; i < 500; i++) ids.add(C.genId('T'));
  assert.equal(ids.size, 500);
});
