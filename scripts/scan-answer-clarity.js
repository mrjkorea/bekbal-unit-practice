#!/usr/bin/env node
/** Fail if any u07/u08 item is MC-as-write, packs different blanks into one field, or types a letter order. */
const fs = require("fs");
const path = require("path");
const grade = require("../assets/grade.js");

const ROOT = path.join(__dirname, "..");
const UNITS = ["data/j2-donga/u07/exercises", "data/j2-donga/u08/exercises"];

function markers(text) {
  const numbered = [...String(text || "").matchAll(/[（(]\s*(\d+)\s*[)）]\s*(_{2,})/g)];
  if (numbered.length >= 2) return numbered.length;
  return (String(text || "").match(/_{3,}/g) || []).length;
}
function commaBits(s) {
  return String(s || "").split(/\s*,\s*/).map((x) => x.trim()).filter(Boolean);
}
function asksChoose(item) {
  const text = [item.promptEn, item.directionKo, item.sectionInstructionKo, item.ruleKo].join("\n");
  return /모두 고르|번호만|Choose ALL|Choose all|골라 쓰|고르시오|고르면|고르고/.test(text);
}
function numberList(s) {
  return /^\s*[0-9①②③④⑤⑥⑦⑧⑨⑩](\s*[,，]\s*[0-9①②③④⑤⑥⑦⑧⑨⑩])*\s*\.?\s*$/.test(String(s || ""));
}

function mcAsWrite(item) {
  if (item.type === "mc" || item.type === "bank" || item.type === "order" || item.type === "ox") return false;
  if (item.type === "parts" && (item.parts || []).some((p) => p.kind === "mc")) return false;
  if (item.type === "parts" && !(item.parts || []).some((p) => (p.accept || []).some(numberList))) return false;
  if (!asksChoose(item)) return false;
  const accepts = item.accept || [];
  if (accepts.some(numberList)) return true;
  const blob = [item.directionKo, item.promptEn, item.ruleKo].join("\n");
  if (/어형을 바꿀|형태로 바/.test(blob) && item.focusBlank && !(item.accept || []).some(numberList)) return false;
  if (/골라 쓰|번호만|모두 고르|Choose ALL/.test(blob)) return true;
  return false;
}

function tightKey(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9가-힣]/g, "");
}
function hangulGloss(s) {
  const bits = String(s).split(/\s*[,，]\s*/).map((x) => x.trim()).filter(Boolean);
  if (bits.length < 2) return false;
  return bits.every((b) => /^[가-힣0-9\s·~.:();\-]+$/.test(b));
}
function synonymBundle(s, accepts) {
  const bits = String(s).split(/\s*[,，]\s*/).map((x) => x.trim()).filter(Boolean);
  if (bits.length < 2) return false;
  const set = new Set((accepts || []).map((x) => tightKey(x)));
  return bits.every((b) => set.has(tightKey(b)));
}
function spacingTwin(s, accepts) {
  if (/\s/.test(String(s))) return false;
  const key = tightKey(s);
  if (!key) return false;
  return (accepts || []).some((a) => a !== s && tightKey(a) === key && /\s/.test(String(a)));
}
function letterSequence(s) {
  const t = String(s || "").trim();
  if (!t || t.length > 48) return false;
  if (/(?:[ⓐ-ⓙ]|\([A-Ja-j]\))(?:\s*[-–]\s*(?:[ⓐ-ⓙ]|\([A-Ja-j]\))){2,}/.test(t)) return true;
  if (/^[A-Ja-j](?:\s*[-–]\s*[A-Ja-j]){2,}$/.test(t)) return true;
  return false;
}
function compactOrderLetters(item) {
  if (item.focusBlank) return false;
  const where = (item.directionKo || "") + "\n" + (item.ruleKo || "");
  if (!/순서|배열/.test(where)) return false;
  return (item.accept || []).some((a) => /^[a-j]{4,8}$/i.test(String(a).trim()));
}
function shortCommaList(s) {
  const t = String(s || "").trim();
  if (!/[,，]/.test(t)) return false;
  if (/[?!]/.test(t) || /["“”']/.test(t)) return false;
  const bits = t.split(/\s*[,，]\s*/).map((x) => x.trim()).filter(Boolean);
  if (bits.length < 2) return false;
  if (bits.some((b) => b.split(/\s+/).length > 4)) return false;
  return true;
}
function packedNumberSlots(s) {
  const t = String(s || "");
  const marks = t.match(/\(\s*\d+\s*\)/g) || [];
  if (marks.length >= 2) return true;
  return marks.length === 1 && /\S\s+\(\s*\d+\s*\)/.test(t);
}
function numberedBlankCount(text) {
  return [...String(text || "").matchAll(/[（(]\s*\d+\s*[)）]\s*_{2,}/g)].length;
}
function listedNumberSlots(text) {
  return String(text || "").split("\n").map((l) => l.trim()).filter((l) => /^\(\s*[1-9]\s*\)$/.test(l)).length;
}
function answerStrings(item) {
  const list = (item.accept || []).slice();
  for (const part of item.parts || []) {
    for (const a of part.accept || []) list.push(a);
  }
  return list;
}
function packedAccept(s, accepts) {
  const t = String(s || "").trim();
  if (!t) return false;
  if (spacingTwin(t, accepts)) return false;
  if (/\s\/\s/.test(t)) return true;
  if (/\([A-Za-z]\)[\s\S]*\([A-Za-z]\)/.test(t)) return true;
  if (/[ⓐ-ⓙ]\s+\S[\s\S]*[ⓐ-ⓙ]\s+\S/.test(t)) return true;
  if (/[,，]/.test(t) && !hangulGloss(t) && !synonymBundle(t, accepts) && shortCommaList(t)) return true;
  return false;
}
function packedKind(item) {
  const answers = answerStrings(item);
  if (item.type === "fill" || item.type === "parts") {
    if (answers.some(packedNumberSlots)) return "multi-blank";
  }
  if (item.type !== "fill") return null;
  const accepts = item.accept || [];
  if (accepts.some(letterSequence) || compactOrderLetters(item)) return "letter-seq";
  if (item.focusBlank) return null;
  if (accepts.some((a) => packedAccept(a, accepts))) return "multi-blank";
  if (numberedBlankCount(item.promptEn) >= 2 || listedNumberSlots(item.promptEn) >= 2) return "multi-blank";
  const n = markers(item.promptEn);
  if (n < 2) return null;
  const bits = commaBits(accepts[0]);
  const instr = (item.directionKo || "") + (item.promptEn || "");
  if (bits.length >= 2 && (bits.length === n || /순서대로|번호 순서/.test(instr))) return "multi-blank";
  return null;
}

function correctResponse(item) {
  if (item.type === "mc" || item.type === "bank") return { indexes: (item.correctIndexes || []).slice() };
  if (item.type === "order") return { order: (item.orderIds || []).slice() };
  if (item.type === "ox") return { value: item.oxMark, rewrite: (item.rewriteAccept || [])[0] || "" };
  if (item.type === "parts") {
    return {
      parts: (item.parts || []).map((p) => p.kind === "mc" ? String((p.correctIndexes || [])[0] || "") : (p.accept || [])[0] || ""),
    };
  }
  return { value: (item.accept || [])[0] || "" };
}

const problems = [];
let items = 0;
let gradedOk = 0;
const files = [];
for (const dir of UNITS) {
  for (const file of fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(".json"))) {
    const ex = JSON.parse(fs.readFileSync(path.join(ROOT, dir, file), "utf8"));
    const ids = new Set();
    for (const q of ex.questions || []) {
      items++;
      const loc = dir.split("/")[2] + "/" + file + "#" + q.id;
      if (ids.has(q.id)) problems.push({ kind: "dup-id", loc });
      ids.add(q.id);
      if (!q.answerMode || !q.section || !q.ruleKo || !q.directionKo) problems.push({ kind: "missing-rule", loc });
      if (mcAsWrite(q)) problems.push({ kind: "mc-as-write", loc, dir: q.directionKo });
      const packed = packedKind(q);
      if (packed) problems.push({ kind: packed, loc, ans: (q.accept || [])[0] });
      if ((q.type === "mc" || q.type === "bank") && (!(q.choices || []).length || !(q.correctIndexes || []).length)) {
        problems.push({ kind: "bad-choice", loc });
      }
      if ((q.type === "mc" || q.type === "bank") && (q.correctIndexes || []).some((n) => n < 1 || n > (q.choices || []).length)) {
        problems.push({ kind: "bad-index", loc, indexes: q.correctIndexes, n: (q.choices || []).length });
      }
      if (q.type === "ox" && q.oxMark === "X" && !(q.rewriteAccept || []).length) problems.push({ kind: "ox-no-rewrite", loc });
      if (q.type === "parts" && (q.parts || []).some((p) => p.kind !== "mc" && !(p.accept || []).length)) problems.push({ kind: "part-empty", loc });
      if (q.type === "order" && (!(q.orderIds || []).length || (q.orderIds || []).some((id) => !(q.orderChunks || []).some((c) => c.id === id)))) {
        problems.push({ kind: "bad-order", loc });
      }
      if ((q.type === "fill" || q.type === "sentence") && !(q.accept || []).length) problems.push({ kind: "no-accept", loc });
      const sec = (ex.sections || []).find((s) => s.id === q.section);
      if (!sec || !sec.instructionKo || !sec.ruleKo) problems.push({ kind: "section", loc });
      const ok = grade.gradeItem(q, correctResponse(q));
      if (!ok) problems.push({ kind: "grade-miss", loc, type: q.type, correct: grade.formatCorrect(q) });
      else gradedOk++;
      const bad = grade.gradeItem(q, q.type === "mc" || q.type === "bank" ? { indexes: [99] } : q.type === "order" ? { order: ["zz"] } : q.type === "ox" ? { value: q.oxMark === "O" ? "X" : "O", rewrite: "nope" } : q.type === "parts" ? { parts: (q.parts || []).map(() => "___nope___") } : { value: "___nope___" });
      if (bad) problems.push({ kind: "grade-false-pass", loc });
    }
    files.push(file);
  }
}

const byKind = {};
for (const p of problems) byKind[p.kind] = (byKind[p.kind] || 0) + 1;
console.log(JSON.stringify({ items, gradedOk, files: files.length, byKind, sample: problems.slice(0, 40) }, null, 2));
const blockers = problems.filter((p) => p.kind === "mc-as-write" || p.kind === "multi-blank" || p.kind === "letter-seq");
process.exit(blockers.length || problems.some((p) => p.kind === "grade-miss" || p.kind === "bad-index" || p.kind === "no-accept" || p.kind === "part-empty" || p.kind === "ox-no-rewrite") ? 1 : 0);
