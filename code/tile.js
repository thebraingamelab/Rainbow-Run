
class Tile {
    constructor(tileClr, shadowClr, relativePositionToLast) {
        this.x = 0;
        this.y = 0;
        this.collapseY = 0;
        this.collapsed = false;
        this.disappeared = false;
        //this.highlighted = false;
        //this.collapsedDuringHighlight = false;
        this.tileClr = tileClr;
        this.shadowClr = shadowClr;
        this.relativePositionToLast = relativePositionToLast; // relative position to the last tile
        //this.relativePositionToNext; // relative position to the next tile
    }

    currentDisplay() { // when the tile is where the player currently is, position it in the middle
        ctx.translate(w / 2, h / 2);
        this.display();
    }

    pastDisplay(relativePositionToLastOfLastTile) { // when the tile is shown as hitory
        let relativePositionToNext = getOppositeDirection(relativePositionToLastOfLastTile);
        switch (relativePositionToNext) {
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

    nextDisplay() { // when this is the next tile
        switch (this.relativePositionToLast) {
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

    display() { // the unpositioned tile outline
        ctx.save();

        // tile top
        ctx.fillStyle = this.tileClr;
        ctx.beginPath();
        ctx.moveTo(this.x - tileWidth / 2, this.y);
        ctx.lineTo(this.x, this.y - tileLength / 2);
        ctx.lineTo(this.x + tileWidth / 2, this.y);
        ctx.lineTo(this.x, this.y + tileLength / 2);
        ctx.closePath();

        ctx.fill();

        ctx.fillStyle = this.shadowClr;
        // tile left
        ctx.beginPath();
        ctx.moveTo(this.x - tileWidth / 2, this.y);
        ctx.lineTo(this.x - tileWidth / 2, this.y + tileHeight);
        ctx.lineTo(this.x, this.y + tileLength / 2 + tileHeight);
        ctx.lineTo(this.x, this.y + tileLength / 2);
        ctx.closePath();
        ctx.fill();
        // tile right
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + tileLength / 2);
        ctx.lineTo(this.x, this.y + tileHeight + tileLength / 2);
        ctx.lineTo(this.x + tileWidth / 2, this.y + tileHeight);
        ctx.lineTo(this.x + tileWidth / 2, this.y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

function getOppositeDirection(relativePositionToLast) {
    switch (relativePositionToLast) {
        case 'TL':
            return 'BR';
        case 'TR':
            return 'BL';
        case 'BL':
            return 'TR';
        case 'BR':
            return 'TL';
    }
}

let offsets;
let shownTiles = []; // {xOffset, yOffset}
function centerTile(cur) { // start position: last end position
    shownTiles = [];

    //current tile
    ctx.globalAlpha = currentTileAlpha - dCurrentTileAlpha;
    map[cur].currentDisplay();
    offsets = { x: 0, y: 0 };
    shownTiles.push(offsets);
    ctx.save(); // currentTile position
    ctx.save(); // currentTile position

    // history
    disappearHistory();
    ctx.restore();  // currentTile position
    // highlight
    let lastHighlight;
    //let lastHistory;
    // check if transition
    if (cur !== currentTile) {
        lastHighlight = cur - nTiles + 1;
        // lastHistory = cur - nHistory + 1;
    }
    else {
        lastHighlight = cur - nTiles;
        // lastHistory = cur - nHistory;
    }
    if (sinceClrStarted === nTiles) {
        highlight(cur, lastHighlight)
    }
    // else {
    //     for (let i = cur; (i > cur - nTiles) && (i >= 0); i--) {
    //         map[i].highlighted = false;
    //     }
    // }

    // next tile
    // delay time
    if (delayed === nextTileDelayTime) {
        curNextTileAlpha = Math.min(curNextTileAlpha + dNextTileAlpha, nextTileAlpha);
    }
    else {
        delayed++;
    }
    // mistake shake + next tile
    if (mistake) preShake();
    if (cur !== map.length - 1) {
        ctx.globalAlpha = curNextTileAlpha;
        map[cur + 1].nextDisplay();
    }
    if (mistake) postShake();

    ctx.restore(); // currentTile position

} // end position: currentTile position

// function showHistory(cur) {
//     for (let i = cur - 1; (i >= 0); i--) {
//         offsets = getOffsets(getOppositeDirection(map[i + 1].relativePositionToLast));
//         if (checkOverlap(cur) !== false) {
//             let originalAlpha = ctx.globalAlpha;
//             ctx.globalAlpha = 0;
//             map[i].pastDisplay(map[i + 1].relativePositionToLast);
//             ctx.globalAlpha = originalAlpha - rateHistoryAlpha;
//         }
//         else {
//             map[i].pastDisplay(map[i + 1].relativePositionToLast);
//             ctx.globalAlpha -= rateHistoryAlpha;
//         }
//         shownTiles.push(offsets);
//     }
// }

function disappearHistory() {
    for (let i = disappearingTiles.length - 1; i >= 0; i--) { // from cur to past

        let tileCounter = disappearingTiles[i].tile;
        disappearingTiles[i].alpha -= disappearingSpeed;


        // display if not overlapping
        offsets = getOffsets(getOppositeDirection(map[tileCounter + 1].relativePositionToLast));
        if (checkOverlap(tileCounter) !== false) {
            ctx.globalAlpha = 0;
            map[tileCounter].pastDisplay(map[tileCounter + 1].relativePositionToLast);
        }
        else {
            let tileAlpha = disappearingTiles[i].alpha;
            ctx.globalAlpha = Math.max(tileAlpha, 0);
            map[tileCounter].pastDisplay(map[tileCounter + 1].relativePositionToLast);

        }

        // collapse
        if (disappearingTiles[i].alpha <= collapseThreshold) {
            collapse(i, tileCounter);
        }

        if (map[tileCounter].y > h / 2) {
            map[tileCounter].disappeared = true;
            disappearingTiles.splice(i, 1);
            continue;
        }
        // // remove invisible tiles
        // if (map[tileCounter].y>h/2) {
        //     //disappearingTiles.splice(i, 1);
        //     map[tileCounter].y=0;
        //     //i++;
        // }
    }
}

// loop through collapsing[] and call this function
function collapse(i, tileCounter) { // drop down the tile
    map[tileCounter].collapsed = true;
    map[tileCounter].collapseY += 5;
    //if (map[tileCounter].highlighted) map[tileCounter].collapsedDuringHighlight = true;
    // else map[tileCounter].y = map[tileCounter].collapseY;
    map[tileCounter].y = map[tileCounter].collapseY;
    disappearingTiles[i].alpha -= collapsingSpeed;
}


function highlight(cur, lastHighlight) {
    ctx.save(); // currentTile position

    let j;
    // highlighted shape    
    for (j = cur - 1; (j >= 0) && (j > lastHighlight); j--) {
        if (map[j].collapsed) ctx.save();
        if (map[j].disappeared) ctx.globalAlpha = 0;
        else {
            ctx.globalAlpha = 1;
        }
        //map[j].highlighted = true;
        map[j].pastDisplay(map[j + 1].relativePositionToLast);

        if (map[j].collapsed) {
            ctx.restore();
            ctx.globalAlpha = 0.3;
            let collapsedHighlightTile = map[j];
            collapsedHighlightTile.y = 0;
            collapsedHighlightTile.pastDisplay(map[j + 1].relativePositionToLast);
        }

        offsets = getOffsets(getOppositeDirection(map[j + 1].relativePositionToLast));
        shownTiles.push(offsets);
    }
    ctx.restore(); // currentTile position

    // history before highlighted shape
    // ctx.globalAlpha = historyAlpha - dHistoryAlpha - rateHistoryAlpha * (nTiles - 1);
    // showHistory(lastHighlight + 1, lastHistory);
    // for (j = lastHighlight; (j >= 0) && (j >= lastHistory); j--) {
    //     offsets = getOffsets(getOppositeDirection(map[j + 1].relativePositionToLast));
    //     if (checkOverlap(cur) !== false) {
    //         let originalAlpha = ctx.globalAlpha;
    //         ctx.globalAlpha = 0;
    //         map[j].pastDisplay(map[j + 1].relativePositionToLast);
    //         ctx.globalAlpha = originalAlpha - rateHistoryAlpha;
    //     }
    //     else {
    //         shownTiles.push(offsets);
    //         map[j].pastDisplay(map[j + 1].relativePositionToLast);
    //         ctx.globalAlpha -= rateHistoryAlpha;
    //     }
    // }
    // ctx.restore(); // currentTile position
    // // highlighted shape
    // ctx.globalAlpha = 1;
    // for (j = cur - 1; (j >= 0) && (j > lastHighlight); j--) {
    //     map[j].pastDisplay(map[j + 1].relativePositionToLast);
    // }
}


function checkOverlap(cur) {
    for (let k = 0; k < shownTiles.length; k++) {
        if ((Math.floor(offsets.x) == Math.floor(shownTiles[k].x)) && (Math.floor(offsets.y) === Math.floor(shownTiles[k].y))) {
            // overlap = true;
            // break;
            return map[cur - k];
        }
    }
    // return overlap;
    return false;
}

function getOffsets(relativePositionToLast) {
    switch (relativePositionToLast) {
        case 'TL':
            return { x: offsets.x - xDistance, y: offsets.y - yDistance };
        case 'TR':
            return { x: offsets.x + xDistance, y: offsets.y - yDistance };
        case 'BL':
            return { x: offsets.x - xDistance, y: offsets.y + yDistance };
        case 'BR':
            return { x: offsets.x + xDistance, y: offsets.y + yDistance };
    }
}