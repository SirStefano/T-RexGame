import {startGame, collisionCheck, crouching, draw, jump, running, lose, playMusic, stopMusic, changeVolume} from "./JSComp/Draw.js";
let gameRun = false;
let isCrouching = false;
let bestScore = document.getElementById("bestScore");
let time = document.getElementById("time");
const startTime = Date.now();
let setButton = document.getElementById("setButton");
let stopButton = document.getElementById("stopMusic");
let volumeButton = document.getElementById("volume");

window.onload = animation();

window.setInterval(function(){
    let different = Math.abs(new Date() - startTime);
    let ms = different % 1000;
    different = (different - ms)/1000;
    let secs = different % 60;
    different = (different - secs) / 60;
    let mins = different % 60;
    let hrs = (different - mins) / 60;
    time.innerHTML = "Session time: "+(hrs+":"+mins+":"+secs);
}, 1000);

function gameStart(){
    gameRun = true;
    if(document.getElementById("easy").checked){
        startGame(0.5, 0.2);
    }else if(document.getElementById("medium").checked){
        startGame(1, 0.5);
    }else if(document.getElementById("hard").checked){
        startGame(1.5, 1);
    }
}

function animation(){
    if(gameRun && collisionCheck()){
        let bestS = lose();
        bestScore.innerHTML = "Best score: " + Math.floor(bestS);
        gameRun = false;
    }
    draw();
    requestAnimationFrame(animation);
}


window.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 32: //space
            if(gameRun){
                jump();
            }else{
                gameStart();
            }
            break;
        case 40: //down
            if(!isCrouching){
                crouching();
                isCrouching = true;
            }
            break;
    }
});

window.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 40: //down
            running();
            isCrouching = false;
            break;
    }
});

setButton.onclick = function (){
    let musicNum;
    if(document.getElementById("basic").checked){
        musicNum = 1;
    }else if(document.getElementById("arcade").checked){
        musicNum = 2;
    }else if(document.getElementById("calm").checked){
        musicNum = 3;
    }
    let volumeNumber = document.getElementById("volume").value;
    playMusic(musicNum, volumeNumber);
}

stopButton.onclick = function () {
    stopMusic();
}

volumeButton.onchange = function (){
    changeVolume(volumeButton.value);
}
volumeButton.addEventListener("keydown", function(){
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
    }
});

const radioButtons = document.querySelectorAll('input[type="radio"]');

radioButtons.forEach(function (radioButton) {
    radioButton.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
    });
});



