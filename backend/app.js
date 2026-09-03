import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import interviewRoutes from './routes/interviewRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

/**
 * The Express application, with no network binding. Shared by the local server
 * (server.js -> app.listen) and the Vercel serverless entry (api/index.js).
 */
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SMIRRA Backend is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/user', userRoutes);

export default app;
