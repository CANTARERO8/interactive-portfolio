import * as THREE from 'three';

const beamVertexShader =  `
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;

  void main() {
    vLocalPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const beamFragmentShader =  `
  precision highp float;

  uniform float uTime;
  uniform float uHeight;
  uniform float uRadius;
  uniform float uIntensity;
  uniform float uPhase;
  uniform vec3 uColor;

  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;

  float beamNoise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  }

  float sampleDensity(vec3 samplePosition) {
    float vertical = clamp(samplePosition.y / uHeight + 0.5, 0.0, 1.0);
    float coneRadius = mix(uRadius, uRadius * 0.16, vertical);
    float radial = length(samplePosition.xz) / max(coneRadius, 0.001);
    float edge = exp(-radial * radial * 2.8);
    float fogNoise = beamNoise(floor(samplePosition * 3.2 + uTime * 0.35 + uPhase));
    float envelope = smoothstep(0.0, 0.12, vertical) * smoothstep(1.0, 0.72, vertical);
    return edge * envelope * mix(0.58, 1.0, fogNoise);
  }

  void main() {
    // Beam groups only translate in world space, so world and local axes match.
    vec3 localViewDirection = normalize(cameraPosition - vWorldPosition);
    float integratedDensity = 0.0;

    for (int rayStep = 0; rayStep < 8; rayStep++) {
      float distanceAlongRay = (float(rayStep) - 3.5) * 0.22;
      integratedDensity += sampleDensity(vLocalPosition + localViewDirection * distanceAlongRay);
    }

    integratedDensity /= 8.0;
    float pulse = 0.88 + sin(uTime * 0.72 + uPhase) * 0.12;
    float alpha = integratedDensity * uIntensity * pulse;
    vec3 color = uColor * (0.58 + integratedDensity * 1.7);
    gl_FragColor = vec4(color, alpha);
  }
`;

const dustVertexShader =  `
  uniform float uTime;
  uniform float uHeight;
  uniform float uPixelRatio;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    vec3 animatedPosition = position;
    animatedPosition.y = mod(position.y + uTime * (0.24 + aPhase * 0.08) + uHeight * 0.5, uHeight) - uHeight * 0.5;
    animatedPosition.x += sin(uTime * 0.55 + aPhase * 9.0) * 0.06;
    animatedPosition.z += cos(uTime * 0.48 + aPhase * 7.0) * 0.06;

    vec4 modelViewPosition = modelViewMatrix * vec4(animatedPosition, 1.0);
    gl_PointSize = (2.0 + aPhase * 2.4) * uPixelRatio * (8.0 / max(1.0, -modelViewPosition.z));
    gl_Position = projectionMatrix * modelViewPosition;
    vAlpha = 0.35 + aPhase * 0.65;
  }
`;

const dustFragmentShader =  `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.0, distanceToCenter) * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export class VolumetricLightBeams {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = 'VolumetricGodRays';
    this.scene.add(this.group);
    this.beams = [];
    this.qualityMode = 'ultra';
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const configs = [
      { position: [-5.8, 4.0, 1.0], color: '#4de8ff', radius: 2.8, height: 16, progress: 0.00 },
      { position: [5.6, 3.6, -8.0], color: '#9674ff', radius: 2.2, height: 15, progress: 0.14 },
      { position: [0.0, 4.4, -16.0], color: '#00f2fe', radius: 3.6, height: 18, progress: 0.28 },
      { position: [-4.8, 4.0, -25.0], color: '#34d399', radius: 2.5, height: 16, progress: 0.43 },
      { position: [5.0, 3.8, -35.0], color: '#ff665c', radius: 2.8, height: 17, progress: 0.57 },
      { position: [-5.2, 3.5, -46.0], color: '#60a5fa', radius: 3.2, height: 18, progress: 0.71 },
      { position: [4.6, 3.8, -58.0], color: '#c084fc', radius: 2.8, height: 17, progress: 0.85 },
      { position: [0.0, 7.0, -72.0], color: '#67e8f9', radius: 5.4, height: 22, progress: 1.00 }
    ];

    configs.forEach((config, index) => this.createBeam(config, index));
  }

  createBeam(config, index) {
    const beamGroup = new THREE.Group();
    beamGroup.position.set(...config.position);

    const uniforms = {
      uTime: { value: 0 },
      uHeight: { value: config.height },
      uRadius: { value: config.radius },
      uIntensity: { value: 0.42 },
      uPhase: { value: index * 1.73 },
      uColor: { value: new THREE.Color(config.color) }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: beamVertexShader,
      fragmentShader: beamFragmentShader,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });

    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(config.radius, config.height, 24, 1, true),
      material
    );
    cone.renderOrder = -20;
    beamGroup.add(cone);

    const dustCount = window.innerWidth <= 768 ? 18 : 42;
    const dustPositions = new Float32Array(dustCount * 3);
    const dustPhases = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      const y = (Math.random() - 0.5) * config.height;
      const vertical = y / config.height + 0.5;
      const allowedRadius = config.radius * mixNumber(1.0, 0.18, vertical) * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      dustPositions[i * 3] = Math.cos(angle) * allowedRadius;
      dustPositions[i * 3 + 1] = y;
      dustPositions[i * 3 + 2] = Math.sin(angle) * allowedRadius;
      dustPhases[i] = Math.random();
    }

    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute('aPhase', new THREE.BufferAttribute(dustPhases, 1));
    const dustUniforms = {
      uTime: { value: 0 },
      uHeight: { value: config.height },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
      uColor: { value: new THREE.Color(config.color) }
    };
    const dustMaterial = new THREE.ShaderMaterial({
      uniforms: dustUniforms,
      vertexShader: dustVertexShader,
      fragmentShader: dustFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    beamGroup.add(dust);

    this.group.add(beamGroup);
    this.beams.push({ group: beamGroup, dust, uniforms, dustUniforms, progress: config.progress });
  }

  setQualityMode(mode) {
    this.qualityMode = ['performance', 'ultra', 'ultra-plus'].includes(mode) ? mode : 'ultra';
    const isPerformance = this.qualityMode === 'performance';
    const isUltraPlus = this.qualityMode === 'ultra-plus';
    const pixelRatioCap = isPerformance ? 1 : (isUltraPlus ? 2 : 1.35);
    this.beams.forEach(beam => {
      beam.dust.visible = !isPerformance;
      const dustCount = beam.dust.geometry.attributes.position.count;
      beam.dust.geometry.setDrawRange(0, isUltraPlus ? dustCount : Math.ceil(dustCount * 0.58));
      beam.dustUniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, pixelRatioCap);
    });
  }

  update(elapsedTime, progress, explorerActive = false, overclocked = false) {
    const isPerformance = this.qualityMode === 'performance';
    const isUltraPlus = this.qualityMode === 'ultra-plus';
    const motionTime = elapsedTime * (this.reducedMotion ? 0.08 : 1.0);
    for (const beam of this.beams) {
      const distance = Math.abs(progress - beam.progress);
      const visible = isPerformance ? distance < 0.18 : (explorerActive || distance < 0.26);
      beam.group.visible = visible;
      if (!visible) continue;

      const envelope = !isPerformance && explorerActive
        ? 0.72
        : THREE.MathUtils.smoothstep((isPerformance ? 0.2 : 0.28) - distance, 0.0, isPerformance ? 0.2 : 0.28);
      const baseIntensity = isPerformance ? 0.32 : (isUltraPlus ? 0.58 : 0.46);
      const targetIntensity = envelope * (overclocked ? baseIntensity * 1.5 : baseIntensity);
      beam.uniforms.uIntensity.value += (targetIntensity - beam.uniforms.uIntensity.value) * 0.06;
      beam.uniforms.uTime.value = motionTime;
      beam.dustUniforms.uTime.value = motionTime;
    }
  }
}

function mixNumber(start, end, progress) {
  return start + (end - start) * progress;
}
