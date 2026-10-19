async function test() {
  const { pipeline, env } = await import('@xenova/transformers');
  
  // Set ONNX WASM settings for Windows compatibility
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.wasm.proxy = false;

  console.log('Testing embedding with WASM single thread...');
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const out1 = await embedder('I love playing badminton on weekends.', { pooling: 'mean', normalize: true });
  console.log('✅ out1 shape:', out1.dims);

  const out2 = await embedder('React hooks let you use state.', { pooling: 'mean', normalize: true });
  console.log('✅ out2 shape:', out2.dims);
}

test().catch(console.error);
