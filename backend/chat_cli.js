/**
 * Interactive Terminal CLI Chat for Synapse
 * Usage: node backend/chat_cli.js [user_id]
 */

const readline = require('readline');

const API_BASE = 'http://localhost:5000';
const activeUser = process.argv[2] || 'test-user';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n========================================================');
console.log('         🧠 SYNAPSE INTERACTIVE RAG CHAT (CLI)         ');
console.log('========================================================');
console.log(`Active User Scope: \x1b[36m${activeUser}\x1b[0m`);
console.log('Type your question and press Enter. (Type \x1b[33mexit\x1b[0m to quit)\n');

function promptUser() {
  rl.question(`\x1b[32m[${activeUser}]\x1b[0m > `, async (question) => {
    const q = question.trim();
    if (!q) {
      promptUser();
      return;
    }

    if (q.toLowerCase() === 'exit' || q.toLowerCase() === 'quit') {
      console.log('\nExiting Synapse CLI. Goodbye!\n');
      rl.close();
      process.exit(0);
    }

    // Special command: add memory
    if (q.startsWith('/add ')) {
      const content = q.slice(5).trim();
      process.stdout.write('Saving & embedding memory...');
      try {
        const res = await fetch(`${API_BASE}/memory/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: activeUser, content, source_type: 'note' }),
        });
        const data = await res.json();
        console.log(`\r\x1b[32m✅ Memory saved!\x1b[0m ID: ${data.memory_id} (${data.chunks_stored} vector chunk(s))\n`);
      } catch (err) {
        console.log(`\r\x1b[31m❌ Error:\x1b[0m ${err.message}\n`);
      }
      promptUser();
      return;
    }

    process.stdout.write('🧠 Searching vector space & thinking...');
    try {
      const t0 = Date.now();
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: activeUser, question: q }),
      });
      const data = await res.json();
      const elapsed = Date.now() - t0;

      process.stdout.write('\r' + ' '.repeat(45) + '\r');
      console.log(`\x1b[35m[Synapse AI]\x1b[0m (${elapsed}ms):`);
      console.log(`\x1b[1m${data.answer}\x1b[0m`);

      if (data.sources && data.sources.length > 0) {
        console.log(`\x1b[90mSources: ${data.sources.join(', ')}\x1b[0m`);
      }
      console.log('');
    } catch (err) {
      console.log(`\r\x1b[31m❌ Chat Error:\x1b[0m ${err.message}\n`);
    }

    promptUser();
  });
}

// Check backend first
(async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    if (data.status === 'ok') {
      promptUser();
    }
  } catch (err) {
    console.error('\x1b[31m❌ Backend is not reachable at http://localhost:5000.\x1b[0m');
    console.error('Please start the backend first: powershell -File "e:\\synepse\\scripts\\start_backend.ps1"\n');
    process.exit(1);
  }
})();
