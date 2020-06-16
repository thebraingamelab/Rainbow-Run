
function updatePlayerPosition(evt) {
    let playerMove = getInteractionArea(evt);
    if (endOfMaze){}
    else if (playerMove === map[currentTile + 1].relativePositionToLast) {
        message.style.color = "black";
        message.innerHTML = "Nice move!";
        //playerOnTile(map[currentTile+1]);
        correctMove = true;
        currentTile++;
        if (currentTile === map.length - 1) {
            message.innerHTML = "You have reached the end! Press R to restart.";
            endOfMaze=true;
        }
    }
    else { // the player tapped a wrong direction
        message.style.color = "red";
        message.innerHTML = "Wrong direction! Try again.";
        correctMove = false;
    }
}

function getInteractionArea(evt) {
    let rect = canvas.getBoundingClientRect();
    let mousePosX = evt.clientX - rect.left;
    let mousePosY = evt.clientY - rect.top;
    if ((mousePosX < w / 2 - tileHeight) && (mousePosY < h / 2 - tileHeight)) return 'TL';
    else if ((mousePosX < w / 2 - tileHeight) && (mousePosY > h / 2 + tileHeight)) return 'BL';
    else if ((mousePosX > w / 2 + tileHeight) && (mousePosY < h / 2 - tileHeight)) return 'TR';
    else if ((mousePosX > w / 2 + tileHeight) && (mousePosY > h / 2 + tileHeight)) return 'BR';
}

function proceedTransition(transitionDirection) {
    let xPerY = xDistance / yDistance; // for every transition of 1 on y-axis, transition of xPerY on x-axis
    let change = Math.min(transitionProgressY/yDistance, 1);
    if ((currentTile-1+1)%nTiles == 0) {
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
    ctx.fillRect(tile.x-6, tile.y-6, 12, 12);
}

function restart(evt){
    if (evt.key=='r') {
        generateMap();
        currentTile = 0;
        endOfMaze=false;
        message.style.color = 'black';
        message.innerHTML = "Hello again! Click on where the next tile appears to run through the maze.";
    }
}