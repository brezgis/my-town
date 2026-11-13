#!/bin/bash
# Syntax-check every module (node 22 from nvm; the system node is too old for this code).
N=~/.nvm/versions/node/v22.22.0/bin/node; T=$(mktemp -d); ok=1
for f in $(find site/src -name '*.js'); do cp "$f" "$T/x.mjs"; $N --check "$T/x.mjs" 2>&1 | grep -v "^$" | sed "s#$T/x.mjs#$f#" | head -6 && true; if ! $N --check "$T/x.mjs" >/dev/null 2>&1; then ok=0; fi; done
rm -rf "$T"; [ $ok = 1 ] && echo "all modules parse"
