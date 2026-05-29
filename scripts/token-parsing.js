/* ════════════════════════════════════════════
   TOKEN PARSING
════════════════════════════════════════════ */

function parseAspectRatio(ar) {
  if (!ar || ar === 'custom') return null;
  const parts = ar.split(':').map(Number);
  return (parts.length === 2 && parts[0] > 0 && parts[1] > 0) ? parts : null;
}

// Annotates hljs-title spans that follow class/interface/namespace/etc. keywords with 'class_',
// so they pick up the 'class' theme color (C#/Java grammars don't wrap these in hljs-class).
function annotateHljsHtml(container) {
  const CLASS_KWORDS = new Set(['class','interface','record','struct','enum','namespace']);
  for (const kw of container.querySelectorAll('.hljs-keyword')) {
    if (!CLASS_KWORDS.has(kw.textContent.trim())) continue;
    let sib = kw.nextSibling;
    while (sib) {
      if (sib.nodeType === 3 && sib.textContent.trim() === '') { sib = sib.nextSibling; continue; }
      if (sib.nodeType === 1 && sib.classList.contains('hljs-title') && !sib.classList.contains('class_'))
        sib.classList.add('class_');
      break;
    }
  }
}

function parseTokens(html, theme) {
  const div = document.createElement('div');
  div.innerHTML = html;
  annotateHljsHtml(div);
  const out = [];
  // parentKey: the semantic key of the nearest ancestor hljs span (e.g. 'function', 'class')
  function walk(node, color, parentKey) {
    if (node.nodeType === 3) { if (node.textContent) out.push({text:node.textContent, color}); return; }
    if (node.nodeType !== 1) return;
    let c = color;
    let nextKey = parentKey;
    const classes = Array.from(node.classList);
    const hljsCl = classes.find(cl => cl.startsWith('hljs-'));
    if (hljsCl) {
      const baseKey = hljsCl.slice(5).replace(/-/g,'_');
      // hljs v11 modifier classes (e.g. "function_", "class_" on the same span as "hljs-title")
      let key = baseKey;
      for (const cl of classes) {
        if (!cl.startsWith('hljs-')) {
          const mod = cl.replace(/_+$/, ''); // strip all trailing underscores
          if (theme[mod] !== undefined) { key = mod; break; }
          // hljs v11 modifier aliases that don't directly match a theme key
          if (mod === 'inherited') { key = 'class';    break; }
          if (mod === 'invoke')    { key = 'function'; break; }
        }
      }
      // hljs C#/Java style: function name is hljs-title nested inside hljs-function wrapper.
      // When hljs-title is encountered, prefer the semantic parent context over generic 'title'.
      if (key === 'title' && parentKey && parentKey !== 'title') {
        c = theme[parentKey] || theme[key] || color;
        nextKey = parentKey;
      } else {
        c = theme[key] || theme[baseKey] || color;
        nextKey = key;
      }
    }
    for (const ch of node.childNodes) walk(ch, c, nextKey);
  }
  walk(div, theme.fg, null);
  return out;
}

function getTokens() {
  if (state.inputMode === 'text' || state.inputMode === 'markdown') {
    const text = state.code || ' ';
    return [{ text, color: state.plainTextColor }];
  }
  
  const code = state.code || ' ';
  const lang = state.language;
  const theme = THEMES[state.theme];
  const cacheKey = `${code}|${lang}|${state.theme}`;
  if (tokCache && tokCache.key === cacheKey) return tokCache.tokens;
  let html;
  try {
    html = lang === 'plaintext'
      ? hljs.highlightAuto(code).value
      : hljs.highlight(code, {language:lang, ignoreIllegals:true}).value;
  } catch(e) {
    html = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  const tokens = parseTokens(html, theme);
  tokCache = {key:cacheKey, tokens};
  return tokens;
}

function buildLines(tokens) {
  const lines = [[]];
  const tabStr = ' '.repeat(state.tabSize || 4);
  for (const t of tokens) {
    const parts = t.text.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([]);
      const s = parts[i].replace(/\t/g, tabStr);
      if (s) lines[lines.length-1].push({text:s, color:t.color});
    }
  }
  return lines;
}
