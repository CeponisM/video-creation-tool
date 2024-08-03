import React, { ReactNode } from 'react';
import '../styles/Workspace.scss';

interface WorkspaceProps {
  children: ReactNode;
}

const Workspace: React.FC<WorkspaceProps> = ({ children }) => {
  return <div className="workspace">{children}</div>;
};

export default Workspace;