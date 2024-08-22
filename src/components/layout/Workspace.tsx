import React, { useState } from 'react';
import CompositionViewer from '../viewer/CompositionViewer';
import PropertyEditor from '../panels/PropertyEditor';
import EffectsPanel from '../panels/EffectsPanel';
import MaskEditor from '../panels/MaskEditor';
import ExportPanel from '../panels/ExportPanel';
import Timeline from './Timeline';
import Toolbar from './Toolbar';
import '../../styles/components/layout/Workspace.scss';

const Workspace: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'properties' | 'effects' | 'masks' | 'export'>('properties');

  return (
    <div className="ae-workspace">
      <Toolbar />
      <div className="ae-workspace__main">
        <CompositionViewer />
        <div className="ae-workspace__panels">
          <div className="ae-workspace__panel-tabs">
            <button onClick={() => setActivePanel('properties')} className={activePanel === 'properties' ? 'active' : ''}>Properties</button>
            <button onClick={() => setActivePanel('effects')} className={activePanel === 'effects' ? 'active' : ''}>Effects</button>
            <button onClick={() => setActivePanel('masks')} className={activePanel === 'masks' ? 'active' : ''}>Masks</button>
            <button onClick={() => setActivePanel('export')} className={activePanel === 'export' ? 'active' : ''}>Export</button>
          </div>
          <div className="ae-workspace__panel-content">
            {activePanel === 'properties' && <PropertyEditor />}
            {activePanel === 'effects' && <EffectsPanel />}
            {activePanel === 'masks' && <MaskEditor compositionId="" layerId="" onClose={() => {}} />}
            {activePanel === 'export' && <ExportPanel />}
          </div>
        </div>
      </div>
      <Timeline />
    </div>
  );
};

export default Workspace;
