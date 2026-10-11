import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCost } from '../extension/lib/core.js';
import { sampleState } from '../extension/lib/samples.js';

// Use the production message consumer and isolate Chrome storage semantics:
// reads and writes return copies, so a rejected operation cannot mutate storage.
let messageListener;
let actionListener;
let installedListener;
const panelBehaviorCalls = [];
const openedPanels = [];
let persisted = {};
globalThis.chrome = {
  runtime: {
    id: 'cartscope-storage-test',
    onInstalled: { addListener(listener) { installedListener = listener; } },
    onMessage: { addListener(listener) { messageListener = listener; } }
  },
  action: { onClicked: { addListener(listener) { actionListener = listener; } } },
  sidePanel: {
    setPanelBehavior: async options => { panelBehaviorCalls.push(structuredClone(options)); },
    open: async options => { openedPanels.push(structuredClone(options)); }
  },
  storage: {
    local: {
      get: async key => structuredClone({ [key]: persisted[key] }),
      set: async values => { persisted = { ...persisted, ...structuredClone(values) }; },
      setAccessLevel: async () => {}
    }
  },
  permissions: { contains: async () => false },
  notifications: { create: async () => {} }
};
await import('../extension/background.js');

const send = message => new Promise(resolve => {
  const accepted = messageListener(message, { id: chrome.runtime.id }, resolve);
  assert.equal(accepted, true);
});
const product = (changes = {}) => ({
  id: 'item-one', name: 'Sony WH-1000XM5 Headphones', brand: 'Sony',
  model: 'WH-1000XM5', color: 'Black', variant: 'Black', currency: 'USD',
  price: 100, quantity: 1, retailer: 'Example Shop',
  url: 'https://shop.example.com/products/headphones?color=black',
  image: 'https://shop.example.com/images/headphones.png', shipping: 0,
  availability: 'in_stock', notes: 'Compare the same model and color.',
  ...changes
});
const backup = (changes = {}) => ({
  schema: 1, products: [product()],
  offers: [{ ...product(), id: 'offer-one', productId: 'item-one',
    tax: null, membership: 0, discount: 0, cashback: 0,
    checkedAt: '2026-10-11T12:00:00.000Z', source: 'manual' }],
  history: [], orders: [], alerts: [], settings: {}, ...changes
});
async function save(changes = {}, source = 'manual') {
  const response = await send({ type: 'saveProduct', product: product(changes), source });
  assert.equal(response.ok, true, response.error);
  return response.state;
}
async function expectRejected(message) {
  const before = structuredClone(persisted);
  const response = await send(message);
  assert.equal(response.ok, false, 'Malformed input must be rejected.');
  assert.ok(response.error, 'A rejection should explain the problem.');
  assert.deepEqual(persisted, before, 'Rejected requests must leave both workspaces unchanged.');
  return response;
}

beforeEach(() => { persisted = {}; openedPanels.length = 0; });

test('toolbar click opens the clicked window panel synchronously after native action behavior is disabled', async () => {
  assert.equal(typeof actionListener, 'function', 'The extension must own the toolbar click handler.');
  assert.ok(panelBehaviorCalls.length > 0);
  assert.ok(panelBehaviorCalls.every(options => options.openPanelOnActionClick === false),
    'Native panel opening bypasses the action event needed for the activeTab grant.');
  actionListener({ id: 42, windowId: 7, url: 'https://shop.example.com/products/headphones' });
  assert.deepEqual(openedPanels, [{ windowId: 7 }],
    'Opening must happen within the click callback before an awaited operation can lose the user gesture.');
  assert.equal(typeof installedListener, 'function');
  await installedListener();
  assert.equal(panelBehaviorCalls.at(-1).openPanelOnActionClick, false,
    'Installing or updating the extension must retain the explicit toolbar action.');
});

test('quantity changes reject fractions and preserve the existing cart', async () => {
  await save();
  for (const quantity of [1.5, 0, 1000, NaN]) {
    await expectRejected({ type: 'updateProduct', id: 'item-one', quantity });
  }
  const response = await send({ type: 'updateProduct', id: 'item-one', quantity: 2 });
  assert.equal(response.ok, true, response.error);
  assert.equal(response.state.products[0].quantity, 2);
  assert.equal(calculateCost({ ...response.state.offers[0], quantity: 2 }, { taxRate: 8 }).total, 216);
});

test('orders reject fractional quantities and impossible calendar dates', async () => {
  await save();
  const order = { productId: 'item-one', quantity: 1, status: 'preparing',
    orderedAt: '2026-10-11', expectedAt: '2026-10-18' };
  for (const changes of [
    { quantity: 1.5 }, { orderedAt: '2026-02-30' },
    { expectedAt: '2026-02-29' }, { orderedAt: '2026-13-01' }
  ]) await expectRejected({ type: 'saveOrder', order: { ...order, ...changes } });
  const response = await send({ type: 'saveOrder', order: { ...order, expectedAt: '2028-02-29' } });
  assert.equal(response.ok, true, response.error);
  assert.equal(response.state.orders[0].expectedAt, '2028-02-29');
});

test('imports reject numeric or mismatched ID types instead of creating invisible offers', async () => {
  await save();
  await expectRejected({ type: 'import', state: backup({
    products: [product({ id: 5 })],
    offers: [{ ...product(), id: 'offer-five', productId: 5 }]
  }) });
  await expectRejected({ type: 'import', state: backup({
    products: [product({ id: '5' })],
    offers: [{ ...product(), id: 'offer-five', productId: 5 }]
  }) });
});

test('imports reject IDs that would collide after truncation', async () => {
  await save();
  const prefix = 'a'.repeat(100);
  await expectRejected({ type: 'import', state: backup({
    products: [product({ id: prefix + '1' }), product({ id: prefix + '2' })], offers: []
  }) });
  await expectRejected({ type: 'import', state: backup({
    offers: [
      { ...backup().offers[0], id: prefix + '1' },
      { ...backup().offers[0], id: prefix + '2' }
    ]
  }) });
});

test('sample backups cannot enter the real workspace', async () => {
  await save();
  await expectRejected({ type: 'import', state: sampleState() });
  // Removing offers must not erase the provenance of a sample workspace.
  const noOffers = sampleState();
  noOffers.offers = [];
  await expectRejected({ type: 'import', state: noOffers });
  // Each retained record type also protects older backups without a marker.
  await expectRejected({ type: 'import', state: backup({
    products: [product({ source: 'sample' })], offers: [], history: []
  }) });
  await expectRejected({ type: 'import', state: backup({
    offers: [], history: [{ productId: 'item-one', offerId: 'removed-offer',
      price: 80, currency: 'USD', checkedAt: '2026-10-11T12:00:00.000Z', source: 'sample' }]
  }) });
  await expectRejected({ type: 'import', state: backup({ sample: true, offers: [], history: [] }) });
  const real = await send({ type: 'getState' });
  assert.deepEqual(real.state.products.map(item => item.id), ['item-one']);
});

test('sample defaults mark the workspace and products as illustrative data', () => {
  const sample = sampleState();
  assert.equal(sample.sample, true);
  assert.ok(sample.products.length > 0);
  assert.ok(sample.products.every(item => item.source === 'sample'));
});

test('real backup roundtrip preserves links, observations and watches while clearing alerts', async () => {
  await save({ watch: { priceDrop: true, restock: true, targetPrice: 90 } });
  await save({ price: 80, watch: { priceDrop: true, restock: true, targetPrice: 90 } });
  const order = await send({ type: 'saveOrder', order: {
    id: 'order-one', productId: 'item-one', retailer: 'Example Shop', quantity: 2,
    status: 'in_transit', orderedAt: '2026-10-11', expectedAt: '2026-10-18',
    trackingNumber: 'EXAMPLE-123', trackingUrl: 'https://carrier.example.com/track/EXAMPLE-123',
    notes: 'Entered from the retailer confirmation.'
  } });
  assert.equal(order.ok, true, order.error);
  const exported = structuredClone((await send({ type: 'getState' })).state);
  assert.equal(exported.alerts.length, 1, 'The saved price drop must actually produce an alert.');
  await send({ type: 'reset' });
  const response = await send({ type: 'import', state: exported });
  assert.equal(response.ok, true, response.error);
  assert.deepEqual(response.state.products, exported.products);
  assert.deepEqual(response.state.offers, exported.offers);
  assert.deepEqual(response.state.history, exported.history);
  assert.deepEqual(response.state.orders, exported.orders);
  assert.deepEqual(response.state.alerts, [], 'Historical alert messages deliberately are not replayed.');
  assert.equal(response.state.settings.notificationsEnabled, false);
});

test('a malformed later record aborts an import without partially replacing existing data', async () => {
  await save();
  await expectRejected({ type: 'import', state: backup({
    products: [product({ id: 'first-valid' }), product({ id: 'second-invalid', price: -1 })], offers: []
  }) });
  await expectRejected({ type: 'import', state: backup({
    offers: [backup().offers[0], { ...backup().offers[0], id: 'bad-offer', price: -1 }]
  }) });
  await expectRejected({ type: 'import', state: backup({
    history: [{ productId: 'item-one', offerId: 'offer-one', price: -1,
      checkedAt: '2026-10-11T12:00:00.000Z', currency: 'USD' }]
  }) });
});

test('unknown required membership cost stays unknown rather than becoming free', async () => {
  await save();
  const response = await send({ type: 'saveOffer', offer: {
    ...product(), id: 'membership-offer', productId: 'item-one',
    price: 80, shipping: 0, tax: 0, membership: null, discount: 0, cashback: 0
  } });
  assert.equal(response.ok, true, response.error);
  const offer = response.state.offers.find(item => item.id === 'membership-offer');
  assert.equal(offer.membership, null);
  const cost = calculateCost(offer);
  assert.equal(cost.total, null);
  assert.ok(cost.missing.includes('membership'));
  const roundtrip = await send({ type: 'import', state: response.state });
  assert.equal(roundtrip.ok, true, roundtrip.error);
  assert.equal(roundtrip.state.offers.find(item => item.id === 'membership-offer').membership, null);
});
