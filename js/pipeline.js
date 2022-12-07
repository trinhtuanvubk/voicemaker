function addEffect(name, params, placement="end") {
    params = JSON.parse(JSON.stringify(params));

    if(!params) params = effectSpecsMap[name].params.reduce((a,v) => (a[v.name]=v.value, a), {});

    // make sure all params are included. add defaults for ones that are not (this allows me to add new parameters without things breaking)
    let gotAlready = Object.keys(params);
    let dontGot = effectSpecsMap[name].params.map(p => p.name).filter(n => !gotAlready.includes(n));
    if(dontGot.length > 0) {
      console.log("adding defaults for:", dontGot, `(${name} effect)`);
      let defaults = effectSpecsMap[name].params.reduce((a,v) => (a[v.name]=v.value, a), {});
      for(let name of dontGot) {
        params[name] = defaults[name];
      }
    }

    return params
}


async function loadOutputAudio() {
    if(typeof globalAudioBuffer === 'undefined' || !globalAudioBuffer) {
      alert("Have you chosen an input audio file, or recorded an audio clip using your microphone? Please do that first 👍");
      return;
    }
    if(alreadyLoadingOutputAudio) {
      return;
    }
    alreadyLoadingOutputAudio = true;
    // let $ = document.querySelector.bind(document);

    // regenerateAudioButton.classList.remove("blink");
    // regenerateAudioButton.style.fontWeight = "unset";

    // $(".output-voice-ctn").style.opacity = 1;
    // $("#voice-output-loader").style.display = "";
    // $("#voice-output-area").style.display = "none";

    let outputAudioBuffer = globalAudioBuffer;
    let i = 0;
    for(let effect of window.effects) {
    //   effectLoadProgressMessage.innerHTML = `applying effect ${i+1}/${window.effects.length}...`;
      // let params = effect.params.reduce((a, value, i) => (a[effectSpecsMap[effect.name].params[i].name]=value, a), {});
      // let paramsMap = effect.params.reduce((a,v) => (a[v.name]=v.value, a), {});
      let params = JSON.parse(JSON.stringify(effect.params));
      outputAudioBuffer = await window[effect.name+"Transformer"](outputAudioBuffer, params);
      i++;
    }
    effectLoadProgressMessage.innerHTML = `converting buffer to a .wav file...`;
    let outputWavBlob = await audioBufferToWaveBlob(outputAudioBuffer)
    // let audioUrl = window.URL.createObjectURL(outputWavBlob);
    // let audioTag = $("#output-audio-tag");
    // audioTag.src = audioUrl;
    // audioTag.play();

    // $("#download-output-audio-link").href = audioUrl;

    // $("#voice-output-loader").style.display = "none";
    // $("#voice-output-area").style.display = "";

    alreadyLoadingOutputAudio = false;

    return outputWavBlob
  }


function loadAudioFile(file) {
    let $ = document.querySelector.bind(document);

    if(file.size > maxFileSizeMegabytes*1000*1000) {
      if(!confirm("The audio file you're loading is quite large. Applying effects to it may take a long time, or may not work at all, depending on how powerful your computer is. Are you sure you want to continue? (If so, be aware that this webpage may lag for a while until it has fully loaded)")) {
        return;
      }
    }

    document.querySelector("#audio-loading-input").style.display = "flex";

    let reader = new FileReader();
    reader.onloadend = async function() {
      let arrayBuffer = this.result;
      try {
        globalAudioBuffer = await (new AudioContext()).decodeAudioData(arrayBuffer);
        $("#audio-load-success").style.display = "flex";
        document.querySelector("#audio-loading-input").style.display = "none";
        loadOutputAudio();
      } catch(e) {
        alert("Sorry, either that's not an audio file, or it's not an audio format that's supported by your browser. Most modern browsers support: wav, mp3, mp4, ogg, webm, flac. You should use Chrome or Firefox if you want the best audio support, and ensure you're using the *latest version* of your browser of choice. Chrome and Firefox update automatically, but you may need to completely close down the browser and potentially restart your device to 'force' it to update itself to the latest version. If you're using a work computer, or a school computer, they may have unfortunately \"locked\" the browser version to an older one.");
      }
    }
    reader.onerror = function (e) {
      alert("Sorry! There was an error reading that file: "+JSON.stringify(e));
    }

    reader.readAsArrayBuffer(file);

}


async function loadOutputAudio() {
    if(typeof globalAudioBuffer === 'undefined' || !globalAudioBuffer) {
      alert("Have you chosen an input audio file, or recorded an audio clip using your microphone? Please do that first 👍");
      return;
    }
    if(alreadyLoadingOutputAudio) {
      return;
    }
    alreadyLoadingOutputAudio = true;
    let $ = document.querySelector.bind(document);

    regenerateAudioButton.classList.remove("blink");
    regenerateAudioButton.style.fontWeight = "unset";

    $(".output-voice-ctn").style.opacity = 1;
    $("#voice-output-loader").style.display = "";
    $("#voice-output-area").style.display = "none";

    let outputAudioBuffer = globalAudioBuffer;
    let i = 0;
    for(let effect of window.effects) {
      effectLoadProgressMessage.innerHTML = `applying effect ${i+1}/${window.effects.length}...`;
      // let params = effect.params.reduce((a, value, i) => (a[effectSpecsMap[effect.name].params[i].name]=value, a), {});
      // let paramsMap = effect.params.reduce((a,v) => (a[v.name]=v.value, a), {});
      let params = JSON.parse(JSON.stringify(effect.params));
      outputAudioBuffer = await window[effect.name+"Transformer"](outputAudioBuffer, params);
      i++;
    }
    effectLoadProgressMessage.innerHTML = `converting buffer to a .wav file...`;
    let outputWavBlob = await audioBufferToWaveBlob(outputAudioBuffer)
    let audioUrl = window.URL.createObjectURL(outputWavBlob);
    let audioTag = $("#output-audio-tag");
    audioTag.src = audioUrl;
    audioTag.play();

    $("#download-output-audio-link").href = audioUrl;

    $("#voice-output-loader").style.display = "none";
    $("#voice-output-area").style.display = "";

    alreadyLoadingOutputAudio = false;
}