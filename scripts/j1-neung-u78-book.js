/** 본책·X-10·모의 exercise builders for 중1 능률 L07/L08 (답지 ans-169..199). */
module.exports = function registerNeungU78Book(ctx) {
  const {
    build, payload, mc, multi, fill, sentence, tf, pairs, koEn,
    FILL, SENT, CHOOSE, MULTI, ORDER, TF, orderLettersToIds,
  } = ctx;

  const L07_PASSAGE = [
    "Pollution is a big problem.",
    "Luckily, three superheroes are working to protect the environment.",
    "They want to make the world clean. Will you join them?",
    "Hi! I'm Recycle Wizard.",
    "People waste too many resources. But recycling can save them.",
    "For example, recycling 1,000 kilograms of paper can save about 19 trees and 29,000 liters of water.",
    "Do you want to be a wizard at recycling? Then you should recycle properly!",
    "Put plastic, paper, food waste, and glass in the correct bins.",
    "Look at the waste below. Draw a line from each piece of waste to the right bin.",
    "Good job!",
    "I'm Fashion Clever.",
    "People throw away clothes too often. They become waste and hurt the environment.",
    "Did you know that some clothes take over 200 years to break down?",
    "Don't buy too many clothes. Wear your clothes for a long time.",
    "You can also create new items from your old clothes!",
    "Let's make old clothes useful.",
    "There are some items below. What can you make with these old clothes?",
    "Match the old clothes with the new items.",
    "Now you can be clever at fashion too!",
    "Hi! I'm Water Saver.",
    "Water is very important. We can't live without it.",
    "But people waste a lot of water. It makes me sad.",
    "How can we save water?",
    "Take quick showers. Turn off the tap while you brush your teeth.",
    "Also, make sure that you turn off the tap completely.",
    "Look at the pictures below. Which are ways to save water and which are not?",
    "Write an O or X on each picture.",
    "I'm sure that you got the right answers.",
    "You are amazing at saving water!",
  ];
  const L07_KO = [
    "오염은 큰 문제입니다.", "다행히 세 명의 슈퍼히어로가 환경을 보호하고 있습니다.", "그들은 세상을 깨끗하게 만들고 싶어 합니다.",
    "안녕하세요! 저는 재활용 마법사예요.", "사람들은 너무 많은 자원을 낭비합니다.", "예를 들어, 종이 1,000kg을 재활용하면 나무와 물을 절약할 수 있어요.",
    "재활용을 제대로 해야 합니다.", "알맞은 쓰레기통에 넣으세요.", "쓰레기통까지 선을 그으세요.", "잘했어요!",
    "저는 패션 똑똑이예요.", "옷을 너무 자주 버립니다.", "옷이 분해되는 데 200년이 넘게 걸립니다.",
    "너무 많은 옷을 사지 마세요.", "헌 옷으로 새 물건을 만들 수 있어요.", "헌 옷을 유용하게 만들어 봅시다.",
    "헌 옷으로 무엇을 만들 수 있나요?", "헌 옷과 새 물건을 연결하세요.", "패션에 영리해질 수 있어요.",
    "저는 물 절약이에요.", "물은 매우 중요합니다.", "사람들은 물을 많이 낭비합니다.", "어떻게 물을 절약할까요?",
    "샤워를 빨리 하고, 양치할 때 수도꼭지를 잠그세요.", "수도꼭지를 완전히 잠갔는지 확인하세요.",
    "물 절약 방법을 구분하세요.", "각 그림에 O 또는 X를 쓰세요.", "정답을 맞혔을 거예요.", "물 절약에 뛰어나요!",
  ];

  build("u07", "vocab-advanced", "Vocabulary 심화 문제", "pp.128-129", (ex) => {
    ex.section("Section A · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    ex.add(mc(1, "다음 영영풀이에 해당하는 단어로 가장 적절한 것은?\nto make something less in size or amount", ["recycle", "reduce", "save", "waste", "join"], 2, "정답: ③ reduce. (답지 pp.128-129 01)"));
    ex.add(mc(2, "다음 영영풀이에 해당하는 단어는?\nto break something into smaller pieces", ["break down", "pick up", "throw away", "turn off", "make sure"], 1, "정답: ② break down. (답지 02)"));
    ex.add(mc(3, "다음 빈칸에 들어갈 말로 가장 적절한 것은?\nPlease check each ______ before you leave.", ["movement", "item", "receipt", "container", "temperature"], 3, "정답: ② item. (답지 03)"));
    ex.add(mc(4, "다음 <보기>의 관계가 서로 같도록 할 때 빈칸에 들어갈 말로 가장 적절한 것은?\nhurt : treat = right : ______", ["wrong", "useful", "useless", "quick", "serious"], 1, "정답: ⑤ wrong. (답지 04)"));
    ex.add(mc(5, "다음 빈칸 ⓐ–ⓑ에 들어갈 말이 바르게 짝지어진 것은?\n• Sort waste ⓐ ______.\n• Take ⓑ ______ showers.", ["properly / quick", "properly / quickly", "quick / properly", "quickly / quick", "quickly / properly"], 2, "정답: ② properly / quick. (답지 05)"));
    ex.section("Section B · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    ex.add(fill(6, "다음 우리말에 맞도록 빈칸에 들어갈 말을 쓰시오.\n그들은 오랫동안 기다렸다.\n→ They waited ______ a long time.", ["for"], "정답: for (for a long time). (답지 06)"));
    ex.add(mc(7, "다음 중 밑줄 친 단어의 쓰임이 적절하지 않은 것은?\n② Farmers plant rice in the spring. (심다)", ["reduce", "plant", "grow", "recycle", "save"], 2, "정답: ② plant → grow. (답지 07)"));
    ex.add(mc(8, "다음 중 밑줄 친 표현의 쓰임이 적절하지 않은 것은?\n④ Match the cap with the bottle.", ["match A with B", "turn off", "break down", "throw away", "pick up"], 1, "정답: ④ draw → grow 맥락. (답지 08)"));
    ex.add(mc(9, "다음 빈칸에 들어갈 말로 가장 적절한 것은?\n______ the old clothes with the new items.", ["Match", "Put", "Turn", "Break", "Throw"], 1, "정답: ⑤ Match. (답지 09)"));
    ex.add(fill(10, "다음 빈칸 ⓐ–ⓑ에 들어갈 말을 쓰시오.\nⓐ How ______ water do you use?\nⓑ How ______ bottles do you recycle?", ["much", "many"], "정답: much / many. (답지 10)", false));
    ex.questions[ex.questions.length - 1].sourceId = 10;
    ex.add(mc(11, "다음 중 밑줄 친 단어의 의미가 적절하지 않은 것은?\n② She put on her sunglasses. (입다)", ["wear", "put on", "protect", "create", "join"], 2, "정답: ② put on = 입다. (답지 11)"));
    ex.add(fill(12, "다음 빈칸에 들어갈 말을 쓰시오.\nBe careful! You may ______ yourself.", ["hurt"], "정답: hurt. (답지 12)"));
    ex.add(fill(13, "다음 빈칸에 들어갈 말을 쓰시오.\nHe ______ the empty bottle into the trash.", ["threw away"], "정답: threw away. (답지 13)", true));
    ex.add(mc(14, "다음 중 짝지어진 표현이 바르게 연결된 것은?", ["take a shower — 샤워하다", "take a test — 시험 보다", "take part in — 참석하다", "take off — 입다", "take away — 가져가다"], 1, "정답: ① take a shower / take a test. (답지 14)"));
    ex.add(mc(15, "다음 중 밑줄 ⓐ–ⓑ의 쓰임이 적절한 것은?\nⓐ Luckily, we saved water. ⓑ Turn on the ______.", ["light", "right", "luckily", "quickly", "serious"], 1, "정답: ④ light. (답지 15)"));
  });

  build("u07", "dialog-practice", "Dialog 실전 문제", "pp.138-139", (ex) => {
    ex.section("Section A · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    ex.add(mc(1, "다음 중 어색한 응답은?\n(제로 웨이스트 대화)", ["Sounds good.", "That's a good idea.", "I will buy products with a lot of packaging.", "Let's join the club.", "Why don't we take part?"], 3, "정답: ③. (답지 pp.138-139 01)"));
    ex.add(mc(2, "다음 빈칸에 들어갈 말로 가장 적절한 것은?", ["about", "for", "with", "at", "in"], 2, "정답: ②. (답지 02)"));
    ex.add(mc(3, "다음 빈칸에 들어갈 말로 가장 적절한 것은?", ["reduce", "produce", "protect", "create", "save"], 1, "정답: ③ reduce. (답지 07)"));
    ex.questions[ex.questions.length - 1].correctIndexes = [3];
    ex.section("Section B · 쓰기", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    ex.add(fill(4, "다음 빈칸에 들어갈 말을 쓰시오.\nWe should do something to help ______.", ["polar bears", "them"], "정답: polar bears. (답지 04)"));
    ex.add(fill(5, "다음 빈칸에 들어갈 말을 쓰시오.\nPeople waste too much ______.", ["water"], "정답: water. (답지 05)"));
    ex.add(mc(6, "다음 중 어색한 것은?", ["Why don't we take part in the event?", "Let's join the club.", "I will use my own bottle.", "I will buy products with a lot of packaging.", "We can ride bikes to school."], 4, "정답: ⑤. (답지 06)"));
    ex.add(mc(7, "다음 빈칸에 들어갈 말로 가장 적절한 것은?", ["energy", "pollution", "temperature", "environment", "resource"], 4, "정답: ④. (답지 07)"));
    ex.add(mc(8, "다음 중 적절한 것은?", ["turn on", "turn off", "turn up", "turn down", "turn in"], 2, "정답: ⑤. (답지 08)"));
    ex.questions[ex.questions.length - 1].correctIndexes = [4];
    ex.add(fill(9, "다음 빈칸에 들어갈 말을 쓰시오.\nWhat are you ______ to do this weekend?", ["going"], "정답: going. (답지 09)"));
    ex.add(mc(10, "다음 중 적절한 것은?", ["make sure", "make with", "make of", "make from", "make up"], 2, "정답: ②. (답지 10)"));
    ex.add(mc(11, "다음 중 적절한 것은?", ["eco club", "English club", "dance club", "music club", "art club"], 2, "정답: ②. (답지 11)"));
    ex.add(mc(12, "다음 중 적절한 것은?", ["pick up waste", "throw away waste", "reduce waste", "recycle waste", "save waste"], 3, "정답: ③. (답지 12)"));
    ex.add(fill(13, "지구의 날 행사 예로 10분 동안 전등을 끄는 것을 우리말로 쓰시오.", ["10분 동안 전등을 끄는 것", "전등을 10분 동안 끄는 것"], "정답: 10분 동안 전등을 끄는 것. (답지 13)"));
    ex.add(mc(14, "다음 중 적절한 것은?", ["air pollution", "water pollution", "noise pollution", "light pollution", "plastic pollution"], 5, "정답: ⑤. (답지 14)"));
  });

  build("u07", "dialog-advanced", "Dialog 심화 문제", "pp.140-141", (ex) => {
    ex.section("Section A · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    [1, 2, 3, 4, 6, 8, 9, 11].forEach((n) => ex.omit(n, "심화 보기 OCR 순서 미확정 (답지 pp.140-141)"));
    ex.section("Section B · 빈칸", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    ex.add(fill(5, "다음 빈칸에 들어갈 말을 쓰시오.\nWe can ______ plant trees.", ["also"], "정답: also. (답지 05)"));
    ex.add(fill(7, "다음 빈칸에 들어갈 문장을 쓰시오.\nA: Sure. Which activity do you want to do?", ["Which activity do you want to do?"], "정답: Which activity do you want to do? (답지 07)", true));
    ex.add(fill(10, "다음 문장을 쓰시오.\nThey will go to the zero waste shop together.", ["They will go to the zero waste shop together."], "정답: (답지 10)", true));
    ex.add(fill(12, "다음 문장을 쓰시오.\nPeople waste too much water.", ["People waste too much water."], "정답: (답지 11)", true));
    ex.omit(13, "답지 12 MC 보기 OCR 미확정 (답지 pp.140-141)");
  });

  build("u07", "grammar-check", "Grammar 확인 문제", "pp.144-145", (ex) => {
    ex.section("Section A · make+O+형용사 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
    ex.orderBank(1, "01 비는 땅을 젖게 한다.\n보기: makes / wet / the ground / The rain", ["makes", "wet", "the", "ground", "The", "rain"], "The rain makes the ground wet", "정답: The rain makes the ground wet. (답지 p.144 A 01)");
    ex.orderBank(2, "02 그 농담은 나를 행복하게 한다.\n보기: me / makes / happy / The joke", ["me", "makes", "happy", "The", "joke"], "The joke makes me happy", "정답: (답지 A 02)");
    ex.orderBank(3, "03 그들은 정원을 푸르게 만들었다.\n보기: their / green / make / garden / They", ["their", "green", "make", "garden", "They"], "They make their garden green", "정답: make their garden green. (답지 A 03)");
    ex.orderBank(4, "04 그 축제는 도시를 다채롭게 만든다.\n보기: the city / makes / colorful / The festival", ["the", "city", "makes", "colorful", "The", "festival"], "The festival makes the city colorful", "정답: (답지 A 04)");
    ex.orderBank(5, "05 내 강아지는 매일 나를 신나게 만든다.\n보기: me / every day / excited / makes / My dog", ["me", "every", "day", "excited", "makes", "My", "dog"], "My dog makes me excited every day", "정답: makes me excited every day. (답지 A 05)");
    ex.section("Section B · make+O+형용사 고치기", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
    [
      [6, "He made clean the room.", "He made the room clean."],
      [7, "The lamp makes the desk brightly.", "The lamp makes the desk bright."],
      [8, "The doctor makes the patient health.", "The doctor makes the patient healthy."],
      [9, "The movie made I sad.", "The movie made me sad."],
      [10, "Does he make the story interest?", "Does he make the story interesting?"],
    ].forEach((r) => ex.add(sentence(r[0], "틀린 곳을 고쳐 문장 전체를 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2] + " (답지 p.144 B)")));
    ex.section("Section C · make 보기", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    ex.add(fill(11, "The game makes ______ excited.", ["us"], "정답: us. (답지 C 01)"));
    ex.add(fill(12, "The news made me ______.", ["surprised"], "정답: surprised. (답지 C 02)"));
    ex.add(fill(13, "The music makes me ______.", ["sleepy"], "정답: sleepy. (답지 C 03)"));
    ex.add(fill(14, "The morning makes the sky ______.", ["beautiful"], "정답: beautiful. (답지 C 04)"));
    ex.add(fill(15, "The long walk made them ______.", ["tired"], "정답: tired. (답지 C 05)"));
    ex.section("Section D · that절 배열", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
    ex.orderBank(16, "01 She said that she was tired.\n보기: she / was / said / tired / that", ["she", "was", "said", "tired", "that"], "said that she was tired", "정답: said that she was tired. (답지 p.145 A 01)");
    ex.orderBank(17, "02 I think that it will rain tomorrow.\n보기: it / rain / that / think / will / tomorrow", ["it", "rain", "that", "think", "will", "tomorrow"], "think that it will rain tomorrow", "정답: (답지 A 02)");
    ex.orderBank(18, "03 I know she is a good teacher.\n보기: she / a / know / is / teacher / good", ["she", "a", "know", "is", "teacher", "good"], "know she is a good teacher", "정답: (답지 A 03)");
    ex.orderBank(19, "04 Do you believe that he is telling the truth?\n보기: he / you / that / believe / is telling / the truth", ["he", "you", "that", "believe", "is", "telling", "the", "truth"], "believe that he is telling the truth", "정답: (답지 A 04)");
    ex.orderBank(20, "05 I don't feel that this movie is interesting.\n보기: this / that / feel / movie / don't / is / interesting", ["this", "that", "feel", "movie", "don't", "is", "interesting"], "don't feel that this movie is interesting", "정답: (답지 A 05)");
    ex.section("Section E · that 추가", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
    [
      [21, "I heard they moved to a new city.", "I heard that they moved to a new city."],
      [22, "She promised she would call later.", "She promised that she would call later."],
      [23, "We all believe she is a great writer.", "We all believe that she is a great writer."],
      [24, "He doesn't remember he met her before.", "He doesn't remember that he met her before."],
      [25, "Do you understand hard work leads to success?", "Do you understand that hard work leads to success?"],
    ].forEach((r) => ex.add(sentence(r[0], "접속사 that을 추가하여 문장 전체를 쓰시오.\n" + r[1], [r[2]], "정답: " + r[2] + " (답지 p.145 B)")));
    ex.section("Section F · that절 역할", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    [
      [26, "That she loves cats is clear.", ["S", "O", "C"], 1],
      [27, "We believe that it will snow tomorrow.", ["S", "O", "C"], 2],
      [28, "The truth is that he loves animals.", ["S", "O", "C"], 3],
      [29, "The fact is that he forgot my birthday.", ["S", "O", "C"], 3],
      [30, "We hope that you feel better soon.", ["S", "O", "C"], 2],
    ].forEach((r) => ex.add(mc(r[0], "다음 that절의 역할은?\n" + r[1], r[2], r[3], "정답: " + r[2][r[3] - 1] + ". (답지 p.145 C)")));
    ex.add(mc(30, "That it is sunny today is nice.", ["S", "O", "C"], 1, "정답: S. (답지 C 06)"));
  });

  build("u07", "grammar-practice", "Grammar 실전 문제", "pp.146-147", (ex) => {
    ex.section("Section A · 고르기", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    ex.add(mc(1, "다음 빈칸에 들어갈 말로 가장 적절한 것은?\nI agree that studying English ______ important.", ["is", "are", "was", "be", "being"], 1, "정답: ② is. (답지 01)"));
    ex.add(mc(2, "다음 빈칸에 들어갈 말로 가장 적절한 것은?", ["make", "makes", "made", "making", "to make"], 1, "정답: ①. (답지 02)"));
    ex.add(mc(3, "다음 빈칸에 들어갈 말로 가장 적절한 것은?", ["happy", "happily", "happiness", "happen", "happier"], 4, "정답: ④. (답지 03)"));
    ex.section("Section B · 빈칸·문장", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    ex.add(fill(4, "다음 빈칸에 들어갈 말을 쓰시오.\nThe teacher ______ the test easy.", ["made"], "정답: made, easy. (답지 04)", false));
    ex.add(sentence(5, "다음 우리말을 문장 전체로 쓰시오.\n나는 이 영화가 지루하다고 느낀다.", ["I feel that this movie is boring."], "정답: (답지 05)"));
    ex.add(fill(8, "다음 빈칸에 들어갈 말을 쓰시오.\nI know ______ he is honest.", ["that"], "정답: that. (답지 08)"));
    ex.add(sentence(14, "다음 우리말을 문장 전체로 쓰시오.\n이 재미있는 영화가 나를 정말 행복하게 만들었다.", ["This funny movie made me so happy."], "정답: (답지 14)"));
    [6, 7, 9, 10, 11, 12, 13].forEach((n) => ex.omit(n, "실전 보기 OCR 미확정 (답지 pp.146-147)"));
  });

  build("u07", "grammar-advanced", "Grammar 심화 문제", "pp.148-149", (ex) => {
    ex.section("Section A · 확인된 문항", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
    ex.add(sentence(4, "다음 우리말을 문장 전체로 쓰시오.\n나는 독서가 학습을 더 쉽게 만든다고 믿는다.", ["I believe reading makes learning easier."], "정답: (답지 04)"));
    ex.add(sentence(8, "다음 우리말을 문장 전체로 쓰시오.\n시험에서 나쁜 점수를 받아 엄마가 화났다.", ["My bad grade on my test made her angry.", "My bad grade on the test made her angry."], "정답: (답지 08)"));
    ex.add(fill(11, "다음 빈칸에 들어갈 말을 쓰시오.\nThe news made them ______.", ["serious"], "정답: made them serious. (답지 11)"));
    ex.add(sentence(14, "다음을 문장 전체로 쓰시오.\nDid she say that the food was too salty?", ["Did she say that the food was too salty?"], "정답: (답지 14)"));
    [1, 2, 3, 5, 6, 7, 9, 10, 12, 13].forEach((n) => ex.omit(n, "심화 보기 OCR 미확정 (답지 pp.148-149)"));
  });

  function readingPack(unit, pagesContent, pagesLex, pagesOrder, passage, koLines) {
    build(unit, "reading-content", "Reading 내용 확인하기", pagesContent, (ex) => {
      ex.section("Section A · 확인", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      const keys = [
        [1, "Pollution is a big ______.", ["problem"], "문제"],
        [2, "Luckily, three superheroes are working to protect the ______.", ["environment"], "환경"],
        [3, "They want to make the world ______.", ["clean"], "깨끗하게"],
        [4, "Hi! I'm Recycle ______.", ["Wizard"], "마법사"],
        [5, "People waste too many ______.", ["resources"], "자원"],
      ];
      keys.forEach((k) => ex.add(fill(k[0], k[1], k[2], "정답: " + k[2][0] + " (" + k[3] + "). (답지 p.152)")));
      [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach((n) => ex.omit(n, "Reading 내용 확인 나머지 칸 — 답지 p.152 한글 키만 확정"));
    });
    build(unit, "reading-lexgram", "Reading 적절한 어휘·어법 고르기", pagesLex, (ex) => {
      ex.section("Section A · 괄호", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
      ex.add(mc(1, "Pollution is a big [problem / problems].", ["problem", "problems"], 1, "정답: problem. (답지 p.153 01)"));
      ex.add(mc(2, "[Luckily / Lucky], three superheroes are working.", ["Luckily", "Lucky"], 1, "정답: Luckily. (답지 02)"));
      [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].forEach((n) => ex.omit(n, "Reading lexgram 보기 OCR 미확정 (답지 p.153)"));
    });
    build(unit, "reading-order", "Reading 순서배열하기", pagesOrder, (ex) => {
      ex.section("Section A · 문장 순서", ORDER.directionKo, ORDER.ruleKo, "order", ORDER.answerModeTag);
      passage.forEach((sent, i) => {
        const words = sent.replace(/[“”]/g, "").match(/[A-Za-z0-9']+/g) || [];
        ex.orderBank(i + 1, (i + 1) + " " + (koLines[i] || "") + "\n보기를 순서대로 누르세요.", words.slice().reverse(), sent.replace(/[“”]/g, ""), "정답: " + sent + " (답지 pp.154-157)");
      });
    });
    build(unit, "reading-writing", "Reading 영작하기", pagesOrder, (ex) => {
      ex.section("Section A · 영작", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
      passage.forEach((sent, i) => {
        const bare = sent.replace(/[“”]/g, '"');
        ex.add(sentence(i + 1, (i + 1) + " " + (koLines[i] || ""), [bare, bare.replace(/[.!?]+$/, "")], "정답: " + sent + " (답지 pp.154-157)"));
      });
    });
    build(unit, "reading-practice", "Reading 실전 문제", "pp.158-161", (ex) => {
      ex.section("Section A · 확인", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      ex.add(fill(3, "다음 우리말에 맞도록 문장을 쓰시오.\n그들은 세상을 깨끗하게 만들고 싶어 한다.", ["They want to make the world clean."], "정답: (답지 03)", true));
      ex.add(fill(4, "빈칸에 들어갈 말을 쓰시오.\nLuckily, ______ superheroes are working.", ["three"], "정답: three superheroes. (답지 04)"));
      ex.add(fill(5, "빈칸에 들어갈 말을 쓰시오.\nThen you should recycle ______.", ["properly"], "정답: properly. (답지 05)"));
      ex.add(fill(15, "빈칸에 들어갈 말을 쓰시오.\nDon't buy too many ______.", ["clothes"], "정답: clothes. (답지 15)"));
      ex.add(fill(21, "빈칸에 들어갈 말을 쓰시오.\nWater is very important. We can't live without ______.", ["it", "water"], "정답: water. (답지 21)"));
      ex.add(sentence(25, "다음 우리말을 문장 전체로 쓰시오.\n수도꼭지를 완전히 잠갔는지 확인하세요.", ["Make sure that you turn off the tap completely.", "Also, make sure that you turn off the tap completely."], "정답: (답지 25)"));
      [1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 22, 23, 24].forEach((n) => ex.omit(n, "Reading 실전 MC OCR 미확정 (답지 pp.158-161)"));
    });
    build(unit, "reading-advanced", "Reading 심화 문제", "pp.162-165", (ex) => {
      ex.section("Section A · 확인", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      ex.add(fill(4, "다음 우리말을 문장 전체로 쓰시오.\n사람들은 너무 많은 자원을 낭비한다.", ["People waste too many resources."], "정답: (답지 04)", true));
      ex.add(fill(8, "틀린 말을 바른 말로만 쓰시오.\nYou can correct the wrong answers.", ["correct"], "정답: correct. (답지 08)"));
      ex.add(sentence(17, "다음 우리말을 문장 전체로 쓰시오.\n헌 옷을 유용하게 만들어 봅시다.", ["Let's make old clothes useful."], "정답: (답지 17)"));
      ex.add(fill(19, "주제어를 쓰시오.\nWater Saver section topic", ["Water"], "정답: Water. (답지 19)"));
      ex.add(fill(20, "that절을 우리말로 쓰시오.\nIt makes me sad that people waste a lot of water.", ["사람들이 많은 물을 낭비하는 것", "사람들이 물을 많이 낭비하는 것"], "정답: (답지 20)"));
      ex.add(sentence(24, "다음을 문장 전체로 쓰시오.\nI'm sure that you got the right answers.", ["I'm sure that you got the right answers."], "정답: (답지 24)"));
      [1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 18, 21, 22, 23, 25].forEach((n) => ex.omit(n, "Reading 심화 OCR 미확정 (답지 pp.162-165)"));
    });
  }

  readingPack("u07", "p.152", "p.153", "pp.154-157", L07_PASSAGE, L07_KO);

  build("u07", "plus-practice", "Plus 기타 지문 실전 문제", "p.167", (ex) => {
    ex.section("Section A · T/F", TF.directionKo, TF.ruleKo, "choice", TF.answerModeTag);
    ex.add(tf(1, "The writer will not use a plastic fork on Friday.", "F", "정답: F. (답지 p.167 Q1)"));
    ex.add(tf(2, "We can save paper by using both sides of the paper.", "T", "정답: T. (답지 Q2)"));
    ex.add(tf(3, "If you buy too much food at once, you can produce food waste.", "T", "정답: T. (답지 Q3)"));
    [4, 5, 6].forEach((n) => ex.omit(n, "Plus MC OCR 미확정 (답지 p.167)"));
  });

  build("u07", "writing-finish", "서술형 끝내기", "pp.168-171", (ex) => {
    ex.section("Section A · 확인", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    ex.add(fill(1, "This cake is ______ chocolate and vanilla.", ["made with"], "정답: made with. (답지 01)", true));
    ex.add(fill(2, "Very bad weather with strong wind and rain: ______", ["storm"], "정답: storm. (답지 02)"));
    [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25].forEach((n) => ex.omit(n, "서술형 다중 빈칸 OCR 미확정 (답지 pp.168-171)"));
  });

  build("u07", "mock-100", "100발 100중 모의고사", "pp.172-175", (ex) => {
    ex.section("Section A · 답지", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    [40, 41, 42, 43, 44, 50, 51, 52, 53, 54].forEach((n) => ex.omit(n, "답지 스캔 공백 pp.40–44, 50–54 — 키 없음"));
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27].forEach((n) => ex.omit(n, "모의고사 보기 OCR 미확정 (답지 pp.172-175)"));
  });

  build("u07", "mock-high", "고득점 모의고사", "pp.176-179", (ex) => {
    ex.section("Section A · 답지", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].forEach((n) => ex.omit(n, "고득점 모의 OCR 미확정 (답지 pp.176-179)"));
  });

  build("u07", "x10-vocab", "어휘 확인 문제", "X-10 pp.30-31", (ex) => {
    ex.section("Section A · 영어↔우리말", koEn("").directionKo, koEn("").ruleKo, "match", "Match · 짝짓기");
    ex.matchPairs(pairs(payload.L07_A.slice(0, 10)));
    ex.section("Section B · 우리말↔영어", koEn("").directionKo, koEn("").ruleKo, "match", "Match · 짝짓기");
    ex.matchPairs(pairs(payload.L07_B.slice(0, 10)));
    [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach((n) => ex.omit(n, "X-10 어휘 나머지 — match 블록 추가 예정 (답지 p.189)"));
  });

  ["x10-dialog-cloze", "x10-dialog-write", "x10-grammar", "x10-reading-sentence", "x10-reading-cloze", "x10-review"].forEach((id) => {
    const titles = {
      "x10-dialog-cloze": "대화 빈칸 완성하기",
      "x10-dialog-write": "대화 영작하기",
      "x10-grammar": "핵심 Grammar 확인 문제",
      "x10-reading-sentence": "Reading 문장 완성하기",
      "x10-reading-cloze": "Reading 빈칸 완성하기",
      "x10-review": "핵심 문장 Review",
    };
    build("u07", id, titles[id], "X-10 L07", (ex) => {
      ex.section("Section A · X-10", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      ex.omit("all", "X-10 L07 " + id + " — book-txt p117+ · 답지 p189-193 대조 follow-up");
    });
  });

  ["final-1", "final-2", "final-3"].forEach((id, i) => {
    build("u07", id, ["최종점검 모의고사 1회", "최종점검 모의고사 2회", "최종점검 모의고사 3회"][i], "X-10 pp.84-95", (ex) => {
      ex.section("Section A · 답지 확정분", SENT.directionKo, SENT.ruleKo, "sentence", SENT.answerModeTag);
      ex.omit("rest", "최종점검 MC 보기 OCR 미확정 — 답지 p194-197에서 문장형만 우선");
    });
  });

  build("u08", "vocab-practice", "Vocabulary 실전 문제", "p.185", (ex) => {
    ex.section("Section A · 실전", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    ex.add(mc(1, "다음 영영풀이에 해당하는 단어는?\na story about magic and imaginary worlds", ["novel", "fantasy", "adventure", "lesson", "emotion"], 2, "정답: fantasy. (답지 L08 vocab 실전)"));
    [2, 3, 4, 5, 6, 7].forEach((n) => ex.omit(n, "L08 vocab 실전 OCR 미확정 (답지 p.30)"));
  });

  build("u08", "vocab-advanced", "Vocabulary 심화 문제", "pp.186-187", (ex) => {
    ex.section("Section A", CHOOSE.directionKo, CHOOSE.ruleKo, "choice", CHOOSE.answerModeTag);
    ex.omit("rest", "L08 vocab 심화 — 답지 p.30-31 대조 follow-up");
  });

  build("u08", "dialog-practice", "Dialog 실전 문제", "pp.196-197", (ex) => {
    ex.section("Section A · 확인", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
    ex.add(fill(4, "다음을 문장 전체로 쓰시오.\nI'm curious about the story.", ["I'm curious about the story."], "정답: (답지 04)", true));
    ex.add(fill(9, "다음을 쓰시오.\nCan you help me?", ["Can you help me?"], "정답: (답지 09)", true));
    ex.add(fill(12, "빈칸에 들어갈 전치사를 쓰시오.\nI'm curious ______ the story.", ["about"], "정답: about. (답지 12)"));
    ex.add(sentence(15, "다음을 문장 전체로 쓰시오.\nI learned that all emotions are important.", ["I learned that all emotions are important."], "정답: (답지 15)"));
    [1, 2, 3, 5, 6, 7, 8, 10, 11, 13, 14].forEach((n) => ex.omit(n, "Dialog 실전 MC OCR (답지 pp.196-197)"));
  });

  build("u08", "dialog-advanced", "Dialog 심화 문제", "pp.198-199", (ex) => {
    ex.omit("rest", "Dialog 심화 — 답지 follow-up");
  });

  ["grammar-check", "grammar-practice", "grammar-advanced", "reading-content", "reading-lexgram", "reading-order", "reading-writing", "reading-practice", "reading-advanced", "plus-practice", "writing-finish", "mock-100", "mock-high", "x10-vocab", "x10-dialog-cloze", "x10-dialog-write", "x10-grammar", "x10-reading-sentence", "x10-reading-cloze", "x10-review", "final-1", "final-2", "final-3"].forEach((id) => {
    const u08Titles = {
      "grammar-check": "Grammar 확인 문제",
      "grammar-practice": "Grammar 실전 문제",
      "grammar-advanced": "Grammar 심화 문제",
      "reading-content": "Reading 내용 확인하기",
      "reading-lexgram": "Reading 적절한 어휘·어법 고르기",
      "reading-order": "Reading 순서배열하기",
      "reading-writing": "Reading 영작하기",
      "reading-practice": "Reading 실전 문제",
      "reading-advanced": "Reading 심화 문제",
      "plus-practice": "Plus 기타 지문 실전 문제",
      "writing-finish": "서술형 끝내기",
      "mock-100": "100발 100중 모의고사",
      "mock-high": "고득점 모의고사",
      "x10-vocab": "어휘 확인 문제",
      "x10-dialog-cloze": "대화 빈칸 완성하기",
      "x10-dialog-write": "대화 영작하기",
      "x10-grammar": "핵심 Grammar 확인 문제",
      "x10-reading-sentence": "Reading 문장 완성하기",
      "x10-reading-cloze": "Reading 빈칸 완성하기",
      "x10-review": "핵심 문장 Review",
      "final-1": "최종점검 모의고사 1회",
      "final-2": "최종점검 모의고사 2회",
      "final-3": "최종점검 모의고사 3회",
    };
    build("u08", id, u08Titles[id], "L08 본책/X-10", (ex) => {
      ex.section("Section A · digitize", FILL.directionKo, FILL.ruleKo, "words", FILL.answerModeTag);
      ex.omit("rest", "L08 " + id + " — 답지 p.179+ 대조 follow-up (book-txt p060+)");
    });
  });
};
