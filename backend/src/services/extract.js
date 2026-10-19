/**
 * Fact Extraction & Auto-Tagging Service
 *
 * Uses Ollama (local, free) as the primary engine, with Gemini as fallback.
 * - extractFacts(message): Extracts durable facts from chat messages
 * - generateTags(content): Auto-generates 2-4 topic tags for any content
 *
 * Both functions return empty arrays on failure — never crash the caller.
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// ─── Check if Ollama is available ────────────────────────
async function isOllamaAvailable() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Call Ollama for JSON responses ──────────────────────
async function callOllama(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.1, num_predict: 300 },
    }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return (data.response || '').trim();
}

// ─── Call Gemini API ─────────────────────────────────────
async function callGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// ─── Parse JSON from LLM response ───────────────────────
function parseJsonResponse(text) {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try { return JSON.parse(match[1].trim()); } catch { /* fall through */ }
    }
    // Try finding JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch { /* fall through */ }
    }
    return null;
  }
}

// ─── Generate LLM response (Ollama first, Gemini fallback) ──
async function getLLMResponse(prompt) {
  // Try Ollama first (local, free)
  if (await isOllamaAvailable()) {
    try {
      return await callOllama(prompt);
    } catch (err) {
      console.warn('[extract] Ollama call failed:', err.message);
    }
  }

  // Try Gemini as fallback
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      return await callGemini(prompt, geminiKey);
    } catch (err) {
      console.warn('[extract] Gemini call failed:', err.message);
    }
  }

  return null;
}

/**
 * Extract durable facts from a chat message.
 * Returns an array of fact strings, or [] if nothing worth remembering.
 */
async function extractFacts(message) {
  const prompt = `Extract any durable, worth-remembering facts about the user from this message.
Include: name, preferences, decisions, ongoing situations, skills, relationships, locations, goals.
Exclude: greetings, small talk, filler words, temporary states ("I'm tired"), questions without assertions.

Return ONLY valid JSON with no extra text: {"facts": ["fact one", "fact two"]}
If nothing is worth remembering, return: {"facts": []}

Message: "${message.replace(/"/g, '\\"')}"`;

  try {
    const response = await getLLMResponse(prompt);
    if (!response) return [];

    const parsed = parseJsonResponse(response);
    if (parsed && Array.isArray(parsed.facts)) {
      return parsed.facts.filter(f => typeof f === 'string' && f.trim().length > 0);
    }
    return [];
  } catch (err) {
    console.warn('[extract] extractFacts error:', err.message);
    return [];
  }
}

/**
 * Generate 2-4 topic tags for content.
 * Returns an array of tag strings, or [] on failure.
 */
async function generateTags(content) {
  const snippet = content.slice(0, 1000);
  const prompt = `Suggest 2-4 short single-or-two-word topic tags for this content.
Tags should be lowercase, concise, and useful for categorization.

Return ONLY valid JSON with no extra text: {"tags": ["tag1", "tag2"]}

Content: "${snippet.replace(/"/g, '\\"')}"`;

  try {
    const response = await getLLMResponse(prompt);
    if (!response) return [];

    const parsed = parseJsonResponse(response);
    if (parsed && Array.isArray(parsed.tags)) {
      return parsed.tags
        .filter(t => typeof t === 'string' && t.trim().length > 0)
        .map(t => t.trim().toLowerCase())
        .slice(0, 4);
    }
    return [];
  } catch (err) {
    console.warn('[extract] generateTags error:', err.message);
    return [];
  }
}

module.exports = { extractFacts, generateTags };
