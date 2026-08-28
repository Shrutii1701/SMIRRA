import mongoose from 'mongoose';

/**
 * The AI evaluation for a single answer within a session.
 * Mirrors the structured JSON schema returned by geminiService.evaluateAnswer.
 */
const evaluationSchema = new mongoose.Schema(
  {
    technicalAccuracy: Number,
    completeness: Number,
    clarity: Number,
    relevance: Number,
    communication: Number,
    overallScore: Number,
    feedback: String,
    missingConcepts: [String],
  },
  { _id: false }
);

/**
 * A single graded question/answer pair inside an interview session.
 */
const gradedResponseSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    difficulty: String, // the (possibly adapted) difficulty this question ran at
    timeTaken: Number,
    timeBonus: Number,
    comboBonus: Number,
    totalScore: Number,
    evaluation: evaluationSchema,
  },
  { _id: false }
);

/**
 * A completed mock interview session belonging to a user. One document per
 * finished round (typically 3 questions).
 */
const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
    },
    score: {
      type: Number, // average overall score across the session (0-100)
      required: true,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    timeBonus: {
      type: Number,
      default: 0,
    },
    comboBonus: {
      type: Number,
      default: 0,
    },
    gradedResponses: [gradedResponseSchema],
  },
  { timestamps: true }
);

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
