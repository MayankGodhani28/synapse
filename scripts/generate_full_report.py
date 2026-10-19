# -*- coding: utf-8 -*-
"""
Main Generator for Synapse Minor Project Report.
Produces HTML, Markdown, and PDF matching MSU Baroda requirements.
"""

import os
import sys
import subprocess

# Add report_modules to sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODULES_DIR = os.path.join(SCRIPT_DIR, "report_modules")
if MODULES_DIR not in sys.path:
    sys.path.insert(0, MODULES_DIR)

from styles import CSS_STYLES
from preliminary import get_preliminary_html
from chapter1 import get_chapter1_html
from chapter2 import get_chapter2_html
from chapter3 import get_chapter3_html
from chapter4 import get_chapter4_html
from chapter5 import get_chapter5_html
from chapter6_and_appendix import get_chapter6_and_appendix_html
from full_markdown import get_full_markdown

REPORT_DIR = r"E:\synepse\reports"
os.makedirs(REPORT_DIR, exist_ok=True)

HTML_FILE = os.path.join(REPORT_DIR, "Synapse_Project_Report.html")
MD_FILE = os.path.join(REPORT_DIR, "Synapse_Project_Report.md")
PDF_FILE = os.path.join(REPORT_DIR, "Synapse_Project_Report.pdf")

def build_full_html():
    full_html = [
        "<!DOCTYPE html>",
        "<html lang='en-GB'>",
        "<head>",
        "<meta charset='UTF-8'>",
        "<title>Synapse — Minor Project Report (MSU Baroda)</title>",
        CSS_STYLES,
        "</head>",
        "<body>",
        get_preliminary_html(),
        get_chapter1_html(),
        get_chapter2_html(),
        get_chapter3_html(),
        get_chapter4_html(),
        get_chapter5_html(),
        get_chapter6_and_appendix_html(),
        "</body>",
        "</html>"
    ]
    return "\n".join(full_html)

def build_markdown_summary():
    return get_full_markdown()

def main():
    print("[1/3] Generating HTML Report...")
    html_content = build_full_html()
    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"HTML Report generated at: {HTML_FILE} ({len(html_content)} bytes)")

    print("[2/3] Generating Markdown Report...")
    md_content = build_markdown_summary()
    with open(MD_FILE, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Markdown Report generated at: {MD_FILE}")

    print("[3/3] Compiling PDF via Chrome Headless...")
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_FILE}",
        f"file:///{HTML_FILE.replace(os.sep, '/')}"
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(PDF_FILE):
        pdf_size = os.path.getsize(PDF_FILE)
        print(f"PDF Successfully Compiled: {PDF_FILE} ({pdf_size} bytes)")
    else:
        print("PDF compilation error:", res.stderr)

if __name__ == "__main__":
    main()
