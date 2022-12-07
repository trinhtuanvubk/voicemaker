async function veryDistortedRadioTransformer(audioBuffer, opts) {

    opts.waveDistortion = opts.waveDistortion == undefined ? 5 : opts.waveDistortion;
    opts.squeakMult = opts.squeakMult == undefined ? 1 : opts.squeakMult;
    opts.masterGain = opts.masterGain == undefined ? 0.3 : opts.masterGain;
    opts.samplePeriod = opts.samplePeriod == undefined ? 7 : opts.samplePeriod;
  
    ///////////////////////////////////
    //    AUDIO GRAPH MANIPULATION   //
    ///////////////////////////////////
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    // Source
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    // Wave shaper
    let waveShaper = ctx.createWaveShaper();
    waveShaper.curve = makeDistortionCurve(opts.waveDistortion);
    function makeDistortionCurve(amount) {
      var k = amount;
      var n_samples = 44100;
      var curve = new Float32Array(n_samples);
      var deg = Math.PI / 180;
      var x;
      for (let i = 0; i < n_samples; ++i ) {
        x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      }
      return curve;
    }
  
    // Reverb
    //let convolver = ctx.createConvolver();
    //convolver.buffer = await ctx.decodeAudioData(await (await fetch("../audio/impulse-responses/tap-thing.mp3")).arrayBuffer());
  
    // Wobble
    let oscillator = ctx.createOscillator();
    oscillator.frequency.value = 0.2;
    oscillator.type = 'sine';
    // ---
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = 0.001;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = 0.02;
  
    // Create graph
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    source.connect(delay);
    delay.connect(waveShaper);
    //convolver.connect(waveShaper);
    waveShaper.connect(ctx.destination);
  
    // Render
    oscillator.start(0);
    source.start(0);
    audioBuffer = await ctx.startRendering();
  
  
    ////////////////////////////////////
    //       PCM MANIPULATION         //
    ////////////////////////////////////
    let channels = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) { channels[i] = new Float32Array(audioBuffer.getChannelData(i)); }
  
    // Run worker
    let outputChannels = await doWorkerTask(function() {
      self.onmessage = function(e) {
  
        const samplePeriod = e.data.samplePeriod;
        const masterGain = e.data.masterGain;
        const squeakMult = e.data.squeakMult;
        let inputChannels = e.data.channels;
        let depth = 1;
        let outputChannels = [];
        for(let i = 0; i < inputChannels.length; i++) {
          outputChannels[i] = new Float32Array( inputChannels[i].length );
          let sample = 0;
          let noise = 0;
          let squeak = 0;
          let squeakMod = Math.random();
          for(let j = 0; j < inputChannels[i].length; j++) {
            if(j%samplePeriod === 0) { sample = ((Math.floor(depth*inputChannels[i][j])/depth) + noise + squeak) * masterGain; }
            if(j%7 === 0) { noise = Math.random()*0.1; }
            if(j%700 === 0) { squeakMod += (Math.random()*2 - 1)*0.004; }
            squeak = Math.sin(j*squeakMod*1.5) * 0.05 * squeakMult;
            outputChannels[i][j] = sample;
          }
        }
  
        self.postMessage(outputChannels, [...outputChannels.map(c => c.buffer), ...inputChannels.map(c => c.buffer)]);
        self.close();
  
      }
    }, {channels, squeakMult:opts.squeakMult, masterGain:opts.masterGain, samplePeriod:opts.samplePeriod}, channels.map(c => c.buffer))
  
    ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, outputChannels[0].length, audioBuffer.sampleRate);
  
    let outputAudioBuffer = ctx.createBuffer(outputChannels.length, outputChannels[0].length, audioBuffer.sampleRate);
    for(let i = 0; i < outputChannels.length; i++) { outputAudioBuffer.copyToChannel(outputChannels[i], i); }
  
    return outputAudioBuffer;
  
  }
  
module.exports = {
    veryDistortedRadioTransformer
}