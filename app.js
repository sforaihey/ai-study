/* Steady · offline-first learning app for any subject. Courses live in courses/*.js; progress in localStorage. */
(() => {
'use strict';
const VERSION = '3.4.1';
const KEY = 'steady-v3', V2_KEY = 'ai-study-v2', V1_KEY = 'ai-study-pwa-v1', AI_ID = 'ai-foundations';
const INTERVALS = [0, 1, 3, 7, 16, 35];            // days until next review, by box
const REVIEW_MAX = 15, CARDS_MAX = 20, PASS = 80, GOALS = [5, 10, 15, 20], TEST_Q = 10, FINAL_Q = 30;
const MIN_PER_Q = 0.75, MIN_PER_CARD = 0.2, WPM = 170, RATES = [0.9, 1, 1.15, 1.3];
// AI Study v1 lesson order → AI Foundations lesson ids, so the very first app's completions carry over.
const OLD_MAP = [['ai-vs-automation'],['ai-ml-dl-genai'],['predictive-vs-generative'],['ai-workloads'],['data-features-labels'],['learning-types'],['classification-regression-clustering'],['train-validate-test'],['overfitting'],['neural-networks'],['training-gradient-descent'],['transformers-attention'],['tokens-context','embeddings'],['prompting-basics'],['rag'],['fine-tuning'],['tools-function-calling','agents'],['should-it-be-ai'],['model-selection'],['evaluating-genai'],['cost-latency-quality'],['deployment-options'],['mlops-llmops'],['drift-monitoring'],['ai-security'],['bias-fairness'],['privacy-ip'],['guardrails-redteaming'],['use-cases-value'],['capstone']];

var cloudReady = false;   // set once the cloud module below has loaded
const $ = s => document.querySelector(s);
const view = $('#view');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ymd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today = () => ymd(new Date());
const addDays = (s, n) => { const [y,m,d] = s.split('-').map(Number); return ymd(new Date(y, m-1, d+n)); };
const isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const int = (x, max = 1e9) => Number.isFinite(x) && x >= 0 ? Math.min(Math.floor(x), max) : 0;
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const words = a => a.join(' ').split(/\s+/).length;
const entries = o => o && typeof o === 'object' ? Object.entries(o) : [];
const svg = (d, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const AUTO = 'dir="auto"';      // course text keeps its own direction inside the app's language

/* ───────── Language (English · العربية) ───────── */
const AR = window.STEADY_AR || {};
const lang = () => state && state.settings.lang === 'ar' ? 'ar' : 'en';
const L = (s, p) => { let t = lang() === 'ar' && AR[s] != null ? AR[s] : s; return p ? t.replace(/\{(\w+)\}/g, (m, k) => p[k] != null ? p[k] : m) : t; };
// [singular, plural, Arabic: one, two, 3-10, 11-99]; feminine nouns take "واحدة"
const PLW = {
  lesson: ['lesson', 'lessons', 'درس', 'درسان', 'دروس', 'درساً'], course: ['course', 'courses', 'دورة', 'دورتان', 'دورات', 'دورة'],
  question: ['question', 'questions', 'سؤال', 'سؤالان', 'أسئلة', 'سؤالاً'], unit: ['unit', 'units', 'وحدة', 'وحدتان', 'وحدات', 'وحدة'],
  review: ['review', 'reviews', 'مراجعة', 'مراجعتان', 'مراجعات', 'مراجعة'], learner: ['learner', 'learners', 'متعلّم', 'متعلّمان', 'متعلّمين', 'متعلّماً'],
  certificate: ['certificate', 'certificates', 'شهادة', 'شهادتان', 'شهادات', 'شهادة'], report: ['report', 'reports', 'بلاغ', 'بلاغان', 'بلاغات', 'بلاغاً'],
  card: ['card', 'cards', 'بطاقة', 'بطاقتان', 'بطاقات', 'بطاقة'], term: ['term', 'terms', 'مصطلح', 'مصطلحان', 'مصطلحات', 'مصطلحاً'],
  min: ['min', 'min', 'دقيقة', 'دقيقتان', 'دقائق', 'دقيقة'], hour: ['h', 'h', 'ساعة', 'ساعتان', 'ساعات', 'ساعة'],
  step: ['step', 'steps', 'خطوة', 'خطوتان', 'خطوات', 'خطوة'], day: ['day', 'days', 'يوم', 'يومان', 'أيام', 'يوماً']
};
const FEM = new Set(['course', 'unit', 'review', 'certificate', 'card', 'min', 'hour', 'step']);
function plural(n, w) {
  const f = PLW[w] || [w, w + 's', w, w, w, w];
  if (lang() !== 'ar') return `${n} ${n === 1 ? f[0] : f[1]}`;
  const m = n % 100;
  if (n === 1) return `${f[2]} ${FEM.has(w) ? 'واحدة' : 'واحد'}`;
  if (n === 2) return f[3];
  if (m >= 3 && m <= 10) return `${n} ${f[4]}`;
  if (m >= 11) return `${n} ${f[5]}`;
  return `${n} ${f[2]}`;
}
const streakLen = n => lang() === 'ar' ? plural(n, 'day') : `${n}-day`;
const fmtMin = m => { m = Math.round(m); if (m < 60) return plural(m, 'min'); const h = Math.floor(m / 60), r = m % 60; return lang() === 'ar' ? plural(h, 'hour') + (r ? ' و' + plural(r, 'min') : '') : `${h} h${r ? ' ' + r + ' min' : ''}`; };
const locale = () => lang() === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : undefined;
const fmtDate = (d, opts) => new Date(d + 'T12:00').toLocaleDateString(locale(), opts);

/* ───────── Brand & icons ───────── */
const SYMBOL = 'M4 270 Q0 270 0 266 L0 244 C0 217 24 183 54 183 L180 183 Q184 183 184 187 L184 204 C184 240 159 270 123 270 Z M96 171 Q92 171 92 167 C92 132 119 101 155 101 L276 101 Q280 101 280 105 L280 117 C280 149 255 171 219 171 Z M198 87 Q194 87 194 83 C194 37 225 0 269 0 L345 0 Q349 0 349 4 L349 39 C349 67 328 87 299 87 Z';
const WORDMARK = '<g transform="translate(289.9 242) scale(.20 -.20)"><path d="M292 -12Q202 -12 138.5 19.0Q75 50 35 101L114 183Q153 138 198.5 116.5Q244 95 296 95Q356 95 388.0 122.0Q420 149 420 200Q420 242 396.0 263.5Q372 285 315 294L241 306Q144 323 103.0 376.5Q62 430 62 503Q62 603 127.0 656.5Q192 710 307 710Q389 710 448.5 684.0Q508 658 544 613L467 531Q439 564 400.0 583.5Q361 603 308 603Q194 603 194 509Q194 469 218.0 448.0Q242 427 300 417L373 404Q464 387 508.0 337.0Q552 287 552 209Q552 160 535.0 119.5Q518 79 485.0 49.5Q452 20 403.5 4.0Q355 -12 292 -12Z"/><path transform="translate(600 0)" d="M335 0Q261 0 226.0 39.0Q191 78 191 140V415H41V516H143Q174 516 187.0 528.5Q200 541 200 573V698H319V516H529V415H319V101H529V0Z"/><path transform="translate(1200 0)" d="M312 -12Q250 -12 202.0 7.0Q154 26 121.5 61.0Q89 96 72.0 145.5Q55 195 55 257Q55 320 72.5 370.0Q90 420 122.0 455.0Q154 490 199.5 509.0Q245 528 302 528Q358 528 403.0 509.5Q448 491 479.5 457.0Q511 423 528.0 375.0Q545 327 545 269V227H183V214Q183 158 218.0 123.5Q253 89 316 89Q364 89 398.5 108.5Q433 128 456 160L529 87Q501 46 447.5 17.0Q394 -12 312 -12ZM303 434Q249 434 216.0 400.0Q183 366 183 310V303H417V312Q417 368 386.5 401.0Q356 434 303 434Z"/><path transform="translate(1800 0)" d="M490 0Q443 0 417.5 23.5Q392 47 387 89H382Q368 41 327.0 14.5Q286 -12 226 -12Q148 -12 102.0 29.0Q56 70 56 143Q56 299 285 299H376V333Q376 382 352.0 407.0Q328 432 274 432Q225 432 195.0 413.0Q165 394 144 364L71 426Q95 469 148.5 498.5Q202 528 287 528Q389 528 446.5 480.5Q504 433 504 339V96H565V0ZM269 76Q315 76 345.5 97.5Q376 119 376 156V225H288Q183 225 183 159V139Q183 108 206.0 92.0Q229 76 269 76Z"/><path transform="translate(2400 0)" d="M403 91H396Q375 44 338.5 16.0Q302 -12 242 -12Q198 -12 161.5 4.5Q125 21 99.0 54.5Q73 88 59.0 139.0Q45 190 45 258Q45 394 99.0 461.0Q153 528 242 528Q302 528 338.5 500.0Q375 472 396 425H403V740H531V0H403ZM296 90Q318 90 337.5 95.5Q357 101 371.5 111.5Q386 122 394.5 138.5Q403 155 403 177V339Q403 361 394.5 377.5Q386 394 371.5 404.5Q357 415 337.5 420.5Q318 426 296 426Q240 426 209.5 392.0Q179 358 179 299V217Q179 158 209.5 124.0Q240 90 296 90Z"/><path transform="translate(3000 0)" d="M441 516H571L324 -92Q303 -145 268.0 -172.5Q233 -200 169 -200H75V-99H198L237 5L29 516H165L244 300L299 136H306L361 300Z"/></g>';
const LOGO = `<svg class="logo" viewBox="22 78 1000 214" role="img" aria-label="Steady" dir="ltr"><path transform="translate(30 87.15) scale(.63)" d="${SYMBOL}"/>${WORDMARK}</svg>`;
const ICON = {
  back: svg('<path d="M15 18l-6-6 6-6"/>', 'flip'),
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>', ''),
  chev: svg('<path d="m6 9 6 6 6-6"/>', 'chev'),
  arrow: svg('<path d="M9 6l6 6-6 6"/>', 'ar flip'),
  menu: svg('<path d="M4 6h16M4 12h11M4 18h16"/>'),
  bell: svg('<path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16zM10 21h4"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', ''),
  play: svg('<path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>', ''),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', ''),
  test: svg('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>', ''),
  award: svg('<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>', ''),
  pen: svg('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', ''),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  home: svg('<path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4v-5.5h-6v5.5H5A1.5 1.5 0 0 1 3.5 19z"/>'),
  book: svg('<path d="M12 6.5C10 5 7.5 4.5 3.5 4.5v14c4 0 6.5.5 8.5 2 2-1.5 4.5-2 8.5-2v-14c-4 0-6.5.5-8.5 2zM12 6.5v14"/>'),
  compass: svg('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
  spark: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'),
  refresh: svg('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>'),
  cards: svg('<rect x="3" y="7" width="14" height="13" rx="2"/><path d="M7 4h12a2 2 0 0 1 2 2v11"/>'),
  chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  people: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .6 3.2 2.3 3.5 5.2"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>'),
  hand: svg('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7-3 0-4.5-1.5-6-4l-1.8-3a1.5 1.5 0 0 1 2.5-1.6L8 15"/>'),
  pause: svg('<path d="M8 5v14M16 5v14"/>', ''),
  resume: svg('<path d="M7 4.5v15l12-7.5z"/>', ''),
  prev: svg('<path d="M18 6 9 12l9 6zM6 6v12"/>', 'flip'),
  next: svg('<path d="m6 6 9 6-9 6zM18 6v12"/>', 'flip'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', '')
};

/* ───────── Courses ───────── */
const COURSES = (window.COURSES || []).filter(c => c && c.id && Array.isArray(c.lessons) && Array.isArray(c.units));
const PRACTICE = window.PRACTICE || {};
const testMins = n => Math.round(n * MIN_PER_Q + 1);
const isStr = s => typeof s === 'string' && s.trim().length > 0;
// Interactive "Try it" exercises: sort into groups, put in order, pick the right ones, guided steps, or a calculator (built-in courses only).
function cleanPractice(p) {
  if (!p || typeof p !== 'object' || !isStr(p.title)) return null;
  const base = {type: p.type, title: p.title, intro: isStr(p.intro) ? p.intro : '', mins: p.mins};
  if (p.type === 'sort') {
    const buckets = Array.isArray(p.buckets) ? p.buckets.filter(isStr).slice(0, 4) : [];
    const items = (Array.isArray(p.items) ? p.items : []).filter(i => Array.isArray(i) && isStr(i[0]) && Number.isInteger(i[1]) && i[1] >= 0 && i[1] < buckets.length).slice(0, 10);
    return buckets.length >= 2 && items.length >= 3 ? {...base, buckets, items: items.map(i => [i[0], i[1], isStr(i[2]) ? i[2] : ''])} : null;
  }
  if (p.type === 'order') { const items = (Array.isArray(p.items) ? p.items : []).filter(isStr).slice(0, 8); return items.length >= 3 ? {...base, items, why: isStr(p.why) ? p.why : ''} : null; }
  if (p.type === 'pick') {
    const items = (Array.isArray(p.items) ? p.items : []).filter(i => Array.isArray(i) && isStr(i[0])).slice(0, 10).map(i => [i[0], !!i[1], isStr(i[2]) ? i[2] : '']);
    return items.length >= 3 && items.some(i => i[1]) ? {...base, items} : null;
  }
  if (p.type === 'steps') {
    const steps = (Array.isArray(p.steps) ? p.steps : []).filter(s => Array.isArray(s) && isStr(s[0])).slice(0, 6).map(s => [s[0], isStr(s[1]) ? s[1] : '']);
    return steps.length ? {...base, steps, sample: isStr(p.sample) ? p.sample : '', checks: (Array.isArray(p.checks) ? p.checks : []).filter(isStr).slice(0, 6)} : null;
  }
  if (p.type === 'calc') {
    const inputs = (Array.isArray(p.inputs) ? p.inputs : []).filter(i => i && isStr(i.k) && isStr(i.label) && Number.isFinite(i.v));
    const outputs = (Array.isArray(p.outputs) ? p.outputs : []).filter(o => o && isStr(o.label) && typeof o.f === 'function');
    return inputs.length && outputs.length ? {...base, inputs, outputs, note: typeof p.note === 'function' ? p.note : null} : null;
  }
  return null;
}
const practiceMins = p => p ? (p.mins || (p.type === 'steps' ? 4 : 2)) : 0;
function prepCourse(c, ci) {
  const h = [...String(c.id)].reduce((a, ch) => a + ch.charCodeAt(0), 0), pr = PRACTICE[c.id] || {};
  c.theme = [1, 2, 3, 4].includes(c.theme) ? c.theme : ((ci == null ? h : ci) % 4) + 1;     // gradient + tag colour
  c.short = c.short || c.title.split(/\s+&\s+|\s+/)[0];
  c.lang = c.lang === 'ar' ? 'ar' : 'en';
  c.units.forEach(u => { u.scenarios = u.scenarios || []; u.objectives = u.objectives || []; });
  c.lessons.forEach((l, i) => {
    l.index = i; l.points = l.points || []; l.terms = l.terms || []; l.quiz = l.quiz || []; l.body = l.body || [];
    l.practice = cleanPractice(l.practice || pr[l.id]);
    l.mins = Math.max(3, Math.round(words([l.intro || '', ...l.body, ...l.points, l.example || '', l.myth || '', ...l.terms.flat()]) / WPM + l.quiz.length * MIN_PER_Q + practiceMins(l.practice)));
    l.deepMins = Math.max(1, Math.round(words(l.deeper || ['']) / WPM));
  });
  c.byId = Object.fromEntries(c.lessons.map(l => [l.id, l]));
  c.unit = n => c.units.find(u => u.n === +n);
  c.unitLessons = n => c.lessons.filter(l => l.unit === +n);
  c.terms = new Map(); for (const l of c.lessons) for (const [t, d] of l.terms) { const k = t.toLowerCase(); if (!c.terms.has(k)) c.terms.set(k, {k: 't:' + k, t, d, l}); }
  c.totalMins = c.lessons.reduce((a, l) => a + l.mins, 0) + c.units.length * testMins(TEST_Q) + testMins(FINAL_Q);
  return c;
}
COURSES.forEach(prepCourse);
const CB = Object.fromEntries(COURSES.map(c => [c.id, c]));
/* Cloud courses (created or enrolled) are cached on the device so they work offline. */
const LIB_KEY = 'steady-library';
const libRead = () => { try { return JSON.parse(localStorage.getItem(LIB_KEY) || '{}') || {}; } catch (e) { return {}; } };
let library = libRead();                       // {uuid: {content, meta:{version,is_owner,visibility,review_status,review_note,author,status,ai}}}
const libSave = () => { try { localStorage.setItem(LIB_KEY, JSON.stringify(library)); } catch (e) { toast(L('Your phone is out of space for course downloads.')); } };
const cloudId = uuid => 'u-' + uuid;
function installCourse(uuid) {
  const entry = library[uuid]; if (!entry || entry.meta.status !== 'ready' || !entry.content || !Array.isArray(entry.content.lessons)) return null;
  const c = prepCourse(Object.assign(JSON.parse(JSON.stringify(entry.content)), {id: cloudId(uuid), cloud: {uuid, ...entry.meta}}));
  const i = COURSES.findIndex(x => x.id === c.id); if (i >= 0) COURSES[i] = c; else COURSES.push(c);
  CB[c.id] = c; return c;
}
function uninstallCourse(uuid) { const id = cloudId(uuid), i = COURSES.findIndex(x => x.id === id); if (i >= 0) COURSES.splice(i, 1); delete CB[id]; }
const P = (c, ...parts) => `#/c/${c.id}${parts.length ? '/' + parts.join('/') : ''}`;
const tag = (c, text) => `<span class="tag t${c.theme}" ${AUTO}>${esc(text || c.short)}</span>`;
function qOf(c, key) {
  let m = /^u(\d+)#(\d+)$/.exec(key);
  if (m) { const u = c.unit(m[1]), q = u && u.scenarios && u.scenarios[+m[2]]; return q && {q, label: L('Unit {n} scenario', {n: m[1]})}; }
  m = /^(.+)#(\d+)$/.exec(key);
  if (m && c.byId[m[1]]) { const q = c.byId[m[1]].quiz[+m[2]]; return q && {q, label: c.byId[m[1]].title}; }
  return null;
}
const validCard = (c, k) => k.startsWith('t:') ? c.terms.has(k.slice(2)) : !!qOf(c, k);

/* ───────── State ───────── */
const freshCourse = () => ({done:{}, scores:{}, cards:{}, current:null, tests:{}, certDate:null, notes:{}, noteAt:{}, tries:{}, stats:{answered:0, correct:0}});
const deviceLang = () => /^ar\b/i.test(navigator.language || '') ? 'ar' : 'en';
const fresh = () => ({v:3, courses:{}, last:null, streak:{count:0,last:null}, log:{}, goal:10, goalHit:null, welcomed:false, settings:{theme:'auto', size:'m', name:'', lang:deviceLang(), rate:1, voice:{}}});
function sanitizeCourse(c, x) {
  const s = freshCourse();
  if (!x || typeof x !== 'object') return s;
  for (const [k, v] of entries(x.done)) if (c.byId[k]) s.done[k] = isDate(v) ? v : today();
  for (const [k, v] of entries(x.scores)) if (c.byId[k] && Array.isArray(v)) s.scores[k] = [int(v[0], 9), int(v[1], 9)];
  for (const [k, v] of entries(x.cards)) if (validCard(c, k) && v && isDate(v.due)) s.cards[k] = {box: int(v.box, 5), due: v.due};
  if (c.byId[x.current]) s.current = x.current;
  for (const [k, v] of entries(x.tests)) if ((k === 'final' || c.unit(k)) && Number.isFinite(v)) s.tests[k] = Math.max(0, Math.min(100, Math.round(v)));
  if (isDate(x.certDate)) s.certDate = x.certDate;
  for (const [k, v] of entries(x.notes)) if (c.byId[k] && typeof v === 'string' && v.trim()) s.notes[k] = v.slice(0, 5000);
  for (const [k, v] of entries(x.noteAt)) if (c.byId[k] && Number.isFinite(v)) s.noteAt[k] = v;
  for (const [k, v] of entries(x.tries)) if (c.byId[k] && v && typeof v === 'object') s.tries[k] = {done: isDate(v.done) ? v.done : null, a: Array.isArray(v.a) ? v.a.slice(0, 8).map(t => String(t == null ? '' : t).slice(0, 2000)) : []};
  if (x.stats) s.stats = {answered: int(x.stats.answered), correct: Math.min(int(x.stats.correct), int(x.stats.answered))};
  return s;
}
function sanitizeGlobal(s, x) {
  if (!x || typeof x !== 'object') return s;
  if (x.streak) s.streak = {count: int(x.streak.count), last: isDate(x.streak.last) ? x.streak.last : null};
  for (const [k, v] of entries(x.log)) if (isDate(k) && Number.isFinite(v) && v > 0) s.log[k] = Math.min(v, 1440);
  if (GOALS.includes(x.goal)) s.goal = x.goal;
  if (isDate(x.goalHit)) s.goalHit = x.goalHit;
  if (x.welcomed === true) s.welcomed = true;
  const st = x.settings;
  if (st) s.settings = {theme: ['auto','light','dark'].includes(st.theme) ? st.theme : 'auto', size: ['s','m','l'].includes(st.size) ? st.size : 'm', name: typeof st.name === 'string' ? st.name.slice(0, 60) : '',
    lang: ['en', 'ar'].includes(st.lang) ? st.lang : 'en', rate: RATES.includes(st.rate) ? st.rate : 1,
    voice: Object.fromEntries(entries(st.voice).filter(([k, v]) => ['en', 'ar'].includes(k) && typeof v === 'string').map(([k, v]) => [k, v.slice(0, 200)]))};
  return s;
}
function sanitize(x) {
  const s = sanitizeGlobal(fresh(), x);
  for (const [id, v] of entries(x && x.courses)) s.courses[id] = CB[id] ? sanitizeCourse(CB[id], v) : v;   // keep data for courses not loaded
  if (CB[x && x.last]) s.last = x.last;
  return s;
}
function fromV2(x) {            // AI Study 2.x: a single AI course at the top level
  const s = sanitizeGlobal(fresh(), x);
  s.welcomed = false;
  if (CB[AI_ID]) { s.courses[AI_ID] = sanitizeCourse(CB[AI_ID], x); s.last = AI_ID; }
  return s;
}
function fromV1(o) {            // AI Study 1.x
  const d = isDate(o && o.lastDay) ? o.lastDay : today(), done = {};
  for (const i of (Array.isArray(o && o.done) ? o.done : [])) for (const id of (OLD_MAP[i] || [])) done[id] = d;
  return fromV2({done, streak: o && isDate(o.lastDay) ? {count: int(o.streak), last: o.lastDay} : null});
}
let notice = '', migrated = false, state = null;
Object.keys(library).forEach(installCourse);
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { notice = 'Storage is blocked in this browser, so progress can’t be saved.'; return fresh(); }
  try {
    if (raw) return sanitize(JSON.parse(raw));
    const v2 = localStorage.getItem(V2_KEY), v1 = localStorage.getItem(V1_KEY);
    if (v2 || v1) { migrated = true; notice = 'Welcome to Steady. Your AI Foundations progress came with you.'; return v2 ? fromV2(JSON.parse(v2)) : fromV1(JSON.parse(v1)); }
  } catch (e) {
    try { localStorage.setItem(KEY + '-unreadable-' + Date.now(), raw); } catch (_) {}
    notice = 'Saved progress was unreadable. A copy was kept, and you can restore a backup in Settings.';
  }
  return fresh();
}
state = load();
if (migrated) save();
function save(fromSync) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); if (!fromSync && cloudReady) scheduleSync(); return true; }
  catch (e) { toast(L('Couldn’t save progress. Storage may be full or blocked.')); return false; }
}
const EMPTY = freshCourse();
const cs = (c, create) => state.courses[c.id] || (create ? (state.courses[c.id] = freshCourse()) : EMPTY);

/* ───────── Derived ───────── */
const doneCount = c => c.lessons.filter(l => cs(c).done[l.id]).length;
const started = c => doneCount(c) > 0 || !!cs(c).current || Object.keys(cs(c).tests).length > 0;
const nextLesson = c => c.lessons.find(l => !cs(c).done[l.id]) || null;
const continueLesson = c => { const s = cs(c); return (s.current && !s.done[s.current] && c.byId[s.current]) || nextLesson(c); };
const passed = (c, k) => (cs(c).tests[k] || 0) >= PASS;
const remainingMins = c => c.lessons.filter(l => !cs(c).done[l.id]).reduce((a, l) => a + l.mins, 0) + c.units.filter(u => !passed(c, u.n)).length * testMins(TEST_Q) + (passed(c, 'final') ? 0 : testMins(FINAL_Q));
const certEarned = c => !!cs(c).certDate && doneCount(c) === c.lessons.length && passed(c, 'final');
const isDue = (c, k) => { const x = cs(c).cards[k]; return x && x.due <= today(); };
const dueQs = () => COURSES.flatMap(c => Object.keys(cs(c).cards).filter(k => !k.startsWith('t:') && isDue(c, k)).map(key => ({c, key})));
const dueTerms = () => COURSES.flatMap(c => [...c.terms.values()].filter(x => cs(c).done[x.l.id] && (!cs(c).cards[x.k] || isDue(c, x.k))).map(x => ({c, key: x.k})));
const streakNow = () => { const t = today(), s = state.streak; return s.last === t || s.last === addDays(t, -1) ? s.count : 0; };
const minsOn = d => state.log[d] || 0;
const totalMins = () => Object.values(state.log).reduce((a, b) => a + b, 0);
const firstName = () => (state.settings.name.trim().split(/\s+/)[0] || '');
const initial = () => (state.settings.name.trim()[0] || 'S').toUpperCase();
const MASTERY = {Mastered: ['Mastered', 'tg'], Familiar: ['Familiar', 't1'], Learning: ['Learning', 't2']};
function mastery(c, id) {
  if (!cs(c).done[id]) return null;
  const boxes = c.byId[id].quiz.map((_, n) => (cs(c).cards[`${id}#${n}`] || {box: 0}).box);
  const avg = boxes.reduce((a, b) => a + b, 0) / boxes.length;
  return avg >= 4 ? 'Mastered' : avg >= 2 ? 'Familiar' : 'Learning';
}
function bumpStreak() { const t = today(), s = state.streak; if (s.last === t) return; s.count = s.last === addDays(t, -1) ? s.count + 1 : 1; s.last = t; }
function logMins(m) {
  const t = today(); state.log[t] = Math.round(((state.log[t] || 0) + m) * 100) / 100;
  const keys = Object.keys(state.log).sort(); while (keys.length > 400) delete state.log[keys.shift()];
  bumpStreak();
  if (state.goalHit !== t && state.log[t] >= state.goal) { state.goalHit = t; setTimeout(() => toast(L('Daily goal reached: {n}. Nice work!', {n: fmtMin(state.goal)})), 300); }
}
function grade(c, key, correct, spaced) {
  const cards = cs(c, true).cards, x = cards[key];
  const box = correct ? (spaced ? Math.min((x ? x.box : 0) + 1, 5) : Math.max(x ? x.box : 0, 1)) : 0;
  cards[key] = {box, due: addDays(today(), INTERVALS[box])};
}
const TABS = {home: 'Home', courses: 'Courses', friends: 'Friends', search: 'Search'};
function applySettings() {
  const r = document.documentElement, {theme, size} = state.settings;
  if (theme === 'auto') delete r.dataset.theme; else r.dataset.theme = theme;
  r.dataset.size = size; r.lang = lang(); r.dir = lang() === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('.tabs a').forEach(a => { const s = a.querySelector('span'); if (s) s.textContent = L(TABS[a.dataset.tab]); });
  const t = $('#tabs'); if (t) t.setAttribute('aria-label', L('Sections'));
}
function setLang(v) { if (v === lang()) return; stopReading(); state.settings.lang = v; save(); applySettings(); route(); }

/* ───────── UI helpers ───────── */
let toastTimer;
function toast(msg, action, onAction) {
  const t = $('#toast');
  t.innerHTML = esc(msg) + (action ? ` <button type="button">${esc(action)}</button>` : '');
  if (action) t.querySelector('button').onclick = () => { t.classList.remove('show'); onAction(); };
  t.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), action ? 10000 : 3800);
}
let navigated = false;
function goBack(fallback) { if (navigated && history.length > 1) history.back(); else location.replace(fallback); }
const dueCount = () => dueQs().length + dueTerms().length;
function setTab(tab, plum) {
  document.body.classList.toggle('full', tab === null);
  document.body.classList.toggle('plum', !!plum); document.documentElement.classList.toggle('plum', !!plum);
  document.querySelectorAll('.tabs a').forEach(a => a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
}
function header() {
  const n = dueCount(), cert = COURSES.some(certEarned);
  return `<header class="hdr"><button class="ib" data-menu aria-label="${L('Menu')}" aria-haspopup="dialog">${ICON.menu}</button><a class="brand" href="#/home" aria-label="Steady">${LOGO}</a><span class="sp"></span>
    <a class="ib" href="#/review" aria-label="${n ? L('Review, {n} due', {n}) : L('Review')}">${ICON.bell}${n ? `<b class="dot">${n > 99 ? '99+' : n}</b>` : ''}</a>
    <a class="avatar" href="#/you" aria-label="${L('Your progress')}">${esc(initial())}${cert ? '<i class="vbadge"></i>' : ''}</a></header>`;
}
const topbar = (label, extra = '') => `<div class="topbar"><button class="iconbtn" id="back" aria-label="${L('Back')}">${ICON.back}</button><span class="label">${label}</span>${extra || '<span class="iconbtn"></span>'}</div>`;
const progressTop = (pct, count) => `<div class="topbar"><button class="iconbtn" id="back" aria-label="${L('Close')}">${ICON.close}</button><div class="bar"><i style="width:${pct}%"></i></div><span class="count">${count}</span></div>`;
const langSeg = () => `<div class="seg" role="group" aria-label="${L('Language')}"><button data-lang="en" aria-pressed="${lang() === 'en'}">English</button><button data-lang="ar" aria-pressed="${lang() === 'ar'}" lang="ar">العربية</button></div>`;
const bindLang = (root = view, after) => root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { setLang(b.dataset.lang); if (after) after(); });

/* ───────── Menu (slide-out) ───────── */
function openMenu() {
  closeMenu(true);
  const n = dueCount(), acct = CLOUD ? (signedIn() ? L('Account') : L('Create account or sign in')) : '';
  const link = (href, icon, text, extra = '') => `<a href="${href}" class="${location.hash === href ? 'on' : ''}">${icon}<span>${text}</span>${extra}</a>`;
  const el = document.createElement('div');
  el.className = 'drawer'; el.id = 'drawer';
  el.innerHTML = `<div class="scrim" data-close></div><nav class="dpanel" role="dialog" aria-modal="true" aria-label="${L('Menu')}">
    <div class="dhead"><span class="brand">${LOGO}</span><button class="iconbtn" data-close aria-label="${L('Close menu')}">${ICON.close}</button></div>
    <a class="dme" href="#/you"><span class="avatar">${esc(initial())}</span><span><b>${esc(state.settings.name.trim() || L('Learner'))}</b><small>${L('Your progress')}</small></span></a>
    <div class="dlinks">
      ${link('#/home', ICON.home, L('Home'))}${link('#/courses', ICON.book, L('My courses'))}${link('#/catalog', ICON.compass, L('Explore courses'))}
      ${link('#/create', ICON.spark, L('Create a course with AI'))}${link('#/review', ICON.refresh, L('Review'), n ? `<b class="dcount">${n > 99 ? '99+' : n}</b>` : '')}
      ${link('#/you', ICON.chart, L('My progress'))}${link('#/friends', ICON.people, L('Friends'))}${link('#/search', ICON.search.replace('<svg ', '<svg class="ic" '), L('Search'))}</div>
    <div class="dlang">${ICON.globe}<span>${L('Language')}</span>${langSeg()}</div>
    <div class="dlinks">${link('#/settings', ICON.gear, L('Settings'))}${CLOUD ? link('#/account', ICON.user, acct) : ''}</div>
    <p class="dver">Steady ${VERSION}</p></nav>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('open'));
  el.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeMenu());
  el.querySelectorAll('.dlinks a, .dme').forEach(a => a.addEventListener('click', () => { if (a.getAttribute('href') === location.hash) closeMenu(); }));
  bindLang(el, () => openMenu());
  const first = el.querySelector('.dlinks a'); if (first) first.focus({preventScroll: true});
}
function closeMenu(instant) {
  const el = $('#drawer'); if (!el) return;
  if (instant) return el.remove();
  el.classList.remove('open'); setTimeout(() => el.remove(), 220);
}
document.addEventListener('click', e => { if (e.target.closest('[data-menu]')) openMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ───────── Welcome (first run) ───────── */
const WELCOME_ART = `<svg class="art" viewBox="0 0 300 240" role="img" aria-label="Stacked course cards with a graduation cap">
  <defs><linearGradient id="w1" x1="0" y1="0" x2="1" y2="1"><stop offset=".17" stop-color="#548ad8"/><stop offset=".85" stop-color="#8a4bd3"/></linearGradient>
  <linearGradient id="w2" x1="0" y1="0" x2="1" y2="1"><stop offset=".17" stop-color="#f33e62"/><stop offset=".85" stop-color="#f79334"/></linearGradient>
  <linearGradient id="w3" x1="0" y1="0" x2="1" y2="1"><stop offset=".17" stop-color="#893e9c"/><stop offset=".85" stop-color="#f82b73"/></linearGradient></defs>
  <circle cx="150" cy="120" r="104" fill="#fff" opacity=".06"/><circle cx="150" cy="120" r="72" fill="#fff" opacity=".05"/>
  <g transform="rotate(-12 150 150)"><rect x="54" y="118" width="190" height="70" rx="16" fill="url(#w3)"/></g>
  <g transform="rotate(-4 150 130)"><rect x="58" y="96" width="186" height="70" rx="16" fill="url(#w2)"/><path d="M90 120l14-12M120 140l20-17M170 118l12-10M200 146l18-15" stroke="#fff" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/></g>
  <g transform="rotate(5 150 110)"><rect x="62" y="74" width="182" height="70" rx="16" fill="url(#w1)"/><circle cx="98" cy="136" r="18" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><circle cx="98" cy="136" r="30" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/><rect x="150" y="98" width="72" height="8" rx="4" fill="#fff" opacity=".9"/><rect x="170" y="114" width="52" height="6" rx="3" fill="#fff" opacity=".6"/></g>
  <path d="M150 22 214 50 150 78 86 50z" fill="#fff"/><path d="M118 64v18c0 9 14 16 32 16s32-7 32-16V64l-32 14z" fill="#fff" opacity=".85"/><path d="M206 54v26" stroke="#fff" stroke-width="4" stroke-linecap="round"/><circle cx="206" cy="84" r="6" fill="#f79334"/>
  <path d="M42 70l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#f79334"/><path d="M256 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fff" opacity=".8"/><circle cx="252" cy="196" r="5" fill="#f82b73"/><circle cx="40" cy="190" r="4" fill="#548ad8"/>
</svg>`;
function renderWelcome() {
  setTab(null, true);
  view.innerHTML = `<div class="plumbg"></div><div class="welcome fade">
    <div class="wtop"><span class="brand">${LOGO}</span>${langSeg()}</div>
    ${WELCOME_ART}
    <h1>${L('Small steps.<br>Steady progress.')}</h1>
    <label class="field"><span>${L('What should we call you?')}</span><input id="wname" value="${esc(state.settings.name)}" maxlength="60" placeholder="${L('Your name')}" autocomplete="given-name"></label>
    <div class="stack"><button class="btn white" id="start">${L('Let’s start')} ${ICON.arrow}</button></div></div>`;
  bindLang(view);
  $('#wname').oninput = e => { state.settings.name = e.target.value.slice(0, 60); };
  $('#start').onclick = () => { state.settings.name = $('#wname').value.trim().slice(0, 60); state.welcomed = true; save(); location.replace(pendingCode ? '#/add/' + pendingCode : '#/home'); };
}

/* ───────── Home ───────── */
const KINDS = {
  lesson: ['Continue lesson', ICON.book, 'k1'], review: ['Due for review', ICON.refresh, 'k2'], cards: ['Flashcards', ICON.cards, 'k3'],
  test: ['Unit test', ICON.test.replace('<svg ', '<svg class="ic" '), 'k4'], start: ['New course', ICON.plus, 'k5']
};
function upNext() {
  const items = [], mine = COURSES.filter(started);
  const lessonItem = c => { const l = continueLesson(c); return {kind: 'lesson', href: P(c, 'lesson', l.id), title: l.title, c, meta: `${L('Lesson {n} of {t}', {n: l.index + 1, t: c.lessons.length})} · ${fmtMin(l.mins)}`}; };
  const focus = [CB[state.last], ...mine].find(c => c && started(c) && continueLesson(c));
  if (focus) items.push(lessonItem(focus));
  const dq = dueQs(), dt = dueTerms();
  if (dq.length) items.push({kind: 'review', href: '#/review/due', title: L('Daily review'), meta: `${plural(Math.min(dq.length, REVIEW_MAX), 'question')} · ${fmtMin(Math.min(dq.length, REVIEW_MAX) * MIN_PER_Q)}`});
  if (dt.length) items.push({kind: 'cards', href: '#/cards', title: L('Key-term flashcards'), meta: plural(Math.min(dt.length, CARDS_MAX), 'card')});
  for (const c of mine) for (const u of c.units) if (items.length < 4 && c.unitLessons(u.n).every(l => cs(c).done[l.id]) && !passed(c, u.n)) items.push({kind: 'test', href: P(c, 'test', u.n), title: L('Unit {n} test', {n: u.n}) + ' · ' + u.title, c, meta: `${plural(TEST_Q, 'question')} · ${fmtMin(testMins(TEST_Q))}`});
  for (const c of mine) if (items.length < 4 && c !== focus && continueLesson(c)) items.push(lessonItem(c));
  for (const c of COURSES) if (items.length < 4 && !started(c)) items.push({kind: 'start', href: P(c), title: c.title, c, meta: `${plural(c.lessons.length, 'lesson')} · ${fmtMin(c.totalMins)}`});
  return {items: items.slice(0, 4), focus};
}
const nextRow = it => { const [label, icon, cls] = KINDS[it.kind];
  return `<a class="nrow" href="${it.href}"><span class="nic ${cls}">${icon}</span><span class="nt"><small>${L(label)}${it.c && it.kind !== 'start' ? ` · <span ${AUTO}>${esc(it.c.short)}</span>` : ''}</small><b ${AUTO}>${esc(it.title)}</b><span class="nm">${it.meta}</span></span>${ICON.arrow}</a>`; };
function renderHome() {
  setTab('home');
  const name = firstName(), dq = dueQs().length, dt = dueTerms().length, m = Math.floor(minsOn(today())), st = streakNow();
  const {items, focus} = upNext();
  const line = dq + dt ? L('You have <b>{n} due</b> today', {n: plural(dq + dt, 'review')}) : COURSES.some(started) ? L('You’re <b class="ok">all caught up</b> on reviews') : L('Pick a course and start your first lesson');
  const goalTxt = m >= state.goal ? L('Goal reached!') + (st ? ' ' + L('You’re on a {n} streak.', {n: streakLen(st)}) : '') : st ? L('Reach {g} today to grow your {n} streak.', {g: fmtMin(state.goal), n: streakLen(st)}) : L('Reach {g} today to start a streak.', {g: fmtMin(state.goal)});
  const heroHref = focus ? P(focus, 'lesson', continueLesson(focus).id) : (COURSES[0] ? P(COURSES[0]) : '#/courses');
  view.innerHTML = header() + `<div class="fade">
    <div class="hi"><h1>${name ? L('Hi {name},', {name: esc(name)}) : L('Hi,')}</h1><p>${line}</p></div>
    <a class="hero" href="${heroHref}"><div class="hx"><div class="num"><b>${m}</b><span>${L('min today')}</span></div><p>${goalTxt}</p></div><span class="go">${focus ? L('Continue') : L('Start learning')}</span></a>
    ${items.length ? `<h2 class="sec">${L('Up next')}</h2><div class="nlist">${items.map(nextRow).join('')}</div>` : ''}
    ${friendsMini()}
    <h2 class="sec">${L('Courses')}</h2>
    <div class="grid2">${COURSES.map(c => `<a class="gbtn cg${c.theme}" href="${P(c)}" ${AUTO}>${esc(c.title)}</a>`).join('')}</div>
    <div class="hint">${ICON.plus}<div><b>${L('Want to learn another subject?')}</b>${L('Let Claude write a course on any topic, or explore courses other learners have shared.')}
      <div class="hbtns"><a class="btn small primary" href="#/create">${L('Create with AI')}</a><a class="btn small" href="#/catalog">${L('Explore')}</a></div></div></div>
  </div>`;
}

/* ───────── Courses tab (plum library) ───────── */
function renderCourses() {
  setTab('courses', true);
  view.innerHTML = `<div class="plumbg"></div><div class="on-plum">${header()}</div><div class="fade">
    <h1 class="plum-title">${L('Courses')}</h1><p class="plum-sub">${plural(COURSES.length, 'course')} · ${plural(COURSES.reduce((a, c) => a + c.lessons.length, 0), 'lesson')}</p>
    <div class="stack-cards">${COURSES.map(c => { const n = doneCount(c), pct = Math.round(n / c.lessons.length * 100);
      return `<a class="scard cg${c.theme}" href="${P(c)}"><b ${AUTO}>${esc(c.title)}</b><small>${certEarned(c) ? L('Completed ✓') : started(c) ? L('{n} of {t} lessons', {n, t: c.lessons.length}) : `${plural(c.lessons.length, 'lesson')} · ${fmtMin(c.totalMins)}`}</small>${started(c) ? `<span class="sbar"><i style="width:${pct}%"></i></span>` : ''}</a>`; }).join('')}</div>
    ${Object.entries(library).filter(([, e]) => e.meta.status !== 'ready').map(([id, e]) => `<a class="rowlink plumrow" href="#/build/${id}"><span><b style="font-weight:500" ${AUTO}>${esc(e.content.title)}</b><small>${L('Still being written · tap to continue')}</small></span>${ICON.arrow}</a>`).join('')}
    <div class="plumbtns"><a class="btn white" href="#/create">${ICON.plus} ${L('Create with AI')}</a><a class="btn plumbtn" href="#/catalog">${ICON.compass} ${L('Explore')}</a></div>
    <p class="plum-note">${L('Create a course on any subject with Claude, or explore courses others have shared. Every course works the same way: short lessons, hands-on practice, quizzes, spaced review, unit tests and a certificate.')}</p>
  </div>`;
}

/* ───────── Course overview ───────── */
function renderCourse(c) {
  setTab('courses');
  const s = cs(c), next = continueLesson(c), n = doneCount(c), pct = Math.round(n / c.lessons.length * 100);
  let nx, href, btn;
  if (next) { nx = `<small>${n || s.current ? L('Continue') : L('Start here')} · ${L('Unit {n}', {n: next.unit})}</small><b ${AUTO}>${esc(next.title)}</b>`; href = P(c, 'lesson', next.id); btn = n || s.current ? L('Continue') : L('Start'); }
  else if (!certEarned(c)) { nx = `<small>${L('All lessons complete')}</small><b>${L('Final exam')} · ${plural(FINAL_Q, 'question')}</b>`; href = P(c, 'final'); btn = L('Take exam'); }
  else { nx = `<small>${L('Course complete')}</small><b>${L('Your certificate')}</b>`; href = P(c, 'certificate'); btn = L('View'); }
  const openUnit = next ? next.unit : 0;
  const units = c.units.map(u => {
    const ls = c.unitLessons(u.n), d = ls.filter(l => s.done[l.id]).length, mins = ls.reduce((a, l) => a + l.mins, 0) + testMins(TEST_Q);
    const best = s.tests[u.n], complete = d === ls.length && passed(c, u.n);
    const rows = ls.map(l => `<li><a class="lrow ${s.done[l.id] ? 'done' : ''} ${next && l.id === next.id ? 'next' : ''}" href="${P(c, 'lesson', l.id)}">
      <span class="dot2"></span><span class="lt" ${AUTO}>${esc(l.title)}</span>${l.practice ? `<span class="pdot" title="${L('Includes a hands-on exercise')}">${ICON.hand}</span>` : ''}<span class="lm">${fmtMin(l.mins)}</span></a></li>`).join('');
    return `<details class="unit ${complete ? 'complete' : ''}" ${u.n === openUnit ? 'open' : ''}>
      <summary><span class="unum">${complete ? '✓' : u.n}</span><span class="t"><b ${AUTO}>${esc(u.title)}</b><small>${L('{d} of {t} lessons', {d, t: ls.length})} · ${fmtMin(mins)}</small></span>${ICON.chev}</summary>
      ${u.objectives.length ? `<div class="obj"><p>${L('You’ll be able to')}</p><ul ${AUTO}>${u.objectives.map(o => `<li ${AUTO}>${esc(o)}</li>`).join('')}</ul></div>` : ''}
      <ol class="lessons">${rows}
        <li><a class="lrow extra" href="${P(c, 'unit', u.n)}"><span class="ico">${ICON.list}</span><span class="lt">${L('Unit recap & flashcards')}</span><span class="lm"></span></a></li>
        <li><a class="lrow extra" href="${P(c, 'test', u.n)}"><span class="ico ${passed(c, u.n) ? 'ok' : ''}">${ICON.test}</span><span class="lt">${L('Unit test')}</span><span class="lm">${best != null ? `<span class="score-chip ${passed(c, u.n) ? 'ok' : ''}">${best}%</span>` : plural(TEST_Q, 'question')}</span></a></li>
      </ol></details>`;
  }).join('');
  view.innerHTML = topbar(`<span ${AUTO}>${esc(c.title)}</span>`) + `<div class="fade">
    <div class="chero cg${c.theme}"><h1 ${AUTO}>${esc(c.title)}</h1><p class="stats-line">${plural(c.lessons.length, 'lesson')} · ${plural(c.units.length, 'unit')} · ${L('about {t}', {t: fmtMin(c.totalMins)})}</p>${c.cloud ? `<p class="stats-line">${c.cloud.ai ? L('AI-generated') : L('Shared course')}${c.cloud.author ? ' · ' + L('by {name}', {name: esc(c.cloud.author)}) : ''}</p>` : ''}
      <a class="row" href="${href}"><span class="next">${nx}</span><span class="go">${btn}</span></a></div>
    <p class="about" ${AUTO}>${esc(c.about || c.subtitle || '')}</p>
    <div class="progress"><div class="bar"><i style="width:${pct}%"></i></div><span>${L('{n} of {t} lessons', {n, t: c.lessons.length})}</span></div>
    <p class="remain">${remainingMins(c) ? L('About {t} of study left', {t: fmtMin(remainingMins(c))}) : L('Course finished')}</p>
    <h2 class="sec">${plural(c.units.length, 'unit')}</h2>${units}
    <a class="finalcard" href="${certEarned(c) ? P(c, 'certificate') : P(c, 'final')}"><span class="ico big ${passed(c, 'final') ? 'ok' : ''}">${ICON.award}</span>
      <span class="t"><b>${certEarned(c) ? L('Your certificate') : L('Final exam & certificate')}</b><small>${certEarned(c) ? L('Earned {d}', {d: fmtDate(s.certDate, {day: 'numeric', month: 'short', year: 'numeric'})}) : `${plural(FINAL_Q, 'question')} · ${L('pass mark {p}%', {p: PASS})}${s.tests.final != null ? ' · ' + L('best {p}%', {p: s.tests.final}) : ''}`}</small></span>${ICON.arrow}</a>
    ${cloudPanel(c)}
    ${c.disclaimer ? `<p class="disclaimer" ${AUTO}>${esc(c.disclaimer)}</p>` : ''}
  </div>`;
  $('#back').onclick = () => goBack('#/courses');
  bindCloudPanel(c);
}

/* ───────── Reading aloud ───────── */
// Picks the clearest installed voice (premium/enhanced/natural first), skips novelty voices, reads paragraph by paragraph with a mini player.
const NOVELTY = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|pipe organ|princess|ralph|superstar|trinoids|whisper|wobble|zarvox|fred|kathy|grandma|grandpa|rocko|sandy|shelley|reed|flo|eddy)\b/i;
const canSpeak = () => 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
const voicesFor = lg => canSpeak() ? speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(lg)) : [];
function voiceScore(v) {
  return (/premium|enhanced|natural|neural|siri/i.test(v.name) ? 40 : 0) + (/google|online/i.test(v.name) ? 18 : 0)
    + (/^(samantha|ava|allison|susan|karen|daniel|serena|moira|tessa|nicky|evan|zoe|joelle|nathan|noelle|aaron|majed|maged|laila|tarik|hamed|mariam|lana|amira|zariyah)/i.test(v.name) ? 14 : 0)
    + (v.localService ? 4 : 0) + (/en-(us|gb)|ar-sa/i.test(v.lang) ? 3 : 0) - (NOVELTY.test(v.name) ? 100 : 0);
}
function bestVoice(lg) {
  const vs = voicesFor(lg); if (!vs.length) return null;
  const saved = state.settings.voice[lg] && vs.find(v => v.voiceURI === state.settings.voice[lg]);
  return saved || vs.slice().sort((a, b) => voiceScore(b) - voiceScore(a))[0];
}
if (canSpeak()) { speechSynthesis.getVoices(); speechSynthesis.addEventListener && speechSynthesis.addEventListener('voiceschanged', () => { if (location.hash === '#/settings') renderSettings(); }); }
let reader = null;   // {lg, els, i, playing, token}
const clean4speech = t => t.replace(/→/g, ', ').replace(/≈/g, lang() === 'ar' ? 'حوالي' : 'about').replace(/\bSAR\b/g, 'riyals').replace(/\s+/g, ' ').trim();
function speakAt(i) {
  const r = reader; if (!r) return;
  speechSynthesis.cancel();
  r.els.forEach(e => e.classList.remove('reading'));
  if (i >= r.els.length) return stopReading();
  r.i = i; r.playing = true; const el = r.els[i], token = r.token = {};
  el.classList.add('reading');
  const box = el.getBoundingClientRect(); if (box.top < 70 || box.bottom > innerHeight - 110) el.scrollIntoView({behavior: 'smooth', block: 'center'});
  const u = new SpeechSynthesisUtterance(clean4speech(el.innerText));
  const v = bestVoice(r.lg); u.lang = v ? v.lang : (r.lg === 'ar' ? 'ar-SA' : 'en-US'); if (v) u.voice = v; u.rate = state.settings.rate;
  u.onend = () => { if (reader === r && r.token === token && r.playing) setTimeout(() => { if (reader === r && r.token === token) speakAt(i + 1); }, 250); };
  speechSynthesis.speak(u); drawPlayer();
}
function startReading(c) {
  const els = [...view.querySelectorAll('[data-read]')].filter(e => e.innerText.trim());
  if (!els.length) return;
  reader = {lg: c.lang, els, i: 0, playing: true};
  speakAt(0);
}
function pauseReading() { if (!reader) return; reader.playing = false; reader.token = null; speechSynthesis.cancel(); drawPlayer(); }
function stopReading() {
  if (canSpeak()) speechSynthesis.cancel();
  if (reader) reader.els.forEach(e => e.classList.remove('reading'));
  reader = null; const p = $('#player'); if (p) p.remove();
}
function drawPlayer() {
  const r = reader; if (!r) return;
  let p = $('#player'); if (!p) { p = document.createElement('div'); p.id = 'player'; p.className = 'player'; document.body.appendChild(p); }
  p.innerHTML = `<button class="iconbtn" data-p="prev" aria-label="${L('Previous paragraph')}">${ICON.prev}</button>
    <button class="pbig" data-p="toggle" aria-label="${r.playing ? L('Pause') : L('Play')}">${r.playing ? ICON.pause : ICON.resume}</button>
    <button class="iconbtn" data-p="next" aria-label="${L('Next paragraph')}">${ICON.next}</button>
    <span class="pinfo">${L('Paragraph {n} of {t}', {n: r.i + 1, t: r.els.length})}</span>
    <button class="prate" data-p="rate" aria-label="${L('Reading speed')}">${state.settings.rate}×</button>
    <button class="iconbtn" data-p="stop" aria-label="${L('Stop reading')}">${ICON.close}</button>`;
  p.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {
    const a = b.dataset.p;
    if (a === 'toggle') r.playing ? pauseReading() : speakAt(r.i);
    else if (a === 'prev') speakAt(Math.max(0, r.i - 1));
    else if (a === 'next') speakAt(r.i + 1);
    else if (a === 'stop') stopReading();
    else if (a === 'rate') { state.settings.rate = RATES[(RATES.indexOf(state.settings.rate) + 1) % RATES.length]; save(); r.playing ? speakAt(r.i) : drawPlayer(); }
  });
}

/* ───────── Try it: interactive practice ───────── */
const PTYPE = {sort: 'Sort it', order: 'Put in order', pick: 'Spot them', steps: 'Guided exercise', calc: 'Calculator'};
let pr = null;      // live state of the exercise on screen
function practiceBox(c, l) {
  const p = l.practice; if (!p) return '';
  return `<section class="box try" id="try"><h3>${ICON.hand}${L('Try it')}<span class="ptype">${L(PTYPE[p.type])} · ${fmtMin(practiceMins(p))}</span>${cs(c).tries[l.id] && cs(c).tries[l.id].done ? `<span class="pdone">${ICON.check}${L('Done')}</span>` : ''}</h3>
    <p class="ptitle" ${AUTO}>${esc(p.title)}</p>${p.intro ? `<p class="pintro" ${AUTO}>${esc(p.intro)}</p>` : ''}<div id="pbody"></div></section>`;
}
function markTried(c, l, answers) {
  const st = cs(c, true), t = st.tries[l.id] || {done: null, a: []};
  if (answers) t.a = answers.map(a => String(a || '').slice(0, 2000));
  const first = !t.done; if (!t.done) t.done = today();
  st.tries[l.id] = t; save();
  if (first) { const h = $('#try h3'); if (h && !h.querySelector('.pdone')) h.insertAdjacentHTML('beforeend', `<span class="pdone">${ICON.check}${L('Done')}</span>`); }
}
function mountPractice(c, l) {
  const p = l.practice, body = $('#pbody'); if (!p || !body) return;
  const saved = cs(c).tries[l.id];
  pr = {c, l, p};
  if (p.type === 'sort') Object.assign(pr, {order: shuffle(p.items.map((_, i) => i)), i: 0, pick: null, right: 0, log: []});
  if (p.type === 'order') Object.assign(pr, {pool: shuffle(p.items.map((_, i) => i)), seq: [], checked: false});
  if (p.type === 'pick') Object.assign(pr, {order: shuffle(p.items.map((_, i) => i)), sel: new Set(), checked: false});
  if (p.type === 'steps') Object.assign(pr, {i: 0, a: p.steps.map((_, i) => (saved && saved.a[i]) || ''), finished: !!(saved && saved.done && saved.a.some(Boolean))});
  if (p.type === 'calc') pr.v = Object.fromEntries(p.inputs.map(i => [i.k, i.v]));
  drawPractice();
}
const again = () => `<div class="stack"><button class="btn" data-x="again">${L('Try again')}</button></div>`;
function drawPractice() {
  const body = $('#pbody'); if (!body || !pr) return;
  const {c, l, p} = pr;
  const bindAgain = () => { const b = body.querySelector('[data-x="again"]'); if (b) b.onclick = () => mountPractice(c, l); };
  if (p.type === 'sort') {
    if (pr.i >= pr.order.length) {
      body.innerHTML = `<div class="pscore"><b>${L('{n} of {t} right', {n: pr.right, t: p.items.length})}</b><span>${pr.right === p.items.length ? L('Perfect sorting!') : L('Check the ones you missed below.')}</span></div>
        <div class="plist">${p.buckets.map((bk, bi) => `<div class="pgroup"><p class="pgh" ${AUTO}>${esc(bk)}</p>${p.items.map((it, k) => it[1] === bi ? `<p class="pgi ${pr.log[k] === false ? 'miss' : ''}" ${AUTO}>${esc(it[0])}</p>` : '').join('')}</div>`).join('')}</div>${again()}`;
      return bindAgain();
    }
    const k = pr.order[pr.i], it = p.items[k], picked = pr.pick != null, ok = picked && pr.pick === it[1];
    body.innerHTML = `<div class="pprog"><span>${pr.i + 1} / ${p.items.length}</span><div class="bar"><i style="width:${(pr.i + (picked ? 1 : 0)) / p.items.length * 100}%"></i></div></div>
      <div class="pcard" ${AUTO}>${esc(it[0])}</div>
      <div class="pbuckets">${p.buckets.map((bk, bi) => `<button class="pbtn ${picked ? (bi === it[1] ? 'right' : bi === pr.pick ? 'wrong' : 'dim') : ''}" data-b="${bi}" ${picked ? 'disabled' : ''} ${AUTO}>${esc(bk)}</button>`).join('')}</div>
      ${picked ? `<div class="pfb ${ok ? 'ok' : 'no'}"><b>${ok ? L('Correct') : L('Not quite. It’s “{b}”.', {b: esc(p.buckets[it[1]])})}</b>${it[2] ? `<span ${AUTO}>${esc(it[2])}</span>` : ''}</div>
        <div class="stack"><button class="btn primary" data-x="next">${pr.i + 1 < p.items.length ? L('Next') : L('See results')}</button></div>` : `<p class="phint">${L('Tap the group this belongs to.')}</p>`}`;
    body.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { pr.pick = +b.dataset.b; const good = pr.pick === it[1]; pr.log[k] = good; if (good) pr.right++; drawPractice(); });
    const nx = body.querySelector('[data-x="next"]'); if (nx) nx.onclick = () => { pr.i++; pr.pick = null; if (pr.i >= pr.order.length) markTried(c, l); drawPractice(); };
    return;
  }
  if (p.type === 'order') {
    const done = pr.seq.length === p.items.length, right = pr.checked ? pr.seq.filter((k, i) => k === i).length : 0;
    body.innerHTML = `<p class="phint">${pr.checked ? '' : L('Tap the steps in the right order. Tap a placed step to take it back.')}</p>
      <ol class="pseq">${pr.seq.map((k, i) => `<li><button class="pslot ${pr.checked ? (k === i ? 'right' : 'wrong') : ''}" data-s="${i}" ${pr.checked ? 'disabled' : ''}><span class="pn">${i + 1}</span><span ${AUTO}>${esc(p.items[k])}</span>${pr.checked && k !== i ? `<small>${L('Should be #{n}', {n: k + 1})}</small>` : ''}</button></li>`).join('')}
        ${done ? '' : `<li class="pempty"><span class="pn">${pr.seq.length + 1}</span>${L('Tap a step below')}</li>`}</ol>
      ${pr.pool.length ? `<div class="ppool">${pr.pool.map(k => `<button class="pchip" data-k="${k}" ${AUTO}>${esc(p.items[k])}</button>`).join('')}</div>` : ''}
      ${pr.checked ? `<div class="pfb ${right === p.items.length ? 'ok' : 'no'}"><b>${right === p.items.length ? L('All in the right order!') : L('{n} of {t} in the right place', {n: right, t: p.items.length})}</b>${p.why ? `<span ${AUTO}>${esc(p.why)}</span>` : ''}</div>${again()}`
        : done ? `<div class="stack"><button class="btn primary" data-x="check">${L('Check my order')}</button></div>` : ''}`;
    body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = +b.dataset.k; pr.pool = pr.pool.filter(x => x !== k); pr.seq.push(k); drawPractice(); });
    body.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const k = pr.seq.splice(+b.dataset.s, 1)[0]; pr.pool.push(k); drawPractice(); });
    const ck = body.querySelector('[data-x="check"]'); if (ck) ck.onclick = () => { pr.checked = true; markTried(c, l); drawPractice(); };
    return bindAgain();
  }
  if (p.type === 'pick') {
    const total = p.items.filter(i => i[1]).length, found = [...pr.sel].filter(k => p.items[k][1]).length, wrong = [...pr.sel].filter(k => !p.items[k][1]).length;
    body.innerHTML = `${pr.checked ? '' : `<p class="phint">${L('Select every one that applies, then check.')}</p>`}
      <div class="ppick">${pr.order.map(k => { const it = p.items[k], on = pr.sel.has(k);
        const st = pr.checked ? (it[1] && on ? 'right' : it[1] ? 'missed' : on ? 'wrong' : 'dim') : on ? 'on' : '';
        return `<button class="prow2 ${st}" data-k="${k}" ${pr.checked ? 'disabled' : ''} aria-pressed="${on}"><span class="pbox">${on ? ICON.check : ''}</span><span class="ptxt"><span ${AUTO}>${esc(it[0])}</span>${pr.checked && it[2] && (on || it[1]) ? `<small ${AUTO}>${esc(it[2])}</small>` : ''}${pr.checked && it[1] && !on ? `<em>${L('You missed this one')}</em>` : ''}</span></button>`; }).join('')}</div>
      ${pr.checked ? `<div class="pfb ${found === total && !wrong ? 'ok' : 'no'}"><b>${L('You found {n} of {t}', {n: found, t: total})}${wrong ? ' · ' + L('{n} picked by mistake', {n: wrong}) : ''}</b></div>${again()}`
        : `<div class="stack"><button class="btn primary" data-x="check" ${pr.sel.size ? '' : 'disabled'}>${L('Check')}</button></div>`}`;
    body.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = +b.dataset.k; pr.sel.has(k) ? pr.sel.delete(k) : pr.sel.add(k); drawPractice(); });
    const ck = body.querySelector('[data-x="check"]'); if (ck) ck.onclick = () => { pr.checked = true; markTried(c, l); drawPractice(); };
    return bindAgain();
  }
  if (p.type === 'steps') {
    if (pr.finished) {
      body.innerHTML = `<div class="pscore"><b>${L('Nice work. Here’s what you wrote:')}</b></div>
        <ol class="panswers">${p.steps.map((s, i) => `<li><small ${AUTO}>${esc(s[0])}</small><p ${AUTO}>${pr.a[i] ? esc(pr.a[i]) : `<i>${L('(left blank)')}</i>`}</p></li>`).join('')}</ol>
        ${p.checks.length ? `<p class="pgh">${L('Check your work')}</p><div class="pchecks">${p.checks.map(x => `<label class="pcheck"><input type="checkbox"><span ${AUTO}>${esc(x)}</span></label>`).join('')}</div>` : ''}
        ${p.sample ? `<details class="psample"><summary>${L('See an example answer')}${ICON.chev}</summary><p ${AUTO}>${esc(p.sample)}</p></details>` : ''}
        <div class="stack two"><button class="btn" data-x="edit">${L('Edit my answers')}</button><button class="btn" data-x="again">${L('Start fresh')}</button></div>`;
      body.querySelector('[data-x="edit"]').onclick = () => { pr.finished = false; pr.i = 0; drawPractice(); };
      body.querySelector('[data-x="again"]').onclick = () => { pr.a = p.steps.map(() => ''); pr.finished = false; pr.i = 0; markTried(c, l, pr.a); drawPractice(); };
      return;
    }
    const s = p.steps[pr.i], last = pr.i === p.steps.length - 1;
    body.innerHTML = `<div class="pprog"><span>${L('Step {n} of {t}', {n: pr.i + 1, t: p.steps.length})}</span><div class="bar"><i style="width:${(pr.i + 1) / p.steps.length * 100}%"></i></div></div>
      <p class="pdo" ${AUTO}>${esc(s[0])}</p>${s[1] ? `<p class="phint" ${AUTO}>${esc(s[1])}</p>` : ''}
      <textarea class="note" id="pans" rows="4" placeholder="${L('Write your answer here…')}">${esc(pr.a[pr.i])}</textarea>
      <div class="stack ${pr.i ? 'two' : ''}">${pr.i ? `<button class="btn" data-x="prev">${L('Back')}</button>` : ''}<button class="btn primary" data-x="next">${last ? L('Finish') : L('Next step')}</button></div>`;
    const ta = $('#pans'), cur = pr; let t;
    ta.oninput = () => { cur.a[cur.i] = ta.value; clearTimeout(t); t = setTimeout(() => { const st = cs(c, true); st.tries[l.id] = Object.assign(st.tries[l.id] || {done: null}, {a: cur.a.slice()}); save(); }, 500); };
    body.querySelector('[data-x="next"]').onclick = () => { pr.a[pr.i] = ta.value; if (last) { pr.finished = true; markTried(c, l, pr.a); } else pr.i++; drawPractice(); $('#try').scrollIntoView({behavior: 'smooth', block: 'start'}); };
    const pv = body.querySelector('[data-x="prev"]'); if (pv) pv.onclick = () => { pr.a[pr.i] = ta.value; pr.i--; drawPractice(); };
    return;
  }
  if (p.type === 'calc') {
    const fmt = (x, f) => !Number.isFinite(x) ? '–' : f === 'pct' ? x.toLocaleString(locale(), {maximumFractionDigits: 1}) + '%' : f === 'sar' ? L('{n} SAR', {n: Math.round(x).toLocaleString(locale())}) : f === 'years' ? L('{n} years', {n: x.toLocaleString(locale(), {maximumFractionDigits: 1})}) : f === 'months' ? L('{n} months', {n: Math.ceil(x).toLocaleString(locale())}) : f === 'usd' ? '$' + x.toLocaleString(locale(), {minimumFractionDigits: 2, maximumFractionDigits: x < 1 ? 4 : 2}) : x.toLocaleString(locale(), {maximumFractionDigits: 2});
    const out = () => p.outputs.map(o => `<div class="pout ${o.big ? 'big' : ''}"><span ${AUTO}>${esc(o.label)}</span><b>${fmt(o.f(pr.v), o.fmt)}</b></div>`).join('') + (p.note ? `<p class="pnote" ${AUTO}>${esc(p.note(pr.v) || '')}</p>` : '');
    body.innerHTML = `<div class="pins">${p.inputs.map(i => `<label class="pin"><span ${AUTO}>${esc(i.label)}</span><span class="pinw"><input type="number" inputmode="decimal" data-k="${i.k}" value="${pr.v[i.k]}" step="${i.step || 'any'}" min="${i.min != null ? i.min : ''}" max="${i.max != null ? i.max : ''}">${i.unit ? `<em ${AUTO}>${esc(i.unit)}</em>` : ''}</span></label>`).join('')}</div>
      <div class="pouts" id="pouts">${out()}</div><p class="phint">${L('Change the numbers to match your own situation. The results update as you type.')}</p>`;
    body.querySelectorAll('[data-k]').forEach(inp => inp.oninput = () => { const v = parseFloat(inp.value); if (Number.isFinite(v)) { pr.v[inp.dataset.k] = v; $('#pouts').innerHTML = out(); markTried(c, l); } });
  }
}

/* ───────── Lesson ───────── */
function renderLesson(c, id) {
  const l = c.byId[id]; if (!l) return location.replace(P(c));
  setTab(null);
  const s = cs(c, true);
  if (state.last !== c.id || (!s.done[id] && s.current !== id)) { state.last = c.id; if (!s.done[id]) s.current = id; save(); }
  const prev = c.lessons[l.index - 1], next = c.lessons[l.index + 1], u = c.unit(l.unit), ms = mastery(c, id);
  const [myth, reality] = (l.myth || '').replace(/^Myth:\s*/, '').split(/\s*Reality:\s*/);
  view.innerHTML = topbar(L('Lesson {n} of {t}', {n: l.index + 1, t: c.lessons.length}), canSpeak() ? `<button class="iconbtn" id="listen" aria-label="${L('Listen to lesson')}">${ICON.play}</button>` : '') +
  `<div class="readbar"><i id="readp"></i></div>
  <article class="lesson fade">
    <p class="eyebrow">${L('Unit {n}', {n: u.n})} · <span ${AUTO}>${esc(u.title)}</span></p>
    <h1 ${AUTO} data-read>${esc(l.title)}</h1>
    <p class="lead" ${AUTO} data-read>${esc(l.intro)}</p>
    <p class="meta">${tag(c)}<span class="time calm">${ICON.clock}${fmtMin(l.mins)}</span><span>· ${plural(l.quiz.length, 'question')}</span>${ms ? `<span class="tag ${MASTERY[ms][1]}">${L(MASTERY[ms][0])}</span>` : ''}</p>
    ${l.body.map(p => `<p class="body" ${AUTO} data-read>${esc(p)}</p>`).join('')}
    <div class="box key" data-read><h3>${L('Key points')}</h3><ul ${AUTO}>${l.points.map(p => `<li ${AUTO}>${esc(p)}</li>`).join('')}</ul></div>
    ${l.example ? `<div class="box ex" data-read><h3>${L('Example')}</h3><p ${AUTO}>${esc(l.example)}</p></div>` : ''}
    ${myth ? `<div class="box myth" data-read><h3>${L('Common misconception')}</h3><p><b>${L('Myth:')}</b> <span ${AUTO}>${esc(myth)}</span></p>${reality ? `<p><b>${L('Reality:')}</b> <span ${AUTO}>${esc(reality[0].toUpperCase() + reality.slice(1))}</span></p>` : ''}</div>` : ''}
    ${practiceBox(c, l)}
    ${l.deeper && l.deeper.length ? `<details class="deeper"><summary><span>${L('Go deeper')} <small>· +${fmtMin(l.deepMins)}</small></span>${ICON.chev}</summary><div class="in">${l.deeper.map(p => `<p class="body" ${AUTO}>${esc(p)}</p>`).join('')}</div></details>` : ''}
    <h2 class="h2">${L('Key terms')}</h2>
    <dl class="terms">${l.terms.map(([t, d]) => `<div><dt ${AUTO}>${esc(t)}</dt><dd ${AUTO}>${esc(d)}</dd></div>`).join('')}</dl>
    <h2 class="h2">${L('My notes')}</h2>
    <textarea id="note" class="note" rows="3" placeholder="${L('A thought, a question, or how this applies to your life…')}">${esc(s.notes[id] || '')}</textarea>
    <div class="stack"><a class="btn primary" href="${P(c, 'quiz', l.id)}">${s.done[id] ? L('Retake the quiz') : L('Take the quiz')} ${ICON.arrow}</a></div>
    <nav class="pager">${prev ? `<a href="${P(c, 'lesson', prev.id)}">‹ ${L('Previous')}<b ${AUTO}>${esc(prev.title)}</b></a>` : ''}${next ? `<a href="${P(c, 'lesson', next.id)}">${L('Next')} ›<b ${AUTO}>${esc(next.title)}</b></a>` : ''}</nav>
    ${c.disclaimer ? `<p class="disclaimer" ${AUTO}>${esc(c.disclaimer)}</p>` : ''}
  </article>`;
  $('#back').onclick = () => goBack(P(c));
  const lb = $('#listen'); if (lb) lb.onclick = () => reader ? stopReading() : startReading(c);
  mountPractice(c, l);
  let t; $('#note').oninput = e => { clearTimeout(t); t = setTimeout(() => { if (e.target.value.trim()) s.notes[id] = e.target.value.slice(0, 5000); else delete s.notes[id]; s.noteAt[id] = Date.now(); save(); }, 400); };
}
function onScroll() { const p = $('#readp'); if (!p) return; const h = document.documentElement.scrollHeight - innerHeight; p.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 100) + '%'; }
addEventListener('scroll', onScroll, {passive: true});

/* ───────── Unit recap ───────── */
function renderUnit(c, n) {
  const u = c.unit(n); if (!u) return location.replace(P(c));
  setTab(null);
  const ls = c.unitLessons(n), terms = new Set(ls.flatMap(l => l.terms.map(([t]) => t.toLowerCase()))).size;
  view.innerHTML = topbar(L('Unit {n} recap', {n: u.n})) + `<article class="lesson fade">
    <p class="meta">${tag(c)}</p><h1 ${AUTO}>${esc(u.title)}</h1><p class="lead" ${AUTO}>${esc(u.blurb || '')}</p>
    ${u.objectives.length ? `<div class="box key"><h3>${L('You’ll be able to')}</h3><ul ${AUTO}>${u.objectives.map(o => `<li ${AUTO}>${esc(o)}</li>`).join('')}</ul></div>` : ''}
    <div class="stack two"><a class="btn" href="${P(c, 'cards', u.n)}">${L('Flashcards')} · ${terms}</a><a class="btn primary" href="${P(c, 'test', u.n)}">${L('Unit test')}</a></div>
    <h2 class="h2">${L('Cheat sheet')}</h2>
    ${ls.map(l => `<div class="box"><h3><a href="${P(c, 'lesson', l.id)}" ${AUTO}>${esc(l.title)}</a>${cs(c).done[l.id] ? ` <span class="tag tg">${L('Done')}</span>` : ''}</h3><ul ${AUTO}>${l.points.map(p => `<li ${AUTO}>${esc(p)}</li>`).join('')}</ul></div>`).join('')}
  </article>`;
  $('#back').onclick = () => goBack(P(c));
}

/* ───────── Quiz engine (lessons, reviews, tests, exam) ───────── */
let session = null;
function makeItem({c, key}) {
  const {q: [q, opts, ans, why], label} = qOf(c, key);
  const order = shuffle(opts.map((_, i) => i));
  return {c, key, label, q, opts: order.map(i => opts[i]), ans: order.indexOf(ans), why};
}
function startSession(kind, refs, extra) { session = Object.assign({kind, items: refs.map(makeItem), i: 0, picked: null, right: 0, missed: []}, extra); }
const TITLES = {lesson: 'Quick check', due: 'Review', mix: 'Practice', test: 'Unit test', final: 'Final exam'};
const graded = s => s.kind === 'test' || s.kind === 'final';
const LETTERS = () => lang() === 'ar' ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];
function renderQuiz() {
  setTab(null);
  const s = session, it = s.items[s.i], total = s.items.length, answered = s.picked !== null;
  const opts = it.opts.map((o, i) => {
    const cls = answered ? (i === it.ans ? 'right' : i === s.picked ? 'wrong' : 'dim') : '';
    return `<button class="opt ${cls}" data-i="${i}" ${answered ? 'disabled' : ''}><span class="k">${LETTERS()[i]}</span><span ${AUTO}>${esc(o)}</span></button>`;
  }).join('');
  const ok = s.picked === it.ans, multi = s.kind === 'due' || s.kind === 'mix';
  view.innerHTML = progressTop(Math.round((s.i + (answered ? 1 : 0)) / total * 100), `${s.i + 1}/${total}`) + `
  <div class="q fade">
    <p class="src"><span class="tag tr">${L(TITLES[s.kind])}</span>${tag(it.c)}${s.kind !== 'lesson' ? `<span class="tag t1" style="background:var(--surface-2);color:var(--muted)" ${AUTO}>${esc(it.label)}</span>` : ''}</p>
    <h2 ${AUTO}>${esc(it.q)}</h2>
    <div class="opts">${opts}</div>
    ${answered ? `<div class="why ${ok ? 'ok' : 'no'}"><b>${ok ? L('Correct') : L('Not quite')}</b><span ${AUTO}>${esc(it.why)}</span></div>
      <div class="stack"><button class="btn primary" id="cont">${s.i + 1 < total ? L('Continue') : L('See results')}</button></div>` : ''}
  </div>`;
  $('#back').onclick = () => { if (graded(s) && (s.i > 0 || answered) && !confirm(L('Leave now? This attempt won’t be scored.'))) return; goBack(s.back); };
  view.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (s.picked !== null) return;
    s.picked = +b.dataset.i;
    const correct = s.picked === it.ans, st = cs(it.c, true).stats;
    if (correct) s.right++; else s.missed.push(it);
    grade(it.c, it.key, correct, multi);
    st.answered++; if (correct) st.correct++;
    if (s.kind !== 'lesson') logMins(MIN_PER_Q);
    save(); renderQuiz();
    const w = $('.why'); if (w) w.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  });
  const cb = $('#cont'); if (cb) cb.onclick = () => { if (s.i + 1 < total) { s.i++; s.picked = null; renderQuiz(); scrollTo(0, 0); } else finishSession(); };
}
function finishSession() {
  const s = session; s.finished = true;
  const pct = Math.round(s.right / s.items.length * 100);
  if (s.kind === 'lesson') {
    const c = s.course, st = cs(c, true), id = s.lessonId, best = st.scores[id];
    if (!st.done[id]) st.done[id] = today();
    if (!best || s.right > best[0]) st.scores[id] = [s.right, s.items.length];
    const nx = nextLesson(c); st.current = nx ? nx.id : null;
    logMins(c.byId[id].mins);
  } else if (graded(s)) {
    const c = s.course, st = cs(c, true), k = s.kind === 'final' ? 'final' : s.unit;
    s.prevBest = st.tests[k];
    st.tests[k] = Math.max(st.tests[k] || 0, pct);
    if (s.kind === 'final' && pct >= PASS && doneCount(c) === c.lessons.length && !st.certDate) { st.certDate = today(); s.newCert = true; }
  }
  save(); renderResult(); scrollTo(0, 0);
}
function renderResult() {
  setTab(null);
  const s = session, c = s.course, total = s.items.length, p = Math.round(s.right / total * 100);
  const go = (href, text, primary) => `<button class="btn ${primary ? 'primary' : ''}" data-go="${href}">${text}</button>`;
  let title, msg, actions;
  if (s.kind === 'lesson') {
    const nx = nextLesson(c), missed = total - s.right, l = c.byId[s.lessonId];
    const unitReady = c.unitLessons(l.unit).every(x => cs(c).done[x.id]) && !passed(c, l.unit);
    title = s.right === total ? L('Perfect score') : L('Lesson complete');
    msg = missed ? L('You missed {n}. They’re added to Review so you’ll see them again today.', {n: missed}) : L('All correct. These questions come back for review tomorrow, then at longer gaps.');
    actions = (unitReady ? go(P(c, 'test', l.unit), L('Unit {n} finished: take the unit test', {n: l.unit}), true) : '') +
      (nx ? go(P(c, 'lesson', nx.id), `${L('Next:')} <span ${AUTO}>${esc(nx.title)}</span>`, !unitReady) : go(P(c, 'final'), L('Take the final exam'), !unitReady)) +
      go(P(c), L('Back to course')) + `<button class="btn" id="retake">${L('Retake quiz')}</button>`;
  } else if (graded(s)) {
    const ok = p >= PASS, isFinal = s.kind === 'final', nx = nextLesson(c);
    title = ok ? (isFinal ? L('You passed the final exam') : L('Unit {n} passed', {n: s.unit})) : L('Not passed yet');
    msg = ok ? (s.newCert ? L('Congratulations, your certificate is ready.') : isFinal && doneCount(c) < c.lessons.length ? L('Finish the remaining {n} to unlock your certificate.', {n: plural(c.lessons.length - doneCount(c), 'lesson')}) : L('Pass mark is {p}%.', {p: PASS}) + (s.prevBest != null && p > s.prevBest ? ' ' + L('New best score!') : ''))
      : L('You need {p}% to pass. Go over the questions below, revisit those lessons, then try again. Questions change each attempt.', {p: PASS});
    actions = (certEarned(c) && isFinal ? go(P(c, 'certificate'), L('View certificate'), true) : '') +
      (ok ? '' : `<button class="btn primary" id="retake">${L('Try again')}</button>`) +
      (!isFinal && ok && nx ? go(P(c, 'lesson', nx.id), L('Continue the course'), true) : '') + go(P(c), L('Back to course'), ok && !certEarned(c) && (isFinal || !nx));
  } else {
    const dq = dueQs().length;
    title = L('Review done');
    msg = s.right === total ? L('Everything recalled correctly. Each question’s next review is now further out.') : L('Questions you missed come back sooner. That’s how spaced repetition builds memory.');
    actions = (dq ? go('#/review/due', L('Review {n} more', {n: Math.min(dq, REVIEW_MAX)}), true) : '') + go('#/review', L('Back to Review'), !dq);
  }
  const missedHtml = s.missed.length ? `<details class="deeper missed"><summary><span>${L('See missed questions ({n})', {n: s.missed.length})}</span>${ICON.chev}</summary><div class="in">
    ${s.missed.map(m => `<div class="mq"><b ${AUTO}>${esc(m.q)}</b><p ${AUTO}>✓ ${esc(m.opts[m.ans])}</p><small ${AUTO}>${esc(m.why)}</small></div>`).join('')}</div></details>` : '';
  view.innerHTML = `<div class="result fade"><div class="score" style="--p:${p}"><span>${graded(s) ? p + '%' : `${s.right}/${total}`}</span></div>
    <h1>${title}</h1><p>${msg}</p>${missedHtml}<div class="stack">${actions}</div></div>`;
  view.querySelectorAll('[data-go]').forEach(b => b.onclick = () => location.replace(b.dataset.go));
  const r = $('#retake'); if (r) r.onclick = () => { session = null; route(); };
}
function routeQuiz(c, id) {
  const l = c.byId[id]; if (!l) return location.replace(P(c));
  const r = P(c, 'quiz', id);
  if (!session || session.route !== r) startSession('lesson', l.quiz.map((_, n) => ({c, key: `${id}#${n}`})), {route: r, course: c, lessonId: id, back: P(c, 'lesson', id)});
  session.finished ? renderResult() : renderQuiz();
}
function testIntro(c, kind, n) {
  setTab(null);
  const isFinal = kind === 'final', u = !isFinal && c.unit(n), best = cs(c).tests[isFinal ? 'final' : n], count = isFinal ? FINAL_Q : TEST_Q;
  const ls = isFinal ? c.lessons : c.unitLessons(n), notDone = ls.filter(l => !cs(c).done[l.id]).length;
  view.innerHTML = topbar(isFinal ? L('Final exam') : L('Unit {n} test', {n})) + `<div class="fade intro">
    <span class="ico huge">${isFinal ? ICON.award : ICON.test}</span>
    <p class="meta" style="justify-content:center;display:flex">${tag(c)}</p>
    <h1 ${AUTO}>${isFinal ? L('{c} final exam', {c: esc(c.title)}) : esc(u.title)}</h1>
    <p class="sub">${isFinal ? L('Covers all {n}, mixing lesson questions with real-world scenarios.', {n: plural(c.units.length, 'unit')}) : L('Mixes this unit’s lesson questions with real-world scenarios you haven’t seen before.')}</p>
    <div class="facts"><div><b>${count}</b><span>${L('questions')}</span></div><div><b>~${testMins(count)}</b><span>${L('minutes')}</span></div><div><b>${PASS}%</b><span>${L('to pass')}</span></div></div>
    ${best != null ? `<p class="sub">${L('Your best:')} <b>${best}%</b>${best >= PASS ? ' · ' + L('passed ✓') : ''}</p>` : ''}
    ${notDone ? `<p class="warn">${isFinal ? L('{n} in the course still unfinished. You can start now, but finishing them first will help. The certificate needs every lesson complete.', {n: plural(notDone, 'lesson')}) : L('{n} in this unit still unfinished. You can start now, but finishing them first will help.', {n: plural(notDone, 'lesson')})}</p>` : ''}
    <div class="stack"><button class="btn primary" id="begin">${isFinal ? L('Start exam') : L('Start test')}</button></div></div>`;
  $('#back').onclick = () => goBack(P(c));
  $('#begin').onclick = () => {
    const lessonQs = ls => shuffle(ls.flatMap(l => l.quiz.map((_, i) => `${l.id}#${i}`)));
    const scen = u => shuffle((u.scenarios || []).map((_, i) => `u${u.n}#${i}`));
    let keys;
    if (isFinal) { const sc = c.units.flatMap(x => scen(x).slice(0, 2)).slice(0, Math.floor(FINAL_Q / 2)); keys = shuffle([...sc, ...lessonQs(c.lessons).slice(0, FINAL_Q - sc.length)]); }
    else { const sc = scen(u).slice(0, Math.floor(TEST_Q / 2)); keys = shuffle([...sc, ...lessonQs(ls).slice(0, TEST_Q - sc.length)]); }
    startSession(kind, keys.map(key => ({c, key})), {route: location.hash, course: c, unit: n, back: P(c), started: true});
    renderQuiz(); scrollTo(0, 0);
  };
}
function routeTest(c, kind, n) {
  if (kind === 'test' && !c.unit(n)) return location.replace(P(c));
  if (session && session.route === location.hash && session.started) return session.finished ? renderResult() : renderQuiz();
  session = null; testIntro(c, kind, kind === 'test' ? +n : null);
}

/* ───────── Review & flashcards (all courses) ───────── */
function renderReview() {
  setTab('');
  session = null;
  const dq = dueQs(), dt = dueTerms();
  const qcards = COURSES.flatMap(c => Object.entries(cs(c).cards).filter(([k]) => !k.startsWith('t:')).map(([, x]) => x));
  const learned = COURSES.reduce((a, c) => a + doneCount(c), 0), mastered = qcards.filter(x => x.box >= 4).length;
  const upcoming = COURSES.flatMap(c => Object.values(cs(c).cards)).filter(x => x.due > today()).map(x => x.due).sort()[0];
  let main;
  if (!learned && !qcards.length) {
    main = `<div class="card empty"><h2>${L('Nothing to review yet')}</h2><p>${L('Finish a lesson and its questions and key terms appear here on a spaced schedule: after 1 day, 3 days, a week, and so on.')}</p>
      <div class="stack"><a class="btn primary" href="#/courses">${L('Choose a course')}</a></div></div>`;
  } else {
    main = `<div class="revgrid">
      <a class="rev cg1 ${dq.length ? '' : 'idle'}" href="${dq.length ? '#/review/due' : '#/review'}"><span class="big">${dq.length}</span><b>${L('Questions')}</b><small>${dq.length ? L('due now') + (dq.length > REVIEW_MAX ? ' · ' + L('{n} per round', {n: REVIEW_MAX}) : '') : L('all caught up')}</small></a>
      <a class="rev cg2 ${dt.length ? '' : 'idle'}" href="${dt.length ? '#/cards' : '#/review'}"><span class="big">${dt.length}</span><b>${L('Flashcards')}</b><small>${dt.length ? L('key terms due') : L('all caught up')}</small></a></div>
      ${!dq.length && !dt.length && upcoming ? `<p class="sub center">${L('Next review: {d}', {d: fmtDate(upcoming, {weekday: 'long', day: 'numeric', month: 'short'})})}</p>` : ''}`;
  }
  view.innerHTML = header() + `<div class="fade"><div class="hi"><h1>${L('Review')}</h1><p>${L('Spaced repetition across all your courses')}</p></div>
    <div style="height:22px"></div>${main}
    ${qcards.length ? `<div class="stats" style="margin-top:10px"><div class="stat"><b>${qcards.length - mastered}</b><span>${L('questions learning')}</span></div><div class="stat"><b>${mastered}</b><span>${L('questions mastered')}</span></div></div>` : ''}
    ${learned ? `<h2 class="sec">${L('Extra practice')}</h2><a class="rowlink" href="#/review/mix"><span>${L('10 mixed questions')}<small>${L('From lessons you’ve finished, across courses')}</small></span>${ICON.arrow}</a>` : ''}
    <p class="foot">${L('Testing yourself, and spacing it out over days, are the two best-proven ways to remember what you learn.')}</p></div>`;
}
function routeReviewSession(mode) {
  const r = '#/review/' + mode;
  if (!session || session.route !== r) {
    const refs = mode === 'due' ? shuffle(dueQs()).slice(0, REVIEW_MAX)
      : shuffle(COURSES.flatMap(c => Object.keys(cs(c).done).filter(id => c.byId[id]).flatMap(id => c.byId[id].quiz.map((_, n) => ({c, key: `${id}#${n}`}))))).slice(0, 10);
    if (!refs.length) return location.replace('#/review');
    startSession(mode, refs, {route: r, back: '#/review'});
  }
  session.finished ? renderResult() : renderQuiz();
}
let deck = null;
function routeCards(c, n) {
  const r = location.hash;
  if (!deck || deck.route !== r) {
    const refs = c ? [...new Set(c.unitLessons(n).flatMap(l => l.terms.map(([t]) => t.toLowerCase())))].map(k => ({c, key: 't:' + k})) : dueTerms();
    if (!refs.length) return location.replace(c ? P(c, 'unit', n) : '#/review');
    deck = {route: r, refs: c ? shuffle(refs) : shuffle(refs).slice(0, CARDS_MAX), i: 0, flipped: false, got: 0, back: c ? P(c, 'unit', n) : '#/review'};
  }
  renderCard();
}
function renderCard() {
  setTab(null);
  const d = deck;
  if (d.i >= d.refs.length) {
    view.innerHTML = `<div class="result fade"><div class="score" style="--p:${Math.round(d.got / d.refs.length * 100)}"><span>${d.got}/${d.refs.length}</span></div><h1>${L('Deck done')}</h1>
      <p>${L('Cards you knew come back later; ones you’re still learning come back sooner.')}</p><div class="stack"><button class="btn primary" data-go="${d.back}">${L('Done')}</button></div></div>`;
    view.querySelector('[data-go]').onclick = e => location.replace(e.currentTarget.dataset.go);
    return;
  }
  const {c, key} = d.refs[d.i], term = c.terms.get(key.slice(2));
  view.innerHTML = progressTop(d.i / d.refs.length * 100, `${d.i + 1}/${d.refs.length}`) + `
    <div class="fade"><button class="flash ${d.flipped ? 'flipped' : ''}" id="flip" aria-live="polite">
      <small>${tag(c)}</small><b ${AUTO}>${esc(term.t)}</b>${d.flipped ? `<p ${AUTO}>${esc(term.d)}</p>` : `<span class="hint2">${L('Say the definition to yourself, then tap')}</span>`}</button>
    ${d.flipped ? `<div class="stack two"><button class="btn" id="again">${L('Still learning')}</button><button class="btn primary" id="got">${L('Got it')}</button></div>` : `<div class="stack"><button class="btn primary" id="show">${L('Show answer')}</button></div>`}</div>`;
  $('#back').onclick = () => goBack(d.back);
  const flip = () => { if (!d.flipped) { d.flipped = true; renderCard(); } };
  $('#flip').onclick = flip; const sh = $('#show'); if (sh) sh.onclick = flip;
  const answer = ok => { grade(c, key, ok, true); if (ok) d.got++; logMins(MIN_PER_CARD); save(); d.i++; d.flipped = false; renderCard(); };
  const a = $('#again'); if (a) { a.onclick = () => answer(false); $('#got').onclick = () => answer(true); }
}

/* ───────── Search (all courses) ───────── */
let gQuery = '';
function renderSearch() {
  setTab('search');
  const all = COURSES.flatMap(c => [...c.terms.values()].map(x => ({...x, c}))).sort((a, b) => a.t.localeCompare(b.t, 'en', {sensitivity: 'base'}));
  view.innerHTML = header() + `<div class="fade">
    <p class="prompt">${L('Search every lesson and key term across your courses, or jump straight into a course.')}</p>
    <label class="search"><input id="q" type="search" placeholder="${L('Type a topic or term')}" value="${esc(gQuery)}" autocomplete="off" enterkeyhint="search" aria-label="${L('Search')}">${ICON.search}</label>
    <div id="courses-block"><h2 class="sec" style="margin-top:0">${L('Courses')}</h2>
      <div class="grid2">${COURSES.map(c => `<a class="gbtn cg${c.theme}" href="${P(c)}" ${AUTO}>${esc(c.title)}</a>`).join('')}</div></div>
    <div id="gl"></div></div>`;
  const draw = () => {
    const q = gQuery.trim().toLowerCase();
    $('#courses-block').hidden = !!q;
    const items = q ? all.filter(g => (g.t + ' ' + g.d).toLowerCase().includes(q)) : all;
    const lessons = q ? COURSES.flatMap(c => c.lessons.filter(l => [l.title, l.intro, ...l.body, ...l.points].join(' ').toLowerCase().includes(q)).map(l => ({c, l}))).slice(0, 8) : [];
    let last = '', html = lessons.length ? `<h2 class="sec">${L('Lessons')}</h2><ul class="gl">${lessons.map(({c, l}) => `<li><a class="lhit" href="${P(c, 'lesson', l.id)}"><span><b ${AUTO}>${esc(l.title)}</b><span ${AUTO}>${esc(c.title)} · ${fmtMin(l.mins)}</span></span>${ICON.arrow}</a></li>`).join('')}</ul>` : '';
    html += `<h2 class="sec">${q ? L('Key terms') : L('Glossary · {n}', {n: plural(all.length, 'term')})}</h2>`;
    let open = false;
    for (const g of items) {
      const letter = /[a-z]/i.test(g.t[0]) ? g.t[0].toUpperCase() : /[؀-ۿ]/.test(g.t[0]) ? g.t[0] : '#';
      if (!q && letter !== last) { html += `${open ? '</ul>' : ''}<p class="letter">${letter}</p><ul class="gl">`; last = letter; open = true; }
      else if (!open) { html += '<ul class="gl">'; open = true; }
      html += `<li><b ${AUTO}>${esc(g.t)}</b><p ${AUTO}>${esc(g.d)}</p><a href="${P(g.c, 'lesson', g.l.id)}">${tag(g.c, g.l.title)}</a></li>`;
    }
    if (open) html += '</ul>';
    $('#gl').innerHTML = items.length || lessons.length ? html : `<div class="empty"><p>${L('Nothing matches “{q}”.', {q: esc(gQuery)})}</p></div>`;
  };
  $('#q').oninput = e => { gQuery = e.target.value; draw(); };
  draw();
}

/* ───────── Profile (progress) ───────── */
function renderYou() {
  setTab('');
  const n = COURSES.reduce((a, c) => a + doneCount(c), 0), mine = COURSES.filter(started);
  const stats = COURSES.reduce((a, c) => ({answered: a.answered + cs(c).stats.answered, correct: a.correct + cs(c).stats.correct}), {answered: 0, correct: 0});
  const acc = stats.answered ? Math.round(stats.correct / stats.answered * 100) + '%' : '–';
  const certs = COURSES.filter(certEarned).length;
  // strengths: passed unit tests or well-recalled questions; needs practice: missed questions or failed tests
  const unitScores = mine.flatMap(c => c.units.map(u => {
    const cards = c.unitLessons(u.n).flatMap(l => l.quiz.map((_, i) => cs(c).cards[`${l.id}#${i}`]).filter(Boolean));
    const misses = cards.filter(x => x.box === 0).length, avg = cards.length ? cards.reduce((a, x) => a + x.box, 0) / cards.length : 0, t = cs(c).tests[u.n];
    return {c, u, weak: misses > 0 || (t != null && t < PASS), strong: (t != null && t >= PASS) || (cards.length >= 3 && avg >= 3), rank: (t || 0) / 25 + avg - misses};
  }));
  const weak = unitScores.filter(x => x.weak).sort((a, b) => a.rank - b.rank).slice(0, 4), strong = unitScores.filter(x => x.strong && !x.weak).sort((a, b) => b.rank - a.rank).slice(0, 4);
  const chip = (x, cls) => `<a class="tag ${cls}" href="${P(x.c, 'unit', x.u.n)}" ${AUTO}>${esc(x.u.title)}</a>`;
  const courseBlock = c => {
    const m = {Mastered: 0, Familiar: 0, Learning: 0}; c.lessons.forEach(l => { const x = mastery(c, l.id); if (x) m[x]++; });
    const w = k => (k / c.lessons.length * 100).toFixed(2) + '%', s = cs(c), dc = doneCount(c);
    return `<details class="unit pc"><summary><span class="cdot cg${c.theme}"></span><span class="t"><b ${AUTO}>${esc(c.title)}</b><small>${L('{n} of {t} lessons', {n: dc, t: c.lessons.length})}${certEarned(c) ? ' · ' + L('certificate ✓') : ''}</small></span>${ICON.chev}</summary>
      <div class="pcin"><div class="mbar"><i class="m-mastered" style="width:${w(m.Mastered)}"></i><i class="m-familiar" style="width:${w(m.Familiar)}"></i><i class="m-learning" style="width:${w(m.Learning)}"></i></div>
      <div class="legend"><span><i class="m-mastered"></i>${L('Mastered')} ${m.Mastered}</span><span><i class="m-familiar"></i>${L('Familiar')} ${m.Familiar}</span><span><i class="m-learning"></i>${L('Learning')} ${m.Learning}</span><span><i></i>${L('Not started')} ${c.lessons.length - dc}</span></div>
      <div class="list inner">${c.units.map(u => `<a class="item" href="${P(c, 'test', u.n)}"><span>${L('Unit {n} test', {n: u.n})}</span><span class="score-chip ${passed(c, u.n) ? 'ok' : ''}">${s.tests[u.n] != null ? s.tests[u.n] + '%' : '–'}</span></a>`).join('')}
        <a class="item" href="${certEarned(c) ? P(c, 'certificate') : P(c, 'final')}"><span><b>${L('Final exam')}</b>${certEarned(c) ? ' · ' + L('view certificate') : ''}</span><span class="score-chip ${passed(c, 'final') ? 'ok' : ''}">${s.tests.final != null ? s.tests.final + '%' : '–'}</span></a></div></div></details>`;
  };
  const notes = COURSES.flatMap(c => c.lessons.filter(l => cs(c).notes[l.id]).map(l => ({c, l, t: cs(c).notes[l.id]})));
  const empty = t => `<span class="tag" style="background:var(--surface-2);color:var(--muted)">${t}</span>`;
  view.innerHTML = header() + `<div class="fade">
    <div class="profile"><span class="avatar lg">${esc(initial())}${certs ? '<i class="vbadge"></i>' : ''}</span>
      <div><h1>${esc(state.settings.name.trim() || L('Learner'))}</h1><p>${L('{a} in progress · {b}', {a: plural(mine.length, 'course'), b: plural(certs, 'certificate')})}</p><a href="#/settings">${L('Edit name & settings')}</a></div></div>
    <h2 class="sec">${L('Strongest units')}</h2><div class="chips">${strong.length ? strong.map(x => chip(x, 'tg')).join('') : empty(L('Answer reviews correctly to build strengths'))}</div>
    <h2 class="sec" style="margin-top:18px">${L('Needs practice')}</h2><div class="chips">${weak.length ? weak.map(x => chip(x, 'tr')).join('') : empty(L('Nothing flagged yet'))}</div>
    <h2 class="sec">${L('My stats')}</h2>
    <div class="stats">
      <div class="stat"><b>${n}</b><span>${L('lessons done')}</span></div>
      <div class="stat"><b>${streakNow()}</b><span>${L('day streak')}</span></div>
      <div class="stat"><b>${fmtMin(totalMins())}</b><span>${L('time studied')}</span></div>
      <div class="stat"><b>${acc}</b><span>${L('quiz accuracy')}</span></div>
    </div>
    ${mine.length ? `<h2 class="sec">${L('Courses · mastery & tests')}</h2>${mine.map(courseBlock).join('')}<p class="fine" style="margin:4px 4px 0">${L('Lessons move up as you answer their questions correctly in spaced reviews over several days.')}</p>` : ''}
    ${notes.length ? `<h2 class="sec">${L('My notes')}</h2><div class="list">${notes.map(({c, l, t}) => `<a class="item" href="${P(c, 'lesson', l.id)}"><div><b ${AUTO}>${esc(l.title)}</b><p ${AUTO}>${esc(c.short)} · ${esc(t.slice(0, 120))}${t.length > 120 ? '…' : ''}</p></div></a>`).join('')}</div>` : ''}
  </div>`;
}

/* ───────── Settings ───────── */
function renderSettings() {
  setTab(null);
  const seg = (name, opts, cur) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button data-${name}="${v}" aria-pressed="${String(v) === String(cur)}">${t}</button>`).join('')}</div>`;
  const vlist = voicesFor(lang()), best = bestVoice(lang());
  view.innerHTML = topbar(L('Settings')) + `<div class="fade">
    ${CLOUD ? `<a class="rowlink" href="#/account"><span><b style="font-weight:500">${signedIn() ? L('Account') + ' · ' + esc(auth.user.email) : L('Create account or sign in')}</b><small>${signedIn() ? (cloud.syncedAt ? L('Synced {t}', {t: ago(cloud.syncedAt)}) : L('Not synced yet')) : L('Sync between phones and study with friends')}</small></span>${ICON.arrow}</a>` : ''}
    <a class="rowlink" href="#/admin" id="adminrow" hidden><span><b style="font-weight:500">${L('Course reviews')}</b><small>${L('Approve public courses and handle reports')}</small></span>${ICON.arrow}</a>
    <label class="field" style="margin-top:4px"><span>${L('Your name')}</span><input id="sname" value="${esc(state.settings.name)}" maxlength="60" placeholder="${L('Your name')}" autocomplete="name"></label>
    <h2 class="sec">${L('Language')}</h2>
    <div class="list"><div class="item"><div><b>${L('App language')}</b><p>${L('Menus, buttons and new AI courses use this language.')}</p></div>${langSeg()}</div></div>
    <h2 class="sec">${L('Daily goal')}</h2>
    <div class="list"><div class="item"><div><b>${L('Minutes per day')}</b><p>${L('Lessons, reviews and flashcards all count.')}</p></div>${seg('goal', GOALS.map(g => [g, g]), state.goal)}</div></div>
    <h2 class="sec">${L('Display')}</h2>
    <div class="list">
      <div class="item"><b>${L('Theme')}</b>${seg('theme', [['auto', L('Auto')], ['light', L('Light')], ['dark', L('Dark')]], state.settings.theme)}</div>
      <div class="item"><b>${L('Text size')}</b>${seg('size', [['s', 'A−'], ['m', 'A'], ['l', 'A+']], state.settings.size)}</div>
    </div>
    ${canSpeak() ? `<h2 class="sec">${L('Reading aloud')}</h2>
    <div class="list">
      <div class="item"><div style="flex:1;min-width:0"><b>${L('Voice')}</b><p>${vlist.length ? L('The clearest voice on your phone is picked automatically. You can choose another.') : L('No voices for this language on this device yet.')}</p>
        ${vlist.length ? `<select id="svoice" class="select">${vlist.slice().sort((a, b) => voiceScore(b) - voiceScore(a)).map(v => `<option value="${esc(v.voiceURI)}" ${best && v.voiceURI === best.voiceURI ? 'selected' : ''}>${esc(v.name)}${voiceScore(v) >= 40 ? ' ★' : ''}</option>`).join('')}</select>` : ''}</div></div>
      <div class="item"><b>${L('Speed')}</b>${seg('rate', RATES.map(r => [r, r + '×']), state.settings.rate)}</div>
      <div class="item"><div><b>${L('Test the voice')}</b><p>${L('Tip: on iPhone, download an “Enhanced” or “Premium” voice in Settings › Accessibility › Spoken Content › Voices for a much more natural sound.')}</p></div><button class="linkbtn" id="vtest">${L('Play')}</button></div>
    </div>` : ''}
    <h2 class="sec">${L('Backup')}</h2>
    <div class="list">
      <div class="item"><div><b>${L('Export progress')}</b><p>${L('Save a backup file before changing phones or clearing browser data.')}</p></div><button class="linkbtn" id="exp">${L('Export')}</button></div>
      <div class="item"><div><b>${L('Restore backup')}</b><p>${L('Merges a backup with this device. Nothing is lost.')}</p></div><button class="linkbtn" id="imp">${L('Restore')}</button></div>
      <div class="item"><div><b>${L('Reset progress')}</b><p>${L('Erase all progress on this device.')}</p></div><button class="linkbtn danger" id="reset">${L('Reset')}</button></div>
    </div>
    <input type="file" id="file" accept=".json,application/json" hidden>
    <p class="foot" id="offline">${L('Checking offline status…')}</p>
    <p class="foot" style="margin-top:4px">Steady ${VERSION} · ${plural(COURSES.length, 'course')} · ${signedIn() ? L('Progress syncs to your account.') : L('Progress is stored only on this device.')}</p></div>`;
  $('#back').onclick = () => goBack('#/home');
  bindLang(view);
  let t; $('#sname').oninput = e => { clearTimeout(t); t = setTimeout(() => { state.settings.name = e.target.value.slice(0, 60); save(); }, 300); };
  view.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { state.settings.theme = b.dataset.theme; save(); applySettings(); renderSettings(); });
  view.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { state.settings.size = b.dataset.size; save(); applySettings(); renderSettings(); });
  view.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { state.goal = +b.dataset.goal; save(); renderSettings(); });
  view.querySelectorAll('[data-rate]').forEach(b => b.onclick = () => { state.settings.rate = +b.dataset.rate; save(); renderSettings(); });
  const sv = $('#svoice'); if (sv) sv.onchange = () => { state.settings.voice[lang()] = sv.value; save(); };
  const vt = $('#vtest'); if (vt) vt.onclick = () => {
    speechSynthesis.cancel(); const v = bestVoice(lang());
    const u = new SpeechSynthesisUtterance(lang() === 'ar' ? 'مرحباً، هذا صوت القراءة في ستيدي. تعلّم قليلاً كل يوم.' : 'Hi, this is the Steady reading voice. Learn a little every day.');
    if (v) { u.voice = v; u.lang = v.lang; } u.rate = state.settings.rate; speechSynthesis.speak(u);
  };
  $('#exp').onclick = exportBackup;
  $('#imp').onclick = () => $('#file').click();
  $('#file').onchange = e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ''; };
  $('#reset').onclick = () => {
    if (!confirm(L('Erase all progress in every course on this device? Export a backup first if you might want it back.'))) return;
    const settings = state.settings; state = fresh(); state.settings = settings; state.welcomed = true; save(); toast(L('Progress reset.')); renderSettings();
  };
  offlineStatus().then(x => { const el = $('#offline'); if (el) el.textContent = x; });
  checkAdmin().then(ok => { const el = $('#adminrow'); if (el && ok) el.hidden = false; });
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), a = Object.assign(document.createElement('a'), {href: url, download: name});
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function exportBackup() {
  download(new Blob([JSON.stringify({app: 'steady', version: VERSION, exported: new Date().toISOString(), state}, null, 2)], {type: 'application/json'}), `steady-backup-${today()}.json`);
  toast(L('Backup file saved to your downloads.'));
}
function mergeCourse(a, b) {
  for (const [k, v] of Object.entries(b.done)) if (!a.done[k] || v < a.done[k]) a.done[k] = v;
  for (const [k, v] of Object.entries(b.scores)) if (!a.scores[k] || v[0] > a.scores[k][0]) a.scores[k] = v;
  for (const [k, v] of Object.entries(b.cards)) if (!a.cards[k] || v.box > a.cards[k].box) a.cards[k] = v;
  for (const [k, v] of Object.entries(b.tests)) a.tests[k] = Math.max(a.tests[k] || 0, v);
  for (const k of new Set([...Object.keys(b.notes), ...Object.keys(b.noteAt || {})])) {        // newest note edit wins
    const ta = (a.noteAt || {})[k] || 0, tb = (b.noteAt || {})[k] || 0;
    if (tb > ta) { if (b.notes[k]) a.notes[k] = b.notes[k]; else delete a.notes[k]; (a.noteAt = a.noteAt || {})[k] = tb; }
    else if (!ta && !tb && b.notes[k] && !a.notes[k]) a.notes[k] = b.notes[k];
  }
  a.tries = a.tries || {};
  for (const [k, v] of Object.entries(b.tries || {})) { const x = a.tries[k]; if (!x || (!x.done && v.done) || (v.a.join('').length > x.a.join('').length && !x.a.some(Boolean))) a.tries[k] = v; }
  if (b.certDate && (!a.certDate || b.certDate < a.certDate)) a.certDate = b.certDate;
  if (b.stats.answered > a.stats.answered) a.stats = b.stats;
}
function mergeState(inc) {
  for (const [id, v] of Object.entries(inc.courses)) { if (!CB[id]) { if (!state.courses[id]) state.courses[id] = v; continue; } mergeCourse(cs(CB[id], true), v); const nx = nextLesson(CB[id]); if (state.courses[id].current && state.courses[id].done[state.courses[id].current]) state.courses[id].current = nx ? nx.id : null; }
  for (const [k, v] of Object.entries(inc.log)) state.log[k] = Math.max(state.log[k] || 0, v);
  if (!state.settings.name && inc.settings.name) state.settings.name = inc.settings.name;
  if ((inc.streak.last || '') > (state.streak.last || '') || (inc.streak.last === state.streak.last && inc.streak.count > state.streak.count)) state.streak = inc.streak;
  if (GOALS.includes(inc.goal) && inc.goal !== 10 && state.goal === 10) state.goal = inc.goal;
  if (!state.last && inc.last) state.last = inc.last;
  if (inc.welcomed) state.welcomed = true;
}
function importBackup(file) {
  const r = new FileReader();
  r.onload = () => {
    let inc;
    try {
      const j = JSON.parse(r.result);
      if (j && j.app === 'steady' && j.state) inc = sanitize(j.state);
      else if (j && j.app === 'ai-study' && j.state) inc = fromV2(j.state);               // AI Study 2.x backup
      else if (j && j.state && Array.isArray(j.state.done)) inc = fromV1(j.state);         // AI Study 1.x backup
      else if (j && Array.isArray(j.done)) inc = fromV1(j);
      else throw Error();
    } catch (e) { toast(L('That file isn’t a valid Steady backup.')); return; }
    mergeState(inc);
    state.welcomed = true;
    save(); toast(L('Backup restored · {n} complete.', {n: plural(COURSES.reduce((a, c) => a + doneCount(c), 0), 'lesson')})); renderSettings();
  };
  r.readAsText(file);
}
async function offlineStatus() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return L('Offline mode isn’t supported in this browser.');
  try { return (await caches.has('steady-' + VERSION)) && navigator.serviceWorker.controller ? L('✓ Saved for offline use') : L('Preparing offline copy… open the app once more while online.'); }
  catch (e) { return L('Offline status unavailable.'); }
}

/* ───────── Certificate ───────── */
let logoImg = null;
const loadLogo = () => logoImg || (logoImg = new Promise(res => {
  const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null);
  i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO.replace('<svg class="logo"', '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="214" fill="#495ECA"').replace(/ role="img" aria-label="Steady" dir="ltr"/, ''));
}));
async function drawCertificate(c, cv) {
  const img = await loadLogo(), W = 1600, H = 1130, g = cv.getContext('2d'), s = cs(c), name = state.settings.name.trim() || L('Steady learner');
  const font = (w, z) => `${w} ${z}px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
  const fit = (t, w, z, max) => { g.font = font(w, z); while (g.measureText(t).width > max && z > 24) { z -= 2; g.font = font(w, z); } };
  const text = (t, y, w, z, col, max = W - 300) => { fit(t, w, z, max); g.fillStyle = col; g.fillText(t, W / 2, y); };
  cv.width = W; cv.height = H; g.textAlign = 'center'; g.direction = lang() === 'ar' ? 'rtl' : 'ltr';
  g.fillStyle = '#fbfbfd'; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(.17, '#548ad8'); gr.addColorStop(.85, '#8a4bd3');
  g.strokeStyle = gr; g.lineWidth = 16; g.strokeRect(40, 40, W - 80, H - 80);
  g.strokeStyle = '#d9dcf5'; g.lineWidth = 2; g.strokeRect(72, 72, W - 144, H - 144);
  if (img) g.drawImage(img, W / 2 - 150, 120, 300, 64);
  text(L('Certificate of Completion'), 320, 500, 72, '#121216');
  text(L('This certifies that'), 405, 400, 30, '#6f6f7b');
  text(name, 505, 500, 80, '#121216', W - 360);
  g.fillStyle = gr; g.fillRect(W / 2 - 260, 540, 520, 4);
  text(L('has successfully completed the course'), 615, 400, 30, '#6f6f7b');
  text(c.title, 700, 500, 56, '#121216');
  text(`${plural(c.lessons.length, 'lesson')} · ${plural(c.units.length, 'unit')} · ${L('Final exam score {p}%', {p: s.tests.final})}`, 765, 400, 28, '#6f6f7b');
  text(new Date(s.certDate + 'T12:00').toLocaleDateString(lang() === 'ar' ? locale() : 'en-GB', {day: 'numeric', month: 'long', year: 'numeric'}), 880, 500, 30, '#121216');
  text(L('Date of completion'), 915, 400, 22, '#6f6f7b');
  text(L('Self-paced personal study record. Not an accredited qualification.'), H - 110, 400, 20, '#999999');
}
function renderCertificate(c) {
  if (!certEarned(c)) return location.replace(P(c, 'final'));
  setTab(null);
  const s = cs(c);
  view.innerHTML = topbar(L('Certificate')) + `<div class="fade"><canvas id="cert" class="cert" width="1600" height="1130"></canvas>
    <label class="field"><span>${L('Name on certificate')}</span><input id="cname" value="${esc(state.settings.name)}" maxlength="60" placeholder="${L('Your full name')}" autocomplete="name"></label>
    <div class="stack"><button class="btn primary" id="dl">${L('Download certificate (PNG)')}</button></div>
    <p class="foot">${L('{c} · earned {d} with a final exam score of {p}%.', {c: `<span ${AUTO}>${esc(c.title)}</span>`, d: fmtDate(s.certDate, {day: 'numeric', month: 'long', year: 'numeric'}), p: s.tests.final})}</p></div>`;
  $('#back').onclick = () => goBack(P(c));
  const cv = $('#cert'); drawCertificate(c, cv);
  let t; $('#cname').oninput = e => { clearTimeout(t); t = setTimeout(() => { state.settings.name = e.target.value.slice(0, 60); save(); drawCertificate(c, cv); }, 300); };
  $('#dl').onclick = () => drawCertificate(c, cv).then(() => cv.toBlob(b => download(b, `${c.title.replace(/[^\w]+/g, '-')}-certificate.png`), 'image/png'));
}

/* ───────── Cloud: accounts, sync, friends (Supabase; optional) ───────── */
const CFG = window.STEADY_CONFIG || {}, CLOUD = !!(CFG.supabaseUrl && CFG.supabaseKey);
const AUTH_KEY = 'steady-auth', FRIENDS_KEY = 'steady-friends';
const CHEERS = {'keep-going': ['👏', 'Keep going!'], 'streak': ['🔥', 'Great streak!'], 'study-together': ['📚', 'Study with me today?'], 'congrats': ['🎉', 'Congrats!']};
const readJSON = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const writeJSON = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
let auth = readJSON(AUTH_KEY), cloud = readJSON(FRIENDS_KEY) || {me: null, people: [], cheers: [], syncedAt: 0};
const signedIn = () => CLOUD && !!(auth && auth.access_token && auth.user);
function setSession(d) {
  auth = {access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600), user: {id: d.user.id, email: d.user.email}};
  writeJSON(AUTH_KEY, auth);
}
function clearSession() { isAdminCache = null; auth = null; cloud = {me: null, people: [], cheers: [], syncedAt: 0}; writeJSON(AUTH_KEY, null); writeJSON(FRIENDS_KEY, null); }
async function api(path, {method = 'GET', body, prefer, anon} = {}) {
  if (!anon) await ensureToken();
  const headers = {apikey: CFG.supabaseKey, 'Content-Type': 'application/json'};
  if (!anon && auth) headers.Authorization = 'Bearer ' + auth.access_token;
  if (prefer) headers.Prefer = prefer;
  let r;
  try { r = await fetch(CFG.supabaseUrl.replace(/\/$/, '') + path, {method, headers, body: body === undefined ? undefined : JSON.stringify(body)}); }
  catch (e) { throw new Error(navigator.onLine ? L('Failed to fetch') : L('You’re offline. Try again when connected.')); }
  const text = await r.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) {}
  if (!r.ok) { const err = new Error(L((data && (data.msg || data.message || data.error_description || data.error)) || `Request failed (${r.status})`)); err.status = r.status; throw err; }
  return data;
}
async function ensureToken() {
  if (!auth) throw new Error(L('Not signed in'));
  if (auth.expires_at - 60 > Date.now() / 1000) return;
  try { setSession(await api('/auth/v1/token?grant_type=refresh_token', {method: 'POST', body: {refresh_token: auth.refresh_token}, anon: true})); }
  catch (e) { if (e.status === 400 || e.status === 401) { clearSession(); toast(L('You were signed out. Please sign in again.')); } throw e; }
}
async function signUp(name, email, password) {
  const d = await api('/auth/v1/signup', {method: 'POST', body: {email, password, data: {name}}, anon: true});
  if (!d || !d.access_token) throw new Error(L('Account created, but email confirmation is switched on in Supabase. Turn off “Confirm email”, then sign in.'));
  setSession(d);
}
async function signIn(email, password) { setSession(await api('/auth/v1/token?grant_type=password', {method: 'POST', body: {email, password}, anon: true})); }
async function signOut() { try { await api('/auth/v1/logout', {method: 'POST'}); } catch (e) {} clearSession(); }

const round1 = n => Math.round(n * 10) / 10;
function buildSummary() {
  const t = today(); let m7 = 0; for (let i = 0; i < 7; i++) m7 += minsOn(addDays(t, -i));
  return {user_id: auth.user.id, name: state.settings.name.trim() || 'Learner', streak: streakNow(), streak_last: state.streak.last, minutes_7d: round1(m7), minutes_today: round1(minsOn(t)),
    lessons_done: COURSES.reduce((a, c) => a + doneCount(c), 0),
    courses: COURSES.filter(started).map(c => ({id: c.id, title: c.title, short: c.short, theme: c.theme, done: doneCount(c), total: c.lessons.length, cert: certEarned(c)})),
    updated_at: new Date().toISOString()};
}
let syncing = null, syncTimer = null;
function scheduleSync() { if (!signedIn()) return; clearTimeout(syncTimer); syncTimer = setTimeout(() => syncNow(), 3000); }
async function syncNow(opts = {}) {
  if (!signedIn() || !navigator.onLine) return false;
  if (syncing) return syncing;
  syncing = (async () => {
    const me = auth.user.id;
    const rows = await api(`/rest/v1/progress?select=state&user_id=eq.${me}`);
    if (rows && rows[0] && rows[0].state) mergeState(sanitize(rows[0].state));
    const {theme, size, lang: lg, rate, voice} = state.settings;              // display, language and voice prefs stay per-device
    await api('/rest/v1/progress', {method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: {user_id: me, state, updated_at: new Date().toISOString()}});
    await api('/rest/v1/summaries', {method: 'POST', prefer: 'resolution=merge-duplicates,return=minimal', body: buildSummary()});
    Object.assign(state.settings, {theme, size, lang: lg, rate, voice});
    const [profiles, sums, cheers] = await Promise.all([
      api('/rest/v1/profiles?select=id,name,friend_code'),
      api('/rest/v1/summaries?select=*'),
      api(`/rest/v1/cheers?select=id,from_id,kind,created_at,seen&to_id=eq.${me}&order=created_at.desc&limit=20`)]);
    const meProfile = profiles.find(p => p.id === me) || {};
    if (meProfile.name && meProfile.name !== (state.settings.name.trim() || 'Learner') && state.settings.name.trim()) api(`/rest/v1/profiles?id=eq.${me}`, {method: 'PATCH', body: {name: state.settings.name.trim()}}).catch(() => {});
    if (!state.settings.name.trim() && meProfile.name) state.settings.name = meProfile.name;
    const byId = Object.fromEntries(sums.map(x => [x.user_id, x]));
    cloud = {me: {id: me, code: meProfile.friend_code}, people: profiles.map(p => ({id: p.id, name: (byId[p.id] || p).name || p.name, me: p.id === me, sum: byId[p.id] || null})), cheers, syncedAt: Date.now()};
    writeJSON(FRIENDS_KEY, cloud);
    await syncLibrary().catch(() => {});
    save(true);
    const fresh = cheers.filter(c => !c.seen);
    if (fresh.length) {
      const who = id => (cloud.people.find(p => p.id === id) || {}).name || L('A friend');
      toast(fresh.length === 1 ? `${who(fresh[0].from_id)}: ${CHEERS[fresh[0].kind][0]} ${L(CHEERS[fresh[0].kind][1])}` : L('{n} cheers from friends', {n: fresh.length}) + ' ' + CHEERS[fresh[0].kind][0]);
      api(`/rest/v1/cheers?id=in.(${fresh.map(c => c.id).join(',')})`, {method: 'PATCH', body: {seen: true}}).catch(() => {});
    }
    return true;
  })().catch(e => { if (opts.loud) toast(navigator.onLine ? L('Sync failed: {m}', {m: e.message}) : L('You’re offline. Progress will sync later.')); return false; })
      .finally(() => { syncing = null; if (opts.rerender) route(); });
  return syncing;
}
const ago = ms => { const m = Math.round((Date.now() - ms) / 60000); return m < 1 ? L('just now') : m < 60 ? L('{t} ago', {t: plural(m, 'min')}) : m < 1440 ? L('{t} ago', {t: plural(Math.round(m / 60), 'hour')}) : L('{t} ago', {t: plural(Math.round(m / 1440), 'day')}); };
const hue = id => [...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 4 + 1;
const personStreak = sm => sm && sm.streak_last && sm.streak_last >= addDays(today(), -1) ? sm.streak : 0;
const personWeek = sm => sm && Date.now() - Date.parse(sm.updated_at) < 7 * 864e5 ? Math.round(sm.minutes_7d) : 0;
const leaderboard = () => cloud.people.map(p => p.me ? {...p, sum: buildSummary()} : p).sort((a, b) => personWeek(b.sum) - personWeek(a.sum) || personStreak(b.sum) - personStreak(a.sum));
let pendingCode = null;

function renderAccount() {
  setTab(null);
  if (!CLOUD) { view.innerHTML = topbar(L('Account')) + `<div class="card empty fade"><h2>${L('Accounts aren’t switched on yet')}</h2><p>${L('The online backend hasn’t been connected. Everything still works offline on this device.')}</p></div>`; $('#back').onclick = () => goBack('#/settings'); return; }
  if (signedIn()) {
    view.innerHTML = topbar(L('Account')) + `<div class="fade">
      <div class="profile"><span class="avatar lg">${esc(initial())}</span><div><h1>${esc(state.settings.name.trim() || L('Learner'))}</h1><p>${esc(auth.user.email)}</p></div></div>
      <div class="list" style="margin-top:22px"><div class="item"><div><b>${L('Sync')}</b><p>${cloud.syncedAt ? L('Last synced {t}', {t: ago(cloud.syncedAt)}) : L('Not synced yet')}</p></div><button class="linkbtn" id="syncnow">${L('Sync now')}</button></div>
        <div class="item"><div><b>${L('Friend code')}</b><p>${L('Share it so friends can add you')}</p></div><b style="letter-spacing:.12em" dir="ltr">${esc((cloud.me && cloud.me.code) || '…')}</b></div></div>
      <div class="stack"><button class="btn" id="signout">${L('Sign out on this device')}</button></div>
      <p class="foot">${L('Signing out keeps your progress on this phone.')} <button class="linkbtn danger" id="delacc" style="font-size:13px">${L('Delete my account')}</button></p></div>`;
    $('#back').onclick = () => goBack('#/settings');
    $('#syncnow').onclick = async () => { $('#syncnow').textContent = L('Syncing…'); if (await syncNow({loud: true})) toast(L('Synced.')); renderAccount(); };
    $('#signout').onclick = async () => { await signOut(); toast(L('Signed out. Your progress stays on this device.')); location.replace('#/settings'); };
    $('#delacc').onclick = async () => {
      if (!confirm(L('Permanently delete your online account, synced progress and friend connections? Progress on this phone is kept.'))) return;
      try { await api('/rest/v1/rpc/delete_account', {method: 'POST', body: {}}); clearSession(); toast(L('Account deleted.')); location.replace('#/settings'); } catch (e) { toast(e.message); }
    };
    return;
  }
  let mode = 'up';
  const draw = () => {
    view.innerHTML = topbar(L('Account')) + `<div class="fade">
      <div class="hi"><h1>${mode === 'up' ? L('Create your account') : L('Welcome back')}</h1><p>${L('Sync your progress between iPhone and Android and study with friends.')}</p></div>
      <div class="seg" role="group" style="margin:22px 0 4px"><button data-m="up" aria-pressed="${mode === 'up'}">${L('Create account')}</button><button data-m="in" aria-pressed="${mode === 'in'}">${L('Sign in')}</button></div>
      <form id="authf">
        ${mode === 'up' ? `<label class="field"><span>${L('Name')}</span><input id="aname" value="${esc(state.settings.name)}" maxlength="60" required autocomplete="name"></label>` : ''}
        <label class="field"><span>${L('Email')}</span><input id="aemail" type="email" required autocomplete="email" inputmode="email" dir="ltr"></label>
        <label class="field"><span>${L('Password')}</span><input id="apass" type="password" minlength="8" required autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" placeholder="${mode === 'up' ? L('At least 8 characters') : ''}" dir="ltr"></label>
        <div class="stack"><button class="btn primary" id="asub" type="submit">${mode === 'up' ? L('Create account') : L('Sign in')}</button></div>
      </form>
      <p class="fine" style="margin-top:16px">${L('Your name, email and study progress are stored in Steady’s online database (Supabase). Friends you add can see your name, streak, minutes studied and course progress, never your notes or answers. You can delete your account any time.')}</p></div>`;
    $('#back').onclick = () => goBack('#/settings');
    view.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); });
    $('#authf').onsubmit = async e => {
      e.preventDefault(); const btn = $('#asub'); btn.disabled = true; btn.textContent = L('Please wait…');
      try {
        const email = $('#aemail').value.trim(), pw = $('#apass').value;
        if (mode === 'up') { const nm = $('#aname').value.trim(); if (nm) state.settings.name = nm.slice(0, 60); save(true); await signUp(state.settings.name, email, pw); }
        else await signIn(email, pw);
        await syncNow({loud: true});
        if (pendingCode) { const code = pendingCode; pendingCode = null; return location.replace('#/add/' + code); }
        toast(mode === 'up' ? L('Account created. Your progress is now synced.') : L('Signed in and synced.'));
        location.replace('#/friends');
      } catch (err) { toast(err.message.replace('Invalid login credentials', L('Email or password is incorrect.'))); btn.disabled = false; btn.textContent = mode === 'up' ? L('Create account') : L('Sign in'); }
    };
  };
  draw();
}
function personRow(p, i) {
  const sm = p.sum;
  return `<a class="prow" href="${p.me ? '#/you' : '#/friend/' + p.id}"><span class="rank">${i + 1}</span><span class="avatar sm cg${hue(p.id)}">${esc((p.name || '?')[0].toUpperCase())}</span>
    <span class="pn"><b ${AUTO}>${esc(p.name || L('Friend'))}${p.me ? ' ' + L('(you)') : ''}</b><small>${personStreak(sm) ? `🔥 ${L('{n} streak', {n: streakLen(personStreak(sm))})}` : L('No streak right now')}</small></span><span class="pm"><b>${personWeek(sm)}</b><small>${L('min')}</small></span></a>`;
}
function renderFriends() {
  setTab('friends');
  let body;
  if (!CLOUD) body = `<div class="card empty"><h2>${L('Friends are coming soon')}</h2><p>${L('The online backend isn’t connected yet. Once it is, you can create an account, sync devices and study with friends.')}</p></div>`;
  else if (!signedIn()) body = `<div class="hero" style="cursor:default"><div class="hx"><div class="num"><b>${L('Study together')}</b></div><p>${L('Create a free account to sync your progress across phones, add friends with a code, compare weekly minutes and send cheers.')}</p></div></div>
    <div class="stack"><a class="btn primary" href="#/account">${L('Create account or sign in')}</a></div>`;
  else {
    const friends = cloud.people.filter(p => !p.me), board = leaderboard();
    const cheers = (cloud.cheers || []).slice(0, 5);
    const who = id => (cloud.people.find(p => p.id === id) || {}).name || L('A friend');
    body = `<div class="hero"><div class="hx"><p style="margin:0">${L('Your friend code')}</p><div class="num"><b style="letter-spacing:.12em" dir="ltr">${esc((cloud.me && cloud.me.code) || '······')}</b></div><p>${L('Friends enter this code, or open your invite link.')}</p></div><button class="go" id="share">${L('Share')}</button></div>
      <form class="addf" id="addf"><input id="fcode" maxlength="6" placeholder="${L('Friend’s code')}" autocapitalize="characters" autocomplete="off" aria-label="${L('Friend’s code')}" dir="ltr"><button class="btn primary" type="submit">${L('Add')}</button></form>
      <h2 class="sec">${L('This week')} <small>${L('last 7 days · minutes')}</small></h2>
      <div class="list">${board.map(personRow).join('')}</div>
      ${!friends.length ? `<p class="fine center">${L('Add a friend to start a leaderboard.')}</p>` : ''}
      ${cheers.length ? `<h2 class="sec">${L('Cheers for you')}</h2><div class="list">${cheers.map(c => `<div class="item"><span>${CHEERS[c.kind][0]} <b>${esc(who(c.from_id))}</b>: ${L(CHEERS[c.kind][1])}</span><small style="color:var(--muted)">${ago(Date.parse(c.created_at))}</small></div>`).join('')}</div>` : ''}
      <p class="foot">${cloud.syncedAt ? L('Updated {t}', {t: ago(cloud.syncedAt)}) : ''} · <button class="linkbtn" id="refresh" style="font-size:13px">${L('Refresh')}</button></p>`;
  }
  view.innerHTML = header() + `<div class="fade"><div class="hi"><h1>${L('Friends')}</h1><p>${signedIn() ? L('Keep each other steady') : L('Learn together, stay consistent')}</p></div><div style="height:6px"></div>${body}</div>`;
  if (!signedIn()) return;
  const link = `${location.origin}${location.pathname}#/add/${(cloud.me && cloud.me.code) || ''}`;
  $('#share').onclick = async () => {
    const text = L('Study with me on Steady! Add me with code {code}: {link}', {code: (cloud.me && cloud.me.code) || '', link});
    try { if (navigator.share) await navigator.share({title: 'Steady', text}); else { await navigator.clipboard.writeText(text); toast(L('Invite copied. Paste it in WhatsApp or anywhere.')); } } catch (e) {}
  };
  $('#addf').onsubmit = e => { e.preventDefault(); const v = $('#fcode').value.trim().toUpperCase(); if (v) location.hash = '#/add/' + v; };
  $('#refresh').onclick = async () => { $('#refresh').textContent = L('Refreshing…'); await syncNow({loud: true}); renderFriends(); };
}
function renderFriend(id) {
  setTab(null);
  const p = cloud.people.find(x => x.id === id); if (!p) return location.replace('#/friends');
  const sm = p.sum;
  view.innerHTML = topbar(esc(p.name)) + `<div class="fade">
    <div class="profile"><span class="avatar lg cg${hue(p.id)}">${esc((p.name || '?')[0].toUpperCase())}</span><div><h1 ${AUTO}>${esc(p.name)}</h1><p>${sm ? L('Updated {t}', {t: ago(Date.parse(sm.updated_at))}) : L('Hasn’t synced yet')}</p></div></div>
    <div class="stats" style="margin-top:22px"><div class="stat"><b>${personStreak(sm)}</b><span>${L('day streak')}</span></div><div class="stat"><b>${personWeek(sm)}</b><span>${L('minutes this week')}</span></div>
      <div class="stat"><b>${sm ? sm.lessons_done : 0}</b><span>${L('lessons done')}</span></div><div class="stat"><b>${sm ? sm.courses.filter(c => c.cert).length : 0}</b><span>${L('certificates')}</span></div></div>
    ${sm && sm.courses.length ? `<h2 class="sec">${L('Courses')}</h2>${sm.courses.map(c => `<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:10px"><b style="font-weight:500" ${AUTO}>${esc(c.title)}</b>${c.cert ? `<span class="tag tg">${L('Certificate ✓')}</span>` : ''}</div>
      <div class="progress" style="margin-top:10px"><div class="bar"><i style="width:${Math.round(c.done / c.total * 100)}%"></i></div><span>${c.done}/${c.total}</span></div></div>`).join('')}` : ''}
    <h2 class="sec">${L('Send a cheer')}</h2>
    <div class="grid2">${Object.entries(CHEERS).map(([k, [e, t]]) => `<button class="tcard cheer" data-k="${k}"><b>${e}</b><span>${L(t)}</span></button>`).join('')}</div>
    <p class="foot"><button class="linkbtn danger" id="unfriend" style="font-size:13px">${L('Remove friend')}</button></p></div>`;
  $('#back').onclick = () => goBack('#/friends');
  view.querySelectorAll('.cheer').forEach(b => b.onclick = async () => {
    try { await api('/rest/v1/cheers', {method: 'POST', prefer: 'return=minimal', body: {from_id: auth.user.id, to_id: id, kind: b.dataset.k}}); toast(L('Cheer sent to {name}', {name: p.name}) + ' ' + CHEERS[b.dataset.k][0]); }
    catch (e) { toast(navigator.onLine ? e.message : L('You’re offline. Try again when connected.')); }
  });
  $('#unfriend').onclick = async () => {
    if (!confirm(L('Remove {name} from your friends? You’ll stop seeing each other’s progress.', {name: p.name}))) return;
    try { await api('/rest/v1/rpc/remove_friend', {method: 'POST', body: {friend: id}}); await syncNow(); location.replace('#/friends'); } catch (e) { toast(e.message); }
  };
}
async function addFriendRoute(code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  if (!CLOUD) return location.replace('#/friends');
  if (!signedIn()) { pendingCode = code; toast(L('Create an account or sign in to add your friend.')); return location.replace('#/account'); }
  view.innerHTML = `<div class="card empty fade"><h2>${L('Adding friend…')}</h2></div>`;
  try { const f = await api('/rest/v1/rpc/add_friend', {method: 'POST', body: {code}}); await syncNow(); toast(L('You and {name} are now friends.', {name: f.name})); }
  catch (e) { toast(navigator.onLine ? e.message : L('You’re offline. Try again when connected.')); }
  location.replace('#/friends');
}
function friendsMini() {
  if (!signedIn() || !cloud.people.some(p => !p.me)) return CLOUD && !signedIn() ? `<a class="rowlink" href="#/friends" style="margin-top:16px"><span>${L('Study with friends')}<small>${L('Create an account to sync devices and compare streaks')}</small></span>${ICON.arrow}</a>` : '';
  return `<h2 class="sec">${L('Friends this week')}</h2><div class="list">${leaderboard().slice(0, 3).map(personRow).join('')}</div>`;
}
cloudReady = true;
if (CLOUD) {
  addEventListener('online', () => syncNow());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncNow({rerender: ['#/friends', '#/home', ''].includes(location.hash)}); });
}

/* ───────── Course library: catalog, preview, enroll, sharing, AI builder, admin ───────── */
const fnCall = (action, payload = {}) => api('/functions/v1/steady-ai', {method: 'POST', body: {action, ...payload}});
const rpc = (name, body = {}, anonOk) => api('/rest/v1/rpc/' + name, {method: 'POST', body, anon: !!anonOk && !signedIn()});
const needCloud = () => { if (CLOUD) return false; toast(L('Online features aren’t connected yet.')); return true; };
const AI_BADGE = () => `<span class="tag aib">${L('AI-generated')}</span>`;
const shareLink = uuid => `${location.origin}${location.pathname}#/join/${uuid}`;
async function fetchToLibrary(uuid) {
  const d = await rpc('get_course', {cid: uuid}, true);
  library[uuid] = {content: d.content, meta: {version: d.version, is_owner: d.is_owner, visibility: d.visibility, review_status: d.review_status, review_note: d.review_note, author: d.author, status: d.status, ai: d.ai_generated}};
  libSave(); if (d.status === 'ready') installCourse(uuid); else uninstallCourse(uuid);
  return d;
}
async function syncLibrary() {
  if (!signedIn()) return;
  const rows = await rpc('my_library');
  for (const r of rows) { const have = library[r.id]; if (!have || have.meta.version !== r.version || have.meta.status !== r.status) { try { await fetchToLibrary(r.id); } catch (e) {} } }
  for (const uuid of Object.keys(library)) if (!rows.some(r => r.id === uuid) && library[uuid].meta.synced) { delete library[uuid]; uninstallCourse(uuid); }
  for (const r of rows) if (library[r.id]) library[r.id].meta.synced = true;
  libSave();
}

// Explore: Steady's own courses (always available, offline too) plus approved courses shared by learners.
let catQuery = '';
async function renderCatalog() {
  setTab('courses');
  view.innerHTML = topbar(L('Explore courses')) + `<div class="fade">
    <label class="search"><input id="cq" type="search" placeholder="${L('Search courses')}" value="${esc(catQuery)}" autocomplete="off" enterkeyhint="search">${ICON.search}</label>
    <div id="own"></div>
    <h2 class="sec">${L('Shared by learners')}</h2>
    <div id="catlist"><div class="card empty"><p>${L('Loading courses…')}</p></div></div></div>`;
  $('#back').onclick = () => goBack('#/courses');
  const match = (...t) => { const q = catQuery.trim().toLowerCase(); return !q || t.join(' ').toLowerCase().includes(q); };
  const drawOwn = () => {
    const own = COURSES.filter(c => !c.cloud && match(c.title, c.subtitle || '', c.about || '')), el = $('#own'); if (!el) return;
    el.innerHTML = own.length ? `<h2 class="sec" style="margin-top:0">${L('Steady courses')}</h2>${own.map(c => `<a class="ecard" href="${P(c)}"><span class="eart cg${c.theme}">${esc((c.short || c.title)[0])}</span>
      <span class="et"><b ${AUTO}>${esc(c.title)}</b><small ${AUTO}>${esc(c.subtitle || '')}</small><small>${plural(c.lessons.length, 'lesson')} · ${fmtMin(c.totalMins)}${started(c) ? ' · ' + L('{n}% done', {n: Math.round(doneCount(c) / c.lessons.length * 100)}) : ''}</small><span class="tag tg">✓ ${L('In your courses')}</span></span></a>`).join('')}` : '';
  };
  const draw = async () => {
    drawOwn();
    const box = $('#catlist'); if (!box) return;
    if (!CLOUD) { box.innerHTML = `<div class="card empty"><p>${L('Shared courses need the online features, which aren’t connected yet.')}</p></div>`; return; }
    try {
      const rows = await rpc('catalog', {q: catQuery.trim()}, true);
      box.innerHTML = rows.length ? rows.map(r => `<a class="ecard" href="#/preview/${r.id}"><span class="eart cg${1 + ([...r.id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 4)}">${esc((r.title || '?')[0])}</span><span class="et"><b ${AUTO}>${esc(r.title)}</b>
        <small ${AUTO}>${esc(r.subtitle || '')}</small><small>${plural(r.lesson_count, 'lesson')} · ${plural(r.enroll_count, 'learner')} · ${L('by {name}', {name: esc(r.author)})}${r.lang === 'ar' ? ' · العربية' : ''}</small>${CB[cloudId(r.id)] ? `<span class="tag tg">✓ ${L('Added')}</span>` : r.ai_generated ? AI_BADGE() : ''}</span></a>`).join('')
        : `<div class="card empty"><h2>${catQuery ? L('No matches') : L('Nothing shared yet')}</h2><p>${L('When learners publish courses and they’re approved, they appear here. You can also create your own.')}</p><div class="stack"><a class="btn primary" href="#/create">${L('Create a course with AI')}</a></div></div>`;
    } catch (e) { box.innerHTML = `<div class="card empty"><p>${navigator.onLine ? esc(e.message) : L('Shared courses need an internet connection. Steady courses above work offline.')}</p></div>`; }
  };
  let t; $('#cq').oninput = e => { catQuery = e.target.value; drawOwn(); clearTimeout(t); t = setTimeout(draw, 300); };
  draw();
}

// Preview (catalog or invite link) → enroll
async function renderPreview(uuid) {
  setTab(null);
  view.innerHTML = topbar(L('Course')) + `<div class="card empty fade"><p>${L('Loading…')}</p></div>`;
  $('#back').onclick = () => goBack('#/catalog');
  if (needCloud()) return;
  if (CB[cloudId(uuid)]) return location.replace(P(CB[cloudId(uuid)]));
  let d;
  try { d = await rpc('get_course', {cid: uuid}, true); }
  catch (e) { view.innerHTML = topbar(L('Course')) + `<div class="card empty"><h2>${L('Can’t open this course')}</h2><p>${esc(navigator.onLine ? e.message : L('You’re offline.'))}</p></div>`; $('#back').onclick = () => goBack('#/catalog'); return; }
  if (d.status !== 'ready') { view.innerHTML = topbar(L('Course')) + `<div class="card empty"><h2>${L('Still being written')}</h2><p>${L('This course isn’t finished yet. Try again later.')}</p></div>`; $('#back').onclick = () => goBack('#/catalog'); return; }
  const c = d.content;
  view.innerHTML = topbar(L('Course')) + `<div class="fade">
    <div class="chero cg${1 + ([...uuid].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 4)}"><h1 ${AUTO}>${esc(c.icon || '')} ${esc(c.title)}</h1><p class="stats-line">${plural(c.lessons.length, 'lesson')} · ${plural(c.units.length, 'unit')} · ${L('by {name}', {name: esc(d.author || L('Learner'))})}</p></div>
    <p class="meta" style="margin-top:12px">${d.ai_generated ? AI_BADGE() : ''} ${plural(d.enroll_count, 'learner')}</p>
    <p class="about" ${AUTO}>${esc(c.about || c.subtitle || '')}</p>
    <h2 class="sec">${L('What you’ll learn')}</h2>
    ${c.units.map(u => `<div class="card" style="margin-bottom:10px"><b style="font-weight:500" ${AUTO}>${u.n}. ${esc(u.title)}</b><p class="fine" ${AUTO}>${(c.lessons || []).filter(l => l.unit === u.n).map(l => esc(l.title)).join(' · ')}</p></div>`).join('')}
    ${c.disclaimer ? `<p class="disclaimer" ${AUTO}>${esc(c.disclaimer)}</p>` : ''}
    <div class="stack"><button class="btn primary" id="enroll">${L('Add to my courses')}</button>${signedIn() && !d.is_owner ? `<button class="linkbtn danger" id="report" style="font-size:13px">${L('Report a problem with this course')}</button>` : ''}</div></div>`;
  $('#back').onclick = () => goBack('#/catalog');
  $('#enroll').onclick = async () => {
    const b = $('#enroll'); b.disabled = true; b.textContent = L('Downloading…');
    try {
      if (signedIn()) await rpc('enroll', {cid: uuid});
      await fetchToLibrary(uuid); toast(signedIn() ? L('Added to your courses. It works offline too.') : L('Added on this phone. Create an account to sync it.'));
      location.replace(P(CB[cloudId(uuid)]));
    } catch (e) { toast(e.message); b.disabled = false; b.textContent = L('Add to my courses'); }
  };
  const rp = $('#report'); if (rp) rp.onclick = async () => {
    const reason = prompt(L('What’s wrong with this course? (e.g. incorrect information, inappropriate content)')); if (!reason || !reason.trim()) return;
    try { await rpc('report_course', {cid: uuid, reason: reason.trim()}); toast(L('Thanks. The admin will review it.')); } catch (e) { toast(e.message); }
  };
}

// Sharing / management panel on a cloud course page
function cloudPanel(c) {
  if (!c.cloud) return '';
  const m = c.cloud;
  if (!m.is_owner) return `<h2 class="sec">${L('This course')}</h2><div class="list"><div class="item"><div><b>${L('by {name}', {name: esc(m.author || L('Learner'))})}</b><p>${m.ai ? L('AI-generated, not expert-reviewed') : L('Shared course')}</p></div></div>
    <div class="item"><button class="linkbtn" data-act="report">${L('Report a problem')}</button><button class="linkbtn danger" data-act="leave">${L('Remove from my courses')}</button></div></div>`;
  const status = m.visibility === 'public' ? ({pending: '⏳ ' + L('Waiting for approval to appear in the catalog'), approved: '✓ ' + L('Listed in the public catalog'), rejected: '✕ ' + L('Not approved') + (m.review_note ? ': ' + m.review_note : '')}[m.review_status] || '') : '';
  return `<h2 class="sec">${L('Sharing')}</h2><div class="card">
    <div class="seg" role="group">${['private', 'link', 'public'].map(v => `<button data-vis="${v}" aria-pressed="${m.visibility === v}">${L({private: 'Private', link: 'Link', public: 'Public'}[v])}</button>`).join('')}</div>
    <p class="fine">${m.visibility === 'public' ? L('Listed in the public catalog for everyone, after review.') : m.visibility === 'link' ? L('Anyone you send the link to can add it.') : L('Only you can see it.')}</p>
    ${status ? `<p class="fine" style="color:var(--text)">${esc(status)}</p>` : ''}
    ${m.visibility !== 'private' ? `<div class="stack"><button class="btn" data-act="share">${L('Share link')}</button></div>` : ''}
    <p class="fine" style="margin-top:14px"><button class="linkbtn danger" data-act="delete" style="font-size:13px">${L('Delete this course')}</button></p></div>`;
}
function bindCloudPanel(c) {
  if (!c.cloud) return; const uuid = c.cloud.uuid;
  view.querySelectorAll('[data-vis]').forEach(b => b.onclick = async () => {
    if (!signedIn()) return toast(L('Sign in to change sharing.'));
    try { const r = await rpc('set_visibility', {cid: uuid, vis: b.dataset.vis}); Object.assign(library[uuid].meta, r); libSave(); installCourse(uuid);
      toast(r.review_status === 'pending' ? L('Sent for approval. It will appear in the catalog once approved.') : L('Sharing updated.')); route(); } catch (e) { toast(e.message); }
  });
  const act = (name, fn) => { const b = view.querySelector(`[data-act="${name}"]`); if (b) b.onclick = fn; };
  act('share', async () => { const text = L('Learn “{c}” with me on Steady: {link}', {c: c.title, link: shareLink(uuid)});
    try { if (navigator.share) await navigator.share({title: c.title, text}); else { await navigator.clipboard.writeText(text); toast(L('Link copied.')); } } catch (e) {} });
  act('delete', async () => {
    if (!confirm(L('Delete “{c}” for everyone? People who added it will lose access when they next sync.', {c: c.title}))) return;
    try { await rpc('delete_course', {cid: uuid}); delete library[uuid]; libSave(); uninstallCourse(uuid); toast(L('Course deleted.')); location.replace('#/courses'); } catch (e) { toast(e.message); }
  });
  act('leave', async () => {
    if (!confirm(L('Remove this course from your courses? Your progress is kept if you add it again.'))) return;
    try { if (signedIn()) await rpc('unenroll', {cid: uuid}); } catch (e) {}
    delete library[uuid]; libSave(); uninstallCourse(uuid); location.replace('#/courses');
  });
  act('report', async () => {
    if (!signedIn()) return toast(L('Sign in to report a course.'));
    const reason = prompt(L('What’s wrong with this course?')); if (!reason || !reason.trim()) return;
    try { await rpc('report_course', {cid: uuid, reason: reason.trim()}); toast(L('Thanks. The admin will review it.')); } catch (e) { toast(e.message); }
  });
}

// AI course builder: brief → outline → build. Courses are written in the app's language.
let draft = null;      // {topic, goal, level, length, outline}
async function renderCreate() {
  setTab(null);
  if (!CLOUD || !signedIn()) {
    view.innerHTML = topbar(L('Create a course')) + `<div class="fade"><div class="card empty"><h2>${L('Create courses with AI')}</h2><p>${L('Describe any subject and Claude writes a full Steady course: lessons, hands-on practice, quizzes, tests and flashcards. You need a free account so your courses are saved and can be shared.')}</p>
      <div class="stack"><a class="btn primary" href="#/account">${L('Create account or sign in')}</a></div></div></div>`;
    $('#back').onclick = () => goBack('#/courses'); return;
  }
  draft = draft || {topic: '', goal: '', level: 'beginner', length: 'standard', outline: null};
  if (draft.outline) return renderOutline();
  const seg = (name, opts) => `<div class="seg" role="group" style="margin-top:6px">${opts.map(([v, t]) => `<button type="button" data-${name}="${v}" aria-pressed="${draft[name] === v}">${t}</button>`).join('')}</div>`;
  view.innerHTML = topbar(L('Create a course')) + `<div class="fade">
    <div class="hi"><h1>${L('What do you want to learn?')}</h1><p id="quota">${L('Checking your monthly allowance…')}</p></div>
    <label class="field"><span>${L('Topic')}</span><input id="ctopic" maxlength="200" value="${esc(draft.topic)}" placeholder="${L('e.g. Basics of nutrition, Saudi labour law, Public speaking')}"></label>
    <label class="field"><span>${L('Your goal (optional)')}</span><input id="cgoal" maxlength="400" value="${esc(draft.goal)}" placeholder="${L('e.g. Plan healthier meals for my family')}"></label>
    <div class="field"><span>${L('Level')}</span>${seg('level', [['beginner', L('Beginner')], ['intermediate', L('Intermediate')], ['advanced', L('Advanced')]])}</div>
    <div class="field"><span>${L('Length')}</span>${seg('length', [['quick', L('Quick · 10')], ['standard', L('Standard · 25')], ['deep', L('Deep · 40')]])}</div>
    <p class="fine">${ICON.globe.replace('class="ic"', 'class="ic inl"')} ${lang() === 'ar' ? L('The course will be written in Arabic, the app’s language. To write it in English, switch the app language from the menu.') : L('The course will be written in English, the app’s language. To write it in Arabic, switch the app language from the menu.')}</p>
    <div class="stack"><button class="btn primary" id="mkoutline">${L('Draft the outline')}</button></div>
    <p class="fine">${L('Claude drafts an outline first, and you can edit it before anything is written. Drafting outlines doesn’t use your allowance; building the course does.')}</p></div>`;
  $('#back').onclick = () => goBack('#/courses');
  ['level', 'length'].forEach(k => view.querySelectorAll(`[data-${k}]`).forEach(b => b.onclick = () => { draft.topic = $('#ctopic').value; draft.goal = $('#cgoal').value; draft[k] = b.dataset[k]; renderCreate(); }));
  fnCall('quota').then(q => { const el = $('#quota'); if (el) el.textContent = q.admin ? L('Admin: unlimited courses') : L('{n} of {t} AI courses left this month', {n: Math.max(0, q.limit - q.used), t: q.limit}); }).catch(() => { const el = $('#quota'); if (el) el.textContent = ''; });
  $('#mkoutline').onclick = async () => {
    draft.topic = $('#ctopic').value.trim(); draft.goal = $('#cgoal').value.trim();
    if (draft.topic.length < 3) return toast(L('Please describe the topic.'));
    const b = $('#mkoutline'); b.disabled = true; b.innerHTML = `<span class="spin"></span> ${L('Claude is drafting the outline… (about a minute)')}`;
    try { const r = await fnCall('outline', {topic: draft.topic, goal: draft.goal, level: draft.level, length: draft.length, lang: lang()}); draft.outline = r.outline; draft.lang = lang(); renderOutline(); }
    catch (e) { toast(e.message); b.disabled = false; b.textContent = L('Draft the outline'); }
  };
}
function renderOutline() {
  setTab(null);
  const o = draft.outline, count = o.units.reduce((a, u) => a + u.lessons.length, 0);
  view.innerHTML = topbar(L('Your outline')) + `<div class="fade">
    <div class="hi"><h1 ${AUTO}>${esc(o.title)}</h1><p>${L('Claude drafted this plan. Check it, change anything you like, then build the course. Nothing is written until you tap Build.')}</p></div>
    <section class="ostep"><p class="ohead"><span class="onum">1</span>${L('Edit it yourself')}</p>
      <p class="fine" style="margin-top:0">${L('Tap any title to rename it. Use ✕ to remove a lesson and + to add one.')}</p>
      <label class="field"><span>${L('Course title')}</span><input id="otitle" maxlength="120" value="${esc(o.title)}"></label>
      ${o.units.map((u, ui) => `<div class="ounit"><label class="olabel">${L('Unit {n}', {n: ui + 1})}</label><input class="oin ob" data-u="${ui}" value="${esc(u.title)}" maxlength="120" aria-label="${L('Unit {n} title', {n: ui + 1})}">
        ${u.lessons.map((l, li) => `<div class="orow"><span class="lm">${li + 1}</span><input class="oin" data-u="${ui}" data-l="${li}" value="${esc(l.title)}" maxlength="80" aria-label="${L('Lesson title')}"><button class="iconbtn" data-rm="${ui}:${li}" aria-label="${L('Remove lesson')}">${ICON.close}</button></div>`).join('')}
        <button class="linkbtn oadd" data-add="${ui}">${ICON.plus} ${L('Add a lesson')}</button></div>`).join('')}
    </section>
    <section class="ostep"><p class="ohead"><span class="onum">2</span>${L('Or ask Claude to change it')}</p>
      <textarea id="ofb" class="note" rows="3" maxlength="600" placeholder="${L('e.g. More practical examples, add a unit on budgeting apps, make it shorter')}"></textarea>
      <div class="stack"><button class="btn" id="revise">${ICON.spark} ${L('Ask Claude to revise the outline')}</button></div></section>
    <section class="ostep last"><p class="ohead"><span class="onum">3</span>${L('Happy with it?')}</p>
      <div class="stack" style="margin-top:6px"><button class="btn primary" id="build">${L('Build this course · {n}', {n: plural(count, 'lesson')})}</button></div>
      <p class="fine">${L('Building takes about {t}. Keep the app open while it builds; if you leave, it continues where it stopped next time you open it.', {t: fmtMin(count * 0.7 + o.units.length * 1.2)})}</p></section>
    <p class="foot"><button class="linkbtn danger" id="restart" style="font-size:13px">${L('Discard this outline and start over')}</button></p></div>`;
  $('#back').onclick = () => { collect(); draft.outline = null; renderCreate(); };
  function collect() { o.title = ($('#otitle') && $('#otitle').value.trim()) || o.title; view.querySelectorAll('.oin').forEach(i => { const u = o.units[+i.dataset.u]; if (i.dataset.l != null) u.lessons[+i.dataset.l].title = i.value.trim() || u.lessons[+i.dataset.l].title; else u.title = i.value.trim() || u.title; }); }
  view.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { collect(); const [ui, li] = b.dataset.rm.split(':').map(Number); if (o.units[ui].lessons.length <= 1) return toast(L('A unit needs at least one lesson.')); o.units[ui].lessons.splice(li, 1); renderOutline(); });
  view.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { collect(); const u = o.units[+b.dataset.add]; if (u.lessons.length >= 8) return toast(L('A unit can have up to 8 lessons.')); u.lessons.push({title: L('New lesson'), intro: ''}); renderOutline(); const ins = view.querySelectorAll(`.oin[data-u="${b.dataset.add}"][data-l]`); const last = ins[ins.length - 1]; if (last) { last.focus(); last.select(); } });
  $('#restart').onclick = () => { if (confirm(L('Discard this outline?'))) { draft = null; renderCreate(); } };
  $('#revise').onclick = async () => {
    collect(); const fb = $('#ofb').value.trim(); if (!fb) { $('#ofb').focus(); return toast(L('Write what you’d like Claude to change first.')); }
    const b = $('#revise'); b.disabled = true; b.innerHTML = `<span class="spin"></span> ${L('Revising…')}`;
    try { const r = await fnCall('outline', {topic: draft.topic, goal: draft.goal, level: draft.level, length: draft.length, lang: draft.lang || lang(), previous: o, feedback: fb}); draft.outline = r.outline; renderOutline(); toast(L('Outline updated.')); }
    catch (e) { toast(e.message); b.disabled = false; b.textContent = L('Ask Claude to revise the outline'); }
  };
  $('#build').onclick = async () => {
    collect(); const b = $('#build'); b.disabled = true; b.innerHTML = `<span class="spin"></span> ${L('Starting…')}`;
    try { const r = await fnCall('start', {outline: o, lang: draft.lang || lang(), level: draft.level});
      library[r.id] = {content: r.content, meta: {version: 1, is_owner: true, visibility: 'private', review_status: 'none', status: 'generating', ai: true, author: state.settings.name}}; libSave();
      draft = null; location.replace('#/build/' + r.id); }
    catch (e) { toast(e.message); b.disabled = false; b.textContent = L('Build this course · {n}', {n: plural(count, 'lesson')}); }
  };
}

// Build runner: writes each lesson, then each unit's test questions and fact-check, then finishes.
let building = null;
async function renderBuild(uuid) {
  setTab(null);
  const entry = library[uuid];
  if (!entry) { try { await fetchToLibrary(uuid); } catch (e) { return location.replace('#/courses'); } return renderBuild(uuid); }
  if (entry.meta.status === 'ready') return location.replace(P(CB[cloudId(uuid)] || installCourse(uuid)));
  const c = entry.content;
  const steps = [];
  const L_ = id => c.lessons.find(x => x.id === id) || {}, U_ = n => c.units.find(x => x.n === n) || {};
  for (const u of c.units) {
    for (const l of c.lessons.filter(x => x.unit === u.n)) { const id = l.id; steps.push({kind: 'lesson', id, label: l.title, done: () => !!(L_(id).body && L_(id).body.length)}); }
    const n = u.n;
    steps.push({kind: 'scenarios', unit: n, label: L('Unit {n} test questions', {n}), done: () => (U_(n).scenarios || []).length > 0});
    steps.push({kind: 'check', unit: n, label: L('Unit {n} fact-check', {n}), done: () => !!U_(n).checked});
  }
  const draw = (current, err) => {
    const n = steps.filter(s => s.done()).length, pct = Math.round(n / steps.length * 100);
    view.innerHTML = topbar(L('Building your course')) + `<div class="fade">
      <div class="chero cg1"><h1 ${AUTO}>${esc(c.icon || '')} ${esc(c.title)}</h1><p class="stats-line">${L('{n} of {t} steps', {n, t: steps.length})} · ${L('about {t} left', {t: fmtMin(Math.max(1, (steps.length - n) * 0.75))})}</p>
        <div class="bar" style="margin-top:14px;background:rgba(255,255,255,.25)"><i style="width:${pct}%;background:#fff"></i></div></div>
      ${err ? `<div class="warn">${esc(err)} <div class="stack"><button class="btn primary" id="retry">${L('Try again')}</button></div></div>` : `<p class="fine center">${current ? L('Writing: {x}', {x: `<span ${AUTO}>${esc(current.label)}</span>`}) : L('Finishing…')} · ${L('keep the app open')}</p>`}
      <div class="list" style="margin-top:14px">${steps.map(s => `<div class="item"><span ${AUTO}>${esc(s.label)}</span><span>${s.done() ? '✓' : s === current ? '<span class="spin"></span>' : ''}</span></div>`).join('')}</div></div>`;
    $('#back').onclick = () => { building = null; goBack('#/courses'); };
    const r = $('#retry'); if (r) r.onclick = () => run();
  };
  const run = async () => {
    const token = {}; building = token;
    for (const s of steps) {
      if (building !== token || location.hash !== '#/build/' + uuid) return;
      if (s.done()) continue;
      draw(s);
      try {
        if (s.kind === 'lesson') { const r = await fnCall('lesson', {courseId: uuid, lessonId: s.id}); const i = c.lessons.findIndex(l => l.id === s.id); c.lessons[i] = r.lesson; }
        else { const r = await fnCall('unit', {courseId: uuid, unit: s.unit, step: s.kind}); const i = c.units.findIndex(u => u.n === s.unit);
          if (s.kind === 'check') { const fresh = await rpc('get_course', {cid: uuid}); Object.assign(c, fresh.content); } else c.units[i] = r.unit; }
        libSave();
      } catch (e) { return draw(s, navigator.onLine ? e.message : L('You’re offline. Building continues when you’re back online.')); }
    }
    if (building !== token) return;
    draw(null);
    try { await fnCall('finish', {courseId: uuid}); await fetchToLibrary(uuid); building = null; toast(L('Your course is ready!')); location.replace(P(CB[cloudId(uuid)])); }
    catch (e) { draw(null, e.message); }
  };
  run();
}

// Admin review queue
async function renderAdmin() {
  setTab(null);
  view.innerHTML = topbar(L('Course reviews')) + `<div class="card empty fade"><p>${L('Loading…')}</p></div>`;
  $('#back').onclick = () => goBack('#/settings');
  let rows;
  try { rows = await rpc('admin_queue'); } catch (e) { view.innerHTML = topbar(L('Course reviews')) + `<div class="card empty"><p>${esc(e.message)}</p></div>`; $('#back').onclick = () => goBack('#/settings'); return; }
  view.innerHTML = topbar(L('Course reviews')) + `<div class="fade">${rows.length ? rows.map(r => `<div class="card" style="margin-bottom:10px">
      <b style="font-weight:500" ${AUTO}>${esc(r.title)}</b><p class="fine" ${AUTO}>${esc(r.subtitle || '')}<br>${L('by {name}', {name: esc(r.author)})} · ${plural(r.lesson_count, 'lesson')} · ${r.lang === 'ar' ? 'العربية' : 'English'}</p>
      <p class="meta">${r.review_status === 'pending' ? `<span class="tag t2">${L('Waiting for approval')}</span>` : ''}${r.report_count ? `<span class="tag tr">${plural(r.report_count, 'report')}</span>` : ''}</p>
      ${r.reasons && r.reasons.length ? `<p class="fine" ${AUTO}>${L('Reports:')} ${r.reasons.map(esc).join(' · ')}</p>` : ''}
      <div class="stack two"><a class="btn" href="#/preview/${r.id}">${L('Read it')}</a>${r.review_status === 'pending' ? `<button class="btn primary" data-dec="approve" data-id="${r.id}">${L('Approve')}</button>` : `<button class="btn" data-dec="unpublish" data-id="${r.id}">${L('Unpublish')}</button>`}</div>
      <p class="fine">${r.review_status === 'pending' ? `<button class="linkbtn danger" data-dec="reject" data-id="${r.id}">${L('Reject')}</button>` : ''} ${r.report_count ? `<button class="linkbtn" data-dec="dismiss_reports" data-id="${r.id}">${L('Dismiss reports')}</button>` : ''}</p></div>`).join('')
    : `<div class="card empty"><h2>${L('All clear')}</h2><p>${L('No courses waiting for approval and no reports.')}</p></div>`}</div>`;
  $('#back').onclick = () => goBack('#/settings');
  view.querySelectorAll('[data-dec]').forEach(b => b.onclick = async () => {
    const note = b.dataset.dec === 'reject' || b.dataset.dec === 'unpublish' ? (prompt(L('Optional note for the author:')) || null) : null;
    try { await rpc('admin_review', {cid: b.dataset.id, decision: b.dataset.dec, note}); toast(L('Done.')); renderAdmin(); } catch (e) { toast(e.message); }
  });
}
let isAdminCache = null;
async function checkAdmin() { if (!signedIn()) return false; if (isAdminCache != null) return isAdminCache; try { isAdminCache = !!(await rpc('ai_quota')).admin; } catch (e) { isAdminCache = false; } return isAdminCache; }

/* ───────── Router ───────── */
const LEGACY = ['lesson', 'quiz', 'unit', 'test', 'final', 'certificate'];
function route() {
  stopReading(); closeMenu(true); pr = null;
  const parts = (location.hash || '#/home').split('/'), a = parts[1];
  if (LEGACY.includes(a) && CB[AI_ID]) return location.replace(`#/c/${AI_ID}/${parts.slice(1).join('/')}`);   // links from AI Study 2.x
  if (a === 'learn' || a === 'glossary') return location.replace(a === 'learn' ? '#/home' : '#/search');
  if (!state.welcomed && a !== 'welcome') { if (a === 'add') pendingCode = parts[2]; return location.replace('#/welcome'); }
  const inQuiz = (a === 'c' && ['quiz', 'test', 'final'].includes(parts[3])) || (a === 'review' && parts[2]);
  if (!inQuiz) session = null;
  if (!(a === 'cards' || (a === 'c' && parts[3] === 'cards'))) deck = null;
  if (a === 'c') {
    const c = CB[parts[2]], sub = parts[3], arg = parts[4];
    if (!c) return location.replace('#/home');
    if (!sub) renderCourse(c);
    else if (sub === 'lesson') renderLesson(c, arg);
    else if (sub === 'quiz') routeQuiz(c, arg);
    else if (sub === 'unit') renderUnit(c, arg);
    else if (sub === 'test') routeTest(c, 'test', arg);
    else if (sub === 'final') routeTest(c, 'final');
    else if (sub === 'certificate') renderCertificate(c);
    else if (sub === 'cards') routeCards(c, arg);
    else renderCourse(c);
  }
  else if (a === 'welcome') state.welcomed ? location.replace('#/home') : renderWelcome();
  else if (a === 'courses') renderCourses();
  else if (a === 'catalog') renderCatalog();
  else if (a === 'preview' || a === 'join') renderPreview(parts[2]);
  else if (a === 'create') renderCreate();
  else if (a === 'build') renderBuild(parts[2]);
  else if (a === 'admin') renderAdmin();
  else if (a === 'friends') renderFriends();
  else if (a === 'friend') renderFriend(parts[2]);
  else if (a === 'account') renderAccount();
  else if (a === 'add') addFriendRoute(parts[2]);
  else if (a === 'review' && (parts[2] === 'due' || parts[2] === 'mix')) routeReviewSession(parts[2]);
  else if (a === 'review') renderReview();
  else if (a === 'cards') routeCards(null);
  else if (a === 'search') renderSearch();
  else if (a === 'you') renderYou();
  else if (a === 'settings') renderSettings();
  else renderHome();
  onScroll();
}
window.addEventListener('hashchange', () => { navigated = true; route(); scrollTo(0, 0); });
applySettings();
if (!COURSES.length) view.innerHTML = `<div class="card empty"><h2>${L('No courses found')}</h2><p>${L('Course files failed to load. Reload the app while online.')}</p></div>`;
else route();
if (notice) setTimeout(() => toast(L(notice)), 400);
if (signedIn()) setTimeout(() => syncNow({rerender: ['#/friends', '#/home'].includes(location.hash)}), 600);

/* ───────── Offline (service worker) ───────── */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(reg => { reg.update().catch(() => {}); }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) toast(L('Steady was updated.'), L('Reload'), () => location.reload());
    else if (location.hash === '#/settings') renderSettings();
  });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
})();
