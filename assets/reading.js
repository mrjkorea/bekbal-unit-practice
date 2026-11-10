/* Reading Focus player — sentences only, no pictures.
   Jay 2026-11-10: one session is FIVE sentences. Those five go through dictation,
   writing and test, then a new five. One right answer clears a sentence, so a
   sentence is asked twice only when the student misses it.
   Audio: 1x / 3x / 5x play buttons and 50 / 80 / 100 percent speed, like the
   decodable books. The score for the five stays on screen with a do-it-again button. */
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

  var GROUP = 5;                     // five sentences in one session
  var STAGES = ["dictation", "writing", "test"];
  var STAGE_LABEL = { dictation: "받아쓰기", writing: "쓰기", test: "시험" };

  /* the two audio controls Jay asked for, remembered between visits */
  var COUNTS = [1, 3, 5];
  var SPEEDS = [100, 80, 50];
  var playCount = Number(localStorage.getItem("rf_count")) || 1;
  var speedPct = Number(localStorage.getItem("rf_speed")) || 100;
  if (COUNTS.indexOf(playCount) < 0) playCount = 1;
  if (SPEEDS.indexOf(speedPct) < 0) speedPct = 100;

  var main = document.getElementById("rf-main");
  var titleEl = document.getElementById("rf-title");
  var scoreEl = document.getElementById("rf-score");
  var stepsEl = document.getElementById("rf-steps");

  var cards = [];
  var sessions = [];
  var sessionIndex = 0;
  var stage = "dictation";
  var queue = [];          // sentences still to answer in this stage
  var current = null;
  var stageRight = {};     // stage -> first-try rights in this session
  var firstTry = {};       // "<stage>:<id>" -> true/false
  var askedInStage = {};   // "<stage>:<id>" -> true once seen
  var missed = [];         // card ids missed in this session, any stage
  var sessionDone = false;

  /* MRJ Classroom Metrics. One row per finished five, then one row for the whole unit.
     The sheet is the only place a score goes: program bekbal-reading, appName Reading Focus. */
  var bookTitle = "";
  var unitTitle = "";
  var unitRight = 0;
  var unitTotal = 0;
  var unitPosted = false;
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
        /* the columns the sheet really fills (Reg/Metrics 2026-11-10):
           course_name, assignment_id, unit_id and lesson_id. unitTitle has no
           column of its own, so the copy of the library puts it in metadata. */
        courseName: bookTitle,
        unitId: unit,
        assignmentId: meta && meta.assignmentId ? meta.assignmentId : "",
        lessonId: meta && meta.lessonId ? meta.lessonId : "",
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

  /* ---------- audio: one clip, repeated 1, 3 or 5 times, at the chosen speed ---------- */

  var PACK_ID = PACK.split("/").pop().replace(/\.json$/, "");
  var audioCache = {};
  var playToken = 0;      // bump to stop a running repeat chain

  function audioUrl(card, vid) {
    return "packs/" + PACK_ID + "/audio/" + (vid || voiceId) + "/" + String(card.id).toLowerCase() + ".mp3";
  }

  function stopAudio() {
    playToken++;
    try { speechSynthesis.cancel(); } catch (e) {}
    for (var k in audioCache) {
      if (Object.prototype.hasOwnProperty.call(audioCache, k)) {
        try { audioCache[k].pause(); audioCache[k].currentTime = 0; } catch (e) {}
      }
    }
  }

  function speakText(text, rate) {
    if (!("speechSynthesis" in window)) return;
    var v = voiceNow();
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(v.robot ? String(text).replace(/\s+/g, " ") : text);
      u.lang = v.lang;
      u.pitch = v.pitch;
      u.rate = Math.max(0.3, v.rate * rate);
      var sys = window.speechSynthesis.getVoices().filter(function (x) { return x.lang === v.lang; });
      if (sys.length) u.voice = sys[0];
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* Play one clip. If the selected voice has no recording, fall back to the American
     male recording, then to the device voice, so a student never hears silence. */
  function playOnce(card, rate, plan, done) {
    var order = plan || [voiceId, "us_m"].filter(function (v, i, a) { return a.indexOf(v) === i; });
    var url = audioUrl(card, order[0]);
    var a = audioCache[url] || (audioCache[url] = new Audio(url));
    var finished = false;
    function next(fallback) {
      if (finished) return;
      finished = true;
      a.onended = null;
      a.onerror = null;
      if (fallback) {
        if (order.length > 1) playOnce(card, rate, order.slice(1), done);
        else { speakText(card.en, rate); setTimeout(done, 700); }
      } else {
        done();
      }
    }
    a.onended = function () { next(false); };
    a.onerror = function () { next(true); };
    try {
      a.preservesPitch = true;          // keep the voice natural at 50 and 80 percent
      a.mozPreservesPitch = true;
      a.webkitPreservesPitch = true;
      a.playbackRate = rate;
      a.currentTime = 0;
      var pr = a.play();
      if (pr && pr.catch) pr.catch(function () { next(true); });
    } catch (e) {
      next(true);
    }
  }

  /* one clip, then a short gap, then the next, up to `times` plays */
  function playCard(card, times, done) {
    if (!card) return;
    stopAudio();
    var myToken = playToken;
    var rate = speedPct / 100;
    var left = times || 1;
    function again() {
      if (myToken !== playToken) return;
      if (left <= 0) { if (done) done(); return; }
      left--;
      playOnce(card, rate, null, function () {
        if (myToken !== playToken) return;
        if (left <= 0) { if (done) done(); return; }
        setTimeout(again, 420);
      });
    }
    again();
  }

  /* ---------- small pieces of the screen ---------- */

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
        if (current) playCard(current, playCount);
      };
    });
  }

  /* the 1x / 3x / 5x row and the 100 / 80 / 50 row — same two ideas as the decodable books */
  function audioBar() {
    var h = '<div class="rf-audio">';
    h += '<button id="rf-play" class="rf-big" aria-label="듣기">🔊 <span>듣기</span></button>';
    h += '<div class="rf-audio-sets">';
    h += '<div class="rf-set"><span class="rf-set-label">반복</span>';
    COUNTS.forEach(function (n) {
      h += '<button class="rf-chip rf-count' + (n === playCount ? " on" : "") + '" data-count="' + n + '">' + n + "x</button>";
    });
    h += "</div>";
    h += '<div class="rf-set"><span class="rf-set-label">속도</span>';
    SPEEDS.forEach(function (s) {
      h += '<button class="rf-chip rf-speed' + (s === speedPct ? " on" : "") + '" data-speed="' + s + '">' + s + "%</button>";
    });
    h += "</div></div></div>";
    return h;
  }

  function wireAudio() {
    var play = document.getElementById("rf-play");
    if (play) play.onclick = function () { if (current) playCard(current, playCount); };
    Array.prototype.forEach.call(document.querySelectorAll(".rf-count"), function (b) {
      b.onclick = function () {
        playCount = Number(b.getAttribute("data-count")) || 1;
        localStorage.setItem("rf_count", playCount);
        Array.prototype.forEach.call(document.querySelectorAll(".rf-count"), function (x) { x.classList.toggle("on", x === b); });
        if (current) playCard(current, playCount);
      };
    });
    Array.prototype.forEach.call(document.querySelectorAll(".rf-speed"), function (b) {
      b.onclick = function () {
        speedPct = Number(b.getAttribute("data-speed")) || 100;
        localStorage.setItem("rf_speed", speedPct);
        Array.prototype.forEach.call(document.querySelectorAll(".rf-speed"), function (x) { x.classList.toggle("on", x === b); });
        if (current) playCard(current, playCount);
      };
    });
    wireVoices();
  }

  /* five dots: a green dot is a sentence cleared in this stage */
  function dots() {
    var done = {};
    for (var i = 0; i < queue.length; i++) done[queue[i].id] = false;
    var h = '<div class="rf-dots">';
    var list = currentSession();
    for (var j = 0; j < list.length; j++) {
      var c = list[j];
      var state = "todo";
      if (askedInStage[stage + ":" + c.id]) state = "seen";
      if (!done.hasOwnProperty(c.id)) state = "done";
      h += '<span class="rf-dot ' + state + '"></span>';
    }
    return h + "</div>";
  }

  function markStep() {
    Array.prototype.forEach.call(stepsEl.children, function (li) {
      li.className = li.getAttribute("data-step") === stage ? "on" : "";
    });
  }

  function currentSession() {
    return sessions[sessionIndex] || [];
  }

  /* ---------- the flow: five sentences, three stages ---------- */

  function startSession(index, keepStage) {
    sessionIndex = index;
    stopAudio();
    sessionDone = false;
    firstTry = {};
    askedInStage = {};
    stageRight = { dictation: 0, writing: 0, test: 0 };
    missed = [];
    stage = keepStage || "dictation";
    unitPosted = false;
    beginStage();
  }

  function beginStage() {
    queue = currentSession().slice();
    markStep();
    render();
  }

  function nextStage() {
    var i = STAGES.indexOf(stage);
    if (i < STAGES.length - 1) {
      stage = STAGES[i + 1];
      beginStage();
    } else {
      finishSession();
    }
  }

  function render() {
    if (!queue.length) return nextStage();
    current = queue[0];
    sessionDone = false;
    var total = sessions.length;
    var head = '<p class="rf-count">' + STAGE_LABEL[stage] + " · 5문장 묶음 " + (sessionIndex + 1) + " / " + total + "</p>" + dots();

    if (stage === "dictation") {
      main.innerHTML = head +
        '<p class="rf-ask">영어 문장을 듣고 그대로 쓰세요.</p>' +
        audioBar() +
        '<textarea id="rf-in" rows="3" placeholder="듣고 쓴 문장" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>' +
        '<p><button id="rf-check" class="rf-btn primary big">확인</button></p><div id="rf-fb" class="rf-fb"></div>';
      wireAudio();
    } else {
      main.innerHTML = head +
        '<p class="rf-ask">' + (stage === "writing" ? "우리말을 보고 영어로 쓰세요." : "시험 · 우리말을 영어로 쓰세요.") + "</p>" +
        '<p class="rf-ko">' + esc(current.ko) + "</p>" +
        '<textarea id="rf-in" rows="3" placeholder="영어 문장" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>' +
        '<p><button id="rf-check" class="rf-btn primary big">확인</button></p><div id="rf-fb" class="rf-fb"></div>';
    }
    document.getElementById("rf-check").onclick = check;
    var input = document.getElementById("rf-in");
    try { input.focus(); } catch (e) {}
    if (stage === "dictation") playCard(current, playCount);
  }

  function check() {
    var input = document.getElementById("rf-in");
    var typed = input ? input.value : "";
    /* a fast double tap must not answer twice, or one five posts two rows */
    var btn = document.getElementById("rf-check");
    if (btn) btn.disabled = true;
    var fb = document.getElementById("rf-fb");
    var key = stage + ":" + current.id;
    var ok = isRight(current, typed);
    var wasSeen = askedInStage[key] === true;
    askedInStage[key] = true;
    if (!wasSeen) firstTry[key] = ok;

    if (ok) {
      if (!wasSeen) stageRight[stage]++;
      queue.shift();
      fb.className = "rf-fb good";
      fb.innerHTML = queue.length ? "정답입니다. 다음 문장으로." : "정답입니다. " + STAGE_LABEL[stage] + " 끝.";
      setTimeout(render, 380);
      return;
    }

    /* a miss: show the key, then this sentence comes back later in the same five */
    if (missed.indexOf(current.id) < 0) missed.push(current.id);
    fb.className = "rf-fb bad";
    fb.innerHTML = "정답: " + esc(acceptList(current)[0]);
    var b = document.createElement("button");
    b.className = "rf-btn";
    b.textContent = "다음";
    b.onclick = function () {
      queue.shift();
      if (queue.length) queue.push(current);   // re-asked inside this five, not the next five
      render();
    };
    fb.appendChild(document.createElement("br"));
    fb.appendChild(b);
  }

  /* ---------- the score for these five, kept on screen ---------- */

  /* Jay 2026-11-10: the score for the five stays. It stays on the result card, in the
     header, and after a reload it shows the last five this student finished. */
  function restoreLastScore() {
    try {
      var raw = localStorage.getItem("rf_last_" + PACK_ID);
      if (!raw) return;
      var last = JSON.parse(raw);
      if (last && typeof last.pct === "number" && !sessionDone) {
        scoreEl.textContent = "지난번 5문장 " + last.pct + "%";
      }
    } catch (e) {}
  }

  function saveLastSession(pct, rows) {
    try {
      localStorage.setItem("rf_last_" + PACK_ID, JSON.stringify({ pct: pct, at: Date.now(), rows: rows }));
    } catch (e) {}
  }

  function finishSession() {
    stopAudio();
    sessionDone = true;
    var list = currentSession();
    var per = list.length;
    var totalRight = stageRight.dictation + stageRight.writing + stageRight.test;
    var totalMax = per * STAGES.length;
    var pct = totalMax ? Math.round((totalRight / totalMax) * 100) : 0;
    var passed = pct >= PASS;
    var last = sessionIndex + 1 >= sessions.length;
    unitRight += totalRight;
    unitTotal += totalMax;

    var rows = [
      { label: "받아쓰기", right: stageRight.dictation, max: per },
      { label: "쓰기", right: stageRight.writing, max: per },
      { label: "시험", right: stageRight.test, max: per }
    ];
    saveLastSession(pct, rows);

    postScore(unitTag() + "_s" + (sessionIndex + 1), totalRight, totalMax, {
      session: sessionIndex + 1,
      sessions: sessions.length,
      steps: "dictation+writing+test",
      passed: passed,
      packId: PACK,
      assignmentId: unitTag() + "_s" + (sessionIndex + 1),
      lessonId: "s" + (sessionIndex + 1)
    });

    var html = '<div class="rf-card">' +
      '<p class="rf-count">5문장 묶음 ' + (sessionIndex + 1) + " / " + sessions.length + " 성적</p>" +
      '<p class="rf-result ' + (passed ? "good" : "bad") + '">' + pct + "%</p>" +
      '<p class="rf-sub">15번 중 ' + totalRight + "번 첫 시도에 맞혔습니다.</p>" +
      '<ul class="rf-rows">';
    rows.forEach(function (r) {
      html += '<li><span>' + r.label + "</span><b>" + r.right + " / " + r.max + "</b></li>";
    });
    html += "</ul>";

    if (missed.length) {
      html += '<p class="rf-sub">다시 볼 문장</p><ul class="rf-missed">';
      for (var i = 0; i < missed.length; i++) {
        for (var j = 0; j < list.length; j++) {
          if (list[j].id === missed[i]) {
            html += "<li>" + esc(list[j].en) + "</li>";
            break;
          }
        }
      }
      html += "</ul>";
    }

    html += '<div class="rf-actions">' +
      '<button class="rf-btn big" id="rf-again">다시 하기</button>';
    if (last) {
      html += '<button class="rf-btn primary big" id="rf-unit">이 단원 끝내기</button>';
    } else {
      html += '<button class="rf-btn primary big" id="rf-next">다음 5문장</button>';
    }
    html += "</div></div>";

    main.innerHTML = html;
    scoreEl.textContent = "이번 5문장 " + pct + "%";
    document.getElementById("rf-again").onclick = function () {
      unitRight -= totalRight;
      unitTotal -= totalMax;
      startSession(sessionIndex);
    };
    var nx = document.getElementById("rf-next");
    if (nx) nx.onclick = function () { startSession(sessionIndex + 1); };
    var un = document.getElementById("rf-unit");
    if (un) un.onclick = finishUnit;
  }

  function finishUnit() {
    var pct = unitTotal ? Math.round((unitRight / unitTotal) * 100) : 0;
    if (!unitPosted) {
      unitPosted = true;
      postScore(unitTag() + "_unit", unitRight, unitTotal, {
        steps: "dictation+writing+test",
        sessions: sessions.length,
        unit: true,
        packId: PACK,
        assignmentId: unitTag(),
        lessonId: "unit"
      });
    }
    main.innerHTML = '<div class="rf-card">' +
      '<p class="rf-count">이 단원 Reading Focus 완료</p>' +
      '<p class="rf-result ' + (pct >= PASS ? "good" : "bad") + '">' + pct + "%</p>" +
      '<p class="rf-sub">' + unitTotal + "번 중 " + unitRight + "번 첫 시도에 맞혔습니다.</p>" +
      '<div class="rf-actions"><button class="rf-btn primary big" id="rf-restart">처음부터 다시</button></div></div>';
    scoreEl.textContent = "단원 " + pct + "%";
    document.getElementById("rf-restart").onclick = function () {
      unitRight = 0;
      unitTotal = 0;
      unitPosted = false;
      startSession(0);
    };
  }

  /* ---------- boot ---------- */

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
      sessions = [];
      for (var i = 0; i < cards.length; i += GROUP) sessions.push(cards.slice(i, i + GROUP));
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
        .then(function () {
          startSession(0);
          restoreLastScore();
        });
    })
    .catch(function (e) {
      main.innerHTML = '<p class="rf-error">이 단원의 Reading Focus 문장 팩을 찾지 못했습니다.<br><small>' +
        esc(PACK) + " (" + esc(e.message) + ")</small></p>";
    });
})();
