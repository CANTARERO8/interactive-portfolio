import * as THREE from 'three';

const nebulaVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const nebulaFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uSteps;
  uniform float uIntensity;
  uniform float uDetail;
  uniform float uAspect;
  uniform vec3 uCameraPosition;
  uniform mat3 uCameraRotation;
  uniform vec3 uMidnight;
  uniform vec3 uCarbon;
  uniform vec3 uCyan;
  uniform vec3 uViolet;
  uniform float uVioletStrength;

  varying vec2 vUv;

  vec4 permute(vec4 value) {
    return mod(((value * 34.0) + 1.0) * value, 289.0);
  }

  vec4 inverseSqrtApprox(vec4 value) {
    return 1.79284291400159 - 0.85373472095314 * value;
  }

  float simplexNoise3D(vec3 point) {
    const vec2 simplex = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 offsets = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 cell = floor(point + dot(point, simplex.yyy));
    vec3 x0 = point - cell + dot(cell, simplex.xxx);
    vec3 ordering = step(x0.yzx, x0.xyz);
    vec3 inverseOrdering = 1.0 - ordering;
    vec3 corner1 = min(ordering.xyz, inverseOrdering.zxy);
    vec3 corner2 = max(ordering.xyz, inverseOrdering.zxy);
    vec3 x1 = x0 - corner1 + simplex.xxx;
    vec3 x2 = x0 - corner2 + simplex.yyy;
    vec3 x3 = x0 - offsets.yyy;

    cell = mod(cell, 289.0);
    vec4 permutation = permute(permute(permute(
      cell.z + vec4(0.0, corner1.z, corner2.z, 1.0)
    ) + cell.y + vec4(0.0, corner1.y, corner2.y, 1.0))
      + cell.x + vec4(0.0, corner1.x, corner2.x, 1.0));

    float gradientGrid = 1.0 / 7.0;
    vec3 gradientScale = gradientGrid * offsets.wyz - offsets.xzx;
    vec4 gradientIndex = permutation - 49.0 * floor(permutation * gradientScale.z * gradientScale.z);
    vec4 gradientXIndex = floor(gradientIndex * gradientScale.z);
    vec4 gradientYIndex = floor(gradientIndex - 7.0 * gradientXIndex);
    vec4 gradientX = gradientXIndex * gradientScale.x + gradientScale.yyyy;
    vec4 gradientY = gradientYIndex * gradientScale.x + gradientScale.yyyy;
    vec4 gradientZ = 1.0 - abs(gradientX) - abs(gradientY);
    vec4 base0 = vec4(gradientX.xy, gradientY.xy);
    vec4 base1 = vec4(gradientX.zw, gradientY.zw);
    vec4 sign0 = floor(base0) * 2.0 + 1.0;
    vec4 sign1 = floor(base1) * 2.0 + 1.0;
    vec4 correction = -step(gradientZ, vec4(0.0));
    vec4 adjusted0 = base0.xzyw + sign0.xzyw * correction.xxyy;
    vec4 adjusted1 = base1.xzyw + sign1.xzyw * correction.zzww;

    vec3 gradient0 = vec3(adjusted0.xy, gradientZ.x);
    vec3 gradient1 = vec3(adjusted0.zw, gradientZ.y);
    vec3 gradient2 = vec3(adjusted1.xy, gradientZ.z);
    vec3 gradient3 = vec3(adjusted1.zw, gradientZ.w);
    vec4 normalization = inverseSqrtApprox(vec4(
      dot(gradient0, gradient0),
      dot(gradient1, gradient1),
      dot(gradient2, gradient2),
      dot(gradient3, gradient3)
    ));
    gradient0 *= normalization.x;
    gradient1 *= normalization.y;
    gradient2 *= normalization.z;
    gradient3 *= normalization.w;

    vec4 attenuation = max(0.6 - vec4(
      dot(x0, x0),
      dot(x1, x1),
      dot(x2, x2),
      dot(x3, x3)
    ), 0.0);
    attenuation *= attenuation;
    return 42.0 * dot(attenuation * attenuation, vec4(
      dot(gradient0, x0),
      dot(gradient1, x1),
      dot(gradient2, x2),
      dot(gradient3, x3)
    ));
  }

  vec3 curlDomain(vec3 point) {
    return vec3(
      sin(point.y * 0.73) - cos(point.z * 0.61),
      sin(point.z * 0.67) - cos(point.x * 0.71),
      sin(point.x * 0.69) - cos(point.y * 0.77)
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.55;
    mat3 rotation = mat3(
      0.00,  0.80,  0.60,
     -0.80,  0.36, -0.48,
     -0.60, -0.48,  0.64
    );

    for (int octave = 0; octave < 3; octave++) {
      value += (simplexNoise3D(p) * 0.5 + 0.5) * amplitude;
      p = rotation * p * 2.03 + vec3(7.1, 3.7, 5.9);
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec2 screenPosition = vUv * 2.0 - 1.0;
    screenPosition.x *= uAspect;
    vec3 viewRay = normalize(vec3(screenPosition * 0.72, -1.0));
    vec3 rayDirection = normalize(uCameraRotation * viewRay);
    vec3 rayOrigin = uCameraPosition * 0.018;
    float accumulatedDensity = 0.0;
    float cyanCore = 0.0;
    float violetMist = 0.0;
    float stepLength = 0.31;

    for (int stepIndex = 0; stepIndex < 20; stepIndex++) {
      if (float(stepIndex) >= uSteps) break;

      float distanceAlongRay = 0.8 + float(stepIndex) * stepLength;
      vec3 samplePosition = rayOrigin + rayDirection * distanceAlongRay;
      samplePosition.z += uTime * 0.035;
      samplePosition.xy += vec2(
        sin(samplePosition.z * 0.34 + uTime * 0.045),
        cos(samplePosition.z * 0.27 - uTime * 0.038)
      ) * 0.38;
      vec3 curlWarp = curlDomain(samplePosition * 0.52 + vec3(uTime * 0.035));
      samplePosition += curlWarp * mix(0.12, 0.42, uDetail);

      float cloud = fbm(samplePosition * 0.72);
      float filament = sin(samplePosition.x * 1.3 + samplePosition.z * 0.72) * 0.06;
      float density = smoothstep(0.48, 0.88, cloud + filament);
      float breathing = 0.94 + sin(uTime * 0.62 + distanceAlongRay * 0.28) * 0.06;
      density *= breathing;
      density *= 0.075 * (1.0 - accumulatedDensity);

      accumulatedDensity += density;
      cyanCore += density * smoothstep(0.66, 0.94, cloud);
      violetMist += density * (0.35 + smoothstep(0.5, 0.84, cloud + curlWarp.y * 0.08) * 0.65);
    }

    float horizon = pow(1.0 - abs(rayDirection.y), 3.0);
    vec3 color = mix(uCarbon, uMidnight, clamp(accumulatedDensity * 1.8 + horizon * 0.15, 0.0, 1.0));
    color += uViolet * violetMist * 1.45 * uVioletStrength;
    color += uViolet * horizon * 0.045 * uVioletStrength;
    color += uCyan * cyanCore * 1.65;
    color += uCyan * horizon * 0.018;
    color *= uIntensity;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class VolumetricNebula {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.qualityMode = 'ultra';
    this.frame = 0;
    this.cameraRotation = new THREE.Matrix3();
    this.cameraForward = new THREE.Vector3();

    this.uniforms = {
      uTime: { value: 0 },
      uSteps: { value: this.getRaymarchSteps() },
      uIntensity: { value: 1.0 },
      uDetail: { value: 0.62 },
      uAspect: { value: window.innerWidth / window.innerHeight },
      uCameraPosition: { value: new THREE.Vector3() },
      uCameraRotation: { value: this.cameraRotation },
      uMidnight: { value: new THREE.Color('#081a38') },
      uCarbon: { value: new THREE.Color('#010207') },
      uCyan: { value: new THREE.Color('#00bcd4') },
      uViolet: { value: new THREE.Color('#7c3aed') },
      uVioletStrength: { value: 0.0 }
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaFragmentShader,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false
    });

    const targetSize = this.getTargetSize();
    this.renderTarget = new THREE.WebGLRenderTarget(targetSize.width, targetSize.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false
    });
    this.renderTarget.texture.generateMipmaps = false;

    this.shaderScene = new THREE.Scene();
    this.shaderCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.shaderQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.shaderScene.add(this.shaderQuad);

    this.compositeMaterial = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.compositeMaterial);
    this.mesh.renderOrder = -1000;
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);

    this.handleResize = () => {
      this.uniforms.uSteps.value = this.getRaymarchSteps();
      this.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
      const size = this.getTargetSize();
      this.renderTarget.setSize(size.width, size.height);
    };
    window.addEventListener('resize', this.handleResize, { passive: true });
  }

  getRaymarchSteps() {
    if (this.qualityMode === 'performance') return 6;
    const isUltraPlus = this.qualityMode === 'ultra-plus';
    if (window.innerWidth <= 640) return isUltraPlus ? 12 : 8;
    if (window.innerWidth <= 1024) return isUltraPlus ? 16 : 10;
    return isUltraPlus ? 20 : 13;
  }

  getTargetSize() {
    const performanceMode = this.qualityMode === 'performance';
    const ultraPlusMode = this.qualityMode === 'ultra-plus';
    const scale = performanceMode
      ? 0.22
      : (ultraPlusMode ? (window.innerWidth <= 768 ? 0.72 : 0.62) : (window.innerWidth <= 768 ? 0.42 : 0.3));
    const maxWidth = performanceMode ? 420 : (ultraPlusMode ? 1280 : 560);
    const width = Math.min(maxWidth, Math.max(180, Math.round(window.innerWidth * scale)));
    const height = Math.max(124, Math.round(width / Math.max(0.5, window.innerWidth / window.innerHeight)));
    return { width, height };
  }

  setQualityMode(mode) {
    this.qualityMode = ['performance', 'ultra', 'ultra-plus'].includes(mode) ? mode : 'ultra';
    this.mesh.visible = this.qualityMode !== 'performance';
    this.uniforms.uSteps.value = this.getRaymarchSteps();
    this.uniforms.uDetail.value = this.qualityMode === 'ultra-plus' ? 1.0 : 0.62;
    this.uniforms.uVioletStrength.value = this.qualityMode === 'ultra-plus' ? 0.82 : 0.0;
    const size = this.getTargetSize();
    this.renderTarget.setSize(size.width, size.height);
    this.frame = 0;
  }

  update(elapsedTime, isOverclocked = false) {
    if (this.qualityMode === 'performance') {
      this.mesh.visible = false;
      return;
    }

    this.mesh.visible = true;
    const isUltraPlus = this.qualityMode === 'ultra-plus';
    const timeScale = this.reducedMotion ? 0.08 : 0.22;
    this.uniforms.uTime.value = elapsedTime * timeScale;
    this.uniforms.uCameraPosition.value.copy(this.camera.position);
    const profileIntensity = isUltraPlus ? 1.08 : 0.92;
    const targetIntensity = profileIntensity * (isOverclocked ? 1.28 : 1.0);
    this.uniforms.uIntensity.value += (targetIntensity - this.uniforms.uIntensity.value) * 0.04;
    this.camera.updateMatrixWorld();
    this.cameraRotation.setFromMatrix4(this.camera.matrixWorld);

    // The nebula evolves slowly, so a stable half-rate render preserves its
    // spatial detail while leaving more GPU time for the foreground scene.
    this.frame++;
    const renderInterval = 2;
    if (this.frame % renderInterval === 0) {
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.shaderScene, this.shaderCamera);
      this.renderer.setRenderTarget(null);
    }

    const distance = 118;
    const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov * 0.5)) * distance;
    const visibleWidth = visibleHeight * this.camera.aspect;
    this.camera.getWorldDirection(this.cameraForward);
    this.mesh.position.copy(this.camera.position).addScaledVector(this.cameraForward, distance);
    this.mesh.quaternion.copy(this.camera.quaternion);
    this.mesh.scale.set(visibleWidth * 0.505, visibleHeight * 0.505, 1);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    this.scene.remove(this.mesh);
    this.shaderQuad.geometry.dispose();
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.compositeMaterial.dispose();
    this.renderTarget.dispose();
  }
}
