import fs from 'fs';
import { staticTranslations, projectsDataEN, projectsDataES } from '../../data/translations.js';

function buildSeqSvg(steps, summaryText) {
  const nodeW = 90;
  const nodeH = 96;
  const gap = 12;
  const startX = 10;
  
  let nodesXml = '';
  let arrowsXml = '';
  
  steps.forEach((s, i) => {
    const [num, title, sub, proto, tag, col] = s;
    const nx = startX + i * (nodeW + gap);
    const ny = 18;
    
    nodesXml += `  <rect x="${nx}" y="${ny}" width="${nodeW}" height="${nodeH}" rx="6" fill="#111726" stroke="#334155" stroke-width="1" />\n`;
    nodesXml += `  <rect x="${nx + 8}" y="${ny + 8}" width="20" height="14" rx="3" fill="#1e293b" />\n`;
    nodesXml += `  <text x="${nx + 18}" y="${ny + 19}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8.5" font-weight="bold" fill="${col}">${num}</text>\n`;
    nodesXml += `  <text x="${nx + 8}" y="${ny + 38}" font-family="'Outfit', sans-serif" font-size="9" font-weight="600" fill="#f8fafc">${title}</text>\n`;
    nodesXml += `  <text x="${nx + 8}" y="${ny + 52}" font-family="'Outfit', sans-serif" font-size="7.5" fill="#94a3b8">${sub}</text>\n`;
    nodesXml += `  <text x="${nx + 8}" y="${ny + 70}" font-family="'JetBrains Mono', monospace" font-size="7" fill="${col}">${proto}</text>\n`;
    nodesXml += `  <text x="${nx + 8}" y="${ny + 84}" font-family="'JetBrains Mono', monospace" font-size="7" fill="#64748b">${tag}</text>\n`;
    
    if (i < steps.length - 1) {
      const ax1 = nx + nodeW;
      const ax2 = ax1 + gap;
      const ay = ny + Math.floor(nodeH / 2);
      arrowsXml += `  <line x1="${ax1}" y1="${ay}" x2="${ax2 - 3}" y2="${ay}" stroke="#475569" stroke-width="1.5" />\n`;
      arrowsXml += `  <polygon points="${ax2},${ay} ${ax2 - 4},${ay - 3} ${ax2 - 4},${ay + 3}" fill="#475569" />\n`;
    }
  });
  
  return `<svg viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="520" height="150" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1" />
${nodesXml}${arrowsXml}  <text x="260" y="136" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" fill="#64748b">${summaryText}</text>
</svg>`;
}

function buildStatsSvg(headerLeft, headerRight, kpis) {
  let cardsXml = '';
  const cardW = 110;
  const cardH = 86;
  const startX = 16;
  const gap = 14;
  
  kpis.forEach((k, i) => {
    const [val, label, sublabel, note, col] = k;
    const cx = startX + i * (cardW + gap);
    const cy = 34;
    cardsXml += `  <rect x="${cx}" y="${cy}" width="${cardW}" height="${cardH}" rx="6" fill="#111726" stroke="#334155" stroke-width="1" />\n`;
    cardsXml += `  <text x="${cx + cardW/2}" y="${cy + 18}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="8" fill="#94a3b8">${label}</text>\n`;
    cardsXml += `  <text x="${cx + cardW/2}" y="${cy + 42}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="15" font-weight="bold" fill="${col}">${val}</text>\n`;
    cardsXml += `  <text x="${cx + cardW/2}" y="${cy + 60}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="8" fill="#e2e8f0">${sublabel}</text>\n`;
    cardsXml += `  <text x="${cx + cardW/2}" y="${cy + 74}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7" fill="#64748b">${note}</text>\n`;
  });
  
  return `<svg viewBox="0 0 500 135" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="500" height="135" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1" />
  <text x="20" y="22" font-family="'JetBrains Mono', monospace" font-size="9" fill="#94a3b8" font-weight="bold">${headerLeft}</text>
  <text x="480" y="22" text-anchor="end" font-family="'Outfit', sans-serif" font-size="8" fill="#64748b">${headerRight}</text>
${cardsXml}</svg>`;
}

function buildResourceSvg(header, row1Label, base1W, base1Txt, opt1W, opt1Txt,
                          row2Label, base2W, base2Txt, opt2W, opt2Txt,
                          legendBase, legendOpt) {
  return `<svg viewBox="0 0 500 145" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="500" height="145" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1" />
  <text x="20" y="22" font-family="'JetBrains Mono', monospace" font-size="9" fill="#94a3b8" font-weight="bold">${header}</text>
  
  <!-- Row 1 -->
  <text x="20" y="44" font-family="'Outfit', sans-serif" font-size="8.5" fill="#cbd5e1">${row1Label}</text>
  <rect x="140" y="34" width="${base1W}" height="10" rx="3" fill="#334155" />
  <text x="480" y="43" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="8" fill="#94a3b8">${base1Txt}</text>
  <rect x="140" y="48" width="${opt1W}" height="10" rx="3" fill="#10b981" />
  <text x="480" y="57" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="8" fill="#10b981" font-weight="bold">${opt1Txt}</text>

  <!-- Row 2 -->
  <text x="20" y="88" font-family="'Outfit', sans-serif" font-size="8.5" fill="#cbd5e1">${row2Label}</text>
  <rect x="140" y="78" width="${base2W}" height="10" rx="3" fill="#334155" />
  <text x="480" y="87" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="8" fill="#94a3b8">${base2Txt}</text>
  <rect x="140" y="92" width="${opt2W}" height="10" rx="3" fill="#38bdf8" />
  <text x="480" y="101" text-anchor="end" font-family="'JetBrains Mono', monospace" font-size="8" fill="#38bdf8" font-weight="bold">${opt2Txt}</text>

  <!-- Legend -->
  <rect x="140" y="122" width="8" height="8" rx="2" fill="#334155" />
  <text x="154" y="129" font-family="'Outfit', sans-serif" font-size="7.5" fill="#94a3b8">${legendBase}</text>
  <rect x="290" y="122" width="8" height="8" rx="2" fill="#10b981" />
  <text x="304" y="129" font-family="'Outfit', sans-serif" font-size="7.5" fill="#10b981">${legendOpt}</text>
</svg>`;
}

console.log("Builders ready.");
