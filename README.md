# Bekbal Unit Practice

Own-site 100발100중 + X-10 unit practice for Mr. Jay’s middle-school students.

Live (after Pages): https://mrjkorea.github.io/bekbal-unit-practice/

Live: https://mrjkorea.github.io/bekbal-unit-practice/ (GitHub Pages, `main` branch, site root). This branch is not live until it is merged to `main`.

## Site shell
Flow: `index.html` → `book.html?b=<slug>` → `unit.html?b=<slug>&u=u0N` → `play.html?b=&u=&e=<exercise-id>` (demo: `play.html?demo=1`).

Rules (`assets/app.js`): pass at 80% or above; retry up to 3 attempts; on pass or after attempt 3, show every wrong item with the correct answer and 해설, plus a reminder to write them into the printed book. The same book reminder is on the practice screen. Timer is about 50 seconds per multiple-choice item and about 105 seconds per written item (MC-heavy 45–60s, 영작/서술형 90–120s).

Content in this build: **중2 동아 윤정미 Lesson 07 and Lesson 08** only, digitized from the all-in-one OCR (본책, X-10 Part I, 100발/고득점, X-10 최종점검 1·2·3회, and the 2학기 모의고사 on L08). 중1 비상, 중1 능률, 중2 능률, and 동아 L01–L06 stay Coming soon. L07 본책 was checked against the question PDF and the answer key. The nine items that were held (Reading 심화 16·19, Plus 실전 5, 서술형 끝내기 5, 100발 7·12, 고득점 11·19·20) are now playable. 고득점 20 follows the answer-key box, ④, which also matches the passage: the So sentence comes right after the reason. L08 본책 was rebuilt from the question PDFs (scan pages 58–110) and the answer key (pages 169–203): 465 questions, no held items. X-10 Part I (scan pages 111–139) and the 최종점검 / 2학기 모의고사 (scan pages 140–168) were checked against the same answer key. The held X-10 cards are filled. Questions are not invented.

Data: `data/books.json`; `data/<book>/u0N/catalog.json` (A 본책 / B X-10 Part I / C 모의고사); `data/<book>/u0N/exercises/<id>.json` (`questions[]` with `type` TMC|TST, `question`, `answers`, `corAns` for TMC as a 1-based string, `explainKo`).
`data/_demo/` is a labeled DEMO, not book content.
