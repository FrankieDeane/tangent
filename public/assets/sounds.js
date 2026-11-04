// Ambient sounds. If a recorded file exists in /assets/sounds/<name>.mp3 (listed in manifest.json)
// it is used; otherwise the sound is synthesised in the browser so it always works offline and free.
(() => {
  const NAMES = ["rain", "waves", "wind", "birds", "storm", "thunder", "fire", "forest", "river", "night", "cafe", "horse"];
  let ctx = null, master = null, noise = {}, manifest = null;
  const playing = {};

  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
      noise.white = makeNoise("white"); noise.pink = makeNoise("pink"); noise.brown = makeNoise("brown");
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function makeNoise(kind) {
    const len = 4 * ctx.sampleRate, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w * 0.5;
      else if (kind === "pink") { b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.12; }
      else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    }
    return buf;
  }
  function src(kind) { const s = ctx.createBufferSource(); s.buffer = noise[kind]; s.loop = true; s.start(); return s; }
  function filt(type, f, q = 0.7) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
  function gain(v) { const g = ctx.createGain(); g.gain.value = v; return g; }
  function lfo(param, rate, depth) { const o = ctx.createOscillator(), g = gain(depth); o.frequency.value = rate; o.connect(g); g.connect(param); o.start(); return o; }
  function every(fn, min, max) { let t; const loop = () => { fn(); t = setTimeout(loop, min + Math.random() * (max - min)); }; t = setTimeout(loop, 300); return () => clearTimeout(t); }
  function blip(out, { f = 2000, f2 = f, dur = 0.12, type = "sine", vol = 0.2 } = {}) {
    const o = ctx.createOscillator(), g = gain(0), now = ctx.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, now); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), now + dur);
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.connect(g); g.connect(out); o.start(now); o.stop(now + dur + 0.05);
  }
  function burst(out, { dur = 2, vol = 0.6, f = 200 } = {}) {
    const s = ctx.createBufferSource(), lp = filt("lowpass", f), g = gain(0), now = ctx.currentTime;
    s.buffer = noise.brown; g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    s.connect(lp); lp.connect(g); g.connect(out); s.start(now); s.stop(now + dur + 0.1);
  }

  const SYNTH = {
    rain: out => { const s = src("pink"), hp = filt("highpass", 900), g = gain(0.5); s.connect(hp); hp.connect(g); g.connect(out); const c = every(() => blip(out, { f: 3000 + Math.random() * 3000, f2: 1500, dur: 0.03, vol: 0.05 }), 40, 160); return () => { s.stop(); c(); }; },
    waves: out => { const s = src("brown"), lp = filt("lowpass", 600), g = gain(0.35); s.connect(lp); lp.connect(g); g.connect(out); const l = lfo(g.gain, 0.09, 0.3); const l2 = lfo(lp.frequency, 0.09, 350); return () => { s.stop(); l.stop(); l2.stop(); }; },
    wind: out => { const s = src("pink"), bp = filt("bandpass", 500, 0.8), g = gain(0.6); s.connect(bp); bp.connect(g); g.connect(out); const l = lfo(bp.frequency, 0.05, 350); const l2 = lfo(g.gain, 0.07, 0.3); return () => { s.stop(); l.stop(); l2.stop(); }; },
    birds: out => { const c = every(() => { const f = 2500 + Math.random() * 2000, n = 1 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) setTimeout(() => blip(out, { f, f2: f * (0.6 + Math.random() * 0.9), dur: 0.08 + Math.random() * 0.1, vol: 0.12 }), i * 110); }, 600, 2600); return () => c(); },
    storm: out => { const s = src("pink"), hp = filt("highpass", 600), g = gain(0.55); s.connect(hp); hp.connect(g); g.connect(out); const r = src("brown"), lp = filt("lowpass", 140), g2 = gain(0.5); r.connect(lp); lp.connect(g2); g2.connect(out); const l = lfo(g2.gain, 0.06, 0.4); const c = every(() => burst(out, { dur: 3.5, vol: 0.9, f: 160 }), 7000, 16000); return () => { s.stop(); r.stop(); l.stop(); c(); }; },
    thunder: out => { const c = every(() => burst(out, { dur: 4, vol: 1, f: 130 }), 5000, 12000); return () => c(); },
    fire: out => { const s = src("brown"), lp = filt("lowpass", 400), g = gain(0.4); s.connect(lp); lp.connect(g); g.connect(out); const c = every(() => blip(out, { f: 900 + Math.random() * 2500, f2: 200, dur: 0.02, type: "square", vol: 0.06 }), 30, 260); return () => { s.stop(); c(); }; },
    forest: out => { const s = src("pink"), bp = filt("bandpass", 800, 0.6), g = gain(0.18); s.connect(bp); bp.connect(g); g.connect(out); const l = lfo(bp.frequency, 0.04, 300); const b = SYNTH.birds(out); return () => { s.stop(); l.stop(); b(); }; },
    river: out => { const s = src("white"), bp = filt("bandpass", 1600, 0.5), g = gain(0.3); s.connect(bp); bp.connect(g); g.connect(out); const l = lfo(bp.frequency, 0.3, 500); const c = every(() => blip(out, { f: 600 + Math.random() * 900, f2: 1400, dur: 0.05, vol: 0.05 }), 80, 300); return () => { s.stop(); l.stop(); c(); }; },
    night: out => { const c = every(() => { for (let i = 0; i < 3; i++) setTimeout(() => blip(out, { f: 4400, f2: 4300, dur: 0.04, vol: 0.06 }), i * 70); }, 400, 900); const s = src("brown"), lp = filt("lowpass", 200), g = gain(0.15); s.connect(lp); lp.connect(g); g.connect(out); return () => { c(); s.stop(); }; },
    cafe: out => { const s = src("brown"), bp = filt("bandpass", 450, 0.7), g = gain(0.55); s.connect(bp); bp.connect(g); g.connect(out); const l = lfo(g.gain, 0.4, 0.15); const c = every(() => blip(out, { f: 2800 + Math.random() * 1500, f2: 2600, dur: 0.25, vol: 0.05, type: "triangle" }), 2500, 7000); return () => { s.stop(); l.stop(); c(); }; },
    horse: out => { let i = 0; const c = every(() => { const accent = i++ % 2 === 0; blip(out, { f: accent ? 180 : 140, f2: 60, dur: 0.09, type: "triangle", vol: 0.45 }); setTimeout(() => blip(out, { f: 220, f2: 70, dur: 0.07, type: "triangle", vol: 0.3 }), 140); }, 420, 460); return () => c(); },
  };

  async function loadManifest() {
    if (manifest) return manifest;
    try { manifest = await (await fetch("/assets/sounds/manifest.json", { cache: "force-cache" })).json(); } catch { manifest = {}; }
    return manifest;
  }

  async function toggle(name, volume = 0.7) {
    if (playing[name]) { stop(name); return false; }
    const m = await loadManifest();
    if (m[name]) {
      const a = new Audio(m[name]); a.loop = true; a.volume = volume; a.play().catch(() => {});
      playing[name] = { stop: () => { a.pause(); a.src = ""; }, setVolume: v => { a.volume = v; } };
      return true;
    }
    ac();
    const g = gain(volume); g.connect(master);
    const stopFn = (SYNTH[name] || SYNTH.rain)(g);
    playing[name] = { stop: () => { try { stopFn(); } catch {} g.gain.setTargetAtTime(0, ctx.currentTime, 0.2); setTimeout(() => g.disconnect(), 800); }, setVolume: v => { g.gain.setTargetAtTime(v, ctx.currentTime, 0.1); } };
    return true;
  }
  function stop(name) { playing[name]?.stop(); delete playing[name]; }
  function stopAll() { Object.keys(playing).forEach(stop); }
  function setVolume(name, v) { playing[name]?.setVolume(v); }

  window.TangentSounds = { NAMES, toggle, stop, stopAll, setVolume, isPlaying: n => Boolean(playing[n]) };
})();
