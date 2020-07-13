let introPath = [];
let introTiles = [];
let nHops = 2;
let introRequest;
function buildIntroPath() {
    let xDisplacement = xDistance;
    let yDisplacement = yDistance;

    // default: tiles from the left
    let firstDirection = map[1].relativePositionToLast;
    if (firstDirection === 'TL' || firstDirection === 'BL') xDisplacement *= -1;

    let x, y;
    if (w > h) { // landscape
        // character hops across 4 tiles:
        x = w / 2;
        y = h / 2 - yDistance * 2 * 3;
        for (let i = 0; i < nHops; i++) {
            introPath.push({ x: x, y: y });
            x -= xDisplacement;
            y += yDisplacement;
        }
        // first tile
        introPath.push({ x: x, y: y });
        // second tile
        x += xDisplacement;
        y += yDisplacement;
        introPath.push({ x: x, y: y });
        // third tile
        x += xDisplacement;
        y -= yDisplacement;
        introPath.push({ x: x, y: y });
        // fourth tile
        x += xDisplacement;
        y += yDisplacement;
        introPath.push({ x: x, y: y });
    }
    else { // portrait
        // character hops across 4 tiles:
        x = w / 2 + xDisplacement * 2;
        y = h / 2 - yDistance * 2 * 4;
        for (let i = 0; i < 4; i++) {
            introPath.push({ x: x, y: y });
            x -= xDisplacement;
            y += yDisplacement;
        }
        // first tile
        introPath.push({ x: x, y: y });
        // second tile
        x += xDisplacement;
        y += yDisplacement;
        introPath.push({ x: x, y: y });
        // third tile
        x -= xDisplacement;
        y += yDisplacement;
        introPath.push({ x: x, y: y });
        // fourth tile
        x += xDisplacement;
        y += yDisplacement;
        introPath.push({ x: x, y: y });
    }

    for (let i = nHops; i < introPath.length; i++) {
        let t = new Tile(greyTileClr, greyShadowClr, 'any');
        t.x = introPath[i].x;
        t.y = introPath[i].y;
        introTiles.push(t);
    }
}


let introStatus = 'START';
let pathCounter = 0;
let hopProgress = 0;// along x-axis
let hopInterval = 20;
let pauseTime = hopInterval;
function introAnimationLoop() {
    ctx.clearRect(0 - xDistance, 0 - yDistance, w + xDistance * 2, h + yDistance * 2);
    drawGrid();
    switch (introStatus) {
        case 'START':
            playerX = introPath[pathCounter].x;
            playerY = introPath[pathCounter].y;
            displayPlayer(playerX, playerY);
            introStatus = 'HOP';
            break;
        case 'HOP':
            if (pauseTime < hopInterval) pauseTime++;
            else if (hopProgress < yDistance - 5) {
                introHopAnimation();
            }
            // arrived at next tile
            else {
                pauseTime = 0;
                hopProgress = 0;
                pathCounter++;
                playerX = introPath[pathCounter].x;
                playerY = introPath[pathCounter].y;
                displayPlayer(playerX, playerY);
                if (pathCounter === nHops - 1) {
                    introStatus = 'ONTILE';
                    hopInterval += 15;
                }
                // clickAudio.currentTime = 0;
                // clickAudio.play();
            }
            break;
        case 'ONTILE':
            let curTile = introTiles[pathCounter - nHops + 1];

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
                    pathCounter++;
                    playerX = introPath[pathCounter].x;
                    playerY = introPath[pathCounter].y;
                    displayPlayer(playerX, playerY);

                    if (pathCounter === introPath.length - 1) {
                        introStatus = 'READY';
                    }
                    else if (pathCounter < 4) hopInterval -= 5;
                    else hopInterval = 10;
                }
            }
            ctx.save();
            ctx.globalAlpha = curTile.alpha;
            curTile.display();
            ctx.restore();

            // display past tiles
            displayPastIntroTiles();
            break;

        case 'READY':
            let startTile = map[0];
            if (startTile.alpha < 0.8) startTile.alpha += 0.01;
            ctx.save();
            ctx.globalAlpha = startTile.alpha;
            startTile.currentDisplay();
            ctx.restore();

            // display past tiles
            displayPastIntroTiles();

            canvas.addEventListener("click", function () {
                introPath.push(map[0]);
                map[0].x = w / 2;
                map[0].y = h / 2;
                introStatus = 'GO';
            });
            break;

        case 'GO':
            if (hopProgress < yDistance - 5) {
                introHopAnimation();
                for (let i = 0; i < introTiles.length; i++) {
                    let t = introTiles[i];
                    t.alpha = Math.max(0, t.alpha - disappearingSpeed * 3);
                    ctx.save();
                    ctx.globalAlpha = t.alpha;
                    t.display();
                    ctx.restore();
                }
                ctx.globalAlpha = 0.9;
                map[0].display();
            }
            else {
                map[0].x = 0;
                map[0].y = 0;
                cancelAnimationFrame(introRequest);
                gameStatus = 'GAME';
                mainLoop();
            }
            break;
    }


    introRequest = requestAnimationFrame(introAnimationLoop);
}


function introHopAnimation() {
    hopProgress += transitionSpeed;
    // towards the next tile in the path
    if (introPath[pathCounter + 1].x > introPath[pathCounter].x) playerX += xPerY * transitionSpeed;
    else playerX -= xPerY * transitionSpeed;
    if (introPath[pathCounter + 1].y > introPath[pathCounter].y) playerY += transitionSpeed;
    else playerY -= transitionSpeed;

    // character jump animation
    if (hopProgress < yDistance / 2) playerY -= 5;
    else playerY += 4;

    displayPlayer(playerX, playerY);
}

function displayPastIntroTiles() {
    for (let i = pathCounter - nHops; i >= 0; i--) {
        let t = introTiles[i];
        if (i === pathCounter - nHops) t.alpha = 1;
        else t.alpha = Math.max(alphaThreshold * 2, t.alpha - disappearingSpeed * 3);

        ctx.save();
        ctx.globalAlpha = t.alpha;
        t.display();
        ctx.restore();
    }
}