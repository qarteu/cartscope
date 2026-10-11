import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, dirname, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir, homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

// Uses its own Chrome for Testing process and disposable profiles. It never
// connects to the user's Chrome, reads their profile, or visits retailer sites.
// Install dev dependencies with npm install before running on another machine.
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch {
  playwright = require(resolve(homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let extension;
const artifactDir = resolve(root, 'artifacts');
const screenshots = resolve(artifactDir, 'screenshots');
const fixtureDir = resolve(root, 'tests/fixtures');
await mkdir(screenshots, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(), status: 'running', browser: null,
  method: 'Playwright; actual Alpha release ZIP unpacked and loaded in disposable Chrome for Testing profile; localhost fixtures only',
  planned: ['extension service worker and local storage', 'sample/real workspace isolation', 'cart add/edit/quantity/save-for-later',
    'exact/possible/mismatch/unknown-cost comparison', 'price-drop/restock observations', 'orders and tracking',
    'financing total and rounding', 'preferences and backup round trip', 'hostile input escaping',
    'actual activeTab toolbar grant and scripting capture', 'category capture rejection',
    '320/380/480-pixel layouts', 'preview state persistence'],
  checks: [], limitations: ['Deterministic retailer-shaped fixtures do not verify changing live retailer markup or live offer feeds.'], screenshots: [], errors: []
};
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const fromFixtures = path.startsWith('/fixtures/');
    const base = fromFixtures ? fixtureDir : extension;
    const relative = fromFixtures ? path.slice('/fixtures'.length) : path === '/' ? '/sidepanel.html' : path;
    const file = resolve(base, `.${relative}`);
    if (!file.startsWith(base + sep)) { response.writeHead(403); response.end(); return; }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(content);
  } catch { response.writeHead(404); response.end('Not found'); }
});
let context, previewContext, page, productPage;
const profiles = [];
const pageErrors = [];
const check = async (name, action) => {
  const start = Date.now();
  try { await action(); report.checks.push({ name, status: 'passed', durationMs: Date.now() - start }); console.log(`PASS ${name}`); }
  catch (error) { report.checks.push({ name, status: 'failed', durationMs: Date.now() - start, error: error.message }); throw error; }
};
const screenshot = async name => {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(screenshots, `${name}.png`), fullPage: true, animations: 'disabled' });
  report.screenshots.push(`artifacts/screenshots/${name}.png`);
};
const action = async (name, id) => {
  const selector = `[data-action="${name}"]${id ? `[data-id="${id}"]` : ''}`;
  await page.locator(selector).first().click();
  // Several actions return to the same heading. Wait for the asynchronous
  // handler itself to finish instead of treating an existing heading as proof.
  await page.waitForFunction(selector => {
    const element = document.querySelector(selector);
    return !element || !element.disabled;
  }, selector);
};
const nav = async name => { await page.locator(`[data-view="${name}"]`).click(); };
const heading = text => page.locator('#app h1').filter({ hasText: text }).waitFor({ timeout: 8000 });
const state = async (demo = false) => page.evaluate(async demo => {
  const result = await chrome.runtime.sendMessage({ type: 'getState', demo });
  if (!result.ok) throw new Error(result.error);
  return result.state;
}, demo);
const message = async payload => page.evaluate(async payload => chrome.runtime.sendMessage(payload), payload);
const fill = async (formId, values) => {
  const form = page.locator(`#${formId}`);
  for (const [name, value] of Object.entries(values)) {
    const control = form.locator(`[name="${name}"]`);
    await control.evaluate(element => {
      for (let parent = element.parentElement; parent; parent = parent.parentElement) {
        if (parent.tagName === 'DETAILS') parent.open = true;
      }
    });
    const tag = await control.evaluate(element => element.tagName);
    if (tag === 'SELECT') await control.selectOption(String(value));
    else if (typeof value === 'boolean') await control.setChecked(value);
    else await control.fill(String(value));
  }
};
const submit = async form => {
  await page.locator(`#${form} [type="submit"]`).click();
  await page.waitForFunction(id => {
    const form = document.getElementById(id);
    return !form || !form.querySelector('[type="submit"]').disabled;
  }, form);
  const error = page.locator(`#${form} #form-error`);
  if (await error.count()) assert.equal((await error.innerText()).trim(), '', `Submission of ${form} failed`);
};
const launch = async profile => playwright.chromium.launchPersistentContext(profile, {
  channel: 'chromium', headless: true, viewport: { width: 380, height: 900 }, acceptDownloads: true,
  ignoreDefaultArgs: ['--disable-extensions'],
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--enable-unsafe-extension-debugging']
});

try {
  await check('The actual Alpha release ZIP unpacks into the Chrome installation root', async () => {
    const releaseZip = resolve(artifactDir, 'cartscope-alpha-0.1.0.zip');
    extension = await mkdtemp(resolve(tmpdir(), 'cartscope-release-under-test-'));
    profiles.push(extension);
    execFileSync('unzip', ['-q', releaseZip, '-d', extension]);
    const manifest = JSON.parse(await readFile(resolve(extension, 'manifest.json'), 'utf8'));
    assert.equal(manifest.manifest_version, 3);
    assert.equal(manifest.version, '0.1.0');
    report.release = { path: 'artifacts/cartscope-alpha-0.1.0.zip', version: manifest.version,
      sha256: createHash('sha256').update(await readFile(releaseZip)).digest('hex') };
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const profile = await mkdtemp(resolve(tmpdir(), 'cartscope-browser-'));
  profiles.push(profile);
  try { context = await launch(profile); }
  catch (error) { report.status = 'blocked'; report.errors.push({ stage: 'browser_launch', message: error.message }); throw error; }
  report.browser = context.browser()?.version() || 'Chrome for Testing';
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker', { timeout: 10000 });
  const extensionId = new URL(worker.url()).hostname;
  page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await heading('Your cart');

  await check('Real extension service worker opens an empty local workspace', async () => {
    assert.equal(await page.evaluate(() => chrome.runtime.id), extensionId);
    assert.equal((await state()).products.length, 0);
    assert.equal(await page.locator('#demo-bar').isVisible(), false);
  });

  await check('Sample workspace renders every principal screen and remains separate', async () => {
    await action('demo'); await heading('Your cart');
    assert.equal((await state(true)).products.length, 4);
    assert.equal((await state(false)).products.length, 0);
    await screenshot('cart');
    await action('edit-product', 'sample-sony'); await heading('Edit your find'); await screenshot('review');
    await action('cancel'); await action('compare-product', 'sample-sony'); await heading('Compare prices'); await screenshot('compare');
    assert.match(await page.locator('.best-offer').innerText(), /Best Buy/);
    assert.match(await page.locator('.best-offer .offer-total').innerText(), /302\.39/);
    await nav('alerts'); await heading('Notifications'); await screenshot('notifications');
    await nav('orders'); await heading('Your orders'); await screenshot('orders');
    await nav('compare'); await action('finance'); await heading('Payment planner');
    await submit('finance-form'); await page.locator('#finance-result table').waitFor(); await screenshot('finance');
    await page.locator('#settings-shortcut').click(); await heading('Make it yours'); await screenshot('settings');
    await action('exit-demo'); await heading('Your cart');
    assert.equal((await state()).products.length, 0);
  });

  await check('Cart add, edit, quantity, and save-for-later persist through Chrome storage', async () => {
    await action('add-product'); await heading('Review item');
    await fill('product-form', { name: 'Manual QA Headphones', price: '100.01', retailer: 'QA Store', url: `${base}/fixtures/product.html`, brand: 'Fixture', model: 'QA-100', color: 'Black', variant: 'Black', quantity: '1', shipping: '0', availability: 'in_stock', notes: 'A real test record' });
    const condition = page.locator('#product-form [name="condition"]');
    if (await condition.count()) await condition.selectOption('new');
    await submit('product-form'); await heading('Your cart');
    const saved = (await state()).products[0];
    assert.equal(saved.name, 'Manual QA Headphones');
    const quantityInput = page.locator(`[data-quantity="${saved.id}"]`);
    await quantityInput.fill('2'); await quantityInput.dispatchEvent('change');
    await page.waitForFunction(async id => { const response = await chrome.runtime.sendMessage({ type: 'getState' }); return response.state.products.find(p => p.id === id)?.quantity === 2; }, saved.id);
    assert.match(await page.locator('.checkout-card').innerText(), /200\.02/);
    await action('edit-product', saved.id); await heading('Edit your find');
    await fill('product-form', { notes: 'Changed during the browser test', savedOnly: true });
    await submit('product-form'); await heading('Your cart');
    assert.equal((await state()).products[0].savedOnly, true);
    assert.match(await page.locator('#app').innerText(), /Saved for later/);
    await page.reload(); await heading('Your cart');
    assert.equal((await state()).products[0].notes, 'Changed during the browser test');
    await action('edit-product', saved.id); await fill('product-form', { savedOnly: false }); await submit('product-form'); await heading('Your cart');
  });

  await check('Comparison never promotes an unknown shipping amount or conflicting variant', async () => {
    const saved = (await state()).products[0];
    await action('compare-product', saved.id); await heading('Compare prices');
    await action('add-offer'); await heading('Add a checked offer');
    await fill('offer-form', { retailer: 'Unknown Shipping Store', url: `${base}/fixtures/product.html?store=unknown`, price: '20', shipping: '', availability: 'in_stock', confirmed: true });
    await submit('offer-form'); await heading('Compare prices');
    const unknown = page.locator('.offer-card').filter({ hasText: 'Unknown Shipping Store' });
    assert.match(await unknown.innerText(), /Total incomplete: shipping/);
    assert.equal(await unknown.evaluate(element => element.classList.contains('best-offer')), false);
    await action('add-offer'); await fill('offer-form', { retailer: 'Cheapest Exact Store', url: `${base}/fixtures/product.html?store=exact`, price: '40', shipping: '0', tax: '0', availability: 'in_stock', deliveryDays: '1', returnDays: '30', pickup: true, location: 'QA local store', confirmed: true });
    await submit('offer-form'); await heading('Compare prices');
    assert.match(await page.locator('.best-offer').innerText(), /Cheapest Exact Store/);
    assert.match(await page.locator('.best-offer .offer-total').innerText(), /80\.00/);
    await action('add-offer');
    await page.locator('#offer-form details summary').click();
    await fill('offer-form', { retailer: 'Wrong Variant Store', url: `${base}/fixtures/product.html?store=wrong`, price: '1', shipping: '0', tax: '0', color: 'White', availability: 'in_stock', confirmed: true });
    await submit('offer-form'); await heading('Compare prices');
    assert.match(await page.locator('.best-offer').innerText(), /Cheapest Exact Store/);
    assert.match(await page.locator('.offer-card').filter({ hasText: 'Wrong Variant Store' }).innerText(), /Check variant/);
  });

  await check('Opt-in watches create price-drop and restock alerts from updated observations', async () => {
    const saved = (await state()).products[0];
    await action('watch-product', saved.id); await heading('Watch this find');
    await fill('watch-form', { priceDrop: true, restock: true, targetPrice: '35' });
    await submit('watch-form'); await heading('Compare prices');
    const target = (await state()).offers.find(o => o.retailer === 'Cheapest Exact Store');
    await action('edit-offer', target.id); await fill('offer-form', { price: '30', availability: 'out_of_stock', confirmed: true });
    await submit('offer-form'); await heading('Compare prices');
    assert.ok((await state()).alerts.some(alert => alert.type === 'price_drop'));
    await action('edit-offer', target.id); await fill('offer-form', { availability: 'in_stock', confirmed: true });
    await submit('offer-form'); await heading('Compare prices');
    assert.ok((await state()).alerts.some(alert => alert.type === 'restock'));
    const count = (await state()).alerts.length;
    await action('edit-offer', target.id); await fill('offer-form', { confirmed: true }); await submit('offer-form'); await heading('Compare prices');
    assert.equal((await state()).alerts.length, count);
    await nav('alerts'); await action('read-alerts');
    assert.ok((await state()).alerts.every(alert => alert.read));
  });

  await check('Orders save and update manual status and safe carrier tracking', async () => {
    await nav('orders'); await action('add-order'); await heading('Add an order');
    await fill('order-form', { retailer: 'QA Store', status: 'preparing', quantity: '2', orderedAt: '2026-10-11', expectedAt: '2026-10-15', trackingNumber: 'QA-123456', trackingUrl: `${base}/tracking`, notes: 'Manual QA order' });
    await submit('order-form'); await heading('Your orders');
    const savedOrder = (await state()).orders[0];
    assert.equal(savedOrder.trackingNumber, 'QA-123456');
    await action('edit-order', savedOrder.id); await fill('order-form', { status: 'delivered' }); await submit('order-form'); await heading('Your orders');
    assert.equal((await state()).orders[0].status, 'delivered');
    assert.match(await page.locator('.order-card').first().innerText(), /Delivered/);
  });

  await check('Financing shows the full obligation and distributes remainder cents exactly', async () => {
    await nav('compare'); await action('finance'); await heading('Payment planner');
    await fill('finance-form', { principal: '100', interest: '2.02', fees: '1', payments: '4', intervalDays: '14', startDate: '2026-10-11', lateFee: '8' });
    await submit('finance-form'); await page.locator('#finance-result table').waitFor();
    assert.equal(await page.locator('.finance-total').innerText(), '$103.02');
    const amounts = await page.locator('#finance-result tbody td:last-child').allTextContents();
    assert.deepEqual(amounts, ['$25.76', '$25.76', '$25.75', '$25.75']);
    assert.match(await page.locator('#finance-result').innerText(), /2026-11-22/);
    assert.match(await page.locator('#finance-result').innerText(), /Late fees are not included/);
  });

  await check('Preferences, export, delete, and validated import complete a backup round trip', async () => {
    await page.locator('#settings-shortcut').click(); await heading('Make it yours');
    await fill('settings-form', { taxRate: '7.5', budget: '500', priority: 'pickup' });
    await submit('settings-form');
    assert.equal((await state()).settings.taxRate, 7.5);
    assert.equal((await state()).settings.priority, 'pickup');
    const downloadPromise = page.waitForEvent('download'); await action('export');
    const download = await downloadPromise;
    const backup = resolve(artifactDir, 'browser-test-backup.json');
    await download.saveAs(backup);
    const data = JSON.parse(await readFile(backup, 'utf8'));
    assert.equal(data.schema, 1); assert.ok(data.products.length > 0);
    await action('reset');
    assert.equal((await state()).products.length, 0);
    await page.locator('#import-file').setInputFiles(backup);
    await page.waitForFunction(async count => (await chrome.runtime.sendMessage({ type: 'getState' })).state.products.length === count, data.products.length);
    const restored = await state();
    assert.equal(restored.offers.length, data.offers.length);
    assert.equal(restored.orders.length, data.orders.length);
    assert.equal(restored.alerts.length, 0);
    assert.equal(restored.settings.notificationsEnabled, false);
    await rm(backup, { force: true });
  });

  await check('Hostile text remains text and scripting URL payloads are discarded', async () => {
    const before = (await state()).products.length;
    const response = await message({ type: 'saveProduct', product: { name: '<img src=x onerror="globalThis.cartscopeInjected=true">', price: 1, currency: 'USD', retailer: '<script>bad()</script>', url: 'javascript:alert(1)', image: 'data:image/svg+xml,x', quantity: 1, notes: '<svg onload="alert(1)">' } });
    assert.equal(response.ok, true);
    await page.reload(); await heading('Your cart');
    const stored = (await state()).products.at(-1);
    assert.equal((await state()).products.length, before + 1);
    assert.equal(stored.url, ''); assert.equal(stored.image, '');
    assert.equal(await page.evaluate(() => globalThis.cartscopeInjected), undefined);
    assert.equal(await page.locator('#app img[onerror], #app svg[onload], #app script').count(), 0);
    assert.equal(await page.locator('#app a[href^="javascript:"]').count(), 0);
  });

  await check('Toolbar action grants activeTab and background scripting captures a real HTTP product page', async () => {
    productPage = await context.newPage();
    await productPage.goto(`${base}/fixtures/product.html`);
    await productPage.bringToFront();
    const session = await context.newCDPSession(productPage);
    const { targetInfo } = await session.send('Target.getTargetInfo');
    await session.send('Extensions.triggerAction', { id: extensionId, targetId: targetInfo.targetId });
    await page.evaluate(() => document.querySelector('[data-action="capture"]').click());
    await heading('Review item');
    assert.equal(await page.locator('#product-form [name="name"]').inputValue(), 'Fixture Headphones');
    assert.equal(await page.locator('#product-form [name="model"]').inputValue(), 'QA-100');
    assert.equal(await page.locator('#product-form [name="price"]').inputValue(), '99.99');
    await fill('product-form', { shipping: '0' });
    await submit('product-form'); await heading('Your cart');
    assert.ok((await state()).offers.some(offer => offer.source === 'captured'));
  });

  await check('A category page is rejected through the real scripting consumer', async () => {
    await productPage.goto(`${base}/fixtures/category.html`); await productPage.bringToFront();
    const session = await context.newCDPSession(productPage);
    const { targetInfo } = await session.send('Target.getTargetInfo');
    await session.send('Extensions.triggerAction', { id: extensionId, targetId: targetInfo.targetId });
    const response = await message({ type: 'capture' });
    assert.equal(response.ok, false); assert.match(response.error, /product detail page/);
  });

  await check('Cart, comparison, notifications, orders, finance, and preferences fit 320/380/480 px', async () => {
    await message({ type: 'reset', demo: true });
    await page.locator('#settings-shortcut').click(); await action('demo'); await heading('Your cart');
    for (const width of [320, 380, 480]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of ['cart', 'compare', 'alerts', 'orders']) {
        await nav(view);
        if (view === 'compare') await page.locator('[name="selectedProduct"]').selectOption('sample-sony');
        const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: innerWidth }));
        assert.ok(overflow.scrollWidth <= overflow.width + 1, `${view} at ${width}px overflows: ${JSON.stringify(overflow)}`);
      }
      await page.locator('#settings-shortcut').click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await nav('compare'); await action('finance');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    await page.setViewportSize({ width: 380, height: 900 });
  });

  await check('Separate browser preview persists local data and keeps sample changes isolated', async () => {
    const profile = await mkdtemp(resolve(tmpdir(), 'cartscope-preview-browser-')); profiles.push(profile);
    previewContext = await playwright.chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, viewport: { width: 380, height: 900 } });
    const previewPage = await previewContext.newPage();
    previewPage.on('pageerror', error => pageErrors.push(error.message));
    await previewPage.goto(`${base}/sidepanel.html`); await previewPage.locator('#app h1').waitFor();
    assert.equal(await previewPage.locator('.product-card').count(), 4);
    await previewPage.locator('[data-quantity="sample-jbl"]').fill('3');
    await previewPage.locator('[data-quantity="sample-jbl"]').dispatchEvent('change');
    await previewPage.waitForFunction(() => JSON.parse(localStorage.getItem('cartscope:sampleWorkspace'))?.products[0].quantity === 3);
    await previewPage.reload(); await previewPage.locator('#app h1').waitFor();
    assert.equal(await previewPage.locator('[data-quantity="sample-jbl"]').inputValue(), '3');
    await previewPage.locator('#exit-demo').click();
    await previewPage.locator('#app h2').filter({ hasText: 'A little perspective' }).waitFor();
    assert.equal(await previewPage.locator('.product-card').count(), 0);
    assert.equal((await state(false)).products.length > 0, true);
    await previewContext.close(); previewContext = null;
  });

  await check('No uncaught JavaScript errors occurred', async () => assert.deepEqual(pageErrors, []));
  report.status = 'passed';
} catch (error) {
  if (report.status !== 'blocked') report.status = 'failed';
  if (!report.errors.length) report.errors.push({ stage: 'integration', message: error.message, stack: error.stack });
  if (page && !page.isClosed()) await page.screenshot({ path: resolve(screenshots, 'failure.png'), fullPage: true }).catch(() => {});
  console.error(`${report.status.toUpperCase()}: ${error.message}`);
  process.exitCode = 1;
} finally {
  await previewContext?.close().catch(() => {});
  await context?.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  for (const profile of profiles) await rm(profile, { recursive: true, force: true }).catch(() => {});
  report.finishedAt = new Date().toISOString();
  report.passed = report.checks.filter(check => check.status === 'passed').length;
  report.failed = report.checks.filter(check => check.status === 'failed').length;
  await writeFile(resolve(artifactDir, 'browser-results.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Browser report: artifacts/browser-results.json (${report.status}; ${report.passed} passed, ${report.failed} failed)`);
}
