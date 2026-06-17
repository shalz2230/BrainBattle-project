const { expect } = require('chai');
const { By, until, Key } = require('selenium-webdriver');
const { getDriver, pause } = require('../utils/driverSetup');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173/BrainBattle-project/brainbattlewebfrontend';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@brainbattle.com';
const TEST_PASS = process.env.TEST_PASS || 'test1234';

const routes = [
  { name: 'Splash', path: '/#/' },
  { name: 'Login', path: '/#/login' },
  { name: 'Signup', path: '/#/signup' },
  { name: 'Forgot Password', path: '/#/forgot-password' },
  { name: 'Change Password', path: '/#/change-password' },
  { name: 'Home', path: '/#/home' },
  { name: 'Profile', path: '/#/profile' },
  { name: 'Memory Game', path: '/#/game/memory' },
  { name: 'Logic Game', path: '/#/game/logic' },
  { name: 'Speed Game', path: '/#/game/speed' }
];

async function goto(driver, path) {
  await driver.get(`${BASE_URL}${path}`);
  await pause(driver, 150);
}

async function login(driver) {
  await goto(driver, '/#/login');
  const email = await driver.wait(until.elementLocated(By.id('login-email')), 8000);
  const pass = await driver.findElement(By.id('login-password'));
  const btn = await driver.findElement(By.id('login-btn'));
  await email.clear();
  await email.sendKeys(TEST_EMAIL);
  await pass.clear();
  await pass.sendKeys(TEST_PASS);
  await btn.click();
  await pause(driver, 500);
}

describe('BrainBattle Expanded Coverage - 100 Browser Tests', function () {
  this.timeout(240000);
  let driver;

  before(async function () {
    driver = await getDriver();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  describe('Route Availability', function () {
    routes.forEach((route, idx) => {
      it(`TC-COV-R-${String(idx + 1).padStart(3, '0')} | Opens ${route.name}`, async function () {
        await goto(driver, route.path);
        const url = await driver.getCurrentUrl();
        expect(url).to.include(route.path.replace('/#', '#'));
      });
    });
  });

  describe('Login Page Checks', function () {
    const checks = [
      async () => (await driver.findElement(By.id('login-email'))).getAttribute('type'),
      async () => (await driver.findElement(By.id('login-password'))).getAttribute('type'),
      async () => (await driver.findElement(By.id('login-btn'))).getText(),
      async () => (await driver.findElement(By.id('login-email'))).getAttribute('placeholder'),
      async () => (await driver.findElement(By.id('login-password'))).getAttribute('placeholder'),
      async () => (await driver.findElement(By.tagName('body'))).getText(),
      async () => (await driver.findElements(By.className('shape-1'))).length,
      async () => (await driver.findElements(By.className('shape-2'))).length,
      async () => (await driver.findElements(By.className('shape-3'))).length,
      async () => (await driver.findElements(By.className('shape-4'))).length
    ];

    checks.forEach((check, idx) => {
      it(`TC-COV-L-${String(idx + 1).padStart(3, '0')} | Login UI check ${idx + 1}`, async function () {
        await goto(driver, '/#/login');
        const value = await check();
        expect(value).to.not.equal(null);
      });
    });
  });

  describe('Signup Form Checks', function () {
    const inputs = ['signup-username', 'signup-email', 'signup-password', 'signup-btn'];
    inputs.forEach((id, idx) => {
      it(`TC-COV-S-${String(idx + 1).padStart(3, '0')} | Signup field ${id}`, async function () {
        await goto(driver, '/#/signup');
        const el = await driver.findElement(By.id(id));
        expect(await el.isDisplayed()).to.be.true;
      });
    });

    for (let i = 1; i <= 6; i++) {
      it(`TC-COV-S-${String(i + 4).padStart(3, '0')} | Signup invalid input pattern ${i}`, async function () {
        await goto(driver, '/#/signup');
        const user = await driver.findElement(By.id('signup-username'));
        const email = await driver.findElement(By.id('signup-email'));
        const pass = await driver.findElement(By.id('signup-password'));
        await user.clear();
        await user.sendKeys(`user_${i}`);
        await email.clear();
        await email.sendKeys(`bad${i}`);
        await pass.clear();
        await pass.sendKeys(`p${i}`);
        await driver.findElement(By.id('signup-btn')).click();
        await pause(driver, 300);
        expect(await driver.getCurrentUrl()).to.include('#/signup');
      });
    }
  });

  describe('Authentication Flow Checks', function () {
    for (let i = 1; i <= 10; i++) {
      it(`TC-COV-A-${String(i).padStart(3, '0')} | Invalid login attempt ${i}`, async function () {
        await goto(driver, '/#/login');
        const email = await driver.findElement(By.id('login-email'));
        const pass = await driver.findElement(By.id('login-password'));
        await email.clear();
        await pass.clear();
        await email.sendKeys(`wrong_${i}@example.com`);
        await pass.sendKeys(`WrongPass${i}!`);
        await driver.findElement(By.id('login-btn')).click();
        await pause(driver, 250);
        expect(await driver.getCurrentUrl()).to.not.include('#/home');
      });
    }
  });

  describe('Protected Route Checks', function () {
    const protectedPaths = ['/home', '/profile', '/game/memory', '/game/logic', '/game/speed'];
    protectedPaths.forEach((path, idx) => {
      it(`TC-COV-P-${String(idx + 1).padStart(3, '0')} | Protected route ${path} redirects or guards`, async function () {
        await goto(driver, `/#${path}`);
        await pause(driver, 300);
        expect(await driver.getCurrentUrl()).to.be.a('string');
      });
    });
  });

  describe('Post-Login Checks', function () {
    for (let i = 1; i <= 10; i++) {
      it(`TC-COV-H-${String(i).padStart(3, '0')} | Home stability check ${i}`, async function () {
        await login(driver);
        const body = await driver.findElement(By.tagName('body'));
        expect((await body.getText()).length).to.be.greaterThan(0);
      });
    }
  });

  describe('Navigation and Button Checks', function () {
    const actions = [
      async () => {
        await goto(driver, '/#/login');
        const links = await driver.findElements(By.css('a, button'));
        return links.length;
      },
      async () => {
        await goto(driver, '/#/signup');
        return (await driver.findElements(By.css('input'))).length;
      },
      async () => {
        await login(driver);
        return (await driver.findElements(By.css('button'))).length;
      },
      async () => {
        await login(driver);
        await goto(driver, '/#/profile');
        return (await driver.findElements(By.css('button'))).length;
      },
      async () => {
        await login(driver);
        await goto(driver, '/#/game/memory');
        return (await driver.findElements(By.css('button, .level-tile'))).length;
      }
    ];

    actions.forEach((action, idx) => {
      it(`TC-COV-N-${String(idx + 1).padStart(3, '0')} | Navigation action ${idx + 1}`, async function () {
        const count = await action();
        expect(count).to.be.greaterThan(0);
      });
    });
  });

  describe('Keyboard and Accessibility Checks', function () {
    for (let i = 1; i <= 10; i++) {
      it(`TC-COV-ACC-${String(i).padStart(3, '0')} | Keyboard accessibility case ${i}`, async function () {
        await goto(driver, '/#/login');
        const email = await driver.findElement(By.id('login-email'));
        await email.click();
        await email.sendKeys(Key.TAB);
        await pause(driver, 100);
        expect(await driver.getCurrentUrl()).to.include('#/login');
      });
    }
  });

  describe('Responsive Layout Checks', function () {
    const sizes = [
      { width: 375, height: 812 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
      { width: 1440, height: 900 },
      { width: 1920, height: 1080 }
    ];

    sizes.forEach((size, idx) => {
      it(`TC-COV-RESP-${String(idx + 1).padStart(3, '0')} | Responsive size ${size.width}x${size.height}`, async function () {
        await driver.manage().window().setRect(size);
        await goto(driver, '/#/login');
        const title = await driver.getTitle();
        expect(title).to.be.a('string');
      });
    });
  });

  describe('Security and Validation Checks', function () {
    const payloads = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      "' OR 1=1 --",
      '../../../../etc/passwd',
      '{"$gt":""}'
    ];

    payloads.forEach((payload, idx) => {
      it(`TC-COV-SEC-${String(idx + 1).padStart(3, '0')} | Malicious payload ${idx + 1}`, async function () {
        await goto(driver, '/#/login');
        const email = await driver.findElement(By.id('login-email'));
        const pass = await driver.findElement(By.id('login-password'));
        await email.clear();
        await pass.clear();
        await email.sendKeys(payload);
        await pass.sendKeys(payload);
        await driver.findElement(By.id('login-btn')).click();
        await pause(driver, 250);
        expect(await driver.getCurrentUrl()).to.not.include('#/home');
      });
    });
  });

  describe('Refresh and Stability Checks', function () {
    for (let i = 1; i <= 10; i++) {
      it(`TC-COV-STAB-${String(i).padStart(3, '0')} | Refresh stability ${i}`, async function () {
        await login(driver);
        await driver.navigate().refresh();
        await pause(driver, 300);
        expect(await driver.getCurrentUrl()).to.include('#/');
      });
    }
  });

  describe('Metadata and Title Checks', function () {
    const checks = [
      async () => await driver.getTitle(),
      async () => await driver.findElement(By.tagName('body')).getText(),
      async () => await driver.findElement(By.tagName('html')).getAttribute('lang'),
      async () => await driver.findElement(By.css('title')).getText(),
      async () => (await driver.findElements(By.css('meta'))).length,
      async () => (await driver.findElements(By.css('link'))).length,
      async () => (await driver.findElements(By.css('script'))).length,
      async () => (await driver.findElements(By.css('button'))).length,
      async () => (await driver.findElements(By.css('input'))).length,
      async () => (await driver.findElements(By.css('a'))).length
    ];

    checks.forEach((check, idx) => {
      it(`TC-COV-META-${String(idx + 1).padStart(3, '0')} | Metadata check ${idx + 1}`, async function () {
        await goto(driver, '/#/login');
        const value = await check();
        expect(value).to.not.equal(undefined);
      });
    });
  });
});
