/**
 * Deterministic "challenge of the day": everyone practising on the same date
 * gets the same topic + difficulty, rotating daily. No backend needed — it is a
 * pure function of the calendar date.
 */

const TOPICS = ['Technical', 'DSA', 'Java', 'Python', 'Web Dev', 'DBMS/SQL', 'HR', 'Mixed'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export function getDailyChallenge(date = new Date()) {
  // Whole-day index since the Unix epoch (UTC) so it flips once per calendar day.
  const dayIndex = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );

  const topic = TOPICS[dayIndex % TOPICS.length];
  const difficulty = DIFFICULTIES[Math.floor(dayIndex / TOPICS.length) % DIFFICULTIES.length];
  const todayLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return { topic, difficulty, questionType: 'Mixed', persona: 'mentor', todayLabel };
}

/**
 * Whether the user has already completed today's challenge (a session matching
 * today's topic + difficulty recorded today).
 */
export function isDailyChallengeDone(user, challenge) {
  const history = user?.sessionsHistory || [];
  return history.some(
    (s) => s.date === challenge.todayLabel && s.topic === challenge.topic && s.difficulty === challenge.difficulty
  );
}
