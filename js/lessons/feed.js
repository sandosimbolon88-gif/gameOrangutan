/* Pelajaran 1 · Nursery: beri Bakti makanan hutan, tolak makanan manusia, lengkapi menu sehat. */
(function () {
  'use strict';
  const S = window.SHB, A = S.Art, C = window.SHB_CONTENT, CFG = window.SHB_CONFIG;
  const L = (S.Lessons = S.Lessons || {});
  const ITEM_Y = 726, SPAWN_X = 1700, HIT_R = 60;
  const CATS = ['buah', 'daun', 'kulit', 'serangga'];
  const KINDS = { buah: ['ara', 'rambutan', 'durian'], daun: ['daun', 'bunga'], kulit: ['kulit', 'rotan'], serangga: ['rayap', 'madu'] };
  const CAT_ICON = { buah: 'ara', daun: 'daun', kulit: 'kulit', serangga: 'rayap' };
  const BAD = Object.keys(C.badFood);

  class Feed {
    constructor(g, o) {
      this.g = g; this.def = o.def; this.rng = S.rng(o.seed); this.t = 0;
      this.cfg = CFG.feed; this.need = this.cfg.perCategory;
      this.scale = 1.75 * o.s;
      this.got = { buah: 0, daun: 0, kulit: 0, serangga: 0 };
      this.items = []; this.fly = []; this.badRun = 0; this.lastKind = '';
      this.bakti = { x: 385, y: 600 - 24 * this.scale, eatKind: null, eatUntil: -1, sadUntil: -1 };
      this.bg = A.layer('feed', A.bgNursery);
      for (let x = 760; x < SPAWN_X; x += this.cfg.gap) this.spawn(x);
    }
    get total() { return CATS.length * this.need; }
    count() { return CATS.reduce((a, c) => a + Math.min(this.got[c], this.need), 0); }
    objective() { const n = this.count(); return { text: S.tpl(this.def.objective, { n, m: this.total }), frac: n / this.total }; }
    get done() { return this.count() >= this.total && this.fly.length === 0; }

    spawn(x) {
      const r = this.rng;
      let good = r() < this.cfg.goodRatio;
      if (this.badRun >= 2) good = true;
      let kind;
      if (good) {
        const open = CATS.filter((c) => this.got[c] + this.fly.filter((f) => f.cat === c).length < this.need);
        const pool = open.length && r() < 0.8 ? open : CATS;
        const cat = r.pick(pool);
        const opts = KINDS[cat].filter((k) => k !== this.lastKind);
        kind = r.pick(opts.length ? opts : KINDS[cat]);
        this.badRun = 0;
      } else {
        const opts = BAD.filter((k) => k !== this.lastKind);
        kind = r.pick(opts);
        this.badRun++;
      }
      this.lastKind = kind;
      this.items.push({ kind, good, cat: good ? C.goodFood[kind].cat : null, x, y: ITEM_Y, bob: r() * 6, state: 'lane', t0: 0 });
    }

    mouth() {
      const j = A.ouJoints('eat');
      return { x: this.bakti.x + j.head.x * this.scale, y: this.bakti.y + (j.head.y + 13) * this.scale };
    }

    update(dt) {
      this.t += dt;
      const speed = this.cfg.speed + this.cfg.speedUp * Math.min(1, this.t / 22);
      for (const it of this.items) {
        if (it.state === 'lane') it.x -= speed * dt;
        else if (it.state === 'rejected') { it.x -= speed * 0.4 * dt; it.t0 += dt; }
      }
      this.items = this.items.filter((it) => it.x > -90 && !(it.state === 'rejected' && it.t0 > 1.1) && it.state !== 'gone');
      const lastX = this.items.reduce((m, it) => Math.max(m, it.state === 'lane' ? it.x : -1e9), -1e9);
      if (lastX < SPAWN_X - this.cfg.gap) this.spawn(Math.max(SPAWN_X, lastX + this.cfg.gap));
      for (const f of this.fly) {
        f.p += dt / 0.55;
        if (f.p >= 1 && !f.arrived) {
          f.arrived = true;
          this.got[f.cat]++;
          this.bakti.eatKind = f.kind; this.bakti.eatUntil = this.t + 1.1;
          S.Audio.munch();
        }
      }
      this.fly = this.fly.filter((f) => !f.arrived);
    }

    pointer(x, y, tol) {
      let best = null, bd = 1e9;
      for (const it of this.items) {
        if (it.state !== 'lane') continue;
        const d = S.dist(x, y, it.x, it.y);
        if (d < HIT_R + tol && d < bd) { best = it; bd = d; }
      }
      if (!best) return false;
      if (best.good) {
        const name = C.goodFood[best.kind].name;
        const pending = this.got[best.cat] + this.fly.filter((f) => f.cat === best.cat).length;
        best.state = 'gone';
        const m = this.mouth();
        this.fly.push({ kind: best.kind, cat: best.cat, sx: best.x, sy: best.y, ex: m.x, ey: m.y, p: 0 });
        if (pending >= this.need) {
          this.g.float(best.x, best.y - 40, C.feedFull, '#cfe8ff');
          this.g.good(2, best.x, best.y);
        } else this.g.good(CFG.goodPoints, best.x, best.y, name);
      } else {
        const b = C.badFood[best.kind];
        best.state = 'rejected'; best.t0 = 0;
        this.bakti.sadUntil = this.t + 1.2;
        this.g.bad(CFG.badPenalty, best.x, best.y - 30, b.name + '? Jangan!', b.text);
      }
      return true;
    }

    baktiPose() {
      const b = this.bakti;
      if (this.t < b.eatUntil) return { pose: 'eat', hold: b.eatKind };
      if (this.fly.length) return { pose: 'beg' };
      if (this.t < b.sadUntil) return { pose: 'surprise' };
      let look = 0, best = 1e9;
      for (const it of this.items) if (it.good && it.state === 'lane' && it.x > b.x && it.x - b.x < best) { best = it.x - b.x; look = S.clamp((it.x - b.x) / 700, 0, 1); }
      return { pose: Object.assign({}, A.OU_POSES.sit, { look, face: this.done ? 'happy' : 'neutral' }) };
    }

    render(ctx, now) {
      A.blit(ctx, this.bg);
      const p = this.baktiPose();
      const breathe = Math.sin(now * 2.2) * 1.5;
      A.drawOrangutan(ctx, this.bakti.x, this.bakti.y + breathe, this.scale, p.pose, { t: now, hold: p.hold, blinkSeed: 1.3 });
      // makanan di atas batang kayu
      for (const it of this.items) {
        if (it.state === 'gone') continue;
        let x = it.x, y = it.y + Math.sin(now * 2 + it.bob) * 3, a = 1;
        if (it.state === 'rejected') { x += Math.sin(it.t0 * 40) * 6 * (1 - it.t0); y += it.t0 * it.t0 * 60; a = Math.max(0, 1 - it.t0); }
        ctx.save(); ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(30,50,20,.28)';
        ctx.beginPath(); ctx.ellipse(x, ITEM_Y + 46, 46, 8, 0, 0, S.TAU); ctx.fill();
        A.drawLeaf(ctx, x - 56, ITEM_Y + 40, 112, 0, '#6fae4a', '#3c6f2b', 0.18);
        A.drawFood(ctx, it.kind, x, y, 46, now);
        if (it.state === 'rejected') A.mark(ctx, x + 30, y - 32, false, 1.2);
        ctx.restore();
      }
      for (const f of this.fly) {
        const k = S.ease.inOut(Math.min(1, f.p));
        const x = S.lerp(f.sx, f.ex, k), y = S.lerp(f.sy, f.ey, k) - Math.sin(k * Math.PI) * 160;
        A.drawFood(ctx, f.kind, x, y, 46 - 26 * k, now);
      }
      this.renderMenu(ctx, now);
    }

    renderMenu(ctx, now) {
      const x = 1110, y = 192, w = 464, h = 178;
      A.panel(ctx, x, y, w, h, 'Menu sehat Bakti');
      CATS.forEach((c, i) => {
        const cx = x + 64 + i * 112, cy = y + 78;
        const full = this.got[c] >= this.need;
        if (full) { ctx.fillStyle = 'rgba(126,217,87,.22)'; ctx.beginPath(); ctx.arc(cx, cy, 36, 0, S.TAU); ctx.fill(); }
        A.drawFood(ctx, CAT_ICON[c], cx, cy, 28, now);
        A.text(ctx, C.foodCats[c], cx, cy + 46, 13, full ? '#bff0a0' : '#e8efe0', 'center', 800);
        for (let k = 0; k < this.need; k++) {
          const dx = cx + (k - (this.need - 1) / 2) * 24, dy = cy + 70;
          ctx.beginPath(); ctx.arc(dx, dy, 8, 0, S.TAU);
          if (k < this.got[c]) { ctx.fillStyle = '#ffd25e'; ctx.fill(); }
          else { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]); }
        }
        if (full) A.mark(ctx, cx + 28, cy - 26, true, 0.6);
      });
    }
  }
  L.feed = Feed;
})();
