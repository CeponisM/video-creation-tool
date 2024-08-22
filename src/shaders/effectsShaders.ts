import * as THREE from 'three';

const blurShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    radius: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float radius;
    varying vec2 vUv;

    void main() {
      vec4 sum = vec4(0.0);
      vec2 texelSize = vec2(1.0 / resolution.x, 1.0 / resolution.y);
      
      for(float x = -radius; x <= radius; x++) {
        for(float y = -radius; y <= radius; y++) {
          vec2 offset = vec2(x, y) * texelSize;
          sum += texture2D(tDiffuse, vUv + offset);
        }
      }
      
      gl_FragColor = sum / pow((radius * 2.0 + 1.0), 2.0);
    }
  `,
};

const colorCorrectionShader = {
  uniforms: {
    tDiffuse: { value: null },
    brightness: { value: 1.0 },
    contrast: { value: 1.0 },
    saturation: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float brightness;
    uniform float contrast;
    uniform float saturation;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Brightness
      color.rgb *= brightness;
      
      // Contrast
      color.rgb = (color.rgb - 0.5) * contrast + 0.5;
      
      // Saturation
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(vec3(gray), color.rgb, saturation);
      
      gl_FragColor = color;
    }
  `,
};

const glowShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2() },
    intensity: { value: 1.0 },
    threshold: { value: 0.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float intensity;
    uniform float threshold;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec4 sum = vec4(0.0);
      vec2 texelSize = vec2(1.0 / resolution.x, 1.0 / resolution.y);
      
      for(int x = -4; x <= 4; x++) {
        for(int y = -4; y <= 4; y++) {
          vec2 offset = vec2(float(x), float(y)) * texelSize;
          vec4 sample = texture2D(tDiffuse, vUv + offset);
          float luminance = dot(sample.rgb, vec3(0.299, 0.587, 0.114));
          if(luminance > threshold) {
            sum += sample;
          }
        }
      }
      
      sum /= 81.0;
      sum *= intensity;
      
      gl_FragColor = color + sum;
    }
  `,
};

export const getEffectShader = (effectType: string): THREE.Shader | null => {
  switch (effectType) {
    case 'blur':
      return blurShader;
    case 'colorCorrection':
      return colorCorrectionShader;
    case 'glow':
      return glowShader;
    default:
      return null;
  }
};
