/**
 * Text chunker — splits long content into 300-word chunks before embedding.
 * Smaller chunks = more precise retrieval (a 3000-word article is too coarse).
 *
 * maxWords: tune down for high-precision retrieval, up for more context per chunk.
 */
function chunkText(text, maxWords = 300) {
  const words = text.trim().split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks.length ? chunks : [text];
}

module.exports = { chunkText };
