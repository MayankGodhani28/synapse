/**
 * Synapse Demo Chatbot — Client-Side Application Logic
 *
 * Connects to the Synapse platform via API key,
 * optionally uses a Gemini LLM API key for richer answers,
 * and automatically saves all conversations back to Synapse.
 */

// ═══════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════
let state = {
  apiKey: null,
  llmApiKey: null,
  serverUrl: 'http://localhost:5000',
  userId: null,
  appName: null,
  isConnected: false,
  isSending: false,
  mode: 'local', // 'local' or 'gemini'
};

// ═══════════════════════════════════════════════════
// DOM Elements
// ═══════════════════════════════════════════════════
const connectOverlay = document.getElementById('connect-overlay');
const connectBtn = document.getElementById('connect-btn');
const apiKeyInput = document.getElementById('api-key-input');
const llmKeyInput = document.getElementById('llm-key-input');
const serverUrlInput = document.getElementById('synapse-url');
const connectError = document.getElementById('connect-error');
const toggleKeyVis = document.getElementById('toggle-key-vis');
const toggleLlmVis = document.getElementById('toggle-llm-vis');

const appEl = document.getElementById('app');
const chatMessages = document.getElementById('chat-messages');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const suggestionsEl = document.getElementById('suggestions');
const topbarTitle = document.getElementById('topbar-title');
const topbarMode = document.getElementById('topbar-mode');

// ═══════════════════════════════════════════════════
// Connection
// ═══════════════════════════════════════════════════

connectBtn.addEventListener('click', handleConnect);
apiKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleConnect();
});
llmKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleConnect();
});

toggleKeyVis.addEventListener('click', () => {
  apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
});
toggleLlmVis.addEventListener('click', () => {
  llmKeyInput.type = llmKeyInput.type === 'password' ? 'text' : 'password';
});

async function handleConnect() {
  const key = apiKeyInput.value.trim();
  const llmKey = llmKeyInput.value.trim();
  const url = serverUrlInput.value.trim().replace(/\/$/, '');

  if (!key) {
    showError('Please enter your Synapse API key.');
    return;
  }
  if (!url) {
    showError('Please enter the Synapse server URL.');
    return;
  }

  connectBtn.classList.add('loading');
  connectError.textContent = '';

  try {
    const res = await fetch(`${url}/connect`, {
      headers: { 'x-api-key': key },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Connection failed (HTTP ${res.status})`);
    }

    const data = await res.json();

    if (!data.connected) {
      throw new Error('Connection rejected by Synapse.');
    }

    // Success — store connection
    state.apiKey = key;
    state.llmApiKey = llmKey || null;
    state.serverUrl = url;
    state.userId = data.user_id;
    state.appName = data.app_name;
    state.isConnected = true;
    state.mode = llmKey ? 'gemini' : 'local';

    // Save to sessionStorage
    sessionStorage.setItem('synapse_key', key);
    sessionStorage.setItem('synapse_url', url);
    if (llmKey) sessionStorage.setItem('llm_key', llmKey);

    // Transition to chat
    connectOverlay.classList.remove('active');
    appEl.classList.remove('hidden');
    topbarTitle.textContent = `Synapse AI — ${data.app_name}`;

    // Update mode badge
    if (state.llmApiKey) {
      topbarMode.textContent = '✨ Gemini';
      topbarMode.className = 'mode-badge gemini';
    } else {
      topbarMode.textContent = '🔧 Local QA';
      topbarMode.className = 'mode-badge';
    }

    // Show welcome message
    showWelcome();
    msgInput.focus();

  } catch (err) {
    showError(err.message);
  } finally {
    connectBtn.classList.remove('loading');
  }
}

function showError(msg) {
  connectError.textContent = msg;
  connectError.style.animation = 'none';
  connectError.offsetHeight; // reflow
  connectError.style.animation = 'msg-in 0.3s ease';
}

// Auto-reconnect from session
(function tryAutoReconnect() {
  const savedKey = sessionStorage.getItem('synapse_key');
  const savedUrl = sessionStorage.getItem('synapse_url');
  const savedLlm = sessionStorage.getItem('llm_key');
  if (savedKey && savedUrl) {
    apiKeyInput.value = savedKey;
    serverUrlInput.value = savedUrl;
    if (savedLlm) llmKeyInput.value = savedLlm;
    handleConnect();
  }
})();

// ═══════════════════════════════════════════════════
// Disconnect
// ═══════════════════════════════════════════════════

disconnectBtn.addEventListener('click', () => {
  state = {
    apiKey: null, llmApiKey: null, serverUrl: 'http://localhost:5000',
    userId: null, appName: null, isConnected: false, isSending: false, mode: 'local',
  };
  sessionStorage.clear();
  chatMessages.innerHTML = '';
  suggestionsEl.style.display = '';
  connectOverlay.classList.add('active');
  appEl.classList.add('hidden');
  apiKeyInput.value = '';
  llmKeyInput.value = '';
  connectError.textContent = '';
  topbarMode.textContent = '';
});

// ═══════════════════════════════════════════════════
// Chat Interface
// ═══════════════════════════════════════════════════

function showWelcome() {
  const modeText = state.llmApiKey
    ? '✨ Using <strong>Google Gemini</strong> for rich, generative answers.'
    : '🔧 Using <strong>local extractive QA</strong>. Add a Gemini key for richer answers.';

  chatMessages.innerHTML = `
    <div class="welcome-msg">
      <h3>👋 Welcome, ${state.userId}!</h3>
      <p>I'm your AI assistant powered by <strong>Synapse</strong>. Ask me anything about your saved memories, notes, and web pages. I'll only answer from what you've actually saved.</p>
      <p style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">${modeText}<br>💾 All conversations are automatically saved to your memory vault.</p>
    </div>
  `;
}

// Auto-resize textarea
msgInput.addEventListener('input', () => {
  msgInput.style.height = 'auto';
  msgInput.style.height = Math.min(msgInput.scrollHeight, 120) + 'px';
  sendBtn.disabled = !msgInput.value.trim();
});

// Send on Enter (Shift+Enter for newline)
msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (msgInput.value.trim()) sendMessage();
  }
});

sendBtn.addEventListener('click', () => {
  if (msgInput.value.trim()) sendMessage();
});

// Suggestion chips
suggestionsEl.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (chip) {
    const query = chip.dataset.query;
    msgInput.value = query;
    sendBtn.disabled = false;
    sendMessage();
  }
});

async function sendMessage() {
  if (state.isSending || !state.isConnected) return;

  const question = msgInput.value.trim();
  if (!question) return;

  state.isSending = true;

  // Hide suggestions after first message
  suggestionsEl.style.display = 'none';

  // Clear welcome message if present
  const welcome = chatMessages.querySelector('.welcome-msg');
  if (welcome) welcome.remove();

  // Add user message
  appendMessage('user', question);

  // Clear input
  msgInput.value = '';
  msgInput.style.height = 'auto';
  sendBtn.disabled = true;

  // Show typing indicator
  const typingEl = showTyping();

  try {
    const body = {
      question,
      save_conversation: true,
    };

    // Include LLM key if available
    if (state.llmApiKey) {
      body.llm_api_key = state.llmApiKey;
    }

    const res = await fetch(`${state.serverUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': state.apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // Remove typing indicator
    typingEl.remove();

    if (res.ok) {
      appendMessage('bot', data.answer, data.sources, data.mode);
    } else {
      appendMessage('bot', `⚠️ ${data.error || 'Something went wrong.'}`);
    }
  } catch (err) {
    typingEl.remove();
    appendMessage('bot', `❌ Connection error: ${err.message}`);
  } finally {
    state.isSending = false;
  }
}

// ═══════════════════════════════════════════════════
// Message Rendering
// ═══════════════════════════════════════════════════

function appendMessage(role, text, sources = [], mode = '') {
  const msgEl = document.createElement('div');
  msgEl.className = `message ${role}`;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const avatarContent = role === 'bot' ? '🧠' : '👤';

  let sourcesHTML = '';
  if (sources && sources.length > 0) {
    const chips = sources.map(url => {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        return `<a href="${url}" target="_blank" class="source-chip">${domain}</a>`;
      } catch {
        return `<a href="${url}" target="_blank" class="source-chip">${url}</a>`;
      }
    }).join('');
    sourcesHTML = `<div class="msg-sources">${chips}</div>`;
  }

  // Clean citation tags from answer text for display
  const cleanText = text.replace(/\[(\d+)\]/g, '<sup class="citation">[$1]</sup>');

  // Mode indicator for bot messages
  let modeHTML = '';
  if (role === 'bot' && mode) {
    const modeLabel = mode === 'gemini' ? '✨ Gemini' : mode === 'local' ? '🔧 Local' : mode;
    modeHTML = `<span class="saved-indicator">💾 Saved to Synapse · ${modeLabel}</span>`;
  }

  msgEl.innerHTML = `
    <div class="msg-avatar">${avatarContent}</div>
    <div class="msg-content">
      <div class="msg-bubble">${cleanText}</div>
      ${sourcesHTML}
      <span class="msg-time">${time}</span>
      ${modeHTML}
    </div>
  `;

  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const typingEl = document.createElement('div');
  typingEl.className = 'message bot';
  typingEl.innerHTML = `
    <div class="msg-avatar">🧠</div>
    <div class="msg-content">
      <div class="msg-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return typingEl;
}
