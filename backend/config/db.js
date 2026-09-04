import mongoose from 'mongoose';

/**
 * Cached connection so that, in a serverless environment (e.g. Vercel), warm
 * invocations reuse a single Mongo connection instead of opening a new one each
 * time. Locally this simply connects once at startup.
 */
let cached = global._smirraMongoose;
if (!cached) cached = global._smirraMongoose = { promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      'WARNING: MONGODB_URI is not defined. User accounts, history, and the ' +
      'leaderboard will be unavailable until a MongoDB connection string is set.'
    );
    return null;
  }

  // Reuse the connection only when it is actually live (readyState 1). A frozen
  // serverless instance can leave a stale connection object behind.
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        // Reset so the next attempt retries with a fresh promise.
        cached.promise = null;
        console.error(`MongoDB connection error: ${err.message}`);
        return null;
      });
  }

  await cached.promise;
  return mongoose.connection.readyState === 1 ? mongoose.connection : null;
}

/**
 * Whether a live connection is currently established.
 */
export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
