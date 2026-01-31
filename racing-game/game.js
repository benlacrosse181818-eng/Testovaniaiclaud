// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 700;

// HUD elements
const lapCountEl = document.getElementById('lap-count');
const lapTimeEl = document.getElementById('lap-time');
const bestTimeEl = document.getElementById('best-time');
const speedEl = document.getElementById('speed');
const messageEl = document.getElementById('message');

// Game state
const keys = {
    w: false,
    s: false,
    a: false,
    d: false
};

// Car properties
const car = {
    x: 500,
    y: 550,
    width: 40,
    height: 20,
    angle: -Math.PI / 2, // pointing up
    speed: 0,
    maxSpeed: 8,
    maxReverseSpeed: -3,
    acceleration: 0.15,
    brakeForce: 0.2,
    friction: 0.02,
    turnSpeed: 0.05
};

// Track definition - oval track with inner and outer boundaries
const track = {
    centerX: 500,
    centerY: 350,
    outerRadiusX: 420,
    outerRadiusY: 280,
    innerRadiusX: 250,
    innerRadiusY: 150,
    trackColor: '#3a3a4a',
    borderColor: '#ff4444',
    grassColor: '#2d4a2d'
};

// Checkpoint and timing
const checkpoint = {
    x: 480,
    y: 550,
    width: 40,
    height: 80,
    passed: false
};

const startFinish = {
    x: 480,
    y: 180,
    width: 40,
    height: 80
};

// Timing
let lapCount = 0;
let lapStartTime = 0;
let currentLapTime = 0;
let bestTime = Infinity;
let gameStarted = false;
let lastTimestamp = 0;

// Format time as MM:SS.mmm
function formatTime(ms) {
    if (ms === Infinity) return '--:--.---';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// Check if point is on track (between inner and outer ellipse)
function isOnTrack(x, y) {
    const dx = x - track.centerX;
    const dy = y - track.centerY;

    // Check outer boundary (must be inside)
    const outerDist = (dx * dx) / (track.outerRadiusX * track.outerRadiusX) +
                      (dy * dy) / (track.outerRadiusY * track.outerRadiusY);

    // Check inner boundary (must be outside)
    const innerDist = (dx * dx) / (track.innerRadiusX * track.innerRadiusX) +
                      (dy * dy) / (track.innerRadiusY * track.innerRadiusY);

    return outerDist <= 1 && innerDist >= 1;
}

// Get car corners for collision detection
function getCarCorners() {
    const cos = Math.cos(car.angle);
    const sin = Math.sin(car.angle);
    const hw = car.width / 2;
    const hh = car.height / 2;

    return [
        { x: car.x + cos * hw - sin * hh, y: car.y + sin * hw + cos * hh },
        { x: car.x + cos * hw + sin * hh, y: car.y + sin * hw - cos * hh },
        { x: car.x - cos * hw + sin * hh, y: car.y - sin * hw - cos * hh },
        { x: car.x - cos * hw - sin * hh, y: car.y - sin * hw + cos * hh }
    ];
}

// Check car collision with track boundaries
function checkCollision() {
    const corners = getCarCorners();
    for (const corner of corners) {
        if (!isOnTrack(corner.x, corner.y)) {
            return true;
        }
    }
    return false;
}

// Check if car passes through a line segment
function crossesLine(lineX, lineY, lineWidth, lineHeight) {
    const corners = getCarCorners();
    for (const corner of corners) {
        if (corner.x >= lineX && corner.x <= lineX + lineWidth &&
            corner.y >= lineY && corner.y <= lineY + lineHeight) {
            return true;
        }
    }
    return false;
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
        e.preventDefault();
    }
});

// Update car physics
function updateCar() {
    // Acceleration / Braking
    if (keys.w) {
        car.speed += car.acceleration;
        if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;
    }
    if (keys.s) {
        car.speed -= car.brakeForce;
        if (car.speed < car.maxReverseSpeed) car.speed = car.maxReverseSpeed;
    }

    // Friction
    if (!keys.w && !keys.s) {
        if (car.speed > 0) {
            car.speed -= car.friction;
            if (car.speed < 0) car.speed = 0;
        } else if (car.speed < 0) {
            car.speed += car.friction;
            if (car.speed > 0) car.speed = 0;
        }
    }

    // Turning (only when moving)
    if (Math.abs(car.speed) > 0.1) {
        const turnMultiplier = car.speed > 0 ? 1 : -1;
        if (keys.a) {
            car.angle -= car.turnSpeed * turnMultiplier * (Math.abs(car.speed) / car.maxSpeed);
        }
        if (keys.d) {
            car.angle += car.turnSpeed * turnMultiplier * (Math.abs(car.speed) / car.maxSpeed);
        }
    }

    // Calculate new position
    const newX = car.x + Math.cos(car.angle) * car.speed;
    const newY = car.y + Math.sin(car.angle) * car.speed;

    // Save old position
    const oldX = car.x;
    const oldY = car.y;

    // Update position
    car.x = newX;
    car.y = newY;

    // Check collision
    if (checkCollision()) {
        // Revert position and bounce back
        car.x = oldX;
        car.y = oldY;
        car.speed *= -0.6; // Reverse speed for bounce effect
    }
}

// Update timing and checkpoints
function updateTiming() {
    // Check checkpoint (halfway point)
    if (crossesLine(checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height)) {
        checkpoint.passed = true;
    }

    // Check start/finish line
    if (crossesLine(startFinish.x, startFinish.y, startFinish.width, startFinish.height)) {
        if (!gameStarted) {
            // First crossing - start the game
            gameStarted = true;
            lapStartTime = performance.now();
            lapCount = 0;
        } else if (checkpoint.passed) {
            // Completed a lap
            lapCount++;
            currentLapTime = performance.now() - lapStartTime;

            // Check for new best time
            let isNewRecord = false;
            if (currentLapTime < bestTime) {
                bestTime = currentLapTime;
                isNewRecord = true;
            }

            // Show lap completion message
            showMessage(`Kolo ${lapCount} dokončeno!<br>${formatTime(currentLapTime)}${isNewRecord ? '<div class="new-record">Nový rekord!</div>' : ''}`);

            // Reset for next lap
            lapStartTime = performance.now();
            checkpoint.passed = false;
        }
    }
}

// Show temporary message
function showMessage(text) {
    messageEl.innerHTML = text;
    messageEl.classList.remove('hidden');
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 2000);
}

// Draw track
function drawTrack() {
    // Draw grass background
    ctx.fillStyle = track.grassColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw outer track boundary
    ctx.fillStyle = track.trackColor;
    ctx.beginPath();
    ctx.ellipse(track.centerX, track.centerY, track.outerRadiusX, track.outerRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw inner grass (cut out)
    ctx.fillStyle = track.grassColor;
    ctx.beginPath();
    ctx.ellipse(track.centerX, track.centerY, track.innerRadiusX, track.innerRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw track borders
    ctx.strokeStyle = track.borderColor;
    ctx.lineWidth = 4;

    // Outer border
    ctx.beginPath();
    ctx.ellipse(track.centerX, track.centerY, track.outerRadiusX, track.outerRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner border
    ctx.beginPath();
    ctx.ellipse(track.centerX, track.centerY, track.innerRadiusX, track.innerRadiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw start/finish line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startFinish.x, startFinish.y, startFinish.width, 5);

    // Checkered pattern
    const squareSize = 8;
    for (let i = 0; i < startFinish.width / squareSize; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000';
        ctx.fillRect(startFinish.x + i * squareSize, startFinish.y, squareSize, 5);
    }

    // Draw checkpoint (subtle)
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.fillRect(checkpoint.x, checkpoint.y, checkpoint.width, 5);
}

// Draw car
function drawCar() {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);

    // Car body
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);

    // Front indicator (lighter orange)
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(car.width / 4, -car.height / 2, car.width / 4, car.height);

    // Windshield
    ctx.fillStyle = '#88ccff';
    ctx.fillRect(car.width / 8, -car.height / 3, car.width / 5, car.height / 1.5);

    // Wheels
    ctx.fillStyle = '#222';
    const wheelWidth = 6;
    const wheelHeight = 8;
    // Front wheels
    ctx.fillRect(car.width / 4, -car.height / 2 - 2, wheelWidth, wheelHeight);
    ctx.fillRect(car.width / 4, car.height / 2 - wheelHeight + 2, wheelWidth, wheelHeight);
    // Rear wheels
    ctx.fillRect(-car.width / 3, -car.height / 2 - 2, wheelWidth, wheelHeight);
    ctx.fillRect(-car.width / 3, car.height / 2 - wheelHeight + 2, wheelWidth, wheelHeight);

    ctx.restore();
}

// Update HUD
function updateHUD() {
    lapCountEl.textContent = lapCount;

    if (gameStarted) {
        const elapsed = performance.now() - lapStartTime;
        lapTimeEl.textContent = formatTime(elapsed);
    }

    bestTimeEl.textContent = formatTime(bestTime);

    // Convert speed to "km/h" (arbitrary scaling for display)
    const displaySpeed = Math.abs(Math.round(car.speed * 25));
    speedEl.textContent = displaySpeed;
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time (not used yet but useful for frame-independent physics)
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Update
    updateCar();
    updateTiming();

    // Render
    drawTrack();
    drawCar();
    updateHUD();

    // Next frame
    requestAnimationFrame(gameLoop);
}

// Start the game
requestAnimationFrame(gameLoop);
