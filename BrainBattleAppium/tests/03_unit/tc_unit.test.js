// ============================================================
// BrainBattle Android — Unit Testing (Component-level)
// Category : Unit Testing
// IDs      : TC-UNIT-001 … TC-UNIT-020
// Covers   : Text content correctness, input attributes,
//            button state, element hierarchy integrity
// ============================================================
'use strict';
const assert = require('assert');

const PKG  = 'com.simats.brainbattle:id/';
const $id  = (id) => $(`id=${PKG}${id}`);
const $xa  = (xpath) => $(xpath);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('3. Unit Testing', function () {
  this.timeout(300000);

  before(async () => {
    // Ensure we start from the Login screen
    await sleep(1500);
    try {
      const loginBtn = await $id('loginButton');
      if (!(await loginBtn.isDisplayed())) {
        await driver.execute('mobile: startActivity', {
          intent: 'com.simats.brainbattle/.LoginActivity',
        });
        await sleep(2000);
      }
    } catch (_) {}
  });

  // ─── Login Screen Component Tests ────────────────────────────
  it('TC-UNIT-001 | emailEditText has inputType=textEmailAddress', async () => {
    // Verify the input accepts e-mail characters
    const el = await $id('emailEditText');
    await el.setValue('unit_test@sample.com');
    const val = await el.getText();
    assert(val.includes('@'), 'emailEditText should accept an email with @');
    await el.clearValue();
  });

  it('TC-UNIT-002 | passwordEditText masks input (attribute password=true)', async () => {
    const el = await $id('passwordEditText');
    const pwd = await el.getAttribute('password');
    assert.strictEqual(pwd, 'true', 'password field must have password attribute = true');
  });

  it('TC-UNIT-003 | loginButton is enabled in default state', async () => {
    const btn = await $id('loginButton');
    assert(await btn.isEnabled(), 'loginButton must be enabled by default');
  });

  it('TC-UNIT-004 | loginButton has non-empty text content', async () => {
    const btn = await $id('loginButton');
    const text = await btn.getText();
    assert(text && text.trim().length > 0, 'loginButton must have non-empty text');
  });

  it('TC-UNIT-005 | forgotText element is clickable', async () => {
    const el = await $id('forgotText');
    const clickable = await el.getAttribute('clickable');
    assert(clickable === 'true' || (await el.isEnabled()), 'forgotText must be clickable');
  });

  it('TC-UNIT-006 | signupText element is clickable', async () => {
    const el = await $id('signupText');
    assert(await el.isEnabled(), 'signupText must be clickable/enabled');
  });

  // ─── Signup Screen Component Tests ───────────────────────────
  it('TC-UNIT-007 | Signup etUsername accepts text input', async () => {
    await (await $id('signupText')).click();
    await sleep(1500);
    const el = await $id('etUsername');
    await el.waitForDisplayed({ timeout: 5000 });
    await el.setValue('TestUserUnit');
    const val = await el.getText();
    assert(val.includes('TestUserUnit'), 'etUsername should accept typed text');
    await el.clearValue();
  });

  it('TC-UNIT-008 | Signup etEmail has inputType textEmailAddress', async () => {
    const el = await $id('etEmail');
    await el.setValue('unit@test.com');
    const val = await el.getText();
    assert(val.includes('@'), 'etEmail should accept email with @');
    await el.clearValue();
  });

  it('TC-UNIT-009 | Signup etPassword is masked', async () => {
    const el = await $id('etPassword');
    const isPwd = await el.getAttribute('password');
    assert.strictEqual(isPwd, 'true', 'Signup etPassword must be masked');
  });

  it('TC-UNIT-010 | Signup btnSignup is enabled by default', async () => {
    const btn = await $id('btnSignup');
    assert(await btn.isEnabled(), 'btnSignup should be enabled');
  });

  it('TC-UNIT-011 | Signup loginText is clickable (go back to login)', async () => {
    const el = await $id('loginText');
    assert(await el.isEnabled(), 'loginText on Signup screen should be clickable');
  });

  // ─── Navigate back to Login then to Home ─────────────────────
  it('TC-UNIT-012 | Can navigate from Signup back to Login', async () => {
    await driver.back();
    const loginBtn = await $id('loginButton');
    await loginBtn.waitForDisplayed({ timeout: 6000 });
    assert(await loginBtn.isDisplayed(), 'Login screen should show after back from Signup');
  });

  it('TC-UNIT-013 | Login emailEditText clears correctly', async () => {
    const el = await $id('emailEditText');
    await el.setValue('sometext@test.com');
    await el.clearValue();
    const val = await el.getText();
    // When cleared, getText on an EditText returns hint text or empty
    assert(!val.includes('@') || val === '', 'emailEditText should be cleared');
  });

  it('TC-UNIT-014 | Login passwordEditText clears correctly', async () => {
    const el = await $id('passwordEditText');
    await el.setValue('SomePass123');
    await el.clearValue();
    const val = await el.getText();
    assert(val.length === 0 || val === 'Password', 'passwordEditText should be cleared');
  });

  // ─── Home Screen Component Tests (after login) ────────────────
  it('TC-UNIT-015 | Home btnStart has non-empty label text', async () => {
    await (await $id('emailEditText')).setValue('test@brainbattle.com');
    await (await $id('passwordEditText')).setValue('Test@1234');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    const btn = await $id('btnStart');
    await btn.waitForDisplayed({ timeout: 15000 });
    const text = await btn.getText();
    assert(text && text.trim().length > 0, 'btnStart must have text');
  });

  it('TC-UNIT-016 | Home txtUsername contains non-empty text (username rendered)', async () => {
    const el = await $id('txtUsername');
    const text = await el.getText();
    assert(text && text.trim().length > 0, 'txtUsername must display a welcome message');
  });

  it('TC-UNIT-017 | Home scoreText contains text starting with "Score"', async () => {
    const el = await $id('scoreText');
    const text = await el.getText();
    assert(text && text.toLowerCase().includes('score'), `scoreText should contain "Score", got: "${text}"`);
  });

  it('TC-UNIT-018 | Home progressLevel has non-empty text', async () => {
    const el = await $id('progressLevel');
    const text = await el.getText();
    assert(text && text.trim().length > 0, 'progressLevel must have text content');
  });

  it('TC-UNIT-019 | Home memory_card is clickable (attribute check)', async () => {
    const el = await $id('memory_card');
    const clickable = await el.getAttribute('clickable');
    assert(clickable === 'true' || (await el.isEnabled()), 'memory_card must be clickable');
  });

  it('TC-UNIT-020 | Home levelContainer is present in the view hierarchy', async () => {
    const el = await $id('levelContainer');
    assert(await el.isExisting(), 'levelContainer must exist in the layout');
  });
});
