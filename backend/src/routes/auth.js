const router = require('express').Router();
const authRequired = require('../middleware/authRequired');
const pool = require('../db');

router.get('/config', (_req, res) => {
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || '';
  if (!url || !key) return res.status(503).json({ error: 'Supabase Auth is not configured' });
  res.json({ supabaseUrl: url, supabasePublishableKey: key, hasGoogleAuth: true });
});

router.get('/me', authRequired, (req, res) => {
  if (req.authMode !== 'supabase') return res.status(403).json({ error: 'User session required' });
  res.json({ authenticated: true, user: { id: req.userId, email: req.userEmail, name: req.userName, picture: null } });
});

router.get('/users', authRequired, async (req, res) => {
  if (req.authMode !== 'supabase') return res.status(403).json({ error: 'User session required' });
  try {
    const keys = await pool.query(
      `SELECT DISTINCT ak.app_name FROM api_keys ak WHERE ak.developer_id = $1`,
      [req.userId]
    );
    res.json({ success: true, scopes: [
      { id: req.userId, label: req.userEmail || 'My memories', type: 'registered_user' },
      ...keys.rows.filter(r => r.app_name).map(r => ({
        id: `user bot(${r.app_name})`, label: `Bot: ${r.app_name}`, type: 'bot_scope'
      }))
    ] });
  } catch (err) {
    res.status(500).json({ error: 'Unable to load scopes' });
  }
});

router.all(['/login', '/register', '/google', '/active', '/forgot-password', '/reset-password'], (_req, res) => {
  res.status(410).json({ error: 'Use Supabase Auth to sign in' });
});

module.exports = router;
