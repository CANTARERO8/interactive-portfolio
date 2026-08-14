import * as THREE from 'three';

export const TECHNOLOGY_ARCHITECTURES = Object.freeze([
  {
    id: 'laravel',
    name: 'LARAVEL',
    code: 'LVL',
    role: 'BACKEND CORE',
    projects: 4,
    accent: '#ff4f45'
  },
  {
    id: 'vue',
    name: 'VUE 3',
    code: 'VUE',
    role: 'REACTIVE FRONTEND',
    projects: 4,
    accent: '#42d392'
  },
  {
    id: 'react',
    name: 'REACT',
    code: 'RCT',
    role: 'INTERFACE SYSTEM',
    projects: 3,
    accent: '#61dafb'
  },
  {
    id: 'tailwind',
    name: 'TAILWIND CSS',
    code: 'TWD',
    role: 'DESIGN LAYER',
    projects: 3,
    accent: '#38bdf8'
  },
  {
    id: 'postgresql',
    name: 'POSTGRESQL',
    code: 'PGS',
    role: 'RELATIONAL DATA',
    projects: 2,
    accent: '#60a5fa'
  },
  {
    id: 'node',
    name: 'NODE.JS',
    code: 'NJS',
    role: 'RUNTIME ENGINE',
    projects: 2,
    accent: '#84cc16'
  },
  {
    id: 'socket',
    name: 'SOCKET.IO',
    code: 'SIO',
    role: 'REALTIME BUS',
    projects: 2,
    accent: '#c084fc'
  },
  {
    id: 'three',
    name: 'THREE.JS',
    code: '3JS',
    role: 'WEBGL EXPERIENCE',
    projects: 1,
    accent: '#f8fafc'
  }
]);

const hexToRgba = (hex, alpha) => {
  const value = hex.replace('#', '');
  const number = Number.parseInt(value.length === 3
    ? value.split('').map(character => character + character).join('')
    : value, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const strokePolyline = (context, points, close = false) => {
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  if (close) context.closePath();
  context.stroke();
};

const drawLaravelGlyph = (context, centerX, centerY, size) => {
  const unit = size * 0.2;
  const cubes = [
    [centerX - unit * 1.45, centerY - unit * 0.7],
    [centerX + unit * 0.15, centerY - unit * 1.35],
    [centerX + unit * 1.1, centerY + unit * 0.15],
    [centerX - unit * 0.35, centerY + unit * 1.0]
  ];

  cubes.forEach(([x, y], index) => {
    const scale = index === 3 ? 1.14 : 1;
    const width = unit * scale;
    const height = unit * 0.58 * scale;
    strokePolyline(context, [
      [x, y - height],
      [x + width, y - height * 0.15],
      [x, y + height],
      [x - width, y - height * 0.15]
    ], true);
    strokePolyline(context, [[x, y + height], [x, y + height * 2.05]]);
    strokePolyline(context, [[x - width, y - height * 0.15], [x - width, y + height * 0.9], [x, y + height * 2.05]]);
    strokePolyline(context, [[x + width, y - height * 0.15], [x + width, y + height * 0.9], [x, y + height * 2.05]]);
  });
};

const drawVueGlyph = (context, centerX, centerY, size) => {
  strokePolyline(context, [
    [centerX - size * 0.46, centerY - size * 0.3],
    [centerX, centerY + size * 0.42],
    [centerX + size * 0.46, centerY - size * 0.3],
    [centerX + size * 0.25, centerY - size * 0.3],
    [centerX, centerY + size * 0.08],
    [centerX - size * 0.25, centerY - size * 0.3]
  ], true);
  strokePolyline(context, [
    [centerX - size * 0.18, centerY - size * 0.3],
    [centerX, centerY - size * 0.02],
    [centerX + size * 0.18, centerY - size * 0.3]
  ]);
};

const drawReactGlyph = (context, centerX, centerY, size) => {
  context.save();
  for (let index = 0; index < 3; index++) {
    context.beginPath();
    context.ellipse(centerX, centerY, size * 0.48, size * 0.18, index * Math.PI / 3, 0, Math.PI * 2);
    context.stroke();
  }
  context.beginPath();
  context.arc(centerX, centerY, size * 0.07, 0, Math.PI * 2);
  context.fill();
  context.restore();
};

const drawTailwindGlyph = (context, centerX, centerY, size) => {
  for (let row = 0; row < 2; row++) {
    const offsetY = (row - 0.5) * size * 0.28;
    context.beginPath();
    context.moveTo(centerX - size * 0.48, centerY + offsetY + size * 0.08);
    context.bezierCurveTo(
      centerX - size * 0.25,
      centerY + offsetY - size * 0.22,
      centerX - size * 0.04,
      centerY + offsetY - size * 0.22,
      centerX + size * 0.08,
      centerY + offsetY - size * 0.04
    );
    context.bezierCurveTo(
      centerX + size * 0.2,
      centerY + offsetY + size * 0.14,
      centerX + size * 0.34,
      centerY + offsetY + size * 0.12,
      centerX + size * 0.48,
      centerY + offsetY - size * 0.05
    );
    context.stroke();
  }
};

const drawPostgresGlyph = (context, centerX, centerY, size) => {
  const width = size * 0.62;
  const height = size * 0.58;
  context.beginPath();
  context.ellipse(centerX, centerY - height * 0.5, width * 0.5, height * 0.18, 0, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(centerX - width * 0.5, centerY - height * 0.5);
  context.lineTo(centerX - width * 0.5, centerY + height * 0.46);
  context.bezierCurveTo(centerX - width * 0.5, centerY + height * 0.72, centerX + width * 0.5, centerY + height * 0.72, centerX + width * 0.5, centerY + height * 0.46);
  context.lineTo(centerX + width * 0.5, centerY - height * 0.5);
  context.stroke();
  [-0.05, 0.28].forEach(offset => {
    context.beginPath();
    context.ellipse(centerX, centerY + height * offset, width * 0.5, height * 0.18, 0, 0, Math.PI);
    context.stroke();
  });
};

const drawNodeGlyph = (context, centerX, centerY, size) => {
  const points = [];
  for (let index = 0; index < 6; index++) {
    const angle = Math.PI / 6 + index * Math.PI / 3;
    points.push([
      centerX + Math.cos(angle) * size * 0.46,
      centerY + Math.sin(angle) * size * 0.46
    ]);
  }
  strokePolyline(context, points, true);
  strokePolyline(context, [
    [centerX - size * 0.2, centerY + size * 0.24],
    [centerX - size * 0.2, centerY - size * 0.24],
    [centerX + size * 0.22, centerY + size * 0.24],
    [centerX + size * 0.22, centerY - size * 0.24]
  ]);
};

const drawSocketGlyph = (context, centerX, centerY, size) => {
  context.beginPath();
  context.arc(centerX, centerY, size * 0.43, Math.PI * 0.17, Math.PI * 1.83);
  context.stroke();
  context.beginPath();
  context.arc(centerX, centerY, size * 0.43, Math.PI * 1.17, Math.PI * 0.83, true);
  context.stroke();
  strokePolyline(context, [
    [centerX + size * 0.08, centerY - size * 0.39],
    [centerX - size * 0.1, centerY - size * 0.03],
    [centerX + size * 0.1, centerY - size * 0.03],
    [centerX - size * 0.08, centerY + size * 0.39]
  ]);
};

const drawThreeGlyph = (context, centerX, centerY, size) => {
  const front = [
    [centerX - size * 0.36, centerY - size * 0.18],
    [centerX + size * 0.14, centerY - size * 0.34],
    [centerX + size * 0.34, centerY + size * 0.18],
    [centerX - size * 0.16, centerY + size * 0.34]
  ];
  const back = front.map(([x, y]) => [x + size * 0.18, y - size * 0.17]);
  strokePolyline(context, front, true);
  strokePolyline(context, back, true);
  front.forEach((point, index) => strokePolyline(context, [point, back[index]]));
  strokePolyline(context, [front[0], front[2], front[1], front[3], front[0]]);
};

const GLYPH_DRAWERS = {
  laravel: drawLaravelGlyph,
  vue: drawVueGlyph,
  react: drawReactGlyph,
  tailwind: drawTailwindGlyph,
  postgresql: drawPostgresGlyph,
  node: drawNodeGlyph,
  socket: drawSocketGlyph,
  three: drawThreeGlyph
};

const drawCornerBrackets = (context, width, height, accent) => {
  context.strokeStyle = hexToRgba(accent, 0.7);
  context.lineWidth = Math.max(2, width * 0.005);
  const inset = width * 0.065;
  const length = width * 0.09;

  [
    [inset, inset, 1, 1],
    [width - inset, inset, -1, 1],
    [inset, height - inset, 1, -1],
    [width - inset, height - inset, -1, -1]
  ].forEach(([x, y, directionX, directionY]) => {
    context.beginPath();
    context.moveTo(x + directionX * length, y);
    context.lineTo(x, y);
    context.lineTo(x, y + directionY * length);
    context.stroke();
  });
};

const createDisplayCanvas = (architecture, index, compact) => {
  const width = compact ? 384 : 512;
  const height = compact ? 576 : 768;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#030711');
  background.addColorStop(0.48, '#07101c');
  background.addColorStop(1, '#02040a');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(width * 0.5, height * 0.38, 0, width * 0.5, height * 0.38, width * 0.72);
  glow.addColorStop(0, hexToRgba(architecture.accent, 0.22));
  glow.addColorStop(0.42, hexToRgba(architecture.accent, 0.075));
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'rgba(135, 220, 255, 0.055)';
  context.lineWidth = 1;
  const gridStep = width / 12;
  for (let x = 0; x <= width; x += gridStep) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y <= height; y += gridStep) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.fillStyle = hexToRgba(architecture.accent, 0.88);
  context.font = `600 ${Math.round(width * 0.028)}px monospace`;
  context.textAlign = 'left';
  context.fillText(`ARCH // 0${index + 1}`, width * 0.08, height * 0.095);
  context.textAlign = 'right';
  context.fillText(`NODE ${architecture.code}`, width * 0.92, height * 0.095);

  context.save();
  context.translate(width * 0.5, height * 0.37);
  context.rotate(-0.08);
  context.strokeStyle = hexToRgba(architecture.accent, 0.12);
  context.lineWidth = width * 0.055;
  context.beginPath();
  context.arc(0, 0, width * 0.27, 0, Math.PI * 2);
  context.stroke();
  context.restore();

  context.strokeStyle = architecture.accent;
  context.fillStyle = architecture.accent;
  context.lineWidth = Math.max(4, width * 0.009);
  context.lineJoin = 'round';
  context.lineCap = 'round';
  context.shadowColor = architecture.accent;
  context.shadowBlur = width * 0.035;
  GLYPH_DRAWERS[architecture.id](context, width * 0.5, height * 0.36, width * 0.46);
  context.shadowBlur = 0;

  context.textAlign = 'center';
  context.fillStyle = '#f8fbff';
  const nameSize = architecture.name.length > 9 ? width * 0.082 : width * 0.105;
  context.font = `700 ${Math.round(nameSize)}px Arial, sans-serif`;
  context.fillText(architecture.name, width * 0.5, height * 0.67);

  context.fillStyle = hexToRgba(architecture.accent, 0.9);
  context.font = `600 ${Math.round(width * 0.031)}px monospace`;
  context.fillText(architecture.role, width * 0.5, height * 0.73);

  context.strokeStyle = hexToRgba(architecture.accent, 0.45);
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(width * 0.15, height * 0.78);
  context.lineTo(width * 0.85, height * 0.78);
  context.stroke();

  context.textAlign = 'left';
  context.fillStyle = 'rgba(215, 235, 247, 0.64)';
  context.font = `500 ${Math.round(width * 0.026)}px monospace`;
  context.fillText('PROJECT FREQUENCY', width * 0.12, height * 0.845);
  context.fillText('SYSTEM STATUS', width * 0.12, height * 0.895);

  context.textAlign = 'right';
  context.fillStyle = architecture.accent;
  context.font = `700 ${Math.round(width * 0.03)}px monospace`;
  context.fillText(`${String(architecture.projects).padStart(2, '0')} PROJECTS`, width * 0.88, height * 0.845);
  context.fillText('VERIFIED', width * 0.88, height * 0.895);

  drawCornerBrackets(context, width, height, architecture.accent);
  return canvas;
};

export function createTechnologyDisplayTextures(renderer) {
  const compact = window.matchMedia('(max-width: 700px), (max-resolution: 1.25dppx)').matches;
  const maxAnisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1;

  return TECHNOLOGY_ARCHITECTURES.map((architecture, index) => {
    const texture = new THREE.CanvasTexture(createDisplayCanvas(architecture, index, compact));
    texture.name = `TechnologyDisplay_${architecture.id}`;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = Math.min(4, maxAnisotropy);
    texture.needsUpdate = true;
    return { ...architecture, texture };
  });
}

const DATABASE_SCREEN_VARIANTS = Object.freeze([
  { database: 'portfolio_core', query: 'ACTIVE SESSIONS', rows: '14.2M', latency: '0.82 ms', cache: 99.4, replicas: 3 },
  { database: 'project_archive', query: 'INDEX ANALYSIS', rows: '8.7M', latency: '1.04 ms', cache: 98.9, replicas: 2 },
  { database: 'telemetry_mesh', query: 'STREAM INGEST', rows: '32.8M', latency: '0.61 ms', cache: 99.7, replicas: 4 },
  { database: 'audit_ledger', query: 'ACID MONITOR', rows: '5.1M', latency: '0.94 ms', cache: 99.2, replicas: 3 },
  { database: 'analytics_cube', query: 'QUERY PLANNER', rows: '18.6M', latency: '1.18 ms', cache: 98.6, replicas: 2 }
]);

const drawDatabasePanel = (context, x, y, width, height, accent, alpha = 0.14) => {
  context.fillStyle = 'rgba(3, 10, 22, 0.88)';
  context.fillRect(x, y, width, height);
  context.strokeStyle = hexToRgba(accent, alpha);
  context.lineWidth = 1;
  context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
};

const createDatabaseTerminalCanvas = (station, index, compact) => {
  const width = compact ? 512 : 768;
  const height = compact ? 320 : 480;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const scale = width / 768;
  const accent = index % 2 === 0 ? '#60a5fa' : '#22d3ee';
  const cyan = '#67e8f9';
  const green = '#34d399';
  const muted = 'rgba(190, 218, 238, 0.56)';

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#020713');
  background.addColorStop(0.55, '#061326');
  background.addColorStop(1, '#02050d');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = 'rgba(96, 165, 250, 0.055)';
  context.lineWidth = 1;
  const gridSize = 24 * scale;
  for (let x = 0; x < width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  const headerHeight = 58 * scale;
  context.fillStyle = 'rgba(5, 17, 34, 0.94)';
  context.fillRect(0, 0, width, headerHeight);
  context.strokeStyle = hexToRgba(accent, 0.45);
  context.beginPath();
  context.moveTo(0, headerHeight);
  context.lineTo(width, headerHeight);
  context.stroke();

  context.save();
  context.strokeStyle = accent;
  context.fillStyle = accent;
  context.lineWidth = 3 * scale;
  context.shadowColor = accent;
  context.shadowBlur = 12 * scale;
  drawPostgresGlyph(context, 36 * scale, 30 * scale, 45 * scale);
  context.restore();

  context.textAlign = 'left';
  context.fillStyle = '#e8f6ff';
  context.font = `700 ${Math.round(17 * scale)}px monospace`;
  context.fillText(`POSTGRESQL // DB POD ${String(index + 1).padStart(2, '0')}`, 69 * scale, 27 * scale);
  context.fillStyle = muted;
  context.font = `500 ${Math.round(10 * scale)}px monospace`;
  context.fillText(`${station.database.toUpperCase()}  /  VERSION 16.4  /  TLS ACTIVE`, 69 * scale, 44 * scale);

  context.textAlign = 'right';
  context.fillStyle = green;
  context.font = `700 ${Math.round(11 * scale)}px monospace`;
  context.fillText('PRIMARY ONLINE', width - 18 * scale, 27 * scale);
  context.fillStyle = accent;
  context.fillText(station.query, width - 18 * scale, 44 * scale);

  const margin = 16 * scale;
  const contentTop = headerHeight + 14 * scale;
  const contentHeight = height - contentTop - 50 * scale;
  const treeWidth = 174 * scale;
  const metricsWidth = 168 * scale;
  const centerX = margin + treeWidth + 12 * scale;
  const centerWidth = width - margin * 2 - treeWidth - metricsWidth - 24 * scale;
  const metricsX = centerX + centerWidth + 12 * scale;

  drawDatabasePanel(context, margin, contentTop, treeWidth, contentHeight, accent, 0.2);
  drawDatabasePanel(context, centerX, contentTop, centerWidth, contentHeight, accent, 0.2);
  drawDatabasePanel(context, metricsX, contentTop, metricsWidth, contentHeight, accent, 0.2);

  context.fillStyle = accent;
  context.font = `700 ${Math.round(10 * scale)}px monospace`;
  context.fillText('SCHEMA EXPLORER', margin + 12 * scale, contentTop + 20 * scale);
  const schemaRows = [
    ['▾', station.database],
    ['  ├', 'users'],
    ['  ├', 'projects'],
    ['  ├', 'events'],
    ['  ├', 'audit_logs'],
    ['  └', 'system_metrics']
  ];
  schemaRows.forEach(([prefix, label], rowIndex) => {
    context.fillStyle = rowIndex === 0 ? '#f1f7ff' : muted;
    context.font = `${rowIndex === 0 ? 700 : 500} ${Math.round(10 * scale)}px monospace`;
    context.fillText(`${prefix} ${label}`, margin + 12 * scale, contentTop + (45 + rowIndex * 25) * scale);
  });

  context.fillStyle = 'rgba(96, 165, 250, 0.08)';
  context.fillRect(margin + 9 * scale, contentTop + 192 * scale, treeWidth - 18 * scale, 84 * scale);
  context.fillStyle = cyan;
  context.font = `700 ${Math.round(9 * scale)}px monospace`;
  context.fillText('RELATION MAP', margin + 17 * scale, contentTop + 210 * scale);
  context.strokeStyle = hexToRgba(accent, 0.7);
  context.lineWidth = 1.5 * scale;
  const relationNodes = [
    [margin + 30 * scale, contentTop + 238 * scale],
    [margin + 88 * scale, contentTop + 226 * scale],
    [margin + 137 * scale, contentTop + 250 * scale],
    [margin + 78 * scale, contentTop + 263 * scale]
  ];
  strokePolyline(context, relationNodes);
  relationNodes.forEach(([x, y]) => {
    context.fillStyle = accent;
    context.fillRect(x - 3 * scale, y - 3 * scale, 6 * scale, 6 * scale);
  });

  context.fillStyle = accent;
  context.font = `700 ${Math.round(10 * scale)}px monospace`;
  context.fillText('QUERY // EXPLAIN ANALYZE', centerX + 12 * scale, contentTop + 20 * scale);
  const queryLines = [
    ['WITH RECURSIVE', '#c084fc'],
    ['node_tree AS (', '#e2e8f0'],
    ['  SELECT id, parent_id, depth', cyan],
    ['  FROM system_nodes', '#e2e8f0'],
    ['  WHERE status = \'active\'', green],
    [') SELECT * FROM node_tree;', '#e2e8f0']
  ];
  queryLines.forEach(([line, color], lineIndex) => {
    context.fillStyle = color;
    context.font = `${lineIndex === 0 ? 700 : 500} ${Math.round(9.5 * scale)}px monospace`;
    context.fillText(line, centerX + 12 * scale, contentTop + (47 + lineIndex * 19) * scale);
  });

  const planY = contentTop + 184 * scale;
  context.fillStyle = muted;
  context.font = `600 ${Math.round(8.5 * scale)}px monospace`;
  context.fillText('LIVE QUERY PLAN', centerX + 12 * scale, planY);
  const planNodes = [
    { x: centerX + 14 * scale, y: planY + 18 * scale, w: 76 * scale, label: 'INDEX SCAN' },
    { x: centerX + 116 * scale, y: planY + 52 * scale, w: 72 * scale, label: 'HASH JOIN' },
    { x: centerX + 214 * scale, y: planY + 18 * scale, w: 74 * scale, label: 'AGGREGATE' }
  ];
  context.strokeStyle = hexToRgba(accent, 0.72);
  context.beginPath();
  context.moveTo(planNodes[0].x + planNodes[0].w, planNodes[0].y + 13 * scale);
  context.lineTo(planNodes[1].x, planNodes[1].y + 13 * scale);
  context.lineTo(planNodes[2].x, planNodes[2].y + 13 * scale);
  context.stroke();
  planNodes.forEach((node, nodeIndex) => {
    context.fillStyle = nodeIndex === 1 ? hexToRgba(accent, 0.22) : 'rgba(7, 22, 40, 0.96)';
    context.fillRect(node.x, node.y, node.w, 26 * scale);
    context.strokeRect(node.x + 0.5, node.y + 0.5, node.w - 1, 26 * scale - 1);
    context.fillStyle = nodeIndex === 1 ? cyan : '#dceeff';
    context.font = `700 ${Math.round(7.5 * scale)}px monospace`;
    context.textAlign = 'center';
    context.fillText(node.label, node.x + node.w * 0.5, node.y + 17 * scale);
  });
  context.textAlign = 'left';

  context.fillStyle = accent;
  context.font = `700 ${Math.round(10 * scale)}px monospace`;
  context.fillText('CLUSTER HEALTH', metricsX + 12 * scale, contentTop + 20 * scale);
  const metrics = [
    ['ROWS', station.rows, 0.82],
    ['LATENCY', station.latency, 0.66],
    ['CACHE HIT', `${station.cache}%`, station.cache / 100],
    ['REPLICAS', `${station.replicas} SYNC`, station.replicas / 4]
  ];
  metrics.forEach(([label, value, ratio], metricIndex) => {
    const y = contentTop + (51 + metricIndex * 52) * scale;
    context.fillStyle = muted;
    context.font = `600 ${Math.round(8 * scale)}px monospace`;
    context.fillText(label, metricsX + 12 * scale, y);
    context.textAlign = 'right';
    context.fillStyle = metricIndex === 1 ? cyan : '#f1f7ff';
    context.font = `700 ${Math.round(10 * scale)}px monospace`;
    context.fillText(value, metricsX + metricsWidth - 12 * scale, y);
    context.textAlign = 'left';
    context.fillStyle = 'rgba(96, 165, 250, 0.12)';
    context.fillRect(metricsX + 12 * scale, y + 10 * scale, metricsWidth - 24 * scale, 5 * scale);
    context.fillStyle = metricIndex === 2 ? green : accent;
    context.fillRect(metricsX + 12 * scale, y + 10 * scale, (metricsWidth - 24 * scale) * ratio, 5 * scale);
  });

  const footerY = height - 37 * scale;
  context.fillStyle = 'rgba(2, 10, 20, 0.95)';
  context.fillRect(0, footerY, width, height - footerY);
  context.strokeStyle = hexToRgba(accent, 0.32);
  context.beginPath();
  context.moveTo(0, footerY);
  context.lineTo(width, footerY);
  context.stroke();
  context.fillStyle = green;
  context.font = `700 ${Math.round(9 * scale)}px monospace`;
  context.fillText('[COMMIT] transaction verified', 16 * scale, footerY + 23 * scale);
  context.textAlign = 'right';
  context.fillStyle = muted;
  context.fillText(`WAL ${String(9421 + index * 317)}-A  •  ENCRYPTED  •  ACID`, width - 16 * scale, footerY + 23 * scale);
  context.textAlign = 'left';

  drawCornerBrackets(context, width, height, accent);
  return canvas;
};

export function createDatabaseTerminalTextures(renderer, count = 5) {
  const compact = window.matchMedia('(max-width: 700px), (max-resolution: 1.25dppx)').matches;
  const maxAnisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1;

  return Array.from({ length: count }, (_, index) => {
    const station = DATABASE_SCREEN_VARIANTS[index % DATABASE_SCREEN_VARIANTS.length];
    const texture = new THREE.CanvasTexture(createDatabaseTerminalCanvas(station, index, compact));
    texture.name = `PostgresTerminal_${index + 1}`;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = Math.min(8, maxAnisotropy);
    texture.needsUpdate = true;
    return texture;
  });
}
