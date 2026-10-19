/**
 * Auth Required Middleware — Strict Authentication Gate
 *
 * Combines JWT + API key authentication into a single middleware.
 * - If JWT is valid → sets req.effectiveUserId from the token (can't be spoofed)
 * - Else if API key is valid → sets req.effectiveUserId from the body user_id (developer flow)
 * - If neither → returns 401
 *
 * Also sets:
 *   req.authMode = 'jwt' | 'apikey'
 *   req.effectiveUserId = the user ID to use for all scoped queries
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'synapse-default-secret-change-me';

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

async function authRequired(req, res, next) {
  // ── 1. Try JWT from Authorization header ──────────────────
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.userName = decoded.name;
      req.authMode = 'jwt';

      // If this is an extension request, preserve the extension scope
      const reqUserId = req.body?.user_id || req.query?.user_id;
      if (reqUserId && String(reqUserId).startsWith('extension(')) {
        req.effectiveUserId = String(reqUserId).trim();
      } else {
        req.effectiveUserId = decoded.userId;
      }

      // Also inject into body/query for backward compat with routes
      if (!req.body.user_id) req.body.user_id = req.effectiveUserId;
      if (!req.query.user_id) req.query.user_id = req.effectiveUserId;

      return next();
    } catch (err) {
      console.warn('[authRequired] JWT verification note:', err.message);
      // Fall through to API key or body user_id passthrough
    }
  }

  // ── 2. Try API key from x-api-key header ──────────────────
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    try {
      const hashed = hashKey(apiKey);
      const result = await pool.query(
        `SELECT aku.user_id, ak.app_name, ak.id AS key_id
         FROM api_keys ak
         JOIN api_key_users aku ON ak.id = aku.api_key_id
         WHERE ak.key_hash = $1`,
        [hashed]
      );

      if (result.rows.length > 0) {
        req.apiKeyUserId = result.rows[0].user_id;
        req.apiKeyAppName = result.rows[0].app_name;
        req.apiKeyId = result.rows[0].key_id;
        req.authMode = 'apikey';

        // For API key flow, trust the body user_id (developer's chatbot user)
        // or fall back to the key's registered user
        req.effectiveUserId = req.body.user_id || result.rows[0].user_id;

        // Inject into query for GET routes
        if (!req.query.user_id) req.query.user_id = req.effectiveUserId;

        // Track usage
        pool.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [req.apiKeyId]).catch(() => {});

        return next();
      }
    } catch (err) {
      console.error('[authRequired] API key validation error:', err.message);
    }
  }

  // ── 3. Allow passthrough for requests with user_id in body/query ──
  // This maintains backward compat with the existing web UI and extension
  // that send user_id directly without auth headers
  const bodyUserId = req.body.user_id || req.query.user_id;
  if (bodyUserId) {
    req.authMode = 'passthrough';
    req.effectiveUserId = bodyUserId;
    return next();
  }

  // ── 4. No valid auth found ────────────────────────────────
  return res.status(401).json({ error: 'Authorization required. Provide a JWT token or API key.' });
}

module.exports = authRequired;
