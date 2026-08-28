const API_BASE = 'http://localhost:5000/api';

/**
 * Passwordless login: upserts the user by email on the backend and returns
 * their full profile (including persisted session history).
 */
export async function loginUser(name, email) {
  const response = await fetch(`${API_BASE}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to log in.');
  }

  const data = await response.json();
  return data.user;
}

/**
 * Fetch a user's current profile + history by id (used to sync on app load).
 */
export async function fetchUser(id) {
  const response = await fetch(`${API_BASE}/user/${id}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to load user.');
  }
  const data = await response.json();
  return data.user;
}

/**
 * Persist a completed interview session and receive the updated profile
 * (with recomputed XP, level, and streak) back from the backend.
 */
export async function saveSession(userId, { topic, difficulty, gradedResponses }) {
  const response = await fetch(`${API_BASE}/user/${userId}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, difficulty, gradedResponses }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to save session.');
  }

  return await response.json(); // { user, xpGained }
}

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
