# Synapse Test Results & Verification Report

**Date:** September 17, 2026  
**Environment:** Windows (Node.js v24, Docker pgvector 0.8.6, ONNX WebAssembly, BAAI/bge-small-en-v1.5)  
**Backend:** Express.js on port 5000  
**Demo Chatbot:** Express.js on port 3001  

---

## 1. Automated Test Suite Results

### A. Core Retrieval & Chat Tests (`test_api_endpoints.js`)
| Test ID | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Test 1** | `GET /health` | `{ status: "ok" }` | `status: "ok"` | ✅ **PASS** |
| **Test 2** | `POST /memory/add` validation | 400 Bad Request on empty payload | 400 Bad Request | ✅ **PASS** |
| **Test 3** | `POST /memory/add` (embedding) | Insert note & generate 384d vector | Memory stored with embedding | ✅ **PASS** |
| **Test 4** | `POST /memory/add` (multi-tenant) | Separate user memory stored | Memory stored for `user-bob` | ✅ **PASS** |
| **Test 5** | `POST /memory/search` (semantic) | Return semantically similar note | "badminton" found for "sports" (0.63 sim) | ✅ **PASS** |
| **Test 6** | `POST /memory/search` (isolation) | `test-user` cannot see `user-bob` | Results count = 0 from other users | ✅ **PASS** |
| **Test 7** | `POST /chat` (RAG answering) | Cite sources and answer from context | "let you use state..." cited react.dev | ✅ **PASS** |
| **Test 8** | `POST /chat` (no hallucination) | Honest response when no memory match | "I don't have anything saved..." | ✅ **PASS** |

### B. Authentication & Developer API Keys (`test_auth.js`)
| Test ID | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Test 1** | User Registration | 400 if user exists, or 201 created | Handled existing user validation | ✅ **PASS** |
| **Test 2** | User Login | Returns valid JWT token | 200 OK with Bearer token | ✅ **PASS** |
| **Test 3** | Bad Password Login | 401 Unauthorized | 401 Unauthorized | ✅ **PASS** |
| **Test 4** | `GET /auth/me` with JWT | Returns current authenticated user | 200 OK with Alex Test details | ✅ **PASS** |
| **Test 5** | `POST /api-keys/generate` | Generates secret starting with `syn_` | Generated `syn_...` securely | ✅ **PASS** |
| **Test 6** | `POST /chat` with `x-api-key` | Authenticates bot and scopes memory | 200 OK using bot scope | ✅ **PASS** |
| **Test 7** | Active User Scopes | Aggregates all user & bot memory blocks | 11 active scopes identified | ✅ **PASS** |

### C. Semantic Graph View (`GET /memory/graph`)
| Test ID | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Test 1** | Graph node aggregation | Returns array of user memories | Nodes returned with labels & types | ✅ **PASS** |
| **Test 2** | Cosine similarity edge linking | Returns edges connecting similar memories | Edges computed via cosine similarity | ✅ **PASS** |

---

## 2. Fact Extraction & Auto-Tagging
- **Fact Extraction (`extractFacts`)**: Automatically filters chat messages for durable, long-term personal facts and skips ephemeral pleasantries. Uses Ollama local engine when available with Google Gemini fallback.
- **Auto-Tagging (`generateTags`)**: Generates 2-4 semantic topic tags on ingested webpages and notes and stores them into the `tags` table.

---

## 3. Web Dashboard Features Verified
- **RAG Chat View**: Real-time conversation with local QA and LLM fallback, context citations (`[1]`, `[2]`), and sources list.
- **Memory Vault**: Searchable memory grid displaying category tags, chunk count badges, source URLs, and delete capability.
- **Vector Search**: Direct similarity score inspection with live cosine score badges.
- **API Keys & Bots Manager**: Key generation modal, prefix listing, copy-to-clipboard, integration code snippets.
- **Interactive Graph View**: Force-directed D3 visualization showing memory clustering and semantic linkages with similarity slider.
- **Settings & Account Panel**: System overview (pgvector version, embedding model dimensions, LLM engine status, active scopes).
