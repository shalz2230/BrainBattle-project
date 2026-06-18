const path = require('path');

const apkPath = process.env.APPIUM_APP_PATH
    || path.join(process.cwd(), '../BrainBattle/app/build/outputs/apk/debug/app-debug.apk');
const deviceUdid = process.env.APPIUM_UDID || 'adb-d11f8cb0-WCzuAr._adb-tls-connect._tcp';

exports.config = {
    runner: 'local',
    port: 4723,
    specs: [
        './tests/mega_android_1100.test.js'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Android Device',
        'appium:udid': deviceUdid,
        'appium:automationName': 'UiAutomator2',
        'appium:app': apkPath,
        'appium:appPackage': 'com.simats.brainbattle',
        'appium:appActivity': '.SplashActivity',
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:autoGrantPermissions': true,
        'appium:ignoreHiddenApiPolicyError': true,
        'appium:adbExecTimeout': 120000,
        'appium:androidInstallTimeout': 120000,
        'appium:uiautomator2ServerInstallTimeout': 120000,
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 240000,
    connectionRetryCount: 3,
    services: [], // Start Appium manually in CI or use @wdio/appium-service
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 180000
    },
};
