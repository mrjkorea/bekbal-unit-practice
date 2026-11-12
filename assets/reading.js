/* Reading Focus player — sentences only, no pictures.
   Jay 2026-11-11: each practice is its own five sentences, listed separately.
   Jay 2026-11-12: one correct typing clears a sentence. Two in a row frustrated
   students, so that rule is gone. A miss marks only the words that were wrong
   and puts the sentence back two places later.
   The eight recorded voices are on screen. The computer voice plays only when
   that recording file is missing. The score for one practice stays, with restart.
   Old score ids stay book_unit_s1, book_unit_s2, so earlier finishes still match. */
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

  var GROUP = 5;                     // five sentences in one practice
  var NEED = 1;                      // Jay 2026-11-12: one correct typing clears the sentence.
                                     // Twice in a row made students frustrated; the rule is gone.
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
  var stageRight = {};     // stage -> sentences cleared with no miss
  var askedInStage = {};   // "<stage>:<id>" -> true once seen
  var streak = {};         // card id -> correct typings in a row, this stage
  var spoiled = {};        // card id -> true after a miss in this stage
  var missed = [];         // card ids missed in this practice, any stage
  var sessionDone = false;

  /* MRJ Classroom Metrics. One row per finished five, then one row for the whole unit.
     The sheet is the only place a score goes: program bekbal-reading, appName Reading Focus. */
  var bookTitle = "";
  var unitTitle = "";
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

  /* Jay 2026-11-12: mark only the words the student got wrong, so she can see
     exactly where the mistake is instead of comparing two whole sentences.
     Words are lined up with a longest-common-subsequence over the normalised
     tokens; a word outside that line is marked. */
  function words(text) {
    return String(text || "").trim().split(/\s+/).filter(function (w) { return w; });
  }
  function normWord(w) {
    return String(w).toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9']/g, "");
  }
  function matchMarks(a, b) {
    var A = a.map(normWord), B = b.map(normWord);
    var n = A.length, m = B.length;
    var dp = [];
    for (var i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = 1; i <= n; i++) {
      for (var j = 1; j <= m; j++) {
        dp[i][j] = A[i - 1] && A[i - 1] === B[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    var inA = new Array(n).fill(false), inB = new Array(m).fill(false);
    i = n; j = m;
    while (i > 0 && j > 0) {
      if (A[i - 1] && A[i - 1] === B[j - 1]) { inA[i - 1] = true; inB[j - 1] = true; i--; j--; }
      else if (dp[i - 1][j] >= dp[i][j - 1]) { i--; } else { j--; }
    }
    return { a: inA, b: inB };
  }
  function markedWords(list, good) {
    return list.map(function (w, i) {
      return good[i] ? esc(w) : '<mark class="rf-miss">' + esc(w) + "</mark>";
    }).join(" ");
  }
  /* the correct sentence with the words she missed marked, plus her own sentence */
  function wrongPartHtml(card, typed) {
    var answer = acceptList(card)[0];
    var mine = words(typed);
    var right = words(answer);
    if (!mine.length) {
      return '<p class="rf-fb-line">정답</p><p class="rf-answer">' + esc(answer) + "</p>";
    }
    var marks = matchMarks(right, mine);
    return '<p class="rf-fb-line">내가 쓴 문장</p>' +
      '<p class="rf-answer mine">' + markedWords(mine, marks.b) + "</p>" +
      '<p class="rf-fb-line">정답 · 노란 부분이 틀린 곳</p>' +
      '<p class="rf-answer">' + markedWords(right, marks.a) + "</p>";
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
    h += voiceBar();
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

  /* five dots: gold is one correct, green is cleared (two in a row) */
  function dots() {
    var inQueue = {};
    for (var i = 0; i < queue.length; i++) inQueue[queue[i].id] = true;
    var h = '<div class="rf-dots">';
    var list = currentSession();
    for (var j = 0; j < list.length; j++) {
      var c = list[j];
      var state = "todo";
      if (!inQueue[c.id]) state = "done";
      else if ((streak[c.id] || 0) >= 1) state = "half";
      else if (spoiled[c.id] || askedInStage[stage + ":" + c.id]) state = "seen";
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
    askedInStage = {};
    streak = {};
    spoiled = {};
    stageRight = { dictation: 0, writing: 0, test: 0 };
    missed = [];
    stage = keepStage || "dictation";
    if (stepsEl) stepsEl.style.display = "";
    beginStage();
  }

  function beginStage() {
    queue = currentSession().slice();
    streak = {};
    spoiled = {};
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
    var head = '<p class="rf-count">' + practiceName(sessionIndex) + " · " + STAGE_LABEL[stage] + "</p>" +
      '<p class="rf-backline"><button type="button" class="rf-link" id="rf-back-list">← 연습 목록</button></p>' + dots();

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
    var back = document.getElementById("rf-back-list");
    if (back) back.onclick = function () { stopAudio(); openList(); };
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
    askedInStage[key] = true;

    if (ok) {
      streak[current.id] = (streak[current.id] || 0) + 1;
      queue.shift();
      if (streak[current.id] >= NEED) {
        if (!spoiled[current.id]) stageRight[stage]++;
        fb.className = "rf-fb good";
        fb.innerHTML = queue.length ? "정답입니다. 이 문장은 통과입니다." : "정답입니다. " + STAGE_LABEL[stage] + " 끝.";
      } else {
        queue.push(current);
        fb.className = "rf-fb good";
        fb.innerHTML = "정답입니다. 한 번 더 정확히 써야 이 문장은 통과합니다.";
      }
      setTimeout(render, 500);
      return;
    }

    /* a miss resets the two-in-a-row count and returns two places later */
    streak[current.id] = 0;
    spoiled[current.id] = true;
    if (missed.indexOf(current.id) < 0) missed.push(current.id);
    fb.className = "rf-fb bad";
    fb.innerHTML = wrongPartHtml(current, typed);
    var b = document.createElement("button");
    b.className = "rf-btn";
    b.textContent = "다음";
    b.onclick = function () {
      queue.shift();
      var at = Math.min(2, queue.length);
      queue.splice(at, 0, current);
      render();
    };
    fb.appendChild(document.createElement("br"));
    fb.appendChild(b);
  }

  /* ---------- the score for these five, kept on screen ---------- */

  function practiceName(index) {
    return "연습 " + (index + 1);
  }

  function sentenceRange(index) {
    var start = index * GROUP + 1;
    var len = (sessions[index] || []).length;
    var end = start + len - 1;
    return start === end ? String(start) : start + "–" + end;
  }

  function practiceStore() {
    try { return JSON.parse(localStorage.getItem("rf_prac_" + PACK_ID) || "{}"); }
    catch (e) { return {}; }
  }

  function rememberPractice(index, pct, right, max) {
    var all = practiceStore();
    all[String(index + 1)] = { pct: pct, right: right, max: max, at: Date.now() };
    try { localStorage.setItem("rf_prac_" + PACK_ID, JSON.stringify(all)); } catch (e) {}
  }

  /* Saved sheet rows use the same ids, so a finish from before this screen still shows. */
  function pullScores(done) {
    var local = practiceStore();
    var auth = window.MRJ_AUTH;
    if (!auth || typeof auth.loadProgressForApp !== "function") { done(local); return; }
    var tag = unitTag();
    auth.loadProgressForApp(SCORE_PROGRAM).then(function (res) {
      var rows = (res && (res.progress || res.rows)) || [];
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i] || {};
        var id = String(row.itemId || row.item_id || "");
        if (id.indexOf(tag + "_s") !== 0) continue;
        var n = id.slice((tag + "_s").length);
        if (!/^\d+$/.test(n)) continue;
        if (local[n] && local[n].at) continue;
        var pct = row.score_pct != null ? row.score_pct : row.scorePct;
        if (pct == null && row.scoreValue != null && Number(row.scoreMax) > 0) {
          pct = Math.round((Number(row.scoreValue) / Number(row.scoreMax)) * 100);
        }
        if (pct == null) continue;
        local[n] = { pct: Number(pct), fromServer: true };
      }
      done(local);
    }).catch(function () { done(local); });
  }

  function showList(saved) {
    stopAudio();
    sessionDone = false;
    if (stepsEl) stepsEl.style.display = "none";
    scoreEl.textContent = "";
    var html = '<div class="rf-card rf-picker">' +
      '<p class="rf-ask">목소리</p>' + voiceBar() +
      '<p class="rf-sub">한 연습은 문장 다섯 개입니다. 각 문장을 한 번 정확히 쓰면 통과합니다.</p>';
    for (var i = 0; i < sessions.length; i++) {
      var rec = saved && saved[String(i + 1)];
      var score = rec && typeof rec.pct === "number" ? rec.pct + "%" : "아직 기록 없음";
      html += '<div class="rf-prac"><div><b>' + practiceName(i) + '</b>' +
        '<span>문장 ' + sentenceRange(i) + '</span></div><div>' +
        '<b class="rf-prac-score">' + esc(score) + '</b>' +
        '<button class="rf-btn primary" data-prac="' + i + '">' +
        (rec ? "다시 하기" : "시작") + "</button></div></div>";
    }
    html += "</div>";
    main.innerHTML = html;
    wireVoices();
    Array.prototype.forEach.call(document.querySelectorAll("[data-prac]"), function (b) {
      b.onclick = function () { startSession(Number(b.getAttribute("data-prac"))); };
    });
  }

  function openList() {
    pullScores(showList);
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

    var rows = [
      { label: "받아쓰기", right: stageRight.dictation, max: per },
      { label: "쓰기", right: stageRight.writing, max: per },
      { label: "시험", right: stageRight.test, max: per }
    ];
    rememberPractice(sessionIndex, pct, totalRight, totalMax);

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
      '<p class="rf-count">' + practiceName(sessionIndex) + " 성적</p>" +
      '<p class="rf-result ' + (passed ? "good" : "bad") + '">' + pct + "%</p>" +
      '<p class="rf-sub">세 단계 합계 ' + totalRight + " / " + totalMax + "을 틀리지 않고 통과했습니다.</p>" +
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
      '<button class="rf-btn big" id="rf-again">다시 하기</button>' +
      '<button class="rf-btn primary big" id="rf-list">연습 목록</button>' +
      "</div></div>";

    main.innerHTML = html;
    scoreEl.textContent = practiceName(sessionIndex) + " " + pct + "%";
    document.getElementById("rf-again").onclick = function () { startSession(sessionIndex); };
    document.getElementById("rf-list").onclick = function () { openList(); };
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
        .then(function () { openList(); });
    })
    .catch(function (e) {
      main.innerHTML = '<p class="rf-error">이 단원의 Reading Focus 문장 팩을 찾지 못했습니다.<br><small>' +
        esc(PACK) + " (" + esc(e.message) + ")</small></p>";
    });
})();
