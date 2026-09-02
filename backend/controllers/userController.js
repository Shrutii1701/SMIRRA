import User from '../models/User.js';
import Interview from '../models/Interview.js';
import { applySessionProgression } from '../services/scoringService.js';
import { isDBConnected } from '../config/db.js';

/**
 * Guard used by every DB-backed handler so the API returns a clear error
 * instead of hanging when MONGODB_URI is not configured.
 */
function requireDB(res) {
  if (!isDBConnected()) {
    res.status(503).json({
      error: 'Database is not connected. Set MONGODB_URI in backend/.env to enable accounts.',
    });
    return false;
  }
  return true;
}

/**
 * Shape a User document for the frontend, including its session history.
 */
async function serializeUserWithHistory(user) {
  const interviews = await Interview.find({ user: user._id }).sort({ createdAt: -1 }).lean();

  const sessionsHistory = interviews.map((iv) => ({
    id: iv._id.toString(),
    date: new Date(iv.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    topic: iv.topic,
    difficulty: iv.difficulty,
    score: iv.score,
    xpEarned: iv.xpEarned,
    evaluation: {
      feedbackSummary: iv.gradedResponses?.[0]?.evaluation?.feedback || '',
      itemsCount: iv.gradedResponses?.length || 0,
    },
  }));

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    registeredDate: user.createdAt,
    xp: user.xp,
    level: user.level,
    streak: user.streak,
    lastPracticeDate: user.lastPracticeDate,
    sessionsHistory,
  };
}

/**
 * POST /api/user/login
 * Passwordless login: upsert the user by email and return their full profile.
 */
export async function loginUser(req, res) {
  if (!requireDB(res)) return;

  const { name, email } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const finalEmail = (email && email.trim()) ||
    `${name.trim().toLowerCase().replace(/\s+/g, '')}@smirra.local`;

  try {
    let user = await User.findOne({ email: finalEmail.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: finalEmail.toLowerCase(),
        lastPracticeDate: new Date().toDateString(),
      });
    } else if (user.name !== name.trim()) {
      // Allow updating the display name on re-login.
      user.name = name.trim();
      await user.save();
    }

    const profile = await serializeUserWithHistory(user);
    res.json({ user: profile });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to log in.' });
  }
}

/**
 * GET /api/user/leaderboard
 * Top users ranked by XP, with their session counts. Public ranking.
 */
export async function getLeaderboard(req, res) {
  if (!requireDB(res)) return;

  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

  try {
    const top = await User.find().sort({ xp: -1, updatedAt: 1 }).limit(limit).lean();
    const ids = top.map((u) => u._id);

    // Session counts for the ranked users in a single aggregation.
    const counts = await Interview.aggregate([
      { $match: { user: { $in: ids } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

    const leaderboard = top.map((u, i) => ({
      rank: i + 1,
      id: u._id.toString(),
      name: u.name,
      level: u.level,
      xp: u.xp,
      streak: u.streak,
      sessions: countMap[u._id.toString()] || 0,
    }));

    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load leaderboard.' });
  }
}

/**
 * GET /api/user/:id
 * Fetch a user's current profile and history (used to refresh state on load).
 */
export async function getUser(req, res) {
  if (!requireDB(res)) return;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const profile = await serializeUserWithHistory(user);
    res.json({ user: profile });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to load user.' });
  }
}

/**
 * POST /api/user/:id/session
 * Persist a completed interview, apply XP/level/streak progression, and return
 * the updated profile.
 */
export async function saveSession(req, res) {
  if (!requireDB(res)) return;

  const { topic, difficulty, gradedResponses } = req.body;
  if (!topic || !difficulty || !Array.isArray(gradedResponses) || gradedResponses.length === 0) {
    return res
      .status(400)
      .json({ error: 'Missing required session data: topic, difficulty, gradedResponses.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Aggregate the session from its graded answers.
    const count = gradedResponses.length;
    const avgScore = Math.round(
      gradedResponses.reduce((sum, r) => sum + (r.evaluation?.overallScore || 0), 0) / count
    );
    const totalTimeBonus = gradedResponses.reduce((sum, r) => sum + (r.timeBonus || 0), 0);
    const totalComboBonus = gradedResponses.reduce((sum, r) => sum + (r.comboBonus || 0), 0);

    const progression = applySessionProgression(user, {
      score: avgScore,
      timeBonus: totalTimeBonus,
      comboBonus: totalComboBonus,
    });

    // Persist the interview record.
    await Interview.create({
      user: user._id,
      topic,
      difficulty,
      score: avgScore,
      xpEarned: progression.xpGained,
      timeBonus: totalTimeBonus,
      comboBonus: totalComboBonus,
      gradedResponses,
    });

    // Update the user's progression.
    user.xp = progression.xp;
    user.level = progression.level;
    user.streak = progression.streak;
    user.lastPracticeDate = progression.lastPracticeDate;
    await user.save();

    const profile = await serializeUserWithHistory(user);
    res.json({ user: profile, xpGained: progression.xpGained });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to save session.' });
  }
}
