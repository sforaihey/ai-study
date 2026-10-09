/* Steady · offline-first learning app for any subject. Courses live in courses/*.js; progress in localStorage. */
(() => {
'use strict';
const VERSION = '3.1.0';
const KEY = 'steady-v3', V2_KEY = 'ai-study-v2', V1_KEY = 'ai-study-pwa-v1', AI_ID = 'ai-foundations';
const INTERVALS = [0, 1, 3, 7, 16, 35];            // days until next review, by box
const REVIEW_MAX = 15, CARDS_MAX = 20, PASS = 80, GOALS = [5, 10, 15, 20], TEST_Q = 10, FINAL_Q = 30;
const MIN_PER_Q = 0.75, MIN_PER_CARD = 0.2, WPM = 170;
// AI Study v1 lesson order → AI Foundations lesson ids, so the very first app's completions carry over.
const OLD_MAP = [['ai-vs-automation'],['ai-ml-dl-genai'],['predictive-vs-generative'],['ai-workloads'],['data-features-labels'],['learning-types'],['classification-regression-clustering'],['train-validate-test'],['overfitting'],['neural-networks'],['training-gradient-descent'],['transformers-attention'],['tokens-context','embeddings'],['prompting-basics'],['rag'],['fine-tuning'],['tools-function-calling','agents'],['should-it-be-ai'],['model-selection'],['evaluating-genai'],['cost-latency-quality'],['deployment-options'],['mlops-llmops'],['drift-monitoring'],['ai-security'],['bias-fairness'],['privacy-ip'],['guardrails-redteaming'],['use-cases-value'],['capstone']];

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
const fmtMin = m => { m = Math.round(m); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}`; };
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const fmtDate = (d, opts) => new Date(d + 'T12:00').toLocaleDateString(undefined, opts);
const entries = o => o && typeof o === 'object' ? Object.entries(o) : [];
const svg = (d, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICON = {
  back: svg('<path d="M15 18l-6-6 6-6"/>', ''),
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>', ''),
  chev: svg('<path d="m6 9 6 6 6-6"/>', 'chev'),
  arrow: svg('<path d="M9 6l6 6-6 6"/>', 'ar'),
  menu: svg('<path d="M4 6h16M4 12h11M4 18h16"/>'),
  bell: svg('<path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2h16zM10 21h4"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', ''),
  play: svg('<path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>', ''),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>', ''),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', ''),
  test: svg('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>', ''),
  award: svg('<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>', ''),
  pen: svg('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>', ''),
  plus: svg('<path d="M12 5v14M5 12h14"/>')
};

/* ───────── Courses ───────── */
const COURSES = (window.COURSES || []).filter(c => c && c.id && Array.isArray(c.lessons) && Array.isArray(c.units));
const testMins = n => Math.round(n * MIN_PER_Q + 1);
COURSES.forEach((c, ci) => {
  c.theme = [1, 2, 3, 4].includes(c.theme) ? c.theme : (ci % 4) + 1;     // gradient + tag colour
  c.short = c.short || c.title.split(/\s+&\s+|\s+/)[0];
  c.lessons.forEach((l, i) => {
    l.index = i;
    l.mins = Math.max(3, Math.round(words([l.intro, ...l.body, ...l.points, l.example, l.myth, l.try || '', ...l.terms.flat()]) / WPM + l.quiz.length * MIN_PER_Q));
    l.deepMins = Math.max(1, Math.round(words(l.deeper || ['']) / WPM));
  });
  c.byId = Object.fromEntries(c.lessons.map(l => [l.id, l]));
  c.unit = n => c.units.find(u => u.n === +n);
  c.unitLessons = n => c.lessons.filter(l => l.unit === +n);
  c.terms = new Map(); for (const l of c.lessons) for (const [t, d] of l.terms) { const k = t.toLowerCase(); if (!c.terms.has(k)) c.terms.set(k, {k: 't:' + k, t, d, l}); }
  c.totalMins = c.lessons.reduce((a, l) => a + l.mins, 0) + c.units.length * testMins(TEST_Q) + testMins(FINAL_Q);
});
const CB = Object.fromEntries(COURSES.map(c => [c.id, c]));
const P = (c, ...parts) => `#/c/${c.id}${parts.length ? '/' + parts.join('/') : ''}`;
const tag = (c, text) => `<span class="tag t${c.theme}">${esc(text || c.short)}</span>`;
function qOf(c, key) {
  let m = /^u(\d+)#(\d+)$/.exec(key);
  if (m) { const u = c.unit(m[1]), q = u && u.scenarios && u.scenarios[+m[2]]; return q && {q, label: `Unit ${m[1]} scenario`}; }
  m = /^(.+)#(\d+)$/.exec(key);
  if (m && c.byId[m[1]]) { const q = c.byId[m[1]].quiz[+m[2]]; return q && {q, label: c.byId[m[1]].title}; }
  return null;
}
const validCard = (c, k) => k.startsWith('t:') ? c.terms.has(k.slice(2)) : !!qOf(c, k);

/* ───────── State ───────── */
const freshCourse = () => ({done:{}, scores:{}, cards:{}, current:null, tests:{}, certDate:null, notes:{}, stats:{answered:0, correct:0}});
const fresh = () => ({v:3, courses:{}, last:null, streak:{count:0,last:null}, log:{}, goal:10, goalHit:null, welcomed:false, settings:{theme:'auto', size:'m', name:''}});
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
  if (x.settings) s.settings = {theme: ['auto','light','dark'].includes(x.settings.theme) ? x.settings.theme : 'auto', size: ['s','m','l'].includes(x.settings.size) ? x.settings.size : 'm', name: typeof x.settings.name === 'string' ? x.settings.name.slice(0, 60) : ''};
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
let notice = '', migrated = false;
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
let state = load();
if (migrated) save();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (e) { toast('Couldn’t save progress. Storage may be full or blocked.'); return false; }
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
  if (state.goalHit !== t && state.log[t] >= state.goal) { state.goalHit = t; setTimeout(() => toast(`Daily goal reached: ${state.goal} minutes. Nice work!`), 300); }
}
function grade(c, key, correct, spaced) {
  const cards = cs(c, true).cards, x = cards[key];
  const box = correct ? (spaced ? Math.min((x ? x.box : 0) + 1, 5) : Math.max(x ? x.box : 0, 1)) : 0;
  cards[key] = {box, due: addDays(today(), INTERVALS[box])};
}
function applySettings() {
  const r = document.documentElement, {theme, size} = state.settings;
  if (theme === 'auto') delete r.dataset.theme; else r.dataset.theme = theme;
  r.dataset.size = size;
}

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
  return `<header class="hdr"><a class="ib" href="#/settings" aria-label="Settings">${ICON.menu}</a><span class="sp"></span>
    <a class="ib" href="#/review" aria-label="Review${n ? `, ${n} due` : ''}">${ICON.bell}${n ? `<b class="dot">${n > 99 ? '99+' : n}</b>` : ''}</a>
    <a class="avatar" href="#/you" aria-label="Your progress">${esc(initial())}${cert ? '<i class="vbadge"></i>' : ''}</a></header>`;
}
const topbar = (label, extra = '') => `<div class="topbar"><button class="iconbtn" id="back" aria-label="Back">${ICON.back}</button><span class="label">${label}</span>${extra || '<span class="iconbtn"></span>'}</div>`;
const progressTop = (pct, count) => `<div class="topbar"><button class="iconbtn" id="back" aria-label="Close">${ICON.close}</button><div class="bar"><i style="width:${pct}%"></i></div><span class="count">${count}</span></div>`;

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
  view.innerHTML = `<div class="plumbg"></div><div class="welcome fade">${WELCOME_ART}
    <h1>Learn anything,<br>a little every day</h1>
    <p>Short lessons, quick quizzes and smart review, all offline. Pick a course and keep a steady streak.</p>
    <label class="field"><span>What should we call you?</span><input id="wname" value="${esc(state.settings.name)}" maxlength="60" placeholder="Your name" autocomplete="given-name"></label>
    <div class="stack"><button class="btn white" id="start">Let’s start ${ICON.arrow}</button></div></div>`;
  $('#start').onclick = () => { state.settings.name = $('#wname').value.trim().slice(0, 60); state.welcomed = true; save(); location.replace('#/home'); };
}

/* ───────── Home ───────── */
function upNext() {
  const items = [], mine = COURSES.filter(started);
  const focus = [CB[state.last], ...mine].find(c => c && started(c) && continueLesson(c));
  if (focus) { const l = continueLesson(focus); items.push({href: P(focus, 'lesson', l.id), title: l.title, c: focus, time: `${l.mins} min`}); }
  const dq = dueQs(), dt = dueTerms();
  if (dq.length) items.push({href: '#/review/due', title: 'Daily review', tagHtml: '<span class="tag tr">Review</span>', time: plural(Math.min(dq.length, REVIEW_MAX), 'question')});
  if (dt.length) items.push({href: '#/cards', title: 'Key-term flashcards', tagHtml: '<span class="tag tg">Flashcards</span>', time: `${Math.min(dt.length, CARDS_MAX)} cards`});
  for (const c of mine) for (const u of c.units) if (items.length < 4 && c.unitLessons(u.n).every(l => cs(c).done[l.id]) && !passed(c, u.n)) items.push({href: P(c, 'test', u.n), title: `Unit ${u.n} test`, c, time: `${testMins(TEST_Q)} min`});
  for (const c of mine) if (items.length < 4 && c !== focus && continueLesson(c)) { const l = continueLesson(c); items.push({href: P(c, 'lesson', l.id), title: l.title, c, time: `${l.mins} min`}); }
  for (const c of COURSES) if (items.length < 4 && !started(c)) items.push({href: P(c), title: `Start ${c.title}`, c, time: fmtMin(c.totalMins), calm: true});
  return {items: items.slice(0, 4), focus};
}
function renderHome() {
  setTab('home');
  const name = firstName(), dq = dueQs().length, dt = dueTerms().length, m = Math.floor(minsOn(today())), st = streakNow();
  const {items, focus} = upNext();
  const line = dq + dt ? `You have <b>${plural(dq + dt, 'review')} due</b> today` : COURSES.some(started) ? `You’re <b class="ok">all caught up</b> on reviews` : 'Pick a course and start your first lesson';
  const goalTxt = m >= state.goal ? `Goal reached!${st ? ` You’re on a ${st}-day streak.` : ''}` : `Reach ${state.goal} today${st ? ` to grow your ${st}-day streak` : ' to start a streak'}.`;
  const heroHref = focus ? P(focus, 'lesson', continueLesson(focus).id) : (COURSES[0] ? P(COURSES[0]) : '#/courses');
  view.innerHTML = header() + `<div class="fade">
    <div class="hi"><h1>Hi${name ? ' ' + esc(name) : ''},</h1><p>${line}</p></div>
    <a class="hero" href="${heroHref}"><div class="hx"><div class="num"><b>${m}</b><span>min today</span></div><p>${goalTxt}</p></div><span class="go">${focus ? 'Continue' : 'Start learning'}</span></a>
    ${items.length ? `<h2 class="sec">Up next ${ICON.info}</h2>
      <div class="grid2">${items.map(it => `<a class="tcard" href="${it.href}"><b>${esc(it.title)}</b><span class="tmeta">${it.tagHtml || tag(it.c)}<span class="time ${it.calm ? 'calm' : ''}">${ICON.clock}${esc(it.time)}</span></span></a>`).join('')}</div>` : ''}
    <h2 class="sec">Courses</h2>
    <div class="grid2">${COURSES.map(c => `<a class="gbtn cg${c.theme}" href="${P(c)}">${esc(c.title)}</a>`).join('')}</div>
    <div class="hint">${ICON.plus}<div><b>Want to learn another subject?</b>New courses can be added in the same format. Ask Claude: <i>“Add a Steady course on …”</i></div></div>
  </div>`;
}

/* ───────── Courses tab (plum library) ───────── */
function renderCourses() {
  setTab('courses', true);
  view.innerHTML = `<div class="plumbg"></div><div class="on-plum">${header()}</div><div class="fade">
    <h1 class="plum-title">Courses</h1><p class="plum-sub">${plural(COURSES.length, 'course')} · ${plural(COURSES.reduce((a, c) => a + c.lessons.length, 0), 'lesson')}</p>
    <div class="stack-cards">${COURSES.map(c => { const n = doneCount(c), pct = Math.round(n / c.lessons.length * 100);
      return `<a class="scard cg${c.theme}" href="${P(c)}"><b>${esc(c.title)}</b><small>${certEarned(c) ? 'Completed ✓' : started(c) ? `${n}/${c.lessons.length} lessons` : `${c.lessons.length} lessons · ${fmtMin(c.totalMins)}`}</small>${started(c) ? `<span class="sbar"><i style="width:${pct}%"></i></span>` : ''}</a>`; }).join('')}</div>
    <p class="plum-note">Every course works the same way: ~4-minute lessons, quick quizzes, spaced review, unit tests and a certificate. To add a subject, ask Claude: “Add a Steady course on …”.</p>
  </div>`;
}

/* ───────── Course overview ───────── */
function renderCourse(c) {
  setTab('courses');
  const s = cs(c), next = continueLesson(c), n = doneCount(c), pct = Math.round(n / c.lessons.length * 100);
  let nx, href, btn;
  if (next) { nx = `<small>${n || s.current ? 'Continue' : 'Start here'} · Unit ${next.unit}</small><b>${esc(next.title)}</b>`; href = P(c, 'lesson', next.id); btn = n || s.current ? 'Continue' : 'Start'; }
  else if (!certEarned(c)) { nx = `<small>All lessons complete</small><b>Final exam · ${FINAL_Q} questions</b>`; href = P(c, 'final'); btn = 'Take exam'; }
  else { nx = `<small>Course complete</small><b>Your certificate</b>`; href = P(c, 'certificate'); btn = 'View'; }
  const openUnit = next ? next.unit : 0;
  const units = c.units.map(u => {
    const ls = c.unitLessons(u.n), d = ls.filter(l => s.done[l.id]).length, mins = ls.reduce((a, l) => a + l.mins, 0) + testMins(TEST_Q);
    const best = s.tests[u.n], complete = d === ls.length && passed(c, u.n);
    const rows = ls.map(l => `<li><a class="lrow ${s.done[l.id] ? 'done' : ''} ${next && l.id === next.id ? 'next' : ''}" href="${P(c, 'lesson', l.id)}">
      <span class="dot2"></span><span class="lt">${esc(l.title)}</span><span class="lm">${l.mins} min</span></a></li>`).join('');
    return `<details class="unit ${complete ? 'complete' : ''}" ${u.n === openUnit ? 'open' : ''}>
      <summary><span class="unum">${complete ? '✓' : u.n}</span><span class="t"><b>${esc(u.title)}</b><small>${d} of ${ls.length} lessons · ${fmtMin(mins)}</small></span>${ICON.chev}</summary>
      ${u.objectives ? `<div class="obj"><p>You’ll be able to</p><ul>${u.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>` : ''}
      <ol class="lessons">${rows}
        <li><a class="lrow extra" href="${P(c, 'unit', u.n)}"><span class="ico">${ICON.list}</span><span class="lt">Unit recap & flashcards</span><span class="lm"></span></a></li>
        <li><a class="lrow extra" href="${P(c, 'test', u.n)}"><span class="ico ${passed(c, u.n) ? 'ok' : ''}">${ICON.test}</span><span class="lt">Unit test</span><span class="lm">${best != null ? `<span class="score-chip ${passed(c, u.n) ? 'ok' : ''}">${best}%</span>` : `${TEST_Q} questions`}</span></a></li>
      </ol></details>`;
  }).join('');
  view.innerHTML = topbar(esc(c.title)) + `<div class="fade">
    <div class="chero cg${c.theme}"><h1>${esc(c.title)}</h1><p class="stats-line">${c.lessons.length} lessons · ${c.units.length} units · about ${fmtMin(c.totalMins)}</p>
      <a class="row" href="${href}"><span class="next">${nx}</span><span class="go">${btn}</span></a></div>
    <p class="about">${esc(c.about || c.subtitle || '')}</p>
    <div class="progress"><div class="bar"><i style="width:${pct}%"></i></div><span>${n}/${c.lessons.length} lessons</span></div>
    <p class="remain">${remainingMins(c) ? `About ${fmtMin(remainingMins(c))} of study left` : 'Course finished'}</p>
    <h2 class="sec">${c.units.length} units</h2>${units}
    <a class="finalcard" href="${certEarned(c) ? P(c, 'certificate') : P(c, 'final')}"><span class="ico big ${passed(c, 'final') ? 'ok' : ''}">${ICON.award}</span>
      <span class="t"><b>${certEarned(c) ? 'Your certificate' : 'Final exam & certificate'}</b><small>${certEarned(c) ? `Earned ${fmtDate(s.certDate, {day: 'numeric', month: 'short', year: 'numeric'})}` : `${FINAL_Q} questions · pass mark ${PASS}%${s.tests.final != null ? ` · best ${s.tests.final}%` : ''}`}</small></span>${ICON.arrow}</a>
    ${c.disclaimer ? `<p class="disclaimer">${esc(c.disclaimer)}</p>` : ''}
  </div>`;
  $('#back').onclick = () => goBack('#/courses');
}

/* ───────── Lesson ───────── */
let speaking = false;
function stopSpeech() { if (speaking && window.speechSynthesis) speechSynthesis.cancel(); speaking = false; const b = $('#listen'); if (b) { b.innerHTML = ICON.play; b.setAttribute('aria-label', 'Listen to lesson'); } }
function speak(l) {
  if (speaking) return stopSpeech();
  const parts = [l.title + '.', l.intro, ...l.body, 'Key points.', ...l.points, 'Example.', l.example, 'Common misconception.', l.myth, ...(l.try ? ['Try it.', l.try] : [])];
  const voices = speechSynthesis.getVoices(), voice = voices.find(v => /^en[-_]/i.test(v.lang) && v.localService) || voices.find(v => /^en/i.test(v.lang));
  speechSynthesis.cancel(); speaking = true;
  parts.forEach((p, i) => {
    const u = new SpeechSynthesisUtterance(p.replace(/→/g, ', then ').replace(/≈/g, 'about').replace(/\bSAR\b/g, 'riyals'));
    u.lang = 'en-US'; if (voice) u.voice = voice; u.rate = 0.98;
    if (i === parts.length - 1) u.onend = () => stopSpeech();
    speechSynthesis.speak(u);
  });
  const b = $('#listen'); b.innerHTML = ICON.stop; b.setAttribute('aria-label', 'Stop listening');
}
function renderLesson(c, id) {
  const l = c.byId[id]; if (!l) return location.replace(P(c));
  setTab(null);
  const s = cs(c, true);
  if (state.last !== c.id || (!s.done[id] && s.current !== id)) { state.last = c.id; if (!s.done[id]) s.current = id; save(); }
  const prev = c.lessons[l.index - 1], next = c.lessons[l.index + 1], u = c.unit(l.unit), ms = mastery(c, id);
  const [myth, reality] = l.myth.replace(/^Myth:\s*/, '').split(/\s*Reality:\s*/);
  const canSpeak = 'speechSynthesis' in window;
  view.innerHTML = topbar(`Lesson ${l.index + 1} of ${c.lessons.length}`, canSpeak ? `<button class="iconbtn" id="listen" aria-label="Listen to lesson">${ICON.play}</button>` : '') +
  `<div class="readbar"><i id="readp"></i></div>
  <article class="lesson fade">
    <p class="eyebrow">Unit ${u.n} · ${esc(u.title)}</p>
    <h1>${esc(l.title)}</h1>
    <p class="lead">${esc(l.intro)}</p>
    <p class="meta">${tag(c)}<span class="time calm">${ICON.clock}${l.mins} min</span><span>· ${l.quiz.length} questions</span>${ms ? `<span class="tag ${ms === 'Mastered' ? 'tg' : ms === 'Familiar' ? 't1' : 't2'}">${ms}</span>` : ''}</p>
    ${l.body.map(p => `<p class="body">${esc(p)}</p>`).join('')}
    <div class="box key"><h3>Key points</h3><ul>${l.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <div class="box ex"><h3>Example</h3><p>${esc(l.example)}</p></div>
    <div class="box myth"><h3>Common misconception</h3><p><b>Myth:</b> ${esc(myth)}</p>${reality ? `<p><b>Reality:</b> ${esc(reality[0].toUpperCase() + reality.slice(1))}</p>` : ''}</div>
    ${l.try ? `<div class="box try"><h3>${ICON.pen}Try it</h3><p>${esc(l.try)}</p></div>` : ''}
    ${l.deeper && l.deeper.length ? `<details class="deeper"><summary><span>Go deeper <small>· +${l.deepMins} min</small></span>${ICON.chev}</summary><div class="in">${l.deeper.map(p => `<p class="body">${esc(p)}</p>`).join('')}</div></details>` : ''}
    <h2 class="h2">Key terms</h2>
    <dl class="terms">${l.terms.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
    <h2 class="h2">My notes</h2>
    <textarea id="note" class="note" rows="3" placeholder="A thought, a question, or how this applies to your life…">${esc(s.notes[id] || '')}</textarea>
    <div class="stack"><a class="btn primary" href="${P(c, 'quiz', l.id)}">${s.done[id] ? 'Retake the quiz' : 'Take the quiz'} ${ICON.arrow}</a></div>
    <nav class="pager">${prev ? `<a href="${P(c, 'lesson', prev.id)}">‹ Previous<b>${esc(prev.title)}</b></a>` : ''}${next ? `<a href="${P(c, 'lesson', next.id)}">Next ›<b>${esc(next.title)}</b></a>` : ''}</nav>
    ${c.disclaimer ? `<p class="disclaimer">${esc(c.disclaimer)}</p>` : ''}
  </article>`;
  $('#back').onclick = () => goBack(P(c));
  if (canSpeak) $('#listen').onclick = () => speak(l);
  let t; $('#note').oninput = e => { clearTimeout(t); t = setTimeout(() => { if (e.target.value.trim()) s.notes[id] = e.target.value.slice(0, 5000); else delete s.notes[id]; save(); }, 400); };
}
function onScroll() { const p = $('#readp'); if (!p) return; const h = document.documentElement.scrollHeight - innerHeight; p.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 100) + '%'; }
addEventListener('scroll', onScroll, {passive: true});

/* ───────── Unit recap ───────── */
function renderUnit(c, n) {
  const u = c.unit(n); if (!u) return location.replace(P(c));
  setTab(null);
  const ls = c.unitLessons(n), terms = new Set(ls.flatMap(l => l.terms.map(([t]) => t.toLowerCase()))).size;
  view.innerHTML = topbar(`Unit ${u.n} recap`) + `<article class="lesson fade">
    <p class="meta">${tag(c)}</p><h1>${esc(u.title)}</h1><p class="lead">${esc(u.blurb || '')}</p>
    ${u.objectives ? `<div class="box key"><h3>You’ll be able to</h3><ul>${u.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>` : ''}
    <div class="stack two"><a class="btn" href="${P(c, 'cards', u.n)}">Flashcards · ${terms}</a><a class="btn primary" href="${P(c, 'test', u.n)}">Unit test</a></div>
    <h2 class="h2">Cheat sheet</h2>
    ${ls.map(l => `<div class="box"><h3><a href="${P(c, 'lesson', l.id)}">${esc(l.title)}</a>${cs(c).done[l.id] ? ' <span class="tag tg">Done</span>' : ''}</h3><ul>${l.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}
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
function renderQuiz() {
  setTab(null);
  const s = session, it = s.items[s.i], total = s.items.length, answered = s.picked !== null;
  const opts = it.opts.map((o, i) => {
    const cls = answered ? (i === it.ans ? 'right' : i === s.picked ? 'wrong' : 'dim') : '';
    return `<button class="opt ${cls}" data-i="${i}" ${answered ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`;
  }).join('');
  const ok = s.picked === it.ans, multi = s.kind === 'due' || s.kind === 'mix';
  view.innerHTML = progressTop(Math.round((s.i + (answered ? 1 : 0)) / total * 100), `${s.i + 1}/${total}`) + `
  <div class="q fade">
    <p class="src"><span class="tag tr">${TITLES[s.kind]}</span>${tag(it.c)}${s.kind !== 'lesson' ? `<span class="tag t1" style="background:var(--surface-2);color:var(--muted)">${esc(it.label)}</span>` : ''}</p>
    <h2>${esc(it.q)}</h2>
    <div class="opts">${opts}</div>
    ${answered ? `<div class="why ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct' : 'Not quite'}</b>${esc(it.why)}</div>
      <div class="stack"><button class="btn primary" id="cont">${s.i + 1 < total ? 'Continue' : 'See results'}</button></div>` : ''}
  </div>`;
  $('#back').onclick = () => { if (graded(s) && (s.i > 0 || answered) && !confirm('Leave now? This attempt won’t be scored.')) return; goBack(s.back); };
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
  const go = (href, text, primary) => `<button class="btn ${primary ? 'primary' : ''}" data-go="${href}">${esc(text)}</button>`;
  let title, msg, actions;
  if (s.kind === 'lesson') {
    const nx = nextLesson(c), missed = total - s.right, l = c.byId[s.lessonId];
    const unitReady = c.unitLessons(l.unit).every(x => cs(c).done[x.id]) && !passed(c, l.unit);
    title = s.right === total ? 'Perfect score' : 'Lesson complete';
    msg = missed ? `You missed ${missed}. ${missed === 1 ? 'It’s' : 'They’re'} added to Review so you’ll see ${missed === 1 ? 'it' : 'them'} again today.` : 'All correct. These questions come back for review tomorrow, then at longer gaps.';
    actions = (unitReady ? go(P(c, 'test', l.unit), `Unit ${l.unit} finished: take the unit test`, true) : '') +
      (nx ? go(P(c, 'lesson', nx.id), `Next: ${nx.title}`, !unitReady) : go(P(c, 'final'), 'Take the final exam', !unitReady)) +
      go(P(c), 'Back to course') + `<button class="btn" id="retake">Retake quiz</button>`;
  } else if (graded(s)) {
    const ok = p >= PASS, isFinal = s.kind === 'final', nx = nextLesson(c);
    title = ok ? (isFinal ? 'You passed the final exam' : `Unit ${s.unit} passed`) : 'Not passed yet';
    msg = ok ? (s.newCert ? 'Congratulations, your certificate is ready.' : isFinal && doneCount(c) < c.lessons.length ? `Finish the remaining ${plural(c.lessons.length - doneCount(c), 'lesson')} to unlock your certificate.` : `Pass mark is ${PASS}%.${s.prevBest != null && p > s.prevBest ? ' New best score!' : ''}`)
      : `You need ${PASS}% to pass. Go over the questions below, revisit those lessons, then try again. Questions change each attempt.`;
    actions = (certEarned(c) && isFinal ? go(P(c, 'certificate'), 'View certificate', true) : '') +
      (ok ? '' : `<button class="btn primary" id="retake">Try again</button>`) +
      (!isFinal && ok && nx ? go(P(c, 'lesson', nx.id), 'Continue the course', true) : '') + go(P(c), 'Back to course', ok && !certEarned(c) && (isFinal || !nx));
  } else {
    const dq = dueQs().length;
    title = 'Review done';
    msg = s.right === total ? 'Everything recalled correctly. Each question’s next review is now further out.' : 'Questions you missed come back sooner. That’s how spaced repetition builds memory.';
    actions = (dq ? go('#/review/due', `Review ${Math.min(dq, REVIEW_MAX)} more`, true) : '') + go('#/review', 'Back to Review', !dq);
  }
  const missedHtml = s.missed.length ? `<details class="deeper missed"><summary><span>See ${plural(s.missed.length, 'missed question')}</span>${ICON.chev}</summary><div class="in">
    ${s.missed.map(m => `<div class="mq"><b>${esc(m.q)}</b><p>✓ ${esc(m.opts[m.ans])}</p><small>${esc(m.why)}</small></div>`).join('')}</div></details>` : '';
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
  view.innerHTML = topbar(isFinal ? 'Final exam' : `Unit ${n} test`) + `<div class="fade intro">
    <span class="ico huge">${isFinal ? ICON.award : ICON.test}</span>
    <p class="meta" style="justify-content:center;display:flex">${tag(c)}</p>
    <h1>${isFinal ? `${esc(c.title)} final exam` : esc(u.title)}</h1>
    <p class="sub">${isFinal ? `Covers all ${c.units.length} units, mixing lesson questions with real-world scenarios.` : 'Mixes this unit’s lesson questions with real-world scenarios you haven’t seen before.'}</p>
    <div class="facts"><div><b>${count}</b><span>questions</span></div><div><b>~${testMins(count)}</b><span>minutes</span></div><div><b>${PASS}%</b><span>to pass</span></div></div>
    ${best != null ? `<p class="sub">Your best: <b>${best}%</b>${best >= PASS ? ' · passed ✓' : ''}</p>` : ''}
    ${notDone ? `<p class="warn">${plural(notDone, 'lesson')} ${isFinal ? 'in the course' : 'in this unit'} still unfinished. You can start now, but finishing ${notDone === 1 ? 'it' : 'them'} first will help.${isFinal ? ' The certificate needs every lesson complete.' : ''}</p>` : ''}
    <div class="stack"><button class="btn primary" id="begin">Start ${isFinal ? 'exam' : 'test'}</button></div></div>`;
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
    main = `<div class="card empty"><h2>Nothing to review yet</h2><p>Finish a lesson and its questions and key terms appear here on a spaced schedule: after 1 day, 3 days, a week, and so on.</p>
      <div class="stack"><a class="btn primary" href="#/courses">Choose a course</a></div></div>`;
  } else {
    main = `<div class="revgrid">
      <a class="rev cg1 ${dq.length ? '' : 'idle'}" href="${dq.length ? '#/review/due' : '#/review'}"><span class="big">${dq.length}</span><b>Questions</b><small>${dq.length ? `due now${dq.length > REVIEW_MAX ? ` · ${REVIEW_MAX} per round` : ''}` : 'all caught up'}</small></a>
      <a class="rev cg2 ${dt.length ? '' : 'idle'}" href="${dt.length ? '#/cards' : '#/review'}"><span class="big">${dt.length}</span><b>Flashcards</b><small>${dt.length ? 'key terms due' : 'all caught up'}</small></a></div>
      ${!dq.length && !dt.length && upcoming ? `<p class="sub center">Next review: ${fmtDate(upcoming, {weekday: 'long', day: 'numeric', month: 'short'})}</p>` : ''}`;
  }
  view.innerHTML = header() + `<div class="fade"><div class="hi"><h1>Review</h1><p>Spaced repetition across all your courses</p></div>
    <div style="height:22px"></div>${main}
    ${qcards.length ? `<div class="stats" style="margin-top:10px"><div class="stat"><b>${qcards.length - mastered}</b><span>questions learning</span></div><div class="stat"><b>${mastered}</b><span>questions mastered</span></div></div>` : ''}
    ${learned ? `<h2 class="sec">Extra practice</h2><a class="rowlink" href="#/review/mix"><span>10 mixed questions<small>From lessons you’ve finished, across courses</small></span>${ICON.arrow}</a>` : ''}
    <p class="foot">Testing yourself, and spacing it out over days, are the two best-proven ways to remember what you learn.</p></div>`;
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
    view.innerHTML = `<div class="result fade"><div class="score" style="--p:${Math.round(d.got / d.refs.length * 100)}"><span>${d.got}/${d.refs.length}</span></div><h1>Deck done</h1>
      <p>Cards you knew come back later; ones you’re still learning come back sooner.</p><div class="stack"><button class="btn primary" data-go="${d.back}">Done</button></div></div>`;
    view.querySelector('[data-go]').onclick = e => location.replace(e.currentTarget.dataset.go);
    return;
  }
  const {c, key} = d.refs[d.i], term = c.terms.get(key.slice(2));
  view.innerHTML = progressTop(d.i / d.refs.length * 100, `${d.i + 1}/${d.refs.length}`) + `
    <div class="fade"><button class="flash ${d.flipped ? 'flipped' : ''}" id="flip" aria-live="polite">
      <small>${tag(c)}</small><b>${esc(term.t)}</b>${d.flipped ? `<p>${esc(term.d)}</p>` : '<span class="hint2">Say the definition to yourself, then tap</span>'}</button>
    ${d.flipped ? `<div class="stack two"><button class="btn" id="again">Still learning</button><button class="btn primary" id="got">Got it</button></div>` : `<div class="stack"><button class="btn primary" id="show">Show answer</button></div>`}</div>`;
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
    <p class="prompt">Search every lesson and key term across your courses, or jump straight into a course.</p>
    <label class="search"><input id="q" type="search" placeholder="Type a topic or term" value="${esc(gQuery)}" autocomplete="off" enterkeyhint="search" aria-label="Search">${ICON.search}</label>
    <div id="courses-block"><h2 class="sec" style="margin-top:0">Courses</h2>
      <div class="grid2">${COURSES.map(c => `<a class="gbtn cg${c.theme}" href="${P(c)}">${esc(c.title)}</a>`).join('')}</div></div>
    <div id="gl"></div></div>`;
  const draw = () => {
    const q = gQuery.trim().toLowerCase();
    $('#courses-block').hidden = !!q;
    const items = q ? all.filter(g => (g.t + ' ' + g.d).toLowerCase().includes(q)) : all;
    const lessons = q ? COURSES.flatMap(c => c.lessons.filter(l => [l.title, l.intro, ...l.body, ...l.points].join(' ').toLowerCase().includes(q)).map(l => ({c, l}))).slice(0, 8) : [];
    let last = '', html = lessons.length ? `<h2 class="sec">Lessons</h2><ul class="gl">${lessons.map(({c, l}) => `<li><a class="lhit" href="${P(c, 'lesson', l.id)}"><span><b>${esc(l.title)}</b><span>${esc(c.title)} · ${l.mins} min</span></span>${ICON.arrow}</a></li>`).join('')}</ul>` : '';
    html += `<h2 class="sec">${q ? 'Key terms' : 'Glossary · ' + all.length + ' terms'}</h2>`;
    let open = false;
    for (const g of items) {
      const letter = /[a-z]/i.test(g.t[0]) ? g.t[0].toUpperCase() : '#';
      if (!q && letter !== last) { html += `${open ? '</ul>' : ''}<p class="letter">${letter}</p><ul class="gl">`; last = letter; open = true; }
      else if (!open) { html += '<ul class="gl">'; open = true; }
      html += `<li><b>${esc(g.t)}</b><p>${esc(g.d)}</p><a href="${P(g.c, 'lesson', g.l.id)}">${tag(g.c, g.l.title)}</a></li>`;
    }
    if (open) html += '</ul>';
    $('#gl').innerHTML = items.length || lessons.length ? html : `<div class="empty"><p>Nothing matches “${esc(gQuery)}”.</p></div>`;
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
  const chip = (x, cls) => `<a class="tag ${cls}" href="${P(x.c, 'unit', x.u.n)}">${esc(x.u.title)}</a>`;
  const courseBlock = c => {
    const m = {Mastered: 0, Familiar: 0, Learning: 0}; c.lessons.forEach(l => { const x = mastery(c, l.id); if (x) m[x]++; });
    const w = k => (k / c.lessons.length * 100).toFixed(2) + '%', s = cs(c), dc = doneCount(c);
    return `<details class="unit pc"><summary><span class="cdot cg${c.theme}"></span><span class="t"><b>${esc(c.title)}</b><small>${dc}/${c.lessons.length} lessons${certEarned(c) ? ' · certificate ✓' : ''}</small></span>${ICON.chev}</summary>
      <div class="pcin"><div class="mbar"><i class="m-mastered" style="width:${w(m.Mastered)}"></i><i class="m-familiar" style="width:${w(m.Familiar)}"></i><i class="m-learning" style="width:${w(m.Learning)}"></i></div>
      <div class="legend"><span><i class="m-mastered"></i>Mastered ${m.Mastered}</span><span><i class="m-familiar"></i>Familiar ${m.Familiar}</span><span><i class="m-learning"></i>Learning ${m.Learning}</span><span><i></i>Not started ${c.lessons.length - dc}</span></div>
      <div class="list inner">${c.units.map(u => `<a class="item" href="${P(c, 'test', u.n)}"><span>Unit ${u.n} test</span><span class="score-chip ${passed(c, u.n) ? 'ok' : ''}">${s.tests[u.n] != null ? s.tests[u.n] + '%' : '–'}</span></a>`).join('')}
        <a class="item" href="${certEarned(c) ? P(c, 'certificate') : P(c, 'final')}"><span><b>Final exam</b>${certEarned(c) ? ' · view certificate' : ''}</span><span class="score-chip ${passed(c, 'final') ? 'ok' : ''}">${s.tests.final != null ? s.tests.final + '%' : '–'}</span></a></div></div></details>`;
  };
  const notes = COURSES.flatMap(c => c.lessons.filter(l => cs(c).notes[l.id]).map(l => ({c, l, t: cs(c).notes[l.id]})));
  view.innerHTML = header() + `<div class="fade">
    <div class="profile"><span class="avatar lg">${esc(initial())}${certs ? '<i class="vbadge"></i>' : ''}</span>
      <div><h1>${esc(state.settings.name.trim() || 'Learner')}</h1><p>${plural(mine.length, 'course')} in progress · ${plural(certs, 'certificate')}</p><a href="#/settings">Edit name & settings</a></div></div>
    <h2 class="sec">Strongest units</h2><div class="chips">${strong.length ? strong.map(x => chip(x, 'tg')).join('') : '<span class="tag" style="background:var(--surface-2);color:var(--muted)">Answer reviews correctly to build strengths</span>'}</div>
    <h2 class="sec" style="margin-top:18px">Needs practice</h2><div class="chips">${weak.length ? weak.map(x => chip(x, 'tr')).join('') : '<span class="tag" style="background:var(--surface-2);color:var(--muted)">Nothing flagged yet</span>'}</div>
    <h2 class="sec">My stats</h2>
    <div class="stats">
      <div class="stat"><b>${n}</b><span>lessons done</span></div>
      <div class="stat"><b>${streakNow()}</b><span>day streak</span></div>
      <div class="stat"><b>${fmtMin(totalMins())}</b><span>time studied</span></div>
      <div class="stat"><b>${acc}</b><span>quiz accuracy</span></div>
    </div>
    ${mine.length ? `<h2 class="sec">Courses · mastery & tests</h2>${mine.map(courseBlock).join('')}<p class="fine" style="margin:4px 4px 0">Lessons move up as you answer their questions correctly in spaced reviews over several days.</p>` : ''}
    ${notes.length ? `<h2 class="sec">My notes</h2><div class="list">${notes.map(({c, l, t}) => `<a class="item" href="${P(c, 'lesson', l.id)}"><div><b>${esc(l.title)}</b><p>${esc(c.short)} · ${esc(t.slice(0, 120))}${t.length > 120 ? '…' : ''}</p></div></a>`).join('')}</div>` : ''}
  </div>`;
}

/* ───────── Settings ───────── */
function renderSettings() {
  setTab(null);
  const seg = (name, opts, cur) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button data-${name}="${v}" aria-pressed="${String(v) === String(cur)}">${t}</button>`).join('')}</div>`;
  view.innerHTML = topbar('Settings') + `<div class="fade">
    <label class="field" style="margin-top:4px"><span>Your name</span><input id="sname" value="${esc(state.settings.name)}" maxlength="60" placeholder="Your name" autocomplete="name"></label>
    <h2 class="sec">Daily goal</h2>
    <div class="list"><div class="item"><div><b>Minutes per day</b><p>Lessons, reviews and flashcards all count.</p></div>${seg('goal', GOALS.map(g => [g, g]), state.goal)}</div></div>
    <h2 class="sec">Display</h2>
    <div class="list">
      <div class="item"><b>Theme</b>${seg('theme', [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], state.settings.theme)}</div>
      <div class="item"><b>Text size</b>${seg('size', [['s', 'A−'], ['m', 'A'], ['l', 'A+']], state.settings.size)}</div>
    </div>
    <h2 class="sec">Backup</h2>
    <div class="list">
      <div class="item"><div><b>Export progress</b><p>Save a backup file before changing phones or clearing browser data.</p></div><button class="linkbtn" id="exp">Export</button></div>
      <div class="item"><div><b>Restore backup</b><p>Merges a backup with this device. Nothing is lost.</p></div><button class="linkbtn" id="imp">Restore</button></div>
      <div class="item"><div><b>Reset progress</b><p>Erase all progress on this device.</p></div><button class="linkbtn danger" id="reset">Reset</button></div>
    </div>
    <input type="file" id="file" accept=".json,application/json" hidden>
    <p class="foot" id="offline">Checking offline status…</p>
    <p class="foot" style="margin-top:4px">Steady ${VERSION} · ${plural(COURSES.length, 'course')} · Progress is stored only on this device.</p>
    <p class="foot" style="margin-top:4px">Design adapted from “Educational App | Mobile app Concept” by Nickelfox (Figma Community).</p></div>`;
  $('#back').onclick = () => goBack('#/home');
  let t; $('#sname').oninput = e => { clearTimeout(t); t = setTimeout(() => { state.settings.name = e.target.value.slice(0, 60); save(); }, 300); };
  view.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { state.settings.theme = b.dataset.theme; save(); applySettings(); renderSettings(); });
  view.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { state.settings.size = b.dataset.size; save(); applySettings(); renderSettings(); });
  view.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { state.goal = +b.dataset.goal; save(); renderSettings(); });
  $('#exp').onclick = exportBackup;
  $('#imp').onclick = () => $('#file').click();
  $('#file').onchange = e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ''; };
  $('#reset').onclick = () => {
    if (!confirm('Erase all progress in every course on this device? Export a backup first if you might want it back.')) return;
    const settings = state.settings; state = fresh(); state.settings = settings; state.welcomed = true; save(); toast('Progress reset.'); renderSettings();
  };
  offlineStatus().then(x => { const el = $('#offline'); if (el) el.textContent = x; });
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), a = Object.assign(document.createElement('a'), {href: url, download: name});
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function exportBackup() {
  download(new Blob([JSON.stringify({app: 'steady', version: VERSION, exported: new Date().toISOString(), state}, null, 2)], {type: 'application/json'}), `steady-backup-${today()}.json`);
  toast('Backup file saved to your downloads.');
}
function mergeCourse(a, b) {
  for (const [k, v] of Object.entries(b.done)) if (!a.done[k] || v < a.done[k]) a.done[k] = v;
  for (const [k, v] of Object.entries(b.scores)) if (!a.scores[k] || v[0] > a.scores[k][0]) a.scores[k] = v;
  for (const [k, v] of Object.entries(b.cards)) if (!a.cards[k] || v.box > a.cards[k].box) a.cards[k] = v;
  for (const [k, v] of Object.entries(b.tests)) a.tests[k] = Math.max(a.tests[k] || 0, v);
  for (const [k, v] of Object.entries(b.notes)) if (!a.notes[k]) a.notes[k] = v; else if (!a.notes[k].includes(v)) a.notes[k] += '\n\n' + v;
  if (b.certDate && (!a.certDate || b.certDate < a.certDate)) a.certDate = b.certDate;
  if (b.stats.answered > a.stats.answered) a.stats = b.stats;
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
    } catch (e) { toast('That file isn’t a valid Steady backup.'); return; }
    for (const [id, v] of Object.entries(inc.courses)) { if (!CB[id]) { if (!state.courses[id]) state.courses[id] = v; continue; } mergeCourse(cs(CB[id], true), v); const nx = nextLesson(CB[id]); if (state.courses[id].current && state.courses[id].done[state.courses[id].current]) state.courses[id].current = nx ? nx.id : null; }
    for (const [k, v] of Object.entries(inc.log)) state.log[k] = Math.max(state.log[k] || 0, v);
    if (!state.settings.name && inc.settings.name) state.settings.name = inc.settings.name;
    if ((inc.streak.last || '') > (state.streak.last || '') || (inc.streak.last === state.streak.last && inc.streak.count > state.streak.count)) state.streak = inc.streak;
    if (!state.last && inc.last) state.last = inc.last;
    state.welcomed = true;
    save(); toast(`Backup restored · ${COURSES.reduce((a, c) => a + doneCount(c), 0)} lessons complete.`); renderSettings();
  };
  r.readAsText(file);
}
async function offlineStatus() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return 'Offline mode isn’t supported in this browser.';
  try { return (await caches.has('steady-' + VERSION)) && navigator.serviceWorker.controller ? '✓ Saved for offline use' : 'Preparing offline copy… open the app once more while online.'; }
  catch (e) { return 'Offline status unavailable.'; }
}

/* ───────── Certificate ───────── */
let iconImg = null;
const loadIcon = () => iconImg || (iconImg = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'icon-192.png'; }));
async function drawCertificate(c, cv) {
  const img = await loadIcon(), W = 1600, H = 1130, g = cv.getContext('2d'), s = cs(c), name = state.settings.name.trim() || 'Steady learner';
  const font = (w, z) => `${w} ${z}px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;
  const fit = (t, w, z, max) => { g.font = font(w, z); while (g.measureText(t).width > max && z > 24) { z -= 2; g.font = font(w, z); } };
  const text = (t, y, w, z, col, max = W - 300) => { fit(t, w, z, max); g.fillStyle = col; g.fillText(t, W / 2, y); };
  cv.width = W; cv.height = H; g.textAlign = 'center';
  g.fillStyle = '#fbfbfd'; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(.17, '#548ad8'); gr.addColorStop(.85, '#8a4bd3');
  g.strokeStyle = gr; g.lineWidth = 16; g.strokeRect(40, 40, W - 80, H - 80);
  g.strokeStyle = '#d9dcf5'; g.lineWidth = 2; g.strokeRect(72, 72, W - 144, H - 144);
  if (img) g.drawImage(img, W / 2 - 44, 100, 88, 88);
  text('STEADY', 232, 700, 24, '#495eca');
  text('Certificate of Completion', 320, 500, 72, '#121216');
  text('This certifies that', 405, 400, 30, '#6f6f7b');
  text(name, 505, 500, 80, '#121216', W - 360);
  g.fillStyle = gr; g.fillRect(W / 2 - 260, 540, 520, 4);
  text('has successfully completed the course', 615, 400, 30, '#6f6f7b');
  text(c.title, 700, 500, 56, '#121216');
  text(`${c.lessons.length} lessons · ${c.units.length} units · Final exam score ${s.tests.final}%`, 765, 400, 28, '#6f6f7b');
  text(new Date(s.certDate + 'T12:00').toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'}), 880, 500, 30, '#121216');
  text('Date of completion', 915, 400, 22, '#6f6f7b');
  text('Self-paced personal study record. Not an accredited qualification.', H - 110, 400, 20, '#999999');
}
function renderCertificate(c) {
  if (!certEarned(c)) return location.replace(P(c, 'final'));
  setTab(null);
  const s = cs(c);
  view.innerHTML = topbar('Certificate') + `<div class="fade"><canvas id="cert" class="cert" width="1600" height="1130"></canvas>
    <label class="field"><span>Name on certificate</span><input id="cname" value="${esc(state.settings.name)}" maxlength="60" placeholder="Your full name" autocomplete="name"></label>
    <div class="stack"><button class="btn primary" id="dl">Download certificate (PNG)</button></div>
    <p class="foot">${esc(c.title)} · earned ${fmtDate(s.certDate, {day: 'numeric', month: 'long', year: 'numeric'})} with a final exam score of ${s.tests.final}%.</p></div>`;
  $('#back').onclick = () => goBack(P(c));
  const cv = $('#cert'); drawCertificate(c, cv);
  let t; $('#cname').oninput = e => { clearTimeout(t); t = setTimeout(() => { state.settings.name = e.target.value.slice(0, 60); save(); drawCertificate(c, cv); }, 300); };
  $('#dl').onclick = () => drawCertificate(c, cv).then(() => cv.toBlob(b => download(b, `${c.title.replace(/[^\w]+/g, '-')}-certificate.png`), 'image/png'));
}

/* ───────── Router ───────── */
const LEGACY = ['lesson', 'quiz', 'unit', 'test', 'final', 'certificate'];
function route() {
  stopSpeech();
  const parts = (location.hash || '#/home').split('/'), a = parts[1];
  if (LEGACY.includes(a) && CB[AI_ID]) return location.replace(`#/c/${AI_ID}/${parts.slice(1).join('/')}`);   // links from AI Study 2.x
  if (a === 'learn' || a === 'glossary') return location.replace(a === 'learn' ? '#/home' : '#/search');
  if (!state.welcomed && a !== 'welcome') return location.replace('#/welcome');
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
if (!COURSES.length) view.innerHTML = '<div class="card empty"><h2>No courses found</h2><p>Course files failed to load. Reload the app while online.</p></div>';
else route();
if (notice) setTimeout(() => toast(notice), 400);

/* ───────── Offline (service worker) ───────── */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(reg => { reg.update().catch(() => {}); }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) toast('Steady was updated.', 'Reload', () => location.reload());
    else if (location.hash === '#/settings') renderSettings();
  });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
})();
