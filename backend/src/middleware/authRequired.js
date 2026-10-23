const { createRemoteJWKSet, jwtVerify } = require('jose');
const crypto = require('crypto');
const pool = require('../db');

let jwks;
let issuer;

function getVerifier() {
  const url = process.env.SUPABASE_URL;
  if (!url) throw new Error('SUPABASE_URL is not configured');
  const base = url.replace(/\/$/, '');
  if (!jwks || issuer !== base + '/auth/v1') {
    issuer = base + '/auth/v1';
    jwks = createRemoteJWKSet(new URL(issuer + '/.well-known/jwks.json'));
  }
  return { jwks, issuer };
}

async function verifyUser(token) {
  const { jwks, issuer } = getVerifier();
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: 'authenticated',
    algorithms: ['RS256', 'ES256'],
  });
  if (!payload.sub || payload.role !== 'authenticated' || payload.is_anonymous === true) {
    throw new Error('Invalid authenticated identity');
  }
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
