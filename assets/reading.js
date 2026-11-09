/* Reading Focus player — sentences only, no pictures.
   Steps: 1 dictation, 2 writing, 3 test. Pass at 80%, retry when below.
   Loads packs/<book>_<unit>_reading01.json (English sentence + Korean sentence per card). */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var book = params.get("b") || "";
  var unit = params.get("u") || "";
  var PACK = params.get("pack") || ("packs/" + book + "_" + unit + "_reading01.json");
  var PASS = 80;

  var main = document.getElementById("rf-main");
  var titleEl = document.getElementById("rf-title");
  var scoreEl = document.getElementById("rf-score");
  var stepsEl = document.getElementById("rf-steps");

  var cards = [];
  var step = "dictation";
  var queue = [];
  var index = 0;
  var right = 0;
  var doneIds = { dictation: {}, writing: {}, test: {} };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function norm(s) {
    return String(s)
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[^a-z0-9' ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function acceptList(card) {
    if (Array.isArray(card.accept) && card.accept.length) return card.accept;
    return [card.en];
  }

  function isRight(card, typed) {
    var t = norm(typed);
    if (!t) return false;
    return acceptList(card).some(function (a) {
      return norm(a) === t;
    });
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.92;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function markStep() {
    Array.prototype.forEach.call(stepsEl.children, function (li) {
      li.className = li.getAttribute("data-step") === step ? "on" : "";
    });
  }

  function startStep(name, size) {
    step = name;
    markStep();
    queue = shuffle(cards).slice(0, size || cards.length);
    index = 0;
    right = 0;
    scoreEl.textContent = "";
    render();
  }

  function render() {
    if (index >= queue.length) return finish();
    var card = queue[index];
    var total = queue.length;
    scoreEl.textContent = (index + 1) + " / " + total;
    var head = '<p class="rf-count">' + (index + 1) + " / " + total + "</p>";

    if (step === "dictation") {
      main.innerHTML =
        head +
        '<p class="rf-ask">영어 문장을 듣고 그대로 쓰세요.</p>' +
        '<p><button id="rf-play" class="rf-btn">🔊 다시 듣기</button></p>' +
        '<textarea id="rf-in" rows="3" placeholder="듣고 쓴 문장"></textarea>' +
        '<p><button id="rf-check" class="rf-btn primary">확인</button></p>' +
        '<div id="rf-fb" class="rf-fb"></div>';
      document.getElementById("rf-play").onclick = function () { speak(card.en); };
      document.getElementById("rf-check").onclick = check;
      speak(card.en);
      document.getElementById("rf-in").focus();
    } else if (step === "writing") {
      main.innerHTML =
        head +
        '<p class="rf-ask">우리말을 보고 영어로 쓰세요.</p>' +
        '<p class="rf-ko">' + esc(card.ko) + "</p>" +
        '<textarea id="rf-in" rows="3" placeholder="영어 문장"></textarea>' +
        '<p><button id="rf-check" class="rf-btn primary">확인</button></p>' +
        '<div id="rf-fb" class="rf-fb"></div>';
      document.getElementById("rf-check").onclick = check;
      document.getElementById("rf-in").focus();
    } else {
      main.innerHTML =
        head +
        '<p class="rf-ask">다음 우리말을 영어로 쓰세요. (시험)</p>' +
        '<p class="rf-ko">' + esc(card.ko) + "</p>" +
        '<textarea id="rf-in" rows="3" placeholder="영어 문장"></textarea>' +
        '<p><button id="rf-check" class="rf-btn primary">확인</button></p>' +
        '<div id="rf-fb" class="rf-fb"></div>';
      document.getElementById("rf-check").onclick = check;
      document.getElementById("rf-in").focus();
    }
  }

  function check() {
    var card = queue[index];
    var typed = document.getElementById("rf-in").value;
    var ok = isRight(card, typed);
    var fb = document.getElementById("rf-fb");
    if (ok) {
      right++;
      doneIds[step][card.id] = true;
      fb.className = "rf-fb good";
      fb.innerHTML = "정답입니다.";
      setTimeout(next, 450);
    } else {
      fb.className = "rf-fb bad";
      fb.innerHTML = "정답: " + esc(acceptList(card)[0]);
      document.getElementById("rf-check").disabled = true;
      var b = document.createElement("button");
      b.className = "rf-btn";
      b.textContent = "다음";
      b.onclick = next;
      fb.appendChild(document.createElement("br"));
      fb.appendChild(b);
    }
  }

  function next() {
    index++;
    render();
  }

  function finish() {
    var pct = queue.length ? Math.round((right / queue.length) * 100) : 0;
    var passed = pct >= PASS;
    var nextBtn =
      step === "dictation"
        ? '<button class="rf-btn primary" id="rf-go">쓰기로 넘어가기</button>'
        : step === "writing"
        ? '<button class="rf-btn primary" id="rf-go">시험 보기</button>'
        : "";
    main.innerHTML =
      '<p class="rf-count">' + stepName(step) + " 결과</p>" +
      '<p class="rf-result ' + (passed ? "good" : "bad") + '">' + pct + "% · " + right + " / " + queue.length + "</p>" +
      '<p>' + (passed ? "통과입니다. 다음 단계로 갈 수 있어요." : "80%가 넘지 않아 다시 해야 합니다.") + "</p>" +
      (passed ? nextBtn : '<button class="rf-btn primary" id="rf-again">다시 하기</button>');
    if (passed && nextBtn) {
      document.getElementById("rf-go").onclick = function () {
        startStep(step === "dictation" ? "writing" : "test", step === "dictation" ? cards.length : 10);
      };
    }
    if (!passed) {
      document.getElementById("rf-again").onclick = function () { startStep(step, queue.length); };
    }
    scoreEl.textContent = "";
  }

  function stepName(s) {
    return s === "dictation" ? "받아쓰기" : s === "writing" ? "쓰기" : "시험";
  }

  fetch(PACK, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (pack) {
      cards = (pack.words || []).map(function (w) {
        return { id: w.id, en: w.en, ko: w.ko, accept: w.accept };
      });
      titleEl.textContent = pack.title || "Reading Focus";
      if (!cards.length) throw new Error("empty");
      startStep("dictation", cards.length);
    })
    .catch(function (e) {
      main.innerHTML =
        '<p class="rf-error">이 단원의 Reading Focus 문장 팩을 찾지 못했습니다.<br><small>' +
        esc(PACK) + " (" + esc(e.message) + ")</small></p>";
    });
})();
