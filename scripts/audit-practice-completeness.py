#!/usr/bin/env python3
"""Audit every practice against its own book: is it complete, and does it match the page?

Jay 2026-11-16: a unit page offered "Grammar 실전 문제 7문항 · 보류 8" with 8 of the book's
14 questions missing, and "Dialog 실전 문제 4문항" whose cards no longer matched pp.138-139.
A practice that is shorter than its book page, or built from a different page, is not the
book's exercise, so it must never be shown as if it were.

Checks, per exercise file:
  1. EMPTY    — no questions at all (a student would score 0/0).
  2. PARTIAL  — items listed in omitted[] are missing from the practice (shown < expected).
  3. COUNT    — the catalog's questionCount disagrees with the file.
  4. PROVENANCE (only when a book text is given) — a card's own English or Korean prompt is
     not found on the printed pages the exercise claims. That catches an item lifted from
     another section, or invented from the answer key.

  python3 scripts/audit-practice-completeness.py
  python3 scripts/audit-practice-completeness.py --text j1-visang=/tmp/visang.txt --md out.md
  python3 scripts/audit-practice-completeness.py --fail-on partial   # for CI

Exit 1 when a selected severity is found.
"""
import argparse
import glob
import json
import os
import re
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")


def norm(s):
    s = unicodedata.normalize("NFKC", str(s or ""))
    s = s.replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')
    s = re.sub(r"[^0-9A-Za-z]+", "", s)
    return s.lower()


def book_key(f):
    parts = f.replace(os.sep, "/").split("/data/")[-1].split("/")
    return parts[0] + "/" + parts[1]


def load_catalog(book, unit):
    p = os.path.join(DATA, book, unit, "catalog.json")
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return None


def prompts(q):
    """The English a card lifts from the printed page.

    Korean instructions are ours, not the book's, so they are not compared; a card is only
    checked when it carries a run of English long enough to be a printed passage.
    """
    out = []
    for k in ("promptEn",):
        if q.get(k):
            out.append(q[k])
    for p in q.get("parts") or []:
        if isinstance(p, dict) and p.get("label"):
            out.append(p["label"])
    for c in q.get("orderChunks") or []:
        if isinstance(c, dict) and c.get("text"):
            out.append(c["text"])
    for c in q.get("choices") or []:
        if isinstance(c, str) and len(c) > 12:
            out.append(c)
    for p in q.get("pairs") or []:
        if isinstance(p, dict) and p.get("en") and len(p["en"]) > 8:
            out.append(p["en"])
    return out


def page_text(text, exercise):
    """Text of the printed pages the exercise claims, from a whole-book OCR dump.

    A dump line that carries a printed page number in the footer ("138  1학년 비상_황종배")
    closes that page, so the body above it is that printed page.
    """
    src = str(exercise.get("sourcePages") or "")
    m = re.findall(r"(\d{2,3})", src)
    if not m:
        return None
    want = {int(x) for x in m}
    if len(m) >= 2:
        a, b = int(m[0]), int(m[1])
        if 0 < a <= b and b - a < 12:
            want |= set(range(a, b + 1))
    pages = text.split("\f")
    keep = []
    for p in pages:
        lines = [l for l in p.split("\n") if l.strip()]
        if not lines:
            continue
        footers = set()
        for l in lines[-2:]:
            for n in re.findall(r"(?<!\d)(\d{2,3})(?!\d)", l):
                footers.add(int(n))
        if footers & want:
            keep.append(p)
    return "\n".join(keep) if keep else None


def check(ex, cat_ex, texts):
    qs_all = ex.get("questions") or []
    # A card marked deferred is drawn by nobody: play.html filters it out and shows a
    # "held for a book check" banner. It is therefore not a question a student can
    # answer, and counting it as shown was the same quiet shortage Jay flagged.
    deferred = [q for q in qs_all if q.get("deferred")]
    qs = [q for q in qs_all if not q.get("deferred")]
    omitted = [o for o in (ex.get("omitted") or []) if isinstance(o, dict)]
    shown, held = len(qs), len(omitted) + len(deferred)
    issues = []
    if deferred:
        issues.append(("DEFERRED", f"{len(deferred)} card(s) held for a book check, so a student gets {shown}"))
    if shown == 0:
        issues.append(("EMPTY", f"0 questions, {held} held"))
    elif held:
        detail = f"{shown} shown, {held} held"
        if deferred:
            detail += f" ({len(deferred)} of them marked deferred)"
        issues.append(("PARTIAL", detail + f", book page has {shown + held}"))
    if cat_ex is not None and not any(q.get("type") == "match" for q in qs):
        want = cat_ex.get("questionCount")
        if isinstance(want, int) and want != shown:
            issues.append(("COUNT", f"catalog card says {want} questions, a student is drawn {shown}"))
        if isinstance(cat_ex.get("omittedCount"), int) and cat_ex["omittedCount"] != held:
            issues.append(("COUNT", f"catalog holds {cat_ex['omittedCount']}, a student is not drawn {held}"))
    text = texts.get(book_key_of(ex))
    if text is not None and qs:
        page = page_text(text, ex)
        if page is None:
            issues.append(("PROVENANCE", "no printed page found for " + str(ex.get("sourcePages"))))
        else:
            body = norm(page)
            for q in qs:
                cands = [c for c in prompts(q) if len(norm(c)) >= 25]
                if not cands:
                    continue
                hit = False
                for c in cands:
                    n = norm(c)
                    for size in (48, 36, 28, 25):
                        if len(n) >= size and n[:size] in body:
                            hit = True
                            break
                    if hit:
                        break
                if not hit:
                    issues.append(("PROVENANCE", f"card {q.get('label')} text not on its page"))
    return shown, held, issues


def book_key_of(ex):
    """The --text key is the book slug: j1-visang/u07 -> j1-visang."""
    return str(ex.get("_bk", "")).split("/")[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", action="append", default=[], help="book=file OCR dump, repeatable")
    ap.add_argument("--md", help="write a markdown report here")
    ap.add_argument("--provenance", action="store_true",
                    help="also screen card text against the printed page (noisy on OCR, off by default)")
    ap.add_argument("--count", action="store_true",
                    help="also compare the catalog's questionCount with the file (pairs and split cards differ)")
    ap.add_argument("--fail-on", default="empty", choices=["none", "empty", "partial"])
    args = ap.parse_args()

    texts = {}
    for spec in args.text:
        k, v = spec.split("=", 1)
        texts[k] = open(v, encoding="utf-8", errors="ignore").read()

    rows = []
    for cat_path in sorted(glob.glob(os.path.join(DATA, "*", "u*", "catalog.json"))):
        book = cat_path.split(os.sep)[-3]
        unit = cat_path.split(os.sep)[-2]
        cat = json.load(open(cat_path, encoding="utf-8"))
        seen = set()
        for sec in cat.get("sections") or []:
            for ce in sec.get("exercises") or []:
                eid = ce.get("id")
                href = str(ce.get("href") or "")
                if (not eid or eid in seen or ce.get("external")
                        or eid.startswith("wm-") or href.startswith("reading.html")):
                    continue
                seen.add(eid)
                f = os.path.join(DATA, book, unit, "exercises", eid + ".json")
                if not os.path.exists(f):
                    rows.append({"book": book, "unit": unit, "id": eid, "shown": 0, "held": 0,
                                 "group": sec.get("group", "book"),
                                 "issues": [("MISSING", "catalog lists a file that does not exist")]})
                    continue
                ex = json.load(open(f, encoding="utf-8"))
                ex["_bk"] = book + "/" + unit
                shown, held, issues = check(ex, ce, texts if args.provenance else {})
                if not args.count:
                    issues = [i for i in issues if i[0] != "COUNT"]
                rows.append({"book": book, "unit": unit, "id": eid, "title": ce.get("title"),
                             "shown": shown, "held": held, "group": sec.get("group", "book"),
                             "issues": issues})

    order = {"EMPTY": 0, "MISSING": 1, "PARTIAL": 2, "DEFERRED": 3, "PROVENANCE": 4, "COUNT": 5}
    total = len(rows)
    taught = sum(r["shown"] for r in rows)
    held = sum(r["held"] for r in rows)
    empty = [r for r in rows if any(i[0] == "EMPTY" for i in r["issues"])]
    missing = [r for r in rows if any(i[0] == "MISSING" for i in r["issues"])]
    partial = [r for r in rows if any(i[0] == "PARTIAL" for i in r["issues"])]
    defr = [r for r in rows if any(i[0] == "DEFERRED" for i in r["issues"])]
    deferred_cards = sum(int(i[1].split()[0]) for r in defr for i in r["issues"] if i[0] == "DEFERRED")
    prov = [r for r in rows if any(i[0] == "PROVENANCE" for i in r["issues"])]
    count = [r for r in rows if any(i[0] == "COUNT" for i in r["issues"])]

    L = []
    L.append("# Practice completeness audit")
    L.append("")
    L.append(f"{total} practices in {len({(r['book'], r['unit']) for r in rows})} units. "
             f"{taught} questions a student can answer, {held} held (missing from the site).")
    L.append("")
    L.append(f"- EMPTY (nothing to answer): {len(empty)}")
    L.append(f"- MISSING file: {len(missing)}")
    L.append(f"- PARTIAL (book page has more): {len(partial)}")
    L.append(f"- DEFERRED (card marked held for a book check, so it is not drawn): "
             f"{len(defr)} practices, {deferred_cards} cards")
    L.append(f"- PROVENANCE (card text not on the page it claims): {len(prov)}")
    L.append(f"- COUNT (catalog and file disagree): {len(count)}")
    L.append("")
    for label, group in (("EMPTY", empty), ("MISSING", missing), ("PARTIAL", partial),
                         ("DEFERRED", defr), ("PROVENANCE", prov), ("COUNT", count)):
        if not group:
            continue
        L.append(f"## {label}")
        L.append("")
        for r in sorted(group, key=lambda r: (-r["held"], r["book"], r["unit"], r["id"])):
            detail = "; ".join(f"{k}: {v}" for k, v in r["issues"] if k == label)
            L.append(f"- `{r['book']}/{r['unit']}/{r['id']}` — {detail}")
        L.append("")
    md = "\n".join(L)

    if args.md:
        open(args.md, "w", encoding="utf-8").write(md + "\n")
    else:
        print(md)

    if args.fail_on == "partial" and (empty or missing or partial):
        return 1
    if args.fail_on == "empty" and (empty or missing):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
