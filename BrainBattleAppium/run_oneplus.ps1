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

# Check and free Port 4723
$portProcess = Get-NetTCPConnection -LocalPort 4723 -ErrorAction SilentlyContinue
if ($portProcess) {
    Write-Host "[*] Port 4723 is already in use. Stopping existing process..." -ForegroundColor Yellow
    foreach ($conn in $portProcess) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[*] Searching for connected Android devices (adb devices)..." -ForegroundColor Cyan
$devicesOutput = adb devices
Write-Host $devicesOutput

# Parse the UDID from adb devices (skipping the first line "List of devices attached")
$udid = ""
$lines = $devicesOutput -split "`r`n|`n"
foreach ($line in $lines) {
    if ($line -match "^(\S+)\s+device$") {
        $udid = $matches[1]
        break
    }
}

if ([string]::IsNullOrWhiteSpace($udid)) {
    Write-Host "[Error] No connected physical device or emulator found." -ForegroundColor Red
    Write-Host "Please ensure your OnePlus LE2101 is connected and USB Debugging is allowed." -ForegroundColor Yellow
    exit 1
}

Write-Host "[Success] Target Device UDID identified: $udid" -ForegroundColor Green

# Start Appium server in background via cmd.exe to avoid PS1 execution policy issues on npx
Write-Host "[*] Starting Appium server in background..." -ForegroundColor Cyan
$appiumProcess = Start-Process cmd.exe -ArgumentList "/c npx appium --port 4723 --base-path /" -PassThru -NoNewWindow
Start-Sleep -Seconds 6

# Set the environment variable for wdio.oneplus.conf.js
$env:APPIUM_UDID = $udid

# Run the dedicated OnePlus configuration
Write-Host "[*] Launching Appium Test Suite (OnePlus Configuration)..." -ForegroundColor Cyan
npx.cmd wdio run wdio.oneplus.conf.js

# Stop Appium
if ($appiumProcess) {
    Write-Host "[*] Stopping Appium server..." -ForegroundColor Cyan
    Stop-Process -Id $appiumProcess.Id -Force -ErrorAction SilentlyContinue
}

Write-Host "[Success] Test execution complete! The appium-report.xlsx has been updated." -ForegroundColor Green
