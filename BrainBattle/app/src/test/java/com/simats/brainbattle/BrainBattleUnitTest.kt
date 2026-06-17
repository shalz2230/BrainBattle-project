package com.simats.brainbattle

import org.junit.Assert.*
import org.junit.Test

/**
 * BrainBattle Android — Unit Tests
 * TC-A-U-001 to TC-A-U-020
 *
 * Pure JVM unit tests — no Android framework needed.
 * Run with: ./gradlew test
 */
class BrainBattleUnitTest {

    // ─── Game Logic Helpers (mirrored from Activity code) ────────

    private fun getDifficultyTag(level: Int): String = when {
        level <= 5  -> "Easy"
        level <= 10 -> "Medium"
        else        -> "Hard"
    }

    private fun getNextLevels(current: Int): List<Int> {
        return (current + 1..current + 4).toList()
    }

    private fun openGameIntent(game: String): String = when (game) {
        "memory" -> "MemoryLevelsActivity"
        "logic"  -> "LogicLevelsActivity"
        "focus"  -> "FocusLevelsActivity"
        else     -> "SpeedLevelsActivity"
    }

    private fun getCountForLevel(level: Int): Int = minOf(4 + level, 40)

    private fun getColsForLevel(level: Int): Int = when {
        level < 5  -> 3
        level < 10 -> 4
        level < 20 -> 5
        level < 40 -> 6
        level < 70 -> 7
        else       -> 8
    }

    private fun getTimeForLevel(level: Int): Int = when {
        level < 5  -> 10
        level < 10 -> 9
        level < 20 -> 8
        level < 40 -> 7
        level < 70 -> 6
        level < 90 -> 5
        else       -> 4
    }

    private fun getMemoryGridConfig(level: Int): Pair<Int, Int> = when {
        level < 5  -> Pair(16, 4)
        level < 10 -> Pair(20, 4)
        else       -> Pair(24, 4)
    }

    private fun calcMemoryStars(moves: Int, pairs: Int): Int {
        val extra = (moves + 1) - pairs
        return when {
            extra <= 2 -> 3
            extra <= 6 -> 2
            else       -> 1
        }
    }

    private fun generateLogicQuestion(level: Int): Triple<List<Int>, Int, List<Int>> {
        val a = level + 1; val b = a + 2; val c = b + 2; val d = c + 2; val correct = d + 2
        val options = listOf(correct, correct + 2, correct - 2, correct + 4)
        return Triple(listOf(a, b, c, d), correct, options)
    }

    private fun getFocusSpeed(level: Int): Int = when {
        level < 5  -> 800
        level < 10 -> 600
        level < 20 -> 450
        level < 40 -> 300
        level < 70 -> 200
        else       -> 120
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-001 — Difficulty tag: level ≤ 5 = "Easy"
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-001 level 1 difficulty tag is Easy`() {
        assertEquals("Easy", getDifficultyTag(1))
        assertEquals("Easy", getDifficultyTag(5))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-002 — Difficulty tag: level 6–10 = "Medium"
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-002 level 8 difficulty tag is Medium`() {
        assertEquals("Medium", getDifficultyTag(6))
        assertEquals("Medium", getDifficultyTag(10))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-003 — Difficulty tag: level > 10 = "Hard"
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-003 level 15 difficulty tag is Hard`() {
        assertEquals("Hard", getDifficultyTag(11))
        assertEquals("Hard", getDifficultyTag(100))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-004 — showNextLevels(5) returns [6, 7, 8, 9]
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-004 showNextLevels(5) returns 4 levels starting at 6`() {
        val levels = getNextLevels(5)
        assertEquals(4, levels.size)
        assertEquals(listOf(6, 7, 8, 9), levels)
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-005 — openGame("memory") routes to MemoryLevelsActivity
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-005 openGame memory routes to MemoryLevelsActivity`() {
        assertEquals("MemoryLevelsActivity", openGameIntent("memory"))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-006 — openGame("logic") routes to LogicLevelsActivity
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-006 openGame logic routes to LogicLevelsActivity`() {
        assertEquals("LogicLevelsActivity", openGameIntent("logic"))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-007 — openGame("focus") routes to FocusLevelsActivity
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-007 openGame focus routes to FocusLevelsActivity`() {
        assertEquals("FocusLevelsActivity", openGameIntent("focus"))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-008 — openGame("speed") routes to SpeedLevelsActivity
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-008 openGame speed routes to SpeedLevelsActivity`() {
        assertEquals("SpeedLevelsActivity", openGameIntent("speed"))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-009 — openGame unknown falls back to SpeedLevelsActivity
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-009 openGame unknown falls back to SpeedLevelsActivity`() {
        assertEquals("SpeedLevelsActivity", openGameIntent("unknown"))
        assertEquals("SpeedLevelsActivity", openGameIntent(""))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-010 — Speed level 1 count = 5 (min(4+1, 40))
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-010 getCountForLevel(1) returns 5`() {
        assertEquals(5, getCountForLevel(1))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-011 — Speed level 100 count capped at 40
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-011 getCountForLevel(100) is capped at 40`() {
        assertEquals(40, getCountForLevel(100))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-012 — Logic game level 1 correct arithmetic
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-012 generateLogicQuestion level 1 sequence is 2 4 6 8 correct 10`() {
        val (seq, correct, options) = generateLogicQuestion(1)
        assertEquals(listOf(2, 4, 6, 8), seq)
        assertEquals(10, correct)
        assertTrue(options.contains(correct))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-013 — Logic options always include the correct answer
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-013 logic options always include correct answer for levels 1 to 10`() {
        for (level in 1..10) {
            val (_, correct, options) = generateLogicQuestion(level)
            assertEquals("Level $level: options must have 4 items", 4, options.size)
            assertTrue("Level $level: options must include correct=$correct", options.contains(correct))
        }
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-014 — Memory grid Level 1 = 16 cards (4x4)
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-014 getMemoryGridConfig level 1 is 16 cards 4 cols`() {
        val (total, cols) = getMemoryGridConfig(1)
        assertEquals(16, total)
        assertEquals(4, cols)
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-015 — Memory grid Level 7 = 20 cards (4x5)
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-015 getMemoryGridConfig level 7 is 20 cards 4 cols`() {
        val (total, cols) = getMemoryGridConfig(7)
        assertEquals(20, total)
        assertEquals(4, cols)
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-016 — Memory grid Level 10 = 24 cards (4x6)
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-016 getMemoryGridConfig level 10 is 24 cards 4 cols`() {
        val (total, cols) = getMemoryGridConfig(10)
        assertEquals(24, total)
        assertEquals(4, cols)
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-017 — Memory star = 3 (extra ≤ 2, perfect play)
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-017 calcMemoryStars 3 stars when extra is 0`() {
        // 8 pairs, 8 moves → extra = (8+1) - 8 = 1
        assertEquals(3, calcMemoryStars(8, 8))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-018 — Memory star = 2 (extra 3–6)
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-018 calcMemoryStars 2 stars when extra is 4`() {
        // 8 pairs, 11 moves → extra = (11+1) - 8 = 4
        assertEquals(2, calcMemoryStars(11, 8))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-019 — Memory star = 1 (extra > 6)
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-019 calcMemoryStars 1 star when extra is 9`() {
        // 8 pairs, 16 moves → extra = (16+1) - 8 = 9
        assertEquals(1, calcMemoryStars(16, 8))
    }

    // ══════════════════════════════════════════════════════════
    // TC-A-U-020 — Focus speed decreases as level increases
    // ══════════════════════════════════════════════════════════
    @Test fun `TC-A-U-020 getFocusSpeed returns faster speed for higher levels`() {
        assertTrue(getFocusSpeed(1) > getFocusSpeed(10))
        assertTrue(getFocusSpeed(10) > getFocusSpeed(20))
        assertTrue(getFocusSpeed(70) >= 120)
        assertEquals(800, getFocusSpeed(1))
        assertEquals(120, getFocusSpeed(70))
    }
}
