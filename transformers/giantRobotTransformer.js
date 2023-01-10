async function giantRobotTransformer(audioBuffer, opts) {

    opts.magnitude = opts.magnitude == undefined ? 1 : opts.magnitude;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let dee = new Jungle( ctx );
    dee.setPitchOffset(-0.1);
  
    let deep = new Jungle( ctx );
    deep.setPitchOffset(-0.2);
  
    let deeper = new Jungle( ctx );
    deeper.setPitchOffset(-0.4);
  
    let deeperer = new Jungle( ctx );
    deeperer.setPitchOffset(-0.8);
  
    let compressor = ctx.createDynamicsCompressor();
  
    source.connect(dee.input);
    source.connect(deep.input);
    source.connect(deeper.input);
    source.connect(deeperer.input);
  
    dee.output.connect(compressor);
    deep.output.connect(compressor);
    deeper.output.connect(compressor);
    deeperer.output.connect(compressor);
  
    // SOURCE:
    let dryGain = ctx.createGain();
    source.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    compressor.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = 1 - opts.magnitude;
    wetGain.gain.value = opts.magnitude;
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  
