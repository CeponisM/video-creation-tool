export interface Keyframe {
  time: number;
  value: number[];
  easing: string;
}

export interface Expression {
  code: string;
  enabled: boolean;
}

export interface Transform {
  position: Keyframe[];
  scale: Keyframe[];
  rotation: Keyframe[];
  opacity: Keyframe[];
  anchorPoint: Keyframe[];
  expressions: {
    [key in keyof Omit<Transform, 'expressions'>]?: Expression;
  };
}

export interface EffectParameter {
  name: string;
  type: 'number' | 'color' | 'boolean';
  keyframes: Keyframe[];
  expression?: Expression;
}

export interface Effect {
  id: string;
  name: string;
  type: string;
  parameters: EffectParameter[];
}

export interface MaskPath {
  vertices: { x: number; y: number }[];
  closed: boolean;
}

export interface Mask {
  id: string;
  name: string;
  path: MaskPath;
  inverted: boolean;
  feather: number;
  opacity: number;
}

export interface Layer {
  id: string;
  name: string;
  type: 'solid' | 'image' | 'video' | 'audio' | 'composition' | 'precomposition' | 'text' | 'shape' | 'null';
  startTime: number;
  duration: number;
  transform: Transform;
  effects: Effect[];
  masks: Mask[];
  parentId: string | null;
  trackMatteType?: 'alpha' | 'luma' | 'inverted' | null;
  trackMatteLayer?: string;
  precompId?: string;
  isTrackMatte?: boolean;
  is3D: boolean;
  blendingMode: 'normal' | 'add' | 'multiply' | 'screen' | 'overlay';
  motionBlur: boolean;
  motionBlurSamples: number;
  source?: string;
  backgroundColor?: string;
  selected?: boolean;
  solo?: boolean;
  locked?: boolean;
  shy?: boolean;
  quality?: 'low' | 'medium' | 'high';
  timeRemapping?: {
    enabled: boolean;
    keyframes: Keyframe[];
  };
}

export interface Composition {
  id: string;
  name: string;
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  layers: Layer[];
  hideShyLayers?: boolean;
}