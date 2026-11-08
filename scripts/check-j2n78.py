#!/usr/bin/env python3
"""Data check for the j2-neung Lesson 07 / Lesson 08 build.

Usage:
    python3 scripts/check-j2n78.py            # both units
    python3 scripts/check-j2n78.py u07        # one unit

Read-only. Exit code 1 when any exercise fails.
"""
from __future__ import annotations

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TYPES = {"mc", "fill", "sentence", "order", "match", "bank", "ox", "parts"}
FAIL = []


def fail(msg):
    FAIL.append(msg)


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def check_question(ex, q, where):
    qid = q.get("id", "?")
    tag = f"{where} [{ex} q{qid}]"
    t = q.get("type")
    if t not in TYPES:
        fail(f"{tag} bad type {t!r}")
        return
    if not (q.get("promptEn") or q.get("promptKo")):
        fail(f"{tag} empty prompt")
    if q.get("deferred"):
        return
    if t == "mc":
        ch = q.get("choices") or []
        if len(ch) < 2:
            fail(f"{tag} mc needs 2+ choices")
        if len(set(ch)) != len(ch):
            fail(f"{tag} duplicate choice text")
        ci = q.get("correctIndexes") or []
        if not ci:
            fail(f"{tag} mc needs correctIndexes")
        for i in ci:
            if not isinstance(i, int) or not (1 <= i <= len(ch)):
                fail(f"{tag} correctIndexes {ci} out of range 1..{len(ch)}")
    elif t in ("fill", "sentence"):
        acc = q.get("accept") or []
        if not acc or not any(str(a).strip() for a in acc):
            fail(f"{tag} {t} needs accept[]")
        if t == "fill" and "accept" not in q:
            fail(f"{tag} fill missing accept")
    elif t == "order":
        chunks = q.get("orderChunks") or []
        ids = [c.get("id") for c in chunks]
        oid = q.get("orderIds") or []
        if len(chunks) < 2:
            fail(f"{tag} order needs 2+ chunks")
        if sorted(ids) != sorted(oid):
            fail(f"{tag} orderIds != chunk ids")
    elif t == "match":
        pairs = q.get("pairs") or []
        if len(pairs) < 2:
            fail(f"{tag} match needs 2+ pairs")
        for p in pairs:
            if not p.get("en") or not p.get("ko"):
                fail(f"{tag} match pair missing en/ko: {p}")
    elif t == "bank":
        ch = q.get("choices") or []
        if len(ch) < 2:
            fail(f"{tag} bank needs 2+ choices")
        ci = q.get("correctIndexes") or []
        if len(ci) != 1 or not (1 <= ci[0] <= len(ch)):
            fail(f"{tag} bank needs one correctIndexes in range")
        if not q.get("focusBlank"):
            fail(f"{tag} bank needs focusBlank")
    elif t == "ox":
        if q.get("oxMark") not in ("O", "X"):
            fail(f"{tag} ox needs oxMark O/X")
        if q.get("oxMark") == "X" and not (q.get("rewriteAccept") or []):
            fail(f"{tag} ox X needs rewriteAccept")
    elif t == "parts":
        parts = q.get("parts") or []
        if not parts:
            fail(f"{tag} parts needs parts[]")
        for p in parts:
            if p.get("kind") == "mc":
                ch = p.get("choices") or []
                ci = p.get("correctIndexes") or []
                if not ch or not ci or any(not (0 <= i < len(ch)) for i in ci):
                    fail(f"{tag} parts mc invalid")


def check_exercise(path, uid, unit):
    name = os.path.basename(path)[:-5]
    ex = load(path)
    for key in ("id", "title", "book", "unit", "sourcePages", "questionCount",
                "omitted", "questions", "sections"):
        if key not in ex:
            fail(f"{unit}/{name} missing top-level key {key}")
            return
    if ex["id"] != name:
        fail(f"{unit}/{name} id {ex['id']} != file name")
    if ex["book"] != "j2-neung":
        fail(f"{unit}/{name} book must be j2-neung")
    if ex["unit"] != unit:
        fail(f"{unit}/{name} unit must be {unit}")
    qs = ex["questions"]
    if ex["questionCount"] != len(qs):
        fail(f"{unit}/{name} questionCount {ex['questionCount']} != {len(qs)} questions")
    if not qs:
        fail(f"{unit}/{name} no questions")
    for o in ex["omitted"]:
        if not o.get("page") or not o.get("reason"):
            fail(f"{unit}/{name} omitted entry needs page + reason: {o}")
    seen = set()
    for q in qs:
        if q.get("id") in seen:
            fail(f"{unit}/{name} duplicate question id {q.get('id')}")
        seen.add(q.get("id"))
        check_question(name, q, unit)
    if not ex.get("sections"):
        fail(f"{unit}/{name} no sections[]")
    else:
        ids = {s.get("id") for s in ex["sections"]}
        for q in qs:
            if q.get("section") and q["section"] not in ids:
                fail(f"{unit}/{name} q{q.get('id')} section {q['section']} not in sections[]")
    print(f"  {unit}/{name}: {len(qs)} cards, {len(ex['omitted'])} omitted")


def main():
    units = sys.argv[1:] or ["u07", "u08"]
    for unit in units:
        base = os.path.join(ROOT, "data", "j2-neung", unit, "exercises")
        if not os.path.isdir(base):
            print(f"{unit}: no exercises folder")
            continue
        print(unit)
        for name in sorted(os.listdir(base)):
            if name.endswith(".json"):
                check_exercise(os.path.join(base, name), unit, unit)
    if FAIL:
        print(f"\nFAIL {len(FAIL)}")
        for f in FAIL:
            print(" -", f)
        return 1
    print("\nOK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
