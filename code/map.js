let order = [];

function generateMap() {
    map = [];
    colorOrder();
    colorShape();
    buildMap();
}

function colorOrder() {
    // a color doesn't repeat itself right after its last occurance
    // randomly ordered, i.e. blue, yellow, red, blue, red, yellow
    // may add a level where the repetition distance is fixed for each color, i.e., blue, red, yellow, blue, red, yellow

    let randomOrder = [];
    for (let i = 0; i < nColors; i++) {
        for (let j = 0; j < nTimes; j++) randomOrder.push(i); // the color's counter in the colors[] array
    }
    shuffle(randomOrder);
    let lastClr = false;
    for (let k = 0; k < randomOrder.length; k++) {
        let curClr = randomOrder[k];
        if (curClr === lastClr) order.push('grey'); //|| ((k>0) && (Math.floor(Math.random() * 4) === 0)); need to ensure a similar amount of grey tiles each round
        order.push(curClr);
        lastClr = curClr;
    }
}


function colorShape() {
    for (nC = 0; nC < nColors; nC++) {
        // shape
        let colorSegments = divideSegments(nTiles, nTurns);

        // ensure each color sequence is unique
        repeated = false;
        for (let i = 0; i < nC; i++) {
            let comparedColorSegments = colors[i][3];
            if (colorSegments.compare(comparedColorSegments)) {
                repeated = true;
                break;
            }
        }
        if (!repeated) {
            colors[nC].push(colorSegments); // e.g. [[1,'TL'],[3,'BL']]
        }
        else {
            nC--;
            continue;
        }

        // assign chord
        // colors[nC].push(randomChord());
    }
    // for (nC = 0; nC < nColors; nC++) {
    //     console.log(colors[nC][2] + ": ");
    //     for (let i=0; i<colors[nC][4].length; i++) console.log(colors[nC][4][i]);
    // }
}

function divideSegments(nOfTiles, nOfTurns) {
    let segments = [];

    // turning points
    let turningPoints = [];
    for (let nTu = 0; nTu < nOfTurns; nTu++) {
        let curTurningPoint = Math.floor(Math.random() * (nOfTiles - 2)) + 1; // [1,nTiles-2] the sth tile is the turning point; no turning if the first or the last tile is the turning point.
        // no repeated turning points
        let repeated = false;
        for (let i = 0; i < turningPoints.length; i++) {
            if (curTurningPoint === turningPoints[i]) {
                repeated = true;
                break;
            }
        }
        if (!repeated) turningPoints.push(curTurningPoint);
        else nTu--;
    }
    turningPoints.sort(function (a, b) {
        return a - b;
    });
    


    // pick directions for each turning point (the direction to turn to after that point)
    for (let tp = 0; tp < turningPoints.length; tp++) {
        let segmentDirection = pickDirection();
        segments.push([turningPoints[tp], segmentDirection]);
    }
    segments.push([nOfTiles - 1, pickDirection()]);

    return segments;
}


let lastDirection = ''; // useful when determinsing next turn direction
function pickDirection() {
    let curDirection = directions[Math.floor(Math.random() * directions.length)];
    let oppDirection = getOppositeDirection(curDirection);
    while ((curDirection === lastDirection) || (oppDirection === lastDirection)) {
        curDirection = directions[Math.floor(Math.random() * directions.length)];
        oppDirection = getOppositeDirection(curDirection);
    }
    lastDirection = curDirection;
    return curDirection;
}

function buildMap() {
    shownTiles = [];
    offsets = { x: 0, y: 0 };
    shownTiles.push(offsets);

    for (let i = 0; i < order.length; i++) {
        let curClr = order[i];
        console.log(curClr);
        if (curClr === 'grey') addGreySequence();
        else {
            let tileClr = colors[curClr][0];
            let shadowClr = colors[curClr][1];
            let clrSegments = colors[curClr][3];

            // add grey tile to prevent reverse direction of clrSegments[0][1]
            if ((i !== 0) && (getOppositeDirection(clrSegments[0][1]) === map[map.length - 1].relativePositionToLast)) {
                let greyDirection;
                do {
                    greyDirection = directions[Math.floor(Math.random() * directions.length)];
                }
                // while (greyDirection === getOppositeDirection(clrSegments[0][1]) === map[map.length - 1].relativePositionToLast || greyDirection === getOppositeDirection(map[map.length - 1].relativePositionToLast) || (mapOverlap(getOffsets(greyDirection))));
                while (greyDirection === getOppositeDirection(clrSegments[0][1]) === map[map.length - 1].relativePositionToLast || (mapOverlap(getOffsets(greyDirection))));

                map.push(new Tile(greyTileClr, greyShadowClr, greyDirection));
                offsets = getOffsets(greyDirection);
                shownTiles.push(offsets);
            }

            // first tile direction -> ensures that the entire sequence doesn't overlap
            let tileCounter = 0;
            if (i > 0) {
                let clrDirection = checkSequenceOverlap(clrSegments);
                while (clrDirection === true) {
                    addGreyTile();
                    clrDirection = checkSequenceOverlap(clrSegments);
                }
                directions = ['TL', 'TR', 'BL', 'BR'];
                map.push(new Tile(tileClr, shadowClr, clrDirection));
                offsets = getOffsets(clrDirection);
                shownTiles.push(offsets);

                tileCounter++;
            }

            // color shape
            for (let s = 0; s < clrSegments.length; s++) {
                for (; tileCounter <= clrSegments[s][0]; tileCounter++) {
                    map.push(new Tile(tileClr, shadowClr, clrSegments[s][1]));
                    if (tileCounter !== 0) {
                        offsets = getOffsets(clrSegments[s][1]);
                        shownTiles.push(offsets);
                    }
                }
            }
        }
    }
    // for (let i = 0; i < map.length; i++) {
    //     console.log(map[i]);
    // }
}

// return true if overlap; return the direction if not
function checkSequenceOverlap(clrSegments) {
    let storedOffsets = { x: 0, y: 0 };
    storedOffsets.x = offsets.x;
    storedOffsets.y = offsets.y;

    // first tile in the sequence: random direction
    let clrDirection = pickFirstDirection(clrSegments);
    if (clrDirection === true) {
        offsets = storedOffsets;
        directions = ['TL', 'TR', 'BL', 'BR'];
        return true;
    }
    offsets = getOffsets(clrDirection);

    // the following tiles: check overlap
    let t = 1;
    for (let s = 0; s < clrSegments.length; s++) {
        for (; t <= clrSegments[s][0]; t++) {
            // if any tile of the sequence is overlapped, start over from the first tile in the sequence
            if (mapOverlap(getOffsets(clrSegments[s][1]))) {
                offsets = storedOffsets;
                // pick another direction for the first tile
                clrDirection = pickFirstDirection(clrSegments);
                if (clrDirection === true) {
                    offsets = storedOffsets;
                    directions = ['TL', 'TR', 'BL', 'BR'];
                    return true;
                }
                offsets = getOffsets(clrDirection);
                // start over the loop for checking the following tiles
                s = 0;
                t = 0;
            }

            else offsets = getOffsets(clrSegments[s][1]);
        }
    }

    // if no tile in the sequence overlaps, the direction of the first tile is perfect
    offsets = storedOffsets;
    return clrDirection;
}

// return true if no direction is left and still overlap, otherwise, return the direction picked
function pickFirstDirection(clrSegments) {
    let clrDirection;
    do {
        if (directions.length === 0) return true;
        shuffle(directions);
        clrDirection = directions[0];
        directions.splice(0, 1);
    }  // not going reverse: not opposite to either the last tile or the next tile
    while ((getOppositeDirection(clrDirection) === clrSegments[0][1]) || (mapOverlap(getOffsets(clrDirection))));

    return clrDirection;
}

function addGreySequence() {
    let nGreyTiles = nTiles;

    let tileCounter = 0;
    for (; tileCounter < nGreyTiles; tileCounter++) {
        lastDirection = map[map.length - 1].relativePositionToLast;
        let greyDirection;
        do {
            if (directions.length === 0) {
                console.log("greysequence overlap not solvable");
                directions = ['TL', 'TR', 'BL', 'BR'];
                do {
                    shuffle(directions);
                    greyDirection = directions[0];
                    directions.splice(0, 1);
                }
                while (getOppositeDirection(greyDirection) === lastDirection);

                directions = ['TL', 'TR', 'BL', 'BR'];
                map.push(new Tile(greyTileClr, greyShadowClr, greyDirection));
                offsets = getOffsets(greyDirection);
                shownTiles.push(offsets);
                return;
            }
            shuffle(directions);
            greyDirection = directions[0];
            directions.splice(0, 1);
        }
        while (getOppositeDirection(greyDirection) === lastDirection || mapOverlap(getOffsets(greyDirection)));

        directions = ['TL', 'TR', 'BL', 'BR'];
        map.push(new Tile(greyTileClr, greyShadowClr, greyDirection));
        offsets = getOffsets(greyDirection);
        shownTiles.push(offsets);
    }
}

function addGreyTile() {
    let greyDirection;
    do {
        if (directions.length === 0) {
            console.log("greytile overlap not solvable");
            directions = ['TL', 'TR', 'BL', 'BR'];
            do {
                shuffle(directions);
                greyDirection = directions[0];
                directions.splice(0, 1);
            }
            while (getOppositeDirection(greyDirection) === lastDirection);

            directions = ['TL', 'TR', 'BL', 'BR'];
            map.push(new Tile(greyTileClr, greyShadowClr, greyDirection));
            offsets = getOffsets(greyDirection);
            shownTiles.push(offsets);
            return;

        }
        shuffle(directions);
        greyDirection = directions[0];
        directions.splice(0, 1);
    }
    // while (greyDirection === getOppositeDirection(clrSegments[0][1]) === map[map.length - 1].relativePositionToLast || greyDirection === getOppositeDirection(map[map.length - 1].relativePositionToLast) || (mapOverlap(getOffsets(greyDirection))));
    while (mapOverlap(getOffsets(greyDirection)));

    directions = ['TL', 'TR', 'BL', 'BR'];
    map.push(new Tile(greyTileClr, greyShadowClr, greyDirection));
    offsets = getOffsets(greyDirection);
    shownTiles.push(offsets);
}

function mapOverlap(curOffsets) {
    let threshold = 8; // or nTiles*2
    for (let i = map.length - 1; i >= Math.max(map.length - threshold, 0); i--) {
        if ((Math.abs(shownTiles[i].x - curOffsets.x) < xDistance / 2) && (Math.abs(shownTiles[i].y - curOffsets.y) < yDistance / 2)) {
            return true;
        }
    }
    return false;
}

// function randomUnrepeatedDirection() {
//     let d;
//     do {
//         if (directions.length === 0) {
//             addGreyTile();
//             directions = ['TL', 'TR', 'BL', 'BR'];
//         }
//         shuffle(directions);
//         d = directions[0];
//         directions.splice(0, 1);
//     }  // not going reverse: not opposite to either the last tile or the next tile
//     while (mapOverlap(getOffsets(d)));
//     // (getOppositeDirection(clrDirection) === clrSegments[0][1]) || 

//     directions = ['TL', 'TR', 'BL', 'BR'];
//     return d;
// }