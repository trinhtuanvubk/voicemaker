async function bitcrusherTransformer(audioBuffer, opts) {

    opts.bits = opts.bits === undefined ? 4 : opts.bits;
    opts.normfreq = opts.normfreq === undefined ? 0.1 : opts.normfreq;
    opts.bufferSize = opts.bufferSize === undefined ? 4096 : opts.bufferSize;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.Bitcrusher({
        bits: opts.bits,          //1 to 16
        normfreq: opts.normfreq,    //0 to 1
        bufferSize: opts.bufferSize  //256 to 16384
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }

