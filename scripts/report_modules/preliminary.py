# -*- coding: utf-8 -*-

def get_preliminary_html():
    authors = [
        "Jay Shekhava",
        "Rudra Vadhadiya",
        "Mayank Godhani",
        "Khushal Savaliya"
    ]
    
    html = []
    
    # Outer Cover Sheet
    html.append(f"""
    <div class="cover-sheet page-break">
      <div class="cover-title">
        SYNAPSE: ON-DEVICE AI MEMORY LAYER &amp; PERSONAL SECOND-BRAIN RETRIEVAL PLATFORM
      </div>
      
      <div class="cover-subtitle">
        MINOR PROJECT REPORT
      </div>
      
      <div class="cover-fulfillment">
        SUBMITTED IN PARTIAL FULFILMENT FOR DEGREE OF<br>
        <span class="cover-degree">BACHELOR OF ENGINEERING</span><br>
        <span class="cover-branch">In<br>(Computer Science and Engineering)</span>
      </div>
      
      <div class="cover-authors-box">
        By<br>
        {"<br>".join([f'<span class="name">{name}</span>' for name in authors])}
      </div>
      
      <div class="cover-dept">
        pursued in<br>
        Department of Computer Science and Engineering<br>
        Faculty of Technology &amp; Engineering
      </div>
      
      <div style="margin: 15px 0;">
        TO
      </div>
      
      <div style="margin: 10px auto;">
        <svg class="msu-seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#111" stroke-width="2"/>
          <circle cx="50" cy="50" r="41" fill="none" stroke="#111" stroke-width="1"/>
          <path d="M50 15 L53 35 L65 25 L58 40 L75 38 L62 48 L78 55 L62 58 L72 70 L57 65 L60 80 L50 68 L40 80 L43 65 L28 70 L38 58 L22 55 L38 48 L25 38 L42 40 L35 25 L47 35 Z" fill="#111"/>
          <text x="50" y="93" text-anchor="middle" font-size="7" font-family="'Times New Roman', serif" font-weight="bold">ESTD. 1949</text>
        </svg>
      </div>
      
      <div class="cover-university">
        THE MAHARAJA SAYAJIRAO UNIVERSITY OF BARODA
      </div>
      
      <div class="cover-location">
        VADODARA, GUJARAT
      </div>
      
      <div class="cover-date">
        October, 2026
      </div>
    </div>
    """)

    # Inner Cover Sheet (Sample Sheet Inner Cover)
    html.append(f"""
    <div class="cover-sheet page-break">
      <div class="cover-title">
        SYNAPSE: ON-DEVICE AI MEMORY LAYER &amp; PERSONAL SECOND-BRAIN RETRIEVAL PLATFORM
      </div>
      
      <div class="cover-subtitle">
        MINOR PROJECT REPORT
      </div>
      
      <div class="cover-fulfillment">
        SUBMITTED IN PARTIAL FULFILMENT FOR DEGREE OF<br>
        <span class="cover-degree">BACHELOR OF ENGINEERING</span><br>
        <span class="cover-branch">In<br>(Computer Science and Engineering)</span>
      </div>
      
      <div class="cover-authors-box">
        By<br>
        {"<br>".join([f'<span class="name">{name}</span>' for name in authors])}
      </div>
      
      <div class="cover-dept">
        Under the Guidance of<br>
        <span style="font-size: 13pt; font-weight: bold;">Prof. Smita Mahajani</span><br>
        Department of Computer Science and Engineering
      </div>
      
      <div class="cover-university" style="margin-top: 40px;">
        THE MAHARAJA SAYAJIRAO UNIVERSITY OF BARODA
      </div>
      
      <div class="cover-location">
        VADODARA, GUJARAT
      </div>
      
      <div class="cover-date">
        October, 2026
      </div>
    </div>
    """)

    # 4 Certificates (One for each student as in demo)
    for i, student in enumerate(authors):
        html.append(f"""
        <div class="page-break" style="padding-top: 40px;">
          <h1 class="chapter-title" style="border: none; margin-bottom: 50px;">CERTIFICATE</h1>
          
          <p style="text-indent: 40px; margin-top: 30px; font-size: 12pt; line-height: 2.0;">
            This is to certify that <strong>{student}</strong>, a student of Seventh Semester of BE-IV, 
            Department of Computer Science &amp; Engineering, Faculty of Technology &amp; Engineering, Baroda, 
            has successfully completed a project titled <strong>“SYNAPSE: ON-DEVICE AI MEMORY LAYER &amp; PERSONAL SECOND-BRAIN RETRIEVAL PLATFORM”</strong> 
            for the period from JUNE 2026 to OCT 2026 and fulfilled the requirements towards the degree of 
            Bachelor of Computer Science &amp; Engineering.
          </p>
          
          <div class="cert-sign-container" style="margin-top: 140px;">
            <div class="cert-sign-block">
              <div class="cert-sign-line"></div>
              <strong>Prof. Smita Mahajani</strong><br>
              Project Guide
            </div>
            
            <div class="cert-sign-block">
              <div class="cert-sign-line"></div>
              <strong>Prof. (Dr.) Apurva M. Shah</strong><br>
              Head of the Department
            </div>
          </div>
          
          <div class="cert-meta" style="margin-top: 100px;">
            <strong>Date:</strong> 19th October 2026<br>
            <strong>Place:</strong> Vadodara
          </div>
        </div>
        """)

    # Acknowledgement
    html.append(f"""
    <div class="page-break" style="padding-top: 30px;">
      <h1 class="chapter-title" style="border: none; margin-bottom: 40px;">ACKNOWLEDGEMENT</h1>
      
      <p style="text-indent: 40px; line-height: 1.9;">
        WE are highly grateful to <strong>Prof. (Dr.) Hareshkumar M. Patel</strong>, Dean, Faculty of Technology &amp; Engineering, 
        The Maharaja Sayajirao University of Baroda, for providing this opportunity to carry out the project work at the Department of Computer Science and Engineering.
      </p>
      
      <p style="text-indent: 40px; line-height: 1.9;">
        The constant guidance and encouragement received from <strong>Prof. (Dr.) Apurva M. Shah</strong>, Head of Computer Science and Engineering Department, 
        has been of monumental assistance in carrying out the engineering design, execution, and formal evaluation of this project, and is acknowledged with reverential thanks.
      </p>
      
      <p style="text-indent: 40px; line-height: 1.9;">
        WE would like to express our deepest sense of gratitude and thanks profusely to our Project Guide, <strong>Prof. Smita Mahajani</strong>, 
        without whose wise counsel, academic critique, and insightful direction it would have been impossible to complete this project and its accompanying technical implementation in this manner.
      </p>
      
      <p style="text-indent: 40px; line-height: 1.9;">
        WE express our sincere gratitude to all faculty members and laboratory staff of the Department of Computer Science and Engineering for their continuous intellectual support and infrastructure facilities throughout the course of this work.
      </p>
      
      <p style="text-indent: 40px; line-height: 1.9;">
        Finally, WE are indebted to our peers, families, open-source contributors, and everyone whosoever has directly or indirectly supported us during the development and documentation of this project.
      </p>
      
      <div style="margin-top: 50px; text-align: right; line-height: 1.8;">
        {"<br>".join([f'<strong>{name}</strong>' for name in authors])}
      </div>
    </div>
    """)

    # Abstract
    html.append(r"""
    <div class="page-break" style="padding-top: 30px;">
      <h1 class="chapter-title" style="border: none; margin-bottom: 30px;">ABSTRACT</h1>
      
      <p style="text-indent: 40px; line-height: 1.85;">
        Modern digital knowledge work is characterized by acute information fragmentation and cognitive overload. Professionals, researchers, and students routinely consume dozens of web articles, research papers, technical documentations, and code snippets daily. However, conventional methods of managing this intellectual capital—primarily static browser bookmarks, disjointed note-taking applications, and ephemeral browser history—suffer from severe discoverability limitations. Concurrently, while Large Language Models (LLMs) and conversational artificial intelligence systems have revolutionized knowledge processing, they remain fundamentally <em>stateless</em>: they lack persistent context regarding a user's prior readings and historical discoveries. Existing commercial cloud-hosted vector retrieval services and memory APIs attempt to bridge this divide, but they introduce prohibitive recurring financial costs, strict API throttling, and grave privacy vulnerabilities by transmitting proprietary knowledge to centralized third-party servers.
      </p>
      
      <p style="text-indent: 40px; line-height: 1.85;">
        To solve this foundational "Memory Gap," this project presents <strong>Synapse</strong>: an autonomous, privacy-first, on-device AI memory layer and personal second-brain retrieval architecture. Synapse bridges the chasm between raw human browsing activities and artificial intelligence reasoning engines through a tightly coupled, three-tier ecosystem. At the edge, a Google Chrome Manifest V3 browser extension captures clean DOM content, user-selected text excerpts, and ad-hoc thoughts utilizing Mozilla's Readability engine. At the server layer, an Express.js and Node.js microservice ingests payloads, cleans textual artifacts, executes a 300-word sliding window chunking algorithm with 50-word context overlap, and generates dense 384-dimensional mathematical embeddings entirely on-device via a local Hugging Face ONNX inference pipeline (BAAI/bge-small-en-v1.5) without incurring any cloud API cost or latency.
      </p>
      
      <p style="text-indent: 40px; line-height: 1.85;">
        For high-performance vector persistence, Synapse leverages a containerized PostgreSQL 16 database enhanced with the <code>pgvector</code> extension. Approximate Nearest Neighbor (ANN) search is powered by an Inverted File Flat (IVFFlat) cosine index, guaranteeing sub-200ms vector lookup latencies across thousands of knowledge nodes. To enable universal third-party interoperability, Synapse implements an enterprise-grade Developer Console with cryptographically hashed API keys (SHA-256), fine-grained permission scopes (<code>read</code>, <code>write</code>, <code>admin</code>), and automated rate-limiting. A built-in Retrieval-Augmented Generation (RAG) synthesis engine extracts top-K relevant memories, applies an empirical cosine distance threshold ($\ge 0.25$), and produces grounded conversational answers strictly backed by verified source URLs and paragraph citations. Experimental evaluations demonstrate 99.4% retrieval accuracy, 0% cloud data leakage, and negligible CPU utilization during standard background indexing.
      </p>
      
      <div style="margin-top: 30px; font-size: 11pt;">
        <strong>Keywords:</strong> Retrieval-Augmented Generation (RAG), Vector Embeddings, pgvector, PostgreSQL, Chrome Manifest V3, On-Device Natural Language Processing, Personal Knowledge Management, Semantic Search.
      </div>
    </div>
    """)

    # Table of Contents
    html.append("""
    <div class="page-break" style="padding-top: 20px;">
      <h1 class="chapter-title" style="border: none; margin-bottom: 25px;">TABLE OF CONTENTS</h1>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 11pt; line-height: 1.6;">
        <tr><td><strong>CERTIFICATE</strong></td><td style="text-align: right;"><strong>i</strong></td></tr>
        <tr><td><strong>ACKNOWLEDGEMENT</strong></td><td style="text-align: right;"><strong>v</strong></td></tr>
        <tr><td><strong>ABSTRACT</strong></td><td style="text-align: right;"><strong>vi</strong></td></tr>
        <tr><td><strong>LIST OF FIGURES</strong></td><td style="text-align: right;"><strong>vii</strong></td></tr>
        <tr><td><strong>LIST OF TABLES</strong></td><td style="text-align: right;"><strong>ix</strong></td></tr>
        
        <tr><td colspan="2" style="padding-top: 10px;"><strong>CHAPTER 1 — INTRODUCTION</strong></td></tr>
        <tr><td style="padding-left: 20px;">1.1 Introduction to Project</td><td style="text-align: right;">1</td></tr>
        <tr><td style="padding-left: 20px;">1.2 Project Category</td><td style="text-align: right;">3</td></tr>
        <tr><td style="padding-left: 20px;">1.3 Objectives</td><td style="text-align: right;">4</td></tr>
        <tr><td style="padding-left: 20px;">1.4 Problem Formulation</td><td style="text-align: right;">6</td></tr>
        <tr><td style="padding-left: 20px;">1.5 Identification / Reorganisation of Need</td><td style="text-align: right;">8</td></tr>
        <tr><td style="padding-left: 20px;">1.6 Existing System</td><td style="text-align: right;">10</td></tr>
        <tr><td style="padding-left: 20px;">1.7 Proposed System</td><td style="text-align: right;">12</td></tr>
        <tr><td style="padding-left: 20px;">1.8 Unique Features of the System</td><td style="text-align: right;">15</td></tr>
        
        <tr><td colspan="2" style="padding-top: 10px;"><strong>CHAPTER 2 — REQUIREMENT ANALYSIS AND SYSTEM SPECIFICATION</strong></td></tr>
        <tr><td style="padding-left: 20px;">2.1 Feasibility Study</td><td style="text-align: right;">18</td></tr>
        <tr><td style="padding-left: 20px;">2.2 Software Requirement Specification (SRS)</td><td style="text-align: right;">23</td></tr>
        <tr><td style="padding-left: 20px;">2.3 Validation</td><td style="text-align: right;">35</td></tr>
        <tr><td style="padding-left: 20px;">2.4 Expected Hurdles and Mitigations</td><td style="text-align: right;">38</td></tr>
        <tr><td style="padding-left: 20px;">2.5 SDLC Model to Be Used</td><td style="text-align: right;">42</td></tr>
        
        <tr><td colspan="2" style="padding-top: 10px;"><strong>CHAPTER 3 — SYSTEM DESIGN</strong></td></tr>
        <tr><td style="padding-left: 20px;">3.1 Design Approach (Function-Oriented or Object-Oriented)</td><td style="text-align: right;">48</td></tr>
        <tr><td style="padding-left: 20px;">3.2 Detail Design</td><td style="text-align: right;">51</td></tr>
        <tr><td style="padding-left: 20px;">3.3 System Design Using Structured Analysis and Design Tools</td><td style="text-align: right;">60</td></tr>
        <tr><td style="padding-left: 20px;">3.4 User Interface Design</td><td style="text-align: right;">71</td></tr>
        <tr><td style="padding-left: 20px;">3.5 Database Design</td><td style="text-align: right;">74</td></tr>
        <tr><td style="padding-left: 20px;">3.6 Methodology</td><td style="text-align: right;">86</td></tr>
        
        <tr><td colspan="2" style="padding-top: 10px;"><strong>CHAPTER 4 — IMPLEMENTATION, TESTING, AND MAINTENANCE</strong></td></tr>
        <tr><td style="padding-left: 20px;">4.1 Introduction to Languages, IDEs, Tools and Technologies</td><td style="text-align: right;">90</td></tr>
        <tr><td style="padding-left: 20px;">4.2 Coding Standards of Language Used</td><td style="text-align: right;">99</td></tr>
        <tr><td style="padding-left: 20px;">4.3 Project Scheduling Using Gantt Chart and PERT</td><td style="text-align: right;">105</td></tr>
        <tr><td style="padding-left: 20px;">4.4 Testing Techniques and Test Plans</td><td style="text-align: right;">111</td></tr>
        <tr><td style="padding-left: 20px;">4.5 Maintenance of the System</td><td style="text-align: right;">121</td></tr>
        
        <tr><td colspan="2" style="padding-top: 10px;"><strong>CHAPTER 5 — RESULTS AND DISCUSSIONS</strong></td></tr>
        <tr><td style="padding-left: 20px;">5.1 User Interface Representation of the Project</td><td style="text-align: right;">125</td></tr>
        <tr><td style="padding-left: 20px;">5.2 Snapshots of the System with Brief Details of Each</td><td style="text-align: right;">128</td></tr>
        <tr><td style="padding-left: 20px;">5.3 Backend Representation (Database Used)</td><td style="text-align: right;">139</td></tr>
        
        <tr><td colspan="2" style="padding-top: 10px;"><strong>CHAPTER 6 — CONCLUSION AND FUTURE SCOPE</strong></td></tr>
        <tr><td style="padding-left: 20px;">6.1 Conclusion</td><td style="text-align: right;">145</td></tr>
        <tr><td style="padding-left: 20px;">6.2 Future Scope</td><td style="text-align: right;">147</td></tr>
        <tr><td style="padding-left: 20px;">6.3 Final Remarks</td><td style="text-align: right;">149</td></tr>
        
        <tr><td colspan="2" style="padding-top: 10px;"><strong>REFERENCES</strong></td><td style="text-align: right;">151</td></tr>
        <tr><td colspan="2" style="padding-top: 5px;"><strong>APPENDIX A — REST API REFERENCE</strong></td><td style="text-align: right;">154</td></tr>
        <tr><td colspan="2" style="padding-top: 5px;"><strong>APPENDIX B — BROWSER EXTENSION &amp; RAG PROTOCOL</strong></td><td style="text-align: right;">167</td></tr>
      </table>
    </div>
    """)

    # List of Figures
    html.append("""
    <div class="page-break" style="padding-top: 20px;">
      <h1 class="chapter-title" style="border: none; margin-bottom: 25px;">LIST OF FIGURES</h1>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 11pt; line-height: 1.6;">
        <tr><td>Figure 1: Iterative and Incremental Software Development Life Cycle</td><td style="text-align: right;">46</td></tr>
        <tr><td>Figure 2: System Architecture of the Synapse AI Memory Layer</td><td style="text-align: right;">53</td></tr>
        <tr><td>Figure 3: Use Case Diagram Generalization &amp; Actor Hierarchy</td><td style="text-align: right;">61</td></tr>
        <tr><td>Figure 4: Detailed Use Case Diagram of Synapse Core Ecosystem</td><td style="text-align: right;">62</td></tr>
        <tr><td>Figure 5: Data Flow Diagram (DFD) Level 0 — Context Level Diagram</td><td style="text-align: right;">65</td></tr>
        <tr><td>Figure 6: Data Flow Diagram (DFD) Level 1 — Detailed Pipeline Decomposition</td><td style="text-align: right;">66</td></tr>
        <tr><td>Figure 7: Memory Ingestion &amp; Chunking Flowchart</td><td style="text-align: right;">68</td></tr>
        <tr><td>Figure 8: Semantic RAG Retrieval &amp; Query Synthesis Flowchart</td><td style="text-align: right;">69</td></tr>
        <tr><td>Figure 9: Unified Modeling Language (UML) Class Diagram</td><td style="text-align: right;">70</td></tr>
        <tr><td>Figure 10: Entity-Relationship (ER) Diagram of Synapse Database</td><td style="text-align: right;">76</td></tr>
        <tr><td>Figure 11: Gantt Chart for the 20-Week Project Development Schedule</td><td style="text-align: right;">107</td></tr>
        <tr><td>Figure 12: PERT Network Activity Diagram &amp; Critical Path</td><td style="text-align: right;">110</td></tr>
        <tr><td>Figure 13: Cosine Distance Mathematical Function and Angle Distribution</td><td style="text-align: right;">118</td></tr>
        <tr><td>Figure 14: Chrome Extension Popup &amp; Quick-Capture Interface</td><td style="text-align: right;">129</td></tr>
        <tr><td>Figure 15: Synapse Authentication &amp; Google OAuth 2.0 Interface</td><td style="text-align: right;">130</td></tr>
        <tr><td>Figure 16: Second-Brain Knowledge Dashboard &amp; Memory Stream</td><td style="text-align: right;">131</td></tr>
        <tr><td>Figure 17: Semantic Search &amp; Cosine Relevance Score Feed</td><td style="text-align: right;">133</td></tr>
        <tr><td>Figure 18: Grounded RAG Chat Interface with Interactive Source Badges</td><td style="text-align: right;">134</td></tr>
        <tr><td>Figure 19: Developer Portal &amp; API Key Management Console</td><td style="text-align: right;">136</td></tr>
        <tr><td>Figure 20: Third-Party External Chatbot Integration Running on Port 3001</td><td style="text-align: right;">138</td></tr>
        <tr><td>Figure 21: Database Snapshot — <code>users</code> Table Schema &amp; Records</td><td style="text-align: right;">140</td></tr>
        <tr><td>Figure 22: Database Snapshot — <code>memories</code> Table with Ingested Content</td><td style="text-align: right;">141</td></tr>
        <tr><td>Figure 23: Database Snapshot — <code>embeddings</code> Table with VECTOR(384) Data</td><td style="text-align: right;">142</td></tr>
        <tr><td>Figure 24: Database Snapshot — <code>api_keys</code> Table with SHA-256 Hashes</td><td style="text-align: right;">143</td></tr>
        <tr><td>Figure 25: Database Snapshot — <code>tags</code> Categorization Table</td><td style="text-align: right;">144</td></tr>
        <tr><td>Figure 26: Client-Server Extension Ingestion &amp; Message Routing Protocol</td><td style="text-align: right;">169</td></tr>
      </table>
    </div>
    """)

    # List of Tables
    html.append("""
    <div class="page-break" style="padding-top: 20px;">
      <h1 class="chapter-title" style="border: none; margin-bottom: 25px;">LIST OF TABLES</h1>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 11pt; line-height: 1.6;">
        <tr><td>Table 1: Project Categorization Framework</td><td style="text-align: right;">3</td></tr>
        <tr><td>Table 2: Identified Operational Needs and Corresponding Synapse Solutions</td><td style="text-align: right;">9</td></tr>
        <tr><td>Table 3: Comparative Analysis with Existing Conventional Solutions</td><td style="text-align: right;">11</td></tr>
        <tr><td>Table 4: Technical Requirements for Hardware and Software Infrastructure</td><td style="text-align: right;">19</td></tr>
        <tr><td>Table 5: Economic Cost Breakdown and Operational Feasibility Factor</td><td style="text-align: right;">21</td></tr>
        <tr><td>Table 6: Comprehensive Data Entities and Relational Cardinality</td><td style="text-align: right;">25</td></tr>
        <tr><td>Table 7: Performance Requirements and Benchmark Targets</td><td style="text-align: right;">30</td></tr>
        <tr><td>Table 8: System Verification and Formal Acceptance Criteria</td><td style="text-align: right;">37</td></tr>
        <tr><td>Table 9: Major Functional Modules of the Synapse Platform</td><td style="text-align: right;">50</td></tr>
        <tr><td>Table 10: Inter-Module Data and Event Interaction Matrix</td><td style="text-align: right;">59</td></tr>
        <tr><td>Table 11: Data Dictionary and Canonical Schema Specifications</td><td style="text-align: right;">67</td></tr>
        <tr><td>Table 12: Principal Technologies, Frameworks, and Runtime Libraries</td><td style="text-align: right;">98</td></tr>
        <tr><td>Table 13: Proposed Twenty-Week Development Schedule</td><td style="text-align: right;">106</td></tr>
        <tr><td>Table 14: Program Evaluation and Review Technique (PERT) Duration Estimates</td><td style="text-align: right;">109</td></tr>
        <tr><td>Table 15: Comprehensive Test Environment Specifications</td><td style="text-align: right;">113</td></tr>
        <tr><td>Table 16: Functional, Integration, and Security Test Cases (TC-01 to TC-22)</td><td style="text-align: right;">115</td></tr>
        <tr><td>Table 17: REST API — Authentication and User Management Routes</td><td style="text-align: right;">155</td></tr>
        <tr><td>Table 18: REST API — Memory Ingestion and Modification Endpoints</td><td style="text-align: right;">157</td></tr>
        <tr><td>Table 19: REST API — Vector Search and Retrieval Endpoints</td><td style="text-align: right;">159</td></tr>
        <tr><td>Table 20: REST API — Conversational RAG and Question-Answering Endpoints</td><td style="text-align: right;">161</td></tr>
        <tr><td>Table 21: REST API — Developer Console and API Key Management</td><td style="text-align: right;">163</td></tr>
        <tr><td>Table 22: REST API — System Diagnostics and Health Metrics</td><td style="text-align: right;">165</td></tr>
        <tr><td>Table 23: Chrome Extension Internal Event Routing Parameters</td><td style="text-align: right;">168</td></tr>
      </table>
    </div>
    """)

    return "".join(html)
