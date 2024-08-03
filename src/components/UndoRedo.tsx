import React from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { undo, redo } from '../store/slices/timelineSlice';
import '../styles/UndoRedo.scss';

const UndoRedo: React.FC = () => {
  const dispatch = useAppDispatch();
  const { past, future } = useAppSelector(state => state.timeline);

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  return (
    <div className="undo-redo">
      <button onClick={handleUndo} disabled={past.length === 0}>Undo</button>
      <button onClick={handleRedo} disabled={future.length === 0}>Redo</button>
    </div>
  );
};

export default UndoRedo;
