async function moogFilterTransformer(audioBuffer, opts) {

    opts.cutoff = opts.cutoff === undefined ? 0.065 : opts.cutoff;
    opts.resonance = opts.resonance === undefined ? 3.5 : opts.resonance;
    opts.bufferSize = opts.bufferSize === undefined ? 4096 : opts.bufferSize;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.MoogFilter({
        cutoff: opts.cutoff,    //0 to 1
        resonance: opts.resonance,   //0 to 4
        bufferSize: opts.bufferSize  //256 to 16384
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  