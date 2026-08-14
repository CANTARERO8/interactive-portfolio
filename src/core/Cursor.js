import gsap from 'gsap';

export class Cursor {
  constructor() {
    this.dot = document.getElementById('js-cursor');
    this.ring = document.getElementById('js-cursor-ring');
    
    if (!this.dot || !this.ring) return;
    
    // Position states
    this.mouse = { x: -100, y: -100 };
    this.pos = { x: -100, y: -100 }; // Lerp position for the ring
    
    // Bind mouse movements
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Setup hover listeners
    this.setupHoverListeners();
    
    // Animation frame request loop
    this.tick();
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
    
    // Instantly place the central core dot
    this.dot.style.left = `${this.mouse.x}px`;
    this.dot.style.top = `${this.mouse.y}px`;

    // Magnetic hover: track nearest magnetic element
    this.updateMagnetic(e);
  }

  // Linear interpolation for trailing cursor ring
  tick() {
    requestAnimationFrame(this.tick.bind(this));
    
    const ease = 0.12; // Ring trail smoothness
    this.pos.x += (this.mouse.x - this.pos.x) * ease;
    this.pos.y += (this.mouse.y - this.pos.y) * ease;
    
    this.ring.style.left = `${this.pos.x}px`;
    this.ring.style.top = `${this.pos.y}px`;
  }

  // ─── MAGNETIC HOVER ──────────────────────────────────────────────────────
  // GSAP-only: magnetic elements subtly track the cursor within their bounds,
  // creating an organic "pull" feeling — impossible with pure CSS
  setupHoverListeners() {
    const hoverElements = 'a, button, .project-row, .scroll-to, .metric-card, .contact-item';

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(hoverElements);
      if (target) {
        // If we moved into the target from one of its own children, ignore
        if (e.relatedTarget && target.contains(e.relatedTarget)) {
          return;
        }

        document.body.classList.add('hovering-link');
        
        // Prevent duplicate sound/flicker triggers when gliding inside the same container
        if (this.activeMagnetic !== target) {
          this.activeMagnetic = target;
          
          // Play high-frequency cybernetic synth click
          this.playGlitchClick();
          
          // Trigger horizontal letter-level scramble and blur flicker
          this.triggerHoverGlitch(target);
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(hoverElements);
      if (target) {
        // If we are moving into a child element of the same target, ignore (do not trigger mouseout)
        if (e.relatedTarget && target.contains(e.relatedTarget)) {
          return;
        }

        document.body.classList.remove('hovering-link');
        // Reset magnetic pull with a smooth snap-back
        if (this.activeMagnetic === target) {
          gsap.to(target, {
            x: 0, y: 0,
            duration: 0.4,
            ease: 'power3.out',
            overwrite: 'auto'
          });
          this.activeMagnetic = null;
        }
      }
    });

    // Also reset on window blur to prevent stuck states
    window.addEventListener('blur', () => {
      if (this.activeMagnetic) {
        gsap.to(this.activeMagnetic, { x: 0, y: 0, duration: 0.3 });
        this.activeMagnetic = null;
      }
    });
  }

  // Synthesize dynamic high-frequency cybernetic click on active hover
  playGlitchClick() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;

      // 1. Synthesize sub-millisecond white noise static burst for texture
      const bufferSize = this.audioCtx.sampleRate * 0.015; // 15ms duration
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      // 2. Synthesize high-pitch cybernetic chirp sine wave
      const osc = this.audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(4500, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.012);

      // 3. Setup envelopes
      const gainNoise = this.audioCtx.createGain();
      gainNoise.gain.setValueAtTime(0.03, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      const gainOsc = this.audioCtx.createGain();
      gainOsc.gain.setValueAtTime(0.06, now);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      // 4. Tight bandpass filter for a thin, metallic sound
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4800;
      filter.Q.value = 2.0;

      noise.connect(gainNoise);
      gainNoise.connect(filter);

      osc.connect(gainOsc);
      gainOsc.connect(filter);

      filter.connect(this.audioCtx.destination);

      noise.start(now);
      noise.stop(now + 0.015);
      osc.start(now);
      osc.stop(now + 0.015);
    } catch (e) {
      console.warn("AudioContext bypassed until user interactions occur.", e);
    }
  }

  // Trigger rapid letter-level visual opacity flicker and horizontal chromatic jitter
  triggerHoverGlitch(target) {
    const chars = target.querySelectorAll('.char-span, .word-span, .glitch-char');
    
    if (chars.length) {
      const tl = gsap.timeline();
      chars.forEach((char) => {
        // 75% probability for each letter to participate in the glitch sequence
        if (Math.random() > 0.25) {
          const offset = (Math.random() - 0.5) * 5; // Horizontal shift
          
          tl.to(char, {
            opacity: 0.1,
            x: offset,
            skewX: offset * 3,
            duration: 0.03,
            ease: 'power1.inOut'
          }, Math.random() * 0.06);
          
          tl.to(char, {
            opacity: 1,
            x: 0,
            skewX: 0,
            duration: 0.04,
            ease: 'power2.out'
          }, 0.06 + Math.random() * 0.06);
        }
      });
    } else {
      // Fallback for flat buttons
      const tl = gsap.timeline();
      tl.to(target, { opacity: 0.2, duration: 0.03, ease: 'power1.inOut' })
        .to(target, { opacity: 1, duration: 0.04 })
        .to(target, { opacity: 0.3, duration: 0.02 })
        .to(target, { opacity: 1, duration: 0.04 });
    }
  }

  // Called on every mousemove — pulls the active element toward cursor
  updateMagnetic(e) {
    if (!this.activeMagnetic) return;

    const rect = this.activeMagnetic.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized offset from center (-1 to 1)
    const offsetX = (e.clientX - centerX) / (rect.width / 2);
    const offsetY = (e.clientY - centerY) / (rect.height / 2);

    // Magnetic pull strength (max 8px displacement)
    const strength = 8;
    const pullX = offsetX * strength;
    const pullY = offsetY * strength;

    gsap.to(this.activeMagnetic, {
      x: pullX,
      y: pullY,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }
}
