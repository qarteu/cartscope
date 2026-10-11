import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { normalizeProduct } from '../extension/lib/core.js';

const source = await readFile(new URL('../extension/extract.js', import.meta.url), 'utf8');
const fixture = async name => JSON.parse(await readFile(new URL(`fixtures/${name}.json`, import.meta.url), 'utf8'));

// Snapshot adapter supplies only the read operations Chrome's injected script uses.
// The actual classic script executes in a fresh VM, so tests also catch accidental
// module imports, extension API dependencies, writes, and navigation attempts.
function capture(snapshot) {
  const parsedUrl = new URL(snapshot.url || 'https://shop.example.com/products/a');
  const element = ({ text = '', content, href } = {}) => Object.freeze({
    textContent: text,
    getAttribute: name => name === 'content' ? content ?? null : name === 'href' ? href ?? null : null
  });
  const scripts = (snapshot.scripts || []).map(value => element({ text: typeof value === 'string' ? value : JSON.stringify(value) }));
  const document = Object.freeze({
    querySelectorAll: selector => selector === 'script[type="application/ld+json"]' ? scripts : [],
    querySelector: selector => {
      if (selector === 'link[rel="canonical"]') return snapshot.canonical ? element({ href: snapshot.canonical }) : null;
      const metaName = /^meta\[property="([^"]+)"\], meta\[name="[^\"]+"\]$/.exec(selector)?.[1];
      if (metaName && snapshot.meta?.[metaName] !== undefined) return element({ content: snapshot.meta[metaName] });
      return snapshot.elements?.[selector] ? element(snapshot.elements[selector]) : null;
    }
  });
  const location = Object.freeze({ href: parsedUrl.href, hostname: parsedUrl.hostname, pathname: parsedUrl.pathname });
  return JSON.parse(JSON.stringify(vm.runInNewContext(source, { document, location, URL }, { timeout: 1000 })));
}

test('classic injected script captures a graph Product with usable complete identity', async () => {
  const result = capture(await fixture('product-page'));
  assert.equal(result.product.name, 'Sony WH-1000XM5 Headphones');
  assert.equal(result.product.price, 299.99);
  assert.equal(result.product.brand, 'Sony');
  assert.equal(result.product.model, 'WH-1000XM5');
  assert.equal(result.product.gtin, '012345678905');
  assert.equal(result.product.color, 'Black');
  assert.equal(result.product.availability, 'in_stock');
  assert.equal(result.product.image, 'https://shop.example.com/images/headphones.png');
  assert.equal(result.product.url, 'https://shop.example.com/products/headphones');
  assert.equal(normalizeProduct(result.product).price, 299.99);
  assert.match(result.warning, /Review/);
});

test('a category page cannot silently save its first recommended product', async () => {
  const result = capture(await fixture('category-page'));
  assert.equal(result.product, undefined);
  assert.match(result.error, /product detail page/);
});

test('multiple products require a single current-page or mainEntity match', () => {
  const a = { '@type': 'Product', name: 'Product A', url: 'https://shop.example.com/products/a', offers: { price: 10, priceCurrency: 'USD' } };
  const b = { '@type': 'Product', name: 'Product B', url: 'https://shop.example.com/products/b', offers: { price: 20, priceCurrency: 'USD' } };
  assert.equal(capture({ scripts: [{ '@graph': [a, b] }] }).product.name, 'Product A');
  assert.match(capture({ url: 'https://shop.example.com/category', scripts: [{ '@graph': [a, b] }] }).error, /multiple products/);
  assert.equal(capture({ scripts: [{ '@type': 'WebPage', mainEntity: b }, a] }).product.name, 'Product B');
});

test('Amazon product page selector fallback captures the displayed amount without page writes', async () => {
  const result = capture(await fixture('amazon-page'));
  assert.equal(result.product.price, 299.99);
  assert.equal(result.product.retailer, 'Amazon');
  assert.equal(result.product.brand, 'Sony');
  assert.equal(result.product.availability, 'unknown');
  assert.match(result.warning, /USD is assumed/);
  const search = { ...await fixture('amazon-page'), url: 'https://www.amazon.com/s?k=headphones' };
  assert.equal(capture(search).product, undefined);
});

test('OpenGraph supports generic product pages and does not treat a website title as a product', () => {
  const snapshot = { meta: { 'og:type': 'product', 'og:title': 'A real product', 'product:price:amount': '1,299.99', 'product:price:currency': 'USD', 'og:image': '/image.png' } };
  const result = capture(snapshot);
  assert.equal(result.product.price, 1299.99);
  assert.equal(result.product.image, 'https://shop.example.com/image.png');
  assert.equal(capture({ ...snapshot, meta: { ...snapshot.meta, 'og:type': 'website' } }).product, undefined);
});

test('retailer product fallback and displayed prices work for the supported selector adapters', () => {
  const cases = [
    { url: 'https://www.walmart.com/ip/headphones/123', retailer: 'Walmart', title: 'h1[itemprop="name"]', price: '[itemprop="price"]' },
    { url: 'https://www.bestbuy.com/site/headphones/123.p', retailer: 'Best Buy', title: '.sku-title h1', price: '.priceView-customer-price span[aria-hidden="true"]' },
    { url: 'https://www.nike.com/t/court-vision-shoes-abc', retailer: 'Nike', title: '#pdp_product_title', price: '[data-test="product-price"]' },
    { url: 'https://www.nordstrom.com/s/backpack/123', retailer: 'Nordstrom', title: 'h1', price: '[itemprop="price"]' }
  ];
  for (const site of cases) {
    const result = capture({ url: site.url, elements: { [site.title]: { text: 'Example item' }, [site.price]: { text: '$85.00' } } });
    assert.equal(result.product.retailer, site.retailer);
    assert.equal(result.product.price, 85);
  }
});

test('invalid metadata falls back only when a genuine product page and price are available', () => {
  const result = capture({ scripts: ['{malformed'], meta: { 'og:type': 'product', 'og:title': 'Product', 'product:price:amount': '25' } });
  assert.equal(result.product.price, 25);
  assert.match(result.warning, /metadata could not be read/);
  assert.equal(capture({ scripts: ['{malformed'] }).product, undefined);
});

test('ambiguous offer prices, aggregates, and hostile price strings are rejected', () => {
  const product = offers => ({ '@type': 'Product', name: 'A product', offers });
  assert.match(capture({ scripts: [product([{ price: 10 }, { price: 20 }])] }).error, /single valid price/);
  assert.match(capture({ scripts: [product({ '@type': 'AggregateOffer', lowPrice: 10, highPrice: 20 })] }).error, /single valid price/);
  for (const price of ['-10', 'Infinity', 'NaN', '10x', '$10 - $20', 'From $10', '25,99', '<script>10</script>', -1, 1e20]) {
    assert.equal(capture({ scripts: [product({ price })] }).product, undefined, String(price));
  }
  assert.equal(capture({ scripts: [product({ price: 0, priceCurrency: 'USD' })] }).product.price, 0);
});

test('multiple offer prices can be resolved only by the currently displayed price or exact offer URL', () => {
  const product = { '@type': 'Product', name: 'A product', offers: [{ price: 10, priceCurrency: 'USD', url: 'https://shop.example.com/products/a' }, { price: 20, priceCurrency: 'USD', url: 'https://shop.example.com/products/b' }] };
  assert.equal(capture({ scripts: [product] }).product.price, 10);
  assert.equal(capture({ url: 'https://shop.example.com/products/x', scripts: [product], meta: { 'product:price:amount': '20' } }).product.price, 20);
});

test('graph Offer references are resolved from the same page metadata', () => {
  const result = capture({ scripts: [{ '@graph': [
    { '@type': 'Product', name: 'Product with linked offer', offers: { '@id': '#offer' } },
    { '@type': 'Offer', '@id': '#offer', price: '49.99', priceCurrency: 'USD', availability: 'https://schema.org/OutOfStock' }
  ] }] });
  assert.equal(result.product.price, 49.99);
  assert.equal(result.product.availability, 'out_of_stock');
});

test('published new, used, and refurbished conditions are captured without an invented default', () => {
  for (const [published, expected] of [['NewCondition','new'],['UsedCondition','used'],['RefurbishedCondition','refurbished'],['DamagedCondition',''],['','']]) {
    const result = capture({ scripts: [{ '@type': 'Product', name: 'An item', offers: { price: 10, priceCurrency: 'USD', itemCondition: `https://schema.org/${published}` } }] });
    assert.equal(result.product.condition, expected);
  }
});

test('active image and canonical URL payloads cannot escape as executable extension links', () => {
  const result = capture({ canonical: 'javascript:alert(1)', scripts: [{ '@type': 'Product', name: '<img src=x onerror=alert(1)>', image: 'data:image/svg+xml,x', offers: { price: 10, priceCurrency: 'USD' } }] });
  assert.equal(result.product.image, '');
  assert.equal(result.product.url, 'https://shop.example.com/products/a');
  assert.equal(result.product.name, '<img src=x onerror=alert(1)>'); // UI must use textContent.
});

test('empty, absent, and repeated scripts produce deterministic results without invented product data', async () => {
  assert.equal(capture({ scripts: [] }).product, undefined);
  const data = await fixture('product-page');
  const first = capture(data);
  assert.deepEqual(capture(data), first);
  const repeated = capture({ ...data, scripts: [...data.scripts, ...data.scripts] });
  assert.deepEqual(repeated, first);
});
