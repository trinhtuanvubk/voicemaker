async function shuffleChunksTransformer(audioBuffer, opts) {

    opts.secondsPerChunk = opts.secondsPerChunk == undefined ? 2 : opts.secondsPerChunk;
  
    let channels = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) { channels[i] = new Float32Array(audioBuffer.getChannelData(i)); }
  
    // Run worker
    let outputChannels = await doWorkerTask(function() {
      self.onmessage = function(e) {
  
        function shuffleArray(arr) {
          let m = arr.length, i;
          while (m) {
            i = Math.floor(Math.random() * m--); // swap `m` with a random index `i` that hasn't had a go yet
            [arr[m], arr[i]] = [arr[i], arr[m]]
          }
          return arr;
        }
  
        let inputChannels = e.data.channels;
        let sampleRate = e.data.sampleRate;
        let secondsPerChunk = e.data.secondsPerChunk;
        let samplesPerChunk = secondsPerChunk*sampleRate;
  
        let outputChannels = [];
        for(let i = 0; i < inputChannels.length; i++) {
  
          // split up this channel into chunks:
          let input = inputChannels[i];
          let chunks = [];
          let currentChunk = [];
          let inChunkIndex = 0;
          for(let j = 0; j < input.length; j++) {
            if(inChunkIndex === samplesPerChunk) {
              inChunkIndex = 0;
              chunks.push(currentChunk);
              currentChunk = [];
            }
            currentChunk[inChunkIndex] = input[j];
            inChunkIndex++;
            if(j === input.length-1) {
              chunks.push(currentChunk);
            }
          }
  
          // shuffle the chunks
          shuffleArray(chunks);
  
          // join the chunks
          let output = new Float32Array(input.length);
          let m = 0;
          for(let j = 0; j < chunks.length; j++) {
            for(let k = 0; k < chunks[j].length; k++) {
              output[m] = chunks[j][k];
              m++;
            }
          }
  
          outputChannels.push(output);
  
        }
  
        self.postMessage(outputChannels, [...outputChannels.map(c => c.buffer), ...inputChannels.map(c => c.buffer)]);
        self.close();
  
      }
    }, {channels, sampleRate:audioBuffer.sampleRate, secondsPerChunk:opts.secondsPerChunk}, channels.map(c => c.buffer))
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, outputChannels[0].length, audioBuffer.sampleRate);
  
    let outputAudioBuffer = ctx.createBuffer(outputChannels.length, outputChannels[0].length, audioBuffer.sampleRate);
    for(let i = 0; i < outputChannels.length; i++) { outputAudioBuffer.copyToChannel(outputChannels[i], i); }
  
    return outputAudioBuffer;
  
  }
  