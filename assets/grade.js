/* Answer grading for Bekbal practice. No audio. Works in the browser and in Node. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.BekbalGrade = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function norm(s) {
    return String(s == null ? "" : s)
      .trim()
      .replace(/^[A-Za-z]{1,12}\s*:\s*/, "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .replace(/\s*([,;:/])\s*/g, "$1")
      .replace(/[.!?。]+$/g, "")
      .replace(/[()[\]{}]/g, "");
  }
  function tight(s) {
    return norm(s).replace(/\s+/g, "");
  }
  /* Hangul answer tolerance.
     Jay 2026-11-24: a 중1 student wrote "서각장애인 여자와 그녀의 선생님에 대한
     영화야" for "시각 장애인 소녀와 그녀의 선생님에 관한 영화였다" and was marked
     wrong. The key holds a MODEL sentence, so comparing it letter for letter
     punishes a right answer written in other words — the exact failure a student
     sees as "the website is wrong". A 우리말 answer is graded on the words it
     carries: most of the model's content words must be there, one typo allowed. */
  var HANGUL = /[\uAC00-\uD7A3]/;
  var TRAIL_PARTICLE = /(의|에|에서|에게|을|를|이|가|은|는|와|과|도|만|로|으로)$/;
  var NEGATION = /(아니|아닌|않|못|없|말고)/;

  function koFlat(s) {
    return norm(s).replace(/~/g, " ").replace(/[^\uAC00-\uD7A3a-z0-9]/g, "");
  }
  function editAtMost1(a, b) {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0;
    while (i < a.length && i < b.length && a.charAt(i) === b.charAt(i)) i++;
    if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
    if (a.length > b.length) return a.slice(i + 1) === b.slice(i);
    return a.slice(i) === b.slice(i + 1);
  }
  function koHit(word, flat) {
    if (flat.indexOf(word) >= 0) return true;
    for (var i = 0; i < flat.length; i++) {
      for (var len = Math.max(2, word.length - 1); len <= word.length + 1; len++) {
        var seg = flat.substr(i, len);
        if (seg.length >= 2 && editAtMost1(word, seg)) return true;
      }
    }
    return false;
  }
  function koMatch(value, expected) {
    var flat = koFlat(value);
    var want = koFlat(expected);
    if (!flat || !want) return false;
    /* Only a MODEL SENTENCE is graded this way. A short key ("소리", "부사",
       "죽은, 사망한") is one word the student either knows or does not, and
       fuzzy matching there marks a wrong word right. 12 characters is the
       shortest 우리말 answer that is a sentence rather than a label. */
    if (want.length < 12) return false;
    var words = String(expected)
      .split(/\s+/)
      .map(function (w) { return koFlat(w).replace(TRAIL_PARTICLE, ""); })
      .filter(function (w) { return w.length >= 2; });
    if (!words.length) return flat.indexOf(want) >= 0;
    var hits = 0;
    for (var i = 0; i < words.length; i++) if (koHit(words[i], flat)) hits++;
    if (hits / words.length < 0.75) return false;
    /* "…에 관한 영화가 아니었다" carries every word of the model answer and says
       the opposite. A no the model answer does not have is a miss. */
    if (NEGATION.test(flat) && !NEGATION.test(want)) return false;
    return flat.length >= want.length * 0.5;
  }
  function matchAccept(value, accept) {
    if (value == null || String(value).trim() === "") return false;
    var list = accept || [];
    for (var i = 0; i < list.length; i++) {
      if (norm(list[i]) === norm(value) || tight(list[i]) === tight(value)) return true;
      if (HANGUL.test(list[i]) && koMatch(value, list[i])) return true;
    }
    return false;
  }
  function sameSet(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    var as = a.slice().sort(function (x, y) { return x - y; });
    var bs = b.slice().sort(function (x, y) { return x - y; });
    for (var i = 0; i < as.length; i++) if (as[i] !== bs[i]) return false;
    return true;
  }
  function letterKey(s) {
    var circ = { "ⓐ": "a", "ⓑ": "b", "ⓒ": "c", "ⓓ": "d", "ⓔ": "e", "ⓕ": "f", "ⓖ": "g", "ⓗ": "h", "ⓘ": "i", "ⓙ": "j" };
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[ⓐ-ⓙ]/g, function (ch) { return circ[ch] || ch; })
      .replace(/[^a-z]/g, "");
  }

  function pairById(item, id) {
    var pairs = item.pairs || [];
    for (var i = 0; i < pairs.length; i++) {
      if (String(pairs[i].id) === String(id)) return pairs[i];
    }
    return null;
  }

  function matchDetail(item, response) {
    var pairs = item.pairs || [];
    var links = (response && response.links) || [];
    var map = {};
    for (var i = 0; i < links.length; i++) {
      var link = links[i] || [];
      if (link[0] != null && String(link[0]) !== "") map[String(link[0])] = String(link[1]);
    }
    var correct = 0;
    for (var j = 0; j < pairs.length; j++) {
      if (map[String(pairs[j].id)] === String(pairs[j].id)) correct++;
    }
    return { correct: correct, total: pairs.length, links: links };
  }

  function scoreUnits(item, response) {
    if (item.type === "match") {
      var d = matchDetail(item, response);
      return { got: d.correct, total: d.total };
    }
    return { got: gradeItem(item, response) ? 1 : 0, total: 1 };
  }

  function gradeItem(item, response) {
    response = response || {};
    if (item.type === "match") {
      var detail = matchDetail(item, response);
      var links = detail.links || [];
      return detail.total > 0 && links.length === detail.total && detail.correct === detail.total;
    }
    if (item.type === "mc" || item.type === "bank") {
      var got = response.indexes || [];
      var exp = item.correctIndexes || [];
      if (!exp.length) return false;
      if (item.select === "multi" || item.answerMode === "multi") return sameSet(got, exp);
      return got.length === 1 && got[0] === exp[0];
    }
    if (item.type === "order") {
      var ids = response.order || [];
      var want = item.orderIds || [];
      if (!want.length || ids.length !== want.length) return false;
      /* Jay 2026-11-17: a sentence with a repeated word ("I am a plastic duck
         and I am a bath toy") shows two chips with the same word. The student
         cannot tell the two "I" chips apart, so the order is judged by the
         WORDS that ended up in the tray, not by which copy of the chip they
         happened to press. Comparing chip ids marked a word-perfect answer
         wrong. */
      var orderText = {};
      (item.orderChunks || []).forEach(function (c) {
        orderText[c.id] = String(c.text == null ? "" : c.text).replace(/\s+/g, " ").trim();
      });
      for (var i = 0; i < want.length; i++) {
        if (!ids[i] || orderText[ids[i]] == null) return false;
        if (orderText[ids[i]] !== orderText[want[i]]) return false;
      }
      return true;
    }
    if (item.type === "ox") {
      var pick = String(response.value || "").toUpperCase();
      if (pick === "○" || pick === "O") pick = "O";
      if (pick === "×" || pick === "X") pick = "X";
      if (pick !== item.oxMark) return false;
      if (item.oxMark === "X" && item.rewriteAccept && item.rewriteAccept.length) {
        return matchAccept(response.rewrite, item.rewriteAccept);
      }
      return true;
    }
    if (item.type === "parts") {
      var parts = item.parts || [];
      var gotParts = response.parts || [];
      if (gotParts.length < parts.length) return false;
      for (var p = 0; p < parts.length; p++) {
        var part = parts[p];
        var val = gotParts[p];
        if (part.kind === "mc") {
          if (val === "" || val == null || !/^\d+$/.test(String(val))) return false;
          var ix = Number(val);
          if (!part.correctIndexes || part.correctIndexes[0] !== ix) return false;
        } else if (!matchAccept(val, part.accept || [])) return false;
      }
      return true;
    }
    return matchAccept(response.value, item.accept || []);
  }

  function choiceText(item, index) {
    var list = item.choices || [];
    return list[index - 1] != null ? list[index - 1] : "";
  }

  function formatCorrect(item) {
    if (item.type === "match") {
      return (item.pairs || []).map(function (p) { return p.en + " → " + p.ko; }).join("\n");
    }
    if (item.type === "mc" || item.type === "bank") {
      return (item.correctIndexes || [])
        .map(function (n) { return n + ". " + choiceText(item, n); })
        .join("  ·  ");
    }
    if (item.type === "order") {
      var map = {};
      (item.orderChunks || []).forEach(function (c) { map[c.id] = c.text; });
      return (item.orderIds || []).map(function (id) { return map[id] || id; }).join(" → ");
    }
    if (item.type === "ox") {
      if (item.oxMark === "O") return "○";
      return "×  ·  " + ((item.rewriteAccept && item.rewriteAccept[0]) || "");
    }
    if (item.type === "parts") {
      return (item.parts || [])
        .map(function (part) {
          if (part.kind === "mc") {
            var ix = part.correctIndexes[0];
            var shown = part.indexBase === 0 ? part.choices[ix] : part.choices[(ix || 1) - 1];
            return part.label + ": " + (shown || "");
          }
          return part.label + ": " + ((part.accept && part.accept[0]) || "");
        })
        .join("\n");
    }
    return (item.accept && item.accept[0]) || "";
  }

  function formatResponse(item, response) {
    response = response || {};
    if (item.type === "match") {
      var links = response.links || [];
      if (!links.length) return "(무응답)";
      return links.map(function (link) {
        var left = pairById(item, link[0]);
        var right = pairById(item, link[1]);
        var en = left ? left.en : link[0];
        var ko = right ? right.ko : link[1];
        var mark = left && right && String(left.id) === String(right.id) ? "✓ " : "× ";
        return mark + en + " → " + ko;
      }).join("\n");
    }
    if (item.type === "mc" || item.type === "bank") {
      var idxs = response.indexes || [];
      if (!idxs.length) return "(무응답)";
      return idxs.map(function (n) { return n + ". " + choiceText(item, n); }).join("  ·  ");
    }
    if (item.type === "order") {
      var map = {};
      (item.orderChunks || []).forEach(function (c) { map[c.id] = c.text; });
      var ids = response.order || [];
      if (!ids.length) return "(무응답)";
      return ids.map(function (id) { return map[id] || id; }).join(" → ");
    }
    if (item.type === "ox") {
      if (!response.value) return "(무응답)";
      var mark = response.value === "O" ? "○" : response.value === "X" ? "×" : response.value;
      if (response.rewrite) return mark + "  ·  " + response.rewrite;
      return mark;
    }
    if (item.type === "parts") {
      var bits = (item.parts || []).map(function (part, i) {
        var val = (response.parts || [])[i];
        if (part.kind === "mc") {
          if (val === "" || val == null) return part.label + ": (무응답)";
          var choice = part.indexBase === 0 ? part.choices[Number(val)] : part.choices[Number(val) - 1];
          return part.label + ": " + (choice || val);
        }
        return part.label + ": " + (val ? val : "(무응답)");
      });
      return bits.join("\n");
    }
    if (response.value == null || String(response.value).trim() === "") return "(무응답)";
    return String(response.value);
  }

  function secondsFor(item) {
    if (item.seconds) return item.seconds;
    if (item.type === "match") return Math.max(60, 18 * ((item.pairs && item.pairs.length) || 1));
    if (item.type === "mc" || item.type === "bank" || item.type === "order") return 45;
    if (item.type === "ox") return item.rewriteAccept && item.rewriteAccept.length ? 75 : 40;
    if (item.type === "parts") return 90;
    if (item.type === "sentence") return 100;
    if (item.focusBlank) return 32;
    return 70;
  }

  return {
    norm: norm,
    tight: tight,
    matchAccept: matchAccept,
    letterKey: letterKey,
    gradeItem: gradeItem,
    matchDetail: matchDetail,
    scoreUnits: scoreUnits,
    formatCorrect: formatCorrect,
    formatResponse: formatResponse,
    secondsFor: secondsFor,
  };
});
