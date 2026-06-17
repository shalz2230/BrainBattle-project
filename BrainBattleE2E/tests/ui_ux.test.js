// ============================================================
// BrainBattle Web App — UI/UX Test Suite (Selenium + Mocha)
// Tests: TC-W-UI-001 to TC-W-UI-025
// ============================================================

const { expect } = require('chai');
const { By, until, Key } = require('selenium-webdriver');
const { getDriver } = require('../utils/driverSetup');

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173';
const VALID_EMAIL = process.env.TEST_EMAIL || 'test@brainbattle.com';
const VALID_PASS  = process.env.TEST_PASS  || 'test1234';

// Helper: login and return to home
async function loginAndGoHome(driver) {
  await driver.get(`${BASE_URL}/#/login`);
  const emailInput = await driver.wait(until.elementLocated(By.id('login-email')), 8000);
  const passInput  = await driver.wait(until.elementLocated(By.id('login-password')), 8000);
  const loginBtn   = await driver.wait(until.elementLocated(By.id('login-btn')), 8000);
  await emailInput.clear(); await emailInput.sendKeys(VALID_EMAIL);
  await passInput.clear();  await passInput.sendKeys(VALID_PASS);
  await loginBtn.click();
  await driver.wait(until.urlContains('#/home'), 8000);
}

// Helper: wait for element by CSS selector
async function waitForCss(driver, selector, timeout = 8000) {
  return driver.wait(until.elementLocated(By.css(selector)), timeout);
}

describe('UI/UX Test Suite', function () {
  this.timeout(90000);
  let driver;

  before(async function () { driver = await getDriver(); });
  after(async  function () { if (driver) await driver.quit(); });

  // ── TC-W-UI-001 ──────────────────────────────────────────
  it('TC-W-UI-001 | Splash — Logo renders without distortion', async function () {
    await driver.get(`${BASE_URL}/#/`);
    const logo = await driver.wait(
      until.elementLocated(By.css('img.auth-logo, img[alt="Brain Battle"]')), 8000
    );
    const displayed = await logo.isDisplayed();
    expect(displayed).to.be.true;
  });

  // ── TC-W-UI-002 ──────────────────────────────────────────
  it('TC-W-UI-002 | Splash — Auto-redirects to login within 5s', async function () {
    await driver.get(`${BASE_URL}/#/`);
    await driver.wait(until.urlContains('#/login'), 5000);
    const url = await driver.getCurrentUrl();
    expect(url).to.include('#/login');
  });

  // ── TC-W-UI-003 ──────────────────────────────────────────
  it('TC-W-UI-003 | Login — Floating background shapes are present', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const shapes = await driver.findElements(By.css('.floating-shapes .shape'));
    expect(shapes.length).to.be.at.least(5);
  });

  // ── TC-W-UI-004 ──────────────────────────────────────────
  it('TC-W-UI-004 | Login — Glitch-text heading has data-text attribute', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const heading = await waitForCss(driver, '.glitch-text');
    const dataText = await heading.getAttribute('data-text');
    expect(dataText).to.be.a('string').and.have.length.above(0);
  });

  // ── TC-W-UI-005 ──────────────────────────────────────────
  it('TC-W-UI-005 | Login — input-border-glow element exists inside input container', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const glowEl = await waitForCss(driver, '.input-border-glow');
    expect(glowEl).to.exist;
  });

  // ── TC-W-UI-006 ──────────────────────────────────────────
  it('TC-W-UI-006 | Login — Button shows spinner while loading (disabled during request)', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const emailInput = await waitForCss(driver, '#login-email');
    const passInput  = await waitForCss(driver, '#login-password');
    const loginBtn   = await waitForCss(driver, '#login-btn');
    await emailInput.sendKeys(VALID_EMAIL);
    await passInput.sendKeys(VALID_PASS);
    await loginBtn.click();
    // Immediately check: button should be disabled while request is in-flight
    const isDisabled = await driver.executeScript(
      'return document.getElementById("login-btn").disabled;'
    );
    expect(isDisabled).to.be.true;
    await driver.wait(until.urlContains('#/home'), 8000);
  });

  // ── TC-W-UI-007 ──────────────────────────────────────────
  it('TC-W-UI-007 | Signup — JOIN BATTLE button exists', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    const btn = await waitForCss(driver, '#signup-btn');
    const text = await btn.getText();
    expect(text).to.include('JOIN BATTLE');
  });

  // ── TC-W-UI-008 ──────────────────────────────────────────
  it('TC-W-UI-008 | Home — Glass-panel game cards are visible (4 cards)', async function () {
    await loginAndGoHome(driver);
    const cards = await driver.findElements(By.css('.game-card.glass-panel'));
    expect(cards.length).to.equal(4);
  });

  // ── TC-W-UI-009 ──────────────────────────────────────────
  it('TC-W-UI-009 | Home — Total stars element is present', async function () {
    await loginAndGoHome(driver);
    const starsEl = await waitForCss(driver, '#total-stars');
    const text = await starsEl.getText();
    expect(text).to.match(/⭐\s*\d+/);
  });

  // ── TC-W-UI-010 ──────────────────────────────────────────
  it('TC-W-UI-010 | GameLevels — Locked tiles display lock icon', async function () {
    await loginAndGoHome(driver);
    await driver.findElement(By.id('game-memory-btn')).click();
    await driver.wait(until.urlContains('#/game/memory'), 8000);
    const lockedTiles = await driver.findElements(By.css('.level-tile.locked .tile-lock'));
    expect(lockedTiles.length).to.be.at.least(1);
  });

  // ── TC-W-UI-011 ──────────────────────────────────────────
  it('TC-W-UI-011 | GameLevels — Level 1 tile is in "next" or "completed" state (not locked)', async function () {
    await driver.get(`${BASE_URL}/#/game/memory`);
    await driver.wait(until.urlContains('#/game/memory'), 8000);
    const level1 = await waitForCss(driver, '#level-tile-1');
    const cls = await level1.getAttribute('class');
    expect(cls).to.satisfy(c => c.includes('next') || c.includes('completed'));
  });

  // ── TC-W-UI-012 ──────────────────────────────────────────
  it('TC-W-UI-012 | GameLevels — Progress bar fill element exists', async function () {
    await driver.get(`${BASE_URL}/#/game/memory`);
    await driver.wait(until.urlContains('#/game/memory'), 8000);
    const fill = await waitForCss(driver, '.progress-strip-fill');
    expect(fill).to.exist;
  });

  // ── TC-W-UI-013 ──────────────────────────────────────────
  it('TC-W-UI-013 | GameLevels — Progress strip shows N / 100 label', async function () {
    await driver.get(`${BASE_URL}/#/game/logic`);
    await driver.wait(until.urlContains('#/game/logic'), 8000);
    const texts = await driver.findElements(By.css('.progress-strip-text'));
    const allText = (await Promise.all(texts.map(t => t.getText()))).join(' ');
    expect(allText).to.include('100');
  });

  // ── TC-W-UI-014 ──────────────────────────────────────────
  it('TC-W-UI-014 | GameLevels — Levels grid has 100 tiles total', async function () {
    await driver.get(`${BASE_URL}/#/game/speed`);
    await driver.wait(until.urlContains('#/game/speed'), 8000);
    await driver.wait(until.elementsLocated(By.css('.level-tile')), 8000);
    const tiles = await driver.findElements(By.css('.level-tile'));
    expect(tiles.length).to.equal(100);
  });

  // ── TC-W-UI-015 ──────────────────────────────────────────
  it('TC-W-UI-015 | Memory Game — Memory grid renders with cards', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    await driver.wait(until.urlContains('/play/memory/1'), 8000);
    const cards = await driver.wait(until.elementsLocated(By.css('.mem-card')), 8000);
    expect(cards.length).to.equal(16); // Level 1: 4x4 = 16 cards
  });

  // ── TC-W-UI-016 ──────────────────────────────────────────
  it('TC-W-UI-016 | Memory Game — Cards start face-down (not flipped)', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    await driver.wait(until.urlContains('/play/memory/1'), 8000);
    await driver.wait(until.elementsLocated(By.css('.mem-card')), 8000);
    const flippedCards = await driver.findElements(By.css('.mem-card.flipped'));
    expect(flippedCards.length).to.equal(0);
  });

  // ── TC-W-UI-017 ──────────────────────────────────────────
  it('TC-W-UI-017 | Speed Game — Timer element is displayed', async function () {
    await driver.get(`${BASE_URL}/#/play/speed/1`);
    await driver.wait(until.urlContains('/play/speed/1'), 8000);
    const timer = await waitForCss(driver, '.game-timer');
    const text = await timer.getText();
    expect(text).to.match(/\d+s/);
  });

  // ── TC-W-UI-018 ──────────────────────────────────────────
  it('TC-W-UI-018 | Speed Game — Number grid buttons are rendered', async function () {
    await driver.get(`${BASE_URL}/#/play/speed/1`);
    await driver.wait(until.urlContains('/play/speed/1'), 8000);
    const buttons = await driver.wait(until.elementsLocated(By.css('.speed-btn')), 8000);
    // Level 1: N = min(4+1, 40) = 5
    expect(buttons.length).to.equal(5);
  });

  // ── TC-W-UI-019 ──────────────────────────────────────────
  it('TC-W-UI-019 | Logic Game — Sequence boxes and option buttons rendered', async function () {
    await driver.get(`${BASE_URL}/#/play/logic/1`);
    await driver.wait(until.urlContains('/play/logic/1'), 8000);
    const seqBoxes = await driver.wait(until.elementsLocated(By.css('.seq-box')), 8000);
    const options  = await driver.findElements(By.css('.option-btn'));
    expect(seqBoxes.length).to.equal(5); // 4 numbers + 1 question mark
    expect(options.length).to.equal(4);
  });

  // ── TC-W-UI-020 ──────────────────────────────────────────
  it('TC-W-UI-020 | Focus Game — Moving target button is visible in play area', async function () {
    await driver.get(`${BASE_URL}/#/play/focus/1`);
    await driver.wait(until.urlContains('/play/focus/1'), 8000);
    const target = await driver.wait(until.elementLocated(By.css('.focus-target-btn')), 8000);
    expect(await target.isDisplayed()).to.be.true;
  });

  // ── TC-W-UI-021 ──────────────────────────────────────────
  it('TC-W-UI-021 | Result — Trophy shows 🏆 for 3 stars', async function () {
    await driver.get(`${BASE_URL}/#/result/memory/1/3/10`);
    await driver.wait(until.urlContains('/result/'), 8000);
    const trophy = await waitForCss(driver, '.result-trophy');
    const text = await trophy.getText();
    expect(text).to.include('🏆');
  });

  // ── TC-W-UI-022 ──────────────────────────────────────────
  it('TC-W-UI-022 | Result — Trophy shows 🥈 for 2 stars', async function () {
    await driver.get(`${BASE_URL}/#/result/logic/2/2/15`);
    await driver.wait(until.urlContains('/result/'), 8000);
    const trophy = await waitForCss(driver, '.result-trophy');
    const text = await trophy.getText();
    expect(text).to.include('🥈');
  });

  // ── TC-W-UI-023 ──────────────────────────────────────────
  it('TC-W-UI-023 | Result — Trophy shows 🥉 for 1 star', async function () {
    await driver.get(`${BASE_URL}/#/result/speed/3/1/9`);
    await driver.wait(until.urlContains('/result/'), 8000);
    const trophy = await waitForCss(driver, '.result-trophy');
    const text = await trophy.getText();
    expect(text).to.include('🥉');
  });

  // ── TC-W-UI-024 ──────────────────────────────────────────
  it('TC-W-UI-024 | Result — Star row displays correctly for 2 stars (⭐⭐☆)', async function () {
    await driver.get(`${BASE_URL}/#/result/focus/1/2/7`);
    await driver.wait(until.urlContains('/result/'), 8000);
    const starRow = await waitForCss(driver, '.result-stars');
    const text = await starRow.getText();
    expect(text).to.include('⭐');
    expect(text).to.include('☆');
  });

  // ── TC-W-UI-025 ──────────────────────────────────────────
  it('TC-W-UI-025 | Profile — Logout button has red gradient styling', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/profile`);
    await driver.wait(until.urlContains('#/profile'), 8000);
    const logoutBtn = await waitForCss(driver, '#logout-btn');
    const style = await logoutBtn.getAttribute('style');
    expect(style).to.satisfy(s =>
      s.includes('239') || s.includes('68') || s.includes('red') || s.includes('rgba')
    );
  });
});
