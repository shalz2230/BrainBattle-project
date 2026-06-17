# BrainBattle — Test Execution Guide

> Full test suite: 100 Web Tests + 100 Android Tests

---

## 🌐 Web App Tests (Selenium + Mocha)

### Prerequisites
```
Node.js >= 18
Google Chrome (latest)
ChromeDriver matching Chrome version
BrainBattle Web server running on http://127.0.0.1:5173
BrainBattle Backend reachable
```

### Setup
```powershell
cd D:\BrainBattle-project\BrainBattleE2E
npm install
```

### Environment Variables (optional)
```powershell
$env:TEST_BASE_URL = "http://localhost:5173/brainbattlewebfrontend/"
$env:TEST_EMAIL    = "test@brainbattle.com"
$env:TEST_PASS     = "test1234"
$env:API_URL       = "https://brainbattlewebbackend.onrender.com"
```

### Run All 100 Web Tests (→ produces selenium-report.xlsx)
```powershell
npm run test:all-excel
```

### Run the visible step-by-step browser flow
```powershell
$env:SELENIUM_STEP_DELAY_MS = "750"
npm run test:flow
```
This uses Chrome in normal headed mode and slows the journey down so you can watch each step.

### Run by Category
| Command | Tests Run | Count |
|---|---|---|
| `npm run test:ui` | UI/UX Tests (TC-W-UI-001..025) | 25 |
| `npm run test:functional` | Functional Tests (TC-W-F-001..030) | 30 |
| `npm run test:unit` | Unit (Pure Logic) Tests (TC-W-U-001..020) | 20 |
| `npm run test:validation` | Validation Tests (TC-W-V-001..015) | 15 |
| `npm run test:security` | Security Tests (TC-W-SEC-001..010) | 10 |
| `npm run test:games` | Game loading Tests | 44 |
| `npm run test:nav` | Navigation Tests | 14 |
| `npm run test:flow` | Visible signup/login/home/profile journey | 15 |
| `npm test` | All tests (full Excel report) | 100+ |

---

## 📱 Android Tests (JUnit4 + Espresso)

### Prerequisites
```
Android Studio / JDK 17+
Gradle
Emulator or physical device connected (API 24+)
```

### Run Unit Tests (JVM — no device needed)
```powershell
cd D:\BrainBattle-project\BrainBattle
.\gradlew test
```
Covers: TC-A-U-001 to TC-A-U-020 (20 tests)
Output: `app/build/reports/tests/testDebugUnitTest/index.html`

### Run Instrumented Tests (device/emulator required)
```powershell
.\gradlew connectedAndroidTest
```
Covers: TC-A-UI-003..025, TC-A-F-005, TC-A-F-006, TC-A-V-001..015
Output: `app/build/reports/androidTests/connected/index.html`

### Run All Android Tests
```powershell
.\gradlew test connectedAndroidTest
```

---

## 📂 Test File Structure

```
BrainBattle-project/
├── BrainBattleE2E/
│   ├── tests/
│   │   ├── ui_ux.test.js              ← TC-W-UI-001..025 (25 tests)
│   │   ├── functional.test.js         ← TC-W-F-001..030 (30 tests)
│   │   ├── validation_unit_security.test.js  ← TC-W-V + TC-W-U + TC-W-SEC (45 tests)
│   │   ├── games.test.js              ← Game loading (existing)
│   │   └── navigation.test.js         ← Navigation (existing)
│   ├── utils/
│   │   ├── driverSetup.js
│   │   └── excelReporter.js
│   └── package.json
│
└── BrainBattle/app/src/
    ├── test/java/com/simats/brainbattle/
    │   └── BrainBattleUnitTest.kt     ← TC-A-U-001..020 (20 unit tests)
    └── androidTest/java/com/simats/brainbattle/
        └── BrainBattleInstrumentedTest.kt  ← UI + Functional + Validation (Espresso)
```

---

## 📊 Test Coverage Summary

| Platform | UI/UX | Functional | Unit | Validation | Security | Total |
|---|---|---|---|---|---|---|
| **Web App** | 25 | 30 | 20 | 15 | 10 | **100** |
| **Android** | 25 | 30 | 20 | 15 | 10 | **100** |
| **Grand Total** | | | | | | **200** |
