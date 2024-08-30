import React, { useRef, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import {
  setCurrentTime,
  setPlaybackState,
  setInPoint,
  setOutPoint,
  setWorkArea,
  toggleLayerSolo,
  toggleLayerLock,
  setLayerQuality,
  setLayerShyness,
  toggleCompositionShyLayers,
  setLayerTimeRemapping,
} from '../../store/slices/timelineSlice';
import { RootState } from '../../store';
import { Layer, Transform } from '../../store/slices/types';
import TimelineLayer from './TimelineLayer';
import TimelineRuler from './TimelineRuler';
import { formatTime, snapToFrame } from '../../utils/timelineHelpers';
import '../../styles/components/layout/_Timeline.scss';

const Timeline: React.FC = () => {
  const dispatch = useAppDispatch();
  const timelineRef = useRef<HTMLDivElement>(null);

  const activeCompositionId = useAppSelector((state: RootState) => state.timeline.activeCompositionId);
  const composition = useAppSelector((state: RootState) => 
    state.timeline.compositions.find(c => c.id === activeCompositionId)
  );
  const currentTime = useAppSelector((state: RootState) => state.timeline.currentTime);
  const zoom = useAppSelector((state: RootState) => state.timeline.zoom);
  const playbackState = useAppSelector((state: RootState) => state.timeline.playbackState);
  const inPoint = useAppSelector((state: RootState) => state.timeline.inPoint);
  const outPoint = useAppSelector((state: RootState) => state.timeline.outPoint);
  const workArea = useAppSelector((state: RootState) => state.timeline.workArea);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current && composition) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedTime = snapToFrame((x / rect.width) * composition.duration, composition.frameRate);
      dispatch(setCurrentTime(Math.max(0, Math.min(clickedTime, composition.duration))));
    }
  }, [dispatch, composition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (composition) {
      switch (e.key) {
        case 'ArrowLeft':
          dispatch(setCurrentTime({ type: 'decrement', amount: 1 / composition.frameRate }));
          break;
        case 'ArrowRight':
          dispatch(setCurrentTime({ type: 'increment', amount: 1 / composition.frameRate }));
          break;
        case ' ':
          dispatch(setPlaybackState(playbackState === 'playing' ? 'paused' : 'playing'));
          break;
      }
    }
  }, [dispatch, composition, playbackState]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (timelineRef.current && composition) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = snapToFrame((x / rect.width) * composition.duration, composition.frameRate);
        dispatch(setCurrentTime(Math.max(0, Math.min(newTime, composition.duration))));
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = () => {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

    if (timelineRef.current) {
      timelineRef.current.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.removeEventListener('mousedown', handleMouseDown);
      }
    };
  }, [dispatch, composition]);

  const handleLayerClick = (layerId: string) => {
    // Implement layer selection logic
  };

  const handleAddKeyframe = (layerId: string, property: keyof Transform, time: number, value: number[]) => {
    dispatch(addKeyframe({ layerId, property, keyframe: { time, value, easing: 'linear' } }));
  };

  const handleRemoveKeyframe = (layerId: string, property: keyof Transform, time: number) => {
    dispatch(removeKeyframe({ layerId, property, time }));
  };

  const handleKeyframeClick = (layerId: string, property: keyof Transform, time: number) => {
    // Implement keyframe selection logic
  };

  const handleDuplicateLayer = (layerId: string) => {
    if (activeCompositionId) {
      dispatch(duplicateLayer({ compositionId: activeCompositionId, layerId }));
    }
  };

  const handleReorderLayers = (sourceIndex: number, destinationIndex: number) => {
    if (activeCompositionId) {
      dispatch(reorderLayers({ compositionId: activeCompositionId, sourceIndex, destinationIndex }));
    }
  };

  const handleTrimLayer = (layerId: string, newStartTime: number, newDuration: number) => {
    if (activeCompositionId) {
      dispatch(trimLayer({ compositionId: activeCompositionId, layerId, newStartTime, newDuration }));
    }
  };

  const handleSplitLayer = (layerId: string, splitTime: number) => {
    if (activeCompositionId) {
      dispatch(splitLayer({ compositionId: activeCompositionId, layerId, splitTime }));
    }
  };

  const handleToggleLayerSolo = (layerId: string) => {
    if (activeCompositionId) {
      dispatch(toggleLayerSolo({ compositionId: activeCompositionId, layerId }));
    }
  };

  const handleToggleLayerLock = (layerId: string) => {
    if (activeCompositionId) {
      dispatch(toggleLayerLock({ compositionId: activeCompositionId, layerId }));
    }
  };

  const handleSetLayerQuality = (layerId: string, quality: 'low' | 'medium' | 'high') => {
    if (activeCompositionId) {
      dispatch(setLayerQuality({ compositionId: activeCompositionId, layerId, quality }));
    }
  };

  const handleSetLayerShyness = (layerId: string, shy: boolean) => {
    if (activeCompositionId) {
      dispatch(setLayerShyness({ compositionId: activeCompositionId, layerId, shy }));
    }
  };

  const handleToggleCompositionShyLayers = () => {
    if (activeCompositionId) {
      dispatch(toggleCompositionShyLayers({ compositionId: activeCompositionId }));
    }
  };

  const handleSetTimeRemapping = (layerId: string, enabled: boolean, keyframes?: any[]) => {
    if (activeCompositionId) {
      dispatch(setLayerTimeRemapping({ compositionId: activeCompositionId, layerId, enabled, keyframes }));
    }
  };

  return (
    <div 
      className="ae-timeline" 
      ref={timelineRef}
      onClick={handleTimelineClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <TimelineRuler 
        duration={composition ? composition.duration : 0} 
        frameRate={composition ? composition.frameRate : 30} 
        zoom={zoom}
        inPoint={inPoint}
        outPoint={outPoint}
        workArea={workArea}
      />
      <div className="ae-timeline__layers">
        {composition && composition.layers.map((layer, index) => (
          <TimelineLayer
            key={layer.id}
            layer={layer}
            duration={composition.duration}
            currentTime={currentTime}
            zoom={zoom}
            frameRate={composition.frameRate}
            onClick={handleLayerClick}
            onToggleSolo={() => handleToggleLayerSolo(layer.id)}
            onToggleLock={() => handleToggleLayerLock(layer.id)}
            onSetQuality={(quality) => handleSetLayerQuality(layer.id, quality)}
            onSetShyness={(shy) => handleSetLayerShyness(layer.id, shy)}
            onSetTimeRemapping={(enabled, keyframes) => handleSetTimeRemapping(layer.id, enabled, keyframes)}
          />
        ))}
      </div>
      <div
        className="ae-timeline__playhead"
        style={{ left: `${(currentTime / (composition ? composition.duration : 1)) * 100 * zoom}%` }}
      />
      <div className="ae-timeline__controls">
        <button onClick={() => dispatch(setPlaybackState(playbackState === 'playing' ? 'paused' : 'playing'))}>
          {playbackState === 'playing' ? 'Pause' : 'Play'}
        </button>
        <button onClick={() => dispatch(setInPoint(currentTime))}>Set In Point</button>
        <button onClick={() => dispatch(setOutPoint(currentTime))}>Set Out Point</button>
        <button onClick={() => dispatch(setWorkArea({ start: currentTime, end: currentTime + 5 }))}>Set Work Area</button>
        <button onClick={handleToggleCompositionShyLayers}>Toggle Shy Layers</button>
      </div>
      <div className="ae-timeline__info">
        <span>Current Time: {formatTime(currentTime)}</span>
        <span>Duration: {formatTime(composition ? composition.duration : 0)}</span>
        <span>Frame Rate: {composition ? composition.frameRate : 30} fps</span>
      </div>
    </div>
  );
};

export default Timeline;