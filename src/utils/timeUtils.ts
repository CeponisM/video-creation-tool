export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  export const frameToTime = (frame: number, frameRate: number): number => {
    return frame / frameRate;
  };
  
  export const timeToFrame = (time: number, frameRate: number): number => {
    return Math.round(time * frameRate);
  };
  
  export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };