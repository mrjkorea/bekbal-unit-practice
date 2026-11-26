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
  <div id="myscores" class="myscores"></div>
  <h2>Demo</h2><a class="card" href="play.html?demo=1"><span class="tag demo">DEMO</span> 플레이어 시험용 샘플 (교재 문제 아님)</a>`;
  myScores(books);
}

/* Jay 2026-11-17: the front page must show the student's own grades, and the name at the
   top right must open them, the same as every other program. Rows come from the shared
   sign-in record only; a practice with no row shows nothing rather than an invented score. */
let authWait = null;
function authWhenReady() {
  if (authWait) return authWait;
  authWait = new Promise((resolve) => {
    const auth = () => window.MRJ_AUTH || window.MRJSignin || null;
    const named = () => {
      const a = auth();
      try { return a && a.student ? String(a.student() || "") : ""; } catch (e) { return ""; }
    };
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(auth()); } };
    const check = () => { if (named()) finish(); };
    document.addEventListener("mrj-auth-ready", check);
    const t0 = Date.now();
    const iv = setInterval(() => {
      check();
      if (done || Date.now() - t0 > 10000) { clearInterval(iv); finish(); }
    }, 250);
  });
  return authWait;
}

const TITLE_CACHE = {};
async function practiceTitles(bk, u) {
  const key = bk + "/" + u;
  if (TITLE_CACHE[key]) return TITLE_CACHE[key];
  const map = {};
  try {
    const c = await getJSON(`data/${bk}/${u}/catalog.json`);
    (c.sections || []).forEach((s) => (s.exercises || []).forEach((e) => { map[e.id] = e.title || e.id; }));
    map.__label = c.label || u;
  } catch (e) {}
  TITLE_CACHE[key] = map;
  return map;
}

function scoreDate(at) {
  if (!at) return "";
  const d = new Date(at);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

async function myScores(books) {
  const host = document.getElementById("myscores");
  if (!host) return;
  const a = await authWhenReady();
  let who = "";
  try { who = a && a.student ? String(a.student() || "") : ""; } catch (e) {}
  if (!who) { host.innerHTML = ""; return; }
  latestScore.length = 0;
  await loadScores();
  const bookOf = (slug) => books.find((b) => b.slug === slug) || {};
  const unitLabel = (bk, u) => {
    const b = bookOf(bk);
    const unit = (b.units || []).find((y) => y.unit === u);
    return `${b.title || bk} · ${(unit && unit.label) || u}`;
  };
  const latest = (rows) => {
    const m = new Map();
    rows.forEach((s) => { const p = m.get(s.item); if (!p || s.at >= p.at) m.set(s.item, s); });
    return [...m.values()].sort((x, y) => y.at - x.at);
  };
  const ur = latest(latestScore.filter((s) => s.program === "bekbal-unit"));
  const rr = latest(latestScore.filter((s) => s.program === "bekbal-reading"));
  const head = `<h2 class="ms-h">내 점수 · My scores</h2>`;
  if (!ur.length && !rr.length) {
    host.innerHTML = head + `<p class="ms-empty">${esc(who)} · 아직 저장된 점수가 없습니다. 연습을 마치면 이곳에 나옵니다.` +
      `<br><span class="sub">Finish a practice and its score appears here.</span></p>`;
    offerLocalScores(host, books);
    return;
  }
  let html = head + `<p class="ms-who">${esc(who)} · 연습 ${ur.length + rr.length}개에 점수가 있습니다.</p><div class="ms-list">`;
  for (const s of ur) {
    const parts = String(s.item).split("/");
    const bk = parts[0], u = parts[1], ex = parts.slice(2).join("/");
    const titles = bookOf(bk) && bookOf(bk).units ? await practiceTitles(bk, u) : {};
    html += `<a class="ms-row" href="play.html?b=${encodeURIComponent(bk)}&u=${encodeURIComponent(u)}&e=${encodeURIComponent(ex)}">` +
      `<span class="ms-t">${esc(titles[ex] || ex)}</span><span class="ms-b">${esc(unitLabel(bk, u))}</span>` +
      `<b class="ms-v">${esc(scoreText(s))}</b><span class="ms-d">${esc(scoreDate(s.at))}</span></a>`;
  }
  for (const s of rr) {
    const m = /^(.+)_(u[0-9]+)_(.+)$/.exec(String(s.item));
    const bk = m ? m[1] : "", u = m ? m[2] : "", tag = m ? m[3] : String(s.item);
    html += `<a class="ms-row" href="reading.html?b=${encodeURIComponent(bk)}&u=${encodeURIComponent(u)}">` +
      `<span class="ms-t">Reading Focus · ${esc(tag)}</span><span class="ms-b">${esc(bk ? unitLabel(bk, u) : "")}</span>` +
      `<b class="ms-v">${esc(scoreText(s))}</b><span class="ms-d">${esc(scoreDate(s.at))}</span></a>`;
  }
  host.innerHTML = html + `</div>`;
  offerLocalScores(host, books);
}

/* Jay 2026-11-17: scores done on this device before the site kept a server copy were
   only in this browser. The row was never sent, so the student may offer it now himself:
   nothing is posted until he presses the button, and only into his own sign-in. */
function localUnsynced() {
  const have = {};
  latestScore.forEach((s) => { if (s.program === "bekbal-unit") have[s.item] = true; });
  let sent = {};
  try { sent = JSON.parse(localStorage.getItem("bek.sent.v1") || "{}"); } catch (e) { sent = {}; }
  const sc = bekScore();
  const out = [];
  Object.keys(sc).forEach((k) => {
    const v = sc[k] || {};
    const parts = String(k).split("|");
    if (parts.length < 3 || !v.total || Number(v.total) <= 0) return;
    const item = parts[0] + "/" + parts[1] + "/" + parts.slice(2).join("/");
    if (have[item] || sent[item]) return;
    out.push({ key: k, item, got: Number(v.got) || 0, total: Number(v.total), at: Number(v.at) || 0 });
  });
  return out;
}

function offerLocalScores(host, books) {
  const pending = localUnsynced();
  if (!pending.length) return;
  const box = el("div", "ms-local");
  box.appendChild(el("p", null, `이 기기에만 있는 점수 ${pending.length}개가 있습니다. 그 점수는 선생님 기록에 없습니다.`));
  box.appendChild(el("p", "sub", "Scores saved only in this browser. Send them to your record?"));
  const btn = el("button", "btn btn-primary", `내 기록으로 보내기 (${pending.length})`);
  btn.onclick = async () => {
    btn.disabled = true;
    btn.textContent = "보내는 중…";
    try {
      if (window.MRJ_SCORES && typeof window.MRJ_SCORES.post === "function") {
        await Promise.all(pending.map((p) => window.MRJ_SCORES.post({
          program: "bekbal-unit",
          appName: "백발백중 Unit Practice",
          unitTitle: p.item.split("/").slice(0, 2).join(" "),
          itemId: p.item,
          itemType: "practice_summary",
          scoreValue: p.got,
          scoreMax: p.total,
          scorePct: Math.round((100 * p.got) / p.total),
          when: p.at || undefined
        })));
      }
      box.innerHTML = "";
      box.appendChild(el("p", "ok", `보냈습니다 (${pending.length}개). 이제 위 목록과 선생님 기록에 나옵니다.`));
      try {
        const sent = JSON.parse(localStorage.getItem("bek.sent.v1") || "{}");
        pending.forEach((p) => { sent[p.item] = 1; });
        localStorage.setItem("bek.sent.v1", JSON.stringify(sent));
      } catch (e) {}
      latestScore.length = 0;
      await loadScores();
      myScores(books);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "다시 보내기";
      box.appendChild(el("p", "bad", "보내지 못했습니다. 다시 눌러 주세요."));
    }
  };
  box.appendChild(btn);
  host.appendChild(box);
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

/* ---- Scores on the unit page (Jay 2026-11-10): every activity shows the score of its
   latest finished try. Real rows only, from the shared sign-in backend, one program at a
   time; nothing is invented when a row is missing. ---- */
const SCORE_PROGRAMS = ["bekbal-unit", "bekbal-reading", "mse-quicktest", "greenzap", "word-master"];
const latestScore = [];
let scorePass = 0;

function rowScore(row) {
  const raw = String(row && row.score != null ? row.score : "").trim();
  let m;
  const at = Date.parse(String((row && row.date) || "")) || 0;
  if ((m = raw.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/)) && +m[2] > 0) {
    return { program: row.program, item: String(row.item || ""), v: +m[1], max: +m[2], pct: Math.round((100 * +m[1]) / +m[2]), at };
  }
  if ((m = raw.match(/^(-?\d+(?:\.\d+)?)\s*%$/))) {
    return { program: row.program, item: String(row.item || ""), v: null, max: null, pct: Math.round(+m[1]), at };
  }
  return null;
}

function scoreText(s) {
  if (!s) return "";
  return s.max != null ? `${s.v} / ${s.max} · ${s.pct}%` : `${s.pct}%`;
}

function loadScores() {
  /* One request for every program, the same call My Scores uses (action "progress"),
     so the page does not wait on five slow round trips. */
  const a = window.MRJ_AUTH || window.MRJSignin;
  if (!a || !a.ENDPOINT || typeof a.token !== "function") return Promise.resolve(false);
  let who = "", tok = "";
  try { who = a.student ? String(a.student() || "") : ""; tok = String(a.token() || ""); } catch (e) { return Promise.resolve(false); }
  if (!who || !tok) return Promise.resolve(false);
  const rows = [];
  const page = (off) => fetch(a.ENDPOINT, {
    method: "POST", redirect: "follow", headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "progress", id: who, token: tok, offset: off, limit: 500 })
  }).then((r) => r.json()).then((d) => {
    if (!d || !d.ok) return rows;
    const c = Array.isArray(d.progress) ? d.progress : [];
    c.forEach((x) => rows.push(x));
    if (d.hasMore === true && c.length && off < 3000) return page(off + c.length);
    return rows;
  });
  return page(0).then((all) => {
    all.forEach((row) => {
      const s = rowScore({ program: row.program, item: row.item, score: row.score, date: row.date });
      if (s) latestScore.push(s);
    });
    return latestScore.length > 0;
  }).catch(() => false);
}

function findScore(program, q) {
  let best = null;
  for (let i = 0; i < latestScore.length; i++) {
    const s = latestScore[i];
    if (program && s.program !== program) continue;
    if (q.exact != null && s.item !== q.exact) continue;
    if (q.prefix && s.item.indexOf(q.prefix) !== 0) continue;
    if (!best || s.at >= best.at) best = s;
  }
  return best;
}

const chipLink = (cls, label, href, title) =>
  `<a class="chip ${cls}" href="${esc(href)}" target="_blank" rel="noopener"${title ? ` title="${esc(title)}"` : ""}>${label}</a>`;
const qtLabel = (q) => `${q.shape} · ${q.minutes || (q.shape === "TF" ? 5 : 15)}분${q.items ? " · " + q.items + "문항" : ""}`;
const noVideo = `<span class="chip soon" title="이 문법의 영상이 아직 없습니다">영상 준비 중</span>`;
const noTest = `<span class="chip soon" title="테스트를 만드는 중입니다">테스트 준비 중</span>`;

function grammarQuick(types, scoreOf) {
  if (!types || !types.length) return "";
  return `<div class="gq-head"><span class="gq-badge">Quick Test</span>` +
    `<span class="gq-lead">노트 → 영상 → 테스트 순서로 하세요</span>` +
    `<span class="gq-hint">Notes → Video → three tests</span></div>` +
    `<div class="gq-grid">` + types.map((t) => {
      const chips = [chipLink("gold", "노트 Notes", t.note, t.type + " 설명 노트")];
      chips.push(t.video ? chipLink("purple", "영상 Video", t.video, t.type + " 설명 영상") : noVideo);
      (t.tests || []).forEach((q) => {
        const sc = scoreOf ? scoreOf(q.url) : null;
        chips.push(chipLink(sc ? "qt ok" : "qt", (sc ? "✓ " : "⚡ ") + qtLabel(q) +
          (sc ? ` <b class="cin">${esc(scoreText(sc))}</b>` : ""), q.url,
          t.type + " · " + q.shape + (sc ? " · 최근 점수 " + scoreText(sc) : "")));
      });
      if (!(t.tests || []).length) chips.push(noTest);
      return `<div class="gq-card"><div class="gq-type">${esc(t.type)}</div>` +
        `<div class="chips">${chips.join("")}</div></div>`;
    }).join("") + `</div>`;
}

async function unit() {
  const b = qs.get("b"), u = qs.get("u");
  if (!/^[a-z0-9-]+$/.test(b) || !/^u(?:0[1-9]|1[0-6])$/.test(u)) return (app.textContent = "Bad link");
  const c = await getJSON(`data/${b}/${u}/catalog.json`);
  const done = bekDone(), scores = bekScore();
  const scoreOf = (href) => {
    const h = String(href || "");
    let m;
    if ((m = /quicktest\/#\/test\/([a-z0-9-]+)\/([A-Za-z0-9]+)/i.exec(h))) return findScore("mse-quicktest", { exact: m[1] + "-" + m[2] });
    if ((m = /MRJ-Zap-Grammar-Books\/#\/p\/([^?#]+)/.exec(h))) return findScore("greenzap", { exact: m[1] });
    if (/word-master\//.test(h)) {
      const p = (/packsrc=[^&]*\/([A-Za-z0-9_-]+)\.json/.exec(h) || [])[1];
      return p ? findScore("word-master", { prefix: p + ":" }) : null;
    }
    if (/reading\.html\?/.test(h)) return findScore("bekbal-reading", { prefix: b + "_" + u + "_" });
    return null;
  };
  const exScore = (e) => scoreOf(e.href) || findScore("bekbal-unit", { exact: b + "/" + u + "/" + e.id });
  let gmap = null;
  try { const g = await getJSON("data/grammar-focus.json"); gmap = (g && g[b + "/" + u]) || null; } catch (e) { gmap = null; }

  const card = (e, grp) => {
    const key = b + "|" + u + "|" + e.id;
    const ext = exScore(e);
    const isDone = !!done[key] || !!ext;
    const sc = scores[key];
    const badge = ext ? `<span class="sc">최근 ${esc(scoreText(ext))}</span>`
      : (sc ? `<span class="sc">점수 ${sc.got} / ${sc.total}</span>` : "");
    if (e.href && /^https:\/\//.test(e.href)) {
      return `<a class="ex${isDone ? " done" : ""}" href="${esc(e.href)}" target="_blank" rel="noopener">` +
        `<span class="t">${isDone ? "✓ " : ""}${esc(e.title)}</span>` +
        (badge || `<span class="m">다른 사이트에서 열립니다</span>`) + `</a>`;
    }
    if (e.href && /^reading\.html\?b=[a-z0-9-]+&u=u(?:0[1-9]|1[0-6])(?:&pack=packs\/[A-Za-z0-9_.-]+\.json)?$/.test(e.href)) {
      return `<a class="ex${isDone ? " done" : ""}" href="${esc(e.href)}">` +
        `<span class="t">${isDone ? "✓ " : ""}${esc(e.title)}</span>` +
        (badge || `<span class="m">받아쓰기 · 쓰기 · 시험</span>`) + `</a>`;
    }
    if (e.deferred) return `<div class="ex off"><span class="t">${esc(e.title)}</span><span class="m">확인 필요</span></div>`;
    /* Jay 2026-11-16: a practice that is shorter than its book page, or has nothing to answer,
       must say so on its card. Nothing may look like the whole book exercise when it is not. */
    const shown = Number(e.questionCount) || 0, held = Number(e.omittedCount) || 0;
    if (!shown) {
      return `<div class="ex off"><span class="t">${esc(e.title)}</span>` +
        `<span class="m">다시 만드는 중 · rebuilding${held ? ` (${held}문항)` : ""}</span></div>`;
    }
    const label = held
      ? `<span class="m">${shown}문항 · 빠진 문항 ${held}개 <b class="part">일부만</b></span>`
      : `<span class="m">${shown}문항</span>`;
    return `<a class="ex${isDone ? " done" : ""}" href="play.html?b=${b}&u=${u}&e=${encodeURIComponent(e.id)}${grp === "x10" ? "&g=x10" : ""}">` +
      `<span class="t">${isDone ? "✓ " : ""}${esc(e.title)}</span>` +
      label + badge + `</a>`;
  };

  /* Jay 2026-11-16: X-10 is a different printed book, so its questions never sit in the
     book group. A section marked "group":"x10" (or titled X-10) goes to its own ⑤ section,
     and the 최종점검 mocks printed in the X-10 booklet go there too, not with 본책. */
  const buckets = { vocab: [], reading: [], grammar: [], book: [], x10: [] };
  (c.sections || []).forEach((s) => {
    const key = focusOf(s.title);
    const items = s.exercises || [];
    if (key === "book") {
      const grp = s.group === "x10" || (!s.group && /X-10/i.test(s.title || "")) ? "x10" : "book";
      buckets[grp].push({ title: s.title || "교재", exercises: items });
    } else items.forEach((e) => buckets[key].push(e));
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
    /* A unit with no grammar drills of its own still gets its Quick Test chips,
       because the chip data alone is enough (Jay 2026-11-11: Lesson 05 grammar). */
    if (f.key === "grammar" && (list.length || (gmap && gmap.length))) {
      const quickIds = /^(note-|video-|grammar-quicktest-)/;
      const more = gmap ? list.filter((e) => !quickIds.test(e.id)) : list;
      const quick = grammarQuick(gmap, scoreOf);
      let body = quick;
      if (more.length) {
        body += `<div class="gq-sub">추가 연습 · More practice</div><div class="gq-more">` + more.map((e) => card(e)).join("") + `</div>`;
      }
      const cnt = list.length ? countOf(list) : "";
      html += `<section class="focus grammar"><div class="focus-head">${f.title}` +
        `<span class="cnt">${cnt}</span></div><div class="focus-body single">` + (body || soon) + `</div></section>`;
      return;
    }
    html += `<section class="focus ${f.key}"><div class="focus-head">${f.title}` +
      `<span class="cnt">${countOf(list)}</span></div><div class="focus-body">` +
      (list.length ? list.map((e) => card(e)).join("") : soon) + `</div></section>`;
  });

  const flat = (list) => list.reduce((a, s) => a.concat(s.exercises), []);
  const groupHtml = (list, grp) => list.map((s) => s.exercises.length
    ? `<div class="focus-sub">${esc(s.title)}</div>` + s.exercises.map((e) => card(e, grp)).join("")
    : "").join("");
  const bookAll = flat(buckets.book), x10All = flat(buckets.x10);

  html += `<section class="focus tests"><div class="focus-head">④ 교재 문제 · Book` +
    `<span class="cnt">${bookAll.length ? countOf(bookAll) : "Coming soon"}</span>` +
    `</div><div class="focus-body">${groupHtml(buckets.book, "book") || soon}</div></section>`;

  if (x10All.length) {
    html += `<section class="focus x10"><div class="focus-head">⑤ X-10 워크북 · X-10` +
      `<span class="cnt">${countOf(x10All)}</span></div><div class="focus-body">` +
      `<p class="x10-note">본책과 다른 별책입니다. X-10 문제는 이 칸에만 있습니다. · A separate workbook.</p>` +
      groupHtml(buckets.x10, "x10") + `</div></section>`;
  }
  app.innerHTML = html;
  /* The page paints at once; the signed-in scores arrive after and redraw it once
     (Jay 2026-11-10: the score must be on the page, not behind a click). */
  if (scorePass === 0) {
    scorePass = 1;
    if (latestScore.length) { scorePass = 2; }
    else loadScores().then((got) => { scorePass = 2; if (got) unit(); });
  }
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
    if (!/^[a-z0-9-]+$/.test(b) || !/^u(?:0[1-9]|1[0-6])$/.test(u) || !/^[A-Za-z0-9_-]+$/.test(e || "")) return (app.textContent = "Bad link");
    path = `data/${b}/${u}/exercises/${e}.json`;
  }
  ex = legacyExercise(await getJSON(path));
  /* Jay 2026-11-25: 대화 영작 is a drill, not a test. practiceMode turns off the
     pass gate, the clock and the try limit, and shows the model line at once, so a
     student practises instead of failing the same wall three times. */
  const practice = !!ex.practiceMode;
  // Cards held for a re-check are never shown to a student: an empty card is worse than none.
  const heldCount = (ex.questions || []).filter((q) => q.deferred).length;
  if (heldCount) ex.questions = ex.questions.filter((q) => !q.deferred);
  /* Jay 2026-11-16: a practice with nothing left to answer is never opened, even from an old
     bookmark, because 0/0 tells a student nothing and looks like a broken test. */
  if (!(ex.questions || []).length) {
    const back = qs.get("b") && qs.get("u") ? `unit.html?b=${qs.get("b")}&u=${qs.get("u")}` : "index.html";
    app.innerHTML = `<p class="crumb"><a href="${back}">← 목록</a></p>` +
      `<h1 class="practice-title">${esc(ex.title || "Practice")}</h1>` +
      `<p class="banner">이 연습은 지금 다시 만드는 중입니다. 교재 문제를 새로 옮긴 뒤에 열립니다. · This practice is being rebuilt from the book and is closed for now.</p>`;
    return;
  }
  /* The X-10 chip appears only on a real X-10 practice (Jay 2026-11-16). */
  const isX10 = qs.get("g") === "x10" || /^x10-/.test(qs.get("e") || "");
  const sourceChip = () => (isX10 ? el("p", "x10-chip", "X-10 워크북 · 별책 문제입니다") : null);
  const key = "bekbal:" + path;
  let attempts = +(sessionStorage.getItem(key) || 0);
  /* Jay 2026-11-18: a try that scores 51-79% re-asks only the questions that were
     wrong; a try at 50% or less starts the whole test again. The list of missed
     ids lives with the attempt count in this tab. */
  const readRetry = () => {
    try { return JSON.parse(sessionStorage.getItem(key + ":only") || "null"); } catch (e) { return null; }
  };
  const writeRetry = (ids) => {
    try {
      if (ids && ids.length) sessionStorage.setItem(key + ":only", JSON.stringify(ids));
      else sessionStorage.removeItem(key + ":only");
    } catch (e) {}
  };
  let timer;
  let pool = null;

  const start = (onlyIds) => {
    const all = ex.questions || [];
    pool = (onlyIds && onlyIds.length)
      ? all.filter((q) => onlyIds.indexOf(String(q.id)) >= 0)
      : all.slice();
    const onlyMode = pool.length > 0 && pool.length < all.length;
    const mins = Math.max(1, Math.round(timeFor(ex) / 60));
    app.innerHTML = "";
    if (ex.demo) app.appendChild(el("p", "banner", "DEMO — 실제 교재 문제가 아닙니다 (사이트 테스트용)"));
    if (heldCount) app.appendChild(el("p", "banner", "교재 확인 중인 " + heldCount + "문항은 이번 연습에서 뺐습니다. / " + heldCount + " items are held for a book check."));
    const back = qs.get("b") && qs.get("u") ? `unit.html?b=${qs.get("b")}&u=${qs.get("u")}` : "index.html";
    const crumb = el("p", "crumb");
    crumb.innerHTML = `<a href="${back}">← 목록</a>`;
    app.appendChild(crumb);
    app.appendChild(el("h1", "practice-title", ex.title || "Practice"));
    const chip = sourceChip();
    if (chip) app.appendChild(chip);
    if (onlyMode) {
      app.appendChild(el("p", "banner", `틀린 ${pool.length}문항만 다시 풉니다. (50%를 넘겼으므로 처음부터 풀지 않습니다.) · Retrying only the ${pool.length} questions you missed.`));
    }
    if (ex.introKo) app.appendChild(el("p", "intro-ko", ex.introKo));
    const row = el("div", "section-intro-row");
    const liveSecs = new Set(pool.map((q) => q.section));
    (ex.sections || []).filter((s) => liveSecs.has(s.id)).forEach((s) => {
      const cell = el("div", "section-intro-cell");
      cell.appendChild(el("span", "section-intro-title", s.title || s.id));
      if (s.answerModeTag) cell.appendChild(el("span", "mode-chip", s.answerModeTag));
      row.appendChild(cell);
    });
    if ((ex.sections || []).length) app.appendChild(row);
    app.appendChild(el("p", "meta", practice
      ? `${pool.length}문항 · 연습 모드 · 시간 제한 없음 · 몇 번이든 다시 풀 수 있습니다`
      : `시도 ${attempts + 1} / ${MAX_ATTEMPTS}` + (onlyMode ? ` · 틀린 ${pool.length}문항` : "") + ` · 통과 기준 80% · 제한 약 ${mins}분 · 소리 없음`));
    const timerBar = el("div", "timer-bar", "");
    timerBar.id = "t";
    app.appendChild(timerBar);
    const form = document.createElement("form");
    form.id = "f";
    let last = null;
    pool.forEach((item) => {
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
    if (practice) {
      const bar = $("#t");
      if (bar) bar.remove();
    } else {
      timer = setInterval(tick, 1000);
      tick();
    }
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
    const shown = pool && pool.length ? pool : (ex.questions || []);
    const res = shown.map((q, i) => {
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
    const passed = practice ? true : pct >= PASS;
    const reveal = practice ? true : (passed || attempts >= MAX_ATTEMPTS);
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
      /* Jay 2026-11-10: the score goes into the signed-in record as well as this device,
         so the unit page can show it in the student's row. */
      if (window.MRJ_SCORES && typeof window.MRJ_SCORES.post === "function") {
        window.MRJ_SCORES.post({
          program: "bekbal-unit",
          appName: "백발백중 Unit Practice",
          unitTitle: bk + " " + un,
          itemId: bk + "/" + un + "/" + exid,
          itemType: "practice_summary",
          scoreValue: score,
          scoreMax: total,
          scorePct: Math.round(pct * 100)
        });
      }
    } catch (e) {}

    const missed = res.filter((r) => !r.ok).map((r) => String(r.q.id));
    /* the next try is decided by this try's score, not by the one before it */
    const nextOnly = (!passed && attempts < MAX_ATTEMPTS && pct > 0.5) ? missed : null;
    writeRetry(nextOnly);
    const mistakes = score < total;
    const allMatch = (ex.questions || []).length > 0 && (ex.questions || []).every((q) => q.type === "match");
    const unitName = allMatch ? " 짝" : "";
    app.innerHTML = "";
    app.appendChild(el("h1", "practice-title", ex.title || "Practice"));
    const chip2 = sourceChip();
    if (chip2) app.appendChild(chip2);
    const head = practice
      ? el("h2", pct >= 0.8 ? "ok" : "bad", `${score} / ${total}${unitName} (${Math.round(pct * 100)}%) — 연습`)
      : el("h2", passed ? "ok" : "bad", `${score} / ${total}${unitName} (${Math.round(pct * 100)}%) — ${passed ? "통과 PASS" : "미통과"}`);
    app.appendChild(head);
    app.appendChild(el("p", "meta", practice
      ? `틀린 줄은 아래에 정답과 함께 있습니다. 이 점수는 기록됩니다. · Marks are shown below; the score is saved.`
      : `시도 ${attempts} / ${MAX_ATTEMPTS}`));
    if (!reveal) {
      app.appendChild(el("p", null, `80% 이상이 되어야 통과입니다. 다시 풀어 보세요. 남은 기회 ${MAX_ATTEMPTS - attempts}번.`));
      if (nextOnly && nextOnly.length) {
        app.appendChild(el("p", "meta", `다음 시도는 틀린 ${nextOnly.length}문항만 풉니다. · Next try asks only those ${nextOnly.length} questions.`));
      } else {
        app.appendChild(el("p", "meta", "다음 시도는 처음부터 다시 풉니다. · Next try is the whole test again."));
      }
      if (mistakes) {
        /* Jay 2026-11-14: a failed try must show WHICH questions were wrong, and
           must not show the answers yet. Numbers only, so the next try is still
           a real try; answers and explanations come after the last attempt. */
        const wrongNow = res.filter((r) => !r.ok);
        /* Jay 2026-11-18: the numbers in this list are the book's numbers, so they
           read in book order: ① pass first, then the page letter, then the item. */
        const labelKey = (s) => {
          const m = String(s).match(/^\s*([\u2460-\u2465])?([A-H])?-(\d{1,3})([a-z])?/);
          if (!m) {
            const n = parseInt(s, 10);
            return [isNaN(n) ? 99 : 0, "", isNaN(n) ? 9999 : n, String(s)];
          }
          return [m[1] ? "\u2460\u2461\u2462\u2463\u2464\u2465".indexOf(m[1]) : -1,
                  m[2] || "", parseInt(m[3], 10), m[4] || ""];
        };
        const nums = wrongNow.map((r) => r.q.label || r.q.id || "").filter(Boolean)
          .sort((a, b) => {
            const ka = labelKey(a), kb = labelKey(b);
            for (let i = 0; i < 3; i += 1) {
              if (ka[i] !== kb[i]) return ka[i] < kb[i] ? -1 : 1;
            }
            return String(ka[3]).localeCompare(String(kb[3]));
          });
        const line = el("p", "wrong-list");
        line.appendChild(el("b", null, "틀린 문제 번호: "));
        line.appendChild(document.createTextNode(nums.join(", ")));
        line.appendChild(el("br"));
        line.appendChild(el("span", "sub", "정답과 해설은 세 번의 시도가 끝난 뒤에 나옵니다."));
        app.appendChild(line);
        const box = el("div", "remind");
        box.innerHTML = REMIND;
        app.appendChild(box);
      }
      const retry = el("button", "btn btn-primary",
        practice ? "처음부터 다시 연습하기 · Practise again"
          : (nextOnly && nextOnly.length) ? `틀린 ${nextOnly.length}문항만 다시 풀기 · Retry those only` : "다시 풀기 Retry");
      retry.id = "r";
      retry.onclick = () => start(nextOnly && nextOnly.length ? nextOnly : null);
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
      sessionStorage.removeItem(key + ":only");
      if (practice) {
        /* a drill is never finished: offer the same lines again, right here */
        const once = el("button", "btn btn-primary", "같은 대화 다시 연습하기 · Practise these again");
        once.id = "again";
        once.onclick = () => start(null);
        app.appendChild(once);
      }
      const again = el("p", "crumb");
      const back = qs.get("b") && qs.get("u") ? `unit.html?b=${qs.get("b")}&u=${qs.get("u")}` : "index.html";
      again.innerHTML = `<a href="${back}">← 목록으로</a>`;
      app.appendChild(again);
    }
    scrollTo(0, 0);
  };
  const pending = readRetry();
  start(pending && pending.length ? pending : null);
}

({ index, book, unit, play })[document.body.dataset.page]().catch((e) => { app.textContent = "Error: " + e.message; });
