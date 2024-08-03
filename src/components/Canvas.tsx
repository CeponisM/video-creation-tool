import React, { useMemo } from 'react';
import Workspace from './Workspace';
import VariableTools from './VariableTools';
import CompositionViewer from './CompositionViewer';
import Timeline from './Timeline';
import AudioSelector from './AudioSelector';
import { useAppSelector } from '../hooks/useAppSelector';
import '../styles/Canvas.scss';

const Canvas: React.FC = () => {
  const audioFile = useAppSelector(state => state.audio.fileName);
  const isLoading = useAppSelector(state => state.audio.isLoading);

  const content = useMemo(() => {
    if (isLoading) {
      return <div>Processing audio...</div>;
    }

    if (!audioFile) {
      return <AudioSelector />;
    }

    return (
      <Workspace>
        <VariableTools />
        <CompositionViewer />
        <Timeline />
      </Workspace>
    );
  }, [audioFile, isLoading]);

  return (
    <div className="canvas">
      {content}
    </div>
  );
};

export default React.memo(Canvas);
