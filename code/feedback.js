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
        lives[i].style.top = lifeImgWidth*0.6 + "px";
        lives[i].style.right = lifeImgWidth*0.6+ lifeImgWidth*1.5*i + "px";
        //console.log("life" + i + "'s right: " + lives[i].style.right);
    }
    for (; i<lifeMax; i++){
        lives[i].style.display = "none";
    }
}