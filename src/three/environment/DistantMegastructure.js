import * as THREE from 'three';

// Custom aerial perspective, architectural illumination & silhouette shader
const megastructureShader = {
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vFogDepth;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vLocalPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vNormal = normalize(mat3(modelMatrix) * normal);
      
      vec4 mvPosition = viewMatrix * worldPos;
      vViewPosition = -mvPosition.xyz;
      vFogDepth = -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    precision highp float;

    uniform vec3 uHorizonColor;
    uniform vec3 uBaseColor;
    uniform vec3 uHighlightColor;
    uniform vec3 uSeamColor;
    uniform float uFogStart;
    uniform float uFogEnd;
    uniform float uAtmosphereHaze;
    uniform float uOcclusion;
    uniform float uSeamIntensity;
    uniform float uTime;

    varying vec3 vWorldPosition;
    varying vec3 vLocalPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying float vFogDepth;
    varying vec2 vUv;

    void main() {
      vec3 viewDir = normalize(vViewPosition);

      // 1. Directional key lighting from upper right to sculpt brutalist facets
      vec3 lightDir = normalize(vec3(0.42, 0.68, 0.55));
      float NdotL = max(dot(vNormal, lightDir), 0.0);
      vec3 surfaceTone = mix(uBaseColor, uHighlightColor, pow(NdotL, 1.2) * 0.78);

      // 2. Cinematic atmospheric rim / fresnel glow on silhouette edges
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
      vec3 rimColor = mix(uHighlightColor, uHorizonColor, 0.45) * (fresnel * 0.90);

      // 3. Elegant, non-aliasing architectural seam rhythm using LOCAL coordinates
      // Vertical structural channels along the facets
      float seamX = smoothstep(0.12, 0.0, abs(fract(vLocalPosition.x * 0.25 + 0.5) - 0.5));
      // Horizontal floor stratum grooves every few units
      float seamY = smoothstep(0.10, 0.0, abs(fract(vLocalPosition.y * 0.12 + 0.5) - 0.5));
      // Cathedral vertical rift glow in center (negative-space vertical fissure)
      float riftGlow = smoothstep(2.8, 0.0, abs(vLocalPosition.x)) * smoothstep(5.0, 130.0, vLocalPosition.y);
      
      float seamPattern = max(seamX * 0.55, seamY * 0.40) + riftGlow * 0.75;
      float pulse = 0.82 + 0.18 * sin(uTime * 0.75 + vLocalPosition.y * 0.05);
      vec3 seamGlow = uSeamColor * seamPattern * uSeamIntensity * pulse;

      // Combine solid architectural mass, rim highlights, and seam illumination
      vec3 litColor = surfaceTone + rimColor + seamGlow;

      // 4. Atmospheric aerial perspective (Rayleigh scattering depth fade)
      float depthFactor = smoothstep(uFogStart, uFogEnd, vFogDepth);
      float heightHaze = smoothstep(35.0, -10.0, vWorldPosition.y) * 0.28;
      // Retain crisp silhouette contrast against the horizon
      float totalHaze = clamp((depthFactor * uOcclusion) + (heightHaze * uAtmosphereHaze), 0.0, 0.82);

      vec3 finalColor = mix(litColor, uHorizonColor, totalHaze);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Section-by-section atmospheric choreography across the 8 biomes
export const MEGASTRUCTURE_ATMOSPHERE_WAYPOINTS = Object.freeze([
  {
    key: 'hero',
    progress: 0.00,
    occlusion: 0.52,
    fogStart: 50.0,
    fogEnd: 220.0,
    seamIntensity: 0.80,
    seamColor: '#93c5fd'
  },
  {
    key: 'about',
    progress: 0.14,
    occlusion: 0.58,
    fogStart: 45.0,
    fogEnd: 210.0,
    seamIntensity: 0.80,
    seamColor: '#60a5fa'
  },
  {
    key: 'projects',
    progress: 0.28,
    occlusion: 0.36,
    fogStart: 60.0,
    fogEnd: 240.0,
    seamIntensity: 0.95,
    seamColor: '#a78bfa'
  },
  {
    key: 'vue',
    progress: 0.43,
    occlusion: 0.72,
    fogStart: 38.0,
    fogEnd: 195.0,
    seamIntensity: 0.70,
    seamColor: '#34d399'
  },
  {
    key: 'laravel',
    progress: 0.57,
    occlusion: 0.26,
    fogStart: 70.0,
    fogEnd: 260.0,
    seamIntensity: 1.15,
    seamColor: '#fb923c'
  },
  {
    key: 'postgres',
    progress: 0.71,
    occlusion: 0.85,
    fogStart: 25.0,
    fogEnd: 155.0,
    seamIntensity: 0.35,
    seamColor: '#38bdf8'
  },
  {
    key: 'wordpress',
    progress: 0.85,
    occlusion: 0.22,
    fogStart: 55.0,
    fogEnd: 250.0,
    seamIntensity: 1.25,
    seamColor: '#d8b4fe'
  },
  {
    key: 'contact',
    progress: 1.00,
    occlusion: 0.18,
    fogStart: 75.0,
    fogEnd: 280.0,
    seamIntensity: 1.20,
    seamColor: '#e0e7ff'
  }
]);

// Backwards compatibility export
export const MEGASTRUCTURE_WAYPOINTS = MEGASTRUCTURE_ATMOSPHERE_WAYPOINTS;

export class DistantMegastructure {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = 'DistantMegastructureMaster';

    // Immovable landmark deep in the background horizon, firmly rooted in floor
    this.group.position.set(8.0, -7.0, -165.0);
    this.group.rotation.set(0.02, -0.25, 0.0);
    this.group.scale.setScalar(1.0);
    this.scene.add(this.group);

    this.qualityMode = 'ultra';

    // State vectors for zero GC interpolation
    this._pos = new THREE.Vector3();
    this._rot = new THREE.Euler();
    this._seamColor = new THREE.Color();
    this._targetSeamColor = new THREE.Color();

    this.uniforms = {
      uHorizonColor: { value: new THREE.Color('#142442') },
      uBaseColor: { value: new THREE.Color('#03050a') },
      uHighlightColor: { value: new THREE.Color('#1e293b') },
      uSeamColor: { value: new THREE.Color('#93c5fd') },
      uFogStart: { value: 50.0 },
      uFogEnd: { value: 220.0 },
      uAtmosphereHaze: { value: 0.80 },
      uOcclusion: { value: 0.52 },
      uSeamIntensity: { value: 0.80 },
      uTime: { value: 0.0 }
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: megastructureShader.vertexShader,
      fragmentShader: megastructureShader.fragmentShader,
      uniforms: this.uniforms,
      depthTest: true,
      depthWrite: true,
      fog: false
    });

    this.beaconMaterial = new THREE.MeshBasicMaterial({
      color: '#f8fafc',
      transparent: true,
      opacity: 0.90
    });

    this.buildArchitecture();
  }

  buildArchitecture() {
    this.meshGroup = new THREE.Group();
    this.meshGroup.name = 'MegastructureGeometry';
    this.group.add(this.meshGroup);

    // 0. Subterranean Bedrock Base & Stepped Foundation Plinth (Rooted deep into crust)
    // Subterranean anchor core (sinks 35 units below horizon terrain line)
    const subGeo = new THREE.CylinderGeometry(36, 52, 40, 6, 1);
    const subMesh = new THREE.Mesh(subGeo, this.material);
    subMesh.position.set(0, -15, 0);
    subMesh.renderOrder = -1500;
    this.meshGroup.add(subMesh);

    // Stepped terrace plinth 1 (emerging above terrain floor)
    const plinth1Geo = new THREE.CylinderGeometry(28, 36, 12, 6, 1);
    const plinth1 = new THREE.Mesh(plinth1Geo, this.material);
    plinth1.position.set(0, 8, 0);
    plinth1.renderOrder = -1500;
    this.meshGroup.add(plinth1);

    // Stepped terrace plinth 2 (upper podium)
    const plinth2Geo = new THREE.CylinderGeometry(22, 28, 10, 6, 1);
    const plinth2 = new THREE.Mesh(plinth2Geo, this.material);
    plinth2.position.set(0, 16, 0);
    plinth2.renderOrder = -1500;
    this.meshGroup.add(plinth2);

    // Radial Ground Buttress Spurs (Structural monolithic roots pinning structure into bedrock)
    const spurGeo = new THREE.BoxGeometry(3.6, 50, 18);
    [-1, 1].forEach(side => {
      [0.0, 0.45, -0.45].forEach(rotAngle => {
        const spur = new THREE.Mesh(spurGeo, this.material);
        spur.position.set(side * 28 * Math.cos(rotAngle), 5, side * 28 * Math.sin(rotAngle));
        spur.rotation.y = rotAngle + (side === 1 ? 0 : Math.PI);
        spur.rotation.z = side * -0.28;
        spur.renderOrder = -1500;
        this.meshGroup.add(spur);
      });
    });

    // 1. Lower Colossal Bastion (Faceted monolithic citadel seated on podium)
    const bastionGeo = new THREE.CylinderGeometry(15, 22, 52, 6, 1);
    const bastion = new THREE.Mesh(bastionGeo, this.material);
    bastion.position.set(0, 45, 0);
    bastion.renderOrder = -1500;
    this.meshGroup.add(bastion);

    // Flanking bastion buttress fins
    const finGeo = new THREE.BoxGeometry(2.8, 54, 26);
    [-1, 1].forEach(side => {
      const fin = new THREE.Mesh(finGeo, this.material);
      fin.position.set(side * 18, 42, 0);
      fin.rotation.y = side * 0.28;
      fin.renderOrder = -1500;
      this.meshGroup.add(fin);
    });

    // 2. Central Monolith Spine (Soaring architectural pylon)
    const spineGeo = new THREE.CylinderGeometry(10.0, 15.0, 75, 6, 1);
    const spine = new THREE.Mesh(spineGeo, this.material);
    spine.position.set(0, 105, 0);
    spine.renderOrder = -1500;
    this.meshGroup.add(spine);

    // 3. Negative-space Central Cavity (Cathedral vertical rift)
    const portalVoidGeo = new THREE.BoxGeometry(4.0, 62, 24);
    const portalVoidMat = new THREE.MeshBasicMaterial({
      color: '#010204',
      transparent: true,
      opacity: 0.98
    });
    const portalVoid = new THREE.Mesh(portalVoidGeo, portalVoidMat);
    portalVoid.position.set(0, 100, 0);
    this.meshGroup.add(portalVoid);

    // 4. Apex Crown & Stratosphere Needle
    const crownGeo = new THREE.ConeGeometry(8.0, 52, 6);
    const crown = new THREE.Mesh(crownGeo, this.material);
    crown.position.set(0, 165, 0);
    crown.renderOrder = -1500;
    this.meshGroup.add(crown);

    // 5. Colossal Tilted Equatorial Torus (Floating planetary architectural ring)
    const ringGeo = new THREE.TorusGeometry(42, 2.0, 8, 64);
    const ring = new THREE.Mesh(ringGeo, this.material);
    ring.position.set(0, 112, 0);
    ring.rotation.x = Math.PI * 0.38;
    ring.rotation.y = 0.24;
    ring.renderOrder = -1490;
    this.meshGroup.add(ring);
    this.floatingRing = ring;

    // Secondary inner counter-ring
    const innerRingGeo = new THREE.TorusGeometry(30, 1.1, 6, 44);
    const innerRing = new THREE.Mesh(innerRingGeo, this.material);
    innerRing.position.set(0, 112, 0);
    innerRing.rotation.x = -Math.PI * 0.26;
    innerRing.rotation.z = -0.35;
    innerRing.renderOrder = -1490;
    this.meshGroup.add(innerRing);
    this.innerRing = innerRing;

    // 6. Colossal Diagonal Buttresses / Flying Tension Pylons
    // Anchored from upper spine directly down into the stepped foundation plinth
    const strutGeo = new THREE.BoxGeometry(3.2, 98, 4.0);
    [-1, 1].forEach((side) => {
      const strut = new THREE.Mesh(strutGeo, this.material);
      strut.position.set(side * 28, 56, 0);
      strut.rotation.z = side * -0.34;
      strut.renderOrder = -1500;
      this.meshGroup.add(strut);
    });

    // 7. Horizontal Cantilever Observation Stratum Collars
    const collarConfigs = [
      { y: 35, radius: 24.0, height: 2.4 },
      { y: 68, radius: 19.0, height: 2.2 },
      { y: 102, radius: 14.5, height: 1.8 },
      { y: 138, radius: 11.0, height: 1.6 }
    ];
    collarConfigs.forEach(cfg => {
      const collarGeo = new THREE.CylinderGeometry(cfg.radius, cfg.radius, cfg.height, 8);
      const collar = new THREE.Mesh(collarGeo, this.material);
      collar.position.set(0, cfg.y, 0);
      collar.renderOrder = -1495;
      this.meshGroup.add(collar);
    });

    // 8. Apex Beacon (Pulsing summit marker)
    const beaconGeo = new THREE.SphereGeometry(1.8, 12, 12);
    this.apexBeacon = new THREE.Mesh(beaconGeo, this.beaconMaterial);
    this.apexBeacon.position.set(0, 192, 0);
    this.meshGroup.add(this.apexBeacon);
  }

  setQualityMode(mode) {
    this.qualityMode = mode;
    if (mode === 'performance') {
      if (this.innerRing) this.innerRing.visible = false;
    } else {
      if (this.innerRing) this.innerRing.visible = true;
    }
  }

  update(deltaTime, elapsedTime, scrollProgress, isExplorer = false, horizonColor, fogColor) {
    this.uniforms.uTime.value = elapsedTime;

    if (horizonColor) {
      this.uniforms.uHorizonColor.value.copy(horizonColor);
    }

    // Keep megastructure permanently rooted at the distant horizon floor
    // Parallax is 100% natural and driven purely by the camera moving through 3D space
    this.group.position.set(8.0, -7.0, -165.0);
    this.group.rotation.set(0.02, -0.25, 0.0);
    this.group.scale.setScalar(1.0);

    // 1. Find bounding waypoints for atmospheric interpolation
    const clamped = THREE.MathUtils.clamp(scrollProgress, 0.0, 1.0);
    const waypoints = MEGASTRUCTURE_ATMOSPHERE_WAYPOINTS;
    const count = waypoints.length;
    let low = waypoints[0];
    let high = waypoints[count - 1];

    for (let i = 0; i < count - 1; i++) {
      if (clamped >= waypoints[i].progress && clamped <= waypoints[i + 1].progress) {
        low = waypoints[i];
        high = waypoints[i + 1];
        break;
      }
    }

    const span = Math.max(0.0001, high.progress - low.progress);
    const rawT = (clamped - low.progress) / span;
    // Smooth hermite ease
    const t = rawT * rawT * (3.0 - 2.0 * rawT);

    // 2. Interpolate Atmospheric Haze, Occlusion, Fog bounds, and Seam Glow
    this.uniforms.uOcclusion.value = THREE.MathUtils.lerp(low.occlusion, high.occlusion, t);
    this.uniforms.uFogStart.value = THREE.MathUtils.lerp(low.fogStart, high.fogStart, t);
    this.uniforms.uFogEnd.value = THREE.MathUtils.lerp(low.fogEnd, high.fogEnd, t);
    this.uniforms.uSeamIntensity.value = THREE.MathUtils.lerp(low.seamIntensity, high.seamIntensity, t);

    this._seamColor.set(low.seamColor);
    this._targetSeamColor.set(high.seamColor);
    this._seamColor.lerp(this._targetSeamColor, t);
    this.uniforms.uSeamColor.value.copy(this._seamColor);

    // 3. Subtle slow ambient rotation for the equatorial rings
    if (this.floatingRing) {
      this.floatingRing.rotation.z += deltaTime * 0.045;
    }
    if (this.innerRing) {
      this.innerRing.rotation.z -= deltaTime * 0.06;
    }

    // 4. Apex beacon slow pulse
    if (this.apexBeacon) {
      const beaconPulse = Math.pow(Math.sin(elapsedTime * 0.9) * 0.5 + 0.5, 4.0);
      this.beaconMaterial.opacity = 0.2 + beaconPulse * 0.8;
    }
  }

  dispose() {
    this.scene.remove(this.group);
    if (this.material) this.material.dispose();
    if (this.beaconMaterial) this.beaconMaterial.dispose();
  }
}
