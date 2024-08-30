import { configureStore } from '@reduxjs/toolkit';
import audioReducer from './slices/audioSlice';
import timelineReducer from './slices/timelineSlice';
import compositionReducer from './slices/compositionSlice';
import uiReducer from './slices/uiSlice';
import mediaReducer from './slices/mediaSlice';
import projectReducer from './slices/projectSlice';
import effectsReducer from './slices/effectsSlice';
import presetsReducer from './slices/presetsSlice';

export const store = configureStore({
  reducer: {
    audio: audioReducer,
    timeline: timelineReducer,
    composition: compositionReducer,
    ui: uiReducer,
    media: mediaReducer,
    project: projectReducer,
    effects: effectsReducer,
    presets: presetsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;