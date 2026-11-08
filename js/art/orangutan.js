/* Bakti, bayi orang utan kalimantan. Digambar dengan kode (kanvas), tanpa file gambar.
   Anatomi kartun tetap mengikuti alam: rambut jingga kemerahan yang panjang dan menjuntai,
   lengan jauh lebih panjang dari kaki, wajah kulit gelap dengan lingkar mata dan moncong pucat
   (khas anak orang utan), rambut kepala berdiri, tangan dan kaki sama-sama bisa menggenggam,
   dan TIDAK berekor (kera besar tidak punya ekor). */
(function () {
  'use strict';
  const S = window.SHB, A = (S.Art = S.Art || {});

  const C = {
    hair: '#d6631f', hairHi: '#f2a04f', hairLo: '#a4461b', line: '#4a1d08',
    skin: '#4b3129', skinHi: '#6e4c3f', pale: '#ebb893', paleLo: '#c98e6c',
    eye: '#231008', belly: '#bf561f'
  };
  A.OU_COLORS = C;
  const L = { torso: 56, upper: 38, fore: 37, thigh: 22, shin: 21, headR: 22 };
  const D2R = Math.PI / 180;
  const dir = (a, len) => ({ x: Math.sin(a * D2R) * len, y: Math.cos(a * D2R) * len });
  const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  function rot(x, y, deg) { const t = -deg * D2R, c = Math.cos(t), s = Math.sin(t); return { x: x * c - y * s, y: x * s + y * c }; }

  /* Sudut sendi dalam derajat: 0 = ke bawah, 90 = ke kanan layar, 180 = ke atas, -90 = ke kiri.
     la/ll = lengan/kaki di sisi KIRI layar; ra/rl dicerminkan otomatis bila tidak ditulis. */
  const POSES = {
    sit:      { la: [-20, 10], ll: [-74, 30], face: 'happy' },
    idle:     { la: [-14, 4], ll: [-74, 30], face: 'neutral' },
    hang:     { la: [-166, -178], ll: [-16, 4], grip: 'lr', face: 'happy' },
    hangOne:  { la: [-166, -178], ra: [28, 14], ll: [-18, 4], rl: [26, 8], grip: 'l', face: 'happy' },
    reach:    { la: [-166, -178], ra: [148, 162], ll: [-34, 8], rl: [44, 14], grip: 'l', face: 'focus', body: 4 },
    climb:    { la: [-150, -174], ra: [118, 150], ll: [-62, 18], rl: [58, -22], grip: 'lr', face: 'focus', body: -4 },
    climb2:   { la: [-118, -150], ra: [150, 174], ll: [-58, 22], rl: [62, -18], grip: 'lr', face: 'focus', body: 4 },
    eat:      { la: [-20, 10], ra: [24, -156], ll: [-74, 30], front: 'r', face: 'chew', hand: 'r' },
    tool:     { la: [-20, 10], ra: [72, 94], ll: [-74, 30], face: 'focus', look: 0.6, hand: 'r' },
    umbrella: { la: [-20, 10], ra: [175, 180], ll: [-74, 30], face: 'happy', hand: 'r', grip: 'r' },
    beg:      { la: [-20, 10], ra: [42, 74], ll: [-74, 30], face: 'beg', head: 10, hand: 'r', open: 'r' },
    sleep:    { la: [-34, 64], ra: [34, -64], ll: [-74, 34], front: 'lr', face: 'sleep', head: 16 },
    scratch:  { la: [-20, 10], ra: [137, -133], ll: [-74, 30], front: 'r', face: 'neutral', look: -0.3 },
    bend:     { la: [-112, -152], ra: [112, 152], ll: [-74, 30], face: 'focus', grip: 'lr' },
    surprise: { la: [-46, -10], ll: [-74, 30], face: 'surprise' },
    sad:      { la: [-14, 18], ll: [-74, 30], face: 'sad', head: -6 },
    wave:     { la: [-20, 10], ra: [128, 168], ll: [-74, 30], face: 'happy', open: 'r' },
    swing:    { la: [-160, -172], ra: [-176, 176], ll: [-40, -10], rl: [8, -24], grip: 'lr', face: 'happy', body: 12 },
    lookBack: { la: [-166, -178], ra: [24, 12], ll: [-16, 4], rl: [24, 6], grip: 'l', face: 'happy', look: 0.9, head: -6 }
  };
  A.OU_POSES = POSES;

  function norm(p) {
    p = typeof p === 'string' ? POSES[p] || POSES.sit : p;
    const la = p.la || [-20, 10], ll = p.ll || [-74, 30];
    return {
      body: p.body || 0, head: p.head || 0, la, ll,
      ra: p.ra || [-la[0], -la[1]], rl: p.rl || [-ll[0], -ll[1]],
      front: p.front || '', grip: p.grip || '', open: p.open || '', hand: p.hand || 'r',
      face: p.face || 'happy', look: p.look || 0
    };
  }
  A.ouPose = norm;

  /* Campuran dua pose (untuk transisi gerak yang halus). */
  A.ouMix = function (pa, pb, t) {
    const a = norm(pa), b = norm(pb), m = (x, y) => x + (y - x) * t;
    const arr = (x, y) => [m(x[0], y[0]), m(x[1], y[1])];
    const pick = t < 0.5 ? a : b;
    return { body: m(a.body, b.body), head: m(a.head, b.head), la: arr(a.la, b.la), ra: arr(a.ra, b.ra), ll: arr(a.ll, b.ll), rl: arr(a.rl, b.rl),
      front: pick.front, grip: pick.grip, open: pick.open, hand: pick.hand, face: pick.face, look: m(a.look, b.look) };
  };

  /* Posisi sendi relatif terhadap pinggul (satuan figur, sebelum skala). */
  A.ouJoints = function (pose) {
    const P = norm(pose), b = P.body, R = (x, y) => rot(x, y, b);
    const neck = R(0, -L.torso);
    const sl = R(-16, -L.torso + 8), sr = R(16, -L.torso + 8);
    const hl = R(-11, -6), hr = R(11, -6);
    const el = add(sl, dir(P.la[0] + b, L.upper)), wl = add(el, dir(P.la[1] + b, L.fore));
    const er = add(sr, dir(P.ra[0] + b, L.upper)), wr = add(er, dir(P.ra[1] + b, L.fore));
    const kl = add(hl, dir(P.ll[0] + b, L.thigh)), fl = add(kl, dir(P.ll[1] + b, L.shin));
    const kr = add(hr, dir(P.rl[0] + b, L.thigh)), fr = add(kr, dir(P.rl[1] + b, L.shin));
    const head = add(neck, rot(0, -19, b + P.head * 0.3));
    return { P, neck, sl, sr, el, er, wl, wr, hl, hr, kl, kr, fl, fr, head };
  };

  /* Titik genggam (tengah kedua tangan, atau satu tangan) — untuk menggantung Bakti di dahan. */
  A.ouGrip = function (pose, s, flip) {
    const j = A.ouJoints(pose), P = j.P, f = flip ? -1 : 1;
    const hand = (w, e) => { const v = norm2(w.x - e.x, w.y - e.y); return { x: w.x + v.x * 5, y: w.y + v.y * 5 }; };
    const l = hand(j.wl, j.el), r = hand(j.wr, j.er);
    let p;
    if (P.grip.includes('l') && P.grip.includes('r')) p = { x: (l.x + r.x) / 2, y: Math.min(l.y, r.y) };
    else if (P.grip.includes('r')) p = r; else p = l;
    return { x: p.x * s * f, y: p.y * s };
  };
  function norm2(x, y) { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }

  function line(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }

  /* Untaian rambut menjuntai di sepanjang ruas tubuh. */
  function strands(ctx, a, b, w, n, len, seed) {
    const v = norm2(b.x - a.x, b.y - a.y), px = -v.y, py = v.x;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const t = 0.12 + (0.8 * (i + 0.5)) / n;
      const side = i % 2 ? 1 : -1;
      const sx = a.x + (b.x - a.x) * t + px * side * w * 0.42, sy = a.y + (b.y - a.y) * t + py * side * w * 0.42;
      const k = len * (0.75 + 0.5 * (((i * 7 + seed) % 5) / 5));
      const dx = px * side * 0.55, dy = py * side * 0.55 + 1;
      const l = Math.hypot(dx, dy) || 1;
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + (dx / l) * k * 0.6 + v.x * 2, sy + (dy / l) * k * 0.6 + v.y * 2, sx + (dx / l) * k, sy + (dy / l) * k);
    }
    ctx.stroke();
  }

  function limb(ctx, a, b, c, w1, w2, seed) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? C.hair : C.line;
      const k = pass ? 0 : 5;
      ctx.lineWidth = w1 + k; line(ctx, [a, b]);
      ctx.lineWidth = w2 + k; line(ctx, [b, c]);
      ctx.lineWidth = pass ? 2.4 : 5.2;
      strands(ctx, a, b, w1, 6, 8, seed);
      strands(ctx, b, c, w2, 6, 7.5, seed + 3);
    }
    ctx.strokeStyle = C.hairHi; ctx.globalAlpha = 0.55; ctx.lineWidth = Math.max(2, w1 * 0.22);
    const off = (p, q) => { const v = norm2(q.x - p.x, q.y - p.y); return { x: -v.y * w1 * 0.22, y: v.x * w1 * 0.22 }; };
    const o1 = off(a, b);
    line(ctx, [{ x: a.x + o1.x, y: a.y + o1.y }, { x: b.x + o1.x * 0.8, y: b.y + o1.y * 0.8 }]);
    ctx.globalAlpha = 1;
  }

  function hand(ctx, w, e, grip, open) {
    const v = norm2(w.x - e.x, w.y - e.y), ang = Math.atan2(v.y, v.x);
    ctx.save(); ctx.translate(w.x + v.x * 4.5, w.y + v.y * 4.5); ctx.rotate(ang);
    ctx.fillStyle = C.skin; ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    if (grip) {
      ctx.beginPath(); ctx.ellipse(1, 0, 6.6, 6.2, 0, 0, S.TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = C.skinHi; ctx.lineWidth = 1.3;
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(2, i * 2.6); ctx.lineTo(6, i * 2.6); ctx.stroke(); }
    } else if (open) {
      ctx.beginPath(); ctx.ellipse(2.5, 0, 7.5, 6.4, 0, 0, S.TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#8a5f50';
      ctx.beginPath(); ctx.ellipse(2.5, 0.5, 4.6, 3.8, 0, 0, S.TAU); ctx.fill();
      ctx.fillStyle = C.skin; ctx.strokeStyle = C.line; ctx.lineWidth = 1.6;
      for (let i = -1.5; i <= 1.5; i++) { ctx.beginPath(); ctx.ellipse(10, i * 2.8, 3.2, 1.6, 0, 0, S.TAU); ctx.fill(); ctx.stroke(); }
    } else {
      ctx.beginPath(); ctx.ellipse(2.5, 0, 7.4, 5.6, 0, 0, S.TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = C.skinHi; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(5, -2.6); ctx.lineTo(9, -2.2); ctx.moveTo(5.6, 0); ctx.lineTo(9.6, 0.4); ctx.moveTo(5, 2.6); ctx.lineTo(9, 2.8); ctx.stroke();
    }
    ctx.restore();
  }

  function foot(ctx, f, k, side) {
    const v = norm2(f.x - k.x, f.y - k.y);
    ctx.save(); ctx.translate(f.x + v.x * 3, f.y + v.y * 3);
    ctx.rotate(Math.atan2(v.y, v.x) - side * 0.5);
    ctx.fillStyle = C.skin; ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(3, 0, 7.6, 5.4, 0, 0, S.TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.skinHi; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(6, -2.5); ctx.lineTo(10, -3); ctx.moveTo(6.5, 0); ctx.lineTo(10.4, 0); ctx.stroke();
    ctx.restore();
  }

  function torso(ctx, body) {
    ctx.save(); ctx.rotate(-body * D2R);
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(0, -L.torso - 3);
      ctx.bezierCurveTo(16, -L.torso - 3, 22, -44, 24, -25);
      ctx.bezierCurveTo(26, -6, 22, 9, 0, 10);
      ctx.bezierCurveTo(-22, 9, -26, -6, -24, -25);
      ctx.bezierCurveTo(-22, -44, -16, -L.torso - 3, 0, -L.torso - 3);
    };
    const edge = (y) => (y < -25 ? 15 + 9 * ((y + L.torso) / (L.torso - 25)) : 24 - 4 * ((y + 25) / 35));
    const tufts = () => {
      ctx.beginPath();
      for (let y = -42, i = 0; y <= 4; y += 7.5, i++) {
        for (const s of [-1, 1]) {
          const x = edge(y) * s - s * 1.5;
          ctx.moveTo(x, y - 5); ctx.lineTo(x + s * (6 + (i % 2) * 2.5), y + 6); ctx.lineTo(x - s * 1, y + 4);
        }
      }
      ctx.moveTo(-14, 7); ctx.lineTo(-10, 15); ctx.lineTo(-6, 9);
      ctx.moveTo(14, 7); ctx.lineTo(10, 15); ctx.lineTo(6, 9);
      ctx.moveTo(-3, 9); ctx.lineTo(0, 16); ctx.lineTo(3, 9);
    };
    ctx.lineJoin = 'round';
    ctx.strokeStyle = C.line; ctx.lineWidth = 5; path(); ctx.stroke(); tufts(); ctx.stroke();
    ctx.fillStyle = C.hair; path(); ctx.fill(); tufts(); ctx.fill();
    // perut berkulit gelap dengan rambut jarang
    ctx.fillStyle = C.belly;
    ctx.beginPath(); ctx.ellipse(0, -16, 12.5, 17, 0, 0, S.TAU); ctx.fill();
    ctx.strokeStyle = C.hairLo; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.8;
    ctx.beginPath();
    for (const s of [-1, 1]) {
      ctx.moveTo(s * 9, -44); ctx.quadraticCurveTo(s * 16, -30, s * 14, -12);
      ctx.moveTo(s * 15, -36); ctx.quadraticCurveTo(s * 21, -22, s * 18, -6);
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.hairHi; ctx.globalAlpha = 0.5; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-12, -48); ctx.quadraticCurveTo(-19, -36, -19, -24); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.restore();
  }

  function head(ctx, h, P, o) {
    ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(-(P.body + P.head) * D2R);
    const lk = P.look * 4.2, r = L.headR;
    const t = o.t || 0;
    const blink = P.face === 'sleep' || ((t + (o.blinkSeed || 0)) % 4.3) < 0.13;
    // rambut kepala berdiri (khas anak orang utan) + bentuk kepala
    const crown = () => {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, S.TAU);
      const n = 7;
      for (let i = 0; i < n; i++) {
        const a = (-158 + (116 * i) / (n - 1)) * D2R, w = 0.2, L2 = r + 9 + (i % 2 ? 2 : 5) + (i === 3 ? 3 : 0);
        ctx.moveTo(Math.cos(a - w) * (r - 3), Math.sin(a - w) * (r - 3));
        ctx.lineTo(Math.cos(a + (i - 3) * 0.04) * L2, Math.sin(a + (i - 3) * 0.04) * L2);
        ctx.lineTo(Math.cos(a + w) * (r - 3), Math.sin(a + w) * (r - 3));
      }
      // jambang di pipi
      for (const s of [-1, 1]) { ctx.moveTo(s * (r - 2), 2); ctx.lineTo(s * (r + 6), 10); ctx.lineTo(s * (r - 4), 12); }
    };
    ctx.lineJoin = 'round';
    ctx.strokeStyle = C.line; ctx.lineWidth = 5; crown(); ctx.stroke();
    ctx.fillStyle = C.hair; crown(); ctx.fill();
    ctx.strokeStyle = C.hairHi; ctx.globalAlpha = 0.6; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, r - 5, -2.6, -1.5); ctx.stroke(); ctx.globalAlpha = 1;
    // telinga kecil
    ctx.fillStyle = C.skin; ctx.strokeStyle = C.line; ctx.lineWidth = 1.8;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * (r - 3) + lk * 0.3, 1, 3.6, 4.6, 0, 0, S.TAU); ctx.fill(); ctx.stroke(); }
    // wajah kulit gelap
    ctx.fillStyle = C.skin; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lk, -15);
    ctx.bezierCurveTo(lk + 12, -17, lk + 18, -8, lk + 17, 3);
    ctx.bezierCurveTo(lk + 16, 15, lk + 9, 22, lk, 22);
    ctx.bezierCurveTo(lk - 9, 22, lk - 16, 15, lk - 17, 3);
    ctx.bezierCurveTo(lk - 18, -8, lk - 12, -17, lk, -15);
    ctx.fill(); ctx.stroke();
    // lingkar mata dan moncong pucat
    ctx.fillStyle = C.pale;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(lk + s * 7.4, -3, 7.2, 6.6, s * 0.15, 0, S.TAU); ctx.fill(); }
    ctx.beginPath(); ctx.ellipse(lk * 1.1, 12, 10.5, 8.6, 0, 0, S.TAU); ctx.fill();
    ctx.fillStyle = C.paleLo; ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.ellipse(lk * 1.1, 16, 7.5, 3.6, 0, 0, S.TAU); ctx.fill(); ctx.globalAlpha = 1;
    // mata
    const ex = (s) => lk * 1.15 + s * 7;
    ctx.strokeStyle = C.eye; ctx.fillStyle = C.eye; ctx.lineCap = 'round';
    if (blink) {
      ctx.lineWidth = 1.8;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(ex(s), -3, 3.6, 0.2, Math.PI - 0.2); ctx.stroke(); }
    } else {
      const big = P.face === 'beg' || P.face === 'surprise' ? 1.2 : 1;
      for (const s of [-1, 1]) {
        ctx.fillStyle = C.eye; ctx.beginPath(); ctx.arc(ex(s) + P.look * 0.8, -3, 4.9 * big, 0, S.TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex(s) + P.look * 0.8 + 1.6, -4.8, 1.8 * big, 0, S.TAU); ctx.fill();
      }
    }
    // alis untuk ekspresi
    ctx.strokeStyle = C.skin; ctx.lineWidth = 2;
    if (P.face === 'sad' || P.face === 'beg') {
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ex(s) - s * 5, -11); ctx.lineTo(ex(s) + s * 3, -13.5); ctx.stroke(); }
    } else if (P.face === 'surprise') {
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(ex(s), -10, 4, 3.6, 5.8); ctx.stroke(); }
    } else if (P.face === 'focus') {
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(ex(s) - s * 4, -11.5); ctx.lineTo(ex(s) + s * 4, -10); ctx.stroke(); }
    }
    // hidung
    ctx.fillStyle = C.skin;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(lk * 1.1 + s * 2.4, 8.5, 1.4, 1.1, 0, 0, S.TAU); ctx.fill(); }
    // mulut
    ctx.strokeStyle = C.line; ctx.lineWidth = 1.9; ctx.fillStyle = '#6a2f22';
    const mx = lk * 1.1, my = 15;
    const f = P.face;
    ctx.beginPath();
    if (f === 'happy') { ctx.moveTo(mx - 5.5, my - 0.5); ctx.quadraticCurveTo(mx, my + 5, mx + 5.5, my - 0.5); ctx.stroke(); }
    else if (f === 'sad') { ctx.moveTo(mx - 4.5, my + 2.5); ctx.quadraticCurveTo(mx, my - 1.5, mx + 4.5, my + 2.5); ctx.stroke(); }
    else if (f === 'surprise') { ctx.ellipse(mx, my + 1, 2.6, 3.4, 0, 0, S.TAU); ctx.fill(); ctx.stroke(); }
    else if (f === 'beg') { ctx.ellipse(mx, my + 1, 2.2, 1.8, 0, 0, S.TAU); ctx.fill(); ctx.stroke(); }
    else if (f === 'chew') {
      const open = Math.sin(t * 15) > 0;
      if (open) { ctx.ellipse(mx, my + 1, 3.6, 2.6, 0, 0, S.TAU); ctx.fill(); ctx.stroke(); }
      else { ctx.moveTo(mx - 4, my + 1); ctx.lineTo(mx + 4, my + 1); ctx.stroke(); }
    } else if (f === 'sleep') { ctx.moveTo(mx - 3, my + 1); ctx.quadraticCurveTo(mx, my + 2.5, mx + 3, my + 1); ctx.stroke(); }
    else { ctx.moveTo(mx - 4, my + 1); ctx.quadraticCurveTo(mx, my + 2, mx + 4, my + 1); ctx.stroke(); }
    ctx.restore();
  }

  /* Gambar Bakti. (x, y) = titik pinggul di dunia; s = skala (1 ≈ tinggi 150 satuan saat duduk tegak). */
  A.drawOrangutan = function (ctx, x, y, s, pose, o) {
    o = o || {};
    const j = A.ouJoints(pose), P = j.P;
    ctx.save();
    ctx.translate(x, y);
    if (o.flip) ctx.scale(-1, 1);
    ctx.scale(s, s);
    if (o.alpha != null) ctx.globalAlpha = o.alpha;
    if (o.shadow) {
      ctx.fillStyle = 'rgba(20,30,10,.28)';
      ctx.beginPath(); ctx.ellipse(0, o.shadow, 44, 9, 0, 0, S.TAU); ctx.fill();
    }
    // kaki di belakang badan
    limb(ctx, j.hl, j.kl, j.fl, 15, 12, 1); foot(ctx, j.fl, j.kl, -1);
    limb(ctx, j.hr, j.kr, j.fr, 15, 12, 2); foot(ctx, j.fr, j.kr, 1);
    const arm = (side) => {
      const sh = side === 'l' ? j.sl : j.sr, el = side === 'l' ? j.el : j.er, wr = side === 'l' ? j.wl : j.wr;
      limb(ctx, sh, el, wr, 15, 12.5, side === 'l' ? 4 : 6);
      hand(ctx, wr, el, P.grip.includes(side), P.open.includes(side));
    };
    if (!P.front.includes('l')) arm('l');
    if (!P.front.includes('r')) arm('r');
    torso(ctx, P.body);
    head(ctx, j.head, P, o);
    if (P.front.includes('l')) arm('l');
    if (P.front.includes('r')) arm('r');
    if (o.hold) drawHeld(ctx, j, P, o.hold, o.t || 0);
    ctx.restore();
    return j;
  };

  function drawHeld(ctx, j, P, hold, t) {
    const side = P.hand === 'l' ? 'l' : 'r';
    const w = side === 'l' ? j.wl : j.wr, e = side === 'l' ? j.el : j.er;
    const v = norm2(w.x - e.x, w.y - e.y);
    const hx = w.x + v.x * 6, hy = w.y + v.y * 6;
    if (hold === 'stick') {
      ctx.strokeStyle = '#4a2e18'; ctx.lineCap = 'round'; ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(hx - v.x * 6, hy - v.y * 6); ctx.lineTo(hx + v.x * 46, hy + v.y * 46); ctx.stroke();
      ctx.strokeStyle = '#8a6239'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(hx - v.x * 4, hy - v.y * 4); ctx.lineTo(hx + v.x * 44, hy + v.y * 44); ctx.stroke();
    } else if (hold === 'umbrella') {
      ctx.save(); ctx.translate(hx, hy - 2);
      A.drawBigLeaf(ctx, 0, 0, 0.9, Math.PI + 0.12, true);
      ctx.restore();
    } else if (hold === 'leafSponge') {
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.atan2(v.y, v.x));
      ctx.fillStyle = '#5f9a3c'; ctx.strokeStyle = '#26431b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(10, 0, 12, 8, 0.3, 0, S.TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#9fd8ff'; ctx.beginPath(); ctx.arc(14, 6, 2.2, 0, S.TAU); ctx.fill();
      ctx.restore();
    } else if (typeof hold === 'string' && A.drawFood) {
      A.drawFood(ctx, hold, hx, hy, 13, t);
    }
  }
})();
