import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppSelector';
import { updateLayer, addKeyframe, removeKeyframe, updateKeyframe, Transform, Keyframe } from '../../store/slices/timelineSlice';
import '../../styles/components/panels/LayerProperties.scss';

const LayerProperties: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedLayerIds = useAppSelector(state => state.timeline.selectedLayerIds);
  const layers = useAppSelector(state => state.timeline.layers);
  const currentTime = useAppSelector(state => state.timeline.currentTime);

  const [selectedProperty, setSelectedProperty] = useState<keyof Transform | null>(null);

  const selectedLayer = layers.find(layer => layer.id === selectedLayerIds[0]);

  if (!selectedLayer) {
    return <div className="ae-layer-properties">No layer selected</div>;
  }

  const handleAddKeyframe = (property: keyof Transform) => {
    const currentValue = selectedLayer.transform[property].length > 0
      ? selectedLayer.transform[property][selectedLayer.transform[property].length - 1].value
      : property === 'opacity' ? [100] : [0, 0, 0];

    dispatch(addKeyframe({
      layerId: selectedLayer.id,
      property,
      keyframe: {
        time: currentTime,
        value: currentValue,
        easing: 'linear',
      },
    }));
  };

  const handleRemoveKeyframe = (property: keyof Transform, time: number) => {
    dispatch(removeKeyframe({
      layerId: selectedLayer.id,
      property,
      time,
    }));
  };

  const handleUpdateKeyframe = (property: keyof Transform, time: number, newValue: number[]) => {
    dispatch(updateKeyframe({
      layerId: selectedLayer.id,
      property,
      time,
      newKeyframe: { value: newValue },
    }));
  };

  const renderKeyframeEditor = (property: keyof Transform) => {
    const keyframes = selectedLayer.transform[property];

    return (
      <div className="ae-layer-properties__keyframe-editor">
        <h4>{property}</h4>
        {keyframes.map((keyframe, index) => (
          <div key={index} className="ae-layer-properties__keyframe">
            <input
              type="number"
              value={keyframe.time}
              onChange={(e) => handleUpdateKeyframe(property, keyframe.time, keyframe.value)}
            />
            {keyframe.value.map((v, i) => (
              <input
                key={i}
                type="number"
                value={v}
                onChange={(e) => {
                  const newValue = [...keyframe.value];
                  newValue[i] = parseFloat(e.target.value);
                  handleUpdateKeyframe(property, keyframe.time, newValue);
                }}
              />
            ))}
            <button onClick={() => handleRemoveKeyframe(property, keyframe.time)}>Remove</button>
          </div>
        ))}
        <button onClick={() => handleAddKeyframe(property)}>Add Keyframe</button>
      </div>
    );
  };

  return (
    <div className="ae-layer-properties">
      <h3>{selectedLayer.name}</h3>
      <div className="ae-layer-properties__section">
        <h4>Transform</h4>
        {Object.keys(selectedLayer.transform).map((property) => (
          <div key={property} className="ae-layer-properties__row">
            <label>{property}</label>
            <button onClick={() => setSelectedProperty(property as keyof Transform)}>
              Edit Keyframes
            </button>
          </div>
        ))}
      </div>
      {selectedProperty && renderKeyframeEditor(selectedProperty)}
    </div>
  );
};

export default LayerProperties;