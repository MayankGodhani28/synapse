const { embed } = require('./src/services/embeddings');

async function test() {
  console.log('Testing embedding generation...');
  const t0 = Date.now();
  const vector = await embed('I love playing badminton on weekends.');
  console.log(`✅ Embedding generated in ${Date.now() - t0}ms`);
  console.log(`Vector dimension: ${vector.length}`);
  console.log('First 5 values:', vector.slice(0, 5));

  if (vector.length === 384) {
    console.log('✅ Dimension matches 384 perfectly!');
  } else {
    console.error('❌ Expected 384 dimensions, got', vector.length);
    process.exit(1);
  }
}

test().catch(e => {
  console.error('Embedding test failed:', e);
  process.exit(1);
});
