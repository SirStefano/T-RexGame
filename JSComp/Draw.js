let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const spriteCharacter = new Image();
spriteCharacter.onload = drawCharacter;
spriteCharacter.src = "./Assets/Images/mainCharacter/Dino.png";
const background = new Image();
background.src = "./Assets/Images/Terrain/Background/mountains.png";
const floor = new Image();
floor.src = "./Assets/Images/Terrain/Floor/snow.png";
const bat = new Image();
bat.src = "./Assets/Images/Enemy/bat.png";
const bear  = new Image();
bear.src = "./Assets/Images/Enemy/bear_polar.png";
const penguin = new Image();
penguin.src = "./Assets/Images/Enemy/penguin.png";
const keyBoard = new Image();
keyBoard.src = "./Assets/Images/UI/Keyboard.png";
const jumpAudio = new Audio("./Assets/Sounds/jumpSound.mp3");
const collisionAudio = new Audio("./Assets/Sounds/collisionSound.mp3");
const music1 = new Audio("./Assets/Sounds/music1.mp3");
const music2 = new Audio("./Assets/Sounds/music2.mp3");
const music3 = new Audio("./Assets/Sounds/music3.mp3");
let currentMusic = music1;
currentMusic.loop = true;
const achievementAudio = new Audio("./Assets/Sounds/achievementSound.mp3");

const width = canvas.width, height = canvas.height;
let startingImage = 0;
let animationStep = 0;
const step = 0.05;
let stepMax = 4;
let y = 0;
let isJumping = false;
let gravitySpeed = 0;
let gravity = 0.05;
let animationStepBackground = 0;
let animationStepFloor = 0;
let crouch = false;
let UIstep = 0;
let UIstepInfo = 0;
let UItext = "Press jump key to start";
let points = 0;
let bestS = 0;
let pointsTier = 50;
let status = 1;
let frames = 0;
let FPS = 60;
let correctionOfFPS = 1;

let generatingEnemy = false;

let jumpCounter = 0;

let speed = 0;
let speedStep = 0.5;

let enemyArray = [];

function speedCorection(){
    correctionOfFPS = (165/FPS).toFixed(2);
}

window.setInterval(updateFPS, 1000);
function draw(){
    speedCorection();
    frames++;
    ctx.clearRect(0, 0, width, height);
    animate();
    for(let i = 0; i<Math.floor(speed*correctionOfFPS);i++){
        jumpEngine();
    }
    jumpCounter += speed*correctionOfFPS - Math.floor(speed*correctionOfFPS);
    if(jumpCounter >= 1){
        jumpEngine();
        jumpCounter = 0;
    }
    drawMap();
    if(status === 1){
        drawStartScreen();
    }else if(status === 2){
        drawPlayAgain();
    }
    drawEnemy();
    drawCharacter();
    if(!generatingEnemy && speed>0){
        generatingEnemy = true;
        let x = Math.floor((Math.floor(Math.random() * 1000)+1000)/speed);
        setTimeout(function () {
                generatingEnemy = false;
                generateEnemy();
            }
        , x);
    }
    updatePoints();
}

function updateFPS(){
    FPS = frames;
    frames = 0;
}

function startGame(_speed, _speedStep){
    y = 0;
    jumpCounter = 0;
    isJumping = 0;
    enemyArray = [];
    points = 0;
    running();
    speed = _speed;
    speedStep = _speedStep;
    status = 3;
    pointsTier = 50;
}

function playMusic(newMusic, volumeLetter){
    currentMusic.pause();
    let changeMusic;
    if(newMusic == 1){
        changeMusic = music1;
    }else if(newMusic == 2){
        changeMusic = music2;
    }else{
        changeMusic = music3;
    }
    if(!(changeMusic===currentMusic)){
        currentMusic.currentTime = 0;
        currentMusic = changeMusic;
    }
    currentMusic.volume = volumeLetter/100;
    currentMusic.play();
}

function changeVolume(volumeLetter){
    currentMusic.volume = volumeLetter/100;
}

function stopMusic(){
    currentMusic.pause();
}

function lose(){
    if(bestS<points){
        bestS = points;
    }
    basicPose();
    speed = 0;
    status = 2;
    return bestS;
}

function collisionCheck(){
    for(let i = 0; i<enemyArray.length; ++i){
        if(enemyArray[i].x<width/2+enemyArray[i].startPointChange && enemyArray[i].x>width/2-enemyArray[i].eWidth){
            if(enemyArray[i].isFlying){
                if(!crouch){
                    collisionAudio.play();
                    return true;
                }
            }else{
                if(y<40){
                    collisionAudio.play();
                    return true;
                }
            }
            break;
        }
    }
}

function updatePoints(){
    points += speed*correctionOfFPS/20;
    if(points>pointsTier*2){
        achievementAudio.play();
        pointsTier = Math.floor(points);
        for(let i = 1; i<=5; ++i){
            setTimeout(function (){
                if(speed!==0){
                    speed += speedStep/5;
                }
            }, 200*i);
        }
    }
}

function drawStartScreen(){
    ctx.font = "24px Serif";
    ctx.fillStyle = "white";
    ctx.fillText("Jump", width/2-42, 330);
    ctx.fillText("Crouch", width/2+62, 330);
    ctx.font = "48px Serif";
    if(UIstepInfo>=30.99){
        UIstepInfo = 0;
    }else{
        UIstepInfo += 0.05*correctionOfFPS;
    }
    ctx.fillText(UItext.slice(0, Math.floor(UIstepInfo)), width/2-200, 100);
    if(UIstep>=1.99){
        UIstep = 0;
    }else{
        UIstep += 0.005*correctionOfFPS;
    }
    if(Math.floor(UIstep) === 0){
        ctx.drawImage(keyBoard, 80, 81, 80, 15, width/2-100, 340, 160, 30);
        ctx.drawImage(keyBoard, 192, 81, 16, 15, width/2+80, 340, 32, 30);
    }else{
        ctx.drawImage(keyBoard, 80, 178, 80, 15, width/2-100, 342, 160, 30);
        ctx.drawImage(keyBoard, 192, 178, 16, 15, width/2+80, 342, 32, 30);
    }
}

function drawCharacter(){
    ctx.drawImage(spriteCharacter, startingImage+Math.floor(animationStep)*24, 0, 24, 24, width/2-96/2, height/2+40-y, 96, 96);
}

function drawPlayAgain(){
    ctx.fillStyle = "#3fd0d4";
    ctx.strokeStyle = "#056467";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(width/2-300/2, 80, 300, 200, 20);
    ctx.fill();
    ctx.roundRect(width/2-300/2, 80, 300, 200, 20);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.font = "36px Serif";
    ctx.fillText("Good game", width/2-80, 150);
    ctx.font = "24px Serif";
    ctx.fillText("Your score:", width/2-50, 190);
    ctx.font = "20px Serif";
    ctx.fillText("Press spacebar to play again", width/2-115, 250);
    let pointsString = Math.floor(points).toString();
    for(let i = pointsString.length; i < 5; ++i){
        pointsString = "0" + pointsString;
    }
    ctx.fillText(pointsString, width/2-20, 220);
}

function drawMap(){
    ctx.fillStyle = '#87CEFA';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 600, width, 200);
    ctx.drawImage(background, 0-animationStepBackground, 0, width, height-200);
    ctx.drawImage(background, width-animationStepBackground, 0, width, height-200);
    for(let i = 0; i < 8; ++i){
        ctx.drawImage(floor, 50, 50, 50, 90, i*200-animationStepFloor, height/2+110, 200, 300);
    }
    ctx.font = "48px Serif";
    ctx.fillStyle = "white";
    let pointsString = Math.floor(points).toString();
    for(let i = pointsString.length; i < 5; ++i){
        pointsString = "0" + pointsString;
    }
    ctx.fillText(pointsString, 1140, 50);
    ctx.font = "24px Serif";
    ctx.fillText("FPS: "+FPS, 20, 40);
}

function drawEnemy(){
    if(enemyArray.length > 0 && enemyArray[0].x+50<0){
        enemyArray.shift();
    }
    if(enemyArray.length > 0){
        enemyArray.forEach(element => {
            if(element.type===0){
                ctx.drawImage(bat, 96-Math.floor(element.enemyStep)*32, 32, 32, 32, element.x, height/2+5, 80, 80);
            }else if(element.type===1){
                ctx.drawImage(bear, 96-Math.floor(element.enemyStep)*32, 32, 32, 32, element.x, height/2+50, 80, 80);
            }else if(element.type===2){
                ctx.drawImage(penguin, 96-Math.floor(element.enemyStep)*32, 0, 32, 32, element.x, height/2+45, 80, 80);
            }
            element.x -= 2 * speed * correctionOfFPS;
        });
    }
}

function animate(){
    if(animationStep >= stepMax-0.1){
        animationStep = 0;
    }else{
        animationStep += step*correctionOfFPS;
    }
    if(animationStepBackground >= width){
        animationStepBackground -= width;
    }
    animationStepBackground += speed*correctionOfFPS;
    if(animationStepFloor>=200){
        animationStepFloor -= 200;
    }
    animationStepFloor += speed*correctionOfFPS;
    if(enemyArray.length>0){
        enemyArray.forEach(element => {
            if(element.enemyStep >= element.enemyStepMax-0.1){
                element.enemyStep = 0;
            }else{
                element.enemyStep += step*correctionOfFPS;
            }
        });
    }
}

function jump(){
    if(!isJumping){
        jumpAudio.playbackRate = speed;
        jumpAudio.play();
        startingImage = 240;
        animationStep = 0;
        stepMax = 3;
        isJumping = true;
        crouch = false;
    }
}

function jumpEngine(){
    if(isJumping){
        gravitySpeed += gravity;
        y += 3-gravitySpeed;
        if(y<=0){
            y = 0;
            isJumping = false;
            gravitySpeed = 0;
            running();
        }
    }
}

function running(){
    startingImage = 96;
    animationStep = 0;
    stepMax = 6;
    crouch = false;
}

function crouching(){
    startingImage = 408;
    animationStep = 0;
    stepMax = 6;
    crouch = true;
}

function basicPose(){
    startingImage = 0;
    animationStep = 0;
    stepMax = 4;
}

function generateEnemy(){
    let type = Math.floor(Math.random() * 3);
    let enemy;
    if(type === 0) {
        enemy = new Enemy(type, width, true, 80, 4, 10);
    }else if(type === 1) {
        enemy = new Enemy(type, width, false, 80, 4, 0);
    }else{
        enemy = new Enemy(type, width, false, 70, 4, -15);
    }
    enemyArray.push(enemy);
}

class Enemy {
    type;
    x;
    isFlying;
    eWidth;
    enemyStepMax;
    enemyStep;
    startPointChange;
    constructor(type, x, isFlying, eWidth, enemyStepMax, startPointChange) {
        this.type = type;
        this.x = x;
        this.isFlying = isFlying;
        this.eWidth = eWidth;
        this.enemyStepMax = enemyStepMax;
        this.enemyStep = 0;
        this.startPointChange = startPointChange;
    }
}

export {draw, jump, running, crouching, collisionCheck, startGame, lose, playMusic, stopMusic, changeVolume};