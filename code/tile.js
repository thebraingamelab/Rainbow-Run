
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

function centerTile(cur) { // start position: last end position
    //current tile
    ctx.globalAlpha = currentTileAlpha - dCurrentTileAlpha;
    map[cur].currentDisplay();
    ctx.save(); // currentTile position
    ctx.save(); // currentTile position

    let j;
    let lastHighlight;
    let lastHistory;

    if (cur !== currentTile){
        lastHighlight=cur-nTiles+1;
        lastHistory = cur-nHistory+1;
    }
    else {
        lastHighlight = cur-nTiles;
        lastHistory =  cur - nHistory;
    }

    // history
    // highlighting the shape if completing a sequence
    if (sinceClrStarted === nTiles) {
        ctx.save(); // currentTile position

        // highlighted shape        
        ctx.globalAlpha = 1;
        for (j = cur - 1; (j >= 0) && (j > lastHighlight); j--) {
            map[j].pastDisplay(map[j + 1].relativePositionToLast);
        }
        // history before highlighted shape
        ctx.globalAlpha = historyAlpha - dHistoryAlpha - rateHistoryAlpha * (nTiles - 1);
        for (j = lastHighlight; (j >= 0) && (j >= lastHistory); j--) {
            map[j].pastDisplay(map[j + 1].relativePositionToLast);
            ctx.globalAlpha -= rateHistoryAlpha;
        }
        ctx.restore(); // currentTile position
        // highlighted shape
        ctx.globalAlpha = 1;
        for (j = cur - 1; (j >= 0) && (j > lastHighlight); j--) {
            map[j].pastDisplay(map[j + 1].relativePositionToLast);
        }

    }
    else {
        ctx.globalAlpha = historyAlpha - dHistoryAlpha;
        for (let i = cur - 1; (i >= 0) && (i >= lastHistory); i--) {
            map[i].pastDisplay(map[i + 1].relativePositionToLast);
            ctx.globalAlpha -= rateHistoryAlpha;
        }
    }


    ctx.restore(); // currentTile position

    // next tile
    if (cur !== map.length - 1) {
        ctx.globalAlpha = nextTileAlpha + dNextTileAlpha;
        map[cur + 1].nextDisplay();
    }

    ctx.restore(); // currentTile position

} // end position: currentTile position