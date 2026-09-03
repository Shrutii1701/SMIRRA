import jwt from 'jsonwebtoken';

/**
 * Secret used to sign/verify JWTs. Read at call time (not import time) so it
 * picks up the value from .env after dotenv has loaded. Falls back to a dev
 * default so the app still runs without config.
 */
function getSecret() {
  return process.env.JWT_SECRET || 'smirra_dev_secret_change_me';
}
export const TOKEN_TTL = '7d';

/**
 * Express middleware: require a valid Bearer token and attach the user id as
 * req.userId. Responds 401 when the token is missing or invalid.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, getSecret());
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

/**
 * Issue a signed JWT for a user id.
 */
export function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, getSecret(), { expiresIn: TOKEN_TTL });
}
