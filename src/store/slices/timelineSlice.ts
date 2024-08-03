import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Keyframe {
  time: number;
  value: number;
}

export interface Effect {
  type: 'blur' | 'brightness' | 'contrast' | 'saturation';
  keyframes: Keyframe[];
}

export interface TimelineEvent {
  id: string;
  startTime: number;
  endTime: number;
  type: 'image' | 'video' | 'audio';
  mediaUrl: string;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  effects: Effect[];
}

interface TimelineState {
  events: TimelineEvent[];
  selectedEventId: string | null;
  zoom: number;
  past: Omit<TimelineState, 'past' | 'future'>[];
  future: Omit<TimelineState, 'past' | 'future'>[];
}

const initialState: TimelineState = {
  events: [],
  selectedEventId: null,
  zoom: 100,
  past: [],
  future: [],
};

const pushPast = (state: TimelineState) => {
  state.past.push({
    events: state.events,
    selectedEventId: state.selectedEventId,
    zoom: state.zoom,
  });
  state.future = [];
};

const timelineSlice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    addEvent: (state, action: PayloadAction<TimelineEvent>) => {
      pushPast(state);
      state.events.push(action.payload);
    },
    removeEvent: (state, action: PayloadAction<string>) => {
      pushPast(state);
      state.events = state.events.filter(event => event.id !== action.payload);
    },
    updateEvent: (state, action: PayloadAction<TimelineEvent>) => {
      pushPast(state);
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    setSelectedEvent: (state, action: PayloadAction<string | null>) => {
      state.selectedEventId = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    addKeyframe: (state, action: PayloadAction<{ eventId: string; effectType: Effect['type']; keyframe: Keyframe }>) => {
      pushPast(state);
      const event = state.events.find(e => e.id === action.payload.eventId);
      if (event) {
        const effect = event.effects.find(e => e.type === action.payload.effectType);
        if (effect) {
          effect.keyframes.push(action.payload.keyframe);
        } else {
          event.effects.push({ type: action.payload.effectType, keyframes: [action.payload.keyframe] });
        }
      }
    },
    removeKeyframe: (state, action: PayloadAction<{ eventId: string; effectType: Effect['type']; time: number }>) => {
      pushPast(state);
      const event = state.events.find(e => e.id === action.payload.eventId);
      if (event) {
        const effect = event.effects.find(e => e.type === action.payload.effectType);
        if (effect) {
          effect.keyframes = effect.keyframes.filter(k => k.time !== action.payload.time);
        }
      }
    },
    undo: (state) => {
      if (state.past.length > 0) {
        const previousState = state.past.pop()!;
        state.future.push({
          events: state.events,
          selectedEventId: state.selectedEventId,
          zoom: state.zoom,
        });
        state.events = previousState.events;
        state.selectedEventId = previousState.selectedEventId;
        state.zoom = previousState.zoom;
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const nextState = state.future.pop()!;
        state.past.push({
          events: state.events,
          selectedEventId: state.selectedEventId,
          zoom: state.zoom,
        });
        state.events = nextState.events;
        state.selectedEventId = nextState.selectedEventId;
        state.zoom = nextState.zoom;
      }
    },
  },
});

export const { 
  addEvent, 
  removeEvent, 
  updateEvent, 
  setSelectedEvent, 
  setZoom, 
  addKeyframe, 
  removeKeyframe,
  undo,
  redo
} = timelineSlice.actions;

export default timelineSlice.reducer;