require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Configure ONNX backend settings for Windows libuv stability
(async () => {
  try {
    const { env } = await import('@xenova/transformers');
    env.backends.onnx.wasm.numThreads = 1;
    env.backends.onnx.wasm.proxy = false;
  } catch (err) {
    console.warn('Transformers env config note:', err.message);
  }
})();

const authRequired = require('./middleware/authRequired');
const apiKeyAuth = require('./middleware/apiKeyAuth');
const app = express();

// Universal CORS & Chromium Private Network Access (PNA) for browser extensions & local clients
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '2mb' })); // saved web pages can be long

// Landing page at / and /landing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/landing.html'));
});
app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/landing.html'));
});

// Synapse Web App & Dashboard at /app and /dashboard
app.get(['/app', '/dashboard'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(express.static(path.join(__dirname, '../public')));

// Routes — unified authRequired middleware on protected routes
app.use('/auth', require('./routes/auth'));
app.use('/api-keys', authRequired, require('./routes/apikeys'));
app.use('/memory', authRequired, require('./routes/memory'));
app.use('/chat', authRequired, require('./routes/chat'));

// Health check — confirm the server is alive
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API key connection test — external apps call this to verify their key works
app.get('/connect', apiKeyAuth, (req, res) => {
  if (!req.apiKeyUserId) {
    return res.status(401).json({ error: 'x-api-key header is required' });
  }
  res.json({
    connected: true,
    user_id: req.apiKeyUserId,
    app_name: req.apiKeyAppName,
    platform: 'Synapse',
    version: '1.0.0',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🧠 Synapse backend running on http://localhost:${PORT}`);
  console.log(`   🌐 Web Chat Interface: http://localhost:${PORT}`);
  console.log(`   POST /memory/add    — save content + embed`);
  console.log(`   POST /memory/search — semantic search`);
  console.log(`   POST /chat          — RAG question answering`);
  console.log(`   POST /api-keys/generate — create API key`);
  console.log(`   GET  /connect       — verify API key connection`);
  console.log(`   GET  /health        — liveness check\n`);
});
