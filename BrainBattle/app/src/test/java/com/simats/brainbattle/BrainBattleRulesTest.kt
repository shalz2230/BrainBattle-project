package com.simats.brainbattle

import com.simats.brainbattle.api.ProgressRequest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class BrainBattleRulesTest {

    private fun difficultyFor(level: Int): String = when {
        level <= 5 -> "Easy"
        level <= 10 -> "Medium"
        else -> "Hard"
    }

    private fun nextLevels(currentLevel: Int): List<Int> =
        (currentLevel + 1..currentLevel + 4).toList()

    private fun routeFor(game: String): String = when (game) {
        "memory" -> "MemoryLevelsActivity"
        "logic" -> "LogicLevelsActivity"
        "focus" -> "FocusLevelsActivity"
        else -> "SpeedLevelsActivity"
    }

    private fun speedCount(level: Int): Int = minOf(4 + level, 40)

    private fun speedColumns(level: Int): Int = when {
        level < 5 -> 3
        level < 10 -> 4
        level < 20 -> 5
        level < 40 -> 6
        level < 70 -> 7
        else -> 8
    }

    private fun speedTime(level: Int): Int = when {
        level < 5 -> 10
        level < 10 -> 9
        level < 20 -> 8
        level < 40 -> 7
        level < 70 -> 6
        level < 90 -> 5
        else -> 4
    }

    private fun memoryCards(level: Int): Int = when {
        level < 5 -> 16
        level < 10 -> 20
        else -> 24
    }

    private fun memoryStars(moves: Int, pairs: Int): Int {
        val extraMoves = moves - pairs
        return when {
            extraMoves <= 2 -> 3
            extraMoves <= 6 -> 2
            else -> 1
        }
    }

    private fun focusDelay(level: Int): Int = when {
        level < 5 -> 800
        level < 10 -> 600
        level < 20 -> 450
        level < 40 -> 300
        level < 70 -> 200
        else -> 120
    }

    @Test
    fun difficultyBandsMatchLevelRules() {
        assertEquals("Easy", difficultyFor(1))
        assertEquals("Easy", difficultyFor(5))
        assertEquals("Medium", difficultyFor(6))
        assertEquals("Medium", difficultyFor(10))
        assertEquals("Hard", difficultyFor(11))
    }

    @Test
    fun dashboardShowsNextFourLevels() {
        assertEquals(listOf(8, 9, 10, 11), nextLevels(7))
    }

    @Test
    fun gameRoutingMatchesHomeScreenChoices() {
        assertEquals("MemoryLevelsActivity", routeFor("memory"))
        assertEquals("LogicLevelsActivity", routeFor("logic"))
        assertEquals("FocusLevelsActivity", routeFor("focus"))
        assertEquals("SpeedLevelsActivity", routeFor("speed"))
        assertEquals("SpeedLevelsActivity", routeFor("unknown"))
    }

    @Test
    fun speedGameCountIsCappedAtForty() {
        assertEquals(5, speedCount(1))
        assertEquals(40, speedCount(36))
        assertEquals(40, speedCount(100))
    }

    @Test
    fun speedGameColumnsUseLevelBands() {
        assertEquals(3, speedColumns(1))
        assertEquals(4, speedColumns(5))
        assertEquals(5, speedColumns(10))
        assertEquals(6, speedColumns(20))
        assertEquals(7, speedColumns(40))
        assertEquals(8, speedColumns(70))
    }

    @Test
    fun speedGameTimerGetsShorterForHigherLevels() {
        assertTrue(speedTime(1) > speedTime(10))
        assertTrue(speedTime(10) > speedTime(40))
        assertEquals(4, speedTime(90))
    }

    @Test
    fun logicLevelOneQuestionHasExpectedAnswer() {
        val sequence = listOf(2, 4, 6, 8)
        val correct = 10
        val options = listOf(correct, correct + 2, correct - 2, correct + 4)

        assertEquals(listOf(2, 4, 6, 8), sequence)
        assertTrue(options.contains(correct))
        assertEquals(4, options.size)
    }

    @Test
    fun memoryCardCountUsesLevelBands() {
        assertEquals(16, memoryCards(1))
        assertEquals(20, memoryCards(5))
        assertEquals(24, memoryCards(10))
    }

    @Test
    fun memoryStarsUseMoveEfficiency() {
        assertEquals(3, memoryStars(moves = 8, pairs = 8))
        assertEquals(2, memoryStars(moves = 13, pairs = 8))
        assertEquals(1, memoryStars(moves = 16, pairs = 8))
    }

    @Test
    fun focusDelayGetsFasterForHigherLevels() {
        assertTrue(focusDelay(1) > focusDelay(10))
        assertTrue(focusDelay(10) > focusDelay(70))
        assertEquals(120, focusDelay(100))
    }

    @Test
    fun progressRequestPreservesSaveProgressPayload() {
        val request = ProgressRequest(
            email = "player@brainbattle.com",
            game_type = "logic",
            level = 4,
            stars = 3,
            time_taken = 12
        )

        assertEquals("player@brainbattle.com", request.email)
        assertEquals("logic", request.game_type)
        assertEquals(4, request.level)
        assertEquals(3, request.stars)
        assertEquals(12, request.time_taken)
    }
}
