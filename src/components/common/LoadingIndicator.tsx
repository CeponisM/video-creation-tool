import React from 'react';
import '../../styles/components/common/LoadingIndicator.scss';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-indicator">
      <div className="loading-indicator__spinner"></div>
      <p className="loading-indicator__message">{message}</p>
    </div>
  );
};

export default LoadingIndicator;