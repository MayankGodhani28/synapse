/**
 * RAG Chat route — answers questions using ONLY the user's own saved memories.
 *
 * Supports two modes:
 * 1. LOCAL (default): Extractive QA via distilbert — free, no API key needed
 * 2. LLM (optional): If `llm_api_key` is provided, uses Google Gemini for
 *    richer, generative answers grounded in the retrieved context.
 *
 * Conversations are automatically saved back to Synapse as 'chat' memories
 * when `save_conversation` is true (default).
 */

const router = require('express').Router();
const pool = require('../db');
const { embed } = require('../services/embeddings');
const { chunkText } = require('../services/chunk');
const { normalizeUserId, getUserScopes } = require('../services/scopes');

// Similarity threshold — tune this based on retrieved score distribution
const SIMILARITY_THRESHOLD = 0.50;

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

let qaPipeline = null;

async function getQAPipeline() {
  if (!qaPipeline) {
    const { pipeline, env } = await import('@xenova/transformers');
    if (env && env.backends && env.backends.onnx && env.backends.onnx.wasm) {
      env.backends.onnx.wasm.numThreads = 1;
    }
    qaPipeline = await pipeline('question-answering', 'Xenova/distilbert-base-uncased-distilled-squad', {
      quantized: true,
    });
    console.log('✅ Local QA model loaded: Xenova/distilbert-base-uncased-distilled-squad');
  }
  return qaPipeline;
}

// ─── Check if Local Ollama Engine is Running ────────
async function checkOllamaAvailable() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data.models);
  } catch {
    return false;
  }
}

// ─── Generate Answer with Local Ollama (e.g. Llama 3.2) ────
async function answerWithOllama(question, relevantChunks) {
  const contextText = relevantChunks
    .map((r, i) => `[${i + 1}] ${r.chunk_text}`)
    .join('\n\n');

  const prompt = `You are a concise, intelligent AI memory assistant. Answer the question in 1-2 sentences using ONLY the context provided below. Always cite your sources with [1], [2] corresponding to the context item. If the context does not contain the answer, say "I don't have anything saved that answers that yet."

Context:
${contextText}

Question: ${question}
Answer:`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 200,
      }
    }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    throw new Error(`Ollama HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.response) {
    throw new Error('Empty response from Ollama');
  }

  return data.response.trim();
}

// ─── General Answer with Local Ollama (No context) ──
async function answerGeneralWithOllama(question) {
  const prompt = `You are a concise AI assistant. Answer directly in 1-2 sentences.

Question: ${question}
Answer:`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 150,
      }
    }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return (data.response || '').trim();
}

// ─── Local Extractive QA (Embedded Xenova Fallback) ──
async function answerFromContext(question, relevantChunks) {
  const qa = await getQAPipeline();
  
  const combinedContext = relevantChunks
    .map((r, i) => `[${i + 1}] ${r.chunk_text}`)
    .join('\n\n');

  try {
    const qaResult = await qa(question, combinedContext);

    if (qaResult && qaResult.answer && qaResult.score > 0.05) {
      let citedChunkIndex = 1;
      for (let i = 0; i < relevantChunks.length; i++) {
        if (relevantChunks[i].chunk_text.toLowerCase().includes(qaResult.answer.toLowerCase())) {
          citedChunkIndex = i + 1;
          break;
        }
      }
      return `${qaResult.answer} [${citedChunkIndex}]`;
    }
  } catch (err) {
    console.warn('[chat] QA model inference note:', err.message);
  }

  return `${relevantChunks[0].chunk_text} [1]`;
}

// ─── LLM Generative QA with Memory Context (Google Gemini) ──────
async function answerWithLLM(question, relevantChunks, llmApiKey) {
  const contextText = relevantChunks
    .map((r, i) => `[${i + 1}] ${r.chunk_text}`)
    .join('\n\n');

  const prompt = `You are a concise AI assistant. Answer the question in 1-2 sentences, short and direct like ChatGPT. If the context below is relevant, use it and cite with [1], [2]. If the context is NOT relevant to the question, just answer from your own knowledge — never say "the context doesn't have this".

Context:
${contextText}

Question: ${question}
Answer:`;

  return await callGemini(prompt, llmApiKey);
}

// ─── LLM General Knowledge QA (No Memory Context) ──────────────
async function answerGeneralWithLLM(question, llmApiKey) {
  const prompt = `You are a concise AI assistant. Answer the question directly in 1-2 sentences. Be short, clear, and accurate — like ChatGPT. No long explanations, no bullet points, no disclaimers.

Question: ${question}
Answer:`;

  return await callGemini(prompt, llmApiKey);
}

// ─── Gemini API Call Helper ────────────────────────────────────
async function callGemini(prompt, llmApiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${llmApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `Gemini API error (HTTP ${response.status})`;
    throw new Error(errMsg);
  }

  const data = await response.json();
  const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!answer) {
    throw new Error('No response from Gemini');
  }

  return answer.trim();
}

// ─── Save conversation to Synapse ──────────────────
async function saveConversation(userId, question, answer, sources, apiKeyId = null, appName = null) {
  try {
    const content = `Q: ${question}\nA: ${answer}`;
    const sourceUrl = sources.length > 0 ? sources[0] : null;

    // Insert conversation as a memory linked to apiKeyId
    const mem = await pool.query(
      `INSERT INTO memories (user_id, content, source_url, source_type, api_key_id)
       VALUES ($1, $2, $3, 'chat', $4) RETURNING id`,
      [userId, content, sourceUrl, apiKeyId]
    );
    const memoryId = mem.rows[0].id;

    // Chunk and embed the conversation
    const chunks = chunkText(content);
    for (const chunk of chunks) {
      const vector = await embed(chunk);
      await pool.query(
        `INSERT INTO embeddings (memory_id, chunk_text, embedding)
         VALUES ($1, $2, $3)`,
        [memoryId, chunk, JSON.stringify(vector)]
      );
    }

    // Insert tags for the conversation
    const tags = ['chat', 'chatbot'];
    if (appName) {
      tags.push(`bot: ${appName}`);
    }
    for (const tag of tags) {
      await pool.query(
        `INSERT INTO tags (memory_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [memoryId, tag]
      );
    }

    console.log(`[chat] Saved conversation as memory ${memoryId} (${chunks.length} chunk(s)) for user ${userId} [bot: ${appName || 'none'}]`);
    return memoryId;
  } catch (err) {
    // Don't fail the response if saving fails
    console.warn('[chat] Failed to save conversation:', err.message);
    return null;
  }
}

/**
 * POST /chat
 * Body: { user_id, question, llm_api_key?, save_conversation? }
 *
 * Returns: { answer, sources[], mode }
 */
router.post('/', async (req, res) => {
  const { question, llm_api_key, save_conversation = true, api_key_id } = req.body;
  const rawUserId = req.effectiveUserId || req.body.user_id;

  if (!rawUserId || !question || !question.trim()) {
    return res.status(400).json({ error: 'user_id and question are required' });
  }

  const targetUserId = normalizeUserId(rawUserId);
  const effectiveApiKeyId = api_key_id || req.apiKeyId || null;
  const botScope = req.apiKeyAppName ? `user bot(${req.apiKeyAppName})` : null;

  try {
    // 1. Embed the user question
    const qVector = await embed(question.trim());

    // 2. Retrieve top-5 most relevant chunks
    let context;
    if (effectiveApiKeyId) {
      // Per-API-key isolated memory retrieval
      context = await pool.query(
        `SELECT e.chunk_text, m.source_url, m.source_type,
                1 - (e.embedding <=> $1) AS similarity
         FROM embeddings e
         JOIN memories m ON e.memory_id = m.id
         WHERE m.api_key_id = $2
         ORDER BY e.embedding <=> $1
         LIMIT 5`,
        [JSON.stringify(qVector), effectiveApiKeyId]
      );
    } else {
      // User scope-based retrieval across user and connected scopes
      const userScopes = await getUserScopes(targetUserId);
      if (botScope && !userScopes.includes(botScope)) {
        userScopes.push(botScope);
      }

      context = await pool.query(
        `SELECT e.chunk_text, m.source_url, m.source_type,
                1 - (e.embedding <=> $1) AS similarity
         FROM embeddings e
         JOIN memories m ON e.memory_id = m.id
         WHERE m.user_id = ANY($2::text[])
         ORDER BY e.embedding <=> $1
         LIMIT 5`,
        [JSON.stringify(qVector), userScopes]
      );
    }

    // 3. Filter by similarity threshold
    const relevant = context.rows.filter(r => parseFloat(r.similarity) >= SIMILARITY_THRESHOLD);

    let answer;
    let mode;
    let sources = [];

    // 4. Decide answering engine (Priority: Ollama Local LLM > Gemini LLM > Local QA)
    const hasLLM = !!(llm_api_key && llm_api_key.trim());
    const isOllamaRunning = await checkOllamaAvailable();

    if (relevant.length === 0) {
      // No matching memories found in context
      if (isOllamaRunning) {
        try {
          answer = await answerGeneralWithOllama(question.trim());
          mode = `ollama (${OLLAMA_MODEL})`;
        } catch (ollamaErr) {
          console.warn('[chat] Ollama general answer failed:', ollamaErr.message);
        }
      }

      if (!answer && hasLLM) {
        try {
          answer = await answerGeneralWithLLM(question.trim(), llm_api_key.trim());
          mode = 'gemini';
        } catch (llmErr) {
          console.warn('[chat] LLM general answer failed:', llmErr.message);
        }
      }

      if (!answer) {
        answer = "I don't have anything saved that answers that yet.";
        mode = 'none';
      }
    } else {
      // Memories found — generate grounded answer
      sources = [...new Set(relevant.map(r => r.source_url).filter(Boolean))];

      // Try Local Ollama LLM first
      if (isOllamaRunning) {
        try {
          answer = await answerWithOllama(question.trim(), relevant);
          mode = `ollama (${OLLAMA_MODEL})`;
        } catch (ollamaErr) {
          console.warn('[chat] Ollama memory QA failed, falling back:', ollamaErr.message);
        }
      }

      // Try Gemini if Ollama was not available or failed
      if (!answer && hasLLM) {
        try {
          answer = await answerWithLLM(question.trim(), relevant, llm_api_key.trim());
          mode = 'gemini';
        } catch (llmErr) {
          console.warn('[chat] Gemini failed, falling back to local QA:', llmErr.message);
        }
      }

      // Local Extractive QA fallback (embedded Xenova distilbert)
      if (!answer) {
        answer = await answerFromContext(question.trim(), relevant);
        mode = 'local-qa';
      }
    }

    console.log(`[chat] Answered "${question}" using ${relevant.length} chunk(s) for user ${targetUserId} [botScope: ${botScope || 'none'}] [mode: ${mode}]`);

    // 5. Save conversation to Synapse (once, associated with targetUserId, effectiveApiKeyId, and bot tag)
    if (save_conversation) {
      await saveConversation(targetUserId, question.trim(), answer, sources, effectiveApiKeyId, req.apiKeyAppName || null);
    }

    res.json({ answer, sources, mode, bot_scope: botScope });

  } catch (err) {
    console.error('[chat] Error:', err.message);
    res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;
