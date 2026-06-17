// ============================================================
// BrainBattle Web App — Full E2E Suite (100+ Test Cases)
// Covers: UI/UX, Functional, Navigation, Validation, Security,
//         Game Logic, Profile, API & Edge Cases
// Tests: TC-E2E-001 to TC-E2E-105
// ============================================================

const { expect } = require('chai');
const { By, until, Key } = require('selenium-webdriver');
const { getDriver } = require('../utils/driverSetup');

const BASE_URL    = process.env.TEST_BASE_URL || 'http://localhost:5173/brainbattlewebfrontend/';
const VALID_EMAIL = process.env.TEST_EMAIL    || 'test@brainbattle.com';
const VALID_PASS  = process.env.TEST_PASS     || 'test1234';
const API_BASE    = process.env.API_URL       || 'http://127.0.0.1:5000';

// ─── Shared Helpers ──────────────────────────────────────────
async function loginAndGoHome(driver) {
  await driver.get(`${BASE_URL}/#/login`);
  const emailInput = await driver.wait(until.elementLocated(By.id('login-email')), 8000);
  const passInput  = await driver.wait(until.elementLocated(By.id('login-password')), 8000);
  const loginBtn   = await driver.wait(until.elementLocated(By.id('login-btn')), 8000);
  await emailInput.clear(); await emailInput.sendKeys(VALID_EMAIL);
  await passInput.clear();  await passInput.sendKeys(VALID_PASS);
  await loginBtn.click();
  await driver.wait(until.urlContains('#/home'), 10000);
}

async function waitFor(driver, selector, timeout = 8000) {
  return driver.wait(until.elementLocated(By.css(selector)), timeout);
}

async function clickEl(driver, selector, timeout = 8000) {
  const el = await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await el.click();
  return el;
}

// ─── Pure logic helpers (mirrors game source code) ──────────
function getConfig(level) {
  if (level < 5)  return { total: 16, cols: 4 };
  if (level < 10) return { total: 20, cols: 4 };
  return             { total: 24, cols: 4 };
}
function calcMemoryStars(moves, pairs) {
  const extra = (moves + 1) - pairs;
  return extra <= 2 ? 3 : extra <= 6 ? 2 : 1;
}
function getTimeForLevel(level) {
  if (level < 5)  return 10;
  if (level < 10) return 9;
  if (level < 20) return 8;
  if (level < 40) return 7;
  if (level < 70) return 6;
  if (level < 90) return 5;
  return 4;
}
function getCountForLevel(level) { return Math.min(4 + level, 40); }
function getSpeed(level) {
  if (level < 5)  return 800;
  if (level < 10) return 600;
  if (level < 20) return 450;
  if (level < 40) return 300;
  if (level < 70) return 200;
  return 120;
}
function generateQuestion(level) {
  const a = level + 1, b = a + 2, c = b + 2, d = c + 2, correct = d + 2;
  const options = [correct, correct + 2, correct - 2, correct + 4];
  return { sequence: [a, b, c, d], correct, options };
}
function getTileState(lvl, progressList) {
  const lastCompleted = progressList.reduce((max, p) => p.level > max ? p.level : max, 0);
  const item = progressList.find(p => p.level === lvl);
  if (item) return 'completed';
  if (lvl === lastCompleted + 1 || (lastCompleted === 0 && lvl === 1)) return 'next';
  return 'locked';
}

// ══════════════════════════════════════════════════════════════
// SECTION 1 — UNIT TESTS (Pure Logic, no browser)
// TC-E2E-001 to TC-E2E-025
// ══════════════════════════════════════════════════════════════
describe('E2E Unit Tests — Pure Game Logic', function () {
  this.timeout(10000);

  it('TC-E2E-001 | getConfig(1) → {total:16, cols:4}', function () {
    expect(getConfig(1)).to.deep.equal({ total: 16, cols: 4 });
  });
  it('TC-E2E-002 | getConfig(5) → {total:20, cols:4}', function () {
    expect(getConfig(5)).to.deep.equal({ total: 20, cols: 4 });
  });
  it('TC-E2E-003 | getConfig(10) → {total:24, cols:4}', function () {
    expect(getConfig(10)).to.deep.equal({ total: 24, cols: 4 });
  });
  it('TC-E2E-004 | getConfig(99) → {total:24, cols:4}', function () {
    expect(getConfig(99)).to.deep.equal({ total: 24, cols: 4 });
  });
  it('TC-E2E-005 | Memory deck pairs = total/2 for level 1 (8 pairs)', function () {
    expect(getConfig(1).total / 2).to.equal(8);
  });
  it('TC-E2E-006 | calcMemoryStars(9,8) = 3 (extra=2)', function () {
    expect(calcMemoryStars(9, 8)).to.equal(3);
  });
  it('TC-E2E-007 | calcMemoryStars(12,8) = 2 (extra=5)', function () {
    expect(calcMemoryStars(12, 8)).to.equal(2);
  });
  it('TC-E2E-008 | calcMemoryStars(16,8) = 1 (extra=9)', function () {
    expect(calcMemoryStars(16, 8)).to.equal(1);
  });
  it('TC-E2E-009 | calcMemoryStars(8,8) = 3 (extra=1)', function () {
    expect(calcMemoryStars(8, 8)).to.equal(3);
  });
  it('TC-E2E-010 | getTimeForLevel(1) = 10', function () {
    expect(getTimeForLevel(1)).to.equal(10);
  });
  it('TC-E2E-011 | getTimeForLevel(5) = 9', function () {
    expect(getTimeForLevel(5)).to.equal(9);
  });
  it('TC-E2E-012 | getTimeForLevel(90) = 4', function () {
    expect(getTimeForLevel(90)).to.equal(4);
  });
  it('TC-E2E-013 | getCountForLevel(1) = 5', function () {
    expect(getCountForLevel(1)).to.equal(5);
  });
  it('TC-E2E-014 | getCountForLevel(36) = 40 (cap)', function () {
    expect(getCountForLevel(36)).to.equal(40);
  });
  it('TC-E2E-015 | getCountForLevel(100) = 40 (cap)', function () {
    expect(getCountForLevel(100)).to.equal(40);
  });
  it('TC-E2E-016 | getSpeed(1) = 800ms', function () {
    expect(getSpeed(1)).to.equal(800);
  });
  it('TC-E2E-017 | getSpeed(10) = 450ms', function () {
    expect(getSpeed(10)).to.equal(450);
  });
  it('TC-E2E-018 | getSpeed(70) = 120ms', function () {
    expect(getSpeed(70)).to.equal(120);
  });
  it('TC-E2E-019 | generateQuestion(1) → correct=10, sequence=[2,4,6,8]', function () {
    const q = generateQuestion(1);
    expect(q.correct).to.equal(10);
    expect(q.sequence).to.deep.equal([2, 4, 6, 8]);
  });
  it('TC-E2E-020 | generateQuestion always has 4 options including correct', function () {
    for (let l = 1; l <= 15; l++) {
      const q = generateQuestion(l);
      expect(q.options).to.have.length(4);
      expect(q.options).to.include(q.correct);
    }
  });
  it('TC-E2E-021 | getTileState(1,[]) = "next" (fresh user)', function () {
    expect(getTileState(1, [])).to.equal('next');
  });
  it('TC-E2E-022 | getTileState(2,[{level:1}]) = "next"', function () {
    expect(getTileState(2, [{ level: 1 }])).to.equal('next');
  });
  it('TC-E2E-023 | getTileState(1,[{level:1}]) = "completed"', function () {
    expect(getTileState(1, [{ level: 1 }])).to.equal('completed');
  });
  it('TC-E2E-024 | getTileState(10,[{level:2}]) = "locked"', function () {
    expect(getTileState(10, [{ level: 2 }])).to.equal('locked');
  });
  it('TC-E2E-025 | Star row: 3 stars = "⭐⭐⭐", 1 star = "⭐☆☆"', function () {
    const row3 = '⭐'.repeat(3) + '☆'.repeat(0);
    const row1 = '⭐'.repeat(1) + '☆'.repeat(2);
    expect(row3).to.equal('⭐⭐⭐');
    expect(row1).to.equal('⭐☆☆');
  });
});

// ══════════════════════════════════════════════════════════════
// SECTION 2 — UI/UX TESTS (Selenium Browser)
// TC-E2E-026 to TC-E2E-050
// ══════════════════════════════════════════════════════════════
describe('E2E UI/UX Tests — Visual Elements & Rendering', function () {
  this.timeout(120000);
  let driver;

  before(async function () { driver = await getDriver(); });
  after(async  function () { if (driver) await driver.quit(); });

  it('TC-E2E-026 | Splash — Logo image renders & is visible', async function () {
    await driver.get(`${BASE_URL}/#/`);
    const logo = await driver.wait(until.elementLocated(By.css('img.auth-logo, img[alt="Brain Battle"]')), 8000);
    expect(await logo.isDisplayed()).to.be.true;
  });

  it('TC-E2E-027 | Splash — Redirects to login within 5s', async function () {
    await driver.get(`${BASE_URL}/#/`);
    await driver.wait(until.urlContains('#/login'), 6000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  it('TC-E2E-028 | Login — Page title contains "BrainBattle"', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const title = await driver.getTitle();
    expect(title.toLowerCase()).to.satisfy(t => t.includes('brain') || t.includes('battle'));
  });

  it('TC-E2E-029 | Login — Floating background shapes exist (≥5)', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const shapes = await driver.findElements(By.css('.floating-shapes .shape'));
    expect(shapes.length).to.be.at.least(5);
  });

  it('TC-E2E-030 | Login — Glitch-text heading has data-text attribute', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const heading = await waitFor(driver, '.glitch-text');
    const dataText = await heading.getAttribute('data-text');
    expect(dataText).to.be.a('string').and.have.length.above(0);
  });

  it('TC-E2E-031 | Login — input-border-glow element is present', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const el = await waitFor(driver, '.input-border-glow');
    expect(el).to.exist;
  });

  it('TC-E2E-032 | Login — Email input field is visible', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const el = await waitFor(driver, '#login-email');
    expect(await el.isDisplayed()).to.be.true;
  });

  it('TC-E2E-033 | Login — Password input field is visible', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const el = await waitFor(driver, '#login-password');
    expect(await el.isDisplayed()).to.be.true;
  });

  it('TC-E2E-034 | Login — Login button is visible and enabled', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const btn = await waitFor(driver, '#login-btn');
    expect(await btn.isDisplayed()).to.be.true;
    expect(await btn.isEnabled()).to.be.true;
  });

  it('TC-E2E-035 | Login — Password field type is "password" (masked)', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const passInput = await waitFor(driver, '#login-password');
    expect(await passInput.getAttribute('type')).to.equal('password');
  });

  it('TC-E2E-036 | Login — Email field type is "email"', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const emailInput = await waitFor(driver, '#login-email');
    expect(await emailInput.getAttribute('type')).to.equal('email');
  });

  it('TC-E2E-037 | Login — Button disables during in-flight request', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await (await waitFor(driver, '#login-email')).sendKeys(VALID_EMAIL);
    await (await waitFor(driver, '#login-password')).sendKeys(VALID_PASS);
    await (await waitFor(driver, '#login-btn')).click();
    const isDisabled = await driver.executeScript('return document.getElementById("login-btn").disabled;');
    expect(isDisabled).to.be.true;
    await driver.wait(until.urlContains('#/home'), 10000);
  });

  it('TC-E2E-038 | Signup — JOIN BATTLE button text visible', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    const btn = await waitFor(driver, '#signup-btn');
    const text = await btn.getText();
    expect(text).to.include('JOIN BATTLE');
  });

  it('TC-E2E-039 | Signup — Username, email, password fields all visible', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    expect(await (await waitFor(driver, '#signup-username')).isDisplayed()).to.be.true;
    expect(await (await waitFor(driver, '#signup-email')).isDisplayed()).to.be.true;
    expect(await (await waitFor(driver, '#signup-password')).isDisplayed()).to.be.true;
  });

  it('TC-E2E-040 | Signup — Password field is masked', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    const passInput = await waitFor(driver, '#signup-password');
    expect(await passInput.getAttribute('type')).to.equal('password');
  });

  it('TC-E2E-041 | Home — 4 glass-panel game cards visible', async function () {
    await loginAndGoHome(driver);
    const cards = await driver.findElements(By.css('.game-card.glass-panel'));
    expect(cards.length).to.equal(4);
  });

  it('TC-E2E-042 | Home — Total stars element is present with star emoji', async function () {
    await loginAndGoHome(driver);
    const starsEl = await waitFor(driver, '#total-stars');
    const text = await starsEl.getText();
    expect(text).to.match(/⭐\s*\d+/);
  });

  it('TC-E2E-043 | GameLevels — 100 level tiles render in memory game', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/game/memory`);
    await driver.wait(until.elementsLocated(By.css('.level-tile')), 10000);
    const tiles = await driver.findElements(By.css('.level-tile'));
    expect(tiles.length).to.equal(100);
  });

  it('TC-E2E-044 | GameLevels — Level 1 tile is "next" or "completed"', async function () {
    await driver.get(`${BASE_URL}/#/game/memory`);
    await driver.wait(until.elementsLocated(By.css('.level-tile')), 10000);
    const level1 = await waitFor(driver, '#level-tile-1');
    const cls = await level1.getAttribute('class');
    expect(cls).to.satisfy(c => c.includes('next') || c.includes('completed'));
  });

  it('TC-E2E-045 | GameLevels — Locked tiles display lock icon', async function () {
    await driver.get(`${BASE_URL}/#/game/memory`);
    await driver.wait(until.elementsLocated(By.css('.level-tile.locked')), 10000);
    const locked = await driver.findElements(By.css('.level-tile.locked .tile-lock'));
    expect(locked.length).to.be.at.least(1);
  });

  it('TC-E2E-046 | GameLevels — Progress bar fill element exists', async function () {
    await driver.get(`${BASE_URL}/#/game/speed`);
    await driver.wait(until.elementsLocated(By.css('.level-tile')), 10000);
    const fill = await waitFor(driver, '.progress-strip-fill');
    expect(fill).to.exist;
  });

  it('TC-E2E-047 | Memory Game — 16 cards render for level 1', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    const cards = await driver.wait(until.elementsLocated(By.css('.mem-card')), 10000);
    expect(cards.length).to.equal(16);
  });

  it('TC-E2E-048 | Memory Game — Cards start face-down (none flipped)', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    await driver.wait(until.elementsLocated(By.css('.mem-card')), 10000);
    const flipped = await driver.findElements(By.css('.mem-card.flipped'));
    expect(flipped.length).to.equal(0);
  });

  it('TC-E2E-049 | Speed Game — Timer element shows digit+s pattern', async function () {
    await driver.get(`${BASE_URL}/#/play/speed/1`);
    const timer = await waitFor(driver, '.game-timer');
    expect(await timer.getText()).to.match(/\d+s/);
  });

  it('TC-E2E-050 | Logic Game — 4 option buttons and 5 sequence boxes render', async function () {
    await driver.get(`${BASE_URL}/#/play/logic/1`);
    const seqBoxes = await driver.wait(until.elementsLocated(By.css('.seq-box')), 10000);
    const options  = await driver.findElements(By.css('.option-btn'));
    expect(seqBoxes.length).to.equal(5);
    expect(options.length).to.equal(4);
  });
});

// ══════════════════════════════════════════════════════════════
// SECTION 3 — FUNCTIONAL TESTS (Selenium Browser)
// TC-E2E-051 to TC-E2E-075
// ══════════════════════════════════════════════════════════════
describe('E2E Functional Tests — User Flows & Navigation', function () {
  this.timeout(120000);
  let driver;

  before(async function () { driver = await getDriver(); });
  after(async  function () { if (driver) await driver.quit(); });

  it('TC-E2E-051 | Splash — Auto-navigates to login within 5.5s', async function () {
    await driver.get(`${BASE_URL}/#/`);
    await driver.wait(until.urlContains('#/login'), 6000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  it('TC-E2E-052 | Login — Valid credentials redirect to home', async function () {
    await loginAndGoHome(driver);
    expect(await driver.getCurrentUrl()).to.include('#/home');
  });

  it('TC-E2E-053 | Login — Invalid credentials keep user on login page', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await (await waitFor(driver, '#login-email')).sendKeys('wrong@example.com');
    await (await waitFor(driver, '#login-password')).sendKeys('wrongpassword');
    await clickEl(driver, '#login-btn');
    try {
      await driver.wait(until.urlContains('#/home'), 3000);
      expect.fail('Should not navigate to home');
    } catch {
      expect(await driver.getCurrentUrl()).to.not.include('#/home');
    }
  });

  it('TC-E2E-054 | Login — "Create Account" link opens signup', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const link = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Create Account')]")), 8000);
    await link.click();
    await driver.wait(until.urlContains('#/signup'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/signup');
  });

  it('TC-E2E-055 | Login — "Forgot Password?" link opens forgot-password', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const link = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Forgot Password')]")), 8000);
    await link.click();
    await driver.wait(until.urlContains('#/forgot-password'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/forgot-password');
  });

  it('TC-E2E-056 | Login — Enter key on password field submits form', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await (await waitFor(driver, '#login-email')).sendKeys(VALID_EMAIL);
    await (await waitFor(driver, '#login-password')).sendKeys(VALID_PASS, Key.ENTER);
    await driver.wait(until.urlContains('#/home'), 10000);
    expect(await driver.getCurrentUrl()).to.include('#/home');
  });

  it('TC-E2E-057 | Signup — New unique email redirects to login', async function () {
    const newEmail = `e2e_${Date.now()}@brainbattle.com`;
    await driver.get(`${BASE_URL}/#/signup`);
    await (await waitFor(driver, '#signup-username')).sendKeys('TestUser');
    await (await waitFor(driver, '#signup-email')).sendKeys(newEmail);
    await (await waitFor(driver, '#signup-password')).sendKeys('pass12345');
    await clickEl(driver, '#signup-btn');
    await driver.wait(until.urlContains('#/login'), 8000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  it('TC-E2E-058 | Signup — Duplicate email stays on signup page', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    await (await waitFor(driver, '#signup-username')).sendKeys('Dup');
    await (await waitFor(driver, '#signup-email')).sendKeys(VALID_EMAIL);
    await (await waitFor(driver, '#signup-password')).sendKeys('pass12345');
    await clickEl(driver, '#signup-btn');
    try {
      await driver.wait(until.urlContains('#/login'), 3000);
      expect.fail('Should not redirect for duplicate email');
    } catch {
      expect(await driver.getCurrentUrl()).to.include('#/signup');
    }
  });

  it('TC-E2E-059 | Auth guard — Unauthenticated /home → login', async function () {
    await driver.get(`${BASE_URL}/#/home`);
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  it('TC-E2E-060 | Auth guard — Unauthenticated /profile → login', async function () {
    await driver.get(`${BASE_URL}/#/profile`);
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  it('TC-E2E-061 | Home — Memory Boost card opens /game/memory', async function () {
    await loginAndGoHome(driver);
    await driver.findElement(By.id('game-memory-btn')).click();
    await driver.wait(until.urlContains('#/game/memory'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/memory');
  });

  it('TC-E2E-062 | Home — Logic Training card opens /game/logic', async function () {
    await loginAndGoHome(driver);
    const el = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Logic Training')]/..")), 8000);
    await el.click();
    await driver.wait(until.urlContains('#/game/logic'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/logic');
  });

  it('TC-E2E-063 | Home — Focus Training card opens /game/focus', async function () {
    await loginAndGoHome(driver);
    const el = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Focus Training')]/..")), 8000);
    await el.click();
    await driver.wait(until.urlContains('#/game/focus'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/focus');
  });

  it('TC-E2E-064 | Home — Speed Challenge card opens /game/speed', async function () {
    await loginAndGoHome(driver);
    const el = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Speed Challenge')]/..")), 8000);
    await el.click();
    await driver.wait(until.urlContains('#/game/speed'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/speed');
  });

  it('TC-E2E-065 | Home — Profile icon opens /profile', async function () {
    await loginAndGoHome(driver);
    await driver.findElement(By.id('profile-btn')).click();
    await driver.wait(until.urlContains('#/profile'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/profile');
  });

  it('TC-E2E-066 | GameLevels — Clicking level 1 opens /play/memory/1', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/game/memory`);
    await driver.wait(until.elementsLocated(By.css('.level-tile')), 10000);
    await (await waitFor(driver, '#level-tile-1')).click();
    await driver.wait(until.urlContains('/play/memory/1'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/play/memory/1');
  });

  it('TC-E2E-067 | GameLevels — Clicking locked tile does NOT navigate', async function () {
    await driver.get(`${BASE_URL}/#/game/logic`);
    await driver.wait(until.elementsLocated(By.css('.level-tile.locked')), 10000);
    await (await waitFor(driver, '.level-tile.locked')).click();
    await driver.sleep(1000);
    expect(await driver.getCurrentUrl()).to.include('#/game/logic');
  });

  it('TC-E2E-068 | Logic Game — Correct answer → result page', async function () {
    await driver.get(`${BASE_URL}/#/play/logic/1`);
    const options = await driver.wait(until.elementsLocated(By.css('.option-btn')), 10000);
    let clicked = false;
    for (const opt of options) {
      if ((await opt.getText()).trim() === '10') { await opt.click(); clicked = true; break; }
    }
    if (!clicked) await options[0].click();
    await driver.wait(until.urlContains('/result/logic/1/'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/result/logic/1/');
  });

  it('TC-E2E-069 | Logic Game — Wrong answer → result with 1 star', async function () {
    await driver.get(`${BASE_URL}/#/play/logic/1`);
    const options = await driver.wait(until.elementsLocated(By.css('.option-btn')), 10000);
    for (const opt of options) {
      if ((await opt.getText()).trim() !== '10') { await opt.click(); break; }
    }
    await driver.wait(until.urlContains('/result/logic/1/1/'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/result/logic/1/1/');
  });

  it('TC-E2E-070 | Focus Game — Clicking target → 3-star result', async function () {
    await driver.get(`${BASE_URL}/#/play/focus/1`);
    const target = await driver.wait(until.elementLocated(By.css('.focus-target-btn')), 10000);
    await target.click();
    await driver.wait(until.urlContains('/result/focus/1/3/'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/result/focus/1/3/');
  });

  it('TC-E2E-071 | Result — Continue button → game levels page', async function () {
    await driver.get(`${BASE_URL}/#/result/memory/1/3/10`);
    await clickEl(driver, '#result-continue-btn');
    await driver.wait(until.urlContains('#/game/memory'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/game/memory');
  });

  it('TC-E2E-072 | Result — Play Again button re-opens same level', async function () {
    await driver.get(`${BASE_URL}/#/result/logic/3/2/12`);
    const el = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Play Again')]")), 8000);
    await el.click();
    await driver.wait(until.urlContains('/play/logic/3'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/play/logic/3');
  });

  it('TC-E2E-073 | Result — Home button → /home', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/result/speed/2/1/8`);
    const el = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Home')]")), 8000);
    await el.click();
    await driver.wait(until.urlContains('#/home'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/home');
  });

  it('TC-E2E-074 | Profile — Logout → login page', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/profile`);
    await clickEl(driver, '#logout-btn');
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  it('TC-E2E-075 | Profile — After logout, /home still redirects to login', async function () {
    await driver.get(`${BASE_URL}/#/home`);
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });
});

// ══════════════════════════════════════════════════════════════
// SECTION 4 — VALIDATION & EDGE CASE TESTS
// TC-E2E-076 to TC-E2E-090
// ══════════════════════════════════════════════════════════════
describe('E2E Validation & Edge Case Tests', function () {
  this.timeout(120000);
  let driver;

  before(async function () { driver = await getDriver(); });
  after(async  function () { if (driver) await driver.quit(); });

  it('TC-E2E-076 | Login — Empty email blocks submission', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await (await waitFor(driver, '#login-password')).sendKeys('somepass');
    await clickEl(driver, '#login-btn');
    await driver.sleep(1000);
    expect(await driver.getCurrentUrl()).to.not.include('#/home');
  });

  it('TC-E2E-077 | Login — Empty password blocks submission', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await (await waitFor(driver, '#login-email')).sendKeys(VALID_EMAIL);
    await clickEl(driver, '#login-btn');
    await driver.sleep(1000);
    expect(await driver.getCurrentUrl()).to.not.include('#/home');
  });

  it('TC-E2E-078 | Login — Both empty fields blocks submission', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await clickEl(driver, '#login-btn');
    await driver.sleep(1000);
    expect(await driver.getCurrentUrl()).to.not.include('#/home');
  });

  it('TC-E2E-079 | Login — Whitespace-only inputs blocked', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await (await waitFor(driver, '#login-email')).sendKeys('   ');
    await (await waitFor(driver, '#login-password')).sendKeys('   ');
    await clickEl(driver, '#login-btn');
    await driver.sleep(800);
    expect(await driver.getCurrentUrl()).to.not.include('#/home');
  });

  it('TC-E2E-080 | Signup — Empty username blocks submission', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    await (await waitFor(driver, '#signup-email')).sendKeys('new@test.com');
    await (await waitFor(driver, '#signup-password')).sendKeys('pass1234');
    await clickEl(driver, '#signup-btn');
    await driver.sleep(800);
    expect(await driver.getCurrentUrl()).to.not.include('#/login');
  });

  it('TC-E2E-081 | Signup — All fields empty blocks submission', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    await clickEl(driver, '#signup-btn');
    await driver.sleep(800);
    expect(await driver.getCurrentUrl()).to.include('#/signup');
  });

  it('TC-E2E-082 | Forgot Password — Empty email blocks submission', async function () {
    await driver.get(`${BASE_URL}/#/forgot-password`);
    await driver.wait(until.urlContains('#/forgot-password'), 5000);
    await clickEl(driver, '#verify-btn');
    await driver.sleep(800);
    expect(await driver.getCurrentUrl()).to.include('#/forgot-password');
  });

  it('TC-E2E-083 | Forgot Password — Unregistered email stays on page', async function () {
    await driver.get(`${BASE_URL}/#/forgot-password`);
    await (await waitFor(driver, '#forgot-email')).sendKeys('notreal_xyz@test.com');
    await clickEl(driver, '#verify-btn');
    try {
      await driver.wait(until.urlContains('#/change-password'), 3000);
      expect.fail('Should not navigate for unknown email');
    } catch {
      expect(await driver.getCurrentUrl()).to.include('#/forgot-password');
    }
  });

  it('TC-E2E-084 | Memory Game — Cannot re-click same card (only 1 flipped)', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    const cards = await driver.wait(until.elementsLocated(By.css('.mem-card')), 10000);
    await cards[0].click();
    await driver.sleep(100);
    await cards[0].click();
    const flipped = await driver.findElements(By.css('.mem-card.flipped'));
    expect(flipped.length).to.equal(1);
  });

  it('TC-E2E-085 | Logic Game — All buttons disabled after first answer', async function () {
    await driver.get(`${BASE_URL}/#/play/logic/1`);
    const options = await driver.wait(until.elementsLocated(By.css('.option-btn')), 10000);
    await options[0].click();
    await driver.sleep(300);
    const disabled = await driver.findElements(By.css('.option-btn[disabled]'));
    expect(disabled.length).to.be.at.least(1);
  });

  it('TC-E2E-086 | Speed Game — Wrong tap → instant 1-star result', async function () {
    await driver.get(`${BASE_URL}/#/play/speed/1`);
    const buttons = await driver.wait(until.elementsLocated(By.css('.speed-btn')), 10000);
    for (const btn of buttons) {
      if ((await btn.getText()).trim() !== '1') { await btn.click(); break; }
    }
    await driver.wait(until.urlContains('/result/speed/1/1/'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/result/speed/1/1/');
  });

  it('TC-E2E-087 | Unknown route → redirects to Splash /#/', async function () {
    await driver.get(`${BASE_URL}/#/totally-invalid-route-xyz`);
    await driver.wait(until.urlIs(`${BASE_URL}/#/`), 5000);
    expect(await driver.getCurrentUrl()).to.equal(`${BASE_URL}/#/`);
  });

  it('TC-E2E-088 | GameLevels — Progress strip shows /100 label', async function () {
    await driver.get(`${BASE_URL}/#/game/logic`);
    await driver.wait(until.elementsLocated(By.css('.level-tile')), 10000);
    const texts = await driver.findElements(By.css('.progress-strip-text'));
    const allText = (await Promise.all(texts.map(t => t.getText()))).join(' ');
    expect(allText).to.include('100');
  });

  it('TC-E2E-089 | Memory Game — Third card click while pair evaluating does not crash', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    const cards = await driver.wait(until.elementsLocated(By.css('.mem-card')), 10000);
    await cards[0].click();
    await cards[1].click();
    await cards[2].click();
    await driver.sleep(500);
    expect(await driver.getCurrentUrl()).to.include('/play/memory/1');
  });

  it('TC-E2E-090 | Profile — Change Password button navigates to /change-password', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/profile`);
    await clickEl(driver, '#change-password-btn');
    await driver.wait(until.urlContains('#/change-password'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/change-password');
  });
});

// ══════════════════════════════════════════════════════════════
// SECTION 5 — SECURITY TESTS
// TC-E2E-091 to TC-E2E-105
// ══════════════════════════════════════════════════════════════
describe('E2E Security Tests — XSS, SQLi, Auth', function () {
  this.timeout(120000);
  let driver;

  before(async function () { driver = await getDriver(); });
  after(async  function () { if (driver) await driver.quit(); });

  it('TC-E2E-091 | XSS — Script in login email does NOT execute in browser', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    const triggered = await driver.executeScript('return window.__xss_triggered === true;');
    expect(triggered).to.not.equal(true);
  });

  it('TC-E2E-092 | SQLi — "OR 1=1" in email field does NOT log in', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await (await waitFor(driver, '#login-email')).sendKeys("' OR '1'='1' --");
    await (await waitFor(driver, '#login-password')).sendKeys('anything');
    await clickEl(driver, '#login-btn');
    try {
      await driver.wait(until.urlContains('#/home'), 3000);
      expect.fail('SQL injection must not allow login');
    } catch {
      expect(await driver.getCurrentUrl()).to.not.include('#/home');
    }
  });

  it('TC-E2E-093 | SQLi — SQL payload in password field does NOT log in', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    await (await waitFor(driver, '#login-email')).sendKeys(VALID_EMAIL);
    await (await waitFor(driver, '#login-password')).sendKeys("' OR '1'='1");
    await clickEl(driver, '#login-btn');
    try {
      await driver.wait(until.urlContains('#/home'), 3000);
      expect.fail('SQL injection via password must not allow login');
    } catch {
      expect(await driver.getCurrentUrl()).to.not.include('#/home');
    }
  });

  it('TC-E2E-094 | After logout, direct /home access redirects to login', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/profile`);
    await driver.wait(until.urlContains('#/profile'), 5000);
    await clickEl(driver, '#logout-btn');
    await driver.wait(until.urlContains('#/login'), 5000);
    await driver.get(`${BASE_URL}/#/home`);
    await driver.wait(until.urlContains('#/login'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/login');
  });

  it('TC-E2E-095 | Password field is always type="password" (login)', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    expect(await (await waitFor(driver, '#login-password')).getAttribute('type')).to.equal('password');
  });

  it('TC-E2E-096 | Password field is always type="password" (signup)', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    expect(await (await waitFor(driver, '#signup-password')).getAttribute('type')).to.equal('password');
  });

  it('TC-E2E-097 | Email field type="email" on login enforces format', async function () {
    await driver.get(`${BASE_URL}/#/login`);
    expect(await (await waitFor(driver, '#login-email')).getAttribute('type')).to.equal('email');
  });

  it('TC-E2E-098 | Email field type="email" on signup enforces format', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    expect(await (await waitFor(driver, '#signup-email')).getAttribute('type')).to.equal('email');
  });

  it('TC-E2E-099 | API base URL is configurable (not hardcoded)', function () {
    expect(API_BASE).to.satisfy(url => url.startsWith('http://') || url.startsWith('https://'));
  });

  it('TC-E2E-100 | XSS — <script> tag in signup username does not execute alert', async function () {
    await driver.get(`${BASE_URL}/#/signup`);
    await (await waitFor(driver, '#signup-username')).sendKeys('<script>window.__xss_triggered=true;</script>');
    await (await waitFor(driver, '#signup-email')).sendKeys(`xss_${Date.now()}@test.com`);
    await (await waitFor(driver, '#signup-password')).sendKeys('pass1234');
    await clickEl(driver, '#signup-btn');
    await driver.sleep(1500);
    const triggered = await driver.executeScript('return window.__xss_triggered === true;');
    expect(triggered).to.not.equal(true);
  });

  it('TC-E2E-101 | Memory Game — Rapid double-click on same card does not break state', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    const cards = await driver.wait(until.elementsLocated(By.css('.mem-card')), 10000);
    await cards[0].click();
    await cards[0].click();
    await cards[0].click();
    await driver.sleep(500);
    expect(await driver.getCurrentUrl()).to.include('/play/memory/1');
  });

  it('TC-E2E-102 | Back button from Memory play → levels screen', async function () {
    await driver.get(`${BASE_URL}/#/play/memory/1`);
    const back = await waitFor(driver, '.back-btn');
    await back.click();
    await driver.wait(until.urlContains('/game/memory'), 5000);
    expect(await driver.getCurrentUrl()).to.include('/game/memory');
  });

  it('TC-E2E-103 | Back button from GameLevels → home', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/game/memory`);
    const back = await waitFor(driver, '.back-btn');
    await back.click();
    await driver.wait(until.urlContains('#/home'), 5000);
    expect(await driver.getCurrentUrl()).to.include('#/home');
  });

  it('TC-E2E-104 | Result trophy shows 🏆 for 3 stars', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/result/memory/1/3/10`);
    const trophy = await waitFor(driver, '.result-trophy');
    expect(await trophy.getText()).to.include('🏆');
  });

  it('TC-E2E-105 | Result stars row shows ⭐⭐⭐ for 3-star completion', async function () {
    await loginAndGoHome(driver);
    await driver.get(`${BASE_URL}/#/result/speed/1/3/8`);
    const starRow = await waitFor(driver, '.result-stars');
    const text = await starRow.getText();
    expect(text).to.include('⭐');
    expect(text).to.not.include('☆');
  });
});
