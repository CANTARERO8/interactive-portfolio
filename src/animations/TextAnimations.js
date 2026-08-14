import gsap from 'gsap';

export class TextAnimations {
  constructor() {
    this.splitTitles();
    this.splitContentText();
    this.animatedSections = new Set();
  }

  // ─── BOOT: called once after the loader finishes ───────────────────────
  bootAnimations() {
    this.animatedSections.delete('hero');
    document.querySelectorAll('#hero .scramble-revealed').forEach(el => el.classList.remove('scramble-revealed'));

    this.animateHeroFloat();
    this.animateSectionIn('hero');
    this.glitchHeroDescription();
    this.glitchHeroTitle();
  }

  // ─── 1. SPLIT TITLES INTO CHARACTERS ──────────────────────────────────
  splitTitles() {
    const titles = document.querySelectorAll(
      '#hero-main-title, #about-title-heading, #vue-title-heading, #laravel-title-heading, #postgresql-title-heading, #wordpress-title-heading, #footer-main-heading'
    );

    titles.forEach(title => {
      if (title.classList.contains('split-done')) return;

      const lines = title.innerHTML.split(/<br\s*\/?>/i);
      let newHTML = '';
      let charIdx = 0; // Initialize character counter for staggered animation delays

      lines.forEach((line, lineIdx) => {
        const hasSpan = /<span/i.test(line);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = line;
        const innerText = (tempDiv.innerText || tempDiv.textContent || '').replace(/\r?\n|\r/g, '').trim();

        let lineSpans = '';
        for (let char of innerText) {
          if (char === ' ') {
            lineSpans += '<span class="char-span" style="display:inline-block;width:0.25em">&nbsp;</span>';
          } else {
            // Set data-char attribute and --char-idx CSS custom property for wave calculations
            lineSpans += `<span class="char-span" data-char="${char}" style="display:inline-block;opacity:0;--char-idx:${charIdx}">${char}</span>`;
            charIdx++;
          }
        }

        const lineContent = hasSpan ? `<span>${lineSpans}</span>` : lineSpans;
        newHTML += `<div class="line-wrapper" style="overflow:visible;display:block">${lineContent}</div>`;
        if (lineIdx < lines.length - 1) newHTML += '<br />';
      });

      title.innerHTML = newHTML;
      title.classList.add('split-done');
    });
  }

  // ─── 2. SPLIT CONTENT TEXT (subtitles→chars, paragraphs→words) ───────
  splitContentText() {
    // Subtitles → chars
    document.querySelectorAll('.scene-section .mono.sm').forEach(el => {
      if (el.classList.contains('split-done')) return;
      const text = el.textContent;
      let html = '';
      for (let char of text) {
        if (char === ' ') {
          html += '<span class="char-span" style="display:inline-block;width:0.25em">&nbsp;</span>';
        } else {
          html += `<span class="char-span" data-char="${char}" style="display:inline-block;opacity:0">${char}</span>`;
        }
      }
      el.innerHTML = html;
      el.classList.add('split-done');
    });

    // Hero description → characters (for glitch effect, excluded from scroll reveal)
    const heroDesc = document.querySelector('#hero-description');
    if (heroDesc && !heroDesc.classList.contains('split-done')) {
      const text = heroDesc.textContent;
      let html = '';
      for (let char of text) {
        html += `<span class="char-span glitch-char" style="display:inline-block;opacity:1;color:var(--color-text-sub)">${char === ' ' ? '&nbsp;' : char}</span>`;
      }
      heroDesc.innerHTML = html;
      heroDesc.classList.add('split-done');
    }

    // Other paragraphs → words
    document.querySelectorAll('.about-text, .footer-credits').forEach(el => {
      if (el.classList.contains('split-done')) return;
      const words = el.textContent.trim().split(/\s+/);
      let html = '';
      words.forEach((word, i) => {
        html += `<span class="word-span" style="display:inline-block;opacity:0">${word}${i < words.length - 1 ? '&nbsp;' : ''}</span>`;
      });
      el.innerHTML = html;
      el.classList.add('split-done');
    });

    // Spec values → chars
    document.querySelectorAll('.spec-value').forEach(el => {
      if (el.classList.contains('split-done')) return;
      const text = el.textContent;
      let html = '';
      for (let char of text) {
        if (char === ' ') {
          html += '<span class="char-span" style="display:inline-block;width:0.25em">&nbsp;</span>';
        } else {
          html += `<span class="char-span" data-char="${char}" style="display:inline-block;opacity:0">${char}</span>`;
        }
      }
      el.innerHTML = html;
      el.classList.add('split-done');
    });

    // Metric labels → words
    document.querySelectorAll('.metric-label').forEach(el => {
      if (el.classList.contains('split-done')) return;
      const words = el.textContent.trim().split(/\s+/);
      let html = '';
      words.forEach((word, i) => {
        html += `<span class="word-span" style="display:inline-block;opacity:0">${word}${i < words.length - 1 ? '&nbsp;' : ''}</span>`;
      });
      el.innerHTML = html;
      el.classList.add('split-done');
    });

    // Project names → chars
    document.querySelectorAll('.project-name').forEach(el => {
      if (el.classList.contains('split-done')) return;
      const text = el.textContent;
      let html = '';
      for (let char of text) {
        if (char === ' ') {
          html += '<span class="char-span" style="display:inline-block;width:0.25em">&nbsp;</span>';
        } else {
          html += `<span class="char-span" data-char="${char}" style="display:inline-block;opacity:0">${char}</span>`;
        }
      }
      el.innerHTML = html;
      el.classList.add('split-done');
    });
  }

  // ─── 3. CONTINUOUS FLOATING ON HERO SUBTITLE ──────────────────────────
  animateHeroFloat() {
    const tag = document.querySelector('#hero-subtitle-tag');
    if (!tag) return;

    gsap.to(tag, {
      y: -4,
      duration: 2.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // ─── 4. PERIODIC GLITCH ON HERO DESCRIPTION ──────────────────────────
  glitchHeroDescription() {
    const chars = document.querySelectorAll('#hero-description .glitch-char');
    if (!chars.length) return;

    const glitch = () => {
      // Pick 2-6 random characters to glitch
      const count = 2 + Math.floor(Math.random() * 5);
      const indices = new Set();
      while (indices.size < count && indices.size < chars.length) {
        indices.add(Math.floor(Math.random() * chars.length));
      }

      indices.forEach(idx => {
        const char = chars[idx];
        const type = Math.floor(Math.random() * 4);

        if (type === 0) {
          // Flicker off/on
          gsap.to(char, { opacity: 0.05, duration: 0.02 });
          gsap.to(char, { opacity: 0.7, duration: 0.04, delay: 0.05 });
          gsap.to(char, { opacity: 1, duration: 0.06, delay: 0.12 });
        } else if (type === 1) {
          // Shift + flicker
          gsap.to(char, { x: (Math.random() - 0.5) * 6, opacity: 0.2, duration: 0.03 });
          gsap.to(char, { x: 0, opacity: 1, duration: 0.08, delay: 0.06 });
        } else if (type === 2) {
          // Color corruption
          gsap.to(char, { color: '#00f2fe', duration: 0.02 });
          gsap.to(char, { color: '#a855f7', duration: 0.03, delay: 0.04 });
          gsap.to(char, { color: '', duration: 0.06, delay: 0.1 });
        } else {
          // Blink + scale
          gsap.to(char, { opacity: 0.1, scale: 0.8, duration: 0.02 });
          gsap.to(char, { opacity: 1, scale: 1, duration: 0.07, delay: 0.05 });
        }
      });

      // Next glitch in 1.5 - 6 seconds
      setTimeout(glitch, 1500 + Math.random() * 4500);
    };

    setTimeout(glitch, 2000);
  }

  // ─── 4.5 PERIODIC HOLOGRAPHIC GLITCH ON HERO TITLE ────────────────────
  glitchHeroTitle() {
    const chars = document.querySelectorAll('#hero-main-title .char-span');
    if (!chars.length) return;

    const glitch = () => {
      const count = 1 + Math.floor(Math.random() * 3);
      const indices = new Set();
      while (indices.size < count) {
        indices.add(Math.floor(Math.random() * chars.length));
      }

      indices.forEach(idx => {
        const char = chars[idx];
        
        // Chromatic split & blur text shadows
        const shadowCyan = '2px -1px 0 rgba(0, 242, 254, 0.8)';
        const shadowPurple = '-2px 1px 0 rgba(168, 85, 247, 0.8)';
        const combinedShadow = `${shadowCyan}, ${shadowPurple}, 0 0 15px rgba(0, 242, 254, 0.3)`;

        const tl = gsap.timeline();
        tl.to(char, { 
          textShadow: combinedShadow, 
          filter: 'blur(3px)',
          x: (Math.random() - 0.5) * 4,
          duration: 0.05 
        })
        .to(char, { 
          textShadow: 'none', 
          filter: 'blur(0px)',
          x: 0,
          duration: 0.08, 
          delay: 0.06 
        });
      });

      setTimeout(glitch, 2000 + Math.random() * 4000);
    };

    setTimeout(glitch, 3000);
  }

  // ─── 5. STAGGER TECH METRIC CARDS ─────────────────────────────────────
  staggerCards(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const cards = section.querySelectorAll('.metric-card');
    if (!cards.length) return;

    gsap.fromTo(cards,
      { opacity: 0, y: 20 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.7
      }
    );
  }

  // ─── 5. STAGGER PROJECT ROWS ──────────────────────────────────────────
  staggerProjectRows(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const rows = section.querySelectorAll('.project-row');
    if (!rows.length) return;

    gsap.fromTo(rows,
      { opacity: 0, x: -25 },
      {
        opacity: 1, x: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
        delay: 0.5
      }
    );
  }

  // ─── 6. STAGGER ABOUT SPEC ITEMS ──────────────────────────────────────
  staggerAboutSpecs(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const items = section.querySelectorAll('.spec-item');
    if (!items.length) return;

    gsap.fromTo(items,
      { opacity: 0, y: 15 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.6
      }
    );
  }

  // ─── 7. SECTION ENTRANCE ──────────────────────────────────────────────
  animateSectionIn(sectionId) {
    if (this.animatedSections.has(sectionId)) return;
    this.animatedSections.add(sectionId);

    this.staggerCards(sectionId);
    this.staggerProjectRows(sectionId);
    this.staggerAboutSpecs(sectionId);
    
    // Scramble reveal titles/subtitles, and stagger paragraphs in place (no translateY sliding!)
    this.scrambleRevealText(sectionId);
  }

  // ─── 7.5 UNIFIED SCRAMBLE DECRYPT REVEAL ──────────────────────────────
  scrambleRevealText(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    // Elements to scramble decrypt: subtitles, tags, project names, spec values, and main titles!
    const targets = section.querySelectorAll(
      '.mono.sm, .project-name, .spec-value, .hero-title, .about-title, .footer-heading'
    );

    targets.forEach(target => {
      // Ensure we only reveal once per section load
      if (target.classList.contains('scramble-revealed')) return;
      target.classList.add('scramble-revealed');

      const chars = target.querySelectorAll('.char-span');
      if (chars.length) {
        // Force initial opacity to 0 and clear translateY transitions
        gsap.set(chars, { opacity: 0, x: 0, y: 0, scale: 1 });
        
        // Pure digital code matrix glyphs: binary, terminal blocks, and tech symbols
        const glyphs = ['0', '1', 'X', 'Y', 'Z', 'A', 'B', 'C', '░', '▒', '▓', '█', '▄', '▀', '▲', '▼', '◀', '▶', '◆', '◇', '#', '$', '%', '&', '@', '*', '+', '-', '=', '?', '/', '\\', '!'];

        chars.forEach((char, idx) => {
          const originalChar = char.getAttribute('data-char') || char.textContent;
          
          // Instantly reveal space characters
          if (originalChar === ' ' || originalChar === '\u00a0' || originalChar === '&nbsp;') {
            gsap.set(char, { opacity: 1, y: 0 });
            return;
          }

          const obj = { progress: 0 };
          gsap.to(obj, {
            progress: 1,
            duration: 0.8,      // High performance fraction-of-a-second timing
            delay: idx * 0.02,  // Balanced stagger sweep delay
            ease: 'power1.out',
            onStart: () => {
              // Highlight letter in crisp pure white during decryption (NO GLOWING NEON)
              gsap.set(char, { 
                opacity: 1, 
                y: 0, 
                color: '#ffffff',
                webkitTextFillColor: '#ffffff',
                textShadow: 'none'
              });
            },
            onUpdate: () => {
              if (obj.progress < 0.72) {
                char.innerText = glyphs[Math.floor(Math.random() * glyphs.length)];
                char.style.color = '#94a3b8'; // modern slate gray scrambling color
                char.style.webkitTextFillColor = '#94a3b8';
              } else {
                char.innerText = originalChar;
                char.style.color = '';
                char.style.webkitTextFillColor = '';
                char.style.textShadow = '';
              }
            },
            onComplete: () => {
              char.innerText = originalChar;
              char.style.color = '';
              char.style.webkitTextFillColor = '';
              char.style.textShadow = '';
            }
          });
        });
      }
    });

    // Stagger fade-in paragraph words in place with zero translations from below!
    const paragraphWords = section.querySelectorAll('.about-text .word-span, .footer-credits .word-span, .metric-label .word-span');
    if (paragraphWords.length) {
      // Check if already revealed
      if (!paragraphWords[0].classList.contains('revealed-word')) {
        paragraphWords.forEach(w => w.classList.add('revealed-word'));
        
        gsap.fromTo(paragraphWords,
          { opacity: 0, scale: 0.96, y: 0 },
          {
            opacity: 1, scale: 1, y: 0,
            duration: 0.5,
            stagger: 0.01,
            ease: 'power2.out',
            overwrite: 'auto'
          }
        );
      }
    }
  }

  // ─── 8. FLICKER REVEAL (kept for potential use) ──────────────────────
  flickerReveal(elementSelector, delay = 0) {
    const element = document.querySelector(elementSelector);
    if (!element) return;

    const tl = gsap.timeline({ delay });
    tl.to(element, { opacity: 0.1, duration: 0.05 })
      .to(element, { opacity: 0.6, duration: 0.03 })
      .to(element, { opacity: 0.2, duration: 0.08 })
      .to(element, { opacity: 0.9, duration: 0.04 })
      .to(element, { opacity: 0.4, duration: 0.06 })
      .to(element, { opacity: 1, duration: 0.1 });
  }
}
