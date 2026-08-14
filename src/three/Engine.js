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
    this.baseFov = 55;
    this.targetFov = 55;
    this.camera = new THREE.PerspectiveCamera(55, this.width / this.height, 0.1, 150);
    this.camera.position.set(0, 0.5, 8); // Posicionamiento abisal inicial

    // Clean sub-pixel contours are especially important for the architectural silhouettes.
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });

    this.qualityMode = 'ultra';
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.getTargetPixelRatio());
    
    // Cinematic tone mapping
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    // Shadows disabled — we have 6 SpotLights with PCFSoft which costs enormous GPU time
    this.renderer.shadowMap.enabled = false;

    // Timer with Page Visibility integration avoids giant deltas after tab changes.
    this.timer = new THREE.Timer();
    this.timer.connect(document);
    
    // Resize listener
    this.resizeCallback = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeCallback);
    
    // Tick registers
    this.tickCallbacks = new Set();
    
    // Start tick loop with a stable callback reference.
    this.tickCallback = this.tick.bind(this);
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
  tick(timestamp) {
    this.rafId = requestAnimationFrame(this.tickCallback);
    this.timer.update(timestamp);
    
    const deltaTime = this.timer.getDelta();
    const elapsedTime = this.timer.getElapsed();
    
    // Execute registered ticks
    for (const callback of this.tickCallbacks) {
      callback(deltaTime, elapsedTime);
    }
    
    // Smoothly interpolate Camera FOV (for Warp Speed and dynamic zooms)
    if (Math.abs(this.camera.fov - this.targetFov) > 0.05) {
      this.camera.fov += (this.targetFov - this.camera.fov) * 0.08;
      this.camera.updateProjectionMatrix();
    }

    // Standard rendering
    this.renderer.render(this.scene, this.camera);
  }

  // Set target FOV with smooth transition
  setFov(fov) {
    this.targetFov = fov;
  }

  getTargetPixelRatio() {
    const pixelRatioCap = this.qualityMode === 'performance'
      ? 1
      : (this.qualityMode === 'ultra-plus' ? 2 : 1.35);
    return Math.min(window.devicePixelRatio || 1, pixelRatioCap);
  }

  setQualityMode(mode) {
    this.qualityMode = ['performance', 'ultra', 'ultra-plus'].includes(mode) ? mode : 'ultra';
    const isPerformance = this.qualityMode === 'performance';
    const isUltraPlus = this.qualityMode === 'ultra-plus';

    this.renderer.setPixelRatio(this.getTargetPixelRatio());
    this.scene.background.set(isPerformance ? '#080d28' : (isUltraPlus ? '#010207' : '#030817'));
    if (this.scene.fog) {
      this.scene.fog.color.set(isPerformance ? '#080d28' : (isUltraPlus ? '#050d20' : '#07142a'));
      this.scene.fog.density = isPerformance ? 0.018 : (isUltraPlus ? 0.023 : 0.021);
    }
  }

  // Window Resize handler
  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.getTargetPixelRatio());
  }

  // Clean resources
  destroy() {
    window.removeEventListener('resize', this.resizeCallback);
    cancelAnimationFrame(this.rafId);
    this.timer.dispose();
    this.renderer.dispose();
  }
}
