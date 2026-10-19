/**
 * Synapse Demo Chatbot — Standalone Server
 *
 * A lightweight Express server that serves the demo chatbot UI.
 * The chatbot connects to the Synapse platform via API key
 * and uses stored memories as its knowledge context.
 *
 * Port: 3001 (separate from Synapse on 5000)
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.listen(PORT, () => {
  console.log(`\n🤖 Synapse Demo Chatbot running on http://localhost:${PORT}`);
  console.log(`   Connect it to Synapse at http://localhost:5000 using your API key.\n`);
});
