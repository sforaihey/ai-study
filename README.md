# Steady

A short-but-consistent learning app for any subject. Offline-first, installable, no account needed. English and Arabic (right-to-left), switchable from the menu.

Live: https://sforaihey.github.io/ai-study/

## Courses
| Course | Lessons | Units | Time |
|---|---|---|---|
| 🤖 AI Foundations | 43 | 8 | ~6 h |
| 💰 Personal Finance & Investing | 29 | 7 | ~4.5 h |

Every course works the same way: short lessons (explanation, key points, example, misconception, a hands-on **Try it** exercise, go-deeper section, key terms), a 3-question quiz with explanations, unit recaps and flashcards, 10-question unit tests, a 30-question final exam (80% to pass) and a certificate. Review (spaced repetition, via the bell icon) and Search cover all courses. Lessons can be read aloud with the clearest voice installed on the phone.

**Try it exercises** are interactive and work offline. Five types: *sort* (tap each item into the right group), *order* (tap steps into sequence), *pick* (select all that apply), *steps* (guided writing with an example answer and self-check list) and *calc* (live calculator, built-in courses only). Built-in exercises live in `courses/<course-id>.practice.js`; AI-built courses get them from Claude and they are fact-checked with the rest of the unit. A lesson with nothing genuinely practical simply has no Try it box.

## Install on your phone
- **Android (Chrome):** open the link → menu ⋮ → **Install app**.
- **iPhone (Safari):** Share → **Add to Home Screen**.

Open it once online; after that it works fully offline. Progress stays on the device. Use **Progress → Export** to back it up.

## Adding a course
1. Create `courses/<course-id>.js` that calls `(window.COURSES = window.COURSES || []).push({...})`. Copy the structure of `courses/personal-finance.js`:
   - `id, title, subtitle, icon (emoji), about, disclaimer?`
   - `units: [{n, title, blurb, objectives: [3], scenarios: [[question, [4 options], correctIndex, why] ×5]}]`
   - `lessons: [{id, unit, title, intro, body[], points[], example, myth ("Myth: … Reality: …"), deeper[], terms[[term, definition]], quiz[[q, [4 options], correctIndex, why] ×3]}]`
   - Optional: `courses/<course-id>.practice.js` with one exercise per lesson id (see the existing files for each type).
2. Add `<script src="courses/<course-id>.js">` (and the practice file) to `index.html`, before `app.js`.
3. Add the file to `ASSETS` in `sw.js` and bump `VERSION` in **both** `sw.js` and `app.js`.

Lesson `id`s are permanent: progress is stored by id.

## Accounts, sync & friends (optional)
Steady works fully offline without an account. With the Supabase backend connected, people can create an account (email + password), sync progress between phones, add friends by code or invite link, see a weekly leaderboard, and send cheers.

Setup (once):
1. Create a Supabase project. In **Authentication → Providers → Email**, turn **off** “Confirm email”.
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it.
3. Put the project URL and the public **anon/publishable** key into `config.js`, and bump `VERSION` in `sw.js` and `app.js`. Never put the `service_role` key in the app.

Friends can see each other’s name, streak, weekly minutes and course progress only. Notes and answers stay private (row-level security). Users can delete their own account from the Account screen.

## Language
Menus, buttons and messages are translated in `i18n.js` (keys are the English strings in `app.js`). Course content keeps its own language and direction, so an English course reads left-to-right inside the Arabic app and vice versa. New AI courses are written in the app's current language.

## Credits
UI adapted from “Educational App | Mobile app Concept” by Nickelfox (Figma Community, CC BY 4.0). Illustrations, logo and card patterns are original. Arabic text uses IBM Plex Sans Arabic (SIL Open Font License, `fonts/IBMPlexSansArabic-OFL.txt`).

## Files
`index.html` shell · `app.js` app · `i18n.js` Arabic text · `app.css` design · `sw.js` offline cache · `courses/` content and exercises · `fonts/` Arabic font · `icon.svg` logo. No build step: GitHub Pages serves `main` directly.
