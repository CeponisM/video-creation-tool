import * as THREE from 'three';

export const ParallaxShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "resolution": { value: new THREE.Vector2() },
    "parallaxScale": { value: 0.1 },
    "parallaxCenter": { value: new THREE.Vector2(0.5, 0.5) },
    "mousePosition": { value: new THREE.Vector2(0, 0) },
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
    uniform float parallaxScale;
    uniform vec2 parallaxCenter;
    uniform vec2 mousePosition;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec2 mouseOffset = (mousePosition - parallaxCenter) * parallaxScale;
      uv += mouseOffset;
      gl_FragColor = texture2D(tDiffuse, uv);
    }
  `
};