import test from 'node:test';
import assert from 'node:assert/strict';
import {
  money, safeUrl, normalizeProduct, matchProducts, calculateCost, rankOffers,
  buildPaymentSchedule, deriveAlert, priceInsight
} from '../extension/lib/core.js';

const product = { name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', model: 'WH-1000XM5', color: 'Black', price: 299.99, currency: 'USD', quantity: 1 };
const offer = { ...product, price: 279.99, shipping: 0, tax: null, membership: 0, discount: 0, cashback: 0, availability: 'in_stock', source: 'manual' };

test('safeUrl preserves ordinary HTTP URLs and rejects active or credentialed URLs', () => {
  assert.equal(safeUrl('https://example.com/p?q=x'), 'https://example.com/p?q=x');
  assert.equal(safeUrl('http://example.com'), 'http://example.com/');
  for (const unsafe of ['javascript:alert(1)', 'data:text/html,x', 'file:///tmp/a', 'https://user:password@example.com', '//example.com', null, 42, {}, 'https://']) assert.equal(safeUrl(unsafe), '');
});

test('money formats finite non-negative amounts without unsafe or invalid strings', () => {
  assert.equal(money(299.99), '$299.99');
  assert.equal(money(0), '$0.00');
  assert.equal(money(12, 'bad'), '$12.00');
  for (const bad of [NaN, Infinity, -1, '299.99', null, undefined]) assert.equal(money(bad), '—');
});

test('normalizeProduct returns a stable validated data record without arbitrary fields', () => {
  const source = { ...product, name: '  Headphones  ', notes: 'a'.repeat(2200), url: 'javascript:alert(1)', image: 'data:image/svg+xml,x', privileged: true };
  const first = normalizeProduct(source), second = normalizeProduct(source);
  assert.deepEqual(first, second);
  assert.equal(first.name, 'Headphones');
  assert.equal(first.notes.length, 2000);
  assert.equal(first.url, '');
  assert.equal(first.image, '');
  assert.equal('privileged' in first, false);
  assert.equal(normalizeProduct({ name: 'Free sample', price: 0 }).quantity, 1);
});

test('normalizeProduct rejects absent, malformed, negative, infinite, and invalid quantity data', () => {
  for (const input of [null, [], {}, { ...product, name: '' }, { ...product, price: -1 }, { ...product, price: Infinity }, { ...product, price: '12' }, { ...product, quantity: 0 }, { ...product, quantity: 1.5 }, { ...product, quantity: 1000 }, { ...product, currency: '<script>' }]) assert.throws(() => normalizeProduct(input));
});

test('brand and model match tolerates punctuation but refuses any known variant conflict', () => {
  assert.equal(matchProducts(product, { ...offer, brand: 'SONY', model: 'WH 1000XM5' }).level, 'exact');
  for (const changes of [{ color: 'White' }, { size: 'Large' }, { model: 'WH-1000XM4' }, { brand: 'Bose' }]) {
    const selected = changes.size ? { ...product, size: 'Small' } : product;
    assert.equal(matchProducts(selected, { ...offer, ...changes }).level, 'mismatch');
  }
  assert.equal(matchProducts(product, { ...offer, color: '' }).level, 'possible');
  assert.equal(matchProducts(product, { name: product.name }).level, 'possible');
  assert.equal(matchProducts(null, null).level, 'possible');
});

test('barcode identity validates check digits and does not override conflicting or missing variants', () => {
  assert.equal(matchProducts({ gtin: '012345678905' }, { gtin: '00012345678905' }).level, 'exact');
  assert.equal(matchProducts({ gtin: '012345678905' }, { gtin: '012345678912' }).level, 'mismatch');
  assert.equal(matchProducts({ gtin: '012345678900' }, { gtin: '012345678900' }).level, 'possible');
  assert.equal(matchProducts({ gtin: '012345678905', color: 'Black' }, { gtin: '012345678905', color: 'White' }).level, 'mismatch');
  assert.equal(matchProducts({ gtin: '012345678905', color: 'Black' }, { gtin: '012345678905' }).level, 'possible');
});

test('condition is never guessed and new or used inventory cannot be promoted as the same offer', () => {
  assert.equal(normalizeProduct(product).condition, '');
  assert.equal(normalizeProduct({ ...product, condition: 'used' }).condition, 'used');
  assert.equal(normalizeProduct({ ...product, condition: 'unknown' }).condition, '');
  assert.equal(matchProducts({ ...product, condition: 'new' }, { ...offer, condition: 'used' }).level, 'mismatch');
  assert.equal(matchProducts({ ...product, condition: 'new' }, offer).level, 'possible');
  assert.equal(matchProducts(product, { ...offer, condition: 'new' }).level, 'possible');
  assert.equal(matchProducts({ ...product, condition: 'new' }, { ...offer, condition: 'new' }).level, 'exact');
});

test('cost separates checkout obligation from cashback using an independent cents calculation', () => {
  const input = { ...offer, price: 100, quantity: 2, shipping: 6.99, discount: 10, membership: 12, cashback: 5 };
  const result = calculateCost(input, { taxRate: 8 });
  const expectedTaxCents = Math.round((20000 - 1000 + 699) * 0.08);
  const expectedPayableCents = 20000 + 699 + expectedTaxCents + 1200 - 1000;
  assert.equal(result.tax, expectedTaxCents / 100);
  assert.equal(result.payable, expectedPayableCents / 100);
  assert.equal(result.total, (expectedPayableCents - 500) / 100);
  assert.deepEqual(result.missing, []);
  assert.equal(result.estimated, true);
  assert.equal(calculateCost({ ...offer, tax: 0 }).estimated, false);
});

test('unknown shipping prevents a ranked total instead of becoming free shipping', () => {
  const result = calculateCost({ ...offer, shipping: null });
  assert.equal(result.total, null);
  assert.equal(result.payable, null);
  assert.equal(result.breakdown.shipping, null);
  assert.ok(result.missing.includes('shipping'));
  assert.equal(calculateCost({ ...offer, price: 0, shipping: 0, tax: 0 }).total, 0);
});

test('malformed cost values and mixed currencies cannot produce a valid total', () => {
  const changes = [{ price: -1 }, { shipping: -2 }, { tax: Infinity }, { membership: NaN }, { discount: 1000 }, { cashback: 1000 }, { quantity: 1.1 }, { price: '299.99' }, { currency: 'EUR' }];
  for (const change of changes) {
    const result = calculateCost({ ...offer, ...change });
    assert.equal(result.total, null, JSON.stringify(change));
    assert.ok(result.missing.length);
  }
  assert.equal(calculateCost(offer, { taxRate: -5 }).total, null);
  assert.equal(calculateCost(offer, { currency: 'EUR' }).total, null);
  assert.equal(calculateCost(null).total, null);
});

test('ranking excludes cheap mismatches from best position and preserves deterministic ties', () => {
  const list = [{ ...offer, id: 'wrong', color: 'White', price: 1 }, { ...offer, id: 'missing', color: '', price: 2 }, { ...offer, id: 'exact', price: 10 }, { ...offer, id: 'tie', price: 10 }];
  const ranked = rankOffers(list, product);
  assert.deepEqual(ranked.map(row => row.id), ['exact', 'tie', 'missing', 'wrong']);
  assert.deepEqual(rankOffers(list, product), ranked);
  assert.equal(list[0].cost, undefined);
  assert.match(ranked[0].explanation, /pay \$/);
  assert.equal(rankOffers(null, product).length, 0);
});

test('each priority actually changes eligible ordering, with pickup alias supported', () => {
  const list = [{ ...offer, id: 'cheap', price: 10, deliveryDays: 5, returnDays: 7, pickup: false }, { ...offer, id: 'fast', price: 20, deliveryDays: 1, returnDays: 30, pickup: true }];
  assert.equal(rankOffers(list, product)[0].id, 'cheap');
  for (const priority of ['delivery', 'returns', 'local', 'pickup']) assert.equal(rankOffers(list, product, {}, priority)[0].id, 'fast');
  const soldOut = { ...offer, id: 'out', price: 1, availability: 'out_of_stock' };
  assert.equal(rankOffers([soldOut, ...list], product)[0].id, 'cheap');
  assert.equal(rankOffers(list, { ...product, currency: 'EUR' })[0].cost.total, null);
});

test('payment schedule totals full obligation and allocates rounding cents exactly', () => {
  const result = buildPaymentSchedule({ principal: 100, interest: 2.02, fees: 1, payments: 4, intervalDays: 14, startDate: '2026-10-11', lateFee: 8 });
  assert.equal(result.total, 103.02);
  assert.deepEqual(result.payments.map(row => row.date), ['2026-10-11', '2026-10-25', '2026-11-08', '2026-11-22']);
  assert.equal(result.payments.reduce((sum, row) => sum + Math.round(row.amount * 100), 0), Math.round(result.total * 100));
  assert.deepEqual(result.payments.map(row => row.amount), [25.76, 25.76, 25.75, 25.75]);
  assert.equal(result.lateFee, 8);
});

test('payment schedule handles zero amount and UTC leap days', () => {
  const result = buildPaymentSchedule({ principal: 0, payments: 2, intervalDays: 1, startDate: '2028-02-28' });
  assert.deepEqual(result.payments, [{ date: '2028-02-28', amount: 0 }, { date: '2028-02-29', amount: 0 }]);
});

test('payment schedule rejects misleading or malformed financing terms', () => {
  const base = { principal: 100, payments: 4, intervalDays: 14, startDate: '2026-10-11' };
  for (const change of [{ principal: -1 }, { interest: Infinity }, { fees: '2' }, { lateFee: -2 }, { payments: 0 }, { payments: 2.5 }, { intervalDays: 0 }, { intervalDays: 1.5 }, { startDate: '2026-02-30' }, { startDate: 'yesterday' }]) assert.throws(() => buildPaymentSchedule({ ...base, ...change }));
  assert.throws(() => buildPaymentSchedule(null));
});

test('price alerts require an opted-in watch', () => {
  const old = { ...offer, price: 100 }, next = { ...offer, price: 90 };
  assert.equal(deriveAlert(old, next, {}), null);
});

test('alert transitions do not fire for initial, unchanged, mismatched, disabled, or invalid observations', () => {
  const old = { ...offer, price: 100 }, next = { ...offer, price: 90 };
  assert.equal(deriveAlert(old, next, { priceDrop: true }).type, 'price_drop');
  assert.equal(deriveAlert(old, next, { priceDrop: true, targetPrice: 85 }), null);
  assert.equal(deriveAlert(old, next, { priceDrop: true, targetPrice: 90 }).type, 'price_drop');
  assert.equal(deriveAlert(old, next, { priceDrop: true, enabled: false }), null);
  assert.equal(deriveAlert(null, next, { priceDrop: true }), null);
  assert.equal(deriveAlert(next, next, { priceDrop: true }), null);
  assert.equal(deriveAlert(old, { ...next, currency: 'EUR' }, { priceDrop: true }), null);
  assert.equal(deriveAlert(old, { ...next, price: -1 }, { priceDrop: true }), null);
  assert.equal(deriveAlert(old, { ...next, productId: 'b' }, { priceDrop: true, productId: 'a' }), null);
});

test('restock alert requires known out-of-stock transition, and sample events are explicitly labelled', () => {
  const old = { ...offer, availability: 'out_of_stock' }, next = { ...offer, availability: 'in_stock' };
  assert.equal(deriveAlert(old, next, { restock: true }).type, 'restock');
  assert.equal(deriveAlert({ ...old, availability: 'unknown' }, next, { restock: true }), null);
  const demo = deriveAlert(old, { ...next, source: 'sample' }, { restock: true });
  assert.match(demo.title, /^Sample:/);
  assert.match(demo.message, /^Sample:/);
});

test('price history only claims a recorded range, ignores invalid points, and keeps currencies separate', () => {
  assert.deepEqual(priceInsight([]), { label: 'No price history yet', min: null, max: null, current: null, change: null });
  assert.deepEqual(priceInsight([100, 90, 95, 80]), { label: 'Lowest recorded price', min: 80, max: 100, current: 80, change: -20 });
  assert.equal(priceInsight([20]).label, 'One recorded observation');
  assert.equal(priceInsight([20, 20]).label, 'No recorded price change');
  assert.equal(priceInsight([NaN, -1, null]).current, null);
  assert.deepEqual(priceInsight([{ price: 100, currency: 'USD' }, { price: 70, currency: 'EUR' }]), { label: 'One recorded observation', min: 70, max: 70, current: 70, change: 0 });
});
