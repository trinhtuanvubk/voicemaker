async function vowelFilterTransformer(audioBuffer, opts) {

    // https://appgeo.github.io/web-audio-examples/formant.html
  
    opts.vowelValue = opts.vowelValue === undefined ? 0 : opts.vowelValue;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let masterGainNode;
    let masterFilterNode;
    let filterNodes = [];
    let gainNodes = [];
  
    masterFilterNode = ctx.createBiquadFilter();
    masterFilterNode.frequency.value = 5000;
    masterFilterNode.type = 'lowpass';
    source.connect(masterFilterNode);
  
    masterGainNode = ctx.createGain();
    masterGainNode.gain.value = 0;
  
    for (var i = 0; i <= 4; i++) {
      filterNodes[i] = ctx.createBiquadFilter();
      filterNodes[i].type = 'bandpass';
      masterFilterNode.connect(filterNodes[i]);
  
      gainNodes[i] = ctx.createGain();
      filterNodes[i].connect(gainNodes[i]);
  
      gainNodes[i].connect(masterGainNode);
    }
  
  
    masterGainNode.gain.setValueAtTime(0, ctx.currentTime);
    masterGainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
  
    function getIntermediate(prop, idx, vowelValue) {
      var i = Math.floor(vowelValue);
      var d = vowelValue - i;
      var dx = (vowelSpecs[i + 1][prop][idx] - vowelSpecs[i][prop][idx]) * d;
      return vowelSpecs[i][prop][idx] + dx;
    }
  
    for (var i = 0; i <= 4; i++) {
      filterNodes[i].frequency.value = getIntermediate('f', i, opts.vowelValue);
      filterNodes[i].Q.value = getIntermediate('q', i, opts.vowelValue);
      gainNodes[i].gain.value = getIntermediate('a', i, opts.vowelValue);
    }
  
    masterGainNode.connect(ctx.destination);
  
    source.start(0);
    return await ctx.startRendering();
  
  }
  
  // Sources
  //    Formant frequencies: Hillenbrand, Getty, Clark and Wheeler (1994), "Acoustic charcteristics of
  //        American English Vowels", Journal of the Acoustic Society of America; Table V
  //    Formant amplitudes: Peterson and Barney (1952), "Control Methods User in a Study of the Vowels",
  //        Journal of the Acoustic Society of America; Table II; dB converted to gain with
  //        Math.pow(10, dB / 20)
  
  var vowelSpecs = [
    {
      ipa: 'i',
      ex: 'b<b>ea</b>t',
      f: [138, 342, 2322, 3000, 3657],
      q: [8, 10, 35, 40, 40],
      a: [0.63, 0.63, 0.06, 0.04, 0.04]
    },
    {
      ipa: 'ɪ',
      ex: 'b<b>i</b>t',
      f: [135, 427, 2034, 2684, 3618],
      q: [8, 10, 35, 40, 40],
      a: [0.71, 0.71, 0.07, 0.04, 0.04]
    },
    {
      ipa: 'e',
      ex: 'b<b>a</b>it',
      f: [129, 476, 2089, 2691, 3649],
      q: [8, 10, 35, 40, 40],
      a: [0.79, 0.79, 0.10, 0.06, 0.06]
    },
    {
      ipa: 'ɛ',
      ex: 'b<b>e</b>t',
      f: [127, 580, 1799, 2605, 3677],
      q: [8, 10, 35, 40, 40],
      a: [0.79, 0.79, 0.14, 0.06, 0.06]
    },
    {
      ipa: 'æ',
      ex: 'b<b>a</b>t',
      f: [123, 588, 1952, 2601, 3624],
      q: [8, 10, 35, 40, 40],
      a: [0.89, 0.89, 0.25, 0.08, 0.08]
    },
    {
      ipa: 'ɑ',
      ex: 'p<b>a</b>r',
      f: [123, 768, 1333, 2522, 3687],
      q: [8, 10, 35, 40, 40],
      a: [0.89, 0.89, 0.56, 0.04, 0.04]
    },
    {
      ipa: 'ɔ',
      ex: 'b<b>o</b>t',
      f: [121, 652, 997, 2538, 3486],
      q: [8, 10, 35, 40, 40],
      a: [1, 1, 0.45, 0.02, 0.02]
    },
    {
      ipa: 'o',
      ex: 'b<b>o</b>at',
      f: [129, 497, 910, 2459, 3384],
      q: [8, 10, 35, 40, 40],
      a: [0.89, 0.89, 0.32, 0.02, 0.02]
    },
    {
      ipa: 'u',
      ex: 'b<b>oo</b>t',
      f: [143, 378, 997, 2343, 3357],
      q: [8, 10, 35, 40, 40],
      a: [0.71, 0.71, 0.11, 0.01, 0.01]
    },
    {
      ipa: 'ʊ',
      ex: 'p<b>u</b>t',
      f: [133, 469, 1122, 2434, 3400],
      q: [8, 10, 35, 40, 40],
      a: [0.89, 0.89, 0.25, 0.02, 0.02]
    },
    {
      ipa: 'ʌ',
      ex: 'b<b>u</b>t',
      f: [133, 623, 1200, 2550, 3557],
      q: [8, 10, 35, 40, 40],
      a: [0.89, 0.89, 0.32, 0.04, 0.04]
    },
    {
      ipa: 'ɚ',
      ex: 'b<b>ir</b>d',
      f: [130, 474, 1379, 1710, 3334],
      q: [8, 10, 35, 40, 40],
      a: [0.56, 0.56, 0.18, 0.10, 0.10]
    }
  ];
  

module.exports = {
    vowelFilterTransformer
}