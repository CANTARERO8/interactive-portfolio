import gsap from 'gsap';

export class ClickSparks {
  constructor() {
    this.initClickSparks();
  }

  initClickSparks() {
    const handleDown = (e) => {
      // Capture coordinates (both click mouse and touch coordinates)
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (x === undefined || y === undefined) return;
      
      this.createSparkWave(x, y);
    };

    window.addEventListener('mousedown', handleDown, { passive: true });
    window.addEventListener('touchstart', handleDown, { passive: true });
  }

  createSparkWave(x, y) {
    const sparkCount = 5 + Math.floor(Math.random() * 2); // 5 to 6 sparks
    const isOverclocked = window.APP_INSTANCE && window.APP_INSTANCE.isOverclocked;
    
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('div');
      spark.className = 'click-spark';
      
      // Determine colors based on overclock reactor status
      if (isOverclocked) {
        spark.style.backgroundColor = '#ff3300';
        spark.style.boxShadow = '0 0 8px #ff3300, 0 0 16px rgba(255, 51, 0, 0.4)';
      } else {
        // Randomly alternate between neon cyan and nebula purple
        const color = Math.random() > 0.5 ? '#00f3ff' : '#9d00ff';
        spark.style.backgroundColor = color;
        spark.style.boxShadow = `0 0 8px ${color}, 0 0 16px ${color}4d`;
      }
      
      // Position at cursor
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      
      document.body.appendChild(spark);
      
      // Calculate random physical explosion vectors
      const angle = Math.random() * Math.PI * 2;
      const distance = 35 + Math.random() * 65; // radius of explosion in pixels
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      
      // GSAP timeline to explode, shrink, and fade the spark
      gsap.to(spark, {
        x: targetX,
        y: targetY,
        scale: 0.1,
        opacity: 0,
        duration: 0.5 + Math.random() * 0.3,
        ease: 'power2.out',
        onComplete: () => {
          spark.remove();
        }
      });
    }
  }
}
