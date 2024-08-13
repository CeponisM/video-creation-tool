import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { addMedia, MediaItem } from '../store/slices/mediaSlice';
import { addEvent } from '../store/slices/timelineSlice';
import '../styles/MediaBrowser.scss';

const MediaBrowser: React.FC = () => {
  const dispatch = useAppDispatch();
  const media = useAppSelector(state => state.media.items);
  const audioFileName = useAppSelector(state => state.audio.fileName);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: MediaItem) => {
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(item));
    } catch (error) {
      console.error('Error setting drag data:', error);
      setError('An error occurred while starting drag. Please try again.');
    }
  };

  const handleAddMedia = (item: MediaItem) => {
    try {
      dispatch(addEvent({
        id: Date.now().toString(),
        startTime: 0,
        endTime: item.type === 'image' ? 5 : (item.duration || 10),
        type: item.type,
        mediaUrl: item.url,
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        effects: []
      }));
    } catch (error) {
      console.error('Error adding media to timeline:', error);
      setError('An error occurred while adding media to the timeline. Please try again.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const newMedia: MediaItem = {
            id: Date.now().toString(),
            type: file.type.startsWith('audio/') ? 'audio' :
                  file.type.startsWith('image/') ? 'image' : 'video',
            url: e.target?.result as string,
            name: file.name,
          };

          if (newMedia.type === 'audio' || newMedia.type === 'video') {
            const audioElement = new Audio(newMedia.url);
            audioElement.addEventListener('loadedmetadata', () => {
              newMedia.duration = audioElement.duration;
              dispatch(addMedia(newMedia));
            });
            audioElement.addEventListener('error', (error) => {
              console.error('Error loading media:', error);
              setError('Error loading media file. Please try a different file.');
            });
          } else {
            dispatch(addMedia(newMedia));
          }
        } catch (error) {
          console.error('Error creating media item:', error);
          setError('An error occurred while processing the file. Please try again.');
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setError('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewAudio = (url: string) => {
    try {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
      }
      const audio = new Audio(url);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setError('Error playing audio. Please try again.');
      });
      setPreviewAudio(audio);
    } catch (error) {
      console.error('Error previewing audio:', error);
      setError('An error occurred while previewing audio. Please try again.');
    }
  };

  useEffect(() => {
    if (audioFileName && !media.some(item => item.name === audioFileName)) {
      try {
        dispatch(addMedia({
          id: Date.now().toString(),
          type: 'audio',
          url: '', // You might want to store the actual URL or file path here
          name: audioFileName,
        }));
      } catch (error) {
        console.error('Error adding audio to media library:', error);
        setError('An error occurred while adding audio to the media library.');
      }
    }
  }, [audioFileName, dispatch, media]);

  useEffect(() => {
    return () => {
      if (previewAudio) {
        previewAudio.pause();
      }
    };
  }, [previewAudio]);

  return (
    <div className="media-browser">
      <h3>Media Library</h3>
      <button onClick={() => fileInputRef.current?.click()}>Add New Asset</button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*"
      />
      {error && <p className="error">{error}</p>}
      <div className="media-list">
        {media.map(item => (
          <div 
            key={item.id} 
            className={`media-item ${item.type}`}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onClick={() => item.type === 'audio' ? handlePreviewAudio(item.url) : handleAddMedia(item)}
          >
            {item.type === 'image' || item.type === 'video' ? (
              <img src={item.url} alt={item.name} />
            ) : (
              <div className="audio-preview">🎵</div>
            )}
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaBrowser;
