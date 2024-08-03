import React, { useCallback, useMemo } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setBackgroundColor } from '../store/slices/compositionSlice';
import { saveProject, loadProject } from '../utils/projectUtils';
import { undo, redo } from '../store/slices/timelineSlice';
import '../styles/Header.scss';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const past = useAppSelector(state => state.timeline.past);
  const future = useAppSelector(state => state.timeline.future);
  const backgroundColor = useAppSelector(state => state.composition.backgroundColor);
  const state = useAppSelector(state => state);

  const handleNewProject = useCallback(() => {
    if (window.confirm('Are you sure you want to start a new project? All unsaved changes will be lost.')) {
      window.location.reload();
    }
  }, []);

  const handleSaveProject = useCallback(() => {
    saveProject(state);
    alert('Project saved successfully!');
  }, [state]);

  const handleLoadProject = useCallback(() => {
    const loadedState = loadProject();
    if (loadedState) {
      // You would need to create an action to load the entire state
      // dispatch(loadEntireState(loadedState));
      alert('Project loaded successfully!');
    } else {
      alert('No saved project found.');
    }
  }, []);

  const handleExport = useCallback(() => {
    // Implement export logic here
    console.log('Export project');
  }, []);

  const handleThemeToggle = useCallback(() => {
    document.body.classList.toggle('dark-theme');
  }, []);

  const handleRandomColor = useCallback(() => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    dispatch(setBackgroundColor(`#${randomColor}`));
  }, [dispatch]);

  const handleUndo = useCallback(() => {
    dispatch(undo());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(redo());
  }, [dispatch]);

  const navButtons = useMemo(() => [
    { label: 'New Project', onClick: handleNewProject },
    { label: 'Save Project', onClick: handleSaveProject },
    { label: 'Load Project', onClick: handleLoadProject },
    { label: 'Export', onClick: handleExport },
    { label: 'Toggle Theme', onClick: handleThemeToggle },
    { label: 'Random BG Color', onClick: handleRandomColor },
    { label: 'Undo', onClick: handleUndo, disabled: past.length === 0 },
    { label: 'Redo', onClick: handleRedo, disabled: future.length === 0 },
  ], [handleNewProject, handleSaveProject, handleLoadProject, handleExport, handleThemeToggle, handleRandomColor, handleUndo, handleRedo, past.length, future.length]);

  return (
    <header className="main-header">
      <div className="logo">AV Editor</div>
      <nav>
        {navButtons.map(button => (
          <button key={button.label} onClick={button.onClick} disabled={button.disabled}>
            {button.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default React.memo(Header);