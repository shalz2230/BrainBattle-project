# =====================================================================
# BrainBattle — Local Execution on OnePlus LE2101
# =====================================================================
# This script runs the dedicated 300+ test suite on a connected
# physical OnePlus LE2101 device via Appium.
#
# Requirements:
#   1. OnePlus LE2101 connected via USB.
#   2. USB Debugging enabled.
#   3. Appium server installed (npm install -g appium).
# =====================================================================

Write-Host "🔍 Searching for connected Android devices (adb devices)..." -ForegroundColor Cyan
$devicesOutput = adb devices
Write-Host $devicesOutput

# Parse the UDID from adb devices (skipping the first line "List of devices attached")
$udid = ""
$lines = $devicesOutput -split "`r`n|`n"
foreach ($line in $lines) {
    if ($line -match "^(\w+)\s+device$") {
        $udid = $matches[1]
        break
    }
}

if ([string]::IsNullOrWhiteSpace($udid)) {
    Write-Host "❌ No connected physical device or emulator found." -ForegroundColor Red
    Write-Host "Please ensure your OnePlus LE2101 is connected and USB Debugging is allowed." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Target Device UDID identified: $udid" -ForegroundColor Green

# Set the environment variable for wdio.oneplus.conf.js
$env:APPIUM_UDID = $udid

# Run the dedicated OnePlus configuration
Write-Host "🚀 Launching Appium Test Suite (OnePlus Configuration)..." -ForegroundColor Cyan
npx wdio run wdio.oneplus.conf.js

Write-Host "✅ Test execution complete! The appium-report.xlsx has been updated." -ForegroundColor Green
