import {
  Rocket,
  Flame,
  Trophy,
  Star,
  Crown,
  Target,
  Zap,
  BookOpen,
  Award,
  Gem,
  Medal,
  Sparkles,
} from 'lucide-react';

/**
 * Achievement catalog. Each achievement is unlocked purely from the user's
 * existing stats (xp, level, streak, sessionsHistory), so it works identically
 * whether the profile is backed by MongoDB or localStorage.
 *
 * check(stats)    -> boolean (unlocked?)
 * progress(stats) -> { current, target } for the progress bar on locked badges
 */

const TIERS = {
  bronze: { label: 'Bronze', ring: 'border-amber-600/40', text: 'text-amber-500', glow: 'from-amber-600/20 to-amber-800/5' },
  silver: { label: 'Silver', ring: 'border-slate-400/40', text: 'text-slate-300', glow: 'from-slate-400/20 to-slate-600/5' },
  gold: { label: 'Gold', ring: 'border-yellow-400/50', text: 'text-yellow-400', glow: 'from-yellow-400/20 to-amber-600/5' },
  platinum: { label: 'Platinum', ring: 'border-brand-cyan/50', text: 'text-brand-cyan', glow: 'from-brand-cyan/20 to-brand-primary/5' },
};

export const ACHIEVEMENTS = [
  // --- Session milestones ---
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Complete your first mock interview session.',
    icon: Rocket,
    tier: 'bronze',
    check: (s) => s.count >= 1,
    progress: (s) => ({ current: Math.min(s.count, 1), target: 1 }),
  },
  {
    id: 'warmed-up',
    title: 'Warmed Up',
    description: 'Complete 5 practice sessions.',
    icon: BookOpen,
    tier: 'bronze',
    check: (s) => s.count >= 5,
    progress: (s) => ({ current: Math.min(s.count, 5), target: 5 }),
  },
  {
    id: 'dedicated',
    title: 'Dedicated',
    description: 'Complete 15 practice sessions.',
    icon: Medal,
    tier: 'silver',
    check: (s) => s.count >= 15,
    progress: (s) => ({ current: Math.min(s.count, 15), target: 15 }),
  },
  {
    id: 'marathoner',
    title: 'Marathoner',
    description: 'Complete 30 practice sessions.',
    icon: Trophy,
    tier: 'gold',
    check: (s) => s.count >= 30,
    progress: (s) => ({ current: Math.min(s.count, 30), target: 30 }),
  },

  // --- Score achievements ---
  {
    id: 'high-achiever',
    title: 'High Achiever',
    description: 'Score 90% or higher in a session.',
    icon: Star,
    tier: 'silver',
    check: (s) => s.bestScore >= 90,
    progress: (s) => ({ current: Math.min(s.bestScore, 90), target: 90 }),
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Achieve a perfect 100% session score.',
    icon: Crown,
    tier: 'platinum',
    check: (s) => s.bestScore >= 100,
    progress: (s) => ({ current: Math.min(s.bestScore, 100), target: 100 }),
  },
  {
    id: 'hard-mode',
    title: 'Hard Mode',
    description: 'Pass a Hard-difficulty session with 70%+.',
    icon: Target,
    tier: 'gold',
    check: (s) => s.hardPasses >= 1,
    progress: (s) => ({ current: Math.min(s.hardPasses, 1), target: 1 }),
  },

  // --- Streak achievements ---
  {
    id: 'consistent',
    title: 'Consistent',
    description: 'Reach a 3-day practice streak.',
    icon: Flame,
    tier: 'bronze',
    check: (s) => s.streak >= 3,
    progress: (s) => ({ current: Math.min(s.streak, 3), target: 3 }),
  },
  {
    id: 'on-fire',
    title: 'On Fire',
    description: 'Reach a 7-day practice streak.',
    icon: Zap,
    tier: 'silver',
    check: (s) => s.streak >= 7,
    progress: (s) => ({ current: Math.min(s.streak, 7), target: 7 }),
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Reach a 30-day practice streak.',
    icon: Sparkles,
    tier: 'platinum',
    check: (s) => s.streak >= 30,
    progress: (s) => ({ current: Math.min(s.streak, 30), target: 30 }),
  },

  // --- Level / XP achievements ---
  {
    id: 'level-up',
    title: 'Level Up',
    description: 'Reach practice Level 2.',
    icon: Award,
    tier: 'bronze',
    check: (s) => s.level >= 2,
    progress: (s) => ({ current: Math.min(s.level, 2), target: 2 }),
  },
  {
    id: 'veteran',
    title: 'Veteran',
    description: 'Reach practice Level 5.',
    icon: Gem,
    tier: 'gold',
    check: (s) => s.level >= 5,
    progress: (s) => ({ current: Math.min(s.level, 5), target: 5 }),
  },

  // --- Breadth achievements ---
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Practice 3 different interview topics.',
    icon: BookOpen,
    tier: 'silver',
    check: (s) => s.topicsPracticed >= 3,
    progress: (s) => ({ current: Math.min(s.topicsPracticed, 3), target: 3 }),
  },
  {
    id: 'renaissance',
    title: 'Renaissance',
    description: 'Practice all 8 interview topics.',
    icon: Crown,
    tier: 'platinum',
    check: (s) => s.topicsPracticed >= 8,
    progress: (s) => ({ current: Math.min(s.topicsPracticed, 8), target: 8 }),
  },
];

/**
 * Derive the flat stats object the achievement checks consume from a user.
 */
export function deriveStats(user) {
  const history = user?.sessionsHistory || [];
  const scores = history.map((h) => h.score || 0);
  const uniqueTopics = new Set(history.map((h) => h.topic));
  const hardPasses = history.filter((h) => h.difficulty === 'Hard' && (h.score || 0) >= 70).length;

  return {
    count: history.length,
    xp: user?.xp || 0,
    level: user?.level || 1,
    streak: user?.streak || 0,
    bestScore: scores.length ? Math.max(...scores) : 0,
    topicsPracticed: uniqueTopics.size,
    hardPasses,
  };
}

/**
 * Evaluate every achievement for a user, returning display-ready entries.
 */
export function evaluateAchievements(user) {
  const stats = deriveStats(user);
  return ACHIEVEMENTS.map((a) => {
    const unlocked = a.check(stats);
    const progress = a.progress(stats);
    return {
      ...a,
      tierMeta: TIERS[a.tier],
      unlocked,
      progress,
      progressPct: Math.round((progress.current / progress.target) * 100),
    };
  });
}

/**
 * Return the ids of all achievements a user has unlocked (used for diffing
 * newly-earned badges after a session).
 */
export function unlockedIds(user) {
  const stats = deriveStats(user);
  return ACHIEVEMENTS.filter((a) => a.check(stats)).map((a) => a.id);
}

export { TIERS };
