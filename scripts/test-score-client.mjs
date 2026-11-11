/* Shape test for assets/vendor/mrj-scores.js: does it refuse a post with no
   student, and does it also record the same item in StudentScoreIndex? */
import fs from "node:fs";
import vm from "node:vm";

const code = fs.readFileSync("assets/vendor/mrj-scores.js", "utf8");

function makeEnv(student, sent) {
  const noted = [];
  const posts = [];
  const sandbox = {
    console,
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: (url, o) => {
      posts.push(JSON.parse(o.body));
      sent.push(JSON.parse(o.body));
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ status: "ok" }) });
    },
    MRJ_AUTH: {
      student: () => student,
      noteScore: (f) => noted.push(f),
    },
    Promise, Date, JSON, Math, String, Number, Object, Array,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return { api: sandbox.MRJ_SCORES, noted, posts };
}

let fails = 0;
function check(name, cond, extra) {
  if (cond) console.log("PASS " + name);
  else { fails++; console.log("FAIL " + name + (extra ? " :: " + extra : "")); }
}

// 1. no student -> refused, nothing written
{
  const sent = [];
  const env = makeEnv("", sent);
  const r = await env.api.post({ program: "bekbal-reading", itemId: "zz_test_note_1", scoreValue: 4, scoreMax: 5 });
  check("no student is refused", r.status === "skipped" && r.error === "no student", JSON.stringify(r));
  check("no student writes no book row", sent.length === 0, "sent " + sent.length);
  check("no student writes no index row", env.noted.length === 0, "noted " + env.noted.length);
}

// 2. signed in -> one book row + one index row, same itemId
{
  const sent = [];
  const env = makeEnv("Zz Test", sent);
  const r = await env.api.post({ program: "bekbal-reading", itemId: "zz_test_note_2", scoreValue: 4, scoreMax: 5, itemType: "reading_focus" });
  check("post is accepted", r.status === "ok", JSON.stringify(r));
  check("one book row", sent.length === 1, "sent " + sent.length);
  check("book keeps the id_key, not unknown", sent[0].student_email === "zz_test", sent[0].student_email);
  check("one index row", env.noted.length === 1, "noted " + env.noted.length);
  check("same itemId in both stores", env.noted[0].itemId === sent[0].events[0].item_id, env.noted[0].itemId + " vs " + sent[0].events[0].item_id);
  check("same program in both stores", env.noted[0].program === sent[0].events[0].curriculum_program, env.noted[0].program);
  check("same score in both stores", env.noted[0].scoreValue === sent[0].events[0].score_value && env.noted[0].scoreMax === sent[0].events[0].score_max, env.noted[0].scoreValue + "/" + env.noted[0].scoreMax);
  check("percent passed through", env.noted[0].scorePct === 80, String(env.noted[0].scorePct));
}

console.log(fails === 0 ? "\nALL PASS" : "\n" + fails + " FAILED");
process.exit(fails === 0 ? 0 : 1);
