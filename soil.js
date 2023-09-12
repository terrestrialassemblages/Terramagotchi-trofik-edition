const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let stoneIdCounter = 0;
let stoneColors = {};

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));

const elements = {
    sand: {
        color: "#FFD700",
        behavior: [],
    },
    soil: {
        color: "#452c1b",
        behavior: [],
    },
    stone: {
        color: "#211811",
        behavior: [],
    },
    water: {
        color: "#5756c2",
        behavior: [],
    },
};

elements.stone.behavior.push(function (y, x, grid) {

});

elements.soil.behavior.push(function (y, x, grid) {

    if (grid[y + 1][x] === null) {
        // If the bottom is empty, let the dirt move downward
        grid[y + 1][x] = 'soil';
        grid[y][x] = null;
    } else {
        // If the bottom is not empty, try to let the dirt slide to the sides
        let leftX = x - 1;
        let rightX = x + 1;

        if (leftX >= 0 && rightX < gridWidth) {
            let leftHeight = 0;
            let rightHeight = 0;

            // Calculate the height of the left and right sides
            while (leftX >= 0 && grid[y + 1][leftX] === null) {
                leftHeight++;
                leftX--;
            }
            while (rightX < gridWidth && grid[y + 1][rightX] === null) {
                rightHeight++;
                rightX++;
            }

            // If the height of the left side is greater than or equal to 3 or the height of the right side is greater than or equal to 3, let the clods slide in both directions
            if (leftHeight >= 3 || rightHeight >= 3) {
                if (leftHeight >= rightHeight) {
                    grid[y + 1][x - leftHeight] = 'soil';
                    grid[y][x] = null;
                } else {
                    grid[y + 1][x + rightHeight] = 'soil';
                    grid[y][x] = null;
                }
            }
        }
    }
});

elements.water.behavior.push(function (y, x, grid) {
    if (grid[y + 1][x] === null) {
        grid[y + 1][x] = 'water';
        grid[y][x] = null;
    }
    else if (grid[y + 1][x] === 'soil') {
        if (Math.random() < 0.2) {
            grid[y + 1][x] = 'water';
            grid[y][x] = 'water';
        }
    }
    else if (grid[y + 1][x].startsWith('stone-')) {
        const randomDirection = Math.random() < 0.5 ? -1 : 1;
        const newX = x + randomDirection;
        if (newX >= 0 && newX < gridWidth && grid[y][newX] === null) {
            grid[y + 1][newX] = 'water';
            grid[y][x] = null;
        }
    }
});


function generateSoil() {

    // water
    for (let y = 130; y < 150; y++) {
        for (x = 0; x < gridWidth; x++) {
            if (grid[y][x] === null) {
                grid[y][x] = 'water';
            }
        }
    }
    //load soil and stone
    for (let y = 80; y < 150; y++) {
        for (let x = 0; x < gridWidth; x++) {

            if (grid[y][x] === null) {
                grid[y][x] = 'soil';

            }
            if (y >= 85 && (grid[y][x] === 'water' || grid[y][x] === 'soil') {
                if (Math.random() < 0.005) {

                    let stoneSizeX = Math.floor(Math.random() * 2) + 4;
                    let stoneSizeY = Math.floor(Math.random() * 2) + 4;
                    const stoneId = `stone-${stoneIdCounter++}`;

                    const variation = Math.floor(Math.random() * 20) - 10; // Random value between -10 and 10
                    stoneColors[stoneId] = adjustColor(elements.stone.color, variation);

                    for (let i = 0; i < stoneSizeX; i++) {
                        for (let j = 0; j < stoneSizeY; j++) {
                            const stoneX = x + i;
                            const stoneY = y - j;

                            const rotationAngle = Math.random() * Math.PI * 2;

                            for (let i = 0; i < stoneSizeX; i++) {
                                for (let j = 0; j < stoneSizeY; j++) {
                                    const stoneX = x + i;
                                    const stoneY = y - j;

                                    // Calculate elliptical values with increased noise
                                    const noise = Math.random() * 0.3 - 0.15;
                                    let ellipseX = (i - stoneSizeX / 2 + noise) / (stoneSizeX / 2);
                                    let ellipseY = (j - stoneSizeY / 2 + noise) / (stoneSizeY / 2);

                                    // Rotate the coordinates
                                    const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
                                    const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);

                                    // Use the elliptical equation to determine if a pixel is inside the ellipse
                                    if (rotatedX * rotatedX + rotatedY * rotatedY <= 1) {
                                        grid[stoneY][stoneX] = stoneId;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function updateGrid() {
    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            let element = grid[y][x];
            if (element && elements[element] && Array.isArray(elements[element].behavior)) {
                for (let func of elements[element].behavior) {
                    func(y, x, grid);
                }
            }
        }
    }
}


function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const element = grid[y][x];

            if (element && element.startsWith('stone-')) {
                if (isBoundary(x, y, grid, element)) {
                    // If it's a boundary pixel, paint it black
                    ctx.fillStyle = "#140e01"; // black color for outline
                } else {
                    ctx.fillStyle = stoneColors[element];
                }
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

            } else if (element in elements) {
                ctx.fillStyle = elements[element].color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function adjustColor() {
    const colors = ["#2a1f04", "#362804", "#201703"];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}


/*
function adjustColor(hexColor, amount) {
    let [r, g, b] = hexColor.match(/\w\w/g).map((c) => parseInt(c, 16));
    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}*/

window.addEventListener('load', function () {
    loop();
    generateSoil();
});

function isStone(cell) {
    return cell && cell.startsWith('stone-');
}

function isBoundary(x, y, grid, stoneId) {
    if (x > 0 && !isStone(grid[y][x - 1])) return true;          // Left
    if (x < gridWidth - 1 && !isStone(grid[y][x + 1])) return true; // Right
    if (y > 0 && !isStone(grid[y - 1][x])) return true;          // Above
    if (y < gridHeight - 1 && !isStone(grid[y + 1][x])) return true; // Below

    return false;
}

