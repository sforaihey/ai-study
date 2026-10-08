# AI Study

An offline-first study app for **AI Foundations**: 43 lessons in 8 units, 129 quiz questions with explanations, spaced-repetition review and a 170-term glossary.

Live: https://sforaihey.github.io/ai-study/

## Install on your phone
- **Android (Chrome):** open the link → menu ⋮ → **Install app** / **Add to Home screen**.
- **iPhone (Safari):** open the link → Share → **Add to Home Screen**.

Open it once while online. After that it works fully offline. Progress is saved on the device only; use **Progress → Export** to back it up.

## Files
| File | Purpose |
|---|---|
| `content.js` | All course content (units, lessons, quizzes, terms). Lesson `id`s are permanent; progress is keyed by them. |
| `app.js` | The app: routing, lessons, quiz engine, spaced review, glossary, backup. |
| `app.css` | Design (light/dark). |
| `sw.js` | Offline cache. **Bump `VERSION` in `sw.js` and `app.js` on every release** so phones pick up the update. |

No build step: GitHub Pages serves the files from `main` directly.
