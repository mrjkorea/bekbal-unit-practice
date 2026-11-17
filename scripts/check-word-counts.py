#!/usr/bin/env python3
"""A word-count condition must be satisfiable.

When a prompt says 총 N단어, a student can follow that rule only if some stored
answer has exactly N words. This catches the class of defect Jay hit on
2026-11-17: a condition of 8 words whose only accepted answer is 9 words, so a
correct 8-word sentence was marked wrong.

A prompt that gives one count per blank (예: (1)은 8단어, (2)는 9단어) only needs
one of those counts to land, because each card answers one blank.

Exit 1 and list every failing card; exit 0 when every condition can be met.
"""
import glob
import json
import re
import sys


def words(s):
    return [w for w in re.split(r"\s+", str(s).strip()) if w]


def count(s):
    # A trailing full stop or question mark is not a word.
    return len([w for w in words(s) if re.search(r"[0-9A-Za-z가-힣]", w)])


def main():
    bad = []
    checked = 0
    for f in sorted(glob.glob("data/*/u*/exercises/*.json")):
        try:
            d = json.load(open(f, encoding="utf-8"))
        except Exception as e:
            bad.append((f, "(file)", 0, [], str(e)))
            continue
        for q in d.get("questions") or []:
            prompt = q.get("promptEn") or ""
            need = [int(n) for n in re.findall(r"총\s*(\d+)\s*단어", prompt)]
            if not need:
                continue
            checked += 1
            accept = [a for a in (q.get("accept") or []) if isinstance(a, str)]
            if not accept:
                continue  # a choice card carries its count in the options
            got = [count(a) for a in accept]
            if not any(n in got for n in need):
                bad.append((f, q.get("id"), need, got, accept[0][:70]))
    print(f"word-count conditions checked: {checked}, failing: {len(bad)}")
    for f, qid, need, got, first in bad:
        print(f"FAIL {f} item {qid}: needs {need} words, accepted answers have {got} :: {first}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
