import * as THREE from 'three';

export const SYSTEMS_CITY_DISTRICTS = Object.freeze([
  { key: 'hero', code: 'EC-01', title: 'SYSTEMS CITY', subtitle: 'FULLSTACK EXPERIENCE GATE', accent: '#22d3ee', diagram: 'gateway' },
  { key: 'about', code: 'DEV-02', title: 'DEVELOPER LAB', subtitle: 'ARCHITECTURE & ENGINEERING', accent: '#a78bfa', diagram: 'lab' },
  { key: 'projects', code: 'ARC-03', title: 'BUILT SYSTEMS', subtitle: 'PROJECT ARCHIVE DISTRICT', accent: '#38bdf8', diagram: 'archive' },
  { key: 'vue', code: 'VUE-04', title: 'REACTIVE GRID', subtitle: 'COMPONENT COMPUTATION ZONE', accent: '#34d399', diagram: 'reactive' },
  { key: 'laravel', code: 'LAR-05', title: 'BACKEND FOUNDRY', subtitle: 'SERVICES • QUEUES • PIPELINES', accent: '#7dd3fc', diagram: 'backend' },
  { key: 'postgres', code: 'PG-06', title: 'DATA OPERATIONS', subtitle: 'RELATIONAL CLUSTER CORRIDOR', accent: '#60a5fa', diagram: 'database' },
  { key: 'wordpress', code: 'CMS-07', title: 'CONTENT WORKS', subtitle: 'MODULAR PUBLISHING SYSTEMS', accent: '#c084fc', diagram: 'content' },
  { key: 'contact', code: 'UP-08', title: 'UPLINK PORT', subtitle: 'CHANNEL OPEN • AVAILABLE', accent: '#67e8f9', diagram: 'uplink' }
]);

const rgba = (hex, alpha) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

const line = (context, points, close = false) => {
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  if (close) context.closePath();
  context.stroke();
};

const drawDiagram = (context, type, x, y, width, height, accent) => {
  context.save();
  context.translate(x, y);
  context.strokeStyle = accent;
  context.fillStyle = rgba(accent, 0.22);
  context.lineWidth = 2;
  context.shadowColor = accent;
  context.shadowBlur = 10;

  if (type === 'gateway') {
    [0.08, 0.26, 0.47, 0.68, 0.84].forEach((ratio, index) => {
      const towerHeight = height * (0.38 + ((index * 7) % 5) * 0.1);
      context.fillRect(width * ratio, height - towerHeight, width * 0.09, towerHeight);
      context.strokeRect(width * ratio, height - towerHeight, width * 0.09, towerHeight);
    });
    line(context, [[width * 0.04, height * 0.78], [width * 0.48, height * 0.24], [width * 0.96, height * 0.78]]);
  } else if (type === 'lab') {
    const nodes = [[0.12, 0.25], [0.42, 0.16], [0.78, 0.28], [0.25, 0.72], [0.62, 0.68], [0.9, 0.78]];
    line(context, nodes.map(([nx, ny]) => [width * nx, height * ny]));
    nodes.forEach(([nx, ny], index) => {
      context.fillStyle = index % 2 ? accent : rgba(accent, 0.25);
      context.fillRect(width * nx - 5, height * ny - 5, 10, 10);
    });
  } else if (type === 'archive') {
    for (let index = 0; index < 4; index++) {
      const offset = index * 12;
      context.strokeRect(width * 0.15 + offset, height * 0.15 + offset, width * 0.62, height * 0.54);
      context.fillRect(width * 0.2 + offset, height * 0.27 + offset, width * 0.34, 5);
      context.fillRect(width * 0.2 + offset, height * 0.4 + offset, width * 0.22, 4);
    }
  } else if (type === 'reactive') {
    line(context, [[width * 0.08, height * 0.24], [width * 0.34, height * 0.8], [width * 0.58, height * 0.24]], true);
    line(context, [[width * 0.42, height * 0.24], [width * 0.68, height * 0.8], [width * 0.94, height * 0.24]], true);
    context.beginPath();
    context.arc(width * 0.51, height * 0.5, height * 0.18, 0, Math.PI * 2);
    context.stroke();
  } else if (type === 'backend') {
    const boxes = [0.08, 0.39, 0.7];
    boxes.forEach((ratio, index) => {
      context.strokeRect(width * ratio, height * 0.3, width * 0.2, height * 0.42);
      context.fillRect(width * ratio + 9, height * 0.42, width * 0.11, 5);
      if (index < boxes.length - 1) {
        line(context, [[width * (ratio + 0.21), height * 0.51], [width * (ratio + 0.29), height * 0.51]]);
      }
    });
  } else if (type === 'database') {
    [0.18, 0.5, 0.82].forEach((ratio, index) => {
      context.beginPath();
      context.ellipse(width * ratio, height * 0.27, width * 0.1, height * 0.1, 0, 0, Math.PI * 2);
      context.stroke();
      context.strokeRect(width * ratio - width * 0.1, height * 0.27, width * 0.2, height * 0.43);
      context.beginPath();
      context.ellipse(width * ratio, height * 0.7, width * 0.1, height * 0.1, 0, 0, Math.PI);
      context.stroke();
      if (index < 2) line(context, [[width * (ratio + 0.1), height * 0.48], [width * (ratio + 0.22), height * 0.48]]);
    });
  } else if (type === 'content') {
    const modules = [[0.08, 0.16, 0.36, 0.24], [0.5, 0.16, 0.42, 0.24], [0.08, 0.48, 0.22, 0.34], [0.36, 0.48, 0.56, 0.34]];
    modules.forEach(([mx, my, mw, mh], index) => {
      context.fillStyle = index === 3 ? rgba(accent, 0.28) : 'rgba(4, 10, 22, 0.8)';
      context.fillRect(width * mx, height * my, width * mw, height * mh);
      context.strokeRect(width * mx, height * my, width * mw, height * mh);
    });
  } else {
    [0.18, 0.31, 0.45].forEach(radius => {
      context.beginPath();
      context.arc(width * 0.52, height * 0.52, height * radius, -Math.PI * 0.82, Math.PI * 0.12);
      context.stroke();
    });
    line(context, [[width * 0.13, height * 0.82], [width * 0.52, height * 0.52], [width * 0.9, height * 0.18]]);
    context.fillRect(width * 0.5 - 5, height * 0.5 - 5, 10, 10);
  }

  context.restore();
};

const createSignCanvas = (district, compact) => {
  const width = compact ? 480 : 640;
  const height = compact ? 180 : 240;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  const scale = width / 640;

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#020611');
  background.addColorStop(0.58, '#07101f');
  background.addColorStop(1, '#02040a');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = rgba(district.accent, 0.09);
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 32 * scale) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += 32 * scale) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  context.fillStyle = rgba(district.accent, 0.12);
  context.fillRect(0, 0, width, 34 * scale);
  context.fillStyle = district.accent;
  context.font = `700 ${Math.round(12 * scale)}px monospace`;
  context.fillText(`DISTRICT // ${district.code}`, 18 * scale, 22 * scale);
  context.textAlign = 'right';
  context.fillStyle = '#34d399';
  context.fillText('● GRID ONLINE', width - 18 * scale, 22 * scale);

  context.textAlign = 'left';
  context.fillStyle = '#f1f7ff';
  context.font = `800 ${Math.round(27 * scale)}px Arial, sans-serif`;
  context.fillText(district.title, 22 * scale, 82 * scale);
  context.fillStyle = district.accent;
  context.font = `700 ${Math.round(11 * scale)}px monospace`;
  context.fillText(district.subtitle, 23 * scale, 108 * scale);

  context.strokeStyle = rgba(district.accent, 0.4);
  context.beginPath();
  context.moveTo(22 * scale, 126 * scale);
  context.lineTo(width * 0.55, 126 * scale);
  context.stroke();

  context.fillStyle = 'rgba(198, 221, 239, 0.56)';
  context.font = `500 ${Math.round(9 * scale)}px monospace`;
  context.fillText('ARCHITECTURE STATUS', 23 * scale, 153 * scale);
  context.fillText('NETWORK LATENCY', 23 * scale, 176 * scale);
  context.fillStyle = '#dff7ff';
  context.font = `700 ${Math.round(9 * scale)}px monospace`;
  context.fillText('VERIFIED', 154 * scale, 153 * scale);
  context.fillText(`${String(0.42 + SYSTEMS_CITY_DISTRICTS.indexOf(district) * 0.07).slice(0, 4)} MS`, 154 * scale, 176 * scale);

  drawDiagram(context, district.diagram, width * 0.63, 50 * scale, width * 0.32, height * 0.68, district.accent);

  context.strokeStyle = rgba(district.accent, 0.7);
  context.lineWidth = 2;
  const bracket = 18 * scale;
  [[8, 8, 1, 1], [width - 8, 8, -1, 1], [8, height - 8, 1, -1], [width - 8, height - 8, -1, -1]].forEach(([x, y, dx, dy]) => {
    line(context, [[x + dx * bracket, y], [x, y], [x, y + dy * bracket]]);
  });

  return canvas;
};

export function createSystemsCitySignTextures(renderer) {
  const compact = window.matchMedia('(max-width: 700px), (max-resolution: 1.25dppx)').matches;
  const anisotropy = renderer?.capabilities?.getMaxAnisotropy?.() || 1;

  return SYSTEMS_CITY_DISTRICTS.map(district => {
    const texture = new THREE.CanvasTexture(createSignCanvas(district, compact));
    texture.name = `SystemsCitySign_${district.key}`;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = Math.min(8, anisotropy);
    texture.needsUpdate = true;
    return { ...district, texture };
  });
}
