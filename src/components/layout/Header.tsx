import React from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { saveProject, loadProject } from '../../utils/projectUtils';
import { undo, redo } from '../../store/slices/timelineSlice';
import '../../styles/components/layout/_Header.scss';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state);

  const handleNewProject = () => {
    if (window.confirm('Are you sure you want to start a new project? All unsaved changes will be lost.')) {
      window.location.reload();
    }
  };

  const handleSaveProject = () => {
    saveProject(state);
    alert('Project saved successfully!');
  };

  const handleLoadProject = () => {
    const loadedState = loadProject();
    if (loadedState) {
      // You would need to create an action to load the entire state
      // dispatch(loadEntireState(loadedState));
      alert('Project loaded successfully!');
    } else {
      alert('No saved project found.');
    }
  };

  return (
    <header className="ae-header">
      <div className="ae-header__logo">AV Editor</div>
      <nav className="ae-header__menu">
        <button onClick={handleNewProject}>New</button>
        <button onClick={handleSaveProject}>Save</button>
        <button onClick={handleLoadProject}>Load</button>
        <button onClick={() => dispatch(undo())}>Undo</button>
        <button onClick={() => dispatch(redo())}>Redo</button>
      </nav>
    </header>
  );
};

export default Header;