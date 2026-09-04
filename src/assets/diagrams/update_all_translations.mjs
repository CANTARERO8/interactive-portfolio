import fs from 'fs';
import path from 'path';
import { staticTranslations, projectsDataEN, projectsDataES } from '../../data/translations.js';

// Clean text helper: removes all // and 🔍
function cleanText(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\/\//g, '—').replace(/🔍/g, '').trim();
}

// 1. Update staticTranslations
staticTranslations.en["drawer.map_title"] = "SYSTEM ARCHITECTURE BLUEPRINT";
staticTranslations.en["drawer.map_tab"] = "SYSTEM BLUEPRINT";
staticTranslations.en["drawer.diagram_expand"] = "[ EXPAND HD BLUEPRINT ]";
staticTranslations.en["drawer.diagram_download"] = "[ ⬇ DOWNLOAD BLUEPRINT ]";
staticTranslations.en["drawer.modal_badge"] = "SYSTEM ARCHITECTURE BLUEPRINT";

staticTranslations.es["drawer.map_title"] = "PLANO DE ARQUITECTURA DEL SISTEMA";
staticTranslations.es["drawer.map_tab"] = "PLANO DEL SISTEMA";
staticTranslations.es["drawer.diagram_expand"] = "[ EXPANDIR PLANO HD ]";
staticTranslations.es["drawer.diagram_download"] = "[ ⬇ DESCARGAR PLANO ]";
staticTranslations.es["drawer.modal_badge"] = "PLANO DE ARQUITECTURA DEL SISTEMA";

for (const lang of ['en', 'es']) {
  for (const k of Object.keys(staticTranslations[lang])) {
    staticTranslations[lang][k] = cleanText(staticTranslations[lang][k]);
  }
}

// Builders for formal minimalist decorative SVGs
function buildSeqSvg(steps, summaryText) {
  const nodeW = 92;
  const nodeH = 102;
  const gap = 12;
  const startX = 6;
  
  let nodesXml = '';
  let arrowsXml = '';
  
  steps.forEach((s, i) => {
    const [num, title, sub, proto, tag, col] = s;
    const nx = startX + i * (nodeW + gap);
    const cx = nx + Math.floor(nodeW / 2);
    const ny = 14;
    
    // Card frame
    nodesXml += `  <rect x="${nx}" y="${ny}" width="${nodeW}" height="${nodeH}" rx="6" fill="#111726" stroke="#334155" stroke-width="1" />
`;
    
    // Step badge - centered
    nodesXml += `  <rect x="${cx - 13}" y="${ny + 6}" width="26" height="14" rx="3" fill="#1e293b" stroke="#334155" stroke-width="0.75" />
`;
    nodesXml += `  <text x="${cx}" y="${ny + 16.5}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" font-weight="bold" fill="${col}">${num}</text>
`;
    
    // Step Title - centered
    nodesXml += `  <text x="${cx}" y="${ny + 33}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="8.5" font-weight="700" fill="#f8fafc">${title}</text>
`;
    
    // Subtitle - centered, supports multi-line
    const subLines = sub.split(String.fromCharCode(10));
    if (subLines.length >= 2) {
      nodesXml += `  <text x="${cx}" y="${ny + 46}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="7" fill="#94a3b8">${subLines[0]}</text>
`;
      nodesXml += `  <text x="${cx}" y="${ny + 56}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="7" fill="#94a3b8">${subLines[1]}</text>
`;
    } else {
      nodesXml += `  <text x="${cx}" y="${ny + 50}" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="7.5" fill="#94a3b8">${sub}</text>
`;
    }
    
    // Protocol capsule - centered
    nodesXml += `  <rect x="${cx - 40}" y="${ny + 67}" width="80" height="13" rx="3" fill="#0f172a" stroke="${col}44" stroke-width="0.75" />
`;
    nodesXml += `  <text x="${cx}" y="${ny + 76.5}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="6.5" font-weight="600" fill="${col}">${proto}</text>
`;
    
    // Timing / tag - centered
    nodesXml += `  <text x="${cx}" y="${ny + 93}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="7" fill="#64748b">${tag}</text>
`;
    
    // Connector arrow
    if (i < steps.length - 1) {
      const ax1 = nx + nodeW;
      const ax2 = ax1 + gap;
      const ay = ny + 51;
      arrowsXml += `  <line x1="${ax1}" y1="${ay}" x2="${ax2 - 3}" y2="${ay}" stroke="#475569" stroke-width="1.5" />
`;
      arrowsXml += `  <polygon points="${ax2},${ay} ${ax2 - 4},${ay - 3} ${ax2 - 4},${ay + 3}" fill="#475569" />
`;
    }
  });
  
  return `<svg viewBox="0 0 520 152" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="520" height="152" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1" />
${nodesXml}${arrowsXml}  <text x="260" y="139" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="8" fill="#64748b">${summaryText}</text>
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
  // Scale bar widths so max width is 115px (bars stay strictly in x=140..255)
  const scale = 115 / 240;
  const b1 = Math.round(Math.min(base1W * scale, 115));
  const o1 = Math.round(Math.max(opt1W * scale, 8));
  const b2 = Math.round(Math.min(base2W * scale, 115));
  const o2 = Math.round(Math.max(opt2W * scale, 8));

  return `<svg viewBox="0 0 500 145" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="500" height="145" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1" />
  <text x="20" y="20" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#94a3b8" font-weight="bold">${header}</text>
  
  <!-- Row 1: Label (Col 1), Bars (Col 2), Values (Col 3) -->
  <text x="20" y="48" font-family="'Outfit', sans-serif" font-size="8" font-weight="600" fill="#cbd5e1">${row1Label}</text>
  <rect x="140" y="39" width="${b1}" height="8" rx="2" fill="#334155" />
  <text x="270" y="46" font-family="'JetBrains Mono', monospace" font-size="7.5" fill="#94a3b8">${base1Txt}</text>
  <rect x="140" y="51" width="${o1}" height="8" rx="2" fill="#10b981" />
  <text x="270" y="58" font-family="'JetBrains Mono', monospace" font-size="7.5" fill="#10b981" font-weight="bold">${opt1Txt}</text>

  <!-- Divider -->
  <line x1="20" y1="68" x2="480" y2="68" stroke="#1e293b" stroke-dasharray="3 3" stroke-width="1" />

  <!-- Row 2: Label (Col 1), Bars (Col 2), Values (Col 3) -->
  <text x="20" y="88" font-family="'Outfit', sans-serif" font-size="8" font-weight="600" fill="#cbd5e1">${row2Label}</text>
  <rect x="140" y="79" width="${b2}" height="8" rx="2" fill="#334155" />
  <text x="270" y="86" font-family="'JetBrains Mono', monospace" font-size="7.5" fill="#94a3b8">${base2Txt}</text>
  <rect x="140" y="91" width="${o2}" height="8" rx="2" fill="#38bdf8" />
  <text x="270" y="98" font-family="'JetBrains Mono', monospace" font-size="7.5" fill="#38bdf8" font-weight="bold">${opt2Txt}</text>

  <!-- Legend: Centered -->
  <rect x="150" y="122" width="8" height="8" rx="2" fill="#334155" />
  <text x="164" y="129" font-family="'Outfit', sans-serif" font-size="7.5" fill="#94a3b8">${legendBase}</text>
  <rect x="300" y="122" width="8" height="8" rx="2" fill="#10b981" />
  <text x="314" y="129" font-family="'Outfit', sans-serif" font-size="7.5" fill="#10b981">${legendOpt}</text>
</svg>`;
}

// Project specific configurations
const projectConfigs = {
  "01": {
    slug: "01-elite-performance",
    en: {
      seq: [
        ["01", "Sensor Ingest", "Whoop / Garmin\nBLE Sync", "BLE / HealthKit", "< 10ms", "#38bdf8"],
        ["02", "Express API", "Zod Schema\nValidation", "HTTP POST / TLS", "< 12ms", "#38bdf8"],
        ["03", "Supabase Vault", "Biometric\nTimeseries", "Row Security RLS", "< 4ms", "#10b981"],
        ["04", "Gemini AI Core", "Athletic Load\nAnalysis", "Gemini 2.5 Flash", "320ms", "#6366f1"],
        ["05", "React 19 UI", "Concurrent\nDashboard", "startTransition", "60 FPS", "#fbbf24"]
      ],
      seqSummary: "Continuous biometric telemetry ingestion into Supabase RLS vault with Gemini AI coaching",
      stats: [
        ["< 12ms", "API GATEWAY", "Zod & Rate Limiter", "P99 Response", "#38bdf8"],
        ["< 4ms", "SUPABASE RLS", "Timeseries Upsert", "RLS Exclusivo", "#10b981"],
        ["320ms", "GEMINI AI", "Athletic Insights", "Stream Tokens", "#6366f1"],
        ["60 FPS", "REACT 19 UI", "Motion Hardware", "Zero Frame Drop", "#fbbf24"]
      ],
      statsLeft: "[TELEMETRY BENCHMARK — ELITE PERFORMANCE]",
      statsRight: "High-Frequency Stream @ 500 req/s",
      resHeader: "[CSS ENGINE & HYDRATION FOOTPRINT]",
      resRow1: "CSS BUNDLE WEIGHT",
      resB1W: 240, resB1Txt: "320 KB (v3 + PostCSS)",
      resO1W: 22, resO1Txt: "18 KB (Rust Engine v4)",
      resRow2: "CLIENT HYDRATION",
      resB2W: 210, resB2Txt: "145ms (Legacy React)",
      resO2W: 20, resO2Txt: "8ms (React 19 Concurrent)",
      legendBase: "Baseline Architecture",
      legendOpt: "Optimized Production"
    },
    es: {
      seq: [
        ["01", "Sincro Sensores", "Whoop y Garmin\nSincro BLE", "BLE / HealthKit", "< 10ms", "#38bdf8"],
        ["02", "Pasarela Express", "Validador\nde Esquemas", "HTTP POST / TLS", "< 12ms", "#38bdf8"],
        ["03", "Bóveda Supabase", "Series\nTemporales", "Row Security RLS", "< 4ms", "#10b981"],
        ["04", "Núcleo Gemini IA", "Análisis Carga\nde Atleta", "Gemini 2.5 Flash", "320ms", "#6366f1"],
        ["05", "Cliente React 19", "Panel Concurrente\nReact 19", "startTransition", "60 FPS", "#fbbf24"]
      ],
      seqSummary: "Ingesta continua de telemetría biométrica en Supabase RLS con coaching inteligente Gemini",
      stats: [
        ["< 12ms", "PASARELA API", "Zod y Rate Limiter", "Respuesta P99", "#38bdf8"],
        ["< 4ms", "BÓVEDA RLS", "Ingesta Temporal", "Modo Exclusivo", "#10b981"],
        ["320ms", "GEMINI IA", "Análisis Carga\nde Atleta", "Flujo Tokens", "#6366f1"],
        ["60 FPS", "PANEL REACT", "Aceleración GPU", "Cero Retardo", "#fbbf24"]
      ],
      statsLeft: "[BENCHMARK DE TELEMETRÍA — ELITE PERFORMANCE]",
      statsRight: "Flujo de Alta Frecuencia @ 500 req/s",
      resHeader: "[HUELLA DE MOTOR CSS E HIDRATACIÓN]",
      resRow1: "PESO CSS BUNDLE",
      resB1W: 240, resB1Txt: "320 KB (v3 + PostCSS)",
      resO1W: 22, resO1Txt: "18 KB (Motor Rust v4)",
      resRow2: "TIEMPO HIDRATACIÓN",
      resB2W: 210, resB2Txt: "145ms (React Anterior)",
      resO2W: 20, resO2Txt: "8ms (React 19 Concurrente)",
      legendBase: "Arquitectura Base",
      legendOpt: "Producción Optimizada"
    }
  },
  "02": {
    slug: "02-banco-de-sangre",
    en: {
      seq: [
        ["01", "ER Request", "Emergency O-\nBlood Demand", "Portal Hospital", "Priority STAT", "#38bdf8"],
        ["02", "Nginx Gateway", "TLS 1.3 & Rate\nLimiter SNI", "Strict SNI Proxy", "< 2ms", "#38bdf8"],
        ["03", "Laravel Service", "Blood Bank\nDomain Core", "Repository Pattern", "6ms", "#6366f1"],
        ["04", "PostgreSQL ACID", "SERIALIZABLE\nRow Lock", "FOR UPDATE NOWAIT", "< 0.1ms", "#10b981"],
        ["05", "Redis Queue", "Cold Chain\nNotification", "Async Dispatch", "0.8ms", "#fbbf24"]
      ],
      seqSummary: "Race-condition free emergency blood allocation pipeline with cold chain auditability",
      stats: [
        ["< 0.1ms", "LOCK ACQUISITION", "FOR UPDATE NOWAIT", "Zero Contention", "#10b981"],
        ["1.4ms", "INVENTORY COMMIT", "Cold Chain Record", "ACID Transaction", "#38bdf8"],
        ["0.8ms", "REDIS QUEUE", "Async Worker Push", "Non-Blocking", "#6366f1"],
        ["0%", "RACE CONDITIONS", "Simultaneous Orders", "Guaranteed", "#fbbf24"]
      ],
      statsLeft: "[TRANSACTION LATENCY — BANCO DE SANGRE]",
      statsRight: "Multi-Clinic Concurrency Peak @ 200 req/s",
      resHeader: "[DB LOCK CONTENTION & WORKER UTILIZATION]",
      resRow1: "LOCK WAIT TIME",
      resB1W: 220, resB1Txt: "120ms (Read Committed, 14 deadlocks)",
      resO1W: 15, resO1Txt: "0.1ms (SERIALIZABLE + NOWAIT, 0 deadlocks)",
      resRow2: "SERVER CPU LOAD",
      resB2W: 210, resB2Txt: "92% (Synchronous Notifications)",
      resO2W: 32, resO2Txt: "14% (Redis Worker Offloading)",
      legendBase: "Legacy Transaction",
      legendOpt: "Optimized SERIALIZABLE"
    },
    es: {
      seq: [
        ["01", "Demanda Clínica", "Demanda Urgente\nHemoderivados", "Portal Hospital", "Emergencia", "#38bdf8"],
        ["02", "Pasarela Nginx", "Proxy Inverso\nSSL Estricto", "TLS 1.3 Estricto", "< 2ms", "#38bdf8"],
        ["03", "Servicio Laravel", "Dominio Sangre\ny Derivados", "Patrón Repository", "6ms", "#6366f1"],
        ["04", "PostgreSQL ACID", "SERIALIZABLE\nRow Lock", "FOR UPDATE NOWAIT", "< 0.1ms", "#10b981"],
        ["05", "Colas Redis", "Alerta Cadena\nde Frío", "Worker Asíncrono", "0.8ms", "#fbbf24"]
      ],
      seqSummary: "Asignación de hemoderivados sin colisiones con auditoría térmica de crioconservación",
      stats: [
        ["< 0.1ms", "BLOQUEO FILA", "FOR UPDATE NOWAIT", "Cero Esperas", "#10b981"],
        ["1.4ms", "ESCRITURA ACID", "Registro Térmico", "Commit Atómico", "#38bdf8"],
        ["0.8ms", "COLA REDIS", "Despacho Asíncrono", "Hilo Libre", "#6366f1"],
        ["0%", "COLISIÓN STOCK", "Pedidos Simultáneos", "Garantizado", "#fbbf24"]
      ],
      statsLeft: "[LATENCIA TRANSACCIONAL — BANCO DE SANGRE]",
      statsRight: "Pico Multi-Clínica @ 200 req/s",
      resHeader: "[ESPERA DE BLOQUEOS Y CONSUMO DE CPU]",
      resRow1: "ESPERA DE BLOQUEO",
      resB1W: 220, resB1Txt: "120ms (Read Committed, 14 bloqueos)",
      resO1W: 15, resO1Txt: "0.1ms (SERIALIZABLE + NOWAIT, 0 bloqueos)",
      resRow2: "USO DE CPU SERVIDOR",
      resB2W: 210, resB2Txt: "92% (Notificación Síncrona)",
      resO2W: 32, resO2Txt: "14% (Workers Asíncronos Redis)",
      legendBase: "Transacción Tradicional",
      legendOpt: "SERIALIZABLE Optimizado"
    }
  },
  "03": {
    slug: "03-ad2n-cloud",
    en: {
      seq: [
        ["01", "Edge Access", "Anycast DNS\n& Edge WAF", "Cloudflare Perimeter", "TLS 1.3", "#38bdf8"],
        ["02", "FortiGate NGFW", "DPI & IPS\nPacket Filter", "Fortinet Perimeter", "0.8ms", "#38bdf8"],
        ["03", "VMware DRS", "vSphere DRS\nCluster Load", "ESXi HA Hypervisor", "0.3ms", "#10b981"],
        ["04", "NVMe SAN", "High-IOPS\nFlash Tier", "NVMe over Fabrics", "0.15ms", "#6366f1"],
        ["05", "Veeam Vault", "Immutable Tier\n3-2-1 Backup", "Air-Gapped Storage", "Verified", "#fbbf24"]
      ],
      seqSummary: "Enterprise infrastructure deployment with active NGFW filtering and immutable backup",
      stats: [
        ["4ms", "EDGE HANDSHAKE", "Cloudflare Anycast", "Strict SNI", "#38bdf8"],
        ["0.8ms", "NGFW FILTER", "FortiGate Packet Check", "IPS Active", "#10b981"],
        ["0.15ms", "NVMe SAN I/O", "All-Flash Data Store", "Sub-ms Latency", "#6366f1"],
        ["99.99%", "SYSTEM UPTIME", "VMware HA Failover", "SLA Certified", "#fbbf24"]
      ],
      statsLeft: "[INFRASTRUCTURE LATENCY & AVAILABILITY]",
      statsRight: "Enterprise SLA Benchmark Audit",
      resHeader: "[FAILOVER RECOVERY TIME & STORAGE DEDUPLICATION]",
      resRow1: "FAILOVER RTO",
      resB1W: 240, resB1Txt: "45 min (Manual Node Recovery)",
      resO1W: 12, resO1Txt: "1.2 sec (Automated vSphere HA)",
      resRow2: "BACKUP FOOTPRINT",
      resB2W: 220, resB2Txt: "18 TB (Raw VM Snapshots)",
      resO2W: 40, resO2Txt: "3.2 TB (Veeam Deduplicated Tier)",
      legendBase: "Manual Infrastructure",
      legendOpt: "Automated HA + Veeam"
    },
    es: {
      seq: [
        ["01", "Acceso Edge", "DNS Anycast\ny WAF Edge", "Perímetro Cloudflare", "TLS 1.3", "#38bdf8"],
        ["02", "FortiGate NGFW", "Filtrado DPI\ne IPS Fortinet", "Perímetro Fortinet", "0.8ms", "#38bdf8"],
        ["03", "Clúster VMware", "Balanceo DRS\nClúster VM", "Hipervisor ESXi HA", "0.3ms", "#10b981"],
        ["04", "Almacén NVMe", "Data Store\nNVMe All-Flash", "NVMe over Fabrics", "0.15ms", "#6366f1"],
        ["05", "Bóveda Veeam", "Respaldo Seguro\n3-2-1 Inmutable", "Aislado Físico", "Verificado", "#fbbf24"]
      ],
      seqSummary: "Infraestructura cloud empresarial con inspección perimetral NGFW y respaldo inmutable",
      stats: [
        ["4ms", "HANDSHAKE EDGE", "Cloudflare Anycast", "SNI Estricto", "#38bdf8"],
        ["0.8ms", "FILTRO NGFW", "Inspección FortiGate", "IPS Activo", "#10b981"],
        ["0.15ms", "I/O SAN NVMe", "Data Store\nNVMe All-Flash", "Sub-milisegundo", "#6366f1"],
        ["99.99%", "DISPONIBILIDAD", "Clúster Alta Disp.", "Certificado SLA", "#fbbf24"]
      ],
      statsLeft: "[LATENCIA Y DISPONIBILIDAD DE INFRAESTRUCTURA]",
      statsRight: "Auditoría de Certificación SLA",
      resHeader: "[TIEMPO DE RECUPERACIÓN Y ALMACENAMIENTO]",
      resRow1: "RECUPERACIÓN RTO",
      resB1W: 240, resB1Txt: "45 min (Conmutación Manual)",
      resO1W: 12, resO1Txt: "1.2 seg (vSphere HA Automatizado)",
      resRow2: "PESO DE RESPALDOS",
      resB2W: 220, resB2Txt: "18 TB (Snapshots Crudos VM)",
      resO2W: 40, resO2Txt: "3.2 TB (Tier Deduplicado Veeam)",
      legendBase: "Infraestructura Manual",
      legendOpt: "Alta Disp. + Veeam"
    }
  },
  "04": {
    slug: "04-capital-marketing",
    en: {
      seq: [
        ["01", "Client Landing", "Hero Paint &\nLenis Init", "Inertial Smooth Scroll", "60 FPS", "#38bdf8"],
        ["02", "SPA Router", "Zero Page Reload\nRoute Switch", "History API / Modular", "< 4ms", "#38bdf8"],
        ["03", "Three.js Load", "Lazy Showroom\n3D Assets", "GLTFLoader Intersection", "28ms", "#6366f1"],
        ["04", "WebGL Loop", "PBR Materials\n& Shaders", "60 FPS RAF Dispatch", "16.6ms", "#10b981"],
        ["05", "Async Contact", "PHP 8 API &\nLead Concierge", "PHPMailer / AI Dispatch", "180ms", "#fbbf24"]
      ],
      seqSummary: "Modular Vanilla JS SPA with on-demand Three.js WebGL showroom and async lead concierge",
      stats: [
        ["< 4ms", "SPA ROUTE SWITCH", "Zero Page Reload", "Instant DOM Swap", "#38bdf8"],
        ["28ms", "3D ASSET INIT", "Lazy GLTF Loading", "Draco Geometry", "#10b981"],
        ["60 FPS", "CANVAS DRAW LOOP", "Three.js RAF Budget", "Hardware Locked", "#6366f1"],
        ["180ms", "LEAD DISPATCH", "PHP 8 PHPMailer", "Async Concierge", "#fbbf24"]
      ],
      statsLeft: "[SPA NAVIGATION & 3D RENDERING BENCHMARK]",
      statsRight: "Smooth Inertial Scroll & WebGL Test",
      resHeader: "[SPA NAVIGATION OVERHEAD & VRAM FOOTPRINT]",
      resRow1: "PAGE SWITCH TIME",
      resB1W: 240, resB1Txt: "1.8s (Full MPA Reload, 1.4 MB)",
      resO1W: 16, resO1Txt: "4ms (Modular SPA, 0 KB transfer)",
      resRow2: "GPU VRAM USAGE",
      resB2W: 220, resB2Txt: "185 MB (Eager 3D Model Loading)",
      resO2W: 34, resO2Txt: "24 MB (Intersection Lazy Load)",
      legendBase: "Traditional Website",
      legendOpt: "Modular SPA + Lazy WebGL"
    },
    es: {
      seq: [
        ["01", "Carga Portada", "Pintado Inicial\ny Lenis Init", "Desplazamiento Inercial", "60 FPS", "#38bdf8"],
        ["02", "Router SPA", "Cambio de Ruta\nsin Recarga", "History API Modular", "< 4ms", "#38bdf8"],
        ["03", "Carga 3D", "Recursos 3D\nBajo Demanda", "Intersección en Scroll", "28ms", "#6366f1"],
        ["04", "Bucle WebGL", "Shaders PBR\ny Cámara 3D", "Despacho rAF a 60 FPS", "16.6ms", "#10b981"],
        ["05", "Contacto Async", "API PHP 8 y\nConserje Leads", "Despacho PHPMailer / IA", "180ms", "#fbbf24"]
      ],
      seqSummary: "SPA modular en Vanilla JS con visor WebGL 3D bajo demanda y conserje de leads asíncrono",
      stats: [
        ["< 4ms", "CAMBIO RUTA SPA", "Cero Recarga de Página", "Plantilla en Memoria", "#38bdf8"],
        ["28ms", "INICIALIZACIÓN 3D", "Carga Lazy GLTF", "Geometría Draco", "#10b981"],
        ["60 FPS", "CUADROS WEBGL", "Presupuesto rAF 16ms", "Aceleración GPU", "#6366f1"],
        ["180ms", "DESPACHO LEADS", "PHP 8 PHPMailer", "Concierge Asíncrono", "#fbbf24"]
      ],
      statsLeft: "[NAVEGACIÓN SPA Y RENDIMIENTO 3D]",
      statsRight: "Prueba de Desplazamiento Inercial y WebGL",
      resHeader: "[SOBRECARGA DE NAVEGACIÓN Y CONSUMO DE VRAM]",
      resRow1: "TIEMPO NAVEGACIÓN",
      resB1W: 240, resB1Txt: "1.8s (Recarga Completa, 1.4 MB)",
      resO1W: 16, resO1Txt: "4ms (SPA Modular, 0 KB descarga)",
      resRow2: "CONSUMO VRAM GPU",
      resB2W: 220, resB2Txt: "185 MB (Carga Anticipada 3D)",
      resO2W: 34, resO2Txt: "24 MB (Carga Lazy al Scroll)",
      legendBase: "Sitio Web Tradicional",
      legendOpt: "SPA Modular + WebGL Lazy"
    }
  },
  "05": {
    slug: "05-julie",
    en: {
      seq: [
        ["01", "Rolling Preload", "0% to 100%\nrAF Counter", "rAF Easing Engine", "2.2s", "#38bdf8"],
        ["02", "GSAP Reveal", "Multi-Layer\nPanel Reveal", "Timeline Stagger", "< 1ms", "#38bdf8"],
        ["03", "Particle WebGL", "12,000 Points\nParticle Swarm", "Custom GLSL Repulsion", "2.1ms", "#6366f1"],
        ["04", "Web Audio", "Ambient Pad\nAudioContext", "AudioContext Nodes", "1.2ms", "#10b981"],
        ["05", "Kinetic Scroll", "SplitType\nLetter Stagger", "Lenis Inertial Track", "60 FPS", "#fbbf24"]
      ],
      seqSummary: "Luxury editorial showcase with zero-FOUC preloader, WebGL particles, and ambient sound",
      stats: [
        ["2.1ms", "GPU SWARM COMPUTE", "12,000 Particles", "GLSL Vertex Shader", "#38bdf8"],
        ["0.4ms", "GSAP MATRIX CALC", "SplitType Stagger", "Zero Layout Thrash", "#10b981"],
        ["1.2ms", "AUDIO LATENCY", "Procedural Ambient Node", "Web Audio Engine", "#6366f1"],
        ["0.000", "LAYOUT SHIFT (CLS)", "Predictive Preload", "Solid Layout", "#fbbf24"]
      ],
      statsLeft: "[CREATIVE WEBGL & CINEMATIC GSAP TELEMETRY]",
      statsRight: "Lighthouse 100 Performance Audit",
      resHeader: "[PARTICLE RENDERING FPS & AUDIO ASSET MEMORY]",
      resRow1: "PARTICLE RENDER FPS",
      resB1W: 160, resB1Txt: "18 FPS (DOM Canvas 2D, 85% CPU)",
      resO1W: 230, resO1Txt: "60 FPS (Three.js Instanced, 9% CPU)",
      resRow2: "AUDIO MEMORY USAGE",
      resB2W: 220, resB2Txt: "48 MB (Uncompressed WAV Files)",
      resO2W: 14, resO2Txt: "12 KB (Procedural AudioContext Nodes)",
      legendBase: "Standard Media Implementation",
      legendOpt: "Hardware-Accelerated Architecture"
    },
    es: {
      seq: [
        ["01", "Precarga Fluida", "Contador 0-100%\nPrecisión rAF", "Suavizado rAF Preciso", "2.2s", "#38bdf8"],
        ["02", "Revelado GSAP", "Paneles GSAP\nEscalonados", "Línea de Tiempo Fluida", "< 1ms", "#38bdf8"],
        ["03", "Nube WebGL", "12,000 Puntos\nShaders GLSL", "Shaders GLSL de Repulsión", "2.1ms", "#6366f1"],
        ["04", "Audio Web", "Frecuencia Web\nAudioContext", "Nodos AudioContext", "1.2ms", "#10b981"],
        ["05", "Tipografía Split\ny Lenis Scroll", "Animación Letra a Letra", "Desplazamiento Lenis", "60 FPS", "#fbbf24"]
      ],
      seqSummary: "Showcase editorial de lujo con precargador sin FOUC, partículas WebGL y audio procedural",
      stats: [
        ["2.1ms", "CÁLCULO GPU NUBE", "12,000 Puntos\nShaders GLSL", "Shader Vértices GLSL", "#38bdf8"],
        ["0.4ms", "MATRIZ GSAP", "Escalonado SplitType", "Cero Retardo DOM", "#10b981"],
        ["1.2ms", "LATENCIA AUDIO", "Nodos Sintetizados", "Motor Web Audio", "#6366f1"],
        ["0.000", "DESPLAZAMIENTO CLS", "Precarga Predictiva", "Diseño Estable", "#fbbf24"]
      ],
      statsLeft: "[TELEMETRÍA WEBGL CREATIVO Y CINEMÁTICA GSAP]",
      statsRight: "Auditoría Lighthouse 100",
      resHeader: "[RENDIMIENTO DE PARTÍCULAS Y MEMORIA DE AUDIO]",
      resRow1: "CUADROS POR SEGUNDO",
      resB1W: 160, resB1Txt: "18 FPS (DOM Canvas 2D, 85% CPU)",
      resO1W: 230, resO1Txt: "60 FPS (Three.js Instanciado, 9% CPU)",
      resRow2: "PESO RECURSOS AUDIO",
      resB2W: 220, resB2Txt: "48 MB (Archivos WAV Pesados)",
      resO2W: 14, resO2Txt: "12 KB (Nodos AudioContext Procedurales)",
      legendBase: "Implementación Convencional",
      legendOpt: "Arquitectura GPU + Web Audio"
    }
  },
  "06": {
    slug: "06-cemed-hub",
    en: {
      seq: [
        ["01", "Clinical Auth", "Doctor / Nurse\nSign-in Gate", "Tymon JWT Auth", "18ms", "#38bdf8"],
        ["02", "CASL Policy Gate", "Granular CASL\nRole Matrix", "CASL Matrix", "0.2ms", "#38bdf8"],
        ["03", "EHR Encrypted Query", "Patient Records\nEncrypted DB", "PostgreSQL B-Tree", "3.8ms", "#10b981"],
        ["04", "Lab Triage Gate", "Biomarker Alert\nNotification", "Automated Dispatch", "6ms", "#6366f1"],
        ["05", "DomPDF Signature", "Cryptographic\nHash Rx Print", "DomPDF Print Engine", "110ms", "#fbbf24"]
      ],
      seqSummary: "HIPAA-compliant hospital ERP with CASL role enforcement and encrypted medical records",
      stats: [
        ["18ms", "JWT AUTH SPEED", "Tymon Token Issue", "Rate Limited", "#38bdf8"],
        ["0.2ms", "CASL PERMISSION", "Client Route Policy", "In-Memory RBAC", "#10b981"],
        ["3.8ms", "EHR RETRIEVAL", "Indexed Patient Vault", "Sub-5ms Target", "#6366f1"],
        ["110ms", "SECURE PDF RX", "DomPDF Hashed Order", "Instant Print", "#fbbf24"]
      ],
      statsLeft: "[CLINICAL ERP RESPONSE TIMES & INTEGRITY]",
      statsRight: "Hospital Concurrent Shift Audit @ 300 Users",
      resHeader: "[EHR QUERY PERFORMANCE & PERMISSION OVERHEAD]",
      resRow1: "EHR QUERY LATENCY",
      resB1W: 240, resB1Txt: "850ms (Unindexed JSON Query, 45 MB RAM)",
      resO1W: 15, resO1Txt: "3.8ms (B-Tree Indexed Schema, 1.2 MB RAM)",
      resRow2: "PERMISSION CHECK",
      resB2W: 210, resB2Txt: "45ms (Database Route Check per Click)",
      resO2W: 12, resO2Txt: "0.2ms (Client-Side CASL Matrix)",
      legendBase: "Unoptimized Legacy Schema",
      legendOpt: "Indexed EHR + CASL Matrix"
    },
    es: {
      seq: [
        ["01", "Acceso Clínico", "Acceso Médico\ny Enfermería", "Tymon JWT Auth", "18ms", "#38bdf8"],
        ["02", "Matriz CASL", "Control Granular\nMatriz CASL", "Matriz CASL", "0.2ms", "#38bdf8"],
        ["03", "Consulta EHR", "Historial Clínico\nCifrado B-Tree", "Índice B-Tree PostgreSQL", "3.8ms", "#10b981"],
        ["04", "Triaje Laboratorio", "Alerta Triaje\nBiomarcadores", "Despacho Automatizado", "6ms", "#6366f1"],
        ["05", "Firma DomPDF", "Receta Digital\nHash Cripto", "Generación DomPDF", "110ms", "#fbbf24"]
      ],
      seqSummary: "ERP hospitalario con cumplimiento de privacidad, control CASL y expedientes clínicos cifrados",
      stats: [
        ["18ms", "AUTENTICACIÓN JWT", "Emisión de Token Tymon", "Protección de Tasa", "#38bdf8"],
        ["0.2ms", "EVALUACIÓN CASL", "Filtro de Permisos", "Guardia de Ruta", "#10b981"],
        ["3.8ms", "CONSULTA EHR", "Expediente Indexado", "Objetivo Sub-5ms", "#6366f1"],
        ["110ms", "RECETA DOMPDF", "Firma con Hash Médico", "Impresión Rápida", "#fbbf24"]
      ],
      statsLeft: "[TIEMPOS DE RESPUESTA ERP CLÍNICO E INTEGRIDAD]",
      statsRight: "Auditoría Turno Hospitalario @ 300 Usuarios",
      resHeader: "[CONSULTA DE HISTORIAL Y CONTROL DE PERMISOS]",
      resRow1: "TIEMPO CONSULTA EHR",
      resB1W: 240, resB1Txt: "850ms (JSON Sin Índices, 45 MB RAM)",
      resO1W: 15, resO1Txt: "3.8ms (Esquema B-Tree Indexado, 1.2 MB RAM)",
      resRow2: "CONTROL DE PERMISOS",
      resB2W: 210, resB2Txt: "45ms (Consulta SQL en Cada Clic)",
      resO2W: 12, resO2Txt: "0.2ms (Matriz CASL en Memoria)",
      legendBase: "Esquema Tradicional Lento",
      legendOpt: "EHR Indexado + Matriz CASL"
    }
  },
  "07": {
    slug: "07-letsgo-app",
    en: {
      seq: [
        ["01", "Ride Booking", "Passenger GPS\nPickup Point", "Vue 3 Mobile SPA", "Instant", "#38bdf8"],
        ["02", "Sanctum Auth", "Rider Quota &\nAuth Gate", "Bearer Auth", "4ms", "#38bdf8"],
        ["03", "PostGIS Spatial", "PostGIS Spatial\n3km Radius", "Spatial GiST", "1.2ms", "#10b981"],
        ["04", "Driver Queue", "Nearest Fleet\nRedis Worker", "Redis Worker", "2.1ms", "#6366f1"],
        ["05", "Telemetry Push", "Route ETA &\nDriver Sync", "WebSocket Sync", "14ms", "#fbbf24"]
      ],
      seqSummary: "Real-time urban mobility platform with PostGIS spatial matching and sub-second fleet dispatch",
      stats: [
        ["4ms", "SANCTUM TOKEN", "Bearer Verification", "Zero Session Lag", "#38bdf8"],
        ["1.2ms", "POSTGIS RADIAL", "ST_DWithin 3km GiST", "Spatial Calculation", "#10b981"],
        ["2.1ms", "DRIVER MATCHING", "Nearest Fleet Queue", "Redis Queue", "#6366f1"],
        ["14ms", "SOCKET BROADCAST", "Coordinate Telemetry", "Realtime Sync", "#fbbf24"]
      ],
      statsLeft: "[FLEET DISPATCH & SPATIAL QUERY TELEMETRY]",
      statsRight: "Urban Rush-Hour High Volume Benchmark",
      resHeader: "[SPATIAL CALCULATION & TELEMETRY BANDWIDTH]",
      resRow1: "RADIUS QUERY TIME",
      resB1W: 240, resB1Txt: "180ms (PHP Haversine Loop, 100% CPU lock)",
      resO1W: 14, resO1Txt: "1.2ms (PostgreSQL PostGIS GiST Index)",
      resRow2: "FLEET NETWORK LOAD",
      resB2W: 220, resB2Txt: "450 MB (HTTP Polling @ 10,000 req/min)",
      resO2W: 20, resO2Txt: "8 MB (Redis Pub/Sub WebSocket Stream)",
      legendBase: "Naive Polling & Math",
      legendOpt: "PostGIS Spatial + WebSocket"
    },
    es: {
      seq: [
        ["01", "Solicitud Viaje", "Origen GPS\nGeolocalizado", "Vue 3 SPA Móvil", "Instantáneo", "#38bdf8"],
        ["02", "Token Sanctum", "Validación y\nCuota Sanctum", "Bearer Auth", "4ms", "#38bdf8"],
        ["03", "PostGIS Espacial", "Radio PostGIS\nÍndice GiST", "Índice GiST Espacial", "1.2ms", "#10b981"],
        ["04", "Cola de Flota", "Asignación Móvil\nWorker Redis", "Worker Redis", "2.1ms", "#6366f1"],
        ["05", "Despacho Vivo", "Ruta GPS Viva\nDifusión Socket", "Difusión WebSocket", "14ms", "#fbbf24"]
      ],
      seqSummary: "Plataforma de movilidad urbana en tiempo real con geolocalización PostGIS y despacho de flota",
      stats: [
        ["4ms", "TOKEN SANCTUM", "Verificación Bearer", "Cero Retardo", "#38bdf8"],
        ["1.2ms", "BÚSQUEDA ESPACIAL", "ST_DWithin Radio 3km", "Cálculo Espacial", "#10b981"],
        ["2.1ms", "ASIGNACIÓN FLOTA", "Conductor Más Próximo", "Cola Redis", "#6366f1"],
        ["14ms", "NOTIFICACIÓN PUSH", "Telemetría de Coordenadas", "Tiempo Real", "#fbbf24"]
      ],
      statsLeft: "[DESPACHO DE FLOTA Y TELEMETRÍA ESPACIAL]",
      statsRight: "Prueba de Alta Demanda en Hora Pico",
      resHeader: "[CÁLCULO ESPACIAL Y CONSUMO DE RED EN TELEMETRÍA]",
      resRow1: "CÁLCULO DE RADIO",
      resB1W: 240, resB1Txt: "180ms (Fórmula Haversine en PHP, 100% CPU)",
      resO1W: 14, resO1Txt: "1.2ms (Índice GiST PostGIS en PostgreSQL)",
      resRow2: "ANCHO DE BANDA FLOTA",
      resB2W: 220, resB2Txt: "450 MB (Sondeo HTTP @ 10,000 req/min)",
      resO2W: 20, resO2Txt: "8 MB (Flujo WebSocket Redis Pub/Sub)",
      legendBase: "Sondeo HTTP Tradicional",
      legendOpt: "PostGIS + WebSockets Redis"
    }
  },
  "08": {
    slug: "08-logistica-san-martin",
    en: {
      seq: [
        ["01", "Dispatch Order", "Cattle & Meat\nManifest Form", "Vue 3 Dispatch", "Batch Ready", "#38bdf8"],
        ["02", "4-Layer Flow", "4-Layer Decoupled\nService Pattern", "Clean 4-Layer", "0.6ms", "#38bdf8"],
        ["03", "PostgreSQL Commit", "Cold Storage\nLot & Weight", "db_sm_logistica", "3.2ms", "#10b981"],
        ["04", "Gemini AI Engine", "Fuel & Route\nOptimization", "Gemini Routing", "410ms", "#6366f1"],
        ["05", "Waybill Delivery", "Digital Waybill\nDriver Sync", "Signed Document", "22ms", "#fbbf24"]
      ],
      seqSummary: "Enterprise meat logistics ERP with 4-layer clean architecture and Gemini AI route scheduling",
      stats: [
        ["0.6ms", "SERVICE LAYER", "4-Layer Decoupled Flow", "Clean Architecture", "#38bdf8"],
        ["3.2ms", "DB TRANSACTION", "Multi-Table Atomic Log", "ACID Commit", "#10b981"],
        ["410ms", "GEMINI ROUTING", "AI Optimal Waypoints", "Fuel Optimization", "#6366f1"],
        ["18%", "FUEL SAVINGS", "Intelligent Waybills", "Verified Fleet ROI", "#fbbf24"]
      ],
      statsLeft: "[SUPPLY CHAIN & LOGISTICS TELEMETRY]",
      statsRight: "Carnes San Martín Operational Batch Run",
      resHeader: "[ROUTE PLANNING EFFICIENCY & ARCHITECTURAL COMPLEXITY]",
      resRow1: "ROUTE PLANNING TIME",
      resB1W: 240, resB1Txt: "45 min (Manual Dispatch)",
      resO1W: 14, resO1Txt: "410ms (Gemini AI Route)",
      resRow2: "CODE COMPLEXITY",
      resB2W: 220, resB2Txt: "68 (Monolithic Controller)",
      resO2W: 22, resO2Txt: "4 (Decoupled 4-Layer Clean)",
      legendBase: "Manual / Monolithic",
      legendOpt: "Gemini AI + 4-Layer Clean"
    },
    es: {
      seq: [
        ["01", "Orden Despacho", "Carga Cárnica\ny Ganadera", "Vue 3 Despacho", "Lote Listo", "#38bdf8"],
        ["02", "Flujo en 4 Capas", "Flujo 4 Capas\nService Pattern", "Flujo 4 Capas", "0.6ms", "#38bdf8"],
        ["03", "Escritura SQL", "Lote de Frío\ny Pesaje SQL", "db_sm_logistica", "3.2ms", "#10b981"],
        ["04", "Motor Gemini IA", "Optimización Ruta\ny Carga IA", "Ruta Gemini IA", "410ms", "#6366f1"],
        ["05", "Guía de Remisión", "Guía Chofer\nSincro Móvil", "Guía Digital", "22ms", "#fbbf24"]
      ],
      seqSummary: "ERP logístico cárnico con arquitectura desacoplada en 4 capas y optimización de rutas con Gemini IA",
      stats: [
        ["0.6ms", "CAPA DE SERVICIO", "Flujo Desacoplado 4 Capas", "Arquitectura Limpia", "#38bdf8"],
        ["3.2ms", "TRANSACCIÓN SQL", "Escritura Atómica en Tablas", "Commit ACID", "#10b981"],
        ["410ms", "RUTA GEMINI IA", "Puntos Óptimos de Entrega", "Ahorro de Gasolina", "#6366f1"],
        ["18%", "AHORRO DE RUTA", "Guías Inteligentes", "Retorno Operativo", "#fbbf24"]
      ],
      statsLeft: "[TELEMETRÍA LOGÍSTICA Y CADENA DE SUMINISTRO]",
      statsRight: "Corrida Operativa Carnes San Martín",
      resHeader: "[PLANIFICACIÓN DE RUTAS Y COMPLEJIDAD DE CÓDIGO]",
      resRow1: "TIEMPO PLANIFICACIÓN",
      resB1W: 240, resB1Txt: "45 min (Despacho Manual)",
      resO1W: 14, resO1Txt: "410ms (Rutas Gemini IA)",
      resRow2: "COMPLEJIDAD CÓDIGO",
      resB2W: 220, resB2Txt: "68 (Controlador Monolítico)",
      resO2W: 22, resO2Txt: "4 (Arquitectura 4 Capas)",
      legendBase: "Manual / Monolítico",
      legendOpt: "Gemini IA + 4 Capas Limpias"
    }
  },
  "09": {
    slug: "09-sistema-pyme",
    en: {
      seq: [
        ["01", "Cashier Shift", "Opening Float\nCash Register", "Sanctum Auth", "Session Ready", "#38bdf8"],
        ["02", "Barcode Scan", "Barcode Scan\nPinia Store", "Reactive Pinia Store", "< 0.4ms", "#38bdf8"],
        ["03", "Atomic Checkout", "Atomic Checkout\nACID Ledger", "DB Transaction", "2.8ms", "#10b981"],
        ["04", "Kardex Valuation", "Weighted Kardex\nDB Trigger", "Database Trigger", "1.1ms", "#6366f1"],
        ["05", "Daily Audit", "Cash Balance\nDaily Audit", "DOMPDF / Excel", "85ms", "#fbbf24"]
      ],
      seqSummary: "Multi-branch retail POS & inventory ERP with atomic cash register sessions and real-time Kardex",
      stats: [
        ["< 0.4ms", "BARCODE SCAN", "Pinia Reactive State", "Instant Feed", "#38bdf8"],
        ["2.8ms", "ATOMIC SALE", "ACID Inventory Deduct", "Stock Locked", "#10b981"],
        ["1.1ms", "KARDEX TRIGGER", "Weighted Cost Calc", "Zero Drift", "#6366f1"],
        ["85ms", "FISCAL TICKET", "DOMPDF Receipt Render", "Thermal Print", "#fbbf24"]
      ],
      statsLeft: "[POS CHECKOUT & AUDIT TELEMETRY]",
      statsRight: "High-Volume Cash Register Stress Test",
      resHeader: "[KARDEX CALCULATION TIME & POS REACTIVE LATENCY]",
      resRow1: "KARDEX VALUATION",
      resB1W: 240, resB1Txt: "2,800ms (On-demand Historical Loop)",
      resO1W: 12, resO1Txt: "1.1ms (Incremental Weighted Average Trigger)",
      resRow2: "POS INPUT LATENCY",
      resB2W: 210, resB2Txt: "64ms (Legacy Vue 2 Options API)",
      resO2W: 14, resO2Txt: "0.4ms (Vue 3 Pinia Composition Store)",
      legendBase: "Legacy POS Implementation",
      legendOpt: "Incremental Kardex + Pinia"
    },
    es: {
      seq: [
        ["01", "Turno de Caja", "Apertura Fondo\ny Turno Caja", "Auth Sanctum", "Sesión Lista", "#38bdf8"],
        ["02", "Escaneo Código", "Escaneo Barras\nCarrito Pinia", "Store Pinia Reactivo", "< 0.4ms", "#38bdf8"],
        ["03", "Cobro Atómico", "Cobro Atómico\nVenta ACID", "Transacción DB", "2.8ms", "#10b981"],
        ["04", "Kardex Ponderado", "Kardex Promedio\nTrigger SQL", "Trigger de Base Datos", "1.1ms", "#6366f1"],
        ["05", "Arqueo y Cierre", "Arqueo Caja\ny Auditoría", "DOMPDF / Excel", "85ms", "#fbbf24"]
      ],
      seqSummary: "Punto de venta y ERP administrativo para Pymes con corte de caja atómico y Kardex ponderado en tiempo real",
      stats: [
        ["< 0.4ms", "ESCANEO BARRAS", "Estado Reactivo Pinia", "Cero Retardo", "#38bdf8"],
        ["2.8ms", "VENTA ATÓMICA", "Descargo de Stock ACID", "Bloqueo Seguro", "#10b981"],
        ["1.1ms", "TRIGGER KARDEX", "Cálculo Costo Promedio", "Cero Descuadre", "#6366f1"],
        ["85ms", "TICKET FISCAL", "Emisión Térmica DOMPDF", "Impresión Lista", "#fbbf24"]
      ],
      statsLeft: "[TELEMETRÍA DE PUNTO DE VENTA Y AUDITORÍA]",
      statsRight: "Prueba de Estrés de Cobro en Tienda",
      resHeader: "[VALORACIÓN KARDEX Y LATENCIA EN PUNTO DE VENTA]",
      resRow1: "CÁLCULO KARDEX",
      resB1W: 240, resB1Txt: "2,800ms (Bucle Histórico Completo)",
      resO1W: 12, resO1Txt: "1.1ms (Trigger Incremental Ponderado)",
      resRow2: "LATENCIA ENTRADA",
      resB2W: 210, resB2Txt: "64ms (Vue 2 Options API con 50 ítems)",
      resO2W: 14, resO2Txt: "0.4ms (Store Pinia Reactivo Vue 3)",
      legendBase: "Sistema POS Anterior",
      legendOpt: "Kardex Incremental + Pinia"
    }
  },
  "10": {
    slug: "10-sistema-fotos",
    en: {
      seq: [
        ["01", "Proof Gallery", "Watermarked WebP\nProof Gallery", "Vue 3 / Lenis", "60 FPS", "#38bdf8"],
        ["02", "Photo Engine", "EXIF Extract\n& Watermark", "Intervention Image", "68ms", "#38bdf8"],
        ["03", "Stripe Checkout", "Stripe Webhook\nVerification", "Stripe API", "24ms", "#10b981"],
        ["04", "AWS S3 Vault", "AWS S3 Private\nRAW Archive", "Zero Public Read", "Secured", "#6366f1"],
        ["05", "Signed URL", "24-Hour Signed\nExpiring Link", "HMAC Signature", "3.2ms", "#fbbf24"]
      ],
      seqSummary: "Photography client portal with automatic watermarking, Stripe checkout, and secure 24h presigned URLs",
      stats: [
        ["68ms", "WATERMARK ENGINE", "Intervention Image RAW", "Multi-Core GD", "#38bdf8"],
        ["24ms", "STRIPE WEBHOOK", "Cryptographic Validation", "Instant License", "#10b981"],
        ["3.2ms", "PRESIGNED S3 URL", "AWS S3 Temporary Access", "24-Hour Expiry", "#6366f1"],
        ["60 FPS", "PORTFOLIO SCROLL", "Lenis & GSAP View", "Hardware Locked", "#fbbf24"]
      ],
      statsLeft: "[PHOTO ASSET PIPELINE & DELIVERY PERFORMANCE]",
      statsRight: "High-Resolution Image Processing Audit",
      resHeader: "[IMAGE BANDWIDTH CONSUMPTION & SERVER CPU OFFLOAD]",
      resRow1: "PROOF TRANSFER SIZE",
      resB1W: 240, resB1Txt: "42 MB (Uncompressed Full RAW Photo)",
      resO1W: 15, resO1Txt: "380 KB (Watermarked WebP Preview)",
      resRow2: "DOWNLOAD CPU LOAD",
      resB2W: 220, resB2Txt: "95% (PHP File Streaming to Client)",
      resO2W: 12, resO2Txt: "0% (Direct S3 Presigned URL Offload)",
      legendBase: "Direct Server File Stream",
      legendOpt: "Optimized WebP + S3 Presigned"
    },
    es: {
      seq: [
        ["01", "Galería Muestra", "Galería WebP\nMarcada al Agua", "Vue 3 / Lenis", "60 FPS", "#38bdf8"],
        ["02", "Motor de Imagen", "Extracción EXIF\ny Procesado GD", "Intervention Image", "68ms", "#38bdf8"],
        ["03", "Cobro Stripe", "Webhook Stripe\nVerificación", "API de Stripe", "24ms", "#10b981"],
        ["04", "Bóveda AWS S3", "Bóveda AWS S3\nRAW Privada", "Cero Acceso Público", "Protegido", "#6366f1"],
        ["05", "URL Presignada", "URL Firmada\n24 Horas HMAC", "Firma HMAC", "3.2ms", "#fbbf24"]
      ],
      seqSummary: "Plataforma para clientes fotográficos con marca de agua automática, pasarela Stripe y URLs firmadas de 24h",
      stats: [
        ["68ms", "MARCA DE AGUA", "Intervention Image RAW", "Procesamiento GD", "#38bdf8"],
        ["24ms", "WEBHOOK STRIPE", "Validación Criptográfica", "Licencia Inmediata", "#10b981"],
        ["3.2ms", "URL PRESIGNADA", "Acceso Temporal AWS S3", "Caducidad 24 Horas", "#6366f1"],
        ["60 FPS", "SCROLL GALERÍA", "Inercia Lenis y GSAP", "Aceleración GPU", "#fbbf24"]
      ],
      statsLeft: "[RENDIMIENTO DEL MOTOR DE FOTOGRAFÍA Y ENTREGA]",
      statsRight: "Auditoría de Procesamiento en Alta Resolución",
      resHeader: "[TRANSFERENCIA DE FOTOS Y DESCARGA DE CPU]",
      resRow1: "TAMAÑO DE MUESTRA",
      resB1W: 240, resB1Txt: "42 MB (Foto RAW Original Sin Comprimir)",
      resO1W: 15, resO1Txt: "380 KB (Muestra WebP con Marca de Agua)",
      resRow2: "USO CPU EN DESCARGA",
      resB2W: 220, resB2Txt: "95% (Streaming por Servidor PHP)",
      resO2W: 12, resO2Txt: "0% (Descarga Directa desde AWS S3)",
      legendBase: "Descarga por PHP Tradicional",
      legendOpt: "WebP Ligero + Enlaces S3"
    }
  }
};

// Process projectsDataEN
for (const p of projectsDataEN) {
  const cfg = projectConfigs[p.id];
  if (!cfg) continue;
  
  const c = cfg.en;
  const svgPath = path.resolve(`src/assets/diagrams/${cfg.slug}-en.svg`);
  if (fs.existsSync(svgPath)) {
    p.svg = fs.readFileSync(svgPath, 'utf-8').trim();
  }
  p.seqSvg = buildSeqSvg(c.seq, c.seqSummary);
  p.statsSvg = buildStatsSvg(c.statsLeft, c.statsRight, c.stats);
  p.resourceSvg = buildResourceSvg(c.resHeader, c.resRow1, c.resB1W, c.resB1Txt, c.resO1W, c.resO1Txt,
                                   c.resRow2, c.resB2W, c.resB2Txt, c.resO2W, c.resO2Txt,
                                   c.legendBase, c.legendOpt);
  p.slug = cfg.slug;
  p.diagramSvg = `/diagrams/${cfg.slug}-en.svg`;
  p.diagramPng = `/diagrams/${cfg.slug}-en.png`;
  delete p.diagramExcalidraw;
  
  // Clean all fields of //
  for (const k of Object.keys(p)) {
    if (typeof p[k] === 'string' && k !== 'svg' && k !== 'seqSvg' && k !== 'statsSvg' && k !== 'resourceSvg') {
      p[k] = cleanText(p[k]);
    }
  }
  if (Array.isArray(p.roi)) {
    p.roi = p.roi.map(r => cleanText(r));
  }
}

// Process projectsDataES
for (const p of projectsDataES) {
  const cfg = projectConfigs[p.id];
  if (!cfg) continue;
  
  const c = cfg.es;
  const svgPath = path.resolve(`src/assets/diagrams/${cfg.slug}-es.svg`);
  if (fs.existsSync(svgPath)) {
    p.svg = fs.readFileSync(svgPath, 'utf-8').trim();
  }
  p.seqSvg = buildSeqSvg(c.seq, c.seqSummary);
  p.statsSvg = buildStatsSvg(c.statsLeft, c.statsRight, c.stats);
  p.resourceSvg = buildResourceSvg(c.resHeader, c.resRow1, c.resB1W, c.resB1Txt, c.resO1W, c.resO1Txt,
                                   c.resRow2, c.resB2W, c.resB2Txt, c.resO2W, c.resO2Txt,
                                   c.legendBase, c.legendOpt);
  p.slug = cfg.slug;
  p.diagramSvg = `/diagrams/${cfg.slug}-es.svg`;
  p.diagramPng = `/diagrams/${cfg.slug}-es.png`;
  delete p.diagramExcalidraw;
  
  // Clean all fields of //
  for (const k of Object.keys(p)) {
    if (typeof p[k] === 'string' && k !== 'svg' && k !== 'seqSvg' && k !== 'statsSvg' && k !== 'resourceSvg') {
      p[k] = cleanText(p[k]);
    }
  }
  if (Array.isArray(p.roi)) {
    p.roi = p.roi.map(r => cleanText(r));
  }
}

// Write out to src/data/translations.js
const fileContent = `export const staticTranslations = ${JSON.stringify(staticTranslations, null, 2)};

export const projectsDataEN = ${JSON.stringify(projectsDataEN, null, 2)};

export const projectsDataES = ${JSON.stringify(projectsDataES, null, 2)};
`;

fs.writeFileSync('src/data/translations.js', fileContent, 'utf-8');
console.log('src/data/translations.js successfully generated and written!');
