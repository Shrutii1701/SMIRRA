// ─── controllers/interviewController.js ───────────────────────────────
// The ORCHESTRATOR — sits between routes and services.
//
// WHY a controller layer?
// Routes define "what URL," services define "how to call AI."
// Controllers define "what to do with a request" — they:
//   1. Validate input
//   2. Call the appropriate service(s)
//   3. Transform/combine results
//   4. Send the response
//
// This is where the TWO-LAYER evaluation comes together:
//   evaluateAnswer controller → geminiService (Layer 1) → scoringEngine (Layer 2)
// ──────────────────────────────────────────────────────────────────────

const geminiService = require('../services/geminiService');
const scoringEngine = require('../utils/scoringEngine');
const Interview = require('../models/Interview');
const Evaluation = require('../models/Evaluation');
const { TOPICS, DIFFICULTIES } = require('../config/constants');

// ══════════════════════════════════════════════════════════════════════
// GET /api/interview/topics
// Returns available topics with their metadata.
// This is a simple endpoint — no AI needed, just return constants.
// ══════════════════════════════════════════════════════════════════════
const getTopics = (req, res) => {
    res.json({
        success: true,
        data: {
            topics: TOPICS,
            difficulties: DIFFICULTIES,
        },
    });
};

// ══════════════════════════════════════════════════════════════════════
// POST /api/interview/generate
// Generates interview questions via Gemini.
//
// Request body:
//   { topic: "javascript", difficulty: "intermediate", count: 5 }
//
// Response:
//   { success: true, data: { questions: [...], meta: {...} } }
// ══════════════════════════════════════════════════════════════════════
const generateQuestions = async (req, res, next) => {
    try {
        const { topic, difficulty = 'intermediate', count = 5 } = req.body;

        // ─── Input Validation ─────────────────────────────
        if (!topic) {
            const error = new Error('Topic is required');
            error.statusCode = 400;
            throw error;
        }

        // Validate topic exists in our list
        const validTopic = TOPICS.find(t => t.id === topic.toLowerCase());
        if (!validTopic) {
            const error = new Error(
                `Invalid topic "${topic}". Valid topics: ${TOPICS.map(t => t.id).join(', ')}`
            );
            error.statusCode = 400;
            throw error;
        }

        // Validate difficulty
        if (!DIFFICULTIES.includes(difficulty.toLowerCase())) {
            const error = new Error(
                `Invalid difficulty "${difficulty}". Valid: ${DIFFICULTIES.join(', ')}`
            );
            error.statusCode = 400;
            throw error;
        }

        // Clamp count between 1 and 10
        const questionCount = Math.max(1, Math.min(10, parseInt(count) || 5));

        // ─── Call Gemini ──────────────────────────────────
        const questions = await geminiService.generateQuestions(
            validTopic.name,  // Use display name, not ID, for better prompts
            difficulty.toLowerCase(),
            questionCount
        );

        // ─── Save to Database ─────────────────────────────
        const interview = new Interview({
            topic: {
                id: validTopic.id,
                name: validTopic.name,
            },
            difficulty: difficulty.toLowerCase(),
            questions,
        });
        await interview.save();

        res.json({
            success: true,
            data: {
                interviewId: interview._id,
                questions,
                meta: {
                    topic: validTopic,
                    difficulty: difficulty.toLowerCase(),
                    count: questions.length,
                    generatedAt: interview.createdAt,
                },
            },
        });
    } catch (error) {
        next(error); // Forward to centralized error handler
    }
};

// ══════════════════════════════════════════════════════════════════════
// POST /api/interview/evaluate
// This is the TWO-LAYER evaluation endpoint.
//
// Request body:
//   {
//     question: "What is a closure?",
//     answer: "A closure is...",
//     expectedConcepts: ["lexical scope", "outer function"],
//     timeSpent: 45,          // seconds
//     combo: 2,               // current streak
//     cumulativeScore: 125    // total points so far
//   }
//
// Response flow:
//   1. Validate input
//   2. Layer 1: geminiService.evaluateAnswer() → AI rubric scores
//   3. Layer 2: scoringEngine.calculateFinalScore() → deterministic scoring
//   4. Combine both layers into the response
// ══════════════════════════════════════════════════════════════════════
const evaluateAnswer = async (req, res, next) => {
    try {
        const {
            question,
            answer,
            expectedConcepts = [],
            timeSpent = 60,
            combo = 0,
            cumulativeScore = 0,
            interviewId = null,
            isLastQuestion = false,
        } = req.body;

        // ─── Input Validation ─────────────────────────────
        if (!question || !answer) {
            const error = new Error('Both "question" and "answer" are required');
            error.statusCode = 400;
            throw error;
        }

        if (answer.trim().length < 10) {
            const error = new Error('Answer must be at least 10 characters long');
            error.statusCode = 400;
            throw error;
        }

        // ─── Layer 1: AI Analysis ─────────────────────────
        // Gemini evaluates the answer and returns rubric scores + feedback
        const aiAnalysis = await geminiService.evaluateAnswer(
            question,
            answer,
            expectedConcepts
        );

        // ─── Layer 2: Deterministic Scoring ───────────────
        // Takes AI scores and applies game mechanics (weights, time, combo)
        const scoring = scoringEngine.calculateFinalScore(
            aiAnalysis.scores,
            timeSpent,
            combo,
            cumulativeScore
        );

        // ─── Save to Database ─────────────────────────────
        let savedEvaluation = null;
        if (interviewId) {
            const evaluation = new Evaluation({
                interviewId,
                questionId: 0, // In a real app, you'd pass the actual question ID or index
                answer,
                aiAnalysis,
                scoring,
                timeSpent,
            });
            savedEvaluation = await evaluation.save();

            // If it's the last question, mark the interview as completed
            if (isLastQuestion) {
                await Interview.findByIdAndUpdate(interviewId, {
                    status: 'completed',
                    totalScore: scoring.gamification.cumulativeScore,
                    finalRank: scoring.gamification.rank.current,
                    completedAt: new Date(),
                });
            }
        }

        // ─── Combined Response ────────────────────────────
        res.json({
            success: true,
            data: {
                evaluationId: savedEvaluation ? savedEvaluation._id : null,
                // Layer 1: What the AI thinks
                aiAnalysis: {
                    scores: aiAnalysis.scores,
                    feedback: aiAnalysis.feedback,
                },
                // Layer 2: The deterministic game score
                scoring: {
                    finalScore: scoring.finalScore,
                    breakdown: scoring.breakdown,
                    gamification: scoring.gamification,
                },
                // Metadata
                meta: {
                    evaluatedAt: new Date().toISOString(),
                    interviewId,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTopics,
    generateQuestions,
    evaluateAnswer,
    // New methods
    getHistory: async (req, res, next) => {
        try {
            const history = await Interview.find({ status: 'completed' })
                .sort({ createdAt: -1 })
                .limit(20);
            res.json({ success: true, data: history });
        } catch (error) {
            next(error);
        }
    },
    getInterviewById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const interview = await Interview.findById(id);
            if (!interview) {
                const error = new Error('Interview not found');
                error.statusCode = 404;
                throw error;
            }
            const evaluations = await Evaluation.find({ interviewId: id });
            res.json({ success: true, data: { interview, evaluations } });
        } catch (error) {
            next(error);
        }
    },
};
