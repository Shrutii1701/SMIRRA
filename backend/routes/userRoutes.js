import express from 'express';
import { loginUser, getUser, saveSession } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
router.get('/:id', getUser);
router.post('/:id/session', saveSession);

export default router;
