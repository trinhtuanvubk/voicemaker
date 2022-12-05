async function synthTransformer(audioBuffer, opts) {

    opts.modulatorGain = opts.modulatorGain === undefined ? 1.0 : opts.modulatorGain;
    opts.noise = opts.noise === undefined ? 0.2 : opts.noise;
    opts.sample = opts.sample === undefined ? 0.0 : opts.sample;
    opts.synth = opts.synth === undefined ? 1.0 : opts.synth;
    opts.synthDetune = opts.synthDetune === undefined ? 0 : opts.synthDetune;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let carrier = await ctx.decodeAudioData(await (await fetch("/voicemaker/audio/junky-vocoder-modulator.ogg")).arrayBuffer());
  
    let compressor = ctx.createDynamicsCompressor();
  
    let v = vocoder(ctx, carrier, audioBuffer, opts);
  
    v.output.connect(compressor);
    compressor.connect(ctx.destination);
  
    return await ctx.startRendering();
  
  }
  