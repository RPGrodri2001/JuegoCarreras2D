// Variables del juego optimizadas
const gameState = {
    score: 0,
    highScore: localStorage.getItem('highScore') || 0,
    isGameOver: false,
    isGameStarted: false,
    gameSpeed: 5,
    carPosition: 50,
    carVerticalPosition: 30,
    currentLevel: 1,
    lastObstacleTime: 0,
    obstacleFrequency: 2000,
    roadLines: [],
    obstacles: [],
    keys: {},
    carColors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    sounds: {
        engine: new Audio('./sounds/engine.mp3'),
        crash: new Audio('./sounds/crash.mp3'),
        levelUp: new Audio('./sounds/level-up.mp3'),
        gameStart: new Audio('./sounds/game-start.mp3'),
        gameOver: new Audio('./sounds/game-over.mp3')
    }
};

// Elementos del DOM
const elements = {
    gameContainer: document.getElementById('gameContainer'),
    road: document.getElementById('road'),
    car: document.getElementById('car'),
    scoreBoard: document.getElementById('scoreBoard'),
    levelIndicator: document.getElementById('levelIndicator'),
    startScreen: document.getElementById('startScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    startButton: document.getElementById('startButton'),
    restartButton: document.getElementById('restartButton'),
    finalScore: document.getElementById('finalScore'),
    highScore: document.getElementById('highScore'),
    volumeControl: document.getElementById('volume'),
    soundToggle: document.getElementById('soundToggle'),
    orientationWarning: document.getElementById('orientationWarning'),
    mobileControls: {
        up: document.getElementById('upBtn'),
        down: document.getElementById('downBtn'),
        left: document.getElementById('leftBtn'),
        right: document.getElementById('rightBtn')
    }
};

// Configurar sonidos
gameState.sounds.engine.loop = true;
gameState.sounds.engine.volume = 0.3;
gameState.sounds.crash.volume = 0.5;
gameState.sounds.levelUp.volume = 0.7;
gameState.sounds.gameStart.volume = 0.7;
gameState.sounds.gameOver.volume = 0.7;

// Función para crear estructura del carro
function createCarStructure(element, color) {
    element.innerHTML = '';
    
    const parts = [
        { tag: 'div', className: 'car-body', style: { backgroundColor: color } },
        { tag: 'div', className: 'car-roof' },
        { tag: 'div', className: 'car-windshield' },
        { tag: 'div', className: 'car-rear-window' },
        { tag: 'div', className: 'car-headlights' },
        { tag: 'div', className: 'car-taillights' },
        { tag: 'div', className: 'car-wheel wheel-fl' },
        { tag: 'div', className: 'car-wheel wheel-fr' },
        { tag: 'div', className: 'car-wheel wheel-bl' },
        { tag: 'div', className: 'car-wheel wheel-br' }
    ];
    
    parts.forEach(part => {
        const el = document.createElement(part.tag);
        el.className = part.className;
        if (part.style) Object.assign(el.style, part.style);
        element.appendChild(el);
    });
}

// Función para reiniciar el estado del juego
function resetGameState() {
    gameState.score = 0;
    gameState.isGameOver = false;
    gameState.isGameStarted = false; // Añadido: resetear estado de inicio
    gameState.gameSpeed = 5;
    gameState.carPosition = 50;
    gameState.carVerticalPosition = 30;
    gameState.currentLevel = 1;
    gameState.obstacleFrequency = 2000;
    gameState.obstacles = [];
    gameState.roadLines = [];
    gameState.keys = {}; // Añadido: limpiar teclas presionadas
    
      // Limpiar obstáculos y líneas
      document.querySelectorAll('.obstacle, .roadLine').forEach(el => el.remove());
    
    // Actualizar UI
    elements.scoreBoard.textContent = `Puntuación: 0`;
    elements.levelIndicator.textContent = `Nivel: 1`;
    elements.finalScore.textContent = `0`;
    elements.highScore.textContent = gameState.highScore;
}

// Función para crear líneas de carretera
function createRoadLines() {
    const containerHeight = elements.gameContainer.clientHeight;
    const lineHeight = 40;
    const lineGap = 60;
    const numLines = Math.ceil(containerHeight / (lineHeight + lineGap)) + 1;

    for(let i = 0; i < numLines; i++) {
        const line = document.createElement('div');
        line.className = 'roadLine';
        line.style.top = `${i * (lineHeight + lineGap)}px`;
        elements.road.appendChild(line);
        gameState.roadLines.push({
            element: line,
            position: i * (lineHeight + lineGap)
        });
    }
}

// Función para actualizar líneas de carretera
function updateRoadLines() {
    const containerHeight = elements.gameContainer.clientHeight;
    
    gameState.roadLines.forEach(line => {
        line.position += gameState.gameSpeed;
        
        if (line.position > containerHeight) {
            line.position = -40;
        }
        
        line.element.style.top = `${line.position}px`;
    });
}

// Función para crear obstáculos
function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    
    const horizontalPos = 5 + Math.random() * 90;
    obstacle.style.left = `${horizontalPos}%`;
    obstacle.style.top = '-70px';
    
    const randomColor = gameState.carColors[Math.floor(Math.random() * gameState.carColors.length)];
    createCarStructure(obstacle, randomColor);
    
    elements.road.appendChild(obstacle);
    gameState.obstacles.push({
        element: obstacle,
        position: -70,
        horizontalPos: horizontalPos
    });
}

// Función para actualizar obstáculos
function updateObstacles() {
    const containerHeight = elements.gameContainer.clientHeight;
    
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obs = gameState.obstacles[i];
        obs.position += gameState.gameSpeed;
        obs.element.style.top = `${obs.position}px`;
        
        if (checkCollision(elements.car, obs.element)) {
            gameOver();
            return;
        }
        
        if (obs.position > containerHeight) {
            obs.element.remove();
            gameState.obstacles.splice(i, 1);
        }
    }
}

// Función para verificar colisiones
function checkCollision(car, obstacle) {
    const carRect = car.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    
    const collision = !(
        carRect.right - 5 < obstacleRect.left + 5 ||
        carRect.left + 5 > obstacleRect.right - 5 ||
        carRect.bottom - 5 < obstacleRect.top + 5 ||
        carRect.top + 5 > obstacleRect.bottom - 5
    );
    
    return collision;
}

// Función para actualizar nivel
function updateLevel() {
    const newLevel = Math.floor(gameState.score / 1000) + 1;
    
    if (newLevel > gameState.currentLevel) {
        gameState.currentLevel = newLevel;
        gameState.gameSpeed += 1;
        gameState.obstacleFrequency = Math.max(500, gameState.obstacleFrequency - 300);
        
        elements.levelIndicator.textContent = `Nivel: ${gameState.currentLevel}`;
        elements.levelIndicator.classList.add('level-up');
        
        if (soundEnabled) {
            gameState.sounds.levelUp.play();
            setTimeout(() => {
                gameState.sounds.levelUp.pause();
                gameState.sounds.levelUp.currentTime = 0;
            }, 2000);
        }
        
        setTimeout(() => {
            elements.levelIndicator.classList.remove('level-up');
        }, 1000);
    }
}

// Función de Game Over
function gameOver() {
    gameState.isGameOver = true;
    gameState.isGameStarted = false; // Añadido: marcar juego como no iniciado
    
    // Actualizar high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }
    
    elements.finalScore.textContent = gameState.score;
    elements.highScore.textContent = gameState.highScore;
    elements.gameOverScreen.style.display = 'flex';
    
    // Sonidos
    if (soundEnabled) {
        gameState.sounds.engine.pause();
        gameState.sounds.engine.currentTime = 0;
        gameState.sounds.crash.play();
        setTimeout(() => {
            gameState.sounds.gameOver.play();
        }, 500);
    }
    
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
}

// Función de inicio del juego
function startGame() {
    // Cancelar cualquier game loop existente
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    resetGameState();
    gameState.isGameStarted = true;
    
    elements.startScreen.style.display = 'none';
    elements.gameOverScreen.style.display = 'none';
    
    createRoadLines();
    createCarStructure(elements.car, 'red');
    gameState.lastObstacleTime = Date.now();
    
    // Posicionar carro
    elements.car.style.left = `${gameState.carPosition}%`;
    elements.car.style.bottom = `${gameState.carVerticalPosition}%`;
    
    // Sonido de inicio
    if (soundEnabled) {
        gameState.sounds.gameStart.play();
        setTimeout(() => {
            gameState.sounds.engine.play();
        }, 1000);
    }
    
    lastFrameTime = performance.now();
    gameLoopId = requestAnimationFrame(gameLoop);
}


// Variables para el game loop
let gameLoopId = null;
let lastFrameTime = 0;
const frameRate = 60;
const frameInterval = 1000 / frameRate;
let soundEnabled = true;

// Bucle principal del juego
function gameLoop(timestamp) {
    if (!gameState.isGameStarted || gameState.isGameOver) return;
    
    if (timestamp - lastFrameTime >= frameInterval) {
        updateGame();
        lastFrameTime = timestamp;
    }
    
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Función para actualizar el juego
function updateGame() {
    // Movimiento del carro
    if (gameState.keys['ArrowLeft'] && gameState.carPosition > 5) {
        gameState.carPosition -= 2;
    }
    if (gameState.keys['ArrowRight'] && gameState.carPosition < 95) {
        gameState.carPosition += 2;
    }
 // Controles invertidos aquí:
 if (gameState.keys['ArrowUp'] && gameState.carVerticalPosition < 80) {  // Flecha arriba ahora baja
    gameState.carVerticalPosition += 1.5;
}
if (gameState.keys['ArrowDown'] && gameState.carVerticalPosition > 5) {  // Flecha abajo ahora sube
    gameState.carVerticalPosition -= 1.5;
}
    
    elements.car.style.left = `${gameState.carPosition}%`;
    elements.car.style.bottom = `${gameState.carVerticalPosition}%`;
    
    // Actualizar puntuación
    gameState.score += Math.floor(gameState.gameSpeed);
    elements.scoreBoard.textContent = `Puntuación: ${gameState.score}`;
    
    // Actualizar nivel
    updateLevel();
    
    // Generar obstáculos
    const currentTime = Date.now();
    if (currentTime - gameState.lastObstacleTime > gameState.obstacleFrequency) {
        createObstacle();
        gameState.lastObstacleTime = currentTime;
    }
    
    // Actualizar elementos del juego
    updateRoadLines();
    updateObstacles();
}

// Función para verificar orientación
function checkOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight && window.innerWidth <= 768;
    elements.orientationWarning.style.display = isLandscape ? 'flex' : 'none';
    elements.gameContainer.style.display = isLandscape ? 'none' : 'block';
    
    if (isLandscape && gameState.isGameStarted && !gameState.isGameOver) {
        gameOver();
    }
}

// Función para alternar sonido
function toggleSound() {
    soundEnabled = !soundEnabled;
    elements.soundToggle.classList.toggle('sound-enabled');
    elements.soundToggle.classList.toggle('sound-disabled');
    
    if (soundEnabled) {
        if (gameState.isGameStarted && !gameState.isGameOver) {
            gameState.sounds.engine.play();
        }
        elements.soundToggle.style.transform = 'scale(1.1)';
        setTimeout(() => {
            elements.soundToggle.style.transform = 'scale(1)';
        }, 200);
    } else {
        gameState.sounds.engine.pause();
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botones de inicio/reinicio
    elements.startButton.addEventListener('click', startGame);
    elements.restartButton.addEventListener('click', startGame);
    
    // Controles de teclado
    document.addEventListener('keydown', (e) => {
        gameState.keys[e.key] = true;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        gameState.keys[e.key] = false;
    });
    
    // Controles táctiles
    if (elements.mobileControls.up) {
        elements.mobileControls.up.addEventListener('touchstart', () => gameState.keys['ArrowUp'] = true);
        elements.mobileControls.up.addEventListener('touchend', () => gameState.keys['ArrowUp'] = false);
        elements.mobileControls.down.addEventListener('touchstart', () => gameState.keys['ArrowDown'] = true);
        elements.mobileControls.down.addEventListener('touchend', () => gameState.keys['ArrowDown'] = false);
        elements.mobileControls.left.addEventListener('touchstart', () => gameState.keys['ArrowLeft'] = true);
        elements.mobileControls.left.addEventListener('touchend', () => gameState.keys['ArrowLeft'] = false);
        elements.mobileControls.right.addEventListener('touchstart', () => gameState.keys['ArrowRight'] = true);
        elements.mobileControls.right.addEventListener('touchend', () => gameState.keys['ArrowRight'] = false);
        
        // Prevenir scroll no deseado
        [elements.mobileControls.up, elements.mobileControls.down, 
         elements.mobileControls.left, elements.mobileControls.right].forEach(btn => {
            btn.addEventListener('touchmove', (e) => e.preventDefault());
        });
    }
    
    // Control de sonido
    elements.soundToggle.addEventListener('click', toggleSound);
    
    // Control de volumen
    elements.volumeControl.addEventListener('input', function() {
        const volume = parseFloat(this.value);
        for (const sound in gameState.sounds) {
            gameState.sounds[sound].volume = volume;
        }
    });
    
    // Verificar orientación al cambiar tamaño
    window.addEventListener('resize', checkOrientation);
}

// Inicializar el juego
setupEventListeners();
checkOrientation();
