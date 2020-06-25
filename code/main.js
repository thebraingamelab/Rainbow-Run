// general / html-related
// let message;
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let canvas, ctx, w, h; // canvas 
let strokeClr = 'rgba(35,44,58,0.2)';

// map (variables should vary for different levels in the final version)
let nColors = 2; // number of colors >=2; <nColorsUpperLimit
let colors = [['#5ECBF2', '#1D9DD2', 'blue'], ['#FEDE68', '#E9B926', 'yellow'], ['#FB4D4B', '#D60904', 'red'], ['#2CDDAF', '#168469', 'green'], ['#FC954F', '#D45A10', 'orange'], ['#9582D2', '#553BA9', 'purple']];
// [tileClr, shadowClr, colorName, colorSegments ( [i,'d'] - for tiles until i, their directions are 'd'; e.g. [[1,'TL'],[3,'BL']])]
let nTimes = 3; // number of times each color sequence appears
let nTiles = 5; // number of tiles in a color sequence
let nTurns = 2; // number of turns in a sequence; nTurns <= (nTiles-2)
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
let nextTileDelayTime = 20;
let delayed = 0;
let disappearingTiles = []; // {tile (tile's counter -  from the last history shown to cur-1), alpha]
let alphaThreshold = 0.3;
let disappearingSpeed = 0.003; // in terms of globalAlpha
// let collapseThreshold = 0.1;
let collapseDefault;
let justCollapsed = 0;
let collapsingInterval = 1300; // in ms
let collapsingSpeed = disappearingSpeed * 3;


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
let lifeImgWidth;
let heartW, heartH, heartInterval;
//let end;
let currentCollapsingThreshold = 500;
let currentCollapsing = currentCollapsingThreshold * 0.95;


// mode
let mode = 'CLEAN';
let arrowImgWidth;
let arrows = [];

window.onload = function () {
    // if (nColorsUpperLimit < nColors) alert("nColors exceeds its limit!");
    // if (nTurns > nTiles-2) alert("nTurns exceeds its limit!");
    init();
    startGame();
    window.addEventListener("keydown", restart);
    canvas.addEventListener("click", updatePlayerPosition);
    window.addEventListener('resize', init, false);
    collapseDefault = setInterval(collapse, collapsingInterval);
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
}

function startGame() {
    shuffle(colors);

    // set mode
    mode = 'ARROW';

    // set up variables
    tileWidth = Math.max(w, h) / (nHistory + 1);
    console.log(tileWidth);
    tileLength = tileWidth / 1.5;
    tileHeight = tileLength / 5;
    transitionSpeed = tileWidth / 40;
    xDistance = tileWidth / 2 + tileHeight * 1.5; // distance from the last tile on x-axis
    yDistance = tileHeight + tileLength / 2; // distance from the last tile on y-axis

    //life
    let lifeImgs = document.getElementsByClassName("life");
    lifeImgWidth = Math.min(w, h) / 12;
    for (let i = 0; i < lifeImgs.length; i++) {
        lifeImgs[i].width = lifeImgWidth;
        lives.push(lifeImgs[i]);
    }

    //arrow
    if (mode === 'ARROW') {
        let arrowImgs = document.getElementsByClassName("arrow");
        arrowImgWidth = tileWidth / 1.5;
        for (let i = 0; i < arrowImgs.length; i++) {
            arrowImgs[i].width = arrowImgWidth;
            arrowImgs[i].addEventListener('click', updatePlayerPosition);
            arrows.push(arrowImgs[i]);
        }
    }

    // map
    generateMap();
}


function mainLoop() {
    //clear area
    //ctx.clearRect(0,0,w,h);

    if (lifeLeft === 0) restart();
    if (proceed === true) { // transitioning
        //playerOnTile(map[currentTile+1]);
        if (transitionProgressY <= yDistance) {
            ctx.clearRect(0 - xDistance, 0 - yDistance, w + xDistance * 2, h + yDistance * 2);
            modeFeature(mode);
            transitionProgressY += transitionSpeed;
            proceedTransition(getOppositeDirection(map[currentTile].relativePositionToLast));
        }
        // note: this else block will NOT execute if the player moves before the transition completes
        else { // just finished transition
            // no clearRect here, otherwise the end of the transition will be jerky
            transitionProgressY = 0;
            proceed = false;
            delayed = 0;
            curNextTileAlpha = 0;
            disappearingTiles.push({ tile: currentTile - 1, alpha: historyAlpha });
            ctx.restore(); // 0,0
        }
    }
    else {
        ctx.restore(); // 0,0
        ctx.clearRect(0, 0, w, h);
        modeFeature(mode);

        displayLife();

        dCurrentTileAlpha = 0;
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        ctx.save(); // 0,0

        centerTile(currentTile);
        playerOnTile(map[currentTile]);
        ctx.restore(); // 0,0
    }

    requestAnimationFrame(mainLoop);
}

function modeFeature(mode) {
    switch (mode) {
        case 'GRID':
            drawGrid();
            break;
        case 'ARROW':
            drawArrows();
            break;
        case 'CLEAN':
            break;
    }
}