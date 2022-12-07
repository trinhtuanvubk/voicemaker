async function delayTransformer(audioBuffer, opts) {

    opts.feedback = opts.feedback === undefined ? 0.45 : opts.feedback;
    opts.delayTime = opts.delayTime === undefined ? 150 : opts.delayTime;
    opts.wetLevel = opts.wetLevel === undefined ? 0.25 : opts.wetLevel;
    opts.dryLevel = opts.dryLevel === undefined ? 1 : opts.dryLevel;
    opts.cutoff = opts.cutoff === undefined ? 2000 : opts.cutoff;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let tuna = new Tuna(ctx);
    let effect = new tuna.Delay({
        feedback: opts.feedback,    //0 to 1+
        delayTime: opts.delayTime,    //1 to 10000 milliseconds
        wetLevel: opts.wetLevel,    //0 to 1+
        dryLevel: opts.dryLevel,       //0 to 1+
        cutoff: opts.cutoff,      //cutoff frequency of the built in lowpass-filter. 20 to 22050
    });
    source.connect(effect.input);
    effect.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  

module.exports = {
    delayTransformer
}