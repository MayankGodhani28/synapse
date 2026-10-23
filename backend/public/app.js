// Synapse Web Client — Dual Console Architecture
const API_BASE = '';

// ============================================================================
// STATE
// ============================================================================
let currentConsole = 'selector'; // 'selector' | 'developer' | 'extension'
let activeUserId = 'test-user';
let activeFilter = 'all';
let allMemories = [];
let allApiKeys = [];
let activeApiKey = null; // Currently selected API key workspace
let lastGeneratedKeyId = null;
let currentUser = null;
let authToken = localStorage.getItem('synapse_token') || null;

// Extension console state
let extActiveFilter = 'all';
let extAllMemories = [];

// ============================================================================
// DOM REFERENCES
// ============================================================================
const serviceSelector = document.getElementById('serviceSelector');
const appContainer = document.getElementById('appContainer');

// Sidebar & Consoles
const consoleBadge = document.getElementById('consoleBadge');
const consoleSwitcher = document.getElementById('consoleSwitcher');
const devNavTabs = document.getElementById('devNavTabs');
const extNavTabs = document.getElementById('extNavTabs');
const activeKeyCard = document.getElementById('activeKeyCard');
const activeKeyName = document.getElementById('activeKeyName');
const switchKeyBtn = document.getElementById('switchKeyBtn');

const tabApiKeysBtn = document.getElementById('tabApiKeysBtn');
const tabVaultBtn = document.getElementById('tabVaultBtn');
const tabChatBtn = document.getElementById('tabChatBtn');
const tabSearchBtn = document.getElementById('tabSearchBtn');
const tabGraphBtn = document.getElementById('tabGraphBtn');

const backendStatusText = document.getElementById('backendStatusText');
const memoryCountBadge = document.getElementById('memoryCountBadge');
const apiKeysCountBadge = document.getElementById('apiKeysCountBadge');
const extMemoryCountBadge = document.getElementById('extMemoryCountBadge');

// Auth
const authCard = document.getElementById('authCard');
const authLoggedOutView = document.getElementById('authLoggedOutView');
const authLoggedInView = document.getElementById('authLoggedInView');
const openAuthModalBtn = document.getElementById('openAuthModalBtn');
const authModal = document.getElementById('authModal');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const authAlert = document.getElementById('authAlert');
const userNameText = document.getElementById('userNameText');
const userEmailText = document.getElementById('userEmailText');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');

// Google Auth Only & Recovery
const googleAuthMainView = document.getElementById('googleAuthMainView');
const googleRecoveryView = document.getElementById('googleRecoveryView');
const googleSignInBtn = document.getElementById('googleSignInBtn');
const styledGoogleBtn = document.getElementById('styledGoogleBtn');
const openGoogleRecoveryLink = document.getElementById('openGoogleRecoveryLink');
const backFromRecoveryLink = document.getElementById('backFromRecoveryLink');

// Chat
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const suggestionChips = document.querySelectorAll('.chip-btn');

// Memory Vault (Developer)
const memoryGrid = document.getElementById('memoryGrid');
const filterBtns = document.querySelectorAll('#vaultPanel .filter-btn');
const refreshMemoriesBtn = document.getElementById('refreshMemoriesBtn');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const addMemoryModal = document.getElementById('addMemoryModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const addMemoryForm = document.getElementById('addMemoryForm');

// Vector Search (Developer)
const vectorSearchInput = document.getElementById('vectorSearchInput');
const runSearchBtn = document.getElementById('runSearchBtn');
const topKSlider = document.getElementById('topKSlider');
const topKLabel = document.getElementById('topKLabel');
const searchResultsList = document.getElementById('searchResultsList');

// API Keys
const keysGrid = document.getElementById('keysGrid');
const openGenerateKeyModalBtn = document.getElementById('openGenerateKeyModalBtn');
const generateKeyModal = document.getElementById('generateKeyModal');
const closeGenerateKeyModalBtn = document.getElementById('closeGenerateKeyModalBtn');
const cancelKeyModalBtn = document.getElementById('cancelKeyModalBtn');
const generateKeyForm = document.getElementById('generateKeyForm');
const keyAppNameInput = document.getElementById('keyAppNameInput');
const keyTargetScopeInput = document.getElementById('keyTargetScopeInput');
const keyCreatedResult = document.getElementById('keyCreatedResult');
const plainKeyDisplayInput = document.getElementById('plainKeyDisplayInput');
const copyKeyBtn = document.getElementById('copyKeyBtn');
const doneKeyModalBtn = document.getElementById('doneKeyModalBtn');
const openNewKeyConsoleBtn = document.getElementById('openNewKeyConsoleBtn');

// Extension console
const extMemoryGrid = document.getElementById('extMemoryGrid');
const extFilterBtns = document.querySelectorAll('#extMemoriesPanel .filter-btn');
const extRefreshMemoriesBtn = document.getElementById('extRefreshMemoriesBtn');
const extOpenAddModalBtn = document.getElementById('extOpenAddModalBtn');
const extVectorSearchInput = document.getElementById('extVectorSearchInput');
const extRunSearchBtn = document.getElementById('extRunSearchBtn');
const extTopKSlider = document.getElementById('extTopKSlider');
const extTopKLabel = document.getElementById('extTopKLabel');
const extSearchResultsList = document.getElementById('extSearchResultsList');

// Console switcher buttons
const switchConsoleBtn = document.getElementById('switchConsoleBtn');
const selectDevConsole = document.getElementById('selectDevConsole');
const selectExtConsole = document.getElementById('selectExtConsole');

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  checkBackendHealth();
  await window.synapseAuthReady;
  await checkAuthSession();
  initGoogleAuth();

  // Determine initial view
  if (currentUser) {
    const savedConsole = localStorage.getItem('synapse_console');
    if (savedConsole === 'developer' || savedConsole === 'extension') {
      showConsole(savedConsole);
    } else {
      showServiceSelector();
    }
  } else {
    // Not logged in — show service selector with auth prompt
    showServiceSelector();
    if (window.location.search.includes('auth=google')) {
      showGoogleView('main');
      authModal.classList.add('open');
    }
  }
});

// ============================================================================
// AUTH HEADERS HELPER
// ============================================================================
function authHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// ============================================================================
// CONSOLE SWITCHING
// ============================================================================
function showServiceSelector() {
  currentConsole = 'selector';
  localStorage.removeItem('synapse_console');
  serviceSelector.style.display = 'flex';
  appContainer.style.display = 'none';
}

async function showConsole(type) {
  currentConsole = type;
  localStorage.setItem('synapse_console', type);
  serviceSelector.style.display = 'none';
  appContainer.style.display = 'flex';

  // Update sidebar badge
  consoleBadge.textContent = type === 'developer' ? 'Developer' : 'Personal / Extension';

  // Toggle nav tabs
  if (type === 'developer') {
    devNavTabs.style.display = 'flex';
    extNavTabs.style.display = 'none';

    // Set user scope for developer
    if (currentUser) {
      activeUserId = currentUser.email || currentUser.id;
    }

    // Load API keys and determine whether an active key exists
    await loadApiKeys();

    if (activeApiKey) {
      updateActiveKeyUI();
      showTab('vault', 'developer');
      loadMemories();
    } else {
      updateActiveKeyUI();
      showTab('apikeys', 'developer');
    }
  } else {
    devNavTabs.style.display = 'none';
    extNavTabs.style.display = 'flex';
    if (activeKeyCard) activeKeyCard.style.display = 'none';

    // Set user scope strictly: one email = one extension memory only
    const userEmail = currentUser ? currentUser.email : activeUserId.replace(/^extension\(|\)$/g, '');
    activeUserId = `extension(${userEmail.toLowerCase().trim()})`;

    // Check if user has downloaded extension or already has saved memories
    const hasDownloaded = localStorage.getItem('synapse_ext_downloaded_' + userEmail) === 'true';

    // Check existing extension memories
    await loadExtMemories();

    if (!hasDownloaded && extAllMemories.length === 0) {
      // User hasn't downloaded extension yet -> show download option FIRST!
      showTab('ext-download', 'extension');
    } else {
      // Already downloaded or has memories -> show console
      showTab('ext-memories', 'extension');
    }
  }
}

function updateActiveKeyUI() {
  if (currentConsole !== 'developer') {
    if (activeKeyCard) activeKeyCard.style.display = 'none';
    return;
  }

  if (activeApiKey) {
    if (activeKeyCard) {
      activeKeyCard.style.display = 'flex';
      activeKeyName.textContent = `${activeApiKey.app_name} (${activeApiKey.key_prefix || 'syn_'}••••)`;
    }
    if (tabVaultBtn) tabVaultBtn.style.display = 'flex';
    if (tabGraphBtn) tabGraphBtn.style.display = 'flex';
  } else {
    if (activeKeyCard) activeKeyCard.style.display = 'none';
    if (tabVaultBtn) tabVaultBtn.style.display = 'none';
    if (tabGraphBtn) tabGraphBtn.style.display = 'none';
  }
}

window.selectApiKey = function (keyId) {
  const key = allApiKeys.find(k => k.id === keyId);
  if (!key) return;

  activeApiKey = key;
  localStorage.setItem('synapse_active_key_id', keyId);
  updateActiveKeyUI();

  // Reset chat messages to this key's context (if chat element exists)
  if (chatMessages) {
    chatMessages.innerHTML = `
      <div class="message system-message">
        <div class="message-bubble">
          <p><strong>Chatbot Console: ${escapeHtml(key.app_name)}</strong></p>
          <p>RAG responses are isolated to memories saved under this API key. Questions will be answered using this key's knowledge only.</p>
        </div>
      </div>
    `;
  }

  showTab('vault', 'developer');
  loadMemories();
};

window.clearActiveApiKey = function () {
  activeApiKey = null;
  localStorage.removeItem('synapse_active_key_id');
  updateActiveKeyUI();
  showTab('apikeys', 'developer');
  renderApiKeys();
};

function showTab(tabId, console) {
  // Hide all panels
  const allPanels = document.querySelectorAll('.tab-panel');
  allPanels.forEach(p => p.classList.remove('active'));

  // Deactivate all nav buttons in the current console
  const navContainer = console === 'developer' ? devNavTabs : extNavTabs;
  navContainer.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Map tab IDs to panel IDs
  const panelMap = {
    'chat': 'chatPanel',
    'vault': 'vaultPanel',
    'search': 'searchPanel',
    'apikeys': 'apikeysPanel',
    'graph': 'graphPanel',
    'settings': 'settingsPanel',
    'ext-memories': 'extMemoriesPanel',
    'ext-search': 'extSearchPanel',
    'ext-graph': 'extGraphPanel',
    'ext-download': 'extDownloadPanel',
  };

  const panelId = panelMap[tabId];
  if (panelId) {
    document.getElementById(panelId).classList.add('active');
  }

  // Activate the clicked nav button
  const activeBtn = navContainer.querySelector(`[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Load data for specific tabs
  if (tabId === 'vault') loadMemories();
  if (tabId === 'apikeys') loadApiKeys();
  if (tabId === 'graph') initGraphView();
  if (tabId === 'settings') loadSettings();
  if (tabId === 'ext-memories') loadExtMemories();
  if (tabId === 'ext-graph') initExtGraphView();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================
function setupEventListeners() {
  // Service Selector
  selectDevConsole.addEventListener('click', () => {
    if (!currentUser) {
      authModal.classList.add('open');
      return;
    }
    showConsole('developer');
  });

  selectExtConsole.addEventListener('click', () => {
    if (!currentUser) {
      authModal.classList.add('open');
      return;
    }
    showConsole('extension');
  });

  // Switch Workspace Button (returns to Welcome screen)
  if (switchConsoleBtn) {
    switchConsoleBtn.addEventListener('click', () => {
      showServiceSelector();
    });
  }

  // Developer Nav Tabs
  devNavTabs.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab, 'developer'));
  });

  // Extension Nav Tabs
  extNavTabs.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab, 'extension'));
  });

  // Chat (if present)
  if (sendChatBtn) sendChatBtn.addEventListener('click', handleSendChat);
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendChat();
      }
    });
  }

  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      if (chatMessages) {
        chatMessages.innerHTML = `
          <div class="message system-message">
            <div class="message-bubble">
              <p>Conversation cleared. Ask any question about your saved memories.</p>
            </div>
          </div>
        `;
      }
    });
  }

  if (suggestionChips) {
    suggestionChips.forEach(chip => {
      chip.addEventListener('click', () => {
        if (chatInput) {
          chatInput.value = chip.dataset.query;
          handleSendChat();
        }
      });
    });
  }

  // Memory Filters (Developer)
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderMemories();
    });
  });

  refreshMemoriesBtn.addEventListener('click', loadMemories);

  // Memory Filters (Extension)
  extFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      extFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      extActiveFilter = btn.dataset.filter;
      renderExtMemories();
    });
  });

  if (extRefreshMemoriesBtn) extRefreshMemoriesBtn.addEventListener('click', loadExtMemories);

  // Memory Modal
  openAddModalBtn.addEventListener('click', () => addMemoryModal.classList.add('open'));
  if (extOpenAddModalBtn) extOpenAddModalBtn.addEventListener('click', () => addMemoryModal.classList.add('open'));
  closeModalBtn.addEventListener('click', () => addMemoryModal.classList.remove('open'));
  cancelModalBtn.addEventListener('click', () => addMemoryModal.classList.remove('open'));

  addMemoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('memoryContent').value.trim();
    const source_type = document.getElementById('memoryType').value;
    const source_url = document.getElementById('memoryUrl').value.trim() || null;
    if (!content) return;

    const submitBtn = document.getElementById('submitMemoryBtn');
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
      const payload = {
        user_id: activeUserId,
        content,
        source_type,
        source_url,
        api_key_id: (currentConsole === 'developer' && activeApiKey) ? activeApiKey.id : null,
      };

      const res = await fetch(`${API_BASE}/memory/add`, {
        method: 'POST',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        addMemoryForm.reset();
        addMemoryModal.classList.remove('open');
        if (currentConsole === 'developer') {
          await loadMemories();
        } else {
          await loadExtMemories();
        }
      } else {
        alert('Error: ' + (data.error || 'Failed to save'));
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      submitBtn.textContent = 'Save & Embed';
      submitBtn.disabled = false;
    }
  });

  // Switch Key Button (Sidebar)
  if (switchKeyBtn) {
    switchKeyBtn.addEventListener('click', () => {
      clearActiveApiKey();
    });
  }

  // Vector Search (Developer - if present)
  if (topKSlider && topKLabel) topKSlider.addEventListener('input', (e) => topKLabel.textContent = e.target.value);
  if (runSearchBtn) runSearchBtn.addEventListener('click', handleVectorSearch);
  if (vectorSearchInput) vectorSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleVectorSearch(); });

  // Vector Search (Extension)
  if (extTopKSlider) extTopKSlider.addEventListener('input', (e) => extTopKLabel.textContent = e.target.value);
  if (extRunSearchBtn) extRunSearchBtn.addEventListener('click', handleExtVectorSearch);
  if (extVectorSearchInput) extVectorSearchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleExtVectorSearch(); });

  // Auth Modals
  openAuthModalBtn.addEventListener('click', () => {
    showAuthAlert(null);
    showGoogleView('main');
    authModal.classList.add('open');
  });
  closeAuthModalBtn.addEventListener('click', () => authModal.classList.remove('open'));
  logoutBtn.addEventListener('click', handleLogout);

  if (openGoogleRecoveryLink) {
    openGoogleRecoveryLink.addEventListener('click', (e) => {
      e.preventDefault();
      showGoogleView('recovery');
    });
  }

  if (backFromRecoveryLink) {
    backFromRecoveryLink.addEventListener('click', (e) => {
      e.preventDefault();
      showGoogleView('main');
    });
  }

  if (styledGoogleBtn) {
    styledGoogleBtn.addEventListener('click', () => {
      handleStyledGoogleClick();
    });
  }

  // API Key Generation
  openGenerateKeyModalBtn.addEventListener('click', () => {
    keyTargetScopeInput.value = activeUserId;
    keyAppNameInput.value = '';
    generateKeyForm.style.display = 'block';
    keyCreatedResult.style.display = 'none';
    generateKeyModal.classList.add('open');
  });

  closeGenerateKeyModalBtn.addEventListener('click', () => generateKeyModal.classList.remove('open'));
  cancelKeyModalBtn.addEventListener('click', () => generateKeyModal.classList.remove('open'));
  doneKeyModalBtn.addEventListener('click', () => {
    generateKeyModal.classList.remove('open');
    if (lastGeneratedKeyId) {
      selectApiKey(lastGeneratedKeyId);
    }
  });

  if (openNewKeyConsoleBtn) {
    openNewKeyConsoleBtn.addEventListener('click', () => {
      generateKeyModal.classList.remove('open');
      if (lastGeneratedKeyId) {
        selectApiKey(lastGeneratedKeyId);
      }
    });
  }

  generateKeyForm.addEventListener('submit', handleGenerateKeySubmit);

  copyKeyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(plainKeyDisplayInput.value).then(() => {
      copyKeyBtn.textContent = '✓ Copied!';
      setTimeout(() => { copyKeyBtn.textContent = 'Copy'; }, 2000);
    });
  });

  // Extension Download & Gate Buttons
  const downloadExtensionBtn = document.getElementById('downloadExtensionBtn');
  const openExtConsoleBtn = document.getElementById('openExtConsoleBtn');

  if (downloadExtensionBtn) {
    downloadExtensionBtn.addEventListener('click', () => {
      const userEmail = currentUser ? currentUser.email : activeUserId.replace(/^extension\(|\)$/g, '');
      localStorage.setItem('synapse_ext_downloaded_' + userEmail, 'true');
    });
  }

  if (openExtConsoleBtn) {
    openExtConsoleBtn.addEventListener('click', () => {
      const userEmail = currentUser ? currentUser.email : activeUserId.replace(/^extension\(|\)$/g, '');
      localStorage.setItem('synapse_ext_downloaded_' + userEmail, 'true');
      showTab('ext-memories', 'extension');
      loadExtMemories();
    });
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================
async function checkAuthSession() {
  authToken = localStorage.getItem('synapse_token') || null;
  if (!authToken) {
    renderAuthState(null);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const data = await res.json();

    if (data.authenticated && data.user) {
      renderAuthState(data.user);
    } else {
      authToken = null;
      localStorage.removeItem('synapse_token');
      renderAuthState(null);
    }
  } catch {
    renderAuthState(null);
  }
}

function renderAuthState(user) {
  currentUser = user;
  if (user) {
    authLoggedOutView.style.display = 'none';
    authLoggedInView.style.display = 'flex';
    userNameText.textContent = user.name || user.email.split('@')[0];
    userEmailText.textContent = user.email;
    const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
    userAvatar.textContent = initial;
  } else {
    authLoggedOutView.style.display = 'block';
    authLoggedInView.style.display = 'none';
  }
}

let googleAuthEnabled = false;
let googleClientId = null;

async function initGoogleAuth() {
  googleAuthEnabled = true;
}

async function handleGoogleCredentialResponse() {
  const { error } = await window.synapseGoogleLogin();
  if (error) showAuthAlert(error.message, 'error');
}

function showGoogleView(view) {
  showAuthAlert(null);
  if (view === 'recovery') {
    if (googleAuthMainView) googleAuthMainView.style.display = 'none';
    if (googleRecoveryView) googleRecoveryView.style.display = 'block';
  } else {
    if (googleAuthMainView) googleAuthMainView.style.display = 'block';
    if (googleRecoveryView) googleRecoveryView.style.display = 'none';
  }
}

async function handleStyledGoogleClick() {
  try {
    const { error } = await window.synapseGoogleLogin();
    if (error) showAuthAlert(error.message, 'error');
  } catch (error) {
    showAuthAlert(error.message, 'error');
  }
}

function showAuthAlert(message, type = 'error') {
  if (!message) {
    authAlert.style.display = 'none';
    authAlert.innerHTML = '';
    return;
  }
  authAlert.className = `auth-alert ${type}`;
  authAlert.innerHTML = message;
  authAlert.style.display = 'block';
}

function handleLogout() {
  window.synapseLogout().catch(console.error);
  authToken = null;
  currentUser = null;
  localStorage.removeItem('synapse_token');
  localStorage.removeItem('synapse_console');
  try {
    window.postMessage({ type: 'SYNAPSE_AUTH_LOGOUT' }, '*');
  } catch {}
  renderAuthState(null);
  activeUserId = 'test-user';
  showServiceSelector();
}

// ============================================================================
// API KEYS
// ============================================================================
async function loadApiKeys() {
  keysGrid.innerHTML = '<div class="loading-state">Loading API keys...</div>';
  try {
    const res = await fetch(`${API_BASE}/api-keys/list?user_id=${encodeURIComponent(activeUserId)}`, {
      headers: authHeaders(),
    });
    const data = await res.json();

    if (data.keys) {
      allApiKeys = data.keys;
      if (apiKeysCountBadge) {
        apiKeysCountBadge.textContent = allApiKeys.length;
      }

      // Restore active key from storage if present
      const savedKeyId = localStorage.getItem('synapse_active_key_id');
      if (savedKeyId) {
        const found = allApiKeys.find(k => k.id === savedKeyId);
        if (found) {
          activeApiKey = found;
        } else {
          activeApiKey = null;
          localStorage.removeItem('synapse_active_key_id');
        }
      }

      updateActiveKeyUI();
      renderApiKeys();
    }
  } catch (err) {
    keysGrid.innerHTML = `<div class="empty-state">Failed to load API keys: ${err.message}</div>`;
  }
}

function renderApiKeys() {
  if (allApiKeys.length === 0) {
    keysGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>No API keys created yet. Each API key provides its own dedicated memory console for your chatbot or application.</p>
        <br>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('openGenerateKeyModalBtn').click()">+ Generate First Key</button>
      </div>
    `;
    return;
  }

  keysGrid.innerHTML = allApiKeys.map(k => {
    const createdDate = new Date(k.created_at).toLocaleDateString();
    const lastUsed = k.last_used_at ? `Active ${formatTimeAgo(k.last_used_at)}` : 'Never used';
    const isCurrent = activeApiKey && activeApiKey.id === k.id;
    return `
      <div class="key-card" style="${isCurrent ? 'border-color: var(--primary); box-shadow: var(--shadow-md);' : ''}">
        <div class="key-card-header">
          <span class="key-app-name">⚡ ${escapeHtml(k.app_name)}</span>
          <span class="${isCurrent ? 'key-badge-active' : 'key-badge'}">${isCurrent ? '● Active Console' : 'Active'}</span>
        </div>
        <div class="key-prefix-row" style="display: flex; align-items: center; justify-content: space-between;">
          <span class="key-prefix-code">${escapeHtml(k.key_prefix)}••••••••••••••</span>
          <span class="tab-badge" style="font-size: 0.72rem; padding: 2px 8px;">${k.memory_count || 0} memories</span>
        </div>
        <div class="key-footer-meta" style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
          <span>Created ${createdDate} · ${lastUsed}</span>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn-link-danger" onclick="revokeApiKey('${k.id}')">Revoke</button>
            <button class="key-open-btn" onclick="selectApiKey('${k.id}')">${isCurrent ? 'Open Console ✓' : 'Open Console →'}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.revokeApiKey = async function (id) {
  if (!confirm('Revoke this API key? This will remove its associated memories.')) return;
  try {
    const res = await fetch(`${API_BASE}/api-keys/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (data.success) {
      if (activeApiKey && activeApiKey.id === id) {
        clearActiveApiKey();
      } else {
        await loadApiKeys();
      }
    }
  } catch (err) {
    alert('Failed to revoke: ' + err.message);
  }
};

async function handleGenerateKeySubmit(e) {
  e.preventDefault();
  const app_name = keyAppNameInput.value.trim();
  if (!app_name) return;

  const submitBtn = document.getElementById('submitGenerateKeyBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Generating...';

  try {
    const res = await fetch(`${API_BASE}/api-keys/generate`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ user_id: activeUserId, app_name }),
    });

    const data = await res.json();
    if (data.success) {
      lastGeneratedKeyId = data.key_id;
      generateKeyForm.style.display = 'none';
      keyCreatedResult.style.display = 'block';
      plainKeyDisplayInput.value = data.api_key;
      await loadApiKeys();
    } else {
      alert('Error: ' + (data.error || 'Failed to generate key'));
    }
  } catch (err) {
    alert('Network error: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Generate';
  }
}

// ============================================================================
// BACKEND HEALTH
// ============================================================================
async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    if (data.status === 'ok') {
      backendStatusText.textContent = 'Backend Online';
    }
  } catch {
    backendStatusText.textContent = 'Backend Offline';
  }
}

// ============================================================================
// CHAT
// ============================================================================
async function handleSendChat() {
  const question = chatInput.value.trim();
  if (!question) return;

  chatInput.value = '';
  appendMessage('user', escapeHtml(question));

  const loadingId = 'loading-' + Date.now();
  appendMessage('ai', `<span style="color: var(--text-dim);">Thinking & retrieving...</span>`, loadingId);

  try {
    const payload = {
      user_id: activeUserId,
      question,
      api_key_id: (currentConsole === 'developer' && activeApiKey) ? activeApiKey.id : null,
    };

    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const loadingElem = document.getElementById(loadingId);

    if (data.error) {
      if (loadingElem) loadingElem.innerHTML = `<p style="color: var(--accent-danger);">Error: ${escapeHtml(data.error)}</p>`;
      return;
    }

    let answerHtml = formatAnswerText(data.answer);

    if (data.sources && data.sources.length > 0) {
      answerHtml += `
        <div class="sources-list">
          <span class="sources-title">Sources:</span>
          ${data.sources.map((s, idx) => `<a href="${escapeHtml(s)}" target="_blank" rel="noreferrer" class="source-pill">Source [${idx + 1}]</a>`).join('')}
        </div>
      `;
    }

    if (loadingElem) loadingElem.innerHTML = answerHtml;
  } catch (err) {
    const loadingElem = document.getElementById(loadingId);
    if (loadingElem) loadingElem.innerHTML = `<p style="color: var(--accent-danger);">Failed: ${escapeHtml(err.message)}</p>`;
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessage(sender, htmlContent, id = null) {
  if (!chatMessages) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}-message`;
  if (id) msgDiv.id = id;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = htmlContent;

  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatAnswerText(text) {
  return escapeHtml(text).replace(/\[(\d+)\]/g, '<span class="citation-chip" title="Citation [$1]">[$1]</span>');
}

// ============================================================================
// MEMORY VAULT (Developer Console)
// ============================================================================
async function loadMemories() {
  if (currentConsole === 'developer') {
    if (!activeApiKey) {
      memoryGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <p>Please select an API Key environment to view its memory vault.</p>
          <br>
          <button class="btn btn-primary btn-sm" onclick="clearActiveApiKey()">View My API Keys</button>
        </div>
      `;
      return;
    }

    memoryGrid.innerHTML = `<div class="loading-state">Loading memories for ${escapeHtml(activeApiKey.app_name)}...</div>`;
    try {
      const res = await fetch(`${API_BASE}/memory/list?user_id=${encodeURIComponent(activeUserId)}&api_key_id=${encodeURIComponent(activeApiKey.id)}`, {
        headers: authHeaders(),
      });
      const data = await res.json();

      if (data.memories) {
        allMemories = data.memories;
        memoryCountBadge.textContent = allMemories.length;
        if (activeApiKey) activeApiKey.memory_count = allMemories.length;
        renderMemories();
      }
    } catch (err) {
      memoryGrid.innerHTML = `<div class="empty-state">Failed to load: ${escapeHtml(err.message)}</div>`;
    }
  } else {
    loadExtMemories();
  }
}

function renderMemories() {
  const filtered = activeFilter === 'all'
    ? allMemories
    : allMemories.filter(m => m.source_type === activeFilter);

  if (filtered.length === 0) {
    const keyName = activeApiKey ? escapeHtml(activeApiKey.app_name) : 'this key';
    memoryGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>No memories found for <strong>${keyName}</strong>${activeFilter !== 'all' ? ` (${activeFilter})` : ''}.</p>
        <p style="font-size: 0.85rem; color: var(--text-dim); margin-top: 6px;">
          This API key's memory environment is brand new and empty.
        </p>
        <br>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('addMemoryModal').classList.add('open')">+ Add Memory to ${keyName}</button>
      </div>
    `;
    return;
  }

  memoryGrid.innerHTML = filtered.map(m => renderMemoryCard(m)).join('');
}

function formatDisplayUrl(rawUrl) {
  if (!rawUrl) return '';
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname.length > 1 ? parsed.pathname : '';
    let display = host + pathname;
    if (display.length > 36) {
      display = display.slice(0, 33) + '...';
    }
    return display;
  } catch {
    return rawUrl.length > 36 ? rawUrl.slice(0, 33) + '...' : rawUrl;
  }
}

function renderMemoryCard(m) {
  const dateStr = new Date(m.created_at).toLocaleString();
  return `
    <div class="memory-card">
      <div class="memory-card-header">
        <span class="type-tag ${m.source_type || 'note'}">${escapeHtml(m.source_type || 'note')}</span>
        <span class="memory-date">${dateStr}</span>
      </div>
      <div class="memory-body">${escapeHtml(m.content)}</div>
      ${m.tags && m.tags.length > 0 ? `<div class="memory-tags">${m.tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      ${m.source_url ? `
        <a href="${escapeHtml(m.source_url)}" target="_blank" rel="noopener noreferrer" class="source-pill" title="${escapeHtml(m.source_url)}">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0;">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          <span class="source-pill-text">${escapeHtml(formatDisplayUrl(m.source_url))}</span>
        </a>
      ` : ''}
      <div class="memory-footer">
        <span class="memory-chunks">${m.chunk_count || 1} chunk(s)</span>
        <button class="delete-btn" onclick="deleteMemory('${m.id}')" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

window.deleteMemory = async function (id) {
  if (!confirm('Delete this memory and its embeddings?')) return;
  try {
    await fetch(`${API_BASE}/memory/${id}?user_id=${encodeURIComponent(activeUserId)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (currentConsole === 'developer') {
      await loadMemories();
    } else {
      await loadExtMemories();
    }
  } catch (err) {
    alert('Delete error: ' + err.message);
  }
};

// ============================================================================
// EXTENSION CONSOLE — MEMORIES
// ============================================================================
async function loadExtMemories() {
  extMemoryGrid.innerHTML = '<div class="loading-state">Loading memories...</div>';
  try {
    const extUserId = currentUser ? `extension(${currentUser.email})` : activeUserId;
    const res = await fetch(`${API_BASE}/memory/list?user_id=${encodeURIComponent(extUserId)}`, {
      headers: authHeaders(),
    });
    const data = await res.json();

    if (data.memories) {
      extAllMemories = data.memories;
      extMemoryCountBadge.textContent = extAllMemories.length;
      renderExtMemories();
    }
  } catch (err) {
    extMemoryGrid.innerHTML = `<div class="empty-state">Failed to load: ${escapeHtml(err.message)}</div>`;
  }
}

function renderExtMemories() {
  const filtered = extActiveFilter === 'all'
    ? extAllMemories
    : extAllMemories.filter(m => m.source_type === extActiveFilter);

  if (filtered.length === 0) {
    const userEmail = currentUser ? currentUser.email : activeUserId.replace(/^extension\(|\)$/g, '');
    extMemoryGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p><strong>Your Extension Memory Vault is Empty</strong></p>
        <p style="font-size: 0.85rem; color: var(--text-dim); margin-top: 6px;">
          Memories saved using the browser extension are stored under <code>extension(${escapeHtml(userEmail)})</code>.
        </p>
        <br>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" onclick="showTab('ext-download', 'extension')">⬇ Download Extension</button>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('addMemoryModal').classList.add('open')">+ Add Note</button>
        </div>
      </div>
    `;
    return;
  }

  extMemoryGrid.innerHTML = filtered.map(m => renderMemoryCard(m)).join('');
}

// ============================================================================
// VECTOR SEARCH (Developer)
// ============================================================================
async function handleVectorSearch() {
  if (!vectorSearchInput) return;
  const query = vectorSearchInput.value.trim();
  if (!query) return;

  const top_k = parseInt(topKSlider.value, 10) || 5;
  searchResultsList.innerHTML = '<div class="loading-state">Searching...</div>';

  try {
    const payload = {
      user_id: activeUserId,
      query,
      top_k,
      api_key_id: (currentConsole === 'developer' && activeApiKey) ? activeApiKey.id : null,
    };

    const res = await fetch(`${API_BASE}/memory/search`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      searchResultsList.innerHTML = `<div class="empty-state">No matches found for "${escapeHtml(query)}".</div>`;
      return;
    }

    searchResultsList.innerHTML = data.results.map((r, i) => renderSearchResult(r, i)).join('');
  } catch (err) {
    searchResultsList.innerHTML = `<div class="empty-state">Search failed: ${escapeHtml(err.message)}</div>`;
  }
}

// ============================================================================
// VECTOR SEARCH (Extension)
// ============================================================================
async function handleExtVectorSearch() {
  const query = extVectorSearchInput.value.trim();
  if (!query) return;

  const top_k = parseInt(extTopKSlider.value, 10) || 5;
  const extUserId = currentUser ? `extension(${currentUser.email})` : activeUserId;
  extSearchResultsList.innerHTML = '<div class="loading-state">Searching...</div>';

  try {
    const res = await fetch(`${API_BASE}/memory/search`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ user_id: extUserId, query, top_k }),
    });

    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      extSearchResultsList.innerHTML = `<div class="empty-state">No matches found for "${escapeHtml(query)}".</div>`;
      return;
    }

    extSearchResultsList.innerHTML = data.results.map((r, i) => renderSearchResult(r, i)).join('');
  } catch (err) {
    extSearchResultsList.innerHTML = `<div class="empty-state">Search failed: ${escapeHtml(err.message)}</div>`;
  }
}

function renderSearchResult(r, i) {
  const similarityPct = Math.round(r.similarity * 100);
  return `
    <div class="search-result-card">
      <div class="similarity-meter">
        <span class="type-tag ${r.source_type || 'note'}">Result #${i + 1}</span>
        <div class="meter-track">
          <div class="meter-fill" style="width: ${Math.max(similarityPct, 5)}%;"></div>
        </div>
        <span class="similarity-score">${(parseFloat(r.similarity)).toFixed(4)} (${similarityPct}%)</span>
      </div>
      <div class="memory-body">${escapeHtml(r.chunk_text)}</div>
      ${r.source_url ? `<a href="${escapeHtml(r.source_url)}" target="_blank" class="source-pill">🔗 ${escapeHtml(r.source_url)}</a>` : ''}
    </div>
  `;
}

// ============================================================================
// GRAPH VIEW (Developer)
// ============================================================================
let graphSimulation = null;

async function initGraphView() {
  const container = document.getElementById('graphContainer');
  const emptyState = document.getElementById('graphEmptyState');
  const stats = document.getElementById('graphStats');
  const loadBtn = document.getElementById('loadGraphBtn');
  const thresholdSlider = document.getElementById('graphThresholdSlider');
  const thresholdLabel = document.getElementById('graphThresholdLabel');

  thresholdSlider.addEventListener('input', () => {
    thresholdLabel.textContent = (thresholdSlider.value / 100).toFixed(2);
  });

  loadBtn.onclick = async () => {
    const threshold = (thresholdSlider.value / 100).toFixed(2);
    loadBtn.textContent = 'Loading...';
    loadBtn.disabled = true;

    try {
      const keyParam = (currentConsole === 'developer' && activeApiKey) ? `&api_key_id=${encodeURIComponent(activeApiKey.id)}` : '';
      const res = await fetch(`${API_BASE}/memory/graph?user_id=${encodeURIComponent(activeUserId)}&threshold=${threshold}${keyParam}`, {
        headers: authHeaders(),
      });
      const data = await res.json();

      if (!data.nodes || data.nodes.length === 0) {
        emptyState.textContent = activeApiKey
          ? `No graph connections for ${activeApiKey.app_name} yet. Add memories or adjust threshold.`
          : 'No memories found for this scope.';
        emptyState.style.display = 'block';
        stats.style.display = 'none';
        return;
      }

      emptyState.style.display = 'none';
      stats.style.display = 'flex';
      document.getElementById('graphNodeCount').textContent = data.nodes.length;
      document.getElementById('graphEdgeCount').textContent = data.edges.length;

      renderGraph(data.nodes, data.edges, container);
    } catch (err) {
      emptyState.textContent = 'Failed: ' + err.message;
      emptyState.style.display = 'block';
    } finally {
      loadBtn.textContent = 'Load Graph';
      loadBtn.disabled = false;
    }
  };
}

// ============================================================================
// GRAPH VIEW (Extension)
// ============================================================================
let extGraphSimulation = null;

async function initExtGraphView() {
  const container = document.getElementById('extGraphContainer');
  const emptyState = document.getElementById('extGraphEmptyState');
  const stats = document.getElementById('extGraphStats');
  const loadBtn = document.getElementById('extLoadGraphBtn');
  const thresholdSlider = document.getElementById('extGraphThresholdSlider');
  const thresholdLabel = document.getElementById('extGraphThresholdLabel');

  thresholdSlider.addEventListener('input', () => {
    thresholdLabel.textContent = (thresholdSlider.value / 100).toFixed(2);
  });

  loadBtn.onclick = async () => {
    const threshold = (thresholdSlider.value / 100).toFixed(2);
    const extUserId = currentUser ? `extension(${currentUser.email})` : activeUserId;
    loadBtn.textContent = 'Loading...';
    loadBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/memory/graph?user_id=${encodeURIComponent(extUserId)}&threshold=${threshold}`, {
        headers: authHeaders(),
      });
      const data = await res.json();

      if (!data.nodes || data.nodes.length === 0) {
        emptyState.textContent = 'No memories found.';
        emptyState.style.display = 'block';
        stats.style.display = 'none';
        return;
      }

      emptyState.style.display = 'none';
      stats.style.display = 'flex';
      document.getElementById('extGraphNodeCount').textContent = data.nodes.length;
      document.getElementById('extGraphEdgeCount').textContent = data.edges.length;

      renderGraph(data.nodes, data.edges, container);
    } catch (err) {
      emptyState.textContent = 'Failed: ' + err.message;
      emptyState.style.display = 'block';
    } finally {
      loadBtn.textContent = 'Load Graph';
      loadBtn.disabled = false;
    }
  };
}

// ============================================================================
// SHARED GRAPH RENDERER (D3 Force-Directed)
// ============================================================================
function renderGraph(nodes, edges, container) {
  const existingSvg = container.querySelector('svg.graph-svg');
  if (existingSvg) existingSvg.remove();

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;

  const svg = d3.select(container)
    .append('svg')
    .attr('class', 'graph-svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height]);

  // Light theme graph colors
  const typeColors = {
    'webpage': '#4A6FA5',
    'note': '#2D7A4F',
    'selection': '#8B5A6B',
    'chat': '#6B5A8B',
    'pdf': '#B8860B',
  };

  const links = edges.map(e => ({ source: e.source, target: e.target, value: e.value }));

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide(30));

  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#D0CFCC')
    .attr('stroke-opacity', 0.5)
    .attr('stroke-width', d => Math.max(1, d.value * 3));

  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 7)
    .attr('fill', d => typeColors[d.source_type] || '#7A7A76')
    .attr('stroke', '#FFFFFF')
    .attr('stroke-width', 2)
    .call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x; d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      })
    );

  const label = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .text(d => d.label.length > 30 ? d.label.slice(0, 30) + '...' : d.label)
    .attr('font-size', '10px')
    .attr('fill', '#7A7A76')
    .attr('dx', 12)
    .attr('dy', 4);

  node.append('title').text(d => d.label);

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    label
      .attr('x', d => d.x)
      .attr('y', d => d.y);
  });
}

// ============================================================================
// SETTINGS
// ============================================================================
async function loadSettings() {
  const settingsEmail = document.getElementById('settingsEmail');
  const settingsName = document.getElementById('settingsName');
  const settingsAuthMode = document.getElementById('settingsAuthMode');
  const settingsActiveScope = document.getElementById('settingsActiveScope');
  const settingsMemoryCount = document.getElementById('settingsMemoryCount');
  const settingsConsoleType = document.getElementById('settingsConsoleType');
  const settingsLLMEngine = document.getElementById('settingsLLMEngine');

  if (currentUser) {
    settingsEmail.textContent = currentUser.email || '—';
    settingsName.textContent = currentUser.display_name || currentUser.name || '—';
    settingsAuthMode.textContent = 'JWT (Authenticated)';
  } else {
    settingsEmail.textContent = 'Not logged in';
    settingsName.textContent = '—';
    settingsAuthMode.textContent = 'Guest';
  }

  settingsActiveScope.textContent = activeUserId;
  settingsConsoleType.textContent = currentConsole === 'developer' ? 'Developer Console' : 'Extension Console';
  settingsMemoryCount.textContent = (currentConsole === 'developer' ? allMemories.length : extAllMemories.length) + ' loaded';

  try {
    const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      const models = data.models ? data.models.map(m => m.name).join(', ') : 'connected';
      settingsLLMEngine.textContent = `Ollama (${models})`;
    } else {
      settingsLLMEngine.textContent = 'Local QA only';
    }
  } catch {
    settingsLLMEngine.textContent = 'Local QA only';
  }
}

// ============================================================================
// UTILITIES
// ============================================================================
function formatTimeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
