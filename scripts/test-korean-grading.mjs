#!/usr/bin/env node
/* Prove the Korean-answer grader on the real answers, before a push.
 *
 * Jay 2026-11-24: a 중1 student wrote "서각장애인 여자와 그녀의 선생님에 대한 영화야"
 * for a 우리말 question and the site said wrong, because the key's model sentence
 * was compared letter for letter. The grader now grades a Korean SENTENCE on the
 * words it carries. This test locks both directions in: a right answer in other
 * words passes, and a wrong answer still fails.
 *
 *   node scripts/test-korean-grading.mjs
 * Exit 1 means the grader is marking a right answer wrong, or a wrong one right.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.dirname(here);
const require = createRequire(import.meta.url);
const G = require(path.join(root, "assets", "grade.js"));

const real = {
  type: "sentence",
  answerMode: "words",
  accept: [
    "시각 장애인 소녀와 그녀의 선생님에 관한 영화였다.",
    "시각 장애인 소녀와 그녀의 선생님에 관한 영화",
    "시각 장애인 소녀와 그녀의 선생님에 관한 내용이다",
    "시각 장애인 소녀와 그녀의 선생님에 관한 내용이었다",
  ],
};

/* [answer the student typed, should it be right, why] */
const cases = [
  ["서각장애인 여자와 그녀의 선생님에 대한 영화야.", true, "the answer that was marked wrong"],
  ["시각 장애인 소녀와 그녀의 선생님에 관한 영화였다.", true, "the model sentence itself"],
  ["시각장애인 소녀와 그녀의 선생님에 관한 영화", true, "no spacing, no full stop"],
  ["시각 장애인 소녀가 선생님과 함께 나온 영화에 관한 내용이다", true, "other words, same content"],
  ["영화를 봤다.", false, "did not answer the question"],
  ["영화", false, "one word is not a sentence"],
  ["그는 영화를 좋아했다.", false, "wrong content"],
  ["시각 장애인 소녀와 그녀의 선생님에 관한 영화가 아니었다", false, "the opposite, sharing most words"],
];

let bad = 0;
for (const [answer, want, why] of cases) {
  const got = G.gradeItem(real, { value: answer });
  if (got !== want) {
    bad++;
    console.log(`FAIL ${JSON.stringify(answer)} -> ${got}, wanted ${want} (${why})`);
  }
}

/* every model answer we ship must pass its own item */
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (name.endsWith(".json") && name !== "catalog.json") out.push(p);
  }
  return out;
}
let items = 0;
let rejects = 0;
const all = [];
for (const f of walk(path.join(root, "data"))) {
  let doc;
  try {
    doc = JSON.parse(fs.readFileSync(f, "utf8"));
  } catch {
    continue;
  }
  for (const item of doc.items || doc.questions || []) {
    const acc = item.accept || [];
    if (!acc.length || !acc.some((a) => /[\uAC00-\uD7A3]/.test(a))) continue;
    items++;
    all.push({ f, item, acc });
    for (const a of acc) {
      if (!G.gradeItem(item, { value: a })) {
        rejects++;
        if (rejects <= 5) console.log(`FAIL ${path.relative(root, f)} #${item.id} rejects its own answer ${JSON.stringify(a)}`);
      }
    }
  }
}
/* a different item's answer must not pass */
let crossed = 0;
all.forEach((k, i) => {
  const other = all[(i + 37) % all.length];
  if (!other || other === k) return;
  const text = other.acc[0];
  if (k.acc.some((a) => a === text)) return; // the same model answer on two cards
  if (G.gradeItem(k.item, { value: text })) {
    crossed++;
    if (crossed <= 5) console.log(`FAIL ${path.relative(root, k.f)} #${k.item.id} accepts another item's answer ${JSON.stringify(text)}`);
  }
});
bad += rejects + crossed;
console.log(`Korean typed items: ${items}, rejects own answer: ${rejects}, accepts another item's answer: ${crossed}`);
if (bad) {
  console.log(`${bad} problem(s)`);
  process.exit(1);
}
console.log("Korean grading: all cases as intended");
