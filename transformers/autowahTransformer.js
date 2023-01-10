async function autowahTransformer(audioBuffer, opts) {

    opts.followerFreq = opts.followerFreq === undefined ? 10 : opts.followerFreq;
    opts.wetGain = opts.wetGain === undefined ? 1 : opts.wetGain;
    opts.comprThres = opts.comprThres === undefined ? -20 : opts.comprThres;
    opts.comprRatio = opts.comprRatio === undefined ? 16 : opts.comprRatio;
    opts.depthGain = opts.depthGain === undefined ? 11585 : opts.depthGain;
    opts.filterQ = opts.filterQ === undefined ? 15 : opts.filterQ;
    opts.filterFreq = opts.filterFreq === undefined ? 50 : opts.filterFreq;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let inputNode = ctx.createBufferSource();
    inputNode.buffer = audioBuffer;
  
    let waveshaper = ctx.createWaveShaper();
    let awFollower = ctx.createBiquadFilter();
    awFollower.type = "lowpass";
    awFollower.frequency.value = opts.followerFreq;
  
    let curve = new Float32Array(65536);
    for (let i=-32768; i<32768; i++) {
      curve[i+32768] = ((i>0)?i:-i)/32768;
    }
    waveshaper.curve = curve;
    waveshaper.connect(awFollower);
  
    let wetGain = ctx.createGain();
    wetGain.gain.value = opts.wetGain;
  
    let compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = opts.comprThres;
    compressor.ratio.value = opts.comprRatio;
  
    let awDepth = ctx.createGain();
    awDepth.gain.value = opts.depthGain;
    awFollower.connect(awDepth);
  
    let awFilter = ctx.createBiquadFilter();
    awFilter.type = "lowpass";
    awFilter.Q.value = opts.filterQ;
    awFilter.frequency.value = opts.filterFreq;
    awDepth.connect(awFilter.frequency);
    awFilter.connect(wetGain);
  
    inputNode.connect(waveshaper);
    inputNode.connect(awFilter);
  
    waveshaper.connect(compressor);
    wetGain.connect(compressor);
    compressor.connect(ctx.destination);
  
    inputNode.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }

