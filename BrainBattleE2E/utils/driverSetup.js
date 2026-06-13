const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function getDriver() {
  const options = new chrome.Options();
  // Using headless mode for CI/CD compatibility
  options.addArguments('--headless=new');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Set default implicit wait
  await driver.manage().setTimeouts({ implicit: 5000 });
  
  return driver;
}

module.exports = { getDriver };
