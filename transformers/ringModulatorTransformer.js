async function ringModulatorTransformer(audioBuffer, opts) {

    opts.frequency = opts.frequency == undefined ? 30 : opts.frequency
  
    // This code was adapted from: https://raw.githubusercontent.com/alemangui/pizzicato/0.3.2/distr/Pizzicato.js
    // Which was probably adapted from here: http://webaudio.prototyping.bbc.co.uk/ring-modulator/
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    // Source
    let inputNode = ctx.createBufferSource();
    inputNode.buffer = audioBuffer;
  
    let outputNode = ctx.createGain();
    let dryGainNode = ctx.createGain();
    let wetGainNode = ctx.createGain();
  
  
    // `vIn` is the modulation oscillator input
    // `vc` is the audio input.
    let vIn = ctx.createOscillator();
    vIn.frequency.value = opts.frequency;
    vIn.start(0);
  
    let vInGain = ctx.createGain();
    vInGain.gain.value = 0.5;
  
    let vInInverter1 = ctx.createGain();
    vInInverter1.gain.value = -1;
  
    let vInInverter2 = ctx.createGain();
    vInInverter2.gain.value = -1;
  
    let vInDiode1 = new DiodeNode(ctx);
    let vInDiode2 = new DiodeNode(ctx);
  
    let vInInverter3 = ctx.createGain();
    vInInverter3.gain.value = -1;
  
    let vcInverter1 = ctx.createGain();
    vcInverter1.gain.value = -1;
  
    let vcDiode3 = new DiodeNode(ctx);
    let vcDiode4 = new DiodeNode(ctx);
  
    let outGain = ctx.createGain();
    outGain.gain.value = 1;
  
    let compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.ratio.value = 16;
  
    // dry mix
    inputNode.connect(dryGainNode);
    dryGainNode.connect(ctx.destination);
    dryGainNode.gain.value = 1 - opts.magnitude;
    wetGainNode.gain.value = opts.magnitude;
  
    // wet mix
    inputNode.connect(vcInverter1);
    inputNode.connect(vcDiode4.node);
  
    vcInverter1.connect(vcDiode3.node);
  
    vIn.connect(vInGain);
    vInGain.connect(vInInverter1);
    vInGain.connect(vcInverter1);
    vInGain.connect(vcDiode4.node);
  
    vInInverter1.connect(vInInverter2);
    vInInverter1.connect(vInDiode2.node);
    vInInverter2.connect(vInDiode1.node);
  
    vInDiode1.connect(vInInverter3);
    vInDiode2.connect(vInInverter3);
  
    vInInverter3.connect(compressor);
    vcDiode3.connect(compressor);
    vcDiode4.connect(compressor);
  
    compressor.connect(outGain);
    outGain.connect(wetGainNode);
  
    // line out
    wetGainNode.connect(ctx.destination);
  
    // Render
    inputNode.start();
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
  
  let DiodeNode = function(context_) {
    this.context = context_;
    this.node = this.context.createWaveShaper();
    this.vb = 0.2;
    this.vl = 0.4;
    this.h = 1;
    this.setCurve();
  };
  
  DiodeNode.prototype.setDistortion = function (distortion) {
    this.h = distortion;
    return this.setCurve();
  };
  
  DiodeNode.prototype.setCurve = function () {
    var i,
      samples,
      v,
      value,
      wsCurve,
      _i,
      _ref,
      retVal;
  
    samples = 1024;
    wsCurve = new Float32Array(samples);
  
    for (i = _i = 0, _ref = wsCurve.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      v = (i - samples / 2) / (samples / 2);
      v = Math.abs(v);
      if (v <= this.vb) {
        value = 0;
      } else if ((this.vb < v) && (v <= this.vl)) {
        value = this.h * ((Math.pow(v - this.vb, 2)) / (2 * this.vl - 2 * this.vb));
      } else {
        value = this.h * v - this.h * this.vl + (this.h * ((Math.pow(this.vl - this.vb, 2)) / (2 * this.vl - 2 * this.vb)));
      }
      wsCurve[i] = value;
    }
  
    retVal = this.node.curve = wsCurve;
    return retVal;
  };
  
  DiodeNode.prototype.connect = function(destination) {
    return this.node.connect(destination);
  };
  
module.exports = {
    ringModulatorTransformer
}