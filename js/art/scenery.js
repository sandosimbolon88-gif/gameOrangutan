/* Latar: hutan hujan Kalimantan, nursery, pulau pra-pelepasliaran, dan hutan pelepasliaran.
   Lapisan statis digambar sekali ke kanvas cadangan (cache) supaya ringan. */
(function () {
  'use strict';
  const S = window.SHB, A = (S.Art = S.Art || {});
  const cache = {};

  A.layer = function (key, draw) {
    const R = S.R, k = key + '@' + R;
    if (cache[k]) return cache[k];
    const c = S.makeCanvas(S.VW * R, S.VH * R), ctx = c.getContext('2d');
    ctx.scale(R, R);
    draw(ctx, S.VW, S.VH);
    return (cache[k] = c);
  };
  A.dropLayer = function (prefix) { for (const k of Object.keys(cache)) if (k.startsWith(prefix)) delete cache[k]; };
  A.blit = function (ctx, layer) { ctx.drawImage(layer, 0, 0, S.VW, S.VH); };

  A.sky = function (ctx, w, h, top, bottom, y0, y1) {
    const g = ctx.createLinearGradient(0, y0 || 0, 0, y1 || h);
    g.addColorStop(0, top); g.addColorStop(1, bottom);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  };

  /* Siluet tajuk hutan di kejauhan (beberapa lapis, makin dekat makin gelap). */
  A.farForest = function (ctx, w, h, layers, seed) {
    const rnd = S.rng(seed || 11);
    for (const L of layers) {
      ctx.fillStyle = L.col;
      ctx.beginPath(); ctx.moveTo(0, h);
      let x = -40;
      while (x < w + 60) {
        const r = L.r * (0.7 + rnd() * 0.6), y = L.y + (rnd() - 0.5) * L.r * 0.9;
        ctx.lineTo(x, y + r * 0.3);
        ctx.arc(x + r, y + r * 0.3, r, Math.PI, 0);
        x += r * (1.3 + rnd() * 0.5);
      }
      ctx.lineTo(w + 60, h); ctx.closePath(); ctx.fill();
      if (L.trunks) {
        ctx.fillStyle = L.trunkCol || L.col;
        for (let i = 0; i < L.trunks; i++) { const tx = rnd() * w, tw = 6 + rnd() * 10; ctx.fillRect(tx, L.y, tw, h - L.y); }
      }
    }
  };

  A.rays = function (ctx, w, h, alpha, seed) {
    const rnd = S.rng(seed || 5);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const x = 200 + rnd() * (w - 300), wd = 40 + rnd() * 90;
      const g = ctx.createLinearGradient(x, 0, x - 260, h);
      g.addColorStop(0, `rgba(255,248,210,${alpha})`); g.addColorStop(1, 'rgba(255,248,210,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + wd, 0); ctx.lineTo(x + wd - 300, h); ctx.lineTo(x - 300, h); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  A.fern = function (ctx, x, y, s, col, flip) {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
    for (let f = 0; f < 5; f++) {
      const a = -2.6 + f * 0.42;
      ctx.save(); ctx.rotate(a + Math.PI / 2);
      ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-10, -60, 8, -110); ctx.stroke();
      for (let i = 1; i < 10; i++) {
        const t = i / 10, px = -10 * 2 * t * (1 - t) + 8 * t * t, py = -110 * t;
        A.drawLeaf(ctx, px, py, 24 * (1 - t * 0.6), -Math.PI / 2 - 1.1, col, null, 0.3);
        A.drawLeaf(ctx, px, py, 24 * (1 - t * 0.6), -Math.PI / 2 + 1.1, col, null, 0.3);
      }
      ctx.restore();
    }
    ctx.restore();
  };

  A.grass = function (ctx, x0, x1, y, h, col, seed) {
    const rnd = S.rng(seed || 2);
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = x0; x < x1; x += 7) {
      const hh = h * (0.5 + rnd() * 0.7), lean = (rnd() - 0.5) * 14;
      ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * 0.3, y - hh * 0.6, x + lean, y - hh);
    }
    ctx.stroke();
  };

  /* Batang kayu berlumut, tempat makanan lewat di nursery. */
  A.mossLog = function (ctx, x0, x1, y, hgt) {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x0, y - hgt / 2); ctx.lineTo(x1, y - hgt / 2); ctx.lineTo(x1, y + hgt / 2); ctx.lineTo(x0, y + hgt / 2); ctx.closePath();
    const g = ctx.createLinearGradient(0, y - hgt / 2, 0, y + hgt / 2);
    g.addColorStop(0, '#8a6342'); g.addColorStop(0.5, '#6e4b30'); g.addColorStop(1, '#3e2918');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#2b1a0e'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 2;
    const rnd = S.rng(9);
    for (let x = x0 + 20; x < x1; x += 40 + rnd() * 30) { ctx.beginPath(); ctx.moveTo(x, y - hgt * 0.2); ctx.lineTo(x + 50, y - hgt * 0.15 + rnd() * 6); ctx.stroke(); }
    ctx.fillStyle = '#76a845';
    for (let x = x0; x < x1; x += 22) { ctx.beginPath(); ctx.ellipse(x + rnd() * 10, y - hgt / 2 + 2, 14 + rnd() * 10, 6, 0, 0, S.TAU); ctx.fill(); }
    ctx.fillStyle = '#9ccc5c';
    for (let x = x0; x < x1; x += 46) { ctx.beginPath(); ctx.ellipse(x + rnd() * 20, y - hgt / 2, 9, 4, 0, 0, S.TAU); ctx.fill(); }
    // penampang ujung kayu
    for (const ex of [x0, x1]) {
      ctx.beginPath(); ctx.ellipse(ex, y, hgt * 0.28, hgt / 2, 0, 0, S.TAU);
      ctx.fillStyle = '#c99a63'; ctx.fill(); ctx.strokeStyle = '#2b1a0e'; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = '#9a6d3e'; ctx.lineWidth = 1.5;
      for (const k of [0.62, 0.32]) { ctx.beginPath(); ctx.ellipse(ex, y, hgt * 0.28 * k, hgt / 2 * k, 0, 0, S.TAU); ctx.stroke(); }
    }
    ctx.restore();
  };

  const FAR_DAY = [
    { y: 300, r: 70, col: '#a9cfc4' },
    { y: 360, r: 80, col: '#86b8a6', trunks: 10, trunkCol: '#7aa797' },
    { y: 430, r: 90, col: '#5f9a7e', trunks: 8, trunkCol: '#4f876d' }
  ];

  /* ---------- Pelajaran 1: nursery di tepi hutan ---------- */
  A.bgNursery = function (ctx, w, h) {
    A.sky(ctx, w, h, '#a7d9d6', '#eef3d6', 0, 520);
    A.farForest(ctx, w, h, FAR_DAY, 21);
    A.rays(ctx, w, h, 0.16, 4);
    // tanah
    const g = ctx.createLinearGradient(0, 560, 0, h);
    g.addColorStop(0, '#6f9a45'); g.addColorStop(1, '#3f6a2c');
    ctx.fillStyle = g; ctx.fillRect(0, 560, w, h - 560);
    A.drawTrunk(ctx, 1450, -20, 640, 90, { buttress: true, seed: 4 });
    A.drawTrunk(ctx, 60, -20, 620, 70, { buttress: true, seed: 8 });
    A.drawFoliage(ctx, 1460, 40, 190, 31);
    A.drawFoliage(ctx, 60, 20, 170, 32);
    A.drawLiana(ctx, 1450, 120, 1180, 0, 160, 6);
    A.fern(ctx, 1290, 640, 1.1, '#3f7a35');
    A.fern(ctx, 980, 620, 0.8, '#4e8c3c', true);
    // panggung kayu nursery tempat Bakti duduk
    ctx.fillStyle = '#5a3b22';
    for (const px of [170, 600]) { ctx.fillRect(px - 9, 560, 18, 160); }
    ctx.strokeStyle = '#2b1a0e'; ctx.lineWidth = 3;
    for (const px of [170, 600]) ctx.strokeRect(px - 9, 560, 18, 160);
    ctx.fillStyle = '#8b6440';
    S.roundRect(ctx, 120, 600, 530, 34, 8); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#5a3b22'; ctx.lineWidth = 2;
    for (let x = 170; x < 650; x += 52) { ctx.beginPath(); ctx.moveTo(x, 602); ctx.lineTo(x, 632); ctx.stroke(); }
    // tiang panjat dan tali (latihan pertama)
    ctx.fillStyle = '#6b4a2f'; ctx.fillRect(160, 250, 16, 360); ctx.fillRect(594, 250, 16, 360);
    ctx.strokeStyle = '#2b1a0e'; ctx.lineWidth = 3; ctx.strokeRect(160, 250, 16, 360); ctx.strokeRect(594, 250, 16, 360);
    ctx.fillStyle = '#7b5636'; S.roundRect(ctx, 150, 240, 470, 22, 8); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c9a36a'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(260, 262); ctx.quadraticCurveTo(300, 420, 330, 470); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(500, 262); ctx.quadraticCurveTo(470, 360, 520, 420); ctx.stroke();
    // ban bekas sebagai ayunan latihan
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.ellipse(520, 440, 34, 22, 0.2, 0, S.TAU); ctx.stroke();
    A.grass(ctx, 0, w, 760, 30, '#4f8a35', 3);
    A.mossLog(ctx, -20, w + 20, 812, 70);
    A.grass(ctx, 0, w, 900, 40, '#3c6f2b', 6);
  };

  /* ---------- Hutan kanopi (pelajaran cari makan & layar awal) ---------- */
  A.bgCanopyBack = function (ctx, w, h) {
    A.sky(ctx, w, h, '#9fd6e0', '#e6f2d2', 0, 600);
    A.farForest(ctx, w, h, [
      { y: 230, r: 80, col: '#b3d6c8' },
      { y: 330, r: 90, col: '#8fbea8', trunks: 12, trunkCol: '#82b19b' },
      { y: 460, r: 100, col: '#679f80', trunks: 10, trunkCol: '#5a8f72' },
      { y: 620, r: 110, col: '#4a8261' }
    ], 41);
    A.rays(ctx, w, h, 0.18, 9);
    A.drawTrunk(ctx, 1000, -10, h + 10, 60, { seed: 12, col: '#5f4a3a', dark: '#46362a', hi: '#7a6450', outline: false });
    A.drawFoliage(ctx, 1000, 30, 150, 51, ['#3c7a4d', '#4d8f55', '#66a35d', '#8ec46a']);
  };

  /* ---------- Pulau pra-pelepasliaran ---------- */
  A.bgIsland = function (ctx, w, h) {
    A.sky(ctx, w, h, '#8fd0e6', '#eaf6e0', 0, 360);
    A.farForest(ctx, w, h, [
      { y: 210, r: 60, col: '#b6d9c9' },
      { y: 260, r: 70, col: '#8fbfa6', trunks: 14, trunkCol: '#7fb098' }
    ], 61);
    // sungai/parit yang mengelilingi pulau (orang utan tidak bisa berenang)
    const wg = ctx.createLinearGradient(0, 300, 0, h);
    wg.addColorStop(0, '#6fb2b8'); wg.addColorStop(1, '#2f7280');
    ctx.fillStyle = wg; ctx.fillRect(0, 300, w, h - 300);
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
    const rnd = S.rng(62);
    for (let i = 0; i < 40; i++) { const x = rnd() * w, y = 320 + rnd() * 560; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30 + rnd() * 40, y); ctx.stroke(); }
    // pulau
    ctx.fillStyle = '#c9b27a';
    ctx.beginPath(); ctx.ellipse(800, 560, 680, 220, 0, 0, S.TAU); ctx.fill();
    const ig = ctx.createLinearGradient(0, 360, 0, 760);
    ig.addColorStop(0, '#7fb24e'); ig.addColorStop(1, '#4f8a35');
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.ellipse(800, 548, 660, 200, 0, 0, S.TAU); ctx.fill();
    A.grass(ctx, 200, 1400, 742, 26, '#3f7a2c', 63);
    // pohon latar pulau
    A.drawTrunk(ctx, 1290, 150, 560, 46, { seed: 14 });
    A.drawFoliage(ctx, 1290, 160, 130, 66);
    A.drawTrunk(ctx, 300, 180, 560, 40, { seed: 15 });
    A.drawFoliage(ctx, 300, 180, 120, 67);
    A.fern(ctx, 640, 600, 0.75, '#3f7a35');
    A.fern(ctx, 1200, 630, 0.8, '#3f7a35', true);
    A.drawFoliage(ctx, 430, 700, 54, 68, ['#2f6a32', '#3f8a40', '#58a24a', '#86c25a']);
    A.drawFoliage(ctx, 1180, 694, 60, 69, ['#2f6a32', '#3f8a40', '#58a24a', '#86c25a']);
    A.drawFoliage(ctx, 1380, 560, 44, 70, ['#2f6a32', '#3f8a40', '#58a24a', '#86c25a']);
    ctx.fillStyle = '#8f9592'; ctx.strokeStyle = '#2b1a0e'; ctx.lineWidth = 2.5;
    for (const [rx, ry, rr] of [[560, 712, 20], [590, 718, 13], [1010, 716, 16]]) { ctx.beginPath(); ctx.ellipse(rx, ry, rr * 1.4, rr, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  };
  /* tepian sungai dekat pemain */
  A.bgIslandFront = function (ctx, w, h) {
    ctx.fillStyle = '#4c7f34';
    ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, 850); ctx.quadraticCurveTo(400, 820, 800, 846); ctx.quadraticCurveTo(1200, 870, w, 836); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    A.grass(ctx, 0, w, 860, 48, '#2f6224', 64);
    for (const [x, s] of [[60, 1], [1540, 1.1], [1380, 0.8]]) {
      ctx.strokeStyle = '#5b7f2e'; ctx.lineWidth = 5;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + i * 8, h); ctx.quadraticCurveTo(x + i * 10, h - 120 * s, x + i * 14 - 20, h - 190 * s); ctx.stroke(); }
    }
  };

  /* ---------- Hutan pelepasliaran ---------- */
  A.bgRelease = function (ctx, w, h) {
    A.sky(ctx, w, h, '#a5dbe0', '#f0f4d6', 0, 520);
    A.farForest(ctx, w, h, FAR_DAY.concat([{ y: 540, r: 100, col: '#47805e' }]), 71);
    A.rays(ctx, w, h, 0.22, 12);
    const g = ctx.createLinearGradient(0, 640, 0, h);
    g.addColorStop(0, '#5f8f3c'); g.addColorStop(1, '#355f26');
    ctx.fillStyle = g; ctx.fillRect(0, 640, w, h - 640);
    A.drawTrunk(ctx, 1150, -20, 720, 110, { buttress: true, seed: 16 });
    A.drawFoliage(ctx, 1150, 20, 260, 72);
    A.drawFoliage(ctx, 1380, 120, 160, 73);
    A.drawTrunk(ctx, 120, -20, 700, 70, { buttress: true, seed: 17 });
    A.drawFoliage(ctx, 120, 30, 180, 74);
    A.fern(ctx, 300, 700, 1, '#3f7a35');
    A.fern(ctx, 1480, 720, 1.1, '#3f7a35', true);
    A.grass(ctx, 0, w, 900, 50, '#2f6224', 75);
  };

  /* Bayangan tepi layar. */
  A.vignette = function (w, h, R, strength) {
    const c = S.makeCanvas(w * R, h * R), ctx = c.getContext('2d');
    ctx.scale(R, R);
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 1.02);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(5,20,12,${strength})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    return c;
  };
})();
