const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity  800:600 as the canvas size
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));
let currentParticleType = 'sand';

function updateGrid() {
    for (let y = gridHeight - 2; y >= 0; y--) {  // Start from the bottom
        for (let x = 0; x < gridWidth; x++) {
            // Sand behavior
            if (grid[y][x] === 'sand') {
                if (grid[y + 1][x] === null) {
                    // Move sand down
                    grid[y + 1][x] = 'sand';
                    grid[y][x] = null;
                } else if (grid[y + 1][x] === 'water') {
                    // If there's water below the sand, swap the two
                    grid[y + 1][x] = 'sand';
                    grid[y][x] = 'water';
                }
            }
            // Water behavior (rest remains the same)
            else if (grid[y][x] === 'water') {
                if (y + 1 < gridHeight && grid[y + 1][x] === null) {
                    // Move water down
                    grid[y + 1][x] = 'water';
                    grid[y][x] = null;
                } else {
                    // Decide to move left or right randomly
                    let moveLeft = Math.random() < 0.5;
                    if (moveLeft && x - 1 >= 0 && grid[y][x - 1] === null) {
                        // Move water left
                        grid[y][x - 1] = 'water';
                        grid[y][x] = null;
                    } else if (!moveLeft && x + 1 < gridWidth && grid[y][x + 1] === null) {
                        // Move water right
                        grid[y][x + 1] = 'water';
                        grid[y][x] = null;
                    }
                }
            } // Add other behaviors here
        }
    }
}


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 'sand') {
                console.log(`Drawing sand at: ${x}, ${y}`);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else if (grid[y][x] === 'water') {
                ctx.fillStyle = '#1E90FF';  // Water color
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
            // Add rendering for other particle types here
        }
    }

}


canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    grid[y][x] = currentParticleType;
});

function setParticleType(type) {
    currentParticleType = type;
}


function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);
}

loop();
