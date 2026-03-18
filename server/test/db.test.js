// ─── server/test/db.test.js ──────────────────────────────────────────
// Verification script for MongoDB connection and models.
// ──────────────────────────────────────────────────────────────────────

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Interview = require('../models/Interview');
const Evaluation = require('../models/Evaluation');

async function verify() {
    console.log('🚀 Starting Verification...');

    try {
        // 1. Test Connection
        await connectDB();
        console.log('✅ Connection Test Passed');

        // 2. Test Interview Model
        const testInterview = new Interview({
            topic: { id: 'test', name: 'Test Topic' },
            difficulty: 'intermediate',
            questions: [{ id: 1, question: 'What is a test?', expectedConcepts: ['test'], type: 'conceptual' }],
        });
        const savedInterview = await testInterview.save();
        console.log('✅ Interview Creation Passed:', savedInterview._id);

        // 3. Test Evaluation Model
        const testEvaluation = new Evaluation({
            interviewId: savedInterview._id,
            questionId: 1,
            answer: 'A test is a procedure to verify something.',
            aiAnalysis: {
                scores: { correctness: 8, clarity: 9, depth: 7, examples: 0 },
                feedback: { strengths: ['Clear definition'], improvements: ['Add examples'], missedConcepts: [], overallComment: 'Good basic answer.' },
            },
            scoring: {
                finalScore: 8.5,
                breakdown: { baseScore: 8, timeBonus: 0.5, comboMultiplier: 1 },
                gamification: { isGoodAnswer: true, comboStreak: 1, cumulativeScore: 8.5, rank: { current: { name: 'Intern', emoji: '🟢' }, progress: 17 } },
            },
            timeSpent: 30,
        });
        const savedEvaluation = await testEvaluation.save();
        console.log('✅ Evaluation Creation Passed:', savedEvaluation._id);

        // 4. Test Cleanup
        await Interview.findByIdAndDelete(savedInterview._id);
        await Evaluation.deleteMany({ interviewId: savedInterview._id });
        console.log('✅ Cleanup Passed');

        console.log('\n✨ ALL TESTS PASSED! SMIRRA Backend is Database-Ready.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
}

verify();
