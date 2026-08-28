import { generateQuestion, evaluateAnswer } from '../services/geminiService.js';
import { calculateAnswerScore } from '../services/scoringService.js';

/**
 * POST /api/interview/question
 * Generate a single, non-repeating interview question.
 */
export async function getQuestion(req, res) {
  const { topic, difficulty, questionType, previousQuestions } = req.body;

  if (!topic || !difficulty || !questionType) {
    return res
      .status(400)
      .json({ error: 'Missing required parameters: topic, difficulty, questionType' });
  }

  try {
    const question = await generateQuestion(
      topic,
      difficulty,
      questionType,
      previousQuestions || []
    );
    res.json({ question });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to generate interview question.' });
  }
}

/**
 * POST /api/interview/evaluate
 * Grade an answer with the AI, then apply time and combo bonuses.
 */
export async function postEvaluation(req, res) {
  const { question, answer, topic, difficulty, timeTaken, combo } = req.body;

  if (!question || !topic || !difficulty) {
    return res
      .status(400)
      .json({ error: 'Missing required parameters: question, topic, difficulty' });
  }

  try {
    const evaluation = await evaluateAnswer(question, answer, topic, difficulty);

    const { timeBonus, comboBonus, totalScore, nextCombo } = calculateAnswerScore({
      aiScore: evaluation.overallScore,
      timeTaken,
      combo: combo || 0,
    });

    res.json({ evaluation, timeBonus, comboBonus, totalScore, nextCombo });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to evaluate answer.' });
  }
}
