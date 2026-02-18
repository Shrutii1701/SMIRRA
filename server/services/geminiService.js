// ─── services/geminiService.js ────────────────────────────────────────
// (Name kept for backwards compatibility — now uses Groq)
//
// Wraps the Groq API (OpenAI-compatible) for two operations:
//   1. Question Generation — creates interview questions for a topic
//   2. Answer Evaluation — scores answers against a rubric
//
// WHY a service layer?
// Controllers should orchestrate, not contain AI logic. By isolating
// AI calls here, we can:
//   - Swap AI providers without touching controllers
//   - Add caching, retry logic, and rate limiting in one place
//   - Write unit tests with a mock of this module
//
// WHY Groq?
// Groq provides blazing-fast inference with generous free-tier limits.
// It uses the standard OpenAI SDK format, making it easy to swap models.
//
// KEY DESIGN DECISIONS:
//   - We use the OpenAI SDK pointed at Groq's base URL
//   - We ask the model to return JSON, then parse it ourselves
//   - We validate the parsed response before returning
//   - Retry with backoff handles transient API errors
//   - Prompts are carefully engineered for consistent output
// ──────────────────────────────────────────────────────────────────────

const OpenAI = require('openai');

// ─── Initialize the Groq client ─────────────────────
// Groq uses the OpenAI-compatible API format.
// We just change the baseURL and use our Groq API key.
const client = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

// Which model to use — configurable via .env
const MODEL = process.env.AI_MODEL || 'openai/gpt-4o-mini';

// ──────────────────────────────────────────────────────────────────────
// RETRY HELPER
// WHY: AI APIs can be flaky — network hiccups, rate limits, transient
// errors. Exponential backoff with jitter is industry standard.
// ──────────────────────────────────────────────────────────────────────
async function withRetry(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries;
            const status = error.status || error.statusCode;
            const isRetryable = status === 429 || status >= 500;

            if (isLastAttempt || !isRetryable) {
                if (status === 429) {
                    const friendlyErr = new Error(
                        'AI rate limit reached. Please wait a moment and try again.'
                    );
                    friendlyErr.statusCode = 429;
                    throw friendlyErr;
                }
                throw error;
            }

            // Exponential backoff: 2s, 4s, 8s
            const waitMs = Math.pow(2, attempt) * 1000;
            console.warn(`⚠️  AI attempt ${attempt}/${maxRetries} failed (status ${status}), retrying in ${waitMs / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
    }
}

// ──────────────────────────────────────────────────────────────────────
// SAFE JSON PARSER
// WHY: Models sometimes wrap JSON in markdown code fences like:
//   ```json\n{...}\n```
// This helper strips that wrapping before parsing.
// ──────────────────────────────────────────────────────────────────────
function parseJsonResponse(text) {
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
        cleaned = cleaned
            .replace(/^```(?:json)?\s*\n?/, '')  // Remove opening ```json
            .replace(/\n?```\s*$/, '');           // Remove closing ```
    }
    return JSON.parse(cleaned);
}

// ══════════════════════════════════════════════════════════════════════
// QUESTION GENERATION
// ══════════════════════════════════════════════════════════════════════
//
// HOW IT WORKS:
//   1. We build a detailed prompt specifying topic, difficulty, and count
//   2. We ask the model to respond ONLY with a JSON array
//   3. We parse and validate the response
//   4. Each question includes: text, expectedConcepts, difficulty
//
// PROMPT ENGINEERING NOTES:
//   - "Respond ONLY with a JSON array" prevents chatty preambles
//   - Specifying the exact JSON schema reduces parsing failures
//   - Including "expectedConcepts" lets us evaluate answers later
// ══════════════════════════════════════════════════════════════════════

async function generateQuestions(topic, difficulty = 'intermediate', count = 5) {
    const prompt = `You are a senior technical interviewer. Generate exactly ${count} ${difficulty}-level interview questions about "${topic}".

RULES:
- Questions should test understanding, not just recall
- Mix conceptual, scenario-based, and problem-solving questions
- For "${difficulty}" difficulty:
  ${difficulty === 'beginner' ? '- Focus on fundamentals and definitions' : ''}
  ${difficulty === 'intermediate' ? '- Test application of concepts and common patterns' : ''}
  ${difficulty === 'advanced' ? '- Include edge cases, tradeoffs, and architectural decisions' : ''}
  ${difficulty === 'expert' ? '- Ask about internals, performance optimization, and system-level thinking' : ''}

Respond ONLY with a valid JSON array. No markdown, no explanation. Each object must have:
- "id": a unique number (1, 2, 3...)
- "question": the interview question text
- "expectedConcepts": array of 3-5 key concepts a strong answer should cover
- "difficulty": "${difficulty}"
- "type": one of "conceptual", "scenario", "problem-solving"

Example format:
[
  {
    "id": 1,
    "question": "Explain how...",
    "expectedConcepts": ["concept1", "concept2", "concept3"],
    "difficulty": "${difficulty}",
    "type": "conceptual"
  }
]`;

    return withRetry(async () => {
        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,  // Some creativity in question variety
        });

        const text = completion.choices[0].message.content;
        const questions = parseJsonResponse(text);

        // Validate the response structure
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('AI returned invalid question format');
        }

        // Ensure each question has required fields
        return questions.map((q, i) => ({
            id: q.id || i + 1,
            question: q.question,
            expectedConcepts: q.expectedConcepts || [],
            difficulty: q.difficulty || difficulty,
            type: q.type || 'conceptual',
        }));
    });
}

// ══════════════════════════════════════════════════════════════════════
// ANSWER EVALUATION — Layer 1 of the two-layer system
// ══════════════════════════════════════════════════════════════════════
//
// HOW THE TWO-LAYER EVALUATION WORKS:
//
//   Layer 1 (THIS FUNCTION): AI Analysis
//   - The model reads the question, answer, and expected concepts
//   - It returns rubric scores (0-10) for 4 dimensions
//   - It also provides textual feedback and improvement suggestions
//
//   Layer 2 (scoringEngine.js): Deterministic Scoring
//   - Takes the raw AI scores from Layer 1
//   - Applies weighted formula, time bonuses, combo multiplier
//   - Determines rank — this layer is 100% deterministic
//
// WHY TWO LAYERS?
//   - AI is great at nuanced evaluation but inconsistent with numbers
//   - Deterministic scoring ensures fairness: same inputs = same outputs
//   - We can tune game mechanics (weights, bonuses) without touching AI
// ══════════════════════════════════════════════════════════════════════

async function evaluateAnswer(question, answer, expectedConcepts = []) {
    const prompt = `You are a senior technical interviewer evaluating a candidate's answer.

QUESTION: "${question}"

CANDIDATE'S ANSWER: "${answer}"

EXPECTED KEY CONCEPTS: ${JSON.stringify(expectedConcepts)}

Evaluate the answer on these 4 dimensions, scoring each from 0 to 10:

1. **Correctness** (0-10): Is the answer factually correct? Does it address the core question?
   - 0-3: Major errors or completely off-topic
   - 4-6: Partially correct, missing key points
   - 7-8: Mostly correct with minor gaps
   - 9-10: Fully correct and comprehensive

2. **Clarity** (0-10): Is the answer well-structured and easy to follow?
   - 0-3: Confusing, disorganized
   - 4-6: Understandable but could be clearer
   - 7-8: Well-structured, logical flow
   - 9-10: Crystal clear, excellent communication

3. **Depth** (0-10): Does the answer go beyond surface-level?
   - 0-3: Superficial, no real understanding shown
   - 4-6: Adequate depth, covers basics
   - 7-8: Good depth, shows strong understanding
   - 9-10: Expert-level depth, discusses tradeoffs/internals

4. **Examples** (0-10): Does the answer include concrete examples or analogies?
   - 0-3: No examples
   - 4-6: Generic or weak examples
   - 7-8: Good, relevant examples
   - 9-10: Outstanding examples that illuminate the concept

Respond ONLY with valid JSON. No markdown, no explanation:
{
  "scores": {
    "correctness": <number>,
    "clarity": <number>,
    "depth": <number>,
    "examples": <number>
  },
  "feedback": {
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "missedConcepts": ["concept that was expected but not covered"],
    "overallComment": "A 2-3 sentence summary of the evaluation"
  }
}`;

    return withRetry(async () => {
        const completion = await client.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,  // Low temp for consistent scoring
        });

        const text = completion.choices[0].message.content;
        const evaluation = parseJsonResponse(text);

        // Validate the response structure
        if (!evaluation.scores || !evaluation.feedback) {
            throw new Error('AI returned invalid evaluation format');
        }

        // Clamp scores to 0-10 range (AI sometimes returns 10.5 or -1)
        const clamp = (val) => Math.max(0, Math.min(10, Number(val) || 0));

        return {
            scores: {
                correctness: clamp(evaluation.scores.correctness),
                clarity: clamp(evaluation.scores.clarity),
                depth: clamp(evaluation.scores.depth),
                examples: clamp(evaluation.scores.examples),
            },
            feedback: {
                strengths: evaluation.feedback.strengths || [],
                improvements: evaluation.feedback.improvements || [],
                missedConcepts: evaluation.feedback.missedConcepts || [],
                overallComment: evaluation.feedback.overallComment || '',
            },
        };
    });
}

module.exports = {
    generateQuestions,
    evaluateAnswer,
};
