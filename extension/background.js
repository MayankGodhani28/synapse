// =============================================================
// Synapse — background.js (MV3 service worker)
// Handles context menus, page & selection captures, and backend storage
// All HTTP network calls run in this service worker (bypassing page CSP)
// =============================================================

const BACKEND_URLS = [
  "http://localhost:5000",
  "http://127.0.0.1:5000"
];

// Register context menus safely
function registerContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save-selection",
      title: "Save selection to Synapse",
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) { /* ignore duplicate warning */ }
    });

    chrome.contextMenus.create({
      id: "save-page",
      title: "Save page to Synapse",
      contexts: ["page"]
    }, () => {
      if (chrome.runtime.lastError) { /* ignore duplicate warning */ }
    });

    console.log("[Synapse] Context menus registered successfully.");
  });
}

chrome.runtime.onInstalled.addListener(registerContextMenus);
chrome.runtime.onStartup.addListener(registerContextMenus);

// Retrieve user strictly from storage. If user is logged out, NEVER auto-save or auto-login!
async function getUserFromStorage() {
  try {
    const data = await chrome.storage.local.get(["synapse_user", "synapse_token", "synapse_logged_out"]);
    
    // If explicitly logged out or missing user/token, do NOT allow saves
    if (data.synapse_logged_out || !data.synapse_user || !data.synapse_token) {
      return null;
    }

    let user = data.synapse_user;
    if (typeof user === "string") {
      try { user = JSON.parse(user); } catch {}
    }

    if (user && user.email) return user;
  } catch (err) {
    console.warn("[Synapse] Storage lookup error:", err);
  }
  return null;
}

// POST memory to backend (with automatic localhost / 127.0.0.1 fallback)
async function sendToBackend(payload) {
  let lastErr = null;

  for (const host of BACKEND_URLS) {
    const url = `${host}/memory/add`;
    try {
      const data = await chrome.storage.local.get(["synapse_token"]);
      const headers = { "Content-Type": "application/json" };
      if (data.synapse_token) {
        headers["Authorization"] = `Bearer ${data.synapse_token}`;
      }

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resData = await res.json();
        console.log("[Synapse] Stored successfully:", resData);
        return { success: true, ok: true, data: resData };
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn(`[Synapse] Backend error (${url}):`, res.status, err);
        return { success: false, ok: false, error: err.error || `HTTP ${res.status}` };
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[Synapse] Fetch to ${url} failed:`, err.message);
    }
  }

  return { 
    success: false, 
    ok: false, 
    error: lastErr?.message || "Failed to connect to Synapse (is port 5000 running?)" 
  };
}

// Display feedback toast on the tab + toolbar badge icon feedback
async function notifyTab(tabId, message, isSuccess = true) {
  // Toolbar badge feedback
  if (tabId) {
    try {
      chrome.action.setBadgeText({ text: isSuccess ? "✓" : "!", tabId });
      chrome.action.setBadgeBackgroundColor({ color: isSuccess ? "#10B981" : "#EF4444", tabId });
      setTimeout(() => {
        chrome.action.setBadgeText({ text: "", tabId }).catch(() => {});
      }, 3000);
    } catch {}
  }

  if (!tabId) return;

  // 1. Try sending message to content.js if already loaded
  try {
    const res = await chrome.tabs.sendMessage(tabId, { action: "show-toast", message, isSuccess });
    if (res && res.shown) return;
  } catch {}

  // 2. Inject toast overlay directly via scripting API
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (msg, success) => {
        const existing = document.getElementById("synapse-toast");
        if (existing) existing.remove();

        const el = document.createElement("div");
        el.id = "synapse-toast";
        el.textContent = msg;
        el.style.cssText = [
          "position: fixed !important",
          "bottom: 24px !important",
          "right: 24px !important",
          success ? "background: #111827 !important" : "background: #7F1D1D !important",
          "color: #F9FAFB !important",
          "padding: 12px 20px !important",
          "border-radius: 8px !important",
          "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important",
          "font-size: 13px !important",
          "font-weight: 500 !important",
          "box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important",
          success ? "border: 1px solid #374151 !important" : "border: 1px solid #EF4444 !important",
          "z-index: 2147483647 !important",
          "opacity: 1 !important",
          "transition: opacity 0.3s ease !important",
          "pointer-events: none !important"
        ].join("; ");

        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = "0"; }, 2500);
        setTimeout(() => { el.remove(); }, 2900);
      },
      args: [message, isSuccess]
    });
  } catch (err) {
    if (chrome.notifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Synapse",
        message
      });
    }
  }
}

// ── Context Menu Action: Save Selection ──────────────────────────────────────
async function handleSaveSelection(info, tab) {
  try {
    const selectedText = (info.selectionText || "").trim();
    if (!selectedText) {
      await notifyTab(tab?.id, "⚠ No text selected", false);
      return;
    }

    const user = await getUserFromStorage();
    if (!user || !user.email) {
      await notifyTab(tab?.id, "⚠ Please sign in to the Synapse extension popup first", false);
      return;
    }

    const payload = {
      user_id: `extension(${user.email.toLowerCase().trim()})`,
      content: selectedText,
      source_url: info.pageUrl || tab?.url || null,
      source_type: "selection"
    };

    const res = await sendToBackend(payload);
    if (res.success) {
      await notifyTab(tab?.id, `Saved to Synapse (${user.email}) ✓`, true);
    } else {
      await notifyTab(tab?.id, `⚠ ${res.error || "Failed to connect to Synapse (is port 5000 running?)"}`, false);
    }
  } catch (err) {
    console.error("[Synapse] handleSaveSelection error:", err);
    await notifyTab(tab?.id, `⚠ Error: ${err.message}`, false);
  }
}

// ── Context Menu Action: Save Page ───────────────────────────────────────────
async function handleSavePage(info, tab) {
  try {
    const user = await getUserFromStorage();
    if (!user || !user.email) {
      await notifyTab(tab?.id, "⚠ Please sign in to the Synapse extension popup first", false);
      return;
    }

    if (!tab?.id) return;

    let pageContent = "";
    let pageUrl = tab.url || info.pageUrl || "";

    // 1. Try asking content script for extracted text
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: "extract-page-text" });
      if (response && response.text) {
        pageContent = response.text;
        if (response.url) pageUrl = response.url;
      }
    } catch {}

    // 2. Fallback: inject small script to get innerText
    if (!pageContent) {
      try {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => ({
            text: document.body ? document.body.innerText.trim() : "",
            url: window.location.href
          })
        });
        if (result && result.result && result.result.text) {
          pageContent = result.result.text;
          pageUrl = result.result.url || pageUrl;
        }
      } catch (err) {
        console.warn("[Synapse] executeScript fallback failed:", err);
      }
    }

    if (!pageContent) {
      await notifyTab(tab.id, "⚠ Could not extract content from this page", false);
      return;
    }

    const payload = {
      user_id: `extension(${user.email.toLowerCase().trim()})`,
      content: pageContent,
      source_url: pageUrl,
      source_type: "webpage"
    };

    const res = await sendToBackend(payload);
    if (res.success) {
      await notifyTab(tab.id, `Saved page to Synapse (${user.email}) ✓`, true);
    } else {
      await notifyTab(tab.id, `⚠ ${res.error || "Failed to connect to Synapse (is port 5000 running?)"}`, false);
    }
  } catch (err) {
    console.error("[Synapse] handleSavePage error:", err);
    await notifyTab(tab?.id, `⚠ Error: ${err.message}`, false);
  }
}

// ── Context Menu Click Listener ──────────────────────────────────────────────
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-selection") {
    handleSaveSelection(info, tab).catch(err => console.error("[Synapse] Selection error:", err));
  } else if (info.menuItemId === "save-page") {
    handleSavePage(info, tab).catch(err => console.error("[Synapse] Page error:", err));
  }
});

// ── Message Listener for Popup and Content Scripts ───────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Explicit logout handler
  if (msg.action === "logout") {
    chrome.storage.local.set({ synapse_logged_out: true }, () => {
      chrome.storage.local.remove(["synapse_token", "synapse_user"], () => {
        console.log("[Synapse] User logged out from extension.");
        sendResponse({ success: true, ok: true });
      });
    });
    return true;
  }

  // Save to Synapse (used by popup.js quick note save)
  if (msg.action === "save-to-synapse") {
    getUserFromStorage().then(user => {
      if (!user || !user.email) {
        console.warn("[Synapse] save-to-synapse blocked: user is not logged in.");
        sendResponse({ ok: false, success: false, error: "Please sign in to the Synapse extension first." });
        return;
      }
      sendToBackend(msg.payload).then(res => {
        sendResponse({ ok: res.success, success: res.success, error: res.error, data: res.data });
      });
    });
    return true;
  }

  // Auto-sync authentication from localhost:5000 web dashboard
  if (msg.action === "sync-web-auth" && msg.token) {
    fetch(`${BACKEND_URLS[0]}/auth/me`, {
      headers: { Authorization: `Bearer ${msg.token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.user) {
          chrome.storage.local.set({
            synapse_logged_out: false,
            synapse_token: msg.token,
            synapse_user: data.user
          });
          console.log("[Synapse] Auto-synced auth for user:", data.user.email);
          sendResponse({ synced: true, email: data.user.email });
        } else {
          sendResponse({ synced: false });
        }
      })
      .catch(() => sendResponse({ synced: false }));
    return true;
  }

  // Save quick note
  if (msg.action === "save-note") {
    getUserFromStorage().then(user => {
      if (!user || !user.email) {
        console.warn("[Synapse] save-note blocked: user is not logged in.");
        sendResponse({ ok: false, success: false, error: "Please sign in to the Synapse extension first." });
        return;
      }
      const payload = {
        user_id: msg.user_id || `extension(${user.email.toLowerCase().trim()})`,
        content: msg.content,
        source_url: null,
        source_type: "note"
      };
      sendToBackend(payload).then(res => {
        sendResponse({ ok: res.success, success: res.success, error: res.error, data: res.data });
      });
    });
    return true;
  }
});
