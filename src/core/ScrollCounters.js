import gsap from 'gsap';

export class ScrollCounters {
  constructor() {
    this.initObservers();
  }

  initObservers() {
    const targets = document.querySelectorAll('.metric-card');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          
          this.animateElement(card);

          observer.unobserve(card);
        }
      });
    }, {
      threshold: 0.15, 
      rootMargin: '0px 0px -5% 0px' 
    });

    targets.forEach(target => observer.observe(target));
  }

  animateElement(container) {
    
    container.classList.add('strobe-active-cyan');
    setTimeout(() => {
      container.classList.remove('strobe-active-cyan');
    }, 600);

    const numEl = container.querySelector('.metric-num');
    const specValEl = container.querySelector('.spec-value');
    const targetEl = numEl || specValEl;
    
    if (!targetEl) return;

    const originalText = targetEl.textContent.trim().replace(/\u00a0/g, ' ');
    
    const digitRegex = /(\d+)/;
    const match = originalText.match(digitRegex);

    if (match) {
      
      const targetVal = parseInt(match[1], 10);
      const prefix = originalText.substring(0, match.index);
      const suffix = originalText.substring(match.index + match[0].length);
      
      const isCountDown = prefix.includes('<');
      const startVal = isCountDown ? 85 : 0; 
      
      const obj = { val: startVal };
      
      gsap.to(obj, {
        val: targetVal,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          const currentVal = Math.round(obj.val);
          targetEl.innerHTML = `${prefix}${currentVal}${suffix}`;
        },
        onComplete: () => {
          targetEl.innerHTML = originalText;
        }
      });
    } else {
      
      const chars = originalText.split('');
      const glyphs = ['0', '1', '$', '%', '&', '@', '#', '▲', '▼', 'X', 'Y', 'Z', '*', '+', '=', '?', '§'];
      const obj = { progress: 0 };
      
      gsap.to(obj, {
        progress: 1,
        duration: 1.0,
        ease: 'power1.out',
        onUpdate: () => {
          const currentProgress = obj.progress;
          const result = chars.map((char, index) => {
            if (char === ' ') return ' ';
            const charProgress = index / chars.length;
            if (currentProgress >= charProgress) {
              return char; 
            } else if (currentProgress >= charProgress - 0.22) {
              
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            } else {
              
              return '';
            }
          }).join('');
          
          targetEl.innerHTML = result;
        },
        onComplete: () => {
          targetEl.innerHTML = originalText;
        }
      });
    }
  }
}
