#!/usr/bin/env node
/**
 * Clarity pass for 중2 동아 L07–L08 after zap-rewrite.
 * Template for later Bekbal books: match vocab-check, one typed blank per card,
 * focused-blank directions, pure word-order as tap-order.
 * Re-run is safe: already-converted items are left alone.
 */
const fs = require("fs");
const path = require("path");
const grade = require("../assets/grade.js");

const ROOT = path.join(__dirname, "..");
const UNITS = ["data/j2-donga/u07", "data/j2-donga/u08"];
const CIRC = "①②③④⑤⑥⑦⑧⑨⑩";
const LETTERS = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙ";

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function blankLabel(fb) {
  const s = String(fb || "");
  if (/^\d+$/.test(s)) return "(" + s + ")";
  return s;
}

function badOrderWrite(text) {
  return /순서대로\s*쓰|번호\s*순서대로|빈칸\s*순서대로/.test(String(text || ""));
}

function packedBothMarks(text) {
  return /[ⓐ-ⓙ]\s*와\s*[ⓐ-ⓙ].{0,80}(?:쓰시오|고르시오|쓰세요|고르세요)/.test(String(text || ""));
}

function specificAsk(q) {
  const label = blankLabel(q.focusBlank);
  const phrase = q.phraseBlank ? " 두 단어 이상이어도 됩니다." : "";
  if (q.type === "order") return "이 카드는 " + label + " 빈칸만 순서대로 누르시오.";
  if (q.type === "bank" || q.type === "mc") return "이 카드는 " + label + " 빈칸만 고르시오.";
  if (/적절한/.test(q.directionKo || "")) return "이 카드는 " + label + " 빈칸에 들어갈 적절한 말만 쓰시오." + phrase;
  return "이 카드는 " + label + " 빈칸에 들어갈 말만 쓰시오." + phrase;
}

function genericAsk(questions) {
  const types = new Set(questions.map((q) => q.type));
  const phrase = questions.some((q) => q.phraseBlank);
  if (types.size === 1 && types.has("order")) {
    return "각 카드에 표시된 빈칸만 순서대로 누르시오. 다른 번호는 누르지 않아요.";
  }
  if ([...types].every((t) => t === "bank" || t === "mc")) {
    return "각 카드에 표시된 빈칸만 고르시오. 다른 번호는 고르지 않아요.";
  }
  let s = "각 카드에 표시된 빈칸 하나만 쓰시오. 다른 번호는 지금 쓰지 않아요.";
  if (phrase) s += " 두 단어 이상인 칸도 그 칸의 말만 쓰세요.";
  return s;
}

function sectionHeadline(title, questions) {
  const m = String(title || "").match(/^(Section\s+[A-Z]\s·\s)/);
  const prefix = m ? m[1] : "";
  const types = new Set(questions.map((q) => q.type));
  if (types.size === 1 && types.has("order")) return prefix + "표시된 빈칸만 순서대로 누르기";
  if ([...types].every((t) => t === "bank" || t === "mc")) return prefix + "표시된 빈칸만 고르기";
  return prefix + "표시된 빈칸 하나만 쓰기";
}

function rewriteFocus(ex) {
  let n = 0;
  const touchedSections = new Set();
  for (const q of ex.questions || []) {
    if (!q.focusBlank) continue;
    const ask = specificAsk(q);
    let changed = false;
    if (badOrderWrite(q.directionKo) || packedBothMarks(q.directionKo)) {
      q.directionKo = ask;
      changed = true;
    }
    const lines = String(q.promptEn || "").split("\n");
    const next = lines.map((line) => {
      if (badOrderWrite(line) || packedBothMarks(line)) {
        changed = true;
        return ask;
      }
      return line;
    });
    q.promptEn = next.join("\n");
    if (badOrderWrite(q.ruleKo) || packedBothMarks(q.ruleKo)) {
      q.ruleKo = q.type === "order"
        ? "이 빈칸에 들어갈 말만 순서대로 누르세요. 다른 번호는 누르지 않아요."
        : q.type === "bank" || q.type === "mc"
          ? "이 빈칸만 보기에서 하나 누르세요. 다른 번호는 고르지 않아요."
          : "이 빈칸에 들어갈 말만 쓰세요. 다른 번호는 쓰지 않아요.";
      changed = true;
    }
    if (changed) {
      n++;
      touchedSections.add(q.section);
      if (!q.promptKo) q.promptKo = "이 문항은 " + blankLabel(q.focusBlank) + "만 합니다.";
    }
  }
  for (const s of ex.sections || []) {
    const qs = (ex.questions || []).filter((q) => q.section === s.id && q.focusBlank);
    if (!qs.length) continue;
    const blob = [s.directionKo, s.title, s.instructionKo, s.ruleKo].join("\n");
    if (!touchedSections.has(s.id) && !badOrderWrite(blob) && !packedBothMarks(blob)) continue;
    if (!badOrderWrite(blob) && !packedBothMarks(blob) && !touchedSections.has(s.id)) continue;
    const g = genericAsk(qs);
    if (badOrderWrite(blob) || packedBothMarks(blob)) {
      s.directionKo = g;
      s.title = sectionHeadline(s.title, qs);
      if (badOrderWrite(s.ruleKo) || packedBothMarks(s.ruleKo)) {
        s.ruleKo = qs[0].type === "order"
          ? "이 빈칸에 들어갈 말만 순서대로 누르세요. 다른 번호는 누르지 않아요."
          : qs.every((q) => q.type === "bank" || q.type === "mc")
            ? "이 빈칸만 보기에서 하나 누르세요. 다른 번호는 고르지 않아요."
            : "이 빈칸에 들어갈 말만 쓰세요. 다른 번호는 쓰지 않아요.";
      }
      s.instructionKo = s.directionKo + " " + (s.ruleKo || "");
    }
    for (const q of ex.questions || []) {
      if (q.section !== s.id) continue;
      q.sectionTitle = s.title;
      q.sectionInstructionKo = s.instructionKo;
    }
  }
  return n;
}

function isSymbolAccept(accepts) {
  return (accepts || []).length > 0 && (accepts || []).every((a) => /^[0-9①②③④⑤⑥⑦⑧⑨⑩ⓐ-ⓙ]$/.test(String(a).trim()));
}

function circleOptions(prompt) {
  const re = /([①②③④⑤⑥⑦⑧⑨⑩])\s*([A-Za-z][^①②③④⑤⑥⑦⑧⑨⑩\n.]*)/g;
  const opts = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(String(prompt || "")))) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    let rest = m[2].trim().split(/\s+/).slice(0, 8).join(" ").replace(/[,:;]+$/g, "");
    if (!rest) continue;
    opts.push({ mark: m[1], text: m[1] + " " + rest });
  }
  return opts;
}

function symbolIndex(accepts, opts) {
  for (const a of accepts || []) {
    const t = String(a).trim();
    let mark = t;
    if (/^\d+$/.test(t)) mark = CIRC[Number(t) - 1] || t;
    const i = opts.findIndex((o) => o.mark === mark);
    if (i >= 0) return i + 1;
  }
  return null;
}

function slugLabel(label) {
  if (label === "틀린 말") return "wrong";
  if (label === "고친 말") return "fix";
  const ci = LETTERS.indexOf(label);
  if (ci >= 0) return "c" + "abcdefghij"[ci];
  const num = String(label || "").match(/\d+/);
  if (num) return "n" + num[0];
  return String(label || "x").replace(/[^\w]+/g, "") || "x";
}

function retargetPrompt(prompt, lead) {
  const lines = String(prompt || "").split("\n");
  let idx = -1;
  lines.forEach((line, i) => {
    if (/하시오|쓰시오|고르시오/.test(line)) idx = i;
  });
  if (idx >= 0) lines[idx] = lead;
  else lines.unshift(lead);
  return lines.map((line) => {
    const m = line.trim().match(/^\((\d+)\)$/);
    if (m) return "(" + m[1] + ") ______";
    return line;
  }).join("\n").replace(/\( {2,}\)\s*→\s*_{2,}/g, lead);
}

function askFor(q, label) {
  const dir = q.directionKo || "";
  if (label === "틀린 말") {
    return {
      lead: "틀린 말만 쓰시오.",
      rule: "틀린 말만 쓰세요. 고친 말은 다른 카드입니다. 문장 전체는 쓰지 않아요.",
    };
  }
  if (label === "고친 말") {
    return {
      lead: "바르게 고친 말만 쓰시오.",
      rule: "고친 말만 쓰세요. 번호나 문장 전체는 쓰지 않아요.",
    };
  }
  if (/^[ⓐ-ⓙ]$/.test(label) && /형태/.test(dir)) {
    return {
      lead: label + "만 알맞은 형태로 쓰시오.",
      rule: "괄호 안 단어를 알맞은 형태로 바꿔 " + label + "만 쓰세요.",
    };
  }
  if (/가리키/.test(dir)) {
    return {
      lead: "밑줄 친 " + label + "가 가리키는 것만 쓰시오.",
      rule: label + "가 가리키는 말만 쓰세요. 다른 기호는 다른 카드입니다.",
    };
  }
  if (/우리말/.test(dir)) {
    return {
      lead: label + "만 우리말로 쓰시오.",
      rule: label + "만 우리말로 간략히 쓰세요.",
    };
  }
  if (/^[ⓐ-ⓙ]$/.test(label)) {
    return {
      lead: label + "만 바르게 고친 말만 쓰시오.",
      rule: label + "를 고친 말만 쓰세요. 다른 기호는 다른 카드입니다.",
    };
  }
  return {
    lead: label + "만 쓰시오.",
    rule: label + "만 쓰세요. 다른 칸은 다른 카드입니다.",
  };
}

function baseFrom(q, extra) {
  return Object.assign({
    sourceId: q.sourceId,
    group: q.group || "",
    explainKo: q.explainKo || "",
    section: q.section,
    sectionTitle: q.sectionTitle,
    sectionInstructionKo: q.sectionInstructionKo,
  }, extra);
}

function fillFromPart(q, part) {
  const label = part.label || "답";
  const ask = askFor(q, label);
  const item = baseFrom(q, {
    id: q.id + "-" + slugLabel(label),
    label: (q.label || q.id) + "-" + label,
    type: "fill",
    answerMode: "words",
    accept: (part.accept || []).slice(),
    phraseBlank: (part.accept || []).some((a) => /\s/.test(String(a))),
    directionKo: ask.lead,
    ruleKo: ask.rule,
    promptKo: ask.rule,
    promptEn: retargetPrompt(q.promptEn, ask.lead),
    answerModeTag: "Type · 빈칸 말만",
    partLabel: label,
  });
  if (/^[ⓐ-ⓙ]$/.test(label)) item.focusBlank = label;
  const num = String(label).match(/^\(?\s*(\d+)\s*\)?$/);
  if (num) item.focusBlank = num[1];
  return item;
}

function splitParts(ex) {
  let n = 0;
  const touched = new Set();
  const next = [];
  for (const q of ex.questions || []) {
    const parts = q.parts || [];
    const typed = parts.filter((p) => p.kind !== "mc" && p.kind !== "order");
    if (q.type !== "parts" || typed.length < 2) {
      next.push(q);
      continue;
    }
    n++;
    touched.add(q.section);
    const sym = parts.find((p) => isSymbolAccept(p.accept));
    const words = parts.filter((p) => p !== sym);
    const opts = circleOptions(q.promptEn);
    const correct = sym ? symbolIndex(sym.accept, opts) : null;
    if (sym && words.length === 1 && opts.length >= 2 && correct) {
      const pickLead = "어법상 틀린 번호만 고르시오.";
      next.push(baseFrom(q, {
        id: q.id + "-pick",
        label: (q.label || q.id) + "-번호",
        type: "mc",
        answerMode: "choice",
        select: "one",
        choices: opts.map((o) => o.text),
        correctIndexes: [correct],
        directionKo: "어법상 틀린 번호만 누르시오.",
        ruleKo: "보기 중에서 틀린 번호 하나를 누르세요. 번호는 직접 쓰지 않아요.",
        promptKo: "틀린 번호만 누르세요. 고친 말은 다음 카드입니다.",
        promptEn: retargetPrompt(q.promptEn, pickLead),
        answerModeTag: "Choose · 고르기",
        partLabel: "틀린 번호",
      }));
      const fix = fillFromPart(q, words[0]);
      fix.id = q.id + "-fix";
      fix.label = (q.label || q.id) + "-고친";
      fix.partLabel = "고친 말";
      next.push(fix);
      continue;
    }
    for (const part of typed) next.push(fillFromPart(q, part));
  }
  ex.questions = next;
  for (const s of ex.sections || []) {
    if (!touched.has(s.id)) continue;
    const qs = ex.questions.filter((q) => q.section === s.id);
    const tags = [...new Set(qs.map((q) => q.answerModeTag))];
    s.directionKo = "카드마다 한 가지만 하세요.";
    s.ruleKo = "카드에 적힌 것만 하세요. 고르기는 누르고, 쓰기는 그 칸의 말만 쓰세요.";
    s.instructionKo = s.directionKo + " " + s.ruleKo;
    s.answerMode = tags.length === 1 && qs[0].answerMode === "choice" ? "choice" : "words";
    s.answerModeTag = tags.length === 1 ? tags[0] : "한 가지씩";
    s.itemCount = qs.length;
    const letter = (String(s.title).match(/Section\s+[A-Z]/) || ["Section"])[0];
    if (/와|두 |각각|번호를 쓰고|고쳐 쓰/.test(s.title || "")) s.title = letter + " · 한 칸씩";
    for (const q of qs) {
      q.sectionTitle = s.title;
      q.sectionInstructionKo = s.instructionKo;
    }
  }
  return n;
}

function cleanSplitTitles(ex) {
  let n = 0;
  for (const s of ex.sections || []) {
    if (!/한 칸씩/.test(s.title || "")) continue;
    if (!/[ⓐ-ⓙ]\s*와\s*[ⓐ-ⓙ]|두 군데|각각|번호를 쓰고/.test(s.title)) continue;
    const letter = (String(s.title).match(/Section\s+[A-Z]/) || ["Section"])[0];
    s.title = letter + " · 한 칸씩";
    for (const q of ex.questions || []) {
      if (q.section === s.id) q.sectionTitle = s.title;
    }
    n++;
  }
  return n;
}

function repairSymbolChoices(ex) {
  let n = 0;
  for (const q of ex.questions || []) {
    if (q.type !== "mc" || q.partLabel !== "틀린 번호") continue;
    const opts = circleOptions(q.promptEn);
    if (opts.length < 2) continue;
    const prev = ((q.choices || [])[((q.correctIndexes || [1])[0] || 1) - 1] || "").trim();
    const mark = prev.charAt(0);
    const idx = opts.findIndex((o) => o.mark === mark);
    if (idx < 0) continue;
    q.choices = opts.map((o) => o.text);
    q.correctIndexes = [idx + 1];
    n++;
  }
  return n;
}

function cleanIntro(ex) {
  if (!ex.introKo || !/순서대로\s*쓰|번호\s*순서대로|빈칸\s*순서대로/.test(ex.introKo)) return 0;
  if (!(ex.questions || []).some((q) => q.focusBlank)) return 0;
  ex.introKo = "각 카드는 표시된 빈칸 하나만 다룹니다. 다른 번호는 그 카드에서 쓰지 않아요. 고르기는 누르기만 하면 됩니다.";
  return 1;
}

function markSplitFocus(ex) {
  let n = 0;
  for (const q of ex.questions || []) {
    if (q.focusBlank || q.type !== "fill") continue;
    const hit = String(q.id).match(/-(\d+)-(?:wrong|fix)$/);
    if (!hit) continue;
    const blanks = [...String(q.promptEn || "").matchAll(/[（(]\s*(\d+)\s*[)）]\s*_{2,}/g)].map((m) => m[1]);
    if (!blanks.includes(hit[1])) continue;
    q.focusBlank = hit[1];
    q.promptKo = "이 카드는 (" + hit[1] + ")만 다룹니다. " + (q.promptKo || "");
    n++;
  }
  return n;
}

function key(s) {
  return grade.norm(s).replace(/[“”"']/g, "").replace(/[,;:!?().]/g, " ").replace(/\s+/g, " ").trim();
}

function parenChunks(text) {
  const groups = [...String(text || "").matchAll(/\(([^()\n]{2,})\)/g)].map((m) => m[1]).filter((s) => s.includes("/"));
  const bits = groups.flatMap((g) => g.split("/").map((s) => s.trim()).filter(Boolean));
  return bits.length >= 2 ? bits : null;
}

function covers(answer, chunks) {
  let rest = key(answer);
  const pool = chunks.map((c, i) => ({ i, n: key(c) }));
  const order = [];
  while (rest.length) {
    rest = rest.replace(/^\s+/, "");
    let hit = -1;
    let hitLen = -1;
    for (let i = 0; i < pool.length; i++) {
      const n = pool[i].n;
      if (!n) continue;
      if ((rest === n || rest.startsWith(n + " ")) && n.length > hitLen) {
        hit = i;
        hitLen = n.length;
      }
    }
    if (hit < 0) return null;
    order.push(pool[hit].i);
    rest = rest.slice(pool[hit].n.length).replace(/^\s+/, "");
    pool.splice(hit, 1);
  }
  if (pool.length) return null;
  return order.length ? order : null;
}

function convertArrangement(ex) {
  let n = 0;
  const touched = new Set();
  for (const q of ex.questions || []) {
    if (q.type !== "fill" && q.type !== "sentence") continue;
    const dir = (q.directionKo || "") + "\n" + (q.promptEn || "");
    if (!/배열/.test(dir)) continue;
    if (/어형|형태로 바|문장 전체/.test(dir)) continue;
    if (/문장 전체/.test(q.ruleKo || "")) continue;
    const chunks = parenChunks(q.promptEn);
    if (!chunks) continue;
    let order = null;
    for (const ans of q.accept || []) {
      order = covers(ans, chunks);
      if (order) break;
    }
    if (!order) continue;
    q.type = "order";
    q.answerMode = "order";
    q.orderChunks = chunks.map((c, i) => ({ id: "c" + i, text: c }));
    q.orderIds = order.map((i) => "c" + i);
    delete q.accept;
    delete q.phraseBlank;
    delete q.focusBlank;
    q.ruleKo = "주어진 말을 들어가는 순서대로 누르세요. 직접 쓰지 않아요.";
    q.answerModeTag = "Choose · 순서 누르기";
    touched.add(q.section);
    n++;
  }
  for (const s of ex.sections || []) {
    if (!touched.has(s.id)) continue;
    const qs = ex.questions.filter((q) => q.section === s.id);
    if (!qs.every((q) => q.type === "order")) continue;
    s.answerMode = "order";
    s.answerModeTag = "Choose · 순서 누르기";
    s.ruleKo = "주어진 말을 들어가는 순서대로 누르세요. 직접 쓰지 않아요.";
    s.instructionKo = (s.directionKo || "") + " " + s.ruleKo;
    for (const q of qs) {
      q.sectionInstructionKo = s.instructionKo;
      q.answerModeTag = s.answerModeTag;
      q.ruleKo = s.ruleKo;
    }
  }
  return n;
}

function toMatch(ex) {
  if ((ex.questions || [])[0] && ex.questions[0].type === "match") return 0;
  const titles = {
    s1: "Section A · 단어 짝짓기 · 영어 ↔ 우리말",
    s2: "Section B · 단어 짝짓기 · 우리말 ↔ 영어",
    s3: "Section C · 표현 짝짓기 · 영어 ↔ 우리말",
    s4: "Section D · 표현 짝짓기 · 우리말 ↔ 영어",
  };
  const boards = [];
  let pairsTotal = 0;
  for (const sec of ex.sections || []) {
    const qs = (ex.questions || []).filter((q) => q.section === sec.id);
    const pairs = qs.map((q) => {
      const last = String(q.promptEn || "").split("\n").map((s) => s.trim()).filter(Boolean).pop();
      const ans = (q.accept || [])[0] || "";
      const enFirst = sec.id === "s1" || sec.id === "s3";
      return {
        id: String(q.id),
        en: enFirst ? last : ans,
        ko: enFirst ? ans : last,
        sourceId: q.sourceId,
        explainKo: q.explainKo || "",
      };
    });
    pairsTotal += pairs.length;
    const size = 5;
    let boardN = 0;
    for (let i = 0; i < pairs.length; i += size) {
      boardN++;
      const slice = pairs.slice(i, i + size);
      const label = slice.length > 1 ? slice[0].id + "–" + slice[slice.length - 1].id : slice[0].id;
      boards.push({
        id: sec.id + "-b" + boardN,
        type: "match",
        answerMode: "match",
        label,
        section: sec.id,
        sourceId: slice[0].sourceId,
        group: sec.id,
        pairs: slice,
        directionKo: "영어와 같은 뜻의 우리말을 짝지으세요.",
        ruleKo: "왼쪽 영어를 누르고, 같은 뜻의 오른쪽 우리말을 누르세요. 직접 쓰지 않아요.",
        promptEn: "영어와 우리말을 짝지으세요.",
        promptKo: "영어를 먼저 누르고, 같은 뜻의 우리말을 누르세요. 다시 누르면 풀립니다.",
        answerModeTag: "Match · 짝짓기",
        explainKo: slice.map((p) => p.en + " — " + p.ko).join("\n"),
        sectionTitle: titles[sec.id] || sec.title,
        sectionInstructionKo: "영어와 같은 뜻의 우리말을 짝지으세요. 왼쪽 영어를 누르고, 같은 뜻의 오른쪽 우리말을 누르세요. 직접 쓰지 않아요.",
      });
    }
    sec.title = titles[sec.id] || sec.title;
    sec.directionKo = "영어와 같은 뜻의 우리말을 짝지으세요.";
    sec.ruleKo = "왼쪽 영어를 누르고, 같은 뜻의 오른쪽 우리말을 누르세요. 직접 쓰지 않아요.";
    sec.instructionKo = sec.directionKo + " " + sec.ruleKo;
    sec.answerMode = "match";
    sec.answerModeTag = "Match · 짝짓기";
    sec.itemCount = pairs.length;
  }
  ex.questions = boards;
  ex.questionCount = pairsTotal;
  ex.introKo = "Vocabulary 확인은 짝짓기입니다. 영어 " + pairsTotal + "쌍을 다섯 쌍씩 보여 줍니다. 왼쪽 영어를 누르고 같은 뜻의 우리말을 누르세요. 타자는 없습니다. 통과는 짝 " + pairsTotal + "개 중 80%입니다.";
  return pairsTotal;
}

function retally(ex) {
  if (ex.id === "vocab-check") return;
  const counts = {};
  const ids = new Set();
  for (const q of ex.questions || []) {
    if (ids.has(q.id)) throw new Error(ex.id + " duplicate id " + q.id);
    ids.add(q.id);
    counts[q.section] = (counts[q.section] || 0) + 1;
  }
  for (const s of ex.sections || []) {
    if (counts[s.id] != null) s.itemCount = counts[s.id];
  }
  ex.questionCount = (ex.questions || []).length;
}

function syncCatalog(unitDir) {
  const catPath = path.join(ROOT, unitDir, "catalog.json");
  const cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
  let changed = 0;
  for (const sec of cat.sections || []) {
    for (const e of sec.exercises || []) {
      const p = path.join(ROOT, unitDir, "exercises", e.id + ".json");
      if (!fs.existsSync(p)) continue;
      const ex = JSON.parse(fs.readFileSync(p, "utf8"));
      if (e.questionCount !== ex.questionCount) {
        e.questionCount = ex.questionCount;
        changed++;
      }
    }
  }
  if (changed) writeJSON(catPath, cat);
  return changed;
}

const report = [];
for (const unit of UNITS) {
  const dir = path.join(ROOT, unit, "exercises");
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const full = path.join(dir, file);
    const ex = JSON.parse(fs.readFileSync(full, "utf8"));
    const before = JSON.stringify(ex);
    const focus = rewriteFocus(ex);
    const parts = splitParts(ex);
    const titles = cleanSplitTitles(ex);
    const symbols = repairSymbolChoices(ex);
    const intros = cleanIntro(ex);
    const slots = markSplitFocus(ex);
    const arranged = convertArrangement(ex);
    const matched = ex.id === "vocab-check" ? toMatch(ex) : 0;
    retally(ex);
    if (JSON.stringify(ex) !== before) {
      writeJSON(full, ex);
      report.push({ file: unit.split("/").pop() + "/" + file, focus, parts, titles, slots, arranged, matched, n: ex.questions.length, count: ex.questionCount });
    }
  }
  syncCatalog(unit);
}
console.log(JSON.stringify(report, null, 2));
