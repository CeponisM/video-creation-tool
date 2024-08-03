import React, { useState, useCallback, useMemo } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setAudioFile, setIsLoading } from '../store/slices/audioSlice';
import { addMedia, MediaItem } from '../store/slices/mediaSlice';
import { addEvent } from '../store/slices/timelineSlice';
import '../styles/AudioSelector.scss';

const AudioSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const [localIsLoading, setLocalIsLoading] = useState(false);

  const worker = useMemo(() => new Worker(new URL('../workers/audioProcessor.worker.ts', import.meta.url)), []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      setLocalIsLoading(true);
      dispatch(setIsLoading(true));
      
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
        const arrayBuffer = e.target?.result as ArrayBuffer;
        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const audioData = audioBuffer.getChannelData(0);
          worker.postMessage({ arrayBuffer: audioData.buffer }, [audioData.buffer]);
        } catch (error) {
          console.error('Error decoding audio data:', error);
          alert('Error processing audio file. Please try again.');
          setLocalIsLoading(false);
          dispatch(setIsLoading(false));
        }
      };
      reader.readAsArrayBuffer(file);

      worker.onmessage = (e: MessageEvent<{ duration?: number; waveformData?: number[]; error?: string }>) => {
        console.log('Received message from worker:', e.data);
        const { duration, waveformData, error } = e.data;
        if (error) {
          console.error('Error in audio processing:', error);
          alert('Error processing audio file. Please try again.');
          setLocalIsLoading(false);
          dispatch(setIsLoading(false));
        } else if (duration !== undefined && waveformData) {
          console.log('Dispatching setAudioFile');
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
          setLocalIsLoading(false);
          dispatch(setIsLoading(false));
        }
      };
    }
  }, [dispatch, worker]);

  return (
    <div className="audio-selector">
      <h2>Select Audio File</h2>
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleFileChange} 
        disabled={localIsLoading}
      />
      {localIsLoading && <p>Processing audio...</p>}
    </div>
  );
};

export default React.memo(AudioSelector);