import React from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addLayer } from '../../store/slices/timelineSlice';
import '../../styles/components/layout/_Toolbar.scss';

const Toolbar: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleAddLayer = (type: 'solid' | 'image' | 'video' | 'text' | 'shape' | 'null') => {
    dispatch(addLayer({
      compositionId: 'activeCompositionId', // Replace with actual active composition ID
      layer: {
        id: `layer-${Date.now()}`,
        name: `New ${type} layer`,
        type,
        startTime: 0,
        duration: 5,
        transform: {
          position: [{ time: 0, value: [0, 0, 0], easing: 'linear' }],
          scale: [{ time: 0, value: [100, 100, 100], easing: 'linear' }],
          rotation: [{ time: 0, value: [0, 0, 0], easing: 'linear' }],
          opacity: [{ time: 0, value: [100], easing: 'linear' }],
          anchorPoint: [{ time: 0, value: [0, 0, 0], easing: 'linear' }],
          expressions: {},
        },
        effects: [],
        masks: [],
        parentId: null,
        is3D: false,
        blendingMode: 'normal',
        motionBlur: false,
        motionBlurSamples: 16,
      },
    }));
  };

  return (
    <div className="ae-toolbar">
      <button onClick={() => handleAddLayer('solid')}>Add Solid</button>
      <button onClick={() => handleAddLayer('image')}>Add Image</button>
      <button onClick={() => handleAddLayer('video')}>Add Video</button>
      <button onClick={() => handleAddLayer('text')}>Add Text</button>
      <button onClick={() => handleAddLayer('shape')}>Add Shape</button>
      <button onClick={() => handleAddLayer('null')}>Add Null Object</button>
    </div>
  );
};

export default Toolbar;