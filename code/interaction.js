
function updatePlayerPosition(evt) {
    // clickProgress=0;
    // clickAlpha = 1;
    clickAudio.currentTime = 0;
    clickAudio.play();

    let playerMove = getInteractionArea(evt);
    if (gameOver) restart();
    else if (endOfMaze) {
        gameStatus = 'POSTGAME';
        mainLoop();
    }
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
        mistake = false;
        incorrectImg.style.display = 'none';
        // reduceLifeImg.style.display = 'none';
        slow = false;
        proceed = true;
        currentTile++;
        currentCollapsing = currentCollapsingThreshold * 0.95;
        if (sinceClrStarted === nTiles) {
            sinceClrStarted = 0;
        }
        if (map[currentTile].tileClr !== '#B1BCCA') sinceClrStarted++;
        if (sinceClrStarted === nTiles) {
            highlightAudio.currentTime = 0;
            highlightAudio.play();
            // only extra life when the sequence was accurately completed
            // an array to record the moves
            let accurateSequence = true;
            for (let i = currentTile; i > currentTile - nTiles; i--) {
                let curMove = moves[i];
                if (curMove === false) {
                    accurateSequence = false;
                    break;
                }
            }
            if (accurateSequence) {
                lifeLeft = Math.min(lifeLeft + 1, lifeMax);
            }
        }
    }
    else { // the player tapped a wrong direction
        mistake = true;
        moves.push(false);
        lifeLeft--;
        errorAudio.currentTime = 0;
        errorAudio.play();
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

// function displayPlayer(x,y) {
//     let playerWidth = tileWidth / 3;
//     let playerLength = playerWidth / 1.5;
//     let playerHeight = playerLength / 1.5;

//     ctx.save();
//     ctx.translate(0,-playerHeight/2);
//     ctx.fillStyle = '#F7F7F7';
//     ctx.strokeStyle = '#325A74';
//     // ctx.strokeStyle = 'transparent';

//     //  top
//     // ctx.fillStyle = '#917367';
//     ctx.beginPath();
//     ctx.moveTo(x, -playerLength / 2);
//     ctx.lineTo(-playerWidth / 2, y);
//     ctx.lineTo(x, playerLength / 2);
//     ctx.lineTo(playerWidth / 2, y);
//     ctx.closePath();
//     ctx.fill();
//     ctx.stroke();

//     //  shadow
//     // ctx.fillStyle = '#232C3A';
//     ctx.beginPath();
//     ctx.moveTo(x - playerWidth / 2, y);
//     ctx.lineTo(x - playerWidth / 2, y + playerHeight);
//     ctx.lineTo(x, y + playerLength / 2 + playerHeight);
//     ctx.lineTo(x, y + playerLength / 2);
//     ctx.closePath();
//     ctx.fill();
//     ctx.stroke();

//     // tile right
//     ctx.beginPath();
//     ctx.moveTo(x, y + playerLength / 2);
//     ctx.lineTo(x, y + playerHeight + playerLength / 2);
//     ctx.lineTo(x + playerWidth / 2, y + playerHeight);
//     ctx.lineTo(x + playerWidth / 2, y);
//     ctx.closePath();
//     ctx.fill();
//     ctx.stroke();

//     ctx.restore();

// }

function restart() {
    location.reload();
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
    if (justCollapsed > 3) justCollapsed = 0;

    if ((currentTile < startCollapsing) || endOfMaze || gameOver) { }
    else if ((currentTile > nTiles - 1) && (disappearingTiles.length === 0) && (justCollapsed === 0)) {
        // if (!endOfMaze){
        slow = true;
        lifeLeft--;
        // console.log(lifeLeft);
        justCollapsed++;
        // }
        slowAudio.play();
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
        }
    }
}

// function clickPop(evt){
//     let rect = canvas.getBoundingClientRect();
//     mousePosX = evt.clientX - rect.left;
//     mousePosY = evt.clientY - rect.top;
//     ctx.beginPath();
//     ctx.arc(mousePosX, mousePosY, 50, 0, 2 * Math.PI);
//     ctx.stroke();
//     // inner 
// }

function mistakeFeedback() {
    incorrectImg.style.left = mousePosX - incorrectImg.width / 2 + "px";
    incorrectImg.style.top = mousePosY - incorrectImg.height / 2 + "px";
    incorrectImg.style.display = "initial";
    // reduceLifeImg.style.left = mousePosX - incorrectImg.width/2 + incorrectImg.width *1.5 + "px";
    // reduceLifeImg.style.top = mousePosY + "px";
    // reduceLifeImg.style.display = "initial";
}

function gameOverFeedback() {
    gameOverText.style.display = "initial";
}

function winFeedback() {
    winText.style.display = "initial";

    crownImg.style.display = "initial";
    crownAlpha += 0.05;
    crownImg.style.opacity = crownAlpha;
    crownImg.style.left = w / 2 - crownImg.width / 2 + "px";
    crownImgTop = Math.max(crownImgTop - crownImgUpSpeed, lifeImgWidth / 1.5);
    crownImg.style.top = crownImgTop + "px";
}

