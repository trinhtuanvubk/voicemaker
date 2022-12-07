async function mirroredChunksTransformer(audioBuffer, opts) {

    opts.chunkSeconds = opts.chunkSeconds === undefined ? 1 : opts.chunkSeconds;
  
    let channels = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) { channels[i] = new Float32Array(audioBuffer.getChannelData(i)); }
  
    // Run worker
    let outputChannels = await doWorkerTask(function() {
      self.onmessage = function(e) {
  
        let inputChannels = e.data.channels;
        let chunkSeconds = e.data.chunkSeconds;
        let sampleRate = e.data.sampleRate;
        let chunkSize = chunkSeconds*sampleRate;
  
        let outputChannels = [];
        for(let i = 0; i < inputChannels.length; i++) {
          let input = inputChannels[i];
  
          // cut input at nodal points
          let chunks = [];
          let currentChunk = [];
          for(let j = 0; j < input.length; j++) {
            if(currentChunk.length >= chunkSize) {
              chunks.push(currentChunk);
              currentChunk = [];
            }
            currentChunk.push(input[j]);
          }
  
          // play with chunks
          for(let j = 0; j < chunks.length; j++) {
            let dup = [...chunks[j]];
            chunks[j] = [...chunks[j], ...dup.reverse()];
          }
  
          // join chunks
          let output = new Float32Array(chunks.reduce((a,v)=>{ return a + v.length; }, 0));
          let m = 0;
          for(let j = 0; j < chunks.length; j++) {
            for(let k = 0; k < chunks[j].length; k++) {
              output[m] = chunks[j][k];
              m++;
            }
          }
  
  
          outputChannels.push(output);
  
        }
  
        self.postMessage(outputChannels, [...outputChannels.map(c => c.buffer), ...inputChannels.map(c => c.buffer)]);
        self.close();
  
      }
    }, {channels, chunkSeconds:opts.chunkSeconds, sampleRate:audioBuffer.sampleRate}, channels.map(c => c.buffer))
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, outputChannels[0].length, audioBuffer.sampleRate);
  
    audioBuffer = ctx.createBuffer(outputChannels.length, outputChannels[0].length, audioBuffer.sampleRate);
    for(let i = 0; i < outputChannels.length; i++) { audioBuffer.copyToChannel(outputChannels[i], i); }
  
    return audioBuffer;
  
  }
  
module.exports = {
    mirroredChunksTransformer
}