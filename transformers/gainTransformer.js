async function gainTransformer(audioBuffer, opts) {

    opts.gain = opts.gain === undefined ? 1 : opts.gain;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let gainNode = ctx.createGain();
    gainNode.gain.value = opts.gain;
  
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
  
    source.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  
module.exports = {
    gainTransformer
}