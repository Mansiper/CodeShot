/* ════════════════════════════════════════════
   RANDOMIZE
════════════════════════════════════════════ */

function randomizeParams() {
  const pick  = arr => arr[Math.floor(Math.random() * arr.length)];
  const rnd   = (min, max, step = 1) => {
    const steps = Math.floor((max - min) / step);
    return min + Math.floor(Math.random() * (steps + 1)) * step;
  };
  const rndF  = (min, max, decimals = 1) => {
    const v = min + Math.random() * (max - min);
    return parseFloat(v.toFixed(decimals));
  };

  // Theme
  state.theme = pick(Object.keys(THEMES));

  // Background
  const bgPreset = pick(GRADIENT_PRESETS);
  state.bgType   = Math.random() < 0.15 ? 'solid' : 'gradient';
  state.bgSolid  = rgbHex(rnd(0, 40), rnd(0, 40), rnd(0, 80));
  state.gradC1   = bgPreset[0];
  state.gradC2   = bgPreset[1];
  state.gradAngle = bgPreset[2];

  // Font
  const codeFonts = ['Courier New','DM Mono','Fira Code','Inconsolata','JetBrains Mono',
    'Roboto Mono','Source Code Pro','Space Mono','monospace','Ubuntu Mono'];
  state.font        = pick(codeFonts);
  state.fontSize    = rnd(11, 18);
  state.lineHeight  = rndF(1.4, 2.0, 1);
  state.ligatures   = Math.random() > 0.3;
  state.letterSpacing = 0;

  // Layout
  state.outerPadding  = rnd(24, 100, 4);
  state.innerPadding  = rnd(16, 60, 2);
  state.cornerRadius  = rnd(0, 28, 2);

  // Chrome
  state.chromeStyle = pick(CHROME_STYLES.map(c => c.id));

  // Shadow
  state.showShadow = Math.random() > 0.2;
  state.shadowBlur = rnd(10, 60, 2);

  // Window opacity (usually full)
  state.windowOpacity = Math.random() > 0.8 ? rnd(60, 95, 5) : 100;

  // Filter
  state.filter          = pick(FILTERS.map(f => f.id));
  state.filterIntensity = rnd(50, 100);

  // Texture
  if (Math.random() < 0.5) {
    state.texture          = pick(TEXTURES.filter(t => t.id !== 'none').map(t => t.id));
    state.textureIntensity = rnd(20, 70);
  } else {
    state.texture = 'none';
  }

  // Text style (20 % chance)
  if (Math.random() < 0.2) {
    const pick2 = arr => arr[Math.floor(Math.random() * arr.length)];
    const tsChoices = TEXT_STYLES.filter(s => s.id !== 'none');
    const ts = pick2(tsChoices);
    state.textStyle          = ts.id;
    state.textStyleIntensity = rnd(30, 80);
  } else {
    state.textStyle = 'none';
  }

  // Glare
  if (Math.random() < 0.3) {
    state.glareEnabled  = true;
    state.glareX        = rnd(20, 80);
    state.glareY        = rnd(10, 60);
    state.glareDistance = rnd(100, 400, 10);
    state.glareIntensity = rnd(30, 70);
    state.glareBlur     = rnd(10, 50);
    state.glareAngleH   = rnd(-30, 30);
    state.glareAngleV   = rnd(-30, 30);
    state.glareColor    = '#ffffff';
  } else {
    state.glareEnabled = false;
  }

  // Optional subtle 3D tilt
  if (Math.random() < 0.2) {
    state.tiltAngle   = rnd(-15, 15);
    state.depthAngle  = rnd(-15, 15);
    state.depthAngleY = rnd(-15, 15);
  } else {
    state.tiltAngle = 0; state.depthAngle = 0; state.depthAngleY = 0;
  }

  // Aspect ratio (mostly custom)
  state.aspectRatio = pick(['custom','custom','custom','16:9','4:3','1:1']);

  // Reset params not randomized
  state.zoom         = 100;
  state.trapLeft     = 100; state.trapRight  = 100;
  state.trapTop      = 100; state.trapBottom = 100;
  state.gradBlur     = false;
  state.lensAmount   = 0;
  state.windowOffsetX = 0; state.windowOffsetY = 0;
  state.scaleMultiplier = 1;

  tokCache = null;
  syncUI();
  scheduleRender();
  scheduleSave();
}
