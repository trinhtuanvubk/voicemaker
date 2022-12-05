async function chorusTransformer(audioBuffer, opts) {

    opts.rate = opts.rate === undefined ? 1.5 : opts.rate;
    opts.feedback = opts.feedback === undefined ? 0.2 : opts.feedback;
    opts.delay = opts.delay === undefined ? 0.0045 : opts.delay;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.Chorus({
        rate: opts.rate,         //0.01 to 8+
        feedback: opts.feedback,     //0 to 1+
        delay: opts.delay,     //0 to 1
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  