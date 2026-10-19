async function testQA() {
  const { pipeline } = await import('@xenova/transformers');
  console.log('Loading question-answering / text2text pipeline...');
  const t0 = Date.now();
  const qa = await pipeline('question-answering', 'Xenova/distilbert-base-cased-distilled-squad');
  console.log(`Loaded QA model in ${Date.now() - t0}ms`);

  const res = await qa('What sport do I love?', 'I love playing badminton on weekends with my friends.');
  console.log('QA Result:', res);
}

testQA().catch(console.error);
