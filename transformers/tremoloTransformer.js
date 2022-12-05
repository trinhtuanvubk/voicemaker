async function tremoloTransformer(audioBuffer, opts) {

    opts.intensity = opts.intensity === undefined ? 0.3 : opts.intensity;
    opts.rate = opts.rate === undefined ? 4 : opts.rate;
    opts.stereoPhase = opts.stereoPhase === undefined ? 0 : opts.stereoPhase;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.Tremolo({
        intensity: opts.intensity,    //0 to 1
        rate: opts.rate,               //0.001 to 8
        stereoPhase: opts.stereoPhase,    //0 to 180
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  