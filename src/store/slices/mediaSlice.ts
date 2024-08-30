import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
  duration?: number;
}

interface MediaState {
  items: MediaItem[];
}

const initialState: MediaState = {
  items: [],
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    addMedia: (state, action: PayloadAction<MediaItem>) => {
      state.items.push(action.payload);
    },
    removeMedia: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateMediaDuration: (state, action: PayloadAction<{ id: string; duration: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.duration = action.payload.duration;
      }
    },
  },
});

export const { addMedia, removeMedia, updateMediaDuration } = mediaSlice.actions;
export default mediaSlice.reducer;
