/* AI Study 2.0 · offline-first study app. Progress lives in localStorage under KEY. */
(() => {
'use strict';
const VERSION = '2.0.0';
const KEY = 'ai-study-v2', OLD_KEY = 'ai-study-pwa-v1';
const L = window.LESSONS, U = window.UNITS;
const byId = Object.fromEntries(L.map((l, i) => [l.id, Object.assign(l, {index: i})]));
const INTERVALS = [0, 1, 3, 7, 16, 35];            // days until next review, by box
const REVIEW_MAX = 15;
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
const ICON = {
  back:'<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
  close:'<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  chev:'<svg class="chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  flame:'<svg viewBox="0 0 24 24"><path d="M12 22c4 0 7-3 7-7 0-3-2-5.5-3.5-7-.3 2-1.3 3-2.5 3.5C13.5 8 12 4.5 9 2c.5 3-1 5-2.5 6.8C5.6 10 5 12.3 5 15c0 4 3 7 7 7z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
};

/* ───────── State ───────── */
const fresh = () => ({v:2, done:{}, scores:{}, cards:{}, current:null, streak:{count:0,last:null}, stats:{answered:0,correct:0}, settings:{theme:'auto',size:'m'}});
function sanitize(x) {
  const s = fresh();
  if (!x || typeof x !== 'object') return s;
  if (x.done && typeof x.done === 'object') for (const [k, v] of Object.entries(x.done)) if (byId[k]) s.done[k] = isDate(v) ? v : today();
  if (x.scores && typeof x.scores === 'object') for (const [k, v] of Object.entries(x.scores)) if (byId[k] && Array.isArray(v)) s.scores[k] = [int(v[0], 3), int(v[1], 3)];
  if (x.cards && typeof x.cards === 'object') for (const [k, v] of Object.entries(x.cards)) {
    const [id, n] = k.split('#'); if (!byId[id] || !(+n >= 0 && +n < byId[id].quiz.length) || !v || !isDate(v.due)) continue;
    s.cards[k] = {box: int(v.box, 5), due: v.due};
  }
  if (byId[x.current]) s.current = x.current;
  if (x.streak) s.streak = {count: int(x.streak.count), last: isDate(x.streak.last) ? x.streak.last : null};
  if (x.stats) s.stats = {answered: int(x.stats.answered), correct: Math.min(int(x.stats.correct), int(x.stats.answered))};
  if (x.settings) s.settings = {theme: ['auto','light','dark'].includes(x.settings.theme) ? x.settings.theme : 'auto', size: ['s','m','l'].includes(x.settings.size) ? x.settings.size : 'm'};
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
const dueCards = () => { const t = today(); return Object.entries(state.cards).filter(([, c]) => c.due <= t).map(([k]) => k); };
const streakNow = () => { const t = today(), s = state.streak; return s.last === t || s.last === addDays(t, -1) ? s.count : 0; };
function bumpStreak() { const t = today(), s = state.streak; if (s.last === t) return; s.count = s.last === addDays(t, -1) ? s.count + 1 : 1; s.last = t; }
function grade(key, correct, inReview) {
  const c = state.cards[key];
  let box = correct ? (inReview ? Math.min((c ? c.box : 0) + 1, 5) : Math.max(c ? c.box : 0, 1)) : 0;
  state.cards[key] = {box, due: addDays(today(), INTERVALS[box])};
  state.stats.answered++; if (correct) state.stats.correct++;
  bumpStreak();
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
function updateBadge() { const n = dueCards().length, b = $('#dueBadge'); b.hidden = !n; b.textContent = n > 99 ? '99+' : n; }
function setTab(tab) {
  document.body.classList.toggle('full', !tab);
  document.querySelectorAll('.tabs a').forEach(a => a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  updateBadge();
}
const unitOf = l => U.find(u => u.n === l.unit);

/* ───────── Learn ───────── */
function renderLearn() {
  setTab('learn');
  const next = continueLesson(), n = doneCount(), pct = Math.round(n / L.length * 100), due = dueCards().length, st = streakNow();
  const openUnit = next ? next.unit : 0;
  let hero;
  if (next) {
    const started = n > 0 || state.current;
    hero = `<a class="hero" href="#/lesson/${next.id}">
      <p class="eyebrow">${started ? 'Continue' : 'Start here'} · Unit ${next.unit}</p>
      <h2>${esc(next.title)}</h2><p>${esc(next.intro)}</p>
      <div class="row"><span class="meta">${next.min} min · Lesson ${next.index + 1} of ${L.length}</span><span class="go">${started ? 'Continue' : 'Start'} ${ICON.arrow}</span></div></a>`;
  } else {
    hero = `<a class="hero" href="#/review"><p class="eyebrow">Course complete</p><h2>You finished all ${L.length} lessons</h2>
      <p>Keep it fresh with spaced review. A few questions a day locks it in.</p>
      <div class="row"><span class="meta">${due} due today</span><span class="go">Review ${ICON.arrow}</span></div></a>`;
  }
  const units = U.map(u => {
    const ls = L.filter(l => l.unit === u.n), d = ls.filter(l => state.done[l.id]).length;
    const rows = ls.map(l => `<li><a class="lrow ${state.done[l.id] ? 'done' : ''} ${next && l.id === next.id ? 'next' : ''}" href="#/lesson/${l.id}">
      <span class="dot"></span><span class="lt">${esc(l.title)}</span><span class="lm">${l.min} min</span></a></li>`).join('');
    return `<details class="unit ${d === ls.length ? 'complete' : ''}" ${u.n === openUnit ? 'open' : ''}>
      <summary><span class="unum">${d === ls.length ? '✓' : u.n}</span><span class="t"><b>${esc(u.title)}</b><small>${d} of ${ls.length} · ${esc(u.blurb)}</small></span>${ICON.chev}</summary>
      <ol class="lessons">${rows}</ol></details>`;
  }).join('');
  view.innerHTML = `<div class="fade">
    <div class="head"><div><p class="eyebrow">AI Foundations</p><h1>Learn</h1></div>
      <span class="pill ${st ? 'hot' : ''}" title="Day streak">${ICON.flame}${st} day${st === 1 ? '' : 's'}</span></div>
    ${hero}
    <div class="progress"><div class="bar"><i style="width:${pct}%"></i></div><span>${n}/${L.length} lessons</span></div>
    ${due && next ? `<a class="card" href="#/review" style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:14px 16px"><span><b>${due} question${due === 1 ? '' : 's'} to review</b><br><small style="color:var(--muted)">Quick spaced-repetition check</small></span><span style="color:var(--accent)">${ICON.arrow}</span></a>` : ''}
    <h2 class="section-title">Course · 8 units</h2>${units}
  </div>`;
}

/* ───────── Lesson ───────── */
function renderLesson(id) {
  const l = byId[id]; if (!l) return location.replace('#/learn');
  setTab(null);
  if (!state.done[id] && state.current !== id) { state.current = id; save(); }
  const prev = L[l.index - 1], next = L[l.index + 1], u = unitOf(l);
  const [myth, reality] = l.myth.replace(/^Myth:\s*/, '').split(/\s*Reality:\s*/);
  view.innerHTML = `<div class="topbar"><button class="iconbtn" id="back" aria-label="Back">${ICON.back}</button><span class="label">Lesson ${l.index + 1} of ${L.length}</span></div>
  <article class="lesson fade">
    <p class="eyebrow">Unit ${u.n} · ${esc(u.title)}</p>
    <h1>${esc(l.title)}</h1>
    <p class="lead">${esc(l.intro)}</p>
    <p class="meta">${l.min} min read · ${l.quiz.length} quiz questions${state.done[id] ? ' · Completed ✓' : ''}</p>
    ${l.body.map(p => `<p class="body">${esc(p)}</p>`).join('')}
    <div class="box key"><h3>Key points</h3><ul>${l.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>
    <div class="box ex"><h3>Example</h3><p>${esc(l.example)}</p></div>
    <div class="box myth"><h3>Common misconception</h3><p><b>Myth:</b> ${esc(myth)}</p>${reality ? `<p><b>Reality:</b> ${esc(reality[0].toUpperCase() + reality.slice(1))}</p>` : ''}</div>
    <details class="deeper"><summary><span>Go deeper <small>· +2 min</small></span>${ICON.chev}</summary><div class="in">${l.deeper.map(p => `<p class="body">${esc(p)}</p>`).join('')}</div></details>
    <h2 class="section-title" style="margin-left:0">Key terms</h2>
    <dl class="terms">${l.terms.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
    <div class="stack"><a class="btn primary" href="#/quiz/${l.id}">${state.done[id] ? 'Retake the quiz' : 'Take the quiz'} ${ICON.arrow}</a></div>
    <nav class="pager">${prev ? `<a href="#/lesson/${prev.id}">‹ Previous<b>${esc(prev.title)}</b></a>` : ''}${next ? `<a href="#/lesson/${next.id}">Next ›<b>${esc(next.title)}</b></a>` : ''}</nav>
  </article>`;
  $('#back').onclick = () => goBack('#/learn');
}

/* ───────── Quiz engine (lesson quizzes and reviews) ───────── */
let session = null;
function makeItem(key) {
  const [id, n] = key.split('#'), l = byId[id], [q, opts, ans, why] = l.quiz[+n];
  const order = shuffle(opts.map((_, i) => i));
  return {key, lesson: l, q, opts: order.map(i => opts[i]), ans: order.indexOf(ans), why};
}
function startSession(kind, keys, lessonId, route) {
  session = {kind, lessonId, route, items: keys.map(makeItem), i: 0, picked: null, right: 0};
}
function renderQuiz() {
  setTab(null);
  const s = session, it = s.items[s.i], total = s.items.length, answered = s.picked !== null;
  const pct = Math.round((s.i + (answered ? 1 : 0)) / total * 100);
  const keys = 'ABCD';
  const opts = it.opts.map((o, i) => {
    let cls = '';
    if (answered) cls = i === it.ans ? 'right' : i === s.picked ? 'wrong' : 'dim';
    return `<button class="opt ${cls}" data-i="${i}" ${answered ? 'disabled' : ''}><span class="k">${keys[i]}</span><span>${esc(o)}</span></button>`;
  }).join('');
  const ok = s.picked === it.ans;
  view.innerHTML = `<div class="topbar"><button class="iconbtn" id="back" aria-label="Close quiz">${ICON.close}</button><div class="bar"><i style="width:${pct}%"></i></div><span style="font-size:14px;color:var(--muted);font-weight:600;min-width:42px;text-align:right">${s.i + 1}/${total}</span></div>
  <div class="q fade">
    <p class="src">${s.kind === 'lesson' ? 'Quick check' : esc(it.lesson.title)}</p>
    <h2>${esc(it.q)}</h2>
    <div class="opts">${opts}</div>
    ${answered ? `<div class="why ${ok ? 'ok' : 'no'}"><b>${ok ? 'Correct' : 'Not quite'}</b>${esc(it.why)}</div>
      <div class="stack"><button class="btn primary" id="cont">${s.i + 1 < total ? 'Continue' : 'See results'}</button></div>` : ''}
  </div>`;
  $('#back').onclick = () => goBack(s.kind === 'lesson' ? `#/lesson/${s.lessonId}` : '#/review');
  view.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (s.picked !== null) return;
    s.picked = +b.dataset.i;
    const correct = s.picked === it.ans;
    if (correct) s.right++;
    grade(it.key, correct, s.kind !== 'lesson');
    save(); renderQuiz();
    const w = $('.why'); if (w) w.scrollIntoView({behavior: 'smooth', block: 'nearest'});
  });
  const c = $('#cont'); if (c) c.onclick = () => {
    if (s.i + 1 < total) { s.i++; s.picked = null; renderQuiz(); scrollTo(0, 0); }
    else finishSession();
  };
}
function finishSession() {
  const s = session; s.finished = true;
  if (s.kind === 'lesson') {
    const id = s.lessonId, best = state.scores[id];
    if (!state.done[id]) state.done[id] = today();
    if (!best || s.right > best[0]) state.scores[id] = [s.right, s.items.length];
    const nx = nextLesson(); state.current = nx ? nx.id : null;
  }
  save(); renderResult(); scrollTo(0, 0);
}
function renderResult() {
  setTab(null);
  const s = session, total = s.items.length, p = Math.round(s.right / total * 100);
  let title, msg, actions;
  if (s.kind === 'lesson') {
    const nx = nextLesson(), missed = total - s.right;
    title = s.right === total ? 'Perfect score' : 'Lesson complete';
    msg = missed ? `You missed ${missed}. ${missed === 1 ? 'It’s' : 'They’re'} added to Review so you’ll see ${missed === 1 ? 'it' : 'them'} again today.` : 'All three correct. These questions will come back for review in a day, then at longer gaps.';
    actions = (nx ? `<button class="btn primary" data-go="#/lesson/${nx.id}">Next: ${esc(nx.title)}</button>` : `<button class="btn primary" data-go="#/review">Go to Review</button>`) +
      `<button class="btn" data-go="#/learn">Back to course</button><button class="btn" id="retake">Retake quiz</button>`;
  } else {
    const due = dueCards().length;
    title = 'Review done';
    msg = s.right === total ? 'Everything recalled correctly. Each question’s next review is now further out.' : 'Questions you missed come back sooner, which is exactly how spaced repetition builds memory.';
    actions = (due ? `<button class="btn primary" data-go="#/review/due">Review ${Math.min(due, REVIEW_MAX)} more</button>` : '') + `<button class="btn ${due ? '' : 'primary'}" data-go="#/learn">Back to course</button>`;
  }
  view.innerHTML = `<div class="result fade"><div class="score" style="--p:${p}"><span>${s.right}/${total}</span></div>
    <h1>${title}</h1><p>${msg}</p><div class="stack">${actions}</div></div>`;
  view.querySelectorAll('[data-go]').forEach(b => b.onclick = () => location.replace(b.dataset.go));
  const r = $('#retake'); if (r) r.onclick = () => { startSession('lesson', s.items.map(x => x.key).sort(), s.lessonId, s.route); renderQuiz(); };
}
function routeQuiz(id) {
  const l = byId[id]; if (!l) return location.replace('#/learn');
  const route = '#/quiz/' + id;
  if (!session || session.route !== route) startSession('lesson', l.quiz.map((_, n) => `${id}#${n}`), id, route);
  session.finished ? renderResult() : renderQuiz();
}

/* ───────── Review ───────── */
function renderReview() {
  setTab('review');
  session = null;
  const due = dueCards(), cards = Object.values(state.cards), learned = Object.keys(state.done).length;
  const mastered = cards.filter(c => c.box >= 4).length, upcoming = cards.filter(c => c.due > today()).map(c => c.due).sort()[0];
  let main;
  if (!cards.length) {
    main = `<div class="card empty"><h2>Nothing to review yet</h2><p>Finish a lesson quiz and its questions will appear here on a spaced schedule: after 1 day, 3 days, a week, and so on.</p>
      <div class="stack"><a class="btn primary" href="#/learn">Go to lessons</a></div></div>`;
  } else if (due.length) {
    main = `<div class="card" style="text-align:center;padding:26px 18px"><div class="big">${due.length}</div><p class="sub">question${due.length === 1 ? '' : 's'} due today</p>
      <div class="stack"><a class="btn primary" href="#/review/due">Start review${due.length > REVIEW_MAX ? ` (${REVIEW_MAX})` : ''}</a></div></div>`;
  } else {
    main = `<div class="card empty"><h2>All caught up ✓</h2><p>Next review: ${upcoming ? new Date(upcoming + 'T12:00').toLocaleDateString(undefined, {weekday: 'long', day: 'numeric', month: 'short'}) : 'soon'}.</p></div>`;
  }
  view.innerHTML = `<div class="fade"><div class="head"><div><p class="eyebrow">Spaced repetition</p><h1>Review</h1></div></div>
    ${main}
    ${cards.length ? `<div class="stats" style="margin-top:12px"><div class="stat"><b>${cards.length - mastered}</b><span>learning</span></div><div class="stat"><b>${mastered}</b><span>mastered</span></div></div>` : ''}
    ${learned ? `<h2 class="section-title">Extra practice</h2><div class="stack" style="margin-top:0"><a class="btn" href="#/review/mix">10 random questions from finished lessons</a></div>` : ''}
    <p class="foot">Questions return just before you’re likely to forget them. Missed ones come back the same day.</p></div>`;
}
function routeReviewSession(mode) {
  const route = '#/review/' + mode;
  if (!session || session.route !== route) {
    let keys;
    if (mode === 'due') keys = shuffle(dueCards()).slice(0, REVIEW_MAX);
    else keys = shuffle(Object.keys(state.done).flatMap(id => byId[id].quiz.map((_, n) => `${id}#${n}`))).slice(0, 10);
    if (!keys.length) return location.replace('#/review');
    startSession(mode, keys, null, route);
  }
  session.finished ? renderResult() : renderQuiz();
}

/* ───────── Glossary ───────── */
let glossary = null, gQuery = '';
function buildGlossary() {
  const seen = new Map();
  for (const l of L) for (const [t, d] of l.terms) { const k = t.toLowerCase(); if (!seen.has(k)) seen.set(k, {t, d, l}); }
  return [...seen.values()].sort((a, b) => a.t.localeCompare(b.t, 'en', {sensitivity: 'base'}));
}
function renderGlossary() {
  setTab('glossary');
  glossary = glossary || buildGlossary();
  view.innerHTML = `<div class="fade"><div class="head"><div><p class="eyebrow">${glossary.length} terms</p><h1>Glossary</h1></div></div>
    <label class="search">${ICON.search}<input id="q" type="search" placeholder="Search terms and definitions" value="${esc(gQuery)}" autocomplete="off" enterkeyhint="search" aria-label="Search glossary"></label>
    <div id="gl"></div></div>`;
  const draw = () => {
    const q = gQuery.trim().toLowerCase();
    const items = q ? glossary.filter(g => (g.t + ' ' + g.d).toLowerCase().includes(q)) : glossary;
    let last = '', html = '';
    for (const g of items) {
      const letter = /[a-z]/i.test(g.t[0]) ? g.t[0].toUpperCase() : '#';
      if (!q && letter !== last) { html += `${last ? '</ul>' : ''}<p class="letter">${letter}</p><ul class="gl">`; last = letter; }
      else if (!html) html = '<ul class="gl">';
      html += `<li><b>${esc(g.t)}</b><p>${esc(g.d)}</p><a href="#/lesson/${g.l.id}">${esc(g.l.title)} ›</a></li>`;
    }
    $('#gl').innerHTML = items.length ? html + '</ul>' : `<div class="empty"><p>No terms match “${esc(gQuery)}”.</p></div>`;
  };
  $('#q').oninput = e => { gQuery = e.target.value; draw(); };
  draw();
}

/* ───────── Progress & settings ───────── */
function renderYou() {
  setTab('you');
  const n = doneCount(), a = state.stats.answered, acc = a ? Math.round(state.stats.correct / a * 100) + '%' : '–';
  const seg = (name, opts, cur) => `<div class="seg" role="group">${opts.map(([v, t]) => `<button data-${name}="${v}" aria-pressed="${v === cur}">${t}</button>`).join('')}</div>`;
  view.innerHTML = `<div class="fade"><div class="head"><div><p class="eyebrow">Your study</p><h1>Progress</h1></div></div>
    <div class="stats">
      <div class="stat"><b>${n}<small style="font-size:15px;color:var(--muted)">/${L.length}</small></b><span>lessons done</span></div>
      <div class="stat"><b>${streakNow()}</b><span>day streak</span></div>
      <div class="stat"><b>${a}</b><span>questions answered</span></div>
      <div class="stat"><b>${acc}</b><span>accuracy</span></div>
    </div>
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
  $('#exp').onclick = exportBackup;
  $('#imp').onclick = () => $('#file').click();
  $('#file').onchange = e => { const f = e.target.files[0]; if (f) importBackup(f); e.target.value = ''; };
  $('#reset').onclick = () => {
    if (!confirm('Erase all progress on this device? Export a backup first if you might want it back.')) return;
    const settings = state.settings; state = fresh(); state.settings = settings; save(); toast('Progress reset.'); renderYou();
  };
  offlineStatus().then(t => { const el = $('#offline'); if (el) el.textContent = t; });
}
function exportBackup() {
  const data = JSON.stringify({app: 'ai-study', version: VERSION, exported: new Date().toISOString(), state}, null, 2);
  const url = URL.createObjectURL(new Blob([data], {type: 'application/json'}));
  const a = Object.assign(document.createElement('a'), {href: url, download: `ai-study-backup-${today()}.json`});
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  toast('Backup file saved to your downloads.');
}
function importBackup(file) {
  const r = new FileReader();
  r.onload = () => {
    let incoming;
    try {
      const j = JSON.parse(r.result);
      if (j && j.app === 'ai-study' && j.state) incoming = sanitize(j.state);
      else if (j && j.state && Array.isArray(j.state.done)) incoming = migrateV1(j.state);   // backup from the old app
      else if (j && Array.isArray(j.done)) incoming = migrateV1(j);
      else throw Error();
    } catch (e) { toast('That file isn’t a valid AI Study backup.'); return; }
    for (const [k, v] of Object.entries(incoming.done)) if (!state.done[k] || v < state.done[k]) state.done[k] = v;
    for (const [k, v] of Object.entries(incoming.scores)) if (!state.scores[k] || v[0] > state.scores[k][0]) state.scores[k] = v;
    for (const [k, v] of Object.entries(incoming.cards)) if (!state.cards[k] || v.box > state.cards[k].box) state.cards[k] = v;
    if (incoming.stats.answered > state.stats.answered) state.stats = incoming.stats;
    if ((incoming.streak.last || '') > (state.streak.last || '') || (incoming.streak.last === state.streak.last && incoming.streak.count > state.streak.count)) state.streak = incoming.streak;
    if (state.current && state.done[state.current]) { const nx = nextLesson(); state.current = nx ? nx.id : null; }
    save(); toast(`Backup restored · ${doneCount()} lessons complete.`); renderYou();
  };
  r.readAsText(file);
}
async function offlineStatus() {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return 'Offline mode isn’t supported in this browser.';
  try {
    const has = await caches.has('ai-study-' + VERSION);
    return has && navigator.serviceWorker.controller ? '✓ Saved for offline use' : 'Preparing offline copy… open the app once more while online.';
  } catch (e) { return 'Offline status unavailable.'; }
}

/* ───────── Router ───────── */
function route() {
  const h = location.hash || '#/learn', [, a, b] = h.split('/');
  if (a !== 'quiz' && !(a === 'review' && b)) session = null;
  if (a === 'lesson') renderLesson(b);
  else if (a === 'quiz') routeQuiz(b);
  else if (a === 'review' && (b === 'due' || b === 'mix')) routeReviewSession(b);
  else if (a === 'review') renderReview();
  else if (a === 'glossary') renderGlossary();
  else if (a === 'you') renderYou();
  else renderLearn();
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
