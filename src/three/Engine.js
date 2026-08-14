import * as THREE from 'three';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#080d28'); // Rich deep cosmic navy void (slightly brighter)
    
    // Ambient fog - slightly thinner density (0.022) to make deep columns and details clearer
    this.scene.fog = new THREE.FogExp2('#080d28', 0.022);

    // Camera setup - 55 degrees FOV for a wide cinematic perspective
    this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 150);
    this.camera.position.set(0, 0.5, 8); // Posicionamiento abisal inicial

    // High performance renderer — antialias disabled (cost outweighs benefit at high dpi)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(this.width, this.height);
    // Cap at 1.5 — above that, GPU fill-rate is the bottleneck with no visible quality gain
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    // Cinematic tone mapping
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    // Shadows disabled — we have 6 SpotLights with PCFSoft which costs enormous GPU time
    this.renderer.shadowMap.enabled = false;

    // Clock for delta tracking
    this.clock = new THREE.Clock();
    
    // Resize listener
    this.resizeCallback = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeCallback);
    
    // Tick registers
    this.tickCallbacks = new Set();
    
    // Start tick loop
    this.tick();
  }

  // Register animation tick callbacks
  addTick(callback) {
    this.tickCallbacks.add(callback);
  }

  removeTick(callback) {
    this.tickCallbacks.delete(callback);
  }

  // Animation Loop (60fps)
  tick() {
    requestAnimationFrame(this.tick.bind(this));
    
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    
    // Execute registered ticks
    for (const callback of this.tickCallbacks) {
      callback(deltaTime, elapsedTime);
    }
    
    // Standard rendering
    this.renderer.render(this.scene, this.camera);
  }

  // Window Resize handler
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }

  // Clean resources
  destroy() {
    window.removeEventListener('resize', this.resizeCallback);
    this.renderer.dispose();
  }
}
