import React, { useState, useCallback } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { updateEvent, removeEvent, setSelectedEvent } from '../store/slices/timelineSlice';
import { TimelineEvent as TimelineEventType } from '../store/slices/timelineSlice';
import '../styles/TimelineEvent.scss';

interface TimelineEventProps {
  event: TimelineEventType;
  duration: number;
  zoom: number;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({ event, duration, zoom }) => {
  const dispatch = useAppDispatch();
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', event.id);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const timelineWidth = e.currentTarget.parentElement?.clientWidth || 0;
    const newStartTime = (e.clientX / timelineWidth) * duration;
    const eventDuration = event.endTime - event.startTime;
    
    dispatch(updateEvent({
      ...event,
      startTime: newStartTime,
      endTime: newStartTime + eventDuration
    }));
  };

  const handleClick = () => {
    dispatch(setSelectedEvent(event.id));
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeEvent(event.id));
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, edge: 'left' | 'right') => {
    e.stopPropagation();
    setIsResizing(edge);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(null);
  }, []);

  const handleResize = useCallback((e: React.MouseEvent) => {
    if (!isResizing) return;

    const timelineWidth = e.currentTarget.parentElement?.clientWidth || 0;
    const newTime = (e.clientX / timelineWidth) * duration;

    if (isResizing === 'left') {
      dispatch(updateEvent({
        ...event,
        startTime: Math.min(newTime, event.endTime - 0.1)
      }));
    } else {
      dispatch(updateEvent({
        ...event,
        endTime: Math.max(newTime, event.startTime + 0.1)
      }));
    }
  }, [isResizing, event, duration, dispatch]);

  const left = (event.startTime / duration) * 100;
  const width = ((event.endTime - event.startTime) / duration) * 100;

  return (
    <div 
      className={`timeline-event ${event.type}`}
      style={{ left: `${left}%`, width: `${width * (zoom / 100)}%` }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onMouseMove={handleResize}
      onMouseUp={handleResizeEnd}
      onMouseLeave={handleResizeEnd}
    >
      <div 
        className="resize-handle left"
        onMouseDown={(e) => handleResizeStart(e, 'left')}
      />
      <span>{event.type}</span>
      <button onClick={handleRemove}>X</button>
      <div 
        className="resize-handle right"
        onMouseDown={(e) => handleResizeStart(e, 'right')}
      />
    </div>
  );
};

export default TimelineEvent;