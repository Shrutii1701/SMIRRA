/**
 * Central scoring logic for SMIRRA. Keeping this server-side means the rules
 * live in one place and cannot be tampered with from the browser.
 */

const CORRECT_THRESHOLD = 70; // overallScore >= this counts as a "correct" answer
const STRUGGLE_THRESHOLD = 50; // overallScore < this counts as "struggling"
const XP_PER_LEVEL = 500;

// Ordered difficulty ladder used by adaptive difficulty.
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

/**
 * Time bonus based on how quickly the answer was submitted (seconds).
 *   <30s: +20 | 30-60s: +10 | 60-90s: +5 | >90s: 0
 */
export function calculateTimeBonus(timeTaken) {
  if (timeTaken === undefined || timeTaken === null) return 0;
  if (timeTaken < 30) return 20;
  if (timeTaken <= 60) return 10;
  if (timeTaken <= 90) return 5;
  return 0;
}

/**
 * Combo system. Consecutive correct answers grow the bonus; a wrong answer
 * resets the streak.
 *   bonus = currentCombo * 5   (combo 0 -> +0, 1 -> +5, 2 -> +10, ...)
 * Returns the bonus earned now and the combo value to carry into the next answer.
 */
export function calculateCombo(aiScore, currentCombo = 0) {
  const isCorrect = aiScore >= CORRECT_THRESHOLD;
  if (isCorrect) {
    return {
      isCorrect,
      comboBonus: currentCombo * 5,
      nextCombo: currentCombo + 1,
    };
  }
  return { isCorrect, comboBonus: 0, nextCombo: 0 };
}

/**
 * Combine AI score with the time and combo bonuses for a single answer.
 * The per-answer total is capped at 100.
 */
export function calculateAnswerScore({ aiScore, timeTaken, combo = 0 }) {
  const timeBonus = calculateTimeBonus(timeTaken);
  const { comboBonus, nextCombo } = calculateCombo(aiScore, combo);
  const totalScore = Math.min(aiScore + timeBonus + comboBonus, 100);
  return { timeBonus, comboBonus, totalScore, nextCombo };
}

/**
 * Adaptive difficulty. Tracks consecutive correct/struggling answers and shifts
 * the difficulty one rung at a time:
 *   - 3 correct in a row (score >= 70)   -> increase difficulty
 *   - 2 struggles in a row (score < 50)  -> decrease difficulty
 * Returns the difficulty to use for the NEXT question plus the updated counters.
 *
 * @param {Object} args
 * @param {string} args.difficulty            - current difficulty
 * @param {number} args.aiScore               - this answer's overallScore
 * @param {number} [args.consecutiveCorrect]  - streak carried from prior answers
 * @param {number} [args.consecutiveStruggle] - struggle streak carried in
 */
export function adaptDifficulty({ difficulty, aiScore, consecutiveCorrect = 0, consecutiveStruggle = 0 }) {
  const correct = aiScore >= CORRECT_THRESHOLD;
  const struggling = aiScore < STRUGGLE_THRESHOLD;

  let cc = correct ? consecutiveCorrect + 1 : 0;
  let cs = struggling ? consecutiveStruggle + 1 : 0;

  let idx = DIFFICULTY_LEVELS.indexOf(difficulty);
  if (idx === -1) idx = 1; // default to Medium if an unknown value slips in

  let changed = false;
  let direction = null;

  if (cc >= 3 && idx < DIFFICULTY_LEVELS.length - 1) {
    idx += 1;
    changed = true;
    direction = 'up';
    cc = 0; // reset streak after a bump
  } else if (cs >= 2 && idx > 0) {
    idx -= 1;
    changed = true;
    direction = 'down';
    cs = 0;
  }

  return {
    difficulty: DIFFICULTY_LEVELS[idx],
    consecutiveCorrect: cc,
    consecutiveStruggle: cs,
    changed,
    direction,
  };
}

/**
 * Given a user's current progression and a freshly completed session, compute
 * the XP gained and the resulting xp / level / streak values.
 *
 * @param {Object} user     - current { xp, level, streak, lastPracticeDate }
 * @param {Object} session  - { score, timeBonus, comboBonus }
 * @returns {Object} { xpGained, xp, level, streak, lastPracticeDate }
 */
export function applySessionProgression(user, session) {
  const baseScore = session.score || 0;
  const timeBonus = session.timeBonus || 0;
  const comboBonus = session.comboBonus || 0;
  const xpGained = baseScore + timeBonus + comboBonus;

  const newXp = (user.xp || 0) + xpGained;
  const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

  // Streak: +1 if last practice was yesterday, reset to 1 if a day was skipped,
  // unchanged if already practiced today.
  const today = new Date().toDateString();
  let newStreak = user.streak || 1;

  if (user.lastPracticeDate) {
    const lastPractice = new Date(user.lastPracticeDate);
    const diffDays = Math.ceil(
      Math.abs(new Date(today) - lastPractice) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
    // diffDays === 0 -> same day, keep current streak
  } else {
    newStreak = 1;
  }

  return {
    xpGained,
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    lastPracticeDate: today,
  };
}
