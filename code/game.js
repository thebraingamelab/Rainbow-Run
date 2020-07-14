
function gameLoop() {
    if ((lifeLeft <= 0) && (!gameOver)) {
        gameOverAudio.play();
        gameOver = true;
        gameOverFeedback();
    }
    else if (endOfMaze && !mapView) {
        winFeedback();
    }
    if (mistake) {
        mistakeFeedback();
    }
    if (proceed === true) { // transitioning
        if (transitionProgressY < yDistance - 5) {
            ctx.clearRect(0 - xDistance, 0 - yDistance, w + xDistance * 2, h + yDistance * 2);
            drawGrid();
            drawArrows();
            transitionProgressY += transitionSpeed;
            proceedTransition(getOppositeDirection(map[currentTile].relativePositionToLast));

            // character jump animation
            if (transitionProgressY < yDistance / 2) {
                playerY -= 5;
            }
            else if (transitionProgressY < yDistance - 5) {
                playerY += 4;
            }
        }
        // note: this else block will NOT execute if the player moves before the transition completes
        else { // just finished transition
            // no clearRect here, otherwise the end of the transition will be jerky
            if (currentTile === map.length - 1) {
                endOfMaze = true;
                completeAudio.play();
            }
            transitionProgressY = 0;
            proceed = false;
            delayed = 0;
            curNextTileAlpha = 0;
            disappearingTiles.push({ tile: currentTile - 1, alpha: historyAlpha });
            ctx.restore(); // 0,0
        }
    }
    else {
        ctx.restore(); // 0,0
        ctx.clearRect(0, 0, w, h);
        drawGrid();
        drawArrows();
        displayLife();

        dCurrentTileAlpha = 0;
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        ctx.save(); // 0,0

        centerTile(currentTile);

        ctx.restore(); // 0,0

        playerX = map[currentTile].x + w / 2;
        playerY = map[currentTile].y + h / 2;
    }

    displayPlayer(playerX, playerY);

    if (gameStatus ==='GAME') requestAnimationFrame(gameLoop);
}