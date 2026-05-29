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
  setSwitch('ligatures-switch', state.ligatures);
  setRange('letter-spacing', state.letterSpacing, 'letter-spacing-val', v => v + 'px');
  setRange('tab-size', state.tabSize, 'tab-size-val', v => String(v));
  document.getElementById('code-input').style.tabSize = state.tabSize;

  // Theme
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme===state.theme));
  // Update theme trigger button
  const activeTheme = THEMES[state.theme];
  if (activeTheme) {
    document.getElementById('theme-trigger-swatches').innerHTML =
      `<div class="theme-dot" style="background:${activeTheme.bg};border:1px solid rgba(128,128,128,.2)"></div>`+
      `<div class="theme-dot" style="background:${activeTheme.keyword}"></div>`+
      `<div class="theme-dot" style="background:${activeTheme.string}"></div>`+
      `<div class="theme-dot" style="background:${activeTheme.function}"></div>`;
    document.getElementById('theme-trigger-name').textContent = activeTheme.name;
  }
  const isText = state.inputMode === 'text';
  const isMd   = state.inputMode === 'markdown';
  document.querySelectorAll('#input-mode-group .toggle-btn')
    .forEach(b => b.classList.toggle('active', b.dataset.val === state.inputMode));
  document.getElementById('lang-wrap').style.display        = (isText || isMd) ? 'none' : '';
  document.getElementById('ligatures-wrap').style.display   = isText ? 'none' : '';
  document.getElementById('tab-size-wrap').style.display    = isText ? 'none' : '';
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

  // Border
  document.getElementById('border-style-trigger-name').textContent =
    (BORDER_STYLES.find(s => s.id === state.borderStyle) || BORDER_STYLES[0]).name;
  document.querySelectorAll('.border-style-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.borderStyle === state.borderStyle));
  const hasBorder = state.borderStyle !== 'none';
  document.getElementById('border-sub').style.display = hasBorder ? '' : 'none';
  setRange('border-width', state.borderWidth, 'border-width-val', v => v + 'px');
  document.getElementById('border-color').value = state.borderColor;

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
  document.querySelectorAll('#filter-grid .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === state.filter));
  setRange('filter-intensity', state.filterIntensity, 'filter-intensity-val', v => v + '%');
  document.getElementById('filter-intensity-wrap').style.opacity = state.filter === 'none' ? '0.35' : '1';
  // Update filter trigger button
  const activeFilter = FILTERS.find(f => f.id === state.filter);
  if (activeFilter) {
    document.getElementById('filter-trigger-preview').style.background = activeFilter.preview;
    document.getElementById('filter-trigger-name').textContent = activeFilter.name;
  }

  // Textures
  document.querySelectorAll('.texture-btn').forEach(b => b.classList.toggle('active', b.dataset.texture === state.texture));
  setRange('texture-intensity', state.textureIntensity, 'texture-intensity-val', v => v + '%');
  document.getElementById('texture-intensity-wrap').style.opacity = state.texture === 'none' ? '0.35' : '1';
  // Update texture trigger button
  const activeTex = TEXTURES.find(t => t.id === state.texture);
  if (activeTex) {
    document.getElementById('texture-trigger-preview').style.background = activeTex.preview;
    document.getElementById('texture-trigger-name').textContent = activeTex.name;
  }

  // Text Style
  document.querySelectorAll('.text-style-btn').forEach(b => b.classList.toggle('active', b.dataset.style === state.textStyle));
  const activeTS   = TEXT_STYLES.find(s => s.id === state.textStyle) || TEXT_STYLES[0];
  document.getElementById('text-style-trigger-name').textContent = activeTS.name;
  document.getElementById('text-style-color1-wrap').style.display    = activeTS.hasColor1 ? '' : 'none';
  document.getElementById('text-style-color2-wrap').style.display    = activeTS.hasColor2 ? '' : 'none';
  document.getElementById('text-style-intensity-wrap').style.display = activeTS.hasIntensity ? '' : 'none';
  document.getElementById('text-style-color1').value = state.textStyleColor1;
  document.getElementById('text-style-color2').value = state.textStyleColor2;
  setRange('text-style-intensity', state.textStyleIntensity, 'text-style-intensity-val', v => v + '%');

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

  // Export Size
  document.querySelectorAll('#scale-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val === String(state.scaleMultiplier)));
  document.querySelectorAll('#aspect-ratio-group .toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.val === state.aspectRatio));

  // Watermark
  setSwitch('watermark-switch', showWatermark);

  // Lens
  setRange('lens-amount', state.lensAmount, 'lens-amount-val', v => { const n = Math.round(v); return n > 0 ? '+' + n : String(n); });

  applyEditorTheme();
  updateEditorHighlight();
}

function setRange(id, val, labelId, fmt) {
  const el = document.getElementById(id); if (!el) return;
  el.value = val;
  if (labelId) document.getElementById(labelId).textContent = fmt(val);
}
