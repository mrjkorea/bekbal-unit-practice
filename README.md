# Bekbal Unit Practice

Own-site 100발100중 + X-10 unit practice for Mr. Jay’s middle-school students.

Live (after Pages): https://mrjkorea.github.io/bekbal-unit-practice/

Live: https://mrjkorea.github.io/bekbal-unit-practice/ (GitHub Pages, `main` branch, site root). This branch is not live until it is merged to `main`.

## Site shell
Flow: `index.html` → `book.html?b=<slug>` → `unit.html?b=<slug>&u=u0N` → `play.html?b=&u=&e=<exercise-id>` (demo: `play.html?demo=1`).

Rules (`assets/app.js`): pass at 80% or above; retry up to 3 attempts; on pass or after attempt 3, show every wrong item with the correct answer and 해설, plus a reminder to write them into the printed book. The same book reminder is on the practice screen. Timer is about 50 seconds per multiple-choice item and about 105 seconds per written item (MC-heavy 45–60s, 영작/서술형 90–120s).

Content in this build: **중2 동아 윤정미 Lesson 07 and Lesson 08** only, digitized from the all-in-one OCR. 중1 비상, 중1 능률, 중2 능률, and 동아 L01–L06 stay Coming soon. Items whose OCR could not be read are listed on the unit page as 확인 필요 and are not playable. Questions are not invented.

Data: `data/books.json`; `data/<book>/u0N/catalog.json` (A 본책 / B X-10 Part I / C 모의고사); `data/<book>/u0N/exercises/<id>.json` (`questions[]` with `type` TMC|TST, `question`, `answers`, `corAns` for TMC as a 1-based string, `explainKo`).
`data/_demo/` is a labeled DEMO, not book content.
