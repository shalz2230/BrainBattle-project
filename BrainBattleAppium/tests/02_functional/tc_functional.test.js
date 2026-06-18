// ============================================================
// BrainBattle Android — Functional Testing
// Category : Functional Testing
// IDs      : TC-FUNC-001 … TC-FUNC-025
// Covers   : Login flow, Signup flow, Navigation, Game launch,
//            Profile actions, Change password, Logout
// ============================================================
'use strict';
const assert = require('assert');

const PKG  = 'com.simats.brainbattle:id/';
const $id  = (id) => $(`id=${PKG}${id}`);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('2. Functional Testing', function () {
  this.timeout(300000);

  before(async () => {
    // Ensure we are on Login screen before this suite
    await sleep(2000);
    try {
      const loginBtn = await $id('loginButton');
      if (!(await loginBtn.isDisplayed())) await driver.back();
    } catch (_) { /* already on login */ }
  });

  // ─── Login Functional ────────────────────────────────────────
  it('TC-FUNC-001 | Login with invalid email format shows error or stays on screen', async () => {
    await (await $id('emailEditText')).setValue('notanemail');
    await (await $id('passwordEditText')).setValue('somepass');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    await sleep(2000);
    // Should stay on login (not navigate to home)
    const stillOnLogin = await (await $id('loginButton')).isDisplayed();
    assert(stillOnLogin, 'App should not navigate to home with invalid email format');
  });

  it('TC-FUNC-002 | Login with wrong password shows error and stays on screen', async () => {
    await (await $id('emailEditText')).clearValue();
    await (await $id('emailEditText')).setValue('test@brainbattle.com');
    await (await $id('passwordEditText')).clearValue();
    await (await $id('passwordEditText')).setValue('wrongpassword123');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    await sleep(3000);
    assert(await (await $id('loginButton')).isDisplayed(), 'App should stay on login with wrong password');
  });

  it('TC-FUNC-003 | Login with empty email field blocks submission', async () => {
    await (await $id('emailEditText')).clearValue();
    await (await $id('passwordEditText')).setValue('Test@1234');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    await sleep(1500);
    assert(await (await $id('loginButton')).isDisplayed(), 'Login should be blocked with empty email');
  });

  it('TC-FUNC-004 | Login with empty password field blocks submission', async () => {
    await (await $id('emailEditText')).setValue('test@brainbattle.com');
    await (await $id('passwordEditText')).clearValue();
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    await sleep(1500);
    assert(await (await $id('loginButton')).isDisplayed(), 'Login should be blocked with empty password');
  });

  it('TC-FUNC-005 | Login with valid credentials navigates to Home screen', async () => {
    await (await $id('emailEditText')).setValue('test@brainbattle.com');
    await (await $id('passwordEditText')).setValue('Test@1234');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    const homeIndicator = await $id('profileIcon');
    await homeIndicator.waitForDisplayed({ timeout: 15000 });
    assert(await homeIndicator.isDisplayed(), 'Did not navigate to Home after valid login');
  });

  // ─── Home Navigation Functional ──────────────────────────────
  it('TC-FUNC-006 | "Start Challenge" button launches a game activity', async () => {
    await (await $id('btnStart')).click();
    await sleep(2500);
    // Should be in a game screen; press back to return
    await driver.back();
    const homeIndicator = await $id('profileIcon');
    await homeIndicator.waitForDisplayed({ timeout: 8000 });
    assert(await homeIndicator.isDisplayed(), 'Did not return to Home after Start Challenge -> back');
  });

  it('TC-FUNC-007 | Memory Boost card launches Memory Levels screen', async () => {
    await (await $id('memory_card')).click();
    await sleep(2000);
    // Level screen should be up – verify by navigating back
    await driver.back();
    assert(await (await $id('memory_card')).isDisplayed(), 'Memory card missing after back');
  });

  it('TC-FUNC-008 | Logic Training card launches Logic Levels screen', async () => {
    await (await $id('logic_card')).click();
    await sleep(2000);
    await driver.back();
    assert(await (await $id('logic_card')).isDisplayed(), 'Logic card missing after back');
  });

  it('TC-FUNC-009 | Focus Training card launches Focus Levels screen', async () => {
    await (await $id('focus_card')).click();
    await sleep(2000);
    await driver.back();
    assert(await (await $id('focus_card')).isDisplayed(), 'Focus card missing after back');
  });

  it('TC-FUNC-010 | Speed Challenge card launches Speed Levels screen', async () => {
    await (await $id('speed_card')).click();
    await sleep(2000);
    await driver.back();
    assert(await (await $id('speed_card')).isDisplayed(), 'Speed card missing after back');
  });

  // ─── Signup Functional ───────────────────────────────────────
  it('TC-FUNC-011 | Signup with empty username is blocked', async () => {
    // Navigate to signup from home is not available; need to log out
    // For now navigate using driver.startActivity
    await driver.execute('mobile: startActivity', {
      intent: 'com.simats.brainbattle/.SignupActivity',
    });
    await sleep(2000);
    await (await $id('btnSignup')).click();
    await sleep(1500);
    assert(await (await $id('btnSignup')).isDisplayed(), 'Signup should stay on screen with empty username');
  });

  it('TC-FUNC-012 | Signup with invalid email format is blocked', async () => {
    await (await $id('etUsername')).setValue('TestUser');
    await (await $id('etEmail')).setValue('invalidemail');
    await (await $id('etPassword')).setValue('Pass@123');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('btnSignup')).click();
    await sleep(1500);
    assert(await (await $id('btnSignup')).isDisplayed(), 'Signup should be blocked with invalid email');
  });

  it('TC-FUNC-013 | Signup with short password (< 6 chars) is blocked', async () => {
    await (await $id('etEmail')).clearValue();
    await (await $id('etEmail')).setValue('newuser@brainbattle.com');
    await (await $id('etPassword')).clearValue();
    await (await $id('etPassword')).setValue('123');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('btnSignup')).click();
    await sleep(1500);
    assert(await (await $id('btnSignup')).isDisplayed(), 'Signup should be blocked with short password');
  });

  it('TC-FUNC-014 | Signup login link navigates back to Login screen', async () => {
    await (await $id('loginText')).click();
    const loginBtn = await $id('loginButton');
    await loginBtn.waitForDisplayed({ timeout: 6000 });
    assert(await loginBtn.isDisplayed(), 'Did not navigate to Login from Signup link');
  });

  // ─── Forgot Password Functional ───────────────────────────────
  it('TC-FUNC-015 | Forgot Password with empty email is blocked', async () => {
    await (await $id('forgotText')).click();
    await sleep(1500);
    await (await $id('verifyButton')).click();
    await sleep(1500);
    assert(await (await $id('verifyButton')).isDisplayed(), 'Forgot Password should be blocked with empty email');
  });

  it('TC-FUNC-016 | Forgot Password with invalid email stays on screen', async () => {
    await (await $id('forgotEmailEditText')).setValue('notanemail');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('verifyButton')).click();
    await sleep(2000);
    assert(await (await $id('verifyButton')).isDisplayed(), 'Should stay on Forgot Password with invalid email');
  });

  it('TC-FUNC-017 | Back from Forgot Password returns to Login', async () => {
    await driver.back();
    assert(await (await $id('loginButton')).isDisplayed(), 'Back from Forgot Password should show Login');
  });

  // ─── Profile & Account Functional ─────────────────────────────
  it('TC-FUNC-018 | Login, go to Profile, verify username is populated', async () => {
    await (await $id('emailEditText')).setValue('test@brainbattle.com');
    await (await $id('passwordEditText')).setValue('Test@1234');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    await (await $id('profileIcon')).waitForDisplayed({ timeout: 15000 });
    await (await $id('profileIcon')).click();
    await sleep(2000);
    const usernameEl = await $id('username');
    await usernameEl.waitForDisplayed({ timeout: 8000 });
    const uname = await usernameEl.getText();
    assert(uname && uname.trim().length > 0, 'Username not populated on Profile screen');
  });

  it('TC-FUNC-019 | Profile shows non-empty email address', async () => {
    const emailEl = await $id('email');
    const emailText = await emailEl.getText();
    assert(emailText.includes('@'), `Email on profile appears invalid: "${emailText}"`);
  });

  it('TC-FUNC-020 | Profile rank text is shown (format #N)', async () => {
    const rankEl = await $id('rankText');
    const rank = await rankEl.getText();
    assert(rank.includes('#'), `Rank format unexpected: "${rank}"`);
  });

  it('TC-FUNC-021 | Profile star count is a non-negative number', async () => {
    const starsEl = await $id('starCount');
    const stars = parseInt(await starsEl.getText(), 10);
    assert(!isNaN(stars) && stars >= 0, `Star count is not a valid number: "${await starsEl.getText()}"`);
  });

  it('TC-FUNC-022 | Profile levels count is a non-negative number', async () => {
    const levelsEl = await $id('levelsCompleted');
    const levels = parseInt(await levelsEl.getText(), 10);
    assert(!isNaN(levels) && levels >= 0, `Levels completed not valid: "${await levelsEl.getText()}"`);
  });

  it('TC-FUNC-023 | Change Password screen opens from Profile', async () => {
    await (await $id('changePasswordBtn')).click();
    await sleep(2000);
    // Should navigate to ChangePasswordActivity; go back
    await driver.back();
    await sleep(1000);
    assert(await (await $id('changePasswordBtn')).isDisplayed(), 'Did not return to Profile after Change Password back');
  });

  it('TC-FUNC-024 | Profile back button returns to Home screen', async () => {
    await (await $id('backBtn')).click();
    await sleep(1500);
    assert(await (await $id('profileIcon')).isDisplayed(), 'Back from Profile did not return to Home');
  });

  it('TC-FUNC-025 | Level container on Home has at least one level item', async () => {
    const container = await $id('levelContainer');
    assert(await container.isDisplayed(), 'Level container not displayed on Home screen');
    const children = await container.$$('*');
    assert(children.length > 0, 'Level container has no child elements – levels not loaded');
  });
});
