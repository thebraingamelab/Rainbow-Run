
function updatePlayerPosition(evt) {
    clickAudio.play();
    let playerMove = getInteractionArea(evt);
    if (gameOver) restart();
    else if (currentTile === map.length - 1) {
        // message.innerHTML = "You have reached the end! Press R to restart.";
        mapView = true;
        mainLoop();
        // restart();
    }
    else if (playerMove === map[currentTile + 1].relativePositionToLast) {
        if (proceed) { // if the player is clicking before the transition finishes
            proceed = false;
            delayed = 0;
            curNextTileAlpha = 0;
            disappearingTiles.push({ tile: currentTile - 1, alpha: historyAlpha });
            ctx.restore(); // 0,0
            ctx.save(); // 0,0
            ctx.save(); // 0,0
            centerTile(currentTile);
            playerOnTile(map[currentTile]);
            ctx.restore(); // 0,0
        }
        mistake = false;
        proceed = true;
        moves.push(true);
        currentTile++;
        if (currentTile === map.length - 1){
            completeAudio.play();
            endOfMaze = true;
        }
        currentCollapsing = currentCollapsingThreshold * 0.95;
        if (sinceClrStarted === nTiles) {
            sinceClrStarted = 0;
        }
        if (map[currentTile].tileClr !== '#B1BCCA') sinceClrStarted++;
        if (sinceClrStarted === nTiles) {
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
                lifeLeft++;
                lifeLeft = Math.min(lifeLeft, lifeMax);
            }
        }
    }
    else { // the player tapped a wrong direction
        errorAudio.play();
        mistake = true;
        moves.push(false);
        lifeLeft--;
    }

}

function getInteractionArea(evt) {
    let rect = canvas.getBoundingClientRect();
    let mousePosX = evt.clientX - rect.left;
    let mousePosY = evt.clientY - rect.top;

    if ((mousePosX < w / 2) && (mousePosY < h / 2)) return 'TL';
    else if ((mousePosX < w / 2) && (mousePosY > h / 2)) return 'BL';
    else if ((mousePosX > w / 2) && (mousePosY < h / 2)) return 'TR';
    else if ((mousePosX > w / 2) && (mousePosY > h / 2)) return 'BR';
}

function proceedTransition(transitionDirection) {
    let xPerY = xDistance / yDistance; // for every transition of 1 on y-axis, transition of xPerY on x-axis
    let change = Math.min(transitionProgressY / yDistance, 1);
    if (sinceClrStarted === nTiles) {
        dCurrentTileAlpha = 0; // highlighting the shape
        // dHistoryAlpha = 0;
    }
    else {
        dCurrentTileAlpha = change * (currentTileAlpha - historyAlpha);
        // dHistoryAlpha = change * (rateHistoryAlpha);
    }
    //dNextTileAlpha = change * (currentTileAlpha - nextTileAlpha);

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

function playerOnTile(tile) {
    if (currentTile === map.length - 1) ctx.fillStyle = 'red';
    else ctx.fillStyle = 'black';
    let playerSize = tileWidth / 6;
    ctx.fillRect(tile.x - playerSize / 2, tile.y - playerSize / 2, playerSize, playerSize);
}

function restart() {
    location.reload();
}