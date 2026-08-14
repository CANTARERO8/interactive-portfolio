import gsap from 'gsap';

export class ScrollCounters {
  constructor() {
    this.initObservers();
  }

  initObservers() {
    const targets = document.querySelectorAll('.metric-card');
    if (!targets.length) return;

    // Set up a standard IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          
          // Trigger the counter/scramble animations
          this.animateElement(card);

          // Stop observing this element once triggered to prevent repetitive restarts on scrolling
          observer.unobserve(card);
        }
      });
    }, {
      threshold: 0.15, // trigger when 15% visible
      rootMargin: '0px 0px -5% 0px' // adjust bottom trigger safety margins
    });

    targets.forEach(target => observer.observe(target));
  }

  animateElement(container) {
    // 1. Neon stroboscopic flash
    container.classList.add('strobe-active-cyan');
    setTimeout(() => {
      container.classList.remove('strobe-active-cyan');
    }, 600);

    // 2. Animate child values
    const numEl = container.querySelector('.metric-num');
    const specValEl = container.querySelector('.spec-value');
    const targetEl = numEl || specValEl;
    
    if (!targetEl) return;

    // Cache the original innerText
    // If we've already split the element into char-spans or word-spans for scroll parallax,
    // let's grab the raw text content!
    const originalText = targetEl.textContent.trim().replace(/\u00a0/g, ' ');
    
    // Parse numeric parts
    const digitRegex = /(\d+)/;
    const match = originalText.match(digitRegex);

    if (match) {
      // Numerical count-up or count-down!
      const targetVal = parseInt(match[1], 10);
      const prefix = originalText.substring(0, match.index);
      const suffix = originalText.substring(match.index + match[0].length);
      
      const isCountDown = prefix.includes('<');
      const startVal = isCountDown ? 85 : 0; // count down from 85 if '< 15ms', else count up from 0
      
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
      // Pure text decryption/scramble!
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
              return char; // resolved character
            } else if (currentProgress >= charProgress - 0.22) {
              // active decrypting cyberpunk glyph
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            } else {
              // hidden/empty character
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
