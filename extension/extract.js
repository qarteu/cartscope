// Runs only after the shopper requests capture. Reads public product metadata;
// never clicks, changes the page, submits a form, or fetches a second page.
(() => {
  const clean = (value, max = 500) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
  const obj = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const absolute = value => {
    if (typeof value !== 'string' || !value.trim() || value.length > 4096) return '';
    try { const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
  };
  const canonicalize = value => {
    try { const url = new URL(value); return `${url.origin}${url.pathname}`.replace(/\/$/, ''); } catch { return ''; }
  };
  const amount = value => {
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 && value <= 1_000_000_000 ? value : null;
    if (typeof value !== 'string') return null;
    const raw = value.trim().replace(/^(?:USD\s*|\$\s*)/, '').replace(/\s*USD$/, '');
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(raw)) return null;
    const number = Number(raw.replace(/,/g, ''));
    return Number.isFinite(number) && number <= 1_000_000_000 ? number : null;
  };
  const selector = selectors => {
    for (const value of selectors) { const element = document.querySelector(value); if (element) { const found = clean(element.getAttribute('content') || element.textContent); if (found) return found; } }
    return '';
  };
  const meta = names => {
    for (const name of names) {
      const element = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
      const found = clean(element?.getAttribute('content'));
      if (found) return found;
    }
    return '';
  };
  const kinds = node => [node['@type']].flat().map(type => typeof type === 'string' ? type.split(/[\/#]/).at(-1).toLowerCase() : '');
  const products = [], primary = [], visited = new WeakSet(), signatures = new Set(), primarySignatures = new Set(), nodesById = new Map();
  let hasCollection = false, invalidMetadata = false;
  const visit = (node, isPrimary = false) => {
    if (Array.isArray(node)) { for (const child of node) visit(child, isPrimary); return; }
    if (!node || typeof node !== 'object' || visited.has(node)) return;
    visited.add(node);
    if (typeof node['@id'] === 'string') nodesById.set(node['@id'], node);
    const types = kinds(node);
    if (types.includes('itemlist') || types.includes('collectionpage') || types.includes('searchresultspage')) hasCollection = true;
    if (types.includes('product')) {
      const signature = JSON.stringify(node);
      if (!signatures.has(signature)) { products.push(node); signatures.add(signature); }
      if (isPrimary && !primarySignatures.has(signature)) { primary.push(node); primarySignatures.add(signature); }
    }
    if (node.mainEntity) visit(node.mainEntity, true);
    if (node['@graph']) visit(node['@graph']);
    // Item lists and recommendation trees are intentionally not traversed.
  };
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    if (!script.textContent || script.textContent.length > 2_000_000) continue;
    try { visit(JSON.parse(script.textContent)); } catch { invalidMetadata = true; }
  }
  const pageUrl = absolute(location.href);
  const canonical = absolute(document.querySelector('link[rel="canonical"]')?.getAttribute('href')) || pageUrl;
  const samePage = value => canonicalize(absolute(value)) === canonicalize(canonical) || canonicalize(absolute(value)) === canonicalize(pageUrl);
  const urlMatches = products.filter(product => samePage(product.url || product['@id']));
  let candidate = null;
  if (primary.length === 1) candidate = primary[0];
  else if (urlMatches.length === 1) candidate = urlMatches[0];
  else if (products.length === 1 && !hasCollection) candidate = products[0];
  else if (products.length > 1) return { error: 'This page contains multiple products or variants. Open one product and select a variant, or add it manually.' };

  const host = location.hostname.toLowerCase().replace(/^www\./, '');
  const paths = location.pathname;
  const retailerRules = [
    { test: /(^|\.)amazon\.(com|ca|co\.uk)$/.test(host), retailer: 'Amazon', product: /\/(?:dp|gp\/product)\/[a-z0-9]{10}(?:\/|$)/i.test(paths), name: ['#productTitle'], price: ['#corePrice_feature_div .a-price .a-offscreen', '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen', '#priceblock_ourprice', '#priceblock_dealprice'], brand: ['#bylineInfo'] },
    { test: /(^|\.)walmart\.com$/.test(host), retailer: 'Walmart', product: /^\/ip\//.test(paths), name: ['h1[itemprop="name"]', '[data-testid="product-title"]', 'h1'], price: ['[itemprop="price"]', '[data-testid="price-wrap"]'], brand: ['[itemprop="brand"]'] },
    { test: /(^|\.)bestbuy\.com$/.test(host), retailer: 'Best Buy', product: /^\/site\/.+\.p$/.test(paths) || /^\/product\//.test(paths), name: ['.sku-title h1', 'h1'], price: ['.priceView-customer-price span[aria-hidden="true"]', '[itemprop="price"]'], brand: ['[itemprop="brand"]'] },
    { test: /(^|\.)nike\.com$/.test(host), retailer: 'Nike', product: /^\/t\//.test(paths), name: ['#pdp_product_title', '[data-test="product-title"]'], price: ['[data-test="product-price"]', '[itemprop="price"]'], brand: [] },
    { test: /(^|\.)nordstrom\.com$/.test(host), retailer: 'Nordstrom', product: /^\/s\//.test(paths), name: ['h1', '[itemprop="name"]'], price: ['[itemprop="price"]'], brand: ['[itemprop="brand"]'] }
  ];
  const rule = retailerRules.find(rule => rule.test);
  const ogProduct = /^(?:product|product\.item)$/i.test(meta(['og:type']));
  if (!candidate && (hasCollection || !(ogProduct || rule?.product))) return { error: 'Open a product detail page before capturing. Category, search, and unsupported pages can be added manually.' };
  const item = obj(candidate);
  const resolveOffer = value => {
    const offer = obj(value);
    return typeof offer['@id'] === 'string' && nodesById.has(offer['@id']) ? { ...obj(nodesById.get(offer['@id'])), ...offer } : offer;
  };
  let offers = Array.isArray(item.offers) ? item.offers.map(resolveOffer) : item.offers ? [resolveOffer(item.offers)] : [];
  const currentOffers = offers.filter(offer => samePage(offer.url));
  if (currentOffers.length === 1) offers = currentOffers;
  const prices = offers.map(offer => amount(offer.price ?? obj(offer.priceSpecification).price)).filter(price => price !== null);
  const pricesAgree = prices.length && prices.every(price => price === prices[0]);
  const priceMeta = amount(meta(['product:price:amount', 'og:price:amount', 'price']));
  const selectorPrice = rule ? amount(selector(rule.price)) : null;
  const price = priceMeta ?? selectorPrice ?? (pricesAgree ? prices[0] : null);
  if (price === null) return { error: 'A single valid price could not be read. Select a variant and try again, or enter the item manually.' };
  const name = clean(item.name) || (rule ? selector(rule.name) : '') || meta(['og:title', 'twitter:title']);
  if (!name) return { error: 'A product name could not be read. Add this item manually.' };
  const offer = offers.find(offer => amount(offer.price ?? obj(offer.priceSpecification).price) === price) || {};
  const currencyRaw = clean(offer.priceCurrency || obj(offer.priceSpecification).priceCurrency || meta(['product:price:currency', 'og:price:currency']), 10).toUpperCase();
  const inferredCurrency = host.endsWith('amazon.ca') ? 'CAD' : host.endsWith('amazon.co.uk') ? 'GBP' : 'USD';
  const currency = /^[A-Z]{3}$/.test(currencyRaw) ? currencyRaw : inferredCurrency;
  const status = clean(offer.availability || item.availability).toLowerCase().split(/[\/#]/).at(-1);
  const availability = ['instock', 'limitedavailability'].includes(status) ? 'in_stock' : ['outofstock', 'soldout', 'discontinued'].includes(status) ? 'out_of_stock' : 'unknown';
  const conditionValue = clean(item.itemCondition || offer.itemCondition).toLowerCase().split(/[\/#]/).at(-1);
  const condition = ({newcondition:'new',usedcondition:'used',refurbishedcondition:'refurbished'})[conditionValue] || '';
  const imageValue = Array.isArray(item.image) ? item.image[0] : item.image;
  const image = absolute(typeof imageValue === 'string' ? imageValue : obj(imageValue).url) || absolute(meta(['og:image', 'twitter:image']));
  const brand = clean(typeof item.brand === 'string' ? item.brand : obj(item.brand).name, 100) || (rule ? selector(rule.brand) : '').replace(/^Visit the | Store$|^Brand: /gi, '');
  const variant = clean(item.variant || item.descriptionVariant, 200);
  const warnings = ['Review the detected product and variant before saving. Shipping, tax, and retailer terms must be confirmed separately.'];
  if (!currencyRaw) warnings.push(`Currency was not published; ${inferredCurrency} is assumed.`);
  if (!item.model && !item.gtin && !item.gtin8 && !item.gtin12 && !item.gtin13 && !item.gtin14) warnings.push('No reliable model or barcode was published; comparisons will need confirmation.');
  if (invalidMetadata) warnings.push('Some page metadata could not be read.');
  return { product: {
    name, brand, model: clean(item.model || item.mpn, 100),
    gtin: clean(item.gtin || item.gtin14 || item.gtin13 || item.gtin12 || item.gtin8, 30),
    variant, color: clean(item.color, 100), size: clean(typeof item.size === 'string' ? item.size : obj(item.size).name, 100),
    condition, currency, quantity: 1, notes: '', url: canonical, image,
    retailer: rule?.retailer || clean(meta(['og:site_name']), 100) || host,
    price, availability
  }, warning: warnings.join(' ') };
})();
