/* bd-shop-manager — UI layer (DOM). Business logic lives in js/core.js. */
(function () {
'use strict';
var C = window.ShopCore;

/* ============================== i18n ============================== */
var I18N = {
en: {
  brandSub: 'Small-business POS · দোকান ব্যবস্থাপক',
  tabInventory: 'Inventory', tabSales: 'Sales', tabKhata: 'Khata', tabReports: 'Reports', tabSettings: 'Settings',
  lowStockTitle: '⚠ Low stock alert',
  addProduct: 'Add product', editProduct: 'Edit product',
  fName: 'Product name *', fSku: 'SKU / code', fBuy: 'Buy price (৳) *', fSell: 'Sell price (৳) *',
  fStock: 'Opening stock', fLow: 'Low-stock alert at',
  btnAddProduct: 'Add product', btnUpdate: 'Update product', btnCancel: 'Cancel',
  moneyHint: 'Money: positive numbers, up to 2 decimals. Stock: whole numbers.',
  productList: 'Products',
  thName: 'Name', thSku: 'SKU', thBuy: 'Buy', thSell: 'Sell', thMargin: 'Margin',
  thStock: 'Stock', thActions: 'Actions',
  noProducts: 'No products yet. Add your first product above.',
  newSale: 'New sale', searchPh: 'Search product by name or SKU…', cart: 'Cart',
  thItem: 'Item', thPrice: 'Price', thQty: 'Qty', thLineTotal: 'Total',
  emptyCart: 'Cart is empty. Search and add products above.',
  subtotal: 'Subtotal', discount: 'Discount (৳)', vat: 'VAT', total: 'Total',
  payCash: 'Cash', payCredit: 'Credit (khata)',
  quickAddCust: '+ Quick-add customer', custNamePh: 'Customer name', custPhonePh: 'Phone (optional)',
  btnAdd: 'Add', btnCheckout: 'Checkout', btnClear: 'Clear',
  todaySales: "Today's sales", thTime: 'Time', thItems: 'Items', thPayType: 'Type', thTotal: 'Total',
  noSalesToday: 'No sales recorded today yet.',
  dueReminders: 'Due reminders', noDues: 'No outstanding dues. 🎉',
  addCustomer: 'Add customer', fCustName: 'Name *', fCustPhone: 'Phone', fCustNote: 'Note',
  btnAddCustomer: 'Add customer', customers: 'Customers',
  thCustName: 'Name', thPhone: 'Phone', thBalance: 'Balance due',
  noCustomers: 'No customers yet.', btnBack: '← Back', balanceDue: 'Balance due',
  thDate: 'Date', thType: 'Type', thDetail: 'Detail', thAmount: 'Amount',
  recordPayment: 'Record payment received', amountPh: 'Amount (৳)', notePh: 'Note (optional)',
  btnRecordPay: 'Record',
  plReport: 'Profit / Loss report', daily: 'Daily', monthly: 'Monthly',
  revenue: 'Revenue', cogs: 'Cost of goods', grossProfit: 'Gross profit', duesOut: 'Dues outstanding',
  mRevenue: 'Revenue', mProfit: 'Profit',
  profitFormula: 'Profit = Σ (sell price − buy price) × quantity sold.',
  shopSettings: 'Shop settings', fShopName: 'Shop name', fVat: 'VAT rate (%)',
  btnSave: 'Save settings', language: 'Language / ভাষা',
  dataTitle: 'Data backup', dataHint: 'All data stays in this browser (localStorage). Export a JSON backup regularly.',
  btnExport: '⬇ Export JSON', btnImport: '⬆ Import JSON',
  dangerZone: 'Danger zone', btnClearAll: 'Delete ALL data',
  stockIn: 'Stock in (+)', stockOut: 'Stock out (−)', fQty: 'Quantity',
  btnPrint: '🖨 Print receipt', btnClose: 'Close',
  // dynamic
  btnStock: 'Stock', btnEdit: 'Edit', btnDelete: 'Delete', btnLedger: 'Ledger',
  typeCash: 'Cash', typeCredit: 'Credit',
  ledgerDue: 'Credit sale', ledgerPay: 'Payment received',
  receiptTitle: 'SALES RECEIPT', rThank: 'Thank you, come again!',
  msgProdAdded: 'Product added.', msgProdUpdated: 'Product updated.', msgProdDeleted: 'Product deleted.',
  msgStockSaved: 'Stock updated.', msgSaleDone: 'Sale completed.', msgCustAdded: 'Customer added.',
  msgPayRecorded: 'Payment recorded.', msgSettingsSaved: 'Settings saved.',
  msgImported: 'Data imported.', msgCleared: 'All data deleted.',
  confirmDeleteProd: 'Delete this product? Past sales records are kept.',
  confirmClear: 'Delete ALL data? This cannot be undone.',
  confirmClear2: 'Really delete everything? Last chance!',
  confirmImport: 'Replace all current data with the imported file?',
  errMoneyInvalid: 'Invalid amount — enter a positive number with up to 2 decimals.',
  errQtyInvalid: 'Quantity must be a whole number, 0 or more.',
  errRateInvalid: 'Rate must be between 0 and 100.',
  errCartEmpty: 'Cart is empty.',
  errCustomerRequired: 'Select a customer for a credit sale.',
  errProdName: 'Product name is required.',
  errCustName: 'Customer name is required.',
  errOverpayment: 'Payment is more than the due balance.',
  errImport: 'Invalid backup file.',
  errStockOut: 'Cannot take out more than the current stock.',
  errCustPhone: 'Phone number looks invalid.',
  errDupSku: 'That SKU is already used by another product.',
  noResults: 'No products match.',
  saleN: 'Sale'
},
bn: {
  brandSub: 'ক্ষুদ্র ব্যবসার POS · দোকান ব্যবস্থাপক',
  tabInventory: 'মজুদ', tabSales: 'বিক্রি', tabKhata: 'খাতা', tabReports: 'প্রতিবেদন', tabSettings: 'সেটিংস',
  lowStockTitle: '⚠ স্টক কমে গেছে',
  addProduct: 'পণ্য যোগ করুন', editProduct: 'পণ্য সম্পাদনা করুন',
  fName: 'পণ্যের নাম *', fSku: 'SKU / কোড', fBuy: 'ক্রয়মূল্য (৳) *', fSell: 'বিক্রয়মূল্য (৳) *',
  fStock: 'প্রাথমিক স্টক', fLow: 'এত থাকলে সতর্কবার্তা',
  btnAddProduct: 'পণ্য যোগ করুন', btnUpdate: 'আপডেট করুন', btnCancel: 'বাতিল',
  moneyHint: 'টাকা: ধনাত্মক সংখ্যা, সর্বোচ্চ ২ দশমিক। স্টক: পূর্ণসংখ্যা।',
  productList: 'পণ্য তালিকা',
  thName: 'নাম', thSku: 'SKU', thBuy: 'ক্রয়', thSell: 'বিক্রয়', thMargin: 'মার্জিন',
  thStock: 'স্টক', thActions: 'কার্যক্রম',
  noProducts: 'এখনও কোনো পণ্য নেই। উপরে প্রথম পণ্য যোগ করুন।',
  newSale: 'নতুন বিক্রি', searchPh: 'নাম বা SKU দিয়ে পণ্য খুঁজুন…', cart: 'কার্ট',
  thItem: 'পণ্য', thPrice: 'দাম', thQty: 'পরিমাণ', thLineTotal: 'মোট',
  emptyCart: 'কার্ট খালি। উপরে খুঁজে পণ্য যোগ করুন।',
  subtotal: 'উপ-মোট', discount: 'ছাড় (৳)', vat: 'ভ্যাট', total: 'সর্বমোট',
  payCash: 'নগদ', payCredit: 'বাকি (খাতা)',
  quickAddCust: '+ দ্রুত গ্রাহক যোগ করুন', custNamePh: 'গ্রাহকের নাম', custPhonePh: 'ফোন (ঐচ্ছিক)',
  btnAdd: 'যোগ করুন', btnCheckout: 'বিল করুন', btnClear: 'মুছুন',
  todaySales: 'আজকের বিক্রি', thTime: 'সময়', thItems: 'পণ্য', thPayType: 'ধরন', thTotal: 'মোট',
  noSalesToday: 'আজ এখনও কোনো বিক্রি হয়নি।',
  dueReminders: 'বকেয়া তালিকা', noDues: 'কোনো বকেয়া নেই। 🎉',
  addCustomer: 'গ্রাহক যোগ করুন', fCustName: 'নাম *', fCustPhone: 'ফোন', fCustNote: 'নোট',
  btnAddCustomer: 'গ্রাহক যোগ করুন', customers: 'গ্রাহক তালিকা',
  thCustName: 'নাম', thPhone: 'ফোন', thBalance: 'বকেয়া',
  noCustomers: 'এখনও কোনো গ্রাহক নেই।', btnBack: '← ফিরে যান', balanceDue: 'বকেয়া পরিমাণ',
  thDate: 'তারিখ', thType: 'ধরন', thDetail: 'বিবরণ', thAmount: 'পরিমাণ',
  recordPayment: 'প্রাপ্ত পেমেন্ট রেকর্ড করুন', amountPh: 'পরিমাণ (৳)', notePh: 'নোট (ঐচ্ছিক)',
  btnRecordPay: 'রেকর্ড করুন',
  plReport: 'লাভ / ক্ষতি প্রতিবেদন', daily: 'দৈনিক', monthly: 'মাসিক',
  revenue: 'আয়', cogs: 'পণ্যের ক্রয়মূল্য', grossProfit: 'মোট লাভ', duesOut: 'বকেয়া পাওনা',
  mRevenue: 'আয়', mProfit: 'লাভ',
  profitFormula: 'লাভ = Σ (বিক্রয়মূল্য − ক্রয়মূল্য) × বিক্রীত পরিমাণ।',
  shopSettings: 'দোকানের সেটিংস', fShopName: 'দোকানের নাম', fVat: 'ভ্যাট হার (%)',
  btnSave: 'সংরক্ষণ করুন', language: 'Language / ভাষা',
  dataTitle: 'ডেটা ব্যাকআপ', dataHint: 'সব ডেটা এই ব্রাউজারেই থাকে (localStorage)। নিয়মিত JSON ব্যাকআপ নিন।',
  btnExport: '⬇ JSON ডাউনলোড', btnImport: '⬆ JSON ইমপোর্ট',
  dangerZone: 'বিপজ্জনক এলাকা', btnClearAll: 'সব ডেটা মুছুন',
  stockIn: 'স্টক ইন (+)', stockOut: 'স্টক আউট (−)', fQty: 'পরিমাণ',
  btnPrint: '🖨 রসিদ প্রিন্ট', btnClose: 'বন্ধ করুন',
  // dynamic
  btnStock: 'স্টক', btnEdit: 'সম্পাদনা', btnDelete: 'মুছুন', btnLedger: 'খতিয়ান',
  typeCash: 'নগদ', typeCredit: 'বাকি',
  ledgerDue: 'বাকিতে বিক্রি', ledgerPay: 'পেমেন্ট প্রাপ্ত',
  receiptTitle: 'বিক্রয় রসিদ', rThank: 'ধন্যবাদ, আবার আসবেন!',
  msgProdAdded: 'পণ্য যোগ হয়েছে।', msgProdUpdated: 'পণ্য আপডেট হয়েছে।', msgProdDeleted: 'পণ্য মুছে ফেলা হয়েছে।',
  msgStockSaved: 'স্টক আপডেট হয়েছে।', msgSaleDone: 'বিক্রি সম্পন্ন হয়েছে।', msgCustAdded: 'গ্রাহক যোগ হয়েছে।',
  msgPayRecorded: 'পেমেন্ট রেকর্ড হয়েছে।', msgSettingsSaved: 'সেটিংস সংরক্ষণ হয়েছে।',
  msgImported: 'ডেটা ইমপোর্ট হয়েছে।', msgCleared: 'সব ডেটা মুছে ফেলা হয়েছে।',
  confirmDeleteProd: 'এই পণ্যটি মুছবেন? আগের বিক্রির রেকর্ড থাকবে।',
  confirmClear: 'সব ডেটা মুছবেন? এটি ফেরানো যাবে না।',
  confirmClear2: 'সত্যিই সব মুছে ফেলবেন? শেষ সুযোগ!',
  confirmImport: 'বর্তমান সব ডেটা ইমপোর্ট করা ফাইল দিয়ে বদলে দেবেন?',
  errMoneyInvalid: 'অবৈধ পরিমাণ — ধনাত্মক সংখ্যা দিন (সর্বোচ্চ ২ দশমিক)।',
  errQtyInvalid: 'পরিমাণ পূর্ণসংখ্যা হতে হবে (০ বা বেশি)।',
  errRateInvalid: 'হার ০ থেকে ১০০-এর মধ্যে হতে হবে।',
  errCartEmpty: 'কার্ট খালি।',
  errCustomerRequired: 'বাকি বিক্রির জন্য গ্রাহক নির্বাচন করুন।',
  errProdName: 'পণ্যের নাম আবশ্যক।',
  errCustName: 'গ্রাহকের নাম আবশ্যক।',
  errOverpayment: 'পেমেন্ট বকেয়ার চেয়ে বেশি।',
  errImport: 'ব্যাকআপ ফাইলটি সঠিক নয়।',
  errStockOut: 'বর্তমান স্টকের চেয়ে বেশি বের করা যাবে না।',
  errCustPhone: 'ফোন নম্বরটি সঠিক মনে হচ্ছে না।',
  errDupSku: 'এই SKU অন্য পণ্যে ব্যবহার করা হয়েছে।',
  noResults: 'কোনো পণ্য মেলেনি।',
  saleN: 'বিক্রি'
}
};

var ERR_KEY = {
  MONEY_INVALID: 'errMoneyInvalid',
  QTY_INVALID: 'errQtyInvalid',
  RATE_INVALID: 'errRateInvalid',
  CART_EMPTY: 'errCartEmpty',
  CUSTOMER_REQUIRED: 'errCustomerRequired',
  PRODUCT_NAME_REQUIRED: 'errProdName',
  CUSTOMER_NAME_REQUIRED: 'errCustName',
  OVERPAYMENT: 'errOverpayment',
  IMPORT_INVALID: 'errImport',
  IMPORT_VERSION: 'errImport',
  CUSTOMER_PHONE_INVALID: 'errCustPhone',
  PRODUCT_NOT_FOUND: 'errImport',
  CUSTOMER_NOT_FOUND: 'errImport'
};

function t(key) {
  var lang = state.lang || 'en';
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

/* ============================== state ============================== */
var LS_KEY = 'bd-shop-manager-v1';
var state = loadState();
var cart = [];            // [{pid, name, sell, buy, qty}] — session only
var editingProductId = null;
var stockTargetId = null;
var ledgerCustomerId = null;
var reportGran = 'day';
var reportMetric = 'revenue';

function loadState() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (raw) return C.validateImport(JSON.parse(raw));
  } catch (e) { /* corrupted -> start fresh */ }
  return C.blankState();
}
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
}

/* ============================== helpers ============================== */
function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}
function lang() { return state.lang === 'bn' ? 'bn' : 'en'; }
function money(paisa) { return C.fmtMoney(paisa, lang()); }
function num(n) { return C.fmtInt(n, lang()); }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function fmtTime(ts) {
  var d = new Date(ts);
  return C.toDigits(pad2(d.getHours()) + ':' + pad2(d.getMinutes()), lang());
}
function fmtDate(ts) {
  var d = new Date(ts);
  return C.toDigits(pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear(), lang());
}
function fmtDateTime(ts) { return fmtDate(ts) + ' ' + fmtTime(ts); }

function showMsg(el, key, isErr) {
  el.textContent = t(key);
  el.className = 'msg ' + (isErr === false ? 'ok' : 'err');
  el.classList.remove('hidden');
}
function showErr(el, err) {
  var key = (err && err.code && ERR_KEY[err.code]) || 'errImport';
  if (err && err.code === 'OUT_OF_STOCK') {
    var msg = lang() === 'bn'
      ? '“' + err.detail + '”-এর পর্যাপ্ত স্টক নেই।'
      : 'Not enough stock for "' + err.detail + '".';
    el.textContent = msg;
  } else {
    el.textContent = t(key);
  }
  el.className = 'msg err';
  el.classList.remove('hidden');
}
function hideMsg(el) { el.classList.add('hidden'); }

var toastTimer = null;
function toast(key) {
  var el = $('toast');
  el.textContent = t(key);
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
}
function toastText(text) {
  var el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
}

function applyI18n() {
  document.documentElement.lang = lang() === 'bn' ? 'bn' : 'en';
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) els[i].textContent = t(els[i].getAttribute('data-i18n'));
  var phs = document.querySelectorAll('[data-i18n-ph]');
  for (var j = 0; j < phs.length; j++) phs[j].setAttribute('placeholder', t(phs[j].getAttribute('data-i18n-ph')));
  $('langToggle').textContent = lang() === 'bn' ? 'English' : 'বাংলা';
  $('hdrShopName').textContent = state.shopName || 'BD Shop Manager';
  document.title = (state.shopName || 'BD Shop Manager') + ' — ' + t('tabInventory');
}

/* ============================== tabs ============================== */
function switchTab(name) {
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === name);
  var panels = document.querySelectorAll('.panel');
  for (var j = 0; j < panels.length; j++) panels[j].classList.toggle('active', panels[j].id === 'tab-' + name);
  if (name === 'reports') renderReports();
  if (name === 'sales') { renderCart(); renderTodaySales(); }
  if (name === 'khata') renderKhata();
  if (name === 'inventory') renderInventory();
}

/* ============================== inventory ============================== */
function productById(id) {
  for (var i = 0; i < state.products.length; i++) if (state.products[i].id === id) return state.products[i];
  return null;
}

function renderInventory() {
  var low = state.products.filter(C.isLowStock);
  var banner = $('lowStockBanner');
  if (low.length) {
    banner.classList.remove('hidden');
    $('lowStockList').innerHTML = low.map(function (p) {
      return '<li>' + esc(p.name) + ' — <b>' + num(p.stock) + '</b> ' + esc(t('thStock').toLowerCase()) + '</li>';
    }).join('');
  } else banner.classList.add('hidden');

  var tb = $('productTableBody');
  if (!state.products.length) {
    tb.innerHTML = '';
    $('noProducts').classList.remove('hidden');
  } else {
    $('noProducts').classList.add('hidden');
    tb.innerHTML = state.products.map(function (p) {
      var m = C.marginPct(p.buy, p.sell);
      var stockCls = C.isLowStock(p) ? ' class="stock-low"' : '';
      return '<tr>' +
        '<td><b>' + esc(p.name) + '</b></td>' +
        '<td>' + esc(p.sku || '—') + '</td>' +
        '<td>' + money(p.buy) + '</td>' +
        '<td>' + money(p.sell) + '</td>' +
        '<td>' + C.toDigits(m + '%', lang()) + '</td>' +
        '<td' + stockCls + '>' + num(p.stock) + '</td>' +
        '<td><div class="row" style="margin:0">' +
          '<button class="btn small" data-act="stock" data-id="' + p.id + '">' + esc(t('btnStock')) + '</button>' +
          '<button class="btn small" data-act="edit" data-id="' + p.id + '">' + esc(t('btnEdit')) + '</button>' +
          '<button class="btn small" data-act="del" data-id="' + p.id + '">' + esc(t('btnDelete')) + '</button>' +
        '</div></td></tr>';
    }).join('');
  }
}

function resetProductForm() {
  editingProductId = null;
  $('prodName').value = ''; $('prodSku').value = ''; $('prodBuy').value = '';
  $('prodSell').value = ''; $('prodStock').value = ''; $('prodLow').value = '';
  $('productFormTitle').textContent = t('addProduct');
  $('addProductBtn').textContent = t('btnAddProduct');
  $('cancelEditBtn').classList.add('hidden');
}

function saveProduct() {
  try {
    var v = C.validateProduct({
      name: $('prodName').value, sku: $('prodSku').value,
      buy: $('prodBuy').value, sell: $('prodSell').value,
      stock: $('prodStock').value, low: $('prodLow').value
    });
  } catch (e) { toastText(errText(e)); return; }

  // unique SKU check
  var sku = v.sku;
  if (sku) {
    for (var i = 0; i < state.products.length; i++) {
      var p = state.products[i];
      if (p.sku === sku && p.id !== editingProductId) { toastText(t('errDupSku')); return; }
    }
  }

  if (editingProductId) {
    var ex = productById(editingProductId);
    if (ex) { ex.name = v.name; ex.sku = v.sku; ex.buy = v.buy; ex.sell = v.sell; ex.low = v.low;
      if ($('prodStock').value.trim() !== '') { try { ex.stock = C.parseQty($('prodStock').value); } catch (e) {} } }
    toast('msgProdUpdated');
  } else {
    state.products.push({ id: C.genId('PR'), name: v.name, sku: v.sku, buy: v.buy, sell: v.sell, stock: v.stock, low: v.low });
    toast('msgProdAdded');
  }
  save(); resetProductForm(); renderInventory();
}

function errText(err) {
  if (err && err.code === 'OUT_OF_STOCK') {
    return lang() === 'bn' ? '“' + err.detail + '”-এর পর্যাপ্ত স্টক নেই।' : 'Not enough stock for "' + err.detail + '".';
  }
  var key = (err && err.code && ERR_KEY[err.code]) || 'errImport';
  return t(key);
}

function openStockModal(id) {
  stockTargetId = id;
  var p = productById(id);
  if (!p) return;
  $('stockModalTitle').textContent = t('btnStock') + ' — ' + p.name + ' (' + num(p.stock) + ')';
  $('stockQty').value = '1';
  document.querySelector('input[name="stockDir"][value="in"]').checked = true;
  hideMsg($('stockMsg'));
  $('stockModal').classList.remove('hidden');
}

function saveStock() {
  var p = productById(stockTargetId);
  if (!p) return;
  var qty;
  try { qty = C.parseQty($('stockQty').value); }
  catch (e) { showErr($('stockMsg'), e); return; }
  var dir = document.querySelector('input[name="stockDir"]:checked').value;
  if (dir === 'in') { p.stock += qty; }
  else {
    if (qty > p.stock) { showMsg($('stockMsg'), 'errStockOut'); return; }
    p.stock -= qty;
  }
  save();
  $('stockModal').classList.add('hidden');
  toast('msgStockSaved');
  renderInventory();
  if (!$('tab-sales').classList.contains('hidden')) renderCart();
}

/* ============================== sales ============================== */
function searchProducts(q) {
  q = String(q || '').trim().toLowerCase();
  if (!q) return [];
  return state.products.filter(function (p) {
    return p.name.toLowerCase().indexOf(q) !== -1 || (p.sku && p.sku.toLowerCase().indexOf(q) !== -1);
  }).slice(0, 30);
}

function renderSearch() {
  var box = $('searchResults');
  var q = $('saleSearch').value;
  var hits = searchProducts(q);
  if (!q.trim()) { box.innerHTML = ''; return; }
  if (!hits.length) { box.innerHTML = '<p class="empty">' + esc(t('noResults')) + '</p>'; return; }
  box.innerHTML = hits.map(function (p) {
    var dis = p.stock <= 0 ? ' disabled' : '';
    return '<div class="result-item"><div><div class="nm">' + esc(p.name) + '</div>' +
      '<div class="pr">' + money(p.sell) + '</div>' +
      '<div class="st">' + esc(t('thStock')) + ': ' + num(p.stock) + '</div></div>' +
      '<button class="btn small primary" data-add="' + p.id + '"' + dis + '>+</button></div>';
  }).join('');
}

function cartQty(pid) {
  for (var i = 0; i < cart.length; i++) if (cart[i].pid === pid) return cart[i].qty;
  return 0;
}

function addToCart(pid) {
  var p = productById(pid);
  if (!p || p.stock <= 0) return;
  var inCart = cartQty(pid);
  if (inCart + 1 > p.stock) {
    toastText(lang() === 'bn' ? '“' + p.name + '”-এর পর্যাপ্ত স্টক নেই।' : 'Not enough stock for "' + p.name + '".');
    return;
  }
  var line = null;
  for (var i = 0; i < cart.length; i++) if (cart[i].pid === pid) line = cart[i];
  if (line) line.qty += 1;
  else cart.push({ pid: p.id, name: p.name, sell: p.sell, buy: p.buy, qty: 1 });
  renderCart();
}

function cartTotalsLive() {
  var items = cart.map(function (l) { return { sell: l.sell, buy: l.buy, qty: l.qty }; });
  var disc = 0;
  try { disc = C.parseMoney($('discInput').value || '0'); } catch (e) { disc = 0; }
  return C.cartTotals(items, state.vatRate, disc);
}

function renderCart() {
  var tb = $('cartBody');
  if (!cart.length) {
    tb.innerHTML = '';
    $('emptyCart').classList.remove('hidden');
  } else {
    $('emptyCart').classList.add('hidden');
    tb.innerHTML = cart.map(function (l) {
      return '<tr><td>' + esc(l.name) + '</td><td>' + money(l.sell) + '</td>' +
        '<td><span class="stepper">' +
        '<button data-cact="dec" data-id="' + l.pid + '" aria-label="-">−</button>' +
        '<b>' + num(l.qty) + '</b>' +
        '<button data-cact="inc" data-id="' + l.pid + '" aria-label="+">+</button>' +
        '</span></td>' +
        '<td>' + money(l.sell * l.qty) + '</td>' +
        '<td><button class="btn small" data-cact="rm" data-id="' + l.pid + '">×</button></td></tr>';
    }).join('');
  }
  try {
    var tt = cartTotalsLive();
    $('sumSubtotal').textContent = money(tt.subtotal);
    $('sumVat').textContent = money(tt.vat);
    $('sumTotal').textContent = money(tt.total);
  } catch (e) {
    $('sumSubtotal').textContent = money(0);
    $('sumVat').textContent = money(0);
    $('sumTotal').textContent = money(0);
  }
  $('vatLabel').textContent = C.toDigits(state.vatRate + '%', lang());
}

function renderTodaySales() {
  var list = C.todaySales(state.sales);
  var tb = $('todaySalesBody');
  if (!list.length) { tb.innerHTML = ''; $('noSalesToday').classList.remove('hidden'); return; }
  $('noSalesToday').classList.add('hidden');
  var rows = list.slice().reverse().map(function (s) {
    var nItems = 0;
    for (var i = 0; i < s.items.length; i++) nItems += s.items[i].qty;
    var pill = s.payType === 'credit'
      ? '<span class="pill credit">' + esc(t('typeCredit')) + '</span>'
      : '<span class="pill cash">' + esc(t('typeCash')) + '</span>';
    var custName = '';
    if (s.payType === 'credit' && s.customerId) {
      var c = customerById(s.customerId);
      if (c) custName = ' · ' + esc(c.name);
    }
    return '<tr><td>' + fmtTime(s.ts) + '</td><td>' + num(nItems) + custName + '</td><td>' + pill + '</td><td><b>' + money(s.total) + '</b></td></tr>';
  });
  tb.innerHTML = rows.join('');
}

function checkout() {
  hideMsg($('saleMsg'));
  if (!cart.length) { showMsg($('saleMsg'), 'errCartEmpty'); return; }
  var disc;
  try { disc = C.parseMoney($('discInput').value || '0'); }
  catch (e) { showErr($('saleMsg'), e); return; }
  var payType = $('payCredit').checked ? 'credit' : 'cash';
  var customerId = null;
  if (payType === 'credit') {
    customerId = $('customerSelect').value || null;
    if (!customerId) { showMsg($('saleMsg'), 'errCustomerRequired'); return; }
  }
  var lines = cart.map(function (l) { return { pid: l.pid, name: l.name, sell: l.sell, buy: l.buy, qty: l.qty }; });
  var sale;
  try {
    sale = C.applySale(state, lines, { vatRate: state.vatRate, discountPaisa: disc, payType: payType, customerId: customerId });
  } catch (e) { showErr($('saleMsg'), e); return; }
  save();
  cart = [];
  $('discInput').value = '0';
  $('saleSearch').value = '';
  renderSearch(); renderCart(); renderTodaySales(); renderInventory();
  showMsg($('saleMsg'), 'msgSaleDone', false);
  openReceipt(sale);
}

/* ============================== receipt ============================== */
function openReceipt(sale) {
  var L = lang();
  var rows = sale.items.map(function (it) {
    return '<tr><td>' + esc(it.name) + '<br><span style="color:#666">' +
      num(it.qty) + ' × ' + money(it.sell) + '</span></td>' +
      '<td style="text-align:right">' + money(it.sell * it.qty) + '</td></tr>';
  }).join('');
  var custLine = '';
  if (sale.payType === 'credit' && sale.customerId) {
    var c = customerById(sale.customerId);
    if (c) custLine = '<div>' + esc(c.name) + (c.phone ? ' · ' + esc(c.phone) : '') + '</div>';
  }
  $('receiptBody').innerHTML =
    '<div class="r-head"><h3>' + esc(state.shopName || 'BD Shop Manager') + '</h3>' +
    '<div><b>' + esc(t('receiptTitle')) + '</b></div>' +
    '<div>' + fmtDateTime(sale.ts) + '</div>' +
    '<div>' + esc(t('saleN')) + ' #' + esc(sale.id.slice(-6).toUpperCase()) + '</div></div>' +
    custLine +
    '<table>' + rows + '</table>' +
    '<div class="r-total">' +
    '<div style="display:flex;justify-content:space-between"><span>' + esc(t('subtotal')) + '</span><span>' + money(sale.subtotal) + '</span></div>' +
    (sale.discount ? '<div style="display:flex;justify-content:space-between"><span>' + esc(t('discount')) + '</span><span>−' + money(sale.discount) + '</span></div>' : '') +
    '<div style="display:flex;justify-content:space-between"><span>' + esc(t('vat')) + ' (' + C.toDigits(sale.vatRate + '%', L) + ')</span><span>' + money(sale.vat) + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-weight:700"><span>' + esc(t('total')) + '</span><span>' + money(sale.total) + '</span></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:.85em"><span>' + esc(t('thPayType')) + '</span><span>' + esc(sale.payType === 'credit' ? t('typeCredit') : t('typeCash')) + '</span></div>' +
    '</div>' +
    '<div class="r-foot">' + esc(t('rThank')) + '</div>';
  $('receiptModal').classList.remove('hidden');
}

/* ============================== khata ============================== */
function customerById(id) {
  for (var i = 0; i < state.customers.length; i++) if (state.customers[i].id === id) return state.customers[i];
  return null;
}

function renderKhata() {
  // due reminders
  var rems = C.dueReminders(state);
  var dl = $('dueList');
  if (!rems.length) { dl.innerHTML = ''; $('noDues').classList.remove('hidden'); }
  else {
    $('noDues').classList.add('hidden');
    dl.innerHTML = rems.map(function (r) {
      return '<li><div><b>' + esc(r.customer.name) + '</b>' +
        (r.customer.phone ? '<br><span class="hint">' + esc(r.customer.phone) + '</span>' : '') + '</div>' +
        '<span class="pill due">' + money(r.balance) + '</span></li>';
    }).join('');
  }
  // customers table
  var tb = $('customerListBody');
  if (!state.customers.length) { tb.innerHTML = ''; $('noCustomers').classList.remove('hidden'); }
  else {
    $('noCustomers').classList.add('hidden');
    tb.innerHTML = state.customers.map(function (c) {
      var bal = C.customerBalance(state, c.id);
      var balHtml = bal > 0 ? '<span class="pill due">' + money(bal) + '</span>' : money(0);
      return '<tr><td><b>' + esc(c.name) + '</b></td><td>' + esc(c.phone || '—') + '</td><td>' + balHtml + '</td>' +
        '<td><button class="btn small" data-ledger="' + c.id + '">' + esc(t('btnLedger')) + '</button></td></tr>';
    }).join('');
  }
  // credit-sale customer select
  var sel = $('customerSelect');
  sel.innerHTML = state.customers.map(function (c) {
    return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
  }).join('');
  if (ledgerCustomerId) renderLedger(ledgerCustomerId);
}

function addCustomer(nameVal, phoneVal, noteVal) {
  var v;
  try {
    v = C.validateCustomer({ name: nameVal, phone: phoneVal, note: noteVal });
  } catch (e) { return { error: e }; }
  var c = { id: C.genId('CU'), name: v.name, phone: v.phone, note: v.note };
  state.customers.push(c);
  save();
  return { customer: c };
}

function renderLedger(id) {
  var c = customerById(id);
  if (!c) { ledgerCustomerId = null; $('ledgerView').classList.add('hidden'); $('khataListView').classList.remove('hidden'); return; }
  ledgerCustomerId = id;
  $('khataListView').classList.add('hidden');
  $('ledgerView').classList.remove('hidden');
  $('ledgerTitle').textContent = (lang() === 'bn' ? 'খতিয়ান — ' : 'Ledger — ') + c.name;
  var entries = [];
  for (var i = 0; i < state.sales.length; i++) {
    var s = state.sales[i];
    if (s.payType === 'credit' && s.customerId === id) {
      var nItems = 0;
      for (var k = 0; k < s.items.length; k++) nItems += s.items[k].qty;
      entries.push({ ts: s.ts, type: t('ledgerDue'), detail: num(nItems) + ' ' + esc(t('thItems').toLowerCase()), amount: s.total, sign: 1 });
    }
  }
  for (var j = 0; j < state.payments.length; j++) {
    var p = state.payments[j];
    if (p.customerId === id) entries.push({ ts: p.ts, type: t('ledgerPay'), detail: esc(p.note || '—'), amount: p.amount, sign: -1 });
  }
  entries.sort(function (a, b) { return a.ts - b.ts; });
  var bal = 0;
  $('ledgerBody').innerHTML = entries.map(function (e) {
    bal += e.sign * e.amount;
    return '<tr><td>' + fmtDate(e.ts) + '<br><span class="hint">' + fmtTime(e.ts) + '</span></td>' +
      '<td>' + esc(e.type) + '</td><td>' + e.detail + '</td>' +
      '<td>' + (e.sign > 0 ? '+' : '−') + money(e.amount) + '<br><span class="hint">' + money(bal) + '</span></td></tr>';
  }).join('') || '<tr><td colspan="4" class="empty">' + esc(t('noDues')) + '</td></tr>';
  $('ledgerBal').textContent = money(C.customerBalance(state, id));
  hideMsg($('khataMsg'));
}

/* ============================== reports ============================== */
function renderReports() {
  var n = reportGran === 'day' ? 14 : 6;
  var buckets = C.aggregate(state.sales, reportGran === 'day' ? 'day' : 'month', n, lang());
  var tot = { revenue: 0, cogs: 0, profit: 0 };
  buckets.forEach(function (b) { tot.revenue += b.revenue; tot.cogs += b.cogs; tot.profit += b.profit; });
  $('cardRevenue').textContent = money(tot.revenue);
  $('cardCogs').textContent = money(tot.cogs);
  $('cardProfit').textContent = money(tot.profit);
  $('cardDues').textContent = money(C.duesOutstanding(state));
  $('granDay').classList.toggle('active', reportGran === 'day');
  $('granMonth').classList.toggle('active', reportGran === 'month');
  $('metricRev').classList.toggle('active', reportMetric === 'revenue');
  $('metricProfit').classList.toggle('active', reportMetric === 'profit');
  drawChart(buckets);
}

function drawChart(buckets) {
  var svg = $('chartSvg');
  var W = 640, H = 240, padL = 8, padB = 34, padT = 14;
  var vals = buckets.map(function (b) { return reportMetric === 'revenue' ? b.revenue : b.profit; });
  var max = Math.max.apply(null, vals.concat([1]));
  var bw = (W - padL * 2) / buckets.length;
  var barW = Math.min(44, bw * 0.62);
  var s = '';
  // gridlines
  for (var g = 0; g <= 2; g++) {
    var yv = (H - padB - padT) * g / 2 + padT;
    var val = Math.round(max * (2 - g) / 2);
    s += '<line x1="' + padL + '" y1="' + yv + '" x2="' + (W - padL) + '" y2="' + yv + '" stroke="#e7e0d2"/>';
    s += '<text x="' + (W - padL) + '" y="' + (yv - 3) + '" font-size="10" text-anchor="end" fill="#6b7280">' +
      esc(shortMoney(val)) + '</text>';
  }
  buckets.forEach(function (b, i) {
    var v = vals[i];
    var h = Math.max(v > 0 ? 3 : 0, (H - padB - padT) * v / max);
    var x = padL + bw * i + (bw - barW) / 2;
    var y = H - padB - h;
    var col = reportMetric === 'revenue' ? '#0f766e' : (v >= 0 ? '#15803d' : '#b91c1c');
    s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) +
      '" rx="4" fill="' + col + '"><title>' + esc(b.label + ': ' + money(v) + ' (' + num(b.count) + ')') + '</title></rect>';
    var lx = padL + bw * i + bw / 2;
    s += '<text x="' + lx.toFixed(1) + '" y="' + (H - padB + 16) + '" font-size="10" text-anchor="middle" fill="#6b7280">' +
      esc(b.label) + '</text>';
  });
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.innerHTML = s;
}

function shortMoney(paisa) {
  var taka = paisa / 100;
  var out;
  if (taka >= 100000) out = (taka / 100000).toFixed(1) + 'L';
  else if (taka >= 1000) out = (taka / 1000).toFixed(1) + 'k';
  else out = String(Math.round(taka));
  return C.toDigits('৳' + out, lang());
}

/* ============================== settings ============================== */
function renderSettings() {
  $('setShopName').value = state.shopName || '';
  $('setVat').value = String(state.vatRate);
  $('langEn').classList.toggle('active', lang() === 'en');
  $('langBn').classList.toggle('active', lang() === 'bn');
}

function saveSettings() {
  var name = $('setShopName').value.trim().slice(0, 80);
  var rate;
  try { rate = C.parseRate($('setVat').value); }
  catch (e) { showErr($('settingsMsg'), e); return; }
  state.shopName = name;
  state.vatRate = rate;
  save();
  applyI18n();
  renderCart();
  showMsg($('settingsMsg'), 'msgSettingsSaved', false);
}

function setLang(l) {
  state.lang = l === 'bn' ? 'bn' : 'en';
  save();
  applyI18n();
  renderAll();
}

function exportJSON() {
  var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  var d = new Date();
  a.href = URL.createObjectURL(blob);
  a.download = 'bd-shop-manager-backup-' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function importJSON(file) {
  hideMsg($('settingsMsg'));
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function () {
    var parsed;
    try { parsed = JSON.parse(reader.result); }
    catch (e) { showMsg($('settingsMsg'), 'errImport'); return; }
    var st;
    try { st = C.validateImport(parsed); }
    catch (e) { showMsg($('settingsMsg'), 'errImport'); return; }
    if (!window.confirm(t('confirmImport'))) return;
    state = st;
    cart = []; editingProductId = null; ledgerCustomerId = null;
    save(); resetProductForm(); applyI18n(); renderAll();
    showMsg($('settingsMsg'), 'msgImported', false);
  };
  reader.readAsText(file);
}

/* ============================== render all / init ============================== */
function renderAll() {
  renderInventory();
  renderSearch(); renderCart(); renderTodaySales();
  ledgerCustomerId = null;
  $('ledgerView').classList.add('hidden');
  $('khataListView').classList.remove('hidden');
  renderKhata();
  renderReports();
  renderSettings();
}

function bindEvents() {
  // tabs
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function () { switchTab(this.getAttribute('data-tab')); });
  }
  // language
  $('langToggle').addEventListener('click', function () { setLang(lang() === 'bn' ? 'en' : 'bn'); });
  $('langEn').addEventListener('click', function () { setLang('en'); });
  $('langBn').addEventListener('click', function () { setLang('bn'); });

  // inventory
  $('addProductBtn').addEventListener('click', saveProduct);
  $('cancelEditBtn').addEventListener('click', resetProductForm);
  $('productTableBody').addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-act]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var act = btn.getAttribute('data-act');
    if (act === 'del') {
      if (!window.confirm(t('confirmDeleteProd'))) return;
      state.products = state.products.filter(function (p) { return p.id !== id; });
      if (editingProductId === id) resetProductForm();
      save(); renderInventory(); toast('msgProdDeleted');
    } else if (act === 'edit') {
      var p = productById(id);
      if (!p) return;
      editingProductId = id;
      $('prodName').value = p.name; $('prodSku').value = p.sku || '';
      $('prodBuy').value = C.fmtTakaInput(p.buy); $('prodSell').value = C.fmtTakaInput(p.sell);
      $('prodStock').value = String(p.stock); $('prodLow').value = String(p.low);
      $('productFormTitle').textContent = t('editProduct');
      $('addProductBtn').textContent = t('btnUpdate');
      $('cancelEditBtn').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (act === 'stock') {
      openStockModal(id);
    }
  });
  $('stockSaveBtn').addEventListener('click', saveStock);
  $('stockCancelBtn').addEventListener('click', function () { $('stockModal').classList.add('hidden'); });

  // sales
  $('saleSearch').addEventListener('input', renderSearch);
  $('searchResults').addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-add]');
    if (btn && !btn.disabled) addToCart(btn.getAttribute('data-add'));
  });
  $('cartBody').addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-cact]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var act = btn.getAttribute('data-cact');
    for (var i = 0; i < cart.length; i++) {
      if (cart[i].pid !== id) continue;
      if (act === 'rm') cart.splice(i, 1);
      else if (act === 'dec') { cart[i].qty -= 1; if (cart[i].qty <= 0) cart.splice(i, 1); }
      else if (act === 'inc') {
        var p = productById(id);
        if (p && cart[i].qty + 1 > p.stock) {
          toastText(lang() === 'bn' ? '“' + p.name + '”-এর পর্যাপ্ত স্টক নেই।' : 'Not enough stock for "' + p.name + '".');
        } else cart[i].qty += 1;
      }
      break;
    }
    renderCart();
  });
  $('discInput').addEventListener('input', renderCart);
  $('payCash').addEventListener('change', function () { $('creditCustWrap').classList.add('hidden'); });
  $('payCredit').addEventListener('change', function () {
    $('creditCustWrap').classList.remove('hidden');
    renderKhata(); // refresh customer select
  });
  $('quickAddCustBtn').addEventListener('click', function () {
    var r = addCustomer($('quickCustName').value, $('quickCustPhone').value, '');
    if (r.error) { toastText(errText(r.error)); return; }
    $('quickCustName').value = ''; $('quickCustPhone').value = '';
    renderKhata();
    $('customerSelect').value = r.customer.id;
    toast('msgCustAdded');
  });
  $('checkoutBtn').addEventListener('click', checkout);
  $('clearCartBtn').addEventListener('click', function () { cart = []; $('discInput').value = '0'; renderCart(); });

  // khata
  $('addCustBtn').addEventListener('click', function () {
    var r = addCustomer($('custName').value, $('custPhone').value, $('custNote').value);
    if (r.error) { toastText(errText(r.error)); return; }
    $('custName').value = ''; $('custPhone').value = ''; $('custNote').value = '';
    renderKhata(); toast('msgCustAdded');
  });
  $('customerListBody').addEventListener('click', function (ev) {
    var btn = ev.target.closest('button[data-ledger]');
    if (btn) renderLedger(btn.getAttribute('data-ledger'));
  });
  $('backToCustBtn').addEventListener('click', function () {
    ledgerCustomerId = null;
    $('ledgerView').classList.add('hidden');
    $('khataListView').classList.remove('hidden');
  });
  $('recordPayBtn').addEventListener('click', function () {
    hideMsg($('khataMsg'));
    if (!ledgerCustomerId) return;
    var amt;
    try { amt = C.parseMoney($('payAmount').value); }
    catch (e) { showErr($('khataMsg'), e); return; }
    try { C.recordPayment(state, ledgerCustomerId, amt, $('payNote').value); }
    catch (e) { showErr($('khataMsg'), e); return; }
    save();
    $('payAmount').value = ''; $('payNote').value = '';
    renderKhata();
    showMsg($('khataMsg'), 'msgPayRecorded', false);
  });

  // reports
  $('granDay').addEventListener('click', function () { reportGran = 'day'; renderReports(); });
  $('granMonth').addEventListener('click', function () { reportGran = 'month'; renderReports(); });
  $('metricRev').addEventListener('click', function () { reportMetric = 'revenue'; renderReports(); });
  $('metricProfit').addEventListener('click', function () { reportMetric = 'profit'; renderReports(); });

  // settings
  $('saveSettingsBtn').addEventListener('click', saveSettings);
  $('exportBtn').addEventListener('click', exportJSON);
  $('importFile').addEventListener('change', function () {
    importJSON(this.files && this.files[0]);
    this.value = '';
  });
  $('clearBtn').addEventListener('click', function () {
    if (!window.confirm(t('confirmClear'))) return;
    if (!window.confirm(t('confirmClear2'))) return;
    state = C.blankState();
    cart = []; editingProductId = null; ledgerCustomerId = null;
    save(); resetProductForm(); applyI18n(); renderAll();
    showMsg($('settingsMsg'), 'msgCleared', false);
  });

  // receipt
  $('printBtn').addEventListener('click', function () { window.print(); });
  $('closeReceiptBtn').addEventListener('click', function () { $('receiptModal').classList.add('hidden'); });

  // esc closes modals
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') {
      $('receiptModal').classList.add('hidden');
      $('stockModal').classList.add('hidden');
    }
  });
}

applyI18n();
bindEvents();
renderAll();
window.ShopApp = { get state() { return state; }, t: t, renderAll: renderAll };
})();
