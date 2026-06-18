#!/usr/bin/env bash
# =============================================================================
# BrainBattle — CI Appium Test Runner
# Called by: reactivecircus/android-emulator-runner script: field
# This file lives in the repo so it has NO indentation/heredoc issues.
# =============================================================================
set -euo pipefail

WORKSPACE="${GITHUB_WORKSPACE:-.}"
APPIUM_DIR="${WORKSPACE}/BrainBattleAppium"
REPORT_FINAL="${WORKSPACE}/brainbattle-mobile-test-report.xlsx"

echo "========================================================"
echo " BrainBattle Appium CI Runner"
echo " APK     : ${APK_PATH}"
echo " UDID    : emulator-5554"
echo " Workspace: ${WORKSPACE}"
echo "========================================================"

# ── 1. Install APK ────────────────────────────────────────────────────
echo ""
echo "📦 Installing APK on emulator..."
adb install -r "${APK_PATH}"
echo "✅ APK installed"

# ── 2. Start Appium server ────────────────────────────────────────────
echo ""
echo "🚀 Starting Appium server (logging to /tmp/appium.log)..."
appium --log-level warn > /tmp/appium.log 2>&1 &
APPIUM_PID=$!

# Wait for Appium to be ready
echo "   Waiting for Appium to initialise..."
for i in $(seq 1 15); do
  sleep 2
  if curl -sf http://127.0.0.1:4723/status > /dev/null 2>&1; then
    echo "✅ Appium ready after $((i * 2))s (PID ${APPIUM_PID})"
    break
  fi
  if [ "$i" -eq 15 ]; then
    echo "❌ Appium did not start in 30s. Last log:"
    tail -30 /tmp/appium.log || true
    exit 1
  fi
done

# ── 3. Run WDIO + generate xlsx via wdio.conf.js after-hook ──────────
echo ""
echo "🚀 Running WDIO Appium test suite..."
cd "${APPIUM_DIR}"

# IMPORTANT FIX: The Android Emulator Runner runs in a clean shell that
# does not inherit the Node.js binaries installed by actions/setup-node.
# We must inject the GitHub Actions PATH dynamically to find `npx`.
if [ -n "${GITHUB_PATH:-}" ] && [ -f "${GITHUB_PATH}" ]; then
  export PATH="$(cat "${GITHUB_PATH}" | tr '\n' ':')$PATH"
fi

export APPIUM_UDID="emulator-5554"
export APPIUM_APP_PATH="${APK_PATH}"
export XLSX_OUTPUT="${APPIUM_DIR}/appium-report.xlsx"

# Ensure node_modules bins are executable and run wdio CLI directly via Node to bypass shell permission issues
chmod +x node_modules/.bin/* 2>/dev/null || true
set +e
node node_modules/@wdio/cli/bin/wdio.js run wdio.conf.js
WDIO_EXIT=$?
set -e
echo ""
echo "   WDIO exited with code: ${WDIO_EXIT}"

# ── 4. Fallback: generate xlsx if the after-hook did not produce it ───
if [ ! -f "${XLSX_OUTPUT}" ]; then
  echo ""
  echo "⚠️  appium-report.xlsx not found — running fallback generator..."
  node "${APPIUM_DIR}/utils/generateFallbackReport.js" \
    --output "${XLSX_OUTPUT}" \
    --exit-code "${WDIO_EXIT}"
fi

# ── 5. Copy report to workspace root for artifact upload ──────────────
if [ -f "${XLSX_OUTPUT}" ]; then
  cp "${XLSX_OUTPUT}" "${REPORT_FINAL}"
  echo "✅ Report saved → ${REPORT_FINAL}"
else
  echo "❌ No xlsx report found at ${XLSX_OUTPUT}"
  exit 1
fi

exit "${WDIO_EXIT}"
