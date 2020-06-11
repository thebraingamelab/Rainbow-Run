//editor.autoIndent

let canvas, ctx, w, h; // canvas 
let tileWidth, tileLength, tileHeight; // tile 

// map (variables should vary for different levels in the final version)
let nColors = 2; // number of colors
let colors = [['#6CFFF4','#22B3AD','blue'],['#FFF680','#D7D040','yellow'],['#F98C8C','#E20242','red'],['#CCFF40','#8BC800','green'],['#FCBC68','#DE8800','orange']]; // [tileClr, shadowClr]; blue, yellow, red, green, orange
let nTiles = 4; // number of tiles in a color sequence
let nTurns = 1; // number of turns in a sequence; nTurns <= (nTiles-2)
let nHistory=5; // history shown
let map = [];
let directions = ['TL', 'TR', 'BL', 'BR']; // TopLeft, TopRight, BottomLeft, BottomRight
let endOfMaze = false;

// tile
let xDistance, yDistance; // distance between tiles
let currentTileAlpha=1;
let nextTileAlpha=0.4;
let historyAlpha=0.15;
let dCurrentTileAlpha = 0; // amount reduced
let dNextTileAlpha = 0; // amount increased

// interaction
let correctMove = false;

let message;
let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


window.onload = function init(){
    canvas = document.querySelector("#myCanvas");
    message = document.querySelector("#myMessage");
    message.innerHTML = "Welcome to Rainbow Run! Click on where the next tile appears to run through the maze.";
    w=canvas.clientWidth;
    h=canvas.clientHeight;
    ctx=canvas.getContext("2d");
    startGame();
    window.addEventListener("keydown", restart);
    canvas.addEventListener("click", updatePlayerPosition);
    mainLoop();
}

function startGame(){
    // set up variables
    tileWidth = w/12; 
    tileLength = tileWidth/1.5;
    tileHeight = tileLength/5;
    xDistance = tileWidth/2 + tileHeight*1.5; // distance from the last tile on x-axis
    yDistance = tileHeight + tileLength/2; // distance from the last tile on y-axis
    // map
    generateMap();
}


let currentTile = 0;
let transitionProgressY = 0; // tbe amount of transition already happened on the y-axis

function mainLoop(){
//clear area
    ctx.clearRect(0,0,w,h);
    if (correctMove===true){ // transitioning
        //playerOnTile(map[currentTile+1]);
        if (transitionProgressY < yDistance){
            proceedTransition(getOppositeDirection(map[currentTile].relativePositionToLast));
            //playerOnTile(map[currentTile+1]);
            transitionProgressY+=2;
        }
        else{ // finished transition
            correctMove = false;
            transitionProgressY=0;
            dCurrentTileAlpha = 0;
            dNextTileAlpha = 0;
            ctx.restore(); // 0,0
            // currentTile++;
        }
    }
    else {
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        centerTile(currentTile);
        playerOnTile(map[currentTile]);
        ctx.restore(); // 0,0
    }

    requestAnimationFrame(mainLoop);
}

