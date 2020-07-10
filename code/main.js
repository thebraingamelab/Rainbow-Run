
let gameStatus;

function mainLoop() {
    switch (gameStatus) {
        case 'PREGAME':
            // tutorial?
            // animation

            gameStatus = 'GAME';
            mainLoop();
            break;

        case 'GAME':
            window.addEventListener("keydown", restart);
            canvas.addEventListener("click", updatePlayerPosition);
            window.addEventListener('resize', init, false);
            collapseDefault = setInterval(collapse, collapsingInterval);

            gameLoop();
            break;

        case 'POSTGAME':
            winText.style.display = "none";
            crownImg.style.display = "none";

            canvas.addEventListener("click", restart);

            //arrow
            let arrowImgs = document.getElementsByClassName("arrow");
            arrowImgWidth = tileWidth / 1.5;
            for (let i = 0; i < arrowImgs.length; i++) {
                arrowImgs[i].style.display = 'none';
            }

            character.style.opacity = 0;
            clearInterval(collapseDefault);
            setParaForMapView();

            mapLoop();
            break;
    }
}
