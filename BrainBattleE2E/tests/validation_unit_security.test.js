const { expect } = require('chai');
const { By, until, Key } = require('selenium-webdriver');
const { getDriver } = require('../utils/driverSetup');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173/brainbattlewebfrontend/';

describe('Validation & Security Suite (35 Tests)', function () {
  this.timeout(180000); // 3 minutes
  let driver;

  before(async function () {
    driver = await getDriver();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  describe('Form Validation - Empty Fields (5 Tests)', function () {
    it('TC-VAL-001 | Login with empty email and password', async function () {
      await driver.get(`${BASE_URL}/#/login`);
      const submitBtn = await driver.wait(until.elementLocated(By.id('login-btn')), 5000);
      await submitBtn.click();
      
      // Should not redirect
      await driver.sleep(500);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/login');
    });

    it('TC-VAL-002 | Login with empty email only', async function () {
      await driver.get(`${BASE_URL}/#/login`);
      const passField = await driver.wait(until.elementLocated(By.id('login-password')), 5000);
      const submitBtn = await driver.findElement(By.id('login-btn'));
      await passField.sendKeys('password123');
      await submitBtn.click();
      
      await driver.sleep(500);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/login');
    });

    it('TC-VAL-003 | Signup with all fields empty', async function () {
      await driver.get(`${BASE_URL}/#/signup`);
      const submitBtn = await driver.wait(until.elementLocated(By.id('signup-btn')), 5000);
      await submitBtn.click();
      
      await driver.sleep(500);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/signup');
    });

    it('TC-VAL-004 | Signup with missing username', async function () {
      await driver.get(`${BASE_URL}/#/signup`);
      const emailField = await driver.wait(until.elementLocated(By.id('signup-email')), 5000);
      const passField = await driver.findElement(By.id('signup-password'));
      const submitBtn = await driver.findElement(By.id('signup-btn'));
      
      await emailField.sendKeys('test@ex.com');
      await passField.sendKeys('pass');
      await submitBtn.click();
      
      await driver.sleep(500);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/signup');
    });

    it('TC-VAL-005 | Signup with missing password', async function () {
      await driver.get(`${BASE_URL}/#/signup`);
      const userField = await driver.wait(until.elementLocated(By.id('signup-username')), 5000);
      const emailField = await driver.findElement(By.id('signup-email'));
      const submitBtn = await driver.findElement(By.id('signup-btn'));
      
      await userField.sendKeys('user');
      await emailField.sendKeys('test@ex.com');
      await submitBtn.click();
      
      await driver.sleep(500);
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/signup');
    });
  });

  describe('Form Validation - Email Formatting (20 Tests)', function () {
    const invalidEmails = [
      'plainaddress', '#@%^%#$@#$@#.com', '@example.com', 'Joe Smith <email@example.com>',
      'email.example.com', 'email@example@example.com', '.email@example.com',
      'email.@example.com', 'email..email@example.com', 'email@example.com (Joe Smith)',
      'email@example', 'email@-example.com', 'email@example.web', 'email@111.222.333.44444',
      'email@example..com', 'Abc..123@example.com', '”(),:;<>[\\]@example.com',
      'just"not"right@example.com', 'this\\ is"really"not\\allowed@example.com', 'test@.com'
    ];

    invalidEmails.forEach((email, idx) => {
      it(`TC-VAL-0${idx+6} | Reject invalid email format: ${email}`, async function () {
        await driver.get(`${BASE_URL}/#/login`);
        const emailField = await driver.wait(until.elementLocated(By.id('login-email')), 5000);
        const passField = await driver.findElement(By.id('login-password'));
        const submitBtn = await driver.findElement(By.id('login-btn'));

        await emailField.sendKeys(email);
        await passField.sendKeys('Password123!');
        await submitBtn.click();

        // Browser should prevent default due to type="email" or backend rejects
        await driver.sleep(400);
        const url = await driver.getCurrentUrl();
        expect(url).to.include('#/login');
      });
    });
  });

  describe('Security Vulnerability Checks (10 Tests)', function () {
    const maliciousPayloads = [
      { name: 'Basic XSS', payload: '<script>alert(1)</script>' },
      { name: 'Img Onerror XSS', payload: '<img src=x onerror=alert(1)>' },
      { name: 'SVG XSS', payload: '<svg onload=alert(1)>' },
      { name: 'SQL Injection 1', payload: "' OR 1=1 --" },
      { name: 'SQL Injection 2', payload: "' OR 'a'='a" },
      { name: 'SQL Injection 3', payload: "admin' --" },
      { name: 'Command Injection 1', payload: "; ls -la" },
      { name: 'Command Injection 2', payload: "| whoami" },
      { name: 'Path Traversal', payload: "../../../../etc/passwd" },
      { name: 'NoSQL Injection', payload: '{"$gt": ""}' }
    ];

    maliciousPayloads.forEach((item, idx) => {
      it(`TC-SEC-00${idx+1} | Inject malicious payload into Login: ${item.name}`, async function () {
        await driver.get(`${BASE_URL}/#/login`);
        const emailField = await driver.wait(until.elementLocated(By.id('login-email')), 5000);
        const passField = await driver.findElement(By.id('login-password'));
        const submitBtn = await driver.findElement(By.id('login-btn'));

        await emailField.sendKeys(item.payload);
        await passField.sendKeys(item.payload);
        await submitBtn.click();

        await driver.sleep(500);

        // Check if an alert popped up (indicating XSS success)
        let alertPresent = false;
        try {
          const alert = await driver.switchTo().alert();
          await alert.dismiss();
          alertPresent = true;
        } catch (e) {
          // No alert is a good thing
        }

        expect(alertPresent).to.be.false;

        // Check that we didn't magically login via SQLi
        const url = await driver.getCurrentUrl();
        expect(url).to.not.include('#/home');
      });
    });
  });

});
