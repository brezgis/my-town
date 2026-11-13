#!/bin/bash
# Headless Chrome leaves a "scoped_dir" of about 70 MB in ~/.cache/google-chrome-headless on every
# launch and never removes it. Every tool here that starts Chrome calls this first.
find "${XDG_CACHE_HOME:-$HOME/.cache}/google-chrome-headless" -mindepth 1 -maxdepth 1 -name 'scoped_dir*' -mmin +20 -exec rm -rf {} + 2>/dev/null
exit 0
