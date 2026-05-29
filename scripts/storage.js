/* ════════════════════════════════════════════
   STORAGE
════════════════════════════════════════════ */

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  }, SAVE_DELAY);
}

function saveThemeOverrides() {
  try { localStorage.setItem(THEME_OVERRIDES_KEY, JSON.stringify(themeOverrides)); } catch(e) {}
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
  try {
    const raw = localStorage.getItem(THEME_OVERRIDES_KEY);
    if (raw) {
      themeOverrides = JSON.parse(raw);
      for (const [k, overrides] of Object.entries(themeOverrides)) {
        if (THEMES[k]) Object.assign(THEMES[k], overrides);
      }
    }
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
