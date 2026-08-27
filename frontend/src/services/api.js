const API_BASE = 'http://localhost:5000/api';

/**
 * Request next question from the Gemini backend proxy.
 */
export async function fetchQuestion(topic, difficulty, questionType, previousQuestions = []) {
  const response = await fetch(`${API_BASE}/interview/question`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      difficulty,
      questionType,
      previousQuestions,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to fetch question from server.');
  }

  const data = await response.json();
  return data.question;
}

/**
 * Submit user answer for grading, calculations of bonuses, and combo tracking.
 */
export async function submitAnswer({ question, answer, topic, difficulty, timeTaken, combo }) {
  const response = await fetch(`${API_BASE}/interview/evaluate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      answer,
      topic,
      difficulty,
      timeTaken,
      combo,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to evaluate answer on server.');
  }

  return await response.json();
}
