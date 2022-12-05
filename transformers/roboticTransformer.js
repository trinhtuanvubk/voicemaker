async function roboticTransformer(audioBuffer, opts) {

    opts.osc1Freq = opts.osc1Freq == undefined ? 700 : opts.osc1Freq;
    opts.osc1Type = opts.osc1Type == undefined ? 'triangle' : opts.osc1Type;
    opts.osc1Gain = opts.osc1Gain == undefined ? 0.004 : opts.osc1Gain;
    opts.highpassFrequency = opts.highpassFrequency == undefined ? 695 : opts.highpassFrequency
    opts.magnitude = opts.magnitude == undefined ? 1 : opts.magnitude
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    // Source
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    // Wobble
    let oscillator1 = ctx.createOscillator();
    oscillator1.frequency.value = opts.osc1Freq;
    oscillator1.type = opts.osc1Type;
  
    // let oscillator2 = ctx.createOscillator();
    // oscillator2.frequency.value = opts.osc2Freq == undefined ? 1000 : opts.osc2Freq;
    // oscillator2.type = opts.osc2Type == undefined ? 'sawtooth' : opts.osc2Type;
    //
    // let oscillator3 = ctx.createOscillator();
    // oscillator3.frequency.value = opts.osc3Freq == undefined ? 50 : opts.osc3Freq;
    // oscillator3.type = opts.osc3Type == undefined ? 'sine' : opts.osc3Type;
    // ---
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = opts.osc1Gain;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = 0.01;
  
    let filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = opts.highpassFrequency;
  
    // Create graph
    oscillator1.connect(oscillatorGain);
    // oscillator2.connect(oscillatorGain);
    // oscillator3.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    source.connect(delay);
    delay.connect(filter);
  
    // SOURCE:
    let dryGain = ctx.createGain();
    source.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    filter.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = 1 - opts.magnitude;
    wetGain.gain.value = opts.magnitude;
  
    // Render
    oscillator1.start(0);
    // oscillator2.start(0);
    // oscillator3.start(0);
    source.start(0);
    // fire.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  