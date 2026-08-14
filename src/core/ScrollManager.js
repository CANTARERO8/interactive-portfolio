import Lenis from 'lenis';
import gsap from 'gsap';

export class ScrollManager {
  constructor(app) {
    this.app = app;
    this.scroll = 0;
    this.targetScroll = 0;
    this.currentSection = 0;
    this.totalSections = 8;
    
    // Initialize Lenis Smooth Scroll
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential ease
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false
    });

    // Sync scroll event
    this.lenis.on('scroll', (e) => {
      // During smooth loop animation, still update so camera follows
      this.targetScroll = e.scroll;
      this.app.onScroll(e.progress);
    });

    // Bind navigation click events to scroll smoothly
    this.setupNavLinks();
    
    // Lerp animation loop
    this.app.engine.addTick(this.update.bind(this));
  }

  // Setup header link smooth scroll targeting
  setupNavLinks() {
    const links = document.querySelectorAll('.scroll-to');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        if (window.soundManager) window.soundManager.playClick();
      });
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.soundManager) window.soundManager.playChirp();
        const targetIdx = parseInt(link.getAttribute('data-target'), 10);
        this.scrollToSection(targetIdx);
      });
    });
  }

  // Animate scroll to a specific section index with Hyperspace Warp Jump
  scrollToSection(index) {
    if (index < 0 || index >= this.totalSections) return;
    
    const viewportHeight = window.innerHeight;
    const targetY = index * viewportHeight;
    const sectionDiff = Math.abs(index - this.currentSection);

    // Trigger Hyperspace Warp Speed effect!
    if (sectionDiff >= 1) {
      this.triggerWarpJump(targetY, 1.5);
    } else {
      this.lenis.scrollTo(targetY, {
        duration: 1.2,
        immediate: false
      });
    }
  }

  triggerWarpJump(targetY, duration = 1.5) {
    // 1. Play procedural warp sound
    if (window.soundManager && window.soundManager.playWarpJump) {
      window.soundManager.playWarpJump();
    }

    // 2. Expand camera FOV dynamically for warp tunnel vision
    if (this.app.engine) {
      this.app.engine.setFov(105);
      setTimeout(() => {
        this.app.engine.setFov(55);
      }, duration * 480);
    }

    // 3. Accelerate particles into warp streak lines
    if (this.app.particles && this.app.particles.triggerWarpSpeed) {
      this.app.particles.triggerWarpSpeed(duration);
    }

    // 4. Smooth Lenis scroll to target
    this.lenis.scrollTo(targetY, {
      duration: duration,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      immediate: false
    });
  }

  // Smooth loop animation loop callback
  loopEase(t) {
    return Math.min(1, 1.001 - Math.pow(2, -10 * t));
  }

  // Custom wrap animation (like joseph-san.com style)
  animateWrap(targetY) {
    if (this.isWrapping) return;
    this.isWrapping = true;

    const overlay = document.getElementById('transition-overlay');
    
    if (overlay) {
      // 1. Smoothly fade the screen to a deep cosmic space void (opacity: 1)
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: () => {
          // 2. Instantly jump to target position under the invisible cover
          this.lenis.scrollTo(targetY, {
            immediate: true
          });
          
          // Force update scroll position immediately so the camera moves before fading in
          this.targetScroll = targetY;
          this.scroll = targetY;
          const viewportHeight = window.innerHeight;
          this.app.onScroll(targetY / ((this.totalSections - 1) * viewportHeight));
          
          // 3. Smoothly fade the environment back in (opacity: 0)
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.7,
            delay: 0.1,
            ease: 'power2.inOut',
            onComplete: () => {
              this.isWrapping = false;
            }
          });
        }
      });
    } else {
      // Fallback
      this.lenis.scrollTo(targetY, {
        duration: 2.2,
        easing: this.loopEase,
        immediate: false,
        onComplete: () => {
          this.isWrapping = false;
        }
      });
    }
  }

  // Smooth out the scroll values via linear interpolation (lerp)
  update(deltaTime, elapsedTime) {
    const viewportHeight = window.innerHeight;
    const maxScroll = (this.totalSections - 1) * viewportHeight;
    
    // Smooth circular loop — like joseph-san.com
    if (!this.isWrapping) {
      const scrollBottom = this.lenis.limit || maxScroll;
      // Bottom reached → smooth scroll back to top (only triggers if scrolling PAST the footer portal)
      if (this.targetScroll >= scrollBottom + 80) {
        this.animateWrap(0);
      }
      // Only wrap top→bottom if user actively scrolls past the top (negative)
      if (this.targetScroll <= -80) {
        this.animateWrap(scrollBottom);
      }
    }

    // Drive Lenis tick
    this.lenis.raf(elapsedTime * 1000);
    
    // Lerp our virtual scroll value towards target
    this.scroll += (this.targetScroll - this.scroll) * 0.08;
    
    // Map current height to section index (0 to 5)
    const newSection = Math.round(this.scroll / viewportHeight);
    
    // Suppress section changes during wrap to avoid DOM flicker
    if (!this.isWrapping && newSection !== this.currentSection && newSection >= 0 && newSection < this.totalSections) {
      const oldSection = this.currentSection;
      this.currentSection = newSection;
      this.app.onSectionChange(this.currentSection, oldSection);
    }
  }
}
