import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { Layer, Composition, Keyframe, Effect, Mask, Transform, Expression } from './types';

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
    [key in keyof Transform]?: Expression;
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
}

export interface Composition {
  id: string;
  name: string;
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  layers: Layer[];
}

interface TimelineState {
  compositions: Composition[];
  activeCompositionId: string | null;
  layers: Layer[];
  currentTime: number;
  selectedLayerIds: string[];
  zoom: number;
  past: TimelineState[];
  future: TimelineState[];
  playbackState: 'playing' | 'paused';
  inPoint: number;
  outPoint: number;
  workArea: { start: number; end: number };
}

const initialState: TimelineState = {
  compositions: [],
  activeCompositionId: null,
  layers: [],
  currentTime: 0,
  selectedLayerIds: [],
  zoom: 1,
  past: [],
  future: [],
  playbackState: 'paused',
  inPoint: 0,
  outPoint: 0,
  workArea: { start: 0, end: 0 },
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    addComposition: (state, action: PayloadAction<Composition>) => {
      state.compositions.push(action.payload);
      if (!state.activeCompositionId) {
        state.activeCompositionId = action.payload.id;
      }
    },
    setActiveComposition: (state, action: PayloadAction<string>) => {
      state.activeCompositionId = action.payload;
    },
    addLayer: (state, action: PayloadAction<{ compositionId: string; layer: Layer }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        composition.layers.push(action.payload.layer);
      }
    },
    updateLayer: (state, action: PayloadAction<{ compositionId: string; layerId: string; updates: Partial<Layer> }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layerIndex = composition.layers.findIndex(l => l.id === action.payload.layerId);
        if (layerIndex !== -1) {
          composition.layers[layerIndex] = { ...composition.layers[layerIndex], ...action.payload.updates };
        }
      }
    },
    removeLayer: (state, action: PayloadAction<{ compositionId: string; layerId: string }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        composition.layers = composition.layers.filter(l => l.id !== action.payload.layerId);
      }
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setPlaybackState: (state, action: PayloadAction<'playing' | 'paused'>) => {
      state.playbackState = action.payload;
    },
    setInPoint: (state, action: PayloadAction<number>) => {
      state.inPoint = action.payload;
    },
    setOutPoint: (state, action: PayloadAction<number>) => {
      state.outPoint = action.payload;
    },
    setWorkArea: (state, action: PayloadAction<{ start: number; end: number }>) => {
      state.workArea = action.payload;
    },
    setSelectedLayers: (state, action: PayloadAction<string[]>) => {
      state.selectedLayerIds = action.payload;
    },
    createPrecomposition: (state, action: PayloadAction<{ sourceCompositionId: string; layerIds: string[]; newComposition: Composition }>) => {
      const sourceComposition = state.compositions.find(c => c.id === action.payload.sourceCompositionId);
      if (sourceComposition) {
        state.compositions.push(action.payload.newComposition);
        
        const layersToMove = sourceComposition.layers.filter(l => action.payload.layerIds.includes(l.id));
        action.payload.newComposition.layers = layersToMove;
        
        sourceComposition.layers = sourceComposition.layers.filter(l => !action.payload.layerIds.includes(l.id));
        
        sourceComposition.layers.push({
          id: `precomp-${action.payload.newComposition.id}`,
          name: action.payload.newComposition.name,
          type: 'precomposition',
          startTime: 0,
          duration: action.payload.newComposition.duration,
          transform: {
            position: [], scale: [], rotation: [], opacity: [], anchorPoint: [],
            expressions: {}
          },
          effects: [],
          masks: [],
          parentId: null,
          is3D: false,
          blendingMode: 'normal',
          motionBlur: false,
          motionBlurSamples: 16,
          precompId: action.payload.newComposition.id,
        });
      }
    },
    addMask: (state, action: PayloadAction<{ compositionId: string; layerId: string; mask: Mask }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.masks.push(action.payload.mask);
        }
      }
    },
    updateMask: (state, action: PayloadAction<{ compositionId: string; layerId: string; maskId: string; updates: Partial<Mask> }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          const maskIndex = layer.masks.findIndex((m: Mask) => m.id === action.payload.maskId);
          if (maskIndex !== -1) {
            layer.masks[maskIndex] = { ...layer.masks[maskIndex], ...action.payload.updates };
          }
        }
      }
    },
    removeMask: (state, action: PayloadAction<{ compositionId: string; layerId: string; maskId: string }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.masks = layer.masks.filter((m: Mask) => m.id !== action.payload.maskId);
        }
      }
    },
    setTrackMatte: (state, action: PayloadAction<{ compositionId: string; layerId: string; trackMatteType: Layer['trackMatteType']; trackMatteLayerId: string | null }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.trackMatteType = action.payload.trackMatteType;
          layer.trackMatteLayer = action.payload.trackMatteLayerId || undefined;
        }
      }
    },
    updateLayerTransform: (state, action: PayloadAction<{ compositionId: string; layerId: string; transform: Partial<Transform> }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.transform = { ...layer.transform, ...action.payload.transform };
        }
      }
    },
    setLayerAs3D: (state, action: PayloadAction<{ compositionId: string; layerId: string; is3D: boolean }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.is3D = action.payload.is3D;
        }
      }
    },
    setLayerBlendingMode: (state, action: PayloadAction<{ compositionId: string; layerId: string; blendingMode: Layer['blendingMode'] }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.blendingMode = action.payload.blendingMode;
        }
      }
    },
    updateExpression: (state, action: PayloadAction<{ compositionId: string; layerId: string; property: keyof Transform; expression: Expression }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.transform.expressions[action.payload.property] = action.payload.expression;
        }
      }
    },
    setLayerParent: (state, action: PayloadAction<{ compositionId: string; layerId: string; parentId: string | null }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.parentId = action.payload.parentId;
        }
      }
    },
    setLayerMotionBlur: (state, action: PayloadAction<{ compositionId: string; layerId: string; motionBlur: boolean; samples?: number }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.motionBlur = action.payload.motionBlur;
          if (action.payload.samples !== undefined) {
            layer.motionBlurSamples = action.payload.samples;
          }
        }
      }
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const previousState = state.past[state.past.length - 1];
        state.future.push({ ...state });
        Object.assign(state, previousState);
        state.past.pop();
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const nextState = state.future[state.future.length - 1];
        state.past.push({ ...state });
        Object.assign(state, nextState);
        state.future.pop();
      }
    },

    addKeyframe: (state, action: PayloadAction<{ layerId: string; property: keyof Transform; keyframe: Keyframe }>) => {
      const layer = state.layers.find(l => l.id === action.payload.layerId);
      if (layer) {
        const keyframes = layer.transform[action.payload.property] as Keyframe[];
        const index = keyframes.findIndex(k => k.time > action.payload.keyframe.time);
        if (index === -1) {
          keyframes.push(action.payload.keyframe);
        } else {
          keyframes.splice(index, 0, action.payload.keyframe);
        }
      }
    },
    removeKeyframe: (state, action: PayloadAction<{ layerId: string; property: keyof Transform; time: number }>) => {
      const layer = state.layers.find(l => l.id === action.payload.layerId);
      if (layer) {
        const keyframes = layer.transform[action.payload.property] as Keyframe[];
        const index = keyframes.findIndex(k => k.time === action.payload.time);
        if (index !== -1) {
          keyframes.splice(index, 1);
        }
      }
    },
    updateKeyframe: (state, action: PayloadAction<{ layerId: string; property: keyof Transform; time: number; newKeyframe: Partial<Keyframe> }>) => {
      const layer = state.layers.find(l => l.id === action.payload.layerId);
      if (layer) {
        const keyframes = layer.transform[action.payload.property] as Keyframe[];
        const index = keyframes.findIndex(k => k.time === action.payload.time);
        if (index !== -1) {
          keyframes[index] = { ...keyframes[index], ...action.payload.newKeyframe };
        }
      }
    },
    addEffect: (state, action: PayloadAction<{ layerId: string; effect: Effect }>) => {
      const layer = state.layers.find(l => l.id === action.payload.layerId);
      if (layer) {
        layer.effects.push(action.payload.effect);
      }
    },
    removeEffect: (state, action: PayloadAction<{ layerId: string; effectId: string }>) => {
      const layer = state.layers.find(l => l.id === action.payload.layerId);
      if (layer) {
        layer.effects = layer.effects.filter(e => e.id !== action.payload.effectId);
      }
    },
    updateEffect: (state, action: PayloadAction<{ layerId: string; effectId: string; updates: Partial<Effect> }>) => {
      const layer = state.layers.find(l => l.id === action.payload.layerId);
      if (layer) {
        const effectIndex = layer.effects.findIndex(e => e.id === action.payload.effectId);
        if (effectIndex !== -1) {
          layer.effects[effectIndex] = { ...layer.effects[effectIndex], ...action.payload.updates };
        }
      }
    },

    duplicateLayer: (state, action: PayloadAction<{ compositionId: string; layerId: string }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layerToDuplicate = composition.layers.find(l => l.id === action.payload.layerId);
        if (layerToDuplicate) {
          const newLayer: Layer = {
            ...layerToDuplicate,
            id: uuidv4(),
            name: `${layerToDuplicate.name} copy`,
          };
          composition.layers.push(newLayer);
        }
      }
    },

    reorderLayers: (state, action: PayloadAction<{ compositionId: string; sourceIndex: number; destinationIndex: number }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const [removed] = composition.layers.splice(action.payload.sourceIndex, 1);
        composition.layers.splice(action.payload.destinationIndex, 0, removed);
      }
    },

    trimLayer: (state, action: PayloadAction<{ compositionId: string; layerId: string; newStartTime: number; newDuration: number }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.startTime = action.payload.newStartTime;
          layer.duration = action.payload.newDuration;
        }
      }
    },

    splitLayer: (state, action: PayloadAction<{ compositionId: string; layerId: string; splitTime: number }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layerToSplit = composition.layers.find(l => l.id === action.payload.layerId);
        if (layerToSplit) {
          const splitPoint = action.payload.splitTime - layerToSplit.startTime;
          if (splitPoint > 0 && splitPoint < layerToSplit.duration) {
            const newLayer: Layer = {
              ...layerToSplit,
              id: uuidv4(),
              name: `${layerToSplit.name} split`,
              startTime: action.payload.splitTime,
              duration: layerToSplit.duration - splitPoint,
            };
            layerToSplit.duration = splitPoint;
            composition.layers.push(newLayer);
          }
        }
      }
    },

    toggleLayerSolo: (state, action: PayloadAction<{ compositionId: string; layerId: string }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.solo = !layer.solo;
        }
      }
    },
    toggleLayerLock: (state, action: PayloadAction<{ compositionId: string; layerId: string }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.locked = !layer.locked;
        }
      }
    },
    setLayerQuality: (state, action: PayloadAction<{ compositionId: string; layerId: string; quality: 'low' | 'medium' | 'high' }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.quality = action.payload.quality;
        }
      }
    },
    setLayerShyness: (state, action: PayloadAction<{ compositionId: string; layerId: string; shy: boolean }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.shy = action.payload.shy;
        }
      }
    },

    toggleCompositionShyLayers: (state, action: PayloadAction<{ compositionId: string }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        composition.hideShyLayers = !composition.hideShyLayers;
      }
    },
    setLayerTimeRemapping: (state, action: PayloadAction<{ compositionId: string; layerId: string; enabled: boolean; keyframes?: Keyframe[] }>) => {
      const composition = state.compositions.find(c => c.id === action.payload.compositionId);
      if (composition) {
        const layer = composition.layers.find(l => l.id === action.payload.layerId);
        if (layer) {
          layer.timeRemapping = {
            enabled: action.payload.enabled,
            keyframes: action.payload.keyframes || [],
          };
        }
      }
    },
  },
});

export const {
  addComposition,
  setActiveComposition,
  addLayer,
  updateLayer,
  removeLayer,
  setCurrentTime,
  setSelectedLayers,
  setZoom,
  createPrecomposition,
  addMask,
  updateMask,
  removeMask,
  setTrackMatte,
  updateLayerTransform,
  setLayerAs3D,
  setLayerBlendingMode,
  updateExpression,
  setLayerParent,
  setLayerMotionBlur,
  addKeyframe,
  removeKeyframe,
  updateKeyframe,
  addEffect,
  removeEffect,
  updateEffect,
  undo,
  redo,
  setPlaybackState,
  setInPoint,
  setOutPoint,
  setWorkArea,
  duplicateLayer,
  reorderLayers,
  trimLayer,
  splitLayer,
  toggleLayerSolo,
  toggleLayerLock,
  setLayerQuality,
  setLayerShyness,
  toggleCompositionShyLayers,
  setLayerTimeRemapping,
} = timelineSlice.actions;

export default timelineSlice.reducer;