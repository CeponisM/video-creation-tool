import React from 'react';
import { Layer, Transform, Keyframe } from '../../store/slices/types';
import { interpolateKeyframes } from '../../utils/timelineHelpers';

interface TimelineLayerProps {
  layer: Layer;
  duration: number;
  zoom: number;
  currentTime: number;
  frameRate: number;
  onClick: (layerId: string) => void;
  onToggleSolo: () => void;
  onToggleLock: () => void;
  onSetQuality: (quality: 'low' | 'medium' | 'high') => void;
  onSetShyness: (shy: boolean) => void;
  onSetTimeRemapping: (enabled: boolean, keyframes?: Keyframe[]) => void;
}

const TimelineLayer: React.FC<TimelineLayerProps> = ({
  layer,
  duration,
  zoom,
  currentTime,
  frameRate,
  onClick,
  onToggleSolo,
  onToggleLock,
  onSetQuality,
  onSetShyness,
  onSetTimeRemapping,
}) => {
  const layerStyle = {
    left: `${(layer.startTime / duration) * 100 * zoom}%`,
    width: `${(layer.duration / duration) * 100 * zoom}%`,
  };

  const renderKeyframes = (property: keyof Transform) => {
    const keyframes = layer.transform[property] as Keyframe[];
    return keyframes.map((keyframe, index) => (
      <div
        key={index}
        className={`ae-timeline__keyframe ae-timeline__keyframe--${keyframe.easing}`}
        style={{ left: `${(keyframe.time / duration) * 100 * zoom}%` }}
      />
    ));
  };

  const renderPropertyValue = (property: keyof Transform) => {
    const keyframes = layer.transform[property] as Keyframe[];
    const value = interpolateKeyframes(keyframes, currentTime);
    return value.map((v, i) => v.toFixed(2)).join(', ');
  };

  return (
    <div
      className={`ae-timeline__layer ${layer.selected ? 'ae-timeline__layer--selected' : ''} ${layer.solo ? 'ae-timeline__layer--solo' : ''} ${layer.locked ? 'ae-timeline__layer--locked' : ''} ${layer.shy ? 'ae-timeline__layer--shy' : ''}`}
      style={layerStyle}
      onClick={() => onClick(layer.id)}
    >
      <div className="ae-timeline__layer-controls">
        <button onClick={onToggleSolo}>S</button>
        <button onClick={onToggleLock}>L</button>
        <button onClick={() => onSetShyness(!layer.shy)}>Shy</button>
        <select onChange={(e) => onSetQuality(e.target.value as 'low' | 'medium' | 'high')} value={layer.quality}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="ae-timeline__layer-name">{layer.name}</div>
      <div className="ae-timeline__layer-properties">
        {(Object.keys(layer.transform) as Array<keyof Transform>).map((property) => (
          <div key={property} className="ae-timeline__layer-property">
            <span>{property}: {renderPropertyValue(property)}</span>
            <div className="ae-timeline__layer-keyframes">
              {renderKeyframes(property)}
            </div>
          </div>
        ))}
      </div>
      {layer.timeRemapping && (
        <div className="ae-timeline__layer-time-remapping">
          <button onClick={() => onSetTimeRemapping(!layer.timeRemapping!.enabled)}>
            {layer.timeRemapping.enabled ? 'Disable' : 'Enable'} Time Remapping
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineLayer;