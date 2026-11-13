#!/bin/bash
# tools/shot.sh, retried when the GPU drops the picture (it is shared, and often nearly full).
for i in 1 2 3 4 5; do out=$("$(dirname "$0")/shot.sh" "$@" 2>&1); echo "$out" | grep -q "context lost\|BAD_ALLOC\|could not be created" || break; sleep 3; done
echo "$out" | grep -v "KEY\|DRINK" | cut -c1-400
