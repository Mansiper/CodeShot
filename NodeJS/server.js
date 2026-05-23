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
const VALID_FORMATS  = ['png','jpg','gif','tiff','base64'];
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
    // keep selection clear; not applicable in API context
    selectionColor:   '#6490ff',
    selectionOpacity: 0,
  };
}

// ─── POST / — render endpoint ─────────────────────────────────────────────────

app.post('/', async (req, res) => {
  const code = typeof req.body === 'string' ? req.body : '';
  if (!code.trim()) {
    return res.status(400).json({ error: 'Request body must contain source code as plain text.' });
  }

  const q         = req.query;
  const imgFormat = parseEnum(q.img_format, VALID_FORMATS, 'png');
  const watermark = parseBool(q.watermark, false);
  const stateData = buildState(q, code);

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
    const dataURL = await page.evaluate(async (stateOverride, format, wm) => {
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
        return tmp.toDataURL('image/jpeg', 0.95);
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
    }, stateData, imgFormat, watermark);

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
    const extMap = { png: 'png', jpg: 'jpg', gif: 'gif', tiff: 'tiff' };
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
      // ── Output ─────────────────────────────────────────────────────────────
      watermark:          { type: 'bool',                                   default: false,            description: 'Overlay the CodeShot watermark' },
      img_format:         { type: 'string',  values: VALID_FORMATS,        default: 'png',            description: 'Output format (base64 returns a text/plain data-URL)' },
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
