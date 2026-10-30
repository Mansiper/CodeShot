/* ════════════════════════════════════════════
   VIGNETTE OVERLAY
════════════════════════════════════════════ */

function applyVignetteOverlay(ctx, width, height, cfg) {
  const alpha = Math.max(0, Math.min(100, Number(cfg.intensity) || 0)) / 100;
  if (alpha <= 0) return;

  const variant = cfg.variant || 'radial';
  if (variant === 'none') return;
  const blend = cfg.blendMode === 'normal' ? 'source-over' : (cfg.blendMode || 'multiply');
  const color = normalizeHexColor(cfg.color || '#000000');
  const [r, g, b] = hexRgb(color);
  const rgba = a => `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
  const cx = width / 2;
  const cy = height / 2;

  ctx.save();
  ctx.globalCompositeOperation = blend;
  ctx.globalAlpha = alpha;

  if (variant === 'inset-frame') {
    const inset = Math.max(14, Math.round(Math.min(width, height) * 0.12));
    const blur = Math.max(12, Math.round(Math.min(width, height) * 0.045));
    const radius = Math.max(8, Math.round(Math.min(width, height) * 0.06));
    const tmp = document.createElement('canvas');
    tmp.width = width;
    tmp.height = height;
    const tctx = tmp.getContext('2d');
    tctx.fillStyle = rgba(1);
    tctx.fillRect(0, 0, width, height);
    tctx.globalCompositeOperation = 'destination-out';
    roundedRectPath(tctx, inset, inset, width - inset * 2, height - inset * 2, radius);
    tctx.fill();
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(tmp, 0, 0);
    ctx.filter = 'none';
    ctx.restore();
    return;
  }

  if (variant === 'corners') {
    const radius = Math.max(width, height) * 0.55;
    drawCornerRadial(ctx, 0, 0, radius, rgba);
    drawCornerRadial(ctx, width, 0, radius, rgba);
    drawCornerRadial(ctx, 0, height, radius, rgba);
    drawCornerRadial(ctx, width, height, radius, rgba);
    ctx.restore();
    return;
  }

  if (variant === 'top-bottom') {
    drawEdgeGradient(ctx, 0, 0, width, height * 0.33, [rgba(1), rgba(0)], true);
    drawEdgeGradient(ctx, 0, height, width, -height * 0.33, [rgba(1), rgba(0)], true);
    ctx.restore();
    return;
  }

  if (variant === 'left-right') {
    drawEdgeGradient(ctx, 0, 0, width * 0.33, height, [rgba(1), rgba(0)], false);
    drawEdgeGradient(ctx, width, 0, -width * 0.33, height, [rgba(1), rgba(0)], false);
    ctx.restore();
    return;
  }

  if (variant === 'spotlight') {
    const dark = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.16, cx, cy, Math.max(width, height) * 0.82);
    dark.addColorStop(0, rgba(0));
    dark.addColorStop(0.5, rgba(0.22));
    dark.addColorStop(1, rgba(1));
    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * 0.3);
    glow.addColorStop(0, 'rgba(255,255,255,0.26)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  if (variant === 'light-vignette') {
    const g = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.35, cx, cy, Math.max(width, height) * 0.82);
    g.addColorStop(0, rgba(0));
    g.addColorStop(0.72, rgba(0.25));
    g.addColorStop(1, rgba(1));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  const radial = ctx.createRadialGradient(cx, cy, Math.min(width, height) * 0.18, cx, cy, Math.max(width, height) * 0.8);
  radial.addColorStop(0, rgba(0));
  radial.addColorStop(0.65, rgba(0.1));
  radial.addColorStop(1, rgba(1));
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawCornerRadial(ctx, x, y, radius, rgba) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, rgba(1));
  g.addColorStop(1, rgba(0));
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawEdgeGradient(ctx, x, y, w, h, colors, vertical) {
  const g = vertical ? ctx.createLinearGradient(x, y, x, y + h) : ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, colors[0]);
  g.addColorStop(1, colors[1]);
  ctx.fillStyle = g;
  ctx.fillRect(Math.min(x, x + w), Math.min(y, y + h), Math.abs(w), Math.abs(h));
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function normalizeHexColor(hex) {
  const c = String(hex || '#000000');
  if (/^#[0-9a-fA-F]{3}$/.test(c)) {
    return '#' + c.slice(1).split('').map(ch => ch + ch).join('');
  }
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;
  return '#000000';
}
