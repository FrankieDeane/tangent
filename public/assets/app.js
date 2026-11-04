// Tangent front end. Say it messy, see it clear.
(() => {
  const $ = s => document.querySelector(s);
  const S = window.TangentScenes, SND = window.TangentSounds;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- i18n ----------
  const T = {
    es: {
      experimental: "Experimental", lead1: "Decilo como sale.", lead2: "Miralo claro.",
      tagline: "Una idea de Tangent", heroL: "Para mentes no lineales",
      r1: "Hablá", r1s: "Como sale, sin ordenar nada", r2: "Mirá", r2s: "Una imagen clara del centro", r3: "Respirá", r3s: "Tres pasos y nada más",
      st1: "para decirlo todo", st2: "solo botón", st3: "cuentas y contraseñas",
      sub: "Tocá el botón y hablá hasta un minuto, en español o inglés. Tangent lo convierte en una imagen tranquila de lo que querés decir.",
      record: "Grabar tu idea", type: "Prefiero escribir", example: "Ver un ejemplo", showme: "Mostrame",
      garden: "Tu jardín de ideas", listening: "Te escucho. Sin apuro, se corta solo al minuto.", done: "Listo", cancel: "Cancelar",
      footwarn: "Experimental. Las imágenes son interpretaciones y pueden no coincidir con lo que imaginaste. No compartas datos privados.",
      terms: "Términos y normas", privacy: "Privacidad y cookies", rights: "Una idea de Tangent. Todos los derechos reservados.",
      think: ["Escuchando lo que dijiste…", "Dejando el ruido de lado…", "Buscando el centro…", "Armando tu imagen…"],
      heard: "Lo que dijiste, en una línea", simplify: "Simplificar", full: "Ver todo", postcard: "Postal", again: "Grabar otra idea", home: "Inicio",
      breathe: "Respirá", breatheSub: "Inhalá cuando crece, soltá cuando baja.", steps: "Lo que podés hacer", letgo: "Podés soltar esto",
      tangents: "Tangentes", sounds: "Sonido de fondo", clip: "CLIP", drawing: "dibujando…", photo: "Foto",
      consentT: "Antes de empezar",
      consent: ["Tangent es un experimento. Puede equivocarse y las imágenes pueden no coincidir con lo que imaginaste.",
        "Solo español e inglés. No compartas datos personales ni privados.",
        "Está prohibido hablar de sexo, violencia, guerra, política, aborto, muerte, racismo, drogas o usar malas palabras. La primera vez se corta la sesión; la segunda, este dispositivo queda bloqueado.",
        "Tu audio se procesa con servicios de IA externos y Tangent no lo guarda."],
      consentAccept: "Acepto los <a href=\"/terms.html\" target=\"_blank\">Términos</a> y la <a href=\"/privacy.html\" target=\"_blank\">Privacidad</a>, y soy mayor de 18 o uso Tangent con un adulto.",
      agree: "Acepto y sigo", close: "Cerrar", ok: "Entendido",
      warnT: "Sesión expirada", warn: "Tangent no acepta ese tipo de contenido. Tu sesión se cerró. Si vuelve a pasar, este dispositivo queda bloqueado.",
      banT: "Acceso bloqueado", ban: "Este dispositivo ya no puede usar Tangent porque se repitió contenido no permitido.",
      supportT: "No estás solo", support: "Parece que estás pasando un momento muy difícil. Tangent no es el lugar para esto, pero hay personas que pueden escucharte ahora mismo, gratis:",
      helplines: [["Argentina", "135 (CABA y GBA) · 0800 345 1435"], ["España", "024"], ["Estados Unidos", "988"], ["Emergencias", "911 / 112"]],
      langT: "Solo español o inglés", lang: "Por ahora Tangent entiende solo español e inglés. Probá de nuevo en uno de esos idiomas.",
      limitT: "Por hoy es suficiente", limit: "Llegaste al máximo de ideas por hoy. Mañana podés seguir.",
      errT: "Algo no salió", err: "No pudimos armar tu imagen. Probá de nuevo en un rato.",
      emptyT: "No te escuché", empty: "No llegó nada claro. Probá hablar un poco más cerca del micrófono.",
      tooLongT: "Muy largo", tooLong: "La grabación es demasiado larga. Probá con menos de un minuto.",
      micT: "Sin micrófono", mic: "No pudimos usar el micrófono. Revisá el permiso del navegador o escribí tu idea.",
      offline: "Sin conexión. Te mostramos un ejemplo.", tooShort: "Muy corto. Hablá al menos un par de segundos.", typeMore: "Escribí un poco más.",
      saved: "Guardado en tu jardín.", shareTitle: "Mi idea en Tangent",
    },
    en: {
      experimental: "Experimental", lead1: "Say it messy.", lead2: "See it clear.",
      tagline: "An idea by Tangent", heroL: "For non-linear minds",
      r1: "Talk", r1s: "However it comes out", r2: "See", r2s: "A clear picture of the core", r3: "Breathe", r3s: "Three steps, nothing more",
      st1: "to say it all", st2: "single button", st3: "accounts or passwords",
      sub: "Tap the button and talk for up to a minute, in English or Spanish. Tangent turns it into a calm picture of what you mean.",
      record: "Record your idea", type: "I'd rather type", example: "See an example", showme: "Show me",
      garden: "Your idea garden", listening: "I'm listening. No rush, it stops by itself at one minute.", done: "Done", cancel: "Cancel",
      footwarn: "Experimental. Images are interpretations and may not match what you imagined. Don't share private information.",
      terms: "Terms and rules", privacy: "Privacy and cookies", rights: "An idea by Tangent. All rights reserved.",
      think: ["Listening to what you said…", "Setting the noise aside…", "Finding the center…", "Building your picture…"],
      heard: "What you said, in one line", simplify: "Simplify", full: "Show all", postcard: "Postcard", again: "Record another idea", home: "Home",
      breathe: "Breathe", breatheSub: "Breathe in as it grows, out as it shrinks.", steps: "What you can do", letgo: "You can let go of",
      tangents: "Tangents", sounds: "Background sound", clip: "CLIP", drawing: "drawing…", photo: "Photo",
      consentT: "Before you start",
      consent: ["Tangent is an experiment. It can be wrong, and images may not match what you imagined.",
        "English and Spanish only. Don't share personal or private information.",
        "Talking about sex, violence, war, politics, abortion, death, racism, drugs, or using swear words is not allowed. The first time ends your session; the second time blocks this device.",
        "Your audio is processed by external AI services and Tangent does not keep it."],
      consentAccept: "I accept the <a href=\"/terms.html\" target=\"_blank\">Terms</a> and <a href=\"/privacy.html\" target=\"_blank\">Privacy</a>, and I'm over 18 or using Tangent with an adult.",
      agree: "I agree", close: "Close", ok: "Got it",
      warnT: "Session expired", warn: "Tangent doesn't accept that kind of content. Your session was closed. If it happens again, this device will be blocked.",
      banT: "Access blocked", ban: "This device can no longer use Tangent because content that isn't allowed was repeated.",
      supportT: "You're not alone", support: "It sounds like you're going through something really hard. Tangent isn't the place for this, but there are people who can listen right now, for free:",
      helplines: [["United States", "988"], ["Argentina", "135 (CABA & GBA) · 0800 345 1435"], ["Spain", "024"], ["Emergency", "911 / 112"]],
      langT: "English or Spanish only", lang: "For now Tangent only understands English and Spanish. Please try again in one of them.",
      limitT: "That's enough for today", limit: "You reached today's maximum. You can continue tomorrow.",
      errT: "Something went wrong", err: "We couldn't build your picture. Please try again in a moment.",
      emptyT: "I didn't hear you", empty: "Nothing clear came through. Try speaking a little closer to the mic.",
      tooLongT: "Too long", tooLong: "The recording is too long. Try under one minute.",
      micT: "No microphone", mic: "We couldn't use the microphone. Check the browser permission, or type your idea.",
      offline: "You're offline. Here's an example.", tooShort: "Too short. Talk for at least a couple of seconds.", typeMore: "Write a little more.",
      saved: "Saved to your garden.", shareTitle: "My idea on Tangent",
    },
  };
  let lang = store.get("tangent.lang", (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es");
  const t = k => T[lang][k] ?? T.es[k] ?? k;
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
    $("#langBtn").textContent = lang === "es" ? "EN" : "ES";
    $("#typed").placeholder = lang === "es" ? "Escribí como pensás, sin ordenar nada…" : "Write the way you think, no need to tidy it…";
    if (current) renderBoard(current, true);
  }
  $("#langBtn").onclick = () => { lang = lang === "es" ? "en" : "es"; store.set("tangent.lang", lang); applyLang(); };
  $("#year").textContent = new Date().getFullYear();

  // ---------- identity ----------
  let deviceId = store.get("tangent.device", null);
  if (!deviceId) { deviceId = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now(); store.set("tangent.device", deviceId); }

  // ---------- screens & modal ----------
  function show(id) {
    ["home", "recording", "thinking", "board"].forEach(s => { $("#" + s).hidden = s !== id; });
    if (id !== "board") { document.body.classList.remove("simple"); document.body.removeAttribute("data-mood"); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function modal(title, html, buttons = [{ label: t("ok") }]) {
    return new Promise(res => {
      $("#mTitle").textContent = title; $("#mBody").innerHTML = html; $("#mBtns").innerHTML = "";
      buttons.forEach((b, i) => {
        const el = document.createElement("button"); el.className = "btn" + (b.ghost ? " ghost" : ""); el.textContent = b.label;
        if (b.disabled) el.disabled = true;
        el.onclick = () => { $("#modal").hidden = true; res(b.value ?? i); };
        $("#mBtns").append(el);
      });
      $("#modal").hidden = false; $("#mBtns button:last-child")?.focus();
    });
  }
  const note = msg => { $("#homeNote").textContent = msg || ""; };

  async function consent() {
    if (store.get("tangent.consent", 0) >= 1) return true;
    const p = modal(t("consentT"), `<ul>${t("consent").map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <label style="display:flex;gap:10px;align-items:flex-start;font-size:15px"><input type="checkbox" id="cAgree" style="margin-top:4px"> <span>${t("consentAccept")}</span></label>`,
      [{ label: t("cancel"), ghost: true, value: false }, { label: t("agree"), value: true, disabled: true }]);
    const box = $("#cAgree"), go = $("#mBtns button:last-child");
    box.onchange = () => { go.disabled = !box.checked; };
    const ok = await p;
    if (ok) store.set("tangent.consent", 1);
    return ok;
  }
  const banned = () => store.get("tangent.banned", false);
  function showBanned() { return modal(t("banT"), `<p>${esc(t("ban"))}</p><p><a href="/terms.html">${esc(t("terms"))}</a></p>`); }
  function helpHtml() { return `<p>${esc(t("support"))}</p>${t("helplines").map(([c, n]) => `<div class="help">${esc(c)}<br><b>${esc(n)}</b></div>`).join("")}`; }

  // ---------- recording ----------
  let rec = null;
  const MAX_SEC = 60;
  async function startRecording() {
    if (banned()) return showBanned();
    if (!(await consent())) return;
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return modal(t("micT"), `<p>${esc(t("mic"))}</p>`).then(openType);
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch { return modal(t("micT"), `<p>${esc(t("mic"))}</p>`).then(openType); }
    const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC(), srcNode = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser();
    an.fftSize = 1024; srcNode.connect(an);
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"], mime = types.find(m => MediaRecorder.isTypeSupported?.(m)) || "";
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined), chunks = [];
    mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec = { stream, ctx, an, mr, chunks, amps: [], t0: performance.now(), cancelled: false, raf: 0 };
    mr.start(250);
    show("recording"); drawLive();
  }
  function drawLive() {
    const c = $("#live"), g = c.getContext("2d"), data = new Uint8Array(rec.an.fftSize);
    const accent = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#1F6F78";
    const tick = () => {
      if (!rec) return;
      rec.an.getByteTimeDomainData(data);
      let sum = 0; for (const v of data) sum += ((v - 128) / 128) ** 2;
      const amp = Math.min(1, Math.sqrt(sum / data.length) * 4);
      rec.amps.push(amp);
      const w = c.width, h = c.height, n = 90, slice = rec.amps.slice(-n);
      g.clearRect(0, 0, w, h); g.fillStyle = accent;
      slice.forEach((a, i) => { const bh = Math.max(3, a * h * 0.9); g.globalAlpha = 0.25 + 0.75 * (i / n); g.beginPath(); g.roundRect ? g.roundRect(i * (w / n), (h - bh) / 2, w / n - 2, bh, 3) : g.rect(i * (w / n), (h - bh) / 2, w / n - 2, bh); g.fill(); });
      const sec = (performance.now() - rec.t0) / 1000;
      $("#clock").textContent = `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
      if (sec >= MAX_SEC) return stopRecording();
      rec.raf = requestAnimationFrame(tick);
    };
    tick();
  }
  function endStream(r) { cancelAnimationFrame(r.raf); r.stream.getTracks().forEach(tr => tr.stop()); r.ctx.close().catch(() => {}); }
  async function stopRecording() {
    if (!rec) return;
    const r = rec; rec = null; cancelAnimationFrame(r.raf);
    const done = new Promise(res => { r.mr.onstop = res; });
    try { r.mr.stop(); } catch {}
    await done; endStream(r);
    const secs = (performance.now() - r.t0) / 1000;
    if (secs < 1.5) { show("home"); return note(t("tooShort")); }
    const blob = new Blob(r.chunks, { type: r.mr.mimeType || "audio/webm" });
    const wave = downsample(r.amps, 120);
    thinking([]);
    let wav;
    try { wav = await toWavBase64(blob); } catch { show("home"); return modal(t("errT"), `<p>${esc(t("err"))}</p>`); }
    analyze({ audio: wav }, wave);
  }
  function cancelRecording() { if (!rec) return; const r = rec; rec = null; try { r.mr.stop(); } catch {} endStream(r); show("home"); }
  function downsample(a, n) { if (!a.length) return []; const out = []; for (let i = 0; i < n; i++) { const s = Math.floor(i * a.length / n), e = Math.max(s + 1, Math.floor((i + 1) * a.length / n)); out.push(Math.max(...a.slice(s, e))); } return out; }

  async function toWavBase64(blob) {
    const buf = await blob.arrayBuffer();
    const AC = window.AudioContext || window.webkitAudioContext, tmp = new AC();
    const decoded = await new Promise((res, rej) => { const p = tmp.decodeAudioData(buf, res, rej); if (p?.then) p.then(res, rej); });
    tmp.close().catch(() => {});
    const rate = 16000, len = Math.min(Math.ceil(decoded.duration * rate), rate * MAX_SEC);
    const off = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, len, rate);
    const s = off.createBufferSource(); s.buffer = decoded; s.connect(off.destination); s.start();
    const pcm = (await off.startRendering()).getChannelData(0);
    const out = new DataView(new ArrayBuffer(44 + pcm.length * 2));
    const w = (o, str) => { for (let i = 0; i < str.length; i++) out.setUint8(o + i, str.charCodeAt(i)); };
    w(0, "RIFF"); out.setUint32(4, 36 + pcm.length * 2, true); w(8, "WAVE"); w(12, "fmt "); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
    out.setUint32(24, rate, true); out.setUint32(28, rate * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, "data"); out.setUint32(40, pcm.length * 2, true);
    for (let i = 0; i < pcm.length; i++) { const v = Math.max(-1, Math.min(1, pcm[i])); out.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true); }
    const bytes = new Uint8Array(out.buffer); let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  // ---------- typed path ----------
  function openType() { show("home"); $("#typeBox").hidden = false; $("#typed").focus(); }
  async function sendTyped() {
    const text = $("#typed").value.trim();
    if (text.length < 8) return note(t("typeMore"));
    if (banned()) return showBanned();
    if (!(await consent())) return;
    thinking(text.split(/\s+/));
    analyze({ text }, null);
  }

  // ---------- thinking ----------
  let thinkTimer = 0;
  function thinking(words) {
    show("thinking");
    const f = $("#field"); f.innerHTML = ""; let i = 0;
    $("#thinkCap").textContent = t("think")[0];
    clearInterval(thinkTimer);
    thinkTimer = setInterval(() => { i++; $("#thinkCap").textContent = t("think")[i % t("think").length]; }, 2600);
    if (words.length) placeWords(words);
    else for (let b = 0; b < 28; b++) {
      const el = document.createElement("div"); el.className = "bar"; el.style.left = `${4 + b * 3.4}%`; el.style.height = "8px"; f.append(el);
      setInterval(() => { el.style.height = `${10 + Math.random() * 120}px`; el.style.opacity = String(0.3 + Math.random() * 0.6); }, 900 + b * 13);
    }
  }
  function placeWords(words, keys = []) {
    const f = $("#field"); f.innerHTML = "";
    const keySet = new Set(keys.map(k => k.toLowerCase()));
    words.slice(0, 60).forEach((w, i) => {
      const el = document.createElement("span"); el.className = "w"; el.textContent = w;
      const x = (Math.random() - 0.5) * 90, y = (Math.random() - 0.5) * 80, r = (Math.random() - 0.5) * 30;
      el.style.transform = `translate(calc(-50% + ${x}vw * .5), calc(-50% + ${y * 2}px)) rotate(${r}deg)`;
      el.style.fontSize = `${14 + Math.random() * 14}px`;
      f.append(el);
      const clean = w.toLowerCase().replace(/[^\p{L}]/gu, "");
      setTimeout(() => {
        if (keySet.size && [...keySet].some(k => k.includes(clean) && clean.length > 3)) { el.classList.add("key"); el.style.transform = `translate(-50%, calc(-50% + ${(i % 5 - 2) * 34}px))`; el.style.fontSize = "28px"; }
        else el.classList.add("noise", keySet.size ? "settle" : "x");
      }, 200 + i * 20);
    });
  }
  const stopThinking = () => { clearInterval(thinkTimer); document.querySelectorAll(".bar").forEach(b => b.remove()); };

  // ---------- server ----------
  async function analyze(payload, wave) {
    let res, data;
    try {
      res = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId, lang, ...payload }) });
      data = await res.json().catch(() => ({ status: "ai_error" }));
    } catch {
      stopThinking(); note(t("offline")); return openBoard(exampleBoard(), wave);
    }
    stopThinking();
    switch (data.status) {
      case "ok": {
        const keys = (data.board.keep || []).concat(data.board.core.split(/\s+/));
        if (data.transcript) { placeWords(data.transcript.split(/\s+/)); await wait(400); placeWords(data.transcript.split(/\s+/), keys); await wait(2200); }
        return openBoard({ ...data.board, transcript: data.transcript, lang: data.language, at: Date.now() }, wave, true);
      }
      case "warning": show("home"); return modal(t("warnT"), `<p>${esc(t("warn"))}</p>`);
      case "banned": store.set("tangent.banned", true); show("home"); return showBanned();
      case "support": show("home"); return modal(t("supportT"), helpHtml(), [{ label: t("close") }]);
      case "language": show("home"); return modal(t("langT"), `<p>${esc(t("lang"))}</p>`);
      case "limit": show("home"); return modal(t("limitT"), `<p>${esc(t("limit"))}</p>`);
      case "empty": show("home"); return modal(t("emptyT"), `<p>${esc(t("empty"))}</p>`);
      case "too_long": show("home"); return modal(t("tooLongT"), `<p>${esc(t("tooLong"))}</p>`);
      default: show("home"); return modal(t("errT"), `<p>${esc(t("err"))}</p>`);
    }
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // client-side SVG allowlist (second layer after the server)
  const OK_TAGS = new Set(["svg", "g", "defs", "lineargradient", "radialgradient", "stop", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "clippath", "mask", "filter", "fegaussianblur", "title"]);
  const OK_ATTR = /^(viewbox|preserveaspectratio|xmlns|d|cx|cy|r|rx|ry|x|y|x1|y1|x2|y2|width|height|points|fill|fill-opacity|fill-rule|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-opacity|stroke-dasharray|opacity|transform|offset|stop-color|stop-opacity|id|gradientunits|gradienttransform|clip-path|mask|filter|stddeviation|fx|fy)$/i;
  function cleanSvg(str) {
    try {
      const doc = new DOMParser().parseFromString(str, "image/svg+xml"), root = doc.documentElement;
      if (root.nodeName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) return null;
      const walk = el => {
        [...el.children].forEach(ch => { if (!OK_TAGS.has(ch.nodeName.toLowerCase())) ch.remove(); else walk(ch); });
        [...el.attributes].forEach(a => { const v = a.value; if (!OK_ATTR.test(a.name) || /javascript:|data:|url\((?!\s*#)/i.test(v)) el.removeAttribute(a.name); });
      };
      walk(root);
      // namespace ids so several drawings can live on one page
      const pre = "d" + Math.random().toString(36).slice(2, 7);
      let out = new XMLSerializer().serializeToString(root).replace(/id="([^"]+)"/g, `id="${pre}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${pre}$1)`);
      return out.replace(/^<svg/, '<svg preserveAspectRatio="xMidYMid slice" aria-hidden="true"');
    } catch { return null; }
  }
  async function drawTiles(board) {
    try {
      const res = await fetch("/api/draw", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId, subjects: board.tiles.map(x => x.subject), palette: board.palette }) });
      const data = await res.json();
      return (data.svgs || []).map(s => (s ? cleanSvg(s) : null));
    } catch { return []; }
  }

  // ---------- board ----------
  let current = null, currentWave = null;
  async function openBoard(board, wave, fresh) {
    current = board; currentWave = wave || board.wave || null; current.wave = currentWave;
    renderBoard(board);
    if (fresh) {
      const pics = [...document.querySelectorAll(".tile[data-i] .pic")];
      pics.forEach(p => { p.classList.add("drawing"); p.dataset.drawing = t("drawing"); });
      const svgs = await drawTiles(board);
      board.svgs = svgs.slice(0, board.tiles.length);
      pics.forEach((p, i) => { const s = board.svgs[i]; if (s) { p.innerHTML = s; if (+p.closest(".tile").dataset.i === board.clip) p.firstElementChild?.classList.add("kb"); } p.classList.remove("drawing"); });
      saveToGarden(board);
    }
  }
  function waveSvg(w) {
    if (!w || !w.length) return "";
    const n = w.length, pts = w.map((a, i) => `${(i / (n - 1)) * 1000},${100 - a * 90}`).join(" "), low = w.map((a, i) => `${((n - 1 - i) / (n - 1)) * 1000},${100 + w[n - 1 - i] * 90}`).join(" ");
    return `<svg class="wave" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="${pts} ${low}" fill="var(--glow)" opacity=".55"/><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" opacity=".5"/></svg>`;
  }
  function renderBoard(b, keepScroll) {
    show("board"); if (keepScroll) window.scrollTo(0, 0);
    document.body.dataset.mood = b.mood || "calm";
    const pal = b.palette || "mist", tiles = b.tiles || [], photos = b.photos || [];
    const tileHtml = (x, i) => {
      const moving = i === b.clip, svg = b.svgs?.[i] || S.pic(x.scene, pal, moving);
      return `<figure class="tile${i === 0 ? " big" : ""}" data-i="${i}"><div class="pic">${svg}${moving ? `<span class="play">${t("clip")}</span>` : ""}</div>${x.caption ? `<figcaption class="cap">${esc(x.caption)}</figcaption>` : ""}</figure>`;
    };
    const photoHtml = p => `<figure class="tile"><div class="pic"><img src="${esc(p.src)}" alt="${esc(p.alt || "")}" loading="lazy" referrerpolicy="no-referrer"><a class="credit" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.credit)} · Pexels</a></div></figure>`;
    const parts = [];
    tiles.forEach((x, i) => { parts.push(tileHtml(x, i)); if (i === 1 && photos[0]) parts.push(photoHtml(photos[0])); if (i === 3 && photos[1]) parts.push(photoHtml(photos[1])); });
    if (b.breathe) parts.splice(2, 0, `<div class="tile breathe"><div class="bcirc">${t("breathe")}</div><p>${esc(b.breathe)}<small>${t("breatheSub")}</small></p></div>`);
    const steps = b.steps || [];
    if (steps.length) parts.push(`<div class="tile panel steps"><h3>${t("steps")}</h3><div class="srow">${steps.map(s => `<div class="s"><b>${esc(s.when)}</b><span>${esc(s.what)}</span></div>`).join("")}</div></div>`);
    if (b.letgo?.length) parts.push(`<div class="tile panel letgo"><h3>${t("letgo")}</h3><div>${b.letgo.map(x => `<s>${esc(x)}</s>`).join("")}</div></div>`);
    if (b.tangents?.length) parts.push(`<div class="tile panel bubbles" aria-label="${t("tangents")}"><h3>${t("tangents")}</h3>${b.tangents.map((x, i) => `<span class="bub" style="left:${8 + i * 30}%;top:${44 + (i % 2) * 26}px;width:${104 + (x.length % 3) * 12}px;height:${104 + (x.length % 3) * 12}px;animation-delay:-${i * 2}s">${esc(x)}</span>`).join("")}</div>`);
    const sugg = b.sounds || [], all = [...sugg, ...SND.NAMES.filter(n => !sugg.includes(n))];
    parts.push(`<div class="tile panel"><h3>${t("sounds")}</h3><div class="mixer">${all.map(n => `<button class="chip" data-sound="${n}" aria-pressed="${SND.isPlaying(n)}">${soundLabel(n)}</button>`).join("")}</div></div>`);

    $("#board").innerHTML = `
      <div class="head">${waveSvg(b.wave)}
        <div class="heard">${t("heard")}</div>
        <h2 class="core">${esc(b.core)}</h2>
        <div class="tools">
          <button class="chip" id="simpBtn" aria-pressed="${document.body.classList.contains("simple")}">${document.body.classList.contains("simple") ? t("full") : t("simplify")}</button>
          <button class="chip" id="cardBtn">${t("postcard")}</button>
        </div>
      </div>
      <div class="mosaic">${parts.join("")}</div>
      <div class="again"><button class="btn" id="againBtn">${t("again")}</button><button class="btn ghost" id="homeBtn">${t("home")}</button></div>`;
    $("#simpBtn").onclick = toggleSimple;
    $("#cardBtn").onclick = () => postcard(b);
    $("#againBtn").onclick = () => { SND.stopAll(); startRecording(); };
    $("#homeBtn").onclick = () => { SND.stopAll(); current = null; show("home"); renderGarden(); };
    document.querySelectorAll("[data-sound]").forEach(el => el.onclick = async () => { const on = await SND.toggle(el.dataset.sound, 0.6); el.setAttribute("aria-pressed", String(on)); });
    armShake();
  }
  const SOUND_LABELS = {
    es: { rain: "🌧 Lluvia", waves: "🌊 Olas", wind: "🍃 Viento", birds: "🐦 Pájaros", storm: "⛈ Tormenta", thunder: "⚡ Truenos", fire: "🔥 Fuego", forest: "🌲 Bosque", river: "💧 Río", night: "🌙 Noche", cafe: "☕ Café", horse: "🐎 Caballo" },
    en: { rain: "🌧 Rain", waves: "🌊 Waves", wind: "🍃 Wind", birds: "🐦 Birds", storm: "⛈ Storm", thunder: "⚡ Thunder", fire: "🔥 Fire", forest: "🌲 Forest", river: "💧 River", night: "🌙 Night", cafe: "☕ Café", horse: "🐎 Horse" },
  };
  const soundLabel = n => SOUND_LABELS[lang][n] || n;

  function toggleSimple() {
    const on = document.body.classList.toggle("simple");
    const b = $("#simpBtn"); if (b) { b.textContent = on ? t("full") : t("simplify"); b.setAttribute("aria-pressed", String(on)); }
    if (navigator.vibrate) navigator.vibrate(30);
  }

  // shake to simplify
  let shakeArmed = false, lastShake = 0;
  function onMotion(e) {
    if ($("#board").hidden) return;
    const a = e.accelerationIncludingGravity || e.acceleration; if (!a) return;
    const force = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    if (force > 38 && Date.now() - lastShake > 1500) { lastShake = Date.now(); toggleSimple(); }
  }
  function armShake() {
    if (shakeArmed || !("DeviceMotionEvent" in window)) return;
    const attach = () => { window.addEventListener("devicemotion", onMotion); shakeArmed = true; };
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      // iOS needs a gesture: ask on the first tap on the board
      $("#board").addEventListener("click", function ask() {
        $("#board").removeEventListener("click", ask);
        DeviceMotionEvent.requestPermission().then(s => s === "granted" && attach()).catch(() => {});
      });
    } else attach();
  }

  // ---------- postcard ----------
  async function svgToImage(svgStr, w, h) {
    let s = svgStr.replace(/class="[^"]*"/, "");
    if (!/xmlns=/.test(s)) s = s.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    s = s.replace("<svg", `<svg width="${w}" height="${h}"`);
    const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
    await img.decode(); return img;
  }
  function wrapText(g, text, maxW) {
    const words = text.split(/\s+/), lines = []; let line = "";
    for (const w of words) { const test = line ? line + " " + w : w; if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
    if (line) lines.push(line); return lines;
  }
  async function postcard(b) {
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), pal = S.PAL[b.palette] || S.PAL.mist;
    g.fillStyle = pal[0]; g.fillRect(0, 0, W, H);
    try { const img = await svgToImage(b.svgs?.[0] || S.pic(b.tiles?.[0]?.scene || "calmwater", b.palette, false), 1000, 733); g.save(); g.beginPath(); g.roundRect ? g.roundRect(40, 40, 1000, 733, 40) : g.rect(40, 40, 1000, 733); g.clip(); g.drawImage(img, 40, 40, 1000, 733); g.restore(); } catch {}
    if (b.wave?.length) { g.strokeStyle = pal[2]; g.globalAlpha = 0.6; g.lineWidth = 4; g.beginPath(); b.wave.forEach((a, i) => { const x = 60 + i * (960 / (b.wave.length - 1)), y = 840 - a * 40; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.globalAlpha = 1; }
    await document.fonts?.ready;
    g.fillStyle = pal[3]; g.font = '600 60px "Syne", sans-serif';
    wrapText(g, b.core || "", 960).slice(0, 4).forEach((l, i) => g.fillText(l, 60, 940 + i * 74));
    g.font = '30px "Figtree", sans-serif'; g.globalAlpha = 0.85;
    const s0 = b.steps?.[0]; if (s0) g.fillText(`${s0.when} · ${s0.what}`.slice(0, 60), 60, 1250);
    g.globalAlpha = 0.6; g.font = '26px "Figtree", sans-serif'; g.fillText("Tangent · " + (lang === "es" ? "una idea de Tangent" : "an idea by Tangent"), 60, 1305); g.globalAlpha = 1;
    try { const logo = new Image(); logo.src = "/assets/logo.png"; await logo.decode(); g.drawImage(logo, W - 170, H - 175, 120, 102); } catch {}
    const blob = await new Promise(r => c.toBlob(r, "image/png"));
    const file = new File([blob], "tangent.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: t("shareTitle") }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "tangent.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  // ---------- garden ----------
  function saveToGarden(b) {
    const list = store.get("tangent.garden", []);
    const entry = { ...b, svgs: (b.svgs || []).map(s => (s && s.length < 30000 ? s : null)) };
    list.unshift(entry);
    let trimmed = list.slice(0, 30);
    store.set("tangent.garden", trimmed);
    if (store.get("tangent.garden", []).length !== trimmed.length) { trimmed = trimmed.slice(0, 10).map(x => ({ ...x, svgs: [] })); store.set("tangent.garden", trimmed); }
  }
  function renderGarden() {
    const list = store.get("tangent.garden", []);
    $("#garden").hidden = !list.length;
    $("#seeds").innerHTML = list.map((b, i) => { const p = (S.PAL[b.palette] || S.PAL.mist); return `<button class="seed" data-g="${i}" title="${esc(b.core)}"><i style="background:radial-gradient(circle at 35% 35%,${p[1]},${p[2]})"></i><span>${esc((b.core || "").slice(0, 42))}${(b.core || "").length > 42 ? "…" : ""}</span></button>`; }).join("");
    document.querySelectorAll("[data-g]").forEach(el => el.onclick = () => { const b = store.get("tangent.garden", [])[+el.dataset.g]; if (b) openBoard(b, b.wave, false); });
  }

  // ---------- example ----------
  function exampleBoard() {
    const es = lang === "es";
    const wave = Array.from({ length: 120 }, (_, i) => 0.25 + 0.5 * Math.abs(Math.sin(i / 7)) * (0.6 + 0.4 * Math.sin(i / 23)));
    return {
      core: es ? "Mañana a las 7 empezás. Lo primero: un café y revisar el mail." : "Tomorrow at 7 you start. First thing: a coffee and check your email.",
      mood: "scattered", palette: "dawn", clip: 0, wave, at: Date.now(),
      tiles: [
        { scene: "sunrise", caption: es ? "Mañana empieza temprano" : "Tomorrow starts early" },
        { scene: "coffee", caption: es ? "Un café primero" : "Coffee first" },
        { scene: "inbox", caption: es ? "Revisar el mail" : "Check email" },
        { scene: "path", caption: es ? "Un paso a la vez" : "One step at a time" },
        { scene: "calmwater", caption: es ? "El resto puede esperar" : "The rest can wait" },
      ],
      breathe: es ? "No tenés que resolver todo esta noche." : "You don't have to solve everything tonight.",
      steps: es ? [{ when: "Ahora", what: "Poné la alarma a las 6:40" }, { when: "7:00", what: "Café y abrir el mail" }, { when: "7:30", what: "Elegí una sola tarea" }]
        : [{ when: "Now", what: "Set an alarm for 6:40" }, { when: "7:00", what: "Coffee and open email" }, { when: "7:30", what: "Pick just one task" }],
      letgo: es ? ["lo de la semana pasada", "contestar todo hoy"] : ["last week's stuff", "answering everything today"],
      tangents: es ? ["¿y si salgo a caminar?", "llamar a mamá", "ordenar el escritorio"] : ["a walk later?", "call mom", "tidy the desk"],
      sounds: ["birds", "cafe"], keep: [], photos: [], example: true,
    };
  }

  // ---------- wiring ----------
  $("#recBtn").onclick = startRecording;
  $("#stopBtn").onclick = stopRecording;
  $("#cancelBtn").onclick = cancelRecording;
  $("#typeLink").onclick = () => { const box = $("#typeBox"); box.hidden = !box.hidden; if (!box.hidden) $("#typed").focus(); };
  $("#typedGo").onclick = sendTyped;
  $("#typed").addEventListener("keydown", e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendTyped(); });
  $("#exampleLink").onclick = () => openBoard(exampleBoard(), null, false);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#modal").hidden) $("#mBtns button")?.click(); });
  if (banned()) $("#recBtn").disabled = true;
  applyLang(); renderGarden(); show("home");
})();
