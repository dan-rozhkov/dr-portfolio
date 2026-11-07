#!/usr/bin/env bash
# Make the web variants of an H.264 video: name.hevc.mp4 (H.265) and name.webm (VP9).
# The original name.mp4 stays as the fallback for browsers that play neither.
# Settings follow pixel-point/skills compress-video: H.265 CRF 30, VP9 CRF 42, no audio.
# Resolution and frame rate are kept (60 fps clips stay 60 fps on purpose).
#
# Usage: scripts/encode-video.sh [-f] public/images/.../name.mp4 [...]
#   -f  re-encode even if the variants already exist
set -euo pipefail

force=0
if [[ "${1:-}" == "-f" ]]; then force=1; shift; fi
[[ $# -gt 0 ]] || { echo "usage: $0 [-f] file.mp4 [...]" >&2; exit 2; }

for src in "$@"; do
  case "$src" in
    *.hevc.mp4) continue ;;
    # Keep in sync with ORIGINAL_ONLY_DIRS in src/components/video.ts
    *images/writing/biscuit-pet/*) echo "skip (original only): $src" >&2; continue ;;
    *.mp4) ;;
    *) echo "skip (not .mp4): $src" >&2; continue ;;
  esac
  base="${src%.mp4}"
  hevc="$base.hevc.mp4"
  webm="$base.webm"
  if [[ $force -eq 1 || ! -f "$hevc" ]]; then
    ffmpeg -hide_banner -nostdin -loglevel error -y -i "$src" -map 0:v:0 \
      -c:v libx265 -crf 30 -preset veryslow -x265-params log-level=error \
      -tag:v hvc1 -pix_fmt yuv420p -movflags +faststart -an "$hevc"
  fi
  if [[ $force -eq 1 || ! -f "$webm" ]]; then
    ffmpeg -hide_banner -nostdin -loglevel error -y -i "$src" -map 0:v:0 \
      -c:v libvpx-vp9 -b:v 0 -crf 42 -deadline good -cpu-used 1 -row-mt 1 \
      -pix_fmt yuv420p -an "$webm"
  fi
  printf '%-60s %6dK  hevc %6dK  webm %6dK\n' "$src" \
    $(( $(stat -f%z "$src") / 1024 )) $(( $(stat -f%z "$hevc") / 1024 )) $(( $(stat -f%z "$webm") / 1024 ))
done
