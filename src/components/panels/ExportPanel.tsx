import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { renderComposition } from '../../utils/renderUtils';
import Button from '../common/Button';
import Dropdown from '../common/Dropdown';
import Slider from '../common/Slider';
import { LoadingIndicator } from '../common/LoadingIndicator';
import '../../styles/components/panels/_ExportPanel.scss';

interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  fps: number;
  startTime: number;
  endTime: number;
  resolution: { width: number; height: number };
}

const ExportPanel: React.FC = () => {
  const activeCompositionId = useAppSelector(state => state.timeline.activeCompositionId);
  const compositions = useAppSelector(state => state.timeline.compositions);
  const activeComposition = compositions.find(c => c.id === activeCompositionId);

  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'mp4',
    quality: 'medium',
    fps: 30,
    startTime: 0,
    endTime: activeComposition ? activeComposition.duration : 0,
    resolution: activeComposition ? { width: activeComposition.width, height: activeComposition.height } : { width: 1920, height: 1080 },
  });

  const handleExport = async () => {
    if (!activeComposition) return;

    setIsExporting(true);
    setExportStatus('Rendering...');
    setExportProgress(0);

    try {
      const blob = await renderComposition(activeComposition, exportSettings, (progress) => {
        setExportProgress(progress);
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeComposition.name}.${exportSettings.format}`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus('Export complete!');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
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
        <p>Original Resolution: {activeComposition.width}x{activeComposition.height}</p>
      </div>
      <div className="ae-export-panel__settings">
        <Dropdown
          label="Format"
          options={[
            { value: 'mp4', label: 'MP4' },
            { value: 'webm', label: 'WebM' },
            { value: 'gif', label: 'GIF' },
          ]}
          value={exportSettings.format}
          onChange={(value) => setExportSettings({ ...exportSettings, format: value as 'mp4' | 'webm' | 'gif' })}
        />
        <Dropdown
          label="Quality"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          value={exportSettings.quality}
          onChange={(value) => setExportSettings({ ...exportSettings, quality: value as 'low' | 'medium' | 'high' })}
        />
        <Dropdown
          label="FPS"
          options={[
            { value: '24', label: '24' },
            { value: '30', label: '30' },
            { value: '60', label: '60' },
          ]}
          value={exportSettings.fps.toString()}
          onChange={(value) => setExportSettings({ ...exportSettings, fps: parseInt(value) })}
        />
        <div className="ae-export-panel__time-range">
          <Slider
            label="Start Time"
            min={0}
            max={activeComposition.duration}
            step={0.01}
            value={exportSettings.startTime}
            onChange={(value) => setExportSettings({ ...exportSettings, startTime: value })}
          />
          <Slider
            label="End Time"
            min={0}
            max={activeComposition.duration}
            step={0.01}
            value={exportSettings.endTime}
            onChange={(value) => setExportSettings({ ...exportSettings, endTime: value })}
          />
        </div>
        <div className="ae-export-panel__resolution">
          <input
            type="number"
            value={exportSettings.resolution.width}
            onChange={(e) => setExportSettings({
              ...exportSettings,
              resolution: { ...exportSettings.resolution, width: parseInt(e.target.value) }
            })}
          />
          <span>x</span>
          <input
            type="number"
            value={exportSettings.resolution.height}
            onChange={(e) => setExportSettings({
              ...exportSettings,
              resolution: { ...exportSettings.resolution, height: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>
      <Button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>
      {isExporting && (
        <div className="ae-export-panel__progress">
          <LoadingIndicator progress={exportProgress} />
          <span>{exportProgress.toFixed(1)}%</span>
        </div>
      )}
      {exportStatus && <p className="ae-export-panel__status">{exportStatus}</p>}
    </div>
  );
};

export default ExportPanel;