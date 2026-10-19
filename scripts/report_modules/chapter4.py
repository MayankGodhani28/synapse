# -*- coding: utf-8 -*-

def get_chapter4_html():
    return """
    <div class="page-break" style="padding-top: 20px;">
      <h1 class="chapter-title">CHAPTER 4 — IMPLEMENTATION, TESTING, AND MAINTENANCE</h1>

      <h2>4.1 Introduction to Languages, IDEs, Tools and Technologies</h2>
      <p>
        The implementation phase converts the formal system specifications into an operational, containerized software environment. Synapse combines modern JavaScript runtime engines, local machine learning frameworks, and relational vector extensions into an integrated, zero-cost topology.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 12: Principal Technologies, Frameworks, and Runtime Libraries</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 25%;">Technology</th>
              <th style="width: 25%;">Version / Release</th>
              <th style="width: 50%;">Implementation Role &amp; Capabilities</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Node.js</strong></td>
              <td>v24.19.0 (LTS)</td>
              <td>High-performance asynchronous JavaScript engine hosting the Express REST API.</td>
            </tr>
            <tr>
              <td><strong>Express.js</strong></td>
              <td>4.19.2</td>
              <td>Minimalist, robust HTTP microservice framework managing endpoints and middleware.</td>
            </tr>
            <tr>
              <td><strong>PostgreSQL</strong></td>
              <td>16.2</td>
              <td>ACID-compliant relational database providing persistent multi-tenant storage.</td>
            </tr>
            <tr>
              <td><strong>pgvector</strong></td>
              <td>0.8.6</td>
              <td>PostgreSQL extension adding native <code>VECTOR</code> types and IVFFlat cosine search.</td>
            </tr>
            <tr>
              <td><strong>Transformers.js</strong></td>
              <td>2.17.2 (@xenova)</td>
              <td>Embedded Hugging Face pipeline compiling transformer models to ONNX runtime.</td>
            </tr>
            <tr>
              <td><strong>bge-small-en-v1.5</strong></td>
              <td>BAAI Release</td>
              <td>Quantized on-device transformer model generating 384-dimensional dense vectors.</td>
            </tr>
            <tr>
              <td><strong>Chrome Manifest V3</strong></td>
              <td>v3 Specification</td>
              <td>Modern Chrome extension standard using service workers and declarative content scripts.</td>
            </tr>
            <tr>
              <td><strong>Mozilla Readability</strong></td>
              <td>Standalone Build</td>
              <td>Deterministic DOM tree extractor converting messy web pages into clean article bodies.</td>
            </tr>
            <tr>
              <td><strong>Docker &amp; Compose</strong></td>
              <td>v26 / v2.27</td>
              <td>Containerizes PostgreSQL and pgvector on isolated bridge networks and host port 5433.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4.2 Coding Standards of Language Used</h2>
      <p>
        Synapse enforces rigorous software engineering practices across frontend and backend modules to guarantee code readability, maintainability, and security:
      </p>
      <ul>
        <li><strong>Strict Async/Await and Non-Blocking I/O:</strong> All disk, network, and database operations utilize native Promises and <code>async/await</code> syntax. Synchronous blocking calls are forbidden in server routes.</li>
        <li><strong>Atomic Transactions for Ingestion:</strong> Ingesting memories and inserting chunk vectors is wrapped in transactional blocks (<code>BEGIN ... COMMIT / ROLLBACK</code>) to prevent orphaned vectors.</li>
        <li><strong>Centralized Error Handling:</strong> Express routes delegate uncaught exceptions to a standardized error handler middleware that logs diagnostic stack traces while shielding client responses.</li>
        <li><strong>Defensive Type and Payload Sanitization:</strong> Inbound JSON payloads are strictly validated before passing to chunking or database services.</li>
      </ul>

      <h2>4.3 Project Scheduling Using Gantt Chart and PERT</h2>
      <p>
        The development lifecycle was planned over a twenty-week timeline structured across discrete engineering milestones.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 13: Proposed Twenty-Week Development Schedule</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 10%;">Phase</th>
              <th style="width: 45%;">Project Milestone &amp; Major Activity</th>
              <th style="width: 25%;">Planned Duration</th>
              <th style="width: 20%;">Schedule Weeks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Requirement Analysis, Literature Survey &amp; Feasibility Study</td>
              <td>2 Weeks</td>
              <td>Weeks 1 – 2</td>
            </tr>
            <tr>
              <td>2</td>
              <td>System Architecture, Vector DB Schema &amp; Docker Setup</td>
              <td>2 Weeks</td>
              <td>Weeks 3 – 4</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Local ONNX Transformer Pipeline &amp; Chunking Engine</td>
              <td>3 Weeks</td>
              <td>Weeks 5 – 7</td>
            </tr>
            <tr>
              <td>4</td>
              <td>Chrome Manifest V3 Extension &amp; DOM Readability Clipper</td>
              <td>3 Weeks</td>
              <td>Weeks 8 – 10</td>
            </tr>
            <tr>
              <td>5</td>
              <td>Express REST Gateway &amp; Web Dashboard UI Development</td>
              <td>3 Weeks</td>
              <td>Weeks 11 – 13</td>
            </tr>
            <tr>
              <td>6</td>
              <td>Grounded RAG Chat Engine &amp; Developer Console</td>
              <td>3 Weeks</td>
              <td>Weeks 14 – 16</td>
            </tr>
            <tr>
              <td>7</td>
              <td>Comprehensive Integration, Security &amp; Stress Testing</td>
              <td>2 Weeks</td>
              <td>Weeks 17 – 18</td>
            </tr>
            <tr>
              <td>8</td>
              <td>Final Documentation, Report Writing &amp; Submission Review</td>
              <td>2 Weeks</td>
              <td>Weeks 19 – 20</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="600" height="230" viewBox="0 0 600 230" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="230" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>
            
            <!-- Axis lines -->
            <line x1="160" y1="20" x2="160" y2="200" stroke="#94a3b8" stroke-width="1"/>
            <line x1="160" y1="200" x2="580" y2="200" stroke="#94a3b8" stroke-width="1"/>

            <!-- Week numbers -->
            <text x="180" y="215" font-family="'Times New Roman', serif" font-size="9">W2</text>
            <text x="230" y="215" font-family="'Times New Roman', serif" font-size="9">W5</text>
            <text x="280" y="215" font-family="'Times New Roman', serif" font-size="9">W8</text>
            <text x="340" y="215" font-family="'Times New Roman', serif" font-size="9">W11</text>
            <text x="400" y="215" font-family="'Times New Roman', serif" font-size="9">W14</text>
            <text x="460" y="215" font-family="'Times New Roman', serif" font-size="9">W17</text>
            <text x="520" y="215" font-family="'Times New Roman', serif" font-size="9">W20</text>

            <!-- Bars -->
            <text x="20" y="38" font-family="'Times New Roman', serif" font-size="9">1. Requirements</text>
            <rect x="160" y="28" width="40" height="14" rx="3" fill="#3b82f6"/>

            <text x="20" y="58" font-family="'Times New Roman', serif" font-size="9">2. DB &amp; pgvector</text>
            <rect x="200" y="48" width="40" height="14" rx="3" fill="#3b82f6"/>

            <text x="20" y="78" font-family="'Times New Roman', serif" font-size="9">3. ONNX Embedding</text>
            <rect x="240" y="68" width="60" height="14" rx="3" fill="#10b981"/>

            <text x="20" y="98" font-family="'Times New Roman', serif" font-size="9">4. Chrome Extension</text>
            <rect x="300" y="88" width="60" height="14" rx="3" fill="#10b981"/>

            <text x="20" y="118" font-family="'Times New Roman', serif" font-size="9">5. Web Dashboard</text>
            <rect x="360" y="108" width="60" height="14" rx="3" fill="#f59e0b"/>

            <text x="20" y="138" font-family="'Times New Roman', serif" font-size="9">6. RAG &amp; Dev API</text>
            <rect x="420" y="128" width="60" height="14" rx="3" fill="#f59e0b"/>

            <text x="20" y="158" font-family="'Times New Roman', serif" font-size="9">7. Testing &amp; Security</text>
            <rect x="480" y="148" width="40" height="14" rx="3" fill="#ec4899"/>

            <text x="20" y="178" font-family="'Times New Roman', serif" font-size="9">8. Documentation</text>
            <rect x="520" y="168" width="40" height="14" rx="3" fill="#8b5cf6"/>
          </svg>
        </div>
        <div class="figure-caption">Figure 11: Gantt Chart for the 20-Week Project Development Schedule</div>
      </div>

      <h3>4.3.4 Program Evaluation and Review Technique (PERT)</h3>
      <p>
        To model stochastic variation during implementation, PERT analysis was applied using three duration estimates: Optimistic time ($O$), Most likely time ($M$), and Pessimistic time ($P$). The expected activity duration ($T_E$) is derived via:
      </p>
      <div style="text-align: center; margin: 12px 0; font-size: 13pt; font-weight: bold;">
        $$T_E = \\frac{O + 4M + P}{6}$$
      </div>

      <div class="table-container">
        <div class="table-caption">Table 14: Program Evaluation and Review Technique (PERT) Duration Estimates</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 10%;">ID</th>
              <th style="width: 40%;">Task Activity</th>
              <th style="width: 12%;">O (Days)</th>
              <th style="width: 12%;">M (Days)</th>
              <th style="width: 12%;">P (Days)</th>
              <th style="width: 14%;">TE (Days)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>A</td><td>Requirement Analysis &amp; Literature Review</td><td>5</td><td>8</td><td>14</td><td>8.50</td></tr>
            <tr><td>B</td><td>pgvector Schema &amp; Docker Orchestration</td><td>4</td><td>7</td><td>12</td><td>7.33</td></tr>
            <tr><td>C</td><td>Local ONNX Model Compilation &amp; Chunking</td><td>8</td><td>14</td><td>22</td><td>14.33</td></tr>
            <tr><td>D</td><td>Manifest V3 Chrome Extension Development</td><td>7</td><td>12</td><td>20</td><td>12.50</td></tr>
            <tr><td>E</td><td>Express REST Ingestion &amp; Search API</td><td>6</td><td>10</td><td>16</td><td>10.33</td></tr>
            <tr><td>F</td><td>Grounded RAG Chat Engine &amp; Citations</td><td>7</td><td>12</td><td>18</td><td>12.17</td></tr>
            <tr><td>G</td><td>Developer Console &amp; Key Management</td><td>4</td><td>6</td><td>10</td><td>6.33</td></tr>
            <tr><td>H</td><td>Full Integration, Stress &amp; Security Testing</td><td>5</td><td>9</td><td>15</td><td>9.33</td></tr>
            <tr><td>I</td><td>Final Project Report &amp; Viva Preparation</td><td>4</td><td>7</td><td>11</td><td>7.17</td></tr>
          </tbody>
        </table>
      </div>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="600" height="150" viewBox="0 0 600 150" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="150" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>
            
            <!-- Nodes -->
            <circle cx="50" cy="75" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <text x="50" y="80" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">1</text>

            <circle cx="150" cy="75" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <text x="150" y="80" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">2</text>

            <circle cx="270" cy="40" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <text x="270" y="45" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">3</text>

            <circle cx="270" cy="110" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <text x="270" y="115" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">4</text>

            <circle cx="400" cy="75" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <text x="400" y="80" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">5</text>

            <circle cx="530" cy="75" r="20" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <text x="530" y="80" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">6</text>

            <!-- Arrows -->
            <line x1="70" y1="75" x2="130" y2="75" stroke="#dc2626" stroke-width="2.5"/>
            <text x="100" y="70" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="bold">A (8.5d)</text>

            <line x1="168" y1="65" x2="252" y2="45" stroke="#dc2626" stroke-width="2.5"/>
            <text x="205" y="45" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="bold">C (14.3d)</text>

            <line x1="168" y1="85" x2="252" y2="105" stroke="#64748b" stroke-width="1.5"/>
            <text x="205" y="105" text-anchor="middle" font-size="9" fill="#475569">B (7.3d)</text>

            <line x1="288" y1="45" x2="382" y2="65" stroke="#dc2626" stroke-width="2.5"/>
            <text x="340" y="45" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="bold">E (10.3d)</text>

            <line x1="288" y1="105" x2="382" y2="85" stroke="#64748b" stroke-width="1.5"/>
            <text x="340" y="105" text-anchor="middle" font-size="9" fill="#475569">D (12.5d)</text>

            <line x1="420" y1="75" x2="510" y2="75" stroke="#dc2626" stroke-width="2.5"/>
            <text x="465" y="70" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="bold">H+I (16.5d)</text>

            <text x="300" y="140" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10" font-weight="bold" fill="#dc2626">
              Critical Path: 1 &rarr; 2 &rarr; 3 &rarr; 5 &rarr; 6 (Total Duration: ~49.6 Days)
            </text>
          </svg>
        </div>
        <div class="figure-caption">Figure 12: PERT Network Activity Diagram &amp; Critical Path</div>
      </div>

      <h2>4.4 Testing Techniques and Test Plans</h2>
      <p>
        The verification suite spans unit validation of isolated mathematical routines, end-to-end integration across Docker network boundaries, and penetration testing against API authentication vectors.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 16: Functional, Integration, and Security Test Cases (TC-01 to TC-22)</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 10%;">Test ID</th>
              <th style="width: 25%;">Target Component</th>
              <th style="width: 35%;">Test Condition &amp; Execution Step</th>
              <th style="width: 30%;">Expected &amp; Verified Outcome</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>TC-01</td><td>Auth Service</td><td>Register account with novel email and valid password.</td><td>Password hashed with bcrypt; user created in DB.</td></tr>
            <tr><td>TC-02</td><td>Auth Service</td><td>Attempt duplicate registration with existing email.</td><td>HTTP 409 Conflict with clear error message.</td></tr>
            <tr><td>TC-03</td><td>Auth Service</td><td>Authenticate with incorrect password.</td><td>HTTP 401 Unauthorized; token withheld.</td></tr>
            <tr><td>TC-04</td><td>Extension Clipper</td><td>Click "Save page to Synapse" on standard blog post.</td><td>Mozilla Readability extracts text; payload POSTed.</td></tr>
            <tr><td>TC-05</td><td>Extension Clipper</td><td>Select paragraph &rarr; context menu "Save selection".</td><td>Selective text saved with source URL attached.</td></tr>
            <tr><td>TC-06</td><td>Chunking Service</td><td>Submit a 2,500-word text document to chunker.</td><td>Decomposed into 300-word chunks with 50-word overlap.</td></tr>
            <tr><td>TC-07</td><td>ONNX Pipeline</td><td>Generate embedding for a single text chunk.</td><td>Returns float array of exactly 384 dimensions.</td></tr>
            <tr><td>TC-08</td><td>DB Persistence</td><td>Verify PostgreSQL vector storage in Docker.</td><td>Vector correctly stored in <code>VECTOR(384)</code> column.</td></tr>
            <tr><td>TC-09</td><td>IVFFlat Index</td><td>Execute Approximate Nearest Neighbor search via SQL.</td><td>Cosine distance <code>&lt;=&gt;</code> returns ranked matches.</td></tr>
            <tr><td>TC-10</td><td>Search Gateway</td><td>Query API with concept string "machine learning".</td><td>Returns top-K matching memories in &lt; 200ms.</td></tr>
            <tr><td>TC-11</td><td>Relevance Filter</td><td>Simulate query with zero relevant memories in DB.</td><td>Cosine similarity &lt; 0.25; returns empty array gracefully.</td></tr>
            <tr><td>TC-12</td><td>RAG Chat Engine</td><td>Query conversational RAG with research question.</td><td>Generates answer citing explicit source URLs.</td></tr>
            <tr><td>TC-13</td><td>Developer Console</td><td>Generate new 32-byte API Key.</td><td>Returns <code>syn_...</code> key; stores SHA-256 in DB.</td></tr>
            <tr><td>TC-14</td><td>API Gateway</td><td>Access <code>/memory/search</code> with valid API Key.</td><td>Authorizes request and scopes results to owner.</td></tr>
            <tr><td>TC-15</td><td>API Gateway</td><td>Access <code>/memory/search</code> with invalid API Key.</td><td>HTTP 403 Forbidden with security audit log.</td></tr>
            <tr><td>TC-16</td><td>Tagging Engine</td><td>Retrieve tags associated with ingested memory.</td><td>Tags accurately categorize topic (e.g., #docker).</td></tr>
            <tr><td>TC-17</td><td>Memory Deletion</td><td>Delete a memory via dashboard DELETE endpoint.</td><td>Memory, chunks, embeddings, and tags cascade delete.</td></tr>
            <tr><td>TC-18</td><td>Database Port</td><td>Verify external connection on port 5433.</td><td>Connection succeeds without host port collision.</td></tr>
            <tr><td>TC-19</td><td>SQL Injection</td><td>Submit malicious SQL injection in query parameter.</td><td>Parameterized query neutralizes payload completely.</td></tr>
            <tr><td>TC-20</td><td>CORS Preflight</td><td>Send OPTIONS request from Chrome extension origin.</td><td>Returns appropriate CORS headers with status 204.</td></tr>
            <tr><td>TC-21</td><td>Model Reloading</td><td>Trigger repeated embedding requests consecutively.</td><td>Singleton loader reuses cached model weights.</td></tr>
            <tr><td>TC-22</td><td>Demo Bot Client</td><td>Connect standalone chatbot client on port 3001.</td><td>Handshake succeeds; retrieves grounded responses.</td></tr>
          </tbody>
        </table>
      </div>

      <h3>4.4.7 Testing the Vector Cosine Similarity Algorithm</h3>
      <p>
        Semantic search operates by computing the cosine of the angle between high-dimensional vector representations. Given query embedding vector $\\mathbf{A}$ and document chunk vector $\\mathbf{B}$:
      </p>
      <div style="text-align: center; margin: 14px 0; font-size: 13pt; font-weight: bold;">
        $$\\text{Cosine Similarity} = \\cos(\\theta) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|} = \\frac{\\sum_{i=1}^{384} A_i B_i}{\\sqrt{\\sum_{i=1}^{384} A_i^2} \\sqrt{\\sum_{i=1}^{384} B_i^2}}$$
      </div>
      <p>
        In pgvector, the cosine distance operator <code>&lt;=&gt;</code> calculates $1 - \\cos(\\theta)$. Therefore, identical vectors yield a distance of 0.0, orthogonal vectors yield 1.0, and diametrically opposite vectors yield 2.0.
      </p>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="450" height="200" viewBox="0 0 450 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="450" height="200" fill="#ffffff" rx="6"/>
            <!-- Vector Diagram -->
            <line x1="100" y1="160" x2="350" y2="160" stroke="#334155" stroke-width="2"/>
            <line x1="100" y1="160" x2="100" y2="20" stroke="#334155" stroke-width="2"/>

            <!-- Vector A -->
            <line x1="100" y1="160" x2="280" y2="50" stroke="#2563eb" stroke-width="3"/>
            <text x="290" y="50" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#2563eb">Query Vector A</text>

            <!-- Vector B -->
            <line x1="100" y1="160" x2="320" y2="90" stroke="#10b981" stroke-width="3"/>
            <text x="330" y="95" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#10b981">Chunk Vector B</text>

            <!-- Angle arc -->
            <path d="M 170 160 A 70 70 0 0 0 160 120" fill="none" stroke="#f59e0b" stroke-width="2"/>
            <text x="180" y="130" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#f59e0b">&theta;</text>

            <text x="250" y="185" text-anchor="middle" font-family="'Times New Roman', serif" font-style="italic" font-size="11">
              Cosine Similarity Score = cos(&theta;) &isin; [-1.0, 1.0]
            </text>
          </svg>
        </div>
        <div class="figure-caption">Figure 13: Cosine Distance Mathematical Function and Angle Distribution</div>
      </div>

      <h2>4.5 Maintenance of the System</h2>
      <p>
        A structured maintenance regime ensures ongoing system stability across four recognized disciplines:
      </p>
      <ol>
        <li><strong>Corrective Maintenance:</strong> Resolving identified edge-case bugs, such as port conflicts during simultaneous local PostgreSQL installations or malformed UTF-8 characters during web clipping.</li>
        <li><strong>Adaptive Maintenance:</strong> Upgrading dependencies to support newer Chrome Manifest V3 service worker lifecycles, newer ONNX runtime optimizations, and PostgreSQL minor security releases.</li>
        <li><strong>Perfective Maintenance:</strong> Improving vector search index recall by fine-tuning IVFFlat clustering centroids (<code>lists = 100</code>) as knowledge corpus size expands past 10,000 documents.</li>
        <li><strong>Preventive Maintenance:</strong> Automated database vacuuming (<code>VACUUM ANALYZE embeddings;</code>) and local cache purges to maintain peak retrieval performance.</li>
      </ol>
    </div>
    """
