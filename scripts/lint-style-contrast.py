#!/usr/bin/env python3
"""Fail if a button's text cannot be read on its own background.

Jay 2026-11-14: the order and word-bank buttons set a white background while the
base button rule keeps color:#fff, so students saw white text on white and could
not read the sentence.

This reads assets/style.css, finds every button-like class the app creates
(app.js `el("button", "cls")`), works out that class's background and colour
after the base rule, and fails when the contrast ratio is under 3:1 or when a
light background is set with no colour at all.

  python3 scripts/lint-style-contrast.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, "assets", "style.css")
APP = os.path.join(ROOT, "assets", "app.js")
MIN = 3.0


def luminance(hexcolor):
    h = hexcolor.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ratio(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def rules():
    css = open(CSS, encoding="utf-8").read()
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out = []
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        sel = m.group(1).strip()
        decl = m.group(2)
        out.append((sel, decl))
    return out


def decl_map(decl):
    d = {}
    for part in decl.split(";"):
        if ":" not in part:
            continue
        k, v = part.split(":", 1)
        d[k.strip().lower()] = v.strip()
    return d


def first_hex(value):
    m = re.search(r"#[0-9a-fA-F]{3,6}\b", value or "")
    return m.group(0) if m else None


def main():
    app = open(APP, encoding="utf-8").read()
    classes = set(re.findall(r'el\(\s*"button"\s*,\s*"([^"]+)"', app))
    if not classes:
        print("no button classes found in app.js")
        return 1

    base = {}
    for sel, decl in rules():
        if sel.strip() == "button":
            base = decl_map(decl)
    base_bg = first_hex(base.get("background") or base.get("background-color") or "") or "#1d3557"
    base_fg = first_hex(base.get("color") or "") or "#ffffff"

    bad = []
    for cls in sorted(classes):
        bg, fg = base_bg, base_fg
        for sel, decl in rules():
            parts = [p.strip() for p in sel.split(",")]
            hit = False
            for p in parts:
                if re.search(r"(^|[\s>])\.%s($|[\s:.>])" % re.escape(cls.split()[0]), p):
                    hit = True
            if not hit:
                continue
            d = decl_map(decl)
            if "background" in d or "background-color" in d:
                hexv = first_hex(d.get("background") or d.get("background-color"))
                if hexv:
                    bg = hexv
            if "color" in d:
                hexv = first_hex(d["color"])
                if hexv:
                    fg = hexv
        r = ratio(bg, fg)
        if r < MIN:
            bad.append((cls, bg, fg, round(r, 2)))

    if bad:
        print(f"{len(bad)} button style(s) under {MIN}:1 contrast")
        for cls, bg, fg, r in bad:
            print(f"- .{cls}: text {fg} on {bg} = {r}:1")
        return 1
    print(f"{len(classes)} button styles checked, none under {MIN}:1")
    return 0


if __name__ == "__main__":
    sys.exit(main())
