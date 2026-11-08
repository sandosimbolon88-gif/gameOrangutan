/* Ujian akhir · Pulau pra-pelepasliaran: amati dan catat perilaku Bakti, jangan bantu.
   Godaan "beri makan" dan "elus" harus ditahan supaya Bakti tetap liar. */
(function () {
  'use strict';
  const S = window.SHB, A = S.Art, C = window.SHB_CONTENT, CFG = window.SHB_CONFIG, UI = S.UI;
  const L = (S.Lessons = S.Lessons || {});
  const BEHAVIORS = ['memanjat', 'makan', 'alat', 'sarang', 'menjauh'];
  const SP = {
    center: { x: 820, y: 612 }, shore: { x: 800, y: 742 },
    climbA: { x: 300, y: 540 }, climbB: { x: 300, y: 326 },
    nest: { x: 300, y: 214 }, eat: { x: 1186, y: 300 }, tool: { x: 676, y: 632 },
    awayA: { x: 980, y: 690 }, awayB: { x: 540, y: 610 }
  };
  const START = { memanjat: SP.climbA, makan: SP.eat, alat: SP.tool, sarang: SP.nest, menjauh: SP.awayA };

  class Island {
    constructor(g, o) {
      this.g = g; this.def = o.def; this.rng = S.rng(o.seed); this.t = 0;
      this.scale = 0.86 * o.s;
      this.queue = this.rng.shuffle(BEHAVIORS.slice());
      this.recorded = new Set();
      const dur = g.duration || 37;
      this.tempts = C.temptations.map((t, i) => Object.assign({}, t, { due: dur * CFG.island.temptAt[i], state: 'pending' }));
      this.pos = { x: SP.center.x, y: SP.center.y };
      this.nestBuilt = 0; this.boat = { x: 1900, show: false, leaving: false };
      this.eatUntil = -1; this.fly = null;
      this.bg = A.layer('island-back', A.bgIsland);
      this.front = A.layer('island-front', A.bgIslandFront);
      this.seg = null; this.finished = false;
      this.startSeg({ type: 'idle', dur: 1.2 });
    }
    resolved() { return this.tempts.filter((t) => t.state !== 'pending').length; }
    get total() { return BEHAVIORS.length + this.tempts.length; }
    count() { return this.recorded.size + this.resolved(); }
    objective() { return { text: S.tpl(this.def.objective, { n: this.count(), m: this.total }), frac: this.count() / this.total }; }
    get done() { return this.finished; }

    startSeg(seg) { seg.p = 0; seg.t = 0; seg.full = seg.dur; this.seg = seg; if (seg.type === 'tempt') this.openTempt(seg); if (seg.type === 'act' && seg.b === 'menjauh') { this.boat = { x: 1850, show: true, leaving: false }; } }
    moveTo(to, then) {
      const from = { x: this.pos.x, y: this.pos.y }, d = S.dist(from.x, from.y, to.x, to.y);
      if (d < 8) { this.startSeg(then); return; }
      this.startSeg({ type: 'move', from, to, dur: S.clamp(d / 520, 0.5, 1.2), then, vertical: Math.abs(to.x - from.x) < 40 });
    }

    nextSeg() {
      const prev = this.seg;
      if (prev.type === 'move') { this.startSeg(prev.then); return; }
      if (prev.type === 'act' && !this.recorded.has(prev.b)) this.queue.push(prev.b);
      if (this.recorded.size >= BEHAVIORS.length && this.resolved() >= this.tempts.length) { this.finished = true; this.startSeg({ type: 'idle', dur: 99 }); return; }
      const due = this.tempts.find((t) => t.state === 'pending' && this.t >= t.due);
      if (due && prev.type !== 'tempt') { this.moveTo(SP.shore, { type: 'tempt', tempt: due, dur: CFG.island.temptSec + 0.9 }); return; }
      if (prev.type === 'act' || prev.type === 'tempt') { this.startSeg({ type: 'idle', dur: this.rng.range(CFG.island.idleSec[0], CFG.island.idleSec[1]) }); return; }
      let b = this.queue.shift();
      while (b && this.recorded.has(b)) b = this.queue.shift();
      if (!b) {
        const pend = this.tempts.find((t) => t.state === 'pending');
        if (pend) { pend.due = this.t; this.moveTo(SP.shore, { type: 'tempt', tempt: pend, dur: CFG.island.temptSec + 0.9 }); }
        else this.startSeg({ type: 'idle', dur: 1 });
        return;
      }
      this.moveTo(START[b], { type: 'act', b, dur: CFG.island.actSec });
    }

    openTempt(seg) {
      const t = seg.tempt;
      const icon = this.g.icons[t.icon] || '';
      seg.ui = UI.showTempt(t, icon, CFG.island.temptSec, () => {
        if (this.destroyed) return;
        t.state = 'failed';
        this.g.bad(CFG.temptFail, SP.shore.x, SP.shore.y - 160, t.fail.title, t.fail.text);
        if (t.id === 'pisang') this.fly = { p: 0 };
        seg.dur = Math.min(seg.dur, seg.t + 1.6);
      }, () => {
        if (this.destroyed) return;
        t.state = 'passed';
        this.g.good(CFG.temptPass, SP.shore.x, SP.shore.y - 160, C.temptPassTitle);
        UI.bubble(SP.shore.x, SP.shore.y - 170, C.temptPassTitle, t.pass, true);
        seg.dur = Math.min(seg.dur, seg.t + 0.9);
      });
    }

    update(dt) {
      this.t += dt;
      const sg = this.seg;
      sg.t += dt; sg.p = Math.min(1, sg.t / sg.dur);
      const pa = Math.min(1, sg.t / sg.full); // progres animasi (tetap halus walau segmen dipersingkat)
      if (sg.type === 'move') {
        const e = S.ease.inOut(sg.p);
        this.pos.x = S.lerp(sg.from.x, sg.to.x, e);
        this.pos.y = S.lerp(sg.from.y, sg.to.y, e);
      } else if (sg.type === 'act') {
        if (sg.b === 'memanjat') { this.pos.x = SP.climbA.x; this.pos.y = S.lerp(SP.climbA.y, SP.climbB.y, S.ease.inOut(pa)); }
        if (sg.b === 'menjauh') { const e = S.ease.inOut(pa); this.pos.x = S.lerp(SP.awayA.x, SP.awayB.x, e); this.pos.y = S.lerp(SP.awayA.y, SP.awayB.y, e); }
        if (sg.b === 'sarang') this.nestBuilt = Math.max(this.nestBuilt, sg.p >= 1 ? 1 : pa);
      }
      if (this.fly) { this.fly.p += dt / 0.6; if (this.fly.p >= 1) { this.fly = null; this.eatUntil = this.t + 1.2; S.Audio.munch(); } }
      if (this.boat.show) {
        const target = this.boat.leaving ? 1900 : 1180;
        this.boat.x = S.approach(this.boat.x, target, this.boat.leaving ? 1.2 : 1.6, dt);
        if (this.boat.leaving && this.boat.x > 1850) this.boat.show = false;
      }
      if (sg.p >= 1) {
        if (sg.type === 'act' && sg.b === 'menjauh') this.boat.leaving = true;
        if (sg.type === 'tempt' && sg.tempt.state === 'pending') return; // menunggu tombol / waktu godaan
        this.nextSeg();
      }
    }

    pointer(x, y, tol) {
      const sg = this.seg, s = this.scale;
      const hit = S.dist(x, y, this.pos.x, this.pos.y - 48 * s) < 100 * s + tol;
      if (!hit) return false;
      if (sg.type === 'act') {
        const b = C.behaviors[sg.b];
        if (this.recorded.has(sg.b)) { this.g.float(x, y, C.already, '#cfe8ff'); return true; }
        this.recorded.add(sg.b); sg.recorded = true;
        sg.dur = Math.min(sg.dur, sg.t + 1.1); // setelah tercatat, Bakti lanjut ke kegiatan berikutnya
        S.Audio.pop();
        this.g.good(CFG.goodPoints, x, y, C.recorded + ': ' + b.name);
        UI.bubble(x, y - 40, b.name, b.text, true);
        return true;
      }
      if (sg.type === 'idle' && !this.finished) {
        this.g.bad(CFG.idlePenalty, x, y, C.idleTap.title, C.idleTap.text);
        return true;
      }
      return true;
    }

    destroy() { this.destroyed = true; if (this.seg && this.seg.ui) this.seg.ui.cancel(); UI.hideTempt(); }

    render(ctx, now) {
      A.blit(ctx, this.bg);
      // dahan pohon buah
      A.drawBranch(ctx, { x0: 1290, y0: 352, x1: 1090, y1: 336 }, { seed: 91, w: 26, leafy: 0.7 });
      for (let i = 0; i < 4; i++) A.drawFood(ctx, 'ara', 1230 + i * 30, 230 + (i % 2) * 24, 16, now);
      A.mossLog(ctx, 736, 900, 664, 46);
      if (this.nestBuilt > 0) A.drawNest(ctx, SP.nest.x, SP.nest.y + 8, 0.66, Math.min(1, this.nestBuilt * 1.2), Math.max(0, this.nestBuilt * 1.6 - 0.6), now);
      this.renderBakti(ctx, now);
      if (this.fly) {
        const e = S.ease.inOut(this.fly.p);
        A.drawFood(ctx, 'pisang', S.lerp(800, this.pos.x, e), S.lerp(880, this.pos.y - 70, e) - Math.sin(e * Math.PI) * 120, 30, now);
      }
      if (this.boat.show) A.drawBoat(ctx, this.boat.x, 800, 0.85, now);
      A.blit(ctx, this.front);
      this.renderNotebook(ctx, now);
    }

    renderBakti(ctx, now) {
      const sg = this.seg, s = this.scale;
      let pose, hold = null, flip = false, x = this.pos.x, y = this.pos.y;
      if (sg.type === 'move') {
        if (sg.vertical) pose = Math.floor(sg.t * 6) % 2 ? 'climb' : 'climb2';
        else { pose = Object.assign({}, A.OU_POSES.idle, { face: 'happy' }); y -= Math.abs(Math.sin(sg.p * Math.PI * 2)) * 34; flip = sg.to.x < sg.from.x; }
      } else if (sg.type === 'act') {
        switch (sg.b) {
          case 'memanjat': pose = Math.floor(sg.t * 5) % 2 ? 'climb' : 'climb2'; break;
          case 'makan': pose = 'eat'; hold = 'ara'; break;
          case 'alat': pose = Object.assign({}, A.OU_POSES.tool, { ra: [72 + Math.sin(now * 9) * 6, 94 + Math.sin(now * 9) * 8] }); hold = 'stick'; break;
          case 'sarang': pose = 'bend'; break;
          case 'menjauh': pose = Object.assign({}, A.OU_POSES.idle, { face: 'surprise', look: 1 }); y -= Math.abs(Math.sin(Math.min(1, sg.t / sg.full) * Math.PI * 3)) * 30; break;
        }
      } else if (sg.type === 'tempt') {
        pose = this.t < this.eatUntil ? 'eat' : 'beg';
        if (this.t < this.eatUntil) hold = 'pisang';
      } else {
        pose = Object.assign({}, A.OU_POSES[Math.floor(this.t / 2.5) % 3 === 1 ? 'scratch' : 'idle'], { look: Math.sin(now * 0.7) * 0.8 });
        if (this.t < this.eatUntil) { pose = 'eat'; hold = 'pisang'; }
      }
      if (this.seg.type !== 'move' && this.pos.y > 560 && this.pos.y < 760) {
        ctx.fillStyle = 'rgba(20,40,10,.25)'; ctx.beginPath(); ctx.ellipse(x, this.pos.y + 28 * s, 40 * s, 9 * s, 0, 0, S.TAU); ctx.fill();
      }
      A.drawOrangutan(ctx, x, y, s, pose, { t: now, hold, flip, blinkSeed: 4.1 });
    }

    renderNotebook(ctx, now) {
      const x = 140, y = 806, w = 1320, h = 80, step = 196, cx0 = x + 168;
      A.panel(ctx, x, y, w, h);
      A.text(ctx, C.notebookTitle.toUpperCase(), x + 22, y + 28, 15, '#ffda7e', 'left', 900);
      A.text(ctx, '✎', x + 22, y + 56, 22, '#ffda7e', 'left', 900);
      BEHAVIORS.forEach((b, i) => {
        const cx = cx0 + i * step, cy = y + h / 2, on = this.recorded.has(b);
        S.roundRect(ctx, cx - 6, cy - 22, step - 10, 44, 10);
        ctx.fillStyle = on ? 'rgba(126,217,87,.25)' : 'rgba(255,255,255,.07)'; ctx.fill();
        ctx.strokeStyle = on ? '#9fe07a' : 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; ctx.strokeRect(cx + 2, cy - 10, 20, 20);
        if (on) { ctx.strokeStyle = '#bff0a0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx + 5, cy); ctx.lineTo(cx + 11, cy + 7); ctx.lineTo(cx + 21, cy - 8); ctx.stroke(); }
        A.text(ctx, C.behaviors[b].name, cx + 30, cy + 1, 15, on ? '#e6ffd6' : '#f3f1e2', 'left', 800);
      });
      const tx = cx0 + 5 * step + 4;
      A.text(ctx, C.temptPassTitle, tx, y + 26, 14, '#ffda7e', 'left', 900);
      this.tempts.forEach((t, i) => {
        const cx = tx + 14 + i * 32, cy = y + 56;
        ctx.beginPath(); ctx.arc(cx, cy, 11, 0, S.TAU);
        ctx.fillStyle = t.state === 'passed' ? '#7ed957' : t.state === 'failed' ? '#e0614d' : 'rgba(255,255,255,.15)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
      });
    }
  }
  L.island = Island;
})();
