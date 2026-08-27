import express from 'express';
import { generateQuestion, evaluateAnswer } from '../services/geminiService.js';

const router = express.Router();

// Generate dynamic question endpoint
router.post('/question', async (req, res) => {
  const { topic, difficulty, questionType, previousQuestions } = req.body;

  if (!topic || !difficulty || !questionType) {
    return res.status(400).json({ error: 'Missing required parameters: topic, difficulty, questionType' });
  }

  try {
    const questionText = await generateQuestion(topic, difficulty, questionType, previousQuestions || []);
    res.json({ question: questionText });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate interview question.' });
  }
});

// Evaluate answer endpoint
router.post('/evaluate', async (req, res) => {
  const { question, answer, topic, difficulty, timeTaken, combo } = req.body;

  if (!question || !topic || !difficulty) {
    return res.status(400).json({ error: 'Missing required parameters: question, topic, difficulty' });
  }

  try {
    // 1. Grade the answer using Gemini API
    const evaluation = await evaluateAnswer(question, answer, topic, difficulty);
    const aiScore = evaluation.overallScore;

    // 2. Calculate Time Bonus
    // Time taken in seconds. Rules: <30s: +20, 30-60s: +10, 60-90s: +5, >90s: 0
    let timeBonus = 0;
    if (timeTaken !== undefined) {
      if (timeTaken < 30) {
        timeBonus = 20;
      } else if (timeTaken <= 60) {
        timeBonus = 10;
      } else if (timeTaken <= 90) {
        timeBonus = 5;
      }
    }

    // 3. Calculate Combo system and bonus
    // Consecutively correct answers (overallScore >= 70) increases combo by 1.
    // Bonus multiplier: combo * 5 (e.g. combo 0 = +0, combo 1 = +5, combo 2 = +10, combo 3 = +15, etc.).
    // AI Score < 70 resets combo to 0.
    const isCorrect = aiScore >= 70;
    const currentCombo = combo || 0;
    
    let nextCombo = 0;
    let comboBonus = 0;

    if (isCorrect) {
      nextCombo = currentCombo + 1;
      comboBonus = currentCombo * 5; // First correct answer: combo 0 -> combo 1, bonus +0. Second correct: combo 1 -> combo 2, bonus +5.
    } else {
      nextCombo = 0;
      comboBonus = 0;
    }

    // 4. Calculate Final Score (capped at 100)
    const rawTotal = aiScore + timeBonus + comboBonus;
    const totalScore = Math.min(rawTotal, 100);

    res.json({
      evaluation,
      timeBonus,
      comboBonus,
      totalScore,
      nextCombo
    });

  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to evaluate answer.' });
  }
});

export default router;
