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
  profile: "tangent.study.profile", cookies: "tangent.study.cookies", code: "tangent.access", source: "tangent.study.source", test: "tangent.study.test", tags: "tangent.study.tags", signup: "tangent.study.signup", avatar: "tangent.study.avatar" };
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
  heroT1: ["Decí un tema en voz alta.", "Say a topic out loud."], heroT2: ["Te lo explico fácil.", "I'll explain it simply."],
  heroNote: ["¡empezá acá!", "start here!"], organizer: ["Organizador", "Organizer"], organizerP: ["Contá todo lo que tenés que hacer y te lo ordeno en burbujas.", "Say everything you have to do and I'll sort it into bubbles."], more: ["Más", "More"],
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
  tipT: ["Para que te entienda bien", "So I understand you well"],
  tips: [["Buscá un lugar sin ruido (tele, música, gente hablando).", "Poné el celu a un palmo de la boca.", "Hablá despacio y claro, como si dictaras.", "Las palabras raras o nombres, decilos dos veces o deletrealos.", "Mirá la barrita: si está verde, te escucho bien."],
         ["Find a quiet place (no TV, music or people talking).", "Hold the phone a hand's width from your mouth.", "Speak slowly and clearly, as if dictating.", "Say unusual words or names twice, or spell them.", "Watch the bar: if it's green, I hear you well."]],
  louder: ["más cerca o más fuerte", "closer or louder"], hearOk: ["¡te escucho bien!", "I hear you well!"],
  unclear: ["No te entendí bien y no quiero inventar. Grabá de nuevo más despacio y en un lugar con menos ruido, o corregí el texto (las partes marcadas con [?]).", "I didn't understand you well and I don't want to make things up. Record again more slowly in a quieter place, or fix the text (the parts marked [?])."],
  manyQ: ["Hay varias partes que no se entendieron [?]. Corregilas antes de seguir.", "Several parts weren't understood [?]. Fix them before going on."],
  recAgain: ["Grabar de nuevo", "Record again"],
  photoTake: ["Sacar o elegir foto", "Take or choose photo"], photoAgain: ["Otra foto", "Another photo"],
  photoWarn: ["Sacale foto solo a la hoja, sin caras ni datos personales.", "Only photograph the sheet: no faces or personal details."],
  s2p: ["La idea es que estudies en voz alta: leé tu fuente y explicala con tus palabras, como si se la enseñaras a alguien. Podés trabarte o ir y volver: no pasa nada.", "The idea is to study out loud: read your source and explain it in your own words, as if teaching someone. Stumbling or going back and forth is fine."],
  listenT: ["Escuchá tu grabación", "Listen to your recording"], part: ["Parte", "Part"],
  audioGone: ["Cuando des OK, tu audio desaparece y queda solo el texto.", "Once you press OK, your audio disappears and only the text stays."], okGo: ["OK, seguir", "OK, continue"],
  mixedT: ["Esto parece de otro tema", "This seems to be from another subject"], goBackT: ["Volvé a tu fuente a buscar", "Go back to your source and look for"],
  checkT: ["Revisión con fuentes de internet", "Check against web sources"], checking: ["Revisando lo que dijiste con fuentes de internet…", "Checking what you said against web sources…"],
  checkOk: ["No encontré errores ni contradicciones. Igual, confirmalo con tu fuente.", "I found no mistakes or contradictions. Still, confirm it with your source."],
  checkSaid: ["Dijiste", "You said"], checkFix: ["Lo correcto sería", "It should be"], checkWarn: ["La IA también se equivoca: confirmalo con tu libro o con tu profe.", "AI makes mistakes too: confirm it with your book or teacher."],
  checkFail: ["No pude revisar ahora.", "I couldn't check right now."], retry: ["Reintentar", "Retry"],
  quizT: ["Mini examen (opcional)", "Mini quiz (optional)"], quizP: ["3 preguntas simples sobre lo que explicaste. Si lo entendiste, deberías poder responderlas.", "3 simple questions about what you explained. If you understood it, you should be able to answer them."],
  quizRight: ["¡Bien!", "Right!"], quizWrong: ["Casi. La correcta está marcada: volvé a tu fuente a mirarlo.", "Almost. The right one is marked: go back to your source to check it."],
  quizScore: ["Acertaste", "You got"], quizOf: ["de", "of"], quizAgain: ["Hacerlo de nuevo", "Try again"],
  mineT: ["Ahora vos: tu resumen", "Now you: your summary"], mineP: ["Tangent ordenó lo que dijiste. El resumen que sirve para estudiar es el tuyo: escribilo con tus palabras después de volver a la fuente.", "Tangent ordered what you said. The summary that helps you study is yours: write it in your own words after going back to the source."],
  mineSaved: ["Guardado", "Saved"], mineTitle: ["Mi resumen", "My summary"],
  guide: ["Cómo usar", "How to use"], tGuide: ["Cómo estudiar con Tangent (y por qué no machetes).", "How to study with Tangent (and why not cheat-sheets)."],
  guideLink: ["¿Primera vez? Mirá cómo se usa", "First time? See how it works"],
  tapRec: ["Tocá para grabar", "Tap to record"], tapStop: ["Terminar", "Finish"], recording: ["Grabando…", "Recording…"],
  pieces: ["partes pasadas a texto", "pieces turned into text"], working: ["Pasando a texto…", "Turning into text…"],
  orPhoto: ["O sacale una foto a la hoja", "Or snap a photo of the sheet"], orType: ["O escribilo", "Or type it"],
  photoOk: ["Foto lista. Se usa solo para este resumen.", "Photo ready. It's only used for this summary."], removePhoto: ["Quitar foto", "Remove photo"],
  s3: ["¿Está bien lo que dijiste?", "Is this what you said?"], s3p: ["Podés corregir el texto antes de armar el resumen. El audio ya se borró.", "You can fix the text before making the summary. The audio is already gone."],
  make: ["Armar mi resumen", "Make my summary"], making: ["Armando tu resumen…", "Making your summary…"],
  needText: ["Grabá, escribí o sacá una foto primero.", "Record, type or take a photo first."],
  basedOn: ["Basado en la fuente que citaste", "Based on the source you cited"],
  notMagic: ["Tangent resume lo que dijiste. No reemplaza tu libro: revisalo con tu fuente.", "Tangent summarises what you said. It doesn't replace your book: check it against your source."],
  plain: ["Lo que explicaste, ordenado", "What you explained, in order"], keyIdeas: ["Ideas clave", "Key ideas"], images: ["Para acordarte", "To remember it"],
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
  printWeek: ["Imprimir semana", "Print week"], printMonth: ["Imprimir mes", "Print month"], tag: ["Etiqueta", "Label"],
  tagsEdit: ["Etiqueta nueva", "New label"], tagName: ["Nombre (ej.: Mate, Inglés, Fútbol)", "Name (e.g. Maths, English, Football)"], upcoming: ["Lo que viene", "Coming up"], past: ["Ya pasó", "Past"],
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
  signupT: ["Crear cuenta", "Create account"], whoUses: ["¿Quién va a usar Tangent?", "Who is going to use Tangent?"],
  sendReq: ["Enviar solicitud", "Send request"], reqSaved: ["Solicitud lista (vista previa). Cuando conectemos las cuentas, se envía de verdad.", "Request ready (preview). Once accounts are connected, it gets sent for real."],
  tKids: ["<b>Protección de chicos.</b> No hay chat ni mensajes entre usuarios, ni perfiles públicos, ni publicidad. Los menores de 13 no tienen usuario propio: entran desde la cuenta de un adulto, con PIN. De 13 a 17, un adulto aprueba la cuenta y puede ver todo. Filtramos contenido en lo que se dice y en lo que responde la IA. Las fotos son solo de hojas, sin caras.", "<b>Child protection.</b> No chat or messages between users, no public profiles, no ads. Under-13s have no login of their own: they use an adult's account, with a PIN. From 13 to 17, an adult approves the account and can see everything. We filter content in what's said and in what the AI answers. Photos are only of sheets, no faces."],
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
  // paid learning tools
  map: ["Mapa de temas", "Topic map"], tMap: ["Tus temas conectados.", "Your topics, connected."],
  mapP: ["Cada círculo es un tema que estudiaste, agrupado por tu fuente. Las líneas punteadas unen temas que comparten ideas.", "Each circle is a topic you studied, grouped by your source. Dotted lines join topics that share ideas."],
  mapLinks: ["Conexiones entre temas", "Links between topics"], mapNoLinks: ["Todavía no hay temas que compartan ideas. Estudiá más y van a aparecer.", "No topics share ideas yet. Study more and they'll show up."],
  lockT: ["Con el plan pago", "With the paid plan"],
  lockL: ["📅 Agendar el examen y que tu tema aparezca ese día<br>🔁 Repasos a 1, 3 y 7 días con el mini examen<br>⏱️ Bloques cortos de lectura con timer<br>🧒 Explicalo como a un chico de 8 años<br>🗺️ Mapa de tus temas<br>🤔 Antes y después: qué creías saber y qué aprendiste", "📅 Schedule the exam and see your topic on that day<br>🔁 Reviews at 1, 3 and 7 days with the mini quiz<br>⏱️ Short reading blocks with a timer<br>🧒 Explain it like to an 8-year-old<br>🗺️ Map of your topics<br>🤔 Before and after: what you thought you knew and what you learned"],
  goalL: ["Meta chica de hoy", "Today's small goal"], goalPh: ["Ej.: páginas 12 a 14", "E.g. pages 12 to 14"],
  beforeL: ["Antes de leer: ¿qué creés que ya sabés del tema?", "Before reading: what do you think you already know?"], beforePh: ["Lo que se te ocurra, aunque sea poco o esté mal.", "Whatever comes to mind, even if it's little or wrong."],
  blkT: ["Bloque de lectura", "Reading block"], blkP: ["Leé tu fuente con el timer. Cuando suene, pausa corta y después grabá.", "Read your source with the timer. When it rings, take a short break and then record."],
  blkGo: ["Empezar a leer", "Start reading"], blkStop: ["Parar", "Stop"], blkDone: ["¡Bloque terminado! Pausa de 3 minutos: tomá agua, estirate. Después grabá.", "Block done! 3-minute break: drink water, stretch. Then record."],
  planT2: ["En tu agenda", "In your planner"], planNone: ["Este tema todavía no está en tu agenda.", "This topic isn't in your planner yet."],
  schedBtn: ["Agendar examen o repaso", "Schedule exam or review"], icsAll: ["Pasar a Google Calendar (.ics)", "Send to Google Calendar (.ics)"], seeAgenda: ["Ver en la agenda", "See in planner"],
  gcalHint: ["Google: tocá \"Google\" en cada fecha, o bajá el archivo .ics y abrilo con Google Calendar para pasar todas juntas.", "Google: tap \"Google\" on each date, or download the .ics file and open it with Google Calendar to add them all at once."],
  schedWhat: ["¿Qué querés agendar?", "What do you want to schedule?"], kExam: ["📝 Examen o prueba", "📝 Exam or test"], kReview: ["🔁 Solo un repaso ese día", "🔁 Just a review that day"],
  schedName: ["Nombre (materia o tema)", "Name (subject or topic)"], schedBefore: ["Sumar repasos 7, 3 y 1 día antes del examen", "Add reviews 7, 3 and 1 day before the exam"],
  schedDone: ["Listo, quedó en tu agenda.", "Done, it's in your planner."], reviewW: ["Repasar", "Review"], examW: ["Examen", "Exam"],
  spacedOn: ["Te agendé repasos para dentro de 1, 3 y 7 días.", "I scheduled reviews in 1, 3 and 7 days."],
  openTopic: ["Abrir tema", "Open topic"], revGo: ["Repasar ahora", "Review now"], revDone: ["Repasado", "Reviewed"],
  revNow: ["Repaso de hoy", "Today's review"], rev1: ["Contalo en voz alta sin mirar, como te acuerdes.", "Say it out loud without looking, as you remember it."], rev2: ["Hacé el mini examen de abajo.", "Take the mini quiz below."], rev3: ["Recién ahí mirá tu resumen y lo que te marcó Tangent.", "Only then look at your summary and what Tangent flagged."],
  revCount: ["Repasado", "Reviewed"], times: ["veces", "times"],
  dueT: ["Para repasar hoy", "To review today"], examsT: ["Próximos exámenes", "Upcoming exams"], daysLeft: ["faltan", "in"], dayW: ["días", "days"], todayW: ["¡hoy!", "today!"],
  topicGone: ["Ese tema ya no está en tu carpeta.", "That topic is no longer in your folder."],
  simpleT: ["Explicalo como a un chico de 8 años", "Explain it like to an 8-year-old"],
  simpleP: ["Escribilo (o dictalo con el micrófono del teclado) con palabras muy simples. Si no te sale, es que hay algo que todavía no entendiste. Tangent no lo escribe por vos: te da pistas.", "Write it (or dictate it with your keyboard mic) in very simple words. If you can't, there's something you haven't understood yet. Tangent won't write it for you: it gives you hints."],
  simpleGo: ["Ver cómo me fue", "See how I did"], lvClear: ["¡Clarísimo! Lo entendiste.", "Crystal clear! You got it."], lvAlmost: ["Casi. Te falta poquito.", "Almost. Just a little missing."], lvNot: ["Todavía no. Volvé a tu fuente y probá de nuevo.", "Not yet. Go back to your source and try again."],
  hardW: ["Palabras difíciles para un chico", "Words too hard for a kid"], missingW: ["Pistas de lo que falta", "Hints of what's missing"],
  baT: ["Antes y después", "Before and after"], baBefore: ["Lo que creía saber", "What I thought I knew"], baAfter: ["Lo que aprendí (tu resumen)", "What I learned (your summary)"], baEmpty: ["Escribí tu resumen arriba y comparalo.", "Write your summary above and compare."],
  avT: ["Tu personaje", "Your character"], avP: ["Elegí quién sos en Tangent. Nada de fotos: solo tu personaje.", "Choose who you are in Tangent. No photos: just your character."], avColor: ["Color de fondo", "Background colour"], avNick: ["Apodo (opcional)", "Nickname (optional)"], avSaved: ["¡Personaje guardado!", "Character saved!"],
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

/* ---------------- hand-drawn icons ---------------- */
const IC = {
  home: '<path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M10 20v-5.5h4V20"/>',
  study: '<path d="M12 3.2c-1.7 0-3 1.3-3 3V12a3 3 0 0 0 6 0V6.2c0-1.7-1.3-3-3-3zM5.2 11.3a6.8 6.8 0 0 0 13.6 0M12 18.3v3"/>',
  folder: '<path d="M3 6.3h6.2l2 2.1H21v10.8H3z"/>',
  board: '<path d="M3.2 4h5v16h-5zM10 4h5v10.5h-5zM16.8 4H21v7h-4.2z"/>',
  agenda: '<path d="M4 5.2h16V20H4zM4 10h16M8.2 3v4M15.8 3v4M8 14h2M14 14h2M8 17h2"/>',
  progress: '<path d="M4 20V4.2M4 20h16.2M7.5 15.5l4.2-5 3.1 3 5-6.6"/>',
  test: '<path d="M9.5 20.5v-3.1C6.5 16 5 13.6 5 11a7 7 0 0 1 14 0c0 .9-.2 1.7-.5 2.4l1.5 2.4h-2v2.7h-3.2v2"/><path d="M10 9.5c.4-1.2 2.6-1.5 3.2-.2.5 1.1-.6 1.6-1.2 2.1v.9"/>',
  kit: '<circle cx="6" cy="7" r="2.6"/><circle cx="6" cy="17" r="2.6"/><path d="M8.2 8.4 20 17.5M8.2 15.6 20 6.5"/>',
  ideas: '<path d="M9.2 18.2h5.6M10.2 21h3.6M12 3a6 6 0 0 0-4 10.4c.8.8 1.1 1.6 1.2 2.6h5.6c.1-1 .4-1.8 1.2-2.6A6 6 0 0 0 12 3z"/>',
  account: '<circle cx="12" cy="8" r="4"/><path d="M4.2 21c1-4.2 4-6.2 7.8-6.2s6.8 2 7.8 6.2"/>',
  terms: '<path d="M5 11h14v10H5zM8 11V7.3a4 4 0 0 1 8 0V11M12 15v2.5"/>',
  more: '<path d="M4 7h16M4 12h16M4 17h11"/>',
  map: '<path d="M3.5 6.5 9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5L3.5 20zM9 4v13.5M15 6.5V20"/>',
  guide: '<path d="M4 5.5c2.7-1 5.3-1 8 .8 2.7-1.8 5.3-1.8 8-.8V19c-2.7-1-5.3-1-8 .8-2.7-1.8-5.3-1.8-8-.8zM12 6.3v13.5"/>',
};
const ic = (k, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><g>${IC[k] || IC.more}</g></svg>`;
const squiggle = () => `<svg class="squiggle" viewBox="0 0 120 10" aria-hidden="true"><path d="M2 6c8-5 14 4 22 0s14-5 22 0 14 4 22 0 14-5 22 0 14 4 22 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;

/* ---------------- router ---------------- */
const NAV = [["inicio", "home"], ["guia", "guide"], ["study", "study"], ["carpeta", "folder"], ["mapa", "map"], ["tablero", "board"], ["agenda", "agenda"],
  ["progreso", "progress"], ["test", "test"], ["kit", "kit"], ["ideas", "ideas"], ["cuenta", "account"], ["terminos", "terms"]];
const TABS = ["inicio", "study", "tablero", "agenda", "mas"];
let route = "inicio", arg = "";
const V = {}; // views: name -> {html(), mount?()}
function render() {
  document.documentElement.lang = L;
  $("#langBtn").textContent = L === "en" ? "ES" : "EN";
  { const me = $("#me"); if (me) me.innerHTML = avatarHTML(myAvatar(), 34); }
  $("#side").innerHTML = NAV.map(([r, k]) => `<a href="#${r}" class="${r === route ? "on" : ""}">${ic(k)}${esc(t(k))}</a>`).join("");
  const inMore = !["inicio", "study", "tablero", "agenda"].includes(route);
  $("#tabs").innerHTML = [...NAV.filter(n => TABS.includes(n[0])), ["mas", "more"]].map(([r, k]) => `<a href="#${r}" class="${r === route || (r === "mas" && inMore) ? "on" : ""}">${ic(k)}${esc(t(k))}</a>`).join("");
  const v = V[route] || V.inicio;
  $("#view").innerHTML = v.html();
  v.mount?.();
  document.title = `Tangent · ${t((NAV.find(n => n[0] === route) || ["", "home"])[1])}`;
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
const TILES = [["guia", "tGuide"], ["study", "tStudy"], ["carpeta", "tFolder"], ["mapa", "tMap"], ["tablero", "tBoard"], ["agenda", "tAgenda"], ["progreso", "tProgress"], ["test", "tTest"], ["kit", "tKit"], ["ideas", "tIdeas"], ["cuenta", "tAccount"], ["terminos", "tTerms"]];
const navKey = r => NAV.find(n => n[0] === r)[1];
V.inicio = {
  html: () => `
  <div class="iri hero">
    <img class="skater" src="/assets/logo-skater.png" alt="">
    <h1>${esc(t("heroT1"))} <span class="mk">${esc(t("heroT2"))}</span></h1>
    ${squiggle()}
    <p class="lead">${esc(t("heroP"))}</p>
    <span class="note hand" aria-hidden="true">${esc(t("heroNote"))} ↓</span>
    <a class="btn" href="#study">${esc(t("start"))}</a>
    <p style="position:relative;margin:0 0 8px"><a href="#guia">📖 ${esc(t("guideLink"))}</a></p>
    <div class="small" style="position:relative">${esc(LS.get(K.code, "") ? t("codeOn") : t("codeOff"))} ${LS.get(K.code, "") ? "" : `<a href="#cuenta">${esc(t("haveCode"))}</a>`}</div>
  </div>
  ${homeDue()}
  <div class="grid">
    ${TILES.map(([r, d]) => `<a class="tile" href="#${r}">${ic(navKey(r))}<b>${esc(t(navKey(r)))}</b><span>${esc(t(d))}</span></a>`).join("")}
  </div>`,
};
V.guia = {
  html: () => L === "en" ? `
  <h1>How to study with <span class="mk">Tangent</span></h1>${squiggle()}
  <p class="lead">Any AI can give you a summary of a book. Studying from summaries doesn't work: you lose the context and the details, and the details are what let you really explain a topic. Tangent is not a cheat-sheet machine. It teaches you to study.</p>
  <div class="card"><ol class="pts" style="line-height:1.7">
    <li><b>Read your source.</b> The whole part, not a summary. Write down the book and pages in Tangent.</li>
    <li><b>Study out loud.</b> Explain it in your own words, as if teaching someone. Up to 5 or 10 minutes.</li>
    <li><b>Listen to yourself</b> if you want, then press OK: the audio is deleted and only the text stays.</li>
    <li><b>Tangent orders what you said</b>, flags what belongs to another subject and checks it against web sources to spot mistakes or contradictions.</li>
    <li><b>Go back to the source</b> to look for the details Tangent points out (examples, dates, causes, steps).</li>
    <li><b>Write your own summary</b> in Tangent, in your words. That is the summary that helps you learn.</li>
    <li><b>Test yourself</b> with the questions and review on another day. Print it if paper works better for you.</li>
  </ol></div>
  <div class="iri"><b>Why it works</b><p class="small" style="margin-top:6px">Explaining out loud, testing yourself and spacing your reviews are among the best-supported study techniques (Dunlosky et al., 2013). Writing your own summary after re-reading forces you to choose what matters, which is learning.</p></div>
  <a class="btn" href="#study">Start a topic</a>` : `
  <h1>Cómo estudiar con <span class="mk">Tangent</span></h1>${squiggle()}
  <p class="lead">Cualquier IA te hace un resumen de un libro. Pero estudiar de resúmenes (machetes) no sirve: perdés el contexto y los detalles, y los detalles son los que te dejan contar bien un tema. Tangent no hace machetes: te enseña a estudiar.</p>
  <div class="card"><ol class="pts" style="line-height:1.7">
    <li><b>Leé tu fuente.</b> La parte completa, no un resumen. Anotá en Tangent el libro y las páginas.</li>
    <li><b>Estudiá en voz alta.</b> Explicalo con tus palabras, como si se lo enseñaras a alguien. Hasta 5 o 10 minutos.</li>
    <li><b>Escuchate</b> si querés, y dale OK: el audio se borra y queda solo el texto.</li>
    <li><b>Tangent ordena lo que dijiste</b>, te marca lo que es de otro tema y lo revisa con fuentes de internet para encontrar errores o contradicciones.</li>
    <li><b>Volvé a la fuente</b> a buscar los detalles que te marca (ejemplos, fechas, causas, pasos).</li>
    <li><b>Escribí tu propio resumen</b> en Tangent, con tus palabras. Ese es el resumen que te sirve para aprender.</li>
    <li><b>Probate</b> con las preguntas y repasá otro día. Si te sirve el papel, imprimilo.</li>
  </ol></div>
  <div class="iri"><b>Por qué funciona</b><p class="small" style="margin-top:6px">Explicar en voz alta, probarse con preguntas y repasar en días distintos están entre las técnicas de estudio con más evidencia (Dunlosky y otros, 2013). Escribir tu resumen después de releer te obliga a elegir lo importante, y eso es aprender.</p></div>
  <a class="btn" href="#study">Empezar un tema</a>`,
};
V.mas = {
  html: () => `<h1>${esc(t("more"))}</h1><div class="menu">${TILES.filter(([r]) => !["study", "tablero", "agenda"].includes(r)).map(([r, d]) => `<a href="#${r}">${ic(navKey(r))}<div><b>${esc(t(navKey(r)))}</b><span>${esc(t(d))}</span></div></a>`).join("")}
    <a href="/organizer/">${ic("ideas")}<div><b>${esc(t("organizer"))}</b><span>${esc(t("organizerP"))}</span></div></a></div>`,
};

/* ---------------- Study ---------------- */
const SEG_MS = 60000;
const st = { audio: [], step: 1, source: LS.get(K.source, { title: "", author: "", page: "" }), topic: "", minutes: 5, parts: [], image: null, imageUrl: null, transcript: "", busy: false, item: null, error: "", goal: "", before: "", review: null };
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
        ${paid() ? `<label class="f" for="sG">🎯 ${esc(t("goalL"))}</label><input class="t" id="sG" name="goal" maxlength="80" placeholder="${esc(t("goalPh"))}" value="${esc(st.goal)}">
        <label class="f" for="sB">🤔 ${esc(t("beforeL"))}</label><textarea class="t" id="sB" name="before" maxlength="1500" placeholder="${esc(t("beforePh"))}" style="min-height:80px">${esc(st.before)}</textarea>` : ""}
        <label class="f">${esc(t("howLong"))}</label>
        <div class="seg" id="mins">${[5, 10].map(m => `<button type="button" data-m="${m}" class="${st.minutes === m ? "on" : ""}">${m} ${esc(t("min"))}</button>`).join("")}</div>
        <button class="btn" type="submit">${esc(t("next"))}</button>
      </form>
      ${paid() ? "" : lockAll()}
      <div class="card"><b>${esc(t("why"))}</b><p class="small" style="margin-top:6px">${esc(t("whyP"))}<br>Dunlosky et al. (2013), <i>Psychological Science in the Public Interest</i>. MacLeod et al. (2010), <i>J. Exp. Psychology: Learning, Memory, and Cognition</i>.</p></div>`;
    if (st.step === 2) {
      const on = Boolean(rec), done = st.parts.filter(p => p != null).length;
      return `
      <h1>${esc(t("s2"))}</h1>${stepsBar(2)}
      ${srcLine(st.source)}
      ${st.goal ? `<div class="small" style="margin-top:6px">🎯 <b>${esc(t("goalL"))}:</b> ${esc(st.goal)}</div>` : ""}
      ${!on && paid() ? blockCard() : ""}
      <p class="lead" style="margin-top:10px">${esc(t("s2p"))}</p>
      ${on ? "" : `<div class="tip"><span class="hand">${esc(t("tipT"))}</span><ol>${tl("tips", L).map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>`}
      <div class="rec">
        <button class="recbtn ${on ? "on" : ""}" id="recBtn" type="button">${esc(on ? t("tapStop") : t("tapRec"))}</button>
        <div class="clock" id="clock">${on ? "0:00" : `${st.minutes}:00`}</div>
        <div class="bar"><i id="recBar"></i></div>
        ${on ? `<div class="lvl" aria-hidden="true"><i id="lvl"></i></div><div class="lvlhint hand" id="lvlHint"></div>` : ""}
        <div class="small" id="recInfo">${on ? esc(t("recording")) : done ? `${done} ${esc(t("pieces"))}` : ""}</div>
      </div>
      ${on ? "" : `
      <div class="two">
        <div class="card"><b>📷 ${esc(t("orPhoto"))}</b>
          <div class="small" style="margin-top:6px">${esc(t("photoWarn"))}</div>
          <input type="file" id="photo" accept="image/*" capture="environment" class="vh">
          <label for="photo" class="btn small ghost" style="margin-top:10px;cursor:pointer">📷 ${esc(t(st.imageUrl ? "photoAgain" : "photoTake"))}</label>
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
      ${st.audio.some(Boolean) ? `<div class="card"><b>🎧 ${esc(t("listenT"))}</b>${st.audio.map((u, i) => u ? `<div style="margin-top:8px"><div class="small">${esc(t("part"))} ${i + 1}</div><audio controls preload="metadata" src="${u}" style="width:100%"></audio></div>` : "").join("")}<p class="small" style="margin-top:8px">${esc(t("audioGone"))}</p></div>` : ""}
      <textarea class="t" id="tr" maxlength="12000" style="min-height:200px">${esc(st.transcript)}</textarea>
      ${st.error ? `<div class="warn" style="margin-top:10px">${st.error}</div>` : ""}
      ${!st.error && (st.transcript.match(/\[\?\]/g) || []).length >= 3 ? `<div class="warn" style="margin-top:10px">${esc(t("manyQ"))}</div>` : ""}
      <button class="btn" id="make" type="button" ${st.busy ? "disabled" : ""}>${esc(st.busy ? t("making") : t("make"))}</button>
      <button class="btn ghost" id="back2" type="button" ${st.busy ? "disabled" : ""}>🎙️ ${esc(t("recAgain"))}</button>`;
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
      st.source = { title: f.title.trim(), author: f.author.trim(), page: f.page.trim() }; st.topic = f.topic.trim(); st.goal = (f.goal || "").trim(); st.before = (f.before || "").trim();
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
    $("#blkMins")?.addEventListener("click", e => { const b = e.target.closest("[data-bm]"); if (!b) return; blk.mins = Number(b.dataset.bm); $$("#blkMins button").forEach(x => x.classList.toggle("on", x === b)); });
    $("#blkGo")?.addEventListener("click", () => { blk.end = Date.now() + blk.mins * 60e3; blk.done = false; clearInterval(blk.iv); blk.iv = setInterval(blkTick, 500); render(); blkTick(); });
    $("#blkStop")?.addEventListener("click", () => { clearInterval(blk.iv); blk.iv = null; blk.end = 0; render(); });
    if (blk.end) blkTick();
    $("#back2")?.addEventListener("click", () => { dropAudio(); st.step = 2; render(); });
    $("#tr")?.addEventListener("input", e => { st.transcript = e.target.value; });
    $("#make")?.addEventListener("click", makeSummary);
    $("#speak")?.addEventListener("click", () => speak(st.item));
    $("#printOne")?.addEventListener("click", () => printItems([st.item], "A4", L, false));
    $("#again")?.addEventListener("click", () => { Object.assign(st, { step: 1, topic: "", goal: "", before: "", review: null, parts: [], image: null, imageUrl: null, transcript: "", item: null, error: "" }); location.hash = "study"; render(); });
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
      ${r.mixed?.[lang]?.length ? `<div class="warn" style="margin-top:10px;background:#FFE9E3"><b>🔀 ${esc(tl("mixedT", lang))}:</b><ul class="pts">${r.mixed[lang].map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
      ${r.goBack?.[lang]?.length ? `<div class="tip" style="margin-top:10px"><span class="hand">📖 ${esc(tl("goBackT", lang))}</span><ul class="pts">${r.goBack[lang].map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
    </div>`;
  const ck = it.check;
  const checkBox = !it.transcript ? "" : `<div class="card" id="checkBox"><b>🔎 ${esc(t("checkT"))}</b>
    ${!ck || ck.pending ? `<p class="small" style="margin-top:6px">${esc(t("checking"))}</p>`
      : ck.failed ? `<p class="small" style="margin-top:6px">${esc(t("checkFail"))} <button class="btn small ghost" id="reCheck" type="button">${esc(t("retry"))}</button></p>`
      : ck.issues.length ? `<ul class="pts" style="margin-top:6px">${ck.issues.map(i => `<li><span class="small">${esc(t("checkSaid"))}: «${esc(i.said)}»</span><br><b>${esc(t("checkFix"))}:</b> ${esc(i.fix[L] || i.fix.es)}</li>`).join("")}</ul>`
      : `<p class="small ok" style="margin-top:6px;padding:8px;border-radius:10px">✅ ${esc(t("checkOk"))}</p>`}
    ${ck?.sources?.length ? `<p class="small lic">${esc(t("sources"))}: ${ck.sources.map(x => `<a href="${esc(x.uri)}" target="_blank" rel="noopener">${esc(x.title || "web")}</a>`).join(" · ")}</p>` : ""}
    <p class="small">${esc(t("checkWarn"))}</p></div>`;
  const qz = r.quiz || [], ans = it.quizAns || [];
  const quiz = !qz.length ? "" : `<details class="card" id="quiz" ${ans.length || st.review === it.id ? "open" : ""}><summary style="cursor:pointer"><b>🧩 ${esc(t("quizT"))}</b></summary><p class="small" style="margin-top:6px">${esc(t("quizP"))}</p>
    ${qz.map((q, qi) => { const a = ans[qi]; return `<div class="q"><p>${qi + 1}. ${esc(q.q[L] || q.q.es)}</p><div class="opts">${(q.options[L]?.length === 3 ? q.options[L] : q.options.es).map((o, oi) => {
      const cls = a == null ? "" : oi === q.answer ? "right" : oi === a ? "wrong" : "";
      return `<button type="button" data-qq="${qi}" data-qo="${oi}" class="${cls}" ${a != null ? "disabled" : ""}>${esc(o)}</button>`; }).join("")}</div>
      ${a != null ? `<div class="small" style="margin-top:6px">${a === q.answer ? "✅ " + esc(t("quizRight")) : "↩️ " + esc(t("quizWrong"))}</div>` : ""}</div>`; }).join("")}
    ${ans.filter(x => x != null).length === qz.length ? `<p><b>${esc(t("quizScore"))} ${qz.filter((q, i) => ans[i] === q.answer).length} ${esc(t("quizOf"))} ${qz.length}</b> <button class="btn small ghost" id="quizReset" type="button">${esc(t("quizAgain"))}</button></p>` : ""}
  </details>`;
  const mine = `<div class="iri"><span class="hand" style="font-size:28px">✍️ ${esc(t("mineT"))}</span><p class="small" style="margin:4px 0 8px">${esc(t("mineP"))}</p>
    <textarea class="t" id="mine" maxlength="6000" data-id="${it.id}">${esc(it.mine || "")}</textarea><div class="small" id="mineSaved" style="min-height:16px"></div></div>`;
  const due = st.review === it.id ? `<div class="tip"><span class="hand">🔁 ${esc(t("revNow"))}</span><ol class="pts"><li>${esc(t("rev1"))}</li><li>${esc(t("rev2"))}</li><li>${esc(t("rev3"))}</li></ol></div>` : "";
  const extras = paid() ? `${planBox(it)}${simpleBox(it)}` : lockAll();
  const ba = it.before ? `<div class="card"><b>🤔 ${esc(t("baT"))}</b><div class="two" style="margin-top:6px"><div><div class="small"><b>${esc(t("baBefore"))}</b></div><p>${esc(it.before)}</p></div><div><div class="small"><b>${esc(t("baAfter"))}</b></div><p>${it.mine ? esc(it.mine) : `<span class="small">${esc(t("baEmpty"))}</span>`}</p></div></div></div>` : "";
  return `${due}
    <div class="seg" id="viewSeg" style="max-width:320px;margin:4px 0 10px">${[["es", "ES"], ["en", "EN"], ["both", "ES + EN"]].map(([k, l]) => `<button type="button" data-v="${k}" class="${view === k ? "on" : ""}">${l}</button>`).join("")}</div>
    ${srcLine(it.source)}${it.goal ? `<div class="small">🎯 ${esc(it.goal)}</div>` : ""}
    <div class="${langs.length > 1 ? "two" : ""}">${langs.map(block).join("")}</div>
    ${r.concepts?.length ? `<b>${esc(t("images"))}</b><div class="concepts" style="margin:8px 0">${r.concepts.map((c, i) => {
      const p = it.photos?.[i];
      return `<div class="concept"><div class="ph">${p ? `<img src="${esc(p.src)}" alt="${esc(p.alt || c.en)}" loading="lazy">` : `<span class="hand" style="font-size:54px;color:var(--blue)">${esc((c[L] || c.es || "?").slice(0, 1).toUpperCase())}</span>`}</div><div class="c">${esc(c[L] || c.es)}<small>${esc(c[L === "en" ? "es" : "en"])}</small></div>${p ? `<div class="credit lic"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.credit)} · ${esc(p.source)}</a></div>` : ""}</div>`;
    }).join("")}</div>` : ""}
    ${checkBox}${quiz}${mine}${ba}${extras}`;
}
function mountResult() {
  $("#viewSeg")?.addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (!b) return; LS.set("tangent.study.view", b.dataset.v); render(); });
  const m = $("#mine");
  m?.addEventListener("input", () => { clearTimeout(m.t); m.t = setTimeout(() => { patchItem(m.dataset.id, { mine: m.value }); const el = $("#mineSaved"); if (el) el.textContent = "✓ " + t("mineSaved"); }, 500); });
  $("#quiz")?.addEventListener("click", e => {
    const id = m?.dataset.id, cur = folder().find(x => x.id === id); if (!cur) return;
    if (e.target.closest("#quizReset")) { patchItem(id, { quizAns: [] }); return render(); }
    const b = e.target.closest("[data-qq]"); if (!b) return;
    const ans = [...(cur.quizAns || [])]; ans[Number(b.dataset.qq)] = Number(b.dataset.qo);
    const keep = m.value; patchItem(id, { quizAns: ans }); render(); const mm = $("#mine"); if (mm) mm.value = keep;
  });
  const keepRender = () => { const keep = $("#mine")?.value; render(); const mm = $("#mine"); if (mm && keep != null) mm.value = keep; };
  $("#schedIt")?.addEventListener("click", async () => { const it = folder().find(x => x.id === m?.dataset.id); if (it && await scheduleItem(it)) keepRender(); });
  $("#icsIt")?.addEventListener("click", () => { const id = m?.dataset.id, evs = agenda().filter(e => e.item === id); if (evs.length) icsFile(evs, `tangent-${id}.ics`); });
  const sp = $("#simple");
  sp?.addEventListener("input", () => { clearTimeout(sp.t); sp.t = setTimeout(() => patchItem(m.dataset.id, { simple: sp.value }), 500); });
  $("#simpleGo")?.addEventListener("click", async () => {
    const id = m.dataset.id, it = folder().find(x => x.id === id), txt = sp.value.trim();
    if (!it) return; if (txt.length < 20) return toast(t("tooShort"));
    patchItem(id, { simple: txt }); simpleBusy.add(id); keepRender();
    let d; try { d = await api("/api/study-simple", { title: it.result.title.es || it.result.title.en, plain: it.result.plain.es || it.result.plain.en, simple: txt }); } catch { d = {}; }
    simpleBusy.delete(id);
    if (d.status === "ok") patchItem(id, { simpleFb: { level: d.level, good: d.good, hardWords: d.hardWords, missing: d.missing } });
    else toast(d.status === "paywall" ? t("paywall") : d.status === "support" ? t("support") : d.status === "blocked" ? t("blocked") : t("errAI"), 4500);
    keepRender();
  });
  $("#reCheck")?.addEventListener("click", () => { const it = folder().find(x => x.id === m?.dataset.id); if (it) runCheck(it, true); });
  const it = m && folder().find(x => x.id === m.dataset.id);
  if (it && it.transcript && (!it.check || (it.check.pending && !checking.has(it.id)))) runCheck(it);
}
function patchItem(id, patch) {
  saveFolder(folder().map(x => (x.id === id ? { ...x, ...patch } : x)));
  if (st.item?.id === id) Object.assign(st.item, patch);
}
const checking = new Set();
async function runCheck(it, force = false) {
  if (checking.has(it.id) && !force) return;
  checking.add(it.id);
  patchItem(it.id, { check: { pending: true } }); if (force) render();
  let d; try { d = await api("/api/study-check", { source: it.source, topic: it.topic, transcript: it.transcript }); } catch { d = {}; }
  checking.delete(it.id);
  patchItem(it.id, { check: d.status === "ok" ? { issues: d.issues || [], sources: d.sources || [] } : { failed: true } });
  if ((route === "study" || route === "carpeta") && $("#mine")?.dataset.id === it.id) { const keep = $("#mine").value; render(); const m = $("#mine"); if (m) m.value = keep; }
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
  rec = { stream, start: Date.now(), limit: st.minutes * 60, idx: 0, pending: 0, stopping: false, queue: Promise.resolve(), errors: 0, paywall: false, mr: null, seg: null, tick: null, quiet: 0 };
  try {
    const AC = window.AudioContext || window.webkitAudioContext; rec.ac = new AC();
    rec.an = rec.ac.createAnalyser(); rec.an.fftSize = 1024; rec.ac.createMediaStreamSource(stream).connect(rec.an); rec.buf = new Float32Array(rec.an.fftSize);
  } catch {}
  dropAudio(); st.parts = []; st.transcript = "";
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
    if (chunks.length) { const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" }); st.audio[i] = URL.createObjectURL(blob); enqueue(blob, i); }
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
  if (rec.an) {
    rec.an.getFloatTimeDomainData(rec.buf);
    let sum = 0; for (const v of rec.buf) sum += v * v;
    const level = Math.min(1, Math.sqrt(sum / rec.buf.length) * 7);
    const l = $("#lvl"), h = $("#lvlHint");
    if (l) l.style.width = `${Math.round(level * 100)}%`;
    rec.quiet = level < 0.12 ? rec.quiet + 1 : Math.max(0, rec.quiet - 2);
    if (h) h.textContent = rec.quiet > 12 ? `↑ ${t("louder")}` : level > 0.2 ? t("hearOk") : "";
  }
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
function dropAudio() { st.audio.forEach(u => u && URL.revokeObjectURL(u)); st.audio = []; }
async function finishRec(r) {
  r.stream.getTracks().forEach(tr => tr.stop());
  try { r.ac?.close(); } catch {}
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
  if (st.audio.some(Boolean)) {
    if ((await sheet(t("audioGone"), "", { ok: t("okGo") })) === null) return;
    dropAudio();
  }
  st.busy = true; st.error = ""; render();
  let d;
  try { d = await api("/api/study", { source: st.source, topic: st.topic, transcript: st.transcript, image: st.image || undefined }); }
  catch { d = { status: "ai_error" }; }
  st.busy = false;
  if (d.status === "unclear") { st.error = esc(t("unclear")); if (d.transcript) st.transcript = d.transcript; return render(); }
  const msg = { paywall: `${esc(t("paywall"))} <a href="#cuenta">${esc(t("seePlans"))}</a>`, blocked: esc(t("blocked")), support: esc(t("support")), language: esc(t("langOnly")), no_source: esc(t("needSource")) }[d.status];
  if (d.status !== "ok") { st.error = msg || esc(t("errAI")); return render(); }
  const item = { id: uid(), at: new Date().toISOString(), source: { ...st.source }, topic: st.topic, transcript: st.transcript, result: d.result, photos: [], goal: st.goal, before: st.before };
  saveFolder([item, ...folder()]);
  if (paid()) { addSpaced(item); setTimeout(() => toast(t("spacedOn"), 3500), 2700); }
  st.goal = ""; st.before = "";
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

/* ---------------- paid learning tools ---------------- */
const paid = () => Boolean(LS.get(K.code, ""));
const lockAll = () => `<div class="card lock"><b>🔒 ${esc(t("lockT"))}</b><p class="small" style="margin-top:6px;line-height:1.7">${t("lockL")}</p><a class="btn small" href="#cuenta">${esc(t("seePlans"))}</a></div>`;
const addDays = (iso, n) => { const [y, m, d] = iso.split("-").map(Number); return dayKey(new Date(y, m - 1, d + n)); };
const itemName = it => it.topic || it.result.title[L] || it.result.title.es || it.source.title;
const itemDetails = it => `Tangent Study · ${it.result.title[L] || it.result.title.es} · ${it.source.title}`;
function addEvents(list) {
  const cur = agenda(), dup = e => e.kind === "review" && [...cur, ...list.slice(0, list.indexOf(e))].some(x => x.kind === "review" && x.item === e.item && x.date === e.date);
  saveAgenda([...cur, ...list.filter(e => !dup(e))]); scheduleNotifs();
}
const reviewEv = (it, date, name = itemName(it)) => ({ id: uid(), title: `🔁 ${t("reviewW")}: ${name}`, date, time: "18:00", remind: 10, tag: "repaso", item: it.id, kind: "review", details: itemDetails(it) });
function addSpaced(it) { addEvents([1, 3, 7].map(n => reviewEv(it, addDays(dayKey(), n)))); }
async function scheduleItem(it) {
  const v = await sheet(t("schedBtn"), `
    <label class="f">${esc(t("schedWhat"))}</label>
    <label class="row" style="flex-wrap:nowrap"><input type="radio" name="kind" value="exam" checked style="width:20px;height:20px"> ${esc(t("kExam"))}</label>
    <label class="row" style="flex-wrap:nowrap"><input type="radio" name="kind" value="review" style="width:20px;height:20px"> ${esc(t("kReview"))}</label>
    <label class="f" for="scN">${esc(t("schedName"))}</label><input class="t" id="scN" name="name" maxlength="80" required value="${esc(itemName(it))}">
    <div class="two"><div><label class="f" for="scD">${esc(t("when"))}</label><input class="t" id="scD" type="date" name="date" required min="${dayKey()}" value="${addDays(dayKey(), 7)}"></div>
    <div><label class="f" for="scH">${esc(t("hour"))}</label><input class="t" id="scH" type="time" name="time" value="08:00"></div></div>
    <label class="row" style="flex-wrap:nowrap;align-items:flex-start;font-size:14px;margin-top:10px"><input type="checkbox" name="before" checked style="width:20px;height:20px;flex-shrink:0"> <span>${esc(t("schedBefore"))}</span></label>`, { ok: t("add") });
  if (!v || !v.date) return false;
  const name = (v.name || "").trim() || itemName(it);
  if (v.kind === "review") addEvents([{ ...reviewEv(it, v.date, name), time: v.time || "18:00" }]);
  else {
    const list = [{ id: uid(), title: `📝 ${t("examW")}: ${name}`, date: v.date, time: v.time || "08:00", remind: 1440, tag: "prueba", item: it.id, kind: "exam", details: itemDetails(it) }];
    if (v.before) for (const n of [7, 3, 1]) { const d = addDays(v.date, -n); if (d >= dayKey()) list.push(reviewEv(it, d, name)); }
    addEvents(list);
  }
  toast(t("schedDone")); return true;
}
function planBox(it) {
  const evs = agenda().filter(e => e.item === it.id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return `<div class="card" id="planBox"><b>📅 ${esc(t("planT2"))}</b>${it.reviews?.length ? ` <span class="small">· ${esc(t("revCount"))} ${it.reviews.length} ${esc(t("times"))}</span>` : ""}
    ${evs.length ? `<ul class="pts" style="margin-top:6px">${evs.map(e => `<li><span style="color:${tagOf(e).color}">●</span> <b>${esc(fmtDate(e.date))}</b> ${esc(e.time || "")} · ${esc(e.title)}${e.done ? " ✓" : ""} · <a href="${esc(gcalUrl(e))}" target="_blank" rel="noopener" class="small">Google</a></li>`).join("")}</ul>` : `<p class="small" style="margin-top:6px">${esc(t("planNone"))}</p>`}
    <div class="row"><button class="btn small" id="schedIt" type="button">＋ ${esc(t("schedBtn"))}</button>${evs.length ? `<button class="btn small ghost" id="icsIt" type="button">⬇ ${esc(t("icsAll"))}</button><a class="btn small ghost" href="#agenda/${esc(evs[0].date)}">${esc(t("seeAgenda"))}</a>` : ""}</div>
    <p class="small">${esc(t("gcalHint"))}</p></div>`;
}
const simpleBusy = new Set();
function simpleBox(it) {
  const fb = it.simpleFb, busy = simpleBusy.has(it.id);
  const lv = fb ? { clear: ["✅", "lvClear"], almost: ["🟡", "lvAlmost"], not_yet: ["🔁", "lvNot"] }[fb.level] || ["🟡", "lvAlmost"] : null;
  return `<details class="card" id="simpleBox" ${it.simple ? "open" : ""}><summary style="cursor:pointer"><b>🧒 ${esc(t("simpleT"))}</b></summary>
    <p class="small" style="margin-top:6px">${esc(t("simpleP"))}</p>
    <textarea class="t" id="simple" maxlength="3000">${esc(it.simple || "")}</textarea>
    <button class="btn small" id="simpleGo" type="button" ${busy ? "disabled" : ""}>${esc(busy ? t("making") : t("simpleGo"))}</button>
    ${fb ? `<div class="${fb.level === "clear" ? "ok" : "warn"}" style="margin-top:10px;padding:10px;border-radius:12px"><b>${lv[0]} ${esc(t(lv[1]))}</b>
      ${fb.good?.[L] ? `<p class="small" style="margin-top:4px">${esc(fb.good[L])}</p>` : ""}
      ${fb.hardWords?.length ? `<p class="small"><b>${esc(t("hardW"))}:</b> ${fb.hardWords.map(esc).join(", ")}</p>` : ""}
      ${fb.missing?.[L]?.length ? `<p class="small"><b>${esc(t("missingW"))}:</b></p><ul class="pts">${fb.missing[L].map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div>` : ""}
  </details>`;
}
function startReview(evId) {
  const ev = agenda().find(x => x.id === evId); if (!ev) return;
  const it = folder().find(x => x.id === ev.item); if (!it) return toast(t("topicGone"));
  saveAgenda(agenda().map(x => (x.id === evId ? { ...x, done: true } : x)));
  patchItem(it.id, { quizAns: [], reviews: [...(it.reviews || []), dayKey()] });
  st.review = it.id;
  if (location.hash === `#carpeta/${it.id}`) render(); else location.hash = `carpeta/${it.id}`;
}
function homeDue() {
  if (!paid()) return "";
  const today = dayKey(), ids = new Set(folder().map(i => i.id));
  const due = agenda().filter(e => e.kind === "review" && !e.done && e.date <= today && ids.has(e.item)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const exams = agenda().filter(e => e.kind === "exam" && e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  if (!due.length && !exams.length) return "";
  const left = d => Math.round((new Date(d) - new Date(today)) / 864e5);
  return `<div class="two" style="margin:14px 0">
    ${due.length ? `<div class="card"><b>🔁 ${esc(t("dueT"))}</b>${due.map(e => `<div class="item" style="margin-top:8px"><div class="grow"><b>${esc(e.title)}</b><div class="small">${esc(fmtDate(e.date))}</div></div><button class="btn small" data-rev="${e.id}" type="button" style="margin:0">${esc(t("revGo"))}</button></div>`).join("")}</div>` : ""}
    ${exams.length ? `<div class="card"><b>📝 ${esc(t("examsT"))}</b>${exams.map(e => { const n = left(e.date); return `<div class="item" style="margin-top:8px"><div class="grow"><b>${esc(e.title)}</b><div class="small">${esc(fmtDate(e.date))} · ${n === 0 ? esc(t("todayW")) : `${esc(t("daysLeft"))} ${n} ${esc(t("dayW"))}`}</div></div>${e.item ? `<a class="btn small ghost" href="#carpeta/${esc(e.item)}" style="margin:0">📄</a>` : ""}</div>`; }).join("")}</div>` : ""}
  </div>`;
}
document.addEventListener("click", e => {
  const r = e.target.closest("[data-rev]"); if (r) { e.preventDefault(); return startReview(r.dataset.rev); }
  const p = e.target.closest("[data-printit]");
  if (p) { e.preventDefault(); const it = folder().find(x => x.id === p.dataset.printit); if (it) printItems([it], LS.get("tangent.study.print", { paper: "A4" }).paper, LS.get("tangent.study.view", L), false); else toast(t("topicGone")); }
});
/* reading block timer */
const blk = { end: 0, mins: 15, iv: null, done: false };
function beep() { try { const AC = window.AudioContext || window.webkitAudioContext, a = new AC(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = 660; g.gain.value = 0.08; o.connect(g); g.connect(a.destination); o.start(); setTimeout(() => { o.stop(); a.close(); }, 700); } catch {} }
function blkTick() {
  const left = Math.max(0, blk.end - Date.now()), el = $("#blkClock"), bar = $("#blkBar");
  if (el) el.textContent = `${Math.floor(left / 60000)}:${pad(Math.floor(left / 1000) % 60)}`;
  if (bar) bar.style.width = `${100 - (left / (blk.mins * 60e3)) * 100}%`;
  if (blk.end && left <= 0) {
    clearInterval(blk.iv); blk.iv = null; blk.end = 0; blk.done = true;
    beep(); try { navigator.vibrate?.([300, 150, 300]); } catch {}
    toast(t("blkDone"), 7000); if (route === "study" && !rec) render();
  }
}
const blockCard = () => `<div class="card blk"><b>⏱️ ${esc(t("blkT"))}</b><p class="small" style="margin-top:4px">${esc(t("blkP"))}</p>
  ${blk.end ? `<div class="hand" id="blkClock" style="font-size:44px;line-height:1">${blk.mins}:00</div><div class="bar"><i id="blkBar"></i></div><button class="btn small ghost" id="blkStop" type="button">${esc(t("blkStop"))}</button>`
  : `${blk.done ? `<div class="ok small" style="padding:8px;border-radius:10px;margin:6px 0">${esc(t("blkDone"))}</div>` : ""}<div class="seg" id="blkMins" style="max-width:300px;margin:8px 0">${[10, 15, 20].map(m => `<button type="button" data-bm="${m}" class="${blk.mins === m ? "on" : ""}">${m} ${esc(t("min"))}</button>`).join("")}</div><button class="btn small" id="blkGo" type="button">▶ ${esc(t("blkGo"))}</button>`}</div>`;

/* topic map */
const STOP = new Set("para como sobre entre desde hasta donde cuando porque tiene tienen hacer este esta estos estas otros otras puede pueden that with from this what which about their there these those into have been were they your more than".split(" "));
const wordsOf = it => new Set([it.topic, it.result.title.es, it.result.title.en, ...(it.result.concepts || []).flatMap(c => [c.es, c.en])].join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/[^a-z0-9]+/).filter(w => w.length >= 5 && !STOP.has(w)));
const cut = (x, n) => { x = String(x || ""); return x.length > n ? x.slice(0, n - 1) + "…" : x; };
V.mapa = {
  html() {
    const head = `<h1>${esc(t("map"))}</h1><p class="lead">${esc(t("mapP"))}</p>`;
    if (!paid()) return head + lockAll();
    const items = folder().slice(0, 40);
    if (!items.length) return `${head}<div class="card">${esc(t("empty"))} <a href="#study">${esc(t("start"))}</a></div>`;
    const key = i => i.source.title.trim().toLowerCase();
    const srcs = [...new Set(items.map(key))];
    const W = 680, H = 680, cx = W / 2, cy = H / 2, R = srcs.length === 1 ? 0 : 205;
    const pos = {}, hubs = srcs.map((s, si) => {
      const a = (si / srcs.length) * 2 * Math.PI - Math.PI / 2, hx = cx + R * Math.cos(a), hy = cy + R * Math.sin(a);
      const mine = items.filter(i => key(i) === s), r2 = srcs.length === 1 ? 190 : Math.min(125, 78 + mine.length * 6);
      mine.forEach((i, k) => { const b = a + (k / Math.max(1, mine.length)) * 2 * Math.PI + (srcs.length === 1 ? 0 : Math.PI / mine.length); pos[i.id] = [hx + r2 * Math.cos(b), hy + r2 * Math.sin(b), si]; });
      return { x: hx, y: hy, title: mine[0].source.title, color: COLORS[si % COLORS.length] };
    });
    const W2 = items.map(wordsOf), links = [];
    for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
      const shared = [...W2[a]].filter(w => W2[b].has(w));
      if (shared.length) links.push([items[a], items[b], shared[0]]);
    }
    const exam = id => agenda().some(e => e.item === id && e.kind === "exam" && e.date >= dayKey());
    const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("map"))}">
      <g fill="none" stroke-linecap="round">
        ${items.map(i => { const [x, y, si] = pos[i.id], h = hubs[si]; return `<path d="M${h.x.toFixed(1)} ${h.y.toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${h.color}" stroke-width="2.4" opacity=".55"/>`; }).join("")}
        ${links.map(([a, b]) => `<path d="M${pos[a.id][0].toFixed(1)} ${pos[a.id][1].toFixed(1)} L${pos[b.id][0].toFixed(1)} ${pos[b.id][1].toFixed(1)}" stroke="#1d1d1f" stroke-width="2" stroke-dasharray="6 7" opacity=".45"/>`).join("")}
      </g>
      ${hubs.map(h => `<g><rect x="${(h.x - 92).toFixed(1)}" y="${(h.y - 24).toFixed(1)}" width="184" height="48" rx="24" fill="${h.color}" filter="url(#rough)"/><text x="${h.x.toFixed(1)}" y="${(h.y + 7).toFixed(1)}" text-anchor="middle" class="hub">📖 ${esc(cut(h.title, 18))}</text></g>`).join("")}
      ${items.map(i => { const [x, y, si] = pos[i.id]; return `<a href="#carpeta/${i.id}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="27" fill="#fff" stroke="${hubs[si].color}" stroke-width="3.5" filter="url(#rough)"/><text x="${x.toFixed(1)}" y="${(y + 8).toFixed(1)}" text-anchor="middle" class="ini">${esc((i.result.title[L] || i.result.title.es || "?").slice(0, 1).toUpperCase())}</text>${exam(i.id) ? `<text x="${(x + 20).toFixed(1)}" y="${(y - 18).toFixed(1)}" class="badge">📝</text>` : ""}<text x="${x.toFixed(1)}" y="${(y + 48).toFixed(1)}" text-anchor="middle" class="lbl">${esc(cut(i.result.title[L] || i.result.title.es, 20))}</text></a>`; }).join("")}
    </svg>`;
    return `${head}<div class="map">${svg}</div>
      <h2>${esc(t("mapLinks"))}</h2>
      ${links.length ? `<ul class="pts">${links.slice(0, 20).map(([a, b, w]) => `<li><a href="#carpeta/${a.id}">${esc(a.result.title[L] || a.result.title.es)}</a> ↔ <a href="#carpeta/${b.id}">${esc(b.result.title[L] || b.result.title.es)}</a> <span class="small">(${esc(w)})</span></li>`).join("")}</ul>` : `<p class="small">${esc(t("mapNoLinks"))}</p>`}`;
  },
};

/* profile character (no photos, ever) */
const AVATARS = [["🛹", "Skater", "Skater"], ["🪁", "Wingfoiler", "Wingfoiler"], ["🏄", "Surfista", "Surfer"], ["🧝", "Elfo", "Elf"], ["🧙", "Mago", "Wizard"], ["🧚", "Hada", "Fairy"],
  ["🧜", "Sirena", "Mermaid"], ["🦸", "Superhéroe", "Superhero"], ["🥷", "Ninja", "Ninja"], ["🤖", "Chico robot", "Robot kid"], ["👾", "Bicho pixel", "Pixel critter"], ["👽", "Extraterrestre", "Alien"],
  ["🧑‍🚀", "Astronauta", "Astronaut"], ["🧑‍🔬", "Científica", "Scientist"], ["🧑‍🎤", "Rockera", "Rock star"], ["🎸", "Guitarrista", "Guitarist"], ["🛡️", "Caballero", "Knight"], ["🦁", "Felino guerrero", "Warrior cat"],
  ["🐉", "Dragón", "Dragon"], ["🦄", "Unicornio", "Unicorn"], ["🦖", "Dino", "Dino"], ["🐯", "Tigre", "Tiger"], ["🦊", "Zorro", "Fox"], ["🐺", "Lobo", "Wolf"],
  ["🐼", "Panda", "Panda"], ["🦉", "Búho sabio", "Wise owl"], ["🐙", "Pulpo", "Octopus"], ["🐢", "Tortuga", "Turtle"], ["🦈", "Tiburón", "Shark"], ["🐧", "Pingüino", "Penguin"],
  ["🧗", "Escaladora", "Climber"], ["🚴", "Ciclista", "Cyclist"], ["🏂", "Snowboarder", "Snowboarder"], ["⚽", "Futbolista", "Footballer"], ["🏀", "Basquetbolista", "Basketball player"], ["🎮", "Gamer", "Gamer"],
  ["🎨", "Artista", "Artist"], ["🚀", "Cohete", "Rocket"], ["⚡", "Rayo", "Lightning"], ["🌋", "Volcán", "Volcano"], ["🌊", "Ola", "Wave"], ["🌵", "Cactus", "Cactus"]];
const AV_COLORS = ["#2B44E8", "#7C5CFF", "#3FA7FF", "#16A34A", "#F59E0B", "#E2363B", "#EC4899", "#14B8A6", "#1d1d1f"];
const myAvatar = () => LS.get(K.avatar, null);
const avatarHTML = (a, size = 44) => `<span class="av" style="--s:${size}px;--c:${esc(a?.c || "#E8E8EC")}">${a?.e ? esc(a.e) : `<svg viewBox="0 0 24 24" width="${Math.round(size * 0.55)}" height="${Math.round(size * 0.55)}" aria-hidden="true"><g fill="none" stroke="#1d1d1f" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4.2 21c1-4.2 4-6.2 7.8-6.2s6.8 2 7.8 6.2"/></g></svg>`}</span>`;
function avatarCard() {
  const a = myAvatar() || { e: "", c: AV_COLORS[0], n: "" };
  return `<div class="iri avcard"><div class="row" style="flex-wrap:nowrap;gap:14px">${avatarHTML(a, 74)}<div><span class="hand" style="font-size:28px">${esc(t("avT"))}</span><div class="small">${esc(a.n || "")}${a.e ? ` · ${esc((AVATARS.find(x => x[0] === a.e) || [])[L === "en" ? 2 : 1] || "")}` : ""}</div></div></div>
    <p class="small" style="margin:8px 0">${esc(t("avP"))}</p>
    <div class="avgrid" id="avGrid">${AVATARS.map(([e, es, en]) => `<button type="button" data-av="${e}" class="${a.e === e ? "on" : ""}" title="${esc(L === "en" ? en : es)}"><span>${e}</span><small>${esc(L === "en" ? en : es)}</small></button>`).join("")}</div>
    <label class="f">${esc(t("avColor"))}</label><div class="dots" id="avCol">${AV_COLORS.map(c => `<button type="button" data-avc="${c}" class="${a.c === c ? "on" : ""}" style="background:${c}" aria-label="${c}"></button>`).join("")}</div>
    <label class="f" for="avN">${esc(t("avNick"))}</label><input class="t" id="avN" maxlength="24" value="${esc(a.n || "")}" autocomplete="off">
  </div>`;
}
function mountAvatar() {
  const save = patch => { LS.set(K.avatar, { ...(myAvatar() || { e: "", c: AV_COLORS[0], n: "" }), ...patch }); };
  $("#avGrid")?.addEventListener("click", e => { const b = e.target.closest("[data-av]"); if (!b) return; save({ e: b.dataset.av }); render(); toast(t("avSaved")); });
  $("#avCol")?.addEventListener("click", e => { const b = e.target.closest("[data-avc]"); if (!b) return; save({ c: b.dataset.avc }); render(); });
  $("#avN")?.addEventListener("change", e => { save({ n: e.target.value.trim().slice(0, 24) }); render(); });
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
        <div class="grow"><a href="#carpeta/${it.id}"><b>${esc(it.result.title[L] || it.result.title.es)}</b></a><div class="small">${esc(it.source.title)} · ${esc(new Date(it.at).toLocaleDateString(L === "en" ? "en-US" : "es-AR"))}${(() => { const x = agenda().filter(e => e.item === it.id && e.kind === "exam" && e.date >= dayKey()).sort((a, b) => a.date.localeCompare(b.date))[0]; return x ? ` · 📝 ${esc(fmtDate(x.date))}` : ""; })()}</div></div>
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
      ${r.goBack?.[lang]?.length ? `<h2>${esc(tl("goBackT", lang))}</h2><ul>${r.goBack[lang].map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${it.check?.issues?.length ? `<h2>${esc(tl("checkT", lang))}</h2><ul>${it.check.issues.map(i => `<li>«${esc(i.said)}» → ${esc(i.fix[lang] || i.fix.es)}</li>`).join("")}</ul>` : ""}
      ${it.before ? `<h2>${esc(tl("baBefore", lang))}</h2><p>${esc(it.before)}</p>` : ""}
      ${it.mine ? `<h2>${esc(tl("mineTitle", lang))}</h2><p>${esc(it.mine)}</p>` : ""}
      ${agenda().some(e => e.item === it.id) ? `<h2>${esc(tl("planT2", lang))}</h2><ul>${agenda().filter(e => e.item === it.id).sort((a, b) => a.date.localeCompare(b.date)).map(e => `<li>${esc(new Date(e.date + "T12:00").toLocaleDateString(lang === "en" ? "en-US" : "es-AR", { weekday: "short", day: "numeric", month: "short" }))} · ${esc(e.title)}</li>`).join("")}</ul>` : ""}
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
    let sel = LS.get("tangent.study.boardCol", b.cols[0]?.id);
    if (!b.cols.some(c => c.id === sel)) sel = b.cols[0]?.id;
    return `<h1>${esc(t("board"))}</h1><p class="lead">${esc(t("boardP"))}</p>
      <div class="row" style="margin-bottom:8px"><button class="btn small" data-act="addcol" type="button">${esc(t("addCol"))}</button></div>
      <div class="colchips" role="tablist">${b.cols.map(c => `<button type="button" role="tab" data-chip="${c.id}" class="${c.id === sel ? "on" : ""}" style="--c:${c.color}">${esc(c.name)} <small>${c.tasks.length}</small></button>`).join("")}</div>
      <div class="board" id="board">${b.cols.map((c, ci) => `
        <section class="col ${c.id === sel ? "" : "hide-m"}" data-col="${c.id}" style="--c:${c.color}">
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
  const chip = !dbl && e.target.closest("[data-chip]");
  if (chip) { LS.set("tangent.study.boardCol", chip.dataset.chip); return render(); }
  const el = e.target.closest("[data-act]"); if (!el) return;
  const act = el.dataset.act;
  // Buttons work with one tap; the column name and task text open the editor with a double tap/click.
  if (dbl === (el.tagName === "BUTTON")) return;
  const b = board(), colEl = el.closest("[data-col]"), ci = colEl ? b.cols.findIndex(c => c.id === colEl.dataset.col) : -1, col = b.cols[ci];
  const taskEl = el.closest("[data-task]"), ti = taskEl && col ? col.tasks.findIndex(k => k.id === taskEl.dataset.task) : -1, task = ti >= 0 ? col.tasks[ti] : null;
  const swap = (arr, i, j) => { [arr[i], arr[j]] = [arr[j], arr[i]]; };
  if (act === "addcol") {
    const v = await sheet(t("addCol"), `<label class="f">${esc(t("colName"))}</label><input class="t" name="name" maxlength="40" required><label class="f">${esc(t("color"))}</label>${dots("color", COLORS[b.cols.length % COLORS.length])}`);
    if (v?.name?.trim()) { const id = uid(); b.cols.push({ id, name: v.name.trim(), color: v.color || COLORS[0], tasks: [] }); saveBoard(b); LS.set("tangent.study.boardCol", id); render(); }
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
  else if ((act === "tL" && ci > 0) || (act === "tR" && ci < b.cols.length - 1)) { const to = b.cols[ci + (act === "tL" ? -1 : 1)]; col.tasks.splice(ti, 1); to.tasks.push(task); saveBoard(b); render(); toast(`→ ${to.name}`, 1500); }
}
// Drag with finger or mouse (pointer events work on phones too).
function dragStart(e) {
  const card = e.target.closest(".task"); if (!card) return;
  e.preventDefault();
  const ghost = card.cloneNode(true); ghost.classList.add("dragghost"); document.body.appendChild(ghost);
  card.style.opacity = ".35";
  let target = null, index = 0;
  const move = ev => {
    ghost.style.left = ev.clientX - 30 + "px"; ghost.style.top = ev.clientY - 20 + "px";
    const hit = document.elementFromPoint(ev.clientX, ev.clientY);
    const under = hit?.closest(".col"), chip = hit?.closest("[data-chip]");
    $$(".drop").forEach(x => x.classList.remove("drop"));
    target = under ? $(".tasks", under) : null;
    if (chip) { chip.classList.add("drop"); target = { dataset: { col: chip.dataset.chip } }; index = 1e9; }
    else if (target) {
      target.classList.add("drop");
      const kids = $$(".task", target).filter(k => k !== card);
      index = kids.findIndex(k => { const r = k.getBoundingClientRect(); return ev.clientY < r.top + r.height / 2; });
      if (index < 0) index = kids.length;
    }
    if (ev.clientY < 70) window.scrollBy(0, -12); else if (ev.clientY > innerHeight - 90) window.scrollBy(0, 12);
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
  const p = new URLSearchParams({ action: "TEMPLATE", text: ev.title, dates: `${icsStamp(s)}/${icsStamp(e)}`, details: ev.details || "Tangent Study", ctz: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Argentina/Buenos_Aires" });
  return `https://calendar.google.com/calendar/render?${p}`;
}
function icsFile(evs, name) {
  const clean = x => String(x).replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tangent//Study//ES"];
  for (const ev of evs) {
    const s = evStart(ev), e = new Date(s.getTime() + 3600e3);
    lines.push("BEGIN:VEVENT", `UID:${ev.id}@tangent`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART:${icsStamp(s)}`, `DTEND:${icsStamp(e)}`, `SUMMARY:${clean(ev.title)}`, `DESCRIPTION:${clean(ev.details || "Tangent Study")}`);
    if (ev.remind) lines.push("BEGIN:VALARM", `TRIGGER:-PT${ev.remind}M`, "ACTION:DISPLAY", `DESCRIPTION:${clean(ev.title)}`, "END:VALARM");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  download(name, lines.join("\r\n"), "text/calendar");
}
const ics = ev => icsFile([ev], `tangent-${ev.date}.ics`);
const TAG_DEFAULTS = [["prueba", "#E2363B", ["Prueba", "Test"]], ["entrega", "#F59E0B", ["Entrega", "Deadline"]], ["estudio", "#2B44E8", ["Estudiar", "Study"]], ["personal", "#16A34A", ["Personal", "Personal"]], ["repaso", "#7C5CFF", ["Repaso", "Review"]]];
const tags = () => { const base = LS.get(K.tags, null) || TAG_DEFAULTS.map(([id, color]) => ({ id, color })); return [...base, ...TAG_DEFAULTS.filter(d => !base.some(b => b.id === d[0])).map(([id, color]) => ({ id, color }))]; };
const tagName = tg => { const d = TAG_DEFAULTS.find(x => x[0] === tg.id); return tg.name || (d ? d[2][L === "en" ? 1 : 0] : "?"); };
const tagOf = ev => tags().find(x => x.id === ev.tag) || { id: "", color: "#6B7280", name: "—" };
const agState = { month: null, sel: dayKey(), hide: [] };
const monthTitle = (y, m, loc) => { const x = new Date(y, m, 1).toLocaleDateString(loc, { month: "long", year: "numeric" }); return x.charAt(0).toUpperCase() + x.slice(1); };
function monthDays(y, m) {
  const first = new Date(y, m, 1), shift = (first.getDay() + 6) % 7; // weeks start on Monday
  return [...Array(42)].map((_, i) => new Date(y, m, 1 - shift + i));
}
V.agenda = {
  html() {
    if (!agState.month) { const n = new Date(); agState.month = [n.getFullYear(), n.getMonth()]; }
    if (/^\d{4}-\d{2}-\d{2}$/.test(arg)) { agState.sel = arg; const [ay, am] = arg.split("-").map(Number); agState.month = [ay, am - 1]; agState.hide = []; arg = ""; history.replaceState(null, "", "#agenda"); }
    const [y, m] = agState.month, evs = agenda(), tg = tags();
    const visible = evs.filter(e => !agState.hide.includes(e.tag || ""));
    const byDay = d => visible.filter(e => e.date === d).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    const loc = L === "en" ? "en-US" : "es-AR";
    const wds = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: "short" }).replace(".", ""));
    const sel = agState.sel, selEvs = byDay(sel);
    const row = ev => { const g = tagOf(ev); return `<div class="item evrow" style="--c:${g.color}"><div class="grow"><b>${esc(ev.title)}</b><div class="small">${esc(ev.time || "")} · ${esc(tagName(g))}${ev.remind ? ` · ⏰ ${esc(t(ev.remind === 10 ? "before10" : ev.remind === 60 ? "before60" : "before1d"))}` : ""}</div>
      <div class="row" style="margin-top:4px"><a href="${esc(gcalUrl(ev))}" target="_blank" rel="noopener" class="small">${esc(t("gcal"))}</a> · <a href="#" data-ics="${ev.id}" class="small">${esc(t("ics"))}</a>${ev.item ? ` · <a href="#carpeta/${esc(ev.item)}" class="small">📄 ${esc(t("openTopic"))}</a> · <a href="#" data-printit="${esc(ev.item)}" class="small">🖨️ ${esc(t("print"))}</a>` : ""}</div>
      ${ev.kind === "review" ? (ev.done ? `<div class="small" style="margin-top:4px">✓ ${esc(t("revDone"))}</div>` : ev.date <= dayKey() ? `<button class="btn small" data-rev="${ev.id}" type="button" style="margin-top:6px">🔁 ${esc(t("revGo"))}</button>` : "") : ""}</div>
      <button class="x" data-delev="${ev.id}" aria-label="${esc(t("del"))}">🗑</button></div>`; };
    return `<h1>${esc(t("agenda"))}</h1><p class="lead">${esc(t("agendaP"))}</p>
      <div class="calhead"><button type="button" data-mon="-1" aria-label="◀">◀</button><b>${esc(monthTitle(y, m, loc))}</b><button type="button" data-mon="1" aria-label="▶">▶</button></div>
      <div class="tags">${tg.map(g => `<button type="button" data-tag="${g.id}" class="${agState.hide.includes(g.id) ? "off" : ""}" style="--c:${g.color}"><i></i>${esc(tagName(g))}</button>`).join("")}<button type="button" data-tagedit style="--c:#999">＋ ${esc(t("tagsEdit"))}</button></div>
      <div class="cal">${wds.map(w => `<div class="wd">${esc(w)}</div>`).join("")}
        ${monthDays(y, m).map(d => { const k = dayKey(d), list = byDay(k);
          return `<button type="button" class="d ${d.getMonth() !== m ? "out" : ""} ${k === dayKey() ? "today" : ""} ${k === sel ? "sel" : ""}" data-day="${k}" aria-label="${esc(fmtDate(k, { day: "numeric", month: "long" }))}${list.length ? ` · ${list.length}` : ""}">${d.getDate()}<span class="evs">${list.slice(0, 3).map(e => `<i style="--c:${tagOf(e).color}"></i><em style="--c:${tagOf(e).color}">${esc(e.title)}</em>`).join("")}${list.length > 3 ? `<em style="--c:#555">+${list.length - 3}</em>` : ""}</span></button>`; }).join("")}
      </div>
      <h2>${esc(fmtDate(sel, { weekday: "long", day: "numeric", month: "long" }))}</h2>
      ${selEvs.length ? selEvs.map(row).join("") : `<div class="small">${esc(t("empty"))}</div>`}
      <form class="card" id="evForm">
        <label class="f" for="evT">${esc(t("what"))}</label><input class="t" id="evT" name="title" maxlength="120" required placeholder="${L === "en" ? "Maths test" : "Prueba de mate"}">
        <div class="two"><div><label class="f" for="evD">${esc(t("when"))}</label><input class="t" id="evD" type="date" name="date" required value="${sel}"></div>
        <div><label class="f" for="evH">${esc(t("hour"))}</label><input class="t" id="evH" type="time" name="time" value="${pad((new Date().getHours() + 1) % 24)}:00"></div></div>
        <label class="f">${esc(t("tag"))}</label>
        <div class="tags" id="evTag"><input type="hidden" name="tag" value="${tg[0]?.id || ""}">${tg.map((g, i) => `<button type="button" data-pt="${g.id}" class="${i ? "off" : ""}" style="--c:${g.color}"><i></i>${esc(tagName(g))}</button>`).join("")}</div>
        <label class="f" for="evR">${esc(t("remind"))}</label><select class="t" id="evR" name="remind"><option value="0">${esc(t("none"))}</option><option value="10">${esc(t("before10"))}</option><option value="60" selected>${esc(t("before60"))}</option><option value="1440">${esc(t("before1d"))}</option></select>
        <button class="btn" type="submit">${esc(t("add"))}</button>
      </form>
      <div class="row"><button class="btn small ghost" id="notif" type="button">🔔 ${esc(t("notif"))}</button><button class="btn small ghost" id="printMonth" type="button">🖨️ ${esc(t("printMonth"))}</button></div>`;
  },
  mount() {
    $("#evForm").addEventListener("submit", e => {
      e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
      saveAgenda([...agenda(), { id: uid(), title: f.title.trim(), date: f.date, time: f.time || "09:00", remind: Number(f.remind) || 0, tag: f.tag || "" }]);
      agState.sel = f.date; const [yy, mm] = f.date.split("-").map(Number); agState.month = [yy, mm - 1];
      render(); scheduleNotifs();
    });
    $("#evTag").addEventListener("click", e => { const b = e.target.closest("[data-pt]"); if (!b) return; $$("#evTag [data-pt]").forEach(x => x.classList.toggle("off", x !== b)); $("#evTag input").value = b.dataset.pt; });
    $("#view").onclick = async e => {
      if (route !== "agenda") return;
      const mon = e.target.closest("[data-mon]"); if (mon) { let [y, m] = agState.month; m += Number(mon.dataset.mon); if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } agState.month = [y, m]; return render(); }
      const day = e.target.closest("[data-day]"); if (day) { agState.sel = day.dataset.day; render(); return; }
      const tg = e.target.closest("[data-tag]"); if (tg) { const id = tg.dataset.tag; agState.hide = agState.hide.includes(id) ? agState.hide.filter(x => x !== id) : [...agState.hide, id]; return render(); }
      if (e.target.closest("[data-tagedit]")) {
        const v = await sheet(t("tagsEdit"), `<label class="f">${esc(t("tagName"))}</label><input class="t" name="name" maxlength="24" required><label class="f">${esc(t("color"))}</label>${dots("color", COLORS[tags().length % COLORS.length])}
          <p class="small" style="margin-top:10px">${tags().map(g => `<span style="color:${g.color}">●</span> ${esc(tagName(g))}`).join(" · ")}</p>`);
        if (v?.name?.trim()) { LS.set(K.tags, [...tags(), { id: uid(), name: v.name.trim(), color: v.color || COLORS[0] }]); render(); }
        return;
      }
      const i = e.target.closest("[data-ics]"); if (i) { e.preventDefault(); const ev = agenda().find(x => x.id === i.dataset.ics); if (ev) ics(ev); return; }
      const d = e.target.closest("[data-delev]"); if (d && await confirmIt(t("sure"))) { saveAgenda(agenda().filter(x => x.id !== d.dataset.delev)); render(); }
    };
    $("#notif").addEventListener("click", async () => {
      if (!("Notification" in window)) return toast(t("gcal"));
      if ((await Notification.requestPermission()) === "granted") { toast(t("notifOn"), 3500); scheduleNotifs(); }
    });
    $("#printMonth").addEventListener("click", () => {
      const [y, m] = agState.month, evs = agenda(), loc = L === "en" ? "en-US" : "es-AR";
      const wds = [...Array(7)].map((_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(loc, { weekday: "short" }));
      const days = monthDays(y, m);
      const weeks = [...Array(6)].map((_, w) => days.slice(w * 7, w * 7 + 7)).filter(w => w.some(d => d.getMonth() === m));
      printHTML(`<section class="pg">${printHdr()}<h1>${esc(monthTitle(y, m, loc))}</h1>
        <table><tr>${wds.map(w => `<th>${esc(w)}</th>`).join("")}</tr>${weeks.map(w => `<tr>${w.map(d => `<td style="height:78pt;width:14.2%;${d.getMonth() !== m ? "color:#aaa" : ""}"><b>${d.getDate()}</b><br>${evs.filter(e => e.date === dayKey(d)).map(e => `<span style="font-size:8pt;color:${tagOf(e).color}">■</span> <span style="font-size:8pt">${esc(e.title)}</span>`).join("<br>")}</td>`).join("")}</tr>`).join("")}</table>
        <p class="foot">${tags().map(g => `<span style="color:${g.color}">■</span> ${esc(tagName(g))}`).join(" &nbsp; ")}</p></section>`, LS.get("tangent.study.print", { paper: "A4" }).paper);
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
const ROLES = {
  kid: { t: ["Un chico o chica de 6 a 12", "A child aged 6 to 12"], d: ["Lo registra mamá, papá o tutor. Siempre con supervisión de un adulto.", "Registered by a parent or guardian. Always supervised by an adult."] },
  teen: { t: ["Tengo de 13 a 17 años", "I'm 13 to 17"], d: ["Usás tu cuenta, pero un adulto con DNI tiene que aprobarla.", "You use your own account, but an adult with ID must approve it."] },
  adult: { t: ["Tengo 18 o más", "I'm 18 or older"], d: ["Te registrás vos, con tu DNI.", "You sign up yourself, with your ID."] },
  uni: { t: ["Estudio en la universidad", "I'm a university student"], d: ["Te registrás vos y nos decís en qué facultad estudiás.", "You sign up yourself and tell us your faculty."] },
  inst: { t: ["Escuela pública u ONG", "Public school or NGO"], d: ["Lo pide la dirección o quien representa a la ONG. Después reparte códigos.", "Requested by the head teacher or the NGO's representative, who then hands out codes."] },
};
const F = (name, label, type = "text", extra = "") => `<label class="f" for="su_${name}">${esc(label)}</label><input class="t" id="su_${name}" name="${name}" type="${type}" ${extra}>`;
const CHK = (name, label) => `<label class="row" style="flex-wrap:nowrap;align-items:flex-start;font-size:13px;line-height:1.35;margin-top:10px"><input type="checkbox" name="${name}" required style="width:20px;height:20px;flex-shrink:0"><span>${esc(label)}</span></label>`;
function roleFields(role) {
  const en = L === "en", adultBlock = (who) => `
    <h2>${esc(who)}</h2>
    ${F("aname", en ? "Full name" : "Nombre y apellido", "text", 'required maxlength="80" autocomplete="name"')}
    ${F("adni", en ? "ID number (DNI)" : "Número de DNI", "text", 'required inputmode="numeric" pattern="[0-9.]{7,11}" maxlength="11"')}
    ${F("aemail", en ? "Email" : "Mail", "email", 'required maxlength="120" autocomplete="email"')}`;
  const school = `<label class="f" for="su_stype">${esc(en ? "School" : "Escuela")}</label><select class="t" id="su_stype" name="stype"><option value="private">${esc(en ? "Private school" : "Colegio privado")}</option><option value="public">${esc(en ? "Public school (with code)" : "Escuela pública (con código)")}</option></select>
    ${F("school", en ? "School name" : "Nombre del colegio", "text", 'required maxlength="100"')}`;
  const pass = F("pass", t("pass"), "password", 'required minlength="8" autocomplete="new-password"');
  if (role === "kid") return `${adultBlock(en ? "Parent or guardian" : "Mamá, papá o tutor")}
    <label class="f" for="su_rel">${esc(en ? "Relationship" : "Vínculo")}</label><select class="t" id="su_rel" name="rel"><option>${en ? "Mother" : "Madre"}</option><option>${en ? "Father" : "Padre"}</option><option>${en ? "Guardian" : "Tutor/a"}</option></select>
    ${pass}
    <h2>${esc(en ? "The child" : "El chico o la chica")}</h2>
    ${F("kname", en ? "Nickname (no surname)" : "Apodo (sin apellido)", "text", 'required maxlength="30"')}
    <label class="f" for="su_kage">${esc(t("age"))}</label><select class="t" id="su_kage" name="kage">${[6, 7, 8, 9, 10, 11, 12].map(n => `<option>${n}</option>`).join("")}</select>
    ${school}
    ${F("pin", en ? "Parent PIN (4 digits) to open and close child mode" : "PIN de adulto (4 números) para abrir y cerrar el modo chico", "password", 'required inputmode="numeric" pattern="[0-9]{4}" maxlength="4"')}
    ${CHK("resp", en ? "I'm of age and responsible for this child." : "Soy mayor de edad y responsable de este chico o chica.")}
    ${CHK("sup", en ? "I'll supervise their use. They never use Tangent alone without me knowing." : "Voy a supervisar su uso. Nunca usa Tangent solo sin que yo lo sepa.")}`;
  if (role === "teen") return `<h2>${esc(en ? "You" : "Vos")}</h2>
    ${F("kname", en ? "Nickname" : "Apodo", "text", 'required maxlength="30"')}
    ${F("email", t("email"), "email", 'required maxlength="120"')}
    <label class="f" for="su_kage">${esc(t("age"))}</label><select class="t" id="su_kage" name="kage">${[13, 14, 15, 16, 17].map(n => `<option>${n}</option>`).join("")}</select>
    ${school}${pass}
    ${adultBlock(en ? "Your parent or guardian (approves the account)" : "Tu mamá, papá o tutor (aprueba la cuenta)")}
    ${CHK("resp", en ? "An adult will approve this account and can see what I do." : "Un adulto va a aprobar esta cuenta y puede ver lo que hago.")}`;
  if (role === "adult" || role === "uni") return `${adultBlock(en ? "Your details" : "Tus datos")}${pass}
    ${role === "uni" ? `${F("univ", en ? "University" : "Universidad", "text", 'required maxlength="100"')}${F("faculty", en ? "Faculty" : "Facultad", "text", 'required maxlength="100"')}${F("career", en ? "Degree" : "Carrera", "text", 'maxlength="100"')}
      ${F("uemail", en ? "University email (e.g. name@uba.ar), if you have one" : "Mail de la facultad (ej.: nombre@uba.ar), si tenés", "email", 'maxlength="120"')}
      <label class="f" for="su_card">${esc(en ? "Or a photo of your student card" : "O foto de tu libreta o credencial universitaria")}</label><input class="t" id="su_card" name="card" type="file" accept="image/*">
      <p class="small">${esc(en ? "We only check it to approve access and then delete it." : "Solo la miramos para aprobar el acceso y después la borramos.")}</p>` : ""}
    ${CHK("adultok", en ? "I'm 18 or older." : "Tengo 18 años o más.")}`;
  return `<label class="f" for="su_itype">${esc(en ? "Type" : "Tipo")}</label><select class="t" id="su_itype" name="itype"><option value="school">${esc(en ? "Public school" : "Escuela pública")}</option><option value="ngo">${esc(en ? "NGO" : "ONG")}</option></select>
    ${F("iname", en ? "Name of the school or NGO" : "Nombre de la escuela u ONG", "text", 'required maxlength="120"')}
    ${F("icode", en ? "School code (CUE) or NGO tax ID (CUIT)" : "CUE de la escuela o CUIT de la ONG", "text", 'required maxlength="20"')}
    ${F("istudents", en ? "How many students, roughly" : "Cuántos alumnos, más o menos", "number", 'min="1" max="5000"')}
    ${adultBlock(en ? "Head teacher or NGO representative" : "Director/a o responsable de la ONG")}
    ${F("iphone", en ? "Phone" : "Teléfono", "tel", 'required maxlength="30"')}
    <label class="f" for="su_letter">${esc(en ? "Signed authorisation letter (photo or PDF)" : "Nota de autorización firmada (foto o PDF)")}</label><input class="t" id="su_letter" name="letter" type="file" accept="image/*,application/pdf" required>
    ${CHK("resp", en ? "I represent this institution and the families' consent is handled by it." : "Represento a esta institución y el permiso de las familias lo gestiona la institución.")}`;
}
const VERIFY = {
  kid: ["Verificamos que el adulto es mayor de edad con su pago por Mercado Pago (cuenta con DNI validado) o, si viene por la escuela, con la escuela. El chico no tiene usuario propio: entra desde la cuenta del adulto, con PIN.", "We check the adult is of age through their Mercado Pago payment (account with verified ID) or, if it comes through the school, through the school. The child has no login of their own: they use the adult's account, with a PIN."],
  teen: ["La cuenta queda en pausa hasta que el adulto la aprueba desde su mail y valida su DNI (pago por Mercado Pago o escuela).", "The account stays paused until the adult approves it from their email and validates their ID (Mercado Pago payment or school)."],
  adult: ["Tu DNI se valida con tu cuenta de Mercado Pago al pagar.", "Your ID is validated through your Mercado Pago account when you pay."],
  uni: ["Con el mail de la facultad se aprueba al toque. Con la foto de la credencial, una persona la revisa.", "A university email is approved right away. A student card photo is checked by a person."],
  inst: ["Revisamos la nota y llamamos a la institución antes de activar los códigos.", "We check the letter and call the institution before turning on the codes."],
};
V.cuenta = {
  role: null,
  html() {
    const code = LS.get(K.code, ""), role = V.cuenta.role;
    return `<h1>${esc(t("account"))}</h1>${avatarCard()}<div class="warn">${esc(t("preview"))}</div>
      <div class="card"><b>${esc(t("haveCode"))}</b>
        ${code ? `<p class="small" style="margin-top:6px">✅ ${esc(t("codeOn"))}</p><button class="btn small ghost" id="rmCode" type="button">${esc(t("removeCode"))}</button>`
        : `<form id="codeForm" class="row" style="margin-top:8px;flex-wrap:nowrap"><input class="t" name="code" autocomplete="off" autocapitalize="characters" placeholder="${esc(t("code"))}" aria-label="${esc(t("code"))}"><button class="btn small" type="submit" style="margin:0">${esc(t("useCode"))}</button></form>`}
      </div>
      <h2>${esc(t("signupT"))}</h2>${squiggle()}
      <p class="lead">${esc(t("whoUses"))}</p>
      <div class="who" id="who">${Object.entries(ROLES).map(([k, r]) => `<button type="button" data-role="${k}" class="${role === k ? "on" : ""}">${esc(r.t[L === "en" ? 1 : 0])}<span>${esc(r.d[L === "en" ? 1 : 0])}</span></button>`).join("")}</div>
      ${role ? `<form class="card" id="suForm" style="margin-top:12px">
        ${roleFields(role)}
        <div class="shield" style="margin-top:12px">🛡️ ${esc(VERIFY[role][L === "en" ? 1 : 0])}</div>
        ${CHK("terms", t("must"))}
        <label class="row" style="flex-wrap:nowrap;align-items:flex-start;font-size:13px;margin-top:10px"><input type="checkbox" name="news" style="width:20px;height:20px;flex-shrink:0"><span>${esc(t("optNews"))}</span></label>
        <p class="small" style="margin-top:8px">${esc(t("optOut"))}</p>
        <button class="btn" type="submit">${esc(t("sendReq"))}</button>
      </form>` : ""}
      <div class="two" style="margin-top:14px">
        <div class="iri"><b style="font-size:18px">${esc(t("planT"))}</b>
          <div style="font-size:34px;font-weight:800;letter-spacing:-1px">US$ 1 <span style="font-size:15px;font-weight:600;color:var(--soft)">${esc(t("perMonth"))}</span></div>
          <p style="font-size:14px;line-height:1.5">${t("planL")}</p><p class="small">${esc(t("arsNote"))}</p>
          <button class="btn" type="button" disabled>${esc(t("payMP"))}</button><p class="small" style="text-align:center">${esc(t("soon"))}</p></div>
        <div class="card"><b>${esc(t("schools"))}</b><p class="small" style="margin-top:6px">${esc(t("schoolsP"))}</p>
          <b>${esc(t("verifyT"))}</b><p class="small" style="margin-top:6px">${esc(t("verifyP"))}</p></div>
      </div>`;
  },
  mount() {
    mountAvatar();
    $("#codeForm")?.addEventListener("submit", async e => { e.preventDefault(); if (await tryCode(e.target.code.value)) render(); });
    $("#rmCode")?.addEventListener("click", () => { LS.del(K.code); render(); });
    $("#who").addEventListener("click", e => { const b = e.target.closest("[data-role]"); if (!b) return; V.cuenta.role = b.dataset.role; render(); $("#suForm")?.scrollIntoView({ behavior: "smooth", block: "start" }); });
    $("#suForm")?.addEventListener("submit", e => {
      e.preventDefault();
      const f = new FormData(e.target), out = { role: V.cuenta.role, at: new Date().toISOString() };
      // Passwords, PINs, DNI numbers and files never stay on the device: this is only a preview of the form.
      for (const [k, v] of f.entries()) if (!["pass", "pin", "adni", "card", "letter"].includes(k) && typeof v === "string") out[k] = v;
      LS.set(K.signup, out);
      e.target.reset(); toast(t("reqSaved"), 4500);
    });
  },
};

/* ---------------- terms + cookies ---------------- */
V.terminos = {
  html() {
    const c = LS.get(K.cookies, { measure: false });
    return `<h1>${esc(t("terms"))}</h1>
      ${["tKids", "tVoice", "tKeep", "tMinors", "tSource", "tAI", "tRights"].map(k => `<div class="card" style="font-size:14px;line-height:1.45">${t(k)}</div>`).join("")}
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
