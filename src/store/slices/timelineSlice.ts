import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    position?: Expression;
    scale?: Expression;
    rotation?: Expression;
    opacity?: Expression;
    anchorPoint?: Expression;
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
  currentTime: number;
  selectedLayerIds: string[];
  zoom: number;
}

const initialState: TimelineState = {
  compositions: [],
  activeCompositionId: null,
  currentTime: 0,
  selectedLayerIds: [],
  zoom: 1,
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
    setSelectedLayers: (state, action: PayloadAction<string[]>) => {
      state.selectedLayerIds = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
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
          const maskIndex = layer.masks.findIndex(m => m.id === action.payload.maskId);
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
          layer.masks = layer.masks.filter(m => m.id !== action.payload.maskId);
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
} = timelineSlice.actions;

export default timelineSlice.reducer;