// Automatically detect and load games
const games = Object.keys(window)
    .filter(key => key.startsWith('init') && key.endsWith('Game'))
    .map(key => ({
        name: key.slice(4, -4), // Remove 'init' and 'Game' from the function name
        init: window[key]
    }));

let currentGame = null;
let remainingGames = [...games];

function loadRandomGame() {
    if (remainingGames.length === 0) {
        // If all games have been played, reset the list
        remainingGames = [...games];
    }

    const randomIndex = Math.floor(Math.random() * remainingGames.length);
    const randomGame = remainingGames[randomIndex];
    
    // Remove the selected game from the remaining games
    remainingGames.splice(randomIndex, 1);

    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = ''; // Clear previous game

    if (currentGame && currentGame.cleanup) {
        currentGame.cleanup(); // Clean up previous game if necessary
    }

    currentGame = randomGame.init(gameContainer);

    // Update the game count display
    updateGameCountDisplay();
}

function updateGameCountDisplay() {
    const gamesPlayedCount = games.length - remainingGames.length;
    const totalGames = games.length;
    const gameCountElement = document.getElementById('game-count');
    if (gameCountElement) {
        gameCountElement.textContent = `Games Played: ${gamesPlayedCount}`;
    }
}

// Load a random game when the page loads
window.onload = function() {
    loadRandomGame();

    // Intercept refresh attempts
    window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            loadRandomGame();
        }
    });

    // Add click event listener to body to load new game
    document.body.addEventListener('click', function(e) {
        if (e.target.tagName.toLowerCase() !== 'canvas') {
            loadRandomGame();
        }
    });
};