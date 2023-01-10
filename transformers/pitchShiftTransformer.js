async function pitchShiftTransformer(audioBuffer, opts /*negative=lower, positive=higher*/) {

    opts.shift = opts.shift === undefined ? 1 : opts.shift;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let pitchChangeEffect = new Jungle( ctx );
  
    let compressor = ctx.createDynamicsCompressor();
  
    source.connect(pitchChangeEffect.input)
    pitchChangeEffect.output.connect(compressor)
    pitchChangeEffect.setPitchOffset(opts.shift);
  
    compressor.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  
