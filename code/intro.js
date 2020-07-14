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

    introStartX = w / 2 - xDisplacement * 3;
    introStartY = h / 2 - yDisplacement * 5;

    // first tile
    x = introStartX + xDisplacement;
    y = introStartY + yDisplacement;
    introTiles.push(new Tile(greyTileClr, greyShadowClr, 'any'));
    introTiles[introTiles.length - 1].x = x;
    introTiles[introTiles.length - 1].y = y;
    // second tile
    x += xDisplacement;
    y += yDisplacement;
    introTiles.push(new Tile(greyTileClr, greyShadowClr, 'any'));
    introTiles[introTiles.length - 1].x = x;
    introTiles[introTiles.length - 1].y = y;
    // third tile
    x -= xDisplacement;
    y += yDisplacement;
    introTiles.push(new Tile(greyTileClr, greyShadowClr, 'any'));
    introTiles[introTiles.length - 1].x = x;
    introTiles[introTiles.length - 1].y = y;
    // fourth tile
    x += xDisplacement;
    y += yDisplacement;
    introTiles.push(new Tile(greyTileClr, greyShadowClr, 'any'));
    introTiles[introTiles.length - 1].x = x;
    introTiles[introTiles.length - 1].y = y;
}


let introStatus = 'START';
let pathCounter = 0;
let hopProgress = 0;// along x-axis
let hopInterval = 30;
let pauseTime = 0;
let startTileClr, startTileShadowClr, startTile;

function introAnimationLoop() {
    ctx.clearRect(0 - xDistance, 0 - yDistance, w + xDistance * 2, h + yDistance * 2);
    drawGrid();
    switch (introStatus) {
        case 'START':
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
                    if (pathCounter === introTiles.length - 1) {
                        introStatus = 'READY';
                        startTileClr = map[0].tileClr;
                        startTileShadowClr = map[0].shadowClr;
                        startTile = new Tile(startTileClr, startTileShadowClr, 'any');
                    }
                    else if (pathCounter < 2) hopInterval -= 5;
                    else hopInterval = 10;

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

            if (startTile.alpha < 0.8) startTile.alpha += 0.01;
            ctx.save();
            ctx.globalAlpha = startTile.alpha;
            startTile.x = w / 2;
            startTile.y = h / 2;
            startTile.display();
            ctx.restore();

            // display past tiles
            displayPastIntroTiles();

            canvas.addEventListener("click", go, {once:true});
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

    if (gameStatus==='INTRO') introRequest = requestAnimationFrame(introAnimationLoop);
}

function go() {
    introTiles.push(startTile);
    introStatus = 'GO';
    // canvas.removeEventListener("click", go);
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
        else t.alpha = Math.max(alphaThreshold * 2, t.alpha - disappearingSpeed * 3);

        ctx.save();
        ctx.globalAlpha = t.alpha;
        t.display();
        ctx.restore();
    }
}