'use strict';
const path    = require('path');
const reporter = require('./utils/xlsxReporter');

// ── APK / device resolution ───────────────────────────────────────────
const apkPath = process.env.APPIUM_APP_PATH
    || path.join(process.cwd(), '../BrainBattle/app/build/outputs/apk/debug/app-debug.apk');
const deviceUdid = process.env.APPIUM_UDID || 'emulator-5554';

exports.config = {
    runner: 'local',
    port:   4723,

    specs: ['./tests/mega_android_1100.test.js'],
    exclude: [],

    maxInstances: 1,

    capabilities: [{
        platformName:                              'Android',
        'appium:deviceName':                       'Android Device',
        'appium:udid':                             deviceUdid,
        'appium:automationName':                   'UiAutomator2',
        'appium:app':                              apkPath,
        'appium:appPackage':                       'com.simats.brainbattle',
        'appium:appActivity':                      '.SplashActivity',
        'appium:noReset':                          true,
        'appium:fullReset':                        false,
        'appium:autoGrantPermissions':             true,
        'appium:ignoreHiddenApiPolicyError':       true,
        'appium:adbExecTimeout':                   120000,
        'appium:androidInstallTimeout':            120000,
        'appium:uiautomator2ServerInstallTimeout': 120000,
    }],

    logLevel:              'warn',   // keep CI logs clean
    bail:                  0,
    baseUrl:               'http://localhost',
    waitforTimeout:        15000,
    connectionRetryTimeout:240000,
    connectionRetryCount:  3,

    services: [],

    framework: 'mocha',
    reporters: ['spec'],

    mochaOpts: {
        ui:      'bdd',
        timeout: 300000,   // 5 min per test
    },

    // ── Lifecycle hooks ────────────────────────────────────────────
    before() {
        reporter.startRun();
    },

    afterTest(test, _ctx, result) {
        // Map WDIO test metadata → reporter record
        // Category & type are embedded in the suite title (e.g. "1. Functional Testing")
        const suiteTitle = (test.parent || '');
        const category   = _resolveCategory(suiteTitle);
        const type       = _resolveType(suiteTitle);

        reporter.recordTest({
            id:       _extractId(test.title),
            title:    test.title,
            category,
            type,
            status:   result.passed ? 'passed' : result.pending ? 'skipped' : 'failed',
            duration: result.duration || 0,
            error:    result.error ? (result.error.message || String(result.error)).slice(0, 300) : '',
        });
    },

    async after() {
        const outPath = process.env.XLSX_OUTPUT
            || path.join(process.cwd(), 'appium-report.xlsx');
        await reporter.generateReport(outPath);
    },
};

// ── Helpers ───────────────────────────────────────────────────────────
function _extractId(title) {
    const m = title.match(/TC-[A-Z0-9-]+/);
    return m ? m[0] : '';
}

function _resolveCategory(suiteTitle) {
    if (/functional/i.test(suiteTitle))     return 'Functionality';
    if (/ui.?ux|splash|login ui/i.test(suiteTitle)) return 'UI/UX';
    if (/valid|signup/i.test(suiteTitle))   return 'Validation';
    if (/security|vulnerab/i.test(suiteTitle)) return 'Vulnerability';
    if (/unit/i.test(suiteTitle))           return 'Unit Testing';
    if (/compat/i.test(suiteTitle))         return 'Compatibility';
    if (/performance|perf/i.test(suiteTitle)) return 'Performance';
    if (/api/i.test(suiteTitle))            return 'API';
    if (/database|db/i.test(suiteTitle))    return 'Database';
    if (/access/i.test(suiteTitle))         return 'Accessibility';
    if (/mobile/i.test(suiteTitle))         return 'Mobile-Specific';
    if (/regression|reg/i.test(suiteTitle)) return 'Regression';
    if (/e2e|end.to.end|auth|home|game|profile/i.test(suiteTitle)) return 'E2E';
    return suiteTitle || 'General';
}

function _resolveType(suiteTitle) {
    if (/functional/i.test(suiteTitle))     return 'Functionality Testing';
    if (/ui.?ux|splash|login ui/i.test(suiteTitle)) return 'UI/UX Testing';
    if (/valid|signup/i.test(suiteTitle))   return 'Validation Testing';
    if (/security|vulnerab/i.test(suiteTitle)) return 'Vulnerability Testing';
    if (/unit/i.test(suiteTitle))           return 'Unit Testing';
    if (/compat/i.test(suiteTitle))         return 'Compatibility Testing';
    if (/performance|perf/i.test(suiteTitle)) return 'Performance Testing';
    if (/api/i.test(suiteTitle))            return 'API Testing';
    if (/database|db/i.test(suiteTitle))    return 'Database Testing';
    if (/access/i.test(suiteTitle))         return 'Accessibility Testing';
    if (/mobile/i.test(suiteTitle))         return 'Mobile-Specific Testing';
    if (/regression|reg/i.test(suiteTitle)) return 'Regression Testing';
    return 'E2E Testing';
}
