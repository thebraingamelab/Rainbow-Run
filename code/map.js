let order =[];

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
        if (curClr === lastClr) order.push('grey'); // if a color is repeating itself immediately after the last occurance, add a random grey sequence
        order.push(curClr);
        lastClr = curClr;
    }
}


function colorShape() {
    for (nC = 0; nC < nColors; nC++) {
        let colorSegments = divideSegments(nTiles,nTurns);

        // ensure each color has a unique segments-direction combination
        // *** STANDARD ***
        //
        //
        //

        let repeated = false;
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
        else nC--;
    }
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

            let tileCounter = 0;
            for (let s = 0; s < clrSegments.length; s++) {
                for (; tileCounter <= clrSegments[s][0]; tileCounter++) map.push(new Tile(tileClr, shadowClr, clrSegments[s][1]));
            }
        }
    }
}

function addGreySequence() {
    let nGreyTiles = nTiles;
    let nGreyTurns;
    let control = true;
    do {
        //nGreyTiles = Math.floor(Math.random() * 4) + 3; //[3,6]
        nGreyTurns = Math.max(Math.floor(Math.random() * nGreyTiles) - 1, 0); //[0, nGreyTiles-2]
        //if ((nGreyTiles === nTiles) && (nGreyTurns === nTurns)) control = false;
    }
    while (!control);

    let tileClr = '#B1BCCA';
    let shadowClr = '#66738E';
    let greySegments = divideSegments(nGreyTiles, nGreyTurns);

    let tileCounter = 0;
    for (let s = 0; s < greySegments.length; s++) {
        for (; tileCounter <= greySegments[s][0]; tileCounter++) map.push(new Tile(tileClr, shadowClr, greySegments[s][1]));
    }
}


