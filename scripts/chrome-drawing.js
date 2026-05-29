/* ════════════════════════════════════════════
   CHROME DRAWING
════════════════════════════════════════════ */

function getChromeHeight(style, fontSize) {
  return style === 'none' ? 0 : Math.round(fontSize * 2.3);
}

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0, hi = text.length;
  const ellipsis = '…';
  const ellW = ctx.measureText(ellipsis).width;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ctx.measureText(text.slice(0, mid)).width + ellW <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return lo === 0 ? '' : text.slice(0, lo) + ellipsis;
}

function drawChrome(ctx, totalW, chromeH, theme, fontSize, pad, style, title) {
  if (style === 'none' || chromeH === 0) return;
  const dark = isDark(theme.bg);
  const barBg = dark ? adjust(theme.bg, 18) : adjust(theme.bg, -12);
  ctx.fillStyle = barBg;
  ctx.fillRect(0, 0, totalW, chromeH);
  // separator
  ctx.strokeStyle = dark ? adjust(theme.bg, -20) : adjust(theme.bg, 20);
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, chromeH); ctx.lineTo(totalW, chromeH); ctx.stroke();

  const cy = chromeH / 2;

  if (style === 'macos') {
    const r = Math.max(7, Math.round(fontSize * 0.38));
    const gap = r * 2 + 10;
    ['#ff5f57','#febc2e','#28c840'].forEach((c, i) => {
      ctx.beginPath(); ctx.arc(pad + r + i*gap, cy, r, 0, Math.PI*2);
      ctx.fillStyle = c; ctx.fill();
    });

  } else if (style === 'windows') {
    // App title
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
    ctx.font = `${Math.round(fontSize*1.2)}px "Segoe UI",Arial,sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const bW2 = Math.round(chromeH * 1.55);
    const maxTitleW = totalW - bW2 * 3 - pad * 2 - 8;
    const titleText2 = truncateText(ctx, title || 'code', maxTitleW);
    ctx.fillText(titleText2, pad, cy + 0.5);
    // 3 buttons: –  □  ✕
    const bW = Math.round(chromeH * 1.55);
    [{icon:'−',close:false},{icon:'□',close:false},{icon:'✕',close:true}].forEach((b,i) => {
      const bx = totalW - bW * (3-i);
      if (b.close) { ctx.fillStyle='rgba(196,43,28,0.9)'; ctx.fillRect(bx,0,bW,chromeH); }
      ctx.fillStyle = b.close ? '#fff' : (dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
      ctx.font = `${Math.round(fontSize*1.2)}px "Segoe UI",Arial,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.icon, bx + bW/2, cy + (b.icon==='−' ? 2 : 0));
    });
    ctx.textAlign = 'left';

  } else if (style === 'gnome') {
    // Title center
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)';
    ctx.font = `${Math.round(fontSize*1.2)}px "Ubuntu","Cantarell",Arial,sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const r2 = Math.max(5, Math.round(fontSize * 0.38));
    const cr2 = Math.max(5, Math.round(fontSize * 0.4));
    const leftEdge = pad + r2 * 2 + 5 + r2 + 5;
    const rightEdge = totalW - pad - cr2 * 2;
    const maxGnomeW = rightEdge - leftEdge;
    const gnomeTitle = truncateText(ctx, title || 'code.js', maxGnomeW);
    ctx.fillText(gnomeTitle, totalW/2, cy);
    ctx.textAlign = 'left';
    // Left: 2 neutral dots (minimize/maximize)
    const r = Math.max(7, Math.round(fontSize * 0.38));
    [0,1].forEach(i => {
      ctx.beginPath(); ctx.arc(pad + r + i*(r*2+5), cy, r, 0, Math.PI*2);
      ctx.fillStyle = '#787878'; ctx.fill();
    });
    // Right: close (red circle with X)
    const cr = Math.max(8, Math.round(fontSize * 0.4));
    const cx2 = totalW - pad - cr;
    ctx.beginPath(); ctx.arc(cx2, cy, cr, 0, Math.PI*2);
    ctx.fillStyle = '#cc3333'; ctx.fill();
    const xs = cr * 0.45;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = Math.max(1, cr*0.2);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx2-xs, cy-xs); ctx.lineTo(cx2+xs, cy+xs);
    ctx.moveTo(cx2+xs, cy-xs); ctx.lineTo(cx2-xs, cy+xs);
    ctx.stroke(); ctx.lineCap = 'butt';
  }
}
