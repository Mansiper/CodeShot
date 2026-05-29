/* ════════════════════════════════════════════
   BORDER DRAWING
════════════════════════════════════════════ */

const BORDER_STYLES = [
  { id: 'none',    name: 'None'    },
  { id: 'solid',   name: 'Solid'   },
  { id: 'dashed',  name: 'Dashed'  },
  { id: 'dotted',  name: 'Dotted'  },
  { id: 'double',  name: 'Double'  },
  { id: 'groove',  name: 'Groove'  },
  { id: 'ridge',   name: 'Ridge'   },
  { id: 'inset',   name: 'Inset'   },
  { id: 'outset',  name: 'Outset'  },
  { id: 'quote',   name: 'Quote'   },
  { id: 'corners', name: 'Corners' },
  { id: 'neon',    name: 'Neon'    },
  { id: 'rainbow', name: 'Rainbow' },
  { id: 'wavy',    name: 'Wavy'    },
];

function drawBorder(ctx, totalW, totalH, cornerRadius) {
  const style = state.borderStyle;
  if (!style || style === 'none') return;

  const bw = Math.max(1, state.borderWidth);
  const color = state.borderColor || '#ffffff';

  // Helper: build a rounded-rect path inset by `inset` px
  function borderPath(inset, r) {
    const x = inset, y = inset, w = totalW - inset * 2, h = totalH - inset * 2;
    const cr = Math.max(0, r - inset);
    ctx.beginPath();
    ctx.moveTo(x + cr, y);
    ctx.lineTo(x + w - cr, y);   ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
    ctx.lineTo(x + w, y + h - cr); ctx.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
    ctx.lineTo(x + cr, y + h);   ctx.quadraticCurveTo(x, y + h, x, y + h - cr);
    ctx.lineTo(x, y + cr);       ctx.quadraticCurveTo(x, y, x + cr, y);
    ctx.closePath();
  }

  // Helper: darker/lighter variant of a hex color for groove/ridge/inset/outset
  function shade(hex, amt) {
    const [r, g, b] = hexRgb(hex);
    return rgbHex(r + amt, g + amt, b + amt);
  }

  ctx.save();
  ctx.lineCap  = 'round';
  ctx.lineJoin = 'round';

  switch (style) {

    case 'solid': {
      borderPath(bw / 2, cornerRadius);
      ctx.strokeStyle = color;
      ctx.lineWidth   = bw;
      ctx.stroke();
      break;
    }

    case 'dashed': {
      const dash = Math.max(4, bw * 3);
      borderPath(bw / 2, cornerRadius);
      ctx.strokeStyle = color;
      ctx.lineWidth   = bw;
      ctx.setLineDash([dash, dash]);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'dotted': {
      borderPath(bw / 2, cornerRadius);
      ctx.strokeStyle = color;
      ctx.lineWidth   = bw;
      ctx.setLineDash([bw, bw * 1.5]);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }

    case 'double': {
      const gap = Math.max(2, Math.round(bw / 3));
      const outer = bw;
      [gap / 2, outer + gap / 2 + gap].forEach(inset => {
        borderPath(inset, cornerRadius);
        ctx.strokeStyle = color;
        ctx.lineWidth   = Math.max(1, Math.round(bw / 3));
        ctx.stroke();
      });
      break;
    }

    case 'groove': {
      const half = Math.max(1, Math.round(bw / 2));
      borderPath(half / 2, cornerRadius);
      ctx.strokeStyle = shade(color, -50);
      ctx.lineWidth   = half;
      ctx.stroke();
      borderPath(half + half / 2, cornerRadius);
      ctx.strokeStyle = shade(color, 40);
      ctx.lineWidth   = half;
      ctx.stroke();
      break;
    }

    case 'ridge': {
      const half = Math.max(1, Math.round(bw / 2));
      borderPath(half / 2, cornerRadius);
      ctx.strokeStyle = shade(color, 40);
      ctx.lineWidth   = half;
      ctx.stroke();
      borderPath(half + half / 2, cornerRadius);
      ctx.strokeStyle = shade(color, -50);
      ctx.lineWidth   = half;
      ctx.stroke();
      break;
    }

    case 'inset': {
      const half = Math.max(1, Math.round(bw / 2));
      borderPath(half / 2, cornerRadius);
      ctx.strokeStyle = shade(color, -55);
      ctx.lineWidth   = bw;
      ctx.stroke();
      borderPath(half * 1.5, cornerRadius);
      ctx.strokeStyle = shade(color, 45);
      ctx.lineWidth   = half;
      ctx.stroke();
      break;
    }

    case 'outset': {
      const half = Math.max(1, Math.round(bw / 2));
      borderPath(half / 2, cornerRadius);
      ctx.strokeStyle = shade(color, 45);
      ctx.lineWidth   = bw;
      ctx.stroke();
      borderPath(half * 1.5, cornerRadius);
      ctx.strokeStyle = shade(color, -55);
      ctx.lineWidth   = half;
      ctx.stroke();
      break;
    }

    case 'quote': {
      // Large double-quote marks in both gaps
      const quoteFontSize = Math.max(24, bw * 6);
      ctx.font = `bold ${quoteFontSize}px serif`;
      const openMark  = '\u201C'; // ""
      const closeMark = '\u201D'; // ""
      const markW  = ctx.measureText(openMark).width;
      const gapW   = markW + bw * 6;
      const halfGap = gapW / 2;
      const centerX = totalW / 2;
      const inset   = bw / 2;
      const r       = Math.max(0, cornerRadius - inset);

      ctx.strokeStyle = color;
      ctx.lineWidth   = bw;

      // Top-left segment
      ctx.beginPath();
      ctx.moveTo(inset + r, inset);
      ctx.lineTo(centerX - halfGap, inset);
      ctx.stroke();

      // Top-right + right + bottom-right + bottom-right segment + bottom-left arc
      ctx.beginPath();
      ctx.moveTo(centerX + halfGap, inset);
      ctx.lineTo(totalW - inset - r, inset);
      ctx.quadraticCurveTo(totalW - inset, inset, totalW - inset, inset + r);
      ctx.lineTo(totalW - inset, totalH - inset - r);
      ctx.quadraticCurveTo(totalW - inset, totalH - inset, totalW - inset - r, totalH - inset);
      ctx.lineTo(centerX + halfGap, totalH - inset);
      ctx.stroke();

      // Bottom-left segment + left side + top-left arc
      ctx.beginPath();
      ctx.moveTo(centerX - halfGap, totalH - inset);
      ctx.lineTo(inset + r, totalH - inset);
      ctx.quadraticCurveTo(inset, totalH - inset, inset, totalH - inset - r);
      ctx.lineTo(inset, inset + r);
      ctx.quadraticCurveTo(inset, inset, inset + r, inset);
      ctx.stroke();

      // Quote marks in the gaps — centered on their respective border lines
      ctx.fillStyle    = color;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(openMark,  centerX, quoteFontSize / 2.22); // on the top border
      ctx.fillText(closeMark, centerX, totalH + inset);  // on the bottom border
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'alphabetic';
      break;
    }

    case 'corners': {
      // L-shaped corner brackets; corner arm length ≈ 18% of shortest side
      const arm    = Math.max(16, Math.min(totalW, totalH) * 0.18);
      const inset  = bw / 2;
      const r      = Math.max(0, cornerRadius - inset);

      ctx.strokeStyle = color;
      ctx.lineWidth   = bw;

      function cornerBracket(fromX, fromY, midX, midY, toX, toY) {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        if (r > 0) {
          // Arc in the corner
          ctx.lineTo(midX + (fromX < midX ? r : -r) * Math.sign(fromX - midX), fromY);
          ctx.quadraticCurveTo(midX, fromY, midX, fromY + (toY > fromY ? r : -r) * Math.sign(toY - fromY));
        } else {
          ctx.lineTo(midX, midY);
        }
        ctx.lineTo(toX, toY);
        ctx.stroke();
      }

      // Top-left: from (inset, inset+arm) → corner → (inset+arm, inset)
      ctx.beginPath();
      ctx.moveTo(inset, inset + arm);
      if (r > 0) {
        ctx.lineTo(inset, inset + r);
        ctx.quadraticCurveTo(inset, inset, inset + r, inset);
      } else {
        ctx.lineTo(inset, inset);
        ctx.lineTo(inset + r, inset);
      }
      ctx.lineTo(inset + arm, inset);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(totalW - inset - arm, inset);
      if (r > 0) {
        ctx.lineTo(totalW - inset - r, inset);
        ctx.quadraticCurveTo(totalW - inset, inset, totalW - inset, inset + r);
      } else {
        ctx.lineTo(totalW - inset, inset);
        ctx.lineTo(totalW - inset, inset + r);
      }
      ctx.lineTo(totalW - inset, inset + arm);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(totalW - inset, totalH - inset - arm);
      if (r > 0) {
        ctx.lineTo(totalW - inset, totalH - inset - r);
        ctx.quadraticCurveTo(totalW - inset, totalH - inset, totalW - inset - r, totalH - inset);
      } else {
        ctx.lineTo(totalW - inset, totalH - inset);
        ctx.lineTo(totalW - inset - r, totalH - inset);
      }
      ctx.lineTo(totalW - inset - arm, totalH - inset);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(inset + arm, totalH - inset);
      if (r > 0) {
        ctx.lineTo(inset + r, totalH - inset);
        ctx.quadraticCurveTo(inset, totalH - inset, inset, totalH - inset - r);
      } else {
        ctx.lineTo(inset, totalH - inset);
        ctx.lineTo(inset, totalH - inset - r);
      }
      ctx.lineTo(inset, totalH - inset - arm);
      ctx.stroke();
      break;
    }

    case 'neon': {
      // Multi-layer glow: wide+dim outer → narrow+bright core
      const layers = [
        { blur: bw * 10, alpha: 0.20, lw: bw * 2.5 },
        { blur: bw * 5,  alpha: 0.40, lw: bw * 1.5 },
        { blur: bw * 2,  alpha: 0.70, lw: bw        },
        { blur: bw * 0.5,alpha: 1.00, lw: bw * 0.35, white: true },
      ];
      for (const l of layers) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur  = l.blur;
        ctx.strokeStyle = l.white ? '#ffffff' : color;
        ctx.lineWidth   = l.lw;
        ctx.globalAlpha = l.alpha;
        borderPath(bw / 2, cornerRadius);
        ctx.stroke();
        ctx.restore();
      }
      break;
    }

    case 'rainbow': {
      // Diagonal rainbow gradient across the full border path
      const g = ctx.createLinearGradient(0, 0, totalW, totalH);
      g.addColorStop(0,    '#ff0080');
      g.addColorStop(0.17, '#ff8000');
      g.addColorStop(0.33, '#ffff00');
      g.addColorStop(0.50, '#00ff80');
      g.addColorStop(0.67, '#00cfff');
      g.addColorStop(0.83, '#4080ff');
      g.addColorStop(1,    '#bf00ff');
      borderPath(bw / 2, cornerRadius);
      ctx.strokeStyle = g;
      ctx.lineWidth   = bw;
      ctx.stroke();
      break;
    }

    case 'wavy': {
      // Sinusoidal wave on each edge
      const amp    = Math.max(3, bw * 2.5);
      const period = Math.max(24, bw * 10);
      const inset  = bw;

      ctx.strokeStyle = color;
      ctx.lineWidth   = bw;
      ctx.lineCap     = 'round';

      function wavySeg(x0, y0, x1, y1) {
        const dx  = x1 - x0, dy = y1 - y0;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx  = -dy / len, ny = dx / len;
        const steps = Math.max(4, Math.ceil(len / 4));
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t    = i / steps;
          const wave = Math.sin(t * len / period * Math.PI * 2) * amp;
          const x    = x0 + dx * t + nx * wave;
          const y    = y0 + dy * t + ny * wave;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 4 sides
      wavySeg(inset, inset,             totalW - inset, inset);
      wavySeg(totalW - inset, inset,    totalW - inset, totalH - inset);
      wavySeg(totalW - inset, totalH - inset, inset,    totalH - inset);
      wavySeg(inset, totalH - inset,    inset,          inset);
      break;
    }

    default: {
      borderPath(bw / 2, cornerRadius);
      ctx.strokeStyle = color;
      ctx.lineWidth   = bw;
      ctx.stroke();
    }
  }

  ctx.restore();
}

function renderCode() {
  if (state.inputMode === 'markdown') return renderMarkdown();

  const theme = THEMES[state.theme];
  const {font, fontSize, lineHeight, innerPadding, cornerRadius, chromeStyle, showLineNumbers} = state;
  const activeFont = state.inputMode === 'text' ? state.plainFont : font;
  const fontFallback = state.inputMode === 'text' ? 'sans-serif' : 'monospace';
  const fontStr = `${fontSize}px "${activeFont}",${fontFallback}`;
  const lh = Math.round(fontSize * lineHeight);
  const chromeH = getChromeHeight(chromeStyle, fontSize);

  const tokens = getTokens();
  const lines = buildLines(tokens);

  // Measure
  const mc = document.createElement('canvas').getContext('2d');
  mc.font = fontStr;
  applyTextSettings(mc);
  const lineNoW = showLineNumbers ? mc.measureText(String(lines.length)+'  ').width : 0;

  let maxLineW = 0;
  for (const line of lines) {
    let w = lineNoW;
    for (const t of line) w += measureW(mc, t.text);
    maxLineW = Math.max(maxLineW, w);
  }

  const contentW = Math.max(maxLineW, 200);
  const contentH = lines.length * lh;
  const totalW = Math.ceil(contentW + innerPadding * 2);
  const totalH = Math.ceil(contentH + innerPadding * 2 + chromeH);

  const off = document.createElement('canvas');
  off.width = totalW; off.height = totalH;
  const ctx = off.getContext('2d');

  // Clip rounded rect
  if (cornerRadius > 0) { rrect(ctx,0,0,totalW,totalH,cornerRadius); ctx.clip(); }

  // Background
  ctx.fillStyle = state.inputMode === 'text' ? state.plainTextBg : theme.bg;
  ctx.fillRect(0,0,totalW,totalH);

  // Chrome
  drawChrome(ctx, totalW, chromeH, theme, fontSize, innerPadding, chromeStyle, state.windowTitle);

  // Selection highlight
  if (selectionRange && selectionRange.start !== selectionRange.end) {
    const rawLines = (state.code || '').split('\n');
    function offsetToLC(offset) {
      let rem = offset;
      for (let i = 0; i < rawLines.length; i++) {
        if (rem <= rawLines[i].length) return { l: i, c: rem };
        rem -= rawLines[i].length + 1;
      }
      return { l: rawLines.length - 1, c: rawLines[rawLines.length - 1].length };
    }
    const s = offsetToLC(selectionRange.start);
    const e = offsetToLC(selectionRange.end);
    ctx.font = fontStr;
    const [sr,sg,sb] = hexRgb(state.selectionColor);
    ctx.fillStyle = `rgba(${sr},${sg},${sb},${state.selectionOpacity / 100})`;
    for (let li = s.l; li <= e.l && li < lines.length; li++) {
      const raw = rawLines[li] || '';
      const cS = li === s.l ? s.c : 0;
      const cE = li === e.l ? e.c : raw.length;
      const pre = raw.slice(0, cS).replace(/\t/g, ' '.repeat(state.tabSize));
      const sel = raw.slice(cS, cE).replace(/\t/g, ' '.repeat(state.tabSize));
      const xOff = measureW(ctx, pre);
      const xW   = sel.length ? measureW(ctx, sel) : measureW(ctx, ' ');
      ctx.fillRect(innerPadding + lineNoW + xOff, innerPadding + chromeH + li * lh - Math.round((fontSize + 1) / 5.5), xW, lh);
    }
  }

  // Code
  ctx.font = fontStr; ctx.textBaseline = 'top';
  applyTextSettings(ctx);
  let y = innerPadding + chromeH;
  for (let li = 0; li < lines.length; li++) {
    let x = innerPadding;
    if (showLineNumbers) {
      ctx.fillStyle = state.lineNumberColor || adjust(theme.fg, -60);
      const no = String(li + state.firstLineNumber).padStart(String(lines.length + state.firstLineNumber - 1).length, ' ');
      ctx.fillText(no, x, y); x += lineNoW;
    }

    const lineTokens = lines[li];

    if (state.inputMode === 'text' && state.plainTextAlign !== 'left' && lineTokens.length > 0) {
      const lineText = lineTokens.map(t => t.text).join('');
      const lineW = ctx.measureText(lineText).width;
      const xBase = x;
      const availW = contentW - lineNoW;

      if (state.plainTextAlign === 'center') {
        x = xBase + (availW - lineW) / 2;
      } else if (state.plainTextAlign === 'right') {
        x = xBase + availW - lineW;
      } else if (state.plainTextAlign === 'justify') {
        const isLastLine = li === lines.length - 1;
        const words = lineText.split(' ');
        if (!isLastLine && words.length > 1) {
          const noSpaceW = ctx.measureText(words.join('')).width;
          const spaceW = (availW - noSpaceW) / (words.length - 1);
          let jx = xBase;
          const jColor = lineTokens[0].color;
          for (let wi = 0; wi < words.length; wi++) {
            drawStyledToken(ctx, words[wi], jx, y, jColor, fontSize, innerPadding + lineNoW, contentW - lineNoW);
            jx += ctx.measureText(words[wi]).width + (wi < words.length - 1 ? spaceW : 0);
          }
          y += lh;
          continue;
        }
        // last line or single word: left-align (x stays at xBase)
      }
    }

    const gx = innerPadding + lineNoW;
    const gw = contentW - lineNoW;
    for (const t of lineTokens) {
      if (state.ligatures) {
        drawStyledToken(ctx, t.text, x, y, t.color, fontSize, gx, gw);
        x += ctx.measureText(t.text).width;
      } else {
        for (const ch of t.text) {
          drawStyledToken(ctx, ch, x, y, t.color, fontSize, gx, gw);
          x += ctx.measureText(ch).width;
        }
      }
    }
    y += lh;
  }

  // Draw border on top of code block content
  drawBorder(ctx, totalW, totalH, cornerRadius);

  return off;
}
