let order = [];

function generateMap() {
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
    // for (let tp = 0; tp < turningPoints.length; tp++) {
    //     console.log(colors[nC][2] + " segment turning point:" + turningPoints[tp]);
    // }


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
    for (let i = 0; i < order.length; i++) {
        let curClr = order[i];
        if (curClr === 'grey') addGreySequence();
        else {
            let tileClr = colors[curClr][0];
            let shadowClr = colors[curClr][1];
            let clrSegments = colors[curClr][3];

            if (i !== 0) {
                let curDirection = clrSegments[0][1];
                let oppDirection = getOppositeDirection(curDirection);
                if ((curDirection === map[map.length - 1].relativePositionToLast) || (oppDirection === map[map.length - 1].relativePositionToLast)) {
                    let greyDirection;
                    do {
                        greyDirection = directions[Math.floor(Math.random() * directions.length)]
                    } while ((curDirection === greyDirection) || (oppDirection === greyDirection));
                    map.push(new Tile(greyTileClr, greyShadowClr, greyDirection));
                }
            }

            let tileCounter = 0;
            if (i > 0) {
                // first tile has a random direction
                let clrDirection;
                do {
                    clrDirection = directions[Math.floor(Math.random() * directions.length)]
                }  // not going reverse: not opposite to either the last tile or the next tile
                while ((getOppositeDirection(clrDirection) === map[map.length - 1].relativePositionToLast) || (getOppositeDirection(clrDirection) === clrSegments[0][1]));
                map.push(new Tile(tileClr, shadowClr, clrDirection));
                tileCounter++;
            }
            for (let s = 0; s < clrSegments.length; s++) {
                for (; tileCounter <= clrSegments[s][0]; tileCounter++) map.push(new Tile(tileClr, shadowClr, clrSegments[s][1]));
            }
        }
    }
    for (let i = 0; i < map.length; i++) {
        console.log(map[i]);
    }
}

function addGreySequence() {
    let nGreyTiles = nTiles;

    let tileClr = greyTileClr;
    let shadowClr = greyShadowClr;

    let tileCounter = 0;
    for (; tileCounter < nGreyTiles; tileCounter++) {
        lastDirection = map[map.length - 1].relativePositionToLast;
        let greyDirection;
        do {
            greyDirection = directions[Math.floor(Math.random() * directions.length)]
        }  // not going reverse: not opposite to either the last tile or the next tile
        while (getOppositeDirection(greyDirection) === lastDirection);
        map.push(new Tile(tileClr, shadowClr, greyDirection));
    }
}
