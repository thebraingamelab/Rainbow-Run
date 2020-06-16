
class Tile {
    constructor(tileClr, shadowClr) {
        this.x = 0;
        this.y = 0;
        this.relativePositionToLast; // relative position to the last tile
        //this.relativePositionToNext; // relative position to the next tile
        this.tileClr = tileClr;
        this.shadowClr = shadowClr;
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

function centerTile(currentTile) { // start position: last end position
    //current tile
    ctx.globalAlpha = currentTileAlpha - dCurrentTileAlpha;
    map[currentTile].currentDisplay();
    ctx.save(); // currentTile position
    ctx.save(); // currentTile position

    // history
    // highlighting the shape if completing a sequence
    if ((currentTile + 1) % nTiles == 0) {
        ctx.globalAlpha = 1;
        // highlighted shape
        let j = currentTile-1;
        for (; j > currentTile - nTiles; j--) {
            map[j].pastDisplay(map[j + 1].relativePositionToLast);
        }
        // history before highlighted shape
        ctx.globalAlpha = historyAlpha - dHistoryAlpha - rateHistoryAlpha*(nTiles-1);
        for (; (j>=0) && (j>= currentTile-nHistory); j--){
            map[j].pastDisplay(map[j + 1].relativePositionToLast);
            ctx.globalAlpha -= rateHistoryAlpha;
        }
    }
    else {
        ctx.globalAlpha = historyAlpha - dHistoryAlpha;
        for (let i = currentTile - 1; (i >= 0) && (i >= currentTile - nHistory); i--) {
            map[i].pastDisplay(map[i + 1].relativePositionToLast);
            ctx.globalAlpha -= rateHistoryAlpha;
        }
    }
    

    ctx.restore(); // currentTile position

    // next tile
    if (currentTile !== map.length - 1) {
        ctx.globalAlpha = nextTileAlpha + dNextTileAlpha;
        map[currentTile + 1].nextDisplay();
    }

    ctx.restore(); // currentTile position
} // end position: currentTile position