async function astronautTransformer(audioBuffer, opts) {

    opts.distortion = opts.distortion === undefined ? 50 : opts.distortion;
    opts.lowPassFreq = opts.lowPassFreq === undefined ? 2000 : opts.lowPassFreq;
    opts.highPassFreq = opts.highPassFreq === undefined ? 500 : opts.highPassFreq;
  
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
  
    // Filter
    let filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1300;
  
    // Initial distortion
    source.connect(filter);
    filter.connect(waveShaper);
  
    // Telephone effect
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
    compressor.connect( ctx.destination );
  
    // Connect distorter to telephone effect
    waveShaper.connect(lpf1);
  
    // Render
    source.start();
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
