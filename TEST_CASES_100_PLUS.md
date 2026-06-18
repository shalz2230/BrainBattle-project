# BrainBattle 100+ Test Case Catalog

This catalog covers the BrainBattle web app, Android app, backend API, game logic, and reporting pipeline. It is grouped by the requested testing types: functionality, UI/UX, validation, vulnerability/security, and unit testing.

## Functionality Test Cases

| ID | Area | Test Case | Expected Result |
| --- | --- | --- | --- |
| BB-F-001 | Splash | Open root web route | User reaches splash/login flow without crash |
| BB-F-002 | Login | Login with valid seeded user | User reaches home dashboard |
| BB-F-003 | Login | Submit login by pressing Enter | Login request is submitted |
| BB-F-004 | Login | Click signup link from login | Signup page opens |
| BB-F-005 | Login | Click forgot password link from login | Forgot password page opens |
| BB-F-006 | Signup | Open signup route directly | Signup form renders |
| BB-F-007 | Signup | Signup with valid name, email, password | Account creation request is sent |
| BB-F-008 | Forgot Password | Submit registered email | Change password flow is reached |
| BB-F-009 | Change Password | Submit new password | Backend change-password endpoint is called |
| BB-F-010 | Home | Home loads after authentication | Welcome/dashboard content is visible |
| BB-F-011 | Home | Start Challenge button clicked | Current game level flow opens |
| BB-F-012 | Home | Memory card clicked | Memory levels screen opens |
| BB-F-013 | Home | Logic card clicked | Logic levels screen opens |
| BB-F-014 | Home | Focus card clicked | Focus levels screen opens |
| BB-F-015 | Home | Speed card clicked | Speed levels screen opens |
| BB-F-016 | Profile | Open profile/rank from dashboard | Profile/rank details render |
| BB-F-017 | Levels | Open level 1 from memory levels | Memory game starts at level 1 |
| BB-F-018 | Levels | Locked levels displayed after first playable level | Locked state is shown |
| BB-F-019 | Memory Game | Start level 1 | 16 cards are generated |
| BB-F-020 | Memory Game | Match all pairs | Result screen opens |
| BB-F-021 | Logic Game | Start level 1 | Arithmetic sequence question renders |
| BB-F-022 | Logic Game | Choose correct answer | Result screen gives 3 stars |
| BB-F-023 | Logic Game | Choose wrong answer | Result screen gives lower score |
| BB-F-024 | Focus Game | Tap visible target | Result screen opens |
| BB-F-025 | Speed Game | Start level 1 | Number grid renders |
| BB-F-026 | Speed Game | Tap numbers in order | Result screen opens with success |
| BB-F-027 | Speed Game | Tap wrong number | Result screen opens with low score |
| BB-F-028 | Result | Continue after memory result | Memory levels screen opens |
| BB-F-029 | Result | Continue after logic result | Logic levels screen opens |
| BB-F-030 | Result | Continue after focus result | Focus levels screen opens |
| BB-F-031 | Result | Continue after speed result | Speed levels screen opens |
| BB-F-032 | Dashboard API | Fetch dashboard for valid user | Current level, stars, rank returned |
| BB-F-033 | Progress API | Save progress | Progress row is persisted |
| BB-F-034 | Progress API | Fetch progress by game | Matching game progress is returned |
| BB-F-035 | User API | Fetch user by email | Username is returned |

## UI/UX Test Cases

| ID | Area | Test Case | Expected Result |
| --- | --- | --- | --- |
| BB-UI-001 | Login | Email field visible | Field is displayed |
| BB-UI-002 | Login | Password field visible | Field is displayed |
| BB-UI-003 | Login | Login button visible | Button is displayed |
| BB-UI-004 | Login | Password input masked | Input type is password |
| BB-UI-005 | Signup | Username field visible | Field is displayed |
| BB-UI-006 | Signup | Email field visible | Field is displayed |
| BB-UI-007 | Signup | Password field visible | Field is displayed |
| BB-UI-008 | Signup | Signup button visible | Button is displayed |
| BB-UI-009 | Forgot Password | Email field visible | Field is displayed |
| BB-UI-010 | Forgot Password | Reset button visible | Button is displayed |
| BB-UI-011 | Change Password | Email field visible | Field is displayed |
| BB-UI-012 | Change Password | New password field visible | Field is displayed |
| BB-UI-013 | Change Password | Change button visible | Button is displayed |
| BB-UI-014 | Home | Brain Battle title visible | Title is displayed |
| BB-UI-015 | Home | Profile icon visible | Icon is displayed |
| BB-UI-016 | Home | Progress card visible | Progress content is displayed |
| BB-UI-017 | Home | Start Challenge button visible | Button is displayed |
| BB-UI-018 | Home | Game type cards visible | Memory, logic, focus, speed are shown |
| BB-UI-019 | Levels | Progress bar visible | Progress indicator is displayed |
| BB-UI-020 | Levels | Grid of levels visible | Level grid exists |
| BB-UI-021 | Memory Game | Level text visible | Current level text is displayed |
| BB-UI-022 | Memory Game | Timer visible | Timer text is displayed |
| BB-UI-023 | Logic Game | Question text visible | Question is displayed |
| BB-UI-024 | Logic Game | Options grid visible | Four options are displayed |
| BB-UI-025 | Focus Game | Target visible | Target image is displayed |
| BB-UI-026 | Speed Game | Options grid visible | Number choices are displayed |
| BB-UI-027 | Result | Level complete text visible | Result level text is displayed |
| BB-UI-028 | Result | Stars visible | Star result is displayed |
| BB-UI-029 | Result | Time visible | Time result is displayed |
| BB-UI-030 | Result | Continue button visible | Continue button is displayed |

## Validation Test Cases

| ID | Area | Test Case | Expected Result |
| --- | --- | --- | --- |
| BB-V-001 | Login | Empty email and password | User remains on login screen |
| BB-V-002 | Login | Empty email with password | Validation prevents navigation |
| BB-V-003 | Login | Email with empty password | Validation prevents navigation |
| BB-V-004 | Login | Whitespace-only credentials | Validation treats input as empty |
| BB-V-005 | Login | Invalid credentials | Login failed state is shown |
| BB-V-006 | Signup | Empty username | Validation prevents request |
| BB-V-007 | Signup | Empty email | Validation prevents request |
| BB-V-008 | Signup | Empty password | Validation prevents request |
| BB-V-009 | Signup | Whitespace-only fields | Validation prevents request |
| BB-V-010 | Signup | Invalid email format | API or UI rejects/does not authenticate |
| BB-V-011 | Forgot Password | Empty email | User stays on forgot password screen |
| BB-V-012 | Forgot Password | Unknown email | Error message is shown |
| BB-V-013 | Change Password | Empty email | Validation prevents request |
| BB-V-014 | Change Password | Empty new password | Validation prevents request |
| BB-V-015 | Change Password | Email intent is missing | User stays on change password screen |
| BB-V-016 | API Auth | Missing login email in JSON | Backend returns non-success status |
| BB-V-017 | API Auth | Missing login password in JSON | Backend returns non-success status |
| BB-V-018 | API Auth | Missing signup username | Backend returns non-success status |
| BB-V-019 | API Progress | Missing game type | Backend rejects or handles safely |
| BB-V-020 | API Progress | Negative level value | Backend rejects or handles safely |
| BB-V-021 | API Progress | Stars above allowed range | Backend rejects or clamps value |
| BB-V-022 | API Progress | Missing email | Backend rejects or returns empty progress |
| BB-V-023 | Game Logic | Memory level below 1 | Defaults or remains safe |
| BB-V-024 | Game Logic | Speed high level count | Count remains capped at 40 |
| BB-V-025 | Game Logic | Focus high level speed | Delay never goes below minimum |

## Vulnerability and Security Test Cases

| ID | Area | Test Case | Expected Result |
| --- | --- | --- | --- |
| BB-S-001 | Backend | App factory imports without crash | Flask app can be created |
| BB-S-002 | Backend | CORS is configured | Expected origins are accepted |
| BB-S-003 | Backend | Debug is disabled for production env | No production DEBUG=True |
| BB-S-004 | Backend | Requirements file exists | Dependency list is trackable |
| BB-S-005 | Backend | Werkzeug/bcrypt dependency present | Password hashing support exists |
| BB-S-006 | Auth | Passwords are not returned by login API | Response excludes password hash |
| BB-S-007 | Auth | Password storage uses hashing helper | Plain password storage is not detected |
| BB-S-008 | Auth | Failed login does not reveal account details | Generic failure returned |
| BB-S-009 | Auth | Signup duplicate email handled safely | No duplicate user corruption |
| BB-S-010 | Auth | Forgot password unknown email handled safely | No sensitive user enumeration |
| BB-S-011 | API | SQL injection string in email | Query remains safe |
| BB-S-012 | API | Script tag in username | Stored/reflected XSS is not executed |
| BB-S-013 | API | Long email payload | Request handled without crash |
| BB-S-014 | API | Long password payload | Request handled without crash |
| BB-S-015 | API | Malformed JSON request | Backend returns safe error |
| BB-S-016 | API | Unsupported HTTP method | Backend returns 405/404 safely |
| BB-S-017 | API | Cleartext secrets scan | No obvious secret keys committed |
| BB-S-018 | API | Database model scan | SQLAlchemy ORM is used |
| BB-S-019 | Web | Login form does not expose password text | Password field masked |
| BB-S-020 | Web | Error pages do not expose stack traces | User-facing safe error |
| BB-S-021 | Android | APK package launches only declared activities | Manifest is controlled |
| BB-S-022 | Android | Internet permission is explicit | Permission is declared intentionally |
| BB-S-023 | Android | Backup rules exist | Backup/data extraction rules present |
| BB-S-024 | CI | Reports uploaded as artifacts only | No secrets printed in logs |
| BB-S-025 | CI | Security verification JSON generated | Security report artifact exists |

## Unit Test Cases

| ID | Area | Test Case | Expected Result |
| --- | --- | --- | --- |
| BB-U-001 | Difficulty | Level 1 maps to Easy | Easy |
| BB-U-002 | Difficulty | Level 5 maps to Easy | Easy |
| BB-U-003 | Difficulty | Level 6 maps to Medium | Medium |
| BB-U-004 | Difficulty | Level 10 maps to Medium | Medium |
| BB-U-005 | Difficulty | Level 11 maps to Hard | Hard |
| BB-U-006 | Dashboard | Current level 7 creates 8-11 | Four next levels returned |
| BB-U-007 | Routing | Memory routes to MemoryLevelsActivity | Correct target selected |
| BB-U-008 | Routing | Logic routes to LogicLevelsActivity | Correct target selected |
| BB-U-009 | Routing | Focus routes to FocusLevelsActivity | Correct target selected |
| BB-U-010 | Routing | Speed routes to SpeedLevelsActivity | Correct target selected |
| BB-U-011 | Routing | Unknown game falls back to speed | Speed route selected |
| BB-U-012 | Speed | Level 1 count is 5 | 5 |
| BB-U-013 | Speed | Level 36 count is capped | 40 |
| BB-U-014 | Speed | Level 100 count is capped | 40 |
| BB-U-015 | Speed | Level 1 has 3 columns | 3 |
| BB-U-016 | Speed | Level 5 has 4 columns | 4 |
| BB-U-017 | Speed | Level 10 has 5 columns | 5 |
| BB-U-018 | Speed | Level 20 has 6 columns | 6 |
| BB-U-019 | Speed | Level 40 has 7 columns | 7 |
| BB-U-020 | Speed | Level 70 has 8 columns | 8 |
| BB-U-021 | Speed | Level 1 timer is 10 | 10 |
| BB-U-022 | Speed | Level 90 timer is 4 | 4 |
| BB-U-023 | Logic | Level 1 sequence is 2,4,6,8 | Sequence generated |
| BB-U-024 | Logic | Level 1 answer is 10 | Correct answer included |
| BB-U-025 | Logic | Options list has 4 items | Four choices |
| BB-U-026 | Memory | Level 1 has 16 cards | 16 |
| BB-U-027 | Memory | Level 5 has 20 cards | 20 |
| BB-U-028 | Memory | Level 10 has 24 cards | 24 |
| BB-U-029 | Memory | Perfect solve gives 3 stars | 3 |
| BB-U-030 | Memory | Moderate solve gives 2 stars | 2 |
| BB-U-031 | Memory | Poor solve gives 1 star | 1 |
| BB-U-032 | Focus | Level 1 delay is slower than level 10 | Delay decreases |
| BB-U-033 | Focus | Level 100 delay is 120 | 120 |
| BB-U-034 | API Model | Progress request preserves email | Email unchanged |
| BB-U-035 | API Model | Progress request preserves game type | Game type unchanged |

## Report and CI Test Cases

| ID | Area | Test Case | Expected Result |
| --- | --- | --- | --- |
| BB-R-001 | CI | Push to any branch | Report workflow starts |
| BB-R-002 | CI | Manual workflow dispatch | Report workflow starts |
| BB-R-003 | CI | Node dependencies install | npm ci/npm install succeeds |
| BB-R-004 | CI | Python dependencies install | pip install succeeds |
| BB-R-005 | CI | Android Gradle unit tests run | HTML unit report generated |
| BB-R-006 | CI | Backend security script runs | JSON security report generated |
| BB-R-007 | CI | Selenium suite runs headless | Excel report generated |
| BB-R-008 | CI | Test artifact directory created | Reports folder exists |
| BB-R-009 | CI | Failed test still uploads artifacts | Artifacts available with failure context |
| BB-R-010 | CI | GitHub Step Summary generated | Summary contains test report links/status |

Total cataloged test cases: 135.
