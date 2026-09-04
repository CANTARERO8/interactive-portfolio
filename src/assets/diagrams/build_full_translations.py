import json
import os
import re

# Helper to load rendered blueprint SVGs
def load_svg(slug, lang):
    filepath = f"src/assets/diagrams/{slug}-{lang}.svg"
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read().strip()
    return ""

def escape_js(s):
    return s.replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n').replace('\r', '')

# Minimalist, formal SVG builders
def build_seq_svg(steps, summary_text):
    # steps is list of (number_str, title, subtitle, protocol_tag, timing_tag, color)
    # color: #38bdf8 (sky), #10b981 (emerald), #6366f1 (indigo), #fbbf24 (amber), #94a3b8 (slate)
    node_w = 90
    node_h = 96
    gap = 12
    start_x = 10
    
    nodes_xml = []
    arrows_xml = []
    
    for i, (num, title, sub, proto, tag, col) in enumerate(steps):
        nx = start_x + i * (node_w + gap)
        ny = 18
        
        # Node container
        nodes_xml.append(f'''  <rect x="{nx}" y="{ny}" width="{node_w}" height="{node_h}" rx="6" fill="#111726" stroke="#334155" stroke-width="1" />''')
        # Step pill
        nodes_xml.append(f'''  <rect x="{nx + 8}" y="{ny + 8}" width="20" height="14" rx="3" fill="#1e293b" />''')
        nodes_xml.append(f'''  <text x="{nx + 18}" y="{ny + 19}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="bold" fill="{col}">{num}</text>''')
        # Step title
        nodes_xml.append(f'''  <text x="{nx + 8}" y="{ny + 38}" font-family="'Outfit', sans-serif" font-size="9" font-weight="600" fill="#f8fafc">{title}</text>''')
        # Subtitle
        nodes_xml.append(f'''  <text x="{nx + 8}" y="{ny + 52}" font-family="'Outfit', sans-serif" font-size="7.5" fill="#94a3b8">{sub}</text>''')
        # Protocol tag
        nodes_xml.append(f'''  <text x="{nx + 8}" y="{ny + 70}" font-family="'JetBrains Mono', monospace" font-size="7" fill="{col}">{proto}</text>''')
        # Timing / status
        nodes_xml.append(f'''  <text x="{nx + 8}" y="{ny + 84}" font-family="'JetBrains Mono', monospace" font-size="7" fill="#64748b">{tag}</text>''')
        
        # Arrow to next node
        if i < len(steps) - 1:
            ax1 = nx + node_w
            ax2 = ax1 + gap
            ay = ny + (node_h // 2)
            arrows_xml.append(f'''  <line x1="{ax1}" y1="{ay}" x2="{ax2 - 3}" y2="{ay}" stroke="#475569" stroke-width="1.5" />''')
            arrows_xml.append(f'''  <polygon points="{ax2},{ay} {ax2 - 4},{ay - 3} {ax2 - 4},{ay + 3}" fill="#475569" />''')
            
    svg = f'''<svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="520" height="150" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1" />
{''.join(nodes_xml)}
{''.join(arrows_xml)}
  <text x="260" y="136" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" fill="#64748b">{summary_text}</text>
</svg>'''
    return svg

def build_stats_svg(header_left, header_right, kpis):
    # kpis is list of 4: (val, label, sublabel, note, col)
    cards_xml = []
    card_w = 110
    card_h = 86
    start_x = 16
    gap = 14
    
    for i, (val, label, sublabel, note, col) in enumerate(kpis):
        cx = start_x + i * (card_w + gap)
        cy = 34
        cards_xml.append(f'''  <rect x="{cx}" y="{cy}" width="{card_w}" height="{card_h}" rx="6" fill="#111726" stroke="#334155" stroke-width="1" />''')
        cards_xml.append(f'''  <text x="{cx + card_w//2}" y="{cy + 18}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="8" fill="#94a3b8">{label}</text>''')
        cards_xml.append(f'''  <text x="{cx + card_w//2}" y="{cy + 42}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="bold" fill="{col}">{val}</text>''')
        cards_xml.append(f'''  <text x="{cx + card_w//2}" y="{cy + 60}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="8" fill="#e2e8f0">{sublabel}</text>''')
        cards_xml.append(f'''  <text x="{cx + card_w//2}" y="{cy + 74}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7" fill="#64748b">{note}</text>''')
        
    svg = f'''<svg viewBox="0 0 500 135" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="500" height="135" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1" />
  <text x="20" y="22" font-family="'JetBrains Mono', monospace" font-size="9" fill="#94a3b8" font-weight="bold">{header_left}</text>
  <text x="480" y="22" text-anchor="end" font-family="'Outfit', sans-serif" font-size="8" fill="#64748b">{header_right}</text>
{''.join(cards_xml)}
</svg>'''
    return svg

def build_resource_svg(header, row1_label, base1_w, base1_txt, opt1_w, opt1_txt,
                       row2_label, base2_w, base2_txt, opt2_w, opt2_txt,
                       legend_base, legend_opt):
    svg = f'''<svg viewBox="0 0 500 145" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="500" height="145" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1" />
  <text x="20" y="22" font-family="'JetBrains Mono', monospace" font-size="9" fill="#94a3b8" font-weight="bold">{header}</text>
  
  <!-- Row 1 -->
  <text x="20" y="44" font-family="'Outfit', sans-serif" font-size="8.5" fill="#cbd5e1">{row1_label}</text>
  <rect x="140" y="34" width="{base1_w}" height="10" rx="3" fill="#334155" />
  <text x="480" y="43" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="8" fill="#94a3b8">{base1_txt}</text>
  <rect x="140" y="48" width="{opt1_w}" height="10" rx="3" fill="#10b981" />
  <text x="480" y="57" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="8" fill="#10b981" font-weight="bold">{opt1_txt}</text>

  <!-- Row 2 -->
  <text x="20" y="88" font-family="'Outfit', sans-serif" font-size="8.5" fill="#cbd5e1">{row2_label}</text>
  <rect x="140" y="78" width="{base2_w}" height="10" rx="3" fill="#334155" />
  <text x="480" y="87" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="8" fill="#94a3b8">{base2_txt}</text>
  <rect x="140" y="92" width="{opt2_w}" height="10" rx="3" fill="#38bdf8" />
  <text x="480" y="101" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="8" fill="#38bdf8" font-weight="bold">{opt2_txt}</text>

  <!-- Legend -->
  <rect x="140" y="122" width="8" height="8" rx="2" fill="#334155" />
  <text x="154" y="129" font-family="'Outfit', sans-serif" font-size="7.5" fill="#94a3b8">{legend_base}</text>
  <rect x="290" y="122" width="8" height="8" rx="2" fill="#10b981" />
  <text x="304" y="129" font-family="'Outfit', sans-serif" font-size="7.5" fill="#10b981">{legend_opt}</text>
</svg>'''
    return svg

print("SVG builders compiled.")
