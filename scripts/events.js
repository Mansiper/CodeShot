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
  document.getElementById('code-input').addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.target;
    const { selectionStart: ss, selectionEnd: se, value } = el;
    const indent = ' '.repeat(state.tabSize);
    if (!e.shiftKey) {
      // Insert spaces at cursor / replace selection
      el.value = value.slice(0, ss) + indent + value.slice(se);
      el.selectionStart = el.selectionEnd = ss + state.tabSize;
    } else {
      // Shift+Tab: remove up to tabSize spaces (or one \t) from each line in the selection
      const lineStart = value.lastIndexOf('\n', ss - 1) + 1;
      const lines = value.slice(lineStart, se).split('\n');
      const dedented = lines.map(l => {
        if (l.startsWith('\t')) return l.slice(1);
        let i = 0;
        while (i < state.tabSize && l[i] === ' ') i++;
        return l.slice(i);
      });
      const removed = lines.join('\n').length - dedented.join('\n').length;
      el.value = value.slice(0, lineStart) + dedented.join('\n') + value.slice(se);
      const firstRemoved = lines[0].length - dedented[0].length;
      el.selectionStart = Math.max(lineStart, ss - firstRemoved);
      el.selectionEnd = se - removed;
    }
    // Trigger the input handler so highlight + state update
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });

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
  bindR('letter-spacing','letterSpacing','letter-spacing-val',v=>v+'px');
  bindR('tab-size','tabSize','tab-size-val',v=>String(v));
  document.getElementById('tab-size').addEventListener('input', e => {
    document.getElementById('code-input').style.tabSize = parseFloat(e.target.value);
  });
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
  bindR('lens-amount', 'lensAmount', 'lens-amount-val', v => { const n = Math.round(v); return n > 0 ? '+' + n : String(n); });

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
    document.getElementById('theme-dropdown').classList.remove('open');
    // Refresh editor if it's open
    const teEl = document.getElementById('theme-editor');
    if (teEl && teEl.style.display !== 'none') {
      const t = THEMES[state.theme];
      document.getElementById('te-title').textContent = `Editing: ${t.name}`;
      for (const {key: prop} of THEME_COLOR_PROPS) {
        const inp = document.getElementById(`te-${prop}`);
        if (inp) inp.value = t[prop] || '#000000';
      }
    }
  });

  // Theme editor — open/close
  document.getElementById('theme-edit-btn').addEventListener('click', () => {
    const teEl = document.getElementById('theme-editor');
    if (teEl.style.display !== 'none') {
      teEl.style.display = 'none';
      return;
    }
    const t = THEMES[state.theme];
    document.getElementById('te-title').textContent = `Editing: ${t.name}`;
    for (const {key: prop} of THEME_COLOR_PROPS) {
      const inp = document.getElementById(`te-${prop}`);
      if (inp) inp.value = t[prop] || '#000000';
    }
    teEl.style.display = '';
  });

  // Theme editor — save
  document.getElementById('theme-editor-save').addEventListener('click', () => {
    const themeKey = state.theme;
    const overrides = {};
    for (const {key: prop} of THEME_COLOR_PROPS) {
      const inp = document.getElementById(`te-${prop}`);
      if (inp) overrides[prop] = inp.value;
    }
    themeOverrides[themeKey] = overrides;
    Object.assign(THEMES[themeKey], overrides);
    saveThemeOverrides();
    tokCache = null;
    syncUI();
    applyEditorTheme();
    updateEditorHighlight();
    scheduleRender();
  });

  // Theme editor — cancel
  document.getElementById('theme-editor-cancel').addEventListener('click', () => {
    document.getElementById('theme-editor').style.display = 'none';
  });

  // Theme editor — reset
  document.getElementById('theme-editor-reset').addEventListener('click', () => {
    const themeKey = state.theme;
    Object.assign(THEMES[themeKey], THEMES_ORIG[themeKey]);
    delete themeOverrides[themeKey];
    saveThemeOverrides();
    const t = THEMES[themeKey];
    document.getElementById('te-title').textContent = `Editing: ${t.name}`;
    for (const {key: prop} of THEME_COLOR_PROPS) {
      const inp = document.getElementById(`te-${prop}`);
      if (inp) inp.value = t[prop] || '#000000';
    }
    tokCache = null;
    syncUI();
    scheduleRender();
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
    document.getElementById('filter-dropdown').classList.remove('open');
  });
  bindR('filter-intensity', 'filterIntensity', 'filter-intensity-val', v => v + '%');

  // Textures
  document.getElementById('texture-grid').addEventListener('click', e => {
    const b = e.target.closest('.texture-btn'); if (!b) return;
    change('texture', b.dataset.texture); syncUI();
    document.getElementById('texture-dropdown').classList.remove('open');
  });
  bindR('texture-intensity', 'textureIntensity', 'texture-intensity-val', v => v + '%');

  // Text Style
  document.getElementById('text-style-grid').addEventListener('click', e => {
    const b = e.target.closest('.text-style-btn'); if (!b) return;
    change('textStyle', b.dataset.style); syncUI();
    document.getElementById('text-style-dropdown').classList.remove('open');
  });
  document.getElementById('text-style-color1').addEventListener('input', e => change('textStyleColor1', e.target.value));
  document.getElementById('text-style-color2').addEventListener('input', e => change('textStyleColor2', e.target.value));
  bindR('text-style-intensity', 'textStyleIntensity', 'text-style-intensity-val', v => v + '%');

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
  bindSwitch('ligatures-switch','ligatures');

  // Border
  document.getElementById('border-style-grid').addEventListener('click', e => {
    const b = e.target.closest('.border-style-btn'); if (!b) return;
    change('borderStyle', b.dataset.borderStyle); syncUI();
    document.getElementById('border-style-dropdown').classList.remove('open');
  });
  document.getElementById('border-width').addEventListener('input', e => {
    const v = parseInt(e.target.value);
    document.getElementById('border-width-val').textContent = v + 'px';
    change('borderWidth', v);
  });
  document.getElementById('border-color').addEventListener('input', e => change('borderColor', e.target.value));
  document.getElementById('watermark-switch').addEventListener('click', () => {
    showWatermark = !showWatermark;
    setSwitch('watermark-switch', showWatermark);
    scheduleRender();
  });

  // Scale multiplier
  document.getElementById('scale-group').addEventListener('click', e => {
    const b = e.target.closest('.toggle-btn'); if (!b) return;
    change('scaleMultiplier', parseInt(b.dataset.val)); syncUI();
  });

  // Aspect ratio
  document.getElementById('aspect-ratio-group').addEventListener('click', e => {
    const b = e.target.closest('.toggle-btn'); if (!b) return;
    change('aspectRatio', b.dataset.val); syncUI();
  });

  // Inputs
  document.getElementById('first-line-number').addEventListener('input', e => {
    change('firstLineNumber', Math.max(0, parseInt(e.target.value) || 0));
  });
  document.getElementById('lineno-color').addEventListener('input', e => change('lineNumberColor', e.target.value));

  // Buttons
  document.getElementById('randomize-btn').addEventListener('click', randomizeParams);
  document.getElementById('export-btn').addEventListener('click', () => exportAs('png'));
  document.getElementById('copy-btn').addEventListener('click', () => copyAs('png'));

  // JPG quality modal
  const jpgOverlay  = document.getElementById('jpg-quality-overlay');
  const jpgSlider   = document.getElementById('jpg-quality-slider');
  const jpgValLabel = document.getElementById('jpg-quality-val');
  function openJpgModal(onConfirm) {
    jpgOverlay.classList.add('open');
    jpgOverlay._onConfirm = onConfirm;
  }
  function closeJpgModal() { jpgOverlay.classList.remove('open'); }
  jpgSlider.addEventListener('input', () => { jpgValLabel.textContent = jpgSlider.value + '%'; });
  document.getElementById('jpg-quality-export').addEventListener('click', () => {
    exportAs._jpgQuality = parseInt(jpgSlider.value, 10);
    closeJpgModal();
    if (jpgOverlay._onConfirm) jpgOverlay._onConfirm();
  });
  document.getElementById('jpg-quality-cancel').addEventListener('click', closeJpgModal);
  jpgOverlay.addEventListener('click', e => { if (e.target === jpgOverlay) closeJpgModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeJpgModal(); });
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
  document.getElementById('reset-lens').addEventListener('click', () => {
    state.lensAmount = 0;
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
        if (id === 'export') {
          if (fmt === 'jpg') {
            openJpgModal(() => exportAs('jpg'));
          } else {
            exportAs(fmt);
          }
        } else {
          copyAs(fmt);
        }
      });
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.btn-dropdown.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.cs-dropdown.open').forEach(d => d.classList.remove('open'));
  });

  // Custom dropdown triggers (theme, filter, texture, text-style, border-style)
  ['theme', 'filter', 'texture', 'text-style', 'border-style'].forEach(id => {
    const dropdown = document.getElementById(`${id}-dropdown`);
    const trigger  = document.getElementById(`${id}-trigger`);
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.cs-dropdown.open').forEach(d => d.classList.remove('open'));
      if (!isOpen) dropdown.classList.add('open');
    });
    // Arrow key cycling (left/right or up/down)
    trigger.addEventListener('keydown', e => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      const delta = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      if (id === 'theme') {
        const keys = Object.keys(THEMES);
        const next = keys[(keys.indexOf(state.theme) + delta + keys.length) % keys.length];
        tokCache = null; change('theme', next); syncUI();
      } else if (id === 'filter') {
        const ids = FILTERS.map(f => f.id);
        const next = ids[(ids.indexOf(state.filter) + delta + ids.length) % ids.length];
        change('filter', next); syncUI();
      } else if (id === 'texture') {
        const ids = TEXTURES.map(t => t.id);
        const next = ids[(ids.indexOf(state.texture) + delta + ids.length) % ids.length];
        change('texture', next); syncUI();
      } else if (id === 'border-style') {
        const ids = BORDER_STYLES.map(s => s.id);
        const next = ids[(ids.indexOf(state.borderStyle) + delta + ids.length) % ids.length];
        change('borderStyle', next); syncUI();
      } else {
        const ids = TEXT_STYLES.map(s => s.id);
        const next = ids[(ids.indexOf(state.textStyle) + delta + ids.length) % ids.length];
        change('textStyle', next); syncUI();
      }
    });
    // Prevent clicks inside the panel from closing the dropdown
    dropdown.querySelector('.cs-dropdown-panel').addEventListener('click', e => e.stopPropagation());
  });

  // Preview wrap resize observer
  const ro = new ResizeObserver(() => scaleCanvasDisplay());
  ro.observe(document.getElementById('preview-wrap'));
  window.addEventListener('resize', scaleCanvasDisplay);
}
