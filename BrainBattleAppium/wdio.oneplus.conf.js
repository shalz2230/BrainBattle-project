const { config } = require('./wdio.conf.js');

// Override capabilities for OnePlus LE2101
config.capabilities = [{
    platformName:                              'Android',
    'appium:deviceName':                       'OnePlus LE2101', // Explicitly targeting OnePlus LE2101
    'appium:udid':                             process.env.APPIUM_UDID || 'emulator-5554', // Script will provide the real UDID
    'appium:automationName':                   'UiAutomator2',
    'appium:app':                              config.capabilities[0]['appium:app'], // Inherit the APK path
    'appium:appPackage':                       'com.simats.brainbattle',
    'appium:appActivity':                      '.SplashActivity',
    'appium:noReset':                          true,
    'appium:fullReset':                        false,
    'appium:autoGrantPermissions':             true,
    'appium:ignoreHiddenApiPolicyError':       true,
    'appium:adbExecTimeout':                   120000,
    'appium:androidInstallTimeout':            120000,
    'appium:uiautomator2ServerInstallTimeout': 120000,
}];

// Override specs to ONLY run the specific OnePlus 300+ test cases
config.specs = [
    './tests/12_e2e/oneplus_300_auto.test.js'
];

exports.config = config;
