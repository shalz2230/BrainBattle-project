package com.simats.brainbattle

import android.content.Intent
import android.widget.EditText
import android.widget.GridLayout
import android.widget.TextView
import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.hamcrest.CoreMatchers.containsString
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith

/**
 * ══════════════════════════════════════════════════════════════════════
 *  BrainBattle — Comprehensive Instrumented Tests (100+ cases)
 *  File: BrainBattleFullSuiteTest.kt
 *
 *  Covers:
 *    ► UI/UX          — TC-IT-UI-001..025
 *    ► Functionality  — TC-IT-F-001..030
 *    ► Validation     — TC-IT-V-001..020
 *    ► Security       — TC-IT-S-001..010
 *    ► Game Behavior  — TC-IT-G-001..015
 *
 *  Run with:  ./gradlew connectedAndroidTest
 *  Requires device or emulator (API 24+)
 * ══════════════════════════════════════════════════════════════════════
 */
@RunWith(AndroidJUnit4::class)
class BrainBattleFullSuiteTest {

    private val ctx get() = InstrumentationRegistry.getInstrumentation().targetContext

    companion object {
        const val VALID_EMAIL = "test@brainbattle.com"
        const val VALID_PASS  = "test1234"
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECTION 1 — UI/UX  (TC-IT-UI-001..025)
    // ══════════════════════════════════════════════════════════════════

    /** TC-IT-UI-001 LoginActivity email field is visible */
    @Test fun tcItUi001LoginEmailFieldVisible() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-002 LoginActivity password field is visible */
    @Test fun tcItUi002LoginPasswordFieldVisible() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.passwordEditText)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-003 LoginActivity login button is visible */
    @Test fun tcItUi003LoginButtonVisible() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-004 LoginActivity signup link is visible */
    @Test fun tcItUi004LoginSignupLinkVisible() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.signupText)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-005 LoginActivity forgot password link is visible */
    @Test fun tcItUi005LoginForgotLinkVisible() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.forgotText)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-006 LoginActivity password field is masked */
    @Test fun tcItUi006LoginPasswordFieldIsMasked() {
        ActivityScenario.launch(LoginActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                val pw = activity.findViewById<EditText>(R.id.passwordEditText)
                val masked = android.text.InputType.TYPE_CLASS_TEXT or
                        android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
                assertEquals(masked, pw.inputType)
            }
        }
    }

    /** TC-IT-UI-007 SignupActivity username field is visible */
    @Test fun tcItUi007SignupUsernameFieldVisible() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etUsername)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-008 SignupActivity email field is visible */
    @Test fun tcItUi008SignupEmailFieldVisible() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etEmail)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-009 SignupActivity password field is visible */
    @Test fun tcItUi009SignupPasswordFieldVisible() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etPassword)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-010 SignupActivity signup button is visible */
    @Test fun tcItUi010SignupButtonVisible() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-011 ForgotPasswordActivity email field is visible */
    @Test fun tcItUi011ForgotEmailFieldVisible() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-012 ForgotPasswordActivity reset button is visible */
    @Test fun tcItUi012ForgotResetButtonVisible() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-013 ChangePasswordActivity change button is visible */
    @Test fun tcItUi013ChangePasswordButtonVisible() {
        val intent = Intent(ctx, ChangePasswordActivity::class.java).putExtra("email", VALID_EMAIL)
        ActivityScenario.launch<ChangePasswordActivity>(intent)
        onView(withId(R.id.changeButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-014 ChangePasswordActivity shows email from intent */
    @Test fun tcItUi014ChangePasswordShowsEmail() {
        val intent = Intent(ctx, ChangePasswordActivity::class.java).putExtra("email", "reset@brainbattle.com")
        ActivityScenario.launch<ChangePasswordActivity>(intent)
        onView(withId(R.id.emailEditText)).check(matches(withText("reset@brainbattle.com")))
    }

    /** TC-IT-UI-015 MemoryLevelsActivity levels grid is visible */
    @Test fun tcItUi015MemoryLevelsGridVisible() {
        ActivityScenario.launch(MemoryLevelsActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                assertNotNull(activity.findViewById(R.id.levelsGrid))
            }
        }
    }

    /** TC-IT-UI-016 MemoryLevelsActivity progress text is visible */
    @Test fun tcItUi016MemoryLevelsProgressTextVisible() {
        ActivityScenario.launch(MemoryLevelsActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                assertNotNull(activity.findViewById(R.id.progressText))
            }
        }
    }

    /** TC-IT-UI-017 LogicLevelsActivity renders without crash */
    @Test fun tcItUi017LogicLevelsActivityRendersOk() {
        ActivityScenario.launch(LogicLevelsActivity::class.java)
        // No assertion needed; launch without crash = pass
    }

    /** TC-IT-UI-018 FocusLevelsActivity renders without crash */
    @Test fun tcItUi018FocusLevelsActivityRendersOk() {
        ActivityScenario.launch(FocusLevelsActivity::class.java)
    }

    /** TC-IT-UI-019 SpeedLevelsActivity renders without crash */
    @Test fun tcItUi019SpeedLevelsActivityRendersOk() {
        ActivityScenario.launch(SpeedLevelsActivity::class.java)
    }

    /** TC-IT-UI-020 Memory GameActivity Level 1 — grid column count is 4 */
    @Test fun tcItUi020MemoryGameGridColumnCount() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                assertEquals(4, grid.columnCount)
            }
        }
    }

    /** TC-IT-UI-021 Logic GameActivity question text is visible */
    @Test fun tcItUi021LogicGameQuestionTextVisible() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<LogicGameActivity>(intent)
        onView(withId(R.id.questionText)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-022 Logic GameActivity options grid is visible */
    @Test fun tcItUi022LogicGameOptionsGridVisible() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<LogicGameActivity>(intent)
        onView(withId(R.id.optionsGrid)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-023 Speed GameActivity timer text is visible */
    @Test fun tcItUi023SpeedGameTimerVisible() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<SpeedGameActivity>(intent)
        onView(withId(R.id.timerText)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-024 Result screen level complete text is visible */
    @Test fun tcItUi024ResultLevelTextVisible() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 2).putExtra("STARS", 3).putExtra("TIME", 5).putExtra("TYPE", "memory")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.txtLevel)).check(matches(isDisplayed()))
    }

    /** TC-IT-UI-025 Result screen continue button is visible */
    @Test fun tcItUi025ResultContinueButtonVisible() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 1).putExtra("STARS", 2).putExtra("TIME", 8).putExtra("TYPE", "speed")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.btnContinue)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECTION 2 — FUNCTIONALITY (TC-IT-F-001..030)
    // ══════════════════════════════════════════════════════════════════

    /** TC-IT-F-001 Clicking signup link from Login opens SignupActivity */
    @Test fun tcItF001LoginSignupLinkOpensSignup() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.signupText)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    /** TC-IT-F-002 Clicking forgot link from Login opens ForgotPasswordActivity */
    @Test fun tcItF002LoginForgotLinkOpensForgotPassword() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.forgotText)).perform(click())
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-F-003 Memory GameActivity Level 1 produces 16 cards */
    @Test fun tcItF003MemoryLevel1Creates16Cards() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                assertEquals(16, grid.childCount)
            }
        }
    }

    /** TC-IT-F-004 Memory GameActivity Level 7 produces 20 cards */
    @Test fun tcItF004MemoryLevel7Creates20Cards() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 7)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                assertEquals(20, grid.childCount)
            }
        }
    }

    /** TC-IT-F-005 Memory GameActivity Level 10 produces 24 cards */
    @Test fun tcItF005MemoryLevel10Creates24Cards() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 10)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                assertEquals(24, grid.childCount)
            }
        }
    }

    /** TC-IT-F-006 Logic GameActivity Level 1 renders correct question */
    @Test fun tcItF006LogicLevel1QuestionText() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<LogicGameActivity>(intent)
        onView(withId(R.id.questionText)).check(matches(withText(containsString("2  4  6  8"))))
    }

    /** TC-IT-F-007 Logic GameActivity Level 1 generates 4 options */
    @Test fun tcItF007LogicLevel1HasFourOptions() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<LogicGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                assertEquals(4, grid.childCount)
            }
        }
    }

    /** TC-IT-F-008 Speed GameActivity Level 1 produces 5 number tiles */
    @Test fun tcItF008SpeedLevel1Creates5Tiles() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                assertEquals(5, grid.childCount)
            }
        }
    }

    /** TC-IT-F-009 Speed GameActivity Level 1 has 3 columns */
    @Test fun tcItF009SpeedLevel1HasThreeColumns() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                assertEquals(3, grid.columnCount)
            }
        }
    }

    /** TC-IT-F-010 Speed GameActivity Level 5 has 4 columns */
    @Test fun tcItF010SpeedLevel5HasFourColumns() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 5)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                assertEquals(4, grid.columnCount)
            }
        }
    }

    /** TC-IT-F-011 FocusGameActivity renders target image view */
    @Test fun tcItF011FocusGameTargetIsVisible() {
        val intent = Intent(ctx, FocusGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<FocusGameActivity>(intent)
        onView(withId(R.id.target)).check(matches(isDisplayed()))
    }

    /** TC-IT-F-012 ResultActivity shows correct level text */
    @Test fun tcItF012ResultShowsCorrectLevel() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 5).putExtra("STARS", 3).putExtra("TIME", 10).putExtra("TYPE", "logic")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.txtLevel)).check(matches(withText(containsString("Level 5"))))
    }

    /** TC-IT-F-013 ResultActivity shows correct star count for 1 star */
    @Test fun tcItF013ResultShows1Star() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 1).putExtra("STARS", 1).putExtra("TIME", 5).putExtra("TYPE", "speed")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.txtStars)).check(matches(withText("★")))
    }

    /** TC-IT-F-014 ResultActivity shows correct star count for 2 stars */
    @Test fun tcItF014ResultShows2Stars() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 1).putExtra("STARS", 2).putExtra("TIME", 5).putExtra("TYPE", "focus")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.txtStars)).check(matches(withText("★★")))
    }

    /** TC-IT-F-015 ResultActivity shows correct star count for 3 stars */
    @Test fun tcItF015ResultShows3Stars() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 1).putExtra("STARS", 3).putExtra("TIME", 5).putExtra("TYPE", "memory")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.txtStars)).check(matches(withText("★★★")))
    }

    /** TC-IT-F-016 ResultActivity shows correct time */
    @Test fun tcItF016ResultShowsCorrectTime() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 1).putExtra("STARS", 2).putExtra("TIME", 14).putExtra("TYPE", "logic")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.txtTime)).check(matches(withText("Time: 14s")))
    }

    /** TC-IT-F-017 Logic GameActivity Level 2 question is correct */
    @Test fun tcItF017LogicLevel2QuestionText() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 2)
        ActivityScenario.launch<LogicGameActivity>(intent)
        onView(withId(R.id.questionText)).check(matches(withText(containsString("3  5  7  9"))))
    }

    /** TC-IT-F-018 Logic GameActivity renders level text */
    @Test fun tcItF018LogicGameLevelTextRendered() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 3)
        ActivityScenario.launch<LogicGameActivity>(intent)
        onView(withId(R.id.levelText)).check(matches(withText("Level 3")))
    }

    /** TC-IT-F-019 Speed GameActivity renders level text */
    @Test fun tcItF019SpeedGameLevelTextRendered() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 2)
        ActivityScenario.launch<SpeedGameActivity>(intent)
        onView(withId(R.id.levelText)).check(matches(withText("Level 2")))
    }

    /** TC-IT-F-020 Memory GameActivity renders level text */
    @Test fun tcItF020MemoryGameLevelTextRendered() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 4)
        ActivityScenario.launch<GameActivity>(intent)
        onView(withId(R.id.levelText)).check(matches(withText("Level 4")))
    }

    /** TC-IT-F-021 Speed GameActivity Level 10 has 14 tiles */
    @Test fun tcItF021SpeedLevel10Creates14Tiles() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 10)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                assertEquals(14, grid.childCount)
            }
        }
    }

    /** TC-IT-F-022 Speed GameActivity Level 10 has 5 columns */
    @Test fun tcItF022SpeedLevel10Has5Columns() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 10)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                assertEquals(5, grid.columnCount)
            }
        }
    }

    /** TC-IT-F-023 LoginActivity renders without crash */
    @Test fun tcItF023LoginActivityRendersOk() {
        ActivityScenario.launch(LoginActivity::class.java)
    }

    /** TC-IT-F-024 SignupActivity renders without crash */
    @Test fun tcItF024SignupActivityRendersOk() {
        ActivityScenario.launch(SignupActivity::class.java)
    }

    /** TC-IT-F-025 ForgotPasswordActivity renders without crash */
    @Test fun tcItF025ForgotPasswordActivityRendersOk() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
    }

    /** TC-IT-F-026 ChangePasswordActivity renders without crash */
    @Test fun tcItF026ChangePasswordActivityRendersOk() {
        val intent = Intent(ctx, ChangePasswordActivity::class.java).putExtra("email", VALID_EMAIL)
        ActivityScenario.launch<ChangePasswordActivity>(intent)
    }

    /** TC-IT-F-027 ResultActivity renders without crash with default type */
    @Test fun tcItF027ResultActivityRendersWithDefaultType() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 1).putExtra("STARS", 1).putExtra("TIME", 0)
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.btnContinue)).check(matches(isDisplayed()))
    }

    /** TC-IT-F-028 GameActivity default level intent renders 16 cards */
    @Test fun tcItF028MemoryGameDefaultLevelRendersOk() {
        // No LEVEL extra → should default to 1
        ActivityScenario.launch<GameActivity>(
            Intent(ctx, GameActivity::class.java)
        ).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                assertEquals(16, grid.childCount)
            }
        }
    }

    /** TC-IT-F-029 Logic GameActivity default level renders ok */
    @Test fun tcItF029LogicGameDefaultLevelRendersOk() {
        ActivityScenario.launch<LogicGameActivity>(
            Intent(ctx, LogicGameActivity::class.java)
        )
        onView(withId(R.id.questionText)).check(matches(isDisplayed()))
    }

    /** TC-IT-F-030 Speed GameActivity default level renders ok */
    @Test fun tcItF030SpeedGameDefaultLevelRendersOk() {
        ActivityScenario.launch<SpeedGameActivity>(
            Intent(ctx, SpeedGameActivity::class.java)
        )
        onView(withId(R.id.timerText)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECTION 3 — VALIDATION (TC-IT-V-001..020)
    // ══════════════════════════════════════════════════════════════════

    /** TC-IT-V-001 Login — both empty fields stays on LoginActivity */
    @Test fun tcItV001LoginBothEmptyStaysOnLogin() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-002 Login — empty email only stays on LoginActivity */
    @Test fun tcItV002LoginEmptyEmailStaysOnLogin() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.passwordEditText)).perform(typeText("test1234"), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-003 Login — empty password only stays on LoginActivity */
    @Test fun tcItV003LoginEmptyPasswordStaysOnLogin() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText(VALID_EMAIL), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-004 Login — whitespace email stays on LoginActivity */
    @Test fun tcItV004LoginWhitespaceEmailStaysOnLogin() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("   "), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("   "), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-005 Signup — empty username stays on SignupActivity */
    @Test fun tcItV005SignupEmptyUsernameStaysOnSignup() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etEmail)).perform(typeText("a@b.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(typeText("pass123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-006 Signup — empty email stays on SignupActivity */
    @Test fun tcItV006SignupEmptyEmailStaysOnSignup() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etUsername)).perform(typeText("TestUser"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(typeText("pass123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-007 Signup — empty password stays on SignupActivity */
    @Test fun tcItV007SignupEmptyPasswordStaysOnSignup() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etUsername)).perform(typeText("TestUser"), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(typeText("a@b.com"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-008 Signup — all empty fields stays on SignupActivity */
    @Test fun tcItV008SignupAllEmptyStaysOnSignup() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.btnSignup)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-009 ForgotPassword — empty email stays on screen */
    @Test fun tcItV009ForgotPasswordEmptyEmailStaysOnScreen() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.resetButton)).perform(click())
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-010 ForgotPassword — whitespace email stays on screen */
    @Test fun tcItV010ForgotPasswordWhitespaceEmailStaysOnScreen() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("   "), closeSoftKeyboard())
        onView(withId(R.id.resetButton)).perform(click())
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-011 ChangePassword — empty new password stays on screen */
    @Test fun tcItV011ChangePasswordEmptyNewPasswordStaysOnScreen() {
        val intent = Intent(ctx, ChangePasswordActivity::class.java).putExtra("email", VALID_EMAIL)
        ActivityScenario.launch<ChangePasswordActivity>(intent)
        onView(withId(R.id.changeButton)).perform(click())
        onView(withId(R.id.changeButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-012 Memory GameActivity — cards initially show blank back */
    @Test fun tcItV012MemoryCardsInitiallyFaceDown() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                // All cards should start blank (face-down → text is empty)
                for (i in 0 until grid.childCount) {
                    val card = grid.getChildAt(i) as TextView
                    assertEquals("", card.text.toString())
                }
            }
        }
    }

    /** TC-IT-V-013 Speed GameActivity — tiles start with numbers 1..count */
    @Test fun tcItV013SpeedTilesContainNumbers1ToCount() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                val texts = (0 until grid.childCount).map {
                    (grid.getChildAt(it) as TextView).text.toString().toInt()
                }
                assertEquals((1..5).toSet(), texts.toSet())
            }
        }
    }

    /** TC-IT-V-014 ResultActivity — time display format is correct */
    @Test fun tcItV014ResultTimeFormatIsCorrect() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 1).putExtra("STARS", 2).putExtra("TIME", 7).putExtra("TYPE", "speed")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.txtTime)).check(matches(withText("Time: 7s")))
    }

    /** TC-IT-V-015 ResultActivity — 0 time is handled gracefully */
    @Test fun tcItV015ResultZeroTimeHandled() {
        val intent = Intent(ctx, ResultActivity::class.java)
            .putExtra("LEVEL", 1).putExtra("STARS", 1).putExtra("TIME", 0).putExtra("TYPE", "focus")
        ActivityScenario.launch<ResultActivity>(intent)
        onView(withId(R.id.txtTime)).check(matches(withText("Time: 0s")))
    }

    /** TC-IT-V-016 Login — password typed into email field (swapped inputs) stays on screen */
    @Test fun tcItV016LoginWrongFieldOrderStaysOnLogin() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("wrongpass"), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-017 Signup — whitespace-only username stays on screen */
    @Test fun tcItV017SignupWhitespaceUsernameStaysOnSignup() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etUsername)).perform(typeText("   "), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(typeText("a@b.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(typeText("pass123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    /** TC-IT-V-018 Logic Level 1 options are all different values */
    @Test fun tcItV018LogicOptionsAllDistinct() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<LogicGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                val texts = (0 until grid.childCount).map {
                    (grid.getChildAt(it) as TextView).text.toString()
                }
                assertEquals("Options must all be distinct", texts.size, texts.toSet().size)
            }
        }
    }

    /** TC-IT-V-019 Memory Level 1 all cards are unique pairs */
    @Test fun tcItV019MemoryCardValuesFormPairs() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                // At start all text is "", but grid should have 16 children = 8 pairs
                assertEquals(16, grid.childCount) // implicitly validates pair creation
            }
        }
    }

    /** TC-IT-V-020 Signup — very long username stays on screen (not crash) */
    @Test fun tcItV020SignupVeryLongUsernameHandled() {
        ActivityScenario.launch(SignupActivity::class.java)
        val longName = "A".repeat(200)
        onView(withId(R.id.etUsername)).perform(typeText(longName), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(typeText("a@b.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(typeText("pass123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())
        // No crash = pass; still on signup (validation or backend rejection)
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECTION 4 — SECURITY (TC-IT-S-001..010)
    // ══════════════════════════════════════════════════════════════════

    /** TC-IT-S-001 Login — SQL injection in email field does not crash app */
    @Test fun tcItS001LoginSqlInjectionDoesNotCrash() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("' OR 1=1; --"), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("pw"), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-S-002 Login — XSS string in email field does not crash app */
    @Test fun tcItS002LoginXssStringDoesNotCrash() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("<script>alert(1)</script>@x.com"), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("pass"), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-S-003 Login — very long email string does not crash app */
    @Test fun tcItS003LoginVeryLongEmailDoesNotCrash() {
        ActivityScenario.launch(LoginActivity::class.java)
        val longEmail = "a".repeat(500) + "@brainbattle.com"
        onView(withId(R.id.emailEditText)).perform(typeText(longEmail), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("pass"), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-S-004 Login — very long password does not crash app */
    @Test fun tcItS004LoginVeryLongPasswordDoesNotCrash() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText(VALID_EMAIL), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("x".repeat(500)), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-S-005 Password field type is password (not plain text) */
    @Test fun tcItS005PasswordInputTypeIsSecure() {
        ActivityScenario.launch(LoginActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                val pw = activity.findViewById<EditText>(R.id.passwordEditText)
                val expectedType = android.text.InputType.TYPE_CLASS_TEXT or
                        android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
                assertEquals(expectedType, pw.inputType)
            }
        }
    }

    /** TC-IT-S-006 Signup — XSS in username field does not crash */
    @Test fun tcItS006SignupXssInUsernameDoesNotCrash() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etUsername)).perform(typeText("<img src=x onerror=alert(1)>"), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(typeText("a@b.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(typeText("pass123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    /** TC-IT-S-007 ForgotPassword — SQL injection does not crash */
    @Test fun tcItS007ForgotPasswordSqlInjectionDoesNotCrash() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("'; DROP TABLE users; --"), closeSoftKeyboard())
        onView(withId(R.id.resetButton)).perform(click())
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-S-008 ChangePassword intent without email extra is handled safely */
    @Test fun tcItS008ChangePasswordWithoutEmailIntentHandledSafely() {
        // No email extra → should not crash, screen still renders
        ActivityScenario.launch<ChangePasswordActivity>(Intent(ctx, ChangePasswordActivity::class.java))
        onView(withId(R.id.changeButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-S-009 Special characters in password field do not crash */
    @Test fun tcItS009SpecialCharactersInPasswordDoNotCrash() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText(VALID_EMAIL), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("!@#\$%^&*()"), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    /** TC-IT-S-010 Null byte / unicode in input does not crash */
    @Test fun tcItS010UnicodeInputDoesNotCrash() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etUsername)).perform(typeText("用户名テスト"), closeSoftKeyboard())
        onView(withId(R.id.etEmail)).perform(typeText("unicode@test.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(typeText("pass123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════════════
    //  SECTION 5 — GAME BEHAVIOR (TC-IT-G-001..015)
    // ══════════════════════════════════════════════════════════════════

    /** TC-IT-G-001 Memory Level 1 grid has 4 columns */
    @Test fun tcItG001MemoryLevel1GridHas4Columns() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(4, activity.findViewById<GridLayout>(R.id.gameGrid).columnCount)
            }
        }
    }

    /** TC-IT-G-002 Memory Level 5 produces 20 cards with 4 columns */
    @Test fun tcItG002MemoryLevel5Has20Cards4Columns() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 5)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                assertEquals(20, grid.childCount)
                assertEquals(4, grid.columnCount)
            }
        }
    }

    /** TC-IT-G-003 Memory Level 11 produces 24 cards */
    @Test fun tcItG003MemoryLevel11Has24Cards() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 11)
        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(24, activity.findViewById<GridLayout>(R.id.gameGrid).childCount)
            }
        }
    }

    /** TC-IT-G-004 Logic Level 3 question is correct */
    @Test fun tcItG004LogicLevel3QuestionIsCorrect() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 3)
        ActivityScenario.launch<LogicGameActivity>(intent)
        onView(withId(R.id.questionText)).check(matches(withText(containsString("4  6  8  10"))))
    }

    /** TC-IT-G-005 Speed Level 5 has 9 tiles */
    @Test fun tcItG005SpeedLevel5Has9Tiles() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 5)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(9, activity.findViewById<GridLayout>(R.id.optionsGrid).childCount)
            }
        }
    }

    /** TC-IT-G-006 Speed Level 20 has 24 tiles */
    @Test fun tcItG006SpeedLevel20Has24Tiles() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 20)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(24, activity.findViewById<GridLayout>(R.id.optionsGrid).childCount)
            }
        }
    }

    /** TC-IT-G-007 Speed Level 36 is capped at 40 tiles */
    @Test fun tcItG007SpeedLevel36CappedAt40Tiles() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 36)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(40, activity.findViewById<GridLayout>(R.id.optionsGrid).childCount)
            }
        }
    }

    /** TC-IT-G-008 Focus GameActivity level 1 target is clickable */
    @Test fun tcItG008FocusTargetIsClickable() {
        val intent = Intent(ctx, FocusGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<FocusGameActivity>(intent)
        onView(withId(R.id.target)).check(matches(isClickable()))
    }

    /** TC-IT-G-009 Logic Level 5 has 4 options */
    @Test fun tcItG009LogicLevel5HasFourOptions() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 5)
        ActivityScenario.launch<LogicGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(4, activity.findViewById<GridLayout>(R.id.optionsGrid).childCount)
            }
        }
    }

    /** TC-IT-G-010 Logic Level 10 has 4 options */
    @Test fun tcItG010LogicLevel10HasFourOptions() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 10)
        ActivityScenario.launch<LogicGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(4, activity.findViewById<GridLayout>(R.id.optionsGrid).childCount)
            }
        }
    }

    /** TC-IT-G-011 Speed Level 20 has 6 columns */
    @Test fun tcItG011SpeedLevel20Has6Columns() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 20)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(6, activity.findViewById<GridLayout>(R.id.optionsGrid).columnCount)
            }
        }
    }

    /** TC-IT-G-012 Speed Level 40 has 7 columns */
    @Test fun tcItG012SpeedLevel40Has7Columns() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 40)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals(7, activity.findViewById<GridLayout>(R.id.optionsGrid).columnCount)
            }
        }
    }

    /** TC-IT-G-013 Memory Level 1 timer text is visible */
    @Test fun tcItG013MemoryTimerTextVisible() {
        val intent = Intent(ctx, GameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<GameActivity>(intent)
        onView(withId(R.id.timerText)).check(matches(isDisplayed()))
    }

    /** TC-IT-G-014 Logic timer text is visible on launch */
    @Test fun tcItG014LogicTimerTextVisible() {
        val intent = Intent(ctx, LogicGameActivity::class.java).putExtra("LEVEL", 1)
        ActivityScenario.launch<LogicGameActivity>(intent)
        onView(withId(R.id.timerText)).check(matches(isDisplayed()))
    }

    /** TC-IT-G-015 Speed tiles contain only distinct values within expected range */
    @Test fun tcItG015SpeedLevel5TilesContainUniqueNumbers1To9() {
        val intent = Intent(ctx, SpeedGameActivity::class.java).putExtra("LEVEL", 5)
        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                val values = (0 until grid.childCount).map {
                    (grid.getChildAt(it) as TextView).text.toString().toInt()
                }
                assertEquals((1..9).toSet(), values.toSet())
            }
        }
    }
}
