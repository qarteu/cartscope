// Runs the same state service in a browser preview. It never reads a shopping tab.
export async function initializePreview(){
  let listener;
  globalThis.chrome={
    runtime:{id:'cartscope-preview',onInstalled:{addListener(){}},onMessage:{addListener(fn){listener=fn;}},sendMessage(message){return new Promise(resolve=>listener(message,{id:'cartscope-preview'},resolve));}},
    sidePanel:{setPanelBehavior:async()=>{}},
    storage:{local:{get:async key=>({[key]:JSON.parse(localStorage.getItem('cartscope:'+key)||'null')}),set:async values=>{for(const [key,value]of Object.entries(values))localStorage.setItem('cartscope:'+key,JSON.stringify(value));},setAccessLevel:async()=>{}}},
    tabs:{query:async()=>[],create:async({url})=>{window.open(url,'_blank','noopener,noreferrer');}},
    permissions:{contains:async()=>false,request:async()=>false},
    notifications:{create:async()=>{}}
  };
  await import('./background.js');
}
