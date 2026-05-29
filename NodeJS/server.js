'use strict';

/**
 * CodeShot API Server
 *
 * Renders beautiful code screenshots by driving the existing browser-based
 * renderer (app.js / index.html) with Puppeteer and returning the result as
 * a binary image or a Base64 string.
 *
 * Usage:
 *   npm install
 *   node server.js
 *
 * Example curl call:
 *   curl -X POST "http://localhost:3000/?lang=javascript&theme=dracula&img_format=png" \
 *        -H "Content-Type: text/plain" \
 *        --data-binary "@script.js" \
 *        -o screenshot.png
 *
 * Full parameter reference: GET /api/info
 */

const express   = require('express');
const puppeteer = require('puppeteer');
const path      = require('path');

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

// ─── Static files (index.html, app.js, css.css) ───────────────────────────────
// server.js lives in the nodejs/ subfolder; the web assets are one level up.
app.use(express.static(path.join(__dirname, '..')));

// Accept plain text body up to 512 KB
app.use(express.text({ type: '*/*', limit: '512kb' }));

// ─── Validation helpers ───────────────────────────────────────────────────────

function parseBool(val, def) {
  if (val === undefined) return def;
  return val === 'true' || val === '1';
}

function parseNum(val, def) {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
}

/** Accepts hex colors with or without a leading '#'.  Returns undefined on bad input. */
function parseHex(val) {
  if (!val) return undefined;
  const clean = String(val).replace(/^#/, '');
  return /^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean) ? '#' + clean : undefined;
}

/** Replace underscores with spaces so font names work in URLs (JetBrains_Mono → JetBrains Mono). */
function parseFont(val) {
  return val ? String(val).replace(/_/g, ' ') : undefined;
}

function parseEnum(val, allowed, def) {
  return val && allowed.includes(val) ? val : def;
}

// ─── Allowed values (mirrored from app.js constants) ─────────────────────────

const VALID_LANGS = [
  'bash','csharp','c','cpp','css','dart','pascal','dockerfile','elixir','erlang',
  'fsharp','go','graphql','groovy','haskell','html','ini','java','javascript',
  'json','jsx','kotlin','tex','lisp','lua','makefile','markdown','matlab','nginx',
  'objectivec','perl','php','powershell','python','r','ruby','rust','scala','scss',
  'shell','sql','swift','toml','tsx','typescript','vbnet','vim','xml','yaml','1c',
  'plaintext',
];
const VALID_THEMES   = [
  'github-light','one-light','solarized-light','vs-light','gruvbox-light','rose-pine-dawn','quiet-light',
  'one-dark','monokai','dracula','nord','tokyo-night','github-dark','solarized',
  'material','synthwave','night-owl','catppuccin','ayu-dark','gruvbox-dark',
];
const VALID_CHROME   = ['macos','windows','gnome','none'];
const VALID_BG       = ['gradient','solid','none'];
const VALID_FILTERS  = [
  'none','bw','sepia','cool','warm','faded','vivid','cinematic','noir','amber',
  'mint','dusk','retro','neon','lofi','bleach','ice','overexposed','darkroom','dreamy',
];
const VALID_TEXTURES = [
  'none','paper','grain','linen','wood','metal-shiny','metal-brushed','carbon',
  'scanlines','glitter','noise','dots','grid','diagonal','crosshatch','hex',
  'concrete','denim','vignette','frosted',
];
const VALID_TEXT_STYLES = [
  'none','drop-shadow','corner-glow','outline','glow','recessed','embossed',
  'long-shadow','letterpress','retro-shadow','gradient-fill','rainbow',
  'inner-glow','double-outline','fire','metallic','ice','gold','glitch',
  'neon-sign','hollow',
];
const VALID_FORMATS  = ['png','jpg','webp','gif','tiff','base64'];
const VALID_SCALES   = [1, 2, 3, 4];
const VALID_ASPECTS  = ['custom','16:9','3:2','4:3','5:4','1:1','4:5','3:4','2:3','9:16'];
const VALID_BLUR_DIR = ['top','bottom','left','right'];
const VALID_ALIGN    = ['left','center','right','justify'];

// ─── Map query-string params to the renderer state object ────────────────────

function buildState(q, code) {
  return {
    code,
    inputMode:        parseEnum(q.mode,           ['code','text','markdown'],  'code'),
    language:         parseEnum(q.lang,           VALID_LANGS,      'javascript'),
    font:             parseFont(q.font)                           || 'JetBrains Mono',
    fontSize:         parseNum (q.size,           14),
    lineHeight:       parseNum (q.line_height,    1.6),
    ligatures:        parseBool(q.ligatures,        true),
    letterSpacing:    parseNum (q.letter_spacing,   0),
    tabSize:          parseNum (q.tab_size,          4),
    theme:            parseEnum(q.theme,          VALID_THEMES,     'one-dark'),
    bgType:           parseEnum(q.bg,             VALID_BG,         'gradient'),
    bgSolid:          parseHex (q.bg_color)                       || '#1a1b2e',
    gradC1:           parseHex (q.grad_c1)                        || '#0f0c29',
    gradC2:           parseHex (q.grad_c2)                        || '#302b63',
    gradAngle:        parseNum (q.grad_angle,     135),
    outerPadding:     parseNum (q.outer_pad,      56),
    innerPadding:     parseNum (q.inner_pad,      40),
    cornerRadius:     parseNum (q.radius,         14),
    chromeStyle:      parseEnum(q.chrome,         VALID_CHROME,     'macos'),
    windowTitle:      typeof q.title === 'string' ? q.title.slice(0, 100) : 'code',
    showLineNumbers:  parseBool(q.line_numbers,   false),
    firstLineNumber:  parseNum (q.first_line,     1),
    lineNumberColor:  parseHex (q.line_num_color)                 || '',
    showShadow:       parseBool(q.shadow,         true),
    shadowBlur:       parseNum (q.shadow_blur,    30),
    tiltAngle:        parseNum (q.tilt,           0),
    depthAngle:       parseNum (q.depth,          0),
    depthAngleY:      parseNum (q.depth_y,        0),
    trapLeft:         parseNum (q.trap_left,      100),
    trapRight:        parseNum (q.trap_right,     100),
    trapTop:          parseNum (q.trap_top,       100),
    trapBottom:       parseNum (q.trap_bottom,    100),
    windowOffsetX:    parseNum (q.offset_x,       0),
    windowOffsetY:    parseNum (q.offset_y,       0),
    filter:           parseEnum(q.filter,         VALID_FILTERS,    'none'),
    filterIntensity:  parseNum (q.filter_intensity, 100),
    texture:          parseEnum(q.texture,        VALID_TEXTURES,   'none'),
    textureIntensity: parseNum (q.texture_intensity, 50),
    textStyle:        parseEnum(q.text_style,       VALID_TEXT_STYLES, 'none'),
    textStyleColor1:  parseHex (q.text_style_color1)                || '#89b4fa',
    textStyleColor2:  parseHex (q.text_style_color2)                || '#cba6f7',
    textStyleIntensity: parseNum(q.text_style_intensity, 50),
    zoom:             parseNum (q.zoom,           100),
    windowOpacity:    parseNum (q.window_opacity, 100),
    gradBlur:         parseBool(q.grad_blur,      false),
    gradBlurDir:      parseEnum(q.grad_blur_dir,  VALID_BLUR_DIR,   'bottom'),
    gradBlurAmount:   parseNum (q.grad_blur_amount, 20),
    gradBlurStart:    parseNum (q.grad_blur_start,  30),
    plainTextColor:   parseHex (q.text_color)                     || '#e0e0e0',
    plainTextBg:      parseHex (q.text_bg)                        || '#1e1e2e',
    plainFont:        parseFont(q.plain_font)                     || 'Arial',
    plainTextAlign:   parseEnum(q.text_align,     VALID_ALIGN,      'left'),
    mdHeadingColor:   parseHex (q.md_heading_color)               || '#e2c08d',
    mdLinkColor:      parseHex (q.md_link_color)                  || '#61afef',
    // Screen glare
    glareEnabled:     parseBool(q.glare,            false),
    glareX:           parseNum (q.glare_x,          50),
    glareY:           parseNum (q.glare_y,          50),
    glareDistance:    parseNum (q.glare_distance,   200),
    glareAngleH:      parseNum (q.glare_angle_h,    0),
    glareAngleV:      parseNum (q.glare_angle_v,    0),
    glareBlur:        parseNum (q.glare_blur,       30),
    glareIntensity:   parseNum (q.glare_intensity,  60),
    glareColor:       parseHex (q.glare_color)                    || '#ffffff',
    // Lens distortion
    lensAmount:       parseNum (q.lens,             0),
    // Scale & aspect ratio
    scaleMultiplier:  VALID_SCALES.includes(parseNum(q.scale, 1)) ? parseNum(q.scale, 1) : 1,
    aspectRatio:      parseEnum(q.aspect_ratio, VALID_ASPECTS, 'custom'),
    // keep selection clear; not applicable in API context
    selectionColor:   '#6490ff',
    selectionOpacity: 0,
  };
}

// ─── Random-state builder ─────────────────────────────────────────────────────

const GRADIENT_PRESETS = [
  ['#0f0c29','#302b63',135],['#0a0a2e','#1a0533',180],['#001f3f','#0a3d62',150],
  ['#1a0000','#3d0000',160],['#001a00','#003300',140],['#1a1a2e','#0f3460',135],
  ['#2d1b69','#11998e',120],['#141e30','#243b55',180],['#16213e','#e94560',135],
  ['#373b44','#4286f4',150],
];
const CODE_FONTS = [
  'Anonymous Pro','Courier New','Cousine','DM Mono','Fira Code',
  'IBM Plex Mono','Inconsolata','JetBrains Mono','Noto Sans Mono','Overpass Mono',
  'Roboto Mono','Source Code Pro','Space Mono','monospace','Ubuntu Mono',
];

function buildRandomState(q, code) {
  const base  = buildState(q, code);
  const pick  = arr => arr[Math.floor(Math.random() * arr.length)];
  const rnd   = (min, max, step = 1) => {
    const steps = Math.floor((max - min) / step);
    return min + Math.floor(Math.random() * (steps + 1)) * step;
  };
  const rndF  = (min, max, dec = 1) => parseFloat((min + Math.random() * (max - min)).toFixed(dec));
  const hexB  = n => n.toString(16).padStart(2, '0');
  const rgb   = (r, g, b) => '#' + hexB(r) + hexB(g) + hexB(b);

  // Theme
  base.theme = pick(VALID_THEMES);

  // Background
  const bgPreset  = pick(GRADIENT_PRESETS);
  base.bgType     = Math.random() < 0.15 ? 'solid' : 'gradient';
  base.bgSolid    = rgb(rnd(0, 40), rnd(0, 40), rnd(0, 80));
  base.gradC1     = bgPreset[0];
  base.gradC2     = bgPreset[1];
  base.gradAngle  = bgPreset[2];

  // Font
  base.font          = pick(CODE_FONTS);
  base.fontSize      = rnd(11, 18);
  base.lineHeight    = rndF(1.4, 2.0, 1);
  base.ligatures     = Math.random() > 0.3;
  base.letterSpacing = 0;

  // Layout
  base.outerPadding = rnd(24, 100, 4);
  base.innerPadding = rnd(16, 60, 2);
  base.cornerRadius = rnd(0, 28, 2);

  // Chrome
  base.chromeStyle = pick(VALID_CHROME);

  // Shadow
  base.showShadow = Math.random() > 0.2;
  base.shadowBlur = rnd(10, 60, 2);

  // Window opacity (usually full)
  base.windowOpacity = Math.random() > 0.8 ? rnd(60, 95, 5) : 100;

  // Filter
  base.filter          = pick(VALID_FILTERS);
  base.filterIntensity = rnd(50, 100);

  // Texture
  if (Math.random() < 0.5) {
    base.texture          = pick(VALID_TEXTURES.filter(t => t !== 'none'));
    base.textureIntensity = rnd(20, 70);
  } else {
    base.texture = 'none';
  }

  // Screen glare (30% chance)
  if (Math.random() < 0.3) {
    base.glareEnabled   = true;
    base.glareX         = rnd(20, 80);
    base.glareY         = rnd(10, 60);
    base.glareDistance  = rnd(100, 400, 10);
    base.glareIntensity = rnd(30, 70);
    base.glareBlur      = rnd(10, 50);
    base.glareAngleH    = rnd(-30, 30);
    base.glareAngleV    = rnd(-30, 30);
    base.glareColor     = '#ffffff';
  } else {
    base.glareEnabled = false;
  }

  // 3-D tilt (20% chance)
  if (Math.random() < 0.2) {
    base.tiltAngle   = rnd(-15, 15);
    base.depthAngle  = rnd(-15, 15);
    base.depthAngleY = rnd(-15, 15);
  } else {
    base.tiltAngle = 0; base.depthAngle = 0; base.depthAngleY = 0;
  }

  // Aspect ratio
  base.aspectRatio = pick(['custom','custom','custom','16:9','4:3','1:1']);

  // Reset transform/layout params that are not randomized
  base.zoom           = 100;
  base.trapLeft       = 100; base.trapRight  = 100;
  base.trapTop        = 100; base.trapBottom = 100;
  base.gradBlur       = false;
  base.lensAmount     = 0;
  base.windowOffsetX  = 0;
  base.windowOffsetY  = 0;
  base.scaleMultiplier = 1;

  return base;
}

// ─── POST / — render endpoint ─────────────────────────────────────────────────

app.post('/', async (req, res) => {
  const code = typeof req.body === 'string' ? req.body : '';
  if (!code.trim()) {
    return res.status(400).json({ error: 'Request body must contain source code as plain text.' });
  }

  const q          = req.query;
  const imgFormat  = parseEnum(q.img_format, VALID_FORMATS, 'png');
  const watermark  = parseBool(q.watermark, false);
  const random     = q.random !== undefined && q.random !== 'false' && q.random !== '0';
  const jpgQuality = Math.min(100, Math.max(1, parseNum(q.jpg_quality, 92))) / 100;
  const stateData = random ? buildRandomState(q, code) : buildState(q, code);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Navigate to the local copy of the UI (served by Express)
    await page.goto(`http://localhost:${PORT}/index.html`, {
      waitUntil: 'networkidle2',
      timeout:   30_000,
    });

    // Ensure highlight.js is available before injecting state
    await page.waitForFunction(() => typeof hljs !== 'undefined', { timeout: 10_000 });

    // Drive the in-browser renderer and capture the canvas as a data-URL
    const dataURL = await page.evaluate(async (stateOverride, format, wm, jpgQ) => {
      // Wait for web fonts (Google Fonts CDN) to finish loading
      await document.fonts.ready;

      // Merge API parameters into the existing global state.
      // state/selectionRange/showWatermark/tokCache are `let` declarations in
      // app.js — they live in the global lexical scope but are NOT properties
      // of `window`, so they must be accessed by name, not via window.*
      Object.assign(state, stateOverride);

      // Clear any leftover selection and configure watermark
      selectionRange = null;
      showWatermark  = wm;

      // Invalidate the token cache so new code/language is re-highlighted
      tokCache = null;

      // Run the synchronous render pipeline that already exists in app.js
      doRender();

      const canvas = document.getElementById('preview-canvas');

      if (format === 'png') {
        return canvas.toDataURL('image/png');
      }

      if (format === 'jpg') {
        // Flatten transparency onto white before JPEG encoding
        const tmp = document.createElement('canvas');
        tmp.width  = canvas.width;
        tmp.height = canvas.height;
        const c = tmp.getContext('2d');
        c.fillStyle = '#ffffff';
        c.fillRect(0, 0, tmp.width, tmp.height);
        c.drawImage(canvas, 0, 0);
        return tmp.toDataURL('image/jpeg', jpgQ);
      }

      if (format === 'webp') {
        return canvas.toDataURL('image/webp', 0.95);
      }

      if (format === 'base64') {
        // Return the raw data-URL string; caller receives it as text/plain
        return canvas.toDataURL('image/png');
      }

      if (format === 'tiff') {
        // canvasToTiff is defined in app.js and uses a callback
        return new Promise(resolve => {
          canvasToTiff(canvas, blob => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        });
      }

      if (format === 'gif') {
        // canvasToGif is defined in app.js and uses a callback
        return new Promise(resolve => {
          canvasToGif(canvas, blob => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        });
      }

      return null;
    }, stateData, imgFormat, watermark, jpgQuality);

    await browser.close();
    browser = null;

    if (!dataURL) {
      return res.status(500).json({ error: 'Renderer returned no data.' });
    }

    // Return Base64 data-URL as plain text so the caller can use it directly
    if (imgFormat === 'base64') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(dataURL);
    }

    // Decode the data-URL and send binary image bytes
    const match = dataURL.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match) {
      return res.status(500).json({ error: 'Malformed image data from renderer.' });
    }

    const mime   = match[1];
    const buffer = Buffer.from(match[2], 'base64');
    const extMap = { png: 'png', jpg: 'jpg', webp: 'webp', gif: 'gif', tiff: 'tiff' };
    const ext    = extMap[imgFormat] || 'png';

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="codeshot.${ext}"`);
    return res.send(buffer);

  } catch (err) {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    console.error('[CodeShot API] Render error:', err.message);
    return res.status(500).json({ error: 'Internal server error.', details: err.message });
  }
});

// ─── GET /api/info — parameter reference ─────────────────────────────────────

app.get('/api/info', (_req, res) => {
  res.json({
    name:        'CodeShot API',
    version:     '1.0.0',
    description: 'Render beautiful code screenshots over HTTP.',
    endpoint:    'POST /',
    body:        'Plain text — the source code (or text) to render.',
    params: {
      // ── Content ────────────────────────────────────────────────────────────
      mode:               { type: 'string',  values: ['code','text','markdown'], default: 'code',           description: 'Rendering mode: syntax-highlighted code, plain text, or rendered Markdown' },
      lang:               { type: 'string',  values: VALID_LANGS,          default: 'javascript',     description: 'Syntax-highlighting language' },
      // ── Typography ─────────────────────────────────────────────────────────
      font:               { type: 'string',  example: 'JetBrains_Mono',    default: 'JetBrains_Mono', description: 'Code font (underscores become spaces)' },
      size:               { type: 'number',  range: '8–72',                default: 14,               description: 'Font size in px' },
      line_height:        { type: 'number',  range: '1.0–3.0',             default: 1.6,              description: 'Line-height multiplier' },      ligatures:          { type: 'bool',                                   default: true,             description: 'Enable font ligatures' },
      letter_spacing:     { type: 'number',  range: '-2–10',               default: 0,                description: 'Letter spacing in px (0 = normal)' },
      tab_size:           { type: 'number',  range: '1–10',                default: 4,                description: 'Tab width in spaces' },      // ── Theme & colors ─────────────────────────────────────────────────────
      theme:              { type: 'string',  values: VALID_THEMES,         default: 'one-dark',       description: 'Syntax-highlight color theme' },
      // ── Background ─────────────────────────────────────────────────────────
      bg:                 { type: 'string',  values: VALID_BG,             default: 'gradient',       description: 'Background type' },
      bg_color:           { type: 'hex',     example: '1a1b2e',            default: '1a1b2e',         description: 'Solid background color (no #, used when bg=solid)' },
      grad_c1:            { type: 'hex',     example: '0f0c29',            default: '0f0c29',         description: 'Gradient start color (bg=gradient)' },
      grad_c2:            { type: 'hex',     example: '302b63',            default: '302b63',         description: 'Gradient end color (bg=gradient)' },
      grad_angle:         { type: 'number',  range: '0–360',               default: 135,              description: 'Gradient angle in degrees' },
      // ── Layout ─────────────────────────────────────────────────────────────
      outer_pad:          { type: 'number',  range: '0–200',               default: 56,               description: 'Outer padding — space between window and image edge' },
      inner_pad:          { type: 'number',  range: '0–100',               default: 40,               description: 'Inner padding — space between code and window edge' },
      radius:             { type: 'number',  range: '0–40',                default: 14,               description: 'Window corner radius in px' },
      // ── Window chrome ──────────────────────────────────────────────────────
      chrome:             { type: 'string',  values: VALID_CHROME,         default: 'macos',          description: 'Window title-bar style' },
      title:              { type: 'string',  example: 'app.js',            default: 'code',           description: 'Window title-bar label' },
      // ── Shadow ─────────────────────────────────────────────────────────────
      shadow:             { type: 'bool',                                   default: true,             description: 'Show drop shadow under the window' },
      shadow_blur:        { type: 'number',  range: '0–80',                default: 30,               description: 'Shadow blur radius in px' },
      // ── Line numbers ───────────────────────────────────────────────────────
      line_numbers:       { type: 'bool',                                   default: false,            description: 'Show line numbers' },
      first_line:         { type: 'number',  range: '1–9999',              default: 1,                description: 'Number of the first line' },
      line_num_color:     { type: 'hex',     example: '5c6370',            default: '(auto)',         description: 'Line-number color override (no #)' },
      // ── 3-D transforms ─────────────────────────────────────────────────────
      tilt:               { type: 'number',  range: '-45–45',              default: 0,                description: 'Z-axis tilt angle in degrees' },
      depth:              { type: 'number',  range: '-45–45',              default: 0,                description: 'X-axis perspective rotation (top/bottom lean)' },
      depth_y:            { type: 'number',  range: '-45–45',              default: 0,                description: 'Y-axis perspective rotation (left/right lean)' },
      // ── Trapezoid distortion ───────────────────────────────────────────────
      trap_left:          { type: 'number',  range: '0–200',               default: 100,              description: 'Trapezoid left-edge height %; 100 = straight' },
      trap_right:         { type: 'number',  range: '0–200',               default: 100,              description: 'Trapezoid right-edge height %' },
      trap_top:           { type: 'number',  range: '0–200',               default: 100,              description: 'Trapezoid top-edge width %' },
      trap_bottom:        { type: 'number',  range: '0–200',               default: 100,              description: 'Trapezoid bottom-edge width %' },
      // ── Window position ────────────────────────────────────────────────────
      offset_x:           { type: 'number',  range: '-100–100',            default: 0,                description: 'Window horizontal offset as % of window width' },
      offset_y:           { type: 'number',  range: '-100–100',            default: 0,                description: 'Window vertical offset as % of window height' },
      // ── Filters ────────────────────────────────────────────────────────────
      filter:             { type: 'string',  values: VALID_FILTERS,        default: 'none',           description: 'CSS image filter preset' },
      filter_intensity:   { type: 'number',  range: '0–100',               default: 100,              description: 'Filter strength %' },
      // ── Textures ───────────────────────────────────────────────────────────
      texture:            { type: 'string',  values: VALID_TEXTURES,       default: 'none',           description: 'Texture overlay drawn on top of the background' },
      texture_intensity:  { type: 'number',  range: '0–100',               default: 50,               description: 'Texture opacity %' },
      // ── Text style ─────────────────────────────────────────────────────────
      text_style:         { type: 'string',  values: VALID_TEXT_STYLES,    default: 'none',           description: 'Text rendering style applied to every character drawn on the canvas' },
      text_style_color1:  { type: 'hex',     example: '89b4fa',            default: '89b4fa',         description: 'Primary style color (shadow, outline, glow, etc.) — no #' },
      text_style_color2:  { type: 'hex',     example: 'cba6f7',            default: 'cba6f7',         description: 'Secondary style color (used by gradient-fill, double-outline, glitch) — no #' },
      text_style_intensity: { type: 'number', range: '0–100',              default: 50,               description: 'Style effect intensity %' },
      // ── Zoom & opacity ─────────────────────────────────────────────────────
      zoom:               { type: 'number',  range: '10–300',              default: 100,              description: 'Code-block zoom % (background stays the same size)' },
      window_opacity:     { type: 'number',  range: '0–100',               default: 100,              description: 'Window opacity %' },
      // ── Gradient blur ──────────────────────────────────────────────────────
      grad_blur:          { type: 'bool',                                   default: false,            description: 'Apply a directional blur gradient over the code' },
      grad_blur_dir:      { type: 'string',  values: VALID_BLUR_DIR,       default: 'bottom',         description: 'Direction from which blur increases' },
      grad_blur_amount:   { type: 'number',  range: '0–40',                default: 20,               description: 'Maximum blur radius in px' },
      grad_blur_start:    { type: 'number',  range: '0–100',               default: 30,               description: 'Point (%) at which blurring starts' },
      // ── Plain-text mode ────────────────────────────────────────────────────
      text_color:         { type: 'hex',     example: 'e0e0e0',            default: 'e0e0e0',         description: 'Text color for mode=text/markdown (no #)' },
      text_bg:            { type: 'hex',     example: '1e1e2e',            default: '1e1e2e',         description: 'Background color for mode=text/markdown (no #)' },
      plain_font:         { type: 'string',  example: 'Arial',             default: 'Arial',          description: 'Font family for mode=text/markdown' },
      text_align:         { type: 'string',  values: VALID_ALIGN,          default: 'left',           description: 'Text alignment for mode=text' },
      // ── Markdown mode ──────────────────────────────────────────────────────
      md_heading_color:   { type: 'hex',     example: 'e2c08d',            default: 'e2c08d',         description: 'Heading color for mode=markdown (no #)' },
      md_link_color:      { type: 'hex',     example: '61afef',            default: '61afef',         description: 'Link color for mode=markdown (no #)' },      // ── Screen glare ───────────────────────────────────────────────────────
      glare:              { type: 'bool',                                   default: false,            description: 'Enable screen glare overlay' },
      glare_x:            { type: 'number',  range: '-50–150',             default: 50,               description: 'Glare center X as % of canvas width (can exceed canvas bounds)' },
      glare_y:            { type: 'number',  range: '-50–150',             default: 50,               description: 'Glare center Y as % of canvas height (can exceed canvas bounds)' },
      glare_distance:     { type: 'number',  range: '10–500',              default: 200,              description: 'Distance of light source from screen — smaller = larger/softer glare' },
      glare_angle_h:      { type: 'number',  range: '-75–75',              default: 0,                description: 'Horizontal angle — tilts ellipse width (0 = circle)' },
      glare_angle_v:      { type: 'number',  range: '-75–75',              default: 0,                description: 'Vertical angle — tilts ellipse height (0 = circle)' },
      glare_blur:         { type: 'number',  range: '0–100',               default: 30,               description: 'Blur radius applied to the glare in px' },
      glare_intensity:    { type: 'number',  range: '0–100',               default: 60,               description: 'Glare brightness 0–100%' },
      glare_color:        { type: 'hex',     example: 'ffffff',            default: 'ffffff',         description: 'Glare color (no #)' },      // ── Lens distortion ────────────────────────────────────────────────────
      lens:               { type: 'number',  range: '-100–100',            default: 0,                description: 'Lens distortion: positive = convex/barrel, negative = concave/pincushion, 0 = flat' },
      // ── Export size ────────────────────────────────────────────────────────
      scale:              { type: 'number',  values: VALID_SCALES,         default: 1,                description: 'Output scale multiplier — all pixel dimensions are multiplied by this value (1, 2, 3, or 4)' },
      aspect_ratio:       { type: 'string',  values: VALID_ASPECTS,        default: 'custom',         description: 'Lock the output canvas to a fixed aspect ratio by padding the background. "custom" = no padding.' },
      // ── Randomize ──────────────────────────────────────────────────────────
      random:             { type: 'bool',                                   default: false,            description: 'Randomize all visual parameters. Only img_format and watermark are respected from the query string; everything else is chosen randomly.' },
      // ── Output ─────────────────────────────────────────────────────────────
      watermark:          { type: 'bool',                                   default: false,            description: 'Overlay the CodeShot watermark' },
      img_format:         { type: 'string',  values: VALID_FORMATS,        default: 'png',            description: 'Output format: png · jpg · webp · gif · tiff · base64 (base64 returns a text/plain data-URL)' },
    },
    examples: [
      'curl -X POST "http://localhost:3000/?lang=javascript&theme=dracula&img_format=png" \\\n  -H "Content-Type: text/plain" \\\n  --data-binary "@script.js" -o screenshot.png',
      'curl -X POST "http://localhost:3000/?lang=python&theme=monokai&chrome=windows&img_format=jpg" \\\n  -d "print(\'hello world\')" -o screenshot.jpg',
      'curl -X POST "http://localhost:3000/?lang=rust&theme=nord&bg=solid&bg_color=1a1b2e&filter=cool&img_format=png" \\\n  --data-binary "@main.rs" -o screenshot.png',
      'curl -X POST "http://localhost:3000/?lang=csharp&theme=github-dark&line_numbers=true&chrome=gnome&img_format=tiff" \\\n  --data-binary "@Program.cs" -o screenshot.tiff',
      'curl -X POST "http://localhost:3000/?lang=sql&depth=12&grad_c1=141e30&grad_c2=243b55&img_format=gif" \\\n  -d "SELECT * FROM users WHERE active = 1;" -o screenshot.gif',
    ],
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\nCodeShot API server running`);
  console.log(`  Web UI   → http://localhost:${PORT}/index.html`);
  console.log(`  API      → POST http://localhost:${PORT}/`);
  console.log(`  API docs → GET  http://localhost:${PORT}/api/info\n`);
});
