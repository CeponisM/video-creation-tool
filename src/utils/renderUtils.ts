import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Composition } from '../store/slices/types';
import { createLayerObject, applyLayerTransform } from './layerUtils';
import { BlurShader, ColorCorrectionShader, GlowShader, ChromaticAberrationShader, getEffectShader } from '../shaders/effectShaders';

interface ExportSettings {
    format: 'mp4' | 'webm' | 'gif';
    quality: 'low' | 'medium' | 'high';
    fps: number;
    startTime: number;
    endTime: number;
}

export const renderComposition = async (
    composition: Composition,
    settings: ExportSettings,
    progressCallback: (progress: number) => void
  ): Promise<Blob> => {
    const { width, height } = composition;
    const { startTime, endTime, fps } = settings;
    const totalFrames = Math.ceil((endTime - startTime) * fps);
  
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 1000);
    camera.position.z = 100;
  
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
  
    const composer = createEffectComposer(renderer, scene, camera, composition);
  
    const frames: ImageData[] = [];
  
    for (let frame = 0; frame < totalFrames; frame++) {
      const time = startTime + frame / fps;
      renderFrame(composition, scene, time);
      composer.render();
  
      const gl = renderer.getContext();
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  
      const imageData = new ImageData(
        new Uint8ClampedArray(pixels.buffer),
        width,
        height
      );
      frames.push(imageData);
  
      progressCallback((frame + 1) / totalFrames * 100);
    }
  
    // Combine frames into video
    const videoBlob = await combineFramesToVideo(frames, settings);
  
    // Clean up
    renderer.dispose();
    composer.dispose();
  
    return videoBlob;
  };

const renderFrame = (composition: Composition, scene: THREE.Scene, time: number) => {
    scene.clear();

    composition.layers.forEach((layer) => {
        if (time >= layer.startTime && time < layer.startTime + layer.duration) {
            const object = createLayerObject(layer, time);
            if (object) {
                applyLayerTransform(object, layer, time);
                scene.add(object);
            }
        }
    });
};

const createEffectComposer = (
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    composition: Composition
): EffectComposer => {
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    composition.layers.forEach((layer) => {
        layer.effects.forEach((effect) => {
            let effectPass;
            switch (effect.type) {
                case 'blur':
                    effectPass = new ShaderPass(BlurShader);
                    break;
                case 'colorCorrection':
                    effectPass = new ShaderPass(ColorCorrectionShader);
                    break;
                case 'glow':
                    effectPass = new ShaderPass(GlowShader);
                    break;
                case 'chromaticAberration':
                    effectPass = new ShaderPass(ChromaticAberrationShader);
                    break;
            }
            if (effectPass) {
                composer.addPass(effectPass);
            }
        });
    });

    return composer;
};

const combineFramesToVideo = async (frames: ImageData[], settings: ExportSettings): Promise<Blob> => {
    const { width, height } = frames[0];
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(settings.fps);
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: settings.quality === 'high' ? 8000000 : settings.quality === 'medium' ? 5000000 : 2500000
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    const recordingPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            resolve(blob);
        };
    });

    mediaRecorder.start();

    for (const frame of frames) {
        ctx.putImageData(frame, 0, 0);
        await new Promise(resolve => setTimeout(resolve, 1000 / settings.fps));
    }

    mediaRecorder.stop();

    return recordingPromise;
};