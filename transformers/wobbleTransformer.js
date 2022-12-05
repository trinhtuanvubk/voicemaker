async function wobbleTransformer(audioBuffer, opts) {

    opts.freq = opts.freq === undefined ? 1 : opts.freq;
    opts.amplitude = opts.amplitude === undefined ? 0.05 : opts.amplitude;
    opts.magnitude = opts.magnitude === undefined ? 1 : opts.magnitude;
    opts.delay = opts.delay === undefined ? 0.05 : opts.delay;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let oscillator = ctx.createOscillator();
    oscillator.frequency.value = opts.freq;
    oscillator.type = 'sine';
  
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = opts.amplitude;
  
    let delay = ctx.createDelay();
    delay.delayTime.value = opts.delay;
  
    // source --> delay --> ctx.destination
    // oscillator --> oscillatorGain --> delay.delayTime --> ctx.destination
  
    source.connect(delay);
    //delay.connect(ctx.destination);
  
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
  
  
    // SOURCE:
    let dryGain = ctx.createGain();
    source.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    delay.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = 1 - opts.magnitude;
      wetGain.gain.value = opts.magnitude;
  
  
    oscillator.start();
    source.start();
  
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  