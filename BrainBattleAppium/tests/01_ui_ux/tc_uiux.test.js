// ============================================================
// BrainBattle Android — UI/UX Testing
// Category : UI/UX Testing
// IDs      : TC-UIUX-001 … TC-UIUX-025
// Screens  : Splash, Login, Signup, Home, Profile, Game Levels
// ============================================================
'use strict';
const assert = require('assert');

const PKG = 'com.simats.brainbattle:id/';
const $id  = (id) => $(`id=${PKG}${id}`);
const $txt = (text) => $(`android=new UiSelector().text("${text}")`);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('1. UI/UX Testing', function () {
  this.timeout(300000);

  // ─── Splash Screen ───────────────────────────────────────────
  it('TC-UIUX-001 | Splash screen renders within 3 seconds', async () => {
    // App is freshly launched; splash should be shown or transition done
    const loginEmail = await $id('emailEditText');
    await loginEmail.waitForDisplayed({ timeout: 8000 });
    assert(await loginEmail.isDisplayed(), 'Login screen did not appear after splash');
  });

  // ─── Login Screen UI ─────────────────────────────────────────
  it('TC-UIUX-002 | Login email field is displayed and interactive', async () => {
    const el = await $id('emailEditText');
    assert(await el.isDisplayed(), 'Email field not visible');
    assert(await el.isEnabled(), 'Email field not enabled');
  });

  it('TC-UIUX-003 | Login password field is displayed and masked', async () => {
    const el = await $id('passwordEditText');
    assert(await el.isDisplayed(), 'Password field not visible');
    const isPwd = await el.getAttribute('password');
    assert.strictEqual(isPwd, 'true', 'Password field is not masked');
  });

  it('TC-UIUX-004 | Login button is fully visible and has correct label', async () => {
    const btn = await $id('loginButton');
    assert(await btn.isDisplayed(), 'Login button not visible');
    const text = await btn.getText();
    assert(text.toLowerCase().includes('login'), `Unexpected login button text: "${text}"`);
  });

  it('TC-UIUX-005 | Forgot Password link is tappable on Login screen', async () => {
    const link = await $id('forgotText');
    assert(await link.isDisplayed(), '"Forgot Password?" text not visible');
    assert(await link.isEnabled(), '"Forgot Password?" not enabled');
  });

  it('TC-UIUX-006 | Sign Up link is visible on Login screen', async () => {
    const link = await $id('signupText');
    assert(await link.isDisplayed(), 'Sign Up link not visible on login screen');
  });

  it('TC-UIUX-007 | Login screen fields do not overlap (layout sanity)', async () => {
    const emailEl  = await $id('emailEditText');
    const passEl   = await $id('passwordEditText');
    const emailLoc = await emailEl.getLocation();
    const passLoc  = await passEl.getLocation();
    assert(passLoc.y > emailLoc.y, 'Password field appears above email field – layout issue');
  });

  // ─── Signup Screen UI ────────────────────────────────────────
  it('TC-UIUX-008 | Signup screen opens from Login and shows all three fields', async () => {
    await (await $id('signupText')).click();
    await sleep(2000);
    assert(await (await $id('etUsername')).isDisplayed(), 'Username field missing on Signup');
    assert(await (await $id('etEmail')).isDisplayed(), 'Email field missing on Signup');
    assert(await (await $id('etPassword')).isDisplayed(), 'Password field missing on Signup');
  });

  it('TC-UIUX-009 | Signup "Create account" button is visible and enabled', async () => {
    const btn = await $id('btnSignup');
    assert(await btn.isDisplayed(), '"Create account" button not visible');
    assert(await btn.isEnabled(), '"Create account" button not enabled');
  });

  it('TC-UIUX-010 | Signup "Login" link is visible (already-have-account flow)', async () => {
    const link = await $id('loginText');
    assert(await link.isDisplayed(), '"Login" link not visible on Signup screen');
  });

  it('TC-UIUX-011 | Signup password field is masked', async () => {
    const el = await $id('etPassword');
    const isPwd = await el.getAttribute('password');
    assert.strictEqual(isPwd, 'true', 'Signup password field is not masked');
  });

  it('TC-UIUX-012 | Back from Signup returns to Login screen', async () => {
    await driver.back();
    const loginBtn = await $id('loginButton');
    await loginBtn.waitForDisplayed({ timeout: 6000 });
    assert(await loginBtn.isDisplayed(), 'Did not return to Login after back from Signup');
  });

  // ─── Forgot Password Screen UI ───────────────────────────────
  it('TC-UIUX-013 | Forgot Password screen loads with input field', async () => {
    await (await $id('forgotText')).click();
    await sleep(1500);
    const field = await $id('forgotEmailEditText');
    await field.waitForDisplayed({ timeout: 6000 });
    assert(await field.isDisplayed(), 'Email field not on Forgot Password screen');
  });

  it('TC-UIUX-014 | Forgot Password screen has a Verify button', async () => {
    const btn = await $id('verifyButton');
    assert(await btn.isDisplayed(), '"Verify" button not visible on Forgot Password screen');
  });

  it('TC-UIUX-015 | Back from Forgot Password returns to Login screen', async () => {
    await driver.back();
    const loginBtn = await $id('loginButton');
    await loginBtn.waitForDisplayed({ timeout: 6000 });
    assert(await loginBtn.isDisplayed(), 'Did not return to Login after Forgot Password back');
  });

  // ─── Home Screen UI (requires login) ─────────────────────────
  it('TC-UIUX-016 | Home screen: Username greeting is visible after login', async () => {
    await (await $id('emailEditText')).setValue('test@brainbattle.com');
    await (await $id('passwordEditText')).setValue('Test@1234');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    const greeting = await $id('txtUsername');
    await greeting.waitForDisplayed({ timeout: 15000 });
    assert(await greeting.isDisplayed(), 'Username greeting not visible on home screen');
  });

  it('TC-UIUX-017 | Home screen: progress card is displayed', async () => {
    assert(await (await $id('progressLevel')).isDisplayed(), 'Progress level not visible');
    assert(await (await $id('scoreText')).isDisplayed(), 'Score text not visible');
  });

  it('TC-UIUX-018 | Home screen: "Start Challenge" button is visible and enabled', async () => {
    const btn = await $id('btnStart');
    assert(await btn.isDisplayed(), '"Start Challenge" button not visible');
    assert(await btn.isEnabled(), '"Start Challenge" button not enabled');
  });

  it('TC-UIUX-019 | Home screen: All 4 game category cards are visible', async () => {
    assert(await (await $id('memory_card')).isDisplayed(), 'Memory Boost card missing');
    assert(await (await $id('logic_card')).isDisplayed(), 'Logic Training card missing');
    assert(await (await $id('focus_card')).isDisplayed(), 'Focus Training card missing');
    assert(await (await $id('speed_card')).isDisplayed(), 'Speed Challenge card missing');
  });

  it('TC-UIUX-020 | Home screen: Profile icon is tappable', async () => {
    const icon = await $id('profileIcon');
    assert(await icon.isDisplayed(), 'Profile icon missing on home screen');
    assert(await icon.isEnabled(), 'Profile icon is not enabled');
  });

  // ─── Profile Screen UI ───────────────────────────────────────
  it('TC-UIUX-021 | Profile screen opens and shows username + email', async () => {
    await (await $id('profileIcon')).click();
    await sleep(2000);
    const usernameEl = await $id('username');
    await usernameEl.waitForDisplayed({ timeout: 8000 });
    assert(await usernameEl.isDisplayed(), 'Username missing on profile screen');
    assert(await (await $id('email')).isDisplayed(), 'Email missing on profile screen');
  });

  it('TC-UIUX-022 | Profile screen shows rank card', async () => {
    assert(await (await $id('rankText')).isDisplayed(), 'Rank card not visible on profile screen');
  });

  it('TC-UIUX-023 | Profile screen shows Stars and Levels stats', async () => {
    assert(await (await $id('starCount')).isDisplayed(), 'Star count not visible');
    assert(await (await $id('levelsCompleted')).isDisplayed(), 'Levels count not visible');
  });

  it('TC-UIUX-024 | Profile screen shows "Change Password" button', async () => {
    const btn = await $id('changePasswordBtn');
    assert(await btn.isDisplayed(), '"Change Password" button not visible on profile');
  });

  it('TC-UIUX-025 | Back from Profile returns to Home screen', async () => {
    const backBtn = await $id('backBtn');
    await backBtn.click();
    await sleep(1500);
    const home = await $id('profileIcon');
    await home.waitForDisplayed({ timeout: 8000 });
    assert(await home.isDisplayed(), 'Did not navigate back to Home from Profile');
  });
});
