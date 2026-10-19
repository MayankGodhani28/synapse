# -*- coding: utf-8 -*-

def get_chapter6_and_appendix_html():
    return """
    <div class="page-break" style="padding-top: 20px;">
      <h1 class="chapter-title">CHAPTER 6 — CONCLUSION AND FUTURE SCOPE</h1>

      <h2>6.1 Conclusion</h2>
      <p>
        The exponential proliferation of unstructured digital information, coupled with the amnesic, stateless nature of contemporary artificial intelligence engines, has created a severe intellectual bottleneck for knowledge workers. Traditional bookmarking utilities lack semantic comprehension, whereas cloud-hosted vector databases incur recurring monthly financial burdens and compromise personal data confidentiality.
      </p>
      <p>
        To solve this dilemma, this project successfully conceptualized, implemented, and validated <strong>Synapse</strong>: an autonomous, privacy-first, on-device AI memory layer and personal second-brain architecture. Synapse unifies edge-based content capture, sliding-window document segmentation, local transformer embedding generation, containerized PostgreSQL vector persistence, and conversational RAG synthesis into a high-performance, cohesive ecosystem.
      </p>
      <p>
        By eliminating reliance on third-party cloud embedding APIs and utilizing <code>@xenova/transformers</code> with the <code>BAAI/bge-small-en-v1.5</code> model, Synapse achieves 100% on-device tensor computation, completing vector transformations in ~120ms per chunk on consumer CPU hardware with zero financial operating overhead. Integration with PostgreSQL 16 and <code>pgvector 0.8.6</code> via IVFFlat indexing delivers sub-200ms vector similarity searches across thousands of documents. Furthermore, the inclusion of a cryptographically secured Developer Console with SHA-256 hashed API keys transforms Synapse from a simple note app into a universal knowledge substrate accessible by any external bot or IDE extension.
      </p>

      <h2>6.2 Future Scope</h2>
      <p>
        While Synapse provides a complete, operational platform for text-based web knowledge, multiple promising engineering trajectories exist for future development:
      </p>
      <ol>
        <li><strong>Multi-Modal Vector Embeddings:</strong> Extending the local ONNX inference pipeline to support multi-modal vision-language models (e.g., CLIP or SigLIP), allowing users to capture and semantically retrieve diagrams, architectural schematics, and screenshots alongside text.</li>
        <li><strong>Graph-Augmented RAG (GraphRAG):</strong> Layering a property graph structure over relational memories to identify semantic entity relationships (e.g., author, organization, technology) and perform multi-hop reasoning across interconnected research topics.</li>
        <li><strong>Fully Local On-Device LLM Synthesis:</strong> Integrating lightweight localized generative engines (such as Ollama or WebLLM with Llama 3 8B or Mistral 7B) to perform the final conversational answer synthesis entirely offline, establishing 100% network-independent computing.</li>
        <li><strong>Cross-Device Peer-to-Peer Synchronization:</strong> Incorporating end-to-end encrypted peer-to-peer sync protocols (e.g., WebRTC or Libp2p) to synchronize vector vaults seamlessly between desktop workstations, laptops, and mobile devices without passing through centralized cloud servers.</li>
      </ol>

      <h2>6.3 Final Remarks</h2>
      <p>
        Synapse demonstrates that modern natural language processing and high-dimensional vector search can be democratized on consumer hardware without sacrificing performance, privacy, or developer extensibility. The system stands as a robust academic and practical contribution to the fields of Information Retrieval, Applied Artificial Intelligence, and Distributed Systems.
      </p>

      <div class="page-break" style="padding-top: 20px;">
        <h1 class="chapter-title">REFERENCES</h1>
        <ol style="font-size: 10.5pt; line-height: 1.6; padding-left: 24px;">
          <li>P. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," in <em>Advances in Neural Information Processing Systems (NeurIPS)</em>, vol. 33, pp. 9459-9474, 2020.</li>
          <li>S. Xiao et al., "C-Pack: Packaged Resources to Advance General Chinese Embedding," <em>arXiv preprint arXiv:2309.07597</em> (bge-small-en-v1.5 model specification), 2023.</li>
          <li>A. Radford et al., "Language Models are Unsupervised Multitask Learners," <em>OpenAI Technical Report</em>, 2019.</li>
          <li>PostgreSQL Global Development Group, "PostgreSQL 16.2 Documentation: Vector and Advanced Indexing," Available: https://www.postgresql.org/docs/16/</li>
          <li>A. Kane, "pgvector: Open-source vector similarity search for Postgres," GitHub Repository, 2024. Available: https://github.com/pgvector/pgvector</li>
          <li>Xenova, "Transformers.js: State-of-the-art Machine Learning for the Web," Hugging Face, 2024. Available: https://huggingface.co/docs/transformers.js</li>
          <li>Open Neural Network Exchange (ONNX), "ONNX Runtime: Cross-Platform Machine Learning Accelerator," Linux Foundation, 2024. Available: https://onnxruntime.ai/</li>
          <li>Google Chrome Developers, "Chrome Extensions Manifest V3 Specification," 2024. Available: https://developer.chrome.com/docs/extensions/mv3/</li>
          <li>Mozilla Corporation, "Readability.js: A standalone version of the Readability library used for Firefox Reader View," GitHub Repository, 2024.</li>
          <li>Node.js Foundation, "Node.js v24 LTS Runtime Documentation," 2024. Available: https://nodejs.org/docs/</li>
          <li>Express.js Foundation, "Express 4.x API Reference," 2024. Available: https://expressjs.com/</li>
          <li>Docker Inc., "Docker Desktop and Compose File Reference v2.27," 2024. Available: https://docs.docker.com/compose/</li>
          <li>Internet Engineering Task Force (IETF), "The OAuth 2.0 Authorization Framework," RFC 6749, Oct. 2012.</li>
          <li>Internet Engineering Task Force (IETF), "JSON Web Token (JWT)," RFC 7519, May 2015.</li>
          <li>National Institute of Standards and Technology (NIST), "FIPS PUB 180-4: Secure Hash Standard (SHS) - SHA-256," U.S. Department of Commerce, 2015.</li>
          <li>OWASP Foundation, "Top 10 Web Application Security Risks," 2021. Available: https://owasp.org/Top10/</li>
          <li>R. S. Pressman and B. R. Maxim, <em>Software Engineering: A Practitioner's Approach</em>, 9th ed., McGraw-Hill Education, 2020.</li>
          <li>I. Sommerville, <em>Software Engineering</em>, 10th ed., Pearson Education, 2016.</li>
          <li>R. Elmasri and S. B. Navathe, <em>Fundamentals of Database Systems</em>, 7th ed., Pearson, 2017.</li>
          <li>J. D. Ullman, <em>Principles of Database and Knowledge-Base Systems</em>, Computer Science Press, 1988.</li>
          <li>A. V. Aho, J. E. Hopcroft, and J. D. Ullman, <em>Data Structures and Algorithms</em>, Addison-Wesley, 1983.</li>
          <li>H. V. Jagadish et al., "Database Management Systems: A Research Perspective," <em>ACM Computing Surveys</em>, 2021.</li>
          <li>B. Malkov and D. A. Yashunin, "Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs," <em>IEEE TPAMI</em>, vol. 42, no. 4, pp. 824-836, 2020.</li>
          <li>M. Douze et al., "The Faiss Library," <em>arXiv preprint arXiv:2401.08281</em>, 2024.</li>
          <li>G. Salton and M. J. McGill, <em>Introduction to Modern Information Retrieval</em>, McGraw-Hill, 1983.</li>
          <li>C. D. Manning, P. Raghavan, and H. Schütze, <em>Introduction to Information Retrieval</em>, Cambridge University Press, 2008.</li>
          <li>J. Devlin et al., "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding," in <em>NAACL-HLT</em>, 2019.</li>
          <li>N. Reimers and I. Gurevych, "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks," in <em>EMNLP-IJCNLP</em>, 2019.</li>
          <li>E. Gamma, R. Helm, R. Johnson, and J. Vlissides, <em>Design Patterns: Elements of Reusable Object-Oriented Software</em>, Addison-Wesley, 1994.</li>
          <li>M. Fowler, <em>Patterns of Enterprise Application Architecture</em>, Addison-Wesley, 2002.</li>
          <li>W3C, "Web Content Accessibility Guidelines (WCAG) 2.1," World Wide Web Consortium, 2018.</li>
        </ol>
      </div>

      <div class="page-break" style="padding-top: 20px;">
        <h1 class="chapter-title">APPENDIX A — REST API REFERENCE</h1>
        <p>
          The Synapse backend exposes a standardized RESTful API under the base path <code>http://localhost:5000</code>. All routes require either a valid JWT Bearer token or an active developer API key in the <code>Authorization</code> header.
        </p>

        <div class="table-container">
          <div class="table-caption">Table 17: REST API — Authentication and User Management Routes</div>
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 15%;">Method</th>
                <th style="width: 32%;">Endpoint</th>
                <th style="width: 18%;">Access</th>
                <th style="width: 35%;">Functional Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>POST</td><td><code>/auth/register</code></td><td>Public</td><td>Registers a new user account with bcrypt password hashing.</td></tr>
              <tr><td>POST</td><td><code>/auth/login</code></td><td>Public</td><td>Validates email and password; returns signed JWT token.</td></tr>
              <tr><td>POST</td><td><code>/auth/google</code></td><td>Public</td><td>Verifies Google OAuth ID token; provisions or signs in user.</td></tr>
              <tr><td>GET</td><td><code>/auth/me</code></td><td>Authenticated</td><td>Retrieves the current user profile, display name, and statistics.</td></tr>
              <tr><td>POST</td><td><code>/auth/reset-password</code></td><td>Public</td><td>Generates password reset token and dispatches recovery sequence.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <div class="table-caption">Table 18: REST API — Memory Ingestion and Modification Endpoints</div>
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 15%;">Method</th>
                <th style="width: 32%;">Endpoint</th>
                <th style="width: 18%;">Access</th>
                <th style="width: 35%;">Functional Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>POST</td><td><code>/memory/add</code></td><td>Auth / API Key</td><td>Ingests raw content; chunks text; computes ONNX vectors; saves to DB.</td></tr>
              <tr><td>GET</td><td><code>/memory/list</code></td><td>Auth / API Key</td><td>Retrieves paginated memory stream filtered by user and tag.</td></tr>
              <tr><td>GET</td><td><code>/memory/:id</code></td><td>Auth / API Key</td><td>Fetches a specific memory record along with all chunk vectors.</td></tr>
              <tr><td>DELETE</td><td><code>/memory/:id</code></td><td>Auth / API Key</td><td>Cascade deletes a memory, associated chunks, vectors, and tags.</td></tr>
              <tr><td>POST</td><td><code>/memory/:id/tag</code></td><td>Auth / API Key</td><td>Appends a new classification tag to the specified memory.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <div class="table-caption">Table 19: REST API — Vector Search and Retrieval Endpoints</div>
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 15%;">Method</th>
                <th style="width: 32%;">Endpoint</th>
                <th style="width: 18%;">Access</th>
                <th style="width: 35%;">Functional Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>POST</td><td><code>/memory/search</code></td><td>Auth / API Key</td><td>Generates query embedding; executes IVFFlat cosine search in pgvector.</td></tr>
              <tr><td>GET</td><td><code>/memory/tags</code></td><td>Auth / API Key</td><td>Retrieves all distinct classification tags with occurrence counts.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <div class="table-caption">Table 20: REST API — Conversational RAG and Question-Answering Endpoints</div>
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 15%;">Method</th>
                <th style="width: 32%;">Endpoint</th>
                <th style="width: 18%;">Access</th>
                <th style="width: 35%;">Functional Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>POST</td><td><code>/chat/query</code></td><td>Auth / API Key</td><td>Executes grounded RAG retrieval and produces answers with citations.</td></tr>
              <tr><td>GET</td><td><code>/chat/history</code></td><td>Authenticated</td><td>Retrieves previous conversational Q&amp;A sessions.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="table-container">
          <div class="table-caption">Table 21: REST API — Developer Console and API Key Management</div>
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 15%;">Method</th>
                <th style="width: 32%;">Endpoint</th>
                <th style="width: 18%;">Access</th>
                <th style="width: 35%;">Functional Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>POST</td><td><code>/api-keys/create</code></td><td>Authenticated</td><td>Generates 32-byte <code>syn_</code> token; saves SHA-256 hash.</td></tr>
              <tr><td>GET</td><td><code>/api-keys/list</code></td><td>Authenticated</td><td>Lists all active developer API keys and their last usage timestamps.</td></tr>
              <tr><td>DELETE</td><td><code>/api-keys/:id</code></td><td>Authenticated</td><td>Revokes an issued developer API key immediately.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="page-break" style="padding-top: 20px;">
        <h1 class="chapter-title">APPENDIX B — BROWSER EXTENSION &amp; RAG PROTOCOL</h1>
        <p>
          Communication between the Chrome Manifest V3 extension, the local Express REST server, and the containerized database follows an asynchronous event-driven protocol designed to prevent blocking the user's browsing experience.
        </p>

        <div class="figure-container">
          <div class="diagram-box">
            <svg width="600" height="280" viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg">
              <rect width="600" height="280" fill="#f8fafc" rx="8" stroke="#cbd5e1" stroke-width="1"/>
              
              <!-- Participants -->
              <rect x="30" y="20" width="120" height="35" rx="4" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
              <text x="90" y="42" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">Chrome Content/DOM</text>
              <line x1="90" y1="55" x2="90" y2="250" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1.5"/>

              <rect x="240" y="20" width="120" height="35" rx="4" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
              <text x="300" y="42" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">Extension Background</text>
              <line x1="300" y1="55" x2="300" y2="250" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1.5"/>

              <rect x="450" y="20" width="120" height="35" rx="4" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
              <text x="510" y="42" text-anchor="middle" font-family="'Times New Roman', serif" font-weight="bold" font-size="11">Express Ingestion API</text>
              <line x1="510" y1="55" x2="510" y2="250" stroke="#94a3b8" stroke-dasharray="3,3" stroke-width="1.5"/>

              <!-- Flow 1 -->
              <line x1="90" y1="80" x2="300" y2="80" stroke="#2563eb" stroke-width="2"/>
              <text x="195" y="74" text-anchor="middle" font-size="9" fill="#1e40af">1. Trigger Context Menu / Readability</text>

              <!-- Flow 2 -->
              <line x1="300" y1="110" x2="510" y2="110" stroke="#16a34a" stroke-width="2"/>
              <text x="405" y="104" text-anchor="middle" font-size="9" fill="#15803d">2. HTTP POST /memory/add (JSON)</text>

              <!-- Flow 3: Server Processing -->
              <rect x="480" y="125" width="60" height="40" fill="#fde047" stroke="#ca8a04" stroke-width="1"/>
              <text x="510" y="142" text-anchor="middle" font-size="8">Chunking &amp;</text>
              <text x="510" y="154" text-anchor="middle" font-size="8">ONNX Embed</text>

              <!-- Flow 4: HTTP 200 Response -->
              <line x1="510" y1="180" x2="300" y2="180" stroke="#16a34a" stroke-width="2" stroke-dasharray="4,4"/>
              <text x="405" y="174" text-anchor="middle" font-size="9" fill="#15803d">3. HTTP 200 OK (memory_id, chunks)</text>

              <!-- Flow 5: Toast Message -->
              <line x1="300" y1="210" x2="90" y2="210" stroke="#2563eb" stroke-width="2" stroke-dasharray="4,4"/>
              <text x="195" y="204" text-anchor="middle" font-size="9" fill="#1e40af">4. Display "Saved to Synapse" Toast</text>
            </svg>
          </div>
          <div class="figure-caption">Figure 26: Client-Server Extension Ingestion &amp; Message Routing Protocol</div>
        </div>

        <div class="table-container">
          <div class="table-caption">Table 23: Chrome Extension Internal Event Routing Parameters</div>
          <table class="academic-table">
            <thead>
              <tr>
                <th style="width: 25%;">Action Type</th>
                <th style="width: 30%;">Trigger Source</th>
                <th style="width: 45%;">Internal Payload Structure</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>SAVE_PAGE</code></td><td>Context Menu Click</td><td><code>{ action: "SAVE_PAGE", url: tab.url, title: tab.title }</code></td></tr>
              <tr><td><code>SAVE_SELECTION</code></td><td>Context Menu Selection</td><td><code>{ action: "SAVE_SELECTION", text: info.selectionText, url: tab.url }</code></td></tr>
              <tr><td><code>SAVE_NOTE</code></td><td>Extension Popup View</td><td><code>{ action: "SAVE_NOTE", content: noteText, source_type: "note" }</code></td></tr>
              <tr><td><code>CHECK_HEALTH</code></td><td>Popup Initialization</td><td><code>GET http://localhost:5000/api/health</code></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    """
