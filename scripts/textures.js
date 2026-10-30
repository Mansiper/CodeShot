/* ════════════════════════════════════════════
   TEXTURES
════════════════════════════════════════════ */

function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

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

    case 'blood': {
      // One impact splatter (body + tendrils + spray + drips) with a SINGLE direction,
      // plus 1-2 small satellite splatters that follow the same direction.
      const rng = mulberry32((state.textureSeed || 0) >>> 0);
      const rawColor = (state.textureBloodColor || '#8b0000').replace('#','');
      const bloodHex = rawColor.length === 3
        ? '#' + rawColor.split('').map(c => c+c).join('')
        : '#' + rawColor;
      const [br, bg2, bb] = hexRgb(bloodHex);
      // mix: 0 = mostly spray, 100 = long running drips
      const mix = Math.max(0, Math.min(100, state.textureBloodMix ?? 50)) / 100;
      const S = Math.sqrt(cW * cH);          // size unit that ignores aspect ratio / export scale
      const TAU = Math.PI * 2;

      const rgba = (r, g, b, al) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${al})`;
      const bc = (al) => rgba(br, bg2, bb, al);
      const dk = (k, al) => rgba(br * k, bg2 * k, bb * k, al);
      const lt = (k, al) => rgba(br + (255 - br) * k, bg2 + (255 - bg2) * k, bb + (255 - bb) * k, al);

      const mask = document.createElement('canvas');
      mask.width = cW; mask.height = cH;
      const mc = mask.getContext('2d');
      mc.fillStyle = bc(1);

      // spray direction: sideways and a bit upwards; drips always fall down (gravity)
      const base = rng() < 0.5 ? 0 : Math.PI;
      const dir = base + (base === 0 ? -0.25 : 0.25) + (rng() - 0.5) * 1.0;

      const bodies = [];
      const drips = [];

      function smoothClosed(c, pts) {
        const n = pts.length;
        c.beginPath();
        c.moveTo((pts[n-1][0] + pts[0][0]) / 2, (pts[n-1][1] + pts[0][1]) / 2);
        for (let i = 0; i < n; i++) {
          const p = pts[i], q = pts[(i + 1) % n];
          c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
        }
        c.closePath();
      }

      // round head + tapered tail pointing back to the impact point
      function teardrop(c, x, y, r, len, ang) {
        const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
        c.beginPath();
        if (len < r * 1.3) { c.arc(x, y, r, 0, TAU); return; }
        c.moveTo(x - ux * len, y - uy * len);
        c.quadraticCurveTo(x - ux * len * 0.4 + nx * r * 0.55, y - uy * len * 0.4 + ny * r * 0.55, x + nx * r, y + ny * r);
        c.arc(x, y, r, ang + Math.PI / 2, ang - Math.PI / 2, true);
        c.quadraticCurveTo(x - ux * len * 0.4 - nx * r * 0.55, y - uy * len * 0.4 - ny * r * 0.55, x - ux * len, y - uy * len);
        c.closePath();
      }

      function splat(cx, cy, R, dripN, sprayK) {
        bodies.push({ x: cx, y: cy, R });

        // 1. main body: lumpy outline, stretched along the spray direction
        const N = 60, ph = [rng() * TAU, rng() * TAU, rng() * TAU];
        const rad = [], pts = [];
        for (let i = 0; i < N; i++) {
          const th = i / N * TAU;
          let k = 1 + 0.16 * Math.sin(3 * th + ph[0]) + 0.11 * Math.sin(5 * th + ph[1]) + 0.06 * Math.sin(9 * th + ph[2]);
          k *= 1 + 0.4 * Math.max(0, Math.cos(th - dir));
          k *= 0.92 + rng() * 0.16;
          rad.push(R * k);
          pts.push([cx + Math.cos(th) * R * k, cy + Math.sin(th) * R * k]);
        }
        smoothClosed(mc, pts); mc.fill();
        // bumpy edge: small lobes merged into the outline
        const lobes = Math.round(16 + rng() * 10);
        for (let i = 0; i < lobes; i++) {
          const th = rng() * TAU, rr = rad[Math.round(th / TAU * N) % N];
          const lr = R * (0.07 + rng() * 0.15);
          mc.beginPath(); mc.arc(cx + Math.cos(th) * rr * (0.95 + rng() * 0.25), cy + Math.sin(th) * rr * (0.95 + rng() * 0.25), lr, 0, TAU); mc.fill();
        }

        // 2. tendrils: tapered spikes with a bulb at the tip and sometimes a detached drop
        const T = Math.round((8 + rng() * 6) * Math.sqrt(sprayK));
        for (let i = 0; i < T; i++) {
          const ang = rng() < 0.7 ? dir + (rng() + rng() + rng() - 1.5) * 1.5 : rng() * TAU;
          const w = Math.max(0, Math.cos(ang - dir));
          const len = R * (0.25 + Math.pow(rng(), 1.8) * 0.9) * (0.7 + 0.6 * w);
          const bw = R * (0.09 + rng() * 0.12);
          const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
          const bx = cx + ux * R * 0.6, by = cy + uy * R * 0.6;
          const tx = bx + ux * (len + R * 0.4), ty = by + uy * (len + R * 0.4);
          mc.beginPath();
          mc.moveTo(bx + nx * bw * 1.4, by + ny * bw * 1.4);
          mc.quadraticCurveTo(bx + ux * len * 0.6 + nx * bw * 0.5, by + uy * len * 0.6 + ny * bw * 0.5, tx, ty);
          mc.quadraticCurveTo(bx + ux * len * 0.6 - nx * bw * 0.5, by + uy * len * 0.6 - ny * bw * 0.5, bx - nx * bw * 1.4, by - ny * bw * 1.4);
          mc.closePath(); mc.fill();
          if (rng() < 0.55) {
            mc.beginPath(); mc.arc(tx - ux * bw * 0.2, ty - uy * bw * 0.2, bw * (0.5 + rng() * 0.5), 0, TAU); mc.fill();
          }
          if (rng() < 0.5) {
            const gap = bw * (2 + rng() * 3);
            teardrop(mc, tx + ux * gap, ty + uy * gap, bw * 0.45, bw * (1 + rng() * 2), ang); mc.fill();
          }
        }

        // 3. spray: lots of tiny drops; far ones are smaller and stretched into streaks
        const maxReach = 6.5;
        const sprayN = Math.round((380 + 420 * (1 - mix)) * sprayK);
        for (let i = 0; i < sprayN; i++) {
          const ang = rng() < 0.8 ? dir + (rng() + rng() + rng() - 1.5) * 1.4 : rng() * TAU;
          const w = Math.max(0, Math.cos(ang - dir));
          const f = Math.pow(rng(), 2.3);
          const dist = R * (1.15 + f * maxReach * (0.55 + 0.7 * w));
          const fr = Math.min(1, dist / (R * maxReach));
          const r = R * (0.01 + Math.pow(rng(), 3.5) * 0.08) * (1.15 - 0.55 * fr);
          const len = r * (0.3 + fr * rng() * 5);
          teardrop(mc, cx + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, r, len, ang);
          mc.fill();
        }

        // 4. drips: thin strands running down from the lower edge, ending in a bulb
        const used = [];
        for (let i = 0; i < dripN; i++) {
          let th = Math.PI * (0.08 + rng() * 0.84);
          for (let k = 0; k < 8 && used.some(u0 => Math.abs(u0 - th) < 0.28); k++) th = Math.PI * (0.08 + rng() * 0.84);
          used.push(th);
          const sx = cx + Math.cos(th) * rad[Math.round(th / TAU * N) % N] * 0.8;
          const sy = cy + Math.sin(th) * rad[Math.round(th / TAU * N) % N] * 0.8;
          const len = R * (0.9 + Math.pow(rng(), 1.2) * 3.4) * (0.5 + mix * 0.9);
          const w0 = R * (0.07 + rng() * 0.09);
          const ph1 = rng() * TAU, drift = (rng() - 0.5) * w0 * 4;
          const steps = 18, Ls = [], Rs = [], mid = [];
          let ex = sx, ey = sy, ew = w0;
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const x = sx + drift * t + Math.sin(t * TAU * 1.3 + ph1) * w0 * 0.3 * t;
            const y = sy + len * t;
            const w = w0 * (1 - 0.55 * t) * (1 + 0.12 * Math.sin(t * 15 + ph1)) * (1 + 0.9 * Math.exp(-t * 9));
            Ls.push([x - w / 2, y]); Rs.push([x + w / 2, y]); mid.push([x, y]);
            ex = x; ey = y; ew = w;
          }
          mc.beginPath();
          Ls.forEach((p, k) => k ? mc.lineTo(p[0], p[1]) : mc.moveTo(p[0], p[1]));
          for (let k = Rs.length - 1; k >= 0; k--) mc.lineTo(Rs[k][0], Rs[k][1]);
          mc.closePath(); mc.fill();
          const rb = ew * 0.9;
          mc.beginPath(); mc.arc(ex, ey, rb, 0, TAU); mc.fill();
          if (rng() < 0.3) {
            teardrop(mc, ex, ey + rb * (3 + rng() * 6), rb * 0.6, rb * 1.6, Math.PI / 2); mc.fill();
          }
          drips.push({ mid, w: w0 });
        }
      }

      // placement: main splat in the upper-middle so its drips have room to run
      const R0 = S * 0.11;
      const mx = cW * (0.3 + rng() * 0.4), my = Math.max(R0 * 1.9, cH * (0.18 + rng() * 0.22));
      splat(mx, my, R0, 3 + Math.round(mix * 6 + rng() * 2), 1);
      const extra = 1 + (rng() < 0.5 ? 1 : 0);
      for (let i = 0; i < extra; i++) {
        const R2 = R0 * (0.28 + rng() * 0.25);
        const dist = R0 * (3.2 + rng() * 2.5), ang = dir + (rng() - 0.5) * 1.6;
        const cx2 = Math.max(R2 * 2, Math.min(cW - R2 * 2, mx + Math.cos(ang) * dist));
        const cy2 = Math.max(R2 * 2, Math.min(cH - R2 * 2, my + Math.sin(ang) * dist));
        splat(cx2, cy2, R2, 1 + Math.round(mix * 2), 0.35);
      }

      // ---- shading ----
      const off = document.createElement('canvas');
      off.width = cW; off.height = cH;
      const oc = off.getContext('2d');
      oc.drawImage(mask, 0, 0);
      oc.globalCompositeOperation = 'source-atop';
      oc.fillStyle = lt(0.16, 0.22);                     // thin blood is lighter
      oc.fillRect(0, 0, cW, cH);
      for (const b of bodies) {                          // thick blood is darker
        const g = oc.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.R * 1.5);
        g.addColorStop(0, dk(0.35, 0.75)); g.addColorStop(0.55, dk(0.5, 0.4)); g.addColorStop(1, dk(0.5, 0));
        oc.fillStyle = g; oc.fillRect(b.x - b.R * 2, b.y - b.R * 2, b.R * 4, b.R * 4);
        const hx = b.x - b.R * 0.35, hy = b.y - b.R * 0.4;   // wet gloss
        const gl = oc.createRadialGradient(hx, hy, 0, hx, hy, b.R * 0.35);
        gl.addColorStop(0, 'rgba(255,230,225,0.2)'); gl.addColorStop(1, 'rgba(255,230,225,0)');
        oc.fillStyle = gl; oc.fillRect(hx - b.R, hy - b.R, b.R * 2, b.R * 2);
      }
      oc.lineCap = 'round';
      for (const d of drips) {                           // specular streak along each drip
        oc.beginPath();
        const a0 = Math.floor(d.mid.length * 0.12), a1 = Math.floor(d.mid.length * 0.85);
        for (let k = a0; k <= a1; k++) {
          const p = d.mid[k];
          k === a0 ? oc.moveTo(p[0] - d.w * 0.12, p[1]) : oc.lineTo(p[0] - d.w * 0.12, p[1]);
        }
        oc.lineWidth = Math.max(1, d.w * 0.22);
        oc.strokeStyle = 'rgba(255,225,215,0.45)';
        oc.stroke();
      }
      oc.globalCompositeOperation = 'source-over';

      // rim light on top-left edges, shade on bottom-right edges (gives the drops volume)
      function edge(dx, dy, color, alpha) {
        const e = document.createElement('canvas');
        e.width = cW; e.height = cH;
        const ec = e.getContext('2d');
        ec.drawImage(mask, 0, 0);
        ec.globalCompositeOperation = 'destination-out';
        ec.drawImage(mask, dx, dy);
        ec.globalCompositeOperation = 'source-in';
        ec.fillStyle = color; ec.fillRect(0, 0, cW, cH);
        oc.globalAlpha = alpha; oc.drawImage(e, 0, 0); oc.globalAlpha = 1;
      }
      const ed = Math.max(0.8, S * 0.0016);
      edge(ed, ed, 'rgb(255,215,205)', 0.38);
      edge(-ed, -ed, dk(0.2, 1), 0.55);

      ctx.save();
      ctx.globalAlpha = a;
      ctx.drawImage(off, 0, 0);
      ctx.restore();
      break;
    }

    case 'rain': {
      // Water on glass: irregular drops that show a flipped, miniature view of the scene,
      // bright rim top-left / dark rim bottom-right, and sliding drops that leave a
      // tapering wet trail with small residual droplets. With "fog" on, trails and drops
      // wipe the steam off the glass.
      const rng = mulberry32((state.textureSeed || 0) >>> 0);
      const fog = state.textureRainFog;
      const dens = Math.max(0, Math.min(100, state.textureRainDensity ?? 50)) / 50;  // optional slider, default = 1
      const A = cW * cH / (800 * 600);          // density follows area, so export scale looks identical
      const u = Math.max(1, cW / 800);          // "one pixel" unit for line widths
      const TAU = Math.PI * 2;

      const bgSnap = document.createElement('canvas');
      bgSnap.width = cW; bgSnap.height = cH;
      bgSnap.getContext('2d').drawImage(ctx.canvas, 0, 0);

      const off = document.createElement('canvas');
      off.width = cW; off.height = cH;
      const oc = off.getContext('2d');

      if (fog) {
        const blur = 1 * u, pad = blur * 3;
        oc.filter = `blur(${blur}px)`;
        oc.drawImage(bgSnap, -pad, -pad, cW + 2 * pad, cH + 2 * pad);
        oc.filter = 'none';
        oc.fillStyle = 'rgba(205,220,235,0.16)';
        oc.fillRect(0, 0, cW, cH);
      }

      function smoothClosed(c, pts) {
        const n = pts.length;
        c.beginPath();
        c.moveTo((pts[n-1][0] + pts[0][0]) / 2, (pts[n-1][1] + pts[0][1]) / 2);
        for (let i = 0; i < n; i++) {
          const p = pts[i], q = pts[(i + 1) % n];
          c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
        }
        c.closePath();
      }

      // ---- drop geometry: noisy blob, heavier at the bottom, optional pointed tail on top ----
      function makeDrop(x, y, r, aspect, tail) {
        const d = { x, y, rx: r, ry: r * aspect, tilt: (rng() - 0.5) * 0.5, tail: tail || 0,
                    p: [rng() * TAU, rng() * TAU, rng() * TAU], s: 0.45 + rng() * 0.25 };
        const N = 36, cs = Math.cos(d.tilt), sn = Math.sin(d.tilt);
        d.pts = [];
        for (let i = 0; i < N; i++) {
          const th = i / N * TAU;
          let k = 1 + 0.09 * Math.sin(2 * th + d.p[0]) + 0.07 * Math.sin(3 * th + d.p[1]) + 0.04 * Math.sin(5 * th + d.p[2]);
          k *= 1 + 0.10 * Math.sin(th);
          if (d.tail) {
            const df = Math.abs(((th + Math.PI / 2 + Math.PI) % TAU) - Math.PI);
            k *= 1 + d.tail * Math.exp(-Math.pow(df / 0.5, 2));
          }
          const px = Math.cos(th) * d.rx * k, py = Math.sin(th) * d.ry * k;
          d.pts.push([x + px * cs - py * sn, y + px * sn + py * cs]);
        }
        d.br = Math.max(d.rx, d.ry * (1 + d.tail)) * 1.25;
        return d;
      }

      function drawDrop(d) {
        const c = oc, r = Math.max(d.rx, d.ry), R = d.br;
        // soft shadow (light comes from the top-left); interior is then cleared
        c.save();
        c.shadowColor = 'rgba(0,0,0,0.35)';
        c.shadowBlur = r * 0.5; c.shadowOffsetX = r * 0.15; c.shadowOffsetY = r * 0.3;
        smoothClosed(c, d.pts); c.fillStyle = '#000'; c.fill();
        c.shadowColor = 'transparent';
        c.globalCompositeOperation = 'destination-out';
        smoothClosed(c, d.pts); c.fill();
        c.restore();

        c.save();
        smoothClosed(c, d.pts); c.clip();
        // refraction: scene flipped 180 degrees and shrunk around the drop centre
        c.save();
        c.translate(d.x, d.y); c.rotate(Math.PI); c.scale(d.s, d.s);
        const H = R / d.s;
        const sx = Math.max(0, d.x - H), sy = Math.max(0, d.y - H);
        const ex = Math.min(cW, d.x + H), ey = Math.min(cH, d.y + H);
        if (ex > sx && ey > sy) c.drawImage(bgSnap, sx, sy, ex - sx, ey - sy, sx - d.x, sy - d.y, ex - sx, ey - sy);
        c.restore();
        // sky-bright top, dark bottom
        const g = c.createLinearGradient(0, d.y - R, 0, d.y + R);
        g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(0.45, 'rgba(255,255,255,0)');
        g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.38)');
        c.fillStyle = g; c.fillRect(d.x - R, d.y - R, R * 2, R * 2);
        // rim: bright top-left, dark bottom-right
        const rg = c.createLinearGradient(d.x - r, d.y - r, d.x + r, d.y + r);
        rg.addColorStop(0, 'rgba(255,255,255,0.85)'); rg.addColorStop(0.4, 'rgba(255,255,255,0.12)');
        rg.addColorStop(0.6, 'rgba(0,0,0,0.12)'); rg.addColorStop(1, 'rgba(0,0,0,0.6)');
        c.lineWidth = Math.max(1, r * 0.28) * 2;
        c.strokeStyle = rg;
        smoothClosed(c, d.pts); c.stroke();
        // hot highlight
        const hx = d.x - d.rx * 0.35, hy = d.y - d.ry * 0.45;
        const hg = c.createRadialGradient(hx, hy, 0, hx, hy, r * 0.45);
        hg.addColorStop(0, 'rgba(255,255,255,0.85)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = hg; c.fillRect(hx - r, hy - r, r * 2, r * 2);
        c.restore();
        // thin outer edge
        c.save();
        smoothClosed(c, d.pts);
        c.lineWidth = Math.max(0.6, u * 0.6); c.strokeStyle = 'rgba(255,255,255,0.22)'; c.stroke();
        c.restore();
      }

      // cheap version for the tiny mist drops
      function drawTiny(x, y, r) {
        const ry = r * (0.75 + rng() * 0.25);
        oc.save();
        if (fog) {
          oc.globalCompositeOperation = 'destination-out'; oc.globalAlpha = 0.6;
          oc.beginPath(); oc.ellipse(x, y, r, ry, 0, 0, TAU); oc.fill();
          oc.globalCompositeOperation = 'source-over'; oc.globalAlpha = 1;
        }
        const g = oc.createRadialGradient(x - r * 0.3, y - ry * 0.3, 0, x, y, r * 1.1);
        g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.35, 'rgba(200,215,230,0.12)');
        g.addColorStop(0.8, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
        oc.fillStyle = g;
        oc.beginPath(); oc.ellipse(x, y, r, ry, 0, 0, TAU); oc.fill();
        oc.restore();
      }

      // ---- trail: wet streak above a sliding drop, narrow at the start, widest at the drop ----
      function makeTrail(d, len, wf) {
        const n = 14, drift = (rng() - 0.5) * len * 0.12, ph = rng() * TAU, wob = d.rx * 0.35;
        const L = [], Rr = [], mid = [], ws = [];
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          const x = d.x + drift * (1 - t) + Math.sin(t * 5 + ph) * wob * (1 - t * 0.5);
          const y = d.y - len * (1 - t);
          const w = d.rx * wf * (0.15 + 0.85 * Math.pow(t, 0.7)) * (0.9 + 0.2 * Math.sin(t * 17 + ph));
          L.push([x - w, y]); Rr.push([x + w, y]); mid.push([x, y]); ws.push(w);
        }
        return { L, Rr, mid, ws };
      }
      function trailPath(tr, grow) {
        oc.beginPath();
        tr.L.forEach((p, i) => {
          const m = tr.mid[i], x = m[0] + (p[0] - m[0]) * grow;
          i ? oc.lineTo(x, p[1]) : oc.moveTo(x, p[1]);
        });
        for (let i = tr.Rr.length - 1; i >= 0; i--) {
          const m = tr.mid[i];
          oc.lineTo(m[0] + (tr.Rr[i][0] - m[0]) * grow, tr.Rr[i][1]);
        }
        oc.closePath();
      }
      function drawTrail(tr) {
        oc.save();
        if (fog) {
          oc.globalCompositeOperation = 'destination-out';
          oc.globalAlpha = 0.35; trailPath(tr, 1.35); oc.fill();
          oc.globalAlpha = 0.85; trailPath(tr, 1); oc.fill();
        } else {
          oc.fillStyle = 'rgba(255,255,255,0.10)'; trailPath(tr, 1); oc.fill();
        }
        oc.restore();
        oc.save();
        oc.lineWidth = Math.max(0.7, u * 0.8);
        oc.strokeStyle = 'rgba(255,255,255,0.3)';
        oc.beginPath(); tr.L.forEach((p, i) => i ? oc.lineTo(p[0], p[1]) : oc.moveTo(p[0], p[1])); oc.stroke();
        oc.strokeStyle = 'rgba(0,0,0,0.22)';
        oc.beginPath(); tr.Rr.forEach((p, i) => i ? oc.lineTo(p[0], p[1]) : oc.moveTo(p[0], p[1])); oc.stroke();
        oc.restore();
      }

      // ---- build the scene ----
      const placed = [], drops = [], trails = [], tiny = [];
      const free = (x, y, r) => placed.every(p => Math.hypot(p.x - x, p.y - y) > (p.r + r) * 0.7);
      function place(r, tries) {
        for (let i = 0; i < tries; i++) {
          const x = rng() * cW, y = rng() * cH;
          if (free(x, y, r)) { placed.push({ x, y, r }); return [x, y]; }
        }
        return null;
      }

      function addSliding(d, trailLen, widthF) {
        const tr = makeTrail(d, trailLen, widthF);
        trails.push(tr);
        // residual droplets left behind along the trail
        const nr = 3 + Math.floor(rng() * 5);
        for (let j = 0; j < nr; j++) {
          const t = 0.1 + rng() * 0.8, i = Math.round(t * (tr.mid.length - 1));
          const rr = d.rx * (0.1 + rng() * 0.22);
          const x = tr.mid[i][0] + (rng() * 1.6 - 0.8) * tr.ws[i] * 1.2, y = tr.mid[i][1];
          if (rr < 2.2 * u) tiny.push([x, y, Math.max(0.8 * u, rr)]);
          else drops.push(makeDrop(x, y, rr, 0.9 + rng() * 0.3, 0));
        }
        // the drop paused once on its way and left a bigger blob
        if (rng() < 0.7) {
          const i = Math.round((0.25 + rng() * 0.45) * (tr.mid.length - 1));
          drops.push(makeDrop(tr.mid[i][0], tr.mid[i][1], d.rx * (0.35 + rng() * 0.25), 1.1 + rng() * 0.2, 0.5));
        }
        drops.push(d);
      }

      // big sliding drops with long trails
      const bigN = Math.round(9 * A * dens);
      for (let i = 0; i < bigN; i++) {
        const r = cW * (0.014 + rng() * 0.011), pos = place(r, 8);
        if (!pos) continue;
        const d = makeDrop(pos[0], pos[1], r, 1.05 + rng() * 0.45, 0.3 + rng() * 0.5);
        if (rng() < 0.85) addSliding(d, cH * (0.08 + rng() * 0.22), 0.75 + rng() * 0.25);
        else drops.push(d);
      }
      // medium drops, some of them sliding a short way
      const medN = Math.round(55 * A * dens);
      for (let i = 0; i < medN; i++) {
        const r = cW * (0.008 + rng() * 0.007), pos = place(r, 8);
        if (!pos) continue;
        if (rng() < 0.35) {
          const d = makeDrop(pos[0], pos[1], r, 1.05 + rng() * 0.4, 0.3 + rng() * 0.4);
          addSliding(d, r * (4 + rng() * 6), 0.7);
        } else drops.push(makeDrop(pos[0], pos[1], r, 0.85 + rng() * 0.35, 0));
      }
      // small drops
      const smallN = Math.round(160 * A * dens);
      for (let i = 0; i < smallN; i++) {
        const r = cW * (0.0035 + Math.pow(rng(), 1.5) * 0.0045), pos = place(r, 5);
        if (pos) drops.push(makeDrop(pos[0], pos[1], r, 0.85 + rng() * 0.35, 0));
      }
      // mist
      const tinyN = Math.round(700 * A * dens);
      for (let i = 0; i < tinyN; i++) tiny.push([rng() * cW, rng() * cH, u * (0.7 + rng() * 1.3)]);

      // ---- paint: trails -> mist -> drops from small to large ----
      trails.forEach(drawTrail);
      tiny.forEach(t => drawTiny(t[0], t[1], t[2]));
      drops.sort((p, q) => Math.max(p.rx, p.ry) - Math.max(q.rx, q.ry)).forEach(drawDrop);

      ctx.save();
      ctx.globalAlpha = a;
      ctx.drawImage(off, 0, 0);
      ctx.restore();
      break;
    }
  }
}
