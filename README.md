# Bekbal Unit Practice

Own-site 100발100중 + X-10 unit practice for Mr. Jay’s middle-school students.

Live (after Pages): https://mrjkorea.github.io/bekbal-unit-practice/

Build in progress.

## Site shell
Live: https://mrjkorea.github.io/bekbal-unit-practice/ (served from `main` root; relative paths only)

Flow: `index.html` → `book.html?b=<slug>` → `unit.html?b=<slug>&u=u0N` → `play.html?b=&u=&e=<exercise-id>` (demo: `play.html?demo=1`).

Rules (assets/app.js): pass ≥ 80%; retry up to 3 attempts; on pass or after attempt 3, show all wrong items + correct answer + 해설, with a reminder to write them into the printed book.

Data: `data/books.json`; `data/<book>/u0N/catalog.json` (sections A 본책 / B X-10 / C 테스트, each `exercises: [{id,title}]`); `data/<book>/u0N/exercises/<id>.json` (shape: `questions[]` with `type` TMC|TST, `question`, `answers`, `corAns` (TMC, 1-based), `explainKo`; optional `timeLimitSec`).
Only `data/_demo/` contains a DEMO exercise — not book content.
