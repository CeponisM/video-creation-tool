import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { Transform, Keyframe } from '../../store/slices/timelineSlice';
import '../../styles/components/layout/KeyframeEditor.scss';

interface KeyframeEditorProps {
  layerId: string;
  property: keyof Transform;
  time: number;
  onUpdate: (layerId: string, property: keyof Transform, time: number, newKeyframe: Partial<Keyframe>) => void;
  onClose: () => void;
}

const KeyframeEditor: React.FC<KeyframeEditorProps> = ({ layerId, property, time, onUpdate, onClose }) => {
  const layer = useAppSelector(state => state.timeline.layers.find(l => l.id === layerId));
  const [keyframe, setKeyframe] = useState<Keyframe | null>(null);

  useEffect(() => {
    if (layer) {
      const foundKeyframe = layer.transform[property].find(k => k.time === time);
      if (foundKeyframe) {
        setKeyframe(foundKeyframe);
      }
    }
  }, [layer, property, time]);

  if (!keyframe) return null;

  const handleValueChange = (index: number, value: number) => {
    const newValue = [...keyframe.value];
    newValue[index] = value;
    setKeyframe({ ...keyframe, value: newValue });
    onUpdate(layerId, property, time, { value: newValue });
  };

  const handleEasingChange = (easing: 'linear' | 'easeInOutCubic') => {
    setKeyframe({ ...keyframe, easing });
    onUpdate(layerId, property, time, { easing });
  };

  return (
    <div className="ae-keyframe-editor">
      <h3>Edit Keyframe</h3>
      <div className="ae-keyframe-editor__property">
        <span>Property: {property}</span>
        <span>Time: {time.toFixed(2)}s</span>
      </div>
      <div className="ae-keyframe-editor__values">
        {keyframe.value.map((v, i) => (
          <input
            key={i}
            type="number"
            value={v}
            onChange={(e) => handleValueChange(i, parseFloat(e.target.value))}
          />
        ))}
      </div>
      <div className="ae-keyframe-editor__easing">
        <label>Easing:</label>
        <select
          value={keyframe.easing}
          onChange={(e) => handleEasingChange(e.target.value as 'linear' | 'easeInOutCubic')}
        >
          <option value="linear">Linear</option>
          <option value="easeInOutCubic">Ease In Out Cubic</option>
        </select>
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default KeyframeEditor;