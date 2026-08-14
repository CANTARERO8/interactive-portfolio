import gsap from 'gsap';

export class TextInteractions {
  constructor() {
    this.tickerInterval = null;
    this.tickerActive = true;
    this.tickerIndex = 0;
    
    this.diagnosticStatements = [
      '[ SYSTEMS CORE ACTIVE // OK ]',
      '[ TELEMETRY SCANNER // 60 FPS ]',
      '[ QUANTUM ENVELOPE // SECURE ]',
      '[ THREADPOOL CORES // STABLE ]',
      '[ COMPILER COGNITION // READY ]'
    ];

    this.initHoverScrambles();
    this.initTitleJitters();
    this.initMutatingTicker();
    
    // Continuous background triggers (Autonomous mainframes loop!)
    this.initAutoMemoryTicker();
    this.initAutoScrambleLoop();
    this.initAutoCRTGlitches();
  }

  // ─── A. INTERACTIVE HOVER SCRAMBLE (DECRYPTION) ─────────────────────────
  initHoverScrambles() {
    const targets = document.querySelectorAll(
      '.project-tech-tag, .about-tag, .hero-subtitle, .scene-section .mono.sm, .contact-item'
    );
    
    // Pure digital code matrix glyphs: binary, terminal blocks, and tech symbols
    const glyphs = ['0', '1', 'X', 'Y', 'Z', 'A', 'B', 'C', '░', '▒', '▓', '█', '▄', '▀', '▲', '▼', '◀', '▶', '◆', '◇', '#', '$', '%', '&', '@', '*', '+', '-', '=', '?', '/', '\\', '!'];

    targets.forEach(tag => {
      const originalText = tag.textContent.trim().replace(/\u00a0/g, ' ');
      const chars = originalText.split('');
      let isScrambling = false;

      tag.addEventListener('mouseenter', () => {
        if (isScrambling) return;
        isScrambling = true;

        tag.style.color = '#ffffff'; // modern crisp white highlight during scramble
        tag.style.textShadow = 'none';

        const obj = { progress: 0 };
        gsap.to(obj, {
          progress: 1,
          duration: 0.5,
          ease: 'power1.out',
          onUpdate: () => {
            const currentProgress = obj.progress;
            tag.innerHTML = chars.map((char, index) => {
              if (char === ' ') return ' ';
              const charProgress = index / chars.length;
              if (currentProgress >= charProgress) {
                return char; // resolved
              } else if (currentProgress >= charProgress - 0.25) {
                // scrambling console glyph in gray
                const randomGlyph = glyphs[Math.floor(Math.random() * glyphs.length)];
                return `<span style="color:#94a3b8">${randomGlyph}</span>`;
              } else {
                return '';
              }
            }).join('');
          },
          onComplete: () => {
            tag.innerHTML = originalText;
            tag.style.color = '';
            isScrambling = false;
          }
        });
      });
    });

    // Hover scramble for .project-row -> .project-name
    const projectRows = document.querySelectorAll('.project-row');
    projectRows.forEach(row => {
      const nameEl = row.querySelector('.project-name');
      if (!nameEl) return;
      
      let isRowScrambling = false;
      row.addEventListener('mouseenter', () => {
        if (isRowScrambling) return;
        isRowScrambling = true;
        
        const chars = nameEl.querySelectorAll('.char-span');
        if (chars.length) {
          chars.forEach((char, idx) => {
            const originalChar = char.getAttribute('data-char') || char.textContent;
            if (originalChar === ' ' || originalChar === '\u00a0' || originalChar === '&nbsp;') return;
            
            const obj = { progress: 0 };
            gsap.to(obj, {
              progress: 1,
              duration: 0.42,
              delay: idx * 0.012, // rapid staggered sweep from left to right
              ease: 'power1.out',
              onStart: () => {
                gsap.set(char, { 
                  opacity: 1, 
                  color: '#ffffff',
                  textShadow: 'none'
                });
              },
              onUpdate: () => {
                if (obj.progress < 0.7) {
                  char.innerText = glyphs[Math.floor(Math.random() * glyphs.length)];
                  char.style.color = '#94a3b8'; // modern slate gray scrambling color
                } else {
                  char.innerText = originalChar;
                  char.style.color = '';
                }
              },
              onComplete: () => {
                char.innerText = originalChar;
                char.style.color = '';
                if (idx === chars.length - 1) {
                  isRowScrambling = false;
                }
              }
            });
          });
        } else {
          isRowScrambling = false;
        }
      });
    });
  }

  // ─── B. CHROMATIC SHADOW & POSITION JITTER ON TITLE HOVER ───────────────
  initTitleJitters() {
    const headings = document.querySelectorAll('.hero-title, .about-title, .footer-heading');
    
    headings.forEach(heading => {
      heading.addEventListener('mouseenter', () => {
        const chars = heading.querySelectorAll('.char-span');
        if (!chars.length) return;

        chars.forEach(char => {
          // 45% probability per character to glitch on title hover
          if (Math.random() > 0.45) {
            const shadowCyan = '3px -2px 0 rgba(0, 242, 254, 0.9)';
            const shadowPurple = '-3px 2px 0 rgba(168, 85, 247, 0.9)';
            const combinedShadow = `${shadowCyan}, ${shadowPurple}`;
            
            const tl = gsap.timeline();
            tl.to(char, { 
              textShadow: combinedShadow, 
              x: (Math.random() - 0.5) * 8,
              y: (Math.random() - 0.5) * 5,
              skewX: (Math.random() - 0.5) * 20,
              duration: 0.05,
              ease: 'power1.inOut'
            })
            .to(char, { 
              textShadow: 'none', 
              x: 0,
              y: 0,
              skewX: 0,
              duration: 0.05, 
              delay: 0.04,
              ease: 'power2.out'
            });
          }
        });
      });
    });
  }

  // ─── C. CONSTANTLY MUTATING DIAGNOSTIC TICKER ───────────────────────────
  initMutatingTicker() {
    const statusTag = document.getElementById('about-specs-status');
    if (!statusTag) return;

    const cycleTicker = () => {
      // Don't cycle statements if overclock is active (overclock syncer locks the text alert)
      const isOverclocked = window.APP_INSTANCE && window.APP_INSTANCE.isOverclocked;
      if (isOverclocked) return;

      this.tickerIndex = (this.tickerIndex + 1) % this.diagnosticStatements.length;
      const nextStatement = this.diagnosticStatements[this.tickerIndex];
      
      this.transitionText(statusTag, nextStatement);
    };

    // Cycle diagnostic logs every 4 seconds
    this.tickerInterval = setInterval(cycleTicker, 4000);
  }

  // Scramble transition helper
  transitionText(element, targetText) {
    const chars = targetText.split('');
    const glyphs = ['0', '1', '$', '%', '&', '@', '#', '▲', '▼', '*'];
    const obj = { progress: 0 };

    gsap.to(obj, {
      progress: 1,
      duration: 0.8,
      ease: 'power1.out',
      onUpdate: () => {
        const currentProgress = obj.progress;
        element.innerHTML = chars.map((char, index) => {
          if (char === ' ') return ' ';
          const charProgress = index / chars.length;
          if (currentProgress >= charProgress) {
            return char; // resolved
          } else if (currentProgress >= charProgress - 0.25) {
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          } else {
            return '';
          }
        }).join('');
      },
      onComplete: () => {
        element.innerHTML = targetText;
      }
    });
  }

  // ─── D. HIGH-SPEED DYNAMIC HEX ADDRESS MUTATOR (150ms Loop) ────────────
  initAutoMemoryTicker() {
    const addrEl = document.getElementById('hud-addr-val');
    if (!addrEl) return;

    const hexChars = '0123456789ABCDEF';
    setInterval(() => {
      let reg = '0x';
      for (let i = 0; i < 4; i++) {
        reg += hexChars[Math.floor(Math.random() * hexChars.length)];
      }
      addrEl.innerText = reg;
    }, 150);
  }

  // ─── E. AUTONOMOUS BACKGROUND SCRAMBLE LOOP (Cycles Randomly Every 3s) ──
  initAutoScrambleLoop() {
    const tags = document.querySelectorAll(
      '.project-tech-tag, .about-tag, .hero-subtitle, .scene-section .mono.sm'
    );
    if (!tags.length) return;

    const triggerRandomScramble = () => {
      const tag = tags[Math.floor(Math.random() * tags.length)];
      if (!tag) return;

      const originalText = tag.textContent.trim().replace(/\u00a0/g, ' ');
      const chars = originalText.split('');
      
      // Pure digital console matrix glyphs
      const glyphs = ['0', '1', 'X', 'Y', 'Z', 'A', 'B', 'C', '░', '▒', '▓', '█', '▄', '▀', '▲', '▼', '◀', '▶', '◆', '◇', '#', '$', '%', '&', '@', '*', '+', '-', '=', '?', '/', '\\', '!'];
      
      const obj = { progress: 0 };
      
      gsap.to(obj, {
        progress: 1,
        duration: 0.55,
        ease: 'power1.out',
        onStart: () => {
          tag.style.color = '#ffffff'; // modern crisp white highlight
          tag.style.textShadow = 'none'; // absolutely no neon drop shadow
        },
        onUpdate: () => {
          const currentProgress = obj.progress;
          tag.innerHTML = chars.map((char, index) => {
            if (char === ' ') return ' ';
            const charProgress = index / chars.length;
            if (currentProgress >= charProgress) {
              return char;
            } else if (currentProgress >= charProgress - 0.25) {
              const randomGlyph = glyphs[Math.floor(Math.random() * glyphs.length)];
              return `<span style="color:#94a3b8">${randomGlyph}</span>`; // slate gray scrambling character
            } else {
              return '';
            }
          }).join('');
        },
        onComplete: () => {
          tag.innerHTML = originalText;
          tag.style.color = '';
          tag.style.textShadow = '';
        }
      });

      // Repeat every 3 to 4.5 seconds
      setTimeout(triggerRandomScramble, 3000 + Math.random() * 1500);
    };

    setTimeout(triggerRandomScramble, 2500);
  }

  // ─── F. AUTONOMOUS CRT CARD GLITCH & FLICKER (Every 2s Loop) ────────────
  initAutoCRTGlitches() {
    const cards = document.querySelectorAll('.metric-card, #cyber-hud, #about-profile-specs, .showcase-code-panel');
    if (!cards.length) return;

    const triggerAutoGlitch = () => {
      const card = cards[Math.floor(Math.random() * cards.length)];
      if (!card) return;

      const tl = gsap.timeline();
      
      tl.to(card, { opacity: 0.35, skewX: 1.2, duration: 0.03, ease: 'power1.inOut' })
        .to(card, { opacity: 1, skewX: 0, duration: 0.04, ease: 'power1.inOut' })
        .to(card, { opacity: 0.6, duration: 0.02, ease: 'power1.inOut' })
        .to(card, { opacity: 1, duration: 0.04, ease: 'power2.out' });

      // Repeat every 2.2 to 3.8 seconds
      setTimeout(triggerAutoGlitch, 2200 + Math.random() * 1600);
    };

    setTimeout(triggerAutoGlitch, 3500);
  }

  // Overclock Trigger Interface - instantly updates ticker content
  syncOverclockState(isOverclocked) {
    const statusTag = document.getElementById('about-specs-status');
    if (!statusTag) return;

    if (isOverclocked) {
      statusTag.classList.add('overclocked');
      statusTag.innerHTML = '[ 🚨 WARNING: OVERCLOCK CORE PEAK LOAD 🚨 ]';
    } else {
      statusTag.classList.remove('overclocked');
      const currentStatement = this.diagnosticStatements[this.tickerIndex];
      this.transitionText(statusTag, currentStatement);
    }
  }
}
