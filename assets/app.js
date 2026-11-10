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
function focusOf(sectionTitle) {
  // The catalog section is the area. A vocab- or grammar- id is still a book question.
  const t = sectionTitle || "";
  if (/word\s*focus/i.test(t)) return "vocab";
  if (/reading\s*focus/i.test(t)) return "reading";
  if (/grammar\s*focus/i.test(t)) return "grammar";
  return "book";
}
const FOCUS = [
  { key: "vocab", title: "① Word Focus · 단어" },
  { key: "reading", title: "② Reading Focus · 읽기" },
  { key: "grammar", title: "③ Grammar Focus · 문법" },
];

function bekDone() { try { return JSON.parse(localStorage.getItem("bek.progress.v1") || "{}"); } catch (e) { return {}; } }
function bekScore() { try { return JSON.parse(localStorage.getItem("bek.scores.v1") || "{}"); } catch (e) { return {}; } }

const chipLink = (cls, label, href, title) =>
  `<a class="chip ${cls}" href="${esc(href)}" target="_blank" rel="noopener"${title ? ` title="${esc(title)}"` : ""}>${label}</a>`;
const qtLabel = (q) => `${q.shape} · ${q.minutes || (q.shape === "TF" ? 5 : 15)}분${q.items ? " · " + q.items + "문항" : ""}`;
const noVideo = `<span class="chip soon" title="이 문법의 영상이 아직 없습니다">영상 준비 중</span>`;
const noTest = `<span class="chip soon" title="테스트를 만드는 중입니다">테스트 준비 중</span>`;

function grammarQuick(types) {
  if (!types || !types.length) return "";
  return `<div class="gq-head"><span class="gq-badge">Quick Test</span>` +
    `<span class="gq-lead">노트 → 영상 → 테스트 순서로 하세요</span>` +
    `<span class="gq-hint">Notes → Video → three tests</span></div>` +
    `<div class="gq-grid">` + types.map((t) => {
      const chips = [chipLink("gold", "노트 Notes", t.note, t.type + " 설명 노트")];
      chips.push(t.video ? chipLink("purple", "영상 Video", t.video, t.type + " 설명 영상") : noVideo);
      (t.tests || []).forEach((q) => chips.push(chipLink("qt", "⚡ " + qtLabel(q), q.url, t.type + " · " + q.shape)));
      if (!(t.tests || []).length) chips.push(noTest);
      return `<div class="gq-card"><div class="gq-type">${esc(t.type)}</div>` +
        `<div class="chips">${chips.join("")}</div></div>`;
    }).join("") + `</div>`;
}

async function unit() {
  const b = qs.get("b"), u = qs.get("u");
  if (!/^[a-z0-9-]+$/.test(b) || !/^u0[1-8]$/.test(u)) return (app.textContent = "Bad link");
  const c = await getJSON(`data/${b}/${u}/catalog.json`);
  const done = bekDone(), scores = bekScore();
  let gmap = null;
  try { const g = await getJSON("data/grammar-focus.json"); gmap = (g && g[b + "/" + u]) || null; } catch (e) { gmap = null; }

  const card = (e) => {
    const key = b + "|" + u + "|" + e.id;
    const isDone = !!done[key];
    const sc = scores[key];
    if (e.href && /^https:\/\//.test(e.href)) {
      return `<a class="ex" href="${esc(e.href)}" target="_blank" rel="noopener"><span class="t">${esc(e.title)}</span><span class="m">다른 사이트에서 열립니다</span></a>`;
    }
    if (e.href && /^reading\.html\?b=[a-z0-9-]+&u=u0[1-8]$/.test(e.href)) {
      return `<a class="ex${isDone ? " done" : ""}" href="${esc(e.href)}">` +
        `<span class="t">${isDone ? "✓ " : ""}${esc(e.title)}</span>` +
        `<span class="m">받아쓰기 · 쓰기 · 시험</span></a>`;
    }
    if (e.deferred) return `<div class="ex off"><span class="t">${esc(e.title)}</span><span class="m">확인 필요</span></div>`;
    const n = e.questionCount ? ` · ${e.questionCount}문항` : "";
    const hold = e.omittedCount ? ` · 보류 ${e.omittedCount}` : "";
    return `<a class="ex${isDone ? " done" : ""}" href="play.html?b=${b}&u=${u}&e=${encodeURIComponent(e.id)}">` +
      `<span class="t">${isDone ? "✓ " : ""}${esc(e.title)}</span>` +
      `<span class="m">${n.replace(" ·", "")}${hold}</span>` +
      (sc ? `<span class="sc">점수 ${sc.got} / ${sc.total}</span>` : "") + `</a>`;
  };

  const buckets = { vocab: [], reading: [], grammar: [], book: [] };
  (c.sections || []).forEach((s) => {
    const key = focusOf(s.title);
    const items = s.exercises || [];
    if (key === "book") buckets.book.push({ title: s.title || "교재", exercises: items });
    else items.forEach((e) => buckets[key].push(e));
  });

  const countOf = (list) => {
    if (!list.length) return "Coming soon";
    const finished = list.filter((e) => done[b + "|" + u + "|" + e.id]).length;
    return `${finished} / ${list.length}`;
  };
  const soon = `<div class="ex off"><span class="t">아직 준비 중입니다</span><span class="m">Coming soon</span></div>`;

  let html = `<p class="crumb"><a href="book.html?b=${b}">← 단원 목록</a></p>` +
    `<h1 class="practice-title">${esc(c.label)}<span class="tag ${c.status}">${STATUS[c.status] || c.status}</span></h1>`;

  FOCUS.forEach((f) => {
    const list = buckets[f.key];
    if (f.key === "grammar" && list.length) {
      const quickIds = /^(note-|video-|grammar-quicktest-)/;
      const more = gmap ? list.filter((e) => !quickIds.test(e.id)) : list;
      const quick = grammarQuick(gmap);
      let body = quick;
      if (more.length) {
        body += `<div class="gq-sub">추가 연습 · More practice</div><div class="gq-more">` + more.map(card).join("") + `</div>`;
      }
      html += `<section class="focus grammar"><div class="focus-head">${f.title}` +
        `<span class="cnt">${countOf(list)}</span></div><div class="focus-body single">` + (body || soon) + `</div></section>`;
      return;
    }
    html += `<section class="focus ${f.key}"><div class="focus-head">${f.title}` +
      `<span class="cnt">${countOf(list)}</span></div><div class="focus-body">` +
      (list.length ? list.map(card).join("") : soon) + `</div></section>`;
  });

  const bookItems = buckets.book.reduce((n, s) => n + s.exercises.length, 0);
  let bookHtml = "";
  buckets.book.forEach((s) => {
    if (!s.exercises.length) return;
    bookHtml += `<div class="focus-sub">${esc(s.title)}</div>` + s.exercises.map(card).join("");
  });
  html += `<section class="focus tests"><div class="focus-head">④ 교재 문제 · Book` +
    `<span class="cnt">${bookItems ? countOf(buckets.book.reduce((a, s) => a.concat(s.exercises), [])) : "Coming soon"}</span>` +
    `</div><div class="focus-body">${bookHtml || soon}</div></section>`;
  app.innerHTML = html;
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

function blankLabel(fb) {
  const s = String(fb || "");
  return /^\d+$/.test(s) ? "(" + s + ")" : s;
}

function promptHtml(raw, item) {
  const text = String(raw ?? "");
  const focus = item && item.focusBlank ? String(item.focusBlank) : "";
  if (!focus) {
    return esc(text).replace(/_{3,}/g, '<span class="blank-mark">______</span>').replace(/\n/g, "<br>").replace(/&lt;u&gt;/g, "<u>").replace(/&lt;\/u&gt;/g, "</u>");
  }
  const re = /[（(]\s*(\d+)\s*[)）]\s*_{2,}|([ⓐ-ⓙ])(?:\s*_{2,}|\s*\([^)\n]+\)|\s*[A-Za-z][A-Za-z'’]*)|[（(]([A-Z])[)）]\s*\[[^\]\n]+\]|_{3,}/g;
  const parts = [];
  let last = 0;
  let plainN = 0;
  let m;
  while ((m = re.exec(text))) {
    parts.push({ type: "text", s: text.slice(last, m.index) });
    if (m[1]) parts.push({ type: "slot", id: m[1], label: "(" + m[1] + ")", show: m[0], kind: "slot" });
    else if (m[2]) {
      const show = m[0];
      parts.push({ type: "slot", id: m[2], label: m[2], show, kind: /_{2,}/.test(show) ? "slot" : "word" });
    }
    else if (m[3]) parts.push({ type: "slot", id: m[3], label: "(" + m[3] + ")", show: m[0], kind: "slot" });
    else {
      plainN += 1;
      parts.push({ type: "slot", id: String(plainN), label: "(" + plainN + ")", show: m[0], kind: "slot", plain: true });
    }
    last = m.index + m[0].length;
  }
  parts.push({ type: "text", s: text.slice(last) });
  const slots = parts.filter((p) => p.type === "slot");
  const explicit = new Set(slots.filter((p) => !p.plain).map((p) => p.id));
  return parts.map((p) => {
    if (p.type === "text") return esc(p.s);
    const active = p.id === focus && (!p.plain || !explicit.has(focus));
    if (!active) {
      if (p.kind === "word") return `<span class="blank-idle">${esc(p.show)}</span>`;
      return `<span class="blank-idle">${esc(p.label)} ···</span>`;
    }
    const tag = esc(blankLabel(focus));
    if (p.kind === "word") return `<span class="blank-live"><span class="blank-live-tag">이 칸 ${tag}</span> ${esc(p.show)} → ______</span>`;
    return `<span class="blank-live"><span class="blank-live-tag">이 칸 ${tag}</span> ______</span>`;
  }).join("").replace(/\n/g, "<br>").replace(/&lt;u&gt;/g, "<u>").replace(/&lt;\/u&gt;/g, "</u>");
}

function timeFor(ex) {
  if (ex.timeLimitSec) return ex.timeLimitSec;
  return (ex.questions || []).reduce((t, q) => t + G.secondsFor(q), 0);
}

function readResponse(item, card) {
  if (item.type === "mc" || item.type === "bank") {
    const inputs = [...card.querySelectorAll('input[type="radio"], input[type="checkbox"]')];
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
  if (item.type === "match") {
    const node = card.querySelector("[data-match]");
    let links = [];
    try { links = JSON.parse(node && node.dataset.links ? node.dataset.links : "[]"); } catch (e) { links = []; }
    return { links };
  }
  const inp = card.querySelector('input[type="text"], textarea');
  return { value: inp ? inp.value : "" };
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function renderMatch(card, item) {
  const pairs = item.pairs || [];
  const links = [];
  let sel = null;
  const wrap = el("div", "match-wrap");
  wrap.dataset.match = "1";
  wrap.dataset.links = "[]";
  const grid = el("div", "match-grid");
  const enCol = el("div", "match-col");
  const koCol = el("div", "match-col");
  enCol.appendChild(el("div", "match-col-label", "English"));
  koCol.appendChild(el("div", "match-col-label", "우리말"));
  const hint = el("p", "match-hint", "왼쪽 영어를 누르고, 같은 뜻의 우리말을 누르세요. 짝을 다시 누르면 풀립니다.");
  function sync() {
    wrap.dataset.links = JSON.stringify(links.map((l) => [l.en, l.ko]));
  }
  function paint() {
    sync();
    [...enCol.querySelectorAll(".match-chip"), ...koCol.querySelectorAll(".match-chip")].forEach((btn) => {
      btn.className = "match-chip";
      const side = btn.dataset.side;
      const id = btn.dataset.id;
      const at = links.findIndex((l) => l[side] === id);
      if (at >= 0) btn.classList.add("is-linked", "match-c" + (at % 6));
      if (sel && sel.side === side && sel.id === id) btn.classList.add("is-selected");
    });
  }
  function tap(side, id) {
    const existing = links.findIndex((l) => l[side] === id);
    if (!sel) {
      if (existing >= 0) links.splice(existing, 1);
      else sel = { side, id };
      paint();
      return;
    }
    if (sel.side === side) {
      sel = sel.id === id ? null : { side, id };
      paint();
      return;
    }
    const en = side === "en" ? id : sel.id;
    const ko = side === "ko" ? id : sel.id;
    for (let i = links.length - 1; i >= 0; i--) {
      if (links[i].en === en || links[i].ko === ko) links.splice(i, 1);
    }
    links.push({ en, ko });
    sel = null;
    paint();
  }
  function chip(side, pair, text) {
    const btn = el("button", "match-chip", text);
    btn.type = "button";
    btn.dataset.side = side;
    btn.dataset.id = String(pair.id);
    btn.onclick = () => tap(side, String(pair.id));
    return btn;
  }
  shuffle(pairs).forEach((p) => enCol.appendChild(chip("en", p, p.en)));
  shuffle(pairs).forEach((p) => koCol.appendChild(chip("ko", p, p.ko)));
  grid.appendChild(enCol);
  grid.appendChild(koCol);
  wrap.appendChild(grid);
  wrap.appendChild(hint);
  card.appendChild(wrap);
  paint();
}

function renderChoices(parent, name, choices, multi, indexBase) {
  const box = el("div", "mc-options" + (multi ? " mc-multi" : ""));
  const base = indexBase === 0 ? 0 : 1;
  choices.forEach((ch, i) => {
    const lab = document.createElement("label");
    const inp = document.createElement("input");
    inp.type = multi ? "checkbox" : "radio";
    inp.name = name;
    inp.value = String(i + base);
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
  stem.innerHTML = promptHtml(item.promptEn || "", item);
  card.appendChild(stem);
  if (item.phraseBlank) card.appendChild(el("p", "q-note", "이 칸은 두 단어 이상이 될 수 있어요."));

  if (item.type === "match") renderMatch(card, item);
  else if (item.type === "mc") renderChoices(card, "q-" + item.id, item.choices || [], item.select === "multi" || item.answerMode === "multi");
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
      if (part.kind === "mc") renderChoices(block, "p" + i, part.choices || [], false, part.indexBase);
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
  // Cards held for a re-check are never shown to a student: an empty card is worse than none.
  const heldCount = (ex.questions || []).filter((q) => q.deferred).length;
  if (heldCount) ex.questions = ex.questions.filter((q) => !q.deferred);
  const key = "bekbal:" + path;
  let attempts = +(sessionStorage.getItem(key) || 0);
  let timer;

  const start = () => {
    const mins = Math.max(1, Math.round(timeFor(ex) / 60));
    app.innerHTML = "";
    if (ex.demo) app.appendChild(el("p", "banner", "DEMO — 실제 교재 문제가 아닙니다 (사이트 테스트용)"));
    if (heldCount) app.appendChild(el("p", "banner", "교재 확인 중인 " + heldCount + "문항은 이번 연습에서 뺐습니다. / " + heldCount + " items are held for a book check."));
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
    const hash = location.hash.replace(/^#/, "");
    if (hash) {
      const target = form.querySelector('[data-qid="' + (window.CSS && CSS.escape ? CSS.escape(hash) : hash) + '"]');
      if (target) target.scrollIntoView();
    }
  };

  const grade = () => {
    const cards = [...document.querySelectorAll(".q-card")];
    let got = 0;
    let total = 0;
    const res = (ex.questions || []).map((q, i) => {
      const resp = readResponse(q, cards[i]);
      const unit = G.scoreUnits(q, resp);
      got += unit.got;
      total += unit.total;
      return { q, resp, ok: unit.total > 0 && unit.got === unit.total, got: unit.got, total: unit.total };
    });
    attempts++;
    sessionStorage.setItem(key, attempts);
    const score = got;
    const pct = total ? score / total : 0;
    const passed = pct >= PASS;
    const reveal = passed || attempts >= MAX_ATTEMPTS;
    try {
      const bk = qs.get("b"), un = qs.get("u"), exid = qs.get("e") || "";
      const k = bk + "|" + un + "|" + exid;
      const d = JSON.parse(localStorage.getItem("bek.progress.v1") || "{}");
      const sc = JSON.parse(localStorage.getItem("bek.scores.v1") || "{}");
      sc[k] = { got: score, total: total, pct: Math.round(pct * 100), at: Date.now() };
      if (passed) d[k] = Date.now();
      localStorage.setItem("bek.progress.v1", JSON.stringify(d));
      localStorage.setItem("bek.scores.v1", JSON.stringify(sc));
      const SP = window.StudyProgress;
      if (SP && SP.markDone) SP.markDone("bek|" + k);
    } catch (e) {}

    const mistakes = score < total;
    const allMatch = (ex.questions || []).length > 0 && (ex.questions || []).every((q) => q.type === "match");
    const unitName = allMatch ? " 짝" : "";
    app.innerHTML = "";
    app.appendChild(el("h1", "practice-title", ex.title || "Practice"));
    const head = el("h2", passed ? "ok" : "bad", `${score} / ${total}${unitName} (${Math.round(pct * 100)}%) — ${passed ? "통과 PASS" : "미통과"}`);
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
          stem.innerHTML = promptHtml(r.q.promptEn || "", r.q);
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
