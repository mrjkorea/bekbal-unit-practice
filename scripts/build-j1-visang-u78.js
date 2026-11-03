#!/usr/bin/env node
/**
 * Build 중1 비상 황종배 Lesson 07–08 exercise JSON from the uploaded 본책 OCR,
 * X-10 workbook, and 답지. Accept strings are the 답지 forms. Stems that could
 * not be recovered as standalone text are listed on each file's omitted array.
 */
const fs = require("fs");
const path = require("path");
const grade = require("../assets/grade.js");

const ROOT = path.join(__dirname, "..");
const BOOK = "중1 비상 황종배";

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

function build(unit, id, title, pages, fn) {
  const ex = new Exercise({ id, title, unit: unit === "u07" ? "Lesson 07 Greener, Greater" : "Lesson 08 For a Better Tomorrow", sourcePages: pages });
  fn(ex);
  out[unit][id] = ex.toJSON();
}

/* ---------- Lesson 07 vocab (본책 p.126, 답지) ---------- */
const L07_A = [
  ["stairs", "계단"], ["recycle", "재활용하다"], ["bright", "밝은"], ["reuse", "재사용하다"],
  ["reach", "도착하다"], ["ocean", "대양"], ["print", "인쇄하다"], ["post", "게시하다"],
  ["factory", "공장"], ["easy", "쉬운"], ["choose", "선택하다"], ["giant", "거대한"],
  ["decide", "결정하다"], ["wave", "파도"], ["turn", "차례"], ["waste", "쓰레기: 낭비하다"],
  ["lose", "잃다"], ["accident", "사고"], ["last", "오래가다; 마지막의"], ["challenge", "도전"],
];
const L07_B = [
  ["아름다운", "beautiful"], ["바람", "wind"], ["희망하다", "hope"], ["콘서트", "concert"],
  ["도착하다", "arrive"], ["청바지", "jean"], ["섬", "island"], ["폭풍", "storm"],
  ["가벼운", "light"], ["지구", "Earth"], ["거북이", "turtle"], ["마침내", "finally"],
  ["해변", "beach"], ["가져오다", "bring"], ["자유롭게 하다", "free"], ["플라스틱", "plastic"],
  ["웹사이트", "website"], ["멋진", "cool"], ["그리다", "draw"], ["슬프게도", "sadly"],
];
const L07_C = [
  ["in front of", "~의 앞에"], ["speaking test", "말하기 시험"], ["a lot of", "많은"],
  ["think about", "~에 대해 생각하다"], ["because of", "~ 때문에"], ["old man", "노인"],
  ["take apart", "갈라놓다"], ["in trouble", "곤경에 처한"], ["much time", "많은 시간"],
  ["put up", "게시하다"],
];
const L07_D = [
  ["큰 문제", "big problem"], ["~로 만들다", "make with"], ["오래 지속되다", "last long"],
  ["어느 날", "one day"], ["~에 빠지다", "fall into"], ["청소하다", "clean up"],
  ["북극곰", "polar bear"], ["~의 한가운데에", "in the middle of"], ["파티를 열다", "throw a party"],
  ["알아내다", "find out"],
];

build("u07", "vocab-check", "Vocabulary 확인 문제", "p.126", (ex) => {
  ex.section("Section A · 다음 영어를 우리말로", "다음 영어와 같은 뜻의 우리말을 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs(L07_A));
  ex.section("Section B · 다음 우리말을 영어로", "다음 우리말과 같은 뜻의 영어를 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs(L07_B));
  ex.section("Section C · 다음 영어 표현을 우리말로", "다음 영어 표현과 같은 뜻의 우리말을 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs(L07_C));
  ex.section("Section D · 다음 우리말 표현을 영어로", "다음 우리말 표현과 같은 뜻의 영어를 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs(L07_D));
});

build("u07", "vocab-practice", "Vocabulary 실전 문제", "p.127", (ex) => {
  ex.section("Section A · 관계", "다음 짝지어진 두 단어의 관계가 같도록 빈칸에 들어갈 말을 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(1, "다음 짝지어진 두 단어의 관계가 같도록 빈칸에 들어갈 말을 쓰시오.\nfirst : last = difficult : ______", ["easy"], "정답: easy. first:last는 반의어 관계이므로 difficult의 반의어 easy. (답지 p.127 01)"));
  ex.section("Section B · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  ex.add(mc(2, "다음 빈칸에 들어갈 말로 가장 적절한 것은?\nDon't throw away the ______ into the ocean.", ["wave", "wind", "island", "trash", "beach"], 4, "정답: ④ trash. 쓰레기를 바다에 버리지 말라는 뜻. (답지 p.127 02)"));
  ex.add(mc(3, "다음 영영풀이에 해당하는 단어는?\nto make letters, words, or pictures on paper using a machine", ["draw", "lose", "print", "put up", "reach"], 3, "정답: ③ print. (답지 p.127 03)"));
  ex.section("Section C · 빈칸", "다음 우리말에 맞도록 빈칸에 들어갈 말을 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(4, "다음 우리말에 맞도록 빈칸에 들어갈 말을 쓰시오.\n북극곰은 얼음의 한가운데에 서 있다.\n→ The polar bear is standing ______ the ice.", ["in the middle of"], "정답: in the middle of. (답지 p.127 04)", true));
  ex.section("Section D · 어색한 표현", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  ex.add(mc(5, "다음 중 밑줄 친 표현이 어색한 것은?", [
    "I will put up the poster.",
    "This was not a good idea.",
    "He is going to be at trouble.",
    "My mom is worried about me.",
    "He decided to play soccer today.",
  ], 3, "정답: ③. in trouble로 써야 한다. (답지 p.127 05)"));
  ex.add(mc(6, "다음 빈칸 ⓐ–ⓒ에 들어갈 말이 바르게 짝지어진 것은?\n• I ⓐ ______ finished my homework.\n• This chair is ⓑ ______, so I can move it easily.\n• We can ⓒ ______ the top of the mountain.", [
    "sadly / light / reach",
    "sadly / bright / arrive",
    "finally / bright / arrive",
    "finally / light / reach",
    "finally / light / arrive",
  ], 4, "정답: ④ finally / light / reach. (답지 p.127 06)"));
  ex.section("Section E · 첫 철자", "영영풀이에 해당하는 단어를 주어진 철자로 시작하여 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(7, "다음 영영풀이에 해당하는 단어를 주어진 철자로 시작하여 쓰시오.\nthe planet we live on → E______", ["Earth"], "정답: Earth. (답지 p.127 07)"));
});

build("u07", "vocab-advanced", "Vocabulary 심화 문제", "pp.128-129", (ex) => {
  ex.section("Section A · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  ex.add(mc(1, "다음 단어의 부사형이 적절하지 않은 것은?", [
    "easy – easyly",
    "slow – slowly",
    "final – finally",
    "bright – brightly",
    "beautiful – beautifully",
  ], 1, "정답: ①. easy의 부사형은 easily. (답지 pp.128-129 01)"));
  ex.add(mc(6, "다음 우리말을 영작할 때 빈칸에 들어갈 말로 가장 적절한 것은?\n나는 그 콘서트에 갈 계획이다.\n→ I am planning ______ to the concert.", ["am", "to", "go", "planning", "going"], 2, "정답: ② to. I am planning to go to the concert. (답지 06)"));
  ex.section("Section B · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(4, "다음 우리말에 맞도록 빈칸에 들어갈 말을 쓰시오.\n내 친구가 아파서 걱정이 돼.\n→ I ______ because he is sick.", ["am worried about"], "정답: am worried about. (답지 04)", true));
  ex.add(fill(7, "다음 영영풀이에 해당하는 단어를 주어진 철자로 시작하여 쓰시오.\na thought or suggestion → i______", ["idea"], "정답: idea. (답지 07)"));
  ex.add(fill(13, "다음 영영풀이에 해당하는 단어를 이용하여 문장을 완성하시오. 빈칸에 들어갈 말만 쓰시오.\nto make a picture of something with a pencil or pen\nI want to ______ a beautiful flower.", ["draw"], "정답: draw. (답지 13)"));
  ex.add(fill(14, "다음 대화의 빈칸에 공통으로 들어갈 말을 쓰시오.\nA: It's my ______ to use the computer.\nB: Don't forget to ______ it off after you finish.", ["turn"], "정답: turn. turn off. (답지 14)"));
  [2, 3, 5, 8, 9, 10, 11, 12].forEach((n) => ex.omit(n, "두 단 OCR이라 보기 순서를 답지와 한 줄로 확정하지 못함"));
});

const D07 = [
  ["01 Everyday Communication 1-A1", "W: Look at the big plastic island in the ocean.\nM: Oh, is this all plastic?\nW: Yes. I'm worried about the sea animals.\nM: Me, too. They can eat plastic waste and get sick.", ["plastic", "island", "worried", "sea", "animals", "eat", "get", "sick"], "답지 pp.134-135 01"],
  ["02 Everyday Communication 1-A2", "M: You look worried. What's wrong?\nW: I'm worried about the English speaking test.\nM: Oh, I see. Speaking in front of people is not easy.\nW: Yeah, it is always hard for me.", ["look", "worried", "speaking", "test", "Speaking", "in", "front", "of", "hard"], "답지 02"],
  ["03 Everyday Communication 1-A3", "M: Seoul is so beautiful at night.\nW: Yeah, it is. But I'm worried about the birds.\nM: Why?\nW: It is bright all night, so they cannot sleep well.", ["beautiful", "But", "about", "bright", "sleep", "well"], "답지 03"],
  ["04 Everyday Communication 1-C1", "M: What are you drawing, Jessica?\nW: I'm drawing a poster about polar bears.\nM: I see. Oh, the polar bears on the ice look so sad.\nW: Yeah, I'm worried about the polar bears. They are losing their homes.\nM: You're right. We need to do something for them.\nW: Right. They may not have much time.", ["drawing", "poster", "polar", "bears", "ice", "losing", "homes", "do", "something", "may", "not", "much"], "답지 04"],
  ["05 Everyday Communication 2-A1", "M: Look! This is the design for our concert poster.\nW: Oh, it's cool. Let's print and put up posters around the school.\nM: Well, that is a waste of paper. Why don't we post it on the school website?\nW: That's a good idea.", ["design", "cool", "print", "put", "up", "waste", "post", "idea"], "답지 05"],
  ["06 Everyday Communication 2-A2", "M: Tomorrow is Mr. Green's last day at school. He will go back to the U.S.\nW: I feel so sad. I really liked his class.\nM: Me, too. Why don't we throw a surprise party for him?\nW: Great idea. Let's prepare it together.", ["last", "day", "go", "back", "feel", "so", "sad", "liked", "throw", "prepare"], "답지 06"],
  ["07 Everyday Communication 2-A3", "M: Oh, there is too much plastic waste in our classroom.\nW: Yeah.... We need to recycle more. Do you have any ideas?\nM: Why don't we make fun recycling boxes and put them in our classroom?\nW: Sounds like a great idea.", ["waste", "recycle", "make", "recycling", "put", "great", "idea"], "답지 07"],
  ["08 Everyday Communication 2-C1", "M: Your bag is pretty, Jessica.\nW: Thank you, Toby. I made it with my old jeans. It's my Earth Day project.\nM: That's cool. I want to do something on Earth Day.\nW: Why don't we make a short video about reusing old clothes together?\nM: That's a good idea.", ["bag", "made", "Earth", "Day", "cool", "do", "something", "short", "video"], "답지 08"],
  ["09 Wrap Up 1", "M: Look at all the trash on the beach.\nW: Yeah. There is a lot of trash.\nM: It's a big problem.\nW: Yes, it is. I'm worried about the sea animals.", ["trash", "lot", "problem", "it", "is"], "답지 09"],
  ["10 Wrap Up 2", "W: This Friday is Mom's birthday. I want to give her a special present.\nM: Sounds good. Do you have any ideas?\nW: Well, why don't we make a video with our family pictures?\nM: That's a good idea. She will love it.", ["birthday", "give", "ideas", "video", "pictures", "love"], "답지 10"],
];

build("u07", "dialog-detail", "Dialog 자세히 보기", "pp.132-133", (ex) => {
  ex.section("Section A · T/F", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
  const rows = [
    [1, "The woman is concerned about sea animals.", "T", "여자는 바다 동물을 걱정한다. (답지 01 T)"],
    [2, "The woman is worried about a math test.", "F", "영어 말하기 시험을 걱정한다. (답지 02 F)"],
    [3, "They're worried that birds cannot sleep well in Seoul.", "F", "남자는 이유를 물을 뿐, 둘 다 걱정하는 것은 아니다. (답지 03 F)"],
    [4, "Both the man and woman are worried about polar bears.", "T", "답지 04 T"],
    [5, "The man wants to put up the concert poster around the school.", "F", "남자는 학교 웹사이트에 올리자고 제안한다. (답지 05 F)"],
    [6, "The students plan to throw a surprise party for Mr. Green.", "T", "답지 06 T"],
    [7, "The woman thinks recycling is unnecessary.", "F", "여자는 재활용을 더 해야 한다고 한다. (답지 07 F)"],
    [8, "Jessica made her bag from old jeans.", "T", "답지 08 T"],
    [9, "The beach is clean and free of trash.", "F", "쓰레기가 많다. (답지 09 F)"],
    [10, "The woman wants to buy a gift for her mother's birthday.", "F", "가족 사진으로 비디오를 만들 계획이다. (답지 10 F)"],
  ];
  rows.forEach((r) => ex.add(tf(r[0], r[1], r[2], r[3])));
});

build("u07", "dialog-complete", "Dialog 완성하기", "pp.134-135", (ex) => {
  ex.section("Section A · 이 칸만", "이 칸에 들어갈 말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  D07.forEach((d, i) => ex.splitWords(i + 1, d[0] + "\n이 칸에 들어갈 말만 쓰시오.", d[1], d[2], d[3]));
});

build("u07", "dialog-order", "Dialog 순서배열하기", "pp.136-137", (ex) => {
  ex.section("Section A · 대화 순서", "다음 대화를 흐름에 맞게 순서대로 누르시오.", ORDER.ruleKo, "order", ORDER.answerModeTag);
  D07.forEach((d, i) => {
    const lines = d[1].split("\n").map((line) => line.replace(/^[WM]:\s*/, ""));
    ex.sentenceOrder(i + 1, (i + 1) + " 다음 대화를 순서대로 누르시오.\n" + d[0], lines, "정답 대화: " + lines.join(" / ") + " (" + d[3] + ")");
  });
});

build("u07", "dialog-practice", "Dialog 실전 문제", "pp.138-139", (ex) => {
  ex.section("Section A · 쓰기", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(5, "걱정을 나타내는 말로 빈칸을 채워 문장 전체를 쓰시오.\n나는 바다 동물들이 걱정돼.\n→ ________________", ["I'm worried about sea animals.", "I am worried about sea animals."], "정답: I'm worried about sea animals. (답지 pp.138-139 05)"));
  ex.add(sentence(7, "밑줄 친 it이 가리키는 말을 우리말로 쓰시오.\nSpeaking in front of people is not easy.", ["사람들 앞에서 말하는 것"], "정답: 사람들 앞에서 말하는 것. (답지 07)"));
  ex.add(sentence(13, "다음 우리말에 맞도록 문장 전체를 쓰시오.\n나는 북극곰들이 걱정돼.", ["I'm worried about the polar bears.", "I am worried about the polar bears."], "정답: I'm worried about the polar bears. (답지 13)"));
  ex.section("Section B · 고치기", "틀린 말을 바른 말로만 쓰시오.", "고친 말만 쓰세요.", "words", FILL.answerModeTag);
  ex.add(fill(10, "어법상 틀린 부분을 바른 말로만 쓰시오.\nWhy don't we making a video?", ["make"], "정답: making → make. Why don't we + 동사원형. (답지 10)"));
  [1, 2, 3, 4, 6, 8, 9, 11, 12, 14].forEach((n) => ex.omit(n, "실전 문제 보기 영어가 두 단 OCR에서 순서를 확정하기 어려움"));
});

build("u07", "dialog-advanced", "Dialog 심화 문제", "pp.140-141", (ex) => {
  ex.section("Section A · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(7, "제안에 긍정으로 답하는 말을 쓰시오. 빈칸에 들어갈 말만 쓰시오.\nA: Why don't we make fun recycling boxes?\nB: Sounds like ______.", ["a good idea"], "정답: a good idea. (답지 pp.140-141 07)", true));
  ex.add(fill(10, "다음 우리말에 맞도록 빈칸에 들어갈 말을 쓰시오.\n우리는 그를 위해 깜짝 파티를 열 것이다.\n→ We will ______ him.", ["throw a surprise party for"], "정답: throw a surprise party for. (답지 10)", true));
  ex.add(fill(12, "대화의 빈칸에 들어갈 말을 쓰시오.\nIt is ______, so the birds cannot sleep well.", ["bright all night"], "정답: bright all night. (답지 12)", true));
  ex.section("Section B · 한 단어", "답지의 형용사를 한 칸에 하나씩 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill("13-1", "서울은 밤에 아름다워 보인다. 답지 13의 첫 형용사만 쓰시오.", ["beautiful"], "정답: beautiful. beautiful, bright 중 첫 말. (답지 pp.140-141 13)"));
  ex.add(fill("13-2", "불빛이 너무 밝다. 답지 13의 둘째 형용사만 쓰시오.", ["bright"], "정답: bright. beautiful, bright 중 둘째 말. (답지 pp.140-141 13)"));
  [1, 2, 3, 4, 5, 6, 8, 9, 11].forEach((n) => ex.omit(n, "심화 보기 번호가 OCR에서 섞여 책 순서를 확정하지 못함"));
});

build("u07", "grammar-check", "Grammar 확인 문제", "pp.144-145", (ex) => {
  ex.section("Section A · to부정사 형태", "괄호 안 단어를 to부정사로 바꿔 빈칸에 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [1, "I planned ______ a diary. (write)", "to write"],
    [2, "I hope ______ a good teacher. (be)", "to be"],
    [3, "He wants ______ to the party. (go)", "to go"],
    [4, "She needs ______ running in the morning. (start)", "to start"],
    [5, "They decided ______ hamburgers for lunch. (eat)", "to eat"],
  ].forEach((r) => ex.add(fill(r[0], "1 to부정사의 명사적 용법\n" + r[1], [r[2]], "정답: " + r[2] + ". (답지 p.144 A)")));
  ex.section("Section B · 고친 말", "틀린 부분을 바른 말로만 쓰시오.", "고친 말만 쓰세요.", "words", FILL.answerModeTag);
  [
    [6, "She wants buying a book.", "to buy", "buying → to buy"],
    [7, "I hope meet the famous singer.", "to meet", "meet → to meet"],
    [8, "They planned to travel*ing* to Japan.", "to travel", "to travel*ing* → to travel"],
    [9, "He needs to buy*s* something to eat.", "to buy", "to buy*s* → to buy"],
    [10, "We decided to had a party for him.", "to have", "to had → to have"],
  ].forEach((r) => ex.add(fill(r[0], "어법상 틀린 부분을 바른 말로만 쓰시오.\n" + r[1], [r[2]], "정답: " + r[3] + ". (답지 p.144 B)")));
  ex.section("Section C · 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  ex.orderBank(11, "We ______.\n보기: tomorrow / win / to / the / hope / game", ["tomorrow", "win", "to", "the", "hope", "game"], "hope to win the game tomorrow", "정답: We hope to win the game tomorrow. (답지 C 01)");
  ex.orderBank(12, "They ______.\n보기: visit / decided / New York / to", ["visit", "decided", "New York", "to"], "decided to visit New York", "정답: They decided to visit New York. (답지 C 02)");
  ex.orderBank(13, "He ______.\n보기: to / plans / to / travel / Paris", ["to", "plans", "to", "travel", "Paris"], "plans to travel to Paris", "정답: He plans to travel to Paris. (답지 C 03)");
  ex.orderBank(14, "He ______.\n보기: to / needs / time / arrive / on", ["to", "needs", "time", "arrive", "on"], "needs to arrive on time", "정답: He needs to arrive on time. (답지 C 04)");
  ex.orderBank(15, "Emily ______.\n보기: drink / juice / wants / orange / to", ["drink", "juice", "wants", "orange", "to"], "wants to drink orange juice", "정답: Emily wants to drink orange juice. (답지 C 05)");
  ex.section("Section D · What/How", "괄호 안에서 알맞은 것을 고르시오.", CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  [
    [16, "[What / How] beautiful the sunset is!", ["What", "How"], 2, "How"],
    [17, "[What / How] a wonderful surprise this is!", ["What", "How"], 1, "What"],
    [18, "[What / How] beautiful flowers these are!", ["What", "How"], 1, "What"],
    [19, "[What / How] hard he works!", ["What", "How"], 2, "How"],
    [20, "[What / How] difficult homework we have this week!", ["What", "How"], 1, "What"],
  ].forEach((r) => ex.add(mc(r[0], "2 감탄문 A. 다음 괄호 안에서 적절한 것을 고르시오.\n" + r[1], r[2], r[3], "정답: " + r[4] + ". (답지 p.145 A)")));
  ex.section("Section E · 감탄문 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  ex.orderBank(21, "보기: day / it / what / is / a / beautiful", ["day", "it", "what", "is", "a", "beautiful"], "What a beautiful day it is", "정답: What a beautiful day it is! (답지 B 01)");
  ex.orderBank(22, "보기: interesting / how / the / was / movie", ["interesting", "how", "the", "was", "movie"], "How interesting the movie was", "정답: How interesting the movie was! (답지 B 02)");
  ex.orderBank(23, "보기: delicious / what / this / food / is", ["delicious", "what", "this", "food", "is"], "What delicious food this is", "정답: What delicious food this is! (답지 B 03)");
  ex.orderBank(24, "보기: fast / how / runs / she", ["fast", "how", "runs", "she"], "How fast she runs", "정답: How fast she runs! (답지 B 04)");
  ex.orderBank(25, "보기: book / what / this / a / is / touching", ["book", "what", "this", "a", "is", "touching"], "What a touching book this is", "정답: What a touching book this is! (답지 B 05)");
  ex.section("Section F · 바꿔 쓰기", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  [
    [26, "The weather is nice today. (How)", "How nice the weather is today!"],
    [27, "She is a talented musician. (What)", "What a talented musician she is!"],
    [28, "She sings beautifully. (How)", "How beautifully she sings!"],
    [29, "This is a beautiful painting. (What)", "What a beautiful painting this is!"],
    [30, "The child grew up quickly. (How)", "How quickly the child grew up!"],
  ].forEach((r) => ex.add(sentence(r[0], "괄호 안의 지시에 따라 문장 전체를 쓰시오.\n" + r[1], [r[2], r[2].replace(/!$/, "")], "정답: " + r[2] + " (답지 p.145 C)")));
});

build("u07", "grammar-practice", "Grammar 실전 문제", "pp.146-147", (ex) => {
  ex.section("Section A · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  ex.add(mc(1, "다음 빈칸에 들어갈 말로 가장 적절한 것은?\nShe wants ______ to you.", ["talk", "talks", "talking", "to talk", "to talking"], 4, "정답: ④ to talk. want는 to부정사를 목적어로 한다. (답지 01)"));
  ex.add(mc(2, "다음 빈칸에 들어갈 말로 가장 적절한 것은?\n______ well he drives!", ["So", "How", "Such", "What", "That"], 2, "정답: ② How. (답지 02)"));
  ex.section("Section B · 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(3, "다음 우리말을 괄호 단어를 이용하여 문장 전체로 쓰시오.\n그녀는 영어를 공부하기로 계획했다. (plan, study)", ["She planned to study English."], "정답: She planned to study English. (답지 03)"));
  ex.add(sentence("6-1", "(1) 어법상 틀린 문장을 다시 쓰시오.\nWhat a beautiful flowers these are!", ["What a beautiful flower this is!"], "정답: What a beautiful flower this is! (답지 pp.146-147 06 (1))"));
  ex.add(sentence("6-2", "(2) 어법상 틀린 문장을 다시 쓰시오.\nWhat nice girls she is!", ["What nice girls they are!"], "정답: What nice girls they are! (답지 pp.146-147 06 (2))"));
  ex.add(sentence(9, "다음 우리말에 맞도록 문장 전체를 쓰시오.\n저것은 정말 큰 건물이구나!", ["What a tall building that is!"], "정답: What a tall building that is! (답지 pp.146-147 09)"));
  ex.add(sentence(14, "다음 우리말을 문장 전체로 쓰시오.\n그녀는 토요일에 조부모님을 방문할 계획이다.", ["She plans to visit her grandparents on Saturday."], "정답: She plans to visit her grandparents on Saturday. (답지 14)"));
  [4, 5, 7, 8, 10, 11, 12, 13].forEach((n) => ex.omit(n, "실전 문항 보기가 두 단으로 섞여 책 순서를 확정하지 못함"));
});

build("u07", "grammar-advanced", "Grammar 심화 문제", "pp.148-149", (ex) => {
  ex.section("Section A · 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(1, "‘하려고 계획하다’를 plan to로 하여 문장 전체를 쓰시오.\n나는 규칙적으로 운동할 계획이다.", ["I planned to exercise regularly."], "정답: I planned to exercise regularly. (답지 01)"));
  ex.add(sentence(13, "다음 우리말에 맞도록 문장 전체를 쓰시오.\n그녀의 목표는 대회에서 우승하는 것이다.", ["Her goal is to win the contest."], "정답: Her goal is to win the contest. (답지 13)"));
  ex.section("Section B · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(2, "How 감탄문을 What 감탄문으로 바꿀 때 빈칸에 들어갈 말을 쓰시오.\nHow beautiful the sky is! = What ______ is!", ["a beautiful sky it"], "정답: a beautiful sky it. (답지 02)", true));
  [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((n) => ex.omit(n, "심화 보기 영어 순서가 OCR에서 확정되지 않음"));
});

const PASSAGE = [
  [1, "Hi! I am a plastic duck and I am a bath toy."],
  [2, "But look! I am not in a bathroom."],
  [3, "I am in the middle of the ocean."],
  [4, "How did I get here?"],
  [5, "I was from a factory with other ducks."],
  [6, "People made us with plastic because it is light and lasts long."],
  [7, "People put us in boxes and we went out to sea."],
  [8, "But the boxes fell into the ocean in an accident."],
  [9, "Luckily, we could get out of the boxes."],
  [10, "The wind was strong, so the waves took us apart."],
  [11, "In the ocean, I met a lot of sea animals."],
  [12, "But many of them were in trouble."],
  [13, "One time, I met a sea turtle in a fishing net."],
  [14, "\"Get me out of this,\" the sea turtle cried."],
  [15, "I wanted to help, but I couldn't."],
  [16, "I was so sad."],
  [17, "Then the waves took me to a giant trash island."],
  [18, "I saw a lot of plastic waste."],
  [19, "I wanted to get out of there."],
  [20, "One day, a strong storm freed me."],
  [21, "After weeks, I finally reached land."],
  [22, "There were a lot of people at the beach."],
  [23, "Oh, someone picked me up."],
  [24, "\"Where am I going now?,\" I thought."],
  [25, "What a long journey!"],
  [26, "I am finally in a bathtub with this boy, Mike."],
  [27, "How lucky I am!"],
  [28, "But sometimes I think about my other duck friends."],
  [29, "Are they still in the ocean?"],
  [30, "I hope to see them all someday."],
];
const KO07 = [
  "안녕! 나는 플라스틱 오리이고 목욕 장난감이야.",
  "하지만, 봐! 나는 목욕탕에 있지 않아.",
  "나는 바다 한가운데 있어.",
  "내가 어떻게 여기에 오게 됐을까?",
  "나는 다른 오리들과 함께 공장에서 왔어.",
  "사람들은 플라스틱이 가볍고 오래 가기 때문에 그것으로 우리를 만들었어.",
  "사람들은 우리를 상자 속에 넣었고 우리는 바다로 나갔지.",
  "하지만 그 상자들이 사고로 바다에 빠진 거야.",
  "다행히도, 우리는 상자들 밖으로 나올 수 있었어.",
  "바람이 강해서 파도가 우리를 떨어뜨려 놓았어.",
  "바다에서 나는 많은 바다 동물을 만났어.",
  "하지만 그들 중 많은 이들이 어려움에 빠져 있었어.",
  "한번은, 내가 낚시 그물에 걸린 바다거북을 만났어.",
  "“이것으로부터 나를 꺼내 줘.” 바다거북이 외쳤지.",
  "나는 도와주고 싶었지만, 할 수 없었어.",
  "나는 매우 슬펐어.",
  "그때 파도가 나를 거대한 쓰레기 섬으로 데리고 갔어.",
  "나는 많은 플라스틱 쓰레기를 보았지.",
  "나는 그곳에서 벗어나고 싶었어.",
  "어느 날, 강한 폭풍이 나를 빼내 주었어.",
  "몇 주 후에 나는 마침내 육지에 도착했지.",
  "해변에는 많은 사람들이 있었어.",
  "아, 누군가가 나를 집어 들었어.",
  "“내가 지금 어디로 가고 있는 걸까?” 나는 생각했어.",
  "정말 긴 여행이었어!",
  "나는 드디어 Mike라는 이 소년과 함께 목욕 욕조에 있어.",
  "나는 얼마나 운이 좋은지!",
  "하지만 난 가끔 내 다른 오리 친구들을 생각해.",
  "그들은 아직도 바다에 있을까?",
  "나는 언젠가 그들 모두를 만나기를 바라.",
];

build("u07", "reading-content", "Reading 내용 확인하기", "p.152", (ex) => {
  ex.section("Section A · 표시 뜻·형태", "번호가 가리키는 말의 뜻이나 알맞은 형태만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  const items = [
    [1, "I am in the middle of the ocean. 밑줄 표현 in the middle of의 우리말을 쓰시오.", ["~의 한가운데에", "의 한가운데에"], "정답: ~의 한가운데에"],
    [2, "How did I get here? How 뒤의 어순을 우리말로 쓰시오. (주어, 동사원형)", ["주어, 동사원형", "주어 동사원형"], "정답: 주어, 동사원형"],
    [3, "I was from a factory with other (duck). 괄호 단어를 알맞은 형태로 쓰시오.", ["ducks"], "정답: ducks"],
    [4, "People made us with plastic. us가 가리키는 말을 쓰시오.", ["plastic ducks"], "정답: plastic ducks"],
    [5, "we went out to sea. went out to의 우리말을 쓰시오.", ["~로 나가다", "로 나가다"], "정답: ~로 나가다"],
    [6, "the boxes fell into the ocean in an accident. in an accident의 우리말을 쓰시오.", ["사고로"], "정답: 사고로"],
    [7, "we could get out of the boxes. get out of의 우리말을 쓰시오.", ["~에서 벗어나다", "에서 벗어나다"], "정답: ~에서 벗어나다"],
    [8, "many of them were in trouble. them이 가리키는 말을 쓰시오.", ["sea animals"], "정답: sea animals"],
    [9, "I met a sea turtle in a fishing net. in a fishing net이 가리키는 말을 쓰시오.", ["a fishing net"], "정답: a fishing net"],
    [10, "I wanted to help, but I (not). 괄호를 알맞은 형태로 쓰시오.", ["couldn't"], "정답: couldn't"],
    [11, "the waves took me to a giant trash island. take A to B의 우리말을 쓰시오.", ["A를 B로 데려가다"], "정답: A를 B로 데려가다"],
    [12, "I wanted (get) out of there. 괄호를 알맞은 형태로 쓰시오.", ["to get"], "정답: to get"],
    [13, "I wanted to get out of there. there가 가리키는 말을 쓰시오.", ["a giant trash island"], "정답: a giant trash island"],
    [14, "I (final) reached land. 괄호를 알맞은 형태로 쓰시오.", ["finally"], "정답: finally"],
    [15, "There (be) a lot of people at the beach. 괄호를 알맞은 형태로 쓰시오.", ["were"], "정답: were"],
    [16, "someone picked me up. picked me up의 우리말을 쓰시오.", ["~을 집다, 들어 올리다", "집어 들다"], "정답: ~을 집다, 들어 올리다"],
    [17, "What a long journey! What 감탄문의 어순을 우리말로 쓰시오.", ["형용사, 명사, 주어, 동사"], "정답: 형용사, 명사, 주어, 동사"],
    [18, "How (luck) I am! 괄호를 알맞은 형태로 쓰시오.", ["lucky"], "정답: lucky"],
    [19, "I think about my other duck friends. think about의 우리말을 쓰시오.", ["~에 대해 생각하다", "에 대해 생각하다"], "정답: ~에 대해 생각하다"],
    [20, "I hope to see them all someday. them이 가리키는 말을 쓰시오.", ["my other duck friends"], "정답: my other duck friends"],
  ];
  items.forEach((r) => ex.add(fill(r[0], r[1], r[2], r[3] + " (답지 p.152)", false)));
});

build("u07", "reading-lexgram", "Reading 적절한 어휘·어법 고르기", "p.153", (ex) => {
  ex.section("Section A · 괄호", "괄호 안에서 문맥상 적절한 것을 고르시오.", CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  const lex = [
    [1, "Hi! I am a plastic duck and I [am / was] a bath toy.", ["am", "was"], 1],
    [2, "But look! I am [no / not] in a bathroom.", ["no", "not"], 2],
    [3, "I am [at / in] the middle of the ocean.", ["at", "in"], 2],
    [4, "How did I get [here / there]?", ["here", "there"], 1],
    [5, "I was from a factory with other [duck / ducks].", ["duck", "ducks"], 2],
    [6, "it is light and lasts [longly / long].", ["longly", "long"], 2],
    [7, "we went out [for / to] sea.", ["for", "to"], 2],
    [8, "the boxes fell into the ocean [by / in] an accident.", ["by", "in"], 2],
    [9, "[Lucky / Luckily], we could get out of the boxes.", ["Lucky", "Luckily"], 2],
    [10, "the waves took us [part / apart].", ["part", "apart"], 2],
    [11, "In the ocean, I [met / meets] a lot of sea animals.", ["met", "meets"], 1],
    [12, "many of them [were / was] in trouble.", ["were", "was"], 1],
    [13, "I met [a / the] sea turtle in a fishing net.", ["a", "the"], 1],
    [14, "the sea turtle [cried / cry].", ["cried", "cry"], 1],
    [15, "I wanted to help, but I [can't / couldn't].", ["can't", "couldn't"], 2],
    [16, "I was [such / so] sad.", ["such", "so"], 2],
    [17, "a giant trash [island / islands].", ["island", "islands"], 1],
    [18, "I saw a [lot / few] of plastic waste.", ["lot", "few"], 1],
    [19, "I wanted to [got / get] out of there.", ["got", "get"], 2],
    [20, "a strong storm [freed / free] me.", ["freed", "free"], 1],
    [21, "[After / Before] weeks, I finally reached land.", ["After", "Before"], 1],
    [22, "There [was / were] a lot of people at the beach.", ["was", "were"], 2],
    [23, "someone [picked me up / picked up me].", ["picked me up", "picked up me"], 1],
    [24, "Where [I am / am I] going now?", ["I am", "am I"], 2],
    [25, "[What / How] a long journey!", ["What", "How"], 1],
    [26, "I am [final / finally] in a bathtub with this boy, Mike.", ["final", "finally"], 2],
    [27, "How [lucky / luck] I am!", ["lucky", "luck"], 1],
    [28, "my [another / other] duck friends.", ["another", "other"], 2],
    [29, "[Are / Is] they still in the ocean?", ["Are", "Is"], 1],
    [30, "I hope [to see / seeing] them all someday.", ["to see", "seeing"], 1],
  ];
  lex.forEach((r) => ex.add(mc(r[0], r[1], r[2], r[3], "정답: " + r[2][r[3] - 1] + " (답지 p.153 " + String(r[0]).padStart(2, "0") + ")")));
});

build("u07", "reading-order", "Reading 순서배열하기", "pp.154-155", (ex) => {
  ex.section("Section A · 단어 순서", "괄호 안 단어를 문장이 되도록 순서대로 누르시오.", ORDER.ruleKo, "order", ORDER.answerModeTag);
  PASSAGE.forEach((row, i) => {
    const words = row[1].replace(/[“”]/g, "").match(/[A-Za-z0-9']+/g);
    ex.orderBank(row[0], (i + 1) + " " + KO07[i] + "\n보기를 순서대로 누르시오.", words.slice().reverse(), row[1].replace(/[“”]/g, ""), "정답: " + row[1] + " (답지 pp.154-157)");
  });
});

build("u07", "reading-writing", "Reading 영작하기", "pp.156-157", (ex) => {
  ex.section("Section A · 영작", "다음 우리말에 맞도록 문장 전체를 쓰시오.", SENT.ruleKo, "sentence", SENT.answerModeTag);
  PASSAGE.forEach((row, i) => {
    const bare = row[1].replace(/[“”]/g, '"');
    ex.add(sentence(row[0], (i + 1) + " " + KO07[i], [bare, bare.replace(/[.!?]+$/, "")], "정답: " + row[1] + " (답지 pp.154-157)"));
  });
});

build("u07", "reading-practice", "Reading 실전 문제", "pp.158-161", (ex) => {
  ex.section("Section A · 확인된 문항", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(1, "윗글의 밑줄 친 우리말에 맞도록 문장의 빈칸만 쓰시오.\n난 대양 한가운데 있어.\n→ I'm ______ the ocean.", ["in the middle of"], "정답: in the middle of. I'm in the middle of the ocean. (답지 01)", true));
  ex.add(fill(4, "다음 영영풀이에 해당하는 단어를 본문에서 찾아 쓰시오.\nan unfortunate and unplanned event", ["accident"], "정답: accident. (답지 04)"));
  [2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].forEach((n) => ex.omit(n, "실전 지문 문항의 영어 보기가 두 단 OCR에서 순서를 확정하지 못함"));
});

build("u07", "reading-advanced", "Reading 심화 문제", "pp.162-165", (ex) => {
  ex.section("Section A · 확인된 서술", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(12, "파도 때문에 어떤 일이 일어났는지 우리말로 쓰시오.", ["오리들을 갈라놓았다", "오리들을 갈라놓았다."], "정답: 오리들을 갈라놓았다. (답지 12)"));
  ex.add(fill(15, "there가 가리키는 말을 쓰시오.\nI wanted to get out of there.", ["a giant trash island"], "정답: a giant trash island. (답지 15)"));
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].forEach((n) => ex.omit(n, "심화 문항 보기가 OCR에서 확정되지 않음"));
});

build("u07", "plus-practice", "Plus 기타 지문 실전 문제", "p.167", (ex) => {
  ex.section("Section A · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  ex.add(mc(1, "윗글의 밑줄 친 ⓐ–ⓔ 중 문맥상 의미가 바르지 않은 것은?\nOne day, a plastic duck fell into the ocean in an accident. … Can the duck reach land?", [
    "ⓐ fell into: ~에 빠졌다",
    "ⓑ in an accident: 사고로",
    "ⓒ arrived at: ~에 도착했다",
    "ⓓ in trouble: 곤경에 처한",
    "ⓔ reach: 손을 뻗다",
  ], 5, "정답: ⑤. reach는 여기서 ‘~에 도착하다’. (답지 p.167 01)"));
  ex.add(mc(4, "윗글을 쓴 목적으로 알맞은 것은?", ["조언하기", "사과하기", "요청하기", "설명하기", "비교하기"], 4, "정답: ④ 설명하기. Green Challenge를 설명한다. (답지 04)"));
  ex.section("Section B · 순서", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  ex.sentenceOrder(2, "다음 (A)–(C)를 흐름에 맞게 누르시오.", [
    "(A) Then the duck arrived at a giant trash island.",
    "(B) In the ocean, the duck met a lot of sea animals.",
    "(C) Sadly, many of them were in trouble.",
  ], "정답: (B)-(C)-(A). (답지 02)");
  ex.questions[ex.questions.length - 1].orderIds = ["s2", "s3", "s1"];
  [3, 5, 6].forEach((n) => ex.omit(n, "답지 번호가 두 단 OCR에서 비거나 선택 영어가 없음"));
});

build("u07", "writing-finish", "서술형 끝내기", "pp.168-171", (ex) => {
  ex.section("Section A · 한 칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(1, "이 케이크는 초콜릿과 바닐라로 만들어졌다.\n→ This cake is ______ chocolate and vanilla.", ["made with"], "정답: made with. (답지 01)", true));
  ex.add(fill(2, "This is very bad weather, with strong winds and usually rain, thunder, or snow.\nThis에 해당하는 단어를 쓰시오.", ["storm"], "정답: storm. (답지 02)"));
  ex.add(fill("3-1", "They put ⓐ ______ a new poster.", ["up"], "정답: up. put up. (답지 03 ⓐ)", false));
  ex.questions[ex.questions.length - 1].sourceId = "3-1";
  ex.add(fill("3-2", "I lost my key! I am ⓑ ______ trouble now.", ["in"], "정답: in. in trouble. (답지 03 ⓑ)", false));
  ex.questions[ex.questions.length - 1].sourceId = "3-2";
  ex.add(fill(4, "우리는 Jessica의 생일을 위해 파티를 열기로 계획했다.\n→ We planned ______ Jessica's birthday.", ["to throw a party for"], "정답: to throw a party for. (답지 04)", true));
  ex.add(fill(5, "틀린 말을 바른 말로만 쓰시오.\nThey can eat plastic waste and get healthy.", ["sick"], "정답: healthy → sick. (답지 05)"));
  ex.add(fill(7, "Yeah, I'm ⓐ ______ about the polar bears.", ["worried"], "정답: worried. (답지 07)"));
  ex.section("Section B · 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(6, "밑줄 친 it이 가리키는 말을 여섯 단어 안팎으로 쓰시오.\nWhy don't we throw a surprise party for him? Let's prepare it together.", ["a surprise party for Mr. Green"], "정답: a surprise party for Mr. Green. (답지 06)"));
  ex.add(sentence(8, "우리가 그들을 위해 뭔가를 해야 해. 문장 전체를 쓰시오.", ["We need to do something for them."], "정답: We need to do something for them. (답지 08)"));
  ex.add(sentence(11, "그 개는 얼마나 외로워 보이는지! 문장 전체를 쓰시오.", ["How lonely the dog looks!"], "정답: How lonely the dog looks! (답지 11)"));
  ex.add(sentence(19, "하지만 그들 중 많은 수가 곤경에 처해 있었다. 문장 전체를 쓰시오.", ["But many of them were in trouble."], "정답: But many of them were in trouble. (답지 19)"));
  ex.add(sentence(20, "나는 그곳에서 빠져나가고 싶었다. 문장 전체를 쓰시오.", ["I wanted to get out of there."], "정답: I wanted to get out of there. (답지 20)"));
  ex.add(sentence(22, "플라스틱 오리는 거대한 쓰레기 섬에서 무엇을 보았나요? 영어 문장으로 쓰시오.", ["It saw a lot of plastic waste."], "정답: It saw a lot of plastic waste. (답지 22)"));
  ex.add(sentence(25, "플라스틱 오리는 지금 어디에 있나요? 영어 문장으로 쓰시오.", ["It is in a bathtub."], "정답: It is in a bathtub. (답지 25)"));
  [9, 10, 12, 13, 14, 15, 16, 17, 18, 21, 23, 24].forEach((n) => ex.omit(n, "서술형 하위 빈칸이 여러 개이거나 OCR이 문항 줄과 답을 한 줄로 잇지 못함. 확인된 칸만 한 문항으로 실음"));
});

build("u07", "mock-100", "100발 100중 모의고사", "pp.172-175", (ex) => {
  ex.section("Section A · 어휘", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(1, "ocean : sea = trash : ______", ["waste"], "정답: waste. (답지 모의 01)"));
  ex.section("Section B · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  ex.add(mc(2, "다음 영영풀이에 해당하는 단어로 가장 적절한 것은?\nto continue to exist or happen", ["lose", "last", "hope", "reach", "decide"], 2, "정답: ② last. (답지 02)"));
  ex.add(mc(3, "다음 빈칸에 들어갈 말이 나머지와 다른 것은?", [
    "He was ______ an accident last night.",
    "The ball fell ______ the pond.",
    "The big tree is ______ the middle of the road.",
    "She lost her bag and is ______ trouble now.",
    "We parked the car ______ front of the house.",
  ], 2, "정답: ② into. 나머지는 in. (답지 03)"));
  ex.add(mc(4, "다음 중 짝지어진 대화가 어색한 것은?", [
    "A: Let's play a board game together. B: Yes, you can.",
    "A: How about picking up trash? B: Sounds good.",
    "A: What about eating a sandwich? B: I'm not sure about that.",
    "A: Why don't we go for a walk? B: That's a good idea.",
    "A: What about planting some trees? B: Sounds good.",
  ], 1, "정답: ①. 제안에 Yes, you can.은 어색하다. (답지 04)"));
  ex.section("Section C · 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  ex.orderBank(5, "선생님을 위해 깜짝 파티를 열면 어떨까?\n보기: don't / a / throw / surprise / we / party / why / for / him", ["don't", "a", "throw", "surprise", "we", "party", "why", "for", "him"], "Why don't we throw a surprise party for him", "정답: Why don't we throw a surprise party for him? (답지 05)");
  ex.section("Section D · 영작", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(8, "to부정사를 보어로 하여 문장 전체를 쓰시오.\n나의 계획은 프랑스어를 배우는 것이다.", ["My plan is to learn French."], "정답: My plan is to learn French. (답지 08)"));
  ex.add(sentence(13, "다음을 문장 전체로 쓰시오.\n나는 내년에 너를 방문하겠다고 약속한다.", ["I promise to visit you next year."], "정답: I promise to visit you next year. (답지 13)"));
  ex.section("Section E · 본문", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(19, "지구 표면의 많은 부분을 덮고 있는 소금기 있는 물. 영어 단어를 쓰시오.", ["ocean"], "정답: ocean. (답지 19)"));
  [6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25].forEach((n) => ex.omit(n, "모의고사 답 칸이 OCR에서 비었거나 보기 순서를 확정하지 못함"));
});

build("u07", "mock-high", "고득점 모의고사", "pp.176-179", (ex) => {
  ex.section("Section A · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(1, "~처럼 보이다, ~와 닮다. 답지 표현을 쓰시오.", ["looks like", "look like"], "정답: looks like. (답지 pp.176-179 01)"));
  ex.add(fill(9, "제안에 긍정으로 답하는 말을 쓰시오.", ["That's a good idea.", "That's a good idea"], "정답: That's a good idea. (답지 09)"));
  ex.add(fill(13, "틀린 말을 바른 말로만 쓰시오.\nto go*ing*", ["to go"], "정답: to go*ing* → to go. (답지 13)"));
  ex.add(fill(25, "틀린 말을 바른 말로만 쓰시오.\nwas", ["were"], "정답: was → were. (답지 25)"));
  ex.section("Section B · 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(5, "바다 동물들이 걱정된다는 문장 전체를 쓰시오.", ["I'm worried about the sea animals.", "I am worried about the sea animals."], "정답: I'm worried about the sea animals. (답지 05)"));
  ex.add(sentence(11, "책을 읽는 것은 매우 중요하다. to부정사 주어로 문장 전체를 쓰시오.", ["To read books is very important."], "정답: To read books is very important. (답지 11)"));
  ex.add(sentence(21, "그 여행은 얼마나 긴지! How 감탄문으로 문장 전체를 쓰시오.", ["How long the journey is!"], "정답: How long the journey is! (답지 21)"));
  [2, 3, 4, 6, 7, 8, 10, 12, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24].forEach((n) => ex.omit(n, "고득점 보기 영어 순서가 OCR에서 확정되지 않음"));
});

/* X-10 L07 */
const X07_DIALOGS = [
  [1, D07[0][1], ["Look", "at", "big", "island", "ocean", "this", "all", "worried", "about", "sea", "eat", "plastic", "waste", "get"], "X-10 답지 pp.32-33 01"],
  [2, D07[1][1], ["look", "What's", "wrong", "English", "speaking", "see", "front", "people", "always", "hard", "me"], "X-10 02"],
  [3, D07[2][1], ["beautiful", "night", "is", "birds", "Why", "bright", "cannot", "sleep"], "X-10 03"],
  [4, D07[3][1], ["What", "drawing", "poster", "polar", "ice", "look", "sad", "They", "losing", "homes", "right", "need", "something", "much", "time"], "X-10 04"],
  [5, D07[4][1], ["Look", "design", "concert", "cool", "print", "around", "waste", "paper", "post", "good", "idea"], "X-10 05"],
  [6, D07[5][1], ["Tomorrow", "last", "go", "back", "feel", "really", "liked", "throw", "surprise", "Great", "prepare", "together"], "X-10 06"],
  [7, D07[6][1], ["too", "much", "classroom", "need", "recycle", "ideas", "make", "fun", "put", "Sounds"], "X-10 07"],
  [8, D07[7][1], ["bag", "pretty", "made", "old", "Earth", "cool", "want", "short", "video", "reusing"], "X-10 08"],
  [9, D07[8][1], ["Look", "trash", "beach", "is", "lot", "big", "problem", "worried"], "X-10 09"],
  [10, D07[9][1], ["Friday", "Mom's", "want", "give", "special", "Sounds", "have", "make", "video", "family", "will", "love"], "X-10 10"],
];

build("u07", "x10-vocab", "어휘 확인 문제", "X-10 pp.30-31", (ex) => {
  ex.section("Section A · 영어→우리말", "다음 영어와 같은 뜻의 우리말을 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs([
    ["beautiful", "아름다운"], ["ocean", "대양"], ["cool", "멋진"], ["draw", "그리다"], ["sadly", "슬프게도"],
    ["plastic", "플라스틱"], ["free", "자유롭게 하다"], ["bring", "가져오다"], ["beach", "해변"], ["finally", "마침내"],
    ["turtle", "거북이"], ["Earth", "지구"], ["light", "가벼운"], ["storm", "폭풍"], ["island", "섬"],
    ["jean", "청바지"], ["arrive", "도착하다"], ["concert", "콘서트"], ["hope", "희망하다"], ["wind", "바람"],
  ]));
  ex.section("Section B · 우리말→영어", "다음 우리말과 같은 뜻의 영어를 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs([
    ["계단", "stairs"], ["도전", "challenge"], ["밝은", "bright"], ["사고", "accident"], ["쓰레기", "waste"],
    ["차례", "turn"], ["파도", "wave"], ["결정하다", "decide"], ["거대한", "giant"], ["선택하다", "choose"],
    ["쉬운", "easy"], ["공장", "factory"], ["게시하다", "post"], ["인쇄하다", "print"], ["웹사이트", "website"],
    ["도착하다", "reach, arrive"], ["재사용하다", "reuse"], ["재활용하다", "recycle"], ["오래가다", "last"], ["잃다", "lose"],
  ]));
  ex.section("Section C · 표현", "다음 영어 표현과 같은 뜻의 우리말을 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs([
    ["get sick", "병에 걸리다"], ["throw a party", "파티를 열다"], ["in the middle of", "~의 한가운데에"],
    ["polar bear", "북극곰"], ["find out", "알아내다"], ["fall into", "~에 빠지다"], ["one day", "어느 날"],
    ["last long", "오래 지속되다"], ["make with", "~로 만들다"], ["clean up", "청소하다"],
  ]));
  ex.section("Section D · 우리말 표현", "다음 우리말 표현과 같은 뜻의 영어를 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs([
    ["많은 시간", "much time"], ["게시하다", "put up"], ["곤경에 처한", "in trouble"], ["~을 갈라놓다", "take apart"],
    ["노인", "old man"], ["~의 앞에", "in front of"], ["~에 대해 생각하다", "think about"], ["많은", "a lot of"],
    ["말하기 시험", "speaking test"], ["~ 때문에", "because of"],
  ]));
  ex.section("Section E · 보기", "보기에서 알맞은 단어를 누르시오.", CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  const bankE = ["ocean", "cool", "sadly", "free", "bring", "finally", "light", "island", "arrive", "hope"];
  [
    [1, "The Pacific is the largest ______ in the world.", "ocean"],
    [2, "That's a really ______ jacket you're wearing!", "cool"],
    [3, "The birds were set ______ from their cages.", "free"],
    [4, "______, after hours of waiting, the bus arrived.", "finally"],
    [5, "We're planning to visit a tropical ______ for our vacation.", "island"],
    [6, "What time does your flight ______ tomorrow?", "arrive"],
    [7, "______ we can meet again soon.", "hope"],
  ].forEach((r) => ex.add(mc(r[0], "보기에서 알맞은 단어를 고르시오.\n" + r[1] + "\n보기: " + bankE.join(", "), bankE, bankE.indexOf(r[2]) + 1, "정답: " + r[2] + " (X-10 어휘 E)")));
  ex.section("Section F · 영영풀이 단어", "영영풀이에 해당하는 영어 단어만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [1, "to stop having something that is important to you", "lose"],
    [2, "pleasing to the sense or mind; having beauty", "beautiful"],
    [3, "a raised line of water that moves across the surface of a body of water", "wave"],
    [4, "the planet we live on", "Earth"],
    [5, "very bad weather with strong winds and usually rain, thunder, or snow", "storm"],
    [6, "an unfortunate and unplanned event", "accident"],
    [7, "to want something to happen and think that it could happen", "hope"],
    [8, "to pick one or more from a group", "choose"],
    [9, "to make something new from something used before", "recycle"],
    [10, "to continue to exist or happen", "last"],
  ].forEach((r) => ex.add(fill(r[0], r[1], [r[2]], "정답: " + r[2] + " (X-10 F, 뜻은 본책 확인 문제와 같음)")));
  ex.section("Section G · 뜻", "그 영어 단어의 우리말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  [
    ["lose", "잃다"], ["beautiful", "아름다운"], ["wave", "파도"], ["Earth", "지구"], ["storm", "폭풍"],
    ["accident", "사고"], ["hope", "희망하다"], ["choose", "선택하다"], ["recycle", "재활용하다"], ["last", "오래가다"],
  ].forEach((r, i) => ex.add(fill("F" + (i + 1) + "k", r[0] + "의 우리말을 쓰시오.", [r[1]], "정답: " + r[1] + " (X-10 F 뜻)")));
  ex.section("Section H · Words Plus", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [1, "______ : dark = hope : despair", "bright"],
    [2, "easy : easily = sad : ______", "sadly"],
    [3, "plant : ______ = beach : shore", "factory"],
    [4, "ocean : sea = ______ : eco-friendly", "green"],
    [5, "final : ______ = beautiful : beautifully", "finally"],
    [6, "depart (반의어)", "arrive"],
    [7, "hard (반의어)", "easy"],
    [8, "waste (유의어)", "trash"],
    [9, "huge (유의어)", "giant"],
    [10, "heavy (반의어)", "light"],
  ].forEach((r) => ex.add(fill(r[0], "Words Plus+\n" + r[1], [r[2]], "정답: " + r[2] + " (X-10 Words Plus+)")));
});

build("u07", "x10-dialog-cloze", "대화 빈칸 완성하기", "X-10 pp.32-33", (ex) => {
  ex.section("Section A · 한 칸", "이 칸에 들어갈 말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  X07_DIALOGS.forEach((d) => ex.splitWords(d[0], "대화 " + d[0], d[1], d[2], d[3]));
});

build("u07", "x10-dialog-write", "대화 영작하기", "X-10 pp.34-35", (ex) => {
  ex.section("Section A · 대화 전체", "다음 대화를 영어 문장으로 쓰시오. 화자 표시 W:/M:를 포함해 쓰시오.", SENT.ruleKo, "sentence", SENT.answerModeTag);
  const kos = [
    "여자: 바다에 있는 큰 플라스틱 섬을 봐. 남자: 오, 이게 모두 플라스틱이야? 여자: 응. 난 바다 동물들이 걱정돼. 남자: 나도. 그들이 플라스틱 쓰레기를 먹고 병에 걸릴 수 있어.",
    "남자: 너 걱정돼 보여. 무슨 일이야? 여자: 영어 말하기 시험이 걱정돼. 남자: 아, 그렇구나. 사람들 앞에서 말하는 것은 쉽지 않지. 여자: 응, 나한테는 항상 어려워.",
    "남자: 서울은 밤에 정말 아름다워. 여자: 응, 그래. 하지만 난 새들이 걱정돼. 남자: 왜? 여자: 밤새도록 밝아서 새들이 잠을 잘 수가 없어.",
    "남자: Jessica, 뭘 그리고 있어? 여자: 북극곰에 대한 포스터를 그리고 있어. 남자: 얼음 위의 북극곰들이 너무 슬퍼 보여. 여자: 그들은 집을 잃어가고 있어. 남자: 우리가 그들을 위해 뭔가를 해야 해. 여자: 그들에게 시간이 별로 없을지도 몰라.",
    "남자: 이게 우리 콘서트 포스터 디자인이야. 여자: 멋지다. 인쇄해서 학교 주변에 붙이자. 남자: 그건 종이 낭비야. 학교 웹사이트에 게시하는 게 어때? 여자: 좋은 생각이야.",
    "남자: 내일은 Green 선생님의 학교 마지막 날이야. 미국으로 돌아가실 거야. 여자: 너무 슬퍼. 그 분의 수업을 정말 좋아했어. 남자: 깜짝 파티를 열면 어떨까? 여자: 함께 준비하자.",
    "남자: 교실에 플라스틱 쓰레기가 너무 많아. 여자: 더 많이 재활용해야 해. 남자: 재미있는 재활용 상자를 만들어 교실에 놓자. 여자: 좋은 생각 같아.",
    "남자: Jessica, 네 가방 예쁘다. 여자: 오래된 청바지로 만들었어. 지구의 날 프로젝트야. 남자: 나도 지구의 날에 뭔가 하고 싶어. 여자: 오래된 옷을 재사용하는 짧은 동영상을 함께 만들자.",
    "남자: 해변의 쓰레기를 봐. 여자: 쓰레기가 많아. 남자: 큰 문제야. 여자: 바다 동물들이 걱정돼.",
    "여자: 이번 주 금요일이 엄마 생신이야. 특별한 선물을 드리고 싶어. 남자: 좋은 생각이 있니? 여자: 가족 사진으로 비디오를 만들자. 남자: 엄마가 좋아하실 거야.",
  ];
  D07.forEach((d, i) => ex.add(sentence(i + 1, (i + 1) + " " + kos[i], [d[1], d[1].replace(/\n/g, " ")], "정답은 X-10 대화 영작하기 " + (i + 1) + "번 대화.")));
});

build("u07", "x10-grammar", "핵심 Grammar 확인 문제", "X-10 pp.36-37", (ex) => {
  ex.section("Section A · to부정사", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [1, "I wanted ______, but I couldn't.", "to help"],
    [2, "I hope ______ them all someday.", "to see"],
    [3, "Dana plans ______ to the library today.", "to go"],
    [4, "Eric wants ______ shopping today.", "to go"],
    [5, "Taeho learned ______ a cake yesterday.", "to bake"],
    [6, "Jason plans ______ math on Friday.", "to study"],
    [7, "Amy decided ______ every morning.", "to exercise"],
    [8, "I want ______ to a concert with Lisa.", "to go"],
    [9, "I want ______ swimming with Junho.", "to go"],
    [10, "I plan ______ my bike to school every day.", "to ride"],
  ].forEach((r) => ex.add(fill(r[0], r[1], [r[2]], "정답: " + r[2] + " (X-10 Grammar Point 1)")));
  ex.section("Section B · 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  const more = [
    [11, "시험에 통과하는 것은 어렵다.", ["difficult", "is", "pass", "to", "test", "the"], "To pass the test is difficult"],
    [12, "그의 목표는 에베레스트산을 오르는 것이다.", ["climb", "Everest", "goal", "his", "is", "mount", "the", "to"], "His goal is to climb the mount Everest"],
    [13, "그녀는 바이올린을 연주하기를 원한다.", ["play", "she", "to", "the", "violin", "wants"], "She wants to play the violin"],
    [14, "그들은 그 제안을 받아들이지 않기로 결정했다.", ["accept", "decided", "not", "offer", "the", "they", "to"], "They decided not to accept the offer"],
    [15, "나는 내 남동생과 영화 보는 것을 좋아한다.", ["brother", "I", "movies", "like", "my", "to", "watch", "with"], "I like to watch movies with my brother"],
    [16, "건강을 유지하는 것은 행복의 시작이다.", ["happiness", "healthy", "of", "is", "start", "stay", "to", "the"], "To stay healthy is the start of happiness"],
    [17, "그녀는 가장 좋아하는 가수를 만나기를 희망한다.", ["hopes", "favorite", "her", "meet", "singer", "she", "to"], "She hopes to meet her favorite singer"],
    [18, "그녀는 엄마의 생일을 위해 케이크를 만들 계획이었다.", ["a", "cake", "for", "her", "make", "mom's", "birthday", "planned", "she", "to"], "She planned to make a cake for her mom's birthday"],
  ];
  more.forEach((r) => ex.orderBank(r[0], r[1], r[2], r[3], "정답: " + r[3] + ". (X-10 More)"));
  ex.section("Section C · 감탄문 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [19, "______ I am! (나는 얼마나 운이 좋은지!)", "How lucky"],
    [20, "______ journey! (정말 긴 여행이구나!)", "What a long"],
    [21, "______ day it is! (정말 아름다운 날이구나!)", "What a beautiful"],
    [22, "______ nose you have! (너는 정말 긴 코를 가졌구나!)", "What a long"],
    [23, "How fast ______! (너는 정말 빠르구나!)", "you are"],
    [24, "______ your hair is! (네 머리카락은 정말 길구나!)", "How long"],
    [25, "______ tasty apple it is!", "What a"],
    [26, "What a good friend ______!", "you are"],
    [27, "______ you are! (너는 정말 똑똑하구나!)", "How smart"],
    [28, "______ smile you have!", "What a beautiful"],
  ].forEach((r) => ex.add(fill(r[0], r[1], [r[2]], "정답: " + r[2] + " (X-10 Point 2)", true)));
  ex.section("Section D · 감탄문 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  [
    [29, "넌 정말 정직하구나!", ["you", "honest", "how", "are"], "How honest you are"],
    [30, "정말 잘생긴 소년들이구나!", ["they", "what", "boys", "are", "handsome"], "What handsome boys they are"],
    [31, "날씨가 정말 화창하구나!", ["day", "it", "what", "is", "a", "sunny"], "What a sunny day it is"],
    [32, "그 영화는 얼마나 흥미로웠는지!", ["interesting", "how", "the", "was", "movie"], "How interesting the movie was"],
    [33, "이것은 정말 맛있는 음식이구나!", ["delicious", "what", "this", "food", "a", "is"], "What a delicious food this is"],
    [34, "그녀가 얼마나 빨리 달리는지!", ["she", "fast", "how", "runs"], "How fast she runs"],
    [35, "이것은 정말 흥미로운 책이구나!", ["book", "what", "this", "an", "is", "interesting"], "What an interesting book this is"],
    [36, "이것은 정말 아름다운 그림이구나!", ["painting", "what", "this", "a", "is", "beautiful"], "What a beautiful painting this is"],
  ].forEach((r) => ex.orderBank(r[0], r[1], r[2], r[3], "정답: " + r[3] + "! (X-10 Point 2 More)"));
});

const CLOZE07 = [
  ["Hi! I am a plastic duck and I am a bath toy.", ["am", "plastic", "am", "bath"]],
  ["But look! I am not in a bathroom.", ["look", "am", "in"]],
  ["I am in the middle of the ocean.", ["am", "in", "middle", "ocean"]],
  ["How did I get here?", ["How", "did", "get"]],
  ["I was from a factory with other ducks.", ["was", "from", "factory", "other"]],
  ["People made us with plastic because it is light and lasts long.", ["made", "plastic", "is", "light", "lasts", "long"]],
  ["People put us in boxes and we went out to sea.", ["put", "in", "boxes", "went", "out", "sea"]],
  ["But the boxes fell into the ocean in an accident.", ["boxes", "fell", "into", "ocean", "in", "accident"]],
  ["Luckily, we could get out of the boxes.", ["Luckily", "could", "get", "out", "boxes"]],
  ["The wind was strong, so the waves took us apart.", ["wind", "was", "strong", "waves", "took", "apart"]],
  ["In the ocean, I met a lot of sea animals.", ["In", "ocean", "met", "lot", "sea"]],
  ["But many of them were in trouble.", ["many", "were", "in", "trouble"]],
  ["One time, I met a sea turtle in a fishing net.", ["One", "met", "sea", "in", "fishing"]],
  ["\"Get me out of this,\" the sea turtle cried.", ["Get", "out", "sea", "cried"]],
  ["I wanted to help, but I couldn't.", ["wanted", "help", "couldn't"]],
  ["I was so sad.", ["was", "so", "sad"]],
  ["Then the waves took me to a giant trash island.", ["Then", "waves", "took", "giant", "trash"]],
  ["I saw a lot of plastic waste.", ["saw", "lot", "plastic", "waste"]],
  ["I wanted to get out of there.", ["wanted", "get", "out"]],
  ["One day, a strong storm freed me.", ["One", "day", "strong", "storm", "freed"]],
  ["After weeks, I finally reached land.", ["After", "finally", "reached", "land"]],
  ["There were a lot of people at the beach.", ["were", "lot", "at", "beach"]],
  ["Oh, someone picked me up.", ["someone", "picked", "up"]],
  ["\"Where am I going now?,\" I thought.", ["Where", "am", "going", "thought"]],
  ["What a long journey!", ["long", "journey"]],
  ["I am finally in a bathtub with this boy, Mike.", ["am", "finally", "in", "bathtub"]],
  ["How lucky I am!", ["How", "lucky", "am"]],
  ["But sometimes I think about my other duck friends.", ["sometimes", "about", "other"]],
  ["Are they still in the ocean?", ["Are", "still", "in", "ocean"]],
  ["I hope to see them all someday.", ["hope", "see", "all"]],
];
const SENT07_BANK = [
  [["bath", "toy", "plastic", "duck"], ["plastic", "duck", "bath", "toy"], "Hi! I am a ______ and I am a ______."],
  [["look", "in", "bathroom", "am"], ["look", "am", "in", "bathroom"], "But ______! I ______ not ______ a ______."],
  [["ocean", "am", "middle"], ["am", "middle", "ocean"], "I ______ in the ______ of the ______."],
  [["get", "here", "did", "I"], ["did", "I", "get", "here"], "How ______ ______ ______ ______?"],
  [["factory", "ducks", "was"], ["was", "factory", "ducks"], "I ______ from a ______ with other ______."],
  [["us", "long", "lasts", "made", "plastic", "light", "is"], ["made", "us", "plastic", "is", "light", "lasts", "long"], "People ______ ______ with ______ because it ______ ______ and ______ ______."],
  [["sea", "us", "went", "boxes", "put", "out"], ["put", "us", "boxes", "went", "out", "sea"], "People ______ ______ in ______ and we ______ ______ to ______."],
  [["accident", "fell", "ocean"], ["fell", "ocean", "accident"], "But the boxes ______ into the ______ in an ______."],
  [["boxes", "could", "get"], ["could", "get", "boxes"], "Luckily, we ______ ______ out of the ______."],
  [["apart", "wind", "took", "waves", "us", "strong"], ["wind", "strong", "waves", "took", "us", "apart"], "The ______ was ______, so the ______ ______ ______ ______."],
  [["animals", "met", "sea", "lot"], ["met", "lot", "sea", "animals"], "In the ocean, I ______ a ______ of ______ ______."],
  [["were", "them", "many", "trouble"], ["many", "them", "were", "trouble"], "But ______ of ______ ______ in ______."],
  [["turtle", "time", "met", "fishing", "sea", "net"], ["time", "met", "sea", "turtle", "fishing", "net"], "One ______, I ______ a ______ ______ in a ______ ______."],
  [["me", "cried", "this", "get"], ["Get", "me", "this", "cried"], "\"______ ______ out of ______,\" the sea turtle ______."],
  [["couldn't", "help", "wanted"], ["wanted", "help", "couldn't"], "I ______ to ______, but I ______."],
  [["sad", "was"], ["was", "sad"], "I ______ so ______."],
  [["me", "trash", "island", "waves", "took"], ["waves", "took", "me", "trash", "island"], "Then the ______ ______ ______ to a giant ______ ______."],
  [["waste", "plastic", "saw", "lot"], ["saw", "lot", "plastic", "waste"], "I ______ a ______ of ______ ______."],
  [["wanted", "there", "get"], ["wanted", "get", "there"], "I ______ to ______ out of ______."],
  [["day", "me", "freed", "storm"], ["day", "storm", "freed", "me"], "One ______, a strong ______ ______ ______."],
  [["land", "weeks", "reached"], ["weeks", "reached", "land"], "After ______, I finally ______ ______."],
  [["lot", "were", "people", "beach"], ["were", "lot", "people", "beach"], "There ______ a ______ of ______ at the ______."],
  [["picked", "up", "me"], ["picked", "me", "up"], "Oh, someone ______ ______ ______."],
  [["am", "now", "going", "thought", "I"], ["am", "I", "going", "now", "thought"], "\"Where ______ ______ ______ ______?,\" I ______."],
  [["long", "journey"], ["long", "journey"], "What a ______ ______!"],
  [["bathtub", "am", "boy"], ["am", "bathtub", "boy"], "I ______ finally in a ______ with this ______, Mike."],
  [["am", "lucky"], ["lucky", "am"], "How ______ I ______!"],
  [["friends", "duck", "think"], ["think", "duck", "friends"], "But sometimes I ______ about my other ______ ______."],
  [["ocean", "they", "are"], ["Are", "they", "ocean"], "______ ______ still in the ______?"],
  [["see", "them", "hope"], ["hope", "see", "them"], "I ______ to ______ ______ all someday."],
];

build("u07", "x10-reading-sentence", "Reading 문장 완성하기", "X-10 pp.38-39", (ex) => {
  ex.section("Section A · 보기 순서", "보기 단어를 빈칸 순서대로 누르시오.", ORDER.ruleKo, "order", ORDER.answerModeTag);
  SENT07_BANK.forEach((row, i) => {
    ex.orderBank(i + 1, (i + 1) + " " + KO07[i] + "\n" + row[2], row[0], row[1].join(" "), "정답: " + row[1].join(", ") + " (X-10 Reading 문장 완성하기)");
  });
});

build("u07", "x10-reading-cloze", "Reading 빈칸 완성하기", "X-10 pp.40-41", (ex) => {
  ex.section("Section A · 한 칸", "이 칸에 들어갈 말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  CLOZE07.forEach((row, i) => ex.splitWords(i + 1, "문장 " + (i + 1), row[0], row[1], "X-10 Reading 빈칸 " + (i + 1)));
});

build("u07", "x10-review", "핵심 문장 Review", "X-10 pp.42-43", (ex) => {
  ex.section("Section A · T/F", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
  [
    [1, "In the ocean, the plastic duck met a lot of sea animals.", "T"],
    [2, "\"Where am I going now?,\" the duck thought.", "T"],
    [3, "There were a few people at the beach.", "F"],
    [4, "One day, a weak storm freed the duck.", "F"],
    [5, "Luckily, plastic ducks could get out of the boxes.", "T"],
    [6, "After weeks, the duck finally reached island.", "F"],
    [7, "Then the waves took the duck to a giant trash island.", "T"],
  ].forEach((r) => ex.add(tf(r[0], r[1], r[2], "정답: " + r[2] + " (X-10 Review A)")));
  ex.section("Section B · O/X", "밑줄이 맞으면 O, 틀리면 X를 누르시오. X이면 고친 말만 쓰시오.", "O 또는 X를 누르세요. X이면 고친 말만 쓰세요.", "ox", "OX · 맞으면 O");
  const ox = [
    [1, "One time, I meeted a sea turtle in a fishing net.", "X", ["met"], "meeted → met"],
    [2, "I am in the middle of the ocean.", "O", null, "맞는 문장"],
    [3, "People made us with plastic because it is light and lasting long.", "X", ["lasts"], "lasting → lasts"],
    [4, "But many of they were in trouble.", "X", ["them"], "they → them"],
    [5, "How luck I am!", "X", ["lucky"], "luck → lucky"],
    [6, "I wanted helping, but I couldn't.", "X", ["to help"], "helping → to help"],
    [7, "I saw a lot of plastic waste.", "O", null, "맞는 문장"],
  ];
  ox.forEach((r) => ex.add({
    type: "ox", sourceId: r[0], promptEn: r[1], oxMark: r[2],
    rewriteAccept: r[3] || undefined, explainKo: "정답: " + r[2] + " " + r[4] + " (X-10 Review B)",
  }));
  ex.section("Section C · 형태", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  [
    [8, "The wind was strong, so the waves took (we) apart.", "The wind was strong, so the waves took us apart."],
    [9, "But many of (they) were in trouble.", "But many of them were in trouble."],
    [10, "I wanted (get) out of there.", "I wanted to get out of there."],
    [11, "(Lucky), we could get out of the boxes.", "Luckily, we could get out of the boxes."],
    [12, "But the boxes (fall) into the ocean in an accident.", "But the boxes fell into the ocean in an accident."],
    [13, "Hi! I am a plastic duck but I am a bath toy.", "Hi! I am a plastic duck and I am a bath toy."],
    [14, "There was a lot of people at the beach.", "There were a lot of people at the beach."],
    [15, "I am finally in a bathtub with these boy, Mike.", "I am finally in a bathtub with this boy, Mike."],
    [16, "\"Where I am going now?,\" I thought.", "\"Where am I going now?,\" I thought."],
    [17, "Then the waves took me to a giant trash island*s*.", "Then the waves took me to a giant trash island."],
  ].forEach((r) => ex.add(sentence(r[0], "괄호 또는 틀린 곳을 고쳐 문장 전체를 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2] + " (X-10 Review C·D)")));
});

function finalStub(unit, id, title, pages, noteItems) {
  build(unit, id, title, pages, (ex) => {
    ex.section("Section A · 답지가 문장으로 남은 문항", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
    noteItems.forEach((item) => {
      if (item.kind === "sentence") ex.add(sentence(item.n, item.prompt, item.accept, item.explain));
      else if (item.kind === "fill") ex.add(fill(item.n, item.prompt, item.accept, item.explain, true));
      else if (item.kind === "mc") ex.add(mc(item.n, item.prompt, item.choices, item.index, item.explain));
    });
    ex.omit("rest", "최종점검 본문 선택지가 두 단 OCR이라 답 번호와 영어 보기를 한 줄로 확정하지 못한 번호는 넣지 않았습니다.");
  });
}

finalStub("u07", "final-1", "최종점검 모의고사 1회", "X-10 pp.84-87", [
  { kind: "fill", n: 1, prompt: "‘물건이 만들어지는 건물’에 해당하는 단어를 f로 시작하여 쓰시오.", accept: ["factory"], explain: "정답: factory. (Lesson 07 최종 1회 01)" },
  { kind: "fill", n: 3, prompt: "‘~ 앞에’를 영어로 쓰시오.", accept: ["in front of"], explain: "정답: in front of. (최종 1회 03)" },
  { kind: "sentence", n: 9, prompt: "집이 정말 크구나! How 감탄문으로 문장 전체를 쓰시오.", accept: ["How big the house is!"], explain: "정답: How big the house is! (최종 1회 09)" },
  { kind: "sentence", n: 13, prompt: "(1) 나는 과자와 물을 가져갈 계획이다.", accept: ["I plan to bring snacks and water."], explain: "정답: I plan to bring snacks and water. (최종 1회 13)" },
  { kind: "sentence", n: "13-2", prompt: "(2) 나는 그들과 멋진 추억을 만들고 싶다.", accept: ["I want to make great memories with them."], explain: "정답: I want to make great memories with them. (최종 1회 13)" },
  { kind: "sentence", n: 24, prompt: "나는 그들 모두를 언젠가 보기를 바란다.", accept: ["I hope to see them all someday."], explain: "정답: I hope to see them all someday. (최종 1회 24)" },
]);
finalStub("u07", "final-2", "최종점검 모의고사 2회", "X-10 pp.88-91", [
  { kind: "fill", n: 3, prompt: "깜짝 파티를 열다. 동사만 쓰시오.", accept: ["throw"], explain: "정답: throw. (Lesson 07 최종 2회 03)" },
  { kind: "sentence", n: "12-1", prompt: "(1) 그녀는 매일 운동하기로 결심한다. 문장 전체를 쓰시오.", accept: ["She decides to exercise every day."], explain: "정답: decides to exercise every day. (최종 2회 12 (1))" },
  { kind: "sentence", n: "12-2", prompt: "(2) 그녀는 아침을 거르지 않기로 결심한다. 문장 전체를 쓰시오.", accept: ["She decides not to skip breakfast."], explain: "정답: decides not to skip breakfast. (최종 2회 12 (2))" },
  { kind: "sentence", n: 13, prompt: "그녀가 만드는 케이크는 정말 맛있구나! 문장 전체를 쓰시오.", accept: ["What a delicious cake she makes!"], explain: "정답: What a delicious cake she makes! (최종 2회 13)" },
  { kind: "fill", n: 15, prompt: "바다에 빠지다. 표현만 쓰시오.", accept: ["fell into the ocean"], explain: "정답: fell into the ocean. (최종 2회 15)" },
  { kind: "fill", n: 22, prompt: "There ______ a lot of people. 알맞은 동사만 쓰시오.", accept: ["were"], explain: "정답: were. (최종 2회 22)" },
  { kind: "sentence", n: 23, prompt: "정말 긴 여행이구나! 문장 전체를 쓰시오.", accept: ["What a long journey!"], explain: "정답: What a long journey! (최종 2회 23)" },
]);
finalStub("u07", "final-3", "최종점검 모의고사 3회", "X-10 pp.92-95", [
  { kind: "fill", n: 3, prompt: "불행하고 계획되지 않은 사건. 영어 단어를 쓰시오.", accept: ["accident"], explain: "정답: accident. (Lesson 07 최종 3회 03)" },
  { kind: "sentence", n: 8, prompt: "나는 바다 동물들이 걱정된다. 문장 전체를 쓰시오.", accept: ["I'm worried about the sea animals.", "I am worried about the sea animals."], explain: "정답: I'm worried about the sea animals. (최종 3회 08)" },
  { kind: "fill", n: 12, prompt: "틀린 말을 바른 말로만 쓰시오.\nHow", accept: ["What"], explain: "정답: How → What. (최종 3회 12)" },
  { kind: "sentence", n: "13-1", prompt: "(1) 그녀는 얼마나 빨리 말하는지! 문장 전체를 쓰시오.", accept: ["How quickly she speaks!"], explain: "정답: How quickly she speaks! (최종 3회 13 (1))" },
  { kind: "sentence", n: "13-2", prompt: "(2) 나는 기타 연주하는 법을 배우고 싶다. 문장 전체를 쓰시오.", accept: ["I want to learn how to play the guitar."], explain: "정답: I want to learn how to play the guitar. (최종 3회 13 (2))" },
  { kind: "fill", n: 21, prompt: "강한 바람과 비, 천둥, 눈이 따르는 매우 나쁜 날씨. 영어 단어를 쓰시오.", accept: ["storm"], explain: "정답: storm. (최종 3회 21)" },
  { kind: "sentence", n: 25, prompt: "나는 쓰레기를 주울 계획이다. 문장 전체를 쓰시오.", accept: ["I plan to pick up trash."], explain: "정답: I plan to pick up trash. (최종 3회 25)" },
]);

/* ===================== Lesson 08 ===================== */
const L08_A = [
  ["club", "동아리, 동호회"], ["holiday", "휴일"], ["prepare", "준비하다"], ["violin", "바이올린"],
  ["visit", "방문하다"], ["wear", "입다"], ["around", "주위에"], ["blind", "시각 장애인의"],
  ["finger", "손가락"], ["marathon", "마라톤"], ["movement", "움직임"], ["proud", "자랑스러운"],
  ["right", "오른쪽: 올바른"], ["stick", "지팡이"], ["through", "~를 통해"], ["try", "시도하다"],
  ["busy", "바쁜"], ["guide", "안내자"], ["rainy", "비가 오는"], ["umbrella", "우산"],
];
const L08_B = [
  ["음료", "drink"], ["주의 깊게", "carefully"], ["불다", "blow"], ["열심히; 어려운", "hard"],
  ["줄, 끈", "string"], ["스마트폰", "smartphone"], ["희망하다", "hope"], ["연습하다", "practice"],
  ["병원", "hospital"], ["눈 덮인", "snowy"], ["경주", "race"], ["재활용하다", "recycle"],
  ["기자", "reporter"], ["묶다", "tie"], ["우정", "friendship"], ["특별한", "special"],
  ["참여하다", "join"], ["반납하다", "return"], ["추측하다", "guess"], ["가르치다", "teach"],
];
const L08_C = [
  ["nursing home", "요양원"], ["cheer for", "~를 응원하다"], ["look for", "~를 찾다"],
  ["at last", "마침내"], ["finish line", "결승선"], ["sign up for", "~에 등록하다"],
  ["take pictures", "사진을 찍다"], ["in need", "어려움에 처한; ~이 필요한"], ["no way", "말도 안 돼"],
  ["run together", "함께 달리다"],
];
const L08_D = [
  ["낚시하러 가다", "go fishing"], ["도와주다", "help out"], ["최고의 날", "the best day"],
  ["동시에", "at the same time"], ["최선을 다하다", "do one's best"], ["서로", "each other"],
  ["~로 이동하다", "move to"], ["추측해보다", "take a guess"], ["확실히", "for sure"],
  ["도움을 주다", "give one's hand"],
];

build("u08", "vocab-check", "Vocabulary 확인 문제", "p.184", (ex) => {
  ex.section("Section A · 영어→우리말", "다음 영어와 같은 뜻의 우리말을 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs(L08_A));
  ex.section("Section B · 우리말→영어", "다음 우리말과 같은 뜻의 영어를 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs(L08_B));
  ex.section("Section C · 영어 표현", "다음 영어 표현과 같은 뜻의 우리말을 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs(L08_C));
  ex.section("Section D · 우리말 표현", "다음 우리말 표현과 같은 뜻의 영어를 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs(L08_D));
});

build("u08", "vocab-practice", "Vocabulary 실전 문제", "p.185", (ex) => {
  ex.section("Section A · 관계·영영", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(1, "hope : wish = reuse : ______", ["recycle"], "정답: recycle. 유의어. (답지 p.185 01)"));
  ex.add(fill(4, "마라톤에 등록하고 싶니?\nDo you want to ______ the marathon?", ["sign up for"], "정답: sign up for. (답지 04·06 해설의 for가 아니라 표현 전체 sign up for가 04 답)", true));
  ex.add(fill(7, "특별한 목적으로 쓰이는 길고 가는 나무 조각 → s______", ["stick"], "정답: stick. (답지 07)"));
  [2, 3, 5, 6].forEach((n) => ex.omit(n, "실전 보기 순서가 OCR에서 확정되지 않음"));
});

build("u08", "vocab-advanced", "Vocabulary 심화 문제", "pp.186-187", (ex) => {
  ex.section("Section A · 확인된 문항", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(4, "주말 동안을 영어로 쓰시오.", ["over the weekend"], "정답: over the weekend. (답지 04)", true));
  ex.add(fill(7, "공통된 관심사로 모이는 사람들의 모임. c로 시작하여 쓰시오.", ["club"], "정답: club. (답지 07)"));
  ex.add(fill(13, "주위에. 영어 한 단어를 쓰시오.", ["around"], "정답: around. (답지 13)"));
  ex.add(fill(14, "연습하다. 영어 한 단어를 쓰시오.", ["practice"], "정답: practice. (답지 14)"));
  ex.section("Section B · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  ex.add(mc(1, "다음 중 짝의 관계가 나머지와 다른 것은?", [
    "sun : sunny",
    "rain : rainy",
    "snow : snowy",
    "cloud : cloudy",
    "careful : carefully",
  ], 5, "정답: ⑤. careful:carefully는 형용사:부사. 나머지는 명사:형용사. (답지 01)"));
  [2, 3, 5, 6, 8, 9, 10, 11, 12].forEach((n) => ex.omit(n, "심화 보기 영어가 OCR에서 확정되지 않음"));
});

const D08 = [
  ["1", "M: I can't find my phone.\nW: Did you bring it home from school?\nM: Yes, I did. Can you look for my phone with me?\nW: Sure.", ["can't", "phone", "bring", "I", "did", "with", "Sure"]],
  ["2", "M: Where are you going, Joan?\nW: I'm going to the library.\nM: Then can you return a book for me?\nW: Sure.", ["Where", "library", "return", "book"]],
  ["3", "M: Susan, are you busy?\nW: Not really, Dad. Why?\nM: Can you buy some milk and eggs at the store?\nW: Okay.", ["busy", "really", "Why", "Can", "some", "at"]],
  ["4", "M: Can you help me, Lena?\nW: Sure, Dylan. What is it?\nM: Our club is going to send clothes and food to help others. Do you want to join us?\nW: Yes, of course. I can bring some clothes, too.\nM: Oh, great! Thank you.", ["help", "Sure", "What", "is", "it", "Our", "club", "help", "others", "want", "course", "can", "great"]],
  ["5", "W: Hi, James. What did you do last Sunday?\nM: I watched a movie called Black. It's about a blind girl and her teacher.\nW: Did you like the movie?\nM: Yes, I did. It was great.", ["What", "last", "movie", "called", "about", "teacher", "like", "great"]],
  ["6", "W: How was your weekend?\nM: Good. I went to a nursing home and helped out.\nW: What did you do?\nM: They couldn't use smartphones well. So I taught them.", ["How", "weekend", "Good", "nursing", "out", "What", "couldn't", "taught"]],
  ["7", "M: Did you have a good holiday?\nW: Yes. I visited my uncle in Sokcho.\nM: Sounds great. What did you do there?\nW: We went to the beach. The snowy beach was so beautiful.", ["holiday", "visited", "in", "great", "there", "beach", "was"]],
  ["8", "M: What did you do over the weekend, Lena?\nW: My family and I held a small concert at a children's hospital.\nM: A small concert? That's great.\nW: My dad played the violin, and my mom played the piano. I sang a few songs. It was the best day of the year.", ["over", "weekend", "family", "concert", "hospital", "concert", "played", "few", "day"]],
  ["9", "W: Jim, can you come and help me?\nM: Yes, Mom. What can I do for you?\nW: Can you take out the trash?\nM: Sure. No problem.", ["come", "can", "for", "take", "out", "trash", "Sure"]],
  ["10", "M: Did you have a good weekend, Amy?\nW: Yes. I went fishing with my family. How about you, Sam?\nM: I watched a movie with my friends.\nW: Sounds fun.", ["Did", "weekend", "fishing", "about", "movie", "Sounds"]],
];

build("u08", "dialog-detail", "Dialog 자세히 보기", "pp.190-191", (ex) => {
  ex.section("Section A · T/F", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
  [
    [1, "The man can find his phone.", "F", "남자는 전화기를 찾지 못한다. (답지 01 F)"],
    [2, "The man asks Joan to borrow a book for him.", "F", "빌리는 것이 아니라 반납을 부탁한다. (답지 02 F)"],
    [3, "Susan agrees to go to the store.", "T", "답지 03 T"],
    [4, "Dylan's club is collecting clothes and food to help others.", "T", "답지 04 T"],
    [5, "James watched a movie about a black girl last Sunday.", "F", "시각 장애 소녀에 관한 영화이다. (답지 05 F)"],
    [6, "The man taught the elderly how to use computers.", "F", "스마트폰 사용법을 가르쳤다. (답지 06 F)"],
    [7, "The woman visited her aunt in Sokcho.", "F", "삼촌을 방문했다. (답지 07 F)"],
    [8, "Lena sang songs during the concert.", "T", "답지 08 T"],
    [9, "Jim's mother asks him to take out the trash.", "T", "답지 09 T"],
    [10, "Sam watched a movie with his friends.", "T", "답지 10 T"],
  ].forEach((r) => ex.add(tf(r[0], r[1], r[2], r[3])));
});

const D08_BOOK = [
  ["find", "bring", "home", "school", "look", "for"],
  ["going", "going", "library", "return"],
  ["busy", "Not", "really", "buy", "milk", "eggs", "store"],
  ["help", "What", "club", "going", "send", "clothes", "join", "bring"],
  ["do", "last", "Sunday", "watched", "movie", "blind", "girl", "teacher", "like", "great"],
  ["weekend", "went", "nursing", "home", "helped", "did", "use", "smartphones", "taught"],
  ["good", "holiday", "visited", "uncle", "What", "did", "do", "went", "beach", "snowy", "beautiful"],
  ["do", "weekend", "family", "held", "small", "concert", "children's", "hospital", "great", "played", "violin", "piano", "sang", "songs", "best", "day", "year"],
  ["come", "help", "do", "take", "out", "trash", "problem"],
  ["good", "weekend", "went", "fishing", "family", "watched", "movie", "friends", "fun"],
];
build("u08", "dialog-complete", "Dialog 완성하기", "pp.192-193", (ex) => {
  ex.section("Section A · 한 칸", "이 칸에 들어갈 말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  D08.forEach((d, i) => ex.splitWords(d[0], "대화 " + d[0], d[1], D08_BOOK[i], "답지 pp.192-193"));
});

build("u08", "dialog-order", "Dialog 순서배열하기", "pp.194-195", (ex) => {
  ex.section("Section A · 대화 순서", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  D08.forEach((d) => {
    const lines = d[1].split("\n").map((line) => line.replace(/^[WM]:\s*/, ""));
    ex.sentenceOrder(d[0], d[0] + " 다음 대화를 순서대로 누르시오.", lines, "정답 대화 순서. (X-10 대화 영작하기 " + d[0] + ")");
  });
});

build("u08", "dialog-practice", "Dialog 실전 문제", "pp.196-197", (ex) => {
  ex.section("Section A · 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(7, "동아리가 옷과 음식을 보내는 이유를 영어 문장으로 쓰시오.", ["The club is sending clothes and food to help others."], "정답: The club is sending clothes and food to help others. (답지 07)"));
  ex.add(sentence(8, "과거의 경험을 물을 때 쓰는 질문을 문장으로 쓰시오.", ["How was your weekend?"], "정답: How was your weekend? (답지 08)"));
  [1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14].forEach((n) => ex.omit(n, "실전 보기 순서가 OCR에서 확정되지 않음"));
});

build("u08", "dialog-advanced", "Dialog 심화 문제", "pp.198-199", (ex) => {
  ex.section("Section A · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(9, "흐름상 어색한 조동사를 바른 말로만 쓰시오.\nThey could use smartphones well. (문맥: 잘 사용하지 못했다)", ["couldn't"], "정답: could → couldn't. (답지 09)"));
  ex.add(fill(13, "핸드폰을 함께 찾아 달라는 동사구만 쓰시오.\nCan you ______ my phone with me?", ["look for"], "정답: look for. (답지 pp.198-199 13 phone, look, for)", true));
  [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12].forEach((n) => ex.omit(n, "심화 보기 번호가 OCR에서 확정되지 않음"));
});

build("u08", "grammar-check", "Grammar 확인 문제", "pp.202-203", (ex) => {
  ex.section("Section A · to부정사", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [1, "I exercise every day ______ healthy. (be)", "to be"],
    [2, "The movie was interesting ______ . (watch)", "to watch"],
    [3, "I'm happy ______ that you got the job. (hear)", "to hear"],
    [4, "They traveled to Paris ______ the Eiffel Tower. (see)", "to see"],
    [5, "I went to the library ______ some books. (borrow)", "to borrow"],
  ].forEach((r) => ex.add(fill(r[0], r[1], [r[2]], "정답: " + r[2] + " (답지 p.202 A)")));
  ex.section("Section B · 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  ex.orderBank(6, "나는 그 소식을 듣고 놀랐다.", ["surprised", "to", "hear", "I", "the", "news", "was"], "I was surprised to hear the news", "정답: I was surprised to hear the news. (답지 B 01)");
  ex.orderBank(7, "그는 영어를 배우기 위해 미국에 갔다.", ["to", "went", "English", "he", "learn", "America", "to"], "He went to America to learn English", "정답: He went to America to learn English. (답지 B 02)");
  ex.orderBank(8, "그들은 콘서트를 보기 위해 일찍 도착했다.", ["to", "see", "they", "early", "arrived", "the", "concert"], "They arrived early to see the concert", "정답: They arrived early to see the concert. (답지 B 03)");
  ex.orderBank(9, "나는 그 문제를 해결하기 위해 열심히 노력했다.", ["tried", "the", "problem", "to", "solve", "hard", "I"], "I tried hard to solve the problem", "정답: I tried hard to solve the problem. (답지 B 04)");
  ex.orderBank(10, "그들은 길을 찾기 위해 나침반을 사용한다.", ["the", "compass", "find", "to", "they", "the", "way", "use"], "They use the compass to find the way", "정답: They use the compass to find the way. (답지 B 05)");
  ex.section("Section C · 고친 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  [
    [11, "I learn English to studied abroad.", "I learn English to study abroad."],
    [12, "I exercise every day to got healthy.", "I exercise every day to get healthy."],
    [13, "She was surprised seeing such a big dog.", "She was surprised to see such a big dog."],
    [14, "I was excited hearing about the promotion.", "I was excited to hear about the promotion."],
    [15, "He got up early to attending the meeting in time.", "He got up early to attend the meeting in time."],
  ].forEach((r) => ex.add(sentence(r[0], "틀린 곳을 고쳐 문장 전체를 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2] + " (답지 p.202 C)")));
  ex.section("Section D · that", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  [
    [16, "I believe [that / if] he is telling the truth.", ["that", "if"], 1],
    [17, "I hope [why / that] you arrive on time.", ["why", "that"], 2],
    [18, "I'm surprised to hear [that / how] you didn't know about it.", ["that", "how"], 1],
    [19, "The CEO says [what / that] we need to make changes.", ["what", "that"], 2],
    [20, "The fact [which / that] the sun rises in the east is true.", ["which", "that"], 2],
  ].forEach((r) => ex.add(mc(r[0], r[1], r[2], r[3], "정답: that. (답지 p.203 A)")));
  ex.section("Section E · that 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  ex.orderBank(21, "(exam / knew / passed / that / the / I / he)", ["exam", "knew", "passed", "that", "the", "I", "he"], "I knew that he passed the exam", "정답: I knew that he passed the exam. (답지 B 01)");
  ex.orderBank(22, "(be / that / tell / he / her / will / late)", ["be", "that", "tell", "he", "her", "will", "late"], "Tell her that he will be late", "정답: Tell her that he will be late. (답지 B 02)");
  ex.orderBank(23, "(interesting / is / movie / my / that / the / opinion / was)", ["interesting", "is", "movie", "my", "that", "the", "opinion", "was"], "My opinion is that the movie was interesting", "정답: My opinion is that the movie was interesting. (답지 B 03)");
  ex.orderBank(24, "(a / bought / that / heard / house / they / new / we)", ["a", "bought", "that", "heard", "house", "they", "new", "we"], "We heard that they bought a new house", "정답: We heard that they bought a new house. (답지 B 04)");
  ex.orderBank(25, "(fact / that / the / Earth / is / is / it / round / well-known / a)", ["fact", "that", "the", "Earth", "is", "is", "it", "round", "well-known", "a"], "It is a well-known fact that the Earth is round", "정답: It is a well-known fact that the Earth is round. (답지 B 05)");
  ex.section("Section F · 한 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  [
    [26, "It is raining. I can see it.", "I can see that it is raining."],
    [27, "The food tastes good. It is the fact.", "The fact is that the food tastes good."],
    [28, "The dog is barking. It is annoying.", "That the dog is barking is annoying."],
    [29, "The bus is late. I know it.", "I know that the bus is late."],
    [30, "My friend got a new job. The news made me happy.", "The news that my friend got a new job made me happy."],
  ].forEach((r) => ex.add(sentence(r[0], "that을 사용해 한 문장으로 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2] + " (답지 p.203 C)")));
});

build("u08", "grammar-practice", "Grammar 실전 문제", "pp.204-205", (ex) => {
  ex.section("Section A · 확인된 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  for (let n = 1; n <= 14; n++) ex.omit(n, "Grammar 실전 보기 순서가 OCR에서 확정되지 않음");
});

build("u08", "grammar-advanced", "Grammar 심화 문제", "pp.206-207", (ex) => {
  ex.section("Section A · 확인된 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  for (let n = 1; n <= 22; n++) ex.omit(n, "Grammar 심화 보기 순서가 OCR에서 확정되지 않음");
});

const L08_SENT = [
  [1, "I'm blind. I walk with a stick.", "나는 시각 장애인이야. 나는 지팡이를 이용해서 걸어."],
  [2, "One day, my homeroom teacher said, \"There will be a school event, Friendship Marathon.\"", "어느 날, 나의 담임 선생님이 말씀하셨어. ‘우정 마라톤’이라는 학교 행사가 있을 거야."],
  [3, "In this event, two people run as a team.", "이 행사에서는 두 사람이 한 팀으로 달려."],
  [4, "Everyone talked about it. I also got interested.", "모든 사람들이 그것에 대해 이야기했어. 나도 관심이 생겼어."],
  [5, "\"But can I run?\" I was not sure. So I talked about it with my best friend, Junha.", "하지만 내가 달릴 수 있을까? 나는 확신할 수 없었어. 그래서 나는 가장 친한 친구 준하와 그것에 대해 이야기했어."],
  [6, "He said, \"Don't worry! I'll run with you.\"", "그가 말했어. “걱정하지 마! 내가 너와 함께 달릴게.”"],
  [7, "On the day of the marathon, we tied a string around our fingers to feel each other's movement.", "마라톤 당일에, 우리는 서로의 움직임을 느끼기 위해 손가락에 끈을 묶었어."],
  [8, "I listened to him very carefully and ran with him.", "나는 그의 말을 매우 주의 깊게 들으며 그와 함께 달렸어."],
  [9, "The wind was blowing through me and it felt great!", "바람이 내게 불어오고 그 느낌이 정말 좋았어."],
  [10, "At the finish line, everyone cheered for us. I was proud of myself.", "결승선에서 모든 사람들이 우리를 응원했어. 나는 나 자신이 자랑스러웠어."],
  [11, "Before the marathon, I thought that I couldn't do it.", "마라톤 전에는 나는 그것을 할 수 없을 거라고 생각했어."],
  [12, "But now, I want to try other things. I think that I can try a bike ride next time.", "하지만 지금 나는 다른 것들을 시도하고 싶다. 다음에는 자전거 타기를 해볼 수 있다고 생각한다."],
  [13, "Andy and I signed up for Friendship Marathon. I was his guide runner.", "Andy와 나는 우정 마라톤에 등록했다. 나는 그의 가이드 러너였다."],
  [14, "We ran together every day with a string.", "우리는 끈을 가지고 매일 함께 달렸다."],
  [15, "I told him, \"Andy, a bike is coming. So let's move to the right.\"", "나는 그에게 말했다. “Andy, 자전거가 오고 있어. 그러니 오른쪽으로 움직이자.”"],
  [16, "As a team, we practiced hard to win the marathon.", "팀으로서 우리는 마라톤에서 우승하기 위해 열심히 연습했다."],
  [17, "During the marathon, I ran with Andy and guided him at the same time.", "마라톤 동안 나는 Andy와 달리며 동시에 그를 안내했다."],
  [18, "It was hard, but we didn't stop running.", "힘들었지만 우리는 달리기를 멈추지 않았다."],
  [19, "At last, we made it to the finish line.", "마침내 우리는 결승선에 도착했다."],
  [20, "We didn't win the race. But I knew that we did our best.", "우리는 경주에서 이기지 못했다. 하지만 최선을 다했다는 것을 알았다."],
  [21, "Finishing something was not easy for me. But this time I did it!", "무언가를 끝내는 것은 나에게 쉽지 않았다. 하지만 이번에는 해냈다."],
  [22, "I was very happy. Andy looked happy, too.", "나는 매우 기뻤다. Andy도 기뻐 보였다."],
];

build("u08", "reading-content", "Reading 내용 확인하기", "p.210", (ex) => {
  ex.section("Section A · 형태·뜻", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  const rows = [
    [1, "There (be) a school event, Friendship Marathon. 알맞은 형태를 쓰시오.", "will be"],
    [2, "Everyone talked about it. talked about의 우리말을 쓰시오.", "~에 대해 이야기하다"],
    [3, "I also got interested. got interested의 우리말을 쓰시오.", "관심을 갖게 되다"],
    [4, "I talked about it with Junha. it이 가리키는 말을 쓰시오.", "Friendship Marathon"],
    [5, "around (we) fingers. 알맞은 형태를 쓰시오.", "our"],
    [6, "fingers (feel) each other's movement. 알맞은 형태를 쓰시오.", "to feel"],
    [7, "The wind (blow) through me. 알맞은 형태를 쓰시오.", "was blowing"],
    [8, "The wind was blowing through me and it felt great. it이 가리키는 말을 쓰시오.", "the wind"],
    [9, "it felt great. feel의 쓰임을 우리말로 쓰시오.", "~하게 느끼다"],
    [10, "I was proud of myself. be proud of의 우리말을 쓰시오.", "~을 자랑스러워하다"],
    [11, "proud of (me). 알맞은 형태를 쓰시오.", "myself"],
    [12, "I want (try) other things. 알맞은 형태를 쓰시오.", "to try"],
    [13, "I think (what) I can try a bike ride. 알맞은 말을 쓰시오.", "that"],
    [14, "signed up for의 우리말을 쓰시오.", "~에 등록하다"],
    [15, "a bike (come). 알맞은 형태를 쓰시오.", "is coming"],
    [16, "at the same time의 우리말을 쓰시오.", "동시에"],
    [17, "It was hard의 It이 가리키는 것을 우리말로 쓰시오.", "앞문장 전체"],
    [18, "made it to의 우리말을 쓰시오.", "~에 도달하다"],
    [19, "did our best의 우리말을 쓰시오.", "최선을 다하다"],
    [20, "looked happy. 감각동사 뒤의 쓰임을 우리말로 쓰시오.", "~하게 보이다"],
  ];
  rows.forEach((r) => ex.add(fill(r[0], r[1], [r[2]], "정답: " + r[2] + " (답지 p.210)", String(r[2]).includes(" "))));
});

build("u08", "reading-lexgram", "Reading 적절한 어휘·어법 고르기", "p.211", (ex) => {
  ex.section("Section A · 괄호", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  const lex = [
    [1, "I'm [blindly / blind].", ["blindly", "blind"], 2, "blind"],
    [2, "my teacher [said / say]", ["said", "say"], 1, "said"],
    [3, "two people run [as / like] a team.", ["as", "like"], 1, "as"],
    [4, "I also [lost / got] interested.", ["lost", "got"], 2, "got"],
    [5, "I talked about [it / its] with my best friend.", ["it", "its"], 1, "it"],
    [6, "I'll run [with / against] you.", ["with", "against"], 1, "with"],
    [7, "each [other's / other] movement.", ["other's", "other"], 1, "other's"],
    [8, "very [careful / carefully]", ["careful", "carefully"], 2, "carefully"],
    [9, "The wind was [blowing / raining] through me.", ["blowing", "raining"], 1, "blowing"],
    [10, "proud [for / of] myself.", ["for", "of"], 2, "of"],
    [11, "I thought that I [should / couldn't] do it.", ["should", "couldn't"], 2, "couldn't"],
    [12, "I think that I [can / could] try a bike ride next time.", ["can", "could"], 1, "can"],
    [13, "We [signed up / signed down] for Friendship Marathon.", ["signed up", "signed down"], 1, "signed up"],
    [14, "We ran together [every / no] day.", ["every", "no"], 1, "every"],
    [15, "let's [moved / move] to the right.", ["moved", "move"], 2, "move"],
    [16, "practiced hard [to win / winning] the marathon.", ["to win", "winning"], 1, "to win"],
    [17, "[When / During] the marathon", ["When", "During"], 2, "During"],
    [18, "we [didn't / did] stop running.", ["didn't", "did"], 1, "didn't"],
    [19, "the [starting / finish] line", ["starting", "finish"], 2, "finish"],
    [20, "did our [best / worst]", ["best", "worst"], 1, "best"],
    [21, "[To finishing / Finishing] something was not easy", ["To finishing", "Finishing"], 2, "Finishing"],
    [22, "Andy [looked / sounded] happy, too.", ["looked", "sounded"], 1, "looked"],
  ];
  lex.forEach((r) => ex.add(mc(r[0], r[1], r[2], r[3], "정답: " + r[4] + " (답지 p.211)")));
});

build("u08", "reading-order", "Reading 순서배열하기", "pp.212-213", (ex) => {
  ex.section("Section A · 단어 순서", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  L08_SENT.forEach((row) => {
    const words = row[1].replace(/[“”"]/g, "").match(/[A-Za-z0-9']+/g);
    ex.orderBank(row[0], row[0] + " " + row[2], words.slice().reverse(), row[1].replace(/[“”"]/g, ""), "정답: " + row[1] + " (답지 pp.212-215)");
  });
});

build("u08", "reading-writing", "Reading 영작하기", "pp.214-215", (ex) => {
  ex.section("Section A · 영작", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  L08_SENT.forEach((row) => {
    const bare = row[1].replace(/[“”]/g, '"');
    ex.add(sentence(row[0], row[0] + " " + row[2], [bare, bare.replace(/[.!?]+$/, "")], "정답: " + row[1] + " (답지 pp.212-215)"));
  });
});

build("u08", "reading-practice", "Reading 실전 문제", "pp.216-219", (ex) => {
  ex.section("Section A · 확인된 문항", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(3, "it이 가리키는 학교 행사의 이름을 쓰시오.", ["Friendship Marathon"], "정답: Friendship Marathon. (답지 03)"));
  ex.add(fill(6, "그는 어떻게 걷나요? 영어 문장으로 쓰지 말고, 답지의 영어 문장을 쓰시오.", ["He walks with a stick."], "정답: He walks with a stick. (답지 06)", true));
  ex.add(fill(11, "다음에는 자전거를 타볼 수 있다고 생각한다. that절을 포함한 문장을 쓰시오.", ["I think that I can try a bike ride."], "정답: I think that I can try a bike ride. (답지 11)", true));
  ex.add(fill(13, "서로의 움직임을 한 단어로 쓰시오.", ["movement"], "정답: movement. (답지 13)"));
  ex.add(sentence(18, "우리는 마라톤에서 우승하기 위해 열심히 연습했다.", ["They practiced hard to win the marathon."], "정답: They practiced hard to win the marathon. (답지 18)"));
  ex.add(fill(20, "동시에. 영어 표현을 쓰시오.", ["at the same time"], "정답: at the same time. (답지 20)", true));
  [1, 2, 4, 5, 7, 8, 9, 10, 12, 14, 15, 16, 17, 19, 21, 22, 23, 24, 25].forEach((n) => ex.omit(n, "실전 보기 순서가 OCR에서 확정되지 않음"));
});

build("u08", "reading-advanced", "Reading 심화 문제", "pp.220-223", (ex) => {
  ex.section("Section A · 확인된 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(20, "우리는 경주에서 이기지 못했다. 하지만 최선을 다했다.", ["We didn't win the race. But I knew that we did our best."], "정답: We didn't win the race. But I knew that we did our best. (답지 본문 20)"));
  ex.add(sentence(25, "무언가를 끝내는 것은 그에게 쉽지 않았다. 예시 답안을 쓰시오.", ["Finishing something was not easy for him."], "정답 예시: Finishing something was not easy for him. (답지 25)"));
  for (let n = 1; n <= 24; n++) if (n !== 20) ex.omit(n, "심화 보기 순서가 OCR에서 확정되지 않음");
});

build("u08", "plus-practice", "Plus 기타 지문 실전 문제", "p.225", (ex) => {
  ex.section("Section A · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  ex.add(mc(1, "윗글의 빈칸 (A)에 들어갈 제목으로 알맞은 것은?", [
    "A Challenging Marathon",
    "Interview with Runners",
    "Overcoming Difficulties",
    "Preparing for a Race",
    "True Friendship in the Marathon",
  ], 5, "정답: ⑤ True Friendship in the Marathon. (답지 p.225 01)"));
  ex.add(mc(2, "밑줄 친 ⓐ–ⓔ의 의미가 바르게 짝지어지지 않은 것은?", [
    "ⓐ join: 참여하다",
    "ⓑ got interested: ~에 관심을 갖다",
    "ⓒ run together: 함께 달리다",
    "ⓓ hard: 열심히",
    "ⓔ made it to: ~에 도착하다",
  ], 4, "정답: ④. hard는 여기서 ‘어려운’. (답지 02)"));
  ex.add(mc(3, "윗글을 읽고 답할 수 없는 내용은?", [
    "Who is Andy?",
    "Who suggested running the marathon first?",
    "How did Andy and Junha run together?",
    "Did they finish the marathon?",
    "How long was the marathon?",
  ], 5, "정답: ⑤. 마라톤 길이는 나오지 않는다. (답지 03 ⑤)"));
  ex.section("Section B · 영작", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(6, "(A) 나는 우리가 다시 함께 달릴 수 있기를 바라.", ["I hope that we can run together again."], "정답: I hope that we can run together again. (답지 06)"));
  [4, 5].forEach((n) => ex.omit(n, "04·05 보기 영어가 OCR에서 확정되지 않음"));
});

build("u08", "writing-finish", "서술형 끝내기", "pp.226-229", (ex) => {
  ex.section("Section A · 확인된 서술", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(19, "나는 그것을 할 수 없을 거라고 생각했다.", ["I thought that I couldn't do it."], "정답: I thought that I couldn't do it. (답지 서술형 19)"));
  ex.add(sentence(18, "그들은 마라톤에서 우승하기 위해 열심히 연습했다.", ["They practiced hard to win the marathon."], "정답: They practiced hard to win the marathon. (답지 18)"));
  for (let n = 1; n <= 25; n++) if (n !== 18 && n !== 19) ex.omit(n, "서술형 끝내기 문항 줄이 두 단 OCR에서 답과 분리됨");
});

build("u08", "mock-100", "100발 100중 모의고사", "pp.230-233", (ex) => {
  ex.section("Section A · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(1, "sun : sunny = snow : ______", ["snowy"], "정답: snowy. (답지 pp.230-233 01)"));
  ex.section("Section B · 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(5, "그럼 나 대신 책을 반납해 줄래? 문장 전체를 쓰시오.", ["Then can you return a book for me?"], "정답: Then can you return a book for me? (답지 05)"));
  ex.add(sentence(8, "그는 더 잘 그리기 위해 열심히 연습했다. 문장 전체를 쓰시오.", ["He practiced hard to draw better."], "정답: He practiced hard to draw better. (답지 08)"));
  ex.add(sentence(13, "우리는 그들이 이길 것이라고 확신한다. 문장 전체를 쓰시오.", ["We are sure that they will win."], "정답: We are sure that they will win. (답지 13)"));
  ex.add(sentence(20, "그들은 끈을 가지고 함께 달렸다. 문장 전체를 쓰시오.", ["They ran together with a string."], "정답: They ran together with a string. (답지 20)"));
  ex.add(sentence(22, "우리는 결승선에 도착했다. 문장 전체를 쓰시오.", ["We made it to the finish line."], "정답: we made it to the finish line. (답지 22)"));
  ex.add(sentence(25, "고마워서 아이스크림을 주고 싶다. 문장 전체를 쓰시오.", ["I want to give you an ice cream to thank you."], "정답: I want to give you an ice cream to thank you. (답지 25)"));
  [2, 3, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 21, 23, 24].forEach((n) => ex.omit(n, "100발 모의 보기 순서가 OCR에서 확정되지 않음"));
});

build("u08", "mock-high", "고득점 모의고사", "pp.234-237", (ex) => {
  ex.section("Section A · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  ex.add(fill(1, "동시에. 영어 표현을 쓰시오.", ["at the same time"], "정답: at the same time. (답지 pp.234-237 01)", true));
  ex.add(fill(13, "틀린 말을 바른 말로만 쓰시오.\nwhat", ["that"], "정답: what → that. (답지 13)"));
  ex.section("Section B · 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  ex.add(sentence(5, "Susan은 가게에서 우유와 달걀을 살 것이다. 문장 전체를 쓰시오.", ["Susan will buy some milk and eggs at the store.", "She will buy some milk and eggs at the store."], "정답: She(Susan) will buy some milk and eggs at the store. (답지 05)"));
  ex.add(sentence(11, "그녀는 잊지 않으려고 그것을 적었다. 문장 전체를 쓰시오.", ["She wrote it down in order not to forget."], "정답: She wrote it down in order not to forget. (답지 11)"));
  ex.add(sentence(16, "나는 그것을 할 수 없을 거라고 생각했다. 문장 전체를 쓰시오.", ["I thought that I couldn't do it."], "정답: I thought that I couldn't do it. (답지 16)"));
  [2, 3, 4, 6, 7, 8, 9, 10, 12, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25].forEach((n) => ex.omit(n, "고득점 보기 순서가 OCR에서 확정되지 않음"));
});

/* X-10 L08 vocab */
build("u08", "x10-vocab", "어휘 확인 문제", "X-10 pp.44-45", (ex) => {
  ex.section("Section A · 영어→우리말", "다음 영어와 같은 뜻의 우리말을 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs([
    ["race", "경주"], ["carefully", "주의 깊게"], ["hospital", "병원"], ["tie", "묶다"], ["join", "참여하다"],
    ["teach", "가르치다"], ["hope", "희망하다"], ["string", "줄, 끈"], ["return", "반납하다"], ["hard", "열심히; 어려운"],
    ["snowy", "눈 덮인"], ["special", "특별한"], ["guess", "추측하다"], ["blow", "불다"], ["recycle", "재활용하다"],
    ["smartphone", "스마트폰"], ["drink", "음료"], ["practice", "연습하다"], ["friendship", "우정"], ["reporter", "기자"],
  ]));
  ex.section("Section B · 우리말→영어", "다음 우리말과 같은 뜻의 영어를 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs([
    ["지팡이", "stick"], ["손가락", "finger"], ["입다", "wear"], ["바이올린", "violin"], ["움직임", "movement"],
    ["~를 통해", "through"], ["오른쪽: 올바른", "right"], ["우산", "umbrella"], ["주위에", "around"], ["자랑스러운", "proud"],
    ["바쁜", "busy"], ["준비하다", "prepare"], ["방문하다", "visit"], ["휴일", "holiday"], ["안내자", "guide"],
    ["마라톤", "marathon"], ["시도하다", "try"], ["동아리, 동호회", "club"], ["시각 장애인의", "blind"], ["비가 오는", "rainy"],
  ]));
  ex.section("Section C · 표현", "다음 영어 표현과 같은 뜻의 우리말을 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs([
    ["do one's best", "최선을 다하다"], ["for sure", "확실히"], ["move to", "~로 이동하다"], ["children's clothes", "아동복"],
    ["at the same time", "동시에"], ["take a guess", "추측해보다"], ["each other", "서로"], ["help out", "도와주다"],
    ["give one's hand", "도움을 주다"], ["the best day", "최고의 날"],
  ]));
  ex.section("Section D · 우리말 표현", "다음 우리말 표현과 같은 뜻의 영어를 누르세요.", koEn("").ruleKo, "match", "Match · 짝 누르기");
  ex.matchPairs(pairs([
    ["사진을 찍다", "take pictures"], ["결승선", "finish line"], ["~를 찾다", "look for"], ["함께 달리다", "run together"],
    ["말도 안 돼", "no way"], ["~에 등록하다", "sign up for"], ["마침내", "at last"], ["요양원", "nursing home"],
    ["어려움에 처한", "in need"], ["~를 응원하다", "cheer for"],
  ]));
  ex.section("Section E · 보기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
  const bank = ["tie", "join", "teach", "hope", "return", "hard", "special", "guess", "blow", "recycle"];
  [
    [1, "I want to ______ the school choir this year.", "join"],
    [2, "My sister plans to ______ English in Korea.", "teach"],
    [3, "We ______ to see you at the party tonight.", "hope"],
    [4, "Please ______ the library books by Friday.", "return"],
    [5, "Let me ______ what you're thinking.", "guess"],
    [6, "The wind will ______ strongly tomorrow.", "blow"],
    [7, "It's important to ______ plastic bottles.", "recycle"],
  ].forEach((r) => ex.add(mc(r[0], r[1], bank, bank.indexOf(r[2]) + 1, "정답: " + r[2] + " (X-10 E)")));
  ex.section("Section F · 단어", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [1, "having a lot to do", "busy", "바쁜"],
    [2, "to go to see a person or place", "visit", "방문하다"],
    [3, "a group of people who meet to share an interest or activity", "club", "동아리, 동호회"],
    [4, "feeling very pleased about something you have done", "proud", "자랑스러운"],
    [5, "to cause air to move", "blow", "불다"],
    [6, "to help someone learn something", "teach", "가르치다"],
    [7, "a day when you don't have to go to work or school", "holiday", "휴일"],
    [8, "covered with snow or having a lot of snow falling", "snowy", "눈 덮인"],
    [9, "to do something over and over to get better at it", "practice", "연습하다"],
    [10, "a contest to see who can go fastest", "race", "경주"],
  ].forEach((r) => {
    ex.add(fill("w" + r[0], r[1] + "\n영어 단어만 쓰시오.", [r[2]], "정답: " + r[2] + " (X-10 F)"));
    ex.add(fill("k" + r[0], r[2] + "의 우리말을 쓰시오.", [r[3]], "정답: " + r[3] + " (X-10 F 뜻)"));
  });
  ex.section("Section G · Words Plus", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [1, "move : ______ = entertain : entertainment", "movement"],
    [2, "invest : investment = agree : ______", "agreement"],
    [3, "______ : excitement = punish : punishment", "excite"],
    [4, "friend : ______ = relation : relationship", "friendship"],
    [5, "leader : leadership = member : ______", "membership"],
    [6, "finish (반의어)", "start"],
    [7, "holiday (유의어)", "vacation"],
    [8, "drink (유의어)", "beverage"],
    [9, "return (반의어)", "borrow"],
    [10, "special (유의어)", "unique"],
  ].forEach((r) => ex.add(fill(r[0], r[1], [r[2]], "정답: " + r[2] + " (X-10 Words Plus+)")));
});

build("u08", "x10-dialog-cloze", "대화 빈칸 완성하기", "X-10 pp.46-47", (ex) => {
  ex.section("Section A · 한 칸", "이 칸에 들어갈 말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  D08.forEach((d) => ex.splitWords(d[0], "대화 " + d[0], d[1], d[2], "X-10 pp.46-47"));
});

build("u08", "x10-dialog-write", "대화 영작하기", "X-10 pp.48-49", (ex) => {
  ex.section("Section A · 대화", "영어 대화 전체를 쓰시오.", SENT.ruleKo, "sentence", SENT.answerModeTag);
  const kos = [
    "남자: 핸드폰을 못 찾겠어. 여자: 학교에서 집에 가져왔니? 남자: 응. 나랑 같이 찾아줄래? 여자: 물론이지.",
    "남자: Joan, 어디 가니? 여자: 도서관에 가. 남자: 그럼 나 대신 책을 반납해 줄래? 여자: 물론이지.",
    "남자: Susan, 바쁘니? 여자: 별로, 아빠. 왜? 남자: 가게에서 우유랑 달걀 좀 사줄래? 여자: 알겠어.",
    "남자: Lena, 나 좀 도와줄래? 여자: 물론이지, Dylan. 뭔데? 남자: 우리 동아리가 다른 사람을 도우려고 옷과 음식을 보낼 거야. 같이 할래? 여자: 응. 나도 옷을 가져갈게. 남자: 고마워.",
    "여자: James, 지난 일요일에 뭐 했어? 남자: Black이라는 영화를 봤어. 시각 장애 소녀와 선생님 이야기야. 여자: 영화 좋았어? 남자: 응, 정말 좋았어.",
    "여자: 주말 어땠어? 남자: 좋았어. 요양원에 가서 도왔어. 여자: 뭐 했는데? 남자: 노인들이 스마트폰을 잘 못 쓰셔서 내가 가르쳐 드렸어.",
    "남자: 휴일 잘 보냈어? 여자: 응. 속초에 있는 삼촌을 방문했어. 남자: 거기서 뭐 했는데? 여자: 해변에 갔어. 눈 덮인 해변이 정말 아름다웠어.",
    "남자: Lena, 주말에 뭐 했어? 여자: 가족과 어린이 병원에서 작은 콘서트를 열었어. 아빠는 바이올린, 엄마는 피아노, 나는 노래를 몇 곡 불렀어. 올해 최고의 날이었어.",
    "여자: Jim, 와서 나 좀 도와줄래? 남자: 네, 엄마. 뭘 하면 돼요? 여자: 쓰레기 좀 내다 줄래? 남자: 물론이지.",
    "남자: Amy, 주말 잘 보냈어? 여자: 응. 가족이랑 낚시 갔어. Sam은? 남자: 친구들과 영화를 봤어. 여자: 재미있었겠다.",
  ];
  D08.forEach((d, i) => ex.add(sentence(d[0], kos[i], [d[1], d[1].replace(/\n/g, " ")], "정답은 X-10 대화 영작하기 " + d[0] + "번.")));
});

build("u08", "x10-grammar", "핵심 Grammar 확인 문제", "X-10 pp.50-51", (ex) => {
  ex.section("Section A · to부정사", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [1, "I'm happy ______ the race.", "to finish"],
    [2, "He must be upset ______ nothing.", "to say"],
    [3, "I go to the library ______ math.", "to study"],
    [4, "I went shopping ______ new shoes.", "to buy"],
    [5, "I exercise regularly ______ healthy.", "to stay"],
    [6, "Jiha went to the park ______ his dog.", "to walk"],
    [7, "Mia went to the park ______.", "to run"],
    [8, "Seho went to the park ______ a book.", "to read"],
    [9, "Jenny went to the park ______.", "to take pictures"],
    [10, "We practiced hard ______ the marathon.", "to win"],
  ].forEach((r) => ex.add(fill(r[0], r[1], [r[2]], "정답: " + r[2] + " (X-10 Point 1)", true)));
  ex.section("Section B · 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  [
    [11, "우리는 조깅을 가기 위해 일찍 일어난다.", ["early", "go", "jogging", "to", "wake", "up", "we"], "We wake up early to go jogging"],
    [12, "나는 새로운 노트북을 사기 위해 돈을 저축했다.", ["a", "new", "laptop", "buy", "I", "money", "saved", "to"], "I saved money to buy a new laptop"],
    [13, "그녀는 대학에 들어가기 위해 열심히 공부했다.", ["enter", "hard", "she", "the", "university", "studied", "to"], "She studied hard to enter the university"],
    [14, "나는 콘서트를 놓쳐서 실망했다.", ["disappointed", "I", "miss", "to", "the", "concert", "was"], "I was disappointed to miss the concert"],
    [15, "그녀는 수업을 기억하기 위해 필기를 한다.", ["takes", "notes", "the", "lesson", "remember", "she", "to"], "She takes notes to remember the lesson"],
    [16, "그녀는 친구들을 다시 봐서 행복했다.", ["again", "happy", "her", "friends", "see", "she", "to", "was"], "She was happy to see her friends again"],
    [17, "그 학생은 질문을 하기 위해 나에게 전화했다.", ["a", "question", "ask", "called", "to", "the", "student", "me"], "The student called me to ask a question"],
    [18, "우리는 깨진 창문을 보고 충격을 받았다.", ["broken", "window", "see", "shocked", "the", "to", "we", "were"], "We were shocked to see the broken window"],
  ].forEach((r) => ex.orderBank(r[0], r[1], r[2], r[3], "정답: " + r[3] + ". (X-10 More)"));
  ex.section("Section C · that", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
  [
    [19, "I ______ he is funny.", "think that"],
    [20, "I ______ he is busy now.", "think that"],
    [21, "I ______ we did our best.", "knew that"],
    [22, "I ______ the story is true.", "believe that"],
    [23, "______ they won the race is true.", "That"],
    [24, "People ______ honesty is the best policy.", "say that"],
    [25, "I ______ Ms. Lee is a very kind teacher.", "think that"],
    [26, "We ______ we can finish the project in time.", "hope that"],
    [27, "The problem is (1)______ we don't (2)…… enough time. 이 문항은 (1)만.", "that"],
    [28, "The problem is (1)…… we don't (2)______ enough time. 이 문항은 (2)만.", "have"],
    [29, "I ______ she was a famous movie star.", "didn't know that"],
  ].forEach((r) => ex.add(fill(r[0], r[1], [r[2]], "정답: " + r[2] + " (X-10 Point 2)", true)));
  ex.section("Section D · that 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
  [
    [30, "나는 그것이 곰이라고 생각한다.", ["a", "bear", "I", "is", "it", "that", "think"], "I think that it is a bear"],
    [31, "나는 우리가 지금 떠나야 한다고 생각한다.", ["leave", "should", "I", "now", "that", "think", "we"], "I think that we should leave now"],
    [32, "나는 웃음이 사람들을 행복하게 만든다고 생각한다.", ["happy", "I", "people", "smiling", "makes", "that", "think"], "I think that smiling makes people happy"],
    [33, "나는 그녀가 진실을 말하고 있다는 것을 안다.", ["know", "I", "is", "she", "telling", "the", "truth", "that"], "I know that she is telling the truth"],
    [34, "나의 소망은 우리가 이 문제를 해결할 수 있다는 것이다.", ["can", "hope", "my", "is", "solve", "that", "this", "problem", "we"], "My hope is that we can solve this problem"],
    [35, "우리는 비행기가 취소되었다는 것을 방금 알았다.", ["canceled", "plane", "just", "know", "that", "the", "we", "was"], "We just know that the plane was canceled"],
    [36, "우리는 Leo가 똑똑하고 유머 있는 소년이라고 들었다.", ["a", "and", "boy", "heard", "Leo", "is", "smart", "that", "we", "witty"], "We heard that Leo is a smart and witty boy"],
    [37, "우리는 Kate가 큰 실수를 저질렀다는 것을 알지 못했다.", ["a", "didn't", "big", "know", "Kate", "mistake", "we", "that", "made"], "We didn't know that Kate made a big mistake"],
  ].forEach((r) => ex.orderBank(r[0], r[1], r[2], r[3], "정답: " + r[3] + ". (X-10 Point 2 More)"));
});

const L08_X_READ = [
  [1, "I'm blind. I walk with a stick.", ["blind", "walk", "stick"]],
  [2, "One day, my homeroom teacher said, \"There will be a school event, Friendship Marathon.\"", ["teacher", "said", "will", "be", "event", "Marathon"]],
  [3, "In this event, two people run as a team.", ["event", "people", "run", "team"]],
  [4, "Everyone talked about it. I also got interested.", ["talked", "about", "it", "got", "interested"]],
  [5, "\"But can I run?\" I was not sure. So I talked about it with my best friend, Junha.", ["can", "not", "sure", "talked", "about", "it", "best", "friend"]],
  [6, "He said, \"Don't worry! I'll run with you.\"", ["said", "worry", "run", "you"]],
  [7, "On the day of the marathon, we tied a string around our fingers to feel each other's movement.", ["day", "marathon", "tied", "string", "fingers", "feel", "movement"]],
  [8, "I listened to him very carefully and ran with him.", ["listened", "him", "carefully", "ran", "with"]],
  [9, "The wind was blowing through me and it felt great!", ["wind", "blowing", "me", "it", "great"]],
  [10, "At the finish line, everyone cheered for us. I was proud of myself.", ["finish", "line", "cheered", "us", "was", "proud", "myself"]],
  [11, "Before the marathon, I thought that I couldn't do it.", ["Before", "marathon", "thought", "couldn't", "do", "it"]],
  [12, "But now, I want to try other things. I think that I can try a bike ride next time.", ["now", "want", "try", "things", "think", "can", "bike", "ride", "next", "time"]],
  [13, "Andy and I signed up for Friendship Marathon. I was his guide runner.", ["signed", "up", "Marathon", "was", "guide", "runner"]],
  [14, "We ran together every day with a string.", ["ran", "together", "day", "string"]],
  [15, "I told him, \"Andy, a bike is coming. So let's move to the right.\"", ["told", "him", "bike", "is", "coming", "let's", "move", "right"]],
  [16, "As a team, we practiced hard to win the marathon.", ["team", "practiced", "hard", "win", "marathon"]],
  [17, "During the marathon, I ran with Andy and guided him at the same time.", ["During", "ran", "guided", "him", "time"]],
  [18, "It was hard, but we didn't stop running.", ["was", "hard", "didn't", "stop", "running"]],
  [19, "At last, we made it to the finish line.", ["last", "made", "it", "finish", "line"]],
  [20, "We didn't win the race. But I knew that we did our best.", ["didn't", "win", "race", "knew", "did", "best"]],
  [21, "Finishing something was not easy for me. But this time I did it!", ["Finishing", "something", "was", "easy", "me", "this", "time", "did", "it"]],
  [22, "I was very happy. Andy looked happy, too.", ["was", "very", "happy", "looked", "too"]],
];
const L08_CLOZE = [
  [1, "I'm blind. I walk with a stick.", ["blind", "walk", "with", "stick"]],
  [2, "One day, my homeroom teacher said, \"There will be a school event, Friendship Marathon.\"", ["One", "day", "homeroom", "said", "will", "be", "Friendship"]],
  [3, "In this event, two people run as a team.", ["run", "as", "team"]],
  [4, "Everyone talked about it. I also got interested.", ["talked", "about", "got", "interested"]],
  [5, "\"But can I run?\" I was not sure. So I talked about it with my best friend, Junha.", ["can", "run", "was", "sure", "talked", "about", "best"]],
];

build("u08", "x10-reading-sentence", "Reading 문장 완성하기", "X-10 pp.52-53", (ex) => {
  ex.section("Section A · 한 칸", "이 칸에 들어갈 말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  L08_X_READ.forEach((row) => ex.splitWords(row[0], "문장 " + row[0] + " " + (L08_SENT[row[0] - 1] ? L08_SENT[row[0] - 1][2] : ""), row[1], row[2], "X-10 Reading 문장 완성하기"));
});

build("u08", "x10-reading-cloze", "Reading 빈칸 완성하기", "X-10 pp.54-55", (ex) => {
  ex.section("Section A · 한 칸", "이 칸에 들어갈 말만 쓰시오.", FILL.ruleKo, "words", FILL.answerModeTag);
  L08_CLOZE.forEach((row) => ex.splitWords(row[0], "빈칸 " + row[0], row[1], row[2], "X-10 Reading 빈칸"));
  ex.omit("06-22", "빈칸 완성 06-22 단어열은 문장 완성하기와 겹치고 OCR 줄이 끊어 문장 완성 분할 문항으로 대신함");
});

build("u08", "x10-review", "핵심 문장 Review", "X-10 pp.56-57", (ex) => {
  ex.section("Section A · T/F", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
  [
    [1, "Andy and Junha signed up for Friendship Marathon.", "T"],
    [2, "In this event, two people run as a team.", "T"],
    [3, "Andy also got interested.", "T"],
    [4, "Junha was Andy's guide runner.", "T"],
    [5, "Andy and Junha won the race in the Friendship Marathon.", "F"],
    [6, "Andy looked sad after the marathon.", "F"],
    [7, "But Junha knew that they did their worst.", "F"],
  ].forEach((r) => ex.add(tf(r[0], r[1], r[2], "정답: " + r[2] + " (X-10 Review A, 답지 pp.56-57)")));
  ex.section("Section B · O/X", "밑줄이 맞으면 O, 틀리면 X를 누르시오. X이면 고친 말만 쓰시오.", "O 또는 X를 누르세요. X이면 고친 말만 쓰세요.", "ox", "OX · 맞으면 O");
  [
    [1, "\"But can I to run?,\" I was not sure.", "X", ["run"], "to run → run"],
    [2, "I was proud of myself.", "O", null, "맞는 문장"],
    [3, "We tied a string around our fingers to feels each other's movement.", "X", ["feel"], "feels → feel"],
    [4, "But this time I did it!", "O", null, "맞는 문장"],
    [5, "I told him, \"Andy, a bike is coming. So let's moved to the right.\"", "X", ["move"], "moved → move"],
    [6, "But now, I want to try other things.", "O", null, "맞는 문장"],
    [7, "Andy looked happy, too.", "O", null, "맞는 문장"],
  ].forEach((r) => ex.add({
    type: "ox", sourceId: "B" + r[0], promptEn: r[1], oxMark: r[2],
    rewriteAccept: r[3] || undefined, explainKo: "정답: " + r[2] + " " + r[4] + " (X-10 Review B)",
  }));
  ex.section("Section C · 형태", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  [
    ["C1", "During the marathon, I ran with Andy and guided (he) at the same time.", "During the marathon, I ran with Andy and guided him at the same time."],
    ["C2", "It was hard, but we didn't stop (run).", "It was hard, but we didn't stop running."],
    ["C3", "As a team, we practiced hard (win) the marathon.", "As a team, we practiced hard to win the marathon."],
    ["C4", "I listened to him very (careful) and ran with him.", "I listened to him very carefully and ran with him."],
    ["C5", "(Finish) something was not easy for me.", "Finishing something was not easy for me."],
  ].forEach((r) => ex.add(sentence(r[0], "괄호 안 단어를 알맞은 형태로 바꿔 문장 전체를 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2] + " (X-10 Review C)")));
  ex.section("Section D · 고친 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
  [
    ["D1", "He said, \"Don't worry! I'll ran with you.\"", "He said, \"Don't worry! I'll run with you.\""],
    ["D2", "The wind was blowing through me and it feel great!", "The wind was blowing through me and it felt great!"],
    ["D3", "I think that I can tries a bike ride next time!", "I think that I can try a bike ride next time!"],
    ["D4", "We ran together every day with a string*s*.", "We ran together every day with a string."],
    ["D5", "One day, my homeroom teacher say, \"There will be a school event, Friendship Marathon.\"", "One day, my homeroom teacher said, \"There will be a school event, Friendship Marathon.\""],
  ].forEach((r) => ex.add(sentence(r[0], "어법상 틀린 한 곳을 고쳐 문장 전체를 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2] + " (X-10 Review D)")));
});

finalStub("u08", "final-1", "최종점검 모의고사 1회", "X-10 pp.96-99", [
  { kind: "fill", n: 1, prompt: "볼 수 없는. b로 시작하는 단어를 쓰시오.", accept: ["blind"], explain: "정답: blind. (Lesson 08 최종 1회 01)" },
  { kind: "fill", n: 9, prompt: "영어를 배우러 미국에. 빈칸에 들어갈 말만 쓰시오.\nHe went to ______.", accept: ["America to learn English"], explain: "정답: America to learn English. (최종 1회 09)" },
  { kind: "sentence", n: "13-1", prompt: "(1) 사실 나는 혼자서 피아노 치는 법을 배웠다. 문장 전체를 쓰시오.", accept: ["In fact, I learned myself how to play the piano."], explain: "정답: In fact, I learned myself how to play the piano. (최종 1회 13 (1))" },
  { kind: "sentence", n: "13-2", prompt: "(2) 나는 나를 발전시키기 위해 다른 것들을 배우기를 바란다.", accept: ["I hope to learn different things to improve myself."], explain: "정답: hope to learn different things to improve myself. (최종 1회 13 (2))" },
  { kind: "sentence", n: 17, prompt: "우리는 서로의 움직임을 느끼려고 손가락에 끈을 묶었다.", accept: ["We tied a string around our fingers to feel each other's movement."], explain: "정답: we tied a string around our fingers to feel each other's movement. (최종 1회 17)" },
  { kind: "fill", n: 19, prompt: "결승선에서 그들을 응원하고 있었다. 빈칸에 들어갈 말만 쓰시오.", accept: ["cheering for them at the finish line"], explain: "정답: cheering for them at the finish line. (최종 1회 19)" },
  { kind: "fill", n: 20, prompt: "틀린 말을 바른 말로만 쓰시오.\nto won", accept: ["to win"], explain: "정답: to won → to win. (최종 1회 20)" },
  { kind: "fill", n: 23, prompt: "무언가를 끝내는 것. 알맞은 형태만 쓰시오.", accept: ["Finishing"], explain: "정답: Finishing. (최종 1회 23)" },
]);
finalStub("u08", "final-2", "최종점검 모의고사 2회", "X-10 pp.100-103", [
  { kind: "sentence", n: 3, prompt: "나는 쓰레기를 주울 계획이다.", accept: ["I plan to pick up trash."], explain: "정답: I plan to pick up trash. (Lesson 08 최종 2회 03)" },
  { kind: "fill", n: "12-1", prompt: "(1) 틀린 말을 바른 말로만 쓰시오.\nsaw", accept: ["see"], explain: "정답: saw → see. (최종 2회 12 (1))" },
  { kind: "fill", n: "12-2", prompt: "(2) 틀린 말을 바른 말로만 쓰시오.\nwhich", accept: ["that"], explain: "정답: which → that. (최종 2회 12 (2))" },
  { kind: "sentence", n: 13, prompt: "그는 다른 사람을 방해하지 않으려고 조용히 말했다.", accept: ["He spoke quietly not to disturb others."], explain: "정답: He spoke quietly not to disturb others. (최종 2회 13)" },
  { kind: "sentence", n: 20, prompt: "바람이 느낌이 좋았다.", accept: ["The wind felt great."], explain: "정답: The wind felt great. (최종 2회 20)" },
  { kind: "sentence", n: 23, prompt: "오른쪽으로 움직이자.", accept: ["Let's move to the right."], explain: "정답: let's move to the right. (최종 2회 23)" },
]);
finalStub("u08", "final-3", "최종점검 모의고사 3회", "X-10 pp.104-107", [
  { kind: "fill", n: 3, prompt: "자랑스러운. 영어 단어를 쓰시오.", accept: ["proud"], explain: "정답: proud. (Lesson 08 최종 3회 03)" },
  { kind: "sentence", n: 7, prompt: "주말에 무엇을 했니? 문장 전체를 쓰시오.", accept: ["What did you do over the weekend?"], explain: "정답: What did you do over the weekend. (최종 3회 07)" },
  { kind: "sentence", n: "13-1", prompt: "(1) 충분한 돈을 벌려고 열심히 일했다.", accept: ["worked hard to earn enough money"], explain: "정답: worked hard to earn enough money. (최종 3회 13 (1))" },
  { kind: "sentence", n: "13-2", prompt: "(2) 멋진 하루 보내기를 바란다.", accept: ["hope that you have a wonderful day"], explain: "정답: hope that you have a wonderful day. (최종 3회 13 (2))" },
  { kind: "sentence", n: 18, prompt: "나는 나 자신이 자랑스러웠다.", accept: ["I was proud of myself."], explain: "정답: I was proud of myself. (최종 3회 18)" },
  { kind: "fill", n: 21, prompt: "우정 마라톤에 등록했다. 표현만 쓰시오.", accept: ["signed up for Friendship Marathon"], explain: "정답: signed up for Friendship Marathon. (최종 3회 21)" },
  { kind: "sentence", n: 25, prompt: "나는 너에게 아이스크림을 주고 싶다.", accept: ["I want to give you an ice cream."], explain: "정답: I want to give you an ice cream. (최종 3회 25)" },
]);

function wmCard(pack) {
  return {
    id: "wm-" + pack.id,
    title: pack.title,
    external: true,
    href: "https://mrjkorea.github.io/word-master/?packsrc=https://mrjkorea.github.io/word-master/packs/" + pack.id + ".json",
  };
}
const WORD_PACKS = {
  u07: [
    { id: "j1visang_u07_words01", title: "Words 01 · 20 words" },
    { id: "j1visang_u07_words02", title: "Words 02 · 20 words" },
    { id: "j1visang_u07_expressions01", title: "Expressions · 21 words" },
    { id: "j1visang_u07_wordplus01", title: "Words Plus+ · 13 words" },
  ],
  u08: [
    { id: "j1visang_u08_words01", title: "Words 01 · 20 words" },
    { id: "j1visang_u08_words02", title: "Words 02 · 20 words" },
    { id: "j1visang_u08_words03", title: "Words 03 · 7 words" },
    { id: "j1visang_u08_expressions01", title: "Expressions 01 · 20 words" },
    { id: "j1visang_u08_expressions02", title: "Expressions 02 · 14 words" },
    { id: "j1visang_u08_wordplus01", title: "Words Plus+ · 15 words" },
  ],
};

function catalog(unit, label) {
  const order = [
    ["A", "A. 본책", ["vocab-check", "vocab-practice", "vocab-advanced", "dialog-detail", "dialog-complete", "dialog-order", "dialog-practice", "dialog-advanced", "grammar-check", "grammar-practice", "grammar-advanced", "reading-content", "reading-lexgram", "reading-order", "reading-writing", "reading-practice", "reading-advanced", "plus-practice", "writing-finish"]],
    ["B", "B. X-10 Part I", ["x10-vocab", "x10-dialog-cloze", "x10-dialog-write", "x10-grammar", "x10-reading-sentence", "x10-reading-cloze", "x10-review"]],
    ["C", "C. 모의고사", ["mock-100", "mock-high", "final-1", "final-2", "final-3"]],
  ];
  const titles = {
    "vocab-check": "Vocabulary 확인 문제",
    "vocab-practice": "Vocabulary 실전 문제",
    "vocab-advanced": "Vocabulary 심화 문제",
    "dialog-detail": "Dialog 자세히 보기",
    "dialog-complete": "Dialog 완성하기",
    "dialog-order": "Dialog 순서배열하기",
    "dialog-practice": "Dialog 실전 문제",
    "dialog-advanced": "Dialog 심화 문제",
    "grammar-check": "Grammar 확인 문제",
    "grammar-practice": "Grammar 실전 문제",
    "grammar-advanced": "Grammar 심화 문제",
    "reading-content": "Reading 내용 확인하기",
    "reading-lexgram": "Reading 적절한 어휘·어법 고르기",
    "reading-order": "Reading 순서배열하기",
    "reading-writing": "Reading 영작하기",
    "reading-practice": "Reading 실전 문제",
    "reading-advanced": "Reading 심화 문제",
    "plus-practice": "Plus 기타 지문 실전 문제",
    "writing-finish": "서술형 끝내기",
    "x10-vocab": "어휘 확인 문제",
    "x10-dialog-cloze": "대화 빈칸 완성하기",
    "x10-dialog-write": "대화 영작하기",
    "x10-grammar": "핵심 Grammar 확인 문제",
    "x10-reading-sentence": "Reading 문장 완성하기",
    "x10-reading-cloze": "Reading 빈칸 완성하기",
    "x10-review": "핵심 문장 Review",
    "mock-100": "100발 100중 모의고사",
    "mock-high": "고득점 모의고사",
    "final-1": "최종점검 모의고사 1회",
    "final-2": "최종점검 모의고사 2회",
    "final-3": "최종점검 모의고사 3회",
  };
  return {
    book: "j1-visang",
    unit,
    label,
    status: "ready",
    note: "통과 80%. 중1 비상 황종배 " + label + ". 답지·X-10 영작 대화로 맞춘 문항입니다. OCR로 보기 순서를 확정하지 못한 번호는 각 연습의 omitted에 있습니다. 틀리고 다시 풀기 전에만 종이 교재 안내가 나옵니다.",
    sections: order.map(([key, title, ids]) => ({
      key,
      title,
      exercises: ids.map((id) => {
        const file = out[unit][id];
        const row = {
          id,
          title: titles[id],
          questionCount: file.questionCount,
          omittedCount: (file.omitted || []).length,
        };
        if (!file.questionCount) {
          row.deferred = true;
          row.reason = "답 번호는 있으나 보기 영어를 OCR로 확정하지 못해 빈 퀴즈로 열지 않습니다.";
        }
        return row;
      }),
    })).concat([
      { key: "W", title: "Word focus", lane: "focus", note: "WordMaster packs · opens in Word Master", exercises: (WORD_PACKS[unit] || []).map(wmCard) },
      { key: "G", title: "Grammar focus", lane: "focus", note: "Coming soon. Grammar packs will deep-link here later.", exercises: [] },
    ]),
  };
}

const problems = [];
for (const unit of ["u07", "u08"]) {
  const dir = path.join(ROOT, "data/j1-visang", unit, "exercises");
  fs.mkdirSync(dir, { recursive: true });
  for (const id of Object.keys(out[unit])) {
    const ex = out[unit][id];
    for (const q of ex.questions) {
      const ok = grade.gradeItem(q, q.type === "mc" || q.type === "match" ? { indexes: (q.correctIndexes || []).slice() } : q.type === "order" ? { order: (q.orderIds || []).slice() } : q.type === "ox" ? { value: q.oxMark, rewrite: (q.rewriteAccept || [])[0] || "" } : { value: (q.accept || [])[0] || "" });
      if (!ok) problems.push(unit + "/" + id + "#" + q.id + " " + q.type + " " + grade.formatCorrect(q).slice(0, 80));
    }
    fs.writeFileSync(path.join(dir, id + ".json"), JSON.stringify(ex, null, 2) + "\n");
  }
  const label = unit === "u07" ? "Lesson 07 Greener, Greater" : "Lesson 08 For a Better Tomorrow";
  fs.writeFileSync(path.join(ROOT, "data/j1-visang", unit, "catalog.json"), JSON.stringify(catalog(unit, label), null, 2) + "\n");
}

const booksPath = path.join(ROOT, "data/books.json");
const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));
const vis = books.books.find((b) => b.slug === "j1-visang");
for (const u of vis.units) {
  if (u.unit === "u07") { u.label = "Lesson 07 Greener, Greater"; u.status = "ready"; }
  if (u.unit === "u08") { u.label = "Lesson 08 For a Better Tomorrow"; u.status = "ready"; }
}
fs.writeFileSync(booksPath, JSON.stringify(books, null, 2) + "\n");

if (problems.length) {
  console.error(problems.slice(0, 40).join("\n"));
  console.error("grade failures", problems.length);
  process.exit(1);
}
const counts = {};
for (const unit of ["u07", "u08"]) {
  counts[unit] = {};
  for (const id of Object.keys(out[unit])) counts[unit][id] = out[unit][id].questionCount + "/" + (out[unit][id].omitted || []).length;
}
console.log(JSON.stringify(counts, null, 2));
