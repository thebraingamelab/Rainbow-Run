// general / html-related
// let message;
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
let canvas, ctx, w, h; // canvas 
let strokeClr = 'rgba(35,44,58,0.2)';
let tilePageRatio = 12;

// map (variables should vary for different levels in the final version)
let nColors = 2; // number of colors >=2; <nColorsUpperLimit
let colors = [['#FB4D4B', '#D60904', 'red'], ['#FC954F', '#D45A10', 'orange'], ['#FEDE68', '#E9B926', 'yellow'], ['#2CDDAF', '#168469', 'green'], ['#5ECBF2', '#1D9DD2', 'blue'], ['#9582D2', '#553BA9', 'purple']];
// [0:tileClr, 1:shadowClr, 2:colorName, 3:colorSegments ( [i,'d'] - for tiles until i their directions are 'd'; e.g. [[1,'TL'],[3,'BL']])]
let rainbowColors = [['#FB4D4B', '#D60904', 'red'], ['#FC954F', '#D45A10', 'orange'], ['#FEDE68', '#E9B926', 'yellow'], ['#2CDDAF', '#168469', 'green'], ['#5ECBF2', '#1D9DD2', 'blue'], ['#9582D2', '#553BA9', 'purple']];
let greyTileClr = '#B1BCCA';
let greyShadowClr = '#66738E';
let nTimes = 10; // number of times each color sequence appears
let nTiles = 3; // number of tiles in a color sequence
let nTurns = 1; // number of turns in a sequence; nTurns <= (nTiles-2)
let nHistory = 7; // history shown 
let map = [];
let directions = ['TL', 'TR', 'BL', 'BR']; // TopLeft, TopRight, BottomLeft, BottomRight
let endOfMaze = false;

let offsets; //{xOffset, yOffset}
let shownTiles = []; // {xOffset, yOffset}
// let nColorsUpperLimit = combinations(nTiles - 2, nTurns) * directions.length * (nTurns + 1);

// tile
let tileWidth, tileLength, tileHeight; // tile 
let xDistance, yDistance, xPerY; // distance between tiles
let currentTileAlpha = 1;
let curNextTileAlpha = 0;
let nextTileAlpha = 1;
let historyAlpha = 0.6;
let dCurrentTileAlpha = 0; // amount reduced
let dNextTileAlpha;
let rateHistoryAlpha = (historyAlpha - 0) / (nHistory);
let sinceClrStarted = 1; // to detect when to highlight
let currentTile = 0;
let nextTileDelayTime = 10;
let delayed = 0;
let disappearingTiles = []; // {tile (tile's counter -  from the last history shown to cur-1), alpha]
let alphaThreshold = 0.2; // least opacity before collapsing
let disappearingSpeed = 0.003; // in terms of globalAlpha


// collapse
let last_collapse = 0;
collapseInterval = 1000;
let startCollapsing = nTiles*2-1;
// let collapsingIntervalDefault = 700; // in ms
// let collapsingInterval = collapsingIntervalDefault; // in ms

// interaction
let transitionProgressY = 0; // tbe amount of transition already happened on the y-axis
let proceed = false;
let transitionSpeed;
let mistake = false;
let slow = false;
let moves = ['start']; // no move needed for the first tile
let playerX, playerY;
let arrowImgWidth;
let arrows = [];
// let accurateSequence;

// feedback
let curScore = 0;
let targetScore = 0;
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
let crownImgUpSpeed = 1;

// let clickFinish = 50;
// let clickProgress = clickFinish;
// let dClickProgress = 5;
// let clickAlpha = 0;
// let dClickAlpha = 0.005;

// sound
let context;
// var bufferLoader;
let clickAudio, completeAudio, highlightAudio, slowAudio, errorAudio, fallAudio, gameOverAudio;
let _musicGainNode, _sfxGainNode;
// Volume control (1 = 100%)
let _masterVolume = 1;
let _musicVolume = 0.1;
let _sfxVolume = 0.15;



window.onload = function () {
    init(); // Set up page variables
    setUpGame(); // Set up game variables

    gameStatus = 'INTRO';
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

function setUpGame() {
    shuffle(colors);

    // set up variables
    if (w>h) {
        tileWidth = w/tilePageRatio*1.5;
        setTileParaByWidth(tileWidth);
    }
    else {
        tileLength = h/tilePageRatio*1.1;
        setTileParaByLength(tileLength);
    }
    xPerY = xDistance / yDistance; // for every transition of 1 on y-axis, transition of xPerY on x-axis
    // outro
    jumpPeak = tileWidth; 
    outroRotateAngle = 360/jumpPeak;
    // tileWidth = Math.max(w, h) / (nHistory + 1);
    // setTileParaByWidth(tileWidth);
    transitionSpeed = tileWidth / 20;

    //arrow
    let arrowImgs = document.getElementsByClassName("arrow");
    arrowImgWidth = tileWidth / 1.5;
    for (let i = 0; i < arrowImgs.length; i++) {
        arrowImgs[i].style.display = 'initial';
        arrowImgs[i].width = arrowImgWidth;
        arrowImgs[i].addEventListener('click', updatePlayerPosition);
        arrows.push(arrowImgs[i]);
    }


    // map
    generateMap();

    // feedback
    mapView = false;
    gameOver = false;
    //text
    gameOverText = document.getElementById("gameOverText");
    winText = document.getElementById("winText");
    score = document.getElementById("score");

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
    character = document.getElementById("character");
    character.width = tileWidth / 2;
    crownImg = document.getElementById("crownImg");
    crownImg.width = character.width;
    crownImgTop = h / 2 - crownImg.height/2;
    crownAlpha = 0;
    handImg = document.getElementById("handImg");
    handImg.width = tileWidth/1.8;
    // handImg.setAttribute("fill", "green");
    // handImg.style.opacity =0;

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
}
