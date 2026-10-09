import Lenis from "lenis";
import gsap from "gsap";

export class ScrollManager {
  constructor(app) {
    this.app = app;
    this.scroll = 0;
    this.targetScroll = 0;
    this.currentSection = 0;
    this.totalSections = 8;
    this.isWarpJumping = false;
    this.isWrapping = false;
    this.targetSectionIndex = null;
    
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false
    });

    this.lenis.on("scroll", (e) => {
      this.targetScroll = e.scroll;
      this.app.onScroll(e.progress);
    });

    this.setupNavLinks();
    this.checkInitialHash();
    
    this.app.engine.addTick(this.update.bind(this));
  }

  checkInitialHash() {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const sectionIds = ["hero", "about", "projects", "vue-frontend", "laravel-backend", "postgresql-showcase", "wordpress-cms", "contact"];
    const aliases = {
      "vue": "vue-frontend",
      "laravel": "laravel-backend",
      "postgres": "postgresql-showcase",
      "postgresql": "postgresql-showcase",
      "wordpress": "wordpress-cms",
      "portal": "contact",
      "works": "projects"
    };
    const resolved = aliases[hash] || hash;
    const idx = sectionIds.indexOf(resolved);
    if (idx >= 0) {
      setTimeout(() => {
        this.scrollToSection(idx, true);
      }, 350);
    }
  }

  setupNavLinks() {
    const links = document.querySelectorAll(".scroll-to");
    links.forEach(link => {
      link.addEventListener("mouseenter", () => {
        if (window.soundManager) window.soundManager.playClick();
      });
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.soundManager) window.soundManager.playChirp();
        const targetIdx = parseInt(link.getAttribute("data-target"), 10);
        this.scrollToSection(targetIdx);
      });
    });
  }

  scrollToSection(index, immediate = false) {
    if (index < 0 || index >= this.totalSections) return;
    
    const viewportHeight = window.innerHeight;
    const targetY = index * viewportHeight;

    if (immediate) {
      this.lenis.scrollTo(targetY, { immediate: true });
      this.targetScroll = targetY;
      this.scroll = targetY;
      const progress = targetY / ((this.totalSections - 1) * viewportHeight);
      this.app.onScroll(progress);
      this.currentSection = index;
      if (this.app.onSectionArrival) {
        this.app.onSectionArrival(index);
      }
      return;
    }

    const sectionDiff = Math.abs(index - this.currentSection);

    if (sectionDiff >= 1) {
      this.triggerWarpJump(targetY, 1.4, index);
    } else {
      this.lenis.scrollTo(targetY, {
        duration: 1.1,
        immediate: false,
        onComplete: () => {
          this.currentSection = index;
          if (this.app.onSectionArrival) {
            this.app.onSectionArrival(index);
          }
        }
      });
    }
  }

  triggerWarpJump(targetY, duration = 1.4, targetIndex = null) {
    const resolvedIndex = targetIndex !== null ? targetIndex : Math.round(targetY / window.innerHeight);
    this.isWarpJumping = true;
    this.targetSectionIndex = resolvedIndex;

    if (window.soundManager && window.soundManager.playWarpJump) {
      window.soundManager.playWarpJump();
    }

    if (this.app.engine) {
      this.app.engine.setFov(102);
      setTimeout(() => {
        this.app.engine.setFov(55);
      }, duration * 460);
    }

    if (this.app.particles && this.app.particles.triggerWarpSpeed) {
      this.app.particles.triggerWarpSpeed(duration);
    }

    this.lenis.scrollTo(targetY, {
      duration: duration,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      immediate: false,
      onComplete: () => {
        this.isWarpJumping = false;
        this.scroll = targetY;
        this.targetScroll = targetY;
        this.currentSection = resolvedIndex;
        if (this.app.onSectionArrival) {
          this.app.onSectionArrival(resolvedIndex);
        }
      }
    });
  }

  loopEase(t) {
    return Math.min(1, 1.001 - Math.pow(2, -10 * t));
  }

  animateWrap(targetY) {
    if (this.isWrapping) return;
    this.isWrapping = true;

    const overlay = document.getElementById("transition-overlay");
    
    if (overlay) {
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          this.lenis.scrollTo(targetY, {
            immediate: true
          });
          
          this.targetScroll = targetY;
          this.scroll = targetY;
          const viewportHeight = window.innerHeight;
          this.app.onScroll(targetY / ((this.totalSections - 1) * viewportHeight));
          
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.7,
            delay: 0.1,
            ease: "power2.inOut",
            onComplete: () => {
              this.isWrapping = false;
            }
          });
        }
      });
    } else {
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

  update(deltaTime, elapsedTime) {
    const viewportHeight = window.innerHeight;
    const maxScroll = (this.totalSections - 1) * viewportHeight;
    
    if (!this.isWrapping) {
      const scrollBottom = this.lenis.limit || maxScroll;
      
      if (this.targetScroll >= scrollBottom + 80) {
        this.animateWrap(0);
      }
      
      if (this.targetScroll <= -80) {
        this.animateWrap(scrollBottom);
      }
    }

    this.lenis.raf(elapsedTime * 1000);
    
    this.scroll = this.targetScroll;
    
    const newSection = Math.round(this.scroll / viewportHeight);
    
    if (!this.isWrapping && !this.isWarpJumping && newSection !== this.currentSection && newSection >= 0 && newSection < this.totalSections) {
      const oldSection = this.currentSection;
      this.currentSection = newSection;
      this.app.onSectionChange(this.currentSection, oldSection);
    }
  }
}
