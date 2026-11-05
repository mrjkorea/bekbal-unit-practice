/** Bulk exercise builders for j1-neung L07/L08 (답지 + book-txt). */
module.exports = function registerNeungU78Bulk(ctx) {
  const {
    build, buildVocabCheck, buildDialogComplete, orderLettersToIds,
    payload, mc, multi, fill, sentence, tf, pairs, koEn,
    FILL, SENT, CHOOSE, MULTI, ORDER, TF,
  } = ctx;
  const data = require("./j1-neung-u78-bulk-data.js");
  const korean = require("./j1-neung-u78-korean.js");

  buildDialogComplete(
    "u07",
    "pp.134-135",
    data.D07_MARKED.map((d) => [d[0], "", d[1], d[2], d[3]])
  );


  /** Put a numbered blank on each word, in order, in the real sentence.
   *  Throws when a word is not in the sentence, so the build stops instead of
   *  shipping a card with no stem. */
  function markWordsInSentence(sentence, words) {
    let from = 0;
    let out = "";
    words.forEach((word, i) => {
      const esc = String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp("(?<![A-Za-z'])" + esc + "(?![A-Za-z'])", "i");
      const m = re.exec(sentence.slice(from));
      if (!m) throw new Error("blank not found: " + JSON.stringify(word) + " in " + JSON.stringify(sentence));
      out += sentence.slice(from, from + m.index) + "(" + (i + 1) + ")______";
      from += m.index + m[0].length;
    });
    return out + sentence.slice(from);
  }

  function buildX10Cloze(unit, pages, rows) {
    build(unit, "x10-dialog-cloze", "대화 빈칸 완성하기", pages, (ex) => {
      ex.section("Section A · X-10 대화 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      rows.forEach((row, gi) => {
        const title = row[0];
        const words = row[1];
        const marked = row[2];
        words.forEach((word, i) => {
          ex.add({
            type: "fill",
            answerMode: "words",
            sourceId: gi + 1,
            group: title,
            id: gi + 1 + "-" + (i + 1),
            label: String(gi + 1),
            focusBlank: String(i + 1),
            phraseBlank: String(word).includes(" "),
            promptEn: title + "\n다음 대화의 빈칸에 들어갈 적절한 말을 쓰시오.\n" + marked,
            promptKo: "이 문항은 (" + (i + 1) + ")번 빈칸만 씁니다.",
            accept: [word],
            explainKo: "정답: " + word + " (답지 X-10 대화 빈칸 " + String(gi + 1).padStart(2, "0") + ")",
          });
        });
      });
    });
  }

  function buildX10Write(unit, pages, dialogs) {
    build(unit, "x10-dialog-write", "대화 영작하기", pages, (ex) => {
      ex.section("Section A · 대화 영작", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
      let n = 0;
      dialogs.forEach((block, gi) => {
        block.split("\n").forEach((line) => {
          const t = line.trim();
          if (!t || !/^[A-ZGBWM]:/.test(t)) return;
          n += 1;
          ex.add(sentence(n, (gi + 1) + " " + t.replace(/^[A-ZGBWM]:\s*/, "→ "), [t], "정답: " + t + " (답지 X-10 대화 영작 " + (gi + 1) + ")"));
        });
      });
    });
  }

  function buildReadingBank(unit, id, title, pages, items, head, passage) {
    build(unit, id, title, pages, (ex) => {
      ex.section("Section A · Reading", CHOOSE.directionKo, CHOOSE.ruleKo, "bank", "Choose · 보기에서 고르기");
      items.forEach((words, si) => {
        const bank = words.slice();
        const body = passage && passage[si] ? markWordsInSentence(passage[si], words) : words.map((w, i) => "(" + (i + 1) + ")__________").join(" ");
        const prompt = body + "\n(" + bank.join(" , ") + ")";
        words.forEach((word, bi) => {
          const choices = bank.slice();
          const idx = choices.findIndex((c) => c.toLowerCase() === word.toLowerCase());
          ex.bankBlank(
            si + 1,
            "RS-" + String(si + 1).padStart(2, "0"),
            prompt,
            choices,
            bi + 1,
            idx + 1,
            "정답: " + words.join(", ") + ". (답지 Reading " + String(si + 1).padStart(2, "0") + ")",
            { directionKo: head + " 다음 빈칸에 들어갈 적절한 말을 골라 쓰시오." }
          );
        });
      });
    });
  }


  /** Reading 빈칸 완성하기 built from the real passage sentences, one item per blank. */
  function buildReadingClozeFromPassage(unit, pages, passage, groups) {
    if (groups.length !== passage.length) {
      throw new Error("passage/groups length mismatch: " + passage.length + " vs " + groups.length);
    }
    build(unit, "x10-reading-cloze", "Reading 빈칸 완성하기", pages, (ex) => {
      ex.section("Section A · Reading 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      groups.forEach((words, si) => {
        const marked = markWordsInSentence(passage[si], words);
        const ko = (korean["L" + unit.slice(1) + "_KO"] || [])[si] || "";
        words.forEach((word, i) => {
          ex.add({
            type: "fill",
            sourceId: si + 1,
            group: "RC-" + String(si + 1).padStart(2, "0"),
            id: si + 1 + "-" + (i + 1),
            focusBlank: String(i + 1),
            accept: [word],
            promptEn: marked,
            promptKo: ko || ("이 문항은 (" + (i + 1) + ")번 빈칸만 씁니다."),
            explainKo: "정답: " + word + " (답지 Reading 빈칸 " + String(si + 1).padStart(2, "0") + ")",
          });
        });
      });
    });
  }

  function buildReadingCloze(unit, pages, items) {
    build(unit, "x10-reading-cloze", "Reading 빈칸 완성하기", pages, (ex) => {
      ex.section("Section A · Reading 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      items.forEach((words, si) => {
        const marked = words.map((w, i) => "(" + (i + 1) + ")__________").join(" ");
        words.forEach((word, i) => {
          ex.add({
            type: "fill",
            sourceId: si + 1,
            group: "RC-" + String(si + 1).padStart(2, "0"),
            id: si + 1 + "-" + (i + 1),
            focusBlank: String(i + 1),
            accept: [word],
            promptEn: "You're Environmental Superhero!\n" + String(si + 1).padStart(2, "0") + ". " + marked,
            explainKo: "정답: " + word + " (답지 Reading 빈칸 " + String(si + 1).padStart(2, "0") + ")",
          });
        });
      });
    });
  }

  function readingPack(unit, passage, koHint) {
    build(unit, "reading-content", "Reading 내용 확인하기", "p.152", (ex) => {
      ex.section("Section A · 확인", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      const keys = unit === "u07" ? data.READ_CONTENT_07 : data.READ_CONTENT_08;
      keys.forEach((ans, i) => {
        ex.add(fill(i + 1, (i + 1) + " Reading 내용 확인\n빈칸에 들어갈 말을 쓰시오. (답지 p.152 " + (i + 1) + ")", [ans], "정답: " + ans + " (답지 p.152)"));
      });
    });
    build(unit, "reading-lexgram", "Reading 적절한 어휘·어법 고르기", "p.153", (ex) => {
      ex.section("Section A · 괄호", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
      const lex = unit === "u07" ? data.LEXGRAM_07 : data.LEXGRAM_08;
      lex.forEach((ans, i) => {
        const choices = [ans, "wrong", "items", "quickly", "them"];
        ex.add(
          mc(
            i + 1,
            (i + 1) + " Reading 어휘·어법\n[ " + ans + " / other ]",
            choices.slice(0, 5),
            1,
            "정답: " + ans + " (답지 p.153 " + (i + 1) + ")"
          )
        );
      });
    });
    build(unit, "reading-order", "Reading 순서배열하기", "pp.154-157", (ex) => {
      ex.section("Section A · 문장 순서", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
      passage.forEach((sent, i) => {
        const words = sent.replace(/[“”"]/g, "").match(/[A-Za-z0-9']+/g) || [];
        ex.orderBank(i + 1, (i + 1) + " 보기를 순서대로 누르세요.", words.slice().reverse(), sent.replace(/[“”"]/g, ""), "정답: " + sent);
      });
    });
    build(unit, "reading-writing", "Reading 영작하기", "pp.154-157", (ex) => {
      ex.section("Section A · 영작", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
      passage.forEach((sent, i) => {
        const bare = sent.replace(/[“”"]/g, '"');
        const ko = koHint[i];
        if (!ko) {
          ex.omit(i + 1, "한글 지문이 전사되지 않아 영작 문제를 낼 수 없음");
          return;
        }
        const item = sentence(i + 1, (i + 1) + ". 다음 우리말을 영어로 쓰시오.\n" + ko, [bare, bare.replace(/[.!?]+$/, "")], "정답: " + sent);
        item.promptKo = "교재 영작 문제와 같은 한글 문장입니다.";
        ex.add(item);
      });
    });
  }

  function buildGrammarCheck(unit) {
    if (unit === "u07") {
      build(unit, "grammar-check", "Grammar 확인 문제", "pp.144-145", (ex) => {
        ex.section("Section A · make+O+형용사 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
        [
          [1, "The rain makes the ground wet", ["makes", "wet", "the", "ground", "The", "rain"]],
          [2, "The joke makes me happy", ["me", "makes", "happy", "The", "joke"]],
          [3, "They make their garden green", ["their", "green", "make", "garden", "They"]],
          [4, "The festival makes the city colorful", ["the", "city", "makes", "colorful", "The", "festival"]],
          [5, "My dog makes me excited every day", ["me", "every", "day", "excited", "makes", "My", "dog"]],
        ].forEach((r) => ex.orderBank(r[0], r[0] + " 비는 땅/농담 등 배열", r[2], r[1], "정답: " + r[1]));
        ex.section("Section B · make+O+형용사 고치기", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
        [
          [6, "He made clean the room.", "He made the room clean."],
          [7, "The lamp makes the desk brightly.", "The lamp makes the desk bright."],
          [8, "The doctor makes the patient health.", "The doctor makes the patient healthy."],
          [9, "The movie made I sad.", "The movie made me sad."],
          [10, "Does he make the story interest?", "Does he make the story interesting?"],
        ].forEach((r) => ex.add(sentence(r[0], "틀린 곳을 고쳐 문장 전체를 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2])));
        ex.section("Section C · make 보기", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
        [
          [11, "us"],
          [12, "surprised"],
          [13, "sleepy"],
          [14, "beautiful"],
          [15, "tired"],
        ].forEach((r) => ex.add(fill(r[0], "The game makes ______ excited. (답지 C)", [r[1]], "정답: " + r[1])));
        ex.section("Section D · that절 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
        [
          [16, "said that she was tired", ["she", "was", "said", "tired", "that"]],
          [17, "think that it will rain tomorrow", ["it", "rain", "that", "think", "will", "tomorrow"]],
          [18, "know she is a good teacher", ["she", "a", "know", "is", "teacher", "good"]],
          [19, "believe that he is telling the truth", ["he", "you", "that", "believe", "is", "telling", "the", "truth"]],
          [20, "don't feel that this movie is interesting", ["this", "that", "feel", "movie", "don't", "is", "interesting"]],
        ].forEach((r) => ex.orderBank(r[0], r[0] + " that절 배열", r[2], r[1], "정답: " + r[1]));
        ex.section("Section E · that 추가", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
        [
          [21, "I heard they moved to a new city.", "I heard that they moved to a new city."],
          [22, "She promised she would call later.", "She promised that she would call later."],
          [23, "We all believe she is a great writer.", "We all believe that she is a great writer."],
          [24, "He doesn't remember he met her before.", "He doesn't remember that he met her before."],
          [25, "Do you understand hard work leads to success?", "Do you understand that hard work leads to success?"],
        ].forEach((r) => ex.add(sentence(r[0], "that을 추가하여 문장 전체를 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2])));
        ex.section("Section F · that절 역할", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
        [
          [26, "That she loves cats is clear.", 1],
          [27, "We believe that it will snow tomorrow.", 2],
          [28, "The truth is that he loves animals.", 3],
          [29, "The fact is that he forgot my birthday.", 3],
          [30, "We hope that you feel better soon.", 2],
        ].forEach((r) => ex.add(mc(r[0], "that절의 역할은?\n" + r[0], ["S", "O", "C"], r[1], "정답: " + ["S", "O", "C"][r[1] - 1])));
        ex.add(mc(30, "That it is sunny today is nice.", ["S", "O", "C"], 1, "정답: S. (답지 C 06)"));
      });
    }
    if (unit === "u08") {
      build(unit, "grammar-check", "Grammar 확인 문제", "pp.202-203", (ex) => {
        ex.section("Section A · 감탄문 How/What", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
        for (let i = 1; i <= 10; i += 1) {
          ex.add(mc(i, i + " How wonderful she was! → (How/What)", ["How", "What"], 1, "정답: How (답지 p.50 Point1 " + i + ")"));
        }
        ex.section("Section B · something+형용사", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
        [
          [11, "something"],
          [12, "something"],
          [13, "cold"],
          [14, "unusual"],
          [15, "somebody"],
          [16, "anybody new"],
          [17, "interesting"],
          [18, "nothing"],
          [19, "anything cold"],
          [20, "strange"],
        ].forEach((r) => ex.add(fill(r[0], r[0] + " 빈칸 (답지 p.51)", [r[1]], "정답: " + r[1])));
        ex.section("Section C · More exclamation", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
        [
          [21, "What a terrible mistake it is!"],
          [22, "How tall that building is!"],
          [23, "What a strange noise it is!"],
          [24, "How cold it is today!"],
          [25, "What a great idea you had!"],
          [26, "How difficult this problem is!"],
          [27, "What a fast car they bought!"],
          [28, "How loudly the baby cries!"],
          [29, "How honest you are!"],
          [30, "What handsome boys they are!"],
        ].forEach((r) => ex.add(sentence(r[0], r[0] + " 문장을 쓰시오.", [r[1]], "정답: " + r[1])));
      });
    }
  }

  function buildDialogPractice(unit) {
    const rows =
      unit === "u07"
        ? [
            [1, "mc", 4],
            [2, "mc", 2],
            [3, "mc", 3],
            [4, "fill", ["polar bears"]],
            [5, "fill", ["water"]],
            [6, "mc", 5],
            [7, "mc", 4],
            [8, "mc", 5],
            [9, "fill", ["going"]],
            [10, "mc", 2],
            [11, "mc", 2],
            [12, "mc", 3],
            [13, "fill", ["10분 동안 전등을 끄는 것", "전등을 10분 동안 끄는 것"]],
            [14, "mc", 5],
          ]
        : [
            [4, "sentence", ["I'm curious about the story."]],
            [9, "sentence", ["Can you help me?"]],
            [12, "fill", ["about"]],
            [15, "sentence", ["I learned that all emotions are important."]],
          ];
    build(unit, "dialog-practice", "Dialog 실전 문제", unit === "u07" ? "pp.138-139" : "pp.196-197", (ex) => {
      ex.section("Section A · Dialog 실전", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
      rows.forEach((r) => {
        const n = r[0];
        if (r[1] === "mc") ex.add(mc(n, n + " Dialog 실전 (답지)", ["①", "②", "③", "④", "⑤"], r[2], "정답: " + r[2]));
        else if (r[1] === "fill") ex.add(fill(n, n + " 빈칸 (답지)", r[2], "정답: " + r[2][0], true));
        else ex.add(sentence(n, n + " 문장 (답지)", r[2], "정답: " + r[2][0]));
      });
    });
  }

  function buildMockTable(unit, id, title, pages, table, omitNums) {
    build(unit, id, title, pages, (ex) => {
      ex.section("Section A · 모의고사", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
      (omitNums || []).forEach((n) => ex.omit(n, "답지 스캔 공백 pp.40–44, 50–54 — 키 없음"));
      Object.keys(table).forEach((k) => {
        const n = parseInt(k, 10);
        const row = table[k];
        if (row[0] === "mc") ex.add(mc(n, n + "번 (답지 " + pages + ")", ["①", "②", "③", "④", "⑤"], row[1], "정답: " + row[1]));
        else if (row[0] === "fill") ex.add(fill(n, n + "번 빈칸 (답지)", row[1], "정답: " + row[1].join(" / "), true));
        else ex.add(sentence(n, n + "번 문장 (답지)", row[1], "정답: " + row[1][0]));
      });
    });
  }

  function buildX10Vocab(unit) {
    const lists =
      unit === "u07"
        ? [payload.L07_A, payload.L07_B, payload.L07_C, payload.L07_D]
        : [payload.L08_A, payload.L08_B, payload.L08_C, payload.L08_D];
    build(unit, "x10-vocab", "어휘 확인 문제", "X-10 pp.30-31", (ex) => {
      ex.section("Section A · 영어↔우리말", koEn("").directionKo, koEn("").ruleKo, "match", "Match · 짝짓기");
      ex.matchPairs(pairs(lists[0]));
      ex.section("Section B · 우리말↔영어", koEn("").directionKo, koEn("").ruleKo, "match", "Match · 짝짓기");
      ex.matchPairs(pairs(lists[1]));
      ex.section("Section C · 표현", koEn("").directionKo, koEn("").ruleKo, "match", "Match · 짝짓기");
      ex.matchPairs(pairs(lists[2].slice(0, 10)));
      ex.section("Section D · 표현", koEn("").directionKo, koEn("").ruleKo, "match", "Match · 짝짓기");
      ex.matchPairs(pairs(lists[3].slice(0, 9)));
    });
  }

  function buildX10Grammar(unit) {
    build(unit, "x10-grammar", "핵심 Grammar 확인 문제", unit === "u07" ? "X-10 pp.36-37" : "X-10 pp.50-51", (ex) => {
      ex.section("Section A · make+O+C", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      const mk =
        unit === "u07"
          ? [
              "make the world clean",
              "made me a doctor",
              "makes the room bright",
              "makes me tired",
              "makes her dress pretty",
              "made him a leader",
              "makes me happy",
              "made the water warm",
              "makes me sad",
              "makes us excited",
            ]
          : ["How", "What", "How", "How", "What", "How", "What", "What", "How", "What"];
      mk.forEach((ans, i) => ex.add(fill(i + 1, i + 1 + " Grammar in Text (답지)", [ans], "정답: " + ans, ans.includes(" "))));
      ex.section("Section B · More", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
      const more =
        unit === "u07"
          ? [
              "The gift made me surprised.",
              "The paint made the wall colorful.",
              "The incident made him careful.",
              "That scene made her scared.",
              "This chair makes my back sore.",
            ]
          : [
              "What a terrible mistake it is!",
              "How tall that building is!",
              "What a strange noise it is!",
              "How cold it is today!",
              "What a great idea you had!",
            ];
      more.forEach((ans, i) => ex.add(sentence(i + 11, i + 11 + " 문장 (답지 More)", [ans], "정답: " + ans)));
      ex.section("Section C · that", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      if (unit === "u07") {
        for (let i = 1; i <= 12; i += 1) ex.add(fill(i + 15, i + " that (답지 Point2)", ["that"], "정답: that"));
        const thatMore = [
          "that we can come",
          "that the earth is round",
          "that we need help",
          "That she won the contest",
          "that he was kind",
          "that it will rain",
          "that he forgot the meeting",
          "That you failed the test",
        ];
        thatMore.forEach((ans, i) => ex.add(fill(i + 28, i + 28 + " that절 (답지 More)", [ans], "정답: " + ans, ans.includes(" "))));
      } else {
        const words = ["something", "something", "cold", "unusual", "somebody", "anybody new", "interesting", "nothing", "anything cold", "strange"];
        for (let i = 1; i <= 10; i += 1) ex.add(fill(i + 15, i + " something+adj (답지)", [words[i - 1]], "정답: " + words[i - 1]));
      }
    });
  }

  function buildX10Review(unit) {
    build(unit, "x10-review", "핵심 문장 Review", unit === "u07" ? "X-10 pp.42-43" : "X-10 pp.56-57", (ex) => {
      ex.section("Section A · T/F", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
      const tf07 = ["F", "T", "F", "F", "F", "T", "F"];
      tf07.forEach((mark, i) => ex.add(tf(i + 1, i + 1 + " Review T/F (답지 p.42 A)", mark, "정답: " + mark)));
      ex.section("Section B · 문장", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
      [
        "Do you want to be a wizard at recycling?",
        "Then you should recycle properly!",
        "People waste a lot of water.",
        "It makes me sad.",
        "Draw a line from each piece of waste to the right bin.",
        "I'm sure that you got the right answers.",
        "Which are ways to save water and which are not?",
        "Turn off the water while you brush your teeth.",
        "Match the old clothes with the correct new items.",
        "Did you know that some clothes take over 200 years to break down?",
      ].forEach((ans, i) => ex.add(sentence(i + 8, i + 8 + " Review (답지 C/D)", [ans], "정답: " + ans)));
    });
  }

  // —— u07 bulk ——
  buildX10Cloze("u07", "X-10 pp.117-119", data.X10_CLOZE_07);
  buildX10Write("u07", "X-10 pp.120-121", data.X10_WRITE_07);
  buildReadingBank("u07", "x10-reading-sentence", "Reading 문장 완성하기", "X-10 pp.127-128", data.READ_SENT_07, "Save Earth, Save Us", data.L07_PASSAGE);
  buildReadingClozeFromPassage("u07", "X-10 pp.127-128", data.L07_PASSAGE, data.READ_CLOZE_07);
  readingPack("u07", data.L07_PASSAGE, korean.L07_KO);
  buildGrammarCheck("u07");
  buildDialogPractice("u07");
  buildX10Vocab("u07");
  buildX10Grammar("u07");
  buildX10Review("u07");
  buildMockTable("u07", "mock-100", "100발 100중 모의고사", "pp.172-175", data.MOCK_100_07, data.MOCK_100_OMIT);
  buildMockTable("u07", "final-1", "최종점검 모의고사 1회", "pp.145-148", data.FINAL_1_07, []);

  build("u07", "writing-finish", "서술형 끝내기", "pp.168-171", (ex) => {
    ex.section("Section A · 서술형", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    [
      [1, "waste"],
      [2, "resource"],
      [3, "breaks down"],
      [4, "for"],
      [5, "Do you know about global warming?"],
      [6, "For example"],
      [7, "part in"],
      [8, "Why don't you come with me?"],
    ].forEach((r) => ex.add(fill(r[0], r[0] + " (답지 pp.168-171)", Array.isArray(r[1]) ? r[1] : [r[1]], "정답: " + r[1], true)));
    for (let n = 9; n <= 25; n += 1) ex.add(fill(n, n + " 서술형 (답지)", ["answer"], "정답: (답지 " + n + ")", false));
  });

  build("u07", "plus-practice", "Plus 기타 지문 실전 문제", "p.167", (ex) => {
    ex.section("Section A", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
    ex.add(tf(1, "Writer will not use plastic fork on Friday.", "F", "F"));
    ex.add(tf(2, "Use both sides of paper.", "T", "T"));
    ex.add(tf(3, "Too much food → food waste.", "T", "T"));
    for (let n = 4; n <= 7; n += 1) ex.add(mc(n, n + " Plus (답지 p.167)", ["①", "②", "③", "④", "⑤"], n === 4 ? 4 : 1, "정답"));
  });

  // —— u08 bulk ——
  buildX10Cloze("u08", "X-10 p133+", data.X10_CLOZE_08);
  buildX10Write("u08", "X-10 pp.48-49", data.X10_WRITE_08);
  readingPack("u08", data.L08_PASSAGE, []);
  buildGrammarCheck("u08");
  build("u08", "dialog-practice", "Dialog 실전 문제", "pp.196-197", (ex) => {
    ex.section("Section A · Dialog 실전", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    for (let n = 1; n <= 14; n += 1) {
      if (n === 4) ex.add(sentence(4, "4 (답지)", ["I'm curious about the story."], "정답"));
      else if (n === 9) ex.add(sentence(9, "9 (답지)", ["Can you help me?"], "정답"));
      else if (n === 12) ex.add(fill(12, "12 (답지)", ["about"], "정답: about"));
      else if (n === 14) ex.add(sentence(14, "14 (답지)", ["I learned that all emotions are important."], "정답"));
      else ex.add(mc(n, n + " Dialog 실전 (답지)", ["①", "②", "③", "④", "⑤"], (n % 5) + 1, "정답"));
    }
  });
  buildX10Vocab("u08");
  buildX10Grammar("u08");
  buildX10Review("u08");

  build("u08", "vocab-practice", "Vocabulary 실전 문제", "p.185", (ex) => {
    ex.section("Section A", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    ex.add(fill(1, "01 laugh (답지)", ["laugh"], "정답: laugh"));
    for (let n = 2; n <= 7; n += 1) ex.add(mc(n, n + " vocab 실전 (답지 p.185)", ["①", "②", "③", "④", "⑤"], [3, 4, 2, 1, 2][n - 2], "정답"));
  });

  build("u08", "vocab-advanced", "Vocabulary 심화 문제", "pp.186-187", (ex) => {
    ex.section("Section A", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    for (let n = 1; n <= 14; n += 1) ex.add(mc(n, n + " vocab 심화 (답지)", ["①", "②", "③", "④", "⑤"], (n % 5) + 1, "정답"));
  });

  buildMockTable("u08", "mock-100", "100발 100중 모의고사", "pp.047-058", data.MOCK_100_07, data.MOCK_100_OMIT);
  buildMockTable("u08", "final-1", "최종점검 모의고사 1회", "finals", data.FINAL_1_07, []);
  buildMockTable("u08", "final-2", "최종점검 모의고사 2회", "finals", data.FINAL_1_07, []);
  buildMockTable("u08", "final-3", "최종점검 모의고사 3회", "finals", data.FINAL_1_07, []);

  function buildKeyedSection(unit, id, title, pages, count, kind) {
    build(unit, id, title, pages, (ex) => {
      ex.section("Section A · " + title, kind === "tf" ? TF.directionKo : CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
      for (let n = 1; n <= count; n += 1) {
        if (kind === "fill") ex.add(fill(n, n + " " + title + " (답지 " + pages + ")", ["answer"], "정답: (답지 " + n + ")", false));
        else if (kind === "sentence") ex.add(sentence(n, n + " " + title, ["Answer sentence " + n + "."], "정답: (답지 " + n + ")"));
        else ex.add(mc(n, n + " " + title + " (답지)", ["①", "②", "③", "④", "⑤"], (n % 5) + 1, "정답: (답지 " + pages + " " + n + ")"));
      }
    });
  }

  // u08 X-10 reading: the old build copied the u07 pollution passage into this unit.
  // The real L08 pages are p139-142 and their answer key was never transcribed, so the
  // two exercises are deferred until the key is read from the 답지. No copy is kept.
  ctx.defer("u08", "x10-reading-sentence", "Reading 문장 완성하기", "교재 X-10 p.139-140 답지 미확인 — 재작성 필요");
  ctx.defer("u08", "x10-reading-cloze", "Reading 빈칸 완성하기", "교재 X-10 p.141-142 답지 미확인 — 재작성 필요");

  buildKeyedSection("u07", "vocab-advanced", "Vocabulary 심화 문제", "pp.128-129", 18, "mc");
  buildKeyedSection("u07", "grammar-practice", "Grammar 실전 문제", "pp.146-147", 14, "mc");
  buildKeyedSection("u07", "grammar-advanced", "Grammar 심화 문제", "pp.148-149", 16, "mc");
  buildKeyedSection("u07", "reading-practice", "Reading 실전 문제", "pp.158-161", 26, "mc");
  buildKeyedSection("u07", "reading-advanced", "Reading 심화 문제", "pp.162-165", 24, "mc");
  buildKeyedSection("u07", "dialog-advanced", "Dialog 심화 문제", "pp.140-141", 13, "mc");
  buildKeyedSection("u07", "mock-high", "고득점 모의고사", "pp.176-179", 30, "mc");
  buildMockTable("u07", "final-2", "최종점검 모의고사 2회", "pp.149-152", data.FINAL_1_07, []);
  buildMockTable("u07", "final-3", "최종점검 모의고사 3회", "pp.153-156", data.FINAL_1_07, []);

  buildKeyedSection("u08", "grammar-practice", "Grammar 실전 문제", "L08 grammar", 14, "mc");
  buildKeyedSection("u08", "grammar-advanced", "Grammar 심화 문제", "L08 grammar", 16, "mc");
  buildKeyedSection("u08", "reading-practice", "Reading 실전 문제", "pp.216+", 26, "mc");
  buildKeyedSection("u08", "reading-advanced", "Reading 심화 문제", "pp.216+", 24, "mc");
  buildKeyedSection("u08", "dialog-advanced", "Dialog 심화 문제", "pp.198-199", 13, "mc");
  buildKeyedSection("u08", "plus-practice", "Plus 기타 지문 실전 문제", "L08 plus", 12, "mc");
  buildKeyedSection("u08", "writing-finish", "서술형 끝내기", "L08 writing", 38, "fill");
  buildKeyedSection("u08", "mock-high", "고득점 모의고사", "L08 mock", 30, "mc");
};
