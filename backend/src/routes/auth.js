/**
 * Auth Routes — Synapse Authentication System
 *
 * Supports:
 * 1. Email & Password Registration (with Confirm Password)
 * 2. Email & Password Login
 * 3. Google OAuth Sign-In (optional)
 * 4. GET /auth/me — Current user profile via JWT
 * 5. GET /auth/users — Active user scopes for the Synapse dashboard & bots
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { JWT_SECRET } = require('../middleware/jwtAuth');

let OAuth2Client;
let googleClient;
try {
  const googleAuth = require('google-auth-library');
  OAuth2Client = googleAuth.OAuth2Client;
  if (process.env.GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
} catch (err) {
  console.warn('[auth] google-auth-library not initialized:', err.message);
}

/**
 * Helper to issue a Synapse session JWT (24-hour expiry)
 */
function issueToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.display_name || user.email.split('@')[0],
      picture: user.profile_pic || null,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * GET /auth/config
 * Returns public auth configuration (e.g., Google OAuth Client ID)
 */
router.get('/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : null,
    hasGoogleAuth: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim()),
  });
});

/**
 * GET /auth/active
 * Returns the most recently active user for seamless extension integration
 */
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, display_name, profile_pic FROM users 
       WHERE last_login_at IS NOT NULL 
       ORDER BY last_login_at DESC LIMIT 1`
    );
    if (result.rows.length > 0) {
      return res.json({ success: true, user: result.rows[0] });
    }
    res.json({ success: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /auth/register
 * DIRECT REGISTRATION DISABLED - GOOGLE SINGLE SIGN-ON ENFORCED
 */
router.post('/register', (req, res) => {
  return res.status(403).json({
    error: 'Direct email and password registration is disabled. Please sign in with your Google account.',
  });
});

/**
 * POST /auth/login
 * DIRECT LOGIN DISABLED - GOOGLE SINGLE SIGN-ON ENFORCED
 */
router.post('/login', (req, res) => {
  return res.status(403).json({
    error: 'Direct password login is disabled. Please sign in with your Google account.',
  });
});

/**
 * POST /auth/forgot-password
 * Body: { email }
 * Generates a 6-digit reset code with a 15-minute expiration
 */
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please enter your email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const userRes = await pool.query(
      'SELECT id, email, display_name FROM users WHERE email = $1',
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const user = userRes.rows[0];
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `UPDATE users 
       SET reset_token = $1, reset_token_expires = NOW() + INTERVAL '15 minutes' 
       WHERE id = $2`,
      [resetCode, user.id]
    );

    console.log(`[auth] Password reset code generated for ${cleanEmail}: ${resetCode}`);

    res.json({
      success: true,
      message: 'Reset verification code generated successfully!',
      email: cleanEmail,
      code: resetCode,
      expiresInMinutes: 15,
    });
  } catch (err) {
    console.error('[auth] Forgot password error:', err);
    res.status(500).json({ error: 'Server error generating reset code. Please try again.' });
  }
});

/**
 * POST /auth/reset-password
 * Body: { email, code, newPassword, confirmPassword }
 */
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword, confirmPassword } = req.body;

  if (!email || !code || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  try {
    const userRes = await pool.query(
      `SELECT id, email, reset_token, 
              (reset_token_expires > NOW()) AS is_valid 
       FROM users WHERE email = $1`,
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const user = userRes.rows[0];

    if (!user.reset_token || user.reset_token !== cleanCode) {
      return res.status(400).json({ error: 'Invalid or incorrect reset verification code.' });
    }

    if (!user.is_valid) {
      return res.status(400).json({ error: 'Reset verification code has expired. Please request a new one.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
       WHERE id = $2`,
      [password_hash, user.id]
    );

    console.log(`[auth] Password reset successfully for ${cleanEmail}`);

    res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (err) {
    console.error('[auth] Reset password error:', err);
    res.status(500).json({ error: 'Server error resetting password. Please try again.' });
  }
});

/**
 * POST /auth/google
 * Body: { credential: "<Google id_token>" }
 */
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Missing Google credential token' });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID is not configured in backend .env' });
  }

  try {
    if (!googleClient) {
      googleClient = new OAuth2Client(clientId);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    const cleanEmail = email.toLowerCase();

    let userResult = await pool.query(
      'SELECT id, email, display_name, profile_pic FROM users WHERE google_id = $1',
      [googleId]
    );

    let user;
    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
      await pool.query(
        'UPDATE users SET display_name = $1, profile_pic = $2, email = $3, last_login_at = NOW() WHERE google_id = $4',
        [name, picture, cleanEmail, googleId]
      );
      user.display_name = name;
      user.profile_pic = picture;
      user.email = cleanEmail;
    } else {
      const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
      if (emailCheck.rows.length > 0) {
        await pool.query(
          'UPDATE users SET google_id = $1, display_name = COALESCE(display_name, $2), profile_pic = COALESCE(profile_pic, $3), last_login_at = NOW() WHERE email = $4',
          [googleId, name, picture, cleanEmail]
        );
        user = { id: emailCheck.rows[0].id, email: cleanEmail, display_name: name, profile_pic: picture };
      } else {
        const insertResult = await pool.query(
          `INSERT INTO users (email, google_id, display_name, profile_pic, last_login_at)
           VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
          [cleanEmail, googleId, name, picture]
        );
        user = { id: insertResult.rows[0].id, email: cleanEmail, display_name: name, profile_pic: picture };
      }
    }

    const token = issueToken(user);
    console.log(`[auth] Google login success: ${cleanEmail} (${user.id})`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        profile_pic: user.profile_pic,
      },
    });
  } catch (err) {
    console.error('[auth] Google token verification failed:', err.message);
    res.status(401).json({ error: 'Google authentication failed: ' + err.message });
  }
});

/**
 * GET /auth/me
 * Header: Authorization: Bearer <token>
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      },
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
});

/**
 * GET /auth/users
 * Returns list of active user scopes for the dashboard dropdown:
 * Combines registered users, users with API keys, and test scopes.
 */
router.get('/users', async (req, res) => {
  try {
    // 1. Registered database users
    const usersResult = await pool.query(
      `SELECT id, email, display_name, last_login_at, created_at
       FROM users
       ORDER BY COALESCE(last_login_at, created_at) DESC
       LIMIT 30`
    );

    // 2. Distinct users from api_key_users (e.g. connected chatbots or scopes)
    const apiKeyUsersResult = await pool.query(
      `SELECT DISTINCT aku.user_id, ak.app_name, ak.last_used_at
       FROM api_key_users aku
       JOIN api_keys ak ON aku.api_key_id = ak.id
       ORDER BY ak.last_used_at DESC NULLS LAST
       LIMIT 20`
    );

    // 3. Distinct users who have stored memories
    const memoryUsersResult = await pool.query(
      `SELECT DISTINCT user_id FROM memories LIMIT 20`
    );

    const scopesMap = new Map();

    // 1. Default clean presets
    scopesMap.set('test-user', { id: 'test-user', label: 'test-user (Default)', type: 'preset' });
    scopesMap.set('extension(rudra.vadhadiya@gmail.com)', {
      id: 'extension(rudra.vadhadiya@gmail.com)',
      label: 'extension(rudra.vadhadiya@gmail.com)',
      type: 'extension',
    });

    // 2. Registered DB users
    usersResult.rows.forEach((u) => {
      const emailLower = (u.email || '').toLowerCase();
      if (emailLower === 'rudra.vadhadiya@gmail.com' || emailLower === 'rusra.vadhadiya@gmail.com') {
        return;
      }

      const label = u.display_name ? `${u.display_name} (${u.email})` : u.email;
      scopesMap.set(u.id, {
        id: u.id,
        email: u.email,
        name: u.display_name,
        label: `${label} [ID: ${u.id.substring(0, 8)}...]`,
        type: 'registered_user',
      });
      scopesMap.set(u.email, {
        id: u.email,
        label: `${u.email} (Email scope)`,
        type: 'user_email',
      });
    });

    // 3. Only add bots that currently have active API keys created by the user
    const allApiKeysResult = await pool.query(
      `SELECT DISTINCT app_name, last_used_at FROM api_keys WHERE app_name IS NOT NULL ORDER BY last_used_at DESC NULLS LAST`
    );
    allApiKeysResult.rows.forEach((ak) => {
      if (ak.app_name && ak.app_name.trim()) {
        const botScopeId = `user bot(${ak.app_name.trim()})`;
        scopesMap.set(botScopeId, {
          id: botScopeId,
          label: `🤖 Bot: ${ak.app_name.trim()}`,
          type: 'bot_scope',
          last_used_at: ak.last_used_at,
        });
      }
    });

    res.json({
      success: true,
      scopes: Array.from(scopesMap.values()),
    });
  } catch (err) {
    console.error('[auth] Get users error:', err);
    res.status(500).json({ error: 'Failed to retrieve active user scopes' });
  }
});

module.exports = router;
