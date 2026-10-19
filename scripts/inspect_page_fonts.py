import pymupdf

doc = pymupdf.open(r'C:\Users\rudra\.gemini\antigravity-ide\brain\2c7b1d28-fb78-4f4f-8a2d-a6d2d93288cc\.user_uploaded\media_1792422223873.pdf')
page1 = doc[0]
blocks = page1.get_text('dict')['blocks']
for b in blocks:
    if 'lines' in b:
        for l in b['lines']:
            for s in l['spans']:
                if s['text'].strip():
                    print(f"{s['text'][:35]:35} | size={s['size']:.1f} | font={s['font']} | origin={s['origin']}")
