import RootStructure from './root/root.js';
import Fungi from './fungi/fungi.js';
import { plantAt, updatePlantGrowth } from './plant/plant_behavior.js';
//import {calculateSoilColor} from './aggregate_behavior.js';
import { updateSoilcolor, updateSoilAlpha, updateInitialAlpha, initSoilGradient, calculateSoilColor } from './aggregate/aggregate_behavior.js';
import { chemicalBehavior } from './chemical.js';
import { waterBehavior } from './water_behavior.js';
import { waterInSoilBehavior } from './waterInSoil.js'
import { soilBehavior } from './soil_behavior.js';
import { rootBehavior } from './root/root_behavior.js';
import { rootTipBehavior } from './root/roottip_behavior.js';
import { sunShow, drawSun, rainTimeout, generateRain, rainShow, changeRainShow, changeSunShow, sunlight, getNextsunValue, sunValue } from './weather.js';
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

export default class RootTip extends RootStructure {
    constructor(startingY, startingX, fungiParent, index) {
        super(startingY, startingX, 10, 500, 'rootTip', 900, index);
        this.parentFungi = new Array();
        this.parentFungi.push(fungiParent);
        this.spacing = 3;
        //console.log(this.parentFungi);
    }

    // Function to produce 1 block of liquid sugar from root tip
    produceSugar() {
        if (grid[this.y][this.x] == 'rootTip') {

            // If the block below is soil or fungi, produce liquid sugar
            /*
            if (grid[this.y + 1][this.x] === 'soil' || grid[this.y + 1][this.x] === 'fungi') {
                grid[this.y + 1][this.x] = 'liquidSugar';
            }
            */
            if (grid[this.y + 1][this.x] === 'soil' || grid[this.y + 1][this.x] === 'fungi') {
                //grid[this.y + 1][this.x] = 'liquidSugar';
                topGrid[this.y + 1][this.x] = 'liquidSugar';
            }
        }
    }

    // Function to check if liquid sugar has been eaten. If yes, allows root to grow larger
    sugarEaten() {

        if (this.developed == true && grid[this.y + 1][this.x] == 'bacteria') {
            // Increase max length of rootTip
            this.developed = false;
            this.maxGrowthLength += 2;
            for (let i = 0; i < this.parentFungi.length; i++) {
                this.parentFungi[i].expandRoot(elements.fungi.fungiElements, fungiIndex, totalFungiIndex);
            }
            // this.growthSpeed = Math.round(this.growthSpeed * (2 / 3));
            //console.log("SUGAR EATEN, INCREASING LENGTH FOR ROOT: ", this.index);
        }
    }
}


export function incrementTotalFungiIndex(incrementedIndex) {
    totalFungiIndex = incrementedIndex;
}

export function decrementTotalFungiIndex(decrementedIndex) {
    totalFungiIndex = decrementedIndex;
}

export function changeChosenDirection(newDirection) {
    chosenDirection = newDirection;
}

export function IncementFungiIndex(newIndex) {
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

export function IncementRootIndex(newIndex) {
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
        color: "#00FF00",
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
        color: "#446B32",
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

// Function for adding user actions to the canvas
export function addToCanvas(element) {
    // element is dropped from the top of the canvas at a random x position
    const x = Math.floor(Math.random() * (gridWidth - 0 + 1)) + 0;
    const y = 10;

    if (element == 'water') {
        if (sunShow) {
            changeRainShow(true);
            changeSunShow(false);

            setTimeout(() => {
                changeRainShow(false);
            }, 10 * 1000);

            setTimeout(() => {
                changeSunShow(true);
            }, 12 * 1000);

        } else if (rainShow){
            clearTimeout(rainTimeout);

            rainTimeout = setTimeout(() => {
                changeRainShow(false);
            }, 10 * 1000);

            setTimeout(() => {
                changeSunShow(true);
            }, 12 * 1000);
        }
    } else if (element == 'chemical') {
        grid[0][x] = 'chemical';

    } else if (element == 'sunlight') {
        changeRainShow(false);
        setTimeout(() => {
            changeSunShow(true);
        }, 1 * 1000);
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
                    const plantObj = elements.plant.plantElements.find(plant => plant.startingY === y && plant.startingX === x);
                    if (plantObj) {
                        ctx.fillStyle = elements.plant.color;
                        for(let h = 0; h < plantObj.height; h++) {
                            const factor = (plantObj.height - h) / plantObj.height;
                            const currentWidth = 1 + factor * (plantObj.height / 10); 
                            ctx.fillRect((x - currentWidth/2) * cellSize, (y - h) * cellSize, currentWidth * cellSize, cellSize);
                        }
                    }
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
                    ctxTop.globalAlpha = 0.2;
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
    testing(y, x)

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
        console.log(sunValue);
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
    loop();

    drawAutomatically();
    //generateSoil();
    generateBacterial();
    initSoilGradient();

    connectToDB();
});

function drawAutomatically() {
    // Logic to preload elements onto the grid

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

    let randomX = Math.round(Math.random() * (35 - 20) + 20);

    // 80 25
    let fungiObj = new Fungi(currY+1, randomX, false, totalFungiIndex++);
    grid[currY+1][randomX] = 'fungi';
    elements.fungi.fungiElements.push(fungiObj);
    let rootObj = new RootTip(currY, randomX, fungiObj, totalRootIndex++);
    grid[currY][randomX] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;

    plantAt(currY-1, randomX, fungiObj);

    randomX = Math.round(Math.random() * (90 - 60) + 60);

    // 80 75
    grid[currY+1][randomX] = 'fungi';
    fungiObj = new Fungi(currY+1, randomX, false, totalFungiIndex++);
    elements.fungi.fungiElements.push(fungiObj);
    rootObj = new RootTip(currY, randomX, fungiObj, totalRootIndex++);
    grid[currY][randomX] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;

    plantAt(currY-1, randomX, fungiObj);

    randomX = Math.round(Math.random() * (160 - 120) + 120);

    // 81 140
    grid[currY+1][randomX] = 'fungi';
    fungiObj = new Fungi(currY+1, randomX, false, totalFungiIndex++)
    elements.fungi.fungiElements.push(fungiObj);
    rootObj = new RootTip(currY, randomX, fungiObj, totalRootIndex++);
    grid[currY][randomX] = 'rootTip';
    elements.rootTip.rootElements.push(rootObj);
    fungiObj.parentRoot = rootObj;

    plantAt(currY-1, randomX, fungiObj);

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

    // Set the dimensions to cover the entire viewport
    gradientLayer1.style.width = `${window.innerWidth}px`;
    gradientLayer1.style.height = `${window.innerHeight}px`;

    gradientLayer2.style.width = `${window.innerWidth}px`;
    gradientLayer2.style.height = `${window.innerHeight}px`;


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



