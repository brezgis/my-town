#!/bin/bash
# tools/shot.sh, retried when the GPU drops the picture (it is shared, and often nearly full).
N=${LINES_MAX:-12}
for i in 1 2 3 4 5 6; do out=$(LINES_MAX=400 "$(dirname "$0")/shot.sh" "$@" 2>&1); echo "$out" | grep -q "context lost\|BAD_ALLOC\|could not be created\|Error creating WebGL" || break; sleep 4; done
echo "$out" | grep -v "DRINK\|^\[.*KEY " | cut -c1-400 | (head -$N; cat >/dev/null); echo "$out" | tail -1 | grep -q png || echo "$out" | tail -1
