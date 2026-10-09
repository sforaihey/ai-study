# AI Study

An offline-first study app for **AI Foundations** (~4.5 hours): 43 lessons in 8 units, each with a hands-on "Try it" task, 129 lesson questions plus 40 scenario questions, unit tests, a final exam and a completion certificate. Also includes spaced-repetition review, flashcards for 170 key terms, a daily goal, listen-aloud, personal notes and mastery tracking.

Live: https://sforaihey.github.io/ai-study/

## Install on your phone
- **Android (Chrome):** open the link → menu ⋮ → **Install app** / **Add to Home screen**.
- **iPhone (Safari):** open the link → Share → **Add to Home Screen**.

Open it once while online. After that it works fully offline. Progress is saved on the device only; use **Progress → Export** to back it up.

## Files
| File | Purpose |
|---|---|
| `content.js` | All course content: units, objectives, lessons, quizzes, terms, Try-it tasks, scenario questions. Lesson `id`s are permanent; progress is keyed by them. |
| `app.js` | The app: routing, lessons, quiz engine, spaced review, glossary, backup. |
| `app.css` | Design (light/dark). |
| `sw.js` | Offline cache. **Bump `VERSION` in `sw.js` and `app.js` on every release** so phones pick up the update. |

No build step: GitHub Pages serves the files from `main` directly.
