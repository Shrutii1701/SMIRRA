// ─── config/constants.js ──────────────────────────────────────────────
// Single source of truth for all "magic numbers" and enumerations.
// WHY: Centralizing constants prevents bugs from duplicated values
// and makes tuning the game mechanics trivial — change one number,
// the entire system adapts.
// ──────────────────────────────────────────────────────────────────────

// ─── Scoring Weights ────────────────────────────────
// These control HOW MUCH each rubric dimension matters.
// Must sum to 1.0 — think of them as percentages of the final score.
const SCORING_WEIGHTS = {
  correctness: 0.40,  // Does the answer address the core question?
  clarity:     0.20,  // Is it well-structured and easy to follow?
  depth:       0.25,  // Does it go beyond surface-level?
  examples:    0.15,  // Are concrete examples or analogies provided?
};

// ─── Rank System ────────────────────────────────────
// Each rank has a threshold (minimum cumulative score to reach it)
// and an emoji for the UI. Ordered from lowest to highest.
const RANKS = [
  { name: 'Intern',        threshold: 0,    emoji: '🟢' },
  { name: 'Junior',        threshold: 50,   emoji: '🔵' },
  { name: 'Mid-Level',     threshold: 150,  emoji: '🟣' },
  { name: 'Senior',        threshold: 350,  emoji: '🟠' },
  { name: 'Staff',         threshold: 600,  emoji: '🔴' },
  { name: 'Principal',     threshold: 1000, emoji: '⭐' },
  { name: 'Distinguished', threshold: 1500, emoji: '👑' },
];

// ─── Combo System ───────────────────────────────────
// Consecutive good answers (score ≥ threshold) build a combo.
// The multiplier starts at 1x and increases with each consecutive
// good answer, capped at the max multiplier.
const COMBO = {
  goodScoreThreshold: 7,      // Score ≥ 7 counts as a "good" answer
  multiplierIncrement: 0.1,   // Each combo step adds 0.1x
  maxMultiplier: 1.5,         // Cap at 1.5x to keep things fair
};

// ─── Time Bonus ─────────────────────────────────────
// Answering quickly earns a bonus. The bonus decays linearly
// from maxBonus to 0 over the time window.
const TIME_BONUS = {
  maxBonusPoints: 2.0,        // Maximum bonus points
  windowSeconds: 120,         // Full bonus at 0s, zero bonus at 120s
};

// ─── Interview Topics ───────────────────────────────
// Available topics with display names and subtopics.
// This feeds the /topics endpoint and the question generator.
const TOPICS = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '🟨',
    subtopics: ['closures', 'prototypes', 'async/await', 'event loop', 'ES6+', 'DOM', 'error handling'],
  },
  {
    id: 'react',
    name: 'React',
    icon: '⚛️',
    subtopics: ['hooks', 'state management', 'component lifecycle', 'virtual DOM', 'performance', 'context API'],
  },
  {
    id: 'node',
    name: 'Node.js',
    icon: '🟩',
    subtopics: ['event loop', 'streams', 'middleware', 'clustering', 'security', 'REST APIs'],
  },
  {
    id: 'system-design',
    name: 'System Design',
    icon: '🏗️',
    subtopics: ['scalability', 'load balancing', 'caching', 'databases', 'microservices', 'message queues'],
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    icon: '🧮',
    subtopics: ['arrays', 'trees', 'graphs', 'dynamic programming', 'sorting', 'hashing'],
  },
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    subtopics: ['decorators', 'generators', 'OOP', 'async', 'data structures', 'testing'],
  },
];

// ─── Difficulty Levels ──────────────────────────────
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

module.exports = {
  SCORING_WEIGHTS,
  RANKS,
  COMBO,
  TIME_BONUS,
  TOPICS,
  DIFFICULTIES,
};
