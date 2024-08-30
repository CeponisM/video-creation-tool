export const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const frames = Math.floor((time % 1) * 30); // Assuming 30 fps
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
};

export const snapToFrame = (time: number, frameRate: number): number => {
  return Math.round(time * frameRate) / frameRate;
};

export const interpolateKeyframes = (keyframes: any[], time: number): number[] => {
  if (keyframes.length === 0) return [];
  if (keyframes.length === 1) return keyframes[0].value;

  const nextKeyframeIndex = keyframes.findIndex(k => k.time > time);
  if (nextKeyframeIndex === -1) return keyframes[keyframes.length - 1].value;
  if (nextKeyframeIndex === 0) return keyframes[0].value;

  const prevKeyframe = keyframes[nextKeyframeIndex - 1];
  const nextKeyframe = keyframes[nextKeyframeIndex];

  const t = (time - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
  return prevKeyframe.value.map((v: number, i: number) => 
    v + (nextKeyframe.value[i] - v) * t
  );
};