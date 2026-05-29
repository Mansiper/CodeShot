/* ════════════════════════════════════════════
   MARKDOWN RENDERING
════════════════════════════════════════════ */

function parseInlineMd(text) {
  const spans = [];
  let i = 0;
  while (i < text.length) {
    // Bold+italic: ***text*** or ___text___
    if (i + 2 < text.length &&
        ((text[i] === '*' && text[i+1] === '*' && text[i+2] === '*') ||
         (text[i] === '_' && text[i+1] === '_' && text[i+2] === '_'))) {
      const marker = text.slice(i, i+3);
      const end = text.indexOf(marker, i + 3);
      if (end !== -1) { spans.push({ text: text.slice(i+3, end), bold: true, italic: true }); i = end + 3; continue; }
    }
    // Bold: **text** or __text__
    if (i + 1 < text.length &&
        ((text[i] === '*' && text[i+1] === '*') || (text[i] === '_' && text[i+1] === '_'))) {
      const marker = text.slice(i, i+2);
      const end = text.indexOf(marker, i + 2);
      if (end !== -1) { spans.push(...parseInlineMdWith(text.slice(i+2, end), { bold: true })); i = end + 2; continue; }
    }
    // Italic: *text* or _text_
    if (text[i] === '*' || text[i] === '_') {
      const marker = text[i];
      const end = text.indexOf(marker, i + 1);
      if (end > i + 1 && text[i+1] !== ' ') { spans.push({ text: text.slice(i+1, end), italic: true }); i = end + 1; continue; }
    }
    // Inline code: `code`
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) { spans.push({ text: text.slice(i+1, end), code: true }); i = end + 1; continue; }
    }
    // Image: ![alt](url) — shown as [Image: alt]
    if (text[i] === '!' && i + 1 < text.length && text[i+1] === '[') {
      const close = text.indexOf(']', i + 2);
      if (close !== -1 && text[close+1] === '(') {
        const urlEnd = text.indexOf(')', close + 2);
        if (urlEnd !== -1) { spans.push({ text: '[Image: ' + text.slice(i+2, close) + ']', italic: true }); i = urlEnd + 1; continue; }
      }
    }
    // Link: [text](url)
    if (text[i] === '[') {
      const close = text.indexOf(']', i + 1);
      if (close !== -1 && text[close+1] === '(') {
        const urlEnd = text.indexOf(')', close + 2);
        if (urlEnd !== -1) { spans.push(...parseInlineMdWith(text.slice(i+1, close), { link: true })); i = urlEnd + 1; continue; }
      }
    }
    // Hard line break
    if (text[i] === '\n') {
      spans.push({ hardbreak: true, text: '' });
      i++; continue;
    }
    // Accumulate regular characters
    let j = i + 1;
    while (j < text.length && !'`*_[!\n'.includes(text[j])) j++;
    spans.push({ text: text.slice(i, j) });
    i = j;
  }
  return spans;
}

// Helper to apply extra properties to all spans from a recursive parse
function parseInlineMdWith(text, extra) {
  return parseInlineMd(text).map(s => ({ ...s, ...extra }));
}

function parseMdBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimEnd();
    // Heading
    const headMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
    if (headMatch) { blocks.push({ type: 'heading', level: headMatch[1].length, text: headMatch[2], lineStart: i, lineEnd: i }); i++; continue; }
    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(trimmed)) { blocks.push({ type: 'hr', lineStart: i, lineEnd: i }); i++; continue; }
    // Fenced code block
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim() || '';
      const codeLines = [];
      const ls = i; i++;
      while (i < lines.length && !lines[i].trimEnd().startsWith('```')) { codeLines.push(lines[i]); i++; }
      if (i < lines.length) i++;
      blocks.push({ type: 'code', lang, text: codeLines.join('\n'), lineStart: ls, lineEnd: i - 1 });
      continue;
    }
    // Blockquote
    if (/^>\s?/.test(trimmed)) {
      const ls = i; const qLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trimEnd())) { qLines.push(lines[i].replace(/^>\s?/, '')); i++; }
      blocks.push({ type: 'blockquote', text: qLines.join('\n'), lineStart: ls, lineEnd: i - 1 });
      continue;
    }
    // Unordered list
    if (/^\s*[-*+]\s/.test(trimmed)) {
      const ls = i; const items = [];
      while (i < lines.length && /^\s*[-*+]\s/.test(lines[i])) {
        const indent = Math.floor((lines[i].match(/^(\s*)/)[1].length) / 2);
        items.push({ text: lines[i].replace(/^\s*[-*+]\s/, ''), indent });
        i++;
      }
      blocks.push({ type: 'ul', items, lineStart: ls, lineEnd: i - 1 }); continue;
    }
    // Ordered list
    if (/^\s*\d+\.\s/.test(trimmed)) {
      const ls = i; const items = []; let num = 1;
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        const indent = Math.floor((lines[i].match(/^(\s*)/)[1].length) / 2);
        items.push({ text: lines[i].replace(/^\s*\d+\.\s/, ''), num: num++, indent });
        i++;
      }
      blocks.push({ type: 'ol', items, lineStart: ls, lineEnd: i - 1 }); continue;
    }
    // Blank line
    if (trimmed === '') {
      if (blocks.length > 0 && blocks[blocks.length-1].type !== 'blank') blocks.push({ type: 'blank', lineStart: i, lineEnd: i });
      i++; continue;
    }
    // Paragraph — collect until a block-level element or blank line
    const paraLines = [];
    const ls = i;
    while (i < lines.length) {
      const t = lines[i].trimEnd();
      if (t === '' || /^#{1,6}\s/.test(t) || t.startsWith('```') || /^>\s?/.test(t) ||
          /^\s*[-*+]\s/.test(t) || /^\s*\d+\.\s/.test(t) || /^[-*_]{3,}\s*$/.test(t)) break;
      paraLines.push(lines[i]); i++;
    }
    const text = paraLines.reduce((acc, line, idx) => {
      if (idx === 0) return line.trimEnd();
      const sep = paraLines[idx - 1].endsWith('  ') ? '\n' : ' ';
      return acc + sep + line.trimEnd();
    }, '');
    blocks.push({ type: 'paragraph', text, lineStart: ls, lineEnd: i - 1 });
  }
  return blocks;
}

function wrapInlineSpans(ctx, spans, maxWidth, fontSize, font, codeFont) {
  const lines = [[]];
  let lineW = 0;
  for (const span of spans) {
    if (span.hardbreak) { lines.push([]); lineW = 0; continue; }
    const setFont = () => {
      ctx.font = span.code
        ? `${fontSize}px "${codeFont}",monospace`
        : `${span.italic ? 'italic' : 'normal'} ${span.bold ? 'bold' : 'normal'} ${fontSize}px "${font}",sans-serif`;
    };
    const words = span.text.split(' ');
    for (let wi = 0; wi < words.length; wi++) {
      const word = words[wi] + (wi < words.length - 1 ? ' ' : '');
      if (!word) continue;
      setFont();
      const ww = ctx.measureText(word).width;
      if (lineW > 0 && lineW + ww > maxWidth) { lines.push([]); lineW = 0; }
      const cur = lines[lines.length - 1];
      const last = cur[cur.length - 1];
      if (last && !!last.code === !!span.code && !!last.bold === !!span.bold &&
          !!last.italic === !!span.italic && !!last.link === !!span.link) {
        last.text += word;
      } else {
        cur.push({ ...span, text: word });
      }
      lineW += ww;
    }
  }
  return lines;
}

function drawInlineSpans(ctx, spans, x, y, fontSize, font, codeFont, defaultColor, linkColor) {
  const lh = Math.round(fontSize * state.lineHeight);
  for (const s of spans) {
    if (s.code) {
      ctx.font = `${fontSize}px "${codeFont}",monospace`;
      const w = ctx.measureText(s.text).width;
      const pad = Math.round(fontSize * 0.15);
      const rh  = Math.round(fontSize * 1.05);
      ctx.fillStyle = 'rgba(128,128,128,0.22)';
      ctx.fillRect(x - pad, y + Math.round((lh - rh) / 2), w + pad * 2, rh);
      ctx.fillStyle = THEMES[state.theme].string || '#98c379';
      ctx.fillText(s.text, x, y);
      x += w;
    } else {
      ctx.font = `${s.italic ? 'italic' : 'normal'} ${s.bold ? 'bold' : 'normal'} ${fontSize}px "${font}",sans-serif`;
      ctx.fillStyle = s.link ? linkColor : defaultColor;
      ctx.fillText(s.text, x, y);
      x += ctx.measureText(s.text).width;
    }
  }
  return x;
}

function measureInlineWidth(mc, spans, fontSize, font, codeFont) {
  let lineW = 0, maxW = 0;
  for (const s of spans) {
    if (s.hardbreak) { maxW = Math.max(maxW, lineW); lineW = 0; continue; }
    mc.font = s.code
      ? `${fontSize}px "${codeFont}",monospace`
      : `${s.italic && s.bold ? 'italic bold' : s.italic ? 'italic' : s.bold ? 'bold' : 'normal'} ${fontSize}px "${font}",sans-serif`;
    lineW += mc.measureText(s.text).width;
  }
  return Math.max(maxW, lineW);
}

function renderMarkdown() {
  const theme = THEMES[state.theme];
  const { fontSize, lineHeight, innerPadding, cornerRadius, chromeStyle } = state;
  const font     = state.plainFont;
  const codeFont = state.font;
  const textColor    = state.plainTextColor;
  const bgColor      = state.plainTextBg;
  const headingColor = state.mdHeadingColor;
  const linkColor    = state.mdLinkColor;
  const lh = Math.round(fontSize * lineHeight);
  const chromeH = getChromeHeight(chromeStyle, fontSize);
  const hScale = [2.0, 1.6, 1.3, 1.15, 1.05, 1.0];

  const blocks = parseMdBlocks(state.code || '');

  const mc = document.createElement('canvas').getContext('2d');
  applyTextSettings(mc);

  // Measure exact rendered line width for every block type — no fixed sizes
  let maxContentW = 0;
  for (const b of blocks) {
    if (b.type === 'code') {
      mc.font = `${fontSize}px "${codeFont}",monospace`;
      for (const cl of b.text.split('\n'))
        maxContentW = Math.max(maxContentW, mc.measureText(cl.replace(/\t/g, ' '.repeat(state.tabSize))).width + 24);
    } else if (b.type === 'heading') {
      const hs = Math.round(fontSize * hScale[b.level - 1]);
      maxContentW = Math.max(maxContentW, measureInlineWidth(mc, parseInlineMd(b.text), hs, font, codeFont));
    } else if (b.type === 'paragraph') {
      maxContentW = Math.max(maxContentW, measureInlineWidth(mc, parseInlineMd(b.text), fontSize, font, codeFont));
    } else if (b.type === 'blockquote') {
      maxContentW = Math.max(maxContentW, measureInlineWidth(mc, parseInlineMd(b.text), fontSize, font, codeFont) + 24);
    } else if (b.type === 'ul') {
      mc.font = `${fontSize}px "${font}",sans-serif`;
      for (const item of b.items)
        maxContentW = Math.max(maxContentW, item.indent * 16 + 20 + measureInlineWidth(mc, parseInlineMd(item.text), fontSize, font, codeFont));
    } else if (b.type === 'ol') {
      mc.font = `${fontSize}px "${font}",sans-serif`;
      for (const item of b.items) {
        const numW = mc.measureText(item.num + '.  ').width;
        maxContentW = Math.max(maxContentW, item.indent * 16 + numW + measureInlineWidth(mc, parseInlineMd(item.text), fontSize, font, codeFont));
      }
    }
  }
  const contentW = Math.max(maxContentW, 1);

  // Compute block height for layout
  function blockH(b) {
    if (b.type === 'blank') return Math.round(lh * 0.5);
    if (b.type === 'hr')    return lh;
    if (b.type === 'heading') {
      const hs = Math.round(fontSize * hScale[b.level - 1]);
      const hlh = Math.round(hs * lineHeight);
      return hlh + (b.level <= 2 ? Math.round(hs * 0.3) : 0);
    }
    if (b.type === 'code') {
      const codePadY = Math.round(fontSize * 0.4);
      return b.text.split('\n').length * lh + codePadY * 2 + Math.round(lh * 0.5);
    }
    if (b.type === 'blockquote') {
      mc.font = `italic ${fontSize}px "${font}",sans-serif`;
      const wrapped = wrapInlineSpans(mc, parseInlineMd(b.text), contentW - 24, fontSize, font, codeFont);
      return wrapped.length * lh + Math.round(lh * 0.5);
    }
    if (b.type === 'ul' || b.type === 'ol') {
      let h = 0;
      for (const item of b.items) {
        const avail = contentW - 20 - item.indent * 16;
        h += wrapInlineSpans(mc, parseInlineMd(item.text), avail, fontSize, font, codeFont).length * lh;
      }
      return h + Math.round(lh * 0.3);
    }
    if (b.type === 'paragraph') {
      const wrapped = wrapInlineSpans(mc, parseInlineMd(b.text), contentW, fontSize, font, codeFont);
      return wrapped.length * lh + Math.round(lh * 0.3);
    }
    return 0;
  }

  let contentH = 0;
  for (const b of blocks) contentH += blockH(b);
  contentH = Math.max(contentH, fontSize * 2);

  const totalW = Math.ceil(contentW + innerPadding * 2);
  const totalH = Math.ceil(contentH + innerPadding * 2 + chromeH);

  const off = document.createElement('canvas');
  off.width = totalW; off.height = totalH;
  const ctx = off.getContext('2d');
  applyTextSettings(ctx);

  if (cornerRadius > 0) { rrect(ctx, 0, 0, totalW, totalH, cornerRadius); ctx.clip(); }
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, totalW, totalH);
  drawChrome(ctx, totalW, chromeH, theme, fontSize, innerPadding, chromeStyle, state.windowTitle);

  // Selection setup
  const rawLines = (state.code || '').split('\n');
  function mdOffsetToLC(offset) {
    let rem = offset;
    for (let li = 0; li < rawLines.length; li++) {
      if (rem <= rawLines[li].length) return { l: li, c: rem };
      rem -= rawLines[li].length + 1;
    }
    return { l: rawLines.length - 1, c: rawLines[rawLines.length - 1].length };
  }
  let selS = null, selE = null, selFill = null;
  if (selectionRange && selectionRange.start !== selectionRange.end) {
    selS = mdOffsetToLC(selectionRange.start);
    selE = mdOffsetToLC(selectionRange.end);
    const [sr, sg, sb] = hexRgb(state.selectionColor);
    selFill = `rgba(${sr},${sg},${sb},${state.selectionOpacity / 100})`;
  }

  ctx.textBaseline = 'top';
  let y = innerPadding + chromeH;
  const xBase = innerPadding;

    for (const b of blocks) {
    if (b.type === 'blank') { y += Math.round(lh * 0.5); continue; }

    if (b.type === 'hr') {
      ctx.strokeStyle = 'rgba(128,128,128,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(xBase, y + lh/2); ctx.lineTo(xBase + contentW, y + lh/2); ctx.stroke();
      y += lh; continue;
    }

    if (b.type === 'heading') {
      const hs  = Math.round(fontSize * hScale[b.level - 1]);
      const hlh = Math.round(hs * lineHeight);
      if (selFill && b.lineStart <= selE.l && b.lineEnd >= selS.l) {
        const prefix = b.level + 1; // length of "## " prefix in raw source
        const cS = Math.max(0, (selS.l === b.lineStart ? selS.c - prefix : 0));
        const cE = Math.min(b.text.length, (selE.l === b.lineEnd ? selE.c - prefix : b.text.length));
        if (cS < cE) {
          ctx.font = `bold ${hs}px "${font}",sans-serif`;
          ctx.fillStyle = selFill;
          const xOff = ctx.measureText(b.text.slice(0, cS)).width;
          const xW   = ctx.measureText(b.text.slice(cS, cE)).width || ctx.measureText(' ').width;
          ctx.fillRect(xBase + xOff, y - Math.round((hs + 1) / 5.5), xW, hlh);
        }
      }
      ctx.font = `bold ${hs}px "${font}",sans-serif`;
      ctx.fillStyle = headingColor;
      ctx.fillText(b.text, xBase, y);
      y += hlh;
      if (b.level <= 2) {
        ctx.strokeStyle = 'rgba(128,128,128,0.3)';
        ctx.lineWidth = b.level === 1 ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(xBase, y); ctx.lineTo(xBase + contentW, y); ctx.stroke();
        y += Math.round(hs * 0.3);
      }
      continue;
    }

    if (b.type === 'code') {
      const codePadY = Math.round(fontSize * 0.4);
      const codeLines = b.text.split('\n');
      const codeH = codeLines.length * lh + codePadY * 2;
      const codeR = Math.max(4, Math.round(cornerRadius * 0.5));
      rrect(ctx, xBase, y, contentW, codeH, codeR);
      ctx.fillStyle = theme.bg; ctx.fill();
      // Character-level selection within code block
      if (selFill) {
        ctx.font = `${fontSize}px "${codeFont}",monospace`;
        ctx.fillStyle = selFill;
        for (let li = 0; li < codeLines.length; li++) {
          const rawLi = b.lineStart + 1 + li;
          if (rawLi >= selS.l && rawLi <= selE.l) {
            const rawLine = codeLines[li];
            const cS = rawLi === selS.l ? selS.c : 0;
            const cE = rawLi === selE.l ? selE.c : rawLine.length;
            const pre = rawLine.slice(0, cS).replace(/\t/g, ' '.repeat(state.tabSize));
            const sel = rawLine.slice(cS, cE).replace(/\t/g, ' '.repeat(state.tabSize));
            const xOff = measureW(ctx, pre);
            const xW   = sel.length ? measureW(ctx, sel) : measureW(ctx, ' ');
            ctx.fillRect(xBase + 12 + xOff, y + codePadY + li * lh - Math.round((fontSize + 1) / 5.5), xW, lh);
          }
        }
      }
      ctx.font = `${fontSize}px "${codeFont}",monospace`;
      let hlOk = false;
      if (b.lang && b.lang !== 'text' && b.lang !== 'plain') {
        try {
          const hlHtml = hljs.highlight(b.text, { language: b.lang, ignoreIllegals: true }).value;
          const tokens = parseTokens(hlHtml, theme);
          const codeBlockLines = buildLines(tokens);
          for (let li = 0; li < codeBlockLines.length; li++) {
            let cx = xBase + 12;
            for (const t of codeBlockLines[li]) {
              ctx.fillStyle = t.color;
              if (state.ligatures) {
                ctx.fillText(t.text, cx, y + codePadY + li * lh);
                cx += ctx.measureText(t.text).width;
              } else {
                for (const ch of t.text) {
                  ctx.fillText(ch, cx, y + codePadY + li * lh);
                  cx += ctx.measureText(ch).width;
                }
              }
            }
          }
          hlOk = true;
        } catch(e) {}
      }
      if (!hlOk) {
        ctx.fillStyle = theme.fg;
        codeLines.forEach((cl, li) => {
          const text = cl.replace(/\t/g, ' '.repeat(state.tabSize));
          if (state.ligatures) {
            ctx.fillText(text, xBase + 12, y + codePadY + li * lh);
          } else {
            let cx = xBase + 12;
            for (const ch of text) {
              ctx.fillText(ch, cx, y + codePadY + li * lh);
              cx += ctx.measureText(ch).width;
            }
          }
        });
      }
      y += codeH + Math.round(lh * 0.5);
      continue;
    }

    if (b.type === 'blockquote') {
      const bqWrapped = wrapInlineSpans(ctx, parseInlineMd(b.text), contentW - 24, fontSize, font, codeFont);
      const bqH = bqWrapped.length * lh + Math.round(lh * 0.5);
      if (selFill && b.lineStart <= selE.l && b.lineEnd >= selS.l) {
        ctx.fillStyle = selFill;
        ctx.fillRect(xBase, y, contentW, bqH);
      }
      ctx.fillStyle = 'rgba(128,128,128,0.5)';
      ctx.fillRect(xBase, y, 3, bqH - Math.round(lh * 0.5));
      const [tr, tg, tb] = hexRgb(textColor);
      for (const wline of bqWrapped) {
        const italicLine = wline.map(s => ({ ...s, italic: true }));
        drawInlineSpans(ctx, italicLine, xBase + 16, y, fontSize, font, codeFont, `rgba(${tr},${tg},${tb},0.75)`, linkColor);
        y += lh;
      }
      y += Math.round(lh * 0.5);
      continue;
    }

    if (b.type === 'ul') {
      // Compute total height first for selection rect
      if (selFill && b.lineStart <= selE.l && b.lineEnd >= selS.l) {
        let ulH = 0;
        for (const item of b.items) {
          const avail = contentW - 20 - item.indent * 16;
          ulH += wrapInlineSpans(ctx, parseInlineMd(item.text), avail, fontSize, font, codeFont).length * lh;
        }
        ctx.fillStyle = selFill;
        ctx.fillRect(xBase, y, contentW, ulH + Math.round(lh * 0.3));
      }
      for (const item of b.items) {
        const indentX = xBase + item.indent * 16;
        const textX   = indentX + 20;
        const avail   = contentW - 20 - item.indent * 16;
        const wrapped = wrapInlineSpans(ctx, parseInlineMd(item.text), avail, fontSize, font, codeFont);
        ctx.font = `${fontSize}px "${font}",sans-serif`;
        ctx.fillStyle = textColor;
        ctx.fillText('•', indentX + 6, y);
        for (const wline of wrapped) {
          drawInlineSpans(ctx, wline, textX, y, fontSize, font, codeFont, textColor, linkColor);
          y += lh;
        }
      }
      y += Math.round(lh * 0.3);
      continue;
    }

    if (b.type === 'ol') {
      // Compute total height first for selection rect
      if (selFill && b.lineStart <= selE.l && b.lineEnd >= selS.l) {
        let olH = 0;
        for (const item of b.items) {
          ctx.font = `${fontSize}px "${font}",sans-serif`;
          const numW  = ctx.measureText(item.num + '.  ').width;
          const avail = contentW - numW - item.indent * 16;
          olH += wrapInlineSpans(ctx, parseInlineMd(item.text), avail, fontSize, font, codeFont).length * lh;
        }
        ctx.fillStyle = selFill;
        ctx.fillRect(xBase, y, contentW, olH + Math.round(lh * 0.3));
      }
      for (const item of b.items) {
        const numStr  = item.num + '.';
        ctx.font = `${fontSize}px "${font}",sans-serif`;
        const numW    = ctx.measureText(numStr + '  ').width;
        const indentX = xBase + item.indent * 16;
        const textX   = indentX + numW;
        const avail   = contentW - numW - item.indent * 16;
        const wrapped = wrapInlineSpans(ctx, parseInlineMd(item.text), avail, fontSize, font, codeFont);
        ctx.fillStyle = textColor;
        ctx.fillText(numStr, indentX, y);
        for (const wline of wrapped) {
          drawInlineSpans(ctx, wline, textX, y, fontSize, font, codeFont, textColor, linkColor);
          y += lh;
        }
      }
      y += Math.round(lh * 0.3);
      continue;
    }

    if (b.type === 'paragraph') {
      const wrapped = wrapInlineSpans(ctx, parseInlineMd(b.text), contentW, fontSize, font, codeFont);
      if (selFill && b.lineStart <= selE.l && b.lineEnd >= selS.l) {
        // Compute where this block starts in state.code
        let blockStart = 0;
        for (let li = 0; li < b.lineStart; li++) blockStart += rawLines[li].length + 1;
        const relStart = Math.max(0, selectionRange.start - blockStart);
        const relEnd   = selectionRange.end - blockStart;
        // Walk each canvas row and highlight only the selected portion
        ctx.font = `${fontSize}px "${font}",sans-serif`;
        ctx.fillStyle = selFill;
        let charPos = 0;
        for (let ri = 0; ri < wrapped.length; ri++) {
          const rowText = wrapped[ri].map(s => s.text).join('');
          const rowLen  = rowText.length;
          if (charPos + rowLen > relStart && charPos < relEnd) {
            const cS = Math.max(0, relStart - charPos);
            const cE = Math.min(rowLen, relEnd - charPos);
            const xOff = ctx.measureText(rowText.slice(0, cS)).width;
            const xW   = cE > cS
              ? ctx.measureText(rowText.slice(cS, cE)).width
              : ctx.measureText(' ').width;
            ctx.fillRect(xBase + xOff, y + ri * lh - Math.round((fontSize + 1) / 5.5), xW, lh);
          }
          charPos += rowLen + 1; // +1 for the word-boundary space consumed by wrapping
        }
      }
      for (const wline of wrapped) {
        drawInlineSpans(ctx, wline, xBase, y, fontSize, font, codeFont, textColor, linkColor);
        y += lh;
      }
      y += Math.round(lh * 0.3);
      continue;
    }
  }

  // Draw border on top of markdown block content
  drawBorder(ctx, off.width, off.height, cornerRadius);

  return off;
}

function doRender() {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');

  // Temporarily scale pixel dimensions for high-res render
  const sm = state.scaleMultiplier || 1;
  let savedScale = null;
  if (sm > 1) {
    savedScale = {
      fontSize: state.fontSize,
      innerPadding: state.innerPadding,
      outerPadding: state.outerPadding,
      cornerRadius: state.cornerRadius,
      shadowBlur: state.shadowBlur,
    };
    state.fontSize     = Math.round(state.fontSize     * sm);
    state.innerPadding = Math.round(state.innerPadding * sm);
    state.outerPadding = Math.round(state.outerPadding * sm);
    state.cornerRadius = Math.round(state.cornerRadius * sm);
    state.shadowBlur   = Math.round(state.shadowBlur   * sm);
    tokCache = null;
  }

  let off = renderCode();

  // Lock canvas size to unzoomed dimensions so background is unaffected
  const baseW = off.width;
  const baseH = off.height;

  // Scale code block only
  if (state.zoom !== 100) {
    const scale = state.zoom / 100;
    const zoomed = document.createElement('canvas');
    zoomed.width  = Math.round(off.width  * scale);
    zoomed.height = Math.round(off.height * scale);
    zoomed.getContext('2d').drawImage(off, 0, 0, zoomed.width, zoomed.height);
    off = zoomed;
  }

  // Apply gradient blur before perspective
  if (state.gradBlur) {
    off = applyGradientBlur(off, state.gradBlurDir, state.gradBlurAmount, state.gradBlurStart);
  }

  // Apply lens distortion
  if (state.lensAmount !== 0) {
    off = applyLens(off, state.lensAmount);
  }

  const iw = off.width, ih = off.height;
  const op = state.outerPadding;
  let cW = baseW + op * 2;  // fixed — background ignores zoom
  let cH = baseH + op * 2;

  canvas.width  = cW;
  canvas.height = cH;

  ctx.clearRect(0,0,cW,cH);
  drawBackground(ctx, cW, cH);

  const tZ  = state.tiltAngle   * Math.PI/180;
  const rX  = state.depthAngle  * Math.PI/180;
  const rY  = state.depthAngleY * Math.PI/180;
  const {trapLeft: tL, trapRight: tR, trapTop: tT, trapBottom: tBot} = state;

  let corners = computeCorners(iw, ih, cW, cH, tZ, rX, rY, tL, tR, tT, tBot);
  const oxPx = state.windowOffsetX / 100 * iw;
  const oyPx = state.windowOffsetY / 100 * ih;
  if (oxPx !== 0 || oyPx !== 0) {
    corners = corners.map(c => ({x: c.x + oxPx, y: c.y + oyPx}));
  }

  // Shadow
  if (state.showShadow) {
    ctx.save();
    ctx.filter = `blur(${state.shadowBlur}px)`;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i=1;i<4;i++) ctx.lineTo(corners[i].x, corners[i].y);
    ctx.closePath(); ctx.fill();
    ctx.restore(); ctx.filter='none';
  }

  // Draw image
  const isFlat = tZ===0 && rX===0 && rY===0 && tL===100 && tR===100 && tT===100 && tBot===100;
  ctx.save();
  ctx.globalAlpha = state.windowOpacity / 100;
  if (isFlat) {
    ctx.drawImage(off, op + (baseW - iw) / 2 + oxPx, op + (baseH - ih) / 2 + oyPx);
  } else {
    drawIntoQuad(ctx, off, corners);
  }
  ctx.restore();

  // Apply image filter over the full canvas
  const filterStr = buildFilterString(state.filter, state.filterIntensity);
  if (filterStr !== 'none') {
    const tmp = document.createElement('canvas');
    tmp.width = cW; tmp.height = cH;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, cW, cH);
    ctx.filter = filterStr;
    ctx.drawImage(tmp, 0, 0);
    ctx.filter = 'none';
  }

  // Apply texture overlay
  applyTexture(ctx, cW, cH, state.texture, state.textureIntensity);

  // Screen glare overlay
  applyGlare(ctx, cW, cH);

  // Apply aspect ratio by padding the canvas
  const arParsed = parseAspectRatio(state.aspectRatio);
  if (arParsed) {
    const arRatio = arParsed[0] / arParsed[1];
    let finalW = cW, finalH = cH;
    if (cW / cH < arRatio) {
      finalW = Math.round(cH * arRatio);
    } else if (cW / cH > arRatio) {
      finalH = Math.round(cW / arRatio);
    }
    if (finalW !== cW || finalH !== cH) {
      const tmp = document.createElement('canvas');
      tmp.width = finalW; tmp.height = finalH;
      const tctx = tmp.getContext('2d');
      drawBackground(tctx, finalW, finalH);
      tctx.drawImage(canvas, Math.round((finalW - cW) / 2), Math.round((finalH - cH) / 2));
      canvas.width = finalW; canvas.height = finalH;
      canvas.getContext('2d').drawImage(tmp, 0, 0);
      cW = finalW; cH = finalH;
    }
  }

  // Watermark
  if (showWatermark) {
    const wmText = 'github.com/Mansiper/CodeShot';
    const wmFontSize = Math.max(10, Math.round(cW * 0.015));
    ctx.save();
    ctx.font = `${wmFontSize}px "Segoe UI",Arial,sans-serif`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(wmText, cW - 10, cH - 8);
    ctx.restore();
  }

  // Restore scaled pixel values after render
  if (savedScale) { Object.assign(state, savedScale); tokCache = null; }

  // Update preview display size
  scaleCanvasDisplay();
  document.getElementById('canvas-info').textContent = `${cW}×${cH}`;
}

function scheduleRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => { renderPending=false; doRender(); });
}
