import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AudioState {
  fileName: string | null;
  duration: number;
  isPlaying: boolean;
  currentTime: number;
  waveformData: number[];
  isLoading: boolean;
}

const initialState: AudioState = {
  fileName: null,
  duration: 0,
  isPlaying: false,
  currentTime: 0,
  waveformData: [],
  isLoading: false,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setAudioFile: (state, action: PayloadAction<{ fileName: string; duration: number; waveformData: number[] }>) => {
      state.fileName = action.payload.fileName;
      state.duration = action.payload.duration;
      state.waveformData = action.payload.waveformData;
      state.isLoading = false;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setAudioFile, setIsPlaying, setCurrentTime, setIsLoading } = audioSlice.actions;
export default audioSlice.reducer;
