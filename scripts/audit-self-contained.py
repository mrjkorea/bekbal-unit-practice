#!/usr/bin/env python3
"""Definitive self-contained audit for Mr. Jay's middle-school packs.

An item fails when a student at the screen cannot answer it, because the paper
markup or the text itself never made it into the JSON.

T1 stub        prompt is a "(답지)" placeholder, or only a title + ①–⑤ buttons
T2 underline   the item cites 밑줄 친 / underlined text but the card marks nothing
T3 position    choices are bare ①②③④⑤ and one of those numbers is not in the passage
T4 key         correctIndexes is not a 1-based index inside choices (or accept is empty)
T5 passage     the item cites 윗글 / 다음 글 but no passage body is on the card
T6 picture     the instruction says 그림 with no rendered image and no "그림:" scene line

Usage: python3 audit_packs.py <repo> [<repo> ...] [--md out.md] [--json out.json]
Read-only. Writes nothing into the repos.
"""
from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter, defaultdict

CIRC = "①②③④⑤⑥⑦⑧⑨⑩"
LET = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙ"
BARE_CIRC = re.compile(rf"^[{CIRC}]$")
# A mark a student can actually see: a letter tag, an underline tag, an (A) blank, or _word_.
MARKED = re.compile("[" + LET + r"]|<u>|\(A\)|\(a\)|\(밑줄|_[A-Za-z가-힣][^_]{0,40}_")
WORD = re.compile(r"[A-Za-z가-힣']+")
PIC = re.compile(r"그림|\bpicture\b|look at the (?:picture|drawing|figure)", re.I)
SCENE = re.compile(r"그림\s*[:：]|\[그림\s*[:：]|(?:Picture|Scene|Figure)\s*[:：]|\bshows\b", re.I)
STUB = re.compile(r"답지")


def load_rows(root):
    rows = []
    ddir = os.path.join(root, "data")
    for book in sorted(os.listdir(ddir)):
        bdir = os.path.join(ddir, book)
        if not os.path.isdir(bdir):
            continue
        for unit in sorted(os.listdir(bdir)):
            edir = os.path.join(bdir, unit, "exercises")
            if not os.path.isdir(edir):
                continue
            for name in sorted(os.listdir(edir)):
                if not name.endswith(".json"):
                    continue
                path = os.path.join(edir, name)
                doc = json.load(open(path, encoding="utf-8"))
                for q in doc.get("questions") or []:
                    rows.append(dict(doc=doc, q=q, unit=unit, path=os.path.relpath(path, root), root=root))
    return rows


def check(row):
    doc, q = row["doc"], row["q"]
    prompt = str(q.get("promptEn") or "")
    choices = [str(c).strip() for c in (q.get("choices") or [])]
    instr = "\n".join(str(q.get(k) or "") for k in ("sectionInstructionKo", "directionKo", "ruleKo"))
    lines = [l for l in prompt.split("\n") if l.strip()]
    head = lines[0] if lines else ""
    body = "\n".join(lines[1:])
    typ = q.get("type")
    fails = []

    # T1 stub shell: no stem text at all on the card
    real_choices = [c for c in choices if WORD.search(c)]
    letters = re.sub(r"[^A-Za-z가-힣]", "", prompt)
    has_container = bool(q.get("pairs") or q.get("orderChunks") or q.get("parts"))
    ko_hint = bool(re.search(r"[가-힣]", str(q.get("promptKo") or "")))
    stub = bool((STUB.search(prompt) or not WORD.findall(prompt)) and not ko_hint)
    if not has_container and stub:
        fails.append(("T1", "no stem on the card: only a title, blank numbers or number buttons"))

    # T7 options shown with no sentence to apply them to
    if (
        not has_container
        and typ in ("mc", "fill", "bank")
        and re.search(r"\[[^\]]*/[^\]]*\]", prompt)
        and len(WORD.findall(prompt)) < 8
    ):
        fails.append(("T7", "shows the two options in brackets but not the sentence they belong to"))

    # T5 passage cited but absent
    if re.search(r"윗글|위 글|본문|다음 글|앞의 글", head) and not body.strip():
        fails.append(("T5", "cites 윗글 but the passage is not on the card"))

    # T2 underline cited, nothing marked.
    # Paper "밑줄 친" markup is only a gap when the student must know which word is
    # underlined. An ox card judges the whole sentence, and a "(밑줄: …)" note names it,
    # so both are fine.
    cites_underline = bool(re.search(r"밑줄|underlined", instr + "\n" + head))
    marked = bool(
        MARKED.search(prompt)
        or any(c in head + body for c in CIRC)
    )
    if cites_underline and not marked and typ != "ox":
        fails.append(("T2", "asks about an underlined word, but the card marks no word"))

    # T3 bare position choices with a position missing from the passage
    if choices and all(BARE_CIRC.match(c) for c in choices):
        missing = [c for c in choices if c not in body]
        if missing:
            fails.append(("T3", "position " + "".join(missing) + " is in the choices but not in the passage"))

    # T4 ungradeable key
    if typ in ("mc", "bank"):
        exp = q.get("correctIndexes") or []
        bad = [i for i in exp if not isinstance(i, int) or isinstance(i, bool) or i < 1 or i > len(choices)]
        if not exp or bad:
            fails.append(("T4", f"answer key {exp} is not a number inside the choices"))
    if typ in ("fill", "sentence") and not [a for a in (q.get("accept") or []) if str(a).strip()]:
        fails.append(("T4", "no accepted answer"))

    # T6 picture without a scene line
    if PIC.search(instr) and not SCENE.search(prompt) and not q.get("image"):
        fails.append(("T6", "tells the student to look at a picture, no scene line on the card"))

    return fails


def main():
    args = [a for a in sys.argv[1:]]
    md_out = json_out = None
    if "--md" in args:
        i = args.index("--md")
        md_out = args[i + 1]
        del args[i : i + 2]
    if "--json" in args:
        i = args.index("--json")
        json_out = args[i + 1]
        del args[i : i + 2]
    report = []
    held = 0
    for root in args:
        for row in load_rows(root):
            if row["q"].get("deferred"):
                held += 1
                continue
            fails = check(row)
            if not fails:
                continue
            q, doc = row["q"], row["doc"]
            report.append(
                dict(
                    book=doc.get("book") or os.path.basename(root),
                    unit=doc.get("unit") or row["unit"],
                    exercise=doc.get("id"),
                    exerciseTitle=doc.get("title"),
                    pages=doc.get("sourcePages"),
                    item=str(q.get("id")),
                    label=str(q.get("label")),
                    type=q.get("type"),
                    codes=[f[0] for f in fails],
                    why="; ".join(f[1] for f in fails),
                    because="because" in json.dumps(q, ensure_ascii=False).lower(),
                    path=row["path"],
                    prompt=(q.get("promptEn") or "")[:180].replace("\n", " | "),
                )
            )
    print("held items (deferred):", held)
    print("failing items:", len(report))
    print("by code:", Counter(c for r in report for c in r["codes"]).most_common())
    print("by book/unit:")
    for k, v in sorted(Counter((r["book"], r["unit"]) for r in report).items()):
        print(f"  {k[0]} / {k[1]}: {v}")
    print("because items failing:", sum(1 for r in report if r["because"]))
    if json_out:
        json.dump(report, open(json_out, "w"), ensure_ascii=False, indent=1)
        print("wrote", json_out)
    if md_out:
        with open(md_out, "w", encoding="utf-8") as fh:
            fh.write("| book | unit | exercise | pages | item | label | type | code | what is missing | because |\n")
            fh.write("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n")
            for r in report:
                fh.write(
                    f"| {r['book']} | {r['unit']} | {r['exercise']} | {r['pages'] or ''} | {r['item']} | {r['label']} | "
                    f"{r['type']} | {','.join(r['codes'])} | {r['why']} | {'yes' if r['because'] else ''} |\n"
                )
        print("wrote", md_out)


if __name__ == "__main__":
    main()
