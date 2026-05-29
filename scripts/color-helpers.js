/* ════════════════════════════════════════════
   COLOR HELPERS
════════════════════════════════════════════ */

function hexRgb(h) {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
function rgbHex(r,g,b) {
  return '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
}
function adjust(hex, d) {
  const [r,g,b] = hexRgb(hex); return rgbHex(r+d,g+d,b+d);
}
function blend(h1,h2,t) {
  const [r1,g1,b1]=hexRgb(h1), [r2,g2,b2]=hexRgb(h2);
  return rgbHex(r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t);
}
function isDark(hex) {
  const [r,g,b] = hexRgb(hex);
  return 0.299*r + 0.587*g + 0.114*b < 140;
}
