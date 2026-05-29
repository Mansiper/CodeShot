/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */

async function init() {
  loadState();
  buildUI();
  syncUI();
  bindEvents();
  initResize();
  try { await document.fonts.ready; } catch(e) {}
  scheduleRender();
  renderPresetsList();
}

document.addEventListener('DOMContentLoaded', init);

document.querySelectorAll('.section.collapsible .section-title').forEach(title => {
  title.addEventListener('click', () => {
    title.closest('.section').classList.toggle('collapsed');
  });
});