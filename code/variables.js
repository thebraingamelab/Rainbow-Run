// general / html-related
// let message;
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let canvas, ctx, w, h; // canvas 
let strokeClr = 'rgba(35,44,58,0.2)';

// map (variables should vary for different levels in the final version)
let nColors = 3; // number of colors >=2; <nColorsUpperLimit
let colors = [['#5ECBF2', '#1D9DD2', 'blue'], ['#FEDE68', '#E9B926', 'yellow'], ['#FB4D4B', '#D60904', 'red'], ['#2CDDAF', '#168469', 'green'], ['#FC954F', '#D45A10', 'orange'], ['#9582D2', '#553BA9', 'purple']];
// [0:tileClr, 1:shadowClr, 2:colorName, 3:colorSegments ( [i,'d'] - for tiles until i their directions are 'd'; e.g. [[1,'TL'],[3,'BL']]) , 4:color notes [C3, E3, G3] ]
let greyTileClr = '#B1BCCA';
let greyShadowClr = '#66738E';
let nTimes = 4; // number of times each color sequence appears
let nTiles = 3; // number of tiles in a color sequence
let nTurns = 1; // number of turns in a sequence; nTurns <= (nTiles-2)
let nHistory = 7; // history shown 
let map = [];
let directions = ['TL', 'TR', 'BL', 'BR']; // TopLeft, TopRight, BottomLeft, BottomRight
let endOfMaze = false;

// let nColorsUpperLimit = combinations(nTiles - 2, nTurns) * directions.length * (nTurns + 1);

// tile
let tileWidth, tileLength, tileHeight; // tile 
let xDistance, yDistance; // distance between tiles
let currentTileAlpha = 1;
let curNextTileAlpha = 0;
let nextTileAlpha = 1;
let historyAlpha = 0.5;
let dCurrentTileAlpha = 0; // amount reduced
// let dHistoryAlpha = 0;
let dNextTileAlpha;
let rateHistoryAlpha = (historyAlpha - 0) / (nHistory);
let sinceClrStarted = 1; // to detect when to highlight
let currentTile = 0;
let nextTileDelayTime = 10;
let delayed = 0;
let disappearingTiles = []; // {tile (tile's counter -  from the last history shown to cur-1), alpha]
let alphaThreshold = 0.3;
let disappearingSpeed = 0.003; // in terms of globalAlpha
// let collapseThreshold = 0.1;
let collapseDefault;
let justCollapsed = 0;
let collapsingInterval = 800; // in ms
let collapsingSpeed = disappearingSpeed * 3;


// interaction
let transitionProgressY = 0; // tbe amount of transition already happened on the y-axis
let proceed = false;
let transitionSpeed;
let mistake = false;
let slow = false;
let moves = ['start']; // no move needed for the first tile

// feedback
let lives = [];
let lifeMax = 3; // Must update the number of img (.life) in html when changing this variable
let lifeLeft = lifeMax;
let lifeImgWidth;
let heartW, heartH, heartInterval;
let gameOver;
let currentCollapsingThreshold = 500;
let currentCollapsing = currentCollapsingThreshold * 0.95;
let mapView;
let mapTranslateX, mapTranslateY;
let incorrectImg, reduceLifeImg;
let mousePosX, mousePosY;
let gameOverText, winText, mapViewText;
let crownImg, crownImgTop, crownAlpha, character;
let crownImgUpSpeed = 5;

// sound
let context;
// var bufferLoader;
let clickAudio, completeAudio, highlightAudio, slowAudio, errorAudio, fallAudio, gameOverAudio;
let _musicGainNode, _sfxGainNode;
// Volume control (1 = 100%)
let _masterVolume = 1;
let _musicVolume = 0.1;
let _sfxVolume = 0.15;

// instruments
let sampleInstruments;
let curInstrument;
let notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // CDFGA have sharps
let attackedFirstNote = false;

// mode
let mode = 'CLEAN';
let arrowImgWidth;
let arrows = [];

window.onload = function () {
    // if (nColorsUpperLimit < nColors) alert("nColors exceeds its limit!");
    // if (nTurns > nTiles-2) alert("nTurns exceeds its limit!");
    init();
    startGame();
    mainLoop();
}

function init() {
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    w = window.innerWidth;
    h = window.innerHeight;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    dNextTileAlpha = nextTileAlpha / 50;

    // sound
    try {
        // Fix up for prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
    }
    catch (e) {
        alert('Web Audio API is not supported in this browser');
    }
}

function startGame() {
    shuffle(colors);

    // set mode
    mode = 'GRIDARROW';

    // set up variables
    tileWidth = Math.max(w, h) / (nHistory + 1);
    setTileParaByWidth(tileWidth);
    transitionSpeed = tileWidth / 20;

    //arrow
    if ((mode === 'ARROW') || (mode === 'GRIDARROW')) {
        let arrowImgs = document.getElementsByClassName("arrow");
        arrowImgWidth = tileWidth / 1.5;
        for (let i = 0; i < arrowImgs.length; i++) {
            arrowImgs[i].style.display = 'initial';
            arrowImgs[i].width = arrowImgWidth;
            arrowImgs[i].addEventListener('click', updatePlayerPosition);
            arrows.push(arrowImgs[i]);
        }
    }

    // map
    generateMap();

    // feedback
    mapView = false;
    gameOver = false;
    //text
    gameOverText = document.getElementById("gameOverText");
    winText = document.getElementById("winText");
    //image
    let lifeImgs = document.getElementsByClassName("life");
    lifeImgWidth = Math.min(w, h) / 12;
    for (let i = 0; i < lifeImgs.length; i++) {
        lifeImgs[i].width = lifeImgWidth;
        lives.push(lifeImgs[i]);
    }
    incorrectImg = document.getElementById("incorrectImg");
    incorrectImg.width = tileWidth / 2;
    incorrectImg.height = incorrectImg.width;
    // reduceLifeImg = document.getElementById("reduceLifeImg");
    // reduceLifeImg.height = incorrectImg.height/1.5;
    crownImg = document.getElementById("crownImg");
    crownImg.width = tileWidth / 2;
    crownImgTop = h / 2 - tileLength;
    crownAlpha = 0;
    character = document.getElementById("character");
    character.width = tileWidth / 2;

    // sound

    // Music volume
    _musicGainNode = context.createGain();
    _musicGainNode.gain.value = _musicVolume;
    // Sound Effects volume
    _sfxGainNode = context.createGain();
    _sfxGainNode.gain.value = _sfxVolume;

    clickAudio = new Sound("audio/click.mp3", context, _sfxGainNode);
    completeAudio = new Sound("audio/complete.mp3", context, _sfxGainNode);
    highlightAudio = new Sound("audio/positive.mp3", context, _sfxGainNode);
    slowAudio = new Sound("audio/slow.mp3", context, _sfxGainNode);
    errorAudio = new Sound("audio/error.mp3", context, _sfxGainNode);
    fallAudio = new Sound("audio/whoosh.mp3", context, _sfxGainNode);
    gameOverAudio = new Sound("audio/gameOver.mp3", context, _sfxGainNode);


    // instruments
    sampleInstruments = SampleLibrary.load({
        instruments: "piano",
        minify: true,
        baseUrl: "/Rainbow-Run/code/instruments/samples/"
    });
    curInstrument = sampleInstruments;
}


function setTileParaByWidth(tileWidth) {
    tileLength = tileWidth / 1.5;
    tileHeight = tileLength / 5;
    xDistance = tileWidth / 2 + tileHeight * 1.5; // distance from the last tile on x-axis
    yDistance = tileHeight + tileLength / 2; // distance from the last tile on y-axis

}

function setTileParaByLength(tileLength) {
    tileWidth = tileLength * 1.5;
    tileHeight = tileLength / 5;
    xDistance = tileWidth / 2 + tileHeight * 1.5; // distance from the last tile on x-axis
    yDistance = tileHeight + tileLength / 2; // distance from the last tile on y-axis
}


// Sound object
function Sound(filePath, audioContext, gainNode, loop = false) {
    let my = this;
    // let testAudio;
    let xhr;

    // Initialize fields (constructor stuff)
    this.buffer = null;
    this.audioContext = audioContext;
    this.gainNode = gainNode;
    this.loop = loop;

    // Check for file type compatibility
    testAudio = document.createElement("audio");

    // Fetch the file
    xhr = new XMLHttpRequest();
    xhr.open('GET', encodeURI(filePath), true);
    xhr.responseType = 'arraybuffer';
    // xhr.onload = function() {
    //     context.decodeAudioData(xhr.response, function(buffer) {
    //       my.buffer = buffer;
    //     }, onError);
    //   }
    // Oopsie doopsie, couldn't fetch the file
    xhr.addEventListener("error", function () {
        console.log('Error loading from server: ' + filePath);
    }, false);
    // On successful load, decode the audio data
    xhr.addEventListener("load", function () {
        audioContext.decodeAudioData(xhr.response,
            // Success
            function (audioBuffer) {
                my.buffer = audioBuffer;
            },
            // Error
            function (e) {
                console.log("Error decoding audio data: " + e.err);
            });
    }, false);
    xhr.send();
}

// Play function, for playing the sound
Sound.prototype.play = function () {
    let thisObject = this;

    // Play the sound only if it's been decoded already
    if (this.buffer) {
        let bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = this.buffer;
        bufferSource.connect(this.gainNode).connect(this.audioContext.destination);
        bufferSource.start(0);
        bufferSource.loop = this.loop;
    }

    // If it hasn't been decoded yet, check every 50ms to see if it's ready
    else {
        window.setTimeout(function () {
            thisObject.play();
        }, 50);
    }
};;