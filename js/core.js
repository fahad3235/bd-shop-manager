/* bd-shop-manager — core business logic (pure, no DOM).
 * Money is stored as INTEGER PAISA (1/100 BDT) everywhere to avoid float error.
 * Loads in the browser as window.ShopCore and in Node via require().
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.ShopCore = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  var VERSION = 1;

  function ShopError(code, detail) {
    var e = new Error(code + (detail ? ': ' + detail : ''));
    e.code = code;
    e.detail = detail || null;
    return e;
  }

  // ---- digits / formatting -----------------------------------------------

  function toDigits(str, lang) {
    str = String(str);
    if (lang === 'bn') return str.replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
    return str;
  }

  // ---- money parsing / validation ----------------------------------------

  // Accepts "1250", "1,250.50", "৳ 99.9" — returns integer paisa.
  // Throws ShopError('MONEY_INVALID') on empty, negative, >2 decimals, NaN.
  function parseMoney(v) {
    if (v === null || v === undefined) throw ShopError('MONEY_INVALID', 'empty');
    var s = String(v).trim().replace(/[৳\s,']/g, '');
    if (s === '') throw ShopError('MONEY_INVALID', 'empty');
    if (!/^-?\d+(\.\d{1,2})?$/.test(s)) throw ShopError('MONEY_INVALID', String(v));
    var n = parseFloat(s);
    if (!isFinite(n)) throw ShopError('MONEY_INVALID', String(v));
    if (n < 0) throw ShopError('MONEY_INVALID', 'negative');
    return Math.round(n * 100);
  }

  // Whole-number quantity: "3" ok, "3.5"/"-1"/"abc" rejected.
  function parseQty(v) {
    if (v === null || v === undefined) throw ShopError('QTY_INVALID', 'empty');
    var s = String(v).trim();
    if (!/^\d+$/.test(s)) throw ShopError('QTY_INVALID', String(v));
    var n = parseInt(s, 10);
    if (n < 0) throw ShopError('QTY_INVALID', 'negative');
    return n;
  }

  // Percentage rate: "5", "7.5" ok, negative or >100 rejected.
  function parseRate(v) {
    if (v === null || v === undefined) throw ShopError('RATE_INVALID', 'empty');
    var s = String(v).trim().replace(/[%％\s]/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(s)) throw ShopError('RATE_INVALID', String(v));
    var n = parseFloat(s);
    if (!isFinite(n) || n < 0 || n > 100) throw ShopError('RATE_INVALID', String(v));
    return Math.round(n * 100) / 100; // keep up to 2 decimals
  }

  // ---- money display ------------------------------------------------------

  function fmtMoney(paisa, lang) {
    var neg = paisa < 0;
    var a = Math.abs(Math.round(paisa));
    var t = Math.floor(a / 100);
    var p = a % 100;
    var grouped = String(t).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var out = (neg ? '-' : '') + '৳' + grouped + '.' + String(p).padStart(2, '0');
    return toDigits(out, lang);
  }

  // taka input echo, e.g. 250.5 -> "250.50"
  function fmtTakaInput(paisa) {
    var a = Math.abs(Math.round(paisa));
    return (paisa < 0 ? '-' : '') + Math.floor(a / 100) + '.' + String(a % 100).padStart(2, '0');
  }

  function fmtInt(n, lang) {
    return toDigits(String(n), lang);
  }

  // ---- product validation -------------------------------------------------

  // Returns normalized product fields (paisa ints). Throws ShopError on invalid.
  function validateProduct(p) {
    var name = String(p.name || '').trim();
    if (!name) throw ShopError('PRODUCT_NAME_REQUIRED');
    if (name.length > 80) throw ShopError('PRODUCT_NAME_TOO_LONG');
    var sku = String(p.sku || '').trim();
    if (sku.length > 40) throw ShopError('PRODUCT_SKU_TOO_LONG');
    var buy = parseMoney(p.buy);
    var sell = parseMoney(p.sell);
    if (sell < buy) { /* allowed: loss leaders exist, margin may be negative */ }
    var stock = parseQty(p.stock === undefined || p.stock === null || p.stock === '' ? 0 : p.stock);
    var low = parseQty(p.low === undefined || p.low === null || p.low === '' ? 0 : p.low);
    return { name: name, sku: sku, buy: buy, sell: sell, stock: stock, low: low };
  }

  function marginPct(buy, sell) {
    if (buy <= 0) return sell > 0 ? 100 : 0;
    return Math.round(((sell - buy) / buy) * 1000) / 10; // 1 decimal
  }

  function isLowStock(product) {
    return product.stock <= product.low;
  }

  // ---- cart / checkout ----------------------------------------------------

  // items: [{sell, buy, qty}] with paisa ints. vatRate in %, discount in paisa.
  // Order of operations: subtotal → discount → VAT on discounted amount → total.
  function cartTotals(items, vatRate, discountPaisa) {
    var rate = (vatRate === undefined || vatRate === null) ? 0 : vatRate;
    if (!(rate >= 0 && rate <= 100)) throw ShopError('RATE_INVALID', String(vatRate));
    var discount = discountPaisa ? Math.round(discountPaisa) : 0;
    if (discount < 0) throw ShopError('MONEY_INVALID', 'negative discount');

    var subtotal = 0, cogs = 0;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it || it.qty <= 0) throw ShopError('QTY_INVALID', 'cart item');
      if (it.sell < 0 || it.buy < 0) throw ShopError('MONEY_INVALID', 'cart price');
      subtotal += it.sell * it.qty;
      cogs += it.buy * it.qty;
    }
    if (discount > subtotal) discount = subtotal; // clamp: can't discount more than subtotal
    var taxable = subtotal - discount;
    var vat = Math.round(taxable * rate / 100);
    var total = taxable + vat;
    var profit = subtotal - cogs; // Σ(sell − buy) × qty (gross, pre-VAT)
    return { subtotal: subtotal, discount: discount, vat: vat, total: total, cogs: cogs, profit: profit };
  }

  // Throws ShopError('OUT_OF_STOCK', name) if any cart line exceeds stock.
  function assertStock(productsById, cartLines) {
    for (var i = 0; i < cartLines.length; i++) {
      var line = cartLines[i];
      var prod = productsById[line.pid];
      if (!prod) throw ShopError('PRODUCT_NOT_FOUND', line.pid);
      if (line.qty > prod.stock) throw ShopError('OUT_OF_STOCK', prod.name);
    }
  }

  // Applies a completed sale: re-checks stock, decrements, returns the sale
  // record (mutates state). Throws on oversell or empty cart.
  function applySale(state, cart, opts) {
    opts = opts || {};
    if (!cart || !cart.length) throw ShopError('CART_EMPTY');
    var byId = {};
    state.products.forEach(function (p) { byId[p.id] = p; });
    var lines = cart.map(function (c) {
      return { pid: c.pid, qty: c.qty, name: c.name, sell: c.sell, buy: c.buy };
    });
    assertStock(byId, lines);

    var items = lines.map(function (l) { return { sell: l.sell, buy: l.buy, qty: l.qty }; });
    var t = cartTotals(items, opts.vatRate, opts.discountPaisa);

    var payType = opts.payType === 'credit' ? 'credit' : 'cash';
    var customerId = opts.customerId || null;
    if (payType === 'credit' && !customerId) throw ShopError('CUSTOMER_REQUIRED');

    lines.forEach(function (l) { byId[l.pid].stock -= l.qty; });

    var sale = {
      id: opts.id || genId('S'),
      ts: opts.ts || Date.now(),
      items: lines.map(function (l) {
        return { pid: l.pid, name: l.name, sell: l.sell, buy: l.buy, qty: l.qty };
      }),
      subtotal: t.subtotal,
      discount: t.discount,
      vatRate: (opts.vatRate === undefined ? 0 : opts.vatRate),
      vat: t.vat,
      total: t.total,
      cogs: t.cogs,
      profit: t.profit,
      payType: payType,
      customerId: customerId,
      note: String(opts.note || '')
    };
    state.sales.push(sale);
    return sale;
  }

  // ---- khata ---------------------------------------------------------------

  function validateCustomer(c) {
    var name = String(c.name || '').trim();
    if (!name) throw ShopError('CUSTOMER_NAME_REQUIRED');
    if (name.length > 80) throw ShopError('CUSTOMER_NAME_TOO_LONG');
    var phone = String(c.phone || '').trim();
    if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) throw ShopError('CUSTOMER_PHONE_INVALID');
    return { name: name, phone: phone, note: String(c.note || '').trim().slice(0, 200) };
  }

  // balance = credit sales total − payments received. Positive = customer owes shop.
  function customerBalance(state, customerId) {
    var dues = 0, paid = 0, i;
    for (i = 0; i < state.sales.length; i++) {
      var s = state.sales[i];
      if (s.payType === 'credit' && s.customerId === customerId) dues += s.total;
    }
    for (i = 0; i < state.payments.length; i++) {
      var p = state.payments[i];
      if (p.customerId === customerId) paid += p.amount;
    }
    return dues - paid;
  }

  function recordPayment(state, customerId, amountPaisa, note, ts) {
    var cust = null;
    for (var i = 0; i < state.customers.length; i++) {
      if (state.customers[i].id === customerId) cust = state.customers[i];
    }
    if (!cust) throw ShopError('CUSTOMER_NOT_FOUND', customerId);
    var amount = Math.round(amountPaisa);
    if (!(amount > 0)) throw ShopError('MONEY_INVALID', 'payment must be positive');
    var bal = customerBalance(state, customerId);
    if (amount > bal) throw ShopError('OVERPAYMENT', String(bal));
    var pay = {
      id: genId('P'),
      ts: ts || Date.now(),
      customerId: customerId,
      amount: amount,
      note: String(note || '').trim().slice(0, 200)
    };
    state.payments.push(pay);
    return pay;
  }

  // Customers who owe money, highest balance first.
  function dueReminders(state) {
    var out = [];
    for (var i = 0; i < state.customers.length; i++) {
      var c = state.customers[i];
      var bal = customerBalance(state, c.id);
      if (bal > 0) out.push({ customer: c, balance: bal });
    }
    out.sort(function (a, b) { return b.balance - a.balance; });
    return out;
  }

  // ---- reports --------------------------------------------------------------

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function dayKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function monthKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1);
  }

  function bucketLabel(key, granularity, lang) {
    if (granularity === 'day') {
      var parts = key.split('-');
      return toDigits(parts[2] + '/' + parts[1], lang);
    }
    var mp = key.split('-');
    var monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var monthsBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    var m = +mp[1] - 1;
    return (lang === 'bn' ? monthsBn[m] : monthsEn[m]) + ' ' + toDigits(mp[0].slice(2), lang);
  }

  // Last n buckets (days or months) ending today, each with revenue/cogs/profit.
  function aggregate(sales, granularity, n, lang, nowTs) {
    var now = nowTs === undefined ? Date.now() : nowTs;
    var buckets = [];
    var map = {};
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(now);
      if (granularity === 'day') d.setDate(d.getDate() - i);
      else d.setMonth(d.getMonth() - i);
      var key = granularity === 'day' ? dayKey(d.getTime()) : monthKey(d.getTime());
      var b = { key: key, label: bucketLabel(key, granularity, lang), revenue: 0, cogs: 0, profit: 0, count: 0 };
      buckets.push(b);
      map[key] = b;
    }
    for (var s = 0; s < sales.length; s++) {
      var sale = sales[s];
      var k = granularity === 'day' ? dayKey(sale.ts) : monthKey(sale.ts);
      var hit = map[k];
      if (hit) {
        hit.revenue += sale.total;
        hit.cogs += sale.cogs;
        hit.profit += sale.profit;
        hit.count += 1;
      }
    }
    return buckets;
  }

  function totalsFor(sales) {
    var revenue = 0, cogs = 0, profit = 0;
    for (var i = 0; i < sales.length; i++) {
      revenue += sales[i].total;
      cogs += sales[i].cogs;
      profit += sales[i].profit;
    }
    return { revenue: revenue, cogs: cogs, profit: profit, count: sales.length };
  }

  function duesOutstanding(state) {
    var total = 0;
    for (var i = 0; i < state.customers.length; i++) {
      var bal = customerBalance(state, state.customers[i].id);
      if (bal > 0) total += bal;
    }
    return total;
  }

  // ---- import / export validation --------------------------------------------

  function blankState() {
    return {
      version: VERSION,
      shopName: '',
      vatRate: 5,
      lang: 'en',
      products: [],
      sales: [],
      customers: [],
      payments: []
    };
  }

  function validateImport(data) {
    if (!data || typeof data !== 'object') throw ShopError('IMPORT_INVALID', 'not an object');
    if (data.version !== VERSION) throw ShopError('IMPORT_VERSION', String(data.version));
    var st = blankState();
    if (typeof data.shopName === 'string') st.shopName = data.shopName.slice(0, 80);
    st.vatRate = parseRate(data.vatRate === undefined ? 5 : data.vatRate);
    st.lang = data.lang === 'bn' ? 'bn' : 'en';
    if (!Array.isArray(data.products) || !Array.isArray(data.sales) ||
        !Array.isArray(data.customers) || !Array.isArray(data.payments)) {
      throw ShopError('IMPORT_INVALID', 'missing arrays');
    }
    var num = function (v, what) {
      if (typeof v !== 'number' || !isFinite(v)) throw ShopError('IMPORT_INVALID', what);
      return v;
    };
    data.products.forEach(function (p) {
      if (!p || typeof p.id !== 'string') throw ShopError('IMPORT_INVALID', 'product id');
      var v = validateProduct({ name: p.name, sku: p.sku, buy: fmtTakaInput(num(p.buy, 'buy')), sell: fmtTakaInput(num(p.sell, 'sell')), stock: num(p.stock, 'stock'), low: num(p.low, 'low') });
      st.products.push({ id: p.id, name: v.name, sku: v.sku, buy: v.buy, sell: v.sell, stock: v.stock, low: v.low });
    });
    data.sales.forEach(function (s) {
      if (!s || typeof s.id !== 'string') throw ShopError('IMPORT_INVALID', 'sale id');
      st.sales.push({
        id: s.id, ts: num(s.ts, 'sale ts'),
        items: (Array.isArray(s.items) ? s.items : []).map(function (it) {
          return { pid: String(it.pid || ''), name: String(it.name || ''), sell: num(it.sell, 'sell'), buy: num(it.buy, 'buy'), qty: num(it.qty, 'qty') };
        }),
        subtotal: num(s.subtotal, 'subtotal'), discount: num(s.discount, 'discount'),
        vatRate: num(s.vatRate, 'vatRate'), vat: num(s.vat, 'vat'), total: num(s.total, 'total'),
        cogs: num(s.cogs, 'cogs'), profit: num(s.profit, 'profit'),
        payType: s.payType === 'credit' ? 'credit' : 'cash',
        customerId: s.customerId || null, note: String(s.note || '')
      });
    });
    data.customers.forEach(function (c) {
      if (!c || typeof c.id !== 'string') throw ShopError('IMPORT_INVALID', 'customer id');
      var v = validateCustomer({ name: c.name, phone: c.phone, note: c.note });
      st.customers.push({ id: c.id, name: v.name, phone: v.phone, note: v.note });
    });
    data.payments.forEach(function (p) {
      if (!p || typeof p.id !== 'string') throw ShopError('IMPORT_INVALID', 'payment id');
      st.payments.push({ id: p.id, ts: num(p.ts, 'payment ts'), customerId: String(p.customerId || ''), amount: num(p.amount, 'amount'), note: String(p.note || '') });
    });
    return st;
  }

  // ---- misc ------------------------------------------------------------------

  var _idSeq = 0;
  function genId(prefix) {
    _idSeq += 1;
    return (prefix || 'X') + Date.now().toString(36) + _idSeq.toString(36) + Math.floor(Math.random() * 1296).toString(36);
  }

  function todaySales(sales, nowTs) {
    var key = dayKey(nowTs === undefined ? Date.now() : nowTs);
    return sales.filter(function (s) { return dayKey(s.ts) === key; });
  }

  return {
    VERSION: VERSION,
    ShopError: ShopError,
    parseMoney: parseMoney,
    parseQty: parseQty,
    parseRate: parseRate,
    fmtMoney: fmtMoney,
    fmtTakaInput: fmtTakaInput,
    fmtInt: fmtInt,
    toDigits: toDigits,
    validateProduct: validateProduct,
    marginPct: marginPct,
    isLowStock: isLowStock,
    cartTotals: cartTotals,
    assertStock: assertStock,
    applySale: applySale,
    validateCustomer: validateCustomer,
    customerBalance: customerBalance,
    recordPayment: recordPayment,
    dueReminders: dueReminders,
    dayKey: dayKey,
    monthKey: monthKey,
    aggregate: aggregate,
    totalsFor: totalsFor,
    duesOutstanding: duesOutstanding,
    blankState: blankState,
    validateImport: validateImport,
    genId: genId,
    todaySales: todaySales
  };
});
