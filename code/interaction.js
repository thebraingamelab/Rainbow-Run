
function updatePlayerPosition(evt) {
    let playerMove = getInteractionArea(evt);
    if (currentTile === map.length - 1) { // if reaching the end
        generateMap();
        currentTile = 0;
        message.innerHTML = "Hello again! Click on where the next tile appears to run through the maze.";
    }
    else if (playerMove === map[currentTile + 1].relativePositionToLast) {
        message.style.color = "black";
        message.innerHTML = "Nice move!";
        //playerOnTile(map[currentTile+1]);
        correctMove = true;
        if (currentTile === map.length - 2) {
            message.innerHTML = "You reached the end! Click anywhere to restart.";
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
    dCurrentTileAlpha = transitionProgressY/yDistance*(currentTileAlpha-historyAlpha);
    dNextTileAlpha = transitionProgressY/yDistance*(currentTileAlpha-nextTileAlpha);
    switch (transitionDirection) {
        case 'TL':
            ctx.translate(-xPerY, -1);
            centerTile(currentTile);
            break;
        case 'TR':
            ctx.translate(xPerY, -1);
            centerTile(currentTile);
            break;
        case 'BL':
            ctx.translate(-xPerY, 1);
            centerTile(currentTile);
            break;
        case 'BR':
            ctx.translate(xPerY, 1);
            centerTile(currentTile);
            break;
    }
    ctx.translate(-w / 2, -h / 2); // cancel the translate(w/2,h/2) in centerTile() function
}

function playerOnTile(tile){
    if (currentTile === map.length-1) ctx.fillStyle = 'red';
    else ctx.fillStyle = 'black';
    ctx.fillRect(tile.x-6, tile.y-6, 12, 12);
}