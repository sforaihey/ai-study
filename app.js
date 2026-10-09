/* AI Study · offline-first study app. Progress lives in localStorage under KEY. */
(() => {
'use strict';
const VERSION = '2.1.0';
const KEY = 'ai-study-v2', OLD_KEY = 'ai-study-pwa-v1';
const L = window.LESSONS, U = window.UNITS, OBJ = window.UNIT_OBJECTIVES, TRY = window.TRY_IT, SC = window.SCENARIOS;
const byId = Object.fromEntries(L.map((l, i) => [l.id, Object.assign(l, {index: i})]));
const INTERVALS = [0, 1, 3, 7, 16, 35];            // days until next review, by box
const REVIEW_MAX = 15, CARDS_MAX = 20, PASS = 80, GOALS = [5, 10, 15, 20];
const MIN_PER_Q = 0.75, MIN_PER_CARD = 0.2, WPM = 170;
// Old app (v1) lesson order → new lesson ids, so earlier completions carry over.
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
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" ${extra}>${d}</svg>`;
const ICON = {
  back: svg('<path d="M15 18l-6-6 6-6"/>'),
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  chev: svg('<path d="m6 9 6 6 6-6"/>', 'class="chev"'),
  flame: svg('<path d="M12 22c4 0 7-3 7-7 0-3-2-5.5-3.5-7-.3 2-1.3 3-2.5 3.5C13.5 8 12 4.5 9 2c.5 3-1 5-2.5 6.8C5.6 10 5 12.3 5 15c0 4 3 7 7 7z"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 'class="ar"'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  play: svg('<path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'),
  stop: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  test: svg('<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>'),
  award: svg('<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>'),
  pen: svg('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')
};

/* ───────── Time estimates (reading at ~170 wpm + ~45 s per question) ───────── */
for (const l of L) {
  l.mins = Math.max(3, Math.round(words([l.intro, ...l.body, ...l.points, l.example, l.myth, TRY[l.id] || '', ...l.terms.flat()]) / WPM + l.quiz.length * MIN_PER_Q));
  l.deepMins = Math.max(1, Math.round(words(l.deeper) / WPM));
}
const TEST_Q = 10, FINAL_Q = 30;
const testMins = n => Math.round(n * MIN_PER_Q + 1);

/* ───────── Question bank ───────── */
// keys: "<lessonId>#<n>" lesson quiz · "u<unit>#<n>" scenario · "t:<term>" flashcard term
const TERMS = (() => { const m = new Map(); for (const l of L) for (const [t, d] of l.terms) { const k = t.toLowerCase(); if (!m.has(k)) m.set(k, {k: 't:' + k, t, d, l}); } return m; })();
function qOf(key) {
  let m = /^u(\d)#(\d+)$/.exec(key);
  if (m) { const q = SC[m[1]] && SC[m[1]][+m[2]]; return q && {q, label: `Unit ${m[1]} scenario`}; }
  m = /^(.+)#(\d+)$/.exec(key);
  if (m && byId[m[1]]) { const q = byId[m[1]].quiz[+m[2]]; return q && {q, label: byId[m[1]].title}; }
  return null;
}
const validCard = k => k.startsWith('t:') ? TERMS.has(k.slice(2)) : !!qOf(k);

/* ───────── State ───────── */
const fresh = () => ({v:2, done:{}, scores:{}, cards:{}, current:null, streak:{count:0,last:null}, stats:{answered:0,correct:0},
  tests:{}, certDate:null, log:{}, goal:10, goalHit:null, notes:{}, settings:{theme:'auto',size:'m',name:''}});
function sanitize(x) {
  const s = fresh();
  if (!x || typeof x !== 'object') return s;
  const obj = o => o && typeof o === 'object' ? Object.entries(o) : [];
  for (const [k, v] of obj(x.done)) if (byId[k]) s.done[k] = isDate(v) ? v : today();
  for (const [k, v] of obj(x.scores)) if (byId[k] && Array.isArray(v)) s.scores[k] = [int(v[0], 3), int(v[1], 3)];
  for (const [k, v] of obj(x.cards)) if (validCard(k) && v && isDate(v.due)) s.cards[k] = {box: int(v.box, 5), due: v.due};
  if (byId[x.current]) s.current = x.current;
  if (x.streak) s.streak = {count: int(x.streak.count), last: isDate(x.streak.last) ? x.streak.last : null};
  if (x.stats) s.stats = {answered: int(x.stats.answered), correct: Math.min(int(x.stats.correct), int(x.stats.answered))};
  for (const [k, v] of obj(x.tests)) if ((k === 'final' || SC[k]) && Number.isFinite(v)) s.tests[k] = Math.max(0, Math.min(100, Math.round(v)));
  if (isDate(x.certDate)) s.certDate = x.certDate;
  for (const [k, v] of obj(x.log)) if (isDate(k) && Number.isFinite(v) && v > 0) s.log[k] = Math.min(v, 1440);
  if (GOALS.includes(x.goal)) s.goal = x.goal;
  if (isDate(x.goalHit)) s.goalHit = x.goalHit;
  for (const [k, v] of obj(x.notes)) if (byId[k] && typeof v === 'string' && v.trim()) s.notes[k] = v.slice(0, 5000);
  if (x.settings) s.settings = {theme: ['auto','light','dark'].includes(x.settings.theme) ? x.settings.theme : 'auto', size: ['s','m','l'].includes(x.settings.size) ? x.settings.size : 'm', name: typeof x.settings.name === 'string' ? x.settings.name.slice(0, 60) : ''};
  return s;
}
function migrateV1(o) {
  const s = fresh(), d = isDate(o && o.lastDay) ? o.lastDay : today();
  for (const i of (Array.isArray(o && o.done) ? o.done : [])) for (const id of (OLD_MAP[i] || [])) s.done[id] = d;
  if (o && isDate(o.lastDay)) s.streak = {count: int(o.streak), last: o.lastDay};
  return s;
}
let notice = '', migrated = false;
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { notice = 'Storage is blocked in this browser, so progress can’t be saved.'; return fresh(); }
  try {
    if (raw) return sanitize(JSON.parse(raw));
    const old = localStorage.getItem(OLD_KEY);
    if (old) { const s = migrateV1(JSON.parse(old)); migrated = true; notice = Object.keys(s.done).length ? 'Welcome to the new AI Study. Your earlier progress was carried over.' : ''; return s; }
  } catch (e) {
    try { localStorage.setItem(KEY + '-unreadable-' + Date.now(), raw); } catch (_) {}
    notice = 'Saved progress was unreadable. A copy was kept, and you can restore a backup from Progress.';
  }
  return fresh();
}
let state = load();
if (migrated) save();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (e) { toast('Couldn’t save progress. Storage may be full or blocked.'); return false; }
}

/* ───────── Derived ───────── */
const doneCount = () => L.filter(l => state.done[l.id]).length;
const nextLesson = () => L.find(l => !state.done[l.id]) || null;
const continueLesson = () => (state.current && !state.done[state.current] && byId[state.current]) || nextLesson();
const isDue = k => state.cards[k] && state.cards[k].due <= today();
const dueQs = () => Object.keys(state.cards).filter(k => !k.startsWith('t:') && isDue(k));
const dueTerms = () => [...TERMS.values()].filter(x => state.done[x.l.id] && (!state.cards[x.k] || isDue(x.k))).map(x => x.k);
const streakNow = () => { const t = today(), s = state.streak; return s.last === t || s.last === addDays(t, -1) ? s.count : 0; };
const minsOn = d => state.log[d] || 0;
const totalMins = () => Object.values(state.log).reduce((a, b) => a + b, 0);
const unitLessons = n => L.filter(l => l.unit === n);
const passed = k => (state.tests[k] || 0) >= PASS;
const courseMins = () => L.reduce((a, l) => a + l.mins, 0) + U.length * testMins(TEST_Q) + testMins(FINAL_Q);
const remainingMins = () => L.filter(l => !state.done[l.id]).reduce((a, l) => a + l.mins, 0) + U.filter(u => !passed(u.n)).length * testMins(TEST_Q) + (passed('final') ? 0 : testMins(FINAL_Q));
function mastery(id) {
  if (!state.done[id]) return null;
  const boxes = byId[id].quiz.map((_, n) => (state.cards[`${id}#${n}`] || {box: 0}).box);
  const avg = boxes.reduce((a, b) => a + b, 0) / boxes.length;
  return avg >= 4 ? 'Mastered' : avg >= 2 ? 'Familiar' : 'Learning';
}
const certEarned = () => !!state.certDate && doneCount() === L.length && passed('final');

function bumpStreak() { const t = today(), s = state.streak; if (s.last === t) return; s.count = s.last === addDays(t, -1) ? s.count + 1 : 1; s.last = t; }
function logMins(m) {
  const t = today(); state.log[t] = Math.round(((state.log[t] || 0) + m) * 100) / 100;
  const keys = Object.keys(state.log).sort(); while (keys.length > 400) delete state.log[keys.shift()];
  bumpStreak();
  if (state.goalHit !== t && state.log[t] >= state.goal) { state.goalHit = t; setTimeout(() => toast(`Daily goal reached: ${state.goal} minutes. Nice work!`), 300); }
}
function grade(key, correct, spaced) {
  const c = state.cards[key];
  const box = correct ? (spaced ? Math.min((c ? c.box : 0) + 1, 5) : Math.max(c ? c.box : 0, 1)) : 0;
  state.cards[key] = {box, due: addDays(today(), INTERVALS[box])};
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
function updateBadge() { const n = dueQs().length + dueTerms().length, b = $('#dueBadge'); b.hidden = !n; b.textContent = n > 99 ? '99+' : n; }
function setTab(tab) {
  document.body.classList.toggle('full', !tab);
  document.querySelectorAll('.tabs a').forEach(a => a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  updateBadge();
}
const topbar = (label, extra = '') => `<div class="topbar"><button class="iconbtn" id="back" aria-label="Back">${ICON.back}</button><span class="label">${label}</span>${extra || '<span class="iconbtn"></span>'}</div>`;
const progressTop = (pct, count) => `<div class="topbar"><button class="iconbtn" id="back" aria-label="Close">${ICON.close}</button><div class="bar"><i style="width:${pct}%"></i></div><span class="count">${count}</span></div>`;
const ring = (p, size = 56, sw = 6) => { const r = (size - sw) / 2, c = 2 * Math.PI * r; return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${sw}" class="ring-bg"/><circle cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${sw}" class="ring-fg" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - Math.min(p, 1))).toFixed(2)}" transform="rotate(-90 ${size/2} ${size/2})"/></svg>`; };

/* ───────── Learn (home) ───────── */
function todayCard() {
  const t = today(), m = minsOn(t), days = [];
  for (let i = 6; i >= 0; i--) { const d = addDays(t, -i), v = minsOn(d);
    days.push(`<span class="day ${v >= state.goal ? 'hit' : v > 0 ? 'some' : ''} ${i === 0 ? 'now' : ''}"><i></i>${fmtDate(d, {weekday: 'narrow'})}</span>`); }
  return `<a class="card today" href="#/you"><div class="ringwrap">${ring(m / state.goal)}<b>${Math.floor(m)}</b></div>
    <div class="tt"><b>${m >= state.goal ? 'Daily goal reached ✓' : 'Today’s goal'}</b><small>${Math.floor(m)} of ${state.goal} min · last 7 days</small><div class="week">${days.join('')}</div></div></a>`;
}
function renderLearn() {
  setTab('learn');
  const next = continueLesson(), n = doneCount(), pct = Math.round(n / L.length * 100), dq = dueQs().length, dt = dueTerms().length, st = streakNow();
  const openUnit = next ? next.unit : 0;
  let hero;
  if (next) {
    const started = n > 0 || state.current;
    hero = `<a class="hero" href="#/lesson/${next.id}">
      <p class="eyebrow">${started ? 'Continue' : 'Start here'} · Unit ${next.unit}</p>
      <h2>${esc(next.title)}</h2><p>${esc(next.intro)}</p>
      <div class="row"><span class="meta">${next.mins} min · Lesson ${next.index + 1} of ${L.length}</span><span class="go">${started ? 'Continue' : 'Start'} ${ICON.arrow}</span></div></a>`;
  } else if (!certEarned()) {
    hero = `<a class="hero" href="#/final"><p class="eyebrow">All lessons complete</p><h2>Take the final exam</h2>
      <p>${FINAL_Q} questions across the whole course. Score ${PASS}% or more to earn your certificate.</p>
      <div class="row"><span class="meta">About ${testMins(FINAL_Q)} min</span><span class="go">Start ${ICON.arrow}</span></div></a>`;
  } else {
    hero = `<a class="hero" href="#/certificate"><p class="eyebrow">Course complete</p><h2>You earned your certificate</h2>
      <p>Keep it fresh with a few spaced-review questions each day.</p>
      <div class="row"><span class="meta">Final exam ${state.tests.final}%</span><span class="go">View ${ICON.arrow}</span></div></a>`;
  }
  const units = U.map(u => {
    const ls = unitLessons(u.n), d = ls.filter(l => state.done[l.id]).length, mins = ls.reduce((a, l) => a + l.mins, 0) + testMins(TEST_Q);
    const best = state.tests[u.n], complete = d === ls.length && passed(u.n);
    const rows = ls.map(l => `<li><a class="lrow ${state.done[l.id] ? 'done' : ''} ${next && l.id === next.id ? 'next' : ''}" href="#/lesson/${l.id}">
      <span class="dot"></span><span class="lt">${esc(l.title)}</span><span class="lm">${l.mins} min</span></a></li>`).join('');
    return `<details class="unit ${complete ? 'complete' : ''}" ${u.n === openUnit ? 'open' : ''}>
      <summary><span class="unum">${complete ? '✓' : u.n}</span><span class="t"><b>${esc(u.title)}</b><small>${d} of ${ls.length} lessons · ${fmtMin(mins)}</small></span>${ICON.chev}</summary>
      <div class="obj"><p>You’ll be able to</p><ul>${OBJ[u.n].map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>
      <ol class="lessons">${rows}
        <li><a class="lrow extra" href="#/unit/${u.n}"><span class="ico">${ICON.list}</span><span class="lt">Unit recap & flashcards</span><span class="lm"></span></a></li>
        <li><a class="lrow extra" href="#/test/${u.n}"><span class="ico ${passed(u.n) ? 'ok' : ''}">${ICON.test}</span><span class="lt">Unit test</span><span class="lm">${best != null ? `<span class="score-chip ${passed(u.n) ? 'ok' : ''}">${best}%</span>` : `${TEST_Q} questions`}</span></a></li>
      </ol></details>`;
  }).join('');
  const finalRow = `<a class="card finalcard" href="${certEarned() ? '#/certificate' : '#/final'}"><span class="ico big ${passed('final') ? 'ok' : ''}">${ICON.award}</span>
    <span class="t"><b>${certEarned() ? 'Your certificate' : 'Final exam & certificate'}</b><small>${certEarned() ? `Earned ${fmtDate(state.certDate, {day: 'numeric', month: 'short', year: 'numeric'})}` : `${FINAL_Q} questions · pass mark ${PASS}%${state.tests.final != null ? ` · best ${state.tests.final}%` : ''}`}</small></span>${ICON.arrow}</a>`;
  view.innerHTML = `<div class="fade">
    <div class="head"><div><p class="eyebrow">AI Foundations</p><h1>Learn</h1></div>
      <span class="pill ${st ? 'hot' : ''}" title="Day streak">${ICON.flame}${plural(st, 'day')}</span></div>
    ${hero}
    <div class="progress"><div class="bar"><i style="width:${pct}%"></i></div><span>${n}/${L.length} lessons</span></div>
    <p class="remain">${remainingMins() ? `About ${fmtMin(remainingMins())} of study left` : 'Course finished'}</p>
    ${todayCard()}
    ${dq + dt ? `<a class="card rowcard" href="#/review"><span><b>${[dq && plural(dq, 'question'), dt && plural(dt, 'flashcard')].filter(Boolean).join(' · ')} to review</b><br><small>Spaced repetition keeps it in long-term memory</small></span>${ICON.arrow}</a>` : ''}
    <h2 class="section-title">Course · ${U.length} units · about ${fmtMin(courseMins())}</h2>${units}${finalRow}
  </div>`;
}

/* ───────── Lesson ───────── */
let speaking = false;
function stopSpeech() { if (speaking && window.speechSynthesis) speechSynthesis.cancel(); speaking = false; const b = $('#listen'); if (b) { b.innerHTML = ICON.play; b.setAttribute('aria-label', 'Listen to lesson'); } }
function speak(l) {
  if (speaking) return stopSpeech();
  const parts = [l.title + '.', l.intro, ...l.body, 'Key points.', ...l.points, 'Example.', l.example, 'Common misconception.', l.myth, 'Try it.', TRY[l.id]];
  const voices = speechSynthesis.getVoices(), voice = voices.find(v => /^en[-_]/i.test(v.lang) && v.localService) || voices.find(v => /^en/i.test(v.lang));
  speechSynthesis.cancel(); speaking = true;
  parts.forEach((p, i) => {
    const u = new SpeechSynthesisUtterance(p.replace(/→/g, ', then ').replace(/≈/g, 'about'));
    u.lang = 'en-US'; if (voice) u.voice = voice; u.rate = 0.98;
    if (i === parts.length - 1) u.onend = () => stopSpeech();
    speechSynthesis.speak(u);
  });
  const b = $('#listen'); b.innerHTML = ICON.stop; b.setAttribute('aria-label', 'Stop listening');
}
function renderLesson(id) {
  const l = byId[id]; if (!l) return location.replace('#/learn');
  setTab(null);
  if (!state.done[id] && state.current !== id) { state.current = id; save(); }
  const prev = L[l.index - 1], next = L[l.index + 1], u = U.find(x => x.n === l.unit), ms = mastery(id);
  const [myth, reality] = l.myth.replace(/^Myth:\s*/, '').split(/\s*Reality:\s*/);
  const canSpeak = 'speechSynthesis' in window;
  view.innerHTML = topbar(`Lesson ${l.index + 1} of ${L.length}`, canSpeak ? `<button class="iconbtn" id="listen" aria-label="Listen to lesson">${ICON.play}</button>` : '') +
  `<div class="readbar"><i id="readp"></i></div>
  <article class="lesson fade">
    <p class="eyebrow">Unit ${u.n} · ${esc(u.title)}</p>
    <h1>${esc(l.title)}</h1>
    <p class="lead">${esc(l.intro)}</p>
    <p class="meta">${l.mins} min · ${l.quiz.length} questions${ms ? ` · <span class="mchip m-${ms.toLowerCase()}">${ms}</span>` : ''}</p>
    ${l.body.map(p => `<p class="body">${esc(p)}</p>`).join('')}
    <div class="box key"><h3>Key points</h3><ul>${l.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <div class="box ex"><h3>Example</h3><p>${esc(l.example)}</p></div>
    <div class="box myth"><h3>Common misconception</h3><p><b>Myth:</b> ${esc(myth)}</p>${reality ? `<p><b>Reality:</b> ${esc(reality[0].toUpperCase() + reality.slice(1))}</p>` : ''}</div>
    <div class="box try"><h3>${ICON.pen}Try it</h3><p>${esc(TRY[l.id])}</p></div>
    <details class="deeper"><summary><span>Go deeper <small>· +${l.deepMins} min</small></span>${ICON.chev}</summary><div class="in">${l.deeper.map(p => `<p class="body">${esc(p)}</p>`).join('')}</div></details>
    <h2 class="section-title" style="margin-left:0">Key terms</h2>
    <dl class="terms">${l.terms.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
    <h2 class="section-title" style="margin-left:0">My notes</h2>
    <textarea id="note" class="note" rows="3" placeholder="A thought, a question, or how this applies to your work…">${esc(state.notes[id] || '')}</textarea>
    <div class="stack"><a class="btn primary" href="#/quiz/${l.id}">${state.done[id] ? 'Retake the quiz' : 'Take the quiz'} ${ICON.arrow}</a></div>
    <nav class="pager">${prev ? `<a href="#/lesson/${prev.id}">‹ Previous<b>${esc(prev.title)}</b></a>` : ''}${next ? `<a href="#/lesson/${next.id}">Next ›<b>${esc(next.title)}</b></a>` : ''}</nav>
  </article>`;
  $('#back').onclick = () => goBack('#/learn');
  if (canSpeak) $('#listen').onclick = () => speak(l);
  let t; $('#note').oninput = e => { clearTimeout(t); t = setTimeout(() => { if (e.target.value.trim()) state.notes[id] = e.target.value.slice(0, 5000); else delete state.notes[id]; save(); }, 400); };
}
function onScroll() { const p = $('#readp'); if (!p) return; const h = document.documentElement.scrollHeight - innerHeight; p.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 100) + '%'; }
addEventListener('scroll', onScroll, {passive: true});

/* ───────── Unit recap ───────── */
function renderUnit(n) {
  n = +n; const u = U.find(x => x.n === n); if (!u) return location.replace('#/learn');
  setTab(null);
  const ls = unitLessons(n), terms = new Set(ls.flatMap(l => l.terms.map(([t]) => t.toLowerCase()))).size;
  view.innerHTML = topbar(`Unit ${n} recap`) + `<article class="lesson fade">
    <p class="eyebrow">Unit ${n}</p><h1>${esc(u.title)}</h1><p class="lead">${esc(u.blurb)}</p>
    <div class="box key"><h3>You’ll be able to</h3><ul>${OBJ[n].map(o => `<li>${esc(o)}</li>`).join('')}</ul></div>
    <div class="stack two"><a class="btn" href="#/cards/${n}">Flashcards · ${terms}</a><a class="btn primary" href="#/test/${n}">Unit test</a></div>
    <h2 class="section-title" style="margin-left:0">Cheat sheet</h2>
    ${ls.map(l => `<div class="recap"><a href="#/lesson/${l.id}"><b>${esc(l.title)}</b>${state.done[l.id] ? '<span class="tick">✓</span>' : ''}</a><ul>${l.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}
  </article>`;
  $('#back').onclick = () => goBack('#/learn');
}

/* ───────── Quiz engine (lessons, reviews, tests, exam) ───────── */
let session = null;
function makeItem(key) {
  const {q: [q, opts, ans, why], label} = qOf(key);
  const order = shuffle(opts.map((_, i) => i));
  return {key, label, q, opts: order.map(i => opts[i]), ans: order.indexOf(ans), why};
}
function startSession(kind, keys, extra) { session = Object.assign({kind, items: keys.map(makeItem), i: 0, picked: null, right: 0, missed: []}, extra); }
const TITLES = {lesson: 'Quick check', due: 'Review', mix: 'Practice', test: 'Unit test', final: 'Final exam'};
const graded = s => s.kind === 'test' || s.kind === 'final';
function renderQuiz() {
  setTab(null);
  const s = session, it = s.items[s.i], total = s.items.length, answered = s.picked !== null;
  const opts = it.opts.map((o, i) => {
    const cls = answered ? (i === it.ans ? 'right' : i === s.picked ? 'wrong' : 'dim') : '';
    return `<button class="opt ${cls}" data-i="${i}" ${answered ? 'disabled' : ''}><span class="k">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`;
  }).join('');
  const ok = s.picked === it.ans;
  view.innerHTML = progressTop(Math.round((s.i + (answered ? 1 : 0)) / total * 100), `${s.i + 1}/${total}`) + `
  <div class="q fade">
    <p class="src">${esc(s.kind === 'lesson' ? TITLES.lesson : `${TITLES[s.kind]} · ${it.label}`)}</p>
    <h2>${esc(it.q)}</h2>
    <div class="opts">${opts}</div>
    ${answered ? `<div class="why ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct' : 'Not quite'}</b>${esc(it.why)}</div>
      <div class="stack"><button class="btn primary" id="cont">${s.i + 1 < total ? 'Continue' : 'See results'}</button></div>` : ''}
  </div>`;
  $('#back').onclick = () => { if (graded(s) && (s.i > 0 || answered) && !confirm('Leave now? This attempt won’t be scored.')) return; goBack(s.back); };
  view.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (s.picked !== null) return;
    s.picked = +b.dataset.i;
    const correct = s.picked === it.ans;
    if (correct) s.right++; else s.missed.push(it);
    grade(it.key, correct, s.kind === 'due' || s.kind === 'mix');
    state.stats.answered++; if (correct) state.stats.correct++;
    if (s.kind !== 'lesson') logMins(MIN_PER_Q);
    save(); renderQuiz();
    const w = $('.why'); if (w) w.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  });
  const c = $('#cont'); if (c) c.onclick = () => { if (s.i + 1 < total) { s.i++; s.picked = null; renderQuiz(); scrollTo(0, 0); } else finishSession(); };
}
function finishSession() {
  const s = session; s.finished = true;
  const pct = Math.round(s.right / s.items.length * 100);
  if (s.kind === 'lesson') {
    const id = s.lessonId, best = state.scores[id];
    if (!state.done[id]) state.done[id] = today();
    if (!best || s.right > best[0]) state.scores[id] = [s.right, s.items.length];
    const nx = nextLesson(); state.current = nx ? nx.id : null;
    logMins(byId[id].mins);
  } else if (graded(s)) {
    const k = s.kind === 'final' ? 'final' : s.unit;
    s.prevBest = state.tests[k];
    state.tests[k] = Math.max(state.tests[k] || 0, pct);
    if (s.kind === 'final' && pct >= PASS && doneCount() === L.length && !state.certDate) { state.certDate = today(); s.newCert = true; }
  }
  save(); renderResult(); scrollTo(0, 0);
}
function renderResult() {
  setTab(null);
  const s = session, total = s.items.length, p = Math.round(s.right / total * 100);
  const go = (href, text, primary) => `<button class="btn ${primary ? 'primary' : ''}" data-go="${href}">${esc(text)}</button>`;
  let title, msg, actions;
  if (s.kind === 'lesson') {
    const nx = nextLesson(), missed = total - s.right, l = byId[s.lessonId];
    const unitReady = unitLessons(l.unit).every(x => state.done[x.id]) && !passed(l.unit);
    title = s.right === total ? 'Perfect score' : 'Lesson complete';
    msg = missed ? `You missed ${missed}. ${missed === 1 ? 'It’s' : 'They’re'} added to Review so you’ll see ${missed === 1 ? 'it' : 'them'} again today.` : 'All correct. These questions come back for review tomorrow, then at longer gaps.';
    actions = (unitReady ? go(`#/test/${l.unit}`, `Unit ${l.unit} finished: take the unit test`, true) : '') +
      (nx ? go(`#/lesson/${nx.id}`, `Next: ${nx.title}`, !unitReady) : go('#/final', 'Take the final exam', !unitReady)) +
      go('#/learn', 'Back to course') + `<button class="btn" id="retake">Retake quiz</button>`;
  } else if (graded(s)) {
    const ok = p >= PASS, isFinal = s.kind === 'final';
    title = ok ? (isFinal ? 'You passed the final exam' : `Unit ${s.unit} passed`) : 'Not passed yet';
    msg = ok ? (s.newCert ? 'Congratulations, your certificate is ready.' : isFinal && doneCount() < L.length ? `Finish the remaining ${plural(L.length - doneCount(), 'lesson')} to unlock your certificate.` : `Pass mark is ${PASS}%.${s.prevBest != null && p > s.prevBest ? ' New best score!' : ''}`)
      : `You need ${PASS}% to pass. Go over the questions below, revisit those lessons, then try again. Questions change each attempt.`;
    actions = (certEarned() && isFinal ? go('#/certificate', 'View certificate', true) : '') +
      (ok ? '' : `<button class="btn primary" id="retake">Try again</button>`) +
      (!isFinal && ok && nextLesson() ? go(`#/lesson/${nextLesson().id}`, 'Continue the course', true) : '') + go('#/learn', 'Back to course', ok && !certEarned() && (isFinal || !nextLesson()));
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
function routeQuiz(id) {
  const l = byId[id]; if (!l) return location.replace('#/learn');
  const r = '#/quiz/' + id;
  if (!session || session.route !== r) startSession('lesson', l.quiz.map((_, n) => `${id}#${n}`), {route: r, lessonId: id, back: `#/lesson/${id}`});
  session.finished ? renderResult() : renderQuiz();
}
function testIntro(kind, n) {
  setTab(null);
  const isFinal = kind === 'final', u = !isFinal && U.find(x => x.n === n), best = state.tests[isFinal ? 'final' : n], count = isFinal ? FINAL_Q : TEST_Q;
  const ls = isFinal ? L : unitLessons(n), notDone = ls.filter(l => !state.done[l.id]).length;
  view.innerHTML = topbar(isFinal ? 'Final exam' : `Unit ${n} test`) + `<div class="fade intro">
    <span class="ico huge">${isFinal ? ICON.award : ICON.test}</span>
    <h1>${isFinal ? 'AI Foundations final exam' : esc(u.title)}</h1>
    <p class="sub">${isFinal ? 'Covers all 8 units, mixing lesson questions with real-world scenarios.' : 'Mixes this unit’s lesson questions with real-world scenarios you haven’t seen before.'}</p>
    <div class="facts"><div><b>${count}</b><span>questions</span></div><div><b>~${testMins(count)}</b><span>minutes</span></div><div><b>${PASS}%</b><span>to pass</span></div></div>
    ${best != null ? `<p class="sub">Your best: <b>${best}%</b>${best >= PASS ? ' · passed ✓' : ''}</p>` : ''}
    ${notDone ? `<p class="warn">${plural(notDone, 'lesson')} ${isFinal ? 'in the course' : 'in this unit'} still unfinished. You can start now, but finishing ${notDone === 1 ? 'it' : 'them'} first will help.${isFinal ? ' The certificate needs every lesson complete.' : ''}</p>` : ''}
    <div class="stack"><button class="btn primary" id="begin">Start ${isFinal ? 'exam' : 'test'}</button></div></div>`;
  $('#back').onclick = () => goBack('#/learn');
  $('#begin').onclick = () => {
    const lessonQs = ls => shuffle(ls.flatMap(l => l.quiz.map((_, i) => `${l.id}#${i}`)));
    const keys = isFinal
      ? shuffle([...U.flatMap(x => shuffle(SC[x.n].map((_, i) => `u${x.n}#${i}`)).slice(0, 2)), ...lessonQs(L).slice(0, FINAL_Q - 2 * U.length)])
      : shuffle([...SC[n].map((_, i) => `u${n}#${i}`), ...lessonQs(ls).slice(0, TEST_Q - SC[n].length)]);
    startSession(kind, keys, {route: location.hash, unit: n, back: '#/learn', started: true});
    renderQuiz(); scrollTo(0, 0);
  };
}
function routeTest(kind, n) {
  if (kind === 'test' && !SC[n]) return location.replace('#/learn');
  if (session && session.route === location.hash && session.started) return session.finished ? renderResult() : renderQuiz();
  session = null; testIntro(kind, kind === 'test' ? +n : null);
}

/* ───────── Review & flashcards ───────── */
function renderReview() {
  setTab('review');
  session = null;
  const dq = dueQs(), dt = dueTerms(), qcards = Object.entries(state.cards).filter(([k]) => !k.startsWith('t:')).map(([, c]) => c), learned = Object.keys(state.done).length;
  const mastered = qcards.filter(c => c.box >= 4).length;
  const upcoming = Object.values(state.cards).filter(c => c.due > today()).map(c => c.due).sort()[0];
  let main;
  if (!learned && !qcards.length) {
    main = `<div class="card empty"><h2>Nothing to review yet</h2><p>Finish a lesson and its questions and key terms appear here on a spaced schedule: after 1 day, 3 days, a week, and so on.</p>
      <div class="stack"><a class="btn primary" href="#/learn">Go to lessons</a></div></div>`;
  } else {
    main = `<div class="revgrid">
      <a class="card rev ${dq.length ? '' : 'idle'}" href="${dq.length ? '#/review/due' : '#/review'}"><span class="big">${dq.length}</span><b>Questions</b><small>${dq.length ? `due now${dq.length > REVIEW_MAX ? ` · ${REVIEW_MAX} per round` : ''}` : 'all caught up'}</small></a>
      <a class="card rev ${dt.length ? '' : 'idle'}" href="${dt.length ? '#/cards' : '#/review'}"><span class="big">${dt.length}</span><b>Flashcards</b><small>${dt.length ? 'key terms due' : 'all caught up'}</small></a></div>
      ${!dq.length && !dt.length && upcoming ? `<p class="sub center">Next review: ${fmtDate(upcoming, {weekday: 'long', day: 'numeric', month: 'short'})}</p>` : ''}`;
  }
  view.innerHTML = `<div class="fade"><div class="head"><div><p class="eyebrow">Spaced repetition</p><h1>Review</h1></div></div>
    ${main}
    ${qcards.length ? `<div class="stats" style="margin-top:12px"><div class="stat"><b>${qcards.length - mastered}</b><span>questions learning</span></div><div class="stat"><b>${mastered}</b><span>questions mastered</span></div></div>` : ''}
    ${learned ? `<h2 class="section-title">Extra practice</h2><div class="stack" style="margin-top:0"><a class="btn" href="#/review/mix">10 mixed questions from finished lessons</a></div>` : ''}
    <p class="foot">Testing yourself, and spacing it out over days, are the two best-proven ways to remember what you learn.</p></div>`;
}
function routeReviewSession(mode) {
  const r = '#/review/' + mode;
  if (!session || session.route !== r) {
    const keys = mode === 'due' ? shuffle(dueQs()).slice(0, REVIEW_MAX)
      : shuffle(Object.keys(state.done).flatMap(id => byId[id].quiz.map((_, n) => `${id}#${n}`))).slice(0, 10);
    if (!keys.length) return location.replace('#/review');
    startSession(mode, keys, {route: r, back: '#/review'});
  }
  session.finished ? renderResult() : renderQuiz();
}
let deck = null;
function routeCards(n) {
  const r = location.hash;
  if (!deck || deck.route !== r) {
    const keys = n ? [...new Set(shuffle(unitLessons(+n).flatMap(l => l.terms.map(([t]) => 't:' + t.toLowerCase()))))] : shuffle(dueTerms()).slice(0, CARDS_MAX);
    if (!keys.length) return location.replace('#/review');
    deck = {route: r, keys, i: 0, flipped: false, got: 0, back: n ? `#/unit/${n}` : '#/review'};
  }
  renderCard();
}
function renderCard() {
  setTab(null);
  const d = deck;
  if (d.i >= d.keys.length) {
    view.innerHTML = `<div class="result fade"><div class="score" style="--p:${Math.round(d.got / d.keys.length * 100)}"><span>${d.got}/${d.keys.length}</span></div><h1>Deck done</h1>
      <p>Cards you knew come back later; ones you’re still learning come back sooner.</p><div class="stack"><button class="btn primary" data-go="${d.back}">Done</button></div></div>`;
    view.querySelector('[data-go]').onclick = e => location.replace(e.currentTarget.dataset.go);
    return;
  }
  const term = TERMS.get(d.keys[d.i].slice(2));
  view.innerHTML = progressTop(d.i / d.keys.length * 100, `${d.i + 1}/${d.keys.length}`) + `
    <div class="fade"><button class="flash ${d.flipped ? 'flipped' : ''}" id="flip" aria-live="polite">
      <small>${esc(term.l.title)}</small><b>${esc(term.t)}</b>${d.flipped ? `<p>${esc(term.d)}</p>` : '<span class="hint">Say the definition to yourself, then tap</span>'}</button>
    ${d.flipped ? `<div class="stack two"><button class="btn" id="again">Still learning</button><button class="btn primary" id="got">Got it</button></div>` : `<div class="stack"><button class="btn primary" id="show">Show answer</button></div>`}</div>`;
  $('#back').onclick = () => goBack(d.back);
  const flip = () => { if (!d.flipped) { d.flipped = true; renderCard(); } };
  $('#flip').onclick = flip; const sh = $('#show'); if (sh) sh.onclick = flip;
  const answer = ok => { grade(term.k, ok, true); if (ok) d.got++; logMins(MIN_PER_CARD); save(); d.i++; d.flipped = false; renderCard(); };
  const a = $('#again'); if (a) { a.onclick = () => answer(false); $('#got').onclick = () => answer(true); }
}

/* ───────── Glossary & search ───────── */
let gQuery = '';
function renderGlossary() {
  setTab('glossary');
  const all = [...TERMS.values()].sort((a, b) => a.t.localeCompare(b.t, 'en', {sensitivity: 'base'}));
  view.innerHTML = `<div class="fade"><div class="head"><div><p class="eyebrow">${all.length} terms · ${L.length} lessons</p><h1>Glossary</h1></div></div>
    <label class="search">${ICON.search}<input id="q" type="search" placeholder="Search terms and lessons" value="${esc(gQuery)}" autocomplete="off" enterkeyhint="search" aria-label="Search"></label>
    <div id="gl"></div></div>`;
  const draw = () => {
    const q = gQuery.trim().toLowerCase();
    const items = q ? all.filter(g => (g.t + ' ' + g.d).toLowerCase().includes(q)) : all;
    const lessons = q ? L.filter(l => [l.title, l.intro, ...l.body, ...l.points].join(' ').toLowerCase().includes(q)).slice(0, 6) : [];
    let last = '', html = lessons.length ? `<p class="letter">Lessons</p><ul class="gl">${lessons.map(l => `<li><a class="lhit" href="#/lesson/${l.id}"><b>${esc(l.title)}</b><span>Unit ${l.unit} · ${l.mins} min ›</span></a></li>`).join('')}</ul>` : '';
    if (q && items.length) html += '<p class="letter">Terms</p><ul class="gl">';
    for (const g of items) {
      const letter = /[a-z]/i.test(g.t[0]) ? g.t[0].toUpperCase() : '#';
      if (!q && letter !== last) { html += `${last ? '</ul>' : ''}<p class="letter">${letter}</p><ul class="gl">`; last = letter; }
      html += `<li><b>${esc(g.t)}</b><p>${esc(g.d)}</p><a href="#/lesson/${g.l.id}">${esc(g.l.title)} ›</a></li>`;
    }
    $('#gl').innerHTML = items.length || lessons.length ? html + '</ul>' : `<div class="empty"><p>Nothing matches “${esc(gQuery)}”.</p></div>`;
  };
  $('#q').oninput = e => { gQuery = e.target.value; draw(); };
  draw();
}

/* ───────── Progress & settings ───────── */
function renderYou() {
  setTab('you');
  const n = doneCount(), a = state.stats.answered, acc = a ? Math.round(state.stats.correct / a * 100) + '%' : '–';
  const seg = (name, opts, cur) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button data-${name}="${v}" aria-pressed="${String(v) === String(cur)}">${t}</button>`).join('')}</div>`;
  const m = {Mastered: 0, Familiar: 0, Learning: 0}; L.forEach(l => { const x = mastery(l.id); if (x) m[x]++; });
  const w = k => (k / L.length * 100).toFixed(2) + '%';
  const notes = L.filter(l => state.notes[l.id]);
  const testRows = U.map(u => `<a class="item" href="#/test/${u.n}"><span><b>Unit ${u.n}</b> · ${esc(u.title)}</span><span class="score-chip ${passed(u.n) ? 'ok' : ''}">${state.tests[u.n] != null ? state.tests[u.n] + '%' : '–'}</span></a>`).join('');
  view.innerHTML = `<div class="fade"><div class="head"><div><p class="eyebrow">Your study</p><h1>Progress</h1></div></div>
    <div class="stats">
      <div class="stat"><b>${n}<small>/${L.length}</small></b><span>lessons done</span></div>
      <div class="stat"><b>${streakNow()}</b><span>day streak</span></div>
      <div class="stat"><b>${fmtMin(totalMins())}</b><span>time studied</span></div>
      <div class="stat"><b>${acc}</b><span>quiz accuracy</span></div>
    </div>
    <h2 class="section-title">Mastery</h2>
    <div class="card"><div class="mbar"><i class="m-mastered" style="width:${w(m.Mastered)}"></i><i class="m-familiar" style="width:${w(m.Familiar)}"></i><i class="m-learning" style="width:${w(m.Learning)}"></i></div>
      <div class="legend"><span><i class="m-mastered"></i>Mastered ${m.Mastered}</span><span><i class="m-familiar"></i>Familiar ${m.Familiar}</span><span><i class="m-learning"></i>Learning ${m.Learning}</span><span><i></i>Not started ${L.length - n}</span></div>
      <p class="fine">Lessons move up as you answer their questions correctly in spaced reviews over several days.</p></div>
    <h2 class="section-title">Daily goal</h2>
    <div class="list"><div class="item"><div><b>Minutes per day</b><p>Lessons, reviews and flashcards all count.</p></div>${seg('goal', GOALS.map(g => [g, g]), state.goal)}</div></div>
    <h2 class="section-title">Tests & certificate</h2>
    <div class="list">${testRows}<a class="item" href="${certEarned() ? '#/certificate' : '#/final'}"><span><b>Final exam</b>${certEarned() ? ' · certificate earned' : ''}</span><span class="score-chip ${passed('final') ? 'ok' : ''}">${state.tests.final != null ? state.tests.final + '%' : '–'}</span></a></div>
    ${notes.length ? `<h2 class="section-title">My notes</h2><div class="list">${notes.map(l => `<a class="item" href="#/lesson/${l.id}"><div><b>${esc(l.title)}</b><p>${esc(state.notes[l.id].slice(0, 140))}${state.notes[l.id].length > 140 ? '…' : ''}</p></div></a>`).join('')}</div>` : ''}
    <h2 class="section-title">Display</h2>
    <div class="list">
      <div class="item"><b>Theme</b>${seg('theme', [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']], state.settings.theme)}</div>
      <div class="item"><b>Text size</b>${seg('size', [['s', 'A−'], ['m', 'A'], ['l', 'A+']], state.settings.size)}</div>
    </div>
    <h2 class="section-title">Backup</h2>
    <div class="list">
      <div class="item"><div><b>Export progress</b><p>Save a backup file before changing phones or clearing browser data.</p></div><button class="linkbtn" id="exp">Export</button></div>
      <div class="item"><div><b>Restore backup</b><p>Merges a backup with this device. Nothing is lost.</p></div><button class="linkbtn" id="imp">Restore</button></div>
      <div class="item"><div><b>Reset progress</b><p>Erase all progress on this device.</p></div><button class="linkbtn danger" id="reset">Reset</button></div>
    </div>
    <input type="file" id="file" accept=".json,application/json" hidden>
    <p class="foot" id="offline">Checking offline status…</p>
    <p class="foot" style="margin-top:4px">AI Study ${VERSION} · Progress is stored only on this device.</p></div>`;
  view.querySelectorAll('[data-theme]').forEach(b => b.onclick = () => { state.settings.theme = b.dataset.theme; save(); applySettings(); renderYou(); });
  view.querySelectorAll('[data-size]').forEach(b => b.onclick = () => { state.settings.size = b.dataset.size; save(); applySettings(); renderYou(); });
  view.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { state.goal = +b.dataset.goal; save(); renderYou(); });
  $('#exp').onclick = exportBackup;
  $('#imp').onclick = () => $('#file').click();
  $('#file').onchange = e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ''; };
  $('#reset').onclick = () => {
    if (!confirm('Erase all progress on this device? Export a backup first if you might want it back.')) return;
    const settings = state.settings; state = fresh(); state.settings = settings; save(); toast('Progress reset.'); renderYou();
  };
  offlineStatus().then(t => { const el = $('#offline'); if (el) el.textContent = t; });
}
function download(blob, name) {
  const url = URL.createObjectURL(blob), a = Object.assign(document.createElement('a'), {href: url, download: name});
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function exportBackup() {
  download(new Blob([JSON.stringify({app: 'ai-study', version: VERSION, exported: new Date().toISOString(), state}, null, 2)], {type: 'application/json'}), `ai-study-backup-${today()}.json`);
  toast('Backup file saved to your downloads.');
}
function importBackup(file) {
  const r = new FileReader();
  r.onload = () => {
    let inc;
    try {
      const j = JSON.parse(r.result);
      if (j && j.app === 'ai-study' && j.state) inc = sanitize(j.state);
      else if (j && j.state && Array.isArray(j.state.done)) inc = migrateV1(j.state);   // backup from the old app
      else if (j && Array.isArray(j.done)) inc = migrateV1(j);
      else throw Error();
    } catch (e) { toast('That file isn’t a valid AI Study backup.'); return; }
    for (const [k, v] of Object.entries(inc.done)) if (!state.done[k] || v < state.done[k]) state.done[k] = v;
    for (const [k, v] of Object.entries(inc.scores)) if (!state.scores[k] || v[0] > state.scores[k][0]) state.scores[k] = v;
    for (const [k, v] of Object.entries(inc.cards)) if (!state.cards[k] || v.box > state.cards[k].box) state.cards[k] = v;
    for (const [k, v] of Object.entries(inc.tests)) state.tests[k] = Math.max(state.tests[k] || 0, v);
    for (const [k, v] of Object.entries(inc.log)) state.log[k] = Math.max(state.log[k] || 0, v);
    for (const [k, v] of Object.entries(inc.notes)) if (!state.notes[k]) state.notes[k] = v; else if (!state.notes[k].includes(v)) state.notes[k] += '\n\n' + v;
    if (inc.certDate && (!state.certDate || inc.certDate < state.certDate)) state.certDate = inc.certDate;
    if (!state.settings.name && inc.settings.name) state.settings.name = inc.settings.name;
    if (inc.stats.answered > state.stats.answered) state.stats = inc.stats;
    if ((inc.streak.last || '') > (state.streak.last || '') || (inc.streak.last === state.streak.last && inc.streak.count > state.streak.count)) state.streak = inc.streak;
    if (state.current && state.done[state.current]) { const nx = nextLesson(); state.current = nx ? nx.id : null; }
    save(); toast(`Backup restored · ${doneCount()} lessons complete.`); renderYou();
  };
  r.readAsText(file);
}
async function offlineStatus() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return 'Offline mode isn’t supported in this browser.';
  try { return (await caches.has('ai-study-' + VERSION)) && navigator.serviceWorker.controller ? '✓ Saved for offline use' : 'Preparing offline copy… open the app once more while online.'; }
  catch (e) { return 'Offline status unavailable.'; }
}

/* ───────── Certificate ───────── */
let iconImg = null;
const loadIcon = () => iconImg || (iconImg = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'icon-192.png'; }));
async function drawCertificate(cv) {
  const img = await loadIcon(), W = 1600, H = 1130, c = cv.getContext('2d'), name = state.settings.name.trim() || 'AI Study learner';
  const font = (w, s) => `${w} ${s}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  const text = (t, y, w, s, col) => { c.font = font(w, s); c.fillStyle = col; c.fillText(t, W / 2, y); };
  cv.width = W; cv.height = H; c.textAlign = 'center';
  c.fillStyle = '#fbfcfb'; c.fillRect(0, 0, W, H);
  c.strokeStyle = '#0f766e'; c.lineWidth = 14; c.strokeRect(40, 40, W - 80, H - 80);
  c.strokeStyle = '#99d5cd'; c.lineWidth = 2; c.strokeRect(70, 70, W - 140, H - 140);
  if (img) c.drawImage(img, W / 2 - 44, 100, 88, 88);
  text('AI STUDY', 232, 700, 24, '#0f766e');
  text('Certificate of Completion', 320, 800, 72, '#10201d');
  text('This certifies that', 405, 400, 30, '#5d6b68');
  let size = 80; c.font = font(750, size); while (c.measureText(name).width > W - 360 && size > 36) { size -= 4; c.font = font(750, size); }
  c.fillStyle = '#10201d'; c.fillText(name, W / 2, 505);
  c.fillStyle = '#0f766e'; c.fillRect(W / 2 - 260, 540, 520, 3);
  text('has successfully completed the course', 615, 400, 30, '#5d6b68');
  text('AI Foundations', 700, 750, 56, '#10201d');
  text(`${L.length} lessons · ${U.length} units · Final exam score ${state.tests.final}%`, 765, 400, 28, '#5d6b68');
  text(new Date(state.certDate + 'T12:00').toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'}), 880, 600, 30, '#10201d');
  text('Date of completion', 915, 400, 22, '#5d6b68');
  text('Self-paced personal study record. Not an accredited qualification.', H - 110, 400, 20, '#8a9592');
}
function renderCertificate() {
  if (!certEarned()) return location.replace('#/final');
  setTab(null);
  view.innerHTML = topbar('Certificate') + `<div class="fade"><canvas id="cert" class="cert" width="1600" height="1130"></canvas>
    <label class="field"><span>Name on certificate</span><input id="cname" value="${esc(state.settings.name)}" maxlength="60" placeholder="Your full name" autocomplete="name"></label>
    <div class="stack"><button class="btn primary" id="dl">Download certificate (PNG)</button></div>
    <p class="foot">Earned on ${fmtDate(state.certDate, {day: 'numeric', month: 'long', year: 'numeric'})} with a final exam score of ${state.tests.final}%.</p></div>`;
  $('#back').onclick = () => goBack('#/learn');
  const cv = $('#cert'); drawCertificate(cv);
  let t; $('#cname').oninput = e => { clearTimeout(t); t = setTimeout(() => { state.settings.name = e.target.value.slice(0, 60); save(); drawCertificate(cv); }, 300); };
  $('#dl').onclick = () => drawCertificate(cv).then(() => cv.toBlob(b => download(b, 'AI-Foundations-certificate.png'), 'image/png'));
}

/* ───────── Router ───────── */
function route() {
  stopSpeech();
  const h = location.hash || '#/learn', [, a, b] = h.split('/');
  if (!['quiz', 'test', 'final'].includes(a) && !(a === 'review' && b)) session = null;
  if (a !== 'cards') deck = null;
  if (a === 'lesson') renderLesson(b);
  else if (a === 'quiz') routeQuiz(b);
  else if (a === 'unit') renderUnit(b);
  else if (a === 'test') routeTest('test', b);
  else if (a === 'final') routeTest('final');
  else if (a === 'certificate') renderCertificate();
  else if (a === 'review' && (b === 'due' || b === 'mix')) routeReviewSession(b);
  else if (a === 'review') renderReview();
  else if (a === 'cards') routeCards(b);
  else if (a === 'glossary') renderGlossary();
  else if (a === 'you') renderYou();
  else renderLearn();
  onScroll();
}
window.addEventListener('hashchange', () => { navigated = true; route(); scrollTo(0, 0); });
applySettings();
route();
if (notice) setTimeout(() => toast(notice), 400);

/* ───────── Offline (service worker) ───────── */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then(reg => { reg.update().catch(() => {}); }).catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) toast('AI Study was updated.', 'Reload', () => location.reload());
    else if (location.hash === '#/you') renderYou();
  });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}
})();
