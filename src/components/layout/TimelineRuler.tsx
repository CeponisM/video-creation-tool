import React from 'react';
import { formatTime } from '../../utils/timelineHelpers';

interface TimelineRulerProps {
  duration: number;
  frameRate: number;
  zoom: number;
  inPoint: number;
  outPoint: number;
  workArea: { start: number; end: number };
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({
  duration,
  frameRate,
  zoom,
  inPoint,
  outPoint,
  workArea,
}) => {
  const tickInterval = Math.max(1, Math.floor(frameRate / 4));
  const totalFrames = Math.ceil(duration * frameRate);

  const renderTicks = () => {
    const ticks = [];
    for (let frame = 0; frame <= totalFrames; frame += tickInterval) {
      const time = frame / frameRate;
      const position = (time / duration) * 100 * zoom;
      ticks.push(
        <div key={frame} className="ae-timeline__ruler-tick" style={{ left: `${position}%` }}>
          <span className="ae-timeline__ruler-label">{formatTime(time)}</span>
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="ae-timeline__ruler">
      {renderTicks()}
      <div className="ae-timeline__in-point" style={{ left: `${(inPoint / duration) * 100 * zoom}%` }} />
      <div className="ae-timeline__out-point" style={{ left: `${(outPoint / duration) * 100 * zoom}%` }} />
      <div
        className="ae-timeline__work-area"
        style={{
          left: `${(workArea.start / duration) * 100 * zoom}%`,
          width: `${((workArea.end - workArea.start) / duration) * 100 * zoom}%`,
        }}
      />
    </div>
  );
};

export default TimelineRuler;