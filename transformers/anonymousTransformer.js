async function anonymousTransformer(audioBuffer, opts) {

    const noiseMod = opts.noiseMod === undefined ? 8 : opts.noiseMod;
    opts.oscFreq = opts.oscFreq === undefined ? 50 : opts.oscFreq;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
  
    // Source
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    // Wave shaper
    let waveShaper = ctx.createWaveShaper();
    waveShaper.curve = makeDistortionCurve(opts.distortion === undefined ? 50 : opts.distortion);
    function makeDistortionCurve(amount) {
      var k = typeof amount === 'number' ? amount : 50;
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
    let convolver = ctx.createConvolver();
    convolver.buffer = await ctx.decodeAudioData(await (await fetch("/voicemaker/audio/impulse-responses/portable-radio.wav")).arrayBuffer());
  
    // Wobble
    let oscillator = ctx.createOscillator();
    oscillator.frequency.value = opts.oscFreq;
    oscillator.type = 'sawtooth';
    // ---
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = 0.005;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = 0.01;
  
    // White noise
    let noise = ctx.createBufferSource();
    let noiseBuffer = ctx.createBuffer(1, 32768, ctx.sampleRate)
    let noiseData = noiseBuffer.getChannelData(0);
    for (var i = 0; i < 32768; i++) {
      let r = 1;
      for(let j = 0; j < noiseMod; j++) r *= Math.random();
      noiseData[i] = r*0.6;
    }
    noise.buffer = noiseBuffer;
    noise.loop = true;
  
    // Create graph
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    source.connect(delay)
    delay.connect(waveShaper);
    //delay.connect(convolver);
    //convolver.connect(waveShaper);
    waveShaper.connect(ctx.destination);
    // ---
    noise.connect(ctx.destination);
  
    // Render
    oscillator.start(0);
    noise.start(0);
    source.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  
module.exports = {
    anonymousTransformer
}