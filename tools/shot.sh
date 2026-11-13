#!/bin/bash
"$(dirname "$0")/clean_cache.sh"
# Take a screenshot of the town with headless Chrome on the GPU.
#   tools/shot.sh <out.png> "<query string>" [width height]
#   view=x,feetY,z,yaw,pitch   stand at world x,z (z = -Y along the street), yaw 0 looks west down the street
#   time=17.9 or time=dusk (the street follows the clock otherwise)   shot   the view from above   fps   draw calls and triangles
BASE=${TOWN_URL:-http://100.107.252.39:5188}
OUT=$1; W=${3:-1280}; H=${4:-760}
URL="$BASE/?$2"
LOCKDIR=/tmp/claude-1002/my_house_shot_locks; mkdir -p "$LOCKDIR"
while :; do
  for n in 1 2; do exec 9>"$LOCKDIR/slot$n"; if flock -n 9; then break 2; fi; done
  sleep $((3 + RANDOM % 5))
done
nice -n 19 timeout ${TO:-240} google-chrome --headless=new --no-sandbox --password-store=basic --use-gl=angle --use-angle=${ANGLE:-gl-egl} --enable-unsafe-swiftshader --ignore-gpu-blocklist --window-size=$W,$H --virtual-time-budget=${VT:-25000} --enable-logging=stderr --v=0 --screenshot="$OUT" "$URL" 2>&1 | grep -E "CONSOLE|Uncaught|rror" | grep -v -E "dbus|gcm|GCM|registration|sandbox|DEPRECATED|Vulkan|vaapi|udev|radv|renderD" | head -${LINES_MAX:-12}
ls -la "$OUT" | awk '{print $5, $9}'
