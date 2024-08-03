import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CompositionState {
  width: number;
  height: number;
  backgroundColor: string;
}

const initialState: CompositionState = {
  width: 1920,
  height: 1080,
  backgroundColor: '#000000',
};

const compositionSlice = createSlice({
  name: 'composition',
  initialState,
  reducers: {
    setDimensions: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.width = action.payload.width;
      state.height = action.payload.height;
    },
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.backgroundColor = action.payload;
    },
  },
});

export const { setDimensions, setBackgroundColor } = compositionSlice.actions;
export default compositionSlice.reducer;