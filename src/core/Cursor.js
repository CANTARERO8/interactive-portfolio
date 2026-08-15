export class Cursor {
  constructor() {
    // 1. Fetch or dynamically create cursor DOM nodes
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

    // 2. Initialize in viewport center
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    this.mouse = { x: startX, y: startY };
    this.pos = { x: startX, y: startY };

    this.dot.style.transform = `translate3d(${startX}px, ${startY}px, 0) translate(-50%, -50%)`;
    this.ring.style.transform = `translate3d(${startX}px, ${startY}px, 0) translate(-50%, -50%)`;

    // 3. Bind movement and click events
    this.onMove = this.onMove.bind(this);
    this.tick = this.tick.bind(this);

    window.addEventListener('mousemove', this.onMove, { passive: true });
    document.addEventListener('mousemove', this.onMove, { passive: true });
    window.addEventListener('pointermove', this.onMove, { passive: true });

    window.addEventListener('mousedown', () => document.body.classList.add('cursor-clicking'));
    window.addEventListener('mouseup', () => document.body.classList.remove('cursor-clicking'));

    // 4. Setup hover listeners
    this.setupHoverListeners();

    // 5. Start animation loop
    requestAnimationFrame(this.tick);
  }

  onMove(e) {
    if (!e.clientX && !e.clientY) return;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    // Instant update for inner core dot
    this.dot.style.transform = `translate3d(${this.mouse.x}px, ${this.mouse.y}px, 0) translate(-50%, -50%)`;
  }

  tick() {
    // Smooth spring lerp for follower ring
    const ease = 0.2;
    this.pos.x += (this.mouse.x - this.pos.x) * ease;
    this.pos.y += (this.mouse.y - this.pos.y) * ease;

    this.ring.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;

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
