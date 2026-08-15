import * as THREE from 'three';

const EXPLORER_COPY = {
  es: {
    enter: '[ 🎮 MODO EXPLORADOR ]',
    exit: '[ ✕ SALIR DEL EXPLORADOR ]',
    status: 'DRON FREE-ROAM • EN LÍNEA',
    help: 'WASD/FLECHAS MOVER · ESPACIO/SHIFT ALTURA · Q/E BALANCEO · RATÓN MIRAR · ESC SALIR'
  },
  en: {
    enter: '[ 🎮 EXPLORER MODE ]',
    exit: '[ ✕ EXIT EXPLORER ]',
    status: 'FREE-ROAM DRONE • ONLINE',
    help: 'WASD/ARROWS MOVE · SPACE/SHIFT ALTITUDE · Q/E ROLL · MOUSE LOOK · ESC EXIT'
  }
};

const flashlightBeamVertexShader =  `
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;

  void main() {
    vLocalPosition = position;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const flashlightBeamFragmentShader =  `
  precision highp float;

  uniform float uTime;
  uniform float uLength;
  uniform float uRadius;
  varying vec3 vLocalPosition;
  varying vec3 vWorldPosition;

  float hashNoise(vec3 p) {
    return fract(sin(dot(floor(p), vec3(17.31, 41.73, 93.17))) * 43758.5453);
  }

  void main() {
    float depth = clamp(-vLocalPosition.z / uLength, 0.0, 1.0);
    float localRadius = max(0.04, uRadius * depth);
    float radial = length(vLocalPosition.xy) / localRadius;
    float volume = exp(-radial * radial * 0.65);
    float envelope = smoothstep(0.0, 0.08, depth) * smoothstep(1.0, 0.68, depth);
    float dust = mix(0.68, 1.0, hashNoise(vWorldPosition * 2.4 + uTime * 0.35));
    float alpha = volume * envelope * dust * 0.085;
    gl_FragColor = vec4(vec3(0.42, 0.92, 1.0) * (0.8 + volume), alpha);
  }
`;

export class ExplorerMode {
  constructor(app) {
    this.app = app;
    this.camera = app.engine.camera;
    this.canvas = app.canvas;
    this.active = false;
    this.returning = false;
    this.ready = false;
    this.hadPointerLock = false;
    this.draggingLook = false;
    this.ignoreNextPointerLockMove = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.velocity = new THREE.Vector3();
    this.inputLocal = new THREE.Vector3();
    this.inputWorld = new THREE.Vector3();
    this.nextPosition = new THREE.Vector3();
    this.forward = new THREE.Vector3();
    this.biomeProbe = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.up = new THREE.Vector3(0, 1, 0);
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.manualRoll = 0;
    this.keys = new Set();
    this.virtualInput = new Set();
    this.pointer = { x: 0, y: 0 };
    this.returnElapsed = 0;
    this.returnDuration = this.reducedMotion ? 0.35 : 0.9;
    this.returnStartPosition = new THREE.Vector3();
    this.returnTargetPosition = new THREE.Vector3();
    this.returnStartQuaternion = new THREE.Quaternion();
    this.returnTargetQuaternion = new THREE.Quaternion();
    this.returnLookTarget = new THREE.Vector3();
    this.returnHelper = new THREE.Object3D();
    this._hudFrame = 0;

    this.toggleButton = document.getElementById('explorer-mode-toggle');
    this.toggleLabel = document.getElementById('explorer-mode-label');
    this.hud = document.getElementById('explorer-hud');
    this.lookZone = document.getElementById('explorer-look-zone');
    this.biomeValue = document.getElementById('explorer-biome-value');
    this.speedValue = document.getElementById('explorer-speed-value');
    this.coordinatesValue = document.getElementById('explorer-coordinates-value');
    this.statusValue = document.getElementById('explorer-status-copy');
    this.helpValue = document.getElementById('explorer-help-copy');

    this.createFlashlight();
    this.bindEvents();
    this.refreshCopy();
  }

  createFlashlight() {
    this.flashlight = new THREE.SpotLight('#baf7ff', 72, 38, Math.PI * 0.16, 0.72, 1.35);
    this.flashlight.visible = false;
    this.flashlightTarget = new THREE.Object3D();
    this.app.engine.scene.add(this.flashlight, this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;

    this.flashlightHalo = new THREE.PointLight('#56dfff', 8, 7, 2);
    this.flashlightHalo.visible = false;
    this.app.engine.scene.add(this.flashlightHalo);

    const beamLength = 22;
    const beamRadius = 4.2;
    const beamGeometry = new THREE.ConeGeometry(beamRadius, beamLength, 24, 1, true);
    beamGeometry.translate(0, -beamLength * 0.5, 0);
    beamGeometry.rotateX(Math.PI * 0.5);
    this.flashlightBeamUniforms = {
      uTime: { value: 0 },
      uLength: { value: beamLength },
      uRadius: { value: beamRadius }
    };
    this.flashlightBeam = new THREE.Mesh(
      beamGeometry,
      new THREE.ShaderMaterial({
        uniforms: this.flashlightBeamUniforms,
        vertexShader: flashlightBeamVertexShader,
        fragmentShader: flashlightBeamFragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false
      })
    );
    this.flashlightBeam.visible = false;
    this.flashlightBeam.renderOrder = -5;
    this.app.engine.scene.add(this.flashlightBeam);
  }

  bindEvents() {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        this.toggle();
      });
    }

    window.addEventListener('keydown', event => this.onKeyDown(event));
    window.addEventListener('keyup', event => this.onKeyUp(event));
    window.addEventListener('blur', () => this.clearInput());
    document.addEventListener('mousemove', event => this.onMouseMove(event));
    document.addEventListener('pointerlockchange', () => this.onPointerLockChange());

    if (this.lookZone) {
      this.lookZone.addEventListener('pointerdown', event => this.startPointerLook(event));
      this.lookZone.addEventListener('pointermove', event => this.movePointerLook(event));
      this.lookZone.addEventListener('pointerup', event => this.stopPointerLook(event));
      this.lookZone.addEventListener('pointercancel', event => this.stopPointerLook(event));
    }

    document.querySelectorAll('[data-explorer-control]').forEach(button => {
      const control = button.getAttribute('data-explorer-control');
      const activate = event => {
        event.preventDefault();
        event.stopPropagation();
        button.setPointerCapture?.(event.pointerId);
        this.virtualInput.add(control);
      };
      const deactivate = event => {
        event.preventDefault();
        this.virtualInput.delete(control);
      };
      button.addEventListener('pointerdown', activate);
      button.addEventListener('pointerup', deactivate);
      button.addEventListener('pointercancel', deactivate);
      button.addEventListener('lostpointercapture', deactivate);
    });
  }

  setReady(ready) {
    this.ready = ready;
    if (this.toggleButton) this.toggleButton.hidden = !ready;
  }

  getLanguage() {
    return this.app.portfolio?.currentLang || localStorage.getItem('portfolio-lang') || 'es';
  }

  refreshCopy() {
    const copy = EXPLORER_COPY[this.getLanguage()] || EXPLORER_COPY.es;
    if (this.toggleLabel) this.toggleLabel.textContent = this.active ? copy.exit : copy.enter;
    if (this.statusValue) this.statusValue.textContent = copy.status;
    if (this.helpValue) this.helpValue.textContent = copy.help;
  }

  toggle() {
    if (!this.ready) return;
    if (this.active) this.deactivate();
    else this.activate();
  }

  activate() {
    if (this.active) return;

    this.app.portfolio?.closeCommandPalette?.();
    if (this.app.portfolio?.drawer?.classList.contains('active')) {
      this.app.portfolio.closeDrawer();
    }

    this.active = true;
    this.returning = false;
    this.returnElapsed = 0;
    this.velocity.set(0, 0, 0);
    this.euler.setFromQuaternion(this.camera.quaternion, 'YXZ');
    this.pitch = this.euler.x;
    this.yaw = this.euler.y;
    this.roll = this.euler.z;
    this.manualRoll = 0;

    document.body.classList.add('explorer-active');
    document.documentElement.classList.add('explorer-active');
    this.previousHtmlOverflow = document.documentElement.style.overflow;
    this.previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    this.app.scrollManager?.lenis?.stop();
    this.app.biomes?.setExplorerMode(true);
    this.app.engine.setFov(68);
    this.flashlight.visible = true;
    this.flashlightHalo.visible = true;
    this.flashlightBeam.visible = true;

    if (this.hud) {
      this.hud.classList.add('active');
      this.hud.setAttribute('aria-hidden', 'false');
    }
    if (this.toggleButton) this.toggleButton.setAttribute('aria-pressed', 'true');
    this.refreshCopy();

  }

  deactivate() {
    if (!this.active) return;

    this.active = false;
    this.returning = true;
    this.returnElapsed = 0;
    this.clearInput();

    this.returnStartPosition.copy(this.camera.position);
    this.returnStartQuaternion.copy(this.camera.quaternion);
    this.prepareReturnTarget();

    if (document.pointerLockElement === this.canvas) document.exitPointerLock?.();
    this.hadPointerLock = false;
    document.body.classList.remove('explorer-active');
    document.documentElement.classList.remove('explorer-active');
    document.documentElement.style.overflow = this.previousHtmlOverflow || '';
    document.body.style.overflow = this.previousBodyOverflow || '';

    this.app.scrollManager?.lenis?.start();
    this.app.biomes?.setExplorerMode(false);
    this.app.engine.setFov(55);
    this.flashlight.visible = false;
    this.flashlightHalo.visible = false;
    this.flashlightBeam.visible = false;

    if (this.hud) {
      this.hud.classList.remove('active');
      this.hud.setAttribute('aria-hidden', 'true');
    }
    if (this.toggleButton) this.toggleButton.setAttribute('aria-pressed', 'false');
    this.refreshCopy();
  }

  prepareReturnTarget() {
    const waypoint = this.app.getCameraWaypoint(this.app.scrollProgress);
    const isMobile = window.innerWidth < 768;
    const xMultiplier = isMobile ? 0.35 : 1;
    const zOffset = isMobile ? 1.2 : 0;

    this.returnTargetPosition.set(
      waypoint.pos[0] * xMultiplier,
      waypoint.pos[1],
      waypoint.pos[2] + zOffset
    );
    this.returnLookTarget.set(waypoint.look[0] * xMultiplier, waypoint.look[1], waypoint.look[2]);
    this.returnHelper.position.copy(this.returnTargetPosition);
    this.returnHelper.lookAt(this.returnLookTarget);
    this.returnTargetQuaternion.copy(this.returnHelper.quaternion);
  }

  onKeyDown(event) {
    if (!this.active) return;
    if (event.code === 'Escape') {
      event.preventDefault();
      this.deactivate();
      return;
    }

    const movementKeys = [
      'KeyW', 'KeyA', 'KeyS', 'KeyD',
      'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
      'Space', 'ShiftLeft', 'ShiftRight', 'KeyQ', 'KeyE'
    ];
    if (movementKeys.includes(event.code)) {
      event.preventDefault();
      this.keys.add(event.code);
    }
  }

  onKeyUp(event) {
    this.keys.delete(event.code);
  }

  onMouseMove(event) {
    if (!this.active || document.pointerLockElement !== this.canvas) return;
    this.hadPointerLock = true;
    if (this.ignoreNextPointerLockMove) {
      this.ignoreNextPointerLockMove = false;
      return;
    }
    this.applyLookDelta(event.movementX, event.movementY);
  }

  onPointerLockChange() {
    if (!this.active) return;
    if (document.pointerLockElement === this.canvas) {
      this.hadPointerLock = true;
      this.draggingLook = false;
      this.ignoreNextPointerLockMove = true;
    } else if (this.hadPointerLock) {
      
      this.hadPointerLock = false;
      this.draggingLook = false;
    }
  }

  startPointerLook(event) {
    if (!this.active || document.pointerLockElement === this.canvas) return;
    this.draggingLook = true;
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
    this.lookZone.setPointerCapture?.(event.pointerId);

    if (event.pointerType === 'mouse' && this.canvas.requestPointerLock) {
      this.ignoreNextPointerLockMove = true;
      try {
        const pointerLockRequest = this.canvas.requestPointerLock();
        pointerLockRequest?.catch?.(() => {});
      } catch {
        
      }
    }
  }

  movePointerLook(event) {
    if (!this.active || !this.draggingLook || document.pointerLockElement === this.canvas) return;
    const deltaX = event.clientX - this.pointer.x;
    const deltaY = event.clientY - this.pointer.y;
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
    this.applyLookDelta(deltaX, deltaY);
  }

  stopPointerLook(event) {
    this.draggingLook = false;
    this.lookZone?.releasePointerCapture?.(event.pointerId);
  }

  applyLookDelta(deltaX, deltaY) {
    if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return;

    const maximumDelta = window.innerWidth <= 768 ? 34 : 48;
    const safeDeltaX = THREE.MathUtils.clamp(deltaX, -maximumDelta, maximumDelta);
    const safeDeltaY = THREE.MathUtils.clamp(deltaY, -maximumDelta, maximumDelta);
    const sensitivity = window.innerWidth <= 768 ? 0.0032 : 0.00175;
    this.yaw -= safeDeltaX * sensitivity;
    this.pitch -= safeDeltaY * sensitivity;
    this.pitch = THREE.MathUtils.clamp(this.pitch, -Math.PI * 0.47, Math.PI * 0.47);
  }

  clearInput() {
    this.keys.clear();
    this.virtualInput.clear();
    this.draggingLook = false;
  }

  isPressed(...codes) {
    return codes.some(code => this.keys.has(code) || this.virtualInput.has(code));
  }

  update(deltaTime, elapsedTime) {
    if (this.active) this.updateFlight(deltaTime, elapsedTime);
    else if (this.returning) this.updateReturn(deltaTime);
  }

  updateFlight(deltaTime, elapsedTime) {
    const dt = Math.min(deltaTime, 1 / 30);
    const forwardInput = Number(this.isPressed('KeyW', 'ArrowUp', 'forward')) - Number(this.isPressed('KeyS', 'ArrowDown', 'backward'));
    const strafeInput = Number(this.isPressed('KeyD', 'ArrowRight', 'right')) - Number(this.isPressed('KeyA', 'ArrowLeft', 'left'));
    const verticalInput = Number(this.isPressed('Space', 'up')) - Number(this.isPressed('ShiftLeft', 'ShiftRight', 'down'));
    const rollInput = Number(this.isPressed('KeyE', 'roll-right')) - Number(this.isPressed('KeyQ', 'roll-left'));

    this.inputLocal.set(strafeInput, verticalInput, -forwardInput);
    if (this.inputLocal.lengthSq() > 1) this.inputLocal.normalize();

    this.euler.set(this.pitch, this.yaw, this.roll, 'YXZ');
    this.camera.quaternion.setFromEuler(this.euler);
    this.inputWorld.copy(this.inputLocal).applyQuaternion(this.camera.quaternion);

    const acceleration = this.reducedMotion ? 9.5 : 13.5;
    const maximumSpeed = window.innerWidth <= 768 ? 6.2 : 8.5;
    this.velocity.addScaledVector(this.inputWorld, acceleration * dt);
    this.velocity.multiplyScalar(Math.exp(-2.45 * dt));
    if (this.velocity.lengthSq() > maximumSpeed * maximumSpeed) this.velocity.setLength(maximumSpeed);

    this.nextPosition.copy(this.camera.position).addScaledVector(this.velocity, dt);
    this.app.biomes?.resolveCameraCollision(this.nextPosition, this.velocity, 0.64);
    this.camera.position.copy(this.nextPosition);

    this.right.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const lateralVelocity = this.velocity.dot(this.right);
    this.manualRoll += (rollInput * 0.42 - this.manualRoll) * Math.min(1, dt * 4.2);
    const bankTarget = this.manualRoll - THREE.MathUtils.clamp(lateralVelocity * 0.018, -0.12, 0.12);
    this.roll += (bankTarget - this.roll) * Math.min(1, dt * (this.reducedMotion ? 8 : 4.8));

    if (!this.reducedMotion) {
      this.pitch += Math.sin(elapsedTime * 1.35) * this.velocity.length() * 0.000025;
    }
    this.euler.set(this.pitch, this.yaw, this.roll, 'YXZ');
    this.camera.quaternion.setFromEuler(this.euler);

    this.updateFlashlight(elapsedTime);
    this.updateHud();
  }

  updateReturn(deltaTime) {
    this.returnElapsed += Math.min(deltaTime, 1 / 30);
    const rawProgress = Math.min(1, this.returnElapsed / this.returnDuration);
    const eased = rawProgress * rawProgress * (3 - 2 * rawProgress);
    this.camera.position.lerpVectors(this.returnStartPosition, this.returnTargetPosition, eased);
    this.camera.quaternion.slerpQuaternions(this.returnStartQuaternion, this.returnTargetQuaternion, eased);

    if (rawProgress >= 1) {
      this.returning = false;
      this.app.currentLook = {
        x: this.returnLookTarget.x,
        y: this.returnLookTarget.y,
        z: this.returnLookTarget.z
      };
    }
  }

  updateFlashlight(elapsedTime) {
    this.forward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this.flashlight.position.copy(this.camera.position).addScaledVector(this.up, -0.08);
    this.flashlightTarget.position.copy(this.camera.position).addScaledVector(this.forward, 18);
    this.flashlightHalo.position.copy(this.camera.position).addScaledVector(this.forward, 0.8);
    this.flashlightBeam.position.copy(this.camera.position).addScaledVector(this.forward, 0.24);
    this.flashlightBeam.quaternion.copy(this.camera.quaternion);
    this.flashlightBeamUniforms.uTime.value = elapsedTime;
    this.flashlight.intensity = 68 + Math.sin(elapsedTime * 8.0) * 2 + this.velocity.length() * 1.2;
  }

  updateHud() {
    this._hudFrame++;
    if (this._hudFrame % 5 !== 0) return;

    this.camera.getWorldDirection(this.forward);
    this.biomeProbe.copy(this.camera.position).addScaledVector(this.forward, 6.5);
    const biome = this.app.biomes?.getBiomeAtPosition(this.biomeProbe);
    if (this.biomeValue) this.biomeValue.textContent = (biome?.key || 'void').toUpperCase();
    if (this.speedValue) this.speedValue.textContent = `${this.velocity.length().toFixed(1)} M/S`;
    if (this.coordinatesValue) {
      const { x, y, z } = this.camera.position;
      this.coordinatesValue.textContent = `${x.toFixed(1)} / ${y.toFixed(1)} / ${z.toFixed(1)}`;
    }
  }
}
