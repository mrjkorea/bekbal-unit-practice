#!/usr/bin/env python3
"""Catch items whose keyed answer cannot sit in its own blank.

Jay 2026-11-14: an item asked for the word in
"I am planning ______ to the concert." with the key "to", which reads
"planning to to the concert"; the answer had to be "to go" and a student who
wrote it was marked wrong. Green-lighting that item is the fault this stops.

Checks, per item:
  1. a choice item's key index points outside its choices, or it has < 2 choices,
  2. a one-to-three-word answer repeats the word before or after its own blank,
     or doubles a word inside itself ("to to", "the the"),
  3. a short answer needs a blank and the item has none,
  4. a prompt that asks for 총 N단어 has no accepted answer of exactly N words,
     so a correct sentence of the stated length is marked wrong.

Run before every push:
  python3 scripts/validate_exercises.py
Exit 1 means at least one item failed. --json prints machine-readable output.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERN = os.path.join(ROOT, "data", "*", "*", "exercises", "*.json")
BLANK = re.compile(r"_{2,}")


def words(s):
    return re.findall(r"[A-Za-z][A-Za-z'-]*", s or "")


def strip_hints(line):
    line = re.sub(r"\([^)]*\)", " ", line)        # (we, why)
    line = re.sub(r"보기\s*:.*$", " ", line)       # 보기: a, b, c
    return line


def item_answer(q):
    mode = q.get("answerMode") or q.get("type") or ""
    if mode == "choice" and (q.get("choices") or q.get("select")):
        idx = q.get("correctIndexes") or []
        ch = q.get("choices") or []
        if not idx or not ch:
            return mode, None, [], ch, idx
        return mode, ch[idx[0] - 1] if 1 <= idx[0] <= len(ch) else None, ch, ch, idx
    acc = q.get("accept") or q.get("answers") or []
    return mode, (acc[0] if acc else None), list(acc[1:]), [], []


def locate_blank(prompt, focus):
    """the (before, after) text of the blank this item's answer belongs to"""
    lines = [l for l in str(prompt or "").split("\n") if BLANK.search(l)]
    if not lines:
        return None
    focus = str(focus or "").strip()
    if focus:
        pat = re.compile(r"\(\s*" + re.escape(focus) + r"\s*\)\s*_{2,}")
        for l in lines:
            m = pat.search(l)
            if m:
                return l[:m.start()], l[m.end():]
        return None
    if len(re.findall(r"_{2,}", str(prompt))) == 1:
        line = lines[0]
        m = BLANK.search(line)
        return line[:m.start()], line[m.end():]
    return None


def check_item(q):
    out = []
    mode, ans, extra, choices, idx = item_answer(q)
    is_choice = mode == "choice" and (choices or q.get("select"))
    if is_choice:
        if len(choices) < 2:
            out.append("choice item with fewer than two choices")
        if not idx or idx[0] < 1 or idx[0] > len(choices):
            out.append("key index points outside the choices")
            return out
    if ans is None:
        return out
    toks = words(ans)
    if not toks:
        return out
    short = len(toks) <= 3
    span = locate_blank(q.get("promptEn") or "", q.get("focusBlank"))
    if span is None:
        return out
    before, after = span
    prev = (words(strip_hints(before)) or [""])[-1].lower()
    nxt = (words(strip_hints(after)) or [""])[0].lower()
    for variant in [ans] + extra[:2]:
        t = [w.lower() for w in words(variant)]
        if not t or "/" in str(variant):
            continue
        if len(t) > 1 and any(a == b for a, b in zip(t, t[1:])):
            out.append(f'answer doubles a word: "{variant}"')
        if prev and t[0] == prev and len(t) <= 3:
            out.append(f'answer starts with the word before the blank: "{variant}" after "{prev}"')
        if nxt and t[-1] == nxt and len(t) <= 3:
            out.append(f'answer ends with the word after the blank: "{variant}" before "{nxt}"')
    return out


# Checked by hand and correct: the flagged word repeats across a blank boundary
# because the passage itself lists the words ("(13) __ (14) __ great idea",
# "hurt : ___" past tense is hurt), or because the item also accepts the whole
# sentence. These are not wrong-key items; anything NOT on this list fails.
ALLOW = {
    ("data/j1-neung/u06/exercises/dialog-complete.json", "103"): "slot 14 is 'a' in '(13) (14) great idea'",
    ("data/j1-neung/u06/exercises/final-3.json", "Q08"): "answer names what (B) refers to; the blank belongs to (A)",
    ("data/j1-neung/u07/exercises/mock-high.json", "3"): "past tense of hurt is hurt",
    ("data/j1-newrun/u04/exercises/writing.json", "2-2"): "also accepts the short form 'tastes spicy'",
    ("data/j1-newrun/u04/exercises/writing.json", "2-3"): "also accepts the short form 'looks unique'",
    ("data/j1-newrun/u04/exercises/writing.json", "2-4"): "also accepts the short form 'looks colorful'",
    ("data/j2-neung/u08/exercises/x10-dialog-cloze.json", "2-5"): "blank 5 is 'I' after the separate blank 4 'Actually'",
}


def allowed(rel, qid):
    return (rel.replace(os.sep, "/"), str(qid)) in ALLOW


def word_len(s):
    return len([w for w in str(s).split() if any(ch.isalnum() for ch in w)])


def check_word_count(q):
    """Jay 2026-11-17: a prompt may not demand a word count that no stored
    answer meets, because then a correct sentence of that length is marked wrong.
    A prompt that gives one count per blank (예: (1)은 8단어, (2)는 9단어) needs
    only one of those counts to land, since each card answers one blank."""
    prompt = q.get("promptEn") or ""
    need = [int(n) for n in re.findall(r"총\s*(\d+)\s*단어", prompt)]
    if not need:
        return []
    accept = [a for a in (q.get("accept") or []) if isinstance(a, str)]
    if not accept:
        return []
    got = [word_len(a) for a in accept]
    if any(n in got for n in need):
        return []
    return [f"word count: prompt says {need} words, accepted answers have {got}"]


def main():
    as_json = "--json" in sys.argv
    bad = []
    total = 0
    for f in sorted(glob.glob(PATTERN)):
        d = json.load(open(f, encoding="utf-8"))
        for q in d.get("questions") or []:
            total += 1
            probs = check_item(q)
            probs += check_word_count(q)
            rel = os.path.relpath(f, ROOT)
            if probs and allowed(rel, q.get("id")):
                probs = []
            if probs:
                bad.append({"file": os.path.relpath(f, ROOT),
                            "id": q.get("id"), "label": q.get("label"),
                            "problems": probs,
                            "prompt": (q.get("promptEn") or "")[-200:]})
    if as_json:
        print(json.dumps({"checked": total, "failed": bad}, ensure_ascii=False, indent=1))
    else:
        print(f"checked {total} questions, {len(bad)} failed")
        for b in bad:
            print(f"- {b['file']} #{b['label'] or b['id']}")
            for p in b["problems"]:
                print(f"    {p}")
            print(f"    ...{b['prompt'].replace(chr(10), ' / ')}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
