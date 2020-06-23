function preShake() {
    ctx.save();
    let dx = Math.random() * tileHeight / 2;
    let dy = Math.random() * tileHeight / 2;
    ctx.translate(dx, dy);
}

function postShake() {
    ctx.restore();
}

function displayLife() {
    let i=0;
    for (i = 0; i < lifeLeft; i++) {
        // ctx.drawImage(lifeImg, w + heartInterval - (heartInterval + heartW) * i, heartH/4);
        lives[i].style.display = "initial";
        lives[i].style.right = (i*5+2) + "rem";
        //console.log("life" + i + "'s right: " + lives[i].style.right);
    }
    for (; i<lifeMax; i++){
        lives[i].style.display = "none";
    }
}