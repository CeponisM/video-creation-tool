import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Effect {
  id: string;
  name: string;
  type: string;
  parameters: {
    [key: string]: number | string;
  };
}

interface EffectsState {
  effects: Effect[];
}

const initialState: EffectsState = {
  effects: [],
};

const effectsSlice = createSlice({
  name: 'effects',
  initialState,
  reducers: {
    addEffect: (state, action: PayloadAction<Effect>) => {
      state.effects.push(action.payload);
    },
    removeEffect: (state, action: PayloadAction<string>) => {
      state.effects = state.effects.filter(effect => effect.id !== action.payload);
    },
    updateEffect: (state, action: PayloadAction<{ id: string; updates: Partial<Effect> }>) => {
      const index = state.effects.findIndex(effect => effect.id === action.payload.id);
      if (index !== -1) {
        state.effects[index] = { ...state.effects[index], ...action.payload.updates };
      }
    },
  },
});

export const { addEffect, removeEffect, updateEffect } = effectsSlice.actions;
export default effectsSlice.reducer;
