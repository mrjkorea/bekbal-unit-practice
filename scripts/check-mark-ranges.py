#!/usr/bin/env python3
"""A question may not point at a mark the passage does not print.

Jay 2026-11-24: two cards asked "밑줄 친 ⓐ~ⓔ 중 …" over a passage that carried
only four of the five marks, because a ⓑ had been lost when the text was typed
off the page. A student counting the marks finds four and cannot answer at all;
the stored key still "worked", so nothing else noticed.

For every item whose text names a RANGE of circled marks (ⓐ~ⓔ, ⓒ-ⓕ), each mark
in that range must appear in the item's own text. The range token itself does
not count.

  python3 scripts/check-mark-ranges.py
Exit 1 means a card points at a mark it never prints.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERN = os.path.join(ROOT, "data", "*", "*", "exercises", "*.json")
CIRCLED = "ⓐⓑⓒⓓⓔⓕⓖⓗ"
RANGE = re.compile(r"([ⓐ-ⓗ])\s*[~〜\-–]\s*([ⓐ-ⓗ])")


def items_of(doc):
    return doc.get("items") or doc.get("questions") or []


def main():
    broken = []
    unproven = []
    checked = 0
    for path in sorted(glob.glob(PATTERN)):
        doc = json.load(open(path, encoding="utf-8"))
        for item in items_of(doc):
            text = "\n".join(str(item.get(k) or "") for k in
                             ("promptEn", "prompt", "sectionInstructionKo",
                              "directionKo", "ruleKo", "sectionTitle"))
            body = re.sub(RANGE, " ", text)   # the range mention is not a mark
            for m in RANGE.finditer(text):
                lo, hi = CIRCLED.index(m.group(1)), CIRCLED.index(m.group(2))
                if lo > hi:
                    lo, hi = hi, lo
                checked += 1
                want = [CIRCLED[i] for i in range(lo, hi + 1)]
                missing = [c for c in want if c not in body]
                if not missing:
                    continue
                if len(missing) == len(want):
                    # no mark of this range is here at all: the passage is
                    # probably shown on another card, so this cannot judge it
                    unproven.append("%s #%s (%s%s%s)"
                                    % (os.path.relpath(path, ROOT), item.get("id"),
                                       m.group(1), "~", m.group(2)))
                    continue
                broken.append(("%s #%s" % (os.path.relpath(path, ROOT), item.get("id")),
                               "asks about %s%s%s, prints %s, and never prints %s"
                               % (m.group(1), "~", m.group(2),
                                  " ".join(c for c in want if c not in missing),
                                  " ".join(missing))))
    print("mark ranges checked: %d" % checked)
    for name, why in broken:
        print("FAIL %s: %s" % (name, why))
    print("%d broken, %d unproven (range with no mark on this card)" % (len(broken), len(unproven)))
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())
