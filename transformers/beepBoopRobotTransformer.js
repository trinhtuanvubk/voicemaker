async function beepBoopRobotTransformer(audioBuffer, opts) {
    // (robot4)
  
    opts.beepLength = opts.beepLength === undefined ? 1700 : opts.beepLength;
    opts.beepGain = opts.beepGain === undefined ? 0.05 : opts.beepGain;
    opts.magnitude = opts.magnitude === undefined ? 1 : opts.magnitude;
  
    let channels = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) { channels[i] = new Float32Array(audioBuffer.getChannelData(i)); }
  
    // Run worker
    let outputChannels = await doWorkerTask(function() {
      self.onmessage = function(e) {
  
        const beepSkipMod = e.data.beepLength;
        const beepGain = e.data.beepGain;
        const audioGain = 1-(beepGain*2);
        let inputChannels = e.data.channels;
        let outputChannels = [];
        for(let i = 0; i < inputChannels.length; i++) {
          outputChannels[i] = new Float32Array( inputChannels[i].length );
          let beepboopMod = 0, beepboop = 0, delay0 = 0, delay1 = 0, delay2 = 0, delay3 = 0;
          for(let j = 0; j < inputChannels[i].length; j++) {
            if(j%beepSkipMod === 0) { beepboopMod = Math.random(); }
            beepboop = Math.sin(j*beepboopMod) * beepGain;
            //delay0 = Math.sin(j/80) * 100;
            delay1 = Math.sin(j/400) * 100;
            delay2 = Math.sin(j/200) * 100;
            delay3 = Math.sin(j/100) * 100;
            outputChannels[i][j] = inputChannels[i][Math.round(j-delay0-delay1-delay2)]*0.9 + beepboop;
          }
        }
  
        self.postMessage(outputChannels, [...outputChannels.map(c => c.buffer), ...inputChannels.map(c => c.buffer)]);
        self.close();
  
      }
    }, {channels, beepLength:opts.beepLength, beepGain:opts.beepGain}, channels.map(c => c.buffer))
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, outputChannels[0].length, audioBuffer.sampleRate);
  
    let outputAudioBuffer = ctx.createBuffer(outputChannels.length, outputChannels[0].length, audioBuffer.sampleRate);
    for(let i = 0; i < outputChannels.length; i++) { outputAudioBuffer.copyToChannel(outputChannels[i], i); }
  
    let sourceDry = ctx.createBufferSource();
    sourceDry.buffer = audioBuffer;
  
    let sourceWet = ctx.createBufferSource();
    sourceWet.buffer = outputAudioBuffer;
  
    // SOURCE:
    let dryGain = ctx.createGain();
    sourceDry.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    sourceWet.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = 1 - opts.magnitude;
    wetGain.gain.value = opts.magnitude;
  
    sourceDry.start(0);
    sourceWet.start(0);
  
    return await ctx.startRendering();
  
  }
  