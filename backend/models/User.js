import mongoose from 'mongoose';

/**
 * A SMIRRA practice user. Identified by email (there is no password auth in the
 * MVP — login is an upsert on email). Gamification state (xp, level, streak)
 * lives here and is updated by the scoring service after each completed session.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    streak: {
      type: Number,
      default: 1,
    },
    lastPracticeDate: {
      type: String, // stored as toDateString() for simple day-diff comparisons
      default: null,
    },
  },
  { timestamps: true } // adds createdAt (registration date) and updatedAt
);

const User = mongoose.model('User', userSchema);

export default User;
