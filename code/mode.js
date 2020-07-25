
function drawGrid() {
    let nTileOnEachSide = Math.floor(Math.max(w, h) / tileWidth / 2) + 2;
    ctx.save();
    for (let wid = w / 2 - xDistance * 2 * nTileOnEachSide; wid < w / 2 + xDistance * 2 * nTileOnEachSide; wid += xDistance * 2) {
        for (let hei = h / 2 - yDistance * 2 * nTileOnEachSide; hei < h / 2 + yDistance * 2 * nTileOnEachSide; hei += yDistance * 2) {
            ctx.strokeStyle = strokeClr;
            ctx.beginPath();
            ctx.moveTo(wid - tileWidth / 2, hei);
            ctx.lineTo(wid, hei - tileLength / 2);
            ctx.lineTo(wid + tileWidth / 2, hei);
            ctx.stroke();

            // tile left
            ctx.beginPath();
            ctx.moveTo(wid, hei + tileLength / 2);
            ctx.lineTo(wid - tileWidth / 2, hei);
            ctx.lineTo(wid - tileWidth / 2, hei + tileHeight);
            ctx.lineTo(wid, hei + tileLength / 2 + tileHeight);
            ctx.stroke();

            // tile right
            ctx.beginPath();
            ctx.moveTo(wid, hei + tileLength / 2);
            ctx.lineTo(wid, hei + tileHeight + tileLength / 2);
            ctx.lineTo(wid + tileWidth / 2, hei + tileHeight);
            ctx.lineTo(wid + tileWidth / 2, hei);
            ctx.closePath();
            ctx.stroke();
        }
    }
    for (let wid = (w / 2 - xDistance) - xDistance * 2 * nTileOnEachSide; wid < (w / 2 - xDistance) + xDistance * 2 * nTileOnEachSide; wid += xDistance * 2) {
        for (let hei = (h / 2 - yDistance) - yDistance * 2 * nTileOnEachSide; hei < (h / 2 - yDistance) + yDistance * 2 * nTileOnEachSide; hei += yDistance * 2) {
            ctx.strokeStyle = strokeClr;
            ctx.beginPath();
            ctx.moveTo(wid - tileWidth / 2, hei);
            ctx.lineTo(wid, hei - tileLength / 2);
            ctx.lineTo(wid + tileWidth / 2, hei);
            ctx.stroke();

            // tile left
            ctx.beginPath();
            ctx.moveTo(wid, hei + tileLength / 2);
            ctx.lineTo(wid - tileWidth / 2, hei);
            ctx.lineTo(wid - tileWidth / 2, hei + tileHeight);
            ctx.lineTo(wid, hei + tileLength / 2 + tileHeight);
            ctx.stroke();

            // tile right
            ctx.beginPath();
            ctx.moveTo(wid, hei + tileLength / 2);
            ctx.lineTo(wid, hei + tileHeight + tileLength / 2);
            ctx.lineTo(wid + tileWidth / 2, hei + tileHeight);
            ctx.lineTo(wid + tileWidth / 2, hei);
            ctx.closePath();
            ctx.stroke();
        }
    }
    ctx.restore();
}

function drawArrows() {
    for (let i = 0; i < arrows.length; i++) {
        // arrows[i].style.display = "initial";
        let arrowDirection = arrows[i].id;
        let distanceAdjustment = 1.3;
        switch (arrowDirection) {
            case 'TL':
                arrows[i].style.top = h / 2 - yDistance*distanceAdjustment + "px";
                arrows[i].style.left = w / 2 - xDistance*distanceAdjustment + "px";
                break;
            case 'TR':
                arrows[i].style.top = h / 2 - yDistance*distanceAdjustment + "px";
                arrows[i].style.right = w / 2 - xDistance*distanceAdjustment + "px";
                break;
            case 'BL':
                arrows[i].style.bottom = h / 2 - yDistance*distanceAdjustment*1.1 + "px";
                arrows[i].style.left = w / 2 - xDistance*distanceAdjustment + "px";
                break;
            case 'BR':
                arrows[i].style.bottom = h / 2 - yDistance*distanceAdjustment*1.1 + "px";
                arrows[i].style.right = w / 2 - xDistance*distanceAdjustment + "px";
                break;
        }
    }
}