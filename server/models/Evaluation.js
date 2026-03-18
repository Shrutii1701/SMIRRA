const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
    },
    questionId: {
        type: Number,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    aiAnalysis: {
        scores: {
            correctness: Number,
            clarity: Number,
            depth: Number,
            examples: Number,
        },
        feedback: {
            strengths: [String],
            improvements: [String],
            missedConcepts: [String],
            overallComment: String,
        },
    },
    scoring: {
        finalScore: Number,
        breakdown: {
            baseScore: Number,
            timeBonus: Number,
            comboMultiplier: Number,
        },
        gamification: {
            isGoodAnswer: Boolean,
            comboStreak: Number,
            cumulativeScore: Number,
            rank: {
                current: {
                    name: String,
                    emoji: String,
                },
                next: {
                    name: String,
                    emoji: String,
                },
                progress: Number,
            },
        },
    },
    timeSpent: Number,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
