/* ════════════════════════════════════════════
   EDITOR CODE THEME
════════════════════════════════════════════ */

function applyEditorTheme() {
  if (state.inputMode === 'text') {
    let el = document.getElementById('hljs-theme-style');
    if (!el) { el = document.createElement('style'); el.id='hljs-theme-style'; document.head.appendChild(el); }
    el.textContent = `#code-highlight{background:${state.plainTextBg};color:${state.plainTextColor};font-family:"${state.plainFont}",sans-serif} #code-input{caret-color:${state.plainTextColor};font-family:"${state.plainFont}",sans-serif}`;
    return;
  }

  const t = THEMES[state.theme];
  const keys = ['keyword','string','number','comment','function','title','built_in','type',
                 'class','attr','tag','name','operator','literal','variable','property',
                 'punctuation','params','meta','regexp','selector','subst','symbol','link'];
  let css = `#code-highlight{background:${t.bg};color:${t.fg};font-family:"${state.font}",monospace}\n`;
  css += `#code-input{caret-color:${t.fg};font-family:"${state.font}",monospace}\n`;
  for (const k of keys) {
    if (t[k]) {
      css += `#code-highlight .hljs-${k}{color:${t[k]}}\n`;
      // hljs v11 modifier classes (JS/TS style): hljs-title.function_, hljs-title.class_, etc.
      css += `#code-highlight .hljs-title.${k}_{color:${t[k]}}\n`;
      // C#/Java style: hljs-title nested inside any hljs-{k} wrapper
      css += `#code-highlight .hljs-${k} .hljs-title{color:${t[k]}}\n`;
      // hljs v11 modifier aliases: inherited__ → class, invoke_ → function
      if (k === 'class')    css += `#code-highlight .hljs-title.inherited__{color:${t[k]}}\n`;
      if (k === 'function') css += `#code-highlight .hljs-title.invoke_{color:${t[k]}}\n`;
    }
  }
  let el = document.getElementById('hljs-theme-style');
  if (!el) { el = document.createElement('style'); el.id='hljs-theme-style'; document.head.appendChild(el); }
  el.textContent = css;
}

function colorizeEditorDOM(container, theme) {
  function walk(node, color, parentKey) {
    if (node.nodeType !== 1) return;
    let c = color;
    let nextKey = parentKey;
    const classes = Array.from(node.classList);
    const hljsCl = classes.find(cl => cl.startsWith('hljs-'));
    if (hljsCl) {
      const baseKey = hljsCl.slice(5).replace(/-/g,'_');
      let key = baseKey;
      for (const cl of classes) {
        if (!cl.startsWith('hljs-')) {
          const mod = cl.replace(/_+$/, '');
          if (theme[mod] !== undefined) { key = mod; break; }
          if (mod === 'inherited') { key = 'class';    break; }
          if (mod === 'invoke')    { key = 'function'; break; }
        } else {
          if (cl === 'hljs-title') { key = 'class'; break; }
        }
      }
      if (key === 'title' && parentKey && parentKey !== 'title') {
        c = theme[parentKey] || theme[key] || color;
        nextKey = parentKey;
      } else {
        c = theme[key] || theme[baseKey] || color;
        nextKey = key;
      }
      node.style.color = c;
    }
    for (const ch of node.childNodes) walk(ch, c, nextKey);
  }
  walk(container, theme.fg, null);
}

function updateEditorHighlight() {
  const el = document.getElementById('code-highlight');
  if (!el) return;
  const code = document.getElementById('code-input').value;
  
  if (state.inputMode === 'text') {
    const d = document.createElement('div'); d.textContent = code;
    el.innerHTML = d.innerHTML + '\n'; return;
  }

  const lang = state.inputMode === 'markdown' ? 'markdown' : state.language;
  let html;
  try {
    html = lang === 'plaintext'
      ? hljs.highlightAuto(code).value
      : hljs.highlight(code, {language: lang, ignoreIllegals: true}).value;
  } catch(e) {
    const d = document.createElement('div'); d.textContent = code; html = d.innerHTML;
  }
  el.innerHTML = html + '\n';
  annotateHljsHtml(el);
  colorizeEditorDOM(el, THEMES[state.theme]);
}
