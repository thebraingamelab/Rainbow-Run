
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
        if (transitionProgressY <= yDistance) {
            ctx.clearRect(0 - xDistance, 0 - yDistance, w + xDistance * 2, h + yDistance * 2);
            modeFeature(mode);
            transitionProgressY += transitionSpeed;
            proceedTransition(getOppositeDirection(map[currentTile].relativePositionToLast));
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
        modeFeature(mode);

        displayLife();

        dCurrentTileAlpha = 0;
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        ctx.save(); // 0,0

        centerTile(currentTile);

        ctx.restore(); // 0,0
    }

    displayPlayer(w/2,h/2);
    requestAnimationFrame(gameLoop);
}