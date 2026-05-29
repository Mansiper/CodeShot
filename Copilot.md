# Copliot.md

## Project short description
CodeShot is a browser-first code screenshot generator with many visual controls (themes, layout, effects, textures, borders, markdown/plain-text modes) and export formats. The web UI lives in the repository root and scripts folder, and the NodeJS folder provides an HTTP API that drives the same renderer through Puppeteer.

## Core maintenance rules
1. Keep one source of truth for each property across UI state, render pipeline, export query, and API parsing.
2. For parameter/property changes, update documentation and runtime behavior in the same task. Do not split those updates.
3. New properties must match existing naming style:
- UI state keys: camelCase (example: textStyleIntensity).
- API query params: snake_case (example: text_style_intensity).
- Defaults grouped in scripts/state.js.
4. Any new property should be implemented like a similar existing property (same data flow pattern, validation style, UI sync pattern, and export/API mapping style).
5. Keep backward compatibility in scripts/storage.js when renaming or replacing persisted keys.
6. Keep script load order stable in index.html unless a dependency requires a reorder.
7. Avoid silent partial support: if a property is user-visible, ensure UI, rendering, export, API, and docs are all updated.

## Mandatory files for any parameter/property change
When changing any visual parameter, API parameter, or saved property, always review and update these files:
1. README.md
2. NodeJS/README.md
3. index.html
4. NodeJS/server.js
5. scripts/state.js
6. scripts/ui-sync.js
7. scripts/events.js
8. scripts/export.js
9. scripts/storage.js
10. scripts/constants.js

Also always check these files for behavioral drift:
1. scripts/randomize.js
2. scripts/markdown.js
3. scripts/token-parsing.js

Note: Request text may mention input.html. In this project, the correct file is index.html.

## Property change checklist
1. Add default in scripts/state.js DEFAULTS.
2. Add/adjust UI controls in index.html and scripts/build-ui.js when needed.
3. Bind events in scripts/events.js and reflect state in scripts/ui-sync.js.
4. Apply rendering logic in the responsible renderer/effect file.
5. Add export query mapping in scripts/export.js.
6. Add API parsing/validation/mapping in NodeJS/server.js:
- buildState()
- buildRandomState() if relevant
- allowed values arrays if enum-based
- GET /api/info documentation block
7. Update localStorage migration in scripts/storage.js for renamed legacy keys.
8. Update randomization behavior in scripts/randomize.js if the property should participate.
9. Update both READMEs (root and NodeJS).
10. Verify cURL generation still matches API contract.

## JS file map and when to change each

### NodeJS
- NodeJS/server.js: API endpoint, param validation, state mapping, Puppeteer render, and API docs. Change for API params, enums, formats, random API flow, or server responses.
- NodeJS/test_script.js: Sample code payload for quick tests/examples. Change only when updating sample content.

### scripts
- scripts/constants.js: Shared option catalogs and app constants. Change for new/removed options, labels, limits, and keys.
- scripts/state.js: Default and live state object. Change for new, renamed, removed, or defaulted properties.
- scripts/color-helpers.js: Color utility helpers. Change only when effects need new color math.
- scripts/token-parsing.js: hljs token parsing and aspect-ratio parsing. Change for token-color mapping or parser rules.
- scripts/chrome-drawing.js: Window chrome drawing. Change for chrome styles or title-bar behavior.
- scripts/code-canvas.js: Token text drawing and text-style effects. Change for text style rendering or text metrics.
- scripts/border-drawing.js: Border style rendering. Change for border styles, width rules, or border shading.
- scripts/gradient-blur.js: Directional blur effect. Change for blur algorithm or blur control behavior.
- scripts/perspective.js: Perspective/trapezoid transform math. Change for geometry transform behavior.
- scripts/image-filters.js: Filter preset mapping to canvas filter strings. Change for filter options or intensity curves.
- scripts/textures.js: Texture overlays. Change for new/updated texture styles.
- scripts/screen-glare.js: Screen glare effect math and draw. Change for glare controls or glare behavior.
- scripts/lens-distortion.js: Lens distortion effect. Change for distortion algorithm or edge handling.
- scripts/markdown.js: Markdown renderer and main render pipeline orchestration. Change for pipeline order, markdown draw logic, zoom/aspect/scale, or watermark flow.
- scripts/render.js: Render placeholder flag file. Change only if scheduler logic is moved here.
- scripts/canvas-scaling.js: Preview canvas fit in UI. Change for viewport scaling behavior.
- scripts/format-encoders.js: TIFF/GIF encoders. Change for encoding logic or format internals.
- scripts/export.js: Export/copy actions and cURL/query generation. Change for export formats or state-to-query mapping.
- scripts/randomize.js: Random value generation for properties. Change when adding/removing randomized properties or ranges.
- scripts/storage.js: localStorage load/save, presets, migrations. Change for state schema or persistence behavior.
- scripts/editor-theme.js: Editor highlight theme CSS. Change for editor token-color behavior.
- scripts/ui-sync.js: State-to-UI control sync. Change for new/changed controls or visibility logic.
- scripts/events.js: UI event bindings to state. Change for new inputs, switches, buttons, or event behavior.
- scripts/build-ui.js: Dynamic option/button UI creation. Change when option groups or dynamic UI blocks change.
- scripts/panel-resize.js: Editor/preview split resize logic. Change for split-layout resize behavior.
- scripts/ui-theme.js: App light/dark UI mode. Change for shell theme-toggle behavior.
- scripts/init.js: App startup sequence. Change when adding startup steps.

## Fast impact matrix for parameter changes
1. Structural/schema parameter (new key, rename, type change): must touch state.js, ui-sync.js, events.js, export.js, storage.js, server.js, both READMEs, index.html.
2. New enum option (theme/filter/texture/style/chrome/language): must touch constants.js, build-ui.js, ui-sync.js, related effect file, server.js allowed values, both READMEs.
3. Render-only math tweak (no new property): usually effect file plus markdown.js pipeline check, randomize.js range check if applicable, and README notes only if user-visible behavior changed.
4. API-only parameter change: server.js, NodeJS/README.md, README.md API mention, export.js cURL mapping if UI should emit it.

## Additional important rules
1. Keep feature names consistent across UI labels, API param docs, and README tables.
2. Use existing clamping/validation patterns (parseNum/parseBool/parseEnum/parseHex/parseFont) in NodeJS/server.js.
3. If adding an enum value, update both UI catalogs and server-side VALID_* arrays in the same commit.
4. If a property affects image output, verify all formats still work (png, jpg, webp, gif, tiff, base64).
5. Preserve existing default behavior when a new parameter is absent.
6. Keep defaults synchronized between scripts/state.js, scripts/export.js baseline comparisons, and NodeJS/server.js fallback values.