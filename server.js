// const transform = require("./transforms")

const transformer = require("./transformers")
console.log(transformer)
console.log(transformer.alienRobot)
const vocoder = require("./js/vocoder")
const helpers = require("./js/helpers")
const jungle = require("./js/jungle")
var AudioContext = require('web-audio-api').AudioContext
  , context = new AudioContext

async function alienRobotTransformer(audioBuffer, opts) {

    opts.frequency = opts.frequency === undefined ? 40 : opts.frequency;
    opts.oscGain = opts.oscGain === undefined ? 0.015 : opts.oscGain;
    opts.delayTime = opts.delayTime === undefined ? 0.05 : opts.delayTime;
    opts.magnitude = opts.magnitude === undefined ? 1 : opts.magnitude;
  
    let ctx = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  
    let source = ctx.createBufferSource();
    source.buffer = audioBuffer;
  
    let oscillator = ctx.createOscillator();
    oscillator.frequency.value = opts.frequency;
    oscillator.type = opts.oscType || 'sine';
  
    let oscillatorGain = ctx.createGain();
    oscillatorGain.gain.value = opts.oscGain;
  
    let delay = ctx.createDelay();
    delay.delayTime.value = opts.delayTime;
  
    // source --> delay --> ctx.destination
    // oscillator --> oscillatorGain --> delay.delayTime --> ctx.destination
  
    source.connect(delay);
  
    // SOURCE:
    let dryGain = ctx.createGain();
    source.connect(dryGain)
    dryGain.connect(ctx.destination);
  
    // TRANSFORMED:
    let wetGain = ctx.createGain();
    delay.connect(wetGain)
    wetGain.connect(ctx.destination);
  
    // MIX:
    dryGain.gain.value = 1 - opts.magnitude;
      wetGain.gain.value = opts.magnitude;
  
    oscillator.connect(oscillatorGain);
    oscillatorGain.connect(delay.delayTime);
  
    oscillator.start();
    source.start();
  
    let outputAudioBuffer = await ctx.startRendering();
    return outputAudioBuffer;
  
  }
const effectSpecs = [
    {
      name: "autowah",
      title: "Autowah",
      description: "Applies the famous autowah effect to the audio. Normal 'wah' effects are controlled by a pedal that the musician uses. Instead of this, autowah is controlled by the volume of the input signal. Read more about <a href='https://en.wikipedia.org/wiki/Auto-wah' target='_blank'>the effect</a> on wikipedia.",
      params: [
        {name:"followerFreq", title:"Follower Freq.", type:"range", min:0, max:100, step:0.1, value:10},
        {name:"wetGain", title:"Wet Gain", type:"range", min:0, max:2, step:0.1, value:1},
        {name:"comprThres", title:"Compressor Thres.", type:"range", min:-100, max:100, step:0.5, value:-20},
        {name:"comprRatio", title:"Compressor Ratio", type:"range", min:0, max:70, step:0.1, value:16},
        {name:"depthGain", title:"Depth Gain", type:"range", min:0, max:30000, step:1, value:11585},
        {name:"filterQ", title:"Filter Q", type:"range", min:0, max:50, step:1, value:15},
        {name:"filterFreq", title:"Filter Freq.", type:"range", min:0, max:150, step:1, value:50},
      ]
    },

    {
      name: "alienRobot",
      title: "Alien Robot",
      description: "This sounds like a sort of robotic alien insect thing - or some sort of alien robot, anyway. You can play around with the parameters to create some other strange effects too. Make sure to try <u>lowering the frequency</u> for some fun effects! Note that the \"magnitude\" parameter controls the <i>overall</i> amount that this effect is applied.",
      params: [
        {name:"magnitude", title:"Magnitude", type:"range", min:0, max:1, step:0.01, value:1},
        {name:"oscType", title:"Oscillator Type", type:"select", value:"sine", options:[{value:"sine", label:"sine wave"}, {value:"square", label:"square wave"}, {value:"sawtooth", label:"sawtooth wave"}, {value:"triangle", label:"triangle wave"}]},
        {name:"frequency", title:"Frequency", type:"range", min:0.01, max:200, step:0.01, value:40},
        {name:"oscGain", title:"Oscillator Gain", type:"range", min:0.001, max:0.08, step:0.001, value:0.015},
        {name:"delayTime", title:"Delay Time", type:"range", min:0.01, max:1, step:0.01, value:0.05},
      ]
    },
 
    {
      name: "anonymous",
      title: "Anonymous (Distorter)",
      description: "Makes your voice sound like a l33t hacker by applying a deepening effect (using a sawtooth oscillator) along with some distortion and white noise. Please note that this won't actually make your voice anonymous. If you want real anonymity, you should use a text-to-speech generator.",
      params: [
        {name:"distortion", title:"Distortion", type:"range", min:0, max:200, step:1, value:50},
        {name:"noiseMod", title:"Noise Mod", type:"range", min:1, max:10, step:1, value:9},
        {name:"oscFreq", title:"Sawtooth", type:"range", min:1, max:100, step:1, value:50},
      ]
    },
 
    {
      name: "astronaut",
      title: "Astronaut",
      description: "This module tries to emulate the noise/distortion that you hear in old audio clips of astronauts talking in space. It's similar to the telephone effect, but with some more distortion.",
      params: [
        {name:"distortion", title:"Distortion", type:"range", min:0, max:200, step:1, value:50},
        {name:"lowPassFreq", title:"Low Pass", type:"range", min:1, max:20000, step:1, value:2000},
        {name:"highPassFreq", title:"High Pass", type:"range", min:1, max:20000, step:1, value:500},
      ]
    },
  
  ];

const effectSpecsMap = effectSpecs.reduce((a,v) => (a[v.name]=v, a), {});
let defaultUrlData = `{"effects":[{"name":"pitchShift", "params":{"shift":2}}], "version":1}`







const path = require("path")
const express = require("express")
const fs = require("fs");
const wav = require("node-wav");
const multer = require("multer")
var app = express()


var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// app.use(express.static(__dirname));
app.use("css", express.static(path.join(__dirname, './css')))
app.use("transforms", express.static(path.join(__dirname, './transforms')))
app.use("js", express.static(path.join(__dirname, './js')))
app.use("audio", express.static(path.join(__dirname, './audio')))

var HTTP_PORT = 2726



// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })
   
var upload = multer({ storage: storage })


// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});


app.get("/", function(req, res) {
    res.json({"message" : "ok"});
})


app.post("/changer", upload.single("audio_file"), function(req, res){
    const buffer = req.file.buffer
    // let buffer = fs.readFileSync(file)
    console.log(JSON.stringify(buffer))
    // buffer = file
    console.log(buffer)
    // console.log(transformer.alienRobotTransformer())
    let effect = req.body 
    // for(let {name, params} of effects) {
    //     //let paramsMap = params.reduce((a,v) => (a[v.name]=v.value, a), {});
    //     addEffect(name, params);
    //   }
    console.log(effect)
    console.log(effect.name+"Transformer")
    let params = JSON.parse(JSON.stringify(effect.params));
    console.log(params)
    // outputAudioBuffer = transformer[effect.name+"Transformer"](buffer, params);
    outputAudioBuffer = alienRobotTransformer(buffer,params);
    let outputWavBlob = helpers.audioBufferToWaveBlob(outputAudioBuffer);
    res.send(outputWavBlob)

})



// fs.readFile("./src/audioFile.mp3", function(err, result) {
//     res.send(result.toString("base64"));
//   });


