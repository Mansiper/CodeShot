/* ════════════════════════════════════════════
   CODE CANVAS
════════════════════════════════════════════ */

/**
 * Draw a single text token using the active text style.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text   Token text
 * @param {number} x      Left edge
 * @param {number} y      Top edge (textBaseline='top')
 * @param {string} tokenColor  Syntax-highlight color for this token
 * @param {number} fontSize    Active font size in px
 * @param {number} gx     Left edge of the full text area (for gradients)
 * @param {number} gw     Width of the full text area (for gradients)
 */
function drawStyledToken(ctx, text, x, y, tokenColor, fontSize, gx, gw) {
  const style = state.textStyle;
  if (!style || style === 'none') {
    ctx.fillStyle = tokenColor;
    ctx.fillText(text, x, y);
    return;
  }

  const c1 = state.textStyleColor1;
  const c2 = state.textStyleColor2;
  const it = state.textStyleIntensity / 100; // 0–1

  ctx.save();

  switch (style) {

    case 'drop-shadow': {
      const off = 1 + it * 4;
      ctx.shadowColor = c1;
      ctx.shadowBlur  = it * 10;
      ctx.shadowOffsetX = off;
      ctx.shadowOffsetY = off;
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'corner-glow': {
      const [r,g,b] = hexRgb(c1);
      const off = 1 + Math.round(it * 2);
      const alpha = 0.5 + it * 0.4;
      [[-off,-off],[off,-off],[-off,off],[off,off]].forEach(([ox,oy]) => {
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillText(text, x + ox, y + oy);
      });
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'outline': {
      const lw = 0.5 + it * 3.5;
      ctx.strokeStyle = c1;
      ctx.lineWidth   = lw;
      ctx.lineJoin    = 'round';
      ctx.strokeText(text, x, y);
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'glow': {
      const maxBlur = it * 24;
      ctx.fillStyle = tokenColor;
      for (const b of [maxBlur, maxBlur * 0.65, maxBlur * 0.35]) {
        ctx.shadowColor = c1;
        ctx.shadowBlur  = b;
        ctx.fillText(text, x, y);
      }
      break;
    }

    case 'recessed': {
      ctx.fillStyle = `rgba(0,0,0,${0.35 + it * 0.45})`;
      ctx.fillText(text, x, y);
      ctx.fillStyle = `rgba(255,255,255,${0.08 + it * 0.15})`;
      ctx.fillText(text, x + 1, y + 1);
      break;
    }

    case 'embossed': {
      ctx.fillStyle = `rgba(255,255,255,${0.2 + it * 0.3})`;
      ctx.fillText(text, x - 1, y - 1);
      ctx.fillStyle = `rgba(0,0,0,${0.4 + it * 0.3})`;
      ctx.fillText(text, x + 1, y + 1);
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'long-shadow': {
      const steps = Math.round(4 + it * 20);
      const [r,g,b] = hexRgb(c1);
      for (let i = steps; i >= 1; i--) {
        const a = (0.02 + it * 0.06) * (1 - (steps - i) / steps * 0.7);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillText(text, x + i * 0.7, y + i * 0.7);
      }
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'letterpress': {
      ctx.fillStyle = `rgba(0,0,0,${0.3 + it * 0.4})`;
      ctx.fillText(text, x, y - 1);
      ctx.fillStyle = `rgba(255,255,255,${0.1 + it * 0.18})`;
      ctx.fillText(text, x, y + 1);
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'retro-shadow': {
      const off = Math.round(1 + it * 5);
      ctx.fillStyle = c1;
      ctx.fillText(text, x + off, y + off);
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'gradient-fill': {
      const g = ctx.createLinearGradient(gx, y, gx + gw, y + fontSize);
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
      ctx.fillText(text, x, y);
      break;
    }

    case 'rainbow': {
      const g = ctx.createLinearGradient(gx, y, gx + gw, y);
      ['#f38ba8','#fab387','#f9e2af','#a6e3a1','#89b4fa','#cba6f7'].forEach((c, i, a) =>
        g.addColorStop(i / (a.length - 1), c));
      ctx.fillStyle = g;
      ctx.fillText(text, x, y);
      break;
    }

    case 'inner-glow': {
      const blur = 4 + it * 16;
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
      ctx.shadowColor = c1;
      ctx.shadowBlur  = blur;
      ctx.globalAlpha = 0.35 + it * 0.35;
      ctx.fillStyle   = c1;
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';
      ctx.fillStyle   = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'double-outline': {
      ctx.lineJoin    = 'round';
      ctx.strokeStyle = c2;
      ctx.lineWidth   = 4 + it * 3;
      ctx.strokeText(text, x, y);
      ctx.strokeStyle = c1;
      ctx.lineWidth   = 1 + it * 1.5;
      ctx.strokeText(text, x, y);
      ctx.fillStyle   = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'fire': {
      const blur1 = 8 + it * 16;
      const offY  = -(2 + it * 8);
      ctx.fillStyle    = c1;
      ctx.shadowColor  = c1;
      ctx.shadowBlur   = blur1;
      ctx.shadowOffsetY = offY;
      ctx.fillText(text, x, y);
      ctx.shadowBlur   = blur1 * 0.5;
      ctx.shadowOffsetY = offY * 0.5;
      ctx.fillText(text, x, y);
      ctx.shadowColor  = 'transparent';
      ctx.shadowOffsetY = 0;
      ctx.fillStyle    = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'metallic': {
      const g = ctx.createLinearGradient(gx, y - fontSize * 0.5, gx + gw, y + fontSize * 0.7);
      g.addColorStop(0,    '#cdd6f4');
      g.addColorStop(0.2,  '#ffffff');
      g.addColorStop(0.45, '#6c7086');
      g.addColorStop(0.6,  '#bac2de');
      g.addColorStop(0.8,  '#ffffff');
      g.addColorStop(1,    '#9399b2');
      ctx.fillStyle = g;
      ctx.fillText(text, x, y);
      break;
    }

    case 'ice': {
      const g = ctx.createLinearGradient(gx, y - fontSize * 0.5, gx, y + fontSize * 0.8);
      g.addColorStop(0, '#cdd6f4');
      g.addColorStop(1, c1);
      ctx.shadowColor = c1;
      ctx.shadowBlur  = 6 + it * 10;
      ctx.fillStyle   = g;
      ctx.fillText(text, x, y);
      break;
    }

    case 'gold': {
      const g = ctx.createLinearGradient(gx, y - fontSize * 0.5, gx, y + fontSize * 0.8);
      g.addColorStop(0,    '#f9e2af');
      g.addColorStop(0.25, '#fab387');
      g.addColorStop(0.5,  '#eba0ac');
      g.addColorStop(0.75, '#fab387');
      g.addColorStop(1,    '#f9e2af');
      ctx.fillStyle = g;
      ctx.fillText(text, x, y);
      ctx.shadowColor  = '#fff';
      ctx.shadowBlur   = 2;
      ctx.shadowOffsetY = -1;
      ctx.globalAlpha  = 0.5;
      ctx.fillStyle    = 'rgba(255,255,255,0.5)';
      ctx.fillText(text, x, y);
      ctx.globalAlpha  = 1;
      break;
    }

    case 'glitch': {
      const off = 1 + Math.round(it * 3);
      ctx.globalAlpha = 0.65 + it * 0.2;
      ctx.fillStyle = c1;
      ctx.fillText(text, x - off, y);
      ctx.fillStyle = c2;
      ctx.fillText(text, x + off, y);
      ctx.globalAlpha = 1;
      ctx.fillStyle   = tokenColor;
      ctx.fillText(text, x, y);
      break;
    }

    case 'neon-sign': {
      const blur = 8 + it * 24;
      ctx.strokeStyle = 'rgba(0,0,0,0.85)';
      ctx.lineWidth   = 3 + it * 3;
      ctx.lineJoin    = 'round';
      ctx.strokeText(text, x, y);
      ctx.shadowColor = c1;
      ctx.shadowBlur  = blur;
      ctx.fillStyle   = tokenColor;
      ctx.fillText(text, x, y);
      ctx.shadowBlur  = blur * 0.4;
      ctx.fillText(text, x, y);
      ctx.shadowColor = 'transparent';
      break;
    }

    case 'hollow': {
      const lw = 0.5 + it * 2;
      ctx.strokeStyle = tokenColor;
      ctx.lineWidth   = lw;
      ctx.lineJoin    = 'round';
      ctx.strokeText(text, x, y);
      break;
    }

    default: {
      ctx.fillStyle = tokenColor;
      ctx.fillText(text, x, y);
    }
  }

  ctx.restore();
}

function applyTextSettings(ctx) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${state.letterSpacing}px`;
}

function measureW(ctx, text) {
  if (state.ligatures || text.length <= 1) return ctx.measureText(text).width;
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width;
  return w;
}
