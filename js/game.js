/* Alur satu sesi: lima pelajaran berurutan (cara main → bermain → rapor), lalu hari pelepasliaran.
   Skor, penalti (skor minimum nol), bonus waktu, bintang, anti ketuk asal-asalan, dan teks melayang. */
(function () {
  'use strict';
  const S = window.SHB, C = window.SHB_CONTENT, CFG = window.SHB_CONFIG, UI = S.UI;

  class Game {
    constructor(opts) {
      this.onEnd = opts.onEnd;
      this.icons = opts.icons || {};
      this.lesson = null; this.release = null;
      this.active = false; this.paused = true; this.ending = false;
      this.floaters = [];
      this.rng = S.rng(S.randomSeed());
    }

    start(lessonSec) {
      this.stop();
      this.lessonSec = lessonSec;
      this.idx = -1; this.score = 0; this.mistakes = 0; this.results = [];
      this.seenFacts = new Set();
      this.rng = S.rng(S.randomSeed());
      this.sessionOver = false;
      UI.hud.score(0);
      UI.hud.show(true);
      this.nextLesson();
    }

    stop() {
      if (this.lesson && this.lesson.destroy) this.lesson.destroy();
      this.lesson = null; this.release = null; this.finale = null;
      this.active = false; this.paused = true; this.ending = false;
      this.floaters = [];
      UI.cancelIntro(); UI.hideTool(); UI.hideTempt();
      S.Audio.rain(false);
      document.getElementById('btn-skip-cutscene').classList.add('hidden');
      UI.hud.show(false);
    }

    get def() { return C.lessons[this.idx]; }

    nextLesson() {
      if (this.lesson && this.lesson.destroy) this.lesson.destroy();
      this.idx++;
      if (this.idx >= C.lessons.length) { this.beginRelease(); return; }
      const def = this.def, Cls = S.Lessons[def.id];
      this.duration = Math.round(this.lessonSec * (CFG.lessonFactor[def.id] || 1));
      this.timeLeft = this.duration;
      this.lessonPoints = 0; this.lessonMistakes = 0; this.missTimes = []; this.lockUntil = 0;
      this.active = false; this.paused = true; this.ending = false; this.timeUp = false;
      this.lastTick = Math.ceil(this.timeLeft);
      this.lesson = new Cls(this, { seed: this.rng.seed(), s: 1 + this.idx * 0.06, def });
      UI.hud.show(true);
      UI.hud.lesson(this.idx, C.lessons.length, def.title);
      UI.hud.time(this.timeLeft, this.duration);
      this.syncObjective();
      UI.showIntro(def, this.idx, C.lessons.length, this.duration, this.icons, () => {
        this.active = true; this.paused = false;
        S.Audio.start();
        if (this.lesson.begin) this.lesson.begin();
      });
    }

    setPaused(on) { this.paused = !!on; }

    syncObjective() {
      if (!this.lesson) return;
      const o = this.lesson.objective();
      if (o.text !== this._objText || o.frac !== this._objFrac) { UI.hud.objective(o.text, o.frac); this._objText = o.text; this._objFrac = o.frac; }
    }

    /* ---------- dipanggil oleh pelajaran ---------- */
    good(n, x, y, label) {
      this.score += n; this.lessonPoints += n;
      UI.hud.score(this.score, 'bump');
      this.float(x, y, (label ? label + '  ' : '') + '+' + n, '#ffe27a');
      S.Audio.good();
    }
    bad(n, x, y, title, text) {
      const actual = Math.min(this.score, n);
      this.score -= actual; this.lessonPoints -= actual;
      this.mistakes++; this.lessonMistakes++;
      UI.hud.score(this.score, 'hurt');
      this.float(x, y, '−' + n, '#ff8a7a');
      if (title) UI.bubble(x, y, title, text || '');
      S.Audio.bad();
    }
    /* Kesalahan tanpa potongan poin (mis. hujan terlewat). */
    slip() { this.mistakes++; this.lessonMistakes++; }
    float(x, y, text, color) { this.floaters.push({ x, y, text, color: color || '#fff', t: 0 }); }

    /* ---------- loop ---------- */
    update(dt) {
      for (const f of this.floaters) f.t += dt;
      this.floaters = this.floaters.filter((f) => f.t < 1.3);
      if (this.release) { this.release.update(dt); if (this.release.done) this.end(); return; }
      if (!this.lesson) return;
      if (this.active && !this.paused) {
        if (!this.ending) {
          this.timeLeft = Math.max(0, this.timeLeft - dt);
          const sec = Math.ceil(this.timeLeft);
          if (sec < this.lastTick) { this.lastTick = sec; if (sec <= 5 && sec > 0) S.Audio.tick(); }
          UI.hud.time(this.timeLeft, this.duration);
        }
        if (!(this.ending && this.timeUp)) this.lesson.update(dt); // saat waktu habis, adegan dibekukan
        this.syncObjective();
        if (!this.ending && this.lesson.done) {
          this.ending = true; this.endTimer = this.lesson.finishDelay || 1.6;
          UI.banner(this.def.done, '', '');
          S.Audio.clear();
        } else if (!this.ending && this.timeLeft <= 0) {
          this.ending = true; this.timeUp = true; this.endTimer = 1.5;
          if (this.lesson.onTimeUp) this.lesson.onTimeUp();
          UI.banner(C.ui.lessonTimeUp, '', 'calm');
          S.Audio.over();
        }
        if (this.ending) { this.endTimer -= dt; if (this.endTimer <= 0) this.finishLesson(); }
      } else if (this.lesson.idle) this.lesson.idle(dt);
    }

    finishLesson() {
      this.active = false; this.paused = true;
      UI.hideTool(); UI.hideTempt(); UI.clearBubbles();
      const L = this.lesson, completed = !this.timeUp && L.done;
      let timeBonus = 0;
      if (completed) { timeBonus = Math.ceil(this.timeLeft) * CFG.timeBonusPerSec; this.score += timeBonus; UI.hud.score(this.score, 'bump'); }
      const o = L.objective();
      let stars;
      if (completed) stars = this.lessonMistakes <= 1 ? 3 : 2;
      else stars = o.frac >= 0.5 ? 1 : 0;
      const r = { id: this.def.id, completed, stars, points: Math.max(0, this.lessonPoints) + timeBonus, timeBonus, mistakes: this.lessonMistakes };
      this.results.push(r);
      if (L.destroy) L.destroy();
      const last = this.idx >= C.lessons.length - 1;
      UI.showReport(r, this.pickFact(this.def.id), last, () => this.nextLesson());
    }

    pickFact(id) {
      const ids = (C.lessonFacts[id] || []).filter((f) => !this.seenFacts.has(f));
      const pick = ids.length ? ids[Math.floor(this.rng() * ids.length)] : (C.lessonFacts[id] || [])[0];
      this.seenFacts.add(pick);
      return C.facts.find((f) => f.id === pick) || C.facts[0];
    }

    beginRelease() {
      this.lesson = null;
      UI.hud.show(false);
      this.release = new S.Release(this, {});
      const skip = document.getElementById('btn-skip-cutscene');
      skip.classList.remove('hidden');
    }
    skipRelease() { if (this.release) this.release.skip(); }

    end() {
      if (this.sessionOver) return;
      this.sessionOver = true;
      document.getElementById('btn-skip-cutscene').classList.add('hidden');
      const stars = this.results.reduce((a, r) => a + r.stars, 0);
      const lessons = {};
      for (const r of this.results) lessons[r.id] = r.points;
      const summary = {
        score: this.score, stars, maxStars: C.lessons.length * 3, mistakes: this.mistakes,
        timeBonus: this.results.reduce((a, r) => a + r.timeBonus, 0), lessons, results: this.results.slice()
      };
      this.release.hideCard = true;
      this.finale = this.release;
      this.release = null;
      this.onEnd(summary);
    }

    /* ---------- input ---------- */
    pointer(x, y, tol) {
      if (this.release) { this.release.pointer(x, y); return; }
      if (!this.lesson || !this.active || this.paused || this.ending) return;
      const now = S.now();
      if (now < this.lockUntil) return;
      const hit = this.lesson.pointer(x, y, tol);
      if (!hit) {
        S.Audio.miss();
        this.missTimes = this.missTimes.filter((t) => now - t < CFG.spamWindowSec).concat(now);
        if (this.missTimes.length >= CFG.spamMisses) {
          this.missTimes = []; this.lockUntil = now + CFG.spamLockSec;
          UI.banner(C.ui.calm, '', 'calm');
        }
      }
    }

    /* ---------- gambar ---------- */
    render(ctx, now) {
      if (this.release) this.release.render(ctx, now);
      else if (this.lesson) this.lesson.render(ctx, now);
      else if (this.finale) this.finale.render(ctx, now);
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '900 34px ' + S.FONT; ctx.lineJoin = 'round';
      for (const f of this.floaters) {
        const k = f.t / 1.3, y = f.y - 30 - k * 60;
        ctx.globalAlpha = k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25;
        ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(20,30,20,.85)'; ctx.strokeText(f.text, f.x, y);
        ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, y);
      }
      ctx.restore();
    }
  }
  S.Game = Game;
  S.Lessons = S.Lessons || {};
})();
