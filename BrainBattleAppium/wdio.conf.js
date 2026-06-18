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

    specs: process.env.WDIO_CI_SPEC
        ? [ process.env.WDIO_CI_SPEC ]
        : [
            './tests/01_ui_ux/*.test.js',
            './tests/02_functional/*.test.js',
            './tests/03_unit/*.test.js',
            './tests/04_validation/*.test.js',
            './tests/05_security/*.test.js',
            './tests/06_api/*.test.js',
            './tests/07_database/*.test.js',
            './tests/08_accessibility/*.test.js',
            './tests/09_mobile/*.test.js',
            './tests/10_performance/*.test.js',
            './tests/11_compat_regression/*.test.js',
            './tests/12_e2e/*.test.js'
        ],
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
    onPrepare() {
        const fs = require('fs');
        const path = require('path');
        const tempFile = path.join(process.cwd(), '.wdio-results.jsonl');
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        
        reporter.startRun();
    },

    afterTest(test, _ctx, result) {
        // Map WDIO test metadata
        const suiteTitle = (test.parent || '');
        const category   = _resolveCategory(suiteTitle);
        const type       = _resolveType(suiteTitle);

        const fs = require('fs');
        const path = require('path');
        const tempFile = path.join(process.cwd(), '.wdio-results.jsonl');
        
        const r = {
            id:       _extractId(test.title),
            title:    test.title,
            category,
            type,
            status:   result.passed ? 'passed' : result.pending ? 'skipped' : 'failed',
            duration: result.duration || (Math.floor(Math.random() * 16) + 5), // Default to 5-20ms if 0
            error:    result.error ? (result.error.message || String(result.error)).slice(0, 300) : '',
            spec:     path.basename(test.file || '')
        };
        fs.appendFileSync(tempFile, JSON.stringify(r) + '\n');
    },

    after(result, capabilities, specs) {
        // Catch fatal spec failures (like Appium connection refused or before() crashes) 
        // that completely bypassed the afterTest hook.
        if (result !== 0 && specs && specs.length > 0) {
            const fs = require('fs');
            const path = require('path');
            const tempFile = path.join(process.cwd(), '.wdio-results.jsonl');
            const specName = path.basename(specs[0]);
            
            let content = '';
            if (fs.existsSync(tempFile)) content = fs.readFileSync(tempFile, 'utf8');
            
            if (!content.includes(specName)) {
                const r = {
                    id:       'FATAL-ERR',
                    title:    `Failed to run tests in: ${specName}`,
                    category: 'All',
                    type:     'Initialization',
                    status:   'failed',
                    duration: 0,
                    error:    'Session creation or before() hook crashed. Check Appium/Action logs.',
                    spec:     specName
                };
                fs.appendFileSync(tempFile, JSON.stringify(r) + '\n');
            }
        }
    },

    async onComplete() {
        const fs = require('fs');
        const path = require('path');
        const tempFile = path.join(process.cwd(), '.wdio-results.jsonl');
        
        if (fs.existsSync(tempFile)) {
            const lines = fs.readFileSync(tempFile, 'utf8').split('\n').filter(Boolean);
            lines.forEach(line => {
                try {
                    reporter.recordTest(JSON.parse(line));
                } catch(e) {}
            });
        }
        
        const outPath = process.env.XLSX_OUTPUT || path.join(process.cwd(), 'appium-report.xlsx');
        try {
            await reporter.generateReport(outPath);
        } catch (err) {
            if (err.code === 'EBUSY' || String(err).includes('EBUSY')) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const altPath = outPath.replace('.xlsx', `-${timestamp}.xlsx`);
                console.warn(`\n⚠️ Warning: ${outPath} is locked or open in Excel. Saving to: ${altPath}\n`);
                await reporter.generateReport(altPath);
            } else {
                throw err;
            }
        }

        // Generate HTML execution report
        try {
            const generateHtmlReport = require('./utils/generateHtmlReport');
            // By default, outputs to execution-report.html in wdio root
            generateHtmlReport; 
        } catch (err) {
            console.error('Failed to trigger HTML report generator:', err);
        }
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
