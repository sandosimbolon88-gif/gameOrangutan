/* Papan skor lokal (satu perangkat), disimpan di localStorage, dengan ekspor CSV dan cadangan JSON. */
(function () {
  'use strict';
  const S = window.SHB;
  const KEY = 'shb.leaderboard.v1', APP = 'sekolah-hutan-bakti';
  const LESSONS = ['feed', 'climb', 'forage', 'nest', 'island'];
  let memory = []; // cadangan jika localStorage tidak tersedia

  function dayKey(d) {
    d = d || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function cmp(a, b) { return b.score - a.score || (a.mistakes || 0) - (b.mistakes || 0) || a.ts - b.ts; }
  const int = (v, max) => Math.max(0, Math.min(max || 100000, Math.floor(Number(v) || 0)));

  const LB = (S.Leaderboard = {
    dayKey, LESSONS,
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        const a = raw ? JSON.parse(raw) : [];
        return Array.isArray(a) ? a : [];
      } catch (e) { return memory.slice(); }
    },
    saveAll(a) {
      const trimmed = a.slice(-5000);
      memory = trimmed;
      try { localStorage.setItem(KEY, JSON.stringify(trimmed)); } catch (e) { /* abaikan */ }
    },
    add(entry) {
      const a = LB.load();
      const e = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), ts: Date.now(), day: dayKey() }, entry);
      a.push(e);
      LB.saveAll(a);
      return e;
    },
    sorted(scope) {
      let a = LB.load();
      if (scope === 'today') { const k = dayKey(); a = a.filter((e) => e.day === k); }
      return a.sort(cmp);
    },
    top(scope, n) { return LB.sorted(scope).slice(0, n); },
    /* Peringkat yang akan didapat jika skor ini disimpan sekarang. */
    wouldRank(scope, score, mistakes) {
      const probe = { score, mistakes, ts: Date.now() };
      return LB.sorted(scope).filter((e) => cmp(e, probe) < 0).length + 1;
    },
    resetToday() { const k = dayKey(); LB.saveAll(LB.load().filter((e) => e.day !== k)); },
    resetAll() { LB.saveAll([]); },
    backup(settings) {
      return { app: APP, format: 1, exportedAt: new Date().toISOString(), settings: settings || null, leaderboard: LB.load() };
    },
    /* Gabungkan skor dari file cadangan (skor yang sudah ada tidak digandakan). */
    importBackup(data) {
      const list = Array.isArray(data) ? data : data && Array.isArray(data.leaderboard) ? data.leaderboard : null;
      if (!list || (data && data.app && data.app !== APP)) throw new Error('format');
      const cur = LB.load();
      const seen = new Set(cur.map((e) => e.id || e.ts + '|' + e.name));
      let added = 0, skipped = 0;
      for (const raw of list) {
        if (!raw || typeof raw !== 'object') { skipped++; continue; }
        const score = Math.floor(Number(raw.score)), ts = Number(raw.ts) || Date.now();
        if (!isFinite(score) || score < 0 || score > 100000) { skipped++; continue; }
        const e = {
          id: typeof raw.id === 'string' && raw.id ? raw.id.slice(0, 40) : ts.toString(36) + Math.random().toString(36).slice(2, 7),
          ts,
          day: typeof raw.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.day) ? raw.day : dayKey(new Date(ts)),
          name: String(raw.name || '').slice(0, 20) || 'Pengasuh',
          score,
          stars: int(raw.stars, 15),
          mistakes: int(raw.mistakes),
          timeBonus: int(raw.timeBonus),
          lessons: {},
          rulesVersion: int(raw.rulesVersion, 99) || 1
        };
        for (const k of LESSONS) e.lessons[k] = int(raw.lessons && raw.lessons[k]);
        if (seen.has(e.id) || seen.has(e.ts + '|' + e.name)) { skipped++; continue; }
        seen.add(e.id);
        cur.push(e);
        added++;
      }
      cur.sort((a, b) => a.ts - b.ts);
      LB.saveAll(cur);
      return { added, skipped };
    },
    csv() {
      const rows = [['tanggal', 'waktu', 'nama', 'skor', 'bintang', 'salah_langkah', 'bonus_waktu', 'poin_makan', 'poin_memanjat', 'poin_cari_makan', 'poin_sarang', 'poin_pulau', 'versi_aturan']];
      for (const e of LB.load().sort((a, b) => a.ts - b.ts)) {
        const d = new Date(e.ts), l = e.lessons || {};
        rows.push([e.day, d.toLocaleTimeString('id-ID'), e.name, e.score, e.stars || 0, e.mistakes || 0, e.timeBonus || 0, l.feed || 0, l.climb || 0, l.forage || 0, l.nest || 0, l.island || 0, e.rulesVersion || 1]);
      }
      return rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    }
  });
})();
