import * as THREE from 'three';

export class GridFloor {
  constructor(scene) {
    this.scene = scene;
    
    // Grid settings
    this.size = 100;
    this.divisions = 80;
    this.colorCenterLine = '#00f2fe'; // Cyan core line
    this.colorGrid = '#060a16';       // Dark blue grid lines
    this.isOverclocked = false;

    this.grid = new THREE.GridHelper(
      this.size, 
      this.divisions, 
      new THREE.Color(this.colorCenterLine), 
      new THREE.Color(this.colorGrid)
    );
    
    // Position it at the bottom of the abyssal zone
    this.grid.position.y = -3;
    
    // Apply elegant translucent material settings to blend with abisal fog
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.22;
    this.grid.material.blending = THREE.AdditiveBlending;
    this.grid.material.depthWrite = false;
    
    // Save original colors so we can transition them accurately
    const colorsAttr = this.grid.geometry.attributes.color;
    if (colorsAttr) {
      this.originalColors = new Float32Array(colorsAttr.array);
    }

    this.scene.add(this.grid);

    // ─── SECONDARY HOLOGRAPHIC SCANNER GRID ───────────────────────────
    // Larger size, lower resolution, floats slightly below, rotates slowly to create moiré parallax patterns
    this.grid2 = new THREE.GridHelper(
      250, 
      30, 
      new THREE.Color(this.colorGrid), 
      new THREE.Color(this.colorGrid)
    );
    this.grid2.position.y = -3.4;
    this.grid2.material.transparent = true;
    this.grid2.material.opacity = 0.06;
    this.grid2.material.blending = THREE.AdditiveBlending;
    this.grid2.material.depthWrite = false;
    
    this.scene.add(this.grid2);
  }

  setColor(centerHex, gridHex) {
    const colorsAttr = this.grid.geometry.attributes.color;
    if (colorsAttr && this.originalColors) {
      const cCenter = new THREE.Color(centerHex);
      const cGrid = new THREE.Color(gridHex || '#060a16');
      const origCenter = new THREE.Color(this.colorCenterLine);
      
      for (let i = 0; i < colorsAttr.count; i++) {
        const r = this.originalColors[i * 3 + 0];
        const g = this.originalColors[i * 3 + 1];
        const b = this.originalColors[i * 3 + 2];
        
        // Check if the original color is the center line color
        const isCenter = Math.abs(r - origCenter.r) < 0.05 && 
                         Math.abs(g - origCenter.g) < 0.05 && 
                         Math.abs(b - origCenter.b) < 0.05;
        
        if (isCenter) {
          colorsAttr.setXYZ(i, cCenter.r, cCenter.g, cCenter.b);
        } else {
          colorsAttr.setXYZ(i, cGrid.r, cGrid.g, cGrid.b);
        }
      }
      colorsAttr.needsUpdate = true;
    }

    if (this.grid2 && this.grid2.material) {
      this.grid2.material.color.set(gridHex || '#060a16');
    }
  }

  update(deltaTime, elapsedTime) {
    // Subtle breathing pulsing effect on grid lines, 4x faster during overclock
    const speed = this.isOverclocked ? 2.0 : 0.5;
    const baseOpacity = this.isOverclocked ? 0.35 : 0.15;
    const amplitude = this.isOverclocked ? 0.25 : 0.05;
    const pulse = baseOpacity + Math.sin(elapsedTime * speed * 2.0) * amplitude;
    
    this.grid.material.opacity = pulse;

    if (this.grid2 && this.grid2.material) {
      this.grid2.material.opacity = pulse * 0.38; // keep secondary grid highly subtle
      this.grid2.rotation.y = elapsedTime * 0.012; // slow continuous holographic scanning rotation!
    }
  }
}
