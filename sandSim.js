import RootStructure from './root.js';
import Fungi from './fungi.js';
import Bacteria from './bacteria.js';
import Aggregate from './aggregate.js';


//bacteira related variables
let timeMove = 0;
let chosenDirection = null;
let bacteriaIndex = 0;
let totalBacteriaIndex = 29;



const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

const gridWidth = 200;  // Change for finer granularity
const gridHeight = 150; // Change for finer granularity
const cellSize = canvas.width / gridWidth;

export let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));
let processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

export let currentParticleType = 'rootTip';
export let timeStep = 0;
export let rootIndex = 0;
export let totalRootIndex = 0;
export let fungiIndex = 0;
export let totalFungiIndex = 0;

export default class RootTip extends RootStructure {
    constructor(startingY, startingX, fungiParent, index) {
        super(startingY, startingX, 10, 500, 'rootTip', 900, index);
        this.parentFungi = new Array();
        this.parentFungi.push(fungiParent);
        console.log(this.parentFungi);
    }

    // Function to produce liquid sugar from root tip
    // CHANGED TO PRODUCE ONLY 1 LIQUID SUGAR AT A TIME, CURRENTLY DOES NOT RESTORE THE PREVIOUS BLOCK IF LIQUID SUGAR GETS EATEN
    produceSugar() {
        if (grid[this.y][this.x] == 'rootTip') {

            // If the block below is soil or fungi, produce liquid sugar
            if (grid[this.y + 1][this.x] === 'soil' || grid[this.y + 1][this.x] === 'fungi') {
                grid[this.y + 1][this.x] = 'liquidSugar';
            }
        }
    }

    // Function to check if liquid sugar has been eaten. If yes, allows root to grow larger
    sugarEaten() {
        // If developed == true, and a full bacteria that has eaten liquid sugar touches the tip of the root, increase length of the root.
        // Set developed to false and increase max_growth length for rootTip



        if (this.developed == true && grid[this.y + 1][this.x] == 'bacteria') {
            // Increase max length of rootTip
            this.developed = false;
            this.maxGrowthLength += 2;
            for (let i = 0; i < this.parentFungi.length; i++) {
                this.parentFungi[i].expandRoot(elements.fungi.fungiElements, fungiIndex, totalFungiIndex);
            }
            // this.growthSpeed = Math.round(this.growthSpeed * (2 / 3));
            console.log("SUGAR EATEN, INCREASING LENGTH FOR ROOT: ", this.index);
        }
    }
}


export function incrementTotalFungiIndex(incrementedIndex) {
    totalFungiIndex = incrementedIndex;
}

export function decrementTotalFungiIndex(decrementedIndex) {
    totalFungiIndex = decrementedIndex;
}





export const elements = {
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

    fungi: {
        color: "#808080",
        fungiElements: [],
        behavior: [],
    },
    liquidSugar: {
        color: "#FFB700",
        behavior: [],
    },
    bacteria: {
        color: "#800080", frameTimer: 15,
        bacteriaElements: [],
        behavior: [],
    },
    aggregate: {
        color: '#593e2b',
        //color: '#000000',
        aggregateElements: [],
        behavior: [],
    },
};



function generateSoil(y, x, macro = false) {
    //currentBac.oldElement = 'aggregate';

    let aggregateSizeX = Math.floor(Math.random() * 2) + 1;
    let aggregateSizeY = Math.floor(Math.random() * 2) + 1;

    if (macro == true){
        aggregateSizeX = Math.floor(Math.random() * 2) + 2;
        aggregateSizeY = Math.floor(Math.random() * 2) + 1;
    }
    
    const rotationAngle = Math.random() * Math.PI * 2;

    for (let i = 0; i < aggregateSizeX; i++) {
        for (let j = 0; j < aggregateSizeY; j++) {
            const aggregateX = x + i;
            const aggregateY = y - j;
            const rotationAngle = Math.random() * Math.PI * 2;
            for (let i = 0; i < aggregateSizeX; i++) {
                for (let j = 0; j < aggregateSizeY; j++) {
                    const aggregateX = x + i;
                    const aggregateY = y - j;
                    // Calculate elliptical values with increased noise
                    const noise = Math.random() * 0.3 - 0.15;
                    let ellipseX = (i - aggregateSizeX / 2 + noise) / (aggregateSizeX / 2);
                    let ellipseY = (j - aggregateSizeY / 2 + noise) / (aggregateSizeY / 2);
                    // Rotate the coordinates
                    const rotatedX = ellipseX * Math.cos(rotationAngle) - ellipseY * Math.sin(rotationAngle);
                    const rotatedY = ellipseX * Math.sin(rotationAngle) + ellipseY * Math.cos(rotationAngle);
                    // Use the elliptical equation to determine if a pixel is inside the ellipse
                    if (rotatedX * rotatedX + rotatedY * rotatedY <= 1) {
                        if (rotatedX * rotatedX + rotatedY * rotatedY <= 1 && grid[aggregateY][aggregateX] == 'soil') {
                            let aggInstance = new Aggregate(aggregateY, aggregateX, null, null);
                            elements.aggregate.aggregateElements.push(aggInstance);
                            grid[aggregateY][aggregateX] = 'aggregate';

                            if (macro == true){
                                aggInstance.hasGrow = true;
                                
                            }
                            
                        }
                    
                    }
                }
            }
        }
    }
}



elements.aggregate.behavior.push(function(y, x, grid) {
    let currAggr = findAggregateByPosition(elements.aggregate.aggregateElements, x, y);

    if (grid[y][x] === 'aggregate') {
        const result = currAggr.ifNearOtherAgg(3, grid)
        //console.log("result", result)
        if (result){
            if (!currAggr.hasGrow){
                generateSoil(y, x, result);
                currAggr.hasGrow = true;
            }
        }
    }

});


export function findBacteriaByPosition(bacteriaElements, x, y) {
    for (let bacteria of bacteriaElements) {
        if (bacteria.x === x && bacteria.y === y) {
            return bacteria;
        }
    }
    return null;  // Return null if no matching bacteria is found
}



elements.bacteria.behavior.push(function (y, x, grid) {
    let currentBac = findBacteriaByPosition(elements.bacteria.bacteriaElements, x, y)

    // if bacteria is fading, dont move
    if (currentBac.fading) {      
        return;
    }

    let DISDANCE = 40;
    const result = currentBac.IfNearLiquidSugar(DISDANCE, grid);

    let Agregate = currentBac.IfNearBacteria(5, grid, 2)
    //console.log("agr", Agregate)
    if (Agregate){
        generateSoil(y, x);
    }
    

    let ifNear = result.ifNear;
    let priorityDirection = result.priorityDirection;
    //console.log(priorityDirection);

    if (ifNear) {
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0) {

            chosenDirection = priorityDirection;
            //console.log(chosenDirection);

            // Apply the movement
            let newY = y + chosenDirection.dy;
            let newX = x + chosenDirection.dx;

            currentBac.bacteriaMovement(newY, newX, grid, processed);
        }
    }
    else {
        //console.log(timeMove % elements.bacteria.frameTimer);
        if (timeMove % elements.bacteria.frameTimer == 0) {

            //directionTimer smaller change direction more frequentlly
            if (elements.bacteria.directionTimer % 5 !== 0) {
                chosenDirection = currentBac.choseDirection();
            }
            else {
                if (currentBac.currentDirection !== null) {
                    chosenDirection = currentBac.currentDirection;
                    // If the bacteria is touching any boundary, choose a new direction
                    if (y == 0 || y == gridHeight - 1 || x == 0 || x == gridWidth - 1) {
                        chosenDirection = currentBac.choseDirection();
                    }
                }
                else {
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


// The body of the root
elements.root.behavior.push(function (y, x, grid) {
    // If no block below, remove root
    if (grid[y + 1][x] === null) {
        grid[y][x] = null;
    }
});


// This is the ends of the roots
elements.rootTip.behavior.push(function (y, x, grid) {

    // Update for every RootTip instance in the grid array
    if (totalRootIndex > 0) {

        // Get the current rootTip object
        let curr = elements[grid[y][x]].rootElements[rootIndex];

        // Check if sugar produced has been eaten
        curr.sugarEaten()

        // Ckeck if root can grow
        let result = curr.growBool(totalRootIndex);

        // Update totalRootIndex
        totalRootIndex = result[1];

        // If it can grow, expand root
        if (result[0]) {
            totalRootIndex = curr.expandRoot(elements.rootTip.rootElements, rootIndex, totalRootIndex);
        }
        rootIndex++;

        // Reset index once we finish iterating through all the rootTips
        if (rootIndex >= totalRootIndex) {
            rootIndex = 0;
        }
    }

});


elements.fungi.behavior.push(function (y, x, grid) {
    if (totalFungiIndex > 0) {
        let curr = elements[grid[y][x]].fungiElements[fungiIndex];
        // If root is not at max size, expand root
        let result = curr.growBool(totalFungiIndex);
        totalFungiIndex = result[1];
        if (result[0]) {
            //console.log("TIME TO GROW");
            // Branch out to the root tip and attach to it
            if (curr.branchingToRoot == true && curr.attached == false) {
                if (curr.nearestRootFound == false) {
                    // Find the closest root tip at that moment
                    curr.findRootTip();
                }
                else {
                    // Expand to root tip
                    curr.expandFungiToRoot();
                }
            }
            else {
                // Every other fungi root that will normally grow
                curr.expandRoot(elements.fungi.fungiElements, fungiIndex, totalFungiIndex);
            }
        }
        fungiIndex++;

        if (fungiIndex >= totalFungiIndex) {
            fungiIndex = 0;
        }
    }

});


elements.liquidSugar.behavior.push(function (y, x, grid) {
    // If no block below, remove
    if (grid[y + 1][x] === null) {
        grid[y][x] = null;
    }
});




function updateGrid() {
    processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));

    for (let y = gridHeight - 2; y >= 0; y--) {
        for (let x = 0; x < gridWidth; x++) {
            let element = grid[y][x];
            let IsProcessed = processed[y][x];
            if (!IsProcessed) {
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
                if (grid[y][x] === 'bacteria') {
                    // Draw bacteria with the adjusted alpha value
                    ctx.fillStyle = elements.bacteria.color;
                    ctx.globalAlpha = elements.bacteria.bacteriaElements.find(bacteria => bacteria.x === x && bacteria.y === y)?.fadeAlpha || 1.0;
                } else {
                    ctx.fillStyle = elements[grid[y][x]].color; // Set color based on element type
                    ctx.globalAlpha = 1.0; // Reset alpha for other elements
                }
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    ctx.globalAlpha = 1.0;
}

canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    // Add 'aggregate' to the grid at the clicked location
    grid[y][x] = 'aggregate';
    let aggInstance = new Aggregate(y, x, null, null);
    elements.aggregate.aggregateElements.push(aggInstance);
});



/*
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
        //console.log(currentParticleType);
        if (currentParticleType == 'rootTip') {
            elements[currentParticleType].rootElements.push(new RootTip(y, x, totalRootIndex++));
        }
        else if (currentParticleType == 'fungi') {
            elements[currentParticleType].fungiElements.push(new Fungi(y, x, true, totalFungiIndex++));
        }
    }
});
*/

function loop() {
    updateGrid();
    drawGrid();
    requestAnimationFrame(loop);
    //testing()
    
    timeStep++;
    timeMove++;

    elements.bacteria.bacteriaElements.forEach((bacteria, index) => {
        bacteria.decreaseLifespan();
        if (bacteria.lifespan <= 0) {
            // Bacteria dies out
            bacteria.fade(ctx, elements, cellSize, grid, index);            
        }
    });

    elements.bacteria.bacteriaElements.forEach((bacteria, index) => {
        if(grid[bacteria.y][bacteria.x]!= "bacteria"){
            elements.bacteria.bacteriaElements.splice(index, 1);
        }
        //console.log(elements.bacteria.bacteriaElements);
        
    });
}

window.addEventListener('load', function () {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    loop();
    
    drawAutomatically();
    //generateSoil();
    generateBacterial();
});

function drawAutomatically() {
    // Logic to preload elements onto the grid

    // fill background up with soil
    for (let i = 80; i < 150; i++) {
        for (let j = 0; j < 200; j++) {
            grid[i][j] = 'soil';
        }

    }

    // Grow some roots and fungi

    // 80 25
    let fungiObj = new Fungi(81, 25, false, totalFungiIndex++);
    grid[81][25] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);
    let rootObj = new RootTip(80, 25, fungiObj, totalRootIndex++);
    grid[80][25] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;


    // 80 75
    grid[81][75] = 'fungi';
    fungiObj = new Fungi(81, 75, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(fungiObj);
    rootObj = new RootTip(80, 75, fungiObj, totalRootIndex++);
    grid[80][75] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;




    // 81 140
    grid[81][140] = 'fungi';
    fungiObj = new Fungi(81, 140, false, totalFungiIndex++)
    elements.fungi.fungiElements.push(fungiObj);
    rootObj = new RootTip(80, 140, fungiObj, totalRootIndex++);
    grid[80][140] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;


    // Call any other functions required to render the grid on the canvas.
}

function generateBacterial() {
    //grid[129][20] = 'bacteria';

    for (let i = 0; i < 50; i++) {
        /*
        let i = 10; // Example start of range
        let j = 50; // Example end of range

        let randomNumber = Math.floor(Math.random() * (j - i + 1)) + i;
        console.log(randomNumber);*/

        const randomX = Math.floor(Math.random() * (200 - 0 + 1)) + 0;
        const randomY = Math.floor(Math.random() * (120 - 80 + 1)) + 80;
        if (grid[randomY][randomX]== 'soil') {
            grid[randomY][randomX] = 'bacteria';
            grid[randomY+1][randomX+1] = 'bacteria';
        }


        elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], randomX, randomY, 80))
        elements.bacteria.bacteriaElements.push(new Bacteria("#800080", 15, null, 0, [], randomX+1, randomY+1, 4000))

        //currBacteria.updatePosition(newY, newX);


        //bacteriaIndex++;

    }
}

function testing(){
    //elements.aggregate.bacteriaElements.push(new Agregate(0, 0))
    grid[20][20] = 'aggregate'
    grid[21][20] = 'fungi'
    
    generateSoil(20, 20, ifNearOtherAgg(grid, 20, 20))
    

    grid[23][20] = 'aggregate'

    grid[140][20] = 'aggregate'
    grid[23][21] = 'fungi'
}

export function findAggregateByPosition(aggregateElements, x, y) {
    for (let aggregate of aggregateElements) {
        if (aggregate.x === x && aggregate.y === y) {
            return aggregate;
        }
    }
    return null;  // Return null if no matching bacteria is found
}