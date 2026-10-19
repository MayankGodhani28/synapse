# -*- coding: utf-8 -*-

def get_chapter3_html():
    return r"""
    <div class="page-break" style="padding-top: 20px;">
      <h1 class="chapter-title">CHAPTER 3 — SYSTEM DESIGN</h1>

      <h2>3.1 Design Approach (Function-Oriented or Object-Oriented)</h2>
      <p>
        The architectural design of Synapse employs a hybrid approach, seamlessly integrating <strong>Object-Oriented Design (OOD)</strong> principles for encapsulating core persistent entities and stateful services, with <strong>Function-Oriented / Pipeline-Oriented</strong> design for data stream processing and tensor transformations.
      </p>
      <p>
        Entity representations such as <code>User</code>, <code>Memory</code>, <code>Embedding</code>, and <code>ApiKey</code> are modeled as cohesive domain models adhering to object-oriented encapsulation and inheritance paradigms. Conversely, the content extraction, text sanitization, sliding-window chunking, and tensor normalization routines are implemented as deterministic, pure functional pipelines. This separation ensures that mathematical transformations remain stateless and trivially parallelizable, while domain data integrity is protected through robust database constraints.
      </p>

      <h3>3.1.1 Objectives of the Design Approach</h3>
      <p>The system design satisfies seven fundamental architectural objectives:</p>
      <ol>
        <li><strong>Strict Layered Decoupling:</strong> The edge capture client, REST gateway, transformer inference pipeline, and relational vector store are decoupled through well-defined network and programmatic interfaces.</li>
        <li><strong>High Cohesion &amp; Low Coupling:</strong> Each module encapsulates a singular responsibility, preventing cross-domain side-effects.</li>
        <li><strong>Zero-Cloud Dependency:</strong> All dependencies (NLP libraries, models, databases) operate entirely within the local host boundary.</li>
        <li><strong>Deterministic Pipeline Execution:</strong> Identical input text guaranteed to yield identical chunk boundaries and identical 384-dimensional dense vectors.</li>
        <li><strong>Stateless Service Scaling:</strong> The application backend retains no session state in memory; all persistent states reside in PostgreSQL.</li>
        <li><strong>Sub-Millisecond Index Traversals:</strong> Inverted File Flat (IVFFlat) structures permit fast Approximate Nearest Neighbor searches over high-dimensional vector spaces.</li>
        <li><strong>Cryptographic Security:</strong> Plaintext tokens and secrets are isolated from persistence engines through one-way hashing.</li>
      </ol>

      <h3>3.1.2 Major Modules of the System</h3>
      <p>The platform is organized into six functional modules detailed in Table 9.</p>

      <div class="table-container">
        <div class="table-caption">Table 9: Major Functional Modules of the Synapse Platform</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 25%;">Module Name</th>
              <th style="width: 75%;">Principal Responsibilities &amp; Capabilities</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Edge Capture Extension</strong></td>
              <td>DOM tree parsing via Mozilla Readability, context menu text clipping, popup quick journaling, and background message dispatching.</td>
            </tr>
            <tr>
              <td><strong>Authentication &amp; User Gate</strong></td>
              <td>User registration, bcrypt password hashing, Google OAuth 2.0 / OpenID Connect token verification, and JWT session generation.</td>
            </tr>
            <tr>
              <td><strong>Text Preprocessing &amp; Chunking</strong></td>
              <td>Whitespace normalization, markdown stripping, and 300-word sliding window chunking with 50-word context preservation overlap.</td>
            </tr>
            <tr>
              <td><strong>Local ONNX Inference Engine</strong></td>
              <td>Runs <code>BAAI/bge-small-en-v1.5</code> inside ONNX runtime to produce normalized $\mathbb{R}^{384}$ dense mathematical vector representations.</td>
            </tr>
            <tr>
              <td><strong>pgvector Persistence &amp; Search</strong></td>
              <td>Executes IVFFlat-indexed cosine similarity searches (<code>&lt;=&gt;</code>) in PostgreSQL 16 with threshold filtering (&ge; 0.25).</td>
            </tr>
            <tr>
              <td><strong>Developer Console &amp; RAG API</strong></td>
              <td>SHA-256 API key issuance, rate limiting, and grounded question-answering with automated source URL and paragraph citations.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3.2 Detail Design</h2>
      <p>
        The detailed design delineates the multi-tiered architecture and pipeline execution flow that governs data movement across Synapse.
      </p>

      <h3>3.2.1 System Architecture</h3>
      <p>
        Synapse is structured as a three-tiered distributed system comprising: (1) <strong>The Edge Client Layer</strong>, (2) <strong>The Application &amp; Inference Engine Layer</strong>, and (3) <strong>The Relational Vector Storage Layer</strong>.
      </p>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="620" height="340" viewBox="0 0 620 340" xmlns="http://www.w3.org/2000/svg">
            <rect width="620" height="340" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>
            
            <!-- Layer 1: Edge -->
            <rect x="20" y="25" width="160" height="290" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
            <text x="100" y="50" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#1e3a8a">EDGE CLIENT LAYER</text>
            
            <rect x="35" y="70" width="130" height="45" rx="4" fill="#ffffff" stroke="#93c5fd" stroke-width="1"/>
            <text x="100" y="90" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#1e40af">Chrome MV3 Ext.</text>
            <text x="100" y="105" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#475569">Popup &amp; Background</text>

            <rect x="35" y="130" width="130" height="45" rx="4" fill="#ffffff" stroke="#93c5fd" stroke-width="1"/>
            <text x="100" y="150" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#1e40af">Mozilla Readability</text>
            <text x="100" y="165" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#475569">DOM Content Parser</text>

            <rect x="35" y="190" width="130" height="45" rx="4" fill="#ffffff" stroke="#93c5fd" stroke-width="1"/>
            <text x="100" y="210" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#1e40af">Web Dashboard UI</text>
            <text x="100" y="225" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#475569">Search, Chat, Keys</text>

            <rect x="35" y="250" width="130" height="45" rx="4" fill="#ffffff" stroke="#93c5fd" stroke-width="1"/>
            <text x="100" y="270" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#1e40af">External Chatbot</text>
            <text x="100" y="285" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#475569">Port 3001 Client</text>

            <!-- Arrows to Layer 2 -->
            <line x1="180" y1="92" x2="225" y2="92" stroke="#2563eb" stroke-width="2"/>
            <line x1="180" y1="212" x2="225" y2="212" stroke="#2563eb" stroke-width="2"/>
            <line x1="180" y1="272" x2="225" y2="272" stroke="#2563eb" stroke-width="2"/>

            <!-- Layer 2: Backend -->
            <rect x="225" y="25" width="200" height="290" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
            <text x="325" y="50" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#14532d">APPLICATION / INFERENCE</text>

            <rect x="240" y="70" width="170" height="45" rx="4" fill="#ffffff" stroke="#86efac" stroke-width="1"/>
            <text x="325" y="90" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#15803d">Express REST Gateway</text>
            <text x="325" y="105" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#475569">Port 5000 / JWT Auth</text>

            <rect x="240" y="130" width="170" height="45" rx="4" fill="#ffffff" stroke="#86efac" stroke-width="1"/>
            <text x="325" y="150" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#15803d">Sliding Chunker Service</text>
            <text x="325" y="165" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#475569">300w Chunk / 50w Overlap</text>

            <rect x="240" y="190" width="170" height="45" rx="4" fill="#ffffff" stroke="#86efac" stroke-width="1"/>
            <text x="325" y="210" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#15803d">Local ONNX Runtime</text>
            <text x="325" y="225" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#475569">BAAI/bge-small-en-v1.5</text>

            <rect x="240" y="250" width="170" height="45" rx="4" fill="#ffffff" stroke="#86efac" stroke-width="1"/>
            <text x="325" y="270" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#15803d">RAG Synthesis Engine</text>
            <text x="325" y="285" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#475569">Citation Context Generator</text>

            <!-- Arrows to Layer 3 -->
            <line x1="425" y1="152" x2="465" y2="152" stroke="#16a34a" stroke-width="2"/>
            <line x1="425" y1="212" x2="465" y2="212" stroke="#16a34a" stroke-width="2"/>

            <!-- Layer 3: Persistence -->
            <rect x="465" y="25" width="135" height="290" rx="6" fill="#fefce8" stroke="#ca8a04" stroke-width="2"/>
            <text x="532" y="50" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11" fill="#713f12">STORAGE LAYER</text>

            <rect x="475" y="70" width="115" height="50" rx="4" fill="#ffffff" stroke="#fde047" stroke-width="1"/>
            <text x="532" y="90" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#854d0e">PostgreSQL 16</text>
            <text x="532" y="105" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8" fill="#475569">Docker Port 5433</text>

            <rect x="475" y="140" width="115" height="60" rx="4" fill="#ffffff" stroke="#fde047" stroke-width="1"/>
            <text x="532" y="160" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10" fill="#854d0e">pgvector</text>
            <text x="532" y="175" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8" fill="#475569">IVFFlat Index</text>
            <text x="532" y="190" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8" fill="#475569">Cosine (&lt;=&gt;)</text>

            <rect x="475" y="220" width="115" height="75" rx="4" fill="#ffffff" stroke="#fde047" stroke-width="1"/>
            <text x="532" y="240" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="9" fill="#854d0e">Relational Tables</text>
            <text x="532" y="255" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8" fill="#475569">users, memories,</text>
            <text x="532" y="270" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8" fill="#475569">embeddings, tags,</text>
            <text x="532" y="285" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8" fill="#475569">api_keys</text>
          </svg>
        </div>
        <div class="figure-caption">Figure 2: System Architecture of the Synapse AI Memory Layer</div>
      </div>

      <div class="table-container">
        <div class="table-caption">Table 10: Inter-Module Data and Event Interaction Matrix</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 28%;">Workflow</th>
              <th style="width: 32%;">Modules Engaged</th>
              <th style="width: 40%;">Data Transformation &amp; Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Web Content Capture</strong></td>
              <td>Chrome Extension, Ingestion API</td>
              <td>DOM parsing extracts clean markdown and sends HTTP POST to <code>/memory/add</code>.</td>
            </tr>
            <tr>
              <td><strong>Segmentation &amp; Vectors</strong></td>
              <td>Chunking Service, ONNX Pipeline</td>
              <td>Text broken into 300-word blocks; ONNX computes 384-dimensional dense float arrays.</td>
            </tr>
            <tr>
              <td><strong>Relational Ingestion</strong></td>
              <td>Database Pool, pgvector</td>
              <td>Inserts memory record, inserts chunk vectors, and updates IVFFlat index lists.</td>
            </tr>
            <tr>
              <td><strong>Semantic Search</strong></td>
              <td>Query Chunker, ONNX, pgvector</td>
              <td>Embeds search query; executes cosine distance matching <code>&lt;=&gt;</code> in SQL.</td>
            </tr>
            <tr>
              <td><strong>Grounded RAG Answer</strong></td>
              <td>RAG Engine, Search Service</td>
              <td>Filters matches by threshold &ge; 0.25; generates response with explicit URL citations.</td>
            </tr>
            <tr>
              <td><strong>Developer Bot Query</strong></td>
              <td>API Gateway, Memory Store</td>
              <td>Validates <code>Bearer syn_...</code> hash; scopes memory retrieval to authorized developer.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3.3 System Design Using Structured Analysis and Design Tools</h2>
      <p>
        Structured modeling tools provide formal representations of actors, data flow, processes, and structural dependencies across the Synapse ecosystem.
      </p>

      <h3>3.3.1 Use Case Modeling</h3>
      <p>
        Synapse supports three primary actor profiles: the <strong>End User / Researcher</strong>, the <strong>Third-Party Application / Bot Developer</strong>, and the <strong>System Administrator</strong>.
      </p>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="500" height="180" viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg">
            <rect width="500" height="180" fill="#ffffff" rx="6"/>
            <!-- User -->
            <circle cx="250" cy="35" r="14" fill="#3b82f6"/>
            <line x1="250" y1="49" x2="250" y2="85" stroke="#3b82f6" stroke-width="3"/>
            <line x1="230" y1="65" x2="270" y2="65" stroke="#3b82f6" stroke-width="3"/>
            <line x1="250" y1="85" x2="235" y2="115" stroke="#3b82f6" stroke-width="3"/>
            <line x1="250" y1="85" x2="265" y2="115" stroke="#3b82f6" stroke-width="3"/>
            <text x="250" y="135" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12">Authenticated User</text>

            <!-- Left Child: Researcher -->
            <line x1="220" y1="90" x2="120" y2="135" stroke="#64748b" stroke-width="2"/>
            <circle cx="100" cy="145" r="10" fill="#10b981"/>
            <text x="100" y="170" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10">Web Researcher / Student</text>

            <!-- Right Child: Bot Developer -->
            <line x1="280" y1="90" x2="380" y2="135" stroke="#64748b" stroke-width="2"/>
            <circle cx="400" cy="145" r="10" fill="#f59e0b"/>
            <text x="400" y="170" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10">API Developer / Chatbot</text>
          </svg>
        </div>
        <div class="figure-caption">Figure 3: Use Case Diagram Generalization &amp; Actor Hierarchy</div>
      </div>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="600" height="340" viewBox="0 0 600 340" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="340" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>
            
            <!-- Actor Left -->
            <circle cx="60" cy="120" r="16" fill="#3b82f6"/>
            <line x1="60" y1="136" x2="60" y2="175" stroke="#3b82f6" stroke-width="3"/>
            <line x1="40" y1="150" x2="80" y2="150" stroke="#3b82f6" stroke-width="3"/>
            <line x1="60" y1="175" x2="45" y2="210" stroke="#3b82f6" stroke-width="3"/>
            <line x1="60" y1="175" x2="75" y2="210" stroke="#3b82f6" stroke-width="3"/>
            <text x="60" y="235" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12">User / Researcher</text>

            <!-- System Boundary -->
            <rect x="140" y="20" width="320" height="300" rx="6" fill="#ffffff" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="300" y="42" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12" fill="#334155">Synapse AI Memory System Boundary</text>

            <!-- Use cases -->
            <ellipse cx="300" cy="70" rx="95" ry="18" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="300" y="74" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10">Clip Webpage via Extension</text>

            <ellipse cx="300" cy="115" rx="95" ry="18" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="300" y="119" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10">Save Text Selection Context</text>

            <ellipse cx="300" cy="160" rx="95" ry="18" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="300" y="164" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10">Search Memories Semantically</text>

            <ellipse cx="300" cy="205" rx="95" ry="18" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="300" y="209" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10">Query Grounded RAG Chat</text>

            <ellipse cx="300" cy="250" rx="95" ry="18" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="300" y="254" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10">Manage Developer API Keys</text>

            <ellipse cx="300" cy="295" rx="95" ry="18" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="300" y="299" text-anchor="middle" font-family="'Times New Roman', serif" font-size="10">Delete / Filter Knowledge Nodes</text>

            <!-- Lines from Left Actor -->
            <line x1="85" y1="140" x2="205" y2="70" stroke="#64748b" stroke-width="1.5"/>
            <line x1="85" y1="150" x2="205" y2="115" stroke="#64748b" stroke-width="1.5"/>
            <line x1="85" y1="160" x2="205" y2="160" stroke="#64748b" stroke-width="1.5"/>
            <line x1="85" y1="170" x2="205" y2="205" stroke="#64748b" stroke-width="1.5"/>
            <line x1="85" y1="180" x2="205" y2="250" stroke="#64748b" stroke-width="1.5"/>
            <line x1="85" y1="190" x2="205" y2="295" stroke="#64748b" stroke-width="1.5"/>

            <!-- Actor Right -->
            <circle cx="535" cy="180" r="16" fill="#f59e0b"/>
            <line x1="535" y1="196" x2="535" y2="235" stroke="#f59e0b" stroke-width="3"/>
            <line x1="515" y1="210" x2="555" y2="210" stroke="#f59e0b" stroke-width="3"/>
            <line x1="535" y1="235" x2="520" y2="270" stroke="#f59e0b" stroke-width="3"/>
            <line x1="535" y1="235" x2="550" y2="270" stroke="#f59e0b" stroke-width="3"/>
            <text x="535" y="295" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="12">External Bot / App</text>

            <line x1="510" y1="205" x2="395" y2="205" stroke="#64748b" stroke-width="1.5"/>
            <line x1="510" y1="215" x2="395" y2="250" stroke="#64748b" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="figure-caption">Figure 4: Detailed Use Case Diagram of Synapse Core Ecosystem</div>
      </div>

      <h3>3.3.2 Data Flow Modeling</h3>
      <p>
        The Data Flow Diagram (DFD) maps the functional flow of textual information from external actors, across system transforms, to internal persistence stores.
      </p>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="580" height="200" viewBox="0 0 580 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="580" height="200" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>
            
            <!-- External Entity: User -->
            <rect x="25" y="70" width="100" height="60" rx="4" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
            <text x="75" y="98" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">User Browser</text>
            <text x="75" y="114" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#64748b">(Extension Client)</text>

            <!-- Arrow 1 -->
            <line x1="125" y1="90" x2="215" y2="90" stroke="#2563eb" stroke-width="2"/>
            <text x="170" y="82" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8">Web Payload / Queries</text>

            <line x1="215" y1="110" x2="125" y2="110" stroke="#2563eb" stroke-width="2"/>
            <text x="170" y="125" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8">RAG Citations / Matches</text>

            <!-- Central Process: 0.0 -->
            <circle cx="280" cy="100" r="65" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
            <text x="280" y="85" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">0.0</text>
            <text x="280" y="103" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">Synapse Memory</text>
            <text x="280" y="118" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10">System</text>

            <!-- Arrow 2 -->
            <line x1="345" y1="90" x2="435" y2="90" stroke="#ca8a04" stroke-width="2"/>
            <text x="390" y="82" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8">Vector Records</text>

            <line x1="435" y1="110" x2="345" y2="110" stroke="#ca8a04" stroke-width="2"/>
            <text x="390" y="125" text-anchor="middle" font-family="'Times New Roman', serif" font-size="8">Cosine Nearest Chunks</text>

            <!-- Data Store -->
            <rect x="435" y="70" width="120" height="60" rx="4" fill="#fefce8" stroke="#ca8a04" stroke-width="2"/>
            <text x="495" y="98" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">D1: PostgreSQL</text>
            <text x="495" y="114" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9" fill="#64748b">pgvector 16</text>
          </svg>
        </div>
        <div class="figure-caption">Figure 5: Data Flow Diagram (DFD) Level 0 — Context Level Diagram</div>
      </div>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="600" height="290" viewBox="0 0 600 290" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="290" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>
            
            <!-- Process 1.0 -->
            <circle cx="80" cy="70" r="40" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
            <text x="80" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10">1.0</text>
            <text x="80" y="78" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Capture &amp;</text>
            <text x="80" y="90" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Auth Check</text>

            <!-- Process 2.0 -->
            <circle cx="230" cy="70" r="40" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
            <text x="230" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10">2.0</text>
            <text x="230" y="78" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Sliding</text>
            <text x="230" y="90" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Chunking</text>

            <!-- Process 3.0 -->
            <circle cx="380" cy="70" r="40" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
            <text x="380" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10">3.0</text>
            <text x="380" y="78" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">ONNX Tensor</text>
            <text x="380" y="90" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Embedding</text>

            <!-- Process 4.0 -->
            <circle cx="530" cy="70" r="40" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
            <text x="530" y="65" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10">4.0</text>
            <text x="530" y="78" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">IVFFlat</text>
            <text x="530" y="90" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Storage</text>

            <line x1="120" y1="70" x2="190" y2="70" stroke="#64748b" stroke-width="1.5"/>
            <line x1="270" y1="70" x2="340" y2="70" stroke="#64748b" stroke-width="1.5"/>
            <line x1="420" y1="70" x2="490" y2="70" stroke="#64748b" stroke-width="1.5"/>

            <!-- Process 5.0 (Query Pipeline) -->
            <circle cx="230" cy="200" r="40" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="230" y="195" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10">5.0</text>
            <text x="230" y="208" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Query</text>
            <text x="230" y="220" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Embedding</text>

            <!-- Process 6.0 -->
            <circle cx="380" cy="200" r="40" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="380" y="195" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10">6.0</text>
            <text x="380" y="208" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">ANN Cosine</text>
            <text x="380" y="220" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Search</text>

            <!-- Process 7.0 -->
            <circle cx="530" cy="200" r="40" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="530" y="195" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="10">7.0</text>
            <text x="530" y="208" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">RAG Citation</text>
            <text x="530" y="220" text-anchor="middle" font-family="'Times New Roman', serif" font-size="9">Synthesis</text>

            <line x1="270" y1="200" x2="340" y2="200" stroke="#16a34a" stroke-width="1.5"/>
            <line x1="420" y1="200" x2="490" y2="200" stroke="#16a34a" stroke-width="1.5"/>
            <line x1="530" y1="110" x2="380" y2="160" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="3,3"/>
          </svg>
        </div>
        <div class="figure-caption">Figure 6: Data Flow Diagram (DFD) Level 1 — Detailed Pipeline Decomposition</div>
      </div>

      <h3>3.3.3 Data Dictionary</h3>
      <p>
        The data dictionary establishes standard specifications for all attributes, types, constraints, and relationships within Synapse.
      </p>

      <div class="table-container">
        <div class="table-caption">Table 11: Data Dictionary and Canonical Schema Specifications</div>
        <table class="academic-table">
          <thead>
            <tr>
              <th style="width: 22%;">Attribute</th>
              <th style="width: 22%;">Parent Entity</th>
              <th style="width: 20%;">Data Type</th>
              <th style="width: 36%;">Constraints &amp; Functional Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>id</code></td>
              <td><code>users</code></td>
              <td>UUID</td>
              <td>Primary Key, Default: <code>gen_random_uuid()</code>.</td>
            </tr>
            <tr>
              <td><code>email</code></td>
              <td><code>users</code></td>
              <td>TEXT</td>
              <td>Unique, Not Null. Normalized lowercase email.</td>
            </tr>
            <tr>
              <td><code>password_hash</code></td>
              <td><code>users</code></td>
              <td>TEXT</td>
              <td>Nullable (for Google OAuth users); bcrypt hash.</td>
            </tr>
            <tr>
              <td><code>key_hash</code></td>
              <td><code>api_keys</code></td>
              <td>TEXT</td>
              <td>Unique, Not Null. SHA-256 digest of plaintext key.</td>
            </tr>
            <tr>
              <td><code>content</code></td>
              <td><code>memories</code></td>
              <td>TEXT</td>
              <td>Not Null. Full extracted plaintext body.</td>
            </tr>
            <tr>
              <td><code>source_type</code></td>
              <td><code>memories</code></td>
              <td>TEXT</td>
              <td>Check: <code>('webpage','note','chat','pdf','selection')</code>.</td>
            </tr>
            <tr>
              <td><code>chunk_text</code></td>
              <td><code>embeddings</code></td>
              <td>TEXT</td>
              <td>Not Null. 300-word sliding window slice.</td>
            </tr>
            <tr>
              <td><code>embedding</code></td>
              <td><code>embeddings</code></td>
              <td>VECTOR(384)</td>
              <td>Dense float tensor; indexed with IVFFlat.</td>
            </tr>
            <tr>
              <td><code>tag</code></td>
              <td><code>tags</code></td>
              <td>TEXT</td>
              <td>Not Null. Indexed metadata classification string.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3.5 Database Design</h2>
      <p>
        The persistence engine utilizes PostgreSQL 16 equipped with <code>pgvector 0.8.6</code> running in a high-performance Docker container.
      </p>

      <h3>3.5.1 Entity-Relationship (ER) Diagram</h3>
      <p>
        Figure 10 presents the complete relational Entity-Relationship model, detailing foreign key linkages, cascades, and vector representations.
      </p>

      <div class="figure-container">
        <div class="diagram-box">
          <svg width="600" height="320" viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg">
            <rect width="600" height="320" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>

            <!-- Entity: USERS -->
            <rect x="20" y="30" width="150" height="110" rx="4" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
            <rect x="20" y="30" width="150" height="24" fill="#2563eb"/>
            <text x="95" y="47" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11" fill="#ffffff">USERS</text>
            <text x="28" y="70" font-family="'JetBrains Mono', monospace" font-size="9">PK id: UUID</text>
            <text x="28" y="85" font-family="'JetBrains Mono', monospace" font-size="9">email: TEXT (UK)</text>
            <text x="28" y="100" font-family="'JetBrains Mono', monospace" font-size="9">password_hash: TEXT</text>
            <text x="28" y="115" font-family="'JetBrains Mono', monospace" font-size="9">google_id: TEXT</text>
            <text x="28" y="130" font-family="'JetBrains Mono', monospace" font-size="9">created_at: TIMESTAMP</text>

            <!-- Entity: API_KEYS -->
            <rect x="20" y="180" width="150" height="110" rx="4" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
            <rect x="20" y="180" width="150" height="24" fill="#2563eb"/>
            <text x="95" y="197" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11" fill="#ffffff">API_KEYS</text>
            <text x="28" y="220" font-family="'JetBrains Mono', monospace" font-size="9">PK id: UUID</text>
            <text x="28" y="235" font-family="'JetBrains Mono', monospace" font-size="9">FK developer_id: UUID</text>
            <text x="28" y="250" font-family="'JetBrains Mono', monospace" font-size="9">key_hash: TEXT (UK)</text>
            <text x="28" y="265" font-family="'JetBrains Mono', monospace" font-size="9">app_name: TEXT</text>
            <text x="28" y="280" font-family="'JetBrains Mono', monospace" font-size="9">last_used: TIMESTAMP</text>

            <!-- Line Users -> API Keys -->
            <line x1="95" y1="140" x2="95" y2="180" stroke="#2563eb" stroke-width="1.5"/>
            <text x="105" y="160" font-family="'Times New Roman', serif" font-size="9">1:N</text>

            <!-- Entity: MEMORIES -->
            <rect x="230" y="30" width="160" height="130" rx="4" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <rect x="230" y="30" width="160" height="24" fill="#16a34a"/>
            <text x="310" y="47" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11" fill="#ffffff">MEMORIES</text>
            <text x="238" y="70" font-family="'JetBrains Mono', monospace" font-size="9">PK id: UUID</text>
            <text x="238" y="85" font-family="'JetBrains Mono', monospace" font-size="9">user_id: TEXT</text>
            <text x="238" y="100" font-family="'JetBrains Mono', monospace" font-size="9">FK api_key_id: UUID</text>
            <text x="238" y="115" font-family="'JetBrains Mono', monospace" font-size="9">content: TEXT</text>
            <text x="238" y="130" font-family="'JetBrains Mono', monospace" font-size="9">source_url: TEXT</text>
            <text x="238" y="145" font-family="'JetBrains Mono', monospace" font-size="9">source_type: TEXT</text>

            <!-- Line Users -> Memories -->
            <line x1="170" y1="80" x2="230" y2="80" stroke="#16a34a" stroke-width="1.5"/>
            <text x="195" y="75" font-family="'Times New Roman', serif" font-size="9">1:N</text>

            <!-- Line API Keys -> Memories -->
            <line x1="170" y1="210" x2="250" y2="210" stroke="#64748b" stroke-width="1.5"/>
            <line x1="250" y1="210" x2="250" y2="160" stroke="#64748b" stroke-width="1.5"/>

            <!-- Entity: EMBEDDINGS -->
            <rect x="440" y="30" width="145" height="110" rx="4" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
            <rect x="440" y="30" width="145" height="24" fill="#ca8a04"/>
            <text x="512" y="47" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11" fill="#ffffff">EMBEDDINGS</text>
            <text x="448" y="70" font-family="'JetBrains Mono', monospace" font-size="9">PK id: UUID</text>
            <text x="448" y="85" font-family="'JetBrains Mono', monospace" font-size="9">FK memory_id: UUID</text>
            <text x="448" y="100" font-family="'JetBrains Mono', monospace" font-size="9">chunk_text: TEXT</text>
            <text x="448" y="115" font-family="'JetBrains Mono', monospace" font-size="9">embedding: VECTOR(384)</text>
            <text x="448" y="130" font-family="'JetBrains Mono', monospace" font-size="9">created_at: TIMESTAMP</text>

            <!-- Line Memories -> Embeddings -->
            <line x1="390" y1="80" x2="440" y2="80" stroke="#ca8a04" stroke-width="1.5"/>
            <text x="410" y="75" font-family="'Times New Roman', serif" font-size="9">1:N</text>

            <!-- Entity: TAGS -->
            <rect x="440" y="180" width="145" height="90" rx="4" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
            <rect x="440" y="180" width="145" height="24" fill="#ca8a04"/>
            <text x="512" y="197" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11" fill="#ffffff">TAGS</text>
            <text x="448" y="220" font-family="'JetBrains Mono', monospace" font-size="9">PK id: UUID</text>
            <text x="448" y="235" font-family="'JetBrains Mono', monospace" font-size="9">FK memory_id: UUID</text>
            <text x="448" y="250" font-family="'JetBrains Mono', monospace" font-size="9">tag: TEXT</text>

            <!-- Line Memories -> Tags -->
            <line x1="350" y1="160" x2="350" y2="225" stroke="#ca8a04" stroke-width="1.5"/>
            <line x1="350" y1="225" x2="440" y2="225" stroke="#ca8a04" stroke-width="1.5"/>
            <text x="360" y="215" font-family="'Times New Roman', serif" font-size="9">1:N</text>
          </svg>
        </div>
        <div class="figure-caption">Figure 10: Entity-Relationship (ER) Diagram of Synapse Database</div>
      </div>

      <h3>3.5.2 Database Normalization Analysis</h3>
      <p>
        The schema strictly satisfies the requirements of Boyce-Codd / Third Normal Form (3NF):
      </p>
      <ul>
        <li><strong>First Normal Form (1NF):</strong> All attributes contain atomic values. Embeddings are stored as single <code>VECTOR(384)</code> types rather than comma-delimited text; tags are stored as normalized distinct tuples in <code>tags</code> rather than repeating arrays.</li>
        <li><strong>Second Normal Form (2NF):</strong> Every non-key attribute is fully functionally dependent on the primary key UUID. Composite primary keys are not used.</li>
        <li><strong>Third Normal Form (3NF):</strong> There are zero transitive dependencies. Developer identities in <code>api_keys</code> point directly to <code>users.id</code> rather than repeating email or profile credentials.</li>
      </ul>

      <h3>3.5.3 Database Manipulation &amp; IVFFlat Vector Querying</h3>
      <p>
        Vector similarity retrieval is executed via the cosine distance operator <code>&lt;=&gt;</code> supported by the IVFFlat index. The following SQL query demonstrates semantic search execution:
      </p>
      <pre><code>-- Retrieve top 5 semantically similar memory chunks within cosine distance threshold
SELECT 
    m.id AS memory_id,
    m.content,
    m.source_url,
    e.chunk_text,
    (1 - (e.embedding &lt;=&gt; $1::vector)) AS similarity_score
FROM embeddings e
JOIN memories m ON e.memory_id = m.id
WHERE m.user_id = $2
  AND (1 - (e.embedding &lt;=&gt; $1::vector)) &gt;= 0.25
ORDER BY e.embedding &lt;=&gt; $1::vector ASC
LIMIT 5;</code></pre>

      <h3>3.5.4 Database Connection Controls and Strings</h3>
      <p>
        Database access is controlled via a persistent connection pool instantiated through the <code>pg</code> library in <code>src/db.js</code>. The connection string is managed via environment variables (<code>DATABASE_URL=postgres://postgres:yourpassword@localhost:5433/synapse</code>), isolating credentials from public version control.
      </p>
    </div>
    """
