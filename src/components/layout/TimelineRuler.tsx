import React from 'react';

interface TimelineRulerProps {
  duration: number;
  zoom: number;
  frameRate: number;
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({ duration, zoom, frameRate }) => {
  const totalFrames = Math.ceil(duration * frameRate);
  const tickInterval = Math.max(1, Math.floor(frameRate / 4));

  const ticks = Array.from({ length: totalFrames }, (_, i) => i).filter(i => i % tickInterval === 0);

  return (
    <div className="ae-timeline__ruler">
      {ticks.map(frame => {
        const time = frame / frameRate;
        const position = (time / duration) * 100 * zoom;
        return (
          <div
            key={frame}
            className="ae-timeline__ruler-tick"
            style={{ left: `${position}%` }}
          >
            <span className="ae-timeline__ruler-label">
              {frame === 0 ? '0:00' : `${Math.floor(time / 60)}:${(time % 60).toFixed(2).padStart(5, '0')}`}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineRuler;