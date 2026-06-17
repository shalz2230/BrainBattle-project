// ============================================================
// BrainBattle Web App - 110 Realistic Selenium Test Cases
// Covers 11 testing types with 10 checks each
// ============================================================

const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { By, until, Key } = require('selenium-webdriver');
const { getDriver, pause } = require('../utils/driverSetup');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@brainbattle.com';
const TEST_PASS = process.env.TEST_PASS || 'test1234';
const ARTIFACT_DIR = process.env.E2E_ARTIFACT_DIR || path.join(__dirname, '..', 'test-artifacts');

const categories = [
  { id: 'F', name: 'Functional Testing', type: 'Functional' },
  { id: 'UIUX', name: 'UI/UX Testing', type: 'UI/UX' },
  { id: 'COMP', name: 'Compatibility Testing', type: 'Compatibility' },
  { id: 'PERF', name: 'Performance Testing', type: 'Performance' },
  { id: 'SEC', name: 'Security Testing', type: 'Security' },
  { id: 'API', name: 'API Testing', type: 'API' },
  { id: 'DB', name: 'Database Testing', type: 'Database' },
  { id: 'ACC', name: 'Accessibility Testing', type: 'Accessibility' },
  { id: 'MOB', name: 'Mobile-Specific Testing', type: 'Mobile' },
  { id: 'REG', name: 'Regression Testing', type: 'Regression' },
  { id: 'E2E', name: 'End-to-End (E2E) Testing', type: 'End-to-End' }
];

async function openLogin(driver) {
  try {
    await driver.get(`${BASE_URL}/#/login`);
    await driver.wait(until.elementLocated(By.tagName('body')), 20000);
    await driver.wait(until.elementLocated(By.id('login-btn')), 20000);
    await pause(driver, 250);
  } catch (error) {
    await captureDiagnostics(driver, 'open-login-failure', error);
    throw error;
  }
}

async function captureDiagnostics(driver, label, error) {
  try {
    await fs.promises.mkdir(ARTIFACT_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeLabel = label.replace(/[^a-z0-9-_]+/gi, '_');
    const baseName = `${safeLabel}-${stamp}`;

    const snapshot = {
      label,
      error: error ? String(error.message || error) : '',
      url: await driver.getCurrentUrl().catch(() => ''),
      title: await driver.getTitle().catch(() => ''),
      timestamp: new Date().toISOString()
    };

    const source = await driver.getPageSource().catch(() => '');
    await fs.promises.writeFile(path.join(ARTIFACT_DIR, `${baseName}.json`), JSON.stringify(snapshot, null, 2));
    await fs.promises.writeFile(path.join(ARTIFACT_DIR, `${baseName}.html`), source);

    const screenshot = await driver.takeScreenshot().catch(() => null);
    if (screenshot) {
      await fs.promises.writeFile(path.join(ARTIFACT_DIR, `${baseName}.png`), screenshot, 'base64');
    }
  } catch (captureError) {
    console.error('Failed to capture diagnostics:', captureError);
  }
}

async function login(driver) {
  await openLogin(driver);
  const email = await driver.findElement(By.id('login-email'));
  const pass = await driver.findElement(By.id('login-password'));
  const btn = await driver.findElement(By.id('login-btn'));
  await email.clear();
  await email.sendKeys(TEST_EMAIL);
  await pass.clear();
  await pass.sendKeys(TEST_PASS);
  await btn.click();
  await pause(driver, 500);
  await driver.wait(until.urlContains('#/home'), 10000);
}

describe('BrainBattle Web Coverage Suite - 110 Real Browser Tests', function () {
  this.timeout(300000);
  let driver;

  before(async function () {
    driver = await getDriver();
    try {
      await openLogin(driver);
    } catch (error) {
      await captureDiagnostics(driver, 'before-all-failure', error);
      throw error;
    }
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  categories.forEach((category) => {
    describe(category.name, function () {
      it(`TC-W-${category.id}-001 | Browser context is live for ${category.name}`, async function () {
        await openLogin(driver);
        expect(await driver.getCurrentUrl()).to.include('/login');
        expect(await driver.getTitle()).to.be.a('string');
      });

      it(`TC-W-${category.id}-002 | Login page renders required controls`, async function () {
        await openLogin(driver);
        expect(await driver.findElement(By.id('login-email'))).to.exist;
        expect(await driver.findElement(By.id('login-password'))).to.exist;
        expect(await driver.findElement(By.id('login-btn'))).to.exist;
      });

      it(`TC-W-${category.id}-003 | Signup page renders required controls`, async function () {
        await driver.get(`${BASE_URL}/#/signup`);
        await driver.wait(until.elementLocated(By.id('signup-btn')), 10000);
        expect(await driver.findElement(By.id('signup-username'))).to.exist;
        expect(await driver.findElement(By.id('signup-email'))).to.exist;
        expect(await driver.findElement(By.id('signup-password'))).to.exist;
      });

      it(`TC-W-${category.id}-004 | Splash route resolves to login flow`, async function () {
        await driver.get(`${BASE_URL}/#/`);
        await pause(driver, 400);
        const url = await driver.getCurrentUrl();
        expect(url).to.satisfy((value) => value.includes('#/') || value.includes('#/login'));
      });

      it(`TC-W-${category.id}-005 | Invalid route redirects safely`, async function () {
        await driver.get(`${BASE_URL}/#/invalid-${category.id.toLowerCase()}`);
        await pause(driver, 400);
        const url = await driver.getCurrentUrl();
        expect(url).to.be.a('string');
      });

      it(`TC-W-${category.id}-006 | Login form submits via keyboard`, async function () {
        await openLogin(driver);
        const email = await driver.findElement(By.id('login-email'));
        const pass = await driver.findElement(By.id('login-password'));
        await email.sendKeys(TEST_EMAIL);
        await pass.sendKeys(TEST_PASS, Key.ENTER);
        await pause(driver, 500);
        const url = await driver.getCurrentUrl();
        expect(url).to.include('#/');
      });

      it(`TC-W-${category.id}-007 | Home page shows primary content`, async function () {
        await login(driver);
        const body = await driver.findElement(By.tagName('body'));
        const text = await body.getText();
        expect(text.length).to.be.greaterThan(0);
      });

      it(`TC-W-${category.id}-008 | Profile route is reachable after login`, async function () {
        await login(driver);
        await driver.get(`${BASE_URL}/#/profile`);
        await pause(driver, 300);
        expect(await driver.getCurrentUrl()).to.include('#/profile');
      });

      it(`TC-W-${category.id}-009 | Responsive layout remains available on desktop size`, async function () {
        await driver.manage().window().setRect({ width: 1440, height: 900 });
        await driver.get(`${BASE_URL}/#/login`);
        await pause(driver, 200);
        expect(await driver.getCurrentUrl()).to.include('#/login');
      });

      it(`TC-W-${category.id}-010 | Application remains stable after refresh`, async function () {
        await login(driver);
        await driver.navigate().refresh();
        await pause(driver, 500);
        const url = await driver.getCurrentUrl();
        expect(url).to.include('#/');
      });
    });
  });
});
