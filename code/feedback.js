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
    if ((currentTile>nTiles-1) && (disappearingTiles.length === 0)) {
        // if (!endOfMaze){
            mistake = true;
            lifeLeft--;
        // }
    }
    else if ((currentTile < nTiles-1) || endOfMaze){}
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