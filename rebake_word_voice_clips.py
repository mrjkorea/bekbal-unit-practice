#!/usr/bin/env python3
"""Re-bake the eight real Fish voices for every middle-school word pack.

Why: the old clips were one recording pitch-shifted into eight folders (same byte
size and same duration for seven of them). Jay 2026-11-12 ordered a real re-record
of all 4368 clips.

Voice map and prompt tags come from the canonical RECIPE.json, so no id is ever
typed by hand. Free Fish model only (the script --voice path locks it), 44.1 kHz /
128 kbps mono. Nothing is deleted before its replacement exists: each clip is
written to a .new file and moved over the old one in the same step.

Usage:
  python3 rebake_word_voice_clips.py --pilot            # one card, eight voices, timed
  python3 rebake_word_voice_clips.py --plan             # count only
  python3 rebake_word_voice_clips.py --run [--workers 4]
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]          # work/bekbal-wordpacks
PACKS = ROOT / "packs"
RECIPE = Path.home() / ".hermes/projects/mrj-word-factory/packs/RECIPE.json"
FISH = Path.home() / ".hermes/scripts/fish_tts.py"
TMPDIR = Path("/tmp/wm_voice_bake")
PROGRESS = ROOT / "voice_rebake_progress.json"
MIN_BYTES = 2000

FOLDER_FOR = {  # RECIPE key -> audio folder in this repo
    "us_m": "us_m", "us_f": "us_f", "uk_m": "uk_m", "uk_f": "uk_f",
    "grandma": "grandma", "leo": "leo", "grandpa": "grandpa", "robot": "robot",
}


def voices():
    data = json.loads(RECIPE.read_text(encoding="utf-8"))["voices"]
    out = []
    for key, folder in FOLDER_FOR.items():
        meta = data[key]
        out.append({"key": key, "folder": folder, "id": meta["fish_id"], "tag": meta["tag"]})
    return out


def target_packs():
    """Word and expression packs: the ones whose audio folders are the eight spoken voices."""
    out = []
    for j in sorted(PACKS.glob("*.json")):
        name = j.stem
        aud = PACKS / name / "audio"
        if not aud.is_dir():
            continue
        folders = {d.name for d in aud.iterdir() if d.is_dir()}
        if not {"us_m", "leo"} <= folders:
            continue
        cards = json.loads(j.read_text(encoding="utf-8")).get("words", [])
        if cards:
            out.append({"name": name, "cards": cards})
    return out


def plan():
    packs = target_packs()
    tasks = []
    for p in packs:
        for c in p["cards"]:
            for v in voices():
                tasks.append((p["name"], c["id"], str(c.get("en") or "").strip(), v))
    return packs, tasks


def load_progress():
    if PROGRESS.is_file():
        try:
            return json.loads(PROGRESS.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def save_progress(done):
    tmp = PROGRESS.with_suffix(".tmp")
    tmp.write_text(json.dumps(done, indent=0), encoding="utf-8")
    os.replace(tmp, PROGRESS)


def bake_one(pack, card_id, text, voice, idx):
    dest = PACKS / pack / "audio" / voice["folder"] / (card_id + ".mp3")
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp_txt = TMPDIR / ("t%04d.txt" % (idx % 64))
    tmp_out = TMPDIR / (card_id + "_" + voice["folder"] + ".new.mp3")
    full = (voice["tag"] + " " + text).strip()
    last = ""
    for attempt in (1, 2, 3):
        tmp_txt.write_text(full + "\n", encoding="utf-8")
        try:
            r = subprocess.run(
                [sys.executable, str(FISH), "--input", str(tmp_txt),
                 "--output", str(tmp_out), "--voice", voice["id"]],
                capture_output=True, text=True, timeout=180,
            )
        except subprocess.TimeoutExpired:
            last = "timeout"
            time.sleep(3 * attempt)
            continue
        if r.returncode == 0 and tmp_out.is_file() and tmp_out.stat().st_size >= MIN_BYTES:
            os.replace(tmp_out, dest)
            return dest, dest.stat().st_size
        last = (r.stderr or r.stdout or "")[-200:]
        time.sleep(2 * attempt)
    return None, last


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan", action="store_true")
    ap.add_argument("--pilot", action="store_true")
    ap.add_argument("--run", action="store_true")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--pack", default="")
    a = ap.parse_args()

    TMPDIR.mkdir(parents=True, exist_ok=True)
    packs, tasks = plan()
    print(f"packs={len(packs)} cards={sum(len(p['cards']) for p in packs)} clips={len(tasks)}", flush=True)
    if a.pack:
        tasks = [t for t in tasks if t[0] == a.pack]
        print(f"filtered to {a.pack}: {len(tasks)} clips", flush=True)
    if a.plan:
        for p in packs:
            print(p["name"], len(p["cards"]))
        return

    done = load_progress()
    todo = [t for t in tasks if f"{t[0]}/{t[1]}/{t[3]['folder']}" not in done]
    print(f"already done={len(tasks) - len(todo)} todo={len(todo)}", flush=True)

    if a.pilot:
        todo = todo[:8]
        started = time.time()
        for i, t in enumerate(todo):
            dest, info = bake_one(t[0], t[1], t[2], t[3], i)
            print(("OK " if dest else "FAIL ") + f"{t[0]} {t[1]} {t[3]['folder']} {info}", flush=True)
        span = time.time() - started
        print(f"pilot {len(todo)} clips in {span:.1f}s = {span / max(1, len(todo)):.2f}s per clip", flush=True)
        return

    if not a.run:
        print("nothing to do: pass --plan, --pilot or --run")
        return

    started = time.time()
    ok = 0
    failed = []
    with ThreadPoolExecutor(max_workers=max(1, a.workers)) as pool:
        futs = {}
        for i, t in enumerate(todo):
            futs[pool.submit(bake_one, t[0], t[1], t[2], t[3], i)] = t
        for n, fut in enumerate(as_completed(futs), 1):
            t = futs[fut]
            dest, info = fut.result()
            key = f"{t[0]}/{t[1]}/{t[3]['folder']}"
            if dest:
                ok += 1
                done[key] = int(dest.stat().st_size)
            else:
                failed.append({"clip": key, "why": str(info)[-160:]})
            if n % 40 == 0 or n == len(todo):
                span = time.time() - started
                rate = span / max(1, n)
                left = (len(todo) - n) * rate
                save_progress(done)
                print(f"{n}/{len(todo)} ok={ok} fail={len(failed)} {rate:.2f}s/clip "
                      f"eta={left/60:.0f}min", flush=True)
    save_progress(done)
    print(f"DONE ok={ok} fail={len(failed)} span={(time.time()-started)/60:.1f}min", flush=True)
    if failed:
        (ROOT / "voice_rebake_failures.json").write_text(json.dumps(failed, indent=1), encoding="utf-8")
        print("failures written to voice_rebake_failures.json", flush=True)


if __name__ == "__main__":
    main()
