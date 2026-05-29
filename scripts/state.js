/* ════════════════════════════════════════════
   STATE
════════════════════════════════════════════ */

const DEFAULTS = {
  code:`// Beautiful code screenshots in seconds\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconst results = Array.from(\n  { length: 10 },\n  (_, i) => fibonacci(i)\n);\n\nconsole.log('Sequence:', results.join(', '));`,
  language:'javascript', font:'JetBrains Mono', fontSize:14, lineHeight:1.6,
  theme:'one-dark',
  bgType:'gradient', bgSolid:'#1a1b2e', gradC1:'#0f0c29', gradC2:'#302b63', gradAngle:135,
  outerPadding:56, innerPadding:40, cornerRadius:14,
  chromeStyle:'macos', windowTitle: 'code',
  showLineNumbers:false, firstLineNumber:1, lineNumberColor:'',
  showShadow:true, shadowBlur:30,
  tiltAngle:0, depthAngle:0, depthAngleY:0,
  windowOffsetX: 0, windowOffsetY: 0,
  trapLeft:100, trapRight:100, trapTop:100, trapBottom:100,
  gradBlur:false, gradBlurDir:'bottom', gradBlurAmount:20, gradBlurStart:30,
  filter: 'none',
  filterIntensity: 100,
  inputMode: 'code',
  plainTextColor: '#e0e0e0',
  plainTextBg: '#1e1e2e',
  plainFont: 'Arial',
  mdHeadingColor: '#e2c08d',
  mdLinkColor: '#61afef',
  selectionColor: '#6490ff',
  selectionOpacity: 25,
  zoom: 100,
  windowOpacity: 100,
  plainTextAlign: 'left',
  texture: 'none',
  textureIntensity: 50,
  textStyle: 'none',
  textStyleColor1: '#89b4fa',
  textStyleColor2: '#cba6f7',
  textStyleIntensity: 50,
  glareEnabled: false,
  glareX: 50,
  glareY: 50,
  glareDistance: 200,
  glareAngleH: 0,
  glareAngleV: 0,
  glareBlur: 30,
  glareIntensity: 60,
  glareColor: '#ffffff',
  lensAmount: 0,
  ligatures: true,
  letterSpacing: 0,
  tabSize: 4,
  scaleMultiplier: 1,
  aspectRatio: 'custom',
  borderStyle: 'none',
  borderWidth: 2,
  borderColor: '#ffffff',
};

let state = { ...DEFAULTS };
let splitRatio = 0.5;
let saveTimer = null;
let tokCache = null;
let selectionRange = null;
let showWatermark = true;
