
function gameLoop() {
    // if ((lifeLeft <= 0) && (!gameOver)) {
    //     gameOverAudio.play();
    //     gameOver = true;
    //     gameOverFeedback();
    // }
    // collapsed -gameover:
    if (map[currentTile].collapsed && gameOver) {
        map[currentTile].y += 5;
        if (map[currentTile].y >= h) map[currentTile + 1].y += 5;
    }
    else if (endOfMaze) {
        winFeedback();
        // outroCharacterAnimation();
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
                // clearInterval(collapseDefault);
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
        // displayLife();

        dCurrentTileAlpha = 0;
        ctx.save(); // 0,0
        ctx.save(); // 0,0
        ctx.save(); // 0,0

        centerTile(currentTile);

        ctx.restore(); // 0,0

        if (!endOfMaze) {
            playerX = map[currentTile].x + w / 2;
            playerY = map[currentTile].y + h / 2;
        }
    }


    // if (sinceClrStarted === nTiles && accurateSequence && !proceed) {
    //     ctx.save();
    //     ctx.fillStyle = map[currentTile].shadowClr;
    //     ctx.textAlign = 'center';
    //     let fontSize = tileLength / 2;
    //     ctx.font = fontSize + 'px Overpass';

    //     // ctx.font = '22px Overpass';
    //     ctx.fillText("+5", playerX, playerY - tileHeight * 2.5);
    //     ctx.restore();
    // }

    if (curScore !== targetScore) {
        curScore++;
    }
    displayScore();
    displayPlayer(playerX, playerY);


    if (gameStatus === 'GAME') {

        let curTime = performance.now();
        if (curTime - last_collapse >= collapseInterval) {
            collapse();
            last_collapse = curTime;
        }

        requestAnimationFrame(gameLoop);
    }
}

function displayScore() {
    score.innerHTML = curScore;
}