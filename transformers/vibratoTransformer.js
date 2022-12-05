async function vibratoTransformer(audioBuffer, opts) {

    opts.freq = opts.freq === undefined ? 4.5 : opts.freq;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    // Input
    let inputNode = ctx.createBufferSource();
    inputNode.buffer = audioBuffer;
  
    // Delay
    let delayNode = ctx.createDelay();
    delayNode.delayTime.value = 0.03;
    cdelay = delayNode;
  
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    let wetGain = ctx.createGain();
  
    gain.gain.value = 0.002; // depth of change to the delay:
    cdepth = gain;
  
    osc.type = 'sine';
    osc.frequency.value = opts.freq;
    cspeed = osc;
  
    osc.connect( gain );
    gain.connect( delayNode.delayTime );
    inputNode.connect( delayNode );
    delayNode.connect( wetGain );
    wetGain.connect( ctx.destination );
  
    osc.start(0);
    inputNode.start(0);
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  