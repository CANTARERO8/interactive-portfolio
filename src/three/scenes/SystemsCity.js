import * as THREE from 'three';
import {
  SYSTEMS_CITY_DISTRICTS,
  createSystemsCitySignTextures
} from '../textures/SystemsCitySignTextures.js';

const QUALITY_MODES = new Set(['performance', 'ultra', 'ultra-plus']);
const CITY_FLOOR_Y = -3.18;
const CITY_AVENUE_X = 20.4;
const CITY_AERIAL_RAIL_X = 22.0;
const CITY_LANDMARK_X = 15.8;
const CITY_HORIZON_Z = -16.0;

const DISTRICT_LAYOUT = Object.freeze([
  { key: 'hero', z: 0, progress: 0.0, seed: 1103, landmark: 'gateway', side: -1 },
  { key: 'about', z: -8, progress: 0.14, seed: 2207, landmark: 'lab', side: 1 },
  { key: 'projects', z: -16, progress: 0.28, seed: 3301, landmark: 'archive', side: -1 },
  { key: 'vue', z: -25, progress: 0.43, seed: 4409, landmark: 'reactive', side: 1 },
  { key: 'laravel', z: -35, progress: 0.57, seed: 5519, landmark: 'backend', side: -1 },
  { key: 'postgres', z: -46, progress: 0.71, seed: 6619, landmark: 'database', side: 1 },
  { key: 'wordpress', z: -58, progress: 0.85, seed: 7723, landmark: 'content', side: -1 },
  { key: 'contact', z: -72, progress: 1.0, seed: 8837, landmark: 'uplink', side: 1 }
]);

const seededRandom = seed => {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const getDistrictDefinition = key => SYSTEMS_CITY_DISTRICTS.find(district => district.key === key);

export class SystemsCity {
  constructor(app) {
    this.app = app;
    this.scene = app.engine.scene;
    this.camera = app.engine.camera;
    this.qualityMode = 'ultra';
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'SystemsCity';
    this.scene.add(this.rootGroup);

    this.baseInfrastructure = new THREE.Group();
    this.ultraInfrastructure = new THREE.Group();
    this.ultraPlusInfrastructure = new THREE.Group();
    this.rootGroup.add(this.baseInfrastructure, this.ultraInfrastructure, this.ultraPlusInfrastructure);

    this.districts = [];
    this.windowMaterials = [];
    this.trafficLayers = [];
    this.droneStates = [];
    this.towerMatrices = {
      base: { bodies: [], windows: [], caps: [] },
      ultra: { bodies: [], windows: [], caps: [] },
      'ultra-plus': { bodies: [], windows: [], caps: [] }
    };
    this._matrix = new THREE.Matrix4();
    this._position = new THREE.Vector3();
    this._scale = new THREE.Vector3(1, 1, 1);
    this._quaternion = new THREE.Quaternion();
    this._rotation = new THREE.Euler();

    this.signs = createSystemsCitySignTextures(app.engine.renderer);
    this.initSharedAssets();
    this.buildInfrastructure();
    this.buildDistricts();
    this.finalizeTowerTiers();
    this.buildTrafficNetwork();

    this.rootGroup.updateMatrixWorld(true);
    this.app.biomes?.refreshColliders();
    this.setQualityMode(this.app.engine.qualityMode);
  }

  initSharedAssets() {
    this.unitBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.capGeometry = new THREE.ConeGeometry(0.5, 1, 4);
    this.signGeometry = new THREE.PlaneGeometry(3.6, 1.35);
    this.podGeometry = new THREE.BoxGeometry(0.72, 0.3, 1.35);
    this.droneGeometry = new THREE.TetrahedronGeometry(0.18, 0);

    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: '#050912',
      roughness: 0.72,
      metalness: 0.48
    });
    this.infrastructureMaterial = new THREE.MeshStandardMaterial({
      color: '#080e1b',
      roughness: 0.46,
      metalness: 0.72
    });
    this.cyanGlowMaterial = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.72,
      toneMapped: false
    });
    this.violetGlowMaterial = new THREE.MeshBasicMaterial({
      color: '#a855f7',
      transparent: true,
      opacity: 0.66,
      toneMapped: false
    });
  }

  createBodyMaterial(tier) {
    const tierIntensity = tier === 'base' ? 0.06 : (tier === 'ultra' ? 0.085 : 0.11);
    return new THREE.MeshPhysicalMaterial({
      color: tier === 'base' ? '#02050a' : '#030711',
      emissive: new THREE.Color(tier === 'ultra-plus' ? '#151229' : '#071827'),
      emissiveIntensity: tierIntensity,
      roughness: 0.44,
      metalness: 0.84,
      clearcoat: 0.16,
      clearcoatRoughness: 0.34,
      flatShading: false
    });
  }

  createGlowMaterial(tier) {
    const material = new THREE.MeshBasicMaterial({
      color: tier === 'ultra-plus' ? '#a78bfa' : '#67e8f9',
      transparent: true,
      opacity: tier === 'base' ? 0.22 : (tier === 'ultra' ? 0.34 : 0.46),
      toneMapped: false
    });
    this.windowMaterials.push({ material, tier, phase: this.windowMaterials.length * 0.53 });
    return material;
  }

  addBox(parent, size, position, material, name = '') {
    const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.name = name;
    parent.add(mesh);
    return mesh;
  }

  buildInfrastructure() {
    const avenueLength = 94;
    const avenueCenterZ = -36;
    const crossStreetMatrices = [];
    const crossGlowMatrices = [];
    const branchPositions = [];
    [-CITY_AVENUE_X, CITY_AVENUE_X].forEach((x, index) => {
      this.addBox(
        this.baseInfrastructure,
        [2.35, 0.08, avenueLength],
        [x, CITY_FLOOR_Y, avenueCenterZ],
        this.roadMaterial,
        `SYSTEMS_AVENUE_${index + 1}`
      );
    });

    [-19.15, -21.65, 19.15, 21.65].forEach((x, index) => {
      const rail = this.addBox(
        this.baseInfrastructure,
        [0.055, 0.035, avenueLength],
        [x, CITY_FLOOR_Y + 0.07, avenueCenterZ],
        index % 2 === 0 ? this.cyanGlowMaterial : this.violetGlowMaterial
      );
      rail.renderOrder = 2;
    });

    DISTRICT_LAYOUT.forEach((layout, index) => {
      [-1, 1].forEach(side => {
        this._quaternion.identity();
        this._position.set(side * 21.75, CITY_FLOOR_Y + 0.01, layout.z);
        this._scale.set(11.5, 0.055, 1.15);
        this._matrix.compose(this._position, this._quaternion, this._scale);
        crossStreetMatrices.push(this._matrix.clone());

        this._position.set(side * 21.75, CITY_FLOOR_Y + 0.055, layout.z);
        this._scale.set(10.9, 0.025, 0.04);
        this._matrix.compose(this._position, this._quaternion, this._scale);
        crossGlowMatrices.push(this._matrix.clone());
      });

      if (index < DISTRICT_LAYOUT.length - 1) {
        [-1, 1].forEach(side => {
          const y = CITY_FLOOR_Y + 0.1;
          const x0 = side * 16.2;
          const x1 = side * 20.2;
          const x2 = side * 25.6;
          const z0 = layout.z;
          const z1 = layout.z - 2.2;
          const z2 = layout.z - 2.8;
          branchPositions.push(
            x0, y, z0, x1, y, z1,
            x1, y, z1, x2, y, z2
          );
        });
      }
    });

    const crossStreets = new THREE.InstancedMesh(
      this.unitBoxGeometry,
      this.roadMaterial,
      crossStreetMatrices.length
    );
    const crossGlows = new THREE.InstancedMesh(
      this.unitBoxGeometry,
      this.cyanGlowMaterial,
      crossGlowMatrices.length
    );
    crossStreets.name = 'CITY_CROSS_STREETS';
    crossGlows.name = 'CITY_CROSS_STREET_DATA_LINES';
    crossStreetMatrices.forEach((matrix, index) => crossStreets.setMatrixAt(index, matrix));
    crossGlowMatrices.forEach((matrix, index) => crossGlows.setMatrixAt(index, matrix));
    crossStreets.instanceMatrix.needsUpdate = true;
    crossGlows.instanceMatrix.needsUpdate = true;
    crossGlows.renderOrder = 2;
    this.baseInfrastructure.add(crossStreets, crossGlows);

    const branchGeometry = new THREE.BufferGeometry();
    branchGeometry.setAttribute('position', new THREE.Float32BufferAttribute(branchPositions, 3));
    this.ultraInfrastructure.add(new THREE.LineSegments(
      branchGeometry,
      new THREE.LineBasicMaterial({ color: '#67e8f9', transparent: true, opacity: 0.28 })
    ));

    [-CITY_AERIAL_RAIL_X, CITY_AERIAL_RAIL_X].forEach((x, index) => {
      this.addBox(
        this.ultraInfrastructure,
        [0.11, 0.11, 91],
        [x, 6.25, avenueCenterZ],
        this.infrastructureMaterial,
        `AERIAL_DATA_RAIL_${index + 1}`
      );
      this.addBox(
        this.ultraInfrastructure,
        [0.035, 0.035, 91],
        [x, 6.18, avenueCenterZ],
        index === 0 ? this.cyanGlowMaterial : this.violetGlowMaterial
      );
    });
  }

  buildDistricts() {
    DISTRICT_LAYOUT.forEach((layout, index) => {
      const definition = getDistrictDefinition(layout.key);
      const root = new THREE.Group();
      root.name = `CITY_DISTRICT_${layout.key.toUpperCase()}`;
      root.position.z = layout.z;

      const base = new THREE.Group();
      const ultra = new THREE.Group();
      const ultraPlus = new THREE.Group();
      base.name = `${root.name}_BASE`;
      ultra.name = `${root.name}_ULTRA`;
      ultraPlus.name = `${root.name}_ULTRA_PLUS`;
      root.add(base, ultra, ultraPlus);
      this.rootGroup.add(root);

      this.buildTowerTier(layout, 'base', {
        perSide: 3,
        xMin: 18.0,
        xMax: 32.0,
        zOffset: CITY_HORIZON_Z - 2.0,
        zSpread: 7.0,
        minHeight: 6,
        maxHeight: 17
      });
      this.buildTowerTier(layout, 'ultra', {
        perSide: 2,
        xMin: 15.5,
        xMax: 28.0,
        zOffset: CITY_HORIZON_Z,
        zSpread: 6.5,
        minHeight: 4.8,
        maxHeight: 12.5
      });
      this.buildTowerTier(layout, 'ultra-plus', {
        perSide: 2,
        xMin: 26.0,
        xMax: 42.0,
        zOffset: CITY_HORIZON_Z - 4.0,
        zSpread: 7.5,
        minHeight: 7.5,
        maxHeight: 19
      });

      this.buildLandmark(base, definition, layout, index);
      this.buildAerialBridge(ultra, definition, index);

      this.districts.push({ ...layout, definition, root, base, ultra, ultraPlus });
    });
  }

  buildTowerTier(layout, tier, settings) {
    const random = seededRandom(layout.seed + (tier === 'base' ? 17 : tier === 'ultra' ? 37 : 73));
    const buildingCount = settings.perSide * 2;
    const matrices = this.towerMatrices[tier];
    for (let index = 0; index < buildingCount; index++) {
      const side = index % 2 === 0 ? -1 : 1;
      const sideIndex = Math.floor(index / 2);
      const laneRatio = (sideIndex + 1) / (settings.perSide + 1);
      const x = side * (
        settings.xMin
        + laneRatio * (settings.xMax - settings.xMin)
        + (random() - 0.5) * 0.5
      );
      const z = layout.z + settings.zOffset + (laneRatio - 0.5) * settings.zSpread + (random() - 0.5) * 0.4;
      const height = settings.minHeight + random() * (settings.maxHeight - settings.minHeight);
      const width = 1.9 + random() * 1.5;
      const depth = 1.8 + random() * 1.7;
      const lowerHeight = height * (0.62 + random() * 0.09);
      const upperHeight = height - lowerHeight;
      const baseY = CITY_FLOOR_Y + 0.04;
      const upperWidth = width * (0.58 + random() * 0.16);
      const upperDepth = depth * (0.56 + random() * 0.2);

      this._position.set(x, baseY + lowerHeight * 0.5, z);
      this._scale.set(width, lowerHeight, depth);
      this._quaternion.identity();
      this._matrix.compose(this._position, this._quaternion, this._scale);
      matrices.bodies.push(this._matrix.clone());

      this._position.set(
        x + side * (random() - 0.5) * width * 0.24,
        baseY + lowerHeight + upperHeight * 0.5,
        z + (random() - 0.5) * depth * 0.18
      );
      this._scale.set(upperWidth, upperHeight, upperDepth);
      this._matrix.compose(this._position, this._quaternion, this._scale);
      matrices.bodies.push(this._matrix.clone());

      for (let band = 0; band < 3; band++) {
        const bandY = baseY + height * (0.22 + band * 0.22);
        this._position.set(x - side * (width * 0.5 + 0.035), bandY, z);
        this._scale.set(0.045, Math.max(0.08, height * 0.045), depth * (0.48 + band * 0.08));
        this._matrix.compose(this._position, this._quaternion, this._scale);
        matrices.windows.push(this._matrix.clone());
      }

      const capHeight = Math.max(0.45, height * 0.09);
      this._position.set(x, baseY + height + capHeight * 0.5, z);
      this._scale.set(upperWidth * 0.48, capHeight, upperDepth * 0.48);
      this._quaternion.setFromEuler(this._rotation.set(0, random() * Math.PI, 0));
      this._matrix.compose(this._position, this._quaternion, this._scale);
      matrices.caps.push(this._matrix.clone());
    }
  }

  finalizeTowerTiers() {
    const tierParents = {
      base: this.baseInfrastructure,
      ultra: this.ultraInfrastructure,
      'ultra-plus': this.ultraPlusInfrastructure
    };

    Object.entries(this.towerMatrices).forEach(([tier, matrices]) => {
      const bodyMaterial = this.createBodyMaterial(tier);
      const glowMaterial = this.createGlowMaterial(tier);
      const bodies = new THREE.InstancedMesh(this.unitBoxGeometry, bodyMaterial, matrices.bodies.length);
      const windows = new THREE.InstancedMesh(this.unitBoxGeometry, glowMaterial, matrices.windows.length);
      const caps = new THREE.InstancedMesh(this.capGeometry, glowMaterial, matrices.caps.length);
      bodies.name = `${tier.toUpperCase()}_CITY_TOWER_BODIES`;
      windows.name = `${tier.toUpperCase()}_CITY_FACADE_LIGHTS`;
      caps.name = `${tier.toUpperCase()}_CITY_ROOF_BEACONS`;

      matrices.bodies.forEach((matrix, index) => bodies.setMatrixAt(index, matrix));
      matrices.windows.forEach((matrix, index) => windows.setMatrixAt(index, matrix));
      matrices.caps.forEach((matrix, index) => caps.setMatrixAt(index, matrix));
      bodies.instanceMatrix.needsUpdate = true;
      windows.instanceMatrix.needsUpdate = true;
      caps.instanceMatrix.needsUpdate = true;
      tierParents[tier].add(bodies, windows, caps);
    });
  }

  buildLandmark(parent, definition, layout, districtIndex) {
    const side = layout.side;
    const landmark = new THREE.Group();
    landmark.name = `LANDMARK_${definition.key.toUpperCase()}`;
    landmark.position.set(
      side * CITY_LANDMARK_X,
      0,
      CITY_HORIZON_Z + (districtIndex % 2 === 0 ? 0.6 : -0.6)
    );
    landmark.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    parent.add(landmark);

    const bodyMaterial = this.createBodyMaterial('ultra');
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: definition.accent,
      transparent: true,
      opacity: 0.72,
      toneMapped: false
    });
    let collider = null;
    let signY = 0.1;
    let signZ = 2.2;

    if (layout.landmark === 'gateway') {
      collider = this.addBox(landmark, [3.8, 10.8, 3.4], [0, 2.22, 0], bodyMaterial, 'CITY_GATEWAY_TOWER');
      this.addBox(landmark, [2.7, 0.16, 3.5], [0, 6.8, 0], glowMaterial);
      const crown = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.06, 10, 64), glowMaterial);
      crown.position.y = 7.3;
      crown.rotation.x = Math.PI / 2;
      landmark.add(crown);
      this.addBox(landmark, [0.12, 3.2, 0.12], [0, 8.5, 0], glowMaterial);
      signY = 1.2;
      signZ = 1.78;
    } else if (layout.landmark === 'lab') {
      collider = this.addBox(landmark, [6.2, 3.4, 4.4], [0, -1.42, 0], bodyMaterial, 'DEVELOPER_LAB');
      [-1.8, 0, 1.8].forEach((x, index) => {
        this.addBox(landmark, [1.25, 1.05 + index * 0.25, 1.5], [x, 0.45 + index * 0.12, -0.4], bodyMaterial);
        this.addBox(landmark, [0.75, 0.05, 1.56], [x, 0.95 + index * 0.25, -0.4], glowMaterial);
      });
      signY = -0.75;
      signZ = 2.25;
    } else if (layout.landmark === 'archive') {
      const left = this.addBox(landmark, [1.45, 5.8, 4.0], [-2.2, -0.25, 0], bodyMaterial, 'PROJECT_ARCHIVE_MUSEUM');
      this.addBox(landmark, [1.45, 5.8, 4.0], [2.2, -0.25, 0], bodyMaterial);
      this.addBox(landmark, [5.8, 0.4, 4.0], [0, 2.45, 0], bodyMaterial);
      this.addBox(landmark, [4.1, 0.06, 0.08], [0, 1.7, 2.05], glowMaterial);
      collider = left;
      signY = 0.25;
      signZ = 2.08;
    } else if (layout.landmark === 'reactive') {
      collider = this.addBox(landmark, [5.4, 1.15, 4.2], [0, -2.55, 0], bodyMaterial, 'VUE_REACTIVE_TOWER');
      const prism = new THREE.Mesh(new THREE.OctahedronGeometry(2.05, 0), bodyMaterial);
      prism.scale.set(1, 2.35, 1);
      prism.position.y = 1.45;
      landmark.add(prism);
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.045, 10, 64), glowMaterial);
      orbit.position.y = 1.45;
      orbit.rotation.x = Math.PI / 2.8;
      landmark.add(orbit);
      signY = -1.15;
      signZ = 2.15;
    } else if (layout.landmark === 'backend') {
      collider = this.addBox(landmark, [6.4, 2.9, 4.6], [0, -1.67, 0], bodyMaterial, 'LARAVEL_BACKEND_FOUNDRY');
      [-1.9, 0, 1.9].forEach((x, index) => {
        this.addBox(landmark, [1.45, 1.25, 2.8], [x, 0.28 + index * 0.18, -0.35], bodyMaterial);
        this.addBox(landmark, [1.1, 0.07, 2.85], [x, 0.9 + index * 0.18, -0.35], glowMaterial);
      });
      this.addBox(landmark, [5.2, 0.1, 0.12], [0, -0.58, 2.35], glowMaterial);
      signY = -1.03;
      signZ = 2.36;
    } else if (layout.landmark === 'database') {
      collider = this.addBox(landmark, [6.4, 3.2, 4.8], [0, -1.55, 0], bodyMaterial, 'POSTGRES_BACKUP_FACILITY');
      for (let panel = 0; panel < 5; panel++) {
        this.addBox(landmark, [0.78, 1.28, 0.08], [-2.0 + panel, -1.28, 2.45], bodyMaterial);
        this.addBox(landmark, [0.52, 0.05, 0.05], [-2.0 + panel, -1.2, 2.51], glowMaterial);
      }
      this.addBox(landmark, [4.8, 0.08, 0.08], [0, 0.18, 2.45], glowMaterial);
      signY = -0.42;
      signZ = 2.47;
    } else if (layout.landmark === 'content') {
      const moduleSizes = [
        [-1.6, -1.9, 0, 2.6, 2.4, 3.8],
        [1.45, -1.55, -0.4, 2.9, 3.1, 3.0],
        [-1.1, 0.35, 0.25, 3.7, 1.6, 3.2],
        [1.7, 0.95, -0.1, 2.1, 1.7, 2.8]
      ];
      moduleSizes.forEach((module, index) => {
        const mesh = this.addBox(
          landmark,
          [module[3], module[4], module[5]],
          [module[0], module[1], module[2]],
          bodyMaterial,
          index === 0 ? 'WORDPRESS_CONTENT_WORKS' : ''
        );
        if (index === 0) collider = mesh;
      });
      this.addBox(landmark, [4.6, 0.07, 0.08], [0, -0.45, 2.12], glowMaterial);
      signY = -0.95;
      signZ = 2.14;
    } else {
      collider = this.addBox(landmark, [4.5, 2.2, 4.5], [0, -2.04, 0], bodyMaterial, 'CONTACT_UPLINK_PORT');
      this.addBox(landmark, [0.28, 9.2, 0.28], [0, 2.0, 0], bodyMaterial);
      [1.15, 1.75, 2.35].forEach((radius, index) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.04, 10, 56), glowMaterial);
        ring.position.y = 4.1 + index * 0.38;
        ring.rotation.x = Math.PI / 2.7 + index * 0.2;
        landmark.add(ring);
      });
      const dish = new THREE.Mesh(
        new THREE.ConeGeometry(1.6, 0.7, 28, 1, true),
        new THREE.MeshBasicMaterial({
          color: definition.accent,
          transparent: true,
          opacity: 0.16,
          toneMapped: false
        })
      );
      dish.position.set(0, 3.1, 0.2);
      dish.rotation.x = -Math.PI / 2.8;
      landmark.add(dish);
      signY = -1.22;
      signZ = 2.3;
    }

    const signDefinition = this.signs.find(sign => sign.key === definition.key);
    const signFrame = this.addBox(landmark, [3.92, 1.62, 0.12], [0, signY, signZ - 0.07], this.infrastructureMaterial);
    const signMaterial = new THREE.MeshBasicMaterial({
      map: signDefinition.texture,
      color: '#ffffff',
      transparent: true,
      opacity: 0.92,
      toneMapped: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const sign = new THREE.Mesh(this.signGeometry, signMaterial);
    sign.position.set(0, signY, signZ);
    sign.renderOrder = 5;
    landmark.add(sign);
    this.windowMaterials.push({ material: signMaterial, tier: 'sign', phase: districtIndex * 0.71 });

    if (collider) this.app.biomes?.registerCollider(collider);
    signFrame.name = `CITY_SIGN_FRAME_${definition.key.toUpperCase()}`;
  }

  buildAerialBridge(parent, definition, index) {
    const bridgeZ = CITY_HORIZON_Z + (index % 2 === 0 ? -2.2 : 2.0);
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: definition.accent,
      transparent: true,
      opacity: 0.52,
      toneMapped: false
    });
    [-1, 1].forEach(side => {
      this.addBox(
        parent,
        [8.4, 0.18, 0.32],
        [side * 18.0, 5.45 + (index % 3) * 0.45, bridgeZ],
        this.infrastructureMaterial
      );
      this.addBox(
        parent,
        [7.7, 0.035, 0.36],
        [side * 18.0, 5.34 + (index % 3) * 0.45, bridgeZ],
        lightMaterial
      );
    });
  }

  buildTrafficNetwork() {
    this.createTrafficLayer(this.ultraInfrastructure, 8, 9901, 'ultra');
    this.createTrafficLayer(this.ultraPlusInfrastructure, 14, 11939, 'ultra-plus');

    const random = seededRandom(14011);
    const droneMaterial = new THREE.MeshBasicMaterial({
      color: '#d8f7ff',
      transparent: true,
      opacity: 0.82,
      toneMapped: false
    });
    this.drones = new THREE.InstancedMesh(this.droneGeometry, droneMaterial, 14);
    this.drones.name = 'ULTRA_PLUS_MAINTENANCE_DRONES';
    for (let index = 0; index < 14; index++) {
      this.droneStates.push({
        baseX: (index % 2 === 0 ? -1 : 1) * (18.0 + random() * 12.0),
        baseY: 1.8 + random() * 5.8,
        baseZ: 5 - random() * 84,
        phase: random() * Math.PI * 2,
        speed: 0.12 + random() * 0.2
      });
    }
    this.ultraPlusInfrastructure.add(this.drones);
  }

  createTrafficLayer(parent, count, seed, tier) {
    const random = seededRandom(seed);
    const material = new THREE.MeshBasicMaterial({
      color: tier === 'ultra' ? '#67e8f9' : '#d8b4fe',
      transparent: true,
      opacity: tier === 'ultra' ? 0.66 : 0.82,
      toneMapped: false
    });
    const mesh = new THREE.InstancedMesh(this.podGeometry, material, count);
    mesh.name = `${tier.toUpperCase()}_DATA_TRANSIT_PODS`;
    const states = Array.from({ length: count }, (_, index) => ({
      side: index % 2 === 0 ? -1 : 1,
      phase: random(),
      speed: 0.022 + random() * 0.018,
      yOffset: (random() - 0.5) * 0.18
    }));
    this.trafficLayers.push({ mesh, states, tier });
    parent.add(mesh);
  }

  setQualityMode(mode) {
    this.qualityMode = QUALITY_MODES.has(mode) ? mode : 'ultra';
    const isPerformance = this.qualityMode === 'performance';
    const isUltraPlus = this.qualityMode === 'ultra-plus';

    this.ultraInfrastructure.visible = !isPerformance;
    this.ultraPlusInfrastructure.visible = isUltraPlus;
    this.districts.forEach(district => {
      district.base.visible = true;
      district.ultra.visible = !isPerformance;
      district.ultraPlus.visible = isUltraPlus;
    });
  }

  update(deltaTime, elapsedTime, sceneProgress, explorerActive) {
    const progressRange = this.qualityMode === 'performance'
      ? 0.17
      : 0.22;
    this.districts.forEach(district => {
      const visible = explorerActive
        ? Math.abs(this.camera.position.z - district.z) < 38
        : Math.abs(sceneProgress - district.progress) < progressRange;
      district.root.visible = visible;
    });

    this.windowMaterials.forEach((entry, index) => {
      const baseOpacity = entry.tier === 'base' ? 0.22 : entry.tier === 'ultra' ? 0.34 : entry.tier === 'sign' ? 0.88 : 0.46;
      entry.material.opacity = baseOpacity + Math.sin(elapsedTime * 0.22 + entry.phase + index * 0.13) * 0.035;
    });

    this.trafficLayers.forEach(layer => {
      if (!layer.mesh.parent.visible) return;
      layer.states.forEach((state, index) => {
        const travel = (elapsedTime * state.speed + state.phase) % 1;
        const reverse = state.side > 0;
        const z = reverse ? 8 - travel * 91 : -83 + travel * 91;
        this._position.set(state.side * CITY_AERIAL_RAIL_X, 6.35 + state.yOffset, z);
        this._scale.set(1, 1, 1);
        this._quaternion.setFromEuler(this._rotation.set(0, reverse ? 0 : Math.PI, 0));
        this._matrix.compose(this._position, this._quaternion, this._scale);
        layer.mesh.setMatrixAt(index, this._matrix);
      });
      layer.mesh.instanceMatrix.needsUpdate = true;
    });

    if (this.ultraPlusInfrastructure.visible && this.drones) {
      this.droneStates.forEach((drone, index) => {
        const drift = elapsedTime * drone.speed + drone.phase;
        this._position.set(
          drone.baseX + Math.sin(drift * 0.72) * 1.25,
          drone.baseY + Math.sin(drift * 1.4) * 0.42,
          drone.baseZ + Math.cos(drift * 0.46) * 2.2
        );
        this._scale.setScalar(0.82 + Math.sin(drift) * 0.12);
        this._quaternion.setFromEuler(this._rotation.set(drift * 0.4, drift * 0.7, drift * 0.2));
        this._matrix.compose(this._position, this._quaternion, this._scale);
        this.drones.setMatrixAt(index, this._matrix);
      });
      this.drones.instanceMatrix.needsUpdate = true;
    }
  }
}
