let angle = 0;
let jumpPeak, outroRotateAngle;
let reachedPeak = false;
function outroCharacterAnimation() {
    if (playerY >= h / 2 && reachedPeak) {
        playerY = h / 2;
    }
    else {
        if (!reachedPeak) playerY -= 5;
        else playerY += 5;
        if (h / 2 - playerY >= jumpPeak) reachedPeak = true;

        if (h / 2 - playerY> jumpPeak / 2) {
            angle += outroRotateAngle;
            character.style.transform = 'rotate(' + angle + 'deg)';
        }
        else character.style.transform = 'rotate(0deg)';
    }
    displayPlayer(playerX,playerY);
}