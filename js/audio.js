/* Efek suara disintesis langsung (tanpa file audio, tetap jalan offline). */
(function () {
  'use strict';
  const S = window.SHB;
  let ctx = null, master = null, noiseBuf = null, enabled = true, ambientTimer = null, rainNode = null;

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = enabled ? 0.55 : 0;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return true;
    } catch (e) { ctx = null; return false; }
  }

  function tone(freq, dur, type, vol, when, glide) {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, freq, q, when, type) {
    if (!ctx || !enabled) return;
    const t = ctx.currentTime + (when || 0);
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq || 2000; f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.4); s.stop(t + dur + 0.02);
  }

  const AU = (S.Audio = {
    unlock() { ensure(); },
    setEnabled(v) {
      enabled = !!v;
      if (master) master.gain.value = enabled ? 0.55 : 0;
      if (!enabled) { AU.ambient(false); AU.rain(false); }
    },
    isEnabled: () => enabled,
    click() { tone(660, 0.06, 'triangle', 0.08); },
    good() { [784, 988, 1175].forEach((f, i) => tone(f, 0.14, 'sine', 0.2, i * 0.06)); },
    bad() { tone(240, 0.24, 'square', 0.07, 0, 130); },
    munch() { for (let i = 0; i < 3; i++) noise(0.06, 0.32, 900 + i * 300, 1.4, i * 0.11); },
    crack() { noise(0.12, 0.6, 700, 0.8); noise(0.25, 0.4, 260, 0.7, 0.05); tone(120, 0.3, 'sawtooth', 0.06, 0.02, 60); },
    whoosh() { noise(0.35, 0.22, 600, 0.6, 0, 'lowpass'); },
    rustle() { noise(0.18, 0.25, 3000, 0.9); noise(0.16, 0.2, 2200, 0.9, 0.08); },
    pop() { tone(520, 0.08, 'sine', 0.16, 0, 900); },
    clear() { [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.18, i * 0.09)); },
    star(i) { tone(880 * Math.pow(1.26, i || 0), 0.2, 'triangle', 0.16); },
    miss() { tone(300, 0.05, 'triangle', 0.05); },
    tick() { tone(1250, 0.04, 'square', 0.05); },
    over() { [784, 659, 523, 392].forEach((f, i) => tone(f, 0.24, 'triangle', 0.16, i * 0.13)); },
    start() { [523, 659, 784].forEach((f, i) => tone(f, 0.14, 'sine', 0.16, i * 0.07)); },
    grow() { [392, 494, 587, 784, 988].forEach((f, i) => tone(f, 0.3, 'sine', 0.13, i * 0.12)); },
    fanfare() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.26, 'triangle', 0.16, i * 0.12)); },
    hoot() { tone(420, 0.18, 'sine', 0.12, 0, 620); tone(560, 0.22, 'sine', 0.1, 0.2, 380); },
    bird() {
      if (!ctx || !enabled) return;
      const base = 2200 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) tone(base, 0.09, 'sine', 0.035, i * 0.12, base * (1.2 + Math.random() * 0.3));
    },
    ambient(on) {
      if (ambientTimer) { clearTimeout(ambientTimer); ambientTimer = null; }
      if (!on) return;
      const loop = () => { AU.bird(); ambientTimer = setTimeout(loop, 2500 + Math.random() * 5000); };
      ambientTimer = setTimeout(loop, 1500);
    },
    rain(on) {
      if (rainNode) { try { rainNode.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.3); rainNode.s.stop(ctx.currentTime + 1.2); } catch (e) { /* abaikan */ } rainNode = null; }
      if (!on || !ctx || !enabled) return;
      const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 1400;
      const g = ctx.createGain(); g.gain.value = 0.0001; g.gain.setTargetAtTime(0.12, ctx.currentTime, 0.4);
      s.connect(f); f.connect(g); g.connect(master); s.start();
      rainNode = { s, g };
    }
  });
})();
