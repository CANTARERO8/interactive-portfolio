import * as THREE from 'three';

const dustVertexShader = `
  attribute float aScale;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aLayer;

  uniform float uTime;
  uniform float uPointSizeMultiplier;
  uniform vec3 uCameraPos;

  varying float vOpacity;

  void main() {
    vec3 pos = position;

    // Very slow organic Brownian drift per layer
    float t = uTime * aSpeed;
    pos.x += sin(t * 0.35 + aPhase) * (1.2 + aLayer * 0.8);
    pos.y += cos(t * 0.28 + aPhase * 1.3) * (0.8 + aLayer * 0.5);
    pos.z += sin(t * 0.22 + aPhase * 0.7) * (1.0 + aLayer * 0.6);

    vec4 mvPosition = viewMatrix * vec4(pos, 1.0);
    float distToCam = length(mvPosition.xyz);

    // Fade particles that get too close to camera to avoid clipping artefacts
    float nearFade = smoothstep(1.2, 3.5, distToCam);
    // Gentle distance attenuation
    float farFade = smoothstep(160.0, 30.0, distToCam);

    // Opacity based on layer (near motes are softer, mid motes distinct, far motes hazy)
    float baseLayerOpacity = (aLayer < 1.5) ? 0.22 : ((aLayer < 2.5) ? 0.16 : 0.09);
    vOpacity = baseLayerOpacity * nearFade * farFade;

    gl_PointSize = (aScale * uPointSizeMultiplier * 36.0) / max(1.0, distToCam);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const dustFragmentShader = `
  precision highp float;

  uniform vec3 uColor;
  varying float vOpacity;

  void main() {
    // Soft circle gaussian falloff without harsh edges
    float r = length(gl_PointCoord - vec2(0.5));
    if (r > 0.5) discard;
    float softCircle = exp(-r * r * 9.0);
    gl_FragColor = vec4(uColor, softCircle * vOpacity);
  }
`;

export class AtmosphericParticles {
  constructor(scene) {
    this.scene = scene;
    this.qualityMode = 'ultra';

    this.group = new THREE.Group();
    this.group.name = 'AtmosphericMotesSystem';
    this.scene.add(this.group);

    this.uniforms = {
      uTime: { value: 0 },
      uPointSizeMultiplier: { value: 1.0 },
      uColor: { value: new THREE.Color('#9bbcd8') }
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false
    });

    this.initParticleStrata();
  }

  initParticleStrata() {
    // Count configuration for max profile (ultra-plus)
    this.maxCount = 2400;

    const positions = new Float32Array(this.maxCount * 3);
    const scales = new Float32Array(this.maxCount);
    const phases = new Float32Array(this.maxCount);
    const speeds = new Float32Array(this.maxCount);
    const layers = new Float32Array(this.maxCount);

    // Stratum distribution:
    // Layer 1: Foreground motes (15% of particles, closer to path)
    // Layer 2: Midground atmosphere (45% of particles, surrounding architecture)
    // Layer 3: Background deep haze (40% of particles, wide vast bounds)
    for (let i = 0; i < this.maxCount; i++) {
      const idx3 = i * 3;
      const ratio = i / this.maxCount;

      let layer, xRange, yMin, yMax, zMin, zMax, baseScale, speed;

      if (ratio < 0.15) {
        // Foreground
        layer = 1.0;
        xRange = 16.0;
        yMin = -3.5;
        yMax = 7.0;
        zMin = -78.0;
        zMax = 12.0;
        baseScale = 0.8 + Math.random() * 0.6;
        speed = 0.14 + Math.random() * 0.18;
      } else if (ratio < 0.60) {
        // Midground
        layer = 2.0;
        xRange = 45.0;
        yMin = -4.5;
        yMax = 14.0;
        zMin = -95.0;
        zMax = 22.0;
        baseScale = 0.5 + Math.random() * 0.5;
        speed = 0.08 + Math.random() * 0.12;
      } else {
        // Background
        layer = 3.0;
        xRange = 90.0;
        yMin = -6.0;
        yMax = 25.0;
        zMin = -125.0;
        zMax = 35.0;
        baseScale = 0.35 + Math.random() * 0.4;
        speed = 0.04 + Math.random() * 0.06;
      }

      positions[idx3 + 0] = (Math.random() - 0.5) * xRange * 2.0;
      positions[idx3 + 1] = yMin + Math.random() * (yMax - yMin);
      positions[idx3 + 2] = zMin + Math.random() * (zMax - zMin);

      scales[i] = baseScale;
      phases[i] = Math.random() * 6.28;
      speeds[i] = speed;
      layers[i] = layer;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    this.geometry.setAttribute('aLayer', new THREE.BufferAttribute(layers, 1));

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.renderOrder = -500;
    this.group.add(this.points);

    this.setQualityMode(this.qualityMode);
  }

  setQualityMode(mode) {
    this.qualityMode = mode;
    if (!this.geometry) return;

    if (mode === 'performance') {
      this.geometry.setDrawRange(0, 450);
      this.uniforms.uPointSizeMultiplier.value = 0.85;
    } else if (mode === 'ultra-plus') {
      this.geometry.setDrawRange(0, this.maxCount);
      this.uniforms.uPointSizeMultiplier.value = 1.15;
    } else {
      // Ultra default
      this.geometry.setDrawRange(0, 1350);
      this.uniforms.uPointSizeMultiplier.value = 1.0;
    }
  }

  update(deltaTime, elapsedTime) {
    this.uniforms.uTime.value = elapsedTime;
  }

  dispose() {
    this.scene.remove(this.group);
    this.geometry.dispose();
    this.material.dispose();
  }
}
