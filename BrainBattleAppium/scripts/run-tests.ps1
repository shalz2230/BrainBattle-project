$ErrorActionPreference = "Stop"

$sdkPath = "C:\Users\USER\AppData\Local\Android\Sdk"
$apkPath = Resolve-Path "$PSScriptRoot\..\..\BrainBattle\app\build\outputs\apk\debug\app-debug.apk" -ErrorAction SilentlyContinue

if (!(Test-Path $sdkPath)) {
    throw "Android SDK not found at $sdkPath. Update this script with your real SDK path."
}

if (!$apkPath) {
    throw "Debug APK not found. Build it first: cd D:\BrainBattle-project\BrainBattle ; .\gradlew.bat assembleDebug"
}

$env:ANDROID_HOME = $sdkPath
$env:ANDROID_SDK_ROOT = $sdkPath
$env:PATH = "$sdkPath\platform-tools;$sdkPath\emulator;$sdkPath\cmdline-tools\latest\bin;$env:PATH"
$env:APPIUM_APP_PATH = $apkPath.Path

Write-Host "ANDROID_HOME=$env:ANDROID_HOME"
Write-Host "APPIUM_APP_PATH=$env:APPIUM_APP_PATH"
Write-Host "Connected devices:"
& "$sdkPath\platform-tools\adb.exe" devices

npm test
