const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));

let colorGrid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));


const elements = {
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
};

let elementId = 0;
for(const elementName in elements){
    elements[elementName].id = elementId++;
}

elements.liquid_sugar.behavior.push(function(y, x, grid) {
    
    if (grid[y][x] === null) {
        grid[y][x] = 'liquid_sugar';
        //stay at the place where it's been draw
    } 
});

const COLOR_CHANGE_INTERVAL = 400; // Change to update how fast bacteria die out
const timeStep = 1000 / 60; 
let lastUpdateTime = performance.now();
let timeDifference = 0;

elements.bacterial.behavior.push(function(y, x, grid) {

    let DISTANCE = 8;

    // Random movement direction
    const directions = [
        {dy: -1, dx: 0},  // Up
        {dy: 1, dx: 0},  // Down
        {dy: 0, dx: -1}, // Left
        {dy: 0, dx: 1},  // Right
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
            if (y+dy >= 0 && y+dy < gridHeight && x+dx >= 0 && x+dx < gridWidth) {
                if (grid[y+dy][x+dx] === 'liquid_sugar') {
                    const distance = Math.sqrt(dy*dy + dx*dx);
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

function updateLoop() {
    const currentTime = performance.now();
    timeDifference += currentTime - lastUpdateTime;
    lastUpdateTime = currentTime;

    while (timeDifference >= timeStep) {
        updateGrid();
        timeDifference -= timeStep;
    }

    drawGrid();
    requestAnimationFrame(updateLoop);
}

function updateGrid() {
    for (let y = gridHeight - 1; y >= 0; y--) {
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
            /*
            if (grid[y][x] == "bacterial"){
                ctx.fillStyle = elements[grid[y][x]].color[0]; 
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
            */
            
            if (grid[y][x] == 'bacterial') {
                ctx.fillStyle = colorGrid[y][x]
                console.log("Current color:", colorGrid[y][x]);
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                // ... rest of the drawing logic
            }
            else if (grid[y][x] in elements){
                ctx.fillStyle = elements[grid[y][x]].color; 
                ctx.globalAlpha = elements.liquid_sugar.transparency || 1;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                ctx.globalAlpha = 1;
            }
        }
    }

}




function loop() {
    lastUpdateTime = performance.now();
    updateLoop();
}



window.addEventListener('load', function() {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    loop();
    generateRandomLiquidSugar();
    generateBacterial();
});

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



