# CodeShot — Node.js API Server

An HTTP API that renders [CodeShot](https://github.com/Mansiper/CodeShot) screenshots server-side and returns a binary image. Send your code as a plain-text POST body, get a PNG/JPG/WebP/GIF/TIFF/Base64 image back — perfect for CI pipelines, bots, or any automation.

**Hosted at: [https://codeshot-u1ol.onrender.com](https://codeshot-u1ol.onrender.com)**

---

## Requirements

- Node.js ≥ 18
- The web assets (`index.html`, `app.js`, `css.css`) must be present in the **parent directory** (the repo root). The server serves them automatically.

---

## Setup

```bash
cd nodejs
npm install
node server.js
```

The server starts on port **3000** by default. Override with the `PORT` environment variable:

```bash
PORT=8080 node server.js
```

---

## Endpoint

### `POST /`

| | |
|---|---|
| **Body** | Source code (or plain text) as `text/plain` |
| **Params** | All options via query string (see table below) |
| **Response** | Binary image (`Content-Type: image/png` etc.) or `text/plain` Base64 data-URL |

---

## curl Examples

Replace `https://codeshot-u1ol.onrender.com` with `http://localhost:3000` if running locally.

```bash
# Random visual style — PNG output (default)
curl -X POST "https://codeshot-u1ol.onrender.com/?random" \
     -H "Content-Type: text/plain" \
     --data-binary "@script.js" \
     -o screenshot.png

# Random visual style — WebP output, no watermark
curl -X POST "https://codeshot-u1ol.onrender.com/?random&img_format=webp&watermark=false" \
     -H "Content-Type: text/plain" \
     --data-binary "@script.js" \
     -o screenshot.webp

# JavaScript, Dracula theme, WebP output
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=javascript&theme=dracula&img_format=webp" \
     -H "Content-Type: text/plain" \
     --data-binary "@script.js" \
     -o screenshot.webp

# Basic — JavaScript, Dracula theme, PNG output
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=javascript&theme=dracula&img_format=png" \
     -H "Content-Type: text/plain" \
     --data-binary "@script.js" \
     -o screenshot.png

# Python, Monokai, Windows chrome, JPG (default quality 92)
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=python&theme=monokai&chrome=windows&img_format=jpg" \
     -d "print('hello world')" \
     -o screenshot.jpg

# JPG with custom quality (70%)
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=python&theme=monokai&img_format=jpg&jpg_quality=70" \
     -d "print('hello world')" \
     -o screenshot_q70.jpg

# Rust, Nord, solid background, Cool filter, PNG
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=rust&theme=nord&bg=solid&bg_color=1a1b2e&filter=cool&img_format=png" \
     --data-binary "@main.rs" \
     -o screenshot.png

# C#, GitHub Dark, line numbers, GNOME chrome, TIFF
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=csharp&theme=github-dark&line_numbers=true&chrome=gnome&img_format=tiff" \
     --data-binary "@Program.cs" \
     -o screenshot.tiff

# SQL, perspective depth, custom gradient, GIF
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=sql&depth=12&grad_c1=141e30&grad_c2=243b55&img_format=gif" \
     -d "SELECT * FROM users WHERE active = 1;" \
     -o screenshot.gif

# Base64 data-URL (returned as plain text)
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=typescript&img_format=base64" \
     --data-binary "@index.ts"

# 2× scale, 16:9 aspect ratio, PNG
curl -X POST "https://codeshot-u1ol.onrender.com/?lang=python&theme=dracula&scale=2&aspect_ratio=16:9&img_format=png" \
     -d "print('hello world')" \
     -o screenshot_2x_16x9.png
```

---

## All Parameters

### Content

| Param | Type | Default | Description |
|---|---|---|---|
| `mode` | string | `code` | `code` — syntax-highlighted · `text` — plain text |
| `lang` | string | `javascript` | Syntax language (see list below) |

### Typography

| Param | Type | Default | Description |
|---|---|---|---|
| `font` | string | `JetBrains_Mono` | Code font. Underscores become spaces (`Ubuntu_Mono` → `Ubuntu Mono`). See **Supported Fonts** below |
| `size` | number | `14` | Font size in px |
| `line_height` | number | `1.6` | Line-height multiplier |
| `ligatures` | bool | `true` | Enable font ligatures (disable to force character-by-character rendering, preventing ligature substitution) |
| `letter_spacing` | number | `0` | Letter spacing in px — negative tightens, positive loosens |
| `tab_size` | number | `4` | Tab width in spaces (1–10) |

### Theme & Colors

| Param | Type | Default | Values |
|---|---|---|---|
| `theme` | string | `one-dark` | **Light:** `github-light` `one-light` `solarized-light` `vs-light` `gruvbox-light` `rose-pine-dawn` `quiet-light` · **Dark:** `one-dark` `monokai` `dracula` `nord` `tokyo-night` `github-dark` `solarized` `material` `synthwave` `night-owl` `catppuccin` `ayu-dark` `gruvbox-dark` · **Custom:** `custom` (uses the built-in Custom defaults; per-user color edits made in the browser UI are stored in `localStorage` and **not** available to the API) |

> **Note:** The API does not support per-user custom theme color overrides. The `custom` theme value renders with the built-in default Custom colors. To use fully custom colors via the API, use the individual `text_color` / `text_bg` parameters available in `mode=text`.

### Background

| Param | Type | Default | Description |
|---|---|---|---|
| `bg` | string | `gradient` | `gradient` · `solid` · `none` (transparent PNG) |
| `bg_color` | hex | `1a1b2e` | Solid color — no `#` (used when `bg=solid`) |
| `grad_c1` | hex | `0f0c29` | Gradient start color |
| `grad_c2` | hex | `302b63` | Gradient end color |
| `grad_angle` | number | `135` | Gradient angle in degrees |

### Layout

| Param | Type | Default | Description |
|---|---|---|---|
| `outer_pad` | number | `56` | Outer padding — gap between window and image edge |
| `inner_pad` | number | `40` | Inner padding — gap between code and window edge |
| `radius` | number | `14` | Window corner radius in px |

### Window Chrome

| Param | Type | Default | Values |
|---|---|---|---|
| `chrome` | string | `macos` | `macos` `windows` `gnome` `none` |
| `title` | string | `code` | Text shown in the title bar |

### Shadow

| Param | Type | Default | Description |
|---|---|---|---|
| `shadow` | bool | `true` | Show drop shadow |
| `shadow_blur` | number | `30` | Shadow blur radius in px |

### Line Numbers

| Param | Type | Default | Description |
|---|---|---|---|
| `line_numbers` | bool | `false` | Show line numbers |
| `first_line` | number | `1` | Number of the first line |
| `line_num_color` | hex | *(auto)* | Line-number color override (no `#`) |

### 3-D Transforms

| Param | Type | Default | Description |
|---|---|---|---|
| `tilt` | number | `0` | Z-axis tilt in degrees (−45 to 45) |
| `depth` | number | `0` | X-axis perspective rotation — top/bottom lean |
| `depth_y` | number | `0` | Y-axis perspective rotation — left/right lean |

### Trapezoid Distortion

| Param | Type | Default | Description |
|---|---|---|---|
| `trap_left` | number | `100` | Left-edge height % — 100 = straight |
| `trap_right` | number | `100` | Right-edge height % |
| `trap_top` | number | `100` | Top-edge width % |
| `trap_bottom` | number | `100` | Bottom-edge width % |

### Window Position

| Param | Type | Default | Description |
|---|---|---|---|
| `offset_x` | number | `0` | Horizontal offset as % of window width |
| `offset_y` | number | `0` | Vertical offset as % of window height |

### Filters

| Param | Type | Default | Description |
|---|---|---|---|
| `filter` | string | `none` | `none` `bw` `sepia` `cool` `warm` `faded` `vivid` `cinematic` `noir` `amber` `mint` `dusk` `retro` `neon` `lofi` `bleach` `ice` `overexposed` `darkroom` `dreamy` |
| `filter_intensity` | number | `100` | Filter strength 0–100 % |

### Textures

| Param | Type | Default | Description |
|---|---|---|---|
| `texture` | string | `none` | `none` `paper` `grain` `linen` `wood` `metal-shiny` `metal-brushed` `carbon` `scanlines` `glitter` `noise` `dots` `grid` `diagonal` `crosshatch` `hex` `concrete` `denim` `vignette` `frosted` |
| `texture_intensity` | number | `50` | Texture opacity 0–100 % |

### Text Style

| Param | Type | Default | Description |
|---|---|---|---|
| `text_style` | string | `none` | `none` `drop-shadow` `corner-glow` `outline` `glow` `recessed` `embossed` `long-shadow` `letterpress` `retro-shadow` `gradient-fill` `rainbow` `inner-glow` `double-outline` `fire` `metallic` `ice` `gold` `glitch` `neon-sign` `hollow` |
| `text_style_color1` | hex | `89b4fa` | Primary style color (shadow, outline, glow, etc.) — no `#` |
| `text_style_color2` | hex | `cba6f7` | Secondary style color (gradient-fill, double-outline, glitch) — no `#` |
| `text_style_intensity` | number | `50` | Style effect intensity 0–100 % |

### Zoom & Opacity

| Param | Type | Default | Description |
|---|---|---|---|
| `zoom` | number | `100` | Code-block zoom 10–300 % (background unchanged) |
| `window_opacity` | number | `100` | Window opacity 0–100 % |

### Gradient Blur

| Param | Type | Default | Description |
|---|---|---|---|
| `grad_blur` | bool | `false` | Apply directional blur gradient over the code |
| `grad_blur_dir` | string | `bottom` | `top` `bottom` `left` `right` |
| `grad_blur_amount` | number | `20` | Maximum blur radius in px |
| `grad_blur_start` | number | `30` | Point (%) at which blurring starts |

### Plain-text Mode (`mode=text`)

| Param | Type | Default | Description |
|---|---|---|---|
| `text_color` | hex | `e0e0e0` | Text color (no `#`) |
| `text_bg` | hex | `1e1e2e` | Background color (no `#`) |
| `plain_font` | string | `Arial` | Font family |
| `text_align` | string | `left` | `left` `center` `right` `justify` |

### Markdown Mode (`mode=markdown`)

| Param | Type | Default | Description |
|---|---|---|---|
| `md_heading_color` | hex | `e2c08d` | Heading color (no `#`) |
| `md_link_color` | hex | `61afef` | Link color (no `#`) |

### Screen Glare

| Param | Type | Default | Description |
|---|---|---|---|
| `glare` | bool | `false` | Enable screen glare overlay |
| `glare_x` | number | `50` | Glare center X as % of canvas width — can go from −50 to 150 (outside canvas) |
| `glare_y` | number | `50` | Glare center Y as % of canvas height — can go from −50 to 150 |
| `glare_distance` | number | `200` | Distance of light source from screen. Smaller = larger, softer glare (range 10–500) |
| `glare_angle_h` | number | `0` | Horizontal tilt of the light source in degrees. 0 = perpendicular (circle); positive = light tilts right, elongating the glare horizontally (−75 to 75) |
| `glare_angle_v` | number | `0` | Vertical tilt of the light source in degrees. 0 = perpendicular (circle); positive = light tilts down, elongating the glare vertically (−75 to 75) |
| `glare_blur` | number | `30` | Blur radius applied to the glare in px (0–100) |
| `glare_intensity` | number | `60` | Glare brightness 0–100 % |
| `glare_color` | hex | `ffffff` | Glare color (no `#`) |

### Lens Distortion

| Param | Type | Default | Description |
|---|---|---|---|
| `lens` | number | `0` | Lens distortion intensity. Positive = convex/barrel (center magnified), negative = concave/pincushion (transparent corners), 0 = flat. Range −100 to 100. |

### Export Size

| Param | Type | Default | Description |
|---|---|---|---|
| `scale` | number | `1` | Output scale multiplier — all pixel dimensions are multiplied. `1` `2` `3` `4` |
| `aspect_ratio` | string | `custom` | Lock the output canvas to a fixed aspect ratio by padding the background. `custom` (no padding) · `16:9` · `3:2` · `4:3` · `5:4` · `1:1` · `4:5` · `3:4` · `2:3` · `9:16` |

### Randomize

| Param | Type | Default | Description |
|---|---|---|---|
| `random` | bool | `false` | Randomize all visual parameters. Only `img_format` and `watermark` are taken from the query string; everything else (theme, background, font, layout, effects, …) is chosen randomly. |

### Output

| Param | Type | Default | Description |
|---|---|---|---|
| `watermark` | bool | `false` | Overlay the CodeShot watermark |
| `img_format` | string | `png` | `png` `jpg` `webp` `gif` `tiff` `base64` |
| `jpg_quality` | number | `92` | JPG compression quality 1–100. Only used when `img_format=jpg` |

---

## Supported Fonts

`Anonymous Pro` `Courier New` `Cousine` `DM Mono` `Fira Code` `IBM Plex Mono` `Inconsolata` `JetBrains Mono` `Noto Sans Mono` `Overpass Mono` `Roboto Mono` `Source Code Pro` `Space Mono` `monospace` `Ubuntu Mono`

---

## Supported Languages

`bash` `c` `cpp` `csharp` `css` `dart` `dockerfile` `elixir` `erlang` `fsharp` `go` `graphql` `groovy` `haskell` `html` `ini` `java` `javascript` `json` `jsx` `kotlin` `lisp` `lua` `makefile` `markdown` `matlab` `nginx` `objectivec` `pascal` `perl` `php` `plaintext` `powershell` `python` `r` `ruby` `rust` `scala` `scss` `shell` `sql` `swift` `tex` `toml` `tsx` `typescript` `vbnet` `vim` `xml` `yaml` `1c`

---

## API Info Endpoint

`GET /api/info` — returns the full parameter reference as JSON.

---

## License

[MIT](https://github.com/Mansiper/CodeShot/blob/master/LICENSE)
