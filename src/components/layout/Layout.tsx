import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Workspace from './Workspace';
import Timeline from './Timeline';

const Layout: React.FC = () => {
  return (
    <div className="ae-app">
      <Header />
      <div className="ae-main-content">
        <Sidebar />
        <div className="ae-workspace">
          <Workspace />
          <Timeline />
        </div>
      </div>
    </div>
  );
};

export default Layout;
