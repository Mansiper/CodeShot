'use strict';

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */

const STORAGE_KEY  = 'codeshot';
const SPLIT_KEY    = 'codeshot_split';
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
  { id: 'none',      name: 'None',      preview: 'linear-gradient(135deg,#444,#888)' },
  { id: 'bw',        name: 'B&W',       preview: 'linear-gradient(135deg,#111,#eee)' },
  { id: 'sepia',     name: 'Sepia',     preview: 'linear-gradient(135deg,#704214,#c8a87a)' },
  { id: 'cool',      name: 'Cool',      preview: 'linear-gradient(135deg,#1a3a5c,#6ab0d8)' },
  { id: 'warm',      name: 'Warm',      preview: 'linear-gradient(135deg,#7c2b00,#f5a623)' },
  { id: 'faded',     name: 'Faded',     preview: 'linear-gradient(135deg,#aaa,#ccc)' },
  { id: 'vivid',     name: 'Vivid',     preview: 'linear-gradient(135deg,#ff0080,#00ff80)' },
  { id: 'cinematic', name: 'Cinematic', preview: 'linear-gradient(135deg,#1a0000,#8b7355)' },
  { id: 'noir',      name: 'Noir',      preview: 'linear-gradient(135deg,#000,#222)' },
  { id: 'amber',     name: 'Amber',     preview: 'linear-gradient(135deg,#3d1c00,#ff8c00)' },
];

const LANGUAGES = ['bash','c','csharp','cpp','css','dart','dockerfile','elixir','go','graphql','groovy','haskell','html','java','javascript','json','jsx','kotlin','lua','makefile','markdown','matlab','nginx','perl','php','powershell','python','r','ruby','rust','scala','scss','shell','sql','swift','toml','tsx','typescript','vim','xml','yaml'];

const LANGUAGE_NAMES = {
  cpp:'C++', csharp:'C#', javascript:'JavaScript', typescript:'TypeScript',
  html:'HTML', css:'CSS', scss:'SCSS', json:'JSON', yaml:'YAML', toml:'TOML',
  sql:'SQL', php:'PHP', jsx:'JSX', tsx:'TSX', xml:'XML', graphql:'GraphQL',
  nginx:'NGINX', matlab:'MATLAB', powershell:'PowerShell', r:'R',
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
  chromeStyle:'macos',
  showLineNumbers:false, showShadow:true, shadowBlur:30,
  tiltAngle:0, depthAngle:0, depthAngleY:0,
  trapLeft:100, trapRight:100, trapTop:100, trapBottom:100,
  gradBlur:false, gradBlurDir:'bottom', gradBlurAmount:20, gradBlurStart:30,
  filter: 'none',
  filterIntensity: 100,
  inputMode: 'code',
  plainTextColor: '#e0e0e0',
  plainTextBg: '#1e1e2e',
  plainFont: 'Arial',
  selectionColor: '#6490ff',
  selectionOpacity: 25,
  zoom: 100,
  windowOpacity: 100,
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
  if (state.inputMode === 'text') {
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

function drawChrome(ctx, totalW, chromeH, theme, fontSize, pad, style) {
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
    ctx.fillText('code', pad, cy + 0.5);
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
    ctx.fillText('code.js', totalW/2, cy);
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
  drawChrome(ctx, totalW, chromeH, theme, fontSize, innerPadding, chromeStyle);

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
      ctx.fillStyle = adjust(theme.fg, -60);
      const no = String(li+1).padStart(String(lines.length).length, ' ');
      ctx.fillText(no, x, y); x += lineNoW;
    }
    for (const t of lines[li]) {
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
    default:          return 'none';
  }
}

/* ════════════════════════════════════════════
   MAIN RENDER
════════════════════════════════════════════ */

let renderPending = false;

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

  const corners = computeCorners(iw, ih, cW, cH, tZ, rX, rY, tL, tR, tT, tBot);

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
    ctx.drawImage(off, op + (baseW - iw) / 2, op + (baseH - ih) / 2);
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
   EXPORT
════════════════════════════════════════════ */

function exportPng() {
  const canvas = document.getElementById('preview-canvas');
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `codeshot_${Date.now()}.png`;
  a.click();
}

async function copyPng() {
  const canvas = document.getElementById('preview-canvas');
  const btn = document.getElementById('copy-btn');
  canvas.toBlob(async blob => {
    try {
      await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
      setTimeout(() => btn.innerHTML=orig, 1500);
    } catch(e) { exportPng(); }
  });
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

  let html;
  try {
    html = state.language === 'plaintext'
      ? hljs.highlightAuto(code).value
      : hljs.highlight(code, {language: state.language, ignoreIllegals: true}).value;
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
  document.querySelectorAll('#input-mode-group .toggle-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.val === state.inputMode));
  document.getElementById('lang-wrap').style.display   = isText ? 'none' : '';
  document.getElementById('theme-wrap').style.display  = isText ? 'none' : '';
  document.getElementById('text-color-wrap').style.display = isText ? '' : 'none';
  document.getElementById('code-font-wrap').style.display  = isText ? 'none' : '';
  document.getElementById('plain-font-wrap').style.display = isText ? '' : 'none';
  if (document.getElementById('plain-font-select').value !== state.plainFont) {
    document.getElementById('plain-font-select').value = state.plainFont;
  }
  document.getElementById('plain-text-color').value = state.plainTextColor;
  document.getElementById('plain-text-bg').value    = state.plainTextBg;

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
  setSwitch('lineno-switch', state.showLineNumbers);
  setSwitch('shadow-switch', state.showShadow);
  setRange('shadow-blur', state.shadowBlur, 'shadow-blur-val', v=>v+'px');
  setRange('zoom', state.zoom, 'zoom-val', v => v + '%');
  setRange('window-opacity', state.windowOpacity, 'window-opacity-val', v => v + '%');

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

  // Chrome style
  document.getElementById('chrome-grid').addEventListener('click', e => {
    const b = e.target.closest('.chrome-btn'); if (!b) return;
    change('chromeStyle', b.dataset.style); syncUI();
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

  // Switches
  function bindSwitch(id, key) {
    document.getElementById(id).addEventListener('click', () => {
      change(key, !state[key]); setSwitch(id, state[key]);
      if (key==='gradBlur') { document.getElementById('gblur-controls').style.opacity = state.gradBlur?'1':'0.35'; }
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

  // Buttons
  document.getElementById('export-btn').addEventListener('click', exportPng);
  document.getElementById('copy-btn').addEventListener('click', copyPng);
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
}

document.addEventListener('DOMContentLoaded', init);