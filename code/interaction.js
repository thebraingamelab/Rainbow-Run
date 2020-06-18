
function updatePlayerPosition(evt) {
    let playerMove = getInteractionArea(evt);
    if (endOfMaze){}
    else if (playerMove === map[currentTile + 1].relativePositionToLast) {
        // message.style.color = "black";
        // message.innerHTML = "Nice move!";
        //playerOnTile(map[currentTile+1]);
        correctMove = true;
        currentTile++;
        if (sinceClrStarted===nTiles) sinceClrStarted=0;
        if (map[currentTile].tileClr !== '#B1BCCA') sinceClrStarted++;
        if (currentTile === map.length - 1) {
            // message.innerHTML = "You have reached the end! Press R to restart.";
            endOfMaze=true;
        }
    }
    else { // the player tapped a wrong direction
        // message.style.color = "red";
        // message.innerHTML = "Wrong direction! Try again.";
        correctMove = false;
    }
}

function getInteractionArea(evt) {
    let rect = canvas.getBoundingClientRect();
    let mousePosX = evt.clientX - rect.left;
    let mousePosY = evt.clientY - rect.top;
    if ((mousePosX < w / 2) && (mousePosY < h / 2 )) return 'TL';
    else if ((mousePosX < w / 2) && (mousePosY > h / 2 )) return 'BL';
    else if ((mousePosX > w / 2) && (mousePosY < h / 2 )) return 'TR';
    else if ((mousePosX > w / 2) && (mousePosY > h / 2 )) return 'BR';
}

function proceedTransition(transitionDirection) {
    let xPerY = xDistance / yDistance; // for every transition of 1 on y-axis, transition of xPerY on x-axis
    let change = Math.min(transitionProgressY/yDistance, 1);
    if (sinceClrStarted === nTiles) {
        dCurrentTileAlpha = 0; // highlighting the shape
        dHistoryAlpha = 0;
    }
    else {
        dCurrentTileAlpha = change*(currentTileAlpha-historyAlpha);
        dHistoryAlpha = change * (rateHistoryAlpha);
    }
    dNextTileAlpha = change*(currentTileAlpha-nextTileAlpha);

    switch (transitionDirection) {
        case 'TL':
            ctx.translate(-xPerY * transitionSpeed, -transitionSpeed);
            centerTile(currentTile-1);
            break;
        case 'TR':
            ctx.translate(xPerY * transitionSpeed, -transitionSpeed);
            centerTile(currentTile-1);
            break;
        case 'BL':
            ctx.translate(-xPerY * transitionSpeed, transitionSpeed);
            centerTile(currentTile-1);
            break;
        case 'BR':
            ctx.translate(xPerY * transitionSpeed, transitionSpeed);
            centerTile(currentTile-1);
            break;
    }
    ctx.translate(-w / 2, -h / 2); // cancel the translate(w/2,h/2) in centerTile() function
}

function playerOnTile(tile){
    if (currentTile === map.length-1) ctx.fillStyle = 'red';
    else ctx.fillStyle = 'black';
    let playerSize = tileWidth/6;
    ctx.fillRect(tile.x-playerSize/2, tile.y-playerSize/2, playerSize, playerSize);
}

function restart(evt){
    if (evt.key=='r') {
        generateMap();
        currentTile = 0;
        endOfMaze=false;
        // message.style.color = 'black';
        // message.innerHTML = "Hello again! Click on where the next tile appears to run through the maze.";
    }
}