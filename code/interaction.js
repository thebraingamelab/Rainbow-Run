
function updatePlayerPosition(evt) {
    // clickProgress=0;
    // clickAlpha = 1;
    clickAudio.currentTime = 0;
    clickAudio.play();

    let playerMove = getInteractionArea(evt);
    if (gameOver || punishTime > 0) { }
    else if (currentTile === map.length - 1) { }
    else if (playerMove === map[currentTile + 1].relativePositionToLast) {
        // clickPop(evt);

        if (proceed) { // if the player is clicking before the transition finishes
            proceed = false;
            delayed = 0;
            curNextTileAlpha = 0;
            disappearingTiles.push({ tile: currentTile - 1, alpha: historyAlpha });
            ctx.restore(); // 0,0
            ctx.save(); // 0,0
            ctx.save(); // 0,0
            centerTile(currentTile);
            ctx.restore(); // 0,0
        }

        if (!mistake) moves.push(true);
        targetScore += 5;

        mistake = false;
        incorrectImg.style.display = 'none';
        // reduceLifeImg.style.display = 'none';
        slow = false;
        proceed = true;
        currentTile++;

        // if (currentTile > startCollapsing) {
        //     collapsingInterval -= collapsingIntervalDefault / map.length;
        // }

        if (sinceClrStarted === nTiles) {
            sinceClrStarted = 0;
            // past tiles turn grey
            for (let i = currentTile - 1; i >= currentTile - nTiles; i--) {
                map[i].tileClr = greyTileClr;
                map[i].shadowClr = greyShadowClr;
            }
        }
        if (map[currentTile].tileClr !== greyTileClr) sinceClrStarted++;
        if (sinceClrStarted === nTiles) {
            highlightAudio.currentTime = 0;
            highlightAudio.play();
        }

        // collapsing speeds up
        // after people learnt the color sequences, collapsing speed increases...
        if ((currentTile + 1) % (nTiles * nColors) === 0) collapseInterval -= 50;
        // console.log(collapseInterval);
    }
    else { // the player tapped a wrong direction
        mistake = true;
        moves.push(false);
        punishTime = punishTimeMax;
        // lifeLeft--;
        errorAudio.currentTime = 0;
        errorAudio.play();

        incorrectImg.style.left = mousePosX - incorrectImg.width / 2 + "px";
        incorrectImg.style.top = mousePosY - incorrectImg.height / 2 + "px";
        incorrectImg.style.display = "initial";

    }
}

function getInteractionArea(evt) {
    let rect = canvas.getBoundingClientRect();
    mousePosX = evt.clientX - rect.left;
    mousePosY = evt.clientY - rect.top;

    if ((mousePosX < w / 2) && (mousePosY < h / 2)) return 'TL';
    else if ((mousePosX < w / 2) && (mousePosY > h / 2)) return 'BL';
    else if ((mousePosX > w / 2) && (mousePosY < h / 2)) return 'TR';
    else if ((mousePosX > w / 2) && (mousePosY > h / 2)) return 'BR';
}

function proceedTransition(transitionDirection) {
    let change = Math.min(transitionProgressY / yDistance, 1);
    if (sinceClrStarted === nTiles) {
        dCurrentTileAlpha = 0; // highlighting the shape
    }
    else {
        dCurrentTileAlpha = change * (currentTileAlpha - historyAlpha);
    }

    let centered = currentTile - 1; // animate around the last tile -> smoother transition

    switch (transitionDirection) {
        case 'TL':
            ctx.translate(-xPerY * transitionSpeed, -transitionSpeed);
            centerTile(centered);
            break;
        case 'TR':
            ctx.translate(xPerY * transitionSpeed, -transitionSpeed);
            centerTile(centered);
            break;
        case 'BL':
            ctx.translate(-xPerY * transitionSpeed, transitionSpeed);
            centerTile(centered);
            break;
        case 'BR':
            ctx.translate(xPerY * transitionSpeed, transitionSpeed);
            centerTile(centered);
            break;
    }

    ctx.translate(-w / 2, -h / 2); // cancel the translate(w/2,h/2) in centerTile() function
}


function displayPlayer(x, y) {
    character.style.display = "initial";
    character.style.left = x - character.width / 2 + "px";
    character.style.top = y - character.height / 1.8 + "px";
}

function restart() {
    location.reload();
    // gameStatus = 'GAME';
}

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
    if ((currentTile < startCollapsing) || endOfMaze) { }

    else if ((currentTile > nTiles - 1) && map[currentTile - 1].collapsed) {
        // // reduce life:
        // slow = true;
        // lifeLeft--;
        // justCollapsed++;
        // slowAudio.play();

        // game over:
        if (!gameOver) {
            gameOverAudio.play();
            gameOver = true;
            gameOverBox.style.display = 'inline-block';
            map[currentTile].collapsed = true;
        }
    }
    // else if (justCollapsed > 0) justCollapsed++;
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
        }
    }
}


function mistakeFeedback() {
    // character animation
    if (punishTime > punishTimeMax / 3 * 2) {
        playerY -= 5;
    }
    else if (punishTime > punishTimeMax / 3) {
        character.style.transform = 'rotate(' + 360 / punishTimeMax * 3 * (punishTime - punishTimeMax / 3) + 'deg)';
    }
    else {
        character.style.transform = 'rotate(0deg)';
        playerY += 5;
    }
}

function winFeedback() {
    winText.style.display = "initial";

    crownImg.style.display = "initial";
    crownAlpha += 0.05;
    crownImg.style.opacity = crownAlpha;
    crownImg.style.left = w / 2 - crownImg.width / 2 + "px";
    crownImgTop = Math.max(crownImgTop - crownImgUpSpeed, h / 2 - tileWidth / 1.);
    crownImg.style.top = crownImgTop + "px";
}

