const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function getDriver() {
  const options = new chrome.Options();
  const isHeadless = process.env.SELENIUM_HEADLESS === 'true';
  const visualDelayMs = Number(process.env.SELENIUM_STEP_DELAY_MS || 0);

  if (isHeadless) {
    options.addArguments('--headless=new');
  }

  options.addArguments('--window-size=1920,1080');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--start-maximized');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().window().maximize();
  await driver.manage().setTimeouts({
    implicit: 5000,
    pageLoad: 30000,
    script: 30000
  });

  if (visualDelayMs > 0) {
    driver.visualDelayMs = visualDelayMs;
  }
  
  return driver;
}

async function pause(driver, ms) {
  const delay = ms ?? driver.visualDelayMs ?? 0;
  if (delay > 0) {
    await driver.sleep(delay);
  }
}

module.exports = { getDriver, pause };
