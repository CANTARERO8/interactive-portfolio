import gsap from 'gsap';

export class MagneticManager {
  constructor() {
    this.magneticElements = document.querySelectorAll('.nav-link, #header-logo');
    if (!this.magneticElements.length) return;

    this.initMagnetics();
  }

  initMagnetics() {
    this.magneticElements.forEach(el => {
      
      const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
      
      let rect = el.getBoundingClientRect();
      
      const updateRect = () => {
        rect = el.getBoundingClientRect();
      };
      
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, { passive: true });

      window.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const limit = 55; 
        
        if (dist < limit) {
          
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
          
          xTo(0);
          yTo(0);
          el.style.textShadow = '';
        }
      });
    });
  }
}
