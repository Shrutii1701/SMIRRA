import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import interviewRoutes from './routes/interviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { connectDB, isDBConnected } from './config/db.js';

dotenv.config();

/**
 * The Express application, with no network binding. Shared by the local server
 * (server.js -> app.listen) and the Vercel service runtime.
 */
const app = express();

app.use(cors());
app.use(express.json());

// Ensure the (cached) MongoDB connection is established before handling any
// request. On a warm instance this resolves instantly; on a cold serverless
// instance it awaits the initial connect so DB-backed routes never see a
// not-yet-connected state.
app.use(async (req, res, next) => {
  // Retry a few times so a cold serverless instance whose first connect attempt
  // hiccups still establishes the connection before the route runs.
  for (let attempt = 0; attempt < 3 && !isDBConnected(); attempt++) {
    try {
      await connectDB();
    } catch {
      /* routes still return a clear 503 via their own requireDB guard */
    }
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SMIRRA Backend is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', userRoutes);

export default app;
