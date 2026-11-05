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
      tagline: "Una idea de Tangent", heroL: "Para mentes no lineales · ES / EN",
      r1: "Hablá", r1s: "Como sale, sin ordenar nada", r2: "Mirá", r2s: "Una imagen clara del centro", r3: "Respirá", r3s: "Tres pasos y nada más",
      st1: "para decirlo todo", st2: "solo botón", st3: "cuentas obligatorias",
      sub: "Tocá el botón y tenés dos minutos para decir lo que quieras, como te salga.",
      sub2: "Tangent lo convierte en una imagen clara, una frase y tres pasos.",
      record: "Grabar tu idea", type: "Prefiero escribir", example: "Ver un ejemplo", showme: "Mostrame",
      garden: "Tu jardín de ideas", listening: "Te escucho. Tenés dos minutos para decir lo que quieras, sin apuro.", done: "Listo", cancel: "Cancelar",
      footwarn: "Experimental. Las imágenes son interpretaciones y pueden no coincidir con lo que imaginaste. No compartas datos privados.",
      terms: "Términos y normas", privacy: "Privacidad y cookies", rights: "Una idea de Tangent. Todos los derechos reservados.",
      think: ["Escuchando lo que dijiste…", "Dejando el ruido de lado…", "Buscando el centro…", "Armando tu imagen…"],
      heard: "Lo que dijiste, en una línea", simplify: "Simplificar", full: "Ver todo", postcard: "Postal", again: "Grabar otra idea", home: "Inicio",
      breathe: "Respirá", breatheSub: "Inhalá cuando crece, soltá cuando baja.", steps: "Lo que podés hacer", letgo: "Podés soltar esto",
      tangents: "Tangentes", sounds: "Sonido de fondo",
      mix: ["Enfoque", "Energía", "Calma", "Urgencia", "Claridad", "Ideas"], mixT: "Tu mezcla", voice: "Tu voz", words: "Palabras", noiseL: "Ruido", noise: "ruido", core: "el centro", clip: "CLIP", drawing: "dibujando…", photo: "Foto",
      consentT: "Antes de empezar",
      consent: ["Tangent es un experimento. Puede equivocarse y las imágenes pueden no coincidir con lo que imaginaste.",
        "Solo español e inglés. No compartas datos personales ni privados.",
        "Está prohibido hablar de sexo, violencia, guerra, política, aborto, muerte, racismo, drogas o usar malas palabras. La primera vez se corta la sesión; la segunda, este dispositivo queda bloqueado.",
        "Tu audio se procesa con servicios de IA externos. Tangent solo lo guarda si iniciás sesión, en tu cuenta, y lo podés borrar."],
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
      tooLongT: "Muy largo", tooLong: "La grabación es demasiado larga. Probá con menos de dos minutos.",
      micT: "Sin micrófono", mic: "No pudimos usar el micrófono. Revisá el permiso del navegador o escribí tu idea.",
      offline: "Sin conexión. Te mostramos un ejemplo.", tooShort: "Muy corto. Hablá al menos un par de segundos.", typeMore: "Escribí un poco más.",
      saved: "Guardado en tu jardín.", shareTitle: "Mi idea en Tangent",
      account: "Entrar", signin: "Entrar", signup: "Crear cuenta", email: "Email", password: "Contraseña", newPassword: "Nueva contraseña",
      forgot: "Olvidé mi contraseña", haveAcc: "Ya tengo cuenta", noAcc: "Crear una cuenta", sendCode: "Enviar código", code: "Código del mail",
      verify: "Verificar", verifyT: "Revisá tu mail", verifyS: "Te mandamos un código a {email}. Escribilo acá para activar tu cuenta. Si te llegó un link, tocalo y listo.",
      resetT: "Nueva contraseña", resetS: "Te mandamos un código a {email}. Escribilo junto con tu nueva contraseña.", savePw: "Guardar contraseña",
      logout: "Cerrar sesión", deleteAll: "Borrar todo lo guardado", deleteQ: "¿Borrar todos tus tableros y audios guardados? No se puede deshacer.", deleted: "Listo, borramos todo.",
      acctT: "Tu cuenta", acctS: "Guardá todo lo que grabás y volvé a escucharlo cuando quieras. Sin cuenta, Tangent funciona igual.",
      signedAs: "Sesión iniciada como", authErr: "No pudimos completar eso. Revisá los datos y probá de nuevo.", pwShort: "La contraseña necesita al menos 8 caracteres.",
      exists: "Ese mail ya tiene cuenta. Entrá con tu contraseña o tocá \"Olvidé mi contraseña\" y te mandamos un código.",
      welcome: "Listo, ya estás adentro.", pwSaved: "Contraseña actualizada.", storageNote: "Tus tableros y audios quedan en tu cuenta. Podés borrarlos cuando quieras.",
      copyText: "Copiar", say: "Contárselo a alguien", sayT: "Contárselo a alguien", sayS: "Elegí a quién y Tangent te arma un mensaje de 3 líneas, claro y listo para mandar. Podés editarlo antes.",
      to_boss: "Jefe o cliente", to_partner: "Pareja o familia", to_team: "Equipo", to_friend: "Amigo/a", sayWait: "Armando tu mensaje…", sayAgain: "Otra versión", sayErr: "No pude armar el mensaje ahora. Probá de nuevo en un rato.",
      listen: "Escuchar", stopListen: "Parar", share: "Compartir", remind: "Recordarme", replay: "Escucharte", power: "Tu superpoder",
      sameThread: "Sigue tu idea anterior", resumeT: "Estabas en…", resumeGo: "Seguir", step1Done: "Paso 1 hecho", nextStep: "Tu próximo paso",
      parkedT: "Tangentes estacionadas", park: "Estacionar", parked: "Estacionada. La retomás desde el inicio.", unpark: "Listo",
      shareT: "Compartir tu idea", shareS: "Quien tenga el link ve tu tablero con las fotos, la frase y los pasos. No ve tu audio ni lo que dijiste.",
      copy: "Copiar link", copied: "Link copiado", shareErr: "No pudimos crear el link. Probá de nuevo.", shareRefused: "Este tablero no se puede compartir.",
      remindT: "¿Cuándo te lo recuerdo?", remindS: "Se agrega a tu calendario con aviso. Tangent no te manda nada ni guarda la fecha.",
      summaryT: "Lo que dijiste", anchorsT: "Tus anclas visuales", anchorsS: "Acordate de estas imágenes y vas a recordar tu idea. Cada una guarda una parte de lo que dijiste.",
      brainT: "Tu cerebro en esta idea", brainNote: "Ilustrativo, no es un diagnóstico.",
      regions: { prefrontal: "Corteza prefrontal", motor: "Corteza motora", parietal: "Lóbulo parietal", temporal: "Lóbulo temporal", occipital: "Lóbulo occipital", limbic: "Sistema límbico" },
      voteQ: "¿Esta síntesis refleja lo que tenías en la cabeza?", voteYes: "Sí, exacto", voteMid: "Más o menos", voteNo: "No", voteThanks: "Gracias. Con tu voto Tangent aprende a entenderte mejor.",
      tonight: "Hoy, 20:00", tomorrow: "Mañana, 9:00", daily: "Ancla diaria: 9:00 durante 7 días", gcal: "Google Calendar", ics: "Apple / Outlook",
    },
    en: {
      experimental: "Experimental", lead1: "Say it messy.", lead2: "See it clear.",
      tagline: "An idea by Tangent", heroL: "For non-linear minds · EN / ES",
      r1: "Talk", r1s: "However it comes out", r2: "See", r2s: "A clear picture of the core", r3: "Breathe", r3s: "Three steps, nothing more",
      st1: "to say it all", st2: "single button", st3: "required accounts",
      sub: "Tap the button and you have two minutes to say whatever you want, however it comes out.",
      sub2: "Tangent turns it into one clear picture, one sentence and three steps.",
      record: "Record your idea", type: "I'd rather type", example: "See an example", showme: "Show me",
      garden: "Your idea garden", listening: "I'm listening. You have two minutes to say whatever you want, no rush.", done: "Done", cancel: "Cancel",
      footwarn: "Experimental. Images are interpretations and may not match what you imagined. Don't share private information.",
      terms: "Terms and rules", privacy: "Privacy and cookies", rights: "An idea by Tangent. All rights reserved.",
      think: ["Listening to what you said…", "Setting the noise aside…", "Finding the center…", "Building your picture…"],
      heard: "What you said, in one line", simplify: "Simplify", full: "Show all", postcard: "Postcard", again: "Record another idea", home: "Home",
      breathe: "Breathe", breatheSub: "Breathe in as it grows, out as it shrinks.", steps: "What you can do", letgo: "You can let go of",
      tangents: "Tangents", sounds: "Background sound",
      mix: ["Focus", "Energy", "Calm", "Urgency", "Clarity", "Ideas"], mixT: "Your mix", voice: "Your voice", words: "Words", noiseL: "Noise", noise: "noise", core: "the core", clip: "CLIP", drawing: "drawing…", photo: "Photo",
      consentT: "Before you start",
      consent: ["Tangent is an experiment. It can be wrong, and images may not match what you imagined.",
        "English and Spanish only. Don't share personal or private information.",
        "Talking about sex, violence, war, politics, abortion, death, racism, drugs, or using swear words is not allowed. The first time ends your session; the second time blocks this device.",
        "Your audio is processed by external AI services. Tangent only keeps it if you sign in, in your account, and you can delete it."],
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
      tooLongT: "Too long", tooLong: "The recording is too long. Try under two minutes.",
      micT: "No microphone", mic: "We couldn't use the microphone. Check the browser permission, or type your idea.",
      offline: "You're offline. Here's an example.", tooShort: "Too short. Talk for at least a couple of seconds.", typeMore: "Write a little more.",
      saved: "Saved to your garden.", shareTitle: "My idea on Tangent",
      account: "Sign in", signin: "Sign in", signup: "Create account", email: "Email", password: "Password", newPassword: "New password",
      forgot: "I forgot my password", haveAcc: "I have an account", noAcc: "Create an account", sendCode: "Send code", code: "Code from the email",
      verify: "Verify", verifyT: "Check your email", verifyS: "We sent a code to {email}. Type it here to activate your account. If you got a link, just tap it.",
      resetT: "New password", resetS: "We sent a code to {email}. Type it with your new password.", savePw: "Save password",
      logout: "Sign out", deleteAll: "Delete everything saved", deleteQ: "Delete all your saved boards and audio? This can't be undone.", deleted: "Done, everything is deleted.",
      acctT: "Your account", acctS: "Keep everything you record and listen to it again any time. Without an account, Tangent works the same.",
      signedAs: "Signed in as", authErr: "We couldn't do that. Check your details and try again.", pwShort: "The password needs at least 8 characters.",
      exists: "That email already has an account. Sign in with your password, or tap \"I forgot my password\" and we'll email you a code.",
      welcome: "You're in.", pwSaved: "Password updated.", storageNote: "Your boards and audio stay in your account. You can delete them any time.",
      copyText: "Copy", say: "Tell someone", sayT: "Tell someone", sayS: "Pick who it's for and Tangent writes a clear 3-line message, ready to send. You can edit it first.",
      to_boss: "Boss or client", to_partner: "Partner or family", to_team: "Team", to_friend: "Friend", sayWait: "Writing your message…", sayAgain: "Another version", sayErr: "I couldn't write the message right now. Try again in a moment.",
      listen: "Listen", stopListen: "Stop", share: "Share", remind: "Remind me", replay: "Hear yourself", power: "Your superpower",
      sameThread: "Continues your last idea", resumeT: "You were on…", resumeGo: "Continue", step1Done: "Step 1 done", nextStep: "Your next step",
      parkedT: "Parked tangents", park: "Park it", parked: "Parked. Pick it up from the home screen.", unpark: "Done",
      shareT: "Share your idea", shareS: "Anyone with the link sees your board with its photos, sentence and steps. They don't see your audio or what you said.",
      copy: "Copy link", copied: "Link copied", shareErr: "We couldn't create the link. Please try again.", shareRefused: "This board can't be shared.",
      remindT: "When should I remind you?", remindS: "It's added to your calendar with an alert. Tangent doesn't send anything or keep the date.",
      summaryT: "What you said", anchorsT: "Your visual anchors", anchorsS: "Remember these pictures and you'll remember your idea. Each one holds a part of what you said.",
      brainT: "Your brain on this idea", brainNote: "Illustrative, not a diagnosis.",
      regions: { prefrontal: "Prefrontal cortex", motor: "Motor cortex", parietal: "Parietal lobe", temporal: "Temporal lobe", occipital: "Occipital lobe", limbic: "Limbic system" },
      voteQ: "Does this summary match what was in your head?", voteYes: "Yes, exactly", voteMid: "Sort of", voteNo: "No", voteThanks: "Thanks. Your vote helps Tangent understand you better.",
      tonight: "Tonight, 8 pm", tomorrow: "Tomorrow, 9 am", daily: "Daily anchor: 9 am for 7 days", gcal: "Google Calendar", ics: "Apple / Outlook",
    },
  };
  let lang = store.get("tangent.lang", (navigator.language || "es").toLowerCase().startsWith("en") ? "en" : "es");
  const t = (k, v) => { let s = T[lang][k] ?? T.es[k] ?? k; if (v && typeof s === "string") for (const [a, b] of Object.entries(v)) s = s.replace("{" + a + "}", b); return s; };
  const ping = type => { try { navigator.sendBeacon?.("/api/event", new Blob([JSON.stringify({ type })], { type: "application/json" })) || fetch("/api/event", { method: "POST", body: JSON.stringify({ type }), keepalive: true }); } catch {} };
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
    document.querySelectorAll("#langSw [data-lang]").forEach(b => { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    document.querySelectorAll('a[href^="/terms.html"],a[href^="/privacy.html"]').forEach(a => { a.href = a.getAttribute("href").split("#")[0] + "#" + lang; });
    splitLead();
    $("#typed").placeholder = lang === "es" ? "Escribí como pensás, sin ordenar nada…" : "Write the way you think, no need to tidy it…";
    if (current) { if (current.example) current = { ...exampleBoard(), wave: current.wave }; renderBoard(current, true); }
    renderAcct(); renderHomeThread();
  }
  document.querySelectorAll("#langSw [data-lang]").forEach(b => b.onclick = () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang; store.set("tangent.lang", lang); applyLang();
  });
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
  let rec = null, lastAudio = null;
  const MAX_SEC = 120;
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
    show("recording"); drawLive(); startInk();
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
    const inkWords = stopInk();
    if (inkWords.length) ping("ink");
    const secs = (performance.now() - r.t0) / 1000;
    if (secs < 1.5) { show("home"); return note(t("tooShort")); }
    const blob = new Blob(r.chunks, { type: r.mr.mimeType || "audio/webm" });
    lastAudio = blob;
    const wave = downsample(r.amps, 120);
    thinking(inkWords);
    let wav;
    try { wav = await toWavBase64(blob); } catch { show("home"); return modal(t("errT"), `<p>${esc(t("err"))}</p>`); }
    analyze({ audio: wav }, wave, secs);
  }
  function cancelRecording() { if (!rec) return; const r = rec; rec = null; try { r.mr.stop(); } catch {} endStream(r); stopInk(); show("home"); }

  // ---------- live ink: key words float up while you talk ----------
  // Uses the browser's own speech recognition, only on computers: on phones the system
  // can't share the microphone safely with the recording, so phones keep the live waves.
  const STOP = new Set(("que como cuando donde para pero porque entonces tambien también esto esta este estos estas eso esa ese esos esas aquello algo nada todo toda todos todas otro otra otros otras mucho mucha muchos muchas poco poca muy mas más menos tiene tengo tenés tenes tenemos tienen hacer hago hace hacés haces hacemos hacen quiero quiere querés queres decir digo dice dije bueno buena bien cosa cosas onda tipo sea sino aunque mientras desde hasta sobre entre hacia según sin con contra ante bajo cada cual cuál quien quién ahora después despues antes luego ayer hoy mañana manana siempre nunca solo sólo creo creer parece puedo puede podés podes podemos pueden estoy está estás estas estamos están estan estaba fueron fuimos seria sería tenía tenia había habia hay voy vamos vas van ser son soy eres era eran porque pues osea digamos viste sabés sabes mismo misma vez veces acá aca allá alla aquí aqui ahí ahi nosotros ellos ellas usted ustedes mío mio tuyo suyo nuestro nuestra " +
    "that this with have from they what when where which there their would could should about just like really thing things kind sort some something anything nothing everything very much many more most less then than them these those been being were will into onto over under after before because while also even still well yeah okay going gonna wanna want need know think mean said says other your yours mine ours here only same such does doing done make made maybe actually basically literally").split(" "));
  let ink = null;
  const inkOk = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition) && matchMedia("(pointer: fine)").matches && !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  function startInk() {
    const box = $("#ink"); if (box) box.innerHTML = "";
    if (!inkOk() || store.get("tangent.ink", true) === false) return;
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    const me = ink = { words: [], seen: new Set(), r: null, alive: true };
    const begin = () => {
      if (!me.alive || ink !== me) return;
      const r = new R(); me.r = r;
      r.lang = lang === "en" ? "en-US" : "es-AR"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
      r.onresult = e => { for (let i = e.resultIndex; i < e.results.length; i++) inkText(me, e.results[i][0].transcript); };
      r.onerror = e => { if (/not-allowed|service-not-allowed|audio-capture|language-not-supported/.test(e.error)) me.alive = false; };
      r.onend = () => { if (me.alive && ink === me && rec) setTimeout(begin, 120); };
      try { r.start(); } catch { me.alive = false; }
    };
    begin();
  }
  function inkText(me, text) {
    for (const raw of String(text).split(/\s+/)) {
      const w = raw.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      if (w.length < 4 || STOP.has(w) || me.seen.has(w)) continue;
      me.seen.add(w); me.words.push(raw.replace(/[^\p{L}\p{N}]/gu, ""));
      inkWord(w, me.words.length);
    }
  }
  function inkWord(w, n) {
    const box = $("#ink"); if (!box) return;
    const el = document.createElement("span"); el.className = "iw"; el.textContent = w;
    // keep the words in the side bands, around the live waves, alternating left and right
    el.style[n % 2 ? "left" : "right"] = 1 + Math.random() * 6 + "%";
    el.style.top = 6 + [3, 0, 6, 1, 5, 2, 7, 4][Math.floor((n - 1) / 2) % 8] * 11.5 + Math.random() * 3 + "%"; // 8 rows per side, no overlaps
    el.style.fontSize = Math.min(26, 15 + w.length) + "px";
    el.style.setProperty("--d", (n % 7) * -1.3 + "s");
    box.append(el);
    const all = box.querySelectorAll(".iw:not(.old)");
    if (all.length > 16) { const o = all[0]; o.classList.add("old"); setTimeout(() => o.remove(), 1200); }
  }
  function stopInk() {
    const me = ink; ink = null;
    if (!me) return [];
    me.alive = false; try { me.r?.stop(); } catch {}
    return me.words.slice(0, 60);
  }
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
    lastAudio = null;
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
  async function analyze(payload, wave, secs = 0) {
    let res, data;
    try {
      const last = gardenList()[0], previous = last && Date.now() - (last.at || 0) < 3 * 36e5 ? last.core : "";
      res = await fetch("/api/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId, lang, previous, ...payload }) });
      data = await res.json().catch(() => ({ status: "ai_error" }));
    } catch {
      stopThinking(); note(t("offline")); return openBoard(exampleBoard(), wave);
    }
    stopThinking();
    switch (data.status) {
      case "ok": {
        const keys = (data.board.keep || []).concat(data.board.core.split(/\s+/));
        if (data.transcript) { placeWords(data.transcript.split(/\s+/)); await wait(400); placeWords(data.transcript.split(/\s+/), keys); await wait(2200); }
        const last = gardenList()[0], same = data.board.same_thread && last && Date.now() - (last.at || 0) < 3 * 36e5;
        if (same) ping("same_thread");
        const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
        return openBoard({ ...data.board, id, thread: same ? (last.thread || last.id || String(last.at)) : id, sameThread: !!same, transcript: data.transcript, lang: data.language, secs: Math.round(secs), at: Date.now() }, wave, true);
      }
      case "warning": show("home"); return modal(t("warnT"), `<p>${esc(t("warn"))}</p>`);
      case "banned": store.set("tangent.banned", true); show("home"); return showBanned();
      case "support": show("home"); return modal(t("supportT"), helpHtml(), [{ label: t("close") }]);
      case "language": show("home"); return modal(t("langT"), `<p>${esc(t("lang"))}</p>`);
      case "limit": show("home"); return modal(t("limitT"), `<p>${esc(t("limit"))}</p>`);
      case "empty": show("home"); return modal(t("emptyT"), `<p>${esc(t("empty"))}</p>`);
      case "too_long": show("home"); return modal(t("tooLongT"), `<p>${esc(t("tooLong"))}</p>`);
      default: show("home"); return modal(t("errT"), `<p>${esc(t("err"))}</p>${data.reason ? `<p style="font-size:12px;color:var(--muted)">${esc(data.reason)}</p>` : ""}`);
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
      const need = board.tiles.map((x, i) => (board.photos?.[i] ? -1 : i)).filter(i => i >= 0);
      if (!need.length) return [];
      const res = await fetch("/api/draw", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId, subjects: need.map(i => board.tiles[i].subject), palette: board.palette }) });
      const data = await res.json(), out = [];
      need.forEach((ti, k) => { const sv = data.svgs?.[k]; out[ti] = sv ? cleanSvg(sv) : null; });
      return out;
    } catch { return []; }
  }

  // ---------- board ----------
  let current = null, currentWave = null;
  async function openBoard(board, wave, fresh) {
    current = board; currentWave = wave || board.wave || null; current.wave = currentWave;
    renderBoard(board);
    if (fresh) {
      try {
        const res = await fetch("/api/photos", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId, queries: board.tiles.map(x => x.photo || x.subject) }) });
        const d = await res.json();
        if (d.photos?.some(Boolean)) { board.photos = d.photos; if (current === board) renderBoard(board); }
      } catch {}
      const pics = [...document.querySelectorAll(".tile[data-i] .pic:not(.photo)")];
      pics.forEach(p => { p.classList.add("drawing"); p.dataset.drawing = t("drawing"); });
      const svgs = await drawTiles(board);
      board.svgs = svgs.slice(0, board.tiles.length);
      pics.forEach(p => { const i = +p.closest(".tile").dataset.i, s = board.svgs[i]; if (s) { p.innerHTML = s; if (+p.closest(".tile").dataset.i === board.clip) p.firstElementChild?.classList.add("kb"); } p.classList.remove("drawing"); });
      saveToGarden(board);
      const audio = lastAudio; lastAudio = null;
      if (audio) { board.hasAudio = true; idbPut(board.id, audio); }
      cloudSave(board, audio);
    }
  }
  function waveSvg(w) {
    if (!w || !w.length) return "";
    const n = w.length, pts = w.map((a, i) => `${(i / (n - 1)) * 1000},${100 - a * 90}`).join(" "), low = w.map((a, i) => `${((n - 1 - i) / (n - 1)) * 1000},${100 + w[n - 1 - i] * 90}`).join(" ");
    return `<svg class="wave" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true"><polygon points="${pts} ${low}" fill="var(--glow)" opacity=".55"/><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" opacity=".5"/></svg>`;
  }
  const MIX_KEYS = ["focus", "energy", "calm", "urgency", "clarity", "ideas"];
  const MIX_DOT = ["#FFD36E", "#FF8A5B", "#7FE0C2", "#FF6FA8", "#7CC4FF", "#C8A8FF"];
  function radarSvg(mix) {
    if (!mix || !MIX_KEYS.some(k => mix[k] > 0)) return "";
    const W = 340, H = 300, cx = W / 2, cy = H / 2 + 6, R = 96;
    const pt = (i, r) => { const a = -Math.PI / 2 + i * Math.PI / 3; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
    const ring = f => MIX_KEYS.map((_, i) => pt(i, R * f).join(",")).join(" ");
    const shape = MIX_KEYS.map((k, i) => pt(i, R * Math.max(0.08, mix[k] / 100)).join(",")).join(" ");
    const labels = MIX_KEYS.map((k, i) => {
      const [x, y] = pt(i, R + 34), txt = t("mix")[i], w = txt.length * 6.6 + 34;
      return `<g transform="translate(${(x - w / 2).toFixed(1)},${(y - 13).toFixed(1)})"><rect width="${w.toFixed(1)}" height="26" rx="13" fill="rgba(25,22,70,.38)"/><circle cx="13" cy="13" r="4.5" fill="${MIX_DOT[i]}"/><text x="23" y="17" font-size="11.5" font-weight="600" fill="#fff">${esc(txt)}</text></g>`;
    }).join("");
    return `<svg class="radar" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("mixT"))}">
      <g fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1">${[1, .66, .33].map(f => `<polygon points="${ring(f)}"/>`).join("")}${MIX_KEYS.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}"/>`).join("")}</g>
      <polygon class="rshape" points="${shape}" fill="rgba(255,255,255,.32)" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
      ${labels}</svg>`;
  }
  function voiceCard(b) {
    const words = (b.transcript || "").split(/\s+/).filter(Boolean).length || b.words || 0;
    const kept = (b.core || "").split(/\s+/).filter(Boolean).length;
    const noise = words ? Math.max(0, Math.round(100 * (1 - Math.min(1, kept / words)))) : 0;
    const secs = b.secs || 0, big = secs ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}` : String(words);
    // dotted columns from the voice wave (or word rhythm when typed)
    let w = b.wave?.length ? b.wave : (b.transcript || b.core || "").split(/\s+/).map(x => Math.min(1, x.length / 9));
    const N = 46, cols = Array.from({ length: N }, (_, i) => { const s = Math.floor(i * w.length / N), e = Math.max(s + 1, Math.floor((i + 1) * w.length / N)); return Math.max(0, ...w.slice(s, e)); });
    const peak = cols.indexOf(Math.max(...cols)), ROWS = 12, gap = 10, dw = 600 / N;
    const hot = ["#FFE07A", "#FFC24D", "#FF9E3D", "#FF6B3D", "#F2443A"];
    let dots = "";
    cols.forEach((v, i) => {
      const n = Math.max(1, Math.round(v * ROWS)), near = Math.abs(i - peak) <= 4;
      for (let r = 0; r < n; r++) dots += `<circle style="--d:${i * 22 + r * 18}ms" cx="${(i * dw + dw / 2).toFixed(1)}" cy="${130 - r * gap}" r="${near ? 2.6 : 1.9}" fill="${near ? hot[Math.min(4, Math.floor((r / ROWS) * 5))] : "#BDBDBD"}"/>`;
    });
    return `<div class="tile panel voice">
      <div class="vhead"><h3>${t("voice")}</h3><div class="seg"><span>${t("words")} ${words}</span><span class="on">${t("noiseL")}</span></div></div>
      <div class="vnum"><b>${big}</b>${noise ? `<em>−${noise}% ${t("noise")}</em>` : ""}</div>
      <svg class="dots" viewBox="0 0 600 140" preserveAspectRatio="none" aria-hidden="true">${dots}</svg>
      <div class="vaxis"><span>0:00</span><span>${t("core")}</span><span>${big}</span></div>
    </div>`;
  }
  function renderBoard(b, keepScroll) {
    show("board"); if (keepScroll) window.scrollTo(0, 0);
    document.body.dataset.mood = b.mood || "calm";
    const pal = b.palette || "mist", tiles = b.tiles || [], photos = b.photos || [];
    const tileHtml = (x, i) => {
      const moving = i === b.clip, ph = photos[i];
      const inner = ph
        ? `<img class="${moving ? "kb" : ""}" src="${esc(ph.src)}" alt="${esc(ph.alt || x.caption || "")}" loading="${i < 2 ? "eager" : "lazy"}" referrerpolicy="no-referrer" data-fallback="${i}" style="background:${esc(ph.color || "#ddd")}"><span class="credit"><a href="${esc(ph.profile)}" target="_blank" rel="noopener">${esc(ph.credit)}</a> / <a href="${esc(ph.sourceUrl || ph.url)}" target="_blank" rel="noopener">${esc(ph.source || "Unsplash")}</a></span>`
        : (b.svgs?.[i] || S.pic(x.scene, pal, moving));
      return `<figure class="tile${i === 0 ? " big" : ""}" data-i="${i}"><div class="pic${ph ? " photo" : ""}">${inner}${moving ? `<span class="play">${t("clip")}</span>` : ""}</div>${x.caption ? `<figcaption class="cap">${esc(x.caption)}</figcaption>` : ""}</figure>`;
    };
    const parts = [];
    tiles.forEach((x, i) => parts.push(tileHtml(x, i)));
    if (b.brain?.region) parts.splice(b.strength?.name ? 1 : 1, 0, brainCard(b.brain));
    if (b.strength?.name) parts.splice(b.brain?.region ? 2 : 1, 0, `<div class="tile power"><span class="plabel">${t("power")}</span><b>${esc(b.strength.name)}</b><p>${esc(b.strength.how)}</p><svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"><circle cx="60" cy="60" r="20"/><circle cx="60" cy="60" r="36"/><circle cx="60" cy="60" r="52"/></g><g fill="#fff">${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${(60 + Math.cos(i * 1.047) * 36).toFixed(1)}" cy="${(60 + Math.sin(i * 1.047) * 36).toFixed(1)}" r="3"/>`).join("")}<circle cx="60" cy="60" r="6"/></g></svg></div>`);
    const extra = (b.strength?.name ? 1 : 0) + (b.brain?.region ? 1 : 0);
    if (b.breathe) parts.splice(2 + extra, 0, `<div class="tile breathe"><div class="bcirc">${t("breathe")}</div><p>${esc(b.breathe)}<small>${t("breatheSub")}</small></p></div>`);
    parts.splice((b.breathe ? 3 : 2) + extra, 0, voiceCard(b));
    if (tiles.length) parts.unshift(`<div class="tile panel anchors"><h3>${t("anchorsT")}</h3><p>${esc(t("anchorsS"))}</p></div>`);
    if (b.summary) parts.unshift(`<div class="tile panel summary"><h3>${t("summaryT")}</h3><p>${esc(b.summary)}</p></div>`);
    const steps = b.steps || [];
    if (steps.length) parts.push(`<div class="tile panel steps"><h3>${t("steps")}</h3><div class="srow">${steps.map(s => `<div class="s"><b>${esc(s.when)}</b><span>${esc(s.what)}</span></div>`).join("")}</div></div>`);
    if (b.letgo?.length) parts.push(`<div class="tile panel letgo"><h3>${t("letgo")}</h3><div>${b.letgo.map(x => `<s>${esc(x)}</s>`).join("")}</div></div>`);
    if (b.tangents?.length) parts.push(`<div class="tile panel bubbles" aria-label="${t("tangents")}"><h3>${t("tangents")}</h3>${b.tangents.map((x, i) => `<button class="bub" data-park="${i}" title="${esc(t("park"))}" style="left:${8 + i * 30}%;top:${44 + (i % 2) * 26}px;width:${104 + (x.length % 3) * 12}px;height:${104 + (x.length % 3) * 12}px;animation-delay:-${i * 2}s">${esc(x)}<small>${esc(t("park"))} ↘</small></button>`).join("")}</div>`);
    const sugg = b.sounds || [], all = [...sugg, ...SND.NAMES.filter(n => !sugg.includes(n))];
    if (!b.example) parts.push(`<div class="tile panel vote" id="voteBox"><h3>${t("voteQ")}</h3>${b.vote ? `<p>${esc(t("voteThanks"))}</p>` : `<div class="vbtns"><button class="vb" data-vote="yes">👍 ${t("voteYes")}</button><button class="vb" data-vote="mid">🤏 ${t("voteMid")}</button><button class="vb" data-vote="no">👎 ${t("voteNo")}</button></div>`}</div>`);
    parts.push(`<div class="tile panel"><h3>${t("sounds")}</h3><div class="mixer">${all.map(n => `<button class="chip" data-sound="${n}" aria-pressed="${SND.isPlaying(n)}">${soundLabel(n)}</button>`).join("")}</div></div>`);

    delete $("#board").dataset.fx;
    $("#board").innerHTML = `
      <div class="head">${waveSvg(b.wave)}
        <div class="head-l">
          <div class="heard">${t("heard")}${b.sameThread ? ` <span class="thread">↺ ${t("sameThread")}</span>` : ""}</div>
          <h2 class="core">${esc(b.core)}</h2>
          <div class="tools">
            <button class="chip" id="simpBtn" aria-pressed="${document.body.classList.contains("simple")}">${document.body.classList.contains("simple") ? t("full") : t("simplify")}</button>
            <button class="chip" id="cardBtn">${t("postcard")}</button>
          </div>
          <div class="actions">
            <button class="act" id="listenBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" fill="none"/></svg><span>${t("listen")}</span></button>
            ${b.hasAudio ? `<button class="act" id="replayBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" fill="none"/></svg><span>${t("replay")}</span></button>` : ""}
            ${b.example ? "" : `<button class="act" id="shareBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5" fill="none"/><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" fill="none"/></svg><span>${t("share")}</span></button>`}
            ${b.example ? "" : `<button class="act" id="sayBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5z" fill="none"/><path d="M8 9h8M8 12h5" fill="none"/></svg><span>${t("say")}</span></button>`}
            ${b.steps?.length ? `<button class="act" id="remindBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8" fill="none"/><path d="M10 20a2 2 0 004 0" fill="none"/></svg><span>${t("remind")}</span></button>` : ""}
          </div>
        </div>
        ${radarSvg(b.mix)}
      </div>
      <div class="mosaic">${parts.join("")}</div>
      <div class="again"><button class="btn" id="againBtn">${t("again")}</button><button class="btn ghost" id="homeBtn">${t("home")}</button></div>`;
    document.querySelectorAll("img[data-fallback]").forEach(img => img.addEventListener("error", () => {
      const i = +img.dataset.fallback, pic = img.closest(".pic"); if (!pic) return;
      pic.classList.remove("photo"); pic.innerHTML = b.svgs?.[i] || S.pic(b.tiles[i]?.scene, pal, i === b.clip);
    }, { once: true }));
    $("#simpBtn").onclick = toggleSimple;
    $("#cardBtn").onclick = () => postcard(b);
    $("#listenBtn").onclick = () => speak(b);
    document.querySelectorAll("[data-vote]").forEach(el => el.onclick = () => {
      b.vote = el.dataset.vote; ping("vote_" + b.vote); saveToGarden(b);
      $("#voteBox").innerHTML = `<h3>${t("voteQ")}</h3><p class="thanks">${esc(t("voteThanks"))}</p>`;
      if (SB && user && b.id) SB.from("tangent_boards").update({ board: { ...b, svgs: undefined } }).eq("id", b.id).then(() => {}, () => {});
    });
    if ($("#replayBtn")) $("#replayBtn").onclick = () => replay(b);
    if ($("#shareBtn")) $("#shareBtn").onclick = () => shareBoard(b);
    if ($("#remindBtn")) $("#remindBtn").onclick = () => remind(b);
    if ($("#sayBtn")) $("#sayBtn").onclick = () => sayIt(b);
    document.querySelectorAll("[data-park]").forEach(el => el.onclick = () => { park(b.tangents[+el.dataset.park], b); el.classList.add("gone"); });
    $("#againBtn").onclick = () => { SND.stopAll(); hush(); startRecording(); };
    $("#homeBtn").onclick = () => { SND.stopAll(); hush(); current = null; show("home"); renderGarden(); renderHomeThread(); };
    document.querySelectorAll("[data-sound]").forEach(el => el.onclick = async () => { const on = await SND.toggle(el.dataset.sound, 0.6); el.setAttribute("aria-pressed", String(on)); });
    armShake();
  }
  // stylised side view of the brain (front on the left); regions are approximate and illustrative
  const BRAIN = {
    prefrontal: [[78, 96, 30, 34]], motor: [[148, 58, 18, 40]], parietal: [[196, 66, 36, 28]],
    temporal: [[150, 132, 46, 20]], occipital: [[246, 112, 22, 28]], limbic: [[160, 104, 18, 12]],
  };
  function brainCard(br) {
    const on = BRAIN[br.region] || [], name = t("regions")[br.region] || "";
    const zones = Object.entries(BRAIN).map(([k, es]) => es.map(([cx, cy, rx, ry]) => `<ellipse class="${k === br.region ? "hot" : ""}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`).join("")).join("");
    const hot = on.map(([cx, cy]) => `<circle class="pulse" cx="${cx}" cy="${cy}" r="10"/><circle cx="${cx}" cy="${cy}" r="4" fill="#fff"/>`).join("");
    return `<div class="tile panel brain"><div class="bt"><h3>${t("brainT")}</h3><b>${esc(name)}</b><p>${esc(br.why)}</p><small>${esc(t("brainNote"))}</small></div>
      <svg viewBox="0 0 300 200" role="img" aria-label="${esc(name)}"><defs><linearGradient id="bg-br" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF0FF"/><stop offset="1" stop-color="#E4E8FB"/></linearGradient></defs>
        <path class="shell" d="M60 110 C 48 60, 100 22, 160 24 C 220 24, 272 52, 276 104 C 280 140, 256 160, 226 158 C 214 176, 186 182, 170 168 C 150 178, 112 170, 104 152 C 76 152, 62 134, 60 110 Z" fill="url(#bg-br)"/>
        <path d="M226 158 C 236 176, 250 184, 262 176 C 270 168, 264 156, 252 154" fill="#E4E8FB" stroke="#B9C2EE" stroke-width="1.5"/>
        <g class="folds" fill="none" stroke="#C3CAF0" stroke-width="1.6" stroke-linecap="round"><path d="M100 60 C 120 80, 110 100, 128 116"/><path d="M146 30 C 140 60, 158 80, 150 108"/><path d="M190 34 C 184 60, 206 70, 200 96"/><path d="M234 60 C 222 84, 246 96, 236 122"/><path d="M110 140 C 140 128, 180 140, 210 132"/></g>
        <g class="zones">${zones}</g>${hot}</svg></div>`;
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
    const c = await makeCard(b);
    const blob = await new Promise(r => c.toBlob(r, "image/png"));
    const file = new File([blob], "tangent.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: t("shareTitle") }); return; } catch (e) { if (e.name === "AbortError") return; } }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "tangent.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  async function makeCard(b) {
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"), pal = S.PAL[b.palette] || S.PAL.mist;
    g.fillStyle = pal[0]; g.fillRect(0, 0, W, H);
    try {
      let img, ph = b.photos?.[0];
      if (ph) { img = new Image(); img.crossOrigin = "anonymous"; img.src = ph.src; await img.decode(); }
      else img = await svgToImage(b.svgs?.[0] || S.pic(b.tiles?.[0]?.scene || "calmwater", b.palette, false), 1000, 733);
      const sc = Math.max(1000 / img.width, 733 / img.height), sw = 1000 / sc, sh = 733 / sc;
      g.save(); g.beginPath(); g.roundRect ? g.roundRect(40, 40, 1000, 733, 40) : g.rect(40, 40, 1000, 733); g.clip();
      g.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 40, 40, 1000, 733); g.restore();
      if (ph) { g.font = '22px "Inter Tight", sans-serif'; g.fillStyle = "rgba(255,255,255,.9)"; g.fillText(`${ph.credit} / ${ph.source || "Unsplash"}`, 64, 750); }
    } catch {}
    if (b.wave?.length) { g.strokeStyle = pal[2]; g.globalAlpha = 0.6; g.lineWidth = 4; g.beginPath(); b.wave.forEach((a, i) => { const x = 60 + i * (960 / (b.wave.length - 1)), y = 840 - a * 40; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.globalAlpha = 1; }
    await document.fonts?.ready;
    g.fillStyle = pal[3]; g.font = '700 60px "Inter Tight", sans-serif';
    wrapText(g, b.core || "", 960).slice(0, 4).forEach((l, i) => g.fillText(l, 60, 940 + i * 74));
    g.font = '30px "Figtree", sans-serif'; g.globalAlpha = 0.85;
    const s0 = b.steps?.[0]; if (s0) g.fillText(`${s0.when} · ${s0.what}`.slice(0, 60), 60, 1250);
    g.globalAlpha = 0.6; g.font = '26px "Figtree", sans-serif'; g.fillText("Tangent · " + (lang === "es" ? "una idea de Tangent" : "an idea by Tangent"), 60, 1305); g.globalAlpha = 1;
    if (b.strength?.name) { g.font = '600 26px "Inter Tight", sans-serif'; g.fillStyle = "#6A55E0"; g.fillText(("✦ " + b.strength.name).toUpperCase(), 60, 885); }
    try { const logo = new Image(); logo.src = "/assets/mark@3x.webp"; await logo.decode(); g.drawImage(logo, W - 250, H - 190, 200, 145); } catch {}
    return c;
  }

  // ---------- garden ----------
  const gardenList = () => store.get("tangent.garden", []);
  function saveToGarden(b) {
    const list = store.get("tangent.garden", []).filter(x => !b.id || x.id !== b.id);
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

  // ---------- keep the thread: "you were on…" + parked tangents ----------
  function renderHomeThread() {
    const last = gardenList().find(x => !x.example), box = $("#resume");
    if (!box) return;
    if (!last || last.step1Done && !last.steps?.[1]) { box.hidden = true; }
    else {
      const k = last.step1Done ? 1 : 0, st = last.steps?.[k], ph = last.photos?.find(Boolean);
      box.hidden = false;
      box.innerHTML = `<div class="rs-pic">${ph ? `<img src="${esc(ph.src)}" alt="" referrerpolicy="no-referrer">` : S.pic(last.tiles?.[0]?.scene || "calmwater", last.palette, false)}</div>
        <div class="rs-body"><span class="plabel">${t("resumeT")}</span><b>${esc(last.core)}</b>${st ? `<p><span>${t("nextStep")}</span> ${esc(st.when)} · ${esc(st.what)}</p>` : ""}
        <div class="rs-btns"><button class="btn" id="rsGo">${t("resumeGo")}</button>${!last.step1Done && st ? `<button class="btn ghost" id="rsDone">✓ ${t("step1Done")}</button>` : ""}</div></div>`;
      $("#rsGo").onclick = () => { ping("resume"); openBoard(last, last.wave, false); };
      if ($("#rsDone")) $("#rsDone").onclick = () => { const l = gardenList(); const i = l.findIndex(x => x.at === last.at); if (i >= 0) { l[i].step1Done = true; store.set("tangent.garden", l); } renderHomeThread(); };
    }
    const parkedList = store.get("tangent.parked", []).filter(x => !x.done), pb = $("#parkedBox");
    pb.hidden = !parkedList.length;
    pb.innerHTML = `<h2>${t("parkedT")}</h2><div class="parked">${parkedList.map(x => `<span class="pk"><button class="pk-go" data-pk="${esc(x.id)}" title="${esc(t("record"))}">${esc(x.text)}</button><button class="pk-x" data-pkx="${esc(x.id)}" aria-label="${esc(t("unpark"))}">✓</button></span>`).join("")}</div>`;
    pb.querySelectorAll("[data-pkx]").forEach(el => el.onclick = () => { const l = store.get("tangent.parked", []); const it = l.find(x => x.id === el.dataset.pkx); if (it) { it.done = true; store.set("tangent.parked", l); cloudPark(it, true); } renderHomeThread(); });
    pb.querySelectorAll("[data-pk]").forEach(el => el.onclick = () => { const it = store.get("tangent.parked", []).find(x => x.id === el.dataset.pk); if (!it) return; $("#typeBox").hidden = false; $("#typed").value = it.text + ": "; $("#typed").focus(); });
  }
  function park(text, b) {
    if (!text) return;
    const l = store.get("tangent.parked", []);
    if (l.some(x => x.text === text && !x.done)) return;
    const it = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), text, from: b?.id || null, at: Date.now(), done: false };
    l.unshift(it); store.set("tangent.parked", l.slice(0, 40)); ping("park"); toast(t("parked")); cloudPark(it);
  }
  function toast(msg) {
    const el = document.createElement("div"); el.className = "toast"; el.textContent = msg; el.setAttribute("role", "status");
    document.body.append(el); requestAnimationFrame(() => el.classList.add("on"));
    setTimeout(() => { el.classList.remove("on"); setTimeout(() => el.remove(), 400); }, 2600);
  }

  // ---------- listen: read the board aloud ----------
  let speaking = false;
  function hush() { try { speechSynthesis.cancel(); } catch {} speaking = false; const l = $("#listenBtn span"); if (l) l.textContent = t("listen"); $("#listenBtn")?.classList.remove("on"); }
  function pickVoice(code) {
    const vs = speechSynthesis.getVoices().filter(v => v.lang?.toLowerCase().startsWith(code));
    const score = v => (/natural|neural|premium|enhanced|google|siri/i.test(v.name) ? 2 : 0) + (code === "es" && /es-(ar|us|mx|419)/i.test(v.lang) ? 1 : 0) + (v.localService ? 0 : 0.5);
    return vs.sort((a, b) => score(b) - score(a))[0] || null;
  }
  function speak(b) {
    if (!("speechSynthesis" in window)) return;
    if (speaking) return hush();
    const code = (b.lang || lang) === "en" ? "en" : "es";
    const steps = (b.steps || []).map((s, i) => `${i + 1}. ${s.what}.`).join(" ");
    const text = [b.summary || b.core, b.brain?.why || "", b.strength?.name ? `${t("power")}: ${b.strength.name}. ${b.strength.how}` : "", steps ? `${t("steps")}. ${steps}` : "", b.breathe || ""].filter(Boolean).join(" … ");
    const u = new SpeechSynthesisUtterance(text), v = pickVoice(code);
    u.lang = v?.lang || (code === "es" ? "es-AR" : "en-US"); if (v) u.voice = v; u.rate = 0.96; u.pitch = 1;
    u.onend = u.onerror = () => hush();
    speechSynthesis.cancel(); speechSynthesis.speak(u); speaking = true; ping("listen");
    const l = $("#listenBtn span"); if (l) l.textContent = t("stopListen"); $("#listenBtn")?.classList.add("on");
  }
  if ("speechSynthesis" in window) speechSynthesis.getVoices();

  // ---------- hear yourself: the original audio ----------
  let player = null;
  async function replay(b) {
    if (player && !player.paused) { player.pause(); return; }
    let blob = await idbGet(b.id);
    let src = blob ? URL.createObjectURL(blob) : null;
    if (!src && b.audioPath && SB && user) { const { data } = await SB.storage.from("tangent-audio").createSignedUrl(b.audioPath, 600); src = data?.signedUrl || null; }
    if (!src) return;
    player = new Audio(src); player.play().catch(() => {}); ping("replay");
  }
  // tiny IndexedDB store for audio on this device
  const idb = () => new Promise((res, rej) => { const r = indexedDB.open("tangent", 1); r.onupgradeneeded = () => r.result.createObjectStore("audio"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function idbPut(k, v) { try { const db = await idb(); db.transaction("audio", "readwrite").objectStore("audio").put(v, k); } catch {} }
  async function idbGet(k) { try { const db = await idb(); return await new Promise(res => { const q = db.transaction("audio").objectStore("audio").get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => res(null); }); } catch { return null; } }
  async function idbClear() { try { const db = await idb(); db.transaction("audio", "readwrite").objectStore("audio").clear(); } catch {} }

  // ---------- share: public read-only link + custom card ----------
  async function shareBoard(b) {
    const btn = $("#shareBtn"); btn?.classList.add("busy");
    try {
      let url = b.shareUrl;
      if (!url) {
        const c = await makeCard(b), image = c.toDataURL("image/jpeg", 0.86);
        const res = await fetch("/api/share", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId, image, board: { ...b, lang: b.lang || lang } }) });
        const d = await res.json();
        if (d.status === "refused") return modal(t("shareT"), `<p>${esc(t("shareRefused"))}</p>`);
        if (d.status !== "ok") throw new Error(d.status);
        url = d.url; b.shareUrl = url; saveToGarden(b);
      }
      if (navigator.share && matchMedia("(pointer: coarse)").matches) { try { await navigator.share({ url, title: t("shareTitle"), text: b.core }); return; } catch (e) { if (e.name === "AbortError") return; } }
      const enc = encodeURIComponent;
      const p = modal(t("shareT"), `<p>${esc(t("shareS"))}</p><div class="sharelink"><input id="shUrl" readonly value="${esc(url)}"><button class="btn" id="shCopy">${t("copy")}</button></div>
        <div class="sharevia"><a class="chip" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(b.core + " " + url)}">WhatsApp</a><a class="chip" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${enc(b.core)}&url=${enc(url)}">X</a><a class="chip" target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}">LinkedIn</a><a class="chip" target="_blank" rel="noopener" href="${esc(url)}">↗</a></div>`, [{ label: t("close") }]);
      $("#shCopy").onclick = async () => { try { await navigator.clipboard.writeText(url); } catch { $("#shUrl").select(); document.execCommand?.("copy"); } $("#shCopy").textContent = t("copied"); };
      await p;
    } catch { modal(t("shareT"), `<p>${esc(t("shareErr"))}</p>`); }
    finally { btn?.classList.remove("busy"); }
  }

  // ---------- say it to someone: a 3-line message, ready to send ----------
  const AUD = ["boss", "partner", "team", "friend"];
  function sayIt(b) {
    b.msgs = b.msgs || {};
    const p = modal(t("sayT"), `<p class="small">${esc(t("sayS"))}</p><div class="aud">${AUD.map(k => `<button class="chip" data-to="${k}">${t("to_" + k)}</button>`).join("")}</div><div id="sayOut" class="sayout" hidden></div>`, [{ label: t("close") }]);
    const out = $("#sayOut");
    const showMsg = (to, msg) => {
      const enc = encodeURIComponent, subj = (b.core || "").slice(0, 80);
      out.hidden = false;
      out.innerHTML = `<textarea id="sayTxt" rows="4" aria-label="${esc(t("sayT"))}">${esc(msg)}</textarea>
        <div class="sharevia"><button class="btn" id="sayCopy">${t("copyText")}</button><a class="chip" id="sayWa" target="_blank" rel="noopener">WhatsApp</a><a class="chip" id="sayMail">Email</a>${navigator.share && matchMedia("(pointer: coarse)").matches ? `<button class="chip" id="sayShare">↗</button>` : ""}<button class="chip" id="sayAgain" data-again="${to}">${t("sayAgain")}</button></div>`;
      const txt = () => $("#sayTxt").value.trim();
      const links = () => { $("#sayWa").href = `https://wa.me/?text=${enc(txt())}`; $("#sayMail").href = `mailto:?subject=${enc(subj)}&body=${enc(txt())}`; };
      links(); $("#sayTxt").oninput = links;
      $("#sayCopy").onclick = async () => { try { await navigator.clipboard.writeText(txt()); } catch { $("#sayTxt").select(); document.execCommand?.("copy"); } $("#sayCopy").textContent = t("copied"); };
      if ($("#sayShare")) $("#sayShare").onclick = () => navigator.share({ text: txt() }).catch(() => {});
      $("#sayAgain").onclick = () => { delete b.msgs[to]; ask(to); };
    };
    const ask = async to => {
      document.querySelectorAll("[data-to]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.to === to)));
      if (b.msgs[to]) return showMsg(to, b.msgs[to]);
      out.hidden = false; out.innerHTML = `<p class="small sayload">${esc(t("sayWait"))}</p>`;
      try {
        const res = await fetch("/api/say", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId, to, lang: b.lang || lang, board: { core: b.core, summary: b.summary, steps: b.steps } }) });
        const d = await res.json().catch(() => ({ status: "ai_error" }));
        if (d.status === "ok") { b.msgs[to] = d.message; if (!b.example) saveToGarden(b); return showMsg(to, d.message); }
        if (d.status === "banned") { store.set("tangent.banned", true); }
        out.innerHTML = `<p class="small">${esc(t(d.status === "limit" ? "limit" : d.status === "refused" ? "shareRefused" : "sayErr"))}</p>`;
      } catch { out.innerHTML = `<p class="small">${esc(t("sayErr"))}</p>`; }
    };
    document.querySelectorAll("[data-to]").forEach(el => el.onclick = () => ask(el.dataset.to));
    return p;
  }

  // ---------- remind: calendar event (.ics or Google) ----------
  function remind(b) {
    const s0 = b.steps?.[b.step1Done ? 1 : 0] || b.steps?.[0], title = `Tangent · ${s0?.what || b.core}`.slice(0, 90);
    const desc = `${b.core}\n\n${(b.steps || []).map((s, i) => `${i + 1}. ${s.when} · ${s.what}`).join("\n")}${b.shareUrl ? "\n\n" + b.shareUrl : ""}`;
    const at = (days, h) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(h, 0, 0, 0); return d; };
    const opts = [["tonight", at(0, 20), 0], ["tomorrow", at(1, 9), 0], ["daily", at(1, 9), 7]];
    if (opts[0][1] < new Date()) opts.shift();
    const z = d => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const icsFor = (d, n) => {
      const e = new Date(d.getTime() + 15 * 60e3), x = s => s.replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
      return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tangent//ES", "BEGIN:VEVENT", `UID:${b.id || Date.now()}-${d.getTime()}@tangent`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(d)}`, `DTEND:${z(e)}`,
        `SUMMARY:${x(title)}`, `DESCRIPTION:${x(desc)}`, ...(n ? [`RRULE:FREQ=DAILY;COUNT=${n}`] : []), "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${x(title)}`, "TRIGGER:-PT0M", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    };
    const gFor = (d, n) => `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${z(d)}/${z(new Date(d.getTime() + 15 * 60e3))}&details=${encodeURIComponent(desc)}${n ? `&recur=${encodeURIComponent("RRULE:FREQ=DAILY;COUNT=" + n)}` : ""}`;
    const p = modal(t("remindT"), `<p class="small">${esc(t("remindS"))}</p><div class="remind">${opts.map(([k, d, n], i) => `<div class="rm"><b>${t(k)}</b><span><a class="chip" target="_blank" rel="noopener" href="${gFor(d, n)}" data-rm>${t("gcal")}</a><button class="chip" data-ics="${i}">${t("ics")}</button></span></div>`).join("")}</div>`, [{ label: t("close") }]);
    document.querySelectorAll("[data-rm]").forEach(a => a.addEventListener("click", () => ping("reminder")));
    document.querySelectorAll("[data-ics]").forEach(el => el.onclick = () => {
      const [, d, n] = opts[+el.dataset.ics], blob = new Blob([icsFor(d, n)], { type: "text/calendar" }), a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "tangent.ics"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); ping("reminder");
    });
    return p;
  }

  // ---------- account (optional): Supabase auth + cloud save ----------
  const SB_URL = "https://pfwazngwcvirdeyamvsd.supabase.co", SB_KEY = "sb_publishable_5wLxVtnFy4IMOAMK_rzZ-A_cZ1TSOeV";
  const SB = window.supabase?.createClient ? window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "tangent.auth" } }) : null;
  let user = null;
  function renderAcct() {
    const b = $("#acctBtn"); if (!b) return;
    b.innerHTML = user ? `<i>${esc((user.email || "?")[0].toUpperCase())}</i>` : `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none"/><path d="M4 21a8 8 0 0116 0" fill="none"/></svg><span>${t("account")}</span>`;
    b.classList.toggle("in", !!user); b.setAttribute("aria-label", user ? t("acctT") : t("account"));
  }
  async function cloudSave(b, audio) {
    if (!SB || !user || b.example) return;
    try {
      let audioPath = null;
      if (audio) {
        const ext = /mp4/.test(audio.type) ? "m4a" : /ogg/.test(audio.type) ? "ogg" : "webm";
        audioPath = `${user.id}/${b.id}.${ext}`;
        const up = await SB.storage.from("tangent-audio").upload(audioPath, audio, { contentType: audio.type.split(";")[0] || "audio/webm", upsert: true });
        if (up.error) audioPath = null;
      }
      const { transcript, svgs, ...rest } = b;
      const board = { ...rest, transcript, audioPath };
      await SB.from("tangent_boards").insert({ id: b.id, thread_id: /^[0-9a-f-]{36}$/.test(b.thread || "") ? b.thread : null, core: b.core, board, audio_path: audioPath });
      if (audioPath) { b.audioPath = audioPath; saveToGarden(b); }
    } catch {}
  }
  async function cloudPark(it, done) {
    if (!SB || !user) return;
    try { if (done) await SB.from("tangent_parked").update({ done: true }).eq("id", it.id); else await SB.from("tangent_parked").insert({ id: it.id, text: it.text.slice(0, 80), board_id: null }); } catch {}
  }
  async function cloudPull() {
    if (!SB || !user) return;
    try {
      const [{ data: boards }, { data: pk }] = await Promise.all([
        SB.from("tangent_boards").select("id,board,created_at").order("created_at", { ascending: false }).limit(30),
        SB.from("tangent_parked").select("id,text,done,created_at").order("created_at", { ascending: false }).limit(40),
      ]);
      if (boards?.length) {
        const local = gardenList(), ids = new Set(local.map(x => x.id));
        const merged = [...local, ...boards.filter(r => !ids.has(r.id)).map(r => ({ ...r.board, id: r.id, hasAudio: !!r.board.audioPath }))].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 30);
        store.set("tangent.garden", merged);
      }
      if (pk?.length) {
        const local = store.get("tangent.parked", []), ids = new Set(local.map(x => x.id));
        store.set("tangent.parked", [...local, ...pk.filter(r => !ids.has(r.id)).map(r => ({ id: r.id, text: r.text, done: r.done, at: Date.parse(r.created_at) }))].slice(0, 40));
      }
      renderGarden(); renderHomeThread();
    } catch {}
  }
  function field(id, type, label, extra = "") { return `<label class="fld"><span>${esc(label)}</span><input id="${id}" type="${type}" ${extra}></label>`; }
  function authErr(e) { const m = String(e?.message || ""); return /password/i.test(m) && /6|8|short|weak/i.test(m) ? t("pwShort") : t("authErr"); }
  function openAccount(view = user ? "me" : "signin", email = "") {
    const box = $("#acct"); box.hidden = false; document.body.classList.add("noscroll");
    const close = () => { box.hidden = true; document.body.classList.remove("noscroll"); };
    const V = {
      signin: () => `<h2>${t("signin")}</h2><p class="small">${esc(t("acctS"))}</p>${field("aEmail", "email", t("email"), `autocomplete="email" value="${esc(email)}"`)}${field("aPw", "password", t("password"), 'autocomplete="current-password"')}
        <button class="btn wide" data-do="signin">${t("signin")}</button><div class="alinks"><button class="textlink" data-go="forgot">${t("forgot")}</button><button class="textlink" data-go="signup">${t("noAcc")}</button></div>`,
      signup: () => `<h2>${t("signup")}</h2><p class="small">${esc(t("acctS"))}</p>${field("aEmail", "email", t("email"), `autocomplete="email" value="${esc(email)}"`)}${field("aPw", "password", t("password"), 'autocomplete="new-password" minlength="8"')}
        <button class="btn wide" data-do="signup">${t("signup")}</button><div class="alinks"><button class="textlink" data-go="signin">${t("haveAcc")}</button></div>`,
      verify: () => `<h2>${t("verifyT")}</h2><p class="small">${esc(t("verifyS", { email }))}</p>${field("aCode", "text", t("code"), 'inputmode="numeric" autocomplete="one-time-code" maxlength="10"')}
        <button class="btn wide" data-do="verify">${t("verify")}</button>`,
      forgot: () => `<h2>${t("forgot")}</h2>${field("aEmail", "email", t("email"), `autocomplete="email" value="${esc(email)}"`)}<button class="btn wide" data-do="forgot">${t("sendCode")}</button><div class="alinks"><button class="textlink" data-go="signin">${t("signin")}</button></div>`,
      reset: () => `<h2>${t("resetT")}</h2>${email ? `<p class="small">${esc(t("resetS", { email }))}</p>${field("aCode", "text", t("code"), 'inputmode="numeric" autocomplete="one-time-code" maxlength="10"')}` : ""}${field("aPw", "password", t("newPassword"), 'autocomplete="new-password" minlength="8"')}
        <button class="btn wide" data-do="reset">${t("savePw")}</button>`,
      me: () => `<h2>${t("acctT")}</h2><p class="small">${t("signedAs")} <b>${esc(user?.email || "")}</b></p><p class="small">${esc(t("storageNote"))}</p>
        <button class="btn wide ghost" data-do="logout">${t("logout")}</button><button class="textlink danger" data-do="wipe">${t("deleteAll")}</button>`,
    };
    const render = v => {
      box.querySelector(".abody").innerHTML = V[v]() + `<p class="aerr" role="alert"></p>`;
      box.querySelectorAll("[data-go]").forEach(el => el.onclick = () => { email = $("#aEmail")?.value.trim() || email; render(el.dataset.go); });
      box.querySelectorAll("[data-do]").forEach(el => el.onclick = () => act(el.dataset.do, el));
      box.querySelector("input")?.focus();
      box.querySelectorAll("input").forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") box.querySelector("[data-do]")?.click(); }));
    };
    const fail = msg => { const e = box.querySelector(".aerr"); if (e) e.textContent = msg; };
    async function act(what, el) {
      if (!SB) return fail(t("authErr"));
      el.disabled = true; fail("");
      try {
        const em = $("#aEmail")?.value.trim() || email, pw = $("#aPw")?.value || "", code = ($("#aCode")?.value || "").replace(/\s/g, "");
        if ((what === "signup" || what === "reset") && pw.length < 8) return fail(t("pwShort"));
        if (what === "signin") { const { error } = await SB.auth.signInWithPassword({ email: em, password: pw }); if (error) { if (/confirm/i.test(error.message)) { email = em; await SB.auth.resend({ type: "signup", email: em }).catch(() => {}); return render("verify"); } throw error; } ping("login"); close(); toast(t("welcome")); }
        else if (what === "signup") { const { data, error } = await SB.auth.signUp({ email: em, password: pw, options: { emailRedirectTo: location.origin + "/" } }); if (error) throw error; email = em;
          if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) { render("signin"); return fail(t("exists")); }
          ping("signup"); if (data.session) { close(); toast(t("welcome")); } else render("verify"); }
        else if (what === "verify") { const { error } = await SB.auth.verifyOtp({ email, token: code, type: "signup" }); if (error) throw error; close(); toast(t("welcome")); }
        else if (what === "forgot") { const { error } = await SB.auth.resetPasswordForEmail(em, { redirectTo: location.origin + "/" }); if (error) throw error; email = em; render("reset"); }
        else if (what === "reset") { if (code) { const { error } = await SB.auth.verifyOtp({ email, token: code, type: "recovery" }); if (error) throw error; } const { error } = await SB.auth.updateUser({ password: pw }); if (error) throw error; close(); toast(t("pwSaved")); }
        else if (what === "logout") { await SB.auth.signOut(); close(); }
        else if (what === "wipe") {
          if ((await modal(t("deleteAll"), `<p>${esc(t("deleteQ"))}</p>`, [{ label: t("cancel"), ghost: true, value: false }, { label: t("deleteAll"), value: true }])) !== true) return;
          const { data: files } = await SB.storage.from("tangent-audio").list(user.id, { limit: 1000 });
          if (files?.length) await SB.storage.from("tangent-audio").remove(files.map(f => `${user.id}/${f.name}`));
          await SB.from("tangent_parked").delete().eq("user_id", user.id);
          await SB.from("tangent_boards").delete().eq("user_id", user.id);
          store.set("tangent.garden", []); store.set("tangent.parked", []); await idbClear(); renderGarden(); renderHomeThread(); close(); toast(t("deleted"));
        }
      } catch (e) { fail(authErr(e)); }
      finally { el.disabled = false; }
    }
    box.querySelector(".aclose").onclick = close;
    box.onclick = e => { if (e.target === box) close(); };
    render(view);
  }
  if (SB) {
    SB.auth.onAuthStateChange((ev, session) => {
      const was = user?.id; user = session?.user || null; renderAcct();
      if (ev === "PASSWORD_RECOVERY") openAccount("reset");
      if (user && user.id !== was) cloudPull();
    });
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
      sounds: ["birds", "cafe"], keep: [], photos: [], example: true, secs: 42, words: 84,
      mix: { focus: 38, energy: 62, calm: 30, urgency: 74, clarity: 45, ideas: 81 },
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
  // ---------- effects ----------
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches, fine = matchMedia("(pointer: fine)").matches;
  function splitLead() {
    document.querySelectorAll(".hero .lead [data-t]").forEach((el, line) => {
      el.innerHTML = el.textContent.split(" ").map((w, i) => `<span class="wd" style="--i:${line * 3 + i}">${esc(w)}</span>`).join(" ");
    });
  }
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; e.target.classList.add("in"); io.unobserve(e.target);
    const n = e.target.querySelector("[data-n]"); if (n) countUp(n);
  }), { threshold: .25 }) : null;
  function watchReveal(root = document) { root.querySelectorAll(".reveal:not(.in)").forEach(el => (io && !calm ? io.observe(el) : el.classList.add("in"))); }
  function countUp(el) {
    const end = +el.dataset.n, suf = el.dataset.suf || "", t0 = performance.now(), dur = 1400;
    if (calm || end === 0) { el.textContent = end + suf; return; }
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(end * e) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function tilt(root = document) {
    if (!fine || calm) return;
    root.querySelectorAll(".tilt, .tile:not(.panel)").forEach(el => {
      el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg"); el.style.setProperty("--ry", (x * 8).toFixed(2) + "deg"); el.style.setProperty("--gx", (x + .5) * 100 + "%"); el.style.setProperty("--gy", (y + .5) * 100 + "%"); el.classList.add("tilting"); });
      el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); el.classList.remove("tilting"); });
    });
  }
  if (fine && !calm) {
    const g = $(".glow"); let tx = innerWidth / 2, ty = innerHeight / 3, x = tx, y = ty;
    addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; g.style.opacity = "1"; });
    (function loop() { x += (tx - x) * .08; y += (ty - y) * .08; g.style.transform = `translate(${x - 300}px,${y - 300}px)`; requestAnimationFrame(loop); })();
    const orb = $("#recBtn");
    orb.addEventListener("pointermove", e => { const r = orb.getBoundingClientRect(); orb.style.setProperty("--ox", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); orb.style.setProperty("--oy", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); orb.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 10}px,${((e.clientY - r.top) / r.height - .5) * 10}px)`; });
    orb.addEventListener("pointerleave", () => { orb.style.transform = ""; });
  }
  new MutationObserver(() => { if (!$("#board").hidden && !$("#board").dataset.fx) { $("#board").dataset.fx = 1; tilt($("#board")); } }).observe($("#board"), { childList: true });

  $("#acctBtn").onclick = () => openAccount();
  applyLang(); renderGarden(); show("home"); watchReveal(); tilt();
  if (!sessionStorage.getItem("tangent.v")) { sessionStorage.setItem("tangent.v", 1); ping("visit"); }
})();
