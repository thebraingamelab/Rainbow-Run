
class Tile {
    constructor(tileClr, shadowClr, relativePositionToLast) {
        this.x = 0;
        this.y = 0;
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

    // // record next tile position
    // if (cur !== map.length - 1){
    //     offsets = getOffsets(map[cur + 1].relativePositionToLast);
    //     shownTiles.push(offsets);
    // }

    // offsets = { x: 0, y: 0 };


    // history
    let j;
    let lastHighlight;
    let lastHistory;
    if (cur !== currentTile) {
        lastHighlight = cur - nTiles + 1;
        lastHistory = cur - nHistory + 1;
    }
    else {
        lastHighlight = cur - nTiles;
        lastHistory = cur - nHistory;
    }
    // highlighting the shape if completing a sequence
    if (sinceClrStarted === nTiles) {
        ctx.save(); // currentTile position

        // highlighted shape        
        ctx.globalAlpha = 1;
        for (j = cur - 1; (j >= 0) && (j > lastHighlight); j--) {
            map[j].pastDisplay(map[j + 1].relativePositionToLast);
            offsets = getOffsets(getOppositeDirection(map[j + 1].relativePositionToLast));
            shownTiles.push(offsets);
        }
        // history before highlighted shape
        ctx.globalAlpha = historyAlpha - dHistoryAlpha - rateHistoryAlpha * (nTiles - 1);
        for (j = lastHighlight; (j >= 0) && (j >= lastHistory); j--) {
            offsets = getOffsets(getOppositeDirection(map[j + 1].relativePositionToLast));
            if (checkOverlap(cur) !== false) {
                let originalAlpha = ctx.globalAlpha;
                ctx.globalAlpha = 0;
                map[j].pastDisplay(map[j + 1].relativePositionToLast);
                ctx.globalAlpha = originalAlpha - rateHistoryAlpha;
            }
            else {
                shownTiles.push(offsets);
                map[j].pastDisplay(map[j + 1].relativePositionToLast);
                ctx.globalAlpha -= rateHistoryAlpha;
            }
        }
        ctx.restore(); // currentTile position
        // highlighted shape
        ctx.globalAlpha = 1;
        for (j = cur - 1; (j >= 0) && (j > lastHighlight); j--) {
            map[j].pastDisplay(map[j + 1].relativePositionToLast);
        }
    }
    // normal history: no highlight
    else {
        ctx.globalAlpha = historyAlpha - dHistoryAlpha;
        for (let i = cur - 1; (i >= 0) && (i >= lastHistory); i--) {
            offsets = getOffsets(getOppositeDirection(map[i + 1].relativePositionToLast));
            if (checkOverlap(cur) !== false) {
                let originalAlpha = ctx.globalAlpha;
                ctx.globalAlpha = 0;
                map[i].pastDisplay(map[i + 1].relativePositionToLast);
                ctx.globalAlpha = originalAlpha - rateHistoryAlpha;
            }
            else {
                map[i].pastDisplay(map[i + 1].relativePositionToLast);
                ctx.globalAlpha -= rateHistoryAlpha;
            }
            shownTiles.push(offsets);
        }
    }
    // last history collapse

    ctx.restore(); // currentTile position


    // next tile
    if (delayed === nextTileDelayTime) {
        curNextTileAlpha = Math.min(curNextTileAlpha + dNextTileAlpha, nextTileAlpha);
    }
    else {
        delayed++;
    }

    if (mistake) preShake();
    if (cur !== map.length - 1) {
        ctx.globalAlpha = curNextTileAlpha;
        map[cur + 1].nextDisplay();
        // offsets = getOffsets(map[cur + 1].relativePositionToLast);
        // let overlappedTile = checkOverlap(cur);
        // if (overlappedTile !== false) {
        //     ctx.globalAlpha = 0;
        //     overlappedTile.display();
        // }
    }
    if (mistake) postShake();

    ctx.restore(); // currentTile position

} // end position: currentTile position



function checkOverlap(cur) {
    let overlap = false;
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