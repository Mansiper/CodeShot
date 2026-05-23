'use strict';

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */

const STORAGE_KEY  = 'codeshot';
const SPLIT_KEY    = 'codeshot_split';
const PRESETS_KEY  = 'codeshot_presets';
const SAVE_DELAY   = 1000;
const UI_THEME_KEY = 'codeshot_ui_theme';
const MAX_LINES    = 30;
const MAX_COLS     = 150;

const THEMES = {
  'one-dark':    {name:'One Dark',     bg:'#282c34',fg:'#abb2bf',keyword:'#c678dd',string:'#98c379',number:'#d19a66',comment:'#5c6370',function:'#61afef',title:'#61afef',built_in:'#e5c07b',type:'#e5c07b',class:'#e5c07b',attr:'#d19a66',tag:'#e06c75',name:'#e06c75',operator:'#c678dd',literal:'#56b6c2',variable:'#e06c75',property:'#56b6c2',punctuation:'#abb2bf',params:'#d19a66',meta:'#5c6370',regexp:'#98c379',selector:'#e06c75',subst:'#abb2bf',symbol:'#56b6c2',link:'#98c379'},
  'monokai':     {name:'Monokai',      bg:'#272822',fg:'#f8f8f2',keyword:'#f92672',string:'#e6db74',number:'#ae81ff',comment:'#75715e',function:'#a6e22e',title:'#a6e22e',built_in:'#66d9ef',type:'#66d9ef',class:'#a6e22e',attr:'#a6e22e',tag:'#f92672',name:'#f92672',operator:'#f92672',literal:'#ae81ff',variable:'#f8f8f2',property:'#a6e22e',punctuation:'#f8f8f2',params:'#fd971f',meta:'#75715e',regexp:'#e6db74',selector:'#a6e22e',subst:'#f8f8f2',symbol:'#ae81ff',link:'#e6db74'},
  'dracula':     {name:'Dracula',      bg:'#282a36',fg:'#f8f8f2',keyword:'#ff79c6',string:'#f1fa8c',number:'#bd93f9',comment:'#6272a4',function:'#50fa7b',title:'#50fa7b',built_in:'#8be9fd',type:'#8be9fd',class:'#ffb86c',attr:'#50fa7b',tag:'#ff79c6',name:'#ff79c6',operator:'#ff79c6',literal:'#bd93f9',variable:'#f8f8f2',property:'#8be9fd',punctuation:'#f8f8f2',params:'#ffb86c',meta:'#6272a4',regexp:'#f1fa8c',selector:'#ff79c6',subst:'#f8f8f2',symbol:'#bd93f9',link:'#f1fa8c'},
  'nord':        {name:'Nord',         bg:'#2e3440',fg:'#d8dee9',keyword:'#81a1c1',string:'#a3be8c',number:'#b48ead',comment:'#616e88',function:'#88c0d0',title:'#88c0d0',built_in:'#81a1c1',type:'#8fbcbb',class:'#8fbcbb',attr:'#8fbcbb',tag:'#81a1c1',name:'#81a1c1',operator:'#81a1c1',literal:'#b48ead',variable:'#d8dee9',property:'#88c0d0',punctuation:'#d8dee9',params:'#d8dee9',meta:'#616e88',regexp:'#ebcb8b',selector:'#88c0d0',subst:'#d8dee9',symbol:'#b48ead',link:'#a3be8c'},
  'tokyo-night': {name:'Tokyo Night',  bg:'#1a1b2e',fg:'#a9b1d6',keyword:'#bb9af7',string:'#9ece6a',number:'#ff9e64',comment:'#565f89',function:'#7aa2f7',title:'#7aa2f7',built_in:'#2ac3de',type:'#2ac3de',class:'#e0af68',attr:'#73daca',tag:'#f7768e',name:'#f7768e',operator:'#89ddff',literal:'#ff9e64',variable:'#c0caf5',property:'#73daca',punctuation:'#89ddff',params:'#e0af68',meta:'#565f89',regexp:'#b4f9f8',selector:'#f7768e',subst:'#c0caf5',symbol:'#ff9e64',link:'#9ece6a'},
  'github-dark': {name:'GitHub Dark',  bg:'#0d1117',fg:'#e6edf3',keyword:'#ff7b72',string:'#a5d6ff',number:'#79c0ff',comment:'#8b949e',function:'#d2a8ff',title:'#d2a8ff',built_in:'#79c0ff',type:'#ffa657',class:'#ffa657',attr:'#79c0ff',tag:'#7ee787',name:'#7ee787',operator:'#ff7b72',literal:'#79c0ff',variable:'#ffa657',property:'#79c0ff',punctuation:'#e6edf3',params:'#e6edf3',meta:'#8b949e',regexp:'#a5d6ff',selector:'#7ee787',subst:'#e6edf3',symbol:'#79c0ff',link:'#a5d6ff'},
  'github-light':{name:'GitHub Light', bg:'#ffffff',fg:'#24292f',keyword:'#cf222e',string:'#0a3069',number:'#0550ae',comment:'#6e7781',function:'#8250df',title:'#8250df',built_in:'#0550ae',type:'#0550ae',class:'#953800',attr:'#0550ae',tag:'#116329',name:'#116329',operator:'#cf222e',literal:'#0550ae',variable:'#24292f',property:'#0550ae',punctuation:'#24292f',params:'#24292f',meta:'#6e7781',regexp:'#116329',selector:'#116329',subst:'#24292f',symbol:'#0550ae',link:'#0a3069'},
  'solarized':   {name:'Solarized',    bg:'#002b36',fg:'#839496',keyword:'#859900',string:'#2aa198',number:'#d33682',comment:'#586e75',function:'#268bd2',title:'#268bd2',built_in:'#268bd2',type:'#b58900',class:'#b58900',attr:'#657b83',tag:'#268bd2',name:'#268bd2',operator:'#859900',literal:'#2aa198',variable:'#839496',property:'#268bd2',punctuation:'#839496',params:'#839496',meta:'#586e75',regexp:'#2aa198',selector:'#268bd2',subst:'#839496',symbol:'#cb4b16',link:'#2aa198'},
};

const GRADIENT_PRESETS = [
  ['#0f0c29','#302b63',135],['#0a0a2e','#1a0533',180],['#001f3f','#0a3d62',150],
  ['#1a0000','#3d0000',160],['#001a00','#003300',140],['#1a1a2e','#0f3460',135],
  ['#2d1b69','#11998e',120],['#141e30','#243b55',180],['#16213e','#e94560',135],
  ['#373b44','#4286f4',150],
];

const CHROME_STYLES = [
  { id:'macos',  name:'macOS',
    html:`<div class="c-dot" style="background:#ff5f57"></div><div class="c-dot" style="background:#febc2e"></div><div class="c-dot" style="background:#28c840"></div>` },
  { id:'windows',name:'Windows',
    html:`<div style="flex:1"></div><div class="c-btn">—</div><div class="c-btn">□</div><div class="c-btn x">✕</div>` },
  { id:'gnome',  name:'GNOME',
    html:`<div class="c-dot" style="background:#888"></div><div class="c-dot" style="background:#888"></div><div style="flex:1"></div><div class="c-btn x" style="border-radius:50%">✕</div>` },
  { id:'none',   name:'None',
    html:`<div style="flex:1;text-align:center;font-size:7px;color:rgba(255,255,255,.25);font-family:sans-serif;line-height:16px">— no chrome —</div>` },
];

const FILTERS = [
  { id: 'none',        name: 'None',        preview: 'linear-gradient(135deg,#444,#888)' },
  { id: 'bw',          name: 'B&W',         preview: 'linear-gradient(135deg,#111,#eee)' },
  { id: 'sepia',       name: 'Sepia',       preview: 'linear-gradient(135deg,#704214,#c8a87a)' },
  { id: 'cool',        name: 'Cool',        preview: 'linear-gradient(135deg,#1a3a5c,#6ab0d8)' },
  { id: 'warm',        name: 'Warm',        preview: 'linear-gradient(135deg,#7c2b00,#f5a623)' },
  { id: 'faded',       name: 'Faded',       preview: 'linear-gradient(135deg,#aaa,#ccc)' },
  { id: 'vivid',       name: 'Vivid',       preview: 'linear-gradient(135deg,#ff0080,#00ff80)' },
  { id: 'cinematic',   name: 'Cinematic',   preview: 'linear-gradient(135deg,#1a0000,#8b7355)' },
  { id: 'noir',        name: 'Noir',        preview: 'linear-gradient(135deg,#000,#222)' },
  { id: 'amber',       name: 'Amber',       preview: 'linear-gradient(135deg,#3d1c00,#ff8c00)' },
  { id: 'mint',        name: 'Mint',        preview: 'linear-gradient(135deg,#1a3d2e,#5ecfb0)' },
  { id: 'dusk',        name: 'Dusk',        preview: 'linear-gradient(135deg,#3b1f5e,#e8608a)' },
  { id: 'retro',       name: 'Retro',       preview: 'linear-gradient(135deg,#7a4e2d,#c9a96e)' },
  { id: 'neon',        name: 'Neon',        preview: 'linear-gradient(135deg,#ff00cc,#00ffcc)' },
  { id: 'lofi',        name: 'Lo-Fi',       preview: 'linear-gradient(135deg,#2e1a00,#c88c3a)' },
  { id: 'bleach',      name: 'Bleach',      preview: 'linear-gradient(135deg,#999,#eee)' },
  { id: 'ice',         name: 'Ice',         preview: 'linear-gradient(135deg,#a8d8f0,#e8f6ff)' },
  { id: 'overexposed', name: 'Overexp...',  preview: 'linear-gradient(135deg,#ddd,#fff)' },
  { id: 'darkroom',    name: 'Dark Room',   preview: 'linear-gradient(135deg,#000,#1a1a1a)' },
  { id: 'dreamy',      name: 'Dreamy',      preview: 'linear-gradient(135deg,#c8b4e0,#f0e6ff)' },
];

const TEXTURES = [
  { id: 'none',          name: 'None',     preview: 'linear-gradient(135deg,#444,#888)' },
  { id: 'paper',         name: 'Paper',    preview: 'linear-gradient(135deg,#c8b89a,#e8dfc0)' },
  { id: 'grain',         name: 'Grain',    preview: 'linear-gradient(135deg,#2a2a2a,#666)' },
  { id: 'linen',         name: 'Linen',    preview: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,.12) 3px),repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(255,255,255,.06) 3px)' },
  { id: 'wood',          name: 'Wood',     preview: 'linear-gradient(135deg,#5d3a1a,#a0522d,#7b3f00)' },
  { id: 'metal-shiny',   name: 'Metal',    preview: 'linear-gradient(120deg,#888,#ddd,#aaa,#eee,#999)' },
  { id: 'metal-brushed', name: 'Brushed',  preview: 'repeating-linear-gradient(180deg,#999 0px,#bbb 1px,#aaa 2px,#ccc 3px)' },
  { id: 'carbon',        name: 'Carbon',   preview: 'repeating-linear-gradient(45deg,#111 0px,#333 4px,#111 8px)' },
  { id: 'scanlines',     name: 'Scanlines',preview: 'repeating-linear-gradient(180deg,rgba(0,0,0,.35) 0px,rgba(0,0,0,.35) 1px,transparent 1px,transparent 2px)' },
  { id: 'glitter',       name: 'Glitter',  preview: 'radial-gradient(circle at 20% 40%,#ff0 1px,transparent 2px),radial-gradient(circle at 60% 70%,#f0f 1px,transparent 2px),radial-gradient(circle at 80% 20%,#0ff 1px,transparent 2px),linear-gradient(135deg,#111,#333)' },
  { id: 'noise',         name: 'Noise',     preview: 'linear-gradient(135deg,#1a1a1a,#555)' },
  { id: 'dots',          name: 'Dots',      preview: 'radial-gradient(circle,#fff 1px,transparent 1px)' },
  { id: 'grid',          name: 'Grid',      preview: 'linear-gradient(#555 1px,transparent 1px),linear-gradient(90deg,#555 1px,transparent 1px)' },
  { id: 'diagonal',      name: 'Diagonal',  preview: 'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(255,255,255,.15) 5px)' },
  { id: 'crosshatch',    name: 'Crosshatch',preview: 'repeating-linear-gradient(45deg,rgba(255,255,255,.08) 0,rgba(255,255,255,.08) 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,rgba(255,255,255,.08) 0,rgba(255,255,255,.08) 1px,transparent 0,transparent 50%)' },
  { id: 'hex',           name: 'Hex',       preview: 'linear-gradient(135deg,#1a2a1a,#3a5a3a)' },
  { id: 'concrete',      name: 'Concrete',  preview: 'linear-gradient(135deg,#555,#888)' },
  { id: 'denim',         name: 'Denim',     preview: 'repeating-linear-gradient(30deg,#1a2a4a,#1a2a4a 4px,#243560 4px,#243560 8px)' },
  { id: 'vignette',      name: 'Vignette',  preview: 'radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.8) 100%)' },
  { id: 'frosted',       name: 'Frosted',   preview: 'linear-gradient(135deg,rgba(255,255,255,.15),rgba(255,255,255,.05))' },
];

const LANGUAGES = ['bash','csharp','c','cpp','css','dart','pascal','dockerfile','elixir','erlang','fsharp','go',
  'graphql','groovy','haskell','html','ini','java','javascript','json','jsx','kotlin','tex','lisp','lua',
  'makefile','markdown','matlab','nginx','objectivec','perl','php','powershell','python','r','ruby','rust','scala',
  'scss','shell','sql','swift','toml','tsx','typescript','vbnet','vim','xml','yaml','1c'];

const LANGUAGE_NAMES = {
  csharp:'C#', c:'C', cpp:'C++', javascript:'JavaScript', typescript:'TypeScript',
  html:'HTML', css:'CSS', scss:'SCSS', json:'JSON', yaml:'YAML', toml:'TOML',
  sql:'SQL', php:'PHP', jsx:'JSX', tsx:'TSX', xml:'XML', graphql:'GraphQL',
  nginx:'NGINX', matlab:'MATLAB', powershell:'PowerShell', r:'R',
  pascal:'Delphi', erlang:'Erlang', fsharp:'F#', ini:'INI',
  tex:'LaTeX', lisp:'Lisp', objectivec:'Objective-C', vbnet:'VB.NET',
  vim:'VimL', '1c':'1C', dart:'Dart',
};

const PLAIN_FONTS = [
  'Arial','Bookman Old Style','Century Gothic',
  'Comic Sans MS','Garamond','Georgia','Gill Sans',
  'Helvetica','Impact','Lucida Sans','Palatino',
  'Tahoma','Times New Roman','Trebuchet MS','Verdana',
];

const moonIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
const sunIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

/* ════════════════════════════════════════════
   STATE
════════════════════════════════════════════ */

const DEFAULTS = {
  code:`// Beautiful code screenshots in seconds\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconst results = Array.from(\n  { length: 10 },\n  (_, i) => fibonacci(i)\n);\n\nconsole.log('Sequence:', results.join(', '));`,
  language:'javascript', font:'JetBrains Mono', fontSize:14, lineHeight:1.6,
  theme:'one-dark',
  bgType:'gradient', bgSolid:'#1a1b2e', gradC1:'#0f0c29', gradC2:'#302b63', gradAngle:135,
  outerPadding:56, innerPadding:40, cornerRadius:14,
  chromeStyle:'macos', windowTitle: 'code',
  showLineNumbers:false, firstLineNumber:1, lineNumberColor:'',
  showShadow:true, shadowBlur:30,
  tiltAngle:0, depthAngle:0, depthAngleY:0,
  windowOffsetX: 0, windowOffsetY: 0,
  trapLeft:100, trapRight:100, trapTop:100, trapBottom:100,
  gradBlur:false, gradBlurDir:'bottom', gradBlurAmount:20, gradBlurStart:30,
  filter: 'none',
  filterIntensity: 100,
  inputMode: 'code',
  plainTextColor: '#e0e0e0',
  plainTextBg: '#1e1e2e',
  plainFont: 'Arial',
  mdHeadingColor: '#e2c08d',
  mdLinkColor: '#61afef',
  selectionColor: '#6490ff',
  selectionOpacity: 25,
  zoom: 100,
  windowOpacity: 100,
  plainTextAlign: 'left',
  texture: 'none',
  textureIntensity: 50,
  glareEnabled: false,
  glareX: 50,
  glareY: 50,
  glareDistance: 200,
  glareAngleH: 0,
  glareAngleV: 0,
  glareBlur: 30,
  glareIntensity: 60,
  glareColor: '#ffffff',
};

let state = { ...DEFAULTS };
let splitRatio = 0.5;
let saveTimer = null;
let tokCache = null;
let selectionRange = null;
let showWatermark = true;

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

/* ════════════════════════════════════════════
   TOKEN PARSING
════════════════════════════════════════════ */

function parseTokens(html, theme) {
  const div = document.createElement('div');
  div.innerHTML = html;
  const out = [];
  function walk(node, color) {
    if (node.nodeType === 3) { if (node.textContent) out.push({text:node.textContent, color}); return; }
    if (node.nodeType !== 1) return;
    let c = color;
    for (const cl of node.classList) {
      if (cl.startsWith('hljs-')) {
        const k = cl.slice(5).replace(/-/g,'_');
        c = theme[k] || theme[cl.slice(5)] || color;
        break;
      }
    }
    for (const ch of node.childNodes) walk(ch, c);
  }
  walk(div, theme.fg);
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
  for (const t of tokens) {
    const parts = t.text.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([]);
      const s = parts[i].replace(/\t/g,'    ');
      if (s) lines[lines.length-1].push({text:s, color:t.color});
    }
  }
  return lines;
}

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
    const r = Math.max(5, Math.round(fontSize * 0.38));
    const gap = r * 2 + 6;
    ['#ff5f57','#febc2e','#28c840'].forEach((c, i) => {
      ctx.beginPath(); ctx.arc(pad + r + i*gap, cy, r, 0, Math.PI*2);
      ctx.fillStyle = c; ctx.fill();
    });

  } else if (style === 'windows') {
    // App title
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
    ctx.font = `${Math.round(fontSize*0.72)}px "Segoe UI",Arial,sans-serif`;
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
      ctx.font = `${Math.round(fontSize*0.7)}px "Segoe UI",Arial,sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b.icon, bx + bW/2, cy + (b.icon==='−' ? 2 : 0));
    });
    ctx.textAlign = 'left';

  } else if (style === 'gnome') {
    // Title center
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)';
    ctx.font = `${Math.round(fontSize*0.72)}px "Ubuntu","Cantarell",Arial,sans-serif`;
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
    const r = Math.max(5, Math.round(fontSize * 0.38));
    [0,1].forEach(i => {
      ctx.beginPath(); ctx.arc(pad + r + i*(r*2+5), cy, r, 0, Math.PI*2);
      ctx.fillStyle = '#787878'; ctx.fill();
    });
    // Right: close (red circle with X)
    const cr = Math.max(5, Math.round(fontSize * 0.4));
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

/* ════════════════════════════════════════════
   CODE CANVAS
════════════════════════════════════════════ */

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
  const lineNoW = showLineNumbers ? mc.measureText(String(lines.length)+'  ').width : 0;

  let maxLineW = 0;
  for (const line of lines) {
    let w = lineNoW;
    for (const t of line) w += mc.measureText(t.text).width;
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
      const pre = raw.slice(0, cS).replace(/\t/g, '    ');
      const sel = raw.slice(cS, cE).replace(/\t/g, '    ');
      const xOff = ctx.measureText(pre).width;
      const xW   = sel.length ? ctx.measureText(sel).width : ctx.measureText(' ').width;
      ctx.fillRect(innerPadding + lineNoW + xOff, innerPadding + chromeH + li * lh - Math.round((fontSize + 1) / 5.5), xW, lh);
    }
  }

  // Code
  ctx.font = fontStr; ctx.textBaseline = 'top';
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
          ctx.fillStyle = lineTokens[0].color;
          for (let wi = 0; wi < words.length; wi++) {
            ctx.fillText(words[wi], jx, y);
            jx += ctx.measureText(words[wi]).width + (wi < words.length - 1 ? spaceW : 0);
          }
          y += lh;
          continue;
        }
        // last line or single word: left-align (x stays at xBase)
      }
    }

    for (const t of lineTokens) {
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, x, y);
      x += ctx.measureText(t.text).width;
    }
    y += lh;
  }
  
  return off;
}

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

/* ════════════════════════════════════════════
   PERSPECTIVE + TRAPEZOID
════════════════════════════════════════════ */

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function computeCorners(iw, ih, cw, ch, tZ, rX, rY, trapL, trapR, trapT, trapB) {
  const focal = Math.max(cw, ch) * 1.4;
  const halfW  = iw / 2;
  const halfH  = ih / 2;
  // trapezoid corner adjustments
  const tL  = trapL  / 100;  // left side height factor
  const tR  = trapR  / 100;  // right side height factor
  const tTop = trapT / 100;  // top side width factor
  const tBot = trapB / 100;  // bottom side width factor

  // Raw corners with trapezoid
  const pts = [
    [-halfW * tTop, -halfH * tL, 0],  // TL
    [ halfW * tTop, -halfH * tR, 0],  // TR
    [ halfW * tBot,  halfH * tR, 0],  // BR
    [-halfW * tBot,  halfH * tL, 0],  // BL
  ];

  const cZ=Math.cos(tZ), sZ=Math.sin(tZ);
  const cX=Math.cos(rX), sX=Math.sin(rX);
  const cY=Math.cos(rY), sY=Math.sin(rY);

  return pts.map(([x,y,z]) => {
    // Z rotation
    let x1=x*cZ-y*sZ, y1=x*sZ+y*cZ, z1=z;
    // X rotation (depth)
    let x2=x1, y2=y1*cX-z1*sX, z2=y1*sX+z1*cX;
    // Y rotation
    let x3=x2*cY+z2*sY, y3=y2, z3=-x2*sY+z2*cY;
    const s = focal / (focal + z3);
    return {x: x3*s + cw/2, y: y3*s + ch/2};
  });
}

function drawIntoQuad(ctx, img, corners) {
  const [TL,TR,BR,BL] = corners;
  const srcH = img.height, srcW = img.width;
  for (let i = 0; i <= srcH; i++) {
    const t = i / srcH;
    const Lx=TL.x+(BL.x-TL.x)*t, Ly=TL.y+(BL.y-TL.y)*t;
    const Rx=TR.x+(BR.x-TR.x)*t, Ry=TR.y+(BR.y-TR.y)*t;
    const dw = Math.sqrt((Rx-Lx)**2+(Ry-Ly)**2);
    if (dw < 0.5) continue;
    const ang = Math.atan2(Ry-Ly, Rx-Lx);
    ctx.setTransform(Math.cos(ang),Math.sin(ang),-Math.sin(ang),Math.cos(ang),Lx,Ly);
    ctx.drawImage(img, 0,i,srcW,1, 0,-0.5,dw,1.5);
  }
  ctx.setTransform(1,0,0,1,0,0);
}

function drawBackground(ctx, w, h) {
  if (state.bgType === 'none') return;
  if (state.bgType === 'solid') {
    ctx.fillStyle = state.bgSolid; ctx.fillRect(0,0,w,h);
  } else {
    const rad = state.gradAngle * Math.PI/180;
    const dx = Math.cos(rad), dy = Math.sin(rad);
    const g = ctx.createLinearGradient(w/2-dx*w/2, h/2-dy*h/2, w/2+dx*w/2, h/2+dy*h/2);
    g.addColorStop(0, state.gradC1); g.addColorStop(1, state.gradC2);
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  }
}

/* ════════════════════════════════════════════
   IMAGE FILTERS
════════════════════════════════════════════ */

function buildFilterString(filterId, intensity) {
  if (filterId === 'none' || intensity === 0) return 'none';
  const t = intensity / 100;
  const gs  = v => (v * t).toFixed(3);        // grayscale / sepia  (neutral = 0)
  const adj = v => (1 + t * (v - 1)).toFixed(3); // sat / contrast / brightness (neutral = 1)
  const deg = v => (t * v).toFixed(1);         // hue-rotate  (neutral = 0°)
  switch (filterId) {
    case 'bw':        return `grayscale(${gs(1)})`;
    case 'sepia':     return `sepia(${gs(1)})`;
    case 'cool':      return `saturate(${adj(0.7)}) hue-rotate(${deg(200)}deg) brightness(${adj(0.95)})`;
    case 'warm':      return `saturate(${adj(1.3)}) hue-rotate(${deg(-20)}deg) brightness(${adj(1.05)})`;
    case 'faded':     return `contrast(${adj(0.80)}) brightness(${adj(1.10)}) saturate(${adj(0.70)})`;
    case 'vivid':     return `saturate(${adj(2.0)}) contrast(${adj(1.10)})`;
    case 'cinematic': return `contrast(${adj(1.30)}) saturate(${adj(0.80)}) brightness(${adj(0.90)})`;
    case 'noir':      return `grayscale(${gs(1)}) contrast(${adj(1.50)})`;
    case 'amber':     return `sepia(${gs(0.70)}) saturate(${adj(1.50)}) hue-rotate(${deg(-10)}deg) brightness(${adj(0.95)})`;
    case 'mint':        return `hue-rotate(${deg(150)}deg) saturate(${adj(0.55)}) brightness(${adj(1.05)})`;
    case 'dusk':        return `hue-rotate(${deg(-40)}deg) saturate(${adj(1.30)}) brightness(${adj(0.90)})`;
    case 'retro':       return `sepia(${gs(0.40)}) contrast(${adj(0.85)}) brightness(${adj(1.10)}) saturate(${adj(0.80)}) hue-rotate(${deg(-10)}deg)`;
    case 'neon':        return `saturate(${adj(3.00)}) contrast(${adj(1.50)})`;
    case 'lofi':        return `contrast(${adj(1.40)}) saturate(${adj(1.20)}) hue-rotate(${deg(-10)}deg)`;
    case 'bleach':      return `grayscale(${gs(0.50)}) contrast(${adj(1.80)}) brightness(${adj(1.10)}) saturate(${adj(0.30)})`;
    case 'ice':         return `hue-rotate(${deg(180)}deg) saturate(${adj(0.70)}) brightness(${adj(1.30)})`;
    case 'overexposed': return `brightness(${adj(1.80)}) contrast(${adj(0.80)})`;
    case 'darkroom':    return `brightness(${adj(0.60)}) contrast(${adj(1.80)})`;
    case 'dreamy':      return `brightness(${adj(1.20)}) contrast(${adj(0.75)}) saturate(${adj(0.90)}) blur(${(t*1.5).toFixed(1)}px)`;
    default:          return 'none';
  }
}

/* ════════════════════════════════════════════
   TEXTURES
════════════════════════════════════════════ */

function applyTexture(ctx, cW, cH, textureId, intensity) {
  if (textureId === 'none' || intensity === 0) return;
  const a = intensity / 100;

  function patternFill(tile, alpha) {
    const pat = ctx.createPattern(tile, 'repeat');
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, cW, cH);
    ctx.restore();
  }

  function noiseTile(size, r, g, b, spread) {
    const tile = document.createElement('canvas');
    tile.width = size; tile.height = size;
    const tc = tile.getContext('2d');
    const img = tc.createImageData(size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * spread;
      d[i]   = Math.max(0, Math.min(255, r + n));
      d[i+1] = Math.max(0, Math.min(255, g + n));
      d[i+2] = Math.max(0, Math.min(255, b + n));
      d[i+3] = 255;
    }
    tc.putImageData(img, 0, 0);
    return tile;
  }

  switch (textureId) {

    case 'paper': {
      patternFill(noiseTile(128, 215, 200, 170, 55), a * 0.4);
      break;
    }

    case 'grain': {
      const tile = noiseTile(128, 128, 128, 128, 230);
      const pat = ctx.createPattern(tile, 'repeat');
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'linen': {
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = a * 0.18;
      for (let y = 0; y <= cH; y += 3) {
        ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(cW, y + 0.5); ctx.stroke();
      }
      ctx.globalAlpha = a * 0.08;
      for (let x = 0; x <= cW; x += 3) {
        ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, cH); ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'wood': {
      const size = 256;
      const tile = document.createElement('canvas');
      tile.width = size; tile.height = size;
      const tc = tile.getContext('2d');
      const img = tc.createImageData(size, size);
      const d = img.data;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const wave = Math.sin((y + x * 0.25) * 0.1 + Math.sin(y * 0.025) * 6) * 0.5 + 0.5;
          const v = Math.round(65 + wave * 90);
          const idx = (y * size + x) * 4;
          d[idx]   = Math.min(255, v + 75);
          d[idx+1] = Math.min(255, v + 22);
          d[idx+2] = Math.max(0,   v - 25);
          d[idx+3] = 255;
        }
      }
      tc.putImageData(img, 0, 0);
      patternFill(tile, a * 0.65);
      break;
    }

    case 'metal-shiny': {
      const stripeW = 28;
      ctx.save();
      for (let x = -cH; x < cW + cH; x += stripeW * 2) {
        const g = ctx.createLinearGradient(x, 0, x + stripeW, cH);
        g.addColorStop(0,    `rgba(255,255,255,0)`);
        g.addColorStop(0.35, `rgba(255,255,255,${a * 0.3})`);
        g.addColorStop(0.5,  `rgba(255,255,255,${a * 0.55})`);
        g.addColorStop(0.65, `rgba(255,255,255,${a * 0.3})`);
        g.addColorStop(1,    `rgba(255,255,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripeW, 0);
        ctx.lineTo(x + stripeW + cH, cH);
        ctx.lineTo(x + cH, cH);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'metal-brushed': {
      const tile = document.createElement('canvas');
      tile.width = 1; tile.height = cH;
      const tc = tile.getContext('2d');
      const img = tc.createImageData(1, cH);
      const d = img.data;
      for (let y = 0; y < cH; y++) {
        const v = Math.round(160 + (Math.random() - 0.5) * 80);
        const idx = y * 4;
        d[idx]   = Math.min(255, v);
        d[idx+1] = Math.min(255, v + 8);
        d[idx+2] = Math.min(255, v + 18);
        d[idx+3] = 255;
      }
      tc.putImageData(img, 0, 0);
      ctx.save();
      ctx.globalAlpha = a * 0.22;
      ctx.drawImage(tile, 0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'carbon': {
      const ts = 8;
      const tile = document.createElement('canvas');
      tile.width = ts * 2; tile.height = ts * 2;
      const tc = tile.getContext('2d');
      for (let ty = 0; ty < 2; ty++) {
        for (let tx = 0; tx < 2; tx++) {
          tc.save();
          tc.translate(tx * ts + ts / 2, ty * ts + ts / 2);
          tc.rotate((tx + ty) % 2 === 0 ? Math.PI / 4 : -Math.PI / 4);
          const g = tc.createLinearGradient(-ts, 0, ts, 0);
          g.addColorStop(0,    'rgba(255,255,255,0.00)');
          g.addColorStop(0.35, 'rgba(255,255,255,0.12)');
          g.addColorStop(0.5,  'rgba(255,255,255,0.22)');
          g.addColorStop(0.65, 'rgba(255,255,255,0.12)');
          g.addColorStop(1,    'rgba(255,255,255,0.00)');
          tc.fillStyle = g;
          tc.fillRect(-ts, -ts / 2, ts * 2, ts);
          tc.restore();
        }
      }
      patternFill(tile, a);
      break;
    }

    case 'scanlines': {
      ctx.save();
      ctx.globalAlpha = a * 0.3;
      ctx.fillStyle = '#000';
      for (let y = 0; y < cH; y += 2) {
        ctx.fillRect(0, y, cW, 1);
      }
      ctx.restore();
      break;
    }

    case 'glitter': {
      const count = Math.round(cW * cH * 0.002);
      ctx.save();
      for (let i = 0; i < count; i++) {
        const x = Math.random() * cW;
        const y = Math.random() * cH;
        const hue = Math.random() * 360;
        const sz = Math.random() * 1.2 + 0.3;
        ctx.globalAlpha = a * (0.5 + Math.random() * 0.5);
        ctx.fillStyle = `hsl(${hue},100%,85%)`;
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

        case 'noise': {
      const tile = noiseTile(128, 128, 128, 128, 120);
      const pat = ctx.createPattern(tile, 'repeat');
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'dots': {
      const spacing = 10;
      const r = 1;
      ctx.save();
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = '#fff';
      for (let y = spacing / 2; y < cH; y += spacing) {
        for (let x = spacing / 2; x < cW; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      break;
    }

    case 'grid': {
      const spacing = 20;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = a * 0.15;
      for (let y = 0; y <= cH; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(cW, y + 0.5); ctx.stroke();
      }
      for (let x = 0; x <= cW; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, cH); ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'diagonal': {
      const gap = 10;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.75;
      ctx.globalAlpha = a * 0.18;
      for (let i = -cH; i < cW + cH; i += gap) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + cH, cH);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'crosshatch': {
      const gap = 12;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = a * 0.14;
      for (let i = -cH; i < cW + cH; i += gap) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + cH, cH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i + cH, 0); ctx.lineTo(i, cH); ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'hex': {
      const size = 14;
      const w = size * 2;
      const h = Math.sqrt(3) * size;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.7;
      ctx.globalAlpha = a * 0.2;
      for (let row = -1; row * h < cH + h; row++) {
        for (let col = -1; col * w * 0.75 < cW + w; col++) {
          const cx2 = col * w * 0.75;
          const cy2 = row * h + (col % 2 === 0 ? 0 : h / 2);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i - 30);
            const px = cx2 + size * Math.cos(angle);
            const py = cy2 + size * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
      break;
    }

    case 'concrete': {
      const tile = noiseTile(128, 140, 135, 130, 180);
      const pat = ctx.createPattern(tile, 'repeat');
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'denim': {
      const ts = 6;
      const tile = document.createElement('canvas');
      tile.width = ts; tile.height = ts;
      const tc = tile.getContext('2d');
      tc.fillStyle = 'rgba(30,50,90,1)';
      tc.fillRect(0, 0, ts, ts);
      tc.strokeStyle = 'rgba(255,255,255,0.18)';
      tc.lineWidth = 1;
      tc.beginPath(); tc.moveTo(0, ts); tc.lineTo(ts, 0); tc.stroke();
      patternFill(tile, a * 0.55);
      break;
    }

    case 'vignette': {
      ctx.save();
      const rg = ctx.createRadialGradient(cW/2, cH/2, Math.min(cW,cH)*0.25, cW/2, cH/2, Math.max(cW,cH)*0.75);
      rg.addColorStop(0,   'rgba(0,0,0,0)');
      rg.addColorStop(1,   `rgba(0,0,0,${a * 0.75})`);
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'frosted': {
      ctx.save();
      ctx.globalAlpha = a * 0.12;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cW, cH);
      const fg = ctx.createLinearGradient(0, 0, cW, cH);
      fg.addColorStop(0,   `rgba(255,255,255,${a * 0.15})`);
      fg.addColorStop(0.5, `rgba(255,255,255,${a * 0.04})`);
      fg.addColorStop(1,   `rgba(255,255,255,${a * 0.10})`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }
  }
}

/* ════════════════════════════════════════════
   SCREEN GLARE
════════════════════════════════════════════ */

function applyGlare(ctx, cW, cH) {
  if (!state.glareEnabled) return;

  const gx = state.glareX / 100 * cW;
  const gy = state.glareY / 100 * cH;

  // Distance controls spread: smaller distance → larger glare
  const dist = Math.max(10, state.glareDistance);
  const baseR = Math.max(cW, cH) * (150 / dist);

  // Light source sits at (d·tan θh, d·tan θv, d).
  // The cross-section of the light cone (a circle) projected onto the screen
  // plane forms an ellipse:
  //   • minor semi-axis  = baseR  (perpendicular to the projection direction)
  //   • major semi-axis  = baseR / cosI  (along the projection direction)
  //   • cosI = 1 / √(tan²θh + tan²θv + 1)
  //   • rotation angle φ = atan2(tan θv, tan θh)
  const ah = state.glareAngleH * Math.PI / 180;
  const av = state.glareAngleV * Math.PI / 180;
  const tx = Math.tan(ah);
  const ty = Math.tan(av);
  const cosI   = 1 / Math.sqrt(tx * tx + ty * ty + 1);
  const rMajor = baseR / cosI;   // elongated along light projection
  const rMinor = baseR;
  const phi    = Math.atan2(ty, tx); // rotation of major axis

  if (rMajor < 1 || rMinor < 1) return;

  // Render glare onto an offscreen canvas
  const off = document.createElement('canvas');
  off.width = cW; off.height = cH;
  const octx = off.getContext('2d');

  const [r, g, b] = hexRgb(state.glareColor);
  const intensity = state.glareIntensity / 100;

  octx.save();
  octx.translate(gx, gy);
  octx.rotate(phi);
  octx.scale(rMajor / rMinor, 1); // stretch circle into ellipse along major axis

  // Radial gradient is defined in transformed space → it follows the ellipse
  const grad = octx.createRadialGradient(0, 0, 0, 0, 0, rMinor);
  grad.addColorStop(0,    `rgba(${r},${g},${b},${intensity.toFixed(3)})`);
  grad.addColorStop(0.25, `rgba(${r},${g},${b},${(intensity * 0.70).toFixed(3)})`);
  grad.addColorStop(0.60, `rgba(${r},${g},${b},${(intensity * 0.25).toFixed(3)})`);
  grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

  octx.fillStyle = grad;
  octx.beginPath();
  octx.arc(0, 0, rMinor, 0, Math.PI * 2);
  octx.fill();
  octx.restore();

  // Composite onto main canvas using screen blend (adds light naturally)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  if (state.glareBlur > 0) ctx.filter = `blur(${state.glareBlur}px)`;
  ctx.drawImage(off, 0, 0);
  ctx.restore();
}

/* ════════════════════════════════════════════
   MAIN RENDER
════════════════════════════════════════════ */

let renderPending = false;

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

  // Measure exact rendered line width for every block type — no fixed sizes
  let maxContentW = 0;
  for (const b of blocks) {
    if (b.type === 'code') {
      mc.font = `${fontSize}px "${codeFont}",monospace`;
      for (const cl of b.text.split('\n'))
        maxContentW = Math.max(maxContentW, mc.measureText(cl.replace(/\t/g, '    ')).width + 24);
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
            const pre = rawLine.slice(0, cS).replace(/\t/g, '    ');
            const sel = rawLine.slice(cS, cE).replace(/\t/g, '    ');
            const xOff = ctx.measureText(pre).width;
            const xW   = sel.length ? ctx.measureText(sel).width : ctx.measureText(' ').width;
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
              ctx.fillText(t.text, cx, y + codePadY + li * lh);
              cx += ctx.measureText(t.text).width;
            }
          }
          hlOk = true;
        } catch(e) {}
      }
      if (!hlOk) {
        ctx.fillStyle = theme.fg;
        codeLines.forEach((cl, li) => ctx.fillText(cl.replace(/\t/g, '    '), xBase + 12, y + codePadY + li * lh));
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

  return off;
}

function doRender() {
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');

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

  const iw = off.width, ih = off.height;
  const op = state.outerPadding;
  const cW = baseW + op * 2;  // fixed — background ignores zoom
  const cH = baseH + op * 2;

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

  // Update preview display size
  scaleCanvasDisplay();
  document.getElementById('canvas-info').textContent = `${cW}×${cH}`;
}

function scheduleRender() {
  if (renderPending) return;
  renderPending = true;
  requestAnimationFrame(() => { renderPending=false; doRender(); });
}

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

/* ════════════════════════════════════════════
   FORMAT ENCODERS
════════════════════════════════════════════ */

function canvasToTiff(canvas, cb) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const rgba = ctx.getImageData(0, 0, w, h).data;
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    const a = rgba[i + 3] / 255;
    rgb[j]     = (rgba[i]     * a + 255 * (1 - a)) | 0;
    rgb[j + 1] = (rgba[i + 1] * a + 255 * (1 - a)) | 0;
    rgb[j + 2] = (rgba[i + 2] * a + 255 * (1 - a)) | 0;
  }
  const numTags = 10, ifdOff = 8;
  const ifdSize  = 2 + numTags * 12 + 4;
  const bpsOff   = ifdOff + ifdSize;
  const imgOff   = bpsOff + 6;
  const buf = new ArrayBuffer(imgOff + rgb.length);
  const dv  = new DataView(buf);
  dv.setUint16(0, 0x4949, true); dv.setUint16(2, 42, true); dv.setUint32(4, ifdOff, true);
  let p = ifdOff; dv.setUint16(p, numTags, true); p += 2;
  const tag = (t, type, count, val) => {
    dv.setUint16(p, t, true); dv.setUint16(p+2, type, true);
    dv.setUint32(p+4, count, true); dv.setUint32(p+8, val, true); p += 12;
  };
  tag(256,4,1,w); tag(257,4,1,h); tag(258,3,3,bpsOff); tag(259,3,1,1);
  tag(262,3,1,2); tag(273,4,1,imgOff); tag(277,3,1,3);
  tag(278,4,1,h); tag(279,4,1,rgb.length); tag(284,3,1,1);
  dv.setUint32(p, 0, true);
  dv.setUint16(bpsOff, 8, true); dv.setUint16(bpsOff+2, 8, true); dv.setUint16(bpsOff+4, 8, true);
  new Uint8Array(buf, imgOff).set(rgb);
  cb(new Blob([buf], {type:'image/tiff'}));
}

function canvasToGif(canvas, cb) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, np = w * h;
  const rgba = ctx.getImageData(0, 0, w, h).data;
  // Composite on white → RGB
  const rgb = new Uint8Array(np * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    const a = rgba[i+3] / 255;
    rgb[j]   = (rgba[i]   * a + 255 * (1-a)) | 0;
    rgb[j+1] = (rgba[i+1] * a + 255 * (1-a)) | 0;
    rgb[j+2] = (rgba[i+2] * a + 255 * (1-a)) | 0;
  }
  // Build 256-color palette via frequency on 6-bit-reduced colors
  const freq = new Map();
  for (let j = 0; j < np*3; j += 3) {
    const k = ((rgb[j]>>2)<<12)|((rgb[j+1]>>2)<<6)|(rgb[j+2]>>2);
    freq.set(k, (freq.get(k)||0) + 1);
  }
  const top = [...freq.keys()].sort((a,b)=>freq.get(b)-freq.get(a)).slice(0,256);
  const palette = new Uint8Array(256*3);
  const palMap  = new Map();
  top.forEach((k, idx) => {
    const r6=(k>>12)&63, g6=(k>>6)&63, b6=k&63;
    palette[idx*3]   = (r6<<2)|(r6>>4);
    palette[idx*3+1] = (g6<<2)|(g6>>4);
    palette[idx*3+2] = (b6<<2)|(b6>>4);
    palMap.set(k, idx);
  });
  // Map pixels to palette indices with nearest-color fallback
  const indices = new Uint8Array(np);
  const cache = new Map();
  for (let i = 0, j = 0; i < np; i++, j += 3) {
    const k = ((rgb[j]>>2)<<12)|((rgb[j+1]>>2)<<6)|(rgb[j+2]>>2);
    let idx = palMap.get(k);
    if (idx === undefined) {
      idx = cache.get(k);
      if (idx === undefined) {
        let best = Infinity;
        const r=rgb[j],g=rgb[j+1],b=rgb[j+2];
        for (let p2=0; p2<top.length*3; p2+=3) {
          const dr=r-palette[p2],dg=g-palette[p2+1],db=b-palette[p2+2];
          const d=dr*dr+dg*dg+db*db;
          if (d<best){best=d;idx=p2/3;}
        }
        cache.set(k, idx);
      }
    }
    indices[i] = idx;
  }
  // LZW encode
  const lzwMin=8, clearCode=256, eofCode=257;
  const lzwOut=[];
  let lBuf=0, lBits=0;
  const wb = (code,n) => { lBuf|=code<<lBits; lBits+=n; while(lBits>=8){lzwOut.push(lBuf&0xFF);lBuf>>>=8;lBits-=8;} };
  let codeSize=9, nextCode=258, limit=512, lzwTable=new Map();
  const resetLzw = () => { lzwTable.clear(); nextCode=258; codeSize=9; limit=512; };
  resetLzw(); wb(clearCode, codeSize);
  let prefix = indices[0];
  for (let i=1; i<np; i++) {
    const c=indices[i], key=(prefix<<8)|c;
    const existing=lzwTable.get(key);
    if (existing !== undefined) { prefix=existing; }
    else {
      wb(prefix, codeSize);
      if (nextCode > 4095) { wb(clearCode, codeSize); resetLzw(); }
      else { lzwTable.set(key, nextCode++); if (nextCode>limit && codeSize<12){codeSize++;limit<<=1;} }
      prefix = c;
    }
  }
  wb(prefix, codeSize); wb(eofCode, codeSize);
  if (lBits>0) lzwOut.push(lBuf&0xFF);
  // Build GIF89a
  const out = [0x47,0x49,0x46,0x38,0x39,0x61, w&0xFF,(w>>8)&0xFF, h&0xFF,(h>>8)&0xFF, 0xF7,0,0];
  for (let i=0; i<768; i++) out.push(palette[i]);
  out.push(0x2C, 0,0,0,0, w&0xFF,(w>>8)&0xFF, h&0xFF,(h>>8)&0xFF, 0, lzwMin);
  for (let i=0; i<lzwOut.length; i+=255) {
    const end=Math.min(i+255, lzwOut.length); out.push(end-i);
    for (let j=i; j<end; j++) out.push(lzwOut[j]);
  }
  out.push(0, 0x3B);
  cb(new Blob([new Uint8Array(out)], {type:'image/gif'}));
}

/* ════════════════════════════════════════════
   EXPORT
════════════════════════════════════════════ */

const FORMAT_EXT = {png:'png', jpg:'jpg', gif:'gif', tiff:'tiff', base64:'txt'};
const FORMAT_MIME = {png:'image/png', jpg:'image/jpeg'};

function exportAs(fmt) {
  const canvas = document.getElementById('preview-canvas');
  const ts = Date.now();
  if (fmt === 'png' || fmt === 'jpg') {
    const mime = FORMAT_MIME[fmt];
    const dataURL = fmt === 'jpg'
      ? (() => {
          const tmp = document.createElement('canvas');
          tmp.width = canvas.width; tmp.height = canvas.height;
          const c = tmp.getContext('2d');
          c.fillStyle = '#ffffff'; c.fillRect(0,0,tmp.width,tmp.height);
          c.drawImage(canvas,0,0);
          return tmp.toDataURL(mime, 0.95);
        })()
      : canvas.toDataURL(mime);
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `codeshot_${ts}.${fmt}`;
    a.click();
  } else if (fmt === 'base64') {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataURL);
    a.download = `codeshot_${ts}.txt`;
    a.click();
  } else if (fmt === 'tiff') {
    canvasToTiff(canvas, blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `codeshot_${ts}.tiff`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
  } else if (fmt === 'gif') {
    canvasToGif(canvas, blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `codeshot_${ts}.gif`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
  }
}

function buildCurlCommand() {
  const params = [];
  const pushIfChanged = (key, value, defVal) => {
    if (value !== defVal) params.push([key, String(value)]);
  };
  const toHexParam = hex => String(hex || '').replace(/^#/, '').toLowerCase();
  const toFontParam = font => String(font || '').replace(/\s+/g, '_');

  pushIfChanged('mode', state.inputMode, 'code');
  pushIfChanged('lang', state.language, 'javascript');
  pushIfChanged('font', toFontParam(state.font), 'JetBrains_Mono');
  pushIfChanged('size', state.fontSize, 14);
  pushIfChanged('line_height', state.lineHeight, 1.6);
  pushIfChanged('theme', state.theme, 'one-dark');
  pushIfChanged('bg', state.bgType, 'gradient');
  pushIfChanged('bg_color', toHexParam(state.bgSolid), '1a1b2e');
  pushIfChanged('grad_c1', toHexParam(state.gradC1), '0f0c29');
  pushIfChanged('grad_c2', toHexParam(state.gradC2), '302b63');
  pushIfChanged('grad_angle', state.gradAngle, 135);
  pushIfChanged('outer_pad', state.outerPadding, 56);
  pushIfChanged('inner_pad', state.innerPadding, 40);
  pushIfChanged('radius', state.cornerRadius, 14);
  pushIfChanged('chrome', state.chromeStyle, 'macos');
  pushIfChanged('title', state.windowTitle || '', 'code');
  pushIfChanged('shadow', state.showShadow, true);
  pushIfChanged('shadow_blur', state.shadowBlur, 30);
  pushIfChanged('line_numbers', state.showLineNumbers, false);
  pushIfChanged('first_line', state.firstLineNumber, 1);
  pushIfChanged('line_num_color', toHexParam(state.lineNumberColor), '');
  pushIfChanged('tilt', state.tiltAngle, 0);
  pushIfChanged('depth', state.depthAngle, 0);
  pushIfChanged('depth_y', state.depthAngleY, 0);
  pushIfChanged('trap_left', state.trapLeft, 100);
  pushIfChanged('trap_right', state.trapRight, 100);
  pushIfChanged('trap_top', state.trapTop, 100);
  pushIfChanged('trap_bottom', state.trapBottom, 100);
  pushIfChanged('offset_x', state.windowOffsetX, 0);
  pushIfChanged('offset_y', state.windowOffsetY, 0);
  pushIfChanged('filter', state.filter, 'none');
  pushIfChanged('filter_intensity', state.filterIntensity, 100);
  pushIfChanged('texture', state.texture, 'none');
  pushIfChanged('texture_intensity', state.textureIntensity, 50);
  pushIfChanged('zoom', state.zoom, 100);
  pushIfChanged('window_opacity', state.windowOpacity, 100);
  pushIfChanged('grad_blur', state.gradBlur, false);
  pushIfChanged('grad_blur_dir', state.gradBlurDir, 'bottom');
  pushIfChanged('grad_blur_amount', state.gradBlurAmount, 20);
  pushIfChanged('grad_blur_start', state.gradBlurStart, 30);
  pushIfChanged('text_color', toHexParam(state.plainTextColor), 'e0e0e0');
  pushIfChanged('text_bg', toHexParam(state.plainTextBg), '1e1e2e');
  pushIfChanged('plain_font', toFontParam(state.plainFont), 'Arial');
  pushIfChanged('text_align', state.plainTextAlign, 'left');
  pushIfChanged('md_heading_color', toHexParam(state.mdHeadingColor), 'e2c08d');
  pushIfChanged('md_link_color', toHexParam(state.mdLinkColor), '61afef');
  pushIfChanged('watermark', showWatermark, false);
  pushIfChanged('glare', state.glareEnabled, false);
  pushIfChanged('glare_x', state.glareX, DEFAULTS.glareX);
  pushIfChanged('glare_y', state.glareY, DEFAULTS.glareY);
  pushIfChanged('glare_distance', state.glareDistance, DEFAULTS.glareDistance);
  pushIfChanged('glare_angle_h', state.glareAngleH, DEFAULTS.glareAngleH);
  pushIfChanged('glare_angle_v', state.glareAngleV, DEFAULTS.glareAngleV);
  pushIfChanged('glare_blur', state.glareBlur, DEFAULTS.glareBlur);
  pushIfChanged('glare_intensity', state.glareIntensity, DEFAULTS.glareIntensity);
  pushIfChanged('glare_color', toHexParam(state.glareColor), 'ffffff');

  const query = params
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const url = query ? `http://localhost:3000/?${query}` : 'http://localhost:3000/';

  return [
    `curl -X POST "${url}" \\`,
    '  -H "Content-Type: text/plain" \\',
    '  --data-binary "@script.js" \\',
    '  -o "screenshot.png"',
  ].join('\n');
}

async function copyAs(fmt) {
  const canvas = document.getElementById('preview-canvas');
  const btn = document.getElementById('copy-btn');
  const origHTML = btn.innerHTML;
  const flash = () => {
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    setTimeout(() => btn.innerHTML = origHTML, 1500);
  };
  if (fmt === 'base64') {
    try {
      await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
      flash();
    } catch(e) { exportAs('base64'); }
    return;
  }
  if (fmt === 'curl') {
    try {
      await navigator.clipboard.writeText(buildCurlCommand());
      flash();
    } catch(e) {}
    return;
  }
  if (fmt === 'png') {
    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
        flash();
      } catch(e) { exportAs('png'); }
    });
    return;
  }
}

/* ════════════════════════════════════════════
   STORAGE
════════════════════════════════════════════ */

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  }, SAVE_DELAY);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    // backward compat
    if (s.padding !== undefined && s.innerPadding === undefined) s.innerPadding = s.padding;
    if (s.showChrome === false && s.chromeStyle === undefined) s.chromeStyle = 'none';
    if (s.gradColor1 !== undefined) s.gradC1 = s.gradColor1;
    if (s.gradColor2 !== undefined) s.gradC2 = s.gradColor2;
    if (s.depthAngle !== undefined && s.depthAngleY === undefined) s.depthAngleY = 0;
    state = { ...DEFAULTS, ...s };
    state.code = (state.code || '').split('\n')
      .slice(0, MAX_LINES)
      .map(l => l.slice(0, MAX_COLS))
      .join('\n');
  } catch(e) {}
  try {
    const sr = localStorage.getItem(SPLIT_KEY);
    if (sr) splitRatio = parseFloat(sr);
  } catch(e) {}
}

function getPresets() {
  try { return JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}'); } catch(e) { return {}; }
}

function savePreset(name) {
  if (!name.trim()) return;
  const presets = getPresets();
  presets[name.trim()] = { ...state };
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); } catch(e) {}
  renderPresetsList();
}

function applyPreset(name) {
  const presets = getPresets();
  if (!presets[name]) return;
  const code = state.code; // keep current code, or remove this line to restore code too
  state = { ...DEFAULTS, ...presets[name], code };
  tokCache = null;
  syncUI();
  scheduleRender();
  scheduleSave();
}

function deletePreset(name) {
  const presets = getPresets();
  delete presets[name];
  try { localStorage.setItem(PRESETS_KEY, JSON.stringify(presets)); } catch(e) {}
  renderPresetsList();
}

function renderPresetsList() {
  const container = document.getElementById('presets-list');
  if (!container) return;
  const presets = getPresets();
  const names = Object.keys(presets);
  container.innerHTML = '';
  if (names.length === 0) {
    container.innerHTML = '<div style="font-size:11px;opacity:.45;padding:4px 0">No saved presets yet</div>';
    return;
  }
  for (const name of names) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:5px';
    const label = document.createElement('button');
    label.className = 'btn';
    label.style.cssText = 'flex:1;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;padding:4px 8px';
    label.textContent = name;
    label.title = `Load "${name}"`;
    label.addEventListener('click', () => applyPreset(name));
    const del = document.createElement('button');
    del.className = 'btn';
    del.style.cssText = 'padding:4px 7px;font-size:11px;color:#e06c75;flex-shrink:0';
    del.textContent = '✕';
    del.title = `Delete "${name}"`;
    del.addEventListener('click', () => {
      if (confirm(`Delete preset "${name}"?`)) deletePreset(name);
    });
    row.appendChild(label);
    row.appendChild(del);
    container.appendChild(row);
  }
}

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
    if (t[k]) css += `#code-highlight .hljs-${k}{color:${t[k]}}\n`;
  }
  let el = document.getElementById('hljs-theme-style');
  if (!el) { el = document.createElement('style'); el.id='hljs-theme-style'; document.head.appendChild(el); }
  el.textContent = css;
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
}

/* ════════════════════════════════════════════
   UI SYNC
════════════════════════════════════════════ */

function setSwitch(id, val) { document.getElementById(id).classList.toggle('on', !!val); }

function syncUI() {
  // Code
  document.getElementById('code-input').value = state.code;
  document.getElementById('lang-select').value = state.language;

  // Appearance
  document.getElementById('font-select').value = state.font;
  setRange('font-size', state.fontSize, 'font-size-val', v=>v+'px');
  setRange('line-height', state.lineHeight, 'line-height-val', v=>v);

  // Theme
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme===state.theme));
  const isText = state.inputMode === 'text';
  const isMd   = state.inputMode === 'markdown';
  document.querySelectorAll('#input-mode-group .toggle-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.val === state.inputMode));
  document.getElementById('lang-wrap').style.display        = (isText || isMd) ? 'none' : '';
  document.getElementById('theme-wrap').style.display       = isText ? 'none' : '';
  document.getElementById('text-color-wrap').style.display  = (isText || isMd) ? '' : 'none';
  document.getElementById('plain-align-wrap').style.display = isMd ? 'none' : '';
  document.getElementById('code-font-wrap').style.display   = (isText || isMd) ? 'none' : '';
  document.getElementById('plain-font-wrap').style.display  = (isText || isMd) ? '' : 'none';
  document.getElementById('md-settings-wrap').style.display = isMd ? '' : 'none';
  if (document.getElementById('plain-font-select').value !== state.plainFont) {
    document.getElementById('plain-font-select').value = state.plainFont;
  }
  document.getElementById('plain-text-color').value = state.plainTextColor;
  document.getElementById('plain-text-bg').value    = state.plainTextBg;
  document.getElementById('md-heading-color').value = state.mdHeadingColor;
  document.getElementById('md-link-color').value    = state.mdLinkColor;
  document.querySelectorAll('#plain-align-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val === state.plainTextAlign));

  // Background
  document.querySelectorAll('#bg-type-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val===state.bgType));
  document.getElementById('bg-solid-wrap').style.display = state.bgType==='solid' ? '' : 'none';
  document.getElementById('bg-grad-wrap').style.display  = state.bgType==='gradient' ? '' : 'none';
  document.getElementById('bg-solid-color').value = state.bgSolid;
  document.getElementById('grad-c1').value = state.gradC1;
  document.getElementById('grad-c2').value = state.gradC2;
  setRange('grad-angle', state.gradAngle, 'grad-angle-val', v=>v+'°');
  setRange('outer-padding', state.outerPadding, 'outer-padding-val', v=>v+'px');

  // Frame
  setRange('inner-padding', state.innerPadding, 'inner-padding-val', v=>v+'px');
  setRange('corner-radius', state.cornerRadius, 'corner-val', v=>v+'px');
  document.querySelectorAll('.chrome-btn').forEach(b => b.classList.toggle('active', b.dataset.style===state.chromeStyle));
  const titleSupported = state.chromeStyle === 'windows' || state.chromeStyle === 'gnome';
  document.getElementById('window-title-wrap').style.display = titleSupported ? '' : 'none';
  document.getElementById('window-title').value = state.windowTitle || '';
  setSwitch('lineno-switch', state.showLineNumbers);
  document.getElementById('lineno-sub').style.display = state.showLineNumbers ? '' : 'none';
  document.getElementById('first-line-number').value = state.firstLineNumber;
  document.getElementById('lineno-color').value = state.lineNumberColor || '#888888';
  setSwitch('shadow-switch', state.showShadow);
  setRange('shadow-blur', state.shadowBlur, 'shadow-blur-val', v=>v+'px');
  setRange('zoom', state.zoom, 'zoom-val', v => v + '%');
  setRange('window-opacity', state.windowOpacity, 'window-opacity-val', v => v + '%');
  setRange('window-offset-x', state.windowOffsetX, 'window-offset-x-val', v => v + '%');
  setRange('window-offset-y', state.windowOffsetY, 'window-offset-y-val', v => v + '%');

  // 3D
  setRange('tilt-angle', state.tiltAngle, 'tilt-val', v=>v+'°');
  setRange('depth-angle', state.depthAngle, 'depth-val', v=>v+'°');
  setRange('depthangleY', state.depthAngleY, 'depthy-val', v=>v+'°');

  // Trapezoid
  setRange('trap-left',   state.trapLeft,   'trap-left-val',   v=>v+'%');
  setRange('trap-right',  state.trapRight,  'trap-right-val',  v=>v+'%');
  setRange('trap-top',    state.trapTop,    'trap-top-val',    v=>v+'%');
  setRange('trap-bottom', state.trapBottom, 'trap-bottom-val', v=>v+'%');

  // Gradient blur
  setSwitch('gblur-switch', state.gradBlur);
  document.getElementById('gblur-controls').style.opacity = state.gradBlur ? '1' : '0.35';
  document.querySelectorAll('#gblur-dir-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val===state.gradBlurDir));
  setRange('gblur-amount', state.gradBlurAmount, 'gblur-amount-val', v=>v+'px');
  setRange('gblur-start',  state.gradBlurStart,  'gblur-start-val',  v=>v+'%');

  // Filters
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === state.filter));
  setRange('filter-intensity', state.filterIntensity, 'filter-intensity-val', v => v + '%');
  document.getElementById('filter-intensity-wrap').style.opacity = state.filter === 'none' ? '0.35' : '1';

  // Textures
  document.querySelectorAll('.texture-btn').forEach(b => b.classList.toggle('active', b.dataset.texture === state.texture));
  setRange('texture-intensity', state.textureIntensity, 'texture-intensity-val', v => v + '%');
  document.getElementById('texture-intensity-wrap').style.opacity = state.texture === 'none' ? '0.35' : '1';

  // Screen Glare
  setSwitch('glare-switch', state.glareEnabled);
  document.getElementById('glare-controls').style.opacity = state.glareEnabled ? '1' : '0.35';
  setRange('glare-x', state.glareX, 'glare-x-val', v => v + '%');
  setRange('glare-y', state.glareY, 'glare-y-val', v => v + '%');
  setRange('glare-distance', state.glareDistance, 'glare-distance-val', v => v);
  setRange('glare-angle-h', state.glareAngleH, 'glare-angle-h-val', v => v + '°');
  setRange('glare-angle-v', state.glareAngleV, 'glare-angle-v-val', v => v + '°');
  setRange('glare-blur', state.glareBlur, 'glare-blur-val', v => v + 'px');
  setRange('glare-intensity', state.glareIntensity, 'glare-intensity-val', v => v + '%');
  document.getElementById('glare-color').value = state.glareColor;

  // Selection
  document.getElementById('selection-color').value = state.selectionColor;
  setRange('selection-opacity', state.selectionOpacity, 'selection-opacity-val', v => v + '%');

  // Watermark
  setSwitch('watermark-switch', showWatermark);

  applyEditorTheme();
  updateEditorHighlight();
}

function setRange(id, val, labelId, fmt) {
  const el = document.getElementById(id); if (!el) return;
  el.value = val;
  if (labelId) document.getElementById(labelId).textContent = fmt(val);
}

/* ════════════════════════════════════════════
   EVENTS
════════════════════════════════════════════ */

function change(key, val) { state[key]=val; scheduleRender(); scheduleSave(); }
function changeCode(val) { tokCache=null; state.code=val; scheduleRender(); scheduleSave(); }

function bindEvents() {
  // Code input (debounced)
  let codeTimer;
  document.getElementById('code-input').addEventListener('input', e => {
      const lines = e.target.value.split('\n');
      let changed = false;
      if (lines.length > MAX_LINES) { lines.splice(MAX_LINES); changed = true; }
      for (let i = 0; i < lines.length; i++) {
          if (lines[i].length > MAX_COLS) { lines[i] = lines[i].slice(0, MAX_COLS); changed = true; }
      }
      if (changed) e.target.value = lines.join('\n');
      updateEditorHighlight();
      clearTimeout(codeTimer);
      codeTimer = setTimeout(() => changeCode(e.target.value), 80);
  });

  // Presets
  document.getElementById('save-preset-btn').addEventListener('click', () => {
    const input = document.getElementById('preset-name-input');
    savePreset(input.value);
    input.value = '';
  });
  document.getElementById('preset-name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      savePreset(e.target.value);
      e.target.value = '';
    }
  });

  // Selection → highlight in canvas
  function updateSelectionRange() {
    const el = document.getElementById('code-input');
    const { selectionStart, selectionEnd } = el;
    const next = selectionEnd > selectionStart ? { start: selectionStart, end: selectionEnd } : null;
    if ((next === null) !== (selectionRange === null) ||
        (next && (next.start !== selectionRange.start || next.end !== selectionRange.end))) {
      selectionRange = next;
      scheduleRender();
    }
  }
  document.getElementById('code-input').addEventListener('select', updateSelectionRange);
  document.getElementById('code-input').addEventListener('mouseup', updateSelectionRange);
  document.getElementById('code-input').addEventListener('keyup', updateSelectionRange);
  document.getElementById('code-input').addEventListener('blur', () => {
    if (selectionRange !== null) { selectionRange = null; scheduleRender(); }
  });
  document.getElementById('code-input').addEventListener('scroll', e => {
    const highlight = document.getElementById('code-highlight');
    highlight.scrollTop = e.target.scrollTop;
    highlight.scrollLeft = e.target.scrollLeft;
  });
  document.getElementById('lang-select').addEventListener('change', e => {
    tokCache=null; change('language', e.target.value); updateEditorHighlight();
  });
  document.getElementById('font-select').addEventListener('change', e => {
    change('font', e.target.value); applyEditorTheme();
  });
  document.getElementById('plain-font-select').addEventListener('change', e => {
    change('plainFont', e.target.value); applyEditorTheme();
  });
  document.getElementById('selection-color').addEventListener('input', e => change('selectionColor', e.target.value));
  bindR('selection-opacity', 'selectionOpacity', 'selection-opacity-val', v => v + '%');

  // Range bindings
  function bindR(id, key, labelId, fmt, resetTokens) {
    document.getElementById(id).addEventListener('input', e => {
      const v = parseFloat(e.target.value);
      if (labelId) document.getElementById(labelId).textContent = fmt(v);
      if (resetTokens) tokCache=null;
      change(key, v);
    });
  }
  bindR('font-size','fontSize','font-size-val',v=>v+'px');
  bindR('line-height','lineHeight','line-height-val',v=>v);
  bindR('outer-padding','outerPadding','outer-padding-val',v=>v+'px');
  bindR('inner-padding','innerPadding','inner-padding-val',v=>v+'px');
  bindR('corner-radius','cornerRadius','corner-val',v=>v+'px');
  bindR('shadow-blur','shadowBlur','shadow-blur-val',v=>v+'px');
  bindR('grad-angle','gradAngle','grad-angle-val',v=>v+'°');
  bindR('tilt-angle','tiltAngle','tilt-val',v=>v+'°');
  bindR('depth-angle','depthAngle','depth-val',v=>v+'°');
  bindR('depthangleY','depthAngleY','depthy-val',v=>v+'°');
  bindR('trap-left','trapLeft','trap-left-val',v=>v+'%');
  bindR('trap-right','trapRight','trap-right-val',v=>v+'%');
  bindR('trap-top','trapTop','trap-top-val',v=>v+'%');
  bindR('trap-bottom','trapBottom','trap-bottom-val',v=>v+'%');
  bindR('gblur-amount','gradBlurAmount','gblur-amount-val',v=>v+'px');
  bindR('gblur-start','gradBlurStart','gblur-start-val',v=>v+'%');
  bindR('zoom', 'zoom', 'zoom-val', v => v + '%');
  bindR('window-opacity', 'windowOpacity', 'window-opacity-val', v => v + '%');
  bindR('window-offset-x', 'windowOffsetX', 'window-offset-x-val', v => v + '%');
  bindR('window-offset-y', 'windowOffsetY', 'window-offset-y-val', v => v + '%');

  // Colors
  document.getElementById('bg-solid-color').addEventListener('input', e => change('bgSolid', e.target.value));
  document.getElementById('grad-c1').addEventListener('input', e => change('gradC1', e.target.value));
  document.getElementById('grad-c2').addEventListener('input', e => change('gradC2', e.target.value));
  document.getElementById('selection-color').addEventListener('input', e => {
    change('selectionColor', e.target.value);
  });

  // Toggle groups
  document.getElementById('bg-type-group').addEventListener('click', e => {
    const b = e.target.closest('.toggle-btn'); if (!b) return;
    change('bgType', b.dataset.val); syncUI();
  });
  document.getElementById('gblur-dir-group').addEventListener('click', e => {
    const b = e.target.closest('.toggle-btn'); if (!b) return;
    change('gradBlurDir', b.dataset.val); syncUI();
  });
  document.getElementById('plain-align-group').addEventListener('click', e => {
    const b = e.target.closest('.toggle-btn'); if (!b) return;
    change('plainTextAlign', b.dataset.val); syncUI();
  });

  // Chrome style
  document.getElementById('chrome-grid').addEventListener('click', e => {
    const b = e.target.closest('.chrome-btn'); if (!b) return;
    change('chromeStyle', b.dataset.style); syncUI();
  });
  document.getElementById('window-title').addEventListener('input', e => {
    change('windowTitle', e.target.value);
  });

  // Mode switcher
  document.getElementById('input-mode-group').addEventListener('click', e => {
    const b = e.target.closest('.toggle-btn'); if (!b) return;
    tokCache = null; change('inputMode', b.dataset.val); syncUI();
  });

  // Theme
  document.getElementById('theme-grid').addEventListener('click', e => {
    const b = e.target.closest('.theme-btn'); if (!b) return;
    tokCache = null; change('theme', b.dataset.theme); syncUI();
  });

  // Plain text colors
  document.getElementById('plain-text-color').addEventListener('input', e => {
    tokCache = null; change('plainTextColor', e.target.value); applyEditorTheme(); updateEditorHighlight();
  });
  document.getElementById('plain-text-bg').addEventListener('input', e => {
    change('plainTextBg', e.target.value); applyEditorTheme();
  });

  // Markdown colors
  document.getElementById('md-heading-color').addEventListener('input', e => change('mdHeadingColor', e.target.value));
  document.getElementById('md-link-color').addEventListener('input', e => change('mdLinkColor', e.target.value));

  // Gradient presets
  document.getElementById('grad-presets').addEventListener('click', e => {
    const b = e.target.closest('.grad-preset'); if (!b) return;
    const p = GRADIENT_PRESETS[+b.dataset.idx];
    state.gradC1=p[0]; state.gradC2=p[1]; state.gradAngle=p[2];
    syncUI(); scheduleRender(); scheduleSave();
  });

  // Filters
  document.getElementById('filter-grid').addEventListener('click', e => {
    const b = e.target.closest('.filter-btn'); if (!b) return;
    change('filter', b.dataset.filter); syncUI();
  });
  bindR('filter-intensity', 'filterIntensity', 'filter-intensity-val', v => v + '%');

  // Textures
  document.getElementById('texture-grid').addEventListener('click', e => {
    const b = e.target.closest('.texture-btn'); if (!b) return;
    change('texture', b.dataset.texture); syncUI();
  });
  bindR('texture-intensity', 'textureIntensity', 'texture-intensity-val', v => v + '%');

  // Screen Glare
  document.getElementById('glare-switch').addEventListener('click', () => {
    change('glareEnabled', !state.glareEnabled);
    setSwitch('glare-switch', state.glareEnabled);
    document.getElementById('glare-controls').style.opacity = state.glareEnabled ? '1' : '0.35';
  });
  bindR('glare-x', 'glareX', 'glare-x-val', v => v + '%');
  bindR('glare-y', 'glareY', 'glare-y-val', v => v + '%');
  bindR('glare-distance', 'glareDistance', 'glare-distance-val', v => v);
  bindR('glare-angle-h', 'glareAngleH', 'glare-angle-h-val', v => v + '°');
  bindR('glare-angle-v', 'glareAngleV', 'glare-angle-v-val', v => v + '°');
  bindR('glare-blur', 'glareBlur', 'glare-blur-val', v => v + 'px');
  bindR('glare-intensity', 'glareIntensity', 'glare-intensity-val', v => v + '%');
  document.getElementById('glare-color').addEventListener('input', e => change('glareColor', e.target.value));
  document.getElementById('reset-glare').addEventListener('click', () => {
    state.glareX = DEFAULTS.glareX;
    state.glareY = DEFAULTS.glareY;
    state.glareDistance = DEFAULTS.glareDistance;
    state.glareAngleH = DEFAULTS.glareAngleH;
    state.glareAngleV = DEFAULTS.glareAngleV;
    state.glareBlur = DEFAULTS.glareBlur;
    state.glareIntensity = DEFAULTS.glareIntensity;
    state.glareColor = DEFAULTS.glareColor;
    syncUI(); scheduleRender(); scheduleSave();
  });

  // Switches
  function bindSwitch(id, key) {
    document.getElementById(id).addEventListener('click', () => {
      change(key, !state[key]); setSwitch(id, state[key]);
      if (key==='gradBlur') { document.getElementById('gblur-controls').style.opacity = state.gradBlur?'1':'0.35'; }
      if (key==='showLineNumbers') { document.getElementById('lineno-sub').style.display = state.showLineNumbers ? '' : 'none'; }
    });
  }
  bindSwitch('lineno-switch','showLineNumbers');
  bindSwitch('shadow-switch','showShadow');
  bindSwitch('gblur-switch','gradBlur');
  document.getElementById('watermark-switch').addEventListener('click', () => {
    showWatermark = !showWatermark;
    setSwitch('watermark-switch', showWatermark);
    scheduleRender();
  });

  // Inputs
  document.getElementById('first-line-number').addEventListener('input', e => {
    change('firstLineNumber', Math.max(0, parseInt(e.target.value) || 0));
  });
  document.getElementById('lineno-color').addEventListener('input', e => change('lineNumberColor', e.target.value));

  // Buttons
  document.getElementById('export-btn').addEventListener('click', () => exportAs('png'));
  document.getElementById('copy-btn').addEventListener('click', () => copyAs('png'));
  document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('code-input').value=''; changeCode('');
  });
  document.getElementById('reset-3d').addEventListener('click', () => {
    state.tiltAngle=0; state.depthAngle=0; state.depthAngleY=0;
    syncUI(); scheduleRender(); scheduleSave();
  });
  document.getElementById('reset-trap').addEventListener('click', () => {
    state.trapLeft=100; state.trapRight=100; state.trapTop=100; state.trapBottom=100;
    syncUI(); scheduleRender(); scheduleSave();
  });
  document.getElementById('reset-params-btn').addEventListener('click', () => {
    const code = state.code;
    state = { ...DEFAULTS, code };
    tokCache = null;
    syncUI();
    scheduleRender();
    scheduleSave();
  });
  document.getElementById('lineno-color-auto').addEventListener('click', () => {
    change('lineNumberColor', '');
    document.getElementById('lineno-color').value = '#888888';
  });

  // Dropdown toggles
  ['export','copy'].forEach(id => {
    const caret    = document.getElementById(`${id}-caret`);
    const dropdown = document.getElementById(`${id}-dropdown`);
    caret.addEventListener('click', e => {
      e.stopPropagation();
      document.querySelectorAll('.btn-dropdown.open').forEach(d => { if(d!==dropdown) d.classList.remove('open'); });
      dropdown.classList.toggle('open');
    });
    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const fmt = item.dataset.fmt;
        dropdown.classList.remove('open');
        if (id === 'export') exportAs(fmt);
        else copyAs(fmt);
      });
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.btn-dropdown.open').forEach(d => d.classList.remove('open'));
  });

  // Preview wrap resize observer
  const ro = new ResizeObserver(() => scaleCanvasDisplay());
  ro.observe(document.getElementById('preview-wrap'));
  window.addEventListener('resize', scaleCanvasDisplay);
}

/* ════════════════════════════════════════════
   BUILD UI ELEMENTS
════════════════════════════════════════════ */

function buildUI() {
  // Languages
  const sel = document.getElementById('lang-select');
  LANGUAGES.forEach(l => {
    const o = document.createElement('option');
    o.value=l; o.textContent=LANGUAGE_NAMES[l] || l.charAt(0).toUpperCase()+l.slice(1);
    sel.appendChild(o);
  });

  // Themes
  const tg = document.getElementById('theme-grid');
  for (const [k,t] of Object.entries(THEMES)) {
    const b = document.createElement('button');
    b.className='theme-btn'; b.dataset.theme=k;
    b.innerHTML=`<div class="theme-swatches">
      <div class="theme-dot" style="background:${t.bg};border:1px solid rgba(255,255,255,.1)"></div>
      <div class="theme-dot" style="background:${t.keyword}"></div>
      <div class="theme-dot" style="background:${t.string}"></div>
      <div class="theme-dot" style="background:${t.function}"></div>
    </div><div class="theme-name">${t.name}</div>`;
    tg.appendChild(b);
  }

  // Chrome styles
  const cg = document.getElementById('chrome-grid');
  for (const cs of CHROME_STYLES) {
    const b = document.createElement('button');
    b.className='chrome-btn'; b.dataset.style=cs.id;
    b.innerHTML=`<div class="chrome-preview${cs.id==='windows'?' win-prev':''}">${cs.html}</div>
      <div class="chrome-name">${cs.name}</div>`;
    cg.appendChild(b);
  }

  // Gradient presets
  const gp = document.getElementById('grad-presets');
  GRADIENT_PRESETS.forEach((p,i) => {
    const d = document.createElement('div');
    d.className='grad-preset'; d.dataset.idx=i;
    d.style.background=`linear-gradient(${p[2]}deg,${p[0]},${p[1]})`;
    gp.appendChild(d);
  });

  // Filters
  const fg = document.getElementById('filter-grid');
  for (const f of FILTERS) {
    const b = document.createElement('button');
    b.className = 'filter-btn'; b.dataset.filter = f.id;
    b.innerHTML = `<div class="filter-preview" style="background:${f.preview}"></div>
      <div class="filter-name">${f.name}</div>`;
    fg.appendChild(b);
  }

  // Textures
  const txg = document.getElementById('texture-grid');
  for (const t of TEXTURES) {
    const b = document.createElement('button');
    b.className = 'filter-btn texture-btn'; b.dataset.texture = t.id;
    b.innerHTML = `<div class="filter-preview" style="background:${t.preview}"></div>
      <div class="filter-name">${t.name}</div>`;
    txg.appendChild(b);
  }

  // Plain text fonts
  const pfs = document.getElementById('plain-font-select');
  PLAIN_FONTS.forEach(f => {
    const o = document.createElement('option');
    o.value = f; o.textContent = f; o.style.fontFamily = f;
    pfs.appendChild(o);
  });
}

/* ════════════════════════════════════════════
   PANEL RESIZE
════════════════════════════════════════════ */

function initResize() {
  const handle = document.getElementById('resize-handle');
  const editor = document.getElementById('editor-panel');
  const preview = document.getElementById('preview-panel');
  const main = document.getElementById('main');

  function applyLayout() {
    const settingsW = 280;
    const handleW = 5;
    const avail = main.clientWidth - settingsW - handleW;
    const eW = Math.max(180, Math.min(avail - 180, Math.round(avail * splitRatio)));
    const pW = avail - eW;
    editor.style.flexBasis = eW + 'px';
    preview.style.flexBasis = pW + 'px';
  }

  let dragging = false;
  handle.addEventListener('mousedown', e => { dragging=true; handle.classList.add('drag'); e.preventDefault(); });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const rect = main.getBoundingClientRect();
    const x = e.clientX - rect.left - 280 - 5;
    const avail = rect.width - 280 - 5;
    splitRatio = Math.max(0.2, Math.min(0.8, x / avail));
    applyLayout();
    try { localStorage.setItem(SPLIT_KEY, splitRatio); } catch(e) {}
  });
  document.addEventListener('mouseup', () => { dragging=false; handle.classList.remove('drag'); });

  // Touch support
  handle.addEventListener('touchstart', e => { dragging=true; e.preventDefault(); }, {passive:false});
  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const rect = main.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left - 280 - 5;
    const avail = rect.width - 280 - 5;
    splitRatio = Math.max(0.2, Math.min(0.8, x / avail));
    applyLayout();
  });
  document.addEventListener('touchend', () => { dragging=false; });

  window.addEventListener('resize', applyLayout);
  applyLayout();
}

/* ════════════════════════════════════════════
   UI theme (light/dark)
════════════════════════════════════════════ */

(function initUiTheme() {
  const saved = localStorage.getItem(UI_THEME_KEY);
  if (saved === 'light') document.body.classList.add('light');
  const btn = document.getElementById('theme-mode-btn');
  if (!btn) return;
  const updateIcon = () => {
    btn.innerHTML = document.body.classList.contains('light') ? moonIcon : sunIcon;
  };
  updateIcon();
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem(UI_THEME_KEY, document.body.classList.contains('light') ? 'light' : 'dark');
    updateIcon();
  });
})();

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */

async function init() {
  loadState();
  buildUI();
  syncUI();
  bindEvents();
  initResize();
  try { await document.fonts.ready; } catch(e) {}
  scheduleRender();
  renderPresetsList();
}

document.addEventListener('DOMContentLoaded', init);

document.querySelectorAll('.section.collapsible .section-title').forEach(title => {
  title.addEventListener('click', () => {
    title.closest('.section').classList.toggle('collapsed');
  });
});