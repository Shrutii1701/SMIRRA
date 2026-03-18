// ─── server/config/db.js ──────────────────────────────────────────────
// Centralized MongoDB connection logic using Mongoose.
// ──────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`
  🟢 MongoDB Connected: ${conn.connection.host}
  🗄️  Database: ${conn.connection.name}
        `);
    } catch (error) {
        console.error(`
  🔴 MongoDB Connection Error: ${error.message}
  ⚠️  Running in OFFLINE mode. Data will not be persisted.
        `);
        // We don't exit(1) anymore so the user can still see the UI
    }
};

module.exports = connectDB;
