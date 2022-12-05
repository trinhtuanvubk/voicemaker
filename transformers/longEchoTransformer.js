async function longEchoTransformer(audioBuffer, opts) {

    opts.dryGain = opts.dryGain === undefined ? 0 : opts.dryGain;
    opts.wetGain = opts.wetGain === undefined ? 1 : opts.wetGain;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    // Source
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    // Reverb
    let convolver = ctx.createConvolver();
    convolver.buffer = await ctx.decodeAudioData(await (await fetch("/voicemaker/audio/impulse-responses/voxengo/Large Long Echo Hall.wav")).arrayBuffer());
  
    // Create graph
    source.connect(convolver);
    convolver.connect(ctx.destination);
  
    // SOURCE:
    let dryGain = ctx.createGain();
    source.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    convolver.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = opts.dryGain;
      wetGain.gain.value = opts.wetGain;
  
    // Render
    source.start();
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  