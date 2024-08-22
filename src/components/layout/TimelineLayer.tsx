import React from 'react';
import { Layer, Transform, Keyframe } from '../../store/slices/timelineSlice';

interface TimelineLayerProps {
  layer: Layer;
  duration: number;
  zoom: number;
  onClick: (layerId: string, e: React.MouseEvent) => void;
  onDragStart: (layerId: string) => void;
  onKeyframeDragStart: (layerId: string, property: keyof Transform, time: number) => void;
  onAddKeyframe: (layerId: string, property: keyof Transform, time: number, value: number[]) => void;
  onRemoveKeyframe: (layerId: string, property: keyof Transform, time: number) => void;
}

const TimelineLayer: React.FC<TimelineLayerProps> = ({
  layer,
  duration,
  zoom,
  onClick,
  onDragStart,
  onKeyframeDragStart,
  onAddKeyframe,
  onRemoveKeyframe,
}) => {
  const layerStyle = {
    left: `${(layer.startTime / duration) * 100 * zoom}%`,
    width: `${((layer.duration) / duration) * 100 * zoom}%`,
  };

  const renderKeyframes = (property: keyof Transform) => {
    const keyframes = layer.transform[property] as Keyframe[];
    return keyframes.map((keyframe, index) => (
      <div
        key={index}
        className={`ae-timeline__keyframe ae-timeline__keyframe--${keyframe.easing}`}
        style={{ left: `${(keyframe.time / duration) * 100 * zoom}%` }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onKeyframeDragStart(layer.id, property, keyframe.time);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onRemoveKeyframe(layer.id, property, keyframe.time);
        }}
      />
    ));
  };

  return (
    <div
      className={`ae-timeline__layer ${layer.selected ? 'ae-timeline__layer--selected' : ''}`}
      style={layerStyle}
      onClick={(e) => onClick(layer.id, e)}
      onMouseDown={() => onDragStart(layer.id)}
    >
      <div className="ae-timeline__layer-name">{layer.name}</div>
      <div className="ae-timeline__layer-properties">
      {(Object.keys(layer.transform) as Array<keyof Transform>).map((property) => (
          <div key={property} className="ae-timeline__layer-property">
            <span>{property}</span>
            <div className="ae-timeline__layer-keyframes">
              {renderKeyframes(property)}
            </div>
          </div>
        ))}
      </div>
      {layer.effects.map(effect => (
        <div key={effect.id} className="ae-timeline__layer-effect">
          <span>{effect.name}</span>
          <div className="ae-timeline__layer-keyframes">
            {effect.parameters.map(param => renderKeyframes(param.name as keyof Transform))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineLayer;