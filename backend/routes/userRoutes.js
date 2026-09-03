import express from 'express';
import { getMe, saveSession, getLeaderboard } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public ranking.
router.get('/leaderboard', getLeaderboard);

// Authenticated user endpoints.
router.get('/me', requireAuth, getMe);
router.post('/session', requireAuth, saveSession);

export default router;
