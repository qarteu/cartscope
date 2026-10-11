import {money,safeUrl,matchProducts,calculateCost,rankOffers,buildPaymentSchedule,priceInsight} from './lib/core.js';

const preview=!globalThis.chrome?.runtime?.id;
if(preview){const {initializePreview}=await import('./preview.js');await initializePreview();}
const requestedView=new URLSearchParams(location.search).get('view');
let demo=preview, state, view=['cart','compare','alerts','orders','settings','finance'].includes(requestedView)?requestedView:'cart', selected='', draft=null, editingOffer=null, editingOrder=null, toastTimer;
const app=document.querySelector('#app');
const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const attr=escape;
const currency=p=>p?.currency||'USD';
const amount=(n,c='USD')=>n===null||n===undefined||!Number.isFinite(Number(n))?'Unknown':money(Number(n),c);
const date=value=>value?new Date(value).toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Not checked';
const heading=(title,subtitle,action='')=>`<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`;
const button=(label,action,cls='secondary',id='')=>`<button class="${cls}" data-action="${action}" ${id?`data-id="${attr(id)}"`:''}>${label}</button>`;
const productImage=p=>{let url=safeUrl(p?.image)||(/^assets\/[a-z]+\.svg$/.test(p?.image)?p.image:'assets/product.svg');return `<img class="product-image" src="${attr(url)}" alt="${attr(p?.name||'Product')}" loading="lazy" referrerpolicy="no-referrer">`;};
const badge=(text,cls='')=>`<span class="badge ${cls}">${escape(text)}</span>`;
const field=(name,label,value='',type='text',options='')=>`<label class="field">${label}<input name="${name}" type="${type}" value="${attr(value??'')}" ${options}></label>`;
const select=(name,label,values,value)=>`<label class="field">${label}<select name="${name}">${values.map(([v,t])=>`<option value="${attr(v)}" ${v===value?'selected':''}>${escape(t)}</option>`).join('')}</select></label>`;
const alertBox=(message,cls='info')=>`<p class="notice ${cls}">${message}</p>`;
const empty=(title,body,actions)=>`<section class="empty-state"><div class="empty-icon">♧</div><h2>${title}</h2><p>${body}</p><div class="stack">${actions}</div></section>`;
const priorities=[['total','Lowest total cost'],['delivery','Fastest delivery'],['pickup','Local pickup'],['returns','Longest return window']];
const productOptions=()=>state.products.map(p=>[p.id,p.name]);
const offerFor=p=>state.offers.find(o=>o.productId===p.id&&o.retailer===p.retailer&&o.currency===p.currency);
const noteSource=o=>o.source==='sample'?'Illustrative sample':o.source==='captured'?'Observed on product page':'Entered by you';
const dataForm=form=>Object.fromEntries(new FormData(form));
const numberOrNull=v=>v===''||v==null?null:Number(v);
async function call(type,payload={}){
  const response=await chrome.runtime.sendMessage({type,demo,...payload});
  if(!response?.ok)throw new Error(response?.error||'The workspace could not be opened. Try reloading the extension.');
  state=response.state;return response.result;
}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,5000);}
function render(focus=false){
  if(!state)return;
  if(!selected||!state.products.some(p=>p.id===selected))selected=state.products.find(p=>p.savedOnly)?.id||state.products[0]?.id||'';
  document.querySelector('#demo-bar').hidden=!demo;
  document.querySelector('#exit-demo').textContent=preview?'Use empty workspace':'Exit sample';
  document.querySelector('#alert-count').textContent=state.alerts.filter(a=>!a.read).length||'';
  document.querySelectorAll('[data-view]').forEach(btn=>{if(btn.dataset.view===view)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');});
  const renderers={cart:renderCart,review:renderReview,compare:renderCompare,offer:renderOffer,alerts:renderAlerts,orders:renderOrders,order:renderOrder,settings:renderSettings,finance:renderFinance,watch:renderWatch};
  app.innerHTML=(renderers[view]||renderCart)();
  app.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.src='assets/product.svg';},{once:true}));
  if(focus){app.focus();window.scrollTo(0,0);}
}
function nav(next){view=next;render(true);}
function renderCart(){
  let total=0;let mixed=false;const cart=state.products.filter(p=>!p.savedOnly),saved=state.products.filter(p=>p.savedOnly);
  for(const p of cart){if(currency(p)==='USD')total+=(offerFor(p)?.price??p.price)*p.quantity;else mixed=true;}
  const budget=state.settings.budget,left=budget-total,percentage=budget?Math.min(total/budget*100,100):0;
  const card=p=>`<article class="product-card"><div class="product-thumb">${productImage(p)}</div><div class="product-details"><button class="text-button product-name" data-action="compare-product" data-id="${attr(p.id)}">${escape(p.name)}</button><p class="muted small">${escape([p.variant||p.color,p.size&&!p.variant?p.size:''].filter(Boolean).join(' · '))||'Variant not specified'}</p><div class="product-price-row"><strong>${amount(offerFor(p)?.price??p.price,currency(p))}</strong>${safeUrl(p.url)?`<a class="badge link" href="${attr(safeUrl(p.url))}" target="_blank" rel="noreferrer">${escape(p.retailer||'Retailer')} ↗</a>`:''}</div><div class="item-controls"><label>Qty <input aria-label="Quantity for ${attr(p.name)}" data-quantity="${attr(p.id)}" type="number" min="1" max="999" step="1" value="${p.quantity}"></label><button class="text-button" data-action="watch-product" data-id="${attr(p.id)}">${p.watch?.priceDrop||p.watch?.restock?'Watching':'Watch'}</button><button class="text-button" data-action="edit-product" data-id="${attr(p.id)}">Edit</button><button class="text-button danger" data-action="remove-product" data-id="${attr(p.id)}">Remove</button></div>${p.notes?`<p class="item-note">${escape(p.notes)}</p>`:''}</div></article>`;
  return heading('Your cart','All your finds. One place to keep track.')+`
    ${preview?alertBox('Browser preview · Try every flow with sample data. Install the extension to capture shopping pages.'):''}
    <section class="budget-card"><div><label for="budget">Shopping budget</label><input id="budget" name="budget" type="number" min="0" step="0.01" value="${budget}" aria-label="Shopping budget in USD"></div><progress value="${percentage}" max="100" aria-label="Budget used">${percentage}%</progress><div class="budget-caption"><span>${amount(total)} used</span><strong class="${left<0?'over-budget':''}">${amount(Math.abs(left))} ${left<0?'over':'left'}</strong></div></section>
    ${cart.length?alertBox(left<0?'You’re over your item-price budget. Review your finds before shopping.':'Nice finds. You’re within your item-price budget.',left<0?'warning':'success'):''}
    <div class="section-label"><strong>${cart.length} ${cart.length===1?'item':'items'} · ${new Set(cart.map(p=>p.retailer)).size} websites</strong>${button('+ Add items','add-product','text-button')}</div>
    ${!state.products.length?empty('A little perspective for your next purchase','Save a product from a shopping page, compare the costs, and keep your budget in view.',`${button('Capture this page ↗','capture','primary')}${button('Add manually','add-product')}${button('Explore sample workspace','demo','quiet')}`):`${cart.map(card).join('')}${saved.length?`<div class="section-label"><strong>Saved for later · ${saved.length}</strong></div>${saved.map(card).join('')}`:''}`}
    ${state.products.length?`<div class="inline-actions">${button('Capture this page','capture')}${demo?button('Reset sample','reset-demo','quiet'):''}</div>`:''}
    <p class="fine-print">Item prices only. Shipping and tax appear in Compare. ${mixed?'Non-USD items are excluded from this USD budget.':''}</p>
    ${cart.length?`<section class="checkout-card"><div class="total-row"><strong>Cart item total</strong><strong>${amount(total)}</strong></div>${button('Shop '+new Set(cart.map(p=>p.retailer)).size+' websites →','shop-cart','primary full')}<p class="fine-print center">Review the links, then check out on each retailer’s website.</p></section>`:''}`;
}
function renderReview(){
  const p=draft||{}; const editing=Boolean(p.id&&state.products.some(x=>x.id===p.id));
  const matches=!editing?state.products.filter(x=>{const match=matchProducts(x,p);return match.level==='exact'||(safeUrl(p.url)&&safeUrl(x.url)===safeUrl(p.url)&&match.level!=='mismatch');}):[];
  return heading(editing?'Edit your find':'Review item','A good find. Make it yours to remember.')+`${draft?.warning?alertBox(escape(draft.warning),'warning'):alertBox('Review the product, variant, and price before saving.','success')}
    ${p.name?`<section class="review-card"><div class="hero-image">${productImage(p)}</div><div class="review-summary"><strong>${escape(p.name)}</strong><div class="total-row"><strong>${amount(p.price,currency(p))}</strong>${badge(p.retailer||'Retailer')}</div></div></section>`:''}
    <form id="product-form" class="stack">
      ${field('name','Product name',p.name,'text','required maxlength="300"')}
      <div class="grid-2">${field('price','Item price',p.price,'number','required min="0" step="0.01"')}${select('currency','Currency',[['USD','USD'],['EUR','EUR'],['GBP','GBP'],['CAD','CAD'],['AUD','AUD'],['JPY','JPY'],['INR','INR']],p.currency||'USD')}</div>
      ${field('retailer','Retailer',p.retailer,'text','required maxlength="100"')}
      ${field('url','Product link',p.url,'url','placeholder="https://…"')}
      ${field('image','Image link (optional)',safeUrl(p.image),'url','placeholder="https://…"')}
      <details ${!p.model?'open':''}><summary>Product identity & variant</summary><div class="stack details-body"><div class="grid-2">${field('brand','Brand',p.brand)}${field('model','Model',p.model)}</div>${field('gtin','GTIN / UPC (when known)',p.gtin)}<div class="grid-2">${field('color','Color',p.color)}${field('size','Size',p.size)}</div>${field('variant','Other variant',p.variant)}${select('condition','Condition',[['','Not specified'],['new','New'],['used','Used'],['refurbished','Refurbished']],p.condition||'')}</div></details>
      <div class="grid-2">${field('shipping','Shipping (blank = unknown)',p.shipping,'number','min="0" step="0.01"')}${field('quantity','Quantity',p.quantity||1,'number','required min="1" max="999" step="1"')}</div>
      ${select('availability','Availability',[['unknown','Not checked'],['in_stock','In stock'],['out_of_stock','Out of stock']],p.availability||'unknown')}
      ${matches.length?select('attachTo','Same item already saved?',[['','Save as a new product'],...matches.map(x=>[x.id,'Add this store’s offer to '+x.name])],matches[0].id):''}
      <label class="field">Notes <span class="optional">(optional)</span><textarea name="notes" maxlength="1000" placeholder="Add a note about this item.">${escape(p.notes)}</textarea></label>
      <label class="checkbox"><input type="checkbox" name="savedOnly" ${p.savedOnly?'checked':''}> Save for later (exclude from cart total)</label>
      <div id="form-error" role="alert"></div><button class="primary full" type="submit">${editing?'Save changes':'♧ Save item'}</button>${button('Cancel','cancel','quiet')}
    </form><p class="fine-print center">${p.source==='captured'?'Only public product details from this page are captured.':'Manual product details stay on this device.'}</p>`;
}
function renderCompare(){
  const p=state.products.find(x=>x.id===selected);
  if(!p)return heading('Compare prices','Find your best total value.')+empty('Save your first find','Capture a product or enter its details to start comparing offers.',button('Add an item','add-product','primary'));
  const offers=rankOffers(state.offers.filter(o=>o.productId===p.id),p,state.settings,state.settings.priority);
  const exact=offers.filter(o=>o.match.level==='exact');
  const preferenceKnown=o=>state.settings.priority==='delivery'?o.deliveryDays!==null&&o.deliveryDays!==undefined:state.settings.priority==='returns'?o.returnDays!==null&&o.returnDays!==undefined:state.settings.priority==='pickup'?o.pickup===true:true;
  const best=exact.find(o=>o.availability!=='out_of_stock'&&o.cost.total!==null&&preferenceKnown(o));
  const original=exact.find(o=>o.retailer===p.retailer);const savings=best&&original?.cost.total!=null?original.cost.total-best.cost.total:0;
  const card=(o,i)=>`<article class="offer-card ${o===best?'best-offer':''}"><div class="offer-heading"><strong>${escape(o.retailer)}</strong>${o===best?badge('Best for you','green'):badge(o.match.level==='exact'?'Matched':'Check variant',o.match.level==='exact'?'':'amber')}<strong class="offer-total">${amount(o.cost.total,currency(o))}</strong></div><p class="small muted">${escape(noteSource(o))} · ${date(o.checkedAt)}</p><div class="offer-costs"><span>Item ${amount(o.price,currency(o))}</span><span>Shipping ${amount(o.shipping,currency(o))}</span><span>Tax ${amount(o.cost.tax,currency(o))}${o.tax==null?' (est.)':''}</span><span>Membership ${amount(o.cost.breakdown.membership,currency(o))}</span>${o.discount?`<span>Discount −${amount(o.discount,currency(o))}</span>`:''}${o.cashback?`<span>Cashback −${amount(o.cashback,currency(o))}*</span>`:''}</div>
      ${o.cost.missing.length?alertBox('Total incomplete: '+escape(o.cost.missing.join(', ')),'warning'):''}
      <div class="offer-info"><span>${escape(o.color||o.variant||'Variant unknown')} · ${o.availability==='in_stock'?'In stock':o.availability==='out_of_stock'?'Out of stock':'Stock unknown'}</span><span>${o.deliveryDays==null?'Delivery unknown':o.deliveryDays+' day delivery'}</span><span>${o.returnDays==null?'Returns unknown':o.returnDays+' day returns'}</span>${o.pickup?`<span>Pickup · ${escape(o.location||'Confirm store')}</span>`:''}</div>
      <details><summary>Why this rank & cost breakdown</summary><p class="small">${escape(o.explanation)} ${escape(o.match.reason)}</p><p class="small">Item + shipping + tax + membership − discount = payable now. Cashback is shown separately and may arrive later.</p><p class="small"><strong>Payable now: ${amount(o.cost.payable,currency(o))}</strong> · Net after cashback: ${amount(o.cost.total,currency(o))}</p></details>
      <div class="offer-actions">${safeUrl(o.url)?`<a class="text-button" href="${attr(safeUrl(o.url))}" target="_blank" rel="noreferrer">View offer ↗</a>`:''}${button('Edit','edit-offer','text-button',o.id)}${button('Remove','remove-offer','text-button danger',o.id)}</div></article>`;
  const history=state.history.filter(h=>h.productId===p.id&&h.currency===p.currency&&h.retailer===p.retailer).sort((a,b)=>Date.parse(a.checkedAt)-Date.parse(b.checkedAt));
  const insight=priceInsight(history);
  return heading('Compare prices','Same product. A clearer decision.')+`${select('selectedProduct','Your saved finds',productOptions(),selected)}
    <section class="review-card"><div class="hero-image compact">${productImage(p)}</div><div class="review-summary"><strong>${escape(p.name)}</strong><p class="muted small">${escape([p.brand,p.model,p.color,p.size].filter(Boolean).join(' · '))||'Add a model or identifier for stronger matches.'}</p><div class="total-row"><span>Your find: ${amount(p.price,currency(p))}</span>${badge(p.retailer||'Saved item')}</div></div></section>
    ${alertBox(demo?'Sample offers · search links, illustrative prices, and sample stock.':exact.length?'Matched using the identifiers and variants you supplied. Confirm checkout costs with the retailer.':'No exact matches yet. Add brand, model, and variant details, or use a shared GTIN.','info')}
    ${select('priority','Rank offers by',priorities,state.settings.priority)}${state.settings.priority!=='total'&&!best?alertBox('No matched, cost-complete offer has the information needed for this preference. Add delivery, return, or pickup details, or choose lowest total.','warning'):''}<div class="section-label"><strong>${offers.length} ${offers.length===1?'offer':'offers'} · ${exact.length} matched</strong>${button('+ Add offer','add-offer','text-button')}</div><p class="fine-print">Totals are for quantity ${p.quantity}. Item prices below are per unit.</p>
    ${offers.length?offers.map(card).join(''):empty('One product, more possibilities','Visit another store and capture the same product, or add an offer you have checked.',button('Add offer','add-offer','primary'))}
    <p class="fine-print">Tax uses your ${state.settings.taxRate}% estimate on item after discount plus shipping. Unknown shipping leaves the total incomplete. ${demo?'Illustrative offers, not live prices. ':''}*Cashback requires eligibility and is not an instant checkout discount. No affiliate links or paid ranking.</p>
    <section class="card"><div class="section-label"><strong>Observed price history</strong>${badge(p.retailer||'Retailer')}</div>${history.length?`<div class="history-chart">${history.slice(-12).map(h=>`<div class="history-bar"><span style="height:${Math.max(5,Math.min(70,h.price/Math.max(...history.map(x=>x.price),1)*70))}px" title="${attr(amount(h.price,currency(p)))}"></span><small>${amount(h.price,currency(p))}</small></div>`).join('')}</div><p class="small">${escape(insight.label)} · Lowest observed ${amount(insight.min,currency(p))}</p><p class="fine-print">${history.length} observations from your saved captures or edits. This is not a complete market price history.</p>`:'<p class="muted">Capture or update an offer to start a history. No historical prices are invented.</p>'}</section>
    <div class="inline-actions">${button('Payment planner','finance')}${button('Set alerts','watch-product','secondary',p.id)}</div>
    ${best?`<section class="checkout-card"><div class="total-row"><span>${state.settings.priority==='total'?'Best matched total':'Best for your selected priority'}</span><strong class="green-text">${savings>0?'Save '+amount(savings,currency(p)):amount(best.cost.total,currency(p))}</strong></div>${safeUrl(best.url)?`<a class="primary full" href="${attr(safeUrl(best.url))}" target="_blank" rel="noreferrer">Shop ${escape(best.retailer)} · ${amount(best.cost.payable,currency(p))} ↗</a>`:''}<p class="fine-print center">You’ll check out on the retailer’s website. Verify stock and final costs.</p></section>`:''}`;
}
function renderOffer(){
  const p=state.products.find(x=>x.id===selected);if(!p)return renderCompare();
  const o=editingOffer||{...p,price:'',retailer:'',url:'',shipping:'',tax:'',membership:0,discount:0,cashback:0,availability:'unknown',deliveryDays:'',returnDays:'',pickup:false,location:''};
  return heading(editingOffer?'Edit offer':'Add a checked offer','Enter the details you found for this exact item.')+alertBox('Only compare the same model, size, color, and condition. Enter unknown costs later; they will stay unknown.')+`
    <form id="offer-form" class="stack">${field('retailer','Retailer',o.retailer,'text','required maxlength="100"')}${field('url','Offer link',o.url,'url','required')}
    <div class="grid-2">${field('price','Item price',o.price,'number','required min="0" step="0.01"')}${select('currency','Currency',[['USD','USD'],['EUR','EUR'],['GBP','GBP'],['CAD','CAD'],['AUD','AUD'],['JPY','JPY'],['INR','INR']],o.currency||'USD')}</div>
    <div class="grid-2">${field('shipping','Shipping (blank = unknown)',o.shipping,'number','min="0" step="0.01"')}${field('tax','Tax amount (blank = estimated)',o.tax,'number','min="0" step="0.01"')}</div>
    <div class="grid-2">${field('membership','Required membership cost',o.membership,'number','min="0" step="0.01"')}${field('discount','Verified instant discount',o.discount,'number','min="0" step="0.01"')}</div>
    ${field('cashback','Eligible cashback (received later)',o.cashback,'number','min="0" step="0.01"')}
    <details><summary>Model & variant for matching</summary><div class="stack details-body"><div class="grid-2">${field('brand','Brand',o.brand)}${field('model','Model',o.model)}</div>${field('gtin','GTIN / UPC',o.gtin)}<div class="grid-2">${field('color','Color',o.color)}${field('size','Size',o.size)}</div>${field('variant','Other variant',o.variant)}${select('condition','Condition',[['','Not specified'],['new','New'],['used','Used'],['refurbished','Refurbished']],o.condition||'')}</div></details>
    ${select('availability','Availability',[['unknown','Not checked'],['in_stock','In stock'],['out_of_stock','Out of stock']],o.availability||'unknown')}
    <div class="grid-2">${field('deliveryDays','Delivery days (blank = unknown)',o.deliveryDays,'number','min="0" max="365" step="1"')}${field('returnDays','Return window in days',o.returnDays,'number','min="0" max="3650" step="1"')}</div>
    <label class="checkbox"><input name="pickup" type="checkbox" ${o.pickup?'checked':''}> Local pickup available (checked by me)</label>${field('location','Pickup location / store',o.location)}
    <label class="checkbox"><input type="checkbox" name="confirmed" required> I checked that this offer is for the same product and variant.</label>
    <div id="form-error" role="alert"></div><button type="submit" class="primary full">Save offer</button>${button('Cancel','compare','quiet')}</form>`;
}
function renderWatch(){
  const p=state.products.find(x=>x.id===selected);if(!p)return renderCart();const w=p.watch||{};
  return heading('Watch this find','A little patience can go a long way.')+`<section class="card"><strong>${escape(p.name)}</strong><p class="small muted">${escape(p.variant||p.color||'')}</p></section>${alertBox('Alerts evaluate when you capture or update the same store’s offer again. The Alpha does not check prices in the background.')}<form id="watch-form" class="stack"><label class="checkbox"><input type="checkbox" name="priceDrop" ${w.priceDrop?'checked':''}> Notify me when the observed item price drops</label><label class="checkbox"><input type="checkbox" name="restock" ${w.restock?'checked':''}> Notify me when observed stock returns</label>${field('targetPrice','Optional target item price',w.targetPrice,'number','min="0" step="0.01"')}<div id="form-error" role="alert"></div><button class="primary full" type="submit">Save watch preferences</button>${button('Cancel','compare','quiet')}</form>`;
}
function renderAlerts(){
  const cards=state.alerts.map(a=>{const p=state.products.find(x=>x.id===a.productId);return `<article class="card alert-card"><div class="section-label">${badge(a.type==='restock'?'Restock alert':'Price alert')}<span class="small muted">${date(a.createdAt)}</span></div><h2>${escape(a.title)}</h2><p class="muted">${escape(a.message)}</p>${p?`<div class="alert-product"><div class="hero-image">${productImage(p)}</div><div class="review-summary"><strong>${escape(p.name)}</strong><p>${amount(p.price,currency(p))}</p></div></div>`:''}<div class="inline-actions">${p?button('View saved item','compare-product','primary',p.id):''}${button('Dismiss','dismiss-alert','quiet',a.id)}</div>${a.source==='sample'?'<p class="fine-print">Example notification. Confirm price and availability with the retailer.</p>':''}</article>`;});
  return heading('Notifications','Good news for your saved finds.',button('Mark all read','read-alerts','text-button'))+alertBox('Price and restock checks happen when you revisit and capture a watched offer. Turn on desktop notifications in Settings if you want them.')+(cards.length?cards.join(''):empty('Nothing new yet','Save a find, set a watch, then capture it again when its price or availability changes.',button('Back to saved items','cart','primary')));
}
const statuses=[['preparing','Preparing to ship'],['in_transit','In transit'],['delivered','Delivered'],['cancelled','Cancelled']];
function renderOrders(){
  const cards=state.orders.map(o=>`<article class="card order-card"><div class="section-label"><strong class="blue-text">${escape(o.retailer)}</strong>${badge(statuses.find(x=>x[0]===o.status)?.[1]||o.status,o.status==='delivered'?'green':o.status==='preparing'?'amber':'')}</div><div class="order-product"><div class="product-thumb">${productImage(o)}</div><div><strong>${escape(o.name)}</strong><p class="small muted">Qty ${o.quantity}</p></div></div><div class="order-progress"><span style="width:${({preparing:30,in_transit:65,delivered:100,cancelled:0})[o.status]}%"></span></div><strong class="small">${o.expectedAt?'Expected '+escape(o.expectedAt):'Delivery date not entered'}</strong><p class="small muted">Ordered ${escape(o.orderedAt||'date not entered')}</p>${o.trackingNumber?`<div class="tracking"><span>Tracking number</span><strong>${escape(o.trackingNumber)}</strong>${safeUrl(o.trackingUrl)?`<a href="${attr(safeUrl(o.trackingUrl))}" target="_blank" rel="noreferrer">Open carrier ↗</a>`:''}</div>`:''}${o.notes?`<p class="small muted">${escape(o.notes)}</p>`:''}<div class="inline-actions">${button('Update order','edit-order','text-button',o.id)}${button('Remove','remove-order','text-button danger',o.id)}</div></article>`);
  return heading('Your orders','From checkout to your doorstep.',button('+ Add','add-order','text-button'))+alertBox('Order status and tracking are entered by you. Check with the retailer or carrier for live updates.')+(cards.length?`<div class="section-label"><strong>${state.orders.length} orders · ${new Set(state.orders.map(o=>o.retailer)).size} retailers</strong></div>${cards.join('')}`:empty('Keep purchases in perspective','After checking out with a retailer, add your order and tracking details here.',button('Add an order','add-order','primary')))+button('Back to saved items','cart','secondary full');
}
function renderOrder(){
  if(!state.products.length)return heading('Add an order','Keep your delivery details together.')+empty('Save a product first','Orders are linked to products in your cart.',button('Add a product','add-product','primary'));
  const o=editingOrder||{productId:selected,quantity:1,status:'preparing',orderedAt:new Date().toISOString().slice(0,10)};
  return heading(editingOrder?'Update order':'Add an order','Enter the details from your retailer confirmation.')+`<form id="order-form" class="stack">${select('productId','Product',productOptions(),o.productId)}${field('retailer','Retailer',o.retailer||state.products.find(x=>x.id===o.productId)?.retailer)}<div class="grid-2">${field('quantity','Quantity',o.quantity,'number','required min="1" max="999" step="1"')}${select('status','Order status',statuses,o.status)}</div><div class="grid-2">${field('orderedAt','Order date',o.orderedAt,'date')}${field('expectedAt','Expected delivery',o.expectedAt,'date')}</div>${field('trackingNumber','Tracking number',o.trackingNumber)}${field('trackingUrl','Carrier tracking link',o.trackingUrl,'url')}<label class="field">Notes<textarea name="notes">${escape(o.notes)}</textarea></label><div id="form-error" role="alert"></div><button class="primary full" type="submit">Save order</button>${button('Cancel','orders','quiet')}</form>`;
}
function renderFinance(){
  const p=state.products.find(x=>x.id===selected);const best=p?rankOffers(state.offers.filter(o=>o.productId===p.id),p,state.settings,'total').find(o=>o.match.level==='exact'&&o.cost.payable!=null&&o.availability!=='out_of_stock'):null;
  return heading('Payment planner','See the full obligation before each installment.')+alertBox('Enter the amounts and schedule from the provider’s terms. This calculator uses a total interest amount, not an APR. It does not offer financing or evaluate eligibility.')+`<form id="finance-form" class="stack"><div class="grid-2">${field('principal','Purchase amount',best?.cost.payable??(p?p.price*p.quantity:''),'number','required min="0" step="0.01"')}${field('interest','Total interest amount',0,'number','required min="0" step="0.01"')}</div><div class="grid-2">${field('fees','Other mandatory fees',0,'number','required min="0" step="0.01"')}${field('payments','Number of payments',4,'number','required min="1" max="120" step="1"')}</div><div class="grid-2">${field('intervalDays','Days between payments',14,'number','required min="1" max="365" step="1"')}${field('startDate','First payment date',new Date().toISOString().slice(0,10),'date','required')}</div>${field('lateFee','Stated late fee (per missed payment)',0,'number','min="0" step="0.01"')}<div id="form-error" role="alert"></div><button class="primary full" type="submit">Calculate total & schedule</button></form><div id="finance-result" aria-live="polite"></div><p class="fine-print">Amounts are in ${escape(currency(p))}. Calendar dates assume fixed day intervals. Confirm the actual contract’s due dates, interest, fees, returns, and late-payment rules.</p>${button('Back to comparison','compare','quiet full')}`;
}
function renderSettings(){
  const s=state.settings;
  return heading('Make it yours','Your priorities, your data, your decision.')+`<form id="settings-form" class="stack"><section class="card"><h2>Shopping preferences</h2><div class="grid-2">${field('taxRate','Estimated tax rate (%)',s.taxRate,'number','required min="0" max="30" step="0.01"')}${field('budget','Item budget (USD)',s.budget,'number','required min="0" step="0.01"')}</div>${select('priority','Default ranking',priorities,s.priority)}<p class="fine-print">Tax is a user estimate. Final checkout may tax items, shipping, and fees differently.</p></section><section class="card"><h2>Notifications</h2><label class="checkbox"><input type="checkbox" id="desktop-notifications" name="notificationsEnabled" ${s.notificationsEnabled?'checked':''} ${preview?'disabled':''}> Optional desktop price / restock alerts</label><p class="fine-print">${preview?'Desktop alerts are available in the installed extension.':'Chrome will ask for notification permission only when you enable this.'} Watches run on your next capture or offer update.</p></section><div id="form-error" role="alert"></div><button type="submit" class="primary full">Save preferences</button></form>
    <section class="card"><h2>Your data</h2><p class="muted small">Products, notes, observations, and orders are stored ${preview?'in this browser':'in Chrome storage'} on this device. No account, analytics, cloud, or affiliate tracking.</p><div class="stack">${button('Export backup (.json)','export')}
    <label class="secondary file-label">Import a backup<input id="import-file" type="file" accept="application/json,.json"></label>${button(demo?'Reset sample workspace':'Delete all workspace data','reset','danger-button')}</div></section>
    <section class="card"><h2>Alpha feedback</h2><p class="small muted">Tell us what worked and what needs attention.</p><a class="secondary full" href="https://github.com/qarteu/cartscope/issues/new?template=alpha-feedback.yml" target="_blank" rel="noreferrer">Give ratings & written feedback ↗</a><a class="text-button" href="https://github.com/qarteu/cartscope/blob/main/docs/SPRINT_BOARD.md" target="_blank" rel="noreferrer">Sprint backlog & user stories ↗</a></section>
    <section class="card"><h2>About CartScope</h2><p class="small">Alpha 0.1.0 · Built from the UniCart prototype. Online / nearby offers are observed or entered by you; sample data is labeled. No automatic checkout, live retailer feed, carrier integration, or complete market history.</p><div class="stack">${button(demo?'Open real workspace':'Explore sample workspace',demo?'exit-demo':'demo','quiet')}${button('Back to cart','cart','quiet')}</div></section>`;
}
async function action(name,id){
  switch(name){
    case 'cart':case 'compare':case 'orders':case 'settings':case 'finance':nav(name);break;
    case 'cancel':draft=null;nav('cart');break;
    case 'add-product':draft={currency:'USD',quantity:1,source:demo?'sample':'manual'};nav('review');break;
    case 'edit-product':{const p=state.products.find(p=>p.id===id);draft={...p,...offerFor(p),id:p.id,notes:p.notes,quantity:p.quantity,savedOnly:p.savedOnly};nav('review');break;}
    case 'capture':{if(preview){toast('Install the Chrome extension to capture a product page. You can add items manually here.');break;}const result=await call('capture');draft={...result.product,warning:result.warning,source:'captured'};nav('review');break;}
    case 'demo':demo=true;await call('getState');nav('cart');toast('Sample workspace opened. Illustrative prices only.');break;
    case 'exit-demo':demo=false;await call('getState');nav('cart');break;
    case 'reset-demo':await call('reset');render();toast('Sample workspace reset.');break;
    case 'remove-product':if(confirm('Remove this saved item and its offers, history, alerts, and orders?')){await call('deleteProduct',{id});render();toast('Item removed.');}break;
    case 'compare-product':selected=id;nav('compare');break;
    case 'watch-product':selected=id;nav('watch');break;
    case 'add-offer':editingOffer=null;nav('offer');break;
    case 'edit-offer':editingOffer=state.offers.find(o=>o.id===id);selected=editingOffer.productId;nav('offer');break;
    case 'remove-offer':if(confirm('Remove this offer? Saved price observations will remain.')){await call('deleteOffer',{id});render();}break;
    case 'read-alerts':await call('readAlerts');render();break;
    case 'dismiss-alert':await call('deleteAlert',{id});render();break;
    case 'add-order':editingOrder=null;nav('order');break;
    case 'edit-order':editingOrder=state.orders.find(o=>o.id===id);nav('order');break;
    case 'remove-order':if(confirm('Remove this order?')){await call('deleteOrder',{id});render();}break;
    case 'shop-cart':{
      const urls=[...new Set(state.products.filter(p=>!p.savedOnly).map(p=>safeUrl(p.url)).filter(Boolean))];
      if(!urls.length){toast('Add retailer links to your items first.');break;}
      app.innerHTML=heading('Ready to shop','Open each retailer and review final checkout costs.')+`<div class="stack">${urls.map(url=>`<a class="primary full" href="${attr(url)}" target="_blank" rel="noreferrer">Shop ${escape(new URL(url).hostname)} ↗</a>`).join('')}</div>${button('Back to cart','cart','quiet full')}`;break;
    }
    case 'export':{
      const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`cartscope-${demo?'sample-':''}backup.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup downloaded.');break;
    }
    case 'reset':if(confirm(demo?'Reset all sample changes?':'Delete every saved product, offer, order, alert, history, and preference in this workspace? Export a backup first if you need it.')){await call('reset');render();toast(demo?'Sample restored.':'Workspace cleared.');}break;
  }
}
document.addEventListener('click',async event=>{
  const navButton=event.target.closest('[data-view]');if(navButton){nav(navButton.dataset.view);return;}
  if(event.target.closest('#settings-shortcut')){nav('settings');return;}
  if(event.target.closest('#exit-demo')){await action('exit-demo');return;}
  if(event.target.closest('.brand')){event.preventDefault();nav('cart');return;}
  const element=event.target.closest('[data-action]');if(!element)return;
  element.disabled=true;try{await action(element.dataset.action,element.dataset.id);}catch(error){toast(error.message);}finally{element.disabled=false;}
});
document.addEventListener('change',async event=>{
  const el=event.target;
  try{
    if(el.name==='selectedProduct'){selected=el.value;render();}
    if(el.name==='priority'&&view==='compare'){await call('saveSettings',{settings:{...state.settings,priority:el.value}});render();}
    if(el.dataset.quantity){await call('updateProduct',{id:el.dataset.quantity,quantity:Number(el.value)});render();}
    if(el.id==='budget'){await call('saveSettings',{settings:{...state.settings,budget:Number(el.value)}});render();}
    if(el.id==='desktop-notifications'&&el.checked){const granted=await chrome.permissions.request({permissions:['notifications']});if(!granted){el.checked=false;toast('Desktop notifications were not enabled. In-app alerts still work.');}}
    if(el.id==='import-file'&&el.files[0]){
      if(el.files[0].size>5*1024*1024)throw new Error('Choose a backup smaller than 5 MB.');
      const input=JSON.parse(await el.files[0].text());if(confirm('Replace this workspace with the selected backup? Export your current data first if you need it.')){await call('import',{state:input});render();toast('Backup imported. Historical alerts are not replayed.');}
    }
  }catch(error){toast(error.message);if(el.dataset.quantity||el.id==='budget')render();}
});
document.addEventListener('submit',async event=>{
  event.preventDefault();const form=event.target;if(!form.id)return;const values=dataForm(form),submit=form.querySelector('[type="submit"]');submit.disabled=true;
  try{
    if(form.id==='product-form'){
      const product={...draft,...values,image:values.image||draft?.image||'',price:Number(values.price),quantity:Number(values.quantity),shipping:numberOrNull(values.shipping),tax:draft?.tax??null,savedOnly:form.elements.savedOnly.checked};
      const result=await call('saveProduct',{product,attachTo:values.attachTo||'',source:demo?'sample':draft?.source||'manual'});selected=result.productId;draft=null;nav('cart');toast('Item saved to your collection.');
    }
    if(form.id==='offer-form'){
      const p=state.products.find(x=>x.id===selected);const offer={...p,...editingOffer,...values,id:editingOffer?.id||undefined,productId:selected,pickup:form.elements.pickup.checked};
      for(const key of ['price','shipping','tax','membership','discount','cashback','deliveryDays','returnDays'])offer[key]=numberOrNull(values[key]);
      await call('saveOffer',{offer});editingOffer=null;nav('compare');toast('Offer saved. Comparison updated.');
    }
    if(form.id==='watch-form'){await call('updateProduct',{id:selected,watch:{priceDrop:form.elements.priceDrop.checked,restock:form.elements.restock.checked,targetPrice:numberOrNull(values.targetPrice)}});nav('compare');toast('Watch preferences saved.');}
    if(form.id==='order-form'){await call('saveOrder',{order:{...editingOrder,...values,id:editingOrder?.id||undefined,quantity:Number(values.quantity)}});editingOrder=null;nav('orders');toast('Order saved.');}
    if(form.id==='settings-form'){await call('saveSettings',{settings:{...values,taxRate:Number(values.taxRate),budget:Number(values.budget),notificationsEnabled:form.elements.notificationsEnabled.checked}});render();toast('Preferences saved.');}
    if(form.id==='finance-form'){
      const schedule=buildPaymentSchedule({...values,principal:Number(values.principal),interest:Number(values.interest),fees:Number(values.fees),payments:Number(values.payments),intervalDays:Number(values.intervalDays),lateFee:Number(values.lateFee)});
      const p=state.products.find(x=>x.id===selected);document.querySelector('#finance-result').innerHTML=`<section class="card finance-card"><p class="eyebrow">TOTAL AMOUNT OWED</p><strong class="finance-total">${amount(schedule.total,currency(p))}</strong><p class="small muted">Includes ${amount(Number(values.interest)+Number(values.fees),currency(p))} in interest and fees.</p><table><thead><tr><th>Payment</th><th>Due date</th><th>Amount</th></tr></thead><tbody>${schedule.payments.map((row,i)=>`<tr><td>${i+1}</td><td>${escape(row.date)}</td><td>${amount(row.amount,currency(p))}</td></tr>`).join('')}</tbody></table><p class="notice warning">Stated late fee: ${amount(Number(values.lateFee),currency(p))} per missed payment. Late fees are not included in the scheduled total.</p></section>`;
    }
  }catch(error){const errorEl=form.querySelector('#form-error');if(errorEl){errorEl.textContent=error.message;errorEl.className='notice warning';}else toast(error.message);}finally{submit.disabled=false;}
});
await call('getState');render();
