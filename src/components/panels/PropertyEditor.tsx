import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateLayerTransform, setLayerAs3D, setLayerBlendingMode, setLayerParent, setLayerMotionBlur, Layer, Transform } from '../../store/slices/timelineSlice';
import ExpressionEditor from './ExpressionEditor';
import '../../styles/components/panels/_PropertyEditor.scss';

const PropertyEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeCompositionId = useAppSelector(state => state.timeline.activeCompositionId);
  const selectedLayerIds = useAppSelector(state => state.timeline.selectedLayerIds);
  const compositions = useAppSelector(state => state.timeline.compositions);

  const [editingExpression, setEditingExpression] = useState<{ property: keyof Transform } | null>(null);

  const activeComposition = compositions.find(c => c.id === activeCompositionId);
  const selectedLayer = activeComposition?.layers.find(layer => layer.id === selectedLayerIds[0]);

  if (!activeComposition || !selectedLayer) {
    return <div className="ae-property-editor">No layer selected</div>;
  }

  const handlePropertyChange = (property: keyof Transform, index: number, value: number) => {
    const updatedTransform = { ...selectedLayer.transform };
    (updatedTransform[property] as number[])[index] = value;

    dispatch(updateLayerTransform({
      compositionId: activeComposition.id,
      layerId: selectedLayer.id,
      transform: updatedTransform,
    }));
  };

  const handleSetLayerAs3D = (is3D: boolean) => {
    dispatch(setLayerAs3D({
      compositionId: activeComposition.id,
      layerId: selectedLayer.id,
      is3D,
    }));
  };

  const handleSetBlendingMode = (blendingMode: Layer['blendingMode']) => {
    dispatch(setLayerBlendingMode({
      compositionId: activeComposition.id,
      layerId: selectedLayer.id,
      blendingMode,
    }));
  };

  const handleSetParent = (parentId: string | null) => {
    dispatch(setLayerParent({
      compositionId: activeComposition.id,
      layerId: selectedLayer.id,
      parentId,
    }));
  };

  const handleSetMotionBlur = (motionBlur: boolean, samples?: number) => {
    dispatch(setLayerMotionBlur({
      compositionId: activeComposition.id,
      layerId: selectedLayer.id,
      motionBlur,
      samples,
    }));
  };

  const renderProperty = (property: keyof Transform, label: string) => {
    const value = selectedLayer.transform[property] as number[];
    const expression = selectedLayer.transform.expressions[property];

    return (
      <div className="ae-property-editor__property">
        <span className="ae-property-editor__label">{label}</span>
        <div className="ae-property-editor__inputs">
          {value.map((v, index) => (
            <input
              key={index}
              type="number"
              value={v}
              onChange={(e) => handlePropertyChange(property, index, parseFloat(e.target.value))}
            />
          ))}
        </div>
        <button onClick={() => setEditingExpression({ property })}>
          {expression?.enabled ? 'fx' : 'f(x)'}
        </button>
      </div>
    );
  };

  return (
    <div className="ae-property-editor">
      <h3>Layer Properties</h3>
      {renderProperty('position', 'Position')}
      {renderProperty('scale', 'Scale')}
      {renderProperty('rotation', 'Rotation')}
      {renderProperty('opacity', 'Opacity')}
      {renderProperty('anchorPoint', 'Anchor Point')}
      
      <div className="ae-property-editor__3d-options">
        <label>
          <input
            type="checkbox"
            checked={selectedLayer.is3D}
            onChange={(e) => handleSetLayerAs3D(e.target.checked)}
          />
          3D Layer
        </label>
      </div>

      <div className="ae-property-editor__blending-mode">
        <label>Blending Mode:</label>
        <select
          value={selectedLayer.blendingMode}
          onChange={(e) => handleSetBlendingMode(e.target.value as Layer['blendingMode'])}
        >
          <option value="normal">Normal</option>
          <option value="add">Add</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="overlay">Overlay</option>
        </select>
      </div>

      <div className="ae-property-editor__parent">
        <label>Parent Layer:</label>
        <select
          value={selectedLayer.parentId || ''}
          onChange={(e) => handleSetParent(e.target.value || null)}
        >
          <option value="">None</option>
          {activeComposition.layers
            .filter(layer => layer.id !== selectedLayer.id)
            .map(layer => (
              <option key={layer.id} value={layer.id}>{layer.name}</option>
            ))
          }
        </select>
      </div>

      <div className="ae-property-editor__motion-blur">
        <label>
          <input
            type="checkbox"
            checked={selectedLayer.motionBlur}
            onChange={(e) => handleSetMotionBlur(e.target.checked)}
          />
          Motion Blur
        </label>
        {selectedLayer.motionBlur && (
          <div>
            <label>Samples:</label>
            <input
              type="number"
              value={selectedLayer.motionBlurSamples}
              onChange={(e) => handleSetMotionBlur(true, parseInt(e.target.value))}
              min="1"
              max="64"
            />
          </div>
        )}
      </div>

      {editingExpression && (
        <ExpressionEditor
          compositionId={activeComposition.id}
          layerId={selectedLayer.id}
          property={editingExpression.property}
          onClose={() => setEditingExpression(null)}
        />
      )}
    </div>
  );
};

export default PropertyEditor;
