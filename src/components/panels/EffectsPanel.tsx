import React from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppSelector';
import { addEffect, removeEffect, updateEffect, addEffectKeyframe, removeEffectKeyframe, Effect, EffectParameter } from '../../store/slices/timelineSlice';
import '../../styles/components/panels/EffectsPanel.scss';

const availableEffects: { name: string; type: string; defaultParameters: EffectParameter[] }[] = [
  {
    name: 'Blur',
    type: 'blur',
    defaultParameters: [
      { name: 'Radius', type: 'number', keyframes: [{ time: 0, value: [5], easing: 'linear' }] },
    ],
  },
  {
    name: 'Color Correction',
    type: 'colorCorrection',
    defaultParameters: [
      { name: 'Brightness', type: 'number', keyframes: [{ time: 0, value: [1], easing: 'linear' }] },
      { name: 'Contrast', type: 'number', keyframes: [{ time: 0, value: [1], easing: 'linear' }] },
      { name: 'Saturation', type: 'number', keyframes: [{ time: 0, value: [1], easing: 'linear' }] },
    ],
  },
  {
    name: 'Glow',
    type: 'glow',
    defaultParameters: [
      { name: 'Intensity', type: 'number', keyframes: [{ time: 0, value: [1], easing: 'linear' }] },
      { name: 'Threshold', type: 'number', keyframes: [{ time: 0, value: [0.5], easing: 'linear' }] },
    ],
  },
];

const EffectsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedLayerIds = useAppSelector(state => state.timeline.selectedLayerIds);
  const layers = useAppSelector(state => state.timeline.layers);
  const currentTime = useAppSelector(state => state.timeline.currentTime);

  const selectedLayer = layers.find(layer => layer.id === selectedLayerIds[0]);

  const handleAddEffect = (effectType: string) => {
    if (selectedLayer) {
      const effectToAdd = availableEffects.find(e => e.type === effectType);
      if (effectToAdd) {
        dispatch(addEffect({
          layerId: selectedLayer.id,
          effect: {
            id: `effect-${Date.now()}`,
            name: effectToAdd.name,
            type: effectToAdd.type,
            parameters: effectToAdd.defaultParameters,
          },
        }));
      }
    }
  };

  const handleRemoveEffect = (effectId: string) => {
    if (selectedLayer) {
      dispatch(removeEffect({ layerId: selectedLayer.id, effectId }));
    }
  };

  const handleUpdateEffectParameter = (effect: Effect, parameterName: string, value: number) => {
    if (selectedLayer) {
      const updatedParameters = effect.parameters.map(p =>
        p.name === parameterName
          ? { ...p, keyframes: [{ time: currentTime, value: [value], easing: 'linear' }, ...p.keyframes] }
          : p
      );
      dispatch(updateEffect({
        layerId: selectedLayer.id,
        effectId: effect.id,
        updates: { parameters: updatedParameters },
      }));
    }
  };

  return (
    <div className="ae-effects-panel">
      <h3>Effects</h3>
      {selectedLayer ? (
        <>
          <div className="ae-effects-panel__current">
            <h4>Current Effects</h4>
            {selectedLayer.effects.map(effect => (
              <div key={effect.id} className="ae-effects-panel__effect">
                <h5>{effect.name}</h5>
                {effect.parameters.map(param => (
                  <div key={param.name} className="ae-effects-panel__parameter">
                    <label>{param.name}</label>
                    <input
                      type="number"
                      value={param.keyframes[0].value[0]}
                      onChange={(e) => handleUpdateEffectParameter(effect, param.name, parseFloat(e.target.value))}
                    />
                  </div>
                ))}
                <button onClick={() => handleRemoveEffect(effect.id)}>Remove Effect</button>
              </div>
            ))}
          </div>
          <div className="ae-effects-panel__available">
            <h4>Available Effects</h4>
            {availableEffects.map(effect => (
              <button
                key={effect.type}
                className="ae-effects-panel__add-effect"
                onClick={() => handleAddEffect(effect.type)}
              >
                Add {effect.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p>Select a layer to add effects</p>
      )}
    </div>
  );
};

export default EffectsPanel;
