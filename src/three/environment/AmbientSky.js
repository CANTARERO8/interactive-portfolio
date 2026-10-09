import * as THREE from 'three';

const skyVertexShader = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const skyFragmentShader = `
  precision highp float;

  uniform vec3 uCameraPosition;
  uniform float uTime;
  uniform vec3 uZenithColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uNadirColor;
  uniform vec3 uBiomeTint;
  uniform float uBiomeStrength;
  uniform float uHorizonGlow;
  uniform float uLuminance;

  varying vec3 vWorldPosition;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec3 dir = normalize(vWorldPosition - uCameraPosition);
    float elevation = dir.y;

    // Atmospheric curve: smooth transition from zenith to horizon and down to ground
    float horizonBand = exp(-pow(abs(elevation) * 2.2, 1.15));
    float upperSky = smoothstep(0.0, 0.85, elevation);
    float lowerSky = smoothstep(0.0, -0.9, elevation);

    // Subtle atmospheric motion: extremely slow air density variations
    vec2 atmosphericUv = vec2(atan(dir.z, dir.x) * 1.5, elevation * 2.2);
    float airVapor = smoothNoise(atmosphericUv + vec2(uTime * 0.006, uTime * 0.003)) * 0.08;
    float airVapor2 = smoothNoise(atmosphericUv * 2.1 - vec2(uTime * 0.004, uTime * 0.008)) * 0.04;
    float atmosphericTexture = (airVapor + airVapor2) * (0.6 + horizonBand * 0.8);

    // Base atmospheric vertical gradient
    vec3 skyColor = mix(uHorizonColor, uZenithColor, upperSky);
    skyColor = mix(skyColor, uNadirColor, lowerSky * 0.65);

    // Horizon luminance band
    vec3 horizonGlow = uHorizonColor * (horizonBand * (1.35 + uHorizonGlow * 0.6) + atmosphericTexture);
    skyColor += horizonGlow * 0.65;

    // Integrate subtle biome tinting smoothly
    skyColor = mix(skyColor, skyColor * uBiomeTint, uBiomeStrength * 0.45);

    // Master luminance calibration
    skyColor *= uLuminance;

    gl_FragColor = vec4(skyColor, 1.0);
  }
`;

const BIOME_TINTS = [
  { progress: 0.00, color: new THREE.Color('#0b172a'), horizon: new THREE.Color('#142442'), zenith: new THREE.Color('#02040b') }, // Hero: Deep obsidian
  { progress: 0.14, color: new THREE.Color('#091c33'), horizon: new THREE.Color('#122a4d'), zenith: new THREE.Color('#020612') }, // About: Cobalt technical
  { progress: 0.28, color: new THREE.Color('#121532'), horizon: new THREE.Color('#1d204d'), zenith: new THREE.Color('#040514') }, // Projects: Indigo depth
  { progress: 0.43, color: new THREE.Color('#092224'), horizon: new THREE.Color('#11383b'), zenith: new THREE.Color('#020a0d') }, // Vue: Teal/emerald haze
  { progress: 0.57, color: new THREE.Color('#22141a'), horizon: new THREE.Color('#38202b'), zenith: new THREE.Color('#0d050a') }, // Laravel: Muted terracotta dusk
  { progress: 0.71, color: new THREE.Color('#0a1a2e'), horizon: new THREE.Color('#132a48'), zenith: new THREE.Color('#020712') }, // Postgres: Cyan/steel twilight
  { progress: 0.85, color: new THREE.Color('#281542'), horizon: new THREE.Color('#3b255c'), zenith: new THREE.Color('#0d081d') }, // WordPress: Deep amethyst dusk
  { progress: 1.00, color: new THREE.Color('#101228'), horizon: new THREE.Color('#1c2045'), zenith: new THREE.Color('#030511') }  // Contact: Orbital night
];

export class AmbientSky {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.qualityMode = 'ultra';

    this.currentTint = new THREE.Color('#0b172a');
    this.targetTint = new THREE.Color('#0b172a');
    this.currentHorizon = new THREE.Color('#142442');
    this.targetHorizon = new THREE.Color('#142442');
    this.currentZenith = new THREE.Color('#02040b');
    this.targetZenith = new THREE.Color('#02040b');

    this.uniforms = {
      uCameraPosition: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uZenithColor: { value: this.currentZenith },
      uHorizonColor: { value: this.currentHorizon },
      uNadirColor: { value: new THREE.Color('#010207') },
      uBiomeTint: { value: this.currentTint },
      uBiomeStrength: { value: 0.85 },
      uHorizonGlow: { value: 0.75 },
      uLuminance: { value: 1.0 }
    };

    this.geometry = new THREE.SphereGeometry(280, 36, 24);
    this.material = new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: this.uniforms,
      side: THREE.BackSide,
      depthTest: true,
      depthWrite: false,
      fog: false,
      toneMapped: false
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'AmbientSkyDome';
    this.mesh.renderOrder = -2000;
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  setQualityMode(mode) {
    this.qualityMode = mode;
    if (mode === 'performance') {
      this.uniforms.uLuminance.value = 0.92;
      this.uniforms.uHorizonGlow.value = 0.5;
    } else if (mode === 'ultra-plus') {
      this.uniforms.uLuminance.value = 1.08;
      this.uniforms.uHorizonGlow.value = 0.95;
    } else {
      this.uniforms.uLuminance.value = 1.0;
      this.uniforms.uHorizonGlow.value = 0.75;
    }
  }

  setBiomeProgress(progress) {
    const clampedProgress = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    let low = BIOME_TINTS[0];
    let high = BIOME_TINTS[BIOME_TINTS.length - 1];

    for (let i = 0; i < BIOME_TINTS.length - 1; i++) {
      if (clampedProgress >= BIOME_TINTS[i].progress && clampedProgress <= BIOME_TINTS[i + 1].progress) {
        low = BIOME_TINTS[i];
        high = BIOME_TINTS[i + 1];
        break;
      }
    }

    const span = Math.max(0.0001, high.progress - low.progress);
    const factor = (clampedProgress - low.progress) / span;

    this.targetTint.lerpColors(low.color, high.color, factor);
    this.targetHorizon.lerpColors(low.horizon, high.horizon, factor);
    this.targetZenith.lerpColors(low.zenith, high.zenith, factor);
  }

  update(deltaTime, elapsedTime, scrollProgress) {
    this.mesh.position.copy(this.camera.position);
    this.uniforms.uCameraPosition.value.copy(this.camera.position);
    this.uniforms.uTime.value = elapsedTime;

    const lerpSpeed = Math.min(1.0, deltaTime * 2.2);
    this.currentTint.lerp(this.targetTint, lerpSpeed);
    this.currentHorizon.lerp(this.targetHorizon, lerpSpeed);
    this.currentZenith.lerp(this.targetZenith, lerpSpeed);
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}
