---
name: gsap-pro
description: >-
  Expert engineering rules and production patterns for GSAP 3, ScrollTrigger, Lenis
  smooth scroll, @gsap/react useGSAP hook, Canvas 360 scrubbing, and cinematic text reveals.
  Use when building high-performance, award-winning animated web interfaces.
---

# GSAP Pro & Cinematic Motion Engineering

Expert patterns for building smooth 60/120 FPS web animations using GSAP 3, ScrollTrigger, and Lenis in modern React / Vite environments.

## 1. Core Principles

1. **Clean Lifecycle & Memory Safety:**
   - Always use `@gsap/react`'s `useGSAP()` hook or wrap tweens inside `gsap.context((self) => { ... }, containerRef)`.
   - Never leave uncleaned timelines or ScrollTriggers on unmount.
2. **Smooth Scroll Synchronization (Lenis + ScrollTrigger):**
   - Connect Lenis to ScrollTrigger via GSAP's ticker:
   ```javascript
   import Lenis from 'lenis';
   import gsap from 'gsap';
   import { ScrollTrigger } from 'gsap/ScrollTrigger';

   gsap.registerPlugin(ScrollTrigger);

   const lenis = new Lenis({
     duration: 1.2,
     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
     smoothWheel: true,
   });

   lenis.on('scroll', ScrollTrigger.update);

   gsap.ticker.add((time) => {
     lenis.raf(time * 1000);
   });

   gsap.ticker.lagSmoothing(0);
   ```
3. **Hardware Acceleration:**
   - Animate `x`, `y`, `scale`, `rotation`, and `opacity` (composite properties).
   - Avoid animating `top`, `left`, `width`, `height`, or `margin` directly.
   - Use `will-change: transform` only on active animating elements, and remove it when idle.

## 2. React Integration with `useGSAP`

```jsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

    tl.from('.hero-badge', { y: 20, opacity: 0, delay: 0.2 })
      .from('.hero-title-line', { y: 60, opacity: 0, stagger: 0.15 }, '-=0.6')
      .from('.hero-cta', { scale: 0.9, opacity: 0, duration: 0.8 }, '-=0.4');

    ScrollTrigger.create({
      trigger: container.current,
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 1,
      animation: gsap.to('.hero-bg', { scale: 1.15, filter: 'blur(10px)' }),
    });
  }, { scope: container });

  return <section ref={container}>...</section>;
}
```

## 3. Canvas 360-Degree Image Sequence Scrubber

For ultra-smooth product rotation without the heavy overhead of Three.js:

```javascript
export function initCanvasScrubber(canvas, images, triggerElement) {
  const ctx = canvas.getContext('2d');
  const frameCount = images.length;
  const helmetState = { frame: 0 };

  const render = () => {
    const img = images[helmetState.frame];
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  };

  gsap.to(helmetState, {
    frame: frameCount - 1,
    snap: 'frame',
    ease: 'none',
    scrollTrigger: {
      trigger: triggerElement,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 0.5,
      onUpdate: render,
    },
  });
}
```

## 4. Responsive Motion (`ScrollTrigger.matchMedia`)

```javascript
let mm = gsap.matchMedia();

mm.add('(min-width: 768px)', () => {
  // Desktop animations: Pinned cards, heavy scrubbers
  ScrollTrigger.create({
    trigger: '.showcase',
    pin: true,
    scrub: 1,
  });
});

mm.add('(max-width: 767px)', () => {
  // Mobile animations: Lightweight fades, standard touch scroll
  gsap.from('.showcase-card', {
    scrollTrigger: { trigger: '.showcase-card', start: 'top 85%' },
    opacity: 0,
    y: 30,
    stagger: 0.1,
  });
});
```

## 5. Performance Checklist
- [ ] No multiple `window.addEventListener('scroll')`. All scroll tracking goes through `lenis` and `ScrollTrigger`.
- [ ] No layout thrashing: compute bounding boxes outside loops or use `ScrollTrigger.refresh()`.
- [ ] Prevent FOUC (Flash of Unstyled Content): set initial CSS `visibility: hidden` and animate to `visibility: visible` in the first tween.
