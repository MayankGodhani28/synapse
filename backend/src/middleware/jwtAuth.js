/**
 * JWT Authentication Middleware
 *
 * Verifies the Synapse session JWT from the Authorization header.
 * If valid, attaches req.userId, req.userEmail, req.userName.
 * Works alongside apiKeyAuth — JWT takes priority.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'synapse-default-secret-change-me';

function jwtAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  // No auth header — let apiKeyAuth or passthrough handle it
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach verified user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userName = decoded.name;

    // Inject user_id into body and query for downstream route compatibility
    if (!req.body.user_id) {
      req.body.user_id = decoded.userId;
    }
    if (!req.query.user_id) {
      req.query.user_id = decoded.userId;
    }

    next();
  } catch (err) {
    // Token expired or invalid — don't block, let apiKeyAuth try next
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    // For other JWT errors, pass through (maybe apiKey auth will handle)
    return next();
  }
}

module.exports = jwtAuth;
module.exports.JWT_SECRET = JWT_SECRET;
