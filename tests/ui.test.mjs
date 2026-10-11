import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Window } from 'happy-dom';

// DOM integration, not a Chrome or visual-layout test: this executes the actual
// app.js event handlers and background.js service through initializePreview's
// localStorage shim. The independent real-Chrome report remains browser-results.json.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const extension = resolve(root, 'extension');
const artifactDir = resolve(root, 'artifacts');
const htmlDir = resolve(artifactDir, 'ui-html');
const report = { generatedAt: new Date().toISOString(), method: 'Happy DOM simulation executing actual app.js, preview.js, and background.js',
  status: 'running', checks: [], html: [], limitations: ['No Chrome installation, activeTab permission, side-panel lifecycle, desktop notification delivery, CSS layout, or browser download behavior is verified by this suite.'] };
const tick = () => new Promise(resolve => setImmediate(resolve));

test('Actual application flows in DOM simulation (real Chrome coverage remains separate)', async t => {
  await mkdir(htmlDir, { recursive: true });
  const window = new Window({ url: 'http://127.0.0.1:4173/sidepanel.html', width: 380, height: 900,
    settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true, disableJavaScriptEvaluation: true,
      disableIframePageLoading: true, navigation: { disableMainFrameNavigation: true, disableChildPageNavigation: true } } });
  const names = ['window', 'document', 'location', 'localStorage', 'confirm', 'FormData', 'Event', 'MouseEvent', 'File', 'chrome', 'setTimeout', 'clearTimeout'];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  let confirmations = 0;
  Object.assign(globalThis, { window, document: window.document, location: window.location, localStorage: window.localStorage,
    confirm: () => { confirmations++; return true; }, FormData: window.FormData, Event: window.Event,
    MouseEvent: window.MouseEvent, File: window.File,
    setTimeout: window.setTimeout.bind(window), clearTimeout: window.clearTimeout.bind(window) });
  delete globalThis.chrome;
  const $ = selector => { const element = document.querySelector(selector); assert.ok(element, `Missing element: ${selector}`); return element; };
  const all = selector => [...document.querySelectorAll(selector)];
  const until = async (predicate, message) => {
    for (let turn = 0; turn < 100; turn++) { await tick(); if (await predicate()) return; }
    assert.fail(message || 'The application did not reach the expected state.');
  };
  const h1 = () => document.querySelector('#app h1')?.textContent;
  const click = async selector => { $(selector).click(); await tick(); };
  const action = async (name, id) => click(`[data-action="${name}"]${id ? `[data-id="${id}"]` : ''}`);
  const nav = async name => click(`[data-view="${name}"]`);
  const heading = async text => until(() => h1() === text, `Expected heading ${text}; got ${h1()}`);
  const state = async (demo = false) => {
    const response = await chrome.runtime.sendMessage({ type: 'getState', demo });
    assert.equal(response.ok, true, response.error); return response.state;
  };
  const form = (id, values) => {
    for (const [name, value] of Object.entries(values)) {
      const element = $(`#${id} [name="${name}"]`);
      if (typeof value === 'boolean') element.checked = value;
      else element.value = String(value);
    }
  };
  const submit = async id => { $(`#${id}`).dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); await tick(); };
  const change = async (selector, value) => { $(selector).value = String(value); $(selector).dispatchEvent(new window.Event('change', { bubbles: true })); await tick(); };
  const snapshot = async name => {
    const copy = document.cloneNode(true);
    copy.querySelectorAll('script').forEach(script => script.remove());
    copy.querySelectorAll('link[rel="stylesheet"]').forEach(link => link.setAttribute('href', pathToFileURL(resolve(extension, link.getAttribute('href'))).href));
    copy.querySelectorAll('img').forEach(img => {
      const source = img.getAttribute('src');
      if (source?.startsWith('assets/')) img.setAttribute('src', pathToFileURL(resolve(extension, source)).href);
    });
    const provenance = copy.createElement('meta');
    provenance.setAttribute('name', 'cartscope-qa-source');
    provenance.setAttribute('content', 'Actual application DOM serialized in Happy DOM; no browser or CSS-layout verification.');
    copy.head.append(provenance);
    const toast = copy.querySelector('#toast'); if (toast) toast.hidden = true;
    await writeFile(resolve(htmlDir, `${name}.html`), '<!doctype html>\n' + copy.documentElement.outerHTML + '\n');
    report.html.push(`artifacts/ui-html/${name}.html`);
  };
  const run = async (name, fn) => t.test(name, async () => {
    try { await fn(); report.checks.push({ name, status: 'passed' }); }
    catch (error) { report.checks.push({ name, status: 'failed', error: error.message }); throw error; }
  });
  let manualId, checkedOfferId, exported;
  const createObjectURL = URL.createObjectURL;
  const anchorClick = window.HTMLAnchorElement.prototype.click;
  URL.createObjectURL = blob => { exported = { blob }; return createObjectURL.call(URL, blob); };
  window.HTMLAnchorElement.prototype.click = function () {
    if (this.download) { exported = { ...exported, filename: this.download, url: this.href }; return; }
    return anchorClick.call(this);
  };
  try {
    const source = await readFile(resolve(extension, 'sidepanel.html'), 'utf8');
    document.write(source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''));
    await import(pathToFileURL(resolve(extension, 'app.js')).href + '?dom-integration');
    await heading('Your cart');

    await run('Sample cart and every principal view render through actual app event handlers', async () => {
      assert.equal(all('.product-card').length, 4);
      assert.match(document.querySelector('#app').textContent, /239\.89/);
      assert.equal((await state(false)).products.length, 0);
      await snapshot('cart');
      await action('edit-product', 'sample-sony'); await heading('Edit item');
      assert.equal($('#product-form [name="name"]').value, 'Sony WH-1000XM5 Headphones');
      await snapshot('review'); await action('cancel'); await heading('Your cart');
      await action('compare-product', 'sample-sony'); await heading('Compare prices');
      assert.match($('.best-offer').textContent, /Best Buy/);
      assert.equal($('.best-offer .offer-total').textContent, '$302.39');
      await snapshot('compare');
      await nav('alerts'); await heading('Notifications'); assert.equal(all('.alert-card').length, 1); await snapshot('notifications');
      await nav('orders'); await heading('Your orders'); assert.equal(all('.order-card').length, 3); await snapshot('orders');
      await nav('compare'); await action('finance'); await heading('Payment planner');
      await submit('finance-form'); assert.equal(all('#finance-result tbody tr').length, 4); await snapshot('finance');
      await click('#settings-shortcut'); await heading('Settings');
      assert.equal($('#desktop-notifications').disabled, true); await snapshot('settings');
    });

    await run('Sample mutations persist locally and do not leak into the empty workspace', async () => {
      await nav('cart'); await change('[data-quantity="sample-jbl"]', 3);
      await until(async () => (await state(true)).products.find(p => p.id === 'sample-jbl').quantity === 3);
      assert.equal(JSON.parse(localStorage.getItem('cartscope:sampleWorkspace')).products.find(p => p.id === 'sample-jbl').quantity, 3);
      assert.equal((await state(false)).products.length, 0);
      await click('#exit-demo'); await heading('Your cart');
      assert.equal(all('.product-card').length, 0);
      await action('demo'); await heading('Your cart');
      assert.equal($('[data-quantity="sample-jbl"]').value, '3');
      await click('#exit-demo'); await heading('Your cart');
    });

    await run('Manual add, item quantity, editing, and saved-for-later use the same background service', async () => {
      await action('add-product'); await heading('Review item');
      form('product-form', { name: 'QA Headphones', price: '100.01', retailer: 'QA Store', url: 'https://example.com/headphones', brand: 'Fixture', model: 'QA-100', color: 'Black', variant: 'Black', condition: 'new', quantity: '1', shipping: '0', availability: 'in_stock', notes: 'Testing real app events' });
      await submit('product-form'); await heading('Your cart');
      const saved = (await state()).products[0]; manualId = saved.id;
      assert.equal(saved.name, 'QA Headphones'); assert.equal(saved.condition, 'new');
      await change(`[data-quantity="${manualId}"]`, 2);
      assert.equal((await state()).products[0].quantity, 2);
      assert.match($('.checkout-card').textContent, /200\.02/);
      await action('edit-product', manualId); await heading('Edit item');
      form('product-form', { notes: 'Edited note', savedOnly: true }); await submit('product-form'); await heading('Your cart');
      assert.equal((await state()).products[0].savedOnly, true);
      assert.match($('#app').textContent, /Saved for later/);
      assert.equal(document.querySelector('.checkout-card'), null);
      await action('edit-product', manualId); form('product-form', { savedOnly: false }); await submit('product-form'); await heading('Your cart');
      assert.equal((await state()).products[0].notes, 'Edited note');
    });

    await run('Fractional quantities are rejected and rendered values recover after the failed change', async () => {
      await change(`[data-quantity="${manualId}"]`, '1.5');
      assert.equal((await state()).products[0].quantity, 2);
      assert.equal($(`[data-quantity="${manualId}"]`).value, '2');
      assert.match($('#toast').textContent, /whole number/);
    });

    await run('Checked offers rank exact variants while missing costs and conflicts remain visible', async () => {
      await action('compare-product', manualId); await heading('Compare prices');
      await action('add-offer'); await heading('Add a checked offer');
      form('offer-form', { retailer: 'Unknown Shipping', url: 'https://example.com/unknown', price: '20', shipping: '', availability: 'in_stock', confirmed: true });
      await submit('offer-form'); await heading('Compare prices');
      const unknown = all('.offer-card').find(card => card.textContent.includes('Unknown Shipping'));
      assert.match(unknown.textContent, /Total incomplete: shipping/);
      assert.equal(unknown.classList.contains('best-offer'), false);
      await action('add-offer');
      form('offer-form', { retailer: 'Checked Store', url: 'https://example.com/checked', price: '40', shipping: '0', tax: '0', membership: '0', discount: '0', cashback: '0', availability: 'in_stock', deliveryDays: '1', returnDays: '30', pickup: true, location: 'A checked local store', confirmed: true });
      await submit('offer-form'); await heading('Compare prices');
      checkedOfferId = (await state()).offers.find(o => o.retailer === 'Checked Store').id;
      assert.match($('.best-offer').textContent, /Checked Store/);
      assert.equal($('.best-offer .offer-total').textContent, '$80.00');
      await action('add-offer');
      form('offer-form', { retailer: 'Wrong Variant', url: 'https://example.com/wrong', price: '1', shipping: '0', tax: '0', color: 'White', availability: 'in_stock', confirmed: true });
      await submit('offer-form'); await heading('Compare prices');
      assert.match($('.best-offer').textContent, /Checked Store/);
      assert.match(all('.offer-card').find(card => card.textContent.includes('Wrong Variant')).textContent, /Check variant/);
      await change('[name="priority"]', 'pickup');
      assert.equal((await state()).settings.priority, 'pickup');
      assert.match($('.best-offer').textContent, /Checked Store/);
    });

    await run('Watch settings produce price-drop and restock transitions and avoid duplicate alerts', async () => {
      await action('watch-product', manualId); await heading('Watch item');
      form('watch-form', { priceDrop: true, restock: true, targetPrice: '35' }); await submit('watch-form'); await heading('Compare prices');
      await action('edit-offer', checkedOfferId); form('offer-form', { price: '30', availability: 'out_of_stock', confirmed: true }); await submit('offer-form'); await heading('Compare prices');
      assert.ok((await state()).alerts.some(alert => alert.type === 'price_drop'));
      await action('edit-offer', checkedOfferId); form('offer-form', { availability: 'in_stock', confirmed: true }); await submit('offer-form'); await heading('Compare prices');
      assert.ok((await state()).alerts.some(alert => alert.type === 'restock'));
      const count = (await state()).alerts.length;
      await action('edit-offer', checkedOfferId); form('offer-form', { confirmed: true }); await submit('offer-form'); await heading('Compare prices');
      assert.equal((await state()).alerts.length, count);
      await nav('alerts'); await action('read-alerts'); assert.ok((await state()).alerts.every(alert => alert.read));
      const dismiss = (await state()).alerts[0].id; await action('dismiss-alert', dismiss); assert.equal((await state()).alerts.length, count - 1);
    });

    await run('Manual order creation and delivery status edits persist safe tracking details', async () => {
      await nav('orders'); await action('add-order'); await heading('Add an order');
      form('order-form', { productId: manualId, retailer: 'Checked Store', status: 'preparing', quantity: '2', orderedAt: '2026-10-11', expectedAt: '2026-10-15', trackingNumber: 'QA-123456', trackingUrl: 'https://example.com/tracking', notes: 'Entered by the shopper' });
      await submit('order-form'); await heading('Your orders');
      const order = (await state()).orders[0]; assert.equal(order.trackingNumber, 'QA-123456');
      await action('edit-order', order.id); form('order-form', { status: 'delivered' }); await submit('order-form'); await heading('Your orders');
      assert.equal((await state()).orders[0].status, 'delivered'); assert.match($('.order-card').textContent, /Delivered/);
      assert.equal($('.tracking a').getAttribute('href'), 'https://example.com/tracking');
    });

    await run('Payment planner renders full obligation, calendar dates, and exact remainder cents', async () => {
      await nav('compare'); await action('finance'); await heading('Payment planner');
      form('finance-form', { principal: '100', interest: '2.02', fees: '1', payments: '4', intervalDays: '14', startDate: '2026-10-11', lateFee: '8' });
      await submit('finance-form');
      assert.equal($('.finance-total').textContent, '$103.02');
      assert.deepEqual(all('#finance-result tbody td:last-child').map(cell => cell.textContent), ['$25.76', '$25.76', '$25.75', '$25.75']);
      assert.match($('#finance-result').textContent, /2026-11-22/);
      assert.match($('#finance-result').textContent, /Late fees are not included/);
    });

    await run('Preferences save and backup export serializes the real workspace', async () => {
      await click('#settings-shortcut'); await heading('Settings');
      form('settings-form', { taxRate: '7.5', budget: '500', priority: 'returns' }); await submit('settings-form');
      assert.equal((await state()).settings.taxRate, 7.5); assert.equal((await state()).settings.budget, 500); assert.equal((await state()).settings.priority, 'returns');
      await action('export'); assert.equal(exported.filename, 'cartscope-backup.json');
      const backup = JSON.parse(await exported.blob.text());
      assert.equal(backup.schema, 1); assert.equal(backup.products[0].id, manualId); assert.equal(backup.orders.length, 1);
      const confirmationsBefore = confirmations;
      await action('reset'); assert.equal(confirmations, confirmationsBefore + 1); assert.equal((await state()).products.length, 0);
      const input = $('#import-file');
      const file = new window.File([JSON.stringify(backup)], 'cartscope-backup.json', { type: 'application/json' });
      Object.defineProperty(input, 'files', { configurable: true, value: [file] });
      input.dispatchEvent(new window.Event('change', { bubbles: true }));
      await until(async () => (await state()).products.length === backup.products.length);
      assert.equal((await state()).offers.length, backup.offers.length); assert.equal((await state()).orders.length, 1);
      assert.equal((await state()).alerts.length, 0); assert.equal((await state()).settings.notificationsEnabled, false);
    });

    await run('Hostile user text and active URLs cannot become injected product UI', async () => {
      await nav('cart'); await action('add-product'); await heading('Review item');
      form('product-form', { name: '<img src=x onerror="globalThis.cartscopeInjected=true">', price: '1', retailer: '<script>alert(1)</script>', url: 'javascript:alert(1)', quantity: '1', notes: '<svg onload=alert(1)>' });
      await submit('product-form'); await heading('Your cart');
      const saved = (await state()).products.at(-1); assert.equal(saved.url, '');
      assert.equal(all('#app img[onerror], #app svg[onload], #app script').length, 0);
      assert.equal(all('#app a[href^="javascript:"]').length, 0);
      assert.equal(globalThis.cartscopeInjected, undefined);
      assert.match($('#app').textContent, /<img src=x onerror=/);
    });

    await run('Malformed imports leave current data intact and sample backups remain isolated', async () => {
      const before = await state();
      const malformed = { ...before, products: [...before.products, { ...before.products[0] }] };
      let response = await chrome.runtime.sendMessage({ type: 'import', state: malformed });
      assert.equal(response.ok, false); assert.match(response.error, /duplicate/); assert.deepEqual(await state(), before);
      response = await chrome.runtime.sendMessage({ type: 'import', state: await state(true) });
      assert.equal(response.ok, false); assert.match(response.error, /sample workspace/); assert.deepEqual(await state(), before);
    });

    await run('Removing a product deletes its related offers, history, alerts, and orders', async () => {
      await nav('cart'); await action('remove-product', manualId); await heading('Your cart');
      const remaining = await state();
      for (const field of ['products', 'offers', 'history', 'alerts', 'orders']) assert.equal(remaining[field].some(entry => (field === 'products' ? entry.id : entry.productId) === manualId), false, field);
      assert.equal((await state(true)).products.length, 4);
    });
  } catch (error) {
    report.error = error.message;
    throw error;
  } finally {
    report.status = report.error || report.checks.some(check => check.status === 'failed') ? 'failed' : 'passed';
    report.finishedAt = new Date().toISOString();
    report.passed = report.checks.filter(check => check.status === 'passed').length;
    report.failed = report.checks.filter(check => check.status === 'failed').length;
    await writeFile(resolve(artifactDir, 'ui-results.json'), JSON.stringify(report, null, 2) + '\n');
    URL.createObjectURL = createObjectURL;
    window.HTMLAnchorElement.prototype.click = anchorClick;
    await window.happyDOM.close();
    for (const name of names) { const descriptor = previous.get(name); if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
  }
});
