const { expect } = require('chai');
const { By, until, Key } = require('selenium-webdriver');
const { getDriver } = require('../utils/driverSetup');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173/brainbattlewebfrontend/';

// Unique test credentials
const testId = Date.now();
const testUsername = `player_${testId}`;
const testEmail = `test_${testId}@example.com`;
const testPassword = `SecretPass123!`;

describe('Authentication Suite', function () {
  this.timeout(120000);
  let driver;

  before(async function () {
    driver = await getDriver();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  describe('Splash Screen Navigation (2 Tests)', function () {
    it('TC-AUTH-001 | Should load the splash screen', async function () {
      await driver.get(`${BASE_URL}/#/`);
      const title = await driver.getTitle();
      expect(title).to.include('Brain Battle'); 
    });

    it('TC-AUTH-002 | Should auto-navigate to Login from Splash or allow manual nav', async function () {
      await driver.get(`${BASE_URL}/#/`);
      await driver.wait(until.urlContains('#/login'), 6000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/login');
    });
  });

  describe('Signup Functional Flow (1 Test)', function () {
    it('TC-AUTH-003 | Should successfully create a new account', async function () {
      await driver.get(`${BASE_URL}/#/signup`);
      
      const userField = await driver.wait(until.elementLocated(By.id('signup-username')), 5000);
      const emailField = await driver.findElement(By.id('signup-email'));
      const passField = await driver.findElement(By.id('signup-password'));
      const submitBtn = await driver.findElement(By.id('signup-btn'));

      await userField.sendKeys(testUsername);
      await emailField.sendKeys(testEmail);
      await passField.sendKeys(testPassword);
      await submitBtn.click();

      // Wait for success toast and redirection to login
      await driver.wait(until.urlContains('#/login'), 6000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/login');
    });
  });

  describe('Login Functional Flow (1 Test)', function () {
    it('TC-AUTH-004 | Should successfully login with the newly created account', async function () {
      await driver.get(`${BASE_URL}/#/login`);
      
      const emailField = await driver.wait(until.elementLocated(By.id('login-email')), 5000);
      const passField = await driver.findElement(By.id('login-password'));
      const submitBtn = await driver.findElement(By.id('login-btn'));

      await emailField.sendKeys(testEmail);
      await passField.sendKeys(testPassword);
      await submitBtn.click();

      // Verify we are redirected to the home/dashboard page
      await driver.wait(until.urlContains('#/home'), 6000);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/home');
    });
  });

  describe('Negative Login Scenarios (20 Tests)', function () {
    const invalidCredentials = Array.from({ length: 20 }, (_, i) => ({
      email: `wrong${i}@example.com`,
      pass: `pass${i}!`
    }));

    invalidCredentials.forEach((cred, i) => {
      it(`TC-AUTH-00${i+5} | Login fails with invalid credentials #${i+1}`, async function () {
        await driver.get(`${BASE_URL}/#/login`);
        
        const emailField = await driver.wait(until.elementLocated(By.id('login-email')), 5000);
        const passField = await driver.findElement(By.id('login-password'));
        const submitBtn = await driver.findElement(By.id('login-btn'));

        await emailField.sendKeys(cred.email);
        await passField.sendKeys(cred.pass);
        await submitBtn.click();

        // Wait to ensure we do not redirect
        await driver.sleep(500); 
        const url = await driver.getCurrentUrl();
        expect(url).to.not.include('#/home');
      });
    });
  });

  describe('Signup Boundary Checks (10 Tests)', function () {
    const boundaryInputs = Array.from({ length: 10 }, (_, i) => ({
      user: `user_b${i}`,
      email: `bound${i}@ex`, // Invalid emails
      pass: `p${i}`
    }));

    boundaryInputs.forEach((input, i) => {
      it(`TC-AUTH-0${i+25} | Signup boundary handling #${i+1}`, async function () {
        await driver.get(`${BASE_URL}/#/signup`);
        
        const userField = await driver.wait(until.elementLocated(By.id('signup-username')), 5000);
        const emailField = await driver.findElement(By.id('signup-email'));
        const passField = await driver.findElement(By.id('signup-password'));
        const submitBtn = await driver.findElement(By.id('signup-btn'));

        await userField.sendKeys(input.user);
        await emailField.sendKeys(input.email);
        await passField.sendKeys(input.pass);
        await submitBtn.click();

        // Ensure we don't redirect to login because inputs are bad or we expect error toast
        await driver.sleep(500); 
        const url = await driver.getCurrentUrl();
        expect(url).to.not.include('#/login');
      });
    });
  });
});
