import * as THREE from 'three';

class FrameCache {
  private cache: Map<string, THREE.Texture>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  getFrame(key: string): THREE.Texture | undefined {
    return this.cache.get(key);
  }

  setFrame(key: string, texture: THREE.Texture): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, texture);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const frameCache = new FrameCache();
