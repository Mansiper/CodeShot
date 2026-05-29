/* ════════════════════════════════════════════
   EXPORT
════════════════════════════════════════════ */

const FORMAT_EXT = {png:'png', jpg:'jpg', webp:'webp', gif:'gif', tiff:'tiff', base64:'txt'};
const FORMAT_MIME = {png:'image/png', jpg:'image/jpeg', webp:'image/webp'};

function exportAs(fmt) {
  const canvas = document.getElementById('preview-canvas');
  const ts = Date.now();
  if (fmt === 'png' || fmt === 'jpg') {
    const mime = FORMAT_MIME[fmt];
    const dataURL = fmt === 'jpg'
      ? (() => {
          const tmp = document.createElement('canvas');
          tmp.width = canvas.width; tmp.height = canvas.height;
          const c = tmp.getContext('2d');
          c.fillStyle = '#ffffff'; c.fillRect(0,0,tmp.width,tmp.height);
          c.drawImage(canvas,0,0);
          const q = (exportAs._jpgQuality !== undefined ? exportAs._jpgQuality : 92) / 100;
          return tmp.toDataURL(mime, q);
        })()
      : canvas.toDataURL(mime);
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `codeshot_${ts}.${fmt}`;
    a.click();
  } else if (fmt === 'webp') {
    const dataURL = canvas.toDataURL('image/webp', 0.95);
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `codeshot_${ts}.webp`;
    a.click();
  } else if (fmt === 'base64') {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataURL);
    a.download = `codeshot_${ts}.txt`;
    a.click();
  } else if (fmt === 'tiff') {
    canvasToTiff(canvas, blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `codeshot_${ts}.tiff`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
  } else if (fmt === 'gif') {
    canvasToGif(canvas, blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `codeshot_${ts}.gif`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
  }
}

function buildCurlCommand() {
  const params = [];
  const pushIfChanged = (key, value, defVal) => {
    if (value !== defVal) params.push([key, String(value)]);
  };
  const toHexParam = hex => String(hex || '').replace(/^#/, '').toLowerCase();
  const toFontParam = font => String(font || '').replace(/\s+/g, '_');

  pushIfChanged('mode', state.inputMode, 'code');
  pushIfChanged('lang', state.language, 'javascript');
  pushIfChanged('font', toFontParam(state.font), 'JetBrains_Mono');
  pushIfChanged('size', state.fontSize, 14);
  pushIfChanged('line_height', state.lineHeight, 1.6);
  pushIfChanged('theme', state.theme, 'one-dark');
  pushIfChanged('bg', state.bgType, 'gradient');
  pushIfChanged('bg_color', toHexParam(state.bgSolid), '1a1b2e');
  pushIfChanged('grad_c1', toHexParam(state.gradC1), '0f0c29');
  pushIfChanged('grad_c2', toHexParam(state.gradC2), '302b63');
  pushIfChanged('grad_angle', state.gradAngle, 135);
  pushIfChanged('outer_pad', state.outerPadding, 56);
  pushIfChanged('inner_pad', state.innerPadding, 40);
  pushIfChanged('radius', state.cornerRadius, 14);
  pushIfChanged('chrome', state.chromeStyle, 'macos');
  pushIfChanged('title', state.windowTitle || '', 'code');
  pushIfChanged('shadow', state.showShadow, true);
  pushIfChanged('shadow_blur', state.shadowBlur, 30);
  pushIfChanged('line_numbers', state.showLineNumbers, false);
  pushIfChanged('first_line', state.firstLineNumber, 1);
  pushIfChanged('line_num_color', toHexParam(state.lineNumberColor), '');
  pushIfChanged('tilt', state.tiltAngle, 0);
  pushIfChanged('depth', state.depthAngle, 0);
  pushIfChanged('depth_y', state.depthAngleY, 0);
  pushIfChanged('trap_left', state.trapLeft, 100);
  pushIfChanged('trap_right', state.trapRight, 100);
  pushIfChanged('trap_top', state.trapTop, 100);
  pushIfChanged('trap_bottom', state.trapBottom, 100);
  pushIfChanged('offset_x', state.windowOffsetX, 0);
  pushIfChanged('offset_y', state.windowOffsetY, 0);
  pushIfChanged('filter', state.filter, 'none');
  pushIfChanged('filter_intensity', state.filterIntensity, 100);
  pushIfChanged('texture', state.texture, 'none');
  pushIfChanged('texture_intensity', state.textureIntensity, 50);
  pushIfChanged('text_style', state.textStyle, 'none');
  pushIfChanged('text_style_color1', toHexParam(state.textStyleColor1), '89b4fa');
  pushIfChanged('text_style_color2', toHexParam(state.textStyleColor2), 'cba6f7');
  pushIfChanged('text_style_intensity', state.textStyleIntensity, 50);
  pushIfChanged('zoom', state.zoom, 100);
  pushIfChanged('window_opacity', state.windowOpacity, 100);
  pushIfChanged('grad_blur', state.gradBlur, false);
  pushIfChanged('grad_blur_dir', state.gradBlurDir, 'bottom');
  pushIfChanged('grad_blur_amount', state.gradBlurAmount, 20);
  pushIfChanged('grad_blur_start', state.gradBlurStart, 30);
  pushIfChanged('text_color', toHexParam(state.plainTextColor), 'e0e0e0');
  pushIfChanged('text_bg', toHexParam(state.plainTextBg), '1e1e2e');
  pushIfChanged('plain_font', toFontParam(state.plainFont), 'Arial');
  pushIfChanged('text_align', state.plainTextAlign, 'left');
  pushIfChanged('md_heading_color', toHexParam(state.mdHeadingColor), 'e2c08d');
  pushIfChanged('md_link_color', toHexParam(state.mdLinkColor), '61afef');
  pushIfChanged('watermark', showWatermark, false);
  pushIfChanged('glare', state.glareEnabled, false);
  pushIfChanged('glare_x', state.glareX, DEFAULTS.glareX);
  pushIfChanged('glare_y', state.glareY, DEFAULTS.glareY);
  pushIfChanged('glare_distance', state.glareDistance, DEFAULTS.glareDistance);
  pushIfChanged('glare_angle_h', state.glareAngleH, DEFAULTS.glareAngleH);
  pushIfChanged('glare_angle_v', state.glareAngleV, DEFAULTS.glareAngleV);
  pushIfChanged('glare_blur', state.glareBlur, DEFAULTS.glareBlur);
  pushIfChanged('glare_intensity', state.glareIntensity, DEFAULTS.glareIntensity);
  pushIfChanged('glare_color', toHexParam(state.glareColor), 'ffffff');
  pushIfChanged('lens', state.lensAmount, 0);
  pushIfChanged('ligatures', state.ligatures, true);
  pushIfChanged('letter_spacing', state.letterSpacing, 0);
  pushIfChanged('tab_size', state.tabSize, 4);
  pushIfChanged('border_style', state.borderStyle, 'none');
  pushIfChanged('border_width', state.borderWidth, 2);
  pushIfChanged('border_color', toHexParam(state.borderColor), 'ffffff');

  const query = params
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  const url = query ? `http://localhost:3000/?${query}` : 'http://localhost:3000/';

  return [
    `curl -X POST "${url}" \\`,
    '  -H "Content-Type: text/plain" \\',
    '  --data-binary "@script.js" \\',
    '  -o "screenshot.png"',
  ].join('\n');
}

async function copyAs(fmt) {
  const canvas = document.getElementById('preview-canvas');
  const btn = document.getElementById('copy-btn');
  const origHTML = btn.innerHTML;
  const flash = () => {
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    setTimeout(() => btn.innerHTML = origHTML, 1500);
  };
  if (fmt === 'base64') {
    try {
      await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
      flash();
    } catch(e) { exportAs('base64'); }
    return;
  }
  if (fmt === 'curl') {
    try {
      await navigator.clipboard.writeText(buildCurlCommand());
      flash();
    } catch(e) {}
    return;
  }
  if (fmt === 'png') {
    canvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
        flash();
      } catch(e) { exportAs('png'); }
    });
    return;
  }
}
