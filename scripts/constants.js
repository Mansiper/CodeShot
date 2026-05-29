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
  // ── Light (7) ──────────────────────────────────────────────────────────────
  'github-light':   {name:'GitHub Light',  bg:'#ffffff',  fg:'#24292f',  keyword:'#cf222e',string:'#0a3069',number:'#0550ae',comment:'#6e7781',function:'#8250df',title:'#8250df',built_in:'#0550ae',type:'#0550ae',class:'#953800',attr:'#0550ae',tag:'#116329',name:'#116329',operator:'#cf222e',literal:'#0550ae',variable:'#24292f',property:'#0550ae',punctuation:'#24292f',params:'#24292f',meta:'#6e7781',regexp:'#116329',selector:'#116329',subst:'#24292f',symbol:'#0550ae',link:'#0a3069'},
  'one-light':      {name:'One Light',     bg:'#fafafa',  fg:'#383a42',  keyword:'#a626a4',string:'#50a14f',number:'#986801',comment:'#a0a1a7',function:'#4078f2',title:'#4078f2',built_in:'#c18401',type:'#c18401',class:'#c18401',attr:'#986801',tag:'#e45649',name:'#e45649',operator:'#a626a4',literal:'#0184bb',variable:'#383a42',property:'#0184bb',punctuation:'#383a42',params:'#383a42',meta:'#a0a1a7',regexp:'#50a14f',selector:'#e45649',subst:'#383a42',symbol:'#0184bb',link:'#50a14f'},
  'solarized-light':{name:'Solarized Light',bg:'#fdf6e3', fg:'#657b83',  keyword:'#859900',string:'#2aa198',number:'#d33682',comment:'#93a1a1',function:'#268bd2',title:'#268bd2',built_in:'#268bd2',type:'#b58900',class:'#b58900',attr:'#657b83',tag:'#268bd2',name:'#268bd2',operator:'#859900',literal:'#2aa198',variable:'#657b83',property:'#268bd2',punctuation:'#657b83',params:'#657b83',meta:'#93a1a1',regexp:'#2aa198',selector:'#268bd2',subst:'#657b83',symbol:'#cb4b16',link:'#2aa198'},
  'vs-light':       {name:'VS Code Light', bg:'#ffffff',  fg:'#000000',  keyword:'#0000ff',string:'#a31515',number:'#098658',comment:'#008000',function:'#795e26',title:'#795e26',built_in:'#267f99',type:'#267f99',class:'#267f99',attr:'#001080',tag:'#800000',name:'#800000',operator:'#000000',literal:'#0000ff',variable:'#001080',property:'#001080',punctuation:'#000000',params:'#001080',meta:'#008000',regexp:'#811f3f',selector:'#800000',subst:'#000000',symbol:'#001080',link:'#a31515'},
  'gruvbox-light':  {name:'Gruvbox Light', bg:'#fbf1c7',  fg:'#3c3836',  keyword:'#9d0006',string:'#79740e',number:'#8f3f71',comment:'#928374',function:'#b57614',title:'#b57614',built_in:'#427b58',type:'#427b58',class:'#427b58',attr:'#076678',tag:'#9d0006',name:'#9d0006',operator:'#9d0006',literal:'#8f3f71',variable:'#3c3836',property:'#427b58',punctuation:'#3c3836',params:'#3c3836',meta:'#928374',regexp:'#79740e',selector:'#9d0006',subst:'#3c3836',symbol:'#8f3f71',link:'#79740e'},
  'rose-pine-dawn': {name:'Rosé Pine Dawn',bg:'#faf4ed',  fg:'#575279',  keyword:'#286983',string:'#d7827e',number:'#ea9d34',comment:'#9893a5',function:'#56949f',title:'#56949f',built_in:'#907aa9',type:'#907aa9',class:'#907aa9',attr:'#575279',tag:'#b4637a',name:'#b4637a',operator:'#286983',literal:'#ea9d34',variable:'#575279',property:'#56949f',punctuation:'#575279',params:'#575279',meta:'#9893a5',regexp:'#d7827e',selector:'#b4637a',subst:'#575279',symbol:'#907aa9',link:'#d7827e'},
  'quiet-light':    {name:'Quiet Light',   bg:'#f5f5f5',  fg:'#333333',  keyword:'#4b69c6',string:'#448c27',number:'#9c5d27',comment:'#aaaaaa',function:'#aa3731',title:'#aa3731',built_in:'#4b69c6',type:'#4b69c6',class:'#7a3e9d',attr:'#333333',tag:'#4b69c6',name:'#4b69c6',operator:'#4b69c6',literal:'#9c5d27',variable:'#333333',property:'#aa3731',punctuation:'#333333',params:'#333333',meta:'#aaaaaa',regexp:'#448c27',selector:'#4b69c6',subst:'#333333',symbol:'#4b69c6',link:'#448c27'},
  // ── Dark (13) ──────────────────────────────────────────────────────────────
  'one-dark':       {name:'One Dark',      bg:'#282c34',  fg:'#abb2bf',  keyword:'#c678dd',string:'#98c379',number:'#d19a66',comment:'#5c6370',function:'#61afef',title:'#61afef',built_in:'#e5c07b',type:'#e5c07b',class:'#e5c07b',attr:'#d19a66',tag:'#e06c75',name:'#e06c75',operator:'#c678dd',literal:'#56b6c2',variable:'#e06c75',property:'#56b6c2',punctuation:'#abb2bf',params:'#d19a66',meta:'#5c6370',regexp:'#98c379',selector:'#e06c75',subst:'#abb2bf',symbol:'#56b6c2',link:'#98c379'},
  'monokai':        {name:'Monokai',       bg:'#272822',  fg:'#f8f8f2',  keyword:'#f92672',string:'#e6db74',number:'#ae81ff',comment:'#75715e',function:'#a6e22e',title:'#a6e22e',built_in:'#66d9ef',type:'#66d9ef',class:'#a6e22e',attr:'#a6e22e',tag:'#f92672',name:'#f92672',operator:'#f92672',literal:'#ae81ff',variable:'#f8f8f2',property:'#a6e22e',punctuation:'#f8f8f2',params:'#fd971f',meta:'#75715e',regexp:'#e6db74',selector:'#a6e22e',subst:'#f8f8f2',symbol:'#ae81ff',link:'#e6db74'},
  'dracula':        {name:'Dracula',       bg:'#282a36',  fg:'#f8f8f2',  keyword:'#ff79c6',string:'#f1fa8c',number:'#bd93f9',comment:'#6272a4',function:'#50fa7b',title:'#50fa7b',built_in:'#8be9fd',type:'#8be9fd',class:'#ffb86c',attr:'#50fa7b',tag:'#ff79c6',name:'#ff79c6',operator:'#ff79c6',literal:'#bd93f9',variable:'#f8f8f2',property:'#8be9fd',punctuation:'#f8f8f2',params:'#ffb86c',meta:'#6272a4',regexp:'#f1fa8c',selector:'#ff79c6',subst:'#f8f8f2',symbol:'#bd93f9',link:'#f1fa8c'},
  'nord':           {name:'Nord',          bg:'#2e3440',  fg:'#d8dee9',  keyword:'#81a1c1',string:'#a3be8c',number:'#b48ead',comment:'#616e88',function:'#88c0d0',title:'#88c0d0',built_in:'#81a1c1',type:'#8fbcbb',class:'#8fbcbb',attr:'#8fbcbb',tag:'#81a1c1',name:'#81a1c1',operator:'#81a1c1',literal:'#b48ead',variable:'#d8dee9',property:'#88c0d0',punctuation:'#d8dee9',params:'#d8dee9',meta:'#616e88',regexp:'#ebcb8b',selector:'#88c0d0',subst:'#d8dee9',symbol:'#b48ead',link:'#a3be8c'},
  'tokyo-night':    {name:'Tokyo Night',   bg:'#1a1b2e',  fg:'#a9b1d6',  keyword:'#bb9af7',string:'#9ece6a',number:'#ff9e64',comment:'#565f89',function:'#7aa2f7',title:'#7aa2f7',built_in:'#2ac3de',type:'#2ac3de',class:'#e0af68',attr:'#73daca',tag:'#f7768e',name:'#f7768e',operator:'#89ddff',literal:'#ff9e64',variable:'#c0caf5',property:'#73daca',punctuation:'#89ddff',params:'#e0af68',meta:'#565f89',regexp:'#b4f9f8',selector:'#f7768e',subst:'#c0caf5',symbol:'#ff9e64',link:'#9ece6a'},
  'github-dark':    {name:'GitHub Dark',   bg:'#0d1117',  fg:'#e6edf3',  keyword:'#ff7b72',string:'#a5d6ff',number:'#79c0ff',comment:'#8b949e',function:'#d2a8ff',title:'#d2a8ff',built_in:'#79c0ff',type:'#ffa657',class:'#ffa657',attr:'#79c0ff',tag:'#7ee787',name:'#7ee787',operator:'#ff7b72',literal:'#79c0ff',variable:'#ffa657',property:'#79c0ff',punctuation:'#e6edf3',params:'#e6edf3',meta:'#8b949e',regexp:'#a5d6ff',selector:'#7ee787',subst:'#e6edf3',symbol:'#79c0ff',link:'#a5d6ff'},
  'solarized':      {name:'Solarized Dark',bg:'#002b36',  fg:'#839496',  keyword:'#859900',string:'#2aa198',number:'#d33682',comment:'#586e75',function:'#268bd2',title:'#268bd2',built_in:'#268bd2',type:'#b58900',class:'#b58900',attr:'#657b83',tag:'#268bd2',name:'#268bd2',operator:'#859900',literal:'#2aa198',variable:'#839496',property:'#268bd2',punctuation:'#839496',params:'#839496',meta:'#586e75',regexp:'#2aa198',selector:'#268bd2',subst:'#839496',symbol:'#cb4b16',link:'#2aa198'},
  'material':       {name:'Material',      bg:'#263238',  fg:'#eeffff',  keyword:'#c792ea',string:'#c3e88d',number:'#f78c6c',comment:'#546e7a',function:'#82aaff',title:'#82aaff',built_in:'#ffcb6b',type:'#ffcb6b',class:'#f07178',attr:'#f07178',tag:'#f07178',name:'#f07178',operator:'#89ddff',literal:'#f78c6c',variable:'#eeffff',property:'#89ddff',punctuation:'#89ddff',params:'#f78c6c',meta:'#546e7a',regexp:'#c3e88d',selector:'#f07178',subst:'#eeffff',symbol:'#89ddff',link:'#c3e88d'},
  'synthwave':      {name:'Synthwave',     bg:'#262335',  fg:'#e2e0f7',  keyword:'#f97e72',string:'#ff8b39',number:'#ff7edb',comment:'#495495',function:'#36f9f6',title:'#36f9f6',built_in:'#fede5d',type:'#fede5d',class:'#ff8b39',attr:'#fe4450',tag:'#fe4450',name:'#fe4450',operator:'#f97e72',literal:'#ff7edb',variable:'#e2e0f7',property:'#36f9f6',punctuation:'#e2e0f7',params:'#fede5d',meta:'#495495',regexp:'#ff8b39',selector:'#fe4450',subst:'#e2e0f7',symbol:'#ff7edb',link:'#ff8b39'},
  'night-owl':      {name:'Night Owl',     bg:'#011627',  fg:'#d6deeb',  keyword:'#c792ea',string:'#addb67',number:'#f78c6c',comment:'#637777',function:'#82aaff',title:'#82aaff',built_in:'#addb67',type:'#ffcb8b',class:'#ffcb8b',attr:'#7fdbca',tag:'#7fdbca',name:'#7fdbca',operator:'#c792ea',literal:'#ff5874',variable:'#d6deeb',property:'#7fdbca',punctuation:'#d9f5dd',params:'#7fdbca',meta:'#637777',regexp:'#5ca7e4',selector:'#7fdbca',subst:'#d6deeb',symbol:'#82aaff',link:'#addb67'},
  'catppuccin':     {name:'Catppuccin',    bg:'#1e1e2e',  fg:'#cdd6f4',  keyword:'#cba6f7',string:'#a6e3a1',number:'#fab387',comment:'#6c7086',function:'#89b4fa',title:'#89b4fa',built_in:'#89dceb',type:'#89dceb',class:'#f38ba8',attr:'#89dceb',tag:'#f38ba8',name:'#f38ba8',operator:'#cba6f7',literal:'#fab387',variable:'#cdd6f4',property:'#89dceb',punctuation:'#cdd6f4',params:'#fab387',meta:'#6c7086',regexp:'#a6e3a1',selector:'#f38ba8',subst:'#cdd6f4',symbol:'#cba6f7',link:'#a6e3a1'},
  'ayu-dark':       {name:'Ayu Dark',      bg:'#1f2430',  fg:'#cbccc6',  keyword:'#ffa759',string:'#bae67e',number:'#ffcc66',comment:'#5c6773',function:'#ffd580',title:'#ffd580',built_in:'#5ccfe6',type:'#5ccfe6',class:'#73d0ff',attr:'#cbccc6',tag:'#f28779',name:'#f28779',operator:'#ffa759',literal:'#d4bfff',variable:'#cbccc6',property:'#5ccfe6',punctuation:'#cbccc6',params:'#cbccc6',meta:'#5c6773',regexp:'#95e6cb',selector:'#f28779',subst:'#cbccc6',symbol:'#d4bfff',link:'#bae67e'},
  'gruvbox-dark':   {name:'Gruvbox Dark',  bg:'#282828',  fg:'#ebdbb2',  keyword:'#fb4934',string:'#b8bb26',number:'#d3869b',comment:'#928374',function:'#83a598',title:'#83a598',built_in:'#fabd2f',type:'#fabd2f',class:'#8ec07c',attr:'#ebdbb2',tag:'#fb4934',name:'#fb4934',operator:'#fb4934',literal:'#d3869b',variable:'#ebdbb2',property:'#83a598',punctuation:'#ebdbb2',params:'#ebdbb2',meta:'#928374',regexp:'#b8bb26',selector:'#fb4934',subst:'#ebdbb2',symbol:'#d3869b',link:'#b8bb26'},
  // ── Custom (1) ─────────────────────────────────────────────────────────────
  'custom':         {name:'Custom',        bg:'#1e1e2e',  fg:'#cdd6f4',  keyword:'#cba6f7',string:'#a6e3a1',number:'#fab387',comment:'#6c7086',function:'#89b4fa',title:'#89b4fa',built_in:'#89dceb',type:'#89dceb',class:'#f38ba8',attr:'#89dceb',tag:'#f38ba8',name:'#f38ba8',operator:'#cba6f7',literal:'#fab387',variable:'#cdd6f4',property:'#89dceb',punctuation:'#cdd6f4',params:'#fab387',meta:'#6c7086',regexp:'#a6e3a1',selector:'#f38ba8',subst:'#cdd6f4',symbol:'#cba6f7',link:'#a6e3a1'},
};

const LIGHT_THEME_KEYS = ['github-light','one-light','solarized-light','vs-light','gruvbox-light','rose-pine-dawn','quiet-light'];

const THEMES_ORIG = JSON.parse(JSON.stringify(THEMES));
const THEME_OVERRIDES_KEY = 'codeshot_theme_overrides';
const THEME_COLOR_PROPS = [
  {key:'bg',label:'Background'},{key:'fg',label:'Foreground'},
  {key:'keyword',label:'Keyword'},{key:'string',label:'String'},
  {key:'number',label:'Number'},{key:'comment',label:'Comment'},
  {key:'function',label:'Function'},{key:'title',label:'Title'},
  {key:'built_in',label:'Built-in'},{key:'type',label:'Type'},
  {key:'class',label:'Class'},{key:'attr',label:'Attr'},
  {key:'tag',label:'Tag'},{key:'name',label:'Name'},
  {key:'operator',label:'Operator'},{key:'literal',label:'Literal'},
  {key:'variable',label:'Variable'},{key:'property',label:'Property'},
  {key:'punctuation',label:'Punct.'},{key:'params',label:'Params'},
  {key:'meta',label:'Meta'},{key:'regexp',label:'Regexp'},
  {key:'selector',label:'Selector'},{key:'subst',label:'Subst'},
  {key:'symbol',label:'Symbol'},{key:'link',label:'Link'},
];
let themeOverrides = {};

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

const TEXT_STYLES = [
  { id: 'none',           name: 'None',           hasColor1: false, hasColor2: false, hasIntensity: false },
  { id: 'corner-glow',    name: 'Corner Glow',    hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'double-outline', name: 'Dbl Outline',    hasColor1: true,  hasColor2: true,  hasIntensity: true  },
  { id: 'drop-shadow',    name: 'Drop Shadow',    hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'embossed',       name: 'Embossed',       hasColor1: false, hasColor2: false, hasIntensity: true  },
  { id: 'fire',           name: 'Fire',           hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'glitch',         name: 'Glitch',         hasColor1: true,  hasColor2: true,  hasIntensity: true  },
  { id: 'glow',           name: 'Glow',           hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'gold',           name: 'Gold',           hasColor1: false, hasColor2: false, hasIntensity: false },
  { id: 'gradient-fill',  name: 'Gradient Fill',  hasColor1: true,  hasColor2: true,  hasIntensity: false },
  { id: 'hollow',         name: 'Hollow',         hasColor1: false, hasColor2: false, hasIntensity: true  },
  { id: 'ice',            name: 'Ice',            hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'inner-glow',     name: 'Inner Glow',     hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'letterpress',    name: 'Letterpress',    hasColor1: false, hasColor2: false, hasIntensity: true  },
  { id: 'long-shadow',    name: 'Long Shadow',    hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'metallic',       name: 'Metallic',       hasColor1: false, hasColor2: false, hasIntensity: false },
  { id: 'neon-sign',      name: 'Neon Sign',      hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'outline',        name: 'Outline',        hasColor1: true,  hasColor2: false, hasIntensity: true  },
  { id: 'rainbow',        name: 'Rainbow',        hasColor1: false, hasColor2: false, hasIntensity: false },
  { id: 'recessed',       name: 'Recessed',       hasColor1: false, hasColor2: false, hasIntensity: true  },
  { id: 'retro-shadow',   name: 'Retro Shadow',   hasColor1: true,  hasColor2: false, hasIntensity: true  },
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
