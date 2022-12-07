async function tinyRobotTransformer(audioBuffer, opts) {

    opts.variation = opts.variation === undefined ? 1 : opts.variation;
    opts.chunkSeconds = opts.chunkSeconds === undefined ? 0.05 : opts.chunkSeconds;
    opts.magnitude = opts.magnitude === undefined ? 1 : opts.magnitude;
  
    let channels = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) { channels[i] = new Float32Array(audioBuffer.getChannelData(i)); }
  
    // Run worker
    let outputChannels = await doWorkerTask(function() {
      self.onmessage = function(e) {
  
        let inputChannels = e.data.channels;
        let sampleRate = e.data.sampleRate;
        let variation = e.data.variation === undefined ? 1 : e.data.variation;
        let chunkSeconds = e.data.chunkSeconds === undefined ? 0.05 : e.data.chunkSeconds;
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
            if(variation === 1) {
              chunks[j] = [...dup.reverse(), ...chunks[j], ...dup, ...dup.reverse()];
            } else {
              chunks[j] = [...chunks[j], ...dup];
            }
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
  
          // resample
          let resampledOutput = [];
          let desiredSamplesPerPoint = input.length / output.length;
          let numSamplesSoFar = 0;
          for(let j = 0; j < output.length; j++) {
  
            // If less than required sample ratio, grab another sample
            let numPointsSoFar = j+1;
            if(numSamplesSoFar/numPointsSoFar < desiredSamplesPerPoint) {
              resampledOutput.push(output[j]);
              numSamplesSoFar++;
            }
            // resampledOutput.push(output[j]);
  
          }
  
          outputChannels.push(Float32Array.from(resampledOutput));
  
        }
  
        self.postMessage(outputChannels, [...outputChannels.map(c => c.buffer), ...inputChannels.map(c => c.buffer)]);
        self.close();
  
      }
    }, {channels, variation:opts.variation, chunkSeconds:opts.chunkSeconds, sampleRate:audioBuffer.sampleRate}, channels.map(c => c.buffer))
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, outputChannels[0].length, audioBuffer.sampleRate);
  
    let outputAudioBuffer = ctx.createBuffer(outputChannels.length, outputChannels[0].length, audioBuffer.sampleRate);
    for(let i = 0; i < outputChannels.length; i++) { outputAudioBuffer.copyToChannel(outputChannels[i], i); }
  
  
    let sourceDry = ctx.createBufferSource();
    sourceDry.buffer = audioBuffer;
  
    let sourceWet = ctx.createBufferSource();
    sourceWet.buffer = outputAudioBuffer;
  
    // SOURCE:
    let dryGain = ctx.createGain();
    sourceDry.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    sourceWet.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = 1 - opts.magnitude;
    wetGain.gain.value = opts.magnitude;
  
    sourceDry.start(0);
    sourceWet.start(0);
  
    return await ctx.startRendering();
  
  }
  
module.exports = {
tinyRobotTransformer
}