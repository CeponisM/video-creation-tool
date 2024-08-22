import React, { useRef, useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppSelector';
import { setCurrentTime, setSelectedLayers, updateLayer, addKeyframe, removeKeyframe, updateKeyframe } from '../../store/slices/timelineSlice';
import { Layer, Transform, Keyframe } from '../../store/slices/timelineSlice';
import TimelineLayer from './TimelineLayer';
import TimelineRuler from './TimelineRuler';
import '../../styles/components/layout/Timeline.scss';

const Timeline: React.FC = () => {
  const dispatch = useAppDispatch();
  const layers = useAppSelector(state => state.timeline.layers);
  const currentTime = useAppSelector(state => state.timeline.currentTime);
  const zoom = useAppSelector(state => state.timeline.zoom);
  const duration = useAppSelector(state => state.composition.duration);
  const frameRate = useAppSelector(state => state.composition.frameRate);
  const [draggingLayer, setDraggingLayer] = useState<string | null>(null);
  const [draggingKeyframe, setDraggingKeyframe] = useState<{ layerId: string; property: keyof Transform; time: number } | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const newTime = (x / rect.width) * duration / zoom;

        if (draggingLayer) {
          dispatch(updateLayer({ id: draggingLayer, startTime: newTime }));
        } else if (draggingKeyframe) {
          dispatch(updateKeyframe({
            layerId: draggingKeyframe.layerId,
            property: draggingKeyframe.property,
            time: draggingKeyframe.time,
            newKeyframe: { time: newTime },
          }));
          setDraggingKeyframe({ ...draggingKeyframe, time: newTime });
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingLayer(null);
      setDraggingKeyframe(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingLayer, draggingKeyframe, dispatch, duration, zoom]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newTime = (x / rect.width) * duration / zoom;
      dispatch(setCurrentTime(newTime));
    }
  };

  const handleLayerClick = (layerId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      dispatch(setSelectedLayers([...layers.filter(l => l.selected).map(l => l.id), layerId]));
    } else {
      dispatch(setSelectedLayers([layerId]));
    }
  };

  const handleLayerDragStart = (layerId: string) => {
    setDraggingLayer(layerId);
  };

  const handleKeyframeDragStart = (layerId: string, property: keyof Transform, time: number) => {
    setDraggingKeyframe({ layerId, property, time });
  };

  const handleAddKeyframe = (layerId: string, property: keyof Transform, time: number, value: number[]) => {
    dispatch(addKeyframe({ layerId, property, keyframe: { time, value, easing: 'linear' } }));
  };

  const handleRemoveKeyframe = (layerId: string, property: keyof Transform, time: number) => {
    dispatch(removeKeyframe({ layerId, property, time }));
  };

  return (
    <div className="ae-timeline" ref={timelineRef} onClick={handleTimelineClick}>
      <TimelineRuler duration={duration} zoom={zoom} frameRate={frameRate} />
      <div className="ae-timeline__layers">
        {layers.map(layer => (
          <TimelineLayer
            key={layer.id}
            layer={layer}
            duration={duration}
            zoom={zoom}
            onClick={handleLayerClick}
            onDragStart={handleLayerDragStart}
            onKeyframeDragStart={handleKeyframeDragStart}
            onAddKeyframe={handleAddKeyframe}
            onRemoveKeyframe={handleRemoveKeyframe}
          />
        ))}
      </div>
      <div
        className="ae-timeline__playhead"
        style={{ left: `${(currentTime / duration) * 100 * zoom}%` }}
      />
    </div>
  );
};

export default Timeline;