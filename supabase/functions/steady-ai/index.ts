// Steady AI course builder: a Supabase Edge Function that calls Claude on behalf of signed-in users.
// The Anthropic key lives only here (secret ANTHROPIC_API_KEY). Each action is one short Claude call so it fits
// the edge-function time limit; the app drives the sequence: outline → start → lesson × N → scenarios + check per unit → finish.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "claude-opus-5-5";
const PRICE = { input: 4 / 1e6, output: 20 / 1e6, cacheRead: 0.2 / 1e6, cacheWrite: 5 / 1e6 }; // USD per token (Opus 5.5)
const LENGTHS: Record<string, { units: number; lessons: number }> = { quick: { units: 2, lessons: 5 }, standard: { units: 5, lessons: 5 }, deep: { units: 8, lessons: 5 } };
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

const anthropic = new Anthropic();   // reads ANTHROPIC_API_KEY
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

class UserError extends Error {}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

// ── Prompts ───────────────────────────────────────────────────────────
const SYSTEM = `You write courses for Steady, a mobile learning app built on short daily lessons (about 4 minutes each), quizzes and spaced review.
Write for an intelligent adult learner. Be accurate above all: only state facts you are confident are correct and current; prefer well-established knowledge; when something varies by country, changes often, or is debated, say so plainly instead of guessing. Never invent statistics, studies, quotes, laws, dates or sources. Use concrete, realistic examples.
Style: clear, plain language; short paragraphs; no filler, no hype, no emojis inside lesson text.
Safety: for health, legal or financial topics, teach general principles and add that personal decisions need a qualified professional; never give dosing, diagnosis or personalised investment instructions.
Lesson format: an intro hook (one sentence); 3 body paragraphs (60-90 words each); 4-5 key points; one worked example; one common misconception written exactly as "Myth: … Reality: …"; one practical "try it" activity the learner can do in a few minutes; 2 short "go deeper" paragraphs; 3-5 key terms with one-sentence definitions; and exactly 3 multiple-choice questions, each with exactly 4 distinct options, one correct answer (index 0-3), and a one-to-two sentence explanation of why it is correct. Questions test understanding, not trivia; wrong options are plausible but clearly wrong to someone who learned the lesson; the correct answer must be fully supported by the lesson text.`;

const langNote = (lang: string) => lang === "ar"
  ? "Write everything in clear Modern Standard Arabic (العربية الفصحى). Keep widely used technical terms in English in parentheses where helpful."
  : "Write everything in English.";

// ── JSON schemas for structured output ────────────────────────────────
const str = { type: "string" }, strArr = { type: "array", items: str };
const obj = (props: Record<string, unknown>) => ({ type: "object", properties: props, required: Object.keys(props), additionalProperties: false });
const QUESTION = obj({ question: str, options: strArr, answer: { type: "integer" }, why: str });
const OUTLINE_SCHEMA = obj({
  title: str, subtitle: str, about: str, short: str, icon: str,
  units: { type: "array", items: obj({ title: str, blurb: str, objectives: strArr, lessons: { type: "array", items: obj({ title: str, intro: str }) } }) },
});
const LESSON_SCHEMA = obj({
  intro: str, body: strArr, points: strArr, example: str, myth: str, try: str, deeper: strArr,
  terms: { type: "array", items: obj({ term: str, definition: str }) }, quiz: { type: "array", items: QUESTION },
});
const SCENARIO_SCHEMA = obj({ scenarios: { type: "array", items: QUESTION } });
const CHECK_SCHEMA = obj({
  corrections: { type: "array", items: obj({ lesson: { type: "integer" }, old_text: str, new_text: str, reason: str }) },
  quiz_fixes: { type: "array", items: obj({ lesson: { type: "integer" }, question: { type: "integer" }, answer: { type: "integer" }, why: str }) },
});

// ── Claude call (streamed, structured, with refusal fallback and usage logging) ──
async function ask(user: string, schema: unknown, log: { uid: string; kind: string; course?: string }, effort = "high", maxTokens = 32000) {
  const stream = anthropic.beta.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort, format: { type: "json_schema", schema } },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: user }],
  } as any);
  const msg: any = await stream.finalMessage();
  const u = msg.usage || {};
  const cost = (u.input_tokens || 0) * PRICE.input + (u.output_tokens || 0) * PRICE.output + (u.cache_read_input_tokens || 0) * PRICE.cacheRead + (u.cache_creation_input_tokens || 0) * PRICE.cacheWrite;
  await admin.from("ai_usage").insert({ user_id: log.uid, course_id: log.course ?? null, kind: log.kind, model: msg.model || MODEL,
    input_tokens: u.input_tokens || 0, output_tokens: u.output_tokens || 0, cache_read_tokens: u.cache_read_input_tokens || 0, cost_usd: cost.toFixed(5) });
  if (msg.stop_reason === "refusal") throw new UserError("Claude declined to write this part. Try rephrasing the topic.");
  if (msg.stop_reason === "max_tokens") throw new UserError("That section came out too long. Please try again.");
  const text = msg.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
  try { return JSON.parse(text); } catch { throw new UserError("Claude returned something unexpected. Please try again."); }
}

// ── Validation helpers ────────────────────────────────────────────────
const clean = (s: unknown, max = 2000) => String(s ?? "").trim().slice(0, max);
const slug = (s: string, i: number) => (s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "lesson") + "-" + i;
function validQuestion(q: any) {
  const opts = Array.isArray(q.options) ? q.options.map((o: unknown) => clean(o, 300)).filter(Boolean) : [];
  if (opts.length !== 4 || new Set(opts).size !== 4 || !(q.answer >= 0 && q.answer <= 3)) return null;
  return [clean(q.question, 400), opts, q.answer, clean(q.why, 600)];
}
function toLesson(raw: any, meta: { id: string; unit: number; title: string }) {
  const quiz = (raw.quiz || []).map(validQuestion).filter(Boolean).slice(0, 3);
  if (quiz.length < 3) throw new UserError("A quiz didn't come out right. Please try that lesson again.");
  let myth = clean(raw.myth, 800); if (!/^Myth:/.test(myth)) myth = "Myth: " + myth;
  if (!/Reality:/.test(myth)) myth = myth.replace(/(\.|\?)\s+/, "$1 Reality: ");
  return { id: meta.id, unit: meta.unit, title: meta.title, intro: clean(raw.intro, 300), body: (raw.body || []).map((p: unknown) => clean(p)).filter(Boolean).slice(0, 4),
    points: (raw.points || []).map((p: unknown) => clean(p, 300)).filter(Boolean).slice(0, 6), example: clean(raw.example), myth, try: clean(raw.try, 600),
    deeper: (raw.deeper || []).map((p: unknown) => clean(p)).filter(Boolean).slice(0, 3),
    terms: (raw.terms || []).map((t: any) => [clean(t.term, 80), clean(t.definition, 300)]).filter((t: string[]) => t[0] && t[1]).slice(0, 6), quiz };
}

async function loadCourse(id: string, uid: string) {
  const { data: c } = await admin.from("courses").select("*").eq("id", id).single();
  if (!c || c.owner !== uid) throw new UserError("Course not found");
  return c;
}
const saveContent = (id: string, content: any, extra: Record<string, unknown> = {}) =>
  admin.from("courses").update({ content, lesson_count: content.lessons.filter((l: any) => l.body?.length).length, updated_at: new Date().toISOString(), ...extra }).eq("id", id);

// ── Actions ───────────────────────────────────────────────────────────
async function handle(action: string, p: any, uid: string) {
  const isAdmin = !!(await admin.from("app_admins").select("user_id").eq("user_id", uid).maybeSingle()).data;
  const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  const countSince = async (kind: string, since: Date) =>
    (await admin.from("ai_usage").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("kind", kind).gte("created_at", since.toISOString())).count || 0;
  const LIMIT = isAdmin ? 1000 : 3;

  if (action === "quota") return { used: await countSince("course", monthStart), limit: LIMIT, admin: isAdmin };

  if (action === "outline") {
    if (!isAdmin && await countSince("outline", new Date(Date.now() - 864e5)) >= 15) throw new UserError("Daily outline limit reached. Try again tomorrow.");
    const topic = clean(p.topic, 200), goal = clean(p.goal, 400), level = clean(p.level, 20) || "beginner", lang = p.lang === "ar" ? "ar" : "en";
    if (topic.length < 3) throw new UserError("Please describe the topic.");
    const size = LENGTHS[p.length] || LENGTHS.standard;
    const prior = p.previous ? `\nHere is the previous outline:\n${JSON.stringify(p.previous).slice(0, 12000)}\nRevise it following this feedback: ${clean(p.feedback, 600)}` : "";
    const o = await ask(`${langNote(lang)}
Design a course outline.
Topic: ${topic}
Learner's goal: ${goal || "a solid, practical understanding"}
Level: ${level}
Structure: exactly ${size.units} units, each with exactly ${size.lessons} lessons, ordered from foundations to application. The last lesson of the course should be a short capstone that ties everything together.
For each unit give a title, a one-line blurb and exactly 3 learning objectives starting with a verb. For each lesson give a title (max 6 words) and a one-sentence intro hook.
Also give the course a title, a one-line subtitle, a 2-3 sentence "about" paragraph, a one-word short tag (e.g. "Finance") and a single emoji icon.
If the topic is unsafe, illegal, or not a legitimate subject to teach, return a course titled "Not available" with no units.${prior}`, OUTLINE_SCHEMA, { uid, kind: "outline" }, "medium", 16000);
    if (!o.units?.length || o.title === "Not available") throw new UserError("That topic can't be turned into a course. Try a different one.");
    return { outline: o };
  }

  if (action === "start") {
    if (await countSince("course", monthStart) >= LIMIT) throw new UserError(`You’ve used your ${LIMIT} AI courses for this month.`);
    const o = p.outline, lang = p.lang === "ar" ? "ar" : "en";
    if (!o?.units?.length || o.units.length > 10) throw new UserError("The outline looks incomplete.");
    let n = 0;
    const units = o.units.map((u: any, i: number) => ({ n: i + 1, title: clean(u.title, 120), blurb: clean(u.blurb, 300),
      objectives: (u.objectives || []).map((x: unknown) => clean(x, 200)).slice(0, 3), scenarios: [] }));
    const lessons = o.units.flatMap((u: any, i: number) => (u.lessons || []).slice(0, 8).map((l: any) => {
      n++; return { id: slug(clean(l.title, 80), n), unit: i + 1, title: clean(l.title, 80), intro: clean(l.intro, 300) }; }));
    if (lessons.length < 3 || lessons.length > 60) throw new UserError("The outline needs between 3 and 60 lessons.");
    const content = { title: clean(o.title, 120), subtitle: clean(o.subtitle, 200), about: clean(o.about, 800), short: clean(o.short, 20) || clean(o.title, 12),
      icon: clean(o.icon, 8) || "📘", lang, dir: lang === "ar" ? "rtl" : "ltr", ai: true, level: clean(p.level, 20), units, lessons,
      disclaimer: lang === "ar" ? "محتوى مُنشأ بالذكاء الاصطناعي ولم يراجعه خبير. تحقّق من المعلومات المهمة من مصادر موثوقة." : "AI-generated content, not reviewed by an expert. Check important information against reliable sources." };
    const { data, error } = await admin.from("courses").insert({ owner: uid, title: content.title, subtitle: content.subtitle, lang, content, status: "generating", ai_generated: true }).select("id").single();
    if (error) throw error;
    await admin.from("ai_usage").insert({ user_id: uid, course_id: data.id, kind: "course", model: MODEL });
    return { id: data.id, content };
  }

  const c = await loadCourse(clean(p.courseId, 60), uid), content = c.content;
  const outlineText = content.units.map((u: any) => `Unit ${u.n}: ${u.title}\n` + content.lessons.filter((l: any) => l.unit === u.n).map((l: any) => `  - ${l.title}`).join("\n")).join("\n");
  const head = `${langNote(content.lang)}\nCourse: ${content.title} (${content.level || "beginner"} level)\nFull outline:\n${outlineText}\n`;

  if (action === "lesson") {
    const i = content.lessons.findIndex((l: any) => l.id === p.lessonId); if (i < 0) throw new UserError("Lesson not found");
    const l = content.lessons[i], u = content.units.find((x: any) => x.n === l.unit);
    const raw = await ask(`${head}
Write lesson ${i + 1} of ${content.lessons.length}: "${l.title}" (Unit ${u.n}: ${u.title}). Planned intro: ${l.intro}
Unit objectives: ${u.objectives.join("; ")}
Build on earlier lessons without repeating them, and don't teach material planned for later lessons.`, LESSON_SCHEMA, { uid, kind: "lesson", course: c.id }, "medium");
    content.lessons[i] = toLesson(raw, l);
    await saveContent(c.id, content);
    return { lesson: content.lessons[i] };
  }

  if (action === "unit") {   // scenario questions for the unit test, then an independent fact-check of the unit's lessons
    const u = content.units.find((x: any) => x.n === +p.unit); if (!u) throw new UserError("Unit not found");
    const ls = content.lessons.filter((l: any) => l.unit === u.n);
    if (ls.some((l: any) => !l.body?.length)) throw new UserError("Write all lessons in this unit first.");
    const lessonText = ls.map((l: any, k: number) => `### Lesson ${k}: ${l.title}\n${JSON.stringify({ intro: l.intro, body: l.body, points: l.points, example: l.example, myth: l.myth, deeper: l.deeper, terms: l.terms, quiz: l.quiz })}`).join("\n\n");
    if (p.step === "scenarios") {
    const sc = await ask(`${head}
Unit ${u.n}: ${u.title}. Here are its lessons:\n${lessonText}\n
Write exactly 5 realistic scenario questions for this unit's test: each presents a short real-world situation and asks the learner to apply what the unit taught. Each must be answerable from these lessons.`, SCENARIO_SCHEMA, { uid, kind: "scenarios", course: c.id });
    u.scenarios = (sc.scenarios || []).map(validQuestion).filter(Boolean).slice(0, 5);
    await saveContent(c.id, content);
    return { unit: u };
    }
    const chk = await ask(`${head}
You are a careful fact-checker and editor. Review Unit ${u.n} below for factual errors, outdated or overstated claims, internal contradictions, and quiz questions whose marked answer is wrong or not supported by the lesson text.\n${lessonText}\n
Return only real problems. For a text fix, give the lesson index, the exact original text to replace (copied verbatim, short as possible) and the corrected text. For a quiz whose marked answer is wrong, give the lesson index, question index (0-2), the correct answer index and a corrected explanation. If everything is correct, return empty lists.`, CHECK_SCHEMA, { uid, kind: "check", course: c.id }, "high", 16000);
    let fixed = 0;
    for (const f of chk.corrections || []) {
      const l = ls[f.lesson]; if (!l || !f.old_text) continue;
      const swap = (s: string) => s.includes(f.old_text) ? (fixed++, s.split(f.old_text).join(clean(f.new_text, 1200))) : s;
      for (const k of ["intro", "example", "myth", "try"]) l[k] = swap(l[k]);
      for (const k of ["body", "points", "deeper"]) l[k] = l[k].map(swap);
      l.terms = l.terms.map((t: string[]) => [t[0], swap(t[1])]);
      l.quiz = l.quiz.map((q: any[]) => [swap(q[0]), q[1].map(swap), q[2], swap(q[3])]);
    }
    for (const f of chk.quiz_fixes || []) { const q = ls[f.lesson]?.quiz?.[f.question]; if (q && f.answer >= 0 && f.answer <= 3) { q[2] = f.answer; q[3] = clean(f.why, 600); fixed++; } }
    u.checked = true;
    await saveContent(c.id, content);
    return { unit: u, fixed };
  }

  if (action === "finish") {
    if (content.lessons.some((l: any) => !l.body?.length) || content.units.some((u: any) => !u.checked)) throw new UserError("The course isn’t complete yet.");
    await saveContent(c.id, content, { status: "ready", version: (c.version || 1) + 1 });
    return { ok: true };
  }

  if (action === "save") {   // owner edits from the lesson editor
    const next = p.content; if (!next?.lessons || !next?.units) throw new UserError("Nothing to save");
    for (const l of next.lessons) if (l.quiz?.length && l.quiz.some((q: any) => !Array.isArray(q) || q[1]?.length !== 4)) throw new UserError("Each question needs 4 options.");
    await saveContent(c.id, { ...content, ...next, ai: content.ai }, { title: clean(next.title || content.title, 120), version: (c.version || 1) + 1 });
    return { ok: true };
  }
  throw new UserError("Unknown action");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return json({ error: "Please sign in to use the course builder." }, 401);
    const { action, ...params } = await req.json();
    return json(await handle(action, params, user.id));
  } catch (e) {
    if (e instanceof UserError) return json({ error: e.message }, 400);
    if (e instanceof Anthropic.RateLimitError) return json({ error: "The AI is busy right now. Please try again in a minute." }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "AI is temporarily unavailable (the API key needs attention)." }, 503);
    if (e instanceof Anthropic.APIError) return json({ error: `AI request failed (${e.status}). Please try again.` }, 502);
    console.error(e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
