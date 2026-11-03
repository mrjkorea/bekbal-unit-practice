/* Bekbal Unit Practice. Pass ≥ 80%, max 3 tries. Book reminder only after a missed try, before retry. No speech. */
const PASS = 0.8, MAX_ATTEMPTS = 3;
const G = window.BekbalGrade;
const $ = (s) => document.querySelector(s);
const app = $("#app");
const qs = new URLSearchParams(location.search);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const getJSON = (u) => fetch(u, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(u); return r.json(); });
const STATUS = { "build-next": "Coming soon", "coming-soon": "Coming soon", ready: "연습 가능", deferred: "확인 필요" };
const REMIND = `📖 이번 시도에 틀린 문제가 있습니다. 다시 풀기 전에 종이 교재에서 같은 문제를 확인하고, 틀린 곳에 표시해 두세요.<br>Before you retry, check this part in your printed book and mark what you missed.`;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

async function index() {
  const { books } = await getJSON("data/books.json");
  app.innerHTML = `<h1>교재 선택</h1><div class="grid">${books.map((b) => `<a class="card" href="book.html?b=${b.slug}"><h3>${esc(b.title)}</h3>${esc(b.grade)} · ${esc(b.publisher)} · ${esc(b.author)}</a>`).join("")}</div>
  <h2>Demo</h2><a class="card" href="play.html?demo=1"><span class="tag demo">DEMO</span> 플레이어 시험용 샘플 (교재 문제 아님)</a>`;
}
async function book() {
  const { books } = await getJSON("data/books.json");
  const b = books.find((x) => x.slug === qs.get("b"));
  if (!b) return (app.textContent = "Book not found");
  app.innerHTML = `<h1>${esc(b.title)}</h1><div class="grid">${b.units.map((u) => `<a class="card ${u.status === "coming-soon" ? "off" : ""}" href="unit.html?b=${b.slug}&u=${u.unit}">${u.label}<span class="tag ${u.status}">${STATUS[u.status]}</span></a>`).join("")}</div>`;
}
async function unit() {
  const b = qs.get("b"), u = qs.get("u");
  if (!/^[a-z0-9-]+$/.test(b) || !/^u0[1-8]$/.test(u)) return (app.textContent = "Bad link");
  const c = await getJSON(`data/${b}/${u}/catalog.json`);
  app.innerHTML = `<p><a href="book.html?b=${b}">← 단원 목록</a></p><h1>${esc(c.label)} <span class="tag ${c.status}">${STATUS[c.status] || c.status}</span></h1>` +
    (c.note ? `<p>${esc(c.note)}</p>` : "") +
    c.sections.map((s) => `<h2>${esc(s.title)}</h2>` + (s.exercises.length ? `<div class="grid">${s.exercises.map((e) => {
      if (e.deferred) return `<div class="card off">${esc(e.title)}<span class="tag deferred">확인 필요</span>${e.reason ? `<br><small>${esc(e.reason)}</small>` : ""}</div>`;
      const n = e.questionCount ? ` <small>(${e.questionCount})</small>` : "";
      const hold = e.omittedCount ? `<br><small>OCR 확인 보류 ${e.omittedCount}문항</small>` : "";
      return `<a class="card" href="play.html?b=${b}&u=${u}&e=${encodeURIComponent(e.id)}">${esc(e.title)}${n}${hold}</a>`;
    }).join("")}</div>` : `<p class="card off">Coming soon</p>`)).join("");
}

function legacyExercise(ex) {
  if (ex.questions && ex.questions[0] && ex.questions[0].answerMode) return ex;
  let secN = 0;
  let lastKind = "";
  const sections = [];
  ex.questions = (ex.questions || []).map((q, i) => {
    const kind = q.type === "TMC" ? "mc" : "fill";
    if (kind !== lastKind) {
      secN += 1;
      lastKind = kind;
      const directionKo = kind === "mc" ? "알맞은 것을 고르세요." : "빈칸에 알맞은 말을 쓰세요.";
      const ruleKo = kind === "mc" ? "하나를 누르세요. 번호는 쓰지 않아요." : "빈칸에 들어갈 말만 쓰세요.";
      sections.push({
        id: "s" + secN,
        title: kind === "mc" ? "고르기" : "빈칸 말만",
        itemCount: 0,
        instructionKo: directionKo + " " + ruleKo,
        answerModeTag: kind === "mc" ? "Choose · 고르기" : "Type · 빈칸 말만",
        directionKo, ruleKo,
      });
    }
    sections[sections.length - 1].itemCount += 1;
    const sec = sections[sections.length - 1];
    const common = {
      id: String(q.id || i + 1),
      label: String(i + 1),
      section: sec.id,
      promptEn: q.question || "",
      explainKo: q.explainKo || "",
      directionKo: sec.directionKo,
      ruleKo: sec.ruleKo,
      sectionInstructionKo: sec.instructionKo,
      answerModeTag: sec.answerModeTag,
    };
    if (kind === "mc") {
      return Object.assign(common, {
        type: "mc", answerMode: "choice",
        choices: q.answers || [], correctIndexes: [Number(q.corAns)],
      });
    }
    return Object.assign(common, {
      type: "fill", answerMode: "words", accept: q.answers || [],
    });
  });
  ex.sections = sections;
  return ex;
}

function promptHtml(raw) {
  return esc(raw).replace(/_{3,}/g, '<span class="blank-mark">______</span>').replace(/\n/g, "<br>");
}

function timeFor(ex) {
  if (ex.timeLimitSec) return ex.timeLimitSec;
  return (ex.questions || []).reduce((t, q) => t + G.secondsFor(q), 0);
}

function readResponse(item, card) {
  if (item.type === "mc" || item.type === "bank") {
    const inputs = [...card.querySelectorAll("input")];
    return { indexes: inputs.filter((i) => i.checked).map((i) => Number(i.value)) };
  }
  if (item.type === "order") {
    const tray = card.querySelector("[data-order]");
    return { order: (tray && tray.dataset.order ? tray.dataset.order.split(",") : []).filter(Boolean) };
  }
  if (item.type === "ox") {
    const picked = card.querySelector('input[type="radio"]:checked');
    const rw = card.querySelector('input[type="text"]');
    return { value: picked ? picked.value : "", rewrite: rw ? rw.value : "" };
  }
  if (item.type === "parts") {
    return {
      parts: (item.parts || []).map((part, i) => {
        if (part.kind === "mc") {
          const picked = card.querySelector(`input[name="p${i}"]:checked`);
          return picked ? picked.value : "";
        }
        const inp = card.querySelector(`[data-part="${i}"]`);
        return inp ? inp.value : "";
      }),
    };
  }
  const inp = card.querySelector('input[type="text"], textarea');
  return { value: inp ? inp.value : "" };
}

function renderChoices(parent, name, choices, multi) {
  const box = el("div", "mc-options" + (multi ? " mc-multi" : ""));
  choices.forEach((ch, i) => {
    const lab = document.createElement("label");
    const inp = document.createElement("input");
    inp.type = multi ? "checkbox" : "radio";
    inp.name = name;
    inp.value = String(i + 1);
    lab.appendChild(inp);
    const span = document.createElement("span");
    span.className = "mc-choice-text";
    span.innerHTML = promptHtml(String(ch));
    lab.appendChild(span);
    box.appendChild(lab);
  });
  parent.appendChild(box);
  if (multi) parent.appendChild(el("p", "mc-multi-hint", "해당하는 것을 모두 누르세요. 번호는 쓰지 않습니다."));
}

function renderOrder(card, item) {
  const state = [];
  const wrap = el("div", "order-wrap");
  const bank = el("div", "word-bank order-bank");
  const tray = el("div", "order-tray");
  tray.dataset.order = "";
  const hint = el("p", "order-hint", item.orderIds.length < item.orderChunks.length
    ? "이 칸에 들어갈 말만 순서대로 누르세요. 누른 말을 다시 누르면 빠집니다."
    : "나오는 순서대로 누르세요. 누른 말을 다시 누르면 빠집니다.");
  function paint() {
    tray.dataset.order = state.join(",");
    tray.innerHTML = "";
    if (!state.length) tray.appendChild(el("span", "order-empty", "누른 순서"));
    state.forEach((id) => {
      const chunk = item.orderChunks.find((c) => c.id === id);
      tray.appendChild(el("button", "order-picked", chunk ? chunk.text : id));
    });
    [...bank.children].forEach((btn) => btn.classList.toggle("is-used", state.includes(btn.dataset.id)));
  }
  item.orderChunks.forEach((c) => {
    const btn = el("button", "bank-chip", c.text);
    btn.type = "button";
    btn.dataset.id = c.id;
    btn.onclick = () => {
      const at = state.indexOf(c.id);
      if (at >= 0) state.splice(at, 1);
      else state.push(c.id);
      paint();
    };
    bank.appendChild(btn);
  });
  tray.onclick = (ev) => {
    const btn = ev.target.closest(".order-picked");
    if (!btn) return;
    const text = btn.textContent;
    const chunk = item.orderChunks.find((c) => c.text === text && state.includes(c.id));
    if (!chunk) return;
    state.splice(state.indexOf(chunk.id), 1);
    paint();
  };
  wrap.appendChild(bank);
  wrap.appendChild(tray);
  wrap.appendChild(hint);
  card.appendChild(wrap);
  paint();
}

function renderCard(item) {
  const card = el("article", "q-card");
  card.dataset.qid = item.id;
  const head = el("div", "q-head");
  head.appendChild(el("span", "q-num", item.label || item.id));
  if (item.answerModeTag) head.appendChild(el("span", "mode-chip", item.answerModeTag));
  card.appendChild(head);
  if (item.promptKo) card.appendChild(el("div", "q-note", item.promptKo));
  const stem = el("div", "q-en");
  stem.innerHTML = promptHtml(item.promptEn || "");
  card.appendChild(stem);
  if (item.phraseBlank) card.appendChild(el("p", "q-note", "이 칸은 두 단어 이상이 될 수 있어요."));

  if (item.type === "mc") renderChoices(card, "q-" + item.id, item.choices || [], item.select === "multi" || item.answerMode === "multi");
  else if (item.type === "bank") {
    const box = el("div", "word-bank bank-options");
    (item.choices || []).forEach((ch, i) => {
      const lab = document.createElement("label");
      lab.className = "bank-chip";
      const inp = document.createElement("input");
      inp.type = "radio";
      inp.name = "q-" + item.id;
      inp.value = String(i + 1);
      lab.appendChild(inp);
      lab.appendChild(document.createTextNode(ch));
      box.appendChild(lab);
    });
    card.appendChild(box);
  } else if (item.type === "order") renderOrder(card, item);
  else if (item.type === "ox") {
    const wrap = el("div", "ox-widget");
    renderChoices(wrap, "q-" + item.id, ["○  맞다", "×  틀리다"], false);
    wrap.querySelectorAll("input")[0].value = "O";
    wrap.querySelectorAll("input")[1].value = "X";
    const rewrite = el("div", "ox-rewrite");
    rewrite.hidden = true;
    rewrite.appendChild(el("div", "ox-rewrite-label", "×이면, 고친 말만 쓰세요."));
    const inp = document.createElement("input");
    inp.type = "text";
    inp.autocomplete = "off";
    inp.placeholder = "고친 말만";
    inp.setAttribute("aria-label", "고친 말");
    rewrite.appendChild(inp);
    wrap.appendChild(rewrite);
    wrap.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const show = wrap.querySelector('input[value="X"]:checked');
        rewrite.hidden = !show;
        if (!show) inp.value = "";
      });
    });
    card.appendChild(wrap);
  } else if (item.type === "parts") {
    (item.parts || []).forEach((part, i) => {
      const block = el("div", "part-block");
      if (part.label) block.appendChild(el("div", "part-label", part.label));
      if (part.kind === "mc") renderChoices(block, "p" + i, part.choices || [], false);
      else {
        const inp = document.createElement(part.kind === "sentence" ? "textarea" : "input");
        if (part.kind !== "sentence") inp.type = "text";
        inp.dataset.part = String(i);
        inp.autocomplete = "off";
        inp.placeholder = part.placeholder || (part.kind === "sentence" ? "문장 전체" : "빈칸 말만");
        inp.setAttribute("aria-label", part.label || "answer");
        block.appendChild(inp);
      }
      card.appendChild(block);
    });
  } else {
    const inp = document.createElement(item.type === "sentence" ? "textarea" : "input");
    if (item.type !== "sentence") inp.type = "text";
    inp.autocomplete = "off";
    inp.placeholder = item.type === "sentence" ? "문장 전체를 쓰세요" : "빈칸 말만";
    inp.setAttribute("aria-label", item.type === "sentence" ? "문장 전체" : "빈칸");
    card.appendChild(inp);
  }
  return card;
}

async function play() {
  let ex, path;
  if (qs.get("demo")) path = "data/_demo/exercises/demo-sample.json";
  else {
    const b = qs.get("b"), u = qs.get("u"), e = qs.get("e");
    if (!/^[a-z0-9-]+$/.test(b) || !/^u0[1-8]$/.test(u) || !/^[A-Za-z0-9_-]+$/.test(e || "")) return (app.textContent = "Bad link");
    path = `data/${b}/${u}/exercises/${e}.json`;
  }
  ex = legacyExercise(await getJSON(path));
  const key = "bekbal:" + path;
  let attempts = +(sessionStorage.getItem(key) || 0);
  let timer;

  const start = () => {
    const mins = Math.max(1, Math.round(timeFor(ex) / 60));
    app.innerHTML = "";
    if (ex.demo) app.appendChild(el("p", "banner", "DEMO — 실제 교재 문제가 아닙니다 (사이트 테스트용)"));
    const back = qs.get("b") && qs.get("u") ? `unit.html?b=${qs.get("b")}&u=${qs.get("u")}` : "index.html";
    const crumb = el("p", "crumb");
    crumb.innerHTML = `<a href="${back}">← 목록</a>`;
    app.appendChild(crumb);
    app.appendChild(el("h1", "practice-title", ex.title || "Practice"));
    if (ex.introKo) app.appendChild(el("p", "intro-ko", ex.introKo));
    const row = el("div", "section-intro-row");
    (ex.sections || []).forEach((s) => {
      const cell = el("div", "section-intro-cell");
      cell.appendChild(el("span", "section-intro-title", s.title || s.id));
      if (s.answerModeTag) cell.appendChild(el("span", "mode-chip", s.answerModeTag));
      row.appendChild(cell);
    });
    if ((ex.sections || []).length) app.appendChild(row);
    app.appendChild(el("p", "meta", `시도 ${attempts + 1} / ${MAX_ATTEMPTS} · 통과 기준 80% · 제한 약 ${mins}분 · 소리 없음`));
    const timerBar = el("div", "timer-bar", "");
    timerBar.id = "t";
    app.appendChild(timerBar);
    const form = document.createElement("form");
    form.id = "f";
    let last = null;
    (ex.questions || []).forEach((item) => {
      if (item.section && item.section !== last) {
        last = item.section;
        const sec = (ex.sections || []).find((s) => s.id === item.section);
        const banner = el("div", "section-banner");
        const head = el("div", "section-banner-head");
        head.appendChild(el("span", "section-banner-title", (sec && sec.title) || item.sectionTitle || item.section));
        const tag = (sec && sec.answerModeTag) || item.answerModeTag;
        if (tag) head.appendChild(el("span", "mode-chip", tag));
        banner.appendChild(head);
        const instr = (sec && sec.instructionKo) || item.sectionInstructionKo || "";
        if (instr) banner.appendChild(el("div", "section-banner-instr", instr));
        form.appendChild(banner);
      }
      form.appendChild(renderCard(item));
    });
    const actions = el("div", "actions");
    const btn = el("button", "btn btn-primary", "제출 Submit");
    btn.type = "submit";
    actions.appendChild(btn);
    form.appendChild(actions);
    app.appendChild(form);
    let left = timeFor(ex);
    const tick = () => {
      const node = $("#t");
      if (node) node.textContent = `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
      if (left-- <= 0) { clearInterval(timer); grade(); }
    };
    clearInterval(timer);
    timer = setInterval(tick, 1000);
    tick();
    form.onsubmit = (ev) => { ev.preventDefault(); clearInterval(timer); grade(); };
  };

  const grade = () => {
    const cards = [...document.querySelectorAll(".q-card")];
    const res = (ex.questions || []).map((q, i) => {
      const resp = readResponse(q, cards[i]);
      return { q, resp, ok: G.gradeItem(q, resp) };
    });
    attempts++;
    sessionStorage.setItem(key, attempts);
    const score = res.filter((r) => r.ok).length;
    const pct = res.length ? score / res.length : 0;
    const passed = pct >= PASS;
    const reveal = passed || attempts >= MAX_ATTEMPTS;
    const mistakes = score < res.length;
    app.innerHTML = "";
    app.appendChild(el("h1", "practice-title", ex.title || "Practice"));
    const head = el("h2", passed ? "ok" : "bad", `${score} / ${res.length} (${Math.round(pct * 100)}%) — ${passed ? "통과 PASS" : "미통과"}`);
    app.appendChild(head);
    app.appendChild(el("p", "meta", `시도 ${attempts} / ${MAX_ATTEMPTS}`));
    if (!reveal) {
      app.appendChild(el("p", null, `80% 이상이 되어야 통과입니다. 다시 풀어 보세요. 남은 기회 ${MAX_ATTEMPTS - attempts}번.`));
      if (mistakes) {
        const box = el("div", "remind");
        box.innerHTML = REMIND;
        app.appendChild(box);
      }
      const retry = el("button", "btn btn-primary", "다시 풀기 Retry");
      retry.id = "r";
      retry.onclick = start;
      app.appendChild(retry);
    } else {
      const wrong = res.filter((r) => !r.ok);
      if (!wrong.length) app.appendChild(el("p", null, "틀린 문제가 없습니다."));
      else {
        app.appendChild(el("h2", null, "틀린 문제 · 정답 · 해설"));
        wrong.forEach((r) => {
          const box = el("article", "q-card wrong");
          box.appendChild(el("div", "q-num", r.q.label || ""));
          const stem = el("div", "q-en");
          stem.innerHTML = promptHtml(r.q.promptEn || "");
          box.appendChild(stem);
          box.appendChild(el("p", null, "내 답: ")).appendChild(el("span", "bad", G.formatResponse(r.q, r.resp)));
          const mine = box.lastChild;
          mine.className = "result-line";
          const ans = el("p", "result-line", "정답: ");
          ans.appendChild(el("span", "ok", G.formatCorrect(r.q)));
          box.appendChild(ans);
          if (r.q.explainKo) box.appendChild(el("p", "explain", "해설: " + r.q.explainKo));
          app.appendChild(box);
        });
      }
      sessionStorage.removeItem(key);
      const again = el("p", "crumb");
      const back = qs.get("b") && qs.get("u") ? `unit.html?b=${qs.get("b")}&u=${qs.get("u")}` : "index.html";
      again.innerHTML = `<a href="${back}">← 목록으로</a>`;
      app.appendChild(again);
    }
    scrollTo(0, 0);
  };
  start();
}

({ index, book, unit, play })[document.body.dataset.page]().catch((e) => { app.textContent = "Error: " + e.message; });
