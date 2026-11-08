// Uji regresi di browser: memainkan kelima pelajaran lewat klik sungguhan di kanvas,
// memeriksa skor, penalti, bintang, rapor, papan skor, panel admin, dan tata letak.
// Pemakaian: node tools/test-game.mjs  (butuh Playwright + Chromium; SHB_TEST_OUTPUT untuk folder tangkapan layar)
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require(path.join(process.execPath, '../../lib/node_modules/playwright')); }
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = process.env.SHB_TEST_OUTPUT || path.join(os.tmpdir(), 'shb-qa');
const FILE = process.argv[2]; // opsional: uji berkas dist satu file
await mkdir(OUT, { recursive: true });

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith(path.sep)) p += 'index.html';
  try { const d = await readFile(p); res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(d); }
  catch (e) { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

let failures = 0;
const check = (cond, msg) => { if (!cond) { failures++; console.error('  ✗ ' + msg); } else console.log('  ✓ ' + msg); };

const browser = await playwright.chromium.launch({ args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', (d) => d.accept());

const wait = (ms) => page.waitForTimeout(ms);
const ev = (fn, arg) => page.evaluate(fn, arg);
async function clickStage(x, y) {
  const r = await page.locator('#game').boundingBox();
  await page.mouse.click(r.x + (x / 1600) * r.width, r.y + (y / 900) * r.height);
}
async function inViewport(sel) {
  const b = await page.locator(sel).boundingBox(), v = page.viewportSize();
  return b && b.x >= 0 && b.y >= 0 && b.x + b.width <= v.width + 1 && b.y + b.height <= v.height + 1;
}
const lesson = () => ev(() => { const g = SHB.debug.game; return { id: g.def && g.def.id, active: g.active, paused: g.paused, ending: g.ending, score: g.score }; });
async function startLesson(id) {
  await page.waitForSelector('#overlay-intro.active');
  check((await ev(() => SHB.debug.game.def.id)) === id, `kartu cara main pelajaran ${id}`);
  check(await inViewport('.intro-panel'), `kartu cara main ${id} muat di layar`);
  await page.click('#btn-intro-go');
  await page.waitForFunction(() => SHB.debug.game.active && !SHB.debug.game.paused);
}
async function finishLesson(id, shot) {
  await page.waitForSelector('#overlay-report.active', { timeout: 15000 });
  const r = await ev(() => SHB.debug.game.results.slice(-1)[0]);
  check(r.id === id && r.completed, `pelajaran ${id} selesai (${r.stars} bintang, ${r.points} poin)`);
  await page.screenshot({ path: path.join(OUT, shot) });
  await page.click('#btn-report-next');
  return r;
}

try {
  await page.goto(FILE ? 'file://' + path.resolve(FILE) : BASE + '/');
  await page.waitForFunction(() => window.SHB?.debug?.state === 'attract');
  await wait(800);
  await page.screenshot({ path: path.join(OUT, '01-beranda.png') });
  console.log('Beranda');
  check(await inViewport('.attract-side'), 'kartu beranda muat di layar');
  await page.click('#btn-program');
  check(await page.locator('#overlay-program.active').count() === 1, 'panel Kenali Program terbuka');
  check((await page.textContent('#program-count')).includes('49'), 'angka program tampil dari config');
  check(await inViewport('.program-panel'), 'panel program muat di layar');
  await page.click('#btn-program-close');
  check((await ev(() => SHB.debug.state)) === 'attract', 'menutup panel tidak memulai permainan');

  console.log('Briefing');
  await page.click('#btn-start');
  check(await page.locator('.roadmap li').count() === 5, 'peta lima pelajaran');
  check(await inViewport('.brief-panel'), 'briefing muat di layar');
  await page.screenshot({ path: path.join(OUT, '02-briefing.png') });
  await page.click('#btn-go');

  /* ---------- 1 · makan ---------- */
  console.log('Pelajaran 1 · Makan');
  await startLesson('feed');
  const durFeed = await ev(() => SHB.debug.game.duration);
  check(durFeed === 25, 'durasi bawaan 25 detik');
  // satu kesalahan: makanan manusia
  await page.waitForFunction(() => SHB.debug.game.lesson.items.some((i) => !i.good && i.state === 'lane' && i.x > 120 && i.x < 1480));
  const bad = await ev(() => { const i = SHB.debug.game.lesson.items.find((i) => !i.good && i.state === 'lane' && i.x > 120 && i.x < 1480); return { x: i.x, y: i.y }; });
  const before = (await lesson()).score;
  await clickStage(bad.x - 4, bad.y);
  const afterBad = await ev(() => ({ score: SHB.debug.game.score, mistakes: SHB.debug.game.mistakes }));
  check(afterBad.score === 0 && before === 0 && afterBad.mistakes === 1, 'makanan manusia: salah tercatat, skor tidak minus');
  await wait(300);
  await page.screenshot({ path: path.join(OUT, '10-makan-salah.png') });
  for (let n = 0; n < 60; n++) {
    const st = await ev(() => { const L = SHB.debug.game.lesson; if (!L || L.done) return { done: true }; const need = (c) => L.got[c] + L.fly.filter((f) => f.cat === c).length < L.need; const i = L.items.find((i) => i.good && i.state === 'lane' && need(i.cat) && i.x > 140 && i.x < 1460); return i ? { x: i.x, y: i.y } : null; });
    if (!st) { await wait(250); continue; }
    if (st.done) break;
    await clickStage(st.x - 6, st.y);
    await wait(120);
  }
  await page.screenshot({ path: path.join(OUT, '11-makan.png') });
  const r1 = await finishLesson('feed', '12-rapor-makan.png');
  check(r1.stars === 3 && r1.timeBonus > 0, 'satu salah tetap tiga bintang + bonus waktu');

  /* ---------- 2 · memanjat ---------- */
  console.log('Pelajaran 2 · Memanjat');
  await startLesson('climb');
  for (let step = 0; step < 8; step++) {
    await page.waitForFunction(() => { const L = SHB.debug.game.lesson; return !L.anim; });
    await wait(450);
    const opt = await ev((rotten) => {
      const L = SHB.debug.game.lesson, lv = L.levels[L.cur + 1], o = lv.options.find((o) => o.rotten === rotten && !o.broken) || lv.options.find((o) => !o.rotten);
      return { x: (o.g.x0 + o.g.x1) / 2 + (o.g.x1 - o.g.x0) * 0.15, y: (o.g.y0 + o.g.y1) / 2 - L.camY, rotten: o.rotten };
    }, step === 0);
    await clickStage(opt.x, opt.y);
    if (opt.rotten) {
      check((await ev(() => SHB.debug.game.lesson.cur)) === -1, 'dahan lapuk patah, Bakti tidak naik');
      await wait(400);
      await page.screenshot({ path: path.join(OUT, '20-dahan-lapuk.png') });
      step--;
    }
  }
  await page.screenshot({ path: path.join(OUT, '21-memanjat.png') });
  const r2 = await finishLesson('climb', '22-rapor-memanjat.png');
  check(r2.mistakes === 1, 'memanjat: satu dahan lapuk tercatat');

  /* ---------- 3 · cari makan ---------- */
  console.log('Pelajaran 3 · Cari makan');
  await startLesson('forage');
  const foods = [[470, 300], [1190, 296], [830, 168], [1010, 478]];
  for (const [x, y] of foods) { await clickStage(x, y); await wait(150); }
  check((await ev(() => SHB.debug.game.lesson.found.size)) === 4, 'empat makanan tersembunyi ditemukan');
  // alat: rayap (salah dulu, lalu benar)
  await clickStage(236, 486);
  await page.waitForSelector('#overlay-tool.active');
  check(await ev(() => SHB.debug.game.paused), 'waktu berhenti saat memilih alat');
  await page.screenshot({ path: path.join(OUT, '30-pilih-alat.png') });
  check(await page.locator('#tool-options .btn').count() === 4, 'empat pilihan ranting');
  await page.locator('#tool-options .btn[data-tool="rantingPendek"]').click();
  check((await page.textContent('#tool-msg')).includes('pendek'), 'penjelasan ranting yang salah');
  await page.locator('#tool-options .btn[data-tool="rantingPanjang"]').click();
  await page.waitForSelector('#overlay-tool.active', { state: 'detached' }).catch(() => {});
  await page.waitForFunction(() => !SHB.debug.game.paused);
  await clickStage(1384, 470);
  await page.waitForSelector('#overlay-tool.active');
  await page.locator('#tool-options .btn[data-tool="daunLebar"]').click();
  await page.waitForFunction(() => !SHB.debug.game.paused);
  await page.waitForFunction(() => SHB.debug.game.lesson.rain.started, null, { timeout: 12000 });
  await wait(900);
  await page.screenshot({ path: path.join(OUT, '31-hujan.png') });
  await clickStage(470 + Math.cos(-2.2) * 40, 782 + Math.sin(-2.2) * 40);
  check(await ev(() => SHB.debug.game.lesson.rain.umbrella), 'daun lebar jadi payung');
  await wait(600);
  await page.screenshot({ path: path.join(OUT, '32-payung.png') });
  const r3 = await finishLesson('forage', '33-rapor-cari-makan.png');
  check(r3.mistakes === 1, 'cari makan: satu alat salah tercatat');

  /* ---------- 4 · sarang ---------- */
  console.log('Pelajaran 4 · Sarang');
  await startLesson('nest');
  await clickStage(330, 770);
  check((await ev(() => SHB.debug.game.lesson.phase)) === 'choose', 'semak rendah ditolak');
  await clickStage(820, 372);
  await page.waitForFunction(() => SHB.debug.game.lesson.phase === 'weave');
  await page.screenshot({ path: path.join(OUT, '40-sarang-anyam.png') });
  for (let k = 0; k < 6; k++) {
    await page.waitForFunction(() => !SHB.debug.game.lesson.bendAnim);
    const p = await ev(() => { const L = SHB.debug.game.lesson, g = L.weaveGeom(L.weaveOrder[L.woven], 0); return { x: (g.x0 + g.x1) / 2, y: (g.y0 + g.y1) / 2 }; });
    await clickStage(p.x, p.y);
  }
  await page.waitForFunction(() => SHB.debug.game.lesson.phase === 'bed');
  for (const [x, y] of [[600, 300], [1040, 292], [700, 170], [950, 150], [520, 200]]) { await clickStage(x, y); await wait(80); }
  await page.waitForFunction(() => SHB.debug.game.lesson.sleeping);
  await wait(800);
  await page.screenshot({ path: path.join(OUT, '41-sarang-tidur.png') });
  const r4 = await finishLesson('nest', '42-rapor-sarang.png');
  check(r4.mistakes === 1, 'sarang: satu tempat salah tercatat');

  /* ---------- 5 · ujian pulau ---------- */
  console.log('Pelajaran 5 · Ujian pulau');
  await startLesson('island');
  let pressedTempt = false, idlePicked = false, wrongPicked = false, shotTempt = false, shotAct = false;
  const chipOf = (b) => ev((b) => { const r = SHB.debug.game.lesson.notebookRects().find((r) => r.b === b); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }, b);
  for (let n = 0; n < 400; n++) {
    const st = await ev(() => {
      const g = SHB.debug.game, L = g.lesson;
      if (!L || g.ending) return { end: true };
      const s = L.seg, open = ['memanjat', 'makan', 'alat', 'sarang', 'menjauh'].filter((b) => !L.recorded.has(b));
      return { type: s.type, b: s.b, rec: s.b ? L.recorded.has(s.b) : false, t: s.t, open, tempt: !document.getElementById('tempt').classList.contains('hidden'), resolved: L.resolved() };
    });
    if (st.end) break;
    if (st.tempt && !shotTempt) { shotTempt = true; await page.screenshot({ path: path.join(OUT, '50-godaan.png') }); }
    if (st.tempt && st.resolved === 1 && !pressedTempt) { pressedTempt = true; await page.click('#tempt-btn', { force: true }); continue; }
    if (st.type === 'idle' && !idlePicked && st.t > 0.2 && st.open.length) {
      idlePicked = true;
      const m0 = await ev(() => SHB.debug.game.mistakes);
      const c = await chipOf(st.open[0]); await clickStage(c.x, c.y);
      check((await ev(() => SHB.debug.game.mistakes)) === m0 + 1, 'memilih catatan saat Bakti santai = salah');
      continue;
    }
    if (st.type === 'act' && !st.rec && st.t > 0.4) {
      const wrong = st.open.find((b) => b !== st.b);
      if (!wrongPicked && wrong) {
        wrongPicked = true;
        const c = await chipOf(wrong); await clickStage(c.x, c.y);
        check(!(await ev((b) => SHB.debug.game.lesson.recorded.has(b), wrong)), 'perilaku yang salah tidak tercatat');
        continue;
      }
      if (!shotAct) { shotAct = true; await page.screenshot({ path: path.join(OUT, '51-pulau-beraksi.png') }); }
      const c = await chipOf(st.b); await clickStage(c.x, c.y);
      check(await ev((b) => SHB.debug.game.lesson.recorded.has(b), st.b), `buku catatan: ${st.b} tercatat`);
      await wait(250);
      continue;
    }
    await wait(150);
  }
  const isl = await ev(() => { const L = SHB.debug.game.results.slice(-1)[0]; return L; });
  check(pressedTempt && idlePicked && wrongPicked, 'godaan, catatan saat santai, dan catatan salah diuji');
  const r5 = await finishLesson('island', '52-rapor-pulau.png');
  check(r5.mistakes === 3 && r5.stars === 2, 'pulau: tiga kesalahan = dua bintang');

  /* ---------- pelepasliaran & hasil ---------- */
  console.log('Pelepasliaran & hasil');
  await wait(5000);
  await page.screenshot({ path: path.join(OUT, '60-pelepasliaran.png') });
  await page.waitForFunction(() => SHB.debug.game.release && SHB.debug.game.release.t > 12, null, { timeout: 15000 });
  await page.screenshot({ path: path.join(OUT, '61-pelepasliaran-kartu.png') });
  await clickStage(800, 450);
  await page.waitForFunction(() => SHB.debug.state === 'result');
  await wait(400);
  const res = await ev(() => ({ score: +document.getElementById('result-score').textContent, stars: document.getElementById('result-stars').textContent, game: SHB.debug.game.score }));
  check(res.score > 300 && res.score === res.game, `skor akhir tampil (${res.score})`);
  check(res.stars === '14/15', `bintang rapor ${res.stars}`);
  check(await inViewport('.result-wrap'), 'layar hasil muat');
  await page.screenshot({ path: path.join(OUT, '70-hasil.png') });
  await page.keyboard.type('Rani');
  await page.click('#btn-save');
  await page.waitForFunction(() => SHB.debug.state === 'board');
  check((await page.textContent('#board-today li.me')).includes('RANI'), 'nama tersimpan dan disorot di papan skor');
  await page.screenshot({ path: path.join(OUT, '71-papan-skor.png') });
  await page.click('#btn-home');

  /* ---------- admin ---------- */
  console.log('Admin');
  await page.keyboard.press('Control+Shift+A');
  for (const k of ['1', '2', '3', '4']) await page.locator('#pinpad .key', { hasText: new RegExp('^' + k + '$') }).dispatchEvent('pointerdown');
  await page.locator('#pinpad .key', { hasText: '✓' }).dispatchEvent('pointerdown');
  check(await page.locator('#admin-menu:not(.hidden)').count() === 1, 'PIN admin membuka panel');
  await page.locator('#admin-durations .btn').nth(2).click();
  check((await ev(() => SHB.debug.settings.lessonSec)) === 30, 'durasi pelajaran bisa diganti');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btn-admin-export')]);
  const csvPath = path.join(OUT, 'skor.csv');
  await dl.saveAs(csvPath);
  const csv = await readFile(csvPath, 'utf8');
  check(csv.includes('poin_pulau') && csv.includes('RANI'), 'ekspor CSV berisi skor');
  await page.screenshot({ path: path.join(OUT, '80-admin.png') });
  await page.click('#btn-admin-close');

  /* ---------- keluar di tengah permainan ---------- */
  console.log('Keluar di tengah permainan');
  await page.click('#btn-start'); await page.click('#btn-go');
  await startLesson('feed');
  await page.click('#btn-play-menu');
  await page.waitForFunction(() => SHB.debug.state === 'attract');
  check(!(await ev(() => SHB.debug.game.active)), 'menu utama menghentikan sesi');

  check(errors.length === 0, 'tanpa galat JavaScript' + (errors.length ? ':\n    ' + errors.join('\n    ') : ''));
} catch (e) {
  failures++;
  console.error(e);
  await page.screenshot({ path: path.join(OUT, 'gagal.png') }).catch(() => {});
} finally {
  await browser.close();
  server.close();
}
console.log(failures ? `\n${failures} pemeriksaan GAGAL. Tangkapan layar: ${OUT}` : `\nSemua pemeriksaan lulus. Tangkapan layar: ${OUT}`);
process.exit(failures ? 1 : 0);
