#!/usr/bin/env node
/* Proof for every X-10 대화 영작 practice, unit by unit.
 *
 * Jay 2026-11-25: the whole-dialogue typing practice is rebuilt as one card per
 * line, with the opening words printed, the speaker label never typed,
 * contractions interchangeable, and no pass gate. This script is the proof he
 * asked for: for every unit it re-checks every card against the published grader.
 *
 *   node scripts/test-dialog-lines.mjs            # the data in this repo
 *   node scripts/test-dialog-lines.mjs --live     # the same files from the site
 * Exit 1 means a unit is not finished.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const here = path.dirname(new URL(import.meta.url).pathname);
const root = path.dirname(here);
const require = createRequire(import.meta.url);
const G = require(path.join(root, "assets", "grade.js"));

const FILES = [
  ["j1-visang", "u07"], ["j1-visang", "u08"],
  ["j1-neung", "u06"], ["j1-neung", "u07"], ["j1-neung", "u08"],
  ["j2-donga", "u07"],
  ["j2-neung", "u07"], ["j2-neung", "u08"],
];
const HANGUL = /[\uAC00-\uD7A3]/;
const LABEL = /^\s*[A-Za-z]{1,12}\s*[:)]\s*/;
const FLIP = [
  ["i'm", "i am"], ["can't", "cannot"], ["don't", "do not"], ["doesn't", "does not"],
  ["didn't", "did not"], ["it's", "it is"], ["that's", "that is"], ["let's", "let us"],
  ["i'll", "i will"], ["we're", "we are"], ["you're", "you are"],
];
const livesite = process.argv.includes("--live");
const BASE = "https://mrjkorea.github.io/bekbal-unit-practice/";

async function load(book, unit) {
  const rel = `data/${book}/${unit}/exercises/x10-dialog-write.json`;
  if (livesite) {
    const r = await fetch(BASE + rel, { cache: "no-store" });
    if (!r.ok) throw new Error(`${rel} -> ${r.status}`);
    return r.json();
  }
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

function studentVariants(line) {
  const bare = line.replace(LABEL, "").trim();
  const out = new Set([bare, bare.toLowerCase(), bare.replace(/[.!?]+$/, "")]);
  let flipped = bare.toLowerCase();
  for (const [a, b] of FLIP) flipped = flipped.split(a).join(b);
  out.add(flipped);
  return [...out].filter((v) => v.trim());
}

function wrongVariant(line) {
  const bare = line.replace(LABEL, "").replace(/[.!?]+$/, "").trim();
  const toks = bare.split(/\s+/);
  if (toks.length > 2) toks.splice(Math.floor(toks.length / 2), 1);
  else toks[toks.length - 1] = "banana";
  return toks.join(" ");
}

const rows = [];
let bad = 0;
for (const [book, unit] of FILES) {
  const doc = await load(book, unit);
  const items = doc.questions || doc.items || [];
  const problems = [];
  if (!doc.practiceMode) problems.push("no practiceMode");
  let multi = 0, korean = 0, noHint = 0, acceptFail = 0, bareFail = 0, flipFail = 0, wrongPass = 0;
  for (const q of items) {
    const first = String((q.accept || [""])[0] || "");
    if (first.split("\n").filter(Boolean).length > 1) multi++;
    /* the hint line itself is Korean ("시작:"), so only the cue above it counts */
    const cue = String(q.promptEn || "").split("\n시작:")[0];
    if (HANGUL.test(cue)) korean++;
    else noHint++;
    for (const a of q.accept || []) {
      if (!G.gradeItem(q, { value: a })) acceptFail++;
    }
    const bare = first.replace(LABEL, "").trim();
    if (!G.gradeItem(q, { value: bare })) bareFail++;
    const flips = studentVariants(first).filter((v) => v !== bare);
    if (!flips.every((v) => G.gradeItem(q, { value: v }))) flipFail++;
    if (G.gradeItem(q, { value: wrongVariant(first) })) wrongPass++;
  }
  const ok = items.length > 0 && !problems.length && !multi && !acceptFail && !bareFail &&
    !flipFail && !wrongPass;
  if (!ok) bad++;
  rows.push({
    unit: `${book}/${unit}`,
    cards: items.length,
    sections: (doc.sections || []).length,
    koreanCue: korean,
    englishCue: noHint,
    wholeDialogueCards: multi,
    ownAnswerFails: acceptFail,
    withoutLabelFails: bareFail,
    contractionFails: flipFail,
    wrongAnswerAccepted: wrongPass,
    practiceMode: !!doc.practiceMode,
    ok,
  });
}

const head = ["unit", "cards", "sections", "Korean cue", "English cue", "whole-dialogue",
  "own answer fails", "label-free fails", "contraction fails", "wrong answer accepted", "practice mode", "verdict"];
console.log(head.join(" | "));
for (const r of rows) {
  console.log([r.unit, r.cards, r.sections, r.koreanCue, r.englishCue, r.wholeDialogueCards,
    r.ownAnswerFails, r.withoutLabelFails, r.contractionFails, r.wrongAnswerAccepted,
    r.practiceMode ? "yes" : "NO", r.ok ? "PASS" : "FAIL"].join(" | "));
}
const total = rows.reduce((n, r) => n + r.cards, 0);
console.log(`\n${rows.length} units, ${total} cards, ${bad} unit(s) not finished`);
process.exit(bad ? 1 : 0);
