import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './slices/audioSlice';
import timelineReducer from './slices/timelineSlice';
import compositionReducer from './slices/compositionSlice';
import uiReducer from './slices/uiSlice';
import mediaReducer from './slices/mediaSlice';

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    timeline: timelineReducer,
    composition: compositionReducer,
    ui: uiReducer,
    media: mediaReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;