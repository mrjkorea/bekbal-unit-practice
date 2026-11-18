#!/usr/bin/env python3
"""Answer the question ourselves and compare with the stored key.

Jay 2026-11-18: a student's right answer was marked wrong because the key was
copied ③ where the answer page prints ⑤. Every checker until now looked at the
stored answer's shape — does it fit its blank, is its count reachable, are its
buttons shuffled — and none of them ever answered the question. A shape check
cannot see a key that points at the right-looking but wrong option.

This one never looks at the stored key while answering: it reads the question
and the options, says which option it would pick, and only then do we compare.
A disagreement is not proof that the card is wrong; it is a card a person must
open the book page for. Agreement is not proof either, but two readers who never
saw each other's answer are how a copied-wrong key gets caught.

  python3 scripts/solve-check.py                 # every choice item whose stem asks for the wrong one
  python3 scripts/solve-check.py --all-choice     # every choice item in the books
  python3 scripts/solve-check.py --limit 20 --jobs 6

Writes /tmp/solve-check.json and prints a summary. Costs nothing extra: it uses
the SuperGrok session Jay already pays for, through the shared tool.
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GROK = os.path.expanduser("~/OpenBot/Shared/tools/groktext.py")
NEG = re.compile(r"(않은 것|옳지 않은|틀린 것|아닌 것|적절하지 않은|틀린 것은|고쳐 쓰지|바르게 고친|바르게 고쳐)")

INSTRUCTION = """You are checking a Korean middle-school English test item.
Read the question and the numbered options. Answer the question the way a careful
teacher would, using English grammar, not by guessing what a book might say.

Reply in exactly one line, nothing else:
<option number>|<one short reason, at most 12 words, in English>

If the question cannot be answered from what you are given, reply:
0|not enough information

Question:
"""


def ask(prompt, tries=2):
    for attempt in range(tries):
        with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as pf:
            pf.write(prompt)
            pfile = pf.name
        ofile = pfile + ".out"
        try:
            subprocess.run([sys.executable, GROK, "-f", pfile, "-o", ofile],
                           check=True, timeout=180, capture_output=True)
            text = open(ofile, encoding="utf-8").read()
        except Exception:
            text = ""
        finally:
            for p in (pfile, ofile):
                try:
                    os.unlink(p)
                except OSError:
                    pass
        m = re.search(r"^\s*([0-9])\s*\|\s*(.*)$", text, re.M)
        if m:
            return int(m.group(1)), m.group(2).strip()
        m = re.search(r"\b([1-9])\b", text)
        if m:
            return int(m.group(1)), " ".join(text.split())[:90]
    return -1, "no parseable answer"


def items(all_choice):
    out = []
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "*", "*", "exercises", "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        rel = os.path.relpath(f, ROOT)
        for q in d.get("questions") or []:
            if q.get("type") != "mc":
                continue
            ch = q.get("choices") or []
            if len(ch) < 2:
                continue
            stem = q.get("promptEn") or ""
            if not all_choice and not NEG.search(stem):
                continue
            out.append({
                "file": rel, "book": rel.split(os.sep)[1], "unit": rel.split(os.sep)[2],
                "practice": d.get("id"), "id": q.get("id"), "label": q.get("label"),
                "pages": d.get("sourcePages"),
                "stem": stem, "choices": ch,
                "key": (q.get("correctIndexes") or [None])[0],
            })
    return out


def one(it):
    lines = [INSTRUCTION, it["stem"].strip(), "", "Options:"]
    for n, c in enumerate(it["choices"], 1):
        lines.append("%d. %s" % (n, str(c)))
    lines.append("")
    lines.append("One line: <option number>|<reason>")
    num, why = ask("\n".join(lines))
    it["says"] = num
    it["why"] = why
    return it


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all-choice", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--jobs", type=int, default=6)
    ap.add_argument("--out", default="/tmp/solve-check.json")
    a = ap.parse_args()

    work = items(a.all_choice)
    if a.limit:
        work = work[:a.limit]
    print("items to answer: %d" % len(work), flush=True)

    done = []
    with ThreadPoolExecutor(max_workers=a.jobs) as pool:
        for i, it in enumerate(pool.map(one, work), 1):
            done.append(it)
            if i % 25 == 0:
                print("  answered %d/%d" % (i, len(work)), flush=True)

    agree = [it for it in done if it["says"] == it["key"]]
    disagree = [it for it in done if it["says"] not in (it["key"], 0, -1)]
    unsure = [it for it in done if it["says"] in (0, -1)]
    print("answered %d: agree %d, disagree %d, unsure %d"
          % (len(done), len(agree), len(disagree), len(unsure)))
    for it in disagree:
        print("- %s %s %s #%s | key %s, we say %s | %s"
              % (it["book"], it["unit"], it["practice"], it["label"], it["key"], it["says"], it["why"]))
    json.dump(done, open(a.out, "w"), ensure_ascii=False, indent=1)
    print("written:", a.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
