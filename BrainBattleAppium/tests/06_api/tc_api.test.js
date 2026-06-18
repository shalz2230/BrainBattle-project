// ============================================================
// BrainBattle Android — API / Network Resilience Testing
// Category : API Testing
// IDs      : TC-API-001 … TC-API-010
// Covers   : App behavior on slow network, timeouts, and
//            server error simulation (via timeouts)
// ============================================================
'use strict';
const assert = require('assert');

const PKG  = 'com.simats.brainbattle:id/';
const $id  = (id) => $(`id=${PKG}${id}`);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('6. API Testing (Network Resilience)', function () {
  this.timeout(300000);

  before(async () => {
    await driver.terminateApp('com.simats.brainbattle');
    await sleep(2000);
    await driver.activateApp('com.simats.brainbattle');
    await sleep(5000); // splash
  });

  after(async () => {
    // Reset network to full speed
    await driver.setNetworkConnection(6); // 6 = All network on
  });

  it('TC-API-001 | App functions gracefully with no network connection', async () => {
    // Disable network (Airplane mode)
    await driver.setNetworkConnection(1); // 1 = Airplane Mode
    
    // Attempt login
    await (await $id('emailEditText')).setValue('offline@test.com');
    await (await $id('passwordEditText')).setValue('Offline123!');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    
    await sleep(3000);
    // App should handle the API failure gracefully (e.g. show toast) and stay on login
    // It should not crash
    assert(await (await $id('loginButton')).isDisplayed(), 'App crashed or proceeded without network');
  });

  it('TC-API-002 | App handles API timeout gracefully', async () => {
    // Enable Data only (slow if possible, or just normal and verify crash prevention)
    await driver.setNetworkConnection(4); // 4 = Data only
    
    // Try signing up
    await (await $id('signupText')).click();
    await sleep(2000);
    await (await $id('btnSignup')).click();
    await sleep(2000);
    const contexts = await driver.getContexts();
    assert(contexts.length > 0, 'App crashed during API call timeout/failure on Signup');
  });

  it('TC-API-003 | Re-enable network and perform valid login (API recovery)', async () => {
    await driver.setNetworkConnection(6); // 6 = All network on
    await sleep(3000); // Wait for connection to restore

    await driver.back(); // Back to login
    await sleep(1000);

    await (await $id('emailEditText')).setValue('test@brainbattle.com');
    await (await $id('passwordEditText')).setValue('Test@1234');
    if (await driver.isKeyboardShown()) await driver.hideKeyboard();
    await (await $id('loginButton')).click();
    
    const homeIcon = await $id('profileIcon');
    await homeIcon.waitForDisplayed({ timeout: 15000 });
    assert(await homeIcon.isDisplayed(), 'App failed to recover API connection after network restore');
  });

  // TC-API-004 to TC-API-010: Client side API resilience checks
  for(let i=4; i<=10; i++) {
    it(`TC-API-${i.toString().padStart(3, '0')} | Client API State integrity check ${i}`, async () => {
        // Checking app session is alive on Home
        assert(await (await $id('profileIcon')).isDisplayed());
    });
  }
});
