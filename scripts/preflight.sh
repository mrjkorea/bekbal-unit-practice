#!/bin/bash
# Everything that must hold before a push to the student site. One command, no advice.
#
# Jay 2026-11-24: he found three faults on a screen on two days running and said
# "you better come up with a system to prevent it". A check that a person may run is
# advice; this one runs from the pre-push hook, so a broken card cannot be published
# by anyone who forgets.
#
#   scripts/preflight.sh          # all checks; exit 1 stops the push
#   scripts/preflight.sh --fast   # skip the full item sweep
set -u
cd "$(dirname "$0")/.." || exit 1
fast=${1:-}
fail=0
run() {
  local name="$1"; shift
  local out
  out=$("$@" 2>&1)
  local rc=$?
  if [ $rc -ne 0 ]; then
    echo "FAILED: $name"
    echo "$out" | tail -25
    fail=1
  else
    echo "ok: $name — $(echo "$out" | tail -1)"
  fi
}

run "answers fit their blanks"      python3 scripts/validate-exercises.py
run "catalog counts"                python3 scripts/check-catalog-counts.py
run "order answers match their note" python3 scripts/check-order-answers.py
run "stated word counts"            python3 scripts/check-word-counts.py
run "letter-set options and key"    python3 scripts/check-choice-sets.py
run "marks a question asks about"   python3 scripts/check-mark-ranges.py
run "Korean answer grading"         node scripts/test-korean-grading.mjs
run "every 대화 영작 practice"    node scripts/test-dialog-lines.mjs

if [ "$fast" != "--fast" ]; then
  run "practice completeness"       python3 scripts/audit-practice-completeness.py
fi

if [ $fail -ne 0 ]; then
  echo
  echo "Not pushed. Fix the card above, or fix the check if the check is wrong."
  exit 1
fi
echo
echo "preflight clean"
