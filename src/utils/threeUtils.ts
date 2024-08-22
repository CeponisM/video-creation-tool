import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';

export interface ThreeSetup {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  composer: EffectComposer;
}

export function initThreeJS(container: HTMLElement, width: number, height: number): ThreeSetup {
  const scene = new THREE.Scene();

  const aspect = width / height;
  const frustumSize = 1;
  const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
  );
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * window.devicePixelRatio);
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * window.devicePixelRatio);
  composer.addPass(fxaaPass);

  return { scene, camera, renderer, composer };
}

export function resizeThreeJS(setup: ThreeSetup, width: number, height: number): void {
  const { camera, renderer, composer } = setup;

  const aspect = width / height;
  const frustumSize = 1;
  camera.left = frustumSize * aspect / -2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}

export function createCustomShaderPass(vertexShader: string, fragmentShader: string): ShaderPass {
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      tDiffuse: { value: null },
      resolution: { value: new THREE.Vector2() },
      time: { value: 0 },
    },
  });

  return new ShaderPass(shaderMaterial);
}

export function updateCustomShaderUniforms(shaderPass: ShaderPass, width: number, height: number, time: number): void {
  shaderPass.material.uniforms.resolution.value.set(width, height);
  shaderPass.material.uniforms.time.value = time;
}