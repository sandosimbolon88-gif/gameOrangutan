/* Lapisan antarmuka (DOM): layar, HUD, kartu, papan skor, keyboard nama, gelembung info. */
(function () {
  'use strict';
  const S = window.SHB, C = window.SHB_CONTENT, CFG = window.SHB_CONFIG;
  const $ = (id) => document.getElementById(id);
  const UI = (S.UI = {});

  const get = (path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), C);
  UI.t = (path, vars) => S.tpl(get(path) || '', vars);
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  UI.esc = esc;

  UI.init = function () {
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = UI.t(el.getAttribute('data-t')); });
    document.title = C.title;
    const tl = C.titleLines || [C.title];
    $('attract-title').innerHTML = '<span>' + esc(tl[0]) + '</span>' + (tl[1] ? '<span class="line2">' + esc(tl[1]) + '</span>' : '');
    $('attract-edition').textContent = C.edition;
    $('habitat-kicker').textContent = C.habitatKicker;
    $('habitat-name').textContent = C.habitatName;
    $('program-grid').innerHTML = C.program.cards.map((c) => '<div><b>' + esc(c.title) + '</b><p>' + esc(c.text) + '</p></div>').join('');
    $('program-count').textContent = CFG.releasedCount ? S.tpl(C.program.countLine, { n: CFG.releasedCount }) : '';
    UI.buildKeyboard();
    UI.buildPinpad();
  };

  /* ---------- layar ---------- */
  const screens = ['screen-attract', 'screen-briefing', 'overlay-intro', 'overlay-report', 'overlay-tool', 'screen-result', 'screen-board', 'overlay-program'];
  UI.show = function (id) { for (const s of screens) $(s).classList.toggle('active', s === id); };
  UI.overlay = function (id, on) { $(id).classList.toggle('active', !!on); };
  UI.isOpen = (id) => $(id).classList.contains('active');

  /* ---------- briefing: peta lima pelajaran ---------- */
  UI.buildRoadmap = function (icons) {
    $('roadmap').innerHTML = C.lessons.map((l) => '<li><img alt="" src="' + icons[l.id] + '"><b>' + esc(l.short) + '</b><span>' + esc(l.title) + '</span></li>').join('');
  };

  /* ---------- HUD ---------- */
  UI.hud = {
    show(on) { $('hud').classList.toggle('hidden', !on); $('btn-play-menu').classList.toggle('hidden', !on); },
    score(v, kind) {
      $('hud-score').textContent = v;
      if (kind) { const el = document.querySelector('.hud-score'); el.classList.remove('bump', 'hurt'); void el.offsetWidth; el.classList.add(kind); }
    },
    time(left, total) {
      $('hud-time').textContent = S.fmtTime(left);
      $('hud-timebar').style.width = S.clamp((left / total) * 100, 0, 100) + '%';
      document.querySelector('.hud-time').classList.toggle('low', left <= 6);
    },
    lesson(i, n, title) { $('hud-lesson-n').textContent = UI.t('ui.lessonOf', { n: i + 1, m: n }); $('hud-lesson-title').textContent = title; },
    objective(text, frac) { $('hud-objective').textContent = text; $('hud-progress').style.width = S.clamp(frac * 100, 0, 100) + '%'; }
  };

  /* ---------- banner & gelembung ---------- */
  let bannerTimer = null;
  UI.banner = function (title, sub, cls) {
    const b = $('banner');
    b.className = 'banner';
    b.innerHTML = esc(title) + (sub ? '<small>' + esc(sub) + '</small>' : '');
    void b.offsetWidth;
    b.className = 'banner show' + (cls ? ' ' + cls : '');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { b.className = 'banner'; }, 2000);
  };
  UI.bubble = function (x, y, title, text, good) {
    const box = $('bubbles');
    while (box.children.length > 1) box.removeChild(box.firstChild);
    const d = document.createElement('div');
    d.className = 'bubble' + (y < 330 ? ' below' : '') + (good ? ' good' : '');
    d.style.left = S.clamp((x / S.VW) * 100, 16, 84) + '%';
    d.style.top = S.clamp((y / S.VH) * 100, 8, 92) + '%';
    d.innerHTML = '<b>' + esc(title) + '</b><span>' + esc(text) + '</span>';
    box.appendChild(d);
    const life = 3000 + text.length * 25;
    setTimeout(() => d.classList.add('fade'), life);
    setTimeout(() => d.remove(), life + 450);
  };
  UI.clearBubbles = () => { $('bubbles').innerHTML = ''; };

  /* ---------- kartu cara main ---------- */
  let introTimer = null;
  UI.showIntro = function (lesson, idx, total, seconds, icons, onGo) {
    $('intro-n').textContent = UI.t('ui.lessonOf', { n: idx + 1, m: total });
    $('intro-stage').textContent = lesson.stage;
    $('intro-title').textContent = lesson.title;
    $('intro-how').innerHTML = lesson.how.map((h) => '<div class="' + (h.ok ? 'ok' : 'no') + '"><i>' + (h.ok ? '✓' : '✕') + '</i><img alt="" src="' + (icons[h.icon] || '') + '"><span>' + esc(h.text) + '</span></div>').join('');
    $('intro-time').textContent = UI.t('ui.introTime', { s: seconds });
    UI.show('overlay-intro');
    const bar = $('intro-auto');
    bar.classList.remove('run'); bar.style.transitionDuration = '0s'; void bar.offsetWidth;
    bar.style.transitionDuration = CFG.introAutoSec + 's'; bar.classList.add('run');
    let done = false;
    const go = () => { if (done) return; done = true; clearTimeout(introTimer); $('btn-intro-go').onclick = null; UI.show(null); onGo(); };
    clearTimeout(introTimer);
    introTimer = setTimeout(go, CFG.introAutoSec * 1000);
    $('btn-intro-go').onclick = (e) => { e.stopPropagation(); S.Audio.click(); go(); };
  };
  UI.cancelIntro = () => { clearTimeout(introTimer); $('btn-intro-go').onclick = null; };

  /* ---------- rapor per pelajaran ---------- */
  UI.showReport = function (r, fact, last, onNext) {
    $('report-badge').textContent = r.completed ? C.ui.lessonDone : C.ui.lessonTimeUp;
    $('report-stars').innerHTML = [0, 1, 2].map((i) => '<span class="' + (i < r.stars ? 'on' : '') + '">★</span>').join('');
    $('report-points').textContent = r.points;
    $('report-bonus').textContent = r.timeBonus ? '(' + C.ui.timeBonus + ' +' + r.timeBonus + ')' : '';
    $('report-fact-title').textContent = fact.title;
    $('report-fact-text').textContent = fact.text;
    $('btn-report-next').textContent = last ? C.ui.toRelease : C.ui.next;
    UI.show('overlay-report');
    for (let i = 0; i < r.stars; i++) setTimeout(() => S.Audio.star(i), 250 + i * 250);
    let done = false;
    $('btn-report-next').onclick = (e) => { e.stopPropagation(); if (done) return; done = true; S.Audio.click(); UI.show(null); onNext(); };
  };

  /* ---------- pilih alat ---------- */
  UI.showTool = function (task, icons, onPick) {
    $('tool-prompt').textContent = task.prompt;
    const msg = $('tool-msg'); msg.textContent = ''; msg.className = 'tool-msg';
    const box = $('tool-options');
    box.innerHTML = '';
    for (const k of ['ranting', 'daunLebar', 'batu']) {
      const b = document.createElement('button');
      b.className = 'btn';
      b.innerHTML = '<img alt="" src="' + icons[k] + '"><span>' + esc(C.tools[k]) + '</span>';
      b.addEventListener('click', (e) => { e.stopPropagation(); onPick(k, b); });
      box.appendChild(b);
    }
    UI.overlay('overlay-tool', true);
  };
  UI.toolFeedback = function (btn, ok, text) {
    btn.classList.add(ok ? 'right' : 'wrong');
    if (!ok) btn.disabled = true;
    const msg = $('tool-msg'); msg.textContent = text; msg.className = 'tool-msg' + (ok ? ' ok' : '');
    if (ok) document.querySelectorAll('#tool-options .btn').forEach((b) => { b.disabled = true; });
  };
  UI.hideTool = () => UI.overlay('overlay-tool', false);

  /* ---------- godaan ---------- */
  let temptTimer = null;
  UI.showTempt = function (t, icon, sec, onPress, onTimeout) {
    $('tempt-prompt').textContent = C.temptPrompt;
    $('tempt-label').textContent = t.button;
    $('tempt-icon').src = icon;
    $('tempt').classList.remove('hidden');
    const ring = $('tempt-ring');
    ring.classList.remove('run'); ring.style.transitionDuration = '0s'; void ring.offsetWidth;
    ring.style.transitionDuration = sec + 's'; ring.classList.add('run');
    let done = false;
    const end = (pressed) => { if (done) return; done = true; clearTimeout(temptTimer); $('tempt-btn').onclick = null; $('tempt').classList.add('hidden'); (pressed ? onPress : onTimeout)(); };
    $('tempt-btn').onclick = (e) => { e.stopPropagation(); end(true); };
    clearTimeout(temptTimer);
    temptTimer = setTimeout(() => end(false), sec * 1000);
    return { cancel() { done = true; clearTimeout(temptTimer); $('tempt').classList.add('hidden'); } };
  };
  UI.hideTempt = () => { clearTimeout(temptTimer); $('tempt').classList.add('hidden'); };

  /* ---------- layar awal ---------- */
  let factIdx = 0, factInt = null;
  UI.startAttractFacts = function () {
    const facts = S.rng(S.randomSeed()).shuffle(C.facts.slice());
    const put = () => {
      const card = document.querySelector('.fact-card-mini');
      card.classList.add('swap');
      setTimeout(() => {
        const f = facts[factIdx++ % facts.length];
        $('attract-fact-title').textContent = f.title;
        $('attract-fact-text').textContent = f.text;
        card.classList.remove('swap');
      }, 350);
    };
    clearInterval(factInt);
    put();
    factInt = setInterval(put, CFG.attractFactSec * 1000);
  };
  UI.stopAttractFacts = () => clearInterval(factInt);

  function listHTML(entries, highlightId, n) {
    if (!entries.length) return '<li class="empty">' + esc(C.ui.empty) + '</li>';
    return entries.slice(0, n).map((e, i) => '<li' + (e.id === highlightId ? ' class="me"' : '') + '><span class="n">' + (i + 1) + '</span><span class="nm">' + esc(e.name) + '</span><span class="sc">' + e.score + '</span></li>').join('');
  }
  UI.renderMiniBoard = function () {
    const top = S.Leaderboard.top('today', 5);
    $('attract-top').innerHTML = top.length ? listHTML(top, null, 5) : '<li class="empty">' + esc(C.ui.noScores) + '</li>';
  };
  UI.renderBoards = function (highlightId) {
    const fit = (list) => {
      const top = list.slice(0, 10);
      if (highlightId && !top.some((e) => e.id === highlightId)) {
        const i = list.findIndex((e) => e.id === highlightId);
        if (i >= 0) return { top: top.slice(0, 9), extra: { e: list[i], rank: i + 1 } };
      }
      return { top, extra: null };
    };
    for (const [id, list] of [['board-today', S.Leaderboard.sorted('today')], ['board-all', S.Leaderboard.sorted('all')]]) {
      const f = fit(list);
      let html = listHTML(f.top, highlightId, 10);
      if (f.extra) html += '<li class="me"><span class="n">' + f.extra.rank + '</span><span class="nm">' + esc(f.extra.e.name) + '</span><span class="sc">' + f.extra.e.score + '</span></li>';
      $(id).innerHTML = html;
    }
  };

  /* ---------- hasil & nama ---------- */
  let nameBuf = '';
  UI.setName = function (s) { nameBuf = s.slice(0, CFG.nameMaxLen); $('name-text').textContent = nameBuf; };
  UI.getName = () => nameBuf;
  UI.typeKey = function (k) {
    if (k === 'DEL') UI.setName(nameBuf.slice(0, -1));
    else if (k === 'SPACE') { if (nameBuf && !nameBuf.endsWith(' ')) UI.setName(nameBuf + ' '); }
    else if (/^[A-Za-z0-9]$/.test(k)) UI.setName(nameBuf + k.toUpperCase());
  };
  UI.buildKeyboard = function () {
    const rows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'], kb = $('keyboard');
    kb.innerHTML = '';
    const keyBtn = (label, code, cls) => {
      const b = document.createElement('button');
      b.className = 'key' + (cls ? ' ' + cls : '');
      b.textContent = label;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); S.Audio.click(); UI.typeKey(code); });
      return b;
    };
    rows.forEach((row, ri) => {
      const r = document.createElement('div'); r.className = 'kb-row';
      for (const ch of row) r.appendChild(keyBtn(ch, ch));
      if (ri === 2) r.appendChild(keyBtn(C.ui.del, 'DEL', 'mid'));
      kb.appendChild(r);
    });
    const r = document.createElement('div'); r.className = 'kb-row';
    r.appendChild(keyBtn(C.ui.space, 'SPACE', 'wide'));
    kb.appendChild(r);
  };
  UI.cleanName = function (raw) {
    const name = (raw || '').trim().replace(/\s+/g, ' ');
    if (!name) return C.ui.defaultName;
    const low = name.toLowerCase(), squashed = low.replace(/[^a-z]/g, ''), words = low.split(/[^a-z]+/);
    for (const w of C.blockedWords) if (w.length <= 4 ? words.includes(w) : squashed.includes(w)) return C.ui.defaultName;
    return name;
  };

  /* ---------- PIN admin ---------- */
  let pinBuf = '', pinCb = null;
  UI.buildPinpad = function () {
    const pad = $('pinpad');
    pad.innerHTML = '';
    for (const k of ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'DEL', '0', 'OK']) {
      const b = document.createElement('button');
      b.className = 'key';
      b.textContent = k === 'DEL' ? '⌫' : k === 'OK' ? '✓' : k;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (k === 'DEL') pinBuf = pinBuf.slice(0, -1);
        else if (k === 'OK') { if (pinCb) pinCb(pinBuf); return; }
        else if (pinBuf.length < 8) pinBuf += k;
        renderPin();
      });
      pad.appendChild(b);
    }
  };
  function renderPin(err) {
    const d = $('pin-display');
    d.classList.toggle('err', !!err);
    d.textContent = err ? C.ui.adminWrong : '•'.repeat(pinBuf.length);
  }
  UI.askPin = function (cb) { pinBuf = ''; pinCb = cb; renderPin(); };
  UI.pinError = function () { pinBuf = ''; renderPin(true); };
})();
