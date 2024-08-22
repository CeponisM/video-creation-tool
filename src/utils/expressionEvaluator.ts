import { Layer } from '../store/slices/timelineSlice';

interface ExpressionContext {
  time: number;
  layer: Layer;
}

export const evaluateExpression = (code: string, context: ExpressionContext): number[] => {
  // Create a safe evaluation environment
  const safeEval = new Function('context', `
    with (context) {
      return (${code});
    }
  `);

  try {
    const result = safeEval(context);
    if (Array.isArray(result) && result.every(v => typeof v === 'number')) {
      return result;
    }
    if (typeof result === 'number') {
      return [result];
    }
    throw new Error('Expression must return a number or an array of numbers');
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return [0, 0, 0]; // Return a default value in case of error
  }
};