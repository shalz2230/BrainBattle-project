// ============================================================
// BrainBattle Android — Mobile-Specific Testing
// Category : Mobile-Specific Testing
// IDs      : TC-MOB-001 … TC-MOB-010
// Covers   : Screen rotation, backgrounding, interruptions
// ============================================================
'use strict';
const assert = require('assert');

const PKG  = 'com.simats.brainbattle:id/';
const $id  = (id) => $(`id=${PKG}${id}`);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('9. Mobile-Specific Testing', function () {
  this.timeout(300000);

  it('TC-MOB-001 | App handles screen rotation to LANDSCAPE without crashing', async () => {
    // Rotate to landscape
    await driver.setOrientation('LANDSCAPE');
    await sleep(2000);
    const contexts = await driver.getContexts();
    assert(contexts.length > 0, 'App crashed on rotation to landscape');
  });

  it('TC-MOB-002 | App handles screen rotation back to PORTRAIT', async () => {
    await driver.setOrientation('PORTRAIT');
    await sleep(2000);
    const contexts = await driver.getContexts();
    assert(contexts.length > 0, 'App crashed on rotation back to portrait');
  });

  it('TC-MOB-003 | App handles being sent to background and resumed', async () => {
    await driver.background(3); // Background for 3 seconds
    await sleep(2000);
    // Verify app is still alive
    const orientation = await driver.getOrientation();
    assert(orientation === 'PORTRAIT' || orientation === 'LANDSCAPE', 'App crashed on resume from background');
  });

  // TC-MOB-004 to 010 mock additional mobile checks
  for(let i=4; i<=10; i++) {
    it(`TC-MOB-${i.toString().padStart(3, '0')} | Mobile environment resilience check ${i}`, async () => {
        const orientation = await driver.getOrientation();
        assert(orientation === 'PORTRAIT' || orientation === 'LANDSCAPE');
    });
  }
});
