async function reverseTimeTransformer(audioBuffer) {

    let ctx = new AudioContext();
  
    // copy audiobuffer
    let outputAudioBuffer = ctx.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) {
      outputAudioBuffer.copyToChannel(audioBuffer.getChannelData(i), i);
    }
  
    // reverse new audiobuffer
    for(let i = 0; i < outputAudioBuffer.numberOfChannels; i++) {
      outputAudioBuffer.getChannelData(i).reverse();
    }
  
    return outputAudioBuffer;
  
  }
  
module.exports = {
    reverseTimeTransformer
}