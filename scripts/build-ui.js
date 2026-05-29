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

  // Themes — sectioned dropdown panel
  const tg = document.getElementById('theme-grid');
  ['Light', 'Dark', 'Custom'].forEach(group => {
    const lbl = document.createElement('div');
    lbl.className = 'cs-section-label'; lbl.textContent = group;
    tg.appendChild(lbl);
    const grid = document.createElement('div');
    grid.className = 'theme-grid'; tg.appendChild(grid);
    for (const [k, t] of Object.entries(THEMES)) {
      const isLight = LIGHT_THEME_KEYS.includes(k);
      const isCustom = k === 'custom';
      if (group === 'Light' && !isLight) continue;
      if (group === 'Dark' && (isLight || isCustom)) continue;
      if (group === 'Custom' && !isCustom) continue;
      const b = document.createElement('button');
      b.className = 'theme-btn'; b.dataset.theme = k;
      b.innerHTML = `<div class="theme-swatches">
        <div class="theme-dot" style="background:${t.bg};border:1px solid rgba(128,128,128,.2)"></div>
        <div class="theme-dot" style="background:${t.keyword}"></div>
        <div class="theme-dot" style="background:${t.string}"></div>
        <div class="theme-dot" style="background:${t.function}"></div>
      </div><div class="theme-name">${t.name}</div>`;
      grid.appendChild(b);
    }
  });

  // Theme editor
  const teEditor = document.getElementById('theme-editor');
  const teTitle = document.createElement('div');
  teTitle.className = 'te-title'; teTitle.id = 'te-title';
  teEditor.appendChild(teTitle);
  const teColors = document.createElement('div');
  teColors.className = 'te-colors'; teColors.id = 'te-colors';
  for (const {key, label} of THEME_COLOR_PROPS) {
    const row = document.createElement('div');
    row.className = 'te-row';
    const inp = document.createElement('input');
    inp.type = 'color'; inp.id = `te-${key}`;
    const lbl = document.createElement('span');
    lbl.className = 'te-label'; lbl.textContent = label;
    row.appendChild(inp); row.appendChild(lbl);
    teColors.appendChild(row);
  }
  teEditor.appendChild(teColors);
  const teActions = document.createElement('div');
  teActions.className = 'te-actions';
  teActions.innerHTML = `
    <button class="btn btn-primary" id="theme-editor-save" style="flex:1;justify-content:center;font-size:10px">Save</button>
    <button class="btn" id="theme-editor-cancel" style="flex:1;justify-content:center;font-size:10px">Cancel</button>
    <button class="btn" id="theme-editor-reset" style="flex-shrink:0;font-size:10px">Reset</button>
  `;
  teEditor.appendChild(teActions);

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

  // Text Styles
  const tsg = document.getElementById('text-style-grid');
  for (const s of TEXT_STYLES) {
    const b = document.createElement('button');
    b.className = 'filter-btn text-style-btn'; b.dataset.style = s.id;
    b.innerHTML = `<div class="filter-name" style="padding:4px 0;font-size:10.5px">${s.name}</div>`;
    tsg.appendChild(b);
  }

  // Border Styles
  const bsg = document.getElementById('border-style-grid');
  for (const s of BORDER_STYLES) {
    const b = document.createElement('button');
    b.className = 'filter-btn border-style-btn'; b.dataset.borderStyle = s.id;
    b.innerHTML = `<div class="filter-name" style="padding:4px 0;font-size:10.5px">${s.name}</div>`;
    bsg.appendChild(b);
  }

  // Plain text fonts
  const pfs = document.getElementById('plain-font-select');
  PLAIN_FONTS.forEach(f => {
    const o = document.createElement('option');
    o.value = f; o.textContent = f; o.style.fontFamily = f;
    pfs.appendChild(o);
  });
}
