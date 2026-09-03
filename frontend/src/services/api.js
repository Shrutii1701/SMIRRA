// In production (e.g. Vercel) the API is served from the same domain at /api.
// In local dev it runs on the separate Express port. Override with VITE_API_BASE.
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const TOKEN_KEY = 'smirra_token';

const OFFLINE_MESSAGE =
  'Cannot reach the SMIRRA server. Make sure the backend is running (run "npm run dev" in the backend folder), then try again.';

// --- Token helpers (JWT stored in localStorage) ---
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Shared fetch wrapper. Attaches the auth token when present, converts a dropped
 * connection into a clear message, and surfaces server error text.
 */
async function request(path, { method = 'GET', body, fallbackError } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(OFFLINE_MESSAGE);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || fallbackError || 'Request failed.');
  }

  return response.json();
}

// --- Auth ---

/**
 * Register a new account. Stores the returned token and returns the profile.
 */
export async function register(name, email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    fallbackError: 'Failed to create account.',
  });
  setToken(data.token);
  return data.user;
}

/**
 * Log in with email + password. Stores the returned token and returns the profile.
 */
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email, password },
    fallbackError: 'Failed to log in.',
  });
  setToken(data.token);
  return data.user;
}

/**
 * Fetch the current authenticated user's profile + history.
 */
export async function fetchMe() {
  const data = await request('/user/me', { fallbackError: 'Failed to load profile.' });
  return data.user;
}

// --- App data ---

/**
 * Fetch the XP leaderboard (top users by experience). Public.
 */
export async function fetchLeaderboard(limit = 20) {
  const data = await request(`/user/leaderboard?limit=${limit}`, {
    fallbackError: 'Failed to load leaderboard.',
  });
  return data.leaderboard;
}

/**
 * Persist a completed interview session for the authenticated user and receive
 * the updated profile (with recomputed XP, level, streak).
 */
export async function saveSession({ topic, difficulty, gradedResponses }) {
  return request('/user/session', {
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
