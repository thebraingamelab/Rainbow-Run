
// let high;
let xMove = 0;
let yMove = 0;
function mapLoop() {
    ctx.font = "18px Overpass";
    ctx.globalAlpha = 0.9;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    let endSize = tileWidth / 8;

    shownTiles = [];
    ctx.translate(mapTranslateX, mapTranslateY);
    map[map.length - 1].currentDisplay();
    // ctx.save(); // map starting point (end)
    //end point
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(0, 0, endSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    ctx.fillText("END", - endSize, -endSize * 1.5);
    ctx.restore();

    offsets = { x: 0, y: 0 };
    shownTiles.push(offsets);

    let shownTileCounter = 0;
    // ctx.globalAlpha = 1;

    for (let i = map.length - 2; i >= 0; i--) {
        shownTileCounter++;
        offsets = getOffsets(getOppositeDirection(map[i + 1].relativePositionToLast));
        if (checkOverlap(i) !== false) {
            moveTile(i);
            // xMove -= high;
            // yMove -= high*1.5;
            // offsets.x += xMove;
            // offsets.y += yMove;
        }
        map[i].x += xMove;
        map[i].y += yMove;
        map[i].pastDisplay(map[i + 1].relativePositionToLast);
        shownTiles.push(offsets);

        ctx.beginPath();
        ctx.moveTo(0 + xMove, 0 + yMove);
        ctx.lineTo(shownTiles[shownTileCounter - 1].x - shownTiles[shownTileCounter].x + xMove, shownTiles[shownTileCounter - 1].y - shownTiles[shownTileCounter].y + yMove);
        // console.log(-(shownTiles[shownTileCounter].x - shownTiles[shownTileCounter - 1].x ));
        // console.log(-(shownTiles[shownTileCounter].y - shownTiles[shownTileCounter - 1].y ));
        ctx.strokeStyle = 'rgba(35,44,58)';
        ctx.stroke();
        if (i === 0) {
            //start point
            ctx.save();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(0 + xMove, 0 + yMove, endSize, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.fillText("START", - endSize + xMove, - endSize * 1.5 + yMove);
            ctx.restore();
        }
    }

    // ctx.restore(); //map starting point
    // //end point
    // ctx.save();
    // ctx.fillStyle = 'black';
    // ctx.beginPath();
    // ctx.arc(0, 0, endSize, 0, 2 * Math.PI);
    // ctx.fill();
    // ctx.closePath();
    // ctx.fillText("END", - endSize, -endSize * 1.5);
    // ctx.restore();


    for (let i = 0; i < map.length; i++) {
        map[i].x = 0;
        map[i].y = 0;
    }
    xMove = 0;
    yMove = 0;

    ctx.restore();
    requestAnimationFrame(mapLoop);
}

function moveTile(i) {
    let relativePositionToNext;
    let translation = xDistance / 2;
    if (i == map.length - 1) relativePositionToNext = 'TL';
    else relativePositionToNext = map[i + 1].relativePositionToLast;
    switch (relativePositionToNext) {
        case 'TL':
            xMove += translation;
            offsets.x += translation;
            break;
        case 'TR':
            xMove -= translation;
            offsets.x -= translation;
            break;
        case 'BL':
            // not perfect pic 13:52
            yMove += translation;
            offsets.y += translation;
            break;
        case 'BR':
            yMove -= translation;
            offsets.y -= translation;
            break;
    }
}

function getMapSize() {
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    offsets = { x: 0, y: 0 };
    for (let i = 1; i < map.length; i++) {
        offsets = getOffsets(map[i].relativePositionToLast);
        minX = Math.min(minX, offsets.x);
        maxX = Math.max(maxX, offsets.x);
        minY = Math.min(minY, offsets.y);
        maxY = Math.max(maxY, offsets.y);
    }
    let mapWidth = maxX - minX;
    let mapHeight = maxY - minY;
    let mapCenterX = maxX - mapWidth / 2;
    let mapCenterY = maxY - mapHeight / 2;
    mapTranslateX = offsets.x - mapCenterX;
    mapTranslateY = offsets.y - mapCenterY;
    return { mapw: mapWidth, maph: mapHeight };
}

function setParaForMapView() {
    for (let i = 0; i < map.length; i++) {
        map[i].y = 0;
    }
    let mapSize = getMapSize();
    let mapWidth = mapSize.mapw + tileWidth;
    let mapHeight = mapSize.maph + tileLength;
    let nTileHorizontal = Math.ceil(mapWidth / ((xDistance - tileWidth / 2) * 2 + tileWidth));
    let nTileVertical = Math.ceil(mapHeight / ((yDistance - tileHeight / 2) * 2 + tileHeight));
    // mapcontainer width & height
    let initialTileWidth = tileWidth;
    let initialTileLength = tileLength;
    tileWidth = w / 1.5 / nTileHorizontal;
    setTileParaByWidth(tileWidth);
    if (tileLength > h / 1.5 / nTileVertical) {
        tileLength = h / 1.5 / nTileVertical;
        setTileParaByLength(tileLength);
    }
    let tileWidthChange = tileWidth / initialTileWidth;
    let tileLengthChange = tileLength / initialTileLength;
    mapTranslateX *= tileWidthChange;
    mapTranslateY *= tileLengthChange;
}
