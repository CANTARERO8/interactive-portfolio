import * as THREE from 'three';
import { AmbientSky } from './AmbientSky.js';
import { DistantHorizon } from './DistantHorizon.js';
import { AtmosphericParticles } from './AtmosphericParticles.js';
import { BiomeAtmospheres } from './BiomeAtmospheres.js';

export class WorldBackground {
  constructor(app) {
    this.app = app;
    this.scene = app.engine.scene;
    this.camera = app.engine.camera;
    this.qualityMode = app.engine.qualityMode || 'ultra';

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'WorldBackgroundMaster';
    this.scene.add(this.rootGroup);

    this.sky = new AmbientSky(this.scene, this.camera);
    this.horizon = new DistantHorizon(this.scene, this.camera);
    this.particles = new AtmosphericParticles(this.scene);
    this.biomesAtmosphere = new BiomeAtmospheres(this.scene, this.camera);

    this.setQualityMode(this.qualityMode);
  }

  setQualityMode(mode) {
    this.qualityMode = mode;
    this.sky.setQualityMode(mode);
    this.horizon.setQualityMode(mode);
    this.particles.setQualityMode(mode);
  }

  update(deltaTime, elapsedTime, scrollProgress, camera, isExplorer = false) {
    // 1. Interpolate regional biome atmospheres
    this.biomesAtmosphere.update(deltaTime, elapsedTime, scrollProgress, isExplorer);

    // 2. Drive sky uniforms with interpolated regional atmosphere
    this.sky.targetZenith.copy(this.biomesAtmosphere.currentSkyZenith);
    this.sky.targetHorizon.copy(this.biomesAtmosphere.currentSkyHorizon);
    this.sky.targetTint.copy(this.biomesAtmosphere.currentSkyTint);
    if (this.sky.uniforms.uHorizonGlow) {
      this.sky.uniforms.uHorizonGlow.value = this.biomesAtmosphere.currentSkyGlow;
    }
    if (this.sky.uniforms.uLuminance) {
      this.sky.uniforms.uLuminance.value = this.biomesAtmosphere.currentSkyLuminance;
    }

    // 3. Drive distant horizon
    this.horizon.setHorizonColor(this.biomesAtmosphere.currentSkyHorizon);

    // 4. Drive particles color and speed
    if (this.particles.uniforms.uColor) {
      this.particles.uniforms.uColor.value.copy(this.biomesAtmosphere.currentParticleColor);
    }

    // 5. Update sub-systems
    this.sky.update(deltaTime, elapsedTime, scrollProgress);
    this.horizon.update(deltaTime, elapsedTime);
    this.particles.update(deltaTime, elapsedTime);

    // 6. Smoothly blend global scene fog with regional atmosphere
    if (this.scene.fog) {
      const fogSpeed = Math.min(1.0, deltaTime * 2.2);
      this.scene.fog.color.lerp(this.biomesAtmosphere.currentFogColor, fogSpeed);
      
      const qualityFactor = this.qualityMode === 'performance' ? 0.88 : (this.qualityMode === 'ultra-plus' ? 1.08 : 1.0);
      const targetDensity = this.biomesAtmosphere.currentFogDensity * qualityFactor;
      this.scene.fog.density += (targetDensity - this.scene.fog.density) * fogSpeed;
    }

    // 7. Modulate architectural ambient lighting in sync with regional identity
    if (this.app.biomes) {
      const lightSpeed = Math.min(1.0, deltaTime * 1.8);
      if (this.app.biomes.ambientLight) {
        this.app.biomes.ambientLight.color.lerp(this.biomesAtmosphere.currentAmbientColor, lightSpeed);
        this.app.biomes.ambientLight.intensity = this.biomesAtmosphere.currentAmbientIntensity;
      }
      if (this.app.biomes.hemisphereLight) {
        this.app.biomes.hemisphereLight.color.lerp(this.biomesAtmosphere.currentHemiSky, lightSpeed);
        this.app.biomes.hemisphereLight.groundColor.lerp(this.biomesAtmosphere.currentHemiGround, lightSpeed);
      }
    }
  }

  dispose() {
    this.sky.dispose();
    this.horizon.dispose();
    this.particles.dispose();
    this.biomesAtmosphere.dispose();
    this.scene.remove(this.rootGroup);
  }
}
