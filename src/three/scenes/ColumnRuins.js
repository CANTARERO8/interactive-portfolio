import * as THREE from 'three';
import gsap from 'gsap';

export class ColumnRuins {
  constructor(app) {
    this.app = app;
    this.scene = app.engine.scene;
    this.columns = [];
    this.debris = [];
    this.glowingOrbs = [];
    this.monoliths = [];

    const monolithLayouts = [
      { x: -18.5, y: -2.0, z: 12,   w: 2.2, h: 14, d: 2.2, speed: 0.18, phase: 0.0 },
      { x: -21.0, y: -1.0, z: -15,  w: 2.6, h: 18, d: 2.6, speed: 0.12, phase: 2.5 },
      { x: -23.5, y: -0.5, z: -42,  w: 3.0, h: 22, d: 3.0, speed: 0.10, phase: 1.2 },
      { x: -26.0, y:  0.0, z: -72,  w: 3.4, h: 26, d: 3.4, speed: 0.08, phase: 4.8 },
      { x:  19.0, y: -2.0, z: 10,   w: 2.2, h: 14, d: 2.2, speed: 0.19, phase: 1.5 },
      { x:  21.5, y: -1.0, z: -14,  w: 2.5, h: 17, d: 2.5, speed: 0.14, phase: 3.2 },
      { x:  24.0, y: -0.5, z: -45,  w: 2.9, h: 21, d: 2.9, speed: 0.11, phase: 0.7 },
      { x:  26.5, y:  0.0, z: -75,  w: 3.3, h: 25, d: 3.3, speed: 0.09, phase: 5.1 }
    ];

    const monolithMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#050810'), 
      roughness: 0.7,
      metalness: 0.5,
      flatShading: true 
    });

    monolithLayouts.forEach(config => {
      const geo = new THREE.BoxGeometry(config.w, config.h, config.d);
      const mesh = new THREE.Mesh(geo, monolithMaterial);
      mesh.position.set(config.x, config.y, config.z);
      this.scene.add(mesh);
      this.monoliths.push({
        mesh,
        baseY: config.y,
        speed: config.speed,
        phase: config.phase
      });
    });

    const columnLayouts = [
      { x: -4.5, y: -3.5, z: 8,   scale: 1.6, rotY: 0.5 },
      { x: -5.0, y: -3.5, z: 4,   scale: 1.8, rotY: 0.2 },
      { x: -6.5, y: -3.5, z: -1,  scale: 2.2, rotY: 0.8 },
      { x: -5.5, y: -3.5, z: -6,  scale: 2.5, rotY: 1.4 },
      { x: -7.0, y: -3.5, z: -11, scale: 2.0, rotY: 0.5 },
      { x: -6.0, y: -3.5, z: -16, scale: 2.4, rotY: 1.1 },
      { x: -8.0, y: -3.5, z: -22, scale: 2.8, rotY: 0.3 },
      { x: -8.5, y: -3.5, z: -28, scale: 2.9, rotY: 0.9 },
      { x: -9.0, y: -3.5, z: -36, scale: 3.1, rotY: 1.2 },
      { x: -9.5, y: -3.5, z: -45, scale: 3.2, rotY: 0.4 },
      { x: -10.0, y: -3.5, z: -55, scale: 3.4, rotY: 0.9 },
      { x: -11.0, y: -3.5, z: -68, scale: 3.6, rotY: 1.5 },
      { x: -12.0, y: -3.5, z: -82, scale: 3.8, rotY: 0.7 },
      { x:  4.8, y: -3.5, z: 7,   scale: 1.7, rotY: 0.1 },
      { x:  5.5, y: -3.5, z: 2,   scale: 1.9, rotY: 0.5 },
      { x:  6.8, y: -3.5, z: -3,  scale: 2.4, rotY: 1.2 },
      { x:  5.0, y: -3.5, z: -8,  scale: 2.1, rotY: 0.9 },
      { x:  7.2, y: -3.5, z: -13, scale: 2.6, rotY: 1.5 },
      { x:  5.8, y: -3.5, z: -18, scale: 2.3, rotY: 0.2 },
      { x:  7.5, y: -3.5, z: -25, scale: 2.7, rotY: 0.7 },
      { x:  8.2, y: -3.5, z: -30, scale: 3.0, rotY: 1.3 },
      { x:  8.8, y: -3.5, z: -35, scale: 3.1, rotY: 0.8 },
      { x:  9.5, y: -3.5, z: -44, scale: 3.3, rotY: 1.1 },
      { x:  10.2, y: -3.5, z: -54, scale: 3.5, rotY: 0.2 },
      { x:  11.5, y: -3.5, z: -67, scale: 3.7, rotY: 1.4 },
      { x:  12.5, y: -3.5, z: -80, scale: 3.9, rotY: 0.5 }
    ];

    this.stoneMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0d162a'),
      roughness: 0.5,
      metalness: 0.45,
      flatShading: false
    });

    columnLayouts.forEach((config) => {
      const colGroup = this.buildSingleColumn(config.scale);
      colGroup.position.set(config.x, config.y, config.z);
      colGroup.rotation.y = config.rotY;
      this.scene.add(colGroup);
      this.columns.push({
        group: colGroup,
        baseY: config.y,
        floatSeed: Math.random() * 100,
        floatSpeed: 0.25 + Math.random() * 0.25
      });
    });

    for (let i = 0; i < 22; i++) {
      const w = 0.3 + Math.random() * 0.7;
      const h = 0.15 + Math.random() * 0.35;
      const d = 0.3 + Math.random() * 0.7;
      const boxGeo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(boxGeo, this.stoneMaterial);
      const dx = (Math.random() - 0.5) * 22;
      const dy = -2.5 + Math.random() * 7.5;
      const dz = 10 - Math.random() * 95;
      mesh.position.set(dx, dy, dz);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(mesh);
      this.debris.push({
        mesh,
        baseY: dy,
        speed: 0.3 + Math.random() * 0.6,
        rotSpeedX: (Math.random() - 0.5) * 0.15,
        rotSpeedY: (Math.random() - 0.5) * 0.15,
        rotSpeedZ: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * 10
      });
    }

    const orbColors = ['#00f3ff', '#9d00ff', '#fbbf24', '#ff0055'];
    for (let i = 0; i < 10; i++) {
      const color = orbColors[i % orbColors.length];
      
      const orbGeo = new THREE.SphereGeometry(0.08 + Math.random() * 0.14, 8, 8);
      const orbMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      });
      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      const ox = (Math.random() - 0.5) * 28;
      const oy = -1.5 + Math.random() * 8.0;
      const oz = -2 - Math.random() * 85;
      orbMesh.position.set(ox, oy, oz);
      this.scene.add(orbMesh);
      this.glowingOrbs.push({
        mesh: orbMesh,
        initialY: oy,
        speed: 0.35 + Math.random() * 0.55,
        phase: Math.random() * 100,
        driftX: (Math.random() - 0.5) * 0.15
      });
    }

    this.sparksCount = 1200;
    this.sparksGeometry = new THREE.BufferGeometry();
    const sparksPositions = new Float32Array(this.sparksCount * 3);

    this._sparksSpeed  = new Float32Array(this.sparksCount);
    this._sparksDriftX = new Float32Array(this.sparksCount);

    for (let i = 0; i < this.sparksCount; i++) {
      sparksPositions[i * 3]     = (Math.random() - 0.5) * 24;
      sparksPositions[i * 3 + 1] = -5 + Math.random() * 15;
      sparksPositions[i * 3 + 2] = 8 - Math.random() * 90;
      this._sparksSpeed[i]  = 0.5 + Math.random() * 0.8;
      this._sparksDriftX[i] = (Math.random() - 0.5) * 0.1;
    }

    this.sparksGeometry.setAttribute('position', new THREE.BufferAttribute(sparksPositions, 3));
    this.sparksMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#00f2fe'),
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.sparksPoints = new THREE.Points(this.sparksGeometry, this.sparksMaterial);
    this.scene.add(this.sparksPoints);

    this.waterGeometry = new THREE.PlaneGeometry(180, 180, 64, 64);
    this.waterMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vElevation;
        
        void main() {
          vec3 displaced = position;
          // Simplified 2-wave blend (was 3) — same visual, less GPU
          float wave1 = sin(position.x * 0.12 + uTime * 0.3) * cos(position.y * 0.08 + uTime * 0.2) * 0.5;
          float wave2 = cos(position.x * 0.24 - uTime * 0.15) * sin(position.y * 0.32 + uTime * 0.25) * 0.25;
          float elevation = wave1 + wave2;
          displaced.z += elevation * 0.85;
          vElevation = elevation;
          vUv = uv;
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displaced, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform vec3 uDepthColor;
        uniform vec3 uSurfaceColor;
        uniform vec3 uHighlightColor1;
        uniform vec3 uHighlightColor2;
        
        void main() {
          float mixStrength = (vElevation + 0.5) * 0.8;
          vec3 baseColor = mix(uDepthColor, uSurfaceColor, clamp(mixStrength, 0.0, 1.0));
          // Simplified specular: single additive highlight from elevation
          vec3 spec = uHighlightColor1 * pow(clamp(vElevation + 0.5, 0.0, 1.0), 8.0) * 0.6;
          float borderFade = sin(vUv.x * 3.14159) * sin(vUv.y * 3.14159);
          borderFade = pow(borderFade, 1.2);
          gl_FragColor = vec4(baseColor + spec, 0.8 * borderFade);
        }
      `,
      uniforms: {
        uTime:           { value: 0 },
        uDepthColor:     { value: new THREE.Color('#03061c') },
        uSurfaceColor:   { value: new THREE.Color('#101838') },
        uHighlightColor1:{ value: new THREE.Color('#00f3ff') },
        uHighlightColor2:{ value: new THREE.Color('#9d00ff') }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    });
    this.waterMesh = new THREE.Mesh(this.waterGeometry, this.waterMaterial);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = -3.5;
    this.scene.add(this.waterMesh);

    this.setupLights();

    this.drones = [];
    const droneConfigs = [
      
      {
        type: 'flying',
        baseY: 3.2,
        scale: 1.6,
        speed: 1.0,
        minX: -6.0, maxX: 6.0,
        minZ: -5.0, maxZ: 8.0,
        floatAmpY: 0.8, floatSpeedY: 1.3,
        glowColor: '#3a6b82', hasLight: true 
      },
      {
        type: 'flying',
        baseY: 5.4,
        scale: 1.5,
        speed: 1.2,
        minX: -6.5, maxX: 6.5,
        minZ: -15.0, maxZ: -2.0,
        floatAmpY: 0.9, floatSpeedY: 1.0,
        glowColor: '#8f7547', hasLight: true 
      },
      {
        type: 'flying',
        baseY: 4.0,
        scale: 1.3,
        speed: 1.3,
        minX: -6.0, maxX: 6.0,
        minZ: -45.0, maxZ: -25.0,
        floatAmpY: 0.75, floatSpeedY: 1.5,
        glowColor: '#517559', hasLight: true 
      },
      {
        type: 'flying',
        baseY: 6.0,
        scale: 1.2,
        speed: 1.1,
        minX: -5.8, maxX: 5.8,
        minZ: -40.0, maxZ: -5.0,
        floatAmpY: 1.0, floatSpeedY: 0.95,
        glowColor: '#824a52', hasLight: true 
      },
      
      {
        type: 'scanning',
        parentType: 'column',
        columnIndex: 3, 
        columnScale: 2.5,
        scale: 1.3,
        rotY: 0.6,
        glowColor: '#5f4c70', 
        hasLight: true
      },
      {
        type: 'scanning',
        parentType: 'column',
        columnIndex: 17, 
        columnScale: 2.6,
        scale: 1.3,
        rotY: -0.5,
        glowColor: '#3a6b82', 
        hasLight: true
      }
    ];

    droneConfigs.forEach(config => {
      
      const droneData = this.buildDrone(config.scale, config.glowColor || '#00f2fe', config.type, config);
      
      droneData.cycleSeed = Math.random() * 100;

      if (config.parentType === 'column') {
        const col = this.columns[config.columnIndex];
        if (col) {
          droneData.baseY = 5.87;
          droneData.z = 0;
          droneData.group.position.set(0, 5.87, 0);
          droneData.group.rotation.y = config.rotY || 0;
          col.group.add(droneData.group);
        }
      } else if (config.parentType === 'monolith') {
        const mon = this.monoliths[config.monolithIndex];
        if (mon) {
          const monConfig = monolithLayouts[config.monolithIndex];
          const topY = monConfig.h / 2;
          droneData.baseY = topY;
          droneData.z = 0;
          droneData.group.position.set(0, topY, 0);
          droneData.group.rotation.y = config.rotY || 0;
          mon.mesh.add(droneData.group);
        }
      } else {
        
        droneData.baseY = config.baseY;
        droneData.minX = config.minX;
        droneData.maxX = config.maxX;
        droneData.minZ = config.minZ;
        droneData.maxZ = config.maxZ;
        droneData.speed = config.speed;
        
        const startX = config.minX + Math.random() * (config.maxX - config.minX);
        const startZ = config.minZ + Math.random() * (config.maxZ - config.minZ);
        
        const angle = Math.random() * Math.PI * 2;
        droneData.vx = Math.cos(angle) * config.speed;
        droneData.vz = Math.sin(angle) * config.speed;

        droneData.group.position.set(startX, droneData.baseY, startZ);
        droneData.group.rotation.y = Math.atan2(droneData.vz, droneData.vx);
        this.scene.add(droneData.group);
      }

      this.drones.push(droneData);
    });

    this.raycaster = new THREE.Raycaster();
    this.mouse2D = new THREE.Vector2();

    this.onCanvasClick = (e) => {
      if (e.target !== this.app.canvas) return;

      this.mouse2D.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse2D.y = -(e.clientY / window.innerHeight - 0.5) * 2;

      this.raycaster.setFromCamera(this.mouse2D, this.app.engine.camera);

      const targets = [];
      this.drones.forEach(drone => {
        drone.group.traverse(child => {
          if (child.isMesh) {
            child.userData = { drone };
            targets.push(child);
          }
        });
      });

      const intersects = this.raycaster.intersectObjects(targets);
      if (intersects.length > 0) {
        const drone = intersects[0].object.userData.drone;
        if (drone && !drone.isAnimating && !drone.isTurning) {
          this.triggerDroneSpin(drone);
        }
      }
    };
    window.addEventListener('click', this.onCanvasClick);
  }

  buildDrone(scale = 0.5, glowColor = '#00f2fe', type = 'default', config = {}) {
    const droneGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#10141e'),
      roughness: 0.7,
      metalness: 0.6,
      flatShading: true
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(glowColor)
    });

    let baseScaleX = scale;
    let baseScaleY = scale;
    let baseScaleZ = scale;

    if (config.parentType === 'column') {
      const colScale = config.columnScale || 1.0;
      baseScaleX /= colScale;
      baseScaleY /= colScale;
      baseScaleZ /= colScale;
    }

    const coreGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 6);
    const core = new THREE.Mesh(coreGeo, bodyMat);
    core.rotation.y = Math.PI / 6;
    droneGroup.add(core);

    const lensGeo = new THREE.BoxGeometry(0.16, 0.05, 0.05);
    const lens = new THREE.Mesh(lensGeo, glowMat);
    lens.position.set(0.18, 0.02, 0);
    droneGroup.add(lens);

    const armGeo = new THREE.BoxGeometry(0.48, 0.03, 0.04);
    const angles = [Math.PI / 4, 3 * Math.PI / 4, -Math.PI / 4, -3 * Math.PI / 4];
    const propellers = [];

    angles.forEach(angle => {
      const armGroup = new THREE.Group();
      armGroup.rotation.y = angle;
      
      const armMesh = new THREE.Mesh(armGeo, bodyMat);
      armMesh.position.x = 0.24;
      armGroup.add(armMesh);

      const motorGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6);
      const motor = new THREE.Mesh(motorGeo, bodyMat);
      motor.position.set(0.48, 0.04, 0);
      armGroup.add(motor);

      const propGroup = new THREE.Group();
      propGroup.position.set(0.48, 0.09, 0);
      
      const bladeGeo = new THREE.BoxGeometry(0.36, 0.008, 0.03);
      const bladeMesh = new THREE.Mesh(bladeGeo, bodyMat);
      propGroup.add(bladeMesh);
      
      armGroup.add(propGroup);
      droneGroup.add(armGroup);
      
      propellers.push(propGroup);
    });

    const ringGeo = new THREE.TorusGeometry(0.34, 0.012, 4, 16);
    const ring = new THREE.Mesh(ringGeo, bodyMat);
    ring.rotation.x = Math.PI / 2;
    droneGroup.add(ring);

    const ledMatRed = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const ledMatGreen = new THREE.MeshBasicMaterial({ color: 0x33ff00 });
    
    const ledGeo = new THREE.SphereGeometry(0.02, 4, 4);
    const led1 = new THREE.Mesh(ledGeo, ledMatRed);
    led1.position.set(-0.15, 0.08, 0.08);
    droneGroup.add(led1);

    const led2 = new THREE.Mesh(ledGeo, ledMatGreen);
    led2.position.set(-0.15, 0.08, -0.08);
    droneGroup.add(led2);

    const scannerGroup = new THREE.Group();
    scannerGroup.position.set(0, -0.08, 0);
    
    scannerGroup.rotation.x = Math.PI / 2;
    droneGroup.add(scannerGroup);

    const emitterGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.06, 6);
    emitterGeo.rotateX(Math.PI / 2); 
    const emitter = new THREE.Mesh(emitterGeo, bodyMat);
    scannerGroup.add(emitter);

    const laserGeo = new THREE.CylinderGeometry(0.015, 0.25, 1.0, 8, 1, true);
    laserGeo.rotateX(Math.PI / 2); 
    laserGeo.translate(0, 0, 0.5); 
    
    const laserMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(glowColor),
      transparent: true,
      opacity: 0.20, 
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    scannerGroup.add(laser);

    const flareGeo = new THREE.RingGeometry(0.01, 0.25, 12);
    
    const flareMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(glowColor),
      transparent: true,
      opacity: 0.45, 
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const flare = new THREE.Mesh(flareGeo, flareMat);
    scannerGroup.add(flare);

    if (config.hasLight) {
      const spotColor = new THREE.Color(glowColor);
      const spotLight = new THREE.SpotLight(spotColor, 6.0, 32.0, Math.PI / 5, 0.6, 1.0); 
      spotLight.position.set(0, 0, 0);
      scannerGroup.add(spotLight);

      const spotTarget = new THREE.Object3D();
      spotTarget.position.set(0, 0, 10);
      scannerGroup.add(spotTarget);
      spotLight.target = spotTarget;
    }

    droneGroup.scale.set(baseScaleX, baseScaleY, baseScaleZ);

    return {
      group: droneGroup,
      ring,
      propellers,
      scanner: scannerGroup,
      laser,
      flare,
      leds: [led1, led2],
      config,
      type,
      scale,
      baseScaleX,
      baseScaleY,
      baseScaleZ,
      glowColor,
      isAnimating: false,
      isTurning: false
    };
  }

  triggerDroneSpin(drone) {
    drone.isAnimating = true;
    if (window.soundManager) {
      window.soundManager.playChirp();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        drone.isAnimating = false;
      }
    });

    tl.to(drone.group.rotation, {
      y: '+=6.283185',
      duration: 0.45,
      ease: 'power2.inOut'
    });

    const originalOpacity = drone.laser.material.opacity;
    drone.flare.scale.set(0.1, 0.1, 0.1);
    
    tl.to(drone.laser.material, {
      opacity: 0.85,
      duration: 0.08,
      yoyo: true,
      repeat: 1
    }, '<');

    tl.to(drone.flare.scale, {
      x: 3.5,
      y: 3.5,
      z: 3.5,
      duration: 0.5,
      ease: 'power1.out'
    }, '<');

    tl.to(drone.flare.material, {
      opacity: 0.0,
      duration: 0.42,
      ease: 'power1.out'
    }, '<+0.08');
  }

  buildSingleColumn(scale) {
    const colGroup = new THREE.Group();
    const mat = this.stoneMaterial;
    
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.4), mat);
    base1.position.y = 0.125;
    colGroup.add(base1);
    
    const base2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), mat);
    base2.position.y = 0.35;
    colGroup.add(base2);

    const shaftHeight = 5.2;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, shaftHeight, 16), mat);
    shaft.position.y = 0.45 + shaftHeight / 2;
    colGroup.add(shaft);

    const capY = 0.45 + shaftHeight;
    const abacus = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.22, 1.15), mat);
    abacus.position.y = capY + 0.11;
    colGroup.add(abacus);

    const voluteGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.28, 10);
    const voluteLeft = new THREE.Mesh(voluteGeo, mat);
    voluteLeft.rotation.z = Math.PI / 2;
    voluteLeft.position.set(-0.45, capY - 0.05, 0);
    colGroup.add(voluteLeft);

    const voluteRight = new THREE.Mesh(voluteGeo, mat);
    voluteRight.rotation.z = Math.PI / 2;
    voluteRight.position.set(0.45, capY - 0.05, 0);
    colGroup.add(voluteRight);

    colGroup.scale.set(scale, scale, scale);
    return colGroup;
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight('#111625', 0.25);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#00f2fe', 0.20);
    dirLight.position.set(2, 16, 5);
    this.scene.add(dirLight);

    const spotLight1 = new THREE.SpotLight('#00f2fe', 15, 40, Math.PI / 4, 0.8, 1);
    spotLight1.position.set(-8, 18, 4);
    this.scene.add(spotLight1);

    const spotLight2 = new THREE.SpotLight('#9d00ff', 12, 36, Math.PI / 4, 0.8, 1);
    spotLight2.position.set(8, 14, -8);
    this.scene.add(spotLight2);

    const spotLight3 = new THREE.SpotLight('#fbbf24', 15, 35, Math.PI / 4, 0.8, 1);
    spotLight3.position.set(0, 14, -22);
    this.scene.add(spotLight3);
  }

  update(deltaTime, elapsedTime, scrollProgress) {
    const colCount = this.columns.length;
    const debrisCount = this.debris.length;
    const orbCount = this.glowingOrbs.length;
    const monolithCount = this.monoliths.length;

    const droneCount = this.drones ? this.drones.length : 0;
    for (let i = 0; i < droneCount; i++) {
      const drone = this.drones[i];

      drone.propellers.forEach((prop, idx) => {
        prop.rotation.y += (idx % 2 === 0 ? 1 : -1) * 22.0 * deltaTime;
      });

      drone.ring.rotation.z += 1.4 * deltaTime;

      const blink = Math.sin(elapsedTime * 8.0) > 0.0;
      drone.leds[0].visible = blink;
      drone.leds[1].visible = !blink;

      if (drone.config.type === 'flying') {
        let x = drone.group.position.x;
        let z = drone.group.position.z;
        
        if (!drone.isAnimating) {
          x += drone.vx * deltaTime;
          z += drone.vz * deltaTime;

          let bounced = false;
          if (x < drone.minX) {
            x = drone.minX;
            drone.vx = Math.abs(drone.vx);
            bounced = true;
          } else if (x > drone.maxX) {
            x = drone.maxX;
            drone.vx = -Math.abs(drone.vx);
            bounced = true;
          }

          if (z < drone.minZ) {
            z = drone.minZ;
            drone.vz = Math.abs(drone.vz);
            bounced = true;
          } else if (z > drone.maxZ) {
            z = drone.maxZ;
            drone.vz = -Math.abs(drone.vz);
            bounced = true;
          }

          if (bounced) {
            const currentSpeed = drone.speed;
            const currentAngle = Math.atan2(drone.vz, drone.vx);
            const perturbation = (Math.random() - 0.5) * 0.4;
            const newAngle = currentAngle + perturbation;
            drone.vx = Math.cos(newAngle) * currentSpeed;
            drone.vz = Math.sin(newAngle) * currentSpeed;
          }

          drone.group.position.x = x;
          drone.group.position.z = z;

          const floatSpeedY = drone.config.floatSpeedY || 1.2;
          const floatAmpY = drone.config.floatAmpY || 0.5;
          drone.group.position.y = drone.baseY + Math.sin(elapsedTime * floatSpeedY + drone.cycleSeed) * floatAmpY;

          const targetYaw = Math.atan2(drone.vz, drone.vx);
          let diff = targetYaw - drone.group.rotation.y;
          diff = Math.atan2(Math.sin(diff), Math.cos(diff));
          drone.group.rotation.y += diff * 4.0 * deltaTime;

          const banking = diff * 0.35;
          drone.group.rotation.x = Math.sin(elapsedTime * floatSpeedY + drone.cycleSeed) * 0.12;
          drone.group.rotation.z = banking + Math.cos(elapsedTime * 1.5 + drone.cycleSeed) * 0.05;
        }
      }

      if (!drone.isAnimating) {
        const sweepSpeedX = 1.0 + Math.sin(drone.cycleSeed) * 0.3;
        const sweepSpeedZ = 0.8 + Math.cos(drone.cycleSeed) * 0.2;
        const sweepAmpX = 0.55;
        const sweepAmpZ = 0.55;

        drone.scanner.rotation.x = Math.PI / 2 + Math.sin(elapsedTime * sweepSpeedX + drone.cycleSeed) * sweepAmpX;
        drone.scanner.rotation.y = Math.cos(elapsedTime * sweepSpeedZ + drone.cycleSeed * 1.5) * sweepAmpZ;
        drone.scanner.rotation.z = 0;
      }

      const scannerWorldPos = new THREE.Vector3();
      drone.scanner.getWorldPosition(scannerWorldPos);
      
      const scannerWorldDir = new THREE.Vector3(0, 0, 1);
      const q = new THREE.Quaternion();
      drone.scanner.getWorldQuaternion(q);
      scannerWorldDir.applyQuaternion(q);

      const floorY = -3.5;
      const heightDiff = scannerWorldPos.y - floorY;
      
      let t = heightDiff;
      if (scannerWorldDir.y < -0.1) {
        t = -heightDiff / scannerWorldDir.y;
      }
      
      t = Math.max(1.0, Math.min(30.0, t));

      drone.laser.scale.z = t;
      drone.flare.position.z = t;

      if (!drone.isAnimating) {
        const flarePulse = (elapsedTime * 1.8 + drone.cycleSeed) % 1.0;
        drone.flare.scale.set(flarePulse * 1.5, flarePulse * 1.5, 1.0);
        drone.flare.material.opacity = (1.0 - flarePulse) * 0.75;
      }
    }

    for (let i = 0; i < colCount; i++) {
      const c = this.columns[i];
      const offset = elapsedTime * c.floatSpeed;
      c.group.position.y = c.baseY + Math.sin(c.floatSeed + offset) * 0.12;
      c.group.rotation.x = Math.sin(c.floatSeed + offset * 0.5) * 0.02;
    }

    for (let i = 0; i < monolithCount; i++) {
      const m = this.monoliths[i];
      m.mesh.position.y = m.baseY + Math.sin(m.phase + elapsedTime * m.speed) * 0.16;
      m.mesh.rotation.y = elapsedTime * 0.005 + m.phase;
    }

    for (let i = 0; i < debrisCount; i++) {
      const d = this.debris[i];
      d.mesh.position.y = d.baseY + Math.sin(d.phase + elapsedTime * d.speed) * 0.22;
      d.mesh.rotation.x += d.rotSpeedX * deltaTime;
      d.mesh.rotation.y += d.rotSpeedY * deltaTime;
      d.mesh.rotation.z += d.rotSpeedZ * deltaTime;
    }

    for (let i = 0; i < orbCount; i++) {
      const o = this.glowingOrbs[i];
      o.mesh.position.y = o.initialY + Math.sin(o.phase + elapsedTime * o.speed) * 0.45;
      o.mesh.position.x += Math.sin(elapsedTime * o.speed) * o.driftX * deltaTime;
    }

    const posArr = this.sparksGeometry.attributes.position.array;
    const sparksSpeed  = this._sparksSpeed;
    const sparksDriftX = this._sparksDriftX;
    const scrollVelocity = 1.0 + scrollProgress * 6.0;
    const sparksCount = this.sparksCount;

    for (let i = 0; i < sparksCount; i++) {
      const idx = i * 3;
      posArr[idx + 1] += sparksSpeed[i] * scrollVelocity * deltaTime;
      posArr[idx]     += Math.sin(elapsedTime * 0.8 + i) * sparksDriftX[i] * deltaTime;
      if (posArr[idx + 1] > 12.0) {
        posArr[idx + 1] = -5.0;
        posArr[idx]     = (Math.random() - 0.5) * 22;
        posArr[idx + 2] = 8 - Math.random() * 90;
      }
    }
    this.sparksGeometry.attributes.position.needsUpdate = true;

    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uTime.value = elapsedTime;
    }

    const devopsProgress = 6 / 8;
    const distanceToDevops = Math.abs(scrollProgress - devopsProgress);
    const devopsEnvelope = Math.max(0, 1.0 - distanceToDevops / 0.16);

    if (devopsEnvelope > 0.1) {
      this.sparksMaterial.color.set('#ff007f');
      this.sparksMaterial.size = 0.12;
      if (this.waterMaterial) {
        this.waterMaterial.uniforms.uHighlightColor1.value.set('#ff0055');
        this.waterMaterial.uniforms.uHighlightColor2.value.set('#ffaa00');
      }
    } else {
      this.sparksMaterial.color.set('#00f2fe');
      this.sparksMaterial.size = 0.08;
      if (this.waterMaterial) {
        this.waterMaterial.uniforms.uHighlightColor1.value.set('#00f3ff');
        this.waterMaterial.uniforms.uHighlightColor2.value.set('#9d00ff');
      }
    }
  }
}
