# BrainBattle Android Test Cases

## Scope

BrainBattle is an Android brain-training app with authentication, password recovery, a dashboard, level selection, and four game types: memory, logic, focus, and speed. The test suite is split into fast JVM unit tests and device/emulator instrumented UI tests.

## Unit Test Cases

| ID | Area | Test Case | Expected Result |
| --- | --- | --- | --- |
| BB-U-001 | Difficulty | Level 1 to 5 maps to Easy | Difficulty label is Easy |
| BB-U-002 | Difficulty | Level 6 to 10 maps to Medium | Difficulty label is Medium |
| BB-U-003 | Difficulty | Level above 10 maps to Hard | Difficulty label is Hard |
| BB-U-004 | Dashboard | Current level generates next four levels | List starts at current + 1 |
| BB-U-005 | Dashboard | Unknown game falls back to speed | Speed levels route is selected |
| BB-U-006 | Speed game | Level 1 contains 5 numbers | Number count is 5 |
| BB-U-007 | Speed game | High levels cap number count | Count never exceeds 40 |
| BB-U-008 | Speed game | Column count increases by level bands | Expected grid columns are returned |
| BB-U-009 | Speed game | Timer decreases by level bands | Higher levels get shorter limits |
| BB-U-010 | Logic game | Level 1 arithmetic sequence is generated | Question is 2, 4, 6, 8, ? and answer is 10 |
| BB-U-011 | Logic game | Options include correct answer | Correct answer appears in choices |
| BB-U-012 | Memory game | Level bands choose card counts | 16, 20, or 24 cards are selected |
| BB-U-013 | Memory game | Star score for efficient solve | 3 stars |
| BB-U-014 | Memory game | Star score for moderate solve | 2 stars |
| BB-U-015 | Memory game | Star score for poor solve | 1 star |
| BB-U-016 | Focus game | Target delay decreases with level | Delay gets faster as level rises |
| BB-U-017 | Result | Stars are rendered as repeated star text | Star count matches earned stars |
| BB-U-018 | API models | Progress payload preserves values | Request fields match input |

## Instrumented Test Cases

| ID | Area | Test Case | Expected Result |
| --- | --- | --- | --- |
| BB-I-001 | Login | Login screen renders fields/actions | Email, password, login, signup, forgot controls are visible |
| BB-I-002 | Login validation | Empty login stays on Login screen | Login button remains visible |
| BB-I-003 | Auth navigation | Signup link opens Signup screen | Signup button is visible |
| BB-I-004 | Auth navigation | Forgot link opens Forgot Password screen | Reset button is visible |
| BB-I-005 | Signup | Signup screen renders all fields | Name, email, password, signup, login controls are visible |
| BB-I-006 | Signup validation | Empty signup stays on Signup screen | Signup button remains visible |
| BB-I-007 | Forgot password | Empty email stays on Forgot Password screen | Reset button remains visible |
| BB-I-008 | Change password | Email extra is displayed | Email field contains intent email |
| BB-I-009 | Change password | Empty password stays on screen | Change button remains visible |
| BB-I-010 | Memory game | Level 1 starts with 16 cards | Game grid has 16 children |
| BB-I-011 | Logic game | Level 1 question and options render | Question text and 4 choices are visible |
| BB-I-012 | Speed game | Level 1 starts with 5 options | Options grid has 5 children |
| BB-I-013 | Focus game | Target renders and can finish game | Result screen appears after target tap |
| BB-I-014 | Result | Result screen renders level, stars, time | Result fields match intent extras |

## Commands

Run fast unit tests:

```powershell
cd D:\BrainBattle-project\BrainBattle
.\gradlew.bat testDebugUnitTest
```

Run Android UI tests on a connected phone or emulator:

```powershell
cd D:\BrainBattle-project\BrainBattle
.\gradlew.bat connectedDebugAndroidTest
```

Run both:

```powershell
cd D:\BrainBattle-project\BrainBattle
.\gradlew.bat testDebugUnitTest connectedDebugAndroidTest
```

Check connected devices:

```powershell
& "C:\Users\USER\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
```
