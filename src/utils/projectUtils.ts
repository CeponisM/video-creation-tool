import { RootState } from '../store';

export const saveProject = (state: RootState) => {
  const projectData = JSON.stringify(state);
  localStorage.setItem('avEditorProject', projectData);
};

export const loadProject = (): RootState | null => {
  const projectData = localStorage.getItem('avEditorProject');
  if (projectData) {
    return JSON.parse(projectData) as RootState;
  }
  return null;
};
