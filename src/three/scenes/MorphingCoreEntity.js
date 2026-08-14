import * as THREE from 'three';
import gsap from 'gsap';

export class MorphingCoreEntity {
  constructor(app) {
    this.app = app;
    this.scene = app.engine.scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Master state
    this.isHovered = false;
    this.hoverProgress = 0; // 0 (assembled) to 1 (fully exploded)
    this.targetHover = 0;
    this.isSpinning = false;
    this.isOverclocked = false;

    // Raycasting for direct mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse2D = new THREE.Vector2();
    this.interactiveMeshes = [];

    // Initialize materials
    this.initMaterials();

    // Build the 6 Morphing Artifact Entities
    this.forms = {};
    this.buildHeroMonolith();
    this.buildAboutPolyhedron();
    this.buildProjectsArchiveCore();
    this.buildVuePrism();
    this.buildLaravelColumns();
    this.buildPostgresBeacon();
    this.buildWordPressLayoutCore();
    this.buildContactSingularity();

    // Waypoints for the entity placement along the scroll corridor
    // Z positions and offsets carefully matched to each section's biome center
    this.entityWaypoints = [
      { pos: [0, 0.8, 1.5],     scale: 1.0, activeForm: 'hero' },      // 0: Hero
      { pos: [0, 0.5, -8.0],    scale: 0.95, activeForm: 'about' },    // 1: About (Data Vault)
      { pos: [0, 0.0, -16.0],   scale: 0.9, activeForm: 'projects' },  // 2: Projects Archive
      { pos: [0, 0.5, -25.0],   scale: 1.0, activeForm: 'vue' },       // 3: Vue (Crystal Chamber)
      { pos: [0, 0.8, -35.0],   scale: 1.05, activeForm: 'laravel' },  // 4: Laravel (Citadel)
      { pos: [0, 3.45, -46.0],  scale: 0.62, activeForm: 'postgres' }, // 5: Postgres (overhead DB beacon)
      { pos: [0, 0.2, -58.0],   scale: 0.95, activeForm: 'wordpress' },// 6: WordPress Foundry
      { pos: [0, 3.2, -72.0],   scale: 1.5, activeForm: 'contact' }    // 7: Contact (Singularity)
    ];

    // Setup pointer events
    this.setupInteractions();
  }

  initMaterials() {
    // Dark polished armor keeps the artifacts dimensional without drawn outlines.
    this.armorMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0b1120'),
      roughness: 0.28,
      metalness: 0.86,
      clearcoat: 0.3,
      clearcoatRoughness: 0.28,
      flatShading: false
    });

    // Solid emissive rings remain as intentional energy cues, not mesh outlines.
    this.ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00f2fe'),
      transparent: true,
      opacity: 0.58,
      toneMapped: false
    });

    // Glowing Inner Energy Core Material
    this.coreEnergyMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00f2fe'),
      wireframe: false,
      transparent: true,
      opacity: 0.9
    });

    // Outer Aura Glow Material
    this.auraMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false
    });

    // Tech Accents
    this.vueMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#10b981'),
      emissive: new THREE.Color('#053e2b'),
      emissiveIntensity: 0.5,
      roughness: 0.22,
      metalness: 0.78,
      clearcoat: 0.38,
      clearcoatRoughness: 0.2,
      flatShading: true
    });

    this.laravelMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ef4444'),
      emissive: new THREE.Color('#5a0b10'),
      emissiveIntensity: 0.42,
      roughness: 0.26,
      metalness: 0.82,
      clearcoat: 0.3,
      clearcoatRoughness: 0.25,
      flatShading: false
    });

    this.postgresMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#3b82f6'),
      emissive: new THREE.Color('#0b2c69'),
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.84,
      clearcoat: 0.36,
      clearcoatRoughness: 0.2,
      flatShading: false
    });
  }

  // ─── 1. FORM A: HERO CYBER MONOLITH (Deconstructible) ─────────────────
  buildHeroMonolith() {
    const root = new THREE.Group();
    this.monolithPlates = [];

    // Inner Glowing Quantum Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
    this.heroInnerCore = new THREE.Mesh(coreGeo, this.coreEnergyMaterial);
    root.add(this.heroInnerCore);

    // Translucent energy shell, cleanly separated from the solid core.
    const cageGeo = new THREE.IcosahedronGeometry(0.75, 1);
    this.heroInnerCage = new THREE.Mesh(cageGeo, this.auraMaterial);
    root.add(this.heroInnerCage);

    // 6 Segmented Outer Floating Obsidian Plates (Deconstruction Target)
    const plateConfigs = [
      // Top Cap
      { w: 0.9, h: 0.3, d: 0.9, basePos: [0, 1.25, 0], normal: [0, 1.5, 0], rot: [0, 0, 0] },
      // Bottom Cap
      { w: 0.9, h: 0.3, d: 0.9, basePos: [0, -1.25, 0], normal: [0, -1.5, 0], rot: [0, 0, 0] },
      // Front Plate
      { w: 0.85, h: 1.8, d: 0.22, basePos: [0, 0, 0.65], normal: [0, 0, 1.6], rot: [0, 0, 0] },
      // Back Plate
      { w: 0.85, h: 1.8, d: 0.22, basePos: [0, 0, -0.65], normal: [0, 0, -1.6], rot: [0, Math.PI, 0] },
      // Left Plate
      { w: 0.22, h: 1.8, d: 0.85, basePos: [-0.65, 0, 0], normal: [-1.6, 0, 0], rot: [0, Math.PI / 2, 0] },
      // Right Plate
      { w: 0.22, h: 1.8, d: 0.85, basePos: [0.65, 0, 0], normal: [1.6, 0, 0], rot: [0, -Math.PI / 2, 0] }
    ];

    plateConfigs.forEach((cfg, idx) => {
      const plateGroup = new THREE.Group();
      plateGroup.position.set(cfg.basePos[0], cfg.basePos[1], cfg.basePos[2]);
      plateGroup.rotation.set(cfg.rot[0], cfg.rot[1], cfg.rot[2]);

      const geo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const mesh = new THREE.Mesh(geo, this.armorMaterial);
      plateGroup.add(mesh);

      root.add(plateGroup);

      mesh.userData = { isCorePlate: true, plateIndex: idx };
      this.interactiveMeshes.push(mesh);

      this.monolithPlates.push({
        group: plateGroup,
        basePos: new THREE.Vector3(...cfg.basePos),
        normal: new THREE.Vector3(...cfg.normal),
        currentOffset: 0
      });
    });

    // 2 Orbital Energy Rings around monolith
    const ringGeo = new THREE.TorusGeometry(1.6, 0.02, 16, 64);
    this.heroRing1 = new THREE.Mesh(ringGeo, this.ringMaterial);
    this.heroRing1.rotation.x = Math.PI / 3;
    root.add(this.heroRing1);

    const ringGeo2 = new THREE.TorusGeometry(1.9, 0.015, 16, 64);
    this.heroRing2 = new THREE.Mesh(ringGeo2, this.auraMaterial);
    this.heroRing2.rotation.y = Math.PI / 4;
    root.add(this.heroRing2);

    this.group.add(root);
    this.forms.hero = root;
  }

  // ─── 2. FORM B: ABOUT POLYHEDRON ──────────────────────────────────────
  buildAboutPolyhedron() {
    const root = new THREE.Group();
    root.visible = false;

    // Dodecahedron with dual shell
    const outerGeo = new THREE.DodecahedronGeometry(1.2, 0);
    this.aboutOuterMesh = new THREE.Mesh(outerGeo, this.armorMaterial);
    root.add(this.aboutOuterMesh);

    const innerGeo = new THREE.OctahedronGeometry(0.65, 0);
    this.aboutInnerMesh = new THREE.Mesh(innerGeo, this.coreEnergyMaterial);
    root.add(this.aboutInnerMesh);

    // 3 Gyroscope Gimbal Rings
    this.aboutGimbals = [];
    [1.5, 1.8, 2.1].forEach((rad, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(rad, 0.02, 16, 64),
        i % 2 === 0 ? this.ringMaterial : this.auraMaterial
      );
      ring.rotation.set(i * 0.8, i * 0.5, i * 0.3);
      root.add(ring);
      this.aboutGimbals.push(ring);
    });

    this.group.add(root);
    this.forms.about = root;
  }

  // ─── 3. FORM C: PROJECTS SYSTEM ARCHIVE ──────────────────────────────
  buildProjectsArchiveCore() {
    const root = new THREE.Group();
    root.visible = false;
    this.projectCoreCards = [];

    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), this.coreEnergyMaterial);
    root.add(core);
    this.projectArchiveCore = core;

    for (let i = 0; i < 6; i++) {
      const cardGroup = new THREE.Group();
      const angle = (i / 6) * Math.PI * 2;
      cardGroup.position.set(Math.cos(angle) * 1.35, Math.sin(i * 1.4) * 0.35, Math.sin(angle) * 1.35);
      cardGroup.lookAt(0, cardGroup.position.y, 0);

      const card = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 1.05, 0.08),
        i % 2 === 0 ? this.armorMaterial : this.auraMaterial
      );
      cardGroup.add(card);
      root.add(cardGroup);
      this.projectCoreCards.push({ group: cardGroup, angle, phase: i * 0.8 });
    }

    this.group.add(root);
    this.forms.projects = root;
  }

  // ─── 4. FORM D: VUE QUANTUM PRISM ─────────────────────────────────────
  buildVuePrism() {
    const root = new THREE.Group();
    root.visible = false;

    // Emerald & Cyan Double Pyramid (Octahedron elongated)
    const prismGeo = new THREE.OctahedronGeometry(1.3, 0);
    prismGeo.scale(1.0, 1.6, 1.0);
    this.vuePrismMesh = new THREE.Mesh(prismGeo, this.vueMaterial);
    root.add(this.vuePrismMesh);

    // Inner glowing Vue Chevron Core
    const coreGeo = new THREE.ConeGeometry(0.5, 0.9, 3);
    coreGeo.rotateX(Math.PI);
    this.vueChevron = new THREE.Mesh(
      coreGeo,
      new THREE.MeshBasicMaterial({ color: '#34d399', wireframe: false, transparent: true, opacity: 0.85 })
    );
    root.add(this.vueChevron);

    // Floating Orbit Nodes (3 satellite cubes)
    this.vueNodes = [];
    for (let i = 0; i < 3; i++) {
      const nodeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.18, 0.18),
        new THREE.MeshBasicMaterial({ color: '#00f2fe' })
      );
      root.add(nodeMesh);
      this.vueNodes.push({
        mesh: nodeMesh,
        angle: (i * Math.PI * 2) / 3,
        radius: 1.8,
        speed: 1.2 + i * 0.3
      });
    }

    this.group.add(root);
    this.forms.vue = root;
  }

  // ─── 5. FORM E: LARAVEL INTERLOCKING QUAD-COLUMNS ─────────────────────
  buildLaravelColumns() {
    const root = new THREE.Group();
    root.visible = false;

    this.laravelPillars = [];
    const positions = [
      [-0.6, 0, -0.6],
      [0.6, 0, -0.6],
      [-0.6, 0, 0.6],
      [0.6, 0, 0.6]
    ];

    positions.forEach((pos, i) => {
      const colGroup = new THREE.Group();
      colGroup.position.set(pos[0], pos[1], pos[2]);

      const pillarGeo = new THREE.BoxGeometry(0.4, 2.4, 0.4);
      const pillarMesh = new THREE.Mesh(pillarGeo, this.laravelMaterial);
      colGroup.add(pillarMesh);

      root.add(colGroup);
      this.laravelPillars.push({ group: colGroup, phase: i * 0.7 });
    });

    // Central Energy Conduit
    const conduitGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.8, 12);
    this.laravelConduit = new THREE.Mesh(
      conduitGeo,
      new THREE.MeshBasicMaterial({ color: '#ff2d20', transparent: true, opacity: 0.9 })
    );
    root.add(this.laravelConduit);

    this.group.add(root);
    this.forms.laravel = root;
  }

  // ─── 6. FORM F: POSTGRESQL HOLOGRAPHIC BEACON ─────────────────────────
  buildPostgresBeacon() {
    const root = new THREE.Group();
    root.visible = false;

    const beaconCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), this.postgresMaterial);
    root.add(beaconCore);
    this.postgresBeaconCore = beaconCore;

    this.postgresBeaconRings = [
      { radius: 0.76, rotation: [Math.PI / 2, 0, 0], speed: 0.62 },
      { radius: 1.02, rotation: [Math.PI / 3, Math.PI / 5, 0], speed: -0.48 },
      { radius: 1.26, rotation: [0, Math.PI / 2.5, Math.PI / 4], speed: 0.34 }
    ].map((config, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(config.radius, 0.025 - index * 0.004, 10, 56),
        new THREE.MeshBasicMaterial({
          color: index === 1 ? '#22d3ee' : '#60a5fa',
          transparent: true,
          opacity: 0.78 - index * 0.12
        })
      );
      ring.rotation.set(...config.rotation);
      root.add(ring);
      return { ring, speed: config.speed };
    });

    this.group.add(root);
    this.forms.postgres = root;
  }

  // ─── 7. FORM G: WORDPRESS MODULAR LAYOUT CORE ────────────────────────
  buildWordPressLayoutCore() {
    const root = new THREE.Group();
    root.visible = false;
    this.wordpressCorePanels = [];

    const centralCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 0), this.armorMaterial);
    root.add(centralCore);
    this.wordpressLayoutCore = centralCore;

    const panelConfigs = [
      [-1.15, 0.62, 0], [0, 0.82, 0], [1.15, 0.62, 0],
      [-1.15, -0.62, 0], [0, -0.82, 0], [1.15, -0.62, 0]
    ];
    panelConfigs.forEach((position, index) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(index % 3 === 1 ? 0.82 : 0.62, 0.42, 0.08),
        index % 2 === 0 ? this.auraMaterial : this.coreEnergyMaterial
      );
      panel.position.set(...position);
      root.add(panel);
      this.wordpressCorePanels.push({ panel, baseX: position[0], phase: index * 0.65 });
    });

    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.025, 12, 64), this.ringMaterial);
    orbit.rotation.x = Math.PI / 2;
    root.add(orbit);
    this.wordpressOrbit = orbit;

    this.group.add(root);
    this.forms.wordpress = root;
  }

  // ─── 8. FORM H: CONTACT QUANTUM SINGULARITY ───────────────────────────
  buildContactSingularity() {
    const root = new THREE.Group();
    root.visible = false;

    // Glowing Event Horizon Sphere
    const sphereGeo = new THREE.SphereGeometry(0.8, 32, 32);
    this.singularitySphere = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: '#00f2fe', wireframe: false })
    );
    root.add(this.singularitySphere);

    // Multi-Ring Gravitational Disk
    this.singularityRings = [];
    for (let i = 0; i < 4; i++) {
      const torusGeo = new THREE.TorusGeometry(1.2 + i * 0.4, 0.02, 16, 64);
      const ring = new THREE.Mesh(
        torusGeo,
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? '#a855f7' : '#00f2fe',
          transparent: true,
          opacity: 0.7
        })
      );
      ring.rotation.x = Math.PI / 2 + (i * 0.2);
      root.add(ring);
      this.singularityRings.push({ ring, speed: (i + 1) * 0.6 });
    }

    this.group.add(root);
    this.forms.contact = root;
  }

  // ─── INTERACTION & DECONSTRUCTION (EXPLODED VIEW) ─────────────────────
  setupInteractions() {
    // Mouse Move Raycasting
    window.addEventListener('mousemove', (e) => {
      this.mouse2D.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse2D.y = -(e.clientY / window.innerHeight - 0.5) * 2;

      this.raycaster.setFromCamera(this.mouse2D, this.app.engine.camera);
      const hits = this.raycaster.intersectObjects(this.interactiveMeshes);

      if (hits.length > 0) {
        if (!this.isHovered) {
          this.isHovered = true;
          this.targetHover = 1.0;
          document.body.style.cursor = 'pointer';
          if (window.soundManager && window.soundManager.playCoreDeconstruct) {
            window.soundManager.playCoreDeconstruct();
          }
        }
      } else {
        if (this.isHovered) {
          this.isHovered = false;
          this.targetHover = 0.0;
          document.body.style.cursor = 'default';
        }
      }
    });

    // Click Surge Shockwave Pulse
    window.addEventListener('click', (e) => {
      if (e.target !== this.app.canvas && !e.target.closest('#hero')) return;

      this.raycaster.setFromCamera(this.mouse2D, this.app.engine.camera);
      const hits = this.raycaster.intersectObjects(this.interactiveMeshes);

      if (hits.length > 0 || (this.isHovered && !this.isSpinning)) {
        this.triggerSurgeSpin();
      }
    });
  }

  triggerSurgeSpin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    if (window.soundManager && window.soundManager.playChirp) {
      window.soundManager.playChirp();
    }

    // Trigger explosive particle shockwave
    if (this.app.particles && this.app.particles.triggerShockwave) {
      this.app.particles.triggerShockwave(this.group.position);
    }

    // Rapid 360 Spin + Scale Surge Animation
    gsap.to(this.group.rotation, {
      y: this.group.rotation.y + Math.PI * 2,
      x: this.group.rotation.x + Math.PI * 0.5,
      duration: 1.2,
      ease: 'power3.out',
      onComplete: () => {
        this.isSpinning = false;
      }
    });

    // Quantum Core scale flash
    if (this.heroInnerCore) {
      gsap.fromTo(this.heroInnerCore.scale, 
        { x: 2.2, y: 2.2, z: 2.2 },
        { x: 1.0, y: 1.0, z: 1.0, duration: 1.0, ease: 'elastic.out(1, 0.4)' }
      );
    }
  }

  // ─── TICK UPDATE LOOP ────────────────────────────────────────────────
  update(deltaTime, elapsedTime, scrollProgress) {
    // 1. Smoothly interpolate Exploded View hover progress
    this.hoverProgress += (this.targetHover - this.hoverProgress) * 0.1;

    // 2. Animate Exploded View plates of Hero Monolith
    if (this.monolithPlates && this.monolithPlates.length > 0) {
      this.monolithPlates.forEach((p, idx) => {
        const explodeDistance = this.hoverProgress * 1.25;
        // Float oscillation + Exploded displacement along normal vector
        const floatOsc = Math.sin(elapsedTime * 2.0 + idx * 1.1) * 0.04;
        
        p.group.position.x = p.basePos.x + (p.normal.x * explodeDistance) + floatOsc;
        p.group.position.y = p.basePos.y + (p.normal.y * explodeDistance) + floatOsc;
        p.group.position.z = p.basePos.z + (p.normal.z * explodeDistance);

        // Subtle dynamic tilt on hover
        p.group.rotation.z = this.hoverProgress * (idx % 2 === 0 ? 0.15 : -0.15);
      });
    }

    // 3. Ambient rotations of inner cores and rings
    if (this.heroInnerCore) {
      this.heroInnerCore.rotation.y += deltaTime * 0.8;
      this.heroInnerCore.rotation.x += deltaTime * 0.4;
      const pulse = 1.0 + Math.sin(elapsedTime * 4.0) * 0.08;
      this.heroInnerCore.scale.set(pulse, pulse, pulse);
    }
    if (this.heroInnerCage) {
      this.heroInnerCage.rotation.y -= deltaTime * 0.5;
      this.heroInnerCage.rotation.z += deltaTime * 0.3;
    }
    if (this.heroRing1) this.heroRing1.rotation.z += deltaTime * 0.4;
    if (this.heroRing2) this.heroRing2.rotation.x += deltaTime * 0.3;

    // 4. Update secondary forms
    if (this.forms.about.visible && this.aboutGimbals) {
      this.aboutGimbals.forEach((g, i) => {
        g.rotation.x += deltaTime * (0.6 + i * 0.3);
        g.rotation.y += deltaTime * (0.4 - i * 0.2);
      });
      if (this.aboutOuterMesh) this.aboutOuterMesh.rotation.y += deltaTime * 0.5;
    }

    if (this.forms.projects.visible && this.projectCoreCards) {
      this.projectCoreCards.forEach((card, index) => {
        const angle = card.angle + elapsedTime * (0.18 + index * 0.01);
        card.group.position.x = Math.cos(angle) * 1.35;
        card.group.position.z = Math.sin(angle) * 1.35;
        card.group.position.y = Math.sin(elapsedTime * 0.8 + card.phase) * 0.35;
        card.group.lookAt(0, card.group.position.y, 0);
      });
      if (this.projectArchiveCore) {
        this.projectArchiveCore.rotation.y += deltaTime * 0.7;
        this.projectArchiveCore.rotation.x -= deltaTime * 0.32;
      }
    }

    if (this.forms.vue.visible && this.vueNodes) {
      if (this.vuePrismMesh) this.vuePrismMesh.rotation.y += deltaTime * 0.7;
      if (this.vueChevron) this.vueChevron.rotation.y -= deltaTime * 1.2;
      this.vueNodes.forEach(node => {
        node.angle += deltaTime * node.speed;
        node.mesh.position.x = Math.cos(node.angle) * node.radius;
        node.mesh.position.z = Math.sin(node.angle) * node.radius;
        node.mesh.position.y = Math.sin(elapsedTime * 3.0 + node.angle) * 0.3;
      });
    }

    if (this.forms.laravel.visible && this.laravelPillars) {
      this.laravelPillars.forEach(p => {
        p.group.position.y = Math.sin(elapsedTime * 2.2 + p.phase) * 0.25;
      });
      if (this.laravelConduit) this.laravelConduit.rotation.y += deltaTime * 2.0;
    }

    if (this.forms.postgres.visible && this.postgresBeaconRings) {
      this.postgresBeaconRings.forEach((item, index) => {
        item.ring.rotation.y += deltaTime * item.speed;
        item.ring.rotation.z += deltaTime * item.speed * (index % 2 === 0 ? 0.35 : -0.28);
      });
      if (this.postgresBeaconCore) {
        this.postgresBeaconCore.rotation.x += deltaTime * 0.24;
        this.postgresBeaconCore.rotation.y -= deltaTime * 0.38;
      }
    }

    if (this.forms.wordpress.visible && this.wordpressCorePanels) {
      this.wordpressCorePanels.forEach(item => {
        item.panel.position.x = item.baseX + Math.sin(elapsedTime * 0.9 + item.phase) * 0.08;
        item.panel.rotation.z = Math.sin(elapsedTime * 0.55 + item.phase) * 0.08;
      });
      if (this.wordpressLayoutCore) {
        this.wordpressLayoutCore.rotation.x += deltaTime * 0.22;
        this.wordpressLayoutCore.rotation.y -= deltaTime * 0.36;
      }
      if (this.wordpressOrbit) this.wordpressOrbit.rotation.z += deltaTime * 0.48;
    }

    if (this.forms.contact.visible && this.singularityRings) {
      this.singularityRings.forEach(r => {
        r.ring.rotation.z += deltaTime * r.speed;
      });
      if (this.singularitySphere) {
        const pulse = 1.0 + Math.sin(elapsedTime * 6.0) * 0.12;
        this.singularitySphere.scale.set(pulse, pulse, pulse);
      }
    }

    // 5. Section Morphing Interpolation based on Scroll Progress
    this.updateMorphingState(scrollProgress, elapsedTime);
  }

  updateMorphingState(progress, elapsedTime) {
    const waypoints = this.entityWaypoints;
    const totalSegments = waypoints.length - 1;
    const scaled = Math.max(0, Math.min(progress * totalSegments, totalSegments));
    const idx = Math.min(Math.floor(scaled), totalSegments - 1);
    const factor = scaled - idx;

    const w1 = waypoints[idx];
    const w2 = waypoints[idx + 1];

    // Lerp 3D Position. The PostgreSQL form stays above the clear center
    // aisle while entering and leaving the workstation corridor.
    const transitionArc = idx === 4 ? Math.sin(factor * Math.PI) : 0;
    const postgresExitLift = idx === 5 ? Math.sin(factor * Math.PI) * 1.2 : 0;
    this.group.position.x = w1.pos[0] + (w2.pos[0] - w1.pos[0]) * factor
      - transitionArc * 4.2
      + Math.sin(elapsedTime * 0.8) * 0.08;
    this.group.position.y = w1.pos[1] + (w2.pos[1] - w1.pos[1]) * factor
      + transitionArc * 1.35
      + postgresExitLift
      + Math.cos(elapsedTime * 0.6) * 0.06;
    this.group.position.z = w1.pos[2] + (w2.pos[2] - w1.pos[2]) * factor;

    // Lerp Scale
    const currentScale = w1.scale + (w2.scale - w1.scale) * factor;
    this.group.scale.set(currentScale, currentScale, currentScale);

    // Organic continuous rotation
    if (!this.isSpinning) {
      this.group.rotation.y += 0.005;
      this.group.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08;
    }

    // Form visibility toggle based on closest waypoint form
    const currentFormKey = factor < 0.5 ? w1.activeForm : w2.activeForm;
    Object.keys(this.forms).forEach(key => {
      const form = this.forms[key];
      if (key === currentFormKey) {
        form.visible = true;
        // Fade in scale
        form.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
      } else {
        form.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.2);
        if (form.scale.x < 0.05) form.visible = false;
      }
    });
  }

  setOverclock(active) {
    this.isOverclocked = active;
    const targetColor = active ? new THREE.Color('#ff3300') : new THREE.Color('#00f2fe');
    
    if (this.coreEnergyMaterial) this.coreEnergyMaterial.color.copy(targetColor);
    if (this.ringMaterial) this.ringMaterial.color.copy(targetColor);
    if (this.auraMaterial) this.auraMaterial.color.copy(targetColor);
  }
}
