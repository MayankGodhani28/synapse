/**
 * Automated end-to-end test suite for Synapse Retrieval & Chat API
 */

const BASE_URL = 'http://localhost:5000';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function assert(condition, message, details = '') {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    if (details) console.error('   Details:', details);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('    SYNAPSE RETRIEVAL & CHAT AUTOMATED TEST SUITE   ');
  console.log('====================================================\n');

  // Clean up prior test runs for test-user and user-bob
  for (const uid of ['test-user', 'user-bob']) {
    const listRes = await request(`/memory/list?user_id=${uid}&limit=100`);
    if (listRes.data && listRes.data.memories) {
      for (const m of listRes.data.memories) {
        await request(`/memory/${m.id}?user_id=${uid}`, { method: 'DELETE' });
      }
    }
  }

  // Test 1: Health Check
  console.log('--- Test 1: GET /health ---');
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Health endpoint returns status: ok', health);

  // Test 2: Validation on /memory/add
  console.log('\n--- Test 2: Validation on /memory/add ---');
  const badAdd = await request('/memory/add', {
    method: 'POST',
    body: JSON.stringify({ user_id: 'test-user', content: '' }),
  });
  assert(badAdd.status === 400, 'Rejects empty content with 400 Bad Request', badAdd);

  // Test 3: Save memories for test-user
  console.log('\n--- Test 3: POST /memory/add (test-user memories) ---');
  const mem1 = await request('/memory/add', {
    method: 'POST',
    body: JSON.stringify({
      user_id: 'test-user',
      content: 'I love playing badminton on weekends.',
      source_type: 'note',
    }),
  });
  assert(mem1.status === 200 && mem1.data && mem1.data.success, 'Stored badminton memory and generated embedding', mem1);

  const mem2 = await request('/memory/add', {
    method: 'POST',
    body: JSON.stringify({
      user_id: 'test-user',
      content: 'React hooks let you use state in function components.',
      source_url: 'https://react.dev/reference/react',
      source_type: 'webpage',
    }),
  });
  assert(mem2.status === 200 && mem2.data && mem2.data.success, 'Stored React hooks memory with source URL', mem2);

  // Test 4: Save memory for a different user (for user scoping test)
  console.log('\n--- Test 4: POST /memory/add (other user memory) ---');
  const memBob = await request('/memory/add', {
    method: 'POST',
    body: JSON.stringify({
      user_id: 'user-bob',
      content: 'Bob loves mountain biking and skiing.',
      source_type: 'note',
    }),
  });
  assert(memBob.status === 200 && memBob.data && memBob.data.success, 'Stored memory for user-bob', memBob);

  // Test 5: Semantic Search (Core proof without keyword overlap)
  console.log('\n--- Test 5: POST /memory/search (Semantic Search Proof) ---');
  const search1 = await request('/memory/search', {
    method: 'POST',
    body: JSON.stringify({
      user_id: 'test-user',
      query: 'What sports do I enjoy?',
    }),
  });
  assert(search1.status === 200 && search1.data && search1.data.results && search1.data.results.length > 0, 'Search returned results', search1);
  const topResult = search1.data.results[0];
  console.log('   Top search result:', JSON.stringify(topResult.chunk_text), `(Similarity: ${topResult.similarity})`);
  assert(topResult.chunk_text.includes('badminton'), 'Badminton note retrieved as top result for "What sports do I enjoy?" without shared keywords');

  // Test 6: User Isolation / Scoping
  console.log('\n--- Test 6: POST /memory/search (User Isolation) ---');
  const searchIsolation = await request('/memory/search', {
    method: 'POST',
    body: JSON.stringify({
      user_id: 'test-user',
      query: 'mountain biking skiing',
    }),
  });
  const leaked = searchIsolation.data.results.some(r => r.chunk_text.includes('Bob'));
  assert(!leaked, "test-user cannot see user-bob's memories (user isolation verified)");

  // Test 7: RAG Chat — Answer from saved context
  console.log('\n--- Test 7: POST /chat (RAG Question Answering) ---');
  const chat1 = await request('/chat', {
    method: 'POST',
    body: JSON.stringify({
      user_id: 'test-user',
      question: 'What did I say about hooks?',
      save_conversation: false,
    }),
  });
  assert(chat1.status === 200 && chat1.data, 'Chat endpoint returned 200', chat1);
  console.log('   Chat Answer:', chat1.data.answer);
  console.log('   Chat Sources:', chat1.data.sources);
  assert(chat1.data.answer && chat1.data.sources.includes('https://react.dev/reference/react'), 'Chat answered using saved memory and cited source URL');

  // Test 8: RAG Chat — "Nothing saved" for unrelated query (No hallucination)
  console.log('\n--- Test 8: POST /chat (Unrelated Query / No Hallucination) ---');
  const chat2 = await request('/chat', {
    method: 'POST',
    body: JSON.stringify({
      user_id: 'test-user',
      question: 'What is my favorite movie?',
      save_conversation: false,
    }),
  });
  assert(chat2.status === 200 && chat2.data, 'Unrelated chat query returned 200', chat2);
  console.log('   Chat Answer:', chat2.data.answer);
  assert(chat2.data.answer.includes("I don't have anything saved") || chat2.data.sources.length === 0, 'Gives honest "nothing saved" response for queries without matching memories');

  console.log('\n====================================================');
  console.log('   🎉 ALL SYNAPSE RETRIEVAL & CHAT TESTS PASSED!    ');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
