import * as THREE from 'three';
import gsap from 'gsap';

export class Particles {
  constructor(scene, count = 4500) {
    this.scene = scene;
    this.count = count;
    this.speedMultiplier = 1.0;
    
    // Gravity Vortex States
    this.isGravityActive = false;
    this.gravityTarget = new THREE.Vector3();
    this.isWarpActive = false;
    
    const texture = this.createGlowTexture();
    
    // 1. Standard background cyber dust
    const positions = new Float32Array(this.count * 3);
    const speeds = new Float32Array(this.count);
    this.velocities = new Float32Array(this.count * 3);
    
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 110;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 110 - 25;
      speeds[i] = 0.08 + Math.random() * 0.22;
    }
    
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.speeds = speeds;
    
    this.material = new THREE.PointsMaterial({
      size: 0.24,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color('#00f2fe')
    });
    
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    // 2. Cinematic Bokeh Floaters Layer
    this.bokehCount = 120;
    const bokehPositions = new Float32Array(this.bokehCount * 3);
    this._bokehSpeeds = new Float32Array(this.bokehCount);
    this._bokehDrifts = new Float32Array(this.bokehCount);

    for (let i = 0; i < this.bokehCount; i++) {
      bokehPositions[i * 3 + 0] = (Math.random() - 0.5) * 70;
      bokehPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      bokehPositions[i * 3 + 2] = (Math.random() - 0.5) * 110 - 25;
      this._bokehSpeeds[i] = 0.02 + Math.random() * 0.05;
      this._bokehDrifts[i] = (Math.random() - 0.5) * 0.02;
    }

    this.bokehGeometry = new THREE.BufferGeometry();
    this.bokehGeometry.setAttribute('position', new THREE.BufferAttribute(bokehPositions, 3));
    
    const bokehTexture = this.createBokehTexture();
    this.bokehMaterial = new THREE.PointsMaterial({
      size: 2.2,
      map: bokehTexture,
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: new THREE.Color('#00bfff')
    });

    this.bokehPoints = new THREE.Points(this.bokehGeometry, this.bokehMaterial);
    this.scene.add(this.bokehPoints);
  }

  createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0,   'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(0, 242, 254, 0.9)');
    gradient.addColorStop(0.6, 'rgba(0, 242, 254, 0.2)');
    gradient.addColorStop(1,   'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    return new THREE.CanvasTexture(canvas);
  }

  createBokehTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0,   'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.3, 'rgba(0, 191, 255, 0.4)');
    gradient.addColorStop(0.7, 'rgba(0, 191, 255, 0.06)');
    gradient.addColorStop(1,   'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
  }

  // Trigger outward radial explosion shockwave
  triggerBlast() {
    const positions = this.geometry.attributes.position.array;
    const vels = this.velocities;
    const gx = this.gravityTarget.x;
    const gy = this.gravityTarget.y;
    const gz = this.gravityTarget.z;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const dx = positions[idx]     - gx;
      const dy = positions[idx + 1] - gy;
      const dz = positions[idx + 2] - gz;
      const invDist = 1.0 / (Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.1);
      const blastPower = 1.2 + Math.random() * 2.8;
      const scale = blastPower * invDist;
      vels[idx]     = dx * scale;
      vels[idx + 1] = dy * scale;
      vels[idx + 2] = dz * scale;
    }
  }

  // Trigger high-power shockwave from 3D object center
  triggerShockwave(centerPos) {
    const positions = this.geometry.attributes.position.array;
    const vels = this.velocities;
    const cx = centerPos.x;
    const cy = centerPos.y;
    const cz = centerPos.z;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      const dx = positions[idx] - cx;
      const dy = positions[idx + 1] - cy;
      const dz = positions[idx + 2] - cz;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < 25.0) {
        const invDist = 1.0 / (dist + 0.1);
        const power = (25.0 - dist) * 0.35;
        vels[idx]     += dx * invDist * power;
        vels[idx + 1] += dy * invDist * power;
        vels[idx + 2] += dz * invDist * power;
      }
    }
  }

  // Trigger Hyperspace Warp Speed acceleration
  triggerWarpSpeed(duration = 1.4) {
    this.isWarpActive = true;
    
    gsap.to(this, {
      speedMultiplier: 28.0,
      duration: duration * 0.45,
      ease: 'power3.in',
      onComplete: () => {
        gsap.to(this, {
          speedMultiplier: 1.0,
          duration: duration * 0.55,
          ease: 'power2.out',
          onComplete: () => {
            this.isWarpActive = false;
          }
        });
      }
    });

    // Particle size flare
    gsap.to(this.material, {
      size: 0.55,
      duration: duration * 0.4,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  }

  update(deltaTime, elapsedTime) {
    const positions = this.geometry.attributes.position.array;
    const vels = this.velocities;
    const speeds = this.speeds;
    const count = this.count;

    // Lerp speed multiplier back towards baseline unless actively in warp
    if (!this.isWarpActive) {
      this.speedMultiplier += (1.0 - this.speedMultiplier) * 0.05;
    }

    const gx = this.gravityTarget.x;
    const gy = this.gravityTarget.y;
    const gz = this.gravityTarget.z;
    const attrScale  = deltaTime * 16.0 * 2.2;
    const orbitScale = deltaTime * 14.0 * 0.7;
    const driftScale = this.speedMultiplier * deltaTime * 2.2;

    if (this.isGravityActive) {
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const dx = gx - positions[idx];
        const dy = gy - positions[idx + 1];
        const dz = gz - positions[idx + 2];

        const invDist = 1.0 / (Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.1);
        const attract = invDist * invDist * attrScale;
        
        vels[idx]     = (vels[idx]     + dx * invDist * attract + (-dz * invDist) * orbitScale) * 0.94;
        vels[idx + 1] = (vels[idx + 1] + dy * invDist * attract) * 0.94;
        vels[idx + 2] = (vels[idx + 2] + dz * invDist * attract +  (dx * invDist) * orbitScale) * 0.94;

        positions[idx]     += vels[idx];
        positions[idx + 1] += vels[idx + 1];
        positions[idx + 2] += vels[idx + 2];

        if (positions[idx + 1] > 20) {
          positions[idx + 1] = -20;
          positions[idx]     = (Math.random() - 0.5) * 110;
          positions[idx + 2] = (Math.random() - 0.5) * 110 - 25;
          vels[idx] = vels[idx + 1] = vels[idx + 2] = 0;
        }
      }
    } else {
      for (let i = 0; i < count; i++) {
        const idx = i * 3;

        let vx = vels[idx]     * 0.88;
        let vy = vels[idx + 1] * 0.88;
        let vz = vels[idx + 2] * 0.88;

        if (vx*vx + vy*vy + vz*vz < 0.00001) {
          vels[idx] = vels[idx + 1] = vels[idx + 2] = 0;
          vx = vy = vz = 0;
        } else {
          vels[idx]     = vx;
          vels[idx + 1] = vy;
          vels[idx + 2] = vz;
        }

        // Warp speed streak behavior: if in warp, fly along Z axis towards camera!
        if (this.isWarpActive) {
          positions[idx + 2] += this.speedMultiplier * deltaTime * 12.0;
          if (positions[idx + 2] > 15) {
            positions[idx + 2] = -95;
            positions[idx]     = (Math.random() - 0.5) * 110;
            positions[idx + 1] = (Math.random() - 0.5) * 40;
          }
        } else {
          positions[idx + 1] += speeds[i] * driftScale + vy;
          positions[idx]     += Math.sin(elapsedTime * 0.8 + i) * 0.003 + vx;
          positions[idx + 2] += Math.cos(elapsedTime * 0.8 + i) * 0.003 + vz;
        }

        if (positions[idx + 1] > 20) {
          positions[idx + 1] = -20;
          positions[idx]     = (Math.random() - 0.5) * 110;
          positions[idx + 2] = (Math.random() - 0.5) * 110 - 25;
          vels[idx] = vels[idx + 1] = vels[idx + 2] = 0;
        }
      }
    }
    
    const bokehPos = this.bokehGeometry.attributes.position.array;
    const bCount = this.bokehCount;
    const bSpeeds = this._bokehSpeeds;
    const bDrifts = this._bokehDrifts;
    
    for (let i = 0; i < bCount; i++) {
      const idx = i * 3;
      bokehPos[idx + 1] += bSpeeds[i] * driftScale * 0.45;
      bokehPos[idx]     += Math.sin(elapsedTime * 0.4 + i) * bDrifts[i] * deltaTime * 5;
      bokehPos[idx + 2] += Math.cos(elapsedTime * 0.4 + i) * bDrifts[i] * deltaTime * 5;
      
      if (bokehPos[idx + 1] > 18) {
        bokehPos[idx + 1] = -18;
        bokehPos[idx]     = (Math.random() - 0.5) * 70;
        bokehPos[idx + 2] = (Math.random() - 0.5) * 110 - 25;
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true;
    this.bokehGeometry.attributes.position.needsUpdate = true;
  }
}
