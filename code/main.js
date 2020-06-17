// general / html-related
// let message;
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
let canvas, ctx, w, h; // canvas 

// map (variables should vary for different levels in the final version)
let nColors = 6; // number of colors
let colors = [['#5ECBF2','#1D9DD2','blue'],['#FEDE68','#E9B926','yellow'],['#FB4D4B','#D60904','red'],['#2CDDAF','#168469','green'],['#FC954F','#D45A10','orange'],['#9582D2','#553BA9', 'purple']]; // [tileClr, shadowClr, colorName]
let nTiles = 5; // number of tiles in a color sequence
let nTurns = 2; // number of turns in a sequence; nTurns <= (nTiles-2)
let nHistory=6; // history shown
let map = [];
let directions = ['TL', 'TR', 'BL', 'BR']; // TopLeft, TopRight, BottomLeft, BottomRight
let endOfMaze = false;

// tile
let tileWidth, tileLength, tileHeight; // tile 
let xDistance, yDistance; // distance between tiles
let currentTileAlpha=1;
let nextTileAlpha=0.8;
let historyAlpha=0.5;
let dCurrentTileAlpha = 0; // amount reduced
let dNextTileAlpha = 0; // amount increased
let dHistoryAlpha = 0;
let rateHistoryAlpha = (historyAlpha-0)/(nHistory);

// interaction
let correctMove = false;
let transitionSpeed;


window.onload = function(){
    init();
    window.addEventListener("keydown", restart);
    canvas.addEventListener("click", updatePlayerPosition);
    window.addEventListener('resize', init, false);
    startGame();
    mainLoop();
} 

function init(){
    canvas = document.querySelector("#myCanvas");
    ctx=canvas.getContext("2d");
    // message = document.querySelector("#myMessage");
    // message.innerHTML = "Welcome to Rainbow Run! Click on where the next tile appears to run through the maze.";
    w = window.innerWidth -5;
    h = window.innerHeight -5;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
}

function startGame(){
    // set up variables
    tileWidth = w/6; 
    console.log(tileWidth);
    tileLength = tileWidth/1.5;
    tileHeight = tileLength/5;
    transitionSpeed = tileWidth / 40;
    xDistance = tileWidth/2 + tileHeight*1.5; // distance from the last tile on x-axis
    yDistance = tileHeight + tileLength/2; // distance from the last tile on y-axis
    // map
    generateMap();
}


let currentTile = 0;
let transitionProgressY = 0; // tbe amount of transition already happened on the y-axis

function mainLoop(){
//clear area
    //ctx.clearRect(0,0,w,h);

    if (correctMove===true){ // transitioning
        //playerOnTile(map[currentTile+1]);
        if (transitionProgressY <= yDistance){
            ctx.clearRect(0,0,w,h);
            proceedTransition(getOppositeDirection(map[currentTile].relativePositionToLast));
            //playerOnTile(map[currentTile+1]);
            transitionProgressY+=transitionSpeed;
        }
        else{ // finished transition
            // no clearRect here, otherwise the end of the transition will be jerky
            correctMove = false;
            ctx.restore(); // 0,0
            // currentTile++;
        }
    }
    else {
        ctx.clearRect(0,0,w,h);

        transitionProgressY=0;
        dCurrentTileAlpha = 0;
        dNextTileAlpha = 0;
        dHistoryAlpha = 0;
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        centerTile(currentTile);
        playerOnTile(map[currentTile]);
        ctx.restore(); // 0,0
    }

    requestAnimationFrame(mainLoop);
}

