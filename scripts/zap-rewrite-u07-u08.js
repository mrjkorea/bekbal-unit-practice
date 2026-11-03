#!/usr/bin/env node
/**
 * Reshape 중2 동아 u07/u08 items so each control is one Zap-clear action.
 * Does not invent stems or answer keys — splits, retargets, and labels only.
 */
const fs = require("fs");
const path = require("path");
const grade = require("../assets/grade.js");

const ROOT = path.join(__dirname, "..");
const UNITS = ["data/j2-donga/u07", "data/j2-donga/u08"];
const CIRC = "①②③④⑤⑥⑦⑧⑨⑩";
const LETTERS = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙ";

function norm(s) { return grade.norm(s); }

function dedupe(list) {
  const out = [];
  const seen = new Set();
  for (const raw of list || []) {
    const s = String(raw == null ? "" : raw).trim();
    if (!s) continue;
    const key = norm(s);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(s.replace(/[.]+$/g, "").trim() || s);
  }
  return out;
}

function isTaskLine(line) {
  const s = String(line || "").trim();
  if (!s || /^["“']/.test(s)) return false;
  if (/(?:하시오|고르시오|쓰시오|배열하시오|영작하시오|Choose|표시하고|골라|고르면|고르고)/.test(s)) return true;
  if (/(?:가장 적절한|가장 알맞은|바르게 짝|어색한|일치하지|일치하는 것은|틀린 것은|이유는\?|목적은\?|순서로 알맞은)/.test(s)) return true;
  return false;
}

function taskLine(text) {
  const lines = String(text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const hits = lines.filter(isTaskLine);
  return hits.length ? hits[hits.length - 1] : (lines[0] || "");
}

function directionOf(text) {
  return taskLine(text) || "문제";
}

function isNumberAnswer(s) {
  return /^[0-9①②③④⑤⑥⑦⑧⑨⑩](\s*[,，、]\s*[0-9①②③④⑤⑥⑦⑧⑨⑩])*$/.test(String(s || "").trim());
}

function extractChoices(text) {
  const opts = [];
  const kept = [];
  for (const line of String(text || "").split("\n")) {
    const found = [...line.matchAll(/([①②③④⑤⑥⑦⑧⑨⑩])\s*([^①②③④⑤⑥⑦⑧⑨⑩]+)/g)];
    const choiceLine = found.length >= 2 || /^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*\S/.test(line);
    if (choiceLine && found.length) {
      for (const f of found) {
        const t = f[2].trim().replace(/\s*[,，]\s*$/g, "");
        if (t) opts.push(t);
      }
    } else kept.push(line);
  }
  return { opts, prompt: kept.join("\n").trim() };
}

function indexesFrom(ans, n) {
  const parts = String(ans || "").split(/[,，、\s]+/).map((x) => x.trim()).filter(Boolean);
  const idx = [];
  for (const p of parts) {
    const c = CIRC.indexOf(p);
    if (c >= 0) idx.push(c + 1);
    else if (/^\d+$/.test(p)) idx.push(Number(p));
    else return null;
  }
  if (!idx.length || idx.some((i) => i < 1 || i > n)) return null;
  return [...new Set(idx)].sort((a, b) => a - b);
}

function blankMarkers(text) {
  const src = String(text);
  const numbered = [...src.matchAll(/[（(]\s*(\d+)\s*[)）]\s*(_{2,})/g)];
  if (numbered.length >= 2) return numbered.map((m) => ({ n: m[1], label: "(" + m[1] + ")" }));
  const circled = [...src.matchAll(/([ⓐ-ⓙ])\s*(_{2,})/g)];
  if (circled.length >= 2) return circled.map((m) => ({ n: m[1], label: m[1] }));
  const plain = [...src.matchAll(/_{3,}/g)];
  if (plain.length >= 2) return plain.map((_, i) => ({ n: String(i + 1), label: "(" + (i + 1) + ")" }));
  return [];
}

function cleanPiece(val) {
  return String(val || "")
    .trim()
    .replace(/^[ⓐ-ⓙ]\s*/, "")
    .replace(/^\([A-Za-z0-9]+\)\s*/, "")
    .replace(/[.]+$/g, "")
    .trim();
}

function splitPieces(answers, markers) {
  const n = markers.length;
  const per = markers.map(() => []);
  const add = (i, val) => {
    const v = cleanPiece(val);
    if (v) per[i].push(v);
  };
  let canonicalPieces = null;
  for (const ans of answers || []) {
    const s = String(ans).trim();
    if (!s) continue;
    const numbered = [...s.matchAll(/\((\d+)\)\s*([\s\S]*?)(?=\s*\(\d+\)\s*|$)/g)];
    if (numbered.length >= n) {
      const map = {};
      for (const m of numbered) map[m[1]] = m[2].trim().replace(/[.,;]+$/g, "").trim();
      if (markers.every((mk) => map[mk.n])) {
        markers.forEach((mk, i) => add(i, map[mk.n]));
        if (!canonicalPieces) canonicalPieces = markers.map((mk) => map[mk.n]);
        continue;
      }
    }
    if (s.includes(",")) {
      const bits = s.split(/\s*,\s*/).map((x) => x.trim()).filter(Boolean);
      if (bits.length === n) {
        bits.forEach((b, i) => add(i, b));
        if (!canonicalPieces) canonicalPieces = bits;
        continue;
      }
    }
    if (s.includes("/") && !s.includes(",")) {
      const bits = s.split(/\s*\/\s*/).map((x) => x.trim()).filter(Boolean);
      if (bits.length === n) {
        bits.forEach((b, i) => add(i, b));
        if (!canonicalPieces) canonicalPieces = bits;
        continue;
      }
    }
    if (canonicalPieces && canonicalPieces.every((p) => !/\s/.test(p))) {
      const ws = s.split(/\s+/).filter(Boolean);
      if (ws.length === n) ws.forEach((w, i) => add(i, w));
    }
  }
  if (per.some((a) => !a.length)) return null;
  return per.map(dedupe);
}

function bankList(text) {
  const m = String(text).match(/보기\s*[:：]\s*([^\n]+)/);
  if (m) return m[1].split(/[,/]/).map((s) => s.trim()).filter((s) => s && s !== "→");
  const lines = String(text).split("\n").map((l) => l.trim());
  const view = lines.findIndex((l) => /^\[?\s*보기\s*\]?/.test(l));
  if (view >= 0) {
    const words = [];
    for (let i = view; i < lines.length; i++) {
      const chunk = lines[i].replace(/^\[?\s*보기\s*\]?\s*[:：]?/, "").trim();
      if (!chunk) continue;
      if (/_{3,}|하시오|쓰시오|→/.test(chunk) && i > view) break;
      chunk.split(/[/|,]/).map((s) => s.trim()).filter(Boolean).forEach((w) => words.push(w));
      if (i > view && words.length >= 2 && !/[,/|]/.test(chunk)) break;
    }
    if (words.length >= 2) return words;
  }
  const paren = String(text).match(/\(([^()\n]{2,120})\)/);
  if (paren && paren[1].includes(",") && !paren[1].includes("/")) {
    return paren[1].split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function inBank(bank, word) {
  const n = norm(word);
  return bank.findIndex((b) => norm(b) === n);
}

function bankCovers(bank, phrase) {
  if (inBank(bank, phrase) >= 0) return true;
  return !!covers(phrase, bank, true);
}

function wholeSentenceBlank(prompt, accept) {
  if (!accept || String(accept).trim().split(/\s+/).length < 5) return false;
  return /(?:^|\n)\s*(?:\(\d+\)|[ⓐ-ⓙ])?\s*_{3,}\s*(?:\n|$)/.test(String(prompt));
}

function focusNote(mark, verb) {
  const label = mark && mark.label ? mark.label : "(1)";
  return "이 문항은 " + label + " 빈칸만 " + verb + ".";
}

function bankPieceItem(q, text, bank, alts, mark, showFocus) {
  const phrase = (alts || []).map(cleanPiece).find((a) => bankCovers(bank, a)) || cleanPiece((alts || [])[0]);
  const single = inBank(bank, phrase);
  if (single >= 0) {
    return baseItem(q, {
      type: "bank",
      answerMode: "bank",
      choices: bank.slice(),
      correctIndexes: [single + 1],
      focusBlank: mark.n,
      directionKo: directionOf(text),
      tag: "Choose · 보기에서 고르기",
      ruleKo: "보기에서 이 빈칸에 들어갈 말을 하나 누르세요. 쉼표로 이어서 쓰지 않아요.",
      promptKo: showFocus === false ? "" : focusNote(mark, "고릅니다"),
    });
  }
  const order = covers(phrase, bank, true);
  if (!order) {
    return baseItem(q, {
      type: "fill",
      answerMode: "words",
      accept: dedupe(alts),
      focusBlank: mark.n,
      directionKo: directionOf(text),
      tag: "Type · 빈칸 말만",
      ruleKo: "이 빈칸에 들어갈 말만 쓰세요. 보기 단어를 활용하고, 문장 전체는 쓰지 않아요.",
      promptKo: showFocus === false ? "" : focusNote(mark, "씁니다"),
    });
  }
  return baseItem(q, {
    type: "order",
    answerMode: "order",
    orderChunks: bank.map((w, i) => ({ id: "w" + i, text: w })),
    orderIds: order.map((i) => "w" + i),
    focusBlank: mark.n,
    directionKo: directionOf(text),
    tag: "Choose · 순서 누르기",
    ruleKo: showFocus === false
      ? "보기 말을 들어가는 순서대로 누르세요. 직접 쓰지 않아요."
      : "이 빈칸에 들어갈 보기 말을 순서대로 누르세요. 다른 빈칸 말은 누르지 않고, 쉼표로 쓰지도 않아요.",
    promptKo: showFocus === false ? "" : focusNote(mark, "고릅니다"),
  });
}

function parenChunks(text) {
  const m = String(text).match(/\(([^()\n]{6,})\)/);
  if (!m || !m[1].includes("/")) return null;
  const bits = m[1].split("/").map((s) => s.trim()).filter(Boolean);
  return bits.length >= 2 ? bits : null;
}

function covers(answer, chunks, allowLeftOver) {
  let rest = norm(answer).replace(/[.]/g, "");
  const pool = chunks.map((c, i) => ({ i, n: norm(c).replace(/[.]/g, "") }));
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
  if (!allowLeftOver && pool.length) return null;
  return order.length ? order : null;
}

function bracketGroups(text) {
  return [...String(text).matchAll(/\(([A-Z])\)\s*\[([^\[\]\n]+)\]/g)].map((m) => ({
    n: m[1],
    label: "(" + m[1] + ")",
    options: m[2].split("/").map((s) => s.trim()).filter(Boolean),
  }));
}

function bracketAnswers(answers, groups) {
  const per = groups.map(() => []);
  for (const ans of answers || []) {
    const s = String(ans);
    const labeled = [...s.matchAll(/\(([A-Z])\)\s*([^()]+?)(?=\s*\([A-Z]\)|$)/g)];
    if (labeled.length >= groups.length) {
      const map = {};
      for (const m of labeled) map[m[1]] = cleanPiece(m[2]);
      if (groups.every((g) => map[g.n] && g.options.some((o) => norm(o) === norm(map[g.n])))) {
        groups.forEach((g, i) => per[i].push(map[g.n]));
        continue;
      }
    }
    const bits = s.split(/\s*(?:,|\/)\s*/).map(cleanPiece).filter(Boolean);
    if (bits.length === groups.length && groups.every((g, i) => g.options.some((o) => norm(o) === norm(bits[i])))) {
      bits.forEach((b, i) => per[i].push(b));
    }
  }
  if (per.some((a) => !a.length)) return null;
  return per.map(dedupe);
}

function letterChunks(text) {
  const out = [];
  for (const line of String(text).split("\n")) {
    const m = line.match(/^\s*([ⓐ-ⓙ])\s+(.+)$/);
    if (m) out.push({ mark: m[1], id: String.fromCharCode("a".charCodeAt(0) + LETTERS.indexOf(m[1])), text: m[2].trim() });
  }
  return out;
}

function letterOrderIds(canon, chunks) {
  const key = grade.letterKey(canon);
  if (!key || key.length !== chunks.length) return null;
  const ids = chunks.map((c) => c.id);
  for (const ch of key) if (!ids.includes(ch)) return null;
  return key.split("");
}

function extractArrows(s) {
  const text = String(s || "").replace(/^\(\d+\)\s*/, "");
  const bits = text.split(/\s*(?=\(\d+\)\s*)/).map((x) => x.trim()).filter(Boolean);
  const out = [];
  for (const bit of bits.length ? bits : [text]) {
    const body = bit.replace(/^\(\d+\)\s*/, "");
    const m = body.match(/^(.+?)\s*(?:→|->|=>)\s*(.+)$/);
    if (m) out.push({ wrong: m[1].trim(), fix: m[2].trim().replace(/[.]/g, "").trim() });
  }
  return out;
}

function symbolFixes(answers) {
  const pairs = [];
  const seen = new Set();
  for (const ans of answers || []) {
    const s = String(ans);
    const re = /(?:\((\d+)\)\s*)?([ⓐ-ⓙa-e])\s*(?:→\s*)?([A-Z“"][^ⓐ-ⓙ]*?)(?=\s*(?:\(\d+\)\s*)?[ⓐ-ⓙa-e]\s*(?:→\s*)?[A-Z“"]|$)/g;
    let m;
    let any = false;
    while ((m = re.exec(s))) {
      any = true;
      const mark = m[2].length === 1 && m[2] >= "a" && m[2] <= "e"
        ? LETTERS["abcde".indexOf(m[2].toLowerCase())]
        : m[2];
      const sentence = m[3].trim().replace(/[.]?$/, ".");
      const key = mark + "|" + norm(sentence);
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ mark, sentence: sentence.replace(/\s+/g, " ").trim() });
    }
    if (!any) {
      const loose = [...s.matchAll(/([ⓐ-ⓙ])\s+((?:It|Don't|Do|The|When|Someone|People|She|He|We|I|Is|Have|My|Careful|That)\b[\s\S]*?)(?=\s+[ⓐ-ⓙ]\s+|$)/g)];
      for (const hit of loose) {
        const sentence = hit[2].trim().replace(/\s+/g, " ");
        const key = hit[1] + "|" + norm(sentence);
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push({ mark: hit[1], sentence });
      }
    }
  }
  return pairs;
}

function baseItem(q, extra) {
  return Object.assign({
    sourceId: q.id,
    group: q.group || "",
    explainKo: q.explain || q.explainKo || "",
    promptEn: String(q.question || "").trim(),
  }, extra);
}

function asChoiceItem(q, choices, indexes, mode) {
  const peeled = extractChoices(q.question);
  const multi = mode === "multi" || indexes.length > 1;
  return baseItem(q, {
    type: "mc",
    answerMode: multi ? "multi" : "choice",
    select: multi ? "multi" : "one",
    choices,
    correctIndexes: indexes,
    promptEn: peeled.opts.length === choices.length ? peeled.prompt : String(q.question || "").trim(),
    directionKo: directionOf(q.question),
    tag: multi ? "Choose · 모두 고르기" : "Choose · 고르기",
    ruleKo: multi
      ? "해당하는 것을 모두 누르세요. 번호는 쓰지 않아요."
      : "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
  });
}

function classify(q) {
  const text = String(q.question || "");
  const task = taskLine(text);
  const answers = q.answers || [];
  const canon = String(answers[0] || "");

  if (q.type === "TMC" && Array.isArray(q.answers) && q.answers.length >= 2 && q.corAns) {
    const indexes = String(q.corAns).split(/[,，]/).map((n) => Number(n.trim())).filter((n) => n >= 1);
    return [asChoiceItem(q, q.answers.slice(), indexes, indexes.length > 1 ? "multi" : "one")];
  }

  if (/올바르면/.test(text) && /[○O]/.test(text) && /[×Xx]/.test(text)) {
    let mark = "";
    const phrases = [];
    for (const a of answers) {
      const t = String(a).trim();
      if (/^[Oo○ㅇ]\.?$/.test(t)) mark = mark || "O";
      const xm = t.match(/^[Xx×✕]\s*[,:]?\s*(.+)$/);
      if (xm) {
        mark = "X";
        const phrase = xm[1].replace(/[.]+$/g, "").trim();
        if (phrase && phrase.split(/\s+/).length <= 6) phrases.push(phrase);
      }
      const arrows = extractArrows(t);
      if (arrows.length === 1 && arrows[0].fix.split(/\s+/).length <= 6) {
        mark = mark || "X";
        phrases.push(arrows[0].fix);
      }
    }
    if (!mark) mark = /^[Xx×]/.test(canon) ? "X" : "O";
    const item = baseItem(q, {
      type: "ox",
      answerMode: "choice",
      oxMark: mark,
      rewriteAccept: mark === "X" ? dedupe(phrases) : [],
      directionKo: directionOf(text),
      tag: "Choose · ○ / ×",
      ruleKo: mark === "X"
        ? "먼저 ○ 또는 ×를 누르세요. ×이면 고친 말만 쓰세요. 문장 전체는 쓰지 않아요."
        : "○ 또는 ×만 누르세요. 맞으면 고칠 말을 쓰지 않아요.",
    });
    return [item];
  }

  if (/기호를 쓰/.test(text) && /고쳐/.test(text)) {
    const pairs = symbolFixes(answers);
    const chunks = letterChunks(text);
    if (pairs.length && chunks.length) {
      return pairs.map((pair) => {
        const correct = chunks.findIndex((c) => c.mark === pair.mark) + 1;
        return baseItem(q, {
          type: "parts",
          answerMode: "parts",
          promptEn: text.trim(),
          directionKo: directionOf(text),
          tag: "Choose · 기호 + 고친 문장",
          ruleKo: "틀린 문장의 기호를 누르고, 그 문장을 고친 문장 전체를 쓰세요.",
          parts: [
            {
              kind: "mc",
              label: "틀린 문장의 기호",
              choices: chunks.map((c) => c.mark),
              correctIndexes: [correct || 1],
            },
            {
              kind: "sentence",
              label: "고친 문장 전체",
              placeholder: "고친 문장 전체",
              accept: dedupe([pair.sentence, pair.sentence.replace(/\.$/, "")]),
            },
          ],
          promptKo: pairs.length > 1 ? "틀린 문장이 여러 개면, 이 문항은 " + pair.mark + "만 고칩니다." : "",
        });
      });
    }
  }

  if (/찾아/.test(task) && /고쳐/.test(task) && !/문장을 다시 쓰|기호를 쓰/.test(task)) {
    const groups = [];
    for (const a of answers) {
      const arrows = extractArrows(a);
      if (arrows.length && (groups.length === 0 || arrows.length === groups.length)) {
        if (!groups.length) arrows.forEach(() => groups.push({ wrong: [], fix: [] }));
        arrows.forEach((ar, i) => {
          if (!groups[i]) return;
          groups[i].wrong.push(ar.wrong);
          groups[i].fix.push(ar.fix);
        });
      }
    }
    if (groups.length) {
      return groups.map((g, gi) => baseItem(q, {
        type: "parts",
        answerMode: "parts",
        directionKo: directionOf(text),
        tag: "Type · 틀린 말 / 고친 말",
        ruleKo: "틀린 말만, 그리고 고친 말만 쓰세요. 문장 전체는 쓰지 않아요.",
        promptKo: groups.length > 1 ? "틀린 곳이 여러 개면, 이 문항은 " + (gi + 1) + "번째만 고칩니다." : "",
        parts: [
          { kind: "words", label: "틀린 말", placeholder: "틀린 말만", accept: dedupe(g.wrong) },
          { kind: "words", label: "고친 말", placeholder: "고친 말만", accept: dedupe(g.fix) },
        ],
      }));
    }
  }

  const choiceInfo = extractChoices(text);
  const numbered = answers.some(isNumberAnswer);
  const selectAll = /모두 고르|Choose ALL|Choose all|번호만/.test(text);
  if ((choiceInfo.opts.length >= 2 && (numbered || selectAll || q.type === "TMC")) || (selectAll && choiceInfo.opts.length >= 2)) {
    let indexes = null;
    for (const a of answers) {
      indexes = indexesFrom(a, choiceInfo.opts.length);
      if (indexes) break;
    }
    if (!indexes) {
      const hit = choiceInfo.opts.findIndex((o) => norm(o) === norm(canon));
      if (hit >= 0) indexes = [hit + 1];
    }
    if (indexes) return [asChoiceItem(q, choiceInfo.opts, indexes, indexes.length > 1 ? "multi" : "one")];
  }

  const groups = bracketGroups(text);
  if (groups.length >= 2 && /고르|괄호/.test(task)) {
    const picks = bracketAnswers(answers, groups);
    if (picks) {
      return groups.map((g, i) => {
        const hit = g.options.findIndex((o) => picks[i].some((a) => norm(a) === norm(o)));
        return baseItem(q, {
          type: "mc",
          answerMode: "choice",
          select: "one",
          choices: g.options,
          correctIndexes: [hit + 1],
          focusBlank: g.n,
          directionKo: directionOf(text),
          tag: "Choose · 고르기",
          ruleKo: "이 괄호 안에서 알맞은 것을 하나 누르세요. 직접 쓰지 않아요.",
          promptKo: "이 문항은 " + g.label + "만 고릅니다.",
        });
      });
    }
  }

  if (/골라 쓰/.test(text)) {
    const bank = bankList(text);
    const markers = blankMarkers(text);
    const fromPieces = (pieces, marks) => pieces.map((alts, i) => bankPieceItem(q, text, bank, alts, marks[i]));
    if (bank.length && markers.length >= 2) {
      const pieces = splitPieces(answers, markers);
      if (pieces && pieces.every((alts) => alts.some((a) => bankCovers(bank, a)))) {
        return fromPieces(pieces, markers);
      }
    }
    if (bank.length >= 2 && bankCovers(bank, canon)) {
      return [bankPieceItem(q, text, bank, answers, markers[0] || { n: "1", label: "빈칸" }, false)];
    }
  }

  const letters = letterChunks(text);
  if (/기호를 순서대로|순서대로 바르게 배열/.test(text) && letters.length >= 2) {
    const ids = letterOrderIds(canon, letters);
    if (ids) {
      return [baseItem(q, {
        type: "order",
        answerMode: "order",
        orderChunks: letters.map((c) => ({ id: c.id, text: c.mark + "  " + c.text })),
        orderIds: ids,
        directionKo: directionOf(text),
        tag: "Choose · 순서 누르기",
        ruleKo: "문장을 나올 순서대로 누르세요. b-d-c-a처럼 기호를 쓰지 않아요.",
      })];
    }
  }

  const marks = blankMarkers(text);
  if (marks.length >= 2) {
    const pieces = splitPieces(answers, marks);
    if (pieces) {
      const bank = /골라/.test(text) ? bankList(text) : [];
      return pieces.map((alts, i) => {
        if (bank.length && alts.some((a) => bankCovers(bank, a))) return bankPieceItem(q, text, bank, alts, marks[i]);
        const phrase = alts.some((a) => /\s/.test(a));
        const inflect = /어형을 바꿀|형태로 바/.test(text);
        const whole = wholeSentenceBlank(text, alts[0]);
        if (whole) {
          return baseItem(q, {
            type: "sentence",
            answerMode: "sentence",
            accept: alts,
            focusBlank: marks[i].n,
            directionKo: directionOf(text),
            tag: "Type · 문장 전체",
            ruleKo: "이 빈칸에 영어 문장 전체를 쓰세요. 끝 마침표는 있어도 되고 없어도 됩니다.",
            promptKo: focusNote(marks[i], "씁니다"),
          });
        }
        return baseItem(q, {
          type: "fill",
          answerMode: "words",
          accept: alts,
          focusBlank: marks[i].n,
          phraseBlank: phrase,
          directionKo: directionOf(text),
          tag: "Type · 빈칸 말만",
          ruleKo: inflect
            ? "보기 단어의 형태를 바꿔 이 빈칸에 들어갈 말만 쓰세요. 문장 전체는 쓰지 않아요."
            : phrase
            ? "이 빈칸에 들어갈 말만 쓰세요. 두 단어 이상이어도 문장 전체는 쓰지 않아요."
            : "이 빈칸에 들어갈 말만 쓰세요. 다른 빈칸이나 문장 전체는 쓰지 않아요.",
          promptKo: focusNote(marks[i], "씁니다"),
        });
      });
    }
  }

  const oneBracket = [...text.matchAll(/\[([^\[\]\n]+\/[^\[\]\n]+)\]/g)];
  if (oneBracket.length === 1 && /고르|괄호/.test(task)) {
    const options = oneBracket[0][1].split("/").map((s) => s.trim()).filter(Boolean);
    const hit = options.findIndex((o) => answers.some((a) => norm(a) === norm(o)));
    if (hit >= 0) {
      return [baseItem(q, {
        type: "mc",
        answerMode: "choice",
        select: "one",
        choices: options,
        correctIndexes: [hit + 1],
        directionKo: directionOf(text),
        tag: "Choose · 고르기",
        ruleKo: "괄호 안에서 알맞은 것을 하나 누르세요. 직접 쓰지 않아요.",
      })];
    }
  }

  const chunks = parenChunks(text);
  if (chunks && /배열/.test(task)) {
    const order = covers(canon, chunks);
    if (order) {
      return [baseItem(q, {
        type: "order",
        answerMode: "order",
        orderChunks: chunks.map((c, i) => ({ id: "c" + i, text: c })),
        orderIds: order.map((i) => "c" + i),
        directionKo: directionOf(text),
        tag: "Choose · 순서 누르기",
        ruleKo: "주어진 말을 들어가는 순서대로 누르세요. 직접 쓰지 않아요.",
      })];
    }
  }

  const korean = /[가-힣]/.test(canon) && !/[A-Za-z]/.test(canon.split(",")[0] || canon);
  const oneBlank = (text.match(/_{3,}/g) || []).length === 1;
  const sentenceAsk = /영작|문장을 다시 쓰|문장으로|다시 쓰시오/.test(task) && !/빈칸에 들어갈/.test(task);
  const long = canon.trim().split(/\s+/).length >= 5 || /[.?!]$/.test(canon.trim());
  if (!oneBlank && sentenceAsk && long && !korean) {
    return [baseItem(q, {
      type: "sentence",
      answerMode: "sentence",
      accept: dedupe(answers),
      directionKo: directionOf(text),
      tag: "Type · 문장 전체",
      ruleKo: "영어 문장 전체를 쓰세요. 빈칸 말만 쓰지 말고, 단어 순서는 답 그대로 쓰세요. 끝 마침표는 있어도 되고 없어도 됩니다.",
    })];
  }

  if (wholeSentenceBlank(text, canon) && /[A-Za-z]/.test(canon)) {
    return [baseItem(q, {
      type: "sentence",
      answerMode: "sentence",
      accept: dedupe(answers),
      directionKo: directionOf(text),
      tag: "Type · 문장 전체",
      ruleKo: "이 빈칸에 영어 문장 전체를 쓰세요. 끝 마침표는 있어도 되고 없어도 됩니다.",
    })];
  }

  let rule = "빈칸에 들어갈 말만 쓰세요. 문장 전체는 쓰지 않아요.";
  if (/우리말로/.test(task) || (korean && /뜻|우리말/.test(task))) {
    rule = "우리말만 쓰세요. 영어 문장은 쓰지 않아요. 같은 뜻이면 답안에 있는 말 중 하나로 쓰면 됩니다.";
  } else if (/영어로 쓰|영영풀이/.test(task)) {
    rule = "영어 단어나 표현만 쓰세요. 문장 전체를 만들지 않아요.";
  } else if (oneBlank) {
    rule = "빈칸에 들어갈 말만 쓰세요. 앞뒤에 이미 있는 말은 다시 쓰지 않아요.";
  } else if (chunks) {
    rule = "괄호 안 말을 활용해 빈칸에 들어갈 말만 쓰세요. 형태를 바꿔야 하면 바꾼 말만 쓰세요.";
  }

  return [baseItem(q, {
    type: "fill",
    answerMode: "words",
    accept: dedupe(answers),
    directionKo: directionOf(text),
    tag: "Type · 빈칸 말만",
    ruleKo: rule,
    phraseBlank: /\s/.test(canon) && !korean,
  })];
}

function sectionTitle(direction, index) {
  const clean = String(direction || "Section").replace(/\s+/g, " ").trim();
  const short = clean.length > 42 ? clean.slice(0, 40) + "…" : clean;
  return "Section " + String.fromCharCode(65 + (index % 26)) + " · " + short;
}

function packExercise(ex) {
  if (ex.sectionsVersion === 2 && ex.questions && ex.questions[0] && ex.questions[0].answerMode) {
    return { next: ex, warnings: [] };
  }
  const rawItems = [];
  const warnings = [];
  for (const q of ex.questions || []) {
    let made;
    try { made = classify(q); }
    catch (err) { warnings.push(ex.id + "#" + q.id + " " + err.message); continue; }
    if (!made || !made.length) warnings.push(ex.id + "#" + q.id + " empty");
    rawItems.push(...made);
  }
  const sections = [];
  let current = null;
  const bySource = new Map();
  for (const item of rawItems) {
    const arr = bySource.get(item.sourceId) || [];
    arr.push(item);
    bySource.set(item.sourceId, arr);
  }
  for (const [sid, arr] of bySource) {
    arr.forEach((item, i) => {
      const suffix = arr.length === 1 ? "" : "-" + (item.focusBlank || (i + 1));
      item.id = String(sid) + suffix;
    });
  }
  const seenId = new Map();
  for (const item of rawItems) {
    const n = (seenId.get(item.id) || 0) + 1;
    seenId.set(item.id, n);
    if (n > 1) item.id = item.id + "-" + n;
  }

  rawItems.forEach((item, i) => {
    const key = [item.answerMode, item.tag, item.directionKo, item.ruleKo].join("|");
    if (!current || current.key !== key) {
      current = {
        key,
        id: "s" + (sections.length + 1),
        title: sectionTitle(item.directionKo, sections.length),
        directionKo: item.directionKo,
        ruleKo: item.ruleKo,
        instructionKo: item.directionKo + " " + item.ruleKo,
        answerMode: item.answerMode,
        answerModeTag: item.tag,
        itemCount: 0,
      };
      sections.push(current);
    }
    current.itemCount++;
    item.section = current.id;
    item.sectionTitle = current.title;
    item.sectionInstructionKo = current.instructionKo;
    item.answerModeTag = item.tag;
    item.label = String(i + 1);
    delete item.tag;
  });
  const intro = sections.length
    ? "이 연습은 " + sections.map((s) => s.title.replace(/^Section [A-Z] · /, "") + " " + s.itemCount + "문항").slice(0, 4).join(", ")
      + (sections.length > 4 ? " 외" : "")
      + "으로 되어 있어요. 각 섹션 맨 위의 안내를 읽고, '빈칸 말만'이면 빈칸에 들어갈 말만, '문장 전체'면 문장 전체를 쓰세요. 고르기는 누르기만 하면 됩니다."
    : "";
  const next = Object.assign({}, ex, {
    sectionsVersion: 2,
    introKo: intro,
    sections: sections.map(({ key, ...rest }) => rest),
    questionCount: rawItems.length,
    questions: rawItems,
  });
  return { next, warnings };
}

function updateCatalog(unitDir, counts) {
  const catPath = path.join(ROOT, unitDir, "catalog.json");
  const cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
  if (typeof cat.note === "string") {
    cat.note = cat.note
      .replace(/정답과 해설이 나오면 종이 교재에도 직접 쓰세요\.?\s*/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!/다시 풀기 전/.test(cat.note)) {
      cat.note = (cat.note ? cat.note + " " : "") + "틀리고 다시 풀기 전에만 종이 교재 안내가 나옵니다.";
    }
  }
  for (const sec of cat.sections || []) {
    for (const ex of sec.exercises || []) {
      if (counts[ex.id] != null) ex.questionCount = counts[ex.id];
    }
  }
  fs.writeFileSync(catPath, JSON.stringify(cat, null, 2) + "\n");
}

function main() {
  const report = [];
  for (const unit of UNITS) {
    const dir = path.join(ROOT, unit, "exercises");
    const counts = {};
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const full = path.join(dir, file);
      const ex = JSON.parse(fs.readFileSync(full, "utf8"));
      const before = (ex.questions || []).length;
      const { next, warnings } = packExercise(ex);
      fs.writeFileSync(full, JSON.stringify(next, null, 2) + "\n");
      counts[next.id || file.replace(/\.json$/, "")] = next.questions.length;
      const modes = {};
      for (const q of next.questions) modes[q.type] = (modes[q.type] || 0) + 1;
      report.push({ unit, file, before, after: next.questions.length, modes, warnings });
    }
    updateCatalog(unit, counts);
  }
  const warn = report.reduce((n, r) => n + r.warnings.length, 0);
  console.log(JSON.stringify(report.map((r) => ({
    file: r.unit.split("/").pop() + "/" + r.file,
    before: r.before,
    after: r.after,
    modes: r.modes,
    warnings: r.warnings.slice(0, 8),
  })), null, 2));
  console.error("warnings", warn);
}

main();
