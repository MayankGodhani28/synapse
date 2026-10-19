/**
 * Embeddings service — uses @xenova/transformers (local, free, no API key).
 * Model: all-MiniLM-L6-v2 → 384-dimensional vectors.
 */

let pipeline = null;

async function getEmbedder() {
  if (!pipeline) {
    const { pipeline: createPipeline, env } = await import('@xenova/transformers');
    
    // Fix for Windows libuv ONNX runtime thread assertion
    if (env && env.backends && env.backends.onnx) {
      if (env.backends.onnx.wasm) {
        env.backends.onnx.wasm.numThreads = 1;
      }
    }

    pipeline = await createPipeline('feature-extraction', 'Xenova/bge-small-en-v1.5', {
      quantized: true,
    });
    console.log('✅ Embedding model loaded: BAAI/bge-small-en-v1.5 (384 dims, high-performance)');
  }
  return pipeline;
}

/**
 * Embed a single string into a 384-dimensional vector.
 * Returns a plain JS number array ready to be stored as pgvector.
 */
async function embed(text) {
  const embedder = await getEmbedder();
  const result = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

module.exports = { embed };
