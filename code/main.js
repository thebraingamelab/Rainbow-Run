// general / html-related
// let message;
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let canvas, ctx, w, h; // canvas 
let strokeClr = 'rgba(35,44,58,0.2)';

// map (variables should vary for different levels in the final version)
let nColors = 3; // number of colors >=2; <nColorsUpperLimit
let colors = [['#5ECBF2', '#1D9DD2', 'blue'], ['#FEDE68', '#E9B926', 'yellow'], ['#FB4D4B', '#D60904', 'red'], ['#2CDDAF', '#168469', 'green'], ['#FC954F', '#D45A10', 'orange'], ['#9582D2', '#553BA9', 'purple']];
// [tileClr, shadowClr, colorName, colorSegments ( [i,'d'] - for tiles until i, their directions are 'd'; e.g. [[1,'TL'],[3,'BL']])]
let nTimes = 2; // number of times each color sequence appears
let nTiles = 5; // number of tiles in a color sequence
let nTurns = 2; // number of turns in a sequence; nTurns <= (nTiles-2)
let nHistory = 7; // history shown
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
// let dHistoryAlpha = 0;
let dNextTileAlpha;
let rateHistoryAlpha = (historyAlpha - 0) / (nHistory);
let sinceClrStarted = 1; // to detect when to highlight
let currentTile = 0;
let nextTileDelayTime = 20;
let delayed = 0;
let disappearingTiles = []; // {tile (tile's counter -  from the last history shown to cur-1), alpha]
let disappearThreshold = 0.05;
let disappearingSpeed = 0.0015; // in terms of globalAlpha
let collapseThreshold = 0.1;
let collapsingSpeed = disappearingSpeed / 10; // in terms of globalAlpha

// interaction
let transitionProgressY = 0; // tbe amount of transition already happened on the y-axis
let proceed = false;
let transitionSpeed;
let mistake = false;
let moves = ['start']; // no move needed for the first tile

// feedback
let lives = [];
let lifeMax = 3; // Must update the number of img (.life) in html when changing this variable
let lifeLeft = lifeMax;
let heartW, heartH, heartInterval;
//let end;
let currentCollapsingThreshold = 500;
let currentCollapsing = currentCollapsingThreshold * 0.95;



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
    ctx.imageSmoothingEnabled = false;
    // message = document.querySelector("#myMessage");
    // message.innerHTML = "Welcome to Rainbow Run! Click on where the next tile appears to run through the maze.";
    w = window.innerWidth;
    h = window.innerHeight;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    dNextTileAlpha = nextTileAlpha / 50;

    shuffle(colors);

    lives.push(document.querySelector("#life1"));
    lives.push(document.querySelector("#life2"));
    lives.push(document.querySelector("#life3"));

}

function startGame() {
    // set up variables
    tileWidth = w / (nHistory + 1);
    console.log(tileWidth);
    tileLength = tileWidth / 1.5;
    tileHeight = tileLength / 5;
    transitionSpeed = tileWidth / 40;
    xDistance = tileWidth / 2 + tileHeight * 1.5; // distance from the last tile on x-axis
    yDistance = tileHeight + tileLength / 2; // distance from the last tile on y-axis

    // feedback
    // lifeImg.width = 56;
    // lifeImg.height = 48;
    // heartW = lifeImg.width;
    // heartH = lifeImg.height;
    // heartInterval = heartW/2;

    // map
    generateMap();
}


function mainLoop() {
    //clear area
    //ctx.clearRect(0,0,w,h);
    if (proceed === true) { // transitioning
        //playerOnTile(map[currentTile+1]);
        if (transitionProgressY <= yDistance) {
            ctx.clearRect(0 - xDistance, 0 - yDistance, w + xDistance * 2, h + yDistance * 2);
            drawGrid();
            //displayLife();
            transitionProgressY += transitionSpeed;
            proceedTransition(getOppositeDirection(map[currentTile].relativePositionToLast));
            //playerOnTile(map[currentTile+1]);
        }
        else { // just finished transition
            // no clearRect here, otherwise the end of the transition will be jerky
            proceed = false;
            delayed = 0;
            curNextTileAlpha = 0;
            disappearingTiles.push({ tile: currentTile - 1, alpha: historyAlpha });
            //if (map[currentTile].tileClr !== '#B1BCCA') sinceClrStarted++;
            ctx.restore(); // 0,0
            // currentTile++;
        }
    }
    else {
        ctx.restore(); // 0,0
        ctx.clearRect(0, 0, w, h);
        drawGrid();
        displayLife();

        transitionProgressY = 0;
        dCurrentTileAlpha = 0;
        // dHistoryAlpha = 0;
        //dNextTileAlpha=0;
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        ctx.save(); // 0,0

        if ((currentTile > nTiles - 1) && (disappearingTiles.length === 0) && (!endOfMaze)) {
            currentCollapsing++;
            if (currentCollapsing >= currentCollapsingThreshold) {
                mistake = true;
                lifeLeft--;
                currentCollapsing = 0;
            }
        }

        centerTile(currentTile);
        playerOnTile(map[currentTile]);
        ctx.restore(); // 0,0
    }

    requestAnimationFrame(mainLoop);
}


function drawGrid() {

    let nTileOnEachSide = Math.floor(Math.max(w,h)/tileWidth/2)+1;
    ctx.save();
    for (let wid = w/2 - xDistance*2*nTileOnEachSide; wid < w/2 + xDistance*2*nTileOnEachSide; wid += xDistance *2) {
        for (let hei = h/2 - yDistance*2*nTileOnEachSide; hei < h/2 + yDistance*2*nTileOnEachSide; hei += yDistance*2) {
            ctx.strokeStyle = strokeClr;
            ctx.beginPath();
            ctx.moveTo(wid - tileWidth / 2, hei);
            ctx.lineTo(wid, hei - tileLength / 2);
            ctx.lineTo(wid + tileWidth / 2, hei);
            ctx.stroke();

            // tile left
            ctx.beginPath();
            ctx.moveTo(wid - tileWidth / 2, hei);
            ctx.lineTo(wid - tileWidth / 2, hei + tileHeight);
            ctx.lineTo(wid, hei + tileLength / 2 + tileHeight);
            ctx.lineTo(wid, hei + tileLength / 2);
            ctx.closePath();
            ctx.stroke();

            // tile right
            ctx.beginPath();
            ctx.moveTo(wid, hei + tileLength / 2);
            ctx.lineTo(wid, hei + tileHeight + tileLength / 2);
            ctx.lineTo(wid + tileWidth / 2, hei + tileHeight);
            ctx.lineTo(wid + tileWidth / 2, hei);
            ctx.closePath();
            ctx.stroke();
        }
    }
    for (let wid = (w/2-xDistance) - xDistance*2*nTileOnEachSide; wid < (w/2-xDistance) + xDistance*2*nTileOnEachSide; wid += xDistance *2) {
        for (let hei = (h/2-yDistance) - yDistance*2*nTileOnEachSide; hei < (h/2-yDistance) + yDistance*2*nTileOnEachSide; hei += yDistance*2) {
            ctx.strokeStyle = strokeClr;
            ctx.beginPath();
            ctx.moveTo(wid - tileWidth / 2, hei);
            ctx.lineTo(wid, hei - tileLength / 2);
            ctx.lineTo(wid + tileWidth / 2, hei);
            ctx.stroke();

            // tile left
            ctx.beginPath();
            ctx.moveTo(wid - tileWidth / 2, hei);
            ctx.lineTo(wid - tileWidth / 2, hei + tileHeight);
            ctx.lineTo(wid, hei + tileLength / 2 + tileHeight);
            ctx.lineTo(wid, hei + tileLength / 2);
            ctx.closePath();
            ctx.stroke();

            // tile right
            ctx.beginPath();
            ctx.moveTo(wid, hei + tileLength / 2);
            ctx.lineTo(wid, hei + tileHeight + tileLength / 2);
            ctx.lineTo(wid + tileWidth / 2, hei + tileHeight);
            ctx.lineTo(wid + tileWidth / 2, hei);
            ctx.closePath();
            ctx.stroke();
        }
    }
    ctx.restore();
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