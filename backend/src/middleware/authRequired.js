const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');

let cachedKeys = [];
let cachedAt = 0;

async function verifyUser(token) {
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  if (!base) throw new Error('SUPABASE_URL is not configured');
  const now = Date.now();
  if (!cachedKeys.length || now - cachedAt > 3600000) {
    const response = await fetch(base + '/auth/v1/.well-known/jwks.json');
    if (!response.ok) throw new Error('Unable to fetch Supabase signing keys');
    const json = await response.json();
    cachedKeys = Array.isArray(json.keys) ? json.keys : [];
    cachedAt = now;
  }
  const header = jwt.decode(token, { complete: true });
  if (!header || !['RS256', 'ES256'].includes(header.header.alg)) throw new Error('Unsupported token');
  const key = cachedKeys.find(k => k.kid === header.header.kid && k.alg === header.header.alg);
  if (!key) throw new Error('Unknown signing key');
  const cryptoKey = crypto.createPublicKey({ key, format: 'jwk' });
  const payload = jwt.verify(token, cryptoKey, {
    algorithms: ['RS256', 'ES256'],
    issuer: base + '/auth/v1',
    audience: 'authenticated',
  });
  if (!payload.sub || payload.role !== 'authenticated' || payload.is_anonymous === true) throw new Error('Invalid identity');
  return payload;
}

async function apiKeyIdentity(key) {
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const result = await pool.query(
    `SELECT ak.id AS key_id, ak.app_name, ak.developer_id,
            aku.user_id AS scope
       FROM api_keys ak
       JOIN api_key_users aku ON aku.api_key_id = ak.id
      WHERE ak.key_hash = $1
      ORDER BY aku.created_at ASC LIMIT 1`,
    [hash]
  );
  return result.rows[0];
}

async function authRequired(req, res, next) {
  try {
    const authorization = req.get('authorization') || '';
    const apiKey = req.get('x-api-key');
    if (authorization.startsWith('Bearer ')) {
      const identity = await verifyUser(authorization.slice(7));
      req.authMode = 'supabase';
      req.userId = identity.sub;
      req.userEmail = identity.email;
      req.userName = identity.email;
      req.effectiveUserId = identity.sub;
    } else if (apiKey) {
      const identity = await apiKeyIdentity(apiKey);
      if (!identity) return res.status(401).json({ error: 'Invalid API key' });
      req.authMode = 'apikey';
      req.apiKeyId = identity.key_id;
      req.apiKeyUserId = identity.scope;
      req.apiKeyAppName = identity.app_name;
      req.userId = identity.developer_id || identity.scope;
      req.effectiveUserId = identity.scope;
    } else {
      return res.status(401).json({ error: 'Sign in or provide a valid API key' });
    }
    req.body = req.body || {};
    req.body.user_id = req.effectiveUserId;
    req.query.user_id = req.effectiveUserId;
    next();
  } catch (err) {
    if (err.message === 'SUPABASE_URL is not configured') return res.status(503).json({ error: 'Authentication not configured' });
    return res.status(401).json({ error: 'Invalid or expired credentials' });
  }
}

module.exports = authRequired;
module.exports.verifyUser = verifyUser;
