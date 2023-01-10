async function evilRobotTransformer(audioBuffer, opts) {

    opts.pitch = opts.pitch === undefined ? -0.4 : opts.pitch;
    opts.mod = opts.mod === undefined ? 0.4 : opts.mod;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let carrier = await ctx.decodeAudioData(await (await fetch("/voicemaker/audio/junky-vocoder-modulator.ogg")).arrayBuffer());
  
    let compressor = ctx.createDynamicsCompressor();
  
    let v = vocoder(ctx, carrier, audioBuffer, {
      noise:1.64,
      synthDetune:600,
      sample:1,
      synth:2,
      modulatorGain:opts.mod,
    });
  
    //v.output.connect(compressor);
  
    let pitchChangeEffect = new Jungle( ctx );
  
    v.output.connect(pitchChangeEffect.input);
    pitchChangeEffect.output.connect(compressor)
    pitchChangeEffect.setPitchOffset(opts.pitch);
  
    compressor.connect(ctx.destination);
  
    return await ctx.startRendering();
  
  }
