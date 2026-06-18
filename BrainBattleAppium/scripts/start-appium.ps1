$ErrorActionPreference = "Stop"

$sdkPath = "C:\Users\USER\AppData\Local\Android\Sdk"

if (!(Test-Path $sdkPath)) {
    throw "Android SDK not found at $sdkPath. Update this script with your real SDK path."
}

$env:ANDROID_HOME = $sdkPath
$env:ANDROID_SDK_ROOT = $sdkPath
$env:PATH = "$sdkPath\platform-tools;$sdkPath\emulator;$sdkPath\cmdline-tools\latest\bin;$env:PATH"

Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "Starting Appium server on http://127.0.0.1:4723 ..."
npx appium --base-path /
