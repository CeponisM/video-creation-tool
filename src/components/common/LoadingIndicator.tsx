import React from 'react';
import '../../styles/components/common/_LoadingIndicator.scss';

interface LoadingIndicatorProps {
  progress: number;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ progress }) => {
  return (
    <div className="ae-loading-indicator">
      <div className="ae-loading-indicator__bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};