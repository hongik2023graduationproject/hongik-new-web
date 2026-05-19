#!/usr/bin/env bash
# hong-ik 저장소의 GitHub Release에서 최신 WASM 산출물을 받아온다.
#
# 사용:
#   ./scripts/sync-wasm.sh                       # latest (rolling)
#   ./scripts/sync-wasm.sh wasm-<sha>            # 특정 빌드에 고정
#   WASM_DEST=apps/playground/public ./scripts/sync-wasm.sh
#
# CI 통합:
#   - pnpm install 직후 호출 (Next.js 빌드 전).
#   - 실패 시 CI 실패시켜 누락된 산출물로 배포되지 않도록 한다.

set -euo pipefail

TAG="${1:-wasm-latest}"
REPO="${WASM_REPO:-hongik2023graduationproject/hong-ik}"
DEST="${WASM_DEST:-apps/playground/public}"

echo "[sync-wasm] $REPO @ $TAG → $DEST"

mkdir -p "$DEST"

# 핵심 산출물 2개 + manifest. 핵심 2개는 누락 시 실패, manifest는 best-effort.
for f in hongik-wasm.js hongik-wasm.wasm; do
    url="https://github.com/$REPO/releases/download/$TAG/$f"
    echo "  - $f"
    curl -fsSL --retry 3 --retry-delay 2 -o "$DEST/$f" "$url"
done

# manifest는 있으면 좋고 없어도 진행 (이전 빌드 구조에는 없을 수 있음).
manifest_url="https://github.com/$REPO/releases/download/$TAG/manifest.json"
if curl -fsSL --retry 1 -o "$DEST/manifest.json" "$manifest_url" 2>/dev/null; then
    echo "[sync-wasm] manifest:"
    cat "$DEST/manifest.json"
else
    echo "[sync-wasm] manifest not available (older build)"
fi

echo "[sync-wasm] done."
