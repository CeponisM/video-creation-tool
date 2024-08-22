import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { renderComposition } from '../../utils/renderUtils';
import '../../styles/components/panels/ExportPanel.scss';

const ExportPanel: React.FC = () => {
  const activeCompositionId = useAppSelector(state => state.timeline.activeCompositionId);
  const compositions = useAppSelector(state => state.timeline.compositions);
  const activeComposition = compositions.find(c => c.id === activeCompositionId);

  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');

  const handleExport = async () => {
    if (!activeComposition) return;

    setExportStatus('Rendering...');
    setExportProgress(0);

    try {
      const videoBlob = await renderComposition(activeComposition, (progress) => {
        setExportProgress(progress);
      });

      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeComposition.name}.mp4`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus('Export complete!');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('Export failed. Please try again.');
    }
  };

  if (!activeComposition) {
    return <div className="ae-export-panel">No active composition</div>;
  }

  return (
    <div className="ae-export-panel">
      <h3>Export Composition</h3>
      <div className="ae-export-panel__info">
        <p>Composition: {activeComposition.name}</p>
        <p>Duration: {activeComposition.duration.toFixed(2)}s</p>
        <p>Resolution: {activeComposition.width}x{activeComposition.height}</p>
      </div>
      <button onClick={handleExport} disabled={exportProgress > 0 && exportProgress < 100}>
        Export
      </button>
      {exportProgress > 0 && (
        <div className="ae-export-panel__progress">
          <progress value={exportProgress} max="100" />
          <span>{exportProgress.toFixed(1)}%</span>
        </div>
      )}
      {exportStatus && <p className="ae-export-panel__status">{exportStatus}</p>}
    </div>
  );
};

export default ExportPanel;
