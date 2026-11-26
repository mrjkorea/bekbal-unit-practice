#!/usr/bin/env python3
"""Rebuild every X-10 대화 영작 practice as one card per line.

Jay 2026-11-25: students found the whole-dialogue typing impossible. Ten dialogues
of 30-40 words each, one accepted wording, speaker labels they were never told to
type, one typo wiping out a whole dialogue, all inside 18 minutes and an 80% gate.
The practice stays, the wall goes:

  - one card per LINE, so a slip costs one line, not a whole dialogue;
  - the opening words are printed on the card (시작: …), so the student is not
    guessing which of six correct English sentences we happened to store;
  - the speaker letter (M:/W:) is never typed;
  - contractions are interchangeable (I'm = I am, can't = cannot);
  - practiceMode: no pass gate, no clock, unlimited tries, the model line shown
    after each submit, because this is a drill and not a test.

Run: python3 scripts/rebuild-dialog-write.py [--check]
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERN = os.path.join(ROOT, "data", "*", "*", "exercises", "x10-dialog-write.json")

SPEAKER = re.compile(r"^(?:남자|여자|M|W|B|G)\s*:\s*")
SPLIT_KO = re.compile(r"(?=(?:남자|여자)\s*:)")
LEAD_NUM = re.compile(r"^\s*\d+\s*")
LABEL = re.compile(r"^\s*[A-Za-z]{1,12}\s*[:)]\s*")

INTRO = ("한 줄씩 쓰는 연습입니다. 카드마다 우리말이 있고, 시작하는 말도 적혀 있습니다. "
         "그 말에 이어서 영어 문장을 완성하세요. 말하는 사람(M·W)은 쓰지 않아도 됩니다. "
         "대소문자와 마침표는 채점에 영향이 없고, I'm과 I am, can't와 cannot은 같은 것으로 봅니다. "
         "시간 제한이 없고, 몇 번이든 다시 풀 수 있습니다. "
         "· Write one line at a time. The opening words are given; finish the sentence.")

COPY = ("이 연습은 교재 문장을 정확히 옮겨 쓰는 연습입니다. 카드에 영어 문장이 그대로 나오니, "
        "보고 그대로 쓰세요. 말하는 사람(M·W)은 쓰지 않아도 되고, 대소문자와 마침표는 채점에 영향이 없습니다. "
        "시간 제한이 없고, 몇 번이든 다시 풀 수 있습니다. · Copy each printed line exactly; this unit has "
        "no Korean cue in the book pages we hold.")

RULE = ("말하는 사람(M·W)은 쓰지 않아도 됩니다. 대소문자와 마침표는 상관없습니다. "
        "I'm=I am, can't=cannot처럼 같은 말은 모두 맞게 채점됩니다.")

# Two dialogues whose printed Korean is compressed into fewer blocks than the
# printed English lines. The Korean is the book's own; where the book prints no
# Korean for a line, the card says what the line does instead of inventing words.
HAND_CUES = {
    ("j1-visang", "u07", "8"): [
        "남자: Jessica, 네 가방 예쁘다.",
        "여자: 오래된 청바지로 만들었어. 지구의 날 프로젝트야.",
        "남자: 나도 지구의 날에 뭔가 하고 싶어.",
        "여자: 오래된 옷을 재사용하는 짧은 동영상을 함께 만들자.",
        "남자: (앞사람의 제안에 답한다)",
    ],
    ("j1-visang", "u08", "8"): [
        "남자: Lena, 주말에 뭐 했어?",
        "여자: 가족과 어린이 병원에서 작은 콘서트를 열었어.",
        "남자: (다시 묻고 칭찬한다)",
        "여자: 아빠는 바이올린, 엄마는 피아노, 나는 노래를 몇 곡 불렀어. 올해 최고의 날이었어.",
    ],
}


# A short reply has several right English forms, and the book prints one. These are
# the equivalents a Korean student would reasonably write for the same 우리말.
REPLIES = {
    "sure.": ["of course.", "okay.", "ok.", "yes, of course."],
    "sure": ["of course", "okay", "ok", "yes, of course"],
    "okay.": ["ok.", "sure.", "all right.", "alright."],
    "okay": ["ok", "sure", "all right", "alright"],
    "why?": ["for what?", "why", "why?"],
    "that's a good idea.": ["that's a great idea.", "good idea.", "that sounds good.", "that's a nice idea.", "great idea."],
    "that's a great idea.": ["that's a good idea.", "great idea.", "that sounds great.", "that's a nice idea."],
    "that sounds great!": ["that sounds good!", "sounds great!", "sounds good!", "that sounds fun!"],
    "that sounds fun!": ["that sounds great!", "that sounds good!", "sounds fun!"],
    "that sounds good.": ["that sounds great.", "sounds good.", "sounds great."],
    "sounds interesting.": ["that sounds interesting.", "sounds good.", "interesting."],
    "i'd love to!": ["i would love to!", "sure, i'd love to!", "yes, i'd love to!"],
    "here you are.": ["here you go.", "here it is."],
    "okay. thank you.": ["ok. thanks.", "okay, thanks.", "thanks."],
    "me, too.": ["me too.", "so do i.", "i do, too."],
    "of course.": ["sure.", "yes, of course.", "certainly."],
}


def strip_label(s):
    return LABEL.sub("", str(s or "")).strip()


def speaker(s):
    m = re.match(r"^\s*([A-Za-z]{1,12})\s*[:.)]", str(s or ""))
    return m.group(1) if m else ""


def lines_of(text):
    return [l.strip() for l in re.split(r"\n", str(text or "")) if l.strip()]


def ko_blocks(prompt):
    body = LEAD_NUM.sub("", str(prompt or "").strip())
    return [b.strip() for b in SPLIT_KO.split(body) if b.strip()]


def hint_for(line):
    """"시작: I can't …" — the first few words, never the whole line."""
    toks = strip_label(line).split()
    if len(toks) <= 1:
        return ""
    take = min(3, len(toks) - 1)
    return " ".join(toks[:take]).rstrip(",.;:?!") + " …"


def make_line_item(num, idx, total, ko, en, seconds, section, section_title):
    full = en.strip()
    bare = strip_label(full)
    variants = [full, bare]
    for key in (full.lower(), bare.lower()):
        for extra in REPLIES.get(key, []):
            cap = extra[:1].upper() + extra[1:]
            for v in (extra, cap):
                if v not in variants:
                    variants.append(v)
    return {
        "id": "%s-%d" % (num, idx + 1),
        "label": "%s-%d" % (num, idx + 1),
        "sourceId": "%s" % num,
        "section": section,
        "sectionTitle": section_title,
        "directionKo": "우리말에 맞게 한 줄씩 쓰세요.",
        "ruleKo": RULE,
        "sectionInstructionKo": "우리말에 맞게 한 줄씩 쓰세요. " + RULE,
        "answerMode": "sentence",
        "answerModeTag": "Type · 한 줄",
        "type": "sentence",
        "promptEn": "%s\n시작: %s" % (ko, hint_for(full)) if hint_for(full) else ko,
        "accept": variants,
        "explainKo": "정답: %s" % full,
        "seconds": seconds,
    }


def rebuild(path, apply_changes=True):
    doc = json.load(open(path, encoding="utf-8"))
    slug = path.split(os.sep)[-4]
    unit = path.split(os.sep)[-3]
    book = doc.get("book") or slug
    old = doc.get("questions") or doc.get("items") or []
    out = []
    split_dialogues = 0
    kept = 0

    for q in old:
        acc = q.get("accept") or []
        en_lines = lines_of(acc[0]) if acc else []
        multi = len(en_lines) > 1
        if not multi:
            # already one line: only the hint, the rule and the practice flag change
            q = dict(q)
            line = acc[0] if acc else ""
            h = hint_for(line)
            if h and "시작:" not in (q.get("promptEn") or ""):
                q["promptEn"] = (q.get("promptEn") or "").rstrip() + "\n시작: " + h
            q.setdefault("accept", [])
            if line and strip_label(line) not in q["accept"]:
                q["accept"].append(strip_label(line))
            for key in ((line or "").lower(), strip_label(line).lower()):
                for extra in REPLIES.get(key, []):
                    for v in (extra, extra[:1].upper() + extra[1:]):
                        if v not in q["accept"]:
                            q["accept"].append(v)
            q["ruleKo"] = RULE
            q["sectionInstructionKo"] = (q.get("directionKo") or "문장을 쓰세요.") + " " + RULE
            kept += 1
            out.append(q)
            continue

        num = str(q.get("id"))
        split_dialogues += 1
        hand = HAND_CUES.get((slug, unit, num))
        kos = hand if hand else ko_blocks(q.get("promptEn"))
        if len(kos) != len(en_lines):
            raise SystemExit("%s #%s: %d Korean blocks for %d English lines, add it to HAND_CUES"
                             % (path, num, len(kos), len(en_lines)))
        sec = "d%s" % re.sub(r"\D", "", num)[:2]
        title = "%s번 대화 · 한 줄씩" % num
        per = max(25, int(round((q.get("seconds") or 110) / max(1, len(en_lines)))))
        for i, (en, ko) in enumerate(zip(en_lines, kos)):
            out.append(make_line_item(num, i, len(en_lines), ko, en, per, sec, title))

    doc["questions"] = out
    if "items" in doc:
        doc["items"] = out
    doc["questionCount"] = len(out)
    doc["practiceMode"] = True
    # Two units carry no Korean cue in the data we hold (the X-10 workbook pages are not
    # in the scans), so those cards print the book's English and the job is to write it
    # out exactly. Say so on the page instead of pretending it is translation practice.
    has_korean = any(any("\uac00" <= ch <= "\ud7a3" for ch in (q.get("promptEn") or "").split("\n시작:")[0])
                     for q in out)
    doc["introKo"] = INTRO if has_korean else COPY
    secs = []
    seen = {}
    for q in out:
        sid = q.get("section") or "s1"
        if sid not in seen:
            seen[sid] = {
                "id": sid,
                "title": q.get("sectionTitle") or "대화 영작",
                "directionKo": q.get("directionKo"),
                "ruleKo": RULE,
                "answerMode": "sentence",
                "answerModeTag": "Type · 한 줄",
                "instructionKo": (q.get("directionKo") or "문장을 쓰세요.") + " " + RULE,
                "itemCount": 0,
            }
            secs.append(seen[sid])
        seen[sid]["itemCount"] += 1
    doc["sections"] = secs
    if apply_changes:
        open(path, "w", encoding="utf-8").write(json.dumps(doc, ensure_ascii=False, indent=1) + "\n")
    return dict(file=os.path.relpath(path, ROOT), book=book, unit=unit,
                split_dialogues=split_dialogues, kept=kept, items=len(out),
                sections=len(secs))


def main():
    check = "--check" in sys.argv
    for path in sorted(glob.glob(PATTERN)):
        info = rebuild(path, apply_changes=not check)
        print("%-46s dialogues split %2d · single lines %3d · cards %3d · sections %2d"
              % (info["file"], info["split_dialogues"], info["kept"], info["items"], info["sections"]))
    if check:
        print("(dry run, nothing written)")


if __name__ == "__main__":
    main()
