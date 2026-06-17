const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const os = require('os');
const path = require('path');

async function getDriver() {
  const options = new chrome.Options();
  const isHeadless = process.env.SELENIUM_HEADLESS === 'true';
  const visualDelayMs = Number(process.env.SELENIUM_STEP_DELAY_MS || 0);
  const chromeBinary = process.env.CHROME_BIN || process.env.GOOGLE_CHROME_BIN;

  if (isHeadless) {
    options.addArguments('--headless=new');
  }

  if (chromeBinary) {
    options.setChromeBinaryPath(chromeBinary);
  }

  const userDataDir = path.join(os.tmpdir(), `brainbattle-chrome-${process.pid}-${Date.now()}`);
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-extensions');
  options.addArguments('--remote-debugging-port=0');
  options.addArguments(`--user-data-dir=${userDataDir}`);

  if (!isHeadless) {
    options.addArguments('--start-maximized');
  }

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  if (!isHeadless) {
    await driver.manage().window().maximize();
  }
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
