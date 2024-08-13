import React, { useState, useCallback, useMemo } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setAudioFile, setIsLoading } from '../store/slices/audioSlice';
import { addMedia, MediaItem } from '../store/slices/mediaSlice';
import { addEvent } from '../store/slices/timelineSlice';
import '../styles/AudioSelector.scss';

const AudioSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const worker = useMemo(() => {
    const w = new Worker(new URL('../workers/audioProcessor.worker.ts', import.meta.url));
    w.onerror = (event) => {
      console.error('Worker error:', event);
      setError('An error occurred while processing the audio. Please try again.');
      dispatch(setIsLoading(false));
    };
    return w;
  }, [dispatch]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);
    dispatch(setIsLoading(true));

    try {
      const fileUrl = URL.createObjectURL(file);
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        type: 'audio',
        url: fileUrl,
        name: file.name,
      };
      
      dispatch(addMedia(newMedia));
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const audioData = audioBuffer.getChannelData(0);
          worker.postMessage({ arrayBuffer: audioData.buffer }, [audioData.buffer]);
        } catch (error) {
          console.error('Error decoding audio data:', error);
          setError('Error processing audio file. Please try a different file.');
          dispatch(setIsLoading(false));
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setError('Error reading audio file. Please try again.');
        dispatch(setIsLoading(false));
      };

      reader.readAsArrayBuffer(file);

      const workerTimeout = setTimeout(() => {
        worker.terminate();
        setError('Audio processing took too long. Please try a smaller file.');
        dispatch(setIsLoading(false));
      }, 30000); // 30 seconds timeout

      worker.onmessage = (e: MessageEvent<{ duration?: number; waveformData?: number[]; error?: string; progress?: number }>) => {
        const { duration, waveformData, error, progress } = e.data;
        if (error) {
          clearTimeout(workerTimeout);
          console.error('Error in audio processing:', error);
          setError('Error processing audio file. Please try a different file.');
          dispatch(setIsLoading(false));
        } else if (progress !== undefined) {
          setProgress(progress);
        } else if (duration !== undefined && waveformData) {
          clearTimeout(workerTimeout);
          try {
            dispatch(setAudioFile({ fileName: file.name, duration, waveformData }));
            
            dispatch(addMedia({
              ...newMedia,
              duration,
            }));
            
            dispatch(addEvent({
              id: Date.now().toString(),
              startTime: 0,
              endTime: duration,
              type: 'audio',
              mediaUrl: fileUrl,
              position: { x: 0, y: 0 },
              scale: { x: 1, y: 1 },
              rotation: 0,
              effects: []
            }));
          } catch (error) {
            console.error('Error dispatching audio data:', error);
            setError('An unexpected error occurred. Please try again.');
          }
          dispatch(setIsLoading(false));
        }
      };
    } catch (error) {
      console.error('Unexpected error in file processing:', error);
      setError('An unexpected error occurred. Please try again.');
      dispatch(setIsLoading(false));
    }
  }, [dispatch, worker]);

  return (
    <div className="audio-selector">
      <h2>Select Audio File</h2>
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleFileChange} 
      />
      {error && <p className="error">{error}</p>}
      {progress > 0 && progress < 1 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress * 100}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default React.memo(AudioSelector);
