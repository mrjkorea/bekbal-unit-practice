#!/usr/bin/env node
/**
 * Hold items a student cannot answer from the screen.
 *
 * Input: the audit JSON written by the audit script (scripts/audit_packs.py --json).
 * For every item whose book is not j1-neung (that unit is rebuilt by build-j1-neung-u78.js),
 * set deferred:true and keep the reason, so the player skips it and the note stays in the data.
 * Ids are never changed. Re-running is safe.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/hold-unreadable-items.js audit.json");
  process.exit(2);
}
const rows = JSON.parse(fs.readFileSync(file, "utf8"));
const byFile = new Map();
for (const r of rows) {
  if (String(r.book || "").indexOf("중1 능률") === 0 && /Lesson 0[78]/.test(r.unit || "")) continue; // rebuilt by the L07/L08 build
  if (!byFile.has(r.path)) byFile.set(r.path, []);
  byFile.get(r.path).push(r);
}
let held = 0;
for (const [rel, items] of byFile) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) {
    console.error("missing file", rel);
    continue;
  }
  const doc = JSON.parse(fs.readFileSync(p, "utf8"));
  const ids = new Map(items.map((it) => [String(it.item), it]));
  doc.questions = (doc.questions || []).map((q) => {
    const hit = ids.get(String(q.id));
    if (!hit) return q;
    held += 1;
    return Object.assign({}, q, {
      deferred: true,
      deferredReason: "교재 " + (doc.sourcePages ? "p." + String(doc.sourcePages).replace(/^p\.?/, "") : "확인 필요") + " 원문 확인 전 보류 — " + hit.why,
    });
  });
  fs.writeFileSync(p, JSON.stringify(doc, null, 2) + "\n");
}
console.log("held", held, "items in", byFile.size, "files");
