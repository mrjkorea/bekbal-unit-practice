#!/usr/bin/env python3
"""Emit scripts/j1-neung-u78-payload.js from compact answer tables."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def js(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2)

L07_A = [
  ["reduce", "줄이다"], ["activity", "활동, 행동"], ["join", "가입하다"],
  ["protect", "보호하다, 지키다"], ["create", "창조하다, 만들다"], ["light", "전등; 빛"],
  ["below", "아래에"], ["container", "용기, 통"], ["item", "물품, 물건"], ["receipt", "영수증"],
  ["movement", "(사회적) 운동, 움직임"], ["properly", "적절히, 제대로"], ["quick", "빠른"],
  ["useful", "유용한"], ["wear", "입다"], ["hurt", "다치게 하다"], ["correct", "알맞은"],
  ["invite", "초대하다"], ["delivery", "배달"], ["melt", "녹다; 사라지다"],
]
L07_B = [
  ["자원", "resource"], ["수도꼭지", "tap"], ["중요한", "important"], ["온도, 기온", "temperature"],
  ["조각, 단편, 부분", "piece"], ["오염, 공해", "pollution"], ["다행히", "luckily"], ["완전히", "completely"],
  ["자신의, 내 소유의", "own"], ["환경", "environment"], ["기르다, 재배하다", "grow"], ["심다", "plant"],
  ["재활용하다", "recycle"], ["토양, 흙", "soil"], ["쓰레기; 낭비하다", "waste"], ["구하다, 절약하다", "save"],
  ["오르다", "rise"], ["마법사", "wizard"], ["심각한, 심한", "serious"], ["빨대", "straw"],
]
L07_C = [
  ["take a shower", "샤워를 하다"], ["break down", "분해하다, 부수다"], ["for a long time", "오랫동안"],
  ["throw away", "버리다, 없애다"], ["a lot of", "많은 ~"], ["greenhouse gas", "온실가스"],
  ["turn off", "~을 끄다, ~을 잠그다"], ["match A with B", "A와 B를 맞추다[연결하다"],
  ["will", "~할 것이다"], ["global warming", "지구 온난화"],
]
L07_D = [
  ["확실하게 하다, 확인하다", "make sure"], ["~에 참석하다", "take part in"], ["예를 들면", "for example"],
  ["~을 줍다, ~을 들다", "pick up"], ["전화로", "by phone"], ["북극곰", "polar bear"],
  ["시험을 보다", "take a test"], ["위험에 처한", "in danger"], ["대회에서 이기다", "win a contest"],
  ["A를 B에 넣다", "put A in B"],
]

L08_A = [
  ["fantasy", "공상, 판타지"], ["nervous", "불안해하는, 긴장한"], ["emotion", "감정"], ["wizard", "마법사"],
  ["gym", "체육관"], ["itchy", "가렵다"], ["choose", "고르다, 선택하다"], ["deep", "깊은"],
  ["borrow", "빌리다"], ["shelf", "선반, 칸"], ["piece", "조각"], ["slippery", "미끄러운"],
  ["laugh", "(소리 내) 웃다"], ["curious", "궁금한"], ["then", "그때; 그 이후에"], ["magical", "마법의"],
  ["drop", "떨어뜨리다"], ["stomach", "배, 복부"], ["factory", "공장"], ["spicy", "매운"],
]
L08_B = [
  ["시도하다", "try"], ["교훈", "lesson"], ["냉장고", "refrigerator"], ["의견", "opinion"],
  ["놓치다", "miss"], ["정확히", "exactly"], ["닫다", "close"], ["시청자", "viewer"],
  ["양", "amount"], ["위험", "danger"], ["이웃", "neighbor"], ["소설", "novel"],
  ["모험", "adventure"], ["더하다", "add"], ["행성", "planet"], ["맛", "taste"],
  ["실수", "mistake"], ["우주", "space"], ["후추", "pepper"], ["무대", "stage"],
]
L08_C = [
  ["look for", "~을 찾다"], ["check out", "(책을) 빌리다; 조사하다"], ["like any other day", "어느 다른 날과 같이"],
  ["salt shaker", "소금 통"], ["instead of", "~ 대신에"], ["be interested in", "~에 관심이 있다"],
  ["mess up", "망치다"], ["can't wait", "안절부절못하다"], ["talent show", "장기 자랑"], ["main character", "주요 인물"],
]
L08_D = [
  ["뒤돌아보다", "turn around"], ["B에서 A를 꺼내다", "take A out of B"], ["A와 B 모두", "both A and B"],
  ["~할 것이다", "be going to"], ["막 ~하려고 하다", "be about to"], ["처음으로", "for the first time (ever)"],
  ["더 이상 ~하지 않다", "no longer"], ["함께 섞다", "mix together"], ["화해하다", "make up"], ["도망치다", "run off"],
]

D07_COMPLETE = [
  ["01 Listen and Talk A-1",
   "G: Do you know about global warming?\nB: Yes, I do. Earth's temperature is rising. It is a big problem.\nG: Right. The ice is melting quickly, and polar bears are losing their homes.\nB: We should do something to help them.",
   ["about", "rising", "melting", "losing", "something"], "답지 p.20 Dialog 완성 01"],
  ["02 Listen and Talk A-2",
   "B: Look at this poster.\nG: It's shocking. It looks like someone drank most of Earth's water.\nB: Yes. People waste too much water. What can we do to save water?\nG: We can do a lot of things. For example, we can take quick showers.\nB: That sounds good.",
   ["poster", "drank", "waste", "water", "example", "showers", "sounds"], "답지 Dialog 02"],
  ["03 Listen and Talk A-3",
   "B: Do you know about plastic pollution?\nG: Yes, I do. A lot of plastic waste goes into the oceans.\nB: Right. It is a serious problem.\nG: What can we do to reduce plastic waste?\nB: We can start making small changes. For example, we can carry our own water bottles.\nG: That's a good idea.",
   ["pollution", "oceans", "serious", "reduce", "making", "own", "idea"], "답지 Dialog 03"],
  ["04 Listen and Talk C",
   "G: Hey, Tom! Do you know about Earth Day?\nB: No, I don't. What is it?\nG: It's a special day on April 22. People take part in a global event.\nB: I see. What do they do?\nG: They do many things. For example, some people turn off the lights for ten minutes.\nB: Wow! But how can that help the environment?\nG: It can save a lot of energy. Also, it can reduce greenhouse gases. Why don't we take part in the event?\nB: That's a great idea. Let's do it.",
   ["Earth", "don't", "on", "part", "do", "off", "for", "help", "energy", "reduce", "take", "great"], "답지 Dialog 04"],
  ["05 Listen and Talk D",
   "A: Do you know about the eco club at our school?\nB: No, I don't. What do the club members do?\nA: They do a lot of things for Earth. For example, they grow plants.\nB: That sounds fun. Let's join the club together!\nA: Sure. Which activity do you want to do?\nB: I want to pick up waste.",
   ["eco", "members", "Earth", "plants", "fun", "join", "activity", "up"], "답지 Dialog 05"],
  ["06 Real-Life Communication 1",
   "B: Hi, Bora. What are you going to do this weekend?\nG: I'm planning to go to a zero waste shop. Do you know about zero waste shops?\nB: No, I don't. Please tell me about them.\nG: They don't sell items in containers, so you can reduce waste. Why don't you come with me?\nB: That sounds great! What can I buy there?\nG: You can buy a lot of items. For example, they have bags, shampoo, and some snacks.\nB: I see. I'm going to buy shampoo.\nG: You should bring your own container, then. You can put the shampoo in it.\nB: Okay.",
   ["going", "planning", "tell", "sell", "waste", "don't", "buy", "items", "buy", "bring", "put"], "답지 Dialog 06"],
  ["07 Real-Life Communication 2",
   "A: Our class will take part in a zero waste week. Do you know about \"zero waste\"?\nB: Yes, I do! But what can we do to reduce waste?\nA: We can do a lot of things. For example, I will use my own water bottle.\nC: That's a good idea! I will bring my own bag to the market.",
   ["take", "waste", "use", "own"], "답지 Dialog 07"],
  ["08 Lesson Review 2",
   "G: Sam, do you know about air pollution?\nB: Yes, I do. It's becoming a serious problem. What can we do about it?\nG: We can do a lot of things. For example, we can ride bikes to school. Also, we can walk more often.\nB: Great ideas! We can also plant trees. Trees clean the air.\nG: Right. Let's help the environment.",
   ["air", "becoming", "For", "walk", "plant", "Let's"], "답지 Dialog 08"],
]

D07_ORDER = [
  [1, ["ⓐ", "ⓒ", "ⓓ", "ⓑ"]],
  [2, ["ⓐ", "ⓒ", "ⓓ", "ⓔ", "ⓑ"]],
  [3, ["ⓒ", "ⓔ", "ⓑ", "ⓓ", "ⓕ", "ⓐ"]],
  [4, ["ⓓ", "ⓐ", "ⓑ", "ⓖ", "ⓔ", "ⓗ", "ⓒ"]],
  [5, ["ⓔ", "ⓒ", "ⓕ", "ⓐ", "ⓑ", "ⓓ"]],
  [6, ["ⓔ", "ⓐ", "ⓒ", "ⓕ", "ⓓ", "ⓗ", "ⓑ", "ⓘ", "ⓖ"]],
  [7, ["ⓓ", "ⓐ", "ⓒ", "ⓑ"]],
  [8, ["ⓑ", "ⓓ", "ⓔ", "ⓒ", "ⓐ"]],
]

D07_ORDER_CHUNKS = [
  ["Do you know about global warming?", "Yes, I do. Earth's temperature is rising. It is a big problem.", "Right. The ice is melting quickly, and polar bears are losing their homes.", "We should do something to help them."],
  ["Look at this poster.", "It's shocking. It looks like someone drank most of Earth's water.", "Yes. People waste too much water. What can we do to save water?", "We can do a lot of things. For example, we can take quick showers.", "That sounds good."],
  ["Do you know about plastic pollution?", "Yes, I do. A lot of plastic waste goes into the oceans.", "Right. It is a serious problem.", "What can we do to reduce plastic waste?", "We can start making small changes. For example, we can carry our own water bottles.", "That's a good idea."],
  ["Hey, Tom! Do you know about Earth Day?", "No, I don't. What is it?", "It's a special day on April 22. People take part in a global event.", "I see. What do they do?", "They do many things. For example, some people turn off the lights for ten minutes.", "Wow! But how can that help the environment?", "It can save a lot of energy. Also, it can reduce greenhouse gases. Why don't we take part in the event?", "That's a great idea. Let's do it."],
  ["Do you know about the eco club at our school?", "No, I don't. What do the club members do?", "They do a lot of things for Earth. For example, they grow plants.", "That sounds fun. Let's join the club together!", "Sure. Which activity do you want to do?", "I want to pick up waste."],
  ["Hi, Bora. What are you going to do this weekend?", "I'm planning to go to a zero waste shop. Do you know about zero waste shops?", "No, I don't. Please tell me about them.", "They don't sell items in containers, so you can reduce waste. Why don't you come with me?", "That sounds great! What can I buy there?", "You can buy a lot of items. For example, they have bags, shampoo, and some snacks.", "I see. I'm going to buy shampoo.", "You should bring your own container, then. You can put the shampoo in it.", "Okay."],
  ["Our class will take part in a zero waste week. Do you know about \"zero waste\"?", "Yes, I do! But what can we do to reduce waste?", "We can do a lot of things. For example, I will use my own water bottle.", "That's a good idea! I will bring my own bag to the market."],
  ["Sam, do you know about air pollution?", "Yes, I do. It's becoming a serious problem. What can we do about it?", "We can do a lot of things. For example, we can ride bikes to school. Also, we can walk more often.", "Great ideas! We can also plant trees. Trees clean the air.", "Right. Let's help the environment."],
]

D08_COMPLETE = [
  ["01 Listen and Talk A-1",
   "B: Excuse me. I'd like to check out this book.\nW: Sure. Can you show your library card to me, please?\nB: Here you go.\nW: Thank you. Please return the book by next week.\nB: Okay. Thank you.",
   ["check", "library", "go", "return", "by"], "답지 Dialog 01"],
  ["02 Listen and Talk A-2",
   "G: Hello. I'm looking for an interesting book. Can you help me, please?\nM: Of course. What do you want to read about?\nG: Well, I'm curious about space.\nM: Then what about this book, Look into Space? It's about the planets.\nG: It sounds very interesting. Thank you.",
   ["looking", "help", "read", "curious", "what", "planets", "sounds"], "답지 Dialog 02"],
  ["03 Listen and Talk A-3",
   "B: Sofia, what are you reading?\nG: I'm reading The Hobbit.\nB: Can you tell me about it?\nG: It's a fantasy novel. It is about adventures in a magical world.\nB: It sounds interesting. I'm curious about the story.\nG: Why don't you borrow it? You'll like it.\nB: Okay. I'll try reading it.",
   ["what", "reading", "tell", "novel", "adventures", "interesting", "about", "Why", "try"], "답지 Dialog 03"],
  ["04 Listen and Talk B",
   "A: What are you reading?\nB: I'm reading the book Eragon.\nA: Can you tell me about it?\nB: It's a fantasy novel. The story is about dragons.\nA: It sounds interesting. I'm curious about it.",
   ["reading", "book", "about", "fantasy", "dragons", "sounds", "curious"], "답지 Dialog 04"],
  ["05 Listen and Talk C",
   "G: Excuse me. I'm trying to choose a book. Can you help me?\nM: Sure. What kind of book are you looking for?\nG: Well, I want to read about animals.\nM: Okay. Books about animals are on this shelf. What kind of animals are you interested in?\nG: I'm curious about sea life.\nM: Then what about this book, The Blue Planet? It's about animals in the deep sea.\nG: That sounds perfect. Thank you.\nM: You're welcome.",
   ["Excuse", "choose", "kind", "animals", "shelf", "interested", "sea", "what", "Planet", "deep", "perfect"], "답지 Dialog 05"],
  ["06 Listen and Talk D",
   "A: I'm trying to choose a book. Can you help me?\nB: Of course. What about The Wizard of Oz?\nA: Hmm... Can you tell me about it?\nB: Sure. It's about the adventures of a young girl.\nA: I'd like to read it. I'm curious about adventures.\nB: You'll like it.",
   ["choose", "Can", "Wizard", "tell", "adventures", "read", "curious"], "답지 Dialog 06"],
  ["07 Real-Life Communication 1",
   "B: Hi, everyone! Welcome to our channel! I'm Tony.\nG: And I'm Ivy. Today, we're going to talk about a good book.\nB: Right. The book is Charlotte's Web by E. B. White.\nG: Can you tell our viewers about the story?\nB: Sure. It's about Charlotte, a wise spider and Wilbur, a little pig. Charlotte saves Wilbur from danger, and they become close friends.\nG: We can learn about true friendship from this story.\nB: Yes. Also, there is a movie version of the story.\nG: How did you like the movie? I'm curious about your opinion.\nB: I loved it. I think our viewers will enjoy both the book and the movie.",
   ["Welcome", "talk", "book", "viewers", "spider", "pig", "saves", "friendship", "movie", "like", "opinion", "enjoy"], "답지 Dialog 07"],
  ["08 Real-Life Communication 2",
   "A: Which story did you choose?\nB: I chose Inside Out.\nA: Can you explain the lesson of the story to me?\nB: Sure. The lesson is that emotions aren't good or bad.\nA: Do you like the lesson? I'm curious about your opinion.\nB: Yes, I like it. I learned that all emotions are important.",
   ["choose", "chose", "lesson", "emotions", "lesson", "curious", "learned"], "답지 Dialog 08"],
]

D08_ORDER = [
  [1, ["ⓓ", "ⓑ", "ⓔ", "ⓐ", "ⓒ"]],
  [2, ["ⓖ", "ⓐ", "ⓓ", "ⓕ", "ⓒ", "ⓔ"]],
  [3, ["ⓓ", "ⓖ", "ⓕ", "ⓑ", "ⓔ", "ⓐ", "ⓒ"]],
  [4, ["ⓒ", "ⓔ", "ⓑ", "ⓓ", "ⓐ"]],
  [5, ["ⓓ", "ⓒ", "ⓖ", "ⓐ", "ⓕ", "ⓗ", "ⓑ", "ⓔ"]],
  [6, ["ⓖ", "ⓐ", "ⓔ", "ⓑ", "ⓕ", "ⓓ", "ⓒ"]],
  [7, ["ⓔ", "ⓑ", "ⓕ", "ⓗ", "ⓒ", "ⓘ", "ⓐ", "ⓖ", "ⓓ"]],
  [8, ["ⓓ", "ⓐ", "ⓔ", "ⓑ", "ⓕ", "ⓒ"]],
]

def _letter_n(sym):
  m = {"ⓐ": 1, "ⓑ": 2, "ⓒ": 3, "ⓓ": 4, "ⓔ": 5, "ⓕ": 6, "ⓖ": 7, "ⓗ": 8, "ⓘ": 9}
  k = str(sym).replace("(", "").replace(")", "").strip()
  return m.get(k, 0)

def _dialog_lines(text):
  out = []
  for line in text.split("\n"):
    line = line.strip()
    if not line:
      continue
    if ": " in line[:4]:
      line = line.split(": ", 1)[-1]
    out.append(line)
  return out

def _pad_chunks(lines, n):
  lines = list(lines)
  while len(lines) < n and lines:
    mid = max(0, len(lines) // 2)
    part = lines.pop(mid)
    words = part.split()
    if len(words) >= 4:
      half = len(words) // 2
      lines.insert(mid, " ".join(words[:half]))
      lines.insert(mid + 1, " ".join(words[half:]))
    else:
      lines.append(part)
  return lines[:n] if len(lines) >= n else lines + [""] * (n - len(lines))

D08_ORDER_CHUNKS = []
for idx, row in enumerate(D08_COMPLETE):
  letters = D08_ORDER[idx][1]
  need = max(_letter_n(x) for x in letters)
  lines = _pad_chunks(_dialog_lines(row[1]), need)
  D08_ORDER_CHUNKS.append(lines)

# Dialog 01: letter-labeled chunks (답지 p.194)
D08_ORDER_CHUNKS[0] = [
  "Here you go.",
  "Sure. Can you show your library card to me, please?",
  "Okay. Thank you.",
  "Excuse me. I'd like to check out this book.",
  "Thank you. Please return the book by next week.",
]

WORD_PACKS = {
  "u07": [
    {"id": "j1neung_u07_words01", "title": "Words 01 · 20 words"},
    {"id": "j1neung_u07_words02", "title": "Words 02 · 20 words"},
    {"id": "j1neung_u07_expressions01", "title": "Expressions · 10 words"},
    {"id": "j1neung_u07_wordplus01", "title": "Words Plus+ · 13 words"},
  ],
  "u08": [
    {"id": "j1neung_u08_words01", "title": "Words 01 · 20 words"},
    {"id": "j1neung_u08_words02", "title": "Words 02 · 20 words"},
    {"id": "j1neung_u08_expressions01", "title": "Expressions · 10 words"},
    {"id": "j1neung_u08_wordplus01", "title": "Words Plus+ · 10 words"},
  ],
}

EXERCISES = {"u07": {}, "u08": {}}

TITLES = {
  "vocab-practice": ("Vocabulary 실전 문제", "p.127"),
  "vocab-advanced": ("Vocabulary 심화 문제", "pp.128-129"),
  "dialog-practice": ("Dialog 실전 문제", "pp.138-139"),
  "dialog-advanced": ("Dialog 심화 문제", "pp.140-141"),
  "grammar-check": ("Grammar 확인 문제", "pp.144-145"),
  "grammar-practice": ("Grammar 실전 문제", "pp.146-147"),
  "grammar-advanced": ("Grammar 심화 문제", "pp.148-149"),
  "reading-content": ("Reading 내용 확인하기", "p.152"),
  "reading-lexgram": ("Reading 적절한 어휘·어법 고르기", "p.153"),
  "reading-order": ("Reading 순서배열하기", "pp.154-157"),
  "reading-writing": ("Reading 영작하기", "pp.154-157"),
  "reading-practice": ("Reading 실전 문제", "pp.158-161"),
  "reading-advanced": ("Reading 심화 문제", "pp.162-165"),
  "plus-practice": ("Plus 기타 지문 실전 문제", "p.167"),
  "writing-finish": ("서술형 끝내기", "pp.168-171"),
  "mock-100": ("100발 100중 모의고사", "pp.172-175"),
  "mock-high": ("고득점 모의고사", "pp.176-179"),
  "x10-vocab": ("어휘 확인 문제", "X-10 pp.30-31"),
  "x10-dialog-cloze": ("대화 빈칸 완성하기", "X-10 pp.32-33"),
  "x10-dialog-write": ("대화 영작하기", "X-10 pp.34-35"),
  "x10-grammar": ("핵심 Grammar 확인 문제", "X-10 pp.36-37"),
  "x10-reading-sentence": ("Reading 문장 완성하기", "X-10 pp.38-39"),
  "x10-reading-cloze": ("Reading 빈칸 완성하기", "X-10 pp.40-41"),
  "x10-review": ("핵심 문장 Review", "X-10 pp.42-43"),
  "final-1": ("최종점검 모의고사 1회", "X-10 pp.84-87"),
  "final-2": ("최종점검 모의고사 2회", "X-10 pp.88-91"),
  "final-3": ("최종점검 모의고사 3회", "X-10 pp.92-95"),
}

EXERCISES["u07"]["vocab-practice"] = {
  "title": TITLES["vocab-practice"][0],
  "pages": TITLES["vocab-practice"][1],
  "sections": [{
    "title": "Section A · Vocabulary 실전",
    "dir": "Vocabulary 실전 문제",
    "rule": "하나를 누르거나 빈칸 말만 쓰세요.",
    "answerMode": "choice",
    "tag": "Choose · 고르기",
    "items": [
      {"kind": "mc", "n": 1, "prompt": "다음 영영풀이에 해당하는 단어로 가장 적절한 것은?\nto become a member of", "choices": ["draw", "join", "plant", "grow", "recycle"], "index": 2, "explain": "정답: join. (답지 p.20 Vocab 실전 01)"},
      {"kind": "fill", "n": 2, "prompt": "다음 짝지어진 두 단어의 관계가 같도록 빈칸에 들어갈 말을 쓰시오.\nbuy : sell = waste : ______", "accept": ["save"], "explain": "정답: save. (답지 02)"},
      {"kind": "mc", "n": 3, "prompt": "다음 빈칸에 들어갈 말로 가장 적절한 것은?\nWill you ______ part in clubs or in study groups?", "choices": ["get", "take", "turn", "have", "make"], "index": 2, "explain": "정답: take (take part in). (답지 03)"},
      {"kind": "fill", "n": 4, "prompt": "다음 빈칸에 들어갈 말을 주어진 철자로 시작하여 쓰시오.\nPlease make ______ that there's paper before you start printing.", "accept": ["sure", "(s)ure"], "explain": "정답: sure (make sure). (답지 04)"},
      {"kind": "mc", "n": 5, "prompt": "다음 빈칸 ⓐ와 ⓑ에 들어갈 말이 바르게 짝지어진 것은?\n• He threw ⓐ ______ the empty bottle.\n• Don't forget to turn ⓑ ______ the stove after cooking.", "choices": ["into / of", "into / off", "away / of", "away / off", "away / out"], "index": 4, "explain": "정답: away / off (throw away, turn off). (답지 05)"},
      {"kind": "mc", "n": 6, "prompt": "다음 중 밑줄 친 단어의 의미가 적절하지 않은 것은?\n② She gave me some useful advice. (불필요한)", "choices": ["The ice will melt in the sun. (녹다)", "She gave me some useful advice. (불필요한)", "Nobody knows the correct answer. (알맞은)", "Sunglasses protect your eyes from the sun. (보호하다)", "She cut a small piece of cake for each of us. (조각)"], "index": 2, "explain": "정답: ② useful ≠ 불필요한. (답지 06)"},
      {"kind": "fill", "n": 7, "prompt": "다음 빈칸에 공통으로 들어갈 적절한 말을 쓰시오.\nWe should not ______ water because it is very important.\nThey are trying to reduce ______ at home.", "accept": ["waste"], "explain": "정답: waste. (답지 07)"},
    ],
  }],
}

out = {
  "L07_A": L07_A, "L07_B": L07_B, "L07_C": L07_C, "L07_D": L07_D,
  "L08_A": L08_A, "L08_B": L08_B, "L08_C": L08_C, "L08_D": L08_D,
  "D07_COMPLETE": D07_COMPLETE,
  "D07_ORDER": D07_ORDER,
  "D07_ORDER_CHUNKS": D07_ORDER_CHUNKS,
  "D08_COMPLETE": D08_COMPLETE,
  "D08_ORDER": D08_ORDER,
  "D08_ORDER_CHUNKS": D08_ORDER_CHUNKS,
  "WORD_PACKS": WORD_PACKS,
  "EXERCISES": EXERCISES,
}

Path(ROOT / "j1-neung-u78-payload.js").write_text(
  "module.exports = " + js(out) + ";\n",
  encoding="utf-8",
)

def write_word_pack(pack_id, title, rows):
  wp_root = ROOT.parent / "handoff" / "word-packs"
  wp_root.mkdir(parents=True, exist_ok=True)
  words = []
  for i, row in enumerate(rows, 1):
    en, ko = row[0], row[1]
    words.append({"id": "%s_%02d" % (pack_id, i), "en": en, "ko": ko})
  obj = {"id": pack_id, "title": title, "source": "능률 김기택 100발100중", "words": words}
  (wp_root / (pack_id + ".json")).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

L07_WP = [
  ["resource", "자원"], ["tap", "수도꼭지"], ["pollution", "오염"], ["recycle", "재활용하다"],
  ["soil", "토양"], ["straw", "빨대"], ["wizard", "마법사"], ["temperature", "온도"],
  ["completely", "완전히"], ["own", "자신의"], ["environment", "환경"], ["serious", "심각한"],
  ["luckily", "다행히"],
]
L08_WP = [
  ["refrigerator", "냉장고"], ["opinion", "의견"], ["viewer", "시청자"], ["adventure", "모험"],
  ["planet", "행성"], ["pepper", "후추"], ["stage", "무대"], ["mistake", "실수"],
  ["neighbor", "이웃"], ["amount", "양"], ["danger", "위험"], ["taste", "맛"],
  ["space", "우주"],
]

write_word_pack("j1neung_u07_words01", "중1능률 L07 · Words 1", L07_A)
write_word_pack("j1neung_u07_words02", "중1능률 L07 · Words 2", L07_B)
write_word_pack("j1neung_u07_expressions01", "중1능률 L07 · Expressions", L07_C)
write_word_pack("j1neung_u07_wordplus01", "중1능률 L07 · Words Plus+", L07_WP)
write_word_pack("j1neung_u08_words01", "중1능률 L08 · Words 1", L08_A)
write_word_pack("j1neung_u08_words02", "중1능률 L08 · Words 2", L08_B)
write_word_pack("j1neung_u08_expressions01", "중1능률 L08 · Expressions", L08_C)
write_word_pack("j1neung_u08_wordplus01", "중1능률 L08 · Words Plus+", L08_WP)

print("wrote payload", len(json.dumps(out)))
print("wrote word packs under handoff/word-packs/")
