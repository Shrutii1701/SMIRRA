import express from 'express';
import { getQuestion, postEvaluation } from '../controllers/interviewController.js';

const router = express.Router();

router.post('/question', getQuestion);
router.post('/evaluate', postEvaluation);

export default router;
