function initNeonBreakerGame(container) {
    container.innerHTML = `
        <h2>Neon Breaker</h2>
        <canvas id="neonBreakerCanvas" width="600" height="400"></canvas>
        <p>Score: <span id="neonScore">0</span></p>
    `;

    const canvas = document.getElementById('neonBreakerCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('neonScore');

    let score = 0;
    const paddleHeight = 15;
    const paddleWidth = 120;
    let paddleX = (canvas.width - paddleWidth) / 2;
    const ballRadius = 8;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;
    let ballSpeedX = 3;
    let ballSpeedY = -3;
    const brickRowCount = 4;
    const brickColumnCount = 7;
    const brickWidth = 80;
    const brickHeight = 25;
    const brickPadding = 15;
    const brickOffsetTop = 40;
    const brickOffsetLeft = 40;

    const bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#00FFFF';
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = '#FF00FF';
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = `hsl(${c * 45 + r * 20}, 100%, 50%)`;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                        ballSpeedY = -ballSpeedY;
                        b.status = 0;
                        score++;
                        scoreElement.textContent = score;
                    }
                }
            }
        }
    }

    function movePaddle(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();

        if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
            ballSpeedX = -ballSpeedX;
        }
        if (ballY + ballSpeedY < ballRadius) {
            ballSpeedY = -ballSpeedY;
        } else if (ballY + ballSpeedY > canvas.height - ballRadius) {
            if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                ballSpeedY = -ballSpeedY;
                ballSpeedX = 8 * ((ballX - (paddleX + paddleWidth / 2)) / paddleWidth);
            } else {
                // Game over logic here
                document.location.reload();
            }
        }

        ballX += ballSpeedX;
        ballY += ballSpeedY;
    }

    canvas.addEventListener('mousemove', movePaddle);
    const gameInterval = setInterval(gameLoop, 1000 / 60); // 60 fps

    return {
        cleanup: function() {
            clearInterval(gameInterval);
            canvas.removeEventListener('mousemove', movePaddle);
        }
    };
}

function initNeonJumperGame(container) {
    container.innerHTML = `
        <h2>Neon Jumper</h2>
        <canvas id="neonJumperCanvas" width="600" height="400"></canvas>
        <p>Score: <span id="jumperScore">0</span></p>
    `;

    const canvas = document.getElementById('neonJumperCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('jumperScore');

    let score = 0;
    let gameLoop;
    let gameSpeed = 5;

    const player = {
        x: 50,
        y: 200,
        width: 30,
        height: 30,
        speed: 5,
        jumpForce: 12,
        velocityY: 0,
        isJumping: false
    };

    const gravity = 0.6;
    let platforms = [];
    let obstacles = [];
    let coins = [];

    const colors = {
        background: '#000033',
        player: '#00FFFF',
        platform: '#FF00FF',
        obstacle: '#FF3333',
        coin: '#FFFF00'
    };

    function generateLevel() {
        platforms = [
            { x: 0, y: 350, width: 600, height: 50 }
        ];

        for (let i = 0; i < 10; i++) {
            platforms.push({
                x: Math.random() * 1800 + 600,
                y: Math.random() * 200 + 150,
                width: Math.random() * 100 + 50,
                height: 20
            });
        }

        for (let i = 0; i < 5; i++) {
            obstacles.push({
                x: Math.random() * 1800 + 600,
                y: 330,
                width: 20,
                height: 20
            });
        }

        for (let i = 0; i < 20; i++) {
            coins.push({
                x: Math.random() * 2400,
                y: Math.random() * 300 + 50,
                radius: 8,
                collected: false
            });
        }
    }

    function drawPlayer() {
        ctx.fillStyle = colors.player;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawPlatforms() {
        ctx.fillStyle = colors.platform;
        platforms.forEach(platform => {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });
    }

    function drawObstacles() {
        ctx.fillStyle = colors.obstacle;
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    function drawCoins() {
        ctx.fillStyle = colors.coin;
        coins.forEach(coin => {
            if (!coin.collected) {
                ctx.beginPath();
                ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    function updatePlayer() {
        player.velocityY += gravity;
        player.y += player.velocityY;

        if (player.y + player.height > canvas.height) {
            player.y = canvas.height - player.height;
            player.velocityY = 0;
            player.isJumping = false;
        }

        platforms.forEach(platform => {
            if (
                player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y + player.height > platform.y &&
                player.y + player.height < platform.y + platform.height &&
                player.velocityY > 0
            ) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
            }
        });
    }

    function updateObstacles() {
        obstacles.forEach(obstacle => {
            obstacle.x -= gameSpeed;
            if (obstacle.x + obstacle.width < 0) {
                obstacle.x = canvas.width + Math.random() * 500;
            }

            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                gameOver();
            }
        });
    }

    function updateCoins() {
        coins.forEach(coin => {
            coin.x -= gameSpeed;
            if (coin.x + coin.radius < 0) {
                coin.x = canvas.width + Math.random() * 500;
                coin.y = Math.random() * 300 + 50;
                coin.collected = false;
            }

            if (
                !coin.collected &&
                player.x < coin.x + coin.radius &&
                player.x + player.width > coin.x - coin.radius &&
                player.y < coin.y + coin.radius &&
                player.y + player.height > coin.y - coin.radius
            ) {
                coin.collected = true;
                score++;
                scoreElement.textContent = score;
            }
        });
    }

    function gameOver() {
        clearInterval(gameLoop);
        alert(`Game Over! Your score: ${score}`);
        score = 0;
        scoreElement.textContent = score;
        generateLevel();
        player.x = 50;
        player.y = 200;
        gameLoop = setInterval(update, 1000 / 60);
    }

    function update() {
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        platforms.forEach(platform => {
            platform.x -= gameSpeed;
            if (platform.x + platform.width < 0) {
                platform.x = canvas.width + Math.random() * 300;
            }
        });

        updatePlayer();
        updateObstacles();
        updateCoins();

        drawPlatforms();
        drawObstacles();
        drawCoins();
        drawPlayer();
    }

    function jump() {
        if (!player.isJumping) {
            player.velocityY = -player.jumpForce;
            player.isJumping = true;
        }
    }

    function handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp':
            case ' ':
                jump();
                break;
            case 'ArrowLeft':
                player.x -= player.speed;
                break;
            case 'ArrowRight':
                player.x += player.speed;
                break;
        }
    }

    generateLevel();
    document.addEventListener('keydown', handleKeyDown);
    gameLoop = setInterval(update, 1000 / 60);

    return {
        cleanup: function() {
            clearInterval(gameLoop);
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
}

function initStickQuestGame(container) {
    container.innerHTML = `
        <h2>Stick Quest</h2>
        <canvas id="stickQuestCanvas" width="600" height="400"></canvas>
        <p>Inventory: <span id="inventory"></span></p>
    `;

    const canvas = document.getElementById('stickQuestCanvas');
    const ctx = canvas.getContext('2d');
    const inventoryElement = document.getElementById('inventory');

    const TILE_SIZE = 40;
    const GRID_WIDTH = 15;
    const GRID_HEIGHT = 10;

    let player = { x: 1, y: 1, inventory: [] };
    let gameMap = [];
    let currentRoom = 0;

    const rooms = [
        {
            map: [
                "###############",
                "#P.............#",
                "#.###.........#",
                "#...#.........#",
                "#...#....K....#",
                "#...#.........#",
                "#...##########",
                "#............D#",
                "#.............#",
                "###############"
            ],
            items: [{ x: 10, y: 4, type: 'key', collected: false }]
        },
        {
            map: [
                "###############",
                "#D............#",
                "#.............#",
                "#....##.##....#",
                "#....#...#....#",
                "#....#.T.#....#",
                "#....#...#....#",
                "#....##.##....#",
                "#.............#",
                "###############"
            ],
            items: [{ x: 7, y: 5, type: 'treasure', collected: false }]
        }
    ];

    function drawStickFigure(x, y) {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        // Head
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 4, TILE_SIZE / 6, 0, Math.PI * 2);
        // Body
        ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE / 3);
        ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE * 2 / 3);
        // Arms
        ctx.moveTo(x + TILE_SIZE / 4, y + TILE_SIZE / 2);
        ctx.lineTo(x + TILE_SIZE * 3 / 4, y + TILE_SIZE / 2);
        // Legs
        ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE * 2 / 3);
        ctx.lineTo(x + TILE_SIZE / 4, y + TILE_SIZE);
        ctx.moveTo(x + TILE_SIZE / 2, y + TILE_SIZE * 2 / 3);
        ctx.lineTo(x + TILE_SIZE * 3 / 4, y + TILE_SIZE);
        ctx.stroke();
    }

    function drawMap() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                switch (gameMap[y][x]) {
                    case '#':
                        ctx.fillStyle = 'gray';
                        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        break;
                    case 'D':
                        ctx.fillStyle = 'brown';
                        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                        break;
                    case 'K':
                        ctx.fillStyle = 'yellow';
                        ctx.fillRect(x * TILE_SIZE + TILE_SIZE / 4, y * TILE_SIZE + TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2);
                        break;
                    case 'T':
                        ctx.fillStyle = 'gold';
                        ctx.fillRect(x * TILE_SIZE + TILE_SIZE / 4, y * TILE_SIZE + TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2);
                        break;
                }
            }
        }
        drawStickFigure(player.x * TILE_SIZE, player.y * TILE_SIZE);
    }

    function loadRoom(roomIndex) {
        currentRoom = roomIndex;
        gameMap = rooms[roomIndex].map.map(row => row.split(''));
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (gameMap[y][x] === 'P') {
                    player.x = x;
                    player.y = y;
                    gameMap[y][x] = '.';
                    return;
                }
            }
        }
    }

    function movePlayer(dx, dy) {
        const newX = player.x + dx;
        const newY = player.y + dy;

        if (newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT) {
            switch (gameMap[newY][newX]) {
                case '.':
                    player.x = newX;
                    player.y = newY;
                    break;
                case 'D':
                    if (player.inventory.includes('key')) {
                        loadRoom((currentRoom + 1) % rooms.length);
                    } else {
                        alert("You need a key to open this door!");
                    }
                    break;
                case 'K':
                    player.inventory.push('key');
                    gameMap[newY][newX] = '.';
                    updateInventory();
                    break;
                case 'T':
                    player.inventory.push('treasure');
                    gameMap[newY][newX] = '.';
                    updateInventory();
                    alert("Congratulations! You found the treasure and won the game!");
                    resetGame();
                    break;
            }
        }
        drawMap();
    }

    function updateInventory() {
        inventoryElement.textContent = player.inventory.join(', ');
    }

    function resetGame() {
        player.inventory = [];
        updateInventory();
        loadRoom(0);
    }

    function handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowUp':
                movePlayer(0, -1);
                break;
            case 'ArrowDown':
                movePlayer(0, 1);
                break;
            case 'ArrowLeft':
                movePlayer(-1, 0);
                break;
            case 'ArrowRight':
                movePlayer(1, 0);
                break;
        }
    }

    // Add event listener for keydown events
    document.addEventListener('keydown', handleKeyPress);

    // Initial game setup
    loadRoom(0);
    drawMap();
    updateInventory();

    // Return cleanup function
    return {
        cleanup: function() {
            document.removeEventListener('keydown', handleKeyPress);
        }
    };
}

function initCosmicKiwiChaosGame(container) {
    container.innerHTML = `
        <h2>Cosmic Kiwi Chaos</h2>
        <canvas id="kiwiChaosCanvas" width="600" height="400"></canvas>
        <p>Score: <span id="kiwiScore">0</span> | Pineapple Ammo: <span id="kiwiAmmo">50</span></p>
    `;

    const canvas = document.getElementById('kiwiChaosCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('kiwiScore');
    const ammoElement = document.getElementById('kiwiAmmo');

    let score = 0;
    let ammo = 50;
    let gameLoop;
    let spawnInterval;

    const kiwi = {
        x: 300,
        y: 350,
        size: 40,
        speed: 5
    };

    let pineapples = [];
    let eggplants = [];
    let blackHoles = [];

    function drawKiwi() {
        ctx.fillStyle = 'brown';
        ctx.beginPath();
        ctx.ellipse(kiwi.x, kiwi.y, kiwi.size / 2, kiwi.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.ellipse(kiwi.x, kiwi.y - kiwi.size / 4, kiwi.size / 3, kiwi.size / 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawPineapple(p) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 10);
        ctx.lineTo(p.x - 5, p.y);
        ctx.lineTo(p.x + 5, p.y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'green';
        ctx.fillRect(p.x - 2, p.y - 15, 4, 5);
    }

    function drawEggplant(e) {
        ctx.fillStyle = 'purple';
        ctx.beginPath();
        ctx.ellipse(e.x, e.y, 15, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'green';
        ctx.fillRect(e.x - 2, e.y - 25, 4, 5);
    }

    function drawBlackHole(bh) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, bh.size * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }

    function updateGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw stars
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = 'white';
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                1,
                1
            );
        }

        drawKiwi();

        pineapples.forEach((p, index) => {
            p.y -= 5;
            drawPineapple(p);
            if (p.y < 0) pineapples.splice(index, 1);
        });

        eggplants.forEach((e, eIndex) => {
            e.y += 2;
            e.x += Math.sin(e.y / 30) * 2;
            drawEggplant(e);

            if (e.y > canvas.height) {
                eggplants.splice(eIndex, 1);
                score -= 5;
                updateScore();
            }

            pineapples.forEach((p, pIndex) => {
                if (Math.hypot(e.x - p.x, e.y - p.y) < 25) {
                    eggplants.splice(eIndex, 1);
                    pineapples.splice(pIndex, 1);
                    score += 10;
                    updateScore();
                }
            });
        });

        blackHoles.forEach((bh, bhIndex) => {
            bh.size += 0.1;
            if (bh.size > 50) blackHoles.splice(bhIndex, 1);
            drawBlackHole(bh);

            pineapples.forEach((p, pIndex) => {
                const dx = bh.x - p.x;
                const dy = bh.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < bh.size) {
                    pineapples.splice(pIndex, 1);
                } else {
                    p.x += dx / dist * 2;
                    p.y += dy / dist * 2;
                }
            });

            eggplants.forEach((e, eIndex) => {
                const dx = bh.x - e.x;
                const dy = bh.y - e.y;
                const dist = Math.hypot(dx, dy);
                if (dist < bh.size) {
                    eggplants.splice(eIndex, 1);
                    score += 5;
                    updateScore();
                } else {
                    e.x += dx / dist;
                    e.y += dy / dist;
                }
            });
        });
    }

    function updateScore() {
        scoreElement.textContent = score;
        ammoElement.textContent = ammo;
    }

    function spawnEggplant() {
        eggplants.push({
            x: Math.random() * canvas.width,
            y: -20
        });
    }

    function spawnBlackHole() {
        if (Math.random() < 0.2) {
            blackHoles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 5
            });
        }
    }

    function handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                kiwi.x = Math.max(kiwi.size / 2, kiwi.x - kiwi.speed);
                break;
            case 'ArrowRight':
                kiwi.x = Math.min(canvas.width - kiwi.size / 2, kiwi.x + kiwi.speed);
                break;
            case ' ':
                if (ammo > 0) {
                    pineapples.push({ x: kiwi.x, y: kiwi.y - kiwi.size / 2 });
                    ammo--;
                    updateScore();
                }
                break;
        }
    }

    function startGame() {
        gameLoop = setInterval(updateGame, 1000 / 60);
        spawnInterval = setInterval(() => {
            spawnEggplant();
            spawnBlackHole();
            ammo = Math.min(ammo + 1, 50);
            updateScore();
        }, 1000);
    }

    document.addEventListener('keydown', handleKeyDown);
    startGame();

    return {
        cleanup: function() {
            clearInterval(gameLoop);
            clearInterval(spawnInterval);
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
}

function initEchoesOfEternityGame(container) {
    container.innerHTML = `
        <h2>Echoes of Eternity</h2>
        <canvas id="echoesCanvas" width="600" height="400"></canvas>
        <p>Memories Collected: <span id="memoriesCount">0</span> | Time Remaining: <span id="timeRemaining">60</span></p>
    `;

    const canvas = document.getElementById('echoesCanvas');
    const ctx = canvas.getContext('2d');
    const memoriesElement = document.getElementById('memoriesCount');
    const timeElement = document.getElementById('timeRemaining');

    let memories = 0;
    let timeRemaining = 60;
    let gameLoop;
    let timeInterval;

    const player = {
        x: 300,
        y: 200,
        radius: 20,
        color: 'rgba(255, 255, 255, 0.8)',
        trail: []
    };

    let echoes = [];
    let memoryFragments = [];

    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw trail
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        player.trail.forEach((pos, index) => {
            ctx.lineTo(pos.x, pos.y);
            ctx.globalAlpha = 1 - (index / player.trail.length);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    function drawEcho(echo) {
        ctx.strokeStyle = `hsl(${echo.hue}, 100%, 50%)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(echo.x, echo.y, echo.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    function drawMemoryFragment(fragment) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(fragment.x, fragment.y - 5);
        ctx.lineTo(fragment.x + 5, fragment.y + 5);
        ctx.lineTo(fragment.x - 5, fragment.y + 5);
        ctx.closePath();
        ctx.fill();
    }

    function updateGame() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        player.trail.unshift({x: player.x, y: player.y});
        if (player.trail.length > 20) player.trail.pop();

        drawPlayer();

        echoes.forEach((echo, index) => {
            echo.radius += 0.5;
            echo.opacity -= 0.01;
            if (echo.opacity <= 0) {
                echoes.splice(index, 1);
            } else {
                drawEcho(echo);
            }
        });

        memoryFragments.forEach((fragment, index) => {
            drawMemoryFragment(fragment);
            if (Math.hypot(player.x - fragment.x, player.y - fragment.y) < player.radius) {
                memories++;
                memoriesElement.textContent = memories;
                memoryFragments.splice(index, 1);
                createEcho(fragment.x, fragment.y);
            }
        });

        if (Math.random() < 0.05 && memoryFragments.length < 5) {
            createMemoryFragment();
        }
    }

    function createEcho(x, y) {
        echoes.push({
            x: x,
            y: y,
            radius: 10,
            hue: Math.random() * 360,
            opacity: 1
        });
    }

    function createMemoryFragment() {
        memoryFragments.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left;
        player.y = e.clientY - rect.top;
    }

    function startGame() {
        gameLoop = setInterval(updateGame, 1000 / 60);
        timeInterval = setInterval(() => {
            timeRemaining--;
            timeElement.textContent = timeRemaining;
            if (timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(gameLoop);
        clearInterval(timeInterval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Game Over - Memories Collected: ${memories}`, canvas.width / 2, canvas.height / 2);
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    startGame();

    return {
        cleanup: function() {
            clearInterval(gameLoop);
            clearInterval(timeInterval);
            canvas.removeEventListener('mousemove', handleMouseMove);
        }
    };
}

function initLuminousLabyrinthGame(container) {
    container.innerHTML = `
        <h2>Luminous Labyrinth</h2>
        <canvas id="labyrinthCanvas" width="600" height="400"></canvas>
        <p>Energy: <span id="energyLevel">100</span>% | Crystals: <span id="crystalCount">0</span></p>
    `;

    const canvas = document.getElementById('labyrinthCanvas');
    const ctx = canvas.getContext('2d');
    const energyElement = document.getElementById('energyLevel');
    const crystalElement = document.getElementById('crystalCount');

    let energy = 100;
    let crystals = 0;
    let gameLoop;
    let energyDrainInterval;

    const player = {
        x: 300,
        y: 200,
        radius: 15,
        angle: 0,
        speed: 3,
        glow: 50
    };

    let walls = [];
    let crystalNodes = [];

    function generateMaze() {
        // Simple maze generation for demonstration
        walls = [
            {x: 100, y: 100, width: 400, height: 20},
            {x: 100, y: 280, width: 400, height: 20},
            {x: 100, y: 100, width: 20, height: 200},
            {x: 480, y: 100, width: 20, height: 200},
            {x: 200, y: 150, width: 200, height: 20},
            {x: 200, y: 230, width: 200, height: 20}
        ];
    }

    function drawPlayer() {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${energy / 100})`;
        ctx.fill();

        // Player's glow
        const gradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, player.glow);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${energy / 200})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x - player.glow, player.y - player.glow, player.glow * 2, player.glow * 2);

        // Player's direction indicator
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + Math.cos(player.angle) * 30, player.y + Math.sin(player.angle) * 30);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
    }

    function drawWalls() {
        ctx.fillStyle = 'rgba(100, 100, 255, 0.3)';
        walls.forEach(wall => {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
    }

    function drawCrystalNodes() {
        crystalNodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${node.hue}, 100%, 50%, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
            ctx.fill();
        });
    }

    function updateGame() {
        ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawWalls();
        drawCrystalNodes();
        drawPlayer();

        // Move player
        const newX = player.x + Math.cos(player.angle) * player.speed;
        const newY = player.y + Math.sin(player.angle) * player.speed;

        if (!checkCollision(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }

        // Check crystal collection
        crystalNodes.forEach((node, index) => {
            if (Math.hypot(player.x - node.x, player.y - node.y) < player.radius + 10) {
                crystals++;
                crystalElement.textContent = crystals;
                crystalNodes.splice(index, 1);
                energy = Math.min(energy + 20, 100);
                energyElement.textContent = energy;
            }
        });

        // Spawn new crystal nodes
        if (Math.random() < 0.02 && crystalNodes.length < 5) {
            spawnCrystalNode();
        }
    }

    function checkCollision(x, y) {
        return walls.some(wall => 
            x - player.radius < wall.x + wall.width &&
            x + player.radius > wall.x &&
            y - player.radius < wall.y + wall.height &&
            y + player.radius > wall.y
        );
    }

    function spawnCrystalNode() {
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (checkCollision(x, y));

        crystalNodes.push({
            x: x,
            y: y,
            hue: Math.random() * 360
        });
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    }

    function startGame() {
        generateMaze();
        gameLoop = setInterval(updateGame, 1000 / 60);
        energyDrainInterval = setInterval(() => {
            energy = Math.max(energy - 1, 0);
            energyElement.textContent = energy;
            if (energy <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(gameLoop);
        clearInterval(energyDrainInterval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Game Over - Crystals Collected: ${crystals}`, canvas.width / 2, canvas.height / 2);
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    startGame();

    return {
        cleanup: function() {
            clearInterval(gameLoop);
            clearInterval(energyDrainInterval);
            canvas.removeEventListener('mousemove', handleMouseMove);
        }
    };
}


function initLuminousLabyrint2Game(container) {
    container.innerHTML = `
        <h2>Luminous Labyrinth 2</h2>
        <canvas id="labyrinthCanvas" width="600" height="400"></canvas>
        <p>Energy: <span id="energyLevel">100</span>% | Crystals: <span id="crystalCount">0</span></p>
    `;

    const canvas = document.getElementById('labyrinthCanvas');
    const ctx = canvas.getContext('2d');
    const energyElement = document.getElementById('energyLevel');
    const crystalElement = document.getElementById('crystalCount');

    let energy = 100;
    let crystals = 0;
    let gameLoop;
    let energyDrainInterval;

    const player = {
        x: 300,
        y: 200,
        radius: 15,
        angle: 0,
        speed: 3,
        glow: 50
    };

    let walls = [];
    let crystalNodes = [];

    function generateMaze() {
        // Simple maze generation for demonstration
        walls = [
            {x: 100, y: 100, width: 400, height: 20},
            {x: 100, y: 280, width: 400, height: 20},
            {x: 100, y: 100, width: 20, height: 200},
            {x: 480, y: 100, width: 20, height: 200},
            {x: 200, y: 150, width: 200, height: 20},
            {x: 200, y: 230, width: 200, height: 20}
        ];
    }

    function drawPlayer() {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${energy / 100})`;
        ctx.fill();

        // Player's glow
        const gradient = ctx.createRadialGradient(player.x, player.y, 0, player.x, player.y, player.glow);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${energy / 200})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(player.x - player.glow, player.y - player.glow, player.glow * 2, player.glow * 2);

        // Player's direction indicator
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + Math.cos(player.angle) * 30, player.y + Math.sin(player.angle) * 30);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
    }

    function drawWalls() {
        ctx.fillStyle = 'rgba(100, 100, 255, 0.3)';
        walls.forEach(wall => {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        });
    }

    function drawCrystalNodes() {
        crystalNodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${node.hue}, 100%, 50%, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
            ctx.fill();
        });
    }

    function updateGame() {
        ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawWalls();
        drawCrystalNodes();
        drawPlayer();

        // Move player
        const newX = player.x + Math.cos(player.angle) * player.speed;
        const newY = player.y + Math.sin(player.angle) * player.speed;

        if (!checkCollision(newX, newY)) {
            player.x = newX;
            player.y = newY;
        }

        // Check crystal collection
        crystalNodes.forEach((node, index) => {
            if (Math.hypot(player.x - node.x, player.y - node.y) < player.radius + 10) {
                crystals++;
                crystalElement.textContent = crystals;
                crystalNodes.splice(index, 1);
                energy = Math.min(energy + 20, 100);
                energyElement.textContent = energy;
            }
        });

        // Spawn new crystal nodes
        if (Math.random() < 0.02 && crystalNodes.length < 5) {
            spawnCrystalNode();
        }
    }

    function checkCollision(x, y) {
        return walls.some(wall => 
            x - player.radius < wall.x + wall.width &&
            x + player.radius > wall.x &&
            y - player.radius < wall.y + wall.height &&
            y + player.radius > wall.y
        );
    }

    function spawnCrystalNode() {
        let x, y;
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (checkCollision(x, y));

        crystalNodes.push({
            x: x,
            y: y,
            hue: Math.random() * 360
        });
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    }

    function startGame() {
        generateMaze();
        gameLoop = setInterval(updateGame, 1000 / 60);
        energyDrainInterval = setInterval(() => {
            energy = Math.max(energy - 1, 0);
            energyElement.textContent = energy;
            if (energy <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(gameLoop);
        clearInterval(energyDrainInterval);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Game Over - Crystals Collected: ${crystals}`, canvas.width / 2, canvas.height / 2);
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    startGame();

    return {
        cleanup: function() {
            clearInterval(gameLoop);
            clearInterval(energyDrainInterval);
            canvas.removeEventListener('mousemove', handleMouseMove);
        }
    };
}



function initStickQuest2Game(container) {
    container.innerHTML = `
        <h2>Stick Quest 2</h2>
        <canvas id="stickQuestCanvas" width="600" height="400"></canvas>
        <p>Inventory: <span id="inventory"></span></p>
    `;
    const canvas = document.getElementById('stickQuestCanvas');
    const ctx = canvas.getContext('2d');
    const inventoryElement = document.getElementById('inventory');

    let player = {
        x: 50,
        y: 200,
        width: 20,
        height: 40,
        speed: 5,
        inventory: []
    };

    let items = [
        { x: 200, y: 200, width: 20, height: 20, color: 'gold', name: 'Gold Coin' },
        { x: 400, y: 150, width: 30, height: 30, color: 'purple', name: 'Magic Gem' },
        { x: 300, y: 300, width: 25, height: 25, color: 'green', name: 'Health Potion' }
    ];

    function drawPlayer() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawItems() {
        items.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.fillRect(item.x, item.y, item.width, item.height);
        });
    }

    function updateInventory() {
        inventoryElement.textContent = player.inventory.join(', ');
    }

    function checkCollision(player, item) {
        return (
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
        );
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawPlayer();
        drawItems();

        items = items.filter(item => {
            if (checkCollision(player, item)) {
                player.inventory.push(item.name);
                updateInventory();
                return false;
            }
            return true;
        });

        if (player.inventory.length === 3) {
            ctx.font = '24px Arial';
            ctx.fillStyle = 'green';
            ctx.fillText('Quest Complete!', 200, 200);
        }
    }

    function gameLoop() {
        update();
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') player.x -= player.speed;
        if (e.key === 'ArrowRight') player.x += player.speed;
        if (e.key === 'ArrowUp') player.y -= player.speed;
        if (e.key === 'ArrowDown') player.y += player.speed;
    });

    gameLoop();
}

function initButterflyCatcherGame(container) {
    container.innerHTML = `
        <h2>Butterfly Catcher</h2>
        <canvas id="butterflyCatcherCanvas" width="600" height="400"></canvas>
        <p>Butterflies Caught: <span id="score">0</span></p>
    `;
    const canvas = document.getElementById('butterflyCatcherCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    let score = 0;
    let butterflies = [];
    let net = { x: 300, y: 350, radius: 30 };

    function createButterfly() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 10 + Math.random() * 10,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            hue: Math.random() * 360
        };
    }

    function drawButterfly(butterfly) {
        ctx.fillStyle = `hsl(${butterfly.hue}, 100%, 50%)`;
        ctx.strokeStyle = `hsl(${butterfly.hue}, 100%, 30%)`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(butterfly.x, butterfly.y, butterfly.size, butterfly.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(butterfly.x - butterfly.size / 2, butterfly.y - butterfly.size / 4, butterfly.size / 2, butterfly.size / 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(butterfly.x + butterfly.size / 2, butterfly.y - butterfly.size / 4, butterfly.size / 2, butterfly.size / 4, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    function drawNet() {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(net.x, net.y, net.radius, 0, Math.PI * 2);
        ctx.moveTo(net.x, net.y);
        ctx.lineTo(net.x, net.y + 50);
        ctx.stroke();
    }

    function drawBackground() {
        let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function update() {
        butterflies.forEach(butterfly => {
            butterfly.x += butterfly.speedX;
            butterfly.y += butterfly.speedY;

            if (butterfly.x < 0 || butterfly.x > canvas.width) butterfly.speedX *= -1;
            if (butterfly.y < 0 || butterfly.y > canvas.height) butterfly.speedY *= -1;

            let dx = butterfly.x - net.x;
            let dy = butterfly.y - net.y;
            if (Math.sqrt(dx * dx + dy * dy) < net.radius + butterfly.size / 2) {
                score++;
                scoreElement.textContent = score;
                butterflies = butterflies.filter(b => b !== butterfly);
                butterflies.push(createButterfly());
            }
        });
    }

    function render() {
        drawBackground();
        butterflies.forEach(drawButterfly);
        drawNet();
    }

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }

    canvas.addEventListener('mousemove', (e) => {
        let rect = canvas.getBoundingClientRect();
        net.x = e.clientX - rect.left;
        net.y = e.clientY - rect.top;
    });

    for (let i = 0; i < 5; i++) {
        butterflies.push(createButterfly());
    }

    gameLoop();
}

function initStealthShadowGame(container) {
    container.innerHTML = `
        <h2>Stealth Shadow</h2>
        <canvas id="stealthShadowCanvas" width="600" height="400"></canvas>
        <p>Shadows Collected: <span id="shadowCount">0</span></p>
    `;
    const canvas = document.getElementById('stealthShadowCanvas');
    const ctx = canvas.getContext('2d');
    const shadowCountElement = document.getElementById('shadowCount');

    let player = { x: 300, y: 200, radius: 15, shadowCount: 0 };
    let shadows = [];
    let guards = [];
    let isGameOver = false;

    function drawPlayer() {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50, 50, 50, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    function drawShadow(shadow) {
        ctx.beginPath();
        ctx.arc(shadow.x, shadow.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawGuard(guard) {
        ctx.beginPath();
        ctx.arc(guard.x, guard.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 50, 50, 0.7)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(150, 0, 0, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(guard.x, guard.y);
        ctx.lineTo(guard.x + Math.cos(guard.angle) * 30, guard.y + Math.sin(guard.angle) * 30);
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawBackground() {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, 0);
            ctx.lineTo(Math.random() * canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(150, 150, 150, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    function update() {
        if (isGameOver) return;

        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

        shadows = shadows.filter(shadow => {
            const dx = player.x - shadow.x;
            const dy = player.y - shadow.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < player.radius + 10) {
                player.shadowCount++;
                shadowCountElement.textContent = player.shadowCount;
                return false;
            }
            return true;
        });

        if (Math.random() < 0.02 && shadows.length < 5) {
            shadows.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height
            });
        }

        guards.forEach(guard => {
            guard.x += Math.cos(guard.angle) * guard.speed;
            guard.y += Math.sin(guard.angle) * guard.speed;

            if (guard.x < 0 || guard.x > canvas.width || guard.y < 0 || guard.y > canvas.height) {
                guard.angle = Math.random() * Math.PI * 2;
            }

            const dx = player.x - guard.x;
            const dy = player.y - guard.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < player.radius + 20) {
                isGameOver = true;
            }
        });

        if (Math.random() < 0.005 && guards.length < 3) {
            guards.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                angle: Math.random() * Math.PI * 2,
                speed: 1 + Math.random()
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        shadows.forEach(drawShadow);
        guards.forEach(drawGuard);
        drawPlayer();

        if (isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = '48px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        }
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left;
        player.y = e.clientY - rect.top;
    });

    gameLoop();
}

function initCardMemoryGame(container) {
    container.innerHTML = `
        <h2>Card Memory Game</h2>
        <canvas id="cardMemoryCanvas" width="600" height="400"></canvas>
        <p>Matches: <span id="matchesCount">0</span></p>
        <p>Attempts: <span id="attemptsCount">0</span></p>
        <p>Controls: Click on cards to flip them. Match all pairs to win!</p>
    `;
    const canvas = document.getElementById('cardMemoryCanvas');
    const ctx = canvas.getContext('2d');

    const cards = [];
    const symbols = ['♠', '♥', '♦', '♣', '★', '✿', '♫', '☀'];
    let flippedCards = [];
    let matches = 0;
    let attempts = 0;
    let gameOver = false;

    function Card(x, y, symbol) {
        this.x = x;
        this.y = y;
        this.width = 70;
        this.height = 100;
        this.symbol = symbol;
        this.flipped = false;
    }

    Card.prototype.draw = function() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.flipped ? 0 : Math.PI);

        ctx.beginPath();
        ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 10);
        ctx.fillStyle = this.flipped ? '#fff' : '#6495ED';
        ctx.fill();
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (this.flipped) {
            ctx.fillStyle = '#4169E1';
            ctx.font = '36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.symbol, 0, 0);
        } else {
            ctx.beginPath();
            ctx.moveTo(-20, -30);
            ctx.lineTo(20, 30);
            ctx.moveTo(20, -30);
            ctx.lineTo(-20, 30);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();
    };

    function initializeCards() {
        const shuffledSymbols = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                cards.push(new Card(j * 100 + 95, i * 110 + 20, shuffledSymbols.pop()));
            }
        }
    }

    function drawCards() {
        cards.forEach(card => card.draw());
    }

    function checkMatch() {
        if (flippedCards[0].symbol === flippedCards[1].symbol) {
            matches++;
            document.getElementById('matchesCount').textContent = matches;
            flippedCards = [];
            if (matches === symbols.length) {
                gameOver = true;
            }
        } else {
            setTimeout(() => {
                flippedCards.forEach(card => card.flipped = false);
                flippedCards = [];
                draw();
            }, 1000);
        }
        attempts++;
        document.getElementById('attemptsCount').textContent = attempts;
    }

    function handleClick(e) {
        if (gameOver || flippedCards.length === 2) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        cards.forEach(card => {
            if (x > card.x && x < card.x + card.width &&
                y > card.y && y < card.y + card.height && !card.flipped) {
                card.flipped = true;
                flippedCards.push(card);
                if (flippedCards.length === 2) {
                    checkMatch();
                }
                draw();
            }
        });
    }

    function drawBackground() {
        ctx.fillStyle = '#F0F8FF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < canvas.width; i += 20) {
            for (let j = 0; j < canvas.height; j += 20) {
                ctx.beginPath();
                ctx.arc(i, j, 1, 0, Math.PI * 2);
                ctx.fillStyle = '#E6E6FA';
                ctx.fill();
            }
        }
    }

    function draw() {
        drawBackground();
        drawCards();

        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Congratulations!', canvas.width / 2, canvas.height / 2);
            ctx.font = '24px Arial';
            ctx.fillText(`You won in ${attempts} attempts!`, canvas.width / 2, canvas.height / 2 + 40);
        }
    }

    canvas.addEventListener('click', handleClick);
    initializeCards();
    draw();
}

function initMatchThreeMadnessGame(container) {
    container.innerHTML = `
        <h2>Match Three Madness</h2>
        <canvas id="matchThreeCanvas" width="600" height="400"></canvas>
        <p>Score: <span id="scoreSpan">0</span></p>
        <p>Time Left: <span id="timeSpan">60</span> seconds</p>
        <p>Controls: Click or tap to swap adjacent gems. Match 3 or more of the same color to score!</p>
    `;
    const canvas = document.getElementById('matchThreeCanvas');
    const ctx = canvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreSpan');
    const timeSpan = document.getElementById('timeSpan');

    const GRID_SIZE = 8;
    const CELL_SIZE = 50;
    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    let grid = [];
    let score = 0;
    let timeLeft = 60;
    let selectedGem = null;
    let gameState = 'start';

    function createGrid() {
        for (let i = 0; i < GRID_SIZE; i++) {
            grid[i] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                grid[i][j] = {
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    x: j * CELL_SIZE,
                    y: i * CELL_SIZE,
                    targetY: i * CELL_SIZE
                };
            }
        }
    }

    function drawGem(gem, highlight = false) {
        ctx.beginPath();
        ctx.arc(gem.x + CELL_SIZE / 2, gem.y + CELL_SIZE / 2, CELL_SIZE / 2 - 5, 0, Math.PI * 2);
        ctx.fillStyle = gem.color;
        ctx.fill();
        ctx.strokeStyle = highlight ? '#FFFFFF' : '#000000';
        ctx.lineWidth = highlight ? 4 : 2;
        ctx.stroke();
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                drawGem(grid[i][j], selectedGem && selectedGem.x === j && selectedGem.y === i);
            }
        }
    }

    function checkMatches() {
        let matches = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (j < GRID_SIZE - 2 &&
                    grid[i][j].color === grid[i][j+1].color &&
                    grid[i][j].color === grid[i][j+2].color) {
                    matches.push({i, j});
                }
                if (i < GRID_SIZE - 2 &&
                    grid[i][j].color === grid[i+1][j].color &&
                    grid[i][j].color === grid[i+2][j].color) {
                    matches.push({i, j});
                }
            }
        }
        return matches;
    }

    function removeMatches(matches) {
        matches.forEach(match => {
            for (let i = 0; i < 3; i++) {
                if (match.i < GRID_SIZE - 2) {
                    grid[match.i+i][match.j].color = null;
                }
                if (match.j < GRID_SIZE - 2) {
                    grid[match.i][match.j+i].color = null;
                }
            }
        });
        score += matches.length * 10;
        scoreSpan.textContent = score;
    }

    function dropGems() {
        for (let j = 0; j < GRID_SIZE; j++) {
            let emptySpaces = 0;
            for (let i = GRID_SIZE - 1; i >= 0; i--) {
                if (grid[i][j].color === null) {
                    emptySpaces++;
                } else if (emptySpaces > 0) {
                    grid[i + emptySpaces][j].color = grid[i][j].color;
                    grid[i][j].color = null;
                }
            }
            for (let i = 0; i < emptySpaces; i++) {
                grid[i][j].color = COLORS[Math.floor(Math.random() * COLORS.length)];
            }
        }
    }

    function swapGems(gem1, gem2) {
        const tempColor = gem1.color;
        gem1.color = gem2.color;
        gem2.color = tempColor;
    }

    function handleClick(e) {
        if (gameState !== 'playing') return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;

        if (!selectedGem) {
            selectedGem = {x, y};
        } else {
            const dx = Math.abs(x - selectedGem.x);
            const dy = Math.abs(y - selectedGem.y);
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                swapGems(grid[selectedGem.y][selectedGem.x], grid[y][x]);
                const matches = checkMatches();
                if (matches.length > 0) {
                    removeMatches(matches);
                    dropGems();
                } else {
                    swapGems(grid[selectedGem.y][selectedGem.x], grid[y][x]);
                }
            }
            selectedGem = null;
        }
    }

    function startScreen() {
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333333';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Match Three Madness', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText('Click to Start', canvas.width / 2, canvas.height / 2 + 50);
    }

    function gameOverScreen() {
        ctx.fillStyle = '#F0F0F0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#333333';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Click to Play Again', canvas.width / 2, canvas.height / 2 + 50);
    }

    function update() {
        if (gameState === 'playing') {
            drawGrid();
            timeLeft -= 1/60;
            timeSpan.textContent = Math.ceil(timeLeft);
            if (timeLeft <= 0) {
                gameState = 'gameOver';
            }
        } else if (gameState === 'start') {
            startScreen();
        } else if (gameState === 'gameOver') {
            gameOverScreen();
        }
        requestAnimationFrame(update);
    }

    canvas.addEventListener('click', (e) => {
        if (gameState === 'start') {
            gameState = 'playing';
            createGrid();
        } else if (gameState === 'gameOver') {
            gameState = 'playing';
            score = 0;
            timeLeft = 60;
            scoreSpan.textContent = score;
            createGrid();
        } else {
            handleClick(e);
        }
    });

    createGrid();
    update();
}

function initBubblePhysicsGame(container) {
    container.innerHTML = `
        <h2>Bubble Physics</h2>
        <canvas id="bubblePhysicsCanvas" width="600" height="400"></canvas>
        <p>Score: <span id="score">0</span></p>
        <p>Click to create bubbles. Drag to move them. Combine similar colors!</p>
    `;
    const canvas = document.getElementById('bubblePhysicsCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    let bubbles = [];
    let score = 0;
    let draggedBubble = null;

    class Bubble {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 20 + Math.random() * 20;
            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.vx *= -1;
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.vy *= -1;
        }
    }

    function createBubble(x, y) {
        bubbles.push(new Bubble(x, y));
    }

    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }
    }

    function checkCollisions() {
        for (let i = 0; i < bubbles.length; i++) {
            for (let j = i + 1; j < bubbles.length; j++) {
                const dx = bubbles[i].x - bubbles[j].x;
                const dy = bubbles[i].y - bubbles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < bubbles[i].radius + bubbles[j].radius) {
                    if (bubbles[i].color === bubbles[j].color) {
                        bubbles[i].radius += bubbles[j].radius / 2;
                        bubbles.splice(j, 1);
                        score += 10;
                        scoreElement.textContent = score;
                    } else {
                        const angle = Math.atan2(dy, dx);
                        const sin = Math.sin(angle);
                        const cos = Math.cos(angle);

                        bubbles[i].vx = cos;
                        bubbles[i].vy = sin;
                        bubbles[j].vx = -cos;
                        bubbles[j].vy = -sin;
                    }
                }
            }
        }
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();

        bubbles.forEach(bubble => {
            bubble.update();
            bubble.draw();
        });

        checkCollisions();

        requestAnimationFrame(gameLoop);
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createBubble(x, y);
    });

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        bubbles.forEach(bubble => {
            const dx = x - bubble.x;
            const dy = y - bubble.y;
            if (Math.sqrt(dx * dx + dy * dy) < bubble.radius) {
                draggedBubble = bubble;
            }
        });
    });

    canvas.addEventListener('mousemove', (e) => {
        if (draggedBubble) {
            const rect = canvas.getBoundingClientRect();
            draggedBubble.x = e.clientX - rect.left;
            draggedBubble.y = e.clientY - rect.top;
        }
    });

    canvas.addEventListener('mouseup', () => {
        draggedBubble = null;
    });

    gameLoop();
}

function initLogicMazeGame(container) {
    container.innerHTML = `
        <h2>Logic Maze</h2>
        <canvas id="logicMazeCanvas" width="600" height="400"></canvas>
        <p>Moves: <span id="moveCount">0</span></p>
        <p>Level: <span id="levelCount">1</span></p>
        <p>Controls: Use arrow keys to move. Reach the green circle to win!</p>
    `;
    const canvas = document.getElementById('logicMazeCanvas');
    const ctx = canvas.getContext('2d');
    const moveCountElement = document.getElementById('moveCount');
    const levelCountElement = document.getElementById('levelCount');

    let player = { x: 50, y: 50, size: 20 };
    let goal = { x: 550, y: 350, size: 30 };
    let walls = [];
    let moveCount = 0;
    let level = 1;
    let gameState = 'start';

    function generateMaze() {
        walls = [];
        for (let i = 0; i < 10; i++) {
            walls.push({
                x: Math.random() * 500 + 50,
                y: Math.random() * 300 + 50,
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                color: `hsl(${Math.random() * 360}, 50%, 50%)`
            });
        }
    }

    function drawPlayer() {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${Date.now() / 20 % 360}, 100%, 50%)`;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawGoal() {
        ctx.beginPath();
        ctx.arc(goal.x, goal.y, goal.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawWalls() {
        walls.forEach(wall => {
            ctx.fillStyle = wall.color;
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
        });
    }

    function checkCollision(x, y) {
        return walls.some(wall =>
            x < wall.x + wall.width &&
            x + player.size > wall.x &&
            y < wall.y + wall.height &&
            y + player.size > wall.y
        );
    }

    function movePlayer(dx, dy) {
        if (gameState !== 'playing') return;
        let newX = player.x + dx;
        let newY = player.y + dy;
        if (newX > 0 && newX < 600 && newY > 0 && newY < 400 && !checkCollision(newX, newY)) {
            player.x = newX;
            player.y = newY;
            moveCount++;
            moveCountElement.textContent = moveCount;
        }
        if (Math.hypot(player.x - goal.x, player.y - goal.y) < player.size + goal.size) {
            level++;
            levelCountElement.textContent = level;
            generateMaze();
            player.x = 50;
            player.y = 50;
        }
    }

    function drawStartScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 600, 400);
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Logic Maze', 300, 180);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to Start', 300, 220);
    }

    function update() {
        ctx.clearRect(0, 0, 600, 400);
        if (gameState === 'start') {
            drawStartScreen();
        } else if (gameState === 'playing') {
            drawWalls();
            drawGoal();
            drawPlayer();
        }
        requestAnimationFrame(update);
    }

    document.addEventListener('keydown', (e) => {
        if (gameState === 'start' && e.code === 'Space') {
            gameState = 'playing';
            generateMaze();
        } else if (gameState === 'playing') {
            switch (e.code) {
                case 'ArrowUp': movePlayer(0, -5); break;
                case 'ArrowDown': movePlayer(0, 5); break;
                case 'ArrowLeft': movePlayer(-5, 0); break;
                case 'ArrowRight': movePlayer(5, 0); break;
            }
        }
    });

    update();
}

function initLanguageBubblesGame(container) {
    container.innerHTML = `
        <h2>Language Bubbles</h2>
        <canvas id="languageBubblesCanvas" width="600" height="400"></canvas>
        <p>Score: <span id="score">0</span></p>
        <p>Time: <span id="time">60</span>s</p>
        <p>Match the word to its translation! Click on the correct bubble.</p>
    `;
    const canvas = document.getElementById('languageBubblesCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');

    let score = 0;
    let time = 60;
    let bubbles = [];
    let currentWord = '';
    let currentTranslation = '';

    const words = [
        { en: 'Hello', es: 'Hola' },
        { en: 'Goodbye', es: 'Adiós' },
        { en: 'Thank you', es: 'Gracias' },
        { en: 'Please', es: 'Por favor' },
        { en: 'Sorry', es: 'Lo siento' }
    ];

    function createBubble(text) {
        return {
            x: Math.random() * 550 + 25,
            y: Math.random() * 350 + 25,
            radius: 40,
            text: text,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            speed: Math.random() * 2 + 1
        };
    }

    function drawBubble(bubble) {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bubble.text, bubble.x, bubble.y + 6);
    }

    function updateBubbles() {
        bubbles.forEach(bubble => {
            bubble.y -= bubble.speed;
            if (bubble.y + bubble.radius < 0) {
                bubble.y = 400 + bubble.radius;
            }
        });
    }

    function newRound() {
        const wordPair = words[Math.floor(Math.random() * words.length)];
        currentWord = wordPair.en;
        currentTranslation = wordPair.es;
        bubbles = [
            createBubble(currentTranslation),
            createBubble(words[Math.floor(Math.random() * words.length)].es),
            createBubble(words[Math.floor(Math.random() * words.length)].es)
        ];
    }

    function drawBackground() {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 400);

        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * 600,
                Math.random() * 400,
                Math.random() * 2,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }
    }

    function draw() {
        ctx.clearRect(0, 0, 600, 400);
        drawBackground();
        bubbles.forEach(drawBubble);
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Translate: ${currentWord}`, 300, 30);
    }

    function gameLoop() {
        updateBubbles();
        draw();
        if (time > 0) {
            requestAnimationFrame(gameLoop);
        } else {
            endGame();
        }
    }

    function startGame() {
        newRound();
        gameLoop();
        const timer = setInterval(() => {
            time--;
            timeElement.textContent = time;
            if (time <= 0) {
                clearInterval(timer);
            }
        }, 1000);
    }

    function endGame() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = 'white';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', 300, 180);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, 300, 220);
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        bubbles.forEach((bubble, index) => {
            const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
            if (distance <= bubble.radius) {
                if (bubble.text === currentTranslation) {
                    score += 10;
                    scoreElement.textContent = score;
                    newRound();
                } else {
                    score -= 5;
                    scoreElement.textContent = score;
                }
            }
        });
    });

    startGame();
}

function initBubblePopGame(container) {
    container.innerHTML = `
        <h2>Bubble Pop</h2>
        <canvas id="bubblePopCanvas" width="600" height="400"></canvas>
        <p>Score: <span id="score">0</span></p>
        <p>Time: <span id="time">60</span>s</p>
        <p>Click bubbles to pop them!</p>
    `;
    const canvas = document.getElementById('bubblePopCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const timeEl = document.getElementById('time');

    let score = 0;
    let time = 60;
    let bubbles = [];
    let gameLoop;
    let isGameOver = false;

    function Bubble(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
    }

    Bubble.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    Bubble.prototype.update = function() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.speedX = -this.speedX;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.speedY = -this.speedY;
        }
    }

    function createBubble() {
        const radius = Math.random() * 20 + 10;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = Math.random() * (canvas.height - radius * 2) + radius;
        bubbles.push(new Bubble(x, y, radius));
    }

    function drawBackground() {
        ctx.fillStyle = 'rgba(0, 0, 50, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Math.random() * 2,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }
    }

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();

        bubbles.forEach((bubble, index) => {
            bubble.update();
            bubble.draw();
        });

        if (Math.random() < 0.05 && bubbles.length < 20) {
            createBubble();
        }

        if (!isGameOver) {
            gameLoop = requestAnimationFrame(update);
        }
    }

    function startGame() {
        isGameOver = false;
        score = 0;
        time = 60;
        bubbles = [];
        scoreEl.textContent = score;
        timeEl.textContent = time;

        for (let i = 0; i < 10; i++) {
            createBubble();
        }

        update();

        const timer = setInterval(() => {
            time--;
            timeEl.textContent = time;
            if (time <= 0) {
                clearInterval(timer);
                gameOver();
            }
        }, 1000);
    }

    function gameOver() {
        isGameOver = true;
        cancelAnimationFrame(gameLoop);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('Click to play again', canvas.width / 2, canvas.height / 2 + 100);
    }

    canvas.addEventListener('click', (e) => {
        if (isGameOver) {
            startGame();
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        bubbles.forEach((bubble, index) => {
            const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
            if (distance < bubble.radius) {
                bubbles.splice(index, 1);
                score++;
                scoreEl.textContent = score;
            }
        });
    });

    startGame();
}

function initBubblePhysicsGame(container) {
    container.innerHTML = `
        <h2>Bubble Physics</h2>
        <canvas id="bubblePhysicsCanvas" width="600" height="400"></canvas>
        <p>Score: <span id="bubbleScore">0</span></p>
        <p>Click to create bubbles. Move mouse to guide them.</p>
    `;
    const canvas = document.getElementById('bubblePhysicsCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('bubbleScore');

    let bubbles = [];
    let score = 0;
    let mouseX = 300;
    let mouseY = 200;

    class Bubble {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = Math.random() * 20 + 10;
            this.dx = Math.random() * 4 - 2;
            this.dy = Math.random() * 4 - 2;
            this.hue = Math.random() * 360;
        }

        update() {
            this.x += this.dx;
            this.y += this.dy;

            let angle = Math.atan2(mouseY - this.y, mouseX - this.x);
            this.dx += Math.cos(angle) * 0.1;
            this.dy += Math.sin(angle) * 0.1;

            this.dx *= 0.99;
            this.dy *= 0.99;

            if (this.x < this.radius || this.x > canvas.width - this.radius) this.dx *= -1;
            if (this.y < this.radius || this.y > canvas.height - this.radius) this.dy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, 0.5)`;
            ctx.fill();
            ctx.strokeStyle = `hsl(${this.hue}, 100%, 40%)`;
            ctx.stroke();
        }
    }

    function createBubble(x, y) {
        bubbles.push(new Bubble(x, y));
        score++;
        scoreElement.textContent = score;
    }

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createBubble(x, y);
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    function drawBackground() {
        ctx.fillStyle = 'rgba(240, 248, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, 0);
            ctx.lineTo(Math.random() * canvas.width, canvas.height);
            ctx.strokeStyle = `rgba(173, 216, 230, ${Math.random() * 0.5})`;
            ctx.stroke();
        }
    }

    function gameLoop() {
        drawBackground();

        bubbles.forEach(bubble => {
            bubble.update();
            bubble.draw();
        });

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}