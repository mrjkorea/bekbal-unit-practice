#!/usr/bin/env python3
"""Jay 2026-11-17: the number a student sees must be the number printed in the
book, so the student can open the book and find that exact item.

Rule, the same in every book, every unit, every question:
  * the book's own item number, written the way the book writes it (01, 02 ...);
  * the book's section letter in front when the page groups items under a
    letter (A, B, C ...), so a number that the page uses three times becomes
    A-01, B-01, C-01;
  * the book's point mark (①, ②) in front when one practice covers two points
    that both restart at A-01;
  * the book's own part marker ((A), (1), -1 ...) when one printed item was
    split into several cards.

Only the `label` field is written. No question text, key, answer, page or
option is touched.

Usage:
  python3 scripts/book-labels.py             # report
  python3 scripts/book-labels.py --write     # rewrite labels
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATTERN = os.path.join(ROOT, "data", "**", "exercises", "*.json")
POINTS = "①②③④⑤⑥"


def section_letter(title):
    m = re.match(r"\s*Section\s+([A-H])\b", title or "")
    return m.group(1) if m else None


def printed_number(label):
    m = re.match(r"\s*(\d{1,3})", str(label or ""))
    return int(m.group(1)) if m else None


def label_tail(label):
    """Everything after the leading number: '(A)', '-1', '-틀린 말', '–5'."""
    m = re.match(r"\s*\d{1,3}(.*)$", str(label or ""))
    return (m.group(1) or "").strip() if m else ""


def parse_label(label):
    """(first, last) printed numbers of a label, 'A-01–05' style ranges kept."""
    text = str(label or "")
    m = re.match(r"\s*(\d{1,3})\s*[–~-]\s*(\d{1,3})\s*$", text)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.match(r"\s*(\d{1,3})", text)
    if m:
        return int(m.group(1)), None
    return None, None


def part_labels(questions, sections):
    """One printed item split into several cards: the book prints the blanks as
    (1), (2) ... inside that item, so the card carries the same item number and
    the blank marker from its own id (12-3 -> the third blank of item 12)."""
    out = {}
    for key, idxs in sections:
        groups = {}
        for i in idxs:
            groups.setdefault(parse_label(questions[i].get("label"))[0], []).append(i)
        for num, group in groups.items():
            if num is None or len(group) < 2:
                continue
            for pos, i in enumerate(group):
                m = re.search(r"-(\d+)$", str(questions[i].get("id") or ""))
                blank = int(m.group(1)) if m else pos + 1
                out[i] = "%02d (%d)" % (num, blank)
    return out


def plan_practice(questions):
    """Return {question index: new label} for one practice."""
    sections = []
    for i, q in enumerate(questions):
        key = q.get("section")
        if not sections or sections[-1][0] != key:
            sections.append([key, []])
        sections[-1][1].append(i)
    letters = []
    for key, idxs in sections:
        title = questions[idxs[0]].get("sectionTitle") or ""
        letters.append(section_letter(title))
    if any(l is None for l in letters):
        return part_labels(questions, sections)
    # a letter that comes back means the page started a second point
    seen, point_of, cycle = {}, {}, None
    for pos, letter in enumerate(letters):
        if letter in seen:
            cycle = True
            seen[letter] += 1
        else:
            seen[letter] = 0
        point_of[pos] = seen[letter]
    two_points = bool(cycle) if len(letters) > 1 else False

    numbers = [parse_label(q.get("label"))[0] for q in questions]
    seen_in = {}
    cross = False
    for q_i, q in enumerate(questions):
        n = numbers[q_i]
        if n is None:
            continue
        where = seen_in.setdefault(n, q.get("section"))
        if where != q.get("section"):
            cross = True
    if not cross:
        return part_labels(questions, sections)

    out = {}
    for pos, (key, idxs) in enumerate(sections):
        letter = letters[pos]
        point = POINTS[point_of[pos]] if two_points else ""
        # number the cards the way the page numbers them: 01, 02 ... in order
        nums = [printed_number(questions[i].get("label")) for i in idxs]
        by_number = {}
        for i in idxs:
            by_number.setdefault(printed_number(questions[i].get("label")), []).append(i)
        # keep the file's own numbers when they already run 1..n in the section,
        # otherwise number by the position the cards sit in, which is book order
        firsts = [numbers[i] for i in idxs]
        reused = all(f is not None for f in firsts) and sorted(firsts) == list(range(1, len(idxs) + 1))
        for pos_in_sec, i in enumerate(idxs):
            first, last = parse_label(questions[i].get("label"))
            n = first if (reused or last is not None) else pos_in_sec + 1
            if n is None:
                continue
            tail = ""
            if last is not None:
                tail = "–%02d" % last
            else:
                same = by_number.get(first, [])
                raw_tail = label_tail(questions[i].get("label"))
                if raw_tail and not raw_tail.startswith("-"):
                    tail = raw_tail
                elif len(same) > 1:
                    tail = "-%d" % (same.index(i) + 1)
            out[i] = "%s%s-%02d%s" % (point, letter, n, tail)
    return out


def main():
    write = "--write" in sys.argv
    changed_cards = changed_practices = 0
    sample = []
    only = [a for a in sys.argv[1:] if not a.startswith("--")]
    files = sorted(glob.glob(PATTERN, recursive=True))
    if only:
        files = [f for f in files if any(o in f.replace(os.sep, "/") for o in only)]
    locked = []
    for path in files:
        raw = open(path, encoding="utf-8").read()
        data = json.loads(raw)
        # a practice whose labels were read off the page by hand and cannot be
        # derived from the file (two card groups share one printed letter, one
        # printed item gives two answers) says so and is left alone.
        if data.get("labelsLocked"):
            locked.append((os.path.relpath(path, ROOT), data.get("labelsLocked")))
            continue
        plan = plan_practice(data.get("questions") or [])
        if not plan:
            continue
        touched = 0
        for i, q in enumerate(data.get("questions") or []):
            if i not in plan:
                continue
            if str(q.get("label")) != plan[i]:
                q["label"] = plan[i]
                touched += 1
        if not touched:
            continue
        changed_cards += touched
        changed_practices += 1
        rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
        labels = [q.get("label") for q in data["questions"]]
        dup = len(labels) - len(set(labels))
        sample.append((rel, touched, dup, labels[:6], labels[-3:]))
        if not write:
            continue
        indent = None
        for ind in (2, 1, 4):
            out = json.dumps(json.loads(raw), ensure_ascii=False, indent=ind)
            if out == raw or out + "\n" == raw:
                indent = ind
                break
        out = json.dumps(data, ensure_ascii=False, indent=indent)
        open(path, "w", encoding="utf-8").write(out + ("\n" if raw.endswith("\n") else ""))
    print("labels changed: %d cards in %d practices" % (changed_cards, changed_practices))
    if locked:
        print("locked (labels read off the page, left as they are): %d practices" % len(locked))
        for rel, why in locked:
            print("  %-58s %s" % (rel, why))
    for rel, n, dup, head, tail in sample:
        print("  %-58s %3d cards | dup left %d | %s ... %s" % (rel, n, dup, head, tail))
    if not write:
        print("report only; add --write to apply")
    return 0


if __name__ == "__main__":
    sys.exit(main())
