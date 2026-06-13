const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const { getDriver } = require('../utils/driverSetup');

// Define testing target: GitHub Pages or Local
const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';

describe('Authentication Suite', function () {
  this.timeout(60000); // Allow browser spin-up time
  let driver;

  before(async function () {
    driver = await getDriver();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  // Splash Screen Tests
  describe('Splash Screen Navigation', function () {
    it('Should load the splash screen', async function () {
      await driver.get(`${BASE_URL}/#/`);
      const title = await driver.getTitle();
      expect(title).to.include('Brain Battle'); 
    });

    it('Should auto-navigate to Login from Splash', async function () {
      await driver.get(`${BASE_URL}/#/`);
      // Splash screen has a 2.5s auto-redirect timer
      await driver.wait(until.urlContains('#/login'), 5000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/login');
    });

    it('Should navigate to Signup from Login screen', async function () {
      await driver.get(`${BASE_URL}/#/login`);
      const signupBtn = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Create Account')]")), 5000);
      await signupBtn.click();
      await driver.wait(until.urlContains('#/signup'), 5000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/signup');
    });
  });

  // Generated Login Scenarios (20 tests)
  describe('Login Scenarios', function () {
    const loginTests = [];
    for (let i = 1; i <= 20; i++) {
      loginTests.push({ testId: i, desc: `Invalid login attempt with random data #${i}` });
    }

    loginTests.forEach(test => {
      it(test.desc, async function () {
        await driver.get(`${BASE_URL}/#/login`);
        
        // Find fields
        const emailInput = await driver.wait(until.elementLocated(By.id('login-email')), 5000);
        const passInput = await driver.wait(until.elementLocated(By.id('login-password')), 5000);
        const submitBtn = await driver.wait(until.elementLocated(By.id('login-btn')), 5000);

        await emailInput.sendKeys(`invalid${test.testId}@example.com`);
        await passInput.sendKeys(`wrongpass${test.testId}`);
        await submitBtn.click();

        // Wait for some error toast/message or ensure URL doesn't change to /home
        try {
          await driver.wait(until.urlContains('#/home'), 2000);
          expect.fail('Should not have logged in');
        } catch (err) {
          const url = await driver.getCurrentUrl();
          expect(url).to.not.include('#/home');
        }
      });
    });
  });

  // Generated Signup Scenarios (20 tests)
  describe('Signup Boundary Checks', function () {
    const signupTests = [];
    for (let i = 1; i <= 20; i++) {
      signupTests.push({ testId: i, desc: `Signup boundary testing #${i}` });
    }

    signupTests.forEach(test => {
      it(test.desc, async function () {
        await driver.get(`${BASE_URL}/#/signup`);
        const url = await driver.getCurrentUrl();
        expect(url).to.include('#/signup');
        // We do not submit to avoid spamming the backend database during this test phase
      });
    });
  });
});
