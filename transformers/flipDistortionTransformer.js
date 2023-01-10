async function flipDistortionTransformer(audioBuffer, opts) {

    opts.flipGap = opts.flipGap == undefined ? 100 : opts.flipGap;
    opts.flipProb = opts.flipProb == undefined ? 0.2 : opts.flipProb;
    opts.lowPass = opts.lowPass == undefined ? 2000 : opts.lowPass;
  
    let channels = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) { channels[i] = new Float32Array(audioBuffer.getChannelData(i)); }
  
    // Run worker
    let outputChannels = await doWorkerTask(function() {
      self.onmessage = function(e) {
  
        const flipGap = e.data.flipGap;
        const flipProb = e.data.flipProb;
        let inputChannels = e.data.channels;
        let sampleRate = e.data.sampleRate;
  
        let outputChannels = [];
        for(let i = 0; i < inputChannels.length; i++) {
  
          let input = inputChannels[i];
          let output = new Float32Array(input.length);
          let m = 0;
          let doFlip = false;
          for(let j = 0; j < input.length; j++) {
            if(j%flipGap === 0 && Math.random() < flipProb) { doFlip = !doFlip; }
            if(doFlip) {
              output[j] = Math.abs(input[j]);
            } else {
              output[j] = input[j];
            }
          }
  
          outputChannels.push(output);
  
        }
  
        self.postMessage(outputChannels, [...outputChannels.map(c => c.buffer), ...inputChannels.map(c => c.buffer)]);
        self.close();
  
      }
    }, {channels, sampleRate:audioBuffer.sampleRate, flipGap:opts.flipGap, flipProb:opts.flipProb}, channels.map(c => c.buffer))
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, outputChannels[0].length, audioBuffer.sampleRate);
  
    audioBuffer = ctx.createBuffer(outputChannels.length, outputChannels[0].length, audioBuffer.sampleRate);
    for(let i = 0; i < outputChannels.length; i++) { audioBuffer.copyToChannel(outputChannels[i], i); }
  
  
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = opts.lowPass;
  
    //source.connect(ctx.destination)
    source.connect(filter)
    filter.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  
