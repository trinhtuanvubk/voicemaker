async function biquadFilterTransformer(audioBuffer, opts) {

    opts.freq = opts.freq === undefined ? 2000 : opts.freq;
    opts.type = opts.type === undefined ? "lowpass" : opts.type;
    opts.Q = opts.Q === undefined ? 1 : opts.Q;
    opts.detune = opts.detune === undefined ? 0 : opts.detune;
    opts.gain = opts.gain === undefined ? 0 : opts.gain;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let filter = ctx.createBiquadFilter();
    filter.gain.value = opts.gain;
    filter.type = opts.type;
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.Q;
    filter.detune.value = opts.detune;
  
    source.connect(filter);
    filter.connect(ctx.destination);
  
    source.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  