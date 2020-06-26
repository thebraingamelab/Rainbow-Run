function preShake() {
    ctx.save();
    let dx = Math.random() * tileHeight / 2;
    let dy = Math.random() * tileHeight / 2;
    ctx.translate(dx, dy);
}

function postShake() {
    ctx.restore();
}

function displayLife() {
    let i = 0;
    for (i = 0; i < lifeLeft; i++) {
        // ctx.drawImage(lifeImg, w + heartInterval - (heartInterval + heartW) * i, heartH/4);
        lives[i].style.display = "initial";
        lives[i].style.top = lifeImgWidth * 0.6 + "px";
        lives[i].style.right = lifeImgWidth * 0.6 + lifeImgWidth * 1.5 * i + "px";
        //console.log("life" + i + "'s right: " + lives[i].style.right);
    }
    for (; i < lifeMax; i++) {
        lives[i].style.display = "none";
    }
}

function collapse() {
    if (justCollapsed > 3) justCollapsed = 0;

    if ((currentTile < nTiles) || endOfMaze) { }
    else if ((currentTile > nTiles - 1) && (disappearingTiles.length === 0) && (justCollapsed === 0)) {
        // if (!endOfMaze){
        mistake = true;
        lifeLeft--;
        justCollapsed++;
        // }
    }
    else if (justCollapsed > 0) justCollapsed++;
    else {
        let tileCounter;
        for (let i = 0; i < disappearingTiles.length; i++) {
            tileCounter = disappearingTiles[i].tile;
            if (!map[tileCounter].collapsed) break;
        }
        if (tileCounter !== undefined) {
            map[tileCounter].collapsed = true;
            map[tileCounter].collapseY += 5;
            map[tileCounter].y = map[tileCounter].collapseY;
            // disappearingTiles[0].alpha -= collapsingSpeed;
        }
    }
}



function mapLoop() {
    // add route arrow
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    shownTiles = [];
    ctx.translate(mapTranslateX, mapTranslateY);
    ctx.globalAlpha = 1;
    map[map.length - 1].currentDisplay();
    ctx.save();

    offsets = { x: 0, y: 0 };
    shownTiles.push(offsets);
    for (let i = map.length - 2; i >= 0; i--) {
        offsets = getOffsets(getOppositeDirection(map[i + 1].relativePositionToLast));
        if (checkOverlap(i) !== false) ctx.globalAlpha = 0;
        else ctx.globalAlpha = 1;
        map[i].pastDisplay(map[i + 1].relativePositionToLast);
        shownTiles.push(offsets);
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(35,44,58)';
    ctx.moveTo(0,0);
    for (let i=1; i<shownTiles.length; i++){
        ctx.lineTo(shownTiles[i].x, shownTiles[i].y);
        ctx.stroke();
        // ctx.moveTo(shownTiles[i].x, shownTiles[i].y);
    }
    ctx.restore();

    requestAnimationFrame(mapLoop);
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
