import mongoose from 'mongoose';

/**
 * Establishes the shared Mongoose connection using the MONGODB_URI env variable.
 * Called once at server startup. Fails fast with a clear message if the URI is
 * missing or the initial connection cannot be established.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      'WARNING: MONGODB_URI is not defined in backend/.env. ' +
      'User accounts and interview history will not be persisted. ' +
      'Add a MongoDB connection string to enable database features.'
    );
    return null;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Do not crash the whole process: the AI endpoints can still work without DB.
    return null;
  }
}

/**
 * Convenience flag other modules use to decide whether to attempt DB reads/writes.
 */
export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}
