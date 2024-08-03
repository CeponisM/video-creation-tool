interface IncomingMessage {
    arrayBuffer: ArrayBuffer;
  }
  
  interface OutgoingMessage {
    duration?: number;
    error?: string;
    waveformData?: number[];
  }
  
  const generateWaveformData = (audioData: Float32Array, samples: number): number[] => {
    console.log('Generating waveform data');
    const blockSize = Math.floor(audioData.length / samples);
    const waveformData = new Array(samples);
  
    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      let max = 0;
      for (let j = start; j < end; j++) {
        const amplitude = Math.abs(audioData[j]);
        if (amplitude > max) {
          max = amplitude;
        }
      }
      waveformData[i] = max;
    }
  
    console.log('Waveform data generated');
    return waveformData;
  };
  
  self.onmessage = async (e: MessageEvent<IncomingMessage>) => {
    console.log('Worker received message');
    const { arrayBuffer } = e.data;
    
    if (!arrayBuffer) {
      console.error('No audio data provided');
      self.postMessage({ error: 'No audio data provided' });
      return;
    }
  
    try {
      console.log('Processing audio data');
      const audioData = new Float32Array(arrayBuffer);
      const duration = audioData.length / 44100; // Assuming 44.1kHz sample rate
      console.log('Audio duration:', duration);
      const waveformData = generateWaveformData(audioData, 200);
  
      const response: OutgoingMessage = {
        duration,
        waveformData
      };
  
      console.log('Sending processed data back to main thread');
      self.postMessage(response);
    } catch (error) {
      console.error('Error processing audio file:', error);
      self.postMessage({ error: 'Error processing audio file: ' + (error as Error).message });
    }
  };
  
  self.onerror = (error: ErrorEvent) => {
    console.error('Worker error:', error);
    self.postMessage({ error: 'Worker error: ' + error.message });
  };
  
  console.log('Worker initialized');