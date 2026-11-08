/* Benda-benda di game: makanan hutan, makanan manusia, alat, dahan, daun, sarang, kandang angkut, perahu. */
(function () {
  'use strict';
  const S = window.SHB, A = (S.Art = S.Art || {});
  const OUT = '#2b1a0e';

  function circle(ctx, x, y, r, fill, stroke, lw) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, S.TAU);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 3; ctx.stroke(); }
  }
  function shine(ctx, x, y, r) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, -0.6, 0, S.TAU); ctx.fill(); }

  /* Daun sederhana dengan tulang daun. */
  A.drawLeaf = function (ctx, x, y, len, ang, col, dark, w) {
    w = w || 0.38;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.45, -len * w, len, 0);
    ctx.quadraticCurveTo(len * 0.45, len * w, 0, 0);
    ctx.fillStyle = col; ctx.fill();
    if (dark) {
      ctx.strokeStyle = dark; ctx.lineWidth = Math.max(1, len * 0.04);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len * 0.92, 0); ctx.stroke();
    }
    ctx.restore();
  };

  /* Daun lebar (payung hujan / spons). Batang di (x,y), helaian ke arah ang. */
  A.drawBigLeaf = function (ctx, x, y, s, ang, held) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    ctx.strokeStyle = '#3b5a1e'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(14, 0); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.bezierCurveTo(20, -44, 70, -50, 96, -6);
    ctx.quadraticCurveTo(100, 0, 96, 6);
    ctx.bezierCurveTo(70, 50, 20, 44, 12, 0);
    ctx.fillStyle = held ? '#4f9a3a' : '#5aa845'; ctx.fill();
    ctx.strokeStyle = '#24451a'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = '#a9dc7c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(92, 0);
    for (let i = 1; i <= 5; i++) { const px = 14 + i * 13; ctx.moveTo(px, 0); ctx.lineTo(px + 12, -22 + i * 1.5); ctx.moveTo(px, 0); ctx.lineTo(px + 12, 22 - i * 1.5); }
    ctx.stroke();
    ctx.restore();
  };

  /* ---------------- makanan ---------------- */
  const FOOD = {
    ara(ctx) {
      A.drawLeaf(ctx, -6, 0, 52, -2.4, '#4f9440', '#2e5e25', 0.45);
      ctx.strokeStyle = '#5b3a1c'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -12); ctx.stroke();
      const pts = [[-17, 10], [17, 8], [0, 18], [-9, -6], [10, -8]];
      for (const [px, py] of pts) {
        const g = ctx.createRadialGradient(px - 5, py - 6, 2, px, py, 17);
        g.addColorStop(0, '#d0587a'); g.addColorStop(1, '#6c1f3f');
        circle(ctx, px, py, 15.5, g, OUT, 2.6);
        ctx.fillStyle = '#4a1530'; ctx.beginPath(); ctx.arc(px, py + 13, 2, 0, S.TAU); ctx.fill();
        shine(ctx, px - 6, py - 6, 4);
      }
    },
    rambutan(ctx) {
      for (const [px, py, r] of [[-14, 6, 20], [16, 4, 19]]) {
        ctx.strokeStyle = '#b5281e'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * S.TAU, x1 = px + Math.cos(a) * r, y1 = py + Math.sin(a) * r;
          ctx.beginPath(); ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(px + Math.cos(a + 0.25) * (r + 9), py + Math.sin(a + 0.25) * (r + 9), px + Math.cos(a + 0.45) * (r + 10), py + Math.sin(a + 0.45) * (r + 10));
          ctx.stroke();
        }
        circle(ctx, px, py, r, '#e0412d', OUT, 2.6);
        ctx.fillStyle = '#ffd66b';
        for (let i = 0; i < 18; i += 2) { const a = (i / 18) * S.TAU + 0.45; circle(ctx, px + Math.cos(a) * (r + 10), py + Math.sin(a) * (r + 10), 1.8, '#c8d84a'); }
        shine(ctx, px - 6, py - 7, 5);
      }
      ctx.strokeStyle = '#5b3a1c'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-10, -14); ctx.quadraticCurveTo(0, -36, 12, -15); ctx.stroke();
    },
    durian(ctx) {
      ctx.strokeStyle = '#5b3a1c'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, -46); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 2, 32, 38, 0, 0, S.TAU);
      const g = ctx.createRadialGradient(-10, -10, 4, 0, 0, 40); g.addColorStop(0, '#c9d66a'); g.addColorStop(1, '#6f8a2c');
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.fillStyle = '#5d7524';
      for (let yy = -28; yy <= 32; yy += 11) {
        const half = Math.sqrt(Math.max(0, 1 - Math.pow((yy - 2) / 38, 2))) * 30;
        for (let xx = -half + 5 + ((yy / 11) % 2 ? 5 : 0); xx < half - 3; xx += 11) {
          ctx.beginPath(); ctx.moveTo(xx - 4, yy + 3); ctx.lineTo(xx, yy - 5); ctx.lineTo(xx + 4, yy + 3); ctx.closePath(); ctx.fill();
        }
      }
      shine(ctx, -12, -14, 6);
    },
    daun(ctx) {
      ctx.strokeStyle = '#6b3a24'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 34); ctx.lineTo(0, -6); ctx.stroke();
      A.drawLeaf(ctx, 0, 6, 46, -2.2, '#d0475a', '#8a2234', 0.42);
      A.drawLeaf(ctx, 0, 2, 46, -0.95, '#e0695a', '#8a2234', 0.42);
      A.drawLeaf(ctx, 0, -4, 44, -1.57, '#ee8f6a', '#9a3a2a', 0.4);
    },
    bunga(ctx) {
      ctx.strokeStyle = '#3f6b2a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, 36); ctx.quadraticCurveTo(-4, 10, -12, -8); ctx.moveTo(0, 36); ctx.quadraticCurveTo(6, 12, 14, -2); ctx.stroke();
      A.drawLeaf(ctx, 0, 26, 30, -0.4, '#5aa845', '#2e5e25');
      for (const [px, py, s] of [[-12, -10, 1], [15, -4, 0.9], [2, -24, 0.8]]) {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * S.TAU;
          ctx.beginPath(); ctx.ellipse(px + Math.cos(a) * 9 * s, py + Math.sin(a) * 9 * s, 8 * s, 5.5 * s, a, 0, S.TAU);
          ctx.fillStyle = '#f08fb0'; ctx.fill(); ctx.strokeStyle = '#a3335c'; ctx.lineWidth = 1.8; ctx.stroke();
        }
        circle(ctx, px, py, 4.5 * s, '#ffd24a', '#a37a10', 1.5);
      }
    },
    kulit(ctx) {
      ctx.save(); ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.moveTo(-34, -14); ctx.quadraticCurveTo(0, -24, 36, -12); ctx.lineTo(34, 12); ctx.quadraticCurveTo(0, 2, -36, 12); ctx.closePath();
      ctx.fillStyle = '#7b5233'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-34, 6); ctx.quadraticCurveTo(0, -4, 34, 6); ctx.lineTo(34, 12); ctx.quadraticCurveTo(0, 2, -36, 12); ctx.closePath();
      ctx.fillStyle = '#d9b685'; ctx.fill();
      ctx.strokeStyle = '#4a2e18'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = -26; i < 30; i += 10) { ctx.moveTo(i, -14 + Math.abs(i) * 0.05); ctx.lineTo(i + 4, -2); }
      ctx.stroke();
      ctx.restore();
    },
    rotan(ctx) {
      ctx.save(); ctx.rotate(0.35);
      ctx.beginPath(); ctx.moveTo(-9, 36); ctx.lineTo(-7, -26); ctx.quadraticCurveTo(0, -36, 7, -26); ctx.lineTo(9, 36); ctx.closePath();
      ctx.fillStyle = '#efe7bf'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.fillStyle = '#7aa64a'; ctx.strokeStyle = '#3b5a1e'; ctx.lineWidth = 1.6;
      for (let yy = 30; yy > -10; yy -= 12) {
        ctx.beginPath(); ctx.moveTo(-10, yy); ctx.quadraticCurveTo(-16, yy - 12, -4, yy - 16); ctx.lineTo(-6, yy); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, yy - 5); ctx.quadraticCurveTo(16, yy - 17, 4, yy - 21); ctx.lineTo(6, yy - 5); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    },
    rayap(ctx) {
      ctx.beginPath();
      ctx.moveTo(-34, 22); ctx.quadraticCurveTo(-36, -6, -18, -20); ctx.quadraticCurveTo(-4, -34, 10, -24); ctx.quadraticCurveTo(32, -16, 34, 6); ctx.quadraticCurveTo(36, 24, 20, 26); ctx.closePath();
      ctx.fillStyle = '#a7743f'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.fillStyle = '#5a3a1c';
      for (const [px, py, r] of [[-14, -4, 5], [6, -12, 4], [14, 8, 5], [-4, 12, 4]]) { ctx.beginPath(); ctx.ellipse(px, py, r, r * 0.7, 0, 0, S.TAU); ctx.fill(); }
      const bugs = [[-22, 8, 0.3], [-6, 0, -0.5], [20, -4, 0.8], [4, 20, 0.1], [26, 16, -0.4]];
      for (const [px, py, a] of bugs) {
        ctx.save(); ctx.translate(px, py); ctx.rotate(a);
        ctx.fillStyle = '#f4e3c0'; ctx.strokeStyle = '#6b4a23'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, 6, 3.2, 0, 0, S.TAU); ctx.fill(); ctx.stroke();
        circle(ctx, 6.5, 0, 2.6, '#b2621c');
        ctx.restore();
      }
    },
    madu(ctx) {
      ctx.beginPath(); ctx.moveTo(-36, -22); ctx.lineTo(36, -22); ctx.lineTo(30, 20); ctx.quadraticCurveTo(0, 30, -30, 20); ctx.closePath();
      ctx.fillStyle = '#f0b22e'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.save(); ctx.clip();
      ctx.strokeStyle = '#a8670f'; ctx.lineWidth = 2;
      const hx = 9, hy = 8;
      for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) {
        const cx = -36 + c * hx * 1.5 + (r % 2 ? hx * 0.75 : 0), cy = -22 + r * hy;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) { const a = (k / 6) * S.TAU; const px = cx + Math.cos(a) * 5, py = cy + Math.sin(a) * 5; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.closePath(); ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = '#f6c344';
      ctx.beginPath(); ctx.moveTo(-6, 24); ctx.quadraticCurveTo(-4, 36, -6, 40); ctx.arc(-6, 40, 3.5, 0, Math.PI); ctx.fill();
      shine(ctx, -18, -12, 6);
    },
    /* makanan manusia (tidak boleh diberikan) */
    biskuit(ctx) {
      ctx.beginPath(); ctx.moveTo(-38, 14); ctx.lineTo(-30, -24); ctx.lineTo(34, -26); ctx.lineTo(38, 12); ctx.closePath();
      ctx.fillStyle = '#3d7fd6'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '900 13px ' + S.FONT; ctx.textAlign = 'center'; ctx.fillText('BISKUIT', 2, -10);
      for (const [px, py] of [[-12, 12], [14, 16]]) {
        circle(ctx, px, py, 18, '#d9a35b', OUT, 2.4);
        ctx.fillStyle = '#5b3418';
        for (const [dx, dy] of [[-6, -5], [5, -7], [7, 4], [-4, 7], [0, 0]]) { ctx.beginPath(); ctx.arc(px + dx, py + dy, 2.2, 0, S.TAU); ctx.fill(); }
      }
    },
    permen(ctx) {
      ctx.strokeStyle = '#f2ece0'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(16, 42); ctx.stroke();
      ctx.strokeStyle = '#b9ae98'; ctx.lineWidth = 1.5; ctx.stroke();
      circle(ctx, -2, -10, 27, '#fff', OUT, 2.6);
      ctx.strokeStyle = '#ee4f8a'; ctx.lineWidth = 6;
      ctx.beginPath();
      for (let a = 0; a < 5.2 * Math.PI; a += 0.2) { const r = 2 + a * 1.45; const px = -2 + Math.cos(a) * r, py = -10 + Math.sin(a) * r; a ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      shine(ctx, -12, -20, 5);
    },
    soda(ctx) {
      ctx.beginPath(); ctx.moveTo(-20, -30); ctx.lineTo(20, -30); ctx.lineTo(22, 32); ctx.quadraticCurveTo(0, 38, -22, 32); ctx.closePath();
      ctx.fillStyle = '#d9342b'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, -30, 20, 6, 0, 0, S.TAU); ctx.fillStyle = '#cfd6dc'; ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-21, 6); ctx.bezierCurveTo(-8, -8, 8, 18, 21, 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-14, -22, 6, 48);
      for (const [px, py, r] of [[10, -42, 3], [2, -50, 2.4], [14, -54, 2]]) circle(ctx, px, py, r, null, '#9fd8ff', 1.6);
    },
    mi(ctx) {
      ctx.beginPath(); ctx.moveTo(-32, -16); ctx.lineTo(32, -16); ctx.lineTo(24, 34); ctx.lineTo(-24, 34); ctx.closePath();
      ctx.fillStyle = '#fbf6ea'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.fillStyle = '#e2442f'; ctx.fillRect(-28, 2, 56, 14);
      ctx.fillStyle = '#ffd34d';
      ctx.beginPath(); ctx.ellipse(0, -16, 32, 9, 0, 0, S.TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#d29a21'; ctx.lineWidth = 2;
      for (let i = -24; i < 24; i += 8) { ctx.beginPath(); ctx.moveTo(i, -14); ctx.quadraticCurveTo(i + 4, -24, i + 8, -14); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3;
      for (const px of [-10, 6]) { ctx.beginPath(); ctx.moveTo(px, -28); ctx.quadraticCurveTo(px - 6, -36, px, -44); ctx.quadraticCurveTo(px + 6, -50, px, -56); ctx.stroke(); }
    },
    keripik(ctx) {
      ctx.beginPath();
      ctx.moveTo(-28, -34); for (let i = 0; i <= 8; i++) ctx.lineTo(-28 + i * 7, i % 2 ? -38 : -34);
      ctx.lineTo(30, 30); for (let i = 8; i >= 0; i--) ctx.lineTo(-28 + i * 7, i % 2 ? 36 : 32);
      ctx.closePath();
      ctx.fillStyle = '#f6b928'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.fillStyle = '#e8562a'; ctx.beginPath(); ctx.ellipse(1, 2, 20, 14, 0, 0, S.TAU); ctx.fill();
      ctx.fillStyle = '#ffe08a';
      ctx.beginPath(); ctx.ellipse(1, 2, 12, 8, -0.3, 0, S.TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '900 11px ' + S.FONT; ctx.textAlign = 'center'; ctx.fillText('KERIPIK', 1, -18);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-22, -28, 5, 54);
    },
    /* alat */
    ranting(ctx) {
      ctx.lineCap = 'round';
      ctx.strokeStyle = OUT; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(-36, 26); ctx.lineTo(34, -24); ctx.moveTo(4, 2); ctx.lineTo(10, -22); ctx.stroke();
      ctx.strokeStyle = '#8a6239'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-36, 26); ctx.lineTo(34, -24); ctx.moveTo(4, 2); ctx.lineTo(10, -22); ctx.stroke();
      A.drawLeaf(ctx, 10, -22, 18, -1.2, '#5aa845', '#2e5e25');
    },
    rantingPanjang(ctx) {
      ctx.lineCap = 'round';
      ctx.strokeStyle = OUT; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-42, 34); ctx.lineTo(42, -34); ctx.stroke();
      ctx.strokeStyle = '#b08350'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-42, 34); ctx.lineTo(42, -34); ctx.stroke();
      ctx.strokeStyle = '#7a5530'; ctx.lineWidth = 1.5;
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(40, -33); ctx.lineTo(47 + k, -38 + k * 3); ctx.stroke(); }
      ctx.fillStyle = '#e0c08a'; ctx.beginPath(); ctx.arc(-20, 16, 2, 0, S.TAU); ctx.arc(8, -6, 2, 0, S.TAU); ctx.fill();
    },
    rantingPendek(ctx) {
      ctx.lineCap = 'round';
      ctx.strokeStyle = OUT; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-14, 12); ctx.lineTo(14, -12); ctx.stroke();
      ctx.strokeStyle = '#8a6239'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-14, 12); ctx.lineTo(14, -12); ctx.stroke();
    },
    rantingTebal(ctx) {
      ctx.save(); ctx.rotate(-0.55);
      ctx.beginPath(); ctx.moveTo(-40, -15); ctx.lineTo(38, -12); ctx.lineTo(40, 12); ctx.lineTo(-40, 15); ctx.closePath();
      ctx.fillStyle = '#6b4a2f'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.strokeStyle = '#3f2716'; ctx.lineWidth = 1.6;
      ctx.beginPath(); for (let x = -30; x < 34; x += 12) { ctx.moveTo(x, -9); ctx.lineTo(x + 8, -6); ctx.moveTo(x + 4, 5); ctx.lineTo(x + 12, 7); } ctx.stroke();
      ctx.beginPath(); ctx.ellipse(39, 0, 5, 12, 0, 0, S.TAU); ctx.fillStyle = '#c99a63'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    },
    rantingDaun(ctx) {
      ctx.lineCap = 'round';
      const twigs = [[-10, 8, -26, -12], [6, -4, -6, -30], [18, -14, 40, -20], [-24, 20, -40, 6]];
      ctx.strokeStyle = OUT; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-40, 34); ctx.lineTo(36, -30); ctx.stroke();
      for (const [a, b, c, d] of twigs) { ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
      ctx.strokeStyle = '#8a6239'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-40, 34); ctx.lineTo(36, -30); ctx.stroke();
      for (const [a, b, c, d] of twigs) { ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); }
      for (const [c, d, ang] of [[-26, -12, -2.2], [-6, -30, -1.7], [40, -20, -0.4], [-40, 6, -2.8], [36, -30, -0.9], [-30, -16, -1.2]]) A.drawLeaf(ctx, c, d, 20, ang, '#5aa845', '#2e5e25', 0.45);
    },
    daunLebar(ctx) { A.drawBigLeaf(ctx, -40, 18, 0.78, -0.45, false); },
    batu(ctx) {
      ctx.beginPath(); ctx.moveTo(-34, 18); ctx.quadraticCurveTo(-36, -14, -8, -22); ctx.quadraticCurveTo(26, -28, 34, 0); ctx.quadraticCurveTo(38, 22, 10, 24); ctx.closePath();
      ctx.fillStyle = '#9aa0a2'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2.6; ctx.stroke();
      ctx.fillStyle = '#c3c8c9'; ctx.beginPath(); ctx.ellipse(-8, -8, 12, 6, -0.3, 0, S.TAU); ctx.fill();
      ctx.fillStyle = '#7d8486'; ctx.beginPath(); ctx.ellipse(14, 10, 8, 4, 0.3, 0, S.TAU); ctx.fill();
    },
    pisang(ctx) {
      ctx.fillStyle = '#5b3a1c'; ctx.strokeStyle = OUT; ctx.lineWidth = 2.4;
      S.roundRect(ctx, -6, -40, 12, 14, 3); ctx.fill(); ctx.stroke();
      for (const [a, c] of [[-0.55, '#f2c932'], [0.55, '#f2c932'], [0, '#ffe066']]) {
        ctx.save(); ctx.translate(0, -28); ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(-6, 0); ctx.bezierCurveTo(-30, 18, -26, 52, 4, 64);
        ctx.bezierCurveTo(8, 66, 10, 62, 8, 60);
        ctx.bezierCurveTo(-10, 46, -8, 18, 8, 2); ctx.closePath();
        ctx.fillStyle = c; ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(160,110,20,.5)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-2, 6); ctx.bezierCurveTo(-18, 22, -16, 46, 2, 58); ctx.stroke();
        ctx.fillStyle = '#4a3218'; ctx.beginPath(); ctx.arc(5, 62, 2.6, 0, S.TAU); ctx.fill();
        ctx.strokeStyle = OUT; ctx.lineWidth = 2.4;
        ctx.restore();
      }
    }
  };
  A.FOOD_KINDS = Object.keys(FOOD);

  /* Gambar makanan/alat di (x,y) dengan jari-jari kira-kira r. */
  A.drawFood = function (ctx, kind, x, y, r, t) {
    const f = FOOD[kind];
    if (!f) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(r / 44, r / 44);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    f(ctx, t || 0);
    ctx.restore();
  };

  /* Ikon makanan sebagai gambar (untuk tombol DOM). */
  const iconCache = {};
  A.foodIcon = function (kind, size) {
    const key = kind + size;
    if (iconCache[key]) return iconCache[key];
    const c = S.makeCanvas(size * 2, size * 2), ctx = c.getContext('2d');
    ctx.scale(2, 2);
    A.drawFood(ctx, kind, size / 2, size / 2, size * 0.4);
    return (iconCache[key] = c.toDataURL());
  };

  /* Panel info di dalam kanvas (gaya sama dengan HUD). */
  A.panel = function (ctx, x, y, w, h, title) {
    ctx.save();
    S.roundRect(ctx, x, y, w, h, 16);
    ctx.fillStyle = 'rgba(7,45,53,.88)'; ctx.fill();
    ctx.strokeStyle = 'rgba(231,241,216,.25)'; ctx.lineWidth = 1.5; ctx.stroke();
    if (title) {
      ctx.fillStyle = '#ffda7e'; ctx.font = '900 17px ' + S.FONT; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(title.toUpperCase(), x + 16, y + 12);
    }
    ctx.restore();
  };
  A.text = function (ctx, str, x, y, size, col, align, weight) {
    ctx.font = (weight || 800) + ' ' + size + 'px ' + S.FONT;
    ctx.fillStyle = col || '#fff'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(str, x, y);
  };
  /* Teks dibungkus per baris; mengembalikan tinggi total. */
  A.wrapText = function (ctx, str, x, y, maxW, lh, size, col, align, weight) {
    ctx.font = (weight || 800) + ' ' + size + 'px ' + S.FONT;
    ctx.fillStyle = col || '#fff'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'top';
    const words = String(str).split(' '); let line = '', yy = y;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; }
      else line = test;
    }
    if (line) { ctx.fillText(line, x, yy); yy += lh; }
    return yy - y;
  };

  /* ---------------- tanda & efek ---------------- */
  A.glow = function (ctx, x, y, r, t, col) {
    const p = 0.5 + 0.5 * Math.sin(t * 5);
    ctx.save();
    ctx.strokeStyle = col || '#ffe27a'; ctx.lineWidth = 4 + p * 3; ctx.globalAlpha = 0.5 + p * 0.45;
    ctx.setLineDash([12, 9]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.arc(x, y, r + p * 6, 0, S.TAU); ctx.stroke();
    ctx.restore();
  };
  A.sparkle = function (ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 1.5); ctx.scale(s, s);
    ctx.fillStyle = '#fff6c2'; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 8);
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * S.TAU, r = i % 2 ? 4 : 14; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(r, 0); }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  A.mark = function (ctx, x, y, ok, s) {
    s = s || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    circle(ctx, 0, 0, 19, ok ? '#2f9a55' : '#d0442f', '#fff', 3.5);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    if (ok) { ctx.moveTo(-8, 1); ctx.lineTo(-2, 8); ctx.lineTo(9, -7); } else { ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(7, -7); ctx.lineTo(-7, 7); }
    ctx.stroke();
    ctx.restore();
  };

  /* ---------------- dahan (pelajaran memanjat) ---------------- */
  /* Dahan dari batang di (x0,y0) ke arah side (-1 kiri, 1 kanan). rotten = dahan lapuk. */
  A.branchGeom = function (x0, y0, len, side, lift) {
    return { x0, y0, x1: x0 + side * len, y1: y0 - (lift || 18) };
  };
  A.drawBranch = function (ctx, g, o) {
    o = o || {};
    const rnd = S.rng(o.seed || 7);
    const rotten = !!o.rotten, side = Math.sign(g.x1 - g.x0) || 1;
    const len = Math.hypot(g.x1 - g.x0, g.y1 - g.y0), ang = Math.atan2(g.y1 - g.y0, g.x1 - g.x0);
    ctx.save(); ctx.translate(g.x0, g.y0); ctx.rotate(ang);
    if (o.drop) { ctx.translate(len * 0.5, 0); ctx.rotate(o.drop * side); ctx.translate(-len * 0.5, o.dropY || 0); ctx.globalAlpha = o.alpha == null ? 1 : o.alpha; }
    const w0 = o.w || 26, w1 = rotten ? w0 * 0.42 : w0 * 0.32;
    // daun di ujung (di belakang dahan)
    if (!rotten) {
      const leafy = o.leafy == null ? 1 : o.leafy, n = Math.round(4 + leafy * 7);
      for (let i = 0; i < n; i++) {
        const t = 0.62 + (i / n) * 0.42, a = -1.9 + rnd() * 3.8;
        A.drawLeaf(ctx, len * t, (rnd() - 0.5) * 8, 30 + rnd() * 18, a, i % 3 ? '#4f9a3a' : '#6bb84a', '#2b5a1f');
      }
    } else if (o.dryLeaves) {
      for (let i = 0; i < 3; i++) A.drawLeaf(ctx, len * (0.7 + i * 0.1), 2, 22, 1.2 + rnd() * 1.4, '#a8834a', '#6b4a23');
    }
    // badan dahan
    ctx.beginPath();
    ctx.moveTo(0, -w0 / 2);
    ctx.quadraticCurveTo(len * 0.5, -w0 * 0.42 - 4, len, -w1 / 2);
    if (rotten) {
      // ujung patah bergerigi
      ctx.lineTo(len + 6, -w1 * 0.2); ctx.lineTo(len - 2, 0); ctx.lineTo(len + 8, w1 * 0.3); ctx.lineTo(len, w1 / 2);
    } else ctx.quadraticCurveTo(len + w1 * 0.6, 0, len, w1 / 2);
    ctx.quadraticCurveTo(len * 0.5, w0 * 0.42 + 2, 0, w0 / 2);
    ctx.closePath();
    const g2 = ctx.createLinearGradient(0, -w0 / 2, 0, w0 / 2);
    if (rotten) { g2.addColorStop(0, '#b3a58f'); g2.addColorStop(1, '#7c705f'); }
    else { g2.addColorStop(0, '#8a5d3a'); g2.addColorStop(1, '#5a3a22'); }
    ctx.fillStyle = g2; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
    // tekstur kulit kayu
    ctx.strokeStyle = rotten ? '#5f5547' : '#3f2716'; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) { const x = 18 + i * len / 7, y = (rnd() - 0.5) * w0 * 0.4; ctx.moveTo(x, y); ctx.lineTo(x + 22, y + (rnd() - 0.5) * 3); }
    ctx.stroke();
    if (!rotten) {
      ctx.strokeStyle = 'rgba(255,220,170,.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(8, -w0 * 0.3); ctx.quadraticCurveTo(len * 0.5, -w0 * 0.34, len * 0.9, -w1 * 0.3); ctx.stroke();
      if (o.moss !== false) {
        ctx.fillStyle = '#6fa043';
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(30 + i * 34 + rnd() * 10, -w0 * 0.36, 9, 4, 0, 0, S.TAU); ctx.fill(); }
      }
    } else {
      // retakan
      const subtle = o.subtle ? 0.6 : 1;
      ctx.strokeStyle = '#2a1f14'; ctx.lineWidth = 2.6 * subtle; ctx.lineJoin = 'miter';
      for (const cx of [len * 0.32, len * 0.62]) {
        ctx.beginPath(); ctx.moveTo(cx, -w0 * 0.38); ctx.lineTo(cx + 6, -w0 * 0.1); ctx.lineTo(cx - 3, w0 * 0.08); ctx.lineTo(cx + 5, w0 * 0.32); ctx.stroke();
      }
      // lubang rayap
      ctx.fillStyle = '#3b3128';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(len * (0.2 + i * 0.18), (rnd() - 0.5) * w0 * 0.3, 2.2, 0, S.TAU); ctx.fill(); }
      // jamur kuping
      const nf = o.subtle ? 1 : 2;
      for (let i = 0; i < nf; i++) {
        const fx = len * (0.45 + i * 0.25), fy = -w0 * 0.42;
        ctx.beginPath(); ctx.ellipse(fx, fy, 15 * subtle + 3, 7, 0, Math.PI, 0);
        ctx.fillStyle = i ? '#e9c58a' : '#f0e2c4'; ctx.fill(); ctx.strokeStyle = '#7a5a2a'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = '#b48a4a'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(fx, fy, 9 * subtle + 2, 4, 0, Math.PI, 0); ctx.stroke();
      }
    }
    ctx.restore();
  };

  /* Sulur/akar gantung. */
  A.drawLiana = function (ctx, x0, y0, x1, y1, sag, w, col) {
    ctx.strokeStyle = col || '#4d5f2a'; ctx.lineWidth = w || 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1); ctx.stroke();
  };

  /* Batang pohon besar hutan Kalimantan dengan akar papan (banir). */
  A.drawTrunk = function (ctx, x, yTop, yBot, w, o) {
    o = o || {};
    const rnd = S.rng(o.seed || 3);
    const col = o.col || '#6b4a33', dark = o.dark || '#4a3222', hi = o.hi || '#8d6a4e';
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x - w * 0.42, yTop); ctx.lineTo(x + w * 0.42, yTop);
    if (o.buttress) {
      ctx.lineTo(x + w * 0.5, yBot - w * 1.2); ctx.quadraticCurveTo(x + w * 0.62, yBot - w * 0.3, x + w * 1.5, yBot);
      ctx.lineTo(x - w * 1.5, yBot); ctx.quadraticCurveTo(x - w * 0.62, yBot - w * 0.3, x - w * 0.5, yBot - w * 1.2);
    } else { ctx.lineTo(x + w * 0.5, yBot); ctx.lineTo(x - w * 0.5, yBot); }
    ctx.closePath();
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, dark); g.addColorStop(0.35, hi); g.addColorStop(0.7, col); g.addColorStop(1, dark);
    ctx.fillStyle = g; ctx.fill();
    if (o.outline !== false) { ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.clip();
    ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.globalAlpha = 0.7;
    const h = yBot - yTop;
    for (let i = 0; i < h / 26; i++) {
      const yy = yTop + i * 26 + rnd() * 12, xx = x - w * 0.35 + rnd() * w * 0.7;
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + (rnd() - 0.5) * 6, yy + 14, xx + (rnd() - 0.5) * 4, yy + 30); ctx.stroke();
    }
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#7fa64a';
    for (let i = 0; i < h / 90; i++) { ctx.beginPath(); ctx.ellipse(x - w * 0.3 + rnd() * w * 0.2, yTop + rnd() * h, 6 + rnd() * 8, 14 + rnd() * 10, 0, 0, S.TAU); ctx.fill(); }
    ctx.restore();
  };

  /* Gerombol daun (tajuk). */
  A.drawFoliage = function (ctx, x, y, r, seed, pal, o) {
    o = o || {};
    const rnd = S.rng(seed || 1);
    pal = pal || ['#2e6b3a', '#3f8a45', '#5aa64c', '#8cc65a'];
    const n = o.n || Math.round(10 + r / 6);
    // bayangan dasar
    ctx.fillStyle = pal[0];
    ctx.beginPath();
    for (let i = 0; i < 9; i++) { const a = (i / 9) * S.TAU; ctx.moveTo(x + Math.cos(a) * r * 0.55 + r * 0.42, y + Math.sin(a) * r * 0.42); ctx.arc(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.42, r * 0.42, 0, S.TAU); }
    ctx.fill();
    for (let k = 1; k < pal.length; k++) {
      for (let i = 0; i < n / pal.length + 2; i++) {
        const a = rnd() * S.TAU, d = rnd() * r * (0.75 - k * 0.12);
        const lx = x + Math.cos(a) * d, ly = y + Math.sin(a) * d * 0.8 - k * r * 0.06;
        A.drawLeaf(ctx, lx, ly, r * (0.32 + rnd() * 0.18), rnd() * S.TAU, pal[k], o.vein ? pal[0] : null, 0.42);
      }
    }
  };

  /* Sarang dari dahan yang dianyam: mangkuk dahan dengan bibir daun. weave & bed: 0..1
     (x, y) = bibir atas sarang. Gambar Bakti lebih dulu agar badan bawahnya tertutup sarang. */
  A.drawNest = function (ctx, x, y, s, weave, bed, t) {
    if (weave <= 0 && bed <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const k = S.clamp(weave, 0, 1), rx = 54 + 30 * k, ry = 12 + 34 * k;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // mangkuk
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI); ctx.closePath();
    ctx.fillStyle = '#5b3d22'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI); ctx.closePath(); ctx.clip();
    const n = Math.max(2, Math.round(4 + k * 8));
    for (let i = 0; i < n; i++) {
      const yy = (i / n) * ry, w = rx * Math.sqrt(Math.max(0.05, 1 - Math.pow(yy / (ry + 1), 2)));
      ctx.strokeStyle = i % 2 ? '#8a6038' : '#a3743f'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(-w - 6, yy + (i % 2 ? 3 : -2)); ctx.quadraticCurveTo(0, yy + 9, w + 6, yy + (i % 2 ? -2 : 3)); ctx.stroke();
    }
    ctx.restore();
    // ujung ranting mencuat dan daun di bibir
    for (let i = 0; i < Math.round(3 + k * 9); i++) {
      const a = Math.PI * (0.04 + (i / 12) * 0.92), px = Math.cos(a) * rx, py = Math.sin(a) * ry * 0.35;
      A.drawLeaf(ctx, px, py, 22 + (i % 3) * 6, (px > 0 ? -0.5 : Math.PI + 0.5) + (i % 2 ? 0.3 : -0.2), i % 2 ? '#4f9a3a' : '#3f8a35', '#2b5a1f');
    }
    // bibir sarang
    ctx.strokeStyle = OUT; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, 9, 0, 0, Math.PI); ctx.stroke();
    ctx.strokeStyle = '#94683f'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.ellipse(0, 0, rx, 9, 0, 0, Math.PI); ctx.stroke();
    // alas daun
    const m = Math.round(bed * 8);
    for (let i = 0; i < m; i++) {
      const px = -rx * 0.75 + (i % 4) * rx * 0.5 + (i > 3 ? rx * 0.2 : 0), py = -3 - (i > 3 ? 5 : 0);
      A.drawLeaf(ctx, px - 14, py, 34, -0.15 + (i % 3) * 0.15, i % 2 ? '#6bb84a' : '#5aa845', '#2e5e25', 0.5);
    }
    ctx.restore();
  };

  /* Lubang di batang (sarang rayap / genangan air). */
  A.drawHollow = function (ctx, x, y, s, kind, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 30, 0, 0, S.TAU);
    ctx.fillStyle = '#5a3d27'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 3, 15, 23, 0, 0, S.TAU); ctx.fillStyle = '#1d120a'; ctx.fill();
    if (kind === 'air') {
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, 3, 15, 23, 0, 0, S.TAU); ctx.clip();
      ctx.fillStyle = '#3d7ea8'; ctx.fillRect(-16, 8 + Math.sin(t * 2) * 1.5, 32, 20);
      ctx.fillStyle = 'rgba(200,240,255,.7)'; ctx.fillRect(-10, 9 + Math.sin(t * 2) * 1.5, 12, 2.5);
      ctx.restore();
    } else if (kind === 'rayap') {
      for (let i = 0; i < 6; i++) {
        const a = t * 1.2 + i * 1.05, px = Math.cos(a) * 10, py = 4 + Math.sin(a * 1.3) * 14;
        ctx.fillStyle = '#f4e3c0'; ctx.beginPath(); ctx.ellipse(px, py, 4, 2.2, a, 0, S.TAU); ctx.fill();
      }
      ctx.fillStyle = '#a7743f';
      ctx.beginPath(); ctx.ellipse(-14, 24, 12, 7, 0.3, 0, S.TAU); ctx.ellipse(12, 26, 10, 6, -0.3, 0, S.TAU); ctx.fill();
    }
    ctx.restore();
  };

  /* Kandang angkut untuk pelepasliaran. door: 0 (tertutup) .. 1 (terbuka) */
  A.drawCage = function (ctx, x, y, s, door) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 4, 110, 14, 0, 0, S.TAU); ctx.fill();
    S.roundRect(ctx, -95, -150, 190, 150, 10);
    ctx.fillStyle = '#3c5a63'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#1c2a2e'; ctx.fillRect(-78, -132, 156, 120);
    ctx.save(); ctx.beginPath(); ctx.rect(-78, -132, 156, 120); ctx.clip();
    ctx.fillStyle = '#5c7c84';
    const dy = -door * 124;
    for (let i = 0; i < 8; i++) ctx.fillRect(-74 + i * 20, -132 + dy, 7, 120);
    ctx.fillRect(-78, -80 + dy, 156, 7);
    ctx.restore();
    ctx.fillStyle = '#c9a24a'; ctx.fillRect(-95, -160, 190, 14);
    ctx.strokeRect(-95, -160, 190, 14);
    ctx.restore();
  };

  /* Perahu kecil dengan petugas (siluet). */
  A.drawBoat = function (ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 2); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.6) * 0.02);
    // petugas
    ctx.fillStyle = '#23423f';
    ctx.beginPath(); ctx.ellipse(10, -46, 16, 22, 0, 0, S.TAU); ctx.fill();
    ctx.fillStyle = '#c99a72'; ctx.beginPath(); ctx.arc(10, -76, 11, 0, S.TAU); ctx.fill();
    ctx.fillStyle = '#e1c46a'; ctx.beginPath(); ctx.ellipse(10, -84, 19, 5, 0, 0, S.TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, -88, 9, 6, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = '#6b4a23'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-14, -60); ctx.lineTo(-40, 8); ctx.stroke();
    // perahu
    ctx.beginPath(); ctx.moveTo(-90, -24); ctx.lineTo(96, -24); ctx.quadraticCurveTo(80, 8, 50, 10); ctx.lineTo(-60, 10); ctx.quadraticCurveTo(-84, 6, -90, -24); ctx.closePath();
    ctx.fillStyle = '#8b5a33'; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#b07a48'; ctx.fillRect(-84, -24, 176, 7);
    ctx.restore();
  };

  /* Bibit pohon tumbuh (penutup cerita). g: 0..1 */
  A.drawSapling = function (ctx, x, y, g, t) {
    if (g <= 0) return;
    ctx.save(); ctx.translate(x, y);
    const h = 16 + g * 90;
    ctx.strokeStyle = '#5a3a1c'; ctx.lineWidth = 3 + g * 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.sin(t) * 3, -h * 0.5, 0, -h); ctx.stroke();
    const nl = Math.round(2 + g * 7);
    for (let i = 0; i < nl; i++) {
      const yy = -h * (0.35 + (i / nl) * 0.65), side = i % 2 ? 1 : -1;
      A.drawLeaf(ctx, 0, yy, 16 + g * 22, side > 0 ? -0.5 - Math.sin(t + i) * 0.05 : Math.PI + 0.5, i % 2 ? '#5aa845' : '#77c057', '#2e5e25', 0.45);
    }
    ctx.restore();
  };
})();
