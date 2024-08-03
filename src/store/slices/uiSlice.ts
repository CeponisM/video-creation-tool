import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  activeTab: 'variables' | 'media' | 'effects';
  showUnusedVariables: boolean;
}

const initialState: UIState = {
  isSidebarOpen: true,
  activeTab: 'variables',
  showUnusedVariables: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setActiveTab: (state, action: PayloadAction<'variables' | 'media' | 'effects'>) => {
      state.activeTab = action.payload;
    },
    toggleUnusedVariables: (state) => {
      state.showUnusedVariables = !state.showUnusedVariables;
    },
  },
});

export const { toggleSidebar, setActiveTab, toggleUnusedVariables } = uiSlice.actions;
export default uiSlice.reducer;