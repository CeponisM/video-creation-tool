import React, { useState, useRef } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addAsset, Asset } from '../../store/slices/projectSlice';
import { addLayer } from '../../store/slices/timelineSlice';
import { v4 as uuidv4 } from 'uuid';
import '../../styles/components/layout/_Sidebar.scss';

const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState('project');
  const assets = useAppSelector(state => state.project.assets);
  const effects = useAppSelector(state => state.effects);
  const presets = useAppSelector(state => state.presets);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const asset: Asset = {
            id: uuidv4(),
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
        id: uuidv4(),
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
          anchorPoint: [{ time: 0, value: [0, 0], easing: 'linear' }],
          expressions: {}, // Add an empty expressions object
        },
      },
    }));
  };

  // Render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'project':
        return (
          <div className="ae-sidebar__content">
            <h3>Project Assets</h3>
            <button onClick={() => fileInputRef.current?.click()}>Add Asset</button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*"
              multiple
            />
            <div className="ae-sidebar__asset-list">
              {assets.map((asset: Asset) => (
                <div key={asset.id} className="ae-sidebar__asset-item">
                  {asset.type === 'image' && <img src={asset.url} alt={asset.name} />}
                  {asset.type === 'video' && <video src={asset.url} />}
                  {asset.type === 'audio' && <div className="ae-sidebar__audio-icon">🎵</div>}
                  <span>{asset.name}</span>
                  <button onClick={() => handleAddToTimeline(asset)}>Add to Timeline</button>
                </div>
              ))}
            </div>
          </div>
        );
      // Add cases for 'effects' and 'presets' tabs
      default:
        return null;
    }
  };

  return (
    <div className="ae-sidebar">
      <div className="ae-sidebar__tabs">
        <button
          className={`ae-sidebar__tab ${activeTab === 'project' ? 'active' : ''}`}
          onClick={() => setActiveTab('project')}
        >
          Project
        </button>
        <button
          className={`ae-sidebar__tab ${activeTab === 'effects' ? 'active' : ''}`}
          onClick={() => setActiveTab('effects')}
        >
          Effects
        </button>
        <button
          className={`ae-sidebar__tab ${activeTab === 'presets' ? 'active' : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          Presets
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default Sidebar;