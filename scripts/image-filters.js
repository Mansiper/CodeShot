/* ════════════════════════════════════════════
   IMAGE FILTERS
════════════════════════════════════════════ */

function buildFilterString(filterId, intensity) {
  if (filterId === 'none' || intensity === 0) return 'none';
  const t = intensity / 100;
  const gs  = v => (v * t).toFixed(3);        // grayscale / sepia  (neutral = 0)
  const adj = v => (1 + t * (v - 1)).toFixed(3); // sat / contrast / brightness (neutral = 1)
  const deg = v => (t * v).toFixed(1);         // hue-rotate  (neutral = 0°)
  switch (filterId) {
    case 'bw':        return `grayscale(${gs(1)})`;
    case 'sepia':     return `sepia(${gs(1)})`;
    case 'cool':      return `saturate(${adj(0.7)}) hue-rotate(${deg(200)}deg) brightness(${adj(0.95)})`;
    case 'warm':      return `saturate(${adj(1.3)}) hue-rotate(${deg(-20)}deg) brightness(${adj(1.05)})`;
    case 'faded':     return `contrast(${adj(0.80)}) brightness(${adj(1.10)}) saturate(${adj(0.70)})`;
    case 'vivid':     return `saturate(${adj(2.0)}) contrast(${adj(1.10)})`;
    case 'cinematic': return `contrast(${adj(1.30)}) saturate(${adj(0.80)}) brightness(${adj(0.90)})`;
    case 'noir':      return `grayscale(${gs(1)}) contrast(${adj(1.50)})`;
    case 'amber':     return `sepia(${gs(0.70)}) saturate(${adj(1.50)}) hue-rotate(${deg(-10)}deg) brightness(${adj(0.95)})`;
    case 'mint':        return `hue-rotate(${deg(150)}deg) saturate(${adj(0.55)}) brightness(${adj(1.05)})`;
    case 'dusk':        return `hue-rotate(${deg(-40)}deg) saturate(${adj(1.30)}) brightness(${adj(0.90)})`;
    case 'retro':       return `sepia(${gs(0.40)}) contrast(${adj(0.85)}) brightness(${adj(1.10)}) saturate(${adj(0.80)}) hue-rotate(${deg(-10)}deg)`;
    case 'neon':        return `saturate(${adj(3.00)}) contrast(${adj(1.50)})`;
    case 'lofi':        return `contrast(${adj(1.40)}) saturate(${adj(1.20)}) hue-rotate(${deg(-10)}deg)`;
    case 'bleach':      return `grayscale(${gs(0.50)}) contrast(${adj(1.80)}) brightness(${adj(1.10)}) saturate(${adj(0.30)})`;
    case 'ice':         return `hue-rotate(${deg(180)}deg) saturate(${adj(0.70)}) brightness(${adj(1.30)})`;
    case 'overexposed': return `brightness(${adj(1.80)}) contrast(${adj(0.80)})`;
    case 'darkroom':    return `brightness(${adj(0.60)}) contrast(${adj(1.80)})`;
    case 'dreamy':      return `brightness(${adj(1.20)}) contrast(${adj(0.75)}) saturate(${adj(0.90)}) blur(${(t*1.5).toFixed(1)}px)`;
    default:          return 'none';
  }
}
