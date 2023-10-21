import RootStructure from './root/root.js';
import Fungi from './fungi/fungi.js';
import RootTip from './root/rootTip.js';
import { plantAt, updatePlantGrowth } from './plant/plant_behavior.js';
//import {calculateSoilColor} from './aggregate_behavior.js';
import { updateSoilcolor, updateSoilAlpha, updateInitialAlpha, initSoilGradient, calculateSoilColor } from './aggregate/aggregate_behavior.js';
import { chemicalBehavior, generateChemical, chemInWaterBehavior } from './chemical.js';
import { waterBehavior, resetLifeSpan } from './weather/water_behavior.js';
import { waterInSoilBehavior } from './weather/waterInSoil.js'
import { soilBehavior } from './soil_behavior.js';
import { rootBehavior } from './root/root_behavior.js';
import { rootTipBehavior } from './root/roottip_behavior.js';
import { sunShow, drawSun, rainTimeout, generateRain, rainShow, addSunvalue, reduceSunvalue, startRain, sunlight, getNextsunValue, sunValue, setTime } from './weather/weather.js';
import { drawGrass } from './grass_draw.js';
import { findBacteriaByPosition, generateBacterial, bacteriaBehavior } from './bacteria/bacteria_behavior.js';
import { fungiBehavior } from './fungi/fungi_behavior.js';
import { connectToDB } from './firebase.js';


// Initialize canvas
export const canvas = document.getElementById('sandCanvas');
const ctx = canvas.getContext('2d');

export const gridWidth = 200;  // Change for finer granularity
export const gridHeight = 150; // Change for finer granularity

export let ratio = 1.0;
let pixelSize = Math.ceil(4 * (canvas.height / 600));
if(canvas.width > canvas.height && canvas.width/canvas.height >1.33){
    pixelSize = Math.ceil(4 * (canvas.width / 800));
}

export let globalY = Math.ceil(canvas.height/3/pixelSize);
export let rangeX = Math.ceil(canvas.width/pixelSize);

export let cellSize = pixelSize;
export const topCanvas = document.getElementById('topCanvas');
const ctxTop = topCanvas.getContext('2d');

export let topGrid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));
export let grid = Array(gridHeight).fill().map(() => Array(gridWidth).fill(null));
export let processed = Array(gridHeight).fill().map(() => Array(gridWidth).fill(false));


// Fungi and Root related variables
export let currentParticleType = 'rootTip';
export let timeStep = 0;
export let rootIndex = 0;
export let totalRootIndex = 0;
export let fungiIndex = 0;
export let totalFungiIndex = 0;
export let envTimeCounter = 0;


// Bacteira related variables
export let timeMove = 0;
export let chosenDirection = null;


// water related variables
export let timeWaterSink = 0;


export function incrementTotalFungiIndex(incrementedIndex) {
    totalFungiIndex = incrementedIndex;
}

export function decrementTotalFungiIndex(decrementedIndex) {
    totalFungiIndex = decrementedIndex;
}

export function changeChosenDirection(newDirection) {
    chosenDirection = newDirection;
}

export function IncrementFungiIndex(newIndex) {
    fungiIndex = newIndex;
}

export function DecrementFungiIndex(newIndex) {
    fungiIndex = newIndex;
}

export function resetFungiIndex() {
    fungiIndex = 0;
}

export function incrementTotalRootIndex(incrementedIndex) {
    totalRootIndex = incrementedIndex;
}

export function decrementTotalRootIndex(decrementedIndex) {
    totalRootIndex = decrementedIndex;
}

export function IncrementRootIndex(newIndex) {
    rootIndex = newIndex;
}

export function decrementRootIndex(newIndex) {
    rootIndex = newIndex;
}

export function resetRootIndex() {
    rootIndex = 0;
}


export const elements = {
    soil: {
        color: "#8f614a",
        behavior: [],
        soilAlpha: {},
        initAlpha: {},
    },
    water: {
        color: "#5756c2",
        behavior: [],
    },
    root: {
        color: "#706f6e",
        max_size: 30,       // Biggest size a root can grow to
        behavior: [],
    },
    rootTip: {
        color: "#6b5e4a",
        rootElements: [],
        behavior: [],
    },

    fungi: {
        color: "#b5b5b5",
        fungiElements: [],
        behavior: [],
    },
    liquidSugar: {
        color: "#FFB700",
        behavior: [],
    },
    bacteria: {
        color: "#c151e0", frameTimer: 15, directionTimer: 20,
        bacteriaElements: [],
        behavior: [],
    },
    aggregate: {
        color: '#5e3920',
        //color: '#000000',
        aggregateElements: {},
        behavior: [],
    },
    plant: {
        color: '#2c7f3f',
        behavior: [],
        plantElements: [], 
    },
    waterInSoil: {
        color: "#5756c2",
        behavior: [],
        waterElements: [],
    },
    chemical: {
        color: "#446B32",
        behavior: [],
    },
    chemInWater: {
        color: "#167360",
        behavior: [],
    }
};

elements.water.behavior.push((y, x, grid) => waterBehavior(y, x, grid, gridHeight));
elements.waterInSoil.behavior.push((y, x, grid) => waterInSoilBehavior(y, x, grid));
elements.fungi.behavior.push((y, x, grid) => fungiBehavior(y, x, grid));
elements.root.behavior.push((y, x, grid) => rootBehavior(y, x, grid));
elements.soil.behavior.push((y, x, grid) => soilBehavior(y, x, grid));
elements.rootTip.behavior.push((y, x, grid) => rootTipBehavior(y, x, grid, gridHeight));
elements.bacteria.behavior.push((y, x, grid) => bacteriaBehavior(y, x, grid));
elements.chemical.behavior.push((y, x, grid) => chemicalBehavior(y, x, grid, gridHeight, topGrid));
elements.chemInWater.behavior.push((y, x, grid) => chemInWaterBehavior(y, x, gridHeight));

// Function for adding user actions to the canvas
export function addToCanvas(element) {
    // element is dropped from the top of the canvas at a random x position
    const x = Math.floor(Math.random() * (gridWidth - 0 + 1)) + 0;
    const y = 10;

    if (element == 'water') {
        if (sunShow) {
            startRain();
        } else if (rainShow){
            clearTimeout(rainTimeout);
            startRain();
        }
    } else if (element == 'chemical') {
        let randomX = Math.floor(Math.random() * rangeX);
        generateChemical(15, randomX);
    } else if (element == 'addSunvalue') {
        if (sunValue < 10) {
            addSunvalue();
            console.log('sunvalue: ', sunValue);
        }
    } else if (element == 'reduceSunvalue') {
        if (sunValue > 0) {
            reduceSunvalue();
            console.log('sunvalue: ', sunValue);
        }
    } else if (element == 'time') {
        setTime();
        resetLifeSpan();
    }
}

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
            element = topGrid[y][x];
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
    drawSun(ctx, canvas, 7);
    drawGrass(ctx, canvas);

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
                if (grid[y][x] === 'soil') {
                    let soilColor = calculateSoilColor('#26170d', elements.soil.color, elements.soil.soilAlpha[y + "," + x]);
                    ctx.fillStyle = soilColor;
                }
                if (grid[y][x] === 'plant') {                   
                    ctx.fillStyle = elements.plant.color;                                        
                }
                /*
                if (topGrid[y][x] === 'waterInSoil') {
                    ctxTop.globalAlpha = 0.1;
                    ctxTop.fillStyle = elements.waterInSoil.color; 
                    ctxTop.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
                */

                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    ctx.globalAlpha = 1.0;
}

function drawTopGrid(){
    ctxTop.clearRect(0, 0, topCanvas.width, topCanvas.height);
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (topGrid[y][x] in elements) {
                if (topGrid[y][x] === 'waterInSoil') {
                    //console.log('waterInSoil')
                    ctxTop.globalAlpha = 0.5;
                    ctxTop.fillStyle = elements.waterInSoil.color;
                    //ctxTop.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
                else if (topGrid[y][x] === 'chemInWater') {
                    ctxTop.globalAlpha = 0.5;
                    ctxTop.fillStyle = elements.chemInWater.color;
                }
                else {
                    //console.log('liquidSugar')
                    ctxTop.fillStyle = elements[topGrid[y][x]].color; // Set color based on element type
                    ctxTop.globalAlpha = 1.0; // Reset alpha for other elements
                }
                

                ctxTop.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }

    ctxTop.globalAlpha = 1.0;
}


canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);

    // Add 'aggregate' to the grid at the clicked location

    /*
    grid[y][x] = 'aggregate';
    let aggInstance = new Aggregate(y, x, null, null);
    elements.aggregate.aggregateElements[y + "," + x] = aggInstance;
    */
    //testing(y, x)
    topCanvas[y][x] = 'chemical';

    //add liquidSugar
    //grid[y][x] = 'liquidSugar';
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
    drawTopGrid();
    sunlight();
    requestAnimationFrame(loop);

    if(envTimeCounter % 260 == 0){
        //console.log(sunValue);
        getNextsunValue();
    }
    


    generateRain(grid, gridWidth);

    //changeBackgroundToGreyGradient();

    // Call the function to start the effect

    //testing()

    timeStep++;
    timeMove++;
    timeWaterSink++;
    envTimeCounter++;

    updatePlantGrowth();

    elements.bacteria.bacteriaElements.forEach((bacteria, index) => {
        bacteria.decreaseLifespan();
        if (bacteria.lifespan <= 0) {
            // Bacteria dies out
            bacteria.fade(ctx, elements, cellSize, grid, index);
        }
    });

    elements.bacteria.bacteriaElements.forEach((bacteria, index) => {
        if (grid[bacteria.y][bacteria.x] != "bacteria") {
            elements.bacteria.bacteriaElements.splice(index, 1);
        }
        //console.log(elements.bacteria.bacteriaElements);

    });

    elements.waterInSoil.waterElements.forEach((water, index) => {
        if (topGrid[water.y][water.x] != "waterInSoil") {
            elements.waterInSoil.waterElements.splice(index, 1);
        }
        //(console.log(elements.waterInSoil.waterElements));
    });
}

window.addEventListener('load', function () {
    // Logic to draw sand on the canvas automatically
    // This is a placeholder; the actual logic will depend on the structure of the JS code.
    //generateChemical(0, 200);

    //topGrid[0][0] = "chemical";
    loop();

    drawAutomatically();
    //generateSoil();
    generateBacterial();
    initSoilGradient();
    /*
    topGrid[0][70] = 'chemical';
    topGrid[1][70] = 'chemical';
    topGrid[2][70] = 'chemical';
    topGrid[3][70] = 'chemical';
    topGrid[4][70] = 'chemical';
    */
    

    connectToDB();
});

function drawAutomatically() {
    // Logic to preload elements onto the grid
    generateChemical(globalY + 20, 30);
    generateChemical(globalY + 20, 60);
    generateChemical(globalY + 20, 90);


    // fill background up with soil
    let currY = globalY;


    for (let i = currY; i < 150; i++) {
        for (let j = 0; j < 200; j++) {
            grid[i][j] = 'soil';
            elements.soil.soilAlpha[i + "," + j] = 1;
            elements.soil.initAlpha[i + "," + j] = 1;
        }

    }


    // Grow some roots and fungi

    // Generate randomX in a range
    let randomX = Math.round(Math.random() * (35 - 20) + 20);

    // 80 25
    // Create 2 fungi objects to encourage growing out wide
    // Growing left
    let fungiObj = new Fungi(currY + 1, randomX - 1, false, totalFungiIndex++);
    fungiObj.expandXDir = -1;
    grid[currY + 1][randomX - 1] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);

    grid[currY + 1][randomX] = 'fungi';

    // Create root object
    let rootObj = new RootTip(currY, randomX, fungiObj, totalRootIndex++);
    grid[currY][randomX] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;

    plantAt(currY-1, randomX, fungiObj);

    // 2nd fungi object with opposite grow direction, growing right
    fungiObj = new Fungi(currY + 1, randomX + 1, false, totalFungiIndex++);
    fungiObj.expandXDir = 1;
    grid[currY + 1][randomX + 1] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);
    fungiObj.parentRoot = rootObj;

    let boundaryX = randomX;

    // RandomX for next elements
    randomX = Math.round(Math.random() * (90 - 60) + 60);
    // Set boundary to fungi growing towards the next fungi for cellular automata
    fungiObj.calculateBoundary(boundaryX, randomX);

    // 80 75
    // Middle fungi can grow to the left fungi object
    fungiObj = new Fungi(currY + 1, randomX - 1, false, totalFungiIndex++);
    fungiObj.expandXDir = -1;
    grid[currY+1][randomX - 1 ] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);

    // Calculate boundary with previous fungi
    fungiObj.calculateBoundary(boundaryX, randomX);
    // Update it with current middle fungi X
    boundaryX = randomX;

    grid[currY + 1][randomX] = 'fungi';

    rootObj = new RootTip(currY, randomX, fungiObj, totalRootIndex++);
    grid[currY][randomX] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;

    plantAt(currY - 1, randomX, fungiObj);

    fungiObj = new Fungi(currY + 1, randomX + 1, false, totalFungiIndex++);
    fungiObj.expandXDir = 1;
    grid[currY + 1][randomX + 1] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);
    fungiObj.parentRoot = rootObj;


    randomX = Math.round(Math.random() * (160 - 120) + 120);
    // Calculate boundary with next fungi
    fungiObj.calculateBoundary(boundaryX, randomX);

    // 81 140
    fungiObj = new Fungi(currY + 1, randomX - 1, false, totalFungiIndex++);
    fungiObj.expandXDir = -1;
    grid[currY + 1][randomX - 1] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);
    // Calculate boundary with previous fungi
    fungiObj.calculateBoundary(boundaryX, randomX);


    grid[currY + 1][randomX] = 'fungi';

    rootObj = new RootTip(currY, randomX, fungiObj, totalRootIndex++);
    grid[currY][randomX] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;

    plantAt(currY-1, randomX, fungiObj);

    fungiObj = new Fungi(currY + 1, randomX + 1, false, totalFungiIndex++);
    fungiObj.expandXDir = 1;
    grid[currY + 1][randomX + 1] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);
    fungiObj.parentRoot = rootObj;

    // Call any other functions required to render the grid on the canvas.
}


document.addEventListener("fullscreenchange", handleFullScreenChange);
document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
window.addEventListener("resize", handleFullScreenChange);

function handleFullScreenChange() {
    const sandCanvas = document.getElementById('sandCanvas');
    const topCanvas = document.getElementById('topCanvas');
    
    sandCanvas.width = window.innerWidth;
    sandCanvas.height = window.innerHeight;

    topCanvas.width = window.innerWidth;
    topCanvas.height = window.innerHeight;
    

    const gradientLayer1 = document.querySelector('.gradient-layer1');
    const gradientLayer2 = document.querySelector('.gradient-layer2');
    const layerNight = document.querySelector('.layer-night');
    const layerNightMultiply = document.querySelector('.layer-night-multiply');

    // Set the dimensions to cover the entire viewport
    gradientLayer1.style.width = `${window.innerWidth}px`;
    gradientLayer1.style.height = `${window.innerHeight}px`;

    gradientLayer2.style.width = `${window.innerWidth}px`;
    gradientLayer2.style.height = `${window.innerHeight}px`;

    layerNight.style.width = `${window.innerWidth}px`;
    layerNight.style.height = `${window.innerHeight}px`;

    layerNightMultiply.style.width = `${window.innerWidth}px`;
    layerNightMultiply.style.height = `${window.innerHeight}px`;


    cellSize = Math.ceil(4 * (canvas.height / 600));
    if(canvas.width > canvas.height && canvas.width/canvas.height >1.33){
        cellSize = Math.ceil(4 * (canvas.width / 800));
    }

    let isFullScreen = (document.fullscreenElement != null || document.webkitFullscreenElement != null);
    if (isFullScreen) {
    
        document.body.style.cursor = 'none';
    } else {
        document.body.style.cursor = 'auto';
    }
}



