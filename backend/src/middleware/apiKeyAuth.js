/**
 * API Key Authentication Middleware
 *
 * Validates the `x-api-key` header against stored key hashes.
 * If valid, attaches `req.apiKeyUserId` so downstream routes
 * know which user's memories to scope to.
 */

const pool = require('../db');
const crypto = require('crypto');

function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Middleware: Authenticate via API Key
 *
 * Checks for `x-api-key` header. If present, validates it.
 * If absent, falls back to body `user_id` (for backward compat
 * with the existing web UI and extension).
 */
async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  // If no API key header — allow passthrough for existing routes
  // (web UI, extension, CLI all send user_id in the body)
  if (!apiKey) {
    return next();
  }

  try {
    const hashed = hashKey(apiKey);

    const result = await pool.query(
      `SELECT aku.user_id, ak.app_name, ak.id AS key_id
       FROM api_keys ak
       JOIN api_key_users aku ON ak.id = aku.api_key_id
       WHERE ak.key_hash = $1`,
      [hashed]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Attach authenticated user info to the request
    req.apiKeyUserId = result.rows[0].user_id;
    req.apiKeyAppName = result.rows[0].app_name;
    req.apiKeyId = result.rows[0].key_id;

    // Track active usage
    pool.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [req.apiKeyId]).catch(() => {});

    // If body doesn't have user_id, inject it from the API key
    if (!req.body.user_id) {
      req.body.user_id = result.rows[0].user_id;
    }
    // Also handle query params (for GET routes)
    if (!req.query.user_id) {
      req.query.user_id = result.rows[0].user_id;
    }

    next();
  } catch (err) {
    console.error('[auth] API key validation error:', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = apiKeyAuth;
