import React, { useRef } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addAsset, Asset } from '../../store/slices/projectSlice';
import { addLayer } from '../../store/slices/timelineSlice';
import '../../styles/components/panels/_ProjectAssets.scss';

const ProjectAssets: React.FC = () => {
  const dispatch = useAppDispatch();
  const assets = useAppSelector(state => state.project.assets);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const asset: Asset = {
            id: `asset-${Date.now()}`,
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
            url: e.target?.result as string,
          };
          dispatch(addAsset(asset));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddToTimeline = (asset: Asset) => {
    dispatch(addLayer({
      compositionId: 'activeCompositionId', // Replace with actual active composition ID
      layer: {
        id: `layer-${Date.now()}`,
        name: asset.name,
        type: asset.type,
        source: asset.url,
        startTime: 0,
        duration: asset.type === 'image' ? 5 : 10, // Default duration
        transform: {
          position: [{ time: 0, value: [0, 0, 0], easing: 'linear' }],
          scale: [{ time: 0, value: [100, 100, 100], easing: 'linear' }],
          rotation: [{ time: 0, value: [0, 0, 0], easing: 'linear' }],
          opacity: [{ time: 0, value: [100], easing: 'linear' }],
          anchorPoint: [{ time: 0, value: [0, 0, 0], easing: 'linear' }],
        },
        expressions: {},
      },
    }));
  };

  return (
    <div className="ae-project-assets">
      <h3 className="ae-project-assets__title">Project Assets</h3>
      <button className="ae-project-assets__add-button" onClick={() => fileInputRef.current?.click()}>
        Add Asset
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*"
        multiple
      />
      <div className="ae-project-assets__list">
        {assets.map(asset => (
          <div key={asset.id} className="ae-project-assets__item">
            {asset.type === 'image' && <img src={asset.url} alt={asset.name} />}
            {asset.type === 'video' && <video src={asset.url} />}
            {asset.type === 'audio' && <div className="ae-project-assets__audio-icon">🎵</div>}
            <span className="ae-project-assets__item-name">{asset.name}</span>
            <button className="ae-project-assets__add-to-timeline" onClick={() => handleAddToTimeline(asset)}>
              Add to Timeline
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectAssets;