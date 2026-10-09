# Steady

A short-but-consistent learning app for any subject. Offline-first, installable, no account needed.

Live: https://sforaihey.github.io/ai-study/

## Courses
| Course | Lessons | Units | Time |
|---|---|---|---|
| 🤖 AI Foundations | 43 | 8 | ~4.5 h |
| 💰 Personal Finance & Investing | 29 | 7 | ~3.4 h |

Every course works the same way: ~4-minute lessons (explanation, key points, example, misconception, "Try it" task, go-deeper section, key terms), a 3-question quiz with explanations, unit recaps and flashcards, 10-question unit tests, a 30-question final exam (80% to pass) and a certificate. Review (spaced repetition, via the bell icon) and Search cover all courses.

## Install on your phone
- **Android (Chrome):** open the link → menu ⋮ → **Install app**.
- **iPhone (Safari):** Share → **Add to Home Screen**.

Open it once online; after that it works fully offline. Progress stays on the device. Use **Progress → Export** to back it up.

## Adding a course
1. Create `courses/<course-id>.js` that calls `(window.COURSES = window.COURSES || []).push({...})`. Copy the structure of `courses/personal-finance.js`:
   - `id, title, subtitle, icon (emoji), about, disclaimer?`
   - `units: [{n, title, blurb, objectives: [3], scenarios: [[question, [4 options], correctIndex, why] ×5]}]`
   - `lessons: [{id, unit, title, intro, body[], points[], example, myth ("Myth: … Reality: …"), try, deeper[], terms[[term, definition]], quiz[[q, [4 options], correctIndex, why] ×3]}]`
2. Add a `<script src="courses/<course-id>.js">` line to `index.html`, before `app.js`.
3. Add the file to `ASSETS` in `sw.js` and bump `VERSION` in **both** `sw.js` and `app.js`.

Lesson `id`s are permanent: progress is stored by id.

## Accounts, sync & friends (optional)
Steady works fully offline without an account. With the Supabase backend connected, people can create an account (email + password), sync progress between phones, add friends by code or invite link, see a weekly leaderboard, and send cheers.

Setup (once):
1. Create a Supabase project. In **Authentication → Providers → Email**, turn **off** “Confirm email”.
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it.
3. Put the project URL and the public **anon/publishable** key into `config.js`, and bump `VERSION` in `sw.js` and `app.js`. Never put the `service_role` key in the app.

Friends can see each other’s name, streak, weekly minutes and course progress only. Notes and answers stay private (row-level security). Users can delete their own account from the Account screen.

## Design credit
UI adapted from “Educational App | Mobile app Concept” by Nickelfox (Figma Community, CC BY 4.0). Illustrations and card patterns are original.

## Files
`index.html` shell · `app.js` app · `app.css` design · `sw.js` offline cache · `courses/` content. No build step: GitHub Pages serves `main` directly.
