// ─── utils/scoringEngine.js ───────────────────────────────────────────
// Layer 2 of the two-layer evaluation system: DETERMINISTIC SCORING.
//
// WHY DETERMINISTIC?
// AI (Layer 1) is great at reading nuance — it can tell if an answer
// is "mostly right but misses the edge case about closures."
// But AI is BAD at consistent numbers — ask it to score the same
// answer twice and you might get 7 one time and 8 the next.
//
// So we let AI do what it's good at (nuanced 0-10 rubric scores),
// then apply a DETERMINISTIC formula here. Same inputs will ALWAYS
// produce the same output. This is crucial for:
//   - Fair gamification (ranks, leaderboards)
//   - Testability (we can unit test this with known inputs)
//   - Tunability (change weights without touching AI prompts)
//
// SCORING FORMULA:
//   baseScore = Σ(weight_i × rubricScore_i)  // Weighted average
//   timeBonus = maxBonus × (1 - timeSpent/window)  // Linear decay
//   comboMultiplier = 1 + (comboStreak × increment)  // Capped at max
//   finalScore = (baseScore × comboMultiplier) + timeBonus
// ──────────────────────────────────────────────────────────────────────

const { SCORING_WEIGHTS, RANKS, COMBO, TIME_BONUS } = require('../config/constants');

// ──────────────────────────────────────────────────────────────────────
// WEIGHTED BASE SCORE
// Takes the 4 rubric scores from AI and produces a single 0-10 score.
// ──────────────────────────────────────────────────────────────────────
function calculateWeightedScore(scores) {
    // Destructure with defaults to prevent NaN if a score is missing
    const {
        correctness = 0,
        clarity = 0,
        depth = 0,
        examples = 0,
    } = scores;

    const weighted =
        correctness * SCORING_WEIGHTS.correctness +  // 40%
        clarity * SCORING_WEIGHTS.clarity +       // 20%
        depth * SCORING_WEIGHTS.depth +         // 25%
        examples * SCORING_WEIGHTS.examples;       // 15%

    // Round to 2 decimal places for clean UI display
    return Math.round(weighted * 100) / 100;
}

// ──────────────────────────────────────────────────────────────────────
// TIME BONUS
// Rewards quick answers with bonus points. The bonus decays linearly:
//   - Answer at 0 seconds → full bonus (2.0 points)
//   - Answer at 60 seconds → half bonus (1.0 point)
//   - Answer at 120+ seconds → no bonus (0 points)
//
// WHY LINEAR DECAY (not exponential)?
// Linear is more intuitive for users — "every 10 seconds costs me
// the same amount of bonus." Exponential would punish slow starters
// more harshly, which isn't fair for thoughtful answers.
// ──────────────────────────────────────────────────────────────────────
function calculateTimeBonus(timeSpentSeconds) {
    if (timeSpentSeconds <= 0) return TIME_BONUS.maxBonusPoints;
    if (timeSpentSeconds >= TIME_BONUS.windowSeconds) return 0;

    const ratio = 1 - (timeSpentSeconds / TIME_BONUS.windowSeconds);
    return Math.round(ratio * TIME_BONUS.maxBonusPoints * 100) / 100;
}

// ──────────────────────────────────────────────────────────────────────
// COMBO MULTIPLIER
// Consecutive good answers (score ≥ 7) build a streak.
// The multiplier increases by 0.1x per streak, capped at 1.5x.
//
// Example:
//   combo=0 → 1.0x (no bonus)
//   combo=1 → 1.1x
//   combo=3 → 1.3x
//   combo=5 → 1.5x (capped)
//   combo=8 → 1.5x (still capped)
//
// WHY A CAP?
// Without a cap, long streaks would make scores unreasonably high,
// breaking the rank system. 1.5x is enough to feel rewarding
// without distorting the leaderboard.
// ──────────────────────────────────────────────────────────────────────
function calculateComboMultiplier(comboStreak) {
    const multiplier = 1 + (comboStreak * COMBO.multiplierIncrement);
    return Math.min(multiplier, COMBO.maxMultiplier);
}

// ──────────────────────────────────────────────────────────────────────
// RANK DETERMINATION
// Given a cumulative score, returns the highest rank the player has
// achieved. We iterate the ranks array in reverse (highest first)
// so the first match is the correct rank.
// ──────────────────────────────────────────────────────────────────────
function determineRank(cumulativeScore) {
    // Iterate from highest rank to lowest
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (cumulativeScore >= RANKS[i].threshold) {
            return {
                current: RANKS[i],
                // Next rank info (for progress bar in UI)
                next: RANKS[i + 1] || null,
                progress: RANKS[i + 1]
                    ? Math.round(
                        ((cumulativeScore - RANKS[i].threshold) /
                            (RANKS[i + 1].threshold - RANKS[i].threshold)) *
                        100
                    )
                    : 100, // Already at max rank
            };
        }
    }
    // Fallback — should never reach here since threshold[0] is 0
    return { current: RANKS[0], next: RANKS[1], progress: 0 };
}

// ══════════════════════════════════════════════════════════════════════
// MAIN SCORING FUNCTION
// This is the function the controller calls. It combines all the
// individual calculations into a single result object.
//
// Parameters:
//   - aiScores: { correctness, clarity, depth, examples } from Gemini
//   - timeSpentSeconds: how long the user took to answer
//   - comboStreak: number of consecutive good answers
//   - cumulativeScore: total points earned so far (for rank)
// ══════════════════════════════════════════════════════════════════════
function calculateFinalScore(aiScores, timeSpentSeconds = 60, comboStreak = 0, cumulativeScore = 0) {
    const baseScore = calculateWeightedScore(aiScores);
    const timeBonus = calculateTimeBonus(timeSpentSeconds);
    const comboMultiplier = calculateComboMultiplier(comboStreak);

    // The formula: (weighted_rubric × combo) + time_bonus
    const finalScore = Math.round((baseScore * comboMultiplier + timeBonus) * 100) / 100;

    // Determine if this answer continues or breaks the combo streak
    const isGoodAnswer = baseScore >= COMBO.goodScoreThreshold;
    const newComboStreak = isGoodAnswer ? comboStreak + 1 : 0;

    // Calculate new cumulative score for rank determination
    const newCumulativeScore = cumulativeScore + finalScore;
    const rank = determineRank(newCumulativeScore);

    return {
        // Individual scores for the breakdown UI
        breakdown: {
            baseScore,
            timeBonus,
            comboMultiplier,
            aiScores, // Pass through so UI can show the rubric radar chart
        },
        // Final computed values
        finalScore,
        // Gamification state
        gamification: {
            isGoodAnswer,
            comboStreak: newComboStreak,
            cumulativeScore: newCumulativeScore,
            rank,
        },
    };
}

module.exports = {
    calculateWeightedScore,
    calculateTimeBonus,
    calculateComboMultiplier,
    determineRank,
    calculateFinalScore,
};
