async function giantMonsterTransformer(audioBuffer, opts) {

    opts.osc1Freq = opts.osc1Freq == undefined ? -10 : opts.osc1Freq;
    opts.osc1Type = opts.osc1Type == undefined ? 'sawtooth' : opts.osc1Type;
  
    opts.osc2Freq = opts.osc2Freq == undefined ? 50 : opts.osc2Freq;
    opts.osc2Type = opts.osc2Type == undefined ? 'sawtooth' : opts.osc2Type;
  
    opts.osc3Freq = opts.osc3Freq == undefined ? 30 : opts.osc3Freq;
    opts.osc3Type = opts.osc3Type == undefined ? 'sawtooth' : opts.osc3Type;
  
    opts.gain1 = opts.gain1 == undefined ? 0.007 : opts.gain1;
    opts.gain2 = opts.gain2 == undefined ? 0.007 : opts.gain2;
    opts.gain3 = opts.gain3 == undefined ? 0.9 : opts.gain3;
  
    opts.delay1 = opts.delay1 == undefined ? 0.01 : opts.delay1;
    opts.delay2 = opts.delay2 == undefined ? 0.01 : opts.delay2;
  
    opts.lowPass = opts.lowPass == undefined ? 2000 : opts.lowPass;
  
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
    oscillatorGain.gain.value = opts.gain1;
    // ---
    let oscillatorGain2 = ctx.createGain();
    oscillatorGain2.gain.value = opts.gain2;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = opts.delay1;
    // ---
    let delay2 = ctx.createDelay();
    delay2.delayTime.value = opts.delay2;
  
    let filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = opts.lowPass;
  
    // Reverb
    let convolver = ctx.createConvolver();
    convolver.buffer = await ctx.decodeAudioData(await (await fetch("/voicemaker/audio/impulse-responses/voxengo/Parking Garage.wav")).arrayBuffer());
  
    let compressor = ctx.createDynamicsCompressor();
    let compressor2 = ctx.createDynamicsCompressor();
    let compressor3 = ctx.createDynamicsCompressor();
  
    // Create graph
    oscillator1.connect(oscillatorGain);
    oscillator2.connect(oscillatorGain);
    // oscillator3.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    source.connect(compressor2)
    compressor2.connect(delay);
    delay.connect(compressor3);
    compressor3.connect(filter);
    filter.connect(convolver)
    convolver.connect(ctx.destination);
  
    oscillator3.connect(oscillatorGain2);
    oscillatorGain2.connect(delay2.delayTime);
  
    let noConvGain = ctx.createGain();
    noConvGain.gain.value = opts.gain3;
    filter.connect(noConvGain);
    noConvGain.connect(ctx.destination);
  
    // source.connect(compressor)
    // compressor.connect(delay2);
    // delay2.connect(filter)
    // filter.connect(ctx.destination);
  
    //
    //filter.connect(ctx.destination);
    //compressor.connect(ctx.destination);
  
    // source.connect(delay);
    // delay.connect(filter);
    // filter.connect(ctx.destination);
  
    // Render
    oscillator1.start(0);
    oscillator2.start(0);
    oscillator3.start(0);
    source.start(0);
    // fire.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  