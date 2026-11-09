/* Reading Focus player — sentences only, no pictures.
   Same rhythm as Word Master: groups of five, dictation then writing then a five-question test,
   and a missed sentence comes back until it is answered right twice in a row. Pass at 80%. */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var book = params.get("b") || "";
  var unit = params.get("u") || "";
  var PACK = params.get("pack") || ("packs/" + book + "_" + unit + "_reading01.json");
  var PASS = 80;
  // The eight voices Jay uses in Word Master: same order, same labels.
  var VOICES = [
    { id: "us_m", label: "미국 남자", lang: "en-US", pitch: 0.95, rate: 0.92 },
    { id: "us_f", label: "미국 여자", lang: "en-US", pitch: 1.12, rate: 0.94 },
    { id: "uk_m", label: "영국 남자", lang: "en-GB", pitch: 0.9, rate: 0.9 },
    { id: "uk_f", label: "영국 여자", lang: "en-GB", pitch: 1.1, rate: 0.92 },
    { id: "grandma", label: "할머니", lang: "en-US", pitch: 1.28, rate: 0.82 },
    { id: "teenager", label: "십대", lang: "en-US", pitch: 1.18, rate: 1.02 },
    { id: "grandpa", label: "할아버지", lang: "en-US", pitch: 0.72, rate: 0.84 },
    { id: "robot", label: "로봇", lang: "en-US", pitch: 0.5, rate: 0.86, robot: true }
  ];
  var voiceId = localStorage.getItem("rf_voice") || "us_m";

  var GROUP = 5;
  var NEED = 2; // consecutive rights before a sentence is cleared

  var main = document.getElementById("rf-main");
  var titleEl = document.getElementById("rf-title");
  var scoreEl = document.getElementById("rf-score");
  var stepsEl = document.getElementById("rf-steps");

  var cards = [];
  var step = "dictation";
  var groupIndex = 0;
  var groups = [];
  var queue = [];
  var current = null;
  var streak = {};
  var firstTry = {};
  var right = 0;
  var asked = 0;

  /* MRJ Classroom Metrics. One row per finished group, then one row for the whole unit.
     The sheet is the only place a score goes: program bekbal-reading, appName Reading Focus. */
  var bookTitle = "";
  var unitTitle = "";
  var testTally = {};   // "<step>:<group>" -> {right,total}, latest attempt, every step counted
  var unitPosted = false;
  var runSerial = 0;
  var postedRuns = {};
  var SCORE_PROGRAM = "bekbal-reading";

  function postScore(itemId, value, max, meta) {
    try {
      if (!window.MRJ_SCORES || typeof window.MRJ_SCORES.post !== "function") return;
      var p = window.MRJ_SCORES.post({
        program: SCORE_PROGRAM,
        appName: "Reading Focus",
        bookTitle: bookTitle,
        unitTitle: unitTitle,
        itemId: itemId,
        itemType: "reading_focus",
        scoreValue: value,
        scoreMax: max,
        eventKind: "learning_result",
        metadata: meta || {}
      });
      if (p && p.then) {
        p.then(function (res) {
          if (res && (res.status === "skipped" || res.error)) {
            console.warn("[reading] score not sent", itemId, (res && res.status) || "", (res && res.error) || "");
          } else {
            console.log("[reading] score sent", itemId, value + "/" + max, (res && res.status) || "");
          }
        }).catch(function (e) { console.warn("[reading] score post failed", e); });
      }
    } catch (e) {
      console.warn("[reading] score error", e);
    }
  }

  function unitTag() {
    return (book || "") + "_" + (unit || "");
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function norm(s) {
    return String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  }
  function acceptList(card) {
    return Array.isArray(card.accept) && card.accept.length ? card.accept : [card.en];
  }
  function isRight(card, typed) {
    var t = norm(typed);
    if (!t) return false;
    return acceptList(card).some(function (a) { return norm(a) === t; });
  }
  function voiceNow() {
    for (var i = 0; i < VOICES.length; i++) if (VOICES[i].id === voiceId) return VOICES[i];
    return VOICES[0];
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    var v = voiceNow();
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(v.robot ? String(text).replace(/\s+/g, " ") : text);
      u.lang = v.lang;
      u.pitch = v.pitch;
      u.rate = v.rate;
      var sys = window.speechSynthesis.getVoices().filter(function (x) { return x.lang === v.lang; });
      if (sys.length) u.voice = sys[0];
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function voiceBar() {
    var h = '<div class="rf-voices">';
    VOICES.forEach(function (v) {
      h += '<button class="rf-voice' + (v.id === voiceId ? " on" : "") + '" data-voice="' + v.id + '">' + v.label + "</button>";
    });
    return h + "</div>";
  }

  function wireVoices() {
    Array.prototype.forEach.call(document.querySelectorAll(".rf-voice"), function (b) {
      b.onclick = function () {
        voiceId = b.getAttribute("data-voice");
        localStorage.setItem("rf_voice", voiceId);
        Array.prototype.forEach.call(document.querySelectorAll(".rf-voice"), function (x) { x.classList.toggle("on", x === b); });
        speak(current ? current.en : "");
      };
    });
  }

  function markStep() {
    Array.prototype.forEach.call(stepsEl.children, function (li) {
      li.className = li.getAttribute("data-step") === step ? "on" : "";
    });
  }
  function stepName(s) {
    return s === "dictation" ? "받아쓰기" : s === "writing" ? "쓰기" : "시험";
  }
  function chunk() {
    return groups[groupIndex] || [];
  }

  function startPhase(name) {
    step = name;
    markStep();
    groupIndex = 0;
    groups = [];
    for (var i = 0; i < cards.length; i += GROUP) groups.push(cards.slice(i, i + GROUP));
    startGroup();
  }

  function startGroup() {
    queue = chunk().slice();
    streak = {};
    firstTry = {};
    right = 0;
    asked = 0;
    runSerial++;
    scoreEl.textContent = "";
    render();
  }

  function render() {
    if (!queue.length) return finishGroup();
    current = queue[0];
    var g = groupIndex + 1, total = groups.length;
    var head = '<p class="rf-count">' + stepName(step) + ' · ' + g + " / " + total + " 묶음 · " + chunk().length + "문장</p>";

    if (step === "dictation") {
      main.innerHTML = head +
        '<p class="rf-ask">영어 문장을 듣고 그대로 쓰세요.</p>' +
        voiceBar() +
        '<p><button id="rf-play" class="rf-btn">🔊 다시 듣기</button></p>' +
        '<textarea id="rf-in" rows="3" placeholder="듣고 쓴 문장"></textarea>' +
        '<p><button id="rf-check" class="rf-btn primary">확인</button></p><div id="rf-fb" class="rf-fb"></div>';
      wireVoices();
      document.getElementById("rf-play").onclick = function () { speak(current.en); };
      speak(current.en);
    } else {
      main.innerHTML = head +
        '<p class="rf-ask">' + (step === "writing" ? "우리말을 보고 영어로 쓰세요." : "시험 · 우리말을 영어로 쓰세요.") + "</p>" +
        '<p class="rf-ko">' + esc(current.ko) + "</p>" +
        '<textarea id="rf-in" rows="3" placeholder="영어 문장"></textarea>' +
        '<p><button id="rf-check" class="rf-btn primary">확인</button></p><div id="rf-fb" class="rf-fb"></div>';
    }
    document.getElementById("rf-check").onclick = check;
    document.getElementById("rf-in").focus();
  }

  function check() {
    var typed = document.getElementById("rf-in").value;
    /* a fast double tap must not answer twice, or one group posts two rows */
    var btn = document.getElementById("rf-check");
    if (btn) btn.disabled = true;
    var ok = isRight(current, typed);
    var fb = document.getElementById("rf-fb");
    asked++;
    if (firstTry[current.id] === undefined) firstTry[current.id] = ok;

    if (ok) {
      streak[current.id] = (streak[current.id] || 0) + 1;
      if (streak[current.id] >= NEED) {
        queue.shift();
        if (firstTry[current.id]) right++;
        fb.className = "rf-fb good";
        fb.innerHTML = "정답입니다.";
        setTimeout(render, 400);
        return;
      }
      // right once: move it back two places so it is asked again
      queue.shift();
      queue.splice(Math.min(2, queue.length), 0, current);
      fb.className = "rf-fb good";
      fb.innerHTML = "정답입니다. 한 번 더 확인해요.";
      setTimeout(render, 400);
      return;
    }

    streak[current.id] = 0;
    fb.className = "rf-fb bad";
    fb.innerHTML = "정답: " + esc(acceptList(current)[0]);
    document.getElementById("rf-check").disabled = true;
    var b = document.createElement("button");
    b.className = "rf-btn";
    b.textContent = "다음";
    b.onclick = function () {
      queue.shift();
      queue.splice(Math.min(2, queue.length), 0, current);
      render();
    };
    fb.appendChild(document.createElement("br"));
    fb.appendChild(b);
  }

  function finishGroup() {
    var total = chunk().length;
    var pct = total ? Math.round((right / total) * 100) : 0;
    var passed = pct >= PASS;
    var last = groupIndex + 1 >= groups.length;
    var nextLabel = step === "dictation" ? "쓰기로" : step === "writing" ? "시험으로" : "다음 묶음";

    /* one row per finished group, first try only counted, same number the student sees */
    var runKey = step + ":" + groupIndex + ":" + runSerial;
    if (!postedRuns[runKey]) {
      postedRuns[runKey] = true;
      postScore(unitTag() + "_g" + (groupIndex + 1) + "_" + step, right, total, {
        group: groupIndex + 1,
        groups: groups.length,
        step: step,
        passed: passed,
        packId: PACK
      });
    }
    testTally[step + ":" + groupIndex] = { right: right, total: total };

    var html = '<p class="rf-count">' + stepName(step) + " · " + (groupIndex + 1) + " / " + groups.length + " 묶음 결과</p>" +
      '<p class="rf-result ' + (passed ? "good" : "bad") + '">' + pct + "% · " + right + " / " + total + "</p>";
    if (!passed) {
      html += "<p>80%가 넘지 않아 이 묶음을 다시 합니다.</p>" +
        '<button class="rf-btn primary" id="rf-again">다시 하기</button>';
    } else if (!last) {
      html += '<button class="rf-btn primary" id="rf-next">' + nextLabel + "</button>";
    } else if (step !== "test") {
      html += '<button class="rf-btn primary" id="rf-next">' + nextLabel + "</button>";
    } else {
      html += "<p>이 단원 Reading Focus를 끝냈습니다.</p>" +
        '<button class="rf-btn primary" id="rf-restart">처음부터 다시</button>';
    }
    main.innerHTML = html;
    if (!passed) document.getElementById("rf-again").onclick = startGroup;
    else if (!last) document.getElementById("rf-next").onclick = function () { groupIndex++; startGroup(); };
    else if (step !== "test") document.getElementById("rf-next").onclick = function () { startPhase(step === "dictation" ? "writing" : "test"); };
    else document.getElementById("rf-restart").onclick = function () { unitPosted = false; testTally = {}; startPhase("dictation"); };

    /* the whole unit, once the last test group passes: every step, first try only */
    if (step === "test" && last && passed && !unitPosted) {
      unitPosted = true;
      var uRight = 0, uTotal = 0;
      for (var k in testTally) {
        if (!Object.prototype.hasOwnProperty.call(testTally, k)) continue;
        uRight += testTally[k].right;
        uTotal += testTally[k].total;
      }
      postScore(unitTag() + "_unit", uRight, uTotal, { steps: "dictation+writing+test", unit: true, packId: PACK });
    }
    scoreEl.textContent = "";
  }

  fetch(PACK, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (pack) {
      cards = (pack.words || []).map(function (w) { return { id: w.id, en: w.en, ko: w.ko, accept: w.accept }; });
      titleEl.textContent = pack.title || "Reading Focus";
      /* the sheet wants the book and the unit by name, not just the pack id */
      book = pack.book || book;
      unit = pack.unit || unit;
      bookTitle = pack.bookTitle || pack.book || book;
      unitTitle = pack.title || [book, unit].join(" ");
      if (!cards.length) throw new Error("empty");
      /* a readable book name for the sheet, from the site's own book list; a miss is harmless */
      fetch("data/books.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (list) {
          var books = (list && list.books) || [];
          for (var i = 0; i < books.length; i++) {
            if (books[i].slug === book && books[i].title) { bookTitle = books[i].title; break; }
          }
        })
        .catch(function () {})
        .then(function () { startPhase("dictation"); });
    })
    .catch(function (e) {
      main.innerHTML = '<p class="rf-error">이 단원의 Reading Focus 문장 팩을 찾지 못했습니다.<br><small>' +
        esc(PACK) + " (" + esc(e.message) + ")</small></p>";
    });
})();
