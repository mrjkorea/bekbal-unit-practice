#!/usr/bin/env python3
"""An order card's own words must read in the order its own explanation gives.

Jay 2026-11-18: a student built 'But many of them were in trouble.' and was
marked wrong, because the stored order read 'but many of were in trouble them'.
The card's explanation printed the right sentence all along; nobody compared the
two.

This compares them: same words, different order = a failed card. It catches the
stored order only when the two use exactly the same words, so a partial card
(ordering one blank, not the whole sentence) is left alone.
"""
import collections
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOK = re.compile(r"[a-z']+")


def tokens(s):
    return TOK.findall(str(s).lower())


def explanation(exp):
    e = re.sub(r"^\s*(p\.\d+\s*)?(해설\s*:\s*)?(정답[^:]*:)?\s*", "", str(exp or "").strip())
    return re.split(r"\bp\.\d+|교재|답지", e)[0].strip()


def main():
    bad = []
    checked = 0
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "*", "*", "exercises", "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        for q in d.get("questions") or []:
            if q.get("type") != "order" or not q.get("orderIds"):
                continue
            checked += 1
            text = {c["id"]: str(c.get("text", "")) for c in q.get("orderChunks") or []}
            made = tokens(" ".join(text[i] for i in q["orderIds"] if i in text))
            said = [t for t in tokens(explanation(q.get("explainKo"))) if t in set(made)]
            if len(said) >= 3 and collections.Counter(said) == collections.Counter(made) and said != made:
                bad.append((os.path.relpath(f, ROOT), q.get("id"), q.get("label"),
                            " ".join(made), " ".join(said)))
    print("order cards checked: %d, whose own words contradict their explanation: %d"
          % (checked, len(bad)))
    for rel, qid, label, made, said in bad:
        print("- %s #%s\n    stored: %s\n    explanation: %s" % (rel, label, made, said))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
