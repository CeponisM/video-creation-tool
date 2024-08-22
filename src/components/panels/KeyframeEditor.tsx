import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useAppSelector';
import { updateKeyframe, Layer, Transform, Keyframe } from '../../store/slices/timelineSlice';
import '../../styles/components/panels/KeyframeEditor.scss';

interface KeyframeEditorProps {
  layer: Layer;
  property: keyof Transform;
  time: number;
  onClose: () => void;
  onRemove: (property: keyof Transform, time: number) => void;
}

const KeyframeEditor: React.FC<KeyframeEditorProps> = ({ layer, property, time, onClose, onRemove }) => {
  const dispatch = useAppDispatch();
  const [keyframe, setKeyframe] = useState<Keyframe | null>(null);

  useEffect(() => {
    const foundKeyframe = (layer.transform[property] as Keyframe[]).find(k => k.time === time);
    if (foundKeyframe) {
      setKeyframe(foundKeyframe);
    }
  }, [layer, property, time]);

  if (!keyframe) return null;

  const handleValueChange = (index: number, value: number) => {
    const newValue = [...keyframe.value];
    newValue[index] = value;
    setKeyframe({ ...keyframe, value: newValue });
    dispatch(updateKeyframe({
      layerId: layer.id,
      property,
      time,
      newKeyframe: { value: newValue },
    }));
  };

  const handleEasingChange = (easing: string) => {
    setKeyframe({ ...keyframe, easing });
    dispatch(updateKeyframe({
      layerId: layer.id,
      property,
      time,
      newKeyframe: { easing },
    }));
  };

  return (
    <div className="ae-keyframe-editor">
      <h4>Edit Keyframe</h4>
      <div className="ae-keyframe-editor__time">Time: {time.toFixed(2)}s</div>
      <div className="ae-keyframe-editor__values">
        {keyframe.value.map((v, index) => (
          <input
            key={index}
            type="number"
            value={v}
            onChange={(e) => handleValueChange(index, parseFloat(e.target.value))}
          />
        ))}
      </div>
      <div className="ae-keyframe-editor__easing">
        <label>Easing:</label>
        <select value={keyframe.easing} onChange={(e) => handleEasingChange(e.target.value)}>
          <option value="linear">Linear</option>
          <option value="easeInQuad">Ease In Quad</option>
          <option value="easeOutQuad">Ease Out Quad</option>
          <option value="easeInOutQuad">Ease In Out Quad</option>
          <option value="easeInCubic">Ease In Cubic</option>
          <option value="easeOutCubic">Ease Out Cubic</option>
          <option value="easeInOutCubic">Ease In Out Cubic</option>
        </select>
      </div>
      <div className="ae-keyframe-editor__actions">
        <button onClick={() => onRemove(property, time)}>Remove</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default KeyframeEditor;
