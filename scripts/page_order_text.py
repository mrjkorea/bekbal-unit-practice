#!/usr/bin/env python3
"""Read a scanned workbook page in true reading order, column by column.

The books are printed in two columns, and pdftotext -layout interleaves them, which is
what scrambled the five choices and dropped items from the exercises. The PDF's text
layer already carries a box for every word, so this reads the boxes, splits the page
where a real vertical gap runs down it, and sorts each column top to bottom.

  python3 scripts/page_order_text.py BOOK.pdf 196 197
  python3 scripts/page_order_text.py BOOK.pdf 196-199 --json
"""
import argparse
import re
import subprocess
import sys
from xml.etree import ElementTree as ET

NS = "{http://www.w3.org/1999/xhtml}"


def words_of_page(pdf, page):
    xml = subprocess.run(["pdftotext", "-bbox", "-f", str(page), "-l", str(page), pdf, "-"],
                         capture_output=True, text=True).stdout
    root = ET.fromstring(xml)
    out = []
    for w in root.iter(NS + "word"):
        t = (w.text or "").strip()
        if not t:
            continue
        out.append(dict(t=t, x0=float(w.get("xMin")), x1=float(w.get("xMax")),
                        y0=float(w.get("yMin")), y1=float(w.get("yMax"))))
    return out


def column_split(ws, width):
    """x where the page really divides into two columns.

    A footer or a header can cross the middle, so a few crossing words are tolerated:
    the best candidate is the widest empty corridor, judged by how few words cross it.
    """
    lo, hi = width * 0.28, width * 0.72
    best, best_score = None, None
    for gx in range(int(lo), int(hi)):
        cross = sum(1 for w in ws if w["x0"] < gx < w["x1"])
        if cross > max(2, len(ws) // 50):
            continue
        room = min((w["x0"] - gx for w in ws if w["x0"] >= gx), default=0) + \
               min((gx - w["x1"] for w in ws if w["x1"] <= gx), default=0)
        score = (-cross, room)
        if best_score is None or score > best_score:
            best, best_score = gx, score
    return best


def lines_of(ws):
    ws = sorted(ws, key=lambda w: (w["y0"], w["x0"]))
    lines, cur = [], []
    for w in ws:
        if cur and abs(w["y0"] - cur[-1]["y0"]) > 3.5:
            lines.append(cur); cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    out = []
    for ln in lines:
        ln.sort(key=lambda w: w["x0"])
        s, prev = "", None
        for w in ln:
            if prev is not None:
                gap = w["x0"] - prev["x1"]
                if gap > 0.9 and not s.endswith(" "):
                    s += " "
            s += w["t"]
            prev = w
        out.append((ln[0]["y0"], s))
    out.sort(key=lambda p: p[0])
    return [s for _, s in out]


def page_text(pdf, page):
    ws = words_of_page(pdf, page)
    if not ws:
        return ""
    width = max(w["x1"] for w in ws) + 20
    cut = column_split(ws, width)
    if cut is None:
        return "\n".join(lines_of(ws))
    left = [w for w in ws if w["x1"] <= cut]
    right = [w for w in ws if w["x0"] >= cut]
    return "\n".join(lines_of(left) + [""] + lines_of(right))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("pages", help="196 197 or 196-199")
    ap.add_argument("--offset", type=int, default=0, help="printed page = pdf page - offset")
    a = ap.parse_args()
    if "-" in a.pages:
        p0, p1 = (int(x) for x in a.pages.split("-"))
    else:
        p0 = p1 = int(a.pages)
    for printed in range(p0, p1 + 1):
        print("===== p.%d =====" % printed)
        print(page_text(a.pdf, printed + a.offset))


if __name__ == "__main__":
    main()
