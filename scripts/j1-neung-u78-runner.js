/** Exercise builders for j1-neung u07/u08 — invoked from build-j1-neung-u78.js */
module.exports = function run(ctx) {
  const {
    build, buildVocabCheck, buildDialogComplete, orderLettersToIds,
    out, payload, mc, multi, fill, sentence, tf,
    FILL, SENT, CHOOSE, ORDER, TF,
  } = ctx;

  buildVocabCheck("u07", "p.126", payload.L07_A, payload.L07_B, payload.L07_C, payload.L07_D);
  buildVocabCheck("u08", "p.184", payload.L08_A, payload.L08_B, payload.L08_C, payload.L08_D);
  buildDialogComplete("u08", "pp.192-193", payload.D08_COMPLETE);

  build("u07", "dialog-detail", "Dialog 자세히 보기", "pp.132-133", (ex) => {
    ex.section("Section A · T/F", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
    [
      [1, "Polar bears are losing their homes because of global warming.", "T", "답지 Dialog 자세히 01 T"],
      [2, "The boy and girl are looking at a poster about saving water.", "T", "답지 02 T"],
      [3, "We need to save water to reduce plastic waste.", "F", "답지 03 F"],
    [4, "People turn off lights for ten minutes on Earth Day.", "F", "답지 04 F"],
    [5, "Speaker A and B will join the eco club together.", "T", "답지 05 T"],
    [6, "People can buy many items at a zero waste shop.", "T", "답지 06 T"],
    [7, "The class will take part in a zero waste week.", "T", "답지 07 T"],
    [8, "Planting trees at the end cleans the air.", "F", "답지 08 F"],
    ].forEach((r) => ex.add(tf(r[0], r[1], r[2], r[3])));
  });

  build("u08", "dialog-detail", "Dialog 자세히 보기", "pp.190-191", (ex) => {
    ex.section("Section A · T/F", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
    [
      [1, "The boy wants to return a book.", "F", "답지 01 F"],
      [2, "The girl is interested in the man.", "F", "답지 02 F"],
      [3, "The boy has read The Hobbit.", "F", "답지 03 F"],
      [4, "The girl is interested in marine life.", "T", "답지 04 T"],
      [5, "The girl is interested in space.", "F", "답지 05 F"],
      [6, "They talk about a fantasy novel.", "T", "답지 06 T"],
      [7, "Charlotte's Web is about friendship.", "T", "답지 07 T"],
      [8, "The boy doesn't like the movie.", "T", "답지 08 T"],
    ].forEach((r) => ex.add(tf(r[0], r[1], r[2], r[3])));
  });

  function buildDialogOrder(unit, pages, rows, letterChunks) {
    build(unit, "dialog-order", "Dialog 순서배열하기", pages, (ex) => {
      ex.section("Section A · 대화 순서", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
      rows.forEach((row, i) => {
        const n = row[0];
        const letters = row[1];
        const chunks = letterChunks[i].map((text, j) => ({ id: "s" + (j + 1), text }));
        const orderIds = orderLettersToIds(letters);
        ex.add({
          type: "order",
          answerMode: "order",
          sourceId: n,
          promptEn: n + " 다음 문장을 순서대로 누르시오.\n" + chunks.map((c) => c.text).join("\n"),
          orderChunks: chunks,
          orderIds,
          explainKo: "정답 순서: " + letters.join(" → ") + " (" + pages + ")",
        });
      });
    });
  }

  const L07_ORDER_CHUNKS = payload.D07_ORDER_CHUNKS || [];
  buildDialogOrder("u07", "pp.136-137", payload.D07_ORDER, L07_ORDER_CHUNKS);
  buildDialogOrder("u08", "pp.194-195", payload.D08_ORDER, payload.D08_ORDER_CHUNKS || []);

  function applyPack(unit, spec) {
    const { id, title, pages, sections } = spec;
    build(unit, id, title, pages, (ex) => {
      sections.forEach((sec) => {
        ex.section(sec.title, sec.directionKo || sec.dir, sec.ruleKo || sec.rule, sec.answerMode, sec.tag);
        (sec.items || []).forEach((it) => {
          if (it.omit) {
            ex.omit(it.omit, it.reason || "답지 공백 또는 OCR 미확정");
            return;
          }
          if (it.kind === "mc") ex.add(mc(it.n, it.prompt, it.choices, it.index, it.explain));
          else if (it.kind === "multi") ex.add(multi(it.n, it.prompt, it.choices, it.indexes, it.explain));
          else if (it.kind === "fill") ex.add(fill(it.n, it.prompt, it.accept, it.explain, it.phrase));
          else if (it.kind === "sentence") ex.add(sentence(it.n, it.prompt, it.accept, it.explain));
          else if (it.kind === "tf") ex.add(tf(it.n, it.prompt, it.mark, it.explain));
          else if (it.kind === "order") ex.orderBank(it.n, it.prompt, it.bank, it.sentence, it.explain);
          else if (it.kind === "split") ex.splitWords(it.n, it.prompt, it.words, it.cite, it.cite);
        });
      });
    });
  }

  ["u07", "u08"].forEach((unit) => {
    const pack = payload.EXERCISES[unit] || {};
    Object.keys(pack).forEach((id) => applyPack(unit, Object.assign({ id }, pack[id])));
  });

  require("./j1-neung-u78-bulk.js")(ctx);

  // Packs typed from the printed page win over the bulk builder (same ids).
  const pages = require("./j1-neung-u78-pages.js");
  ["u07", "u08"].forEach((unit) => {
    const pack = pages[unit] || {};
    Object.keys(pack).forEach((id) => applyPack(unit, Object.assign({ id }, pack[id])));
  });
};
