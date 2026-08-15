import * as THREE from 'three';
import {
  createDatabaseTerminalTextures,
  createTechnologyDisplayTextures
} from '../textures/TechnologyDisplayTextures.js';
import { createProjectOrbitalTextures } from '../textures/ProjectOrbitalTextures.js';

export class EnvironmentBiomes {
  constructor(app) {
    this.app = app;
    this.scene = app.engine.scene;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'ArchitecturalBiomes';
    this.scene.add(this.rootGroup);

    this.biomes = {};
    this.collisionMeshes = [];
    this.colliders = [];
    this.explorerActive = false;
    this._expandedCollider = new THREE.Box3();
    this._collisionNormal = new THREE.Vector3();
    this.initSharedMaterials();
    this.initArchitecturalLighting();

    this.buildBiomeHeroSanctum();
    this.buildBiomeAboutDataVault();
    this.buildBiomeProjectsArchive();
    this.buildBiomeVueCrystalChamber();
    this.buildBiomeLaravelCitadel();
    this.buildBiomePostgresDataCorridor();
    this.buildBiomeWordPressFoundry();
    this.buildBiomeContactOrbitalUplink();

    this.biomeRanges = [
      { key: 'hero',      centerProgress: 0.0,  z: 0,   entryZ: Infinity },
      { key: 'about',     centerProgress: 0.14, z: -8,  entryZ: -4.0 },
      { key: 'projects',  centerProgress: 0.28, z: -16, entryZ: -12.0 },
      { key: 'vue',       centerProgress: 0.43, z: -25, entryZ: -20.5 },
      { key: 'laravel',   centerProgress: 0.57, z: -35, entryZ: -29.5 },
      { key: 'postgres',  centerProgress: 0.71, z: -46, entryZ: -37.3 },
      { key: 'wordpress', centerProgress: 0.85, z: -58, entryZ: -53.0 },
      { key: 'contact',   centerProgress: 1.0,  z: -72, entryZ: -65.0 }
    ];

    this.rootGroup.updateMatrixWorld(true);
    this.refreshColliders();
  }

  initSharedMaterials() {
    
    this.matSlate = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0b1422'),
      roughness: 0.46,
      metalness: 0.64,
      clearcoat: 0.22,
      clearcoatRoughness: 0.38,
      flatShading: false
    });

    this.matObsidian = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#030711'),
      roughness: 0.26,
      metalness: 0.82,
      clearcoat: 0.28,
      clearcoatRoughness: 0.3,
      flatShading: false
    });

    this.dataLineMaterial = new THREE.LineBasicMaterial({
      color: '#4cc9f0',
      transparent: true,
      opacity: 0.16,
      toneMapped: false
    });

    this.glowCyan = new THREE.MeshBasicMaterial({ color: '#00f2fe', transparent: true, opacity: 0.85 });
    this.glowEmerald = new THREE.MeshBasicMaterial({ color: '#34d399', transparent: true, opacity: 0.85 });
    this.glowRuby = new THREE.MeshBasicMaterial({ color: '#ff4438', transparent: true, opacity: 0.85 });
    this.glowBlue = new THREE.MeshBasicMaterial({ color: '#60a5fa', transparent: true, opacity: 0.85 });
    this.glowPurple = new THREE.MeshBasicMaterial({ color: '#c084fc', transparent: true, opacity: 0.8 });
    this.glowAmber = new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.78 });
  }

  initArchitecturalLighting() {
    this.ambientLight = new THREE.AmbientLight('#16335a', 1.35);
    this.hemisphereLight = new THREE.HemisphereLight('#86e9ff', '#02030a', 1.05);
    this.scene.add(this.ambientLight, this.hemisphereLight);

    const lightConfigs = [
      { color: '#00d9ff', position: [0, 6, 2] },
      { color: '#8b5cf6', position: [0, 5, -10] },
      { color: '#10b981', position: [2, 5, -25] },
      { color: '#ef4444', position: [-2, 5, -35] },
      { color: '#3b82f6', position: [2, 4, -47] },
      { color: '#a855f7', position: [-2, 5, -59] }
    ];

    this.biomeLights = lightConfigs.map(({ color, position }) => {
      const light = new THREE.PointLight(color, 28, 24, 2);
      light.position.set(...position);
      this.scene.add(light);
      return light;
    });
  }

  registerCollider(mesh) {
    this.collisionMeshes.push(mesh);
  }

  refreshColliders() {
    this.rootGroup.updateMatrixWorld(true);
    this.colliders = this.collisionMeshes.map(mesh => ({
      box: new THREE.Box3().setFromObject(mesh).expandByScalar(0.16),
      name: mesh.name || 'ARCHITECTURAL_VOLUME'
    }));
  }

  buildBiomeHeroSanctum() {
    const group = new THREE.Group();
    group.position.set(0, 0, 0);

    const gatePositions = [
      [-7.5, 0, 4], [7.5, 0, 4],
      [-9.0, 0, -4], [9.0, 0, -4]
    ];

    gatePositions.forEach((pos, i) => {
      const gateGroup = new THREE.Group();
      gateGroup.position.set(pos[0], pos[1], pos[2]);

      const pillarGeo = new THREE.BoxGeometry(1.6, 14, 1.6);
      const mesh = new THREE.Mesh(pillarGeo, this.matSlate);
      mesh.name = `HERO_GATE_${i + 1}`;
      gateGroup.add(mesh);
      this.registerCollider(mesh);

      const stripGeo = new THREE.BoxGeometry(0.12, 12, 0.12);
      const strip = new THREE.Mesh(stripGeo, this.glowCyan);
      strip.position.z = 0.82;
      gateGroup.add(strip);

      group.add(gateGroup);
    });

    this.biomes.hero = { group, baseScale: 1.0, activeRange: [0.0, 0.18] };
    this.rootGroup.add(group);
  }

  buildBiomeAboutDataVault() {
    const group = new THREE.Group();
    group.position.set(0, 0, -8);

    this.serverUnits = [];
    const rackCount = 10;
    const rackGeo = new THREE.BoxGeometry(2.2, 8.5, 1.2);
    const ledGeo = new THREE.BoxGeometry(0.08, 0.08, 0.15);

    for (let i = 0; i < rackCount; i++) {
      const isLeft = i % 2 === 0;
      const laneIndex = Math.floor(i / 2);
      
      const zOffset = -3.2 + laneIndex * 1.3;
      const xPos = isLeft ? -8.8 : 8.8;

      const rackGroup = new THREE.Group();
      rackGroup.position.set(xPos, 0, zOffset);
      rackGroup.rotation.y = isLeft ? 0.2 : -0.2;

      const mesh = new THREE.Mesh(rackGeo, this.matObsidian);
      mesh.name = `DATA_VAULT_RACK_${i + 1}`;
      rackGroup.add(mesh);
      this.registerCollider(mesh);

      for (let l = 0; l < 4; l++) {
        const led = new THREE.Mesh(ledGeo, this.glowCyan);
        led.position.set((Math.random() - 0.5) * 1.6, -3.0 + l * 1.8, 0.62);
        rackGroup.add(led);
        this.serverUnits.push({ led, phase: Math.random() * 10 });
      }

      group.add(rackGroup);
    }

    const walkwayGeo = new THREE.BoxGeometry(4.2, 0.15, 10.5);
    const walkway = new THREE.Mesh(walkwayGeo, this.matSlate);
    walkway.position.set(0, -3.4, 0);
    group.add(walkway);

    this.biomes.about = { group, baseScale: 1.0, activeRange: [0.10, 0.32] };
    this.rootGroup.add(group);
  }

  buildBiomeProjectsArchive() {
    const group = new THREE.Group();
    group.position.set(0, 0, -16);
    this.projectVaults = [];
    this.technologyDisplays = createTechnologyDisplayTextures(this.app.engine.renderer);

    const frameGeometry = new THREE.BoxGeometry(2.8, 4.4, 0.42);
    const screenGeometry = new THREE.PlaneGeometry(2.15, 3.25);

    for (let i = 0; i < 8; i++) {
      const display = this.technologyDisplays[i];
      const side = i % 2 === 0 ? -1 : 1;
      const laneIndex = Math.floor(i / 2);
      const vault = new THREE.Group();
      vault.position.set(side * (5.1 + (laneIndex % 2) * 0.55), 0.15, (laneIndex - 1.5) * 3.6);
      vault.rotation.y = side < 0 ? 0.18 : -0.18;

      const shell = new THREE.Mesh(frameGeometry, this.matObsidian);
      shell.name = `PROJECT_ARCHIVE_${i + 1}`;
      vault.add(shell);
      this.registerCollider(shell);

      const screenMaterial = new THREE.MeshBasicMaterial({
        map: display.texture,
        color: '#ffffff',
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.name = `TECH_DISPLAY_${display.id.toUpperCase()}`;
      screen.position.z = 0.226;
      screen.renderOrder = 3;
      vault.add(screen);

      const scannerMaterial = new THREE.MeshBasicMaterial({
        color: display.accent,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false
      });
      const scanner = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.035, 0.045), scannerMaterial);
      scanner.position.z = 0.255;
      scanner.renderOrder = 5;
      vault.add(scanner);

      group.add(vault);
      this.projectVaults.push({
        vault,
        scanner,
        scannerMaterial,
        screenMaterial,
        phase: i * 0.72
      });
    }

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.16, 16), this.matSlate);
    bridge.position.y = -3.2;
    group.add(bridge);

    const constellationPositions = [];
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      constellationPositions.push(Math.cos(angle) * 3.1, 2.7 + Math.sin(i * 1.7) * 0.8, Math.sin(angle) * 2.1);
      constellationPositions.push(Math.cos(angle + 0.7) * 2.0, 1.4 + Math.cos(i) * 0.6, Math.sin(angle + 0.7) * 1.6);
    }
    const constellationGeometry = new THREE.BufferGeometry();
    constellationGeometry.setAttribute('position', new THREE.Float32BufferAttribute(constellationPositions, 3));
    this.projectConstellation = new THREE.LineSegments(constellationGeometry, this.dataLineMaterial);
    group.add(this.projectConstellation);

    this.biomes.projects = { group, baseScale: 1.0, activeRange: [0.20, 0.38] };
    this.rootGroup.add(group);
  }

  buildBiomeVueCrystalChamber() {
    const group = new THREE.Group();
    group.position.set(0, 0, -25);

    this.vueCrystals = [];
    const crystalGeo = new THREE.OctahedronGeometry(1.4, 0);

    const crystalConfigs = [
      { x: -5.5, y: 2.2, z: 3.0, scale: 1.2, speed: 0.6 },
      { x: 5.5,  y: -1.0, z: 2.0, scale: 1.4, speed: 0.8 },
      { x: -6.8, y: -2.0, z: -4.0, scale: 1.6, speed: 0.5 },
      { x: 6.2,  y: 3.2, z: -3.0, scale: 1.3, speed: 0.7 },
      { x: 0.0,  y: 5.5, z: 0.0,  scale: 1.8, speed: 0.4 }
    ];

    crystalConfigs.forEach((cfg, i) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(cfg.x, cfg.y, cfg.z);

      const mesh = new THREE.Mesh(crystalGeo, this.matObsidian);
      mesh.scale.set(cfg.scale, cfg.scale * 1.5, cfg.scale);
      cGroup.add(mesh);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.scale * 1.4, 0.02, 16, 48),
        this.glowCyan
      );
      ring.rotation.x = Math.PI / 3;
      cGroup.add(ring);

      group.add(cGroup);
      this.vueCrystals.push({ group: cGroup, baseY: cfg.y, speed: cfg.speed, phase: i * 1.5 });
    });

    this.biomes.vue = { group, baseScale: 1.0, activeRange: [0.35, 0.52] };
    this.rootGroup.add(group);
  }

  buildBiomeLaravelCitadel() {
    const group = new THREE.Group();
    group.position.set(0, 0, -35);

    this.citadelBlocks = [];
    const blockCount = 14;
    const terraceOffset = 8.8;
    const terraceDepthStart = 1.6;
    const terraceDepthStep = 1.05;

    for (let i = 0; i < blockCount; i++) {
      const isLeft = i % 2 === 0;
      const laneIndex = Math.floor(i / 2);
      const x = (isLeft ? -1 : 1) * (terraceOffset + (i % 3) * 1.6);
      const z = terraceDepthStart + laneIndex * terraceDepthStep;
      const height = 4.0 + (i * 0.9) % 7.0;

      const blockGroup = new THREE.Group();
      blockGroup.position.set(x, -3.5 + height / 2, z);

      const geo = new THREE.BoxGeometry(2.0, height, 2.0);
      const mesh = new THREE.Mesh(geo, this.matSlate);
      mesh.name = `LARAVEL_CITADEL_BLOCK_${i + 1}`;
      blockGroup.add(mesh);
      this.registerCollider(mesh);

      const topCapGeo = new THREE.BoxGeometry(2.02, 0.15, 2.02);
      const topCap = new THREE.Mesh(topCapGeo, this.glowRuby);
      topCap.position.y = height / 2;
      blockGroup.add(topCap);

      group.add(blockGroup);
      this.citadelBlocks.push({ group: blockGroup, baseH: height, phase: i * 0.8 });
    }

    this.biomes.laravel = { group, baseScale: 1.0, activeRange: [0.50, 0.65] };
    this.rootGroup.add(group);
  }

  buildBiomePostgresDataCorridor() {
    const group = new THREE.Group();
    group.position.set(0, 0, -46);

    this.databaseStations = [];
    this.databaseFans = [];
    this.databaseTerminalTextures = createDatabaseTerminalTextures(this.app.engine.renderer, 5);

    const boothWidth = 3.2;
    const boothDepth = 1.5;
    const boothYaw = Math.PI / 2 - 0.16;
    const stationCountPerSide = 5;
    const stationClearance = 0.5;
    const stationFootprintZ = (
      Math.abs(Math.sin(boothYaw)) * boothWidth
      + Math.abs(Math.cos(boothYaw)) * boothDepth
    );
    const stationSpacing = stationFootprintZ + stationClearance;
    const corridorHalfSpan = ((stationCountPerSide - 1) * stationSpacing) / 2;
    const corridorContentLength = corridorHalfSpan * 2 + stationFootprintZ;
    const walkwayLength = corridorContentLength + 1.2;
    const workstation = Object.freeze({
      monitorX: -0.18,
      monitorY: 0.18,
      monitorZ: 0.04,
      monitorWidth: 1.62,
      monitorHeight: 1.02,
      screenWidth: 1.42,
      screenHeight: 0.78,
      keyboardY: -0.83,
      keyboardZ: 0.5,
      mouseX: 0.54,
      mouseY: -0.8,
      mouseZ: 0.52
    });

    const assets = {
      backPanel: new THREE.BoxGeometry(boothWidth, 4.72, 0.16),
      roof: new THREE.BoxGeometry(boothWidth, 0.16, boothDepth),
      sideRail: new THREE.BoxGeometry(0.11, 4.65, 0.14),
      header: new THREE.BoxGeometry(2.82, 0.4, 0.14),
      desk: new THREE.BoxGeometry(2.35, 0.12, 0.9),
      monitor: new THREE.BoxGeometry(workstation.monitorWidth, workstation.monitorHeight, 0.12),
      monitorScreen: new THREE.PlaneGeometry(workstation.screenWidth, workstation.screenHeight),
      monitorStem: new THREE.BoxGeometry(0.1, 0.4, 0.1),
      monitorBase: new THREE.BoxGeometry(0.6, 0.06, 0.28),
      tower: new THREE.BoxGeometry(0.42, 1.05, 0.56),
      towerGlass: new THREE.PlaneGeometry(0.35, 0.91),
      keyboard: new THREE.BoxGeometry(1.05, 0.045, 0.34),
      key: new THREE.BoxGeometry(0.08, 0.03, 0.055),
      mouse: new THREE.SphereGeometry(0.1, 20, 14),
      mouseWheel: new THREE.BoxGeometry(0.022, 0.024, 0.076),
      status: new THREE.BoxGeometry(0.08, 0.08, 0.035),
      fanRing: new THREE.TorusGeometry(0.22, 0.018, 8, 32),
      fanHub: new THREE.CylinderGeometry(0.052, 0.052, 0.035, 16),
      fanBlade: new THREE.BoxGeometry(0.055, 0.27, 0.018),
      vent: new THREE.BoxGeometry(0.22, 0.025, 0.018)
    };

    const computerGlass = new THREE.MeshStandardMaterial({
      color: '#173d68',
      emissive: '#0c2c55',
      emissiveIntensity: 1.6,
      roughness: 0.12,
      metalness: 0.55,
      transparent: true,
      opacity: 0.58,
      side: THREE.DoubleSide
    });

    for (let laneIndex = 0; laneIndex < stationCountPerSide; laneIndex++) {
      const localZ = corridorHalfSpan - laneIndex * stationSpacing;
      [-1, 1].forEach(side => {
        const stationIndex = laneIndex * 2 + (side > 0 ? 1 : 0);
        const booth = new THREE.Group();
        booth.name = `POSTGRES_DB_CABIN_${String(stationIndex + 1).padStart(2, '0')}`;
        booth.position.set(side * 5.15, -0.58, localZ);
        booth.rotation.y = side < 0 ? boothYaw : -boothYaw;

        const backPanel = new THREE.Mesh(assets.backPanel, this.matObsidian);
        backPanel.name = `${booth.name}_BACKPLANE`;
        backPanel.position.z = -0.7;
        booth.add(backPanel);
        this.registerCollider(backPanel);

        const roof = new THREE.Mesh(assets.roof, this.matSlate);
        roof.position.set(0, 2.32, 0);
        booth.add(roof);
        const floorLip = new THREE.Mesh(assets.roof, this.matSlate);
        floorLip.position.set(0, -2.32, 0);
        booth.add(floorLip);

        [-1, 1].forEach(railSide => {
          const sideRail = new THREE.Mesh(assets.sideRail, this.matSlate);
          sideRail.position.set(railSide * 1.53, 0, -0.66);
          booth.add(sideRail);
        });

        const header = new THREE.Mesh(assets.header, this.matObsidian);
        header.position.set(0, 1.82, 0.08);
        booth.add(header);

        const headerLine = new THREE.Mesh(
          new THREE.BoxGeometry(2.35, 0.035, 0.04),
          laneIndex % 2 === 0 ? this.glowBlue : this.glowCyan
        );
        headerLine.position.set(0, 1.82, 0.165);
        booth.add(headerLine);

        const statusLight = new THREE.Mesh(assets.status, this.glowEmerald);
        statusLight.position.set(1.23, 1.82, 0.17);
        booth.add(statusLight);

        const desk = new THREE.Mesh(assets.desk, this.matSlate);
        desk.position.set(0, -0.93, 0.16);
        booth.add(desk);

        const monitorX = workstation.monitorX;
        const monitor = new THREE.Mesh(assets.monitor, this.matObsidian);
        monitor.position.set(monitorX, workstation.monitorY, workstation.monitorZ);
        booth.add(monitor);

        const screenMaterial = new THREE.MeshBasicMaterial({
          map: this.databaseTerminalTextures[laneIndex],
          color: '#ffffff',
          transparent: true,
          opacity: 0.96,
          side: THREE.DoubleSide,
          toneMapped: false,
          depthWrite: false
        });
        const screen = new THREE.Mesh(assets.monitorScreen, screenMaterial);
        screen.name = `${booth.name}_ACTIVE_TERMINAL`;
        screen.position.set(monitorX, workstation.monitorY, 0.106);
        screen.renderOrder = 5;
        booth.add(screen);

        const webcam = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), this.glowCyan);
        webcam.position.set(monitorX, 0.735, 0.116);
        booth.add(webcam);

        const stem = new THREE.Mesh(assets.monitorStem, this.matSlate);
        stem.position.set(monitorX, -0.53, 0.02);
        booth.add(stem);
        const base = new THREE.Mesh(assets.monitorBase, this.matSlate);
        base.position.set(monitorX, -0.79, 0.14);
        booth.add(base);

        const tower = new THREE.Mesh(assets.tower, this.matObsidian);
        tower.position.set(0.94, -0.29, 0.02);
        booth.add(tower);

        const towerGlass = new THREE.Mesh(assets.towerGlass, computerGlass);
        towerGlass.position.set(0.94, -0.29, 0.307);
        towerGlass.renderOrder = 4;
        booth.add(towerGlass);

        const fan = new THREE.Group();
        fan.position.set(0.94, -0.05, 0.315);
        const fanRing = new THREE.Mesh(assets.fanRing, this.glowBlue);
        fan.add(fanRing);
        const fanHub = new THREE.Mesh(assets.fanHub, this.glowCyan);
        fanHub.rotation.x = Math.PI / 2;
        fan.add(fanHub);
        const fanBlades = new THREE.InstancedMesh(assets.fanBlade, this.glowBlue, 3);
        const fanMatrix = new THREE.Matrix4();
        for (let bladeIndex = 0; bladeIndex < 3; bladeIndex++) {
          fanMatrix.makeRotationZ(bladeIndex * Math.PI / 3);
          fanBlades.setMatrixAt(bladeIndex, fanMatrix);
        }
        fanBlades.instanceMatrix.needsUpdate = true;
        fan.add(fanBlades);
        booth.add(fan);
        this.databaseFans.push({ group: fan, direction: side, speed: 0.55 + laneIndex * 0.07 });

        const vents = new THREE.InstancedMesh(assets.vent, this.glowBlue, 5);
        const ventMatrix = new THREE.Matrix4();
        for (let ventIndex = 0; ventIndex < 5; ventIndex++) {
          ventMatrix.makeTranslation(0.94, -0.48 - ventIndex * 0.075, 0.315);
          vents.setMatrixAt(ventIndex, ventMatrix);
        }
        vents.instanceMatrix.needsUpdate = true;
        booth.add(vents);

        const keyboard = new THREE.Mesh(assets.keyboard, this.matObsidian);
        keyboard.position.set(monitorX, workstation.keyboardY, workstation.keyboardZ);
        booth.add(keyboard);
        const keyCaps = new THREE.InstancedMesh(assets.key, this.glowBlue, 28);
        const keyMatrix = new THREE.Matrix4();
        let keyIndex = 0;
        for (let row = 0; row < 4; row++) {
          for (let column = 0; column < 7; column++) {
            keyMatrix.makeTranslation(
              monitorX - 0.39 + column * 0.13,
              -0.785,
              0.375 + row * 0.083
            );
            keyCaps.setMatrixAt(keyIndex++, keyMatrix);
          }
        }
        keyCaps.instanceMatrix.needsUpdate = true;
        booth.add(keyCaps);

        const mouse = new THREE.Mesh(assets.mouse, this.matSlate);
        mouse.scale.set(1, 0.35, 1.45);
        mouse.position.set(workstation.mouseX, workstation.mouseY, workstation.mouseZ);
        booth.add(mouse);
        const mouseWheel = new THREE.Mesh(assets.mouseWheel, this.glowCyan);
        mouseWheel.position.set(workstation.mouseX, -0.755, workstation.mouseZ + 0.02);
        booth.add(mouseWheel);
        const mouseLed = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.075), this.glowCyan);
        mouseLed.position.set(workstation.mouseX, -0.756, workstation.mouseZ - 0.07);
        booth.add(mouseLed);

        const cableGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0.94, -0.75, -0.26),
          new THREE.Vector3(0.56, -1.04, -0.43),
          new THREE.Vector3(monitorX, -1.04, -0.48),
          new THREE.Vector3(monitorX, -0.54, 0.0)
        ]);
        booth.add(new THREE.Line(cableGeometry, new THREE.LineBasicMaterial({
          color: '#2563eb',
          transparent: true,
          opacity: 0.52
        })));

        group.add(booth);
        this.databaseStations.push({
          booth,
          screenMaterial,
          statusLight,
          phase: stationIndex * 0.43
        });
      });
    }

    const walkwayGeometry = new THREE.BoxGeometry(6.6, 0.14, walkwayLength);
    const walkway = new THREE.Mesh(walkwayGeometry, this.matObsidian);
    walkway.position.set(0, -3.0, -0.15);
    group.add(walkway);

    [-2.95, 2.95].forEach(x => {
      const aisleLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.035, walkwayLength - 0.8),
        this.glowCyan
      );
      aisleLight.position.set(x, -2.91, -0.15);
      group.add(aisleLight);

      const ceilingRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.07, walkwayLength - 0.4),
        this.glowBlue
      );
      ceilingRail.position.set(x, 2.5, -0.15);
      group.add(ceilingRail);
    });

    const ribCount = Math.ceil(walkwayLength / 2.5);
    const ribSpacing = (walkwayLength - 2.0) / (ribCount - 1);
    const firstRibZ = ((ribCount - 1) * ribSpacing) / 2;
    for (let ribIndex = 0; ribIndex < ribCount; ribIndex++) {
      const ribZ = firstRibZ - ribIndex * ribSpacing;
      const ceilingRib = new THREE.Mesh(
        new THREE.BoxGeometry(10.5, 0.1, 0.12),
        this.matSlate
      );
      ceilingRib.position.set(0, 2.5, ribZ);
      group.add(ceilingRib);

      const centerLamp = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.045, 0.14),
        ribIndex % 2 === 0 ? this.glowCyan : this.glowBlue
      );
      centerLamp.position.set(0, 2.42, ribZ);
      group.add(centerLamp);
    }

    const overviewFrame = new THREE.Mesh(new THREE.BoxGeometry(3.9, 1.72, 0.16), this.matObsidian);
    overviewFrame.position.set(0, 1.15, -corridorHalfSpan - 1.0);
    group.add(overviewFrame);
    const overviewMaterial = new THREE.MeshBasicMaterial({
      map: this.databaseTerminalTextures[0],
      color: '#ffffff',
      transparent: true,
      opacity: 0.92,
      toneMapped: false,
      depthWrite: false
    });
    const overviewScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.58, 1.45), overviewMaterial);
    overviewScreen.position.set(0, 1.15, -corridorHalfSpan - 0.91);
    overviewScreen.renderOrder = 5;
    group.add(overviewScreen);

    this.databaseStations.push({
      booth: overviewFrame,
      screenMaterial: overviewMaterial,
      statusLight: null,
      phase: 2.4
    });

    this.biomes.postgres = { group, baseScale: 1.0, activeRange: [0.63, 0.84], transitionPadding: 0.09 };
    this.rootGroup.add(group);
  }

  buildBiomeWordPressFoundry() {
    const group = new THREE.Group();
    group.position.set(0, 0.2, -58);
    this.wordpressModules = [];

    const moduleGeometry = new THREE.BoxGeometry(2.4, 1.45, 0.48);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = i % 2 === 0 ? 6.2 : 8.2;
      const moduleGroup = new THREE.Group();
      moduleGroup.position.set(
        Math.cos(angle) * radius,
        -1.7 + (i % 4) * 1.25,
        Math.sin(angle) * radius * 0.46
      );
      moduleGroup.rotation.y = -angle + Math.PI * 0.5;

      const panel = new THREE.Mesh(moduleGeometry, this.matObsidian);
      panel.name = `WORDPRESS_CONTENT_MODULE_${i + 1}`;
      moduleGroup.add(panel);
      this.registerCollider(panel);

      const contentBarCount = 3;
      for (let barIndex = 0; barIndex < contentBarCount; barIndex++) {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(1.45 - barIndex * 0.22, 0.05, 0.03),
          barIndex === 0 ? this.glowPurple : this.glowCyan
        );
        bar.position.set(-0.25 + barIndex * 0.1, 0.38 - barIndex * 0.32, 0.265);
        moduleGroup.add(bar);
      }

      group.add(moduleGroup);
      this.wordpressModules.push({
        group: moduleGroup,
        baseY: moduleGroup.position.y,
        phase: i * 0.58,
        orbitDirection: i % 2 === 0 ? 1 : -1
      });
    }

    this.wordpressCoreRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.35, 0.12, 12, 64),
      this.glowPurple
    );
    this.wordpressCoreRing.rotation.x = Math.PI / 2;
    group.add(this.wordpressCoreRing);

    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 0), this.matSlate);
    group.add(core);
    this.wordpressCore = core;

    this.biomes.wordpress = { group, baseScale: 1.0, activeRange: [0.76, 0.93] };
    this.rootGroup.add(group);
  }

  buildBiomeContactOrbitalUplink() {
    const group = new THREE.Group();
    group.position.set(0, 3.2, -72);

    this.contactOrbitalStation = new THREE.Group();
    this.contactOrbitalStation.name = 'CONTACT_ORBITAL_UPLINK';
    group.add(this.contactOrbitalStation);

    this.contactHubCollar = new THREE.Mesh(
      new THREE.TorusGeometry(3.45, 0.2, 14, 88),
      this.matObsidian
    );
    this.contactHubCollar.rotation.x = Math.PI / 2;
    this.contactOrbitalStation.add(this.contactHubCollar);

    this.contactHubFins = new THREE.Group();
    const finGeometry = new THREE.BoxGeometry(0.22, 0.58, 1.15);
    for (let finIndex = 0; finIndex < 8; finIndex++) {
      const angle = (finIndex / 8) * Math.PI * 2;
      const fin = new THREE.Mesh(finGeometry, this.matSlate);
      fin.position.set(Math.sin(angle) * 3.42, 0, Math.cos(angle) * 3.42);
      fin.rotation.y = angle;
      this.contactHubFins.add(fin);
    }
    this.contactOrbitalStation.add(this.contactHubFins);

    const ringConfigs = [
      { radius: 4.35, tube: 0.055, rotation: [Math.PI / 2.5, 0.18, 0.12], speed: 0.18, material: this.glowCyan },
      { radius: 5.65, tube: 0.045, rotation: [Math.PI / 2.1, -0.28, -0.18], speed: -0.12, material: this.glowPurple },
      { radius: 7.05, tube: 0.035, rotation: [Math.PI / 1.85, 0.32, 0.08], speed: 0.08, material: this.glowCyan }
    ];
    this.contactTransmissionRings = ringConfigs.map((config, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(config.radius, config.tube, 12, 96),
        config.material
      );
      ring.rotation.set(...config.rotation);
      ring.renderOrder = 2;
      this.contactOrbitalStation.add(ring);
      return {
        ring,
        baseX: config.rotation[0],
        baseY: config.rotation[1],
        baseZ: config.rotation[2],
        speed: config.speed,
        phase: index * 1.7
      };
    });

    const projectDisplays = createProjectOrbitalTextures(this.app.engine.renderer);
    this.contactProjectModules = [];
    this.contactCameraWorldPosition = new THREE.Vector3();
    this.contactCameraLocalPosition = new THREE.Vector3();
    const moduleBodyGeometry = new THREE.BoxGeometry(3.15, 1.92, 0.18, 2, 2, 1);
    const moduleScreenGeometry = new THREE.PlaneGeometry(2.92, 1.64);
    const moduleRailGeometry = new THREE.BoxGeometry(0.08, 2.18, 0.12);
    const moduleStatusGeometry = new THREE.BoxGeometry(2.58, 0.035, 0.035);
    const moduleNodeGeometry = new THREE.SphereGeometry(0.075, 12, 8);
    const moduleHeights = [-2.8, -0.85, 2.35, 0.65, -2.15, 2.85, 1.25, -0.2];
    const accentMaterials = [
      new THREE.MeshBasicMaterial({ color: '#67e8f9', transparent: true, opacity: 0.82, toneMapped: false }),
      new THREE.MeshBasicMaterial({ color: '#a78bfa', transparent: true, opacity: 0.8, toneMapped: false })
    ];

    projectDisplays.forEach((display, projectIndex) => {
      const orbitalModule = new THREE.Group();
      orbitalModule.name = `ORBITAL_PROJECT_${String(projectIndex + 1).padStart(2, '0')}`;
      const visual = new THREE.Group();
      orbitalModule.add(visual);

      const body = new THREE.Mesh(moduleBodyGeometry, this.matObsidian);
      visual.add(body);

      const screen = new THREE.Mesh(
        moduleScreenGeometry,
        new THREE.MeshBasicMaterial({
          map: display.texture,
          toneMapped: false
        })
      );
      screen.position.z = 0.096;
      visual.add(screen);

      const accentMaterial = accentMaterials[projectIndex % accentMaterials.length];
      [-1, 1].forEach((side) => {
        const rail = new THREE.Mesh(moduleRailGeometry, this.matSlate);
        rail.position.set(side * 1.66, 0, -0.01);
        visual.add(rail);

        const node = new THREE.Mesh(moduleNodeGeometry, accentMaterial);
        node.position.set(side * 1.66, side * 0.82, 0.08);
        visual.add(node);
      });

      const statusBar = new THREE.Mesh(moduleStatusGeometry, accentMaterial);
      statusBar.position.set(0, -1.02, 0.08);
      visual.add(statusBar);

      const scanLine = new THREE.Mesh(moduleStatusGeometry, accentMaterial);
      scanLine.position.z = 0.125;
      visual.add(scanLine);

      this.contactOrbitalStation.add(orbitalModule);
      this.contactProjectModules.push({
        group: orbitalModule,
        visual,
        scanLine,
        statusBar,
        baseAngle: (projectIndex / projectDisplays.length) * Math.PI * 2,
        radius: projectIndex % 2 === 0 ? 9.25 : 11.15,
        baseY: moduleHeights[projectIndex],
        phase: projectIndex * 0.79,
        orbitSpeed: 0.052
      });
    });

    const packetGeometry = new THREE.BoxGeometry(0.24, 0.055, 0.09);
    this.contactPacketMatrix = new THREE.Matrix4();
    this.contactPacketPosition = new THREE.Vector3();
    this.contactPacketQuaternion = new THREE.Quaternion();
    this.contactPacketScale = new THREE.Vector3(1, 1, 1);
    this.contactPacketEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.contactPacketStreams = [
      { material: this.glowCyan, count: 18, radiusOffset: 0, direction: 1, states: [] },
      { material: this.glowPurple, count: 14, radiusOffset: 0.7, direction: -1, states: [] }
    ].map((stream, streamIndex) => {
      const mesh = new THREE.InstancedMesh(packetGeometry, stream.material, stream.count);
      mesh.name = streamIndex === 0 ? 'CYAN_UPLINK_PACKETS' : 'VIOLET_UPLINK_PACKETS';
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      this.contactOrbitalStation.add(mesh);

      for (let packetIndex = 0; packetIndex < stream.count; packetIndex++) {
        stream.states.push({
          angle: (packetIndex / stream.count) * Math.PI * 2 + streamIndex * 0.32,
          radius: 4.45 + (packetIndex % 3) * 0.92 + stream.radiusOffset,
          baseY: (packetIndex % 3 - 1) * 1.18,
          speed: stream.direction * (0.34 + (packetIndex % 5) * 0.035),
          phase: packetIndex * 0.61 + streamIndex
        });
      }
      return { mesh, states: stream.states };
    });

    this.biomes.contact = { group, baseScale: 1.0, activeRange: [0.80, 1.0] };
    this.rootGroup.add(group);
  }

  update(deltaTime, elapsedTime, scrollProgress) {
    
    if (this.projectVaults) {
      this.projectVaults.forEach((project, index) => {
        project.vault.position.y = 0.15 + Math.sin(elapsedTime * 0.72 + project.phase) * 0.12;
        project.scanner.position.y = Math.sin(elapsedTime * 1.1 + project.phase) * 1.35;
        project.screenMaterial.opacity = 0.76 + Math.sin(elapsedTime * 0.72 + index) * 0.045;
        project.scannerMaterial.opacity = 0.72 + Math.sin(elapsedTime * 1.35 + project.phase) * 0.2;
      });
      if (this.projectConstellation) {
        this.projectConstellation.rotation.y = elapsedTime * 0.08;
        this.projectConstellation.rotation.z = Math.sin(elapsedTime * 0.22) * 0.08;
      }
    }

    if (this.vueCrystals) {
      this.vueCrystals.forEach(c => {
        c.group.position.y = c.baseY + Math.sin(elapsedTime * c.speed + c.phase) * 0.35;
        c.group.rotation.y += deltaTime * c.speed * 0.5;
        c.group.rotation.x += deltaTime * c.speed * 0.3;
      });
    }

    if (this.serverUnits && this.app._tickCount % 6 === 0) {
      this.serverUnits.forEach(u => {
        u.led.visible = Math.sin(elapsedTime * 6.0 + u.phase) > 0.0;
      });
    }

    if (this.citadelBlocks) {
      this.citadelBlocks.forEach(b => {
        b.group.position.y = (-3.5 + b.baseH / 2) + Math.sin(elapsedTime * 1.5 + b.phase) * 0.15;
      });
    }

    if (this.databaseStations) {
      this.databaseStations.forEach(station => {
        station.screenMaterial.opacity = 0.92 + Math.sin(elapsedTime * 0.45 + station.phase) * 0.035;
        if (station.statusLight) {
          station.statusLight.scale.setScalar(0.88 + Math.sin(elapsedTime * 1.8 + station.phase) * 0.12);
        }
      });
    }
    if (this.databaseFans) {
      this.databaseFans.forEach(fan => {
        fan.group.rotation.z += deltaTime * fan.speed * fan.direction;
      });
    }

    if (this.wordpressModules) {
      this.wordpressModules.forEach(module => {
        module.group.position.y = module.baseY + Math.sin(elapsedTime * 0.78 + module.phase) * 0.18;
        module.group.rotation.z = Math.sin(elapsedTime * 0.34 + module.phase) * 0.035 * module.orbitDirection;
      });
      if (this.wordpressCoreRing) this.wordpressCoreRing.rotation.z += deltaTime * 0.24;
      if (this.wordpressCore) {
        this.wordpressCore.rotation.y -= deltaTime * 0.28;
        this.wordpressCore.rotation.x += deltaTime * 0.14;
      }
    }

    if (this.contactTransmissionRings) {
      this.contactTransmissionRings.forEach((item, index) => {
        item.ring.rotation.x = item.baseX + Math.sin(elapsedTime * 0.18 + item.phase) * 0.06;
        item.ring.rotation.y = item.baseY + elapsedTime * item.speed;
        item.ring.rotation.z = item.baseZ + Math.cos(elapsedTime * 0.14 + index) * 0.045;
      });
    }
    if (this.contactHubFins) this.contactHubFins.rotation.y -= deltaTime * 0.12;
    if (this.contactHubCollar) this.contactHubCollar.rotation.z += deltaTime * 0.08;
    if (this.contactProjectModules) {
      this.app.engine.camera.getWorldPosition(this.contactCameraWorldPosition);
      this.contactCameraLocalPosition.copy(this.contactCameraWorldPosition);
      this.contactOrbitalStation.worldToLocal(this.contactCameraLocalPosition);
      this.contactProjectModules.forEach(projectModule => {
        const angle = projectModule.baseAngle + elapsedTime * projectModule.orbitSpeed;
        const moduleY = projectModule.baseY + Math.sin(elapsedTime * 0.42 + projectModule.phase) * 0.34;
        projectModule.group.position.set(
          Math.sin(angle) * projectModule.radius,
          moduleY,
          Math.cos(angle) * projectModule.radius
        );
        projectModule.group.rotation.y = Math.atan2(
          this.contactCameraLocalPosition.x - projectModule.group.position.x,
          this.contactCameraLocalPosition.z - projectModule.group.position.z
        );
        projectModule.visual.rotation.z = Math.sin(elapsedTime * 0.26 + projectModule.phase) * 0.035;
        projectModule.scanLine.position.y = -0.72 + (
          (elapsedTime * 0.16 + projectModule.phase * 0.11) % 1
        ) * 1.44;
        projectModule.statusBar.scale.x = 0.82 + Math.sin(elapsedTime * 1.4 + projectModule.phase) * 0.12;
      });
    }
    if (this.contactPacketStreams) {
      this.contactPacketStreams.forEach(stream => {
        stream.states.forEach((packet, packetIndex) => {
          packet.angle += deltaTime * packet.speed;
          this.contactPacketPosition.set(
            Math.sin(packet.angle) * packet.radius,
            packet.baseY + Math.sin(elapsedTime * 0.9 + packet.phase) * 0.24,
            Math.cos(packet.angle) * packet.radius
          );
          this.contactPacketEuler.set(0, packet.angle, Math.sin(packet.phase) * 0.08);
          this.contactPacketQuaternion.setFromEuler(this.contactPacketEuler);
          this.contactPacketMatrix.compose(
            this.contactPacketPosition,
            this.contactPacketQuaternion,
            this.contactPacketScale
          );
          stream.mesh.setMatrixAt(packetIndex, this.contactPacketMatrix);
        });
        stream.mesh.instanceMatrix.needsUpdate = true;
      });
    }

    Object.keys(this.biomes).forEach(key => {
      const biome = this.biomes[key];
      if (this.explorerActive) {
        biome.group.visible = true;
        biome.group.scale.setScalar(1);
        return;
      }

      const [minRange, maxRange] = biome.activeRange;
      const mid = (minRange + maxRange) / 2;
      const halfWidth = (maxRange - minRange) / 2;
      const dist = Math.abs(scrollProgress - mid);

      let visibility = 0;
      const transitionPadding = biome.transitionPadding ?? 0.12;
      if (dist <= halfWidth) {
        visibility = 1.0;
      } else if (dist <= halfWidth + transitionPadding) {
        visibility = 1.0 - (dist - halfWidth) / transitionPadding;
      }

      if (visibility > 0.01) {
        biome.group.visible = true;
        const targetScale = Math.max(0.01, visibility * biome.baseScale);
        biome.group.scale.set(targetScale, targetScale, targetScale);
      } else {
        biome.group.visible = false;
      }
    });
  }

  setExplorerMode(active) {
    this.explorerActive = active;
    if (active) {
      Object.values(this.biomes).forEach(biome => {
        biome.group.visible = true;
        biome.group.scale.setScalar(1);
      });
      this.refreshColliders();
    }
  }

  getProgressForPosition(position) {
    return this.getBiomeAtPosition(position).centerProgress;
  }

  getBiomeAtPosition(position) {
    let activeBiome = this.biomeRanges[0];
    for (let index = 1; index < this.biomeRanges.length; index++) {
      const biome = this.biomeRanges[index];
      if (position.z > biome.entryZ) break;
      activeBiome = biome;
    }
    return activeBiome;
  }

  resolveCameraCollision(position, velocity, radius = 0.62) {
    const bounds = {
      minX: -13.5,
      maxX: 13.5,
      minY: -4.8,
      maxY: 9.5,
      minZ: -80.0,
      maxZ: 9.5
    };

    position.x = THREE.MathUtils.clamp(position.x, bounds.minX, bounds.maxX);
    position.y = THREE.MathUtils.clamp(position.y, bounds.minY, bounds.maxY);
    position.z = THREE.MathUtils.clamp(position.z, bounds.minZ, bounds.maxZ);

    for (const collider of this.colliders) {
      const expanded = this._expandedCollider.copy(collider.box).expandByScalar(radius);
      if (!expanded.containsPoint(position)) continue;

      const distances = [
        { axis: 'x', direction: -1, distance: position.x - expanded.min.x },
        { axis: 'x', direction: 1, distance: expanded.max.x - position.x },
        { axis: 'y', direction: -1, distance: position.y - expanded.min.y },
        { axis: 'y', direction: 1, distance: expanded.max.y - position.y },
        { axis: 'z', direction: -1, distance: position.z - expanded.min.z },
        { axis: 'z', direction: 1, distance: expanded.max.z - position.z }
      ];
      distances.sort((a, b) => a.distance - b.distance);
      const collision = distances[0];

      if (collision.axis === 'x') {
        position.x = collision.direction < 0 ? expanded.min.x : expanded.max.x;
        if (velocity.x * collision.direction < 0) velocity.x = 0;
      } else if (collision.axis === 'y') {
        position.y = collision.direction < 0 ? expanded.min.y : expanded.max.y;
        if (velocity.y * collision.direction < 0) velocity.y = 0;
      } else {
        position.z = collision.direction < 0 ? expanded.min.z : expanded.max.z;
        if (velocity.z * collision.direction < 0) velocity.z = 0;
      }
    }

    return position;
  }
}
