// GAME STATE
let gameStarted = false;
let timerStarted = false;
let currentScore = 0;
let timeLeft = 10;
let timerInterval = null;
let pointCounterInterval = null;
let currentPointValue = 10;
let blackTiles = [];
let gameOver = false;

// DOM ELEMENTS
const coverPage = document.getElementById('coverPage');
const countdownPage = document.getElementById('countdownPage');
const countdownText = document.getElementById('countdownText');
const gamePage = document.getElementById('gamePage');
const gameBoard = document.getElementById('gameBoard');
const tapMessage = document.getElementById('tapMessage');
const hiScoreDisplay = document.getElementById('hiScore');
const currentScoreDisplay = document.getElementById('currentScore');
const timeDisplay = document.getElementById('timeDisplay');
const pointBarFill = document.getElementById('pointBarFill');
const playAgainMsg = document.getElementById('playAgain');
const newHiscoreMessage = document.getElementById('newHiscoreMessage');
const timeUpMessage = document.getElementById('timeUpMessage');

// LOAD HIGH SCORE
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
hiScoreDisplay.textContent = highScore;

// COVER PAGE CLICK
coverPage.addEventListener('click', startCountdown);

function startCountdown() {
    coverPage.style.display = 'none';
    countdownPage.style.display = 'flex';
    
    let count = 3;
    countdownText.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.textContent = count;
        } else {
            clearInterval(countdownInterval);
            startGame();
        }
    }, 1000);
}

function startGame() {
    countdownPage.style.display = 'none';
    gamePage.style.display = 'block';
    
    // Create 4x4 grid
    for (let i = 0; i < 16; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.index = i;
        tile.addEventListener('click', handleTileClick);
        gameBoard.appendChild(tile);
    }
    
    // Place 3 initial black tiles
    placeBlackTiles(3);
    gameStarted = true;
}

function placeBlackTiles(count) {
    const tiles = Array.from(gameBoard.children);
    const availableTiles = tiles.filter(tile => !tile.classList.contains('black') && !tile.classList.contains('green'));
    
    for (let i = 0; i < count && availableTiles.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableTiles.length);
        const tile = availableTiles[randomIndex];
        tile.classList.add('black');
        blackTiles.push(tile);
        availableTiles.splice(randomIndex, 1);
    }
}

function handleTileClick(e) {
    if (gameOver) return;
    
    const tile = e.currentTarget;
    
    // Start timer on first black tile click
    if (!timerStarted && tile.classList.contains('black')) {
        timerStarted = true;
        tapMessage.classList.add('fade-out');
        startTimer();
        startPointCounter();
    }
    
    // Only process black tiles
    if (!tile.classList.contains('black')) return;
    
    // Award points based on current point value
    const points = currentPointValue;
    currentScore += points;
    currentScoreDisplay.textContent = currentScore;
    
    // Show points on tile
    const pointsSpan = document.createElement('span');
    pointsSpan.className = 'tile-points show';
    pointsSpan.textContent = `+${points}`;
    tile.appendChild(pointsSpan);
    
    // Turn tile green
    tile.classList.remove('black');
    tile.classList.add('green');
    
    // Remove from blackTiles array
    const index = blackTiles.indexOf(tile);
    if (index > -1) {
        blackTiles.splice(index, 1);
    }
    
    // Fade to white after a short delay
    setTimeout(() => {
        tile.classList.remove('green');
    }, 300);
    
    // Add new black tile at different position
    placeBlackTiles(1);
    
    // Restart point counter for new tile
    startPointCounter();
}

function startPointCounter() {
    // Clear any existing counter
    if (pointCounterInterval) {
        clearInterval(pointCounterInterval);
    }
    
    // Reset bar to full and point value to 10
    currentPointValue = 10;
    pointBarFill.style.transition = 'none';
    pointBarFill.style.width = '100%';
    
    // Force reflow to ensure the transition reset takes effect
    pointBarFill.offsetHeight;
    
    // Start transition to shrink bar over 1 second
    setTimeout(() => {
        pointBarFill.style.transition = 'width 1s linear';
        pointBarFill.style.width = '0%';
    }, 10);
    
    // Start counting down points every 100ms
    pointCounterInterval = setInterval(() => {
        currentPointValue = Math.max(0, currentPointValue - 1);
        
        if (currentPointValue === 0) {
            clearInterval(pointCounterInterval);
        }
    }, 100);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameOver = true;
    clearInterval(timerInterval);
    if (pointCounterInterval) {
        clearInterval(pointCounterInterval);
    }
    
    // Disable all tiles
    const tiles = Array.from(gameBoard.children);
    tiles.forEach(tile => {
        tile.style.pointerEvents = 'none';
    });
    
    // Check for new high score
    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem('highScore', highScore);
        hiScoreDisplay.textContent = highScore;
        
        // Show confetti
        if (typeof confetti !== 'undefined') {
            const duration = 3000;
            const end = Date.now() + duration;
            
            (function frame() {
                confetti({
                    particleCount: 10,
                    angle: 60,
                    spread: 70,
                    origin: { x: 0, y: 0.6 }
                });
                confetti({
                    particleCount: 10,
                    angle: 120,
                    spread: 70,
                    origin: { x: 1, y: 0.6 }
                });
                
                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
        
        // Show new high score message
        newHiscoreMessage.style.display = 'block';
    } else {
        // Show time is up message
        timeUpMessage.style.display = 'block';
    }
    
    // Show play again message
    playAgainMsg.style.display = 'block';
}

