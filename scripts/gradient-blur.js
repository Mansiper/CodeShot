/* ════════════════════════════════════════════
   GRADIENT BLUR
════════════════════════════════════════════ */

function applyGradientBlur(src, dir, maxBlur, startPct, steps=18) {
  if (maxBlur <= 0) return src;
  const dst = document.createElement('canvas');
  dst.width = src.width; dst.height = src.height;
  const ctx = dst.getContext('2d');
  const W = src.width, H = src.height;
  const start = startPct / 100;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);            // 0→1 along gradient
    const tAdj = Math.max(0, (t - start) / (1 - start));  // clamp before start
    const blur = tAdj * maxBlur;

    ctx.save();
    ctx.filter = blur > 0 ? `blur(${blur.toFixed(1)}px)` : 'none';
    ctx.beginPath();
    if (dir === 'right') {
      const x0 = (i/steps)*W, x1 = ((i+1)/steps)*W;
      ctx.rect(x0, 0, x1-x0+1, H);
    } else if (dir === 'left') {
      const x0 = (1-(i+1)/steps)*W, x1 = (1-i/steps)*W;
      ctx.rect(x0, 0, x1-x0+1, H);
    } else if (dir === 'bottom') {
      const y0 = (i/steps)*H, y1 = ((i+1)/steps)*H;
      ctx.rect(0, y0, W, y1-y0+1);
    } else {
      const y0 = (1-(i+1)/steps)*H, y1 = (1-i/steps)*H;
      ctx.rect(0, y0, W, y1-y0+1);
    }
    ctx.clip();
    ctx.drawImage(src, 0, 0);
    ctx.restore();
  }
  return dst;
}
