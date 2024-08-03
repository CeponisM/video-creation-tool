import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCurrentTime } from '../store/slices/audioSlice';
import { addEvent, updateEvent, removeEvent, TimelineEvent, setZoom } from '../store/slices/timelineSlice';
import '../styles/Timeline.scss';

const Timeline: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineEventsRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { fileName, duration, currentTime, waveformData } = useAppSelector(state => state.audio);
  const { zoom, events } = useAppSelector(state => state.timeline);
  const [resizingEvent, setResizingEvent] = useState<{ id: string, edge: 'left' | 'right' } | null>(null);
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [timelineWidth, setTimelineWidth] = useState(800);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();

    const step = width / waveformData.length;
    for (let i = 0; i < waveformData.length; i++) {
      const x = i * step;
      const y = (1 - waveformData[i]) * height / 2;
      ctx.moveTo(x, height / 2);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [waveformData]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform, timelineWidth]);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / rect.width) * duration;
    dispatch(setCurrentTime(newTime));
  }, [duration, dispatch]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dropTime = (x / rect.width) * duration;

    const mediaData = e.dataTransfer.getData('application/json');
    if (mediaData) {
      const media = JSON.parse(mediaData);
      dispatch(addEvent({
        id: Date.now().toString(),
        startTime: dropTime,
        endTime: dropTime + (media.type === 'image' ? 5 : (media.duration || 10)),
        type: media.type,
        mediaUrl: media.url,
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        effects: []
      }));
    }
  }, [duration, dispatch]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleResizeStart = useCallback((id: string, edge: 'left' | 'right') => {
    setResizingEvent({ id, edge });
  }, []);

  const handleResizeEnd = useCallback(() => {
    setResizingEvent(null);
  }, []);

  const handleResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!resizingEvent || !timelineEventsRef.current) return;

    const rect = timelineEventsRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newTime = (x / rect.width) * duration;

    const event = events.find(ev => ev.id === resizingEvent.id);
    if (event) {
      const updatedEvent: TimelineEvent = { ...event };
      if (resizingEvent.edge === 'left') {
        updatedEvent.startTime = Math.min(newTime, event.endTime - 0.1);
      } else {
        updatedEvent.endTime = Math.max(newTime, event.startTime + 0.1);
      }
      dispatch(updateEvent(updatedEvent));
    }
  }, [resizingEvent, duration, events, dispatch]);

  const handleDragStart = useCallback((id: string) => {
    setDraggingEvent(id);
  }, []);

  const handleDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingEvent || !timelineEventsRef.current) return;

    const rect = timelineEventsRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newStartTime = (x / rect.width) * duration;

    const event = events.find(ev => ev.id === draggingEvent);
    if (event) {
      const eventDuration = event.endTime - event.startTime;
      const updatedEvent: TimelineEvent = {
        ...event,
        startTime: newStartTime,
        endTime: newStartTime + eventDuration
      };
      dispatch(updateEvent(updatedEvent));
    }
  }, [draggingEvent, duration, events, dispatch]);

  const handleDragEnd = useCallback(() => {
    setDraggingEvent(null);
  }, []);

  const handleRemoveEvent = useCallback((id: string) => {
    dispatch(removeEvent(id));
  }, [dispatch]);

  const handleTimelineResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingTimeline && timelineEventsRef.current) {
      const newWidth = e.clientX - timelineEventsRef.current.getBoundingClientRect().left;
      setTimelineWidth(newWidth);
      dispatch(setZoom((newWidth / 800) * 100));
    }
  }, [isDraggingTimeline, dispatch]);

  const startTimelineResize = useCallback(() => {
    setIsDraggingTimeline(true);
  }, []);

  const endTimelineResize = useCallback(() => {
    setIsDraggingTimeline(false);
  }, []);

  const timelineEvents = useMemo(() => events.map(event => (
    <div
      key={event.id}
      className={`timeline-event ${event.type}`}
      style={{
        left: `${(event.startTime / duration) * 100}%`,
        width: `${((event.endTime - event.startTime) / duration) * 100}%`
      }}
      onMouseDown={() => handleDragStart(event.id)}
    >
      <div 
        className="resize-handle left"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleResizeStart(event.id, 'left');
        }}
      ></div>
      {event.type === 'image' && <img src={event.mediaUrl} alt="Timeline event" />}
      {event.type === 'video' && <video src={event.mediaUrl}></video>}
      {event.type === 'audio' && <div className="audio-preview">🎵</div>}
      <button className="remove-event" onClick={() => handleRemoveEvent(event.id)}>×</button>
      <div 
        className="resize-handle right"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleResizeStart(event.id, 'right');
        }}
      ></div>
    </div>
  )), [events, duration, handleDragStart, handleResizeStart, handleRemoveEvent]);

  return (
    <div 
      className="timeline"
      onClick={handleTimelineClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseMove={(e) => {
        handleResize(e);
        handleDrag(e);
        handleTimelineResize(e);
      }}
      onMouseUp={() => {
        handleResizeEnd();
        handleDragEnd();
        endTimelineResize();
      }}
    >
      <canvas ref={canvasRef} width={timelineWidth} height={100}></canvas>
      <div 
        ref={timelineEventsRef}
        className="timeline-events" 
        style={{ width: `${timelineWidth}px` }}
      >
        {timelineEvents}
        <div 
          className="playhead"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        ></div>
        <div 
          className="timeline-resize-handle"
          onMouseDown={startTimelineResize}
        ></div>
      </div>
      <div className="timeline-info">
        <span>Duration: {duration.toFixed(2)}s</span>
        <span>Current Time: {currentTime.toFixed(2)}s</span>
        <span>Zoom: {zoom.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default React.memo(Timeline);
