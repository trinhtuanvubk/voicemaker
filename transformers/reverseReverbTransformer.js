async function reverseReverbTransformer(audioBuffer, opts) {

    opts.dryGain = opts.dryGain === undefined ? 0.5 : opts.dryGain;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let reversedAudioBuffer = createReversedAudioBuffer(audioBuffer);
  
    let source = ctx.createBufferSource();
    source.buffer = reversedAudioBuffer;
  
    let convolver = ctx.createConvolver();
    convolver.buffer = await ctx.decodeAudioData(await (await fetch("/voicemaker/audio/impulse-responses/voxengo/Parking Garage.wav")).arrayBuffer());
    // convolver.buffer = await ctx.decodeAudioData(await (await fetch("../audio/impulse-responses/church.wav")).arrayBuffer());
  
    let outCompressor = ctx.createDynamicsCompressor();
  
    source.connect(convolver)
    convolver.connect(outCompressor);
  
    //dry
    let dryGain = ctx.createGain();
    dryGain.gain.value = opts.dryGain;
    source.connect(dryGain);
    dryGain.connect(outCompressor);
    outCompressor.connect(ctx.destination);
  
  
    function createReversedAudioBuffer(audioBuffer) {
      let ctx = new AudioContext();
      // copy audiobuffer
      let reversedAudioBuffer = ctx.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
      for(let i = 0; i < audioBuffer.numberOfChannels; i++) {
        reversedAudioBuffer.copyToChannel(audioBuffer.getChannelData(i), i);
      }
  
      // reverse new audiobuffer
      for(let i = 0; i < reversedAudioBuffer.numberOfChannels; i++) {
        reversedAudioBuffer.getChannelData(i).reverse();
      }
      return reversedAudioBuffer;
    }
  
  
    source.start(0);
    return createReversedAudioBuffer(await ctx.startRendering());
  
  }
  
module.exports = {    
    reverseReverbTransformer
}