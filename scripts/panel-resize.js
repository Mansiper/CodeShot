/* ════════════════════════════════════════════
   PANEL RESIZE
════════════════════════════════════════════ */

function initResize() {
  const handle = document.getElementById('resize-handle');
  const editor = document.getElementById('editor-panel');
  const preview = document.getElementById('preview-panel');
  const main = document.getElementById('main');

  function applyLayout() {
    const settingsW = 280;
    const handleW = 5;
    const avail = main.clientWidth - settingsW - handleW;
    const eW = Math.max(180, Math.min(avail - 180, Math.round(avail * splitRatio)));
    const pW = avail - eW;
    editor.style.flexBasis = eW + 'px';
    preview.style.flexBasis = pW + 'px';
  }

  let dragging = false;
  handle.addEventListener('mousedown', e => { dragging=true; handle.classList.add('drag'); e.preventDefault(); });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const rect = main.getBoundingClientRect();
    const x = e.clientX - rect.left - 280 - 5;
    const avail = rect.width - 280 - 5;
    splitRatio = Math.max(0.2, Math.min(0.8, x / avail));
    applyLayout();
    try { localStorage.setItem(SPLIT_KEY, splitRatio); } catch(e) {}
  });
  document.addEventListener('mouseup', () => { dragging=false; handle.classList.remove('drag'); });

  // Touch support
  handle.addEventListener('touchstart', e => { dragging=true; e.preventDefault(); }, {passive:false});
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const rect = main.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left - 280 - 5;
    const avail = rect.width - 280 - 5;
    splitRatio = Math.max(0.2, Math.min(0.8, x / avail));
    applyLayout();
  });
  document.addEventListener('touchend', () => { dragging=false; });

  window.addEventListener('resize', applyLayout);
  applyLayout();
}
