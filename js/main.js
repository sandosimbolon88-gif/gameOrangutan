/* Titik masuk: ukuran layar, loop gambar, alur layar, mode kiosk, panel admin. */
(function () {
  'use strict';
  const S = window.SHB, A = S.Art, CFG = window.SHB_CONFIG, C = window.SHB_CONTENT, UI = S.UI;
  const W = S.VW, H = S.VH;
  const $ = (id) => document.getElementById(id);
  const SETTINGS_KEY = 'shb.settings.v1';

  const stage = $('stage'), canvas = $('game'), ctx = canvas.getContext('2d');
  let state = 'boot', lastInput = S.now(), lastFrame = 0, vignette = null, vignR = 0;
  let pendingResult = null, lastEntryId = null, boardTimer = null;

  /* ---------- pengaturan ---------- */
  const settings = Object.assign({ lessonSec: CFG.lessonSec, sound: true }, loadSettings());
  if (!CFG.lessonOptions.includes(settings.lessonSec)) settings.lessonSec = CFG.lessonSec;
  function loadSettings() { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch (e) { return {}; } }
  function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* abaikan */ } }
  function sessionMinutes() {
    const total = C.lessons.reduce((a, l) => a + settings.lessonSec * (CFG.lessonFactor[l.id] || 1), 0) + 40;
    return Math.max(1, Math.round(total / 30) / 2);
  }

  /* ---------- ukuran panggung 16:9 ---------- */
  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let w = vw, h = (vw * 9) / 16;
    if (h > vh) { h = vh; w = (vh * 16) / 9; }
    stage.style.width = w + 'px';
    stage.style.height = h + 'px';
    document.documentElement.style.setProperty('--u', w / 100 + 'px');
    const dpr = window.devicePixelRatio || 1;
    const R = S.clamp((w * dpr) / W, 0.6, 1.6);
    if (R !== S.R) { S.R = R; A.dropLayer(''); }
    canvas.width = Math.round(W * S.R);
    canvas.height = Math.round(H * S.R);
  }

  /* ---------- layar awal: Bakti berayun di sulur ---------- */
  const attract = {
    t0: 0,
    render(now) {
      const t = now - this.t0;
      A.blit(ctx, A.layer('attract', (c, w, h) => {
        A.bgCanopyBack(c, w, h);
        A.drawTrunk(c, 1460, -20, h + 20, 130, { seed: 61 });
        A.drawFoliage(c, 1460, 60, 200, 62);
        A.drawFoliage(c, 1040, 40, 220, 63);
        A.drawBranch(c, A.branchGeom(1400, 120, 520, -1, 30), { seed: 64, w: 40, leafy: 0.8 });
        A.fern(c, 980, h, 1.1, '#2f6a32', true);
        A.fern(c, 1500, h, 1, '#2f6a32');
      }));
      const px = 1150, py = 104, len = 300, th = Math.sin(t * 1.3) * 0.22;
      const gx = px + Math.sin(th) * len, gy = py + Math.cos(th) * len;
      ctx.strokeStyle = '#4d5f2a'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(px + Math.sin(th) * len * 0.5 + 10, py + len * 0.5, gx, gy); ctx.stroke();
      const s = 1.55, off = A.ouGrip('hang', s);
      const pose = Object.assign({}, A.OU_POSES.hang, { body: -th * 40, look: 0.4 + Math.sin(t * 0.4) * 0.4 });
      A.drawOrangutan(ctx, gx - off.x, gy - off.y, s, pose, { t: now, blinkSeed: 0 });
      A.blit(ctx, A.layer('attract-front', (c) => {
        A.drawFoliage(c, 1600, 0, 170, 65, ['#1f4f2c', '#2e6b3a', '#3f8a45', '#5aa64c']);
        A.drawFoliage(c, 760, -30, 140, 66, ['#1f4f2c', '#2e6b3a', '#3f8a45', '#5aa64c']);
      }));
    }
  };

  let game = null;

  /* ---------- alur layar ---------- */
  function goto(next, data) {
    const prev = state;
    state = next;
    lastInput = S.now();
    UI.clearBubbles();
    clearTimeout(boardTimer);
    if (prev === 'attract') { UI.stopAttractFacts(); S.Audio.ambient(false); }
    if (next === 'attract') {
      game.stop();
      $('session-length').textContent = '±' + S.tpl(C.ui.minutes, { s: String(sessionMinutes()).replace('.', ',') });
      $('session-lessons').textContent = S.tpl(C.ui.lessonsMeta, { n: C.lessons.length });
      attract.t0 = S.now();
      UI.show('screen-attract');
      UI.renderMiniBoard();
      UI.startAttractFacts();
      if (settings.sound) S.Audio.ambient(true);
    } else if (next === 'briefing') {
      game.stop();
      UI.show('screen-briefing');
    } else if (next === 'play') {
      UI.show(null);
      game.start(settings.lessonSec);
    } else if (next === 'result') {
      pendingResult = data;
      showResult(data);
    } else if (next === 'board') {
      UI.show('screen-board');
      UI.renderBoards(data && data.highlight);
      boardTimer = setTimeout(() => { if (state === 'board') goto('attract'); }, CFG.boardAutoReturnSec * 1000);
    }
  }

  function returnToMenu(settingsAfter) {
    if (state !== 'play' || !window.confirm(C.ui.leaveConfirm)) return;
    pendingResult = null;
    S.Audio.click();
    goto('attract');
    if (settingsAfter) openAdmin();
  }

  function showResult(res) {
    UI.show('screen-result');
    UI.hud.show(false);
    $('result-score').textContent = res.score;
    $('result-rapor').innerHTML = C.lessons.map((l, i) => {
      const r = res.results[i] || { stars: 0 };
      return '<li><b>' + [0, 1, 2].map((k) => '<span class="' + (k < r.stars ? '' : 'off') + '">★</span>').join('') + '</b>' + UI.esc(l.short) + '</li>';
    }).join('');
    $('result-stars').textContent = res.stars + '/' + res.maxStars;
    $('result-mistakes').textContent = res.mistakes;
    $('result-rank').textContent = '#' + S.Leaderboard.wouldRank('today', res.score, res.mistakes);
    const ratio = res.stars / res.maxStars;
    $('result-title').textContent = C.ui.resultTitles[ratio >= 0.8 ? 2 : ratio >= 0.5 ? 1 : 0];
    $('result-action').textContent = C.actions[Math.floor(Math.random() * C.actions.length)];
    UI.setName('');
    S.Audio.fanfare();
  }
  function saveResult(skip) {
    if (!pendingResult) return;
    const r = pendingResult;
    const name = skip ? C.ui.defaultName : UI.cleanName(UI.getName());
    const e = S.Leaderboard.add({ name, score: r.score, stars: r.stars, mistakes: r.mistakes, timeBonus: r.timeBonus, lessons: r.lessons, rulesVersion: CFG.rulesVersion });
    lastEntryId = e.id;
    pendingResult = null;
    S.Audio.click();
    goto('board', { highlight: lastEntryId });
  }

  /* ---------- loop gambar ---------- */
  function frame(ts) {
    const now = ts / 1000;
    const dt = Math.min(0.05, lastFrame ? now - lastFrame : 0);
    lastFrame = now;
    ctx.setTransform(S.R, 0, 0, S.R, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const nowS = S.now();
    try {
      if (state === 'play' || state === 'result') { game.update(dt); game.render(ctx, nowS); }
      else attract.render(nowS);
    } catch (err) { console.error(err); }
    if (!vignette || vignR !== S.R) { vignette = A.vignette(W, H, S.R, 0.4); vignR = S.R; }
    ctx.drawImage(vignette, 0, 0, W, H);
    // kembali ke layar awal jika ditinggal (tidak saat pelajaran sedang berjalan)
    const playingNow = state === 'play' && ((game.active && !game.paused) || game.release);
    if (state !== 'attract' && !playingNow && !UI.isOpen('overlay-admin') && nowS - lastInput > CFG.idleTimeoutSec) goto('attract');
    requestAnimationFrame(frame);
  }

  /* ---------- input ---------- */
  function toStage(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'play') return;
    e.preventDefault();
    const p = toStage(e), tol = e.pointerType === 'mouse' ? CFG.tolMouse : CFG.tolTouch;
    game.pointer(p.x, p.y, tol);
  });
  window.addEventListener('pointerdown', () => { lastInput = S.now(); S.Audio.unlock(); }, true);
  window.addEventListener('keydown', (e) => {
    lastInput = S.now();
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) { e.preventDefault(); if (state === 'play') returnToMenu(true); else openAdmin(); return; }
    if (UI.isOpen('overlay-admin')) return;
    if (e.key === 'Escape' && state === 'play') { e.preventDefault(); returnToMenu(); return; }
    if (state === 'result') {
      if (e.key === 'Enter') saveResult(false);
      else if (e.key === 'Backspace') { e.preventDefault(); UI.typeKey('DEL'); }
      else if (e.key === ' ') { e.preventDefault(); UI.typeKey('SPACE'); }
      else if (e.key.length === 1) UI.typeKey(e.key);
    } else if (state === 'attract' && (e.key === 'Enter' || e.key === ' ') && !UI.isOpen('overlay-program')) { S.Audio.unlock(); goto('briefing'); }
    else if (state === 'briefing' && (e.key === 'Enter' || e.key === ' ')) goto('play');
  });

  // mode kiosk: cegah zoom, menu klik kanan, seleksi
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => { if (state === 'play') e.preventDefault(); }, { passive: false });

  /* ---------- tombol ---------- */
  function on(id, fn) { $(id).addEventListener('click', (e) => { e.stopPropagation(); fn(e); }); }
  $('screen-attract').addEventListener('click', () => { if (state === 'attract') { S.Audio.unlock(); S.Audio.click(); goto('briefing'); } });
  on('btn-start', () => { S.Audio.unlock(); S.Audio.click(); goto('briefing'); });
  on('btn-board', () => { S.Audio.click(); goto('board'); });
  on('btn-fullscreen', () => toggleFullscreen());
  on('btn-program', () => UI.overlay('overlay-program', true));
  on('btn-program-close', () => UI.overlay('overlay-program', false));
  $('overlay-program').addEventListener('click', (e) => e.stopPropagation());
  on('btn-program-source', () => window.open(CFG.programUrl, '_blank', 'noopener,noreferrer'));
  on('btn-go', () => { S.Audio.click(); goto('play'); });
  on('btn-play-menu', () => returnToMenu());
  on('btn-skip-cutscene', () => { S.Audio.click(); game.skipRelease(); });
  on('btn-save', () => saveResult(false));
  on('btn-skip', () => saveResult(true));
  on('btn-again', () => { S.Audio.click(); goto('briefing'); });
  on('btn-home', () => { S.Audio.click(); goto('attract'); });
  on('btn-mute', () => { settings.sound = !settings.sound; applySound(); saveSettings(); });

  function applySound() {
    S.Audio.setEnabled(settings.sound);
    $('btn-mute').classList.toggle('is-off', !settings.sound);
    if (settings.sound && state === 'attract') S.Audio.ambient(true);
  }
  function toggleFullscreen() {
    const d = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      const el = d.documentElement;
      (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el);
    } else (d.exitFullscreen || d.webkitExitFullscreen || function () {}).call(d);
  }

  /* ---------- admin ---------- */
  let hotTaps = [];
  $('admin-hotspot').addEventListener('click', (e) => {
    e.stopPropagation();
    const now = S.now();
    hotTaps = hotTaps.filter((t) => now - t < 3).concat(now);
    if (hotTaps.length >= 5) { hotTaps = []; openAdmin(); }
  });
  function openAdmin() {
    if (state === 'play') return;
    UI.overlay('overlay-admin', true);
    $('admin-pin').classList.remove('hidden');
    adminMsg('');
    $('admin-menu').classList.add('hidden');
    UI.askPin((pin) => {
      if (pin === String(CFG.adminPin)) { $('admin-pin').classList.add('hidden'); $('admin-menu').classList.remove('hidden'); renderAdmin(); }
      else UI.pinError();
    });
  }
  function closeAdmin() {
    UI.overlay('overlay-admin', false);
    if (state === 'attract') { UI.renderMiniBoard(); $('session-length').textContent = '±' + S.tpl(C.ui.minutes, { s: String(sessionMinutes()).replace('.', ',') }); }
    if (state === 'board') UI.renderBoards(lastEntryId);
  }
  function renderAdmin() {
    const dur = $('admin-durations');
    dur.innerHTML = '';
    for (const s of CFG.lessonOptions) {
      const b = document.createElement('button');
      b.className = 'btn' + (settings.lessonSec === s ? ' on' : '');
      b.textContent = S.tpl(C.ui.adminSeconds, { s });
      b.onclick = (e) => { e.stopPropagation(); settings.lessonSec = s; saveSettings(); renderAdmin(); };
      dur.appendChild(b);
    }
    const snd = $('admin-sound');
    snd.innerHTML = '';
    for (const v of [true, false]) {
      const b = document.createElement('button');
      b.className = 'btn' + (settings.sound === v ? ' on' : '');
      b.textContent = v ? C.ui.adminOn : C.ui.adminOff;
      b.onclick = (e) => { e.stopPropagation(); settings.sound = v; applySound(); saveSettings(); renderAdmin(); };
      snd.appendChild(b);
    }
  }
  on('btn-admin-cancel', closeAdmin);
  on('btn-admin-close', closeAdmin);
  $('overlay-admin').addEventListener('click', (e) => e.stopPropagation());
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function adminMsg(text, err) { const m = $('admin-msg'); m.textContent = text || ''; m.classList.toggle('err', !!err); }
  on('btn-admin-export', () => download('skor-sekolah-hutan-bakti-' + S.Leaderboard.dayKey() + '.csv', '﻿' + S.Leaderboard.csv(), 'text/csv;charset=utf-8'));
  on('btn-admin-backup', () => {
    const stamp = S.Leaderboard.dayKey() + '-' + new Date().toTimeString().slice(0, 5).replace(':', '');
    download('cadangan-sekolah-hutan-bakti-' + stamp + '.json', JSON.stringify(S.Leaderboard.backup(settings), null, 1), 'application/json');
    adminMsg(C.ui.adminBackupDone);
  });
  on('btn-admin-import', () => { $('admin-import-file').value = ''; $('admin-import-file').click(); });
  $('admin-import-file').addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(String(rd.result).replace(/^﻿/, ''));
        const res = S.Leaderboard.importBackup(data);
        if (data && data.settings && typeof data.settings === 'object') {
          if (CFG.lessonOptions.includes(data.settings.lessonSec)) settings.lessonSec = data.settings.lessonSec;
          if (typeof data.settings.sound === 'boolean') settings.sound = data.settings.sound;
          saveSettings(); applySound(); renderAdmin();
        }
        adminMsg(S.tpl(C.ui.adminImported, res));
      } catch (err) { adminMsg(C.ui.adminImportFail, true); }
    };
    rd.onerror = () => adminMsg(C.ui.adminImportFail, true);
    rd.readAsText(f);
  });
  on('btn-admin-reset-today', () => { if (confirm(C.ui.adminConfirm)) S.Leaderboard.resetToday(); });
  on('btn-admin-reset-all', () => { if (confirm(C.ui.adminConfirm)) S.Leaderboard.resetAll(); });

  /* ---------- ikon (digambar dari seni kanvas yang sama) ---------- */
  function makeIcon(w, h, draw) {
    const c = S.makeCanvas(w * 2, h * 2), x = c.getContext('2d');
    x.scale(2, 2); draw(x, w, h);
    return c.toDataURL();
  }
  function buildIcons() {
    const icons = {};
    for (const k of A.FOOD_KINDS) icons[k] = A.foodIcon(k, 120);
    icons.branchGood = makeIcon(120, 120, (x) => A.drawBranch(x, A.branchGeom(4, 74, 110, 1, 14), { seed: 3, w: 22 }));
    icons.branchBad = makeIcon(120, 120, (x) => A.drawBranch(x, A.branchGeom(4, 70, 110, 1, 14), { rotten: true, seed: 4, w: 22, dryLeaves: true }));
    icons.nest = makeIcon(120, 120, (x) => { A.drawOrangutan(x, 60, 78, 0.5, 'sleep', { t: 0 }); A.drawNest(x, 60, 82, 0.62, 1, 1, 0); });
    icons.notebook = makeIcon(120, 120, (x) => {
      x.fillStyle = '#f6efd8'; x.strokeStyle = '#2b1a0e'; x.lineWidth = 3;
      S.roundRect(x, 26, 16, 70, 90, 8); x.fill(); x.stroke();
      x.strokeStyle = '#7aa0b8'; x.lineWidth = 2;
      for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(36, 36 + i * 14); x.lineTo(86, 36 + i * 14); x.stroke(); }
      x.strokeStyle = '#2f9a55'; x.lineWidth = 4; x.beginPath(); x.moveTo(36, 50); x.lineTo(42, 56); x.lineTo(52, 44); x.stroke();
      x.fillStyle = '#e8a33a'; x.save(); x.translate(92, 70); x.rotate(0.6); x.fillRect(-5, -36, 10, 56); x.fillStyle = '#3a2a1a'; x.beginPath(); x.moveTo(-5, 20); x.lineTo(5, 20); x.lineTo(0, 30); x.fill(); x.restore();
    });
    icons.hand = makeIcon(120, 120, (x) => {
      x.fillStyle = '#e7b48d'; x.strokeStyle = '#2b1a0e'; x.lineWidth = 3;
      x.beginPath(); x.ellipse(60, 74, 26, 30, 0, 0, S.TAU); x.fill(); x.stroke();
      for (const [dx, h] of [[-18, 34], [-6, 42], [6, 42], [18, 34]]) { S.roundRect(x, 60 + dx - 6, 60 - h, 12, h + 8, 6); x.fill(); x.stroke(); }
      x.beginPath(); x.ellipse(32, 72, 8, 16, -0.7, 0, S.TAU); x.fill(); x.stroke();
    });
    icons.feed = makeIcon(120, 120, (x) => A.drawOrangutan(x, 60, 92, 0.62, 'eat', { t: 0.2, hold: 'ara' }));
    icons.climb = makeIcon(120, 120, (x) => { A.drawBranch(x, A.branchGeom(0, 18, 120, 1, 0), { seed: 5, w: 14 }); A.drawOrangutan(x, 60, 84, 0.52, 'hang', { t: 0 }); });
    icons.forage = makeIcon(120, 120, (x) => A.drawOrangutan(x, 56, 98, 0.52, 'umbrella', { t: 0, hold: 'umbrella' }));
    icons.island = makeIcon(120, 120, (x) => {
      x.fillStyle = '#5fa6b0'; x.beginPath(); x.ellipse(60, 100, 58, 16, 0, 0, S.TAU); x.fill();
      x.fillStyle = '#6fa845'; x.beginPath(); x.ellipse(60, 96, 44, 11, 0, 0, S.TAU); x.fill();
      A.drawOrangutan(x, 60, 80, 0.5, 'idle', { t: 0 });
    });
    return icons;
  }

  /* ---------- mulai ---------- */
  function boot() {
    resize();
    window.addEventListener('resize', resize);
    UI.init();
    const icons = buildIcons();
    UI.buildRoadmap({ feed: icons.feed, climb: icons.climb, forage: icons.forage, nest: icons.nest, island: icons.island });
    game = new S.Game({ icons, onEnd: (res) => goto('result', res) });
    applySound();
    goto('attract');
    $('loading').classList.add('done');
    requestAnimationFrame(frame);
    if ('wakeLock' in navigator) {
      const lock = () => navigator.wakeLock.request('screen').catch(() => {});
      lock();
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') lock(); });
    }
    if (!window.SHB_SINGLE_FILE && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // akses untuk pengujian otomatis
  S.debug = { get game() { return game; }, goto, get state() { return state; }, settings };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
