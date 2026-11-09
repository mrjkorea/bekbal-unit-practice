#!/usr/bin/env python3
"""Build the remaining Lesson 08 exercises for data/j1-neung/u08.

Usage: python3 scripts/build-u08-rest.py <exercise-id> [<exercise-id> ...]
Content is typed from the scanned book pages; every answer key was read from the
답지 page image. Nothing here is machine-generated text.
"""
from __future__ import annotations

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "j1-neung", "u08", "exercises")
BOOK = "중1 능률 김기택"
UNIT = "Lesson 08 Dive into Stories"

CHOICE = ("choice", "Choose · 고르기", "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요.")
WORDS = ("words", "Type · 빈칸 말만", "이 칸에 들어갈 말만 쓰세요. 문장 전체는 쓰지 않아요.")
SENT = ("sentence", "Write · 문장 쓰기", "우리말에 맞게 영어 문장을 쓰세요.")
ORDER = ("order", "Arrange · 순서 배열", "단어를 차례대로 눌러 문장을 만드세요.")


def _base(section, sec_title, direction, mode, qid, seconds, explain):
    answerMode, tag, rule = mode
    return {
        "id": str(qid),
        "label": str(qid),
        "sourceId": qid,
        "section": section,
        "sectionTitle": sec_title,
        "directionKo": direction,
        "ruleKo": rule,
        "sectionInstructionKo": f"{direction} {rule}",
        "answerMode": answerMode,
        "answerModeTag": tag,
        "explainKo": explain,
    }


def mc(qid, prompt, choices, key, explain, section="s1", sec_title="Section A", direction="알맞은 것을 고르시오.", seconds=60):
    q = _base(section, sec_title, direction, CHOICE, qid, seconds, explain)
    q.update({"type": "mc", "select": "one", "promptEn": prompt, "choices": choices, "correctIndexes": [key], "seconds": seconds})
    return q


def fill(qid, prompt, accept, explain, section="s1", sec_title="Section A", direction="빈칸에 들어갈 말을 쓰시오.", seconds=90, phrase=False):
    q = _base(section, sec_title, direction, WORDS, qid, seconds, explain)
    q.update({"type": "fill", "promptEn": prompt, "accept": accept, "phraseBlank": phrase, "seconds": seconds})
    return q


def sentence(qid, prompt, accept, explain, section="s1", sec_title="Section A", direction="우리말에 맞게 영작하시오.", seconds=110):
    q = _base(section, sec_title, direction, SENT, qid, seconds, explain)
    q.update({"type": "sentence", "promptEn": prompt, "accept": accept, "seconds": seconds})
    return q


def order(qid, prompt, chunks, ids, explain, section="s1", sec_title="Section A", direction="괄호 안의 단어를 순서대로 배열하여 쓰시오.", seconds=75):
    q = _base(section, sec_title, direction, ORDER, qid, seconds, explain)
    q.update({
        "type": "order",
        "promptEn": prompt,
        "orderChunks": [{"id": f"c{i+1}", "text": t} for i, t in enumerate(chunks)],
        "orderIds": ids,
        "seconds": seconds,
    })
    return q


def doc(doc_id, title, unit, pages, intro, sections, questions, omitted=None):
    return {
        "id": doc_id,
        "title": title,
        "book": BOOK,
        "unit": unit,
        "sourcePages": pages,
        "questionCount": len(questions),
        "omitted": omitted or [],
        "sectionsVersion": 2,
        "introKo": intro,
        "sections": sections,
        "questions": questions,
    }


def sec(sid, title, direction, mode, count):
    answerMode = mode[0]
    return {
        "id": sid,
        "title": title,
        "directionKo": direction,
        "ruleKo": mode[2],
        "answerMode": answerMode,
        "answerModeTag": mode[1],
        "instructionKo": f"{direction} {mode[2]}",
        "itemCount": count,
    }


def write(doc_dict):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, doc_dict["id"] + ".json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(doc_dict, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("wrote", path, doc_dict["questionCount"], "items")


# ----------------------------------------------------------------- builders --

U08_DA = [
    # [01-03] Look into Space dialogue
    ("[01-03] 다음 대화를 읽고, 물음에 답하시오.\n"
     "G: Hello. I’m looking for an interesting book. Can you help me?\n"
     "M: Of course. What do you want to read about?\n"
     "G: Well, I’m curious about space.\n"
     "M: Then what about this book, Look into Space? It’s about the ⓐ ______.\n"
     "G: ⓑIt sounds very interesting. Thank you."),
    ("[04-06] 다음 대화를 읽고, 물음에 답하시오.\n"
     "A: What are you reading?\n"
     "B: I’m reading the book Eragon.\n"
     "A: ⓐ ______\n"
     "B: It’s a fantasy novel. The story is about dragons.\n"
     "A: It sounds ⓑ ______. I’m curious about it."),
    ("[07-09] 다음 대화를 읽고, 물음에 답하시오.\n"
     "G: Excuse me. I’m trying to choose a book. ⓐCan you help me?\n"
     "M: Sure. What kind of book are you looking for?\n"
     "G: Well, I want to read about animals.\n"
     "M: Okay. Books about animals are on this shelf. ⓑ어떤 종류의 동물에 관심이 있으신가요?\n"
     "G: I’m curious about sea life.\n"
     "M: Then what about this book, The Blue Planet? It’s about animals in the deep sea.\n"
     "G: That sounds ⓒ ______. Thank you.\n"
     "M: You’re welcome."),
    ("[10-11] 다음 대화를 읽고, 물음에 답하시오.\n"
     "A: Which story did you choose?\n"
     "B: ⓐ ______\n"
     "A: Can you explain the lesson of the story to me?\n"
     "B: Sure. The lesson is that emotions aren’t good or bad.\n"
     "A: Do you like the lesson? ⓑI’m curious about your opinion.\n"
     "B: Yes, I like it. I learned that all emotions are important."),
    ("[12-14] 다음 대화를 읽고, 물음에 답하시오.\n"
     "B: Hi, everyone! Welcome to our channel! I’m Tony.\n"
     "G: And I’m Ivy. Today, we’re going to talk about a good book.\n"
     "B: Right. The book is Charlotte’s Web by E. B. White.\n"
     "G: Can you tell our viewers about the story?\n"
     "B: ⓐ ______ It’s about Charlotte, a wise spider, and Wilbur, a little pig. Charlotte saves Wilbur from danger, and they become close friends.\n"
     "G: We can learn about true friendship from this story.\n"
     "B: Yes. Also, there is a movie version of the story.\n"
     "G: How did you like the movie? I’m curious about your opinion.\n"
     "B: I loved it. I think our viewers will enjoy both the book and the movie."),
]


def build_dialog_advanced():
    s = "Section A · Dialog 심화"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, U08_DA[0] + "\n\n01 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["artists", "plants", "animals", "planets", "libraries"], 4,
           "정답: ④ planets. 우주(space)에 대한 책이므로 행성에 관한 책이다. (답지 32쪽, pp.198-199)", sec_title=s, direction=d),
        sentence(2, U08_DA[0] + "\n\n02 위 대화의 밑줄 친 ⓑ의 우리말에 맞도록 괄호 안의 단어들을 순서대로 바르게 배열하시오. (필요시 어형을 바꿀 것)\n(it / very / interesting / sound / .)",
                 ["It sounds very interesting.", "It sounds very interesting"],
                 "정답: It sounds very interesting. sound는 2형식 동사라서 뒤에 형용사가 온다. (답지 32쪽)", sec_title=s, direction=d),
        mc(3, U08_DA[0] + "\n\n03 위 대화에서 소녀가 관심을 가진 분야는 무엇인가?",
           ["sea", "space", "history", "music", "play"], 2,
           "정답: ② space. 소녀가 curious about space라고 말한다. (답지 32쪽)", sec_title=s, direction=d),
        mc(4, U08_DA[1] + "\n\n04 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["Do you like that book?", "Can you tell me about it?", "Did you finish reading it?", "Where did you buy it?", "Who wrote that book?"], 2,
           "정답: ② Can you tell me about it? B가 책 내용을 설명하는 흐름이므로 책에 대해 알려 달라는 요청이 알맞다. (답지 32쪽)", sec_title=s, direction=d),
        fill(5, U08_DA[1] + "\n\n05 다음 영영풀이에 해당하는 단어를 위 대화에서 찾아 쓰시오.\na long story, usually about imaginary people and events",
             ["novel"], "정답: novel. 대화에서 It’s a fantasy novel이라고 했다. (답지 32쪽)", sec_title=s, direction=d),
        mc(6, U08_DA[1] + "\n\n06 위 대화의 빈칸 ⓑ에 들어갈 말로 가장 적절한 것을 보기에서 골라 쓰시오.\n보기: interesting / spicy / true / false / boring",
           ["interesting", "spicy", "true", "false", "boring"], 1,
           "정답: interesting. 책이 fantasy novel이고 A가 궁금해하므로 interesting이 알맞다. (답지 32쪽)", sec_title=s, direction=d),
        mc(7, U08_DA[2] + "\n\n07 위 대화에서 밑줄 친 ⓐ의 의도로 가장 적절한 것은 무엇인가?",
           ["건물 밖으로 나가는 방법을 묻기", "책을 추천해 달라고 요청하기", "자신이 읽고 있는 책을 자랑하기", "책에 대한 남자의 의견을 묻기", "책을 빌리는 방법을 질문하기"], 2,
           "정답: ② 책을 추천해 달라고 요청하기. Can you help me?는 도움을 청하는 말이다. (답지 32쪽)", sec_title=s, direction=d),
        fill(8, U08_DA[2] + "\n\n08 위 대화의 밑줄 친 ⓑ의 우리말에 맞도록 빈칸에 들어갈 적절한 말을 쓰시오.\nWhat kind of animals ______ ______ ______ ?",
             ["are you interested in"], "정답: are you interested in. be interested in은 ‘~에 관심이 있다’이다. (답지 32쪽)", sec_title=s, direction=d, phrase=True),
        mc(9, U08_DA[2] + "\n\n09 위 대화의 빈칸 ⓒ에 들어갈 말로 가장 적절한 것은?",
           ["fast", "slow", "perfect", "boring", "slippery"], 3,
           "정답: ③ perfect. 책 소개를 듣고 That sounds perfect. Thank you.라고 답한다. (답지 32쪽)", sec_title=s, direction=d),
        mc(10, U08_DA[3] + "\n\n10 위 대화에서 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["The lesson is difficult to explain.", "I did not read the story.", "I don’t want to tell you.", "The story is very long.", "I chose Inside Out."], 5,
           "정답: ⑤ I chose Inside Out. 다음에 나오는 교훈(emotions aren’t good or bad)이 영화 인사이드 아웃의 내용이다. (답지 32쪽)", sec_title=s, direction=d),
        mc(11, U08_DA[3] + "\n\n11 위 대화에서 밑줄 친 ⓑ와 바꿔 쓸 수 있는 표현으로 가장 적절한 것은?",
           ["I know your opinion.", "I don’t care about your opinion.", "I want to know about your opinion.", "Your opinion is wrong.", "Tell me the story again."], 3,
           "정답: ③ I want to know about your opinion. I’m curious about ~는 ‘~에 대해 알고 싶다’이다. (답지 32쪽)", sec_title=s, direction=d),
        mc(12, U08_DA[4] + "\n\n12 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["Sure.", "I’m sorry, but I can’t.", "I’d love to, but I’m busy now.", "What are you talking about?", "What did you say?"], 1,
           "정답: ① Sure. Can you tell our viewers about the story?라는 부탁에 Sure.로 답한다. (답지 32쪽)", sec_title=s, direction=d),
        mc(13, U08_DA[4] + "\n\n13 What is Ivy curious about according to the dialog?",
           ["Who is Wilbur?", "Who is Charlotte?", "What are the readers’ opinions?", "What is Tony’s opinion on the movie?", "Who wrote Charlotte’s Web?"], 4,
           "정답: ④ What is Tony’s opinion on the movie? Ivy가 영화에 대한 Tony의 의견을 묻는다. (답지 32쪽)", sec_title=s, direction=d),
    ]
    questions = qs
    for which, ans in ((1, "E. B. White"), (2, "Charlotte"), (3, "Wilbur")):
        questions.append(fill(f"14-{which}", U08_DA[4] + f"\n\n14 위 대화를 읽고, 다음 도표를 완성하시오.\n({which}) ______",
                              [ans], f"정답: ({which}) {ans}. (답지 32쪽)", sec_title=s, direction=d, seconds=60))
    sections = [sec("s1", s, d, CHOICE, len(questions))]
    write(doc("dialog-advanced", "Dialog 심화 문제", UNIT, "pp.198-199",
              "통과 80%. 알맞은 것을 고르시오. 14문항 고르기·빈칸·영작이 섞여 있습니다. 빈칸은 그 칸의 말만 쓰세요.",
              sections, questions))


def build_grammar_practice():
    s = "Section A · Grammar 실전"
    d = "알맞은 것을 고르시오."
    qs = [
        fill(1, "01 다음 두 문장이 같은 의미가 되도록 빈칸에 들어갈 적절한 말을 쓰시오. (3단어로 쓸 것)\nHow smart the dog is!\n= ______ ______ ______ dog it is!",
             ["What a smart"], "정답: What a smart. How + 형용사 문장은 What + a(n) + 형용사 + 명사로 바꾼다. (답지 33쪽, pp.204-205)", sec_title=s, direction=d, seconds=80, phrase=True),
        mc(2, "02 다음 문장을 우리말로 바르게 해석한 것은?\nShe found something strange in the box.",
           ["그녀는 상자에서 무언가를 찾았다.", "그녀는 상자에서 모든 것을 찾았다.", "그녀는 상자에서 이상한 것을 찾았다.", "그녀는 상자에서 아무것도 찾지 못했다.", "그녀는 상자에서 이상한 것을 찾지 못했다."], 3,
           "정답: ③. find 뒤의 something strange는 ‘이상한 것’이고 뒤에서 형용사가 꾸민다. (답지 33쪽)", sec_title=s, direction=d),
        mc(3, "03 다음 빈칸에 들어갈 말로 가장 적절한 것은?\n______ a beautiful sunset!",
           ["How", "What", "Who", "Which", "Where"], 2,
           "정답: ② What. What + a(n) + 형용사 + 명사 형태이고 명사 sunset이 있다. (답지 33쪽)", sec_title=s, direction=d),
        mc(4, "04 다음 빈칸에 들어갈 말로 가장 적절한 것은?\nJames wants to drink ______ cold.",
           ["some", "every", "anything", "someone", "something"], 5,
           "정답: ⑤ something. something cold는 ‘차가운 무언가’이다. (답지 33쪽)", sec_title=s, direction=d),
        mc(5, "05 다음 중 어법상 틀린 것은?",
           ["What a nice day!", "How fast he runs!", "How smart she is!", "How a wonderful idea!", "What a delicious cake!"], 4,
           "정답: ④ How a wonderful idea! 감탄사 뒤에 a(n) + 형용사 + 명사가 오면 What을 쓴다. (답지 33쪽)", sec_title=s, direction=d),
        mc(6, "06 다음 두 문장이 같은 의미가 되도록 할 때, 빈칸에 들어갈 말로 가장 적절한 것은?\nWhat a lovely dress she is wearing!\n= How ______ she looks in that dress!",
           ["wear", "dress", "lovely", "wearing", "love"], 3,
           "정답: ③ lovely. How + 형용사 형태가 되므로 lovely가 들어간다. (답지 33쪽)", sec_title=s, direction=d),
        sentence(7, "07 다음 우리말에 맞도록 주어진 단어들을 바르게 배열하여 영작하시오.\n나는 여기서 유용한 것을 찾을 수 없다.\n(useful / can't / find // here / anything / .)",
                 ["I can't find anything useful here.", "I can’t find anything useful here."],
                 "정답: I can't find anything useful here. anything은 뒤에서 useful이 꾸민다. (답지 33쪽)", sec_title=s, direction=d),
        mc(8, "08 다음 문장을 어법에 맞게 바르게 고쳐 쓴 것은?\nWhat a kind person are you!",
           ["What kind person are you!", "What a kind person you are!", "How a kind person are you!", "How a kind person you are!", "How kind person you are!"], 2,
           "정답: ② What a kind person you are! What 감탄문은 「What + a + 형용사 + 명사 + 주어 + 동사」 어순이다. (답지 33쪽)", sec_title=s, direction=d),
        fill(9, "09 다음 빈칸에 공통으로 들어갈 적절한 말을 보기에서 찾아 쓰시오.\n보기: Too / How / What / So / Why\n______ fast you can swim!\n______ friendly your classmates are!",
             ["How"], "정답: How. 형용사·부사가 바로 뒤에 오는 감탄문은 How로 시작한다. (답지 33쪽)", sec_title=s, direction=d),
        mc(10, "10 네 전화기에 무슨 문제라도 있니?\n다음 우리말에 맞도록 바르게 영작한 것은?",
           ["Is there wrong something with your phone?", "Is there wrong anything with your phone?", "Is there wrong nothing with your phone?", "Is there anything wrong with your phone?", "Is there nothing wrong with your phone?"], 4,
           "정답: ④ Is there anything wrong with your phone? anything을 뒤에서 wrong이 꾸민다. (답지 33쪽)", sec_title=s, direction=d),
        mc(11, "11 나는 오늘 해야 할 중요한 일이 없다.\n다음 우리말에 맞도록 바르게 영작한 것은?",
           ["I have no important to do today.", "I have important anything to do today.", "I have nothing important to do today.", "I have important nothing to do today.", "I have anything important to do today."], 3,
           "정답: ③ I have nothing important to do today. nothing + 형용사 어순이다. (답지 33쪽)", sec_title=s, direction=d),
    ]
    multi = [(1, "They are very cute dogs. (What)", "What cute dogs they are!"),
             (2, "These big towers are very tall. (How)", "How tall these big towers are!"),
             (3, "Mary swims very fast. (How)", "How fast Mary swims")]
    for which, given, ans in multi:
        qs.append(sentence(f"12-{which}", f"12 다음 괄호 안의 지시대로 문장을 바꿔 쓰시오. ({given})",
                           [ans], f"정답: ({which}) {ans} (답지 33쪽)", sec_title=s, direction=d, seconds=90))
    qs.append(sentence(13, "13 다음 그림을 보고, 괄호 안의 표현들을 순서대로 바르게 배열하시오. (필요시 어형을 바꿀 것)\n그림: 강아지가 누워서 뼈다귀를 먹고 싶다는 생각을 하고 있다.\n(something / This dog / deliciously / want to / eat / .)",
                       ["This dog wants to eat something delicious.", "This dog wants to eat something delicious"],
                       "정답: This dog wants to eat something delicious. deliciously는 형용사 delicious로 고친다. (답지 33쪽)", sec_title=s, direction=d))
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("grammar-practice", "Grammar 실전 문제", UNIT, "pp.204-205",
              "통과 80%. 13문항입니다. 고르기와 빈칸·영작이 섞여 있습니다.", sections, qs))


def build_grammar_advanced():
    s = "Section A · Grammar 심화"
    d = "알맞은 것을 고르시오."
    qs = [
        fill(1, "01 다음 빈칸에 들어갈 말을 보기에서 골라 쓰시오. (감탄문)\nWhat ______ hair she has!\n보기: well / nice / nicely / fairly / greatly",
             ["nice"], "정답: nice. What 감탄문에는 형용사가 들어가고 hair는 a(n) 없이 쓴다. (답지 33쪽, pp.206-207)", sec_title=s, direction=d),
        mc(2, "02 다음 빈칸에 들어갈 말로 가장 적절한 것은?\nShe tried everything ______ to fix the problem.",
           ["possible", "possibility", "impossible", "sweet", "soft"], 1,
           "정답: ① possible. everything을 뒤에서 형용사 possible이 꾸민다. (답지 33쪽)", sec_title=s, direction=d),
        mc(3, "03 다음 우리말을 바르게 영작한 것은?\n정말 딱딱한 쿠키구나!",
           ["How a hard!", "How a hard it is!", "What a hard cookie is!", "What a hard cookie it is!", "What a hard cookie is it!"], 4,
           "정답: ④ What a hard cookie it is! What 감탄문의 어순은 「What + a + 형용사 + 명사 + 주어 + 동사」이다. (답지 33쪽)", sec_title=s, direction=d),
        mc(4, "04 다음 ①~⑤ 중 anything이 들어갈 곳으로 가장 적절한 곳은?\n바닥의 미끄러운 것을 만지지 마세요.\nDon't ① touch ② slippery ③ on ④ the ⑤ floor.",
           ["①", "②", "③", "④", "⑤"], 2,
           "정답: ②. Don’t touch anything slippery on the floor.가 된다. (답지 33쪽)", sec_title=s, direction=d),
        mc(5, "05 다음 중 어법상 틀린 것은?",
           ["How cold it is!", "How joyful they were!", "What a wonderful world!", "What an amazing man he is!", "How a terrible accident it was!"], 5,
           "정답: ⑤ How a terrible accident it was! a(n) + 형용사 + 명사가 오면 What을 써야 한다. (답지 33쪽)", sec_title=s, direction=d),
        sentence(6, "06 다음 우리말에 맞도록 괄호 안의 단어들을 순서대로 바르게 배열하여 문장을 완성하시오.\n오늘 메뉴에 뭐 맛있는 거 있어?\n(anything / there / delicious / is) ______ on the menu today?",
                 ["Is there anything delicious", "is there anything delicious"],
                 "정답: Is there anything delicious. anything + 형용사 어순이다. (답지 33쪽)", sec_title=s, direction=d),
        mc(7, "07 다음 문장을 감탄문으로 바꿔 쓸 때, 가장 적절한 것은?\nThis plant grows very fast.",
           ["How fast grows this plant!", "How fast this plant grows!", "How this plant grows fast!", "How a fast grows this plant!", "How a fast this plant grows!"], 2,
           "정답: ② How fast this plant grows! How + 부사 + 주어 + 동사 어순이다. (답지 33쪽)", sec_title=s, direction=d),
        sentence(8, "08 다음 우리말에 맞도록 괄호 안의 단어를 이용하여 문장을 완성하시오. (감탄문으로 쓸 것)\n그녀의 아이들은 정말 열심히 공부하는 학생들이구나! (hardworking)\n______ her children are!",
                 ["What hardworking students"],
                 "정답: What hardworking students. What + 형용사 + 명사(복수) + 주어 + 동사 어순이다. (답지 33쪽)", sec_title=s, direction=d),
        mc(9, "09 다음 우리말을 바르게 영작한 것은?\n그녀는 땅에서 반짝이는 것을 보았다.",
           ["She saw some shiny on the ground.", "She saw shiny some on the ground.", "She saw something shiny on the ground.", "She saw shiny something on the ground.", "She saw shine something on the ground."], 3,
           "정답: ③ She saw something shiny on the ground. something을 shiny가 뒤에서 꾸민다. (답지 33쪽)", sec_title=s, direction=d),
        sentence(10, "10 다음 문장을 감탄문으로 바꾸시오. (What으로 시작)\nThis is a really fun game.\n→ ______",
                 ["What a fun game this is!"],
                 "정답: What a fun game this is! (답지 33쪽)", sec_title=s, direction=d),
        mc(11, "11 다음 중 밑줄 친 부분이 어법상 옳은 것끼리 바르게 짝지어진 것은?\nⓐ Tell me something funny.\nⓑ I need something warmly to wear.\nⓒ I felt something soft on my head.\nⓓ I heard something stranger outside.\nⓔ They need something specially for the party.",
           ["ⓐ, ⓑ", "ⓐ, ⓒ", "ⓐ, ⓒ, ⓔ", "ⓑ, ⓒ, ⓓ, ⓔ", "ⓒ, ⓓ, ⓔ"], 2,
           "정답: ② ⓐ, ⓒ. something 뒤에는 형용사가 온다. (답지 33쪽)", sec_title=s, direction=d),
        mc(12, "12 다음 중 빈칸에 들어갈 말이 나머지와 다른 것은?\n(1) ______ cute kittens!\n(2) ______ friendly you are!\n(3) ______ a heavy bag it is!\n(4) ______ an interesting game!\n(5) ______ special guests they are!",
           ["(1)", "(2)", "(3)", "(4)", "(5)"], 2,
           "정답: (2). (2)만 How가 들어가고 나머지는 What이 들어간다. (답지 33쪽)", sec_title=s, direction=d),
        fill(f"13-1", "13 다음 우리말에 맞도록 빈칸 ⓐ에 들어갈 적절한 말을 쓰시오. (고난도)\n나는 정원에서 특별한 것을 발견했지만, 집 안에는 흥미로운 것이 없었다.\nI found ⓐ ______ special in the garden, but ⓑ ______ interesting in the house.\n(ⓐ에 들어갈 말)",
             ["something"], "정답: ⓐ something. 긍정문에서 ‘무언가’는 something이다. (답지 33쪽)", sec_title=s, direction=d, seconds=60),
    ]
    qs.append(fill("13-2", "13 다음 우리말에 맞도록 빈칸 ⓑ에 들어갈 적절한 말을 쓰시오. (고난도)\n나는 정원에서 특별한 것을 발견했지만, 집 안에는 흥미로운 것이 없었다.\nI found ⓐ something special in the garden, but ⓑ ______ interesting in the house.\n(ⓑ에 들어갈 말)",
                   ["nothing"], "정답: ⓑ nothing. ‘없었다’이므로 nothing을 쓴다. (답지 33쪽)", sec_title=s, direction=d, seconds=60))
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("grammar-advanced", "Grammar 심화 문제", UNIT, "pp.206-207",
              "통과 80%. 14문항입니다. 감탄문과 something + 형용사가 중심입니다.", sections, qs))


BEATRICE = (
    "For Beatrice, Friday began like any other day.\n"
    "She ① (wear) the same white socks on both of her feet. Then she made a sandwich.\n"
    "She put ② exactly the same amount of peanut butter on each piece of bread.\n"
    "On ③ (she) way to school, her neighbor said, “Good morning, Perfect Girl.”\n"
    "People called Beatrice “Perfect Girl” because she never ④ (make) mistakes.\n"
    "“Are you ready for tonight’s ⑤ talent show?” her neighbor asked.\n"
    "Beatrice just smiled. She was a juggling champion.\n"
    "She won the talent show every year. ⑥ (What) wonderful she was!\n"
    "At school, Beatrice had a cooking class.\n"
    "To make a cake, she carefully took some eggs out of the ⑦ refrigerator.\n"
    "When she turned around, she stepped on ⑧ (slippery something).\n"
    "She was about to fall! But she ⑨ didn’t.\n"
    "“That was ⑩ close!” she thought. She almost made a mistake.\n"
    "Because of this, she began to feel ⑪ nervous.\n"
    "It was time for the talent show. The school gym ⑫ was full of people.\n"
    "They said, “Look! That’s Perfect Girl!” Beatrice ⑬ had butterflies in her stomach.\n"
    "“Will I ⑭ mess up? I’m worried,” she thought.\n"
    "Beatrice threw an egg into the air. Next, she ⑮ added a salt shaker.\n"
    "Finally, she added a water balloon. ⑯ (How) a good start!\n"
    "But then she felt something strange... Uh-oh!\n"
    "Beatrice’s nose started to ⑰ itch. The salt shaker was full of... pepper!\n"
    "“ACHOO!” Beatrice ⑱ missed the water balloon, and it fell to the floor.\n"
    "Then... OOPS! The egg broke on top of her head.\n"
    "For the first time ever, Beatrice made a mistake. What ⑲ ______ surprise!\n"
    "She thought, “What should I do? Cry? Run off the stage?”\n"
    "Suddenly, she began to laugh loudly. The people looked at each other.\n"
    "Then everyone started to laugh together.\n"
    "That night, Beatrice had a deep sleep. The next morning, she ⑳ (wake) up with a smile.\n"
    "She put a white sock on her left foot... and a green sock on her right foot!\n"
    "Now, people no longer call her “Perfect Girl.” They just call her Beatrice."
)


def build_reading_content():
    s = "Section A · 내용 확인"
    d = "빈칸에 들어갈 말을 쓰시오."
    data = [
        (1, "She ① (wear) the same white socks on both of her feet.", ["wore"], "정답: wore. 과거 이야기이므로 과거형을 쓴다. (답지 34쪽, p.210)"),
        (2, "She put ② exactly the same amount of peanut butter on each piece of bread.\n(②의 뜻을 우리말로 쓰시오.)", ["정확히", "정확하게"], "정답: 정확히. (답지 34쪽)"),
        (3, "On ③ (she) way to school, her neighbor said, “Good morning, Perfect Girl.”", ["her"], "정답: her. on one’s way to ~는 ‘~로 가는 길에’이다. (답지 34쪽)"),
        (4, "People called Beatrice “Perfect Girl” because she never ④ (make) mistakes.", ["made"], "정답: made. never 뒤에 과거형 made를 쓴다. (답지 34쪽)"),
        (5, "“Are you ready for tonight’s ⑤ talent show?” her neighbor asked.\n(⑤의 뜻을 우리말로 쓰시오.)", ["장기 자랑", "경기 자랑"], "정답: 장기 자랑. (답지 34쪽)"),
        (6, "She won the talent show every year. ⑥ (What) wonderful she was!", ["How"], "정답: How. 형용사 wonderful이 바로 오므로 How를 쓴다. (답지 34쪽)"),
        (7, "To make a cake, she carefully took some eggs out of the ⑦ refrigerator.\n(⑦의 뜻을 우리말로 쓰시오.)", ["냉장고"], "정답: 냉장고. (답지 34쪽)"),
        (8, "When she turned around, she stepped on ⑧ (slippery something).\n(괄호 안을 올바른 형태로 쓰시오.)", ["something slippery"], "정답: something slippery. something을 형용사가 뒤에서 꾸민다. (답지 34쪽)"),
        (9, "She was about to fall! But she ⑨ didn’t.\n(⑨의 didn’t 뒤에 생략된 단어를 쓰시오.)", ["fall"], "정답: fall. But she didn’t fall.에서 fall이 생략되었다. (답지 34쪽)"),
        (10, "“That was ⑩ close!” she thought. She almost made a mistake.\n(⑩의 뜻을 우리말로 쓰시오.)", ["아슬아슬한", "아슬아슬하다"], "정답: 아슬아슬한. (답지 34쪽)"),
        (11, "Because of this, she began to feel ⑪ nervous.\n(⑪의 뜻을 우리말로 쓰시오.)", ["불안해하는, 긴장한", "긴장한", "불안해하는"], "정답: 불안해하는, 긴장한. (답지 34쪽)"),
        (12, "It was time for the talent show. The school gym ⑫ was full of people.\n(be full of의 뜻을 쓰시오.)", ["~로 가득하다", "~로 가득 차다"], "정답: ~로 가득하다. (답지 34쪽)"),
        (13, "Beatrice ⑬ had butterflies in her stomach.\n(⑬의 뜻을 우리말로 쓰시오.)", ["언질부절못했다", "조마조마했다", "안절부절못했다"], "정답: 언질부절못했다. (답지 34쪽)"),
        (14, "“Will I ⑭ mess up? I’m worried,” she thought.\n(⑭의 뜻을 우리말로 쓰시오.)", ["망치다", "실수하다"], "정답: 망치다. (답지 34쪽)"),
        (15, "Beatrice threw an egg into the air. Next, she ⑮ added a salt shaker.\n(⑮의 기본형 add의 뜻을 쓰시오.)", ["더하다, 추가하다", "추가하다", "더하다"], "정답: 더하다, 추가하다. (답지 34쪽)"),
        (16, "Finally, she added a water balloon. ⑯ (How) a good start!", ["What"], "정답: What. a good start가 오므로 What을 쓴다. (답지 34쪽)"),
        (17, "Beatrice’s nose started to ⑰ itch. The salt shaker was full of... pepper!\n(⑰의 뜻을 우리말로 쓰시오.)", ["가렵다", "가렵다"], "정답: 가렵다. (답지 34쪽)"),
        (18, "“ACHOO!” Beatrice ⑱ missed the water balloon, and it fell to the floor.\n(⑱의 기본형 miss의 뜻을 쓰시오.)", ["놓치다", "놓치다."], "정답: 놓치다. (답지 34쪽)"),
        (19, "For the first time ever, Beatrice made a mistake. What ⑲ ______ surprise!", ["a"], "정답: a. What a surprise! 형태이다. (답지 34쪽)"),
        (20, "That night, Beatrice had a deep sleep. The next morning, she ⑳ (wake) up with a smile.", ["woke"], "정답: woke. 과거 이야기이므로 과거형을 쓴다. (답지 34쪽)"),
    ]
    qs = [fill(n, f"{n:02d} 다음 글의 빈칸에 들어가거나 괄호 안을 올바른 형태로 쓰시오.\n{text}", acc, ex, sec_title=s, direction=d)
          for n, text, acc, ex in data]
    sections = [sec("s1", s, d, WORDS, len(qs))]
    write(doc("reading-content", "Reading 내용 확인하기", UNIT, "p.210",
              "통과 80%. 본문 20문항입니다. 우리말 뜻을 묻는 칸은 우리말로, 형태를 바꾸는 칸은 영어로 쓰세요.", sections, qs))


LEX = [
    (1, "For Beatrice, Friday began like [any / every] other day.", ["any"], 1, 1),
    (2, "She wore the same white socks on both of her [foot / feet]. [Than / Then] she made a sandwich.", ["feet", "Then"], 1, 2),
    (3, "She put exactly the same amount of peanut butter on each [pieces / piece] of bread.", ["piece"], 1, 1),
    (4, "On her way to school, her neighbor [said / will say], “Good morning, Perfect Girl.”", ["said"], 1, 1),
    (5, "People called Beatrice “Perfect Girl” [because / so] she never made mistakes.", ["because"], 1, 1),
    (6, "“Are you [already / ready] for tonight’s talent show?” her neighbor asked.", ["ready"], 1, 1),
    (7, "Beatrice just [smiled / smiling]. She [did / was] a juggling champion.", ["smiled", "was"], 1, 2),
    (8, "She [lost / won] the talent show every year. [What / How] wonderful she was!", ["won", "How"], 1, 2),
    (9, "At school, Beatrice had a [cooking / cook] class.", ["cooking"], 1, 1),
    (10, "To make a cake, she carefully took some eggs [out of / into] the refrigerator.", ["out of"], 1, 1),
    (11, "[Where / When] she turned around, she stepped on something slippery.", ["When"], 1, 1),
    (12, "She was about to fall! But she [doesn’t / didn’t].", ["didn’t"], 1, 1),
    (13, "“That was [close / closed]!” she thought. She [most / almost] made a mistake.", ["close", "almost"], 1, 2),
    (14, "[Because of / Because] this, she began to feel nervous.", ["Because of"], 1, 1),
    (15, "[It / That] was time for the talent show. The school gym was full [of / from] people.", ["It", "of"], 1, 2),
    (16, "They said, “[Look / Looking]! That’s Perfect Girl!” Beatrice had butterflies in her [head / stomach].", ["Look", "stomach"], 1, 2),
    (17, "“Will I mess up? I’m [worrying / worried],” she thought.", ["worried"], 1, 1),
    (18, "Beatrice threw an egg [onto / into] the air. [Next / Before], she added a salt shaker.", ["into", "Next"], 1, 2),
    (19, "[First / Finally], she added a water balloon. What a good [started / start]!", ["Finally", "start"], 1, 2),
    (20, "But then she felt [something / some] strange... Uh-oh!", ["something"], 1, 1),
    (21, "Beatrice’s nose [start / started] to itch. The salt shaker was [filled / full] of... pepper!", ["started", "full"], 1, 2),
    (22, "“ACHOO!” Beatrice missed the water balloon, [but / and] it fell to the floor.", ["and"], 1, 1),
    (23, "Then... OOPS! The egg [broke / break] on top of her head.", ["broke"], 1, 1),
    (24, "For the first time [ever / never], Beatrice made a mistake. What [an / a] surprise!", ["ever", "a"], 1, 2),
    (25, "She thought, “What should I do? Cry? [Running / Run] off the stage?”", ["Run"], 1, 1),
    (26, "[Sudden / Suddenly], she began to laugh loudly. The people looked [at / for] each other.", ["Suddenly", "at"], 1, 2),
    (27, "Then everyone started to [laughed / laugh] together.", ["laugh"], 1, 1),
    (28, "That night, Beatrice [had / has] a deep sleep. The [after / next] morning, she woke up with a smile.", ["had", "next"], 1, 2),
    (29, "She put a white sock on her left [foot / feet]... and a green sock on her right [foot / feet]!", ["foot", "foot"], 1, 2),
    (30, "Now, people [call no longer / no longer call] her “Perfect Girl.” They just [call / called] her Beatrice.", ["no longer call", "call"], 1, 2),
]


def build_reading_lexgram():
    s = "Section A · 괄호"
    d = "괄호 안에서 문맥상 적절한 것을 고르시오."
    qs = []
    for n, text, answers, _, blanks in LEX:
        options = {}
        for i, m in enumerate(__import__("re").finditer(r"\[([^\]/]+)\s*/\s*([^\]]+)\]", text), start=1):
            options[i] = [m.group(1).strip(), m.group(2).strip()]
        for b in range(1, blanks + 1):
            answer = answers[b - 1]
            pair = options[b]
            key = pair.index(answer) + 1 if answer in pair else 1
            explain = f"정답: {answer}. (답지 34쪽, p.211)"
            qid = f"{n}" if blanks == 1 else f"{n}-{b}"
            qs.append(mc(qid, f"{n:02d} {text}\n\n{b}번째 괄호에 들어갈 알맞은 것을 고르시오.", pair, key, explain,
                         sec_title=s, direction=d, seconds=40))
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("reading-lexgram", "Reading 적절한 어휘·어법 고르기", UNIT, "p.211",
              "통과 80%. 본문 괄호 30문항을 빈칸마다 하나씩 나눴습니다.", sections, qs))


WRITING = [
    ("Beatrice에게 금요일은 여느 다른 날처럼 시작되었다.", "For Beatrice, Friday began like any other day.", "답지 34쪽"),
    ("그녀는 그녀의 양쪽 발에 똑같은 흰 양말을 신었다. 그러고 나서 그녀는 샌드위치를 만들었다.", "She wore the same white socks on both of her feet. Then she made a sandwich.", "답지 34쪽"),
    ("그녀는 각 빵 조각에 정확히 같은 양의 땅콩버터를 발랐다.", "She put exactly the same amount of peanut butter on each piece of bread.", "답지 34쪽"),
    ("학교에 가는 길에, 그녀의 이웃이 “좋은 아침이야, 완벽한 소녀.”라고 말했다.", "On her way to school, her neighbor said, “Good morning, Perfect Girl.”", "답지 34쪽"),
    ("Beatrice는 절대 실수하지 않았기 때문에 사람들은 그녀를 “완벽한 소녀”라고 불렀다.", "People called Beatrice “Perfect Girl” because she never made mistakes.", "답지 34쪽"),
    ("“오늘 밤 장기 자랑을 위한 준비가 되었어?”라고 그녀의 이웃이 물었다.", "“Are you ready for tonight’s talent show?” her neighbor asked.", "답지 34쪽"),
    ("Beatrice는 그저 미소를 지었다. 그녀는 저글링 챔피언이었다.", "Beatrice just smiled. She was a juggling champion.", "답지 34쪽"),
    ("그녀는 매년 장기 자랑에서 우승했다. 그녀는 참 멋졌다!", "She won the talent show every year. How wonderful she was!", "답지 34쪽"),
    ("학교에서 Beatrice는 요리 수업을 들었다.", "At school, Beatrice had a cooking class.", "답지 34쪽"),
    ("케이크를 만들기 위해, 그녀는 조심스럽게 냉장고에서 달걀 몇 개를 꺼냈다.", "To make a cake, she carefully took some eggs out of the refrigerator.", "답지 34쪽"),
    ("그녀가 뒤돌아보았을 때, 그녀는 미끄러운 무언가를 밟았다.", "When she turned around, she stepped on something slippery.", "답지 34쪽"),
    ("그녀는 막 넘어지려고 했다! 하지만 그녀는 그러지 않았다.", "She was about to fall! But she didn’t.", "답지 34쪽"),
    ("“아슬아슬했어!”라고 그녀는 생각했다. 그녀는 거의 실수할 뻔했다.", "“That was close!” she thought. She almost made a mistake.", "답지 34쪽"),
    ("이것 때문에, 그녀는 불안하다고 느끼기 시작했다.", "Because of this, she began to feel nervous.", "답지 34쪽"),
    ("장기 자랑 시간이 되었다. 학교 체육관은 사람들로 가득 찼다.", "It was time for the talent show. The school gym was full of people.", "답지 34쪽"),
    ("그들은 “봐! 저기 완벽한 소녀야!”라고 말했다. Beatrice는 마음이 편하지 않았다.", "They said, “Look! That’s Perfect Girl!” Beatrice had butterflies in her stomach.", "답지 34쪽"),
    ("“내가 망칠까? 난 걱정돼.”라고 그녀는 생각했다.", "“Will I mess up? I’m worried,” she thought.", "답지 34쪽"),
    ("Beatrice는 공중으로 달걀을 던졌다. 다음으로, 그녀는 소금 통을 추가했다.", "Beatrice threw an egg into the air. Next, she added a salt shaker.", "답지 34쪽"),
    ("마지막으로, 그녀는 물풍선을 추가했다. 참 좋은 시작이었다!", "Finally, she added a water balloon. What a good start!", "답지 34쪽"),
    ("하지만 그다음에 그녀는 무언가 이상함을 느꼈다... 어어!", "But then she felt something strange... Uh-oh!", "답지 34쪽"),
    ("Beatrice의 코가 가렵기 시작했다. 그 소금 통은 가득 차 있었다. 후추로!", "Beatrice’s nose started to itch. The salt shaker was full of... pepper!", "답지 34쪽"),
    ("“에취!” Beatrice는 물풍선을 놓쳤고, 그것은 바닥으로 떨어졌다.", "“ACHOO!” Beatrice missed the water balloon, and it fell to the floor.", "답지 34쪽"),
    ("그러고 나서 ... 어이쿠! 달걀이 그녀의 머리 위에서 깨졌다.", "Then... OOPS! The egg broke on top of her head.", "답지 34쪽"),
    ("난생처음으로, Beatrice는 실수했다. 정말 놀라웠다!", "For the first time ever, Beatrice made a mistake. What a surprise!", "답지 34쪽"),
    ("그녀는 “내가 무엇을 해야 하지? 울까? 무대에서 도망갈까?”라고 생각했다.", "She thought, “What should I do? Cry? Run off the stage?”", "답지 34쪽"),
    ("갑자기, 그녀는 크게 웃기 시작했다. 사람들은 서로를 바라보았다.", "Suddenly, she began to laugh loudly. The people looked at each other.", "답지 34쪽"),
    ("그러더니 모두 함께 웃기 시작했다.", "Then everyone started to laugh together.", "답지 34쪽"),
    ("그날 밤, Beatrice는 깊은 잠에 들었다. 다음 날 아침, 그녀는 미소를 지으며 일어났다.", "That night, Beatrice had a deep sleep. The next morning, she woke up with a smile.", "답지 34쪽"),
    ("그녀는 왼쪽 발에 흰 양말을 신었다. 그리고 오른쪽 발에는 초록색 양말을 신었다!", "She put a white sock on her left foot... and a green sock on her right foot!", "답지 34쪽"),
    ("이제, 사람들은 그녀를 더 이상 “완벽한 소녀”라고 부르지 않는다. 그들은 그녀를 그저 Beatrice라고 부른다.", "Now, people no longer call her “Perfect Girl.” They just call her Beatrice.", "답지 34쪽"),
]


def build_reading_writing():
    s = "Section A · 영작"
    d = "우리말에 맞게 영작하시오."
    qs = []
    for n, (ko, en, src) in enumerate(WRITING, start=1):
        accept = [en, en.replace("’", "'")]
        qs.append(sentence(n, f"{n:02d} 다음 우리말을 영어로 쓰시오.\n{ko}", accept,
                           f"정답: {en} ({src}, pp.212-215)", sec_title=s, direction=d, seconds=150))
    sections = [sec("s1", s, d, SENT, len(qs))]
    write(doc("reading-writing", "Reading 영작하기", UNIT, "pp.212-215",
              "통과 80%. 본문 30문장을 우리말만 보고 영작합니다. 대소문자와 구두점을 확인하세요.", sections, qs))


P_A = ("[01-04] 다음 글을 읽고 물음에 답하시오.\n"
       "ⓐ ______ Beatrice, Friday began like any other day. She wore the same white socks ⓑ ______ both of her feet. "
       "Then she made a sandwich. She put exactly the same amount of peanut butter on each piece of bread.")
P_B = ("[05-09] 다음 글을 읽고, 물음에 답하시오.\n"
       "On her way to school, her neighbor said, “Good morning, ⓐPerfect Girl.” "
       "People called Beatrice “Perfect Girl” because she never made mistakes. "
       "“Are you ready for tonight’s talent show?” her neighbor asked. "
       "Beatrice just smiled. She was a juggling champion. She won the talent show every year. ⓑHow wonderful she was!")
P_C = ("[10-13] 다음 글을 읽고, 물음에 답하시오.\n"
       "At school, Beatrice had a ⓐ ______ class. To make a cake, she carefully took some eggs out of the refrigerator. "
       "When she turned around, she stepped on something slippery. ⓑShe was about to fall! But she didn’t. "
       "“That was close!” she thought. She almost made a mistake. Because of ⓒthis, she began to feel ⓓ ______.")
P_D = ("[14-16] 다음 글을 읽고, 물음에 답하시오.\n"
       "It was time ⓐ ______ the talent show. The school gym was full ⓑ ______ people. "
       "They said, “Look! That’s Perfect Girl!” Beatrice had ⓒbutterflies in her stomach. "
       "“Will I mess up? I’m ______,” she thought.")
P_E = ("[17-21] 다음 글을 읽고, 물음에 답하시오.\n"
       "Beatrice threw an egg into the air. ①Next, she added a salt shaker. "
       "Finally, she ②added a water balloon. But then she felt (A) ______ strange... Uh-oh! "
       "Beatrice’s ③ears started to itch. The salt shaker was ④full of... pepper! "
       "“ACHOO!” Beatrice missed the water balloon, and it ⑤fell to the floor. "
       "Then... OOPS! (B) 달걀이 그녀의 머리 위에서 깨졌다.")
P_F = ("[22-23] 다음 글을 읽고, 물음에 답하시오.\n"
       "For the first time ever, Beatrice made a mistake. ⓐWhat a surprise! "
       "She thought, “What should I do? Cry? Run off the stage?” "
       "Suddenly, she began to laugh loudly. The people looked at each other. "
       "Then everyone started to laugh together.")
P_G = ("[24-25] 다음 글을 읽고, 물음에 답하시오.\n"
       "That night, Beatrice had a deep sleep. The next morning, she woke up with a smile. "
       "She put a white sock on her left foot... and a green sock on her right foot! "
       "Now, people no longer call her “Perfect Girl.” 그들은 그녀를 그저 Beatrice라고 부른다.")


def build_reading_practice():
    s = "Section A · Reading 실전"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, P_A + "\n\n01 윗글의 빈칸 ⓐ와 ⓑ에 들어갈 말이 바르게 짝지어진 것은?",
           ["ⓐ For · ⓑ in", "ⓐ For · ⓑ on", "ⓐ As · ⓑ to", "ⓐ As · ⓑ on", "ⓐ On · ⓑ in"], 2,
           "정답: ② For / on. ⓐ는 ‘~에게 있어서’의 for, ⓑ는 신발을 신은 상태를 나타내는 on이다. (답지 35쪽, pp.216-219)", sec_title=s, direction=d),
        fill(2, P_A + "\n\n02 윗글을 읽고, 다음 빈칸에 들어갈 적절한 말을 보기에서 찾아 쓰시오.\n보기: before / after / when / so / because\nBeatrice wore socks ______ she made a sandwich.",
             ["before"], "정답: before. 양말을 신은 뒤에 샌드위치를 만들었다. (답지 35쪽)", sec_title=s, direction=d),
        mc(3, P_A + "\n\n03 윗글의 주제로 가장 적절한 것은?",
           ["Beatrice’s special Friday", "Beatrice’s daily morning life", "Beatrice’s sandwich", "Why Beatrice wears socks", "Beatrice’s lunch box"], 2,
           "정답: ② Beatrice의 일상적인 아침 생활을 설명하는 글이다. (답지 35쪽)", sec_title=s, direction=d),
        mc(4, P_A + "\n\n04 윗글의 Beatrice에 대한 내용으로 일치하지 않는 것은?",
           ["샌드위치를 만들어 먹는다.", "대개 흰색의 양말을 신는다.", "그녀에게 금요일은 중요한 날이다.", "땅콩버터를 빵에 발라 먹는다.", "빵에 땅콩버터를 똑같은 양으로 바른다."], 3,
           "정답: ③. 금요일이 특별하다는 내용은 글에 없다. (답지 35쪽)", sec_title=s, direction=d),
        mc(5, P_B + "\n\n05 윗글의 밑줄 친 ⓐ의 의미로 가장 적절한 것은?",
           ["샌드위치를 잘 만드는 소녀", "실수를 하지 않는 소녀", "재능이 많은 소녀", "깔끔한 소녀", "똑똑한 소녀"], 2,
           "정답: ②. 바로 뒤에 “실수를 하지 않았기 때문에”라는 설명이 나온다. (답지 35쪽)", sec_title=s, direction=d),
        mc(6, P_B + "\n\n06 윗글의 밑줄 친 ⓑ와 바꿔 쓸 수 있는 말로 가장 적절한 것은?",
           ["She was not wonderful!", "She was very wonderful!", "She was very wonder!", "She was not wonder!", "She very was wonderful!"], 2,
           "정답: ② She was very wonderful! How wonderful = very wonderful이다. (답지 35쪽)", sec_title=s, direction=d),
        fill(7, P_B + "\n\n07 윗글에서 다음 영영풀이에 해당하는 단어를 찾아 쓰시오.\na person or team that wins a competition",
             ["champion"], "정답: champion. 저글링 챔피언이라는 문장에 나온다. (답지 35쪽)", sec_title=s, direction=d),
        mc(8, P_B + "\n\n08 윗글을 읽고, 알 수 있는 것은?",
           ["Beatrice의 외모", "Beatrice의 학교", "Beatrice의 성격", "Beatrice의 나이", "Beatrice의 특기"], 5,
           "정답: ⑤. 저글링 챔피언이라는 특기가 나온다. (답지 35쪽)", sec_title=s, direction=d),
        fill(9, P_B + "\n\n09 윗글을 읽고, 질문에 대한 답을 지문에서 찾아 쓰시오.\nQ. Why did people call Beatrice “Perfect Girl”?\n→ Because ______",
             ["she never made mistakes", "She never made mistakes"], "정답: she never made mistakes. (답지 35쪽)", sec_title=s, direction=d, phrase=True),
        mc(10, P_C + "\n\n10 윗글의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["English", "cooking", "science", "math", "music"], 2,
           "정답: ② cooking. 바로 뒤에 케이크를 만드는 내용이 나온다. (답지 35쪽)", sec_title=s, direction=d),
        mc(11, P_C + "\n\n11 윗글의 밑줄 친 ⓑ와 가장 비슷한 의미로 쓰인 것은?",
           ["She always fell.", "She almost fell.", "She did fall.", "She did not fall.", "She is falling."], 2,
           "정답: ② She almost fell. be about to는 ‘막 ~하려고 하다’이다. (답지 35쪽)", sec_title=s, direction=d),
        fill(12, P_C + "\n\n12 윗글의 밑줄 친 ⓒ가 가리키는 바를 우리말로 쓰시오. (15자 내외로 쓸 것)",
             ["미끄러운 것을 밟아서 넘어질 뻔한 것", "미끄러운 것을 밟아 넘어질 뻔한 것"],
             "정답: 미끄러운 것을 밟아서 넘어질 뻔한 것. (답지 35쪽)", sec_title=s, direction=d),
        mc(13, P_C + "\n\n13 윗글의 빈칸 ⓓ에 들어갈 말로 가장 적절한 것은?",
           ["happy", "nervous", "confident", "bored", "relaxed"], 2,
           "정답: ② nervous. 거의 넘어질 뻔한 일로 불안해졌다. (답지 35쪽)", sec_title=s, direction=d),
        mc(14, P_D + "\n\n14 윗글의 빈칸 ⓐ와 ⓑ에 들어갈 말이 바르게 짝지어진 것은?",
           ["ⓐ of · ⓑ with", "ⓐ of · ⓑ in", "ⓐ to · ⓑ with", "ⓐ for · ⓑ off", "ⓐ for · ⓑ of"], 5,
           "정답: ⑤ for / of. It is time for ~, be full of ~이다. (답지 35쪽)", sec_title=s, direction=d),
        mc(15, P_D + "\n\n15 윗글의 밑줄 친 ⓒ의 의미로 가장 적절한 것은?",
           ["Beatrice는 배가 아팠다.", "Beatrice는 신이 났다.", "Beatrice는 긴장했다.", "Beatrice는 기뻤다.", "Beatrice는 슬펐다."], 3,
           "정답: ③ 긴장했다. have butterflies in one’s stomach는 ‘긴장하다’이다. (답지 35쪽)", sec_title=s, direction=d),
        mc(16, P_D + "\n\n16 윗글의 빈칸에 들어갈 말로 가장 적절한 것은?",
           ["excited", "proud", "worried", "calm", "joyful"], 3,
           "정답: ③ worried. 바로 앞에 “Will I mess up?”이라는 걱정이 나온다. (답지 35쪽)", sec_title=s, direction=d),
        mc(17, P_E + "\n\n17 윗글의 밑줄 친 ①~⑤ 중 흐름상 어색한 것은?",
           ["①", "②", "③", "④", "⑤"], 3,
           "정답: ③. 재채기를 하려면 코(ears → nose)가 가렵다. (답지 35쪽)", sec_title=s, direction=d),
        mc(18, P_E + "\n\n18 윗글의 빈칸 (A)에 들어갈 말로 가장 적절한 것은?",
           ["thing", "some", "nothing", "something", "anything"], 4,
           "정답: ④ something. something strange가 된다. (답지 35쪽)", sec_title=s, direction=d),
        mc(19, P_E + "\n\n19 윗글의 밑줄 친 (B)의 우리말에 맞도록 영작할 때, 아래 빈칸 ⓐ에 들어갈 단어는?\nThe egg ______ ______ ⓐ______ ______ ______ head.",
           ["top", "of", "broke", "her", "on"], 1,
           "정답: ① top. The egg broke on top of her head.가 된다. (답지 35쪽)", sec_title=s, direction=d),
        fill(20, P_E + "\n\n20 윗글에서 다음 영영풀이에 해당하는 단어를 찾아 쓰시오.\nto have a feeling on your skin that makes you want to scratch",
             ["itch"], "정답: itch. (답지 35쪽)", sec_title=s, direction=d),
        mc(21, P_E + "\n\n21 윗글의 내용과 일치하지 않는 것은?",
           ["풍선에는 물이 들어 있었다.", "Beatrice는 소금 통을 추가했다.", "Beatrice는 코가 가려웠다.", "소금 통에는 소금이 가득 차 있었다.", "Beatrice의 머리 위에 떨어진 것은 계란이었다."], 4,
           "정답: ④. 소금 통에는 후추가 가득 차 있었다. (답지 35쪽)", sec_title=s, direction=d),
        sentence(22, P_F + "\n\n22 윗글의 밑줄 친 ⓐ를 How 감탄문으로 바꿔 쓰시오. (주어와 동사를 생략하고 필요시 어형을 바꿀 것)",
                 ["How surprising", "How surprising!"], "정답: How surprising. (답지 35쪽)", sec_title=s, direction=d),
        mc(23, P_F + "\n\n23 윗글을 통해 알 수 있는 Beatrice의 심경 변화로 가장 적절한 것은?",
           ["절망 → 분노", "슬픔 → 기쁨", "후회 → 만족", "당황 → 후련함", "기쁨 → 절망"], 4,
           "정답: ④ 당황 → 후련함. 실수 뒤 모두 함께 웃었다. (답지 35쪽)", sec_title=s, direction=d),
        mc(24, P_G + "\n\n24 윗글의 제목으로 가장 적절한 것은?",
           ["Beatrice, A Sad Night", "Beatrice’s Colorful Socks", "Beatrice, Go to Deep Sleep", "Beatrice, Find Her Real Name!", "Beatrice Becomes a Normal Girl"], 5,
           "정답: ⑤. 더 이상 완벽한 소녀가 아닌 평범한 소녀가 되었다. (답지 35쪽)", sec_title=s, direction=d),
        sentence(25, P_G + "\n\n25 윗글의 밑줄 친 우리말에 맞도록 조건에 맞게 바르게 영작하시오.\n조건 1. just call을 이용할 것.\n조건 2. 수여동사 구문을 이용할 것.\n조건 3. 총 5단어로 쓸 것.",
                 ["They just call her Beatrice.", "They just call her Beatrice"],
                 "정답: They just call her Beatrice. (답지 35쪽)", sec_title=s, direction=d),
    ]
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("reading-practice", "Reading 실전 문제", UNIT, "pp.216-219",
              "통과 80%. 본문 지문 25문항입니다. 지문은 문항 안에 함께 보입니다.", sections, qs))


BUILDERS = {"dialog-advanced": build_dialog_advanced,
            "grammar-practice": build_grammar_practice,
            "grammar-advanced": build_grammar_advanced,
            "reading-content": build_reading_content,
            "reading-lexgram": build_reading_lexgram,
            "reading-writing": build_reading_writing,
            "reading-practice": build_reading_practice}



R_A = ("[01-05] 다음 글을 읽고, 물음에 답하시오.\n"
       "For Beatrice, Friday began ⓐlike any other day. She wore the same white socks on ⓑ ______ of her feet. "
       "ⓒThen she made a sandwich. She put exactly the same amount of peanut butter on ⓓ ______ piece of bread.")
R_B = ("[06-10] 다음 글을 읽고, 물음에 답하시오.\n"
       "ⓐOn her way to school, her neighbor said, “Good morning, Perfect Girl.” "
       "People called Beatrice “Perfect Girl” ______ she never made mistakes. "
       "“Are you ready for tonight’s talent show?” her neighbor asked. Beatrice just smiled. "
       "She was a juggling champion. She won the talent show every year. ⓓHow wonderful she was!")
R_C = ("[11-13] 다음 글을 읽고, 물음에 답하시오.\n"
       "At school, Beatrice had a cooking class. To make a cake, she carefully took some eggs out of the ⓐ ______. "
       "When she turned around, she stepped on something ⓑ ______. (A)그녀는 막 넘어지려고 했다! "
       "But she didn’t. “That was close!” she thought. She almost made a mistake. "
       "Because of this, she began to feel nervous.")
R_D = ("[14-16] 다음 글을 읽고, 물음에 답하시오.\n"
       "It was ①time for the ②talent show. The school gym was full of people. "
       "They said, “Look! That’s ③Perfect Girl!” ⓐBeatrice had butterflies in her stomach. "
       "“Will I mess ④up? I’m ⑤glad,” she thought.")
R_E = ("[17-21] 다음 글을 읽고, 물음에 답하시오.\n"
       "Beatrice threw an egg into the air. ⓐ ______, she added a salt shaker. ⓑ ______, she added a water balloon. "
       "What a good start! But ⓒ ______ she felt something strange... Uh-oh! "
       "Beatrice’s nose started to itch. The salt shaker was full of... pepper! "
       "“ACHOO!” Beatrice missed the water balloon, and it ⓓfell to the floor. "
       "ⓔ ______ ... OOPS! The egg broke on top of her head.")
R_F = ("[22-23] 다음 글을 읽고, 물음에 답하시오.\n"
       "①For the first time ever, Beatrice made a mistake. (A)정말 놀라웠다! "
       "②She thought, “What should I do? Cry? Run off the stage?” "
       "③Suddenly, she began to cry together. ④The people looked at each other. "
       "⑤Then everyone started to laugh together.")
R_G = ("[24-25] 다음 글을 읽고, 물음에 답하시오.\n"
       "That night, Beatrice had a deep sleep. The next morning, she will wake up with a smile. "
       "She put a white sock on her left foot... and a green sock on her right foot! "
       "Now, people longer call her “Perfect Girl.” They just call her Beatrice.")


def build_reading_advanced():
    s = "Section A · Reading 심화"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, R_A + "\n\n01 윗글의 밑줄 친 ⓐ와 바꾸어 쓸 수 있는 것은?",
           ["heavily", "lightly", "as usual", "naturally", "on the same day"], 3,
           "정답: ③ as usual. like any other day는 ‘다른 날과 같이’ = ‘평상시처럼’이다. (답지 35쪽, pp.220-223)", sec_title=s, direction=d),
        fill("2-1", R_A + "\n\n02 윗글의 빈칸 ⓑ에 들어갈 알맞은 말을 보기에서 골라 쓰시오.\n보기: both / this / any / each / several / some\n(ⓑ에 들어갈 말)",
             ["both"], "정답: ⓑ both. ‘그녀의 양발’이므로 both of her feet이다. (답지 35쪽)", sec_title=s, direction=d, seconds=60),
        fill("2-2", R_A + "\n\n02 윗글의 빈칸 ⓓ에 들어갈 알맞은 말을 보기에서 골라 쓰시오.\n보기: both / this / any / each / several / some\n(ⓓ에 들어갈 말)",
             ["each"], "정답: ⓓ each. ‘각 빵 조각’이므로 each piece of bread이다. (답지 35쪽)", sec_title=s, direction=d, seconds=60),
        mc(3, R_A + "\n\n03 윗글의 밑줄 친 ⓒ와 같은 의미로 쓰인 것은?",
           ["I was very young then.", "He was a student then.", "We were best friends then.", "She lived in New York then.", "I woke up, then I brushed my teeth."], 5,
           "정답: ⑤. 본문의 then은 ‘그리고 나서’이고 ⑤도 같은 뜻이다. 나머지는 ‘그때’이다. (답지 35쪽)", sec_title=s, direction=d),
        mc(4, R_A + "\n\n04 What does Beatrice do before going to school according to the passage?",
           ["She eats a sandwich.", "She makes a sandwich.", "She drinks a cup of tea.", "She wears black socks.", "She cooks a big breakfast."], 2,
           "정답: ② She makes a sandwich. 샌드위치를 만들었다. (답지 35쪽)", sec_title=s, direction=d),
        mc(5, R_A + "\n\n05 윗글의 목적으로 가장 적절한 것은?",
           ["To introduce Beatrice’s morning routine", "To make Beatrice’s favorite dish", "To explain why Beatrice likes butter", "To shoot a video for Beatrice’s blog", "To explain why Beatrice wears white socks"], 1,
           "정답: ① Beatrice의 아침 일과를 소개한다. (답지 35쪽)", sec_title=s, direction=d),
        sentence(6, R_B + "\n\n06 윗글의 밑줄 친 ⓐ의 우리말을 괄호 안의 단어들을 배열하여 바르게 영작하시오. (필요시 어형을 바꿀 것)\n(school / On way / to / she)",
                 ["On her way to school"], "정답: On her way to school. (답지 35쪽)", sec_title=s, direction=d),
        mc(7, R_B + "\n\n07 윗글에서 밑줄 친 neighbor의 영영풀이로 가장 적절한 것은?",
           ["a person who you dislike", "a person who lives far away", "a person who you are afraid of", "a person who you need to help", "a person who lives near your home"], 5,
           "정답: ⑤ a person who lives near your home. neighbor는 ‘이웃’이다. (답지 35쪽)", sec_title=s, direction=d),
        mc(8, R_B + "\n\n08 윗글의 빈칸에 들어갈 말로 가장 적절한 것은?",
           ["but", "because", "and", "so", "then"], 2,
           "정답: ② because. ‘실수하지 않았기 때문에’라는 이유가 이어진다. (답지 35쪽)", sec_title=s, direction=d),
        sentence(9, R_B + "\n\n09 윗글의 밑줄 친 ⓓ의 감탄문을 네 단어로 된 평서문으로 바르게 고쳐 쓰시오. (대소문자 및 구두점에 유의할 것)",
                 ["She was very wonderful!", "She was very wonderful"], "정답: She was very wonderful! (답지 35쪽)", sec_title=s, direction=d),
        mc(10, R_B + "\n\n10 윗글에서 Beatrice에 대한 내용과 일치하지 않는 것은?",
           ["She is good at juggling.", "She doesn’t make a mistake.", "She always says hello to all neighbors.", "Her nickname is “Perfect Girl.”", "She always wins the talent show."], 3,
           "정답: ③. 이웃에게 먼저 인사한다는 내용은 글에 없다. (답지 35쪽)", sec_title=s, direction=d),
        mc(11, R_C + "\n\n11 윗글의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["oven", "table", "sink", "cupboard", "refrigerator"], 5,
           "정답: ⑤ refrigerator. 달걀은 냉장고에서 꺼낸다. (답지 35쪽)", sec_title=s, direction=d),
        mc(12, R_C + "\n\n12 윗글의 빈칸 ⓑ에 들어갈 가장 적절한 것은?",
           ["smooth", "rough", "slippery", "soft", "hard"], 3,
           "정답: ③ slippery. 미끄러운 것을 밟아 넘어질 뻔했다. (답지 35쪽)", sec_title=s, direction=d),
        sentence(13, R_C + "\n\n13 윗글의 밑줄 친 (A)의 우리말을 조건에 맞게 바르게 영작하시오.\n조건 1. about, fall을 이용할 것.\n조건 2. 총 5단어로 쓸 것.",
                 ["She was about to fall!", "She was about to fall"], "정답: She was about to fall! (답지 35쪽)", sec_title=s, direction=d),
        mc(14, R_D + "\n\n14 윗글의 밑줄 친 ①~⑤ 중 흐름상 어색한 것은?",
           ["① time", "② talent show", "③ Perfect Girl", "④ up", "⑤ glad"], 5,
           "정답: ⑤ glad. 긴장한 상황이므로 worried나 nervous가 알맞다. (답지 35쪽)", sec_title=s, direction=d),
        mc(15, R_D + "\n\n15 윗글의 밑줄 친 ⓐ의 의미로 가장 적절한 것은?",
           ["Beatrice was excited and cheerful.", "Beatrice was uneasy and nervous.", "Beatrice was glad and happy.", "Beatrice was hungry and angry.", "Beatrice was sleepy and tired."], 2,
           "정답: ②. have butterflies in one’s stomach는 ‘긴장하다’이다. (답지 35쪽)", sec_title=s, direction=d),
        fill(16, R_D + "\n\n16 윗글에서 다음 영영풀이에 해당하는 단어를 찾아 쓰시오.\na place where people go to exercise",
             ["gym"], "정답: gym. (답지 35쪽)", sec_title=s, direction=d),
        fill("17-1", R_E + "\n\n17 윗글의 빈칸 ⓐ에 들어갈 말을 보기에서 골라 쓰시오.\n보기: Always / Next / First / Finally / Sometimes\n(ⓐ에 들어갈 말)",
             ["Next"], "정답: ⓐ Next. 달걀을 던진 다음에 소금 통을 추가했다. (답지 35쪽)", sec_title=s, direction=d, seconds=60),
        fill("17-2", R_E + "\n\n17 윗글의 빈칸 ⓑ에 들어갈 말을 보기에서 골라 쓰시오.\n보기: Always / Next / First / Finally / Sometimes\n(ⓑ에 들어갈 말)",
             ["Finally"], "정답: ⓑ Finally. 마지막으로 물풍선을 추가했다. (답지 35쪽)", sec_title=s, direction=d, seconds=60),
        mc(18, R_E + "\n\n18 윗글의 빈칸 ⓒ와 ⓔ에 공통으로 들어갈 말로 가장 적절한 것은? (대·소문자 구분 없음)",
           ["so", "because", "therefore", "then", "when"], 4,
           "정답: ④ then. ‘그러고 나서’라는 뜻이다. (답지 35쪽)", sec_title=s, direction=d),
        mc(19, R_E + "\n\n19 윗글의 밑줄 친 ⓓ와 같은 의미로 쓰인 것은?",
           ["He fell over a stick.", "The book fell off the table.", "I wasn’t careful, and I fell.", "She fell on the slippery road.", "The baby fell a lot when he walked."], 2,
           "정답: ②. 본문의 fell은 ‘떨어졌다’이고 ②도 같은 뜻이다. 나머지는 ‘넘어지다’이다. (답지 35쪽)", sec_title=s, direction=d),
        mc(20, R_E + "\n\n20 윗글의 저글링 도구에 대한 설명으로 적절하지 않은 것은?",
           ["달걀이 사용되었다.", "소금 통이 사용되었다.", "물풍선이 사용되었다.", "소금이 사용되었다.", "물풍선이 바닥에 떨어졌다."], 4,
           "정답: ④. 소금 통에는 후추가 들어 있었다. (답지 35쪽)", sec_title=s, direction=d),
        mc(21, R_E + "\n\n21 According to the passage, which one is TRUE?",
           ["Beatrice felt good on stage.", "Beatrice sneezed because of pepper.", "Beatrice juggled with no mistakes.", "Beatrice practiced juggling for the first time.", "Beatrice came in last on the talent show."], 2,
           "정답: ②. 후추 때문에 재채기를 했다. (답지 35쪽)", sec_title=s, direction=d),
        mc(22, R_F + "\n\n22 윗글의 밑줄 친 ①~⑤ 중 흐름상 어색한 것은?",
           ["① For the first time ever, Beatrice made a mistake.", "② She thought, “What should I do? Cry? Run off the stage?”", "③ Suddenly, she began to cry together.", "④ The people looked at each other.", "⑤ Then everyone started to laugh together."], 3,
           "정답: ③. began to cry가 아니라 began to laugh가 알맞다. (답지 35쪽)", sec_title=s, direction=d),
        mc(23, R_F + "\n\n23 윗글의 밑줄 친 (A)의 우리말을 바르게 영작한 것은?",
           ["How a surprise!", "What a surprise!", "What surprising!", "What a surprising!", "What surprised!"], 2,
           "정답: ② What a surprise! (답지 35쪽)", sec_title=s, direction=d),
        mc(24, R_G + "\n\n24 윗글의 밑줄 친 부분이 의미하는 것으로 가장 적절한 것은?",
           ["Beatrice는 양말을 신는 것을 깜빡 잊었다.", "Beatrice는 다른 사람의 양말을 신었다.", "Beatrice는 양말을 짝짝이로 신는 것을 싫어했다.", "Beatrice는 완벽한 모습을 보여 주기 위해 노력했다.", "Beatrice는 더 이상 완벽함에 얽매이지 않고 자유롭다."], 5,
           "정답: ⑤. 짝짝이 양말은 완벽함에서 벗어났다는 뜻이다. (답지 35쪽)", sec_title=s, direction=d),
        fill("25-1", R_G + "\n\n25 윗글에서 어색한 부분 2곳을 찾아 바르게 고쳐 쓰시오. (1) will wake up 부분을 바르게 고쳐 쓰시오.",
             ["woke up"], "정답: (1) woke up. 과거 이야기이므로 woke up이다. (답지 35쪽)", sec_title=s, direction=d, seconds=60),
    ]
    qs.append(fill("25-2", R_G + "\n\n25 윗글에서 어색한 부분 2곳을 찾아 바르게 고쳐 쓰시오. (2) longer call 부분을 바르게 고쳐 쓰시오.",
                   ["no longer call"], "정답: (2) no longer call. ‘더 이상 ~하지 않는다’는 no longer call이다. (답지 35쪽)", sec_title=s, direction=d, seconds=60))
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("reading-advanced", "Reading 심화 문제", UNIT, "pp.220-223",
              "통과 80%. 본문 심화 27문항입니다. 지문은 문항 안에 함께 보입니다.", sections, qs))


BUILDERS["reading-advanced"] = build_reading_advanced

P_PLUS_A = ("01 다음 글의 ①~⑤ 중 흐름상 어색한 것은?\n"
            "I’ll ①tell you ②about Inside Out. Its ③lesson is that emotions ④aren’t good or bad. "
            "I like the lesson. I learned that all emotions are ⑤unimportant.")
P_PLUS_B = ("[02-05] 다음 글을 읽고, 물음에 답하시오.\n"
            "People called Beatrice “Perfect Girl” because she never ⓐ ______ mistakes. She was a juggling champion. "
            "She won the talent show every year. In a cooking class, (A)그녀는 미끄러운 무언가를 밟았다. "
            "She almost fell and began to feel ⓑ ______. At the talent show, she ⓒ ______ a mistake. "
            "The salt shaker was full of pepper. Her nose itched, and she didn’t catch the water balloon or the egg. "
            "ⓓ ______ crying or running off the stage, she just laughed with everyone. "
            "That night, she had a deep sleep. After that day, people just called her Beatrice.")
P_PLUS_C = ("[06-07] 다음 글을 읽고, 물음에 답하시오.\n"
            "I made a mistake in my art class. I dropped some red paint on my blue sky. "
            "But after I mixed the colors together, the sky looked ⓐ ______! ⓑ나는 중요한 것을 배웠다. "
            "Mistakes are not always bad.")


def build_plus_practice():
    s = "Section A · Plus 기타 지문"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, P_PLUS_A, ["① tell you", "② about", "③ lesson", "④ aren’t good or bad", "⑤ unimportant"], 5,
           "정답: ⑤. 모든 감정이 중요하다는 교훈이므로 unimportant가 아니라 important여야 한다. (답지 36쪽, p.225)", sec_title=s, direction=d),
        mc(2, P_PLUS_B + "\n\n02 윗글의 빈칸 ⓐ와 ⓒ에 공통으로 들어갈 말로 가장 적절한 것은?",
           ["had", "got", "took", "wrote", "made"], 5,
           "정답: ⑤ made. make a mistake는 ‘실수하다’이다. (답지 36쪽)", sec_title=s, direction=d),
        sentence(3, P_PLUS_B + "\n\n03 윗글의 밑줄 친 (A)의 우리말에 맞도록 괄호 안의 단어들을 이용하여 5단어로 바르게 영작하시오.\n(stepped, slippery)",
                 ["she stepped on something slippery", "She stepped on something slippery"],
                 "정답: she stepped on something slippery. (답지 36쪽)", sec_title=s, direction=d),
        mc(4, P_PLUS_B + "\n\n04 윗글의 빈칸 ⓑ에 들어갈 말로 가장 적절한 것은?",
           ["excited", "nervous", "sad", "happy", "sleepy"], 2,
           "정답: ② nervous. 넘어질 뻔한 뒤 불안해졌다. (답지 36쪽)", sec_title=s, direction=d),
        mc(5, P_PLUS_B + "\n\n05 윗글의 빈칸 ⓓ에 들어갈 말로 가장 적절한 것은?",
           ["Instead of", "Before", "After", "when", "During"], 1,
           "정답: ① Instead of. ‘~하는 대신에’라는 뜻이다. (답지 36쪽)", sec_title=s, direction=d),
        mc(6, P_PLUS_C + "\n\n06 윗글의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["ugly", "terrible", "beautiful", "blue", "delicious"], 3,
           "정답: ③ beautiful. 색을 섞은 뒤 하늘이 아름다워 보였다. (답지 36쪽)", sec_title=s, direction=d),
        sentence(7, P_PLUS_C + "\n\n07 윗글의 밑줄 친 ⓑ의 우리말에 맞도록 괄호 안의 단어들을 이용하여 바르게 영작하시오. (필요시 어형을 바꿀 것)\n(learn, important)",
                 ["I learned something important.", "I learned something important"],
                 "정답: I learned something important. (답지 36쪽)", sec_title=s, direction=d),
    ]
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("plus-practice", "Plus 기타 지문 실전 문제", UNIT, "p.225",
              "통과 80%. 다른 지문 7문항입니다. 지문은 문항 안에 함께 보입니다.", sections, qs))


WF_DIALOG = ("[06-09] 다음 대화를 읽고, 물음에 답하시오.\n"
             "B: Hi, everyone! Welcome to our channel! I’m Tony.\n"
             "G: And I’m Ivy. Today, we’re going to talk about a good book.\n"
             "B: Right. The book is Charlotte’s Web by E. B. White.\n"
             "G: (A) ______ tell our viewers about the story?\n"
             "B: Sure. It’s about Charlotte, a wise spider, and Wilbur, a little pig. "
             "Charlotte saves Wilbur ⓐ ______ danger, and they become close friends.\n"
             "G: We can learn about true friendship from this story.\n"
             "B: Yes. Also, there is a ⓑ ______ version of the story.\n"
             "G: How did you like the movie? (B)저는 당신의 의견이 궁금합니다.\n"
             "B: I loved it. I think our ⓒ ______ will enjoy both the book and the movie.")
WF_READ1 = ("[16-19] 다음 글을 읽고 물음에 답하시오.\n"
            "On her way to school, her neighbor said, “Good morning, Perfect Girl.” "
            "ⓐ사람들은 Beatrice를 “완벽한 소녀”라고 불렀다 because she never made mistakes. "
            "“Are you ready for tonight’s talent show?” her neighbor asked. Beatrice just smiled. "
            "She was a juggling champion. She won the ⓑ ______ every year. ⓒHow wonderful she was!")
WF_READ2 = ("[20-22] 다음 글을 읽고, 물음에 답하시오.\n"
            "At school, Beatrice had a cooking class. To make a cake, she carefully took some eggs out of the refrigerator. "
            "When she turned around, she stepped on something slippery. ⓐ그녀는 막 넘어지려고 하였다! "
            "But she didn’t. “That was close!” she thought. She almost made a mistake. Because of this, she began to feel nervous. "
            "It was time for the talent show. The school gym was full of people. They said, “Look! That’s Perfect Girl!” "
            "ⓑBeatrice는 마음이 편하지 않았다. “Will I mess up? I’m worried,” she thought.")
WF_READ3 = ("[23-25] 다음 글을 읽고, 물음에 답하시오.\n"
            "For the first time ever, Beatrice made a mistake. ⓐ정말 놀라웠다! "
            "She thought, “What should I do? Cry? Run off the stage?” Suddenly, she began to laugh loudly. "
            "The people looked at each other. Then everyone started to ⓑ ______ together. "
            "That night, Beatrice had a deep sleep. The next morning, she woke up with a smile. "
            "She put a white sock on her left foot and a green sock on her right foot! "
            "ⓒ이제, 사람들은 그녀를 더 이상 “완벽한 소녀”라고 부르지 않는다. They just call her Beatrice.")


def build_writing_finish():
    s = "Section A · 서술형"
    d = "빈칸에 들어갈 말을 쓰시오."
    qs = [
        fill(1, "01 다음 우리말에 맞도록 빈칸에 들어갈 적절한 말을 쓰시오.\n나는 우리 시청자들이 책과 영화 둘 다를 즐길 거라고 생각한다.\n→ I think our viewers will enjoy ______ the book ______ the movie.",
             ["both, and", "both and"], "정답: both, and. both A and B는 ‘A와 B 둘 다’이다. (답지 37쪽, pp.226-229)", sec_title=s, direction=d),
        fill(2, "02 다음 영영풀이에 해당하는 단어를 주어진 철자로 시작하여 쓰시오.\na strong feeling such as love, fear, or anger\n(e ______)",
             ["emotion"], "정답: emotion. (답지 37쪽)", sec_title=s, direction=d),
        fill(3, "03 다음 빈칸에 공통으로 들어갈 적절한 말을 쓰시오.\n• I made a ______ on the test.\n• They became better players through ______s.",
             ["mistake"], "정답: mistake. make a mistake는 ‘실수하다’, through mistake는 ‘실수로’이다. (답지 37쪽)", sec_title=s, direction=d),
        fill(4, "04 다음 우리말을 영어로 옮길 때, 빈칸에 들어갈 적절한 말을 쓰시오.\n<The Hobbit>을 빌리는 게 어때요?\n→ Why don’t you ______ The Hobbit?",
             ["borrow"], "정답: borrow. (답지 37쪽)", sec_title=s, direction=d),
        fill(5, "05 다음 대화의 빈칸에 들어갈 적절한 말을 주어진 철자로 시작하여 쓰시오.\nA: Sure. Can you show your library card to me, ______?\nB: Here you go.\n(p ______)",
             ["please"], "정답: please. (답지 37쪽)", sec_title=s, direction=d),
        fill(6, WF_DIALOG + "\n\n06 위 대화의 빈칸 (A)에 들어갈 말을 쓰시오. (요청하는 표현이 되게 할 것)",
             ["Can you", "Could you", "Would you"], "정답: Can you (Could you, Would you). (답지 37쪽)", sec_title=s, direction=d, phrase=True),
        fill(7, WF_DIALOG + "\n\n07 위 대화의 빈칸 ⓐ에 들어갈 말을 쓰시오.",
             ["from"], "정답: from. save A from B는 ‘A를 B로부터 구하다’이다. (답지 37쪽)", sec_title=s, direction=d),
        fill("8-1", WF_DIALOG + "\n\n08 위 대화의 빈칸 ⓑ에 들어갈 말을 쓰시오.",
             ["movie"], "정답: ⓑ movie. 영화 버전이 있다는 뜻이다. (답지 37쪽)", sec_title=s, direction=d, seconds=60),
        fill("8-2", WF_DIALOG + "\n\n08 위 대화의 빈칸 ⓒ에 들어갈 말을 쓰시오.",
             ["viewers"], "정답: ⓒ viewers. 시청자들이라는 뜻이다. (답지 37쪽)", sec_title=s, direction=d, seconds=60),
        sentence(9, WF_DIALOG + "\n\n09 위 대화의 밑줄 친 (B)의 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하시오.\n(curious / opinion / I / about / am / your / .)",
                 ["I am curious about your opinion.", "I am curious about your opinion"],
                 "정답: I am curious about your opinion. (답지 37쪽)", sec_title=s, direction=d),
        fill(10, "10 다음 문장을 부정문으로 바꿀 때, 빈칸에 들어갈 적절한 말을 쓰시오.\nI saw something unusual at school.\n→ I didn’t see ______ unusual at school.",
             ["anything"], "정답: anything. 부정문에서는 something 대신 anything을 쓴다. (답지 37쪽)", sec_title=s, direction=d),
        sentence(11, "11 다음 우리말을 괄호 안의 단어들을 이용하여 바르게 영작하시오. (대·소문자 구분할 것)\n그 영화는 정말 감동적이었어! (how / was / touching / movie / the / !)",
                 ["How touching the movie was!", "How touching the movie was"], "정답: How touching the movie was! (답지 37쪽)", sec_title=s, direction=d),
        sentence(12, "12 다음 우리말에 맞도록 괄호 안의 단어들을 이용하여 바르게 영작하시오. (총 7단어로 쓸 것)\n너는 걱정할 특별한 것이 없다. (special, worry about, nothing)",
                 ["You have nothing special to worry about.", "You have nothing special to worry about"],
                 "정답: You have nothing special to worry about. (답지 37쪽)", sec_title=s, direction=d),
        fill(13, "13 다음 대화를 읽고, 빈칸에 들어갈 적절한 말을 쓰시오.\nA: I got 100 score on my English test!\nB: Wow! ______ great news! (와! 정말 멋진 소식이야!)",
             ["What"], "정답: What. What great news!는 감탄문이다. (답지 37쪽)", sec_title=s, direction=d),
        sentence(14, "14 다음 우리말에 맞도록 괄호 안의 단어들을 순서대로 바르게 배열하시오.\n나는 흥미로운 무언가를 읽고 싶다.\n(interesting / to / read / something / want / I / .)",
                 ["I want to read something interesting.", "I want to read something interesting"],
                 "정답: I want to read something interesting. (답지 37쪽)", sec_title=s, direction=d),
        sentence("15-1", "15 다음 문장을 괄호 안의 지시대로 각각 바꾸어 쓰시오.\nThe view is very beautiful.\n(1) (What 감탄문)",
                 ["What a beautiful view it is!", "What a beautiful view it is"], "정답: What a beautiful view it is! (답지 37쪽)", sec_title=s, direction=d, seconds=90),
        sentence("15-2", "15 다음 문장을 괄호 안의 지시대로 각각 바꾸어 쓰시오.\nThe view is very beautiful.\n(2) (How 감탄문)",
                 ["How beautiful the view is!", "How beautiful the view is"], "정답: How beautiful the view is! (답지 37쪽)", sec_title=s, direction=d, seconds=90),
        sentence(16, WF_READ1 + "\n\n16 윗글의 밑줄 친 ⓐ의 우리말을 조건에 맞게 바르게 영작하시오.\n조건: “Perfect Girl”을 이용할 것. 총 5단어로 쓸 것. 대소문자에 유의할 것.",
                 ["People called Beatrice \"Perfect Girl\"", "People called Beatrice “Perfect Girl”"],
                 "정답: People called Beatrice “Perfect Girl”. (답지 37쪽)", sec_title=s, direction=d),
        fill(17, WF_READ1 + "\n\n17 윗글의 빈칸 ⓑ에 들어갈 적절한 말을 글에서 찾아 쓰시오. (두 단어로 쓸 것)",
             ["talent show"], "정답: talent show. (답지 37쪽)", sec_title=s, direction=d, phrase=True),
        sentence(18, WF_READ1 + "\n\n18 윗글의 밑줄 친 ⓒ를 조건에 맞게 바꿔 쓰시오.\n조건 1. What으로 문장을 시작할 것. 2. person을 추가할 것. 3. 총 6단어로 쓸 것. 4. 대소문자 및 구두점에 유의할 것.",
                 ["What a wonderful person she was!", "What a wonderful person she was"],
                 "정답: What a wonderful person she was! (답지 37쪽)", sec_title=s, direction=d),
        fill("19-1", WF_READ1 + "\n\n19 윗글을 읽고, 빈칸에 알맞은 말을 쓰시오.\nPeople (1) ______ Beatrice “Perfect Girl” because she doesn’t (2) ______ mistakes.\n((1)에 들어갈 말)",
             ["called"], "정답: (1) called. 과거 이야기이므로 called이다. (답지 37쪽)", sec_title=s, direction=d, seconds=60),
        sentence(20, WF_READ2 + "\n\n20 윗글의 밑줄 친 ⓐ의 우리말에 맞도록 괄호 안의 단어들을 이용하여 다섯 단어로 바르게 영작하시오.\n(about, fall)",
                 ["She was about to fall!", "She was about to fall"], "정답: She was about to fall! (답지 37쪽)", sec_title=s, direction=d),
        sentence(21, WF_READ2 + "\n\n21 윗글의 밑줄 친 ⓑ의 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하시오. (필요시 어형을 바꿀 것)\n(in / Beatrice / she / butterfly / stomach / have / .)",
                 ["Beatrice had butterflies in her stomach.", "Beatrice had butterflies in her stomach"],
                 "정답: Beatrice had butterflies in her stomach. (답지 37쪽)", sec_title=s, direction=d),
        fill(22, WF_READ2 + "\n\n22 윗글에서 다음 영영풀이에 해당하는 단어를 찾아 쓰시오.\na machine that keeps food and drinks cold",
             ["refrigerator"], "정답: refrigerator. (답지 37쪽)", sec_title=s, direction=d),
        sentence(23, WF_READ3 + "\n\n23 윗글의 밑줄 친 ⓐ를 How로 시작하는 두 단어의 감탄문으로 바꾸시오.",
                 ["How surprising", "How surprising!"], "정답: How surprising. (답지 37쪽)", sec_title=s, direction=d),
        fill(24, WF_READ3 + "\n\n24 윗글의 빈칸 ⓑ에 들어갈 한 단어를 글에서 찾아 쓰시오.",
             ["laugh"], "정답: laugh. start to laugh together가 된다. (답지 37쪽)", sec_title=s, direction=d),
        sentence(25, WF_READ3 + "\n\n25 윗글의 밑줄 친 ⓒ의 우리말에 맞도록 조건에 맞게 바르게 영작하시오.\n조건 1. longer, “Perfect Girl”을 이용할 것. 2. 총 8단어로 쓸 것.",
                 ["Now, people no longer call her \"Perfect Girl\".", "Now people no longer call her \"Perfect Girl\""],
                 "정답: Now, people no longer call her “Perfect Girl”. (답지 37쪽)", sec_title=s, direction=d),
    ]
    qs.append(fill("19-2", WF_READ1 + "\n\n19 윗글을 읽고, 빈칸에 알맞은 말을 쓰시오.\nPeople (1) called Beatrice “Perfect Girl” because she doesn’t (2) ______ mistakes.\n((2)에 들어갈 말)",
                   ["make"], "정답: (2) make. doesn’t 뒤에는 동사원형 make를 쓴다. (답지 37쪽)", sec_title=s, direction=d, seconds=60))
    sections = [sec("s1", s, d, WORDS, len(qs))]
    write(doc("writing-finish", "서술형 끝내기", UNIT, "pp.226-229",
              "통과 80%. 서술형 27문항입니다. 우리말에 맞게 쓰고, 어형 변화에 주의하세요.", sections, qs))


BUILDERS["plus-practice"] = build_plus_practice
BUILDERS["writing-finish"] = build_writing_finish


import re as _re

PASSAGE = [
    (1, "For Beatrice, Friday began like any other day.", ["For", "began", "any"], ["any", "began", "for"]),
    (2, "She wore the same white socks on both of her feet. Then she made a sandwich.",
     ["wore", "same", "socks", "both", "Then", "made", "sandwich"],
     ["both", "wore", "same", "socks", "sandwich", "then", "made"]),
    (3, "She put exactly the same amount of peanut butter on each piece of bread.",
     ["exactly", "same", "peanut", "each"], ["peanut", "exactly", "each", "same"]),
    (4, "On her way to school, her neighbor said, “Good morning, Perfect Girl.”",
     ["On", "way", "neighbor", "Perfect"], ["perfect", "on", "neighbor", "way"]),
    (5, "People called Beatrice “Perfect Girl” because she never made mistakes.",
     ["People", "because", "never", "mistakes"], ["because", "mistakes", "people", "never"]),
    (6, "“Are you ready for tonight’s talent show?” her neighbor asked.",
     ["ready", "talent", "neighbor"], ["neighbor", "ready", "talent"]),
    (7, "Beatrice just smiled. She was a juggling champion.",
     ["just", "smiled", "was", "juggling", "champion"], ["smiled", "just", "juggling", "was", "champion"]),
    (8, "She won the talent show every year. How wonderful she was!",
     ["won", "talent", "every", "How", "wonderful", "was"], ["every", "talent", "won", "was", "wonderful", "how"]),
    (9, "At school, Beatrice had a cooking class.", ["At", "had", "cooking"], ["cooking", "at", "had"]),
    (10, "To make a cake, she carefully took some eggs out of the refrigerator.",
     ["make", "carefully", "some", "refrigerator"], ["refrigerator", "carefully", "some", "make"]),
    (11, "When she turned around, she stepped on something slippery.",
     ["When", "turned", "stepped", "slippery"], ["slippery", "when", "stepped", "turned"]),
    (12, "She was about to fall! But she didn’t.", ["about", "fall", "But"], ["but", "about", "fall"]),
    (13, "“That was close!” she thought. She almost made a mistake.",
     ["That", "close", "thought", "almost", "made", "mistake"],
     ["thought", "that", "close", "mistake", "made", "almost"]),
    (14, "Because of this, she began to feel nervous.", ["of", "began", "nervous"], ["nervous", "of", "began"]),
    (15, "It was time for the talent show. The school gym was full of people.",
     ["It", "time", "talent", "gym", "full", "people"],
     ["talent", "time", "it", "people", "gym", "full"]),
    (16, "They said, “Look! That’s Perfect Girl!” Beatrice had butterflies in her stomach.",
     ["They", "Look", "Perfect", "had", "butterflies", "in", "stomach"],
     ["perfect", "they", "look", "stomach", "in", "had", "butterflies"]),
    (17, "“Will I mess up? I’m worried,” she thought.", ["mess", "up", "worried"], ["up", "mess", "worried"]),
    (18, "Beatrice threw an egg into the air. Next, she added a salt shaker.",
     ["threw", "egg", "air", "Next", "added", "salt"],
     ["egg", "air", "threw", "salt", "added", "next"]),
    (19, "Finally, she added a water balloon. What a good start!",
     ["Finally", "water", "balloon", "What", "good", "start"],
     ["balloon", "water", "finally", "good", "what", "start"]),
    (20, "But then she felt something strange... Uh-oh!", ["then", "felt", "something"], ["felt", "then", "something"]),
    (21, "Beatrice’s nose started to itch. The salt shaker was full of... pepper!",
     ["nose", "started", "itch", "salt", "shaker", "full"],
     ["itch", "nose", "started", "shaker", "salt", "full"]),
    (22, "“ACHOO!” Beatrice missed the water balloon, and it fell to the floor.",
     ["missed", "water", "fell", "floor"], ["floor", "water", "fell", "missed"]),
    (23, "Then... OOPS! The egg broke on top of her head.", ["egg", "broke", "top"], ["top", "broke", "egg"]),
    (24, "For the first time ever, Beatrice made a mistake. What a surprise!",
     ["For", "time", "mistake", "What", "surprise"], ["time", "for", "mistake", "surprise", "what"]),
    (25, "She thought, “What should I do? Cry? Run off the stage?”",
     ["should", "Cry", "off", "stage"], ["off", "stage", "cry", "should"]),
    (26, "Suddenly, she began to laugh loudly. The people looked at each other.",
     ["Suddenly", "began", "loudly", "people", "at", "other"],
     ["loudly", "suddenly", "began", "at", "people", "other"]),
    (27, "Then everyone started to laugh together.", ["everyone", "to", "together"], ["together", "to", "everyone"]),
    (28, "That night, Beatrice had a deep sleep. The next morning, she woke up with a smile.",
     ["That", "deep", "sleep", "next", "woke", "with"],
     ["deep", "that", "sleep", "with", "next", "woke"]),
    (29, "She put a white sock on her left foot... and a green sock on her right foot!",
     ["put", "on", "green", "foot"], ["foot", "on", "put", "green"]),
    (30, "Now, people no longer call her “Perfect Girl.” They just call her Beatrice.",
     ["no", "longer", "her", "just", "call", "her"],
     ["her", "longer", "no", "her", "just", "call"]),
]

# pp.54-55, no word bank
CLOZE = {
    1: ["For", "began", "any"],
    2: ["wore", "same", "both", "Then", "made", "sandwich"],
    3: ["exactly", "amount", "peanut", "each"],
    4: ["On", "way", "neighbor"],
    5: ["called", "because", "never", "mistakes"],
    6: ["Are", "ready", "tonight’s"],
    7: ["just", "smiled", "juggling", "champion"],
    8: ["won", "talent", "every", "wonderful", "was"],
    9: ["At", "had", "cooking"],
    10: ["To", "took", "eggs", "of"],
    11: ["When", "turned", "stepped", "something"],
    12: ["about", "fall"],
    13: ["That", "close", "thought", "almost", "made", "mistake"],
    14: ["of", "began", "feel"],
    15: ["It", "time", "talent", "gym", "of"],
    16: ["Look", "Perfect", "had", "in", "stomach"],
    17: ["mess", "worried"],
    18: ["threw", "egg", "into", "Next", "salt"],
    19: ["added", "balloon", "What", "good"],
    20: ["felt", "strange"],
    21: ["nose", "to", "shaker", "full", "pepper"],
    22: ["missed", "water", "fell"],
    23: ["egg", "broke", "top"],
    24: ["first", "ever", "made", "What"],
    25: ["should", "Run"],
    26: ["Suddenly", "laugh", "looked", "each"],
    27: ["everyone", "together"],
    28: ["had", "deep", "morning", "up", "smile"],
    29: ["put", "sock", "her", "foot"],
    30: ["Now", "no", "call", "just", "call"],
}


def _skeleton(sentence, answers):
    """Replace each answer word, left to right, with a numbered blank."""
    out = sentence
    pos = 0
    for i, w in enumerate(answers, start=1):
        m = _re.compile(r"(?<![\w’'])" + _re.escape(w) + r"(?![\w’'])").search(out, pos)
        if not m:
            raise SystemExit(f"cannot place {w!r} in {sentence!r}")
        out = out[:m.start()] + f"({i})______" + out[m.end():]
        pos = m.start() + len(f"({i})______")
    return out


def build_x10_reading_sentence():
    s = "Section A · Reading"
    d = "다음 빈칸에 들어갈 적절한 말을 골라 쓰시오."
    qs = []
    for num, sentence, answers, bank in PASSAGE:
        skel = _skeleton(sentence, answers)
        prompt = "The Story of a Perfect Girl\n" + skel + "\n(" + " , ".join(bank) + ")"
        for i, ans in enumerate(answers, start=1):
            idx = [b.lower() for b in bank].index(ans.lower()) + 1
            q = {
                "id": f"{num}-{i}",
                "label": str(num),
                "sourceId": num,
                "section": "s1",
                "sectionTitle": s,
                "directionKo": d,
                "ruleKo": "보기에서 그 빈칸에 맞는 말 하나를 누르세요.",
                "sectionInstructionKo": f"{d} 보기에서 그 빈칸에 맞는 말 하나를 누르세요.",
                "answerMode": "bank",
                "answerModeTag": "Choose · 보기에서 고르기",
                "explainKo": f"정답: {', '.join(answers)}. (답지 49쪽, X-10 pp.52-53)",
                "type": "bank",
                "select": "one",
                "group": f"RS-{num:02d}",
                "promptEn": prompt,
                "choices": bank,
                "correctIndexes": [idx],
                "focusBlank": str(i),
                "promptKo": f"이 문항은 ({i}) 빈칸만 고릅니다.",
                "seconds": 60,
            }
            qs.append(q)
    sections = [sec("s1", s, d, ("bank", "Choose · 보기에서 고르기", "보기에서 그 빈칸에 맞는 말 하나를 누르세요."), len(qs))]
    write(doc("x10-reading-sentence", "Reading 문장 완성하기 X-10", UNIT, "X-10 pp.52-53",
              "통과 80%. X-10 본문 30문장을 빈칸마다 하나씩 나눴습니다. 보기에서 골라 누르세요.", sections, qs))


def build_x10_reading_cloze():
    s = "Section A · Reading"
    d = "다음 빈칸에 들어갈 적절한 말을 쓰시오."
    qs = []
    for num, sentence, _, _ in PASSAGE:
        answers = CLOZE[num]
        skel = _skeleton(sentence, answers)
        prompt = "The Story of a Perfect Girl\n" + skel
        for i, ans in enumerate(answers, start=1):
            q = fill(f"{num}-{i}", prompt, [ans],
                     f"정답: {', '.join(answers)}. (답지 49쪽, X-10 pp.54-55)",
                     sec_title=s, direction=d, seconds=60)
            q["label"] = str(num)
            q["sourceId"] = num
            q["promptKo"] = f"이 문항은 ({i}) 빈칸만 씁니다."
            q["id"] = f"{num}-{i}"
            qs.append(q)
    sections = [sec("s1", s, d, WORDS, len(qs))]
    write(doc("x10-reading-cloze", "Reading 빈칸 완성하기 X-10", UNIT, "X-10 pp.54-55",
              "통과 80%. 보기 없이 본문 30문장의 빈칸을 채웁니다. 빈칸마다 한 문항입니다.", sections, qs))


BUILDERS["x10-reading-sentence"] = build_x10_reading_sentence
BUILDERS["x10-reading-cloze"] = build_x10_reading_cloze


F1_D1 = ("[04-06] 다음 대화를 읽고 물음에 답하시오.\n"
         "G: Excuse me. I’m trying to choose a book. ⓐ저를 도와주시겠어요?\n"
         "M: Sure. What kind of book are you looking for?\n"
         "G: Well, I want to read about animals.\n"
         "M: Okay. Books about animals are on this shelf. What kind of animals are you interested in?\n"
         "G: ⓑ ______\n"
         "M: Then what about this book, The Blue Planet? It’s about animals in the deep sea.\n"
         "G: That sounds perfect. Thank you.\n"
         "M: You’re welcome.")
F1_D2 = ("[07-08] 다음 대화를 읽고, 물음에 답하시오.\n"
         "B: Hi, everyone! Welcome to our channel! I’m Tony.\n"
         "G: And I’m Ivy. Today, we’re going to talk about a good book.\n"
         "B: Right. The book is Charlotte’s Web by E. B. White.\n"
         "G: Can you tell our viewers about the story?\n"
         "B: Sure. It’s about Charlotte, a wise spider, and Wilbur, a little pig. "
         "Charlotte saves Wilbur from danger, and they become close friends.\n"
         "G: We can learn about true friendship from this story.\n"
         "B: Yes. Also, there is a movie version of the story.\n"
         "G: 영화는 어땠어? I’m curious about your opinion.\n"
         "B: I loved it. I think our viewers will enjoy both the book and the movie.")
F1_P14 = ("[14-16] 다음 글을 읽고 물음에 답하시오.\n"
          "For Beatrice, Friday began like any other day. She wore the same white socks on both of her ⓐfeet. "
          "Then she made a sandwich. She put ⓑexactly the same amount of peanut butter on each piece of bread. "
          "그녀가 학교에 가는 길에, her neighbor said, “Good morning, Perfect Girl.” "
          "People called Beatrice “Perfect Girl” because she ⓒalways made mistakes. "
          "“Are you ready for tonight’s talent show?” her neighbor asked. Beatrice just smiled. "
          "She was a juggling ⓓchampion. She won the talent show every year. How ⓔwonderful she was!")
F1_P17 = ("[17-19] 다음 글을 읽고 물음에 답하시오.\n"
          "At school, Beatrice had ⓐa cooking class. To make a cake, she carefully took some eggs out of the refrigerator. "
          "When she turned around, she stepped on ⓒslippery something. She was about to fall! (a)But she didn’t. "
          "“That ⓓwas close!” she thought. She almost made a mistake. ⓔBecause of this, she began to feel nervous.")
F1_P20 = ("[20-22] 다음 글을 읽고 물음에 답하시오.\n"
          "It was time for the talent show. The school gym was full of people. (①) They said, “Look! That’s Perfect Girl!” "
          "Beatrice had butterflies in her stomach. (②) “Will I mess up? I’m worried,” she thought.\n"
          "Beatrice threw an egg into the air. (③) Finally, she added a water balloon. (A) ______ a good start! "
          "But then she felt something (B) ______ ... Uh-oh! (④) Beatrice’s nose started to itch. "
          "The salt shaker was full of... pepper! “ACHOO!” Beatrice missed the water balloon, and it (C) ______ to the floor. "
          "(⑤) Then... OOPS! The egg broke on top of her head.")
F1_P23 = ("[23-25] 다음 글을 읽고, 물음에 답하시오.\n"
          "For the first time ever, Beatrice made a mistake. ⓐHow a surprise! She thought, “What should I do? "
          "Cry? Run off the stage?” ⓑSuddenly, she began to laugh loudly. The people looked at each other. "
          "Then everyone started ⓒto laugh together.\n"
          "That night, Beatrice had a deep sleep. The next morning, she woke up with a smile. "
          "She put a white sock on her left foot... and a green sock ⓓon her right foot!\n"
          "Now, people no longer call her “Perfect Girl.” 그들은 그녀를 그저 Beatrice라고 부른다.")


def build_final_1():
    s = "Section A · 1회"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, "01 다음 짝지어진 두 단어의 관계가 나머지와 다른 것은? (어휘)",
           ["sure : certain", "hot : spicy", "safe : dangerous", "close : near", "fantastic : wonderful"], 3,
           "정답: ③ safe : dangerous는 반의어이고 나머지는 유의어이다. (답지 58쪽, pp.96-99)", sec_title=s, direction=d),
        mc(2, "02 다음 밑줄 친 부분의 우리말 뜻이 바르지 않은 것은? (어휘)\n① Let’s look for your shoes. (~을 찾다)\n② They are proud of their son. (~을 자랑스러워하다)\n③ The movie is about to begin. (~하는 것에 대하여)\n④ They no longer go to school here. (더 이상 ~이 아닌)\n⑤ She walked instead of taking the bus. (~대신에)",
           ["①", "②", "③", "④", "⑤"], 3,
           "정답: ③. be about to는 ‘막 ~하려고 하다’이다. (답지 58쪽)", sec_title=s, direction=d),
        mc(3, "03 다음 빈칸에 들어갈 말로 적절하지 않은 것은? (어휘)\n• I need a small ______ of sugar.\n• I ______ when I watch comedy shows.\n• We invited our ______ to the party.\n• Please ______ some sugar to the coffee.",
           ["add", "amount", "laugh", "mistake", "neighbor"], 4,
           "정답: ④ mistake. 네 문장 어디에도 들어가지 않는다. (답지 58쪽)", sec_title=s, direction=d),
        mc(4, F1_D1 + "\n\n04 Where does this conversation take place?",
           ["zoo", "library", "hospital", "restaurant", "museum"], 2,
           "정답: ② library. 책을 고르고 사서 선생님과 이야기하는 장면이다. (답지 58쪽)", sec_title=s, direction=d),
        sentence(5, F1_D1 + "\n\n05 위 대화의 밑줄 친 우리말 ⓐ를 네 단어로 이루어진 문장으로 영작하시오.",
                 ["Can you help me?", "Can you help me"], "정답: Can you help me? (답지 58쪽)", sec_title=s, direction=d),
        mc(6, F1_D1 + "\n\n06 위 대화의 빈칸 ⓑ에 들어갈 적절한 말은?",
           ["I’m curious about sea life.", "I’m curious about land animals.", "I want to be an animal scientist.", "I already know a lot about sea animals.", "I want to protect the sea from pollution."], 1,
           "정답: ①. 남자가 바다 생물에 관한 책을 권하므로 바다 생물이 궁금하다고 답한다. (답지 58쪽)", sec_title=s, direction=d),
        mc(7, F1_D2 + "\n\n07 According to the conversation, which one is NOT true?",
           ["The speakers are introducing a book to viewers.", "Charlotte’s Web is a book written by E. B. White.", "Charlotte’s Web is the story of a pig saving a spider.", "In the story of Charlotte’s Web, we can learn about true friendship.", "Charlotte’s Web was also made into a film."], 3,
           "정답: ③. 거미 Charlotte가 돼지 Wilbur를 구하는 이야기이다. (답지 58쪽)", sec_title=s, direction=d),
        sentence(8, F1_D2 + "\n\n08 위 대화의 밑줄 친 우리말을 다음 조건에 맞게 영작하시오.\n조건 1. how를 사용하고 총 6단어로 쓸 것.\n조건 2. 대소문자 및 구두점에 유의할 것.",
                 ["How did you like the movie?", "How did you like the movie"], "정답: How did you like the movie? (답지 58쪽)", sec_title=s, direction=d),
        mc(9, "09 다음 문장의 의미와 같은 것은? (문법)\nWhat a great singer he is!",
           ["He is a very good singer.", "He is not good at singing.", "He wants to be a great singer.", "He knows a lot of great singers.", "He likes to listen to songs very much."], 1,
           "정답: ① He is a very good singer. (답지 58쪽)", sec_title=s, direction=d),
        mc(10, "10 다음 우리말을 영어로 바르게 옮긴 것은? (문법)\n그들은 어젯밤에 큰 어떤 소리도 듣지 못했다.",
           ["They heard not loud anything last night.", "They didn’t hear loud anything last night.", "They didn’t hear anything loud last night.", "They didn’t hear something loud last night.", "They didn’t hear something loudly last night."], 3,
           "정답: ③. 부정문에서는 anything을 쓰고 형용사 loud가 뒤에서 꾸민다. (답지 58쪽)", sec_title=s, direction=d),
        mc(11, "11 다음 문장을 감탄문으로 바르게 옮긴 것은? (문법)\nYou are very smart and clever.",
           ["How are you smart and clever!", "How smart and clever are you!", "How smart and clever you are!", "What smart and clever you are!", "What a smart and clever you are!"], 3,
           "정답: ③ How smart and clever you are! (답지 58쪽)", sec_title=s, direction=d),
        sentence(12, "12 다음 우리말에 맞게 괄호 안의 단어들을 바르게 배열하여 문장을 완성하시오.\n그는 오늘 저녁으로 맛있는 어떤 것을 요리했다.\n(for today dinner / delicious / something / cooked)\n→ He ______",
                 ["cooked something delicious for dinner today", "cooked something delicious for today dinner"],
                 "정답: cooked something delicious for dinner today. (답지 58쪽)", sec_title=s, direction=d),
        mc(13, "13 다음 중 어법상 올바른 문장끼리 바르게 연결한 것은? (문법)\nⓐ What a beautiful day is!\nⓑ How brave and strong she is!\nⓒ Is there warm anything to eat now?\nⓓ He saw nothing strange in the dark room.\nⓔ She wants something exciting for her birthday.",
           ["ⓐ, ⓑ, ⓒ", "ⓐ, ⓑ, ⓓ", "ⓐ, ⓑ, ⓔ", "ⓑ, ⓒ, ⓔ", "ⓑ, ⓓ, ⓔ"], 5,
           "정답: ⑤ ⓑ, ⓓ, ⓔ. (답지 58쪽)", sec_title=s, direction=d),
        mc(14, F1_P14 + "\n\n14 윗글의 밑줄 친 ⓐ~ⓔ 중 흐름상 어색한 것은? (독해)",
           ["ⓐ feet", "ⓑ exactly", "ⓒ always", "ⓓ champion", "ⓔ wonderful"], 3,
           "정답: ③ always. 실수를 하지 않았다는 뜻이므로 never가 알맞다. (답지 58쪽)", sec_title=s, direction=d),
        mc(15, F1_P14 + "\n\n15 윗글을 통해 알 수 있는 Beatrice의 성격은? (독해)",
           ["게으르다", "용감하다", "창의적이다", "철두철미하다", "낙천적이다"], 4,
           "정답: ④ 철두철미하다. 모든 일을 완벽하게 해 왔다. (답지 58쪽)", sec_title=s, direction=d),
        sentence(16, F1_P14 + "\n\n16 윗글의 밑줄 친 우리말을 다음 조건에 맞게 영작하시오.\n조건 1. on, school을 포함하여 쓸 것.\n조건 2. 총 5단어로 쓸 것.\n조건 3. 대소문자 및 구두점에 유의할 것.",
                 ["On her way to school,"], "정답: On her way to school, (답지 58쪽)", sec_title=s, direction=d),
        mc(17, F1_P17 + "\n\n17 윗글의 밑줄 친 ⓐ~ⓔ 중 어법상 틀린 것은? (독해)",
           ["ⓐ", "ⓑ", "ⓒ", "ⓓ", "ⓔ"], 3,
           "정답: ③. something slippery 어순이 맞다. (답지 58쪽)", sec_title=s, direction=d),
        sentence(18, F1_P17 + "\n\n18 윗글의 밑줄 친 (a)에서 생략된 부분을 포함하여 완전한 문장으로 다시 쓰시오.",
                 ["But she didn’t fall.", "But she didn't fall"], "정답: But she didn’t fall. (답지 58쪽)", sec_title=s, direction=d),
        mc(19, F1_P17 + "\n\n19 윗글의 내용을 다음과 같이 요약할 때, 빈칸 (A)와 (B)에 들어갈 말로 바르게 짝지어진 것은? (고난도)\nBeatrice almost (A) ______ while getting eggs in cooking class, and it made her feel (B) ______.",
           ["stood · sad", "sat · angry", "walked · happy", "slept · surprised", "fell · nervous"], 5,
           "정답: ⑤ fell / nervous. (답지 58쪽)", sec_title=s, direction=d),
        mc(20, F1_P20 + "\n\n20 윗글의 ①~⑤ 중 다음 문장이 들어가기에 가장 적절한 곳은?\nNext, she added a salt shaker.",
           ["①", "②", "③", "④", "⑤"], 3,
           "정답: ③. 달걀을 던진 바로 뒤에 소금 통을 추가했다. (답지 58쪽)", sec_title=s, direction=d),
        mc(21, F1_P20 + "\n\n21 윗글의 (A), (B), (C)의 각 괄호 안에서 어법에 맞는 것으로 바르게 짝지은 것은?",
           ["How · strange · fell", "How · strangely · fall", "What · strange · fall", "What · strangely · fell", "What · strange · fell"], 5,
           "정답: ⑤ What / strange / fell. (답지 58쪽)", sec_title=s, direction=d),
        mc(22, F1_P20 + "\n\n22 According to the passage, which one is NOT true? (독해)",
           ["The school gym was filled with people.", "Beatrice was worried that juggling would fail.", "There were many butterflies flying in the gym.", "Beatrice was juggling when a water balloon fell on the floor.", "Beatrice totally failed at juggling."], 3,
           "정답: ③. butterflies in one’s stomach는 ‘긴장하다’라는 관용 표현이다. (답지 58쪽)", sec_title=s, direction=d),
        fill(23, F1_P23 + "\n\n23 윗글에서 다음 영영풀이에 해당하는 단어를 찾아 쓰시오. (독해)\nto make a sound with your mouth when something is funny",
             ["laugh"], "정답: laugh. (답지 58쪽)", sec_title=s, direction=d),
        mc(24, F1_P23 + "\n\n24 윗글의 밑줄 친 ⓐ~ⓓ 중 어법상 틀린 것은? (독해)",
           ["ⓐ How a surprise!", "ⓑ Suddenly", "ⓒ to laugh", "ⓓ on", "틀린 것이 없다"], 1,
           "정답: ⓐ. What a surprise!가 맞다. (답지 58쪽)", sec_title=s, direction=d),
        sentence(25, F1_P23 + "\n\n25 윗글의 밑줄 친 우리말을 다음 조건에 맞게 영작하시오. (독해)\n조건 1. just, call\n조건 2. 총 5단어로 쓸 것.\n조건 3. 대소문자 및 구두점에 유의할 것.",
                 ["They just call her Beatrice.", "They just call her Beatrice"], "정답: They just call her Beatrice. (답지 58쪽)", sec_title=s, direction=d),
    ]
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("final-1", "최종점검 모의고사 1회", UNIT, "pp.96-99",
              "통과 80%. 1회 25문항입니다. 어휘·대화·문법·독해가 모두 나옵니다.", sections, qs))


BUILDERS["final-1"] = build_final_1


F2_D1 = ("[05-07] 다음 대화를 읽고 물음에 답하시오.\n"
         "G: Excuse me. I’m trying to choose a book. ①Can you help me?\n"
         "M: Sure. ②What kind of book are you looking for?\n"
         "G: Well, I want to read about animals.\n"
         "M: Okay. ③Books about animals are on this shelf. What kind of animals are you interested in?\n"
         "G: I’m curious about sea life.\n"
         "M: Then what about this book, The Blue Planet? ④It’s about animals in the jungle.\n"
         "G: ⑤That sounds perfect. Thank you.\n"
         "M: You’re welcome.")
F2_D2 = ("[08-08] 다음 대화를 읽고 물음에 답하시오.\n"
         "A: Which story did you choose?\n"
         "B: I chose Inside Out.\n"
         "A: 나에게 이야기의 교훈을 설명해 줄 수 있니?\n"
         "B: Sure. The lesson is that emotions aren’t good or bad.")
F2_P14 = ("[14-16] 다음 글을 읽고 물음에 답하시오.\n"
          "For Beatrice, Friday began like any other day. She wore the same white socks on both of her feet. "
          "Then she made a sandwich. She put exactly the same amount of peanut butter on each piece of bread.\n"
          "On her way to school, her neighbor said, “Good morning, Perfect Girl.” "
          "People called Beatrice “Perfect Girl” ⓐ ______ she never made mistakes. "
          "“Are you ready for tonight’s talent show?” her neighbor asked. Beatrice just smiled. "
          "She was a juggling champion. She won the talent show every year. ⓑHow wonderful she was!")
F2_P17 = ("[17-19] 다음 글을 읽고 물음에 답하시오.\n"
          "At school, Beatrice had a cooking class. To make a cake, she carefully took some eggs ⓐ ______ the refrigerator. "
          "When she turned around, she stepped on something ⓑ ______. She was about to fall! But she didn’t. "
          "“That was close!” she thought. She almost made a mistake. Because of this, she began (A)to feel ⓒ ______.\n"
          "It was time for the talent show. The school gym was full of people. They said, “Look! That’s Perfect Girl!” "
          "Beatrice had butterflies in her ⓓ ______. “Will I mess up? I’m worried,” she thought.")
F2_P20 = ("[20-22] 다음 글을 읽고 물음에 답하시오.\n"
          "Beatrice threw an egg into the air. Next, she added a salt shaker. Finally, she added a water balloon. "
          "①How a good start! But then she felt something ②strangely... Uh-oh! Beatrice’s nose started ③itchy. "
          "The salt shaker was full ④with... pepper! “ACHOO!” Beatrice missed ⓐthe water balloon, and it fell to the floor. "
          "Then... OOPS! The egg ⑤break on top of her head.")
F2_P23 = ("[23-25] 다음 글을 읽고 물음에 답하시오.\n"
          "(A) Now, people no longer call her “Perfect Girl.” They just call her Beatrice.\n"
          "(B) For the first time ever, Beatrice made a mistake. What a surprise! She thought, “What should I do? "
          "Cry? Run off the stage?” Suddenly, she began ⓐ ______ loudly. The people looked at each other. "
          "Then everyone started ⓑ ______ together.\n"
          "(C) That night, Beatrice had a deep sleep. The next morning, she woke up with a smile. "
          "She put a white sock on her left foot... and a green sock on her right foot!")


def build_final_2():
    s = "Section A · 2회"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, "01 다음 중 두 단어의 관계가 나머지와 다른 것은? (어휘)",
           ["fantasy : fantastic", "magic : magical", "laugh : laughter", "emotion : emotional", "danger : dangerous"], 3,
           "정답: ③ laugh : laughter는 ‘동사 : 명사’이고 나머지는 ‘명사 : 형용사’이다. (답지 59쪽, pp.100-103)", sec_title=s, direction=d),
        mc(2, "02 다음 빈칸에 공통으로 들어갈 말로 가장 적절한 것은? (어휘)\n• She’s very ______ to her grandmother.\n• The game was really ______, but our team won.",
           ["close", "itch", "deep", "borrow", "curious"], 1,
           "정답: ① close. ‘가깝다’, ‘아슬아슬하다’ 두 뜻이 모두 맞는다. (답지 59쪽)", sec_title=s, direction=d),
        fill(3, "03 다음 영영풀이에 해당하는 단어를 이용하여 문장을 완성하시오.\nto make something easy to understand by saying more about it\n→ Can you ______ the meaning of this word?",
             ["explain"], "정답: explain. (답지 59쪽)", sec_title=s, direction=d),
        mc(4, "04 다음 대화의 빈칸에 들어갈 말로 가장 적절한 것은? (대화)\nA: I’m ______ about Korean food.\nB: It’s very tasty. Try kimchi and bulgogi!",
           ["good", "know", "think", "curious", "interesting"], 4,
           "정답: ④ curious. be curious about는 ‘~이 궁금하다’이다. (답지 59쪽)", sec_title=s, direction=d),
        mc(5, F2_D1 + "\n\n05 위 대화가 이루어지고 있는 장소로 가장 적절한 것은?",
           ["theater", "library", "school", "museum", "restaurant"], 2,
           "정답: ② library. 책을 고르는 상황이다. (답지 59쪽)", sec_title=s, direction=d),
        mc(6, F2_D1 + "\n\n06 위 대화의 밑줄 친 ①~⑤ 중 흐름상 어색한 것은?",
           ["①", "②", "③", "④", "⑤"], 4,
           "정답: ④. 바다 생물에 관한 책이므로 jungle이 아니라 deep sea가 맞다. (답지 59쪽)", sec_title=s, direction=d),
        mc(7, F2_D1 + "\n\n07 위 대화를 읽고, 대답할 수 없는 질문을 모두 고르면?",
           ["① What kind of book does the girl want to read?", "② Where are the books about animals?", "③ What is the girl’s favorite sea animal?", "④ What is the title of the book the man suggests?", "⑤ What other books does the man recommend?"], 3,
           "정답: ③, ⑤. 대화에 답이 없다. (답지 59쪽)", sec_title=s, direction=d),
        sentence(8, F2_D2 + "\n\n08 다음 대화의 밑줄 친 우리말을 괄호 안의 단어들을 바르게 배열하여 문장을 완성하시오. (대·소문자 구분하여 쓸 것)\n(the / you / explain / the / lesson / story / of / can) to me?",
                 ["Can you explain the lesson of the story", "can you explain the lesson of the story"],
                 "정답: Can you explain the lesson of the story. (답지 59쪽)", sec_title=s, direction=d),
        mc(9, "09 다음 밑줄 친 ①~⑤ 중 어법상 틀린 것은? (문법)\n① How an interesting book he wrote!",
           ["① How an interesting book he wrote!", "②", "③", "④", "⑤"], 1,
           "정답: ①. What an interesting book he wrote!가 맞다. (답지 59쪽)", sec_title=s, direction=d),
        mc(10, "10 다음 우리말을 영어로 옮길 때 틀린 것은? (문법)\n① 그들이 가진 집은 정말 크구나! → What a big house they have!\n② 이 케이크는 정말 맛있구나! → How delicious this cake tastes!\n③ 내 손에 뭔가 차가운 게 느껴진다. → I feel something cold in my hand.\n④ 뜨거운 음료를 원하니? → Do you want hot anything to drink?\n⑤ 보고할 새로운 내용이 없다. → There is nothing new to report.",
           ["①", "②", "③", "④", "⑤"], 4,
           "정답: ④. anything hot to drink가 맞다. (답지 59쪽)", sec_title=s, direction=d),
        mc(11, "11 다음 중 어법상 옳은 것을 모두 고르면? (고난도)\nⓐ How loudly that noise is!\nⓑ You can eat anything spicy.\nⓒ What a cute puppy you have!\nⓓ What a bad luck he had last week!\nⓔ Important everything is in this folder.",
           ["ⓐ, ⓑ", "ⓑ, ⓒ", "ⓒ, ⓓ", "ⓓ, ⓔ", "ⓔ, ⓐ"], 2,
           "정답: ② ⓑ, ⓒ. (답지 59쪽)", sec_title=s, direction=d),
        fill("12-1", "12 다음 문장에서 어법상 틀린 곳을 두 군데 찾아 바르게 고치시오.\nI found something amazingly in the garden. What an amazing thing was it! It was a colorful butterfly.\n(1) amazingly를 바르게 고친 말을 쓰시오.",
             ["amazing"], "정답: (1) amazing. something 뒤에는 형용사가 온다. (답지 59쪽)", sec_title=s, direction=d, seconds=60),
        fill("12-2", "12 다음 문장에서 어법상 틀린 곳을 두 군데 찾아 바르게 고치시오.\nI found something amazingly in the garden. What an amazing thing was it! It was a colorful butterfly.\n(2) was it을 바르게 고친 말을 쓰시오.",
             ["it was"], "정답: (2) it was. 감탄문은 「What + a + 형용사 + 명사 + 주어 + 동사」 어순이다. (답지 59쪽)", sec_title=s, direction=d, seconds=60),
        sentence(13, "13 다음 우리말에 맞게 바르게 영작하시오. (문법)\n조건 1. something, look for, new를 모두 포함하여 총 7단어로 쓸 것.\n조건 2. 필요시 어형을 바꿀 것.\n조건 3. 주어와 동사를 갖춘 완전한 문장으로 쓸 것.\n조건 4. 대소문자 및 구두점에 유의할 것.\n나는 읽을 만한 새로운 것을 찾고 있다.",
                 ["I’m looking for something new to read.", "I am looking for something new to read."],
                 "정답: I’m looking for something new to read. (답지 59쪽)", sec_title=s, direction=d),
        mc(14, F2_P14 + "\n\n14 윗글의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["but", "when", "while", "after", "because"], 5,
           "정답: ⑤ because. 실수하지 않았기 때문에 그렇게 불렀다. (답지 59쪽)", sec_title=s, direction=d),
        sentence(15, F2_P14 + "\n\n15 윗글의 밑줄 친 ⓑ의 우리말에 맞도록 괄호 안의 단어들을 바르게 배열하시오.\n(was / how / she / wonderful / !)",
                 ["How wonderful she was!", "How wonderful she was"], "정답: How wonderful she was! (답지 59쪽)", sec_title=s, direction=d),
        mc(16, F2_P14 + "\n\n16 Which of the following is NOT true about Beatrice?",
           ["Beatrice는 양말을 양쪽에 똑같이 신었다.", "Beatrice는 각 빵 조각에 땅콩버터를 다르게 발랐다.", "사람들은 Beatrice를 ‘완벽한 소녀’라고 불렀다.", "Beatrice는 저글링 챔피언이었다.", "Beatrice는 매년 장기 자랑에서 우승했다."], 2,
           "정답: ②. 똑같은 양을 발랐다. (답지 59쪽)", sec_title=s, direction=d),
        mc(17, F2_P17 + "\n\n17 윗글의 빈칸 ⓐ~ⓓ에 들어갈 말로 적절하지 않은 것은?",
           ["loudly", "nervous", "out of", "stomach", "slippery"], 1,
           "정답: ① loudly. 어느 빈칸에도 맞지 않는다. (답지 59쪽)", sec_title=s, direction=d),
        mc(18, F2_P17 + "\n\n18 윗글의 밑줄 친 (A)와 어법상 쓰임이 같은 것은?",
           ["She got up early to catch the bus.", "To learn a new language takes time.", "He plans to study abroad next year.", "Do you have any homework to finish?", "Their duty is to protect the environment."], 3,
           "정답: ③. to feel과 to study 모두 동사의 목적어로 쓰인 to부정사이다. (답지 59쪽)", sec_title=s, direction=d),
        mc(19, F2_P17 + "\n\n19 윗글을 읽고, 대답을 할 수 없는 질문은?",
           ["What did Beatrice take out of the refrigerator?", "What kind of cake did Beatrice make?", "Why did Beatrice almost fall?", "How did Beatrice feel after almost falling?", "What did people call Beatrice at the talent show?"], 2,
           "정답: ②. 케이크 종류는 글에 나오지 않는다. (답지 59쪽)", sec_title=s, direction=d),
        mc(20, F2_P20 + "\n\n20 윗글의 밑줄 친 ①~⑤를 어법상 바르게 고칠 때 틀린 것은?",
           ["① → What", "② → strange", "③ → itching", "④ → of", "⑤ → broken"], 5,
           "정답: ⑤. The egg broke가 맞다. (답지 59쪽)", sec_title=s, direction=d),
        fill(21, F2_P20 + "\n\n21 윗글에서 밑줄 친 ⓐ가 가리키는 것을 세 단어로 쓰시오.",
             ["the water balloon"], "정답: the water balloon. (답지 59쪽)", sec_title=s, direction=d, phrase=True),
        mc(22, F2_P20 + "\n\n22 윗글의 내용과 일치하지 않는 것은? (독해)",
           ["Beatrice threw an egg into the air.", "Beatrice added a salt shaker after the egg.", "The salt shaker was actually filled with pepper.", "Beatrice caught all the items perfectly.", "The egg broke on top of Beatrice’s head."], 4,
           "정답: ④. 물풍선을 놓쳤다. (답지 59쪽)", sec_title=s, direction=d),
        mc(23, F2_P23 + "\n\n23 윗글의 (A)~(C)를 순서에 맞게 배열한 것으로 가장 적절한 것은?",
           ["(A)-(B)-(C)", "(B)-(A)-(C)", "(B)-(C)-(A)", "(C)-(A)-(B)", "(C)-(B)-(A)"], 3,
           "정답: ③ (B)-(C)-(A). (답지 59쪽)", sec_title=s, direction=d),
        mc(24, F2_P23 + "\n\n24 윗글의 빈칸 ⓐ와 ⓑ에 공통으로 들어갈 말로 가장 적절한 것은? (고난도)",
           ["laugh", "laughed", "laughs", "to laughing", "to laugh"], 5,
           "정답: ⑤ to laugh. begin to ~, start to ~ 형태이다. (답지 59쪽)", sec_title=s, direction=d),
        fill(25, F2_P23 + "\n\n25 윗글을 읽고, 다음 질문에 대한 답을 완성하시오. (독해)\nQ. What did Beatrice do the next morning?\n→ She smiled and wore ______ on her left foot and a green sock ______.",
             ["a white sock, on her right foot", "a white sock on her right foot"],
             "정답: a white sock, on her right foot. (답지 59쪽)", sec_title=s, direction=d, phrase=True),
    ]
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("final-2", "최종점검 모의고사 2회", UNIT, "pp.100-103",
              "통과 80%. 2회 27문항입니다. 어휘·대화·문법·독해가 모두 나옵니다.", sections, qs))


BUILDERS["final-2"] = build_final_2


F3_D1 = ("[05-05] 다음 대화의 밑줄 친 ①~⑤ 중에서 흐름상 어색한 것은?\n"
         "A: ①What are you reading?\n"
         "B: I’m reading the book Eragon.\n"
         "A: ②Can you tell me about it?\n"
         "B: It’s a fantasy novel. ③The story is about dragons.\n"
         "A: ④It sounds interesting. ⑤I don’t want to know about it.")
F3_D2 = ("[06-07] 다음 대화를 읽고 물음에 답하시오.\n"
         "A: I’m trying to choose a book. ⓐ ______ you help me?\n"
         "B: Of course. What about The Wizard of Oz?\n"
         "A: Hmm... ⓑ ______ you tell me about it?\n"
         "B: Sure. It’s about the adventures of a young girl.\n"
         "A: I’d like to read it. I’m curious about adventures.\n"
         "B: You’ll like it.")
F3_P14 = ("[14-16] 다음 글을 읽고 물음에 답하시오.\n"
          "For Beatrice, Friday began like any other day. She ①wore the same white socks on both of her feet. "
          "Then she made a sandwich. She ②put exactly the same amount of peanut butter on each piece of bread.\n"
          "③On her way to school, her neighbor said, “Good morning, Perfect Girl.” "
          "People called Beatrice “Perfect Girl” ⓐ ______. ④Are you ready for tonight’s talent show? her neighbor asked. "
          "Beatrice just smiled. She was a juggling champion. She won the talent show every year. ⑤What wonderful she was!")
F3_P17 = ("[17-20] 다음 글을 읽고, 물음에 답하시오.\n"
          "At school, Beatrice had a cooking class. To make a cake, she carefully ①took some eggs out of the refrigerator. "
          "When she turned around, she ②stepped on something ⓐ(slip). She was about to fall! But she didn’t. "
          "“That was ③cool!” she thought. She almost made a mistake. Because of this, she began to feel ⓑ(nerve).\n"
          "It was time for the talent show. The school gym was full of people. They said, “Look! That’s Perfect Girl!” "
          "Beatrice had ⓒbutterflies in her stomach. “Will I ⑤mess up? I’m worried,” she thought.")
F3_P21 = ("[21-22] 다음 글을 읽고, 물음에 답하시오.\n"
          "Beatrice threw an egg into the air. Next, she added a salt shaker. Finally, she added a water balloon. "
          "What a good start! But then she felt something strange... Uh-oh! ⓐBeatrice의 코가 가렵기 시작했다. "
          "The salt shaker was full of... pepper! “ACHOO!” Beatrice missed the water balloon, and it fell to the floor. "
          "Then... OOPS! The egg broke on top of her head.")
F3_P23 = ("[23-25] 다음 글을 읽고 물음에 답하시오.\n"
          "①For the first time ever, Beatrice made a mistake. ⓐ 정말 놀라웠다! She thought, “What should I do? "
          "Cry? ②Run off the stage?” Suddenly, she began to laugh loudly. The people ③looked at each other. "
          "Then everyone started to laugh together.\n"
          "That night, Beatrice had a deep sleep. The next morning, she ④woke up with a smile. "
          "She put a white sock on her left foot... and a green sock on her right foot!\n"
          "Now, people ⑤no longer call her “Perfect Girl.” They just call her Beatrice.")


def build_final_3():
    s = "Section A · 3회"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, "01 다음 영영풀이에 해당하는 단어는? (어휘)\na place where people go to exercise",
           ["viewer", "gym", "planet", "wizard", "refrigerator"], 2,
           "정답: ② gym. (답지 60쪽, pp.104-107)", sec_title=s, direction=d),
        mc(2, "02 다음 밑줄 친 부분의 쓰임이 적절하지 않은 것은? (어휘)\n① My dog ran off when I opened the gate.\n② He turned around when he heard his name.\n③ She called him to make up and apologize.\n④ We are about to start the meeting.\n⑤ Both the movie or the book were amazing.",
           ["①", "②", "③", "④", "⑤"], 5,
           "정답: ⑤. both A and B 형태여야 한다. (답지 60쪽)", sec_title=s, direction=d),
        fill("3-1", "03 다음 짝지어진 두 단어의 관계가 보기의 관계와 같도록 빈칸에 들어갈 적절한 말을 쓰시오.\n보기: sudden : suddenly\n(1) exact : ______",
             ["exactly"], "정답: (1) exactly. 형용사에 -ly를 붙여 부사가 된다. (답지 60쪽)", sec_title=s, direction=d, seconds=60),
        fill("3-2", "03 다음 짝지어진 두 단어의 관계가 보기의 관계와 같도록 빈칸에 들어갈 적절한 말을 쓰시오.\n보기: sudden : suddenly\n(2) strange : ______",
             ["strangely"], "정답: (2) strangely. (답지 60쪽)", sec_title=s, direction=d, seconds=60),
        mc(4, "04 다음 대화의 밑줄 친 부분과 바꿔 쓸 수 있는 것은? (대화)\nA: <u>I’m curious about</u> your favorite hobby.\nB: Oh, I really like painting.",
           ["We have the same hobby.", "Your favorite hobby is amazing.", "I want to know your favorite hobby.", "I already know your favorite hobby.", "Your favorite hobby doesn’t interest me."], 3,
           "정답: ③ I want to know your favorite hobby. (답지 60쪽)", sec_title=s, direction=d),
        mc(5, F3_D1, ["①", "②", "③", "④", "⑤"], 5,
           "정답: ⑤. 흥미롭다고 했으므로 ‘알고 싶지 않다’는 어색하다. (답지 60쪽)", sec_title=s, direction=d),
        mc(6, F3_D2 + "\n\n06 위 대화의 빈칸 ⓐ와 ⓑ에 공통으로 들어갈 말로 적절한 것은?",
           ["Can", "Do", "May", "Have", "Must"], 1,
           "정답: ① Can. Can you help me? / Can you tell me about it? (답지 60쪽)", sec_title=s, direction=d),
        mc(7, F3_D2 + "\n\n07 According to the dialog, which one is NOT true?",
           ["A wants to read a book.", "B suggests The Wizard of Oz.", "The book is about a young girl’s adventures.", "A already read The Wizard of Oz.", "A is curious about adventures."], 4,
           "정답: ④. 아직 읽지 않았다. (답지 60쪽)", sec_title=s, direction=d),
        sentence(8, "08 다음 대화를 읽고, 다음 질문에 대한 대답을 완전한 영어 문장으로 쓰시오. (총 7단어로 쓸 것)\nB: Excuse me. I’d like to check out this book.\nW: Sure. Can you show your library card to me, please?\nB: Here you go.\nW: Thank you. Please return the book by next week.\nB: Okay. Thank you.\nQ. What does the boy want to do?",
                 ["He wants to check out a book.", "He wants to check out a book"], "정답: He wants to check out a book. (답지 60쪽)", sec_title=s, direction=d),
        mc(9, "09 다음 우리말에 맞게 괄호 안의 단어들을 순서대로 배열할 때, 두 번째로 오는 것은?\n이상한 뭔가가 내 주의를 끌었다.\n(my / something / caught / attention / unusual)",
           ["my", "unusual", "caught", "attention", "something"], 2,
           "정답: ② unusual. Something unusual caught my attention. (답지 60쪽)", sec_title=s, direction=d),
        mc(10, "10 다음 빈칸 ⓐ와 ⓑ에 들어갈 말이 바르게 짝지어진 것은?\nⓐ ______ excellent work you did!\nⓑ ______ difficult this problem is!",
           ["What · Why", "How · What", "What · How", "When · Who", "How · Which"], 3,
           "정답: ③ What / How. (답지 60쪽)", sec_title=s, direction=d),
        mc(11, "11 다음 문장을 감탄문으로 바꾼 것 중 어법상 틀린 것은? (문법)\n① You have a nice voice. → What a nice voice you have!\n② It was an exciting game. → What an exciting game it was!\n③ He runs very fast. → How fast he runs!\n④ The view is beautiful. → How beautiful the view is!\n⑤ The baby is so cute. → How the baby is cute!",
           ["①", "②", "③", "④", "⑤"], 5,
           "정답: ⑤. How cute the baby is!가 맞다. (답지 60쪽)", sec_title=s, direction=d),
        sentence("12-1", "12 다음 각 문장에서 어법상 틀린 곳을 찾아 바르게 고쳐 문장을 다시 쓰시오.\n(1) What fast car he drives!",
                 ["What a fast car he drives!", "What a fast car he drives"], "정답: What a fast car he drives! (답지 60쪽)", sec_title=s, direction=d, seconds=90),
        sentence("12-2", "12 다음 각 문장에서 어법상 틀린 곳을 찾아 바르게 고쳐 문장을 다시 쓰시오.\n(2) New something is coming next week.",
                 ["Something new is coming next week.", "Something new is coming next week"], "정답: Something new is coming next week. (답지 60쪽)", sec_title=s, direction=d, seconds=90),
        sentence("12-3", "12 다음 각 문장에서 어법상 틀린 곳을 찾아 바르게 고쳐 문장을 다시 쓰시오.\n(3) She wants something differently for dinner.",
                 ["She wants something different for dinner.", "She wants something different for dinner"], "정답: She wants something different for dinner. (답지 60쪽)", sec_title=s, direction=d, seconds=90),
        sentence("13-1", "13 다음 우리말에 맞도록 괄호 안의 단어들을 이용하여 영작하시오. (고난도)\n(1) 그녀는 놀라운 재능을 가지고 있구나! (talent / amazing / has)",
                 ["What amazing talent she has!", "What amazing talent she has"], "정답: What amazing talent she has! (답지 60쪽)", sec_title=s, direction=d, seconds=90),
        sentence("13-2", "13 다음 우리말에 맞도록 괄호 안의 단어들을 이용하여 영작하시오. (고난도)\n(2) 저 상자 안에 유용한 것이 있니? (there / useful / anything)",
                 ["Is there anything useful in that box?", "Is there anything useful in that box"], "정답: Is there anything useful in that box? (답지 60쪽)", sec_title=s, direction=d, seconds=90),
        mc(14, F3_P14 + "\n\n14 윗글의 밑줄 친 ①~⑤ 중 어법상 틀린 것은? (독해)",
           ["① wore", "② put", "③ On", "④ Are you ready", "⑤ What wonderful"], 5,
           "정답: ⑤. How wonderful she was!가 맞다. (답지 60쪽)", sec_title=s, direction=d),
        mc(15, F3_P14 + "\n\n15 윗글의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["because she forgot her homework often", "because she was late for school every day", "because her room was always messy", "because she never made mistakes", "because she didn’t do her homework"], 4,
           "정답: ④. 실수를 하지 않았기 때문이다. (답지 60쪽)", sec_title=s, direction=d),
        mc(16, F3_P14 + "\n\n16 윗글의 내용과 일치하는 것은? (독해)",
           ["Beatrice wore different colored socks.", "Beatrice made a chicken salad.", "Beatrice’s neighbor called her “Funny Girl.”", "Beatrice wanted to learn juggling.", "Beatrice won the talent show every year."], 5,
           "정답: ⑤. 매년 장기 자랑에서 우승했다. (답지 60쪽)", sec_title=s, direction=d),
        mc(17, F3_P17 + "\n\n17 윗글의 밑줄 친 ①~⑤ 중 글의 흐름상 어색한 것은? (독해)",
           ["① took", "② stepped", "③ cool", "④ began", "⑤ mess up"], 3,
           "정답: ③ cool. 아슬아슬했으므로 close가 알맞다. (답지 60쪽)", sec_title=s, direction=d),
        mc(18, F3_P17 + "\n\n18 윗글의 괄호 안의 ⓐ와 ⓑ를 알맞은 형태로 바르게 짝지어진 것은? (고난도)",
           ["slipper · nervous", "slippery · nervous", "slipped · nerveless", "slippery · nervously", "slipped · nervously"], 2,
           "정답: ② slippery / nervous. (답지 60쪽)", sec_title=s, direction=d),
        mc(19, F3_P17 + "\n\n19 윗글의 밑줄 친 ⓒ의 의미로 가장 적절한 것은? (독해)",
           ["Beatrice는 마음이 편하지 않았다.", "Beatrice는 속이 더부룩했다.", "Beatrice는 온 몸이 간지러웠다.", "Beatrice는 화가 머리끝까지 났다.", "Beatrice는 기뻐서 어쩔 줄 몰랐다."], 1,
           "정답: ① 마음이 편하지 않았다. (답지 60쪽)", sec_title=s, direction=d),
        fill("20-1", F3_P17 + "\n\n20 윗글의 내용과 일치하지 않는 부분을 두 군데 찾아 바르게 고쳐 쓰시오. (고난도)\nBeatrice stepped on something slippery during English class and almost fell. She began to feel excited and had butterflies in her stomach during the talent show.\n(1) English class 부분을 바르게 고쳐 쓰시오.",
             ["cooking class"], "정답: (1) cooking class. (답지 60쪽)", sec_title=s, direction=d, seconds=60),
        fill("20-2", F3_P17 + "\n\n20 윗글의 내용과 일치하지 않는 부분을 두 군데 찾아 바르게 고쳐 쓰시오. (고난도)\nBeatrice stepped on something slippery during English class and almost fell. She began to feel excited and had butterflies in her stomach during the talent show.\n(2) excited 부분을 바르게 고쳐 쓰시오.",
             ["nervous"], "정답: (2) nervous. (답지 60쪽)", sec_title=s, direction=d, seconds=60),
        mc(21, F3_P21 + "\n\n21 윗글에서 다음 영영풀이에 해당하는 단어는? (독해)\nto put something with something else to make larger or more",
           ["add", "fall", "throw", "miss", "break"], 1,
           "정답: ① add. (답지 60쪽)", sec_title=s, direction=d),
        sentence(22, F3_P21 + "\n\n22 윗글의 밑줄 친 ⓐ의 우리말을 조건에 맞게 바르게 영작하시오.\n조건 1. nose, start, itch를 포함할 것.\n조건 2. 총 5단어로 쓸 것.\n조건 3. 필요시 어형을 바꾸어 쓸 것.",
                 ["Beatrice’s nose started to itch.", "Beatrice's nose started to itch."],
                 "정답: Beatrice’s nose started to itch. (답지 60쪽)", sec_title=s, direction=d),
        mc(23, F3_P23 + "\n\n23 윗글의 밑줄 친 ①~⑤의 우리말 해석이 잘못된 것은? (독해)",
           ["① 난생처음으로", "② 도망가다", "③ 바라보았다", "④ 일어났다", "⑤ 더 자주 부른다"], 5,
           "정답: ⑤. no longer call은 ‘더 이상 부르지 않는다’이다. (답지 60쪽)", sec_title=s, direction=d),
        sentence(24, F3_P23 + "\n\n24 윗글의 밑줄 친 ⓐ의 우리말에 맞게 주어진 단어들을 바르게 배열하시오. (고난도)\n(a / it / what / surprise / was)!",
                 ["What a surprise it was!", "What a surprise it was"], "정답: What a surprise it was! (답지 60쪽)", sec_title=s, direction=d),
        mc(25, F3_P23 + "\n\n25 윗글의 내용과 일치하지 않는 것은? (독해)",
           ["Beatrice made a mistake for the first time.", "After her mistake, Beatrice began to cry.", "Beatrice slept well after making a mistake.", "Beatrice wore different-colored socks the next morning.", "People don’t call her “Perfect Girl” anymore."], 2,
           "정답: ②. 실수 뒤에 크게 웃기 시작했다. (답지 60쪽)", sec_title=s, direction=d),
    ]
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("final-3", "최종점검 모의고사 3회", UNIT, "pp.104-107",
              "통과 80%. 3회 28문항입니다. 어휘·대화·문법·독해가 모두 나옵니다.", sections, qs))


BUILDERS["final-3"] = build_final_3


M100_D1 = ("[04-05] 다음 대화를 읽고, 물음에 답하시오.\n"
           "B: Sofia, what are you reading?\n"
           "G: I’m reading The Hobbit.\n"
           "B: Can you tell me about it?\n"
           "G: It’s a ⓐ ______ novel. It is about adventures in a magical world.\n"
           "B: It sounds interesting. I’m curious about the story.\n"
           "G: Why don’t you ⓑ ______ it? You’ll like it.\n"
           "B: Okay. I’ll try reading it.")
M100_D2 = ("[06-07] 다음 대화를 읽고, 물음에 답하시오.\n"
           "A: I’m trying to choose a book. ⓐCan you help me?\n"
           "B: Of course. What about The Wizard of Oz?\n"
           "A: Hmm... Can you tell me about it?\n"
           "B: Sure. It’s about the adventures of a young girl.\n"
           "A: I’d like to read it. I’m ⓑ ______ about adventures.\n"
           "B: You’ll like it.")
M100_P13 = ("[13-16] 다음 글을 읽고, 물음에 답하시오.\n"
            "For Beatrice, Friday began like any other day. She wore the same white socks ⓐ ______ both of her feet. "
            "Then she made a sandwich. She put exactly the same amount of peanut butter on each piece of bread.\n"
            "ⓒ ______ her way to school, her neighbor said, “Good morning, Perfect Girl.” "
            "People called Beatrice “Perfect Girl” because she never made mistakes. "
            "“Are you ready for tonight’s talent show?” her neighbor asked. Beatrice just smiled. "
            "She was a juggling champion. She won the talent show every year. ⓓHow wonderful she was!")
M100_P17 = ("[17-21] 다음 글을 읽고, 물음에 답하시오.\n"
            "At school, Beatrice had a cooking class. To make a cake, she carefully took some eggs out of the refrigerator. "
            "When she turned around, she stepped on ⓐ ______ slippery. She was ①about to fall! But she didn’t. "
            "“That was ⓑ ______!” she thought. She ②almost made a mistake. Because of this, she began to feel nervous.\n"
            "It was time for the talent show. The school gym was full of people. They said, “Look! That’s Perfect Girl!” "
            "Beatrice had butterflies in her ③hands. “Will I mess ⓒ ______? I’m worried,” she thought.\n"
            "Beatrice threw an egg into the air. Next, she added a salt shaker. ④Finally, she added a water balloon. "
            "But then she felt ⓓ ______ strange... Uh-oh! Beatrice’s nose started to itch. "
            "The salt shaker was ⓔ ______ of... pepper! “ACHOO!” Beatrice ⑤missed the water balloon, "
            "and it fell to the floor. Then... OOPS! The egg broke on top of her head.")
M100_P22 = ("[22-24] 다음 글을 읽고 물음에 답하시오.\n"
            "For the first time ever, Beatrice made a mistake. ⓐHow surprising! She thought, “What should I do? "
            "Cry? Run off the stage?” Suddenly, she began to laugh loudly. ⓑThe people looked at each other. "
            "Then everyone started to laugh together.\n"
            "That night, Beatrice had a deep sleep. The next morning, she woke up with a smile. "
            "She put a white sock on her left foot... and a green sock on her right foot! "
            "Now, ⓒ사람들은 그녀를 더 이상 “완벽한 소녀”라고 부르지 않는다. They just call her Beatrice.")


def build_mock_100():
    s = "Section A · 100발 100중"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, "01 다음 중 짝지어진 단어의 관계가 나머지와 다른 것은? (어휘)\n① danger : dangerous\n② fantasy : fantastic\n③ suddenly : sudden\n④ magic : magical\n⑤ emotion : emotional",
           ["①", "②", "③", "④", "⑤"], 3,
           "정답: ③. suddenly : sudden만 ‘부사 : 형용사’이고 나머지는 ‘명사 : 형용사’이다. (답지 37쪽, pp.230-233)", sec_title=s, direction=d),
        mc(2, "02 다음 빈칸에 공통으로 들어갈 말로 가장 적절한 것은? (어휘)\n• The ______ of the music was too loud.\n• Does this drum ______ good to you?",
           ["taste", "sound", "look", "become", "hear"], 2,
           "정답: ② sound. 명사 ‘소리’와 동사 ‘~하게 들리다’로 모두 쓴다. (답지 37쪽)", sec_title=s, direction=d),
        mc(3, "03 다음 밑줄 친 단어의 쓰임이 적절하지 않은 것은? (어휘)\n① This juice tastes spicy.\n② I always try to eat new food.\n③ The wizard showed his power.\n④ The adventure was very danger.\n⑤ She is interested in love stories.",
           ["①", "②", "③", "④", "⑤"], 4,
           "정답: ④. very 뒤에는 형용사 dangerous가 와야 한다. (답지 37쪽)", sec_title=s, direction=d),
        fill(4, M100_D1 + "\n\n04 위 대화에서 다음 영영풀이에 해당하는 단어를 찾아 쓰시오. (원형으로 쓸 것)\nan unusual, exciting or dangerous experience",
             ["adventure"], "정답: adventure. (답지 37쪽)", sec_title=s, direction=d),
        mc(5, M100_D1 + "\n\n05 위 대화의 빈칸 ⓐ와 ⓑ에 들어갈 말이 바르게 짝지어진 것은?",
           ["fantasy · lend", "science · lend", "romance · borrow", "fantasy · borrow", "science · borrow"], 4,
           "정답: ④ fantasy / borrow. (답지 37쪽)", sec_title=s, direction=d),
        mc(6, M100_D2 + "\n\n06 위 대화의 밑줄 친 ⓐ의 의도로 가장 적절한 것은?",
           ["상대방에게 자신의 독서 취향을 자랑", "상대방에게 특정 책을 추천", "책을 고르는 데 도움을 요청", "상대방이 읽은 책에 대해 질문", "상대방과 함께 책을 읽자고 제안"], 3,
           "정답: ③ 책을 고르는 데 도움을 요청. (답지 37쪽)", sec_title=s, direction=d),
        mc(7, M100_D2 + "\n\n07 위 대화의 빈칸 ⓑ에 들어갈 말로 가장 적절한 것은?",
           ["active", "positive", "serious", "curious", "cheerful"], 4,
           "정답: ④ curious. be curious about ~ (답지 37쪽)", sec_title=s, direction=d),
        mc(8, "08 다음 밑줄 친 부분이 어법상 옳은 것은?\n① I want anything cold.\n② I heard nothing bad.\n③ Did you see special something?\n④ I found something lose.\n⑤ I need anything new.",
           ["①", "②", "③", "④", "⑤"], 2,
           "정답: ② I heard nothing bad. -thing 뒤에 형용사가 온다. (답지 37쪽)", sec_title=s, direction=d),
        sentence(9, "09 다음 문장을 How로 시작하는 감탄문으로 바꾸시오.\nThe baby is very cute.",
                 ["How cute the baby is!", "How cute the baby is"], "정답: How cute the baby is! (답지 37쪽)", sec_title=s, direction=d),
        mc(10, "10 다음 중 어법상 옳은 것은?\n① I want to eat something delicious.\n② I want to eat delicious something.\n③ Something delicious I want to eat.\n④ I eat something is delicious.\n⑤ I want to something eat delicious.",
           ["①", "②", "③", "④", "⑤"], 1,
           "정답: ①. something을 형용사 delicious가 뒤에서 꾸민다. (답지 37쪽)", sec_title=s, direction=d),
        mc(11, "11 다음 중 감탄문으로 어법상 틀린 것은?\n① How kind she is!\n② What funny story!\n③ How fast he runs!\n④ What a big car it is!\n⑤ What delicious food!",
           ["①", "②", "③", "④", "⑤"], 2,
           "정답: ②. What a funny story!가 맞다. (답지 37쪽)", sec_title=s, direction=d),
        sentence(12, "12 다음 우리말에 맞도록 조건에 맞게 바르게 영작하시오.\n나는 차가운 어떤 것도 마시고 싶지 않다.\n조건 1. 「-thing + 형용사」의 구조를 이용할 것.\n조건 2. 총 7단어로 쓸 것.",
                 ["I don’t want to drink anything cold.", "I don't want to drink anything cold."],
                 "정답: I don’t want to drink anything cold. (답지 37쪽)", sec_title=s, direction=d),
        mc(13, M100_P13 + "\n\n13 윗글의 빈칸 ⓐ와 ⓒ에 공통으로 들어갈 말로 가장 적절한 것은? (대소문자 구분 없음)",
           ["in", "on", "into", "to", "for"], 2,
           "정답: ② on. on both of her feet / On her way to school. (답지 37쪽)", sec_title=s, direction=d),
        mc(14, M100_P13 + "\n\n14 윗글의 밑줄 친 ⓓ와 다른 의미로 쓰인 것은?\n① I did not know him then.\n② He cooked dinner, and then he ate it.\n③ We went to the park. Then we played soccer.\n④ They studied hard, and then they took the test.\n⑤ He bought a gift. Then he gave it to his friend.",
           ["①", "②", "③", "④", "⑤"], 1,
           "정답: ①. ‘그때’라는 뜻이고 나머지는 ‘그러고 나서’이다. (답지 37쪽)", sec_title=s, direction=d),
        sentence(15, M100_P13 + "\n\n15 윗글의 밑줄 친 ⓓ의 우리말을 조건에 맞게 바르게 영작하시오.\n조건 1. How 감탄문으로 만들 것.\n조건 2. wonderful을 포함할 것.\n조건 3. 총 4단어로 영작할 것.",
                 ["How wonderful she was!", "How wonderful she was"], "정답: How wonderful she was! (답지 37쪽)", sec_title=s, direction=d),
        mc(16, M100_P13 + "\n\n16 According to the passage, which one is TRUE?",
           ["Beatrice gets up very early.", "Beatrice eats toast for breakfast.", "Beatrice always wears different socks.", "Beatrice’s favorite food is peanut butter.", "Beatrice puts peanut butter on her sandwich."], 5,
           "정답: ⑤. 빵에 땅콩버터를 발랐다. (답지 37쪽)", sec_title=s, direction=d),
        fill(17, M100_P17 + "\n\n17 윗글의 빈칸 ⓐ와 ⓓ에 공통으로 알맞은 말을 쓰시오.",
             ["something"], "정답: something. something slippery / something strange (답지 37쪽)", sec_title=s, direction=d),
        mc(18, M100_P17 + "\n\n18 윗글의 밑줄 친 ①~⑤ 중 쓰임이 적절하지 않은 것은?",
           ["① about", "② almost", "③ hands", "④ Finally", "⑤ missed"], 3,
           "정답: ③ hands. 긴장했다는 뜻이므로 stomach가 맞다. (답지 37쪽)", sec_title=s, direction=d),
        mc(19, M100_P17 + "\n\n19 윗글의 빈칸 ⓑ, ⓒ, ⓔ에 들어갈 말이 바르게 짝지어진 것은?",
           ["closed · down · full", "closed · up · filled", "close · up · full", "close · down · filled", "closing · up · full"], 3,
           "정답: ③ close / up / full. (답지 37쪽)", sec_title=s, direction=d),
        fill(20, M100_P17 + "\n\n20 다음 영영풀이에 해당하는 단어를 윗글에서 찾아 쓰시오.\nfeeling worried or scared about something unpleasant",
             ["nervous"], "정답: nervous. (답지 37쪽)", sec_title=s, direction=d),
        mc(21, M100_P17 + "\n\n21 What almost happened to Beatrice in cooking class?",
           ["She burned a cake.", "She dropped an egg.", "She was late for the class.", "She slipped but didn’t fall.", "She spilled milk on the floor."], 4,
           "정답: ④. 미끄러져 넘어질 뻔했다. (답지 37쪽)", sec_title=s, direction=d),
        sentence(22, M100_P22 + "\n\n22 윗글의 밑줄 친 ⓐ를 What으로 시작하는 감탄문으로 바꾸시오. (3단어로 쓸 것)",
                 ["What a surprise!", "What a surprise"], "정답: What a surprise! (답지 37쪽)", sec_title=s, direction=d),
        mc(23, M100_P22 + "\n\n23 윗글의 밑줄 친 ⓑ에서 드러난 사람들의 감정으로 가장 적절한 것은?",
           ["놀라움", "두려움", "우울함", "행복", "분노"], 1,
           "정답: ① 놀라움. (답지 37쪽)", sec_title=s, direction=d),
        sentence(24, M100_P22 + "\n\n24 윗글의 밑줄 친 ⓒ의 우리말을 괄호 안의 단어들을 배열하여 바르게 영작하시오.\n(no / people / longer / her / “Perfect Girl” / call)",
                 ["people no longer call her “Perfect Girl”", "People no longer call her \"Perfect Girl\""],
                 "정답: people no longer call her “Perfect Girl”. (답지 37쪽)", sec_title=s, direction=d),
    ]
    q26 = fill(25, "[25] 다음 글을 읽고, 빈칸 ⓐ, ⓑ에 들어갈 말이 바르게 짝지어진 것은?\n"
                    "I read Charlie and the Chocolate Factory. The writer of this book is Roald Dahl. "
                    "I chose it ⓐ ______ I wanted to read something exciting. The story is about Charlie’s adventure "
                    "in a magical chocolate factory. My favorite part was ⓑ ______ Charlie found the golden ticket. "
                    "What a fantastic book it is.",
               ["because, when", "because when"], "정답: because / when. (답지 37쪽)", sec_title=s, direction=d)
    q26.update({"type": "mc", "select": "one",
                "choices": ["because · when", "because · what", "when · because", "after · because", "after · when"],
                "correctIndexes": [1], "answerMode": "choice", "answerModeTag": "Choose · 고르기",
                "ruleKo": "보기 중에서 하나를 누르세요. 번호는 쓰지 않아요."})
    q26.pop("accept", None)
    q26.pop("phraseBlank", None)
    qs.append(q26)
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("mock-100", "100발 100중 모의고사", UNIT, "pp.230-233",
              "통과 80%. 25문항입니다. 어휘·대화·문법·독해가 고루 나옵니다.", sections, qs))


BUILDERS["mock-100"] = build_mock_100


MH_D1 = ("[04-05] 다음 대화를 읽고, 물음에 답하시오.\n"
         "B: Excuse me. I’d like to ⓐ ______ out this book.\n"
         "W: Sure. Can you show your library card to me, please?\n"
         "B: ⓑ ______\n"
         "W: Thank you. Please ⓒ ______ the book by next week.\n"
         "B: Okay. Thank you.")
MH_D2 = ("[06-07] 다음 대화를 읽고, 물음에 답하시오.\n"
         "A: Which story did you choose?\n"
         "B: I chose Inside Out.\n"
         "A: Can you explain the lesson of the story to me?\n"
         "B: Sure. The lesson is that emotions aren’t ⓐ ______.\n"
         "A: Do you like the ⓑ ______? I’m curious about your opinion.\n"
         "B: Yes, I like it. I ⓒ ______ that all emotions are important.")
MH_P13 = ("[13-17] 다음 글을 읽고, 물음에 답하시오.\n"
          "For Beatrice, Friday began ⓐlike any other day. She wore the same white socks on both of her feet. "
          "Then she made a sandwich. She put exactly the same amount of peanut butter on each piece of bread.\n"
          "On her way to school, her neighbor said, “Good morning, Perfect Girl.” "
          "People called Beatrice “Perfect Girl” because she never made mistakes. "
          "“Are you ready for tonight’s talent show?” her neighbor asked. Beatrice just smiled. "
          "She was a juggling champion. She won the talent show every year. ⓑHow wonderful she was!")
MH_P18 = ("[18-21] 다음 글을 읽고, 물음에 답하시오.\n"
          "At school, Beatrice had a cooking class. To make a cake, she carefully took some eggs out of the refrigerator. "
          "When she turned around, ⓐ미끄러운 무언가를 밟았다. She was about to fall! But she didn’t. "
          "“That was close!” she thought. She almost made a mistake. Because of this, she began to feel nervous.\n"
          "It was time for the talent show. The school gym was full of people. They said, “Look! That’s Perfect Girl!” "
          "Beatrice had ⓑbutterflies in her stomach. “Will I mess up? I’m worried,” she thought.\n"
          "Beatrice threw an egg into the air. Next, she added a salt shaker. Finally, she added a water balloon. "
          "But then she felt something strange... Uh-oh! Beatrice’s nose started to itch. "
          "The salt shaker was full of... pepper! “ACHOO!” Beatrice missed the water balloon, and it fell to the floor. "
          "Then... OOPS! The egg broke on top of her head.")
MH_P22 = ("[22-25] 다음 글을 읽고, 물음에 답하시오.\n"
          "For the first time ever, Beatrice made a mistake. What a surprise! She thought, “What should I do? "
          "Cry? Run off the stage?” Suddenly, she began to laugh loudly. The people looked at each other. "
          "Then everyone started to laugh together.\n"
          "That night, Beatrice had a deep sleep. The next morning, she woke up with a smile. "
          "ⓐShe puts a white sock in her left foot... and a green sock in her right foot! "
          "Now, people no longer call her “Perfect Girl.” They just call her Beatrice.")


def build_mock_high():
    s = "Section A · 고득점"
    d = "알맞은 것을 고르시오."
    qs = [
        mc(1, "01 다음 짝지어진 두 단어의 관계가 나머지와 다른 것은? (어휘)\n① magic : magical\n② planet : plant\n③ danger : dangerous\n④ taste : tasty\n⑤ fantasy : fantastic",
           ["①", "②", "③", "④", "⑤"], 2,
           "정답: ②. planet : plant는 서로 관계가 없고 나머지는 ‘명사 : 형용사’이다. (답지 38쪽, pp.234-237)", sec_title=s, direction=d),
        mc(2, "02 다음 빈칸에 들어갈 말로 가장 적절한 것은? (어휘)\nThe main ______ of the story is a young wizard.",
           ["champion", "character", "adventure", "shelf", "viewer"], 2,
           "정답: ② character. (답지 38쪽)", sec_title=s, direction=d),
        mc(3, "03 다음 빈칸에 들어갈 말로 가장 적절한 것은? (어휘)\nA: I can’t decide which book to read.\nB: ______ checking out the new fantasy novel?",
           ["What about", "Here you go", "Be proud of", "No longer", "Run off"], 1,
           "정답: ① What about. (답지 38쪽)", sec_title=s, direction=d),
        mc(4, MH_D1 + "\n\n04 위 대화의 빈칸 ⓐ와 ⓒ에 들어갈 말이 바르게 짝지어진 것은?",
           ["look · take", "look · return", "drop · add", "check · take", "check · return"], 5,
           "정답: ⑤ check / return. (답지 38쪽)", sec_title=s, direction=d),
        mc(5, MH_D1 + "\n\n05 위 대화의 빈칸 ⓑ에 들어갈 말로 가장 적절한 것은?",
           ["Here you go.", "Here go you.", "There you are.", "There are you.", "Where are you?"], 1,
           "정답: ① Here you go. (답지 38쪽)", sec_title=s, direction=d),
        mc(6, MH_D2 + "\n\n06 위 대화의 빈칸 ⓐ에 들어갈 말로 가장 적절한 것은?",
           ["hot and cold", "cheap and expensive", "easy or difficult", "good or bad", "same or different"], 4,
           "정답: ④ good or bad. (답지 38쪽)", sec_title=s, direction=d),
        mc(7, MH_D2 + "\n\n07 윗글의 빈칸 ⓑ와 ⓒ에 들어갈 말이 바르게 짝지어진 것은?",
           ["lesson · forgot", "lesson · learned", "friendship · showed", "mistake · missed", "mistake · explained"], 2,
           "정답: ② lesson / learned. (답지 38쪽)", sec_title=s, direction=d),
        mc(8, "08 다음 문장에서 빈칸에 들어갈 가장 적절한 것은?\n______ you are!",
           ["How nice", "What nice", "What a nice", "How a nice", "What an nice"], 1,
           "정답: ① How nice. How + 형용사 + 주어 + 동사. (답지 38쪽)", sec_title=s, direction=d),
        mc(9, "09 다음 우리말에 맞도록 바르게 영작한 것은? (문법)\n나는 마실 따뜻한 무언가가 필요하다.",
           ["I need warm some to drink.", "I need something warm to drink.", "I need warm something to drink.", "I need something to warm to drink.", "I need to warm something to drink."], 2,
           "정답: ② I need something warm to drink. (답지 38쪽)", sec_title=s, direction=d),
        sentence("10-1", "10 다음 문장을 How 감탄문과 What 감탄문으로 각각 바꾸시오.\nThe movie was very touching.\n→ How 감탄문: ______",
                 ["How touching the movie was!", "How touching the movie was"], "정답: How touching the movie was! (답지 38쪽)", sec_title=s, direction=d, seconds=90),
        sentence("10-2", "10 다음 문장을 How 감탄문과 What 감탄문으로 각각 바꾸시오.\nThe movie was very touching.\n→ What 감탄문: ______",
                 ["What a touching movie it was!", "What a touching movie it was", "What a touching movie!", "What a touching movie"], "정답: What a touching movie it was! (답지 38쪽)", sec_title=s, direction=d, seconds=90),
        mc(11, "11 다음 중 어법상 틀린 것은?\n① What a big umbrella!\n② How neat is her room!\n③ I saw nothing bad in the movie.\n④ Don’t touch anything dangerous.\n⑤ I want to do something good today.",
           ["①", "②", "③", "④", "⑤"], 2,
           "정답: ②. How neat her room is!가 맞다. (답지 38쪽)", sec_title=s, direction=d),
        mc(12, "12 다음 괄호 안의 단어들을 순서대로 바르게 배열하여 문장을 완성할 때 네 번째로 오는 단어는? (고난도)\n그 파티에서는 맛있는 것이 아무것도 없었니? (party / delicious / nothing / was / the / there / at / ?)",
           ["party", "delicious", "nothing", "was", "there"], 2,
           "정답: ② delicious. Was there nothing delicious at the party? (답지 38쪽)", sec_title=s, direction=d),
        mc(13, MH_P13 + "\n\n13 윗글의 밑줄 친 ⓐ의 의미로 가장 적절한 것은?",
           ["peacefully", "as usual", "early", "busily", "before long"], 2,
           "정답: ② as usual. (답지 38쪽)", sec_title=s, direction=d),
        mc(14, MH_P13 + "\n\n14 윗글의 첫 번째 단락을 쓴 목적으로 가장 적절한 것은?",
           ["To introduce Beatrice’s best friend", "To explain Beatrice’s morning routine", "To show how Beatrice prepares breakfast", "To tell a story about a cooking contest", "To explain why Beatrice likes peanut butter"], 2,
           "정답: ② Beatrice의 아침 일과를 설명한다. (답지 38쪽)", sec_title=s, direction=d),
        sentence(15, MH_P13 + "\n\n15 윗글의 밑줄 친 ⓑ를 4단어로 된 평서문으로 고쳐 쓰시오.",
                 ["She was very wonderful.", "She was so wonderful."],
                 "정답: She was very(so) wonderful. (답지 38쪽)", sec_title=s, direction=d),
        mc(16, MH_P13 + "\n\n16 Which one can be answered according to the passage?",
           ["What is Beatrice’s favorite fruit?", "What time does Beatrice wake up?", "Does Beatrice greet her neighbors in return?", "What does Beatrice do after she wears socks?", "How long does it take for Beatrice to make breakfast?"], 4,
           "정답: ④. 양말을 신은 뒤 샌드위치를 만들었다. (답지 38쪽)", sec_title=s, direction=d),
        fill("17-1", MH_P13 + "\n\n17 윗글을 읽고 아래와 같이 요약할 때, 빈칸에 들어갈 적절한 말을 쓰시오.\nPeople called Beatrice “ⓐ ______ Girl” because she never made mistakes.\n(ⓐ에 들어갈 말)",
             ["Perfect"], "정답: ⓐ Perfect. (답지 38쪽)", sec_title=s, direction=d, seconds=60),
        fill("17-2", MH_P13 + "\n\n17 윗글을 읽고 아래와 같이 요약할 때, 빈칸에 들어갈 적절한 말을 쓰시오.\nBeatrice was a juggling ⓑ ______ and won the talent show every year.\n(ⓑ에 들어갈 말)",
             ["champion"], "정답: ⓑ champion. (답지 38쪽)", sec_title=s, direction=d, seconds=60),
        sentence(18, MH_P18 + "\n\n18 윗글의 밑줄 친 ⓐ의 우리말을 괄호 안의 단어들을 이용하여 바르게 영작하시오. (필요시 어형을 바꿀 것)\n(slippery, step on)",
                 ["she stepped on something slippery", "She stepped on something slippery"],
                 "정답: she stepped on something slippery. (답지 38쪽)", sec_title=s, direction=d),
        mc(19, MH_P18 + "\n\n19 According to the first passage, which one is TRUE?",
           ["Beatrice is afraid of cooking.", "Beatrice enjoys being nervous.", "Beatrice almost fell, but she didn’t.", "Beatrice dropped the egg on the floor.", "Beatrice always makes mistakes in cooking class."], 3,
           "정답: ③. 넘어질 뻔했지만 넘어지지 않았다. (답지 38쪽)", sec_title=s, direction=d),
        fill(20, MH_P18 + "\n\n20 윗글의 밑줄 친 ⓑ와 같은 의미가 되도록 빈칸에 들어갈 적절한 말을 써서 문장을 완성하시오. (주어진 철자로 시작할 것)\n→ Beatrice (f)______ (n)______.",
             ["felt nervous"], "정답: felt nervous. (답지 38쪽)", sec_title=s, direction=d, phrase=True),
        mc(21, MH_P18 + "\n\n21 Which one can be answered according to the passage?",
           ["Who won the talent show?", "Why did Beatrice sneeze?", "What is the name of the school gym?", "How many people were in the audience?", "What did Beatrice eat before the show?"], 2,
           "정답: ② Why did Beatrice sneeze? (답지 38쪽)", sec_title=s, direction=d),
        sentence(22, MH_P22 + "\n\n22 윗글의 밑줄 친 ⓐ에서 어법상 틀린 것을 찾아 바르게 고쳐 다시 쓰시오. (세 곳을 찾아 고칠 것)\n → ______",
                 ["She put a white sock on her left foot... and a green sock on her right foot!"],
                 "정답: She put a white sock on her left foot... and a green sock on her right foot! (puts→put, in→on 두 곳) (답지 38쪽)", sec_title=s, direction=d),
        mc(23, MH_P22 + "\n\n23 What change happened to Beatrice the next morning?",
           ["She practiced juggling more.", "She did not go to school.", "She decided to stop juggling.", "She was not perfect about her socks.", "Her mother called Beatrice a perfect girl."], 4,
           "정답: ④. 짝짝이 양말을 신었다. (답지 38쪽)", sec_title=s, direction=d),
        mc(24, MH_P22 + "\n\n24 윗글의 내용을 바르게 이해하지 못한 사람은?",
           ["지수: Beatrice는 실수를 한 후 당황했어.", "민지: Beatrice의 실수는 처음 있는 일이었어.", "서연: Beatrice가 실수를 하자 관객들은 처음에 화를 냈어.", "예나: Beatrice는 실수 후에 크게 웃기 시작했어.", "도윤: Beatrice가 웃자 관객들도 함께 웃었어."], 3,
           "정답: ③. 관객들은 서로를 바라보았다. (답지 38쪽)", sec_title=s, direction=d),
    ]
    qs.append(fill(25, MH_P22 + "\n\n25 윗글을 다음과 같이 요약할 때, 빈칸에 들어갈 적절한 말을 쓰시오.\nBeatrice made a mistake and laughed. Everyone ⓐ ______ with her. She felt happy. Now people ⓑ ______ call her “Perfect Girl,” just Beatrice.",
                   ["laughed, don’t", "laughed, don't"], "정답: ⓐ laughed ⓑ don’t. (답지 38쪽)", sec_title=s, direction=d))
    sections = [sec("s1", s, d, CHOICE, len(qs))]
    write(doc("mock-high", "고득점 모의고사", UNIT, "pp.234-237",
              "통과 80%. 26문항입니다. 어휘·대화·문법·독해가 고루 나옵니다.", sections, qs))


BUILDERS["mock-high"] = build_mock_high

if __name__ == "__main__":
    names = sys.argv[1:] or sorted(BUILDERS)
    for n in names:
        BUILDERS[n]()
