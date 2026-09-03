import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';

/**
 * Vercel serverless entry point. Every /api/* request is routed here (see
 * vercel.json). We ensure the (cached) database connection is ready, then hand
 * the request to the shared Express app.
 */
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
