/**
 * API Key Management Routes
 *
 * Generates and validates API keys for external apps (like the demo chatbot)
 * to securely connect to the Synapse platform.
 *
 * Keys are stored as SHA-256 hashes — the plaintext key is shown only once.
 */

const router = require('express').Router();
const pool = require('../db');
const crypto = require('crypto');

/**
 * Generate a cryptographically random API key string.
 * Format: syn_<32 random hex chars> (e.g. syn_a1b2c3d4e5...)
 */
function generateKey() {
  return 'syn_' + crypto.randomBytes(24).toString('hex');
}

/**
 * Hash a key for storage — we never store plaintext keys.
 */
function hashKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * POST /api-keys/generate
 * Body: { user_id, app_name }
 *
 * Creates a new API key tied to a user_id and app name.
 * Returns the plaintext key (shown ONLY ONCE).
 */
router.post('/generate', async (req, res) => {
  const { user_id, app_name } = req.body;

  if (!user_id || !app_name) {
    return res.status(400).json({ error: 'user_id and app_name are required' });
  }

  try {
    const plainKey = generateKey();
    const hashed = hashKey(plainKey);

    // Look up user UUID if user_id is an email or already UUID
    let developerId = null;
    let userEmail = null;
    try {
      const userLookup = await pool.query(
        'SELECT id, email FROM users WHERE id::text = $1 OR email = $1',
        [user_id]
      );
      if (userLookup.rows.length > 0) {
        developerId = userLookup.rows[0].id;
        userEmail = userLookup.rows[0].email;
      }
    } catch {
      // Not a UUID/known user, continue with generic user_id
    }

    const result = await pool.query(
      `INSERT INTO api_keys (key_hash, app_name, developer_id)
       VALUES ($1, $2, $3) RETURNING id, created_at`,
      [hashed, app_name, developerId]
    );

    const keyId = result.rows[0].id;

    // Store mapping in api_key_users
    await pool.query(
      `INSERT INTO api_key_users (api_key_id, user_id)
       VALUES ($1, $2)`,
      [keyId, user_id]
    );

    // If user has an email distinct from user_id, link email too
    if (userEmail && userEmail !== user_id) {
      await pool.query(
        `INSERT INTO api_key_users (api_key_id, user_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [keyId, userEmail]
      ).catch(() => {});
    }

    console.log(`[api-keys] Generated key for user "${user_id}", app: "${app_name}"`);

    res.json({
      success: true,
      api_key: plainKey,       // ⚠️ Show only once!
      key_id: keyId,
      app_name,
      user_id,
      created_at: result.rows[0].created_at,
      warning: 'Save this key now — it will not be shown again.',
    });
  } catch (err) {
    console.error('[api-keys] Generate error:', err.message);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
});

/**
 * GET /api-keys/list?user_id=...
 *
 * Lists all API keys (masked) for a given user.
 */
router.get('/list', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id query param is required' });
  }

  try {
    const result = await pool.query(
      `SELECT ak.id, ak.app_name, ak.created_at, ak.last_used_at,
              LEFT(ak.key_hash, 8) AS key_prefix,
              COUNT(DISTINCT m.id)::int AS memory_count
       FROM api_keys ak
       LEFT JOIN api_key_users aku ON ak.id = aku.api_key_id
       LEFT JOIN memories m ON m.api_key_id = ak.id
       WHERE aku.user_id = $1 OR ak.developer_id::text = $1
       GROUP BY ak.id
       ORDER BY ak.created_at DESC`,
      [user_id]
    );

    res.json({ keys: result.rows });
  } catch (err) {
    console.error('[api-keys] List error:', err.message);
    res.status(500).json({ error: 'Failed to list keys' });
  }
});

/**
 * DELETE /api-keys/:id
 *
 * Revokes (deletes) an API key.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete embeddings & tags of memories belonging to this api key
    await pool.query('DELETE FROM embeddings WHERE memory_id IN (SELECT id FROM memories WHERE api_key_id = $1)', [id]).catch(() => {});
    await pool.query('DELETE FROM tags WHERE memory_id IN (SELECT id FROM memories WHERE api_key_id = $1)', [id]).catch(() => {});
    await pool.query('DELETE FROM memories WHERE api_key_id = $1', [id]).catch(() => {});

    await pool.query('DELETE FROM api_key_users WHERE api_key_id = $1', [id]);
    await pool.query('DELETE FROM api_keys WHERE id = $1', [id]);
    console.log(`[api-keys] Revoked key ${id} and cleaned up its memory environment`);
    res.json({ success: true, revoked_id: id });
  } catch (err) {
    console.error('[api-keys] Delete error:', err.message);
    res.status(500).json({ error: 'Failed to revoke key: ' + err.message });
  }
});

module.exports = router;
