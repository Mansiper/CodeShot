/* ════════════════════════════════════════════
   FORMAT ENCODERS
════════════════════════════════════════════ */

function canvasToTiff(canvas, cb) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const rgba = ctx.getImageData(0, 0, w, h).data;
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    const a = rgba[i + 3] / 255;
    rgb[j]     = (rgba[i]     * a + 255 * (1 - a)) | 0;
    rgb[j + 1] = (rgba[i + 1] * a + 255 * (1 - a)) | 0;
    rgb[j + 2] = (rgba[i + 2] * a + 255 * (1 - a)) | 0;
  }
  const numTags = 10, ifdOff = 8;
  const ifdSize  = 2 + numTags * 12 + 4;
  const bpsOff   = ifdOff + ifdSize;
  const imgOff   = bpsOff + 6;
  const buf = new ArrayBuffer(imgOff + rgb.length);
  const dv  = new DataView(buf);
  dv.setUint16(0, 0x4949, true); dv.setUint16(2, 42, true); dv.setUint32(4, ifdOff, true);
  let p = ifdOff; dv.setUint16(p, numTags, true); p += 2;
  const tag = (t, type, count, val) => {
    dv.setUint16(p, t, true); dv.setUint16(p+2, type, true);
    dv.setUint32(p+4, count, true); dv.setUint32(p+8, val, true); p += 12;
  };
  tag(256,4,1,w); tag(257,4,1,h); tag(258,3,3,bpsOff); tag(259,3,1,1);
  tag(262,3,1,2); tag(273,4,1,imgOff); tag(277,3,1,3);
  tag(278,4,1,h); tag(279,4,1,rgb.length); tag(284,3,1,1);
  dv.setUint32(p, 0, true);
  dv.setUint16(bpsOff, 8, true); dv.setUint16(bpsOff+2, 8, true); dv.setUint16(bpsOff+4, 8, true);
  new Uint8Array(buf, imgOff).set(rgb);
  cb(new Blob([buf], {type:'image/tiff'}));
}

function canvasToGif(canvas, cb) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, np = w * h;
  const rgba = ctx.getImageData(0, 0, w, h).data;
  // Composite on white → RGB
  const rgb = new Uint8Array(np * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    const a = rgba[i+3] / 255;
    rgb[j]   = (rgba[i]   * a + 255 * (1-a)) | 0;
    rgb[j+1] = (rgba[i+1] * a + 255 * (1-a)) | 0;
    rgb[j+2] = (rgba[i+2] * a + 255 * (1-a)) | 0;
  }
  // Build 256-color palette via frequency on 6-bit-reduced colors
  const freq = new Map();
  for (let j = 0; j < np*3; j += 3) {
    const k = ((rgb[j]>>2)<<12)|((rgb[j+1]>>2)<<6)|(rgb[j+2]>>2);
    freq.set(k, (freq.get(k)||0) + 1);
  }
  const top = [...freq.keys()].sort((a,b)=>freq.get(b)-freq.get(a)).slice(0,256);
  const palette = new Uint8Array(256*3);
  const palMap  = new Map();
  top.forEach((k, idx) => {
    const r6=(k>>12)&63, g6=(k>>6)&63, b6=k&63;
    palette[idx*3]   = (r6<<2)|(r6>>4);
    palette[idx*3+1] = (g6<<2)|(g6>>4);
    palette[idx*3+2] = (b6<<2)|(b6>>4);
    palMap.set(k, idx);
  });
  // Map pixels to palette indices with nearest-color fallback
  const indices = new Uint8Array(np);
  const cache = new Map();
  for (let i = 0, j = 0; i < np; i++, j += 3) {
    const k = ((rgb[j]>>2)<<12)|((rgb[j+1]>>2)<<6)|(rgb[j+2]>>2);
    let idx = palMap.get(k);
    if (idx === undefined) {
      idx = cache.get(k);
      if (idx === undefined) {
        let best = Infinity;
        const r=rgb[j],g=rgb[j+1],b=rgb[j+2];
        for (let p2=0; p2<top.length*3; p2+=3) {
          const dr=r-palette[p2],dg=g-palette[p2+1],db=b-palette[p2+2];
          const d=dr*dr+dg*dg+db*db;
          if (d<best){best=d;idx=p2/3;}
        }
        cache.set(k, idx);
      }
    }
    indices[i] = idx;
  }
  // LZW encode
  const lzwMin=8, clearCode=256, eofCode=257;
  const lzwOut=[];
  let lBuf=0, lBits=0;
  const wb = (code,n) => { lBuf|=code<<lBits; lBits+=n; while(lBits>=8){lzwOut.push(lBuf&0xFF);lBuf>>>=8;lBits-=8;} };
  let codeSize=9, nextCode=258, limit=512, lzwTable=new Map();
  const resetLzw = () => { lzwTable.clear(); nextCode=258; codeSize=9; limit=512; };
  resetLzw(); wb(clearCode, codeSize);
  let prefix = indices[0];
  for (let i=1; i<np; i++) {
    const c=indices[i], key=(prefix<<8)|c;
    const existing=lzwTable.get(key);
    if (existing !== undefined) { prefix=existing; }
    else {
      wb(prefix, codeSize);
      if (nextCode > 4095) { wb(clearCode, codeSize); resetLzw(); }
      else { lzwTable.set(key, nextCode++); if (nextCode>limit && codeSize<12){codeSize++;limit<<=1;} }
      prefix = c;
    }
  }
  wb(prefix, codeSize); wb(eofCode, codeSize);
  if (lBits>0) lzwOut.push(lBuf&0xFF);
  // Build GIF89a
  const out = [0x47,0x49,0x46,0x38,0x39,0x61, w&0xFF,(w>>8)&0xFF, h&0xFF,(h>>8)&0xFF, 0xF7,0,0];
  for (let i=0; i<768; i++) out.push(palette[i]);
  out.push(0x2C, 0,0,0,0, w&0xFF,(w>>8)&0xFF, h&0xFF,(h>>8)&0xFF, 0, lzwMin);
  for (let i=0; i<lzwOut.length; i+=255) {
    const end=Math.min(i+255, lzwOut.length); out.push(end-i);
    for (let j=i; j<end; j++) out.push(lzwOut[j]);
  }
  out.push(0, 0x3B);
  cb(new Blob([new Uint8Array(out)], {type:'image/gif'}));
}
