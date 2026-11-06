#!/usr/bin/env node
/**
 * Build 중1 능률 김기택 Lesson 07–08 exercise JSON from book-txt + 답지 images.
 * Accept strings match the scanned answer key. Unverified stems go on omitted[].
 */
const fs = require("fs");
const path = require("path");
const grade = require("../assets/grade.js");
const payload = require("./j1-neung-u78-payload.js");

const ROOT = path.join(__dirname, "..");
const BOOK = "중1 능률 김기택";
const UNIT_LABEL = {
  u07: "Lesson 07 Save Earth, Save Us",
  u08: "Lesson 08 Dive into Stories",
};

function normTok(s) {
  return String(s || "").toLowerCase().replace(/^[“"']+|[”"'.,!?]+$/g, "").replace(/[^a-z0-9']/g, "");
}
function findToken(text, from, token) {
  const esc = String(token).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp("(?<![A-Za-z'])" + esc + "(?![A-Za-z'])", "i");
  const m = re.exec(text.slice(from));
  if (!m) return null;
  return { index: from + m.index, length: m[0].length };
}
function markBlanks(text, words) {
  let from = 0;
  let out = "";
  const hits = [];
  words.forEach((word, i) => {
    const hit = findToken(text, from, word);
    if (!hit) {
      const err = new Error("blank not found: " + JSON.stringify(word) + " in " + text.slice(from, from + 80));
      err.word = word;
      throw err;
    }
    out += text.slice(from, hit.index) + "(" + (i + 1) + ")_____";
    from = hit.index + hit.length;
    hits.push(word);
  });
  return out + text.slice(from);
}

function Exercise(meta) {
  this.meta = meta;
  this.questions = [];
  this.sections = [];
  this.omitted = [];
  this._sec = null;
}
Exercise.prototype.section = function (title, directionKo, ruleKo, answerMode, answerModeTag) {
  const id = "s" + (this.sections.length + 1);
  this._sec = {
    id, title, directionKo, ruleKo, answerMode, answerModeTag,
    instructionKo: directionKo + " " + ruleKo,
    itemCount: 0,
  };
  this.sections.push(this._sec);
  return this;
};
Exercise.prototype.omit = function (sourceId, reason) {
  this.omitted.push({ sourceId: String(sourceId), reason });
};
Exercise.prototype.add = function (partial) {
  const sec = this._sec;
  sec.itemCount += 1;
  const n = this.questions.length + 1;
  const type = partial.type;
  const seconds = partial.seconds || (type === "match" ? 0 : type === "mc" ? 60 : type === "order" ? 75 : type === "sentence" ? 110 : type === "ox" ? (partial.rewriteAccept ? 90 : 45) : 90);
  const item = Object.assign({
    id: String(partial.id || n),
    label: String(partial.label || partial.sourceId || n),
    sourceId: partial.sourceId || n,
    section: sec.id,
    sectionTitle: sec.title,
    directionKo: partial.directionKo || sec.directionKo,
    ruleKo: partial.ruleKo || sec.ruleKo,
    sectionInstructionKo: sec.instructionKo,
    answerMode: partial.answerMode || sec.answerMode,
    answerModeTag: partial.answerModeTag || sec.answerModeTag,
    seconds,
    explainKo: partial.explainKo || "",
  }, partial);
  delete item.seconds;
  if (seconds) item.seconds = seconds;
  this.questions.push(item);
  return item;
};
Exercise.prototype.matchPairs = function (pairs) {
  const hangul = (s) => (String(s).match(/[가-힣]/g) || []).length;
  for (let i = 0; i < pairs.length; i += 5) {
    const slice = pairs.slice(i, i + 5);
    const built = slice.map((p, j) => {
      const promptIsKo = hangul(p.prompt) > hangul(p.answer);
      const n = i + j + 1;
      return {
        id: String(n),
        en: promptIsKo ? p.answer : p.prompt,
        ko: promptIsKo ? p.prompt : p.answer,
        sourceId: n,
        explainKo: p.explainKo || ("정답: " + p.answer),
      };
    });
    this.add({
      type: "match",
      answerMode: "match",
      id: this._sec.id + "-b" + (Math.floor(i / 5) + 1),
      label: (i + 1) + "–" + (i + slice.length),
      sourceId: i + 1,
      pairs: built,
      promptEn: "영어와 우리말을 짝지으세요.",
      promptKo: "영어를 먼저 누르고, 같은 뜻의 우리말을 누르세요. 다시 누르면 풀립니다.",
      directionKo: "영어와 같은 뜻의 우리말을 짝지으세요.",
      ruleKo: "왼쪽 영어를 누르고, 같은 뜻의 오른쪽 우리말을 누르세요. 직접 쓰지 않아요.",
      answerModeTag: "Match · 짝짓기",
      explainKo: built.map((p) => p.en + " — " + p.ko).join("\n"),
    });
  }
  this._sec.itemCount = pairs.length;
};
Exercise.prototype.splitMarked = function (sourceId, title, marked, words, cite) {
  words.forEach((word, i) => {
    const phrase = String(word).trim().split(/\s+/).length > 1;
    this.add({
      type: "fill",
      answerMode: "words",
      sourceId,
      group: String(sourceId).padStart(2, "0"),
      id: sourceId + "-" + (i + 1),
      label: String(sourceId),
      focusBlank: String(i + 1),
      phraseBlank: phrase,
      promptEn: title + "\n\n이 대화의 빈칸에 들어갈 말을 쓰시오.\n\n" + marked,
      promptKo: "이 문항은 (" + (i + 1) + ")번 빈칸만 씁니다.",
      accept: [String(word).trim()],
      explainKo: "정답: " + word + (cite ? " (" + cite + ")" : ""),
    });
  });
};
Exercise.prototype.bankBlank = function (sourceId, group, promptEn, choices, focusBlank, correctIndex, explainKo, extra) {
  const ch = choices.slice();
  this.add(Object.assign({
    type: "bank",
    select: "one",
    sourceId,
    group,
    promptEn,
    choices: ch,
    correctIndexes: [correctIndex],
    focusBlank: String(focusBlank),
    answerMode: "bank",
    answerModeTag: "Choose · 보기에서 고르기",
    promptKo: "이 문항은 (" + focusBlank + ") 빈칸만 고릅니다.",
    explainKo: explainKo || "",
  }, extra || {}));
};
Exercise.prototype.splitWords = function (sourceId, title, text, words, cite) {
  let marked;
  try {
    marked = markBlanks(text, words);
  } catch (err) {
    this.omit(sourceId, "빈칸 위치를 답지 단어와 맞추지 못함: " + err.word);
    return;
  }
  words.forEach((word, i) => {
    const phrase = String(word).trim().split(/\s+/).length > 1;
    this.add({
      type: "fill",
      answerMode: "words",
      sourceId,
      group: String(sourceId).padStart(2, "0"),
      id: sourceId + "-" + (i + 1),
      label: String(sourceId),
      focusBlank: String(i + 1),
      phraseBlank: phrase,
      promptEn: title + "\n\n" + marked,
      promptKo: "이 문항은 (" + (i + 1) + ")번 빈칸만 씁니다.",
      accept: [String(word).trim()],
      explainKo: "정답: " + word + (cite ? " (" + cite + ")" : ""),
    });
  });
};
function sameTok(a, b) {
  return normTok(a) === normTok(b) || normTok(a).replace(/'/g, "") === normTok(b).replace(/'/g, "");
}
function chunkTokens(text) {
  return String(text).match(/[A-Za-z0-9'’]+/g) || [];
}
Exercise.prototype.orderBank = function (sourceId, promptEn, bank, sentence, explainKo) {
  const chunks = bank.map((text, i) => ({ id: "c" + (i + 1), text: String(text), used: false, tokens: chunkTokens(text) }));
  const words = String(sentence).match(/[A-Za-z0-9'’]+|[.,!?]/g) || [];
  const ids = [];
  let i = 0;
  while (i < words.length) {
    if (/^[.,!?]$/.test(words[i])) { i += 1; continue; }
    let best = null;
    let bestEnd = i;
    for (const chunk of chunks) {
      if (chunk.used || !chunk.tokens.length) continue;
      let wi = i;
      let ok = true;
      for (const token of chunk.tokens) {
        while (wi < words.length && /^[.,!?]$/.test(words[wi])) wi += 1;
        if (wi >= words.length || !sameTok(words[wi], token)) { ok = false; break; }
        wi += 1;
      }
      if (ok && (!best || chunk.tokens.length > best.tokens.length)) {
        best = chunk;
        bestEnd = wi;
      }
    }
    if (!best) {
      this.omit(sourceId, "순서 배열 토큰 불일치: " + words[i]);
      return;
    }
    best.used = true;
    ids.push(best.id);
    i = bestEnd;
  }
  const unused = chunks.filter((c) => !c.used);
  if (unused.length) {
    this.omit(sourceId, "보기에 남는 말: " + unused.map((c) => c.text).join(", "));
    return;
  }
  this.add({
    type: "order",
    answerMode: "order",
    sourceId,
    promptEn,
    orderChunks: chunks.map(({ id, text }) => ({ id, text })),
    orderIds: ids,
    explainKo: explainKo || ("정답: " + sentence),
  });
};
Exercise.prototype.sentenceOrder = function (sourceId, promptEn, sentences, explainKo) {
  const chunks = sentences.map((text, i) => ({ id: "s" + (i + 1), text }));
  const display = chunks.slice().reverse();
  this.add({
    type: "order",
    answerMode: "order",
    sourceId,
    promptEn,
    orderChunks: display,
    orderIds: chunks.map((c) => c.id),
    explainKo,
  });
};
Exercise.prototype.toJSON = function () {
  const intro = this.sections.map((s) => s.directionKo + " " + s.itemCount + "문항").join(" ");
  return {
    id: this.meta.id,
    title: this.meta.title,
    book: BOOK,
    unit: this.meta.unit,
    sourcePages: this.meta.sourcePages,
    questionCount: this.questions.reduce((n, q) => n + (q.type === "match" ? (q.pairs || []).length : 1), 0),
    omitted: this.omitted,
    questions: this.questions,
    sectionsVersion: 2,
    introKo: "통과 80%. " + intro + " 고르기는 누르기만 하면 됩니다. 빈칸은 그 칸의 말만 쓰세요.",
    sections: this.sections.map((s) => {
      const copy = Object.assign({}, s);
      delete copy.itemCount;
      copy.itemCount = s.itemCount;
      return copy;
    }),
  };
};

function koEn(direction) {
  return {
    directionKo: direction,
    ruleKo: "왼쪽 영어를 누르고, 같은 뜻의 오른쪽 우리말을 누르세요. 직접 쓰지 않아요.",
    answerMode: "match",
    answerModeTag: "Match · 짝짓기",
  };
}
const FILL = {
  directionKo: "빈칸에 들어갈 말만 쓰시오.",
  ruleKo: "이 칸에 들어갈 말만 쓰세요. 문장 전체는 쓰지 않아요.",
  answerMode: "words",
  answerModeTag: "Type · 빈칸 말만",
};
const SENT = {
  directionKo: "문장 전체를 쓰시오.",
  ruleKo: "영어 문장 전체를 쓰세요. 끝 마침표는 있어도 되고 없어도 됩니다.",
  answerMode: "sentence",
  answerModeTag: "Type · 문장 전체",
};
const CHOOSE = {
  directionKo: "알맞은 것을 고르시오.",
  ruleKo: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
  answerMode: "choice",
  answerModeTag: "Choose · 고르기",
};
const MULTI = {
  directionKo: "알맞은 것을 모두 고르시오.",
  ruleKo: "해당하는 것을 모두 누르세요. 번호는 쓰지 않아요.",
  answerMode: "multi",
  answerModeTag: "Choose · 모두 고르기",
};
const ORDER = {
  directionKo: "나오는 순서대로 누르시오.",
  ruleKo: "말을 순서대로 누르세요. 받아쓰기는 하지 않아요.",
  answerMode: "order",
  answerModeTag: "Order · 순서 누르기",
};
const TF = {
  directionKo: "내용과 같으면 T, 다르면 F를 고르시오.",
  ruleKo: "T 또는 F를 누르세요. 받아쓰기는 하지 않아요.",
  answerMode: "choice",
  answerModeTag: "Choose · T/F",
};

function mc(sourceId, prompt, choices, index, explainKo) {
  return {
    type: "mc", select: "one", sourceId, promptEn: prompt,
    choices, correctIndexes: [index], explainKo,
  };
}
function multi(sourceId, prompt, choices, indexes, explainKo) {
  return {
    type: "mc", select: "multi", answerMode: "multi", sourceId, promptEn: prompt,
    choices, correctIndexes: indexes, explainKo,
  };
}
function fill(sourceId, prompt, accept, explainKo, phrase) {
  return {
    type: "fill", sourceId, promptEn: prompt, accept: accept.slice(),
    explainKo, phraseBlank: phrase !== false && accept[0].trim().includes(" "),
  };
}
function sentence(sourceId, prompt, accept, explainKo) {
  return { type: "sentence", sourceId, promptEn: prompt, accept: accept.slice(), explainKo };
}
function tf(sourceId, prompt, mark, explainKo) {
  return mc(sourceId, prompt, ["T", "F"], mark === "T" ? 1 : 2, explainKo);
}

function pairs(list) {
  return list.map((row, i) => ({
    prompt: row[0],
    answer: row[1],
    explainKo: "정답: " + row[1],
    group: String(i + 1).padStart(2, "0"),
  }));
}

const out = { u07: {}, u08: {} };
/** Exercises that are pulled from the site until their real page content is rebuilt.
 *  They keep their id in the catalog so a student sees "확인 필요", not a broken card. */
const DEFERRED = { u07: {}, u08: {} };
function defer(unit, id, title, reason) {
  if (out[unit][id]) throw new Error("cannot defer an exercise that was built: " + unit + "/" + id);
  DEFERRED[unit][id] = { title, reason };
}

function isShellQuestion(q) {
  const prompt = String(q.promptEn || "");
  // The answer-key citation belongs in explainKo; in a prompt it means the page was never read.
  if (/답지/.test(prompt)) return true;
  // Only the two bracketed options, with no sentence to apply them to.
  if (/\[[^\]]*\/[^\]]*\]/.test(prompt) && (prompt.match(/[A-Za-z가-힣']+/g) || []).length < 8) return true;
  // Choice is a numbered position that the passage on the same card does not show.
  const CIRC = "①②③④⑤⑥⑦⑧⑨⑩";
  const choices = (q.choices || []).map((c) => String(c).trim());
  if (choices.length && choices.every((c) => c.length === 1 && CIRC.includes(c))) {
    if (choices.some((c) => !prompt.includes(c))) return true;
  }
  if (q.pairs || q.orderChunks || q.parts) return false;
  const words = prompt.match(/[A-Za-z가-힣']+/g) || [];
  const hasKoHint = /[가-힣]/.test(String(q.promptKo || ""));
  const longestLine = Math.max.apply(null, [0].concat(prompt.split("\n").map((l) => (l.match(/[A-Za-z가-힣']+/g) || []).length)));
  // Nothing to act on: a bare instruction, an item number, or blanks with no sentence around them.
  if (!/___/.test(prompt) && longestLine < 5 && !hasKoHint) return true;
  return !(words.length >= 3 || (words.length >= 1 && /___/.test(prompt)) || hasKoHint);
}

function build(unit, id, title, pages, fn) {
  const ex = new Exercise({ id, title, unit: UNIT_LABEL[unit], sourcePages: pages });
  fn(ex);
  const json = ex.toJSON();
  // Never ship a card a student cannot read: hold those items in omitted[] with the page,
  // and defer the whole exercise only when nothing answerable is left.
  const kept = [];
  json.questions.forEach((q) => {
    if (!isShellQuestion(q)) {
      kept.push(q);
      return;
    }
    json.omitted.push({ sourceId: String(q.id), reason: "교재 " + pages + " 원문 확인 전 보류 — 빈 카드였음" });
  });
  if (!kept.length) {
    DEFERRED[unit][id] = { title, reason: "교재 " + pages + " 다시 읽고 재작성 필요" };
    return;
  }
  json.questions = kept;
  delete DEFERRED[unit][id];
  json.questionCount = kept.length;
  json.sections = json.sections
    .map((sec) => Object.assign({}, sec, { itemCount: kept.filter((q) => q.section === sec.id).length }))
    .filter((sec) => sec.itemCount > 0);
  out[unit][id] = json;
}

function buildVocabCheck(unit, pages, A, B, C, D) {
  build(unit, "vocab-check", "Vocabulary 확인 문제", pages, (ex) => {
    ex.section("Section A · 영어를 보고 같은 뜻의 우리말을 누르세요.", "영어와 같은 뜻의 우리말을 짝지으세요.", koEn("").ruleKo, "match", "Match · 짝짓기");
    ex.matchPairs(pairs(A));
    ex.section("Section B · 우리말을 보고 같은 뜻의 영어를 누르세요.", "영어와 같은 뜻의 우리말을 짝지으세요.", koEn("").ruleKo, "match", "Match · 짝짓기");
    ex.matchPairs(pairs(B));
    ex.section("Section C · 영어를 보고 같은 뜻의 우리말을 누르세요.", "영어와 같은 뜻의 우리말을 짝지으세요.", koEn("").ruleKo, "match", "Match · 짝짓기");
    ex.matchPairs(pairs(C));
    ex.section("Section D · 우리말을 보고 같은 뜻의 영어를 누르세요.", "영어와 같은 뜻의 우리말을 짝지으세요.", koEn("").ruleKo, "match", "Match · 짝짓기");
    ex.matchPairs(pairs(D));
  });
}

function buildDialogComplete(unit, pages, dialogs) {
  build(unit, "dialog-complete", "Dialog 완성하기", pages, (ex) => {
    ex.section("Section A · 이 빈칸에 들어갈 말만 쓰시오.", "이 빈칸에 들어갈 말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
    dialogs.forEach((d, i) => {
      if (d.length >= 5 && d[4]) {
        ex.splitMarked(i + 1, d[0], d[4], d[2], d[3]);
      } else {
        ex.splitWords(i + 1, d[0] + "\n\n이 대화의 빈칸에 들어갈 말을 쓰시오.", d[1], d[2], d[3]);
      }
    });
  });
}

function orderLettersToIds(letters) {
  const map = { "ⓐ": 1, "ⓑ": 2, "ⓒ": 3, "ⓓ": 4, "ⓔ": 5, "ⓕ": 6, "ⓖ": 7, "ⓗ": 8, "ⓘ": 9 };
  return letters.map((l) => {
    const k = String(l).replace(/[()]/g, "").trim();
    const n = map[k] || parseInt(k, 10);
    return "s" + n;
  });
}

require("./j1-neung-u78-runner.js")( {
  build, buildVocabCheck, buildDialogComplete, orderLettersToIds,
  out, payload, mc, multi, fill, sentence, tf, pairs, koEn,
  FILL, SENT, CHOOSE, MULTI, ORDER, TF, defer,
});

function wmCard(pack) {
  return {
    id: "wm-" + pack.id,
    title: pack.title,
    external: true,
    href: "https://mrjkorea.github.io/word-master/?packsrc=https://mrjkorea.github.io/bekbal-unit-practice/handoff/word-packs/" + pack.id + ".json",
  };
}

function loadGrammarSections(unit) {
  const p = path.join(ROOT, "data/j1-neung", unit, "catalog.json");
  const cat = JSON.parse(fs.readFileSync(p, "utf8"));
  return (cat.sections || []).find((s) => s.key === "G") || { exercises: [], note: "" };
}

function catalog(unit) {
  const labels = { u07: "Lesson 07 Save Earth, Save Us", u08: "Lesson 08 Dive into Stories" };
  const order = [
    ["A", "A. 본책", ["vocab-check", "vocab-practice", "vocab-advanced", "dialog-detail", "dialog-complete", "dialog-order", "dialog-practice", "dialog-advanced", "grammar-check", "grammar-practice", "grammar-advanced", "reading-content", "reading-lexgram", "reading-order", "reading-writing", "reading-practice", "reading-advanced", "plus-practice", "writing-finish", "mock-100", "mock-high"]],
    ["B", "B. X-10 Part I", ["x10-vocab", "x10-dialog-cloze", "x10-dialog-write", "x10-grammar", "x10-reading-sentence", "x10-reading-cloze", "x10-review"]],
    ["C", "C. 모의고사", ["final-1", "final-2", "final-3"]],
  ];
  const titles = {
    "vocab-check": "Vocabulary 확인 문제", "vocab-practice": "Vocabulary 실전 문제", "vocab-advanced": "Vocabulary 심화 문제",
    "dialog-detail": "Dialog 자세히 보기", "dialog-complete": "Dialog 완성하기", "dialog-order": "Dialog 순서배열하기",
    "dialog-practice": "Dialog 실전 문제", "dialog-advanced": "Dialog 심화 문제",
    "grammar-check": "Grammar 확인 문제", "grammar-practice": "Grammar 실전 문제", "grammar-advanced": "Grammar 심화 문제",
    "reading-content": "Reading 내용 확인하기", "reading-lexgram": "Reading 적절한 어휘·어법 고르기",
    "reading-order": "Reading 순서배열하기", "reading-writing": "Reading 영작하기",
    "reading-practice": "Reading 실전 문제", "reading-advanced": "Reading 심화 문제",
    "plus-practice": "Plus 기타 지문 실전 문제", "writing-finish": "서술형 끝내기",
    "x10-vocab": "어휘 확인 문제", "x10-dialog-cloze": "대화 빈칸 완성하기", "x10-dialog-write": "대화 영작하기",
    "x10-grammar": "핵심 Grammar 확인 문제", "x10-reading-sentence": "Reading 문장 완성하기",
    "x10-reading-cloze": "Reading 빈칸 완성하기", "x10-review": "핵심 문장 Review",
    "mock-100": "100발 100중 모의고사", "mock-high": "고득점 모의고사",
    "final-1": "최종점검 모의고사 1회", "final-2": "최종점검 모의고사 2회", "final-3": "최종점검 모의고사 3회",
  };
  const g = loadGrammarSections(unit);
  const wPacks = payload.WORD_PACKS[unit] || [];
  return {
    book: "j1-neung",
    unit,
    label: labels[unit],
    status: "ready",
    note: "통과 80%. 중1 능률 김기택 " + labels[unit] + ". book-txt와 답지(answers/ans-169..201)로 대조했습니다. 답지 스캔 공백(40–44, 50–54) 문항은 omitted에 표시했습니다. 틀리고 다시 풀기 전에만 종이 교재 안내가 나옵니다.",
    sections: order.map(([key, title, ids]) => ({
      key, title,
      exercises: ids.filter((id) => out[unit][id] || DEFERRED[unit][id]).map((id) => {
        const d = DEFERRED[unit][id];
        if (d) return { id, title: d.title || titles[id], deferred: true, reason: d.reason };
        const file = out[unit][id];
        const row = { id, title: titles[id], questionCount: file.questionCount };
        const om = (file.omitted || []).length;
        if (om) row.omittedCount = om;
        return row;
      }),
    })).concat([
      {
        key: "W",
        title: "Word focus",
        lane: "focus",
        note: "Coming soon. WordMaster publish pending — pack JSON in this repo at handoff/word-packs/ (" + wPacks.map((p) => p.id).join(", ") + ").",
        exercises: [],
      },
      { key: "G", title: "Grammar focus", lane: "focus", note: g.note, exercises: g.exercises },
    ]),
  };
}

const problems = [];
// UNIT_ONLY lets one agent rebuild one unit without touching the other unit's files.
const UNITS = process.env.UNIT_ONLY ? [process.env.UNIT_ONLY] : ["u07", "u08"];
for (const unit of UNITS) {
  const dir = path.join(ROOT, "data/j1-neung", unit, "exercises");
  fs.mkdirSync(dir, { recursive: true });
  for (const id of Object.keys(DEFERRED[unit])) {
    const stale = path.join(dir, id + ".json");
    if (fs.existsSync(stale)) fs.unlinkSync(stale);
  }
  for (const id of Object.keys(out[unit])) {
    const ex = out[unit][id];
    for (const q of ex.questions) {
      // Guard against the L07/L08 shells: a card with no stem must never ship again.
      if (isShellQuestion(q)) problems.push(unit + "/" + id + "#" + q.id + " shell prompt: " + q.promptEn);
      if ((q.type === "mc" || q.type === "bank") && !(q.correctIndexes || []).length) problems.push(unit + "/" + id + "#" + q.id + " no answer key");
    }
    for (const q of ex.questions) {
      let ok;
      if (q.type === "match") {
        const links = (q.pairs || []).map((p) => [p.id, p.id]);
        ok = grade.gradeItem(q, { links });
      } else if (q.type === "mc" || q.type === "bank") {
        ok = grade.gradeItem(q, { indexes: (q.correctIndexes || []).slice() });
      } else if (q.type === "order") {
        ok = grade.gradeItem(q, { order: (q.orderIds || []).slice() });
      } else if (q.type === "ox") {
        ok = grade.gradeItem(q, { value: q.oxMark, rewrite: (q.rewriteAccept || [])[0] || "" });
      } else {
        ok = grade.gradeItem(q, { value: (q.accept || [])[0] || "" });
      }
      if (!ok) problems.push(unit + "/" + id + "#" + q.id + " " + q.type);
    }
    fs.writeFileSync(path.join(dir, id + ".json"), JSON.stringify(ex, null, 2) + "\n");
  }
  fs.writeFileSync(path.join(ROOT, "data/j1-neung", unit, "catalog.json"), JSON.stringify(catalog(unit), null, 2) + "\n");
}

const booksPath = path.join(ROOT, "data/books.json");
const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));
const ne = books.books.find((b) => b.slug === "j1-neung");
for (const u of ne.units) {
  if (u.unit === "u07") { u.label = "Lesson 07 Save Earth, Save Us"; u.status = "ready"; }
  if (u.unit === "u08") { u.label = "Lesson 08 Dive into Stories"; u.status = "ready"; }
}
fs.writeFileSync(booksPath, JSON.stringify(books, null, 2) + "\n");

if (problems.length) {
  console.error(problems.slice(0, 50).join("\n"));
  console.error("grade failures", problems.length);
  process.exit(1);
}
const counts = {};
for (const unit of ["u07", "u08"]) {
  counts[unit] = {};
  for (const id of Object.keys(out[unit])) counts[unit][id] = { q: out[unit][id].questionCount, omitted: (out[unit][id].omitted || []).length };
}
console.log(JSON.stringify(counts, null, 2));
