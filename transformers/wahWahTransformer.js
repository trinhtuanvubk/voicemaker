async function wahWahTransformer(audioBuffer, opts) {

    opts.automode = opts.automode === undefined ? 1 : opts.automode;
    opts.baseFreq = opts.baseFreq === undefined ? 0.5 : opts.baseFreq;
    opts.excOctaves = opts.excOctaves === undefined ? 2 : opts.excOctaves;
    opts.sweep = opts.sweep === undefined ? 0.2 : opts.sweep;
    opts.resonance = opts.resonance === undefined ? 10 : opts.resonance;
    opts.sensitivity = opts.sensitivity === undefined ? 0.5 : opts.sensitivity;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.WahWah({
        automode: !!opts.automode,     //true/false
        baseFrequency: opts.baseFreq,  //0 to 1
        excursionOctaves: opts.excOctaves,           //1 to 6
        sweep: opts.sweep,                    //0 to 1
        resonance: opts.resonance,                 //1 to 100
        sensitivity: opts.sensitivity,              //-1 to 1
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  