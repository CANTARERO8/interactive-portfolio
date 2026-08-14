import gsap from 'gsap';

export class MagneticManager {
  constructor() {
    this.magneticElements = document.querySelectorAll('.nav-link, #header-logo');
    if (!this.magneticElements.length) return;

    this.initMagnetics();
  }

  initMagnetics() {
    this.magneticElements.forEach(el => {
      // 1. Create highly optimized GSAP quickTo animations for smooth sub-millisecond translates
      const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
      
      let rect = el.getBoundingClientRect();
      
      // Update element bounding coordinates dynamically on viewport changes
      const updateRect = () => {
        rect = el.getBoundingClientRect();
      };
      
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, { passive: true });

      // Track cursor position inside window
      window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Calculate coordinate center of target element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate vector distance from cursor to center
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const limit = 55; // magnet pull range in pixels
        
        if (dist < limit) {
          // Inside magnetic field: pull suttly towards cursor (weighted max 14px translate)
          const force = 0.26;
          xTo(dx * force);
          yTo(dy * force);
          
          const isOverclocked = window.APP_INSTANCE && window.APP_INSTANCE.isOverclocked;
          if (isOverclocked) {
            el.style.textShadow = '0 0 10px rgba(255, 51, 0, 0.5)';
          } else {
            el.style.textShadow = '0 0 10px rgba(0, 243, 255, 0.4)';
          }
        } else {
          // Outside magnetic field: snap suttly back to rest coordinates
          xTo(0);
          yTo(0);
          el.style.textShadow = '';
        }
      });
    });
  }
}
