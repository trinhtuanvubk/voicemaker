async function telephoneTransformer(audioBuffer, opts) {

    opts.magnitude = opts.magnitude === undefined ? 1 : opts.magnitude;
    opts.lowPassFreq = opts.lowPassFreq === undefined ? 2000 : opts.lowPassFreq;
    opts.highPassFreq = opts.highPassFreq === undefined ? 500 : opts.highPassFreq;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let lpf1 = ctx.createBiquadFilter();
    lpf1.type = "lowpass";
    lpf1.frequency.value = opts.lowPassFreq;
    let lpf2 = ctx.createBiquadFilter();
    lpf2.type = "lowpass";
    lpf2.frequency.value = opts.lowPassFreq;
    let hpf1 = ctx.createBiquadFilter();
    hpf1.type = "highpass";
    hpf1.frequency.value = opts.highPassFreq;
    let hpf2 = ctx.createBiquadFilter();
    hpf2.type = "highpass";
    hpf2.frequency.value = opts.highPassFreq;
    let compressor = ctx.createDynamicsCompressor();
    lpf1.connect( lpf2 );
    lpf2.connect( hpf1 );
    hpf1.connect( hpf2 );
    hpf2.connect( compressor );
    //compressor.connect( ctx.destination );
  
    source.connect(lpf1);
  
    // SOURCE:
    let dryGain = ctx.createGain();
    source.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    compressor.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = 1 - opts.magnitude;
      wetGain.gain.value = opts.magnitude;
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  
module.exports = {
    telephoneTransformer
}