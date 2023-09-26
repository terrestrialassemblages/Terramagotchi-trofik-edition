import Bacteria from './Bacteria.js';

const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

let timeMove = 0;
let chosenDirection = null;
let bacteriaIndex = 0;
let totalBacteriaIndex = 29;

let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));
let processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));
//let directionTimer = Array(gridHeight).fill().map(() => Array(gridWidth).fill(Math.floor(Math.random() * 5)));



const elements = {
    sand: {
        color: "#FFD700",   
        //density: 0.7, gravity: 0.8, slip: 0, slide: 0.8, scatter: 0,
        behavior: [],
    },
    soil: {
        color: "#826d5c",
        behavior: [],
    },
    root: {
        color: "#4d4436",
        max_size: 30,       // Biggest size a root can grow to
        behavior: [],
    },
    water: {
        color: "#5756c2",
        behavior: [],
    },

    bacteria: {
        color: "#800080", frameTimer: 15,
        bacteriaElements: [],
        behavior: [],
    },
    //bacteria: new Bacteria("#800080", 15, null, 0, []),

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


function findBacteriaByPosition(bacteriaElements, x, y) {
    for (let bacteria of bacteriaElements) {
        if (bacteria.x === x && bacteria.y === y) {
            return bacteria;
        }
    }
    return null;  // Return null if no matching bacteria is found
}




elements.bacteria.behavior.push(function(y, x, grid) {
    let currentBac = findBacteriaByPosition(elements.bacteria.bacteriaElements, x, y)

    let DISDANCE = 8;
    const result = currentBac.IfNearLiquidSugar(DISDANCE, grid);

    
    let ifNear = result.ifNear;
    let priorityDirection = result.priorityDirection;
    //console.log(priorityDirection);
    
    if(ifNear){
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0){
            
            chosenDirection = priorityDirection;
            //console.log(chosenDirection);

            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            currentBac.bacteriaMovement(newY, newX, grid, processed);
        }
    }
    else{
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0){
            
            //directionTimer smaller change direction more frequentlly
            if(elements.bacteria.directionTimer % 5 !== 0){
                chosenDirection = currentBac.choseDirection();
            }
            else{
                if(currentBac.currentDirection !== null){
                    chosenDirection = currentBac.currentDirection;
                    // If the bacteria is touching any boundary, choose a new direction
                    if(y == 0 || y == gridHeight - 1 || x == 0 || x == gridWidth - 1) {
                        chosenDirection = currentBac.choseDirection();
                    }
                }
                else{
                    chosenDirection = currentBac.choseDirection();
                }
            }
            elements.bacteria.directionTimer++;
            //console.log(chosenDirection);



            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            currentBac.bacteriaMovement(newY, newX, grid, processed);

        }
    }
});








function updateGrid() {
    processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

    for (let y = gridHeight - 1; y >= 0; y--) {
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
    generateSoil()
});

function generateSoil() {

    // water
    for (let y = 130; y < 150; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === null) {
                grid[y][x] = 'water';
            }
        }
    }
}

function generateRandomLiquidSugar() {
    for (let i = 0; i < 30; i++) {
        const randomX = Math.floor(Math.random() * gridWidth);
        const randomY = Math.floor(Math.random() * gridHeight);
        grid[randomY][randomX] = 'liquid_sugar';
    }
}
function generateBacterial() {
    //grid[129][20] = 'bacteria';
    
    for (let i = 0; i < 30; i++) {
        const randomX = Math.floor(Math.random() * gridWidth);
        const randomY = Math.floor(Math.random() * gridHeight);
        grid[randomY][randomX] = 'bacteria';
        //console.log(new Bacteria("#800080", 15, null, 0, []));
        elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], randomX, randomY))
        //currBacteria.updatePosition(newY, newX);


        //bacteriaIndex++;
        
    }
}