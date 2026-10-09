import gsap from 'gsap';

const GRAPHICS_MODES = new Set(['performance', 'ultra', 'ultra-plus']);

const COPY = {
  es: {
    controlLabel: 'GRÁFICOS',
    controlAria: 'Seleccionar calidad gráfica',
    performance: 'RENDIMIENTO',
    ultra: 'ULTRA',
    'ultra-plus': 'ULTRA+',
    loadingTitle: 'RECONFIGURANDO MOTOR GRÁFICO',
    loadingMode: {
      performance: 'MODO RENDIMIENTO',
      ultra: 'MODO ULTRA',
      'ultra-plus': 'MODO ULTRA+'
    },
    description: {
      performance: 'RENDER LIGERO — RESPUESTA MÁXIMA',
      ultra: 'NEBULOSA OPTIMIZADA — CALIDAD EQUILIBRADA',
      'ultra-plus': 'NEBULOSA HD VIOLETA + 7,700 PARTÍCULAS + TODOS LOS EFECTOS'
    },
    stages: {
      performance: [
        'LIMITANDO RESOLUCIÓN DEL RENDERER',
        'DESCARGANDO PASE VOLUMÉTRICO',
        'OPTIMIZANDO DENSIDAD DE PARTÍCULAS',
        'PERFIL DE RENDIMIENTO EN LÍNEA'
      ],
      ultra: [
        'ESCALANDO RESOLUCIÓN EQUILIBRADA',
        'INICIANDO NEBULOSA OPTIMIZADA',
        'SINCRONIZANDO HACES Y PARTÍCULAS',
        'PIPELINE ULTRA EN LÍNEA'
      ],
      'ultra-plus': [
        'ESCALANDO RESOLUCIÓN DEL RENDERER',
        'INICIANDO RAYMARCHING HD DE NEBULOSA',
        'DESPLEGANDO TODOS LOS EFECTOS VOLUMÉTRICOS',
        'PIPELINE ULTRA+ EN LÍNEA'
      ]
    }
  },
  en: {
    controlLabel: 'GRAPHICS',
    controlAria: 'Select graphics quality',
    performance: 'PERFORMANCE',
    ultra: 'ULTRA',
    'ultra-plus': 'ULTRA+',
    loadingTitle: 'RECONFIGURING GRAPHICS ENGINE',
    loadingMode: {
      performance: 'PERFORMANCE MODE',
      ultra: 'ULTRA MODE',
      'ultra-plus': 'ULTRA+ MODE'
    },
    description: {
      performance: 'LIGHTWEIGHT RENDER — MAXIMUM RESPONSE',
      ultra: 'OPTIMIZED NEBULA — BALANCED QUALITY',
      'ultra-plus': 'VIOLET HD NEBULA + 7,700 PARTICLES + ALL EFFECTS'
    },
    stages: {
      performance: [
        'LIMITING RENDERER RESOLUTION',
        'UNLOADING VOLUMETRIC PASS',
        'OPTIMIZING PARTICLE DENSITY',
        'PERFORMANCE PROFILE ONLINE'
      ],
      ultra: [
        'SCALING BALANCED RESOLUTION',
        'STARTING OPTIMIZED NEBULA',
        'SYNCING BEAMS AND PARTICLES',
        'ULTRA PIPELINE ONLINE'
      ],
      'ultra-plus': [
        'SCALING RENDERER RESOLUTION',
        'STARTING HD NEBULA RAYMARCHING',
        'DEPLOYING ALL VOLUMETRIC EFFECTS',
        'ULTRA+ PIPELINE ONLINE'
      ]
    }
  }
};

export class GraphicsMode {
  constructor(app) {
    this.app = app;
    this.control = document.getElementById('graphics-mode-control');
    this.controlLabel = document.getElementById('graphics-mode-control-label');
    this.buttons = Array.from(document.querySelectorAll('.graphics-mode-options button[data-graphics-mode]'));
    this.overlay = document.getElementById('graphics-transition-overlay');
    this.panel = document.getElementById('graphics-transition-panel');
    this.loadingTitle = document.getElementById('graphics-loading-title');
    this.loadingMode = document.getElementById('graphics-loading-mode');
    this.loadingDescription = document.getElementById('graphics-loading-description');
    this.loadingStage = document.getElementById('graphics-loading-stage');
    this.loadingProgress = document.getElementById('graphics-loading-progress');
    this.loadingPercent = document.getElementById('graphics-loading-percent');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.progressState = { value: 0 };
    this.currentMode = this.getStoredMode();
    this.pendingMode = this.currentMode;
    this.busy = false;
    this.timeline = null;
    this.shouldResumeScroll = false;

    this.handleModeClick = this.handleModeClick.bind(this);
    this.buttons.forEach(button => button.addEventListener('click', this.handleModeClick));

    this.applyMode(this.currentMode, false);
    this.refreshCopy();
  }

  getStoredMode() {
    try {
      const storedMode = localStorage.getItem('portfolio-graphics-mode');
      return GRAPHICS_MODES.has(storedMode) ? storedMode : 'ultra';
    } catch {
      return 'ultra';
    }
  }

  setReady(ready) {
    if (this.control) this.control.hidden = !ready;
  }

  getLanguage() {
    try {
      return localStorage.getItem('portfolio-lang') === 'en' ? 'en' : 'es';
    } catch {
      return 'es';
    }
  }

  refreshCopy() {
    const copy = COPY[this.getLanguage()];
    if (this.controlLabel) this.controlLabel.textContent = copy.controlLabel;
    if (this.control) this.control.setAttribute('aria-label', copy.controlAria);

    this.buttons.forEach(button => {
      const mode = button.dataset.graphicsMode;
      button.textContent = copy[mode];
      button.title = copy.description[mode];
    });

    if (this.loadingTitle) this.loadingTitle.textContent = copy.loadingTitle;
    this.updateOverlayCopy(this.pendingMode, this.getStageIndex());
  }

  handleModeClick(event) {
    this.switchMode(event.currentTarget.dataset.graphicsMode);
  }

  switchMode(mode) {
    if (!GRAPHICS_MODES.has(mode) || this.busy || mode === this.currentMode) return;
    if (!this.overlay || !this.panel) {
      this.applyMode(mode, true);
      return;
    }

    this.busy = true;
    this.pendingMode = mode;
    this.progressState.value = 0;
    this.shouldResumeScroll = !this.app.explorerMode?.active && Boolean(this.app.scrollManager?.lenis);
    if (this.shouldResumeScroll) this.app.scrollManager.lenis.stop();

    this.buttons.forEach(button => { button.disabled = true; });
    document.body.classList.add('graphics-switching');
    this.overlay.hidden = false;
    this.overlay.setAttribute('aria-hidden', 'false');
    this.overlay.dataset.mode = mode;
    this.updateProgress();
    this.updateOverlayCopy(mode, 0);

    const timeScale = this.reducedMotion ? 0.28 : 1;
    this.timeline?.kill();
    this.timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => this.finishTransition()
    });

    this.timeline
      .addLabel('intro', 0)
      .set(this.overlay, { autoAlpha: 0 }, 'intro')
      .set(this.panel, { autoAlpha: 0, y: 18, scale: 0.985 }, 'intro')
      .to(this.overlay, { autoAlpha: 1, duration: 0.26 * timeScale }, 'intro')
      .to(this.panel, { autoAlpha: 1, y: 0, scale: 1, duration: 0.36 * timeScale }, `intro+=${0.06 * timeScale}`)
      .to(this.progressState, {
        value: 100,
        duration: 1.3 * timeScale,
        ease: 'power2.inOut',
        onUpdate: () => this.updateProgress()
      }, `intro+=${0.12 * timeScale}`)
      .call(() => this.applyMode(mode, true), null, `intro+=${0.68 * timeScale}`)
      .to(this.panel, {
        autoAlpha: 0,
        y: -12,
        duration: 0.28 * timeScale,
        ease: 'power2.in'
      }, `intro+=${1.55 * timeScale}`)
      .to(this.overlay, {
        autoAlpha: 0,
        duration: 0.34 * timeScale,
        ease: 'power2.inOut'
      }, `intro+=${1.56 * timeScale}`);
  }

  getStageIndex() {
    const progress = this.progressState.value;
    if (progress < 28) return 0;
    if (progress < 58) return 1;
    if (progress < 86) return 2;
    return 3;
  }

  updateOverlayCopy(mode, stageIndex) {
    const copy = COPY[this.getLanguage()];
    if (this.loadingMode) this.loadingMode.textContent = copy.loadingMode[mode];
    if (this.loadingDescription) this.loadingDescription.textContent = copy.description[mode];
    if (this.loadingStage) this.loadingStage.textContent = copy.stages[mode][stageIndex];
  }

  updateProgress() {
    const progress = Math.round(this.progressState.value);
    if (this.loadingProgress) this.loadingProgress.style.width = `${progress}%`;
    if (this.loadingPercent) this.loadingPercent.textContent = `${String(progress).padStart(2, '0')}%`;
    this.updateOverlayCopy(this.pendingMode, this.getStageIndex());
  }

  applyMode(mode, persist = true) {
    this.currentMode = GRAPHICS_MODES.has(mode) ? mode : 'ultra';
    document.documentElement.dataset.graphicsQuality = this.currentMode;

    this.app.engine?.setQualityMode(this.currentMode);
    this.app.nebula?.setQualityMode(this.currentMode);
    this.app.lightBeams?.setQualityMode(this.currentMode);
    this.app.particles?.setQualityMode(this.currentMode);
    this.app.systemsCity?.setQualityMode(this.currentMode);
    this.app.worldBackground?.setQualityMode(this.currentMode);

    this.buttons.forEach(button => {
      const active = button.dataset.graphicsMode === this.currentMode;
      button.setAttribute('aria-pressed', String(active));
    });

    if (persist) {
      try {
        localStorage.setItem('portfolio-graphics-mode', this.currentMode);
      } catch {
        
      }
    }

    this.refreshCopy();
    window.dispatchEvent(new CustomEvent('portfolio:graphics-mode', {
      detail: { mode: this.currentMode }
    }));
  }

  finishTransition() {
    this.overlay.hidden = true;
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('graphics-switching');
    this.buttons.forEach(button => { button.disabled = false; });

    if (this.shouldResumeScroll && !this.app.explorerMode?.active) {
      this.app.scrollManager?.lenis?.start();
    }

    this.shouldResumeScroll = false;
    this.busy = false;
    this.pendingMode = this.currentMode;
    this.timeline = null;
  }

  destroy() {
    this.timeline?.kill();
    this.buttons.forEach(button => button.removeEventListener('click', this.handleModeClick));
  }
}
