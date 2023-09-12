const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));

let colorGrid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));

let stoneIdCounter = 0;
let stoneColors = {};

// Test class for Roots
class RootTip {
    constructor(startingY, startingX, index) {
        this.startingY = startingY;
        this.startingX = startingX;
        this.y = startingY;
        this.x = startingX;
        // Reference it in the list of roots
        this.index = index;
        // Every growthSpeed number of time steps, it will grow (Higher growthSpeed means it grows slower)
        this.growthSpeed = 100;
        this.maxGrowthLength = 20;
        this.length = 1;
    }

    // Determines if root should grow or not
    growBool() {
        if (this.length == this.maxGrowthLength) {
            console.log(this.length, "CANT GROW");

            // Remove from array if length is max
            elements['rootTip'].rootElements.splice(rootIndex, 1);
            totalRootIndex--;
            console.log(elements['rootTip'].rootElements, totalRootIndex);

            // Produces sugar when the root is max length
            this.produceSugar();
        }
        return ((timeStep % this.growthSpeed == 0) && (this.length < this.maxGrowthLength));
    }

    // Adjusts the growth speed depending on the current length
    updateGrowthSpeed() {
        // Pythagoras from starting location
        // let distance = Math.sqrt(Math.pow(Math.abs(this.y - this.startingY), 2) + (Math.pow(Math.abs(this.x - this.startingX), 2)));
        // Growth speed scaled according to difference in length from maxGrowthLength
        this.growthSpeed = Math.ceil(1000 / (1 + this.maxGrowthLength / this.length));
        console.log("GROWTH SPEED", this.growthSpeed);
        console.log(elements['rootTip'].rootElements);
    }

    // Checks if neighboring cells are soil (left, right, down, down-left, and down-right)
    canGrow(y, x) {
        console.log(y, x);
        if (grid[y][x - 1] === 'soil' &&
            grid[y][x + 1] === 'soil' &&
            grid[y + 1][x] === 'soil' &&
            grid[y + 1][x - 1] === 'soil' &&
            grid[y + 1][x + 1] === 'soil') {
            return true;
        }
        return false;
    }

    // Fuction to grow root by one grid cell
    expandRoot() {

        // Randomly choose -1, 0, or 1 for x growth direction (either grow left-down, down, right-down)
        let x_direction = Math.floor(Math.random() * 3) - 1;

        // Set the probability to branch into 2 roots
        let shouldBranch = Math.random() < 0.2;

        // If shouldBranch is true, and there is enough space to grow, grow 2 roots diagonally down in opposite directions (enough space means the grid it is growing onto + both adjacent grids to that are soil)
        if (grid[this.y + 1][this.x - 1] === 'soil' && this.canGrow(this.y + 1, this.x - 1) &&
            grid[this.y + 1][this.x + 1] === 'soil' && this.canGrow(this.y + 1, this.x + 1) && shouldBranch) {
            grid[this.y + 1][this.x - 1] = 'rootTip';

            // Create a new rootTip object for branched root tip
            let branchRootTip = new RootTip(this.y + 1, this.x + 1, totalRootIndex++);
            branchRootTip.length = this.length + 2;
            elements['rootTip'].rootElements.push(branchRootTip);

            grid[this.y + 1][this.x + 1] = 'rootTip';
            grid[this.y][this.x] = 'root';
            // Update length
            this.length += 2;
            this.y++;
            this.x--;
            console.log("GROWING1", rootIndex);


            // Not branching but there is enough space to grow, grow in that direction
        } else if (grid[this.y + 1][this.x + x_direction] === 'soil' && this.canGrow(this.y + 1, this.x + x_direction)) {
            // Update length
            this.length += 1;
            grid[this.y + 1][this.x + x_direction] = 'rootTip';
            grid[this.y][this.x] = 'root';
            this.y++;
            this.x += x_direction;
            console.log("GROWING2", rootIndex);

            // If no block is below the root, remove root
        } else if (grid[this.y + 1][this.x] === null) {
            grid[this.y][this.x] = null;
            console.log("GROWING3", rootIndex);
        }
        // No space to grow
        else {
            // Remove from array
            elements['rootTip'].rootElements.splice(rootIndex, 1);
            totalRootIndex--;
            console.log("NOT WORKING");
        }

        this.updateGrowthSpeed();
        console.log("UPDATED GROWTH SPEED");
    }

    // Function to produce liquid sugar around the rootTip
    produceSugar() {
        // Choose the rage around rootTip where sugar is produced
        const sugarRange = 1;

        for (let y = this.y - sugarRange; y <= this.y + sugarRange; y++) {
            for (let x = this.x - sugarRange; x <= this.x + sugarRange; x++) {
                // Check if the grid cell is within bounds and contains soil
                if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth && grid[y][x] === 'soil') {
                    // Replace soil with liquidsugar
                    grid[y][x] = 'liquidSugar';
                }
            }
        }
    }
}

const elements = {
    sand: {
        color: "#FFD700",
        //density: 0.7, gravity: 0.8, slip: 0, slide: 0.8, scatter: 0,
        behavior: [],
    },

    ////placeholder implementation of soil, needed to simulate plant roots
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

    root: {
        color: "#4d4436",
        max_size: 30,       // Biggest size a root can grow to
        behavior: [],
    },

    rootTip: {
        color: "#6b5e4a",
        rootElements: [],
        behavior: [],
    },

    liquidSugar: {
        color: "#ffbf00",
        behavior: [],
    },

    liquid_sugar: {
        color: "#FFD700",
        transparency: 0.5,
        behavior: [],
    },
    bacterial: {
        color: ["#4287f5", "#aa71f0", "#f59de2", "#f59da0", "#f5b69d"],  //bacterial has different color 
        transparency: 1, frameCounter: 0, currentDirection: null, hasEat: 0,
        behavior: [],
    },

    fungi: {
        colour: "white",
        behaviour: [],
    },
};

let elementId = 0;
for (const elementName in elements) {
    elements[elementName].id = elementId++;
}

let currentParticleType = 'rootTip';
let timeStep = 0;
let rootIndex = 0;
let totalRootIndex = 0;


elements.sand.behavior.push(function (y, x, grid) {
    // Sand behavior logic goes here, based on the extracted updateGrid function
    if (grid[y + 1][x] === null) {
        // Move sand down
        grid[y + 1][x] = 'sand';
        grid[y][x] = null;
    } else if (grid[y + 1][x] === 'water') {
        // If there's water below the sand, swap the two
        grid[y + 1][x] = 'sand';
        grid[y][x] = 'water';
    }
    // ... rest of the sand behavior ...
});

//// Placeholder implementation of soil
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

elements.liquid_sugar.behavior.push(function (y, x, grid) {

    if (grid[y][x] === null) {
        grid[y][x] = 'liquid_sugar';
        //stay at the place where it's been draw
    }
});

const COLOR_CHANGE_INTERVAL = 400; // Change to update how fast bacteria die out

elements.bacterial.behavior.push(function (y, x, grid) {

    let DISTANCE = 8;

    // Random movement direction
    const directions = [
        { dy: -1, dx: 0 },  // Up
        { dy: 1, dx: 0 },  // Down
        { dy: 0, dx: -1 }, // Left
        { dy: 0, dx: 1 },  // Right
    ];

    // If the frameCounter is not divisible by 3, skip the movement and just increment the counter
    if (elements.bacterial.frameCounter % 13 !== 0) {
        elements.bacterial.frameCounter++;
        return;
    }

    if (elements.bacterial.frameCounter >= 8 || !elements.bacterial.currentDirection) {
        elements.bacterial.currentDirection = directions[Math.floor(Math.random() * directions.length)];
        elements.bacterial.frameCounter = 0;
    }
    let chosenDirection = elements.bacterial.currentDirection;

    // Check for nearby liquid_sugar
    for (let dy = -DISTANCE; dy <= DISTANCE; dy++) {
        for (let dx = -DISTANCE; dx <= DISTANCE; dx++) {
            if (y + dy >= 0 && y + dy < gridHeight && x + dx >= 0 && x + dx < gridWidth) {
                if (grid[y + dy][x + dx] === 'liquid_sugar') {
                    const distance = Math.sqrt(dy * dy + dx * dx);
                    if (distance <= DISTANCE) {
                        if (dy < 0) chosenDirection = directions[0]; // Up
                        else if (dy > 0) chosenDirection = directions[1]; // Down
                        if (dx < 0) chosenDirection = directions[2]; // Left
                        else if (dx > 0) chosenDirection = directions[3]; // Right
                    }
                }
            }
        }
    }

    let hasEaten = false;

    // Clear neighboring liquid_sugar cells
    for (let dir of directions) {
        let neighborY = y + dir.dy;
        let neighborX = x + dir.dx;
        if (neighborY >= 0 && neighborY < gridHeight && neighborX >= 0 && neighborX < gridWidth && grid[neighborY][neighborX] === 'liquid_sugar') {
            grid[neighborY][neighborX] = null;  // Clear the neighboring liquid_sugar
            hasEaten = true;
        }
    }


    let currentColorIndex = elements.bacterial.color.indexOf(colorGrid[y][x]);

    if (hasEaten) {
        elements.bacterial.hasEat = 0;

        if (currentColorIndex < elements.bacterial.color.length - 1) {
            currentColorIndex++;
        }
    } else {
        elements.bacterial.hasEat++; // Add to hunger counter

        // Check if we have to change to previous color from hunger
        if (elements.bacterial.hasEat % COLOR_CHANGE_INTERVAL === 0) {
            if (currentColorIndex > 0) {
                currentColorIndex--; // Change to previous color
            } else {
                // Bacterial dies 
                grid[y][x] = null;
                colorGrid[y][x] = null;
                return;
            }
        }
    }

    colorGrid[y][x] = elements.bacterial.color[currentColorIndex];



    // Apply the movement
    let newY = y + chosenDirection.dy;
    let newX = x + chosenDirection.dx;



    if (newY >= 0 && newY < gridHeight && newX >= 0 && newX < gridWidth && grid[newY][newX] === null) {
        grid[newY][newX] = 'bacterial';
        colorGrid[newY][newX] = colorGrid[y][x];
        grid[y][x] = null;
        colorGrid[y][x] = null;
    }

    //console.log("Current color index:", colorGrid[newY][newX]);



    // Increment the frameCounter
    elements.bacterial.frameCounter++;
});


// The body of the root
elements.root.behavior.push(function (y, x, grid) {
    // If no block below, remove root
    if (grid[y + 1][x] === null) {
        grid[y][x] = null;
    }
});

// This is the ends of the roots
elements.rootTip.behavior.push(function (y, x, grid) {

    if (totalRootIndex > 0) {
        curr = elements[grid[y][x]].rootElements[rootIndex];

        // If root is allow to grow, grow
        if (curr.growBool()) {
            curr.expandRoot(y, x);
        }
        rootIndex++;
        if (rootIndex >= totalRootIndex) {
            rootIndex = 0;
        }
    }
});

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

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const element = grid[y][x];
            if (element == 'bacterial') {
                ctx.fillStyle = colorGrid[y][x]
                console.log("Current color:", colorGrid[y][x]);
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                // ... rest of the drawing logic
            }
            else if (element in elements) {
                ctx.fillStyle = elements[grid[y][x]].color;
                ctx.globalAlpha = elements.liquid_sugar.transparency || 1;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                ctx.globalAlpha = 1;
            }
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


// User actions
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    if (event.button === 1) {
        // Cycle to the next element with middle mouse button
        //// ERROR WITH FLOATING SOIL IF YOU CYCLE ELEMENTS TOO MUCH
        const elementNames = Object.keys(elements);
        const currentIndex = elementNames.indexOf(currentParticleType);
        const nextIndex = (currentIndex + 1) % elementNames.length;
        currentParticleType = elementNames[nextIndex];
    } else {
        // Place the current element on the grid with Mouse1
        grid[y][x] = currentParticleType;
        console.log("PLACING");
        console.log(currentParticleType);
        if (currentParticleType == 'rootTip') {
            console.log("PLACING ROOT Tip");
            elements[currentParticleType].rootElements.push(new RootTip(y, x, totalRootIndex++));
        }
    }
});


function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);
    timeStep++;
}

window.addEventListener('load', function () {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    loop();
    drawSandAutomatically();
    generateRandomLiquidSugar();
    generateBacterial();
    generateSoil();
});

function drawSandAutomatically() {

    // // grow some roots
    grid[79][25] = 'rootTip';
    elements[currentParticleType].rootElements.push(new RootTip(79, 25, totalRootIndex++));
    grid[79][75] = 'rootTip';
    elements[currentParticleType].rootElements.push(new RootTip(79, 75, totalRootIndex++));
    grid[79][90] = 'rootTip';
    elements[currentParticleType].rootElements.push(new RootTip(79, 90, totalRootIndex++));
    grid[79][160] = 'rootTip';
    elements[currentParticleType].rootElements.push(new RootTip(79, 160, totalRootIndex++));
    grid[79][165] = 'rootTip';
    elements[currentParticleType].rootElements.push(new RootTip(79, 165, totalRootIndex++));

    // Call any other functions required to render the grid on the canvas.
}

function generateRandomLiquidSugar() {
    for (let i = 0; i < 30; i++) {
        const randomX = Math.floor(Math.random() * gridWidth);
        const randomY = Math.floor(Math.random() * gridHeight);
        grid[randomY][randomX] = 'liquid_sugar';
    }
}
function generateBacterial() {
    for (let i = 0; i < 30; i++) {
        const randomX = Math.floor(Math.random() * gridWidth);
        const randomY = Math.floor(Math.random() * gridHeight);
        grid[randomY][randomX] = 'bacterial';
        colorGrid[randomY][randomX] = elements.bacterial.color[0];


    }
}

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
            if (grid[y][x] === 'water' || grid[y][x] === 'soil') {
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

function adjustColor() {
    const colors = ["#2a1f04", "#362804", "#201703"];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

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