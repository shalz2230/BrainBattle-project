const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const { getDriver } = require('../utils/driverSetup');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';

describe('Navigation & Profile Suite', function () {
  this.timeout(60000);
  let driver;

  before(async function () {
    driver = await getDriver();
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  describe('Core Navigation Checks', function () {
    const routes = [
      { name: 'Home', path: '/home' },
      { name: 'Profile', path: '/profile' },
      { name: 'Forgot Password', path: '/forgot-password' },
      { name: 'Change Password', path: '/change-password' }
    ];

    routes.forEach(route => {
      it(`Should navigate to ${route.name} route without crashing`, async function () {
        await driver.get(`${BASE_URL}${route.path}`);
        await driver.wait(until.urlContains(route.path), 5000);
        const url = await driver.getCurrentUrl();
        expect(url).to.include(route.path);
      });
    });

    // Generate 10 edge case navigation tests
    for (let i = 1; i <= 10; i++) {
      it(`Should handle invalid deep link boundary test #${i}`, async function () {
        const invalidRoute = `/invalid-route-${i}`;
        await driver.get(`${BASE_URL}${invalidRoute}`);
        // Based on App.jsx: <Route path="*" element={<Navigate to="/" replace />} />
        // It should redirect to splash
        await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
        const url = await driver.getCurrentUrl();
        expect(url).to.equal(`${BASE_URL}/`);
      });
    }
  });
});
