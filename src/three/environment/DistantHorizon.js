import * as THREE from 'three';

const horizonShader = {
  vertexShader: `
    varying vec3 vWorldPosition;
    varying float vFogDepth;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = viewMatrix * worldPos;
      vFogDepth = -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    precision highp float;

    uniform vec3 uHorizonColor;
    uniform vec3 uBaseColor;
    uniform float uFogStart;
    uniform float uFogEnd;
    uniform float uAtmosphereHaze;

    varying vec3 vWorldPosition;
    varying float vFogDepth;

    void main() {
      // Atmospheric distance fade (Aerial Perspective / Rayleigh depth)
      float depthFactor = smoothstep(uFogStart, uFogEnd, vFogDepth);
      
      // Vertical atmospheric haze: lower base gets washed by ground fog/horizon
      float heightHaze = smoothstep(25.0, -10.0, vWorldPosition.y) * 0.42;
      float totalHaze = clamp(depthFactor + heightHaze * uAtmosphereHaze, 0.0, 0.94);

      vec3 finalColor = mix(uBaseColor, uHorizonColor, totalHaze);
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export class DistantHorizon {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = 'DistantHorizonSystem';
    this.scene.add(this.group);

    this.qualityMode = 'ultra';
    this.uniforms = {
      uHorizonColor: { value: new THREE.Color('#142442') },
      uBaseColor: { value: new THREE.Color('#03060d') },
      uFogStart: { value: 70.0 },
      uFogEnd: { value: 240.0 },
      uAtmosphereHaze: { value: 0.85 }
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader: horizonShader.vertexShader,
      fragmentShader: horizonShader.fragmentShader,
      uniforms: this.uniforms,
      depthTest: true,
      depthWrite: true,
      fog: false
    });

    this.beaconPositions = [];
    this.beaconPhases = [];
    this.buildMountainRanges();
    this.buildMegastructureSilhouettes();
    this.buildDistantBeacons();
  }

  buildMountainRanges() {
    this.mountainGroup = new THREE.Group();
    this.group.add(this.mountainGroup);

    // Procedural distant mountain ridges positioned in background flanks (forming a vast scenic valley)
    const ridgeConfigs = [
      // Left far flank (oriented along Z-axis facing inward)
      { segments: 20, width: 260, height: 46, depth: 35, x: -85, y: -4, z: -40, rotY: Math.PI * 0.5 },
      // Right far flank (oriented along Z-axis facing inward)
      { segments: 20, width: 260, height: 44, depth: 35, x: 85, y: -4, z: -40, rotY: -Math.PI * 0.5 },
      // Distant north horizon (deep rear background behind the megastructure)
      { segments: 24, width: 320, height: 48, depth: 40, x: 0, y: -8, z: -175, rotY: 0.0 },
      // Distant south horizon (deep front)
      { segments: 18, width: 240, height: 36, depth: 35, x: 0, y: -6, z: 65, rotY: Math.PI }
    ];

    ridgeConfigs.forEach(cfg => {
      const geo = new THREE.PlaneGeometry(cfg.width, cfg.height, cfg.segments, 8);
      const pos = geo.attributes.position;
      
      // Sculpt jagged low-poly ridges
      for (let i = 0; i < pos.count; i++) {
        const u = (pos.getX(i) / cfg.width) + 0.5;
        const v = (pos.getY(i) / cfg.height) + 0.5;
        
        if (v > 0.05) {
          const crestWave1 = Math.sin(u * 7.0) * 0.28;
          const crestWave2 = Math.cos(u * 17.0) * 0.15;
          const crestWave3 = Math.sin(u * 33.0) * 0.07;
          const heightMultiplier = Math.max(0.0, 1.0 - Math.pow(Math.abs(u - 0.5) * 2.0, 1.8));
          
          const displacement = (crestWave1 + crestWave2 + crestWave3) * cfg.height * heightMultiplier * v;
          pos.setY(i, pos.getY(i) + displacement);
          pos.setZ(i, (Math.sin(u * 11.0) * 12.0) * v);

          // Register occasional mountain peaks for beacon lights
          if (v > 0.85 && Math.random() < 0.14) {
            const worldY = cfg.y + pos.getY(i);
            const worldX = cfg.x + pos.getX(i);
            const worldZ = cfg.z + pos.getZ(i);
            this.beaconPositions.push(worldX, worldY + 0.4, worldZ);
            this.beaconPhases.push(Math.random() * 6.28);
          }
        }
      }
      geo.computeVertexNormals();

      const mesh = new THREE.Mesh(geo, this.material);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.y = cfg.rotY;
      mesh.renderOrder = -1600;
      this.mountainGroup.add(mesh);
    });
  }

  buildMegastructureSilhouettes() {
    this.towerGroup = new THREE.Group();
    this.group.add(this.towerGroup);

    // Colossal architecture needles & pylons kilometers away
    const towerConfigs = [
      { x: -72, y: 12, z: -15, w: 4.5, h: 58, d: 4.5 },
      { x: -84, y: 18, z: -48, w: 5.8, h: 74, d: 5.8 },
      { x: -68, y: 10, z: -85, w: 4.2, h: 52, d: 4.2 },
      { x: 74, y: 14, z: -22, w: 5.0, h: 64, d: 5.0 },
      { x: 86, y: 20, z: -55, w: 6.2, h: 80, d: 6.2 },
      { x: 70, y: 12, z: -92, w: 4.4, h: 56, d: 4.4 },
      // Distant deep rear megastructures
      { x: -28, y: 22, z: -115, w: 7.0, h: 88, d: 7.0 },
      { x: 32, y: 24, z: -120, w: 7.5, h: 92, d: 7.5 }
    ];

    towerConfigs.forEach((t, index) => {
      const geo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const mesh = new THREE.Mesh(geo, this.material);
      mesh.position.set(t.x, t.y, t.z);
      mesh.renderOrder = -1550;
      this.towerGroup.add(mesh);

      // Add a spire beacon at top of each needle
      this.beaconPositions.push(t.x, t.y + t.h * 0.5 + 0.3, t.z);
      this.beaconPhases.push(index * 0.82);
    });
  }

  buildDistantBeacons() {
    if (this.beaconPositions.length === 0) return;

    const count = this.beaconPositions.length / 3;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.beaconPositions, 3));
    geometry.setAttribute('phase', new THREE.Float32BufferAttribute(this.beaconPhases, 1));

    // Procedural soft point texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(180, 220, 255, 0.7)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const beaconMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float phase;
        uniform float uTime;
        varying float vAlpha;

        void main() {
          // Extremely slow organic pulse (0.18 Hz)
          float pulse = sin(uTime * 1.15 + phase) * 0.5 + 0.5;
          vAlpha = 0.12 + pulse * 0.32;
          vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
          gl_PointSize = (28.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          vec4 tex = texture2D(uTexture, gl_PointCoord);
          gl_FragColor = vec4(uColor, tex.a * vAlpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: texture },
        uColor: { value: new THREE.Color('#94b8db') }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false
    });

    this.beacons = new THREE.Points(geometry, beaconMaterial);
    this.beacons.renderOrder = -1500;
    this.group.add(this.beacons);
  }

  setHorizonColor(color) {
    this.uniforms.uHorizonColor.value.copy(color);
  }

  setQualityMode(mode) {
    this.qualityMode = mode;
    if (mode === 'performance') {
      if (this.beacons) this.beacons.visible = false;
      this.uniforms.uAtmosphereHaze.value = 0.95;
    } else {
      if (this.beacons) this.beacons.visible = true;
      this.uniforms.uAtmosphereHaze.value = mode === 'ultra-plus' ? 0.78 : 0.85;
    }
  }

  update(deltaTime, elapsedTime) {
    if (this.beacons && this.beacons.material.uniforms) {
      this.beacons.material.uniforms.uTime.value = elapsedTime;
    }
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (child.material.map) child.material.map.dispose();
        child.material.dispose();
      }
    });
  }
}
