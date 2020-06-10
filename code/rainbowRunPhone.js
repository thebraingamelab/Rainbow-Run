//editor.autoIndent

let canvas, ctx, w, h; // canvas 
let tileWidth, tileLength, tileHeight; // tile 
let message = "";

// map (variables should vary for different levels in the final version)
let nColors = 3; // number of colors
let colors = [['#6CFFF4','#22B3AD','blue'],['#FFF680','#D7D040','yellow'],['#F98C8C','#E20242','red'],['#CCFF40','#8BC800','green'],['#FCBC68','#DE8800','orange']]; // [tileClr, shadowClr]; blue, yellow, red, green, orange
let nTiles = 4; // number of tiles in a color sequence
let nTurns = 1; // number of turns in a sequence; nTurns <= (nTiles-2)
let nHistory=5; // history shown

let map = [];
let directions = ['TL', 'TR', 'BL', 'BR']; // TopLeft, TopRight, BottomLeft, BottomRight
let endOfMaze = false;

let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


window.onload = function init(){
    canvas = document.querySelector("#myCanvas");
    w=canvas.clientWidth;
    h=canvas.clientHeight;
    ctx=canvas.getContext("2d");
    startGame();
    canvas.addEventListener("touchend", updatePlayerPosition);
    mainLoop();
}

function updatePlayerPosition(evt){
    let playerMove = getInteractionArea(evt);
    if(currentTile === map.length-1){ // if reaching the end
        generateMap();
        currentTile = 0;
        message = "";
    }
    else if (playerMove === map[currentTile+1].relativePositionToLast){
        ctx.fillStyle = "black";
        message = "Nice move!";
        currentTile++;
        if (currentTile === map.length-1){
            ctx.fillStyle = "black";
            message = "You've reached the end!";
        }
    }
    else{ // the player tapped a wrong direction
        ctx.fillStyle = "red";
        message = "Wrong direction! Try again.";
    }
}

function getInteractionArea(evt){
    let rect = canvas.getBoundingClientRect();
    let mousePosX = evt.clientX - rect.left;
    let mousePosY = evt.clientY - rect.top;
    if ((mousePosX < w/2-tileHeight) && (mousePosY < h/2-tileHeight)) return 'TL';
    else if ((mousePosX < w/2-tileHeight) && (mousePosY > h/2+tileHeight)) return 'BL';
    else if ((mousePosX > w/2+tileHeight) && (mousePosY < h/2-tileHeight)) return 'TR';
    else if ((mousePosX > w/2+tileHeight) && (mousePosY > h/2+tileHeight)) return 'BR';
}

function startGame(){
    // set up variables
    tileWidth = w/5; 
    tileLength = tileWidth/1.5;
    tileHeight = tileLength/5;
    // map
    generateMap();
}


let currentTile = 0;
function mainLoop(){
    ctx.clearRect(0,0,w,h);
    // display message
    ctx.font = '14px overpass';
    ctx.fillText(message, tileHeight*5, tileHeight*5);
    centerTile(currentTile);
    requestAnimationFrame(mainLoop);
}


function centerTile(currentTile){
// let currentTile = Math.floor(Math.random()*(map.length-1));
// console.log("currentTile i:" + currentTile);
    ctx.save();
    map[currentTile].currentDisplay();
    ctx.save();
    if (currentTile === map.length-1){
        // reaching end: square turning red
        ctx.fillStyle='red';
        ctx.fillRect(-6,-6,12,12);
    }
    else map[currentTile+1].nextDisplay();
    //for (let j = currentTile+1; j<map.length; j++) map[j].nextDisplay(); //test every remaining tiles
    ctx.restore();
    for (let i=currentTile-1; (i>=0) && (i>=currentTile-nHistory); i--){
        map[i].pastDisplay(map[i+1].relativePositionToLast);
    }
    ctx.restore();
}

function generateMap(){
    // build the map array
    map = [];
    for (let nC=0; nC<nColors; nC++){
        let tileClr = colors[nC][0];
        let shadowClr = colors[nC][1];
        for (let nTi=0; nTi<nTiles; nTi++){
            map.push(new Tile(tileClr, shadowClr));
        }
    }

    // build the shapes
    for (nC=0; nC<nColors; nC++){
        // divide segments of turns
        let segments = [];
        for (let nTu=0; nTu<nTurns; nTu++){
            let repeatedSegment = false;
            let curSegment = Math.floor(Math.random()*(nTiles-2))+1; // the sth tile is the turning point; no turning if the first or the last tile is the turning point.
            for(let i=0; i<segments.length; i++){
                if (curSegment === segments[i]){
                    repeatedSegment =true;
                    break;
                }
            }
            if (!repeatedSegment) segments.push(curSegment);
            else nTu--;
        }
        segments.sort(function(a, b) {
            return a - b;
        });
        
        for (let seg=0; seg<segments.length; seg++){
            console.log(colors[nC][2] + " segment turning point:" + segments[seg]);
        }

        // assign the position to every tile in every sequence
        nT=0;
        for (let s=0; s<segments.length; s++){
            let segmentDirection = pickDirection();
            console.log((s+1) +"th segment direction:" + segmentDirection);
            for(; nT<=segments[s]; nT++){ // segments[s]: start turning from s
                map[nC*nTiles+nT].relativePositionToLast = segmentDirection;
            }
        }
        // finish off the last segment in the color sequence
        let segmentDirection = pickDirection();
        console.log("remaining segment direction:" + segmentDirection);
        for(; nT<nTiles; nT++){
            map[nC*nTiles+nT].relativePositionToLast = segmentDirection;
        }
    }
}

let lastDirection =''; // useful when determinsing next turn direction
function pickDirection(){
    let curDirection = directions[Math.floor(Math.random()*directions.length)];
    let oppDirection = getOppositeDirection(curDirection);
    while ((curDirection === lastDirection) || (oppDirection === lastDirection)){
        curDirection = directions[Math.floor(Math.random()*directions.length)];
        oppDirection = getOppositeDirection(curDirection);
    }
    lastDirection = curDirection;
    return curDirection;
}


class Tile{
    constructor(tileClr, shadowClr){
        this.x = 0; // x of the last tile
        this.y = 0; // y of the last tile
        this.relativePositionToLast; // relative position to the last tile
        //this.relativePositionToNext; // relative position to the next tile
        this.tileClr = tileClr;
        this.shadowClr = shadowClr;
    }

    currentDisplay(){ // when the tile is where the player currently is, position it in the middle
        ctx.globalAlpha = 1;
        ctx.translate(w/2, h/2);
        this.display();
        // square representing the player
        ctx.fillStyle='black';
        ctx.fillRect(-6,-6,12,12);
    }

    pastDisplay(relativePositionToLastOfLastTile){ // when the tile is shown as hitory
        ctx.globalAlpha = 0.15;
        let relativePositionToNext = getOppositeDirection(relativePositionToLastOfLastTile);
        let xDistance = tileWidth/2 + tileHeight*1.5; // distance from the last tile on x-axis
        let yDistance = tileHeight + tileLength/2; // distance from the last tile on y-axis
        switch(relativePositionToNext){
            case 'TL':
                ctx.translate(-xDistance, -yDistance);
                break;
            case 'TR':
                ctx.translate(xDistance, -yDistance);
                break;
            case 'BL':
                ctx.translate(-xDistance, yDistance);
                break;  
            case 'BR':
                ctx.translate(xDistance, yDistance);
                break;   
        }
        this.display();
    }

    nextDisplay(){ // when this is the next tile
        ctx.globalAlpha = 0.4;

        let xDistance = tileWidth/2 + tileHeight*1.5; // distance from the last tile on x-axis
        let yDistance = tileHeight + tileLength/2; // distance from the last tile on y-axis
        switch(this.relativePositionToLast){
            case 'TL':
                ctx.translate(-xDistance, -yDistance);
                break;
            case 'TR':
                ctx.translate(xDistance, -yDistance);
                break;
            case 'BL':
                ctx.translate(-xDistance, yDistance);
                break;  
            case 'BR':
                ctx.translate(xDistance, yDistance);
                break;   
        }
        this.display();
    }

    display(){ // the unpositioned tile outline
        ctx.save();
        
        // tile top
        ctx.fillStyle=this.tileClr;
        ctx.beginPath();
        ctx.moveTo(this.x-tileWidth/2, this.y);
        ctx.lineTo(this.x, this.y-tileLength/2);
        ctx.lineTo(this.x+tileWidth/2, this.y);
        ctx.lineTo(this.x, this.y+tileLength/2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle=this.shadowClr;
        // tile left
        ctx.beginPath();
        ctx.moveTo(this.x-tileWidth/2, this.y);
        ctx.lineTo(this.x-tileWidth/2, this.y+tileHeight);
        ctx.lineTo(this.x, this.y+tileLength/2+tileHeight);
        ctx.lineTo(this.x, this.y+tileLength/2);
        ctx.closePath();
        ctx.fill();
        // tile right
        ctx.beginPath();
        ctx.moveTo(this.x, this.y+tileLength/2);
        ctx.lineTo(this.x, this.y+tileHeight+tileLength/2);
        ctx.lineTo(this.x+tileWidth/2, this.y+tileHeight);
        ctx.lineTo(this.x+tileWidth/2, this.y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

function getOppositeDirection(relativePositionToLast){
    switch(relativePositionToLast){
        case 'TL':
            return 'BR';
            break;
        case 'TR':
            return 'BL';
            break;
        case 'BL':
            return 'TR';
            break;  
        case 'BR':
            return 'TL';
            break;   
    }
}