import express from 'express';
import { loginUser, getUser, saveSession, getLeaderboard } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
// Must be registered before '/:id' so it isn't captured as an id.
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUser);
router.post('/:id/session', saveSession);

export default router;
