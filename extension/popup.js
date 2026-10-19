// =============================================================
// Synapse — popup.js
// Google Sign-In Only & Quick-Note Capture
// =============================================================

const API_BASE = "http://localhost:5000";

// DOM Elements
const authView = document.getElementById("authView");
const captureView = document.getElementById("captureView");
const popupGoogleBtn = document.getElementById("popupGoogleBtn");
const statusEl = document.getElementById("status");

const userEmailLabel = document.getElementById("userEmailLabel");
const activeScopeLabel = document.getElementById("activeScopeLabel");
const popupLogoutBtn = document.getElementById("popupLogoutBtn");
const noteEl = document.getElementById("note");
const saveBtn = document.getElementById("save");

let statusTimer = null;
let currentUser = null;

// Storage helper (MV3 chrome.storage.local with localStorage fallback)
async function getStorage(key) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => resolve(result[key]));
    });
  }
  return localStorage.getItem(key);
}

async function setStorage(key, value) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

async function removeStorage(key) {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], resolve);
    });
  }
  localStorage.removeItem(key);
}

// ── Initialize ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  setupListeners();
  await checkAuthSession();

  // Listen for storage changes from background or web tab
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && (changes.synapse_user || changes.synapse_token || changes.synapse_logged_out)) {
        checkAuthSession();
      }
    });
  }
});

async function checkAuthSession() {
  const isLoggedOut = await getStorage("synapse_logged_out");
  if (isLoggedOut === true || isLoggedOut === "true") {
    currentUser = null;
    renderLoggedOut();
    return;
  }

  const storedUser = await getStorage("synapse_user");
  const storedToken = await getStorage("synapse_token");

  if (storedUser && storedToken) {
    try {
      currentUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
    } catch {
      currentUser = storedUser;
    }
    if (currentUser && currentUser.email) {
      renderLoggedIn();
      return;
    }
  }

  // Not logged in
  currentUser = null;
  renderLoggedOut();
}

function renderLoggedIn() {
  authView.style.display = "none";
  captureView.style.display = "flex";

  const email = currentUser?.email || "user@example.com";
  userEmailLabel.textContent = email;
  activeScopeLabel.textContent = `extension(${email})`;
  setTimeout(() => noteEl?.focus(), 100);
}

function renderLoggedOut() {
  captureView.style.display = "none";
  authView.style.display = "block";
}

// ── Event Listeners ──────────────────────────────────────────
function setupListeners() {
  // Google Sign-In button click
  if (popupGoogleBtn) {
    popupGoogleBtn.addEventListener("click", () => {
      showStatus("Opening Google Sign-In...", "info");
      const targetUrl = `${API_BASE}/app?auth=google`;

      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
        chrome.tabs.create({ url: targetUrl });
      } else {
        window.open(targetUrl, "_blank");
      }
    });
  }

  // Logout
  if (popupLogoutBtn) {
    popupLogoutBtn.addEventListener("click", async () => {
      // 1. Explicitly mark as logged out in storage
      await setStorage("synapse_logged_out", true);
      await removeStorage("synapse_token");
      await removeStorage("synapse_user");
      currentUser = null;

      // 2. Notify background service worker
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "logout" });
      }

      showStatus("Signed out successfully", "info");
      setTimeout(() => {
        showStatus(null);
        renderLoggedOut();
      }, 350);
    });
  }

  // Save Note
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      const isLoggedOut = await getStorage("synapse_logged_out");
      if (isLoggedOut === true || isLoggedOut === "true" || !currentUser || !currentUser.email) {
        showStatus("Please sign in with Google first.", "error");
        renderLoggedOut();
        return;
      }

      const content = noteEl.value.trim();
      if (!content) {
        showStatus("Please enter content first.", "error");
        return;
      }

      saveBtn.disabled = true;
      showStatus("Saving to vault...", "info");

      const user_id = `extension(${currentUser.email.toLowerCase().trim()})`;
      const payload = {
        user_id,
        content,
        source_url: null,
        source_type: "note"
      };

      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "save-to-synapse", payload }, (res) => {
          saveBtn.disabled = false;
          if (chrome.runtime.lastError || !res || !res.ok) {
            const errMsg = res?.error || "Save failed. Please sign in.";
            showStatus(errMsg, "error");
          } else {
            noteEl.value = "";
            showStatus("Saved to Synapse ✓", "success");
          }
        });
      } else {
        fallbackDirectSave(payload);
      }
    });
  }

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter
  if (noteEl) {
    noteEl.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        saveBtn.click();
      }
    });
  }
}

async function fallbackDirectSave(payload) {
  try {
    const token = await getStorage("synapse_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/memory/add`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    saveBtn.disabled = false;
    if (data.success) {
      noteEl.value = "";
      showStatus("Saved to Synapse ✓", "success");
    } else {
      showStatus(data.error || "Save failed", "error");
    }
  } catch (err) {
    saveBtn.disabled = false;
    showStatus("Failed to reach Synapse backend", "error");
  }
}

// ── Helpers ──────────────────────────────────────────────────
function showStatus(text, type = "info") {
  clearTimeout(statusTimer);

  if (!text) {
    statusEl.className = "status-banner";
    statusEl.textContent = "";
    return;
  }

  statusEl.textContent = text;
  statusEl.className = `status-banner visible ${type}`;

  if (type === "success" || type === "info") {
    statusTimer = setTimeout(() => {
      statusEl.className = "status-banner";
    }, 2800);
  }
}
