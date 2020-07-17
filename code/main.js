
let gameStatus;

function mainLoop() {
    switch (gameStatus) {
        case 'INTRO':
            buildIntroPath();
            introAnimationLoop();
            break;

        case 'GAME':
            window.addEventListener("keydown", restart);
            canvas.addEventListener("click", updatePlayerPosition);
            window.addEventListener('resize', init, false);
            gameLoop();
            break;

        case 'MAP':
            map[0].currentDisplay();
            for (let i = 1; i < map.length; i++) {
                map[i].nextDisplay();
            }

        case 'POSTGAME':
            // winText.style.display = "none";
            // cownImg.style.display = "none";
            // canvas.addEventListener("click", restart);
            //arrow
            // let arrowImgs = document.getElementsByClassName("arrow");
            // arrowImgWidth = tileWidth / 1.5;
            // for (let i = 0; i < arrowImgs.length; i++) arrowImgs[i].style.display = 'none';
            // character.style.opacity = 0;
            setParaForMapView();
            mapLoop();
            break;
    }
}
