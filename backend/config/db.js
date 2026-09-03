import mongoose from 'mongoose';

/**
 * Cached connection so that, in a serverless environment (e.g. Vercel), warm
 * invocations reuse a single Mongo connection instead of opening a new one each
 * time. Locally this simply connects once at startup.
 */
let cached = global._smirraMongoose;
if (!cached) cached = global._smirraMongoose = { conn: null, promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      'WARNING: MONGODB_URI is not defined. User accounts, history, and the ' +
      'leaderboard will be unavailable until a MongoDB connection string is set.'
    );
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(uri)
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}`);
        return m;
      })
      .catch((err) => {
        // Reset so a later invocation can retry, and don't crash the process.
        cached.promise = null;
        console.error(`MongoDB connection error: ${err.message}`);
        return null;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Whether a live connection is currently established.
 */
export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
