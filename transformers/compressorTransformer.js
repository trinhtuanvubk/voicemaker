async function compressorTransformer(audioBuffer, opts) {

    opts.threshold = opts.threshold === undefined ? -1 : opts.threshold;
    opts.makeupGain = opts.makeupGain === undefined ? 1 : opts.makeupGain;
    opts.attack = opts.attack === undefined ? 1 : opts.attack;
    opts.release = opts.release === undefined ? 0 : opts.release;
    opts.ratio = opts.ratio === undefined ? 4 : opts.ratio;
    opts.knee = opts.knee === undefined ? 5 : opts.knee;
    opts.automakeup = opts.automakeup === undefined ? 1 : opts.automakeup;
  
  
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.Compressor({
        threshold: opts.threshold,    //-100 to 0
        makeupGain: opts.makeupGain,     //0 and up (in decibels)
        attack: opts.attack,         //0 to 1000
        release: opts.release,        //0 to 3000
        ratio: opts.ratio,          //1 to 20
        knee: opts.knee,           //0 to 40
        automakeup: !!opts.automakeup,  //true/false
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  