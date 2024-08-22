import { Keyframe } from '../store/slices/timelineSlice';

export const interpolateKeyframes = (keyframes: Keyframe[], time: number): number[] => {
  if (keyframes.length === 0) return [0, 0, 0];
  if (keyframes.length === 1) return keyframes[0].value;

  const sortedKeyframes = keyframes.sort((a, b) => a.time - b.time);

  if (time <= sortedKeyframes[0].time) return sortedKeyframes[0].value;
  if (time >= sortedKeyframes[sortedKeyframes.length - 1].time) return sortedKeyframes[sortedKeyframes.length - 1].value;

  let leftIndex = 0;
  for (let i = 0; i < sortedKeyframes.length; i++) {
    if (sortedKeyframes[i].time > time) {
      leftIndex = i - 1;
      break;
    }
  }

  const leftKeyframe = sortedKeyframes[leftIndex];
  const rightKeyframe = sortedKeyframes[leftIndex + 1];

  const t = (time - leftKeyframe.time) / (rightKeyframe.time - leftKeyframe.time);
  const easedT = applyEasing(t, leftKeyframe.easing);

  return leftKeyframe.value.map((v, i) => {
    return v + (rightKeyframe.value[i] - v) * easedT;
  });
};

export const applyEasing = (t: number, easing: string): number => {
  switch (easing) {
    case 'linear':
      return t;
    case 'easeInOutCubic':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'easeInQuad':
      return t * t;
    case 'easeOutQuad':
      return 1 - (1 - t) * (1 - t);
    case 'easeInOutQuad':
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case 'easeInExpo':
      return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
    case 'easeOutExpo':
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    case 'easeInOutExpo':
      return t === 0
        ? 0
        : t === 1
        ? 1
        : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;
    default:
      return t;
  }
};