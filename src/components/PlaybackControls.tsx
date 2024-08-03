import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCurrentTime, setIsPlaying } from '../store/slices/audioSlice';
import '../styles/PlaybackControls.scss';

const PlaybackControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const { duration, currentTime, isPlaying, fileName } = useAppSelector(state => state.audio);
  const [audio] = useState(new Audio());

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    dispatch(setIsPlaying(!isPlaying));
  }, [isPlaying, audio, dispatch]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    dispatch(setCurrentTime(newTime));
    audio.currentTime = newTime;
  }, [audio, dispatch]);

  useEffect(() => {
    if (fileName) {
      audio.src = fileName;
      audio.addEventListener('timeupdate', () => {
        dispatch(setCurrentTime(audio.currentTime));
      });
      audio.addEventListener('ended', () => {
        dispatch(setIsPlaying(false));
      });
    }
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [fileName, dispatch, audio]);

  useEffect(() => {
    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying, audio]);

  return (
    <div className="playback-controls">
      <button onClick={handlePlayPause}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <input
        type="range"
        min="0"
        max={duration}
        value={currentTime}
        onChange={handleSeek}
        step="0.1"
      />
      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
    </div>
  );
};

export default React.memo(PlaybackControls);
