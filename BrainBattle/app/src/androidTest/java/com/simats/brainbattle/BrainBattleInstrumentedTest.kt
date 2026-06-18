package com.simats.brainbattle

import android.content.Intent
import android.widget.EditText
import android.widget.Button
import android.widget.TextView
import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.*
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.hamcrest.CoreMatchers.*
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * BrainBattle Android — UI/UX + Functional + Validation Instrumented Tests
 * TC-A-UI-001..025, TC-A-F-001..030 (selected subset), TC-A-V-001..015
 *
 * Run with: ./gradlew connectedAndroidTest
 * Device/Emulator required (API 24+)
 */
@RunWith(AndroidJUnit4::class)
class BrainBattleInstrumentedTest {

    companion object {
        const val VALID_EMAIL = "test@brainbattle.com"
        const val VALID_PASS  = "test1234"
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-UI-003 | LoginActivity — All UI Elements Visible
    // ══════════════════════════════════════════════════════════
    @Test fun tcAUi003LoginActivityAllUiElementsVisible() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.passwordEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
        onView(withId(R.id.signupText)).check(matches(isDisplayed()))
        onView(withId(R.id.forgotText)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-UI-004 | Login — Password Field is Masked
    // ══════════════════════════════════════════════════════════
    @Test fun tcAUi004LoginPasswordFieldIsMasked() {
        ActivityScenario.launch(LoginActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                val password = activity.findViewById<EditText>(R.id.passwordEditText)
                assertEquals(
                android.text.InputType.TYPE_CLASS_TEXT or
                    android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD,
                    password.inputType
                )
            }
        }
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-UI-005 | SignupActivity — All Fields Visible
    // ══════════════════════════════════════════════════════════
    @Test fun tcAUi005SignupActivityAllFieldsVisible() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etUsername)).check(matches(isDisplayed()))
        onView(withId(R.id.etEmail)).check(matches(isDisplayed()))
        onView(withId(R.id.etPassword)).check(matches(isDisplayed()))
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-UI-022 | ForgotPasswordActivity — Email Input Visible
    // ══════════════════════════════════════════════════════════
    @Test fun tcAUi022ForgotPasswordActivityEmailInputVisible() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-001 | Login — Empty Email Shows Toast
    // ══════════════════════════════════════════════════════════
    @Test fun tcAV001LoginEmptyEmailShowsValidationToast() {
        ActivityScenario.launch(LoginActivity::class.java)
        // Leave email blank, fill only password
        onView(withId(R.id.passwordEditText)).perform(typeText("somepass"), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        // App should NOT navigate away — still on Login (checking email field still visible)
        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-002 | Login — Empty Password Shows Toast
    // ══════════════════════════════════════════════════════════
    @Test fun tcAV002LoginEmptyPasswordShowsValidationToast() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText(VALID_EMAIL), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-003 | Login — Both Fields Empty
    // ══════════════════════════════════════════════════════════
    @Test fun tcAV003LoginBothEmptyStaysOnLogin() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-004 | Login — Whitespace-Only Input
    // ══════════════════════════════════════════════════════════
    @Test fun tcAV004LoginWhitespaceOnlyTreatedAsEmpty() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("   "), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("   "), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-006 | Signup — Empty Username Validation
    // ══════════════════════════════════════════════════════════
    @Test fun tcAV006SignupEmptyUsernameValidation() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.etEmail)).perform(typeText("a@b.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(typeText("pass123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-007 | ForgotPassword — Empty Email Validation
    // ══════════════════════════════════════════════════════════
    @Test fun tcAV007ForgotPasswordEmptyEmailValidation() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.resetButton)).perform(click())
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-013 | ChangePassword — Empty Password Validation
    // ══════════════════════════════════════════════════════════
    @Test fun tcAV013ChangePasswordEmptyFieldStaysOnScreen() {
        val ctx = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(ctx, ChangePasswordActivity::class.java).apply {
            putExtra("email", VALID_EMAIL)
        }
        ActivityScenario.launch<ChangePasswordActivity>(intent)
        onView(withId(R.id.changeButton)).perform(click())
        onView(withId(R.id.changeButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-F-005 | Navigate to SignupActivity from Login
    // ══════════════════════════════════════════════════════════
    @Test fun tcAF005LoginSignupTextOpensSignupActivity() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.signupText)).perform(click())
        // SignupActivity should be visible
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-F-006 | Navigate to ForgotPasswordActivity from Login
    // ══════════════════════════════════════════════════════════
    @Test fun tcAF006LoginForgotTextOpensForgotPasswordActivity() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.forgotText)).perform(click())
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }
}
