import { Engine } from '../three/Engine';
import { Particles } from '../three/effects/Particles';
import { GridFloor } from '../three/effects/GridFloor';
import { VolumetricNebula } from '../three/effects/VolumetricNebula';
import { VolumetricLightBeams } from '../three/effects/VolumetricLightBeams';
import { EnvironmentBiomes } from '../three/scenes/EnvironmentBiomes';
import { SystemsCity } from '../three/scenes/SystemsCity';
import { MorphingCoreEntity } from '../three/scenes/MorphingCoreEntity';
import { ScrollManager } from './ScrollManager';
import { Cursor } from './Cursor';
import { TextAnimations } from '../animations/TextAnimations';
import { PortfolioOrchestrator } from './PortfolioOrchestrator';
import { HoverTilt } from './HoverTilt';
import { ScrollCounters } from './ScrollCounters';
import { ClickSparks } from './ClickSparks';
import { TextInteractions } from './TextInteractions';
import { ExplorerMode } from './ExplorerMode';
import { GraphicsMode } from './GraphicsMode';
import gsap from 'gsap';
import * as THREE from 'three';

export class App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) return;

    // 1. Initialize WebGL Engine
    this.engine = new Engine(this.canvas);

    // 2. Initialize Environmental WebGL Elements & Interactive Morphing Core Entity
    this.nebula = new VolumetricNebula(this.engine.scene, this.engine.camera, this.engine.renderer);
    this.particles = new Particles(this.engine.scene);
    this.gridFloor = new GridFloor(this.engine.scene);
    this.biomes = new EnvironmentBiomes(this);
    this.systemsCity = new SystemsCity(this);
    this.lightBeams = new VolumetricLightBeams(this.engine.scene, this.engine.camera);
    this.morphingEntity = new MorphingCoreEntity(this);
    this.explorerMode = new ExplorerMode(this);
    this.graphicsMode = new GraphicsMode(this);

    // 3. Register environmental updates in Engine loop
    this.scrollProgress = 0;
    this.prevScroll = 0;
    this.isOverclocked = false;
    this._tickCount = 0; // frame counter for throttling
    
    // Cache reusable scratch Vector3 objects — avoids GC pressure every frame
    this._gravVec = new THREE.Vector3();
    this._gravDir = new THREE.Vector3();
    this._gravPos = new THREE.Vector3();

    // Camera waypoints tailored to each architectural biome
    this._cameraWaypoints = [
      { pos: [0, 0.8, 8.5],       look: [0, 0.8, 0] },        // 0: Hero (Sanctum)
      { pos: [-3.0, 1.2, -1.0],   look: [0, 0.2, -8.0] },     // 1: About (Data Vault)
      { pos: [0, 0.0, -9.5],      look: [0, 0.0, -16.0] },    // 2: Projects
      { pos: [3.2, 1.2, -18.0],   look: [0, 0.5, -25.0] },    // 3: Vue (Crystal Chamber)
      { pos: [-3.4, -1.4, -28.0], look: [0, 0.8, -35.0] },   // 4: Laravel (Citadel)
      { pos: [0.4, -0.5, -39.0],  look: [0, -0.25, -47.5] },  // 5: Postgres (DB Cabin Corridor)
      { pos: [-2.0, -0.6, -51.0], look: [0, 0.2, -58.0] },   // 6: WordPress
      { pos: [0, 5.5, -59.0],     look: [0, 3.2, -72.0] }     // 7: Contact (Singularity)
    ];
    
    this.engine.addTick((deltaTime, elapsedTime) => {
      this._tickCount++;

      // Guided scroll camera and free-roam camera are mutually exclusive controllers.
      if (this.explorerMode.active || this.explorerMode.returning) {
        this.explorerMode.update(deltaTime, elapsedTime);
      } else {
        this.updateCamera(elapsedTime);
      }

      let sceneProgress = this.scrollProgress;
      if (this.explorerMode.active) {
        // Scene state follows the drone itself, not whichever neighbouring
        // section it is looking at. This prevents Laravel artifacts from
        // remaining active once the player has entered the server corridor.
        sceneProgress = this.biomes.getProgressForPosition(this.engine.camera.position);
      }

      this.nebula.update(elapsedTime, this.isOverclocked);
      this.particles.update(deltaTime, elapsedTime);
      this.gridFloor.update(deltaTime, elapsedTime);
      this.biomes.update(deltaTime, elapsedTime, sceneProgress);
      this.systemsCity.update(deltaTime, elapsedTime, sceneProgress, this.explorerMode.active);
      this.lightBeams.update(elapsedTime, sceneProgress, this.explorerMode.active, this.isOverclocked);
      this.morphingEntity.update(deltaTime, elapsedTime, sceneProgress);
      
      // Calculate scroll speed/velocity to boost particles
      const scrollDiff = Math.abs(this.scrollProgress - this.prevScroll);
      this.scrollVelocity = scrollDiff;
      
      // Speed multiplier boosted by scroll and multiplied by 4x if overclocked
      const baseBoost = 1.0 + (scrollDiff * 180.0);
      this.particles.speedMultiplier = this.isOverclocked ? baseBoost * 4.0 : baseBoost;
      this.prevScroll = this.scrollProgress;

      // Project mouse coordinates to 3D for gravity target (only when gravity active or mouse moved)
      this.updateParticleGravityTarget();

      // Compute rolling FPS telemetry average
      const currentFps = 1.0 / (deltaTime || 0.016);
      this.fps = this.fps ? this.fps + (currentFps - this.fps) * 0.05 : currentFps;

      // Throttle HUD DOM writes — every 8 frames (~7.5 updates/sec) is plenty
      if (this._tickCount % 8 === 0) {
        // Scroll velocity in pixels per second
        const pixelsScrolled = scrollDiff * (this._scrollHeight || 5000);
        const velocityPxSec = deltaTime > 0 ? (pixelsScrolled / deltaTime) : 0;
        this.scrollVelocityPx = (this.scrollVelocityPx || 0) + (velocityPxSec - (this.scrollVelocityPx || 0)) * 0.1;

        // RAM fluctuations — realistic browser heap usage ~35-42 MB
        if (!this.currentMemory) this.currentMemory = 35;
        if (Math.random() < 0.3) { // 30% chance every 8 frames ≈ ~2 updates/sec
          if (window.performance && window.performance.memory) {
            this.currentMemory = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
          } else {
            this.currentMemory = 35 + Math.round(Math.sin(elapsedTime * 0.2) * 3 + Math.cos(elapsedTime * 0.7) * 2);
          }
        }

        this.updateTelemetryHUD();

        // Cache scrollHeight infrequently (it's a forced layout reflow)
        if (this._tickCount % 120 === 0) {
          this._scrollHeight = document.documentElement.scrollHeight;
        }
      }
      
      // Real-time scroll-driven DOM transitions
      if (!this.explorerMode.active) this.updateDOMScrollEffects(elapsedTime);
    });

    // 4. Initialize Core systems
    this.cursor = new Cursor();
    this.animator = new TextAnimations();
    this.hoverTilt = new HoverTilt();
    this.scrollCounters = new ScrollCounters();
    this.clickSparks = new ClickSparks();
    this.textInteractions = new TextInteractions();

    // 5. Setup Mouse Parallax vectors
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // 6. Setup Particle Gravity interaction triggers (Idea B)
    this.initGravityInteraction();

    // 7. Start loader sequence
    this.startLoader();
  }

  // Linear interpolation utility
  lerp(a, b, f) {
    return a + (b - a) * f;
  }

  getCameraWaypoint(progress) {
    const waypoints = this._cameraWaypoints;
    const segments = waypoints.length - 1;
    const scaledProgress = progress * segments;
    const idx = Math.min(Math.floor(scaledProgress), segments - 1);
    const factor = scaledProgress - idx;
    
    const w1 = waypoints[idx];
    const w2 = waypoints[idx + 1];
    
    const lerp = this.lerp;
    let pos = [
      lerp(w1.pos[0], w2.pos[0], factor),
      lerp(w1.pos[1], w2.pos[1], factor),
      lerp(w1.pos[2], w2.pos[2], factor)
    ];
    let look = [
      lerp(w1.look[0], w2.look[0], factor),
      lerp(w1.look[1], w2.look[1], factor),
      lerp(w1.look[2], w2.look[2], factor)
    ];

    if (idx === 4) {
      const sweepX = 3.2 * Math.sin(factor * Math.PI);
      look[0] -= sweepX;
      pos[0] += 0.7 * Math.sin(factor * Math.PI);
    } else if (idx === 5) {
      const sweepX = 5.2 * Math.sin(factor * Math.PI);
      look[0] += sweepX;
      pos[0] -= 0.8 * Math.sin(factor * Math.PI);
    }
    
    return { pos, look };
  }

  // Update Camera position, lookAt target, and organic float
  updateCamera(elapsedTime) {
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    const waypoint = this.getCameraWaypoint(this.scrollProgress);

    // Responsive position and zoom offset checks
    const isMobile = window.innerWidth < 768;
    const xOffsetMultiplier = isMobile ? 0.35 : 1.0; // Keep camera centered on mobile
    const zOffset = isMobile ? 1.2 : 0.0; // Pull camera back slightly on mobile to preserve corridor framing

    // High frequency camera shake displacement loops during overclock active state
    const shakeX = this.isOverclocked ? Math.sin(elapsedTime * 45.0) * 0.03 : 0;
    const shakeY = this.isOverclocked ? Math.cos(elapsedTime * 40.0) * 0.03 : 0;
    const shakeZ = this.isOverclocked ? Math.sin(elapsedTime * 50.0) * 0.025 : 0;

    this.engine.camera.position.x = (waypoint.pos[0] * xOffsetMultiplier) + (this.mouse.x * 0.8) + Math.sin(elapsedTime * 0.3) * 0.12 + shakeX;
    this.engine.camera.position.y = waypoint.pos[1] - (this.mouse.y * 0.5) + Math.cos(elapsedTime * 0.2) * 0.08 + shakeY;
    this.engine.camera.position.z = waypoint.pos[2] + zOffset + shakeZ;
    
    // Initialize virtual lookAt vector if not defined to prevent starting jumps
    if (!this.currentLook) {
      this.currentLook = {
        x: waypoint.look[0] * xOffsetMultiplier,
        y: waypoint.look[1],
        z: waypoint.look[2]
      };
    }

    // Smoothly interpolate (lerp) the camera's lookAt vector to completely eliminate rapid snaps or jumps
    const lookLerpFactor = 0.06; // Highly dampened smooth transition
    this.currentLook.x += (waypoint.look[0] * xOffsetMultiplier - this.currentLook.x) * lookLerpFactor;
    this.currentLook.y += (waypoint.look[1] - this.currentLook.y) * lookLerpFactor;
    this.currentLook.z += (waypoint.look[2] - this.currentLook.z) * lookLerpFactor;

    this.engine.camera.lookAt(this.currentLook.x, this.currentLook.y, this.currentLook.z);
  }

  // Real-time 1:1 scroll-driven DOM transitions and letter reveals
  updateDOMScrollEffects(elapsedTime) {
    // Build and cache section DOM refs on first call — avoids repeated getElementById every frame
    if (!this._domCache) {
      const sectionIds = ['hero', 'about', 'projects', 'vue-frontend', 'laravel-backend', 'postgresql-showcase', 'wordpress-cms', 'contact'];
      const tagSelectors = ['#about-section-tag', '#vue-tag', '#backend-tag', '#postgresql-tag', '#wordpress-tag', '#projects-section-tag'];
      this._domCache = sectionIds.map(id => {
        const el = document.getElementById(id);
        const titleEl = el ? el.querySelector('.hero-title, .about-title, .footer-heading') : null;
        return {
          id,
          el,
          wrapper: el ? el.querySelector('.hero-wrapper, .about-grid, .showcase-grid, .projects-wrapper, .footer-grid') : null,
          tags: tagSelectors.map(sel => el ? el.querySelector(sel) : null).filter(Boolean),
          titleEl,
          titleChars: titleEl ? Array.from(titleEl.querySelectorAll('.char-span')) : []
        };
      });
    }

    const total = this._domCache.length;
    const segmentHeight = 1 / (total - 1);
    const velocity = this.scrollVelocity || 0;
    const velocityXOffset = velocity * -1200;

    for (let i = 0; i < total; i++) {
      const cache = this._domCache[i];
      if (!cache.el) continue;

      const centerScroll = i * segmentHeight;
      const diff = this.scrollProgress - centerScroll;
      const localProgress = diff / segmentHeight;
      const absProgress = Math.abs(localProgress);

      // Symmetrical flat-top envelope
      let opacity;
      if (absProgress <= 0.6) {
        opacity = 1.0;
      } else if (absProgress <= 1.0) {
        opacity = (1.0 - absProgress) / 0.4;
        if (opacity < 0) opacity = 0;
      } else {
        opacity = 0;
      }

      const yOffset = localProgress * -90;

      // 1. Wrapper opacity & parallax
      if (cache.wrapper) {
        cache.wrapper.style.opacity = opacity;
        cache.wrapper.style.transform = `translateY(${yOffset}px)`;
        cache.wrapper.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
      }

      // 2. Section tag floating parallax
      if (opacity > 0.05) {
        // Trigger the section entrance animations as soon as it enters the viewport!
        this.animator.animateSectionIn(cache.id);

        const scrollParallaxX = localProgress * -45;
        for (let t = 0; t < cache.tags.length; t++) {
          const tagEl = cache.tags[t];
          if (!tagEl) continue;
          const floatY = Math.sin(elapsedTime * 1.6 + t * 2.0) * 6;
          const floatX = Math.cos(elapsedTime * 1.0 + t * 1.5) * 5;
          tagEl.style.transform = `translate(${floatX + scrollParallaxX + velocityXOffset}px, ${floatY}px)`;
          tagEl.style.transition = 'transform 0.12s ease-out';
        }

        // 3. Scroll progressive title character reveal
        if (cache.titleChars.length > 0) {
          const chars = cache.titleChars;
          const totalChars = chars.length;
          for (let c = 0; c < totalChars; c++) {
            const char = chars[c];
            
            // Progressive threshold: characters light up one by one as we scroll down into the section
            // range is mapped over entrance scroll localProgress: -0.55 to -0.2
            const threshold = -0.55 + (c / totalChars) * 0.35;
            
            if (localProgress >= threshold) {
              char.style.opacity = 1;
              char.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.05)';
            } else {
              char.style.opacity = 0.05; // suttle layout blueprint faded look, extremely high-tech!
              char.style.textShadow = 'none';
            }
            char.style.transition = 'opacity 0.22s ease-out';
          }
        }
      } else {
        // Off-screen: reset tags
        for (let t = 0; t < cache.tags.length; t++) {
          const tagEl = cache.tags[t];
          if (tagEl) tagEl.style.transform = 'translate(0px, 0px)';
        }
      }
    }
  }

  // Cinematic loading simulation in the fullscreen terminal window (balanced golden ratio timing)
  startLoader() {
    const logs = document.querySelectorAll('#loader-logs .log-line');
    const fill = document.getElementById('loader-fill-progress');
    const percentText = document.getElementById('loader-percent-text');
    const loader = document.getElementById('loader-container');

    let progress = 0;
    let currentLogIdx = 0;

    const interval = setInterval(() => {
      // Incrementar con un ritmo fluido y balanceado para una sensación cyberpunk de compilación real
      progress += Math.floor(Math.random() * 6) + 3;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        percentText.innerText = '100%';
        fill.style.width = '100%';

        setTimeout(() => {
          gsap.to(loader, {
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out',
            onComplete: () => {
              loader.style.display = 'none';
              this.animator.bootAnimations();
              this.scrollManager = new ScrollManager(this);
              // Instantiate the interactive portfolio orchestrator
              this.portfolio = new PortfolioOrchestrator();
              this.explorerMode.setReady(true);
              this.explorerMode.refreshCopy();
              this.graphicsMode.setReady(true);
              this.graphicsMode.refreshCopy();
            }
          });
        }, 650); // Pausa de 650ms al 100% para apreciar el éxito de carga del core
      } else {
        percentText.innerText = `${progress.toString().padStart(2, '0')}%`;
        fill.style.width = `${progress}%`;

        const milestone = Math.floor((logs.length * progress) / 100);
        if (milestone > currentLogIdx && milestone < logs.length) {
          logs[currentLogIdx].classList.remove('active');
          currentLogIdx = milestone;
          logs[currentLogIdx].classList.add('active');
        }
      }
    }, 55); // Intervalo de 55ms para un progreso fluido y legible que completa en ~1s
  }

  // Scroll callback from ScrollManager
  onScroll(progress) {
    this.scrollProgress = progress;
  }

  // Section index change callback
  onSectionChange(currentIdx, oldIdx) {
    // Highlight the nav link that matches the eight physical scroll scenes.
    const links = document.querySelectorAll('.nav-link');
    links.forEach((link, idx) => {
      if (idx === currentIdx) {
        link.style.color = '#ffffff';
      } else {
        link.style.color = 'var(--color-text-sub)';
      }
    });

    // CRITICAL: Re-enable GSAP staggers for the active section elements!
    const sections = ['hero', 'about', 'projects', 'vue-frontend', 'laravel-backend', 'postgresql-showcase', 'wordpress-cms', 'contact'];
    if (sections[currentIdx]) {
      this.animator.animateSectionIn(sections[currentIdx]);
    }
  }

  initGravityInteraction() {
    const handleDown = event => {
      if (event.target?.closest?.('#explorer-mode-toggle, #explorer-hud')) return;
      if (window.soundManager && window.soundManager.audioCtx && window.soundManager.audioCtx.state === 'suspended') {
        window.soundManager.audioCtx.resume();
      }
      if (this.portfolio && this.portfolio.audioCtx && this.portfolio.audioCtx.state === 'suspended') {
        this.portfolio.audioCtx.resume();
      }
      this.particles.isGravityActive = true;
    };
    
    const handleUp = () => {
      if (this.particles.isGravityActive) {
        this.particles.isGravityActive = false;
        this.particles.triggerBlast();
      }
    };
    
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', handleDown, { passive: true });
    window.addEventListener('touchend', handleUp, { passive: true });
  }

  updateParticleGravityTarget() {
    if (!this.engine || !this.engine.camera || !this.particles) return;
    
    // Reuse pre-allocated scratch vectors — eliminates GC pressure from new THREE.Vector3() each frame
    this._gravVec.set(this.mouse.x, -this.mouse.y, 0.5);
    this._gravVec.unproject(this.engine.camera);
    
    this._gravDir.copy(this._gravVec).sub(this.engine.camera.position).normalize();
    const dz = this._gravDir.z;
    if (Math.abs(dz) < 0.0001) return; // degenerate case guard
    const distance = -this.engine.camera.position.z / dz;
    
    this._gravPos.copy(this.engine.camera.position).addScaledVector(this._gravDir, distance);
    this.particles.gravityTarget.copy(this._gravPos);
  }

  updateTelemetryHUD() {
    // Cache HUD elements on first call — never re-queries the DOM afterward
    if (!this._hudEls) {
      this._hudEls = {
        fps: document.getElementById('hud-fps-val'),
        scroll: document.getElementById('hud-scroll-val'),
        ram: document.getElementById('hud-ram-val'),
        addr: document.getElementById('hud-addr-val')
      };
    }
    const h = this._hudEls;
    if (h.fps)    h.fps.innerText    = Math.min(60, Math.round(this.fps || 60));
    if (h.scroll) h.scroll.innerText = `${Math.round(this.scrollVelocityPx || 0)} px/s`;
    if (h.ram)    h.ram.innerText    = `${this.currentMemory || 35} MB`;
    if (h.addr)   h.addr.innerText   = `0x${Math.floor((this.scrollProgress || 0) * 65535).toString(16).toUpperCase().padStart(4, '0')}`;
  }

  toggleOverclock(forcedState) {
    const nextState = forcedState !== undefined ? forcedState : !this.isOverclocked;
    this.isOverclocked = nextState;
    
    if (this.gridFloor) {
      this.gridFloor.isOverclocked = nextState;
      if (nextState) {
        // snaps center lines to warning orange-red, grids to deep reddish-orange
        this.gridFloor.setColor('#ff3300', '#2a0500');
      } else {
        // snaps back to cyan design color grid
        this.gridFloor.setColor('#00f2fe', '#060a16');
      }
    }

    if (this.morphingEntity) {
      this.morphingEntity.setOverclock(nextState);
    }
    
    if (this.portfolio) {
      this.portfolio.syncOverclockUI(nextState);
    }
  }
}
