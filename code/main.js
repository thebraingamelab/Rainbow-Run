
let status;

window.onload = function () {
    // if (nColorsUpperLimit < nColors) alert("nColors exceeds its limit!");
    // if (nTurns > nTiles-2) alert("nTurns exceeds its limit!");
    init();
    mainLoop();
}


function init() {
    setUpPage();
    setUpGame();
}

function mainLoop() {
    if (mapView) {
        // mapViewFeedback();
        canvas.addEventListener("click", restart);
        if ((mode === 'ARROW') || (mode === 'GRIDARROW')) {
            let arrowImgs = document.getElementsByClassName("arrow");
            arrowImgWidth = tileWidth / 1.5;
            for (let i = 0; i < arrowImgs.length; i++) {
                arrowImgs[i].style.display = 'none';
            }

            character.style.opacity = 0;
            clearInterval(collapseDefault);
            setParaForMapView();

            mapLoop();
        }
        else {
            window.addEventListener("keydown", restart);
            canvas.addEventListener("click", updatePlayerPosition);
            window.addEventListener('resize', init, false);
            collapseDefault = setInterval(collapse, collapsingInterval);

            gameLoop();
        }
    }
}

