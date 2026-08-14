import gsap from 'gsap';

export class HoverTilt {
  constructor() {
    this.initHoverTilts();
  }

  initHoverTilts() {
    // 3D Hover Tilt targets: showcase editor terminals, metric cards, and specs dashboard
    const cards = document.querySelectorAll('.metric-card, .about-specs');
    
    cards.forEach(card => {
      // Ensure the parent container supports 3D rendering perspective
      const parent = card.parentElement;
      if (parent) {
        parent.style.perspective = '1000px';
      }
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform, box-shadow';

      // Mouse movements inside the card
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;  
        
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        const dx = x - xc;
        const dy = y - yc;
        
        const normalizedX = dx / xc; // -1 to 1
        const normalizedY = dy / yc; // -1 to 1
        
        const maxRotateX = 8; // degrees (soft, elegant organic tilt)
        const maxRotateY = 8;
        
        const rotateX = -normalizedY * maxRotateX;
        const rotateY = normalizedX * maxRotateY;
        
        // Parallax translate offsets
        const transX = normalizedX * 4;
        const transY = normalizedY * 4;

        // Custom neon glow color based on overclock state
        const isOverclocked = window.APP_INSTANCE && window.APP_INSTANCE.isOverclocked;
        const glowColor = isOverclocked ? '255, 51, 0' : '0, 242, 254';
        
        // Smoothly tilt, translate, and shift neon box shadow towards the mouse
        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          x: transX,
          y: transY,
          boxShadow: `${-normalizedX * 12}px ${-normalizedY * 12}px 35px rgba(0, 0, 0, 0.55), 0 0 25px rgba(${glowColor}, ${0.05 + Math.abs(normalizedX) * 0.08})`,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      // Mouse leaves - smoothly restore card to calm flat state
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          x: 0,
          y: 0,
          boxShadow: '',
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });

    // Subtly different layered parallax depth effects for wide project rows
    const projectRows = document.querySelectorAll('.project-row');
    projectRows.forEach(row => {
      row.style.willChange = 'transform, padding-left';
      
      row.addEventListener('mousemove', (e) => {
        const rect = row.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const xc = rect.width / 2;
        const dx = x - xc;
        const normalizedX = dx / xc; // -1 to 1

        // Find internal child elements to apply layered depth translations
        const num = row.querySelector('.project-num');
        const name = row.querySelector('.project-name');
        const techs = row.querySelector('.project-techs');
        const arrow = row.querySelector('.project-arrow');

        // Apply distinct layered translation speeds (depth parallax) to children
        if (num) {
          gsap.to(num, { x: normalizedX * -6, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        }
        if (name) {
          // Row hover natively shifts name by 10px (from components.css translateX(10px)),
          // so we blend the coordinate dynamically for added tactile response
          gsap.to(name, { x: 10 + (normalizedX * 16), duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        }
        if (techs) {
          gsap.to(techs, { x: normalizedX * 8, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        }
        if (arrow) {
          // Row hover natively shifts arrow by 5px, coordinate shifts it suttly further
          gsap.to(arrow, { x: 5 + (normalizedX * 24), duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
        }
      });

      row.addEventListener('mouseleave', () => {
        const num = row.querySelector('.project-num');
        const name = row.querySelector('.project-name');
        const techs = row.querySelector('.project-techs');
        const arrow = row.querySelector('.project-arrow');

        if (num) gsap.to(num, { x: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        if (name) gsap.to(name, { x: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        if (techs) gsap.to(techs, { x: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
        if (arrow) gsap.to(arrow, { x: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }
}
