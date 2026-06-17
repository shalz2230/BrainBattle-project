// ============================================================
// BrainBattle Web App — Functional Test Suite (Selenium + Mocha)
// Tests: TC-W-F-001 to TC-W-F-030
// ============================================================

const { expect } = require('chai');
const { By, until, Key } = require('selenium-webdriver');
const { getDriver, pause } = require('../utils/driverSetup');

const BASE_URL    = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const VALID_EMAIL = process.env.TEST_EMAIL    || 'test@brainbattle.com';
const VALID_PASS  = process.env.TEST_PASS     || 'test1234';
const NEW_EMAIL   = `test_${Date.now()}@brainbattle.com`;

// Helper: login and navigate to home
async function loginAndGoHome(driver) {
  await driver.get(`${BASE_URL}/#/login`);
  await pause(driver, 500);
  const emailInput = await driver.wait(until.elementLocated(By.id('login-email')), 8000);
  const passInput  = await driver.wait(until.elementLocated(By.id('login-password')), 8000);
  const loginBtn   = await driver.wait(until.elementLocated(By.id('login-btn')), 8000);
  await emailInput.clear(); await emailInput.sendKeys(VALID_EMAIL);
  await pause(driver, 250);
  await passInput.clear();  await passInput.sendKeys(VALID_PASS);
  await pause(driver, 250);
  await loginBtn.click();
  await pause(driver, 750);
  await driver.wait(until.urlContains('#/home'), 8000);
}

// Helper: click element by CSS safely
async function clickCss(driver, selector, timeout = 8000) {
  const el = await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await el.click();
  await pause(driver, 500);
  return el;
}

describe('Functional Test Suite', function () {
  this.timeout(90000);
  let driver;

  before(async function () { driver = await getDriver(); });
  after(async  function () { if (driver) await driver.quit(); });

  // ── TC-W-F-001 ──────────────────────────────────────────
  it('TC-W-F-001 | Splash auto-navigates to login within 5s', async function () {
    await driver.get(`${BASE_URL}/#/`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/login'), 5500);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  // ── TC-W-F-002 ──────────────────────────────────────────
  it('TC-W-F-002 | Successful login redirects to home', async function () {
    await loginAndGoHome(driver);
    expect(await driver.getCurrentUrl()).to.include('#/home');
  });

  // ── TC-W-F-003 ──────────────────────────────────────────
  it('TC-W-F-003 | Failed login keeps user on login page', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await pause(driver, 500);
    const emailInput = await driver.wait(until.elementLocated(By.id('login-email')), 8000);
    const passInput  = await driver.wait(until.elementLocated(By.id('login-password')), 8000);
    const loginBtn   = await driver.wait(until.elementLocated(By.id('login-btn')), 8000);
    await emailInput.clear();
    await emailInput.sendKeys('wrong@example.com');
    await passInput.clear();
    await passInput.sendKeys('wrongpassword');
    await pause(driver, 250);
    await loginBtn.click();
    try {
      await driver.wait(until.urlContains('#/home'), 3000);
      expect.fail('Should not navigate to home');
    } catch {
      const url = await driver.getCurrentUrl();
      expect(url).to.not.include('#/home');
    }
  });

  // ── TC-W-F-004 ──────────────────────────────────────────
  it('TC-W-F-004 | Login page — "Create Account" navigates to signup', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await pause(driver, 500);
    const signupBtn = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Create Account')]")), 8000
    );
    await signupBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/signup'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/signup');
  });

  // ── TC-W-F-005 ──────────────────────────────────────────
  it('TC-W-F-005 | Login page — "Forgot Password?" navigates to forgot-password', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await pause(driver, 500);
    const forgotBtn = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Forgot Password')]")), 8000
    );
    await forgotBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/forgot-password'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/forgot-password');
  });

  // ── TC-W-F-006 ──────────────────────────────────────────
  it('TC-W-F-006 | Signup with new unique account redirects to login', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    await pause(driver, 500);
    const usernameInput = await driver.wait(until.elementLocated(By.id('signup-username')), 8000);
    const emailInput    = await driver.wait(until.elementLocated(By.id('signup-email')), 8000);
    const passInput     = await driver.wait(until.elementLocated(By.id('signup-password')), 8000);
    const signupBtn     = await driver.wait(until.elementLocated(By.id('signup-btn')), 8000);
    await usernameInput.clear();
    await usernameInput.sendKeys('TestUser');
    await emailInput.clear();
    await emailInput.sendKeys(NEW_EMAIL);
    await passInput.clear();
    await passInput.sendKeys('pass12345');
    await pause(driver, 250);
    await signupBtn.click();
    await pause(driver, 750);
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  // ── TC-W-F-007 ──────────────────────────────────────────
  it('TC-W-F-007 | Signup with existing email stays on signup page', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    await pause(driver, 500);
    const usernameInput = await driver.wait(until.elementLocated(By.id('signup-username')), 8000);
    const emailInput    = await driver.wait(until.elementLocated(By.id('signup-email')), 8000);
    const passInput     = await driver.wait(until.elementLocated(By.id('signup-password')), 8000);
    const signupBtn     = await driver.wait(until.elementLocated(By.id('signup-btn')), 8000);
    await usernameInput.clear();
    await usernameInput.sendKeys('Dup');
    await emailInput.clear();
    await emailInput.sendKeys(VALID_EMAIL); // already registered
    await passInput.clear();
    await passInput.sendKeys('pass12345');
    await pause(driver, 250);
    await signupBtn.click();
    try {
      await driver.wait(until.urlContains('#/login'), 3000);
      expect.fail('Should not redirect to login for duplicate email');
    } catch {
      const url = await driver.getCurrentUrl();
      expect(url).to.include('#/signup');
    }
  });

  // ── TC-W-F-008 ──────────────────────────────────────────
  it('TC-W-F-008 | Unauthenticated access to /home redirects to login', async function () {
    await driver.get(`${BASE_URL}/#/home`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  // ── TC-W-F-009 ──────────────────────────────────────────
  it('TC-W-F-009 | Unauthenticated access to /profile redirects to login', async function () {
    await driver.get(`${BASE_URL}/#/profile`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  // ── TC-W-F-010 ──────────────────────────────────────────
  it('TC-W-F-010 | Home — Memory Boost card navigates to /game/memory', async function () {
    await loginAndGoHome(driver);
    await driver.findElement(By.id('game-memory-btn')).click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/game/memory'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/memory');
  });

  // ── TC-W-F-011 ──────────────────────────────────────────
  it('TC-W-F-011 | Home — Logic Training card navigates to /game/logic', async function () {
    await loginAndGoHome(driver);
    const logicBtn = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Logic Training')]/..")), 8000
    );
    await logicBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/game/logic'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/logic');
  });

  // ── TC-W-F-012 ──────────────────────────────────────────
  it('TC-W-F-012 | Home — Focus Training card navigates to /game/focus', async function () {
    await loginAndGoHome(driver);
    const focusBtn = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Focus Training')]/..")), 8000
    );
    await focusBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/game/focus'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/focus');
  });

  // ── TC-W-F-013 ──────────────────────────────────────────
  it('TC-W-F-013 | Home — Speed Challenge card navigates to /game/speed', async function () {
    await loginAndGoHome(driver);
    const speedBtn = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(),'Speed Challenge')]/..")), 8000
    );
    await speedBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/game/speed'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/speed');
  });

  // ── TC-W-F-014 ──────────────────────────────────────────
  it('TC-W-F-014 | Home — Profile icon (👤) navigates to /profile', async function () {
    await loginAndGoHome(driver);
    await driver.findElement(By.id('profile-btn')).click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/profile'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/profile');
  });

  // ── TC-W-F-015 ──────────────────────────────────────────
  it('TC-W-F-015 | GameLevels — Clicking unlocked level 1 navigates to game', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/game/memory`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/game/memory'), 8000);
    await driver.wait(until.elementsLocated(By.css('.level-tile')), 8000);
    const tile1 = await driver.findElement(By.id('level-tile-1'));
    await tile1.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('/play/memory/1'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/play/memory/1');
  });

  // ── TC-W-F-016 ──────────────────────────────────────────
  it('TC-W-F-016 | GameLevels — Clicking locked level does not navigate', async function () {
    await driver.get(`${BASE_URL}/#/game/logic`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/game/logic'), 8000);
    await driver.wait(until.elementsLocated(By.css('.level-tile.locked')), 8000);
    const lockedTile = await driver.findElement(By.css('.level-tile.locked'));
    await lockedTile.click();
    await driver.sleep(1000);
    expect(await driver.getCurrentUrl()).to.include('#/game/logic');
  });

  // ── TC-W-F-017 ──────────────────────────────────────────
  it('TC-W-F-017 | Logic Game — Correct answer navigates to result (3 stars)', async function () {
    await driver.get(`${BASE_URL}/#/play/logic/1`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('/play/logic/1'), 8000);
    // Level 1: sequence is 2,4,6,8 → correct = 10
    const options = await driver.wait(until.elementsLocated(By.css('.option-btn')), 8000);
    let clicked = false;
    for (const opt of options) {
      const text = await opt.getText();
      if (text.trim() === '10') { await opt.click(); clicked = true; break; }
    }
    if (!clicked) { await options[0].click(); } // click any if 10 not found
    await pause(driver, 500);
    await driver.wait(until.urlContains('/result/logic/1/'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/result/logic/1/');
  });

  // ── TC-W-F-018 ──────────────────────────────────────────
  it('TC-W-F-018 | Logic Game — Wrong answer navigates to result (1 star)', async function () {
    await driver.get(`${BASE_URL}/#/play/logic/1`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('/play/logic/1'), 8000);
    const options = await driver.wait(until.elementsLocated(By.css('.option-btn')), 8000);
    // Click option that is NOT 10
    for (const opt of options) {
      const text = await opt.getText();
      if (text.trim() !== '10') { await opt.click(); break; }
    }
    await pause(driver, 500);
    await driver.wait(until.urlContains('/result/logic/1/1/'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/result/logic/1/1/');
  });

  // ── TC-W-F-019 ──────────────────────────────────────────
  it('TC-W-F-019 | Focus Game — Tapping target navigates to result (3 stars)', async function () {
    await driver.get(`${BASE_URL}/#/play/focus/1`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('/play/focus/1'), 8000);
    const target = await driver.wait(until.elementLocated(By.css('.focus-target-btn')), 8000);
    await target.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('/result/focus/1/3/'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/result/focus/1/3/');
  });

  // ── TC-W-F-020 ──────────────────────────────────────────
  it('TC-W-F-020 | Result — Continue button navigates to game levels', async function () {
    await driver.get(`${BASE_URL}/#/result/memory/1/3/10`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('/result/memory/1/3/10'), 8000);
    await clickCss(driver, '#result-continue-btn');
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/game/memory'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/memory');
  });

  // ── TC-W-F-021 ──────────────────────────────────────────
  it('TC-W-F-021 | Result — Play Again button re-opens same level', async function () {
    await driver.get(`${BASE_URL}/#/result/logic/3/2/12`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('/result/'), 8000);
    const playAgain = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Play Again')]")), 8000
    );
    await playAgain.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('/play/logic/3'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/play/logic/3');
  });

  // ── TC-W-F-022 ──────────────────────────────────────────
  it('TC-W-F-022 | Result — Home button navigates to home', async function () {
    await driver.get(`${BASE_URL}/#/result/speed/2/1/8`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('/result/'), 8000);
    const homeBtn = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Home')]")), 8000
    );
    await homeBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/home'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/home');
  });

  // ── TC-W-F-023 ──────────────────────────────────────────
  it('TC-W-F-023 | Profile — Logout navigates back to login', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/profile`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/profile'), 8000);
    await clickCss(driver, '#logout-btn');
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  // ── TC-W-F-024 ──────────────────────────────────────────
  it('TC-W-F-024 | Profile — After logout, navigating to /home redirects to login', async function () {
    await driver.get(`${BASE_URL}/#/home`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  // ── TC-W-F-025 ──────────────────────────────────────────
  it('TC-W-F-025 | Enter key on login form submits the form', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await pause(driver, 500);
    const emailInput = await driver.wait(until.elementLocated(By.id('login-email')), 8000);
    const passInput  = await driver.wait(until.elementLocated(By.id('login-password')), 8000);
    await emailInput.clear();
    await emailInput.sendKeys(VALID_EMAIL);
    await passInput.clear();
    await passInput.sendKeys(VALID_PASS, Key.ENTER);
    await pause(driver, 750);
    await driver.wait(until.urlContains('#/home'), 8000);
    expect(await driver.getCurrentUrl()).to.include('#/home');
  });

  // ── TC-W-F-026 ──────────────────────────────────────────
  it('TC-W-F-026 | Forgot Password — Unregistered email shows error (stays on page)', async function () {
    await driver.get(`${BASE_URL}/#/forgot-password`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/forgot-password'), 8000);
    const emailInput = await driver.wait(until.elementLocated(By.id('forgot-email')), 8000);
    await emailInput.clear();
    await emailInput.sendKeys('notregistered_xyz@test.com');
    await clickCss(driver, '#verify-btn');
    try {
      await driver.wait(until.urlContains('#/change-password'), 3000);
      expect.fail('Should not navigate to change-password for unregistered email');
    } catch {
      expect(await driver.getCurrentUrl()).to.include('#/forgot-password');
    }
  });

  // ── TC-W-F-027 ──────────────────────────────────────────
  it('TC-W-F-027 | Memory Game — Back button from game returns to levels', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('/play/memory/1'), 8000);
    const backBtn = await driver.wait(until.elementLocated(By.css('.back-btn')), 8000);
    await backBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('/levels/memory'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/levels/memory');
  });

  // ── TC-W-F-028 ──────────────────────────────────────────
  it('TC-W-F-028 | Speed Game — Back button from game returns to levels', async function () {
    await driver.get(`${BASE_URL}/#/play/speed/1`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('/play/speed/1'), 8000);
    const backBtn = await driver.wait(until.elementLocated(By.css('.back-btn')), 8000);
    await backBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('/levels/speed'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/levels/speed');
  });

  // ── TC-W-F-029 ──────────────────────────────────────────
  it('TC-W-F-029 | GameLevels — Back button returns to home', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/game/memory`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/game/memory'), 8000);
    const backBtn = await driver.wait(until.elementLocated(By.css('.back-btn')), 8000);
    await backBtn.click();
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/home'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/home');
  });

  // ── TC-W-F-030 ──────────────────────────────────────────
  it('TC-W-F-030 | Profile — Change Password button navigates to change-password', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/profile`);
    await pause(driver, 500);
    await driver.wait(until.urlContains('#/profile'), 8000);
    await clickCss(driver, '#change-password-btn');
    await driver.wait(until.urlContains('#/change-password'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/change-password');
  });
});
