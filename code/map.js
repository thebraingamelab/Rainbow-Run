
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