class Bacteria {
    constructor(color, frameTimer, currentDirection, directionTimer, behavior) {
        this.color = color;
        this.frameTimer = frameTimer;
        this.currentDirection = currentDirection;
        this.directionTimer = directionTimer;
        this.behavior = behavior;
    }
}


const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let timeMove = 0;
let chosenDirection = null;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));
let processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));
let bacteriaDirection = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));
//let directionTimer = Array(gridHeight).fill().map(() => Array(gridWidth).fill(Math.floor(Math.random() * 5)));



const elements = {
    sand: {
        color: "#FFD700",   
        //density: 0.7, gravity: 0.8, slip: 0, slide: 0.8, scatter: 0,
        behavior: [],
    },

    bacteria: new Bacteria("#800080", 15, null, 0, []),

    liquid_sugar: {
        color: "#FFD700",   
        transparency: 0.5, 
        behavior: [],
    },

};

let elementId = 0;
for(const elementName in elements){
    elements[elementName].id = elementId++;
}

//let currentParticleType = 'sand';


function choseDirection(currentDirection) { //currentDirection is a integer
    

    const directions = [
        {dy: -1, dx: 0},  // Up
        {dy: 1, dx: 0},  // Down
        {dy: 0, dx: -1}, // Left
        {dy: 0, dx: 1},  // Right
    ];

    //return directions[Math.floor(Math.random() * directions.length)];
    let newDirection = Math.floor(Math.random() * directions.length);

    if(elements.bacteria.currentDirection ==null){
        elements.bacteria.currentDirection = newDirection
        return directions[newDirection];    
    }


    if(newDirection % 2 == currentDirection % 2){
        newDirection = (currentDirection + 1) % 4; 
    }
    elements.bacteria.currentDirection = newDirection;
    return directions[newDirection];    
        
}



// Check for nearby liquid_sugar
function IfNearLiquidSugar(DISTANCE, y, x) {
    const directions = [
        {dy: -1, dx: 0},  // Up
        {dy: 1, dx: 0},  // Down
        {dy: 0, dx: -1}, // Left
        {dy: 0, dx: 1},  // Right
    ];

    for (let dy = -DISTANCE; dy <= DISTANCE; dy++) {
        for (let dx = -DISTANCE; dx <= DISTANCE; dx++) {
            if (y+dy >= 0 && y+dy < gridHeight && x+dx >= 0 && x+dx < gridWidth) {
                if (grid[y+dy][x+dx] === 'liquid_sugar') {
                    const distance = Math.sqrt(dy*dy + dx*dx);
                    if (distance <= DISTANCE) {
                        
                        
                        
                        if (dy < 0) return{
                            ifNear:true,
                            priorityDirection: directions[0]
                        }; // Up
                        else if (dy > 0) return{
                            ifNear:true,
                            priorityDirection: directions[1]
                        }; // Down
                        if (dx < 0) return{
                            ifNear:true,
                            priorityDirection: directions[2]
                        }; // Left
                        else if (dx > 0) return{
                            ifNear:true,
                            priorityDirection: directions[3]
                        }; // Right
                        
                    }
                }
            }
        }
    }
    return{
        ifNear:false,
        priorityDirection: directions[0]
    };
}




elements.bacteria.behavior.push(function(y, x, grid) {
    let DISDANCE = 8;
    const result = IfNearLiquidSugar(DISDANCE, y, x);
    let ifNear = result.ifNear;
    let priorityDirection = result.priorityDirection;

    //console.log(ifNear);
    if(ifNear){
        if (timeMove % elements.bacteria.frameTimer == 0){
        
            chosenDirection = priorityDirection;
            console.log(chosenDirection);

            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            grid[newY][newX] = 'bacteria';
            processed[newY][newX] = true;
            bacteriaDirection[newY][newX] = chosenDirection;
            grid[y][x] = null;
            bacteriaDirection[y][x] = null;
        }
    }
    else{
        if (timeMove % elements.bacteria.frameTimer == 0){

            if(elements.bacteria.directionTimer % 5 !== 0){
                chosenDirection = choseDirection(elements.bacteria.currentDirection);
            }
            else{
                if(bacteriaDirection[y][x] !== null){
                    chosenDirection = bacteriaDirection[y][x];
                }
                else{
                    chosenDirection = choseDirection(elements.bacteria.currentDirection);
                }
            }
            elements.bacteria.directionTimer++;

            // If the bacteria is touching any boundary, choose a new direction
            if(y == 0 || y == gridHeight - 1 || x == 0 || x == gridWidth - 1) {
                chosenDirection = choseDirection(elements.bacteria.currentDirection);
            }

            

            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            // If new position is out of bounds or occupied, choose a new direction
            let attempts = 0;
            while ((newY < 0 || newY >= gridHeight || newX < 0 || newX >= gridWidth || grid[newY][newX] !== null) && attempts < 4) {
                chosenDirection = choseDirection(elements.bacteria.currentDirection, true);
                newY = y + chosenDirection.dy;
                newX = x + chosenDirection.dx;
                attempts++;
            }

            grid[newY][newX] = 'bacteria';
            processed[newY][newX] = true;
            bacteriaDirection[newY][newX] = chosenDirection;
            grid[y][x] = null;
            bacteriaDirection[y][x] = null;
        }
    }
});






function updateGrid() {
    processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            let element = grid[y][x];
            let IsProcessed = processed[y][x];
            if(!IsProcessed){
                if (element && elements[element] && Array.isArray(elements[element].behavior)) {
                    for (let func of elements[element].behavior) {
                        func(y, x, grid);
                    }
                }
            } 
        }
    }
}


            


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] in elements) {
                ctx.fillStyle = elements[grid[y][x]].color;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

}

/*
canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    grid[y][x] = currentParticleType;
});
*/



function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);
    timeMove++;
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
        grid[randomY][randomX] = 'bacteria';
        
        

    }
}