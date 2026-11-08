/* Pelajaran 4 · Membuat sarang: pilih tempat yang tinggi dan kuat, anyam dahan, alasi daun, sebelum gelap. */
(function () {
  'use strict';
  const S = window.SHB, A = S.Art, C = window.SHB_CONTENT, CFG = window.SHB_CONFIG, UI = S.UI;
  const L = (S.Lessons = S.Lessons || {});
  const F = { x: 820, y: 378 };                // percabangan pohon (tempat sarang)
  const SPOTS = [
    { id: 'low', x: 330, y: 770 },
    { id: 'dead', x: 1296, y: 432 },
    { id: 'good', x: F.x, y: F.y - 6 }
  ];
  const WEAVE_ANG = [-172, -140, -112, -68, -40, -8];
  const BED = [{ x: 600, y: 300 }, { x: 1040, y: 292 }, { x: 700, y: 170 }, { x: 950, y: 150 }, { x: 520, y: 200 }];
  const D2R = Math.PI / 180;

  function drawFar(ctx, w, h) {
    A.farForest(ctx, w, h, [
      { y: 520, r: 80, col: 'rgba(40,70,72,.75)' },
      { y: 610, r: 95, col: '#263f40', trunks: 8, trunkCol: '#223738' }
    ], 121);
  }
  function drawFore(ctx, w, h) {
    ctx.fillStyle = '#1f3a24'; ctx.fillRect(0, 820, w, h - 820);
    A.grass(ctx, 0, w, 830, 34, '#2a4f2c', 7);
    // semak rendah
    A.drawFoliage(ctx, 300, 800, 110, 122, ['#1f4a2a', '#2e6337', '#3f7a42', '#5c9450']);
    A.drawFoliage(ctx, 400, 820, 80, 123, ['#1f4a2a', '#2e6337', '#3f7a42', '#5c9450']);
    // pohon mati
    A.drawTrunk(ctx, 1300, 430, 900, 70, { seed: 41, col: '#8c8378', dark: '#5e574e', hi: '#a9a094' });
    ctx.strokeStyle = '#2b1a0e'; ctx.lineCap = 'round';
    for (const [x1, y1, x2, y2, wd] of [[1290, 450, 1200, 330, 16], [1310, 450, 1400, 320, 14], [1210, 345, 1170, 280, 8], [1390, 335, 1440, 290, 7]]) {
      ctx.lineWidth = wd + 5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.strokeStyle = '#8c8378'; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.strokeStyle = '#2b1a0e';
    }
    // pohon utama yang hidup
    A.drawFoliage(ctx, 600, 190, 160, 124, ['#1f5233', '#2f7040', '#43884a', '#62a356']);
    A.drawFoliage(ctx, 1040, 180, 160, 125, ['#1f5233', '#2f7040', '#43884a', '#62a356']);
    A.drawTrunk(ctx, F.x, F.y - 10, 905, 112, { buttress: true, seed: 42 });
    ctx.lineCap = 'round';
    for (const [x2, y2, wd] of [[660, 210, 40], [990, 200, 38]]) {
      ctx.strokeStyle = '#2b1a0e'; ctx.lineWidth = wd + 6; ctx.beginPath(); ctx.moveTo(F.x, F.y + 10); ctx.quadraticCurveTo((F.x + x2) / 2, F.y - 40, x2, y2); ctx.stroke();
      ctx.strokeStyle = '#6b4a33'; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(F.x, F.y + 10); ctx.quadraticCurveTo((F.x + x2) / 2, F.y - 40, x2, y2); ctx.stroke();
    }
    A.drawFoliage(ctx, 820, 110, 210, 126, ['#1f5233', '#2f7040', '#43884a', '#62a356']);
  }

  class Nest {
    constructor(g, o) {
      this.g = g; this.def = o.def; this.rng = S.rng(o.seed); this.t = 0;
      this.scale = 1.05 * o.s;
      this.phase = 'choose'; this.wrongSpots = new Set();
      this.woven = 0; this.bed = 0; this.weaveOrder = S.rng(o.seed).shuffle([0, 1, 2, 3, 4, 5]);
      this.bendAnim = null; this.bedFly = []; this.bedTaken = new Set();
      this.pos = { x: 676, y: 868 - 26 * this.scale }; this.climb = null; this.sleeping = false;
      this.far = A.layer('nest-far', drawFar);
      this.fore = A.layer('nest-fore', drawFore);
      this.stars = [];
      for (let i = 0; i < 60; i++) this.stars.push({ x: this.rng() * 1600, y: this.rng() * 420, r: 1 + this.rng() * 2, ph: this.rng() * 6 });
      this.flies = [];
      for (let i = 0; i < 14; i++) this.flies.push({ x: this.rng() * 1600, y: 500 + this.rng() * 360, ph: this.rng() * 6 });
    }
    get total() { return 1 + CFG.nest.weave + CFG.nest.bed; }
    count() { return (this.phase === 'choose' ? 0 : 1) + this.woven + this.bed; }
    objective() {
      const n = this.count(), ph = C.nestPhase[this.phase] || '';
      return { text: S.tpl(this.def.objective, { n, m: this.total }) + (ph ? ' · ' + ph : ''), frac: n / this.total };
    }
    get done() { return this.sleeping; }
    get finishDelay() { return 2.2; }
    progress() { return S.clamp(this.t / Math.max(10, this.g.duration), 0, 1); }

    update(dt) {
      this.t += dt;
      if (this.climb) { this.climb.p += dt / this.climb.dur; if (this.climb.p >= 1) { this.pos = this.climb.to; this.climb = null; this.phase = 'weave'; } }
      if (this.bendAnim) { this.bendAnim.p += dt / 0.45; if (this.bendAnim.p >= 1) { this.bendAnim = null; this.woven++; if (this.woven >= CFG.nest.weave) this.phase = 'bed'; } }
      for (const b of this.bedFly) b.p += dt / 0.5;
      const landed = this.bedFly.filter((b) => b.p >= 1).length;
      if (landed) { this.bed += landed; this.bedFly = this.bedFly.filter((b) => b.p < 1); S.Audio.rustle(); }
      if (this.phase === 'bed' && this.bed >= CFG.nest.bed && !this.bedFly.length) { this.phase = 'sleep'; this.sleeping = true; }
    }
    onTimeUp() { if (!this.sleeping) UI.bubble(F.x, F.y - 40, C.nestPhase.sleep, C.nestDark); this.forcedSleep = true; }

    weaveGeom(i, bend) {
      const a = WEAVE_ANG[i] * D2R, c = Math.cos(a), s = Math.sin(a);
      const x0 = F.x + c * 70, y0 = F.y - 6 + s * 40;
      const tx = F.x + c * 230, ty = F.y - 6 + s * 170, rx = F.x - c * 60, ry = F.y - 4;
      return { x0, y0, x1: S.lerp(tx, rx, bend), y1: S.lerp(ty, ry, bend) };
    }

    pointer(x, y, tol) {
      if (this.climb || this.sleeping) return true;
      if (this.phase === 'choose') {
        for (const sp of SPOTS) {
          if (this.wrongSpots.has(sp.id) || S.dist(x, y, sp.x, sp.y) > 80 + tol) continue;
          if (sp.id === 'good') {
            this.phase = 'climbing';
            this.climb = { from: { x: this.pos.x, y: this.pos.y }, to: { x: F.x, y: F.y - 4 }, p: 0, dur: 1.2 };
            this.g.good(CFG.goodPoints, sp.x, sp.y, C.nestSpots.good);
            S.Audio.whoosh();
          } else {
            this.wrongSpots.add(sp.id);
            const t = C.nestSpots[sp.id];
            this.g.bad(CFG.badPenalty, sp.x, sp.y, t.title, t.text);
          }
          return true;
        }
        return false;
      }
      if (this.phase === 'weave') {
        if (this.bendAnim) return true;
        const want = this.weaveOrder[this.woven];
        for (let i = 0; i < 6; i++) {
          if (this.weaveOrder.indexOf(i) < this.woven) continue;
          const gm = this.weaveGeom(i, 0);
          if (S.segDist(x, y, gm.x0, gm.y0, gm.x1, gm.y1) > 42 + tol) continue;
          if (i === want) {
            this.bendAnim = { i, p: 0 };
            S.Audio.rustle();
            this.g.good(5, gm.x1, gm.y1);
          } else {
            this.g.bad(CFG.smallPenalty, gm.x1, gm.y1, C.nestWrong, '');
          }
          return true;
        }
        return false;
      }
      if (this.phase === 'bed') {
        for (let i = 0; i < BED.length; i++) {
          if (this.bedTaken.has(i)) continue;
          const b = BED[i];
          if (S.dist(x, y, b.x, b.y) > 62 + tol) continue;
          this.bedTaken.add(i);
          this.bedFly.push({ sx: b.x, sy: b.y, p: 0 });
          this.g.good(5, b.x, b.y);
          return true;
        }
        return false;
      }
      return false;
    }

    renderSky(ctx, now) {
      const k = this.progress();
      const top = k < 0.5 ? S.mixColor('#f4a96a', '#6a4f8f', k * 2) : S.mixColor('#6a4f8f', '#141c3c', (k - 0.5) * 2);
      const bot = k < 0.5 ? S.mixColor('#ffd59a', '#e2806a', k * 2) : S.mixColor('#e2806a', '#2c3463', (k - 0.5) * 2);
      const g = ctx.createLinearGradient(0, 0, 0, 640);
      g.addColorStop(0, top); g.addColorStop(1, bot);
      ctx.fillStyle = g; ctx.fillRect(0, 0, S.VW, S.VH);
      const sy = 260 + k * 420;
      const sg = ctx.createRadialGradient(1240, sy, 10, 1240, sy, 120);
      sg.addColorStop(0, 'rgba(255,236,170,.95)'); sg.addColorStop(0.35, 'rgba(255,200,120,.6)'); sg.addColorStop(1, 'rgba(255,180,100,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(1240, sy, 120, 0, S.TAU); ctx.fill();
      if (k > 0.55 || this.sleeping) {
        const a = this.sleeping ? 1 : (k - 0.55) / 0.45;
        for (const s of this.stars) { ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(now * 2 + s.ph)); ctx.fillStyle = '#fff8d8'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, S.TAU); ctx.fill(); }
        ctx.globalAlpha = 1;
      }
    }

    render(ctx, now) {
      this.renderSky(ctx, now);
      A.blit(ctx, this.far);
      A.blit(ctx, this.fore);
      // dahan yang akan dianyam
      if (this.phase === 'weave' || this.phase === 'climbing') {
        for (let i = 0; i < 6; i++) {
          if (this.weaveOrder.indexOf(i) < this.woven) continue;
          const bend = this.bendAnim && this.bendAnim.i === i ? S.ease.inOut(this.bendAnim.p) : 0;
          A.drawBranch(ctx, this.weaveGeom(i, bend), { seed: 50 + i, w: 16, leafy: 0.8, moss: false });
        }
      }
      // daun alas
      if (this.phase === 'bed') {
        for (let i = 0; i < BED.length; i++) {
          if (this.bedTaken.has(i)) continue;
          const b = BED[i];
          for (let k = 0; k < 4; k++) A.drawLeaf(ctx, b.x - 6, b.y + 6, 40, -1.2 + k * 0.6, k % 2 ? '#7cc85a' : '#5aa845', '#2e5e25', 0.45);
        }
      }
      this.renderBakti(ctx, now);
      if (this.phase !== 'choose' && this.phase !== 'climbing') A.drawNest(ctx, F.x, F.y - 2, 0.95, this.woven / CFG.nest.weave, this.bed / CFG.nest.bed, now);
      for (const b of this.bedFly) {
        const e = S.ease.inOut(Math.min(1, b.p));
        const x = S.lerp(b.sx, F.x, e), y = S.lerp(b.sy, F.y, e) - Math.sin(e * Math.PI) * 60;
        for (let k = 0; k < 3; k++) A.drawLeaf(ctx, x, y, 36 * (1 - e * 0.4), -1 + k * 0.7, '#6bb84a', '#2e5e25', 0.45);
      }
      // gelap malam (target tetap terlihat di atasnya)
      const k = this.progress();
      ctx.fillStyle = `rgba(10,14,40,${(this.sleeping ? 0.5 : 0.55 * Math.pow(k, 1.6)).toFixed(3)})`;
      ctx.fillRect(0, 0, S.VW, S.VH);
      if (this.sleeping || k > 0.6) {
        for (const f of this.flies) {
          const x = f.x + Math.sin(now * 0.7 + f.ph) * 30, y = f.y + Math.cos(now * 0.9 + f.ph) * 20;
          ctx.fillStyle = `rgba(230,255,140,${0.4 + 0.5 * Math.sin(now * 3 + f.ph)})`;
          ctx.beginPath(); ctx.arc(x, y, 3.2, 0, S.TAU); ctx.fill();
        }
      }
      this.renderTargets(ctx, now);
      if (this.sleeping) {
        for (let i = 0; i < 3; i++) {
          const p = (now * 0.5 + i / 3) % 1;
          ctx.globalAlpha = 1 - p;
          A.text(ctx, 'z', F.x + 50 + p * 50, F.y - 110 - p * 90, 26 + i * 8, '#fff8d8', 'center', 900);
        }
        ctx.globalAlpha = 1;
      }
    }

    renderTargets(ctx, now) {
      if (this.phase === 'choose') {
        for (const sp of SPOTS) {
          if (this.wrongSpots.has(sp.id)) { A.mark(ctx, sp.x, sp.y, false, 1.3); continue; }
          A.glow(ctx, sp.x, sp.y, 54, now + sp.x, '#fff1b0');
          A.text(ctx, '?', sp.x, sp.y + 2, 46, '#fff6d0', 'center', 900);
        }
      } else if (this.phase === 'weave' && !this.bendAnim) {
        const gm = this.weaveGeom(this.weaveOrder[this.woven], 0);
        A.glow(ctx, (gm.x0 + gm.x1) / 2, (gm.y0 + gm.y1) / 2, 62, now);
      } else if (this.phase === 'bed') {
        for (let i = 0; i < BED.length; i++) if (!this.bedTaken.has(i)) A.glow(ctx, BED[i].x, BED[i].y, 46, now + i);
      }
    }

    renderBakti(ctx, now) {
      let x = this.pos.x, y = this.pos.y, pose;
      if (this.climb) {
        const e = S.ease.inOut(this.climb.p);
        x = S.lerp(this.climb.from.x, this.climb.to.x, e); y = S.lerp(this.climb.from.y, this.climb.to.y, e);
        pose = Math.floor(this.climb.p * 6) % 2 ? 'climb' : 'climb2';
      } else if (this.sleeping || this.forcedSleep) pose = 'sleep';
      else if (this.phase === 'choose') pose = Object.assign({}, A.OU_POSES.sit, { face: 'neutral', look: 0.3, head: -8 });
      else if (this.bendAnim) pose = 'bend';
      else pose = Object.assign({}, A.OU_POSES.idle, { look: Math.sin(now * 0.6) * 0.6 });
      A.drawOrangutan(ctx, x, y, this.scale, pose, { t: now, blinkSeed: 3.3 });
    }
  }
  L.nest = Nest;
})();
