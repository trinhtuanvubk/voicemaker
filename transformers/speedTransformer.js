async function speedTransformer(audioBuffer, opts) {

    opts.multiplier = opts.multiplier === undefined ? 2 : opts.multiplier;
  
    let channels = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) { channels[i] = new Float32Array(audioBuffer.getChannelData(i)); }
  
    // Run worker
    let outputChannels = await doWorkerTask(function() {
      self.onmessage = function(e) {
  
        let inputChannels = e.data.channels;
        let speed = e.data.speed;
        let outputChannels = [];
        for(let i = 0; i < inputChannels.length; i++) {
          outputChannels[i] = new Float32Array( Math.floor(inputChannels[i].length/speed) );
          for(let j = 0; j < outputChannels[i].length; j++) {
            outputChannels[i][j] = inputChannels[i][Math.floor(j*speed)];
          }
        }
  
        self.postMessage(outputChannels, [...outputChannels.map(c => c.buffer), ...inputChannels.map(c => c.buffer)]);
        self.close();
  
      }
    }, {channels,speed:opts.multiplier}, channels.map(c => c.buffer))
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, outputChannels[0].length, audioBuffer.sampleRate);
  
    let outputAudioBuffer = ctx.createBuffer(outputChannels.length, outputChannels[0].length, audioBuffer.sampleRate);
    for(let i = 0; i < outputChannels.length; i++) { outputAudioBuffer.copyToChannel(outputChannels[i], i); }
  
    return outputAudioBuffer;
  
  }
  