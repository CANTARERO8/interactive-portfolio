export class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isEnabled = true;

    // Hook basic user gestures to initialize AudioContext seamlessly
    this.initOnInteraction();
  }

  // Initialize browser AudioContext
  init() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API is not supported in this browser.', e);
    }
  }

  // Interactive unlock hook for standard browser autoplay security policies
  initOnInteraction() {
    const unlock = () => {
      this.init();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      // Remove listeners once audio system is hot
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  // 1. High-tech Mechanical click (short high-frequency sine wave transient)
  playClick() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 2. High-Tech diagnostic chirp (two quick frequency steps)
  playChirp() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1480, now + 0.025);

    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 3. Wideband sweep for details drawer slide transitions
  playDrawerSweep(isOpen = true) {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'bandpass';
    filter.Q.value = 2.5;

    if (isOpen) {
      // Swiping upward from low frequency
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.48);
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.exponentialRampToValueAtTime(1150, now + 0.48);
      
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    } else {
      // Swiping downward from high frequency
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.38);
      filter.frequency.setValueAtTime(880, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.38);

      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // 4. Subtle mechanical keyboard keystroke click
  playKeyboardClick() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.012);

    // Kept highly subtle for satisfying high-speed typing runs
    gain.gain.setValueAtTime(0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  }

  // 5. Sound feedbacl for CLI invalid directives
  playError() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(110, now + 0.07);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 6. Sound feedback for CLI compilation success
  playSuccess() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.14);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now); // A5
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.14);

    gain1.gain.setValueAtTime(0.012, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    gain2.gain.setValueAtTime(0.012, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(ctx.destination);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.15);
    osc2.stop(now + 0.15);
  }

  // 7. Hyperspace Warp Jump Acoustic Whoosh
  playWarpJump() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'lowpass';
    filter.Q.value = 4.0;

    // Rising sweep then drop
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(1450, now + 0.55);
    osc.frequency.exponentialRampToValueAtTime(120, now + 1.2);

    filter.frequency.setValueAtTime(120, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.55);
    filter.frequency.exponentialRampToValueAtTime(200, now + 1.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  // 8. Holographic Core Deconstruction Harmonic Chime
  playCoreDeconstruct() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    [440, 659.25, 880, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + i * 0.03 + 0.25);

      gain.gain.setValueAtTime(0.008, now + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.03 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.03);
      osc.stop(now + i * 0.03 + 0.3);
    });
  }
}
