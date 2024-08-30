import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CompositionViewer from '../viewer/CompositionViewer';
import Timeline from './Timeline';
import EffectsPanel from '../panels/EffectsPanel';
import LayerProperties from '../panels/LayerProperties';
import ProjectAssets from '../panels/ProjectAssets';
import '../../styles/components/layout/_Layout.scss';

const Layout: React.FC = () => {
  return (
    <div className="ae-layout">
      <Header />
      <div className="ae-layout__main">
        <Sidebar />
        <div className="ae-layout__content">
          <div className="ae-layout__top">
            <CompositionViewer />
            <div className="ae-layout__panels">
              <ProjectAssets />
              <EffectsPanel />
              <LayerProperties />
            </div>
          </div>
          <Timeline />
        </div>
      </div>
    </div>
  );
};

export default Layout;