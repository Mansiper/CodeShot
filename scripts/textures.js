/* ════════════════════════════════════════════
   TEXTURES
════════════════════════════════════════════ */

function applyTexture(ctx, cW, cH, textureId, intensity) {
  if (textureId === 'none' || intensity === 0) return;
  const a = intensity / 100;

  function patternFill(tile, alpha) {
    const pat = ctx.createPattern(tile, 'repeat');
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, cW, cH);
    ctx.restore();
  }

  function noiseTile(size, r, g, b, spread) {
    const tile = document.createElement('canvas');
    tile.width = size; tile.height = size;
    const tc = tile.getContext('2d');
    const img = tc.createImageData(size, size);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * spread;
      d[i]   = Math.max(0, Math.min(255, r + n));
      d[i+1] = Math.max(0, Math.min(255, g + n));
      d[i+2] = Math.max(0, Math.min(255, b + n));
      d[i+3] = 255;
    }
    tc.putImageData(img, 0, 0);
    return tile;
  }

  switch (textureId) {

    case 'paper': {
      patternFill(noiseTile(128, 215, 200, 170, 55), a * 0.4);
      break;
    }

    case 'grain': {
      const tile = noiseTile(128, 128, 128, 128, 230);
      const pat = ctx.createPattern(tile, 'repeat');
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'linen': {
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = a * 0.18;
      for (let y = 0; y <= cH; y += 3) {
        ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(cW, y + 0.5); ctx.stroke();
      }
      ctx.globalAlpha = a * 0.08;
      for (let x = 0; x <= cW; x += 3) {
        ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, cH); ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'wood': {
      const size = 256;
      const tile = document.createElement('canvas');
      tile.width = size; tile.height = size;
      const tc = tile.getContext('2d');
      const img = tc.createImageData(size, size);
      const d = img.data;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const wave = Math.sin((y + x * 0.25) * 0.1 + Math.sin(y * 0.025) * 6) * 0.5 + 0.5;
          const v = Math.round(65 + wave * 90);
          const idx = (y * size + x) * 4;
          d[idx]   = Math.min(255, v + 75);
          d[idx+1] = Math.min(255, v + 22);
          d[idx+2] = Math.max(0,   v - 25);
          d[idx+3] = 255;
        }
      }
      tc.putImageData(img, 0, 0);
      patternFill(tile, a * 0.65);
      break;
    }

    case 'metal-shiny': {
      const stripeW = 28;
      ctx.save();
      for (let x = -cH; x < cW + cH; x += stripeW * 2) {
        const g = ctx.createLinearGradient(x, 0, x + stripeW, cH);
        g.addColorStop(0,    `rgba(255,255,255,0)`);
        g.addColorStop(0.35, `rgba(255,255,255,${a * 0.3})`);
        g.addColorStop(0.5,  `rgba(255,255,255,${a * 0.55})`);
        g.addColorStop(0.65, `rgba(255,255,255,${a * 0.3})`);
        g.addColorStop(1,    `rgba(255,255,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + stripeW, 0);
        ctx.lineTo(x + stripeW + cH, cH);
        ctx.lineTo(x + cH, cH);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      break;
    }

    case 'metal-brushed': {
      const tile = document.createElement('canvas');
      tile.width = 1; tile.height = cH;
      const tc = tile.getContext('2d');
      const img = tc.createImageData(1, cH);
      const d = img.data;
      for (let y = 0; y < cH; y++) {
        const v = Math.round(160 + (Math.random() - 0.5) * 80);
        const idx = y * 4;
        d[idx]   = Math.min(255, v);
        d[idx+1] = Math.min(255, v + 8);
        d[idx+2] = Math.min(255, v + 18);
        d[idx+3] = 255;
      }
      tc.putImageData(img, 0, 0);
      ctx.save();
      ctx.globalAlpha = a * 0.22;
      ctx.drawImage(tile, 0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'carbon': {
      const ts = 8;
      const tile = document.createElement('canvas');
      tile.width = ts * 2; tile.height = ts * 2;
      const tc = tile.getContext('2d');
      for (let ty = 0; ty < 2; ty++) {
        for (let tx = 0; tx < 2; tx++) {
          tc.save();
          tc.translate(tx * ts + ts / 2, ty * ts + ts / 2);
          tc.rotate((tx + ty) % 2 === 0 ? Math.PI / 4 : -Math.PI / 4);
          const g = tc.createLinearGradient(-ts, 0, ts, 0);
          g.addColorStop(0,    'rgba(255,255,255,0.00)');
          g.addColorStop(0.35, 'rgba(255,255,255,0.12)');
          g.addColorStop(0.5,  'rgba(255,255,255,0.22)');
          g.addColorStop(0.65, 'rgba(255,255,255,0.12)');
          g.addColorStop(1,    'rgba(255,255,255,0.00)');
          tc.fillStyle = g;
          tc.fillRect(-ts, -ts / 2, ts * 2, ts);
          tc.restore();
        }
      }
      patternFill(tile, a);
      break;
    }

    case 'scanlines': {
      ctx.save();
      ctx.globalAlpha = a * 0.3;
      ctx.fillStyle = '#000';
      for (let y = 0; y < cH; y += 2) {
        ctx.fillRect(0, y, cW, 1);
      }
      ctx.restore();
      break;
    }

    case 'glitter': {
      const count = Math.round(cW * cH * 0.002);
      ctx.save();
      for (let i = 0; i < count; i++) {
        const x = Math.random() * cW;
        const y = Math.random() * cH;
        const hue = Math.random() * 360;
        const sz = Math.random() * 1.2 + 0.3;
        ctx.globalAlpha = a * (0.5 + Math.random() * 0.5);
        ctx.fillStyle = `hsl(${hue},100%,85%)`;
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }

        case 'noise': {
      const tile = noiseTile(128, 128, 128, 128, 120);
      const pat = ctx.createPattern(tile, 'repeat');
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'dots': {
      const spacing = 10;
      const r = 1;
      ctx.save();
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = '#fff';
      for (let y = spacing / 2; y < cH; y += spacing) {
        for (let x = spacing / 2; x < cW; x += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      break;
    }

    case 'grid': {
      const spacing = 20;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = a * 0.15;
      for (let y = 0; y <= cH; y += spacing) {
        ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(cW, y + 0.5); ctx.stroke();
      }
      for (let x = 0; x <= cW; x += spacing) {
        ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, cH); ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'diagonal': {
      const gap = 10;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.75;
      ctx.globalAlpha = a * 0.18;
      for (let i = -cH; i < cW + cH; i += gap) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + cH, cH);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'crosshatch': {
      const gap = 12;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.6;
      ctx.globalAlpha = a * 0.14;
      for (let i = -cH; i < cW + cH; i += gap) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + cH, cH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(i + cH, 0); ctx.lineTo(i, cH); ctx.stroke();
      }
      ctx.restore();
      break;
    }

    case 'hex': {
      const size = 14;
      const w = size * 2;
      const h = Math.sqrt(3) * size;
      ctx.save();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.7;
      ctx.globalAlpha = a * 0.2;
      for (let row = -1; row * h < cH + h; row++) {
        for (let col = -1; col * w * 0.75 < cW + w; col++) {
          const cx2 = col * w * 0.75;
          const cy2 = row * h + (col % 2 === 0 ? 0 : h / 2);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 180 * (60 * i - 30);
            const px = cx2 + size * Math.cos(angle);
            const py = cy2 + size * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.restore();
      break;
    }

    case 'concrete': {
      const tile = noiseTile(128, 140, 135, 130, 180);
      const pat = ctx.createPattern(tile, 'repeat');
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'denim': {
      const ts = 6;
      const tile = document.createElement('canvas');
      tile.width = ts; tile.height = ts;
      const tc = tile.getContext('2d');
      tc.fillStyle = 'rgba(30,50,90,1)';
      tc.fillRect(0, 0, ts, ts);
      tc.strokeStyle = 'rgba(255,255,255,0.18)';
      tc.lineWidth = 1;
      tc.beginPath(); tc.moveTo(0, ts); tc.lineTo(ts, 0); tc.stroke();
      patternFill(tile, a * 0.55);
      break;
    }

    case 'vignette': {
      ctx.save();
      const rg = ctx.createRadialGradient(cW/2, cH/2, Math.min(cW,cH)*0.25, cW/2, cH/2, Math.max(cW,cH)*0.75);
      rg.addColorStop(0,   'rgba(0,0,0,0)');
      rg.addColorStop(1,   `rgba(0,0,0,${a * 0.75})`);
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }

    case 'frosted': {
      ctx.save();
      ctx.globalAlpha = a * 0.12;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, cW, cH);
      const fg = ctx.createLinearGradient(0, 0, cW, cH);
      fg.addColorStop(0,   `rgba(255,255,255,${a * 0.15})`);
      fg.addColorStop(0.5, `rgba(255,255,255,${a * 0.04})`);
      fg.addColorStop(1,   `rgba(255,255,255,${a * 0.10})`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, cW, cH);
      ctx.restore();
      break;
    }
  }
}
