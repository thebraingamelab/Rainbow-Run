let introTiles = [];
let introRequest;
let introStartX, introStartY;
function buildIntroPath() {
    let xDisplacement = xDistance;
    let yDisplacement = yDistance;

    // default: tiles from the left
    let firstDirection = map[1].relativePositionToLast;
    if (firstDirection === 'TL' || firstDirection === 'BL') xDisplacement *= -1;

    let x, y;

    introStartX = w / 2 - xDisplacement * 2;
    introStartY = h / 2 - yDisplacement * 4;
    introTiles.push(new Tile(greyTileClr, greyShadowClr, 'any'));
    introTiles[introTiles.length - 1].x = introStartX;
    introTiles[introTiles.length - 1].y = introStartY;

    // first tile
    x = introStartX + xDisplacement;
    y = introStartY + yDisplacement;
    introTiles.push(new Tile(greyTileClr, greyShadowClr, 'any'));
    introTiles[introTiles.length - 1].x = x;
    introTiles[introTiles.length - 1].y = y;
    // second tile
    x -= xDisplacement;
    y += yDisplacement;
    introTiles.push(new Tile(greyTileClr, greyShadowClr, 'any'));
    introTiles[introTiles.length - 1].x = x;
    introTiles[introTiles.length - 1].y = y;
    // third tile
    x += xDisplacement;
    y += yDisplacement;
    introTiles.push(new Tile(greyTileClr, greyShadowClr, 'any'));
    introTiles[introTiles.length - 1].x = x;
    introTiles[introTiles.length - 1].y = y;
}


function introStartAnimation() {
    // hop
    if (hopProgress < yDistance * scaleNumber) {
        hopProgress += transitionSpeed;
        playerX += xPerY * transitionSpeed;
        playerY -= transitionSpeed;
        // character jump animation
        if (hopProgress < yDistance * scaleNumber / 2) playerY -= 5 * scaleNumber / 1.5;
        else playerY += 4 * scaleNumber / 1.5;
        displayPlayer(playerX, playerY);
    }
    // player already hopped onto the button tile
    else {
        playerX = w / 2 + towardsStart * Math.abs((w / 2 - introStartX) / (h / 2 - introStartY));
        playerY = h / 2 - Math.abs(towardsStart);
        displayPlayer(playerX, playerY);

        introBgAlpha = Math.max(0, introBgAlpha - 0.05);
        let dScaleNumber = 0.2;
        scaleNumber = Math.max(1, scaleNumber - dScaleNumber);
        if ((introStartX < playerX) || (towardsStart < 0)) towardsStart -= 5;
        else towardsStart += 5;
    }
}


let introStatus = 'WAITING_TO_START';
let pathCounter = 0;
let hopProgress = 0;// along x-axis
let hopInterval = 15;
let pauseTime = 0;
let startTileClr, startTileShadowClr, startTile;
let bgwidth, bgheight;
let introBgAlpha = 0.8;
let startAnimate = false;
let scaleNumber = 2.5;
let towardsStart = 0;
function introAnimationLoop() {
    ctx.clearRect(0 - xDistance, 0 - yDistance, w + xDistance * 2, h + yDistance * 2);
    drawGrid();
    switch (introStatus) {
        case 'WAITING_TO_START':

            // background
            ctx.save();
            ctx.globalAlpha = introBgAlpha;
            ctx.strokeStyle = 'transparent';

            if (w > h) {
                bgwidth = w / colors.length;
                for (let i = 0; i < colors.length; i++) {
                    ctx.save();
                    ctx.fillStyle = colors[i][0];
                    ctx.fillRect(bgwidth * i, 0, bgwidth, h);
                    ctx.restore();
                }
            }
            else {
                bgheight = h / colors.length;
                for (let i = 0; i < colors.length; i++) {
                    ctx.save();
                    ctx.fillStyle = colors[i][0];
                    ctx.fillRect(0, bgheight * i, w, bgheight);
                    ctx.restore();
                }
            }
            ctx.restore();


            // button tile
            ctx.save();
            let buttonTile = new Tile(greyTileClr, greyShadowClr, 'any');
            ctx.translate(w / 2 + towardsStart * Math.abs((w / 2 - introStartX) / (h / 2 - introStartY)), h / 2 - Math.abs(towardsStart));
            ctx.scale(scaleNumber, scaleNumber);
            buttonTile.display();
            ctx.restore();
            // start text
            ctx.save();
            ctx.textAlign = 'center';
            ctx.globalAlpha = introBgAlpha;

            ctx.font = '48px Overpass';
            ctx.fillText('RAINBOW', w / 2, h /6 - tileHeight);
            ctx.fillText('RUN', w / 2, h / 6*1.5 - tileHeight);

            ctx.font = '32px Overpass';
            ctx.fillText('START', w / 2, h / 2 + tileHeight);
            ctx.restore();

            character.width = tileWidth / 2 * scaleNumber;
            if (startAnimate) {
                introStartAnimation();
            }
            else {
                playerX = w / 2 - xDistance * scaleNumber;
                playerY = h / 2 + yDistance * scaleNumber;
                displayPlayer(playerX, playerY);
            }

            canvas.addEventListener('click', startIntro, { once: true });

            if (Math.abs(towardsStart) >= Math.abs(w / 2 - introStartX) + 30) {
                introStatus = 'START';
                hopProgress = 0;
                pathCounter++;
            }
            // if ((Math.abs(playerX-introStartX)<=20)&& (Math.abs(playerY-introStartY)<=20)) introStatus = 'START';
            break;

        case 'START':
            introTiles[0].display();
            playerX = introStartX;
            playerY = introStartY;
            displayPlayer(playerX, playerY);
            if (pauseTime < hopInterval) pauseTime++;
            else {
                pauseTime = 0;
                introStatus = 'ONTILE';
            }
            break;
        case 'ONTILE':
            let curTile = introTiles[pathCounter];

            // fade in the current tile
            if (curTile.alpha < 0.8) curTile.alpha += 0.1;
            else {
                if (pauseTime < hopInterval) pauseTime++;
                else if (hopProgress < yDistance - 5) {
                    introHopAnimation();
                    curTile.alpha = Math.min(hopProgress / yDistance * (1 - 0.8) + curTile.alpha, 1);
                }
                else {
                    pauseTime = 0;
                    hopProgress = 0;
                    playerX = introTiles[pathCounter].x;
                    playerY = introTiles[pathCounter].y;
                    displayPlayer(playerX, playerY);
                    clickAudio.currentTime = 0;
                    clickAudio.play();
                    if (pathCounter === introTiles.length - 1) {
                        introStatus = 'READY';
                        startTileClr = map[0].tileClr;
                        startTileShadowClr = map[0].shadowClr;
                        startTile = new Tile(startTileClr, startTileShadowClr, 'any');
                    }
                    else if (pathCounter < 2) hopInterval -= 7;
                    else hopInterval = 0;

                    pathCounter++;
                }
            }
            ctx.save();
            ctx.globalAlpha = curTile.alpha;
            curTile.display();
            ctx.restore();

            // display past tiles
            if (pathCounter > 0) displayPastIntroTiles();
            break;

        case 'READY':
            if (startTile.alpha < 0.8) {
                startTile.alpha += 0.01;
                handImg.style.top = h / 2 - tileHeight / 3 + 'px';
                handImg.style.left = w / 2 - tileHeight / 3 + 'px';
                $("#handImg").fadeIn("fast");
            }


            ctx.save();
            ctx.globalAlpha = startTile.alpha;
            startTile.x = w / 2;
            startTile.y = h / 2;
            startTile.display();
            ctx.restore();

            // display past tiles
            displayPastIntroTiles();

            if (startTile.alpha > 0.05) {
                handImg.addEventListener('click', go, { once: true });
                canvas.addEventListener("click", go, { once: true });
            }
            break;

        case 'GO':
            if (hopProgress < yDistance - 5) {
                introHopAnimation();
                for (let i = 0; i < introTiles.length; i++) {
                    let t = introTiles[i];
                    if (t.alpha > alphaThreshold * 2) t.alpha = Math.max(0, t.alpha - 0.2);
                    else t.alpha = Math.max(0, t.alpha - 0.05);
                    ctx.save();
                    ctx.globalAlpha = t.alpha;
                    t.display();
                    ctx.restore();

                }
                ctx.globalAlpha = 0.9;
                startTile.display();
            }
            else {
                // cancelAnimationFrame(introRequest);
                gameStatus = 'GAME';
                mainLoop();
            }
            break;
    }

    if (gameStatus === 'INTRO') introRequest = requestAnimationFrame(introAnimationLoop);
}


function startIntro() {
    clickAudio.currentTime = 0;
    clickAudio.play();
    startAnimate = true;
}


function go() {
    introTiles.push(startTile);
    introStatus = 'GO';
    clickAudio.currentTime = 0;
    clickAudio.play();
    handImg.style.display = 'none';
}

function introHopAnimation() {

    hopProgress += transitionSpeed;
    // towards the next tile in the path
    if (introTiles[pathCounter].x > playerX) playerX += xPerY * transitionSpeed;
    else playerX -= xPerY * transitionSpeed;
    if (introTiles[pathCounter].y > playerY) playerY += transitionSpeed;
    else playerY -= transitionSpeed;

    // character jump animation
    if (hopProgress < yDistance / 2) playerY -= 5;
    else playerY += 4;

    displayPlayer(playerX, playerY);
}

function displayPastIntroTiles() {
    for (let i = 0; i < pathCounter; i++) {
        
        let t = introTiles[i];
        if (i === pathCounter - 1) t.alpha = 1;
        else if (t.alpha > alphaThreshold) t.alpha= Math.max(alphaThreshold, t.alpha - disappearingSpeed * 3);
        else {
            t.y +=5;
            t.alpha = Math.max(0, t.alpha - disappearingSpeed)
        }
       
        ctx.save();
        ctx.globalAlpha = t.alpha;
        t.display();
        ctx.restore();
    }
}