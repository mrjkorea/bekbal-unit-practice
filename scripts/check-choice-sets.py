#!/usr/bin/env python3
"""A "pick the right ones" item must offer an option that really is the right set.

Jay 2026-11-24: 중1 비상 모의고사 12 asked 다음 중 어법상 옳은 것끼리 바르게
짝지어진 것은 among ⓐ~ⓔ. Its options were typed by hand and two of them lost
the ⓑ, so the correct set ⓑ,ⓓ,ⓔ was on no button at all. Every student was
wrong, however well they knew the grammar, and the stored key pointed at a
button whose text said only ⓓ,ⓔ. No shape check could see it, because each
button was a well-formed set of letters.

This one reads the card against itself. When a card is a set-of-letters choice
(ⓐ, ⓑ, ⓔ …) and its own explanation names the letters that must be corrected,
the card is checked three ways:

  1. every option is a different set of letters, and only letters the prompt
     actually uses,
  2. the set the explanation implies is on the buttons,
  3. the key points at that set.

The explanation is our own note from the answer page, so this catches a
mistyped option, not a mistyped key alone. It cannot judge grammar: when the
note names nothing, the item is counted as unproven and printed, not failed.

  python3 scripts/check-choice-sets.py            # fail on a broken card
  python3 scripts/check-choice-sets.py --list     # also list unproven items
Exit 1 means at least one card is broken or unproven-but-keyed-wrong.
"""
import argparse
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERN = os.path.join(ROOT, "data", "*", "*", "exercises", "*.json")
CIRCLED = "ⓐⓑⓒⓓⓔⓕⓖⓗ"
SET_ONLY = re.compile(r"^[ⓐ-ⓗ](,\s*[ⓐ-ⓗ])*$")
# "ⓐ는", "ⓐ·ⓓ는", "ⓐ와 ⓒ는" — a letter set the note then talks about
NAMED = re.compile(r"([ⓐ-ⓗ](?:\s*[,·와과]\s*[ⓐ-ⓗ])*)\s*(?:는|은)")
# the note says these need fixing
WRONG_CUE = re.compile(r"(고쳐|고치|틀린|틀렸|어색|적절하지|아닌|관계\s*없|필요\s*없|쓰지\s*않|안\s*된다|되어야|바뀌어야|→)")
WRONG_WORDS = re.compile(r"(틀린|틀렸|어색|적절하지|아닌|관계\s*없|고쳐|고치)")
NEG_ASK = re.compile(r"(틀린|옳지\s*않은|아닌|적절하지\s*않은|어색한|관계\s*없는|바르게\s*고친)")


def letter_set(text):
    return frozenset(ch for ch in str(text or "") if ch in CIRCLED)


def items_of(doc):
    return doc.get("items") or doc.get("questions") or []


def implied_set(item):
    """(letters the note says are correct, how) or (None, reason)."""
    note = item.get("explainKo") or ""
    prompt = item.get("promptEn") or item.get("prompt") or ""
    used = letter_set(prompt)
    if not note:
        return None, "no note"
    named = set()
    for m in NAMED.finditer(note):
        # the sentence around the mention decides whether it is a wrong one
        start = max(0, m.start() - 80)
        window = note[start:m.end() + 120]
        if WRONG_CUE.search(window):
            named |= letter_set(m.group(1))
    if not named:
        return None, "note names no letters to fix"
    if NEG_ASK.search(prompt):
        want = frozenset(named)
    else:
        want = frozenset(used - named)
    return want, "note names " + ",".join(sorted(named))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true", help="list items the note cannot prove")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    broken, unproven, checked = [], [], 0
    for path in sorted(glob.glob(PATTERN)):
        doc = json.load(open(path, encoding="utf-8"))
        for item in items_of(doc):
            ch = item.get("choices") or []
            if not ch or not all(SET_ONLY.match(str(c).strip()) for c in ch):
                continue
            checked += 1
            rel = os.path.relpath(path, ROOT)
            name = "%s #%s" % (rel, item.get("id"))
            sets = [letter_set(c) for c in ch]
            used = letter_set(item.get("promptEn") or item.get("prompt") or "")
            key = item.get("correctIndexes") or []

            if len(set(sets)) != len(sets):
                broken.append((name, "two options are the same set of letters"))
            stray = set()
            for s in sets:
                stray |= (s - used)
            if stray and used:
                broken.append((name, "option uses letters the prompt never shows: " + "".join(sorted(stray))))
            if not key or not (1 <= key[0] <= len(ch)):
                broken.append((name, "key index %r points outside the options" % (key,)))
                continue

            want, why = implied_set(item)
            if want is None:
                unproven.append((name, why))
                continue
            if want not in sets:
                broken.append((name, "%s, so the right set is %s, and no option says that (options: %s)"
                               % (why, "".join(sorted(want)) or "(none)",
                                  " / ".join("".join(sorted(s)) for s in sets))))
            elif sets[key[0] - 1] != want:
                broken.append((name, "%s, so the answer is %s, but the key holds %s"
                               % (why, "".join(sorted(want)), "".join(sorted(sets[key[0] - 1])))))

    if args.json:
        print(json.dumps({"checked": checked, "broken": broken, "unproven": unproven},
                         ensure_ascii=False, indent=1))
    else:
        print("set-of-letters choice items checked: %d" % checked)
        for name, why in broken:
            print("FAIL %s: %s" % (name, why))
        if args.list:
            for name, why in unproven:
                print("unproven %s: %s" % (name, why))
        print("%d broken, %d unproven" % (len(broken), len(unproven)))
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
