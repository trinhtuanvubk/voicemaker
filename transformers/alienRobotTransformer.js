async function alienRobotTransformer(audioBuffer, opts) {

    opts.frequency = opts.frequency === undefined ? 40 : opts.frequency;
    opts.oscGain = opts.oscGain === undefined ? 0.015 : opts.oscGain;
    opts.delayTime = opts.delayTime === undefined ? 0.05 : opts.delayTime;
    opts.magnitude = opts.magnitude === undefined ? 1 : opts.magnitude;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let oscillator = ctx.createOscillator();
    oscillator.frequency.value = opts.frequency;
    oscillator.type = opts.oscType || 'sine';
  
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = opts.oscGain;
  
    let delay = ctx.createDelay();
    delay.delayTime.value = opts.delayTime;
  
    // source --> delay --> ctx.destination
    // oscillator --> oscillatorGain --> delay.delayTime --> ctx.destination
  
    source.connect(delay);
  
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
  
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
  
    oscillator.start();
    source.start();
  
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  