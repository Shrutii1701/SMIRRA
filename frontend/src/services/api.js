const API_BASE = 'http://localhost:5000/api';

const OFFLINE_MESSAGE =
  'Cannot reach the SMIRRA server. Make sure the backend is running (run "npm run dev" in the backend folder), then try again.';

/**
 * Shared fetch wrapper. Converts a dropped connection (backend not running)
 * into a clear, actionable message instead of the browser's raw "Failed to
 * fetch", and surfaces the server's error text for non-2xx responses.
 */
async function request(path, { method = 'GET', body, fallbackError } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network-level failure (server down, connection refused, CORS, offline).
    throw new Error(OFFLINE_MESSAGE);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || fallbackError || 'Request failed.');
  }

  return response.json();
}

/**
 * Passwordless login: upserts the user by email on the backend and returns
 * their full profile (including persisted session history).
 */
export async function loginUser(name, email) {
  const data = await request('/user/login', {
    method: 'POST',
    body: { name, email },
    fallbackError: 'Failed to log in.',
  });
  return data.user;
}

/**
 * Fetch a user's current profile + history by id (used to sync on app load).
 */
export async function fetchUser(id) {
  const data = await request(`/user/${id}`, { fallbackError: 'Failed to load user.' });
  return data.user;
}

/**
 * Persist a completed interview session and receive the updated profile
 * (with recomputed XP, level, and streak) back from the backend.
 */
export async function saveSession(userId, { topic, difficulty, gradedResponses }) {
  return request(`/user/${userId}/session`, {
    method: 'POST',
    body: { topic, difficulty, gradedResponses },
    fallbackError: 'Failed to save session.',
  }); // { user, xpGained }
}

/**
 * Request the next question from the Gemini backend proxy.
 */
export async function fetchQuestion(topic, difficulty, questionType, previousQuestions = [], persona) {
  const data = await request('/interview/question', {
    method: 'POST',
    body: { topic, difficulty, questionType, previousQuestions, persona },
    fallbackError: 'Failed to fetch question from server.',
  });
  return data.question;
}

/**
 * Submit user answer for grading, bonus calculation, combo tracking, and
 * adaptive-difficulty adjustment.
 */
export async function submitAnswer({
  question,
  answer,
  topic,
  difficulty,
  timeTaken,
  combo,
  consecutiveCorrect,
  consecutiveStruggle,
  persona,
}) {
  return request('/interview/evaluate', {
    method: 'POST',
    body: {
      question,
      answer,
      topic,
      difficulty,
      timeTaken,
      combo,
      consecutiveCorrect,
      consecutiveStruggle,
      persona,
    },
    fallbackError: 'Failed to evaluate answer on server.',
  });
}
