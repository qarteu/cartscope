import {normalizeProduct, safeUrl, deriveAlert} from './lib/core.js';
import {emptyState, sampleState, defaults} from './lib/samples.js';

// Native panel toggling skips Chrome's activeTab grant. Handle the toolbar
// action normally, then open the panel while the click gesture is active.
chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:false}).catch(console.error);
chrome.action.onClicked.addListener(tab=>{
  if(Number.isInteger(tab.windowId))chrome.sidePanel.open({windowId:tab.windowId}).catch(console.error);
});
chrome.runtime.onInstalled.addListener(async()=>{
  await chrome.sidePanel.setPanelBehavior({openPanelOnActionClick:false});
  await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
});
let queue=Promise.resolve();
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const text=(v,max=1000)=>String(v??'').slice(0,max);
const numeric=(v,min=0,max=1000000,nullable=false)=>{
  if(nullable&&(v===null||v===undefined||v===''))return null;
  const n=Number(v); if(!Number.isFinite(n)||n<min||n>max)throw new Error('Enter a valid number between '+min+' and '+max+'.'); return n;
};
const whole=(v,min=1,max=999)=>{const n=numeric(v,min,max);if(!Number.isInteger(n))throw new Error('Enter a whole number between '+min+' and '+max+'.');return n;};
const validId=v=>typeof v==='string'&&/^[A-Za-z0-9._-]{1,100}$/.test(v);
const imageUrl=v=>safeUrl(v)||(['assets/headphones.svg','assets/shoe.svg','assets/backpack.svg','assets/product.svg'].includes(v)?v:'');
function cleanOffer(raw,productId){
  const product=normalizeProduct(raw);
  return {...product,id:text(raw.id||id(),100),productId,retailer:text(raw.retailer,100)||'Other retailer',url:safeUrl(raw.url),image:imageUrl(raw.image),
    price:numeric(raw.price), shipping:numeric(raw.shipping,0,1000000,true),tax:numeric(raw.tax,0,1000000,true),membership:raw.membership===undefined?0:numeric(raw.membership,0,1000000,true),discount:numeric(raw.discount??0),cashback:numeric(raw.cashback??0),
    deliveryDays:numeric(raw.deliveryDays,0,365,true),returnDays:numeric(raw.returnDays,0,3650,true),pickup:raw.pickup===true,location:text(raw.location,200),
    availability:['in_stock','out_of_stock','unknown'].includes(raw.availability)?raw.availability:'unknown',checkedAt:now(),source:raw.source==='captured'?'captured':raw.source==='sample'?'sample':'manual'};
}
function cleanSettings(raw,current=defaults){return {...current,
  taxRate:numeric(raw.taxRate??current.taxRate,0,30),budget:numeric(raw.budget??current.budget,0,1000000),currency:'USD',
  priority:['total','delivery','returns','pickup'].includes(raw.priority)?raw.priority:current.priority,
  notificationsEnabled:raw.notificationsEnabled===true};}
function cleanWatch(raw){return {priceDrop:raw?.priceDrop===true,restock:raw?.restock===true,targetPrice:numeric(raw?.targetPrice,0,1000000,true)};}
async function sendNotification(alert,state,demo){
  if(demo||!state.settings.notificationsEnabled)return;
  if(await chrome.permissions.contains({permissions:['notifications']})){
    await chrome.notifications.create(alert.id,{type:'basic',iconUrl:'assets/icon128.png',title:'CartScope · '+alert.title,message:alert.message}).catch(console.error);
  }
}
async function recordObservation(state,offer,oldOffer,demo){
  state.history.push({productId:offer.productId,offerId:offer.id,retailer:offer.retailer,price:offer.price,currency:offer.currency,checkedAt:offer.checkedAt,source:offer.source});
  state.history=state.history.slice(-5000);
  const product=state.products.find(p=>p.id===offer.productId);
  if(oldOffer&&product){
    const event=deriveAlert(oldOffer,offer,product.watch||{});
    if(event){const alert={...event,id:id(),productId:offer.productId,read:false,createdAt:now(),source:offer.source};state.alerts.unshift(alert);state.alerts=state.alerts.slice(0,200);await sendNotification(alert,state,demo);}
  }
}
function cleanOrder(raw,state){
  const product=state.products.find(p=>p.id===raw.productId);
  if(!product)throw new Error('Choose a saved product for the order.');
  if(!['preparing','in_transit','delivered','cancelled'].includes(raw.status))throw new Error('Choose an order status.');
  const validDate=v=>{if(!v)return '';const d=new Date(v+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==v)throw new Error('Enter a valid date.');return v;};
  return {id:text(raw.id||id(),100),productId:product.id,name:product.name,image:product.image,retailer:text(raw.retailer,100)||product.retailer,quantity:whole(raw.quantity??1),status:raw.status,orderedAt:validDate(raw.orderedAt),expectedAt:validDate(raw.expectedAt),trackingNumber:text(raw.trackingNumber,200),trackingUrl:safeUrl(raw.trackingUrl),notes:text(raw.notes)};
}
async function handle(message){
  if(!message||typeof message!=='object')throw new Error('Invalid request.');
  const demo=message.demo===true, key=demo?'sampleWorkspace':'workspace';
  let state=(await chrome.storage.local.get(key))[key]||(demo?sampleState():emptyState());
  let result=null,changed=true;
  switch(message.type){
    case 'getState':changed=false;break;
    case 'capture':{
      changed=false;const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
      if(!tab?.id)throw new Error('Open a product page and click the CartScope toolbar icon first.');
      if(tab.url&&!/^https?:/.test(tab.url))throw new Error('Open a product page on a website, then click the CartScope toolbar icon. Chrome internal pages cannot be read.');
      try{const results=await chrome.scripting.executeScript({target:{tabId:tab.id},files:['extract.js']});result=results[0]?.result;if(result?.error)throw new Error(result.error);if(!result?.product)throw new Error('No product detected. Use Add manually to save it.');}
      catch(error){throw new Error(error.message?.includes('Cannot access')?'Click the CartScope toolbar icon on this product page to allow access, then try Capture again.':error.message);}
      break;
    }
    case 'saveProduct':{
      const raw=message.product,normalized=normalizeProduct(raw);
      const productId=message.attachTo||raw.id||id();
      const existing=state.products.find(p=>p.id===productId);
      if(message.attachTo&&!existing)throw new Error('The selected saved item no longer exists.');
      const p={...normalized,id:productId,image:imageUrl(raw.image),url:safeUrl(raw.url),notes:text(raw.notes),quantity:whole(raw.quantity??1),watch:cleanWatch(raw.watch||existing?.watch),savedOnly:raw.savedOnly===true,source:demo?'sample':message.source==='captured'?'captured':'manual'};
      const index=state.products.findIndex(x=>x.id===productId);
      // Keep the saved item's identity when attaching a second retailer's observation.
      if(message.attachTo){existing.notes=p.notes||existing.notes;}
      else if(index<0)state.products.push(p);else state.products[index]=p;
      const offer=cleanOffer({...raw,source:message.source||'manual'},productId);
      const old=state.offers.find(o=>o.productId===productId&&o.retailer===offer.retailer&&o.url===offer.url);
      if(old)offer.id=old.id;
      state.offers=state.offers.filter(o=>o.id!==offer.id);state.offers.push(offer);
      await recordObservation(state,offer,old,demo); result={productId}; break;
    }
    case 'updateProduct':{
      const p=state.products.find(p=>p.id===message.id);if(!p)throw new Error('Item not found.');
      if(message.quantity!==undefined)p.quantity=whole(message.quantity);
      if(message.notes!==undefined)p.notes=text(message.notes);
      if(message.savedOnly!==undefined)p.savedOnly=message.savedOnly===true;
      if(message.watch!==undefined)p.watch=cleanWatch(message.watch);
      break;
    }
    case 'deleteProduct':state.products=state.products.filter(p=>p.id!==message.id);state.offers=state.offers.filter(o=>o.productId!==message.id);state.history=state.history.filter(o=>o.productId!==message.id);state.alerts=state.alerts.filter(o=>o.productId!==message.id);state.orders=state.orders.filter(o=>o.productId!==message.id);break;
    case 'saveOffer':{
      const p=state.products.find(p=>p.id===message.offer.productId);if(!p)throw new Error('Save the product first.');
      const offer=cleanOffer({...message.offer,source:demo?'sample':'manual'},p.id);const old=state.offers.find(o=>o.id===offer.id);
      state.offers=state.offers.filter(o=>o.id!==offer.id);state.offers.push(offer);await recordObservation(state,offer,old,demo);break;
    }
    case 'deleteOffer':state.offers=state.offers.filter(o=>o.id!==message.id);break;
    case 'saveSettings':state.settings=cleanSettings(message.settings,state.settings);break;
    case 'readAlerts':state.alerts.forEach(a=>{a.read=true;});break;
    case 'deleteAlert':state.alerts=state.alerts.filter(a=>a.id!==message.id);break;
    case 'saveOrder':{const order=cleanOrder(message.order,state);state.orders=state.orders.filter(o=>o.id!==order.id);state.orders.unshift(order);break;}
    case 'deleteOrder':state.orders=state.orders.filter(o=>o.id!==message.id);break;
    case 'reset':state=demo?sampleState():emptyState();break;
    case 'import':{
      const input=message.state;
      if(!input||input.schema!==1||!Array.isArray(input.products)||!Array.isArray(input.offers)||input.products.length>1000||input.offers.length>5000)throw new Error('Choose a CartScope schema 1 backup (max 1000 products and 5000 offers).');
      if(!demo&&(input.sample===true||input.products.some(p=>p?.source==='sample')||input.offers.some(o=>o?.source==='sample')||(Array.isArray(input.history)&&input.history.some(h=>h?.source==='sample'))))throw new Error('Import sample backups in the sample workspace so illustrative prices stay labeled.');
      state=emptyState();if(demo)state.sample=true;state.settings=cleanSettings({...input.settings,notificationsEnabled:false});
      const ids=new Set();
      state.products=input.products.map(p=>{const normalized=normalizeProduct(p);if(!validId(p.id)||ids.has(p.id))throw new Error('Backup contains duplicate or invalid product IDs.');ids.add(p.id);return {...normalized,id:p.id,image:imageUrl(p.image),notes:text(p.notes),url:safeUrl(p.url),watch:cleanWatch(p.watch),savedOnly:p.savedOnly===true,source:demo?'sample':p.source==='captured'?'captured':'manual'};});
      const offerIds=new Set();
      state.offers=input.offers.map(o=>{if(!ids.has(o.productId))throw new Error('Backup contains an offer without a saved product.');if(!validId(o.id))throw new Error('Backup contains invalid offer IDs.');const offer=cleanOffer(o,o.productId);if(offerIds.has(offer.id))throw new Error('Backup contains duplicate offer IDs.');offerIds.add(offer.id);offer.checkedAt=Number.isFinite(Date.parse(o.checkedAt))?o.checkedAt:now();return offer;});
      state.history=(Array.isArray(input.history)?input.history:[]).slice(-5000).filter(h=>ids.has(h.productId)&&Number.isFinite(Date.parse(h.checkedAt))).map(h=>({productId:h.productId,offerId:text(h.offerId,100),retailer:text(h.retailer,100),price:numeric(h.price),currency:text(h.currency,3),checkedAt:h.checkedAt,source:demo?'sample':h.source==='captured'?'captured':'manual'}));
      state.orders=(Array.isArray(input.orders)?input.orders:[]).slice(0,1000).map(o=>cleanOrder(o,state));
      // Notifications are historical and untrusted backup messages are never replayed.
      state.alerts=[];break;
    }
    default:throw new Error('Unknown request.');
  }
  if(changed)await chrome.storage.local.set({[key]:state});
  return {state,result};
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(sender.id!==chrome.runtime.id)return false;
  queue=queue.catch(()=>{}).then(()=>handle(message));
  queue.then(data=>respond({ok:true,...data}),error=>respond({ok:false,error:error.message||'Something went wrong.'}));return true;
});
