/* Pelajaran 3 · Mencari makan: temukan makanan tersembunyi di kanopi, pilih alat yang tepat,
   dan cari daun lebar sebagai payung saat hujan. */
(function () {
  'use strict';
  const S = window.SHB, A = S.Art, C = window.SHB_CONTENT, CFG = window.SHB_CONFIG, UI = S.UI;
  const L = (S.Lessons = S.Lessons || {});
  const BRANCH = { x0: 200, y0: 700, x1: 1410, y1: 668 };
  const branchY = (x) => BRANCH.y0 + (BRANCH.y1 - BRANCH.y0) * ((x - BRANCH.x0) / (BRANCH.x1 - BRANCH.x0));
  const TARGETS = [
    { id: 'ara', type: 'food', x: 470, y: 300, food: 'ara', r: 40 },
    { id: 'rambutan', type: 'food', x: 1190, y: 296, food: 'rambutan', r: 38 },
    { id: 'daun', type: 'food', x: 830, y: 168, food: 'daun', r: 38 },
    { id: 'durian', type: 'food', x: 1010, y: 478, food: 'durian', r: 36 },
    { id: 'rayap', type: 'tool', x: 236, y: 486, food: 'rayap' },
    { id: 'air', type: 'tool', x: 1384, y: 470, food: 'leafSponge' }
  ];
  const RAIN_LEAVES = [{ x: 470, y: 772, a: -2.2 }, { x: 1180, y: 778, a: -0.9 }];

  function drawBack(ctx, w, h) {
    A.bgCanopyBack(ctx, w, h);
    A.drawFoliage(ctx, 300, 70, 170, 101);
    A.drawFoliage(ctx, 1450, 90, 170, 102);
    A.drawFoliage(ctx, 800, 70, 210, 103);
    A.drawTrunk(ctx, 210, -20, h + 20, 150, { seed: 31 });
    A.drawTrunk(ctx, 1400, -20, h + 20, 124, { seed: 32 });
    A.drawBranch(ctx, A.branchGeom(270, 420, 380, 1, 190), { seed: 33, w: 34, leafy: 0.8 });
    A.drawBranch(ctx, A.branchGeom(1350, 400, 360, -1, 170), { seed: 34, w: 30, leafy: 0.8 });
    A.drawBranch(ctx, A.branchGeom(1345, 440, 380, -1, 10), { seed: 35, w: 26, leafy: 0.5 });
    A.drawFoliage(ctx, 480, 250, 150, 104);
    A.drawFoliage(ctx, 1160, 240, 150, 105);
    A.drawLiana(ctx, 620, -10, 980, -10, 340, 6);
    A.drawLiana(ctx, 330, 120, 520, 0, 260, 5);
    // tanaman berdaun lebar di bawah dahan
    for (const p of RAIN_LEAVES) {
      ctx.strokeStyle = '#3b5a1e'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(p.x, h + 10); ctx.quadraticCurveTo(p.x - 20, p.y + 60, p.x, p.y + 10); ctx.stroke();
    }
    A.fern(ctx, 120, h, 1, '#2f6a32'); A.fern(ctx, 1520, h, 1, '#2f6a32', true);
    // dahan utama tempat Bakti duduk
    A.drawBranch(ctx, BRANCH, { seed: 36, w: 66, leafy: 0.5 });
  }
  function drawFront(ctx) {
    A.drawFoliage(ctx, 548, 350, 84, 111, ['#2a6136', '#3b8040', '#55a048', '#86c25a']);
    A.drawFoliage(ctx, 1112, 350, 80, 112, ['#2a6136', '#3b8040', '#55a048', '#86c25a']);
    A.drawFoliage(ctx, 904, 196, 76, 113, ['#2a6136', '#3b8040', '#55a048', '#86c25a']);
    A.drawFoliage(ctx, 1064, 520, 54, 114, ['#2a6136', '#3b8040', '#55a048', '#86c25a']);
    A.drawFoliage(ctx, 0, 0, 150, 115, ['#1f4f2c', '#2e6b3a', '#3f8a45']);
    A.drawFoliage(ctx, 1600, 0, 150, 116, ['#1f4f2c', '#2e6b3a', '#3f8a45']);
  }

  class Forage {
    constructor(g, o) {
      this.g = g; this.def = o.def; this.rng = S.rng(o.seed); this.t = 0;
      this.scale = 1.32 * o.s;
      this.bx = 800; this.by = branchY(800) - 30 - 24 * this.scale;
      this.found = new Set(); this.anims = []; this.lastFind = 0;
      this.rain = { started: false, start: 0, umbrella: false, end: 0, missed: false, over: false };
      this.eatUntil = -1; this.eatKind = null;
      this.back = A.layer('forage-back', drawBack);
      this.front = A.layer('forage-front', (ctx) => drawFront(ctx));
      this.drops = [];
      for (let i = 0; i < 140; i++) this.drops.push({ x: this.rng() * 1700, y: this.rng() * 900, v: 900 + this.rng() * 500 });
    }
    get total() { return TARGETS.length + (this.rain.missed ? 0 : 1); }
    count() { return this.found.size + (this.rain.umbrella ? 1 : 0); }
    objective() { return { text: S.tpl(this.def.objective, { n: this.count(), m: this.total }), frac: this.count() / this.total }; }
    get done() { return this.found.size >= TARGETS.length && this.rain.over && this.anims.length === 0; }

    update(dt) {
      this.t += dt;
      const fc = CFG.forage, r = this.rain;
      if (!r.started && (this.t >= fc.rainAt || this.found.size >= TARGETS.length)) {
        r.started = true; r.start = this.t;
        UI.banner(C.rain.start, C.rain.hint, '');
        S.Audio.rain(true);
      }
      if (r.started && !r.over) {
        if (r.umbrella && this.t > r.end) { r.over = true; S.Audio.rain(false); }
        else if (!r.umbrella && this.t - r.start > fc.rainMax) { r.over = true; r.missed = true; this.g.slip(); S.Audio.rain(false); }
      }
      for (const a of this.anims) {
        a.p += dt / a.dur;
        if (a.p >= 1 && !a.doneCb) { a.doneCb = true; if (a.after) a.after(); }
      }
      this.anims = this.anims.filter((a) => a.p < 1);
      const raining = r.started && !r.over;
      for (const d of this.drops) { d.y += d.v * dt; d.x -= d.v * 0.18 * dt; if (d.y > 920) { d.y = -20; d.x = this.rng() * 1700; } }
      this.raining = raining;
    }

    mouth() { const j = A.ouJoints('eat'); return { x: this.bx + j.head.x * this.scale, y: this.by + (j.head.y + 13) * this.scale }; }
    feed(kind, sx, sy) {
      const m = this.mouth();
      this.anims.push({ type: 'fly', kind, sx, sy, ex: m.x, ey: m.y, p: 0, dur: 0.6, after: () => { this.eatKind = kind; this.eatUntil = this.t + 1.2; S.Audio.munch(); } });
    }

    pointer(x, y, tol) {
      const r = this.rain;
      if (r.started && !r.over && !r.umbrella) {
        for (const p of RAIN_LEAVES) {
          if (S.dist(x, y, p.x + Math.cos(p.a) * 40, p.y + Math.sin(p.a) * 40) < 75 + tol) {
            r.umbrella = true; r.end = this.t + 3.5; this.lastFind = this.t;
            S.Audio.rustle();
            this.g.good(CFG.goodPoints, x, y, C.rain.got);
            UI.bubble(x, y, C.rain.got, C.rain.text, true);
            return true;
          }
        }
      }
      for (const tg of TARGETS) {
        if (this.found.has(tg.id)) continue;
        const rad = tg.type === 'tool' ? 52 : tg.r + 22;
        if (S.dist(x, y, tg.x, tg.y) > rad + tol) continue;
        if (tg.type === 'food') {
          this.found.add(tg.id); this.lastFind = this.t;
          this.g.good(CFG.goodPoints, tg.x, tg.y, C.forageItems[tg.id]);
          this.feed(tg.food, tg.x, tg.y);
        } else this.askTool(tg);
        return true;
      }
      return false;
    }

    askTool(tg) {
      const task = C.toolTasks[tg.id];
      this.g.setPaused(true);
      let solved = false;
      UI.showTool(task, this.g.icons, (opt, btn) => {
        if (solved || this.destroyed) return;
        const k = opt.id;
        if (opt.ok) {
          solved = true;
          UI.toolFeedback(btn, true, task.right);
          this.found.add(tg.id); this.lastFind = this.t;
          this.g.good(CFG.goodPoints, tg.x, tg.y, task.label);
          setTimeout(() => {
            if (this.destroyed) return;
            UI.hideTool(); this.g.setPaused(false);
            this.anims.push({ type: 'tool', tool: k, x: tg.x, y: tg.y, side: tg.x < 800 ? 1 : -1, p: 0, dur: 1.2, after: () => this.feed(tg.food, tg.x, tg.y) });
          }, 1500);
        } else {
          UI.toolFeedback(btn, false, opt.text);
          this.g.bad(CFG.badPenalty, tg.x, tg.y);
        }
      });
    }

    destroy() { this.destroyed = true; UI.hideTool(); S.Audio.rain(false); }

    render(ctx, now) {
      A.blit(ctx, this.back);
      A.drawHollow(ctx, 236, 486, 1.25, 'rayap', now);
      A.drawHollow(ctx, 1384, 470, 1.2, 'air', now);
      for (const tg of TARGETS) {
        if (tg.type !== 'food' || this.found.has(tg.id)) continue;
        if (tg.id === 'durian') { ctx.strokeStyle = '#4a2e18'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tg.x, tg.y - 60); ctx.lineTo(tg.x, tg.y - 30); ctx.stroke(); }
        A.drawFood(ctx, tg.food, tg.x, tg.y + Math.sin(now * 1.5 + tg.x) * 2, tg.r, now);
      }
      this.renderBakti(ctx, now);
      const r = this.rain;
      if (r.started && !r.over && !r.umbrella) {
        const grow = S.clamp((this.t - r.start) / 0.6, 0, 1);
        for (const p of RAIN_LEAVES) {
          A.drawBigLeaf(ctx, p.x, p.y + 10, 1.25 * S.ease.outBack(grow), p.a, false);
          if (this.t - r.start > 2.5) A.glow(ctx, p.x + Math.cos(p.a) * 55, p.y + Math.sin(p.a) * 55, 70, now);
        }
      } else {
        for (const p of RAIN_LEAVES) A.drawBigLeaf(ctx, p.x, p.y + 10, 0.55, p.a, false);
      }
      A.blit(ctx, this.front);
      for (const a of this.anims) this.renderAnim(ctx, a, now);
      if (this.raining) this.renderRain(ctx);
      if (!this.raining && this.t - this.lastFind > CFG.forage.hintAfter) {
        const tg = TARGETS.find((x) => !this.found.has(x.id));
        if (tg) { A.glow(ctx, tg.x, tg.y, 58, now); A.sparkle(ctx, tg.x + 30, tg.y - 30, 1.2, now); }
      }
    }

    renderBakti(ctx, now) {
      let pose, hold = null;
      const umbrellaOn = this.rain.umbrella && !this.rain.over;
      if (umbrellaOn) { pose = 'umbrella'; hold = 'umbrella'; }
      else if (this.t < this.eatUntil) { pose = 'eat'; hold = this.eatKind; }
      else if (this.raining) pose = Object.assign({}, A.OU_POSES.sad, { look: 0 });
      else {
        const tg = TARGETS.find((x) => !this.found.has(x.id));
        const look = tg ? S.clamp((tg.x - this.bx) / 500, -1, 1) : 0;
        pose = Object.assign({}, A.OU_POSES.sit, { look, face: 'neutral', head: tg && tg.y < 400 ? -4 : 0 });
      }
      A.drawOrangutan(ctx, this.bx, this.by + Math.sin(now * 2) * 1.2, this.scale, pose, { t: now, hold, blinkSeed: 0.6 });
    }

    renderAnim(ctx, a, now) {
      const k = Math.min(1, a.p);
      if (a.type === 'fly') {
        const e = S.ease.inOut(k);
        const x = S.lerp(a.sx, a.ex, e), y = S.lerp(a.sy, a.ey, e) - Math.sin(e * Math.PI) * 90;
        if (a.kind === 'leafSponge') {
          ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#5f9a3c'; ctx.strokeStyle = '#26431b'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(0, 0, 22 - 8 * e, 15 - 5 * e, 0.4, 0, S.TAU); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#9fd8ff'; ctx.beginPath(); ctx.arc(6, 10, 4, 0, S.TAU); ctx.fill(); ctx.restore();
        } else A.drawFood(ctx, a.kind, x, y, 36 - 18 * e, now);
      } else if (a.type === 'tool') {
        const poke = Math.sin(k * Math.PI * 4) * 16;
        ctx.save(); ctx.translate(a.x + a.side * (60 - poke), a.y + 10);
        ctx.scale(a.side, 1);
        if (a.tool !== 'daunLebar') { ctx.rotate(-0.15); A.drawFood(ctx, a.tool, -10, 0, 40, now); }
        else { ctx.fillStyle = '#5f9a3c'; ctx.strokeStyle = '#26431b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(-18, 0, 26, 16, 0.3, 0, S.TAU); ctx.fill(); ctx.stroke(); }
        ctx.restore();
        A.sparkle(ctx, a.x, a.y - 40, 1, now);
      }
    }

    renderRain(ctx) {
      ctx.save();
      ctx.fillStyle = 'rgba(30,50,70,.22)'; ctx.fillRect(0, 0, S.VW, S.VH);
      ctx.strokeStyle = 'rgba(210,235,255,.55)'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (const d of this.drops) { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 7, d.y + 34); }
      ctx.stroke();
      ctx.restore();
    }
  }
  L.forage = Forage;
})();
