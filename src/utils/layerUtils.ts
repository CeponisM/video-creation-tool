import * as THREE from 'three';
import { Layer, Transform } from '../store/slices/types';

export const createLayerObject = (layer: Layer, currentTime: number): THREE.Object3D | null => {
  switch (layer.type) {
    case 'image':
      return createImageLayer(layer);
    case 'video':
      return createVideoLayer(layer, currentTime);
    case 'audio':
      return createAudioLayer(layer, currentTime);
    default:
      return null;
  }
};

const createImageLayer = (layer: Layer): THREE.Mesh => {
  const texture = new THREE.TextureLoader().load(layer.source || '');
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  return new THREE.Mesh(geometry, material);
};

const createVideoLayer = (layer: Layer, currentTime: number): THREE.Mesh => {
  const video = document.createElement('video');
  video.src = layer.source || '';
  video.currentTime = currentTime - layer.startTime;
  video.muted = true;
  video.play();

  const texture = new THREE.VideoTexture(video);
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  return new THREE.Mesh(geometry, material);
};

const createAudioLayer = (layer: Layer, currentTime: number): THREE.Object3D => {
  // Audio layers don't have visual representation, but we can add an icon or waveform visualization here
  const geometry = new THREE.PlaneGeometry(0.5, 0.5);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true });
  const mesh = new THREE.Mesh(geometry, material);

  // You might want to add audio playback logic here
  const audio = new Audio(layer.source);
  audio.currentTime = currentTime - layer.startTime;
  audio.play();

  return mesh;
};

export const applyLayerTransform = (object: THREE.Object3D, layer: Layer, time: number) => {
  const { position, scale, rotation, opacity, anchorPoint } = layer.transform;

  // Apply position
  const pos = interpolateKeyframes(position, time);
  object.position.set(pos[0], pos[1], pos[2]);

  // Apply scale
  const scl = interpolateKeyframes(scale, time);
  object.scale.set(scl[0] / 100, scl[1] / 100, scl[2] / 100);

  // Apply rotation
  const rot = interpolateKeyframes(rotation, time);
  object.rotation.set(
    THREE.MathUtils.degToRad(rot[0]),
    THREE.MathUtils.degToRad(rot[1]),
    THREE.MathUtils.degToRad(rot[2])
  );

  // Apply opacity
  if (object instanceof THREE.Mesh && object.material instanceof THREE.Material) {
    const [opacityValue] = interpolateKeyframes(opacity, time);
    object.material.opacity = opacityValue / 100;
  }

  // Apply anchor point
  const anchor = interpolateKeyframes(anchorPoint, time);
  object.position.sub(new THREE.Vector3(anchor[0], anchor[1], 0));
};

// Helper function to interpolate keyframes
function interpolateKeyframes(keyframes: any[], time: number): number[] {
  // Implement keyframe interpolation logic here
  // For simplicity, we'll just return the first keyframe value
  return keyframes[0].value;
}

// types.ts (update the Transform interface)
export interface Transform {
  position: Keyframe[];
  scale: Keyframe[];
  rotation: Keyframe[];
  opacity: Keyframe[];
  anchorPoint: Keyframe[];
  expressions: Record<string, string>;
}

export interface Keyframe {
  time: number;
  value: number[];
  easing: string;
}