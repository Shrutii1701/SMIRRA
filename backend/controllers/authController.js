import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { isDBConnected } from '../config/db.js';
import { serializeUserWithHistory } from './userController.js';

function requireDB(res) {
  if (!isDBConnected()) {
    res.status(503).json({
      error: 'Database is not connected. Set MONGODB_URI in backend/.env to enable accounts.',
    });
    return false;
  }
  return true;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * Create a new account with a hashed password and return a JWT.
 */
export async function register(req, res) {
  if (!requireDB(res)) return;

  const { name, email, password } = req.body;

  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'A valid email is required.' });
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
      lastPracticeDate: new Date().toDateString(),
    });

    const token = signToken(user._id);
    const profile = await serializeUserWithHistory(user);
    res.status(201).json({ token, user: profile });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create account.' });
  }
}

/**
 * POST /api/auth/login
 * Verify email + password and return a JWT.
 */
export async function login(req, res) {
  if (!requireDB(res)) return;

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Password is select:false on the schema, so request it explicitly.
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    const profile = await serializeUserWithHistory(user);
    res.json({ token, user: profile });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to log in.' });
  }
}
