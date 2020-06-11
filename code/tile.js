
class Tile {
    constructor(tileClr, shadowClr) {
        this.x = 0; // x of the last tile
        this.y = 0; // y of the last tile
        this.relativePositionToLast; // relative position to the last tile
        //this.relativePositionToNext; // relative position to the next tile
        this.tileClr = tileClr;
        this.shadowClr = shadowClr;
    }

    currentDisplay() { // when the tile is where the player currently is, position it in the middle
        ctx.globalAlpha = 1;
        ctx.translate(w / 2, h / 2);
        this.display();
        // square representing the player
        ctx.fillStyle = 'black';
        ctx.fillRect(-6, -6, 12, 12);
    }

    pastDisplay(relativePositionToLastOfLastTile) { // when the tile is shown as hitory
        ctx.globalAlpha = 0.15;
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
        ctx.globalAlpha = 0.4;
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
    // let currentTile = Math.floor(Math.random()*(map.length-1));
    // console.log("currentTile i:" + currentTile);
    map[currentTile].currentDisplay();
    ctx.save(); // currentTile position
    ctx.save(); // currentTile position
    // current tile
    if (currentTile === map.length - 1) {
        // reaching end: square turning red
        ctx.fillStyle = 'red';
        ctx.fillRect(-6, -6, 12, 12);
    }
    // next tile
    else {
        map[currentTile + 1].nextDisplay();
        //for (let j = currentTile+1; j<map.length; j++) map[j].nextDisplay(); //test every remaining tiles
    }
    // history
    ctx.restore(); // currentTile position
    for (let i = currentTile - 1; (i >= 0) && (i >= currentTile - nHistory); i--) {
        map[i].pastDisplay(map[i + 1].relativePositionToLast);
    }
    ctx.restore(); // currentTile position
} // end position: currentTile position