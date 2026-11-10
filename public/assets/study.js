"use strict";
// Tangent Study v1: everything lives in this browser (localStorage) until accounts arrive.
// Audio is cut into ~60 s pieces, sent for transcription and never stored.
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const K = { lang: "tangent.study.lang", folder: "tangent.study.folder", board: "tangent.study.board", agenda: "tangent.study.agenda", scale: "tangent.study.scale",
  profile: "tangent.study.profile", cookies: "tangent.study.cookies", code: "tangent.access", source: "tangent.study.source", test: "tangent.study.test" };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Math.random().toString(36).slice(2, 10);
const pad = n => String(n).padStart(2, "0");
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
let L = LS.get(K.lang, "es") === "en" ? "en" : "es";

let deviceId = LS.get("tangent.device", null);
if (!deviceId || !/^[a-zA-Z0-9-]{8,64}$/.test(deviceId)) { deviceId = crypto.randomUUID ? crypto.randomUUID() : uid() + uid() + uid(); LS.set("tangent.device", deviceId); }

/* ---------------- texts ES / EN ---------------- */
const S = {
  home: ["Inicio", "Home"], study: ["Study", "Study"], folder: ["Carpeta", "Folder"], board: ["Tablero", "Board"], agenda: ["Agenda", "Planner"],
  progress: ["Cómo me fue", "How it went"], test: ["Tu cabeza", "Your brain"], kit: ["Kit de papel", "Paper kit"], ideas: ["Ideas", "Ideas"],
  account: ["Cuenta", "Account"], terms: ["Tus datos", "Your data"],
  heroT: ["Decí un tema en voz alta. Te lo explico fácil.", "Say a topic out loud. I'll explain it simply."],
  heroP: ["Citás tu libro, hablás hasta 10 minutos y te queda un resumen en español y en inglés, con imágenes, para imprimir.", "Cite your book, talk for up to 10 minutes and get a summary in Spanish and English, with pictures, ready to print."],
  start: ["Empezar un tema", "Start a topic"],
  tStudy: ["Hablá, sacale foto a la hoja o escribí.", "Talk, snap the sheet or type."], tFolder: ["Tus resúmenes. Bajalos en PDF.", "Your summaries. Download as PDF."],
  tBoard: ["Columnas y tareas, como en un corcho.", "Columns and tasks, like a corkboard."], tAgenda: ["Pruebas, entregas y avisos.", "Tests, deadlines and reminders."],
  tProgress: ["Una nota del 1 al 5 por día.", "A 1 to 5 score per day."], tTest: ["Mini test (no es diagnóstico) y fortalezas.", "Mini test (not a diagnosis) and strengths."],
  tKit: ["Hojas para imprimir y usar sin pantalla.", "Sheets to print and use with no screen."], tIdeas: ["Proponé mejoras para Tangent.", "Suggest improvements for Tangent."],
  tAccount: ["Plan, código de escuela y perfil.", "Plan, school code and profile."], tTerms: ["Qué hacemos con tus datos.", "What we do with your data."],
  codeOn: ["Código activo: usás Tangent sin límite de prueba.", "Code active: you use Tangent without the trial limit."],
  codeOff: ["Sin cuenta podés probar Study una vez. ¿Tenés un código de tu escuela?", "Without an account you can try Study once. Do you have a school code?"],
  // study
  s1: ["¿De dónde estudiás?", "Where are you studying from?"],
  s1p: ["Primero escribí tu fuente. Es obligatorio: Tangent explica lo que vos decís, no inventa. La responsabilidad de la fuente es tuya.", "First write your source. It's required: Tangent explains what you say, it doesn't make things up. The source is your responsibility."],
  srcTitle: ["Libro, manual o apunte (obligatorio)", "Book, textbook or notes (required)"], srcAuthor: ["Autor o editorial (si lo sabés)", "Author or publisher (if you know it)"],
  srcPage: ["Páginas o capítulo", "Pages or chapter"], topic: ["Tema", "Topic"], topicPh: ["Ej.: La célula", "E.g. The cell"],
  howLong: ["¿Cuánto vas a hablar como máximo?", "How long will you talk at most?"], min: ["min", "min"], next: ["Seguir", "Next"], back: ["Volver", "Back"],
  needSource: ["Escribí el nombre de tu fuente para seguir.", "Write your source's name to continue."],
  s2: ["Contalo como te salga", "Say it however it comes out"],
  s2p: ["Leé en voz alta o explicalo con tus palabras. Podés trabarte, repetir o ir y volver: no pasa nada.", "Read aloud or explain it in your own words. Stumbling, repeating or going back and forth is fine."],
  tapRec: ["Tocá para grabar", "Tap to record"], tapStop: ["Terminar", "Finish"], recording: ["Grabando…", "Recording…"],
  pieces: ["partes pasadas a texto", "pieces turned into text"], working: ["Pasando a texto…", "Turning into text…"],
  orPhoto: ["O sacale una foto a la hoja", "Or snap a photo of the sheet"], orType: ["O escribilo", "Or type it"],
  photoOk: ["Foto lista. Se usa solo para este resumen.", "Photo ready. It's only used for this summary."], removePhoto: ["Quitar foto", "Remove photo"],
  s3: ["¿Está bien lo que dijiste?", "Is this what you said?"], s3p: ["Podés corregir el texto antes de armar el resumen. El audio ya se borró.", "You can fix the text before making the summary. The audio is already gone."],
  make: ["Armar mi resumen", "Make my summary"], making: ["Armando tu resumen…", "Making your summary…"],
  needText: ["Grabá, escribí o sacá una foto primero.", "Record, type or take a photo first."],
  basedOn: ["Basado en la fuente que citaste", "Based on the source you cited"],
  notMagic: ["Tangent resume lo que dijiste. No reemplaza tu libro: revisalo con tu fuente.", "Tangent summarises what you said. It doesn't replace your book: check it against your source."],
  plain: ["Explicado fácil", "Explained simply"], keyIdeas: ["Ideas clave", "Key ideas"], images: ["Para acordarte", "To remember it"],
  checkYou: ["Probate", "Test yourself"], review: ["Revisá en tu fuente", "Check in your source"],
  listen: ["Escuchar", "Listen"], stop: ["Parar", "Stop"], printThis: ["Imprimir / PDF", "Print / PDF"], toFolder: ["Ver carpeta", "Open folder"], newTopic: ["Nuevo tema", "New topic"],
  saved: ["Guardado en tu carpeta.", "Saved in your folder."],
  noMic: ["Este navegador no puede grabar. Probá con Chrome o Safari, o escribilo.", "This browser can't record. Try Chrome or Safari, or type it."],
  micDenied: ["Necesito permiso para el micrófono. Activalo en el candado de la barra de direcciones.", "I need microphone permission. Turn it on from the lock in the address bar."],
  errAI: ["No pude armarlo ahora. Probá de nuevo en un minuto.", "I couldn't make it right now. Try again in a minute."],
  errChunk: ["Una parte del audio no se pudo pasar a texto. Revisá el texto o seguí.", "One piece of audio couldn't be turned into text. Check the text or go on."],
  blocked: ["Ese contenido no va en Tangent Study. Probá con otro tema de estudio.", "That content isn't for Tangent Study. Try another study topic."],
  langOnly: ["Por ahora Tangent entiende español e inglés.", "For now Tangent understands Spanish and English."],
  paywall: ["Ya usaste tu prueba gratis. Para seguir, usá un código de tu escuela o el plan personal.", "You've used your free try. To keep going, use a school code or the personal plan."],
  seePlans: ["Ver opciones", "See options"],
  support: ["Parece que estás pasando un momento difícil. No estás solo/a. Hablá ahora con un adulto de confianza. En Argentina podés llamar gratis al 135 (CABA y GBA) o al (011) 5275-1135 desde todo el país, las 24 horas. Si hay peligro inmediato, llamá al 911.", "It sounds like you're going through something hard. You're not alone. Talk to a trusted adult now. If you're in danger, call your local emergency number. In the US you can call or text 988."],
  why: ["Por qué funciona", "Why it works"],
  whyP: ["Decir algo en voz alta ayuda a recordarlo (efecto de producción). Probarte con preguntas y repasar en días distintos son de las técnicas con más evidencia.", "Saying something out loud helps you remember it (production effect). Quizzing yourself and reviewing on different days are among the best-supported techniques."],
  // folder
  folderP: ["Cada tema que armás queda acá. Elegí cuáles y el tamaño de hoja, y guardalo como PDF.", "Every topic you make lands here. Pick which ones and the paper size, then save as PDF."],
  empty: ["Todavía no hay nada acá.", "Nothing here yet."], paper: ["Tamaño de hoja", "Paper size"], printLang: ["Idioma del PDF", "PDF language"],
  both: ["Los dos", "Both"], withText: ["Incluir lo que dije (texto)", "Include what I said (text)"],
  download: ["Descargar PDF", "Download PDF"], pdfHint: ["Se abre la ventana de imprimir: elegí «Guardar como PDF».", "The print window opens: choose “Save as PDF”."],
  pickOne: ["Elegí al menos un tema.", "Pick at least one topic."], del: ["Borrar", "Delete"], sure: ["¿Seguro que lo borrás?", "Delete it for sure?"], open: ["Abrir", "Open"],
  notes: ["Mis notas", "My notes"],
  // board
  boardP: ["Tus columnas y tareas. Arrastrá con ⠿ o usá las flechas. Doble toque para editar.", "Your columns and tasks. Drag with ⠿ or use the arrows. Double-tap to edit."],
  addCol: ["+ Columna", "+ Column"], newTask: ["Nueva tarea", "New task"], colName: ["Nombre de la columna", "Column name"],
  task: ["Tarea", "Task"], date: ["Fecha", "Date"], color: ["Color", "Colour"], save: ["Guardar", "Save"], cancel: ["Cancelar", "Cancel"],
  syncNote: ["Se guarda en este dispositivo. Cuando actives tu cuenta se sincroniza entre celular y computadora.", "Saved on this device. Once your account is active it syncs between phone and computer."],
  cols: [["Por hacer", "En progreso", "Pausadas", "Ideas", "Hechas"], ["To do", "Doing", "Paused", "Ideas", "Done"]],
  // agenda
  agendaP: ["Anotá pruebas y entregas. Si querés, pasalas a Google Calendar o a tu calendario para que te avise.", "Add tests and deadlines. If you want, send them to Google Calendar or your calendar so it reminds you."],
  what: ["Qué", "What"], when: ["Día", "Day"], hour: ["Hora", "Time"], remind: ["Aviso", "Reminder"], none: ["Sin aviso", "No reminder"],
  before10: ["10 min antes", "10 min before"], before60: ["1 hora antes", "1 hour before"], before1d: ["1 día antes", "1 day before"],
  add: ["Agregar", "Add"], gcal: ["Google Calendar", "Google Calendar"], ics: ["Otro calendario (.ics)", "Other calendar (.ics)"],
  notif: ["Avisarme en este dispositivo", "Remind me on this device"], notifOn: ["Avisos activados mientras Tangent esté abierto.", "Reminders on while Tangent is open."],
  printWeek: ["Imprimir semana", "Print week"], upcoming: ["Lo que viene", "Coming up"], past: ["Ya pasó", "Past"],
  // progress
  progressP: ["Una vez por día: ¿cómo te fue estudiando? Sin culpa, solo para ver cómo vas.", "Once a day: how did studying go? No guilt, just to see how you're doing."],
  today: ["Hoy", "Today"], scaleL: [["Muy difícil", "Difícil", "Más o menos", "Bien", "Muy bien"], ["Very hard", "Hard", "So-so", "Good", "Great"]],
  note: ["Una nota (opcional)", "A note (optional)"], last14: ["Últimos 14 días", "Last 14 days"], daysLogged: ["días anotados", "days logged"], print14: ["Imprimir hoja de 14 días", "Print 14-day sheet"],
  // test
  testP: ["6 preguntas rápidas sobre los últimos 6 meses. Esto NO es un diagnóstico ni un test oficial: solo te ayuda a pensar si vale la pena consultar.", "6 quick questions about the last 6 months. This is NOT a diagnosis or an official test: it only helps you think about whether it's worth asking a professional."],
  testQ: [[
    "¿Con qué frecuencia te cuesta terminar los últimos detalles de algo, cuando lo difícil ya está hecho?",
    "¿Con qué frecuencia te cuesta ordenar las cosas cuando una tarea necesita organización?",
    "¿Con qué frecuencia te olvidás de citas o de cosas que tenías que hacer?",
    "Cuando algo te exige pensar mucho, ¿con qué frecuencia lo evitás o lo dejás para después?",
    "¿Con qué frecuencia movés manos o pies, o te cuesta quedarte quieto/a, cuando tenés que estar sentado/a mucho rato?",
    "¿Con qué frecuencia te sentís demasiado activo/a, como si te empujara un motor?",
  ], [
    "How often do you have trouble wrapping up the final details of something, once the hard parts are done?",
    "How often do you have trouble getting things in order when a task needs organisation?",
    "How often do you forget appointments or things you had to do?",
    "When something needs a lot of thinking, how often do you avoid it or put it off?",
    "How often do you fidget with your hands or feet, or find it hard to stay still, when you have to sit for a long time?",
    "How often do you feel overly active, as if driven by a motor?",
  ]],
  freq: [["Nunca", "Rara vez", "A veces", "Seguido", "Muy seguido"], ["Never", "Rarely", "Sometimes", "Often", "Very often"]],
  seeResult: ["Ver resultado", "See result"], answerAll: ["Respondé las 6 preguntas.", "Answer all 6 questions."],
  resHigh: ["Tus respuestas se parecen a las de muchas personas con TDAH. Esto no es un diagnóstico. Si te interesa saber más, hablá con un médico, psiquiatra o psicólogo.", "Your answers look like those of many people with ADHD. This is not a diagnosis. If you want to know more, talk to a doctor, psychiatrist or psychologist."],
  resLow: ["Tus respuestas no se parecen tanto a las típicas del TDAH. Igual, si sentís que estudiar te cuesta mucho, consultá con un profesional.", "Your answers don't look that much like typical ADHD answers. Still, if studying feels very hard, talk to a professional."],
  minorNote: ["Si sos menor de 18, hacelo con un adulto. Estas preguntas vienen de una escala pensada para adultos.", "If you're under 18, do it with an adult. These questions come from a scale designed for adults."],
  basedAsrs: ["Preguntas adaptadas de la parte A de la escala ASRS v1.1 (Organización Mundial de la Salud y Universidad de Harvard).", "Questions adapted from part A of the ASRS v1.1 scale (World Health Organization and Harvard University)."],
  strengthsT: ["Fortalezas, con los pies en la tierra", "Strengths, with feet on the ground"],
  strengthsP: ["No es un superpoder mágico ni una cura. Algunos estudios encuentran fortalezas frecuentes en personas con TDAH. La evidencia todavía es chica, así que la contamos tal cual.", "It's not a magic superpower or a cure. Some studies find common strengths in people with ADHD. The evidence is still small, so we tell it as it is."],
  st1: ["Creatividad: adultos con TDAH mostraron más pensamiento original y más logros creativos que sus pares en algunos estudios.", "Creativity: adults with ADHD showed more original thinking and creative achievement than peers in some studies."],
  st2: ["Hiperfoco y energía: adultos exitosos con TDAH cuentan que, cuando algo les interesa, se concentran muchísimo y tienen mucha energía.", "Hyperfocus and energy: successful adults with ADHD report deep focus and lots of energy when something interests them."],
  st3: ["Animarse y resiliencia: muchas personas cuentan que se levantan rápido después de un error y se animan a cosas nuevas.", "Courage and resilience: many people report bouncing back fast after mistakes and trying new things."],
  sources: ["Fuentes", "Sources"], medical: ["Tangent no da consejo médico. Ante cualquier duda, consultá con un profesional de la salud.", "Tangent doesn't give medical advice. If in doubt, talk to a health professional."],
  // kit
  kitP: ["Hojas para usar sin pantalla. Imprimilas, usalas con lápiz y, si querés, después sacales una foto en Study o anotá tu nota del día.", "Sheets to use with no screen. Print them, use a pencil and, if you want, snap them later in Study or log your daily score."],
  k1: ["Hoja de tema", "Topic sheet"], k1p: ["Fuente, tema, 3 ideas, un dibujo y 2 preguntas.", "Source, topic, 3 ideas, a drawing and 2 questions."],
  k2: ["Mi semana", "My week"], k2p: ["Los 7 días, con lugar para pruebas y tareas.", "The 7 days, with room for tests and tasks."],
  k3: ["Cómo me fue (14 días)", "How it went (14 days)"], k3p: ["Pintá del 1 al 5 cada día.", "Colour 1 to 5 each day."],
  k4: ["Tablero de papel", "Paper board"], k4p: ["Por hacer, haciendo y hecho, para usar con papelitos.", "To do, doing and done, for sticky notes."],
  print: ["Imprimir", "Print"],
  // ideas
  ideasP: ["¿Qué le falta a Tangent? ¿Qué te molesta? Todo sirve.", "What is Tangent missing? What bugs you? Everything helps."],
  send: ["Enviar", "Send"], thanks: ["¡Gracias! Lo leemos todo.", "Thanks! We read everything."], tooShort: ["Escribí un poco más.", "Write a bit more."],
  // account
  preview: ["Vista previa: las cuentas, el pago y la verificación por mail se activan en la próxima etapa. Hoy podés usar un código.", "Preview: accounts, payment and email verification turn on in the next stage. Today you can use a code."],
  haveCode: ["Tengo un código (escuela o invitación)", "I have a code (school or invitation)"], code: ["Código", "Code"], useCode: ["Usar código", "Use code"],
  codeOk: ["¡Listo! Código activo en este dispositivo.", "Done! Code active on this device."], codeBad: ["Ese código no funciona. Revisalo.", "That code doesn't work. Check it."],
  removeCode: ["Quitar código", "Remove code"],
  planT: ["Plan personal", "Personal plan"], perMonth: ["por mes", "per month"],
  planL: ["✓ Study sin límite de prueba (con tope mensual de grabaciones)<br>✓ Carpeta y PDF para imprimir<br>✓ Tablero, agenda y escala diaria<br>✓ Tu historial guardado", "✓ Study beyond the trial (with a monthly recording cap)<br>✓ Folder and printable PDF<br>✓ Board, planner and daily scale<br>✓ Your history saved"],
  arsNote: ["Se cobra en pesos argentinos al valor del día.", "Charged in Argentine pesos at the day's rate."],
  payMP: ["Pagar con Mercado Pago", "Pay with Mercado Pago"], soon: ["Pronto: el pago todavía no está conectado.", "Soon: payment isn't connected yet."],
  schools: ["Escuelas", "Schools"], schoolsP: ["Escuelas públicas y ONG: gratis con código, a través de una ONG aliada. Escuelas privadas: propuesta de US$ 0,70 por alumno por mes, pago anual, desde 50 alumnos.", "Public schools and NGOs: free with a code, through a partner NGO. Private schools: proposed US$0.70 per student per month, paid yearly, from 50 students."],
  profile: ["Mi perfil", "My profile"], name: ["Nombre o apodo", "Name or nickname"], email: ["Mail", "Email"], pass: ["Contraseña (8 caracteres o más)", "Password (8+ characters)"],
  age: ["Edad", "Age"], adult: ["18 años o más", "18 or older"], minor: ["Menor de 18", "Under 18"], guardian: ["Mail de madre, padre o tutor (obligatorio si sos menor)", "Parent or guardian email (required if under 18)"],
  must: ["Obligatorio: acepto los Términos y la Privacidad.", "Required: I accept the Terms and Privacy."], optNews: ["Opcional: quiero recibir novedades y consejos de estudio.", "Optional: send me news and study tips."],
  optCookies: ["Opcional: permito cookies de medición para mejorar Tangent.", "Optional: allow measurement cookies to improve Tangent."],
  optOut: ["Podés sacar los permisos opcionales cuando quieras.", "You can withdraw optional permissions any time."],
  saveProfile: ["Guardar en este dispositivo", "Save on this device"], profSaved: ["Guardado en este dispositivo (sin la contraseña).", "Saved on this device (without the password)."],
  verifyT: ["Verificación y recuperación", "Verification and recovery"],
  verifyP: ["Cuando se active: te llega un código de 6 dígitos al mail, y al crear la cuenta te damos un código de recuperación para anotar en papel. Si olvidás la contraseña: mail, código, contraseña nueva.", "Once active: you get a 6-digit code by email, and when you create the account you get a recovery code to write on paper. Forgot your password: email, code, new password."],
  needGuardian: ["Si sos menor, falta el mail de un adulto.", "If you're under 18, an adult's email is missing."], needTerms: ["Tenés que aceptar los Términos.", "You need to accept the Terms."],
  // terms
  tVoice: ["<b>Tu voz.</b> El audio se usa para pasar lo que dijiste a texto y se descarta. No lo guardamos.", "<b>Your voice.</b> Audio is used to turn what you said into text and then dropped. We don't keep it."],
  tKeep: ["<b>Lo que sí guardamos.</b> Por ahora, todo queda en este dispositivo. Cuando haya cuentas, solo guardaremos el texto del resumen, tapando nombres, mails, teléfonos y direcciones. Lo vas a poder revisar y borrar.", "<b>What we do keep.</b> For now, everything stays on this device. Once accounts exist, we'll only keep the summary text, hiding names, emails, phone numbers and addresses. You'll be able to review and delete it."],
  tMinors: ["<b>Menores de 18.</b> Necesitan permiso de madre, padre o tutor. En escuelas y ONG lo gestiona la institución.", "<b>Under 18.</b> They need a parent or guardian's permission. In schools and NGOs, the institution handles it."],
  tSource: ["<b>Tu fuente.</b> Vos citás de dónde estudiás. Tangent resume lo que decís y no reemplaza al libro. No es diagnóstico ni consejo médico.", "<b>Your source.</b> You cite where you study from. Tangent summarises what you say and doesn't replace the book. It isn't a diagnosis or medical advice."],
  tAI: ["<b>Quién procesa.</b> Para pasar a texto y explicar usamos servicios de IA (Google Gemini y, si falla, Groq), en su versión paga, que no usa tus datos para entrenar.", "<b>Who processes it.</b> To transcribe and explain we use AI services (Google Gemini and, as backup, Groq), on paid plans that don't use your data for training."],
  tRights: ["<b>Tus derechos.</b> Podés ver, corregir, borrar y llevarte tus datos cuando quieras.", "<b>Your rights.</b> You can see, correct, delete and take your data any time."],
  cookiesT: ["Cookies", "Cookies"], cookiesP: ["Usamos lo necesario para que la app funcione. Las de medición son opcionales y están apagadas si no las activás. No hay publicidad ni vendemos datos.", "We use what's needed for the app to work. Measurement ones are optional and off unless you turn them on. No ads, and we don't sell data."],
  cNeeded: ["Necesarias (siempre activas)", "Necessary (always on)"], cMeasure: ["De medición (opcional)", "Measurement (optional)"],
  wipe: ["Borrar todo lo de este dispositivo", "Delete everything on this device"], wipeSure: ["Se borran tus resúmenes, tablero, agenda y notas de este dispositivo. ¿Seguro?", "This deletes your summaries, board, planner and notes from this device. Sure?"],
  wiped: ["Listo, borrado.", "Done, deleted."], draft: ["Borrador. El texto legal final lo revisa un abogado.", "Draft. The final legal text will be reviewed by a lawyer."],
  exportData: ["Descargar mis datos (.json)", "Download my data (.json)"],
};
const t = k => { const v = S[k]; return v ? v[L === "en" ? 1 : 0] : k; };
const tl = (k, lang) => { const v = S[k]; return v ? v[lang === "en" ? 1 : 0] : k; };

/* ---------------- helpers ---------------- */
function toast(msg, ms = 2600) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), ms); }
async function api(path, body) {
  const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ deviceId, lang: L, code: LS.get(K.code, "") || undefined, ...body }) });
  let d = {}; try { d = await res.json(); } catch {}
  return { http: res.status, ...d };
}
function sheet(title, html, { ok = t("save"), danger = false } = {}) {
  return new Promise(resolve => {
    const m = document.createElement("div"); m.className = "modal";
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><h2 style="margin-top:0">${esc(title)}</h2><form>${html}<div class="row" style="margin-top:12px"><button type="submit" class="btn small" ${danger ? 'style="background:#E2363B"' : ""}>${esc(ok)}</button><button type="button" class="btn small ghost" data-x>${esc(t("cancel"))}</button></div></form></div>`;
    document.body.appendChild(m);
    const done = v => { m.remove(); resolve(v); };
    m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-x]")) done(null); });
    m.querySelector("form").addEventListener("submit", e => { e.preventDefault(); done(Object.fromEntries(new FormData(e.target))); });
    m.addEventListener("click", e => { const b = e.target.closest("[data-pick]"); if (!b) return; const g = b.closest(".dots"); $$("button", g).forEach(x => x.classList.toggle("on", x === b)); g.querySelector("input").value = b.dataset.pick; });
    setTimeout(() => m.querySelector("input:not([type=hidden]),textarea")?.focus(), 50);
  });
}
const confirmIt = msg => sheet(msg, "", { ok: t("del"), danger: true }).then(v => v !== null);
const COLORS = ["#2B44E8", "#7C5CFF", "#3FA7FF", "#16A34A", "#F59E0B", "#E2363B", "#EC4899", "#6B7280"];
const dots = (name, cur) => `<div class="dots"><input type="hidden" name="${name}" value="${esc(cur || "")}">${COLORS.map(c => `<button type="button" data-pick="${c}" class="${c === cur ? "on" : ""}" style="background:${c}" aria-label="${c}"></button>`).join("")}</div>`;
function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
const fmtDate = (iso, opts = { weekday: "short", day: "numeric", month: "short" }) => { if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString(L === "en" ? "en-US" : "es-AR", opts); };

/* ---------------- print (PDF) ---------------- */
const PAPER = { A4: "A4", Letter: "letter", Legal: "legal", A5: "A5" };
async function printHTML(html, paper = "A4") {
  $("#print").innerHTML = html;
  let st = $("#pagesize"); if (!st) { st = document.createElement("style"); st.id = "pagesize"; document.head.appendChild(st); }
  st.textContent = `@page{size:${PAPER[paper] || "A4"};margin:14mm}`;
  const imgs = $$("#print img").filter(i => !i.complete);
  await Promise.race([Promise.all(imgs.map(i => new Promise(r => { i.onload = i.onerror = r; }))), new Promise(r => setTimeout(r, 3500))]);
  window.print();
}
const printHdr = () => `<div class="hdr"><img src="/assets/logo-skater.png" alt="">Tangent</div>`;

/* ---------------- router ---------------- */
const NAV = [["inicio", "⌂", "home"], ["study", "🎙️", "study"], ["carpeta", "📁", "folder"], ["tablero", "▦", "board"], ["agenda", "🗓️", "agenda"],
  ["progreso", "📈", "progress"], ["test", "🧠", "test"], ["kit", "✂️", "kit"], ["ideas", "💡", "ideas"], ["cuenta", "👤", "account"], ["terminos", "🔒", "terms"]];
const TABS = ["inicio", "study", "carpeta", "tablero", "agenda"];
let route = "inicio", arg = "";
const V = {}; // views: name -> {html(), mount?()}
function render() {
  document.documentElement.lang = L;
  $("#langBtn").textContent = L === "en" ? "ES" : "EN";
  $("#side").innerHTML = NAV.map(([r, i, k]) => `<a href="#${r}" class="${r === route ? "on" : ""}"><span>${i}</span>${esc(t(k))}</a>`).join("");
  $("#tabs").innerHTML = NAV.filter(n => TABS.includes(n[0])).map(([r, i, k]) => `<a href="#${r}" class="${r === route ? "on" : ""}"><b>${i}</b>${esc(t(k))}</a>`).join("");
  const v = V[route] || V.inicio;
  $("#view").innerHTML = v.html();
  v.mount?.();
  document.title = `Tangent · ${t((NAV.find(n => n[0] === route) || NAV[0])[2])}`;
}
function go() {
  let h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith("code=")) { const c = h.slice(5); history.replaceState(null, "", "#cuenta"); tryCode(c); h = "cuenta"; }
  const [r, a = ""] = h.split("/");
  const changed = r !== route;
  route = V[r] ? r : "inicio"; arg = a;
  render();
  if (changed) window.scrollTo(0, 0);
}
window.addEventListener("hashchange", go);
$("#langBtn").addEventListener("click", () => { L = L === "en" ? "es" : "en"; LS.set(K.lang, L); render(); });

async function tryCode(code) {
  code = String(code || "").trim();
  if (!code) return false;
  try {
    const d = await api("/api/study-code", { code });
    if (d.status === "ok") { LS.set(K.code, code); toast(t("codeOk")); if (route === "cuenta" || route === "inicio") render(); return true; }
  } catch {}
  toast(t("codeBad")); return false;
}

/* ---------------- home ---------------- */
V.inicio = {
  html: () => `
  <div class="iri" style="padding:20px">
    <h1>${esc(t("heroT"))}</h1>
    <p class="lead">${esc(t("heroP"))}</p>
    <a class="btn" href="#study">${esc(t("start"))}</a>
    <div class="small">${esc(LS.get(K.code, "") ? t("codeOn") : t("codeOff"))} ${LS.get(K.code, "") ? "" : `<a href="#cuenta">${esc(t("haveCode"))}</a>`}</div>
  </div>
  <div class="grid">
    ${[["study", "🎙️", "tStudy"], ["carpeta", "📁", "tFolder"], ["tablero", "▦", "tBoard"], ["agenda", "🗓️", "tAgenda"], ["progreso", "📈", "tProgress"], ["test", "🧠", "tTest"], ["kit", "✂️", "tKit"], ["ideas", "💡", "tIdeas"], ["cuenta", "👤", "tAccount"], ["terminos", "🔒", "tTerms"]]
      .map(([r, i, d]) => `<a class="tile" href="#${r}"><i>${i}</i><b>${esc(t(NAV.find(n => n[0] === r)[2]))}</b><span>${esc(t(d))}</span></a>`).join("")}
  </div>`,
};

/* ---------------- Study ---------------- */
const SEG_MS = 60000;
const st = { step: 1, source: LS.get(K.source, { title: "", author: "", page: "" }), topic: "", minutes: 5, parts: [], image: null, imageUrl: null, transcript: "", busy: false, item: null, error: "" };
let rec = null;

function stepsBar(n) { return `<div class="steps">${[1, 2, 3, 4].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`; }
function srcLine(src, lang = L) {
  return `<div class="src"><b>${esc(tl("basedOn", lang))}:</b> «${esc(src.title)}»${src.author ? `, ${esc(src.author)}` : ""}${src.page ? ` (${esc(src.page)})` : ""}.<br>${esc(tl("notMagic", lang))}</div>`;
}
V.study = {
  html() {
    if (arg && st.item?.id !== arg) { const it = folder().find(x => x.id === arg); if (it) { st.item = it; st.step = 4; } }
    if (st.step === 1) return `
      <h1>${esc(t("s1"))}</h1>${stepsBar(1)}
      <p class="lead">${esc(t("s1p"))}</p>
      <form id="srcForm">
        <label class="f" for="sT">${esc(t("srcTitle"))}</label><input class="t" id="sT" name="title" required maxlength="160" value="${esc(st.source.title)}">
        <div class="two"><div><label class="f" for="sA">${esc(t("srcAuthor"))}</label><input class="t" id="sA" name="author" maxlength="120" value="${esc(st.source.author)}"></div>
        <div><label class="f" for="sP">${esc(t("srcPage"))}</label><input class="t" id="sP" name="page" maxlength="60" value="${esc(st.source.page)}"></div></div>
        <label class="f" for="sTo">${esc(t("topic"))}</label><input class="t" id="sTo" name="topic" maxlength="120" placeholder="${esc(t("topicPh"))}" value="${esc(st.topic)}">
        <label class="f">${esc(t("howLong"))}</label>
        <div class="seg" id="mins">${[5, 10].map(m => `<button type="button" data-m="${m}" class="${st.minutes === m ? "on" : ""}">${m} ${esc(t("min"))}</button>`).join("")}</div>
        <button class="btn" type="submit">${esc(t("next"))}</button>
      </form>
      <div class="card"><b>${esc(t("why"))}</b><p class="small" style="margin-top:6px">${esc(t("whyP"))}<br>Dunlosky et al. (2013), <i>Psychological Science in the Public Interest</i>. MacLeod et al. (2010), <i>J. Exp. Psychology: Learning, Memory, and Cognition</i>.</p></div>`;
    if (st.step === 2) {
      const on = Boolean(rec), done = st.parts.filter(p => p != null).length;
      return `
      <h1>${esc(t("s2"))}</h1>${stepsBar(2)}
      ${srcLine(st.source)}
      <p class="lead" style="margin-top:10px">${esc(t("s2p"))}</p>
      <div class="rec">
        <button class="recbtn ${on ? "on" : ""}" id="recBtn" type="button">${esc(on ? t("tapStop") : t("tapRec"))}</button>
        <div class="clock" id="clock">${on ? "0:00" : `${st.minutes}:00`}</div>
        <div class="bar"><i id="recBar"></i></div>
        <div class="small" id="recInfo">${on ? esc(t("recording")) : done ? `${done} ${esc(t("pieces"))}` : ""}</div>
      </div>
      ${on ? "" : `
      <div class="two">
        <div class="card"><b>📷 ${esc(t("orPhoto"))}</b>
          <input type="file" id="photo" accept="image/*" capture="environment" style="display:block;margin-top:10px;max-width:100%">
          ${st.imageUrl ? `<img src="${st.imageUrl}" alt="" style="width:100%;border-radius:12px;margin-top:10px"><div class="small">${esc(t("photoOk"))}</div><button class="btn small ghost" id="noPhoto" type="button">${esc(t("removePhoto"))}</button>` : ""}
        </div>
        <div class="card"><b>⌨️ ${esc(t("orType"))}</b><textarea class="t" id="typed" maxlength="12000" style="margin-top:10px">${esc(st.transcript)}</textarea></div>
      </div>
      <button class="btn" id="toReview" type="button">${esc(t("next"))}</button>
      <button class="btn ghost" id="back1" type="button">${esc(t("back"))}</button>`}`;
    }
    if (st.step === 3) return `
      <h1>${esc(t("s3"))}</h1>${stepsBar(3)}
      ${srcLine(st.source)}
      <p class="lead" style="margin-top:10px">${esc(t("s3p"))}</p>
      ${st.imageUrl ? `<img src="${st.imageUrl}" alt="" style="max-width:220px;border-radius:12px">` : ""}
      <textarea class="t" id="tr" maxlength="12000" style="min-height:200px">${esc(st.transcript)}</textarea>
      ${st.error ? `<div class="warn" style="margin-top:10px">${st.error}</div>` : ""}
      <button class="btn" id="make" type="button" ${st.busy ? "disabled" : ""}>${esc(st.busy ? t("making") : t("make"))}</button>
      <button class="btn ghost" id="back2" type="button" ${st.busy ? "disabled" : ""}>${esc(t("back"))}</button>`;
    const it = st.item;
    if (!it) { st.step = 1; return V.study.html(); }
    return `${stepsBar(4)}${resultHTML(it)}
      <div class="row">
        <button class="btn small" id="speak" type="button">🔊 ${esc(t("listen"))}</button>
        <button class="btn small ghost" id="printOne" type="button">🖨️ ${esc(t("printThis"))}</button>
        <a class="btn small ghost" href="#carpeta">📁 ${esc(t("toFolder"))}</a>
        <button class="btn small ghost" id="again" type="button">＋ ${esc(t("newTopic"))}</button>
      </div>`;
  },
  mount() {
    $("#srcForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(e.target));
      st.source = { title: f.title.trim(), author: f.author.trim(), page: f.page.trim() }; st.topic = f.topic.trim();
      if (st.source.title.length < 2) return toast(t("needSource"));
      LS.set(K.source, st.source); st.step = 2; render();
    });
    $("#mins")?.addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (!b) return; st.minutes = Number(b.dataset.m); $$("#mins button").forEach(x => x.classList.toggle("on", x === b)); });
    $("#recBtn")?.addEventListener("click", () => (rec ? recStop() : recStart()));
    $("#photo")?.addEventListener("change", e => { const f = e.target.files?.[0]; if (f) pickPhoto(f); });
    $("#noPhoto")?.addEventListener("click", () => { st.image = st.imageUrl = null; render(); });
    $("#typed")?.addEventListener("input", e => { st.transcript = e.target.value; });
    $("#toReview")?.addEventListener("click", () => {
      const typed = ($("#typed")?.value || "").trim();
      if (typed) st.transcript = typed;
      if (!st.transcript.trim() && !st.image) return toast(t("needText"));
      st.step = 3; st.error = ""; render();
    });
    $("#back1")?.addEventListener("click", () => { st.step = 1; render(); });
    $("#back2")?.addEventListener("click", () => { st.step = 2; render(); });
    $("#tr")?.addEventListener("input", e => { st.transcript = e.target.value; });
    $("#make")?.addEventListener("click", makeSummary);
    $("#speak")?.addEventListener("click", () => speak(st.item));
    $("#printOne")?.addEventListener("click", () => printItems([st.item], "A4", L, false));
    $("#again")?.addEventListener("click", () => { Object.assign(st, { step: 1, topic: "", parts: [], image: null, imageUrl: null, transcript: "", item: null, error: "" }); location.hash = "study"; render(); });
    mountResult();
  },
};

function resultHTML(it, view = LS.get("tangent.study.view", L)) {
  const r = it.result, langs = view === "both" ? [L, L === "en" ? "es" : "en"] : [view];
  const block = lang => `
    <div class="card">
      <h2 style="margin-top:0">${esc(r.title[lang] || r.title.es || r.title.en)}</h2>
      <b>${esc(tl("plain", lang))}</b><p style="margin-top:6px">${esc(r.plain[lang])}</p>
      ${r.points[lang]?.length ? `<b>${esc(tl("keyIdeas", lang))}</b><ul class="pts">${r.points[lang].map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${r.check[lang]?.length ? `<p style="margin-top:10px"><b>${esc(tl("checkYou", lang))}</b></p><ul class="pts">${r.check[lang].map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${r.review[lang] ? `<div class="warn" style="margin-top:10px"><b>${esc(tl("review", lang))}:</b> ${esc(r.review[lang])}</div>` : ""}
    </div>`;
  return `
    <div class="seg" id="viewSeg" style="max-width:320px;margin:4px 0 10px">${[["es", "ES"], ["en", "EN"], ["both", "ES + EN"]].map(([k, l]) => `<button type="button" data-v="${k}" class="${view === k ? "on" : ""}">${l}</button>`).join("")}</div>
    ${srcLine(it.source)}
    <div class="${langs.length > 1 ? "two" : ""}">${langs.map(block).join("")}</div>
    ${r.concepts?.length ? `<b>${esc(t("images"))}</b><div class="concepts" style="margin:8px 0">${r.concepts.map((c, i) => {
      const p = it.photos?.[i];
      return `<div class="concept"><div class="ph">${p ? `<img src="${esc(p.src)}" alt="${esc(p.alt || c.en)}" loading="lazy">` : "💡"}</div><div class="c">${esc(c[L] || c.es)}<small>${esc(c[L === "en" ? "es" : "en"])}</small></div>${p ? `<div class="credit lic"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.credit)} · ${esc(p.source)}</a></div>` : ""}</div>`;
    }).join("")}</div>` : ""}`;
}
function mountResult() {
  $("#viewSeg")?.addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (!b) return; LS.set("tangent.study.view", b.dataset.v); render(); });
}
function speak(it) {
  if (!("speechSynthesis" in window)) return;
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
  const view = LS.get("tangent.study.view", L), lang = view === "both" ? L : view, r = it.result;
  const u = new SpeechSynthesisUtterance([r.title[lang], r.plain[lang], ...(r.points[lang] || [])].filter(Boolean).join(". "));
  u.lang = lang === "en" ? "en-US" : "es-AR"; u.rate = 0.95;
  const v = speechSynthesis.getVoices().find(x => x.lang.toLowerCase().startsWith(lang)); if (v) u.voice = v;
  speechSynthesis.speak(u);
}

/* recording in ~60 s pieces */
async function recStart() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast(t("noMic"), 4000);
  let stream;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
  catch { return toast(t("micDenied"), 5000); }
  rec = { stream, start: Date.now(), limit: st.minutes * 60, idx: 0, pending: 0, stopping: false, queue: Promise.resolve(), errors: 0, paywall: false, mr: null, seg: null, tick: null };
  st.parts = []; st.transcript = "";
  render();
  segment();
  rec.tick = setInterval(tickRec, 250);
}
function segment() {
  const r = rec; if (!r) return;
  const chunks = [], mr = new MediaRecorder(r.stream), i = r.idx++;
  r.mr = mr;
  mr.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
  mr.onstop = () => {
    if (chunks.length) enqueue(new Blob(chunks, { type: mr.mimeType || "audio/webm" }), i);
    if (r.stopping) finishRec(r); else segment();
  };
  mr.start();
  r.seg = setTimeout(() => { if (mr.state === "recording") mr.stop(); }, SEG_MS);
}
function enqueue(blob, i) {
  const r = rec; if (!r) return;
  r.pending++; updateRecInfo();
  r.queue = r.queue.then(async () => {
    try {
      if (r.paywall) return;
      const wav = await toWavBase64(blob);
      const d = await api("/api/study-chunk", { audio: wav });
      if (d.status === "ok") st.parts[i] = d.text || "";
      else if (d.status === "paywall") r.paywall = true;
      else if (d.status === "blocked") { st.parts[i] = ""; r.blocked = true; }
      else { st.parts[i] = ""; r.errors++; }
    } catch { st.parts[i] = ""; r.errors++; }
    finally { r.pending--; updateRecInfo(); }
  });
}
function tickRec() {
  if (!rec) return;
  const sec = (Date.now() - rec.start) / 1000, left = Math.max(0, rec.limit - sec);
  const c = $("#clock"), b = $("#recBar");
  if (c) c.textContent = `${Math.floor(left / 60)}:${pad(Math.floor(left % 60))}`;
  if (b) b.style.width = `${Math.min(100, (sec / rec.limit) * 100)}%`;
  if (left <= 0) recStop();
}
function updateRecInfo() {
  const el = $("#recInfo"); if (!el || !rec) return;
  const done = st.parts.filter(p => p != null).length;
  el.textContent = `${rec.stopping ? t("working") : t("recording")} · ${done} ${t("pieces")}${rec.pending ? " · …" : ""}`;
}
function recStop() {
  const r = rec; if (!r || r.stopping) return;
  r.stopping = true; clearTimeout(r.seg); clearInterval(r.tick);
  const btn = $("#recBtn"); if (btn) { btn.disabled = true; btn.textContent = t("working"); }
  updateRecInfo();
  if (r.mr && r.mr.state === "recording") r.mr.stop(); else finishRec(r);
}
async function finishRec(r) {
  r.stream.getTracks().forEach(tr => tr.stop());
  await r.queue;
  rec = null;
  st.transcript = st.parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (r.paywall) { st.step = 3; st.error = `${esc(t("paywall"))} <a href="#cuenta">${esc(t("seePlans"))}</a>`; return render(); }
  if (r.blocked) toast(t("blocked"), 4000);
  else if (r.errors) toast(t("errChunk"), 4000);
  st.step = 3; st.error = ""; render();
}
async function toWavBase64(blob) {
  const buf = await blob.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext, tmp = new AC();
  const decoded = await new Promise((res, rej) => { const p = tmp.decodeAudioData(buf, res, rej); if (p?.then) p.then(res, rej); });
  tmp.close().catch(() => {});
  const rate = 16000, len = Math.max(1, Math.min(Math.ceil(decoded.duration * rate), rate * 75));
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
async function pickPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    st.imageUrl = c.toDataURL("image/jpeg", 0.8); st.image = st.imageUrl.split(",")[1];
    render();
  } catch { toast(t("errAI")); }
  finally { URL.revokeObjectURL(url); }
}
async function makeSummary() {
  st.transcript = ($("#tr")?.value ?? st.transcript).trim();
  if (!st.transcript && !st.image) return toast(t("needText"));
  st.busy = true; st.error = ""; render();
  let d;
  try { d = await api("/api/study", { source: st.source, topic: st.topic, transcript: st.transcript, image: st.image || undefined }); }
  catch { d = { status: "ai_error" }; }
  st.busy = false;
  const msg = { paywall: `${esc(t("paywall"))} <a href="#cuenta">${esc(t("seePlans"))}</a>`, blocked: esc(t("blocked")), support: esc(t("support")), language: esc(t("langOnly")), no_source: esc(t("needSource")) }[d.status];
  if (d.status !== "ok") { st.error = msg || esc(t("errAI")); return render(); }
  const item = { id: uid(), at: new Date().toISOString(), source: { ...st.source }, topic: st.topic, transcript: st.transcript, result: d.result, photos: [] };
  saveFolder([item, ...folder()]);
  st.item = item; st.step = 4; st.image = st.imageUrl = null;
  history.replaceState(null, "", `#study/${item.id}`); arg = item.id;
  render(); toast(t("saved"));
  const queries = (d.result.concepts || []).map(c => c.photo || c.en).filter(Boolean);
  if (queries.length) {
    try {
      const p = await api("/api/photos", { queries });
      if (Array.isArray(p.photos)) {
        item.photos = p.photos;
        saveFolder(folder().map(x => (x.id === item.id ? { ...x, photos: p.photos } : x)));
        if (route === "study" && st.item?.id === item.id) render();
      }
    } catch {}
  }
}

/* ---------------- folder + PDF ---------------- */
const folder = () => LS.get(K.folder, []);
const saveFolder = v => LS.set(K.folder, v.slice(0, 300));
V.carpeta = {
  html() {
    const items = folder();
    if (arg) { const it = items.find(x => x.id === arg); if (it) return `<a href="#carpeta">← ${esc(t("folder"))}</a>${resultHTML(it)}<div class="row"><button class="btn small" id="printOne" type="button">🖨️ ${esc(t("printThis"))}</button></div>`; }
    const pf = LS.get("tangent.study.print", { paper: "A4", lang: L, text: false });
    return `<h1>${esc(t("folder"))}</h1><p class="lead">${esc(t("folderP"))}</p>
      ${items.length ? `
      <div class="card two">
        <div><label class="f" for="paper">${esc(t("paper"))}</label><select class="t" id="paper">${[["A4", "A4"], ["Letter", L === "en" ? "Letter" : "Carta"], ["Legal", L === "en" ? "Legal" : "Oficio"], ["A5", "A5"]].map(([k, l]) => `<option value="${k}" ${pf.paper === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div><label class="f" for="plang">${esc(t("printLang"))}</label><select class="t" id="plang">${[["es", "Español"], ["en", "English"], ["both", t("both")]].map(([k, l]) => `<option value="${k}" ${pf.lang === k ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></div>
        <label class="row small" style="grid-column:1/-1"><input type="checkbox" id="ptext" ${pf.text ? "checked" : ""}> ${esc(t("withText"))}</label>
      </div>
      ${items.map(it => `<div class="item"><input type="checkbox" class="pick" value="${it.id}" checked aria-label="${esc(it.result.title[L])}">
        <div class="grow"><a href="#carpeta/${it.id}"><b>${esc(it.result.title[L] || it.result.title.es)}</b></a><div class="small">${esc(it.source.title)} · ${esc(new Date(it.at).toLocaleDateString(L === "en" ? "en-US" : "es-AR"))}</div></div>
        <button class="x" data-del="${it.id}" aria-label="${esc(t("del"))}">🗑</button></div>`).join("")}
      <button class="btn" id="pdf" type="button">⬇ ${esc(t("download"))}</button><div class="small" style="text-align:center">${esc(t("pdfHint"))}</div>`
      : `<div class="card">${esc(t("empty"))} <a href="#study">${esc(t("start"))}</a></div>`}`;
  },
  mount() {
    mountResult();
    $("#printOne")?.addEventListener("click", () => { const it = folder().find(x => x.id === arg); if (it) printItems([it], "A4", LS.get("tangent.study.view", L), false); });
    const savePf = () => LS.set("tangent.study.print", { paper: $("#paper").value, lang: $("#plang").value, text: $("#ptext").checked });
    ["#paper", "#plang", "#ptext"].forEach(s => $(s)?.addEventListener("change", savePf));
    $("#pdf")?.addEventListener("click", () => {
      const ids = $$(".pick").filter(c => c.checked).map(c => c.value);
      if (!ids.length) return toast(t("pickOne"));
      printItems(folder().filter(x => ids.includes(x.id)), $("#paper").value, $("#plang").value, $("#ptext").checked);
      toast(t("pdfHint"), 4000);
    });
    $("#view").onclick = async e => {
      const b = e.target.closest("[data-del]"); if (!b || route !== "carpeta") return;
      if (await confirmIt(t("sure"))) { saveFolder(folder().filter(x => x.id !== b.dataset.del)); render(); }
    };
  },
};
function printItems(items, paper, view, withText) {
  const langs = view === "both" ? ["es", "en"] : [view === "en" ? "en" : "es"];
  const pages = items.map(it => {
    const r = it.result;
    return langs.map(lang => `<section class="pg">${printHdr()}
      <h1>${esc(r.title[lang])}</h1>
      <div class="src"><b>${esc(tl("basedOn", lang))}:</b> «${esc(it.source.title)}»${it.source.author ? `, ${esc(it.source.author)}` : ""}${it.source.page ? ` (${esc(it.source.page)})` : ""}. ${esc(tl("notMagic", lang))}</div>
      <h2>${esc(tl("plain", lang))}</h2><p>${esc(r.plain[lang])}</p>
      ${r.points[lang]?.length ? `<h2>${esc(tl("keyIdeas", lang))}</h2><ul>${r.points[lang].map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${it.photos?.some(Boolean) ? `<div class="imgs">${r.concepts.map((c, i) => it.photos[i] ? `<figure><img src="${esc(it.photos[i].src)}" alt=""><figcaption><b>${esc(c[lang])}</b><br>${esc(it.photos[i].credit)} · ${esc(it.photos[i].source)}</figcaption></figure>` : "").join("")}</div>` : ""}
      ${r.check[lang]?.length ? `<h2>${esc(tl("checkYou", lang))}</h2><ol>${r.check[lang].map(p => `<li>${esc(p)}</li>`).join("")}</ol>` : ""}
      ${r.review[lang] ? `<p><b>${esc(tl("review", lang))}:</b> ${esc(r.review[lang])}</p>` : ""}
      ${withText && it.transcript ? `<h2>${lang === "en" ? "What I said" : "Lo que dije"}</h2><p style="font-size:9.5pt">${esc(it.transcript)}</p>` : ""}
      <h2>${esc(tl("notes", lang))}</h2><div class="lines"><div></div><div></div><div></div><div></div></div>
      <div class="foot">Tangent Study · ${esc(new Date(it.at).toLocaleDateString(lang === "en" ? "en-US" : "es-AR"))}</div></section>`).join("");
  }).join("");
  printHTML(pages, paper);
}

/* ---------------- board ---------------- */
function board() {
  let b = LS.get(K.board, null);
  if (!b) { b = { cols: tl("cols", L).map((n, i) => ({ id: uid(), name: n, color: COLORS[[0, 2, 4, 1, 3][i]], tasks: [] })) }; LS.set(K.board, b); }
  return b;
}
const saveBoard = b => LS.set(K.board, b);
V.tablero = {
  html() {
    const b = board();
    return `<h1>${esc(t("board"))}</h1><p class="lead">${esc(t("boardP"))}</p>
      <div class="row" style="margin-bottom:8px"><button class="btn small" data-act="addcol" type="button">${esc(t("addCol"))}</button></div>
      <div class="board" id="board">${b.cols.map((c, ci) => `
        <section class="col" data-col="${c.id}" style="--c:${c.color}">
          <div class="colh"><h3 data-act="editcol" title="${esc(t("colName"))}">${esc(c.name)}</h3><span class="n">${c.tasks.length}</span>
            <button type="button" data-act="colL" ${ci === 0 ? "disabled" : ""} aria-label="◀">◀</button><button type="button" data-act="colR" ${ci === b.cols.length - 1 ? "disabled" : ""} aria-label="▶">▶</button>
            <button type="button" data-act="editcol" aria-label="✎">✎</button><button type="button" data-act="delcol" aria-label="${esc(t("del"))}">🗑</button></div>
          <div class="tasks" data-col="${c.id}">${c.tasks.map((k, ti) => `
            <div class="task" data-task="${k.id}" style="--c:${k.color || c.color}">
              <div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="handle" aria-label="⠿">⠿</span><div class="tx grow" data-act="edittask">${esc(k.text)}</div></div>
              ${k.date ? `<div class="dt">📅 ${esc(fmtDate(k.date))}</div>` : ""}
              <div class="acts">
                <button type="button" data-act="tL" ${ci === 0 ? "disabled" : ""} aria-label="◀">◀</button><button type="button" data-act="tU" ${ti === 0 ? "disabled" : ""} aria-label="▲">▲</button>
                <button type="button" data-act="tD" ${ti === c.tasks.length - 1 ? "disabled" : ""} aria-label="▼">▼</button><button type="button" data-act="tR" ${ci === b.cols.length - 1 ? "disabled" : ""} aria-label="▶">▶</button>
                <button type="button" data-act="edittask" aria-label="✎">✎</button><button type="button" data-act="deltask" aria-label="${esc(t("del"))}">🗑</button>
              </div></div>`).join("")}</div>
          <form class="addt" data-col="${c.id}"><input name="t" placeholder="${esc(t("newTask"))}" maxlength="200" aria-label="${esc(t("newTask"))}"><button type="submit" aria-label="${esc(t("add"))}">＋</button></form>
        </section>`).join("")}</div>
      <p class="small">${esc(t("syncNote"))}</p>`;
  },
  mount() {
    const view = $("#view");
    view.onclick = e => { if (route === "tablero") boardAct(e, false); };
    view.ondblclick = e => { if (route === "tablero") boardAct(e, true); };
    view.onsubmit = e => {
      const f = e.target.closest(".addt"); if (!f || route !== "tablero") return;
      e.preventDefault(); const v = f.t.value.trim(); if (!v) return;
      const b = board(); b.cols.find(c => c.id === f.dataset.col).tasks.push({ id: uid(), text: v, date: "", color: "" }); saveBoard(b); render();
      setTimeout(() => $(`.addt[data-col="${f.dataset.col}"] input`)?.focus(), 0);
    };
    view.onpointerdown = e => { if (route === "tablero" && e.target.closest(".handle")) dragStart(e); };
  },
};
async function boardAct(e, dbl) {
  const el = e.target.closest("[data-act]"); if (!el) return;
  const act = el.dataset.act;
  // Buttons work with one tap; the column name and task text open the editor with a double tap/click.
  if (dbl === (el.tagName === "BUTTON")) return;
  const b = board(), colEl = el.closest("[data-col]"), ci = colEl ? b.cols.findIndex(c => c.id === colEl.dataset.col) : -1, col = b.cols[ci];
  const taskEl = el.closest("[data-task]"), ti = taskEl && col ? col.tasks.findIndex(k => k.id === taskEl.dataset.task) : -1, task = ti >= 0 ? col.tasks[ti] : null;
  const swap = (arr, i, j) => { [arr[i], arr[j]] = [arr[j], arr[i]]; };
  if (act === "addcol") {
    const v = await sheet(t("addCol"), `<label class="f">${esc(t("colName"))}</label><input class="t" name="name" maxlength="40" required><label class="f">${esc(t("color"))}</label>${dots("color", COLORS[b.cols.length % COLORS.length])}`);
    if (v?.name?.trim()) { b.cols.push({ id: uid(), name: v.name.trim(), color: v.color || COLORS[0], tasks: [] }); saveBoard(b); render(); }
  } else if (act === "editcol" && col) {
    const v = await sheet(t("colName"), `<input class="t" name="name" maxlength="40" required value="${esc(col.name)}"><label class="f">${esc(t("color"))}</label>${dots("color", col.color)}`);
    if (v?.name?.trim()) { col.name = v.name.trim(); col.color = v.color || col.color; saveBoard(b); render(); }
  } else if (act === "delcol" && col) { if (await confirmIt(`${t("sure")} «${col.name}»`)) { b.cols.splice(ci, 1); saveBoard(b); render(); } }
  else if (act === "colL" && ci > 0) { swap(b.cols, ci, ci - 1); saveBoard(b); render(); }
  else if (act === "colR" && ci < b.cols.length - 1) { swap(b.cols, ci, ci + 1); saveBoard(b); render(); }
  else if (!task) return;
  else if (act === "edittask") {
    const v = await sheet(t("task"), `<textarea class="t" name="text" maxlength="200" required style="min-height:80px">${esc(task.text)}</textarea><label class="f">${esc(t("date"))}</label><input class="t" type="date" name="date" value="${esc(task.date)}"><label class="f">${esc(t("color"))}</label>${dots("color", task.color || col.color)}`);
    if (v?.text?.trim()) { Object.assign(task, { text: v.text.trim(), date: v.date || "", color: v.color || "" }); saveBoard(b); render(); }
  } else if (act === "deltask") { if (await confirmIt(t("sure"))) { col.tasks.splice(ti, 1); saveBoard(b); render(); } }
  else if (act === "tU" && ti > 0) { swap(col.tasks, ti, ti - 1); saveBoard(b); render(); }
  else if (act === "tD" && ti < col.tasks.length - 1) { swap(col.tasks, ti, ti + 1); saveBoard(b); render(); }
  else if ((act === "tL" && ci > 0) || (act === "tR" && ci < b.cols.length - 1)) { col.tasks.splice(ti, 1); b.cols[ci + (act === "tL" ? -1 : 1)].tasks.push(task); saveBoard(b); render(); }
}
// Drag with finger or mouse (pointer events work on phones too).
function dragStart(e) {
  const card = e.target.closest(".task"); if (!card) return;
  e.preventDefault();
  const ghost = card.cloneNode(true); ghost.classList.add("dragghost"); document.body.appendChild(ghost);
  card.style.opacity = ".35";
  let target = null, index = 0;
  const boardEl = $("#board");
  const move = ev => {
    ghost.style.left = ev.clientX - 30 + "px"; ghost.style.top = ev.clientY - 20 + "px";
    const under = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".col");
    $$(".tasks.drop").forEach(x => x.classList.remove("drop"));
    target = under ? $(".tasks", under) : null;
    if (target) {
      target.classList.add("drop");
      const kids = $$(".task", target).filter(k => k !== card);
      index = kids.findIndex(k => { const r = k.getBoundingClientRect(); return ev.clientY < r.top + r.height / 2; });
      if (index < 0) index = kids.length;
    }
    const br = boardEl.getBoundingClientRect();
    if (ev.clientX > br.right - 40) boardEl.scrollLeft += 12; else if (ev.clientX < br.left + 40) boardEl.scrollLeft -= 12;
  };
  const up = () => {
    document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up);
    ghost.remove(); card.style.opacity = "";
    if (!target) return;
    const b = board(), from = b.cols.find(c => c.tasks.some(k => k.id === card.dataset.task)), to = b.cols.find(c => c.id === target.dataset.col);
    const ti = from.tasks.findIndex(k => k.id === card.dataset.task), [task] = from.tasks.splice(ti, 1);
    to.tasks.splice(Math.min(index, to.tasks.length), 0, task); saveBoard(b); render();
  };
  move(e);
  document.addEventListener("pointermove", move); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
}

/* ---------------- agenda ---------------- */
const agenda = () => LS.get(K.agenda, []);
const saveAgenda = v => LS.set(K.agenda, v);
const evStart = ev => { const [y, m, d] = ev.date.split("-").map(Number); const [hh, mm] = (ev.time || "09:00").split(":").map(Number); return new Date(y, m - 1, d, hh, mm); };
const icsStamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
function gcalUrl(ev) {
  const s = evStart(ev), e = new Date(s.getTime() + 3600e3);
  const p = new URLSearchParams({ action: "TEMPLATE", text: ev.title, dates: `${icsStamp(s)}/${icsStamp(e)}`, details: "Tangent Study", ctz: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Argentina/Buenos_Aires" });
  return `https://calendar.google.com/calendar/render?${p}`;
}
function ics(ev) {
  const s = evStart(ev), e = new Date(s.getTime() + 3600e3), clean = x => String(x).replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tangent//Study//ES", "BEGIN:VEVENT", `UID:${ev.id}@tangent`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART:${icsStamp(s)}`, `DTEND:${icsStamp(e)}`, `SUMMARY:${clean(ev.title)}`, "DESCRIPTION:Tangent Study"];
  if (ev.remind) lines.push("BEGIN:VALARM", `TRIGGER:-PT${ev.remind}M`, "ACTION:DISPLAY", `DESCRIPTION:${clean(ev.title)}`, "END:VALARM");
  lines.push("END:VEVENT", "END:VCALENDAR");
  download(`tangent-${ev.date}.ics`, lines.join("\r\n"), "text/calendar");
}
V.agenda = {
  html() {
    const all = agenda().sort((a, b) => evStart(a) - evStart(b)), now = Date.now() - 3600e3;
    const up = all.filter(e => evStart(e) >= now), past = all.filter(e => evStart(e) < now).reverse();
    const row = ev => `<div class="item"><div class="grow"><b>${esc(ev.title)}</b><div class="small">${esc(fmtDate(ev.date, { weekday: "long", day: "numeric", month: "long" }))} · ${esc(ev.time || "")}${ev.remind ? ` · ⏰ ${esc(t(ev.remind === 10 ? "before10" : ev.remind === 60 ? "before60" : "before1d"))}` : ""}</div>
      <div class="row" style="margin-top:4px"><a href="${esc(gcalUrl(ev))}" target="_blank" rel="noopener" class="small">${esc(t("gcal"))}</a> · <a href="#" data-ics="${ev.id}" class="small">${esc(t("ics"))}</a></div></div>
      <button class="x" data-delev="${ev.id}" aria-label="${esc(t("del"))}">🗑</button></div>`;
    return `<h1>${esc(t("agenda"))}</h1><p class="lead">${esc(t("agendaP"))}</p>
      <form class="card" id="evForm">
        <label class="f" for="evT">${esc(t("what"))}</label><input class="t" id="evT" name="title" maxlength="120" required placeholder="${L === "en" ? "Maths test" : "Prueba de mate"}">
        <div class="two"><div><label class="f" for="evD">${esc(t("when"))}</label><input class="t" id="evD" type="date" name="date" required value="${dayKey()}"></div>
        <div><label class="f" for="evH">${esc(t("hour"))}</label><input class="t" id="evH" type="time" name="time" value="${pad((new Date().getHours() + 1) % 24)}:00"></div></div>
        <label class="f" for="evR">${esc(t("remind"))}</label><select class="t" id="evR" name="remind"><option value="0">${esc(t("none"))}</option><option value="10">${esc(t("before10"))}</option><option value="60" selected>${esc(t("before60"))}</option><option value="1440">${esc(t("before1d"))}</option></select>
        <button class="btn" type="submit">${esc(t("add"))}</button>
      </form>
      <div class="row"><button class="btn small ghost" id="notif" type="button">🔔 ${esc(t("notif"))}</button><button class="btn small ghost" id="printWeek" type="button">🖨️ ${esc(t("printWeek"))}</button></div>
      <h2>${esc(t("upcoming"))}</h2>${up.length ? up.map(row).join("") : `<div class="small">${esc(t("empty"))}</div>`}
      ${past.length ? `<details><summary class="small">${esc(t("past"))} (${past.length})</summary>${past.map(row).join("")}</details>` : ""}`;
  },
  mount() {
    $("#evForm").addEventListener("submit", e => {
      e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
      saveAgenda([...agenda(), { id: uid(), title: f.title.trim(), date: f.date, time: f.time || "09:00", remind: Number(f.remind) || 0 }]); render(); scheduleNotifs();
    });
    $("#view").onclick = async e => {
      if (route !== "agenda") return;
      const i = e.target.closest("[data-ics]"); if (i) { e.preventDefault(); const ev = agenda().find(x => x.id === i.dataset.ics); if (ev) ics(ev); return; }
      const d = e.target.closest("[data-delev]"); if (d && await confirmIt(t("sure"))) { saveAgenda(agenda().filter(x => x.id !== d.dataset.delev)); render(); }
    };
    $("#notif").addEventListener("click", async () => {
      if (!("Notification" in window)) return toast(t("gcal"));
      if ((await Notification.requestPermission()) === "granted") { toast(t("notifOn"), 3500); scheduleNotifs(); }
    });
    $("#printWeek").addEventListener("click", () => {
      const days = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return dayKey(d); });
      const evs = agenda();
      printHTML(`<section class="pg">${printHdr()}<h1>${esc(t("k2"))}</h1><table>${days.map(d => `<tr><th style="width:28%;text-align:left">${esc(fmtDate(d, { weekday: "long", day: "numeric", month: "short" }))}</th><td style="height:62pt">${evs.filter(e => e.date === d).map(e => `• ${esc(e.time)} ${esc(e.title)}`).join("<br>")}</td></tr>`).join("")}</table></section>`, "A4");
    });
  },
};
const timers = [];
function scheduleNotifs() {
  timers.splice(0).forEach(clearTimeout);
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  for (const ev of agenda()) {
    if (!ev.remind) continue;
    const ms = evStart(ev).getTime() - ev.remind * 60e3 - Date.now();
    if (ms > 0 && ms < 864e5) timers.push(setTimeout(() => { try { new Notification("Tangent", { body: `${ev.time} · ${ev.title}`, icon: "/assets/logo-skater.png" }); } catch {} }, ms));
  }
}

/* ---------------- progress (1-5) ---------------- */
V.progreso = {
  html() {
    const sc = LS.get(K.scale, {}), today = sc[dayKey()] || {};
    const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return dayKey(d); });
    return `<h1>${esc(t("progress"))}</h1><p class="lead">${esc(t("progressP"))}</p>
      <div class="card"><b>${esc(t("today"))}</b>
        <div class="scale" id="scale" style="margin-top:8px">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-n="${n}" class="${today.v === n ? "on" : ""}">${n}<small>${esc(tl("scaleL", L)[n - 1])}</small></button>`).join("")}</div>
        <label class="f" for="note">${esc(t("note"))}</label><input class="t" id="note" maxlength="140" value="${esc(today.note || "")}">
      </div>
      <h2>${esc(t("last14"))}</h2>
      <div class="chart">${days.map(d => `<div><i style="height:${((sc[d]?.v || 0) / 5) * 100}%;${sc[d] ? "" : "background:#ddd"}"></i>${esc(d.slice(8))}</div>`).join("")}</div>
      <p class="small" style="margin-top:8px">${Object.keys(sc).length} ${esc(t("daysLogged"))}</p>
      <button class="btn ghost" id="print14" type="button">🖨️ ${esc(t("print14"))}</button>`;
  },
  mount() {
    const save = patch => { const sc = LS.get(K.scale, {}); sc[dayKey()] = { ...(sc[dayKey()] || {}), ...patch }; LS.set(K.scale, sc); };
    $("#scale").addEventListener("click", e => { const b = e.target.closest("[data-n]"); if (!b) return; save({ v: Number(b.dataset.n), note: $("#note").value.trim() }); render(); });
    $("#note").addEventListener("change", e => { const sc = LS.get(K.scale, {}); if (sc[dayKey()]?.v) save({ note: e.target.value.trim() }); });
    $("#print14").addEventListener("click", () => printKit("k3"));
  },
};

/* ---------------- ADHD test + strengths ---------------- */
V.test = {
  html() {
    const a = LS.get(K.test, []), res = V.test.result;
    return `<h1>${esc(t("test"))}</h1><div class="warn">${esc(t("testP"))}</div>
      <div id="qs">${tl("testQ", L).map((q, i) => `<div class="q"><p>${i + 1}. ${esc(q)}</p><div class="opts">${tl("freq", L).map((f, v) => `<button type="button" data-q="${i}" data-v="${v}" class="${a[i] === v ? "on" : ""}">${esc(f)}</button>`).join("")}</div></div>`).join("")}</div>
      <button class="btn" id="seeRes" type="button">${esc(t("seeResult"))}</button>
      ${res ? `<div class="card ${res === "high" ? "" : "ok"}" id="res"><b>${esc(t(res === "high" ? "resHigh" : "resLow"))}</b><p class="small" style="margin-top:6px">${esc(t("minorNote"))}<br>${esc(t("medical"))}</p></div>` : ""}
      <p class="small">${esc(t("basedAsrs"))}</p>
      <div class="iri"><h2 style="margin-top:0">${esc(t("strengthsT"))}</h2><p>${esc(t("strengthsP"))}</p>
        <ul class="pts"><li>${esc(t("st1"))} <span class="small">(White &amp; Shah, 2011)</span></li><li>${esc(t("st2"))} <span class="small">(Sedgwick, Merwood &amp; Asherson, 2019)</span></li><li>${esc(t("st3"))} <span class="small">(Sedgwick et al., 2019)</span></li></ul></div>
      <div class="card lic"><b>${esc(t("sources"))}</b>
        <ul class="pts small" style="margin-top:6px">
          <li><a href="https://www.hcp.med.harvard.edu/ncs/asrs.php" target="_blank" rel="noopener">ASRS v1.1 — WHO / Harvard Medical School</a></li>
          <li><a href="https://www.cdc.gov/adhd/" target="_blank" rel="noopener">CDC — ADHD</a></li>
          <li><a href="https://scholar.google.com/scholar?q=White+Shah+2011+Creative+style+and+achievement+in+adults+with+ADHD" target="_blank" rel="noopener">White &amp; Shah (2011), Creative style and achievement in adults with ADHD, <i>Personality and Individual Differences</i></a></li>
          <li><a href="https://scholar.google.com/scholar?q=Sedgwick+Merwood+Asherson+2019+positive+aspects+of+ADHD" target="_blank" rel="noopener">Sedgwick, Merwood &amp; Asherson (2019), The positive aspects of ADHD, <i>ADHD Attention Deficit and Hyperactivity Disorders</i></a></li>
        </ul><p class="small">${esc(t("medical"))}</p></div>`;
  },
  mount() {
    $("#qs").addEventListener("click", e => {
      const b = e.target.closest("[data-q]"); if (!b) return;
      const a = LS.get(K.test, []); a[Number(b.dataset.q)] = Number(b.dataset.v); LS.set(K.test, a);
      $$(`[data-q="${b.dataset.q}"]`).forEach(x => x.classList.toggle("on", x === b));
    });
    $("#seeRes").addEventListener("click", () => {
      const a = LS.get(K.test, []);
      if (a.length < 6 || a.slice(0, 6).some(v => v == null)) return toast(t("answerAll"));
      // ASRS part A: items 1-3 count from "sometimes", 4-6 from "often"; 4 or more = worth asking a professional.
      const marks = a.slice(0, 6).filter((v, i) => v >= (i < 3 ? 2 : 3)).length;
      V.test.result = marks >= 4 ? "high" : "low"; render(); $("#res")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  },
};

/* ---------------- paper kit ---------------- */
function printKit(which, paper = LS.get("tangent.study.print", { paper: "A4" }).paper) {
  const lines = n => `<div class="lines">${"<div></div>".repeat(n)}</div>`;
  const en = L === "en";
  const pages = {
    k1: `<h1>${esc(t("k1"))}</h1><table><tr><th style="text-align:left;width:30%">${esc(t("srcTitle"))}</th><td style="height:28pt"></td></tr><tr><th style="text-align:left">${esc(t("srcPage"))}</th><td style="height:22pt"></td></tr><tr><th style="text-align:left">${esc(t("topic"))}</th><td style="height:22pt"></td></tr></table>
      <h2>${en ? "3 key ideas" : "3 ideas clave"}</h2>${lines(6)}<h2>${en ? "Draw it" : "Dibujalo"}</h2><div style="border:1pt solid #555;height:170pt"></div>
      <h2>${en ? "2 questions to test myself" : "2 preguntas para probarme"}</h2>${lines(4)}<p class="foot">${esc(t("notMagic"))}</p>`,
    k2: `<h1>${esc(t("k2"))}</h1><table>${(en ? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]).map(d => `<tr><th style="width:22%;text-align:left">${d}</th><td style="height:70pt"></td></tr>`).join("")}</table>`,
    k3: `<h1>${esc(t("k3"))}</h1><p>${esc(t("progressP"))}</p><table><tr><th>${en ? "Day" : "Día"}</th>${[1, 2, 3, 4, 5].map(n => `<th>${n}<br><span style="font-weight:400;font-size:8pt">${esc(tl("scaleL", L)[n - 1])}</span></th>`).join("")}<th>${esc(t("note"))}</th></tr>${[...Array(14)].map((_, i) => `<tr><td style="height:30pt">${i + 1}</td>${"<td></td>".repeat(5)}<td style="width:35%"></td></tr>`).join("")}</table>`,
    k4: `<h1>${esc(t("k4"))}</h1><table style="height:600pt"><tr>${tl("cols", L).filter((_, i) => i !== 2 && i !== 3).map(c => `<th>${esc(c)}</th>`).join("")}</tr><tr>${"<td style='height:560pt'></td>".repeat(3)}</tr></table>`,
  };
  const list = which === "all" ? Object.keys(pages) : [which];
  printHTML(list.map(k => `<section class="pg">${printHdr()}${pages[k]}</section>`).join(""), paper);
}
V.kit = {
  html: () => `<h1>${esc(t("kit"))}</h1><p class="lead">${esc(t("kitP"))}</p>
    <div class="grid">${["k1", "k2", "k3", "k4"].map(k => `<div class="tile"><b>${esc(t(k))}</b><span>${esc(t(k + "p"))}</span><button class="btn small" data-kit="${k}" type="button">🖨️ ${esc(t("print"))}</button></div>`).join("")}</div>
    <button class="btn ghost" data-kit="all" type="button">🖨️ ${esc(t("print"))}: ${L === "en" ? "whole kit" : "kit completo"}</button>`,
  mount() { $("#view").onclick = e => { const b = e.target.closest("[data-kit]"); if (b && route === "kit") printKit(b.dataset.kit); }; },
};

/* ---------------- ideas ---------------- */
V.ideas = {
  html: () => `<h1>${esc(t("ideas"))}</h1><p class="lead">${esc(t("ideasP"))}</p>
    <textarea class="t" id="idea" maxlength="1500"></textarea><button class="btn" id="sendIdea" type="button">${esc(t("send"))}</button>`,
  mount() {
    $("#sendIdea").addEventListener("click", async () => {
      const text = $("#idea").value.trim(); if (text.length < 4) return toast(t("tooShort"));
      const btn = $("#sendIdea"); btn.disabled = true;
      try { const d = await api("/api/suggest", { kind: "idea", text: "[Study] " + text }); if (d.status === "ok") { $("#idea").value = ""; toast(t("thanks")); } else toast(d.status === "rules" ? t("blocked") : t("errAI")); }
      catch { toast(t("errAI")); }
      btn.disabled = false;
    });
  },
};

/* ---------------- account (preview) ---------------- */
V.cuenta = {
  html() {
    const code = LS.get(K.code, ""), p = LS.get(K.profile, {});
    return `<h1>${esc(t("account"))}</h1><div class="warn">${esc(t("preview"))}</div>
      <div class="card"><b>${esc(t("haveCode"))}</b>
        ${code ? `<p class="small" style="margin-top:6px">✅ ${esc(t("codeOn"))}</p><button class="btn small ghost" id="rmCode" type="button">${esc(t("removeCode"))}</button>`
        : `<form id="codeForm" class="row" style="margin-top:8px;flex-wrap:nowrap"><input class="t" name="code" autocomplete="off" autocapitalize="characters" placeholder="${esc(t("code"))}" aria-label="${esc(t("code"))}"><button class="btn small" type="submit" style="margin:0">${esc(t("useCode"))}</button></form>`}
      </div>
      <div class="two">
        <div class="iri"><b style="font-size:18px">${esc(t("planT"))}</b>
          <div style="font-size:34px;font-weight:800;letter-spacing:-1px">US$ 1 <span style="font-size:15px;font-weight:600;color:var(--soft)">${esc(t("perMonth"))}</span></div>
          <p style="font-size:14px;line-height:1.5">${t("planL")}</p><p class="small">${esc(t("arsNote"))}</p>
          <button class="btn" type="button" disabled>${esc(t("payMP"))}</button><p class="small" style="text-align:center">${esc(t("soon"))}</p></div>
        <div class="card"><b>${esc(t("schools"))}</b><p class="small" style="margin-top:6px">${esc(t("schoolsP"))}</p>
          <b>${esc(t("verifyT"))}</b><p class="small" style="margin-top:6px">${esc(t("verifyP"))}</p></div>
      </div>
      <h2>${esc(t("profile"))}</h2>
      <form class="card" id="profForm">
        <label class="f" for="pn">${esc(t("name"))}</label><input class="t" id="pn" name="name" maxlength="60" value="${esc(p.name || "")}">
        <label class="f" for="pm">${esc(t("email"))}</label><input class="t" id="pm" type="email" name="email" maxlength="120" value="${esc(p.email || "")}">
        <label class="f" for="pp">${esc(t("pass"))}</label><input class="t" id="pp" type="password" name="pass" minlength="8" autocomplete="new-password">
        <label class="f" for="pa">${esc(t("age"))}</label><select class="t" id="pa" name="age"><option value="adult">${esc(t("adult"))}</option><option value="minor" ${p.age === "minor" ? "selected" : ""}>${esc(t("minor"))}</option></select>
        <label class="f" for="pg">${esc(t("guardian"))}</label><input class="t" id="pg" type="email" name="guardian" maxlength="120" value="${esc(p.guardian || "")}">
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;font-size:13px;line-height:1.35">
          <label class="row" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" name="terms" ${p.terms ? "checked" : ""} style="width:20px;height:20px;flex-shrink:0"><span>${esc(t("must"))} <a href="#terminos">→</a></span></label>
          <label class="row" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" name="news" ${p.news ? "checked" : ""} style="width:20px;height:20px;flex-shrink:0"><span>${esc(t("optNews"))}</span></label>
          <label class="row" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" name="cookies" ${LS.get(K.cookies, { measure: false }).measure ? "checked" : ""} style="width:20px;height:20px;flex-shrink:0"><span>${esc(t("optCookies"))}</span></label>
        </div>
        <p class="small" style="margin-top:8px">${esc(t("optOut"))}</p>
        <button class="btn" type="submit">${esc(t("saveProfile"))}</button>
      </form>`;
  },
  mount() {
    $("#codeForm")?.addEventListener("submit", async e => { e.preventDefault(); if (await tryCode(e.target.code.value)) render(); });
    $("#rmCode")?.addEventListener("click", () => { LS.del(K.code); render(); });
    $("#profForm").addEventListener("submit", e => {
      e.preventDefault(); const f = new FormData(e.target);
      if (!f.get("terms")) return toast(t("needTerms"));
      if (f.get("age") === "minor" && !String(f.get("guardian") || "").includes("@")) return toast(t("needGuardian"));
      LS.set(K.profile, { name: f.get("name"), email: f.get("email"), age: f.get("age"), guardian: f.get("guardian"), terms: true, news: Boolean(f.get("news")) });
      LS.set(K.cookies, { measure: Boolean(f.get("cookies")) });
      e.target.pass.value = ""; toast(t("profSaved"), 3500);
    });
  },
};

/* ---------------- terms + cookies ---------------- */
V.terminos = {
  html() {
    const c = LS.get(K.cookies, { measure: false });
    return `<h1>${esc(t("terms"))}</h1>
      ${["tVoice", "tKeep", "tMinors", "tSource", "tAI", "tRights"].map(k => `<div class="card" style="font-size:14px;line-height:1.45">${t(k)}</div>`).join("")}
      <div class="iri"><b>${esc(t("cookiesT"))}</b><p class="small" style="margin-top:6px">${esc(t("cookiesP"))}</p>
        <label class="row" style="justify-content:space-between;font-weight:600;font-size:14px">${esc(t("cNeeded"))}<input type="checkbox" checked disabled style="width:22px;height:22px"></label>
        <label class="row" style="justify-content:space-between;font-weight:600;font-size:14px;margin-top:8px">${esc(t("cMeasure"))}<input type="checkbox" id="cm" ${c.measure ? "checked" : ""} style="width:22px;height:22px"></label></div>
      <div class="row"><button class="btn small ghost" id="export" type="button">⬇ ${esc(t("exportData"))}</button><button class="btn small ghost" id="wipe" type="button">🗑 ${esc(t("wipe"))}</button></div>
      <p class="small">${esc(t("draft"))}</p>`;
  },
  mount() {
    $("#cm").addEventListener("change", e => LS.set(K.cookies, { measure: e.target.checked }));
    $("#export").addEventListener("click", () => {
      const data = {}; for (const [n, k] of Object.entries(K)) if (n !== "code") data[n] = LS.get(k, null);
      download("tangent-mis-datos.json", JSON.stringify(data, null, 2), "application/json");
    });
    $("#wipe").addEventListener("click", async () => { if (await confirmIt(t("wipeSure"))) { Object.values(K).forEach(k => LS.del(k)); LS.del("tangent.study.view"); LS.del("tangent.study.print"); st.source = { title: "", author: "", page: "" }; st.item = null; toast(t("wiped")); render(); } });
  },
};

go();
scheduleNotifs();
})();
