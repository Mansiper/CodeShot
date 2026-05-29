/* ════════════════════════════════════════════
   PERSPECTIVE + TRAPEZOID
════════════════════════════════════════════ */

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

function computeCorners(iw, ih, cw, ch, tZ, rX, rY, trapL, trapR, trapT, trapB) {
  const focal = Math.max(cw, ch) * 1.4;
  const halfW  = iw / 2;
  const halfH  = ih / 2;
  // trapezoid corner adjustments
  const tL  = trapL  / 100;  // left side height factor
  const tR  = trapR  / 100;  // right side height factor
  const tTop = trapT / 100;  // top side width factor
  const tBot = trapB / 100;  // bottom side width factor

  // Raw corners with trapezoid
  const pts = [
    [-halfW * tTop, -halfH * tL, 0],  // TL
    [ halfW * tTop, -halfH * tR, 0],  // TR
    [ halfW * tBot,  halfH * tR, 0],  // BR
    [-halfW * tBot,  halfH * tL, 0],  // BL
  ];

  const cZ=Math.cos(tZ), sZ=Math.sin(tZ);
  const cX=Math.cos(rX), sX=Math.sin(rX);
  const cY=Math.cos(rY), sY=Math.sin(rY);

  return pts.map(([x,y,z]) => {
    // Z rotation
    let x1=x*cZ-y*sZ, y1=x*sZ+y*cZ, z1=z;
    // X rotation (depth)
    let x2=x1, y2=y1*cX-z1*sX, z2=y1*sX+z1*cX;
    // Y rotation
    let x3=x2*cY+z2*sY, y3=y2, z3=-x2*sY+z2*cY;
    const s = focal / (focal + z3);
    return {x: x3*s + cw/2, y: y3*s + ch/2};
  });
}

function drawIntoQuad(ctx, img, corners) {
  const [TL,TR,BR,BL] = corners;
  const srcH = img.height, srcW = img.width;
  for (let i = 0; i <= srcH; i++) {
    const t = i / srcH;
    const Lx=TL.x+(BL.x-TL.x)*t, Ly=TL.y+(BL.y-TL.y)*t;
    const Rx=TR.x+(BR.x-TR.x)*t, Ry=TR.y+(BR.y-TR.y)*t;
    const dw = Math.sqrt((Rx-Lx)**2+(Ry-Ly)**2);
    if (dw < 0.5) continue;
    const ang = Math.atan2(Ry-Ly, Rx-Lx);
    ctx.setTransform(Math.cos(ang),Math.sin(ang),-Math.sin(ang),Math.cos(ang),Lx,Ly);
    ctx.drawImage(img, 0,i,srcW,1, 0,-0.5,dw,1.5);
  }
  ctx.setTransform(1,0,0,1,0,0);
}

function drawBackground(ctx, w, h) {
  if (state.bgType === 'none') return;
  if (state.bgType === 'solid') {
    ctx.fillStyle = state.bgSolid; ctx.fillRect(0,0,w,h);
  } else {
    const rad = state.gradAngle * Math.PI/180;
    const dx = Math.cos(rad), dy = Math.sin(rad);
    const g = ctx.createLinearGradient(w/2-dx*w/2, h/2-dy*h/2, w/2+dx*w/2, h/2+dy*h/2);
    g.addColorStop(0, state.gradC1); g.addColorStop(1, state.gradC2);
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  }
}
