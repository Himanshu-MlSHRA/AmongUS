import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Router } from 'express';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = '7d';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const authRouter = Router();

/**
 * POST /auth/google/verify
 * Body: { credential: "<Google ID token from GSI>" }
 * Returns: { token, user: { name, email, avatar, provider } }
 *
 * The client obtains the Google ID token via the Google Identity Services
 * popup/button, then sends it here for server-side verification.
 */
authRouter.post('/google/verify', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential.' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token.' });
    }

    const user = {
      googleId: payload.sub,
      name: payload.name || payload.given_name || 'Coder',
      email: payload.email || '',
      avatar: payload.picture || null,
      provider: 'google',
    };

    // Sign our own JWT
    const token = jwt.sign(
      {
        sub: user.googleId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: 'google',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({ ok: true, token, user });
  } catch (err) {
    console.error('[auth] Google verification failed:', err.message);
    return res.status(401).json({ error: 'Google authentication failed.' });
  }
});

/**
 * POST /auth/verify
 * Body: { token: "<our JWT>" }
 * Returns the decoded user info if the token is still valid.
 */
authRouter.post('/verify', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Missing token.' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({
      ok: true,
      user: {
        googleId: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.avatar,
        provider: decoded.provider,
      },
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid.' });
  }
});

/**
 * Verify a JWT token string. Used by socket auth middleware.
 * Returns the decoded payload or null.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
