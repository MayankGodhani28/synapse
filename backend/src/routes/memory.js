const router = require('express').Router();
const pool = require('../db');
const { embed } = require('../services/embeddings');
const { chunkText } = require('../services/chunk');
const { extractFacts, generateTags } = require('../services/extract');
const { normalizeUserId, getUserScopes } = require('../services/scopes');

/**
 * GET /memory/list
 * Query: ?user_id=...
 *
 * Lists all memories and their chunk counts for a given user scope
 * including any connected chatbot memories.
 */
router.get('/list', async (req, res) => {
  const rawUserId = req.effectiveUserId || req.query.user_id;
  const apiKeyId = req.query.api_key_id || null;

  if (!rawUserId) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const targetUserId = normalizeUserId(rawUserId);

  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    let result;

    if (apiKeyId) {
      // Per-API-key isolation: only show memories for this specific key
      result = await pool.query(
        `SELECT m.id, m.user_id, m.content, m.source_url, m.source_type, m.created_at,
                COUNT(e.id)::int AS chunk_count,
                array_agg(DISTINCT t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags
         FROM memories m
         LEFT JOIN embeddings e ON m.id = e.memory_id
         LEFT JOIN tags t ON t.memory_id = m.id
         WHERE m.api_key_id = $1
         GROUP BY m.id
         ORDER BY m.created_at DESC
         LIMIT $2 OFFSET $3`,
        [apiKeyId, limit, offset]
      );
    } else {
      // Legacy scope-based listing (extension console, backward compat)
      const userScopes = await getUserScopes(targetUserId);
      result = await pool.query(
        `SELECT m.id, m.user_id, m.content, m.source_url, m.source_type, m.created_at,
                COUNT(e.id)::int AS chunk_count,
                array_agg(DISTINCT t.tag) FILTER (WHERE t.tag IS NOT NULL) AS tags
         FROM memories m
         LEFT JOIN embeddings e ON m.id = e.memory_id
         LEFT JOIN tags t ON t.memory_id = m.id
         WHERE m.user_id = ANY($1::text[])
         GROUP BY m.id
         ORDER BY m.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userScopes, limit, offset]
      );
    }

    res.json({ memories: result.rows });
  } catch (err) {
    console.error('[memory/list] Error:', err);
    res.status(500).json({ error: 'Failed to list memories', details: err.message });
  }
});

/**
 * DELETE /memory/:id
 * Query: ?user_id=...
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const rawUserId = req.effectiveUserId || req.query.user_id;
  const targetUserId = normalizeUserId(rawUserId);

  try {
    const userScopes = await getUserScopes(targetUserId);
    await pool.query('DELETE FROM memories WHERE id = $1 AND user_id = ANY($2::text[])', [id, userScopes]);
    res.json({ success: true, deleted_id: id });
  } catch (err) {
    console.error('[memory/delete] Error:', err);
    res.status(500).json({ error: 'Failed to delete memory', details: err.message });
  }
});

/**
 * POST /memory/add
 * Body: { user_id, content, source_url?, source_type? }
 *
 * Stores raw content in `memories`, then chunks + embeds it
 * and stores one row per chunk in `embeddings`.
 */
router.post('/add', async (req, res) => {
  const { content, source_url, source_type, api_key_id } = req.body;
  const rawUserId = req.effectiveUserId || req.body.user_id;

  if (!rawUserId || !content || !content.trim()) {
    return res.status(400).json({ error: 'user_id and content are required' });
  }

  const targetUserId = normalizeUserId(rawUserId);
  // Use api_key_id from body (dashboard) or from middleware (external API call)
  const effectiveApiKeyId = api_key_id || req.apiKeyId || null;

  try {
    let finalContent = content.trim();
    let tags = [];
    let extracted = false;

    // ── Fact extraction for chat messages ──────────────────
    if (source_type === 'chat') {
      try {
        const facts = await extractFacts(finalContent);
        if (facts.length === 0) {
          console.log(`[memory/add] No durable facts found in chat message for user ${targetUserId} — skipped`);
          return res.json({ success: true, stored: false, reason: 'No durable facts found in this message' });
        }
        finalContent = facts.join('. ');
        extracted = true;
        console.log(`[memory/add] Extracted ${facts.length} fact(s) from chat for user ${targetUserId}`);
      } catch (err) {
        console.warn('[memory/add] Fact extraction failed, storing raw content:', err.message);
      }
    } else {
      // ── Auto-tagging for non-chat content ─────────────────
      try {
        tags = await generateTags(finalContent);
      } catch (err) {
        console.warn('[memory/add] Tag generation failed:', err.message);
        tags = [];
      }
    }

    // 1. Insert the memory (with api_key_id for per-key isolation)
    const mem = await pool.query(
      `INSERT INTO memories (user_id, content, source_url, source_type, api_key_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [targetUserId, finalContent, source_url || null, source_type || 'note', effectiveApiKeyId]
    );
    const memoryId = mem.rows[0].id;

    // 2. Chunk + embed
    const chunks = chunkText(finalContent);
    for (const chunk of chunks) {
      const vector = await embed(chunk);
      await pool.query(
        `INSERT INTO embeddings (memory_id, chunk_text, embedding)
         VALUES ($1, $2, $3)`,
        [memoryId, chunk, JSON.stringify(vector)]
      );
    }

    // 3. Insert tags
    for (const tag of tags) {
      await pool.query(
        'INSERT INTO tags (memory_id, tag) VALUES ($1, $2)',
        [memoryId, tag]
      );
    }

    console.log(`[memory/add] Stored memory ${memoryId} (${chunks.length} chunk(s), ${tags.length} tag(s)) for user ${targetUserId} [key: ${effectiveApiKeyId || 'none'}]${extracted ? ' [extracted]' : ''}`);
    res.json({ success: true, memory_id: memoryId, chunks_stored: chunks.length, tags, extracted, api_key_id: effectiveApiKeyId });
  } catch (err) {
    console.error('[memory/add] Error:', err);
    res.status(500).json({ error: 'Failed to store memory', details: err.message });
  }
});

/**
 * POST /memory/search
 * Body: { user_id, query, top_k? (default 5) }
 *
 * Embeds the query and finds the most semantically similar chunks
 * belonging to that user — never leaks another user's memories.
 */
router.post('/search', async (req, res) => {
  const { query, top_k = 5, api_key_id } = req.body;
  const rawUserId = req.effectiveUserId || req.body.user_id;

  if (!rawUserId || !query || !query.trim()) {
    return res.status(400).json({ error: 'user_id and query are required' });
  }

  const targetUserId = normalizeUserId(rawUserId);

  try {
    const queryVector = await embed(query.trim());
    let result;

    if (api_key_id) {
      // Per-API-key isolation: search only within this key's memories
      result = await pool.query(
        `SELECT e.chunk_text, m.source_url, m.source_type, m.created_at,
                1 - (e.embedding <=> $1) AS similarity
         FROM embeddings e
         JOIN memories m ON e.memory_id = m.id
         WHERE m.api_key_id = $2
         ORDER BY e.embedding <=> $1
         LIMIT $3`,
        [JSON.stringify(queryVector), api_key_id, top_k]
      );
    } else {
      // Legacy scope-based search
      const userScopes = await getUserScopes(targetUserId);
      result = await pool.query(
        `SELECT e.chunk_text, m.source_url, m.source_type, m.created_at,
                1 - (e.embedding <=> $1) AS similarity
         FROM embeddings e
         JOIN memories m ON e.memory_id = m.id
         WHERE m.user_id = ANY($2::text[])
         ORDER BY e.embedding <=> $1
         LIMIT $3`,
        [JSON.stringify(queryVector), userScopes, top_k]
      );
    }

    res.json({ results: result.rows });
  } catch (err) {
    console.error('[memory/search] Error:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

/**
 * GET /memory/graph
 * Query: ?user_id=...&threshold=0.78
 *
 * Returns nodes and edges for a force-directed graph visualization.
 * Edges connect memories whose embeddings have cosine similarity >= threshold.
 */
router.get('/graph', async (req, res) => {
  const rawUserId = req.effectiveUserId || req.query.user_id;
  const apiKeyId = req.query.api_key_id || null;
  if (!rawUserId) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  const targetUserId = normalizeUserId(rawUserId);
  const threshold = parseFloat(req.query.threshold) || 0.78;

  try {
    let result;

    if (apiKeyId) {
      // Per-API-key isolation
      result = await pool.query(
        `SELECT DISTINCT ON (m.id)
                m.id, m.content, m.source_type, m.created_at,
                e.embedding::text AS embedding_str
         FROM memories m
         JOIN embeddings e ON e.memory_id = m.id
         WHERE m.api_key_id = $1
         ORDER BY m.id, e.created_at ASC
         LIMIT 200`,
        [apiKeyId]
      );
    } else {
      const userScopes = await getUserScopes(targetUserId);
      result = await pool.query(
        `SELECT DISTINCT ON (m.id)
                m.id, m.content, m.source_type, m.created_at,
                e.embedding::text AS embedding_str
         FROM memories m
         JOIN embeddings e ON e.memory_id = m.id
         WHERE m.user_id = ANY($1::text[])
         ORDER BY m.id, e.created_at ASC
         LIMIT 200`,
        [userScopes]
      );
    }

    // Parse pgvector string format "[0.1,0.2,...]" into float arrays
    function parseEmbedding(str) {
      if (!str) return null;
      const cleaned = str.replace(/^\[/, '').replace(/\]$/, '');
      return cleaned.split(',').map(Number);
    }

    function cosineSimilarity(a, b) {
      if (!a || !b || a.length !== b.length) return 0;
      let dot = 0, magA = 0, magB = 0;
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
      }
      magA = Math.sqrt(magA);
      magB = Math.sqrt(magB);
      if (magA === 0 || magB === 0) return 0;
      return dot / (magA * magB);
    }

    const memories = result.rows.map(m => ({
      ...m,
      embedding: parseEmbedding(m.embedding_str),
    }));

    // Build nodes
    const nodes = memories.map(m => ({
      id: m.id,
      label: m.content.slice(0, 50).replace(/\n/g, ' '),
      source_type: m.source_type,
      created_at: m.created_at,
    }));

    // Build edges (O(n^2) pairwise — fine for < 200 nodes)
    const edges = [];
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const sim = cosineSimilarity(memories[i].embedding, memories[j].embedding);
        if (sim >= threshold) {
          edges.push({
            source: memories[i].id,
            target: memories[j].id,
            value: Math.round(sim * 1000) / 1000,
          });
        }
      }
    }

    console.log(`[memory/graph] Built graph for ${targetUserId}: ${nodes.length} nodes, ${edges.length} edges`);
    res.json({ nodes, edges });
  } catch (err) {
    console.error('[memory/graph] Error:', err);
    res.status(500).json({ error: 'Failed to build memory graph', details: err.message });
  }
});

module.exports = router;
