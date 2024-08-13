interface IncomingMessage {
  arrayBuffer: ArrayBuffer;
}

interface OutgoingMessage {
  duration?: number;
  waveformData?: number[];
  error?: string;
  progress?: number;
}

const CHUNK_SIZE = 1000000; // Process 1 million samples at a time
const MAX_WAVEFORM_POINTS = 1000; // Maximum number of points in the waveform

const generateWaveformData = (audioData: Float32Array, samples: number): number[] => {
  const blockSize = Math.floor(audioData.length / samples);
  const waveformData = new Array(samples).fill(0);

  for (let i = 0; i < audioData.length; i++) {
    const blockIndex = Math.floor(i / blockSize);
    if (blockIndex >= samples) break;
    const amplitude = Math.abs(audioData[i]);
    if (amplitude > waveformData[blockIndex]) {
      waveformData[blockIndex] = amplitude;
    }
  }

  return waveformData;
};

self.onmessage = async (e: MessageEvent<IncomingMessage>) => {
  const { arrayBuffer } = e.data;
  
  if (!arrayBuffer) {
    self.postMessage({ error: 'No audio data provided' });
    return;
  }

  try {
    const audioData = new Float32Array(arrayBuffer);
    const duration = audioData.length / 44100; // Assuming 44.1kHz sample rate
    
    if (duration > 600) { // 10 minutes
      throw new Error('Audio file is too long. Please use a file shorter than 10 minutes.');
    }
    
    const waveformData = generateWaveformData(audioData, MAX_WAVEFORM_POINTS);

    for (let i = 0; i < audioData.length; i += CHUNK_SIZE) {
      const endIndex = Math.min(i + CHUNK_SIZE, audioData.length);
      const progress = i / audioData.length;
      self.postMessage({ progress });
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    self.postMessage({ duration, waveformData });
  } catch (error) {
    console.error('Error processing audio file:', error);
    self.postMessage({ error: 'Error processing audio file: ' + (error instanceof Error ? error.message : String(error)) });
  }
};

export {}; // Make this a module