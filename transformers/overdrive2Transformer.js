async function overdrive2Transformer(audioBuffer, opts) {

    opts.outputGain = opts.outputGain === undefined ? 0.5 : opts.outputGain;
    opts.drive = opts.drive === undefined ? 0.7 : opts.drive;
    opts.curveAmount = opts.curveAmount === undefined ? 1 : opts.curveAmount;
    opts.algorithmIndex = opts.algorithmIndex === undefined ? 0: opts.algorithmIndex;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.Overdrive({
        outputGain: opts.outputGain,         //0 to 1+
        drive: opts.drive,              //0 to 1
        curveAmount: opts.curveAmount,          //0 to 1
        algorithmIndex: opts.algorithmIndex,       //0 to 5, selects one of our drive algorithms
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  