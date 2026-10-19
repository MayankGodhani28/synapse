# -*- coding: utf-8 -*-
"""
Synapse Project Report Generator
Builds academic report matching MSU Baroda Guidelines and Demo PDF format.
"""

import os
import sys
import subprocess

REPORT_DIR = r"E:\synepse\reports"
os.makedirs(REPORT_DIR, exist_ok=True)

HTML_FILE = os.path.join(REPORT_DIR, "Synapse_Project_Report.html")
MD_FILE = os.path.join(REPORT_DIR, "Synapse_Project_Report.md")
PDF_FILE = os.path.join(REPORT_DIR, "Synapse_Project_Report.pdf")

print("Report generator framework ready.")
