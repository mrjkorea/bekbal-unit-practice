# Bekbal Unit Practice

Own-site 100발100중 + X-10 unit practice for Mr. Jay’s middle-school students.

Live (after Pages): https://mrjkorea.github.io/bekbal-unit-practice/

Live: https://mrjkorea.github.io/bekbal-unit-practice/ (GitHub Pages, `main` branch, site root). This branch is not live until it is merged to `main`.

## Site shell
Flow: `index.html` → `book.html?b=<slug>` → `unit.html?b=<slug>&u=u0N` → `play.html?b=&u=&e=<exercise-id>` (demo: `play.html?demo=1`).

Rules (`assets/app.js`): pass at 80% or above; retry up to 3 attempts; on pass or after attempt 3, show every wrong item with the correct answer and 해설. A printed-book reminder appears only after a try that still has mistakes, on the screen before Retry. It is not shown when the practice starts and not shown again when answers are revealed. There is no text-to-speech. Questions are one action each: tap a choice, check every answer that applies, tap a word-bank word or an order, tap an English word to its Korean pair, or type either the one highlighted blank or the whole sentence, as the section banner says. A focused cloze card marks only the blank for this card; the other numbered blanks stay as context. Vocabulary 확인 is pair matching, and the 80% pass counts pairs. Timer is about 45 seconds for a tap item, about 18 seconds per matched pair, about 70 seconds for one written blank, and about 100 seconds for a full sentence.

Content in this build: **중2 동아 윤정미 Lesson 07 and Lesson 08**, digitized from the all-in-one OCR (본책, X-10 Part I, 100발/고득점, X-10 최종점검 1·2·3회, and the 2학기 모의고사 on L08); **중1 비상 황종배 Lesson 07 and Lesson 08**; **중1 능률 김기택 Lesson 06 Amazing Korea** and **Lesson 07 Save Earth, Save Us / Lesson 08 Dive into Stories** (book-txt + 답지 ans-169..201 from the 78all pack). 중1 비상 L01–L06, 중1 능률 L01–L05, 중2 능률, and 동아 L01–L06 stay Coming soon.

Data: `data/books.json`; `data/<book>/u0N/catalog.json` (A 본책 / B X-10 Part I / C 모의고사); `data/<book>/u0N/exercises/<id>.json` (`questions[]` with `type` TMC|TST, `question`, `answers`, `corAns` for TMC as a 1-based string, `explainKo`).
`data/_demo/` is a labeled DEMO, not book content.
