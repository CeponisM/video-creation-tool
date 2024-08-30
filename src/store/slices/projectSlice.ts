import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
}

interface ProjectState {
  assets: Asset[];
}

const initialState: ProjectState = {
  assets: [],
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    addAsset: (state, action: PayloadAction<Asset>) => {
      state.assets.push(action.payload);
    },
    removeAsset: (state, action: PayloadAction<string>) => {
      state.assets = state.assets.filter(asset => asset.id !== action.payload);
    },
    setProjectName: (state, action: PayloadAction<string>) => {
      // Implement if needed
    },
  },
});

export const { addAsset, removeAsset, setProjectName } = projectSlice.actions;
export default projectSlice.reducer;