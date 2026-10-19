// =============================================================
// Synapse — content.js
// Handles text extraction, session synchronization & notifications
// All network requests are routed through background.js (service worker)
// =============================================================

// Auto-sync authentication from localhost:5000 web dashboard if user is logged in
async function checkWebDashboardAuth() {
  try {
    const isLocalhost = window.location.hostname === "localhost" || 
                        window.location.hostname === "127.0.0.1" || 
                        window.location.origin === "http://localhost:5000" ||
                        window.location.origin === "http://127.0.0.1:5000";
    if (isLocalhost) {
      // Check if extension user explicitly logged out
      const extState = await new Promise(r => chrome.storage.local.get(["synapse_logged_out"], r));
      if (extState && extState.synapse_logged_out) {
        return;
      }

      const token = localStorage.getItem("synapse_token");
      if (token) {
        chrome.runtime.sendMessage({ action: "sync-web-auth", token });
      }
    }
  } catch {}
}

checkWebDashboardAuth();

// Listen for direct window messages from the web dashboard (Google login / sign out events)
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.type === "SYNAPSE_AUTH_LOGIN" && event.data.token) {
    chrome.runtime.sendMessage({ action: "sync-web-auth", token: event.data.token });
  } else if (event.data?.type === "SYNAPSE_AUTH_LOGOUT") {
    chrome.runtime.sendMessage({ action: "logout" });
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Show in-page toast notification
  if (msg.action === "show-toast") {
    showToast(msg.message, msg.isSuccess !== false);
    sendResponse({ shown: true });
    return true;
  }

  // Extract article / page text for background.js
  if (msg.action === "extract-page-text") {
    const extracted = extractPageContent();
    sendResponse(extracted);
    return true;
  }

  // Backward-compatibility fallback if an old background script sent capture-page
  if (msg.action === "capture-page") {
    handleLegacyCapturePage().then(res => sendResponse(res));
    return true;
  }
});

// Extract cleaned content using Readability or innerText fallback
function extractPageContent() {
  let content = "";
  try {
    if (typeof Readability !== "undefined") {
      const documentClone = document.cloneNode(true);
      const article = new Readability(documentClone).parse();
      if (article && article.textContent) {
        content = article.textContent.trim();
      }
    }
  } catch (err) {
    console.warn("[Synapse] Readability parse error:", err);
  }

  if (!content && document.body) {
    content = document.body.innerText.trim();
  }

  return {
    text: content,
    title: document.title || "Webpage",
    url: window.location.href
  };
}

// Fallback for legacy messages
async function handleLegacyCapturePage() {
  const { text, url } = extractPageContent();
  let storedUser = null;
  try {
    const data = await new Promise(r => chrome.storage.local.get(["synapse_user", "synapse_token", "synapse_logged_out"], r));
    if (data.synapse_logged_out || !data.synapse_token) {
      showToast("⚠ Please sign in to Synapse first (open the extension icon)", false);
      return { ok: false, error: "Not logged in" };
    }
    storedUser = data.synapse_user;
    if (typeof storedUser === "string") storedUser = JSON.parse(storedUser);
  } catch {}

  if (!storedUser || !storedUser.email) {
    showToast("⚠ Please sign in to Synapse first (open the extension icon)", false);
    return { ok: false, error: "Not logged in" };
  }

  const email = storedUser.email;
  const payload = {
    user_id: `extension(${email.toLowerCase().trim()})`,
    content: text,
    source_url: url,
    source_type: "webpage"
  };

  chrome.runtime.sendMessage({ action: "save-to-synapse", payload }, (res) => {
    if (chrome.runtime.lastError || !res || (res.ok === false && res.success === false)) {
      showToast(res?.error || "⚠ Failed to connect to Synapse (is port 5000 running?)", false);
    } else {
      showToast(`Saved page to Synapse (${email}) ✓`, true);
    }
  });

  return { ok: true };
}

// ── Toast notification overlay ───────────────────────────────────────────────
function showToast(text, isSuccess = true) {
  const existing = document.getElementById("synapse-toast");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.id = "synapse-toast";
  el.textContent = text;
  el.style.cssText = [
    "position: fixed !important",
    "bottom: 24px !important",
    "right: 24px !important",
    isSuccess ? "background: #111827 !important" : "background: #7F1D1D !important",
    "color: #F9FAFB !important",
    "padding: 12px 20px !important",
    "border-radius: 8px !important",
    "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
    "font-size: 13px !important",
    "font-weight: 500 !important",
    "box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important",
    isSuccess ? "border: 1px solid #374151 !important" : "border: 1px solid #EF4444 !important",
    "z-index: 2147483647 !important",
    "opacity: 1 !important",
    "transition: opacity 0.3s ease !important",
    "pointer-events: none !important"
  ].join("; ");

  document.body.appendChild(el);

  setTimeout(() => { el.style.opacity = "0"; }, 2500);
  setTimeout(() => { el.remove(); }, 2900);
}
