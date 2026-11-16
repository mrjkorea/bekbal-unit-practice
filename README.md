# Bekbal Unit Practice

Own-site 100발100중 + X-10 unit practice for Mr. Jay’s middle-school students.

Live (after Pages): https://mrjkorea.github.io/bekbal-unit-practice/

Live: https://mrjkorea.github.io/bekbal-unit-practice/ (GitHub Pages, `main` branch, site root). This branch is not live until it is merged to `main`.

## Site shell
Flow: `index.html` → `book.html?b=<slug>` → `unit.html?b=<slug>&u=u0N` → `play.html?b=&u=&e=<exercise-id>` (demo: `play.html?demo=1`).

Rules (`assets/app.js`): pass at 80% or above; retry up to 3 attempts; on pass or after attempt 3, show every wrong item with the correct answer and 해설. A printed-book reminder appears only after a try that still has mistakes, on the screen before Retry. It is not shown when the practice starts and not shown again when answers are revealed. There is no text-to-speech. Questions are one action each: tap a choice, check every answer that applies, tap a word-bank word or an order, tap an English word to its Korean pair, or type either the one highlighted blank or the whole sentence, as the section banner says. A focused cloze card marks only the blank for this card; the other numbered blanks stay as context. Vocabulary 확인 is pair matching, and the 80% pass counts pairs. Timer is about 45 seconds for a tap item, about 18 seconds per matched pair, about 70 seconds for one written blank, and about 100 seconds for a full sentence.

Content in this build: **중2 동아 윤정미 Lesson 07 and Lesson 08**, digitized from the all-in-one OCR (본책, X-10 Part I, 100발/고득점, X-10 최종점검 1·2·3회, and the 2학기 모의고사 on L08); **중1 비상 황종배 Lesson 07 and Lesson 08**; **중1 능률 김기택 Lesson 06 Amazing Korea** and **Lesson 07 Save Earth, Save Us / Lesson 08 Dive into Stories** (book-txt + 답지 ans-169..201 from the 78all pack). 중1 비상 L01–L06, 중1 능률 L01–L05, 중2 능률, and 동아 L01–L06 stay Coming soon.

Data: `data/books.json`; `data/<book>/u0N/catalog.json`; `data/<book>/u0N/exercises/<id>.json` (`questions[]` with `type` TMC|TST, `question`, `answers`, `corAns` for TMC as a 1-based string, `explainKo`).

Catalog sections carry `group`: `"book"` (default) or `"x10"`, and the unit page draws them as two separate blocks — ④ 교재 문제 for 본책, ⑤ X-10 워크북 for the X-10 book. `assets/app.js` puts every section marked `"group":"x10"` (or titled X-10) in ⑤, so an X-10 item can never appear in the book list. The 최종점검 mocks (`final-1..3`, `semester`) are printed in the X-10 booklet, so they live in ⑤ as `D. X-10 최종점검 모의고사`, never under 본책. A practice opened from ⑤ carries `&g=x10` and shows the "X-10 워크북" chip; book practices show no X-10 label. No page header says X-10 unless the page is that workbook.
`data/_demo/` is a labeled DEMO, not book content.

## Never publish half a practice (Jay 2026-11-16)

A practice is the book page or it is nothing. The audit on 2026-11-16 found 405 book questions
missing across 46 practices because a two-column page scrambled the choices and the item was
dropped instead of read from the picture, and nothing compared the finished practice with the book.

Rules, for every new unit and every rebuild:

1. Read the printed page picture. The OCR text is a search aid; the 답지 picture is the only key.
2. No held items, ever. If one item cannot be keyed with certainty, the practice is not published
   and its card says 다시 만드는 중.
3. `python3 scripts/audit-practice-completeness.py --fail-on partial` must pass before a push. It
   fails on any file with an `omitted` entry or with zero questions.
4. The card states what it holds: `7문항 · 빠진 문항 8개 일부만`, never a quiet grey 보류.
5. A practice with no questions cannot be opened, from the list or from an old bookmark.
