import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { addMask, updateMask, removeMask, Mask, Layer } from '../../store/slices/timelineSlice';
import '../../styles/components/panels/MaskEditor.scss';

interface MaskEditorProps {
  compositionId: string;
  layerId: string;
  onClose: () => void;
}

const MaskEditor: React.FC<MaskEditorProps> = ({ compositionId, layerId, onClose }) => {
  const dispatch = useAppDispatch();
  const layer = useAppSelector(state => 
    state.timeline.compositions.find(c => c.id === compositionId)?.layers.find(l => l.id === layerId)
  );

  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(null);
  const [maskName, setMaskName] = useState('');
  const [inverted, setInverted] = useState(false);
  const [feather, setFeather] = useState(0);
  const [opacity, setOpacity] = useState(100);

  useEffect(() => {
    if (layer && layer.masks.length > 0 && !selectedMaskId) {
      setSelectedMaskId(layer.masks[0].id);
    }
  }, [layer, selectedMaskId]);

  useEffect(() => {
    if (selectedMaskId && layer) {
      const selectedMask = layer.masks.find(m => m.id === selectedMaskId);
      if (selectedMask) {
        setMaskName(selectedMask.name);
        setInverted(selectedMask.inverted);
        setFeather(selectedMask.feather);
        setOpacity(selectedMask.opacity);
      }
    }
  }, [selectedMaskId, layer]);

  const handleAddMask = () => {
    if (layer) {
      const newMask: Mask = {
        id: `mask-${Date.now()}`,
        name: `Mask ${layer.masks.length + 1}`,
        path: { vertices: [], closed: true },
        inverted: false,
        feather: 0,
        opacity: 100,
      };
      dispatch(addMask({ compositionId, layerId, mask: newMask }));
      setSelectedMaskId(newMask.id);
    }
  };

  const handleUpdateMask = () => {
    if (selectedMaskId) {
      dispatch(updateMask({
        compositionId,
        layerId,
        maskId: selectedMaskId,
        updates: { name: maskName, inverted, feather, opacity },
      }));
    }
  };

  const handleRemoveMask = () => {
    if (selectedMaskId) {
      dispatch(removeMask({ compositionId, layerId, maskId: selectedMaskId }));
      setSelectedMaskId(null);
    }
  };

  if (!layer) return null;

  return (
    <div className="ae-mask-editor">
      <h3>Mask Editor</h3>
      <select
        value={selectedMaskId || ''}
        onChange={(e) => setSelectedMaskId(e.target.value)}
      >
        {layer.masks.map(mask => (
          <option key={mask.id} value={mask.id}>{mask.name}</option>
        ))}
      </select>
      <button onClick={handleAddMask}>Add Mask</button>
      {selectedMaskId && (
        <>
          <input
            type="text"
            value={maskName}
            onChange={(e) => setMaskName(e.target.value)}
            placeholder="Mask Name"
          />
          <label>
            <input
              type="checkbox"
              checked={inverted}
              onChange={(e) => setInverted(e.target.checked)}
            />
            Inverted
          </label>
          <label>
            Feather:
            <input
              type="number"
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              min="0"
              max="100"
            />
          </label>
          <label>
            Opacity:
            <input
              type="number"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              min="0"
              max="100"
            />
          </label>
          <button onClick={handleUpdateMask}>Update Mask</button>
          <button onClick={handleRemoveMask}>Remove Mask</button>
        </>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default MaskEditor;