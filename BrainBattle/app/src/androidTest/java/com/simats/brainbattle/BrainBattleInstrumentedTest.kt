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
    @Test fun `TC-A-UI-003 LoginActivity all UI elements visible`() {
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
    @Test fun `TC-A-UI-004 login password field is masked`() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.passwordEditText)).check(
            matches(hasInputType(
                android.text.InputType.TYPE_CLASS_TEXT or
                android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            ))
        )
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-UI-005 | SignupActivity — All Fields Visible
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-UI-005 SignupActivity all fields visible`() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.usernameEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.passwordEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.signupButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-UI-022 | ForgotPasswordActivity — Email Input Visible
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-UI-022 ForgotPasswordActivity email input visible`() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.forgotEmailEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.verifyButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-001 | Login — Empty Email Shows Toast
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-V-001 login empty email shows validation toast`() {
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
    @Test fun `TC-A-V-002 login empty password shows validation toast`() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText(VALID_EMAIL), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-003 | Login — Both Fields Empty
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-V-003 login both empty stays on login`() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-004 | Login — Whitespace-Only Input
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-V-004 login whitespace only treated as empty`() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("   "), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("   "), closeSoftKeyboard())
        onView(withId(R.id.loginButton)).perform(click())
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-006 | Signup — Empty Username Validation
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-V-006 signup empty username validation`() {
        ActivityScenario.launch(SignupActivity::class.java)
        onView(withId(R.id.emailEditText)).perform(typeText("a@b.com"), closeSoftKeyboard())
        onView(withId(R.id.passwordEditText)).perform(typeText("pass123"), closeSoftKeyboard())
        onView(withId(R.id.signupButton)).perform(click())
        onView(withId(R.id.signupButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-007 | ForgotPassword — Empty Email Validation
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-V-007 forgot password empty email validation`() {
        ActivityScenario.launch(ForgotPasswordActivity::class.java)
        onView(withId(R.id.verifyButton)).perform(click())
        onView(withId(R.id.verifyButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-V-013 | ChangePassword — Empty Password Validation
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-V-013 change password empty field stays on screen`() {
        val ctx = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(ctx, ChangePasswordActivity::class.java).apply {
            putExtra("email", VALID_EMAIL)
        }
        ActivityScenario.launch<ChangePasswordActivity>(intent)
        onView(withId(R.id.submitButton)).perform(click())
        onView(withId(R.id.submitButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-F-005 | Navigate to SignupActivity from Login
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-F-005 login signup text opens signup activity`() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.signupText)).perform(click())
        // SignupActivity should be visible
        onView(withId(R.id.signupButton)).check(matches(isDisplayed()))
    }

    // ══════════════════════════════════════════════════════════
    //  TC-A-F-006 | Navigate to ForgotPasswordActivity from Login
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-F-006 login forgot text opens forgot password activity`() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.forgotText)).perform(click())
        onView(withId(R.id.verifyButton)).check(matches(isDisplayed()))
    }
}
