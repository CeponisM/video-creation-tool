import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppSelector';
import { createPrecomposition, Composition } from '../../store/slices/timelineSlice';
import '../../styles/components/panels/PrecompositionCreator.scss';

interface PrecompositionCreatorProps {
  onClose: () => void;
}

const PrecompositionCreator: React.FC<PrecompositionCreatorProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const activeCompositionId = useAppSelector(state => state.timeline.activeCompositionId);
  const selectedLayerIds = useAppSelector(state => state.timeline.selectedLayerIds);
  const compositions = useAppSelector(state => state.timeline.compositions);

  const [name, setName] = useState('New Precomposition');

  const handleCreate = () => {
    if (activeCompositionId) {
      const sourceComposition = compositions.find(c => c.id === activeCompositionId);
      if (sourceComposition) {
        const newComposition: Composition = {
          id: `precomp-${Date.now()}`,
          name,
          width: sourceComposition.width,
          height: sourceComposition.height,
          duration: sourceComposition.duration,
          frameRate: sourceComposition.frameRate,
          layers: [],
        };

        dispatch(createPrecomposition({
          sourceCompositionId: activeCompositionId,
          layerIds: selectedLayerIds,
          newComposition,
        }));

        onClose();
      }
    }
  };

  return (
<div className="ae-precomposition-creator">
      <h3>Create Precomposition</h3>
      <div className="ae-precomposition-creator__form">
        <label htmlFor="precomp-name">Name:</label>
        <input
          id="precomp-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="ae-precomposition-creator__actions">
        <button onClick={handleCreate}>Create</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default PrecompositionCreator;
