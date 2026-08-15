export class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.isEnabled = true;

    this.initOnInteraction();
  }

  init() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API is not supported in this browser.', e);
    }
  }

  initOnInteraction() {
    const unlock = () => {
      this.init();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  playClick() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.018);

    gain.gain.setValueAtTime(0.003, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  playChirp() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.045);

    gain.gain.setValueAtTime(0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playDrawerSweep(isOpen = true) {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    filter.type = 'lowpass';
    filter.Q.value = 1.0;

    if (isOpen) {
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.25);
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.25);
    } else {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
      filter.frequency.setValueAtTime(380, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.2);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.006, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  playKeyboardClick() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.012);

    gain.gain.setValueAtTime(0.003, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.012);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.015);
  }

  playError() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(120, now + 0.06);

    gain.gain.setValueAtTime(0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playSuccess() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    [523.25, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.02);

      gain.gain.setValueAtTime(0.006, now + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.02 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.02);
      osc.stop(now + i * 0.02 + 0.2);
    });
  }

  playWarpJump() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(160, now);
    osc1.frequency.exponentialRampToValueAtTime(90, now + 0.18);
    osc1.frequency.exponentialRampToValueAtTime(65, now + 0.38);

    osc2.frequency.setValueAtTime(240, now);
    osc2.frequency.exponentialRampToValueAtTime(130, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.38);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.38);
    filter.Q.value = 0.7; 

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.010, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.40);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.42);
    osc2.stop(now + 0.42);
  }

  playCoreDeconstruct() {
    if (!this.isEnabled) return;
    this.init();
    if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    [330, 440, 550].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.02);

      gain.gain.setValueAtTime(0.004, now + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + i * 0.02 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.02);
      osc.stop(now + i * 0.02 + 0.28);
    });
  }
}
