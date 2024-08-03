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
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: MediaItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleAddMedia = (item: MediaItem) => {
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
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
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
        } else {
          dispatch(addMedia(newMedia));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewAudio = (url: string) => {
    if (previewAudio) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
    }
    const audio = new Audio(url);
    audio.play();
    setPreviewAudio(audio);
  };

  useEffect(() => {
    if (audioFileName && !media.some(item => item.name === audioFileName)) {
      dispatch(addMedia({
        id: Date.now().toString(),
        type: 'audio',
        url: '', // You might want to store the actual URL or file path here
        name: audioFileName,
      }));
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
