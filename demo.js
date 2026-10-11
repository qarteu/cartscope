const frame = document.querySelector('#demo-frame');
const buttons = [...document.querySelectorAll('[data-demo-view]')];
let workspaceObserver;

function selectView(view) {
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.demoView === view)));
}

function reflectWorkspace() {
  const document = frame.contentDocument;
  if (!document) return;
  const active = document.querySelector('[data-view][aria-current="page"]');
  if (active) selectView(active.dataset.view);
  const sampleBar = document.querySelector('#demo-bar');
  if (sampleBar) window.document.querySelector('#workspace-kind').textContent = sampleBar.hidden ? 'Your local workspace' : 'Sample workspace';
}

buttons.forEach(button => button.addEventListener('click', () => {
  selectView(button.dataset.demoView);
  frame.src = 'extension/sidepanel.html?view=' + encodeURIComponent(button.dataset.demoView);
}));

frame.addEventListener('load', () => {
  workspaceObserver?.disconnect();
  reflectWorkspace();
  if (frame.contentDocument?.body) {
    workspaceObserver = new MutationObserver(reflectWorkspace);
    workspaceObserver.observe(frame.contentDocument.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-current', 'hidden'] });
  }
});
