import gsap from 'gsap';

export class Cursor {
  constructor() {
    // 1. Fetch or create cursor DOM nodes if needed
    this.dot = document.getElementById('js-cursor');
    this.ring = document.getElementById('js-cursor-ring');

    if (!this.dot) {
      this.dot = document.createElement('div');
      this.dot.id = 'js-cursor';
      this.dot.className = 'custom-cursor';
      document.body.appendChild(this.dot);
    }
    if (!this.ring) {
      this.ring = document.createElement('div');
      this.ring.id = 'js-cursor-ring';
      this.ring.className = 'custom-cursor-ring';
      document.body.appendChild(this.ring);
    }

    // 2. Position tracking (initialized offscreen)
    this.mouse = { x: -200, y: -200 };
    this.pos = { x: -200, y: -200 };
    this.isInitialized = false;

    // 3. Bind events
    this.onMouseMove = this.onMouseMove.bind(this);
    this.tick = this.tick.bind(this);

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    window.addEventListener('mousedown', () => document.body.classList.add('cursor-clicking'));
    window.addEventListener('mouseup', () => document.body.classList.remove('cursor-clicking'));

    // 4. Setup hover triggers
    this.setupHoverListeners();

    // 5. Start RAF loop
    requestAnimationFrame(this.tick);
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    if (!this.isInitialized) {
      this.isInitialized = true;
      this.pos.x = this.mouse.x;
      this.pos.y = this.mouse.y;
      this.dot.style.opacity = '1';
      this.ring.style.opacity = '1';
    }

    // Instant placement of inner dot via hardware-accelerated transform
    this.dot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;
  }

  tick() {
    if (this.isInitialized) {
      // Elastic spring lag for the follower ring
      const ease = 0.18;
      this.pos.x += (this.mouse.x - this.pos.x) * ease;
      this.pos.y += (this.mouse.y - this.pos.y) * ease;

      this.ring.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(this.tick);
  }

  setupHoverListeners() {
    const hoverSelectors = 'a, button, [role="button"], .nav-link, .nav-logo, .project-row, .scroll-to, .metric-card, .contact-item, .cmd-trigger-btn, .lang-btn, .cli-suggest-btn, .showcase-ctrl-btn';

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(hoverSelectors);
      if (target) {
        if (e.relatedTarget && target.contains(e.relatedTarget)) return;
        document.body.classList.add('hovering-link');
        if (window.soundManager && window.soundManager.playClick) {
          window.soundManager.playClick();
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(hoverSelectors);
      if (target) {
        if (e.relatedTarget && target.contains(e.relatedTarget)) return;
        document.body.classList.remove('hovering-link');
      }
    });

    window.addEventListener('blur', () => {
      document.body.classList.remove('hovering-link');
      document.body.classList.remove('cursor-clicking');
    });
  }
}
