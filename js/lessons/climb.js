/* Pelajaran 2 · Memanjat: pilih dahan yang kuat untuk naik ke kanopi, hindari dahan lapuk. */
(function () {
  'use strict';
  const S = window.SHB, A = S.Art, C = window.SHB_CONTENT, CFG = window.SHB_CONFIG;
  const L = (S.Lessons = S.Lessons || {});
  const TRUNK_X = 800, TRUNK_W = 132, GROUND = 862, GRIP_SCREEN_Y = 440, PAR = 0.45;

  class Climb {
    constructor(g, o) {
      this.g = g; this.def = o.def; this.rng = S.rng(o.seed); this.t = 0;
      this.steps = CFG.climb.steps; this.gap = CFG.climb.gap;
      this.scale = 1.05 * o.s;
      const r = this.rng;
      this.levels = [];
      for (let i = 0; i < this.steps; i++) {
        const y0 = GROUND - 200 - i * this.gap, rottenSide = r.chance(0.5) ? -1 : 1, subtle = i >= CFG.climb.subtleFrom;
        const options = [-1, 1].map((side) => {
          const rotten = side === rottenSide;
          const g2 = A.branchGeom(TRUNK_X + side * TRUNK_W * 0.4, y0 + r.range(-12, 12), r.range(250, 300), side, r.range(10, 26));
          return { side, g: g2, rotten, broken: false, fallT: 0, seed: r.seed(), subtle, leafy: subtle ? 0.2 + r() * 0.35 : 1, dry: !subtle && r.chance(0.6) };
        });
        this.levels.push({ y0, options });
      }
      this.topY = this.levels[this.steps - 1].y0 - 300;
      this.cur = -1; this.curOpt = null;
      this.pos = { x: TRUNK_X - 150, y: GROUND - 26 * this.scale };
      this.anim = null; this.camY = 0; this.flinchUntil = -1; this.reached = false;
      this.par = this.buildParallax();
      this.lianas = [];
      for (let i = 0; i < 7; i++) this.lianas.push({ x: r.range(120, 1480), y: r.range(this.topY, GROUND - 300), len: r.range(220, 420), ph: r() * 6 });
    }
    objective() { const n = this.cur + 1; return { text: S.tpl(this.def.objective, { n, m: this.steps }), frac: n / this.steps }; }
    get done() { return this.reached && !this.anim; }

    buildParallax() {
      const R = S.R * 0.6, H = Math.ceil(900 + (GROUND - this.topY) * PAR + 100);
      this.parH = H;
      const c = S.makeCanvas(S.VW * R, H * R), ctx = c.getContext('2d');
      ctx.scale(R, R);
      const rnd = S.rng(77);
      for (let i = 0; i < 9; i++) {
        const x = 60 + i * 185 + rnd() * 60, w = 30 + rnd() * 40;
        if (Math.abs(x - TRUNK_X) < 160) continue;
        ctx.fillStyle = 'rgba(60,96,74,.55)'; ctx.fillRect(x - w / 2, 0, w, H);
      }
      for (let y = 80; y < H; y += 260) {
        for (let k = 0; k < 3; k++) {
          const x = rnd() * S.VW;
          ctx.globalAlpha = 0.5;
          A.drawFoliage(ctx, x, y + rnd() * 120, 110 + rnd() * 60, rnd.seed(), ['#3b6f52', '#4b8160', '#5c916b', '#77a679']);
        }
      }
      ctx.globalAlpha = 1;
      return c;
    }

    gripOf(opt) {
      const g = opt.g, k = 0.6;
      return { x: g.x0 + (g.x1 - g.x0) * k, y: g.y0 + (g.y1 - g.y0) * k };
    }
    hipFor(opt) {
      const gp = this.gripOf(opt), off = A.ouGrip('hang', this.scale);
      return { x: gp.x - off.x, y: gp.y - off.y + 4 };
    }

    update(dt) {
      this.t += dt;
      if (this.anim) {
        this.anim.p += dt / this.anim.dur;
        if (this.anim.p >= 1) { this.pos = this.anim.to; this.anim = null; }
      }
      for (const lv of this.levels) for (const o of lv.options) if (o.broken) o.fallT += dt;
      const target = this.curOpt ? Math.min(0, this.gripOf(this.curOpt).y - GRIP_SCREEN_Y) : 0;
      this.camY = S.approach(this.camY, target, 4, dt);
    }

    pointer(x, y, tol) {
      if (this.anim || this.reached) return true;
      const wy = y + this.camY, next = this.levels[this.cur + 1];
      if (!next) return false;
      let best = null, bd = 1e9;
      for (const o of next.options) {
        if (o.broken) continue;
        const g = o.g, d = Math.min(S.segDist(x, wy, g.x0, g.y0, g.x1, g.y1), S.dist(x, wy, g.x1, g.y1) - 25);
        if (d < 40 + tol && d < bd) { best = o; bd = d; }
      }
      if (!best) return false;
      if (best.rotten) {
        best.broken = true; best.fallT = 0;
        this.flinchUntil = this.t + 0.9;
        S.Audio.crack();
        this.g.bad(CFG.badPenalty, x, y, C.rotten.title, C.rotten.text);
      } else {
        const to = this.hipFor(best);
        this.anim = { from: { x: this.pos.x, y: this.pos.y }, to, p: 0, dur: 0.62, flip: to.x < this.pos.x };
        this.cur++; this.curOpt = best;
        if (this.cur >= this.steps - 1) this.reached = true;
        S.Audio.whoosh();
        this.g.good(CFG.goodPoints, x, y, C.climbGood);
      }
      return true;
    }

    renderBg(ctx) {
      const h = S.clamp(-this.camY / (GROUND - this.topY - 600), 0, 1);
      const g = ctx.createLinearGradient(0, 0, 0, S.VH);
      g.addColorStop(0, S.mixColor('#4f8a6c', '#bfe7e0', h));
      g.addColorStop(1, S.mixColor('#21462f', '#7fb79a', h));
      ctx.fillStyle = g; ctx.fillRect(0, 0, S.VW, S.VH);
      ctx.drawImage(this.par, 0, S.VH - this.parH - this.camY * PAR, S.VW, this.parH);
    }

    render(ctx, now) {
      this.renderBg(ctx);
      ctx.save(); ctx.translate(0, -this.camY);
      const viewTop = this.camY - 60, viewBot = this.camY + S.VH + 60;
      for (const l of this.lianas) {
        if (l.y > viewBot || l.y + l.len < viewTop) continue;
        const sw = Math.sin(now * 0.8 + l.ph) * 12;
        A.drawLiana(ctx, l.x, l.y, l.x + sw, l.y + l.len, 0, 5, 'rgba(70,95,45,.85)');
      }
      // tajuk di puncak
      A.drawFoliage(ctx, TRUNK_X - 260, this.topY + 120, 210, 81);
      A.drawFoliage(ctx, TRUNK_X + 280, this.topY + 90, 230, 82);
      A.drawTrunk(ctx, TRUNK_X, this.topY + 60, GROUND + 10, TRUNK_W, { buttress: true, seed: 21 });
      A.drawFoliage(ctx, TRUNK_X, this.topY + 40, 260, 83);
      for (let i = 0; i < 5; i++) A.drawFood(ctx, 'ara', TRUNK_X - 160 + i * 80, this.topY + 170 + (i % 2) * 30, 22, now);
      // tanah
      ctx.fillStyle = '#2f5a2a'; ctx.fillRect(-10, GROUND - 4, S.VW + 20, 200);
      A.fern(ctx, 300, GROUND, 1.2, '#3f7a35'); A.fern(ctx, 1320, GROUND, 1.1, '#3f7a35', true);
      A.grass(ctx, 0, S.VW, GROUND + 2, 30, '#4f8a35', 5);
      // dahan
      this.levels.forEach((lv, i) => {
        if (lv.y0 > viewBot + 200 || lv.y0 < viewTop - 200) return;
        for (const o of lv.options) {
          const opts = { rotten: o.rotten, seed: o.seed, subtle: o.subtle, leafy: o.leafy, dryLeaves: o.dry, w: 34 };
          if (o.broken) {
            if (o.fallT > 1.4) continue;
            opts.drop = o.fallT * 1.6; opts.dropY = o.fallT * o.fallT * 520; opts.alpha = Math.max(0, 1 - o.fallT / 1.4);
          }
          A.drawBranch(ctx, o.g, opts);
          if (i === this.cur + 1 && !o.broken && !this.anim) {
            const p = 0.5 + 0.5 * Math.sin(now * 4 + o.side);
            ctx.fillStyle = `rgba(255,246,190,${0.35 + p * 0.4})`;
            ctx.beginPath(); ctx.arc(o.g.x1, o.g.y1, 9 + p * 4, 0, S.TAU); ctx.fill();
          }
        }
      });
      this.renderBakti(ctx, now);
      ctx.restore();
      this.renderMeter(ctx, now);
    }

    renderBakti(ctx, now) {
      let x = this.pos.x, y = this.pos.y, pose, flip = false;
      if (this.anim) {
        const k = S.ease.inOut(Math.min(1, this.anim.p));
        x = S.lerp(this.anim.from.x, this.anim.to.x, k);
        y = S.lerp(this.anim.from.y, this.anim.to.y, k) - Math.sin(k * Math.PI) * 50;
        pose = k < 0.55 ? 'reach' : 'hang'; flip = this.anim.flip;
      } else if (this.cur < 0) {
        pose = Object.assign({}, A.OU_POSES.sit, { look: 0.4, face: 'neutral' });
      } else {
        const sw = Math.sin(now * 1.8) * 4;
        pose = Object.assign({}, A.OU_POSES.hang, { body: sw, face: this.reached ? 'happy' : 'neutral' });
        if (this.t < this.flinchUntil) pose.face = 'surprise';
      }
      if (this.cur < 0 && this.t < this.flinchUntil) pose = 'surprise';
      A.drawOrangutan(ctx, x, y, this.scale, pose, { t: now, flip, blinkSeed: 2.1 });
    }

    renderMeter(ctx, now) {
      const x = 64, y0 = 780, y1 = 230;
      A.panel(ctx, x - 34, y1 - 48, 68, y0 - y1 + 96);
      ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
      const n = this.cur + 1, k = n / this.steps;
      ctx.strokeStyle = '#ffd25e';
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 - (y0 - y1) * k); ctx.stroke();
      for (let i = 1; i <= this.steps; i++) {
        const yy = y0 - (y0 - y1) * (i / this.steps);
        ctx.fillStyle = i <= n ? '#ffd25e' : 'rgba(255,255,255,.45)';
        ctx.beginPath(); ctx.arc(x, yy, 5, 0, S.TAU); ctx.fill();
      }
      A.drawFoliage(ctx, x, y1 - 22, 22, 9, ['#2e6b3a', '#5aa64c', '#8cc65a'], { n: 6 });
      A.drawOrangutan(ctx, x, y0 - (y0 - y1) * k + 14, 0.26, 'hang', { t: now });
    }
  }
  L.climb = Climb;
})();
