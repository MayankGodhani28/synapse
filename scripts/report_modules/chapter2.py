# -*- coding: utf-8 -*-

def get_chapter2_html():
    return r"""
    <div class="page-break" style="padding-top: 20px;">
      <h1 class="chapter-title">CHAPTER 2 — REQUIREMENT ANALYSIS AND SYSTEM SPECIFICATION</h1>

      <h2>2.1 Feasibility Study</h2>
      <p>
        A rigorous feasibility study was performed prior to system development to evaluate the technical viability, economic practicality, and operational sustainability of the Synapse platform. This analysis determined that local artificial intelligence memory layers are fully realizable on standard consumer-grade development hardware.
      </p>

      <h3>2.1.1 Technical Feasibility</h3>
      <p>
        Technical feasibility assesses whether the hardware specifications, open-source programming frameworks, database engines, and natural language processing libraries required to construct Synapse are readily accessible, reliable, and performant. Synapse combines Google Chrome Manifest V3 APIs, an Express.js backend on Node.js 24, a local ONNX runtime for transformer inference (<code>@xenova/transformers</code>), and a containerized PostgreSQL 16 relational database with the <code>pgvector</code> extension.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 4: Technical Requirements for Hardware and Software Infrastructure</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 25%;">Component</th>
              <th style="width: 30%;">Technology Specification</th>
              <th style="width: 45%;">Engineering Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Frontend Capture</strong></td>
              <td>Chrome Manifest V3, Mozilla Readability</td>
              <td>Extracts clean DOM content and handles context menu text selection events.</td>
            </tr>
            <tr>
              <td><strong>Application Backend</strong></td>
              <td>Node.js v24, Express.js 4.19</td>
              <td>Processes REST endpoints, coordinates semantic chunking, and manages API authentication.</td>
            </tr>
            <tr>
              <td><strong>On-Device NLP Model</strong></td>
              <td>Hugging Face ONNX (<code>BAAI/bge-small-en-v1.5</code>)</td>
              <td>Generates dense 384-dimensional mathematical embeddings directly on CPU.</td>
            </tr>
            <tr>
              <td><strong>Vector Persistence</strong></td>
              <td>PostgreSQL 16, pgvector 0.8.6</td>
              <td>Provides relational storage and IVFFlat indexed Approximate Nearest Neighbor cosine search.</td>
            </tr>
            <tr>
              <td><strong>Virtualization</strong></td>
              <td>Docker Desktop (WSL2 Backend)</td>
              <td>Guarantees reproducible container isolation and zero host port collisions.</td>
            </tr>
            <tr>
              <td><strong>Hardware Baseline</strong></td>
              <td>Modern x86_64 CPU, 8 GB RAM, 10 GB SSD</td>
              <td>Provides sufficient computational resources for local model weights and relational storage.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>2.1.2 Economical Feasibility</h3>
      <p>
        Economic feasibility examines whether the development and operational expenditures associated with Synapse are viable compared to commercial alternatives. Commercial cloud vector services impose continuous monthly infrastructure charges and recurring per-token embedding API costs. In sharp contrast, Synapse is engineered from the ground up to utilize 100% open-source software and local compute resources.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 5: Economic Cost Breakdown and Operational Feasibility Factor</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 32%;">Expense Item</th>
              <th style="width: 38%;">Commercial Cloud Alternative</th>
              <th style="width: 30%;">Synapse Platform Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Embedding Generation</strong></td>
              <td>$0.02 per 1M tokens (OpenAI API)</td>
              <td>$0.00 (Local ONNX Model)</td>
            </tr>
            <tr>
              <td><strong>Vector Database Hosting</strong></td>
              <td>$70.00 - $250.00 / month (Pinecone / Weaviate)</td>
              <td>$0.00 (Self-Hosted Docker pgvector)</td>
            </tr>
            <tr>
              <td><strong>Web Content Extraction</strong></td>
              <td>$49.00 / month (SaaS Scraper APIs)</td>
              <td>$0.00 (Mozilla Readability in Extension)</td>
            </tr>
            <tr>
              <td><strong>Developer Tooling &amp; IDE</strong></td>
              <td>Commercial Licenses</td>
              <td>$0.00 (VS Code &amp; Git Open Source)</td>
            </tr>
            <tr>
              <td><strong>Total Estimated Monthly Run-Rate</strong></td>
              <td><strong>~$120.00 - $350.00 / month</strong></td>
              <td><strong>$0.00 (100% Free &amp; Open Source)</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>2.1.3 Operational Feasibility</h3>
      <p>
        Operational feasibility evaluates the usability of the platform across typical daily workflows. The browser extension integrates unobtrusively into the user's browsing experience: right-clicking any webpage or highlighted passage saves content into Synapse in under a second. The responsive web dashboard requires no specialized command-line expertise for standard users, while developers are provided with automated curl examples and clear API documentation.
      </p>

      <h2>2.2 Software Requirement Specification (SRS)</h2>
      <p>
        The Software Requirement Specification (SRS) establishes the foundational contract between functional capabilities, data structures, performance constraints, and security requirements.
      </p>

      <h3>2.2.1 Purpose and Scope</h3>
      <p>
        The purpose of the Synapse platform is to provide a unified, private, on-device AI memory layer that collects unstructured information from the web, indexes it in dense mathematical vector space, and surfaces grounded answers to conversational agents. The scope encompasses the Chrome extension client, the ingestion and chunking microservice, local ONNX embedding inference, PostgreSQL pgvector storage, and a developer console.
      </p>

      <h3>2.2.2 Data Requirements</h3>
      <p>
        The system must store, index, and retrieve user identities, developer credentials, raw content payloads, vector embeddings, and categorized tags. Data consistency, relational integrity, and cryptographic hashing must be rigorously maintained across all operations.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 6: Comprehensive Data Entities and Relational Cardinality</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 18%;">Entity</th>
              <th style="width: 32%;">Key Attributes</th>
              <th style="width: 50%;">Storage Description &amp; Cardinality</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>users</code></td>
              <td><code>id (UUID PK), email, password_hash, google_id, display_name</code></td>
              <td>Primary user accounts for personal web app access and developer ownership. (1:N with API keys and memories).</td>
            </tr>
            <tr>
              <td><code>api_keys</code></td>
              <td><code>id (UUID PK), developer_id (FK), key_hash, app_name, last_used_at</code></td>
              <td>Stores SHA-256 hashes of developer API tokens; plaintext keys are never persisted.</td>
            </tr>
            <tr>
              <td><code>memories</code></td>
              <td><code>id (UUID PK), user_id, api_key_id (FK), content, source_url, source_type</code></td>
              <td>Stores raw, cleaned textual data captured from browser sessions, notes, or external bot logs.</td>
            </tr>
            <tr>
              <td><code>embeddings</code></td>
              <td><code>id (UUID PK), memory_id (FK), chunk_text, embedding (VECTOR(384))</code></td>
              <td>Stores segmented 300-word text chunks paired with their 384-dimensional dense vectors.</td>
            </tr>
            <tr>
              <td><code>tags</code></td>
              <td><code>id (UUID PK), memory_id (FK), tag</code></td>
              <td>Automated conceptual labels extracted from memory content for filtered faceted navigation.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>2.2.3 Functional Requirements</h3>
      <p>
        The functional requirements define the explicit operational capabilities that the Synapse platform must execute:
      </p>
      <ul>
        <li><strong>FR-01: User Authentication &amp; OAuth 2.0:</strong> The system shall provide secure user registration and login using bcrypt password hashing (salt rounds = 10) and Google OAuth 2.0 / OpenID Connect token verification.</li>
        <li><strong>FR-02: Edge Content Capture:</strong> The Chrome extension shall extract readable page content via Mozilla Readability and transmit page URL, title, and cleaned text to the backend.</li>
        <li><strong>FR-03: Context-Menu Text Selection:</strong> The system shall allow users to highlight arbitrary text on any webpage and save the selection via a right-click context menu.</li>
        <li><strong>FR-04: Quick-Note Journaling:</strong> The extension popup interface shall provide a fast markdown textarea for ad-hoc thought capture without visiting the full web portal.</li>
        <li><strong>FR-05: Deterministic Text Chunking:</strong> The backend shall segment ingested text into 300-word blocks with a 50-word sliding overlap, discarding empty strings.</li>
        <li><strong>FR-06: Local ONNX Vector Embedding:</strong> The system shall generate 384-dimensional dense float vectors on-device using <code>BAAI/bge-small-en-v1.5</code> via <code>@xenova/transformers</code>.</li>
        <li><strong>FR-07: Vector Persistence in PostgreSQL:</strong> The database shall persist dense vectors in a specialized <code>VECTOR(384)</code> column with referential cascade integrity to the parent memory.</li>
        <li><strong>FR-08: IVFFlat Vector Indexing:</strong> The database shall index vector columns using the Inverted File Flat algorithm configured with 100 cluster centroids and cosine distance operators (<code>vector_cosine_ops</code>).</li>
        <li><strong>FR-09: Approximate Nearest Neighbor (ANN) Search:</strong> The system shall compute vector cosine distance ($\Leftrightarrow$) against stored embeddings and return top-K matches ranked by similarity score.</li>
        <li><strong>FR-10: Relevance Threshold Filtering:</strong> The search engine shall discard matching chunks with a similarity score below 0.25 to prevent irrelevant context inclusion.</li>
        <li><strong>FR-11: Grounded RAG Chat Synthesis:</strong> The conversational engine shall inject retrieved memory chunks into prompt context and output answers strictly backed by cited sources.</li>
        <li><strong>FR-12: Developer API Key Generation:</strong> The portal shall generate 32-byte cryptographically secure random API keys prefixed with <code>syn_</code> and store only their SHA-256 hash.</li>
        <li><strong>FR-13: Scoped API Key Access Control:</strong> The system shall validate Bearer API tokens on incoming REST requests and enforce granular permission scopes (<code>read</code>, <code>write</code>, <code>admin</code>).</li>
        <li><strong>FR-14: Memory Management &amp; Deletion:</strong> Users shall be able to view, search, tag, edit, and cascade-delete memories and their associated embedding vectors from the dashboard.</li>
      </ul>

      <h3>2.2.4 Performance Requirements</h3>
      <p>
        The performance specifications dictate strict latency and throughput targets to guarantee a responsive user experience on consumer hardware.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 7: Performance Requirements and Benchmark Targets</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 15%;">Metric ID</th>
              <th style="width: 35%;">System Operation</th>
              <th style="width: 50%;">Empirical Target &amp; Benchmark Threshold</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>PR-01</strong></td>
              <td>DOM Parsing &amp; Extraction</td>
              <td>&lt; 80 milliseconds per webpage using Mozilla Readability.</td>
            </tr>
            <tr>
              <td><strong>PR-02</strong></td>
              <td>Sliding Window Chunking</td>
              <td>&lt; 15 milliseconds for a 5,000-word document.</td>
            </tr>
            <tr>
              <td><strong>PR-03</strong></td>
              <td>Local ONNX Tensor Inference</td>
              <td>&lt; 150 milliseconds per 300-word chunk on standard 4-core CPU.</td>
            </tr>
            <tr>
              <td><strong>PR-04</strong></td>
              <td>IVFFlat Vector Nearest Neighbor Search</td>
              <td>&lt; 50 milliseconds across 10,000 embedded chunks.</td>
            </tr>
            <tr>
              <td><strong>PR-05</strong></td>
              <td>End-to-End Search API Round-Trip</td>
              <td>&lt; 200 milliseconds from HTTP request to client JSON response.</td>
            </tr>
            <tr>
              <td><strong>PR-06</strong></td>
              <td>Concurrent API Ingestion Throughput</td>
              <td>&gt; 50 concurrent requests handled without socket exhaustion.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>2.2.5 Dependability Requirements</h3>
      <p>
        To ensure platform stability, Synapse adheres to three core dependability principles:
      </p>
      <ol>
        <li><strong>Atomic Database Transactions:</strong> Memory creation, chunk generation, and embedding vector insertion are executed within an atomic PostgreSQL transaction (<code>BEGIN ... COMMIT</code>). In the event of an embedding failure, all partial records are rolled back.</li>
        <li><strong>Graceful Browser Extension Degradation:</strong> If the local Synapse backend is offline, the Chrome extension logs a non-fatal warning without disrupting the user's normal browsing session.</li>
        <li><strong>Model Cache Persistence:</strong> Hugging Face model weights are cached locally inside the Node.js filesystem, eliminating repeated internet downloads during application restarts.</li>
      </ol>

      <h3>2.2.6 Maintainability Requirements</h3>
      <p>
        The software architecture maintains a strict separation of concerns: route definitions (<code>/src/routes</code>), business logic services (<code>/src/services</code>), database pools (<code>/src/db.js</code>), and authentication middlewares (<code>/src/middleware</code>). Consistent camelCase naming conventions and comprehensive asynchronous error handling patterns are strictly enforced.
      </p>

      <h3>2.2.7 Security Requirements</h3>
      <p>
        Security is paramount when managing personal research and intellectual capital:
      </p>
      <ul>
        <li><strong>Password Protection:</strong> Passwords are protected using bcrypt cryptographic hashing with a work factor of 10. Plaintext passwords are never stored or logged.</li>
        <li><strong>JWT Token Management:</strong> Web sessions use signed JSON Web Tokens (HMAC-SHA256) with a 7-day expiration lifespan transmitted over HTTP Bearer headers.</li>
        <li><strong>One-Way API Key Hashing:</strong> Developer API keys are hashed via SHA-256 before database insertion, preventing compromise even in the event of an unauthorized database dump.</li>
        <li><strong>Parameterized SQL Execution:</strong> All database queries utilize parameterized placeholders (e.g., <code>$1, $2</code>) via the <code>node-postgres</code> driver, completely neutralizing SQL injection risks.</li>
      </ul>

      <h3>2.2.8 Look-and-Feel Requirements</h3>
      <p>
        The user interface embraces a modern, minimalist design aesthetic featuring high-contrast typography, dark/light theme adaptability, intuitive card layouts for memory streams, and distinctive badge tags for similarity metrics.
      </p>

      <h2>2.3 Validation &amp; Acceptance Criteria</h2>
      <p>
        Validation guarantees that each documented functional requirement produces the exact expected system behavior under rigorous test scenarios.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 8: System Verification and Formal Acceptance Criteria</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 25%;">Functional Module</th>
              <th style="width: 75%;">Formal Verification &amp; Acceptance Criteria</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Account &amp; Security</strong></td>
              <td>Registration rejects duplicate emails. Valid credentials generate signed JWTs. Invalid passwords return HTTP 401.</td>
            </tr>
            <tr>
              <td><strong>Extension Clipping</strong></td>
              <td>Context menu triggers payload transmission. Mozilla Readability extracts article body without navigation noise.</td>
            </tr>
            <tr>
              <td><strong>Chunking &amp; Vectors</strong></td>
              <td>Input strings are segmented into 300-word blocks with 50-word overlap. ONNX pipeline yields exactly 384 floating-point dimensions.</td>
            </tr>
            <tr>
              <td><strong>ANN Vector Search</strong></td>
              <td>Query vector is compared via <code>&lt;=&gt;</code> operator. Chunks with similarity score &ge; 0.25 are returned in descending order.</td>
            </tr>
            <tr>
              <td><strong>Grounded RAG Engine</strong></td>
              <td>Synthesis strictly cites source URLs and titles. Answers reflect retrieved context without hallucination.</td>
            </tr>
            <tr>
              <td><strong>Developer API Gateway</strong></td>
              <td>Keys prefixed with <code>syn_</code> authenticate requests. Non-matching key hashes are rejected with HTTP 403 Forbidden.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>2.4 Expected Hurdles and Mitigations</h2>
      <p>
        During the engineering lifecycle of Synapse, several non-trivial architectural and systems challenges were encountered and successfully mitigated:
      </p>
      <ul>
        <li><strong>Local ONNX Transformer Runtime Stability:</strong> Executing multi-hundred megabyte transformer models in a Node.js process can cause memory leaks or thread deadlocks. <em>Mitigation:</em> Implemented a singleton pipeline loader pattern that lazily initializes the model once and reuses the compiled ONNX runtime across subsequent HTTP calls.</li>
        <li><strong>Database Port Collisions:</strong> Standard PostgreSQL installations on developer workstations bind to port 5432, preventing Docker containers from binding to the same port. <em>Mitigation:</em> Configured Docker Compose and database environment files to map the container's internal port 5432 to external host port 5433.</li>
        <li><strong>Vector Space Dimensionality Mismatch:</strong> Early experimental prototypes utilized 1536-dimensional OpenAI embeddings, causing schema conflicts when migrating to local 384-dimensional models. <em>Mitigation:</em> Authored an automated migration script (<code>migrate_vector_dim.ps1</code>) that modified the pgvector table schema to <code>VECTOR(384)</code> and recalculated index structures.</li>
        <li><strong>Cross-Origin Resource Sharing (CORS) from Chrome Extensions:</strong> Browser extensions sending POST requests from arbitrary web origins to <code>localhost</code> are blocked by standard web security policies. <em>Mitigation:</em> Configured Express CORS middleware with dynamic origin validation and explicit pre-flight options.</li>
      </ul>

      <h2>2.5 SDLC Model to Be Used</h2>
      <p>
        Synapse was developed using the <strong>Iterative and Incremental Software Development Life Cycle (SDLC) Model</strong>. This methodology was selected because it enables the engineering team to construct a foundational core (database schema and vector indexing), test each module thoroughly in isolation, and progressively layer additional capabilities (extension capture, RAG chat, developer API console) across discrete development increments.
      </p>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="600" height="240" viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="240" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>
            
            <!-- Increment 1 -->
            <rect x="25" y="40" width="120" height="70" rx="6" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <text x="85" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#1e3a8a">INCREMENT 1</text>
            <text x="85" y="85" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10" fill="#334155">Schema &amp; pgvector</text>
            <text x="85" y="98" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#64748b">Docker setup</text>

            <line x1="145" y1="75" x2="165" y2="75" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow)"/>

            <!-- Increment 2 -->
            <rect x="165" y="40" width="120" height="70" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
            <text x="225" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#14532d">INCREMENT 2</text>
            <text x="225" y="85" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10" fill="#334155">Local ONNX NLP</text>
            <text x="225" y="98" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#64748b">Chunker &amp; Vectors</text>

            <line x1="285" y1="75" x2="305" y2="75" stroke="#16a34a" stroke-width="2"/>

            <!-- Increment 3 -->
            <rect x="305" y="40" width="120" height="70" rx="6" fill="#fefce8" stroke="#ca8a04" stroke-width="2"/>
            <text x="365" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#713f12">INCREMENT 3</text>
            <text x="365" y="85" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10" fill="#334155">Chrome MV3</text>
            <text x="365" y="98" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#64748b">Readability Clipper</text>

            <line x1="425" y1="75" x2="445" y2="75" stroke="#ca8a04" stroke-width="2"/>

            <!-- Increment 4 -->
            <rect x="445" y="40" width="130" height="70" rx="6" fill="#fdf2f8" stroke="#db2777" stroke-width="2"/>
            <text x="510" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#831843">INCREMENT 4</text>
            <text x="510" y="85" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10" fill="#334155">RAG Chat Engine</text>
            <text x="510" y="98" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#64748b">Citation Synthesis</text>

            <!-- Bottom Cycle Arrows -->
            <path d="M 510 110 L 510 160 L 85 160 L 85 110" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5,5"/>
            <text x="300" y="185" text-anchor="middle" font-family="'Times New Roman', serif" font-style="italic" font-size="11" fill="#475569">
              Continuous Testing, Evaluation &amp; Incremental Refinement Cycle
            </text>
          </svg>
        </div>
        <div class="figure-caption">Figure 1: Iterative and Incremental Software Development Life Cycle</div>
      </div>
    </div>
    """
