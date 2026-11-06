// Tangent · Burbujas. One voice note -> tasks floating in the sky above the person on the rock.
// Priority color only from the person's own words (or their answer to "¿Cuál te pesa más hoy?"). Never from tone.
(function () {
"use strict";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ---------- textos ---------- */
const T = {
 es: {beta: "beta", lead0: "Contame todo.<br>Yo lo ordeno.", lead1: "Tocá una burbuja.<br>Arrastrala donde quieras.",
  fine0: "1 audio gratis · sin cuenta", fine1: "Ya usaste tu audio gratis", type: "Prefiero escribir", example: "Ver un ejemplo",
  recEy: "Te escucho", recHint: "Hablá como te salga: pendientes, cosas que te pesan, lo que tengas en la cabeza.", stop: "Listo", cancel: "Cancelar",
  thinking: "Separando lo que dijiste…",
  askEy: "Antes de pintar", askH: "¿Cuál te pesa más hoy?", askSub: "En el audio no dijiste cuánto importan estas. Elegí vos: así no inventamos nada.", paint: "Pintar burbujas",
  alta: "Alta", media: "Media", baja: "Baja", none: "Sin prioridad",
  said: w => "Dijiste «" + w + "»", chose: "La elegiste vos", lState: "Estado", lPrio: "Prioridad",
  st: {planificacion: "Planifico", en_proceso: "En proceso", en_pausa: "En pausa", hecha: "Hecha"},
  sos: "No puedo arrancar · <small>10 segundos</small>", sosEy: "Solo esto", did: "Lo hice", easier: "Más fácil todavía", out: "Ahora no",
  started: "Listo. Ya arrancaste.", doneT: "Hecha. Una menos.", doneN: n => n + (n === 1 ? " hecha" : " hechas"),
  payEy: "Tu audio gratis ya está", payH: "Guardá todo lo que vas soltando", paySub: "Sin cuenta, Tangent se usa una vez. Con cuenta se guarda tu historial completo.", per: "por mes",
  payList: ["Audios ilimitados", "Historial de burbujas y audios", "Lo que fuiste terminando, día por día", "En celu y compu"], payGo: "Quiero mi cuenta", payNo: "Seguir con estas burbujas",
  payToast: "Anotado. Las cuentas llegan muy pronto.",
  whyEy: "Por qué así", whyH: "Cada decisión tiene un motivo",
  why: ["Vos sos la personita de la roca. Lo que tenés en la cabeza sale y queda flotando en el cielo, afuera de vos.", "Un solo botón. Nada que configurar antes de hablar.", "El color sale de tus palabras: rojo pesa, amarillo espera, azul tranqui. Si no lo dijiste, te preguntamos. Nunca se adivina por el tono de voz.", "Paisaje quieto y pocas cosas en pantalla: menos ruido para la vista. Letra Atkinson Hyperlegible, pensada para leerse fácil.", "Cuando no podés arrancar: una acción de 10 segundos. Nada más."],
  still: "Modo quieto (sin movimiento)", terms: "Términos", privacy: "Privacidad",
  typeT: "Escribilo como te salga", typeGo: "Ordenar", typeMore: "Escribí un poco más.", exampleToast: "Esto es un ejemplo. Tu audio gratis sigue intacto.",
  consentT: "Antes de empezar",
  consent: ["Tangent es un experimento. Puede equivocarse.", "Solo español e inglés. No compartas datos personales ni privados.", "Está prohibido hablar de sexo, violencia, guerra, política, aborto, muerte, racismo, drogas o usar malas palabras. La primera vez se corta la sesión; la segunda, este dispositivo queda bloqueado.", "Tu audio se procesa con servicios de IA externos y no se guarda."],
  consentAccept: "Acepto los <a href=\"/terms.html\" target=\"_blank\">Términos</a> y la <a href=\"/privacy.html\" target=\"_blank\">Privacidad</a>, y soy mayor de 18 o uso Tangent con un adulto.", agree: "Acepto y sigo", ok: "Entendido", close: "Cerrar",
  warnT: "Sesión expirada", warn: "Tangent no acepta ese tipo de contenido. Tu sesión se cerró. Si vuelve a pasar, este dispositivo queda bloqueado.",
  banT: "Acceso bloqueado", ban: "Este dispositivo ya no puede usar Tangent porque se repitió contenido no permitido.",
  supportT: "No estás solo", support: "Parece que estás pasando un momento muy difícil. Tangent no es el lugar para esto, pero hay personas que pueden escucharte ahora mismo, gratis:",
  helplines: [["Argentina", "135 (CABA y GBA) · 0800 345 1435"], ["España", "024"], ["Estados Unidos", "988"], ["Emergencias", "911 / 112"]],
  langT: "Solo español o inglés", lang: "Por ahora Tangent entiende solo español e inglés. Probá de nuevo en uno de esos idiomas.",
  limitT: "Por hoy es suficiente", limit: "Llegaste al máximo por hoy. Mañana podés seguir.",
  errT: "Algo no salió", err: "No pudimos ordenar tu audio. Probá de nuevo en un rato. Tu audio gratis no se gastó.",
  emptyT: "No te escuché", empty: "No llegó nada claro. Probá hablar un poco más cerca del micrófono.",
  noTasksT: "No encontré tareas", noTasks: "Te escuché, pero no apareció nada para hacer. Probá contar tus pendientes.",
  tooLongT: "Muy largo", tooLong: "La grabación es demasiado larga. Probá con menos de dos minutos.",
  micT: "Sin micrófono", mic: "No pudimos usar el micrófono. Revisá el permiso del navegador o escribilo.", tooShort: "Muy corto. Hablá al menos un par de segundos.",
  offline: "Sin conexión. Probá de nuevo en un rato.",
  acct: "Cuenta", aEy: "Tu cuenta", email: "Mail", pass: "Contraseña (mínimo 8)",
  signupH: "Creá tu cuenta", signupSub: "Así se guarda todo tu historial: audios, burbujas y lo que vas terminando.", signupGo: "Crear cuenta", toLogin: "Ya tengo cuenta",
  loginH: "Entrá a tu cuenta", loginSub: "Tus burbujas te esperan.", loginGo: "Entrar", toSignup: "Crear una cuenta", forgot: "Olvidé mi contraseña",
  forgotH: "Recuperá tu contraseña", forgotSub: "Te mandamos un mail con un link para crear una nueva.", forgotGo: "Mandarme el link", back: "Volver",
  newH: "Nueva contraseña", newSub: "Elegí una contraseña nueva para tu cuenta.", newGo: "Guardar",
  inH: "Tu cuenta", who: "Mail", planL: "Plan", planFree: "Gratis", planActive: "Activa · 1 USD/mes", planPast: "Pago pendiente", activate: "Activar por 1 USD/mes", signOut: "Cerrar sesión",
  checkMail: m => "Te mandamos un mail a " + m + ". Abrilo para verificar tu cuenta y después entrá.", resetSent: "Listo. Revisá tu mail.", passSaved: "Contraseña guardada.",
  welcome: "Entraste. Tus burbujas quedan guardadas.", bye: "Cerraste sesión.", paySoon: "El pago de 1 USD llega muy pronto. Te avisamos.",
  code: "Código del mail", verifyH: "Revisá tu mail", verifySub: m => "Te mandamos un código a " + m + ". Escribilo acá para verificar tu cuenta.", verifyGo: "Verificar",
  resetH: "Nueva contraseña", resetSub: m => "Te mandamos un código a " + m + ". Escribilo y elegí una contraseña nueva.", resend: "Reenviar código", resent: "Te mandamos otro código.",
  cancelSub: "Cancelar suscripción (botón de baja)", cancelQ: "¿Cancelás tu suscripción? Tu historial queda guardado.", cancelYes: "Sí, cancelar", canceled: "Suscripción cancelada.",
  payOk: "Pago recibido. Tu cuenta se activa en unos segundos.", payErr: "No pudimos abrir Mercado Pago. Probá de nuevo en un rato.", planCanceled: "Cancelada",
  idea: "Sugerencias", ideaT: "¿Qué le sumarías a Tangent?", ideaSub: "Leemos todo. Sin datos personales, por favor.", ideaGo: "Enviar", ideaOk: "Gracias. Llegó.",
  regret: "Botón de arrepentimiento", regretT: "Botón de arrepentimiento", regretSub: "Si contrataste la suscripción en los últimos 10 días corridos, podés revocarla sin costo ni motivo (Ley 24.240, art. 34). Dejanos tu mail y te confirmamos por ese medio.", regretGo: "Revocar mi contratación", regretOk: "Recibimos tu pedido. Te vamos a confirmar por mail.",
  eCode: "El código no es correcto o venció.", eRules: "Ese texto no cumple las normas de Tangent.",
  eBad: "Mail o contraseña incorrectos.", eExists: "Ese mail ya tiene cuenta. Entrá con tu contraseña.", eShort: "La contraseña necesita al menos 8 caracteres.", eMail: "Revisá el mail.", eConfirm: "Primero verificá tu mail con el link que te mandamos.", eGeneric: "No salió. Probá de nuevo en un rato."},
 en: {beta: "beta", lead0: "Tell me everything.<br>I’ll sort it out.", lead1: "Tap a bubble.<br>Drag it anywhere.",
  fine0: "1 free voice note · no account", fine1: "You used your free voice note", type: "I’d rather type", example: "See an example",
  recEy: "Listening", recHint: "Talk however it comes out: to-dos, things weighing on you, whatever is in your head.", stop: "Done", cancel: "Cancel",
  thinking: "Sorting what you said…",
  askEy: "Before painting", askH: "Which one weighs most today?", askSub: "You didn’t say how much these matter. You choose, so nothing gets made up.", paint: "Paint bubbles",
  alta: "High", media: "Medium", baja: "Low", none: "No priority",
  said: w => "You said “" + w + "”", chose: "You picked it", lState: "Status", lPrio: "Priority",
  st: {planificacion: "Planning", en_proceso: "In progress", en_pausa: "Paused", hecha: "Done"},
  sos: "I can’t start · <small>10 seconds</small>", sosEy: "Just this", did: "Did it", easier: "Even easier", out: "Not now",
  started: "There. You started.", doneT: "Done. One less.", doneN: n => n + " done",
  payEy: "Your free voice note is used", payH: "Keep everything you let out", paySub: "Without an account, Tangent works once. With one, your full history is saved.", per: "per month",
  payList: ["Unlimited voice notes", "Bubble and audio history", "What you finished, day by day", "On phone and computer"], payGo: "I want my account", payNo: "Keep these bubbles",
  payToast: "Noted. Accounts are coming very soon.",
  whyEy: "Why it looks like this", whyH: "Every choice has a reason",
  why: ["You are the little person on the rock. What’s in your head comes out and floats in the sky, outside of you.", "One button. Nothing to set up before you talk.", "Color comes from your words: red weighs, yellow waits, blue is easy. If you didn’t say it, we ask. Never guessed from your tone of voice.", "A still landscape and few things on screen: less noise for your eyes. Atkinson Hyperlegible type, made to be easy to read.", "When you can’t start: one 10-second action. That’s all."],
  still: "Still mode (no motion)", terms: "Terms", privacy: "Privacy",
  typeT: "Type it however it comes out", typeGo: "Sort it", typeMore: "Write a bit more.", exampleToast: "This is an example. Your free voice note is untouched.",
  consentT: "Before you start",
  consent: ["Tangent is an experiment. It can be wrong.", "English and Spanish only. Don’t share personal or private information.", "Talking about sex, violence, war, politics, abortion, death, racism, drugs, or using swear words is not allowed. The first time ends your session; the second time blocks this device.", "Your audio is processed by external AI services and is not stored."],
  consentAccept: "I accept the <a href=\"/terms.html\" target=\"_blank\">Terms</a> and <a href=\"/privacy.html\" target=\"_blank\">Privacy</a>, and I’m over 18 or using Tangent with an adult.", agree: "I agree", ok: "Got it", close: "Close",
  warnT: "Session expired", warn: "Tangent doesn’t accept that kind of content. Your session was closed. If it happens again, this device will be blocked.",
  banT: "Access blocked", ban: "This device can no longer use Tangent because content that isn’t allowed was repeated.",
  supportT: "You’re not alone", support: "It sounds like you’re going through something really hard. Tangent isn’t the place for this, but there are people who can listen right now, for free:",
  helplines: [["United States", "988"], ["Argentina", "135 (CABA & GBA) · 0800 345 1435"], ["Spain", "024"], ["Emergency", "911 / 112"]],
  langT: "English or Spanish only", lang: "For now Tangent only understands English and Spanish. Please try again in one of them.",
  limitT: "That’s enough for today", limit: "You reached today’s maximum. You can continue tomorrow.",
  errT: "Something went wrong", err: "We couldn’t sort your voice note. Please try again in a moment. Your free note wasn’t used.",
  emptyT: "I didn’t hear you", empty: "Nothing clear came through. Try speaking a little closer to the mic.",
  noTasksT: "No tasks found", noTasks: "I heard you, but nothing to do came up. Try telling me your to-dos.",
  tooLongT: "Too long", tooLong: "The recording is too long. Try under two minutes.",
  micT: "No microphone", mic: "We couldn’t use the microphone. Check the browser permission, or type it.", tooShort: "Too short. Talk for at least a couple of seconds.",
  offline: "No connection. Try again in a moment.",
  acct: "Account", aEy: "Your account", email: "Email", pass: "Password (8+ characters)",
  signupH: "Create your account", signupSub: "So your whole history is kept: voice notes, bubbles and what you finish.", signupGo: "Create account", toLogin: "I already have one",
  loginH: "Sign in", loginSub: "Your bubbles are waiting.", loginGo: "Sign in", toSignup: "Create an account", forgot: "Forgot my password",
  forgotH: "Reset your password", forgotSub: "We\u2019ll email you a link to set a new one.", forgotGo: "Send me the link", back: "Back",
  newH: "New password", newSub: "Choose a new password for your account.", newGo: "Save",
  inH: "Your account", who: "Email", planL: "Plan", planFree: "Free", planActive: "Active · 1 USD/month", planPast: "Payment pending", activate: "Activate for 1 USD/month", signOut: "Sign out",
  checkMail: m => "We sent an email to " + m + ". Open it to verify your account, then sign in.", resetSent: "Done. Check your email.", passSaved: "Password saved.",
  welcome: "You\u2019re in. Your bubbles are saved.", bye: "Signed out.", paySoon: "The 1 USD payment is coming very soon. We\u2019ll let you know.",
  code: "Code from the email", verifyH: "Check your email", verifySub: m => "We sent a code to " + m + ". Type it here to verify your account.", verifyGo: "Verify",
  resetH: "New password", resetSub: m => "We sent a code to " + m + ". Type it and choose a new password.", resend: "Resend code", resent: "We sent another code.",
  cancelSub: "Cancel subscription", cancelQ: "Cancel your subscription? Your history stays saved.", cancelYes: "Yes, cancel", canceled: "Subscription cancelled.",
  payOk: "Payment received. Your account turns on in a few seconds.", payErr: "We couldn\u2019t open Mercado Pago. Try again in a moment.", planCanceled: "Cancelled",
  idea: "Suggestions", ideaT: "What would you add to Tangent?", ideaSub: "We read everything. No personal data, please.", ideaGo: "Send", ideaOk: "Thanks. It arrived.",
  regret: "Cancellation right", regretT: "Right to cancel", regretSub: "If you subscribed in the last 10 calendar days, you can revoke it at no cost and without a reason (Argentine Law 24,240, art. 34). Leave your email and we\u2019ll confirm there.", regretGo: "Revoke my purchase", regretOk: "We got your request. We\u2019ll confirm by email.",
  eCode: "The code is wrong or expired.", eRules: "That text doesn\u2019t follow Tangent\u2019s rules.",
  eBad: "Wrong email or password.", eExists: "That email already has an account. Sign in instead.", eShort: "The password needs at least 8 characters.", eMail: "Check the email address.", eConfirm: "First verify your email with the link we sent.", eGeneric: "That didn\u2019t work. Try again in a moment."}
};

const ICON = {
 send: '<path d="M4 12l16-8-6 16-3-7z"/><path d="M11 13l9-9"/>',
 shirt: '<path d="M8 4L3 7l2 4 3-1v10h8V10l3 1 2-4-5-3c-.8 1.8-2.3 3-4 3S8.8 5.8 8 4z"/>',
 phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
 bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
 run: '<circle cx="15" cy="5" r="2"/><path d="M7 11l3-3h4l2 4 3 1M10 21l3-6-3-2M13 15l3 2v4"/>',
 cart: '<path d="M3 4h2l2.5 11h11L21 8H6.5"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
 home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
 mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>',
 doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
 heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
 car: '<path d="M4 16v-4l2-5h12l2 5v4z"/><circle cx="8" cy="16.5" r="1.6"/><circle cx="16" cy="16.5" r="1.6"/>',
 book: '<path d="M5 4h6a2 2 0 012 2v14a2 2 0 00-2-2H5zM19 4h-6"/><path d="M13 6a2 2 0 012-2h4v14h-4a2 2 0 00-2 2"/>',
 food: '<path d="M4 12h16a8 8 0 01-16 0zM12 4v4M8 6v2M16 6v2"/>',
 work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
 clean: '<path d="M14 3l-2 8M7 11h10l1 10H6z"/>',
 plant: '<path d="M12 21V11M12 11c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5z"/>',
 pet: '<circle cx="7" cy="9" r="1.6"/><circle cx="17" cy="9" r="1.6"/><circle cx="10" cy="5.5" r="1.6"/><circle cx="14" cy="5.5" r="1.6"/><path d="M12 12c-3 0-5 3-5 5a2 2 0 002 2h6a2 2 0 002-2c0-2-2-5-5-5z"/>',
 health: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>',
 other: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.5"/>'
};

const EXAMPLE = {
 es: [
  {id: "xa", title: "Presupuesto a Laura", summary: "Mandarle a Laura el presupuesto hoy, sin falta.", raw: "tengo que mandarle el presupuesto a Laura, eso es urgente, hoy sí o sí", icon: "send", priority: "alta", cue: "urgente", steps: ["Abrí el mail de Laura. Nada más.", "Escribí solo «Hola Laura»."]},
  {id: "xb", title: "Mover la ropa", summary: "Sacar la ropa del lavarropas antes de que tome olor.", raw: "y la ropa, che, está en el lavarropas desde ayer", icon: "shirt", priority: null, cue: null, steps: ["Caminá hasta el lavarropas.", "Parate. Nada más."]},
  {id: "xc", title: "Llamar al dentista", summary: "Pedir turno con el dentista, sin apuro.", raw: "ah, y llamar al dentista, cuando pueda", icon: "phone", priority: "baja", cue: "cuando pueda", steps: ["Buscá el número del dentista.", "Desbloqueá el teléfono."]},
  {id: "xd", title: "Pagar la luz", summary: "Pagar la factura de luz antes del viernes.", raw: "pagar la luz… vence el viernes creo", icon: "bolt", priority: null, cue: null, steps: ["Abrí la app del banco.", "Agarrá el teléfono."]},
  {id: "xe", title: "Volver a correr", summary: "Retomar el running: elegir un día para la primera salida.", raw: "y quiero arrancar a correr de nuevo", icon: "run", priority: null, cue: null, steps: ["Dejá las zapatillas al lado de la puerta.", "Mirá dónde están las zapatillas."]}
 ],
 en: [
  {id: "xa", title: "Quote for Laura", summary: "Send Laura the quote today, no matter what.", raw: "I have to send Laura the quote, that’s urgent, today for sure", icon: "send", priority: "alta", cue: "urgent", steps: ["Open Laura’s email. That’s all.", "Type only “Hi Laura”."]},
  {id: "xb", title: "Move the laundry", summary: "Take the clothes out of the washer before they smell.", raw: "and the laundry, it’s been in the washer since yesterday", icon: "shirt", priority: null, cue: null, steps: ["Walk to the washer.", "Stand up. That’s all."]},
  {id: "xc", title: "Call the dentist", summary: "Book a dentist appointment, no rush.", raw: "oh, and call the dentist, whenever I can", icon: "phone", priority: "baja", cue: "whenever I can", steps: ["Find the dentist’s number.", "Unlock your phone."]},
  {id: "xd", title: "Pay electricity", summary: "Pay the electricity bill before Friday.", raw: "pay the electricity… it’s due Friday I think", icon: "bolt", priority: null, cue: null, steps: ["Open your bank app.", "Pick up your phone."]},
  {id: "xe", title: "Start running again", summary: "Get back to running: pick a day for the first run.", raw: "and I want to start running again", icon: "run", priority: null, cue: null, steps: ["Put your sneakers by the door.", "Look where your sneakers are."]}
 ]
};

const SCENE = {day: "/assets/scenes/dia.jpg", night: "/assets/scenes/noche.jpg", nord: "/assets/scenes/nord.jpg"};
const PERSON = {day: [.25, .60], night: [.245, .62], nord: [.215, .61]}; // where the little person stands in each picture
const IMG_AR = 944 / 1680;
const MAX_SEC = 120;

/* ---------- estado ---------- */
let S = Object.assign({lang: null, mode: null, uses: 0, still: false, tasks: [], doneN: 0}, store.get("tangent.burbujas", {}));
if (!S.lang) S.lang = /^en/i.test(navigator.language || "") ? "en" : "es";
if (!S.mode) S.mode = matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day";
const save = () => store.set("tangent.burbujas", S);
const L = () => T[S.lang];
let deviceId = store.get("tangent.device", null);
if (!deviceId) { deviceId = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now(); store.set("tangent.device", deviceId); }
if (location.hash.startsWith("#owner=")) { store.set("tangent.owner", decodeURIComponent(location.hash.slice(7))); history.replaceState(null, "", location.pathname); }
const owner = store.get("tangent.owner", "");
const ping = type => fetch("/api/event", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({type})}).catch(() => {});

/* ---------- modo, idioma ---------- */
function setMode(m) {
  S.mode = m; const r = document.documentElement;
  r.classList.remove("m-day", "m-night", "m-nord"); r.classList.add("m-" + m);
  r.setAttribute("data-theme", m === "night" ? "dark" : "light");
  $$(".art").forEach(i => { if (i.dataset.m === m && !i.src) i.src = SCENE[m]; i.classList.toggle("on", i.dataset.m === m); });
  $$(".sw").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m));
  save();
}
function setStill(v) { S.still = v; document.documentElement.classList.toggle("still", v); $("#still").setAttribute("aria-pressed", v); save(); }
function texts() {
  const t = L(); document.documentElement.lang = S.lang;
  $("#lang").textContent = S.lang === "es" ? "EN" : "ES";
  $("[data-t=beta]").textContent = t.beta;
  const has = S.tasks.some(x => x.status !== "hecha");
  $("#lead").innerHTML = has ? t.lead1 : t.lead0;
  $("#fine").textContent = S.uses >= 1 && !owner && ACC.plan !== "active" ? t.fine1 : t.fine0;
  $("#acctBtn").textContent = ACC.user ? ACC.user.email.split("@")[0] : t.acct;
  $("#typeLink").textContent = t.type; $("#exampleLink").textContent = t.example;
  $("#exampleLink").hidden = has; $("#typeLink").hidden = usedFree();
  $("#recEy").textContent = t.recEy; $("#recHint").textContent = t.recHint; $("#stopBtn").textContent = t.stop; $("#cancelRec").textContent = t.cancel;
  $("#thinking").textContent = t.thinking;
  $("#askEy").textContent = t.askEy; $("#askH").textContent = t.askH; $("#askSub").textContent = t.askSub; $("#paintBtn").textContent = t.paint;
  $("#lState").textContent = t.lState; $("#lPrio").textContent = t.lPrio; $("#sosBtn").innerHTML = t.sos;
  $("#sosEy").textContent = t.sosEy; $("#didIt").textContent = t.did; $("#easier").textContent = t.easier; $("#sosOut").textContent = t.out;
  $("#payEy").textContent = t.payEy; $("#payH").textContent = t.payH; $("#paySub").textContent = t.paySub; $("#payPer").textContent = t.per;
  $("#payList").innerHTML = t.payList.map((x, i) => "<li><em>" + (i + 1) + "</em>" + esc(x) + "</li>").join("");
  $("#payGo").textContent = t.payGo; $("#payNo").textContent = t.payNo;
  $("#whyEy").textContent = t.whyEy; $("#whyH").textContent = t.whyH; $("#stillL").textContent = t.still;
  $("#whyList").innerHTML = t.why.map((x, i) => "<li><em>" + (i + 1) + "</em>" + esc(x) + "</li>").join("");
  $("#fTerms").textContent = t.terms; $("#fPriv").textContent = t.privacy; $("#fIdea").textContent = t.idea; $("#fRegret").textContent = t.regret;
  $("#done").textContent = S.doneN ? t.doneN(S.doneN) : ""; $("#done").classList.toggle("on", S.doneN > 0);
  B.forEach(paintEl);
}
let toastT;
function toast(msg) { const e = $("#toast"); e.textContent = msg; e.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove("on"), 2800); }

/* ---------- capas ---------- */
function open(id) { const l = $("#" + id); l.classList.add("on"); requestAnimationFrame(() => requestAnimationFrame(() => l.classList.add("show"))); }
function close(id) { const l = $("#" + id); l.classList.remove("show"); setTimeout(() => l.classList.remove("on"), 480); }
const isOpen = id => $("#" + id).classList.contains("on");
let msgResolve = null;
$$(".layer").forEach(l => {
  const d = l.querySelector(".dim");
  if (d && !["rec", "ask"].includes(l.id)) d.addEventListener("click", () => { close(l.id); if (l.id === "msg" && msgResolve) msgResolve(false); });
  l.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => { close(l.id); if (l.id === "msg" && msgResolve) msgResolve(false); }));
});
function modal(title, html, buttons = [{label: L().ok, value: true}]) {
  return new Promise(res => {
    msgResolve = v => { msgResolve = null; res(v); };
    $("#mTitle").textContent = title; $("#mBody").innerHTML = html; $("#mBtns").innerHTML = "";
    buttons.forEach(b => {
      const el = document.createElement("button"); el.className = "btn" + (b.ghost ? " ghost" : ""); el.textContent = b.label; if (b.disabled) el.disabled = true;
      el.onclick = () => { close("msg"); msgResolve && msgResolve(b.value); };
      $("#mBtns").append(el);
    });
    open("msg");
  });
}
const say = (k) => modal(L()[k + "T"], "<p>" + esc(L()[k]) + "</p>");
const helpHtml = () => "<p>" + esc(L().support) + "</p>" + L().helplines.map(([c, n]) => '<div class="help">' + esc(c) + "<br><b>" + esc(n) + "</b></div>").join("");
const banned = () => store.get("tangent.banned", false);
async function consent() {
  if (store.get("tangent.consent", 0)) return true;
  const t = L();
  const p = modal(t.consentT, '<ul class="cons">' + t.consent.map(x => "<li>" + esc(x) + "</li>").join("") + '</ul><label class="check"><input type="checkbox" id="cAgree"><span>' + t.consentAccept + "</span></label>",
    [{label: t.agree, value: true, disabled: true}]);
  $("#cAgree").onchange = () => { $("#mBtns button").disabled = !$("#cAgree").checked; };
  const ok = await p;
  if (ok) store.set("tangent.consent", 1);
  return ok;
}

/* ---------- geometría ---------- */
let W = innerWidth, H = innerHeight;
function zone() {
  if (W >= 860) return {x0: W * .40, x1: W * (W >= 1200 ? .92 : .96), y0: Math.max(90, H * .11), y1: H * .70};
  return {x0: 12, x1: W - 12, y0: Math.max(78, H * .10), y1: H * .56};
}
function imgToScreen(u, v) {
  const ar = W / H; let iw, ih, ox, oy;
  if (ar > IMG_AR) { iw = W; ih = W / IMG_AR; ox = 0; oy = (ih - H) * .62; } else { ih = H; iw = H * IMG_AR; oy = 0; ox = (iw - W) * .5; }
  return [u * iw - ox, v * ih - oy];
}
const SIZE = {alta: 1, media: .9, baja: .8, none: .86};
function baseD() {
  const z = zone(), n = Math.max(1, B.filter(b => !b.leaving).length);
  const fit = Math.sqrt(((z.x1 - z.x0) * (z.y1 - z.y0)) * .5 / n / Math.PI) * 2; // keep the sky about half full
  return Math.max(96, Math.min(168, fit, Math.min(z.x1 - z.x0, (z.y1 - z.y0) * 1.2) * .38));
}

/* ---------- burbujas ---------- */
let B = [];
const pc = p => (p ? "var(--" + p + ")" : "transparent");
function makeBubble(t, spawn) {
  const el = document.createElement("button"); el.className = "bub";
  el.innerHTML = '<div class="t"></div><div class="p"></div>';
  $("#stage").appendChild(el);
  const b = {t, el, x: 0, y: 0, vx: 0, vy: 0, ph: Math.random() * 6.28, drag: false, d: 120};
  if (spawn) { const [px, py] = imgToScreen(...PERSON[S.mode]); b.x = px; b.y = py - 30; b.vy = -2; el.style.opacity = 0; requestAnimationFrame(() => (el.style.opacity = "")); }
  else { b.x = t.hx * W; b.y = t.hy * H; }
  B.push(b); B.forEach(paintEl); bindDrag(b); return b;
}
function paintEl(b) {
  const t = b.t, l = L(), el = b.el;
  el.querySelector(".t").textContent = t.title;
  el.querySelector(".p").textContent = t.priority ? l[t.priority] : l.none;
  el.classList.toggle("unpainted", !t.priority);
  el.style.setProperty("--c", t.priority ? "color-mix(in srgb," + pc(t.priority) + " 58%,transparent)" : "transparent");
  el.style.setProperty("--c2", pc(t.priority));
  el.style.setProperty("--dot", t.priority ? pc(t.priority) : "var(--none)");
  ["planificacion", "en_proceso", "en_pausa", "hecha"].forEach(s => el.classList.toggle("st-" + s, t.status === s));
  b.d = baseD() * SIZE[t.priority || "none"]; el.style.setProperty("--d", b.d + "px");
  el.setAttribute("aria-label", t.title + " · " + (t.priority ? l[t.priority] : l.none));
}
function bindDrag(b) {
  let sx, sy, ox, oy;
  b.el.addEventListener("pointerdown", e => { b.el.setPointerCapture(e.pointerId); b.drag = true; sx = e.clientX; sy = e.clientY; ox = b.x - sx; oy = b.y - sy; b.moved = false; });
  b.el.addEventListener("pointermove", e => {
    if (!b.drag) return;
    if (Math.hypot(e.clientX - sx, e.clientY - sy) > 6) b.moved = true;
    if (b.moved) { const nx = e.clientX + ox, ny = e.clientY + oy; b.vx = (nx - b.x) * .5; b.vy = (ny - b.y) * .5; b.x = nx; b.y = ny; }
  });
  const up = () => { if (!b.drag) return; b.drag = false; if (!b.moved) return openDetail(b); b.t.hx = b.x / W; b.t.hy = b.y / H; save(); ACC.update(b.t); };
  b.el.addEventListener("pointerup", up); b.el.addEventListener("pointercancel", up);
  b.el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetail(b); } });
}
function layoutHomes(tasks) {
  const z = zone(), n = tasks.length, cols = W >= 860 ? (n > 4 ? 3 : 2) : 2, rows = Math.ceil(n / cols);
  tasks.forEach((t, i) => {
    const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols);
    const cx = z.x0 + (z.x1 - z.x0) * ((c + .5) / inRow), cy = z.y0 + (z.y1 - z.y0) * ((r + .5) / rows);
    t.hx = (cx + (Math.random() - .5) * 30 + (r % 2 ? 18 : -18)) / W; t.hy = (cy + (Math.random() - .5) * 24) / H;
  });
}
let last = performance.now(), clock = 0;
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
function tick(now) {
  const dt = Math.min(2, (now - last) / 16.67); last = now; clock += dt * .016;
  const still = S.still || reduce.matches, live = B.filter(b => !b.leaving);
  for (const b of live) {
    if (b.drag) continue;
    const dx = still ? 0 : Math.sin(clock * .5 + b.ph) * 7, dy = still ? 0 : Math.cos(clock * .37 + b.ph * 1.3) * 6;
    b.vx += ((b.t.hx * W + dx) - b.x) * .012 * dt; b.vy += ((b.t.hy * H + dy) - b.y) * .012 * dt;
  }
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
    const a = live[i], c = live[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || .01, min = (a.d + c.d) / 2 + 8;
    if (d < min) {
      const o = (min - d) / d * .5, ox = dx * o, oy = dy * o;
      if (!a.drag) { a.x -= ox * .5; a.y -= oy * .5; a.vx -= ox * .08; a.vy -= oy * .08; }
      if (!c.drag) { c.x += ox * .5; c.y += oy * .5; c.vx += ox * .08; c.vy += oy * .08; }
    }
  }
  for (const b of B) {
    if (b.leaving) { b.vy += .06 * dt; b.x += b.vx * dt; b.y += b.vy * dt; }
    else if (!b.drag) {
      b.vx *= Math.pow(.86, dt); b.vy *= Math.pow(.86, dt); b.x += b.vx * dt; b.y += b.vy * dt;
      const r = b.d / 2; b.x = Math.max(r + 4, Math.min(W - r - 4, b.x)); b.y = Math.max(70 + r, Math.min(H - r - 120, b.y));
    }
    b.el.style.transform = "translate3d(" + b.x.toFixed(1) + "px," + b.y.toFixed(1) + "px,0)";
  }
  requestAnimationFrame(tick);
}

/* ---------- grabar ---------- */
let rec = null;
$("#recBtn").addEventListener("click", () => (rec ? stopRecording() : startRecording()));
$("#stopBtn").addEventListener("click", () => stopRecording());
$("#cancelRec").addEventListener("click", () => cancelRecording());
const usedFree = () => S.uses >= 1 && !owner && ACC.plan !== "active";
async function startRecording() {
  if (banned()) return say("ban");
  if (usedFree()) return open("pay");
  if (!(await consent())) return;
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { await say("mic"); return openType(); }
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true}}); }
  catch { await say("mic"); return openType(); }
  const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC(), src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser();
  an.fftSize = 1024; src.connect(an);
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"], mime = types.find(m => MediaRecorder.isTypeSupported?.(m)) || "";
  const mr = new MediaRecorder(stream, mime ? {mimeType: mime} : undefined), chunks = [];
  mr.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec = {stream, ctx, an, mr, chunks, t0: performance.now(), raf: 0, lvl: 0};
  mr.start(250);
  $("#recBtn").classList.add("live");
  open("rec"); drawLive();
}
function drawLive() {
  const cv = $("#wave"), g = cv.getContext("2d"), data = new Uint8Array(rec.an.fftSize);
  const loop = () => {
    if (!rec) return;
    rec.an.getByteTimeDomainData(data);
    let sum = 0; for (const v of data) sum += ((v - 128) / 128) ** 2;
    rec.lvl += (Math.min(1, Math.sqrt(sum / data.length) * 5) - rec.lvl) * .25;
    const w = cv.clientWidth, h = cv.clientHeight, dpr = devicePixelRatio || 1;
    if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const k = performance.now() / 1000, col = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
    for (let n = 0; n < 3; n++) {
      g.beginPath(); g.globalAlpha = [.85, .35, .18][n]; g.strokeStyle = col; g.lineWidth = [1.6, 1.2, 1][n];
      for (let x = 0; x <= w; x += 3) {
        const env = Math.sin(Math.PI * x / w), a = (3 + rec.lvl * 26) * env;
        const y = h / 2 + Math.sin(x * .045 + k * (3 + n) + n * 2) * a * Math.sin(x * .011 + k);
        x ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    const sec = (performance.now() - rec.t0) / 1000;
    $("#clock").textContent = Math.floor(sec / 60) + ":" + String(Math.floor(sec % 60)).padStart(2, "0");
    if (sec >= MAX_SEC) return stopRecording();
    rec.raf = requestAnimationFrame(loop);
  };
  loop();
}
function endStream(r) { cancelAnimationFrame(r.raf); r.stream.getTracks().forEach(tr => tr.stop()); r.ctx.close().catch(() => {}); $("#recBtn").classList.remove("live"); }
async function stopRecording() {
  if (!rec) return;
  const r = rec; rec = null;
  const done = new Promise(res => { r.mr.onstop = res; });
  try { r.mr.stop(); } catch {}
  await done; endStream(r); close("rec");
  if ((performance.now() - r.t0) / 1000 < 1.5) return toast(L().tooShort);
  thinking(true);
  let wav;
  try { wav = await toWavBase64(new Blob(r.chunks, {type: r.mr.mimeType || "audio/webm"})); }
  catch { thinking(false); return say("err"); }
  send({audio: wav});
}
function cancelRecording() { if (!rec) return; const r = rec; rec = null; try { r.mr.stop(); } catch {} endStream(r); close("rec"); }
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
function thinking(on) { $("#thinking").classList.toggle("on", on); $("#recBtn").classList.toggle("busy", on); }

/* ---------- escribir ---------- */
$("#typeLink").addEventListener("click", openType);
async function openType() {
  if (banned()) return say("ban");
  if (usedFree()) return open("pay");
  if (!(await consent())) return;
  const t = L();
  const p = modal(t.typeT, '<textarea id="typed" maxlength="4000"></textarea>', [{label: t.typeGo, value: true}]);
  setTimeout(() => $("#typed")?.focus(), 400);
  const text = ($("#typed")?.value || "").trim(), ok = await p, val = ($("#typed")?.value || text).trim();
  if (!ok) return;
  if (val.length < 8) return toast(t.typeMore);
  thinking(true); send({text: val});
}

/* ---------- enviar ---------- */
async function send(payload) {
  let data;
  try {
    const res = await fetch("/api/tasks", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({deviceId, lang: S.lang, owner: owner || undefined, accessToken: ACC.token() || undefined, ...payload})});
    data = await res.json().catch(() => ({status: "ai_error"}));
  } catch { thinking(false); return toast(L().offline); }
  thinking(false);
  switch (data.status) {
    case "ok": S.uses = (S.uses || 0) + 1; save(); addTasks(data.tasks); return ACC.saveNew(S.tasks, data.transcript);
    case "paywall": S.uses = Math.max(1, S.uses || 0); save(); texts(); return open("pay");
    case "warning": return say("warn");
    case "banned": store.set("tangent.banned", true); return say("ban");
    case "support": return modal(L().supportT, helpHtml(), [{label: L().close, value: true}]);
    case "language": return say("lang");
    case "limit": return say("limit");
    case "empty": return say("empty");
    case "no_tasks": return say("noTasks");
    case "too_long": return say("tooLong");
    default: return say("err");
  }
}
function addTasks(list, example) {
  // a new voice note replaces what was there (one sky at a time)
  B.forEach(b => b.el.remove()); B = [];
  S.tasks = list.map(t => ({...t, status: "planificacion", source: t.priority ? "dicha" : null, example: !!example}));
  layoutHomes(S.tasks); save(); texts();
  S.tasks.forEach((t, i) => setTimeout(() => makeBubble(t, true), i * 420));
  setTimeout(() => { if (S.tasks.some(t => !t.priority)) openAsk(); }, S.tasks.length * 420 + 900);
}
$("#exampleLink").addEventListener("click", () => { toast(L().exampleToast); addTasks(EXAMPLE[S.lang], true); });

/* ---------- ¿cuál te pesa más hoy? ---------- */
const pend = {};
const prioButtons = cur => ["alta", "media", "baja"].map(p => '<button data-p="' + p + '" aria-pressed="' + (cur === p) + '"><i style="background:var(--' + p + ')"></i>' + L()[p] + "</button>").join("");
function openAsk() {
  const rows = S.tasks.filter(t => !t.priority && t.status !== "hecha");
  if (!rows.length) return;
  $("#askRows").innerHTML = rows.map(t => '<div class="arow" data-id="' + esc(t.id) + '"><div class="n">' + esc(t.title) + '</div><div class="prio">' + prioButtons(pend[t.id]) + "</div></div>").join("");
  const ready = () => { $("#paintBtn").disabled = !rows.every(t => pend[t.id]); };
  $$("#askRows .arow").forEach(r => r.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => {
    pend[r.dataset.id] = btn.dataset.p; r.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === btn)); ready();
  })));
  ready(); open("ask");
}
$("#paintBtn").addEventListener("click", () => {
  close("ask");
  S.tasks.filter(t => !t.priority).forEach((t, i) => setTimeout(() => {
    t.priority = pend[t.id]; t.source = "preguntada"; const b = B.find(x => x.t === t); if (b) paintEl(b); save(); ACC.update(t);
  }, 300 + i * 260));
});

/* ---------- burbuja abierta ---------- */
let cur = null;
function openDetail(b) {
  cur = b; const t = b.t, l = L();
  if (!t.priority) return openAsk();
  const tag = $("#dTag"); tag.style.setProperty("--dot", pc(t.priority)); tag.querySelector("span").textContent = l[t.priority];
  $("#dCue").textContent = t.source === "dicha" && t.cue ? l.said(t.cue) : l.chose;
  $("#dTitle").textContent = t.title; $("#dSum").textContent = t.summary; $("#dQuote").textContent = t.raw || "";
  $("#dQuote").parentElement.hidden = !t.raw;
  $("#dIc").innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + (ICON[t.icon] || ICON.other) + "</svg>";
  $("#det .anchor").style.setProperty("--dot", pc(t.priority));
  $("#dSeg").innerHTML = ["planificacion", "en_proceso", "en_pausa", "hecha"].map(s => '<button data-s="' + s + '" aria-pressed="' + (t.status === s) + '">' + l.st[s] + "</button>").join("");
  $$("#dSeg button").forEach(btn => btn.addEventListener("click", () => setStatus(b, btn.dataset.s)));
  $("#dPrio").innerHTML = prioButtons(t.priority);
  $$("#dPrio button").forEach(btn => btn.addEventListener("click", () => { t.priority = btn.dataset.p; t.source = "manual"; paintEl(b); save(); ACC.update(t); openDetail(b); }));
  $("#sosBtn").hidden = !(t.steps && t.steps.length);
  if (!isOpen("det")) open("det");
}
function setStatus(b, s) {
  b.t.status = s; paintEl(b); save(); ACC.update(b.t);
  if (s !== "hecha") return openDetail(b);
  close("det"); S.doneN++; save();
  setTimeout(() => {
    b.leaving = true; b.vy = .5; b.el.classList.add("gone"); toast(L().doneT);
    setTimeout(() => { b.el.remove(); B = B.filter(x => x !== b); B.forEach(paintEl); texts(); }, 1400);
  }, 420);
}

/* ---------- modo emergencia ---------- */
let sosT = null, stepI = 0;
$("#sosBtn").addEventListener("click", () => { close("det"); stepI = 0; showStep(); open("sos"); });
function showStep() {
  const steps = cur.t.steps || [];
  $("#step").textContent = steps[stepI] || steps[0] || ""; $("#easier").style.display = stepI === 0 && steps.length > 1 ? "" : "none";
  let left = 10; $("#secs").textContent = left;
  const arc = $("#arc"); arc.style.transition = "none"; arc.style.strokeDashoffset = 0;
  requestAnimationFrame(() => requestAnimationFrame(() => { arc.style.transition = "stroke-dashoffset 10s linear"; arc.style.strokeDashoffset = 339.3; }));
  clearInterval(sosT); sosT = setInterval(() => { left--; $("#secs").textContent = Math.max(0, left); if (left <= 0) clearInterval(sosT); }, 1000);
}
$("#easier").addEventListener("click", () => { stepI = 1; showStep(); });
$("#didIt").addEventListener("click", () => {
  clearInterval(sosT); close("sos");
  if (cur && (cur.t.status === "planificacion" || cur.t.status === "en_pausa")) { cur.t.status = "en_proceso"; paintEl(cur); save(); ACC.update(cur.t); }
  if (cur) ACC.emergency(cur.t, ($("#step").textContent || ""));
  toast(L().started);
});
$("#sosOut").addEventListener("click", () => { clearInterval(sosT); close("sos"); });

/* ---------- cuenta, por qué, ajustes ---------- */
$("#payGo").addEventListener("click", () => {
  if (!store.get("tangent.wantAccount", 0)) { store.set("tangent.wantAccount", 1); ping("signup"); }
  if (ACC.ready && !ACC.user) { close("pay"); return ACC.open("signup"); }
  toast(ACC.ready ? L().paySoon : L().payToast); close("pay");
});
$("#whyBtn").addEventListener("click", () => open("why"));
$("#still").addEventListener("click", () => setStill(!S.still));
$$(".sw").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
$("#lang").addEventListener("click", () => { S.lang = S.lang === "es" ? "en" : "es"; save(); texts(); if (isOpen("det") && cur) openDetail(cur); });
document.addEventListener("keydown", e => { if (e.key === "Escape") ["det", "pay", "why", "acct"].forEach(id => isOpen(id) && close(id)); });

/* ---------- cuenta (Supabase) ---------- */
// Loaded only when the site has Supabase settings. Bubbles of a signed-in person are saved with row level security:
// each person reads and writes only their own rows.
const ACC = {ready: false, sb: null, user: null, session: null, plan: "free", mode: "signup", loadedFor: null,
  token() { return this.session?.access_token || ""; },
  async init() {
    let cfg; try { cfg = (await (await fetch("/api/config")).json()).supabase; } catch {}
    if (!cfg) return;
    try { await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"); } catch { return; }
    if (!window.supabase?.createClient) return;
    this.sb = window.supabase.createClient(cfg.url, cfg.anon, {auth: {persistSession: true, autoRefreshToken: true, detectSessionInUrl: true}});
    this.ready = true; $("#acctBtn").hidden = false;
    this.sb.auth.onAuthStateChange((ev, session) => {
      if (ev === "PASSWORD_RECOVERY") { this.session = session; this.user = session?.user || null; return this.open("recovery"); }
      this.setSession(session, ev);
    });
  },
  async setSession(session, ev) {
    this.session = session || null; this.user = session?.user || null;
    if (!this.user) { this.plan = "free"; this.loadedFor = null; texts(); return; }
    if (this.loadedFor === this.user.id) return;
    this.loadedFor = this.user.id;
    try { const {data} = await this.sb.from("subscriptions").select("status").eq("user_id", this.user.id).maybeSingle(); this.plan = data?.status || "free"; } catch {}
    // keep what was made before signing in (the free voice note), then show everything saved
    const local = S.tasks.filter(t => !t.dbId && !t.example && t.status !== "hecha");
    if (local.length) await this.saveNew(local, "");
    await this.load();
    texts();
    if (ev === "SIGNED_IN" && isOpen("acct")) { close("acct"); toast(L().welcome); }
  },
  async load() {
    if (!this.user) return;
    const {data, error} = await this.sb.from("bubbles").select("*").neq("status", "hecha").order("created_at", {ascending: true}).limit(12);
    if (error || !data) return;
    B.forEach(b => b.el.remove()); B = [];
    S.tasks = data.map(r => ({id: "db" + r.id, dbId: r.id, title: r.title, summary: r.summary, raw: r.raw_quote, icon: r.icon || "other", priority: r.priority, cue: r.priority_cue, source: r.priority_source, status: r.status, steps: r.emergency_steps || [], hx: r.pos_x, hy: r.pos_y}));
    const free = S.tasks.filter(t => t.hx == null || t.hy == null);
    if (free.length) layoutHomes(S.tasks);
    save(); S.tasks.forEach(t => makeBubble(t, false));
    if (S.tasks.some(t => !t.priority)) setTimeout(openAsk, 600);
  },
  async saveNew(tasks, transcript) {
    if (!this.user || !tasks.length) return;
    try {
      const {data: rec} = await this.sb.from("recordings").insert({user_id: this.user.id, transcript: transcript || null, lang: S.lang, priority_found: tasks.every(t => t.priority)}).select("id").single();
      const rows = tasks.map(t => ({user_id: this.user.id, recording_id: rec?.id || null, title: String(t.title).slice(0, 40), summary: t.summary || t.title, raw_quote: t.raw || null, icon: t.icon || null,
        priority: t.priority || null, priority_source: t.priority ? (t.source || "dicha") : null, priority_cue: t.cue || null, status: t.priority ? t.status : "planificacion", emergency_steps: t.steps || [], pos_x: t.hx ?? null, pos_y: t.hy ?? null}));
      const {data} = await this.sb.from("bubbles").insert(rows).select("id");
      (data || []).forEach((r, i) => { tasks[i].dbId = r.id; });
      save();
    } catch {}
  },
  update(t) {
    if (!this.user || !t.dbId) return;
    clearTimeout(t._sync);
    t._sync = setTimeout(() => {
      this.sb.from("bubbles").update({priority: t.priority || null, priority_source: t.priority ? (t.source || "manual") : null, status: t.priority ? t.status : "planificacion", pos_x: t.hx ?? null, pos_y: t.hy ?? null}).eq("id", t.dbId).then(() => {}, () => {});
    }, 400);
  },
  emergency(t, step) {
    if (!this.user || !t.dbId) return;
    this.sb.from("emergency_runs").insert({bubble_id: t.dbId, user_id: this.user.id, step_text: step.slice(0, 200), completed: true}).then(() => {}, () => {});
  },
  open(mode) {
    this.mode = this.user && mode !== "recovery" ? "in" : (mode || "signup");
    this.paint(); open("acct");
  },
  paint() {
    const t = L(), m = this.mode, inside = m === "in", em = this.email || $("#aEmail").value.trim();
    $("#aEy").textContent = t.aEy;
    $("#aH").textContent = {signup: t.signupH, login: t.loginH, forgot: t.forgotH, verify: t.verifyH, reset: t.resetH, recovery: t.newH, in: t.inH}[m];
    $("#aSub").textContent = {signup: t.signupSub, login: t.loginSub, forgot: t.forgotSub, verify: t.verifySub(em), reset: t.resetSub(em), recovery: t.newSub, in: ""}[m];
    $("#aForm").hidden = inside; $("#aLinks").hidden = inside || m === "recovery"; $("#aIn").hidden = !inside;
    $("#aEmailL").textContent = t.email; $("#aPassL").textContent = t.pass; $("#aCodeL").textContent = t.code;
    $("#aEmail").closest("label").hidden = ["recovery", "verify", "reset"].includes(m);
    $("#aCodeW").hidden = !["verify", "reset"].includes(m);
    $("#aPassW").hidden = ["forgot", "verify"].includes(m);
    $("#aPass").autocomplete = m === "login" ? "current-password" : "new-password";
    $("#aGo").textContent = {signup: t.signupGo, login: t.loginGo, forgot: t.forgotGo, verify: t.verifyGo, reset: t.newGo, recovery: t.newGo}[m] || "";
    $("#aSwitch").textContent = m === "signup" ? t.toLogin : m === "login" ? t.toSignup : t.back;
    $("#aForgot").textContent = t.forgot; $("#aForgot").hidden = m !== "login";
    $("#aResend").textContent = t.resend; $("#aResend").hidden = !["verify", "reset"].includes(m);
    $("#aErr").textContent = "";
    if (inside) {
      $("#aWhoL").textContent = t.who; $("#aWho").textContent = this.user?.email || "";
      $("#aPlanL").textContent = t.planL;
      $("#aPlan").textContent = this.plan === "active" ? t.planActive : this.plan === "past_due" ? t.planPast : this.plan === "canceled" ? t.planCanceled : t.planFree;
      $("#aActivate").textContent = t.activate; $("#aActivate").hidden = this.plan === "active";
      $("#aOut").textContent = t.signOut; $("#aCancel").textContent = t.cancelSub; $("#aCancel").hidden = !["active", "past_due"].includes(this.plan);
    }
  },
  err(e) {
    const t = L(), msg = String(e?.message || e || "");
    $("#aErr").textContent = /invalid login/i.test(msg) ? t.eBad : /already (registered|exists)/i.test(msg) ? t.eExists : /password/i.test(msg) && /(6|8|short|least)/i.test(msg) ? t.eShort
      : /not confirmed/i.test(msg) ? t.eConfirm : /(token|otp|code).*(invalid|expired)|(invalid|expired).*(token|otp|code)/i.test(msg) ? t.eCode : /email/i.test(msg) && /invalid/i.test(msg) ? t.eMail : t.eGeneric;
  },
  async verify(type) {
    const token = $("#aCode").value.replace(/\D/g, "");
    if (token.length < 6) throw new Error("invalid code");
    let r = await this.sb.auth.verifyOtp({email: this.email, token, type});
    if (r.error && type === "signup") r = await this.sb.auth.verifyOtp({email: this.email, token, type: "email"});
    if (r.error) throw r.error;
    return r.data;
  },
  async submit() {
    const t = L(), m = this.mode, pass = $("#aPass").value;
    if (["signup", "login", "forgot"].includes(m)) {
      this.email = $("#aEmail").value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email)) return ($("#aErr").textContent = t.eMail);
    }
    if (["signup", "reset", "recovery"].includes(m) && pass.length < 8) return ($("#aErr").textContent = t.eShort);
    $("#aGo").disabled = true;
    try {
      if (m === "signup") {
        const {data, error} = await this.sb.auth.signUp({email: this.email, password: pass, options: {emailRedirectTo: location.origin, data: {locale: S.lang}}});
        if (error) throw error;
        if (data?.user && Array.isArray(data.user.identities) && !data.user.identities.length) throw new Error("already registered");
        if (!data.session) { this.mode = "verify"; $("#aCode").value = ""; this.paint(); }
      } else if (m === "verify") {
        await this.verify("signup");
      } else if (m === "login") {
        const {error} = await this.sb.auth.signInWithPassword({email: this.email, password: pass}); if (error) throw error;
      } else if (m === "forgot") {
        const {error} = await this.sb.auth.resetPasswordForEmail(this.email, {redirectTo: location.origin}); if (error) throw error;
        this.mode = "reset"; $("#aCode").value = ""; $("#aPass").value = ""; this.paint();
      } else if (m === "reset") {
        await this.verify("recovery");
        const {error} = await this.sb.auth.updateUser({password: pass}); if (error) throw error;
        toast(t.passSaved); close("acct");
      } else if (m === "recovery") {
        const {error} = await this.sb.auth.updateUser({password: pass}); if (error) throw error;
        toast(t.passSaved); close("acct"); this.loadedFor = null; this.setSession((await this.sb.auth.getSession()).data.session, "SIGNED_IN");
      }
    } catch (e) { this.err(e); }
    finally { $("#aGo").disabled = false; }
  },
  async resend() {
    try {
      const r = this.mode === "verify" ? await this.sb.auth.resend({type: "signup", email: this.email}) : await this.sb.auth.resetPasswordForEmail(this.email, {redirectTo: location.origin});
      if (r?.error) throw r.error; toast(L().resent);
    } catch (e) { this.err(e); }
  },
  async refreshPlan() {
    if (!this.user) return;
    try { const {data} = await this.sb.from("subscriptions").select("status").eq("user_id", this.user.id).maybeSingle(); this.plan = data?.status || "free"; } catch {}
    texts(); if (isOpen("acct")) this.paint();
  },
  async pay() {
    if (!this.user) return this.open("signup");
    try {
      const r = await (await fetch("/api/pay/create", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({accessToken: this.token()})})).json();
      if (r.status === "ok" && r.url) { location.href = r.url; return; }
      toast(r.status === "not_ready" ? L().paySoon : L().payErr);
    } catch { toast(L().payErr); }
  },
  async cancel() {
    const t = L();
    if (!(await modal(t.cancelSub, "<p>" + esc(t.cancelQ) + "</p>", [{label: t.cancelYes, value: true}, {label: t.back, value: false, ghost: true}]))) return;
    try {
      const r = await (await fetch("/api/pay/cancel", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({accessToken: this.token()})})).json();
      if (r.status !== "ok") throw 0;
      toast(t.canceled); this.refreshPlan();
    } catch { toast(t.eGeneric); }
  }
};
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); }); }
$("#acctBtn").addEventListener("click", () => ACC.open(ACC.user ? "in" : "login"));
$("#aForm").addEventListener("submit", e => { e.preventDefault(); ACC.submit(); });
$("#aSwitch").addEventListener("click", () => { ACC.mode = ACC.mode === "signup" ? "login" : ACC.mode === "login" ? "signup" : "login"; ACC.paint(); });
$("#aForgot").addEventListener("click", () => { ACC.mode = "forgot"; ACC.paint(); });
$("#aOut").addEventListener("click", async () => {
  await ACC.sb?.auth.signOut();
  B.forEach(b => b.el.remove()); B = []; S.tasks = []; save(); close("acct"); texts(); toast(L().bye);
});
$("#aActivate").addEventListener("click", () => { if (!store.get("tangent.wantPay", 0)) { store.set("tangent.wantPay", 1); ping("signup"); } ACC.pay(); });
$("#aCancel").addEventListener("click", () => ACC.cancel());
$("#aResend").addEventListener("click", () => ACC.resend());

/* ---------- sugerencias y arrepentimiento ---------- */
async function feedback(kind) {
  const t = L(), regret = kind === "regret";
  close("why");
  const p = modal(regret ? t.regretT : t.ideaT, "<p class=\"sub\">" + esc(regret ? t.regretSub : t.ideaSub) + "</p>" +
    (regret ? '<div class="aform"><label>' + esc(t.email) + '<input type="email" id="fbEmail" autocomplete="email" value="' + esc(ACC.user?.email || "") + '"></label></div>' : "") +
    '<textarea id="fbText" maxlength="1500"></textarea>', [{label: regret ? t.regretGo : t.ideaGo, value: true}]);
  const ok = await p; if (!ok) return;
  const text = ($("#fbText")?.value || "").trim(), email = ($("#fbEmail")?.value || "").trim();
  try {
    const r = await (await fetch("/api/suggest", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({deviceId, kind, text, email, lang: S.lang})})).json();
    if (r.status === "ok") {
      toast(regret ? t.regretOk : t.ideaOk);
      if (regret && ACC.user && ["active", "past_due"].includes(ACC.plan)) fetch("/api/pay/cancel", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({accessToken: ACC.token()})}).then(() => ACC.refreshPlan(), () => {});
    } else toast(r.status === "rules" ? t.eRules : r.status === "email" ? t.eMail : t.eGeneric);
  } catch { toast(t.offline); }
}
$("#fIdea").addEventListener("click", () => feedback("idea"));
$("#fRegret").addEventListener("click", () => feedback("regret"));

/* ---------- inicio ---------- */
setMode(S.mode); setStill(!!S.still);
S.tasks.filter(t => t.status !== "hecha").forEach(t => makeBubble(t, false));
texts();
if (S.tasks.some(t => !t.priority && t.status !== "hecha")) setTimeout(openAsk, 700);
addEventListener("resize", () => { W = innerWidth; H = innerHeight; B.forEach(paintEl); });
// load the other two scenes once the first one is in
$(".art.on")?.addEventListener("load", () => $$(".art").forEach(i => { if (!i.src) i.src = SCENE[i.dataset.m]; }), {once: true});
ping("visit");
const payBack = new URLSearchParams(location.search).get("pago");
if (payBack) history.replaceState(null, "", location.pathname);
ACC.init().then(() => { if (payBack === "ok") { toast(L().payOk); [4000, 10000, 20000].forEach(ms => setTimeout(() => ACC.refreshPlan(), ms)); } });
requestAnimationFrame(tick);
})();
