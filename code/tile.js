
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

    // store currentTile position. currentTile displayed at the last to make sure it's the foremost tile.
    offsets = { x: 0, y: 0 };
    shownTiles.push(offsets);
    ctx.translate(w / 2, h / 2);
    ctx.save(); // currentTile position
    ctx.save(); // currentTile position

    // history
    disappearHistory();

    ctx.restore();  // currentTile position

    // highlight
    ctx.save();
    let lastHighlight;
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
    ctx.restore();

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

    ctx.translate(-w/2,-h/2);
    //current tile
    ctx.globalAlpha = currentTileAlpha - dCurrentTileAlpha;
    map[cur].currentDisplay();

} // end position: currentTile position

function disappearHistory() {
    for (let i = disappearingTiles.length - 1; i >= 0; i--) { // from cur to past

        let tileCounter = disappearingTiles[i].tile;
        disappearingTiles[i].alpha -= disappearingSpeed;

        // collapse
        if (disappearingTiles[i].alpha <= collapseThreshold) {
            map[tileCounter].collapsed = true;
            map[tileCounter].collapseY += 5;
            map[tileCounter].y = map[tileCounter].collapseY;
            disappearingTiles[i].alpha -= collapsingSpeed;
        }

        // remove disappeared tile
        if (map[tileCounter].y > h / 2) {
            map[tileCounter].disappeared = true;
            disappearingTiles.splice(i, 1);
            continue;
        }

        // display if not overlapping
        offsets = getOffsets(tileCounter, getOppositeDirection(map[tileCounter + 1].relativePositionToLast));
        if (checkOverlap(tileCounter) !== false) {
            ctx.globalAlpha = 0;
            map[tileCounter].pastDisplay(map[tileCounter + 1].relativePositionToLast);
        }
        else {
            let tileAlpha = disappearingTiles[i].alpha;
            ctx.globalAlpha = Math.max(tileAlpha, 0);
            map[tileCounter].pastDisplay(map[tileCounter + 1].relativePositionToLast);
        }
        shownTiles.push(offsets);
    }
}


function highlight(cur, lastHighlight) {
    // store highlighted shape position to ensure foremost priority
    ctx.globalAlpha=0;
    for (let i = cur - 1; (i > Math.max(-1, lastHighlight)); i--) {
        map[i].pastDisplay(map[i + 1].relativePositionToLast);
    }
    // display highlighted shape
    for (let j = Math.max(lastHighlight+1,0); j<=cur-1; j++){
        if (map[j].collapsed) ctx.save();
        if (map[j].disappeared) ctx.globalAlpha = 0;
        else ctx.globalAlpha = 1;

        if (j===Math.max(lastHighlight+1,0)) map[j].display();
        else map[j].nextDisplay();

        if (map[j].collapsed) {
            ctx.restore();
            ctx.globalAlpha = 0.3;
            let collapsedHighlightTile = map[j];
            collapsedHighlightTile.y = 0;
            if (j===Math.max(lastHighlight+1,0)) collapsedHighlightTile.display();
            else collapsedHighlightTile.nextDisplay();
        }

        offsets = getOffsets(j, getOppositeDirection(map[j + 1].relativePositionToLast));
        shownTiles.push(offsets);
    }
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

function getOffsets(tileCounter, relativePositionToLast) {
    let collapsedY = map[tileCounter].collapseY;
    switch (relativePositionToLast) {
        case 'TL':
            return { x: offsets.x - xDistance, y: offsets.y + collapsedY - yDistance };
        case 'TR':
            return { x: offsets.x + xDistance, y: offsets.y + collapsedY - yDistance };
        case 'BL':
            return { x: offsets.x - xDistance, y: offsets.y + collapsedY + yDistance };
        case 'BR':
            return { x: offsets.x + xDistance, y: offsets.y + collapsedY + yDistance };
    }
}