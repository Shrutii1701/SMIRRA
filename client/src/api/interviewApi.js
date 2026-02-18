// ─── API service layer ──────────────────────────────────────────────
// Centralizes all backend API calls in one place.
// WHY: Keeps components clean — they just call fetchTopics() instead
// of managing URLs, headers, and error handling inline.
// ─────────────────────────────────────────────────────────────────────

const API_BASE = '/api/interview';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined,
    };

    const res = await fetch(url, config);
    const data = await res.json();

    if (!data.success) {
        throw new Error(data.error?.message || 'Something went wrong');
    }

    return data.data;
}

/** GET /api/interview/topics */
export async function fetchTopics() {
    return request('/topics');
}

/** POST /api/interview/generate */
export async function generateQuestions(topic, difficulty, count = 5) {
    return request('/generate', {
        method: 'POST',
        body: { topic, difficulty, count },
    });
}

/** POST /api/interview/evaluate */
export async function evaluateAnswer({
    question,
    answer,
    expectedConcepts,
    timeSpent,
    combo,
    cumulativeScore,
}) {
    return request('/evaluate', {
        method: 'POST',
        body: { question, answer, expectedConcepts, timeSpent, combo, cumulativeScore },
    });
}
