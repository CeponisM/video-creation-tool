import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addEffect, removeEffect, updateEffect, Effect, EffectParameter, Keyframe } from '../../store/slices/timelineSlice';
import Slider from '../common/Slider';
import { ColorPicker } from '../common/ColorPicker';
import '../../styles/components/panels/_EffectsPanel.scss';

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
  {
    name: 'Chromatic Aberration',
    type: 'chromaticAberration',
    defaultParameters: [
      { name: 'Offset', type: 'number', keyframes: [{ time: 0, value: [0.005], easing: 'linear' }] },
    ],
  },
];

const EffectsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const selectedLayerIds = useAppSelector(state => state.timeline.selectedLayerIds);
  const activeCompositionId = useAppSelector(state => state.timeline.activeCompositionId);
  const compositions = useAppSelector(state => state.timeline.compositions);
  const currentTime = useAppSelector(state => state.timeline.currentTime);

  const [selectedEffectId, setSelectedEffectId] = useState<string | null>(null);

  const activeComposition = compositions.find(c => c.id === activeCompositionId);
  const selectedLayer = activeComposition?.layers.find(layer => layer.id === selectedLayerIds[0]);

  const handleAddEffect = (effectType: string) => {
    if (selectedLayer) {
      const effectToAdd = availableEffects.find(e => e.type === effectType);
      if (effectToAdd) {
        const newEffect: Effect = {
          id: `effect-${Date.now()}`,
          name: effectToAdd.name,
          type: effectToAdd.type,
          parameters: effectToAdd.defaultParameters,
        };
        dispatch(addEffect({ layerId: selectedLayer.id, effect: newEffect }));
        setSelectedEffectId(newEffect.id);
      }
    }
  };

  const handleRemoveEffect = (effectId: string) => {
    if (selectedLayer) {
      dispatch(removeEffect({ layerId: selectedLayer.id, effectId }));
      setSelectedEffectId(null);
    }
  };

  const handleUpdateEffectParameter = (effect: Effect, paramName: string, value: number | string) => {
    if (selectedLayer) {
      const updatedParameters = effect.parameters.map(p =>
        p.name === paramName
          ? {
              ...p,
              keyframes: [
                { time: currentTime, value: Array.isArray(value) ? value : [value], easing: 'linear' } as Keyframe,
                ...p.keyframes
              ]
            }
          : p
      );
      dispatch(updateEffect({
        layerId: selectedLayer.id,
        effectId: effect.id,
        updates: { parameters: updatedParameters },
      }));
    }
  };

  const renderEffectControls = (effect: Effect) => {
    return effect.parameters.map((param: EffectParameter) => (
      <div key={param.name} className="ae-effects-panel__parameter">
        <label>{param.name}</label>
        {param.type === 'number' ? (
          <Slider
            min={0}
            max={param.name.toLowerCase().includes('opacity') ? 1 : 100}
            step={0.01}
            value={param.keyframes[0].value[0] as number}
            onChange={(value: number) => handleUpdateEffectParameter(effect, param.name, value)}
          />
        ) : param.type === 'color' ? (
          <ColorPicker
            color={param.keyframes[0].value[0].toString()}
            onChange={(color: string) => handleUpdateEffectParameter(effect, param.name, color)}
          />
        ) : null}
      </div>
    ));
  };

  if (!activeComposition) {
    return <div className="ae-effects-panel">No active composition</div>;
  }

  return (
    <div className="ae-effects-panel">
      <h3>Effects</h3>
      {selectedLayer ? (
        <>
          <div className="ae-effects-panel__effects-list">
            {selectedLayer.effects.map((effect: Effect) => (
              <div
                key={effect.id}
                className={`ae-effects-panel__effect ${selectedEffectId === effect.id ? 'selected' : ''}`}
                onClick={() => setSelectedEffectId(effect.id)}
              >
                <span>{effect.name}</span>
                <button onClick={() => handleRemoveEffect(effect.id)}>Remove</button>
              </div>
            ))}
          </div>
          {selectedEffectId && (
            <div className="ae-effects-panel__effect-controls">
              {renderEffectControls(selectedLayer.effects.find(e => e.id === selectedEffectId)!)}
            </div>
          )}
          <div className="ae-effects-panel__add-effect">
            <select onChange={(e) => handleAddEffect(e.target.value)}>
              <option value="">Add Effect</option>
              {availableEffects.map(effect => (
                <option key={effect.type} value={effect.type}>{effect.name}</option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <p>Select a layer to add effects</p>
      )}
    </div>
  );
};

export default EffectsPanel;
