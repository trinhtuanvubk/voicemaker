async function cymbalConvolverTransformer(audioBuffer, opts) {

    opts.inputMag = opts.inputMag === undefined ? 1 : opts.inputMag;
    opts.echoMag = opts.echoMag === undefined ? 1 : opts.echoMag;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    // Source
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    // Reverb
    let convolver = ctx.createConvolver();
    convolver.buffer = await ctx.decodeAudioData(await (await fetch("/voicemaker/audio/impulse-responses/cymbal.wav")).arrayBuffer());
  
    // Create graph
    source.connect(convolver);
    //convolver.connect(ctx.destination);
  
    // SOURCE:
    let dryGain = ctx.createGain();
    source.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    convolver.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = opts.inputMag;
      wetGain.gain.value = opts.echoMag;
  
    // Render
    source.start();
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  