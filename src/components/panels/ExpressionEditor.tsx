import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateExpression, Expression, Transform } from '../../store/slices/timelineSlice';
import '../../styles/components/panels/_ExpressionEditor.scss';

interface ExpressionEditorProps {
  compositionId: string;
  layerId: string;
  property: keyof Transform;
  onClose: () => void;
}

const ExpressionEditor: React.FC<ExpressionEditorProps> = ({ compositionId, layerId, property, onClose }) => {
  const dispatch = useAppDispatch();
  const layer = useAppSelector(state => 
    state.timeline.compositions.find(c => c.id === compositionId)?.layers.find(l => l.id === layerId)
  );
  const [code, setCode] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (layer) {
      const expression = layer.transform.expressions[property];
      if (expression) {
        setCode(expression.code);
        setEnabled(expression.enabled);
      }
    }
  }, [layer, property]);

  const handleSave = () => {
    dispatch(updateExpression({
      compositionId,
      layerId,
      property,
      expression: { code, enabled },
    }));
    onClose();
  };

  return (
    <div className="ae-expression-editor">
      <h3>Expression Editor: {property}</h3>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your expression here..."
      />
      <div className="ae-expression-editor__controls">
        <label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enabled
        </label>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default ExpressionEditor;
