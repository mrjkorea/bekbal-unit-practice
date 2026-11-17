#!/usr/bin/env python3
"""Jay 2026-11-17: order questions were too easy because the word chips were
printed in a clickable order (left to right = the answer, or right to left =
the answer). This rewrites the chip order of every order question so the answer
cannot be built by clicking one end to the other.

It is deterministic: the new order is seeded from the practice path, the card id
and the answer words, so a rerun never reshuffles a card that is already fine
and never changes a card twice.

Usage:
  python3 scripts/shuffle-order-banks.py            # report only
  python3 scripts/shuffle-order-banks.py --write    # rewrite the data files
"""
import glob
import hashlib
import json
import os
import random
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERN = os.path.join(ROOT, "data", "**", "exercises", "*.json")

# one_way() returns 0.0 when the chips sit in answer order and 1.0 when they
# sit in reverse answer order. A card is only safe between these two bounds;
# the validator uses the wider 0.80/0.20 so the data keeps some margin.
LOW, HIGH = 0.30, 0.70


def chip_positions(q):
    """Bank index of each chip the answer asks for, in answer order."""
    chunks = q.get("orderChunks") or []
    ids = q.get("orderIds") or []
    pos = {c["id"]: i for i, c in enumerate(chunks)}
    return [pos[i] for i in ids if i in pos]


def one_way(seq):
    """Share of steps that go forward (0.0) ... backward (1.0)."""
    if len(seq) < 2:
        return 0.5
    up = sum(1 for a, b in zip(seq, seq[1:]) if b > a)
    return 1.0 - up / (len(seq) - 1)


def readable(bank_texts):
    """True when the chips are sorted, which also gives the answer away."""
    low = [t.lower() for t in bank_texts]
    if low == sorted(low):
        return True
    if len(low) == len(sorted(low, key=len)) and low == sorted(low, key=len) and len(set(map(len, low))) > 1:
        return True
    return False


def safe(seq):
    one = one_way(seq)
    return LOW < one < HIGH


def ok(bank, answer_ids):
    pos = {c["id"]: i for i, c in enumerate(bank)}
    seq = [pos[i] for i in answer_ids if i in pos]
    if len(seq) < 3:
        return True
    if readable([c["text"] for c in bank]):
        return False
    return safe(seq)


def shuffle(q, seed_text):
    bank = list(q["orderChunks"])
    ids = list(q.get("orderIds") or [])
    pos = {c["id"]: i for i, c in enumerate(bank)}
    seq = [pos[i] for i in ids if i in pos]
    if len(seq) < 3:
        return None
    if safe(seq) and not readable([c["text"] for c in bank]):
        return None
    for attempt in range(500):
        rng = random.Random("%s|%d" % (seed_text, attempt))
        trial = list(bank)
        rng.shuffle(trial)
        if ok(trial, ids):
            return trial
    raise SystemExit("could not shuffle %s" % seed_text)


def main():
    write = "--write" in sys.argv
    fixed = {"cards": 0, "files": 0, "reversed": 0, "answer_order": 0, "sorted": 0}
    for path in sorted(glob.glob(PATTERN, recursive=True)):
        raw = open(path, encoding="utf-8").read()
        data = json.loads(raw)
        indent = None
        for ind in (2, 1, 4):
            out = json.dumps(data, ensure_ascii=False, indent=ind)
            if out == raw or out + "\n" == raw:
                indent = ind
                break
        if indent is None:
            raise SystemExit("formatting will not round-trip: %s" % path)
        changed = False
        for q in data.get("questions") or []:
            chunks = q.get("orderChunks") or []
            ids = q.get("orderIds") or []
            if len(chunks) < 3 or len(ids) < 3:
                continue
            seq = chip_positions(q)
            if len(seq) < 3:
                continue
            one = one_way(seq)
            if safe(seq) and not readable([c["text"] for c in chunks]):
                continue
            if one > 0.5:
                fixed["reversed"] += 1
            elif readable([c["text"] for c in chunks]):
                fixed["sorted"] += 1
            else:
                fixed["answer_order"] += 1
            seed = "%s|%s|%s" % (
                os.path.relpath(path, ROOT).replace(os.sep, "/"),
                q.get("id"),
                " ".join(c["text"] for c in chunks),
            )
            answer_ids = [i for i in ids if any(c["id"] == i for c in chunks)]
            trial = shuffle(q, seed)
            if trial is None:
                continue
            if [c["id"] for c in trial] != [c["id"] for c in chunks]:
                q["orderChunks"] = trial
                changed = True
                fixed["cards"] += 1
        if not changed:
            continue
        fixed["files"] += 1
        if write:
            out = json.dumps(data, ensure_ascii=False, indent=indent)
            open(path, "w", encoding="utf-8").write(out + ("\n" if raw.endswith("\n") else ""))
    print("cards to reshuffle: %(cards)d in %(files)d files "
          "(reversed %(reversed)d, answer order %(answer_order)d, sorted %(sorted)d)" % fixed)
    if not write:
        print("report only; add --write to apply")
    return 0


if __name__ == "__main__":
    sys.exit(main())
