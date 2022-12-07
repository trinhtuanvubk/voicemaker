async function signalInterferanceTransformer(audioBuffer, opts) {

    opts.chunkLenClip = opts.chunkLenClip == undefined ? 20 : opts.chunkLenClip;
  
    let channels = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) { channels[i] = new Float32Array(audioBuffer.getChannelData(i)); }
  
    // Run worker
    let outputChannels = await doWorkerTask(function() {
      self.onmessage = function(e) {
  
        const chunkLenClip = e.data.chunkLenClip;
  
        let inputChannels = e.data.channels;
        let sampleRate = e.data.sampleRate;
  
        let outputChannels = [];
        for(let i = 0; i < inputChannels.length; i++) {
          let input = inputChannels[i];
          let output = new Float32Array(input.length);
  
          // cut input at nodal points
          let chunks = [];
          let currentChunk = [];
          for(let j = 0; j < input.length; j++) {
            if(input[j] > 0 && input[j-1] < 0 || input[j] < 0 && input[j-1] > 0) {
              chunks.push(currentChunk);
              currentChunk = [];
            }
            currentChunk.push(input[j]);
          }
  
          // play with chunks
          for(let j = 0; j < chunks.length; j++) {
            let chunk = chunks[j];
            let numberOfPoints = chunk.length;
            let radiansPerPoint = Math.PI / numberOfPoints;
            let sign = chunk[0] > 0 ? 1 : -1;
            if(numberOfPoints < chunkLenClip) { sign = 0; }
            for(let p = 0; p < numberOfPoints; p++) {
              chunk[p] = sign*Math.sin(radiansPerPoint*p);
            }
          }
  
          // join chunks
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
    }, {channels, sampleRate:audioBuffer.sampleRate, chunkLenClip:opts.chunkLenClip}, channels.map(c => c.buffer))
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, outputChannels[0].length, audioBuffer.sampleRate);
  
    audioBuffer = ctx.createBuffer(outputChannels.length, outputChannels[0].length, audioBuffer.sampleRate);
    for(let i = 0; i < outputChannels.length; i++) { audioBuffer.copyToChannel(outputChannels[i], i); }
  
    return audioBuffer;
  
    // let source = ctx.createBufferSource();
    // source.buffer = audioBuffer;
    //
    //
    // let compressor = ctx.createDynamicsCompressor();
    // source.connect(compressor);
    // compressor.connect(ctx.destination);
    //
    // source.start(0);
    // return await ctx.startRendering();
  
  }
  

module.exports = {
    signalInterferanceTransformer
}