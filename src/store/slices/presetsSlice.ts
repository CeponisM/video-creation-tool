import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Preset {
  id: string;
  name: string;
  effects: {
    [effectId: string]: {
      type: string;
      parameters: {
        [key: string]: number | string;
      };
    };
  };
}

interface PresetsState {
  presets: Preset[];
}

const initialState: PresetsState = {
  presets: [],
};

const presetsSlice = createSlice({
  name: 'presets',
  initialState,
  reducers: {
    addPreset: (state, action: PayloadAction<Preset>) => {
      state.presets.push(action.payload);
    },
    removePreset: (state, action: PayloadAction<string>) => {
      state.presets = state.presets.filter(preset => preset.id !== action.payload);
    },
    updatePreset: (state, action: PayloadAction<{ id: string; updates: Partial<Preset> }>) => {
      const index = state.presets.findIndex(preset => preset.id === action.payload.id);
      if (index !== -1) {
        state.presets[index] = { ...state.presets[index], ...action.payload.updates };
      }
    },
  },
});

export const { addPreset, removePreset, updatePreset } = presetsSlice.actions;
export default presetsSlice.reducer;