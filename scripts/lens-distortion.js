/* ════════════════════════════════════════════
   LENS DISTORTION
════════════════════════════════════════════ */

function applyLens(src, amount) {
  if (amount === 0) return src;
  const W = src.width, H = src.height;
  const dst = document.createElement('canvas');
  dst.width = W; dst.height = H;
  const sctx = src.getContext('2d');
  const srcData = sctx.getImageData(0, 0, W, H).data;
  const dctx = dst.getContext('2d');
  const dstImgData = dctx.createImageData(W, H);
  const dstData = dstImgData.data;
  const cx = W / 2, cy = H / 2;
  // k > 0 → barrel (convex, +), k < 0 → pincushion (concave, −)
  const k = amount / 200;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = (x - cx) / cx;
      const ny = (y - cy) / cy;
      const r2 = nx * nx + ny * ny;
      const factor = 1 - k * r2;
      const sx = cx + nx * factor * cx;
      const sy = cy + ny * factor * cy;
      const x0 = sx | 0, y0 = sy | 0;
      const x1 = x0 + 1, y1 = y0 + 1;
      const fx = sx - x0, fy = sy - y0;
      const di = (y * W + x) * 4;
      if (x0 >= 0 && x1 < W && y0 >= 0 && y1 < H) {
        for (let c = 0; c < 4; c++) {
          const v00 = srcData[(y0 * W + x0) * 4 + c];
          const v10 = srcData[(y0 * W + x1) * 4 + c];
          const v01 = srcData[(y1 * W + x0) * 4 + c];
          const v11 = srcData[(y1 * W + x1) * 4 + c];
          dstData[di + c] = (v00*(1-fx)*(1-fy) + v10*fx*(1-fy) + v01*(1-fx)*fy + v11*fx*fy) | 0;
        }
      } else if (x0 >= 0 && x0 < W && y0 >= 0 && y0 < H) {
        const si = (y0 * W + x0) * 4;
        dstData[di] = srcData[si]; dstData[di+1] = srcData[si+1];
        dstData[di+2] = srcData[si+2]; dstData[di+3] = srcData[si+3];
      }
      // else: out of bounds → transparent
    }
  }
  dctx.putImageData(dstImgData, 0, 0);
  return dst;
}
