const pool = require('../db');

function normalizeUserId(uid) {
  if (!uid) return uid;
  const trimmed = String(uid).trim();
  const lower = trimmed.toLowerCase();

  // If it's an extension scope: normalize to extension(lowercase_email)
  const extMatch = trimmed.match(/^extension\((.*?)\)$/i);
  if (extMatch) {
    return `extension(${extMatch[1].trim().toLowerCase()})`;
  }
  if (lower.startsWith('extension:')) {
    return `extension(${trimmed.replace(/^extension:/i, '').trim().toLowerCase()})`;
  }

  return trimmed;
}

/**
 * Returns all user scopes associated with a given user ID.
 * STRICT ISOLATION:
 * For extension scopes ('extension(email)'), returns ONLY that exact extension scope.
 * It never bridges to developer API keys, bots, or other users.
 */
async function getUserScopes(userId) {
  if (!userId) return ['test-user'];

  const primary = normalizeUserId(userId);

  // STRICT ISOLATION: One email = one extension memory only!
  if (primary.startsWith('extension(')) {
    return [primary];
  }

  const scopes = new Set([primary, String(userId).trim()]);

  try {
    // 1. If this is a user (e.g. test-user or registered email), find their active bots
    const botQuery = await pool.query(
      `SELECT DISTINCT ak.app_name
       FROM api_keys ak
       JOIN api_key_users aku ON ak.id = aku.api_key_id
       WHERE aku.user_id = $1 OR ak.developer_id::text = $1`,
      [primary]
    );
    botQuery.rows.forEach(r => {
      if (r.app_name && r.app_name.trim()) {
        scopes.add(`user bot(${r.app_name.trim()})`);
      }
    });

    // 2. If this is a bot scope (e.g. 'user bot(asd)'), find the owner user
    if (primary.startsWith('user bot(')) {
      const appName = primary.replace(/^user bot\((.*?)\)$/, '$1').trim();
      const parentQuery = await pool.query(
        `SELECT DISTINCT aku.user_id, ak.developer_id, u.email
         FROM api_keys ak
         JOIN api_key_users aku ON ak.id = aku.api_key_id
         LEFT JOIN users u ON ak.developer_id = u.id
         WHERE LOWER(ak.app_name) = LOWER($1)`,
        [appName]
      );
      parentQuery.rows.forEach(r => {
        if (r.user_id) scopes.add(r.user_id);
        if (r.developer_id) scopes.add(String(r.developer_id));
        if (r.email) scopes.add(r.email);
      });
    }
  } catch (err) {
    console.warn('[scopes] Error resolving user scopes:', err.message);
  }

  return Array.from(scopes).filter(Boolean);
}

module.exports = { normalizeUserId, getUserScopes };
