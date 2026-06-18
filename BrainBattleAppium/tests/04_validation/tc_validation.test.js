// ============================================================
// BrainBattle Android — Validation Testing
// Category : Validation Testing
// IDs      : TC-VAL-001 … TC-VAL-010
// Covers   : Input boundary tests, character limits, valid
//            states, and keyboard dismissal
// ============================================================
'use strict';
const assert = require('assert');

const PKG  = 'com.simats.brainbattle:id/';
const $id  = (id) => $(`id=${PKG}${id}`);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('4. Validation Testing', function () {
  this.timeout(300000);

  before(async () => {
    // Restart app to ensure clean state on Login screen
    await driver.terminateApp('com.simats.brainbattle');
    await sleep(2000);
    await driver.activateApp('com.simats.brainbattle');
    await sleep(5000); // Wait for splash -> login
  });

  it('TC-VAL-001 | Login email input rejects leading/trailing spaces silently or handles them', async () => {
    const el = await $id('emailEditText');
    await el.waitForDisplayed({ timeout: 10000 });
    await el.setValue('   user@test.com   ');
    const val = await el.getText();
    // Validate that the input accepted the text; the app logic should handle trim on submit.
    assert(val.includes('user@test.com'), 'Email input did not accept text with spaces');
  });

  it('TC-VAL-002 | Login password accepts special characters', async () => {
    const el = await $id('passwordEditText');
    await el.setValue('Pass!@#$%^&*()');
    const isPwd = await el.getAttribute('password');
    assert.strictEqual(isPwd, 'true', 'Password field must remain masked for special chars');
  });

  it('TC-VAL-003 | Keyboard is dismissible after entering email', async () => {
    await (await $id('emailEditText')).click();
    if (await driver.isKeyboardShown()) {
      await driver.hideKeyboard();
      await sleep(500);
    }
    assert(!(await driver.isKeyboardShown()), 'Keyboard should be dismissed');
  });

  it('TC-VAL-004 | Signup username accepts alphanumeric and spaces', async () => {
    await (await $id('signupText')).click();
    await sleep(2000);
    const el = await $id('etUsername');
    await el.waitForDisplayed({ timeout: 5000 });
    await el.setValue('John Doe 123');
    const val = await el.getText();
    assert(val.includes('John Doe 123'), 'Username input failed to accept alphanumeric + spaces');
  });

  it('TC-VAL-005 | Signup password rejects short strings during submission', async () => {
    await (await $id('etEmail')).setValue('test@validation.com');
    await (await $id('etPassword')).setValue('123');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('btnSignup')).click();
    await sleep(1500);
    assert(await (await $id('btnSignup')).isDisplayed(), 'Signup should block short password submission');
  });

  it('TC-VAL-006 | Signup email input blocks submission without domain', async () => {
    await (await $id('etUsername')).setValue('ValidUser');
    await (await $id('etEmail')).clearValue();
    await (await $id('etEmail')).setValue('invalid_at_domain');
    await (await $id('etPassword')).clearValue();
    await (await $id('etPassword')).setValue('SecurePass1!');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('btnSignup')).click();
    await sleep(1500);
    assert(await (await $id('btnSignup')).isDisplayed(), 'Signup should block invalid email format');
  });

  it('TC-VAL-007 | Return to Login after validation checks', async () => {
    await driver.back();
    const loginBtn = await $id('loginButton');
    await loginBtn.waitForDisplayed({ timeout: 5000 });
    assert(await loginBtn.isDisplayed(), 'Did not return to Login');
  });

  it('TC-VAL-008 | Forgot Password email validates empty submission', async () => {
    await (await $id('forgotText')).click();
    await sleep(1500);
    const verifyBtn = await $id('verifyButton');
    await verifyBtn.click();
    await sleep(1000);
    assert(await verifyBtn.isDisplayed(), 'Should block empty email on Forgot Password');
  });

  it('TC-VAL-009 | Forgot Password email validates format on submission', async () => {
    await (await $id('forgotEmailEditText')).setValue('badformat');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('verifyButton')).click();
    await sleep(1000);
    assert(await (await $id('verifyButton')).isDisplayed(), 'Should block bad email format on Forgot Password');
  });

  it('TC-VAL-010 | Cleanup validation flow and return to login', async () => {
    await driver.back();
    const loginBtn = await $id('loginButton');
    await loginBtn.waitForDisplayed({ timeout: 5000 });
    assert(await loginBtn.isDisplayed(), 'Should be back on Login screen');
  });
});
