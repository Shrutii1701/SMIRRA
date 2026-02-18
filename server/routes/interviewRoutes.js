// ─── routes/interviewRoutes.js ────────────────────────────────────────
// WHY separate route files?
// Routes should be THIN — they define URL patterns and HTTP methods,
// then delegate to controller functions. This keeps index.js clean
// and lets us add route-level middleware (auth, validation) later
// without cluttering the controller.
// ──────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const interviewController = require('../controllers/interviewController');

// GET  /api/interview/topics   → List available interview topics
router.get('/topics', interviewController.getTopics);

// POST /api/interview/generate → Generate questions for a topic
router.post('/generate', interviewController.generateQuestions);

// POST /api/interview/evaluate → Evaluate a candidate's answer
router.post('/evaluate', interviewController.evaluateAnswer);

module.exports = router;
