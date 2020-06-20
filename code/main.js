// general / html-related
// let message;
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let canvas, ctx, w, h; // canvas 
let lifeImg;

// map (variables should vary for different levels in the final version)
let nColors = 4; // number of colors >=2; <nColorsUpperLimit
let colors = [['#5ECBF2', '#1D9DD2', 'blue'], ['#FEDE68', '#E9B926', 'yellow'], ['#FB4D4B', '#D60904', 'red'], ['#2CDDAF', '#168469', 'green'], ['#FC954F', '#D45A10', 'orange'], ['#9582D2', '#553BA9', 'purple']];
// [tileClr, shadowClr, colorName, colorSegments ( [i,'d'] - for tiles until i, their directions are 'd'; e.g. [[1,'TL'],[3,'BL']])]
let nTimes = 3; // number of times each color sequence appears
let nTiles = 3; // number of tiles in a color sequence
let nTurns = 0; // number of turns in a sequence; nTurns <= (nTiles-2)
let nHistory = 5; // history shown
let map = [];
let directions = ['TL', 'TR', 'BL', 'BR']; // TopLeft, TopRight, BottomLeft, BottomRight
let endOfMaze = false;

let nColorsUpperLimit = combinations(nTiles - 2, nTurns) * directions.length * (nTurns + 1);

// tile
let tileWidth, tileLength, tileHeight; // tile 
let xDistance, yDistance; // distance between tiles
let currentTileAlpha = 1;
let curNextTileAlpha = 0;
let nextTileAlpha = 1;
let historyAlpha = 0.5;
let dCurrentTileAlpha = 0; // amount reduced
let dHistoryAlpha = 0;
let dNextTileAlpha;
let rateHistoryAlpha = (historyAlpha - 0) / (nHistory);
let sinceClrStarted = 1; // to detect when to highlight
let currentTile = 0;
let nextTileDelayTime = 20;
let delayed = 0;

// interaction
let transitionProgressY = 0; // tbe amount of transition already happened on the y-axis
let proceed = false;
let transitionSpeed;
let mistake = false;
let moves = ['start']; // no move needed for the first tile

// feedback
let lifeMax = 3;
let lifeLeft = lifeMax;
let heartW, heartH, heartInterval;
let end;


window.onload = function () {
    // if (nColorsUpperLimit < nColors) alert("nColors exceeds its limit!");
    // if (nTurns > nTiles-2) alert("nTurns exceeds its limit!");
    init();
    window.addEventListener("keydown", restart);
    canvas.addEventListener("click", updatePlayerPosition);
    window.addEventListener('resize', init, false);
    startGame();
    mainLoop();
}

function init() {
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
    lifeImg = document.getElementById('life');
    ctx.imageSmoothingEnabled = false;
    // message = document.querySelector("#myMessage");
    // message.innerHTML = "Welcome to Rainbow Run! Click on where the next tile appears to run through the maze.";
    w = window.innerWidth;
    h = window.innerHeight;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    dNextTileAlpha = nextTileAlpha/50;
}

function startGame() {
    // set up variables
    tileWidth = w / 6;
    console.log(tileWidth);
    tileLength = tileWidth / 1.5;
    tileHeight = tileLength / 5;
    transitionSpeed = tileWidth / 40;
    xDistance = tileWidth / 2 + tileHeight * 1.5; // distance from the last tile on x-axis
    yDistance = tileHeight + tileLength / 2; // distance from the last tile on y-axis
    
    // feedback
    lifeImg.width = 56;
    lifeImg.height = 48;
    heartW = lifeImg.width;
    heartH = lifeImg.height;
    heartInterval = heartW/2;

    // map
    generateMap();
}


function mainLoop() {
    //clear area
    //ctx.clearRect(0,0,w,h);
    if (end){
        alert("Game over.");
    }
    if (proceed === true) { // transitioning
        //playerOnTile(map[currentTile+1]);
        if (transitionProgressY <= yDistance) {
            ctx.clearRect(0-xDistance,0-yDistance,w+xDistance*2,h+yDistance*2);
            //displayLife();
            transitionProgressY += transitionSpeed;
            proceedTransition(getOppositeDirection(map[currentTile].relativePositionToLast));
            //playerOnTile(map[currentTile+1]);
        }
        else { // finished transition
            // no clearRect here, otherwise the end of the transition will be jerky
            proceed = false;
            delayed =0;
            curNextTileAlpha = 0;
            //if (map[currentTile].tileClr !== '#B1BCCA') sinceClrStarted++;
            ctx.restore(); // 0,0
            // currentTile++;
        }
    }
    else {
        ctx.restore(); // 0,0
        ctx.clearRect(0, 0, w, h);
        displayLife();

        transitionProgressY = 0;
        dCurrentTileAlpha = 0;
        dHistoryAlpha = 0;
        //dNextTileAlpha=0;
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        centerTile(currentTile);
        playerOnTile(map[currentTile]);
        ctx.restore(); // 0,0
    }

    requestAnimationFrame(mainLoop);
}


function clearCanvas(){ // also draws the fixed components like the banner

}

function product_Range(a, b) {
    var prd = a, i = a;

    while (i++ < b) {
        prd *= i;
    }
    return prd;
}


function combinations(n, r) {
    if (n == r) {
        return 1;
    }
    else {
        r = (r < n - r) ? n - r : r;
        return product_Range(r + 1, n) / product_Range(1, n - r);
    }
}