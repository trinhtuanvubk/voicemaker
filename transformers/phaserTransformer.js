async function phaserTransformer(audioBuffer, opts) {

    opts.rate = opts.rate === undefined ? 8 : opts.rate;
    opts.depth = opts.depth === undefined ? 0.3 : opts.depth;
    opts.feedback = opts.feedback === undefined ? 0.9 : opts.feedback;
    opts.stereoPhase = opts.stereoPhase === undefined ? 100 : opts.stereoPhase;
    opts.baseModFreq = opts.baseModFreq === undefined ? 500 : opts.baseModFreq;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.Phaser({
        rate: opts.rate,                     //0.01 to 8 is a decent range, but higher values are possible
        depth: opts.depth,                    //0 to 1
        feedback: opts.feedback,                 //0 to 1+
        stereoPhase: opts.stereoPhase,               //0 to 180
        baseModulationFrequency: opts.baseModFreq,  //500 to 1500
        bypass: 0, // if 1, disables the effect
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  
  }
  
