/* Penutup: hari pelepasliaran. Pintu kandang angkut terbuka, Bakti memanjat ke kanopi,
   menebar biji, dan bibit baru tumbuh. Bisa dilewati. */
(function () {
  'use strict';
  const S = window.SHB, A = S.Art, C = window.SHB_CONTENT, CFG = window.SHB_CONFIG, UI = S.UI;
  const CAGE = { x: 520, y: 816 }, BASE = { x: 1010, y: 826 }, TRUNK_X = 1078, BR = { x0: 1110, y0: 318, x1: 860, y1: 300 };
  const GRIP = { x: 968, y: 306 }, SEED_TO = { x: 840, y: 846 };
  const T = { door: 1.0, out: 2.3, climb: 3.4, look: 5.6, eat: 6.8, seed: 7.9, grow: 9.0, card: 10.8, end: 19 };

  class Release {
    constructor(g) {
      this.g = g; this.t = 0; this.done = false; this.cues = new Set();
      this.scale = 1.15;
      this.bg = A.layer('release', A.bgRelease);
      UI.banner(C.release.kicker, '', '');
    }
    cue(name, fn) { if (!this.cues.has(name)) { this.cues.add(name); fn(); } }
    update(dt) {
      this.t += dt;
      const t = this.t;
      if (t > T.door) this.cue('door', () => S.Audio.whoosh());
      if (t > T.out) this.cue('out', () => S.Audio.hoot());
      if (t > T.eat) this.cue('eat', () => S.Audio.munch());
      if (t > T.grow) this.cue('grow', () => S.Audio.grow());
      if (t > T.card) this.cue('card', () => S.Audio.fanfare());
      if (t > T.end) this.done = true;
    }
    skip() { this.done = true; }
    pointer() { if (this.t > T.card + 1.2) this.done = true; }

    baktiState(now) {
      const t = this.t, s = this.scale;
      const sitY = (y) => y - 26 * s;
      if (t < T.out) return null;
      if (t < T.climb) {
        const p = (t - T.out) / (T.climb - T.out), e = S.ease.inOut(p);
        return { x: S.lerp(CAGE.x, BASE.x, e), y: sitY(S.lerp(CAGE.y - 10, BASE.y, e)) - Math.abs(Math.sin(p * Math.PI * 3)) * 40, pose: Object.assign({}, A.OU_POSES.idle, { face: 'happy', look: 0.6 }) };
      }
      if (t < T.look) {
        const p = (t - T.climb) / (T.look - T.climb);
        return { x: S.lerp(BASE.x, TRUNK_X - 52, Math.min(1, p * 4)), y: S.lerp(sitY(BASE.y), GRIP.y + 150, S.ease.inOut(p)), pose: Math.floor(t * 6) % 2 ? 'climb' : 'climb2' };
      }
      const off = A.ouGrip('hang', s);
      if (t < T.eat) {
        const p = Math.min(1, (t - T.look) / 0.5);
        return { x: S.lerp(TRUNK_X - 52, GRIP.x - off.x, p), y: S.lerp(GRIP.y + 150, GRIP.y - off.y, p), pose: Object.assign({}, A.OU_POSES.lookBack, { face: 'happy' }) };
      }
      return { x: GRIP.x - 10, y: GRIP.y - 14 - 26 * s, pose: 'eat', hold: t < T.seed + 0.6 ? 'ara' : null };
    }

    render(ctx, now) {
      const t = this.t;
      A.blit(ctx, this.bg);
      A.drawBranch(ctx, BR, { seed: 97, w: 30, leafy: 0.9 });
      if (t < T.eat) for (let i = 0; i < 3; i++) A.drawFood(ctx, 'ara', 900 + i * 26, 286 + (i % 2) * 14, 15, now);
      const door = S.clamp((t - T.door) / 1.0, 0, 1);
      A.drawCage(ctx, CAGE.x, CAGE.y, 0.92, door);
      if (t < T.out) {
        const blink = Math.sin(t * 3) > 0.92;
        if (!blink) { ctx.fillStyle = '#ffd98a'; for (const dx of [-12, 12]) { ctx.beginPath(); ctx.arc(CAGE.x + dx, CAGE.y - 80, 5, 0, S.TAU); ctx.fill(); } }
      }
      // biji jatuh lalu tumbuh
      if (t > T.seed) {
        const p = S.clamp((t - T.seed) / 0.9, 0, 1);
        if (p < 1) { ctx.fillStyle = '#6b3d1c'; ctx.beginPath(); ctx.ellipse(S.lerp(GRIP.x - 20, SEED_TO.x, p), S.lerp(GRIP.y + 10, SEED_TO.y, p * p), 6, 4, p * 6, 0, S.TAU); ctx.fill(); }
      }
      if (t > T.grow) A.drawSapling(ctx, SEED_TO.x, SEED_TO.y, S.ease.outCubic(S.clamp((t - T.grow) / 1.6, 0, 1)), now);
      const b = this.baktiState(now);
      if (b) A.drawOrangutan(ctx, b.x, b.y, this.scale, b.pose, { t: now, hold: b.hold, blinkSeed: 5 });
      if (t > T.grow && t < T.grow + 2) A.sparkle(ctx, SEED_TO.x, SEED_TO.y - 60, 1.4, now);
      if (t > T.card && !this.hideCard) this.renderCard(ctx, now);
    }

    renderCard(ctx, now) {
      const a = S.clamp((this.t - T.card) / 0.6, 0, 1);
      ctx.save(); ctx.globalAlpha = a;
      const x = 90, y = 120, w = 680;
      ctx.fillStyle = 'rgba(255,249,235,.96)';
      S.roundRect(ctx, x, y, w, 430, 26); ctx.fill();
      ctx.strokeStyle = '#e6cf9d'; ctx.lineWidth = 3; ctx.stroke();
      A.text(ctx, C.release.kicker.toUpperCase(), x + 40, y + 52, 18, '#b26a10', 'left', 900);
      A.text(ctx, C.release.title, x + 40, y + 100, 44, '#105b58', 'left', 900);
      const line = CFG.releasedCount ? S.tpl(C.release.countLine, { n: CFG.releasedCount, y: CFG.releasedSince }) : C.release.fallbackLine;
      let yy = y + 150;
      yy += A.wrapText(ctx, line, x + 40, yy, w - 80, 34, 25, '#183c3a', 'left', 800) + 14;
      A.wrapText(ctx, C.release.seedLine, x + 40, yy, w - 80, 30, 21, '#4a5a4a', 'left', 700);
      if (this.t > T.card + 1.2) {
        ctx.globalAlpha = a * (0.6 + 0.4 * Math.sin(now * 4));
        A.text(ctx, C.release.tapHint, x + w - 40, y + 400, 19, '#267d66', 'right', 900);
      }
      ctx.restore();
    }
  }
  S.Release = Release;
})();
