# -*- coding: utf-8 -*-

CSS_STYLES = """
<style>
  @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&family=JetBrains+Mono:wght@400;500;700&display=swap');

  @page {
    size: A4 portrait;
    margin-top: 25mm;
    margin-bottom: 12.5mm;
    margin-left: 35mm;
    margin-right: 12.5mm;
    @bottom-right {
      content: counter(page);
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
    }
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.8;
    color: #111111;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
    text-align: justify;
  }

  .page-break {
    page-break-after: always;
    break-after: page;
  }

  .avoid-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Cover & Title Page */
  .cover-sheet {
    min-height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    padding: 20px 10px;
  }

  .cover-title {
    font-size: 20pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: 30px;
    line-height: 1.3;
  }

  .cover-subtitle {
    font-size: 14pt;
    font-weight: bold;
    margin-top: 25px;
    text-transform: uppercase;
  }

  .cover-fulfillment {
    font-size: 11pt;
    margin-top: 20px;
    line-height: 1.5;
    text-transform: uppercase;
  }

  .cover-degree {
    font-size: 13pt;
    font-weight: bold;
    margin-top: 10px;
  }

  .cover-branch {
    font-size: 12pt;
    font-weight: normal;
  }

  .cover-authors-box {
    margin-top: 25px;
    font-size: 12pt;
    line-height: 1.6;
  }

  .cover-authors-box .name {
    font-size: 13pt;
    font-weight: bold;
  }

  .cover-dept {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 30px;
    line-height: 1.4;
  }

  .cover-university {
    font-size: 13pt;
    font-weight: bold;
    margin-top: 15px;
    text-transform: uppercase;
  }

  .cover-location {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 5px;
  }

  .cover-date {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .msu-seal {
    width: 130px;
    height: 130px;
    margin: 20px auto;
  }

  /* Headings */
  h1.chapter-title {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 20px;
    margin-bottom: 30px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }

  h2 {
    font-size: 13pt;
    font-weight: bold;
    margin-top: 24px;
    margin-bottom: 12px;
    color: #000;
  }

  h3 {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 18px;
    margin-bottom: 8px;
    color: #222;
  }

  h4 {
    font-size: 12pt;
    font-style: italic;
    font-weight: bold;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  p {
    margin: 0 0 14px 0;
    text-indent: 0;
  }

  /* Table styling - Caption at TOP */
  .table-container {
    margin: 24px 0;
    page-break-inside: avoid;
  }

  .table-caption {
    font-size: 11pt;
    font-weight: bold;
    font-style: italic;
    margin-bottom: 8px;
    text-align: left;
  }

  table.academic-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    font-size: 10.5pt;
    line-height: 1.45;
  }

  table.academic-table th {
    border: 1px solid #444;
    background-color: #f2f4f8;
    padding: 8px 10px;
    font-weight: bold;
    text-align: left;
    color: #111;
  }

  table.academic-table td {
    border: 1px solid #666;
    padding: 7px 10px;
    vertical-align: top;
  }

  table.academic-table tr:nth-child(even) {
    background-color: #fafbfc;
  }

  /* Figure styling - Caption at BOTTOM */
  .figure-container {
    margin: 26px 0;
    text-align: center;
    page-break-inside: avoid;
  }

  .figure-caption {
    font-size: 11pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 10px;
    text-align: center;
  }

  .diagram-box {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 16px;
    background: #ffffff;
    display: inline-block;
    max-width: 100%;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }

  /* Code blocks & listings */
  pre, code {
    font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  }

  pre {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    padding: 12px 14px;
    font-size: 9.5pt;
    line-height: 1.4;
    overflow-x: auto;
    margin: 14px 0;
    page-break-inside: avoid;
  }

  p code, td code, li code {
    font-size: 10pt;
    background-color: #f1f5f9;
    padding: 2px 5px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
  }

  ul, ol {
    margin-top: 4px;
    margin-bottom: 14px;
    padding-left: 28px;
  }

  li {
    margin-bottom: 6px;
  }

  /* Certificate signatures */
  .cert-sign-container {
    display: flex;
    justify-content: space-between;
    margin-top: 80px;
    padding: 0 10px;
    font-size: 12pt;
  }

  .cert-sign-block {
    text-align: center;
    width: 240px;
  }

  .cert-sign-line {
    border-top: 1px solid #222;
    margin-bottom: 6px;
  }

  .cert-meta {
    margin-top: 60px;
    font-size: 12pt;
    line-height: 1.6;
  }

  /* UI Mockup card in chapter 5 */
  .ui-mockup-window {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);
    overflow: hidden;
    margin: 15px auto;
    text-align: left;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .ui-mockup-header {
    background: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ui-mockup-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .ui-mockup-body {
    padding: 16px 20px;
    font-size: 11pt;
    line-height: 1.45;
  }

  .badge-tag {
    display: inline-block;
    padding: 2px 7px;
    font-size: 9pt;
    font-weight: bold;
    border-radius: 4px;
    margin-right: 5px;
  }
</style>
"""
