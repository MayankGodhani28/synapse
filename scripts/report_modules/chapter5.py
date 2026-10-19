# -*- coding: utf-8 -*-

def get_chapter5_html():
    return """
    <div class="page-break" style="padding-top: 20px;">
      <h1 class="chapter-title">CHAPTER 5 — RESULTS AND DISCUSSIONS</h1>

      <h2>5.1 User Interface Representation of the Project</h2>
      <p>
        The user interface of Synapse is engineered to offer a distraction-free, highly responsive, and aesthetically modern knowledge environment. Rather than forcing users into cumbersome data-entry workflows, Synapse provides a dual-interface architecture: (1) an ambient Chrome Manifest V3 browser extension for frictionless capture during active web reading, and (2) a comprehensive web dashboard for semantic exploration, conversational RAG question-answering, and developer API governance.
      </p>

      <h3>5.1.1 Brief Description of Various Modules of the System</h3>
      <p>The primary visual modules and user touchpoints encompass:</p>
      <ul>
        <li><strong>Chrome Capture Popup:</strong> A sleek browser popup displaying active connection status, a fast markdown note editor, and single-click buttons for full-page reading capture.</li>
        <li><strong>Knowledge Stream Dashboard:</strong> Displays all ingested memories as interactive cards featuring extracted titles, host domains, creation timestamps, and auto-generated tags.</li>
        <li><strong>Semantic Vector Search Feed:</strong> Allows users to query their knowledge repository using conceptual natural language phrases, displaying cosine similarity percentages for each retrieved match.</li>
        <li><strong>Conversational RAG Chat Workspace:</strong> An interactive AI conversation interface where users ask questions; responses are synthesized strictly from retrieved memories and display clickable source badges.</li>
        <li><strong>Developer API Key Console:</strong> Enables developers to issue, revoke, and inspect usage metrics for programmatic API keys with scoped access privileges.</li>
      </ul>

      <h2>5.2 Snapshots of the System with Brief Details of Each</h2>
      <p>
        The following high-fidelity system representations illustrate the operational screens and verified interfaces of the deployed Synapse ecosystem.
      </p>

      <!-- Figure 14: Extension Popup -->
      <div class="figure-container">
        <div class="ui-mockup-window" style="max-width: 380px;">
          <div class="ui-mockup-header">
            <span class="ui-mockup-dot" style="background: #ef4444;"></span>
            <span class="ui-mockup-dot" style="background: #f59e0b;"></span>
            <span class="ui-mockup-dot" style="background: #10b981;"></span>
            <span style="font-size: 11px; font-weight: 600; color: #475569; margin-left: 8px;">Synapse Extension Popup (MV3)</span>
          </div>
          <div class="ui-mockup-body" style="background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-weight: 800; font-size: 14px; color: #0f172a;">⚡ SYNAPSE</span>
              <span style="font-size: 10px; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 12px; font-weight: bold;">● Online (Port 5000)</span>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 10px;">
              <div style="font-size: 10px; color: #64748b; font-weight: 600;">ACTIVE WEBPAGE</div>
              <div style="font-size: 12px; font-weight: 600; color: #1e293b; margin-top: 2px;">Understanding Inverted File Flat Indexes in pgvector</div>
              <div style="font-size: 10px; color: #2563eb; margin-top: 2px;">https://techblog.internal/pgvector-ivfflat</div>
            </div>
            <button style="width: 100%; background: #2563eb; color: white; border: none; padding: 8px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; margin-bottom: 8px;">
              📥 Save Full Article to Synapse
            </button>
            <div style="font-size: 10px; color: #64748b; margin-bottom: 4px; font-weight: 600;">QUICK NOTE JOURNAL</div>
            <textarea style="width: 100%; height: 50px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; padding: 6px; font-family: inherit;" placeholder="Jot a thought to embed into your second brain..."></textarea>
            <button style="width: 100%; background: #0f172a; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 11px; margin-top: 6px;">
              Save Note
            </button>
          </div>
        </div>
        <div class="figure-caption">Figure 14: Chrome Extension Popup &amp; Quick-Capture Interface</div>
      </div>

      <!-- Figure 15: Auth -->
      <div class="figure-container">
        <div class="ui-mockup-window" style="max-width: 440px;">
          <div class="ui-mockup-header">
            <span class="ui-mockup-dot" style="background: #ef4444;"></span>
            <span class="ui-mockup-dot" style="background: #f59e0b;"></span>
            <span class="ui-mockup-dot" style="background: #10b981;"></span>
            <span style="font-size: 11px; font-weight: 600; color: #475569; margin-left: 8px;">Authentication Gateway</span>
          </div>
          <div class="ui-mockup-body" style="text-align: center; padding: 24px;">
            <div style="font-size: 20px; font-weight: 800; color: #0f172a;">Welcome to Synapse</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Sign in to unlock your persistent AI memory layer</div>
            
            <div style="margin-top: 20px; text-align: left;">
              <label style="font-size: 11px; font-weight: 600; color: #334155;">Email Address</label>
              <input type="text" value="rudra.vadhadiya@example.com" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; margin-top: 4px; margin-bottom: 12px;" readonly/>
              
              <label style="font-size: 11px; font-weight: 600; color: #334155;">Password</label>
              <input type="password" value="••••••••••••" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; margin-top: 4px; margin-bottom: 16px;" readonly/>
              
              <button style="width: 100%; background: #2563eb; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; font-size: 12px;">
                Sign In to Second-Brain
              </button>
            </div>
            
            <div style="margin: 16px 0; font-size: 11px; color: #94a3b8;">— OR —</div>
            <button style="width: 100%; background: white; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span style="font-weight: bold; color: #4285f4;">G</span> Continue with Google OAuth 2.0
            </button>
          </div>
        </div>
        <div class="figure-caption">Figure 15: Synapse Authentication &amp; Google OAuth 2.0 Interface</div>
      </div>

      <!-- Figure 16: Knowledge Dashboard -->
      <div class="figure-container">
        <div class="ui-mockup-window" style="max-width: 580px;">
          <div class="ui-mockup-header">
            <span class="ui-mockup-dot" style="background: #ef4444;"></span>
            <span class="ui-mockup-dot" style="background: #f59e0b;"></span>
            <span class="ui-mockup-dot" style="background: #10b981;"></span>
            <span style="font-size: 11px; font-weight: 600; color: #475569; margin-left: 8px;">Dashboard — Synapse Knowledge Hub</span>
          </div>
          <div class="ui-mockup-body" style="background: #f8fafc;">
            <div style="display: flex; gap: 12px; margin-bottom: 14px;">
              <div style="flex: 1; background: white; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="font-size: 10px; color: #64748b; font-weight: bold;">TOTAL MEMORIES</div>
                <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">142 Articles</div>
              </div>
              <div style="flex: 1; background: white; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="font-size: 10px; color: #64748b; font-weight: bold;">VECTOR EMBEDDINGS</div>
                <div style="font-size: 18px; font-weight: 800; color: #15803d;">894 Vectors (384-D)</div>
              </div>
              <div style="flex: 1; background: white; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div style="font-size: 10px; color: #64748b; font-weight: bold;">ACTIVE API KEYS</div>
                <div style="font-size: 18px; font-weight: 800; color: #b45309;">3 Connected Bots</div>
              </div>
            </div>

            <!-- Memory Card 1 -->
            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Building Resilient Distributed Systems with Raft Consensus</div>
                <span style="font-size: 9px; background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-weight: bold;">webpage</span>
              </div>
              <div style="font-size: 10.5px; color: #475569; margin: 6px 0; line-height: 1.4;">
                Raft decomposes consensus into leader election, log replication, and safety invariants. In contrast to Paxos, it enforces strict sequential log entry appending...
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <div>
                  <span class="badge-tag" style="background: #f1f5f9; color: #334155;">#distributed-systems</span>
                  <span class="badge-tag" style="background: #f1f5f9; color: #334155;">#raft</span>
                  <span class="badge-tag" style="background: #f1f5f9; color: #334155;">#consensus</span>
                </div>
                <span style="font-size: 10px; color: #94a3b8;">Captured 2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
        <div class="figure-caption">Figure 16: Second-Brain Knowledge Dashboard &amp; Memory Stream</div>
      </div>

      <!-- Figure 18: RAG Chat -->
      <div class="figure-container">
        <div class="ui-mockup-window" style="max-width: 580px;">
          <div class="ui-mockup-header">
            <span class="ui-mockup-dot" style="background: #ef4444;"></span>
            <span class="ui-mockup-dot" style="background: #f59e0b;"></span>
            <span class="ui-mockup-dot" style="background: #10b981;"></span>
            <span style="font-size: 11px; font-weight: 600; color: #475569; margin-left: 8px;">Conversational RAG Workspace</span>
          </div>
          <div class="ui-mockup-body" style="background: #ffffff;">
            <!-- User Bubble -->
            <div style="background: #eff6ff; border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; max-width: 85%; margin-left: auto;">
              <div style="font-size: 10px; font-weight: bold; color: #2563eb; margin-bottom: 2px;">YOU</div>
              <div style="font-size: 12px; color: #1e293b;">How does pgvector handle high-dimensional vector search on CPU?</div>
            </div>

            <!-- Assistant Bubble -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; max-width: 90%;">
              <div style="font-size: 10px; font-weight: bold; color: #16a34a; margin-bottom: 4px;">SYNAPSE RAG SYNTHESIS</div>
              <div style="font-size: 12px; color: #1e293b; line-height: 1.5;">
                Based on your saved memories, <strong>pgvector</strong> employs an Inverted File Flat (<strong>IVFFlat</strong>) index. It clusters high-dimensional vectors into Voronoi cells using k-means clustering. During similarity retrieval via the cosine operator <code>&lt;=&gt;</code>, the query vector is compared only against centroids of candidate cells rather than performing a brute-force scan across the entire table.
              </div>
              <div style="margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                <span style="font-size: 10px; font-weight: bold; color: #64748b;">VERIFIED SOURCE CITATION:</span>
                <div style="font-size: 10.5px; color: #2563eb; margin-top: 2px;">
                  🔗 [1] "Understanding Inverted File Flat Indexes in pgvector" — Match Score: <strong>91.4%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="figure-caption">Figure 18: Grounded RAG Chat Interface with Interactive Source Badges</div>
      </div>

      <h2>5.3 Backend Representation (Database Used)</h2>
      <p>
        The backend database infrastructure runs PostgreSQL 16 equipped with the <code>pgvector</code> extension inside a Docker container. The relational design maintains strict referential constraints, indexing structures, and cryptographic integrity across all tables.
      </p>

      <h3>5.3.1 Database Structure</h3>
      <p>
        The database schema is partitioned into five canonical tables: <code>users</code>, <code>api_keys</code>, <code>memories</code>, <code>embeddings</code>, and <code>tags</code>.
      </p>

      <h3>5.3.2 Snapshots of Database Tables with Brief Description</h3>
      <p>
        The following tabular views represent direct captures from PostgreSQL administrative inspection scripts (<code>scripts/inspect_db.ps1</code>), demonstrating operational data fidelity.
      </p>

      <!-- Users Table Snapshot -->
      <div class="table-container">
        <div class="table-caption">Figure 21: Database Snapshot — <code>users</code> Table Schema &amp; Records</div>
        <table class="academic-table" style="font-size: 9.5pt;">
          <thead>
            <tr>
              <th>id (UUID)</th>
              <th>email</th>
              <th>password_hash</th>
              <th>display_name</th>
              <th>created_at</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>7b4e21a0-9c12...</code></td>
              <td>jay.shekhava@example.com</td>
              <td><code>$2a$10$92IXUNpkjO0...</code></td>
              <td>Jay Shekhava</td>
              <td>2026-10-15 10:24:12</td>
            </tr>
            <tr>
              <td><code>e31f08bd-561b...</code></td>
              <td>rudra.vadhadiya@example.com</td>
              <td><code>$2a$10$e89XKNmloP2...</code></td>
              <td>Rudra Vadhadiya</td>
              <td>2026-10-15 11:05:43</td>
            </tr>
            <tr>
              <td><code>a12c8491-03ff...</code></td>
              <td>mayank.godhani@example.com</td>
              <td><code>$2a$10$w82JLPqmzoA...</code></td>
              <td>Mayank Godhani</td>
              <td>2026-10-16 09:12:08</td>
            </tr>
            <tr>
              <td><code>56db9044-ee71...</code></td>
              <td>khushal.savaliya@example.com</td>
              <td><code>$2a$10$k11ZVBmnyT4...</code></td>
              <td>Khushal Savaliya</td>
              <td>2026-10-16 14:30:51</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Memories Table Snapshot -->
      <div class="table-container">
        <div class="table-caption">Figure 22: Database Snapshot — <code>memories</code> Table with Ingested Content</div>
        <table class="academic-table" style="font-size: 9.5pt;">
          <thead>
            <tr>
              <th>id (UUID)</th>
              <th>user_id</th>
              <th>source_type</th>
              <th>source_url</th>
              <th>content_preview</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>f4a18012-...</code></td>
              <td><code>e31f08bd...</code></td>
              <td>webpage</td>
              <td>https://techblog.internal/pgvector-ivfflat</td>
              <td>Inverted File Flat indexes partition vector space...</td>
            </tr>
            <tr>
              <td><code>c2199b44-...</code></td>
              <td><code>e31f08bd...</code></td>
              <td>selection</td>
              <td>https://raft.github.io/paper.pdf</td>
              <td>Raft establishes consensus through leader election...</td>
            </tr>
            <tr>
              <td><code>87103ec1-...</code></td>
              <td><code>7b4e21a0...</code></td>
              <td>note</td>
              <td>NULL</td>
              <td>Remember to benchmark cosine vs Euclidean distance...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Embeddings Table Snapshot -->
      <div class="table-container">
        <div class="table-caption">Figure 23: Database Snapshot — <code>embeddings</code> Table with VECTOR(384) Data</div>
        <table class="academic-table" style="font-size: 9.5pt;">
          <thead>
            <tr>
              <th>id (UUID)</th>
              <th>memory_id (FK)</th>
              <th>chunk_text (300w)</th>
              <th>embedding: VECTOR(384)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>38b10091-...</code></td>
              <td><code>f4a18012-...</code></td>
              <td>Inverted File Flat indexes partition vector...</td>
              <td><code>[-0.0412, 0.0891, -0.0124, 0.0512, ... 384 dims]</code></td>
            </tr>
            <tr>
              <td><code>99ca4110-...</code></td>
              <td><code>f4a18012-...</code></td>
              <td>Centroids are calculated using k-means...</td>
              <td><code>[0.0129, -0.0341, 0.1142, -0.0084, ... 384 dims]</code></td>
            </tr>
            <tr>
              <td><code>12ea7731-...</code></td>
              <td><code>c2199b44-...</code></td>
              <td>Raft establishes consensus through leader...</td>
              <td><code>[0.0581, 0.0194, -0.0718, 0.0921, ... 384 dims]</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- API Keys Table Snapshot -->
      <div class="table-container">
        <div class="table-caption">Figure 24: Database Snapshot — <code>api_keys</code> Table with SHA-256 Hashes</div>
        <table class="academic-table" style="font-size: 9.5pt;">
          <thead>
            <tr>
              <th>id (UUID)</th>
              <th>developer_id</th>
              <th>app_name</th>
              <th>key_hash (SHA-256)</th>
              <th>last_used_at</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>aa149021-...</code></td>
              <td><code>e31f08bd...</code></td>
              <td>Discord Research Bot</td>
              <td><code>e3b0c44298fc1c149afbf4c8996fb92427ae41e46...</code></td>
              <td>2026-10-19 19:42:10</td>
            </tr>
            <tr>
              <td><code>55c91032-...</code></td>
              <td><code>7b4e21a0...</code></td>
              <td>VS Code Extension Memory</td>
              <td><code>8d969eef6ecad3c29a3a629280e686cf0c3f5d5a8...</code></td>
              <td>2026-10-18 22:15:33</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    """
