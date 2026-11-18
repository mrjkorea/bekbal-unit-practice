#!/usr/bin/env python3
"""A practice card must state what the practice really holds.

Jay 2026-11-18: 258 catalog cards still carried the numbers from when their
cards were held ("3문항" over 13 questions, and "빠진 문항 24개 일부만" on a
practice that was complete). A student reads that number before starting.

This compares every catalog card with its exercise file and fails when they
disagree. Matching practices count pairs, not cards, because a student answers
pairs.
"""
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def counts(path):
    d = json.load(open(path, encoding="utf-8"))
    units = held = 0
    for q in d.get("questions") or []:
        if q.get("deferred"):
            held += 1
            continue
        units += len(q.get("pairs") or []) if q.get("type") == "match" else 1
    held += len(d.get("omitted") or [])
    return units, held


def main():
    bad = []
    checked = 0
    for cat in sorted(glob.glob(os.path.join(ROOT, "data", "*", "*", "catalog.json"))):
        d = json.load(open(cat, encoding="utf-8"))
        for sec in d.get("sections") or []:
            for e in sec.get("exercises") or []:
                path = os.path.join(ROOT, "data", d.get("book", ""), d.get("unit", ""),
                                    "exercises", str(e.get("id")) + ".json")
                if not os.path.exists(path):
                    continue
                checked += 1
                units, held = counts(path)
                if e.get("questionCount") != units:
                    bad.append((os.path.relpath(cat, ROOT), e.get("id"),
                                "says %s, holds %d" % (e.get("questionCount"), units)))
                elif e.get("omittedCount") != held:
                    bad.append((os.path.relpath(cat, ROOT), e.get("id"),
                                "says %s missing, holds %d" % (e.get("omittedCount"), held)))
    print("catalog cards checked: %d, wrong: %d" % (checked, len(bad)))
    for rel, eid, why in bad:
        print("- %s %s: %s" % (rel, eid, why))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
