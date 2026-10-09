import * as THREE from 'three';

export const BIOME_DEFINITIONS = [
  {
    key: 'hero',
    name: 'Hero Sanctum',
    progress: 0.00,
    z: 0,
    sky: {
      zenith: '#02040b',
      horizon: '#142442',
      nadir: '#010207',
      tint: '#0b172a',
      glow: 0.75,
      luminance: 1.0
    },
    fog: {
      color: '#0a162b',
      density: 0.017
    },
    ambient: {
      color: '#16335a',
      intensity: 1.35,
      hemiSky: '#86e9ff',
      hemiGround: '#02030a'
    },
    particles: {
      color: '#9bbcd8',
      speed: 1.0,
      size: 1.0
    }
  },
  {
    key: 'about',
    name: 'Data Vault',
    progress: 0.14,
    z: -8,
    sky: {
      zenith: '#020612',
      horizon: '#122a4d',
      nadir: '#010309',
      tint: '#091c33',
      glow: 0.65,
      luminance: 0.96
    },
    fog: {
      color: '#08172e',
      density: 0.019
    },
    ambient: {
      color: '#132d4e',
      intensity: 1.25,
      hemiSky: '#60a5fa',
      hemiGround: '#02040c'
    },
    particles: {
      color: '#7dd3fc',
      speed: 0.85,
      size: 0.95
    }
  },
  {
    key: 'projects',
    name: 'Creative Archive',
    progress: 0.28,
    z: -16,
    sky: {
      zenith: '#040514',
      horizon: '#1d204d',
      nadir: '#02020a',
      tint: '#121532',
      glow: 0.70,
      luminance: 0.98
    },
    fog: {
      color: '#0d122e',
      density: 0.018
    },
    ambient: {
      color: '#1b2354',
      intensity: 1.30,
      hemiSky: '#a78bfa',
      hemiGround: '#03030d'
    },
    particles: {
      color: '#c4b5fd',
      speed: 0.95,
      size: 1.05
    }
  },
  {
    key: 'vue',
    name: 'Reactive Crystal Chamber',
    progress: 0.43,
    z: -25,
    sky: {
      zenith: '#020a0d',
      horizon: '#11383b',
      nadir: '#010507',
      tint: '#092224',
      glow: 0.82,
      luminance: 1.04
    },
    fog: {
      color: '#082124',
      density: 0.019
    },
    ambient: {
      color: '#114446',
      intensity: 1.40,
      hemiSky: '#34d399',
      hemiGround: '#010809'
    },
    particles: {
      color: '#6ee7b7',
      speed: 1.15,
      size: 0.9
    }
  },
  {
    key: 'laravel',
    name: 'Monolithic Citadel',
    progress: 0.57,
    z: -35,
    sky: {
      zenith: '#0d050a',
      horizon: '#38202b',
      nadir: '#070205',
      tint: '#22141a',
      glow: 0.60,
      luminance: 0.94
    },
    fog: {
      color: '#211018',
      density: 0.021
    },
    ambient: {
      color: '#3d1d2b',
      intensity: 1.28,
      hemiSky: '#f87171',
      hemiGround: '#080306'
    },
    particles: {
      color: '#fca5a5',
      speed: 0.75,
      size: 1.2
    }
  },
  {
    key: 'postgres',
    name: 'Subterranean Core',
    progress: 0.71,
    z: -46,
    sky: {
      zenith: '#020712',
      horizon: '#132a48',
      nadir: '#01030a',
      tint: '#0a1a2e',
      glow: 0.58,
      luminance: 0.92
    },
    fog: {
      color: '#09182b',
      density: 0.023
    },
    ambient: {
      color: '#132e4d',
      intensity: 1.20,
      hemiSky: '#38bdf8',
      hemiGround: '#02050c'
    },
    particles: {
      color: '#38bdf8',
      speed: 0.8,
      size: 0.95
    }
  },
  {
    key: 'wordpress',
    name: 'Organic Foundry',
    progress: 0.85,
    z: -58,
    sky: {
      zenith: '#100722',
      horizon: '#4f2b78',
      nadir: '#1a0e2e',
      tint: '#3b1d5c',
      glow: 1.55,
      luminance: 1.28
    },
    fog: {
      color: '#28143d',
      density: 0.012
    },
    ambient: {
      color: '#5b2f8a',
      intensity: 2.2,
      hemiSky: '#e9d5ff',
      hemiGround: '#1c0d33'
    },
    particles: {
      color: '#d8b4fe',
      speed: 0.85,
      size: 1.2
    }
  },
  {
    key: 'contact',
    name: 'Orbital Gateway',
    progress: 1.00,
    z: -72,
    sky: {
      zenith: '#030511',
      horizon: '#1c2045',
      nadir: '#010208',
      tint: '#101228',
      glow: 0.95,
      luminance: 1.08
    },
    fog: {
      color: '#0e122b',
      density: 0.016
    },
    ambient: {
      color: '#202657',
      intensity: 1.45,
      hemiSky: '#818cf8',
      hemiGround: '#03040e'
    },
    particles: {
      color: '#a5b4fc',
      speed: 1.2,
      size: 1.15
    }
  }
];

export class BiomeAtmospheres {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.group = new THREE.Group();
    this.group.name = 'BiomeAtmospheresBackdrop';
    this.scene.add(this.group);

    // Working color objects for zero-garbage-collection lerping
    this.currentSkyZenith = new THREE.Color();
    this.currentSkyHorizon = new THREE.Color();
    this.currentSkyNadir = new THREE.Color();
    this.currentSkyTint = new THREE.Color();
    this.currentFogColor = new THREE.Color();
    this.currentAmbientColor = new THREE.Color();
    this.currentHemiSky = new THREE.Color();
    this.currentHemiGround = new THREE.Color();
    this.currentParticleColor = new THREE.Color();

    this._c1 = new THREE.Color();
    this._c2 = new THREE.Color();

    this.currentFogDensity = 0.018;
    this.currentSkyGlow = 0.75;
    this.currentSkyLuminance = 1.0;
    this.currentAmbientIntensity = 1.35;
    this.currentParticleSpeed = 1.0;
    this.currentParticleSize = 1.0;

    this.regionalBackdrops = {};
    this.buildRegionalBackdrops();
  }

  buildRegionalBackdrops() {
    // Shared dark silhouette shader material for regional structures
    const structureMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#03060f'),
      roughness: 0.85,
      metalness: 0.52
    });

    const portalMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#050a18'),
      roughness: 0.38,
      metalness: 0.82
    });

    const portalRingMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#6366f1'),
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide
    });

    // 1. Hero Gateway in the distance
    const heroBackdrop = new THREE.Group();
    const heroPillarGeo = new THREE.BoxGeometry(3.5, 42, 3.5);
    [-42, 42].forEach(x => {
      const p = new THREE.Mesh(heroPillarGeo, structureMaterial);
      p.position.set(x, 8, -6);
      heroBackdrop.add(p);
    });
    this.regionalBackdrops.hero = { group: heroBackdrop, centerProgress: 0.0, range: 0.22 };
    this.group.add(heroBackdrop);

    // 2. About Data Silos in the distance
    const aboutBackdrop = new THREE.Group();
    const siloGeo = new THREE.CylinderGeometry(2.4, 2.8, 36, 8);
    [-48, -58, 48, 58].forEach((x, i) => {
      const silo = new THREE.Mesh(siloGeo, structureMaterial);
      silo.position.set(x, 6, -12 + (i % 2) * 5);
      aboutBackdrop.add(silo);
    });
    this.regionalBackdrops.about = { group: aboutBackdrop, centerProgress: 0.14, range: 0.18 };
    this.group.add(aboutBackdrop);

    // 3. Projects Tiered Archives in the distance
    const projectsBackdrop = new THREE.Group();
    const archiveGeo = new THREE.BoxGeometry(6, 28, 6);
    [-52, -62, 52, 62].forEach((x, i) => {
      const arch = new THREE.Mesh(archiveGeo, structureMaterial);
      arch.position.set(x, 4, -20 + i * 4);
      projectsBackdrop.add(arch);
    });
    this.regionalBackdrops.projects = { group: projectsBackdrop, centerProgress: 0.28, range: 0.18 };
    this.group.add(projectsBackdrop);

    // 4. Vue Crystalline Pillars in the distance
    const vueBackdrop = new THREE.Group();
    const crystalGeo = new THREE.OctahedronGeometry(4.2, 0);
    crystalGeo.scale(0.8, 4.2, 0.8);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#061c20'),
      roughness: 0.22,
      metalness: 0.88
    });
    [-48, -58, 48, 58].forEach((x, i) => {
      const c = new THREE.Mesh(crystalGeo, crystalMat);
      c.position.set(x, 9, -29 + (i % 2) * 6);
      vueBackdrop.add(c);
    });
    this.regionalBackdrops.vue = { group: vueBackdrop, centerProgress: 0.43, range: 0.18 };
    this.group.add(vueBackdrop);

    // 5. Laravel Monumental Girders & Towers
    const laravelBackdrop = new THREE.Group();
    const girderTowerGeo = new THREE.BoxGeometry(5.5, 48, 5.5);
    const girderBridgeGeo = new THREE.BoxGeometry(32, 2.2, 2.2);
    [-54, 54].forEach(x => {
      const t = new THREE.Mesh(girderTowerGeo, structureMaterial);
      t.position.set(x, 10, -39);
      laravelBackdrop.add(t);
    });
    const bridge = new THREE.Mesh(girderBridgeGeo, structureMaterial);
    bridge.position.set(0, 22, -39);
    laravelBackdrop.add(bridge);
    this.regionalBackdrops.laravel = { group: laravelBackdrop, centerProgress: 0.57, range: 0.18 };
    this.group.add(laravelBackdrop);

    // 6. Postgres Sunken Shafts
    const postgresBackdrop = new THREE.Group();
    const shaftGeo = new THREE.BoxGeometry(4.8, 38, 4.8);
    [-46, -56, 46, 56].forEach((x, i) => {
      const s = new THREE.Mesh(shaftGeo, structureMaterial);
      s.position.set(x, 2, -50 + i * 3);
      postgresBackdrop.add(s);
    });
    this.regionalBackdrops.postgres = { group: postgresBackdrop, centerProgress: 0.71, range: 0.18 };
    this.group.add(postgresBackdrop);

    // 7. WordPress Curved Silhouettes
    const wordpressBackdrop = new THREE.Group();
    const archCurveGeo = new THREE.TorusGeometry(8.5, 1.2, 8, 24, Math.PI);
    [-48, 48].forEach((x, i) => {
      const a = new THREE.Mesh(archCurveGeo, structureMaterial);
      a.position.set(x, 2, -62);
      a.rotation.y = i === 0 ? 0.3 : -0.3;
      wordpressBackdrop.add(a);
    });
    this.regionalBackdrops.wordpress = { group: wordpressBackdrop, centerProgress: 0.85, range: 0.18 };
    this.group.add(wordpressBackdrop);

    // 8. Contact Colossal Orbital Ring Portal (The Culmination Gateway)
    const contactBackdrop = new THREE.Group();
    contactBackdrop.position.set(0, 7.5, -114);

    const portalRingGeo = new THREE.TorusGeometry(32, 1.6, 16, 64);
    const portalOuter = new THREE.Mesh(portalRingGeo, portalMaterial);
    contactBackdrop.add(portalOuter);

    const portalGlowRingGeo = new THREE.RingGeometry(27, 30.5, 64);
    const portalInnerGlow = new THREE.Mesh(portalGlowRingGeo, portalRingMaterial);
    contactBackdrop.add(portalInnerGlow);

    // Flanking spires for the portal
    const spireGeo = new THREE.ConeGeometry(3.5, 54, 4);
    [-38, 38].forEach(x => {
      const s = new THREE.Mesh(spireGeo, structureMaterial);
      s.position.set(x, 10, 0);
      contactBackdrop.add(s);
    });

    this.regionalBackdrops.contact = {
      group: contactBackdrop,
      centerProgress: 1.00,
      range: 0.26,
      portalRing: portalInnerGlow
    };
    this.group.add(contactBackdrop);
  }

  interpolate(progress) {
    const clamped = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    let low = BIOME_DEFINITIONS[0];
    let high = BIOME_DEFINITIONS[BIOME_DEFINITIONS.length - 1];

    for (let i = 0; i < BIOME_DEFINITIONS.length - 1; i++) {
      if (clamped >= BIOME_DEFINITIONS[i].progress && clamped <= BIOME_DEFINITIONS[i + 1].progress) {
        low = BIOME_DEFINITIONS[i];
        high = BIOME_DEFINITIONS[i + 1];
        break;
      }
    }

    const span = Math.max(0.0001, high.progress - low.progress);
    const factor = (clamped - low.progress) / span;

    // Smooth hermite interpolation to remove linear sharp corners
    const smoothFactor = factor * factor * (3.0 - 2.0 * factor);

    // Sky colors
    this._c1.set(low.sky.zenith);
    this._c2.set(high.sky.zenith);
    this.currentSkyZenith.lerpColors(this._c1, this._c2, smoothFactor);

    this._c1.set(low.sky.horizon);
    this._c2.set(high.sky.horizon);
    this.currentSkyHorizon.lerpColors(this._c1, this._c2, smoothFactor);

    this._c1.set(low.sky.nadir);
    this._c2.set(high.sky.nadir);
    this.currentSkyNadir.lerpColors(this._c1, this._c2, smoothFactor);

    this._c1.set(low.sky.tint);
    this._c2.set(high.sky.tint);
    this.currentSkyTint.lerpColors(this._c1, this._c2, smoothFactor);

    this.currentSkyGlow = THREE.MathUtils.lerp(low.sky.glow, high.sky.glow, smoothFactor);
    this.currentSkyLuminance = THREE.MathUtils.lerp(low.sky.luminance, high.sky.luminance, smoothFactor);

    // Fog
    this._c1.set(low.fog.color);
    this._c2.set(high.fog.color);
    this.currentFogColor.lerpColors(this._c1, this._c2, smoothFactor);
    this.currentFogDensity = THREE.MathUtils.lerp(low.fog.density, high.fog.density, smoothFactor);

    // Ambient Lighting
    this._c1.set(low.ambient.color);
    this._c2.set(high.ambient.color);
    this.currentAmbientColor.lerpColors(this._c1, this._c2, smoothFactor);
    this.currentAmbientIntensity = THREE.MathUtils.lerp(low.ambient.intensity, high.ambient.intensity, smoothFactor);

    this._c1.set(low.ambient.hemiSky);
    this._c2.set(high.ambient.hemiSky);
    this.currentHemiSky.lerpColors(this._c1, this._c2, smoothFactor);

    this._c1.set(low.ambient.hemiGround);
    this._c2.set(high.ambient.hemiGround);
    this.currentHemiGround.lerpColors(this._c1, this._c2, smoothFactor);

    // Particles
    this._c1.set(low.particles.color);
    this._c2.set(high.particles.color);
    this.currentParticleColor.lerpColors(this._c1, this._c2, smoothFactor);
    this.currentParticleSpeed = THREE.MathUtils.lerp(low.particles.speed, high.particles.speed, smoothFactor);
    this.currentParticleSize = THREE.MathUtils.lerp(low.particles.size, high.particles.size, smoothFactor);

    return this;
  }

  update(deltaTime, elapsedTime, progress, isExplorer = false) {
    this.interpolate(progress);

    // Slowly rotate the distant contact portal ring
    if (this.regionalBackdrops.contact?.portalRing) {
      this.regionalBackdrops.contact.portalRing.rotation.z = elapsedTime * 0.04;
    }

    // Adjust visibility and scale of regional backdrop structures
    Object.values(this.regionalBackdrops).forEach(item => {
      if (isExplorer) {
        item.group.visible = true;
        return;
      }
      const dist = Math.abs(progress - item.centerProgress);
      if (dist < item.range) {
        item.group.visible = true;
        const opacityFactor = 1.0 - (dist / item.range);
        item.group.scale.setScalar(Math.max(0.85, opacityFactor));
      } else {
        item.group.visible = false;
      }
    });
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
