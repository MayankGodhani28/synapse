import os
import fitz
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register fonts
pdfmetrics.registerFont(TTFont('Poppins-Bold', 'e:/synepse/Poppins-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Poppins-Regular', 'e:/synepse/Poppins-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Lato-Bold', 'e:/synepse/Lato-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Lato-Regular', 'e:/synepse/Lato-Regular.ttf'))

PAGE_W, PAGE_H = 595.5, 842.25

def create_resume(output_pdf_path):
    c = canvas.Canvas(output_pdf_path, pagesize=(PAGE_W, PAGE_H))
    
    # Helper for coordinates: convert top-down y (0 at top) to reportlab y (0 at bottom)
    def y_coord(top_y):
        return PAGE_H - top_y

    # ==================== HEADER ====================
    # Name
    c.setFont('Poppins-Bold', 27.0)
    c.setFillColorRGB(0, 0, 0)
    c.drawString(32.8, y_coord(40.0), "Rudra Vadhadiya")

    # Contacts (Left)
    c.setFont('Poppins-Regular', 11.5)
    c.drawString(32.8, y_coord(58.0), "rudra.vadhadiya@gmail.com")
    c.drawString(32.8, y_coord(73.5), "+91 7984380591")
    c.drawString(32.8, y_coord(89.0), "Katch,Gujarat")

    # Links (Right)
    github_text = "GitHub Profile"
    linkedin_text = "LinkedIn Profile"
    gh_w = c.stringWidth(github_text, 'Poppins-Regular', 11.5)
    li_w = c.stringWidth(linkedin_text, 'Poppins-Regular', 11.5)
    
    right_margin = 562.0
    gh_x = right_margin - gh_w
    li_x = right_margin - li_w
    
    gh_y_top = 73.5
    li_y_top = 89.0
    
    # Draw GitHub link
    c.drawString(gh_x, y_coord(gh_y_top), github_text)
    c.setLineWidth(0.8)
    c.line(gh_x, y_coord(gh_y_top) - 1.5, gh_x + gh_w, y_coord(gh_y_top) - 1.5)
    c.linkURL("https://github.com/Rudra1404", (gh_x, y_coord(gh_y_top) - 3, gh_x + gh_w, y_coord(gh_y_top) + 11), relative=0)
    
    # Draw LinkedIn link
    c.drawString(li_x, y_coord(li_y_top), linkedin_text)
    c.line(li_x, y_coord(li_y_top) - 1.5, li_x + li_w, y_coord(li_y_top) - 1.5)
    c.linkURL("https://www.linkedin.com/in/rudra-vadhadiya-523b16289/", (li_x, y_coord(li_y_top) - 3, li_x + li_w, y_coord(li_y_top) + 11), relative=0)

    # ==================== TECHNICAL SKILLS ====================
    skills_bar_top = 117.0
    skills_title_top = 127.0
    c.setFont('Poppins-Bold', 12.4)
    c.drawString(56.7, y_coord(skills_title_top), "Technical Skills")

    skills_data = [
        ("Programming Languages", " : C , C++ , Java, Javascript , Python , Flutter"),
        ("Databases", " : MongoDB, MySQL"),
        ("Web Technologies", " : HTML5, CSS3, React.js, Node.js, Express.js"),
        ("Frameworks", " : Bootstrap , Tailwind CSS"),
        ("DevOps :", " Git, GitHub"),
        ("Data Science & ML :", " Numpy, Pandas, Matplotlib, Requests"),
        ("Technical Skills", " : Data Structures (DS), Design and Analysis of Algorithms (DAA)")
    ]

    cur_y = 143.0
    line_h = 16.0
    for label, val in skills_data:
        c.setFont('Lato-Bold', 11.2)
        c.drawString(56.7, y_coord(cur_y), label)
        w = c.stringWidth(label, 'Lato-Bold', 11.2)
        c.setFont('Lato-Regular', 11.2)
        c.drawString(56.7 + w, y_coord(cur_y), val)
        cur_y += line_h

    skills_bar_bottom = cur_y - 5.0
    # Left accent line for Technical Skills
    c.setLineWidth(2.25)
    c.setStrokeColorRGB(0, 0, 0)
    c.line(30.8, y_coord(skills_bar_top), 30.8, y_coord(skills_bar_bottom))

    # ==================== PROJECTS ====================
    cur_y += 12.0
    projects_bar_top = cur_y
    projects_title_top = cur_y + 11.0
    c.setFont('Poppins-Bold', 13.0)
    c.drawString(56.7, y_coord(projects_title_top), "Projects")

    cur_y = projects_title_top + 16.0
    text_width_max = 490.0

    def draw_wrapped_bullet(bullet_spans, y_start, bullet_x=60.8, text_x=71.5):
        # Flatten into words with font metadata
        words = []
        for text, font, size in bullet_spans:
            w_list = text.split(' ')
            for i, w in enumerate(w_list):
                if w:
                    words.append((w, font, size, i < len(w_list) - 1))
        
        # Word wrap
        lines = []
        cur_line = []
        cur_line_w = 0.0
        space_w = c.stringWidth(' ', 'Poppins-Regular', 9.0)
        
        for w, font, size, has_space in words:
            word_w = c.stringWidth(w, font, size)
            test_w = cur_line_w + (space_w if cur_line else 0) + word_w
            if test_w > text_width_max and cur_line:
                lines.append(cur_line)
                cur_line = [(w, font, size)]
                cur_line_w = word_w
            else:
                cur_line.append((w, font, size))
                cur_line_w = test_w
        if cur_line:
            lines.append(cur_line)
        
        # Draw bullet dot aligned with the center of the first line
        first_line_baseline = y_start + 7.5
        c.setFillColorRGB(0, 0, 0)
        c.circle(bullet_x + 1.5, y_coord(first_line_baseline - 2.8), 1.5, stroke=0, fill=1)

        # Render lines
        line_y = first_line_baseline
        for l in lines:
            line_x = text_x
            for w, font, size in l:
                c.setFont(font, size)
                c.drawString(line_x, y_coord(line_y), w)
                line_x += c.stringWidth(w, font, size) + space_w
            line_y += 13.0
        return line_y - 13.0 + 3.0

    # Project 1: Synapse
    c.setFont('Poppins-Bold', 11.0)
    c.drawString(56.7, y_coord(cur_y), "Synapse — AI Memory Layer & Context Retrieval Engine")
    cur_y += 13.5
    c.setFont('Poppins-Regular', 9.8)
    c.drawString(56.7, y_coord(cur_y), "Node.js, Express.js, PostgreSQL, pgvector, Docker, Chrome MV3, Transformers.js")
    cur_y += 5.0

    synapse_bullets = [
        [("Built a privacy-first AI memory layer and context engine with a", 'Poppins-Regular', 9.0),
         ("Chrome Manifest V3", 'Poppins-Bold', 9.0),
         ("extension to capture and parse web pages using", 'Poppins-Regular', 9.0),
         ("Mozilla Readability", 'Poppins-Bold', 9.0)],
        
        [("Engineered an on-device embedding pipeline with", 'Poppins-Regular', 9.0),
         ("all-MiniLM-L6-v2", 'Poppins-Bold', 9.0),
         ("generating 384-dimensional dense vectors locally without external API latency or subscriptions", 'Poppins-Regular', 9.0)],
        
        [("Architected a containerized", 'Poppins-Regular', 9.0),
         ("PostgreSQL + pgvector", 'Poppins-Bold', 9.0),
         ("database in Docker, indexing vectors with", 'Poppins-Regular', 9.0),
         ("IVFFlat", 'Poppins-Bold', 9.0),
         ("and cosine similarity for fast semantic retrieval", 'Poppins-Regular', 9.0)],
        
        [("Implemented an authenticated", 'Poppins-Regular', 9.0),
         ("Express.js REST API", 'Poppins-Bold', 9.0),
         ("with Bearer tokens and API keys, powering grounded", 'Poppins-Regular', 9.0),
         ("RAG", 'Poppins-Bold', 9.0),
         ("context retrieval with verified citations", 'Poppins-Regular', 9.0)]
    ]

    for b in synapse_bullets:
        cur_y = draw_wrapped_bullet(b, cur_y)
    
    cur_y += 10.0

    # Project 2: GeoChat
    c.setFont('Poppins-Bold', 11.0)
    c.drawString(56.7, y_coord(cur_y), "GeoChat — Geo-Based Ephemeral Chat Application")
    cur_y += 13.5
    c.setFont('Poppins-Regular', 9.8)
    c.drawString(56.7, y_coord(cur_y), "Flutter • Dart • Firebase Firestore • Firebase Auth • Cloud Functions • BLoC")
    cur_y += 5.0

    geochat_bullets = [
        [("Built a real-time, location-gated group chat app where users discover and join chat rooms within a 5 km radius using", 'Poppins-Regular', 9.0),
         ("Geohash", 'Poppins-Bold', 9.0),
         ("-based proximity queries on Cloud Firestore", 'Poppins-Regular', 9.0)],
        
        [("Implemented real-time message delivery via Firestore's", 'Poppins-Regular', 9.0),
         ("gRPC/WebSocket", 'Poppins-Bold', 9.0),
         ("listeners (.snapshots() stream), enabling push-based communication without polling or custom sockets", 'Poppins-Regular', 9.0)],
        
        [("Designed a self-destructing server architecture with 2-hour", 'Poppins-Regular', 9.0),
         ("TTL", 'Poppins-Bold', 9.0),
         ("enforced by scheduled Firebase Cloud Functions, with Firestore security rules preventing unauthorized deletions", 'Poppins-Regular', 9.0)],
        
        [("Architected the app using the", 'Poppins-Regular', 9.0),
         ("BLoC", 'Poppins-Bold', 9.0),
         ("state management pattern with clean separation of UI, business logic, and data layers; supported phone", 'Poppins-Regular', 9.0),
         ("OTP authentication via Firebase Auth", 'Poppins-Bold', 9.0)]
    ]

    for b in geochat_bullets:
        cur_y = draw_wrapped_bullet(b, cur_y)

    cur_y += 10.0

    # Project 3: Crop Disease Detection
    c.setFont('Poppins-Bold', 11.0)
    c.drawString(56.7, y_coord(cur_y), "Crop Disease Detection System — Smart India Hackathon (SIH)")
    cur_y += 13.5
    c.setFont('Poppins-Regular', 9.8)
    c.drawString(56.7, y_coord(cur_y), "Python, PyTorch, FastAPI, EfficientNet-B0, timm, Albumentations, OpenCV")
    cur_y += 5.0

    crop_bullets = [
        [("Developed an AI-powered REST API that detects crop diseases from leaf images with top-3 predictions and confidence scores using a fine-tuned EfficientNet-B0 model (ImageNet pretrained).", 'Poppins-Regular', 9.0)],
        [("Designed and integrated a disease-remedy knowledge base, delivering actionable treatment recommendations alongside each prediction.", 'Poppins-Regular', 9.0)],
        [("Built a FastAPI backend with Swagger UI documentation, supporting GPU-accelerated (CUDA) inference with automatic CPU fallback.", 'Poppins-Regular', 9.0)],
        [("Implemented a real-time training progress dashboard (HTML/JS) and custom data augmentation pipeline using Albumentations for improved model generalization.", 'Poppins-Regular', 9.0)]
    ]

    for b in crop_bullets:
        cur_y = draw_wrapped_bullet(b, cur_y)

    projects_bar_bottom = cur_y - 2.0
    c.setLineWidth(2.25)
    c.setStrokeColorRGB(0, 0, 0)
    c.line(30.8, y_coord(projects_bar_top), 30.8, y_coord(projects_bar_bottom))

    # ==================== EDUCATION ====================
    cur_y += 14.0
    edu_bar_top = cur_y
    edu_title_top = cur_y + 11.0
    c.setFont('Poppins-Bold', 12.0)
    c.drawString(57.5, y_coord(edu_title_top), "Education")

    cur_y = edu_title_top + 16.0
    c.setFont('Poppins-Bold', 9.0)
    c.drawString(57.5, y_coord(cur_y), "The Maharaja Sayajirao University of Baroda | | 2023-2027")
    cur_y += 12.5
    c.setFont('Poppins-Regular', 9.0)
    c.drawString(57.5, y_coord(cur_y), "Bachelor of Computer Science and Engineering")
    cur_y += 3.0

    cur_y = draw_wrapped_bullet([("GPA : 6.59", 'Poppins-Regular', 9.0)], cur_y)
    cur_y += 9.0

    c.setFont('Poppins-Bold', 9.0)
    c.drawString(56.8, y_coord(cur_y), "The BM Patel School | | 2023")
    cur_y += 12.5
    c.setFont('Poppins-Regular', 9.0)
    c.drawString(56.8, y_coord(cur_y), "Higher Secondary Certification (GSEB), Gujarat")
    cur_y += 3.0

    cur_y = draw_wrapped_bullet([("Percentile : 98.18 | ACPC Rank : 474", 'Poppins-Regular', 9.0)], cur_y)
    cur_y = draw_wrapped_bullet([("GUJCET : 107.50/ 120", 'Poppins-Regular', 9.0)], cur_y)

    edu_bar_bottom = cur_y
    c.setLineWidth(2.25)
    c.setStrokeColorRGB(0, 0, 0)
    c.line(30.8, y_coord(edu_bar_top), 30.8, y_coord(edu_bar_bottom))

    c.showPage()
    c.save()
    print("Resume successfully generated at:", output_pdf_path)
    print("Final bottom y:", cur_y, "Page height:", PAGE_H, "Margin remaining:", PAGE_H - cur_y)

if __name__ == '__main__':
    create_resume("e:/synepse/Rudra_Vadhadiya_Resume.pdf")
