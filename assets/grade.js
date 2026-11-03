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
  function matchAccept(value, accept) {
    if (value == null || String(value).trim() === "") return false;
    var list = accept || [];
    for (var i = 0; i < list.length; i++) {
      if (norm(list[i]) === norm(value) || tight(list[i]) === tight(value)) return true;
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
      for (var i = 0; i < want.length; i++) if (ids[i] !== want[i]) return false;
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
