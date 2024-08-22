import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CompositionState {
  name: string;
  width: number;
  height: number;
  frameRate: number;
  duration: number;
  backgroundColor: string;
  pixelAspect: number;
  resolution: '1/2' | 'full';
  motionBlur: boolean;
  shutterAngle: number;
  samplesPerFrame: number;
}

const initialState: CompositionState = {
  name: 'Untitled Composition',
  width: 1920,
  height: 1080,
  frameRate: 30,
  duration: 10,
  backgroundColor: '#000000',
  pixelAspect: 1,
  resolution: 'full',
  motionBlur: true,
  shutterAngle: 180,
  samplesPerFrame: 16,
};

const compositionSlice = createSlice({
  name: 'composition',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setDimensions: (state, action: PayloadAction<{ width: number; height: number }>) => {
      state.width = action.payload.width;
      state.height = action.payload.height;
    },
    setFrameRate: (state, action: PayloadAction<number>) => {
      state.frameRate = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.backgroundColor = action.payload;
    },
    setPixelAspect: (state, action: PayloadAction<number>) => {
      state.pixelAspect = action.payload;
    },
    setResolution: (state, action: PayloadAction<'1/2' | 'full'>) => {
      state.resolution = action.payload;
    },
    setMotionBlur: (state, action: PayloadAction<boolean>) => {
      state.motionBlur = action.payload;
    },
    setShutterAngle: (state, action: PayloadAction<number>) => {
      state.shutterAngle = action.payload;
    },
    setSamplesPerFrame: (state, action: PayloadAction<number>) => {
      state.samplesPerFrame = action.payload;
    },
  },
});

export const {
  setName,
  setDimensions,
  setFrameRate,
  setDuration,
  setBackgroundColor,
  setPixelAspect,
  setResolution,
  setMotionBlur,
  setShutterAngle,
  setSamplesPerFrame,
} = compositionSlice.actions;

export default compositionSlice.reducer;
