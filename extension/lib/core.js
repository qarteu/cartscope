// Pure decision helpers. No network, browser storage, or retailer credentials.
const MAX_AMOUNT = 1_000_000_000;
const AVAILABILITY = new Set(['in_stock', 'out_of_stock', 'unknown']);
const text = (value, max = 500) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
const key = value => text(value).toLowerCase().replace(/[^a-z0-9]/g, '');
const record = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_AMOUNT;
const quantity = value => Number.isInteger(value) && value >= 1 && value <= 999;

export function money(value, currency = 'USD') {
  if (!amount(value)) return '—';
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: /^[A-Z]{3}$/.test(currency) ? currency : 'USD' }).format(value); }
  catch { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }
}

export function safeUrl(value) {
  if (typeof value !== 'string' || value.length > 4096) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function normalizeProduct(input) {
  const item = record(input);
  if (!text(item.name)) throw new Error('A product name is required.');
  if (!amount(item.price)) throw new Error('Price must be a non-negative, finite number.');
  const count = item.quantity === undefined ? 1 : item.quantity;
  if (!quantity(count)) throw new Error('Quantity must be a whole number from 1 to 999.');
  const currency = item.currency === undefined ? 'USD' : text(item.currency).toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Currency must be a three-letter code.');
  const url = safeUrl(item.url);
  const identity = `${url}|${text(item.name)}|${text(item.model)}|${text(item.variant)}`;
  // Stable capture identity; storage can assign its own UUID when saving a new item.
  let hash = 2166136261;
  for (const char of identity) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return {
    id: text(item.id, 100) || `product-${hash.toString(16)}`,
    name: text(item.name), brand: text(item.brand, 100), model: text(item.model, 100),
    gtin: text(item.gtin, 30), variant: text(item.variant, 200), color: text(item.color, 100),
    size: text(item.size, 100), condition: ['new', 'used', 'refurbished'].includes(item.condition) ? item.condition : '', currency, quantity: count, notes: text(item.notes, 2000),
    url, image: safeUrl(item.image), retailer: text(item.retailer, 100), price: round(item.price),
    availability: AVAILABILITY.has(item.availability) ? item.availability : 'unknown'
  };
}

function validGtin(value) {
  const digits = text(value).replace(/[ -]/g, '');
  if (!/^\d{8}$|^\d{12,14}$/.test(digits)) return '';
  let sum = 0;
  for (let i = digits.length - 2, weight = 3; i >= 0; i--, weight = weight === 3 ? 1 : 3) sum += Number(digits[i]) * weight;
  return (10 - sum % 10) % 10 === Number(digits.at(-1)) ? digits.padStart(14, '0') : '';
}

export function matchProducts(first, second) {
  const a = record(first), b = record(second);
  const fields = ['brand', 'model', 'variant', 'color', 'size', 'condition'];
  for (const field of fields) {
    if (key(a[field]) && key(b[field]) && key(a[field]) !== key(b[field])) {
      return { level: 'mismatch', reason: `Different ${field}: ${text(a[field], 80)} / ${text(b[field], 80)}.` };
    }
  }
  const gtinA = validGtin(a.gtin), gtinB = validGtin(b.gtin);
  if (gtinA && gtinB && gtinA !== gtinB) return { level: 'mismatch', reason: 'Product identifiers differ.' };
  const incompleteVariant = ['variant', 'color', 'size', 'condition'].some(field => Boolean(key(a[field])) !== Boolean(key(b[field])));
  if (gtinA && gtinB && !incompleteVariant) return { level: 'exact', reason: 'Same valid product identifier; no conflicting variant details.' };
  if (gtinA && gtinB) return { level: 'possible', reason: 'Product identifier matches; confirm the missing variant details.' };
  const identity = key(a.brand) && key(a.model) && key(a.brand) === key(b.brand) && key(a.model) === key(b.model);
  if (identity && !incompleteVariant) return { level: 'exact', reason: 'Same brand and model with consistent variant details.' };
  if (identity) return { level: 'possible', reason: 'Brand and model match; confirm the missing variant details.' };
  return { level: 'possible', reason: 'Not enough product identifiers to verify a match. Confirm brand, model, and variant.' };
}

export function calculateCost(input, settings = {}) {
  const offer = record(input), config = record(settings), missing = [];
  const flag = field => { if (!missing.includes(field)) missing.push(field); };
  const read = (field, fallback) => {
    const value = offer[field] === undefined && fallback !== undefined ? fallback : offer[field];
    if (!amount(value)) { flag(field); return null; }
    return round(value);
  };
  const currency = text(offer.currency || 'USD').toUpperCase();
  const expectedCurrency = text(config.currency || 'USD').toUpperCase();
  if (currency !== 'USD' || expectedCurrency !== 'USD') flag('currency');
  const count = offer.quantity === undefined ? 1 : offer.quantity;
  if (!quantity(count)) flag('quantity');
  const unitPrice = read('price');
  const price = unitPrice !== null && quantity(count) ? round(unitPrice * count) : null;
  if (price !== null && price > MAX_AMOUNT) flag('price');
  const shipping = read('shipping');
  const membership = read('membership', 0), discount = read('discount', 0), cashback = read('cashback', 0);
  if (price !== null && discount !== null && discount > price) flag('discount');
  let tax = null;
  if (offer.tax !== null && offer.tax !== undefined) tax = read('tax');
  else {
    const taxRate = config.taxRate === undefined ? 8 : config.taxRate;
    if (!amount(taxRate) || taxRate > 100) flag('taxRate');
    else if (price !== null && shipping !== null && discount !== null && discount <= price) tax = round((price - discount + shipping) * taxRate / 100);
    else flag('tax');
  }
  let payable = missing.length ? null : round(price + shipping + tax + membership - discount);
  if (payable !== null && (payable > MAX_AMOUNT || cashback > payable)) { flag(cashback > payable ? 'cashback' : 'total'); payable = null; }
  const total = payable === null ? null : round(payable - cashback);
  return { total, payable, cashback, tax, missing, estimated: offer.tax === null || offer.tax === undefined,
    breakdown: { price, shipping, tax, membership, discount, cashback } };
}

export function rankOffers(inputs, product, settings = {}, priority = 'total') {
  if (!Array.isArray(inputs)) return [];
  const priorityName = priority === 'pickup' ? 'local' : ['total', 'delivery', 'returns', 'local'].includes(priority) ? priority : 'total';
  const offers = inputs.map((input, index) => {
    const offer = { ...record(input) };
    const match = matchProducts(product, offer);
    const cost = calculateCost({ ...offer, quantity: record(product).quantity ?? offer.quantity }, { ...record(settings), currency: record(product).currency || record(settings).currency || 'USD' });
    const unavailable = offer.availability === 'out_of_stock';
    const explanation = [match.reason, cost.missing.length ? `Missing or invalid: ${cost.missing.join(', ')}. Total unavailable.` : `Estimated effective total ${money(cost.total)}; pay ${money(cost.payable)} before cashback.`,
      unavailable ? 'Out of stock.' : '', offer.source === 'sample' ? 'Sample offer for demonstration.' : '',
      priorityName === 'local' && offer.pickup ? 'Pickup available; confirm location and stock with the retailer.' : ''].filter(Boolean).join(' ');
    return { ...offer, cost, match, explanation, _index: index };
  });
  const eligibility = offer => (offer.match.level === 'exact' ? 0 : offer.match.level === 'possible' ? 10 : 20) + (offer.cost.total === null ? 4 : 0) + (offer.availability === 'out_of_stock' ? 2 : 0);
  const metric = offer => {
    if (priorityName === 'delivery') return amount(offer.deliveryDays) ? offer.deliveryDays : Infinity;
    if (priorityName === 'returns') return amount(offer.returnDays) ? -offer.returnDays : Infinity;
    if (priorityName === 'local') return offer.pickup === true ? 0 : 1;
    return offer.cost.total ?? Infinity;
  };
  return offers.sort((a, b) => eligibility(a) - eligibility(b) || metric(a) - metric(b) || (a.cost.total ?? Infinity) - (b.cost.total ?? Infinity) || a._index - b._index)
    .map(({ _index, ...offer }) => offer);
}

export function buildPaymentSchedule(input) {
  const terms = record(input);
  const principal = terms.principal, interest = terms.interest ?? 0, fees = terms.fees ?? 0, lateFee = terms.lateFee ?? 0;
  if (![principal, interest, fees, lateFee].every(amount)) throw new Error('Payment amounts must be non-negative, finite numbers.');
  if (!Number.isInteger(terms.payments) || terms.payments < 1 || terms.payments > 120) throw new Error('Choose 1 to 120 payments.');
  if (!Number.isInteger(terms.intervalDays) || terms.intervalDays < 1 || terms.intervalDays > 366) throw new Error('Payment interval must be 1 to 366 whole days.');
  if (typeof terms.startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(terms.startDate)) throw new Error('Enter a valid first payment date.');
  const start = new Date(`${terms.startDate}T12:00:00Z`);
  if (!Number.isFinite(start.getTime()) || start.toISOString().slice(0, 10) !== terms.startDate) throw new Error('Enter a valid first payment date.');
  const total = round(principal + interest + fees);
  if (total > MAX_AMOUNT) throw new Error('Payment total is too large.');
  const cents = Math.round(total * 100), base = Math.floor(cents / terms.payments), remainder = cents % terms.payments;
  const payments = Array.from({ length: terms.payments }, (_, index) => ({
    date: new Date(start.getTime() + index * terms.intervalDays * 86400000).toISOString().slice(0, 10),
    amount: (base + (index < remainder ? 1 : 0)) / 100
  }));
  return { total, payments, lateFee: round(lateFee) };
}

export function deriveAlert(previousInput, currentInput, watchInput) {
  const previous = record(previousInput), current = record(currentInput), watch = record(watchInput);
  if (watch.enabled === false || (!watch.priceDrop && !watch.restock)) return null;
  if (watch.productId && current.productId && watch.productId !== current.productId) return null;
  const restock = watch.restock === true && previous.availability === 'out_of_stock' && current.availability === 'in_stock';
  const demo = current.source === 'sample' ? 'Sample: ' : '';
  if (restock) return { type: 'restock', title: `${demo}Back in stock`, message: `${demo}${text(current.name) || 'Your saved item'} is available again at ${text(current.retailer) || 'the retailer'}. Confirm availability before checkout.` };
  if (watch.priceDrop === false || !amount(previous.price) || !amount(current.price) || current.price >= previous.price) return null;
  if (text(previous.currency || 'USD') !== text(current.currency || 'USD')) return null;
  const target = watch.targetPrice;
  if (target !== undefined && target !== null && (!amount(target) || current.price > target)) return null;
  return { type: 'price_drop', title: `${demo}Price dropped`, message: `${demo}${text(current.name) || 'Your saved item'} is now ${money(current.price, current.currency || 'USD')} at ${text(current.retailer) || 'the retailer'} (${money(round(previous.price - current.price), current.currency || 'USD')} less). Confirm price before checkout.` };
}

export function priceInsight(input) {
  const history = Array.isArray(input) ? input : [];
  const points = history.map(entry => typeof entry === 'number' ? { price: entry, currency: 'USD' } : record(entry));
  const currency = points.at(-1)?.currency || 'USD';
  const valid = points.filter(entry => amount(entry.price) && (entry.currency || 'USD') === currency);
  if (!valid.length) return { label: 'No price history yet', min: null, max: null, current: null, change: null };
  const prices = valid.map(entry => round(entry.price)), current = prices.at(-1), min = Math.min(...prices), max = Math.max(...prices);
  const change = prices.length > 1 ? round(current - prices[0]) : 0;
  const label = prices.length < 2 ? 'One recorded observation' : current === min && min < max ? 'Lowest recorded price' : current === max && min < max ? 'Highest recorded price' : min === max ? 'No recorded price change' : 'Within recorded price range';
  return { label, min, max, current, change };
}
