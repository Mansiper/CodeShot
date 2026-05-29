/* ════════════════════════════════════════════
   CANVAS DISPLAY SCALING
════════════════════════════════════════════ */

function scaleCanvasDisplay() {
  const canvas = document.getElementById('preview-canvas');
  const wrap   = document.getElementById('preview-wrap');
  const pw = wrap.clientWidth  - 40;
  const ph = wrap.clientHeight - 40;
  if (pw <= 0 || ph <= 0) return;
  const scale = Math.min(1, pw / canvas.width, ph / canvas.height);
  canvas.style.width  = Math.round(canvas.width  * scale) + 'px';
  canvas.style.height = Math.round(canvas.height * scale) + 'px';
}
