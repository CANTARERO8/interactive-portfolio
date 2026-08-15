export class Cursor {
  constructor() {
    this.dot = document.getElementById('js-cursor');
    this.ring = document.getElementById('js-cursor-ring');

    if (!this.dot || !this.ring) return;

    this.setupHoverListeners();
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

    window.addEventListener('mousedown', () => document.body.classList.add('cursor-clicking'));
    window.addEventListener('mouseup', () => document.body.classList.remove('cursor-clicking'));
    window.addEventListener('blur', () => {
      document.body.classList.remove('hovering-link');
      document.body.classList.remove('cursor-clicking');
    });
  }
}
