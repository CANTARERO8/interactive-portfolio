import * as THREE from 'three';
import { projects } from '../../data/projects.js';

const DISPLAY_WIDTH = 768;
const DISPLAY_HEIGHT = 432;
const DISPLAY_ACCENTS = ['#67e8f9', '#a78bfa'];

function roundedRect(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function fitText(context, text, maxWidth, initialSize, minimumSize, weight = 700) {
  let size = initialSize;
  do {
    context.font = `${weight} ${size}px "Arial Narrow", "Segoe UI", sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 1;
  } while (size > minimumSize);
  return size;
}

function drawGrid(context, accent) {
  context.save();
  context.strokeStyle = accent;
  context.globalAlpha = 0.055;
  context.lineWidth = 1;
  for (let x = 24; x < DISPLAY_WIDTH; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, DISPLAY_HEIGHT);
    context.stroke();
  }
  for (let y = 24; y < DISPLAY_HEIGHT; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(DISPLAY_WIDTH, y);
    context.stroke();
  }
  context.restore();
}

function drawSystemMap(context, accent, projectIndex) {
  const nodes = [
    [72, 258],
    [146, 225 + (projectIndex % 3) * 10],
    [224, 278 - (projectIndex % 2) * 18],
    [304, 236 + (projectIndex % 4) * 8],
    [382, 264]
  ];

  context.save();
  context.strokeStyle = accent;
  context.fillStyle = accent;
  context.lineWidth = 2;
  context.globalAlpha = 0.46;
  context.beginPath();
  nodes.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  nodes.forEach(([x, y], index) => {
    context.globalAlpha = index === nodes.length - 1 ? 0.9 : 0.56;
    context.beginPath();
    context.arc(x, y, index === nodes.length - 1 ? 6 : 4, 0, Math.PI * 2);
    context.fill();
  });
  context.restore();
}

function drawTechPills(context, project, accent) {
  let x = 48;
  const y = 352;
  project.techs.forEach((tech) => {
    context.font = '600 15px "Arial Narrow", "Segoe UI", sans-serif';
    const pillWidth = Math.min(148, Math.max(82, context.measureText(tech.toUpperCase()).width + 28));
    roundedRect(context, x, y, pillWidth, 34, 7);
    context.fillStyle = 'rgba(5, 12, 25, 0.9)';
    context.fill();
    context.strokeStyle = accent;
    context.globalAlpha = 0.42;
    context.stroke();
    context.globalAlpha = 0.88;
    context.fillStyle = '#d9f8ff';
    context.fillText(tech.toUpperCase(), x + 14, y + 22);
    x += pillWidth + 10;
  });
  context.globalAlpha = 1;
}

function createProjectDisplayTexture(renderer, project, projectIndex) {
  const canvas = document.createElement('canvas');
  canvas.width = DISPLAY_WIDTH;
  canvas.height = DISPLAY_HEIGHT;
  const context = canvas.getContext('2d');
  const accent = DISPLAY_ACCENTS[projectIndex % DISPLAY_ACCENTS.length];

  const background = context.createLinearGradient(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
  background.addColorStop(0, '#020711');
  background.addColorStop(0.62, '#07101f');
  background.addColorStop(1, projectIndex % 2 === 0 ? '#061827' : '#120b24');
  context.fillStyle = background;
  context.fillRect(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
  drawGrid(context, accent);

  context.fillStyle = accent;
  context.fillRect(0, 0, 9, DISPLAY_HEIGHT);
  context.globalAlpha = 0.28;
  context.fillRect(30, 72, DISPLAY_WIDTH - 60, 2);
  context.fillRect(30, 326, DISPLAY_WIDTH - 60, 1);
  context.globalAlpha = 1;

  context.font = '700 16px "Arial Narrow", "Segoe UI", sans-serif';
  context.fillStyle = accent;
  context.fillText(`PROJECT ARCHIVE // ${String(project.id + 1).padStart(2, '0')}`, 48, 44);
  context.textAlign = 'right';
  context.fillStyle = '#8ca7b8';
  context.fillText('CHANNEL VERIFIED', DISPLAY_WIDTH - 48, 44);
  context.textAlign = 'left';

  const title = project.title.toUpperCase();
  fitText(context, title, 650, 48, 31, 800);
  context.fillStyle = '#eefbff';
  context.fillText(title, 48, 132);

  fitText(context, project.category.toUpperCase(), 650, 18, 13, 600);
  context.fillStyle = '#8ba6b9';
  context.fillText(project.category.toUpperCase(), 50, 166);

  drawSystemMap(context, accent, projectIndex);

  context.textAlign = 'right';
  context.font = '700 14px "Arial Narrow", "Segoe UI", sans-serif';
  context.fillStyle = '#7893a6';
  context.fillText('SYSTEM LOAD', DISPLAY_WIDTH - 50, 220);
  context.fillText('DATA FLOW', DISPLAY_WIDTH - 50, 252);
  context.fillText('UPLINK', DISPLAY_WIDTH - 50, 284);

  const values = [82 + (projectIndex % 4) * 4, 91 + (projectIndex % 3) * 2, 100];
  values.forEach((value, index) => {
    const barX = 484;
    const barY = 208 + index * 32;
    context.fillStyle = 'rgba(115, 153, 174, 0.16)';
    context.fillRect(barX, barY, 132, 6);
    context.fillStyle = accent;
    context.globalAlpha = 0.7;
    context.fillRect(barX, barY, 132 * value / 100, 6);
    context.globalAlpha = 1;
  });
  context.textAlign = 'left';

  drawTechPills(context, project, accent);

  context.font = '600 12px "Arial Narrow", "Segoe UI", sans-serif';
  context.fillStyle = '#587487';
  context.fillText(`NODE ${String(210 + project.id * 17).padStart(3, '0')}  /  BUILD STABLE  /  PACKET LOSS 0.00%`, 48, 414);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(renderer?.capabilities?.getMaxAnisotropy?.() || 1, 8);
  texture.needsUpdate = true;

  return { project, texture, accent };
}

export function createProjectOrbitalTextures(renderer) {
  return projects.map((project, projectIndex) => (
    createProjectDisplayTexture(renderer, project, projectIndex)
  ));
}
