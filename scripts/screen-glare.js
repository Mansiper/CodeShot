/* ════════════════════════════════════════════
   SCREEN GLARE
════════════════════════════════════════════ */

function applyGlare(ctx, cW, cH) {
  if (!state.glareEnabled) return;

  const gx = state.glareX / 100 * cW;
  const gy = state.glareY / 100 * cH;

  // Distance controls spread: smaller distance → larger glare
  const dist = Math.max(10, state.glareDistance);
  const baseR = Math.max(cW, cH) * (150 / dist);

  // Light source sits at (d·tan θh, d·tan θv, d).
  // The cross-section of the light cone (a circle) projected onto the screen
  // plane forms an ellipse:
  //   • minor semi-axis  = baseR  (perpendicular to the projection direction)
  //   • major semi-axis  = baseR / cosI  (along the projection direction)
  //   • cosI = 1 / √(tan²θh + tan²θv + 1)
  //   • rotation angle φ = atan2(tan θv, tan θh)
  const ah = state.glareAngleH * Math.PI / 180;
  const av = state.glareAngleV * Math.PI / 180;
  const tx = Math.tan(ah);
  const ty = Math.tan(av);
  const cosI   = 1 / Math.sqrt(tx * tx + ty * ty + 1);
  const rMajor = baseR / cosI;   // elongated along light projection
  const rMinor = baseR;
  const phi    = Math.atan2(ty, tx); // rotation of major axis

  if (rMajor < 1 || rMinor < 1) return;

  // Render glare onto an offscreen canvas
  const off = document.createElement('canvas');
  off.width = cW; off.height = cH;
  const octx = off.getContext('2d');

  const [r, g, b] = hexRgb(state.glareColor);
  const intensity = state.glareIntensity / 100;

  octx.save();
  octx.translate(gx, gy);
  octx.rotate(phi);
  octx.scale(rMajor / rMinor, 1); // stretch circle into ellipse along major axis

  // Radial gradient is defined in transformed space → it follows the ellipse
  const grad = octx.createRadialGradient(0, 0, 0, 0, 0, rMinor);
  grad.addColorStop(0,    `rgba(${r},${g},${b},${intensity.toFixed(3)})`);
  grad.addColorStop(0.25, `rgba(${r},${g},${b},${(intensity * 0.70).toFixed(3)})`);
  grad.addColorStop(0.60, `rgba(${r},${g},${b},${(intensity * 0.25).toFixed(3)})`);
  grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

  octx.fillStyle = grad;
  octx.beginPath();
  octx.arc(0, 0, rMinor, 0, Math.PI * 2);
  octx.fill();
  octx.restore();

  // Composite onto main canvas using screen blend (adds light naturally)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  if (state.glareBlur > 0) ctx.filter = `blur(${state.glareBlur}px)`;
  ctx.drawImage(off, 0, 0);
  ctx.restore();
}
