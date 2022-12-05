async function generalRobotTransformer(audioBuffer, opts) {

    opts.osc1Freq = opts.osc1Freq == undefined ? 50 : opts.osc1Freq;
    opts.osc1Type = opts.osc1Type == undefined ? 'sawtooth' : opts.osc1Type;
    opts.osc2Freq = opts.osc2Freq == undefined ? 500 : opts.osc2Freq;
    opts.osc2Type = opts.osc2Type == undefined ? 'sawtooth' : opts.osc2Type;
    opts.osc2Freq = opts.osc2Freq == undefined ? 50 : opts.osc2Freq;
    opts.osc2Type = opts.osc2Type == undefined ? 'sawtooth' : opts.osc2Type;
  
    opts.oscGain = opts.oscGain == undefined ? 0.004 : opts.oscGain;
    opts.oscDelay = opts.oscDelay == undefined ? 0.01 : opts.oscDelay;
    opts.magnitude = opts.magnitude == undefined ? 1 : opts.magnitude;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    // Source
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    // Wobble
    let oscillator1 = ctx.createOscillator();
    oscillator1.frequency.value = opts.osc1Freq;
    oscillator1.type = opts.osc1Type;
    let oscillator2 = ctx.createOscillator();
    oscillator2.frequency.value = opts.osc2Freq;
    oscillator2.type = opts.osc2Type;
    let oscillator3 = ctx.createOscillator();
    oscillator3.frequency.value = opts.osc3Freq;
    oscillator3.type = opts.osc3Type;
    // ---
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = opts.oscGain;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = opts.oscDelay;
  
    // Create graph
    if(opts.osc1Freq > 0) oscillator1.connect(oscillatorGain);
    if(opts.osc2Freq > 0) oscillator2.connect(oscillatorGain);
    if(opts.osc3Freq > 0) oscillator3.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    source.connect(delay)
    //delay.connect(ctx.destination);
  
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
  
    // Render
    oscillator1.start(0);
    oscillator2.start(0);
    oscillator3.start(0);
    source.start(0);
    // fire.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  