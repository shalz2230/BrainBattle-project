package com.simats.brainbattle

import android.content.Intent
import android.widget.GridLayout
import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.typeText
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.hamcrest.CoreMatchers.allOf
import org.hamcrest.CoreMatchers.containsString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class BrainBattleUiFlowTest {

    @Test
    fun loginScreenRendersPrimaryAuthControls() {
        ActivityScenario.launch(LoginActivity::class.java)

        onView(withId(R.id.emailEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.passwordEditText)).check(matches(isDisplayed()))
        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
        onView(withId(R.id.signupText)).check(matches(isDisplayed()))
        onView(withId(R.id.forgotText)).check(matches(isDisplayed()))
    }

    @Test
    fun emptyLoginDoesNotNavigateAway() {
        ActivityScenario.launch(LoginActivity::class.java)

        onView(withId(R.id.loginButton)).perform(click())

        onView(withId(R.id.loginButton)).check(matches(isDisplayed()))
    }

    @Test
    fun signupScreenValidatesMissingUsernameLocally() {
        ActivityScenario.launch(SignupActivity::class.java)

        onView(withId(R.id.etEmail)).perform(typeText("new@brainbattle.com"), closeSoftKeyboard())
        onView(withId(R.id.etPassword)).perform(typeText("secret123"), closeSoftKeyboard())
        onView(withId(R.id.btnSignup)).perform(click())

        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))
    }

    @Test
    fun loginLinksOpenSignupAndForgotPasswordScreens() {
        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.signupText)).perform(click())
        onView(withId(R.id.btnSignup)).check(matches(isDisplayed()))

        ActivityScenario.launch(LoginActivity::class.java)
        onView(withId(R.id.forgotText)).perform(click())
        onView(withId(R.id.resetButton)).check(matches(isDisplayed()))
    }

    @Test
    fun changePasswordDisplaysEmailFromIntent() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(context, ChangePasswordActivity::class.java)
            .putExtra("email", "reset@brainbattle.com")

        ActivityScenario.launch<ChangePasswordActivity>(intent)

        onView(allOf(withId(R.id.emailEditText), withText("reset@brainbattle.com")))
            .check(matches(isDisplayed()))
    }

    @Test
    fun memoryGameLevelOneCreatesSixteenCards() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(context, GameActivity::class.java).putExtra("LEVEL", 1)

        ActivityScenario.launch<GameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.gameGrid)
                assertEquals(16, grid.childCount)
                assertEquals(4, grid.columnCount)
            }
        }
    }

    @Test
    fun logicGameLevelOneRendersQuestionAndFourOptions() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(context, LogicGameActivity::class.java).putExtra("LEVEL", 1)

        ActivityScenario.launch<LogicGameActivity>(intent).use { scenario ->
            onView(withId(R.id.questionText)).check(matches(withText(containsString("2  4  6  8"))))

            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                assertEquals(4, grid.childCount)
            }
        }
    }

    @Test
    fun speedGameLevelOneCreatesFiveOptions() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(context, SpeedGameActivity::class.java).putExtra("LEVEL", 1)

        ActivityScenario.launch<SpeedGameActivity>(intent).use { scenario ->
            scenario.onActivity { activity ->
                val grid = activity.findViewById<GridLayout>(R.id.optionsGrid)
                assertEquals(5, grid.childCount)
                assertEquals(3, grid.columnCount)
            }
        }
    }

    @Test
    fun resultScreenRendersIntentExtras() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(context, ResultActivity::class.java)
            .putExtra("LEVEL", 3)
            .putExtra("STARS", 2)
            .putExtra("TIME", 9)
            .putExtra("TYPE", "logic")

        ActivityScenario.launch<ResultActivity>(intent)

        onView(withId(R.id.txtLevel)).check(matches(withText(containsString("Level 3"))))
        onView(withId(R.id.txtStars)).check(matches(withText("\u2605\u2605")))
        onView(withId(R.id.txtTime)).check(matches(withText("Time: 9s")))
    }

    @Test
    fun levelSelectionScreensRenderProgressAndGrid() {
        ActivityScenario.launch(MemoryLevelsActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                assertNotNull(activity.findViewById(R.id.progressText))
                assertNotNull(activity.findViewById(R.id.levelsGrid))
            }
        }
    }
}
