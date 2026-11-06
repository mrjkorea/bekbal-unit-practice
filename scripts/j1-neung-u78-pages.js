/** Items typed from the printed pages of 중1 능률 김기택 7,8all_20261103.pdf (본책 + 답지).
 *  Each entry replaces the bulk-built exercise with the same id.
 *  Shape: { title, pages, sections: [{ title, dir, rule, answerMode, tag, items }] }.
 *  Item kinds: mc | multi | fill | sentence | tf | order | split | omit
 *
 *  Answer keys come from the 답지 pages: 정답 및 해설 20쪽 (p.126-129), 21쪽 (p.132-141).
 */
module.exports = {
  u07: {
    "vocab-advanced": {
      title: "Vocabulary 심화 문제",
      pages: "pp.128-129",
      sections: [
        {
          title: "Section A · 고르기",
          dir: "알맞은 것을 고르시오.",
          rule: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
          answerMode: "choice",
          tag: "Choose · 고르기",
          items: [
            {
              n: 1, kind: "mc",
              prompt: "01 다음 단어의 영영풀이가 잘못된 것은?\n① useful: helpful or practical\n② save: not to use too much of something\n③ recycle: to make something smaller or less\n④ completely: fully or totally, with nothing left out\n⑤ waste: things that are not needed or are thrown away",
              choices: ["useful: helpful or practical", "save: not to use too much of something", "recycle: to make something smaller or less", "completely: fully or totally, with nothing left out", "waste: things that are not needed or are thrown away"],
              index: 3, explain: "③ recycle의 영영풀이는 ‘to make something new again from used things’. ‘to make something smaller or less’는 reduce. (답지 20쪽)",
            },
            {
              n: 2, kind: "mc",
              prompt: "02 다음 빈칸 ⓐ와 ⓑ에 들어갈 말이 바르게 짝지어진 것은?\n• The old building began to ⓐ ______ down over time.\n• Kate needs a ⓑ ______ of paper to write down her phone number.",
              choices: ["grow / waste", "bleak / piece", "melt / peace", "plant / waste", "break / piece"],
              index: 5, explain: "⑤ break down: 분해하다, 부수다. piece: 조각, 단편. (답지 20쪽)",
            },
            {
              n: 3, kind: "mc",
              prompt: "03 다음 빈칸에 들어갈 말로 적절하지 않은 것은?\n• Don’t laugh, I am ______ !\n• Please give me ______ answers.\n• I ______ forgot to bring my umbrella.\n• I grow my ______ vegetables in the garden.",
              choices: ["own", "item", "correct", "serious", "completely"],
              index: 2, explain: "② item(물품)은 어느 빈칸에도 맞지 않는다. serious / correct / completely / own. (답지 20쪽)",
            },
            {
              n: 4, kind: "mc",
              prompt: "04 다음 짝지어진 두 단어의 관계가 나머지와 다른 것은?\n① hurt : heal\n② correct : wrong\n③ useful : useless\n④ bored : excited\n⑤ reduce : lessen",
              choices: ["hurt : heal", "correct : wrong", "useful : useless", "bored : excited", "reduce : lessen"],
              index: 5, explain: "⑤ reduce와 lessen은 유의어. 나머지는 반의어. (답지 20쪽)",
            },
            {
              n: 5, kind: "mc",
              prompt: "05 What is the correct word for each definition?\n(ⓐ) in the right or correct way\n(ⓑ) moving or acting with speed; fast",
              choices: ["properly / own", "properly / quick", "luckily / nervous", "luckily / slow", "completely / correct"],
              index: 2, explain: "② properly(적절히, 제대로) / quick(빠른). (답지 20쪽)",
            },
            {
              n: 7, kind: "mc",
              prompt: "07 다음 영영풀이에 해당하는 단어가 들어간 문장은?\nto place a seed or plant in the ground so it can grow\n① I didn’t mean to hurt your feelings.\n② The farmer will plant corn in the field.\n③ Parents protect their children from danger.\n④ We should save water by turning off the tap.\n⑤ The snow began to melt in the warm weather.",
              choices: ["I didn’t mean to hurt your feelings.", "The farmer will plant corn in the field.", "Parents protect their children from danger.", "We should save water by turning off the tap.", "The snow began to melt in the warm weather."],
              index: 2, explain: "② plant(심다). (답지 20쪽)",
            },
            {
              n: 8, kind: "mc",
              prompt: "08 다음 밑줄 친 단어의 쓰임이 적절하지 않은 것은?\n① This item should be hand-washed.\n② The news brought tears to his eyes.\n③ She turned the tap to wash her hands.\n④ I draw tomatoes in my backyard to eat.\n⑤ She opened the bottle and poured juice into a glass.",
              choices: ["This item should be hand-washed.", "The news brought tears to his eyes.", "She turned the tap to wash her hands.", "I draw tomatoes in my backyard to eat.", "She opened the bottle and poured juice into a glass."],
              index: 4, explain: "④ draw(그리다)가 아니라 grow(기르다). (답지 20쪽)",
            },
            {
              n: 9, kind: "mc",
              prompt: "09 다음 우리말을 영어로 옮길 때 빈칸에 들어갈 말로 바르게 짝지어진 것은?\n단어와 그림을 연결하시오.\n→ Please ______ the words ______ the pictures.",
              choices: ["put - in", "turn - on", "break - down", "throw - away", "match - with"],
              index: 5, explain: "⑤ match A with B: A를 B와 연결하다. (답지 20쪽)",
            },
            {
              n: 11, kind: "mc",
              prompt: "11 다음 밑줄 친 부분과 바꿔 쓸 수 있는 것은?\nHe greeted her briefly and then put on his hat.\n① melted\n② wore\n③ planted\n④ protected\n⑤ created",
              choices: ["melted", "wore", "planted", "protected", "created"],
              index: 2, explain: "② put on(입다) = wear. 과거형 wore. (답지 20쪽)",
            },
            {
              n: 14, kind: "mc",
              prompt: "14 다음 빈칸에 공통으로 들어갈 말로 가장 적절한 것은?\n• They ______ a shower at the gym after working out.\n• I will ______ a math test tomorrow morning.",
              choices: ["take", "make", "put", "pick", "turn"],
              index: 1, explain: "① take a shower / take a test. (답지 20쪽)",
            },
            {
              n: 15, kind: "mc",
              prompt: "15 다음 밑줄 친 부분의 쓰임이 적절한 것끼리 짝지어진 것은?\nⓐ Lucky, I found my keys.\nⓑ He hurt his shoulder in P.E. class.\nⓒ She turned off the right before sleeping.\nⓓ I picked up a piece of wood from the ground.\n① ⓐ, ⓒ\n② ⓐ, ⓑ, ⓓ\n③ ⓑ, ⓒ\n④ ⓑ, ⓓ\n⑤ ⓑ, ⓒ, ⓓ",
              choices: ["ⓐ, ⓒ", "ⓐ, ⓑ, ⓓ", "ⓑ, ⓒ", "ⓑ, ⓓ", "ⓑ, ⓒ, ⓓ"],
              index: 4, explain: "④ ⓑ hurt(다치게 하다), ⓓ piece(조각). ⓐ Luckily, ⓒ turn off는 동사. (답지 20쪽)",
            },
          ],
        },
        {
          title: "Section B · 빈칸에 쓸 말",
          dir: "빈칸에 들어갈 말만 쓰시오.",
          rule: "빈칸에 들어갈 말만 쓰세요. 문장 전체는 쓰지 않아요.",
          answerMode: "words",
          tag: "Type · 빈칸 말만",
          items: [
            {
              n: 6, kind: "fill",
              prompt: "06 다음 우리말에 맞도록 빈칸에 들어갈 적절한 말을 쓰시오.\n그는 전화로 오랫동안 이야기했다.\n→ He talked on the phone ______ a long time.",
              accept: ["for"], explain: "정답: for (for a long time). (답지 20쪽)",
            },
            {
              n: 10, kind: "fill",
              prompt: "10-ⓐ 다음 빈칸에 들어갈 말을 쓰시오. (서술형)\n• She spends ⓐ ______ time reading each day.",
              accept: ["much"], explain: "정답: much. (답지 20쪽)",
            },
            {
              n: 10, kind: "fill",
              prompt: "10-ⓑ 다음 빈칸에 들어갈 말을 쓰시오. (서술형)\n• He has ⓑ ______ friends from different countries.",
              accept: ["many"], explain: "정답: many. (답지 20쪽)",
            },
            {
              n: 12, kind: "fill",
              prompt: "12 다음 빈칸에 공통으로 들어갈 한 단어를 쓰시오.\n• He ______ her hand while cooking.\n• She cried because her arm ______ .\n• Sometimes, jokes can make you feel ______ .",
              accept: ["hurt"], explain: "정답: hurt. (답지 20쪽)",
            },
            {
              n: 13, kind: "fill",
              prompt: "13 다음 우리말에 맞도록 빈칸에 들어갈 적절한 말을 쓰시오.\n어제 나는 오래된 신문들과 빈 병을 버렸다.\n→ Yesterday, I ______ ______ the old papers and empty bottles.",
              accept: ["threw away"], phrase: true, explain: "정답: threw away. (답지 20쪽)",
            },
            { n: 16, omit: "16", reason: "교재 p.128-129에 16번이 없음 — 이전 데이터의 채움용 문항" },
            { n: 17, omit: "17", reason: "교재 p.128-129에 17번이 없음 — 이전 데이터의 채움용 문항" },
            { n: 18, omit: "18", reason: "교재 p.128-129에 18번이 없음 — 이전 데이터의 채움용 문항" },
          ],
        },
      ],
    },
    "dialog-practice": {
      title: "Dialog 실전 문제",
      pages: "pp.138-139",
      sections: [
        {
          title: "Section A · Dialog 실전",
          dir: "알맞은 것을 고르시오.",
          rule: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
          answerMode: "choice",
          tag: "Choose · 고르기",
          items: [
            { n: 1, kind: "mc",
              prompt: "01 다음 대화에서 밑줄 친 「For example, you can go jogging or do yoga.」의 의도로 가장 적절한 것은?\nA: What can I do to stay healthy?\nB: You can exercise regularly. For example, you can go jogging or do yoga.",
              choices: ["불평하기", "충고하기", "부탁하기", "예시 들기", "선호 표현하기"], index: 4,
              explain: "④ 예시 들기. (답지 21쪽)" },
            { n: 2, kind: "mc",
              prompt: "02 다음 대화의 빈칸에 들어갈 말로 가장 적절한 것은?\nA: Do you know about the math test tomorrow?\nB: ______",
              choices: ["I think math is easy.", "Oh no! I completely forgot.", "I like my math teacher the most.", "Did you do well on the math test?", "I think math is more important than English."], index: 2,
              explain: "② Oh no! I completely forgot. (답지 21쪽)" },
            { n: 3, kind: "mc",
              prompt: "[03-04] 다음 대화를 읽고, 물음에 답하시오.\nG: Do you know about ⓐ ______ ?\nB: Yes, I do. Earth’s temperature is rising. It is a big problem.\nG: Right. The ice is melting quickly, and polar bears are losing their homes.\nB: We should do something to help ⓑthem.\n\n03 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
              choices: ["global cooling", "Big Bang", "global warming", "a heavy flood", "animal protection"], index: 3,
              explain: "③ global warming. (답지 21쪽)" },
            { n: 4, kind: "fill",
              prompt: "[03-04] 다음 대화를 읽고, 물음에 답하시오.\nG: Do you know about ⓐ global warming?\nB: Yes, I do. Earth’s temperature is rising. It is a big problem.\nG: Right. The ice is melting quickly, and polar bears are losing their homes.\nB: We should do something to help ⓑthem.\n\n04 위 대화의 밑줄 친 ⓑ가 가리키는 것을 찾아 쓰시오.",
              accept: ["polar bears"], explain: "정답: polar bears. (답지 21쪽)" },
            { n: 5, kind: "fill",
              prompt: "[05-06] 다음 대화를 읽고, 물음에 답하시오.\nB: Look at this poster.\nG: It’s shocking. It looks like someone drank most of Earth’s ⓐ ______ .\nB: Yes. People waste too much water. What can we do to save water?\nG: We can do a lot of things. ⓑ ______ , we can take quick showers.\nB: That sounds good.\n\n05 위 대화의 빈칸 ⓐ에 들어갈 한 단어를 대화에서 찾아 쓰시오.",
              accept: ["water"], explain: "정답: water. (답지 21쪽)" },
            { n: 6, kind: "mc",
              prompt: "[05-06] 다음 대화를 읽고, 물음에 답하시오.\nB: Look at this poster.\nG: It’s shocking. It looks like someone drank most of Earth’s ⓐ water.\nB: Yes. People waste too much water. What can we do to save water?\nG: We can do a lot of things. ⓑ ______ , we can take quick showers.\nB: That sounds good.\n\n06 위 대화의 빈칸 ⓑ에 들어갈 말로 가장 적절한 것은?",
              choices: ["However", "Therefore", "Furthermore", "In fact", "For example"], index: 5,
              explain: "⑤ For example. (답지 21쪽)" },
            { n: 7, kind: "mc",
              prompt: "[07-08] 다음 대화를 읽고, 물음에 답하시오.\nB: Do you know about plastic pollution?\nG: Yes, I do. A lot of plastic waste goes into the oceans.\nB: Right. It is a serious problem.\nG: ⑥What can we do to produce plastic waste?\nB: We can start making small changes. For example, we can carry our own water bottles.\nG: ⓑ ______\n\n07 위 대화의 밑줄 친 ⑥에서 어색하게 쓰인 말은?",
              choices: ["What", "can", "do", "produce", "plastic"], index: 4,
              explain: "④ produce → reduce. (답지 21쪽)" },
            { n: 8, kind: "mc",
              prompt: "[07-08] 다음 대화를 읽고, 물음에 답하시오.\nB: Do you know about plastic pollution?\nG: Yes, I do. A lot of plastic waste goes into the oceans.\nB: Right. It is a serious problem.\nG: What can we do to reduce plastic waste?\nB: We can start making small changes. For example, we can carry our own water bottles.\nG: ⓑ ______\n\n08 위 대화의 빈칸 ⓑ에 들어갈 말로 가장 적절한 것은?",
              choices: ["No problem.", "You’re welcome.", "I have no idea.", "It was a mistake.", "That’s a good idea."], index: 5,
              explain: "⑤ That’s a good idea. (답지 21쪽)" },
            { n: 10, kind: "mc",
              prompt: "[09-11] 다음 대화를 읽고, 물음에 답하시오.\nB: Hi, Bora. What are you ⓐ(go) to do this weekend?\nG: I’m planning to go to a zero waste shop. Do you know about zero waste shops?\nB: No, I don’t. Please tell me about them.\nG: They don’t sell items in containers, so you can reduce waste. ⑥Why don’t you come with me?\nB: That sounds great! What can I buy there?\nG: You can buy a lot of items. For example, they have bags, shampoo, and some snacks.\nB: I see. I’m going to buy shampoo.\nG: You should bring your own container, then. You can put the shampoo in it.\nB: Okay.\n\n10 위 대화의 밑줄 친 ⑥와 바꿔 쓸 수 있는 것은?",
              choices: ["Why do you come with me?", "What about coming with me?", "Why are you coming with me?", "How can we come to the shops?", "What are you planning to do with me?"], index: 2,
              explain: "② What about coming with me? (답지 21쪽)" },
            { n: 11, kind: "mc",
              prompt: "[09-11] 다음 대화를 읽고, 물음에 답하시오.\nB: Hi, Bora. What are you going to do this weekend?\nG: I’m planning to go to a zero waste shop. Do you know about zero waste shops?\nB: No, I don’t. Please tell me about them.\nG: They don’t sell items in containers, so you can reduce waste. Why don’t you come with me?\nB: That sounds great! What can I buy there?\nG: You can buy a lot of items. For example, they have bags, shampoo, and some snacks.\nB: I see. I’m going to buy shampoo.\n\n11 위 대화의 내용과 일치하지 않는 것은?",
              choices: ["보라는 이번 주말에 제로 웨이스트 상점에 갈 것이다.", "두 사람 모두 제로 웨이스트 상점에 대해 잘 알고 있다.", "제로 웨이스트 상점에서는 용기를 팔지 않는다.", "제로 웨이스트 상점에서 가방을 살 수 있다.", "제로 웨이스트 상점에서 샴푸를 사기 위해서는 개인 소유의 용기를 가져가야 한다."], index: 2,
              explain: "② 남자는 잘 알지 못한다. (답지 21쪽)" },
            { n: 12, kind: "mc",
              prompt: "[12-14] 다음 대화를 읽고, 물음에 답하시오.\nG: Hey, Tom! Do you know about Earth Day?\nB: No, I don’t. What is it?\nG: It’s a special day ⓐ ______ April 22. People take part in a global event.\nB: I see. What do they do?\nG: They do many things. For example, some people turn off the lights for ten minutes.\nB: Wow! But how can ⓑthat help the environment?\nG: It can save a lot of energy. Also, it can reduce greenhouse gases. Why don’t we take part in the event?\nB: That’s a great idea. Let’s do it.\n\n12 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
              choices: ["at", "in", "on", "around", "about"], index: 3,
              explain: "③ on (April 22). (답지 21쪽)" },
            { n: 13, kind: "fill",
              prompt: "[12-14] 다음 대화를 읽고, 물음에 답하시오.\nG: Hey, Tom! Do you know about Earth Day?\nB: No, I don’t. What is it?\nG: It’s a special day on April 22. People take part in a global event.\nB: I see. What do they do?\nG: They do many things. For example, some people turn off the lights for ten minutes.\nB: Wow! But how can ⓑthat help the environment?\n\n13 위 대화의 밑줄 친 ⓑ가 의미하는 것을 10자 내외의 우리말로 쓰시오.",
              accept: ["10분 동안 전등을 끄는 것", "전등을 10분 동안 끄는 것"], explain: "정답: 10분 동안 전등을 끄는 것. (답지 21쪽)" },
            { n: 14, kind: "mc",
              prompt: "[12-14] 다음 대화를 읽고, 물음에 답하시오.\nG: Hey, Tom! Do you know about Earth Day?\nB: No, I don’t. What is it?\nG: It’s a special day on April 22. People take part in a global event.\nB: I see. What do they do?\nG: They do many things. For example, some people turn off the lights for ten minutes.\nB: Wow! But how can that help the environment?\nG: It can save a lot of energy. Also, it can reduce greenhouse gases. Why don’t we take part in the event?\nB: That’s a great idea. Let’s do it.\n\n14 위 대화의 내용과 일치하는 것은?",
              choices: ["지구의 날은 5월 22일이다.", "Tom은 지구의 날에 관해 잘 알고 있었다.", "지구의 날에 특별한 행사는 없다.", "10분 동안 전등을 끄는 것은 지구의 환경에는 도움이 되지 않는다.", "두 사람은 지구의 날 행사에 참여할 것이다."], index: 5,
              explain: "⑤ 두 사람은 행사에 참여하기로 한다. (답지 21쪽)" },
            { n: 9, kind: "fill",
              prompt: "[09-11] 다음 대화를 읽고, 물음에 답하시오.\nB: Hi, Bora. What are you ⓐ(go) to do this weekend?\nG: I’m planning to go to a zero waste shop.\n\n09 위 대화의 괄호 ⓐ를 알맞은 형태로 바꿔 쓰시오.",
              accept: ["going"], explain: "정답: going. (답지 21쪽)" },
          ],
        },
      ],
    },
    "dialog-advanced": {
      title: "Dialog 심화 문제",
      pages: "pp.140-141",
      sections: [
        {
          title: "Section A · Dialog 심화",
          dir: "알맞은 것을 고르시오.",
          rule: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
          answerMode: "choice",
          tag: "Choose · 고르기",
          items: [
            {"n": 1, "kind": "mc", "index": 5, "explain": "⑤ 포장이 많은 품목을 사는 것은 적절하지 않다. (답지 21쪽)", "prompt": "[01-02] 다음 대화를 읽고, 물음에 답하시오.\nA: Our class will take part in a zero waste week. Do you know about “zero waste”?\nB: Yes, I do! But what can we do to reduce waste?\nA: We can do a lot of things. For example, ⓐ ______\nC: ⑥That’s a good idea! I will bring my own bag to the market.\n\n01 위 대화의 빈칸 ⓐ에 들어갈 말로 적절하지 않은 것은?", "choices": ["I won’t buy things I don’t need.", "I will use both sides of paper.", "I will use my own water bottle.", "I will recycle paper, plastic, and glass.", "I will buy products with a lot of packaging."]},
            {"n": 2, "kind": "mc", "index": 5, "explain": "⑤ That sounds great! (답지 21쪽)", "prompt": "[01-02] 다음 대화를 읽고, 물음에 답하시오.\nA: Our class will take part in a zero waste week. Do you know about “zero waste”?\nB: Yes, I do! But what can we do to reduce waste?\nA: We can do a lot of things. For example, I will use my own water bottle.\nC: ⑥That’s a good idea! I will bring my own bag to the market.\n\n02 위 대화의 밑줄 친 ⑥와 바꿔 쓸 수 있는 것은?", "choices": ["What a pity!", "Of course not!", "That’s not true!", "I don’t think so!", "That sounds great!"]},
            {"n": 3, "kind": "mc", "index": 2, "explain": "② air pollution. (답지 21쪽)", "prompt": "[03-05] 다음 대화를 읽고, 물음에 답하시오.\nG: Sam, do you know about ⓐ ______ ?\nB: Yes, I do. It’s becoming a serious problem. What can we do about it?\nG: We can do a lot of things. ⓑFor example, we can ride bikes to school. Also, we can walk more often.\nB: Great ideas! We can ⓒ ______ plant trees. Trees clean the air.\nG: Right. Let’s help the environment.\n\n03 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?", "choices": ["a forest fire", "air pollution", "a traffic jam", "water pollution", "a lack of energy"]},
            {"n": 4, "kind": "mc", "index": 3, "explain": "③ For instance. (답지 21쪽)", "prompt": "[03-05] 다음 대화를 읽고, 물음에 답하시오.\nG: Sam, do you know about ⓐ air pollution?\nB: Yes, I do. It’s becoming a serious problem. What can we do about it?\nG: We can do a lot of things. ⓑFor example, we can ride bikes to school. Also, we can walk more often.\nB: Great ideas! We can ⓒ ______ plant trees. Trees clean the air.\nG: Right. Let’s help the environment.\n\n04 위 대화의 밑줄 친 ⓑ와 바꿔 쓸 수 있는 것은?", "choices": ["In fact", "In addition", "For instance", "For this reason", "In other words"]},
            {"n": 5, "kind": "fill", "accept": ["also"], "explain": "정답: also. (답지 21쪽)", "prompt": "[03-05] 다음 대화를 읽고, 물음에 답하시오.\nG: Sam, do you know about ⓐ air pollution?\nB: Yes, I do. It’s becoming a serious problem. What can we do about it?\nG: We can do a lot of things. ⓑFor example, we can ride bikes to school. Also, we can walk more often.\nB: Great ideas! We can ⓒ ______ plant trees. Trees clean the air.\nG: Right. Let’s help the environment.\n\n05 위 대화의 빈칸 ⓒ에 들어갈 말을 한 단어로 찾아 쓰시오."},
            {"n": 6, "kind": "mc", "index": 2, "explain": "② 잘 알지 못하는 사람은 B이다. (답지 21쪽)", "prompt": "[06-07] 다음 대화를 읽고, 물음에 답하시오.\nA: Do you know about the eco club at our school?\nB: No, I don’t. What do the club members do?\nA: They do a lot of things for Earth. For example, they grow plants.\nB: That sounds fun. Let’s join the club together!\nA: Sure. 너는 어떤 활동을 하고 싶니?\nB: I want to pick up waste.\n\n06 위 대화의 내용과 일치하지 않는 것은?", "choices": ["학교에 환경 동아리가 있다.", "A는 환경 동아리에 대해 잘 알지 못한다.", "환경 동아리 회원들은 지구를 위한 일을 한다.", "두 사람 모두 환경 동아리 회원이 될 것이다.", "B는 환경 동아리에서 쓰레기 줍기를 하기 원한다."]},
            {"n": 7, "kind": "sentence", "accept": ["Which activity do you want to do?"], "explain": "정답: Which activity do you want to do? (답지 21쪽)", "prompt": "[06-07] 다음 대화를 읽고, 물음에 답하시오.\nA: Do you know about the eco club at our school?\nB: No, I don’t. What do the club members do?\nA: They do a lot of things for Earth. For example, they grow plants.\nB: That sounds fun. Let’s join the club together!\nA: Sure. 너는 어떤 활동을 하고 싶니?\nB: I want to pick up waste.\n\n07 위 대화의 밑줄 친 우리말을 조건에 맞게 영작하시오.\n조건 1. activity, want, which, you, to를 모두 이용하고 총 7단어로 쓸 것.\n조건 2. 대소문자 및 구두점에 유의할 것."},
            {"n": 8, "kind": "mc", "index": 4, "explain": "④ ⓐ them = zero waste shops, ⑥ they = zero waste shops. (답지 22쪽)", "prompt": "[08-10] 다음 대화를 읽고, 물음에 답하시오.\nB: Hi, Bora. What are you going to do this weekend?\nG: I’m planning to go to a zero waste shop. Do you know about zero waste shops?\nB: No, I don’t. Please tell me about ⓐthem.\nG: They don’t sell items in containers, so you can reduce waste. Why don’t you come with me?\nB: That sounds great! What can I buy there?\nG: You can buy a lot of items. For example, ⑥they have bags, shampoo, and some snacks.\nB: I see. I’m going to buy shampoo.\nG: ⓒ ______ , then. You can put the shampoo in it.\nB: Okay.\n\n08 위 대화의 밑줄 친 ⓐ와 ⑥가 가리키는 것이 바르게 짝지어진 것은?", "choices": ["Bora and her friend / items", "zero waste shops / containers", "items / zero waste shops", "zero waste shops / zero waste shops", "containers / Bora and her friend"]},
            {"n": 9, "kind": "mc", "index": 3, "explain": "③ You should bring your own container. (답지 22쪽)", "prompt": "[08-10] 다음 대화를 읽고, 물음에 답하시오.\nB: Hi, Bora. What are you going to do this weekend?\nG: I’m planning to go to a zero waste shop. Do you know about zero waste shops?\nB: No, I don’t. Please tell me about them.\nG: They don’t sell items in containers, so you can reduce waste. Why don’t you come with me?\nB: That sounds great! What can I buy there?\nG: You can buy a lot of items. For example, they have bags, shampoo, and some snacks.\nB: I see. I’m going to buy shampoo.\nG: ⓒ ______ , then. You can put the shampoo in it.\nB: Okay.\n\n09 위 대화의 빈칸 ⓒ에 들어갈 말로 가장 적절한 것은?", "choices": ["You can buy shampoo cheaply", "You can buy a lot of shampoo", "You should bring your own container", "You should pay in cash to buy shampoo", "You can also buy a bag or some snacks there"]},
            {"n": 10, "kind": "sentence", "accept": ["They will go to the zero waste shop together.", "They are going to go to the zero waste shop together."], "explain": "정답: They will go to the zero waste shop together. (답지 22쪽)", "prompt": "[08-10] 다음 대화를 읽고, 아래 질문에 대한 답을 아홉 단어의 영어 문장으로 쓰시오.\nB: Hi, Bora. What are you going to do this weekend?\nG: I’m planning to go to a zero waste shop.\n\nQ. What are they going to do this weekend?"},
            {"n": 11, "kind": "order", "bank": ["waste", "much", "water", "people", "too"], "sentence": "People waste too much water.", "explain": "정답: People waste too much water. (답지 22쪽)", "prompt": "[11-13] 다음 대화를 읽고, 물음에 답하시오.\nB: Look at this poster.\nG: It’s shocking. It looks like someone drank most of Earth’s water.\nB: Yes. ⓐ ______\n\n11 위 대화의 빈칸 ⓐ에 들어갈 말을 괄호 안의 단어들을 순서대로 바르게 배열하여 쓰시오. (대·소문자를 구분하고 구두점에 유의할 것)\n(waste / much / water / people / too)"},
            {"n": 12, "kind": "mc", "index": 5, "explain": "⑤ 양치할 때 수도꼭지를 트는 것은 물을 절약하는 방법이 아니다. (답지 22쪽)", "prompt": "[11-13] 다음 대화를 읽고, 물음에 답하시오.\nB: Look at this poster.\nG: It’s shocking. It looks like someone drank most of Earth’s water.\nB: Yes. ⓐ People waste too much water. What can we do to save water?\nG: We can do a lot of things. For example, ⓑ ______\nB: That sounds good.\n\n12 위 대화의 빈칸 ⓑ에 들어갈 말로 적절하지 않은 것은?", "choices": ["we can take quick showers", "we don’t play with water for fun", "we can collect rainwater for plants", "we can use leftover water for cleaning", "we can turn on the tap while brushing our teeth"]},
            {"n": 13, "kind": "mc", "index": 5, "explain": "⑤ saving water and how to reduce water waste. (답지 22쪽)", "prompt": "[11-13] 다음 대화를 읽고, 물음에 답하시오.\nB: Look at this poster.\nG: It’s shocking. It looks like someone drank most of Earth’s water.\nB: Yes. People waste too much water. What can we do to save water?\nG: We can do a lot of things. For example, we can take quick showers.\nB: That sounds good.\n\n13 What is the topic of the conversation above?", "choices": ["making clean water", "how to stop air pollution", "taking part in poster making", "how to prevent water pollution", "saving water and how to reduce water waste"]},
          ],
        },
      ],
    },
    "grammar-practice": {
      title: "Grammar 실전 문제",
      pages: "pp.146-147",
      sections: [
        {
          title: "Section A · Grammar 실전",
          dir: "알맞은 것을 고르시오.",
          rule: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
          answerMode: "choice",
          tag: "Choose · 고르기",
          items: [
            {"n": 1, "kind": "mc", "index": 2, "choices": ["be", "is", "does", "to be", "to do"], "prompt": "01 다음 빈칸에 들어갈 말로 가장 적절한 것은?\nDo you agree that studying ______ important?", "explain": "② is. 접속사 that 뒤에 「주어 + 동사」가 온다. (답지 22쪽)"},
            {"n": 2, "kind": "mc", "index": 1, "prompt": "02 다음 중 어법상 틀린 것은?\n① Love makes life beautifully.\n② Reading books makes me happy.\n③ We think that it will rain tomorrow.\n④ Music makes studying more enjoyable.\n⑤ The doctor said that you should get some rest.", "choices": ["Love makes life beautifully.", "Reading books makes me happy.", "We think that it will rain tomorrow.", "Music makes studying more enjoyable.", "The doctor said that you should get some rest."], "explain": "① beautifully → beautiful. (답지 22쪽)"},
            {"n": 3, "kind": "mc", "index": 4, "prompt": "03 다음 밑줄 친 부붐의 성격이 나머지와 다른 것은?\n① He said that he was tired.\n② I know that she is a good doctor.\n③ Do you know that he is my cousin?\n④ Do you know that woman over there?\n⑤ I heard that they moved to a new city.", "choices": ["He said that he was tired.", "I know that she is a good doctor.", "Do you know that he is my cousin?", "Do you know that woman over there?", "I heard that they moved to a new city."], "explain": "④ 접속사가 아니라 지시대명사 that. (답지 22쪽)"},
            {"n": 4, "kind": "fill", "accept": ["made", "easy"], "phrase": true, "prompt": "04 다음 우리말에 맞도록 빈칸에 들어갈 적절한 말을 쓰시오. (서술형)\n신생님은 시험을 쉽게 만들었다.\n→ The teacher ______ the test ______ .", "explain": "정답: made / easy. (답지 22쪽)"},
            {"n": 5, "kind": "sentence", "accept": ["I feel that this movie is boring."], "prompt": "05 다음 우리말에 맞도록 괄호 안의 단어들을 순서대로 배열하여 영작하시오. (서술형)\n나는 이 영화가 지루하다고 느껴.\n(this / that / I / feel / movie / boring / is)", "explain": "정답: I feel that this movie is boring. (답지 22쪽)"},
            {"n": 6, "kind": "mc", "index": 4, "prompt": "06 다음 어법상 올바른 문장의 개수는?\nⓐ He said the story was true.\nⓑ She made the baby happy.\nⓒ He forgot today was her birthday.\nⓓ Cooking together makes the meal deliciously.\n① 0개\n② 1개\n③ 2개\n④ 3개\n⑤ 4개", "choices": ["0개", "1개", "2개", "3개", "4개"], "explain": "④ 3개. ⓓ만 틀렸다(deliciously → delicious). (답지 22쪽)"},
            {"n": 7, "kind": "mc", "index": 5, "prompt": "07 다음 빈칸에 들어갈 말로 적절하지 않은 것은?\nExperience makes you ______ .\n① smart\n② strong\n③ brave\n④ great\n⑤ happily", "choices": ["smart", "strong", "brave", "great", "happily"], "explain": "⑤ happily는 부사. (답지 22쪽)"},
            {"n": 8, "kind": "fill", "accept": ["that"], "prompt": "08 다음 빈칸 ⓐ~ⓒ에 공통으로 들어갈 말을 한 단어로 쓰시오. (서술형)\n• I felt ⓐ ______ something is wrong.\n• Please do not touch ⓑ ______ button.\n• I said I didn’t like her, but ⓒ ______ isn’t true.", "explain": "정답: that. (답지 22쪽)"},
            {"n": 9, "kind": "mc", "index": 4, "prompt": "[09-10] 다음 대화의 빈칸에 들어갈 적절한 것을 고르시오.\n09 A: Do you know ______ tomorrow is Parents’ Day?\nB: Yes, I do. I will try to make them happy.\n① when\n② this\n③ where\n④ that\n⑤ which", "choices": ["when", "this", "where", "that", "which"], "explain": "④ that. (답지 22쪽)"},
            {"n": 10, "kind": "mc", "index": 2, "prompt": "[09-10] 다음 대화의 빈칸에 들어갈 적절한 것을 고르시오.\n10 A: The movie made the kids ______ .\nB: Yes, they liked the action scenes!\n① excite\n② excited\n③ exciting\n④ excitedly\n⑤ to be exciting", "choices": ["excite", "excited", "exciting", "excitedly", "to be exciting"], "explain": "② excited. (답지 22쪽)"},
            {"n": 11, "kind": "mc", "index": 3, "prompt": "11 다음 중 어법상 옳은 것끼리 바르게 짝지어진 것은?\nⓐ The book makes learning easily.\nⓑ Sunshine makes the day bright.\nⓒ Snacks don’t make us health.\nⓓ He doesn’t promise that he will help us.\nⓔ Do you believe him is telling the truth?\nⓕ The teacher said that the test would be hard.\n① ⓐ, ⓑ, ⓓ\n② ⓐ, ⓓ, ⓕ\n③ ⓑ, ⓓ, ⓕ\n④ ⓒ, ⓓ, ⓔ\n⑤ ⓓ, ⓔ, ⓕ", "choices": ["ⓐ, ⓑ, ⓓ", "ⓐ, ⓓ, ⓕ", "ⓑ, ⓓ, ⓕ", "ⓒ, ⓓ, ⓔ", "ⓓ, ⓔ, ⓕ"], "explain": "③ ⓑ, ⓓ, ⓕ. (답지 22쪽)"},
            {"n": 12, "kind": "mc", "index": 3, "prompt": "12 다음 빈칸 ⓐ~ⓒ에 들어갈 말이 바르게 짝지어진 것은?\n• The news made ⓐ ______ nervous.\n• He forgot ⓑ ______ met her before.\n• Do you think ⓒ ______ will come to the party?\n① he / me / them\n② me / him / he\n③ her / he / she\n④ they / she / me\n⑤ their / her / his", "choices": ["he / me / them", "me / him / he", "her / he / she", "they / she / me", "their / her / his"], "explain": "③ her / he / she. (답지 22쪽)"},
            {"n": 13, "kind": "mc", "index": 2, "prompt": "13 다음 중 어법상 틀린 것은?\n① I know that he is a good singer.\n② That we are friends are nice.\n③ My parents made my life happy.\n④ That he studies every day is true.\n⑤ Cold weather makes my hands dry.", "choices": ["I know that he is a good singer.", "That we are friends are nice.", "My parents made my life happy.", "That he studies every day is true.", "Cold weather makes my hands dry."], "explain": "② are → is. (답지 22쪽)"},
            {"n": 14, "kind": "sentence", "accept": ["This funny movie made me so happy."], "prompt": "14 다음 [조건]에 맞게 우리말을 바르게 영작하시오. (서술형)\n조건 1. funny와 so를 포함하고, 과거 시제로 쓸 것.\n조건 2. 총 7단어로 쓸 것.\n조건 3. 대·소문자 및 구두점에 유의할 것.\n\n이 재미있는 영화가 나를 정말 행복하게 만들었다.", "explain": "정답: This funny movie made me so happy. (답지 22쪽)"},
          ],
        },
      ],
    },
    "grammar-advanced": {
      title: "Grammar 심화 문제",
      pages: "pp.148-149",
      sections: [
        {
          title: "Section A · Grammar 심화",
          dir: "알맞은 것을 고르시오.",
          rule: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
          answerMode: "choice",
          tag: "Choose · 고르기",
          items: [
            {"n": 1, "kind": "mc", "index": 2, "prompt": "01 다음 빈칸에 들어갈 말로 가장 적절한 것은?\nThe long flight made me really ______ .\n① tire\n② tired\n③ to tire\n④ tiring\n⑤ to be tiring", "choices": ["tire", "tired", "to tire", "tiring", "to be tiring"], "explain": "② tired. (답지 23쪽)"},
            {"n": 2, "kind": "mc", "index": 2, "prompt": "02 다음 중 밑줄 친 부분을 생략할 수 없는 것은?\n① I heard that it will snow later.\n② I can’t believe that happened.\n③ She said that she was hungry.\n④ They hope that they will win the game.\n⑤ Do you know that she won the competition?", "choices": ["I heard that it will snow later.", "I can’t believe that happened.", "She said that she was hungry.", "They hope that they will win the game.", "Do you know that she won the competition?"], "explain": "② believe 뒤의 that은 주어 역할이라 생략할 수 없다. (답지 23쪽)"},
            {"n": 3, "kind": "mc", "index": 5, "prompt": "03 다음 빈칸에 들어갈 말로 적절하지 않은 것은?\nDo you know that exercise makes your body ______ ?\n① strong\n② fitter\n③ healthy\n④ stronger\n⑤ more healthily", "choices": ["strong", "fitter", "healthy", "stronger", "more healthily"], "explain": "⑤ 부사는 목적격 보어가 될 수 없다. (답지 23쪽)"},
            {"n": 4, "kind": "sentence", "accept": ["I believe reading makes learning easier."], "prompt": "04 다음 우리말에 맞도록 괄호 안의 단어들을 순서대로 바르게 배열하여 영작하시오. (서술형)\n• 나는 독서가 학습을 더 쉽게 만든다고 믿는다.\n(makes / easier / believe / learning / reading)", "explain": "정답: I believe reading makes learning easier. (답지 23쪽)"},
            {"n": 5, "kind": "mc", "index": 5, "prompt": "[05-06] 다음 중 어법상 틀린 문장을 고르시오.\n05\n① This sweater makes me warm.\n② I don’t think that this movie is interesting.\n③ The noise made the dog afraid.\n④ Do you think that this answer is correct?\n⑤ The beautiful sunset makes the sky colorfully.", "choices": ["This sweater makes me warm.", "I don’t think that this movie is interesting.", "The noise made the dog afraid.", "Do you think that this answer is correct?", "The beautiful sunset makes the sky colorfully."], "explain": "⑤ colorfully는 부사. (답지 23쪽)"},
            {"n": 6, "kind": "mc", "index": 4, "prompt": "[05-06] 다음 중 어법상 틀린 문장을 고르시오.\n06\n① I don’t think that we’re late.\n② The cold wind made my face red.\n③ The sunshine makes the garden warm.\n④ Did you check that sent he the email?\n⑤ She doesn’t understand that this is important.", "choices": ["I don’t think that we’re late.", "The cold wind made my face red.", "The sunshine makes the garden warm.", "Did you check that sent he the email?", "She doesn’t understand that this is important."], "explain": "④ 어순이 틀렸다. Did you check that he sent the email? (답지 23쪽)"},
            {"n": 7, "kind": "mc", "index": 1, "prompt": "07 다음 중 어법상 옳은 것은?\n① The music made the evening lovely.\n② We don’t know that the store open.\n③ The scary movie made he nervous.\n④ Did you know it he made a mistake?\n⑤ The news says that the storm coming.", "choices": ["The music made the evening lovely.", "We don’t know that the store open.", "The scary movie made he nervous.", "Did you know it he made a mistake?", "The news says that the storm coming."], "explain": "① The music made the evening lovely. (답지 23쪽)"},
            {"n": 8, "kind": "fill", "accept": ["made my mother angry"], "phrase": true, "prompt": "08 다음 그림의 내용과 일치하도록 질문에 대한 답을 괄호 안의 말을 이용하여 완성하시오. (서술형)\nQ: What do you think made your mother angry?\n(my bad grade on my test)\n→ I think ______ .", "explain": "정답: I think my bad grade on my test made my mother angry. (답지 23쪽)"},
            {"n": 9, "kind": "mc", "index": 4, "prompt": "09 다음 빈칸 ⓐ~ⓒ에 들어갈 말이 바르게 연결된 것은?\n• Her warm words made him ⓐ ______ .\n• Drinking water makes ⓑ ______ skin clear.\n• She remembers ⓒ ______ helped him before.\n① happy / you / she\n② happily / your / her\n③ happily / you / she\n④ happy / your / she\n⑤ happiness / you / her", "choices": ["happy / you / she", "happily / your / her", "happily / you / she", "happy / your / she", "happiness / you / her"], "explain": "④ happy / your / she. (답지 23쪽)"},
            {"n": 10, "kind": "mc", "index": 5, "prompt": "10 다음 중 어법상 옳은 것끼리 바르게 짝지어진 것은?\nⓐ The loud noise made the baby scare.\nⓑ She doesn’t think that the food good.\nⓒ The scientist said that water boils at 100°C.\nⓓ Did the teacher say there would be a test?\nⓔ His bad behavior made them upset.\n① ⓐ, ⓒ\n② ⓐ, ⓑ, ⓒ\n③ ⓑ, ⓒ, ⓓ, ⓔ\n④ ⓒ, ⓓ\n⑤ ⓒ, ⓓ, ⓔ", "choices": ["ⓐ, ⓒ", "ⓐ, ⓑ, ⓒ", "ⓑ, ⓒ, ⓓ, ⓔ", "ⓒ, ⓓ", "ⓒ, ⓓ, ⓔ"], "explain": "⑤ ⓒ, ⓓ, ⓔ. (답지 23쪽)"},
            {"n": 11, "kind": "fill", "accept": ["made them serious"], "phrase": true, "prompt": "11 다음 우리말과 일치하도록 빈칸에 알맞은 말을 쓰시오. (서술형)\n그 뉴스는 그들을 심각하게 만들었다.\n→ The news ______ ______ ______ .", "explain": "정답: made them serious. (답지 23쪽)"},
            {"n": 12, "kind": "mc", "index": 4, "prompt": "12 다음 우리말을 영어로 바르게 옮긴 것은?\n그녀는 파티에 늦을 거라고 말했다.\n① She said she will late for the party.\n② I heard that she is late for the party.\n③ I heard that she said late for the party.\n④ She said she would be late for the party.\n⑤ She said that she be late for the party.", "choices": ["She said she will late for the party.", "I heard that she is late for the party.", "I heard that she said late for the party.", "She said she would be late for the party.", "She said that she be late for the party."], "explain": "④ She said she would be late for the party. (답지 23쪽)"},
            {"n": 13, "kind": "fill", "accept": ["Teamwork makes projects successful."], "prompt": "13 다음 중 어법상 틀린 문장 두 개를 찾아 기호를 쓰고 바르게 고친 문장을 다시 쓰시오. (서술형)\nⓐ Teamwork makes projects successfully.\nⓑ The fast internet makes work easier.\nⓒ He didn’t realize that he made a mistake.\nⓓ Do you know that this rule work for everyone?\nⓔ Do you understand that hard work leads to success?\n\n(1) ⓐ번을 바르게 고친 문장을 쓰시오.", "explain": "정답: Teamwork makes projects successful. (답지 23쪽)"},
            {"n": 13, "kind": "fill", "accept": ["Do you know that this rule works for everyone?"], "prompt": "13 다음 중 어법상 틀린 문장 두 개를 찾아 기호를 쓰고 바르게 고친 문장을 다시 쓰시오. (서술형)\nⓐ Teamwork makes projects successfully.\nⓑ The fast internet makes work easier.\nⓒ He didn’t realize that he made a mistake.\nⓓ Do you know that this rule work for everyone?\nⓔ Do you understand that hard work leads to success?\n\n(2) ⓓ번을 바르게 고친 문장을 쓰시오.", "explain": "정답: Do you know that this rule works for everyone? (답지 23쪽)"},
            {"n": 14, "kind": "sentence", "accept": ["Did she say that the food was too salty?"], "prompt": "14 다음 [조건]에 맞게 우리말을 바르게 영작하시오. (서술형)\n조건 1. ‘말하다’라는 뜻의 동사는 say를 쓸 것.\n조건 2. 접속사 that을 사용할 것.\n조건 3. 총 9단어로 쓸 것.\n조건 4. 대·소문자 및 구두점에 유의할 것.\n\n그녀가 그 음식이 너무 짜다고 말했나요?", "explain": "정답: Did she say that the food was too salty? (답지 23쪽)"},
          ],
        },
      ],
    },
    "reading-content": {
      title: "Reading 내용 확인하기",
      pages: "p.152",
      sections: [
        {
          title: "Section A · 내용 확인",
          dir: "빈칸에 들어갈 말만 쓰시오.",
          rule: "빈칸에 들어갈 말만 쓰세요. 문장 전체는 쓰지 않아요.",
          answerMode: "words",
          tag: "Type · 빈칸 말만",
          items: [
            {"n": 1, "kind": "fill", "prompt": "01 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\nPollution is a big ① problem.\n(①의 뜻을 우리말로 쓰시오.)", "accept": ["문제"], "explain": "정답: 문제 (답지 24쪽)", "phrase": false},
            {"n": 2, "kind": "fill", "prompt": "02 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\n② (Luck), three superheroes are ③ (work) to protect the environment.", "accept": ["Luckily"], "explain": "정답: Luckily (답지 24쪽)", "phrase": false},
            {"n": 3, "kind": "fill", "prompt": "03 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\n② (Luck), three superheroes are ③ (work) to protect the environment.", "accept": ["working"], "explain": "정답: working (답지 24쪽)", "phrase": false},
            {"n": 4, "kind": "fill", "prompt": "04 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\nThey want to make the world ④ (깨끗하게). Will you join them?", "accept": ["clean"], "explain": "정답: clean (답지 24쪽)", "phrase": false},
            {"n": 5, "kind": "fill", "prompt": "05 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\nPeople waste ⑤ too many resources.\n(⑤의 뜻을 우리말로 쓰시오.)", "accept": ["너무"], "explain": "정답: 너무 (답지 24쪽)", "phrase": false},
            {"n": 6, "kind": "fill", "prompt": "06 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\nBut ⑥ (recycle) can save them.", "accept": ["recycling"], "explain": "정답: recycling (답지 24쪽)", "phrase": false},
            {"n": 7, "kind": "fill", "prompt": "07 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\n⑦ For example, recycling 1,000 kilograms of paper can save about 19 trees and 29,000 liters of water.\n(⑦의 뜻을 우리말로 쓰시오.)", "accept": ["예를 들어"], "explain": "정답: 예를 들어 (답지 24쪽)", "phrase": false},
            {"n": 8, "kind": "fill", "prompt": "08 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\nDo you want to be a wizard at ⑧ (recycle)?", "accept": ["recycling"], "explain": "정답: recycling (답지 24쪽)", "phrase": false},
            {"n": 9, "kind": "fill", "prompt": "09 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\nThen you should recycle ⑨ (proper)!", "accept": ["properly"], "explain": "정답: properly (답지 24쪽)", "phrase": false},
            {"n": 10, "kind": "fill", "prompt": "10 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\nPut plastic, paper, food waste, and glass in the ⑩ correct bins.\n(⑩에 들어갈 말을 영어로 쓰시오.)", "accept": ["right"], "explain": "정답: right (답지 24쪽)", "phrase": false},
            {"n": 11, "kind": "fill", "prompt": "11 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\nDraw a line ⑪ from each piece of waste to the right bin.\n(from A to B의 뜻을 우리말로 쓰시오.)", "accept": ["A부터 B까지"], "explain": "정답: A부터 B까지 (답지 24쪽)", "phrase": false},
            {"n": 12, "kind": "fill", "prompt": "12 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\nPeople ⑫ throw away clothes too often.\n(throw away의 뜻을 우리말로 쓰시오.)", "accept": ["(단지) 버리다", "버리다"], "explain": "정답: (단지) 버리다 (답지 24쪽)", "phrase": false},
            {"n": 13, "kind": "fill", "prompt": "13 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\nDid you know that some clothes ⑬ take over 200 years to break down?\n(take + 시간 + to부정사의 뜻을 우리말로 쓰시오.)", "accept": ["~하는 데 (시간이) ~만큼 걸리다"], "explain": "정답: ~하는 데 (시간이) ~만큼 걸리다 (답지 24쪽)", "phrase": false},
            {"n": 14, "kind": "fill", "prompt": "14 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\nWear your clothes ⑭ for a long time.\n(⑭의 뜻을 우리말로 쓰시오.)", "accept": ["~ 동안"], "explain": "정답: ~ 동안 (답지 24쪽)", "phrase": false},
            {"n": 15, "kind": "fill", "prompt": "15 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\nYou can also create new items from your old clothes! Let’s make old clothes ⑮ (use).", "accept": ["useful"], "explain": "정답: useful (답지 24쪽)", "phrase": false},
            {"n": 16, "kind": "fill", "prompt": "16 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\nThere ⑯ (be) some items below. What can you make with these old clothes?", "accept": ["are"], "explain": "정답: are (답지 24쪽)", "phrase": false},
            {"n": 17, "kind": "fill", "prompt": "17 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\nBut people waste a lot of water. It makes ⑰ (my) sad.", "accept": ["me"], "explain": "정답: me (답지 24쪽)", "phrase": false},
            {"n": 18, "kind": "fill", "prompt": "18 다음 글의 빈칸에 들어갈 적절한 말을 쓰시오.\n⑱ Turn off the water while you brush your teeth.\n(turn off의 뜻을 우리말로 쓰시오.)", "accept": ["끄다, 잠그다", "끄다"], "explain": "정답: 끄다, 잠그다 (답지 24쪽)", "phrase": false},
            {"n": 19, "kind": "fill", "prompt": "19 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\nAlso, make sure that you turn off the tap ⑲ (complete).", "accept": ["completely"], "explain": "정답: completely (답지 24쪽)", "phrase": false},
            {"n": 20, "kind": "fill", "prompt": "20 다음 글의 괄호 안의 낱말을 올바른 형태로 쓰시오.\nWhich are ways ⑳ (save) water and which are not?", "accept": ["to save"], "explain": "정답: to save (답지 24쪽)", "phrase": false},
          ],
        },
      ],
    },
    "reading-practice": {
      title: "Reading 실전 문제",
      pages: "pp.158-161",
      sections: [
        {
          title: "Section A · Reading 실전",
          dir: "알맞은 것을 고르시오.",
          rule: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
          answerMode: "choice",
          tag: "Choose · 고르기",
          items: [
            {"n": 1, "kind": "mc", "index": 4, "prompt": "[01-04] 다음 글을 읽고, 물음에 답하시오.\nPollution is a big problem. ⓐ(Luck), three superheroes are working to ⓑ ______ the environment. ⓒThey want to make the world cleanly. Will you join ⓓthem?\n\n01 윗글의 괄호 ⓐ에 들어갈 말로 가장 적절한 형태는?", "choices": ["Luck", "Lucks", "Lucky", "Luckily", "Luckless"], "explain": "④ Luckily. (답지 24쪽)"},
            {"n": 2, "kind": "mc", "index": 3, "prompt": "[01-04] 다음 글을 읽고, 물음에 답하시오.\nPollution is a big problem. ⓐ(Luck), three superheroes are working to ⓑ ______ the environment. ⓒThey want to make the world cleanly. Will you join ⓓthem?\n\n02 윗글의 빈칸 ⓑ에 들어갈 말로 가장 적절한 것은?", "choices": ["grow", "plant", "protect", "produce", "reduce"], "explain": "③ protect. (답지 24쪽)"},
            {"n": 3, "kind": "sentence", "accept": ["They want to make the world clean."], "prompt": "[01-04] 다음 글을 읽고, 물음에 답하시오.\nPollution is a big problem. ⓐ(Luck), three superheroes are working to ⓑ ______ the environment. ⓒThey want to make the world cleanly. Will you join ⓓthem?\n\n03 윗글의 밑줄 친 ⓒ에서 어법상 잘못된 부분을 찾아 바르게 고친 문장을 다시 쓰시오. (서술형)", "explain": "정답: They want to make the world clean. (답지 24쪽)"},
            {"n": 4, "kind": "fill", "accept": ["three superheroes"], "prompt": "[01-04] 다음 글을 읽고, 물음에 답하시오.\nPollution is a big problem. ⓐ(Luck), three superheroes are working to ⓑ ______ the environment. ⓒThey want to make the world cleanly. Will you join ⓓthem?\n\n04 윗글의 밑줄 친 ⓓ가 가리키는 말을 지문에서 찾아 두 단어로 쓰시오. (서술형)", "explain": "정답: three superheroes. (답지 24쪽)"},
            {"n": 5, "kind": "fill", "accept": ["properly"], "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n05 다음 영영풀이에 해당하는 단어를 윗글에서 찾아 쓰시오. (서술형)\nin the right or correct way", "explain": "정답: properly. (답지 24쪽)"},
            {"n": 6, "kind": "mc", "index": 2, "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n06 윗글의 밑줄 친 ⓐ와 같은 의미로 쓰인 것은?", "choices": ["He’s smart, and she is too.", "This dress is too big for me.", "I like apples, and I like bananas too.", "He wants ice cream, and I want some too.", "The movie was funny, and it was exciting too."], "explain": "② too = ‘너무’. (답지 24쪽)"},
            {"n": 7, "kind": "mc", "index": 4, "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n07 윗글의 빈칸 ⓑ에 들어갈 말로 가장 적절한 것은?", "choices": ["After all", "In contrast", "In short", "For example", "By the way"], "explain": "④ For example. (답지 24쪽)"},
            {"n": 8, "kind": "mc", "index": 2, "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n08 윗글의 밑줄 친 ⓒ와 같은 의미로 쓰이지 않은 것은?", "choices": ["It costs about ten dollars.", "He is worried about his exam.", "It takes about an hour to get there.", "The movie is about two hours long.", "There were about 50 people at the party."], "explain": "② about = ‘~에 대하여’. (답지 24쪽)"},
            {"n": 9, "kind": "mc", "index": 2, "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n09 윗글의 빈칸 ⓓ에 들어갈 말로 가장 적절한 것은?", "choices": ["be", "to be", "being", "been", "to being"], "explain": "② to be. (답지 24쪽)"},
            {"n": 10, "kind": "mc", "index": 1, "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n10 윗글의 빈칸 ⓔ에 들어갈 말로 가장 적절한 것은?", "choices": ["Put", "Puts", "Putting", "To put", "Have put"], "explain": "① Put. (답지 24쪽)"},
            {"n": 11, "kind": "mc", "index": 2, "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n11 윗글의 밑줄 친 ⓕ와 같은 의미로 쓰이지 않은 것은?", "choices": ["The correct key fits the lock.", "The teacher will correct our homework.", "The clock does not show the correct time.", "She gave a correct answer to the math problem.", "He didn’t know the correct way to solve the problem."], "explain": "② correct는 동사. (답지 24쪽)"},
            {"n": 12, "kind": "mc", "index": 3, "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n12 According to the passage, which one is true?", "choices": ["People are already saving a lot of resources.", "Recycling does not help to save resources.", "Recycling paper can save trees and water.", "Plastic items are not recyclable.", "Food waste is not recycled."], "explain": "③ Recycling paper can save trees and water. (답지 24쪽)"},
            {"n": 13, "kind": "mc", "index": 4, "prompt": "[05-13] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nPeople waste ⓐtoo many resources. But recycling can save them. ⓑ ______ , recycling 1,000 kilograms of paper can save ⓒabout 19 trees and 29,000 liters of water. Do you want ⓓ ______ a wizard at recycling? Then you should recycle properly! ⓔ ______ plastic, paper, food waste, and glass in the ⓕcorrect bins.\nLook at the waste below. Draw a line from each piece of waste to the right bin. Good job!\n\n13 Which one is the writer trying to express in the above passage?", "choices": ["Try to find new resources.", "Recycle paper to preserve wood.", "Recycle paper to reduce water waste.", "Save resources through proper recycling.", "Plant many trees to help the environment."], "explain": "④ Save resources through proper recycling. (답지 24쪽)"},
            {"n": 14, "kind": "mc", "index": 4, "prompt": "[14-19] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw away clothes too often. (1) ⓐThey become waste and hurt the environment. (2) Did you know ⓑthat some clothes take over 200 years to break down? (3) Don’t buy too many clothes. Wear your clothes for a long time. (4) ⓒ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. (5) What can you make with these old clothes? Match the old clothes with the correct new ⓓ ______ .\nNow you can be clever at fashion too!\n\n14 윗글의 (1)~(5) 중 다음 문장이 들어가기에 가장 적절한 곳은?\nYou can also create new items from your old clothes!", "choices": ["(1)", "(2)", "(3)", "(4)", "(5)"], "explain": "④ (답지 24쪽)"},
            {"n": 15, "kind": "fill", "accept": ["clothes"], "prompt": "[14-19] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw away clothes too often. (1) ⓐThey become waste and hurt the environment. (2) Did you know ⓑthat some clothes take over 200 years to break down? (3) Don’t buy too many clothes. Wear your clothes for a long time. (4) ⓒ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. (5) What can you make with these old clothes? Match the old clothes with the correct new ⓓ ______ .\nNow you can be clever at fashion too!\n\n15 윗글의 밑줄 친 ⓐ가 가리키는 말을 지문에서 찾아 한 단어로 쓰시오. (서술형)", "explain": "정답: clothes. (답지 24쪽)"},
            {"n": 16, "kind": "mc", "index": 3, "prompt": "[14-19] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw away clothes too often. (1) ⓐThey become waste and hurt the environment. (2) Did you know ⓑthat some clothes take over 200 years to break down? (3) Don’t buy too many clothes. Wear your clothes for a long time. (4) ⓒ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. (5) What can you make with these old clothes? Match the old clothes with the correct new ⓓ ______ .\nNow you can be clever at fashion too!\n\n16 윗글의 밑줄 친 ⓑ와 어법상 성격이 다른 것은?", "choices": ["They believe that he is honest.", "I feel that something is not right.", "She wasn’t interested in that movie.", "They don’t hope that it will rain tomorrow.", "Do you think that mistakes are part of learning?"], "explain": "③ that은 지시대명사. (답지 24쪽)"},
            {"n": 17, "kind": "mc", "index": 3, "prompt": "[14-19] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw away clothes too often. (1) ⓐThey become waste and hurt the environment. (2) Did you know ⓑthat some clothes take over 200 years to break down? (3) Don’t buy too many clothes. Wear your clothes for a long time. (4) ⓒ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. (5) What can you make with these old clothes? Match the old clothes with the correct new ⓓ ______ .\nNow you can be clever at fashion too!\n\n17 윗글의 밑줄 친 우리말 ⓒ를 영어로 바르게 옮긴 것은?", "choices": ["Let’s make old clothe use.", "Let’s makes old clothes use.", "Let’s make old clothes useful.", "Let’s makes old clothes useful.", "Let’s make old clothes usefully."], "explain": "③ Let’s make old clothes useful. (답지 24쪽)"},
            {"n": 18, "kind": "fill", "accept": ["items"], "prompt": "[14-19] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw away clothes too often. (1) ⓐThey become waste and hurt the environment. (2) Did you know ⓑthat some clothes take over 200 years to break down? (3) Don’t buy too many clothes. Wear your clothes for a long time. (4) ⓒ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. (5) What can you make with these old clothes? Match the old clothes with the correct new ⓓ ______ .\nNow you can be clever at fashion too!\n\n18 윗글의 빈칸 ⓓ에 들어갈 알맞은 말을 지문에서 찾아 쓰시오. (서술형)", "explain": "정답: items. (답지 24쪽)"},
            {"n": 19, "kind": "mc", "index": 5, "prompt": "[14-19] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw away clothes too often. (1) ⓐThey become waste and hurt the environment. (2) Did you know ⓑthat some clothes take over 200 years to break down? (3) Don’t buy too many clothes. Wear your clothes for a long time. (4) ⓒ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. (5) What can you make with these old clothes? Match the old clothes with the correct new ⓓ ______ .\nNow you can be clever at fashion too!\n\n19 윗글의 주제로 가장 적절한 것은?", "choices": ["keeping clothes from breaking down", "changing clothes often to look good", "buying cheap clothes and wearing them", "wearing expensive clothes for a long time", "reducing clothing waste to help the environment"], "explain": "⑤ reducing clothing waste to help the environment. (답지 24쪽)"},
            {"n": 20, "kind": "mc", "index": 3, "prompt": "[20-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nWater is very important. (1) We can’t live without ⓐit. (2) But people waste ⓑa lot of water. (3) How can we save water? (4) ⓒ ______ quick showers. ⓓ ______ off the water while you brush your teeth. (5) ⓔ또한, 여러분이 수도꼭지를 완전히 잠갔는지 확인하세요.\nLook at the pictures below. Which are ways to save water and which are not? Write an O or X on each picture.\nI’m sure that you got the right answers. You are amazing at saving water!\n\n20 윗글의 (1)~(5) 중 다음 문장이 들어가기에 가장 적절한 곳은?\nIt makes me sad.", "choices": ["(1)", "(2)", "(3)", "(4)", "(5)"], "explain": "③ (답지 24쪽)"},
            {"n": 21, "kind": "fill", "accept": ["water"], "prompt": "[20-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nWater is very important. (1) We can’t live without ⓐit. (2) But people waste ⓑa lot of water. (3) How can we save water? (4) ⓒ ______ quick showers. ⓓ ______ off the water while you brush your teeth. (5) ⓔ또한, 여러분이 수도꼭지를 완전히 잠갔는지 확인하세요.\nLook at the pictures below. Which are ways to save water and which are not? Write an O or X on each picture.\nI’m sure that you got the right answers. You are amazing at saving water!\n\n21 윗글의 밑줄 친 ⓐ가 가리키는 말을 지문에서 찾아 한 단어로 쓰시오. (서술형)", "explain": "정답: water. (답지 24쪽)"},
            {"n": 22, "kind": "mc", "index": 3, "prompt": "[20-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nWater is very important. (1) We can’t live without ⓐit. (2) But people waste ⓑa lot of water. (3) How can we save water? (4) ⓒ ______ quick showers. ⓓ ______ off the water while you brush your teeth. (5) ⓔ또한, 여러분이 수도꼭지를 완전히 잠갔는지 확인하세요.\nLook at the pictures below. Which are ways to save water and which are not? Write an O or X on each picture.\nI’m sure that you got the right answers. You are amazing at saving water!\n\n22 윗글의 밑줄 친 ⓑ와 바꿔 쓸 수 있는 것은?", "choices": ["little", "many", "much", "often", "a number of"], "explain": "③ much. (답지 24쪽)"},
            {"n": 23, "kind": "mc", "index": 4, "prompt": "[20-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nWater is very important. (1) We can’t live without ⓐit. (2) But people waste ⓑa lot of water. (3) How can we save water? (4) ⓒ ______ quick showers. ⓓ ______ off the water while you brush your teeth. (5) ⓔ또한, 여러분이 수도꼭지를 완전히 잠갔는지 확인하세요.\nLook at the pictures below. Which are ways to save water and which are not? Write an O or X on each picture.\nI’m sure that you got the right answers. You are amazing at saving water!\n\n23 윗글의 빈칸 ⓒ와 ⓓ에 들어갈 말로 적절한 것끼리 바르게 짝지어진 것은?", "choices": ["Get / Go", "Get / Turn", "Take / Go", "Take / Turn", "Take / Make"], "explain": "④ Take / Turn. (답지 24쪽)"},
            {"n": 24, "kind": "mc", "index": 3, "prompt": "[20-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nWater is very important. (1) We can’t live without ⓐit. (2) But people waste ⓑa lot of water. (3) How can we save water? (4) ⓒ ______ quick showers. ⓓ ______ off the water while you brush your teeth. (5) ⓔ또한, 여러분이 수도꼭지를 완전히 잠갔는지 확인하세요.\nLook at the pictures below. Which are ways to save water and which are not? Write an O or X on each picture.\nI’m sure that you got the right answers. You are amazing at saving water!\n\n24 Which of the following is the title of the above passage?", "choices": ["What Is Water Made of?", "The Importance of Water", "How Can We Save Water?", "Why Short Showers Are Good", "Find a Picture Painted Using Water"], "explain": "③ How Can We Save Water? (답지 24쪽)"},
            {"n": 25, "kind": "sentence", "accept": ["Also, make sure that you turn off the tap completely."], "prompt": "[20-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nWater is very important. (1) We can’t live without ⓐit. (2) But people waste ⓑa lot of water. (3) How can we save water? (4) ⓒ ______ quick showers. ⓓ ______ off the water while you brush your teeth. (5) ⓔ또한, 여러분이 수도꼭지를 완전히 잠갔는지 확인하세요.\nLook at the pictures below. Which are ways to save water and which are not? Write an O or X on each picture.\nI’m sure that you got the right answers. You are amazing at saving water!\n\n25 윗글의 밑줄 친 우리말 ⓔ를 [조건]에 맞게 영작하시오. (서술형)\n조건 1. 주어진 단어들을 모두 사용할 것.\n조건 2. 필요시 어형을 바꿀 수 있음.\n조건 3. 총 9단어로 쓸 것.\n\nAlso, ______ .\ntap  complete  turn  make  that  sure", "explain": "정답: Also, make sure that you turn off the tap completely. (답지 24쪽)"},
          ],
        },
      ],
    },
    "reading-lexgram": {
      title: "Reading 적절한 어휘·어법 고르기",
      pages: "p.153",
      sections: [
        {
          title: "Section A · 괄호",
          dir: "괄호 안에서 문맥상 적절한 것을 고르시오.",
          rule: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
          answerMode: "choice",
          tag: "Choose · 고르기",
          items: [
            {"n": 1, "kind": "mc", "index": 1, "prompt": "01 Pollution [is / are] a big problem.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["is", "are"], "explain": "정답: is (답지 24쪽)"},
            {"n": 2, "kind": "mc", "index": 2, "prompt": "02 [Lucky / Luckily], three superheroes are working [protected / to protect] the environment.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["Lucky", "Luckily"], "explain": "정답: Luckily (답지 24쪽)"},
            {"n": 2, "kind": "mc", "index": 2, "prompt": "02 [Lucky / Luckily], three superheroes are working [protected / to protect] the environment.\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["protected", "to protect"], "explain": "정답: to protect (답지 24쪽)"},
            {"n": 3, "kind": "mc", "index": 2, "prompt": "03 They want [making / to make] the world clean. Will you join [they / them]?\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["making", "to make"], "explain": "정답: to make (답지 24쪽)"},
            {"n": 3, "kind": "mc", "index": 2, "prompt": "03 They want [making / to make] the world clean. Will you join [they / them]?\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["they", "them"], "explain": "정답: them (답지 24쪽)"},
            {"n": 4, "kind": "mc", "index": 1, "prompt": "04 Hi! [I’m / It’s] Recycle Wizard.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["I’m", "It’s"], "explain": "정답: I’m (답지 24쪽)"},
            {"n": 5, "kind": "mc", "index": 1, "prompt": "05 People [waste / wastes] too many resources. But [recycle / recycling] can save them.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["waste", "wastes"], "explain": "정답: waste (답지 24쪽)"},
            {"n": 5, "kind": "mc", "index": 2, "prompt": "05 People [waste / wastes] too many resources. But [recycle / recycling] can save them.\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["recycle", "recycling"], "explain": "정답: recycling (답지 24쪽)"},
            {"n": 6, "kind": "mc", "index": 2, "prompt": "06 For example, [recycle / recycling] 1,000 kilograms of paper can [save / safe] about 19 trees and 29,000 liters of water.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["recycle", "recycling"], "explain": "정답: recycling (답지 24쪽)"},
            {"n": 6, "kind": "mc", "index": 1, "prompt": "06 For example, [recycle / recycling] 1,000 kilograms of paper can [save / safe] about 19 trees and 29,000 liters of water.\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["save", "safe"], "explain": "정답: save (답지 24쪽)"},
            {"n": 7, "kind": "mc", "index": 2, "prompt": "07 Do you want to be a wizard at [recycle / recycling]? Then you should recycle properly!\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["recycle", "recycling"], "explain": "정답: recycling (답지 24쪽)"},
            {"n": 8, "kind": "mc", "index": 1, "prompt": "08 [Put / Putting] plastic, paper, food waste, and glass [at / in] the correct bins.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["Put", "Putting"], "explain": "정답: Put (답지 24쪽)"},
            {"n": 8, "kind": "mc", "index": 2, "prompt": "08 [Put / Putting] plastic, paper, food waste, and glass [at / in] the correct bins.\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["at", "in"], "explain": "정답: in (답지 24쪽)"},
            {"n": 9, "kind": "mc", "index": 1, "prompt": "09 Look at the [waste / wasting] below. Draw a line from each piece of waste [to / with] the right bin.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["waste", "wasting"], "explain": "정답: waste (답지 24쪽)"},
            {"n": 9, "kind": "mc", "index": 1, "prompt": "09 Look at the [waste / wasting] below. Draw a line from each piece of waste [to / with] the right bin.\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["to", "with"], "explain": "정답: to (답지 24쪽)"},
            {"n": 10, "kind": "mc", "index": 1, "prompt": "10 [Good / Well] job!\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["Good", "Well"], "explain": "정답: Good (답지 24쪽)"},
            {"n": 11, "kind": "mc", "index": 1, "prompt": "11 [I’m / That’s] Fashion Clever.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["I’m", "That’s"], "explain": "정답: I’m (답지 24쪽)"},
            {"n": 12, "kind": "mc", "index": 2, "prompt": "12 People throw away clothes too often. [It / They] become waste and hurt the environment.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["It", "They"], "explain": "정답: They (답지 24쪽)"},
            {"n": 13, "kind": "mc", "index": 2, "prompt": "13 Did you know [this / that] some clothes take over 200 years to break down?\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["this", "that"], "explain": "정답: that (답지 24쪽)"},
            {"n": 14, "kind": "mc", "index": 1, "prompt": "14 Don’t buy too many clothes. Wear your clothes [for / during] a long time.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["for", "during"], "explain": "정답: for (답지 24쪽)"},
            {"n": 15, "kind": "mc", "index": 1, "prompt": "15 You can [also / too] create new items from your old clothes!\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["also", "too"], "explain": "정답: also (답지 24쪽)"},
            {"n": 16, "kind": "mc", "index": 1, "prompt": "16 Let’s make old clothes [useful / usefully].\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["useful", "usefully"], "explain": "정답: useful (답지 24쪽)"},
            {"n": 17, "kind": "mc", "index": 2, "prompt": "17 There [is / are] some items below. What can you make with [that / these] old clothes?\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["is", "are"], "explain": "정답: are (답지 24쪽)"},
            {"n": 17, "kind": "mc", "index": 2, "prompt": "17 There [is / are] some items below. What can you make with [that / these] old clothes?\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["that", "these"], "explain": "정답: these (답지 24쪽)"},
            {"n": 18, "kind": "mc", "index": 1, "prompt": "18 [Match / Matching] the old clothes with the correct new items.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["Match", "Matching"], "explain": "정답: Match (답지 24쪽)"},
            {"n": 19, "kind": "mc", "index": 1, "prompt": "19 Now you can be [clever / cleverly] at fashion too!\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["clever", "cleverly"], "explain": "정답: clever (답지 24쪽)"},
            {"n": 20, "kind": "mc", "index": 2, "prompt": "20 Hi! [It’s / I’m] Water Saver!\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["It’s", "I’m"], "explain": "정답: I’m (답지 24쪽)"},
            {"n": 21, "kind": "mc", "index": 1, "prompt": "21 Water is very important. We can’t live without [it / them].\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["it", "them"], "explain": "정답: it (답지 24쪽)"},
            {"n": 22, "kind": "mc", "index": 2, "prompt": "22 But people waste [many / a lot of] water. It makes me [sad / sadly].\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["many", "a lot of"], "explain": "정답: a lot of (답지 24쪽)"},
            {"n": 22, "kind": "mc", "index": 1, "prompt": "22 But people waste [many / a lot of] water. It makes me [sad / sadly].\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["sad", "sadly"], "explain": "정답: sad (답지 24쪽)"},
            {"n": 23, "kind": "mc", "index": 1, "prompt": "23 How can we [save / saving] water?\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["save", "saving"], "explain": "정답: save (답지 24쪽)"},
            {"n": 24, "kind": "mc", "index": 1, "prompt": "24 [Take / Taking] quick showers. Turn off the water [while / during] you brush your teeth.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["Take", "Taking"], "explain": "정답: Take (답지 24쪽)"},
            {"n": 24, "kind": "mc", "index": 1, "prompt": "24 [Take / Taking] quick showers. Turn off the water [while / during] you brush your teeth.\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["while", "during"], "explain": "정답: while (답지 24쪽)"},
            {"n": 25, "kind": "mc", "index": 2, "prompt": "25 Also, make sure [this / that] you turn off the tap [complete / completely].\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["this", "that"], "explain": "정답: that (답지 24쪽)"},
            {"n": 25, "kind": "mc", "index": 2, "prompt": "25 Also, make sure [this / that] you turn off the tap [complete / completely].\n\n2번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["complete", "completely"], "explain": "정답: completely (답지 24쪽)"},
            {"n": 26, "kind": "mc", "index": 2, "prompt": "26 Look at the pictures below. Which [is / are] ways to save water and which are not?\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["is", "are"], "explain": "정답: are (답지 24쪽)"},
            {"n": 27, "kind": "mc", "index": 1, "prompt": "27 [Write / Writing] an O or X on each picture.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["Write", "Writing"], "explain": "정답: Write (답지 24쪽)"},
            {"n": 28, "kind": "mc", "index": 1, "prompt": "28 I’m sure [that / what] you got the right answers.\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["that", "what"], "explain": "정답: that (답지 24쪽)"},
            {"n": 29, "kind": "mc", "index": 2, "prompt": "29 You are amazing at [save / saving] water!\n\n1번째 괄호에 들어갈 알맞은 것을 고르시오.", "choices": ["save", "saving"], "explain": "정답: saving (답지 24쪽)"},
          ],
        },
      ],
    },
    "reading-advanced": {
      title: "Reading 심화 문제",
      pages: "pp.162-165",
      sections: [
        {
          title: "Section A · Reading 심화",
          dir: "알맞은 것을 고르시오.",
          rule: "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.",
          answerMode: "choice",
          tag: "Choose · 고르기",
          items: [
            {"n": 1, "kind": "mc", "index": 4, "prompt": "[01-03] 다음 글을 읽고, 물음에 답하시오.\nⓐ ______ is a big problem. Luckily, three superheroes are working ⓑ(protect) the environment. They want ⓒ(make) the world clean. ⓓ ______ you join them?\n\n01 윗글의 빈칸 ⓐ에 들어갈 말로 다음 영영풀이에 해당하는 단어는?\ndirty or harmful things in the air, water, or land", "choices": ["Resource", "Activity", "Movement", "Pollution", "Temperature"], "explain": "④ Pollution. (답지 25쪽)"},
            {"n": 2, "kind": "mc", "index": 3, "prompt": "[01-03] 다음 글을 읽고, 물음에 답하시오.\nⓐ ______ is a big problem. Luckily, three superheroes are working ⓑ(protect) the environment. They want ⓒ(make) the world clean. ⓓ ______ you join them?\n\n02 윗글의 괄호 ⓑ와 ⓒ에 들어갈 말이 적절한 형태로 바르게 짝지어진 것은?", "choices": ["protect / make", "protected / making", "protecting / made", "to protect / making", "to protect / to make"], "explain": "③ protecting / made — ⓒ는 목적격 보어로 형용사 clean이 오므로 make. (답지 25쪽)"},
            {"n": 3, "kind": "mc", "index": 4, "prompt": "[01-03] 다음 글을 읽고, 물음에 답하시오.\nⓐ ______ is a big problem. Luckily, three superheroes are working ⓑ(protect) the environment. They want ⓒ(make) the world clean. ⓓ ______ you join them?\n\n03 윗글의 빈칸 ⓓ에 들어갈 말로 가장 적절한 것은?", "choices": ["Are", "Were", "Will", "Have", "Does"], "explain": "④ Have you join them? — 답지 확인: Have. (답지 25쪽)"},
            {"n": 4, "kind": "sentence", "accept": ["People waste too many resources."], "prompt": "[04-11] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nⓐ사람들은 너무 많은 자원을 낭비해요. (1) But recycling can save them. (2) ⓑFor example, recycling 1,000 ⓒ ______ of paper can save about 19 trees and 29,000 ⓓ ______ of water. (3) Do you want to be a wizard at recycling? (4) Put plastic, paper, food waste, and glass in the correct bins. (5)\nLook at the waste below. Draw a line from each piece of waste to the ⓔright bin.\nⓕGood job!\n\n04 윗글의 밑줄 친 ⓐ의 우리말을 [조건]에 맞게 영작하시오. (서술형)\n조건 1. waste와 many를 사용할 것.\n조건 2. 총 5단어로 쓸 것.", "explain": "정답: People waste too many resources. (답지 25쪽)"},
            {"n": 5, "kind": "mc", "index": 4, "prompt": "[04-11] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nⓐ사람들은 너무 많은 자원을 낭비해요. (1) But recycling can save them. (2) ⓑFor example, recycling 1,000 ⓒ ______ of paper can save about 19 trees and 29,000 ⓓ ______ of water. (3) Do you want to be a wizard at recycling? (4) Put plastic, paper, food waste, and glass in the correct bins. (5)\nLook at the waste below. Draw a line from each piece of waste to the ⓔright bin.\nⓕGood job!\n\n05 윗글의 (1)~(5) 중 다음 문장이 들어가기에 가장 적절한 곳은?\nThen you should recycle properly!", "choices": ["(1)", "(2)", "(3)", "(4)", "(5)"], "explain": "④ (답지 25쪽)"},
            {"n": 6, "kind": "mc", "index": 3, "prompt": "[04-11] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nⓐ사람들은 너무 많은 자원을 낭비해요. (1) But recycling can save them. (2) ⓑFor example, recycling 1,000 ⓒ ______ of paper can save about 19 trees and 29,000 ⓓ ______ of water. (3) Do you want to be a wizard at recycling? (4) Put plastic, paper, food waste, and glass in the correct bins. (5)\nLook at the waste below. Draw a line from each piece of waste to the ⓔright bin.\nⓕGood job!\n\n06 윗글의 밑줄 친 ⓑ와 바꿔 쓸 수 있는 것은?", "choices": ["In addition", "In short", "For instance", "On the other hand", "At the same time"], "explain": "③ For instance. (답지 25쪽)"},
            {"n": 7, "kind": "mc", "index": 5, "prompt": "[04-11] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nⓐ사람들은 너무 많은 자원을 낭비해요. (1) But recycling can save them. (2) ⓑFor example, recycling 1,000 ⓒ ______ of paper can save about 19 trees and 29,000 ⓓ ______ of water. (3) Do you want to be a wizard at recycling? (4) Put plastic, paper, food waste, and glass in the correct bins. (5)\nLook at the waste below. Draw a line from each piece of waste to the ⓔright bin.\nⓕGood job!\n\n07 윗글의 빈칸 ⓒ와 ⓓ에 들어갈 적절한 말로 바르게 짝지어진 것은?", "choices": ["liters / kilometers", "kilometers / kilograms", "inches / liters", "liters / kilograms", "kilograms / liters"], "explain": "⑤ kilograms / liters. (답지 25쪽)"},
            {"n": 8, "kind": "fill", "accept": ["correct"], "prompt": "[04-11] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nⓐ사람들은 너무 많은 자원을 낭비해요. (1) But recycling can save them. (2) ⓑFor example, recycling 1,000 ⓒ ______ of paper can save about 19 trees and 29,000 ⓓ ______ of water. (3) Do you want to be a wizard at recycling? (4) Put plastic, paper, food waste, and glass in the correct bins. (5)\nLook at the waste below. Draw a line from each piece of waste to the ⓔright bin.\nⓕGood job!\n\n08 윗글의 밑줄 친 ⓔ와 같은 의미로 쓰인 말을 지문에서 찾아 쓰시오. (서술형)", "explain": "정답: correct. (답지 25쪽)"},
            {"n": 9, "kind": "mc", "index": 2, "prompt": "[04-11] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nⓐ사람들은 너무 많은 자원을 낭비해요. (1) But recycling can save them. (2) ⓑFor example, recycling 1,000 ⓒ ______ of paper can save about 19 trees and 29,000 ⓓ ______ of water. (3) Do you want to be a wizard at recycling? (4) Put plastic, paper, food waste, and glass in the correct bins. (5)\nLook at the waste below. Draw a line from each piece of waste to the ⓔright bin.\nⓕGood job!\n\n09 윗글의 밑줄 친 ⓕ와 바꿔 쓸 수 있는 것은?", "choices": ["Good luck!", "Well done!", "No problem!", "You’re welcome!", "I feel the same way!"], "explain": "② Well done! (답지 25쪽)"},
            {"n": 10, "kind": "mc", "index": 3, "prompt": "[04-11] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nⓐ사람들은 너무 많은 자원을 낭비해요. (1) But recycling can save them. (2) ⓑFor example, recycling 1,000 ⓒ ______ of paper can save about 19 trees and 29,000 ⓓ ______ of water. (3) Do you want to be a wizard at recycling? (4) Put plastic, paper, food waste, and glass in the correct bins. (5)\nLook at the waste below. Draw a line from each piece of waste to the ⓔright bin.\nⓕGood job!\n\n10 윗글의 내용을 요약한 것으로 적절한 것은?", "choices": ["Plastic products must be recycled.", "You must plant a lot of trees to make paper.", "Recycling properly can save a lot of resources.", "Saving paper is a way to protect the environment.", "Making paper uses a lot of trees, so planting more helps replace them."], "explain": "③ Recycling properly can save a lot of resources. (답지 25쪽)"},
            {"n": 11, "kind": "mc", "index": 2, "prompt": "[04-11] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Recycle Wizard.\nⓐ사람들은 너무 많은 자원을 낭비해요. (1) But recycling can save them. (2) ⓑFor example, recycling 1,000 ⓒ ______ of paper can save about 19 trees and 29,000 ⓓ ______ of water. (3) Do you want to be a wizard at recycling? (4) Put plastic, paper, food waste, and glass in the correct bins. (5)\nLook at the waste below. Draw a line from each piece of waste to the ⓔright bin.\nⓕGood job!\n\n11 According to the passage, which question can be answered?", "choices": ["How many trees do we need to plant?", "What should we do to save resources?", "How much water should we recycle?", "Why is planting a lot of trees a good thing?", "Where do recycled items go after we recycle them?"], "explain": "② What should we do to save resources? (답지 25쪽)"},
            {"n": 12, "kind": "mc", "index": 2, "prompt": "[12-18] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw ⓐ ______ clothes too often. They become waste and ⓑhurt the environment. Did you know that some clothes ⓒ ______ over 200 years to break down? Don’t buy too many clothes. Wear your clothes ⓓ ______ a long time. ⓔYou can create new items from your old clothes! ⓕ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. What can you make with these old clothes? Match the old clothes with the correct new items.\nNow you can be clever at fashion too!\n\n12 윗글의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?", "choices": ["off", "away", "out", "back", "around"], "explain": "② away (throw away). (답지 25쪽)"},
            {"n": 13, "kind": "mc", "index": 4, "prompt": "[12-18] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw ⓐ ______ clothes too often. They become waste and ⓑhurt the environment. Did you know that some clothes ⓒ ______ over 200 years to break down? Don’t buy too many clothes. Wear your clothes ⓓ ______ a long time. ⓔYou can create new items from your old clothes! ⓕ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. What can you make with these old clothes? Match the old clothes with the correct new items.\nNow you can be clever at fashion too!\n\n13 윗글의 밑줄 친 ⓑ와 쓰임이 같은 것은?", "choices": ["The hurt bird struggled to fly.", "She felt hurt by his rude words.", "His hurt expression showed his pain.", "Lying to your friends can hurt them.", "She looks hurt after falling off her bike."], "explain": "④ hurt는 동사. 나머지는 형용사. (답지 25쪽)"},
            {"n": 14, "kind": "mc", "index": 1, "prompt": "[12-18] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw ⓐ ______ clothes too often. They become waste and ⓑhurt the environment. Did you know that some clothes ⓒ ______ over 200 years to break down? Don’t buy too many clothes. Wear your clothes ⓓ ______ a long time. ⓔYou can create new items from your old clothes! ⓕ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. What can you make with these old clothes? Match the old clothes with the correct new items.\nNow you can be clever at fashion too!\n\n14 윗글의 빈칸 ⓒ에 들어갈 말로 가장 적절한 것은?", "choices": ["take", "get", "getting", "taking", "to take"], "explain": "① take. (답지 25쪽)"},
            {"n": 15, "kind": "mc", "index": 1, "prompt": "[12-18] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw ⓐ ______ clothes too often. They become waste and ⓑhurt the environment. Did you know that some clothes ⓒ ______ over 200 years to break down? Don’t buy too many clothes. Wear your clothes ⓓ ______ a long time. ⓔYou can create new items from your old clothes! ⓕ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. What can you make with these old clothes? Match the old clothes with the correct new items.\nNow you can be clever at fashion too!\n\n15 윗글의 빈칸 ⓓ에 들어갈 말로 가장 적절한 것은?", "choices": ["for", "about", "while", "during", "around"], "explain": "① for. (답지 25쪽)"},
            {"n": 16, "kind": "mc", "index": 2, "prompt": "[12-18] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw ⓐ ______ clothes too often. They become waste and ⓑhurt the environment. Did you know that some clothes ⓒ ______ over 200 years to break down? Don’t buy too many clothes. Wear your clothes ⓓ ______ a long time. ⓔYou can create new items from your old clothes! ⓕ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. What can you make with these old clothes? Match the old clothes with the correct new items.\nNow you can be clever at fashion too!\n\n16 윗글의 밑줄 친 ⓔ의 문장에서 also가 들어갈 자리로 알맞은 곳은?\nYou ①can ②create ③new ④items from your ⑤old clothes!", "choices": ["①", "②", "③", "④", "⑤"], "explain": "② You can also create …. (답지 25쪽)"},
            {"n": 17, "kind": "sentence", "accept": ["Let’s make old clothes useful."], "prompt": "[12-18] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw ⓐ ______ clothes too often. They become waste and ⓑhurt the environment. Did you know that some clothes ⓒ ______ over 200 years to break down? Don’t buy too many clothes. Wear your clothes ⓓ ______ a long time. ⓔYou can create new items from your old clothes! ⓕ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. What can you make with these old clothes? Match the old clothes with the correct new items.\nNow you can be clever at fashion too!\n\n17 윗글의 밑줄 친 ⓕ의 우리말을 [조건]에 맞게 영작하시오. (서술형)\n조건 1. Let’s로 시작할 것.\n조건 2. 동사는 make를 사용할 것.\n조건 3. 총 5단어의 문장이 되도록 할 것.", "explain": "정답: Let’s make old clothes useful. (답지 25쪽)"},
            {"n": 18, "kind": "mc", "index": 5, "prompt": "[12-18] 다음 글을 읽고, 물음에 답하시오.\nI’m Fashion Clever.\nPeople throw ⓐ ______ clothes too often. They become waste and ⓑhurt the environment. Did you know that some clothes ⓒ ______ over 200 years to break down? Don’t buy too many clothes. Wear your clothes ⓓ ______ a long time. ⓔYou can create new items from your old clothes! ⓕ헌 옷을 유용하게 만들어 봅시다.\nThere are some items below. What can you make with these old clothes? Match the old clothes with the correct new items.\nNow you can be clever at fashion too!\n\n18 윗글을 다음과 같이 한 문장으로 요약할 때 빈칸 (a)와 (b)에 들어갈 말로 알맞게 짝지어진 것은?\nThrowing away (a) ______ hurts the environment, so you can make (b) ______ from them.", "choices": ["some waste / new clothes", "simple fashion / colorful fashion", "many clothes / a few items", "old clothes / old items", "old clothes / new items"], "explain": "⑤ old clothes / new items. (답지 25쪽)"},
            {"n": 19, "kind": "fill", "accept": ["Water"], "prompt": "[19-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nⓐ ______ is very important. We can’t live without it. But people waste a lot of water. ⓑIt makes me sad. How can we ⓒsave water? Take quick showers. Turn off the water ⓓ ______ you brush your teeth. Also, make sure that you turn off the tap completely.\nLook at the pictures below. Which are ways to save water and ⓔwhich are not? Write an O or X on each picture.\nⓕ나는 여러분이 정답을 맞혔다고 확신해요.\nYou are amazing at ⓖ(save) water!\n\n19 윗글의 빈칸 ⓐ에 들어갈 알맞은 말을 지문에서 찾아 한 단어로 쓰시오. (대·소문자 구분할 것) (서술형)", "explain": "정답: Water. (답지 25쪽)"},
            {"n": 20, "kind": "fill", "accept": ["사람들이 많은 물을 낭비하는 것"], "phrase": true, "prompt": "[19-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nⓐ ______ is very important. We can’t live without it. But people waste a lot of water. ⓑIt makes me sad. How can we ⓒsave water? Take quick showers. Turn off the water ⓓ ______ you brush your teeth. Also, make sure that you turn off the tap completely.\nLook at the pictures below. Which are ways to save water and ⓔwhich are not? Write an O or X on each picture.\nⓕ나는 여러분이 정답을 맞혔다고 확신해요.\nYou are amazing at ⓖ(save) water!\n\n20 윗글의 밑줄 친 ⓑ가 나타내는 말을 13자 내외의 우리말로 쓰시오. (서술형)", "explain": "정답: 사람들이 많은 물을 낭비하는 것 (답지 25쪽)"},
            {"n": 21, "kind": "mc", "index": 5, "prompt": "[19-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nⓐ ______ is very important. We can’t live without it. But people waste a lot of water. ⓑIt makes me sad. How can we ⓒsave water? Take quick showers. Turn off the water ⓓ ______ you brush your teeth. Also, make sure that you turn off the tap completely.\nLook at the pictures below. Which are ways to save water and ⓔwhich are not? Write an O or X on each picture.\nⓕ나는 여러분이 정답을 맞혔다고 확신해요.\nYou are amazing at ⓖ(save) water!\n\n21 윗글의 밑줄 친 ⓒ와 같은 의미로 쓰인 것은?", "choices": ["He saved me from falling.", "He saved the cat from the tree.", "Police saved the people from a fire.", "The hero saved the town from danger.", "They save money by cooking at home."], "explain": "⑤ save = 아끼다. (답지 25쪽)"},
            {"n": 22, "kind": "mc", "index": 3, "prompt": "[19-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nⓐ ______ is very important. We can’t live without it. But people waste a lot of water. ⓑIt makes me sad. How can we ⓒsave water? Take quick showers. Turn off the water ⓓ ______ you brush your teeth. Also, make sure that you turn off the tap completely.\nLook at the pictures below. Which are ways to save water and ⓔwhich are not? Write an O or X on each picture.\nⓕ나는 여러분이 정답을 맞혔다고 확신해요.\nYou are amazing at ⓖ(save) water!\n\n22 윗글의 빈칸 ⓓ에 들어갈 말로 가장 적절한 것은?", "choices": ["what", "which", "while", "where", "during"], "explain": "③ while. (답지 25쪽)"},
            {"n": 23, "kind": "sentence", "accept": ["which are not ways to save water"], "prompt": "[19-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nⓐ ______ is very important. We can’t live without it. But people waste a lot of water. ⓑIt makes me sad. How can we ⓒsave water? Take quick showers. Turn off the water ⓓ ______ you brush your teeth. Also, make sure that you turn off the tap completely.\nLook at the pictures below. Which are ways to save water and ⓔwhich are not? Write an O or X on each picture.\nⓕ나는 여러분이 정답을 맞혔다고 확신해요.\nYou are amazing at ⓖ(save) water!\n\n23 윗글의 밑줄 친 ⓔ에서 생략된 부분을 넣어 문장을 다시 쓰시오. (서술형)", "explain": "정답: which are not ways to save water. (답지 25쪽)"},
            {"n": 24, "kind": "sentence", "accept": ["I’m sure that you got the right answers.", "I am sure that you got the right answers."], "prompt": "[19-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nⓐ ______ is very important. We can’t live without it. But people waste a lot of water. ⓑIt makes me sad. How can we ⓒsave water? Take quick showers. Turn off the water ⓓ ______ you brush your teeth. Also, make sure that you turn off the tap completely.\nLook at the pictures below. Which are ways to save water and ⓔwhich are not? Write an O or X on each picture.\nⓕ나는 여러분이 정답을 맞혔다고 확신해요.\nYou are amazing at ⓖ(save) water!\n\n24 윗글의 밑줄 친 ⓕ의 우리말을 다음 [조건]에 맞게 영작하시오. (서술형)\n조건 1. sure, right를 사용할 것.\n조건 2. 접속사 that을 사용할 것.\n조건 3. 총 8단어로 쓸 것.\n조건 4. 대·소문자 및 구두점에 유의할 것.", "explain": "정답: I’m sure that you got the right answers. (답지 25쪽)"},
            {"n": 25, "kind": "mc", "index": 4, "prompt": "[19-25] 다음 글을 읽고, 물음에 답하시오.\nHi! I’m Water Saver!\nⓐ ______ is very important. We can’t live without it. But people waste a lot of water. ⓑIt makes me sad. How can we ⓒsave water? Take quick showers. Turn off the water ⓓ ______ you brush your teeth. Also, make sure that you turn off the tap completely.\nLook at the pictures below. Which are ways to save water and ⓔwhich are not? Write an O or X on each picture.\nⓕ나는 여러분이 정답을 맞혔다고 확신해요.\nYou are amazing at ⓖ(save) water!\n\n25 윗글의 괄호 ⓖ에 들어갈 적절한 형태는?", "choices": ["save", "saved", "saves", "saving", "to save"], "explain": "④ saving (전치사 at 뒤). (답지 25쪽)"},
          ],
        },
      ],
    },
    "writing-finish": {
      title: "서술형 끝내기",
      pages: "pp.168-171",
      sections: [
        {
          title: "Section A · 서술형",
          dir: "빈칸에 들어갈 말만 쓰시오.",
          rule: "빈칸에 들어갈 말만 쓰세요. 문장 전체는 쓰지 않아요.",
          answerMode: "words",
          tag: "Type · 빈칸 말만",
          items: [
            {"n": 1, "kind": "fill", "accept": ["waste"], "prompt": "01 다음 짝지어진 두 단어의 관계가 같도록 빈칸에 들어갈 적절한 말을 쓰시오.\nbuy : sell = save : ______", "explain": "정답: waste. (답지 26쪽)"},
            {"n": 2, "kind": "fill", "accept": ["resource"], "prompt": "02 다음 영영풀이에 해당하는 단어를 빈칸에 넣어 문장을 완성하시오.\nsomething useful that people use to help them live or do work\n→ The sun is a natural ______ . It gives us energy.", "explain": "정답: resource. (답지 26쪽)"},
            {"n": 3, "kind": "fill", "accept": ["breaks down"], "phrase": true, "prompt": "03 다음 우리말에 맞도록 빈칸에 들어갈 적절한 말을 쓰시오.\n설탕은 물에서 분해되어 사라진다.\n→ Sugar ______ ______ in water and disappears.", "explain": "정답: breaks down. (답지 26쪽)"},
            {"n": 4, "kind": "fill", "accept": ["for"], "prompt": "04 다음 빈칸에 공통으로 들어갈 적절한 말을 쓰시오.\n• She talked on the phone ______ a long time.\n• There are many colors, ______ example, red, blue, and green.", "explain": "정답: for. (답지 26쪽)"},
            {"n": 5, "kind": "sentence", "accept": ["Do you know about global warming?"], "prompt": "05 다음 대화에서 밑줄 친 「너는 지구 온난화에 대해 아니?」를 괄호 안의 말을 이용하여 영작하시오.\nG: 너는 지구 온난화에 대해 아니?\nB: Yes, I do. Earth’s temperature is rising. It is a big problem.\n(global warming)", "explain": "정답: Do you know about global warming? (답지 26쪽)"},
            {"n": 6, "kind": "fill", "accept": ["For example"], "prompt": "06 위 대화의 빈칸 ⓐ에 들어갈 적절한 말을 두 단어로 쓰시오.\nG: They do many things. ⓐ ______ , some people turn off the lights for ten minutes.", "explain": "정답: For example. (답지 26쪽)"},
            {"n": 7, "kind": "fill", "accept": ["part in, turning off, for, minutes"], "phrase": true, "prompt": "07 위 대화를 읽고, 다음 질문에 대한 답을 빈칸에 적절한 말을 넣어 완성하시오.\nQ. What will the speakers do on April 22?\n→ On that day, they will take ______ ______ a global event by ______ ______ their lights ______ 10 ______ .\n(빈칸은 차례대로: take ___ ___ / by ___ their lights / ___ 10 ___)\n첫 빈칸부터 차례대로 쓰고, 쉼표로 구분하시오.", "explain": "정답: part in, turning off, for, minutes. (답지 26쪽)"},
            {"n": 8, "kind": "sentence", "accept": ["Why don’t you come with me?"], "prompt": "08 위 대화의 밑줄 친 ⓐ의 우리말에 맞도록 괄호 안의 단어들을 이용하여 여섯 단어로 영작하시오. (대·소문자와 구두점에 유의할 것)\nⓐ나와 함께 가지 않을래?\n(why / come)", "explain": "정답: Why don’t you come with me? (답지 26쪽)"},
            {"n": 9, "kind": "fill", "accept": ["container"], "prompt": "09 위 대화를 읽고, 빈칸 ⓑ에 들어갈 적절한 말을 찾아 한 단어로 쓰시오. (필요시 어형을 바꿀 것)\nG: You should bring your own ⓑ ______ , then. You can put the shampoo in it.", "explain": "정답: container. (답지 27쪽)"},
            {"n": 10, "kind": "fill", "accept": ["that"], "prompt": "10 다음 빈칸에 공통으로 들어갈 적절한 말을 한 단어로 쓰시오.\n• They agree ______ the rules are fair.\n• I am happy ______ you passed the exam.\n• She told me a funny story, but I didn’t quite understand ______ .", "explain": "정답: that. (답지 27쪽)"},
            {"n": 11, "kind": "sentence", "accept": ["Does hard work make a person successful?"], "prompt": "11 다음 우리말에 맞도록 괄호 안의 단어들을 순서대로 바르게 배열하시오. (대·소문자와 구두점에 유의할 것)\n열심히 노력하면 사람이 성공할 수 있나요?\n(make / a / successful / does / hard / person / work)", "explain": "정답: Does hard work make a person successful? (답지 27쪽)"},
            {"n": 12, "kind": "sentence", "accept": ["She said that it was too hot outside."], "prompt": "12 다음 우리말에 맞도록 괄호 안의 단어들을 이용하여 여섯 단어로 영작하시오. (대·소문자와 구두점에 유의할 것)\n그녀는 밖의 날씨가 너무 더웠다고 말했다.\n(that, outside, it, too)", "explain": "정답: She said that it was too hot outside. (답지 27쪽)"},
            {"n": 13, "kind": "fill", "accept": ["The rainy weather didn’t make the trip enjoyable."], "phrase": true, "prompt": "13 다음 중 어법상 틀린 문장 두 개를 찾아 기호를 쓰고, 바르게 고친 문장을 다시 쓰시오. (단어는 그대로 유지할 것)\nⓐ She thinks it’s going to rain.\nⓑ The rainy weather didn’t make the trip enjoy.\nⓒ The doctor didn’t say that your need medicine.\nⓓ Can good leadership make a company successful?\n\n(1) ⓑ를 바르게 고친 문장을 쓰시오.", "explain": "정답: The rainy weather didn’t make the trip enjoyable. (답지 27쪽)"},
            {"n": 13, "kind": "fill", "accept": ["The doctor didn’t say that you need medicine."], "phrase": true, "prompt": "13 다음 중 어법상 틀린 문장 두 개를 찾아 기호를 쓰고, 바르게 고친 문장을 다시 쓰시오. (단어는 그대로 유지할 것)\nⓐ She thinks it’s going to rain.\nⓑ The rainy weather didn’t make the trip enjoy.\nⓒ The doctor didn’t say that your need medicine.\nⓓ Can good leadership make a company successful?\n\n(2) ⓒ를 바르게 고친 문장을 쓰시오.", "explain": "정답: The doctor didn’t say that you need medicine. (답지 27쪽)"},
            {"n": 14, "kind": "sentence", "accept": ["Please make sure that you drink enough water every day."], "prompt": "14 다음 [조건]에 맞게 아래 우리말을 영작하시오.\n조건 1. sure, that, please를 이용할 것.\n조건 2. 총 10단어로 쓸 것.\n조건 3. 대·소문자 및 구두점에 유의할 것.\n\n매일 반드시 충분한 물을 마시도록 하세요.", "explain": "정답: Please make sure that you drink enough water every day. (답지 27쪽)"},
            {"n": 15, "kind": "sentence", "accept": ["A good teacher makes learning fun."], "prompt": "15 다음 [조건]에 맞게 아래 우리말을 영작하시오.\n조건 1. 동사 make를 적절한 형태로 바꿀 것.\n조건 2. 목적어는 learn을 적절한 형태로 바꿀 것.\n조건 3. 총 6단어로 쓸 것.\n조건 4. 대·소문자 및 구두점에 유의할 것.\n\n좋은 선생님은 학습을 재미있게 만든다.", "explain": "정답: A good teacher makes learning fun. (답지 27쪽)"},
            {"n": 16, "kind": "fill", "accept": ["clean"], "prompt": "16 다음 글의 밑줄 친 ⓐ~ⓔ에서 흐름상 단어의 쓰임이 틀린 것을 찾아 기호를 쓰고, 적절한 말로 고치시오.\nⓐ Pollution is a big problem. ⓑ Luckily, three superheroes are working to ⓒ protect the environment. They want to make the world ⓓ dirty. Will you ⓔ join them?\n\nⓓ를 고친 단어를 쓰시오.", "explain": "정답: clean. (답지 27쪽)"},
            {"n": 17, "kind": "fill", "accept": ["resources"], "prompt": "17 윗글의 밑줄 친 ⓐthem이 가리키는 말을 글에서 찾아 한 단어로 쓰시오.\nPeople waste too many resources. But recycling can save ⓐthem.", "explain": "정답: resources. (답지 27쪽)"},
            {"n": 18, "kind": "fill", "accept": ["Does"], "prompt": "18 윗글의 밑줄 친 우리말 ⓑ를 아홉 단어로 이루어진 문장의 영어로 옮길 때 말긴 첫째로 오는 단어를 쓰시오.\nⓑ여러분은 재활용에 있어서 마법사가 되고 싶나요?", "explain": "정답: Does. (답지 27쪽)"},
            {"n": 19, "kind": "fill", "accept": ["piece"], "prompt": "19 윗글의 빈칸 ⓒ에 들어갈 적절한 말을 다음 영영풀이를 참고하여 쓰시오.\na part of a whole", "explain": "정답: piece. (답지 27쪽)"},
            {"n": 20, "kind": "fill", "accept": ["that"], "prompt": "20 윗글의 빈칸 ⓐ에 들어갈 가장 적절한 말을 쓰시오.\nDid you know ⓐ ______ some clothes take over 200 years to break down?", "explain": "정답: that. (답지 27쪽)"},
            {"n": 21, "kind": "sentence", "accept": ["What can you make with these old clothes?"], "prompt": "21 윗글의 밑줄 친 ⓑ에서 틀린 부분을 찾아 바르게 고쳐 문장을 다시 쓰시오.\nⓑWhat can you make with this old clothes?", "explain": "정답: What can you make with these old clothes? (답지 27쪽)"},
            {"n": 22, "kind": "fill", "accept": ["buy, throw"], "phrase": true, "prompt": "22 Fill in the blanks with the correct words to match the passage above.\nWe should not ______ too many clothes or ______ them away often.\n첫 빈칸부터 차례대로 쓰고, 쉼표로 구분하시오.", "explain": "정답: buy, throw. (답지 27쪽)"},
            {"n": 23, "omit": "23", "reason": "답지 27쪽 23번의 두 오류 지점과 수정어를 확정하지 못함 — 다음 확인 때 채움"},
            {"n": 24, "kind": "sentence", "accept": ["turn off the tap completely"], "prompt": "24 윗글을 읽고, 질문에 대한 답의 빈칸을 다시 단어로 쓰시오.\nQ. What should we do with the tap while brushing our teeth to save water?\n→ We should ______ .", "explain": "정답: turn off the tap completely. (답지 27쪽)"},
            {"n": 25, "kind": "fill", "accept": ["Water, waste"], "phrase": true, "prompt": "25 Fill in the blanks with the correct words to summarize the passage above.\n______ is a very important resource, so we should not ______ it.\n첫 빈칸부터 차례대로 쓰고, 쉼표로 구분하시오.", "explain": "정답: Water, waste. (답지 27쪽)"},
          ],
        },
      ],
    },
  },
  u08: {
    "vocab-practice": {
    "title": "Vocabulary 실전 문제",
    "pages": "p.185",
    "sections": [
      {
        "title": "Section A · Vocabulary 실전",
        "dir": "어휘 문제를 읽고 답하시오.",
        "rule": "보기 중에서 하나를 누르세요. 직접 쓰는 문항은 답을 입력해요.",
        "answerMode": "mixed",
        "tag": "Vocabulary · 고르기와 쓰기",
        "items": [
          {
            "n": 1,
            "kind": "fill",
            "prompt": "01 다음 짝지어진 두 단어의 관계가 같도록 빈칸에 들어갈 적절한 말을 쓰시오. (서술형)\nexplain : explanation = ______ : laughter",
            "accept": [
              "laugh"
            ],
            "explain": "정답: laugh. explain–explanation처럼 ‘동사 : 명사’ 관계이다. (답지 30쪽)"
          },
          {
            "n": 2,
            "kind": "mc",
            "prompt": "02 다음 영영풀이에 해당하는 단어로 가장 적절한 것은?\na person in fantasy stories who can do magic",
            "choices": [
              "viewer",
              "neighbor",
              "wizard",
              "champion",
              "scientist"
            ],
            "index": 3,
            "explain": "③ wizard(마법사). (답지 30쪽)"
          },
          {
            "n": 3,
            "kind": "mc",
            "prompt": "03 다음 빈칸에 들어갈 말로 적절하지 않은 것은?\nI often ______ new foods when I travel to foreign countries.",
            "choices": [
              "try",
              "eat",
              "taste",
              "sound",
              "order"
            ],
            "index": 4,
            "explain": "④ sound는 ‘~하게 들리다’라는 뜻으로 음식과 어울리지 않는다. (답지 30쪽)"
          },
          {
            "n": 4,
            "kind": "fill",
            "prompt": "04 다음 영영풀이에 해당하는 단어를 주어진 철자로 시작하여 쓰시오. (서술형)\nto pick one thing from a lot of options\n→ I will c______ a chocolate cake in the store.",
            "accept": [
              "choose"
            ],
            "explain": "정답: choose(고르다). (답지 30쪽)"
          },
          {
            "n": 5,
            "kind": "mc",
            "prompt": "05 다음 ⓐ~ⓒ에 들어갈 말이 바르게 짝지어진 것은?\n• Do not fight. Let’s ⓐ______ up.\n• The pizza has a strange ⓑ______.\n• The dog was ⓒ______ to fall from the tree.",
            "choices": [
              "make / mistake / about",
              "make / taste / about",
              "take / store / of",
              "take / mistake / of",
              "have / taste / in"
            ],
            "index": 2,
            "explain": "② make up(화해하다) / taste(맛) / be about to(막 ~하려고 하다). (답지 30쪽)"
          },
          {
            "n": 6,
            "kind": "mc",
            "prompt": "06 다음 빈칸에 들어갈 말로 가장 적절한 것은?\nI’m ______ about the ending of the novel.",
            "choices": [
              "curious",
              "deep",
              "close",
              "fantastic",
              "magical"
            ],
            "index": 1,
            "explain": "① curious(궁금한). (답지 30쪽)"
          },
          {
            "n": 7,
            "kind": "fill",
            "prompt": "07 다음 우리말에 맞도록 빈칸에 공통으로 들어갈 적절한 말을 쓰시오. (서술형)\n• I drink water instead ______ soda.\n(나는 탄산음료 대신 물을 마신다.)\n• I am proud ______ my parents.\n(나는 나의 부모님이 자랑스럽다.)",
            "accept": [
              "of"
            ],
            "explain": "정답: of (instead of / be proud of). (답지 30쪽)"
          }
        ]
      }
    ]
  },
    "dialog-practice": {
    "title": "Dialog 실전 문제",
    "pages": "pp.196-197",
    "sections": [
      {
        "title": "Section A · Dialog 실전",
        "dir": "대화를 읽고 물음에 답하시오.",
        "rule": "보기 중에서 하나를 누르세요. 직접 쓰는 문항은 답을 입력해요.",
        "answerMode": "mixed",
        "tag": "Read · 고르기와 쓰기",
        "items": [
          {
            "n": 1,
            "kind": "mc",
            "prompt": "01 위 대화의 밑줄 친 ⓐ가 의미하는 것은?\nB: Excuse me. I’d like to check out this book.\nW: Sure. Can you show your library card to me, please?\nB: ⓐHere you go.\nW: Thank you. Please return the book by next week.\nB: Okay. Thank you.",
            "choices": [
              "여기 있습니다.",
              "지금 도착합니다.",
              "다음 주에 올게요.",
              "책을 다 읽었습니다.",
              "여기서 나가 주세요."
            ],
            "index": 1,
            "explain": "① ‘Here you go.’는 물건을 건네며 하는 말이다. (답지 31쪽)"
          },
          {
            "n": 2,
            "kind": "mc",
            "prompt": "02 위 대화를 읽고, 답할 수 없는 질문은?\nB: Excuse me. I’d like to check out this book.\nW: Sure. Can you show your library card to me, please?\nB: ⓐHere you go.\nW: Thank you. Please return the book by next week.\nB: Okay. Thank you.",
            "choices": [
              "여자의 직업은 무엇인가?",
              "소년은 책을 몇 권 빌리려고 하는가?",
              "소년은 도서관에 얼마나 자주 오는가?",
              "소년은 언제까지 책을 반납해야 하는가?",
              "여자는 소년에게 무엇을 보여 달라고 하는가?"
            ],
            "index": 3,
            "explain": "③ 소년이 도서관에 얼마나 자주 오는지는 대화에 없다. (답지 31쪽)"
          },
          {
            "n": 3,
            "kind": "mc",
            "prompt": "[03-05] 다음 대화를 읽고, 물음에 답하시오.\nB: Sofia, what are you reading?\nG: I’m reading The Hobbit.\nB: Can you tell me about it?\nG: It’s a ⓐ______ novel. It is about adventures in a magical world.\nB: It sounds interesting. ⓑ나는 그 이야기가 궁금해.\nG: ⓒ______ You’ll like it.\nB: Okay. I’ll try reading it.\n\n03 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
            "choices": [
              "real",
              "short",
              "fantasy",
              "boring",
              "easy"
            ],
            "index": 3,
            "explain": "③ fantasy. 마법의 세계에서의 모험을 다루는 소설이므로 fantasy novel이 적절하다. (답지 31쪽)"
          },
          {
            "n": 4,
            "kind": "sentence",
            "prompt": "[03-05] 다음 대화를 읽고, 물음에 답하시오.\nB: Sofia, what are you reading?\nG: I’m reading The Hobbit.\nB: Can you tell me about it?\nG: It’s a ⓐ______ novel. It is about adventures in a magical world.\nB: It sounds interesting. ⓑ나는 그 이야기가 궁금해.\nG: ⓒ______ You’ll like it.\nB: Okay. I’ll try reading it.\n\n04 위 대화의 밑줄 친 ⓑ의 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하여 영작하시오. (서술형)\n나는 그 이야기가 궁금해. (story / curious / I'm / the / about / .)",
            "accept": [
              "I'm curious about the story.",
              "I am curious about the story."
            ],
            "explain": "정답: I’m curious about the story. (답지 31쪽)"
          },
          {
            "n": 5,
            "kind": "mc",
            "prompt": "[03-05] 다음 대화를 읽고, 물음에 답하시오.\nB: Sofia, what are you reading?\nG: I’m reading The Hobbit.\nB: Can you tell me about it?\nG: It’s a ⓐ______ novel. It is about adventures in a magical world.\nB: It sounds interesting. ⓑ나는 그 이야기가 궁금해.\nG: ⓒ______ You’ll like it.\nB: Okay. I’ll try reading it.\n\n05 위 대화의 빈칸 ⓒ에 들어갈 말로 가장 적절한 것은?",
            "choices": [
              "It’s too long.",
              "I don’t want it.",
              "I don’t think so.",
              "I will tell you later.",
              "Why don’t you borrow it?"
            ],
            "index": 1,
            "explain": "① ‘권유’에 대한 대답으로 책을 빌려 보라는 말에 ‘It’s too long.’이라 답한 흐름이다. (답지 31쪽)"
          },
          {
            "n": 6,
            "kind": "mc",
            "prompt": "[06-08] 다음 대화를 읽고, 물음에 답하시오.\nA: What are you reading?\nB: I’m reading the book Eragon.\nA: Can you tell me ⓐ______ it?\nB: It’s a fantasy novel. The story is ⓑ______ dragons.\nA: It sounds interesting. ⓒ______\n\n06 위 대화의 빈칸 ⓐ와 ⓑ에 공통으로 들어갈 말로 가장 적절한 것은?",
            "choices": [
              "of",
              "to",
              "into",
              "about",
              "back"
            ],
            "index": 4,
            "explain": "④ tell me about it / is about dragons. (답지 31쪽)"
          },
          {
            "n": 7,
            "kind": "mc",
            "prompt": "[06-08] 다음 대화를 읽고, 물음에 답하시오.\nA: What are you reading?\nB: I’m reading the book Eragon.\nA: Can you tell me ⓐ______ it?\nB: It’s a fantasy novel. The story is ⓑ______ dragons.\nA: It sounds interesting. ⓒ______\n\n07 위 대화의 빈칸 ⓒ에 들어갈 말로 적절하지 않은 것은?",
            "choices": [
              "I wonder about it.",
              "I’m curious about it.",
              "Do you want to draw a dragon?",
              "I want to know more about it.",
              "Can you tell me more about it?"
            ],
            "index": 3,
            "explain": "③ 대화의 흐름과 관계없다. (답지 31쪽)"
          },
          {
            "n": 8,
            "kind": "mc",
            "prompt": "[06-08] 다음 대화를 읽고, 물음에 답하시오.\nA: What are you reading?\nB: I’m reading the book Eragon.\nA: Can you tell me ⓐ______ it?\nB: It’s a fantasy novel. The story is ⓑ______ dragons.\nA: It sounds interesting. ⓒ______\n\n08 위 대화에서 A는 B가 읽고 있는 책에 대해 어떻게 생각하는가?",
            "choices": [
              "흥미롭다",
              "지루하다",
              "어렵다",
              "쉽다",
              "이미 읽었다"
            ],
            "index": 1,
            "explain": "① ‘It sounds interesting.’ (답지 31쪽)"
          },
          {
            "n": 9,
            "kind": "sentence",
            "prompt": "[09-12] 다음 대화를 읽고 물음에 답하시오.\nG: Excuse me. I’m trying to choose a book. ⓐ저를 도와주실 수 있나요?\nM: Sure. What kind of book are you looking ⓑ______?\nG: Well, I want to read about animals.\nM: Okay. Books about animals are on this shelf. What kind of animals are you interested ⓒ______?\nG: I’m curious about sea life.\nM: Then what ⓓ______ this book, The Blue Planet? It’s ⓔ______ animals in the deep sea.\nG: That sounds perfect. Thank you.\nM: You’re welcome.\n\n09 위 대화의 밑줄 친 ⓐ의 우리말을 [조건]에 맞게 바르게 영작하시오. (서술형)\n[조건] 1. 조동사 can을 이용할 것. 2. 총 4단어로 쓸 것.",
            "accept": [
              "Can you help me?"
            ],
            "explain": "정답: Can you help me? (답지 31쪽)"
          },
          {
            "n": 10,
            "kind": "fill",
            "prompt": "[09-12] 다음 대화를 읽고 물음에 답하시오.\nG: Excuse me. I’m trying to choose a book. ⓐ저를 도와주실 수 있나요?\nM: Sure. What kind of book are you looking ⓑ______?\nG: Well, I want to read about animals.\nM: Okay. Books about animals are on this shelf. What kind of animals are you interested ⓒ______?\nG: I’m curious about sea life.\nM: Then what ⓓ______ this book, The Blue Planet? It’s ⓔ______ animals in the deep sea.\nG: That sounds perfect. Thank you.\nM: You’re welcome.\n\n10 위 대화의 빈칸 ⓑ와 ⓒ에 들어갈 말로 적절한 것을 각각 쓰시오. (서술형)\nⓑ → ______\nⓒ → ______",
            "accept": [
              "for"
            ],
            "accept2": [
              "about"
            ],
            "phrase": true,
            "explain": "정답: ⓑ for, ⓒ about. (답지 31쪽)"
          },
          {
            "n": 11,
            "kind": "mc",
            "prompt": "[09-12] 다음 대화를 읽고 물음에 답하시오.\nG: Excuse me. I’m trying to choose a book. ⓐ저를 도와주실 수 있나요?\nM: Sure. What kind of book are you looking ⓑ______?\nG: Well, I want to read about animals.\nM: Okay. Books about animals are on this shelf. What kind of animals are you interested ⓒ______?\nG: I’m curious about sea life.\nM: Then what ⓓ______ this book, The Blue Planet? It’s ⓔ______ animals in the deep sea.\nG: That sounds perfect. Thank you.\nM: You’re welcome.\n\n11 위 대화에서 남자가 추천한 책의 내용으로 가장 적절한 것은?",
            "choices": [
              "하늘을 나는 동물",
              "귀여운 아기 동물",
              "심해에 사는 동물",
              "멸종 위기에 처한 동물",
              "정글에 사는 동물"
            ],
            "index": 3,
            "explain": "③ ‘animals in the deep sea’ (답지 31쪽)"
          },
          {
            "n": 12,
            "kind": "fill",
            "prompt": "[09-12] 다음 대화를 읽고 물음에 답하시오.\nG: Excuse me. I’m trying to choose a book. ⓐ저를 도와주실 수 있나요?\nM: Sure. What kind of book are you looking ⓑ______?\nG: Well, I want to read about animals.\nM: Okay. Books about animals are on this shelf. What kind of animals are you interested ⓒ______?\nG: I’m curious about sea life.\nM: Then what ⓓ______ this book, The Blue Planet? It’s ⓔ______ animals in the deep sea.\nG: That sounds perfect. Thank you.\nM: You’re welcome.\n\n12 위 대화의 빈칸 ⓓ와 ⓔ에 공통으로 들어갈 한 단어를 쓰시오. (서술형)\n→ ______",
            "accept": [
              "about"
            ],
            "phrase": true,
            "explain": "정답: about (what about / is about). (답지 31쪽)"
          },
          {
            "n": 13,
            "kind": "mc",
            "prompt": "[13-15] 다음 대화를 읽고, 물음에 답하시오.\nA: ⓐ______\nB: I chose Inside Out.\nA: Can you explain the lesson of the story to me?\nB: Sure. The lesson is that emotions aren’t good or bad.\nA: Do you like the lesson? I’m curious about your opinion.\nB: Yes, I like it. ⓑ저는 모든 감정이 중요하다는 것을 배웠어요.\n\n13 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
            "choices": [
              "Do you like Inside Out?",
              "Are emotions good or bad?",
              "Which story did you choose?",
              "What is the lesson of the story?",
              "Can you explain the story to me?"
            ],
            "index": 3,
            "explain": "③ ‘I chose Inside Out.’라는 대답에 맞는 질문이다. (답지 31쪽)"
          },
          {
            "n": 14,
            "kind": "mc",
            "prompt": "[13-15] 다음 대화를 읽고, 물음에 답하시오.\nA: ⓐ______\nB: I chose Inside Out.\nA: Can you explain the lesson of the story to me?\nB: Sure. The lesson is that emotions aren’t good or bad.\nA: Do you like the lesson? I’m curious about your opinion.\nB: Yes, I like it. ⓑ저는 모든 감정이 중요하다는 것을 배웠어요.\n\n14 위 대화에서 A는 B에게 Inside Out의 무엇에 대해 설명 달라고 요청했는가?",
            "choices": [
              "characters",
              "topic",
              "setting",
              "lesson",
              "summary"
            ],
            "index": 4,
            "explain": "④ ‘Can you explain the lesson of the story to me?’ (답지 31쪽)"
          },
          {
            "n": 15,
            "kind": "sentence",
            "prompt": "[13-15] 다음 대화를 읽고, 물음에 답하시오.\nA: ⓐ______\nB: I chose Inside Out.\nA: Can you explain the lesson of the story to me?\nB: Sure. The lesson is that emotions aren’t good or bad.\nA: Do you like the lesson? I’m curious about your opinion.\nB: Yes, I like it. ⓑ저는 모든 감정이 중요하다는 것을 배웠어요.\n\n15 위 대화의 밑줄 친 ⓑ의 우리말에 맞도록 [조건]에 맞게 영작하시오. (서술형)\n저는 모든 감정이 중요하다는 것을 배웠어요.\n[조건] 1. emotion, important, learn, that을 이용할 것. 2. 필요시 어형을 바꿀 것. 3. 총 7단어로 쓸 것.",
            "accept": [
              "I learned that all emotions are important.",
              "I learnt that all emotions are important."
            ],
            "explain": "정답: I learned that all emotions are important. (답지 31쪽)"
          }
        ]
      }
    ]
  }
  },
};
