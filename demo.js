document.querySelectorAll('[data-demo-view]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-demo-view]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  document.querySelector('#demo-frame').src='extension/sidepanel.html?view='+encodeURIComponent(button.dataset.demoView);
}));
