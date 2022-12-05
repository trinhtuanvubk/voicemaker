async function oldRadioTransformer(audioBuffer, opts) {

    opts.distortion = opts.distortion === undefined ? 100 : opts.distortion;
    opts.magnitude = opts.magnitude === undefined ? 1 : opts.magnitude;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    // Source
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    // Wave shaper
    let waveShaper = ctx.createWaveShaper();
    waveShaper.curve = makeDistortionCurve(opts.distortion);
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
    oscillator.frequency.value = 0.2;
    oscillator.type = 'sine';
    // ---
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = 0.001;
    // ---
    let delay = ctx.createDelay();
    delay.delayTime.value = 0.01;
  
    // White noise
    let noise = ctx.createBufferSource();
    let noiseBuffer = ctx.createBuffer(1, 32768, ctx.sampleRate)
    let noiseData = noiseBuffer.getChannelData(0);
    for (var i = 0; i < 32768; i+=3) {
      noiseData[i] = Math.random()*2;//*Math.random()*Math.random()*Math.random()*Math.random()*Math.random()*0.4;
      noiseData[i+1] = noiseData[i];
      noiseData[i+2] = noiseData[i];
    }
    noise.buffer = noiseBuffer;
    noise.loop = true;
    let noiseWobble = ctx.createGain();
    noiseWobble.gain.value = 1;
  
    // Create graph
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
    // ---
    source.connect(noiseWobble);
    noiseWobble.connect(delay);
    delay.connect(convolver);
    convolver.connect(waveShaper);
    //waveShaper.connect(ctx.destination);
    // ---
    noise.connect(noiseWobble.gain);
  
  
    // SOURCE:
    let dryGain = ctx.createGain();
    source.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    waveShaper.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = 1 - opts.magnitude;
      wetGain.gain.value = opts.magnitude;
  
    // Render
    oscillator.start(0);
    noise.start(0);
    source.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  