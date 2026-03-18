const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    topic: {
        id: String,
        name: String,
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
    },
    questions: [
        {
            id: Number,
            question: String,
            expectedConcepts: [String],
            type: {
                type: String,
                enum: ['conceptual', 'scenario', 'problem-solving'],
            },
        },
    ],
    status: {
        type: String,
        enum: ['started', 'completed'],
        default: 'started',
    },
    totalScore: {
        type: Number,
        default: 0,
    },
    finalRank: {
        name: String,
        emoji: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
});

module.exports = mongoose.model('Interview', interviewSchema);
