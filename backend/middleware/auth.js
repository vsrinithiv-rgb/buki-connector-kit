const crypto = require('crypto');
const config = require('../config/env');

/**
 * Constant-time string comparison to avoid timing side-channels on bearer tokens.
 */
function safeTokenEquals(provided, expected) {
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

/**
 * Creates Bearer token authentication middleware.
 * Rejects missing, malformed, or invalid tokens with 401 Unauthorized.
 */
function createAuthMiddleware(getExpectedToken = () => config.bukiApiToken) {
  return function requireAuth(req, res, next) {
    const expectedToken = getExpectedToken();
    if (!expectedToken) {
      return res.status(503).json({
        ok: false,
        error: {
          code: 'AUTH_NOT_CONFIGURED',
          message: 'Server authentication token is not configured.',
        },
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing Authorization header. Expected Bearer token.',
        },
      });
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || !parts[1]) {
      return res.status(401).json({
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Malformed Authorization header. Use "Bearer <token>".',
        },
      });
    }

    const providedToken = parts[1];
    if (!safeTokenEquals(providedToken, expectedToken)) {
      return res.status(401).json({
        ok: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired Buki bearer token.',
        },
      });
    }

    req.user = {
      id: 'buki-team-member',
      role: 'internal',
    };

    return next();
  };
}

module.exports = {
  createAuthMiddleware,
  requireAuth: createAuthMiddleware(),
};
